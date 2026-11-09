import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Image } from "@/components/ui/image";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/paramount-chief")({
  head: () => ({
    meta: [
      { title: "Paramount Chief · Ovaherero Traditional Authority" },
      { name: "description", content: "The Paramount Chief (Ombara Otjitambi) of the Ovaherero Traditional Authority: approved profile, statements and engagements." },
    ],
  }),
  loader: async () => {
    const [office, blocks, statements] = await Promise.all([
      base44.entities.Officeholder.filter(
        { institution_slug: "office-of-the-paramount-chief", status: "published" },
        { sort: "sort_order", limit: 10 },
      ),
      base44.entities.ContentBlock.filter(
        { page_slug: "paramount-chief", status: "published" },
        { sort: "sort_order", limit: 50 },
      ),
      base44.entities.NewsPost.filter({ status: "published" }, { sort: "-published_date", limit: 3 }),
    ]);
    return {
      officeholders: office.items || [],
      blocks: blocks.items || [],
      statements: statements.items || [],
    };
  },
  component: ParamountChiefPage,
});

function ParamountChiefPage() {
  const { officeholders = [], blocks = [], statements = [] } = Route.useLoaderData() || {};
  const principal = officeholders[0];

  return (
    <>
      <PageHero
        eyebrow="Ombara Otjitambi"
        title="The Paramount Chief"
        intro="The Office of the Paramount Chief is the constitutional centre of the Ovaherero Traditional Authority. Only approved biographical information, statements and engagements are published here."
        image="/images/heritage/paramount-chief-ceremonial-dress.jpg"
        imageAlt="Paramount Chief ceremonial attire"
      />

      <Section>
        {principal ? (
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Image
                src={principal.photo_url || "/images/heritage/paramount-chief-ceremonial-dress.jpg"}
                alt={principal.name || "Office of the Paramount Chief"}
                className="aspect-[4/5] w-full object-cover shadow-md"
                fittingType="fill"
              />
              {principal.is_demo ? (
                <div className="mt-3">
                  <IllustrativeBadge />
                </div>
              ) : null}
            </div>
            <div>
              <p className="eyebrow">{principal.title}</p>
              <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">{principal.name}</h2>
              {principal.community_name ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {principal.community_name}
                </p>
              ) : null}
              {principal.biography ? (
                <div className="mt-6 space-y-4">
                  {principal.biography.split(/\n\s*\n/).map((text, i) => (
                    <p key={i} className="text-[0.95rem] leading-[1.85] text-foreground/80">
                      {text}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-[13.5px] text-muted-foreground">
                  The approved biography of the Paramount Chief will be published here.
                </p>
              )}
              <dl className="mt-7 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {principal.appointed_date ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">In office from</dt>
                    <dd className="mt-1 text-[13px]">{fmtDate(principal.appointed_date)}</dd>
                  </div>
                ) : null}
                {principal.public_contact ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Office contact</dt>
                    <dd className="mt-1 text-[13px]">{principal.public_contact}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        ) : (
          <EmptyNote>
            The profile of the Paramount Chief has not been published. The administration publishes approved
            biographical information, statements and engagements here.
          </EmptyNote>
        )}
      </Section>

      {blocks.length > 0 ? (
        <Section eyebrow="Official record" title="Statements & engagements" tone="muted">
          <ProseBlocks blocks={blocks} />
        </Section>
      ) : null}

      <Section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.8rem] leading-tight">Recent public communications</h2>
          <Link
            to="/news"
            className="text-[11.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            All news & media
          </Link>
        </div>
        {statements.length === 0 ? (
          <EmptyNote>No public communication has been published yet.</EmptyNote>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {statements.map((item) => (
              <li key={item.id}>
                <Link to="/news/$postId" params={{ postId: item.id }} className="group flex flex-wrap items-baseline justify-between gap-3 py-4">
                  <span className="font-display text-[1.2rem] group-hover:text-[hsl(var(--primary))]">{item.title}</span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.category} · {fmtDate(item.published_date || item.created_date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}