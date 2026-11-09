import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { Button } from "@/components/ui/button";

const PAGES = [
  { value: "about", label: "About OTA" },
  { value: "paramount-chief", label: "Paramount Chief" },
  { value: "culture", label: "Culture & Heritage" },
  { value: "diaspora", label: "Ovaherero Diaspora" },
  { value: "projects", label: "Community Projects" },
  { value: "communities", label: "Traditional Communities" },
  { value: "leadership", label: "Traditional Leadership" },
  { value: "privacy", label: "Privacy & Data Protection" },
];

export const Route = createFileRoute("/_authed/admin/pages")({
  component: () => (
    <>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border border-gold/50 bg-gold/10 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center bg-gold/20 text-gold">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">Need to edit Homepage Images?</h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              The hero banner of the Ovaherero women under the Red Flag and the Paramount Chief section portrait are customized in Website Settings.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="rounded-none bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary))]/90 shrink-0">
          <Link to="/admin/settings" search={{ tab: "images" }}>
            Edit Homepage Images →
          </Link>
        </Button>
      </div>

      <RecordManager
        entity="ContentBlock"
        label="content block"
        title="Website pages"
        description="The written content of the public pages. Publish a block to make it visible on its page; each page lists its blocks in the order set here."
        blank={{ status: "draft", page_slug: "about", sort_order: 10 }}
        searchField="heading"
        filterField="page_slug"
        filterOptions={PAGES.map((p) => p.value)}
        sort="sort_order"
        fields={[
          { name: "page_slug", label: "Page", type: "select", options: PAGES, required: true },
          { name: "sort_order", label: "Order", type: "number" },
          { name: "heading", label: "Heading", required: true, full: true },
          { name: "tag", label: "Label", placeholder: "Optional label, e.g. location or period", full: true },
          { name: "body", label: "Text", type: "textarea", rows: 8, full: true, description: "Separate paragraphs with a blank line." },
          { name: "bullets", label: "List items", type: "list", full: true, description: "One entry per line." },
          { name: "image_url", label: "Image", type: "file-public", accept: "image/*", full: true },
          { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
          { name: "is_demo", label: "Illustrative record", type: "switch", description: "Shown with an “Illustrative” label until verified." },
        ]}
        columns={[
          { key: "heading", label: "Heading" },
          { key: "page_slug", label: "Page" },
          { key: "sort_order", label: "Order" },
          { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
        ]}
      />
    </>
  ),
});