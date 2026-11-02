import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Landmark, ScrollText, ShieldCheck, Users } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { EmptyNote } from "@/components/site/PageParts";
import { dayMonth, fmtDate } from "@/lib/format";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/934e2f759_generated_image.png";
const DETAIL_IMAGE =
  "https://media.base44.com/images/public/6ae34c9a19c15fe652c019e1/a4f4fd11b_generated_image.png";

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
    const [news, events, institutions, welcome] = await Promise.all([
      base44.entities.NewsPost.filter({ status: "published" }, { sort: "-published_date", limit: 3 }),
      base44.entities.Event.filter({ status: "published" }, { sort: "starts_at", limit: 3 }),
      base44.entities.Institution.filter({ status: "published" }, { sort: "sort_order", limit: 6 }),
      base44.entities.ContentBlock.filter(
        { page_slug: "paramount-chief", status: "published" },
        { sort: "sort_order", limit: 1 },
      ),
    ]);
    return {
      news: news.items || [],
      events: events.items || [],
      institutions: institutions.items || [],
      welcome: welcome.items?.[0] || null,
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
  const { news, events, institutions, welcome } = Route.useLoaderData();

  return (
    <>
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-primary-foreground">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="px-5 py-16 sm:px-8 sm:py-20 lg:max-w-2xl lg:justify-self-end lg:py-28 lg:pl-12 lg:pr-16">
            <p className="eyebrow rise">Ovaherero Traditional Authority</p>
            <h1 className="rise rise-1 mt-5 text-[2.6rem] leading-[1.02] sm:text-[3.4rem] lg:text-[4.1rem]">
              United under the Red Flag, guardians of custom and continuity.
            </h1>
            <p className="rise rise-2 mt-6 max-w-xl text-[0.98rem] leading-relaxed text-primary-foreground/80">
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
                className="rounded-none border-primary-foreground/35 bg-transparent px-6 text-[12px] uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/constitution">Read the Constitution</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[600px]">
            <Image
              src={HERO_IMAGE}
              alt="Ovaherero community gathering at golden hour"
              fittingType="fill"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary))] via-transparent to-[hsl(var(--primary))]/30 lg:bg-gradient-to-r lg:from-[hsl(var(--primary))] lg:via-[hsl(var(--primary))]/20 lg:to-transparent" />
          </div>
        </div>
      </section>

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
            src={DETAIL_IMAGE}
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