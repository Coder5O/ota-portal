import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { PARAMOUNT_CHIEFS } from "./paramount-chiefs.$slug";
import { CHAPTERS_DATA } from "./chapters";

export const Route = createFileRoute("/_site/search")({
  head: () => ({
    meta: [
      { title: "Search · Ovaherero Traditional Authority" },
      { name: "description", content: "Search news, events, institutions, documents and constitutional articles." },
    ],
  }),
  validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : undefined }),
  component: SearchPage,
});

const SOURCES = [
  {
    entity: "NewsPost",
    type: "News",
    field: "title",
    query: { status: "published" },
    link: (row) => ({ to: "/news/$postId", params: { postId: row.id } }),
    meta: (row) => `${row.category} · ${fmtDate(row.published_date || row.created_date)}`,
  },
  {
    entity: "Event",
    type: "Event",
    field: "title",
    query: { status: "published" },
    link: () => ({ to: "/events" }),
    meta: (row) => fmtDate(row.starts_at),
  },
  {
    entity: "Institution",
    type: "Institution",
    field: "name",
    query: { status: "published" },
    link: (row) => ({ to: "/institutions/$slug", params: { slug: row.slug } }),
    meta: (row) => row.native_name || "Institutional structure",
  },
  {
    entity: "ConstitutionArticle",
    type: "Constitution",
    field: "title",
    query: { status: "published" },
    link: () => ({ to: "/constitution" }),
    meta: (row) => `Article ${row.number}${row.chapter ? ` · ${row.chapter}` : ""}`,
  },
  {
    entity: "TraditionalCommunity",
    type: "Community",
    field: "name",
    query: { status: "published" },
    link: () => ({ to: "/communities" }),
    meta: (row) => row.region || row.country || row.kind,
  },
  {
    entity: "Document",
    type: "Document",
    field: "title",
    query: { visibility: "public" },
    link: () => ({ to: "/constitution" }),
    meta: (row) => `${row.category} · version ${row.version}`,
  },
];

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q || "");
  const active = (q || "").trim();

  useEffect(() => {
    setTerm(q || "");
  }, [q]);

  const results = useQuery({
    queryKey: ["site-search", active],
    enabled: active.length > 1,
    queryFn: async () => {
      const qLower = active.toLowerCase();

      // In-memory search for Paramount Chiefs
      const matchingChiefs = PARAMOUNT_CHIEFS.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          (c.nameAlt && c.nameAlt.toLowerCase().includes(qLower)) ||
          c.title.toLowerCase().includes(qLower) ||
          c.reign.toLowerCase().includes(qLower) ||
          c.era.toLowerCase().includes(qLower) ||
          c.teaser.toLowerCase().includes(qLower),
      ).map((c) => ({
        id: `chief-${c.slug}`,
        title: `${c.name} (${c.reign})`,
        __type: "Paramount Chief",
        __source: {
          link: () => ({ to: "/paramount-chiefs/$slug", params: { slug: c.slug } }),
          meta: () => `${c.era} · ${c.title}`,
        },
      }));

      // In-memory search for Chapters & Traditional Seats
      const matchingChapters = CHAPTERS_DATA.filter(
        (ch) =>
          ch.chapter.toLowerCase().includes(qLower) ||
          ch.location.toLowerCase().includes(qLower) ||
          ch.namedChief.toLowerCase().includes(qLower) ||
          ch.region.toLowerCase().includes(qLower) ||
          ch.summary.toLowerCase().includes(qLower),
      ).map((ch) => ({
        id: `chapter-${ch.id}`,
        title: `${ch.chapter} — ${ch.region} Region`,
        __type: "Chapter & Traditional Seat",
        __source: {
          link: () => ({ to: "/chapters", search: { q: ch.chapter } }),
          meta: () => `${ch.statusLabel} · Chief: ${ch.namedChief}`,
        },
      }));

      const responses = await Promise.all(
        SOURCES.map(async (source) => {
          try {
            const page = await base44.entities[source.entity].filter(
              { ...source.query, [source.field]: { $regex: active, $options: "i" } },
              { limit: 8 },
            );
            return (page?.items || []).map((row) => ({ ...row, __type: source.type, __source: source }));
          } catch {
            return [];
          }
        }),
      );

      return [...matchingChiefs, ...matchingChapters, ...responses.flat()];
    },
  });

  const rows = results.data || [];

  return (
    <>
      <PageHero
        eyebrow="Site search"
        title="Search the Authority's website."
        intro="Find news, events, institutions, communities, documents and articles of the Constitution."
        image="/images/slides/spitzkoppe-sunset.jpg"
        imageKey="search_hero_image"
        imageAlt="Search the Ovaherero Traditional Authority portal"
      >
        <form
          className="flex max-w-xl gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ to: "/search", search: { q: term.trim() || undefined } });
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search this website"
              aria-label="Search this website"
              className="rounded-none border-primary-foreground/25 bg-primary-foreground/10 pl-10 text-[14px] text-primary-foreground placeholder:text-primary-foreground/50"
            />
          </div>
          <Button type="submit" className="rounded-none bg-gold px-6 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
            Search
          </Button>
        </form>
      </PageHero>

      <Section>
        {active.length < 2 ? (
          <p className="text-[13px] text-muted-foreground">Enter at least two characters to search.</p>
        ) : results.isLoading ? (
          <p className="text-[13px] text-muted-foreground">Searching…</p>
        ) : rows.length === 0 ? (
          <div className="border border-dashed border-border bg-card/60 px-6 py-10 text-center">
            <p className="text-[13px] text-muted-foreground">
              Nothing published matches “{active}”. Try a different word, or browse the <Link to="/news" className="underline">news</Link> and{" "}
              <Link to="/events" className="underline">events</Link> pages.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
              {rows.length} result{rows.length === 1 ? "" : "s"} for “{active}”
            </p>
            <ul className="divide-y divide-border border-y border-border">
              {rows.map((row) => {
                const target = row.__source.link(row);
                return (
                  <li key={`${row.__type}-${row.id}`} className="py-4">
                    <Link {...target} className="group flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-display text-[1.15rem] leading-snug group-hover:text-[hsl(var(--primary))]">
                        {row.title || row.name || row.heading}
                      </span>
                      <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                        {row.__type}
                        {row.__source.meta(row) ? ` · ${row.__source.meta(row)}` : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Section>
    </>
  );
}