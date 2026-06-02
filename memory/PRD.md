# Astitva — Luxury Real Estate Platform · PRD (v4)

## Brand
- **Wordmark:** ASTITVA (single line, no tagline below)
- **Logo:** Official Astitva monogram (copper A on burgundy)
- **Palette (final):** Background #050505 · Burgundy #2A0608 · Deep Wine #3A0B10 · Copper #C68642 · Rose Gold #D4A373 · Warm Gold #B7792E · Ivory #F7F3EE · Muted #B8AEA4
- **Type:** Cormorant Garamond (display) · Poppins (headings) · Inter (body)
- **Ambient:** Sitewide burgundy radial glow + copper sheen behind every public page (Aman / Sotheby's editorial atmosphere)

## Architecture
- **Backend:** FastAPI + MongoDB + Motor + feedparser
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind, Sonner
- **Storage:** Emergent Object Storage
- **Auth:** JWT (HttpOnly cookies + Bearer fallback) · roles admin/sales/marketing
- **News:** Google News RSS via feedparser, classified (city/country/category/impact + why-it-matters), cached 6h in MongoDB

## What's been implemented

- **v1:** MVP backend + admin + multi-page site
- **v2:** UI/UX refinement (trust strip, huge stats, enriched locations, WhatsApp integration, lead form upgrade)
- **v3:** New logo, deeper palette, Market Intelligence page (8 sections, live RSS), extended contact form
- **v4 (current):** Final brand consistency
  - Deeper burgundy palette + sitewide AmbientGlow component
  - Header & Footer: ASTITVA wordmark only (tagline removed)
  - Home hero: burgundy radial overlay tinting the dramatic Biswa Bangla Gate
  - Market Intelligence v2:
    - Classified news cards (City · Country · Category tags + High/Medium/Low Impact pill)
    - "Why It Matters" insight card on every High-Impact article
    - **Filter bar**: All · Kolkata · West Bengal · India · Global · Infrastructure · Residential · Commercial · Luxury · Policy · Investment
    - **Market Opportunities** section (6 curated cards: Location · Asset · Horizon · Risk · Upside)
    - **Markets We Track** section (5 country cards with flags: India · UAE · Singapore · UK · USA)
    - SEO meta (title + description + keywords + Open Graph) via React useEffect

## Tests
- v1: 32 / 32 ✓ · v2: 34 / 34 ✓ · v3: 43 / 43 ✓ · v4: **56 / 56 ✓**
- Mobile verified at 375 / 390 / 414 — zero overflow, single-column stacking, scrollable filter bar
- Brand colors verified by playwright: body=#050505, primary button=#C68642, tagline absent, ambient glow rendered

## Prioritised Backlog
- **P1:** Resend instant-email + Twilio SMS on new lead
- **P1:** JSON-LD structured data on property pages + sitemap.xml
- **P1:** Investor brochure PDF email-gate
- **P2:** Property comparison · saved searches · favourites
- **P2:** Multi-language (Bengali / Hindi)
- **P3:** Currency toggle (₹/$/£) · Image lightbox · Split HomePage into per-section components
- **P3:** react-helmet-async for cleaner SEO management across routes
