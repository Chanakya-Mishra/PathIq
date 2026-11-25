import http from 'node:http';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSupabaseRepo } from './supabaseRepo.js';
import { createDoubtSolver } from './doubtSolver.js';
import { handleApiRequest } from './apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

/**
 * Load local .env file if present without overwriting existing env vars.
 */
export function loadLocalEnv(envPath = path.resolve(ROOT_DIR, '.env')) {
  if (!fsSync.existsSync(envPath)) return;
  for (const line of fsSync.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

function resolveSafePublicPath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }

  if (/^\/p\/[A-Za-z0-9]{6,12}$/.test(decoded)) {
    return path.join(PUBLIC_DIR, 'index.html');
  }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(PUBLIC_DIR, relative);
  if (resolved !== PUBLIC_DIR && !resolved.startsWith(PUBLIC_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

function writeCompressedBuffer(req, res, statusCode, headersObj, buf, isHead = false) {
  res.statusCode = statusCode;
  for (const [k, v] of Object.entries(headersObj)) {
    res.setHeader(k, v);
  }

  const acceptsGzip = String(req.headers['accept-encoding'] || '').includes('gzip');
  if (acceptsGzip && buf.length >= 256) {
    const gz = zlib.gzipSync(buf, { level: 6 });
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Length', String(gz.length));
    res.end(isHead ? undefined : gz);
    return;
  }

  res.setHeader('Content-Length', String(buf.length));
  res.end(isHead ? undefined : buf);
}

async function serveStatic(req, res) {
  const filePath = resolveSafePublicPath(req.url || '/');
  if (!filePath) {
    writeCompressedBuffer(
      req,
      res,
      403,
      { 'Content-Type': 'application/json; charset=utf-8' },
      Buffer.from('{"error":"Forbidden"}')
    );
    return;
  }

  let targetPath = filePath;
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
      await fs.stat(targetPath);
    }
  } catch {
    writeCompressedBuffer(
      req,
      res,
      404,
      { 'Content-Type': 'application/json; charset=utf-8' },
      Buffer.from('{"error":"Not found"}')
    );
    return;
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const raw = await fs.readFile(targetPath);
  const etag = `"${crypto.createHash('sha1').update(raw).digest('base64url')}"`;

  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.setHeader('ETag', etag);
    res.end();
    return;
  }

  const headers = {
    ETag: etag,
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300'
  };

  if (COMPRESSIBLE_EXTS.has(ext)) {
    writeCompressedBuffer(req, res, 200, headers, raw, req.method === 'HEAD');
  } else {
    res.statusCode = 200;
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
    res.setHeader('Content-Length', String(raw.length));
    res.end(req.method === 'HEAD' ? undefined : raw);
  }
}

async function readNodeRequest(req, maxBytes = 32 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error('BODY_TOO_LARGE');
    }
    chunks.push(chunk);
  }
  const url = `http://127.0.0.1${req.url || '/'}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(', '));
    else if (v !== undefined) headers.set(k, String(v));
  }
  const method = (req.method || 'GET').toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks);
  return new Request(url, { method, headers, body });
}

/**
 * Create the local development/testing Node HTTP server.
 * On Vercel, static assets in public/ and Functions in api/ run natively instead.
 */
export function createAppServer(options = {}) {
  const repo = options.repo || createSupabaseRepo();
  const doubtSolver = options.doubtSolver || createDoubtSolver({ repo });

  return http.createServer(async (req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    const urlPath = (req.url || '/').split('?')[0];

    try {
      if (urlPath.startsWith('/api/')) {
        let webReq;
        try {
          webReq = await readNodeRequest(req);
        } catch {
          writeCompressedBuffer(
            req,
            res,
            413,
            { 'Content-Type': 'application/json; charset=utf-8' },
            Buffer.from('{"error":"Payload too large"}')
          );
          return;
        }
        const webRes = await handleApiRequest(webReq, { repo, doubtSolver });
        const buf = Buffer.from(await webRes.arrayBuffer());
        const outHeaders = {};
        webRes.headers.forEach((v, k) => {
          outHeaders[k] = v;
        });
        writeCompressedBuffer(req, res, webRes.status, outHeaders, buf);
        return;
      }

      if (method === 'GET' || method === 'HEAD') {
        await serveStatic(req, res);
        return;
      }

      writeCompressedBuffer(
        req,
        res,
        405,
        { 'Content-Type': 'application/json; charset=utf-8' },
        Buffer.from('{"error":"Method not allowed"}')
      );
    } catch (err) {
      console.error('Local server error:', err);
      if (!res.headersSent) {
        writeCompressedBuffer(
          req,
          res,
          500,
          { 'Content-Type': 'application/json; charset=utf-8' },
          Buffer.from('{"error":"Internal server error"}')
        );
      } else {
        res.end();
      }
    }
  });
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  loadLocalEnv();
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`PathIQ listening on http://${host}:${port}`);
  });
}
