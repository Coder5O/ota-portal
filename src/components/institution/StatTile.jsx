export function StatTile({ label, value, hint }) {
  return (
    <div className="border border-border bg-card px-4 py-4">
      <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-3xl leading-none">{value}</p>
      {hint ? <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}