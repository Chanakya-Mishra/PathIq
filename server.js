import http from 'node:http';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getGuidanceResponse } from './lib/guidanceEngine.js';
import { createSupabaseRepo } from './lib/supabaseRepo.js';
import { createDoubtSolver, MODEL_ACCURATE, MODEL_FAST_SMALL } from './lib/doubtSolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, 'public');

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
export function loadLocalEnv(envPath = path.resolve(__dirname, '.env')) {
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

/**
 * Resolve a request URL pathname safely inside PUBLIC_DIR.
 * Supports /p/<code> share links resolving cleanly to index.html.
 * @param {string} urlPath
 * @returns {string | null}
 */
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

/**
 * Send JSON response with optional gzip compression.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {unknown} payload
 */
export function sendJson(req, res, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  const acceptsGzip = String(req.headers['accept-encoding'] || '').includes('gzip');

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (acceptsGzip && body.length >= 256) {
    const gz = zlib.gzipSync(body, { level: 6 });
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Length', String(gz.length));
    res.end(gz);
    return;
  }

  res.setHeader('Content-Length', String(body.length));
  res.end(body);
}

/**
 * Read and parse JSON request body safely with a size cap.
 * @param {http.IncomingMessage} req
 * @param {number} maxBytes
 * @returns {Promise<Record<string, unknown>>}
 */
export async function readJsonBody(req, maxBytes = 16 * 1024) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    throw new Error('INVALID_JSON');
  }
}

async function handleJsonBody(req, res) {
  try {
    return await readJsonBody(req);
  } catch (err) {
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      sendJson(req, res, 413, { error: 'Payload too large' });
      return null;
    }
    sendJson(req, res, 400, { error: 'Invalid JSON body' });
    return null;
  }
}

/**
 * Serve static asset from public/ with gzip + ETag caching.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function serveStatic(req, res) {
  const filePath = resolveSafePublicPath(req.url || '/');
  if (!filePath) {
    sendJson(req, res, 403, { error: 'Forbidden' });
    return;
  }

  let targetPath = filePath;
  let stat;
  try {
    stat = await fs.stat(targetPath);
    if (stat.isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
      stat = await fs.stat(targetPath);
    }
  } catch {
    sendJson(req, res, 404, { error: 'Not found' });
    return;
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const raw = await fs.readFile(targetPath);
  const etag = `"${crypto.createHash('sha1').update(raw).digest('base64url')}"`;

  res.setHeader('ETag', etag);
  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=300');

  if (req.headers['if-none-match'] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }

  const acceptsGzip = String(req.headers['accept-encoding'] || '').includes('gzip');
  if (acceptsGzip && COMPRESSIBLE_EXTS.has(ext) && raw.length >= 256) {
    const gz = zlib.gzipSync(raw, { level: 6 });
    res.statusCode = 200;
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Length', String(gz.length));
    res.end(req.method === 'HEAD' ? undefined : gz);
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Length', String(raw.length));
  res.end(req.method === 'HEAD' ? undefined : raw);
}

/**
 * Create the PathIQ HTTP server instance.
 * @param {{ repo?: ReturnType<typeof createSupabaseRepo>, doubtSolver?: ReturnType<typeof createDoubtSolver> }} [options]
 * @returns {http.Server}
 */
export function createAppServer(options = {}) {
  const repo = options.repo || createSupabaseRepo();
  const doubtSolver = options.doubtSolver || createDoubtSolver({ repo });

  return http.createServer(async (req, res) => {
    const method = req.method || 'GET';
    const parsedUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const urlPath = parsedUrl.pathname;

    try {
      if (method === 'GET' && urlPath === '/api/health') {
        sendJson(req, res, 200, {
          ok: true,
          service: 'pathiq',
          mode: process.env.GEMINI_API_KEY ? 'hybrid-ai' : 'local-deterministic',
          db: repo.isSupabaseEnabled() ? 'supabase' : 'local-fallback',
          doubtModels: {
            fast: MODEL_FAST_SMALL,
            accurate: MODEL_ACCURATE
          }
        });
        return;
      }

      if (method === 'GET' && urlPath === '/api/resources') {
        const filters = {
          domain: parsedUrl.searchParams.get('domain') || 'all',
          format: parsedUrl.searchParams.get('format') || 'all',
          language: parsedUrl.searchParams.get('language') || 'all',
          dataUsage: parsedUrl.searchParams.get('dataUsage') || 'all',
          search: parsedUrl.searchParams.get('search') || ''
        };
        const lang = parsedUrl.searchParams.get('lang') || 'en';
        const result = await repo.listResources(filters, lang);
        sendJson(req, res, 200, result);
        return;
      }

      if (method === 'POST' && urlPath === '/api/guidance') {
        const body = await handleJsonBody(req, res);
        if (!body) return;
        const guidance = await getGuidanceResponse(body);
        sendJson(req, res, 200, guidance);
        return;
      }

      if (method === 'POST' && urlPath === '/api/doubt') {
        const body = await handleJsonBody(req, res);
        if (!body) return;
        const clientIp =
          String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
          req.socket?.remoteAddress ||
          'local';
        try {
          const solved = await doubtSolver.solveDoubt({ ...body, clientIp });
          sendJson(req, res, 200, solved);
        } catch (err) {
          if (err.statusCode === 429) {
            res.setHeader('Retry-After', String(err.retryAfterSec || 60));
            sendJson(req, res, 429, { error: 'Too many doubt requests. Please wait a minute.' });
            return;
          }
          if (err.statusCode === 400) {
            sendJson(req, res, 400, { error: 'Please enter a valid doubt (1-800 characters).' });
            return;
          }
          throw err;
        }
        return;
      }

      if (method === 'POST' && urlPath === '/api/plans') {
        const body = await handleJsonBody(req, res);
        if (!body) return;
        const created = await repo.createSharedPlan(body);
        sendJson(req, res, 201, {
          ...created,
          sharePath: `/p/${created.code}`
        });
        return;
      }

      const planMatch = method === 'GET' && urlPath.match(/^\/api\/plans\/([A-Za-z0-9]{6,12})$/);
      if (planMatch) {
        const plan = await repo.getSharedPlan(planMatch[1]);
        if (!plan) {
          sendJson(req, res, 404, { error: 'Shared plan not found or expired' });
          return;
        }
        sendJson(req, res, 200, plan);
        return;
      }

      if (method === 'POST' && urlPath === '/api/feedback') {
        const body = await handleJsonBody(req, res);
        if (!body) return;
        try {
          const saved = await repo.recordDoubtFeedback(body);
          sendJson(req, res, 201, saved);
        } catch {
          sendJson(req, res, 400, { error: 'Invalid feedback payload' });
        }
        return;
      }

      if (method === 'POST' && urlPath === '/api/report') {
        const body = await handleJsonBody(req, res);
        if (!body) return;
        try {
          const saved = await repo.reportResource(body);
          sendJson(req, res, 201, saved);
        } catch {
          sendJson(req, res, 400, { error: 'Invalid resource report payload' });
        }
        return;
      }

      if (method === 'GET' || method === 'HEAD') {
        await serveStatic(req, res);
        return;
      }

      sendJson(req, res, 405, { error: 'Method not allowed' });
    } catch (err) {
      console.error('Server error:', err);
      if (!res.headersSent) {
        sendJson(req, res, 500, { error: 'Internal server error' });
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
