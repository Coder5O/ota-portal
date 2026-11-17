import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown, History, Landmark, Shield } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";
import { useSiteConfig } from "@/lib/useSiteConfig";

/** Default canonical profile of the current Paramount Chief */
const CURRENT_CHIEF_PROFILE = {
  name: "Professor Mutjinde Katjiua",
  title: "Paramount Chief of the Ovaherero (Ombára Otjitambi)",
  photo_url: "/images/heritage/mutjinde-katjiua.jpg",
  appointed_date: "2022-03-01",
  community_name: "Ovaherero Traditional Authority",
  public_contact: "office@ota.gov.na · Head Office: Okahandja & Windhoek",
  biography: `Professor Mutjinde Katjiua is the Paramount Chief (Ombára Otjitambi) of the Ovaherero People of Namibia.

Elected by the Chiefs' Council in December 2021 and formally installed by the Ovaherero Traditional Authority in March 2022, Ombára Katjiua serves as the supreme customary leader, spiritual custodian of the Holy Fire (Okuruuo), and constitutional head of the nation.

A distinguished professor and conservation scientist before his traditional elevation, Chief Katjiua has championed the unification of traditional constituencies across Namibia, Botswana and the diaspora, the defence of communal land rights, and the international campaign for direct genocide reparations and restorative justice from Germany for the 1904–1908 genocide.

His leadership is anchored in the Constitution of the Ovaherero Traditional Authority promulgated on 22 August 2022, which codifies democratic customary law, consultative assembly governance, and the historic lineage of the sacred chieftaincy.`,
};

export const Route = createFileRoute("/_site/paramount-chief")({
  head: () => ({
    meta: [
      { title: "Paramount Chief · Professor Mutjinde Katjiua · Ovaherero Traditional Authority" },
      { name: "description", content: "The Paramount Chief (Ombára Otjitambi) of the Ovaherero Traditional Authority: Professor Mutjinde Katjiua. Approved profile, statements and official engagements." },
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
  const config = useSiteConfig();

  // Combine database record with authoritative current chief profile
  const principal = officeholders[0]
    ? {
        ...CURRENT_CHIEF_PROFILE,
        ...officeholders[0],
        photo_url: config?.paramount_chief_portrait || officeholders[0].photo_url || "/images/heritage/mutjinde-katjiua.jpg",
      }
    : {
        ...CURRENT_CHIEF_PROFILE,
        photo_url: config?.paramount_chief_portrait || "/images/heritage/mutjinde-katjiua.jpg",
      };

  const heroImage = config?.paramount_chief_hero_image || "/images/heritage/mutjinde-katjiua.jpg";

  return (
    <>
      <PageHero
        eyebrow="Ombára Otjitambi"
        title="The Paramount Chief"
        intro="The Office of the Paramount Chief is the constitutional and customary centre of the Ovaherero Traditional Authority. Official profile, public statements and engagements."
        image={heroImage}
        imageKey="paramount_chief_hero_image"
        imageAlt="Professor Mutjinde Katjiua, Paramount Chief of the Ovaherero"
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <div className="relative overflow-hidden border border-border bg-card shadow-lg">
              <Image
                src={principal.photo_url}
                alt={principal.name || "Office of the Paramount Chief"}
                className="aspect-[4/5] w-full object-cover object-top"
                fittingType="fill"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <span className="bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  Current Paramount Chief
                </span>
                <p className="mt-1 font-display text-lg text-white">{principal.name}</p>
              </div>
            </div>
            {principal.is_demo ? (
              <div className="mt-3">
                <IllustrativeBadge />
              </div>
            ) : null}

            {/* Quick links box */}
            <div className="mt-6 border border-border bg-secondary/35 p-5 space-y-3">
              <p className="eyebrow text-gold">Institutional Links</p>
              <div className="space-y-2">
                <Link
                  to="/institutions/office-of-the-paramount-chief"
                  className="flex items-center justify-between text-[12.5px] font-medium text-foreground hover:text-[hsl(var(--primary))]"
                >
                  <span>Office of the Paramount Chief Structure</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold" />
                </Link>
                <Link
                  to="/paramount-chiefs"
                  className="flex items-center justify-between text-[12.5px] font-medium text-foreground hover:text-[hsl(var(--primary))]"
                >
                  <span>Historical Succession (1863 – Present)</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold" />
                </Link>
                <Link
                  to="/leadership"
                  className="flex items-center justify-between text-[12.5px] font-medium text-foreground hover:text-[hsl(var(--primary))]"
                >
                  <span>Traditional Leadership Directory</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Crown className="h-4 w-4 text-gold" />
              <p className="eyebrow text-gold">{principal.title}</p>
            </div>
            <h2 className="mt-3 text-[2.2rem] leading-tight font-display sm:text-[2.8rem]">{principal.name}</h2>
            {principal.community_name ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {principal.community_name}
              </p>
            ) : null}

            {principal.biography ? (
              <div className="mt-6 space-y-4">
                {principal.biography.split(/\n\s*\n/).map((text, i) => (
                  <p key={i} className="text-[0.96rem] leading-[1.85] text-foreground/80">
                    {text}
                  </p>
                ))}
              </div>
            ) : null}

            <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              {principal.appointed_date ? (
                <div className="border border-border bg-card p-4">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">In office from</dt>
                  <dd className="mt-1 text-[13.5px] font-medium">{fmtDate(principal.appointed_date)}</dd>
                </div>
              ) : null}
              {principal.public_contact ? (
                <div className="border border-border bg-card p-4">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Office contact</dt>
                  <dd className="mt-1 text-[13.5px] font-medium">{principal.public_contact}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6">
              <Button asChild className="rounded-none bg-gold px-6 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to="/paramount-chiefs">
                  <History className="mr-2 h-3.5 w-3.5" /> Full Historical Succession
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none border-border px-6 text-[11.5px] uppercase tracking-[0.14em]">
                <Link to="/institutions/office-of-the-paramount-chief">
                  <Landmark className="mr-2 h-3.5 w-3.5" /> Office of the Paramount Chief
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {blocks.length > 0 ? (
        <Section eyebrow="Official record" title="Statements & engagements" tone="muted">
          <ProseBlocks blocks={blocks} />
        </Section>
      ) : null}

      <Section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.8rem] leading-tight font-display">Recent public communications</h2>
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