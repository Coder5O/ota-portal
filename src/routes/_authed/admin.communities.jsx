import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/communities")({
  component: CommunitiesPage,
});

function CommunitiesPage() {
  return (
    <>
      <PageHead
        title="Traditional communities"
        description="Register and manage Ovaherero traditional communities, including diaspora chapters. Pending registrations require approval before they are published to the public website."
      />

      <div className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-[12.5px] leading-relaxed text-foreground/80">
        <strong className="font-medium">Recognition status:</strong> Only communities
        formally recognised by the Paramount Chief or OTA Executive may be published
        with status "Recognised". Use "Registered" for registered communities awaiting
        formal recognition and "Pending" for new registration applications.
      </div>

      <RecordManager
        entity="TraditionalCommunity"
        label="community"
        title="Traditional communities"
        description="All registered communities including diaspora chapters."
        blank={{ status: "pending", kind: "homeland", recognition_status: "Pending" }}
        searchField="name"
        sort="-created_date"
        filterField="kind"
        filterOptions={["homeland", "diaspora"]}
        fields={[
          { name: "name", label: "Community name", required: true },
          { name: "native_name", label: "Customary name" },
          { name: "kind", label: "Type", type: "select", options: ["homeland", "diaspora"], required: true },
          { name: "region", label: "Region / Province" },
          { name: "country", label: "Country", required: true },
          { name: "leader_name", label: "Traditional leader name" },
          { name: "leader_title", label: "Leader title / designation" },
          {
            name: "recognition_status",
            label: "Recognition status",
            type: "select",
            options: ["Pending", "Registered", "Recognised", "Suspended"],
          },
          {
            name: "status",
            label: "Publication status",
            type: "select",
            options: ["pending", "published", "archived"],
          },
          { name: "contact_email", label: "Contact email" },
          { name: "contact_phone", label: "Contact phone" },
          { name: "description", label: "Description", type: "textarea", rows: 4, full: true },
          { name: "notes", label: "Internal notes", type: "textarea", rows: 3, full: true },
        ]}
        columns={[
          { key: "name", label: "Community" },
          { key: "kind", label: "Type" },
          { key: "country", label: "Country" },
          { key: "leader_name", label: "Leader" },
          { key: "recognition_status", label: "Recognition" },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />
    </>
  );
}
