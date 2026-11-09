import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  Files,
  Gavel,
  Gauge,
  Landmark,
  LayoutTemplate,
  LogOut,
  Mail,
  MapPin,
  Newspaper,
  Scale,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/admin", label: "Overview", icon: Gauge, exact: true },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/users", label: "User accounts", icon: UserCog },
  { to: "/admin/communities", label: "Communities", icon: MapPin },
  { to: "/admin/structure", label: "Institutions & offices", icon: Landmark },
  { to: "/admin/authority", label: "Approval authority", icon: BadgeCheck },
  { to: "/admin/governance", label: "Governance rules", icon: Scale },
  { to: "/admin/meetings", label: "Meetings & resolutions", icon: CalendarDays },
  { to: "/admin/assets", label: "Asset register", icon: Building2 },
  { to: "/admin/disciplinary", label: "Disciplinary", icon: Gavel },
  { to: "/admin/roles", label: "Roles & permissions", icon: ShieldAlert },
  { to: "/admin/reports", label: "Reports & exports", icon: BarChart3 },
  { to: "/admin/news", label: "News & media", icon: Newspaper },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/pages", label: "Website pages", icon: LayoutTemplate },
  { to: "/admin/documents", label: "Documents", icon: Files },
  { to: "/admin/constitution", label: "Constitution", icon: ScrollText },
  { to: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { to: "/admin/audit", label: "Audit log", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40 lg:flex-row">
      <aside className="bg-[hsl(var(--ink))] text-[hsl(var(--background))] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center border border-gold/60 font-display text-[11px] text-gold">
            OTA
          </span>
          <div className="leading-tight">
            <p className="font-display text-base">Administration</p>
            <p className="text-[9.5px] uppercase tracking-[0.2em] text-white/40">Ovaherero Traditional Authority</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 py-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: !!item.exact }}
                className="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2 text-[12.5px] text-white/65 transition-colors hover:bg-white/5 hover:text-white lg:rounded-sm [&.active]:bg-white/10 [&.active]:text-gold"
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 px-4 py-4 lg:block">
          <p className="truncate text-[11px] text-white/50">{user?.email}</p>
          <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.18em] text-gold">Super Administrator</p>
          <div className="mt-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2 py-1 text-left text-[12px] text-white/60 hover:text-gold"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Sticky top bar for all screen sizes */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-gold/60 bg-gold/10 px-3 py-1.5 text-[12px] font-medium tracking-wide text-foreground shadow-sm transition-colors hover:bg-gold/20 hover:text-[hsl(var(--primary))]"
            >
              <ArrowLeft className="h-4 w-4 text-gold" />
              <span>Back to Public Website</span>
            </Link>
            <span className="hidden text-muted-foreground/40 sm:inline">|</span>
            <span className="hidden text-[11.5px] uppercase tracking-wider text-muted-foreground md:inline">
              OTA Governance Portal
            </span>
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            <Link
              to="/portal"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Member Portal
            </Link>
            <span className="hidden h-3.5 w-px bg-border sm:inline" />
            <span className="truncate text-foreground/80 font-medium max-w-[180px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHead({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl leading-tight sm:text-[2rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}