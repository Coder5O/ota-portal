import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Compass,
  Eye,
  FileCheck,
  Globe2,
  HeartHandshake,
  ImageIcon,
  Info,
  Landmark,
  Layers,
  Mail,
  Megaphone,
  Newspaper,
  ScrollText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export const DEFAULT_HERO_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/934e2f759_generated_image.png";
export const DEFAULT_DETAIL_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/a4f4fd11b_generated_image.png";

export const Route = createFileRoute("/_authed/admin/settings")({
  validateSearch: (search) => ({
    tab: typeof search?.tab === "string" ? search.tab : "branding",
  }),
  component: SettingsPage,
});

const EMPTY = {
  organisation_name: "Ovaherero Traditional Authority",
  tagline: "Republic of Namibia",
  monogram_text: "OTA",
  logo_url: "",
  favicon_url: "",

  // ── Homepage Slideshow & Customary Numbers (4 slides) ─────────────
  home_hero_image: "",
  slide_1_image: "",
  slide_1_number: "36+",
  slide_1_label: "Recognised Communities",
  slide_1_title: "United under the Red Flag, guardians of custom and continuity.",
  slide_1_desc: "The official digital home of the Ovaherero Traditional Authority — its leadership, institutions, constitution, and communities in Namibia and across the diaspora.",

  slide_2_image: "",
  slide_2_number: "8",
  slide_2_label: "Constitutional Chapters",
  slide_2_title: "8 Constitutional Chapters: Supreme Customary Law & Governance.",
  slide_2_desc: "Promulgated 22 August 2022, codifying democratic customary governance, the High Chiefs Council, and communal self-determination.",

  slide_3_image: "",
  slide_3_number: "14",
  slide_3_label: "Customary Organs",
  slide_3_title: "14 Customary Organs: Traditional Senate, High Councils & OGGF.",
  slide_3_desc: "Structured customary governance encompassing the Senate of Chiefs, Council of Traditional Leaders, youth councils, and the Genocide Foundation.",

  slide_4_image: "",
  slide_4_number: "103",
  slide_4_label: "Years Sacred Memorial",
  slide_4_title: "103 Years of Sacred Memorial: Okahandja Assembly (1923–2026).",
  slide_4_desc: "Honouring the eternal covenant of Ombara Samuel Maharero and Ombara Hosea Kutako with annual Red Flag pilgrimage and remembrance.",

  home_detail_image: "",

  // ── Governance & Leadership Tabs ──────────────────────────────────
  constitution_hero_image: "",
  leadership_hero_image: "",
  paramount_chief_hero_image: "",
  paramount_chief_portrait: "",

  // ── Customary & Community Tabs ────────────────────────────────────
  about_hero_image: "",
  about_feature_image: "",
  culture_hero_image: "",
  culture_gallery_1: "",
  culture_gallery_2: "",
  communities_hero_image: "",
  communities_feature_image: "",
  diaspora_hero_image: "",
  diaspora_feature_image: "",
  oggf_hero_image: "",
  oggf_feature_image: "",

  // ── Public Services & Assembly Tabs ───────────────────────────────
  events_hero_image: "",
  news_hero_image: "",
  membership_hero_image: "",
  projects_hero_image: "",
  contact_hero_image: "",
  verify_hero_image: "",
  search_hero_image: "",
  privacy_hero_image: "",

  // ── Operations & General ──────────────────────────────────────────
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
  const searchParams = Route.useSearch();
  const [activeTab, setActiveTab] = useState(searchParams?.tab || "branding");
  const [form, setForm] = useState(EMPTY);
  const [recordId, setRecordId] = useState(null);
  const queryClient = useQueryClient();

  const config = useQuery({
    queryKey: ["site-config"],
    queryFn: () => base44.entities.SiteConfig.list({ sort: "-updated_date", limit: 1 }),
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
      toast.success("Institutional customization & settings saved successfully.");
    },
    onError: (err) => toast.error("Settings could not be saved: " + (err?.message || "Unknown error")),
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHead
        title="Website Customization & Settings"
        description="Easily customize logos, homepage slideshow, milestone numbers, and banner photos for every tab on the portal."
        action={
          <div className="flex items-center gap-3">
            <Button
              className="rounded-none bg-gold px-6 text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving..." : "Save all changes"}
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border border-border bg-card p-1.5">
          <TabsTrigger
            value="branding"
            className="rounded-none data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-primary-foreground text-[12px] uppercase tracking-wider"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Logo & Identity
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="rounded-none data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-primary-foreground text-[12px] uppercase tracking-wider"
          >
            <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
            All Page Images &amp; Slideshow
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="rounded-none data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-primary-foreground text-[12px] uppercase tracking-wider"
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Contact & Operations
          </TabsTrigger>
          <TabsTrigger
            value="notices"
            className="rounded-none data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-primary-foreground text-[12px] uppercase tracking-wider"
          >
            <Megaphone className="mr-1.5 h-3.5 w-3.5" />
            Notices & System
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Logo & Branding ─────────────────────────────────────── */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-5 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Official Logo & Emblem</h2>
              </div>

              <ImageUploader
                label="Primary Institutional Logo"
                value={form.logo_url}
                onChange={(url) => set("logo_url", url)}
                hint="Displayed in the main website header and mobile navigation. Recommended format: SVG or transparent PNG."
                aspect="square"
                previewHeight="h-32"
              />

              <Field label="Monogram Initials" hint="Shown in the square badge if no logo image is uploaded.">
                <Input
                  value={form.monogram_text || "OTA"}
                  onChange={(e) => set("monogram_text", e.target.value)}
                  placeholder="OTA"
                  maxLength={6}
                  className="rounded-none uppercase tracking-widest text-[13px]"
                />
              </Field>

              <Field label="Full Official Title" hint="Shown in the browser title and public header.">
                <Input
                  value={form.organisation_name || "Ovaherero Traditional Authority"}
                  onChange={(e) => set("organisation_name", e.target.value)}
                  placeholder="Ovaherero Traditional Authority"
                  className="rounded-none text-[13px]"
                />
              </Field>

              <Field label="National Subtitle / Tagline">
                <Input
                  value={form.tagline || "Republic of Namibia"}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Republic of Namibia"
                  className="rounded-none text-[13px]"
                />
              </Field>
            </section>

            <section className="space-y-5 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Eye className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Header & Footer Live Preview</h2>
              </div>

              <div className="space-y-4">
                <p className="text-[12px] text-muted-foreground">Header display preview:</p>
                <div className="flex items-center gap-3 border border-border bg-background p-4">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-11 w-11 object-contain" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center border border-gold/50 bg-[hsl(var(--primary))] text-primary-foreground">
                      <span className="font-display text-[0.95rem]">{form.monogram_text || "OTA"}</span>
                    </span>
                  )}
                  <div className="leading-tight">
                    <span className="block font-display text-[1.05rem] text-foreground">
                      {form.organisation_name || "Ovaherero Traditional Authority"}
                    </span>
                    <span className="block text-[9.5px] uppercase tracking-[0.24em] text-muted-foreground">
                      {form.tagline || "Republic of Namibia"}
                    </span>
                  </div>
                </div>

                <div className="rounded border border-gold/30 bg-gold/5 p-4 text-[12px] text-foreground/80">
                  <p className="font-medium text-foreground">Tip:</p>
                  <p className="mt-1">
                    When you upload an official emblem here, it is automatically saved to Firebase Storage and
                    replaces the default square box on both the desktop and mobile headers.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ── Tab 2: Page Images & Slideshow Manager ─────────────────────── */}
        <TabsContent value="images" className="space-y-8">
          {/* Top Sticky Action Bar */}
          <div className="flex flex-col justify-between gap-4 border border-gold/40 bg-card p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <h2 className="font-display text-lg text-foreground">Universal Visual Asset &amp; Slideshow Manager</h2>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                All changes made here are saved directly to Firebase and immediately update the public website.
              </p>
            </div>
            <Button
              className="rounded-none bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving..." : "Save All Visual Changes"}
            </Button>
          </div>

          {/* 1. HOMEPAGE SLIDESHOW & GOVERNANCE NUMBERS */}
          <section className="space-y-6 border-2 border-gold/40 bg-card p-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center bg-gold/15 text-gold">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-foreground">
                    Homepage Hero Slideshow &amp; Governance Numbers (4 Interactive Slides)
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    Customize each slide's background photo, metric number, label, headline, and narrative. These 4 slides cycle automatically in both the hero and the live metrics bar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Slide 1 */}
              <div className="space-y-4 border border-border bg-background p-5">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Slide 1 · Customary Homeland
                  </span>
                  <span className="font-display text-xl text-gold font-bold">{form.slide_1_number || "36+"}</span>
                </div>

                <ImageUploader
                  label="Slide 1 Photo (Ovaherero Women Under Red Flag)"
                  value={form.slide_1_image || form.home_hero_image}
                  fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                  onChange={(url) => {
                    set("slide_1_image", url);
                    set("home_hero_image", url);
                  }}
                  hint="Banner format (1600×900 recommended)"
                  aspect="banner"
                  previewHeight="h-40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Metric Number">
                    <Input
                      value={form.slide_1_number || "36+"}
                      onChange={(e) => set("slide_1_number", e.target.value)}
                      placeholder="36+"
                      className="rounded-none text-[13px] font-bold"
                    />
                  </Field>
                  <Field label="Metric Label">
                    <Input
                      value={form.slide_1_label || "Recognised Communities"}
                      onChange={(e) => set("slide_1_label", e.target.value)}
                      placeholder="Recognised Communities"
                      className="rounded-none text-[13px]"
                    />
                  </Field>
                </div>

                <Field label="Slide Headline">
                  <Input
                    value={form.slide_1_title || ""}
                    onChange={(e) => set("slide_1_title", e.target.value)}
                    placeholder="United under the Red Flag, guardians of custom and continuity."
                    className="rounded-none text-[13px]"
                  />
                </Field>

                <Field label="Slide Description">
                  <Textarea
                    rows={2}
                    value={form.slide_1_desc || ""}
                    onChange={(e) => set("slide_1_desc", e.target.value)}
                    placeholder="The official digital home of the Ovaherero Traditional Authority..."
                    className="rounded-none text-[12.5px]"
                  />
                </Field>
              </div>

              {/* Slide 2 */}
              <div className="space-y-4 border border-border bg-background p-5">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Slide 2 · Constitutional Order
                  </span>
                  <span className="font-display text-xl text-gold font-bold">{form.slide_2_number || "8"}</span>
                </div>

                <ImageUploader
                  label="Slide 2 Photo (Spitzkoppe Granite Peaks at Sunset)"
                  value={form.slide_2_image}
                  fallback="/images/slides/spitzkoppe-sunset.jpg"
                  onChange={(url) => set("slide_2_image", url)}
                  hint="Banner format (1600×900 recommended)"
                  aspect="banner"
                  previewHeight="h-40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Metric Number">
                    <Input
                      value={form.slide_2_number || "8"}
                      onChange={(e) => set("slide_2_number", e.target.value)}
                      placeholder="8"
                      className="rounded-none text-[13px] font-bold"
                    />
                  </Field>
                  <Field label="Metric Label">
                    <Input
                      value={form.slide_2_label || "Constitutional Chapters"}
                      onChange={(e) => set("slide_2_label", e.target.value)}
                      placeholder="Constitutional Chapters"
                      className="rounded-none text-[13px]"
                    />
                  </Field>
                </div>

                <Field label="Slide Headline">
                  <Input
                    value={form.slide_2_title || ""}
                    onChange={(e) => set("slide_2_title", e.target.value)}
                    placeholder="8 Constitutional Chapters: Supreme Customary Law & Governance."
                    className="rounded-none text-[13px]"
                  />
                </Field>

                <Field label="Slide Description">
                  <Textarea
                    rows={2}
                    value={form.slide_2_desc || ""}
                    onChange={(e) => set("slide_2_desc", e.target.value)}
                    placeholder="Promulgated 22 August 2022, codifying democratic customary governance..."
                    className="rounded-none text-[12.5px]"
                  />
                </Field>
              </div>

              {/* Slide 3 */}
              <div className="space-y-4 border border-border bg-background p-5">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Slide 3 · Customary Organs &amp; Senate
                  </span>
                  <span className="font-display text-xl text-gold font-bold">{form.slide_3_number || "14"}</span>
                </div>

                <ImageUploader
                  label="Slide 3 Photo (Oryx on Kalahari Red Dunes)"
                  value={form.slide_3_image}
                  fallback="/images/slides/oryx-dunes.jpg"
                  onChange={(url) => set("slide_3_image", url)}
                  hint="Banner format (1600×900 recommended)"
                  aspect="banner"
                  previewHeight="h-40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Metric Number">
                    <Input
                      value={form.slide_3_number || "14"}
                      onChange={(e) => set("slide_3_number", e.target.value)}
                      placeholder="14"
                      className="rounded-none text-[13px] font-bold"
                    />
                  </Field>
                  <Field label="Metric Label">
                    <Input
                      value={form.slide_3_label || "Customary Organs"}
                      onChange={(e) => set("slide_3_label", e.target.value)}
                      placeholder="Customary Organs"
                      className="rounded-none text-[13px]"
                    />
                  </Field>
                </div>

                <Field label="Slide Headline">
                  <Input
                    value={form.slide_3_title || ""}
                    onChange={(e) => set("slide_3_title", e.target.value)}
                    placeholder="14 Customary Organs: Traditional Senate, High Councils & OGGF."
                    className="rounded-none text-[13px]"
                  />
                </Field>

                <Field label="Slide Description">
                  <Textarea
                    rows={2}
                    value={form.slide_3_desc || ""}
                    onChange={(e) => set("slide_3_desc", e.target.value)}
                    placeholder="Structured customary governance encompassing the Senate of Chiefs..."
                    className="rounded-none text-[12.5px]"
                  />
                </Field>
              </div>

              {/* Slide 4 */}
              <div className="space-y-4 border border-border bg-background p-5">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Slide 4 · Sacred Memorial &amp; Okahandja
                  </span>
                  <span className="font-display text-xl text-gold font-bold">{form.slide_4_number || "103"}</span>
                </div>

                <ImageUploader
                  label="Slide 4 Photo (Camelthorn Acacia Under Etosha Sky)"
                  value={form.slide_4_image}
                  fallback="/images/slides/namibia-acacia.jpg"
                  onChange={(url) => set("slide_4_image", url)}
                  hint="Banner format (1600×900 recommended)"
                  aspect="banner"
                  previewHeight="h-40"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Metric Number">
                    <Input
                      value={form.slide_4_number || "103"}
                      onChange={(e) => set("slide_4_number", e.target.value)}
                      placeholder="103"
                      className="rounded-none text-[13px] font-bold"
                    />
                  </Field>
                  <Field label="Metric Label">
                    <Input
                      value={form.slide_4_label || "Years Sacred Memorial"}
                      onChange={(e) => set("slide_4_label", e.target.value)}
                      placeholder="Years Sacred Memorial"
                      className="rounded-none text-[13px]"
                    />
                  </Field>
                </div>

                <Field label="Slide Headline">
                  <Input
                    value={form.slide_4_title || ""}
                    onChange={(e) => set("slide_4_title", e.target.value)}
                    placeholder="103 Years of Sacred Memorial: Okahandja Assembly (1923–2026)."
                    className="rounded-none text-[13px]"
                  />
                </Field>

                <Field label="Slide Description">
                  <Textarea
                    rows={2}
                    value={form.slide_4_desc || ""}
                    onChange={(e) => set("slide_4_desc", e.target.value)}
                    placeholder="Honouring the eternal covenant of Ombara Samuel Maharero and Ombara Hosea Kutako..."
                    className="rounded-none text-[12.5px]"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* 2. HOMEPAGE CHIEF'S MESSAGE PORTRAIT */}
          <section className="space-y-5 border border-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Landmark className="h-5 w-5 text-gold" />
              <div>
                <h3 className="font-display text-xl">Homepage Cultural Detail / Paramount Chief Section Portrait</h3>
                <p className="text-[12px] text-muted-foreground">
                  The vertical photograph displayed alongside "A house of governance rooted in the dignity of our people" (with the 22 August 2022 seal).
                </p>
              </div>
            </div>

            <ImageUploader
              label="Cultural Feature Portrait (Ceremonial Dress / Regalia)"
              value={form.home_detail_image}
              fallback={DEFAULT_DETAIL_IMAGE}
              onChange={(url) => set("home_detail_image", url)}
              hint="Portrait ratio (4:5 recommended)"
              aspect="portrait"
              previewHeight="h-48"
            />
          </section>

          {/* 3. GOVERNANCE & LEGAL TABS */}
          <section className="space-y-6 border border-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ScrollText className="h-5 w-5 text-gold" />
              <div>
                <h3 className="font-display text-xl">Governance &amp; Leadership Banners</h3>
                <p className="text-[12px] text-muted-foreground">
                  Hero banners for constitutional texts, leadership directories, and the Paramount Chieftaincy.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /constitution</span>
                <h4 className="mt-1 font-display text-base">The Constitution Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Constitution Hero"
                    value={form.constitution_hero_image}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("constitution_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /leadership</span>
                <h4 className="mt-1 font-display text-base">Traditional Leadership Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Leadership Hero"
                    value={form.leadership_hero_image}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("leadership_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /paramount-chief</span>
                <h4 className="mt-1 font-display text-base">Paramount Chief Page Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Paramount Chief Hero"
                    value={form.paramount_chief_hero_image}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("paramount_chief_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Portrait Photo</span>
                <h4 className="mt-1 font-display text-base">Paramount Chief Official Portrait</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Official Chieftaincy Portrait"
                    value={form.paramount_chief_portrait}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("paramount_chief_portrait", url)}
                    aspect="portrait"
                    previewHeight="h-32"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 4. CUSTOMARY, HERITAGE & COMMUNITY TABS */}
          <section className="space-y-6 border border-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Compass className="h-5 w-5 text-gold" />
              <div>
                <h3 className="font-display text-xl">Customary, Community &amp; Heritage Tabs</h3>
                <p className="text-[12px] text-muted-foreground">
                  Imagery for About OTA, Customary Heritage, Traditional Communities, Global Diaspora, and the Genocide Foundation.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* About Page Hero & Feature */}
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /about</span>
                <h4 className="mt-1 font-display text-base">About OTA Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="About Hero Banner"
                    value={form.about_hero_image}
                    fallback="/images/slides/spitzkoppe-sunset.jpg"
                    onChange={(url) => set("about_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /about (Feature)</span>
                <h4 className="mt-1 font-display text-base">About Heritage Story Card</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Red Flag Assembly Card"
                    value={form.about_feature_image}
                    fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                    onChange={(url) => set("about_feature_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              {/* Culture & Heritage */}
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /culture</span>
                <h4 className="mt-1 font-display text-base">Culture &amp; Heritage Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Culture Hero Banner"
                    value={form.culture_hero_image}
                    fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                    onChange={(url) => set("culture_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /culture (Gallery 1)</span>
                <h4 className="mt-1 font-display text-base">Culture Gallery 1 (Procession)</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Otjiserandu Convocations"
                    value={form.culture_gallery_1}
                    fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                    onChange={(url) => set("culture_gallery_1", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /culture (Gallery 2)</span>
                <h4 className="mt-1 font-display text-base">Culture Gallery 2 (Ceremonial)</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Custodians of Holy Fire"
                    value={form.culture_gallery_2}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("culture_gallery_2", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              {/* Communities */}
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /communities</span>
                <h4 className="mt-1 font-display text-base">Recognised Communities Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Communities Hero"
                    value={form.communities_hero_image}
                    fallback="/images/slides/namibia-acacia.jpg"
                    onChange={(url) => set("communities_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              {/* Diaspora */}
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /diaspora</span>
                <h4 className="mt-1 font-display text-base">Global Diaspora Chapters Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="Diaspora Hero"
                    value={form.diaspora_hero_image}
                    fallback="/images/slides/oryx-dunes.jpg"
                    onChange={(url) => set("diaspora_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>

              {/* OGGF Foundation */}
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /oggf</span>
                <h4 className="mt-1 font-display text-base">OGGF Restorative Justice Banner</h4>
                <div className="mt-3">
                  <ImageUploader
                    label="OGGF Hero Banner"
                    value={form.oggf_hero_image}
                    fallback="/images/slides/spitzkoppe-sunset.jpg"
                    onChange={(url) => set("oggf_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-32"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 5. PUBLIC SERVICES & ASSEMBLY TABS */}
          <section className="space-y-6 border border-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <CalendarDays className="h-5 w-5 text-gold" />
              <div>
                <h3 className="font-display text-xl">Public Services, Assemblies &amp; Communications Banners</h3>
                <p className="text-[12px] text-muted-foreground">
                  Hero banners for events, news communiqués, membership applications, strategic projects, contact, document verification, search, and privacy policy.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /events</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Events &amp; Commemorations</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Events Banner"
                    value={form.events_hero_image}
                    fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                    onChange={(url) => set("events_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /news</span>
                <h4 className="mt-1 font-display text-sm font-semibold">News &amp; Media Statements</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="News Banner"
                    value={form.news_hero_image}
                    fallback="/images/slides/spitzkoppe-sunset.jpg"
                    onChange={(url) => set("news_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /membership</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Customary Membership</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Membership Banner"
                    value={form.membership_hero_image}
                    fallback="/images/heritage/ovaherero-women-red-flag.jpg"
                    onChange={(url) => set("membership_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /projects</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Strategic Projects</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Projects Banner"
                    value={form.projects_hero_image}
                    fallback="/images/slides/namibia-acacia.jpg"
                    onChange={(url) => set("projects_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /contact</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Contact Head Office</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Contact Banner"
                    value={form.contact_hero_image}
                    fallback="/images/slides/spitzkoppe-sunset.jpg"
                    onChange={(url) => set("contact_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /verify</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Document Verification</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Verify Banner"
                    value={form.verify_hero_image}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("verify_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /search</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Universal Search</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Search Banner"
                    value={form.search_hero_image}
                    fallback="/images/slides/spitzkoppe-sunset.jpg"
                    onChange={(url) => set("search_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>

              <div className="border border-border bg-background p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold">Route: /privacy</span>
                <h4 className="mt-1 font-display text-sm font-semibold">Privacy Policy</h4>
                <div className="mt-2.5">
                  <ImageUploader
                    label="Privacy Banner"
                    value={form.privacy_hero_image}
                    fallback="/images/heritage/paramount-chief-ceremonial-dress.jpg"
                    onChange={(url) => set("privacy_hero_image", url)}
                    aspect="banner"
                    previewHeight="h-28"
                  />
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* ── Tab 3: Contact & Operations ─────────────────────────────────── */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Building2 className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Public Contact Information</h2>
              </div>

              <Field label="Official Contact Email" hint="Displayed on public contact pages and footer.">
                <Input
                  value={form.contact_email || ""}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="info@ota.gov.na"
                  className="rounded-none text-[13px]"
                />
              </Field>

              <Field label="Telephone / Contact Line">
                <Input
                  value={form.contact_phone || ""}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+264 (0) 61 ..."
                  className="rounded-none text-[13px]"
                />
              </Field>

              <Field label="Physical Headquarters Address">
                <Textarea
                  value={form.office_address || ""}
                  rows={3}
                  onChange={(e) => set("office_address", e.target.value)}
                  placeholder="Okahandja / Windhoek, Republic of Namibia"
                  className="rounded-none text-[13px]"
                />
              </Field>

              <Field label="Operating Office Hours">
                <Input
                  value={form.office_hours || ""}
                  onChange={(e) => set("office_hours", e.target.value)}
                  placeholder="Monday to Friday: 08:00 – 17:00"
                  className="rounded-none text-[13px]"
                />
              </Field>
            </section>

            <section className="space-y-4 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Info className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Footer Statement & Notice</h2>
              </div>

              <Field label="Footer Description" hint="Shown in the left column of the footer across all public pages.">
                <Textarea
                  value={form.footer_note || ""}
                  rows={4}
                  onChange={(e) => set("footer_note", e.target.value)}
                  placeholder="The official digital home of the Ovaherero Traditional Authority..."
                  className="rounded-none text-[13px]"
                />
              </Field>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between border border-border p-3">
                  <div>
                    <p className="text-[12.5px] font-medium">Digital Membership Cards</p>
                    <p className="text-[11px] text-muted-foreground">
                      Allows approved members to view and print their cards in the portal.
                    </p>
                  </div>
                  <Switch
                    checked={!!form.membership_card_enabled}
                    onCheckedChange={(v) => set("membership_card_enabled", v)}
                  />
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        {/* ── Tab 4: Notices & System ─────────────────────────────────────── */}
        <TabsContent value="notices" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Megaphone className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Site-Wide Announcement Banner</h2>
              </div>

              <Field
                label="Urgent Public Notice"
                hint="Displayed as an announcement ribbon at the top of every page. Leave empty to disable."
              >
                <Textarea
                  value={form.notice || ""}
                  rows={4}
                  onChange={(e) => set("notice", e.target.value)}
                  placeholder="e.g. Notice regarding the upcoming Commemoration Assembly..."
                  className="rounded-none text-[13px]"
                />
              </Field>
            </section>

            <section className="space-y-4 border border-border bg-card p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Info className="h-5 w-5 text-gold" />
                <h2 className="font-display text-xl">Maintenance Controls</h2>
              </div>

              <div className="flex items-center justify-between border border-border p-3">
                <div>
                  <p className="text-[12.5px] font-medium">Maintenance Mode</p>
                  <p className="text-[11px] text-muted-foreground">
                    Shows a maintenance ribbon to public visitors while allowing administrators access.
                  </p>
                </div>
                <Switch checked={!!form.maintenance_mode} onCheckedChange={(v) => set("maintenance_mode", v)} />
              </div>

              <Field label="Maintenance Message">
                <Textarea
                  value={form.maintenance_message || ""}
                  rows={3}
                  onChange={(e) => set("maintenance_message", e.target.value)}
                  placeholder="The portal is undergoing scheduled maintenance."
                  className="rounded-none text-[13px]"
                />
              </Field>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
