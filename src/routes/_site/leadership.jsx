import { createFileRoute, Link } from "@tanstack/react-router";
import { base44 } from "@/api/base44Client";
import { PageHero } from "@/components/site/PageHero";
import { Section, EmptyNote } from "@/components/site/PageParts";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { INSTITUTIONS } from "@/lib/institutions";

export const Route = createFileRoute("/_site/leadership")({
  head: () => ({
    meta: [
      { title: "Traditional Leadership · Ovaherero Traditional Authority" },
      { name: "description", content: "Directory of approved traditional leaders, their recognised communities and authorised public contact details." },
    ],
  }),
  loader: async () => {
    const [officeholders, communities] = await Promise.all([
      base44.entities.Officeholder.filter({ status: "published" }, { sort: "sort_order", limit: 200 }),
      base44.entities.TraditionalCommunity.filter(
        { status: "published", kind: "Traditional community" },
        { sort: "name", limit: 100 },
      ),
    ]);
    return { officeholders: officeholders.items || [], communities: communities.items || [] };
  },
  component: LeadershipPage,
});

function LeadershipPage() {
  const { officeholders, communities } = Route.useLoaderData();
  const nameFor = (slug) => INSTITUTIONS.find((i) => i.slug === slug)?.name || slug;

  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Traditional leadership, recognised and accountable."
        intro="This directory lists only officeholders and leaders whose appointments and public contact details have been authorised for publication by the Authority."
      />

      <Section>
        {officeholders.length === 0 ? (
          <EmptyNote>
            No officeholder has been published yet. The administration publishes approved appointments from the
            Institutions &amp; offices screen of the Administrator Console.
          </EmptyNote>
        ) : (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {officeholders.map((person) => (
              <article key={person.id} className="bg-card p-6">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--oxblood))]">{person.title}</p>
                  {person.is_demo ? <IllustrativeBadge /> : null}
                </div>
                <h2 className="mt-2 font-display text-[1.45rem] leading-snug">{person.name}</h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {nameFor(person.institution_slug)}
                </p>
                {person.community_name ? (
                  <p className="mt-3 text-[12.5px] text-foreground/75">{person.community_name}</p>
                ) : null}
                {person.portfolio ? (
                  <p className="mt-1 text-[12px] text-foreground/60">{person.portfolio}</p>
                ) : null}
                {person.public_contact ? (
                  <p className="mt-3 border-t border-border pt-3 text-[11.5px] text-foreground/70">{person.public_contact}</p>
                ) : null}
                <Link
                  to={`/institutions/${person.institution_slug || "chiefs-council"}`}
                  className="mt-4 inline-block text-[10.5px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
                >
                  View structure
                </Link>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow="Communities" title="Recognised traditional communities" tone="muted">
        {communities.length === 0 ? (
          <EmptyNote>No traditional community has been published yet.</EmptyNote>
        ) : (
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Community</th>
                  <th className="px-5 py-3 font-medium">Regional location</th>
                  <th className="px-5 py-3 font-medium">Leader</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((community) => (
                  <tr key={community.id} className="border-b border-border/70 last:border-0">
                    <td className="px-5 py-3">{community.name}</td>
                    <td className="px-5 py-3 text-[12px] text-foreground/70">
                      {[community.region, community.country].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-foreground/70">
                      {community.leader_name ? `${community.leader_title ? community.leader_title + " " : ""}${community.leader_name}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[11.5px] text-muted-foreground">{community.recognition_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}