import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, FileText, HelpCircle, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { reviewApplicationDocument } from "@/lib/ota-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TONE = {
  Verified: "border-emerald-700/30 bg-emerald-700/10 text-emerald-800",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  "Awaiting clarification": "border-amber-700/30 bg-amber-700/10 text-amber-800",
};

export function documentsOf(application) {
  const stored = Array.isArray(application?.documents) ? application.documents : [];
  const uris = Array.isArray(application?.document_uris) ? application.document_uris : [];
  const known = new Set(stored.map((doc) => doc?.uri));
  const missing = uris
    .filter((uri) => uri && !known.has(uri))
    .map((uri) => ({ uri, name: String(uri).split("/").pop() || "Supporting document", status: "" }));
  return [...stored, ...missing];
}

export function ApplicationDocuments({ application, onChanged }) {
  const [notes, setNotes] = useState({});

  const review = useMutation({
    mutationFn: (payload) => reviewApplicationDocument({ data: { id: application.id, ...payload } }),
    onSuccess: (result) => {
      onChanged?.(result.documents);
      toast.success("Document decision recorded.");
    },
    onError: () => toast.error("The document decision could not be recorded."),
  });

  const open = async (uri) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
      window.open(signed_url, "_blank", "noopener");
    } catch (error) {
      toast.error("This document could not be opened.");
    }
  };

  const documents = documentsOf(application);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Supporting documents ({documents.length})
      </p>
      {documents.length === 0 ? (
        <p className="mt-2 text-[12px] text-muted-foreground">No documents were attached to this application.</p>
      ) : (
        <ul className="mt-2 space-y-2.5">
          {documents.map((doc) => (
            <li key={doc.uri} className="border border-border bg-background px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => open(doc.uri)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-[hsl(var(--primary))] underline decoration-gold/60 underline-offset-4"
                >
                  <FileText className="h-3.5 w-3.5" /> {doc.name || "Supporting document"}
                </button>
                <span
                  className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    TONE[doc.status] || "border-border bg-secondary text-foreground/60"
                  }`}
                >
                  {doc.status || "Not reviewed"}
                </span>
              </div>
              {doc.note ? <p className="mt-1 text-[11.5px] text-foreground/70">{doc.note}</p> : null}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Input
                  value={notes[doc.uri] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [doc.uri]: e.target.value }))}
                  placeholder="Note for the record (optional)"
                  className="h-8 min-w-[180px] flex-1 rounded-none text-[12px]"
                />
                {[
                  { status: "Verified", icon: Check },
                  { status: "Rejected", icon: X },
                  { status: "Awaiting clarification", icon: HelpCircle },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.status}
                      type="button"
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({
                          uri: doc.uri,
                          status: option.status,
                          note: notes[doc.uri] || "",
                        })
                      }
                      className="inline-flex items-center gap-1 border border-border px-2 py-1 text-[10.5px] uppercase tracking-[0.1em] text-foreground/70 transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] disabled:opacity-50"
                    >
                      <Icon className="h-3 w-3" /> {option.status === "Awaiting clarification" ? "Clarify" : option.status}
                    </button>
                  );
                })}
              </div>
              {doc.reviewed_by ? (
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Reviewed by {doc.reviewed_by}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}