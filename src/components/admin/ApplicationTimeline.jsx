import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fmtDateTime } from "@/lib/format";

const LABELS = {
  submitted: "Application submitted",
  confirmation_issued: "Confirmation issued",
  under_review: "Review opened",
  request_info: "Further information requested",
  approved: "Approved",
  reject: "Rejected",
  suspend: "Suspended",
  archive: "Archived",
  reactivate: "Reopened for review",
  document_verified: "Document verified",
  document_rejected: "Document rejected",
  document_awaiting_clarification: "Document awaiting clarification",
};

export function ApplicationTimeline({ applicationId, limit = 40 }) {
  const events = useQuery({
    queryKey: ["application-events", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const page = await base44.entities.ApplicationEvent.filter(
        { application_id: applicationId },
        { sort: "created_date", limit },
      );
      return page.items || [];
    },
  });

  const rows = events.data || [];

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Status history</p>
      {events.isLoading ? (
        <p className="mt-2 text-[12px] text-muted-foreground">Loading history…</p>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-[12px] text-muted-foreground">No recorded actions yet.</p>
      ) : (
        <ol className="mt-2 space-y-2.5 border-l border-border pl-4">
          {rows.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
              <p className="text-[12.5px] font-medium">{LABELS[event.action] || event.action}</p>
              <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                {fmtDateTime(event.created_date)}
                {event.actor_email && event.actor_email !== "public" ? ` · ${event.actor_email}` : ""}
                {event.authority ? ` · ${event.authority}` : ""}
              </p>
              {event.reason ? (
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-foreground/70">{event.reason}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}