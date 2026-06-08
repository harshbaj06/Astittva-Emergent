/**
 * Astittva signature ambient glow.
 *
 * A single, near-invisible burgundy radial centered behind the header on every page.
 * Acts like premium lobby lighting — felt, not seen. No bars, no hard edges, no panels.
 *
 * Rendered once in PublicLayout, so every public page inherits the same atmosphere.
 */
export default function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] overflow-hidden"
    >
      {/* Single large feathered burgundy radial centered behind the header.
          Opacity tuned so it reads as warmth, not as a design element. */}
      <div
        className="absolute left-1/2 top-[-180px] w-[1400px] h-[640px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,31,40,0.13) 0%, rgba(94,31,40,0.07) 40%, rgba(94,31,40,0.02) 70%, transparent 100%)",
          filter: "blur(70px)",
        }}
      />
      {/* Tiny copper warmth on the same axis — keeps the glow harmonized with brand accents. */}
      <div
        className="absolute left-1/2 top-[-80px] w-[760px] h-[280px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(184,115,51,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
