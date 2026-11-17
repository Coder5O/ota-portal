import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { INSTITUTIONS } from "@/lib/institutions";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/institutions/$slug")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.institution?.name || "Institution"} · Ovaherero Traditional Authority` },
      { name: "description", content: loaderData?.institution?.summary || "An institution of the Ovaherero Traditional Authority." },
    ],
  }),
  loader: async ({ params }) => {
    const constitutionalDef = INSTITUTIONS.find((i) => i.slug === params.slug);

    const [page, officeholders, resolutions] = await Promise.all([
      base44.entities.Institution.filter({ slug: params.slug }, { limit: 1 }),
      base44.entities.Officeholder.filter(
        { institution_slug: params.slug, status: "published" },
        { sort: "sort_order", limit: 50 },
      ),
      base44.entities.Resolution.filter(
        { institution_slug: params.slug, visibility: "public", status: "Approved" },
        { sort: "-approval_date", limit: 10 },
      ),
    ]);

    const liveRecord = page?.items?.[0];

    // If it exists neither in Firestore nor in the constitutional framework, 404
    if (!liveRecord && !constitutionalDef) {
      throw notFound();
    }

    const institution = {
      slug: params.slug,
      name: liveRecord?.name || constitutionalDef?.name || "Traditional Institution",
      native_name: liveRecord?.native_name || constitutionalDef?.native || "",
      summary: liveRecord?.summary || constitutionalDef?.summary || "An institutional structure of the Ovaherero Traditional Authority.",
      mandate: liveRecord?.mandate || constitutionalDef?.mandate || "",
      responsibilities: liveRecord?.responsibilities || constitutionalDef?.responsibilities || [],
      reporting_line: liveRecord?.reporting_line || constitutionalDef?.reporting_line || "",
      is_demo: liveRecord ? Boolean(liveRecord.is_demo) : false,
      ...liveRecord,
    };

    return { institution, officeholders: officeholders.items || [], resolutions: resolutions.items || [] };
  },
  component: InstitutionPage,
});

function InstitutionPage() {
  const { institution = {}, officeholders = [], resolutions = [] } = Route.useLoaderData() || {};

  const isChiefsOffice = institution.slug === "office-of-the-paramount-chief";

  const heroImage =
    institution.banner_url ||
    (isChiefsOffice
      ? "/images/heritage/mutjinde-katjiua.jpg"
      : "/images/slides/spitzkoppe-sunset.jpg");

  const displayOfficeholders =
    officeholders.length > 0
      ? officeholders
      : isChiefsOffice
        ? [
            {
              id: "current-chief",
              title: "Paramount Chief of the Ovaherero (Ombára Otjitambi)",
              name: "Professor Mutjinde Katjiua",
              community_name: "Ovaherero Traditional Authority",
              photo_url: "/images/heritage/mutjinde-katjiua.jpg",
              biography:
                "Elected by the Chiefs' Council in December 2021 and formally installed by the Ovaherero Traditional Authority in March 2022. Supreme traditional leader, constitutional custodian, and international advocate for genocide restorative justice.",
            },
          ]
        : [];

  return (
    <>
      <PageHero
        eyebrow={institution.native_name || "Institutional structure"}
        title={institution.name}
        intro={institution.summary}
        image={heroImage}
        imageAlt={isChiefsOffice ? "Professor Mutjinde Katjiua, Paramount Chief of the Ovaherero" : institution.name}
      >
        {institution.is_demo ? <IllustrativeBadge className="bg-white/90" /> : null}
      </PageHero>

      <Section>
        {isChiefsOffice && (
          <div className="mb-10 border border-border bg-card p-6 shadow-md sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[160px_1fr] sm:items-center">
              <div className="relative aspect-[4/5] overflow-hidden border border-border shadow-sm bg-[hsl(var(--primary))]">
                <img
                  src="/images/heritage/mutjinde-katjiua.jpg"
                  alt="Professor Mutjinde Katjiua, Paramount Chief of the Ovaherero"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-gold" />
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-gold">
                    Current Paramount Chief
                  </span>
                </div>
                <h3 className="mt-1.5 font-display text-2xl text-foreground sm:text-3xl">
                  Professor Mutjinde Katjiua
                </h3>
                <p className="mt-1 text-[11.5px] uppercase tracking-wider text-muted-foreground">
                  Ombára Otjitambi · In office from March 2022
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/80 max-w-2xl">
                  Supreme customary leader and constitutional head of the Ovaherero Traditional Authority.
                  Presiding over the High Chiefs Council, customary land administration, and international genocide restitution.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild size="sm" className="rounded-none bg-gold text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                    <Link to="/paramount-chief">
                      View Chief Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-[0.14em]">
                    <Link to="/paramount-chiefs">
                      Historical Succession (1863 – Present)
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="eyebrow">Mandate</p>
            {institution.mandate ? (
              <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-[1.9] text-foreground/80">{institution.mandate}</p>
            ) : (
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                The published mandate of this structure has not been recorded yet. Mandates are published only as
                approved under the Constitution.
              </p>
            )}

            {institution.responsibilities?.length ? (
              <>
                <p className="eyebrow mt-8">Responsibilities</p>
                <ul className="mt-3 space-y-2.5 border-l border-gold/40 pl-5">
                  {institution.responsibilities.map((item) => (
                    <li key={item} className="text-[0.92rem] leading-relaxed text-foreground/80">
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {institution.slug === "ovaherero-genocide-foundation" ? (
              <div className="mt-8 border border-gold/50 bg-gold/10 p-5">
                <p className="font-display text-lg text-foreground">
                  Dedicated Restorative Justice & Repatriation Portal
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/75">
                  Access approved publications, historical briefs, international advocacy updates, and
                  repatriation efforts on the dedicated OGGF public portal.
                </p>
                <Link
                  to="/oggf"
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--primary))] hover:underline"
                >
                  Visit OGGF Portal &rarr;
                </Link>
              </div>
            ) : null}
          </div>
          <aside className="border border-border bg-card p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Reporting arrangement</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/80">
              {institution.reporting_line || "To be recorded as approved by the Authority."}
            </p>
            <div className="mt-6 border-t border-border pt-4">
              <Link to="/leadership" className="text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                Leadership directory
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Officeholders" title="Approved officeholders" tone="muted">
        {displayOfficeholders.length === 0 ? (
          <EmptyNote>No officeholder of this structure has been published.</EmptyNote>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {displayOfficeholders.map((person) => (
              <div key={person.id} className="bg-card p-6 flex flex-col justify-between">
                <div>
                  {person.photo_url ? (
                    <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden border border-border bg-background shadow-sm">
                      <img
                        src={person.photo_url}
                        alt={person.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : null}
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--oxblood))]">{person.title}</p>
                  <h3 className="mt-2 font-display text-xl leading-snug">{person.name}</h3>
                  {person.community_name ? (
                    <p className="mt-1 text-[12px] text-foreground/60">{person.community_name}</p>
                  ) : null}
                  {person.biography ? (
                    <p className="mt-3 line-clamp-4 text-[12.5px] leading-relaxed text-foreground/65">{person.biography}</p>
                  ) : null}
                </div>
                {isChiefsOffice && (
                  <div className="mt-4 border-t border-border pt-3">
                    <Link
                      to="/paramount-chief"
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))] hover:underline"
                    >
                      View profile &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {resolutions.length > 0 ? (
        <Section eyebrow="Public decisions" title="Resolutions authorised for publication">
          <ul className="divide-y divide-border border-y border-border">
            {resolutions.map((resolution) => (
              <li key={resolution.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[1.15rem]">{resolution.title}</h3>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Approved {fmtDate(resolution.approval_date)} · v{resolution.version}
                  </p>
                </div>
                {resolution.text ? (
                  <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-foreground/75">{resolution.text}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}