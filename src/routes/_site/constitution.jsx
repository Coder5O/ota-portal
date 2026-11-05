import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, Search } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paragraphs } from "@/lib/format";
import { toast } from "sonner";

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
    return { articles: articles.items || [], document: docs.items?.[0] || null };
  },
  component: ConstitutionPage,
});

function ConstitutionPage() {
  const { articles, document } = Route.useLoaderData();
  const [term, setTerm] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("all");

  const chapters = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      if (a.chapter) set.add(a.chapter);
    });
    return Array.from(set).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
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
        eyebrow="Governing text & constitutional library"
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
          <p className="eyebrow">Constitutional Integrity & Versioning</p>
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
