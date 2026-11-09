import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export function ImageUploader({
  label,
  value,
  onChange,
  fallback,
  hint,
  aspect = "banner", // "banner" | "square" | "portrait"
  previewHeight = "h-36",
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP, SVG)");
      return;
    }

    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      if (res?.file_url) {
        onChange(res.file_url);
        toast.success("Image attached! Click 'Save Image Changes' to publish.");
      } else {
        toast.error("Upload did not return a valid file URL.");
      }
    } catch (err) {
      toast.error("Image upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setUploading(false);
      try {
        if (e.target) e.target.value = "";
      } catch {
        // ignore
      }
    }
  };

  const aspectClass =
    aspect === "square"
      ? "aspect-square w-36"
      : aspect === "portrait"
      ? "aspect-[4/5] w-36 sm:w-44"
      : `${previewHeight} w-full sm:w-72`;

  const activeImage = value || fallback;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-[11px] text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" /> {fallback ? "Reset to original image" : "Remove"}
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Preview Container */}
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary/30 ${aspectClass}`}
        >
          {activeImage ? (
            <img
              src={activeImage}
              alt={label}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center text-muted-foreground">
              <ImageIcon className="h-6 w-6 opacity-40" />
              <span className="mt-1 text-[10px] uppercase tracking-wider opacity-60">No image</span>
            </div>
          )}
          {activeImage && (
            <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-black/75 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white backdrop-blur">
              {value ? "Custom image attached" : "Original live image"}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-none border-border" disabled={uploading}>
              <label className="cursor-pointer">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {uploading ? "Uploading…" : activeImage ? "Upload new image" : "Upload image file"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                />
              </label>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-none text-[11.5px] text-muted-foreground hover:text-foreground"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? "Hide URL input" : "Or paste image link"}
            </Button>
          </div>

          {showUrlInput && (
            <div className="mt-1">
              <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste direct image URL (https://...)"
                className="rounded-none text-[12px]"
              />
            </div>
          )}

          {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
