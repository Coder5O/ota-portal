import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Landmark,
  MapPin,
  Pause,
  Play,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PARAMOUNT_CHIEFS } from "./paramount-chiefs.$slug";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { EmptyNote } from "@/components/site/PageParts";
import { dayMonth, fmtDate } from "@/lib/format";
import { INSTITUTIONS } from "@/lib/institutions";
import { CURATED_MILESTONE_NEWS } from "@/lib/curated-milestones-news";
import { CURATED_CALENDAR_EVENTS } from "@/lib/curated-events";

const HERO_IMAGE = "/images/heritage/ovaherero-women-red-flag.jpg";
const DETAIL_IMAGE = "/images/heritage/paramount-chief-community-gathering.jpg";

/**
 * Authentic verified fallback photos for the 8 foundational calendar convocations.
 * Used when no custom picture has been uploaded by the admin for an event.
 */
export const DEFAULT_EVENT_PHOTOS = {
  "annual-community-meeting-toasis": "/images/heritage/paramount-chief-community-gathering.jpg",
  "hererofest-2026": "/images/heritage/ovaherero-women-red-flag.jpg",
  "herero-day-2026": "/images/milestones/01-okahandja-parade.jpg",
  "herero-genocide-day-2026": "/images/milestones/06-reichstag-delegation.jpg",
  "chiefs-council-meeting-2026": "/images/milestones/09-ovaherero-house-briefing.jpg",
  "community-outreach-2026": "/images/milestones/01-okahandja-grave.jpg",
  "cultural-day-in-botswana-2026": "/images/milestones/05-botswana-petition.jpg",
  "heritage-day-in-south-africa-2026": "/images/milestones/03-pretoria-petition.jpg",
};

/**
 * Resolves the primary event image, prioritizing admin-uploaded cover photos or SiteConfig overrides.
 */
export function getEventImage(evt, config) {
  if (evt?.cover_image) return evt.cover_image;
  if (config?.[`event_${evt?.id}_image`]) return config[`event_${evt?.id}_image`];
  if (config?.[`event_${evt?.slug}_image`]) return config[`event_${evt?.slug}_image`];
  if (evt?.id && DEFAULT_EVENT_PHOTOS[evt.id]) return DEFAULT_EVENT_PHOTOS[evt.id];
  if (evt?.slug && DEFAULT_EVENT_PHOTOS[evt.slug]) return DEFAULT_EVENT_PHOTOS[evt.slug];
  if (config?.events_hero_image) return config.events_hero_image;
  return "/images/heritage/paramount-chief-community-gathering.jpg";
}

/**
 * Build the 4 dynamic hero and milestone slides, resolving admin overrides from SiteConfig.
 * Each slide integrates an image with a core governance number and its living story.
 */
function buildHeroAndMilestoneSlides(heroImg, config) {
  return [
    {
      index: 0,
      src: config?.slide_1_image || heroImg || "/images/heritage/ovaherero-women-red-flag.jpg",
      alt: "Ovaherero women gathered under the Red Flag, Namibia",
      region: "Ovaherero Homeland",
      number: config?.slide_1_number || "36+",
      label: config?.slide_1_label || "Recognised Communities",
      sub: "Namibia & Trans-boundary",
      title: config?.slide_1_title || "United under the Red Flag, guardians of custom and continuity.",
      desc:
        config?.slide_1_desc ||
        "The official digital home of the Ovaherero Traditional Authority — its leadership, institutions, constitution, and communities in Namibia and across the diaspora.",
      badge: "Custodians of Sacred Fire & Living Heritage",
      ctaTo: "/communities",
      ctaLabel: "Discover the Authority",
      statStory:
        "Over 36 traditional constituencies spanning Namibia's ancestral heartlands, Botswana, and South Africa — united under customary leadership, the Senate of Chiefs, and the holy fire (Okuruuo).",
      facts: [
        "Custodians of the sacred Holy Fire (Okuruuo) across 36+ domains",
        "Direct legislative seating in the High Chiefs Council",
        "Preserving linguistic, pastoral, and cultural self-determination",
      ],
    },
    {
      index: 1,
      src: config?.slide_2_image || "/images/slides/spitzkoppe-sunset.jpg",
      alt: "Spitzkoppe granite peaks at sunset, Erongo Region",
      region: "Erongo Region",
      number: config?.slide_2_number || "8",
      label: config?.slide_2_label || "Constitutional Chapters",
      sub: "Promulgated 22 Aug 2022",
      title: config?.slide_2_title || "8 Constitutional Chapters: Supreme Customary Law & Governance.",
      desc:
        config?.slide_2_desc ||
        "Promulgated on 22 August 2022, codifying democratic customary governance, the High Chiefs Council, and communal self-determination.",
      badge: "Customary Constitutional Order",
      ctaTo: "/constitution",
      ctaLabel: "Read the Constitution",
      statStory:
        "A codified body of 8 foundational chapters and 32 constitutional articles uniting ancient customary norms with modern democratic transparency and rule of law.",
      facts: [
        "Unanimously ratified by all traditional regional assemblies",
        "Codified paramount chieftaincy succession and customary judicial tenure",
        "Binding supreme customary charter for all OTA statutory institutions",
      ],
    },
    {
      index: 2,
      src: config?.slide_3_image || "/images/slides/oryx-dunes.jpg",
      alt: "Oryx standing on red Kalahari dunes, Namibia",
      region: "Kalahari, Namibia",
      number: config?.slide_3_number || "14",
      label: config?.slide_3_label || "Customary Organs",
      sub: "Senate, Councils & OGGF",
      title: config?.slide_3_title || "14 Customary Organs: Traditional Senate, High Councils & Global Foundation.",
      desc:
        config?.slide_3_desc ||
        "Structured customary governance encompassing the Senate of Chiefs, Council of Traditional Leaders, youth councils, and the Genocide Foundation.",
      badge: "Restorative Justice & Communal Assembly",
      ctaTo: "/institutions",
      ctaLabel: "Explore Customary Organs",
      statStory:
        "Fourteen specialized statutory organs managing judicial hearings, customary land administration, youth leadership, and international reparations advocacy.",
      facts: [
        "Supreme Senate of Chiefs and Traditional Court",
        "Ovaherero Global Genocide Foundation (OGGF)",
        "Council of Traditional Women and Youth Assembly",
      ],
    },
    {
      index: 3,
      src: config?.slide_4_image || "/images/slides/namibia-acacia.jpg",
      alt: "Lone camelthorn acacia tree on the Etosha pan",
      region: "Etosha, Namibia",
      number: config?.slide_4_number || "103",
      label: config?.slide_4_label || "Years Sacred Memorial",
      sub: "Okahandja Assembly (1923–2026)",
      title: config?.slide_4_title || "103 Years of Sacred Memorial: Okahandja Pilgrimage & Unbroken Covenant.",
      desc:
        config?.slide_4_desc ||
        "Honouring the eternal covenant of Ombara Samuel Maharero and Ombara Hosea Kutako with annual Red Flag pilgrimage and historic memory.",
      badge: "Historical Continuum & Sacred Remembrance",
      ctaTo: "/events",
      ctaLabel: "View Commemorations & Events",
      statStory:
        "An unbroken century of pilgrimage since the reburial of Ombara Samuel Maharero at Okahandja on 23 August 1923, sustaining the living legacy of Ombara Hosea Kutako.",
      facts: [
        "Historic reburial of Ombara Samuel Maharero in August 1923",
        "Living pilgrimage attended by tens of thousands annually",
        "Otjiserandu regiment ceremonial commemorations and holy fire assemblies",
      ],
    },
  ];
}

const CHIEF_PUNCHLINES = {
  "maharero-ka-tjamuaha": "United clans into a sovereign nation.",
  "samuel-maharero": "Supreme commander of 1904 Resistance.",
  "hosea-kutako": "Father of modern Namibian liberation.",
  "clemens-kapuuo": "Courageous defender of customary land rights.",
  "kuaima-riruako": "Initiated global genocide reparations campaign.",
  "vekuii-rukoro": "Championed landmark US federal reparations litigation.",
  "mutjinde-katjiua": "Leading constitutional renewal and diaspora unity.",
};

export const COMMUNITY_MILESTONES_2026 = [
  {
    id: "okahandja-parade",
    milestoneNumber: "01",
    date: "24–26 July 2026",
    location: "Okahandja, Namibia",
    title: "103rd Okahandja Commemoration & Heroes Parade Inspection",
    eyebrow: "Historical Convocations",
    punchline: "Paramount Chief Prof. Mutjinde Katjiua inspected the Otjiserandu parade, inaugurated field marshals, and led the sacred procession to ancestral shrines at Erf 1755 and Kukuri Centre.",
    credit: "Photograph by Sven-Eric Stender · 26 July 2026",
    photo: "/images/milestones/01-okahandja-parade.jpg",
    ctaLabel: "Read News Report",
    ctaTo: "/news/okahandja-parade-inspection-2026",
    statusBadge: "Verified Event Photo",
  },
  {
    id: "bundestag-reichstag",
    milestoneNumber: "02",
    date: "14 October 2026",
    location: "Reichstag, Berlin, Germany",
    title: "Historic Bundestag Motions & Reichstag Delegation",
    eyebrow: "Parliamentary Mission",
    punchline: "The German Bundestag debated historic motions on the recognition of the 1904–1908 genocides as the official OvaHerero and Nama delegation convened behind the Reichstag.",
    credit: "Bernd Sauer-Diete Photography · 14 October 2026",
    photo: "/images/milestones/06-reichstag-delegation.jpg",
    ctaLabel: "Read News Report",
    ctaTo: "/news/berlin-bundestag-reichstag-motions-2026",
    statusBadge: "Berlin Delegation",
  },
  {
    id: "southern-africa-diaspora",
    milestoneNumber: "03",
    date: "October 2026",
    location: "Pretoria & Gaborone",
    title: "Transnational Diaspora Mobilisation in Southern Africa",
    eyebrow: "Diaspora Missions",
    punchline: "Community delegations marched in Gaborone and submitted official petitions at the Union Buildings in Pretoria, demanding victim-centred reparations and direct tripartite dialogue.",
    credit: "News & All Botswana Accompanying Photo · October 2026",
    photo: "/images/milestones/05-botswana-petition.jpg",
    ctaLabel: "Read News Report",
    ctaTo: "/news/gaborone-botswana-diplomatic-march-2026",
    statusBadge: "Southern Africa Assembly",
  },
];

/**
 * 2026 Community Milestones & International Mission Hero Banner.
 * Proportions and interactive caliber mirror the Paramount Chiefs banner,
 * showcasing verified events, photographs, diplomatic petitions, and reparations milestones from 2026.
 */
function Milestones2026HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = COMMUNITY_MILESTONES_2026.length;
  const milestone = COMMUNITY_MILESTONES_2026[current];

  const goTo = useCallback(
    (index) => setCurrent((index + total) % total),
    [total],
  );

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(() => goTo(current + 1), 6500);
    return () => clearInterval(timer);
  }, [current, goTo, isPaused]);

  return (
    <section
      className="relative flex min-h-[62vh] sm:min-h-[66vh] lg:min-h-[70vh] max-h-[680px] flex-col justify-between overflow-hidden bg-[hsl(350_26%_16%)] text-white border-b-2 border-gold/40 shadow-lg"
      aria-label="OvaHerero 2026 Community Milestones Hero Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Layer: Sunset Landscape + Dark Oxblood/Obsidian Tint + Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/images/slides/spitzkoppe-sunset.jpg"
          alt="Namibian Landscape"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/slides/namibia-acacia.jpg";
          }}
        />
        <img
          key={`milestone-bg-${milestone.id}`}
          src={milestone.photo}
          alt=""
          className="absolute -right-20 -top-20 h-[140%] w-[65%] object-cover opacity-20 blur-3xl transition-opacity duration-1000"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/heritage/paramount-chief-community-gathering.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(350_30%_14%)]/95 via-[hsl(350_26%_16%)]/88 to-[hsl(350_26%_15%)]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(350_30%_12%)] via-transparent to-black/35" />
      </div>

      <div className="relative z-10 shell flex flex-1 flex-col justify-center py-5 sm:py-6 lg:py-8">
        {/* Top Eyebrow: Minimal Words & Archive Link */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-[11px]">
              OvaHerero 2026 Milestones · Community &amp; Reparations
            </span>
          </div>
          <Link
            to="/news"
            className="group inline-flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-gold/90 transition-colors hover:text-white"
          >
            All Milestone News &amp; Reports
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Hero Main Stage Grid: Proportions matching Chiefs Banner */}
        <div className="my-auto grid items-center gap-6 py-3 sm:py-4 lg:grid-cols-[0.9fr_1.3fr] lg:gap-10">
          {/* Left: Headline, Location, Punchy Narrative & CTA */}
          <div className="space-y-3 min-w-0">
            {/* Milestone Number & Status Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gold">
                Milestone {milestone.milestoneNumber} · {milestone.date}
              </span>
              <span className="border border-white/20 bg-white/10 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-white/90">
                {milestone.statusBadge}
              </span>
            </div>

            {/* Title & Location */}
            <div>
              <h1 className="font-display text-2xl leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                {milestone.title}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-gold/85 text-[11.5px] font-medium uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{milestone.location}</span>
              </div>
            </div>

            {/* Punchy Narrative */}
            <p className="max-w-md text-[0.92rem] leading-relaxed text-white/85 sm:text-[0.98rem]">
              {milestone.punchline}
            </p>

            {/* Single CTA Button & Chevron Navigation */}
            <div className="flex items-center gap-3 pt-1">
              <Button asChild className="rounded-none bg-gold px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ink))] shadow-md hover:bg-gold/90 transition-transform active:scale-95">
                <Link to={milestone.ctaTo}>
                  {milestone.ctaLabel} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  aria-label="Previous Milestone"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  aria-label="Next Milestone"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Featured Milestone Photo - Matching 16/10 Aspect Ratio & Gold Borders */}
          <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[620px] mx-auto lg:ml-auto">
            <div className="relative aspect-[16/10] overflow-hidden border-2 border-gold/60 bg-[hsl(350_24%_14%)] shadow-2xl p-1 bg-black/40">
              <div className="relative h-full w-full overflow-hidden border border-gold/30">
                <img
                  key={milestone.id}
                  src={milestone.photo}
                  alt={milestone.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/heritage/paramount-chief-community-gathering.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Milestone Ordinal Badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md border border-gold/50 px-2.5 py-0.5">
                  <span className="font-display text-sm font-bold text-gold">
                    {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                {/* Bottom Plate on Milestone Image */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">{milestone.date} · {milestone.location}</p>
                  <p className="mt-0.5 font-display text-base sm:text-lg leading-tight font-medium truncate drop-shadow-sm">{milestone.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70 truncate">{milestone.credit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Paramount Chiefs of the Ovaherero Hero Banner.
 * Full width from the first iteration, with vertical length (height) decreased by 50%
 * for a sleek, cinematic, compact banner with 25% lightened brown shade,
 * dynamic 6.5s auto-rotation, prominent portraiture, and concise highlights.
 */
function ParamountChiefsHeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = PARAMOUNT_CHIEFS.length;
  const chief = PARAMOUNT_CHIEFS[current];

  const goTo = useCallback(
    (index) => setCurrent((index + total) % total),
    [total],
  );

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(() => goTo(current + 1), 6500);
    return () => clearInterval(timer);
  }, [current, goTo, isPaused]);

  return (
    <section
      className="relative flex min-h-[62vh] sm:min-h-[66vh] lg:min-h-[70vh] max-h-[680px] flex-col justify-between overflow-hidden bg-[hsl(22_34%_24%)] text-white border-b-2 border-gold/40 shadow-lg"
      aria-label="Paramount Chiefs of the Ovaherero Hero Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Layer: Namibian Nature Landscape + Warm Brown Tint + Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/images/slides/namibia-acacia.jpg"
          alt="Namibian Landscape"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/slides/spitzkoppe-sunset.jpg";
          }}
        />
        <img
          key={`bg-${chief.slug}`}
          src={chief.photo}
          alt=""
          className="absolute -right-20 -top-20 h-[140%] w-[65%] object-cover opacity-15 blur-3xl transition-opacity duration-1000"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/heritage/paramount-chief-ceremonial-dress.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(22_34%_20%)]/95 via-[hsl(22_34%_24%)]/88 to-[hsl(22_34%_22%)]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(22_34%_18%)] via-transparent to-black/30" />
      </div>

      <div className="relative z-10 shell flex flex-1 flex-col justify-center py-5 sm:py-6 lg:py-8">
        {/* Top Eyebrow: Minimal Words */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-[11px]">
              Ombára Otjitambi · Succession
            </span>
          </div>
          <Link
            to="/paramount-chiefs"
            className="group inline-flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-gold/90 transition-colors hover:text-white"
          >
            Archive
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Hero Main Stage Grid: Dominating Portrait Width & Minimal Words */}
        <div className="my-auto grid items-center gap-6 py-3 sm:py-4 lg:grid-cols-[0.9fr_1.3fr] lg:gap-10">
          {/* Left: Punchy Minimal Text */}
          <div className="space-y-3 min-w-0">
            {/* Chief Number & Reign */}
            <div className="flex items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gold">
                Chief {String(current + 1).padStart(2, "0")} · {chief.reign}
              </span>
              {chief.isDisputed && (
                <span className="border border-gold/40 bg-gold/15 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-gold">
                  Contested
                </span>
              )}
            </div>

            {/* Chief Name */}
            <div>
              <h1 className="font-display text-2xl leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                {chief.name}
              </h1>
              {chief.nameAlt && (
                <span className="font-display text-sm text-gold/85 italic">
                  ({chief.nameAlt})
                </span>
              )}
            </div>

            {/* 50% Reduced Punchline */}
            <p className="max-w-md text-[0.92rem] leading-relaxed text-white/85 sm:text-[0.98rem]">
              {CHIEF_PUNCHLINES[chief.slug] || chief.teaser.split(".")[0] + "."}
            </p>

            {/* Single CTA Button & Chevrons */}
            <div className="flex items-center gap-3 pt-1">
              <Button asChild className="rounded-none bg-gold px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ink))] shadow-md hover:bg-gold/90 transition-transform active:scale-95">
                <Link to="/paramount-chiefs/$slug" params={{ slug: chief.slug }}>
                  Biography <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  aria-label="Previous Chief"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  aria-label="Next Chief"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Featured Portrait - Increased Dominating Width */}
          <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[620px] mx-auto lg:ml-auto">
            <div className="relative aspect-[16/10] overflow-hidden border-2 border-gold/60 bg-[hsl(22_30%_20%)] shadow-2xl p-1 bg-black/40">
              <div className="relative h-full w-full overflow-hidden border border-gold/30">
                <img
                  key={chief.slug}
                  src={chief.photo}
                  alt={`Portrait of ${chief.name}`}
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/heritage/paramount-chief-ceremonial-dress.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Chief Ordinal Badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md border border-gold/50 px-2.5 py-0.5">
                  <span className="font-display text-sm font-bold text-gold">
                    {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                {/* Bottom Plate on Portrait */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">{chief.reign}</p>
                  <p className="mt-0.5 font-display text-base sm:text-lg leading-tight font-medium truncate drop-shadow-sm">{chief.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70">{chief.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Cinematic Events & Customary Convocations Hero Banner.
 * Positioned ~70% down the site, showcasing different events with pictures uploaded by the admin,
 * interactive carousel auto-rotation, rich ceremony narrative, attendee registration (RSVP),
 * and interactive thumbnail navigation strip.
 */
export function EventsFeaturedHeroBanner({ events = [], allEvents = [], config = {} }) {
  const eventItems = useMemo(() => {
    const list =
      allEvents && allEvents.length > 0
        ? allEvents
        : events && events.length > 0
        ? events
        : CURATED_CALENDAR_EVENTS;

    return list.map((evt) => {
      const photo = getEventImage(evt, config);
      const isCustomPhoto = Boolean(
        evt.cover_image || config?.[`event_${evt.id}_image`] || config?.[`event_${evt.slug}_image`]
      );
      return {
        ...evt,
        resolvedPhoto: photo,
        isCustomPhoto,
      };
    });
  }, [allEvents, events, config]);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = eventItems.length || 1;

  const goTo = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;
    const timer = setInterval(() => {
      goTo(current + 1);
    }, 7000);
    return () => clearInterval(timer);
  }, [current, goTo, isPaused, total]);

  const activeEvent = eventItems[current] || eventItems[0] || {};
  const dm = dayMonth(activeEvent.starts_at);
  const dateStr =
    activeEvent.date_display ||
    (activeEvent.starts_at ? fmtDate(activeEvent.starts_at) : "Convocations 2026");
  const locationStr = activeEvent.venue
    ? activeEvent.town
      ? `${activeEvent.venue}, ${activeEvent.town}`
      : activeEvent.venue
    : activeEvent.town || activeEvent.location || "Ovaherero Traditional Assembly Grounds";

  return (
    <section
      className="relative flex min-h-[62vh] sm:min-h-[66vh] lg:min-h-[70vh] max-h-[680px] flex-col justify-between overflow-hidden bg-[hsl(350_28%_14%)] text-white border-y-2 border-gold/40 shadow-lg"
      aria-label="Upcoming Events & Customary Assemblies Hero Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Layer: Atmospheric Image Blur + Warm Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          key={`bg-img-${activeEvent.id || current}`}
          src={activeEvent.resolvedPhoto}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-25 blur-md scale-105 transition-all duration-1000 ease-out"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/heritage/paramount-chief-community-gathering.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(350_30%_12%)]/95 via-[hsl(350_26%_14%)]/90 to-[hsl(350_26%_13%)]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(350_32%_10%)] via-transparent to-black/40" />
      </div>

      <div className="relative z-10 shell flex flex-1 flex-col justify-between py-4 sm:py-5 lg:py-6">
        {/* Top Eyebrow Bar: Live Indicator + Counter + Full Calendar Link */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold sm:text-[11px]">
              Tradition in Practice · Convocations &amp; Ceremonies
            </span>
          </div>
          <Link
            to="/events"
            className="group inline-flex items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-gold/90 transition-colors hover:text-white"
          >
            All Calendar Events &amp; Convocations
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Hero Main Stage Grid: Proportions matching Milestones and Chiefs Banners */}
        <div className="my-auto grid items-center gap-6 py-2 sm:py-3 lg:grid-cols-[0.9fr_1.3fr] lg:gap-10">
          {/* Left: Event Details, Badges, Narrative & Actions */}
          <div className="space-y-3 min-w-0">
            {/* Category, Status & Photo Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-gold/50 bg-gold/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gold">
                {activeEvent.category_label || "Customary Assembly"}
              </span>
              {activeEvent.isCustomPhoto ? (
                <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/20 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3 w-3" /> Admin Photo
                </span>
              ) : (
                <span className="border border-white/20 bg-white/10 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-white/90">
                  Official Convocations
                </span>
              )}
              {activeEvent.registration_open ? (
                <span className="border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-gold">
                  RSVP Open
                </span>
              ) : null}
            </div>

            {/* Event Title & Location */}
            <div>
              <h2 className="font-display text-2xl leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                {activeEvent.title}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-gold/85 text-[11.5px] font-medium uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {dateStr}
                </span>
                <span className="inline-flex items-center gap-1 line-clamp-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {locationStr}
                </span>
              </div>
            </div>

            {/* Description / Narrative */}
            <p className="max-w-md line-clamp-2 sm:line-clamp-3 text-[0.92rem] leading-relaxed text-white/85 sm:text-[0.98rem]">
              {activeEvent.description ||
                "Official gathering and traditional convocation of the Ovaherero Traditional Authority."}
            </p>

            {/* Single CTA Button & Chevron Navigation matching Banner 1 & 2 */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                asChild
                className="rounded-none bg-gold px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ink))] shadow-md hover:bg-gold/90 transition-transform active:scale-95"
              >
                <Link to="/events" search={{ event: activeEvent.id }}>
                  RSVP to Attend <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-none border-white/30 bg-white/5 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/15 hover:border-gold"
              >
                <Link to="/events">Full Calendar</Link>
              </Button>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  aria-label="Previous Event"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  aria-label="Next Event"
                  className="grid h-8 w-8 place-items-center border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold/25 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Featured Event Picture - Matching 16/10 Aspect Ratio & Gold Borders */}
          <div className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[620px] mx-auto lg:ml-auto">
            <div className="relative aspect-[16/10] overflow-hidden border-2 border-gold/60 bg-[hsl(350_24%_14%)] shadow-2xl p-1 bg-black/40">
              <div className="relative h-full w-full overflow-hidden border border-gold/30">
                <img
                  key={`slide-img-${activeEvent.id || current}`}
                  src={activeEvent.resolvedPhoto}
                  alt={activeEvent.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "/images/heritage/paramount-chief-community-gathering.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Calendar Ordinal & Date Badge Overlay */}
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md border border-gold/50 px-2.5 py-0.5">
                  <span className="font-display text-sm font-bold text-gold">
                    {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                {/* Top-Left Date Stamp */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 border border-gold/50 bg-black/75 px-2 py-0.5 text-center backdrop-blur-md shadow-md">
                  <span className="font-display text-sm font-bold text-gold">
                    {dm?.day || "—"}
                  </span>
                  <span className="text-[8.5px] uppercase tracking-wider text-white/90 font-medium">
                    {dm?.month || "2026"}
                  </span>
                </div>

                {/* Bottom Plate on Photo */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">
                    {activeEvent.town || "Customary Domain"}
                  </p>
                  <p className="mt-0.5 font-display text-base sm:text-lg leading-tight font-medium truncate drop-shadow-sm">
                    {activeEvent.title}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/70 truncate">
                    {activeEvent.venue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Thumbnail Strip - Compact & Proportional */}
        <div className="pt-2 border-t border-white/15">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {eventItems.map((evt, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={`thumb-${evt.id || idx}`}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`group relative flex items-center gap-1.5 p-1 text-left transition-all border ${
                    isActive
                      ? "border-gold bg-gold/20 shadow-md ring-1 ring-gold"
                      : "border-white/15 bg-black/40 hover:border-gold/60 hover:bg-white/5"
                  }`}
                >
                  <div className="relative h-6 w-9 shrink-0 overflow-hidden bg-black/60 border border-white/10">
                    <img
                      src={evt.resolvedPhoto}
                      alt=""
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        isActive
                          ? "scale-105"
                          : "group-hover:scale-105 opacity-75 group-hover:opacity-100"
                      }`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "/images/heritage/paramount-chief-community-gathering.jpg";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[9.5px] font-medium leading-tight ${
                        isActive ? "text-gold font-bold" : "text-white/80"
                      }`}
                    >
                      {evt.title}
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-white/50 truncate">
                      {evt.date_display || (evt.starts_at ? fmtDate(evt.starts_at) : "")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


/**
 * Dynamic Ancestral Wisdom & Paramount Chiefs Quote Rotator.
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
          <span className="text-[11px] uppercase tracking-wider text-gold font-medium">
            {current.year}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Traditional Territories & Customary Regions Navigator.
 */
const CUSTOMARY_REGIONS = [
  {
    id: "central",
    name: "Central & Okahandja",
    heroDesc: "Seat of the Sacred Shrine & Paramount Chieftaincy",
    badge: "Sacred Shrine & Assembly",
    description:
      "Okahandja is the historical capital and spiritual sanctuary of the Ovaherero nation. Home to the sacred graves of Supreme Leader Samuel Maharero and Paramount Chief Hosea Kutako, it hosts the annual Red Flag Pilgrimage and the National Customary Assembly.",
    keyFeatures: [
      "Royal Graves of the Paramount Chiefs (Samuel Maharero, Hosea Kutako)",
      "Annual Red Flag Day (Otjiserandu) pilgrimage & commemoration grounds",
      "Executive Headquarters of the Ovaherero Traditional Authority",
    ],
    ctaTo: "/paramount-chiefs",
    ctaLabel: "Paramount Chiefs Succession",
    secondaryCtaTo: "/chapters",
    secondaryCtaLabel: "All Chapters Directory",
  },
  {
    id: "omaheke",
    name: "Omaheke Region",
    heroDesc: "Heartland of Cattle Culture & Pastoral Custom",
    badge: "Customary Pastoral Domain",
    description:
      "Omaheke encompasses expansive customary grazing commons where traditional pastoralism, the veneration of cattle wealth (ozongombe), and hereditary village leadership remain central to daily customary governance.",
    keyFeatures: [
      "Epukiro, Aminuis, Otjinene, and Otjombinde traditional councils",
      "Traditional courts administering customary civil and pastoral tenure",
      "High concentration of hereditary village headmen and regional councilors",
    ],
    ctaTo: "/chapters",
    ctaSearch: { region: "Omaheke" },
    ctaLabel: "Explore Omaheke Chapters",
    secondaryCtaTo: "/communities",
    secondaryCtaLabel: "Communities Register",
  },
  {
    id: "otjozondjupa",
    name: "Otjozondjupa Region",
    heroDesc: "Waterberg Heritage & Historic Defense Domain",
    badge: "Historic Resistance & Commons",
    description:
      "Otjozondjupa holds the solemn historical battlegrounds of the 1904 Battle of Ohamakari (Waterberg). Today it hosts prominent traditional authorities across Okakarara, Ovitoto, and Otjiwarongo administering customary land boards.",
    keyFeatures: [
      "Ohamakari Cultural Centre & Genocide Commemoration Memorial",
      "Okakarara Traditional Authority regional administration offices",
      "Ovitoto communal conservancies & customary grazing frameworks",
    ],
    ctaTo: "/chapters",
    ctaSearch: { region: "Otjozondjupa" },
    ctaLabel: "Explore Otjozondjupa Chapters",
    secondaryCtaTo: "/communities",
    secondaryCtaLabel: "Communities Register",
  },
  {
    id: "kunene",
    name: "Kunene & Kaokoveld",
    heroDesc: "Ancestral Cradle of Sacred Fire (Okuruuo)",
    badge: "Ancestral Cradle & Holy Fire",
    description:
      "The rugged Kaokoveld is the ancestral cradle where Otjiherero lineage rites, the holy fire (Okuruuo), and ancient matrilineal and patrilineal descent systems (eanda and otjiwanjo) have been preserved without interruption.",
    keyFeatures: [
      "Unbroken custodianship of ancestral Holy Fires (Okuruuo)",
      "Traditional leadership councils of Opuwo, Sesfontein, and Ruacana",
      "Living customary rites of passage and sacred cattle lineages",
    ],
    ctaTo: "/chapters",
    ctaSearch: { region: "Kunene" },
    ctaLabel: "Explore Kunene Chapters (8)",
    secondaryCtaTo: "/communities",
    secondaryCtaLabel: "Communities Register",
  },
  {
    id: "diaspora",
    name: "Global Diaspora",
    heroDesc: "Trans-boundary Chapters in Botswana, South Africa & Beyond",
    badge: "Trans-Boundary Custodians",
    description:
      "Resulting from the 1904 genocide exodus, hundreds of thousands of Ovaherero live in Botswana (Mahalapye, Tsabong, Sehitwa) and South Africa, maintaining active allegiance to the Paramount Chieftaincy and customary identity.",
    keyFeatures: [
      "Botswana High Liaison Council and customary community chapters",
      "South African Diaspora Forum (Gauteng, North West, Northern Cape)",
      "OGGF international advocacy chapters in Europe and North America",
    ],
    ctaTo: "/chapters",
    ctaSearch: { region: "Diaspora" },
    ctaLabel: "View Diaspora Chapters (5)",
    secondaryCtaTo: "/diaspora",
    secondaryCtaLabel: "Diaspora Portal",
  },
];

function CustomaryRegionsExplorer() {
  const [activeId, setActiveId] = useState("central");
  const activeRegion = CUSTOMARY_REGIONS.find((r) => r.id === activeId) || CUSTOMARY_REGIONS[0];

  return (
    <div className="border border-border bg-card p-7 sm:p-9">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-gold" />
            <p className="eyebrow text-gold">Customary Domains</p>
          </div>
          <h3 className="mt-2 text-2xl font-display sm:text-3xl">Traditional Homeland &amp; Customary Regions</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Explore the traditional jurisdictions, sacred shrines, and regional councils under OTA governance.
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-none border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
          {activeRegion.badge}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {CUSTOMARY_REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => setActiveId(region.id)}
            className={`px-4 py-2 text-[12px] font-medium uppercase tracking-[0.14em] transition-all rounded-none ${
              region.id === activeId
                ? "bg-[hsl(var(--primary))] text-primary-foreground shadow-sm"
                : "border border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <h4 className="font-display text-xl text-foreground sm:text-2xl">{activeRegion.name}</h4>
            <p className="text-[12px] uppercase tracking-wider text-gold font-medium mt-1">
              {activeRegion.heroDesc}
            </p>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-foreground/75">
              {activeRegion.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-none bg-gold px-5 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to={activeRegion.ctaTo} search={activeRegion.ctaSearch}>
                  {activeRegion.ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
              {activeRegion.secondaryCtaTo && (
                <Button asChild variant="outline" className="rounded-none px-5 text-[11.5px] uppercase tracking-[0.14em]">
                  <Link to={activeRegion.secondaryCtaTo}>
                    {activeRegion.secondaryCtaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
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
 * Dynamic Operational Key Metrics Strip.
 * Synchronized with the slideshow so clicking any number immediately transitions to that slide.
 */
function LiveMetricsStrip({ slides, current, goTo }) {
  return (
    <section className="border-b border-border bg-card">
      <div className="shell grid grid-cols-2 divide-x divide-y divide-border sm:divide-y-0 lg:grid-cols-4">
        {slides.map((m, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => goTo(idx)}
              className={`group relative text-left p-5 transition-all hover:bg-secondary/50 sm:p-6 ${
                idx % 2 !== 0 ? "border-t sm:border-t-0" : ""
              } ${isActive ? "bg-gold/10" : "bg-card"}`}
            >
              {/* Active top accent line */}
              <div
                className={`absolute top-0 inset-x-0 h-1 transition-all ${
                  isActive ? "bg-gold" : "bg-transparent group-hover:bg-gold/40"
                }`}
              />

              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-display text-3xl font-semibold leading-none transition-colors sm:text-4xl ${
                      isActive ? "text-gold" : "text-[hsl(var(--primary))]"
                    }`}
                  >
                    {m.number}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      isActive ? "bg-gold animate-ping" : "bg-gold/60"
                    }`}
                  />
                </div>
                {isActive ? (
                  <span className="rounded-none bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                    Active Slide
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view
                  </span>
                )}
              </div>

              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-foreground">
                {m.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {m.sub}
              </p>

              {/* Progress bar on active slide */}
              {isActive ? (
                <div className="mt-3 h-0.5 w-full bg-border overflow-hidden">
                  <div className="h-full bg-gold animate-pulse" />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Dedicated Interactive Milestones & Governance Numbers Showcase.
 * Presents each milestone side-by-side with its authentic photograph,
 * backstory, constitutional facts, and direct action link.
 */
function MilestonesSlideshow({
  slides,
  current,
  goTo,
  isPaused,
  togglePause,
}) {
  const active = slides[current];

  return (
    <section className="border-b border-border bg-card/50 py-12 lg:py-16">
      <div className="shell">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <p className="eyebrow text-gold">Customary Custodianship</p>
            </div>
            <h2 className="mt-2 text-2xl font-display sm:text-3xl">
              Living Governance by the Numbers
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground max-w-2xl">
              Every milestone represents a statutory pillar, sacred covenant, or living institution under the Ovaherero Traditional Authority.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              aria-label={isPaused ? "Resume auto slideshow" : "Pause auto slideshow"}
              className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3 text-gold" /> Resume Auto-Slide
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3 text-gold" /> Pause Auto-Slide
                </>
              )}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goTo(current - 1)}
                aria-label="Previous milestone"
                className="grid h-8 w-8 place-items-center border border-border bg-background transition-colors hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(current + 1)}
                aria-label="Next milestone"
                className="grid h-8 w-8 place-items-center border border-border bg-background transition-colors hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Detail Card */}
        <div className="mt-8 grid gap-8 border border-border bg-background p-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:p-8">
          <div className="relative overflow-hidden border border-border shadow-md">
            <img
              src={active.src}
              alt={active.alt}
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-5 text-white">
              <span className="bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                {active.region}
              </span>
              <h3 className="mt-2 font-display text-lg text-white sm:text-xl">{active.title}</h3>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl font-bold text-gold sm:text-6xl">
                  {active.number}
                </span>
                <div>
                  <h4 className="font-display text-xl text-foreground sm:text-2xl">{active.label}</h4>
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground">{active.sub}</p>
                </div>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/85">
                {active.statStory}
              </p>

              <div className="mt-6 space-y-2.5 border-t border-border pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Customary &amp; Statutory Pillars:
                </p>
                <ul className="space-y-2">
                  {active.facts?.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-foreground/80">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
              <Button asChild className="rounded-none bg-gold px-5 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to={active.ctaTo}>
                  {active.ctaLabel} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>Milestone {current + 1} of {slides.length}</span>
              </div>
            </div>
          </div>
        </div>
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
    const [news, events, allEventsRes, institutions, welcome, configRes] = await Promise.all([
      base44.entities.NewsPost.filter({ status: "published" }, { sort: "-published_date", limit: 3 }),
      base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 3 }),
      base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 20 }),
      base44.entities.Institution.filter({ status: "published" }, { sort: "sort_order", limit: 6 }),
      base44.entities.ContentBlock.filter(
        { page_slug: "paramount-chief", status: "published" },
        { sort: "sort_order", limit: 1 },
      ),
      base44.entities.SiteConfig.list({ sort: "-updated_date", limit: 1 }),
    ]);

    const liveNews = news?.items || [];
    const newsList = liveNews.length > 0 ? liveNews : CURATED_MILESTONE_NEWS.slice(0, 3);

    const liveEvents = events?.items || [];
    const eventsList = liveEvents.length > 0 ? liveEvents : CURATED_CALENDAR_EVENTS.slice(0, 3);

    // Build the merged events list for the hero banner (admin DB events + curated fallback)
    const liveAllEvents = allEventsRes?.items || [];
    const allEventsMap = new Map();
    CURATED_CALENDAR_EVENTS.forEach((e) => allEventsMap.set(e.id, e));
    liveAllEvents.forEach((e) => { if (e?.id) allEventsMap.set(e.id, e); });
    const allEventsList = Array.from(allEventsMap.values()).sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );

    const liveInstitutions = institutions?.items || [];
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
      news: newsList,
      events: eventsList,
      allEvents: allEventsList,
      institutions: institutionsList,
      welcome: welcome?.items?.[0] || null,
      config: configRes?.items?.[0] || null,
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
  const { news, events, allEvents, institutions, welcome, config } = Route.useLoaderData();
  const heroImg = config?.home_hero_image || HERO_IMAGE;
  const detailImg =
    config?.home_detail_image &&
    !config.home_detail_image.includes("ovaherero-women-red-flag") &&
    !config.home_detail_image.includes("mutjinde-katjiua") &&
    !config.home_detail_image.includes("paramount-chief-ceremonial-dress")
      ? config.home_detail_image
      : DETAIL_IMAGE;

  const slides = useMemo(() => buildHeroAndMilestoneSlides(heroImg, config), [heroImg, config]);
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (idx) => {
      const next = (idx + slides.length) % slides.length;
      setCurrent(next);
    },
    [slides.length],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) {
        goTo(current + 1);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const togglePause = () => {
    paused.current = !paused.current;
    setIsPaused(paused.current);
  };

  return (
    <>
      {/* ── OvaHerero 2026 Community Milestones & Reparations Mission Hero Banner ──── */}
      <Milestones2026HeroBanner />

      {/* ── Seamless Transitional Divider Between Banners ── */}
      <div className="bg-[hsl(var(--ink))] py-2.5 border-y border-gold/30">
        <div className="shell flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/85">
          <div className="flex items-center gap-2">
            <Crown className="h-3.5 w-3.5 text-gold" />
            <span>Paramount Chiefs of the Ovaherero · Historical Succession</span>
          </div>
          <Link to="/paramount-chiefs" className="text-white/70 hover:text-white transition-colors">
            1863 – Present Archive &rarr;
          </Link>
        </div>
      </div>

      {/* ── Paramount Chiefs of the Ovaherero Dynamic Hero Banner (Underneath) ─────────── */}
      <ParamountChiefsHeroBanner />

      {/* ── Visual Separation between Hero Banner and Quick Links ─────────── */}
      <div className="py-6 sm:py-8 lg:py-10 bg-background flex items-center justify-center">
        <div className="shell flex items-center justify-between gap-4 w-full">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/75">
            Customary Governance &amp; Administration
          </span>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
        </div>
      </div>

      <section className="border-y border-border bg-card shadow-sm">
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

      {/* ── Dynamic Operational Key Metrics Strip (Synchronized with slideshow) ── */}
      <LiveMetricsStrip slides={slides} current={current} goTo={goTo} />

      {/* ── Interactive Governance Milestones & Numbers Showcase ──────────────── */}
      <MilestonesSlideshow
        slides={slides}
        current={current}
        goTo={goTo}
        isPaused={isPaused}
        togglePause={togglePause}
      />

      {/* ── Paramount Chief Message Section ──────────────────────────────────── */}
      <section className="shell grid gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
        <div className="relative">
          <Image
            src={detailImg}
            alt="Paramount Chief in ceremonial uniform greeting community members"
            className="aspect-[4/5] w-full object-cover object-top"
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

      {/* ── Organs of the Authority Section ─────────────────────────────────── */}
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
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-foreground/70">
            Established under the Constitution of the Ovaherero Traditional Authority to administer customary law,
            manage traditional affairs and represent the community.
          </p>

          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <Link
                key={inst.id}
                to={`/institutions/${inst.slug}`}
                className="group bg-card p-7 transition-colors hover:bg-background"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl leading-snug group-hover:text-[hsl(var(--primary))]">
                    {inst.name}
                  </h3>
                  {inst.is_demo ? <IllustrativeBadge /> : null}
                </div>
                {inst.native_name ? (
                  <p className="mt-1 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    {inst.native_name}
                  </p>
                ) : null}
                <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-foreground/65">
                  {inst.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                  Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Traditional Territories & Customary Regions Navigator ─ */}
      <section className="shell py-16 lg:py-20">
        <CustomaryRegionsExplorer />
      </section>

      {/* ── Communiqués & News Section ───────────────────────────────────────── */}
      <section className="shell py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Announcements &amp; news</p>
            <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">From the Authority</h2>
          </div>
          <Link
            to="/news"
            className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
          >
            All communiqués
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {news.length === 0 ? (
          <EmptyNote>No public announcements published yet.</EmptyNote>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="flex flex-col justify-between border border-border bg-card p-6">
                <div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{fmtDate(item.published_date)}</span>
                    <span className="text-gold">{item.category || "Official"}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl leading-snug">
                    <Link to={`/news/${item.slug || item.id}`} className="hover:text-[hsl(var(--primary))]">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-foreground/70">
                    {item.summary || item.body}
                  </p>
                </div>
                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    to={`/news/${item.slug || item.id}`}
                    className="group inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
                  >
                    Read communiqué
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Events & Customary Convocations Hero Banner (70% down the site) ───── */}
      <EventsFeaturedHeroBanner events={events} allEvents={allEvents} config={config} />

      {/* ── Upcoming Ceremonies & Assembly Events Section ─────────────────────── */}
      <section className="border-t border-border bg-secondary/40 py-20 lg:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Tradition in practice</p>
              <h2 className="mt-3 text-[2rem] leading-tight sm:text-[2.5rem]">Ceremonies &amp; meetings</h2>
            </div>
            <Link
              to="/events"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Full calendar
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {events.length === 0 ? (
            <EmptyNote>No upcoming ceremonies or meetings scheduled.</EmptyNote>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {events.map((evt) => {
                const dm = dayMonth(evt.starts_at);
                return (
                  <div key={evt.id} className="flex gap-5 border border-border bg-card p-6">
                    <div className="flex flex-col items-center justify-center border border-gold/40 bg-gold/10 px-3.5 py-2 text-center">
                      <span className="font-display text-2xl font-bold leading-none text-[hsl(var(--primary))]">
                        {dm?.day || "—"}
                      </span>
                      <span className="mt-1 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                        {dm?.month || ""}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                          Official Gathering
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg leading-snug">
                        <Link to="/events" className="hover:text-[hsl(var(--primary))]">
                          {evt.title}
                        </Link>
                      </h3>
                      {(evt.location || evt.town || evt.venue) ? (
                        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 text-gold" />
                          {evt.location || [evt.venue, evt.town].filter(Boolean).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Homeland Landscape Showcase Cards ─────────────────────────────────── */}
      <section className="border-t border-border bg-background py-16 lg:py-20">
        <div className="shell">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-gold">Sacred Homeland</p>
              <h2 className="mt-2 text-2xl font-display sm:text-3xl">The Land of the Ovaherero</h2>
              <p className="mt-1 text-[13px] text-muted-foreground max-w-xl">
                Ancient granite peaks, red dunes, and the vast savanna — the territories held in custodianship by our people.
              </p>
            </div>
            <Link
              to="/culture"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Custom &amp; Heritage
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {buildHeritageCards(config).map((card, i) => (
              <div key={i} className="group overflow-hidden border border-border bg-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white backdrop-blur-sm">
                    {card.region}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base text-foreground">{card.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call-to-Action Section ────────────────────────────────────── */}
      <section className="bg-[hsl(var(--primary))] text-primary-foreground">
        <div className="shell flex flex-col items-start justify-between gap-8 py-16 sm:py-20 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow text-primary-foreground/75 tracking-[0.2em]">Custodian of the Sacred Fire</p>
            <h2 className="mt-3 text-[1.9rem] leading-tight sm:text-[2.4rem]">
              Preserving custom. Serving our people.
            </h2>
            <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-primary-foreground/80">
              Apply for membership, access official records, verify customary appointments or register for upcoming
              traditional assemblies.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-none bg-gold px-6 text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
              <Link to="/membership">Apply for Membership</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-primary-foreground/40 bg-primary-foreground/10 px-6 text-[12px] uppercase tracking-[0.14em] text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <Link to="/contact">Contact Head Office</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
