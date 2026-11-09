import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { INSTITUTIONS } from "@/lib/institutions";

const PRIMARY = [
  { to: "/about", label: "About" },
  { to: "/constitution", label: "Constitution" },
  {
    label: "Leadership",
    children: [
      { to: "/paramount-chief", label: "Paramount Chief" },
      { to: "/leadership", label: "Traditional Leadership" },
      { to: "/institutions/office-of-the-paramount-chief", label: "Office of the Paramount Chief" },
    ],
  },
  {
    label: "Institutions",
    children: [
      { to: "/institutions", label: "Overview: All Institutions" },
      ...INSTITUTIONS.slice(0, 9).map((inst) => ({
        to: `/institutions/${inst.slug}`,
        label: inst.name,
      })),
    ],
  },
  { to: "/news", label: "News & Media" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

const MORE = [
  { to: "/oggf", label: "Ovaherero Global Genocide Foundation (OGGF)" },
  { to: "/diaspora", label: "Ovaherero Diaspora" },
  { to: "/culture", label: "Culture & Heritage" },
  { to: "/projects", label: "Community Projects" },
  { to: "/communities", label: "Traditional Communities" },
  { to: "/privacy", label: "Privacy & Data Protection" },
];

function Monogram({ text = "OTA", logoUrl }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Official Logo"
        className="h-11 w-11 shrink-0 object-contain"
      />
    );
  }
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center border border-gold/50 bg-[hsl(var(--primary))] text-primary-foreground">
      <span className="font-display text-[0.95rem] leading-none tracking-[0.06em]">{text}</span>
    </span>
  );
}

export function SiteHeader({ config }) {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const navigate = useNavigate();

  const portalPath = user?.role === "admin" ? "/admin" : "/portal";

  return (
    <>
      <div className="hidden bg-[hsl(var(--ink))] text-[hsl(var(--background))] md:block">
        <div className="shell flex h-9 items-center justify-between text-[10.5px] uppercase tracking-[0.18em]">
          <p className="text-[hsl(var(--background))]/65">
            Official website · {config?.organisation_name || "Ovaherero Traditional Authority"}
          </p>
          <div className="flex items-center gap-5">
            <Link to="/diaspora" className="text-[hsl(var(--background))]/70 transition-colors hover:text-gold">
              Diaspora
            </Link>
            <Link to="/privacy" className="text-[hsl(var(--background))]/70 transition-colors hover:text-gold">
              Privacy
            </Link>
            {!isLoadingAuth && isAuthenticated ? (
              <Link to={portalPath} className="text-gold transition-opacity hover:opacity-80">
                {user?.role === "admin" ? "Administrator Console" : "Member Portal"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => navigateToLogin()}
                className="text-gold transition-opacity hover:opacity-80"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="shell flex h-[74px] items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Ovaherero Traditional Authority home">
            <Monogram text={config?.monogram_text || "OTA"} logoUrl={config?.logo_url} />
            <span className="leading-tight">
              <span className="block font-display text-[1.05rem] tracking-tight text-foreground sm:text-[1.2rem]">
                {config?.organisation_name || "Ovaherero Traditional Authority"}
              </span>
              <span className="block text-[9.5px] uppercase tracking-[0.26em] text-muted-foreground">
                {config?.tagline || "Republic of Namibia"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Main">
            {PRIMARY.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className="flex items-center gap-1 py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:text-[hsl(var(--primary))]">
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 border-border bg-card p-1.5">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.to} asChild>
                        <Link
                          to={child.to}
                          className="cursor-pointer px-3 py-2 text-[13px] text-foreground/85 focus:bg-secondary focus:text-[hsl(var(--primary))]"
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:text-[hsl(var(--primary))]"
                  activeProps={{ className: "text-[hsl(var(--primary))]" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/search" })}
              aria-label="Search this website"
              className="grid h-10 w-10 place-items-center text-foreground/70 transition-colors hover:text-[hsl(var(--primary))]"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Button
              asChild
              className="hidden rounded-none bg-[hsl(var(--primary))] px-5 text-[12px] uppercase tracking-[0.14em] hover:bg-[hsl(var(--oxblood))] lg:inline-flex"
            >
              <Link to="/membership">Apply for Membership</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="grid h-10 w-10 place-items-center text-foreground xl:hidden"
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm overflow-y-auto bg-background p-0">
                <div className="border-b border-border px-6 pb-5 pt-7">
                  <p className="eyebrow">Ovaherero Traditional Authority</p>
                  <p className="mt-2 font-display text-2xl leading-tight">Navigation</p>
                </div>
                <div className="px-6 py-5">
                  <ul className="space-y-1">
                    {PRIMARY.map((item) =>
                      item.children ? (
                        <li key={item.label} className="py-2">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                          <ul className="mt-1 space-y-0.5 border-l border-border pl-3">
                            {item.children.map((child) => (
                              <li key={child.to}>
                                <Link
                                  to={child.to}
                                  onClick={() => setOpen(false)}
                                  className="block py-1.5 text-[14px] text-foreground/85"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="block border-b border-border/70 py-2.5 font-display text-xl text-foreground"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                  <ul className="mt-5 space-y-2 border-t border-border pt-4">
                    {MORE.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="block text-[13px] text-muted-foreground"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 space-y-2">
                    <Button
                      asChild
                      className="w-full rounded-none bg-[hsl(var(--primary))] uppercase tracking-[0.14em]"
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/membership">Apply for Membership</Link>
                    </Button>
                    {!isLoadingAuth && isAuthenticated ? (
                      <Button asChild variant="outline" className="w-full rounded-none" onClick={() => setOpen(false)}>
                        <Link to={portalPath}>{user?.role === "admin" ? "Administrator Console" : "Member Portal"}</Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full rounded-none"
                        onClick={() => {
                          setOpen(false);
                          navigateToLogin();
                        }}
                      >
                        Sign in
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}