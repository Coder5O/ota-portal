import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, ShieldAlert, UserCog } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { assignOfficer, updateMemberStatus } from "@/lib/ota-fns";
import { PageHead } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { INSTITUTIONS, categoryLabel } from "@/lib/institutions";
import { fmtDate } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/members")({
  component: MembersPage,
});

function MembersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [nextStatus, setNextStatus] = useState("Suspended");
  const [reason, setReason] = useState("");
  const [officeTarget, setOfficeTarget] = useState(null);
  const [institution, setInstitution] = useState("");
  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["members", search, status],
    queryFn: async () => {
      const query = {};
      if (status) query.status = status;
      if (search.trim()) query.full_name = { $regex: search.trim(), $options: "i" };
      const page = await base44.entities.Member.filter(query, { sort: "-created_date", limit: 100 });
      return page.items || [];
    },
  });

  const users = useQuery({
    queryKey: ["officer-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const changeStatus = useMutation({
    mutationFn: async () =>
      updateMemberStatus({ data: { id: statusTarget.id, status: nextStatus, reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(`Membership marked ${nextStatus.toLowerCase()}.`);
      setStatusTarget(null);
      setReason("");
    },
    onError: () => toast.error("The status change could not be saved."),
  });

  const assign = useMutation({
    mutationFn: async () =>
      assignOfficer({
        data: {
          user_id: officeTarget?.user_id || "new",
          institution_slug: institution,
          officer_title: title,
          approval_authority: authority,
          invite_email: inviteEmail || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-users"] });
      toast.success(inviteEmail ? "Officer invited and office recorded." : "Office recorded.");
      setOfficeTarget(null);
      setInviteEmail("");
      setTitle("");
    },
    onError: () => toast.error("The office could not be assigned."),
  });

  const rows = list.data || [];

  const exportRows = async () => {
    try {
      const page = await base44.entities.Member.filter(status ? { status } : {}, { sort: "-created_date", limit: 500 });
      const all = page.items || [];
      if (!all.length) {
        toast.error("There are no member records to export.");
        return;
      }
      downloadCsv(
        `ota-members-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          { label: "Membership number", value: (row) => row.membership_number },
          { label: "Full name", value: (row) => row.full_name },
          { label: "Email", value: (row) => row.email },
          { label: "Telephone", value: (row) => row.phone },
          { label: "Category", value: (row) => categoryLabel(row.category) },
          { label: "Community or structure", value: (row) => row.community_name },
          { label: "Country", value: (row) => row.country },
          { label: "Region", value: (row) => row.region },
          { label: "Status", value: (row) => row.status },
          { label: "Approved by", value: (row) => row.approval_authority },
          { label: "Application", value: (row) => row.application_reference },
          { label: "Joined", value: (row) => row.joined_date },
          { label: "Review due", value: (row) => row.review_date },
        ],
        all,
      );
      toast.success(`${all.length} member record${all.length === 1 ? "" : "s"} exported.`);
    } catch (error) {
      toast.error("The export could not be prepared.");
    }
  };

  return (
    <>
      <PageHead
        title="Member records"
        description="Approved memberships. Status changes are notified to the member and recorded in the audit log; records are archived, never erased."
        action={
          <Button variant="outline" className="rounded-none text-[11.5px] uppercase tracking-[0.14em]" onClick={exportRows}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name"
            className="w-64 rounded-none bg-background pl-9 text-[13px]"
          />
        </div>
        {["", "Active", "Suspended", "Archived"].map((option) => (
          <Button
            key={option || "all"}
            size="sm"
            variant={status === option ? "default" : "outline"}
            className="rounded-none text-[11.5px]"
            onClick={() => setStatus(option)}
          >
            {option || "All"}
          </Button>
        ))}
        <span className="ml-auto text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">{rows.length} shown</span>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Membership no.</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Community</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Approved by</th>
              <th className="w-32 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Loading member records…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No membership records yet. Approve an application to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">{row.membership_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {row.title ? `${row.title} ` : ""}
                      {row.full_name}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-foreground/80">{categoryLabel(row.category)}</td>
                  <td className="px-4 py-3 text-[12px] text-foreground/80">{row.community_name || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{fmtDate(row.joined_date)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-[11.5px] text-muted-foreground">{row.approval_authority || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label="Change membership status"
                        onClick={() => {
                          setStatusTarget(row);
                          setNextStatus(row.status === "Active" ? "Suspended" : "Active");
                          setReason("");
                        }}
                        className="p-1.5 text-muted-foreground hover:text-[hsl(var(--primary))]"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Assign an office"
                        onClick={() => {
                          setOfficeTarget(row);
                          setInstitution(row.institution_slug || "");
                          setTitle(row.title || "");
                          setAuthority(row.approval_authority || "");
                        }}
                        className="p-1.5 text-muted-foreground hover:text-[hsl(var(--primary))]"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change the status of {statusTarget?.full_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The member is notified and the change is recorded in the audit log. The record is retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">New status</Label>
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger className="mt-1.5 rounded-none text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Active", "Suspended", "Archived"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1.5 rounded-none text-[13px]"
                placeholder="Recorded in the audit log and included in the member's notification."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-[hsl(var(--primary))]"
              disabled={changeStatus.isPending}
              onClick={() => changeStatus.mutate()}
            >
              {changeStatus.isPending ? "Saving…" : "Confirm change"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {officeTarget ? (
        <Dialog open={!!officeTarget} onOpenChange={(open) => !open && setOfficeTarget(null)}>
          <DialogContent className="max-w-lg rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Office and structure</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                Officers see only the meetings, resolutions and tasks of the structure assigned to them.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">App user account</Label>
                <Select
                  value={officeTarget.user_id || "__none"}
                  onValueChange={(v) => setOfficeTarget({ ...officeTarget, user_id: v === "__none" ? "" : v })}
                >
                  <SelectTrigger className="mt-1.5 rounded-none text-[13px]">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">No linked account</SelectItem>
                    {(users.data || [])
                      .filter((u) => u.email === officeTarget.email || u.role === "user")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Structure</Label>
                <Select value={institution || "__none"} onValueChange={(v) => setInstitution(v === "__none" ? "" : v)}>
                  <SelectTrigger className="mt-1.5 rounded-none text-[13px]">
                    <SelectValue placeholder="Not assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Not assigned</SelectItem>
                    {INSTITUTIONS.map((inst) => (
                      <SelectItem key={inst.slug} value={inst.slug}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Portfolio or office</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-none text-[13px]" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Approval authority assigned
                </Label>
                <Input
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="e.g. Chiefs Council"
                  className="mt-1.5 rounded-none text-[13px]"
                />
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  Where an approval type enforces its authority, an officer assigned elsewhere cannot decide it.
                </p>
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Invite an officer account (optional)
                </Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.org"
                  className="mt-1.5 rounded-none text-[13px]"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="outline" className="rounded-none" onClick={() => setOfficeTarget(null)}>
                  Cancel
                </Button>
                <Button className="rounded-none bg-[hsl(var(--primary))]" disabled={assign.isPending} onClick={() => assign.mutate()}>
                  {assign.isPending ? "Saving…" : "Save assignment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}