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
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-charcoal/90 backdrop-blur-xl border-b border-copper/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <img src={LOGO_URL} alt="Astitva Group" className="h-12 w-12 object-cover rounded-sm ring-1 ring-copper/30" />
          <div className="hidden sm:block leading-tight">
            <div className="text-ivory font-display font-light tracking-[0.25em] text-sm">ASTITTVA</div>
            <div className="text-copper text-[10px] tracking-[0.4em]">GROUP</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-xs tracking-[0.25em] uppercase transition-colors duration-300 ${
                  isActive ? "text-copper" : "text-ivory/70 hover:text-copper"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/contact" data-testid="header-cta" className="btn-primary text-xs">
            Book Consultation
          </Link>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-ivory"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-charcoal/95 backdrop-blur-xl border-t border-copper/10">
          <nav className="px-6 py-6 flex flex-col gap-5">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm tracking-[0.25em] uppercase ${isActive ? "text-copper" : "text-ivory/80"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/contact" data-testid="mobile-header-cta" className="btn-primary text-xs mt-2">
              Book Consultation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
