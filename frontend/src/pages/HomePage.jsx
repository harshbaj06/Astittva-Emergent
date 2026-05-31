import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Building2, Compass, ChevronRight, MapPin, Globe2, Award, TrendingUp } from "lucide-react";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/83d94db40af9de6336b3e860cbe48776d920746426d4db276be43a271d057f6b.png";
const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const LOCATIONS = [
  { name: "New Town", tag: "Smart City Hub", img: "https://images.unsplash.com/photo-1697482049095-71b683b9e92e?q=80&w=1600&auto=format&fit=crop", blurb: "India's first planned smart-city — IT corridors, world-class infrastructure, and rising luxury residences." },
  { name: "Rajarhat", tag: "Investment Frontier", img: "https://images.pexels.com/photos/33612641/pexels-photo-33612641.jpeg", blurb: "The fastest-appreciating corridor of Greater Kolkata, anchored by Eco Park and global IT campuses." },
  { name: "Kolkata", tag: "Cultural Capital", img: "https://images.pexels.com/photos/36613128/pexels-photo-36613128.jpeg", blurb: "A legacy city reimagined — heritage, art, and a new wave of premium residential development." },
];

const PILLARS = [
  { icon: ShieldCheck, title: "Verified Properties", body: "Every listing is RERA-verified and personally vetted by our advisory team — no surprises, ever." },
  { icon: Sparkles, title: "Curated Portfolio", body: "We work only with developers whose craftsmanship and integrity match our standards of luxury." },
  { icon: Compass, title: "Expert Consultation", body: "From legal diligence to investment strategy — a single, sophisticated point of contact for your journey." },
  { icon: Award, title: "Trusted Network", body: "Backed by relationships with India's most respected builders, lenders, and legal partners." },
];

const KOLKATA_FACTS = [
  { stat: "12-18%", label: "Annual appreciation in New Town & Rajarhat corridors" },
  { stat: "₹40K Cr", label: "Infrastructure investment underway across Greater Kolkata" },
  { stat: "150+", label: "Multinational corporations operating in Kolkata IT hubs" },
  { stat: "3rd", label: "Most populous metropolitan in India — sustained demand" },
];

const ROADMAP = [
  { phase: "Today", area: "New Town · Rajarhat · Kolkata", icon: MapPin },
  { phase: "Next", area: "Greater Kolkata Metropolitan Region", icon: Building2 },
  { phase: "2027", area: "Tier-1 cities across India", icon: TrendingUp },
  { phase: "Vision", area: "Global investment destinations", icon: Globe2 },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

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
      toast.success("Thank you. Our advisory team will reach out shortly.");
      setFormData({ name: "", email: "", phone: "", interest: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="home-page">
      {/* ===================== HERO ===================== */}
      <section data-testid="hero-section" className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Biswa Bangla Gate Kolkata" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/50 to-charcoal" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="overline mb-6" data-testid="hero-overline">Astitva Real Estate · Kolkata</div>
            <h1 className="font-display font-light text-ivory text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight">
              Invest With Confidence.<br />
              <span className="gold-text font-normal">Build Your Future</span> With Astitva.
            </h1>
            <p className="mt-8 text-ivory/75 text-base sm:text-lg max-w-2xl leading-relaxed font-light">
              Discover verified residential and commercial opportunities across Kolkata's fastest-growing real estate destinations.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/properties" data-testid="explore-properties-btn" className="btn-primary">
                Explore Properties <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#consultation" data-testid="book-consultation-btn" className="btn-outline">
                Book Consultation
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory/40">
          <div className="text-[10px] tracking-[0.4em] uppercase">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-copper to-transparent" />
        </div>
      </section>

      {/* ===================== WHY ASTITVA ===================== */}
      <section data-testid="why-astitva-section" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="max-w-2xl mb-20">
            <div className="overline mb-4">Why Astitva</div>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight">
              A new standard for real estate advisory in Eastern India.
            </h2>
            <div className="copper-divider mt-8" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-copper/15">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-charcoal p-10 md:p-14 group hover:bg-charcoal-2 transition-colors duration-500"
              >
                <p.icon className="w-8 h-8 text-copper mb-6 group-hover:text-rose-gold transition" strokeWidth={1.2} />
                <h3 className="font-display text-xl text-ivory mb-3 font-normal">{p.title}</h3>
                <p className="text-ivory/60 leading-relaxed font-light">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED LOCATIONS ===================== */}
      <section data-testid="locations-section" className="py-24 sm:py-32 bg-charcoal-2/30 border-y border-copper/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="overline mb-4">Featured Locations</div>
              <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ivory">
                Where Kolkata's future is being built.
              </h2>
            </div>
            <Link to="/properties" className="text-copper text-xs tracking-[0.3em] uppercase hover:text-rose-gold transition flex items-center gap-2">
              View All Properties <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden cursor-pointer"
              >
                <Link to={`/properties?city=${encodeURIComponent(loc.name)}`} data-testid={`location-card-${loc.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={loc.img} alt={loc.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                    <div className="absolute inset-0 border border-copper/0 group-hover:border-copper/40 transition-colors duration-500" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="overline mb-2">{loc.tag}</div>
                    <h3 className="font-display text-3xl text-ivory mb-3 font-light">{loc.name}</h3>
                    <p className="text-ivory/70 text-sm leading-relaxed font-light max-w-xs">{loc.blurb}</p>
                    <div className="mt-6 flex items-center gap-3 text-copper text-xs tracking-[0.25em] uppercase">
                      Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PROJECTS ===================== */}
      <section data-testid="projects-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16">
            <div className="overline mb-4">Featured Projects</div>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ivory max-w-3xl">
              A handpicked portfolio. Verified, premium, ready to invest.
            </h2>
          </motion.div>

          {projects.length === 0 ? (
            <div className="text-center py-20 border border-copper/15">
              <p className="text-ivory/50 italic font-light">New projects are being curated. Please check back soon — or speak with an advisor.</p>
              <Link to="/contact" className="btn-outline mt-6 inline-flex">Speak To Advisor</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="luxury-card group"
                  data-testid={`project-card-${p.id}`}
                >
                  <Link to={`/properties/${p.id}`}>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={p.images?.[0] ? fileUrl(p.images[0]) : "https://images.pexels.com/photos/24805054/pexels-photo-24805054.jpeg"}
                        alt={p.project_name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      />
                    </div>
                    <div className="p-7">
                      <div className="flex items-center gap-2 text-copper text-[10px] tracking-[0.3em] uppercase mb-3">
                        <MapPin className="w-3 h-3" /> {p.city}
                      </div>
                      <h3 className="font-display text-xl text-ivory mb-2 font-normal group-hover:text-copper transition">{p.project_name}</h3>
                      <p className="text-ivory/60 text-sm font-light line-clamp-2">{p.description}</p>
                      <div className="mt-5 flex items-center justify-between pt-5 border-t border-copper/10">
                        <span className="text-rose-gold font-display text-sm">{p.price_label || "Price on request"}</span>
                        <span className="text-copper text-xs tracking-[0.25em] uppercase flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
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
      <section data-testid="why-kolkata-section" className="relative py-24 sm:py-32 border-y border-copper/15 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={TEXTURE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-charcoal/85" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="overline mb-4">Why Invest in Kolkata</div>
              <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight">
                The next great Indian real estate story is being written here.
              </h2>
              <div className="copper-divider mt-8 mb-8" />
              <p className="text-ivory/70 leading-relaxed font-light text-lg">
                Kolkata — and Greater Kolkata in particular — is experiencing a quiet renaissance. Lower entry points than Mumbai or Bangalore, strong rental yields, and a wave of infrastructure that's redrawing the map of Eastern India.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-copper/15">
              {KOLKATA_FACTS.map((f) => (
                <div key={f.label} className="bg-charcoal p-8">
                  <div className="font-display text-4xl text-copper font-light mb-3">{f.stat}</div>
                  <div className="text-ivory/65 text-sm font-light leading-snug">{f.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== EXPANSION ROADMAP ===================== */}
      <section data-testid="roadmap-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-20">
            <div className="overline mb-4">Future Expansion</div>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-ivory">
              From Kolkata to the world.
            </h2>
            <p className="mt-6 text-ivory/65 font-light leading-relaxed">
              Built on a foundation of local trust, designed for global ambition. Our roadmap charts a deliberate expansion across India and into key international investment markets.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-copper/0 via-copper/60 to-copper/0" />

            {ROADMAP.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center flex flex-col items-center"
                data-testid={`roadmap-step-${i}`}
              >
                <div className="w-24 h-24 rounded-full border border-copper/30 bg-charcoal flex items-center justify-center mb-6 relative group hover:border-copper transition">
                  <step.icon className="w-8 h-8 text-copper" strokeWidth={1.2} />
                  <div className="absolute inset-0 rounded-full border border-copper/0 group-hover:border-copper/50 group-hover:scale-110 transition-all duration-500" />
                </div>
                <div className="overline mb-2">{step.phase}</div>
                <div className="font-display text-ivory text-base sm:text-lg font-light max-w-[180px]">{step.area}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LEAD FORM ===================== */}
      <section id="consultation" data-testid="lead-form-section" className="relative py-24 sm:py-32 border-t border-copper/15 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={TEXTURE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-charcoal/90" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="overline mb-4">Book a Consultation</div>
              <h2 className="font-display font-light text-3xl sm:text-4xl text-ivory leading-tight">
                Let's design your investment journey.
              </h2>
              <div className="copper-divider mt-8 mb-8" />
              <p className="text-ivory/65 font-light leading-relaxed">
                Share a few details. A senior advisor will reach out within one business day with a curated shortlist tailored to your goals.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5" data-testid="lead-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    required
                    type="text"
                    data-testid="lead-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-luxury"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    required
                    type="tel"
                    data-testid="lead-phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-luxury"
                    placeholder="+91"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  required
                  type="email"
                  data-testid="lead-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-luxury"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="input-label">Interest</label>
                <select
                  data-testid="lead-interest-select"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="input-luxury"
                >
                  <option value="">Select an interest</option>
                  <option>Residential — Luxury</option>
                  <option>Residential — Premium</option>
                  <option>Commercial</option>
                  <option>Plot / Land</option>
                  <option>Investment Advisory</option>
                </select>
              </div>
              <div>
                <label className="input-label">Message (optional)</label>
                <textarea
                  rows={3}
                  data-testid="lead-message-input"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-luxury"
                  placeholder="Tell us about your goals..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                data-testid="lead-submit-btn"
                className="btn-primary w-full sm:w-auto disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Request Consultation"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
