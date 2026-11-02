import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { institutionList, saveReport, submitReport, decideReport } from "@/lib/institution-fns";
import { InstitutionShell, DecisionAuthorityNote } from "@/components/institution/InstitutionShell";
import { RecordDialog } from "@/components/institution/RecordDialog";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/reports")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reports — Structure dashboard" }] }),
  component: ReportsPage,
});

const FIELDS = [
  { name: "title", label: "Report", required: true, full: true },
  { name: "period", label: "Reporting period", description: "e.g. Q3 2026" },
  { name: "progress", label: "Reported progress (%)", type: "number" },
  { name: "visibility", label: "Visibility", type: "select", options: ["internal", "public"] },
  { name: "summary", label: "Summary", type: "textarea", rows: 8, full: true },
];

const DECISION_FIELDS = [{ name: "note", label: "Decision note", type: "textarea", rows: 4, full: true }];

const blank = () => ({ title: "", period: "", progress: 0, visibility: "internal", summary: "" });

function ReportsPage() {
  const { meta, structure } = useInstitutionContext();
  const list = useServerFn(institutionList);
  const save = useServerFn(saveReport);
  const submitFn = useServerFn(submitReport);
  const decide = useServerFn(decideReport);
  const queryClient = useQueryClient();

  const [values, setValues] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [decision, setDecision] = useState(null);
  const [decisionNote, setDecisionNote] = useState({ note: "" });
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState("");

  const query = useQuery({
    queryKey: ["institution-reports", structure],
    queryFn: () => list({ data: { slug: structure, kind: "reports" } }),
    enabled: !!structure,
  });

  const rule = useMemo(
    () => (meta?.rules || []).find((item) => item.institution_slug === structure && item.record_type === "Reports"),
    [meta, structure],
  );

  const canDecide = useMemo(() => {
    if (!rule?.confirmed) return false;
    if (meta?.isAdmin) return true;
    const mine = (meta?.user?.approval_authority || "").trim().toLowerCase();
    return !!mine && mine === (rule?.approving_authority || "").trim().toLowerCase();
  }, [meta, rule]);

  const items = useMemo(() => {
    const rows = query.data?.items || [];
    const needle = term.trim().toLowerCase();
    return needle ? rows.filter((row) => String(row.title || "").toLowerCase().includes(needle)) : rows;
  }, [query.data, term]);

  const open = (record) => {
    setEditingId(record?.id || "");
    setValues(
      record
        ? {
            title: record.title || "",
            period: record.period || "",
            progress: Number(record.progress || 0),
            visibility: record.visibility || "internal",
            summary: record.summary || "",
          }
        : blank(),
    );
  };

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { ...values, id: editingId || undefined, slug: structure, progress: Number(values.progress || 0) } });
      await queryClient.invalidateQueries();
      toast.success(editingId ? "Report updated." : "Report prepared.");
      setValues(null);
    } finally {
      setBusy(false);
    }
  };

  const send = async (record) => {
    setBusy(true);
    try {
      await submitFn({ data: { id: record.id } });
      await queryClient.invalidateQueries();
      toast.success("Report submitted for approval.");
    } catch (error) {
      toast.error(error?.message || "The report could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  const submitDecision = async () => {
    setBusy(true);
    try {
      await decide({ data: { id: decision.record.id, decision: decision.next, note: decisionNote.note || "" } });
      await queryClient.invalidateQueries();
      toast.success(decision.next === "Approved" ? "Report approved." : "Report returned.");
      setDecision(null);
    } catch (error) {
      toast.error(error?.message || "The decision could not be recorded.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <InstitutionShell
      meta={meta}
      structure={structure}
      active="reports"
      title="Reports"
      description="Progress reported by the structure, submitted for approval and held as a controlled record."
      action={
        <Button size="sm" className="rounded-none" onClick={() => open(null)}>
          <Plus className="mr-1.5 h-4 w-4" /> Prepare report
        </Button>
      }
    >
      <div className="mb-3">
        <DecisionAuthorityNote rule={rule} label="report" />
      </div>

      <div className="mb-4">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search reports"
          className="h-9 max-w-xs rounded-none text-[13px]"
        />
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading reports…</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-xl leading-snug">{item.title}</h3>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  {item.period || "Period not stated"}
                  {item.submitted_date ? ` · submitted ${fmtDate(item.submitted_date)}` : ""}
                  {item.approval_authority ? ` · ${item.approval_authority}` : ""}
                </p>
              </div>
              <StatusPill status={item.status} />
            </div>

            <div className="mt-3 h-1.5 w-full bg-secondary">
              <div className="h-1.5 bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, Number(item.progress || 0))}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{Number(item.progress || 0)}% reported progress</p>

            {item.summary ? (
              <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/80">{item.summary}</p>
            ) : null}

            {item.decision_note ? (
              <p className="mt-2 border-l-2 border-border pl-3 text-[12px] leading-relaxed text-muted-foreground">
                Decision note: {item.decision_note}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {["Draft", "Returned"].includes(item.status) ? (
                <>
                  <Button variant="outline" size="sm" className="rounded-none" onClick={() => open(item)} disabled={busy}>
                    Edit
                  </Button>
                  <Button size="sm" className="rounded-none" onClick={() => send(item)} disabled={busy}>
                    Submit for approval
                  </Button>
                </>
              ) : null}
              {item.status === "Submitted" ? (
                <>
                  <Button
                    size="sm"
                    className="rounded-none"
                    disabled={busy || !canDecide}
                    onClick={() => {
                      setDecision({ record: item, next: "Approved" });
                      setDecisionNote({ note: "" });
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    disabled={busy || !canDecide}
                    onClick={() => {
                      setDecision({ record: item, next: "Returned" });
                      setDecisionNote({ note: "" });
                    }}
                  >
                    Return
                  </Button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {!query.isLoading && !items.length ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No report has been prepared by this structure.
        </p>
      ) : null}

      <RecordDialog
        open={values !== null}
        onOpenChange={(next) => {
          if (!next) setValues(null);
        }}
        title={editingId ? "Update report" : "Prepare a report"}
        fields={FIELDS}
        values={values || {}}
        setValues={setValues}
        onSubmit={submit}
        busy={busy}
        submitLabel={editingId ? "Update report" : "Save draft"}
      />

      <RecordDialog
        open={decision !== null}
        onOpenChange={(next) => {
          if (!next) setDecision(null);
        }}
        title={decision?.next === "Approved" ? "Approve this report" : "Return this report"}
        fields={DECISION_FIELDS}
        values={decisionNote}
        setValues={setDecisionNote}
        onSubmit={submitDecision}
        busy={busy}
        submitLabel={decision?.next === "Approved" ? "Approve" : "Return"}
      />
    </InstitutionShell>
  );
}