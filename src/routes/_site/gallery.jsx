import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { EmptyNote, Section } from "@/components/site/PageParts";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/gallery")({
  head: () => ({
    meta: [
      { title: "Photo & Video Gallery · Ovaherero Traditional Authority" },
      { name: "description", content: "Photos and videos from the Ovaherero Traditional Authority, its communities and official events." },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.GalleryItem.filter({ status: "published" }, { sort: "-taken_date", limit: 100 });
    return { items: page.items || [] };
  },
  component: GalleryPage,
});

function GalleryPage() {
  const { items = [] } = Route.useLoaderData() || {};

  return (
    <>
      <PageHero
        eyebrow="Photo & video gallery"
        title="Moments from our people, places and gatherings."
        intro="Official photographs and videos from the Ovaherero Traditional Authority, its communities, institutions and commemorations."
        image="/images/heritage/ovaherero-women-red-flag.jpg"
        imageAlt="Ovaherero cultural gathering"
      />
      <Section>
        {items.length === 0 ? (
          <EmptyNote>The official gallery is being prepared. Please return soon for photographs and videos from the Authority.</EmptyNote>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure key={item.id} className="overflow-hidden border border-border bg-card">
                {item.media_type === "video" ? (
                  <div className="relative bg-black">
                    <video controls preload="metadata" poster={item.thumbnail_url || undefined} className="aspect-[4/3] w-full object-cover">
                      <source src={item.media_url} />
                      Your browser does not support this video.
                    </video>
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                      <Play className="h-3 w-3 fill-current" /> Video
                    </span>
                  </div>
                ) : (
                  <img src={item.media_url} alt={item.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                )}
                <figcaption className="p-4">
                  <h2 className="font-display text-xl leading-tight">{item.title}</h2>
                  {item.caption ? <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">{item.caption}</p> : null}
                  {item.taken_date ? <time className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{fmtDate(item.taken_date)}</time> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
