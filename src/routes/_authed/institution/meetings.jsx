import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { institutionList, saveMeeting } from "@/lib/institution-fns";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { RecordDialog } from "@/components/institution/RecordDialog";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDateTime } from "@/lib/format";
import { useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/meetings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Meetings — Structure dashboard" }] }),
  component: MeetingsPage,
});

const FIELDS = [
  { name: "title", label: "Meeting title", required: true, full: true },
  { name: "meeting_type", label: "Type", type: "select", options: ["Ordinary", "Extraordinary", "Special", "Ceremonial"] },
  { name: "status", label: "Status", type: "select", options: ["Scheduled", "Concluded", "Cancelled"] },
  { name: "starts_at", label: "Date and time", type: "datetime", required: true },
  { name: "venue", label: "Venue" },
  { name: "visibility", label: "Visibility", type: "select", options: ["internal", "public"] },
  { name: "agenda", label: "Agenda", type: "list", full: true, description: "One item per line." },
  { name: "attendance", label: "Attendance", type: "list", full: true, description: "Names of those present." },
  { name: "apologies", label: "Apologies", type: "list", full: true },
  { name: "quorum_note", label: "Quorum basis", full: true, description: "Record the basis used; the platform does not set quorum rules." },
  { name: "minutes", label: "Minutes", type: "textarea", rows: 8, full: true },
];

const blank = () => ({
  title: "",
  meeting_type: "Ordinary",
  status: "Scheduled",
  starts_at: "",
  venue: "",
  visibility: "internal",
  agenda: [],
  attendance: [],
  apologies: [],
  quorum_note: "",
  minutes: "",
});

const toISO = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

function MeetingsPage() {
  const { meta, structure } = useInstitutionContext();
  const list = useServerFn(institutionList);
  const save = useServerFn(saveMeeting);
  const queryClient = useQueryClient();

  const [values, setValues] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [term, setTerm] = useState("");

  const query = useQuery({
    queryKey: ["institution-meetings", structure, status],
    queryFn: () => list({ data: { slug: structure, kind: "meetings", status } }),
    enabled: !!structure,
  });

  const items = useMemo(() => {
    const rows = query.data?.items || [];
    const needle = term.trim().toLowerCase();
    return needle ? rows.filter((row) => String(row.title || "").toLowerCase().includes(needle)) : rows;
  }, [query.data, term]);

  const open = (record) => {
    setError("");
    setEditingId(record?.id || "");
    setValues(
      record
        ? {
            title: record.title || "",
            meeting_type: record.meeting_type || "Ordinary",
            status: record.status || "Scheduled",
            starts_at: record.starts_at ? String(record.starts_at).slice(0, 16) : "",
            venue: record.venue || "",
            visibility: record.visibility || "internal",
            agenda: record.agenda || [],
            attendance: record.attendance || [],
            apologies: record.apologies || [],
            quorum_note: record.quorum_note || "",
            minutes: record.minutes || "",
          }
        : blank(),
    );
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await save({
        data: {
          ...values,
          id: editingId || undefined,
          slug: structure,
          starts_at: toISO(values.starts_at) || new Date().toISOString(),
          agenda: values.agenda || [],
          attendance: values.attendance || [],
          apologies: values.apologies || [],
        },
      });
      await queryClient.invalidateQueries();
      toast.success(editingId ? "Meeting updated." : "Meeting recorded.");
      setValues(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <InstitutionShell
      meta={meta}
      structure={structure}
      active="meetings"
      title="Meetings"
      description="Convene meetings of this structure and record agendas, attendance, apologies, quorum basis and minutes."
      action={
        <Button size="sm" className="rounded-none" onClick={() => open(null)}>
          <Plus className="mr-1.5 h-4 w-4" /> Record meeting
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search meetings"
          className="h-9 max-w-xs rounded-none text-[13px]"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 border border-input bg-transparent px-2 text-[12.5px]"
        >
          <option value="">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Concluded">Concluded</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading meetings…</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-xl leading-snug">{item.title}</h3>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  {item.meeting_type} · {fmtDateTime(item.starts_at)}
                  {item.venue ? ` · ${item.venue}` : ""} · {item.visibility === "public" ? "Public" : "Internal"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={item.status} />
                <Button variant="outline" size="sm" className="rounded-none" onClick={() => open(item)}>
                  Open
                </Button>
              </div>
            </div>
            {(item.agenda || []).length ? (
              <details className="mt-3 border-t border-border pt-2">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Agenda ({item.agenda.length})
                </summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12.5px] leading-relaxed text-foreground/80">
                  {item.agenda.map((entry, index) => (
                    <li key={`${item.id}-agenda-${index}`}>{entry}</li>
                  ))}
                </ol>
              </details>
            ) : null}
            {(item.attendance || []).length || (item.apologies || []).length ? (
              <p className="mt-3 text-[11.5px] text-muted-foreground">
                {(item.attendance || []).length ? `Present: ${item.attendance.length}` : ""}
                {(item.apologies || []).length ? `${(item.attendance || []).length ? " · " : ""}Apologies: ${item.apologies.length}` : ""}
                {item.quorum_note ? ` · ${item.quorum_note}` : ""}
              </p>
            ) : null}
            {item.minutes ? (
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Minutes
                </summary>
                <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/80">{item.minutes}</p>
              </details>
            ) : null}
          </article>
        ))}
      </div>

      {!query.isLoading && !items.length ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No meeting is on record for this structure.
        </p>
      ) : null}

      <RecordDialog
        open={values !== null}
        onOpenChange={(next) => {
          if (!next) setValues(null);
        }}
        title={editingId ? "Update meeting" : "Record a meeting"}
        description="Quorum, proxy and voting rules are recorded as configured by the Authority — never assumed by the platform."
        fields={FIELDS}
        values={values || {}}
        setValues={setValues}
        onSubmit={submit}
        busy={busy}
        error={error}
        submitLabel={editingId ? "Update meeting" : "Record meeting"}
      />
    </InstitutionShell>
  );
}