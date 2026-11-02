import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { INSTITUTIONS } from "@/lib/institutions";
import { fmtDate, fmtDateTime } from "@/lib/format";

const SLUGS = INSTITUTIONS.map((inst) => ({ value: inst.slug, label: inst.name }));

export const Route = createFileRoute("/_authed/admin/meetings")({
  component: MeetingsPage,
});

function MeetingsPage() {
  return (
    <>
      <PageHead
        title="Meetings, resolutions & action items"
        description="Record meetings of the Chiefs Council, Senate, OTA Executive and other authorised structures, with agendas, minutes, attendance, resolutions and follow-up."
      />

      <RecordManager
        bare
        entity="Meeting"
        label="meeting"
        title="Meetings"
        description="Quorum, proxy and voting rules are recorded as configured by the Authority — never assumed by the platform."
        blank={{ status: "Scheduled", meeting_type: "Ordinary", visibility: "internal" }}
        searchField="title"
        filterField="institution_slug"
        filterOptions={SLUGS.map((s) => s.value)}
        sort="starts_at"
        fields={[
          { name: "title", label: "Meeting title", required: true, full: true },
          { name: "institution_slug", label: "Structure", type: "select", options: SLUGS, required: true },
          { name: "meeting_type", label: "Type", type: "select", options: ["Ordinary", "Extraordinary", "Special", "Ceremonial"] },
          { name: "starts_at", label: "Date and time", type: "datetime", required: true },
          { name: "venue", label: "Venue" },
          { name: "status", label: "Status", type: "select", options: ["Scheduled", "Concluded", "Cancelled"] },
          { name: "agenda", label: "Agenda", type: "list", full: true, description: "One item per line." },
          { name: "attendance", label: "Attendance", type: "list", full: true, description: "Names of those present." },
          { name: "apologies", label: "Apologies", type: "list", full: true },
          { name: "proxies", label: "Proxies", full: true, description: "Only where the applicable governance rules permit." },
          { name: "quorum_note", label: "Quorum basis", full: true, description: "Record the basis used; the platform does not set quorum rules." },
          { name: "minutes", label: "Minutes", type: "textarea", rows: 8, full: true },
          { name: "visibility", label: "Visibility", type: "select", options: ["internal", "public"], description: "Public concluded meetings appear on the website." },
        ]}
        columns={[
          { key: "title", label: "Meeting" },
          { key: "institution_slug", label: "Structure" },
          { key: "starts_at", label: "Date", render: (row) => fmtDateTime(row.starts_at) },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />

      <div className="mt-10">
        <RecordManager
          bare
          entity="Resolution"
          label="resolution"
          title="Resolutions & decisions"
          description="Each approved resolution records its approving authority, approval date and version."
          blank={{ status: "Draft", version: "1.0", visibility: "internal" }}
          searchField="title"
          filterField="institution_slug"
          filterOptions={SLUGS.map((s) => s.value)}
          fields={[
            { name: "title", label: "Resolution", required: true, full: true },
            { name: "institution_slug", label: "Structure", type: "select", options: SLUGS, required: true },
            { name: "status", label: "Status", type: "select", options: ["Draft", "Approved", "Implemented", "Superseded"] },
            { name: "approval_authority", label: "Approving authority" },
            { name: "approval_date", label: "Approval date", type: "date" },
            { name: "version", label: "Version" },
            { name: "responsible_officer", label: "Responsible officer" },
            { name: "deadline", label: "Deadline", type: "date" },
            { name: "text", label: "Decision text", type: "textarea", rows: 5, full: true },
            { name: "implementation_note", label: "Implementation progress", type: "textarea", rows: 3, full: true },
            { name: "visibility", label: "Visibility", type: "select", options: ["internal", "public"] },
          ]}
          columns={[
            { key: "title", label: "Resolution" },
            { key: "institution_slug", label: "Structure" },
            { key: "approval_date", label: "Approved", render: (row) => fmtDate(row.approval_date) },
            { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
          ]}
        />
      </div>

      <div className="mt-10">
        <RecordManager
          bare
          entity="TaskItem"
          label="action item"
          title="Action items"
          description="Assigned tasks and follow-up on resolutions."
          blank={{ status: "Open", institution_slug: "ota-executive" }}
          searchField="title"
          filterField="status"
          filterOptions={["Open", "In Progress", "Done"]}
          sort="due_date"
          fields={[
            { name: "title", label: "Action", required: true, full: true },
            { name: "institution_slug", label: "Structure", type: "select", options: SLUGS, required: true },
            { name: "owner_name", label: "Responsible officer" },
            { name: "due_date", label: "Due", type: "date" },
            { name: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Done"] },
            { name: "description", label: "Detail", type: "textarea", rows: 4, full: true },
          ]}
          columns={[
            { key: "title", label: "Action" },
            { key: "institution_slug", label: "Structure" },
            { key: "owner_name", label: "Owner" },
            { key: "due_date", label: "Due", render: (row) => fmtDate(row.due_date) },
            { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
          ]}
        />
      </div>
    </>
  );
}