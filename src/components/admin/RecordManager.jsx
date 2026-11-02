import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { FormField } from "@/components/admin/FormField";
import { PageHead } from "@/components/admin/AdminShell";
import { toast } from "sonner";

function EditDialog({ open, onOpenChange, fields, initial, onSave, saving, label }) {
  const [values, setValues] = useState(initial || {});
  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{initial?.id ? "Edit" : "New"} {label}</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Changes take effect on the public website when the record's status is published.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={(value) => set(field.name, value)}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-none bg-[hsl(var(--primary))]"
            disabled={saving}
            onClick={() => {
              const missing = fields.find((f) => f.required && !values[f.name]);
              if (missing) {
                toast.error(`${missing.label} is required.`);
                return;
              }
              onSave(values);
            }}
          >
            {saving ? "Saving…" : "Save record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RecordManager({
  entity,
  label,
  title,
  description,
  fields,
  columns,
  blank = {},
  sort = "-created_date",
  searchField = "title",
  filterField,
  filterOptions,
  bare = false,
}) {
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [entity, search, filterValue],
    queryFn: async () => {
      const query = {};
      if (filterField && filterValue) query[filterField] = filterValue;
      if (search.trim() && searchField) query[searchField] = { $regex: search.trim(), $options: "i" };
      const page = await base44.entities[entity].filter(query, { sort, limit: 100 });
      return page.items || [];
    },
  });

  const save = useMutation({
    mutationFn: async (values) => {
      const payload = { ...values };
      if (editing?.id) return base44.entities[entity].update(editing.id, payload);
      return base44.entities[entity].create({ ...blank, ...payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setEditing(null);
      toast.success("Record saved");
    },
    onError: () => toast.error("The record could not be saved."),
  });

  const remove = useMutation({
    mutationFn: async (id) => base44.entities[entity].delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setDeleting(null);
      toast.success("Record deleted");
    },
    onError: () => toast.error("The record could not be deleted."),
  });

  const rows = listQuery.data || [];

  return (
    <>
      {bare ? (
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
          <div>
            <h2 className="font-display text-2xl leading-tight">{title}</h2>
            {description ? <p className="mt-1 max-w-2xl text-[12.5px] text-muted-foreground">{description}</p> : null}
          </div>
          <Button className="rounded-none bg-[hsl(var(--primary))]" onClick={() => setEditing({ ...blank })}>
            <Plus className="mr-1.5 h-4 w-4" /> New
          </Button>
        </div>
      ) : (
        <PageHead
          title={title}
          description={description}
          action={
            <Button className="rounded-none bg-[hsl(var(--primary))]" onClick={() => setEditing({ ...blank })}>
              <Plus className="mr-1.5 h-4 w-4" /> New {label.toLowerCase()}
            </Button>
          }
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records"
            className="w-64 rounded-none bg-background pl-9 text-[13px]"
          />
        </div>
        {filterField ? (
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={filterValue === "" ? "default" : "outline"}
              className="rounded-none text-[11.5px]"
              onClick={() => setFilterValue("")}
            >
              All
            </Button>
            {(filterOptions || []).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={filterValue === option ? "default" : "outline"}
                className="rounded-none text-[11.5px]"
                onClick={() => setFilterValue(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}
        <span className="ml-auto text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          {rows.length} record{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {listQuery.isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-muted-foreground">
                  Loading records…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                  No records yet. Use “New {label.toLowerCase()}” to create the first one.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/40">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 align-top">
                      {col.render ? col.render(row) : row[col.key] || <span className="text-muted-foreground/60">—</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label="Edit record"
                        onClick={() => setEditing(row)}
                        className="p-1.5 text-muted-foreground hover:text-[hsl(var(--primary))]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete record"
                        onClick={() => setDeleting(row)}
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing ? (
        <EditDialog
          key={`${editing.id || "new"}-${editing.__nonce || 0}`}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          fields={fields}
          initial={editing}
          label={label}
          saving={save.isPending}
          onSave={(values) => save.mutate(values)}
        />
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the record from the platform. Where a record must be retained for institutional purposes,
              change its status to archived instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive"
              onClick={() => remove.mutate(deleting.id)}
            >
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}