# Astitva Real Estate — PRD

## Problem Statement
Build a premium luxury real estate platform for Astitva Real Estate — a real estate advisory and development company serving New Town, Rajarhat, and Kolkata, with a vision to expand to Greater Kolkata, West Bengal, India and global destinations.

Brand personality: Luxury, Trustworthy, Sophisticated, Modern, Architectural, Premium, Investment-focused.

## Architecture
- **Backend:** FastAPI + MongoDB (Motor async client) — `/api` prefix
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind CSS, Sonner toasts
- **Storage:** Emergent Object Storage for property images (uploaded via admin panel)
- **Auth:** JWT (HttpOnly cookies + localStorage Bearer fallback) with role-based access (admin / sales / marketing)
- **Design:** Dark luxury — Charcoal #1B1B1B, Copper #B87333, Rose Gold #C68E6D, Ivory #F8F5F1. Poppins + Cormorant Garamond + Inter typography.
- **Imagery:** AI-generated Biswa Bangla Gate + City Centre 2 Rajarhat via Gemini Nano Banana (gemini-3.1-flash-image-preview).

## What's been implemented

### v1 (initial MVP)
- ✅ FastAPI backend: auth, role-protected user CRUD, property CRUD with status workflow, leads, image upload, stats endpoint
- ✅ Single-admin seeding (admin@astitva.com / Astitva@2026) + brute-force protection
- ✅ 6 sample featured properties seeded
- ✅ Public site: Home (all 8 sections), Properties listing, Property Detail, About, Contact
- ✅ Admin panel: Login, Dashboard, Properties CRUD, Leads CRM, Users management

### v2 (Comprehensive UI/UX Audit & Refinement)
- ✅ **Hero**: refined editorial layout, gold-text italic on "Build your future", reduced mobile headline by 30% with proper line breaks
- ✅ **Trust Strip** below hero: RERA-Verified · Trusted Developer Partnerships · Senior Expert Advisory · End-to-End Investment Guidance
- ✅ **Stats redesign**: Massive Cormorant numbers (5-6rem) — 12–18%, ₹40K Cr, 150+, 3rd
- ✅ **Enriched Location Cards**: starting price (₹1.2 Cr / ₹35 L / ₹4.5 Cr), category chip (Luxury · Premium etc.), refined gradient overlay
- ✅ **WhatsApp integration**: Floating green FAB bottom-right with expandable advisory card + dedicated "Need Property Advice?" CTA section + WhatsApp Inquiry button on each property detail page
- ✅ **Lead form upgrade**: Added Budget field, trust bullets (No spam ever / Confidential / 24h response), elegant Thank-You state with WhatsApp follow-up CTA, inline error banner
- ✅ **Mobile-first responsiveness**: hamburger drawer with Framer Motion animation + body-scroll lock, hero compressed to 100svh / 1.9rem headline, full-width stacked CTAs, lazy-loaded images, 48px tap targets, no horizontal scroll
- ✅ **Header refinement**: smaller logo on mobile (h-9), serif drawer typography, active-state copper underline

## User Personas
1. **HNI / NRI Investor** — desktop research → WhatsApp first contact → consultation
2. **Family Buyer** — mobile-first browsing → lead form → site visit
3. **Business Owner** — quick discovery → phone/WhatsApp follow-up
4. **Admin (super)** — manages users, properties, leads
5. **Sales / Marketing** — manages properties & leads

## Test Results
- v1: 32/32 backend pytest passing
- v2: 34/34 backend pytest passing (+ 2 budget-field tests)
- All frontend critical flows verified on desktop + mobile (390×844)

## Prioritised Backlog
- **P1:** Email/SMS notification on new lead (Resend / Twilio)
- **P1:** SEO meta tags + sitemap + structured data for properties
- **P1:** Property comparison tool
- **P1:** Investor Brochure PDF download (email-gated)
- **P2:** Multi-language (Bengali / Hindi)
- **P2:** Image gallery lightbox with zoom on property detail
- **P2:** Saved searches / favourites (investor login)
- **P3:** Split HomePage.jsx into per-section components for maintainability
- **P3:** ¥/₹/$ currency toggle for international visitors

## Next Tasks
- Implement P1 email notification (Resend)
- Add SEO meta/sitemap
- Investor brochure email-gate flow
