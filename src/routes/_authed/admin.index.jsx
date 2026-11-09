import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  Users,
  CalendarDays,
  MapPin,
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  ImageIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/")({
  component: AdminOverview,
});

function Stat({ label, value, to, icon: Icon, note }) {
  return (
    <Link to={to} className="group border border-border bg-card p-5 transition-colors hover:border-gold/60">
      <div className="flex items-start justify-between">
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-gold" strokeWidth={1.6} />
      </div>
      <p className="mt-4 font-display text-4xl leading-none text-[hsl(var(--primary))]">{value}</p>
      <p className="mt-2 text-[11.5px] text-muted-foreground group-hover:text-foreground/70">{note}</p>
    </Link>
  );
}

function AdminOverview() {
  const overview = useQuery({
    queryKey: ["admin-overview-enhanced"],
    queryFn: async () => {
      const [
        submitted,
        review,
        info,
        approvedApps,
        rejectedApps,
        suspendedApps,
        activeMembers,
        totalMembers,
        communities,
        leaders,
        institutions,
        openTasks,
        upcomingMeetings,
        events,
        applications,
        audits,
      ] = await Promise.all([
        base44.entities.MemberApplication.count({ status: "Submitted" }),
        base44.entities.MemberApplication.count({ status: "Under Review" }),
        base44.entities.MemberApplication.count({ status: "More Information Required" }),
        base44.entities.MemberApplication.count({ status: "Approved" }),
        base44.entities.MemberApplication.count({ status: "Rejected" }),
        base44.entities.MemberApplication.count({ status: "Suspended" }),
        base44.entities.Member.count({ status: "Active" }),
        base44.entities.Member.count({}),
        base44.entities.TraditionalCommunity.count({}),
        base44.entities.Officeholder.count({ status: "published" }),
        base44.entities.Institution.count({ status: "published" }),
        base44.entities.TaskItem.count({ status: "Open" }),
        base44.entities.Meeting.count({}),
        base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 4 }),
        base44.entities.MemberApplication.list({ sort: "-created_date", limit: 6 }),
        base44.entities.AuditLog.list({ sort: "-created_date", limit: 8 }),
      ]);

      return {
        submitted,
        review,
        info,
        approvedApps,
        rejectedApps,
        suspendedApps,
        activeMembers,
        totalMembers,
        communities,
        leaders,
        institutions,
        openTasks,
        upcomingMeetings,
        events,
        applications,
        audits,
      };
    },
  });

  const d = overview.data;
  const pending = (d?.submitted || 0) + (d?.review || 0) + (d?.info || 0);

  return (
    <>
      <PageHead
        title="Central administration console"
        description="Verified system figures and governance statistics drawn directly from the platform database. Every sensitive administrative action is logged to the immutable audit trail."
        action={
          <Button asChild className="rounded-none bg-gold px-4 text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
            <Link to="/admin/settings" search={{ tab: "images" }}>
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Customize Website Photos
            </Link>
          </Button>
        }
      />

      {/* Primary Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Registered members"
          value={overview.isLoading ? "…" : d?.activeMembers || 0}
          to="/admin/members"
          icon={Users}
          note={`${d?.totalMembers || 0} total enrolled on register`}
        />
        <Stat
          label="Pending applications"
          value={overview.isLoading ? "…" : pending}
          to="/admin/applications"
          icon={ClipboardList}
          note={`${d?.submitted || 0} new · ${d?.review || 0} in review`}
        />
        <Stat
          label="Traditional communities"
          value={overview.isLoading ? "…" : d?.communities || 0}
          to="/admin/communities"
          icon={MapPin}
          note="Homeland & diaspora chapters"
        />
        <Stat
          label="Verified leaders"
          value={overview.isLoading ? "…" : d?.leaders || 0}
          to="/admin/structure"
          icon={UserCheck}
          note={`${d?.institutions || 0} active institutional structures`}
        />
      </div>

      {/* Application Decision Breakdown */}
      <div className="mt-6 border border-border bg-card p-5">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Application Decisions Breakdown
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 border border-border/70 p-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pending Decisions</p>
              <p className="font-display text-xl text-foreground">{pending}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border/70 p-3">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Approved Applications</p>
              <p className="font-display text-xl text-foreground">{d?.approvedApps || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border/70 p-3">
            <XCircle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rejected Applications</p>
              <p className="font-display text-xl text-foreground">{d?.rejectedApps || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border/70 p-3">
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Suspended Applications</p>
              <p className="font-display text-xl text-foreground">{d?.suspendedApps || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Column Feeds */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Latest Applications */}
        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="font-display text-lg">Latest applications</h2>
            <Link
              to="/admin/applications"
              className="flex items-center gap-1 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
            >
              Review all <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(d?.applications?.items || []).length === 0 ? (
              <li className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                No applications registered yet.
              </li>
            ) : (
              (d?.applications?.items || []).map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{app.full_name}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {app.reference} · {fmtDate(app.created_date)} {app.category ? `· ${app.category}` : ""}
                    </p>
                  </div>
                  <StatusPill status={app.status} />
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Recent Authorized Admin Actions */}
        <section className="border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <h2 className="font-display text-lg">Authorized administrative actions</h2>
            </div>
            <Link
              to="/admin/audit"
              className="flex items-center gap-1 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
            >
              Audit log <ArrowRight className="h-3 w-3" />
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {(d?.audits?.items || []).length === 0 ? (
              <li className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                No administrative actions recorded yet.
              </li>
            ) : (
              (d?.audits?.items || []).map((entry) => (
                <li key={entry.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[12px] font-medium text-foreground/85">{entry.action}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {fmtDateTime(entry.created_date)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {entry.actor_email} ({entry.actor_role}) {entry.detail ? `— ${entry.detail}` : ""}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Published Events & Meetings */}
      <section className="mt-6 border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" />
            <h2 className="font-display text-lg">Upcoming meetings & published events</h2>
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/meetings"
              className="flex items-center gap-1 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
            >
              Meetings ({d?.upcomingMeetings || 0}) <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/admin/events"
              className="flex items-center gap-1 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
            >
              Events <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </header>
        <ul className="divide-y divide-border">
          {(d?.events?.items || []).length === 0 ? (
            <li className="px-5 py-8 text-center text-[13px] text-muted-foreground">
              No events published on the calendar.
            </li>
          ) : (
            (d?.events?.items || []).map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium">{event.title}</p>
                  <p className="text-[11.5px] text-muted-foreground">
                    Organised by {event.organising_structure || "Ovaherero Traditional Authority"}
                  </p>
                </div>
                <p className="text-[11.5px] text-muted-foreground">
                  {fmtDate(event.starts_at)} · {event.venue || "Venue to be announced"}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  );
}
