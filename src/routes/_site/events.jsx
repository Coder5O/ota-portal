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
          "Official calendar of conferences, Chiefs Council meetings, Hero Fest, sacred commemorations, and community outreach programmes.",
      },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 60 });
    return { events: page.items || [] };
  },
  component: EventsPage,
});

const EVENT_CATEGORIES = [
  { slug: "all", label: "All Events" },
  { slug: "conferences", label: "Conferences & Seminars" },
  { slug: "meetings", label: "Chiefs Council Meetings" },
  { slug: "hero-fest", label: "Hero Fest" },
  { slug: "commemorations", label: "Commemorations" },
  { slug: "outreach", label: "Community Outreach Programmes" },
];

const CURATED_EVENTS = [
  {
    id: "cur-1",
    title: "103rd Annual Okahandja Heroes Day & Sacred Commemoration (Red Flag Day)",
    category: "commemorations",
    category_label: "Commemorations",
    starts_at: "2026-08-21T08:00:00Z",
    ends_at: "2026-08-23T17:00:00Z",
    venue: "Sacred Shrine & Commemoration Grounds",
    town: "Okahandja, Namibia",
    description:
      "The paramount national pilgrimage commemorating the historic reburial of Ombara Samuel Maharero on 23 August 1923 and honoring all departed Paramount Chiefs and fallen heroes of 1904–1908.",
    audience: "Open to the public",
    organising_structure: "Otjiserandu Red Flag Command & Kutako Heritage Council",
    registration_open: true,
  },
  {
    id: "cur-2",
    title: "National Chiefs Council Ordinary Assembly & Constitutional Convocation",
    category: "meetings",
    category_label: "Chiefs Council Meetings",
    starts_at: "2026-09-12T09:00:00Z",
    ends_at: "2026-09-14T16:00:00Z",
    venue: "OTA Council Chambers",
    town: "Okahandja, Namibia",
    description:
      "Statutory convocation of recognized traditional leaders, regional senior headmen, and council delegates to deliberate on land stewardship, traditional court resolutions, and customary succession.",
    audience: "Chiefs Council Members & Delegates",
    organising_structure: "Office of the Paramount Chief & Chiefs Council Secretariat",
    registration_open: false,
  },
  {
    id: "cur-3",
    title: "International Conference on Restorative Justice, Reparations & Genocide Law",
    category: "conferences",
    category_label: "Conferences & Seminars",
    starts_at: "2026-10-02T08:30:00Z",
    ends_at: "2026-10-04T17:30:00Z",
    venue: "Windhoek International Conference Centre",
    town: "Windhoek, Namibia",
    description:
      "Convening international legal experts, historians, genocide scholars, and diaspora delegates to formulate global litigation strategies and parliamentary advocacy for German state reparations.",
    audience: "Open to the public",
    organising_structure: "Ovaherero Global Genocide Foundation (OGGF)",
    registration_open: true,
  },
  {
    id: "cur-4",
    title: "Ovaherero Youth Cultural Festival & Hero Fest (Ozongombe zOmbazu)",
    category: "hero-fest",
    category_label: "Hero Fest",
    starts_at: "2026-11-06T10:00:00Z",
    ends_at: "2026-11-08T18:00:00Z",
    venue: "Otjinene Cultural Showgrounds",
    town: "Otjinene, Omaheke",
    description:
      "Youth cultural celebration featuring traditional cattle praise poetry (omitandu), customary dance (omuryangate), martial arts exhibitions, and youth leadership symposiums.",
    audience: "Open to the public",
    organising_structure: "OYAC (Ovaherero Youth Council) & OWA",
    registration_open: true,
  },
  {
    id: "cur-5",
    title: "Diaspora Traditional Outreach & Customary Rights Seminar",
    category: "outreach",
    category_label: "Community Outreach Programmes",
    starts_at: "2026-12-04T09:00:00Z",
    ends_at: "2026-12-06T15:00:00Z",
    venue: "Mahalapye Community Centre",
    town: "Mahalapye, Botswana",
    description:
      "High-level OTA delegation outreach to traditional communities across Botswana, issuing customary identification cards, recording clan lineages, and integrating local chapters.",
    audience: "Open to the public",
    organising_structure: "OTA Directorate of Diaspora & Community Affairs",
    registration_open: true,
  },
  {
    id: "cur-6",
    title: "Ozombaze zOmahiri Commemoration & Sacred Gathering",
    category: "commemorations",
    category_label: "Commemorations",
    starts_at: "2026-07-18T08:30:00Z",
    ends_at: "2026-07-19T16:00:00Z",
    venue: "Ozombuzovindimba Historic Monument",
    town: "Otjozondjupa, Namibia",
    description:
      "Solemn memorial gathering commemorating the sacred sites and historic resistance leadership, reaffirming the ancestral holy fire.",
    audience: "Open to the public",
    organising_structure: "Cultural Council & Traditional Senate",
    registration_open: true,
  },
];

function EventsPage() {
  const { events = [] } = Route.useLoaderData() || {};
  const search = Route.useSearch();
  const [activeCategory, setActiveCategory] = useState(search?.category || "all");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organisation: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const displayEvents = useMemo(() => {
    const list = events.length > 0 ? events : CURATED_EVENTS;
    if (activeCategory === "all") return list;
    return list.filter((e) => {
      const cat = (e.category || "").toLowerCase();
      const title = (e.title || "").toLowerCase();
      const org = (e.organising_structure || "").toLowerCase();

      if (activeCategory === "conferences") {
        return cat.includes("conference") || title.includes("conference") || title.includes("seminar");
      }
      if (activeCategory === "meetings") {
        return cat.includes("meeting") || title.includes("chiefs council") || title.includes("assembly");
      }
      if (activeCategory === "hero-fest") {
        return cat.includes("hero-fest") || title.includes("fest") || title.includes("hero fest") || title.includes("festival");
      }
      if (activeCategory === "commemorations") {
        return cat.includes("commemoration") || title.includes("commemoration") || title.includes("heroes day");
      }
      if (activeCategory === "outreach") {
        return cat.includes("outreach") || title.includes("outreach") || title.includes("community programme");
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
        eyebrow="Events & Official Calendar"
        title="Assemblies, commemorations & public convocations."
        intro="The comprehensive official calendar of Conferences & Seminars, Chiefs Council Meetings, Hero Fest, Sacred Commemorations, and Community Outreach Programmes."
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
                      {fmtDateTime(event.starts_at)} · {[event.venue, event.town].filter(Boolean).join(", ") || "Venue to be confirmed"}
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
