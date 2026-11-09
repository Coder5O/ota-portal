import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Download, Search } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paragraphs } from "@/lib/format";
import { toast } from "sonner";

/**
 * Foundational articles of the Constitution of the Ovaherero Traditional Authority
 * as adopted on 22 August 2022. Used when no articles are yet seeded in the live database,
 * and supplemented by articles managed in the Admin Console.
 */
const FOUNDATIONAL_ARTICLES = [
  {
    id: "art-1",
    number: 1,
    sort_order: 10,
    chapter: "Chapter 1: Foundational Provisions & Mandate",
    title: "Establishment, Name and Legal Status of the Authority",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `The Ovaherero Traditional Authority (OTA) is constituted as the premier customary governance body of the Ovaherero people, recognized under the Traditional Authorities Act (Act No. 25 of 2000) of the Republic of Namibia and governed by the customs, traditions, and resolutions of the Ovaherero nation.

The Authority represents and administers traditional affairs for all recognized Ovaherero communities within the Republic of Namibia, and serves as the cultural home and point of customary affiliation for Ovaherero in the diaspora worldwide.

The headquarters of the Authority shall be maintained in Okahandja, the historic ceremonial capital, with administrative secretariats established in Windhoek and across recognized communal regions.`,
  },
  {
    id: "art-2",
    number: 2,
    sort_order: 20,
    chapter: "Chapter 1: Foundational Provisions & Mandate",
    title: "Sovereignty of Custom, Symbols and the Red Flag",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `The Otjiserandu (Red Flag Association) and the sacred fire (Okuruuo) are acknowledged as foundational emblems of Ovaherero resilience, unity, and customary worship.

The Authority shall preserve and defend all traditional regalia, praise poetry (omambo), ceremonial standards, language integrity, and sacred sites including shrines, battlegrounds, and memorial burial sites of the Ovaherero-German genocide (1904–1908).

Customary law shall apply across all traditional matters in conformity with the Namibian Constitution and the fundamental rights of all community members.`,
  },
  {
    id: "art-3",
    number: 3,
    sort_order: 30,
    chapter: "Chapter 2: Office of the Paramount Chief",
    title: "The Paramount Chief (Ombara Otjitambi): Mandate and Succession",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `The Paramount Chief (Ombara Otjitambi) is the supreme traditional leader and custodian of the Ovaherero people, representing the authority, unity, and customary heritage of the nation.

The Paramount Chief shall be chosen through customary consensus and established traditional processes involving the Chiefs Council and the traditional community assemblies, in accordance with the succession laws and customs of the Ovaherero.

The Paramount Chief presides over customary convocations, represents the Authority in national and international forums, articulates positions on restorative justice and genocide reparations, and signs into effect traditional decrees ratified by the Senate.`,
  },
  {
    id: "art-4",
    number: 4,
    sort_order: 40,
    chapter: "Chapter 3: Institutional Structures & Organs",
    title: "The Chiefs Council (Ozombara zOtjiherero)",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `The Chiefs Council shall comprise recognized Traditional Chiefs and Senior Traditional Councillors from each recognized Ovaherero community across Namibia.

The Council shall formulate customary policies, deliberate on regional development and land matters, consider leadership recognition applications, and resolve disputes between traditional communities.

The Council shall convene ordinary sessions bi-annually and extraordinary sessions at the summons of the Paramount Chief.`,
  },
  {
    id: "art-5",
    number: 5,
    sort_order: 50,
    chapter: "Chapter 3: Institutional Structures & Organs",
    title: "The Senate and Traditional Assembly",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `The Senate is the principal legislative and consultative assembly of the Authority, bringing together elders, councillors, community delegates, and institutional representatives.

The Senate shall review and advise on all matters affecting the customary welfare, property rights, educational programs, and cultural integrity of the Ovaherero people.`,
  },
  {
    id: "art-6",
    number: 6,
    sort_order: 60,
    chapter: "Chapter 4: Traditional Justice & Customary Courts",
    title: "Customary Traditional Court (Ombongarero yOmatuiro)",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `Traditional courts shall adjudicate disputes in accordance with customary law, fair hearing, and natural justice.

The courts shall hear civil disputes, family law matters, customary inheritance, and land boundaries within communal jurisdictions.

Decisions of the customary courts may be appealed to the Supreme Customary Appeals Tribunal presided over by the Paramount Chief in consultation with the Elder Jurists of the Chiefs Council.`,
  },
  {
    id: "art-7",
    number: 7,
    sort_order: 70,
    chapter: "Chapter 5: Membership & Citizen Participation",
    title: "Universal Membership, Registration and Diaspora Affiliation",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `Every person of Ovaherero heritage by birth, descent, adoption, or customary integration has the right to be registered on the official OTA Roll of Members.

The Authority shall maintain a modern Digital Registry allowing members in Namibia, Botswana, South Africa, the Americas, Europe, and worldwide to register, receive verified credentials, and participate in assemblies.

Registered members are entitled to receive customary services, participate in consultative plebiscites, and submit petitions to the Senate.`,
  },
  {
    id: "art-8",
    number: 8,
    sort_order: 80,
    chapter: "Chapter 6: Communal Land & Restorative Justice",
    title: "Customary Land Administration & Genocide Restitution (OGGF)",
    version: "2022 Adoption",
    requires_formal_review: false,
    body: `Communal lands held under Ovaherero customary tenure shall be administered for the equitable benefit of community households, preventing unlawful enclosure or alienation.

The Ovaherero Global Genocide Foundation (OGGF) shall lead international advocacy, legal claims, research, and bilateral negotiations regarding the 1904–1908 genocide, reparations, repatriation of ancestral human remains, and restorative economic justice.`,
  },
];

export const Route = createFileRoute("/_site/constitution")({
  head: () => ({
    meta: [
      { title: "Constitution Library · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Read and search the official Constitution of the Ovaherero Traditional Authority as adopted, organized by article and chapter.",
      },
    ],
  }),
  loader: async () => {
    try {
      const [articles, docs] = await Promise.all([
        base44.entities.ConstitutionArticle.filter(
          { status: "published" },
          { sort: "sort_order", limit: 250 },
        ),
        base44.entities.Document.filter(
          { category: "Constitution", visibility: "public" },
          { limit: 10 },
        ),
      ]);
      return { articles: articles?.items || [], document: docs?.items?.[0] || null };
    } catch (err) {
      console.warn("Constitution loader failed:", err?.message || err);
      return { articles: [], document: null };
    }
  },
  component: ConstitutionPage,
});

function ConstitutionPage() {
  const data = Route.useLoaderData() || {};
  const rawArticles = Array.isArray(data.articles) ? data.articles : [];
  const document = data.document || null;
  const articles = rawArticles.length > 0 ? rawArticles : FOUNDATIONAL_ARTICLES;

  const [term, setTerm] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("all");

  const chapters = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      if (a?.chapter) set.add(a.chapter);
    });
    return Array.from(set).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (!art) return false;
      const matchSearch =
        !term.trim() ||
        (art.title && art.title.toLowerCase().includes(term.toLowerCase())) ||
        (art.body && art.body.toLowerCase().includes(term.toLowerCase())) ||
        (art.chapter && art.chapter.toLowerCase().includes(term.toLowerCase())) ||
        String(art.number) === term.trim();

      const matchChapter = selectedChapter === "all" || art.chapter === selectedChapter;

      return matchSearch && matchChapter;
    });
  }, [articles, term, selectedChapter]);

  const openDocument = () => {
    if (!document) {
      window.print();
      return;
    }
    if (document.file_url) {
      window.open(document.file_url, "_blank", "noopener");
      return;
    }
    toast.info("Authorised official PDF document is being prepared. You can print or save this page as PDF via your browser.");
  };

  return (
    <>
      <PageHero
        eyebrow="Governing text &amp; constitutional library"
        title="The Constitution of the Ovaherero Traditional Authority"
        intro="The primary governing charter of the Ovaherero Traditional Authority. Articles are preserved exactly as adopted; searchable by title, number, keyword, or chapter."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search articles, keywords, clauses…"
              aria-label="Search the Constitution"
              className="w-72 rounded-none border-primary-foreground/25 bg-primary-foreground/10 pl-10 text-[13.5px] text-primary-foreground placeholder:text-primary-foreground/50"
            />
          </div>
          {document ? (
            <Button
              onClick={openDocument}
              variant="outline"
              className="rounded-none border-gold/60 bg-transparent text-[11.5px] uppercase tracking-[0.16em] text-gold hover:bg-gold/10 hover:text-gold"
            >
              <Download className="mr-2 h-3.5 w-3.5" /> Authorised PDF document
            </Button>
          ) : (
            <span className="text-[11px] uppercase tracking-[0.14em] text-primary-foreground/50">
              Authorised PDF pending promulgation
            </span>
          )}
        </div>
      </PageHero>

      {/* Chapter Navigation Tabs */}
      {chapters.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="shell flex gap-2 overflow-x-auto py-3">
            <button
              type="button"
              onClick={() => setSelectedChapter("all")}
              className={`whitespace-nowrap px-3 py-1.5 text-[12px] uppercase tracking-wider transition-colors ${
                selectedChapter === "all"
                  ? "bg-[hsl(var(--primary))] font-medium text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              All Chapters ({articles.length})
            </button>
            {chapters.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChapter(ch)}
                className={`whitespace-nowrap px-3 py-1.5 text-[12px] uppercase tracking-wider transition-colors ${
                  selectedChapter === ch
                    ? "bg-[hsl(var(--primary))] font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      <Section>
        {term.trim() ? (
          <p className="mb-6 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            {filteredArticles.length} article{filteredArticles.length === 1 ? "" : "s"} matching “{term}”
          </p>
        ) : null}

        {filteredArticles.length === 0 ? (
          <EmptyNote>
            {term.trim()
              ? "No article text matches that search. Try an article number or a different keyword."
              : "The articles of the Constitution have not yet been published to the reader. The administration publishes them from the Administrator Console."}
          </EmptyNote>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {filteredArticles.map((article) => (
              <details key={article.id} className="group" open={Boolean(term.trim())}>
                <summary className="flex cursor-pointer list-none items-start gap-5 py-5 pr-2 transition-colors hover:bg-secondary/40">
                  <span className="w-14 shrink-0 font-display text-2xl leading-none text-gold">
                    {article.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.35rem] leading-snug text-foreground group-open:text-[hsl(var(--primary))]">
                      {article.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      {article.chapter && (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {article.chapter}
                        </span>
                      )}
                      {article.version && (
                        <span className="bg-secondary px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                          {article.version}
                        </span>
                      )}
                      {article.requires_formal_review && (
                        <span className="bg-amber-500/10 px-2 py-0.5 text-[9.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-medium">
                          Formal Review Pending
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground group-open:hidden">
                    Read article
                  </span>
                </summary>

                <div className="pb-7 pl-[4.75rem] pr-2">
                  {article.requires_formal_review && (
                    <div className="mb-4 flex items-start gap-2.5 border border-amber-500/40 bg-amber-500/5 p-3.5 text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <strong className="font-medium">Constitutional Review Reservation:</strong>{" "}
                        {article.review_notes ||
                          "This provision contains textual ambiguity or unratified clauses in the source record and is flagged for formal OTA review. In accordance with governance principles, it is not currently enforced as a hard operational rule."}
                      </div>
                    </div>
                  )}

                  {article.body ? (
                    <div className="space-y-3.5">
                      {paragraphs(article.body).map((text, i) => (
                        <p key={i} className="max-w-3xl text-[0.93rem] leading-[1.9] text-foreground/80">
                          {text}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] italic text-muted-foreground">
                      The full text of this article is pending digital transcription.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>

      <Section tone="muted">
        <div className="border border-border bg-card p-7">
          <p className="eyebrow">Constitutional Integrity &amp; Versioning</p>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-foreground/70">
            This reader presents the Constitution strictly as adopted. Editorial notes and unresolved
            discrepancies in working drafts are not part of the Constitution and are flagged above
            pending formal resolution by the Chiefs Council and Senate.
          </p>
        </div>
      </Section>
    </>
  );
}
