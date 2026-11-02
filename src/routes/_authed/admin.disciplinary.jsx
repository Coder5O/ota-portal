import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/disciplinary")({
  component: DisciplinaryPage,
});

function DisciplinaryPage() {
  return (
    <>
      <PageHead
        title="Restricted disciplinary records"
        description="Confidential governance and disciplinary inquiries, charges, hearings and sanctions under customary law and the OTA Constitution. Access is restricted to authorized governance leadership."
      />

      <div className="mb-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12.5px] leading-relaxed text-foreground/80">
        <strong className="font-medium text-destructive">Confidentiality notice:</strong> Disciplinary
        records are legally privileged and protected. They are never published to the
        public website or accessible to ordinary members. Due process, right of appeal,
        and preservation of proceedings are mandatory.
      </div>

      <RecordManager
        entity="DisciplinaryRecord"
        label="disciplinary matter"
        title="Disciplinary proceedings"
        description="All recorded disciplinary matters across OTA structures."
        blank={{ status: "Pending Hearing", sanction: "None" }}
        searchField="subject_name"
        sort="-created_date"
        filterField="status"
        filterOptions={[
          "Pending Hearing",
          "Under Investigation",
          "Hearing Concluded",
          "Sanction Active",
          "Appealed",
          "Dismissed",
          "Reinstated",
        ]}
        fields={[
          { name: "case_number", label: "Case reference number", required: true, description: "e.g. OTA-DISC-2026-001" },
          { name: "subject_name", label: "Subject member / officer name", required: true },
          { name: "subject_email", label: "Subject email / identification" },
          { name: "institution_slug", label: "Structure involved", placeholder: "e.g. chiefs-council" },
          { name: "hearing_date", label: "Hearing date", type: "date" },
          { name: "presiding_authority", label: "Presiding body / authority", required: true, description: "e.g. Disciplinary Committee, Chiefs Council" },
          {
            name: "status",
            label: "Proceeding status",
            type: "select",
            options: [
              "Pending Hearing",
              "Under Investigation",
              "Hearing Concluded",
              "Sanction Active",
              "Appealed",
              "Dismissed",
              "Reinstated",
            ],
            required: true,
          },
          {
            name: "sanction",
            label: "Imposed sanction",
            type: "select",
            options: [
              "None",
              "Formal Reprimand",
              "Temporary Suspension",
              "Removal from Office",
              "Expulsion from Roll",
              "Customary Restitution",
            ],
          },
          { name: "appeal_deadline", label: "Appeal deadline", type: "date" },
          { name: "charges_summary", label: "Charges & specifications", type: "textarea", rows: 4, full: true, required: true },
          { name: "findings_and_decision", label: "Findings & written decision", type: "textarea", rows: 6, full: true },
          { name: "confidential_notes", label: "Confidential administrative notes", type: "textarea", rows: 3, full: true },
        ]}
        columns={[
          { key: "case_number", label: "Case No." },
          { key: "subject_name", label: "Subject" },
          { key: "presiding_authority", label: "Presiding Body" },
          { key: "sanction", label: "Sanction" },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />
    </>
  );
}
