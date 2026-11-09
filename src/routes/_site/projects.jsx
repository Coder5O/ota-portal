import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section } from "@/components/site/PageParts";

export const Route = createFileRoute("/_site/projects")({
  head: () => ({
    meta: [
      { title: "Community Projects · Ovaherero Traditional Authority" },
      { name: "description", content: "Approved development initiatives, youth and women's programmes and community support projects." },
    ],
  }),
  loader: async () => {
    const blocks = await base44.entities.ContentBlock.filter(
      { page_slug: "projects", status: "published" },
      { sort: "sort_order", limit: 50 },
    );
    return { blocks: blocks.items || [] };
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const { blocks = [] } = Route.useLoaderData() || {};

  return (
    <>
      <PageHero
        eyebrow="Community projects"
        title="Development carried by the community, for the community."
        intro="Approved initiatives of the Authority, its councils and chapters — youth development, women's programmes and community support."
        image="/images/slides/namibia-acacia.jpg"
        imageAlt="Community and customary development projects"
      />
      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="Approved community projects are published here by the administration once they are endorsed for public information."
        />
      </Section>
      <Section tone="muted">
        <div className="flex flex-col items-start justify-between gap-4 border border-border bg-card p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl">Propose or support a project</h2>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-foreground/65">
              Proposals, partnerships and offers of support are received by the office and referred to the responsible
              structure.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 border-b border-gold pb-1 text-[11.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            Write to the office
          </Link>
        </div>
      </Section>
    </>
  );
}