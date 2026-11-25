import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppServer } from '../lib/localServer.js';
import { createStore } from '../public/js/store.js';
import { LOCALES, SUPPORTED_LANGS } from '../public/data/locales.js';
import { RESOURCES } from '../public/data/resources.js';
import { CAREER_PATHS } from '../public/data/careerPaths.js';
import { t } from '../public/js/i18n.js';
import { computeDataStats } from '../public/js/liteMode.js';
import { buildStructuredGuidance } from '../lib/guidanceEngine.js';
import {
  buildOfflineGuidance,
  makeDoubtCacheKey,
  makeGuidanceCacheKey
} from '../public/js/qaService.js';
import { filterResources } from '../public/js/directoryView.js';
import { formatPlanExport, parseShareCodeFromPath } from '../public/js/savedPlanView.js';
import { buildMonthCalendar, computeLearningStats } from '../public/js/dashboardView.js';
import { createSupabaseRepo } from '../lib/supabaseRepo.js';
import {
  createDoubtSolver,
  createRateLimiter,
  MODEL_ACCURATE,
  MODEL_FAST_SMALL,
  needsAccurateReasoning
} from '../lib/doubtSolver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function startTestServer() {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`
  };
}

function request(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    });
    req.on('error', reject);
  });
}

test('Phase 1 Sanity: health endpoint returns ok', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await request(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const json = JSON.parse(res.body.toString('utf8'));
    assert.equal(json.ok, true);
    assert.equal(json.service, 'pathiq');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase 1 Sanity: static HTML, CSS, JS serve cleanly with gzip and traversal protection', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const htmlRes = await request(`${baseUrl}/`, { 'Accept-Encoding': 'gzip' });
    assert.equal(htmlRes.status, 200);
    assert.equal(htmlRes.headers['content-encoding'], 'gzip');
    const htmlText = zlib.gunzipSync(htmlRes.body).toString('utf8');
    assert.match(htmlText, /<title>PathIQ/);

    const cssRes = await request(`${baseUrl}/css/styles.css`);
    assert.equal(cssRes.status, 200);
    assert.match(cssRes.headers['content-type'], /text\/css/);

    const jsRes = await request(`${baseUrl}/js/main.js`);
    assert.equal(jsRes.status, 200);
    assert.match(jsRes.headers['content-type'], /application\/javascript/);

    const traversalRes = await request(`${baseUrl}/../package.json`);
    assert.ok(traversalRes.status === 403 || traversalRes.status === 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase 1 Sanity: store persists state and caps qaCache at 20 entries', () => {
  const memory = new Map();
  const mockStorage = {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, v)
  };

  const store = createStore(mockStorage);
  store.update({ lang: 'hi', liteMode: true });
  store.toggleSavedResource('res-freecodecamp');
  store.setStepCompleted('tech-zero-cost', 'step-1', true);

  for (let i = 1; i <= 25; i++) {
    store.setCachedAnswer(`q-${i}`, { id: `a-${i}` });
  }

  const reloaded = createStore(mockStorage);
  const state = reloaded.getState();
  assert.equal(state.lang, 'hi');
  assert.equal(state.liteMode, true);
  assert.deepEqual(state.savedResourceIds, ['res-freecodecamp']);
  assert.equal(state.completedSteps['tech-zero-cost::step-1'], true);
  assert.equal(Object.keys(state.qaCache).length, 20);
  assert.equal(reloaded.getCachedAnswer('q-1'), null);
  assert.deepEqual(reloaded.getCachedAnswer('q-25'), { id: 'a-25' });
});

test('Phase 2 Sanity: locales have 100% key parity across en, hi, ta, bn and interpolation works', () => {
  assert.deepEqual(SUPPORTED_LANGS, ['en', 'hi', 'ta', 'bn']);
  const baseKeys = Object.keys(LOCALES.en).sort();

  for (const lang of SUPPORTED_LANGS) {
    const keys = Object.keys(LOCALES[lang]).sort();
    assert.deepEqual(keys, baseKeys, `Missing or extra locale keys for ${lang}`);
  }

  assert.equal(t('en', 'progressLabel', { done: 2, total: 5 }), '2 of 5 steps completed');
  assert.match(t('hi', 'resourcesCount', { count: 15 }), /15/);
});

test('Phase 2 Sanity: preloaded resources are 100% free and career paths cover all languages', () => {
  assert.ok(RESOURCES.length >= 12);
  const resourceIds = new Set(RESOURCES.map((r) => r.id));

  for (const r of RESOURCES) {
    assert.equal(r.isFree, true, `Resource ${r.id} must be free`);
    assert.ok(['tech', 'data', 'design', 'govt', 'communication'].includes(r.domain));
    assert.ok(['text', 'interactive', 'video'].includes(r.format));
    assert.ok(['low', 'moderate'].includes(r.dataUsage));
    for (const lang of SUPPORTED_LANGS) {
      assert.ok(r.title[lang] && r.title[lang].length > 0);
      assert.ok(r.why[lang] && r.why[lang].length > 0);
    }
  }

  assert.ok(CAREER_PATHS.length >= 5);
  for (const path of CAREER_PATHS) {
    for (const lang of SUPPORTED_LANGS) {
      assert.ok(path.starterQuestion[lang]);
      assert.ok(path.title[lang]);
      assert.ok(path.overview[lang]);
      assert.ok(Array.isArray(path.coreSkills[lang]) && path.coreSkills[lang].length >= 3);
      assert.ok(path.nextAction[lang]);
      for (const step of path.steps) {
        assert.ok(step.title[lang]);
        assert.ok(step.detail[lang]);
      }
    }
    for (const rid of path.resourceIds) {
      assert.ok(resourceIds.has(rid), `Path ${path.id} references unknown resource ${rid}`);
    }
  }
});

test('Phase 3 Sanity: Lite Mode telemetry computes lightweight savings and CSS stays tiny', async () => {
  const normalStats = computeDataStats({
    transferBytes: 18 * 1024,
    qaCache: { a: { id: 1 } },
    liteMode: false
  });
  assert.equal(normalStats.kb, '18.0');
  assert.ok(Number(normalStats.savedKb) >= 0);
  assert.equal(normalStats.liteMode, false);

  const liteStats = computeDataStats({
    transferBytes: 15 * 1024,
    qaCache: {},
    liteMode: true
  });
  assert.equal(liteStats.liteMode, true);
  assert.ok(liteStats.pct >= 90);

  const cssRaw = await fs.readFile(path.join(ROOT_DIR, 'public/css/styles.css'), 'utf8');
  const cssGzip = zlib.gzipSync(Buffer.from(cssRaw, 'utf8'), { level: 6 }).length;
  assert.ok(cssRaw.includes('html[data-lite="true"]'));
  assert.ok(Buffer.byteLength(cssRaw, 'utf8') < 28 * 1024, `Expected raw CSS < 28 KB, got ${cssRaw.length}`);
  assert.ok(cssGzip < 7 * 1024, `Expected gzipped CSS < 7 KB, got ${cssGzip}`);
});

test('Phase 4 Sanity: POST /api/guidance returns 5-part localized roadmap & paces weekly hours', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        query: 'How to become a Data Analyst?',
        lang: 'hi',
        stage: 'graduate',
        weeklyHours: '5'
      });
      const req = http.request(
        `${baseUrl}/api/guidance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        },
        (r) => {
          const chunks = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    assert.equal(res.status, 200);
    const json = JSON.parse(res.body);
    assert.equal(json.pathId, 'data-analyst-free');
    assert.equal(json.lang, 'hi');
    assert.equal(json.stage, 'graduate');
    assert.ok(json.estimatedWeeks >= 10);
    assert.ok(json.coreSkills.length >= 4);
    assert.ok(json.steps.length >= 3);
    assert.ok(json.resources.every((r) => r.isFree === true));
    assert.ok(json.nextAction.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase 4 Sanity: offline fallback matches server guidance and builds stable cache keys', () => {
  const serverResult = buildStructuredGuidance({
    pathId: 'after-12-budget',
    lang: 'ta',
    stage: 'school',
    weeklyHours: '20'
  });
  const offlineResult = buildOfflineGuidance({
    pathId: 'after-12-budget',
    lang: 'ta',
    stage: 'school',
    weeklyHours: '20'
  });

  assert.equal(serverResult.title, offlineResult.title);
  assert.equal(serverResult.estimatedWeeks, offlineResult.estimatedWeeks);
  assert.equal(
    makeGuidanceCacheKey({ query: ' Tech ', lang: 'en', stage: 'college', weeklyHours: '10' }),
    'en::college::10::q:tech'
  );
});

test('Phase 5 Sanity: resource directory filters accurately by domain, format, language, dataUsage, and search', () => {
  const techLow = filterResources(RESOURCES, { domain: 'tech', dataUsage: 'low' }, 'en');
  assert.ok(techLow.length >= 3);
  assert.ok(techLow.every((r) => r.domain === 'tech' && r.dataUsage === 'low'));

  const tamilInteractive = filterResources(RESOURCES, { format: 'interactive', language: 'ta' }, 'ta');
  assert.ok(tamilInteractive.length >= 1);
  assert.ok(tamilInteractive.every((r) => r.format === 'interactive' && r.languages.includes('ta')));

  const sqlSearch = filterResources(RESOURCES, { search: 'sql' }, 'en');
  assert.ok(sqlSearch.some((r) => r.id === 'res-sqlbolt'));
  assert.ok(sqlSearch.some((r) => r.id === 'res-kaggle-learn'));
});

test('Phase 6 Sanity: Saved Plan exports clean WhatsApp Plain Text and Markdown across languages', () => {
  const sampleState = {
    savedResourceIds: ['res-freecodecamp', 'res-sqlbolt'],
    completedSteps: {
      'tech-zero-cost::step-1': true
    }
  };

  const plainEn = formatPlanExport(sampleState, { format: 'text', lang: 'en' });
  assert.match(plainEn, /\*My Saved Learning Plan \(PathIQ\)\*/);
  assert.match(plainEn, /\[x\] Build core web pages/);
  assert.match(plainEn, /https:\/\/www\.freecodecamp\.org\/learn\//);

  const mdBn = formatPlanExport(sampleState, { format: 'markdown', lang: 'bn' });
  assert.match(mdBn, /^# আমার সংরক্ষিত লার্নিং প্ল্যান/m);
  assert.match(mdBn, /- \[x\] /);
  assert.match(mdBn, /\[freeCodeCamp পাঠ্যক্রম\]\(https:\/\/www\.freecodecamp\.org\/learn\/\)/);
});

test('Phase 7 Sanity: HTTP ETag 304, method validation, HTML accessibility, and low-data payload budgets', async () => {
  const coreFiles = [
    'public/index.html',
    'public/css/styles.css',
    'public/js/main.js',
    'public/js/store.js',
    'public/js/i18n.js',
    'public/js/liteMode.js',
    'public/js/dashboardView.js',
    'public/js/guidanceCore.js',
    'public/js/qaService.js',
    'public/js/qaView.js',
    'public/js/directoryView.js',
    'public/js/resourceFilter.js',
    'public/js/savedPlanView.js'
  ];
  const dataFiles = [
    'public/data/locales.js',
    'public/data/resources.js',
    'public/data/careerPaths.js'
  ];

  let coreGzip = 0;
  for (const rel of coreFiles) {
    const buf = await fs.readFile(path.join(ROOT_DIR, rel));
    coreGzip += zlib.gzipSync(buf, { level: 6 }).length;
  }

  let dataGzip = 0;
  for (const rel of dataFiles) {
    const buf = await fs.readFile(path.join(ROOT_DIR, rel));
    dataGzip += zlib.gzipSync(buf, { level: 6 }).length;
  }

  assert.ok(coreGzip < 35 * 1024, `Expected core app shell+JS+CSS gzip < 35 KB, got ${coreGzip} bytes`);
  assert.ok(coreGzip + dataGzip < 72 * 1024, `Expected total 4-language bundle gzip < 72 KB, got ${coreGzip + dataGzip} bytes`);

  const html = await fs.readFile(path.join(ROOT_DIR, 'public/index.html'), 'utf8');
  assert.match(html, /class="skip-link"/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /href="\/favicon\.png"/);
  assert.match(html, /src="\/logo\.png"[^>]*width="112"[^>]*height="96"/);

  const logoStat = await fs.stat(path.join(ROOT_DIR, 'public/logo.png'));
  const favStat = await fs.stat(path.join(ROOT_DIR, 'public/favicon.png'));
  assert.ok(logoStat.size < 12 * 1024, `Expected optimized logo.png < 12 KB, got ${logoStat.size}`);
  assert.ok(favStat.size < 4 * 1024, `Expected optimized favicon.png < 4 KB, got ${favStat.size}`);

  const { server, baseUrl } = await startTestServer();
  try {
    const first = await request(`${baseUrl}/css/styles.css`);
    assert.equal(first.status, 200);
    assert.ok(first.headers.etag);

    const cached = await request(`${baseUrl}/css/styles.css`, {
      'If-None-Match': first.headers.etag
    });
    assert.equal(cached.status, 304);

    const badJsonStatus = await new Promise((resolve, reject) => {
      const req = http.request(
        `${baseUrl}/api/guidance`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
        (r) => {
          r.resume();
          r.on('end', () => resolve(r.statusCode));
        }
      );
      req.on('error', reject);
      req.end('{bad-json');
    });
    assert.equal(badJsonStatus, 400);

    const badMethodStatus = await new Promise((resolve, reject) => {
      const req = http.request(`${baseUrl}/api/guidance`, { method: 'DELETE' }, (r) => {
        r.resume();
        r.on('end', () => resolve(r.statusCode));
      });
      req.on('error', reject);
      req.end();
    });
    assert.equal(badMethodStatus, 405);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase A Sanity: Supabase schema RLS exists & repo/HTTP endpoints handle resources, share codes, feedback, and reports', async () => {
  const migrationSql = await fs.readFile(
    path.join(ROOT_DIR, 'supabase/migrations/001_init.sql'),
    'utf8'
  );
  for (const table of ['resources', 'doubt_cache', 'shared_plans', 'doubt_feedback', 'resource_reports']) {
    assert.match(migrationSql, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migrationSql, new RegExp(`alter table public\\.${table} enable row level security`));
  }

  const repo = createSupabaseRepo({ client: null });
  assert.equal(repo.isSupabaseEnabled(), false);

  const server = createAppServer({ repo });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function postJson(pathname, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        `${baseUrl}${pathname}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          }
        },
        (r) => {
          const chunks = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () => resolve({ status: r.statusCode, json: JSON.parse(Buffer.concat(chunks).toString('utf8')) }));
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  try {
    const resList = await request(`${baseUrl}/api/resources?domain=data&dataUsage=low`);
    assert.equal(resList.status, 200);
    const listJson = JSON.parse(resList.body.toString('utf8'));
    assert.ok(listJson.resources.length >= 2);
    assert.ok(listJson.resources.every((r) => r.domain === 'data' && r.dataUsage === 'low'));

    const created = await postJson('/api/plans', {
      lang: 'hi',
      savedResourceIds: ['res-freecodecamp', 'invalid-id'],
      completedSteps: { 'tech-zero-cost::step-1': true, 'bad': true }
    });
    assert.equal(created.status, 201);
    assert.match(created.json.code, /^[A-Z0-9]{6}$/);

    const fetched = await request(`${baseUrl}/api/plans/${created.json.code}`);
    assert.equal(fetched.status, 200);
    const planJson = JSON.parse(fetched.body.toString('utf8'));
    assert.equal(planJson.lang, 'hi');
    assert.deepEqual(planJson.savedResourceIds, ['res-freecodecamp']);
    assert.deepEqual(planJson.completedSteps, { 'tech-zero-cost::step-1': true });

    const deepLink = await request(`${baseUrl}/p/${created.json.code}`);
    assert.equal(deepLink.status, 200);
    assert.match(deepLink.body.toString('utf8'), /<title>PathIQ/);

    const fb = await postJson('/api/feedback', { queryHash: 'abc123', helpful: true, lang: 'en' });
    assert.equal(fb.status, 201);

    const rpt = await postJson('/api/report', { resourceId: 'res-sqlbolt', reason: 'Link slow', lang: 'en' });
    assert.equal(rpt.status, 201);

    const badRpt = await postJson('/api/report', { resourceId: 'nonexistent', reason: 'ok', lang: 'en' });
    assert.equal(badRpt.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase B Sanity: Doubt Solver routes small vs accurate Gemini models, caches in repo, tracks previousInteractionId, and rate limits', async () => {
  assert.equal(needsAccurateReasoning('What is HTML?'), false);
  assert.equal(needsAccurateReasoning('Why does SELECT * FROM users JOIN orders fail?'), true);
  assert.equal(needsAccurateReasoning('What is HTML?', true), true);

  const calls = [];
  const mockAi = {
    interactions: {
      create: async (params) => {
        calls.push(params);
        return {
          id: `int_${calls.length}`,
          output_text: JSON.stringify({
            directAnswer: `Solved (${params.model}): ${params.input}`,
            stepByStep: ['Step one', 'Step two'],
            simpleExample: 'SELECT a.id FROM a LEFT JOIN b ON a.id = b.a_id;',
            commonMistake: 'Filtering the right table in WHERE instead of ON.',
            nextPracticeStep: 'Run Lesson 6 on SQLBolt.',
            followUpSuggestions: ['Explain simpler', 'Show another example']
          })
        };
      }
    }
  };

  const repo = createSupabaseRepo({ client: null });
  const rateLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
  const doubtSolver = createDoubtSolver({ repo, aiClient: mockAi, rateLimiter });

  const server = createAppServer({ repo, doubtSolver });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function postDoubt(body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request(
        `${baseUrl}/api/doubt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          }
        },
        (r) => {
          const chunks = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () => resolve({ status: r.statusCode, json: JSON.parse(Buffer.concat(chunks).toString('utf8')) }));
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  try {
    // 1. Simple concept question -> gemini-3.5-flash-lite
    const first = await postDoubt({
      question: 'What is semantic HTML?',
      lang: 'en',
      stage: 'college',
      liteMode: true
    });
    assert.equal(first.status, 200);
    assert.equal(first.json.modelUsed, MODEL_FAST_SMALL);
    assert.equal(first.json.cached, false);
    assert.equal(first.json.interactionId, 'int_1');
    assert.equal(calls[0].generation_config.thinking_level, 'minimal');

    // 2. Identical query -> served from cache (no second AI call!)
    const second = await postDoubt({
      question: 'What is semantic HTML?',
      lang: 'en',
      stage: 'college',
      liteMode: true
    });
    assert.equal(second.status, 200);
    assert.equal(second.json.cached, true);
    assert.equal(calls.length, 1);

    // 3. Multi-turn follow-up passes previous_interaction_id
    const followUp = await postDoubt({
      question: 'Give me a 2-line example',
      lang: 'en',
      previousInteractionId: first.json.interactionId
    });
    assert.equal(followUp.status, 200);
    assert.equal(calls[1].previous_interaction_id, 'int_1');

    // 4. SQL/Code question escalates to gemini-4-hydrogen
    const sqlDoubt = await postDoubt({
      question: 'Why does SELECT * FROM users JOIN orders return duplicates?',
      lang: 'hi'
    });
    assert.equal(sqlDoubt.status, 200);
    assert.equal(sqlDoubt.json.modelUsed, MODEL_ACCURATE);

    // 5. Fourth live AI call hits rate limiter (maxRequests: 3)
    const rateLimited = await postDoubt({
      question: 'Explain closures in JavaScript',
      lang: 'en'
    });
    assert.equal(rateLimited.status, 429);

    // 6. Offline fallback works cleanly when no key/client is configured
    const offlineSolver = createDoubtSolver({ repo: createSupabaseRepo({ client: null }) });
    const prevKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const offlineRes = await offlineSolver.solveDoubt({ question: 'How does SQL JOIN work?', lang: 'ta' });
    if (prevKey !== undefined) process.env.GEMINI_API_KEY = prevKey;
    assert.equal(offlineRes.modelUsed, 'offline-fallback');
    assert.ok(offlineRes.answer.stepByStep.length >= 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Phase C Sanity: Doubt cache key normalization, share-code URL parsing, and Service Worker shell exists', async () => {
  assert.equal(
    makeDoubtCacheKey({
      question: '  What is  SQL? ',
      lang: 'hi',
      stage: 'college',
      liteMode: true,
      deepCheck: false
    }),
    'doubt::hi::college::true::false::what is sql?'
  );
  assert.equal(parseShareCodeFromPath('/p/a8k2m3'), 'A8K2M3');
  assert.equal(parseShareCodeFromPath('/p/bad'), null);

  const swText = await fs.readFile(path.join(ROOT_DIR, 'public/sw.js'), 'utf8');
  assert.match(swText, /CACHE_NAME/);
  assert.match(swText, /\/api\//);
});

test('Phase D Sanity: Student Dashboard stats, month calendar, studyDays store, and sidebar shell work cleanly', async () => {
  const stats = computeLearningStats(
    {
      'tech-zero-cost::step-1': true,
      'tech-zero-cost::step-2': true,
      'data-analyst-free::step-1': true
    },
    ['res-freecodecamp']
  );
  assert.equal(stats.featured.length, 3);
  assert.equal(stats.totalChecked, 3);
  assert.equal(stats.savedCount, 1);
  assert.ok(stats.overallPct > 0 && stats.overallPct <= 100);

  const cal = buildMonthCalendar(new Date(2026, 10, 25)); // Nov 25, 2026
  assert.equal(cal.todayIso, '2026-11-25');
  assert.equal(cal.cells.length % 7, 0);
  assert.equal(cal.cells.filter((c) => c.isToday).length, 1);

  const memory = new Map();
  const mockStorage = {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => memory.set(k, v)
  };
  const store = createStore(mockStorage);
  assert.equal(store.getState().activeTab, 'dashboard');
  store.toggleStudyDay('2026-11-25');
  assert.equal(store.getState().studyDays['2026-11-25'], true);
  store.toggleStudyDay('2026-11-25');
  assert.equal(store.getState().studyDays['2026-11-25'], undefined);

  const html = await fs.readFile(path.join(ROOT_DIR, 'public/index.html'), 'utf8');
  assert.match(html, /id="view-dashboard"/);
  assert.match(html, /class="app-sidebar"/);
});

test('Phase E Sanity: Vercel Functions, vercel.json config, and no root server.js hijack', async () => {
  const rootServerExists = await fs
    .stat(path.join(ROOT_DIR, 'server.js'))
    .then(() => true)
    .catch(() => false);
  assert.equal(rootServerExists, false, 'Root server.js must not exist so Vercel serves public/ + api/');

  const vercelJson = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));
  assert.equal(vercelJson.framework, null);
  assert.equal(vercelJson.buildCommand, null);
  assert.equal(vercelJson.outputDirectory, 'public');
  assert.ok(vercelJson.rewrites.some((r) => r.source === '/p/:code' && r.destination === '/index.html'));

  const pkg = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  assert.equal(pkg.engines.node, '>=22.0.0');

  const { GET: healthGet } = await import('../api/health.js');
  const healthRes = await healthGet();
  assert.equal(healthRes.status, 200);
  const healthJson = await healthRes.json();
  assert.equal(healthJson.ok, true);

  const { GET: resourcesGet } = await import('../api/resources.js');
  const resResp = await resourcesGet(new Request('https://example.vercel.app/api/resources?domain=tech&dataUsage=low'));
  assert.equal(resResp.status, 200);
  const resJson = await resResp.json();
  assert.ok(resJson.resources.length >= 3);

  const { POST: guidancePost } = await import('../api/guidance.js');
  const guidResp = await guidancePost(
    new Request('https://example.vercel.app/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'SQL data analyst', lang: 'en', weeklyHours: '10' })
    })
  );
  assert.equal(guidResp.status, 200);
  const guidJson = await guidResp.json();
  assert.equal(guidJson.pathId, 'data-analyst-free');

  const { POST: doubtPost } = await import('../api/doubt.js');
  const doubtResp = await doubtPost(
    new Request('https://example.vercel.app/api/doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is semantic HTML?', lang: 'en' })
    })
  );
  assert.equal(doubtResp.status, 200);
  const doubtJson = await doubtResp.json();
  assert.ok(doubtJson.answer.directAnswer.length > 0);

  const { POST: createPlanPost } = await import('../api/plans/index.js');
  const { GET: getPlanGet } = await import('../api/plans/[code].js');
  const planCreateResp = await createPlanPost(
    new Request('https://example.vercel.app/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: 'en', savedResourceIds: ['res-mdn'], completedSteps: {} })
    })
  );
  assert.equal(planCreateResp.status, 201);
  const createdPlan = await planCreateResp.json();
  assert.match(createdPlan.code, /^[A-Z0-9]{6}$/);

  const planGetResp = await getPlanGet(
    new Request(`https://example.vercel.app/api/plans/${createdPlan.code}`)
  );
  assert.equal(planGetResp.status, 200);

  const { POST: feedbackPost } = await import('../api/feedback.js');
  const fbResp = await feedbackPost(
    new Request('https://example.vercel.app/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryHash: 'h123', helpful: true, lang: 'en' })
    })
  );
  assert.equal(fbResp.status, 201);

  const { POST: reportPost } = await import('../api/report.js');
  const rptResp = await reportPost(
    new Request('https://example.vercel.app/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId: 'res-mdn', reason: 'Test check', lang: 'en' })
    })
  );
  assert.equal(rptResp.status, 201);
});
