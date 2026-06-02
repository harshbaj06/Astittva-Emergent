import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, Globe2, Building2, Activity, Sparkles,
  Train, IndianRupee, MapPin, ArrowUpRight, RefreshCcw, Loader2, Lightbulb,
  Filter, ShieldCheck, Coins, Layers
} from "lucide-react";
import api from "@/lib/api";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const SNAPSHOTS = [
  { icon: Train, title: "Infrastructure Updates", value: "Metro · Roads · Airports", note: "Greater Kolkata expansion underway" },
  { icon: TrendingUp, title: "Market Growth Indicators", value: "12–18% / yr", note: "New Town & Rajarhat corridors" },
  { icon: IndianRupee, title: "Interest Rate Environment", value: "Stable", note: "RBI watch · housing-favorable" },
  { icon: MapPin, title: "Emerging Hotspots", value: "Action Area II · Eco-Park", note: "Premium residential demand" },
  { icon: Sparkles, title: "Luxury Market Trends", value: "Strong", note: "Branded residences gaining share" },
  { icon: Globe2, title: "Global Investment Trends", value: "Dubai · Singapore · London", note: "HNI / NRI inflows rising" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "geo:Kolkata", label: "Kolkata" },
  { key: "geo:West Bengal", label: "West Bengal" },
  { key: "country:India", label: "India" },
  { key: "country:Global", label: "Global" },
  { key: "cat:Infrastructure", label: "Infrastructure" },
  { key: "cat:Residential", label: "Residential" },
  { key: "cat:Commercial Real Estate", label: "Commercial" },
  { key: "cat:Luxury Property", label: "Luxury" },
  { key: "cat:Policy", label: "Policy" },
  { key: "cat:Investment", label: "Investment" },
  { key: "cat:Economy", label: "Economy" },
  { key: "cat:Technology", label: "Technology" },
];

const OPPORTUNITIES = [
  { location: "New Town", country: "India", asset: "Luxury Apartments", horizon: "3-5 yrs", risk: "Low", upside: "14-18% CAGR" },
  { location: "Rajarhat", country: "India", asset: "Commercial Office", horizon: "5-7 yrs", risk: "Medium", upside: "12-15% CAGR + yield" },
  { location: "Dubai", country: "UAE", asset: "Premium Residential", horizon: "3-5 yrs", risk: "Medium", upside: "8-12% CAGR + tax-free" },
  { location: "Bengaluru", country: "India", asset: "Commercial REIT", horizon: "Liquid", risk: "Low", upside: "7-9% yield + growth" },
  { location: "Singapore", country: "Singapore", asset: "Branded Residences", horizon: "5-10 yrs", risk: "Low", upside: "Capital preservation" },
  { location: "London", country: "UK", asset: "Prime Central Apartments", horizon: "7-10 yrs", risk: "Low", upside: "GBP-hedged capital" },
];

const MARKETS = [
  { country: "India", flag: "🇮🇳", cities: "Kolkata · Mumbai · Bengaluru · Delhi NCR", focus: "Residential · Commercial · Luxury" },
  { country: "UAE", flag: "🇦🇪", cities: "Dubai · Abu Dhabi", focus: "Premium Residential · Tax-Free Investment" },
  { country: "Singapore", flag: "🇸🇬", cities: "Marina Bay · Orchard", focus: "Branded Residences · Capital Preservation" },
  { country: "United Kingdom", flag: "🇬🇧", cities: "London · Manchester", focus: "Prime Central · Long-Term Capital" },
  { country: "United States", flag: "🇺🇸", cities: "New York · Miami", focus: "Luxury Condos · International Diversification" },
];

const ROADMAP = [
  { phase: "Current", area: "New Town · Rajarhat · Kolkata" },
  { phase: "Upcoming", area: "Greater Kolkata · Tier-1 Indian Cities" },
  { phase: "Future", area: "International Investment Destinations" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

function stripHtml(s = "") {
  let t = s.replace(/<[^>]*>/g, "");
  t = t.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
       .replace(/&#39;/gi, "'").replace(/&apos;/gi, "'")
       .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
       .replace(/&hellip;/gi, "…").replace(/&mdash;/gi, "—").replace(/&ndash;/gi, "–")
       .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  return t.replace(/\s+/g, " ").trim();
}

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  const days = Math.floor(sec / 86400);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const impactStyles = {
  High: { ring: "border-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/5" },
  Medium: { ring: "border-amber-500/40", text: "text-amber-400", bg: "bg-amber-500/5" },
  Low: { ring: "border-white/15", text: "text-white/45", bg: "bg-white/[0.02]" },
};

function Tag({ children, variant = "default" }) {
  const styles = {
    default: "border-white/10 text-white/70 bg-white/[0.025]",
    geo: "border-copper/30 text-copper bg-copper/[0.05]",
    cat: "border-rose-gold/25 text-rose-gold bg-[#3A0B10]/30",
  };
  return (
    <span className={`text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function NewsCard({ a, idx }) {
  const imp = impactStyles[a.impact] || impactStyles.Low;
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(idx, 8) * 0.04 }}
      className="luxury-card group p-6 sm:p-7 flex flex-col hover:bg-burgundy/15 transition-colors duration-500"
      data-testid={`news-card-${idx}`}
    >
      {/* Tag row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {a.city && a.city !== "—" && <Tag variant="geo">{a.city}</Tag>}
        {a.state && a.state !== "—" && a.state !== a.city && <Tag variant="geo">{a.state}</Tag>}
        {a.country && a.country !== "—" && a.country !== a.city && a.country !== a.state && <Tag variant="geo">{a.country}</Tag>}
        {a.category && <Tag variant="cat">{a.category}</Tag>}
        <span className={`text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 border ${imp.ring} ${imp.text} ${imp.bg} ml-auto`}>
          {a.impact} Impact
        </span>
      </div>

      <a href={a.link} target="_blank" rel="noopener noreferrer" className="block">
        <h3 className="font-serif-display text-lg sm:text-xl text-ivory leading-[1.3] group-hover:text-copper transition-colors line-clamp-3 mb-3">
          {stripHtml(a.title)}
        </h3>
        {a.summary && (
          <p className="text-white/55 text-sm font-light leading-[1.65] line-clamp-2">
            {stripHtml(a.summary).slice(0, 170)}{stripHtml(a.summary).length > 170 ? "…" : ""}
          </p>
        )}
      </a>

      {a.impact === "High" && a.why_it_matters && (
        <div className="mt-5 border-l-2 border-copper/60 pl-4 py-1.5">
          <div className="text-[9px] tracking-[0.35em] uppercase text-copper mb-1.5 flex items-center gap-2">
            <Lightbulb className="w-3 h-3" strokeWidth={1.5} /> Why It Matters
          </div>
          <p className="text-white/70 text-[13px] font-light leading-[1.6]">{a.why_it_matters}</p>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-white/[0.05] flex items-center justify-between text-[10px] tracking-[0.25em] uppercase">
        <span className="text-white/40 truncate max-w-[55%]">{a.source || "News"}</span>
        <span className="text-white/40">{timeAgo(a.published)}</span>
      </div>

      <a href={a.link} target="_blank" rel="noopener noreferrer"
         className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-copper hover:text-copper-hover transition w-fit">
        Read More <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </motion.article>
  );
}

function SkeletonCard({ idx }) {
  return (
    <div
      className="luxury-card p-6 sm:p-7 animate-pulse"
      data-testid={`news-skeleton-${idx}`}
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="flex gap-1.5 mb-5">
        <div className="h-4 w-16 bg-white/[0.06]" />
        <div className="h-4 w-20 bg-white/[0.06]" />
        <div className="h-4 w-14 bg-white/[0.06] ml-auto" />
      </div>
      <div className="h-5 w-[85%] bg-white/[0.08] mb-3" />
      <div className="h-5 w-[60%] bg-white/[0.08] mb-5" />
      <div className="h-3 w-full bg-white/[0.04] mb-2" />
      <div className="h-3 w-[80%] bg-white/[0.04] mb-6" />
      <div className="border-t border-white/[0.05] pt-5 flex justify-between">
        <div className="h-3 w-20 bg-white/[0.05]" />
        <div className="h-3 w-12 bg-white/[0.05]" />
      </div>
    </div>
  );
}

function NewsGrid({ articles, loading, max = 12 }) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7" data-testid="mi-news-skeleton">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} idx={i} />)}
    </div>
  );
  if (!articles?.length) return (
    <div className="text-center py-16 border border-white/[0.06] text-white/40 italic font-serif-display" data-testid="mi-empty-fallback">
      Refreshing intelligence — please check back shortly.
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7" data-testid="mi-news-grid">
      {articles.slice(0, max).map((a, i) => <NewsCard key={`${a.link}-${i}`} a={a} idx={i} />)}
    </div>
  );
}

function SEO() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Market Intelligence · Kolkata Real Estate News & Investment Insights · Astittva";
    const ensureMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    ensureMeta("description", "Live Kolkata real estate news, India property market trends, infrastructure updates, luxury property news and global investment insights — curated by Astittva.");
    ensureMeta("keywords", "Kolkata real estate news, India property market trends, real estate investment news India, luxury property news, New Town infrastructure updates, Rajarhat property updates, Indian real estate market");
    // Open Graph
    const ensureProp = (prop, content) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    ensureProp("og:title", "Market Intelligence · Astittva");
    ensureProp("og:description", "Live insights on Kolkata, India and global luxury real estate markets.");
    ensureProp("og:type", "website");
    return () => { document.title = prevTitle; };
  }, []);
  return null;
}

// Related-category map for graceful fallbacks
const RELATED_CATEGORY = {
  Infrastructure: ["Commercial Real Estate", "Investment"],
  "Commercial Real Estate": ["Infrastructure", "Investment"],
  Residential: ["Luxury Property", "Investment"],
  "Luxury Property": ["Residential", "Investment"],
  Investment: ["Economy", "Policy"],
  Policy: ["Investment", "Economy"],
  Economy: ["Investment", "Policy"],
  Technology: ["Investment", "Commercial Real Estate"],
};

function articleHasCategory(a, cat) {
  if (!cat) return false;
  if (Array.isArray(a.categories) && a.categories.includes(cat)) return true;
  return a.category === cat;
}

function articleMatchesGeo(a, v) {
  return a.city === v || a.state === v || a.country === v;
}

function articleMatchesCountry(a, v) {
  if (v === "Global") return a.country && a.country !== "India" && a.country !== "—";
  return a.country === v;
}

export default function MarketIntelligencePage() {
  const [all, setAll] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState({ all: true, trending: true });
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    api.get("/news/trending").then(({ data }) => {
      const arr = data.articles || [];
      console.log("[MI] trending fetched:", arr.length);
      setTrending(arr);
    })
      .catch((e) => { console.warn("[MI] trending fetch failed", e); setTrending([]); })
      .finally(() => setLoading((s) => ({ ...s, trending: false })));
    api.get("/news/all").then(({ data }) => {
      const arr = data.articles || [];
      console.log("[MI] all fetched:", arr.length);
      setAll(arr);
    })
      .catch((e) => { console.warn("[MI] all fetch failed", e); setAll([]); })
      .finally(() => setLoading((s) => ({ ...s, all: false })));
  }, []);

  // { articles, isFallback, fallbackMsg }
  const view = useMemo(() => {
    if (activeFilter === "all") {
      console.log("[MI] filter=all displayed:", all.length);
      return { articles: all, isFallback: false, fallbackMsg: "" };
    }
    const [k, v] = activeFilter.split(":");

    // Primary match
    let primary = [];
    if (k === "geo") primary = all.filter((a) => articleMatchesGeo(a, v));
    else if (k === "country") primary = all.filter((a) => articleMatchesCountry(a, v));
    else if (k === "cat") primary = all.filter((a) => articleHasCategory(a, v));

    if (primary.length > 0) {
      console.log(`[MI] filter=${activeFilter} primary matches:`, primary.length);
      return { articles: primary, isFallback: false, fallbackMsg: "" };
    }

    // Fallback chain — never show empty
    console.log(`[MI] filter=${activeFilter} primary empty → triggering fallback`);

    // 1. Related category (only for cat filters)
    if (k === "cat") {
      const related = RELATED_CATEGORY[v] || [];
      const relatedHits = all.filter((a) => related.some((rc) => articleHasCategory(a, rc)));
      if (relatedHits.length) {
        console.log(`[MI] fallback: related categories → ${relatedHits.length}`);
        return {
          articles: relatedHits,
          isFallback: true,
          fallbackMsg: "No direct matches found. Showing related market intelligence.",
        };
      }
    }

    // 2. India articles (if filter context is geographic or general)
    const india = all.filter((a) => a.country === "India");
    if (india.length) {
      console.log(`[MI] fallback: India → ${india.length}`);
      return {
        articles: india,
        isFallback: true,
        fallbackMsg: "No direct matches found. Showing the latest India market intelligence.",
      };
    }

    // 3. Global articles
    const global = all.filter((a) => a.country && a.country !== "India" && a.country !== "—");
    if (global.length) {
      console.log(`[MI] fallback: Global → ${global.length}`);
      return {
        articles: global,
        isFallback: true,
        fallbackMsg: "No direct matches found. Showing the latest global market intelligence.",
      };
    }

    // 4. Latest (everything we have)
    console.log(`[MI] fallback: latest all → ${all.length}`);
    return {
      articles: all,
      isFallback: true,
      fallbackMsg: "No direct matches found. Showing the latest relevant market intelligence.",
    };
  }, [all, activeFilter]);

  return (
    <div data-testid="market-intelligence-page" className="bg-charcoal text-ivory">
      <SEO />

      {/* ============== HERO ============== */}
      <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"><img src={TEXTURE} alt="" className="w-full h-full object-cover" /></div>
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-4xl">
            <div className="eyebrow-line mb-6 sm:mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/55">ASTITTVA Intelligence Hub</span>
            </div>
            <h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">Market Intelligence</h1>
            <p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Actionable insights, investment trends, infrastructure developments, and real estate opportunities — curated from Kolkata, India and global markets.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-white/45">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Feed</span>
              <span className="text-white/15">·</span><span>Refreshed every 3h</span>
              <span className="text-white/15">·</span><span>Powered by Google News</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== SNAPSHOT DASHBOARD ============== */}
      <section data-testid="market-snapshot" className="relative py-16 sm:py-24 border-t border-copper/10 bg-charcoal-2">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 02</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Market Snapshot.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8]">A real-time pulse on the indicators that move premium real estate.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {SNAPSHOTS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                className="bg-charcoal p-7 sm:p-10 group hover:bg-burgundy/15 transition-colors"
                data-testid={`snapshot-card-${i}`}
              >
                <s.icon className="w-7 h-7 text-copper mb-6" strokeWidth={1.1} />
                <div className="text-[10px] tracking-[0.35em] uppercase text-white/45 mb-3">{s.title}</div>
                <div className="font-serif-display text-2xl sm:text-3xl text-ivory mb-3 leading-tight">{s.value}</div>
                <div className="text-muted-fg text-sm font-light">{s.note}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== INTELLIGENCE FEED (filterable) ============== */}
      <section data-testid="intelligence-feed" className="relative py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 03 · Live Intelligence</span></div>
              <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">The latest, classified.</h2>
              <p className="mt-5 text-muted-fg font-light leading-[1.8] max-w-xl">
                Every story tagged by city, country, category and impact — so you understand instantly what's happening and why.
              </p>
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/40 flex items-center gap-2">
              <RefreshCcw className="w-3 h-3 text-copper" /> Refreshed every 3h
            </div>
          </motion.div>

          {/* Filter bar */}
          <div className="mb-10 flex items-center gap-3 overflow-x-auto pb-1 -mx-6 px-6 sm:mx-0 sm:px-0" data-testid="filter-bar">
            <Filter className="w-4 h-4 text-copper shrink-0" strokeWidth={1.4} />
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  data-testid={`filter-${f.key}`}
                  className={`shrink-0 text-[10px] tracking-[0.25em] uppercase px-4 py-2.5 border transition-all duration-300 ${
                    activeFilter === f.key
                      ? "border-copper text-copper bg-burgundy/40"
                      : "border-white/10 text-white/55 hover:border-copper/40 hover:text-ivory"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {view.isFallback && !loading.all && (
                <div
                  data-testid="mi-fallback-banner"
                  className="mb-6 border border-copper/25 bg-burgundy/10 px-5 py-3.5 flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-copper"
                >
                  <Lightbulb className="w-4 h-4 shrink-0" strokeWidth={1.4} />
                  <span className="font-light tracking-[0.2em] normal-case text-white/70 text-sm">
                    {view.fallbackMsg}
                  </span>
                </div>
              )}
              <NewsGrid articles={view.articles} loading={loading.all} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============== INVESTMENT INSIGHTS ============== */}
      <section data-testid="investment-insights" className="relative py-16 sm:py-24 bg-charcoal-2 border-y border-copper/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 04 · Investor Lens</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Investment Insights.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8]">What investors should be watching this quarter.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {[
              { icon: TrendingUp, title: "Emerging Opportunities", body: "Action Area II premium residential plots are seeing 14-16% YoY appreciation as global IT campuses scale capacity nearby." },
              { icon: Building2, title: "Infrastructure Impact", body: "Joka-Esplanade metro completion and EM Bypass widening will compress travel time and lift connected micro-markets within 18 months." },
              { icon: Coins, title: "Appreciation Potential", body: "Luxury branded residences in New Town are crossing ₹15K psf — a multi-year inflection point for HNI investors." },
            ].map((c, i) => (
              <motion.div key={c.title}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="bg-charcoal p-8 sm:p-10"
              >
                <c.icon className="w-7 h-7 text-copper mb-7" strokeWidth={1.1} />
                <h3 className="font-serif-display text-xl sm:text-2xl text-ivory mb-4">{c.title}</h3>
                <p className="text-muted-fg font-light leading-[1.85] text-[15px]">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== MARKET OPPORTUNITIES ============== */}
      <section data-testid="market-opportunities" className="relative py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 05 · Curated for Investors</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Market Opportunities.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8]">A handpicked set of asset-classes worth tracking across our coverage map.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {OPPORTUNITIES.map((o, i) => (
              <motion.div key={`${o.location}-${o.asset}`}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="luxury-card p-7 sm:p-8 group hover:bg-burgundy/15"
                data-testid={`opportunity-${i}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-copper">{o.country}</span>
                  <span className={`text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 border ${
                    o.risk === "Low" ? "border-emerald-500/40 text-emerald-400" :
                    o.risk === "Medium" ? "border-amber-500/40 text-amber-400" : "border-rose-300/30 text-rose-300"
                  }`}>{o.risk} Risk</span>
                </div>
                <h3 className="font-serif-display text-2xl text-ivory mb-2">{o.location}</h3>
                <p className="text-muted-fg text-sm font-light mb-6">{o.asset}</p>
                <dl className="space-y-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex justify-between text-sm">
                    <dt className="text-white/45 text-[10px] tracking-[0.25em] uppercase">Horizon</dt>
                    <dd className="text-ivory font-light">{o.horizon}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-white/45 text-[10px] tracking-[0.25em] uppercase">Upside</dt>
                    <dd className="text-copper font-serif-display">{o.upside}</dd>
                  </div>
                </dl>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== MARKETS WE TRACK ============== */}
      <section data-testid="markets-we-track" className="relative py-16 sm:py-24 bg-charcoal-2 border-y border-copper/10 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 06 · Coverage</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Markets We Track.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8]">Cities and corridors where Astittva sources opportunity for its investor network.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-white/[0.05]">
            {MARKETS.map((m, i) => (
              <motion.div key={m.country}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="bg-charcoal p-7 sm:p-8 group"
                data-testid={`market-${m.country}`}
              >
                <div className="text-4xl mb-4" aria-hidden="true">{m.flag}</div>
                <h3 className="font-serif-display text-xl text-ivory mb-2">{m.country}</h3>
                <p className="text-white/55 text-[12px] font-light leading-relaxed mb-4">{m.cities}</p>
                <div className="text-[9px] tracking-[0.3em] uppercase text-copper border-t border-white/[0.06] pt-3">{m.focus}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FUTURE EXPANSION TRACKER ============== */}
      <section data-testid="expansion-tracker" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 burgundy-gradient-soft pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="overline mb-5">Section · 07</div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Future Expansion Tracker.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8]">Built on local trust. Designed for global reach.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05]">
            {ROADMAP.map((r, i) => (
              <motion.div key={r.phase}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-charcoal p-10 sm:p-12 text-center"
              >
                <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-5">{r.phase}</div>
                <div className="font-serif-display text-2xl sm:text-3xl text-ivory leading-tight">{r.area}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-14 sm:mt-16 text-center">
            <Link to="/contact" className="btn-primary">Speak to an Astittva Advisor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
