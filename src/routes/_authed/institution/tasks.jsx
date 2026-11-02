import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { institutionList, saveTask } from "@/lib/institution-fns";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { RecordDialog } from "@/components/institution/RecordDialog";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/tasks")({
  ssr: false,
  head: () => ({ meta: [{ title: "Action items — Structure dashboard" }] }),
  component: TasksPage,
});

const FIELDS = [
  { name: "title", label: "Action", required: true, full: true },
  { name: "owner_name", label: "Responsible officer" },
  { name: "due_date", label: "Due date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Done"] },
  { name: "resolution_id", label: "Linked resolution reference", description: "Optional record reference." },
  { name: "description", label: "Detail", type: "textarea", rows: 4, full: true },
];

const blank = () => ({ title: "", owner_name: "", due_date: "", status: "Open", resolution_id: "", description: "" });

function TasksPage() {
  const { meta, structure } = useInstitutionContext();
  const list = useServerFn(institutionList);
  const save = useServerFn(saveTask);
  const queryClient = useQueryClient();

  const [values, setValues] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");

  const query = useQuery({
    queryKey: ["institution-tasks", structure, status],
    queryFn: () => list({ data: { slug: structure, kind: "tasks", status } }),
    enabled: !!structure,
  });

  const items = useMemo(() => {
    const rows = query.data?.items || [];
    const needle = term.trim().toLowerCase();
    return needle
      ? rows.filter(
          (row) =>
            String(row.title || "").toLowerCase().includes(needle) ||
            String(row.owner_name || "").toLowerCase().includes(needle),
        )
      : rows;
  }, [query.data, term]);

  const open = (record) => {
    setEditingId(record?.id || "");
    setValues(
      record
        ? {
            title: record.title || "",
            owner_name: record.owner_name || "",
            due_date: record.due_date ? String(record.due_date).slice(0, 10) : "",
            status: record.status || "Open",
            resolution_id: record.resolution_id || "",
            description: record.description || "",
          }
        : blank(),
    );
  };

  const submit = async () => {
    setBusy(true);
    try {
      await save({ data: { ...values, id: editingId || undefined, slug: structure } });
      await queryClient.invalidateQueries();
      toast.success(editingId ? "Action item updated." : "Action item assigned.");
      setValues(null);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (record, nextStatus) => {
    setBusy(true);
    try {
      await save({
        data: {
          id: record.id,
          slug: structure,
          title: record.title,
          description: record.description || "",
          owner_name: record.owner_name || "",
          due_date: record.due_date || "",
          resolution_id: record.resolution_id || "",
          status: nextStatus,
        },
      });
      await queryClient.invalidateQueries();
      toast.success(`Marked ${nextStatus.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <InstitutionShell
      meta={meta}
      structure={structure}
      title="Action items"
      active="tasks"
      description="Follow-up assigned by this structure: responsibilities, deadlines and completion."
      action={
        <Button size="sm" className="rounded-none" onClick={() => open(null)}>
          <Plus className="mr-1.5 h-4 w-4" /> Assign action
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search action items"
          className="h-9 max-w-xs rounded-none text-[13px]"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-9 border border-input bg-transparent px-2 text-[12.5px]"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading action items…</p> : null}

      <div className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[13.5px] font-medium leading-snug">{item.title}</h3>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                {item.owner_name || "Unassigned"}
                {item.due_date ? ` · due ${fmtDate(item.due_date)}` : ""}
              </p>
              {item.description ? (
                <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/75">
                  {item.description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={item.status}
                onChange={(event) => changeStatus(item, event.target.value)}
                disabled={busy}
                className="h-8 border border-input bg-transparent px-2 text-[12px]"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <Button variant="outline" size="sm" className="rounded-none" onClick={() => open(item)}>
                Edit
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!query.isLoading && !items.length ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No action item is recorded for this structure.
        </p>
      ) : null}

      <RecordDialog
        open={values !== null}
        onOpenChange={(next) => {
          if (!next) setValues(null);
        }}
        title={editingId ? "Update action item" : "Assign an action item"}
        fields={FIELDS}
        values={values || {}}
        setValues={setValues}
        onSubmit={submit}
        busy={busy}
        submitLabel={editingId ? "Update action item" : "Assign action"}
      />
    </InstitutionShell>
  );
}