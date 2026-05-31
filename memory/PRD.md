# Astitva Real Estate — PRD

## Problem Statement
Build a premium luxury real estate platform for Astitva Real Estate — a real estate advisory and development company serving New Town, Rajarhat, and Kolkata, with a vision to expand to Greater Kolkata, West Bengal, India and global destinations.

Brand personality: Luxury, Trustworthy, Sophisticated, Modern, Architectural, Premium.

## Architecture
- **Backend:** FastAPI + MongoDB (Motor async client) — `/api` prefix
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind CSS, Sonner toasts
- **Storage:** Emergent Object Storage for property images (uploaded via admin panel)
- **Auth:** JWT (HttpOnly cookies + localStorage Bearer fallback) with role-based access (admin / sales / marketing)
- **Design:** Dark luxury — Charcoal #1B1B1B, Copper #B87333, Rose Gold #C68E6D, Ivory #F8F5F1. Poppins headings + Inter body.

## User Personas
1. **Investor / Buyer** — visits website, browses properties, books consultation
2. **Admin (super)** — manages users, properties, leads
3. **Sales / Marketing user** — manages properties & leads (no user CRUD)

## Core Requirements (static)
- Homepage with 8 sections: Hero, Why Astitva, Featured Locations, Featured Projects, Why Invest in Kolkata, Future Expansion Roadmap, Lead Form, Footer
- Properties listing + detail pages with filters (city, type, category)
- Multi-page: Home / Properties / Property Detail / About / Contact
- Admin Console: Login, Dashboard, Properties CRUD with image upload, Leads management, Users management
- Dynamic property model with: project_name, builder, location, city, starting_price, price_label, property_type, property_category, description, images, RERA number, possession date, Google Maps URL, bedrooms, area, amenities, status (draft/published/unpublished), is_featured

## What's been implemented — 2026-02-XX
- ✅ FastAPI backend: auth, role-protected user CRUD, property CRUD with status workflow, leads, image upload via object storage, stats endpoint
- ✅ Single-admin seeding (admin@astitva.com / Astitva@2026) + brute-force protection + indexes
- ✅ 6 sample featured properties seeded for demo
- ✅ Public site: Home (all 8 sections), Properties listing with filters, Property Detail with gallery + enquiry, About, Contact
- ✅ Admin panel: Login, Dashboard, Property list/create/edit/publish/unpublish/delete with multi-image upload, Leads with status workflow, Users (admin-only)
- ✅ Framer Motion luxury animations, custom dark theme, Poppins + Inter typography
- ✅ Brand logo + Biswa Bangla Gate hero + copper accents throughout

## Prioritised Backlog
- **P1:** Property comparison tool, blog/insights section, search by price range slider
- **P1:** Email notification for new leads (Resend integration)
- **P1:** SEO meta tags + sitemap + structured data for properties
- **P2:** Multi-language (Bengali / Hindi)
- **P2:** WhatsApp click-to-chat from property cards
- **P2:** Investor login (saved searches, favourites)
- **P2:** Image gallery lightbox with zoom

## Next Tasks
- Gather user feedback on first version
- Add property comparison + email integration
- SEO + content polish
