import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { registerForEvent } from "@/lib/ota-fns";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dayMonth, fmtDateTime } from "@/lib/format";
import { toast } from "sonner";
import { CURATED_CALENDAR_EVENTS } from "@/lib/curated-events";

export const Route = createFileRoute("/_site/events")({
  validateSearch: (search) => ({
    category: typeof search?.category === "string" ? search.category : "all",
    event: typeof search?.event === "string" ? search.event : undefined,
  }),
  staleTime: 60_000,
  gcTime: 300_000,
  head: () => ({
    meta: [
      { title: "Events & Calendar · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Official calendar of Annual Community Meeting at Toasis, HereroFest, Herero Day, Herero Genocide Day, Chief's Council meeting, Community outreach, Cultural Day in Botswana, and Heritage Day in South Africa. Register to attend official convocations.",
      },
    ],
  }),
  loader: async () => {
    try {
      // Race timeout prevents sluggishness and ensures instant navigation
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ items: [] }), 1200));
      const fetchPromise = base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 60 }).catch(() => ({ items: [] }));
      const page = await Promise.race([fetchPromise, timeoutPromise]);
      return { events: page?.items || [] };
    } catch {
      return { events: [] };
    }
  },
  component: EventsPage,
});

const EVENT_CATEGORIES = [
  { slug: "all", label: "All Events (8)" },
  { slug: "commemorations", label: "Commemorations" },
  { slug: "meetings", label: "Assemblies & Council Meetings" },
  { slug: "hero-fest", label: "HereroFest" },
  { slug: "outreach", label: "Community Outreach" },
  { slug: "diaspora", label: "Diaspora Days" },
];

const COMMUNITY_REGIONS = [
  "Okahandja (National Seat)",
  "Aminuis Constituency",
  "Otjinene Constituency",
  "Okakarara Constituency",
  "Windhoek / Khomas Region",
  "Opuwo / Kunene Region",
  "Omaruru / Erongo Region",
  "Omaheke Region",
  "Otjozondjupa Region",
  "Botswana Diaspora Chapter",
  "South Africa Diaspora Chapter",
  "Global Diaspora / International",
  "Other Community / Constituency",
];

/** Ceremonial celebratory confetti burst on successful attendance registration */
function triggerRsvpCelebration() {
  if (typeof window === "undefined") return;
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C9A84C", "#8A1C2E", "#D4AF37", "#FFFFFF"],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore in non-browser or reduced-motion environments
  }
}

function EventsPage() {
  const { events = [] } = Route.useLoaderData() || {};
  const search = Route.useSearch();
  const [activeCategory, setActiveCategory] = useState(search?.category || "all");
  const [selected, setSelected] = useState(null);

  // Combine database events with curated calendar events, deduplicating by id/slug
  const displayEvents = useMemo(() => {
    const map = new Map();
    CURATED_CALENDAR_EVENTS.forEach((item) => map.set(item.id, item));
    events.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return displayEvents;
    return displayEvents.filter((e) => {
      const cat = (e.category || "").toLowerCase();
      const title = (e.title || "").toLowerCase();

      if (activeCategory === "commemorations") {
        return (
          cat === "commemorations" ||
          title.includes("herero day") ||
          title.includes("genocide day") ||
          title.includes("commemoration")
        );
      }
      if (activeCategory === "meetings") {
        return (
          cat === "meetings" ||
          title.includes("toasis") ||
          title.includes("chief") ||
          title.includes("council") ||
          title.includes("meeting") ||
          title.includes("assembly")
        );
      }
      if (activeCategory === "hero-fest") {
        return cat === "hero-fest" || title.includes("hererofest") || title.includes("fest");
      }
      if (activeCategory === "outreach") {
        return cat === "outreach" || title.includes("outreach") || title.includes("community programme");
      }
      if (activeCategory === "diaspora") {
        return (
          cat === "diaspora" ||
          title.includes("botswana") ||
          title.includes("south africa") ||
          title.includes("diaspora")
        );
      }
      return true;
    });
  }, [displayEvents, activeCategory]);

  // Form State for standalone on-page RSVP
  const [formEventId, setFormEventId] = useState(search?.event || displayEvents[0]?.id || "");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAttendees, setFormAttendees] = useState("1");
  const [formCommunity, setFormCommunity] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  useEffect(() => {
    if (search?.event) {
      setFormEventId(search.event);
    }
  }, [search?.event]);

  // Modal dialog form state
  const [modalForm, setModalForm] = useState({
    name: "",
    email: "",
    phone: "",
    attendees: "1",
    community: "",
    organisation: "",
    notes: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalConfirmed, setModalConfirmed] = useState(null);

  const selectedEventObj = useMemo(() => {
    return displayEvents.find((e) => e.id === formEventId) || displayEvents[0] || null;
  }, [displayEvents, formEventId]);

  const handleStandaloneSubmit = async (e) => {
    e?.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      toast.error("Please provide your name, email address, and telephone number.");
      return;
    }
    const targetEvent = selectedEventObj;
    const attendeesNum = parseInt(formAttendees, 10) || 1;

    setSubmitting(true);
    try {
      const res = await registerForEvent({
        data: {
          event_id: targetEvent?.id || "general-event",
          event_title: targetEvent?.title || "OTA Assembly",
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          attendee_count: attendeesNum,
          community_or_region: formCommunity.trim() || undefined,
          organisation: formOrg.trim() || undefined,
          notes: formNotes.trim() || undefined,
        },
      });

      setConfirmedData({
        id: res.id,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        attendees: attendeesNum,
        eventTitle: targetEvent?.title,
        dateDisplay: targetEvent?.date_display || targetEvent?.starts_at,
        venue: [targetEvent?.venue, targetEvent?.town].filter(Boolean).join(", "),
        community: formCommunity.trim(),
      });
      triggerRsvpCelebration();
      toast.success(`Attendance confirmed for ${attendeesNum} person(s)!`);
    } catch {
      toast.error("The attendance registration could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalSubmit = async (e) => {
    e?.preventDefault();
    if (!modalForm.name.trim() || !modalForm.email.trim() || !modalForm.phone.trim()) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }
    const attendeesNum = parseInt(modalForm.attendees, 10) || 1;

    setModalSubmitting(true);
    try {
      const res = await registerForEvent({
        data: {
          event_id: selected.id,
          event_title: selected.title,
          name: modalForm.name.trim(),
          email: modalForm.email.trim(),
          phone: modalForm.phone.trim(),
          attendee_count: attendeesNum,
          community_or_region: modalForm.community.trim() || undefined,
          organisation: modalForm.organisation.trim() || undefined,
          notes: modalForm.notes.trim() || undefined,
        },
      });

      setModalConfirmed({
        id: res.id,
        name: modalForm.name.trim(),
        attendees: attendeesNum,
        eventTitle: selected.title,
      });
      triggerRsvpCelebration();
      toast.success(`Attendance confirmed for ${attendeesNum} person(s)!`);
    } catch {
      toast.error("The registration could not be submitted. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Events & Official Customary Calendar"
        title="Customary convocations, commemorations & assemblies."
        intro="The official calendar of the 8 foundational OTA convocations. Traditional communities, registered members, and the general public are invited to register attendance in advance to assist with customary seating and protocol."
        image="/images/heritage/ovaherero-women-red-flag.jpg"
        imageKey="events_hero_image"
        imageAlt="Ovaherero Traditional Authority Ceremonial Convocations"
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            className="rounded-none bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--ink))] shadow-md hover:bg-gold/90 transition-transform active:scale-95"
          >
            <a href="#attendee-registration">
              <Users className="mr-2 h-4 w-4" /> RSVP to Attend an Event
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-white/40 bg-white/10 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/20"
          >
            <a href="#calendar-schedule">
              <CalendarDays className="mr-2 h-4 w-4" /> View Calendar Items
            </a>
          </Button>
        </div>
      </PageHero>

      {/* ── Official Calendar Schedule ────────────────────────────────────── */}
      <Section id="calendar-schedule">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Convocations &amp; Gatherings
            </span>
            <h2 className="font-display text-2xl sm:text-3xl">Upcoming Official Calendar</h2>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {displayEvents.length} Verified Calendar Convocations
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-border pb-5">
          {EVENT_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-gold text-[hsl(var(--ink))] shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyNote>No scheduled event in this category currently. Please select another category or check back soon.</EmptyNote>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {filteredEvents.map((event) => {
              const date = dayMonth(event.starts_at);
              return (
                <li key={event.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-7">
                  <div className="w-16 shrink-0 border-r border-border pr-4 text-center">
                    <p className="font-display text-3xl leading-none text-[hsl(var(--primary))]">{date.day}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{date.month}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-[1.4rem] leading-snug">{event.title}</h2>
                      {event.is_demo ? <IllustrativeBadge /> : null}
                    </div>
                    <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      {event.date_display ? `${event.date_display} · ` : `${fmtDateTime(event.starts_at)} · `}
                      {[event.venue, event.town].filter(Boolean).join(", ") || "Venue to be confirmed"}
                    </p>
                    {event.description ? (
                      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-foreground/70">{event.description}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-foreground/60">
                        {event.audience}
                      </span>
                      {event.organising_structure ? (
                        <span className="text-[11.5px] text-muted-foreground">{event.organising_structure}</span>
                      ) : null}
                    </div>
                  </div>
                  {event.registration_open && event.audience.toLowerCase().includes("open") ? (
                    <Button
                      variant="outline"
                      className="shrink-0 rounded-none border-foreground/30 bg-card hover:bg-gold/15 hover:border-gold hover:text-foreground text-[11px] uppercase tracking-[0.14em] font-semibold"
                      onClick={() => {
                        setSelected(event);
                        setModalConfirmed(null);
                        setModalForm({
                          name: "",
                          email: "",
                          phone: "",
                          attendees: "1",
                          community: "",
                          organisation: "",
                          notes: "",
                        });
                      }}
                    >
                      <Users className="mr-1.5 h-3.5 w-3.5 text-gold" /> Register to attend
                    </Button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 border border-border px-3 py-1.5 bg-muted/30">
                      Official Delegates
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ── Dedicated Public Attendee Registration (RSVP) Form Section ────────── */}
      <section id="attendee-registration" className="border-t-2 border-gold/40 bg-secondary/35 py-16 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 border border-gold/50 bg-gold/15 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold mb-3">
                <Users className="h-3.5 w-3.5" /> Public Attendance Registration
              </span>
              <h2 className="font-display text-3xl sm:text-4xl leading-tight">
                RSVP to Attend an Official Gathering
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                Register your personal attendance or community delegation in advance. Submitting your details helps
                the OTA organizing committees ensure appropriate seating, regiment protocols, and catering arrangements.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              {/* Left Column: The Registration Form or Confirmation Receipt */}
              <div className="border border-border bg-card p-6 sm:p-8 shadow-sm">
                <AnimatePresence mode="wait">
                  {confirmedData ? (
                    <motion.div
                      key="confirmed"
                      initial={{ opacity: 0, scale: 0.95, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-6 py-2"
                    >
                      <div className="flex items-center gap-3 border-b border-border pb-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl font-bold text-foreground">Attendance Confirmed</h3>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Registration Reference: <span className="font-mono text-gold font-semibold">{confirmedData.id}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded border border-border/80 bg-secondary/40 p-5 text-sm">
                        <div className="flex justify-between border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">Event:</span>
                          <span className="font-display font-medium text-right text-foreground">{confirmedData.eventTitle}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">{confirmedData.dateDisplay}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">Venue:</span>
                          <span className="font-medium text-foreground">{confirmedData.venue}</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">Headcount Going:</span>
                          <span className="font-bold text-gold">
                            {confirmedData.attendees} {confirmedData.attendees === 1 ? "Person" : "People"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-2">
                          <span className="text-muted-foreground">Lead Attendee:</span>
                          <span className="font-medium text-foreground">{confirmedData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span className="text-foreground">{confirmedData.phone} · {confirmedData.email}</span>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        An official confirmation has been logged with the OTA Event Secretariat. Please present your name or confirmation reference upon arrival at the venue gate for accreditation.
                      </p>

                      <Button
                        className="w-full rounded-none bg-[hsl(var(--primary))] uppercase tracking-wider"
                        onClick={() => {
                          setConfirmedData(null);
                          setFormName("");
                          setFormEmail("");
                          setFormPhone("");
                          setFormAttendees("1");
                          setFormCommunity("");
                          setFormOrg("");
                          setFormNotes("");
                        }}
                      >
                        Register Another Attendee or Delegation
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleStandaloneSubmit}
                      className="space-y-5"
                    >
                    {/* Event Selector */}
                    <div className="space-y-1.5">
                      <Label htmlFor="event-select" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Select Convocations or Event <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formEventId} onValueChange={(val) => setFormEventId(val)}>
                        <SelectTrigger id="event-select" className="rounded-none bg-background text-sm">
                          <SelectValue placeholder="Choose an event to attend" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none max-h-60">
                          {displayEvents.map((evt) => (
                            <SelectItem key={evt.id} value={evt.id} className="text-xs">
                              {evt.title} ({evt.date_display || dayMonth(evt.starts_at).month})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedEventObj ? (
                        <p className="text-[11px] text-muted-foreground">
                          {selectedEventObj.date_display} · {[selectedEventObj.venue, selectedEventObj.town].filter(Boolean).join(", ")}
                        </p>
                      ) : null}
                    </div>

                    {/* Name & Email */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="form-name" className="text-xs font-semibold uppercase tracking-wider">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="form-name"
                          placeholder="e.g. Uatjiri Katjiuanjo"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="rounded-none text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="form-email" className="text-xs font-semibold uppercase tracking-wider">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="form-email"
                          type="email"
                          placeholder="name@domain.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="rounded-none text-xs"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone & Number of People Attending */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="form-phone" className="text-xs font-semibold uppercase tracking-wider">
                          Telephone / WhatsApp <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="form-phone"
                          type="tel"
                          placeholder="+264 81 234 5678"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="rounded-none text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="form-attendees" className="text-xs font-semibold uppercase tracking-wider">
                          How many people are going? <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formAttendees} onValueChange={(val) => setFormAttendees(val)}>
                          <SelectTrigger id="form-attendees" className="rounded-none bg-background text-xs">
                            <SelectValue placeholder="Select headcount" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="1">1 Person (Solo Attendee)</SelectItem>
                            <SelectItem value="2">2 People (Pair / Couple)</SelectItem>
                            <SelectItem value="3">3 People (Family / Small Delegation)</SelectItem>
                            <SelectItem value="4">4 People (Family Delegation)</SelectItem>
                            <SelectItem value="5">5 People (Community Delegation)</SelectItem>
                            <SelectItem value="10">10 People (Full Delegation)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Community Region & Organisation */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="form-community" className="text-xs font-semibold uppercase tracking-wider">
                          Traditional Community or Region
                        </Label>
                        <Select value={formCommunity} onValueChange={(val) => setFormCommunity(val)}>
                          <SelectTrigger id="form-community" className="rounded-none bg-background text-xs">
                            <SelectValue placeholder="Select your region or chapter" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none max-h-52">
                            {COMMUNITY_REGIONS.map((reg) => (
                              <SelectItem key={reg} value={reg} className="text-xs">
                                {reg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="form-org" className="text-xs font-semibold uppercase tracking-wider">
                          Organisation / Clan / Regiment (Optional)
                        </Label>
                        <Input
                          id="form-org"
                          placeholder="e.g. Otjiserandu Regiment, OWA, OYAC, Clan"
                          value={formOrg}
                          onChange={(e) => setFormOrg(e.target.value)}
                          className="rounded-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Special Notes / Requirements */}
                    <div className="space-y-1.5">
                      <Label htmlFor="form-notes" className="text-xs font-semibold uppercase tracking-wider">
                        Special Notes or Dietary / Elder Assistance
                      </Label>
                      <Textarea
                        id="form-notes"
                        placeholder="Please note any elder mobility assistance, transport inquiries, or delegation requirements."
                        rows={3}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="rounded-none text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-none bg-gold py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--ink))] hover:bg-gold/90 transition-transform active:scale-[0.99]"
                    >
                      {submitting ? "Submitting Registration…" : "Confirm Event Attendance"}
                    </Button>
                  </motion.form>
                )}
                </AnimatePresence>
              </div>

              {/* Right Column: Attendance Guidelines & Information Card */}
              <div className="space-y-6">
                <div className="border border-border bg-card p-6">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <ShieldCheck className="h-4 w-4 text-gold" />
                    <h3 className="font-display text-lg">Customary Protocol &amp; Guidelines</h3>
                  </div>
                  <ul className="mt-4 space-y-3.5 text-xs text-foreground/80 leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="font-bold text-gold shrink-0">01.</span>
                      <span>
                        <strong>Dress Code &amp; Regalia:</strong> Attendees are encouraged to wear customary attire (Otjiserandu Red Flag uniforms, pastoral dresses with <em>Otjikaiva</em>, or formal attire).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-bold text-gold shrink-0">02.</span>
                      <span>
                        <strong>Sacred Holy Fire:</strong> Convocations observing the sacred fire (<em>Okuruuo</em>) require solemn reverence and adherence to customary instructions from clan elders.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-bold text-gold shrink-0">03.</span>
                      <span>
                        <strong>Delegation Arrival:</strong> Community delegations and regiments should arrive 45 minutes prior to commencement for ceremonial muster and inspection.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="font-bold text-gold shrink-0">04.</span>
                      <span>
                        <strong>Admin Visibility:</strong> Your RSVP registers directly with the OTA Administration so chiefs and councillors know exact numbers and community origins in advance.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gold/40 bg-gold/10 p-5">
                  <div className="flex items-center gap-2 text-gold">
                    <Sparkles className="h-4 w-4" />
                    <h4 className="font-display text-sm font-semibold">Need Assistance?</h4>
                  </div>
                  <p className="mt-1.5 text-xs text-foreground/75 leading-relaxed">
                    For special delegation seating, traditional choir performances, or transport coordination, please reach out to the OTA Protocol Office via <a href="/contact" className="underline text-gold hover:text-foreground">the contact directory</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal Dialog for Quick Register from Card ────────────────────────── */}
      {selected ? (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-lg rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selected.title}</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                {selected.date_display || fmtDateTime(selected.starts_at)} · {[selected.venue, selected.town].filter(Boolean).join(", ")}
              </DialogDescription>
            </DialogHeader>

            {modalConfirmed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 py-2"
              >
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">Registration Recorded</p>
                    <p className="text-xs text-muted-foreground">
                      {modalConfirmed.attendees} attendee(s) registered under {modalConfirmed.name}.
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  Your attendance has been confirmed on the administrative attendance roster. The organizing office will verify seating and notify you of any schedule changes.
                </p>
                <Button className="w-full rounded-none bg-[hsl(var(--primary))]" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3.5 pt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider font-semibold">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={modalForm.name}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                      placeholder="e.g. Uatjiri Katjiuanjo"
                      className="rounded-none text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider font-semibold">
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={modalForm.email}
                      onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="rounded-none text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider font-semibold">
                      Telephone / WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="tel"
                      value={modalForm.phone}
                      onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                      placeholder="+264 81 234 5678"
                      className="rounded-none text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider font-semibold">
                      Number of People Going <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={modalForm.attendees}
                      onValueChange={(val) => setModalForm({ ...modalForm, attendees: val })}
                    >
                      <SelectTrigger className="rounded-none bg-background text-xs">
                        <SelectValue placeholder="Headcount" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="1">1 Person</SelectItem>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="3">3 People</SelectItem>
                        <SelectItem value="4">4 People</SelectItem>
                        <SelectItem value="5">5 People (Delegation)</SelectItem>
                        <SelectItem value="10">10 People (Full Delegation)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider">Traditional Community / Region</Label>
                    <Select
                      value={modalForm.community}
                      onValueChange={(val) => setModalForm({ ...modalForm, community: val })}
                    >
                      <SelectTrigger className="rounded-none bg-background text-xs">
                        <SelectValue placeholder="Select community" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none max-h-48">
                        {COMMUNITY_REGIONS.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] uppercase tracking-wider">Organisation / Clan</Label>
                    <Input
                      value={modalForm.organisation}
                      onChange={(e) => setModalForm({ ...modalForm, organisation: e.target.value })}
                      placeholder="e.g. Otjiserandu, Clan"
                      className="rounded-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider">Special Notes / Requirements</Label>
                  <Textarea
                    value={modalForm.notes}
                    onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                    placeholder="Elder assistance, transport, or questions"
                    rows={2}
                    className="rounded-none text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-4 w-full rounded-none bg-[hsl(var(--primary))] uppercase tracking-wider text-xs"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? "Submitting Registration…" : "Confirm Registration"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
