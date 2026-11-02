import { useState } from "react";
import { Upload } from "lucide-react";
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

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      if (field.type === "file-public") {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        onChange(file_url);
      } else {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        onChange(file_uri);
      }
      toast.success(
        field.type === "file-public"
          ? "File uploaded (stored publicly — anyone with the link can open it)"
          : "File uploaded (stored privately)",
      );
    } catch (error) {
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
          <div className="flex items-center gap-2">
            <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="File reference" className="rounded-none text-[12.5px]" />
            <Button asChild variant="outline" size="sm" className="rounded-none" disabled={busy}>
              <label className="cursor-pointer">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {busy ? "Uploading" : "Upload"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => upload(e.target.files?.[0])}
                  accept={field.accept || undefined}
                />
              </label>
            </Button>
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