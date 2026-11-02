import { fmtDateTime } from "@/lib/format";

const LABELS = {
  submitted: "Application submitted",
  confirmation_issued: "Confirmation issued",
  under_review: "Placed under review",
  request_info: "Further information requested",
  approved: "Approved",
  reject: "Rejected",
  suspend: "Suspended",
  archive: "Archived",
  reactivate: "Reopened for review",
  document_verified: "Document verified",
  document_rejected: "Document rejected",
  document_awaiting_clarification: "Document clarification requested",
};

export function ApplicationHistory({ events }) {
  if (!events?.length) return null;

  return (
    <ol className="mt-2.5 space-y-1.5 border-l border-gold/40 pl-3">
      {events.map((event) => (
        <li key={event.id} className="text-[11.5px] leading-relaxed text-foreground/65">
          <span className="font-medium text-foreground/85">{LABELS[event.action] || event.action}</span>
          <span className="text-muted-foreground"> · {fmtDateTime(event.created_date)}</span>
          {event.document_name ? <span> · {event.document_name}</span> : null}
          {event.reason ? <span> — {event.reason}</span> : null}
        </li>
      ))}
    </ol>
  );
}