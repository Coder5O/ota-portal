import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_site/gallery")({
  head: () => ({
    meta: [
      { title: "Photo & Video Gallery · Ovaherero Traditional Authority" },
      { name: "description", content: "Photos and videos from the Ovaherero Traditional Authority, its communities, sacred assemblies, and historic leadership." },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.GalleryItem.filter({ status: "published" }, { sort: "-taken_date", limit: 100 });
    return { items: page.items || [] };
  },
  component: GalleryPage,
});

const CURATED_GALLERY_ITEMS = [
  {
    id: "gallery-1",
    media_url: "/images/heritage/paramount-chief-community-gathering.jpg",
    media_type: "image",
    title: "Community Assembly with the Paramount Chief",
    caption: "Paramount Chief Prof. Mutjinde Katjiua convened with traditional community leaders, elders, and delegates in communal consultation.",
    taken_date: "2023-08-26",
    category: "Culture & Assembly",
  },
  {
    id: "gallery-2",
    media_url: "/images/heritage/hosea-kutako-memorial.jpg",
    media_type: "image",
    title: "Chief Hosea Kutako Memorial Shrine, Okahandja",
    caption: "The sacred memorial shrine honouring Ombara Hosea Kutako, Father of Namibian Nationalism and petitioner to the United Nations.",
    taken_date: "2023-08-27",
    category: "Heritage & Memorials",
  },
  {
    id: "gallery-3",
    media_url: "/images/heritage/paramount-chief-ceremonial-dress.jpg",
    media_type: "image",
    title: "Customary Regalia & Ceremonial Attire",
    caption: "Traditional military-style ceremonial attire and insignia worn during sacred assemblies and pilgrimages.",
    taken_date: "2023-08-25",
    category: "Culture & Assembly",
  },
  {
    id: "gallery-4",
    media_url: "/images/heritage/samuel-maharero.jpg",
    media_type: "image",
    title: "Ombara Samuel Maharero (1856–1923)",
    caption: "Second Paramount Chief who led the 1904 War of Anti-Colonial Resistance against German imperial forces.",
    taken_date: "1904-01-12",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-5",
    media_url: "/images/heritage/maharero-ka-tjamuaha.jpg",
    media_type: "image",
    title: "Ombara Maharero kaTjamuaha (c. 1820–1890)",
    caption: "Founding Paramount Chief of the Ovaherero nation who unified the clans and defended sovereign lands.",
    taken_date: "1885-05-10",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-6",
    media_url: "/images/heritage/clemens-kapuuo.jpg",
    media_type: "image",
    title: "Ombara Clemens Kapuuo (1923–1978)",
    caption: "Fourth Paramount Chief, pioneer of international diplomatic resistance and defender of customary land rights.",
    taken_date: "1975-09-15",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-7",
    media_url: "/images/heritage/kuaima-riruako.jpg",
    media_type: "image",
    title: "Ombara Dr. Kuaima Riruako (1935–2014)",
    caption: "Fifth Paramount Chief who initiated the global genocide reparations movement in the Namibian Parliament.",
    taken_date: "2006-10-26",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-8",
    media_url: "/images/heritage/vekuii-rukoro.jpg",
    media_type: "image",
    title: "Ombara Adv. Vekuii Rukoro (1954–2021)",
    caption: "Sixth Paramount Chief, attorney and statesman who championed reparations litigation in US Federal Court.",
    taken_date: "2017-03-16",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-9",
    media_url: "/images/heritage/mutjinde-katjiua.jpg",
    media_type: "image",
    title: "Ombara Prof. Mutjinde Katjiua",
    caption: "Seventh Paramount Chief of the Ovaherero, leading customary renewal, diaspora consolidation, and community governance.",
    taken_date: "2022-03-12",
    category: "Paramount Chiefs",
  },
  {
    id: "gallery-10",
    media_url: "/images/slides/spitzkoppe-sunset.jpg",
    media_type: "image",
    title: "Spitzkoppe Granite Peaks at Sunset",
    caption: "The majestic granite inselbergs rising above the Namibian plains, symbols of endurance and ancestral resilience.",
    taken_date: "2024-05-18",
    category: "Customary Homelands",
  },
  {
    id: "gallery-11",
    media_url: "/images/slides/oryx-dunes.jpg",
    media_type: "image",
    title: "Oryx traversing the Red Sand Dunes",
    caption: "Gemsbok across the undulating dunes of the Kalahari and Namib, emblem of dignity and survival in the customary homeland.",
    taken_date: "2024-06-20",
    category: "Customary Homelands",
  },
  {
    id: "gallery-12",
    media_url: "/images/slides/namibia-acacia.jpg",
    media_type: "image",
    title: "Camelthorn Acacia across the Pan",
    caption: "The ancient camelthorn acacia (Omumborombonga symbol) standing sentinel over the ancestral grounds.",
    taken_date: "2024-07-11",
    category: "Customary Homelands",
  },
];

const CATEGORIES = ["All", "Paramount Chiefs", "Culture & Assembly", "Heritage & Memorials", "Customary Homelands"];

function GalleryPage() {
  const { items = [] } = Route.useLoaderData() || {};
  const [activeCategory, setActiveCategory] = useState("All");

  const rawItems = items.length > 0 ? items : CURATED_GALLERY_ITEMS;
  const filteredItems = activeCategory === "All"
    ? rawItems
    : rawItems.filter((it) => it.category === activeCategory);

  return (
    <>
      <PageHero
        eyebrow="Photo & video gallery"
        title="Moments from our people, places and gatherings."
        intro="Official photographs and videos from the Ovaherero Traditional Authority, its communities, institutions and commemorations."
        image="/images/heritage/paramount-chief-ceremonial-dress.jpg"
        imageAlt="Ovaherero cultural gathering"
      />

      <Section>
        {/* Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-gold text-[hsl(var(--ink))] shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <figure key={item.id} className="group overflow-hidden border border-border bg-card flex flex-col justify-between">
              <div>
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
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/10">
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/heritage/paramount-chief-ceremonial-dress.jpg";
                      }}
                    />
                    {item.category && (
                      <span className="absolute top-2.5 right-2.5 bg-black/75 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold backdrop-blur-sm border border-gold/40">
                        {item.category}
                      </span>
                    )}
                  </div>
                )}
                <figcaption className="p-4">
                  <h2 className="font-display text-lg leading-snug">{item.title}</h2>
                  {item.caption ? <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/70">{item.caption}</p> : null}
                </figcaption>
              </div>
              {item.taken_date ? (
                <div className="px-4 pb-4">
                  <time className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {fmtDate(item.taken_date)}
                  </time>
                </div>
              ) : null}
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
