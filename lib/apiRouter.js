import { getGuidanceResponse } from './guidanceEngine.js';
import { createSupabaseRepo } from './supabaseRepo.js';
import { createDoubtSolver, MODEL_ACCURATE, MODEL_FAST_SMALL } from './doubtSolver.js';

const MAX_JSON_BYTES = 16 * 1024;

let defaultDeps = null;

/**
 * Lazily initialize shared repository and doubt solver instances for warm serverless reuse.
 */
export function getDefaultDeps() {
  if (!defaultDeps) {
    const repo = createSupabaseRepo();
    const doubtSolver = createDoubtSolver({ repo });
    defaultDeps = { repo, doubtSolver };
  }
  return defaultDeps;
}

export function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

async function parseJsonRequest(request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_JSON_BYTES) {
    const err = new Error('PAYLOAD_TOO_LARGE');
    err.statusCode = 413;
    throw err;
  }
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    const err = new Error('INVALID_JSON');
    err.statusCode = 400;
    throw err;
  }
}

function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'local';
}

export async function handleHealth(deps = getDefaultDeps()) {
  return jsonResponse({
    ok: true,
    service: 'pathiq',
    mode: process.env.GEMINI_API_KEY ? 'hybrid-ai' : 'local-deterministic',
    db: deps.repo.isSupabaseEnabled() ? 'supabase' : 'local-fallback',
    doubtModels: {
      fast: MODEL_FAST_SMALL,
      accurate: MODEL_ACCURATE
    }
  });
}

export async function handleListResources(request, deps = getDefaultDeps()) {
  const url = new URL(request.url, 'http://127.0.0.1');
  const filters = {
    domain: url.searchParams.get('domain') || 'all',
    format: url.searchParams.get('format') || 'all',
    language: url.searchParams.get('language') || 'all',
    dataUsage: url.searchParams.get('dataUsage') || 'all',
    search: url.searchParams.get('search') || ''
  };
  const lang = url.searchParams.get('lang') || 'en';
  const result = await deps.repo.listResources(filters, lang);
  return jsonResponse(result, 200);
}

export async function handleGuidance(request) {
  let body;
  try {
    body = await parseJsonRequest(request);
  } catch (err) {
    return jsonResponse(
      { error: err.statusCode === 413 ? 'Payload too large' : 'Invalid JSON body' },
      err.statusCode || 400
    );
  }
  const guidance = await getGuidanceResponse(body);
  return jsonResponse(guidance, 200);
}

export async function handleDoubt(request, deps = getDefaultDeps()) {
  let body;
  try {
    body = await parseJsonRequest(request);
  } catch (err) {
    return jsonResponse(
      { error: err.statusCode === 413 ? 'Payload too large' : 'Invalid JSON body' },
      err.statusCode || 400
    );
  }

  try {
    const solved = await deps.doubtSolver.solveDoubt({
      ...body,
      clientIp: getClientIp(request)
    });
    return jsonResponse(solved, 200);
  } catch (err) {
    if (err.statusCode === 429) {
      return jsonResponse(
        { error: 'Too many doubt requests. Please wait a minute.' },
        429,
        { 'Retry-After': String(err.retryAfterSec || 60) }
      );
    }
    if (err.statusCode === 400) {
      return jsonResponse({ error: 'Please enter a valid doubt (1-800 characters).' }, 400);
    }
    console.error('Doubt solver error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function handleCreatePlan(request, deps = getDefaultDeps()) {
  let body;
  try {
    body = await parseJsonRequest(request);
  } catch (err) {
    return jsonResponse(
      { error: err.statusCode === 413 ? 'Payload too large' : 'Invalid JSON body' },
      err.statusCode || 400
    );
  }

  try {
    const created = await deps.repo.createSharedPlan(body);
    return jsonResponse({ ...created, sharePath: `/p/${created.code}` }, 201);
  } catch (err) {
    console.error('Create plan error:', err);
    return jsonResponse({ error: 'Failed to create shared plan' }, 500);
  }
}

export async function handleGetPlan(request, deps = getDefaultDeps()) {
  const url = new URL(request.url, 'http://127.0.0.1');
  const match = url.pathname.match(/^\/api\/plans\/([A-Za-z0-9]{6,12})\/?$/);
  const code = match ? match[1] : '';
  const plan = await deps.repo.getSharedPlan(code);
  if (!plan) {
    return jsonResponse({ error: 'Shared plan not found or expired' }, 404);
  }
  return jsonResponse(plan, 200);
}

export async function handleFeedback(request, deps = getDefaultDeps()) {
  let body;
  try {
    body = await parseJsonRequest(request);
  } catch (err) {
    return jsonResponse(
      { error: err.statusCode === 413 ? 'Payload too large' : 'Invalid JSON body' },
      err.statusCode || 400
    );
  }

  try {
    const saved = await deps.repo.recordDoubtFeedback(body);
    return jsonResponse(saved, 201);
  } catch {
    return jsonResponse({ error: 'Invalid feedback payload' }, 400);
  }
}

export async function handleReport(request, deps = getDefaultDeps()) {
  let body;
  try {
    body = await parseJsonRequest(request);
  } catch (err) {
    return jsonResponse(
      { error: err.statusCode === 413 ? 'Payload too large' : 'Invalid JSON body' },
      err.statusCode || 400
    );
  }

  try {
    const saved = await deps.repo.reportResource(body);
    return jsonResponse(saved, 201);
  } catch {
    return jsonResponse({ error: 'Invalid resource report payload' }, 400);
  }
}

/**
 * Unified Web API dispatcher used by localServer.js and tests.
 */
export async function handleApiRequest(request, deps = getDefaultDeps()) {
  const method = request.method.toUpperCase();
  const { pathname } = new URL(request.url, 'http://127.0.0.1');

  try {
    if (pathname === '/api/health') {
      return method === 'GET'
        ? handleHealth(deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/resources') {
      return method === 'GET'
        ? handleListResources(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/guidance') {
      return method === 'POST'
        ? handleGuidance(request)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/doubt') {
      return method === 'POST'
        ? handleDoubt(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/plans') {
      return method === 'POST'
        ? handleCreatePlan(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (/^\/api\/plans\/[A-Za-z0-9]{6,12}\/?$/.test(pathname)) {
      return method === 'GET'
        ? handleGetPlan(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/feedback') {
      return method === 'POST'
        ? handleFeedback(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    if (pathname === '/api/report') {
      return method === 'POST'
        ? handleReport(request, deps)
        : jsonResponse({ error: 'Method not allowed' }, 405);
    }
    return jsonResponse({ error: 'Not found' }, 404);
  } catch (err) {
    console.error('API router error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
