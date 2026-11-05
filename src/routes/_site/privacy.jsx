import { createFileRoute, Link } from "@tanstack/react-router";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { PageHero } from "@/components/site/PageHero";
import { ProseBlocks, Section, EmptyNote } from "@/components/site/PageParts";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Data Protection · Ovaherero Traditional Authority" },
      { name: "description", content: "What information the Ovaherero Traditional Authority collects, why, who can access it and how requests are handled." },
    ],
  }),
  loader: async () => {
    const blocks = await base44.entities.ContentBlock.filter(
      { page_slug: "privacy", status: "published" },
      { sort: "sort_order", limit: 30 },
    );
    return { blocks: blocks.items || [] };
  },
  component: PrivacyPage,
});

const SECTIONS = [
  {
    title: "What we collect",
    body: "Registration applications, membership records, enquiries, event registrations and meeting records. We ask only for what an application or a record requires. Sensitive family, ancestry or identity information is not required unless it is necessary, approved and covered by an appropriate policy.",
  },
  {
    title: "Why we collect it",
    body: "To consider applications, maintain the membership register, administer meetings and decisions, publish approved institutional information and respond to enquiries.",
  },
  {
    title: "Who can access it",
    body: "Authorised administrators of the Authority. Applicants and members see only their own records in the member portal. Confidential documents require an authorised role and are served through links that expire.",
  },
  {
    title: "How long it is kept",
    body: "Official institutional records are retained and archived rather than erased. Account suspension does not delete a membership record or its history.",
  },
  {
    title: "Security",
    body: "Access is enforced on the server for every record, not only in the interface. Uploaded documents are stored privately and accessed through short-lived signed links. Important changes are recorded in an audit log.",
  },
];

function PrivacyPage() {
  const { blocks } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Privacy & data protection"
        title="Your information, handled with care and accountability."
        intro="This notice explains what the Ovaherero Traditional Authority collects through this platform, why it is collected, who can access it and how requests are handled."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title} className="border-l border-gold/40 pl-5">
                <h2 className="font-display text-[1.45rem] leading-snug">{section.title}</h2>
                <p className="mt-2 text-[0.93rem] leading-[1.85] text-foreground/75">{section.body}</p>
              </div>
            ))}

            <div id="accessibility" className="border border-border bg-card p-6">
              <h2 className="font-display text-[1.45rem] leading-snug">Accessibility</h2>
              <p className="mt-2 text-[0.93rem] leading-[1.85] text-foreground/75">
                Pages are built with semantic headings, keyboard-reachable controls, visible focus outlines and
                sufficient contrast, and are responsive on phones, tablets and desktops. If any part of this website is
                difficult to use, please tell the office and we will address it.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="border border-border bg-card p-6">
              <p className="eyebrow">Your requests</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/70">
                You may ask what information is held about you, request a correction, or ask about a document's
                confidentiality. Requests are recorded and answered by the office.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-block border-b border-gold pb-1 text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
              >
                Submit a request
              </Link>
            </div>
            <div className="border border-border bg-card p-6">
              <p className="eyebrow">Language</p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/70">
                This platform is published in English. Otjiherero and other approved languages can be added as
                translations are authorised.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Approved policy" title="Published policy text" tone="muted">
        {blocks.length === 0 ? (
          <EmptyNote>No additional policy text has been published by the administration.</EmptyNote>
        ) : (
          <ProseBlocks blocks={blocks} />
        )}
      </Section>
    </>
  );
}