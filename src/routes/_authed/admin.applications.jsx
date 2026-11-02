import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/lib/institutions";
import { fmtDate } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/applications")({
  component: ApplicationsPage,
});

const STATUSES = [
  "Submitted",
  "Under Review",
  "More Information Required",
  "Approved",
  "Rejected",
  "Suspended",
  "Archived",
];

const TILES = [
  { key: "Submitted", label: "Submitted" },
  { key: "Under Review", label: "Pending review" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
  { key: "Suspended", label: "Suspended" },
];

function buildQuery(status, search) {
  const query = {};
  if (status) query.status = status;
  const term = search.trim();
  if (term) {
    query.$or = [
      { full_name: { $regex: term, $options: "i" } },
      { reference: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ];
  }
  return query;
}

function ApplicationsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["applications", status, search],
    queryFn: async () => {
      const page = await base44.entities.MemberApplication.filter(buildQuery(status, search), {
        sort: "-created_date",
        limit: 100,
      });
      return page.items || [];
    },
  });

  const stats = useQuery({
    queryKey: ["application-stats"],
    queryFn: async () => {
      const [total, ...counts] = await Promise.all([
        base44.entities.MemberApplication.count({}),
        ...TILES.map((tile) => base44.entities.MemberApplication.count({ status: tile.key })),
      ]);
      return { total, ...Object.fromEntries(TILES.map((tile, index) => [tile.key, counts[index]])) };
    },
  });

  const exportRows = async () => {
    try {
      const page = await base44.entities.MemberApplication.filter(buildQuery(status, search), {
        sort: "-created_date",
        limit: 500,
      });
      const rows = page.items || [];
      if (!rows.length) {
        toast.error("There are no applications to export for this filter.");
        return;
      }
      downloadCsv(
        `ota-applications-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          { label: "Reference", value: (row) => row.reference },
          { label: "Full name", value: (row) => row.full_name },
          { label: "Email", value: (row) => row.email },
          { label: "Telephone", value: (row) => row.phone },
          { label: "Category", value: (row) => categoryLabel(row.category) },
          { label: "Country", value: (row) => row.country },
          { label: "Region", value: (row) => row.region },
          { label: "Community or structure", value: (row) => row.community_name || row.diaspora_chapter },
          { label: "Customary title", value: (row) => row.title },
          { label: "Status", value: (row) => row.status },
          { label: "Approval authority", value: (row) => row.approval_authority },
          { label: "Submitted", value: (row) => (row.created_date || "").slice(0, 10) },
          { label: "Decided by", value: (row) => row.decided_by },
          { label: "Decision reason", value: (row) => row.decision_reason },
        ],
        rows,
      );
      toast.success(`${rows.length} application record${rows.length === 1 ? "" : "s"} exported.`);
    } catch (error) {
      toast.error("The export could not be prepared.");
    }
  };

  const rows = list.data || [];
  const tiles = useMemo(
    () => TILES.map((tile) => ({ ...tile, value: stats.data?.[tile.key] ?? null })),
    [stats.data],
  );

  return (
    <>
      <PageHead
        title="Membership applications"
        description="Every submission is reference-numbered and held in one register. Review, verify documents, request information and record decisions; approval creates the member record and number."
        action={
          <Button variant="outline" className="rounded-none text-[11.5px] uppercase tracking-[0.14em]" onClick={exportRows}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <div className="border border-border bg-card px-3 py-2.5">
          <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">All applications</p>
          <p className="mt-1 font-display text-2xl">{stats.data?.total ?? "—"}</p>
        </div>
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={() => setStatus(status === tile.key ? "" : tile.key)}
            className={`border px-3 py-2.5 text-left transition-colors ${
              status === tile.key ? "border-[hsl(var(--primary))] bg-gold/10" : "border-border bg-card hover:bg-secondary/60"
            }`}
          >
            <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">{tile.label}</p>
            <p className="mt-1 font-display text-2xl">{tile.value ?? "—"}</p>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, reference or email"
            className="w-72 rounded-none bg-background pl-9 text-[13px]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={status === "" ? "default" : "outline"} className="rounded-none text-[11.5px]" onClick={() => setStatus("")}>
          All
          </Button>
          {STATUSES.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={status === option ? "default" : "outline"}
              className="rounded-none text-[11.5px]"
              onClick={() => setStatus(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <span className="ml-auto text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">{rows.length} shown</span>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Authority</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Loading applications…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No applications match this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">{row.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.full_name}</p>
                    <p className="text-[11.5px] text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-foreground/80">{categoryLabel(row.category)}</td>
                  <td className="px-4 py-3 text-[11.5px] text-muted-foreground">{row.approval_authority || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{fmtDate(row.created_date)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none text-[11.5px]"
                      onClick={() => setSelected(row)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <ApplicationReviewDialog
          application={selected}
          onClose={() => setSelected(null)}
          onDecided={() => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            queryClient.invalidateQueries({ queryKey: ["application-stats"] });
            queryClient.invalidateQueries({ queryKey: ["members"] });
          }}
        />
      ) : null}
    </>
  );
}