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
  {
    label: "About Us",
    to: "/about",
    children: [
      { to: "/about", label: "Overview: About OTA" },
      { to: "/about#identity", label: "1. Our Identity" },
      { to: "/about#vision", label: "2. Vision" },
      { to: "/about#mission", label: "3. Mission" },
      { to: "/about#core-values", label: "4. Our Core Values" },
      { to: "/about#strategic-thrust", label: "5. Strategic Thrust" },
    ],
  },
  {
    label: "Governance",
    to: "/leadership",
    children: [
      { to: "/leadership", label: "Overview: Traditional Leadership" },
      { to: "/paramount-chief", label: "Office of the PC" },
      { to: "/leadership#commissioners", label: "Commissioners" },
      { to: "/institutions/chiefs-council", label: "Chiefs Council" },
      { to: "/institutions/senate", label: "Senate" },
      { to: "/chapters", label: "Chapters" },
      { to: "/membership", label: "Membership" },
      { to: "/constitution", label: "OTA Constitution" },
      { to: "/paramount-chiefs", label: "Paramount Chiefs Succession" },
    ],
  },
  {
    label: "Institutions",
    to: "/institutions",
    children: [
      { to: "/institutions", label: "Overview: All Institutions" },
      { to: "/institutions/women-council", label: "OWA (Women Association) [Constitution]" },
      { to: "/institutions/youth-council", label: "OYAC (Youth Council) [Constitution]" },
      { to: "/institutions/red-flag-leadership", label: "Red Flag (Otjiserandu) [Constitution]" },
      { to: "/institutions/white-flag", label: "White Flag (Otjimbandi) [Constitution]" },
      { to: "/oggf", label: "OGGF (Genocide Foundation) [Deed of Trust]" },
      { to: "/institutions/omuyapu", label: "Omuyapu [Deed of Trust]" },
      { to: "/institutions/omuhe", label: "Omuhe [By-law]" },
      { to: "/institutions/cultural-council", label: "Cultural Council [Deed of Trust]" },
      { to: "/institutions/clans-conference", label: "Ovaherero Clans Conference [Deed of Trust]" },
      { to: "/institutions/kutako-heritage-council", label: "Kutako Heritage Council" },
      { to: "/institutions/community-foundations", label: "Community Foundations" },
    ],
  },
  {
    label: "Events",
    to: "/events",
    children: [
      { to: "/events", label: "Overview: Official Calendar (All Convocations)" },
      { to: "/events?category=meetings", label: "Annual Community Meeting at Toasis" },
      { to: "/events?category=hero-fest", label: "HereroFest" },
      { to: "/events?category=commemorations", label: "Herero Day (Okahandja)" },
      { to: "/events?category=commemorations", label: "Herero Genocide Day (Ohamakari)" },
      { to: "/events?category=meetings", label: "Chief's Council Meeting" },
      { to: "/events?category=outreach", label: "Community Outreach" },
      { to: "/events?category=diaspora", label: "Cultural Day in Botswana" },
      { to: "/events?category=diaspora", label: "Heritage Day in South Africa" },
    ],
  },
  {
    label: "Library",
    to: "/library",
    children: [
      { to: "/library", label: "Overview: Digital Library & Repository" },
      { to: "/library#history", label: "History & Living Heritage" },
      { to: "/library#publications", label: "Publications & Legal Briefs" },
      { to: "/library#resolutions", label: "Approved Resolutions & Gazette" },
      { to: "/gallery", label: "Photo & Video Gallery" },
      { to: "/news", label: "News & Media Releases" },
    ],
  },
  { to: "/contact", label: "Contact" },
];

const OTA_SEAL = "/images/branding/ota-seal.jpeg";

const MORE = [
  { to: "/diaspora", label: "Ovaherero Diaspora" },
  { to: "/culture", label: "Culture & Living Heritage" },
  { to: "/projects", label: "Community Projects & Development" },
  { to: "/communities", label: "Traditional Communities Register" },
  { to: "/verify", label: "Document Verification" },
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
        <div className="shell flex min-h-[74px] items-center justify-between gap-4 py-2">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Ovaherero Traditional Authority home">
            <Monogram text={config?.monogram_text || "OTA"} logoUrl={config?.logo_url || OTA_SEAL} />
            <span className="shrink-0 leading-tight">
              <span className="block font-display text-[1.15rem] tracking-tight text-foreground sm:hidden">
                OTA
              </span>
              <span className="hidden font-display text-[1.05rem] tracking-tight text-foreground whitespace-nowrap sm:block sm:text-[1.18rem]">
                {config?.organisation_name || "Ovaherero Traditional Authority"}
              </span>
              <span className="block text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap sm:text-[9px] sm:tracking-[0.24em]">
                {config?.tagline || "Republic of Namibia"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 xl:flex 2xl:gap-3.5" aria-label="Main">
            {PRIMARY.map((item) =>
              item.children ? (
                <div key={item.label} className="flex items-center">
                  <Link
                    to={item.to}
                    className="py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:text-[hsl(var(--primary))] pr-0.5"
                    activeProps={{ className: "text-[hsl(var(--primary))] font-semibold" }}
                  >
                    {item.label}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Open ${item.label} menu`}
                        className="grid h-7 w-5 place-items-center rounded text-foreground/50 transition-colors hover:bg-secondary hover:text-[hsl(var(--primary))] focus:outline-none"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 max-h-[82vh] overflow-y-auto border-border bg-card p-1.5 shadow-lg">
                      <div className="border-b border-border/60 px-3 py-1.5 mb-1 bg-muted/30">
                        <Link
                          to={item.to}
                          className="text-[11px] font-semibold uppercase tracking-wider text-gold hover:text-[hsl(var(--primary))] flex items-center justify-between"
                        >
                          <span>{item.label} Hub</span>
                          <span>Open Overview →</span>
                        </Link>
                      </div>
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
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className="py-2 text-[13px] font-medium text-foreground/80 transition-colors hover:text-[hsl(var(--primary))]"
                  activeProps={{ className: "text-[hsl(var(--primary))] font-semibold" }}
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
                        <li key={item.label} className="py-2 border-b border-border/40 last:border-0">
                          <div className="flex items-center justify-between py-1">
                            <Link
                              to={item.to}
                              onClick={() => setOpen(false)}
                              className="font-display text-lg text-foreground hover:text-[hsl(var(--primary))]"
                            >
                              {item.label}
                            </Link>
                            <Link
                              to={item.to}
                              onClick={() => setOpen(false)}
                              className="text-[11px] uppercase tracking-wider text-gold font-semibold"
                            >
                              Open Page →
                            </Link>
                          </div>
                          <ul className="mt-1 space-y-0.5 border-l border-border pl-3">
                            {item.children.map((child) => (
                              <li key={child.to}>
                                <Link
                                  to={child.to}
                                  onClick={() => setOpen(false)}
                                  className="block py-1.5 text-[14px] text-foreground/85 hover:text-[hsl(var(--primary))]"
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
