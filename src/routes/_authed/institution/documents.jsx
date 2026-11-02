import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { institutionList } from "@/lib/institution-fns";
import { base44 } from "@/api/base44Client";
import { InstitutionShell } from "@/components/institution/InstitutionShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDate } from "@/lib/format";
import { useInstitutionContext } from "@/components/institution/useInstitution";

export const Route = createFileRoute("/_authed/institution/documents")({
  ssr: false,
  head: () => ({ meta: [{ title: "Documents — Structure dashboard" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { meta, structure } = useInstitutionContext();
  const list = useServerFn(institutionList);
  const [term, setTerm] = useState("");
  const [busy, setBusy] = useState("");

  const query = useQuery({
    queryKey: ["institution-documents", structure],
    queryFn: () => list({ data: { slug: structure, kind: "documents" } }),
    enabled: !!structure,
  });

  const items = useMemo(() => {
    const rows = (query.data?.items || []).filter((row) => row.visibility !== "confidential" || meta?.isAdmin);
    const needle = term.trim().toLowerCase();
    return needle ? rows.filter((row) => String(row.title || "").toLowerCase().includes(needle)) : rows;
  }, [query.data, term, meta]);

  const openFile = async (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!doc.file_uri) {
      toast.error("No file is attached to this record.");
      return;
    }
    setBusy(doc.id);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("The document could not be opened.");
    } finally {
      setBusy("");
    }
  };

  return (
    <InstitutionShell
      meta={meta}
      structure={structure}
      active="documents"
      title="Document archive"
      description="Papers held for this structure. Internal documents are reachable only by its officers and the administration."
    >
      <div className="mb-4">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search documents"
          className="h-9 max-w-xs rounded-none text-[13px]"
        />
      </div>

      {query.isLoading ? <p className="text-[13px] text-muted-foreground">Loading documents…</p> : null}

      <div className="space-y-2">
        {items.map((doc) => (
          <article key={doc.id} className="flex flex-wrap items-start justify-between gap-3 border border-border bg-card p-4">
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <div className="min-w-0">
                <h3 className="text-[13.5px] font-medium leading-snug">{doc.title}</h3>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  {doc.category || "Document"}
                  {doc.effective_date ? ` · ${fmtDate(doc.effective_date)}` : ""} · v{doc.version || "1.0"} ·{" "}
                  {doc.visibility === "public" ? "Public" : doc.visibility === "confidential" ? "Confidential" : "Internal"}
                </p>
                {doc.description ? (
                  <p className="mt-1 text-[12px] leading-relaxed text-foreground/75">{doc.description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={doc.status} />
              <Button variant="outline" size="sm" className="rounded-none" onClick={() => openFile(doc)} disabled={busy === doc.id}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {busy === doc.id ? "Opening" : "Open"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!query.isLoading && !items.length ? (
        <p className="border border-dashed border-border px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          No document is filed for this structure.
        </p>
      ) : null}
    </InstitutionShell>
  );
}