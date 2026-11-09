import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Landmark, ScrollText, ShieldCheck, Users } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { EmptyNote } from "@/components/site/PageParts";
import { dayMonth, fmtDate } from "@/lib/format";
import { INSTITUTIONS } from "@/lib/institutions";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/934e2f759_generated_image.png";
const DETAIL_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/a4f4fd11b_generated_image.png";

// Namibian landscape slides shown in the hero carousel after the main hero image.
// The first slide (index 0) is always the admin-configurable hero image.
const LANDSCAPE_SLIDES = [
  {
    src: "/images/slides/spitzkoppe-sunset.jpg",
    alt: "Spitzkoppe granite peaks at sunset, Erongo Region",
    region: "Erongo Region",
    caption: "The ancient granite peaks of the Spitzkoppe — sacred Ovaherero ancestral land.",
  },
  {
    src: "/images/slides/oryx-dunes.jpg",
    alt: "Oryx standing on red Kalahari dunes, Namibia",
    region: "Kalahari, Namibia",
    caption: "The Oryx — guardian of the red dunes, emblem of Namibian identity.",
  },
  {
    src: "/images/slides/namibia-acacia.jpg",
    alt: "Lone camelthorn acacia tree on the Etosha pan",
    region: "Etosha, Namibia",
    caption: "Solitary beneath the endless sky — the camelthorn witnesses centuries of Ovaherero life.",
  },
];

/**
 * Full-bleed hero background slideshow.
 * Images fill the entire hero section behind the text, blending into the
 * primary maroon colour on all edges. Auto-advances every 6 s with a slow
 * cross-fade and Ken Burns zoom. Pauses while the user hovers.
 */
function HeroSlideshow({ heroImg, children }) {
  const slides = [
    {
      src: heroImg,
      alt: "Ovaherero women united under the Red Flag, Namibia",
      region: "Ovaherero Homeland",
    },
    ...LANDSCAPE_SLIDES,
  ];

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const paused = useRef(false);
  const timerRef = useRef(null);

  const goTo = useCallback(
    (idx) => {
      const next = (idx + slides.length) % slides.length;
      setPrev(current);
      setCurrent(next);
      // Clear the "prev" ghost after the crossfade completes
      setTimeout(() => setPrev(null), 1400);
    },
    [current, slides.length],
  );

  // Auto-advance every 6 s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!paused.current) goTo(current + 1);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [current, goTo]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* Background slide stack */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, i) => {
          const isActive = i === current;
          const isLeaving = i === prev;
          return (
            <div
              key={i}
              aria-hidden={!isActive}
              style={{
                position: "absolute",
                inset: 0,
                transition: "opacity 1.4s ease-in-out",
                opacity: isActive ? 1 : isLeaving ? 0 : 0,
                zIndex: isActive ? 2 : isLeaving ? 1 : 0,
              }}
            >
              {/* Ken Burns zoom — only on active slide */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: isActive ? "scale(1.07)" : "scale(1)",
                  transition: "transform 7s ease-out",
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          );
        })}

        {/* Multi-directional blend into the maroon background */}
        {/* left fade — merges with the text column */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)/0.82) 22%, hsl(var(--primary)/0.35) 55%, transparent 100%)",
          }}
        />
        {/* top & bottom fade */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, hsl(var(--primary)/0.60) 0%, transparent 30%, transparent 65%, hsl(var(--primary)/0.70) 100%)",
          }}
        />
        {/* right edge vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to left, hsl(var(--primary)/0.45) 0%, transparent 30%)",
          }}
        />
        {/* global colour tint to unify image hues with the brand */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: "hsl(var(--primary)/0.18)", mixBlendMode: "multiply" }}
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-20">{children}</div>

      {/* Slide indicator dots — bottom-centre */}
      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: "3px",
              width: i === current ? "28px" : "8px",
              background: i === current ? "hsl(var(--gold, 45 85% 60%))" : "rgba(255,255,255,0.45)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.4s ease, background 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* Region label — bottom-right corner */}
      <div className="absolute bottom-10 right-6 z-30 hidden sm:block">
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            transition: "opacity 0.6s",
          }}
        >
          {slides[current].region}
        </span>
      </div>
    </div>
  );
}

/** Interactive Namibian Heritage Showcase gallery section */
const HERITAGE_CARDS = [
  {
    src: "/images/slides/spitzkoppe-sunset.jpg",
    alt: "Spitzkoppe peaks at sunset",
    region: "Erongo Region",
    title: "Sacred Granite Peaks",
    desc: "The Spitzkoppe have watched over Ovaherero communities across generations — ancient landmarks of the ancestral homeland.",
  },
  {
    src: "/images/slides/oryx-dunes.jpg",
    alt: "Oryx on Kalahari red dunes",
    region: "Kalahari",
    title: "Guardians of the Dunes",
    desc: "The Oryx, emblem of resilience, roams the red Kalahari dunes — lands held in custodianship by the Ovaherero people.",
  },
  {
    src: "/images/slides/namibia-acacia.jpg",
    alt: "Lone acacia under the Etosha sky",
    region: "Etosha, Namibia",
    title: "The Lone Witness",
    desc: "Camelthorn acacias have stood sentinel over the Etosha pan since before the recorded history of the Ovaherero kingdom.",
  },
];

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Ovaherero Traditional Authority · Official Website" },
      {
        name: "description",
        content:
          "The official digital home of the Ovaherero Traditional Authority: leadership, constitution, institutions, news, events, culture and membership.",
      },
    ],
  }),
  loader: async () => {
    const [news, events, institutions, welcome, configRes] = await Promise.all([
      base44.entities.NewsPost.filter({ status: "published" }, { sort: "-published_date", limit: 3 }),
      base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 3 }),
      base44.entities.Institution.filter({ status: "published" }, { sort: "sort_order", limit: 6 }),
      base44.entities.ContentBlock.filter(
        { page_slug: "paramount-chief", status: "published" },
        { sort: "sort_order", limit: 1 },
      ),
      base44.entities.SiteConfig.list({ sort: "-updated_date", limit: 1 }),
    ]);

    const liveInstitutions = institutions.items || [];
    const institutionsList = liveInstitutions.length > 0
      ? liveInstitutions
      : INSTITUTIONS.slice(0, 6).map((inst) => ({
          id: inst.slug,
          slug: inst.slug,
          name: inst.name,
          native_name: inst.native,
          summary: inst.summary,
        }));

    return {
      news: news.items || [],
      events: events.items || [],
      institutions: institutionsList,
      welcome: welcome.items?.[0] || null,
      config: configRes.items?.[0] || null,
    };
  },
  component: HomePage,
});

const QUICK_LINKS = [
  { to: "/constitution", label: "The Constitution", note: "Read by article", icon: ScrollText },
  { to: "/leadership", label: "Traditional Leadership", note: "Recognised leaders", icon: Users },
  { to: "/membership", label: "Membership", note: "Apply or renew", icon: ShieldCheck },
  { to: "/events", label: "Events & Calendar", note: "Ceremonies and meetings", icon: CalendarDays },
];

function HomePage() {
  const { news, events, institutions, welcome, config } = Route.useLoaderData();
  const heroImg = config?.home_hero_image || HERO_IMAGE;
  const detailImg = config?.home_detail_image || DETAIL_IMAGE;

  return (
    <>
      {/* ── Full-bleed Hero with background slideshow ─────────────────────── */}
      <HeroSlideshow heroImg={heroImg}>
        <section className="relative text-primary-foreground">
          <div className="shell flex min-h-[520px] flex-col justify-center py-24 sm:min-h-[580px] lg:min-h-[680px] lg:max-w-2xl lg:py-36">
            <p className="eyebrow rise text-primary-foreground/70">Ovaherero Traditional Authority</p>
            <h1 className="rise rise-1 mt-5 text-[2.6rem] leading-[1.02] drop-shadow-lg sm:text-[3.4rem] lg:text-[4.5rem]">
              United under the Red Flag, guardians of custom and continuity.
            </h1>
            <p className="rise rise-2 mt-6 max-w-xl text-[0.98rem] leading-relaxed text-primary-foreground/80 drop-shadow">
              The official digital home of the Ovaherero Traditional Authority — its leadership, institutions,
              constitution, and communities in Namibia and across the diaspora.
            </p>
            <div className="rise rise-3 mt-9 flex flex-wrap gap-3">
              <Button asChild className="rounded-none bg-gold px-6 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to="/about">
                  Discover the Authority <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-none border-primary-foreground/40 bg-primary-foreground/10 px-6 text-[12px] uppercase tracking-[0.16em] text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <Link to="/constitution">Read the Constitution</Link>
              </Button>
            </div>
          </div>
        </section>
      </HeroSlideshow>

      <section className="border-b border-border bg-card">
        <div className="shell grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-4 px-1 py-6 transition-colors hover:bg-secondary/50 lg:px-7"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
                <span>
                  <span className="block font-display text-lg leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.note}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
        <div className="relative">
          <Image
            src={detailImg}
            alt="Detail of Ovaherero ceremonial dress"
            className="aspect-[4/5] w-full object-cover"
            fittingType="fill"
          />
          <div className="absolute -bottom-6 -right-4 hidden border border-gold/40 bg-background px-6 py-5 sm:block">
            <p className="font-display text-3xl leading-none text-[hsl(var(--primary))]">22</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              August 2022
              <br />
              Constitution adopted
            </p>
          </div>
        </div>
        <div className="self-center">
          <div className="flex items-center gap-3">
            <p className="eyebrow">{welcome?.heading || "Message from the Office of the Paramount Chief"}</p>
            {welcome?.is_demo ? <IllustrativeBadge /> : null}
          </div>
          <h2 className="mt-4 text-[2rem] leading-[1.12] sm:text-[2.6rem]">
            {welcome?.body
              ? welcome.heading
              : "A house of governance rooted in the dignity of our people."}
          </h2>
          <div className="mt-6 space-y-4 text-[0.95rem] leading-[1.85] text-foreground/75">
            {(welcome?.body
              ? welcome.body.split(/\n\s*\n/).slice(0, 2)
              : [
                  "The Ovaherero Traditional Authority exists to preserve the customs, language and heritage of the Ovaherero people, and to provide orderly traditional governance for its communities wherever they live.",
                  "This platform gives our leadership, councils and members one shared record: applications and memberships, meetings and resolutions, official documents, announcements and community programmes.",
                ]
            ).map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          {!welcome ? (
            <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Official text pending publication by the Office of the Paramount Chief
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-6">
            <Link
              to="/paramount-chief"
              className="group inline-flex items-center gap-2 border-b border-gold pb-1 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              The Paramount Chief
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 border-b border-border pb-1 text-[12px] uppercase tracking-[0.16em] text-foreground/70"
            >
              About the Authority
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-20 lg:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Institutional structures</p>
              <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">The organs of the Authority</h2>
            </div>
            <Link
              to="/leadership"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Leadership directory
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {institutions.length === 0 ? (
            <div className="mt-10">
              <EmptyNote>Institutional structures are being configured by the administration.</EmptyNote>
            </div>
          ) : (
            <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {institutions.map((inst) => (
                <Link
                  key={inst.id}
                  to={`/institutions/${inst.slug}`}
                  className="group bg-card p-7 transition-colors hover:bg-background"
                >
                  <Landmark className="h-4 w-4 text-gold" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-[1.45rem] leading-snug text-foreground group-hover:text-[hsl(var(--primary))]">
                    {inst.name}
                  </h3>
                  {inst.native_name ? (
                    <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{inst.native_name}</p>
                  ) : null}
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-foreground/65">{inst.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Namibian Heritage & Sacred Lands Showcase ────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Custodians of sacred lands &amp; living heritage</p>
              <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">
                The landscapes of the Ovaherero homeland
              </h2>
            </div>
            <Link
              to="/culture"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Culture &amp; Heritage
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {HERITAGE_CARDS.map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden border border-border bg-card"
              >
                {/* Image with hover zoom */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={card.src}
                    alt={card.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
                  {/* Region badge */}
                  <span className="absolute left-3 top-3 bg-[hsl(var(--primary))]/85 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-primary-foreground backdrop-blur-sm">
                    {card.region}
                  </span>
                </div>
                {/* Text */}
                <div className="p-5">
                  <h3 className="font-display text-[1.2rem] leading-snug text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground/65">{card.desc}</p>
                </div>
                {/* Gold bottom border on hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">News & media</p>
            <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">Latest from the Authority</h2>
          </div>
          <Link
            to="/news"
            className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            All news
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {news.length === 0 ? (
          <div className="mt-10">
            <EmptyNote>No news has been published yet.</EmptyNote>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="group border-t border-foreground/15 pt-5">
                <div className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="text-[hsl(var(--oxblood))]">{item.category}</span>
                  <span className="h-px w-4 bg-border" />
                  <time>{fmtDate(item.published_date || item.created_date)}</time>
                  {item.is_demo ? <IllustrativeBadge /> : null}
                </div>
                <h3 className="mt-3 font-display text-[1.4rem] leading-snug text-foreground">
                  <Link to="/news/$postId" params={{ postId: item.id }} className="hover:text-[hsl(var(--primary))]">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-foreground/65">{item.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-card py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Calendar</p>
            <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.4rem]">Upcoming events</h2>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-foreground/65">
              Ceremonies, commemorations and meetings open to the public are published here by the administration.
            </p>
            <Button asChild variant="outline" className="mt-7 rounded-none border-foreground/25 text-[12px] uppercase tracking-[0.16em]">
              <Link to="/events">Full calendar</Link>
            </Button>
          </div>
          {events.length === 0 ? (
            <EmptyNote>No event has been published yet.</EmptyNote>
          ) : (
            <ul className="divide-y divide-border border-t border-border">
              {events.map((event) => {
                const date = dayMonth(event.starts_at);
                return (
                  <li key={event.id} className="flex items-center gap-6 py-5">
                    <div className="w-16 shrink-0 border-r border-border pr-4 text-center">
                      <p className="font-display text-2xl leading-none text-[hsl(var(--primary))]">{date.day}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{date.month}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[1.25rem] leading-snug text-foreground">
                        <Link to="/events" className="hover:text-[hsl(var(--primary))]">
                          {event.title}
                        </Link>
                      </p>
                      <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
                        {[event.venue, event.town].filter(Boolean).join(", ") || event.audience}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-[hsl(var(--primary))] text-primary-foreground">
        <div className="shell grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Registration</p>
            <h2 className="mt-3 text-[2rem] leading-[1.1] sm:text-[2.6rem]">
              Become a registered member of the Ovaherero Traditional Authority.
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-primary-foreground/75">
              Individuals, traditional leaders, communities, councils and diaspora chapters may apply. Every
              application is reviewed by the administration before any membership or recognition is conferred.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="rounded-none bg-gold px-6 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90">
              <Link to="/membership">Start an application</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-primary-foreground/35 bg-transparent text-[12px] uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/communities">Register a community</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}