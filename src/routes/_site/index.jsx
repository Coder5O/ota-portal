import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Landmark,
  MapPin,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
// Slides 2–4 each have a config key so the admin can override them from the settings panel.
const LANDSCAPE_SLIDES = [
  {
    configKey: "slide_2_image",
    defaultSrc: "/images/slides/spitzkoppe-sunset.jpg",
    alt: "Spitzkoppe granite peaks at sunset, Erongo Region",
    region: "Erongo Region",
    caption: "The ancient granite peaks of the Spitzkoppe — sacred Ovaherero ancestral land.",
  },
  {
    configKey: "slide_3_image",
    defaultSrc: "/images/slides/oryx-dunes.jpg",
    alt: "Oryx standing on red Kalahari dunes, Namibia",
    region: "Kalahari, Namibia",
    caption: "The Oryx — guardian of the red dunes, emblem of Namibian identity.",
  },
  {
    configKey: "slide_4_image",
    defaultSrc: "/images/slides/namibia-acacia.jpg",
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
 * Each slide's image can be overridden by the admin via SiteConfig.
 */
function HeroSlideshow({ heroImg, config, children }) {
  // Build the slide array — admin-uploaded URLs take priority over defaults
  const slides = [
    {
      src: heroImg,
      alt: "Ovaherero women united under the Red Flag, Namibia",
      region: "Ovaherero Homeland",
    },
    ...LANDSCAPE_SLIDES.map((s) => ({
      src: (config?.[s.configKey]) || s.defaultSrc,
      alt: s.alt,
      region: s.region,
    })),
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
      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-2">
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
      <div className="absolute bottom-3 right-5 z-30 hidden sm:block">
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

/**
 * Dynamic Ancestral Wisdom & Paramount Chiefs Quote Rotator.
 * Cycles through authoritative traditional teachings with pause-on-hover,
 * next/previous controls, and speaker cards.
 */
const ANCESTRAL_QUOTES = [
  {
    author: "Ombara Hosea Kutako",
    title: "Paramount Chief (1870–1970) · Father of Modern Namibian Resistance",
    quote:
      "Ovaherero people, hold fast to your custom, your language and your sacred fire. A people without traditional roots are like trees without soil — easily uprooted by the winds of time.",
    year: "Okahandja, 1947",
    tag: "Custom & Identity",
  },
  {
    author: "Ombara Samuel Maharero",
    title: "Supreme Leader (1856–1923) · Defender of Ancestral Lands",
    quote:
      "Rather let us stand together in our land than surrender the inheritance of our ancestors. From this day let us stand as one nation united under the Red Flag.",
    year: "Customary Proclamation, 1904",
    tag: "Unity & Sovereignty",
  },
  {
    author: "Ombara Kuaima Riruako",
    title: "Paramount Chief (1935–2014) · Pioneer of Genocide Restitution",
    quote:
      "Our quest for restorative justice and genocide reparation is neither vengeance nor charity. It is a sacred legal and moral covenant owed to the generations who fell.",
    year: "International Restitution Assembly",
    tag: "Restorative Justice",
  },
  {
    author: "Office of the Ombara Otjitambi",
    title: "The Paramount Chieftaincy · Constitutional Charter",
    quote:
      "A house of governance rooted in truth, consultation, and the dignity of our people. Where every recognized community from the Kaokoveld to the diaspora has a seat at the sacred fire.",
    year: "Constitution Adoption, 2022",
    tag: "Traditional Governance",
  },
];

function AncestralWisdomRotator() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) {
        setIndex((prev) => (prev + 1) % ANCESTRAL_QUOTES.length);
      }
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const current = ANCESTRAL_QUOTES[index];

  return (
    <div
      className="relative overflow-hidden border border-border bg-card p-7 sm:p-9"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <Quote className="h-5 w-5 text-gold" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Ancestral Wisdom &amp; Historical Guidance
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gold/15 px-2.5 py-0.5 text-[9.5px] uppercase tracking-wider text-gold font-semibold">
            {current.tag}
          </span>
          <div className="flex items-center gap-1 pl-2">
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + ANCESTRAL_QUOTES.length) % ANCESTRAL_QUOTES.length)}
              aria-label="Previous quote"
              className="grid h-7 w-7 place-items-center border border-border bg-background transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % ANCESTRAL_QUOTES.length)}
              aria-label="Next quote"
              className="grid h-7 w-7 place-items-center border border-border bg-background transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-[120px] transition-opacity duration-500">
        <blockquote className="font-display text-xl leading-relaxed text-foreground sm:text-2xl">
          “{current.quote}”
        </blockquote>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
          <div>
            <p className="font-display text-base text-foreground font-medium">{current.author}</p>
            <p className="text-[11.5px] text-muted-foreground">{current.title}</p>
          </div>
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-gold">
            {current.year}
          </span>
        </div>
      </div>

      {/* Progress selectors */}
      <div className="mt-6 flex gap-1.5 pt-2">
        {ANCESTRAL_QUOTES.map((q, i) => (
          <button
            key={q.author}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show quote by ${q.author}`}
            className={`h-1.5 transition-all duration-300 ${
              i === index ? "w-8 bg-gold" : "w-2 bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Dynamic Customary Regions & Diaspora Navigator.
 * Interactive tabbed explorer allowing visitors to discover governance in
 * Kaokoveld, Omaheke, Otjozondjupa, Okahandja and Diaspora chapters.
 */
const CUSTOMARY_REGIONS = [
  {
    id: "central",
    name: "Central Ceremonial Heart",
    native: "Okahandja & Windhoek",
    tagline: "Historic seat of paramount chieftaincy & ancestral graves",
    description:
      "The ceremonial and spiritual centre of the Ovaherero nation. Home to the historic burial shrines of the Paramount Chiefs, the annual Otjiserandu Hero's Day assembly, and the primary administrative secretariat.",
    keyFeatures: ["Okahandja Ancestral Shrines", "Otjiserandu Convocations", "Secretariat of the Authority"],
    ctaTo: "/institutions",
    ctaLabel: "View Central Organs",
  },
  {
    id: "omaheke",
    name: "Omaheke & Kalahari",
    native: "Epukiro, Aminuis & Otjinene",
    tagline: "Cattle heritage, communal pastures & traditional courts",
    description:
      "The expansive eastern cattle rangelands where customary pastoralism and community traditional authorities maintain daily governance, adjudicate land boundaries, and preserve oral praise poetry (omambo).",
    keyFeatures: ["Epukiro Traditional Council", "Aminuis Customary Court", "Communal Cattle Rangelands"],
    ctaTo: "/communities",
    ctaLabel: "Explore Omaheke Communities",
  },
  {
    id: "otjozondjupa",
    name: "Otjozondjupa & Waterberg",
    native: "Otjiwarongo & Okakarara",
    tagline: "Resistance battlegrounds & customary assemblies",
    description:
      "Heartland of historic resistance and customary conservation. Encompasses Okarundu, Waterberg sacred heritage sites, and active communal leadership councils working under the Chiefs Council.",
    keyFeatures: ["Waterberg Sacred Memorials", "Okakarara Customary Assembly", "Heritage Preservation"],
    ctaTo: "/culture",
    ctaLabel: "Learn Historical Heritage",
  },
  {
    id: "kunene",
    name: "Kunene & Kaokoveld",
    native: "Opuwo, Sesfontein & Kunene North",
    tagline: "Living customary law, ancestral clans & sacred fire",
    description:
      "The cradle of Ovaherero traditions, where ancestral pastoral customs, traditional attire, and the living observance of Okuruuo (the sacred fire) have continued uninterrupted for centuries.",
    keyFeatures: ["Living Okuruuo Traditions", "Clan Lineages (Ozombepo)", "Traditional Elders Council"],
    ctaTo: "/leadership",
    ctaLabel: "Traditional Leaders Directory",
  },
  {
    id: "diaspora",
    name: "Global Diaspora Hubs",
    native: "Botswana, South Africa & Worldwide",
    tagline: "Trans-boundary chapters & genocide descendant councils",
    description:
      "Communities established following the 1904–1908 genocide across Botswana (Mahalapye, Tsabong, Sehitwa), South Africa, the United Kingdom, and the United States, maintaining customary affiliation and digital registry.",
    keyFeatures: ["Botswana Chapters Assembly", "OGGF International Chapters", "Digital Membership Roll"],
    ctaTo: "/diaspora",
    ctaLabel: "Connect with Diaspora Hubs",
  },
];

function CustomaryRegionsExplorer() {
  const [activeId, setActiveId] = useState("central");
  const activeRegion = CUSTOMARY_REGIONS.find((r) => r.id === activeId) || CUSTOMARY_REGIONS[0];

  return (
    <div className="border border-border bg-card">
      {/* Region navigation tabs */}
      <div className="flex overflow-x-auto border-b border-border bg-secondary/30 scrollbar-none">
        {CUSTOMARY_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActiveId(r.id)}
            className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-[11.5px] uppercase tracking-wider transition-colors ${
              r.id === activeId
                ? "border-b-2 border-gold bg-card font-medium text-[hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-gold" />
            {r.name}
          </button>
        ))}
      </div>

      {/* Active region details */}
      <div className="p-7 sm:p-9">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[hsl(var(--primary))]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                {activeRegion.native}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Customary Jurisdiction
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">
              {activeRegion.tagline}
            </h3>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-foreground/75">
              {activeRegion.description}
            </p>
            <div className="mt-6">
              <Button asChild className="rounded-none bg-gold px-5 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to={activeRegion.ctaTo}>
                  {activeRegion.ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border border-border bg-background/80 p-5">
            <p className="eyebrow text-gold">Customary Pillars &amp; Institutions</p>
            <ul className="mt-3 space-y-2.5">
              {activeRegion.keyFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-[13px] text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-4 text-[11px] text-muted-foreground">
              Official recognized jurisdiction recorded under OTA Customary Assembly frameworks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic Key Metrics / Operational Status Strip.
 */
function LiveMetricsStrip() {
  const metrics = [
    { number: "36+", label: "Recognised Communities", sub: "Namibia & Trans-boundary" },
    { number: "8", label: "Constitutional Chapters", sub: "Promulgated 22 Aug 2022" },
    { number: "14", label: "Customary Organs", sub: "Senate, Councils & OGGF" },
    { number: "103", label: "Years Sacred Memorial", sub: "Okahandja Assembly (1923–2026)" },
  ];

  return (
    <section className="border-b border-border bg-card">
      <div className="shell grid grid-cols-2 divide-x divide-y divide-border sm:divide-y-0 lg:grid-cols-4">
        {metrics.map((m, idx) => (
          <div
            key={m.label}
            className={`group p-5 transition-colors hover:bg-secondary/40 sm:p-6 ${
              idx % 2 !== 0 ? "border-t sm:border-t-0" : ""
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold leading-none text-[hsl(var(--primary))] sm:text-4xl">
                {m.number}
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
            </div>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground">
              {m.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {m.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Build heritage showcase cards, resolving admin-uploaded images from config. */
function buildHeritageCards(config) {
  return [
    {
      src: config?.slide_2_image || "/images/slides/spitzkoppe-sunset.jpg",
      alt: "Spitzkoppe peaks at sunset",
      region: "Erongo Region",
      title: "Sacred Granite Peaks",
      desc: "The Spitzkoppe have watched over Ovaherero communities across generations — ancient landmarks of the ancestral homeland.",
    },
    {
      src: config?.slide_3_image || "/images/slides/oryx-dunes.jpg",
      alt: "Oryx on Kalahari red dunes",
      region: "Kalahari",
      title: "Guardians of the Dunes",
      desc: "The Oryx, emblem of resilience, roams the red Kalahari dunes — lands held in custodianship by the Ovaherero people.",
    },
    {
      src: config?.slide_4_image || "/images/slides/namibia-acacia.jpg",
      alt: "Lone acacia under the Etosha sky",
      region: "Etosha, Namibia",
      title: "The Lone Witness",
      desc: "Camelthorn acacias have stood sentinel over the Etosha pan since before the recorded history of the Ovaherero kingdom.",
    },
  ];
}

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
      {/* ── Full-bleed Hero with background slideshow (compacted -50% height) ─── */}
      <HeroSlideshow heroImg={heroImg} config={config}>
        <section className="relative text-primary-foreground">
          <div className="shell flex min-h-[250px] flex-col justify-center py-10 sm:min-h-[290px] sm:py-14 lg:min-h-[340px] lg:max-w-3xl lg:py-16">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <p className="eyebrow rise text-primary-foreground/75 tracking-[0.22em]">
                Ovaherero Traditional Authority · Republic of Namibia
              </p>
            </div>
            <h1 className="rise rise-1 mt-2.5 text-[2.1rem] leading-[1.06] drop-shadow-md sm:text-[2.7rem] lg:text-[3.35rem]">
              United under the Red Flag, guardians of custom and continuity.
            </h1>
            <p className="rise rise-2 mt-3 max-w-xl text-[0.92rem] leading-relaxed text-primary-foreground/85 drop-shadow">
              The official digital home of the Ovaherero Traditional Authority — its leadership, institutions,
              constitution, and communities in Namibia and across the diaspora.
            </p>
            <div className="rise rise-3 mt-5 flex flex-wrap gap-2.5">
              <Button asChild className="rounded-none bg-gold px-5 text-[11.5px] uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to="/about">
                  Discover the Authority <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-none border-primary-foreground/40 bg-primary-foreground/10 px-5 text-[11.5px] uppercase tracking-[0.16em] text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20 hover:text-primary-foreground"
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

      {/* ── Dynamic Operational Key Metrics Strip ───────────────────────────── */}
      <LiveMetricsStrip />

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

      {/* ── Dynamic Ancestral Wisdom & Paramount Chiefs Quote Rotator ─────── */}
      <section className="shell py-12 lg:py-16">
        <AncestralWisdomRotator />
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
            {buildHeritageCards(config).map((card) => (
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

      {/* ── Dynamic Customary Regions & Diaspora Hub Navigator ───────────── */}
      <section className="border-t border-border bg-secondary/30 py-20 lg:py-24">
        <div className="shell">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Customary Homeland &amp; Jurisdiction</p>
              <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">
                Customary Regions &amp; Diaspora Hubs
              </h2>
            </div>
            <Link
              to="/communities"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              All Traditional Communities
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <CustomaryRegionsExplorer />
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
                      <div className="flex items-center gap-2">
                        <p className="font-display text-[1.25rem] leading-snug text-foreground">
                          <Link to="/events" className="hover:text-[hsl(var(--primary))]">
                            {event.title}
                          </Link>
                        </p>
                        <span className="inline-flex items-center gap-1 bg-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Official Conclave
                        </span>
                      </div>
                      <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
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