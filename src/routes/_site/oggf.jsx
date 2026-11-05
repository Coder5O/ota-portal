import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/oggf")({
  head: () => ({
    meta: [
      { title: "Ovaherero Global Genocide Foundation (OGGF) · OTA" },
      {
        name: "description",
        content:
          "Official portal for historical research, advocacy, reparations, restorative justice, and the repatriation of ancestral human remains and cultural artefacts.",
      },
    ],
  }),
  loader: async () => {
    const [inst, docs, events] = await Promise.all([
      base44.entities.Institution.filter(
        { slug: "ovaherero-genocide-foundation" },
        { limit: 1 },
      ),
      base44.entities.Document.filter(
        { institution_slug: "ovaherero-genocide-foundation", visibility: "public" },
        { sort: "-created_date", limit: 20 },
      ),
      base44.entities.Event.filter(
        { organising_structure: "Ovaherero Global Genocide Foundation", status: "published" },
        { sort: "starts_at", limit: 6 },
      ),
    ]);

    return {
      institution: inst.items?.[0] || null,
      documents: docs.items || [],
      events: events.items || [],
    };
  },
  component: OGGFPage,
});

function OGGFPage() {
  const { institution, documents, events } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Truth · Justice · Restitution"
        title="Ovaherero Global Genocide Foundation"
        intro="The dedicated institutional body of the Ovaherero Traditional Authority mandated with research, international advocacy, restorative justice, and the return of ancestral remains and sacred artefacts."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="rounded-none bg-[hsl(var(--gold))] text-[12px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90"
          >
            <Link to="/membership">Join the Foundation</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-primary-foreground/30 bg-primary-foreground/10 text-[12px] uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Link to="/contact">Contact OGGF Secretariat</Link>
          </Button>
        </div>
      </PageHero>

      {/* Core Mandate Pillars */}
      <Section eyebrow="Strategic Pillars" title="Pillars of Restorative Justice">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border bg-card p-6">
            <Scale className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-lg">Reparations & Restitution</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
              Pursuing international legal advocacy, diplomatic engagements, and restorative justice
              initiatives for the 1904–1908 genocide perpetrated against the Ovaherero people.
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <Landmark className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-lg">Repatriation of Ancestral Remains</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
              Systematic identification, claim, and dignified repatriation of ancestral human remains
              and looted cultural artefacts currently held in foreign museums and collections.
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <BookOpen className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-lg">Historical Research & Education</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
              Preserving authentic oral testimonies, publishing verified historical documentation,
              and developing educational curricula for youth, scholars, and global awareness.
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <Sparkles className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-lg">Memorials & Heritage Preservation</h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
              Identifying, securing, and maintaining historic concentration camp sites, massacre
              grounds, gravesites, and monuments across Namibia, Botswana, and South Africa.
            </p>
          </div>
        </div>
      </Section>

      {/* Publications & Research Summaries */}
      <Section eyebrow="Knowledge & Evidence" title="Approved Publications & Research Summaries" tone="muted">
        {documents.length === 0 ? (
          <EmptyNote>
            Official publications, historical briefs and research summaries are published by the OGGF
            Board of Trustees through the OTA Governance Portal.
          </EmptyNote>
        ) : (
          <div className="divide-y divide-border border border-border bg-card">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gold" />
                    <p className="font-display text-[15px]">{doc.title}</p>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {doc.category || "Research Paper"} · Version {doc.version || "1.0"} ·{" "}
                    {fmtDate(doc.effective_date || doc.created_date)}
                  </p>
                  {doc.description && (
                    <p className="mt-2 max-w-2xl text-[12.5px] text-foreground/75">{doc.description}</p>
                  )}
                </div>
                {doc.file_url ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-none text-[11.5px] uppercase tracking-wider"
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Read publication
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Commemorations & Events */}
      <Section eyebrow="Commemoration" title="Upcoming Commemorations & Symposia">
        {events.length === 0 ? (
          <div className="border border-border bg-card p-6 text-[13px] text-muted-foreground">
            No upcoming public symposia scheduled at this time. Annual commemoration dates are
            promulgated on the OTA official calendar.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <div key={evt.id} className="border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-gold">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-[11px] uppercase tracking-wider">{fmtDate(evt.starts_at)}</span>
                </div>
                <h3 className="mt-2 font-display text-lg">{evt.title}</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">{evt.venue || "To be confirmed"}</p>
                {evt.description && (
                  <p className="mt-2 line-clamp-3 text-[12px] text-foreground/70">{evt.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Transparent Project Information */}
      <Section tone="muted">
        <div className="border border-border bg-card p-8">
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-[11px] uppercase tracking-[0.18em]">Governance & Accountability</p>
          </div>
          <h2 className="mt-3 font-display text-2xl">Transparent Institutional Governance</h2>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-foreground/75">
            The Ovaherero Global Genocide Foundation operates under the oversight of the OTA Chiefs
            Council and Senate. All projects, donor contributions, research affiliations, and
            restitution agreements are governed by strict ethical guidelines and subject to statutory
            independent audit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              asChild
              variant="outline"
              className="rounded-none border-border text-[11.5px] uppercase tracking-wider"
            >
              <Link to="/institutions/ovaherero-genocide-foundation">Structure leadership & board</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-border text-[11.5px] uppercase tracking-wider"
            >
              <Link to="/contact">Submit research inquiry</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
