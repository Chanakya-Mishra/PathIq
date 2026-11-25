import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { RESOURCES } from '../public/data/resources.js';
import { filterResources } from '../public/js/resourceFilter.js';
import { SUPPORTED_LANGS } from '../public/data/locales.js';

const SHARE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const VALID_STAGES = ['school', 'college', 'graduate', 'switcher'];

function generateShareCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += SHARE_ALPHABET[bytes[i] % SHARE_ALPHABET.length];
  }
  return out;
}

function normalizeResourceRow(row) {
  return {
    id: row.id,
    domain: row.domain,
    format: row.format,
    languages: Array.isArray(row.languages) ? row.languages : [],
    dataUsage: row.data_usage ?? row.dataUsage ?? 'low',
    isFree: row.is_free ?? row.isFree ?? true,
    url: row.url,
    title: row.title,
    why: row.why
  };
}

/**
 * Create a Supabase repository with automatic in-memory fallback
 * when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured.
 * @param {{ client?: any, fallbackResources?: typeof RESOURCES }} [opts]
 */
export function createSupabaseRepo({ client = null, fallbackResources = RESOURCES } = {}) {
  let supabase = client;
  if (!supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }

  // In-memory fallbacks for local offline mode & unit tests
  const memDoubtCache = new Map();
  const memSharedPlans = new Map();
  const memFeedback = [];
  const memReports = [];

  function isSupabaseEnabled() {
    return Boolean(supabase);
  }

  async function listResources(filters = {}, uiLang = 'en') {
    if (supabase) {
      let query = supabase
        .from('resources')
        .select('id, domain, format, languages, data_usage, is_free, url, title, why')
        .eq('is_active', true)
        .eq('is_free', true);

      if (filters.domain && filters.domain !== 'all') query = query.eq('domain', filters.domain);
      if (filters.format && filters.format !== 'all') query = query.eq('format', filters.format);
      if (filters.dataUsage && filters.dataUsage !== 'all') query = query.eq('data_usage', filters.dataUsage);
      if (filters.language && filters.language !== 'all') {
        query = query.contains('languages', [filters.language]);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const mapped = data.map(normalizeResourceRow);
        const searched = filters.search
          ? filterResources(mapped, { search: filters.search }, uiLang)
          : mapped;
        return { resources: searched, source: 'supabase' };
      }
    }

    return {
      resources: filterResources(fallbackResources, filters, uiLang),
      source: 'local-fallback'
    };
  }

  async function getCachedDoubt({ queryHash, lang, stage, liteMode }) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const safeStage = VALID_STAGES.includes(stage) ? stage : 'college';
    const safeLite = Boolean(liteMode);

    if (supabase) {
      const { data, error } = await supabase
        .from('doubt_cache')
        .select('id, model_used, answer_json, hit_count')
        .eq('query_hash', queryHash)
        .eq('lang', safeLang)
        .eq('stage', safeStage)
        .eq('lite_mode', safeLite)
        .maybeSingle();

      if (!error && data) {
        await supabase
          .from('doubt_cache')
          .update({ hit_count: (data.hit_count || 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        return {
          modelUsed: data.model_used,
          answer: data.answer_json,
          source: 'supabase-cache'
        };
      }
      return null;
    }

    const memKey = `${queryHash}::${safeLang}::${safeStage}::${safeLite}`;
    const hit = memDoubtCache.get(memKey);
    if (!hit) return null;
    hit.hitCount += 1;
    return {
      modelUsed: hit.modelUsed,
      answer: hit.answerJson,
      source: 'memory-cache'
    };
  }

  async function saveCachedDoubt({
    queryHash,
    normalizedQuery,
    lang,
    stage,
    liteMode,
    modelUsed,
    answerJson
  }) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const safeStage = VALID_STAGES.includes(stage) ? stage : 'college';
    const safeLite = Boolean(liteMode);

    if (supabase) {
      await supabase.from('doubt_cache').upsert(
        {
          query_hash: queryHash,
          normalized_query: String(normalizedQuery).slice(0, 400),
          lang: safeLang,
          stage: safeStage,
          lite_mode: safeLite,
          model_used: modelUsed,
          answer_json: answerJson,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'query_hash,lang,stage,lite_mode' }
      );
      return;
    }

    const memKey = `${queryHash}::${safeLang}::${safeStage}::${safeLite}`;
    if (memDoubtCache.size >= 500) {
      const oldestKey = memDoubtCache.keys().next().value;
      memDoubtCache.delete(oldestKey);
    }
    memDoubtCache.set(memKey, {
      modelUsed,
      answerJson,
      hitCount: 1
    });
  }

  async function createSharedPlan({ lang = 'en', savedResourceIds = [], completedSteps = {} }) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const validIds = new Set(fallbackResources.map((r) => r.id));
    const cleanIds = Array.isArray(savedResourceIds)
      ? [...new Set(savedResourceIds.filter((id) => typeof id === 'string' && validIds.has(id)))].slice(0, 50)
      : [];

    const cleanSteps = {};
    if (completedSteps && typeof completedSteps === 'object' && !Array.isArray(completedSteps)) {
      for (const [k, v] of Object.entries(completedSteps).slice(0, 100)) {
        if (v === true && /^[a-z0-9-]+::[a-z0-9-]+$/i.test(k)) {
          cleanSteps[k] = true;
        }
      }
    }

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateShareCode(6);
      if (supabase) {
        const { error } = await supabase.from('shared_plans').insert({
          code,
          lang: safeLang,
          saved_resource_ids: cleanIds,
          completed_steps: cleanSteps,
          expires_at: expiresAt
        });
        if (!error) {
          return { code, expiresAt, source: 'supabase' };
        }
        if (error.code !== '23505') {
          throw new Error(`Supabase createSharedPlan failed: ${error.message}`);
        }
      } else if (!memSharedPlans.has(code)) {
        memSharedPlans.set(code, {
          code,
          lang: safeLang,
          savedResourceIds: cleanIds,
          completedSteps: cleanSteps,
          expiresAt
        });
        return { code, expiresAt, source: 'local-fallback' };
      }
    }

    throw new Error('Failed to allocate unique share code');
  }

  async function getSharedPlan(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{6,12}$/.test(code)) return null;

    if (supabase) {
      const { data, error } = await supabase
        .from('shared_plans')
        .select('code, lang, saved_resource_ids, completed_steps, expires_at')
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error || !data) return null;
      return {
        code: data.code,
        lang: data.lang,
        savedResourceIds: data.saved_resource_ids || [],
        completedSteps: data.completed_steps || {},
        expiresAt: data.expires_at,
        source: 'supabase'
      };
    }

    const hit = memSharedPlans.get(code);
    if (!hit) return null;
    if (Date.parse(hit.expiresAt) <= Date.now()) {
      memSharedPlans.delete(code);
      return null;
    }
    return { ...hit, source: 'local-fallback' };
  }

  async function recordDoubtFeedback({ queryHash, helpful, lang = 'en' }) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const cleanHash = String(queryHash || '').slice(0, 64);
    if (!cleanHash || typeof helpful !== 'boolean') {
      throw new Error('INVALID_FEEDBACK');
    }

    if (supabase) {
      const { error } = await supabase.from('doubt_feedback').insert({
        query_hash: cleanHash,
        helpful,
        lang: safeLang
      });
      if (error) throw new Error(error.message);
      return { ok: true, source: 'supabase' };
    }

    memFeedback.push({ queryHash: cleanHash, helpful, lang: safeLang, createdAt: Date.now() });
    return { ok: true, source: 'local-fallback' };
  }

  async function reportResource({ resourceId, reason, lang = 'en' }) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const cleanId = String(resourceId || '').trim();
    const cleanReason = String(reason || '').trim().slice(0, 300);
    const validIds = new Set(fallbackResources.map((r) => r.id));

    if (!validIds.has(cleanId) || cleanReason.length < 3) {
      throw new Error('INVALID_REPORT');
    }

    if (supabase) {
      const { error } = await supabase.from('resource_reports').insert({
        resource_id: cleanId,
        reason: cleanReason,
        lang: safeLang
      });
      if (error) throw new Error(error.message);
      return { ok: true, source: 'supabase' };
    }

    memReports.push({ resourceId: cleanId, reason: cleanReason, lang: safeLang, createdAt: Date.now() });
    return { ok: true, source: 'local-fallback' };
  }

  return {
    isSupabaseEnabled,
    listResources,
    getCachedDoubt,
    saveCachedDoubt,
    createSharedPlan,
    getSharedPlan,
    recordDoubtFeedback,
    reportResource
  };
}
