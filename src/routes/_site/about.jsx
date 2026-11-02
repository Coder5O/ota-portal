import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About the Ovaherero Traditional Authority" },
      { name: "description", content: "History, mandate, aims and objectives of the Ovaherero Traditional Authority." },
    ],
  }),
  loader: async () => {
    const [blocks, institutions] = await Promise.all([
      base44.entities.ContentBlock.filter({ page_slug: "about", status: "published" }, { sort: "sort_order", limit: 50 }),
      base44.entities.Institution.filter({ status: "published" }, { sort: "sort_order", limit: 20 }),
    ]);
    return { blocks: blocks.items || [], institutions: institutions.items || [] };
  },
  component: AboutPage,
});

function AboutPage() {
  const { blocks, institutions } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="About OTA"
        title="An institution of custom, continuity and service."
        intro="The Ovaherero Traditional Authority is constituted to preserve the customs, heritage and governance of the Ovaherero people, and to serve its communities in Namibia and across the diaspora."
      />

      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="History, mandate, aims and objectives are published here by the OTA administration from the Constitution and approved records."
        />
      </Section>

      <Section eyebrow="Structure" title="Organs of the Authority" tone="muted">
        {institutions.length === 0 ? (
          <EmptyNote>Institutional structures are being configured by the administration.</EmptyNote>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <Link key={inst.id} to={`/institutions/${inst.slug}`} className="group bg-card p-6 hover:bg-background">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl leading-snug group-hover:text-[hsl(var(--primary))]">{inst.name}</h3>
                  {inst.is_demo ? <IllustrativeBadge /> : null}
                </div>
                {inst.native_name ? (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{inst.native_name}</p>
                ) : null}
                <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-foreground/65">{inst.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <div className="flex flex-col items-start justify-between gap-6 border border-border bg-card p-8 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Governing text</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Read the Constitution of 22 August 2022</h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-foreground/65">
              The Constitution sets out the Authority's institutions, their functions and the framework within which
              they serve.
            </p>
          </div>
          <Link
            to="/constitution"
            className="inline-flex items-center gap-2 border-b border-gold pb-1 text-[11.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            Open the reader <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Section>
    </>
  );
}