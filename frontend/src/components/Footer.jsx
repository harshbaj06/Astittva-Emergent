import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, EMAIL, LOGO_URL, BRAND_NAME, BRAND_TAGLINE } from "@/lib/site";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative bg-[#2D0F14] border-t border-copper/25 text-white">
      {/* Subtle copper top sheen */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(184,115,51,0.08) 0%, transparent 100%)" }} />
      {/* CTA strip */}
      <div className="border-b border-copper/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-8">
              <div className="overline mb-4">Ready to Invest?</div>
              <h3 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
                Speak with an Astittva Marketing <span className="italic text-white/55">advisor.</span>
              </h3>
              <p className="mt-5 text-white/70 font-light leading-[1.85] max-w-xl">
                Verified projects, honest counsel, end-to-end guidance. Begin in 30 minutes.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link to="/contact" data-testid="footer-cta" className="btn-primary w-full sm:flex-1 lg:w-full">
                Book Consultation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={whatsappLink("Hi Astittva, I'd like to speak with an advisor.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 lg:w-full inline-flex items-center justify-center gap-2 text-[#C47B3A] hover:text-[#D58A47] py-3 text-xs tracking-[0.18em] uppercase border border-copper/30 hover:border-copper transition"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-8">
              <img src={LOGO_URL} alt="Astittva Marketing" className="h-14 w-14 sm:h-16 sm:w-16 object-contain" />
              <div className="border-l border-copper/35 pl-4">
                <div className="font-serif-display tracking-[0.26em] text-white text-xl sm:text-2xl">{BRAND_NAME}</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-[1.9] font-light max-w-md">
              Real Estate Consulting &amp; Marketing
              <br />
              <span className="text-white/85">New Town &middot; Rajarhat &middot; Kolkata</span>
              <br />
              Expanding Across India.
            </p>
            <div className="flex gap-3 mt-8">
              {[Instagram, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-copper transition-colors duration-500">
                  <Icon className="w-4 h-4 text-white/55" strokeWidth={1.2} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li><Link to="/" className="hover:text-copper transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-copper transition">Properties</Link></li>
              <li><Link to="/market-intelligence" className="hover:text-copper transition">Market Intelligence</Link></li>
              <li><Link to="/about" className="hover:text-copper transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-copper transition">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Markets</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li>New Town</li>
              <li>Rajarhat</li>
              <li>Kolkata</li>
              <li className="text-white/35 italic font-serif-display text-xs pt-2">Greater Kolkata · India · Global</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Reach Us</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-copper mt-0.5 shrink-0" strokeWidth={1.2} />
                <span>PS IXL Building, 5th Flr, Room 511<br />Biswa Bangla Sarani, Atghara<br />New Town, Kolkata, WB 700136</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-copper shrink-0" strokeWidth={1.2} />
                <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-copper transition">{PHONE_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-copper shrink-0" strokeWidth={1.2} />
                <a href={`mailto:${EMAIL}`} className="hover:text-copper transition">{EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="text-white/45 text-xs tracking-wider">© {new Date().getFullYear()} Astittva Marketing · All rights reserved.</p>
          <p className="text-white/45 text-[10px] tracking-[0.4em] uppercase">Crafted with conviction · Kolkata, India</p>
        </div>
      </div>
    </footer>
  );
}
