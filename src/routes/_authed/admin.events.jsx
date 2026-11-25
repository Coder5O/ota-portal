import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getEventRegistrationsAdmin, deleteEventRegistrationAdmin } from "@/lib/ota-fns";
import { CURATED_CALENDAR_EVENTS } from "@/lib/curated-events";
import { RecordManager } from "@/components/admin/RecordManager";
import { PageHead } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/events")({
  component: AdminEventsPage,
});

function AdminEventsPage() {
  const [activeTab, setActiveTab] = useState("rosters"); // "rosters" | "manage"
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  // Query all event registrations and aggregated attendance summary
  const registrationsQuery = useQuery({
    queryKey: ["admin-event-registrations"],
    queryFn: async () => {
      const res = await getEventRegistrationsAdmin();
      return res || { totalRegistrations: 0, totalAttendees: 0, byEvent: {}, registrations: [] };
    },
  });

  // Query custom database events to complement the 8 curated convocations
  const eventsQuery = useQuery({
    queryKey: ["admin-events-list"],
    queryFn: async () => {
      try {
        const page = await base44.entities.Event.list({ sort: "starts_at", limit: 100 });
        return page?.items || [];
      } catch {
        return [];
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEventRegistrationAdmin({ data: { id } }),
    onSuccess: () => {
      toast.success("Attendee registration removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-event-registrations"] });
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to remove registration.");
      setDeletingId(null);
    },
  });

  const data = registrationsQuery.data;
  const registrations = data?.registrations || [];
  const byEvent = data?.byEvent || {};

  // Build merged events list
  const allEvents = useMemo(() => {
    const map = new Map();
    CURATED_CALENDAR_EVENTS.forEach((e) => map.set(e.id, { ...e, is_curated: true }));
    (eventsQuery.data || []).forEach((e) => {
      if (e?.id) map.set(e.id, { ...e, is_custom: true });
    });
    return Array.from(map.values());
  }, [eventsQuery.data]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (eventFilter !== "all" && reg.event_id !== eventFilter) {
        return false;
      }
      if (search.trim()) {
        const term = search.toLowerCase();
        const name = (reg.name || "").toLowerCase();
        const email = (reg.email || "").toLowerCase();
        const phone = (reg.phone || "").toLowerCase();
        const community = (reg.community_or_region || "").toLowerCase();
        const org = (reg.organisation || "").toLowerCase();
        const title = (reg.event_title || "").toLowerCase();
        return (
          name.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          community.includes(term) ||
          org.includes(term) ||
          title.includes(term)
        );
      }
      return true;
    });
  }, [registrations, eventFilter, search]);

  // Calculate filtered headcount
  const filteredTotalAttendees = useMemo(() => {
    return filteredRegistrations.reduce((acc, r) => acc + (Number(r.attendee_count) || 1), 0);
  }, [filteredRegistrations]);

  // CSV Export handler
  const handleExportCsv = () => {
    if (filteredRegistrations.length === 0) {
      toast.info("No registrations to export.");
      return;
    }
    const filename = `OTA-Event-Attendees-${new Date().toISOString().slice(0, 10)}.csv`;
    const columns = [
      { label: "Attendee Name", value: (r) => r.name || "" },
      { label: "Email Address", value: (r) => r.email || "" },
      { label: "Telephone", value: (r) => r.phone || "" },
      { label: "Event Title", value: (r) => r.event_title || r.event_id || "" },
      { label: "Attendees Going (Headcount)", value: (r) => r.attendee_count || 1 },
      { label: "Community / Region", value: (r) => r.community_or_region || "" },
      { label: "Organisation / Clan", value: (r) => r.organisation || "" },
      { label: "Special Notes", value: (r) => r.notes || "" },
      { label: "Registration Date", value: (r) => fmtDateTime(r.created_date) },
      { label: "Status", value: (r) => r.status || "Confirmed" },
    ];
    downloadCsv(filename, columns, filteredRegistrations);
    toast.success("Attendee roster exported successfully.");
  };

  return (
    <div className="space-y-7">
      <PageHead
        title="Events & Attendee Management"
        description="Monitor verified attendee registers and headcount metrics for all official convocations, commemorations, and community assemblies."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="rounded-none border-border text-xs font-semibold uppercase tracking-wider"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-gold" /> Export Attendee Roster (CSV)
            </Button>
            <div className="flex border border-border bg-card p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("rosters")}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "rosters" ? "bg-gold text-[hsl(var(--ink))]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="mr-1 inline-block h-3.5 w-3.5" /> Attendee Rosters ({data?.totalAttendees || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manage")}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "manage" ? "bg-gold text-[hsl(var(--ink))]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays className="mr-1 inline-block h-3.5 w-3.5" /> Event Records
              </button>
            </div>
          </div>
        }
      />

      {/* ── Key Attendance Metrics ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Total People Going
            </p>
            <Users className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 font-display text-4xl text-[hsl(var(--primary))] leading-none">
            {registrationsQuery.isLoading ? "…" : data?.totalAttendees || 0}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            Total confirmed attendees across all events
          </p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Total RSVP Submissions
            </p>
            <CheckCircle2 className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 font-display text-4xl text-foreground leading-none">
            {registrationsQuery.isLoading ? "…" : data?.totalRegistrations || 0}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            Individual &amp; delegation forms submitted
          </p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Official Convocations
            </p>
            <CalendarDays className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 font-display text-4xl text-foreground leading-none">
            {allEvents.length}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            8 foundational calendar items + published
          </p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Avg Delegation Size
            </p>
            <UserCheck className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-3 font-display text-4xl text-foreground leading-none">
            {data?.totalRegistrations ? (data.totalAttendees / data.totalRegistrations).toFixed(1) : "1.0"}
          </p>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            People per registration form
          </p>
        </div>
      </div>

      {activeTab === "rosters" ? (
        <div className="space-y-7">
          {/* ── Attendance by Convocations Card Grid ─────────────────────────── */}
          <div className="border border-border bg-card p-5">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="font-display text-lg">Attendee Headcount by Convocations</h2>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Click any event to filter the roster below
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {allEvents.map((evt) => {
                const stat = byEvent[evt.id] || { total_attendees: 0, registrations_count: 0 };
                const isSelected = eventFilter === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => setEventFilter(isSelected ? "all" : evt.id)}
                    className={`text-left p-3.5 border transition-all ${
                      isSelected
                        ? "border-gold bg-gold/15 shadow-sm"
                        : "border-border/80 bg-background hover:border-gold/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight line-clamp-1">{evt.title}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                      {evt.date_display || fmtDate(evt.starts_at)}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                      <span className="text-xs font-bold text-[hsl(var(--primary))] font-display">
                        {stat.total_attendees} {stat.total_attendees === 1 ? "Person" : "People"} Going
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {stat.registrations_count} RSVP{stat.registrations_count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Filter & Search Toolbar ───────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-4">
            <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search attendee by name, email, phone, community, or notes…"
                  className="rounded-none pl-9 text-xs"
                />
              </div>

              <div className="w-64">
                <Select value={eventFilter} onValueChange={(val) => setEventFilter(val)}>
                  <SelectTrigger className="rounded-none text-xs">
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none max-h-60">
                    <SelectItem value="all">All Events ({data?.totalAttendees || 0} attending)</SelectItem>
                    {allEvents.map((evt) => {
                      const count = byEvent[evt.id]?.total_attendees || 0;
                      return (
                        <SelectItem key={evt.id} value={evt.id} className="text-xs">
                          {evt.title} ({count} going)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground font-bold">{filteredTotalAttendees} people going</span> across{" "}
              <span className="text-foreground font-bold">{filteredRegistrations.length} registrations</span>
            </div>
          </div>

          {/* ── Detailed Attendees Table ─────────────────────────────────────── */}
          <div className="border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Attendee Name</th>
                    <th className="px-4 py-3">Event Convocations</th>
                    <th className="px-4 py-3 text-center">People Going</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Community / Clan</th>
                    <th className="px-4 py-3">Registered At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        {registrations.length === 0
                          ? "No attendee registrations have been submitted yet. When visitors fill in the attendance RSVP form on the website, their details and headcount will appear here."
                          : "No attendee matches the current search or event filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const headcount = Number(reg.attendee_count) || 1;
                      return (
                        <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-foreground text-sm leading-tight">{reg.name}</p>
                            {reg.organisation ? (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{reg.organisation}</p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 max-w-[200px]">
                            <p className="font-medium text-foreground line-clamp-1">{reg.event_title || reg.event_id}</p>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                              Ref: {reg.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 border border-gold/60 bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-foreground">
                              <Users className="h-3 w-3 text-gold" />
                              {headcount} {headcount === 1 ? "Person" : "People"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[11.5px] space-y-0.5">
                            <div className="flex items-center gap-1 text-foreground/85">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{reg.phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{reg.email || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11.5px] max-w-[160px]">
                            <p className="truncate text-foreground/90">{reg.community_or_region || "General Member"}</p>
                            {reg.notes ? (
                              <p className="text-[10.5px] text-muted-foreground/80 line-clamp-1 italic mt-0.5" title={reg.notes}>
                                Note: {reg.notes}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-muted-foreground whitespace-nowrap">
                            {fmtDateTime(reg.created_date)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingId(reg.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete registration"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ── Event Records Manager View ─────────────────────────────────────── */
        <RecordManager
          bare
          entity="Event"
          label="Event"
          title="Events & calendar"
          description="Ceremonies, commemorations and meetings. Published events appear on the public calendar, and open events accept registrations."
          blank={{ status: "draft", audience: "Open to the public", registration_open: true }}
          searchField="title"
          filterField="status"
          filterOptions={["draft", "published", "cancelled", "archived"]}
          sort="starts_at"
          fields={[
            { name: "title", label: "Event title", required: true, full: true },
            { name: "starts_at", label: "Starts", type: "datetime" },
            { name: "ends_at", label: "Ends", type: "datetime" },
            { name: "venue", label: "Venue" },
            { name: "town", label: "Town or city" },
            { name: "audience", label: "Audience", type: "select", options: ["Open to the public", "Delegates", "Invitation only"] },
            { name: "organising_structure", label: "Organising structure", placeholder: "e.g. OWA(Ovaherero Womans Association)" },
            { name: "description", label: "Description", type: "textarea", rows: 5, full: true },
            { name: "cover_image", label: "Flyer or cover image", type: "file-public", accept: "image/*", full: true, description: "Promotional flyer or cover photo for this event." },
            { name: "registration_open", label: "Accept public registrations", type: "switch" },
            { name: "status", label: "Status", type: "select", options: ["draft", "published", "cancelled", "archived"] },
          ]}
          columns={[
            { key: "title", label: "Event" },
            { key: "starts_at", label: "Starts", render: (row) => fmtDateTime(row.starts_at) },
            { key: "venue", label: "Venue" },
            {
              key: "attendees",
              label: "People Going",
              render: (row) => {
                const count = byEvent[row.id]?.total_attendees || 0;
                return (
                  <span className="font-semibold text-foreground">
                    {count} attending
                  </span>
                );
              },
            },
            { key: "audience", label: "Audience" },
            { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
          ]}
        />
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Remove Attendee Registration?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This action will remove the attendee from the official event roster. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              {deleteMutation.isPending ? "Removing…" : "Remove Attendee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
