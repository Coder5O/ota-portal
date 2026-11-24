import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Eye, Flame, Landmark, Scale, ScrollText, Shield, Sparkles, Target, Users } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { INSTITUTIONS } from "@/lib/institutions";
import { useSiteConfig } from "@/lib/useSiteConfig";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Us · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Our Identity, Vision, Mission, Core Values, and Strategic Thrust of the Ovaherero Traditional Authority.",
      },
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

const PILLARS_NAV = [
  { href: "#identity", num: "1", label: "Our Identity" },
  { href: "#vision", num: "2", label: "Vision" },
  { href: "#mission", num: "3", label: "Mission" },
  { href: "#core-values", num: "4", label: "Our Core Values" },
  { href: "#strategic-thrust", num: "5", label: "Strategic Thrust" },
];

const CORE_VALUES = [
  {
    term: "Ombatero",
    label: "Mutual Solidarity & Communal Care",
    desc: "Upholding communal empathy, mutual assistance, and shared responsibility across all recognized traditional communities.",
    icon: Users,
  },
  {
    term: "Ouhona",
    label: "Legitimate Customary Leadership",
    desc: "Venerating principled customary authority, democratic succession, and accountable stewardship of traditional offices.",
    icon: Landmark,
  },
  {
    term: "Ouature",
    label: "Truth, Consultation & Justice",
    desc: "Conducting governance through transparent assemblies, consensus-building (ombemberisiro), and impartial customary adjudication.",
    icon: Scale,
  },
  {
    term: "Otjiserandu",
    label: "Courage, Resilience & Sacred Remembrance",
    desc: "Honouring the eternal covenant of 1904–1923, maintaining the Red Flag heritage, and perpetuating historic memory.",
    icon: Flame,
  },
  {
    term: "Ombazu",
    label: "Cultural Sovereignty & Sacred Fire",
    desc: "Preserving the sacred fire (Okuruuo), ancestral heritage, oral traditions, and the richness of the Otjiherero language.",
    icon: Shield,
  },
];

const STRATEGIC_THRUSTS = [
  {
    num: "I",
    title: "Constitutional Codification & Institutional Strengthening",
    desc: "Institutionalising customary administration, codifying customary jurisprudence, and establishing permanent Secretariats for the Senate, Chiefs Council, and Commissioners under the 2022 Constitution.",
  },
  {
    num: "II",
    title: "Restorative Justice, Reparations & Repatriation",
    desc: "Leading international legal, diplomatic, and historical advocacy through the Ovaherero Global Genocide Foundation (OGGF) to secure unconditional apologies, reparations, and the repatriation of ancestral remains.",
  },
  {
    num: "III",
    title: "Land Administration, Communal Rights & Heritage Sanctuaries",
    desc: "Securing communal land tenure across traditional territories, safeguarding sacred shrines and massacre sites, and stewarding water and grazing resources for future generations.",
  },
  {
    num: "IV",
    title: "Youth, Women & Educational Advancement",
    desc: "Empowering the Ovaherero Women Association (OWA) and Youth Council (OYAC) through education bursaries, cultural leadership development, and economic self-reliance programmes.",
  },
  {
    num: "V",
    title: "Diaspora Consolidation & Global Community Integration",
    desc: "Unifying diaspora chapters across Botswana, South Africa, the Americas, and Europe into a unified digital governance framework with equal representation in the Customary Assembly.",
  },
];

function AboutPage() {
  const { blocks = [], institutions = [] } = Route.useLoaderData() || {};
  const config = useSiteConfig();

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="An institution of custom, continuity and sovereign service."
        intro="The Ovaherero Traditional Authority is constituted to preserve the customs, language, land heritage, and governance of the Ovaherero people in Namibia and across the diaspora."
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
              src={config?.about_feature_image || "/images/heritage/paramount-chief-community-gathering-2.jpg"}
              alt="Paramount Chief greeting community members at a customary gathering"
              className="aspect-[16/10] w-full object-cover object-center transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Historic Assembly</p>
              <p className="mt-0.5 text-[12px] text-white/90">Otjiserandu Convocations &amp; Living Tradition</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky In-Page Navigation for the 5 Pillars ───────────────────────── */}
      <nav className="sticky top-[74px] z-30 border-y border-border bg-background/95 backdrop-blur">
        <div className="shell flex items-center gap-2 overflow-x-auto py-3 no-scrollbar sm:gap-4">
          <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold mr-2 hidden md:inline">
            About Us Architecture:
          </span>
          {PILLARS_NAV.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="shrink-0 border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-gold hover:text-[hsl(var(--primary))] sm:px-4"
            >
              <span className="font-bold text-gold mr-1.5">{p.num}.</span>
              {p.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── 1. Our Identity ──────────────────────────────────────────────────── */}
      <section id="identity" className="scroll-mt-36 border-b border-border bg-background py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                Pillar 1
              </span>
              <p className="eyebrow text-gold">Foundational Essence</p>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
              1. Our Identity: Sovereign Custom &amp; Ancestral Lineage
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">
              The Ovaherero are an ancient pastoral nation whose identity is indelibly woven into ancestral soil,
              communal kinship structures (<em>otuzo</em> and <em>ozombu</em>), and the sacred flame of the Holy Fire (<em>Okuruuo</em>).
              Our sovereignty is not an administrative grant—it is an unbroken customary inheritance carried forward
              through generations of supreme chiefs, warriors, clan mothers, and community assemblies.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="border border-border bg-card p-6">
              <Flame className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg">The Sacred Fire (Okuruuo)</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
                The spiritual axis of Ovaherero life, maintaining the continuous communion between the living,
                the ancestors (<em>Ovakuru</em>), and the supreme Creator (<em>Ndjambi Karunga</em>).
              </p>
            </div>

            <div className="border border-border bg-card p-6">
              <Landmark className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg">The Paramount Chieftaincy</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
                Established as a unified national institution in 1863 under Ombára Maharero kaTjamuaha, representing
                the supreme traditional leadership and collective dignity of all recognized communities.
              </p>
            </div>

            <div className="border border-border bg-card p-6">
              <Shield className="h-6 w-6 text-gold" />
              <h3 className="mt-4 font-display text-lg">Constitutional Codification</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">
                Reaffirmed on 22 August 2022 through the formal codification of the OTA Constitution, marrying
                time-honoured customary jurisprudence with democratic accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Vision ────────────────────────────────────────────────────────── */}
      <section id="vision" className="scroll-mt-36 border-b border-border bg-card py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                Pillar 2
              </span>
              <p className="eyebrow text-gold">Strategic Aspiration</p>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
              2. Vision: A Unified, Dignified &amp; Self-Reliant Nation
            </h2>
          </div>

          <div className="mt-8 border-l-4 border-gold bg-background/80 p-6 sm:p-8 shadow-sm">
            <blockquote className="font-display text-xl sm:text-2xl leading-relaxed text-foreground">
              “To foster a self-reliant, culturally sovereign, and economically empowered Ovaherero nation, anchored in
              customary integrity, constitutional democracy, social justice, and global community solidarity.”
            </blockquote>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-border bg-background p-6">
              <Eye className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-base">Cultural Sovereignty</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Uncompromising preservation of our language, rituals, traditional dress, and historic memory across generations.
              </p>
            </div>

            <div className="border border-border bg-background p-6">
              <Scale className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-base">Democratic Customary Rule</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Modern customary governance where power is exercised through consultation, consensus, and institutional checks.
              </p>
            </div>

            <div className="border border-border bg-background p-6">
              <Sparkles className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-display text-base">Socio-Economic Resilience</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                Equitable land stewardship, educational advancement, and sustainable wealth creation for all Ovaherero families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Mission ───────────────────────────────────────────────────────── */}
      <section id="mission" className="scroll-mt-36 border-b border-border bg-background py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                Pillar 3
              </span>
              <p className="eyebrow text-gold">Operational Mandate</p>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
              3. Mission: Service, Justice &amp; Restorative Advocacy
            </h2>
          </div>

          <div className="mt-8 border border-border bg-card p-6 sm:p-8">
            <p className="font-display text-lg sm:text-xl text-[hsl(var(--primary))] leading-relaxed">
              The Ovaherero Traditional Authority exists to preserve, defend, and advance the customs, language, land rights,
              and heritage of the Ovaherero people; administering orderly traditional justice, fostering community cohesion,
              empowering women and youth, and relentlessly pursuing international restorative justice for the 1904–1908 genocide.
            </p>

            <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  1
                </span>
                <p className="text-[13px] text-foreground/80">
                  <strong>Customary Governance:</strong> Administering customary law, mediating disputes, and providing certified traditional identification.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  2
                </span>
                <p className="text-[13px] text-foreground/80">
                  <strong>Restorative Reparations:</strong> Leading the historic struggle for full acknowledgment, apologies, and reparations from the Federal Republic of Germany.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  3
                </span>
                <p className="text-[13px] text-foreground/80">
                  <strong>Land &amp; Resource Stewardship:</strong> Safeguarding communal grazing, customary land titles, and protecting sacred ancestral massacre sites.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  4
                </span>
                <p className="text-[13px] text-foreground/80">
                  <strong>Diaspora Integration:</strong> Uniting our separated brothers and sisters across Botswana, South Africa, and overseas into one shared national destiny.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Our Core Values ───────────────────────────────────────────────── */}
      <section id="core-values" className="scroll-mt-36 border-b border-border bg-card py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                Pillar 4
              </span>
              <p className="eyebrow text-gold">Ethical Compass</p>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
              4. Our Core Values: Foundations of Dignity &amp; Custom
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">
              Our institutions operate on five foundational values inherited from our ancestors and codified in our living practice.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={val.term} className="flex flex-col justify-between border border-border bg-background p-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                        0{idx + 1} · {val.term}
                      </span>
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <h3 className="mt-4 font-display text-lg text-foreground">{val.label}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Strategic Thrust (User Request: Make Strategic Thrust Number 5) ── */}
      <section id="strategic-thrust" className="scroll-mt-36 border-b border-border bg-background py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="border border-gold bg-gold px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-black">
                Pillar 5
              </span>
              <p className="eyebrow text-gold">Strategic Roadmap</p>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-foreground">
              5. Strategic Thrust: 5 Pillars of National Transformation
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">
              The strategic thrust of the Ovaherero Traditional Authority sets out the executive priorities,
              institutional reforms, and community programmes driving our nation into a prosperous, self-reliant future.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {STRATEGIC_THRUSTS.map((thrust) => (
              <div
                key={thrust.num}
                className="group border border-border bg-card p-6 transition-all hover:border-gold/60 sm:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/50 bg-gold/10 font-display text-xl font-bold text-gold">
                    {thrust.num}
                  </div>
                  <div>
                    <h3 className="font-display text-xl leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                      Thrust {thrust.num}: {thrust.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">
                      {thrust.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <ProseBlocks
          blocks={blocks}
          empty="History, mandate, aims and objectives are published here by the OTA administration from the Constitution and approved records."
        />
      </Section>

      <Section eyebrow="Structure" title="Organs & Institutions of the Authority" tone="muted">
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
