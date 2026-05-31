import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/artifacts/13645h8f_Astittva%20group%20logo.jpeg";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative border-t border-copper/20 bg-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img src={LOGO_URL} alt="Astitva" className="h-14 w-14 object-cover ring-1 ring-copper/40" />
              <div>
                <div className="font-display tracking-[0.25em] text-ivory text-lg">ASTITTVA</div>
                <div className="text-copper text-[10px] tracking-[0.4em]">GROUP</div>
              </div>
            </div>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-sm">
              A premium real estate advisory and development house — helping investors build legacy across Kolkata, India and beyond.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Instagram" className="w-10 h-10 border border-copper/30 flex items-center justify-center hover:bg-copper/10 hover:border-copper transition">
                <Instagram className="w-4 h-4 text-copper" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 border border-copper/30 flex items-center justify-center hover:bg-copper/10 hover:border-copper transition">
                <Linkedin className="w-4 h-4 text-copper" />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 border border-copper/30 flex items-center justify-center hover:bg-copper/10 hover:border-copper transition">
                <Facebook className="w-4 h-4 text-copper" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="overline mb-5">Explore</h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li><Link to="/" className="hover:text-copper transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-copper transition">Properties</Link></li>
              <li><Link to="/about" className="hover:text-copper transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-copper transition">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="overline mb-5">Locations</h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li>New Town</li>
              <li>Rajarhat</li>
              <li>Kolkata</li>
              <li className="text-copper/80 italic text-xs mt-4">— Expanding to Greater Kolkata, India & Global</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="overline mb-5">Reach Us</h4>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-copper mt-0.5 shrink-0" />
                <span>New Town, Rajarhat<br />Kolkata, West Bengal 700156</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-copper shrink-0" />
                <a href="tel:+919000000000" className="hover:text-copper transition">+91 90000 00000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-copper shrink-0" />
                <a href="mailto:hello@astitva.com" className="hover:text-copper transition">hello@astitva.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-copper/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-ivory/40 text-xs tracking-wider">© {new Date().getFullYear()} Astitva Group. All rights reserved.</p>
          <p className="text-ivory/40 text-xs tracking-[0.2em] uppercase">
            Crafted with conviction — Kolkata, India
          </p>
        </div>
      </div>
    </footer>
  );
}
