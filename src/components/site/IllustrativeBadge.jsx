export function IllustrativeBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))] ${className}`}
      title="Illustrative record — not yet verified and published by the OTA administration"
    >
      Illustrative
    </span>
  );
}