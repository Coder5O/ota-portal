import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { institutionData } from "@/lib/institution-fns";
import { InstitutionShell, DecisionAuthorityNote } from "@/components/institution/InstitutionShell";
import { StatTile } from "@/components/institution/StatTile";
import { StatusPill } from "@/components/admin/StatusPill";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { structureLabel, useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/")({
  ssr: false,
  head: () => ({ meta: [{ title: "Structure dashboard — Ovaherero Traditional Authority" }] }),
  component: OverviewPage,
});

function Row({ children }) {
  return <li className="border-b border-border py-2.5 last:border-0">{children}</li>;
}

function Empty({ children }) {
  return <p className="border border-dashed border-border px-3 py-4 text-[12.5px] text-muted-foreground">{children}</p>;
}

function OverviewPage() {
  const { meta, structure } = useInstitutionContext();
  const load = useServerFn(institutionData);
  const query = useQuery({
    queryKey: ["institution-overview", structure],
    queryFn: () => load({ data: { slug: structure } }),
    enabled: !!structure,
  });
  const data = query.data;
  const rules = data?.rules || [];
  const resolutionRule = rules.find((rule) => rule.record_type === "Resolutions");

  return (
    <InstitutionShell
      meta={meta}
      structure={structure}
      active="overview"
      title={`${structureLabel(structure)} at a glance`}
      description="Meetings, decisions, action items and reports held for this structure, with the decision authority recorded by the Authority."
    >
      {query.isLoading ? (
        <p className="text-[13px] text-muted-foreground">Loading the structure's records…</p>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Meetings scheduled" value={data.counts.meetings} hint="Convened or upcoming" />
            <StatTile label="Awaiting decision" value={data.counts.pending} hint="Drafts, submissions and returns" />
            <StatTile label="Open action items" value={data.counts.tasks} hint="Open or in progress" />
            <StatTile label="Decisions approved" value={data.counts.approved} hint="Controlled versions on record" />
          </div>

          <div className="mt-6">
            <DecisionAuthorityNote rule={resolutionRule} label="resolution" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl">Awaiting a decision</h3>
                <Link to="/institution/resolutions" search={{ structure }} className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground hover:text-[hsl(var(--primary))]">
                  All resolutions
                </Link>
              </div>
              <ul className="mt-2">
                {(data.resolutions || []).length ? (
                  data.resolutions.map((item) => (
                    <Row key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] leading-snug">{item.title}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.submitted_by ? `Submitted by ${item.submitted_by} · ` : ""}
                        {fmtDate(item.submitted_date)}
                      </p>
                    </Row>
                  ))
                ) : (
                  <Empty>No decision is awaiting action.</Empty>
                )}
              </ul>
            </section>

            <section>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl">Meetings</h3>
                <Link to="/institution/meetings" search={{ structure }} className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground hover:text-[hsl(var(--primary))]">
                  All meetings
                </Link>
              </div>
              <ul className="mt-2">
                {(data.meetings || []).length ? (
                  data.meetings.map((item) => (
                    <Row key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] leading-snug">{item.title}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {fmtDateTime(item.starts_at)}
                        {item.venue ? ` · ${item.venue}` : ""}
                      </p>
                    </Row>
                  ))
                ) : (
                  <Empty>No meeting is scheduled.</Empty>
                )}
              </ul>
            </section>

            <section>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl">Action items</h3>
                <Link to="/institution/tasks" search={{ structure }} className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground hover:text-[hsl(var(--primary))]">
                  All action items
                </Link>
              </div>
              <ul className="mt-2">
                {(data.tasks || []).length ? (
                  data.tasks.map((item) => (
                    <Row key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] leading-snug">{item.title}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.owner_name || "Unassigned"}
                        {item.due_date ? ` · due ${fmtDate(item.due_date)}` : ""}
                      </p>
                    </Row>
                  ))
                ) : (
                  <Empty>No open action item.</Empty>
                )}
              </ul>
            </section>

            <section>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl">Reports</h3>
                <Link to="/institution/reports" search={{ structure }} className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground hover:text-[hsl(var(--primary))]">
                  All reports
                </Link>
              </div>
              <ul className="mt-2">
                {(data.reports || []).length ? (
                  data.reports.map((item) => (
                    <Row key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] leading-snug">{item.title}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.period || "Period not stated"}
                        {item.approval_authority ? ` · ${item.approval_authority}` : ""}
                      </p>
                    </Row>
                  ))
                ) : (
                  <Empty>No report has been prepared.</Empty>
                )}
              </ul>
            </section>
          </div>

          <section className="mt-8 border border-border bg-card p-4 sm:p-5">
            <h3 className="font-display text-xl">Decision rules for this structure</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Recorded by the Authority's governance administrator. Nothing here is inferred by the platform.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["Meetings", "Resolutions", "Reports", "Tasks"].map((type) => {
                const rule = rules.find((item) => item.record_type === type);
                return (
                  <div key={type} className="border border-border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-medium">{type}</p>
                      <span
                        className={`text-[10px] uppercase tracking-[0.12em] ${
                          rule?.confirmed ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {rule?.confirmed ? "Confirmed" : rule ? "Not confirmed" : "Not recorded"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                      {rule ? `${rule.approving_authority} · ${rule.submitter_role}` : "No rule recorded."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </InstitutionShell>
  );
}