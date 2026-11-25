# PathIQ — Lightweight Multilingual Career Guidance & Doubt Solver

A fast, low-data, zero-login career guidance, AI doubt-solving, and 100% free learning resource web application built for learners without access to paid coaching.

## Architecture & Low-Data Footprint
- **Frontend:** Semantic HTML5, Lightweight Custom CSS, Vanilla ES Modules, and Service Worker shell caching (`public/sw.js`).
- **Core App Shell + JS + CSS:** `~25.3 KB` gzipped (`25,885` bytes).
- **Full 4-Language Offline Bundle (`en`, `hi`, `ta`, `bn`):** `~59.3 KB` gzipped (`60,760` bytes).
- **Backend:** Lightweight Node.js server (`server.js`) with gzip compression, `ETag` caching, rate limiting, and server-side-only Supabase + Gemini integrations (`0 KB` SDK bloat sent to mobile browsers).

## Key Features
1. **Top-Level Multilingual Switcher:** Instant switching across **English (`en`)**, **Hindi (`hi`)**, **Tamil (`ta`)**, and **Bengali (`bn`)**, persisted in `localStorage`.
2. **Lite Mode (Low Data):** Strips decorative visuals, compresses spacing into a text-first layout, and displays live payload and cache savings.
3. **Structured Career Roadmaps:** Search input, starter question chips, **Current Stage** & **Weekly Time** context filters, interactive progress checkboxes, and verified free resources.
4. **Small & Accurate Gemini Doubt Solver (`POST /api/doubt`):**
   - Uses `@google/genai` **Interactions API**: defaults to **`gemini-3.5-flash-lite`** for fast low-cost doubts and escalates code/math/debugging doubts to **`gemini-4-hydrogen`** (`thinking_level: "low"`).
   - Multi-turn follow-ups via `previous_interaction_id`, structured JSON output, per-IP rate limiting, and automatic offline fallback when unconfigured.
5. **Curated 100% Free Resource Directory:** Multi-facet filtering by **Domain**, **Format**, **Language**, **Data Usage**, and search, plus community broken-link reporting (`POST /api/report`).
6. **My Saved Plan & Cross-Device Share Codes:** Stored locally in `localStorage`, exportable to **WhatsApp Plain Text** or **Markdown** (`.txt` / `.md`), and shareable via 6-character codes (`/p/:code`) backed by **Supabase**.

## Setup & Running Locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://127.0.0.1:3000`.

### Supabase Setup (Optional; local fallback works out of the box)
1. Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) in your Supabase SQL Editor (creates `resources`, `doubt_cache`, `shared_plans`, `doubt_feedback`, and `resource_reports` with RLS enabled).
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`.
3. Seed the curated free resources:
   ```bash
   npm run db:seed
   ```

### Gemini Doubt Solver Setup (Optional; offline fallback works out of the box)
Add `GEMINI_API_KEY` to `.env` and restart `npm start`.

## Sanity Tests

```bash
npm test
```
