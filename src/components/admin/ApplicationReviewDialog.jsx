import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { decideApplication } from "@/lib/ota-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplicationDocuments } from "@/components/admin/ApplicationDocuments";
import { ApplicationTimeline } from "@/components/admin/ApplicationTimeline";
import { INSTITUTIONS, categoryLabel } from "@/lib/institutions";
import { fmtDateTime } from "@/lib/format";
import { toast } from "sonner";

const ACTIONS = [
  { value: "under_review", label: "Mark under review" },
  { value: "request_info", label: "Request further information" },
  { value: "approve", label: "Approve and create membership" },
  { value: "reject", label: "Reject application" },
  { value: "suspend", label: "Suspend application" },
  { value: "archive", label: "Archive application" },
  { value: "reactivate", label: "Reopen for review" },
];

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-b border-border/70 pb-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13px] text-foreground/85">{value}</p>
    </div>
  );
}

export function ApplicationReviewDialog({ application, onClose, onDecided }) {
  const [action, setAction] = useState("under_review");
  const [reason, setReason] = useState(application.decision_reason || "");
  const [grantAccess, setGrantAccess] = useState(true);
  const [institution, setInstitution] = useState(application.institution_slug || "");
  const [documents, setDocuments] = useState(application.documents || []);

  const decide = useMutation({
    mutationFn: () =>
      decideApplication({
        data: { id: application.id, action, reason, grantPortalAccess: grantAccess, institution_slug: institution },
      }),
    onSuccess: () => {
      toast.success("Decision recorded and the applicant notified.");
      onDecided?.();
      onClose();
    },
    onError: (error) => toast.error(error?.message || "The decision could not be recorded."),
  });

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{application.full_name}</DialogTitle>
          <DialogDescription className="text-[12px]">
            {application.reference} · submitted {fmtDateTime(application.created_date)} ·{" "}
            {categoryLabel(application.category)} · {application.status}
          </DialogDescription>
        </DialogHeader>

        <div className="border border-gold/40 bg-gold/10 px-3 py-2 text-[12px] leading-relaxed text-foreground/80">
          Approval authority for this registration type:{" "}
          <strong className="font-medium">{application.approval_authority || "Not yet configured"}</strong>. A decision
          creates a membership record only where the application is approved.
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Detail label="Email" value={application.email} />
          <Detail label="Telephone" value={application.phone} />
          <Detail label="Country" value={application.country} />
          <Detail label="Region" value={application.region} />
          <Detail label="Community or structure" value={application.community_name || application.diaspora_chapter} />
          <Detail label="Customary title" value={application.title} />
          <Detail label="Jurisdiction" value={application.jurisdiction} />
          <Detail label="Appointment basis" value={application.appointment_basis} />
          <Detail label="Term" value={[application.term_start, application.term_end].filter(Boolean).join(" – ")} />
          <Detail label="Stated purpose" value={application.purpose} />
          <Detail label="Information request" value={application.information_request} />
          <Detail label="Review notes" value={application.review_notes} />
          <Detail label="Decided by" value={application.decided_by} />
        </div>

        <ApplicationDocuments application={{ ...application, documents }} onChanged={setDocuments} />

        <ApplicationTimeline applicationId={application.id} />

        <div className="mt-3 space-y-3 border-t border-border pt-4">
          <div>
            <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Decision</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="mt-1.5 rounded-none text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === "approve" ? (
            <>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Institution or structure (optional)
                </Label>
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
              <div className="flex items-center justify-between border border-border px-3 py-2.5">
                <div>
                  <p className="text-[12.5px]">Grant portal access</p>
                  <p className="text-[11px] text-muted-foreground">Sends an invitation to sign in to the member portal.</p>
                </div>
                <Switch checked={grantAccess} onCheckedChange={setGrantAccess} />
              </div>
            </>
          ) : null}

          <div>
            <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Reason or note for the applicant
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Recorded in the status history, the audit log and the applicant's notification."
              className="mt-1.5 rounded-none text-[13px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-none" onClick={onClose}>
              Close
            </Button>
            <Button
              className="rounded-none bg-[hsl(var(--primary))]"
              disabled={decide.isPending || (["reject", "request_info"].includes(action) && !reason.trim())}
              onClick={() => decide.mutate()}
            >
              {decide.isPending ? "Recording…" : "Record decision"}
            </Button>
          </div>
          {["reject", "request_info"].includes(action) && !reason.trim() ? (
            <p className="text-right text-[11px] text-destructive">A recorded reason is required for this decision.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}