import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  { src: "/images/biswa-bangla-hero.png", caption: "Biswa Bangla Gate · New Town" },
  { src: "/images/howrah-bridge.png", caption: "Howrah Bridge · Kolkata" },
  { src: "/images/victoria-memorial.png", caption: "Victoria Memorial · Kolkata" },
  { src: "/images/new-town-skyline.png", caption: "New Town Skyline" },
  { src: "/images/eco-park-kolkata.png", caption: "Eco Park · New Town" },
  { src: "/images/city-centre-2-rajarhat.png", caption: "City Centre 2 · Rajarhat" },
];

const INTERVAL = 6000; // 6s per slide

export default function CinematicHero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.10 }}
          exit={{ opacity: 0, scale: 1.14 }}
          transition={{
            opacity: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: INTERVAL / 1000 + 1.5, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <img
            src={SLIDES[idx].src}
            alt={SLIDES[idx].caption}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "low"}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic dark gradient — left for text, bottom for fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0306] via-[#0a0306]/72 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] pointer-events-none" />
      {/* Burgundy ambient wash */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(58,11,16,0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 0%, rgba(58,11,16,0.45) 0%, transparent 65%)" }} />

      {/* Slide caption + progress dots — bottom right (desktop only) */}
      <div className="absolute bottom-8 right-8 lg:right-16 hidden md:flex flex-col items-end gap-3 pointer-events-none z-10">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/55">{SLIDES[idx].caption}</div>
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-px transition-all duration-500 ${
                i === idx ? "w-8 bg-copper" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
