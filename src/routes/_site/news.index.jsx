import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Image } from "@/components/ui/image";
import { fmtDate } from "@/lib/format";

const CATEGORIES = ["Announcement", "Press Release", "Speech", "Statement", "Culture", "Diaspora", "Notice"];

export const Route = createFileRoute("/_site/news/")({
  head: () => ({
    meta: [
      { title: "News & Media · Ovaherero Traditional Authority" },
      { name: "description", content: "Press releases, announcements, speeches, statements and official notices of the Ovaherero Traditional Authority." },
    ],
  }),
  validateSearch: (search) => ({ category: typeof search.category === "string" ? search.category : undefined }),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: async ({ deps }) => {
    const query = { status: "published" };
    if (deps.category) query.category = deps.category;
    const page = await base44.entities.NewsPost.filter(query, { sort: "-published_date", limit: 40 });
    return { posts: page.items || [] };
  },
  component: NewsPage,
});

function NewsPage() {
  const { posts = [] } = Route.useLoaderData() || {};
  const { category } = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="News &amp; media"
        title="Official communications of the Authority."
        intro="Announcements, press releases, speeches and statements published by the Office of the Paramount Chief and the institutions of the OTA."
        image="/images/slides/spitzkoppe-sunset.jpg"
        imageKey="news_hero_image"
        imageAlt="Official communications &amp; media"
      />

      <Section>
        <div className="mb-8 flex flex-wrap gap-1.5">
          <Link
            to="/news"
            search={{}}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${!category ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-primary-foreground" : "border-border text-foreground/70 hover:border-gold"}`}
          >
            All
          </Link>
          {CATEGORIES.map((item) => (
            <Link
              key={item}
              to="/news"
              search={{ category: item }}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${category === item ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-primary-foreground" : "border-border text-foreground/70 hover:border-gold"}`}
            >
              {item}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <EmptyNote>
            No published communication matches this filter. The administration publishes news and media releases from the
            Administrator Console.
          </EmptyNote>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="group border-t border-foreground/15 pt-5">
                {post.cover_image ? (
                  <Link to="/news/$postId" params={{ postId: post.id }}>
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      className="mb-4 aspect-[16/10] w-full object-cover"
                      fittingType="fill"
                    />
                  </Link>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="text-[hsl(var(--oxblood))]">{post.category}</span>
                  <span className="h-px w-4 bg-border" />
                  <time>{fmtDate(post.published_date || post.created_date)}</time>
                  {post.is_demo ? <IllustrativeBadge /> : null}
                </div>
                <h2 className="mt-3 font-display text-[1.4rem] leading-snug">
                  <Link to="/news/$postId" params={{ postId: post.id }} className="hover:text-[hsl(var(--primary))]">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-foreground/65">{post.excerpt}</p>
                ) : null}
                <Link
                  to="/news/$postId"
                  params={{ postId: post.id }}
                  className="mt-4 inline-block text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
                >
                  Read more
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}