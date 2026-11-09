import { createFileRoute } from "@tanstack/react-router";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/events")({
  component: () => (
    <RecordManager
      entity="Event"
      label="Event"
      title="Events & calendar"
      description="Ceremonies, commemorations and meetings. Published events appear on the public calendar, and open events accept registrations."
      blank={{ status: "draft", audience: "Open to the public", registration_open: true }}
      searchField="title"
      filterField="status"
      filterOptions={["draft", "published", "cancelled", "archived"]}
      sort="starts_at"
      fields={[
        { name: "title", label: "Event title", required: true, full: true },
        { name: "starts_at", label: "Starts", type: "datetime" },
        { name: "ends_at", label: "Ends", type: "datetime" },
        { name: "venue", label: "Venue" },
        { name: "town", label: "Town or city" },
        { name: "audience", label: "Audience", type: "select", options: ["Open to the public", "Delegates", "Invitation only"] },
        { name: "organising_structure", label: "Organising structure", placeholder: "e.g. OWA(Ovaherero Womans Association)" },
        { name: "description", label: "Description", type: "textarea", rows: 5, full: true },
        { name: "cover_image", label: "Flyer or cover image", type: "file-public", accept: "image/*", full: true, description: "Promotional flyer or cover photo for this event." },
        { name: "registration_open", label: "Accept public registrations", type: "switch" },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "cancelled", "archived"] },
      ]}
      columns={[
        { key: "title", label: "Event" },
        { key: "starts_at", label: "Starts", render: (row) => fmtDateTime(row.starts_at) },
        { key: "venue", label: "Venue" },
        { key: "audience", label: "Audience" },
        { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
      ]}
    />
  ),
});