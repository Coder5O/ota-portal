import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  Globe2,
  Mail,
  MapPin,
  ShieldCheck,
  UserCheck,
  Users,
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
import { submitDiasporaRegistration } from "@/lib/ota-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/diaspora")({
  head: () => ({
    meta: [
      { title: "Ovaherero Diaspora · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Diaspora chapters, international community engagement, traditional leader credentials, and voluntary registration with the Ovaherero Traditional Authority.",
      },
    ],
  }),
  loader: async () => {
    const [blocks, chapters, diasporaEvents] = await Promise.all([
      base44.entities.ContentBlock.filter(
        { page_slug: "diaspora", status: "published" },
        { sort: "sort_order", limit: 50 },
      ),
      base44.entities.TraditionalCommunity.filter(
        { kind: "diaspora", status: "published" },
        { sort: "name", limit: 50 },
      ),
      base44.entities.Event.filter(
        { audience: "Diaspora", status: "published" },
        { sort: "starts_at", limit: 6 },
      ),
    ]);
    return {
      blocks: blocks.items || [],
      chapters: chapters.items || [],
      events: diasporaEvents.items || [],
    };
  },
  component: DiasporaPage,
});

function DiasporaRegistrationDialog({ open, onOpenChange }) {
  const [form, setForm] = useState({
    community_name: "",
    country: "",
    region: "",
    leader_name: "",
    leader_title: "",
    contact_email: "",
    contact_phone: "",
    description: "",
  });

  const mut = useMutation({
    mutationFn: () => submitDiasporaRegistration({ data: form }),
    onSuccess: () => {
      toast.success(
        "Diaspora chapter registration submitted. The OTA Secretariat will review and contact you.",
      );
      onOpenChange(false);
      setForm({
        community_name: "",
        country: "",
        region: "",
        leader_name: "",
        leader_title: "",
        contact_email: "",
        contact_phone: "",
        description: "",
      });
    },
    onError: (e) => toast.error(e?.message || "Registration failed. Check required fields."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Register a diaspora chapter</DialogTitle>
          <DialogDescription className="text-[12.5px]">
            Ovaherero diaspora communities and traditional leaders in Botswana, South Africa, the
            United Kingdom, Germany, North America and across the globe may register for official
            recognition, cultural coordination, and constitutional representation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4 text-[13px]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Chapter / Community name (required)
              </label>
              <Input
                value={form.community_name}
                onChange={(e) => setForm({ ...form, community_name: e.target.value })}
                placeholder="e.g. Ovaherero Diaspora Chapter - UK & Europe"
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Host country (required)
              </label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Botswana / United States / South Africa"
                className="mt-1 rounded-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                State / Province / City
              </label>
              <Input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="e.g. Mahalapye / London / Atlanta"
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Official contact email (required)
              </label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="chapter@example.com"
                className="mt-1 rounded-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Designated traditional leader name
              </label>
              <Input
                value={form.leader_name}
                onChange={(e) => setForm({ ...form, leader_name: e.target.value })}
                placeholder="e.g. Senior Headman / Chairperson"
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Leader title / Designation
              </label>
              <Input
                value={form.leader_title}
                onChange={(e) => setForm({ ...form, leader_title: e.target.value })}
                placeholder="e.g. Chief Representative / Council Chair"
                className="mt-1 rounded-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Contact telephone / WhatsApp
            </label>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="+..."
              className="mt-1 rounded-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Community overview & estimated membership
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="State the history of the chapter, estimated population, active structures, and community objectives."
              className="mt-1 rounded-none text-[13px]"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[hsl(var(--primary))]"
              disabled={!form.community_name || !form.country || !form.contact_email || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Submitting…" : "Submit registration"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DiasporaPage() {
  const { blocks = [], chapters = [] } = Route.useLoaderData() || {};
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Ovaherero diaspora"
        title="One people, across continents."
        intro="Ovaherero communities in Botswana, South Africa, Europe, the Americas and worldwide remain an integral part of our nation. Chapters register voluntarily for official recognition and joint cultural governance."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setRegisterOpen(true)}
            className="rounded-none bg-gold text-[12px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Register a diaspora chapter
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-primary-foreground/30 bg-primary-foreground/10 text-[12px] uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Link to="/contact">Traditional leader credential submission</Link>
          </Button>
        </div>
      </PageHero>

      {/* Published Content Blocks */}
      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="Diaspora engagement, chapter information and cultural activities are published here by the administration."
        />
      </Section>

      {/* Published Chapters */}
      <Section eyebrow="Registered chapters" title="Recognised Diaspora Chapters" tone="muted">
        {chapters.length === 0 ? (
          <EmptyNote>
            No diaspora chapter has been published yet. Chapters register voluntarily and appear here
            once formally verified by the OTA Executive.
          </EmptyNote>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl leading-snug">{chapter.name}</h3>
                  {chapter.is_demo ? <IllustrativeBadge /> : null}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  {[chapter.country, chapter.region].filter(Boolean).join(" · ")}
                </div>
                {chapter.leader_name && (
                  <p className="mt-3 text-[12px] text-foreground/85">
                    <strong>Leader:</strong> {chapter.leader_name}{" "}
                    {chapter.leader_title ? `(${chapter.leader_title})` : ""}
                  </p>
                )}
                {chapter.description ? (
                  <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
                    {chapter.description}
                  </p>
                ) : null}
                {chapter.contact_email ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {chapter.contact_email}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Leadership Credential Verification */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="border border-border bg-card p-8">
            <div className="flex items-center gap-2 text-gold">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-[11px] uppercase tracking-[0.18em]">Leadership Credential Verification</p>
            </div>
            <h2 className="mt-3 font-display text-2xl">Traditional Leaders in the Diaspora</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/75">
              Traditional leaders, headmen, and elders residing outside Namibia may submit information
              regarding their customary communities and historical appointments for formal review and
              inscription in the OTA Leadership Directory.
            </p>
            <div className="mt-6">
              <Button asChild className="rounded-none bg-[hsl(var(--primary))] text-[11.5px] uppercase tracking-wider">
                <Link to="/contact">Submit credentials for review</Link>
              </Button>
            </div>
          </div>

          <div className="border border-border bg-card p-8">
            <div className="flex items-center gap-2 text-gold">
              <Globe2 className="h-5 w-5" />
              <p className="text-[11px] uppercase tracking-[0.18em]">Diaspora Collaboration</p>
            </div>
            <h2 className="mt-3 font-display text-2xl">Approved Collaboration Opportunities</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-foreground/75">
              Diaspora chapters coordinate cultural commemorations, Otjiherero language schools, youth
              mentorship exchanges, and international advocacy alongside the Ovaherero Global Genocide
              Foundation (OGGF).
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-none border-border text-[11.5px] uppercase tracking-wider"
              >
                <Link to="/membership">Join as diaspora member</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-none border-border text-[11.5px] uppercase tracking-wider"
              >
                <Link to="/oggf">Visit OGGF portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <DiasporaRegistrationDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
