import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { institutionList, saveResolution, submitResolution, decideResolution } from "@/lib/institution-fns";
import { InstitutionShell, DecisionAuthorityNote } from "@/components/institution/InstitutionShell";
import { RecordDialog } from "@/components/institution/RecordDialog";
import { ResolutionCard } from "@/components/institution/ResolutionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/resolutions")({
  ssr: false,
  head: () => ({ meta: [{ title: "Resolutions — Structure dashboard" }] }),
  component: ResolutionsPage,
});

const FIELDS = [
  { name: "title", label: "Resolution", required: true, full: true },
  { name: "text", label: "Decision text", type: "textarea", rows: 8, full: true },
  { name: "responsible_officer", label: "Responsible officer" },
  { name: "deadline", label: "Implementation deadline", type: "date" },
  { name: "visibility", label: "Visibility", type: "select", options: ["internal", "public"] },
];

const DECISION_FIELDS = [{ name: "note", label: "Decision note", type: "textarea", rows: 4, full: true }];

const blank = () => ({ title: "", text: "", responsible_officer: "", deadline: "", visibility: "internal" });

function ResolutionsPage() {
  const { meta, structure } = useInstitutionContext();
  const list = useServerFn(institutionList);
  const save = useServerFn(saveResolution);
  const submitForApproval = useServerFn(submitResolution);
  const decide = useServerFn(decideResolution);
  const queryClient = useQueryClient();

  const [values, setValues] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [decision, setDecision] = useState(null);
  const [decisionNote, setDecisionNote] = useState({ note: "" });
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");

  const query = useQuery({
    queryKey: ["institution-resolutions", structure, status],
    queryFn: () => list({ data: { slug: structure, kind: "resolutions", status } }),
    enabled: !!structure,
  });

  const rule = useMemo(
    () => (meta?.rules || []).find((item) => item.institution_slug === structure && item.record_type === "Resolutions"),
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
            text: record.text || "",
            responsible_officer: record.responsible_officer || "",
            deadline: record.deadline ? String(record.deadline).slice(0, 10) : "",
            visibility: record.visibility || "internal",
          }
        : blank(),
    );
  };

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { ...values, id: editingId || undefined, slug: structure } });
      await queryClient.invalidateQueries();
      toast.success(editingId ? "Draft updated." : "Draft recorded.");
      setValues(null);
    } finally {
      setBusy(false);
    }
  };

  const sendForApproval = async (record) => {
    setBusy(true);
    try {
      await submitForApproval({ data: { id: record.id } });
      await queryClient.invalidateQueries();
      toast.success("Submitted for approval.");
    } catch (error) {
      toast.error(error?.message || "The decision could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  const openDecision = (record, next) => {
    setDecision({ record, next });
    setDecisionNote({ note: "" });
  };

  const submitDecision = async () => {
    setBusy(true);
    try {
      await decide({ data: { id: decision.record.id, decision: decision.next, note: decisionNote.note || "" } });
      await queryClient.invalidateQueries();
      toast.success(decision.next === "Approved" ? "Decision approved and versioned." : "Returned for revision.");
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
      active="resolutions"
      title="Resolutions"
      description="Proposals prepared by the structure, submitted to the recorded authority, and approved as controlled versions."
      action={
        <Button size="sm" className="rounded-none" onClick={() => open(null)}>
          <Plus className="mr-1.5 h-4 w-4" /> Record resolution
        </Button>
      }
    >
      <div className="mb-3">
        <DecisionAuthorityNote rule={rule} label="resolution" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search resolutions"
          className="h-9 max-w-xs rounded-none text-[13px]"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 border border-input bg-transparent px-2 text-[12.5px]"
        >
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Returned">Returned</option>
          <option value="Approved">Approved</option>
          <option value="Implemented">Implemented</option>
        </select>
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading resolutions…</p> : null}

      <div className="space-y-3">
        {items.map((item) => (
          <ResolutionCard
            key={item.id}
            record={item}
            authority={rule?.approving_authority}
            canDecide={canDecide}
            busy={busy}
            onEdit={open}
            onSubmit={sendForApproval}
            onDecide={openDecision}
          />
        ))}
      </div>

      {!query.isLoading && !items.length ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No resolution is recorded for this structure.
        </p>
      ) : null}

      <RecordDialog
        open={values !== null}
        onOpenChange={(next) => {
          if (!next) setValues(null);
        }}
        title={editingId ? "Update draft resolution" : "Record a resolution"}
        description="A draft can be revised freely. Once submitted and approved it becomes a controlled version."
        notice={rule?.confirmed ? `Decisions rest with the ${rule.approving_authority}.` : "No confirmed decision rule is recorded for this structure yet; drafts can still be prepared."}
        fields={FIELDS}
        values={values || {}}
        setValues={setValues}
        onSubmit={submit}
        busy={busy}
        submitLabel={editingId ? "Update draft" : "Save draft"}
      />

      <RecordDialog
        open={decision !== null}
        onOpenChange={(next) => {
          if (!next) setDecision(null);
        }}
        title={decision?.next === "Approved" ? "Approve this resolution" : "Return for revision"}
        description={
          decision?.next === "Approved"
            ? "Approval records the authority, date and a new controlled version."
            : "A returned resolution goes back to the structure for revision."
        }
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