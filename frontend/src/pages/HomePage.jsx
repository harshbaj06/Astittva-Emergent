import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Building2, Compass, ChevronRight, MapPin, Globe2, Award, TrendingUp, BadgeCheck, Handshake, Briefcase, MessageCircle, Check } from "lucide-react";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/site";

const HERO_IMG = "/images/biswa-bangla-hero.png";
const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const TRUST_SIGNALS = [
  { icon: BadgeCheck, label: "RERA-Verified Projects" },
  { icon: Handshake, label: "Trusted Developer Partnerships" },
  { icon: Compass, label: "Senior Expert Advisory" },
  { icon: Briefcase, label: "End-to-End Investment Guidance" },
];

const LOCATIONS = [
  {
    name: "New Town",
    tag: "Smart City Hub",
    img: "/images/biswa-bangla-newtown.png",
    blurb: "India's first planned smart-city — IT corridors and rising luxury sky-residences.",
    starting: "₹1.2 Cr",
    category: "Luxury · Premium",
  },
  {
    name: "Rajarhat",
    tag: "Investment Frontier",
    img: "/images/city-centre-2-rajarhat.png",
    blurb: "The fastest-appreciating corridor of Greater Kolkata, anchored by Eco Park & global IT.",
    starting: "₹35 L",
    category: "Premium · Plots",
  },
  {
    name: "Kolkata",
    tag: "Cultural Capital",
    img: "https://images.pexels.com/photos/36613128/pexels-photo-36613128.jpeg",
    blurb: "A legacy city reimagined — heritage, art, and a new wave of luxury residences.",
    starting: "₹4.5 Cr",
    category: "Heritage · Luxury",
  },
];

const PILLARS = [
  { icon: ShieldCheck, title: "Verified Properties", body: "Every listing is RERA-verified and personally vetted by our advisory team — no surprises, ever." },
  { icon: Sparkles, title: "Curated Portfolio", body: "We work only with developers whose craftsmanship and integrity match our standards of luxury." },
  { icon: Compass, title: "Expert Consultation", body: "From legal diligence to investment strategy — a single, sophisticated point of contact for your journey." },
  { icon: Award, title: "Trusted Network", body: "Backed by relationships with India's most respected builders, lenders, and legal partners." },
];

const KOLKATA_FACTS = [
  { stat: "12–18%", label: "Annual Appreciation" },
  { stat: "₹40K Cr", label: "Infrastructure Investment" },
  { stat: "150+", label: "Global Companies" },
  { stat: "3rd", label: "Largest Metro Region" },
];

const ROADMAP = [
  { phase: "Today", area: "New Town · Rajarhat · Kolkata", icon: MapPin },
  { phase: "Next", area: "Greater Kolkata Metropolitan Region", icon: Building2 },
  { phase: "2027", area: "Tier-1 cities across India", icon: TrendingUp },
  { phase: "Vision", area: "Global investment destinations", icon: Globe2 },
];

const BUDGETS = ["Under ₹50 L", "₹50 L – ₹1 Cr", "₹1 – 3 Cr", "₹3 – 5 Cr", "₹5 Cr+"];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const initialForm = { name: "", email: "", phone: "", interest: "", budget: "", message: "" };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get("/properties", { params: { featured: true, limit: 6 } })
      .then(({ data }) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/leads", { ...formData, source: "homepage" });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="home-page">
      {/* ===================== HERO ===================== */}
      <section data-testid="hero-section" className="relative min-h-[640px] h-[100svh] sm:min-h-[760px] sm:h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0">
          <img loading="eager" fetchpriority="high" src={HERO_IMG} alt="Biswa Bangla Gate Kolkata" className="w-full h-full object-cover opacity-90" />
          {/* Cinematic gradient — darker on the left to make text legible, fading to reveal architecture */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </div>

        {/* Fine vertical rule on the left for editorial framing */}
        <div className="absolute left-8 lg:left-16 top-24 bottom-24 w-px bg-white/10 hidden md:block" />

        {/* Vertical brand label */}
        <div className="absolute left-8 lg:left-16 bottom-12 hidden md:flex flex-col items-center gap-4 text-white/40 z-20" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          <span className="text-[10px] tracking-[0.5em] uppercase">EST · KOLKATA · 2026</span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-6 sm:px-8 lg:px-16 lg:pl-32 h-full flex flex-col justify-center pt-24 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="eyebrow-line mb-6 sm:mb-10" data-testid="hero-overline">
              <span className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white/60">Astitva · Real Estate</span>
            </div>

            <h1 className="section-title text-[1.9rem] leading-[1.08] sm:text-[3.25rem] lg:text-[5rem] sm:leading-[1] tracking-[-0.015em]">
              Invest With Confidence.
              <span className="block mt-1.5 sm:mt-3"><span className="gold-text">Build your future</span> with Astitva.</span>
            </h1>

            <p className="mt-5 sm:mt-10 text-white/65 text-[14px] sm:text-base lg:text-lg max-w-xl leading-[1.65] sm:leading-[1.75] font-light">
              Discover verified residential and commercial opportunities across Kolkata's fastest-growing real estate destinations — curated by advisors who measure success in decades, not deals.
            </p>

            <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center">
              <Link to="/properties" data-testid="explore-properties-btn" className="btn-primary w-full sm:w-auto">
                Explore Properties <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a href="#consultation" data-testid="book-consultation-btn" className="btn-ghost justify-center sm:justify-start w-full sm:w-auto">
                Book a Consultation <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-8 lg:right-16 flex flex-col items-end gap-3 text-white/35 hidden md:flex">
          <div className="text-[10px] tracking-[0.5em] uppercase">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-copper/60 to-transparent" />
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section data-testid="trust-strip" className="relative border-y border-white/[0.06] bg-[#0e0e0e]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-7 gap-x-6 sm:gap-x-10">
            {TRUST_SIGNALS.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <t.icon className="w-5 h-5 sm:w-6 sm:h-6 text-copper shrink-0" strokeWidth={1.2} />
                <span className="text-white/70 text-[11px] sm:text-xs tracking-[0.15em] uppercase font-light leading-snug">{t.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY ASTITVA placeholder will follow ===================== */}
      <section data-testid="why-astitva-section" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-3xl mb-12 sm:mb-16">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">The Astitva Difference</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A new standard for real estate<br />
              <span className="text-white/50 italic font-serif-display">advisory in Eastern India.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#121212] p-7 sm:p-10 lg:p-12 group"
              >
                <p.icon className="w-7 h-7 text-copper mb-10 transition-colors duration-500" strokeWidth={1} />
                <h3 className="font-serif-display text-2xl text-ivory mb-4">{p.title}</h3>
                <p className="text-white/55 leading-[1.7] font-light text-[15px]">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED LOCATIONS ===================== */}
      <section data-testid="locations-section" className="py-16 sm:py-24 bg-[#0e0e0e]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">Featured Locations</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
                Where Kolkata's future<br /><span className="italic text-white/50">is being built.</span>
              </h2>
            </div>
            <Link to="/properties" className="btn-ghost">
              View All Properties <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-2">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden cursor-pointer"
              >
                <Link to={`/properties?city=${encodeURIComponent(loc.name)}`} data-testid={`location-card-${loc.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#0a0a0a]">
                    <img loading="lazy" src={loc.img} alt={loc.name} className="w-full h-full object-cover transition-all duration-[1.8s] ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/65 to-[#0a0a0a]/15" />
                    {/* Category chip top-left */}
                    <div className="absolute top-5 left-5 flex items-center gap-2 bg-[#0a0a0a]/70 backdrop-blur-md border border-white/10 px-3 py-1.5">
                      <span className="w-1 h-1 rounded-full bg-copper" />
                      <span className="text-white/80 text-[10px] tracking-[0.25em] uppercase">{loc.category}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-10">
                    <div className="overflow-hidden">
                      <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-3 transition-transform duration-500 group-hover:-translate-y-1">{loc.tag}</div>
                    </div>
                    <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-3">{loc.name}</h3>
                    <p className="text-white/65 text-sm leading-[1.7] font-light max-w-xs">{loc.blurb}</p>

                    <div className="mt-6 flex items-end justify-between gap-4 pt-5 border-t border-white/[0.08]">
                      <div>
                        <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 mb-1">Starting</div>
                        <div className="font-serif-display text-xl sm:text-2xl text-ivory">{loc.starting}</div>
                      </div>
                      <div className="inline-flex items-center gap-2 text-copper text-[10px] tracking-[0.4em] uppercase border-b border-copper/40 group-hover:border-copper pb-1 transition-all duration-500">
                        Discover <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PROJECTS ===================== */}
      <section data-testid="projects-section" className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-10 sm:mb-14 max-w-3xl">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">Featured Projects</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A handpicked portfolio.<br />
              <span className="italic text-white/50">Verified. Premium. Ready.</span>
            </h2>
          </motion.div>

          {projects.length === 0 ? (
            <div className="text-center py-24 border border-white/[0.06]">
              <p className="text-white/40 italic font-serif-display text-lg mb-8">New projects are being curated.</p>
              <Link to="/contact" className="btn-outline">Speak to an Advisor</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group"
                  data-testid={`project-card-${p.id}`}
                >
                  <Link to={`/properties/${p.id}`}>
                    <div className="aspect-[4/3] overflow-hidden bg-[#0a0a0a]">
                      <img loading="lazy"
                        src={p.images?.[0] ? fileUrl(p.images[0]) : "https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg"}
                        alt={p.project_name}
                        className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="pt-8">
                      <div className="text-white/40 text-[10px] tracking-[0.4em] uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-px bg-copper" /> {p.city}
                      </div>
                      <h3 className="font-serif-display text-2xl text-ivory mb-3 group-hover:text-copper transition-colors duration-500">{p.project_name}</h3>
                      <p className="text-white/55 text-sm font-light line-clamp-2 leading-[1.7]">{p.description}</p>
                      <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/[0.06]">
                        <span className="text-ivory/80 font-serif-display text-base italic">{p.price_label || "Price on request"}</span>
                        <ArrowRight className="w-4 h-4 text-copper transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== WHY INVEST IN KOLKATA ===================== */}
      <section data-testid="why-kolkata-section" className="relative py-16 sm:py-24 bg-[#0e0e0e] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <img loading="lazy" src={TEXTURE} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">Why Invest in Kolkata</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
                The next great Indian real estate story <span className="italic text-white/50">is being written here.</span>
              </h2>
              <p className="mt-10 text-white/60 leading-[1.85] font-light text-base">
                Kolkata — and Greater Kolkata in particular — is experiencing a quiet renaissance. Lower entry points than Mumbai or Bangalore, strong rental yields, and a wave of infrastructure that's redrawing the map of Eastern India.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-white/[0.06] self-start">
              {KOLKATA_FACTS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="bg-[#0e0e0e] p-8 sm:p-10 lg:p-14 group hover:bg-[#121212] transition-colors duration-500"
                >
                  <div className="font-serif-display text-[3.5rem] sm:text-[5rem] lg:text-[6rem] leading-[0.95] tracking-[-0.02em] text-ivory mb-4 sm:mb-6">
                    {f.stat}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-copper" />
                    <div className="text-white/65 text-[11px] sm:text-xs tracking-[0.2em] uppercase">{f.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== EXPANSION ROADMAP ===================== */}
      <section data-testid="roadmap-section" className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="eyebrow-line justify-center mb-8" style={{ display: "inline-flex" }}>
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">Future Expansion</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05] mt-2">
              From Kolkata<br /><span className="italic text-white/50">to the world.</span>
            </h2>
            <p className="mt-8 text-white/55 font-light leading-[1.85] text-base">
              Built on a foundation of local trust, designed for global ambition. Our roadmap charts a deliberate expansion across India and into key international investment markets.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

            {ROADMAP.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="relative text-center flex flex-col items-center"
                data-testid={`roadmap-step-${i}`}
              >
                <div className="w-24 h-24 rounded-full border border-white/15 bg-[#121212] flex items-center justify-center mb-8 relative group hover:border-copper transition-colors duration-500">
                  <step.icon className="w-7 h-7 text-copper" strokeWidth={1} />
                </div>
                <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-3">{step.phase}</div>
                <div className="font-serif-display text-ivory text-lg max-w-[180px]">{step.area}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHATSAPP CTA STRIP ===================== */}
      <section data-testid="whatsapp-cta" className="relative bg-[#0a0a0a] border-y border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/50">Direct Advisory</span>
              </div>
              <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
                Need Property Advice?
              </h2>
              <p className="mt-5 sm:mt-6 text-white/60 font-light leading-[1.75] text-base max-w-xl">
                Connect directly with an Astitva real estate advisor — verified projects, honest counsel, immediate response.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4">
              <a
                href={whatsappLink("Hi Astitva, I'd like advice on premium properties.")}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-section-cta"
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-4 sm:py-5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} /> Chat on WhatsApp
              </a>
              <a href="#consultation" data-testid="whatsapp-section-book" className="flex-1 btn-outline">
                Book Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LEAD FORM ===================== */}
      <section id="consultation" data-testid="lead-form-section" className="relative py-16 sm:py-24 bg-[#0e0e0e]">
        <div className="absolute inset-0 opacity-[0.06]"><img loading="lazy" src={TEXTURE} alt="" className="w-full h-full object-cover" /></div>

        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-white/50">Book a Consultation</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-[3.5rem] leading-[1.05]">
                Let's design your<br /><span className="italic text-white/50">investment journey.</span>
              </h2>
              <p className="mt-8 sm:mt-10 text-white/55 font-light leading-[1.85] text-base">
                Share a few details. A senior advisor will reach out within one business day with a curated shortlist tailored to your goals.
              </p>

              <ul className="mt-8 space-y-3">
                {["No spam — ever", "Confidential & RERA-compliant", "Response within 24 hours"].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/55 text-sm font-light">
                    <Check className="w-4 h-4 text-copper" strokeWidth={1.4} /> {b}
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 sm:pt-10 border-t border-white/[0.06]">
                <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-3">Or call us directly</div>
                <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-serif-display text-2xl text-ivory hover:text-copper transition">{PHONE_DISPLAY}</a>
              </div>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="border border-copper/30 p-10 sm:p-14 text-center"
                  data-testid="lead-thank-you"
                >
                  <div className="w-16 h-16 mx-auto rounded-full border border-copper/40 flex items-center justify-center mb-6">
                    <Check className="w-7 h-7 text-copper" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-4">Thank you.</h3>
                  <p className="text-white/60 font-light leading-[1.85] max-w-md mx-auto">
                    Your request has been received. A senior Astitva advisor will reach out within one business day with a curated shortlist for you.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <a
                      href={whatsappLink("Hi Astitva, I just submitted a consultation request.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-3.5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                    <button onClick={() => setSubmitted(false)} className="btn-ghost justify-center">
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8" data-testid="lead-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7 sm:gap-y-8">
                    <div>
                      <label className="input-label">Full Name</label>
                      <input required type="text" data-testid="lead-name-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-luxury" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input required type="tel" data-testid="lead-phone-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-luxury" placeholder="+91" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input required type="email" data-testid="lead-email-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-luxury" placeholder="you@email.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7 sm:gap-y-8">
                    <div>
                      <label className="input-label">Property Interest</label>
                      <select data-testid="lead-interest-select" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} className="input-luxury">
                        <option value="">Select an interest</option>
                        <option>Residential — Luxury</option>
                        <option>Residential — Premium</option>
                        <option>Commercial</option>
                        <option>Plot / Land</option>
                        <option>Investment Advisory</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Budget</label>
                      <select data-testid="lead-budget-select" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input-luxury">
                        <option value="">Select budget</option>
                        {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Message (optional)</label>
                    <textarea rows={3} data-testid="lead-message-input" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-luxury" placeholder="Tell us about your goals..." />
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                    <button type="submit" disabled={submitting} data-testid="lead-submit-btn" className="btn-primary disabled:opacity-50 w-full sm:w-auto">
                      {submitting ? "Sending..." : "Request Consultation"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white/35 text-[10px] tracking-[0.25em] uppercase font-light sm:ml-2">100% Confidential</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
