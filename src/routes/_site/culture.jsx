import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  Compass,
  FileCheck2,
  GraduationCap,
  History,
  Languages,
  Landmark,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { submitHeritageContribution } from "@/lib/ota-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/culture")({
  head: () => ({
    meta: [
      { title: "Culture & Heritage · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Language, customs, oral histories, traditional knowledge, approved symbols, ceremonies and educational resources of the Ovaherero people.",
      },
    ],
  }),
  loader: async () => {
    const blocks = await base44.entities.ContentBlock.filter(
      { page_slug: "culture", status: "published" },
      { sort: "sort_order", limit: 50 },
    );
    return { blocks: blocks.items || [] };
  },
  component: CulturePage,
});

function ContributionDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    contributor_name: "",
    contributor_email: "",
    contributor_phone: "",
    category: "oral_history",
    title: "",
    description: "",
    source_tradition: "",
    cultural_restrictions: "",
    permission_granted: false,
  });

  const mut = useMutation({
    mutationFn: () => submitHeritageContribution({ data: form }),
    onSuccess: () => {
      toast.success("Thank you. Your contribution has been submitted for review by the OTA Editorial Council.");
      onOpenChange(false);
      setForm({
        contributor_name: "",
        contributor_email: "",
        contributor_phone: "",
        category: "oral_history",
        title: "",
        description: "",
        source_tradition: "",
        cultural_restrictions: "",
        permission_granted: false,
      });
    },
    onError: (e) => toast.error(e?.message || "Submission failed. Please check required fields."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Submit heritage material for review</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            The Authority welcomes submissions of oral histories, traditional knowledge, language
            records and customary symbols. All submissions are reviewed prior to publication. Culturally
            sensitive or restricted knowledge will not be published without formal traditional authorization.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4 text-[13px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Your full name (required)
              </label>
              <Input
                value={form.contributor_name}
                onChange={(e) => setForm({ ...form, contributor_name: e.target.value })}
                placeholder="e.g. Dr. Kavezeri Kaura"
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Email address (required)
              </label>
              <Input
                type="email"
                value={form.contributor_email}
                onChange={(e) => setForm({ ...form, contributor_email: e.target.value })}
                placeholder="you@example.com"
                className="mt-1 rounded-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Telephone / WhatsApp
              </label>
              <Input
                value={form.contributor_phone}
                onChange={(e) => setForm({ ...form, contributor_phone: e.target.value })}
                placeholder="+264 ..."
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Heritage category (required)
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full border border-border bg-background px-3 py-2 text-[13px]"
              >
                <option value="oral_history">Oral history / Testimony</option>
                <option value="traditional_knowledge">Traditional knowledge / Custom</option>
                <option value="language">Otjiherero language resource</option>
                <option value="symbols">Approved customary symbol</option>
                <option value="historical_places">Historical place / Sacred monument</option>
                <option value="ceremonies">Ceremony / Commemoration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Title of contribution (required)
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Clan praise songs of the Maharero Royal Lineage"
              className="mt-1 rounded-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Traditional source / Eldership attribution
            </label>
            <Input
              value={form.source_tradition}
              onChange={(e) => setForm({ ...form, source_tradition: e.target.value })}
              placeholder="e.g. Narrated by Elder Vetira Ndjavera, Okakarara"
              className="mt-1 rounded-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Full description & historical content (required)
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              placeholder="Provide the detailed historical text, lineage, ritual significance, or educational explanation."
              className="mt-1 rounded-none text-[13px]"
            />
          </div>

          <div className="border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
              <label className="text-[11px] uppercase tracking-wider font-medium">
                Cultural restrictions or sacred reservations
              </label>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              If this material contains sacred, gender-restricted, or ceremonial knowledge that must
              NOT be publicly disseminated, describe the restrictions below.
            </p>
            <Textarea
              value={form.cultural_restrictions}
              onChange={(e) => setForm({ ...form, cultural_restrictions: e.target.value })}
              rows={2}
              placeholder="Describe any customary restrictions or permissions required before viewing."
              className="mt-2 rounded-none bg-background text-[12.5px]"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-foreground/80">
            <input
              type="checkbox"
              checked={form.permission_granted}
              onChange={(e) => setForm({ ...form, permission_granted: e.target.checked })}
              className="mt-1 accent-gold"
            />
            <span>
              I confirm that I have customary permission to submit this material to the Ovaherero
              Traditional Authority archive and that the recorded elder/source consented to its preservation.
            </span>
          </label>

          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[hsl(var(--primary))]"
              disabled={
                !form.contributor_name ||
                !form.contributor_email ||
                !form.title ||
                !form.description ||
                !form.permission_granted ||
                mut.isPending
              }
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Submitting…" : "Submit contribution"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CulturePage() {
  const { blocks = [] } = Route.useLoaderData() || {};
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Culture & heritage"
        title="Otjiherero, custom and the living memory of our people."
        intro="Language, oral histories, traditional knowledge, ceremony and approved symbols are preserved by communities. The Authority approves and maintains this official heritage register."
      >
        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-none bg-gold text-[12px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Contribute to the heritage record
        </Button>
      </PageHero>

      {/* Published Cultural Blocks */}
      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="Cultural content — language, customs, oral histories and approved symbols — is published here by the administration."
        />
      </Section>

      {/* Cultural Heritage Pillars */}
      <Section eyebrow="Customary Domains" title="Official Heritage Domains" tone="muted">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Otjiherero Language",
              icon: Languages,
              text: "Standardized grammar, orthography, vocabulary resources, and approved youth educational curriculum.",
            },
            {
              title: "Oral Histories & Lineages",
              icon: History,
              text: "Recorded ancestral testimonies, clan genealogies (ozombepo), praise poetry (omambo), and migration accounts.",
            },
            {
              title: "Traditional Knowledge & Healing",
              icon: BookOpen,
              text: "Herbal wisdom, cattle lore, seasonal navigation, and sacred customs observed with community consensus.",
            },
            {
              title: "Approved Symbols of Identity",
              icon: FileCheck2,
              text: "Customary standards, dress codes, flags (Otjiserandu / Red Flag), insignia, and commemorative attire.",
            },
            {
              title: "Ceremonies & Commemorations",
              icon: Compass,
              text: "Annual Hero's Day (Okahandja), Otjiserandu assemblies, ritual fire observance (Okuruuo), and rites of passage.",
            },
            {
              title: "Historical Places & Sacred Sites",
              icon: Landmark,
              text: "Sacred battlegrounds, concentration camp sites, ancestral shrines, and preserved monuments.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <Icon className="h-5 w-5 text-gold" />
                  <IllustrativeBadge />
                </div>
                <h3 className="mt-3 font-display text-xl">{item.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Call to Contribute */}
      <Section>
        <div className="flex flex-col items-start justify-between gap-6 border border-border bg-card p-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Community Heritage Archive</p>
            <h2 className="mt-1 font-display text-2xl">Preserve ancestral knowledge with the Authority</h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-foreground/70">
              Traditional leaders, elders, families and researchers may submit oral testimonies,
              photographic archives, or genealogical corrections for review by the OTA Editorial Council.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="shrink-0 rounded-none bg-[hsl(var(--primary))] text-[11.5px] uppercase tracking-[0.14em]"
          >
            Submit material for review
          </Button>
        </div>
      </Section>

      <ContributionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
