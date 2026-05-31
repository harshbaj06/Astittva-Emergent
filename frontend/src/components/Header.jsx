import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open ? "bg-[#121212]/92 backdrop-blur-xl border-b border-white/[0.05]" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 flex items-center justify-between h-16 sm:h-20 md:h-24">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 sm:gap-4 group">
          <img src={LOGO_URL} alt="Astitva Group" className="h-9 w-9 sm:h-12 sm:w-12 object-cover" />
          <div className="hidden sm:block leading-tight border-l border-white/10 pl-3 sm:pl-4">
            <div className="text-ivory font-serif-display tracking-[0.18em] text-sm sm:text-base">ASTITTVA</div>
            <div className="text-white/40 text-[9px] tracking-[0.45em] uppercase mt-0.5">Real Estate</div>
          </div>
          {/* Compact label on phones */}
          <div className="sm:hidden leading-tight border-l border-white/10 pl-3">
            <div className="text-ivory font-serif-display tracking-[0.18em] text-[13px]">ASTITTVA</div>
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
          className="md:hidden text-ivory relative w-10 h-10 flex items-center justify-center -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "menu"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              {open ? <X className="w-6 h-6" strokeWidth={1.4} /> : <Menu className="w-6 h-6" strokeWidth={1.4} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-[#121212]/98 backdrop-blur-xl border-t border-white/5"
          >
            <nav className="px-6 py-8 flex flex-col">
              {nav.map((n, i) => (
                <motion.div
                  key={n.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, duration: 0.4 }}
                >
                  <NavLink
                    to={n.to}
                    data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                    className={({ isActive }) =>
                      `block py-4 text-base font-serif-display tracking-[0.06em] border-b border-white/[0.05] ${
                        isActive ? "text-copper" : "text-white/85"
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-8"
              >
                <Link to="/contact" data-testid="mobile-header-cta" className="btn-primary w-full">
                  Book Consultation
                </Link>
              </motion.div>
              <div className="mt-8 pt-6 border-t border-white/[0.05] text-[10px] tracking-[0.4em] uppercase text-white/40">
                Kolkata · India
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
