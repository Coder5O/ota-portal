import { createFileRoute } from "@tanstack/react-router";
import { RecordManager } from "@/components/admin/RecordManager";
import { StatusPill } from "@/components/admin/StatusPill";
import { GalleryBatchUploader } from "@/components/admin/GalleryBatchUploader";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/gallery")({
  component: () => (
    <>
      <GalleryBatchUploader />
      <RecordManager
      entity="GalleryItem"
      label="gallery item"
      title="Photo & video gallery"
      description="Upload and publish images or videos for visitors. Only published items appear in the public gallery."
      blank={{ media_type: "image", status: "draft", taken_date: new Date().toISOString().slice(0, 10) }}
      searchField="title"
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "caption", label: "Caption", type: "textarea", rows: 3, full: true },
        { name: "media_type", label: "Media type", type: "select", required: true, options: [{ value: "image", label: "Image" }, { value: "video", label: "Video" }] },
        { name: "taken_date", label: "Date", type: "date" },
        { name: "media_url", label: "Photo or video", type: "file-public", accept: "image/*,video/*", required: true, full: true, description: "Upload an image or MP4/WebM video. Videos must be 100 MB or smaller." },
        { name: "thumbnail_url", label: "Video thumbnail", type: "file-public", accept: "image/*", full: true, description: "Optional image displayed before a video is played." },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "media_type", label: "Type", render: (row) => row.media_type === "video" ? "Video" : "Image" },
        { key: "taken_date", label: "Date", render: (row) => fmtDate(row.taken_date || row.created_date) },
        { key: "status", label: "Status", render: (row) => <StatusPill status={row.status} /> },
      ]}
      />
    </>
  ),
});
