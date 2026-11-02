export const STATUS_STYLES = {
  Submitted: "border-gold/50 bg-gold/10 text-[hsl(var(--primary))]",
  "Under Review": "border-blue-200 bg-blue-50 text-blue-700",
  "More Information Required": "border-amber-300 bg-amber-50 text-amber-800",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Suspended: "border-red-200 bg-red-50 text-red-700",
  Archived: "border-border bg-secondary text-muted-foreground",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-border bg-secondary text-muted-foreground",
  hidden: "border-border bg-secondary text-muted-foreground",
  New: "border-gold/50 bg-gold/10 text-[hsl(var(--primary))]",
  "In Review": "border-blue-200 bg-blue-50 text-blue-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Closed: "border-border bg-secondary text-muted-foreground",
  Open: "border-gold/50 bg-gold/10 text-[hsl(var(--primary))]",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-700",
  Done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  Concluded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-red-200 bg-red-50 text-red-700",
};

export function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || "border-border bg-secondary text-foreground/70";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-[0.1em] ${style}`}>
      {status || "—"}
    </span>
  );
}