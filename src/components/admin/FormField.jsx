import { useState } from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const NONE = "__none";

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
      toast.error("The upload did not complete. Please try again.");
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
