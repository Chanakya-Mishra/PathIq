import { buildStructuredGuidance } from './guidanceCore.js';
import { RESOURCES } from '../data/resources.js';

export function buildOfflineGuidance(params = {}) {
  return {
    ...buildStructuredGuidance(params),
    source: 'offline'
  };
}

/**
 * Build deterministic cache key for guidance queries.
 */
export function makeGuidanceCacheKey({ query = '', pathId = null, lang = 'en', stage = 'college', weeklyHours = '10' }) {
  const target = pathId ? `id:${pathId}` : `q:${String(query).trim().toLowerCase()}`;
  return `${lang}::${stage}::${weeklyHours}::${target}`;
}

export function makeDoubtCacheKey({ question = '', lang = 'en', stage = 'college', liteMode = false, deepCheck = false }) {
  const q = String(question).trim().toLowerCase().replace(/\s+/g, ' ');
  return `doubt::${lang}::${stage}::${Boolean(liteMode)}::${Boolean(deepCheck)}::${q}`;
}

/**
 * Fetch career guidance using local cache -> /api/guidance -> offline fallback.
 */
export async function fetchCareerGuidance(store, params) {
  const state = store.getState();
  const payload = {
    query: params.query ?? '',
    pathId: params.pathId ?? null,
    lang: params.lang ?? state.lang,
    stage: params.stage ?? state.stage,
    weeklyHours: params.weeklyHours ?? state.weeklyHours
  };

  const cacheKey = makeGuidanceCacheKey(payload);
  const cached = store.getCachedAnswer(cacheKey);
  if (cached) {
    return { answer: cached, deliverySource: 'cache' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });
    clearTimeout(timer);

    if (res.ok) {
      const answer = await res.json();
      store.setCachedAnswer(cacheKey, answer);
      return { answer, deliverySource: 'server' };
    }
  } catch {
    // Graceful fallback when running offline
  }

  const offlineAnswer = buildOfflineGuidance(payload);
  store.setCachedAnswer(cacheKey, offlineAnswer);
  return { answer: offlineAnswer, deliverySource: 'offline' };
}

/**
 * Solve a specific study/coding/exam doubt via local cache -> /api/doubt -> offline fallback.
 */
export async function solveDoubtRequest(store, params) {
  const state = store.getState();
  const payload = {
    question: String(params.question || '').trim(),
    lang: params.lang ?? state.lang,
    stage: params.stage ?? state.stage,
    liteMode: params.liteMode ?? state.liteMode,
    deepCheck: Boolean(params.deepCheck),
    previousInteractionId: params.previousInteractionId || null
  };

  const cacheKey = makeDoubtCacheKey(payload);
  if (!payload.previousInteractionId) {
    const cached = store.getCachedAnswer(cacheKey);
    if (cached) {
      return { ...cached, cached: true, source: 'local-cache' };
    }
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('/api/doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (!payload.previousInteractionId && data.source !== 'offline-fallback') {
        store.setCachedAnswer(cacheKey, data);
      }
      return data;
    }

    if (res.status === 429) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Rate limited');
    }
  } catch (err) {
    if (err.message && /rate|wait|too many/i.test(err.message)) {
      throw err;
    }
  }

  const fallbackRes = RESOURCES[0];
  return {
    queryHash: 'offline',
    interactionId: null,
    modelUsed: 'offline-fallback',
    cached: false,
    source: 'offline-fallback',
    answer: {
      directAnswer: `Offline mode: connect briefly to run Gemini doubt solving for "${payload.question.slice(0, 100)}".`,
      stepByStep: [
        'Break your question into the smallest failing line or formula.',
        `Check ${fallbackRes.title?.[payload.lang] || fallbackRes.title.en} (${fallbackRes.url}).`
      ],
      simpleExample: 'Test one minimal 3-line example before expanding.',
      commonMistake: 'Skipping small verification tests.',
      nextPracticeStep: 'Retry when back on mobile data or use Career Roadmap mode offline.',
      followUpSuggestions: []
    }
  };
}

export async function sendDoubtFeedback({ queryHash, helpful, lang }) {
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryHash, helpful, lang })
    });
    return res.ok;
  } catch {
    return false;
  }
}
