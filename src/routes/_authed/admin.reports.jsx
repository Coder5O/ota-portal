import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/reports")({
  component: ReportsPage,
});

function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    toast.error("No records found to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          let val = row[h];
          if (val === null || val === undefined) val = "";
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported ${rows.length} rows to ${filename}`);
}

function ReportsPage() {
  const [exporting, setExporting] = useState(null);

  const statsQ = useQuery({
    queryKey: ["admin-reports-stats"],
    queryFn: async () => {
      const [
        members,
        applications,
        communities,
        officeholders,
        institutions,
        assets,
        disciplinary,
        audits,
      ] = await Promise.all([
        base44.entities.Member.list({ limit: 500 }),
        base44.entities.MemberApplication.list({ limit: 500 }),
        base44.entities.TraditionalCommunity.list({ limit: 500 }),
        base44.entities.Officeholder.list({ limit: 500 }),
        base44.entities.Institution.list({ limit: 500 }),
        base44.entities.Asset.list({ limit: 500 }),
        base44.entities.DisciplinaryRecord.list({ limit: 500 }),
        base44.entities.AuditLog.list({ limit: 500 }),
      ]);

      const memberItems = members.items || [];
      const appItems = applications.items || [];
      const commItems = communities.items || [];
      const offItems = officeholders.items || [];
      const instItems = institutions.items || [];
      const assetItems = assets.items || [];

      // Check data completeness
      const membersWithoutCommunity = memberItems.filter((m) => !m.community_name).length;
      const appsPendingDocs = appItems.filter((a) => a.status === "More Information Required").length;
      const offWithoutContact = offItems.filter((o) => !o.public_contact && !o.member_email).length;
      const commWithoutLeader = commItems.filter((c) => !c.leader_name).length;

      return {
        memberCount: memberItems.length,
        activeMembers: memberItems.filter((m) => m.status === "Active").length,
        suspendedMembers: memberItems.filter((m) => m.status === "Suspended").length,
        appCount: appItems.length,
        pendingApps: appItems.filter((a) => ["Submitted", "Under Review"].includes(a.status)).length,
        approvedApps: appItems.filter((a) => a.status === "Approved").length,
        rejectedApps: appItems.filter((a) => a.status === "Rejected").length,
        commCount: commItems.length,
        recognisedComm: commItems.filter((c) => c.recognition_status === "Recognised").length,
        diasporaComm: commItems.filter((c) => c.kind === "diaspora").length,
        offCount: offItems.length,
        publishedOff: offItems.filter((o) => o.status === "published").length,
        instCount: instItems.length,
        assetCount: assetItems.length,
        discCount: (disciplinary.items || []).length,
        auditCount: (audits.items || []).length,
        completeness: {
          membersWithoutCommunity,
          appsPendingDocs,
          offWithoutContact,
          commWithoutLeader,
        },
      };
    },
  });

  const handleExport = async (entityKey, filename) => {
    setExporting(entityKey);
    try {
      const res = await base44.entities[entityKey].list({ limit: 1000 });
      const items = res.items || [];
      if (!items.length) {
        toast.info(`No records in ${entityKey} collection.`);
        return;
      }
      exportToCsv(filename, items);
    } catch (err) {
      toast.error("Failed to fetch data for export.");
    } finally {
      setExporting(null);
    }
  };

  const data = statsQ.data;

  return (
    <>
      <PageHead
        title="Reports & official registers export"
        description="Verified statistical summaries calculated directly from the live database. Export official CSV registers for institutional records and regulatory audits."
      />

      {/* Verified Database Totals */}
      <div className="mb-8 border border-border bg-card p-6">
        <h2 className="font-display text-xl">Verified Database Statistics</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Calculated strictly from live database records. No fabricated or estimated counts.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-border/80 bg-secondary/30 p-4">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Total Members
            </span>
            <p className="mt-2 font-display text-3xl text-foreground">
              {statsQ.isLoading ? "…" : data?.memberCount || 0}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data?.activeMembers || 0} active · {data?.suspendedMembers || 0} suspended
            </p>
          </div>

          <div className="border border-border/80 bg-secondary/30 p-4">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Applications
            </span>
            <p className="mt-2 font-display text-3xl text-foreground">
              {statsQ.isLoading ? "…" : data?.appCount || 0}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data?.pendingApps || 0} pending · {data?.approvedApps || 0} approved
            </p>
          </div>

          <div className="border border-border/80 bg-secondary/30 p-4">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Communities
            </span>
            <p className="mt-2 font-display text-3xl text-foreground">
              {statsQ.isLoading ? "…" : data?.commCount || 0}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data?.recognisedComm || 0} recognised · {data?.diasporaComm || 0} diaspora
            </p>
          </div>

          <div className="border border-border/80 bg-secondary/30 p-4">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Traditional Leaders
            </span>
            <p className="mt-2 font-display text-3xl text-foreground">
              {statsQ.isLoading ? "…" : data?.offCount || 0}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data?.publishedOff || 0} published leadership profiles
            </p>
          </div>
        </div>
      </div>

      {/* Record Completeness & Audit Flags */}
      <div className="mb-8 border border-border bg-card p-6">
        <h2 className="font-display text-xl">Record Completeness & Hygiene</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Identifies empty or incomplete database records requiring administrative attention.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 border border-border p-3 text-[12.5px]">
            {data?.completeness?.membersWithoutCommunity ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>
              <strong>{data?.completeness?.membersWithoutCommunity || 0}</strong> member records
              lack traditional community affiliation
            </span>
          </div>

          <div className="flex items-center gap-3 border border-border p-3 text-[12.5px]">
            {data?.completeness?.commWithoutLeader ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>
              <strong>{data?.completeness?.commWithoutLeader || 0}</strong> registered communities
              have no leader designated
            </span>
          </div>

          <div className="flex items-center gap-3 border border-border p-3 text-[12.5px]">
            {data?.completeness?.appsPendingDocs ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>
              <strong>{data?.completeness?.appsPendingDocs || 0}</strong> applications awaiting
              clarification / documents
            </span>
          </div>

          <div className="flex items-center gap-3 border border-border p-3 text-[12.5px]">
            {data?.completeness?.offWithoutContact ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>
              <strong>{data?.completeness?.offWithoutContact || 0}</strong> officeholders lack
              official contact / email links
            </span>
          </div>
        </div>
      </div>

      {/* Export Modules */}
      <div className="border border-border bg-card p-6">
        <h2 className="font-display text-xl">Official Exports (CSV)</h2>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Download raw database registers for archive, offline reporting, or legal documentation.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Membership Register",
              entity: "Member",
              file: "ota-membership-register.csv",
              desc: "Approved and active member records with numbers and dates.",
            },
            {
              title: "Applications Register",
              entity: "MemberApplication",
              file: "ota-member-applications.csv",
              desc: "All submitted, review and decided membership applications.",
            },
            {
              title: "Communities Register",
              entity: "TraditionalCommunity",
              file: "ota-traditional-communities.csv",
              desc: "Homeland and diaspora communities and leaders.",
            },
            {
              title: "Leadership & Officeholders",
              entity: "Officeholder",
              file: "ota-leadership-officeholders.csv",
              desc: "All appointed traditional leaders and portfolios.",
            },
            {
              title: "Property & Asset Inventory",
              entity: "Asset",
              file: "ota-asset-register.csv",
              desc: "Official property, capital and sacred heritage register.",
            },
            {
              title: "System Audit Log",
              entity: "AuditLog",
              file: "ota-audit-log.csv",
              desc: "Complete immutable log of all authorized platform actions.",
            },
          ].map((item) => (
            <div
              key={item.entity}
              className="flex flex-col justify-between border border-border p-4 transition-colors hover:border-gold/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gold" />
                  <h3 className="font-medium text-[13.5px]">{item.title}</h3>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">{item.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-none text-[12px]"
                disabled={exporting === item.entity}
                onClick={() => handleExport(item.entity, item.file)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {exporting === item.entity ? "Exporting…" : "Download CSV"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
