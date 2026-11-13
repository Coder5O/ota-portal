import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { PARAMOUNT_CHIEFS } from "./paramount-chiefs.$slug";

export const Route = createFileRoute("/_site/paramount-chiefs")({
  head: () => ({
    meta: [
      { title: "Paramount Chiefs · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "The historical succession of Paramount Chiefs (Ombára Otjitambi) of the Ovaherero People of Namibia, from 1863 to the present.",
      },
    ],
  }),
  component: ParamountChiefsIndexPage,
});

function ParamountChiefsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Office of the Ombára Otjitambi"
        title="Paramount Chiefs of the Ovaherero"
        intro="The historical succession of the Paramount Chieftaincy from its inauguration in 1863 to the present day."
        image="/images/heritage/paramount-chief-ceremonial-dress.jpg"
        imageAlt="Ovaherero Paramount Chieftaincy"
      />

      <section className="shell py-16 lg:py-20">
        {/* Intro */}
        <div className="max-w-3xl mb-14">
          <p className="eyebrow text-gold">Historical Succession · 1863 – Present</p>
          <p className="mt-4 text-[0.95rem] leading-[1.9] text-foreground/75">
            The institution of the Ovaherero Paramount Chief (Ombára Otjitambi) was inaugurated in 1863 to unify the
            Herero clans against external threats. Each chief has presided over a defining chapter in Ovaherero
            history — from the founding of the unified polity, through the 1904–08 genocide, South African
            occupation, the independence struggle, and into the contemporary era of customary constitutional governance.
          </p>
          <p className="mt-4 text-[0.95rem] leading-[1.9] text-foreground/75">
            Source: <em>Paramount Chiefs of the Ovaherero People (Namibia)</em> — compiled historical report with
            archival citations and open-source image credits.
          </p>
        </div>

        {/* Timeline grid */}
        <div className="space-y-px border border-border bg-border">
          {PARAMOUNT_CHIEFS.map((chief, idx) => (
            <Link
              key={chief.slug}
              to="/paramount-chiefs/$slug"
              params={{ slug: chief.slug }}
              className="group grid gap-6 bg-card p-7 transition-colors hover:bg-background sm:grid-cols-[180px_1fr_auto] sm:items-center"
            >
              {/* Number + reign */}
              <div>
                <span className="font-display text-5xl font-bold text-gold/30 leading-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {chief.reign}
                </p>
              </div>

              {/* Name + teaser */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold">
                    {chief.era}
                  </span>
                  {chief.isDisputed && (
                    <span className="bg-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                      Disputed
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-[1.35rem] leading-tight group-hover:text-[hsl(var(--primary))]">
                  {chief.name}
                </h3>
                {chief.nameAlt && (
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">({chief.nameAlt})</p>
                )}
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/65 max-w-2xl">
                  {chief.teaser}
                </p>
              </div>

              {/* CTA arrow */}
              <div className="hidden sm:flex items-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                  Read more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-[12px] leading-relaxed text-muted-foreground max-w-2xl">
            Images used throughout this section are open-source or supplied with rights information. Historical
            portraits are credited to Wikimedia Commons and other public-domain archives. Contemporary photographs
            are credited to their respective press agencies. The OTA does not claim ownership of archival images.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/paramount-chief"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Office of the Paramount Chief
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/leadership"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-foreground/70"
            >
              Leadership directory
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
