import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { RESOURCES } from '../public/data/resources.js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment/.env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const rows = RESOURCES.map((r) => ({
  id: r.id,
  domain: r.domain,
  format: r.format,
  languages: r.languages,
  data_usage: r.dataUsage,
  is_free: r.isFree,
  url: r.url,
  title: r.title,
  why: r.why,
  is_active: true
}));

const { error } = await supabase.from('resources').upsert(rows, { onConflict: 'id' });
if (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} free resources to Supabase.`);
