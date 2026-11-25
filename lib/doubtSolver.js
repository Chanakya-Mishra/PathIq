import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { SUPPORTED_LANGS } from '../public/data/locales.js';
import { RESOURCES } from '../public/data/resources.js';

export const MODEL_FAST_SMALL = 'gemini-3.5-flash-lite';
export const MODEL_ACCURATE = 'gemini-4-hydrogen';

const VALID_STAGES = ['school', 'college', 'graduate', 'switcher'];

const DOUBT_SCHEMA = {
  type: 'object',
  properties: {
    directAnswer: { type: 'string' },
    stepByStep: { type: 'array', items: { type: 'string' } },
    simpleExample: { type: 'string' },
    commonMistake: { type: 'string' },
    nextPracticeStep: { type: 'string' },
    followUpSuggestions: { type: 'array', items: { type: 'string' } }
  },
  required: [
    'directAnswer',
    'stepByStep',
    'simpleExample',
    'commonMistake',
    'nextPracticeStep',
    'followUpSuggestions'
  ]
};

/**
 * Simple in-memory fixed-window per-IP rate limiter to protect API quota on no-login endpoints.
 */
export function createRateLimiter({ windowMs = 60_000, maxRequests = 15 } = {}) {
  const buckets = new Map();

  return {
    check(clientKey) {
      const now = Date.now();
      const key = String(clientKey || 'unknown');
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= now) {
        if (buckets.size >= 5000) {
          const firstKey = buckets.keys().next().value;
          buckets.delete(firstKey);
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
      }

      if (existing.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
        };
      }

      existing.count += 1;
      return { allowed: true, remaining: maxRequests - existing.count, retryAfterSec: 0 };
    }
  };
}

/**
 * Compute deterministic short SHA-256 hash for doubt caching and feedback.
 */
export function hashDoubtQuery(question) {
  const normalized = String(question || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return {
    normalized,
    queryHash: crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 24)
  };
}

/**
 * Detect whether a doubt involves code debugging, equations, or multi-step logic
 * that benefits from gemini-4-hydrogen accuracy over gemini-3.5-flash-lite.
 */
export function needsAccurateReasoning(question, deepCheck = false) {
  if (deepCheck) return true;
  const q = String(question || '');
  return /```|function\s+|const\s+|let\s+|SELECT\s+|JOIN\s+|def\s+|TypeError|SyntaxError|ReferenceError|NaN|null|undefined|debug|bug|error|algorithm|proof|equation|\bO\([^)]+\)/i.test(
    q
  );
}

function localizeResTitle(res, lang) {
  return res.title?.[lang] || res.title?.en || '';
}

/**
 * Built-in zero-API-key fallback solver for offline / unconfigured environments.
 * Never fabricates external citations; links directly to verified free resources.
 */
export function buildOfflineDoubtFallback({ question, lang = 'en', stage = 'college' }) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const qLower = String(question || '').toLowerCase();

  let matchedRes = RESOURCES[0];
  if (/sql|join|query|database|data|pandas|python/.test(qLower)) {
    matchedRes = RESOURCES.find((r) => r.id === 'res-sqlbolt') || RESOURCES[5];
  } else if (/design|ui|ux|contrast|layout|penpot/.test(qLower)) {
    matchedRes = RESOURCES.find((r) => r.id === 'res-laws-of-ux') || RESOURCES[0];
  } else if (/exam|ncert|ssc|upsc|math|percent|ratio|scholarship/.test(qLower)) {
    matchedRes = RESOURCES.find((r) => r.id === 'res-ncert-diksha') || RESOURCES[0];
  } else if (/english|interview|grammar|resume|speak/.test(qLower)) {
    matchedRes = RESOURCES.find((r) => r.id === 'res-bbc-english') || RESOURCES[0];
  } else if (/html|css|js|javascript|code|web|bug/.test(qLower)) {
    matchedRes = RESOURCES.find((r) => r.id === 'res-mdn') || RESOURCES[0];
  }

  const resName = localizeResTitle(matchedRes, safeLang);

  const templates = {
    en: {
      directAnswer: `Offline Doubt Mode (${stage}): Live Gemini AI is not configured on this server yet, so here is a structured self-solve guide for "${question.slice(0, 120)}".`,
      stepByStep: [
        'Break the doubt into 1 smallest sub-question or single failing line/formula.',
        `Check the core concept directly on ${resName} (${matchedRes.url}) using text-first docs.`,
        'Test one tiny example on paper or browser console to verify your assumption before moving on.'
      ],
      simpleExample: `When stuck on a topic, isolate a 3-line input/output example instead of reading the whole chapter at once.`,
      commonMistake: 'Reading long video explanations passively without testing a small example yourself.',
      nextPracticeStep: `Open ${resName} and spend 10 minutes practicing the matching core concept.`,
      followUpSuggestions: [
        'Show me a free resource for this topic',
        'Give me a beginner practice plan'
      ]
    },
    hi: {
      directAnswer: `ऑफलाइन डाउट मोड (${stage}): इस सर्वर पर लाइव Gemini AI की सेट नहीं है, इसलिए "${question.slice(0, 100)}" को हल करने का संरचित तरीका नीचे है।`,
      stepByStep: [
        'अपने सवाल या कोड की गलती को सबसे छोटे 1 हिस्से में बांटें।',
        `${resName} (${matchedRes.url}) पर कम-डेटा टेक्स्ट गाइड में मूल नियम जांचें।`,
        'आगे बढ़ने से पहले कागज या ब्राउज़र पर एक छोटा उदाहरण खुद चलाकर देखें।'
      ],
      simpleExample: 'पूरा अध्याय दोबारा पढ़ने के बजाय 3 लाइन का छोटा उदाहरण लेकर जांचें कि आउटपुट क्यों बदला।',
      commonMistake: 'बिना खुद अभ्यास किए केवल लंबे वीडियो देखना।',
      nextPracticeStep: `${resName} खोलें और 10 मिनट इसी विषय के एक छोटे अभ्यास पर लगाएं।`,
      followUpSuggestions: ['इस विषय का मुफ्त संसाधन दिखाएं', 'शुरुआती अभ्यास योजना बताएं']
    },
    ta: {
      directAnswer: `ஆஃப்லைன் சந்தேக முறை (${stage}): இந்த சர்வரில் நேரடி Gemini AI இணைக்கப்படவில்லை. "${question.slice(0, 100)}" என்பதற்கான தீர்வு வழிகாட்டி இதோ:`,
      stepByStep: [
        'உங்கள் சந்தேகத்தை மிகச் சிறிய ஒரு பகுதியாகப் பிரிக்கவும்.',
        `${resName} (${matchedRes.url}) தளத்தில் அடிப்படை விதியைச் சரிபார்க்கவும்.`,
        'முன்னேறும் முன் காகிதத்தில் அல்லது உலாவியில் 1 சிறிய உதாரணத்தைச் சோதிக்கவும்.'
      ],
      simpleExample: 'முழுப் பாடத்தையும் படிப்பதை விட, 3-வரி சிறிய உதாரணம் மூலம் தவறைக் கண்டறியவும்.',
      commonMistake: 'சுயமாகப் பயிற்சி செய்யாமல் நீண்ட வீடியோக்களை மட்டும் பார்ப்பது.',
      nextPracticeStep: `${resName}-ஐத் திறந்து 10 நிமிடம் அடிப்படைப் பயிற்சி செய்யுங்கள்.`,
      followUpSuggestions: ['இதற்கான இலவச வளம் எது?', 'தொடக்க பயிற்சித் திட்டம் தருக']
    },
    bn: {
      directAnswer: `অফলাইন ডাউট মোড (${stage}): এই সার্ভারে লাইভ Gemini AI কনফিগার করা নেই, তাই "${question.slice(0, 100)}" বোঝার ধাপগুলো নিচে দেওয়া হলো:`,
      stepByStep: [
        'আপনার প্রশ্ন বা ভুলটিকে সবচেয়ে ছোট ১টি অংশে ভাগ করুন।',
        `${resName} (${matchedRes.url})-এ টেক্সট ডকুমেন্টেশন থেকে মূল নিয়মটি দেখে নিন।`,
        'সামনে এগোনোর আগে খাতায় বা ব্রাউজারে একটি ছোট উদাহরণ নিজে পরীক্ষা করুন।'
      ],
      simpleExample: 'পুরো অধ্যায় না পড়ে মাত্র ৩ লাইনের একটি ছোট উদাহরণ দিয়ে ভুল কোথায় হচ্ছে তা দেখুন।',
      commonMistake: 'নিজে অনুশীলন না করে শুধু লম্বা ভিডিও দেখা।',
      nextPracticeStep: `${resName} খুলে ১০ মিনিট এই মূল বিষয়টি অনুশীলন করুন।`,
      followUpSuggestions: ['এই বিষয়ের ফ্রি রিসোর্স দেখান', 'সহজ অনুশীলনের প্ল্যান দিন']
    }
  };

  return {
    ...(templates[safeLang] || templates.en),
    suggestedResource: {
      id: matchedRes.id,
      title: resName,
      url: matchedRes.url
    }
  };
}

/**
 * Create the Doubt Solver service backed by @google/genai + Supabase doubt_cache.
 */
export function createDoubtSolver({ repo, aiClient = null, rateLimiter = createRateLimiter() } = {}) {
  async function solveDoubt({
    question,
    lang = 'en',
    stage = 'college',
    liteMode = false,
    deepCheck = false,
    previousInteractionId = null,
    clientIp = 'local'
  }) {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion || cleanQuestion.length > 800) {
      const err = new Error('INVALID_QUESTION');
      err.statusCode = 400;
      throw err;
    }

    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const safeStage = VALID_STAGES.includes(stage) ? stage : 'college';
    const safeLite = Boolean(liteMode);
    const useAccurate = needsAccurateReasoning(cleanQuestion, Boolean(deepCheck));
    const model = useAccurate ? MODEL_ACCURATE : MODEL_FAST_SMALL;

    const { normalized, queryHash } = hashDoubtQuery(cleanQuestion);
    const cacheVariantHash = useAccurate ? `${queryHash}_acc` : queryHash;

    // 1. Cache-aside lookup for standalone doubts (skip cache for multi-turn follow-ups)
    if (!previousInteractionId && repo) {
      const hit = await repo.getCachedDoubt({
        queryHash: cacheVariantHash,
        lang: safeLang,
        stage: safeStage,
        liteMode: safeLite
      });
      if (hit) {
        return {
          queryHash: cacheVariantHash,
          interactionId: null,
          modelUsed: hit.modelUsed,
          cached: true,
          source: hit.source,
          answer: hit.answer
        };
      }
    }

    // 2. Rate-limit live AI calls (after cache check so cached hits remain free)
    const rate = rateLimiter.check(clientIp);
    if (!rate.allowed) {
      const err = new Error('RATE_LIMITED');
      err.statusCode = 429;
      err.retryAfterSec = rate.retryAfterSec;
      throw err;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey && !aiClient) {
      return {
        queryHash: cacheVariantHash,
        interactionId: null,
        modelUsed: 'offline-fallback',
        cached: false,
        source: 'offline-fallback',
        answer: buildOfflineDoubtFallback({
          question: cleanQuestion,
          lang: safeLang,
          stage: safeStage
        })
      };
    }

    try {
      const ai = aiClient || new GoogleGenAI({ apiKey });
      const concisenessRule = safeLite
        ? 'LITE MODE ACTIVE: Keep directAnswer <= 2 short sentences and each step <= 14 words.'
        : 'Keep explanations clear, structured, and easy to read on a mobile screen.';

      const systemInstruction = [
        'You are PathIQ Doubt Solver, a patient, accurate tutor for students without paid coaching.',
        `Respond in language code "${safeLang}" (en=English, hi=Hindi, ta=Tamil, bn=Bengali).`,
        `Learner stage: ${safeStage}.`,
        concisenessRule,
        'Be factually honest: if the learner omitted code or numbers needed to be sure, state what is missing instead of guessing.',
        'Never recommend paid courses or paid tools.'
      ].join(' ');

      const params = {
        model,
        system_instruction: systemInstruction,
        input: cleanQuestion,
        generation_config: {
          thinking_level: useAccurate ? 'low' : safeLite ? 'minimal' : 'low'
        },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: DOUBT_SCHEMA
        }
      };

      if (previousInteractionId) {
        params.previous_interaction_id = String(previousInteractionId);
      }

      const interaction = await Promise.race([
        ai.interactions.create(params),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DOUBT_TIMEOUT')), 9000))
      ]);

      const rawText = interaction?.output_text;
      if (!rawText) throw new Error('EMPTY_MODEL_OUTPUT');
      const parsed = JSON.parse(rawText);

      if (!parsed?.directAnswer || !Array.isArray(parsed?.stepByStep)) {
        throw new Error('INVALID_MODEL_SCHEMA');
      }

      const normalizedAnswer = {
        directAnswer: String(parsed.directAnswer),
        stepByStep: parsed.stepByStep.slice(0, 5).map(String),
        simpleExample: String(parsed.simpleExample || ''),
        commonMistake: String(parsed.commonMistake || ''),
        nextPracticeStep: String(parsed.nextPracticeStep || ''),
        followUpSuggestions: Array.isArray(parsed.followUpSuggestions)
          ? parsed.followUpSuggestions.slice(0, 3).map(String)
          : []
      };

      if (!previousInteractionId && repo) {
        await repo.saveCachedDoubt({
          queryHash: cacheVariantHash,
          normalizedQuery: normalized,
          lang: safeLang,
          stage: safeStage,
          liteMode: safeLite,
          modelUsed: model,
          answerJson: normalizedAnswer
        });
      }

      return {
        queryHash: cacheVariantHash,
        interactionId: interaction.id || null,
        modelUsed: model,
        cached: false,
        source: 'gemini-live',
        answer: normalizedAnswer
      };
    } catch {
      return {
        queryHash: cacheVariantHash,
        interactionId: null,
        modelUsed: 'offline-fallback',
        cached: false,
        source: 'offline-fallback',
        answer: buildOfflineDoubtFallback({
          question: cleanQuestion,
          lang: safeLang,
          stage: safeStage
        })
      };
    }
  }

  return { solveDoubt };
}
