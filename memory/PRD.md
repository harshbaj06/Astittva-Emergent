# ASTITTVA — Luxury Real Estate Platform · PRD (v5 · Production)

## Brand
- **Wordmark:** ASTITTVA (double T) — used throughout site (header, footer, mobile menu, page title, metadata)
- **Logo:** Official copper monogram on burgundy texture
- **Palette:** #050505 background · #2A0608 burgundy · #3A0B10 wine · #C68642 copper · #D4A373 rose-gold · #B7792E gold · #F7F3EE ivory · #B8AEA4 muted
- **Type:** Cormorant Garamond (display) · Poppins (headings) · Inter (body)
- **Ambient:** Sitewide burgundy radial + copper sheen (`AmbientGlow` component)

## Architecture
- **Backend:** FastAPI + MongoDB + feedparser (Google News RSS, **3h cache, rolling archive**)
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind
- **Storage:** Emergent Object Storage
- **Auth:** JWT (HttpOnly + Bearer fallback) · roles admin/sales/marketing

## Contact (Public)
- **Email:** sales@astittva.in
- **Office:** PS IXL Building, 5th Floor Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136, India
- **Phone:** +91 90000 00000 (placeholder — replace before launch)

## What's been implemented

- **v1:** MVP — auth, admin panel, properties CRUD, lead gen, multi-page site
- **v2:** UI/UX refinement — trust signals, stats redesign, WhatsApp, lead form upgrade
- **v3:** New logo, deeper palette, Market Intelligence page (8 sections, live RSS), extended contact form
- **v4:** Final brand consistency — burgundy palette, AmbientGlow component, classified news cards, filter system, Market Opportunities, Markets We Track, SEO
- **v5 (FINAL PRODUCTION):**
  - **Brand correction:** ASTITTVA (double T) everywhere
  - **Contact details:** PS IXL Building New Town address + sales@astittva.in in footer + contact page + metadata
  - **Market Intelligence cards** now show full geo hierarchy: CITY · STATE · COUNTRY (e.g. MUMBAI · MAHARASHTRA · INDIA, LONDON · GREATER LONDON · UK)
  - **2 new filter chips:** ECONOMY · TECHNOLOGY (with proper backend classification rules)
  - **CinematicHero**: rotating Kolkata landmarks every 6s with Ken Burns zoom + 1.6s crossfade + slide caption + progress dots — 6 hand-curated images (Biswa Bangla Gate, Howrah Bridge, Victoria Memorial, New Town Skyline, Eco Park, City Centre 2)
  - Page title updated to "Astittva · Luxury Real Estate Advisory · Kolkata"
- **v5.1 (Market Intelligence resilience — Feb 2026):**
  - **Multi-tag classification:** every keyword pattern adds a category (no early break) — articles surface in all relevant filters
  - **Added missing topics:** `economy`, `technology` (queries against Google News RSS for India macro & PropTech)
  - **Rolling archive cache:** `_merge_articles()` merges new+old, dedupes by link, keeps newest 100 per topic — empty/failed fetches never wipe data
  - **TTL:** 3h (was 6h); failed refresh shortens retry window to 30 min instead of holding a full 3h lockout
  - **Frontend fallback cascade:** when a filter returns 0, cascade to related-category → India → Global → latest — graceful banner ("No direct matches found. Showing the latest relevant market intelligence.") instead of empty state
  - **Skeleton loaders** replace plain spinner during first uncached load
  - **Console debug logs** (`[MI] ...`) for fetched / filtered / fallback counts
  - **Backend country defaults** now mark India-topic articles with `country=India` (previously left blank → "—")
  - Tested: 100% backend + frontend, all 13 filters return content
- **v5.2 (Market Intelligence triple-layer failsafe — Feb 2026):**
  - **Evergreen fallback:** 14 curated, hand-written articles baked into `news_service.EVERGREEN_FALLBACK` covering all 8 categories × 4 countries — auto-engages when live + cache < 14 articles
  - **/api/news/all now returns `{ articles, count, last_updated }`** — last_updated = newest fetched_at across all topics
  - **Hero "LAST UPDATED · {timeAgo}"** indicator in copper
  - **Removed "Feed Temporarily Unavailable" banner path** — pipeline now guarantees ≥14 articles always, so the empty-state UI was unreachable and removed
  - **/api/news/debug** public diagnostic endpoint listing per-topic counts, age_minutes, TTL

## Tests
- v1: 32/32 ✓ · v2: 34/34 ✓ · v3: 43/43 ✓ · v4: 56/56 ✓ · **v5: 68/68 ✓**
- Mobile verified at 375/390/414 — zero horizontal overflow on every page
- Brand verified: ASTITTVA wordmark in header/footer/title/MI eyebrow · 0 occurrences of "Astitva" (single T) in user copy

## Production Backlog
- **P0 (before public launch):** real phone number & email (currently placeholders)
- **P1:** Resend instant-email + Twilio SMS on new lead
- **P1:** JSON-LD structured data + sitemap.xml + robots.txt
- **P1:** Investor brochure PDF email-gate per property
- **P2:** Multi-language (Bengali / Hindi) · property comparison · saved searches
- **P3:** Currency toggle (₹/$/£) · react-helmet-async for cleaner SEO
- **P3:** Stack CinematicHero images (multi-img crossfade) instead of src-swap
- **P3:** Silence /api/auth/me 401 console noise for unauthenticated visitors

## Admin
- URL: `/admin/login`
- Credentials: `admin@astitva.com` / `Astitva@2026` (seeded on every backend boot)
