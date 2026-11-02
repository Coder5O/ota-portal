import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/StatusPill";
import { fmtDate, fmtDateTime } from "@/lib/format";

export function ResolutionCard({ record, authority, canDecide, onEdit, onSubmit, onDecide, busy }) {
  const editable = ["Draft", "Returned"].includes(record.status);
  const versions = Array.isArray(record.versions) ? record.versions : [];

  return (
    <article className="border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-snug">{record.title}</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Version {record.version || "1.0"}
            {record.submitted_date ? ` · submitted ${fmtDate(record.submitted_date)}` : ""}
            {record.approval_authority ? ` · ${record.approval_authority}` : ""}
          </p>
        </div>
        <StatusPill status={record.status} />
      </div>

      {record.text ? (
        <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-foreground/80">{record.text}</p>
      ) : null}

      {record.decision_note ? (
        <p className="mt-3 border-l-2 border-border pl-3 text-[12px] leading-relaxed text-muted-foreground">
          Decision note: {record.decision_note}
        </p>
      ) : null}

      {record.responsible_officer || record.deadline ? (
        <p className="mt-3 text-[11.5px] text-muted-foreground">
          {record.responsible_officer ? `Responsible: ${record.responsible_officer}` : ""}
          {record.deadline ? `${record.responsible_officer ? " · " : ""}Due ${fmtDate(record.deadline)}` : ""}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {editable ? (
          <>
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => onEdit(record)} disabled={busy}>
              Edit draft
            </Button>
            <Button size="sm" className="rounded-none" onClick={() => onSubmit(record)} disabled={busy}>
              Submit for approval
            </Button>
          </>
        ) : null}
        {record.status === "Submitted" ? (
          <>
            <Button
              size="sm"
              className="rounded-none"
              onClick={() => onDecide(record, "Approved")}
              disabled={busy || !canDecide}
              title={canDecide ? "" : `Only the ${authority || "configured authority"} may approve this record`}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => onDecide(record, "Returned")}
              disabled={busy || !canDecide}
            >
              Return for revision
            </Button>
          </>
        ) : null}
      </div>

      {record.status === "Submitted" && !canDecide ? (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          Awaiting the {authority || "configured authority"}; your account cannot decide this record.
        </p>
      ) : null}

      {versions.length ? (
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Version record ({versions.length})
          </summary>
          <ul className="mt-2 space-y-1.5">
            {versions.map((entry, index) => (
              <li key={`${entry.version}-${index}`} className="text-[11.5px] leading-relaxed text-muted-foreground">
                <span className="text-foreground">v{entry.version}</span> · {entry.status} ·{" "}
                {entry.approval_authority || "—"} · {fmtDateTime(entry.recorded_at || entry.approval_date)}
                {entry.note ? ` · ${entry.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}