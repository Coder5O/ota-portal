import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/admin/AdminShell";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";

export const Route = createFileRoute("/_authed/admin/assets")({
  component: AssetsPage,
});

function AssetsPage() {
  return (
    <>
      <PageHead
        title="Property & asset register"
        description="Official inventory of physical, cultural and capital assets owned, administered or held in trust by the Ovaherero Traditional Authority. Official records are retained and must not be deleted."
      />

      <div className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-[12.5px] leading-relaxed text-foreground/80">
        <strong className="font-medium">Governance & audit:</strong> Asset additions,
        revaluations and status updates require administrative approval. In accordance
        with customary governance, assets held in trust cannot be alienated or
        disposed of without authorization from the Paramount Chief and Chiefs Council.
      </div>

      <RecordManager
        entity="Asset"
        label="asset"
        title="Asset register"
        description="Complete registry of traditional authority assets."
        blank={{ status: "Active", condition: "Good", category: "Land & Real Property" }}
        searchField="name"
        sort="-created_date"
        filterField="category"
        filterOptions={[
          "Land & Real Property",
          "Cultural & Sacred Heritage",
          "Vehicles & Equipment",
          "Institutional Archives",
          "Other Capital Assets",
        ]}
        fields={[
          { name: "name", label: "Asset name / title", required: true },
          { name: "asset_code", label: "Asset identifier / tag", required: true, description: "e.g. OTA-PROP-001" },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              "Land & Real Property",
              "Cultural & Sacred Heritage",
              "Vehicles & Equipment",
              "Institutional Archives",
              "Other Capital Assets",
            ],
            required: true,
          },
          { name: "location", label: "Location / Custody site", required: true },
          { name: "custodian_name", label: "Designated custodian / officer" },
          { name: "acquisition_date", label: "Acquisition date", type: "date" },
          { name: "estimated_value", label: "Estimated value / valuation", placeholder: "e.g. NAD 500,000" },
          {
            name: "condition",
            label: "Condition",
            type: "select",
            options: ["Excellent", "Good", "Fair", "Needs Repair", "Decommissioned"],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["Active", "Under Review", "Archived", "Transferred"],
          },
          { name: "description", label: "Description & notes", type: "textarea", rows: 4, full: true },
        ]}
        columns={[
          { key: "asset_code", label: "Tag / Code" },
          { key: "name", label: "Asset" },
          { key: "category", label: "Category" },
          { key: "location", label: "Location" },
          { key: "condition", label: "Condition" },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />
    </>
  );
}
