import { useEffect, useState, useRef } from "react";

// Authentic Kolkata landmarks (per brand brief). City Centre 2 explicitly removed.
const SLIDES = [
  { src: "/images/biswa-bangla-hero.png", caption: "Biswa Bangla Gate · New Town" },
  { src: "/images/howrah-bridge.png", caption: "Rabindra Setu · Howrah Bridge" },
  { src: "/images/victoria-memorial.png", caption: "Victoria Memorial · Kolkata" },
  { src: "/images/eco-park-kolkata.png", caption: "Eco Park · New Town" },
  { src: "/images/new-town-skyline.png", caption: "New Town Skyline" },
];

const VISIBLE_MS = 4000;
const FADE_MS = 1000;
const CYCLE_MS = VISIBLE_MS + FADE_MS;

export default function CinematicHero() {
  const [idx, setIdx] = useState(0);
  const preloaded = useRef(new Set());

  // Preload ALL images immediately on mount so transitions never wait on network.
  useEffect(() => {
    SLIDES.forEach((s) => {
      if (preloaded.current.has(s.src)) return;
      const img = new Image();
      img.src = s.src;
      preloaded.current.add(s.src);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), CYCLE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* All slides rendered simultaneously — only opacity toggles.
          No mount/unmount → no black flash, true cross-fade. */}
      {SLIDES.map((slide, i) => {
        const active = i === idx;
        return (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              opacity: active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              // Ken Burns zoom — runs only while active, resets when slide hides
              transform: active ? "scale(1.10)" : "scale(1.04)",
              transitionProperty: "opacity, transform",
              transitionDuration: `${FADE_MS}ms, ${CYCLE_MS + FADE_MS}ms`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1), linear",
              willChange: "opacity, transform",
            }}
          >
            <img
              src={slide.src}
              alt={slide.caption}
              loading={i === 0 ? "eager" : "eager"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              className="w-full h-full object-cover"
              style={{ filter: "saturate(1.08) contrast(1.04) brightness(0.96)" }}
            />
          </div>
        );
      })}

      {/* Top burgundy glow — landmark photography stays clear */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(90,10,20,0.30) 0%, rgba(90,10,20,0.15) 30%, transparent 70%)",
        }}
      />
      {/* Subtle left wash so hero copy stays readable, lighter than before */}
      <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#0a0306]/65 via-[#0a0306]/30 to-transparent pointer-events-none" />
      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#050505] pointer-events-none" />

      {/* Slide caption + progress dots — bottom right (desktop only) */}
      <div className="absolute bottom-8 right-8 lg:right-16 hidden md:flex flex-col items-end gap-3 pointer-events-none z-10">
        <div
          className="text-[10px] tracking-[0.4em] uppercase text-white/75"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}
        >
          {SLIDES[idx].caption}
        </div>
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
