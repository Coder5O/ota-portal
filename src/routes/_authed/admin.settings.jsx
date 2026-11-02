import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/settings")({
  component: SettingsPage,
});

const EMPTY = {
  organisation_name: "Ovaherero Traditional Authority",
  contact_email: "",
  contact_phone: "",
  office_address: "",
  office_hours: "",
  notice: "",
  footer_note: "",
  maintenance_mode: false,
  maintenance_message: "",
  membership_card_enabled: true,
};

function Field({ label, hint, children }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [recordId, setRecordId] = useState(null);
  const queryClient = useQueryClient();

  const config = useQuery({
    queryKey: ["site-config"],
    queryFn: () => base44.entities.SiteConfig.list({ sort: "-created_date", limit: 1 }),
  });

  useEffect(() => {
    const record = config.data?.items?.[0];
    if (record) {
      setRecordId(record.id);
      setForm({ ...EMPTY, ...record });
    }
  }, [config.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (recordId) return base44.entities.SiteConfig.update(recordId, payload);
      return base44.entities.SiteConfig.create(payload);
    },
    onSuccess: (saved) => {
      if (saved?.id) setRecordId(saved.id);
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      toast.success("Institutional settings saved.");
    },
    onError: () => toast.error("The settings could not be saved."),
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHead
        title="Institutional settings"
        description="Contact details, the site-wide notice and maintenance controls used across the public website."
        action={
          <Button className="rounded-none bg-[hsl(var(--primary))]" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 border border-border bg-card p-5">
          <h2 className="font-display text-xl">Identity & contact</h2>
          <Field label="Organisation name">
            <Input value={form.organisation_name || ""} onChange={(e) => set("organisation_name", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <Field label="Official email">
            <Input value={form.contact_email || ""} onChange={(e) => set("contact_email", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <Field label="Telephone">
            <Input value={form.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <Field label="Office address">
            <Textarea value={form.office_address || ""} rows={2} onChange={(e) => set("office_address", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <Field label="Office hours">
            <Input value={form.office_hours || ""} onChange={(e) => set("office_hours", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
        </section>

        <section className="space-y-4 border border-border bg-card p-5">
          <h2 className="font-display text-xl">Website notice & footer</h2>
          <Field label="Site-wide notice" hint="Displayed above the public pages. Leave empty to hide.">
            <Textarea value={form.notice || ""} rows={3} onChange={(e) => set("notice", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <Field label="Footer note">
            <Textarea value={form.footer_note || ""} rows={3} onChange={(e) => set("footer_note", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
          <div className="flex items-center justify-between border border-border px-3 py-2.5">
            <div>
              <p className="text-[12.5px]">Membership card</p>
              <p className="text-[11px] text-muted-foreground">Shows a printable membership card in the member portal.</p>
            </div>
            <Switch checked={!!form.membership_card_enabled} onCheckedChange={(v) => set("membership_card_enabled", v)} />
          </div>
        </section>

        <section className="space-y-4 border border-border bg-card p-5">
          <h2 className="font-display text-xl">Maintenance</h2>
          <div className="flex items-center justify-between border border-border px-3 py-2.5">
            <div>
              <p className="text-[12.5px]">Maintenance mode</p>
              <p className="text-[11px] text-muted-foreground">Displays a maintenance notice on the public website.</p>
            </div>
            <Switch checked={!!form.maintenance_mode} onCheckedChange={(v) => set("maintenance_mode", v)} />
          </div>
          <Field label="Maintenance message">
            <Textarea value={form.maintenance_message || ""} rows={3} onChange={(e) => set("maintenance_message", e.target.value)} className="rounded-none text-[13px]" />
          </Field>
        </section>

        <section className="space-y-3 border border-border bg-card p-5 text-[12.5px] leading-relaxed text-foreground/75">
          <h2 className="font-display text-xl text-foreground">Governance & access</h2>
          <p>
            This console is reserved for the OTA Super Administrator. Technical access does not confer constitutional
            authority: approvals, suspensions and publication decisions must follow the governance process.
          </p>
          <p>
            Records are archived rather than deleted: suspension keeps the membership record, its history and audit
            trail intact. Disciplinary matters, property registers and financial records are deliberately not exposed
            in this console and remain under separate authorised administration.
          </p>
          <p>
            Officer accounts see only the meetings, resolutions and tasks of the structure assigned to them. Assign
            offices from the Members screen.
          </p>
        </section>
      </div>
    </>
  );
}