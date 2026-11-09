import { Outlet } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export function SiteLayout({ config }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[hsl(var(--primary))] focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader config={config} />
      {config?.notice ? (
        <div className="border-b border-gold/30 bg-gold/10">
          <div className="shell flex items-start gap-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--oxblood))]" />
            <p className="text-[12.5px] leading-relaxed text-foreground/80">{config.notice}</p>
          </div>
        </div>
      ) : null}
      {config?.maintenance_mode ? (
        <div className="bg-[hsl(var(--oxblood))] text-primary-foreground">
          <div className="shell py-2.5 text-center text-[12.5px]">
            {config.maintenance_message || "This website is currently under maintenance."}
          </div>
        </div>
      ) : null}
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter config={config} />
    </div>
  );
}