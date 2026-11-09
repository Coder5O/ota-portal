import { useState } from "react";
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
  head: () => ({
    meta: [
      { title: "Events & Calendar · Ovaherero Traditional Authority" },
      { name: "description", content: "Ceremonies, commemorations, public meetings and community events of the Ovaherero Traditional Authority." },
    ],
  }),
  loader: async () => {
    const page = await base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 60 });
    return { events: page.items || [] };
  },
  component: EventsPage,
});

function EventsPage() {
  const { events = [] } = Route.useLoaderData() || {};
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organisation: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
    } catch (error) {
      toast.error("The registration could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Calendar"
        title="Events, ceremonies and public meetings."
        intro="Commemorations, cultural observances and meetings open to the public. Registration is available for events that accept it."
      />

      <Section>
        {events.length === 0 ? (
          <EmptyNote>No event has been published yet. The administration publishes the calendar from the Administrator Console.</EmptyNote>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {events.map((event) => {
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
                  <div key={field.key}>
                    <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {field.label}
                      {field.required ? " *" : ""}
                    </Label>
                    <Input
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="mt-1.5 rounded-none text-[13px]"
                    />
                  </div>
                ))}
                <Button
                  className="w-full rounded-none bg-[hsl(var(--primary))]"
                  disabled={submitting}
                  onClick={register}
                >
                  {submitting ? "Submitting…" : "Submit registration"}
                </Button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Your details are used only to administer this event and are handled under the OTA privacy notice.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}