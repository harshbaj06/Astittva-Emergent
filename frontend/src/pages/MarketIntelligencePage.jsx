import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Newspaper, TrendingUp, Globe2, Building2, Activity, Sparkles,
  Train, IndianRupee, Coins, MapPin, ArrowUpRight, RefreshCcw, Loader2
} from "lucide-react";
import api from "@/lib/api";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const SNAPSHOTS = [
  { icon: Train, title: "Infrastructure Updates", value: "Metro · Roads · Airports", note: "Greater Kolkata expansion underway", accent: "from-copper/15 to-transparent" },
  { icon: TrendingUp, title: "Market Growth Indicators", value: "12–18% / yr", note: "New Town & Rajarhat corridors", accent: "from-copper/15 to-transparent" },
  { icon: IndianRupee, title: "Interest Rate Environment", value: "Stable", note: "RBI watch · housing-favorable", accent: "from-copper/15 to-transparent" },
  { icon: MapPin, title: "Emerging Hotspots", value: "Action Area II · Eco-Park Edge", note: "Premium residential demand", accent: "from-copper/15 to-transparent" },
  { icon: Sparkles, title: "Luxury Market Trends", value: "Strong", note: "Branded residences gaining share", accent: "from-copper/15 to-transparent" },
  { icon: Globe2, title: "Global Investment Trends", value: "Dubai · Singapore · London", note: "HNI / NRI inflows rising", accent: "from-copper/15 to-transparent" },
];

const IMPACT_SIGNALS = [
  { level: "High", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", item: "New Metro Phase III approval" },
  { level: "High", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", item: "Tata · Infosys campus expansion" },
  { level: "Medium", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", item: "Land price appreciation 8% YoY" },
  { level: "Medium", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", item: "RBI rate-cut speculation" },
  { level: "Low", color: "text-rose-300/70", border: "border-rose-300/20", bg: "bg-rose-300/5", item: "Local policy revisions pending" },
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
  // Decode common HTML entities
  t = t
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&hellip;/gi, "…")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
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
  return `${Math.floor(sec / 86400)}d ago`;
}

function NewsCard({ a, idx }) {
  return (
    <motion.a
      href={a.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.04 }}
      className="luxury-card group block p-6 sm:p-7 hover:bg-charcoal-2/40 transition"
      data-testid={`news-card-${idx}`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-[10px] tracking-[0.3em] uppercase text-copper truncate max-w-[60%]">{a.source || "News"}</span>
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/35 shrink-0">{timeAgo(a.published)}</span>
      </div>
      <h3 className="font-serif-display text-lg sm:text-xl text-ivory leading-[1.35] group-hover:text-copper transition-colors line-clamp-3">
        {stripHtml(a.title)}
      </h3>
      {a.summary && (
        <p className="mt-3 text-white/55 text-sm font-light leading-[1.65] line-clamp-2">
          {stripHtml(a.summary).slice(0, 160)}{stripHtml(a.summary).length > 160 ? "…" : ""}
        </p>
      )}
      <div className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-copper">
        Read More <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.a>
  );
}

function NewsGrid({ articles, loading, emptyLabel = "Live feed loading..." }) {
  if (loading) {
    return (
      <div className="text-center py-16 text-white/40">
        <Loader2 className="w-5 h-5 mx-auto animate-spin text-copper mb-3" />
        <div className="text-[10px] tracking-[0.4em] uppercase">{emptyLabel}</div>
      </div>
    );
  }
  if (!articles?.length) {
    return <div className="text-center py-16 border border-white/[0.06] text-white/40 italic font-serif-display">Feed temporarily unavailable.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {articles.slice(0, 9).map((a, i) => <NewsCard key={`${a.link}-${i}`} a={a} idx={i} />)}
    </div>
  );
}

export default function MarketIntelligencePage() {
  const [trending, setTrending] = useState([]);
  const [local, setLocal] = useState([]);
  const [india, setIndia] = useState([]);
  const [global, setGlobal] = useState([]);
  const [loading, setLoading] = useState({ trending: true, local: true, india: true, global: true });

  const load = (key, url, setter) => {
    setLoading((s) => ({ ...s, [key]: true }));
    api.get(url)
      .then(({ data }) => setter(data.articles || []))
      .catch(() => setter([]))
      .finally(() => setLoading((s) => ({ ...s, [key]: false })));
  };

  useEffect(() => {
    load("trending", "/news/trending", setTrending);
    load("local", "/news/group/local", setLocal);
    load("india", "/news/group/india", setIndia);
    load("global", "/news/group/global", setGlobal);
  }, []);

  // Generate a few mini insights from latest titles
  const insights = trending.slice(0, 3).map((a) => ({
    title: stripHtml(a.title).split(/[–—-]/)[0].slice(0, 70),
    source: a.source,
    link: a.link,
  }));

  return (
    <div data-testid="market-intelligence-page" className="bg-charcoal text-ivory">
      {/* ============== HERO ============== */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 burgundy-gradient pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.05]"><img src={TEXTURE} alt="" className="w-full h-full object-cover" /></div>

        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-4xl">
            <div className="eyebrow-line mb-6 sm:mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Astitva Intelligence Hub</span>
            </div>
            <h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">
              Market Intelligence
            </h1>
            <p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Actionable insights, investment trends, infrastructure developments, and real estate opportunities — curated from Kolkata, India and global markets.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] tracking-[0.3em] uppercase text-white/45">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Feed</span>
              <span className="text-white/15">·</span>
              <span>Refreshed every 6 hours</span>
              <span className="text-white/15">·</span>
              <span>Powered by Google News</span>
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
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">A real-time pulse on the indicators that move premium real estate.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {SNAPSHOTS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
                className="bg-charcoal p-7 sm:p-10 relative overflow-hidden group"
                data-testid={`snapshot-card-${i}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="relative">
                  <s.icon className="w-7 h-7 text-copper mb-6" strokeWidth={1.1} />
                  <div className="text-[10px] tracking-[0.35em] uppercase text-white/45 mb-3">{s.title}</div>
                  <div className="font-serif-display text-2xl sm:text-3xl text-ivory mb-3 leading-tight">{s.value}</div>
                  <div className="text-muted-fg text-sm font-light">{s.note}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Investment Signals strip */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="overline mb-3">Investment Signals</div>
              <h3 className="font-serif-display text-2xl sm:text-3xl text-ivory leading-tight">Where capital is moving today.</h3>
              <p className="mt-4 text-muted-fg text-sm font-light leading-[1.8]">Curated signals across infrastructure, policy and builder activity — graded by impact.</p>
            </div>
            <div className="lg:col-span-8 space-y-3">
              {IMPACT_SIGNALS.map((s, i) => (
                <motion.div
                  key={s.item + i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className={`flex items-center justify-between gap-4 ${s.bg} ${s.border} border px-5 py-4`}
                  data-testid={`signal-${i}`}
                >
                  <div className="flex items-center gap-4">
                    <Activity className="w-4 h-4 text-white/40" strokeWidth={1.4} />
                    <span className="text-ivory text-sm font-light">{s.item}</span>
                  </div>
                  <span className={`${s.color} text-[10px] tracking-[0.3em] uppercase`}>{s.level} Impact</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== TRENDING NEWS ============== */}
      <section data-testid="trending-news" className="relative py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 03 · Trending</span></div>
              <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">The latest, curated.</h2>
            </div>
            <a href="#local" className="btn-ghost"><RefreshCcw className="w-3 h-3" /> Refreshed Every 6h</a>
          </motion.div>
          <NewsGrid articles={trending} loading={loading.trending} />
        </div>
      </section>

      {/* ============== LOCAL ============== */}
      <section id="local" data-testid="local-news" className="relative py-16 sm:py-24 bg-charcoal-2 border-y border-copper/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 04 · Local</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Local Market Intelligence.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">New Town · Rajarhat · Kolkata — the corridors we know best.</p>
          </motion.div>
          <NewsGrid articles={local} loading={loading.local} emptyLabel="Loading local insights..." />
        </div>
      </section>

      {/* ============== INDIA ============== */}
      <section data-testid="india-news" className="relative py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 05 · India</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">India Real Estate Intelligence.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">Major Indian cities, policy, RBI, REITs and national trends.</p>
          </motion.div>
          <NewsGrid articles={india} loading={loading.india} emptyLabel="Loading India insights..." />
        </div>
      </section>

      {/* ============== GLOBAL ============== */}
      <section data-testid="global-news" className="relative py-16 sm:py-24 bg-charcoal-2 border-y border-copper/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 06 · Global</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Global Property Intelligence.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">Dubai · Singapore · London · New York · global luxury markets.</p>
          </motion.div>
          <NewsGrid articles={global} loading={loading.global} emptyLabel="Loading global insights..." />
        </div>
      </section>

      {/* ============== INVESTMENT INSIGHTS ============== */}
      <section data-testid="investment-insights" className="relative py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-12 sm:mb-16 max-w-3xl">
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-white/55">Section · 07 · Investor Lens</span></div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Investment Insights.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">What investors should be watching this quarter.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {[
              { icon: TrendingUp, title: "Emerging Opportunities", body: "Action-Area II premium residential plots are seeing 14–16% YoY appreciation as global IT campuses scale capacity nearby." },
              { icon: Building2, title: "Infrastructure Impact", body: "Joka–Esplanade metro completion and EM Bypass widening will compress travel time and lift connected micro-markets within 18 months." },
              { icon: Coins, title: "Appreciation Potential", body: "Luxury branded residences in New Town are crossing ₹15K psf — a multi-year inflection point for HNI investors." },
            ].map((c, i) => (
              <motion.div
                key={c.title}
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

          {insights.length > 0 && (
            <div className="mt-12 border border-copper/15 p-7 sm:p-10">
              <div className="overline mb-5">Today's Watchlist</div>
              <ul className="space-y-4">
                {insights.map((it, i) => (
                  <li key={i} className="flex items-start gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0">
                    <span className="text-copper text-xs tracking-widest mt-1">0{i + 1}</span>
                    <a href={it.link} target="_blank" rel="noopener noreferrer" className="text-ivory hover:text-copper font-light leading-[1.7] flex-1">{it.title}</a>
                    <span className="text-white/35 text-[10px] tracking-[0.25em] uppercase whitespace-nowrap hidden sm:inline">{it.source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ============== FUTURE EXPANSION TRACKER ============== */}
      <section data-testid="expansion-tracker" className="relative py-16 sm:py-28 bg-charcoal-2 border-t border-copper/10 overflow-hidden">
        <div className="absolute inset-0 burgundy-gradient-soft pointer-events-none" />
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <div className="overline mb-5">Section · 08</div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">Future Expansion Tracker.</h2>
            <p className="mt-5 text-muted-fg font-light leading-[1.8] text-base">Built on local trust. Designed for global reach.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05]">
            {ROADMAP.map((r, i) => (
              <motion.div
                key={r.phase}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-charcoal p-10 sm:p-12 text-center"
              >
                <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-5">{r.phase}</div>
                <div className="font-serif-display text-2xl sm:text-3xl text-ivory leading-tight">{r.area}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 sm:mt-20 text-center">
            <Link to="/contact" className="btn-primary">Speak to an Astitva Advisor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
