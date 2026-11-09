import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./GoogleIcon";
import { base44 } from "@/api/base44Client";
import { returnToSearch } from "@/lib/authReturnTo";

// Small pieces the auth pages share.

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      {children}
    </div>
  );
}

export function SubmitButton({ busy, busyLabel, children, ...props }) {
  return (
    <Button type="submit" className="h-12 w-full font-medium" disabled={busy} {...props}>
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function GoogleButton({ returnTo, onError }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await base44.auth.loginWithProvider("google", returnTo);
    } catch (err) {
      console.error("Google sign-in error:", err);
      const msg = err.message || "Failed to sign in with Google.";
      toast.error(msg, { duration: 9000 });
      if (onError) onError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="mb-6 h-12 w-full text-sm font-medium"
      disabled={busy}
      onClick={handleClick}
    >
      {busy ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-gold" />
      ) : (
        <GoogleIcon className="mr-2 h-5 w-5" />
      )}
      {busy ? "Connecting to Google…" : "Continue with Google"}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">or</span>
      </div>
    </div>
  );
}

// A link between auth screens that carries the way back (?returnTo=) along.
export function AuthLink({ to, returnTo, className = "font-medium text-primary hover:underline", children }) {
  return (
    <Link to={to} search={returnToSearch(returnTo)} className={className}>
      {children}
    </Link>
  );
}
