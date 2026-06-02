/**
 * Sitewide luxury burgundy + copper ambient overlay.
 * Renders at the top of every public page to unify visual atmosphere.
 * Inspired by Aman / Four Seasons / Sotheby's editorial pages.
 */
export default function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[820px] overflow-hidden">
      {/* Primary burgundy ellipse — top center, large */}
      <div className="absolute inset-0 burgundy-gradient" />
      {/* Soft copper sheen — left */}
      <div className="absolute left-[-20%] top-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-25"
           style={{ background: "radial-gradient(circle, rgba(198,134,66,0.22) 0%, transparent 60%)" }} />
      {/* Deep wine pool — right */}
      <div className="absolute right-[-15%] top-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] opacity-50"
           style={{ background: "radial-gradient(circle, rgba(58,11,16,0.55) 0%, transparent 60%)" }} />
      {/* Fade to charcoal */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#050505]" />
    </div>
  );
}
