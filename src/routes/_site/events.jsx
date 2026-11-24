import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { registerForEvent } from "@/lib/ota-fns";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dayMonth, fmtDateTime } from "@/lib/format";
import { toast } from "sonner";
import { CURATED_CALENDAR_EVENTS } from "@/lib/curated-events";

export const Route = createFileRoute("/_site/events")({
  validateSearch: (search) => ({
    category: typeof search?.category === "string" ? search.category : "all",
  }),
  head: () => ({
    meta: [
      { title: "Events & Calendar · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Official calendar of Annual Community Meeting at Toasis, HereroFest, Herero Day, Herero Genocide Day, Chief's Council meeting, Community outreach, Cultural Day in Botswana, and Heritage Day in South Africa.",
      },
    ],
  }),
  loader: async () => {
    try {
      const page = await base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 60 });
      return { events: page.items || [] };
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

function EventsPage() {
  const { events = [] } = Route.useLoaderData() || {};
  const search = Route.useSearch();
  const [activeCategory, setActiveCategory] = useState(search?.category || "all");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organisation: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Combine database events with curated calendar events, deduplicating by id/slug
  const displayEvents = useMemo(() => {
    const map = new Map();
    CURATED_CALENDAR_EVENTS.forEach((item) => map.set(item.id, item));
    events.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    const list = Array.from(map.values()).sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );

    if (activeCategory === "all") return list;
    return list.filter((e) => {
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
  }, [events, activeCategory]);

  const register = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please give your name and email address.");
      return;
    }
    setSubmitting(true);
    try {
      await registerForEvent({
        data: {
          event_id: selected.id,
          event_title: selected.title,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          organisation: form.organisation.trim(),
        },
      });
      setDone(true);
    } catch {
      toast.error("The registration could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Events & Official Customary Calendar"
        title="Customary convocations, commemorations & assemblies."
        intro="The official calendar of the 8 foundational OTA convocations: Annual Community Meeting at Toasis, HereroFest, Herero Day, Herero Genocide Day, Chief's Council meeting, Community outreach, Cultural Day in Botswana, and Heritage Day in South Africa."
        image="/images/heritage/ovaherero-women-red-flag.jpg"
        imageKey="events_hero_image"
        imageAlt="Ovaherero Traditional Authority Ceremonial Convocations"
      />

      <Section>
        {/* Category Filter Tabs matching Handwritten Architecture */}
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

        {displayEvents.length === 0 ? (
          <EmptyNote>No scheduled event in this category currently. Please select another category or check back soon.</EmptyNote>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {displayEvents.map((event) => {
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
                      {event.date_display ? `${event.date_display} · ` : `${fmtDateTime(event.starts_at)} · `}{[event.venue, event.town].filter(Boolean).join(", ") || "Venue to be confirmed"}
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
                  {event.registration_open && event.audience === "Open to the public" ? (
                    <Button
                      variant="outline"
                      className="shrink-0 rounded-none border-foreground/25 text-[11px] uppercase tracking-[0.14em]"
                      onClick={() => {
                        setSelected(event);
                        setDone(false);
                        setForm({ name: "", email: "", phone: "", organisation: "" });
                      }}
                    >
                      Register to attend
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {selected ? (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-md rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{selected.title}</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                {fmtDateTime(selected.starts_at)} · {[selected.venue, selected.town].filter(Boolean).join(", ")}
              </DialogDescription>
            </DialogHeader>
            {done ? (
              <div className="space-y-3 py-2">
                <p className="text-[13.5px] leading-relaxed text-foreground/80">
                  Your attendance registration has been recorded. The organising office will contact you if further
                  details are required.
                </p>
                <Button className="w-full rounded-none bg-[hsl(var(--primary))]" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: "name", label: "Full name", required: true },
                  { key: "email", label: "Email address", required: true },
                  { key: "phone", label: "Telephone" },
                  { key: "organisation", label: "Community or organisation" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-[12px] uppercase tracking-wider">{field.label}</Label>
                    <Input
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="rounded-none text-xs"
                      required={field.required}
                    />
                  </div>
                ))}
                <Button
                  className="mt-4 w-full rounded-none bg-[hsl(var(--primary))] uppercase tracking-wider"
                  disabled={submitting}
                  onClick={register}
                >
                  {submitting ? "Submitting..." : "Confirm Registration"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
