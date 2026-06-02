/**
 * Sitewide luxury burgundy ambient overlay.
 * TOP-anchored gradient — every page (Home, Properties, Market Intelligence, About, Contact)
 * inherits the same brand mood. No heavy left wash that obstructs imagery.
 */
export default function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[820px] overflow-hidden">
      {/* Primary top burgundy gradient — same recipe used inside CinematicHero */}
      <div
        className="absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(90,10,20,0.30) 0%, rgba(90,10,20,0.15) 30%, transparent 70%)",
        }}
      />
      {/* Soft copper sheen — top center, very subtle */}
      <div
        className="absolute left-1/2 top-[-12%] w-[70%] h-[55%] -translate-x-1/2 rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, rgba(198,134,66,0.18) 0%, transparent 60%)" }}
      />
      {/* Fade-out into page background */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#050505]" />
    </div>
  );
}
