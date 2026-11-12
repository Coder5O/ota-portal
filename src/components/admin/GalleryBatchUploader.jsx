import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Images, Loader2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function titleFromFile(file) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Gallery item";
}

export function GalleryBatchUploader() {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("draft");
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Choose at least one image or video first.");
      return;
    }
    const oversizedVideo = files.find((file) => file.type.startsWith("video/") && file.size > 100 * 1024 * 1024);
    if (oversizedVideo) {
      toast.error(`${oversizedVideo.name} is larger than the 100 MB video limit.`);
      return;
    }

    setUploading(true);
    let completed = 0;
    try {
      // Upload one at a time to keep the browser responsive and avoid provider limits.
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        if (!file_url) throw new Error(`No URL returned for ${file.name}`);
        await base44.entities.GalleryItem.create({
          title: titleFromFile(file),
          media_type: file.type.startsWith("video/") ? "video" : "image",
          media_url: file_url,
          status,
          taken_date: new Date().toISOString().slice(0, 10),
        });
        completed += 1;
      }
      queryClient.invalidateQueries({ queryKey: ["GalleryItem"] });
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(`${completed} gallery item${completed === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      console.error("Gallery batch upload failed:", error);
      toast.error(`${completed ? `${completed} item${completed === 1 ? "" : "s"} uploaded; ` : ""}the remaining upload could not be completed.`);
      queryClient.invalidateQueries({ queryKey: ["GalleryItem"] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="mb-8 border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Bulk upload</p>
          <h2 className="mt-1 font-display text-2xl">Add several photos or videos</h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            Each file becomes its own gallery item. You can edit its title, caption, thumbnail, or publication status below afterwards.
          </p>
        </div>
        <Images className="h-6 w-6 text-gold" />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
        <div>
          <Label htmlFor="gallery-batch-files" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Files
          </Label>
          <Input
            ref={inputRef}
            id="gallery-batch-files"
            type="file"
            multiple
            accept="image/*,video/*"
            disabled={uploading}
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="mt-1.5 rounded-none text-[12.5px]"
          />
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            {files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Choose multiple files at once. Videos must be 100 MB or smaller."}
          </p>
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Initial status</Label>
          <Select value={status} onValueChange={setStatus} disabled={uploading}>
            <SelectTrigger className="mt-1.5 rounded-none text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft — review first</SelectItem>
              <SelectItem value="published">Published — visible now</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={uploadFiles} disabled={uploading || files.length === 0} className="rounded-none bg-[hsl(var(--primary))]">
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload selected"}
        </Button>
      </div>
    </section>
  );
}
