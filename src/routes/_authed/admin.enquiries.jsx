import { createFileRoute } from "@tanstack/react-router";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/enquiries")({
  component: () => (
    <RecordManager
      entity="Enquiry"
      label="enquiry"
      title="Enquiries & requests"
      description="Contact messages, document requests, membership queries and profile correction requests submitted by the public and by members."
      blank={{ status: "New", kind: "General enquiry" }}
      searchField="subject"
      filterField="status"
      filterOptions={["New", "In Review", "Resolved", "Closed"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", required: true },
        { name: "phone", label: "Telephone" },
        { name: "kind", label: "Type", type: "select", options: ["General enquiry", "Profile correction", "Document request", "Membership query", "Media request"] },
        { name: "subject", label: "Subject", full: true },
        { name: "message", label: "Message", type: "textarea", rows: 5, full: true },
        { name: "assigned_to", label: "Assigned officer", full: true },
        { name: "response", label: "Response recorded", type: "textarea", rows: 4, full: true },
        { name: "status", label: "Status", type: "select", options: ["New", "In Review", "Resolved", "Closed"] },
      ]}
      columns={[
        { key: "subject", label: "Subject" },
        { key: "name", label: "From", render: (row) => (
          <span>
            <span className="block">{row.name}</span>
            <span className="block text-[11.5px] text-muted-foreground">{row.email}</span>
          </span>
        ) },
        { key: "kind", label: "Type" },
        { key: "created_date", label: "Received", render: (row) => fmtDateTime(row.created_date) },
        { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
      ]}
    />
  ),
});