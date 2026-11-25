import { CAREER_PATHS } from '../data/careerPaths.js';
import { RESOURCES } from '../data/resources.js';
import { SUPPORTED_LANGS } from '../data/locales.js';

const VALID_STAGES = ['school', 'college', 'graduate', 'switcher'];
const VALID_HOURS = ['5', '10', '20'];

const STAGE_ADVICE = {
  school: {
    en: 'School-stage tip: Keep board studies first and spend short 30–45 minute blocks exploring this free path plus scholarship eligibility.',
    hi: 'स्कूल स्तर की सलाह: बोर्ड की पढ़ाई के साथ रोज़ 30–45 मिनट इस मुफ्त रास्ते पर दें और छात्रवृत्ति (NSP) की पात्रता जांचें।',
    ta: 'பள்ளி நிலை குறிப்பு: பள்ளிப் படிப்புடன் தினமும் 30–45 நிமிடம் இதற்கு ஒதுக்கி, கல்வி உதவித்தொகைகளையும் பாருங்கள்.',
    bn: 'স্কুল পর্যায়ের পরামর্শ: বোর্ডের পড়াশোনার পাশাপাশি দিনে ৩০–৪৫ মিনিট এই ফ্রি পথে দিন এবং বৃত্তির যোগ্যতা দেখুন।'
  },
  college: {
    en: 'College-stage tip: Pair this skill roadmap with your degree so you graduate with live projects and real proof of work.',
    hi: 'कॉलेज स्तर की सलाह: अपनी डिग्री के साथ इस रोडमैप पर काम करें ताकि पास होने तक आपके पास असली प्रोजेक्ट मौजूद हों।',
    ta: 'கல்லூரி நிலை குறிப்பு: பட்டப்படிப்புடன் இந்தத் திறன் திட்டத்தை இணைத்து, முடிக்கும் முன் நேரடி திட்டங்களை உருவாக்குங்கள்.',
    bn: 'কলেজ পর্যায়ের পরামর্শ: ডিগ্রির পাশাপাশি এই রোডম্যাপ অনুসরণ করুন যাতে পাস করার আগেই আসল প্রজেক্ট তৈরি থাকে।'
  },
  graduate: {
    en: 'Graduate-stage tip: Prioritize building 2–3 public proof-of-work items quickly and apply consistently without waiting for paid certificates.',
    hi: 'ग्रेजुएट स्तर की सलाह: पेड सर्टिफिकेट का इंतजार किए बिना 2–3 असली प्रोजेक्ट बनाएं और लगातार आवेदन शुरू करें।',
    ta: 'பட்டதாரி நிலை குறிப்பு: கட்டணச் சான்றிதழ்களுக்குக் காத்திராமல் 2–3 நேரடி திட்டங்களை உருவாக்கி உடனே விண்ணப்பிக்கத் தொடங்குங்கள்.',
    bn: 'স্নাতক পর্যায়ের পরামর্শ: পেইড সার্টিফিকেটের অপেক্ষা না করে দ্রুত ২–৩টি আসল প্রজেক্ট তৈরি করে নিয়মিত আবেদন শুরু করুন।'
  },
  switcher: {
    en: 'Career-switcher tip: Use focused weekend or evening blocks and reuse problem-solving/communication strengths from your past work.',
    hi: 'करियर बदलाव सलाह: शाम या सप्ताहांत के तय घंटों का उपयोग करें और अपने पिछले अनुभव के समस्या-समाधान कौशल को इसमें जोड़ें।',
    ta: 'துறை மாறுபவர் குறிப்பு: மாலை அல்லது வார இறுதி நேரத்தைப் பயன்படுத்தி, உங்கள் முந்தைய பணி அனுபவத் திறன்களையும் இணைத்துக் கொள்ளுங்கள்.',
    bn: 'ক্যারিয়ার পরিবর্তন পরামর্শ: সন্ধ্যা বা সাপ্তাহিক ছুটির নির্দিষ্ট সময় কাজে লাগান এবং আগের কাজের সমস্যা সমাধানের অভিজ্ঞতা যুক্ত করুন।'
  }
};

function localize(field, lang) {
  if (typeof field === 'string') return field;
  if (!field || typeof field !== 'object') return '';
  return field[lang] ?? field.en ?? '';
}

/**
 * Score and match a query or explicit pathId against preloaded career paths.
 * @param {{ query?: string, pathId?: string | null }} input
 */
export function matchCareerPath({ query = '', pathId = null }) {
  if (pathId) {
    const exact = CAREER_PATHS.find((p) => p.id === pathId);
    if (exact) return exact;
  }

  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return CAREER_PATHS[0];

  const tokens = normalized.split(/[\s,?.!।|]+/).filter((w) => w.length >= 2);
  let bestPath = CAREER_PATHS[0];
  let bestScore = -1;

  for (const path of CAREER_PATHS) {
    let score = 0;

    for (const kw of path.keywords) {
      const k = kw.toLowerCase();
      if (normalized.includes(k)) {
        score += k.length > 4 ? 5 : 3;
      }
    }

    const searchBlob = [
      ...Object.values(path.starterQuestion),
      ...Object.values(path.title),
      ...Object.values(path.overview),
      path.domain
    ]
      .join(' ')
      .toLowerCase();

    for (const token of tokens) {
      if (searchBlob.includes(token)) score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestPath = path;
    }
  }

  return bestPath;
}

/**
 * Build a deterministic, localized 5-part structured career guidance response.
 * Shared across Node server and browser offline fallback.
 * @param {{ query?: string, pathId?: string | null, lang?: string, stage?: string, weeklyHours?: string }} input
 */
export function buildStructuredGuidance({
  query = '',
  pathId = null,
  lang = 'en',
  stage = 'college',
  weeklyHours = '10'
} = {}) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const safeStage = VALID_STAGES.includes(stage) ? stage : 'college';
  const safeHours = VALID_HOURS.includes(String(weeklyHours)) ? String(weeklyHours) : '10';
  const hoursNum = Number(safeHours);

  const path = matchCareerPath({ query, pathId });
  const totalHours = path.steps.reduce((sum, s) => sum + (s.baseHours || 10), 0);
  const estimatedWeeks = Math.max(1, Math.ceil(totalHours / hoursNum));
  const resourceMap = new Map(RESOURCES.map((r) => [r.id, r]));

  return {
    pathId: path.id,
    domain: path.domain,
    lang: safeLang,
    stage: safeStage,
    weeklyHours: safeHours,
    estimatedWeeks,
    title: localize(path.title, safeLang),
    overview: `${localize(path.overview, safeLang)} ${localize(STAGE_ADVICE[safeStage], safeLang)}`,
    coreSkills: path.coreSkills[safeLang] || path.coreSkills.en,
    steps: path.steps.map((step) => ({
      id: step.id,
      baseHours: step.baseHours,
      estimatedWeeks: Math.max(1, Math.ceil(step.baseHours / hoursNum)),
      title: localize(step.title, safeLang),
      detail: localize(step.detail, safeLang)
    })),
    resources: path.resourceIds
      .map((id) => resourceMap.get(id))
      .filter(Boolean)
      .map((r) => ({
        id: r.id,
        domain: r.domain,
        format: r.format,
        languages: r.languages,
        dataUsage: r.dataUsage,
        isFree: r.isFree,
        url: r.url,
        title: localize(r.title, safeLang),
        why: localize(r.why, safeLang)
      })),
    nextAction: localize(path.nextAction, safeLang),
    source: 'deterministic'
  };
}
