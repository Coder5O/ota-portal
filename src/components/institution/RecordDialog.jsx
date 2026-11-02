import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/admin/FormField";

export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  values,
  setValues,
  onSubmit,
  busy,
  error,
  submitLabel = "Save record",
  notice,
}) {
  const [localError, setLocalError] = useState("");

  const submit = async () => {
    setLocalError("");
    try {
      await onSubmit();
    } catch (submitError) {
      setLocalError(submitError?.message || "The record could not be saved.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl leading-tight">{title}</DialogTitle>
          {description ? <DialogDescription className="text-[12.5px]">{description}</DialogDescription> : null}
        </DialogHeader>
        {notice ? (
          <p className="border-l-2 border-gold/60 bg-secondary/60 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
            {notice}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={(value) => setValues((previous) => ({ ...previous, [field.name]: value }))}
            />
          ))}
        </div>
        {error || localError ? (
          <p className="text-[12.5px] leading-relaxed text-[hsl(var(--oxblood))]">{error || localError}</p>
        ) : null}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button className="rounded-none" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}