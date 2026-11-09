import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { submitApplication } from "@/lib/ota-fns";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEMBERSHIP_CATEGORIES, APPLICATION_STATUSES } from "@/lib/institutions";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/membership")({
  head: () => ({
    meta: [
      { title: "Membership Registration · Ovaherero Traditional Authority" },
      { name: "description", content: "Apply for membership, leadership recognition or community registration with the Ovaherero Traditional Authority." },
    ],
  }),
  component: MembershipPage,
});

const EMPTY = {
  full_name: "",
  preferred_name: "",
  email: "",
  phone: "",
  category: "individual",
  country: "Namibia",
  region: "",
  community_name: "",
  diaspora_chapter: "",
  title: "",
  jurisdiction: "",
  appointment_basis: "",
  term_start: "",
  term_end: "",
  purpose: "",
  consent: false,
};

function Field({ label, required, hint, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {required ? <span className="text-[hsl(var(--oxblood))]"> *</span> : null}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function MembershipPage() {
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const isLeader = form.category === "traditional_leader" || form.category === "chiefs_council";
  const isDiaspora = form.category === "diaspora";
  const isCommunity = form.category === "traditional_community";

  const upload = async (file) => {
    if (!file) return;
    if (files.length >= 5) {
      toast.error("Up to five documents may be attached.");
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setFiles((prev) => [...prev, { name: file.name, uri: file_uri }]);
      toast.success("Document uploaded (stored privately)");
    } catch (error) {
      toast.error("The document could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Your full name and email address are required.");
      return;
    }
    if (form.purpose.trim().length < 10) {
      toast.error("Please state the purpose of your application.");
      return;
    }
    if (!form.consent) {
      toast.error("Please confirm the declaration before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitApplication({
        data: { ...form, documents: files, document_uris: files.map((f) => f.uri) },
      });
      setResult(response);
      setForm(EMPTY);
      setFiles([]);
    } catch (error) {
      toast.error("The application could not be submitted. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <>
        <PageHero eyebrow="Registration" title="Application received." intro="Your application has been recorded and referred to the administration for review." />
        <Section>
          <div className="mx-auto max-w-2xl border border-border bg-card p-8">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            {result.duplicate ? (
              <>
                <h2 className="mt-4 font-display text-2xl">An application already exists</h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                  An application for this email address and category is already registered with the status
                  <strong className="mx-1 font-medium">{result.status}</strong>. Please contact the office if you need to
                  amend or follow up on it.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-display text-2xl">Your reference number</h2>
                <p className="mt-3 font-mono text-2xl tracking-wide text-[hsl(var(--primary))]">{result.reference}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                  Keep this reference for any correspondence. Your application is now marked{" "}
                  <strong className="font-medium">{result.status}</strong>. Submitting an application does not confer
                  membership, recognition or office: a decision is made by the administration after review.
                </p>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-none bg-[hsl(var(--primary))]">
                <Link to="/">Return to the home page</Link>
              </Button>
              <Button variant="outline" className="rounded-none" onClick={() => setResult(null)}>
                Submit another application
              </Button>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Registration"
        title="Apply for membership or registration."
        intro="Individuals, traditional leaders, communities, councils and diaspora chapters apply here. Every application is reviewed by the administration before any membership or recognition is conferred."
        image="/images/heritage/ovaherero-women-red-flag.jpg"
        imageKey="membership_hero_image"
        imageAlt="Ovaherero Traditional Authority membership registration"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Application category" required full>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="rounded-none text-[13.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Full name" required>
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>
              <Field label="Preferred name">
                <Input value={form.preferred_name} onChange={(e) => set("preferred_name", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>
              <Field label="Email address" required>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>
              <Field label="Telephone">
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>
              <Field label="Country of residence">
                <Input value={form.country} onChange={(e) => set("country", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>
              <Field label={isDiaspora ? "Region or state" : "Region"}>
                <Input value={form.region} onChange={(e) => set("region", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>

              {isDiaspora ? (
                <Field label="Diaspora chapter" full hint="The chapter or community abroad you are affiliated with, if any.">
                  <Input value={form.diaspora_chapter} onChange={(e) => set("diaspora_chapter", e.target.value)} className="rounded-none text-[13.5px]" />
                </Field>
              ) : null}

              <Field label={isCommunity ? "Community or chapter name" : "Traditional community"} full>
                <Input value={form.community_name} onChange={(e) => set("community_name", e.target.value)} className="rounded-none text-[13.5px]" />
              </Field>

              {isLeader ? (
                <>
                  <Field label="Customary title">
                    <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-none text-[13.5px]" />
                  </Field>
                  <Field label="Community represented">
                    <Input value={form.jurisdiction} onChange={(e) => set("jurisdiction", e.target.value)} className="rounded-none text-[13.5px]" />
                  </Field>
                  <Field
                    label="Appointment or election"
                    full
                    hint="How and when the appointment or election took place, with gazette or recognition evidence where applicable."
                  >
                    <Textarea
                      value={form.appointment_basis}
                      onChange={(e) => set("appointment_basis", e.target.value)}
                      rows={3}
                      className="rounded-none text-[13.5px]"
                    />
                  </Field>
                  <Field label="Term start">
                    <Input type="date" value={form.term_start} onChange={(e) => set("term_start", e.target.value)} className="rounded-none text-[13.5px]" />
                  </Field>
                  <Field label="Term end">
                    <Input type="date" value={form.term_end} onChange={(e) => set("term_end", e.target.value)} className="rounded-none text-[13.5px]" />
                  </Field>
                </>
              ) : null}

              <Field label="Purpose of the application" required full hint="For example: to register as a member of my community; to register a diaspora chapter; to submit recognition evidence.">
                <Textarea value={form.purpose} onChange={(e) => set("purpose", e.target.value)} rows={4} className="rounded-none text-[13.5px]" />
              </Field>

              <Field
                label="Supporting documents"
                full
                hint="Optional. Recognition letters, gazette notices or identification. Files are stored privately; only authorised administrators can open them."
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" className="rounded-none" disabled={uploading}>
                    <label className="cursor-pointer">
                      {uploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                      {uploading ? "Uploading…" : "Attach document"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => upload(e.target.files?.[0])}
                      />
                    </label>
                  </Button>
                  {files.map((file) => (
                    <span key={file.uri} className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-[11.5px]">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {file.name}
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setFiles((prev) => prev.filter((f) => f.uri !== file.uri))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </Field>

              <div className="sm:col-span-2 flex items-start gap-3 border border-border bg-card p-4">
                <Checkbox
                  id="consent"
                  checked={form.consent}
                  onCheckedChange={(v) => set("consent", !!v)}
                  className="mt-0.5"
                />
                <label htmlFor="consent" className="text-[12.5px] leading-relaxed text-foreground/75">
                  I declare that the information given is true, and I consent to the Ovaherero Traditional Authority
                  processing it to consider this application, in accordance with the{" "}
                  <Link to="/privacy" className="underline decoration-gold/60 underline-offset-4">
                    privacy and data protection notice
                  </Link>
                  .
                </label>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button className="rounded-none bg-[hsl(var(--primary))] px-7 text-[11.5px] uppercase tracking-[0.14em]" disabled={submitting} onClick={submit}>
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
              <p className="text-[11.5px] text-muted-foreground">
                Your reference number is issued immediately. No account is required to apply.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-border bg-card p-6">
              <p className="eyebrow">What happens next</p>
              <ol className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-foreground/70">
                <li>
                  <span className="font-medium text-foreground/90">1. Reference issued.</span> Your application is stored
                  with a unique reference and marked Submitted.
                </li>
                <li>
                  <span className="font-medium text-foreground/90">2. Review.</span> The administration reviews it and may
                  request further information.
                </li>
                <li>
                  <span className="font-medium text-foreground/90">3. Decision.</span> Approval creates a membership
                  record and number; a rejection records its reason.
                </li>
                <li>
                  <span className="font-medium text-foreground/90">4. Portal access.</span> Approved members receive an
                  invitation to sign in to the member portal.
                </li>
              </ol>
            </div>
            <div className="border border-border bg-card p-6">
              <p className="eyebrow">Application statuses</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {APPLICATION_STATUSES.map((status) => (
                  <li key={status} className="border border-border px-2 py-1 text-[10.5px] uppercase tracking-[0.1em] text-foreground/60">
                    {status}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}