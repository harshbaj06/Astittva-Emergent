/**
 * Sitewide ambient — LIGHT THEME edition.
 * Soft warm cream wash anchored at the top of every page. Provides brand mood
 * without obscuring photography. Same component is used by every public page.
 */
export default function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[820px] overflow-hidden">
      {/* Soft warm cream wash from the top */}
      <div
        className="absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,241,236,0.85) 0%, rgba(250,248,245,0.5) 35%, transparent 70%)",
        }}
      />
      {/* Subtle copper top-centre halo */}
      <div
        className="absolute left-1/2 top-[-10%] w-[70%] h-[55%] -translate-x-1/2 rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, rgba(184,115,51,0.18) 0%, transparent 60%)" }}
      />
      {/* Maroon whisper on the right edge */}
      <div
        className="absolute right-[-5%] top-[5%] w-[35%] h-[40%] rounded-full blur-[160px] opacity-20"
        style={{ background: "radial-gradient(circle, rgba(94,31,40,0.18) 0%, transparent 65%)" }}
      />
    </div>
  );
}
