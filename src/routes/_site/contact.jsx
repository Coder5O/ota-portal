import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { submitEnquiry } from "@/lib/ota-fns";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact OTA · Ovaherero Traditional Authority" },
      { name: "description", content: "Official contact details and enquiry form of the Ovaherero Traditional Authority." },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.SiteConfig.list({ sort: "-updated_date", limit: 1 });
    return { config: page.items?.[0] || null };
  },
  component: ContactPage,
});

const KINDS = ["General enquiry", "Membership query", "Document request", "Media request", "Profile correction"];

function ContactPage() {
  const { config } = Route.useLoaderData();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "", kind: "General enquiry" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      toast.error("Please give your name, email address and a message.");
      return;
    }
    setSubmitting(true);
    try {
      await submitEnquiry({ data: { ...form, subject: form.subject || form.kind } });
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "", kind: "General enquiry" });
    } catch (error) {
      toast.error("The enquiry could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Write to the Authority."
        intro="Enquiries, membership questions, document requests and media enquiries are received by the office and referred to the responsible structure."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div>
            {sent ? (
              <div className="border border-border bg-card p-8">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <h2 className="mt-4 font-display text-2xl">Your enquiry has been received</h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                  The office will respond to the contact details you provided. Enquiries are recorded in the
                  administration's register.
                </p>
                <Button variant="outline" className="mt-6 rounded-none" onClick={() => setSent(false)}>
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Name *</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5 rounded-none text-[13.5px]" />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5 rounded-none text-[13.5px]" />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Telephone</Label>
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5 rounded-none text-[13.5px]" />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Type of enquiry</Label>
                  <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
                    <SelectTrigger className="mt-1.5 rounded-none text-[13.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KINDS.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {kind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Subject</Label>
                  <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="mt-1.5 rounded-none text-[13.5px]" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Message *</Label>
                  <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={6} className="mt-1.5 rounded-none text-[13.5px]" />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <Button
                    className="rounded-none bg-[hsl(var(--primary))] px-7 text-[11.5px] uppercase tracking-[0.14em]"
                    disabled={submitting}
                    onClick={submit}
                  >
                    {submitting ? "Sending…" : "Send enquiry"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Do not include sensitive personal information in this form.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="border border-border bg-card p-6">
              <p className="eyebrow">Office</p>
              {config?.contact_email || config?.contact_phone || config?.office_address ? (
                <ul className="mt-4 space-y-4 text-[13px] text-foreground/80">
                  {config?.office_address ? (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="whitespace-pre-line">{config.office_address}</span>
                    </li>
                  ) : null}
                  {config?.contact_phone ? (
                    <li className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{config.contact_phone}</span>
                    </li>
                  ) : null}
                  {config?.contact_email ? (
                    <li className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{config.contact_email}</span>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                  Official office details have not been published yet. They are configured by the OTA administration in
                  the Administrator Console.
                </p>
              )}
              {config?.office_hours ? (
                <p className="mt-4 border-t border-border pt-3 text-[11.5px] text-muted-foreground">{config.office_hours}</p>
              ) : null}
            </div>

            <div className="border border-border bg-card p-6">
              <p className="eyebrow">Membership</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/70">
                Applying for membership, leadership recognition or community registration? Use the registration form so
                your application receives a reference and enters the review process.
              </p>
              <Button asChild variant="outline" className="mt-4 rounded-none border-foreground/25 text-[11px] uppercase tracking-[0.14em]">
                <Link to="/membership">Registration form</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}