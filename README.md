# PathIQ — Lightweight Multilingual Student Dashboard, Career Guide & Doubt Solver

A fast, low-data, zero-login **Student Learning Dashboard**, **Multilingual Career Guide**, **AI Doubt Solver**, and **100% Free Learning Resource Directory** designed for learners without access to paid coaching and optimized for budget smartphones and slow connections.

---

## Architecture & Low-Data Footprint
- **Frontend:** Semantic HTML5, Lightweight Custom CSS (`~3.9 KB` gzipped), Modular Vanilla ES Modules, and Service Worker shell caching (`public/sw.js`).
- **Core App Shell + JS + CSS:** `~30.6 KB` gzipped (`31,351` bytes).
- **Full 4-Language Offline Bundle (`en`, `hi`, `ta`, `bn`):** `~66.3 KB` gzipped (`67,935` bytes).
- **Backend:** Vercel-ready Serverless Functions (`api/*.js`) + shared Web-API router (`lib/apiRouter.js`) + local Node server (`lib/localServer.js`) with gzip compression, `ETag` caching, rate limiting, and server-side-only Supabase + Gemini integrations (`0 KB` SDK overhead sent to the browser).

---

## Core Features

1. **Student Learning Dashboard (`Dashboard` View):**
   - Responsive sidebar layout on desktop (collapsing cleanly into a sticky mobile nav strip).
   - Welcome banner with live goal completion percentage and a quick Doubt Solver launchpad.
   - **Active Learning Path Cards**, a pure-CSS **Progress Statistic Donut**, horizontal **Learning Progress** bars synced to `localStorage` milestones, and an interactive **Study Schedule Calendar** for marking local study days.
   - **Preloaded Realistic Mock Student Data:** Automatically seeds on initial visit (or via `?demo=1`) with active career progress, verified free resources, and study days so the dashboard is interactive and colorful immediately. Includes a one-tap **"Load Sample Data"** action.
   - **Bulletproof Responsive Layout:** Flexbox `min-width: 0` title truncation, `flex-shrink: 0` percentage protection (no clipped `%` or text collision), card boundary isolation, and an adaptive tablet utility grid (640px–1139px).
2. **Top-Level Multilingual Switcher:**
   - Instant header switching across **English (`en`)**, **Hindi (`hi`)**, **Tamil (`ta`)**, and **Bengali (`bn`)**, updating `<html lang>`, UI labels, starter questions, roadmaps, and resource notes (`localStorage`-persisted).
3. **Lite Mode (Low Data Toggle):**
   - Strips decorative visuals, donut chart ring, and non-essential subtitles, compresses spacing into a text-first layout, and displays live payload and cache savings.
4. **Structured Career Roadmaps (`Career Guide`):**
   - Search input, one-tap starter question chips, **Current Stage** (`School`, `College`, `Graduate`, `Career Switcher`) & **Weekly Time** (`5`, `10`, `20+` hrs) context filters.
   - Renders a 5-part structured roadmap (**Overview**, **Core Skills**, **Interactive Step Checkboxes**, **Verified Free Resources**, **Practical Next Action**) with local answer caching.
5. **Small & Accurate Gemini Doubt Solver (`POST /api/doubt`):**
   - Built with `@google/genai` **Interactions API**: defaults to **`gemini-3.5-flash-lite`** for fast, low-cost doubts and escalates code/SQL/math/debugging doubts to **`gemini-4-hydrogen`** (`thinking_level: "low"`).
   - Multi-turn follow-ups via `previous_interaction_id`, structured JSON output, cache-aside lookup in Supabase (`doubt_cache`), per-IP rate limiting (`429`), optional browser speech-to-text, and automatic offline fallback.
6. **Curated 100% Free Resource Directory (`Free Resources`):**
   - Filter by **Domain** (`Tech`, `Data`, `Design`, `Govt/Competitive Exams`, `Communication/Soft Skills`), **Format** (`Text/Docs`, `Interactive`, `Video`), **Language**, **Data Usage** (`Low Data` / `Moderate`), and search keywords.
   - Displays `100% Free` and data-usage badges, why recommended, `"Save to My Plan"`, and `"Report broken link"` (`POST /api/report`).
7. **My Saved Plan & Cross-Device Share Codes (`My Saved Plan`):**
   - Stores bookmarked resources and checked milestones in `localStorage`.
   - Exports cleanly as **Plain Text (WhatsApp)**, **Markdown**, `.txt`/`.md` downloads, `wa.me` share links, or 6-character cross-device share codes (`/p/:code`) backed by Supabase (`shared_plans`).

---

## Interactive Demo & Mock Data Profile

To ensure evaluators and new learners experience an engaging, vibrant dashboard rather than an empty 0% state, PathIQ includes a rich, pre-configured **Mock Student Profile** ([`public/data/mockStudentData.js`](public/data/mockStudentData.js)):

- **Active Milestones:** Pre-checked steps in Web Development (50%), Post-12th Career & Scholarships (33%), Portfolio Building (67%), and Data Analytics (25%), rendering a multi-color **Progress Statistic Donut (~43% completed)** and populated horizontal progress tracks.
- **Dynamic Study Calendar:** 7 active study days dynamically mapped to the user's current month and year so the calendar always shows realistic consistency.
- **Bookmarked Resources:** Pre-saved free resources (freeCodeCamp, National Scholarship Portal, SWAYAM/NPTEL, MDN Web Docs, OpenStax).
- **Cached Doubt Guidance:** Pre-cached guidance answering *"How do I start in tech with zero paid courses?"*.
- **How to Load or Reset:**
  - **Auto-Seed on First Visit:** Automatically populates on first browser load.
  - **One-Tap UI Action:** Tap **"Load Sample Data"** in the Dashboard header or **"My Saved Plan"** anytime.
  - **URL Parameter:** Open `http://127.0.0.1:3000/?demo=1` or `?mock=1`.
  - **Reset:** Tap **"Clear Saved Plan"** in My Saved Plan to start from a blank canvas.

---

## Responsive Layout & Anti-Overlap Engineering

- **Flex Item Bounds:** Applied `min-width: 0;` on `.dash-bar-name` to ensure long roadmap titles cleanly truncate with `text-overflow: ellipsis` on narrow screens rather than pushing the progress percentage outside the card.
- **Percentage Anchor:** Added `flex-shrink: 0; font-variant-numeric: tabular-nums;` to `.dash-bar-pct` so completion numbers (e.g. `0%`, `100%`) never get clipped, squashed, or collide with borders.
- **Card Boundary Isolation:** All dashboard panel cards enforce `min-width: 0; overflow: hidden;` to prevent child content from forcing grid cells to overlap adjacent columns.
- **Adaptive Breakpoints:**
  - `Desktop (>= 1140px)`: 2-column layout (main dashboard + 280px utility rail).
  - `Tablet (640px – 1139px)`: Multi-column responsive utility rail grid positioned underneath main content.
  - `Mobile (< 640px)`: Vertical card stacking with centered donut ring and full-width touch-friendly controls.

---

## Project Structure

```text
pathiq/
├── vercel.json                    # Vercel CDN output (public/), /p/:code rewrite, function config
├── api/                           # Vercel Serverless Functions (Web Request/Response handlers)
│   ├── health.js, resources.js, guidance.js, doubt.js, feedback.js, report.js
│   └── plans/ (index.js, [code].js)
├── lib/
│   ├── apiRouter.js               # Shared Web API route handlers & validation
│   ├── localServer.js             # Local development & test HTTP server (`npm start`)
│   ├── doubtSolver.js             # @google/genai Interactions API + cache-aside + fallback solver
│   ├── guidanceEngine.js          # Optional AI-enhanced career guidance adapter
│   └── supabaseRepo.js            # Server-side Supabase repository with in-memory fallback
├── supabase/
│   ├── migrations/001_init.sql    # Postgres schema + Row Level Security (RLS) policies
│   └── seed.js                    # CLI script to seed curated resources into Supabase
├── public/
│   ├── index.html                 # Semantic HTML5 shell + sidebar + 4 views
│   ├── sw.js                      # Lightweight offline shell Service Worker
│   ├── css/styles.css             # Lightweight responsive CSS + [data-lite="true"] rules
│   ├── data/                      # Multilingual UI strings, career paths & free resources
│   └── js/                        # Vanilla ES modules (dashboardView, qaView, directoryView, savedPlanView, etc.)
└── tests/sanity.test.js           # Node test runner suite (16 tests across all features + Vercel Functions)
```

---

## Setup & Running Locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://127.0.0.1:3000`.

### Supabase Secrets Integration (Optional — local fallback works out of the box)
All Supabase credentials stay strictly on the Node.js server; never expose `SUPABASE_SERVICE_ROLE_KEY` in `public/`.
1. Open your Supabase project's **SQL Editor** and execute [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql). This creates `resources`, `doubt_cache`, `shared_plans`, `doubt_feedback`, and `resource_reports` with **Row Level Security (RLS)** enabled.
2. In **Supabase → Project Settings → API**, copy **Project URL** and the **`service_role` secret key** into `.env`:
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
   ```
3. Seed the verified free resources table:
   ```bash
   npm run db:seed
   ```

### Gemini API Key Integration (Optional — offline fallback works out of the box)
1. Generate an API key in Google AI Studio (`https://aistudio.google.com/`).
2. Add it to `.env` (already git-ignored):
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   ```
3. Start the server (`npm start`) and check `GET /api/health`—it will report `"mode": "hybrid-ai"` and `"db": "supabase"` once both integrations are active.

*(When deploying to **Vercel**, import the GitHub repo directly—`vercel.json` serves `public/` on the Edge CDN and routes `/api/*` to Vercel Functions. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` in Vercel Project Settings → **Environment Variables**.)*

---

## API Endpoints

| Method & Path | Description |
| :--- | :--- |
| `GET /api/health` | Server health, active AI mode, database backend, and doubt solver model names |
| `GET /api/resources` | Filter curated free resources (`domain`, `format`, `language`, `dataUsage`, `search`) |
| `POST /api/guidance` | Returns 5-part localized structured career roadmap paced by `stage` and `weeklyHours` |
| `POST /api/doubt` | Solves study/code/exam doubts via `gemini-3.5-flash-lite` / `gemini-4-hydrogen` + cache |
| `POST /api/plans` | Creates a 6-character cross-device share code for a saved plan |
| `GET /api/plans/:code` | Restores a shared plan by code (`/p/:code` opens directly in browser) |
| `POST /api/feedback` | Records helpfulness rating (`helpful: boolean`) for a solved doubt |
| `POST /api/report` | Submits a broken or paywalled resource link report |

---

## Verification & Sanity Tests

```bash
npm test
```
