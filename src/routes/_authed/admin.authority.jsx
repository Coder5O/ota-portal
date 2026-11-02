import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MEMBERSHIP_CATEGORIES, DEFAULT_AUTHORITIES } from "@/lib/institutions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/authority")({
  component: AuthorityPage,
});

function AuthorityPage() {
  const [drafts, setDrafts] = useState(null);
  const queryClient = useQueryClient();

  const rules = useQuery({
    queryKey: ["approval-rules"],
    queryFn: async () => {
      const page = await base44.entities.ApprovalRule.list({ limit: 200 });
      return page.items || [];
    },
  });

  const settings = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const page = await base44.entities.SiteConfig.list({ limit: 1, sort: "-updated_date" });
      return page.items?.[0] || null;
    },
  });

  useEffect(() => {
    if (!rules.data || drafts) return;
    const map = {};
    MEMBERSHIP_CATEGORIES.forEach((category) => {
      const rule = rules.data.find((item) => item.registration_type === category.value);
      map[category.value] = {
        id: rule?.id || null,
        authority_name: rule?.authority_name || DEFAULT_AUTHORITIES[category.value] || "OTA Executive",
        approver_title: rule?.approver_title || "",
        requires_documents: !!rule?.requires_documents,
        enforce_authority: !!rule?.enforce_authority,
        notes: rule?.notes || "",
        active: rule ? rule.active !== false : true,
      };
    });
    setDrafts(map);
  }, [rules.data, drafts]);

  const save = useMutation({
    mutationFn: async () => {
      const creates = [];
      const updates = [];
      MEMBERSHIP_CATEGORIES.forEach((category) => {
        const draft = drafts[category.value];
        if (!draft) return;
        const payload = {
          registration_type: category.value,
          authority_name: draft.authority_name.trim() || DEFAULT_AUTHORITIES[category.value],
          approver_title: draft.approver_title,
          requires_documents: draft.requires_documents,
          enforce_authority: draft.enforce_authority,
          notes: draft.notes,
          active: draft.active,
        };
        if (draft.id) updates.push({ id: draft.id, ...payload });
        else creates.push(payload);
      });
      if (creates.length) await base44.entities.ApprovalRule.bulkCreate(creates);
      if (updates.length) await base44.entities.ApprovalRule.bulkUpdate(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-rules"] });
      setDrafts(null);
      toast.success("Approval authority configuration saved.");
    },
    onError: () => toast.error("The configuration could not be saved."),
  });

  const toggleCards = useMutation({
    mutationFn: async (enabled) => {
      const current = settings.data;
      if (current) await base44.entities.SiteConfig.update(current.id, { membership_card_enabled: enabled });
      else await base44.entities.SiteConfig.create({ membership_card_enabled: enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      toast.success("Membership card setting saved.");
    },
    onError: () => toast.error("The setting could not be saved."),
  });

  const set = (category, patch) =>
    setDrafts((prev) => ({ ...prev, [category]: { ...prev[category], ...patch } }));

  return (
    <>
      <PageHead
        title="Approval authority"
        description="Decide which institution or office holds the approval authority for each registration type. These rules govern who may decide an application; they never approve anyone by themselves."
        action={
          <Button
            className="rounded-none bg-[hsl(var(--primary))] text-[11.5px] uppercase tracking-[0.14em]"
            disabled={!drafts || save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save configuration"}
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-[13px]">
            <ShieldCheck className="h-4 w-4 text-gold" /> Digital membership cards
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            When enabled, approved members see a card with a scannable verification code in the member portal.
          </p>
        </div>
        <Switch
          checked={settings.data?.membership_card_enabled !== false}
          onCheckedChange={(value) => toggleCards.mutate(value)}
          disabled={settings.isLoading || toggleCards.isPending}
        />
      </div>

      {!drafts || rules.isLoading ? (
        <p className="text-[13px] text-muted-foreground">Loading the configuration…</p>
      ) : (
        <div className="space-y-3">
          {MEMBERSHIP_CATEGORIES.map((category) => {
            const draft = drafts[category.value];
            return (
              <div key={category.value} className="border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg leading-tight">{category.label}</p>
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{category.value}</p>
                  </div>
                  <label className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                    Active
                    <Switch checked={draft.active} onCheckedChange={(value) => set(category.value, { active: value })} />
                  </label>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Approval authority</p>
                    <Input
                      value={draft.authority_name}
                      onChange={(e) => set(category.value, { authority_name: e.target.value })}
                      className="mt-1 rounded-none text-[13px]"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Signing office</p>
                    <Input
                      value={draft.approver_title}
                      onChange={(e) => set(category.value, { approver_title: e.target.value })}
                      placeholder="e.g. Secretary of the Chiefs Council"
                      className="mt-1 rounded-none text-[13px]"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="flex items-start justify-between gap-3 border border-border px-3 py-2">
                    <span>
                      <span className="block text-[12.5px]">Require a supporting document</span>
                      <span className="block text-[11px] text-muted-foreground">
                        Approval is refused until at least one document is attached.
                      </span>
                    </span>
                    <Switch
                      checked={draft.requires_documents}
                      onCheckedChange={(value) => set(category.value, { requires_documents: value })}
                    />
                  </label>
                  <label className="flex items-start justify-between gap-3 border border-border px-3 py-2">
                    <span>
                      <span className="block text-[12.5px]">Enforce the assigned authority</span>
                      <span className="block text-[11px] text-muted-foreground">
                        An officer assigned to a different authority may not decide this type.
                      </span>
                    </span>
                    <Switch
                      checked={draft.enforce_authority}
                      onCheckedChange={(value) => set(category.value, { enforce_authority: value })}
                    />
                  </label>
                </div>

                <Textarea
                  value={draft.notes}
                  onChange={(e) => set(category.value, { notes: e.target.value })}
                  rows={2}
                  placeholder="Guidance shown to reviewers of this registration type."
                  className="mt-3 rounded-none text-[12.5px]"
                />
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-[11.5px] leading-relaxed text-muted-foreground">
        Enforcement applies only to officers with an assigned authority: an administrator with no authority assigned
        retains oversight so that the register is never immobilised. Every decision is recorded with its authority,
        the officer, the time and the reason in the status history and the audit log.
      </p>
    </>
  );
}