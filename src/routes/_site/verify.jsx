import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { verifyMembership } from "@/lib/ota-fns";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/PageParts";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/institutions";

export const Route = createFileRoute("/_site/verify")({
  validateSearch: (search) => ({ m: typeof search.m === "string" ? search.m : undefined }),
  loaderDeps: ({ search }) => ({ m: search.m }),
  loader: async ({ deps }) => {
    if (!deps.m) return { found: false, missing: true };
    return verifyMembership({ data: { number: deps.m } });
  },
  head: () => ({
    meta: [
      { title: "Membership verification · Ovaherero Traditional Authority" },
      { name: "description", content: "Verify an Ovaherero Traditional Authority membership card." },
    ],
  }),
  component: VerifyPage,
});

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="border-b border-border/70 pb-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[13.5px]">{value}</p>
    </div>
  );
}

function VerifyPage() {
  const result = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Card verification"
        title="Verify a membership card."
        intro="Scanning the code on a membership card opens this page. It confirms only the number, name, category and current validity."
      />

      <Section>
        <div className="mx-auto max-w-2xl border border-border bg-card p-8">
          {result.missing ? (
            <>
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <h2 className="mt-4 font-display text-2xl">No reference to verify</h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                Open this page by scanning the code on a membership card, or enter the membership number found on the
                card.
              </p>
              <Button asChild className="mt-5 rounded-none bg-[hsl(var(--primary))]">
                <Link to="/contact">Contact the office</Link>
              </Button>
            </>
          ) : !result.found ? (
            <>
              <ShieldAlert className="h-8 w-8 text-amber-700" />
              <h2 className="mt-4 font-display text-2xl">No membership record matches this number</h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                The number is not in the Authority's register. Check the number on the card, or contact the office if you
                believe this is an error.
              </p>
              <Button asChild className="mt-5 rounded-none bg-[hsl(var(--primary))]">
                <Link to="/contact">Contact the office</Link>
              </Button>
            </>
          ) : (
            <>
              <div
                className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                  result.valid
                    ? "border-emerald-700/30 bg-emerald-700/10 text-emerald-800"
                    : "border-amber-700/30 bg-amber-700/10 text-amber-800"
                }`}
              >
                {result.valid ? <BadgeCheck className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                {result.valid ? "Valid membership" : `Card status: ${result.status}`}
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight">
                {result.title ? `${result.title} ` : ""}
                {result.full_name}
              </h2>
              <p className="mt-1 font-mono text-[12.5px] tracking-wide text-muted-foreground">
                {result.membership_number}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Row label="Category" value={categoryLabel(result.category)} />
                <Row label="Community or structure" value={result.community_name} />
                <Row label="Issuing institution" value={result.institution} />
                <Row label="Approved by" value={result.approval_authority} />
                <Row label="Member since" value={result.joined_date} />
                <Row label="Valid until" value={result.valid_until} />
              </div>

              <p className="mt-6 border-t border-border pt-4 text-[11.5px] leading-relaxed text-muted-foreground">
                The card records a membership recognised by the Ovaherero Traditional Authority. Supporting documents,
                contact details and decision notes on the member's application are private and are never published on
                this page.
              </p>
            </>
          )}
        </div>
      </Section>
    </>
  );
}