import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/artifacts/13645h8f_Astittva%20group%20logo.jpeg";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative border-t border-white/[0.06] bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4">
            <div className="flex items-center gap-4 mb-8">
              <img src={LOGO_URL} alt="Astitva" className="h-14 w-14 object-cover" />
              <div className="border-l border-white/10 pl-4">
                <div className="font-serif-display tracking-[0.18em] text-ivory text-lg">ASTITTVA</div>
                <div className="text-white/40 text-[9px] tracking-[0.45em] uppercase mt-0.5">Real Estate</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-[1.85] font-light max-w-sm">
              A premium real estate advisory and development house — helping investors build legacy across Kolkata, India and beyond.
            </p>
            <div className="flex gap-3 mt-8">
              <a href="#" aria-label="Instagram" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-copper transition-colors duration-500">
                <Instagram className="w-4 h-4 text-white/60" strokeWidth={1.2} />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-copper transition-colors duration-500">
                <Linkedin className="w-4 h-4 text-white/60" strokeWidth={1.2} />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-copper transition-colors duration-500">
                <Facebook className="w-4 h-4 text-white/60" strokeWidth={1.2} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li><Link to="/" className="hover:text-copper transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-copper transition">Properties</Link></li>
              <li><Link to="/about" className="hover:text-copper transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-copper transition">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Locations</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li>New Town</li>
              <li>Rajarhat</li>
              <li>Kolkata</li>
              <li className="text-white/35 italic font-serif-display text-xs pt-2">— Expanding to Greater Kolkata, India & Global</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-6">Reach Us</h4>
            <ul className="space-y-4 text-sm text-white/60 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-copper mt-0.5 shrink-0" strokeWidth={1.2} />
                <span>New Town, Rajarhat<br />Kolkata, West Bengal 700156</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-copper shrink-0" strokeWidth={1.2} />
                <a href="tel:+919000000000" className="hover:text-copper transition">+91 90000 00000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-copper shrink-0" strokeWidth={1.2} />
                <a href="mailto:hello@astitva.com" className="hover:text-copper transition">hello@astitva.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/35 text-xs tracking-wider">© {new Date().getFullYear()} Astitva Group · All rights reserved.</p>
          <p className="text-white/35 text-[10px] tracking-[0.4em] uppercase">
            Crafted with conviction · Kolkata, India
          </p>
        </div>
      </div>
    </footer>
  );
}
