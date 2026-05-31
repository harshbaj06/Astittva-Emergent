import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/artifacts/13645h8f_Astittva%20group%20logo.jpeg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "bg-[#121212]/85 backdrop-blur-xl border-b border-white/[0.04]" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16 flex items-center justify-between h-24">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-4 group">
          <div className="relative">
            <img src={LOGO_URL} alt="Astitva Group" className="h-12 w-12 object-cover" />
          </div>
          <div className="hidden sm:block leading-tight border-l border-white/10 pl-4">
            <div className="text-ivory font-serif-display tracking-[0.18em] text-base">ASTITTVA</div>
            <div className="text-white/40 text-[9px] tracking-[0.45em] uppercase mt-0.5">Real Estate</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-12">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `relative text-[11px] tracking-[0.3em] uppercase transition-colors duration-300 py-2 ${
                  isActive ? "text-ivory" : "text-white/60 hover:text-ivory"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-copper" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/contact" data-testid="header-cta" className="btn-primary">
            Book Consultation
          </Link>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-ivory"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#121212]/98 backdrop-blur-xl border-t border-white/5">
          <nav className="px-8 py-8 flex flex-col gap-6">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-xs tracking-[0.3em] uppercase ${isActive ? "text-copper" : "text-white/70"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/contact" data-testid="mobile-header-cta" className="btn-primary mt-4">
              Book Consultation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
