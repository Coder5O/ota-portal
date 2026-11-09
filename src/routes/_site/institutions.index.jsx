import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { INSTITUTIONS } from "@/lib/institutions";
import { ArrowRight, Landmark } from "lucide-react";

export const Route = createFileRoute("/_site/institutions/")({
  head: () => ({
    meta: [
      { title: "Institutions & Organs · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Institutional organs, councils, and administrative bodies established under the Constitution of the Ovaherero Traditional Authority.",
      },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.Institution.filter({ status: "published" }, { sort: "sort_order", limit: 50 });
    const liveItems = page?.items || [];

    // Merge live records with constitutional institutions framework
    const list = INSTITUTIONS.map((inst) => {
      const live = liveItems.find((item) => item.slug === inst.slug);
      return {
        slug: inst.slug,
        name: live?.name || inst.name,
        native_name: live?.native_name || inst.native,
        summary: live?.summary || inst.summary,
        mandate: live?.mandate || "",
        is_demo: live ? Boolean(live.is_demo) : false,
      };
    });

    // Add any additional institutions in live DB that aren't in canonical list
    liveItems.forEach((live) => {
      if (!list.some((item) => item.slug === live.slug)) {
        list.push({
          slug: live.slug,
          name: live.name,
          native_name: live.native_name || "",
          summary: live.summary || "",
          mandate: live.mandate || "",
          is_demo: Boolean(live.is_demo),
        });
      }
    });

    return { institutions: list };
  },
  component: InstitutionsDirectoryPage,
});

function InstitutionsDirectoryPage() {
  const { institutions = [] } = Route.useLoaderData() || {};

  return (
    <>
      <PageHero
        eyebrow="Governance Architecture"
        title="Institutions of the Authority."
        intro="The constitutional structures, councils, foundations and administrative organs established under the Constitution of the Ovaherero Traditional Authority."
        image="/images/slides/spitzkoppe-sunset.jpg"
        imageKey="institutions_hero_image"
        imageAlt="Institutions of the Ovaherero Traditional Authority"
      />

      <Section eyebrow="Institutional Organs" title="Official structures & councils" tone="muted">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <div
              key={inst.slug}
              className="flex flex-col justify-between border border-border bg-card p-6 transition-all hover:border-gold/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Landmark className="h-4 w-4" />
                    {inst.native_name ? (
                      <span className="text-[10.5px] uppercase tracking-[0.16em] text-foreground/60">
                        {inst.native_name}
                      </span>
                    ) : null}
                  </div>
                  {inst.is_demo ? <IllustrativeBadge /> : null}
                </div>

                <h3 className="mt-3 font-display text-xl leading-snug text-foreground">
                  {inst.name}
                </h3>

                <p className="mt-3 text-[13px] leading-relaxed text-foreground/70">
                  {inst.summary}
                </p>
              </div>

              <div className="mt-6 border-t border-border/80 pt-4">
                <Link
                  to="/institutions/$slug"
                  params={{ slug: inst.slug }}
                  className="inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))] hover:text-gold"
                >
                  View structure profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="border border-gold/50 bg-gold/10 p-8 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/60">
              Restorative Justice Focus
            </span>
            <h3 className="mt-1 font-display text-2xl text-foreground">
              Ovaherero Global Genocide Foundation (OGGF)
            </h3>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-foreground/75">
              Explore the dedicated public portal for restorative justice, international advocacy, restitution
              frameworks, and official historical documentation.
            </p>
          </div>
          <div className="mt-5 shrink-0 sm:mt-0">
            <Link
              to="/oggf"
              className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Visit OGGF Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
