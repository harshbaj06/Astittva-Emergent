import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Authentic Kolkata landmarks (per brand brief).
// City Centre 2 explicitly removed per user request.
const SLIDES = [
  { src: "/images/biswa-bangla-hero.png", caption: "Biswa Bangla Gate · New Town" },
  { src: "/images/howrah-bridge.png", caption: "Rabindra Setu · Howrah Bridge" },
  { src: "/images/victoria-memorial.png", caption: "Victoria Memorial · Kolkata" },
  { src: "/images/eco-park-kolkata.png", caption: "Eco Park · New Town" },
  { src: "/images/new-town-skyline.png", caption: "New Town Skyline" },
];

// Timing brief: image visible ~4s, crossfade ~1s, total cycle 5s.
const VISIBLE_MS = 4000;
const FADE_MS = 1000;
const CYCLE_MS = VISIBLE_MS + FADE_MS; // 5000

export default function CinematicHero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), CYCLE_MS);
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
            opacity: { duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: (CYCLE_MS + FADE_MS) / 1000, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <img
            src={SLIDES[idx].src}
            alt={SLIDES[idx].caption}
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "low"}
            className="w-full h-full object-cover"
            style={{ filter: "saturate(1.08) contrast(1.04) brightness(0.96)" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* TOP burgundy glow — replaces the previous heavy left wash so landmark photography stays clear */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(90,10,20,0.30) 0%, rgba(90,10,20,0.15) 30%, transparent 70%)",
        }}
      />
      {/* Subtle left text-area wash so hero copy remains readable, lighter than before */}
      <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#0a0306]/65 via-[#0a0306]/30 to-transparent pointer-events-none" />
      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#050505] pointer-events-none" />

      {/* Slide caption + progress dots — bottom right (desktop only) */}
      <div className="absolute bottom-8 right-8 lg:right-16 hidden md:flex flex-col items-end gap-3 pointer-events-none z-10">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/65">{SLIDES[idx].caption}</div>
        <div className="flex gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.src}
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
