import { useState, useMemo } from "react";
import {
  Upload,
  Loader2,
  Trash2,
  Paperclip,
  FileText,
  Film,
  File,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const NONE = "__none";

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes)) || Number(bytes) <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function MultiFileUploader({ id, field, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showUrlAdd, setShowUrlAdd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Normalize list of files into consistent structure [{ name, url, size, type, uploaded_at }]
  const files = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item, idx) => {
        if (!item) return null;
        if (typeof item === "string") {
          const rawName = item.split("/").pop()?.split("?")[0] || `Attachment ${idx + 1}`;
          const isImg = item.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i) || item.startsWith("data:image");
          const isPdf = item.match(/\.pdf(\?.*)?$/i);
          const isVid = item.match(/\.(mp4|webm|mov)(\?.*)?$/i);
          return {
            name: decodeURIComponent(rawName),
            url: item,
            type: isImg ? "image" : isVid ? "video" : isPdf ? "pdf" : "document",
          };
        }
        return item;
      }).filter(Boolean);
    }
    return [{ name: "Attached file", url: String(value), type: "document" }];
  }, [value]);

  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    const added = [];
    let failedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProgress({ current: i + 1, total: fileList.length, name: file.name });
      try {
        const isImg = file.type.startsWith("image/");
        const isVid = file.type.startsWith("video/");
        const isPdf = file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");

        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        if (file_url) {
          added.push({
            name: file.name,
            url: file_url,
            size: file.size,
            type: isImg ? "image" : isVid ? "video" : isPdf ? "pdf" : "document",
            uploaded_at: new Date().toISOString(),
          });
        } else {
          failedCount++;
        }
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        failedCount++;
      }
    }

    setBusy(false);
    setProgress(null);

    if (added.length > 0) {
      onChange([...files, ...added]);
      if (failedCount === 0) {
        toast.success(`Attached ${added.length} ${added.length === 1 ? "file" : "files"} successfully!`);
      } else {
        toast.warning(`Uploaded ${added.length} files (${failedCount} failed).`);
      }
    } else if (failedCount > 0) {
      toast.error("Upload could not be completed. Please try again.");
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    toast.info("File removed from attachments.");
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const isImg = trimmed.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i);
    const isPdf = trimmed.match(/\.pdf(\?.*)?$/i);
    const isVid = trimmed.match(/\.(mp4|webm|mov)(\?.*)?$/i);
    const fallbackName = trimmed.split("/").pop()?.split("?")[0] || "Linked resource";

    const newItem = {
      name: nameInput.trim() || decodeURIComponent(fallbackName),
      url: trimmed,
      type: isImg ? "image" : isVid ? "video" : isPdf ? "pdf" : "document",
      uploaded_at: new Date().toISOString(),
    };

    onChange([...files, newItem]);
    setUrlInput("");
    setNameInput("");
    setShowUrlAdd(false);
    toast.success("External file link added.");
  };

  return (
    <div className="space-y-3">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gold" />
          <span className="text-[12px] font-medium text-foreground">
            {files.length === 0 ? "No files attached yet" : `${files.length} ${files.length === 1 ? "file attached" : "files attached"}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlAdd((prev) => !prev)}
            className="h-7 rounded-none px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-1 h-3 w-3" />
            {showUrlAdd ? "Cancel URL" : "Add by URL"}
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 rounded-none border-border" disabled={busy}>
            <label className="cursor-pointer">
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-gold" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
              {busy ? "Uploading…" : "Upload files"}
              <input
                type="file"
                multiple
                className="hidden"
                accept={field.accept || "*/*"}
                onChange={(e) => {
                  if (e.target.files) {
                    handleUploadFiles(Array.from(e.target.files));
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Optional URL addition input */}
      {showUrlAdd && (
        <div className="space-y-2 border border-border bg-secondary/30 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Add direct file URL</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Display label (e.g. Official Communiqué)"
              className="rounded-none text-[12.5px]"
            />
            <div className="flex items-center gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="rounded-none text-[12.5px]"
              />
              <Button type="button" size="sm" onClick={handleAddUrl} className="rounded-none bg-[hsl(var(--primary))] text-[11.5px]">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading progress indicator */}
      {busy && progress && (
        <div className="border border-gold/40 bg-gold/10 p-3">
          <div className="flex items-center justify-between text-[11.5px] font-medium text-foreground">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
              Uploading file {progress.current} of {progress.total}…
            </span>
            <span className="text-muted-foreground truncate max-w-[200px]">{progress.name}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden bg-background">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag & drop upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleUploadFiles(Array.from(e.dataTransfer.files));
          }
        }}
        className={`group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-5 text-center transition-colors ${
          isDragging
            ? "border-gold bg-gold/10"
            : "border-border bg-card/60 hover:border-gold/60 hover:bg-secondary/40"
        }`}
      >
        <label className="cursor-pointer">
          <Upload className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-gold" />
          <p className="mt-1.5 text-[12.5px] font-medium text-foreground">
            Click to select multiple files or drag &amp; drop
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            PDF statements, press releases, supplementary photos, videos, or archives.
          </p>
          <input
            id={id}
            type="file"
            multiple
            className="hidden"
            accept={field.accept || "*/*"}
            onChange={(e) => {
              if (e.target.files) {
                handleUploadFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>

      {/* Attached files list */}
      {files.length > 0 && (
        <ul className="divide-y divide-border border border-border bg-card">
          {files.map((file, idx) => {
            const isImg = file.type === "image" || (file.url && file.url.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i));
            const isPdf = file.type === "pdf" || file.name?.toLowerCase().endsWith(".pdf");
            const isVid = file.type === "video" || file.name?.toLowerCase().endsWith(".mp4");

            return (
              <li key={idx} className="flex items-center justify-between gap-3 p-2.5 transition-colors hover:bg-secondary/30">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Icon */}
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-border bg-background grid place-items-center">
                    {isImg ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : isPdf ? (
                      <FileText className="h-5 w-5 text-[hsl(var(--oxblood))]" />
                    ) : isVid ? (
                      <Film className="h-5 w-5 text-gold" />
                    ) : (
                      <File className="h-5 w-5 text-[hsl(var(--primary))]" />
                    )}
                  </div>

                  {/* File name & meta */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-foreground">{file.name}</p>
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                      <span className="uppercase tracking-wider font-semibold text-gold">
                        {isImg ? "Image" : isPdf ? "PDF Document" : isVid ? "Video" : "File"}
                      </span>
                      {file.size ? (
                        <>
                          <span>·</span>
                          <span>{formatBytes(file.size)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {file.url ? (
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" title="Preview file in new tab">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(idx)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    title="Remove attachment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FormField({ field, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const id = `f-${field.name}`;

  const isVideoField = field.accept?.includes("video") || field.name?.includes("video");
  const isImageField =
    !isVideoField && (field.accept?.includes("image") ||
    field.name?.includes("image") ||
    field.name?.includes("cover") ||
    field.name?.includes("photo") ||
    field.name?.includes("logo") ||
    (typeof value === "string" && (value.startsWith("data:image") || value.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i))));

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      if (isVideoField && file.size > 100 * 1024 * 1024) {
        toast.error("Videos must be 100 MB or smaller.");
        return;
      }
      if (isImageField && file.size > 5 * 1024 * 1024) {
        toast.info("Optimizing and preparing image…");
      }
      if (field.type === "file-public") {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        if (file_url) {
          onChange(file_url);
          toast.success(isVideoField ? "Video uploaded and attached successfully!" : "File uploaded and attached successfully!");
        } else {
          toast.error("Upload did not produce a valid file.");
        }
      } else {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        if (file_uri) {
          onChange(file_uri);
          toast.success("Document uploaded successfully.");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.message || "The upload did not complete. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-border py-2.5">
        <div>
          <Label htmlFor={id} className="text-[13px]">
            {field.label}
          </Label>
          {field.description ? <p className="mt-0.5 text-[11.5px] text-muted-foreground">{field.description}</p> : null}
        </div>
        <Switch id={id} checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <div className={field.full ? "sm:col-span-2" : ""}>
      <Label htmlFor={id} className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {field.label}
        {field.required ? <span className="text-[hsl(var(--oxblood))]"> *</span> : null}
      </Label>
      <div className="mt-1.5">
        {field.type === "textarea" ? (
          <Textarea
            id={id}
            rows={field.rows || 4}
            value={value || ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-none text-[13.5px]"
          />
        ) : field.type === "select" ? (
          <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
            <SelectTrigger id={id} className="rounded-none text-[13.5px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              {(field.options || []).map((option) => {
                const value = typeof option === "string" ? option : option.value;
                const label = typeof option === "string" ? option : option.label;
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ) : field.type === "list" ? (
          <Textarea
            id={id}
            rows={4}
            value={Array.isArray(value) ? value.join("\n") : value || ""}
            placeholder="One entry per line"
            onChange={(e) => onChange(e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
            className="rounded-none text-[13.5px]"
          />
        ) : field.type === "files-public" || field.type === "files" ? (
          <MultiFileUploader id={id} field={field} value={value} onChange={onChange} />
        ) : field.type === "file-private" || field.type === "file-public" ? (
          <div className="space-y-2">
            {isImageField && value ? (
              <div className="flex items-center gap-3 rounded-none border border-border bg-secondary/20 p-2">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-border bg-background">
                  <img
                    src={value}
                    alt={field.label}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <p className="truncate text-[12px] font-medium text-foreground">
                    {value.startsWith("data:") ? "Image loaded (embedded data)" : value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Attached to record</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange("")}
                    className="h-6 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Remove image
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={isVideoField ? "Paste video URL or click Upload" : isImageField ? "Paste image URL or click Upload" : "File reference"}
                className="rounded-none text-[12.5px]"
              />
              <Button asChild variant="outline" size="sm" className="shrink-0 rounded-none border-border" disabled={busy}>
                <label className="cursor-pointer">
                  {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-gold" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  {busy ? "Processing…" : value ? "Replace" : "Upload"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => upload(e.target.files?.[0])}
                    accept={field.accept || (isImageField ? "image/*" : undefined)}
                  />
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <Input
            id={id}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text"}
            value={
              field.type === "datetime" && value
                ? String(value).slice(0, 16)
                : field.type === "date" && value
                  ? String(value).slice(0, 10)
                  : value ?? ""
            }
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
            className="rounded-none text-[13.5px]"
          />
        )}
        {field.description && field.type !== "switch" ? (
          <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{field.description}</p>
        ) : null}
      </div>
    </div>
  );
}
