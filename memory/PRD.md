# Astitva — Luxury Real Estate Platform · PRD

## Brand
- **Name:** ASTITVA (wordmark) · "Luxury Real Estate" (tagline)
- **Logo:** Official Astitva monogram (copper "A" on burgundy)
- **Palette:** Background #050505 · Card #0E0A0A · Copper #C47B3A · Copper-Hover #D58A47 · Burgundy #4A0F14 · Ivory #F5F2EE · Muted #9D948B
- **Type:** Cormorant Garamond (display) · Poppins (headings) · Inter (body)

## Architecture
- **Backend:** FastAPI + MongoDB (Motor)
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind, Sonner
- **Storage:** Emergent Object Storage (property images)
- **Auth:** JWT (HttpOnly cookies + Bearer fallback) · roles admin/sales/marketing
- **News:** Google News RSS via `feedparser` cached in MongoDB (TTL 6h)

## What's been implemented

### v1 — MVP
- Auth + admin panel, properties CRUD, image upload, leads, multi-page site

### v2 — UI/UX audit
- Trust strip, redesigned stats, enriched location cards, WhatsApp integration (FAB + section + property), lead form upgrade (budget + thank-you state), full mobile responsiveness

### v3 — Final premium polish (current)
- ✅ Official Astitva logo (header + footer + favicon) · centralized in `/app/frontend/src/lib/site.js`
- ✅ New luxury palette (#050505 bg, #C47B3A copper, #4A0F14 burgundy accents)
- ✅ Header: added **MARKET INTELLIGENCE** nav; sharper kerning, sticky transparency, lg-breakpoint mobile menu
- ✅ Footer: CTA strip (Book Consultation + WhatsApp), 4-column directory, market links incl. Market Intelligence
- ✅ HomePage: 6 Why-Astitva pillars (RERA, Verified Developers, Expert Advisory, Legal Support, Site Visit Assistance, End-to-End Guidance) · updated WhatsApp section headline ("Need Immediate Property Advice?")
- ✅ Contact: extended form (Preferred Locality / Investment Purpose / Property Type / Budget / Timeline) + Thank-You state + WhatsApp CTA
- ✅ **Market Intelligence Page** with 8 sections:
  1. Hero
  2. Market Snapshot (6 cards) + Investment Signals (High/Medium/Low impact)
  3. Trending News (live RSS)
  4. Local Market Intelligence (New Town + Rajarhat + Kolkata + WB)
  5. India Real Estate Intelligence (REIT, RBI, Policy, Infra)
  6. Global Property Intelligence (Dubai/Singapore/London/US)
  7. Investment Insights (curated cards + Today's Watchlist from live feed)
  8. Future Expansion Tracker
- ✅ Backend news service: `/api/news/trending`, `/api/news/group/{local|india|global}`, `/api/news/topics`, `/api/admin/news/refresh`
- ✅ Extended Lead model with `preferred_locality`, `investment_purpose`, `property_type`, `timeline`

## Tests
- v1: 32 / 32 ✓
- v2: 34 / 34 ✓ (+budget)
- v3: **43 / 43 ✓** (+7 news + 1 extended lead test)
- Frontend: all critical flows verified desktop + mobile (390×844) — zero issues

## Prioritised Backlog
- **P1:** Resend email + Twilio SMS instant lead notifications
- **P1:** SEO meta tags + sitemap + JSON-LD for properties
- **P1:** Investor Brochure email-gate (per-property PDF download)
- **P2:** Property comparison tool · Multi-language (Bengali / Hindi)
- **P2:** Saved searches / favourites (investor login)
- **P3:** Currency toggle (₹/$/£) · Image gallery lightbox
- **P3:** Refactor HomePage.jsx into per-section components
