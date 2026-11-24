import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Download, FileText, History, Image as ImageIcon, Landmark, Scale, Search, Shield, Sparkles } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/library")({
  head: () => ({
    meta: [
      { title: "Library & Archive · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Official repository of Ovaherero history, research papers, genocide documentation, constitutional publications, and historical archives.",
      },
    ],
  }),
  loader: async () => {
    const [docs, resolutions] = await Promise.all([
      base44.entities.Document.filter({ status: "published" }, { sort: "-created_date", limit: 60 }),
      base44.entities.Resolution.filter({ visibility: "public", status: "Approved" }, { sort: "-approval_date", limit: 20 }),
    ]);
    return { docs: docs.items || [], resolutions: resolutions.items || [] };
  },
  component: LibraryPage,
});

const CURATED_PUBLICATIONS = [
  {
    id: "pub-1",
    title: "Constitution of the Ovaherero Traditional Authority (22 August 2022)",
    category: "Governance & Law",
    author: "OTA Constitutional Assembly",
    date: "2022-08-22",
    summary:
      "The codified constitutional instrument governing traditional leadership, the Senate, Chiefs Council, recognized communities, and customary dispute resolution.",
    url: "/constitution",
    type: "Constitutional Text",
  },
  {
    id: "pub-2",
    title: "1904–1908 Genocide: Legal Brief & Historical Memorandum on Reparations",
    category: "Genocide & Reparations",
    author: "Ovaherero Global Genocide Foundation (OGGF)",
    date: "2023-01-15",
    summary:
      "Comprehensive historical and international legal analysis detailing the Von Trotha extermination order, concentration camps, expropriation of ancestral lands, and reparations obligations.",
    url: "/oggf",
    type: "Research Brief",
  },
  {
    id: "pub-3",
    title: "The Unbroken Covenant: 100 Years of the Okahandja Pilgrimage (1923–2023)",
    category: "History & Heritage",
    author: "Kutako Heritage Council & Red Flag Command",
    date: "2023-08-23",
    summary:
      "Historical chronicle of the sacred reburial of Ombara Samuel Maharero at Okahandja on 23 August 1923, which revived national unity and launched modern resistance.",
    url: "/events",
    type: "Historical Chronicle",
  },
  {
    id: "pub-4",
    title: "Customary Land Rights & Communal Pastoral Stewardship in Namibia",
    category: "Governance & Law",
    author: "OTA Commission on Land & Customary Titles",
    date: "2023-11-10",
    summary:
      "A strategic policy framework on securing communal grazing boundaries, customary water points, and traditional court jurisdictions in communal homelands.",
    url: "/chapters",
    type: "Policy Paper",
  },
  {
    id: "pub-5",
    title: "Petitions to the United Nations: The Diplomatic Legacy of Ombara Hosea Kutako",
    category: "History & Heritage",
    author: "OTA Historical Research Committee",
    date: "2024-03-20",
    summary:
      "Documentation of the pioneering petitions drafted by Ombara Hosea Kutako and delivered through Reverend Michael Scott to the UN General Assembly between 1946 and 1960.",
    url: "/paramount-chiefs/hosea-kutako",
    type: "Archival Record",
  },
  {
    id: "pub-6",
    title: "OWA Strategic Framework on Women's Participation in Traditional Leadership",
    category: "Community & Society",
    author: "Ovaherero Women Association (OWA)",
    date: "2024-06-05",
    summary:
      "The constitutional blueprint for elevating women customary councillors, land trustees, and cultural custodians across all traditional seats.",
    url: "/institutions/women-council",
    type: "Institutional Blueprint",
  },
];

const HISTORICAL_EPOCHS = [
  {
    era: "Ancestral Origins & The Sacred Fire",
    period: "Pre-1860",
    title: "Pastoral Origins & The Covenant of the Holy Fire (Okuruuo)",
    narrative:
      "Emerging from the great migrations through Central and Southern Africa, the Ovaherero consolidated a sophisticated pastoral civilisation in central and north-western Namibia. Society was organized through matrilineal and patrilineal clan kinship (eanda and oruzo), united around the sacred Okuruuo (Holy Fire), the ancestral cattle herds, and communal land tenure.",
  },
  {
    era: "National Unification",
    period: "1863 – 1890",
    title: "The Maharero Dynasty & The Battle of Otjimbingwe (1863)",
    narrative:
      "Under Ombara Maharero kaTjamuaha, the disparate clans and chiefdoms united into a single sovereign nation with a unified military and political council. On 15 June 1863 at the Battle of Otjimbingwe, the Ovaherero successfully defended their independence, establishing Okahandja as the historical capital of the Paramount Chieftaincy.",
  },
  {
    era: "Anti-Colonial Resistance & Genocide",
    period: "1904 – 1908",
    title: "The 1904 Resistance & Imperial Extermination Orders",
    narrative:
      "In January 1904, Ombara Samuel Maharero issued the historic call to arms against German colonial land theft and brutal oppression. Following the Battle of Ohamakari (Waterberg) in August 1904, General Lothar von Trotha issued the infamous extermination proclamation (Vernichtungsbefehl), resulting in the genocide of over 80% of our people through forced desert marches and death camps at Shark Island, Swakopmund, and Windhoek.",
  },
  {
    era: "Resurrection & The Red Flag",
    period: "1923",
    title: "The Sacred Return: Okahandja Pilgrimage of 23 August 1923",
    narrative:
      "Despite severe colonial subjugation, the return of Ombara Samuel Maharero's body from exile in Serowe, Botswana, and his reburial in the sacred soil of Okahandja alongside his forefathers, ignited the Otjiserandu movement. Led by Ombara Hosea Kutako, this day established the unbroken annual pilgrimage that remains the spiritual heartbeat of our nation.",
  },
  {
    era: "International Liberation Petitions",
    period: "1946 – 1970",
    title: "Ombara Hosea Kutako & The United Nations Petitions",
    narrative:
      "Recognised as the Father of Modern Namibian Nationalism, Ombara Hosea Kutako rejected South African annexation of South West Africa. He pioneered petitions to the United Nations, smuggled through Rev. Michael Scott, transforming the Ovaherero struggle into the global vanguard for Namibian self-determination and national liberation.",
  },
  {
    era: "Reparations & Constitutional Renewal",
    period: "2000 – Present",
    title: "Global Reparations Movement & The 2022 Codified Constitution",
    narrative:
      "Initiated in parliament by Ombara Kuaima Riruako in 2006, litigated internationally by Ombara Vekuii Rukoro in US courts, and led today by Ombara Mutjinde Katjiua, the demand for unconditional German state reparations remains non-negotiable. On 22 August 2022, the Authority codified its modern Constitution, uniting tradition with democratic rule of law.",
  },
];

function LibraryPage() {
  const { docs = [], resolutions = [] } = Route.useLoaderData() || {};
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const allPublications = docs.length > 0 ? docs : CURATED_PUBLICATIONS;

  const categories = ["All", "Governance & Law", "Genocide & Reparations", "History & Heritage", "Community & Society"];

  const filteredPublications = allPublications.filter((item) => {
    const matchesCat = filter === "All" || item.category === filter;
    const matchesQuery =
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(query.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <>
      <PageHero
        eyebrow="Knowledge & Heritage Repository"
        title="OTA Library, Archives & Publications."
        intro="The comprehensive official repository of Ovaherero history, research publications, legal instruments, genocide evidence, and constitutional records."
        image="/images/slides/spitzkoppe-sunset.jpg"
        imageKey="library_hero_image"
        imageAlt="Ovaherero Traditional Authority Library and Historic Archives"
      />

      {/* Quick Navigation Strip */}
      <nav className="sticky top-[74px] z-30 border-y border-border bg-background/95 backdrop-blur">
        <div className="shell flex items-center justify-between py-3 overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a
              href="#history"
              className="border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-gold hover:text-[hsl(var(--primary))]"
            >
              <History className="inline h-3.5 w-3.5 mr-1 text-gold" /> History &amp; Epochs
            </a>
            <a
              href="#publications"
              className="border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-gold hover:text-[hsl(var(--primary))]"
            >
              <BookOpen className="inline h-3.5 w-3.5 mr-1 text-gold" /> Publications &amp; Research
            </a>
            <a
              href="#resolutions"
              className="border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-gold hover:text-[hsl(var(--primary))]"
            >
              <Scale className="inline h-3.5 w-3.5 mr-1 text-gold" /> Approved Resolutions
            </a>
            <Link
              to="/gallery"
              className="border border-border/80 bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-gold hover:text-[hsl(var(--primary))]"
            >
              <ImageIcon className="inline h-3.5 w-3.5 mr-1 text-gold" /> Photo &amp; Video Gallery
            </Link>
          </div>
          <Link
            to="/constitution"
            className="shrink-0 text-[11.5px] uppercase tracking-wider text-gold font-bold hover:underline"
          >
            Read Constitution &rarr;
          </Link>
        </div>
      </nav>

      {/* ── Section 1: History ──────────────────────────────────────────────── */}
      <section id="history" className="scroll-mt-36 border-b border-border bg-card py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gold" />
              <p className="eyebrow text-gold">Chronicles of Sovereignty</p>
            </div>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
              Official History of the Ovaherero Nation
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-foreground/75">
              The continuous lineage of customary governance, anti-colonial resistance, sacred remembrance,
              and constitutional self-determination recorded by the Authority.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {HISTORICAL_EPOCHS.map((epoch, idx) => (
              <article
                key={epoch.title}
                className="relative border-l-2 border-gold/60 bg-background p-6 pl-8 shadow-sm transition-all hover:border-gold sm:p-8 sm:pl-10"
              >
                <div className="absolute -left-[9px] top-6 h-4 w-4 rounded-full border-2 border-gold bg-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                    Epoch 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {epoch.period}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl sm:text-2xl text-foreground">
                  {epoch.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/80">
                  {epoch.narrative}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 border border-border bg-background p-6 text-center sm:p-8">
            <h3 className="font-display text-xl text-foreground">Paramount Chiefs Succession Archive</h3>
            <p className="mt-2 text-[13px] text-muted-foreground max-w-xl mx-auto">
              Explore the full biographical and photographic record of the seven Paramount Chiefs of the Ovaherero from 1863 to the present.
            </p>
            <Button asChild className="mt-5 rounded-none bg-gold text-[12px] uppercase tracking-wider text-black hover:bg-gold/90">
              <Link to="/paramount-chiefs">Open Succession Archive &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Section 2: Publications & Research ──────────────────────────────── */}
      <section id="publications" className="scroll-mt-36 border-b border-border bg-background py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gold" />
                <p className="eyebrow text-gold">Publications &amp; Research</p>
              </div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
                Authorised Publications &amp; Legal Papers
              </h2>
              <p className="mt-2 text-[13.5px] text-muted-foreground max-w-2xl">
                Official research documents, genocide historical briefs, constitutional reports, and policy positions issued by the Authority and its institutions.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search publications..."
                className="pl-9 rounded-none text-xs"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === cat
                    ? "bg-gold text-[hsl(var(--ink))] shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Publications Grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPublications.map((pub) => (
              <article
                key={pub.id}
                className="group flex flex-col justify-between border border-border bg-card p-6 shadow-sm transition-all hover:border-gold/60 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                      {pub.category || "Official Document"}
                    </span>
                    {pub.type && (
                      <span className="border border-border/80 bg-secondary/50 px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                        {pub.type}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-lg leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                    {pub.title}
                  </h3>

                  {pub.summary ? (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/75">
                      {pub.summary}
                    </p>
                  ) : null}

                  {pub.author && (
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Author: <span className="font-medium text-foreground">{pub.author}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                  {pub.date ? (
                    <time className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {fmtDate(pub.date)}
                    </time>
                  ) : <span />}

                  <Link
                    to={pub.url || "/library"}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))] hover:text-gold"
                  >
                    View Document &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Approved Resolutions ─────────────────────────────────── */}
      <section id="resolutions" className="scroll-mt-36 border-b border-border bg-card py-16 lg:py-20">
        <div className="shell">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gold" />
              <p className="eyebrow text-gold">Official Governance Records</p>
            </div>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-foreground">
              Approved Resolutions &amp; Official Declarations
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-foreground/75">
              Formally enacted resolutions passed by the Chiefs Council, Senate, and General Assembly of the Ovaherero Traditional Authority.
            </p>
          </div>

          {resolutions.length === 0 ? (
            <div className="mt-8 border border-border bg-background p-8 text-center sm:p-12">
              <FileText className="mx-auto h-8 w-8 text-gold" />
              <h3 className="mt-3 font-display text-xl text-foreground">Public Gazette &amp; Resolutions Registry</h3>
              <p className="mx-auto mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                Official resolutions ratified by the High Chiefs Council, Senate, and traditional assemblies are certified and published here for public transparency.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="sm" className="rounded-none bg-[hsl(var(--primary))] text-[11px] uppercase tracking-wider">
                  <Link to="/constitution">Read Full Constitution</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-none border-border text-[11px] uppercase tracking-wider">
                  <Link to="/verify">Verify an OTA Document</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 divide-y divide-border border border-border bg-background">
              {resolutions.map((res) => (
                <div key={res.id} className="p-6 sm:p-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="border border-gold/40 bg-gold/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-gold">
                        Resolution #{res.number || res.id}
                      </span>
                      <time className="text-[11px] text-muted-foreground">{fmtDate(res.approval_date)}</time>
                    </div>
                    <h3 className="mt-2 font-display text-xl text-foreground">{res.title}</h3>
                    <p className="mt-1 text-[13px] text-foreground/75 max-w-2xl">{res.summary}</p>
                  </div>
                  {res.document_url && (
                    <Button asChild variant="outline" size="sm" className="rounded-none border-border shrink-0">
                      <a href={res.document_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
