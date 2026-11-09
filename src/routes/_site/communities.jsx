import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/lib/useSiteConfig";

export const Route = createFileRoute("/_site/communities")({
  head: () => ({
    meta: [
      { title: "Traditional Communities · Ovaherero Traditional Authority" },
      { name: "description", content: "Recognised traditional communities of the Ovaherero Traditional Authority and how a community or chapter registers." },
    ],
  }),
  loader: async () => {
    const [communities, blocks] = await Promise.all([
      base44.entities.TraditionalCommunity.filter({ status: "published" }, { sort: "name", limit: 100 }),
      base44.entities.ContentBlock.filter({ page_slug: "communities", status: "published" }, { sort: "sort_order", limit: 20 }),
    ]);
    return { communities: communities.items || [], blocks: blocks.items || [] };
  },
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const { communities = [], blocks = [] } = Route.useLoaderData() || {};
  const config = useSiteConfig();

  return (
    <>
      <PageHero
        eyebrow="Traditional communities"
        title="Communities and chapters of the Authority."
        intro="Recognised traditional communities, their authorised leadership and, where applicable, their diaspora chapters."
        image="/images/slides/namibia-acacia.jpg"
        imageKey="communities_hero_image"
        imageAlt="Customary lands & traditional communities"
      />

      {/* Visual Feature Card */}
      <section className="border-b border-border bg-card">
        <div className="shell grid gap-8 py-10 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
          <div className="overflow-hidden border border-border shadow-sm">
            <img
              src={config?.communities_feature_image || "/images/slides/namibia-acacia.jpg"}
              alt="Ancestral pastoral savannas"
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Customary Tenure &amp; Assembly</span>
            <h2 className="mt-1 font-display text-2xl text-foreground">Communal Land &amp; Local Leadership</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/75">
              Traditional communities form the living pillars of the Ovaherero nation. Led by recognized Chiefs,
              Senior Councillors, and village headmen, each community administers customary land, resolves family disputes,
              and preserves ancestral lineage records under the authority of the Chiefs Council.
            </p>
          </div>
        </div>
      </section>

      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="Information about the registration and administration of traditional communities is published here by the administration."
        />
      </Section>

      <Section eyebrow="Directory" title="Registered communities" tone="muted">
        {communities.length === 0 ? (
          <EmptyNote>No community has been published yet.</EmptyNote>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <div key={community.id} className="bg-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl leading-snug">{community.name}</h3>
                  {community.is_demo ? <IllustrativeBadge /> : null}
                </div>
                {community.native_name ? (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{community.native_name}</p>
                ) : null}
                <p className="mt-2 text-[11.5px] uppercase tracking-[0.12em] text-foreground/50">
                  {community.kind} · {[community.region, community.country].filter(Boolean).join(", ")}
                </p>
                {community.leader_name ? (
                  <p className="mt-3 text-[12.5px] text-foreground/75">
                    {community.leader_title ? `${community.leader_title} ` : ""}
                    {community.leader_name}
                  </p>
                ) : null}
                {community.summary ? (
                  <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-foreground/60">{community.summary}</p>
                ) : null}
                <p className="mt-3 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  {community.recognition_status}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <div className="flex flex-col items-start justify-between gap-4 border border-border bg-card p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl">Register a traditional community</h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-foreground/65">
              A community, chapter or its authorised representative applies through the registration process. Supporting
              evidence of recognition may be uploaded with the application.
            </p>
          </div>
          <Button asChild className="rounded-none bg-[hsl(var(--primary))] text-[11.5px] uppercase tracking-[0.14em]">
            <Link to="/membership">Start a registration</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}