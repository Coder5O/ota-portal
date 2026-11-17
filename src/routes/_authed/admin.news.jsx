import { createFileRoute } from "@tanstack/react-router";
import { Paperclip } from "lucide-react";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/news")({
  component: () => (
    <RecordManager
      entity="NewsPost"
      label="News item"
      title="News & media"
      description="Press releases, announcements, speeches and statements. Only records marked published appear on the public website."
      blank={{ status: "draft", category: "Announcement", published_date: new Date().toISOString().slice(0, 10), attachments: [] }}
      searchField="title"
      fields={[
        { name: "title", label: "Headline", required: true, full: true },
        { name: "category", label: "Category", type: "select", options: ["Announcement", "Press Release", "Speech", "Statement", "Culture", "Diaspora", "Notice"] },
        { name: "published_date", label: "Publication date", type: "date" },
        { name: "author", label: "Publishing office", placeholder: "e.g. Office of the Paramount Chief", full: true },
        { name: "excerpt", label: "Summary", type: "textarea", rows: 2, full: true },
        { name: "body", label: "Full text", type: "textarea", rows: 10, full: true, description: "Separate paragraphs with a blank line." },
        { name: "cover_image", label: "Cover image", type: "file-public", accept: "image/*", full: true, description: "Publicly visible image on the website." },
        { name: "video_url", label: "News video", type: "file-public", accept: "video/*", full: true, description: "Optional public video. Upload MP4/WebM video or paste a direct video URL." },
        {
          name: "attachments",
          label: "Attached files & media documents",
          type: "files-public",
          full: true,
          description: "Upload multiple files (press releases, official PDF statements, communiqués, supplementary photos). You can select multiple files at once or drag and drop.",
        },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      ]}
      columns={[
        { key: "title", label: "Headline" },
        { key: "category", label: "Category" },
        {
          key: "attachments",
          label: "Files",
          render: (row) => {
            const count = Array.isArray(row.attachments)
              ? row.attachments.length
              : row.attachments
                ? 1
                : 0;
            return count > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-foreground/85">
                <Paperclip className="h-3 w-3 text-gold" />
                {count} {count === 1 ? "file" : "files"}
              </span>
            ) : (
              <span className="text-[11.5px] text-muted-foreground">—</span>
            );
          },
        },
        { key: "published_date", label: "Date", render: (row) => fmtDate(row.published_date) },
        { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
      ]}
    />
  ),
});
