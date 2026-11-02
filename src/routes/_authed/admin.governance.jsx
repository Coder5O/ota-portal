import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordDialog } from "@/components/institution/RecordDialog";
import { Button } from "@/components/ui/button";
import { governanceRules, saveGovernanceRule } from "@/lib/institution-fns";
import { INSTITUTIONS } from "@/lib/institutions";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/governance")({
  ssr: false,
  component: GovernancePage,
});

const RECORD_TYPES = ["Meetings", "Resolutions", "Reports", "Tasks"];

const FIELDS = [
  { name: "approving_authority", label: "Approving authority", required: true, full: true, description: "The office or structure that may decide records of this type." },
  { name: "submitter_role", label: "Prepared by", type: "select", options: ["Structure officer", "Structure head", "Secretariat"] },
  { name: "approval_required", label: "Approval required", type: "switch", description: "Records require an approval step before they are final." },
  { name: "confirmed", label: "Provision confirmed", type: "switch", description: "Turn on only once the applicable provision has been formally confirmed." },
  { name: "notes", label: "Guidance for reviewers", type: "textarea", rows: 3, full: true },
];

function GovernancePage() {
  const load = useServerFn(governanceRules);
  const save = useServerFn(saveGovernanceRule);
  const queryClient = useQueryClient();
  const [structure, setStructure] = useState(INSTITUTIONS[0].slug);
  const [values, setValues] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);

  const query = useQuery({ queryKey: ["governance-rules"], queryFn: () => load() });
  const rules = query.data?.rules || [];

  const open = (recordType) => {
    const existing = rules.find((rule) => rule.institution_slug === structure && rule.record_type === recordType);
    setEditingId(existing?.id || "");
    setValues({
      approving_authority: existing?.approving_authority || "",
      submitter_role: existing?.submitter_role || "Structure officer",
      approval_required: existing ? !!existing.approval_required : true,
      confirmed: existing ? !!existing.confirmed : false,
      notes: existing?.notes || "",
      record_type: recordType,
    });
  };

  const submit = async () => {
    setBusy(true);
    try {
      await save({
        data: {
          id: editingId || undefined,
          institution_slug: structure,
          record_type: values.record_type,
          approving_authority: values.approving_authority,
          submitter_role: values.submitter_role,
          approval_required: !!values.approval_required,
          confirmed: !!values.confirmed,
          notes: values.notes || "",
        },
      });
      await queryClient.invalidateQueries();
      toast.success(values.confirmed ? "Rule recorded and confirmed." : "Rule recorded.");
      setValues(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead
        title="Governance rules"
        description="Who decides what, per structure. Approval stays closed for any type whose rule is not recorded and confirmed here — the platform never supplies a governance rule of its own."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Structure</label>
        <select
          value={structure}
          onChange={(event) => setStructure(event.target.value)}
          className="border border-input bg-transparent px-2 py-1.5 text-[12.5px]"
        >
          {INSTITUTIONS.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {RECORD_TYPES.map((type) => {
          const rule = rules.find((item) => item.institution_slug === structure && item.record_type === type);
          return (
            <div key={type} className="border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg leading-tight">{type}</h3>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    {rule ? `Decided by ${rule.approving_authority} · ${rule.submitter_role}` : "No rule recorded"}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-[0.12em] ${rule?.confirmed ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {rule?.confirmed ? "Confirmed" : rule ? "Unconfirmed" : "Missing"}
                </span>
              </div>
              {rule?.confirmed_at ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Confirmed {fmtDateTime(rule.confirmed_at)}
                  {rule.confirmed_by ? ` · ${rule.confirmed_by}` : ""}
                </p>
              ) : null}
              {rule?.notes ? <p className="mt-2 text-[12px] leading-relaxed text-foreground/75">{rule.notes}</p> : null}
              <Button variant="outline" size="sm" className="mt-3 rounded-none" onClick={() => open(type)}>
                {rule ? "Edit rule" : "Record rule"}
              </Button>
            </div>
          );
        })}
      </div>

      <RecordDialog
        open={values !== null}
        onOpenChange={(next) => {
          if (!next) setValues(null);
        }}
        title={`${values?.record_type || "Record"} rule · ${INSTITUTIONS.find((item) => item.slug === structure)?.name || ""}`}
        description="Only a formally confirmed provision enables approval in that structure's dashboard."
        fields={FIELDS}
        values={values || {}}
        setValues={setValues}
        onSubmit={submit}
        busy={busy}
        submitLabel="Save rule"
      />
    </>
  );
}