import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/constitution")({
  component: ConstitutionAdmin,
});

function ConstitutionAdmin() {
  return (
    <>
      <PageHead
        title="Constitution library & articles"
        description="Preserve the exact wording of the OTA Constitution as adopted. Flag ambiguous or incomplete provisions for formal OTA review rather than silently rewriting them. When an official revision is approved, record it as a new version with approval metadata."
      />
      <div className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-[12.5px] leading-relaxed text-foreground/80">
        <strong className="font-medium">Constitutional fidelity & versioning:</strong> Wording
        must reflect the primary source adopted on 22 August 2022 (or subsequently promulgated
        revisions). If a section contains open questions or unresolved procedures, mark
        <code className="mx-1 bg-gold/20 px-1 py-0.5 font-mono text-[11.5px]">Requires Formal Review</code>
        so the public portal presents it with appropriate constitutional reservation.
      </div>
      <RecordManager
        bare
        entity="ConstitutionArticle"
        label="article"
        title="Articles of the Constitution"
        description="Organized by article number, chapter, and version history."
        blank={{ status: "published", sort_order: 10, version: "2022 Adoption", requires_formal_review: false }}
        searchField="title"
        sort="sort_order"
        filterField="status"
        filterOptions={["published", "draft"]}
        fields={[
          { name: "number", label: "Article number", type: "number", required: true },
          { name: "sort_order", label: "Display order", type: "number" },
          { name: "title", label: "Article title", required: true, full: true },
          {
            name: "chapter",
            label: "Chapter / Part / Section",
            full: true,
            placeholder: "e.g. Chapter 3: Institutional Structures & Organs",
          },
          { name: "version", label: "Constitution version / promulgation", placeholder: "e.g. 2022 Adoption" },
          { name: "approved_by", label: "Approved by authority", placeholder: "e.g. Chiefs Council / Senate" },
          { name: "approval_date", label: "Adoption / Approval date", type: "date" },
          {
            name: "requires_formal_review",
            label: "Requires formal OTA constitutional review",
            type: "switch",
            description: "Enable if provision contains textual ambiguity or unratified clauses.",
          },
          {
            name: "review_notes",
            label: "Review reservation notes",
            type: "textarea",
            rows: 2,
            full: true,
            description: "Displayed to readers when formal review is required.",
          },
          {
            name: "body",
            label: "Article text",
            type: "textarea",
            rows: 12,
            full: true,
            required: true,
            description: "Exact text as adopted. Separate clauses with double line breaks.",
          },
          { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
        ]}
        columns={[
          { key: "number", label: "No." },
          { key: "title", label: "Article" },
          { key: "chapter", label: "Chapter" },
          { key: "version", label: "Version" },
          {
            key: "requires_formal_review",
            label: "Review Flag",
            render: (row) =>
              row.requires_formal_review ? (
                <span className="bg-amber-500/10 px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-amber-600">
                  Review Pending
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">Final</span>
              ),
          },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />
    </>
  );
}
