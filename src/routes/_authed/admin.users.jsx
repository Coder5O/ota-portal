import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, UserCheck, UserX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { changeUserRole, suspendUserAccount, reactivateUserAccount } from "@/lib/ota-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/users")({
  component: UsersPage,
});

const ROLES = [
  { value: "user", label: "Ordinary Member" },
  { value: "officer", label: "Officer / Registrar / Editor" },
  { value: "admin", label: "Super Administrator" },
];

function RoleChangeDialog({ user, onClose, onDone }) {
  const [role, setRole] = useState(user.role || "user");
  const [reason, setReason] = useState("");
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () =>
      changeUserRole({ data: { user_id: user.id, new_role: role, reason } }),
    onSuccess: () => {
      toast.success("Role updated and recorded in the audit log.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      onDone();
    },
    onError: (e) => toast.error(e?.message || "Role change failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Change role</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            {user.email} — every role change is recorded in the audit log. The Super
            Administrator role grants full platform access; assign it only to authorised
            technical personnel.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 text-[13px] transition-colors ${
                  role === r.value
                    ? "border-gold/60 bg-gold/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-border/70 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  className="accent-gold"
                />
                {r.label}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Reason (required)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for this change"
              className="rounded-none text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button variant="outline" className="rounded-none" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[hsl(var(--primary))]"
              disabled={!reason.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Saving…" : "Confirm change"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuspendDialog({ user, reactivate, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () =>
      reactivate
        ? reactivateUserAccount({ data: { user_id: user.id, reason } })
        : suspendUserAccount({ data: { user_id: user.id, reason } }),
    onSuccess: () => {
      toast.success(reactivate ? "Account reactivated." : "Account suspended.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      onDone();
    },
    onError: (e) => toast.error(e?.message || "Action failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {reactivate ? "Reactivate account" : "Suspend account"}
          </DialogTitle>
          <DialogDescription className="text-[12.5px]">
            {user.email} — this action is recorded in the audit log.
            {!reactivate &&
              " A suspended account cannot log in or access member services."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Reason (required)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason"
              className="rounded-none text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button variant="outline" className="rounded-none" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`rounded-none ${reactivate ? "bg-[hsl(var(--primary))]" : "bg-destructive"}`}
              disabled={!reason.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Saving…" : reactivate ? "Reactivate" : "Suspend account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleDialog, setRoleDialog] = useState(null);
  const [suspendDialog, setSuspendDialog] = useState(null);
  const [reactivateDialog, setReactivateDialog] = useState(null);

  const usersQ = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const q = search.trim() ? { email: { $regex: search.trim(), $options: "i" } } : {};
      const res = await base44.entities.User.filter(q, { sort: "-created_date", limit: 200 });
      return res.items || [];
    },
  });

  const rows = usersQ.data || [];

  return (
    <>
      <PageHead
        title="User accounts"
        description="All registered platform accounts. Role changes and suspensions are recorded in the audit log. The Super Administrator role grants full access — assign it only to authorised personnel."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="w-64 rounded-none bg-background text-[13px]"
        />
        <span className="ml-auto text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          {rows.length} account{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="w-36 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {usersQ.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Loading accounts…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No accounts found.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      {u.role || "user"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {u.institution_slug || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={u.status || "active"} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {fmtDate(u.created_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Change role"
                        onClick={() => setRoleDialog(u)}
                        className="p-1.5 text-muted-foreground hover:text-[hsl(var(--primary))]"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>
                      {u.status !== "suspended" ? (
                        <button
                          type="button"
                          title="Suspend account"
                          onClick={() => setSuspendDialog(u)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Reactivate account"
                          onClick={() => setReactivateDialog(u)}
                          className="p-1.5 text-muted-foreground hover:text-emerald-600"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {roleDialog && (
        <RoleChangeDialog
          user={roleDialog}
          onClose={() => setRoleDialog(null)}
          onDone={() => setRoleDialog(null)}
        />
      )}
      {suspendDialog && (
        <SuspendDialog
          user={suspendDialog}
          reactivate={false}
          onClose={() => setSuspendDialog(null)}
          onDone={() => setSuspendDialog(null)}
        />
      )}
      {reactivateDialog && (
        <SuspendDialog
          user={reactivateDialog}
          reactivate={true}
          onClose={() => setReactivateDialog(null)}
          onDone={() => setReactivateDialog(null)}
        />
      )}
    </>
  );
}
