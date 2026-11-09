import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { INSTITUTIONS } from "@/lib/institutions";
import { useSiteConfig } from "@/lib/useSiteConfig";

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

    const liveItems = institutions.items || [];
    const list = liveItems.length > 0
      ? liveItems
      : INSTITUTIONS.slice(0, 9).map((inst) => ({
          id: inst.slug,
          slug: inst.slug,
          name: inst.name,
          native_name: inst.native,
          summary: inst.summary,
        }));

    return { blocks: blocks.items || [], institutions: list };
  },
  component: AboutPage,
});

function AboutPage() {
  const { blocks = [], institutions = [] } = Route.useLoaderData() || {};
  const config = useSiteConfig();

  return (
    <>
      <PageHero
        eyebrow="About OTA"
        title="An institution of custom, continuity and service."
        intro="The Ovaherero Traditional Authority is constituted to preserve the customs, heritage and governance of the Ovaherero people, and to serve its communities in Namibia and across the diaspora."
        image="/images/slides/spitzkoppe-sunset.jpg"
        imageKey="about_hero_image"
        imageAlt="Ancestral homeland landscape, Namibia"
      />

      {/* Visual Narrative Feature Banner */}
      <section className="border-b border-border bg-card">
        <div className="shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <p className="eyebrow text-gold">Customary Foundation</p>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl">
              Custodians of the Red Flag &amp; the Sacred Fire
            </h2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/80">
              The Ovaherero Traditional Authority derives its mandate from centuries of customary leadership,
              ratified by traditional assemblies and formalized under the Traditional Authorities Act (Act No. 25 of 2000).
              It oversees customary law, land administration, cultural commemorations, and community representation across
              all recognized communities.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="border border-border bg-secondary/40 px-3 py-1">Est. Okahandja</span>
              <span className="border border-border bg-secondary/40 px-3 py-1">Customary Jurisdiction</span>
              <span className="border border-border bg-secondary/40 px-3 py-1">Otjiserandu Heritage</span>
            </div>
          </div>
          <div className="relative overflow-hidden border border-border shadow-md">
            <img
              src={config?.about_feature_image || "/images/heritage/ovaherero-women-red-flag.jpg"}
              alt="Ovaherero women united under the Red Flag"
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Historic Assembly</p>
              <p className="mt-0.5 text-[12px] text-white/90">Otjiserandu Convocations &amp; Living Tradition</p>
            </div>
          </div>
        </div>
      </section>

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