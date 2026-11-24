import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown, History, Landmark, Shield, Users } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { INSTITUTIONS } from "@/lib/institutions";
import { PARAMOUNT_CHIEFS } from "./paramount-chiefs.$slug";
import { useSiteConfig } from "@/lib/useSiteConfig";

export const Route = createFileRoute("/_site/leadership")({
  head: () => ({
    meta: [
      { title: "Traditional Leadership · Ovaherero Traditional Authority" },
      { name: "description", content: "Directory of traditional leaders, the historical succession of Paramount Chiefs, recognised communities and authorised public offices." },
    ],
  }),
  loader: async () => {
    const [officeholders, communities] = await Promise.all([
      base44.entities.Officeholder.filter({ status: "published" }, { sort: "sort_order", limit: 200 }),
      base44.entities.TraditionalCommunity.filter(
        { status: "published", kind: "Traditional community" },
        { sort: "name", limit: 100 },
      ),
    ]);
    return { officeholders: officeholders.items || [], communities: communities.items || [] };
  },
  component: LeadershipPage,
});

function LeadershipPage() {
  const { officeholders = [], communities = [] } = Route.useLoaderData() || {};
  const config = useSiteConfig();
  const nameFor = (slug) => INSTITUTIONS.find((i) => i.slug === slug)?.name || slug;

  const currentChief = PARAMOUNT_CHIEFS.find((c) => c.slug === "mutjinde-katjiua") || PARAMOUNT_CHIEFS[PARAMOUNT_CHIEFS.length - 1];

  return (
    <>
      <PageHero
        eyebrow="Traditional Governance"
        title="Traditional leadership, recognised and accountable."
        intro="The customary leadership of the Ovaherero Traditional Authority — custodians of the Holy Fire (Okuruuo), hereditary chiefs, regional councillors, and the unbroken historical succession of the Paramount Chieftaincy."
        image={config?.leadership_hero_image || "/images/heritage/mutjinde-katjiua.jpg"}
        imageKey="leadership_hero_image"
        imageAlt="Traditional Leadership of the Ovaherero"
      />

      {/* ── Current Paramount Chief Featured Banner ───────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="shell py-12 lg:py-16">
          <div className="border border-border bg-background p-6 shadow-md sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-center lg:gap-12">
              <div className="relative aspect-[4/5] overflow-hidden border border-border bg-[hsl(var(--primary))] shadow-md">
                <img
                  src={config?.paramount_chief_portrait || currentChief.photo}
                  alt={currentChief.name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <span className="bg-gold px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-black">
                    Current Leader
                  </span>
                  <p className="mt-1 font-display text-base text-white">{currentChief.name}</p>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Crown className="h-4 w-4 text-gold" />
                  <span className="eyebrow text-gold">Supreme Customary Authority</span>
                </div>
                <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl lg:text-4xl">
                  {currentChief.name}
                </h2>
                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                  {currentChief.title} · {currentChief.reign}
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/80 max-w-2xl">
                  {currentChief.biography[0]}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/70 max-w-2xl">
                  {currentChief.biography[1]}
                </p>

                <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-5">
                  <Button asChild className="rounded-none bg-gold px-5 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                    <Link to="/paramount-chief">
                      Paramount Chief Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-none border-border px-5 text-[11.5px] uppercase tracking-[0.14em]">
                    <Link to="/institutions/office-of-the-paramount-chief">
                      <Landmark className="mr-1.5 h-3.5 w-3.5 text-gold" /> Office of the Chief
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-none text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
                    <Link to="/paramount-chiefs">
                      <History className="mr-1.5 h-3.5 w-3.5" /> All Paramount Chiefs &rarr;
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Paramount Chiefs of the Ovaherero (Pictures & Lineage from Slideshow) ─ */}
      <section className="shell py-16 lg:py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-gold" />
              <p className="eyebrow text-gold">Historical Succession · 1863 – Present</p>
            </div>
            <h2 className="mt-2 text-2xl font-display sm:text-3xl lg:text-4xl">
              Paramount Chiefs of the Ovaherero
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
              The continuous lineage of the Ombára Otjitambi since 1863. Click any chief to view their full biography, historical record, and photographic archive.
            </p>
          </div>
          <Link
            to="/paramount-chiefs"
            className="group inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            Succession Overview
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid of all Chiefs from the slideshow */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PARAMOUNT_CHIEFS.map((chief, idx) => (
            <article
              key={chief.slug}
              className="group flex flex-col justify-between overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-gold/70 hover:shadow-md"
            >
              <div>
                {/* Image container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[hsl(var(--primary))]">
                  <img
                    src={chief.photo}
                    alt={`Portrait of ${chief.name}`}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/heritage/paramount-chief-ceremonial-dress.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white border border-white/20">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {chief.reign}
                    </p>
                    <h3 className="mt-1 font-display text-lg leading-tight text-white group-hover:text-gold transition-colors">
                      {chief.name}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {chief.era}
                    </span>
                    {chief.isDisputed && (
                      <span className="border border-gold/40 bg-gold/15 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-gold">
                        Disputed
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[hsl(var(--primary))] line-clamp-1">
                    {chief.title}
                  </p>
                  <p className="mt-2.5 line-clamp-3 text-[12px] leading-relaxed text-foreground/75">
                    {chief.teaser}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-border p-4 pt-3 bg-secondary/20">
                <Button asChild size="sm" className="w-full rounded-none bg-gold text-[10.5px] uppercase tracking-[0.15em] text-[hsl(var(--ink))] hover:bg-gold/90">
                  <Link to="/paramount-chiefs/$slug" params={{ slug: chief.slug }}>
                    See more <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Commissioners Section (Commissioners Portfolio from Governance Diagram) ── */}
      <section id="commissioners" className="scroll-mt-32 border-b border-border bg-card py-12 lg:py-16">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold" />
              <p className="eyebrow text-gold">Governance Portfolio</p>
            </div>
            <h2 className="mt-2 text-2xl font-display sm:text-3xl text-foreground">
              Commissioners of the Authority (Ovakomisinare)
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">
              The Commissioners are statutory executive and thematic officeholders mandated under the Constitution of the Ovaherero Traditional Authority to drive strategic portfolios, conduct customary oversight, manage ancestral land boundaries, and support the Chiefs Council and Senate.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border bg-background p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Portfolio 01</span>
              <h3 className="mt-2 font-display text-base text-foreground">Constitutional &amp; Legal Affairs</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Oversight of customary jurisprudence, court ratifications, and constitutional compliance.</p>
            </div>
            <div className="border border-border bg-background p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Portfolio 02</span>
              <h3 className="mt-2 font-display text-base text-foreground">Land, Boundaries &amp; Resettlement</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Demarcation of traditional territories, communal grazing rights, and land dispute mediation.</p>
            </div>
            <div className="border border-border bg-background p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Portfolio 03</span>
              <h3 className="mt-2 font-display text-base text-foreground">Reparations &amp; Heritage Restitution</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Liaison with the Genocide Foundation (OGGF), ancestral remains return, and sacred shrines.</p>
            </div>
            <div className="border border-border bg-background p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Portfolio 04</span>
              <h3 className="mt-2 font-display text-base text-foreground">Diaspora &amp; Community Affairs</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Consolidation of chapters in Botswana, South Africa, and international community welfare.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild size="sm" className="rounded-none bg-[hsl(var(--primary))] text-[11px] uppercase tracking-wider">
              <Link to="/institutions/commissioners">View Commissioners Institutional Profile</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-wider">
              <Link to="/constitution">Read Constitutional Mandate</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Traditional Leadership Directory ─────────────────────────────────── */}
      <Section tone="muted">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Customary Leadership &amp; Traditional Councils</p>
            <h2 className="mt-2 text-2xl font-display sm:text-3xl">Traditional Leadership Register</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Recognised regional chiefs, councillors, and customary heads recorded under the Constitution of the Ovaherero Traditional Authority.
            </p>
          </div>
          <Link
            to="/institutions"
            className="text-[11.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            All Institutions
          </Link>
        </div>

        {officeholders.length === 0 ? (
          <div className="border border-border bg-card p-8 text-center sm:p-12">
            <Users className="mx-auto h-8 w-8 text-gold" />
            <h3 className="mt-3 font-display text-xl text-foreground">Customary Leadership Assembly</h3>
            <p className="mx-auto mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
              Traditional leaders, regional senior headmen, and council delegates are ratified by the Supreme Senate of Chiefs and High Chiefs Council. Approved appointments are recorded in this register.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="sm" className="rounded-none bg-[hsl(var(--primary))] text-[11px] uppercase tracking-[0.14em]">
                <Link to="/institutions/chiefs-council">High Chiefs Council</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-[0.14em]">
                <Link to="/institutions/traditional-senate">Traditional Senate</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-[0.14em]">
                <Link to="/communities">Recognised Communities</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {officeholders.map((person) => (
              <article key={person.id} className="bg-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--oxblood))]">{person.title}</p>
                    {person.is_demo ? <IllustrativeBadge /> : null}
                  </div>
                  <h3 className="mt-2 font-display text-[1.45rem] leading-snug">{person.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {nameFor(person.institution_slug)}
                  </p>
                  {person.community_name ? (
                    <p className="mt-3 text-[12.5px] text-foreground/75">{person.community_name}</p>
                  ) : null}
                  {person.portfolio ? (
                    <p className="mt-1 text-[12px] text-foreground/60">{person.portfolio}</p>
                  ) : null}
                  {person.public_contact ? (
                    <p className="mt-3 border-t border-border pt-3 text-[11.5px] text-foreground/70">{person.public_contact}</p>
                  ) : null}
                </div>
                <Link
                  to={`/institutions/${person.institution_slug || "chiefs-council"}`}
                  className="mt-4 inline-block text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
                >
                  View structure &rarr;
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>

      {/* ── Recognised Traditional Communities ─────────────────────────────────── */}
      <Section eyebrow="Constituencies" title="Recognised traditional communities">
        {communities.length === 0 ? (
          <div className="border border-border bg-card p-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              Over 36 recognised traditional communities across Namibia, Botswana, and South Africa hold seating in the OTA Customary Assembly.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild size="sm" className="rounded-none bg-gold text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to="/chapters">Chapters &amp; Traditional Seats Directory</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-[0.14em]">
                <Link to="/communities">Communities Register</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Community</th>
                  <th className="px-5 py-3 font-medium">Regional location</th>
                  <th className="px-5 py-3 font-medium">Leader</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((community) => (
                  <tr key={community.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/20">
                    <td className="px-5 py-3 font-medium">{community.name}</td>
                    <td className="px-5 py-3 text-[12px] text-foreground/70">
                      {[community.region, community.country].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-foreground/70">
                      {community.leader_name ? `${community.leader_title ? community.leader_title + " " : ""}${community.leader_name}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[11.5px] text-muted-foreground">{community.recognition_status || "Recognised"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}