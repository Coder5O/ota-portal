import { createFileRoute } from "@tanstack/react-router";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/documents")({
  component: () => (
    <RecordManager
      entity="Document"
      label="document"
      title="Documents & versions"
      description="Official documents are stored privately by default. Only documents marked public are downloadable by visitors; every version keeps its own record."
      blank={{ visibility: "internal", status: "active", version: "1.0" }}
      searchField="title"
      filterField="visibility"
      filterOptions={["public", "internal", "confidential"]}
      fields={[
        { name: "title", label: "Document title", required: true, full: true },
        { name: "category", label: "Category", type: "select", options: ["Constitution", "Governance", "Meeting paper", "Minutes", "Resolution", "Report", "Policy", "Notice"] },
        { name: "version", label: "Version" },
        { name: "effective_date", label: "Effective date", type: "date" },
        { name: "institution_slug", label: "Structure slug" },
        { name: "description", label: "Description", type: "textarea", rows: 3, full: true },
        { name: "file_uri", label: "Private file", type: "file-private", full: true, description: "Access is granted through a signed link that expires." },
        { name: "file_url", label: "Public file", type: "file-public", full: true, description: "Only for documents approved for public release." },
        { name: "file_name", label: "File name shown to users", full: true },
        { name: "visibility", label: "Visibility", type: "select", options: ["public", "internal", "confidential"] },
        { name: "status", label: "Status", type: "select", options: ["active", "superseded", "archived"] },
      ]}
      columns={[
        { key: "title", label: "Document" },
        { key: "category", label: "Category" },
        { key: "version", label: "Version" },
        { key: "visibility", label: "Visibility", render: (row) => <StatusPill status={row.visibility === "public" ? "published" : "hidden"} /> },
        { key: "status", label: "Status" },
      ]}
    />
  ),
});