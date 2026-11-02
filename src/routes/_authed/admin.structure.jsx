import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/structure")({
  component: StructurePage,
});

function StructurePage() {
  return (
    <>
      <PageHead
        title="Institutions & officeholders"
        description="Configure the structures identified in the Constitution, then publish approved officeholders. Functions and reporting arrangements are recorded here only as approved."
      />

      <RecordManager
        bare
        entity="Institution"
        label="Institution"
        title="Institutional structures"
        description="Each structure has its own public page, dashboard and records."
        blank={{ status: "draft", sort_order: 10 }}
        searchField="name"
        sort="sort_order"
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "slug", label: "URL slug", required: true, description: "e.g. chiefs-council — used in the page address." },
          { name: "native_name", label: "Customary name" },
          { name: "sort_order", label: "Order", type: "number" },
          { name: "summary", label: "Summary", type: "textarea", rows: 3, full: true },
          { name: "mandate", label: "Published mandate", type: "textarea", rows: 4, full: true, description: "Only as approved; do not paraphrase constitutional powers." },
          { name: "responsibilities", label: "Responsibilities", type: "list", full: true },
          { name: "reporting_line", label: "Reporting arrangement", full: true },
          { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
          { name: "is_demo", label: "Illustrative record", type: "switch" },
        ]}
        columns={[
          { key: "name", label: "Structure" },
          { key: "native_name", label: "Customary name" },
          { key: "reporting_line", label: "Reports to" },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />

      <div className="mt-10">
        <RecordManager
          bare
          entity="Officeholder"
          label="Officeholder"
          title="Officeholders & portfolios"
          description="Approved officeholders appear in the public leadership directory once published."
          blank={{ status: "hidden", sort_order: 10 }}
          searchField="name"
          sort="sort_order"
          fields={[
            { name: "name", label: "Full name", required: true },
            { name: "title", label: "Official title", required: true },
            { name: "institution_slug", label: "Structure slug", placeholder: "e.g. chiefs-council" },
            { name: "portfolio", label: "Portfolio" },
            { name: "community_name", label: "Community represented" },
            { name: "appointed_date", label: "Appointed", type: "date" },
            { name: "term_end", label: "Term end", type: "date" },
            { name: "public_contact", label: "Public contact", description: "Only contact details authorised for publication." },
            { name: "member_email", label: "Linked member email" },
            { name: "sort_order", label: "Order", type: "number" },
            { name: "biography", label: "Approved biography", type: "textarea", rows: 6, full: true },
            { name: "photo_url", label: "Approved portrait", type: "file-public", accept: "image/*", full: true, description: "Upload only with the officeholder's authorisation." },
            { name: "status", label: "Visibility", type: "select", options: ["published", "hidden"] },
            { name: "is_demo", label: "Illustrative record", type: "switch" },
          ]}
          columns={[
            { key: "name", label: "Name" },
            { key: "title", label: "Title" },
            { key: "institution_slug", label: "Structure" },
            { key: "status", label: "Visibility", render: (row) => <StatusPill status={row.status} /> },
          ]}
        />
      </div>
    </>
  );
}