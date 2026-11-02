import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/audit")({
  component: AuditPage,
});

function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    toast.error("No entries to export.");
    return;
  }
  const headers = ["created_date", "action", "actor_email", "actor_role", "detail", "outcome"];
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
  toast.success(`Exported ${rows.length} audit records.`);
}

function AuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const logs = useQuery({
    queryKey: ["audit-log-full"],
    queryFn: () => base44.entities.AuditLog.list({ sort: "-created_date", limit: 300 }),
  });

  const rawRows = logs.data?.items || [];

  const actionTypes = useMemo(() => {
    const set = new Set();
    rawRows.forEach((r) => {
      if (r.action) set.add(r.action);
    });
    return Array.from(set).sort();
  }, [rawRows]);

  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      const matchSearch =
        !search.trim() ||
        (r.actor_email && r.actor_email.toLowerCase().includes(search.toLowerCase())) ||
        (r.detail && r.detail.toLowerCase().includes(search.toLowerCase())) ||
        (r.action && r.action.toLowerCase().includes(search.toLowerCase()));

      const matchAction = actionFilter === "all" || r.action === actionFilter;

      return matchSearch && matchAction;
    });
  }, [rawRows, search, actionFilter]);

  return (
    <>
      <PageHead
        title="System audit trail"
        description="Immutable record of every authorization, membership decision, status update, account modification and administrative action across the OTA Governance Portal."
        action={
          <Button
            variant="outline"
            className="rounded-none border-gold text-foreground hover:bg-gold/10"
            disabled={!filteredRows.length}
            onClick={() => exportToCsv("ota-audit-trail.csv", filteredRows)}
          >
            <Download className="mr-2 h-4 w-4 text-gold" />
            Export audit log (CSV)
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action or detail…"
            className="w-72 rounded-none bg-background pl-9 text-[13px]"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-[12.5px] text-foreground focus:outline-none"
        >
          <option value="all">All actions ({rawRows.length})</option>
          {actionTypes.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>

        <span className="ml-auto text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Showing {filteredRows.length} of {rawRows.length} entries
        </span>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Detail</th>
              <th className="px-4 py-3 font-medium">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {logs.isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Loading immutable audit log…
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No matching audit entries found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-border/70 last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-2.5 whitespace-nowrap text-[11.5px] text-muted-foreground">
                    {fmtDateTime(row.created_date)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11.5px] font-medium text-foreground/90">
                    {row.action}
                  </td>
                  <td className="px-4 py-2.5 text-[11.5px] text-muted-foreground">
                    {row.actor_email}
                    <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-gold/80">
                      ({row.actor_role})
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-foreground/80">{row.detail || "—"}</td>
                  <td className="px-4 py-2.5 text-[11.5px]">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                        row.outcome === "success"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {row.outcome || "success"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
