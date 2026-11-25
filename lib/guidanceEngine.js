import { GoogleGenAI } from '@google/genai';
import { buildStructuredGuidance, matchCareerPath } from '../public/js/guidanceCore.js';

export { buildStructuredGuidance, matchCareerPath };

const GUIDANCE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    overview: { type: 'string' },
    coreSkills: { type: 'array', items: { type: 'string' } },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' }
        },
        required: ['title', 'detail']
      }
    },
    nextAction: { type: 'string' }
  },
  required: ['title', 'overview', 'coreSkills', 'steps', 'nextAction']
};

/**
 * Optional AI-enhanced career guidance using @google/genai Interactions API
 * (gemini-3.5-flash-lite), falling back cleanly to buildStructuredGuidance().
 * @param {Record<string, unknown>} payload
 * @param {{ aiClient?: any }} [opts]
 */
export async function getGuidanceResponse(payload = {}, opts = {}) {
  const baseline = buildStructuredGuidance(payload);
  const apiKey = process.env.GEMINI_API_KEY;
  const userQuery = String(payload.query || '').trim();

  if ((!apiKey && !opts.aiClient) || !userQuery || payload.pathId) {
    return baseline;
  }

  try {
    const ai = opts.aiClient || new GoogleGenAI({ apiKey });
    const interaction = await Promise.race([
      ai.interactions.create({
        model: 'gemini-3.5-flash-lite',
        system_instruction:
          'You are PathIQ, a practical career advisor for learners without paid coaching. Recommend only 100% free actions and tools. Be concise and mobile-friendly.',
        input: `Language code: ${baseline.lang}. User stage: ${baseline.stage}. Weekly hours: ${baseline.weeklyHours}.\nCareer question: ${userQuery}`,
        generation_config: { thinking_level: 'low' },
        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema: GUIDANCE_SCHEMA
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 7000))
    ]);

    const rawText = interaction?.output_text;
    if (!rawText) return baseline;
    const parsed = JSON.parse(rawText);

    if (!parsed?.title || !parsed?.overview || !Array.isArray(parsed?.steps)) {
      return baseline;
    }

    return {
      ...baseline,
      title: String(parsed.title),
      overview: String(parsed.overview),
      coreSkills: Array.isArray(parsed.coreSkills)
        ? parsed.coreSkills.slice(0, 6).map(String)
        : baseline.coreSkills,
      steps: parsed.steps.slice(0, 6).map((s, idx) => ({
        id: String(s.id || `ai-step-${idx + 1}`),
        baseHours: 15,
        estimatedWeeks: Math.max(1, Math.ceil(15 / Number(baseline.weeklyHours))),
        title: String(s.title || ''),
        detail: String(s.detail || '')
      })),
      nextAction: String(parsed.nextAction || baseline.nextAction),
      source: 'ai-enhanced'
    };
  } catch {
    return baseline;
  }
}
