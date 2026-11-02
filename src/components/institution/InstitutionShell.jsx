import { Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import {
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Files,
  LayoutDashboard,
  Lock,
  ScrollText,
} from "lucide-react";
import { INSTITUTIONS } from "@/lib/institutions";
import { structureLabel, structureNative } from "./useInstitution";

const TABS = [
  { key: "overview", to: "/institution", label: "Overview", icon: LayoutDashboard },
  { key: "meetings", to: "/institution/meetings", label: "Meetings", icon: CalendarDays },
  { key: "resolutions", to: "/institution/resolutions", label: "Resolutions", icon: ScrollText },
  { key: "tasks", to: "/institution/tasks", label: "Action items", icon: ClipboardList },
  { key: "reports", to: "/institution/reports", label: "Reports", icon: FileBarChart },
  { key: "documents", to: "/institution/documents", label: "Documents", icon: Files },
];

export function InstitutionShell({ meta, structure, active, title, description, action, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ strict: false });

  if (!meta) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-16 text-[13px] text-muted-foreground sm:px-8">
        Loading the structure's dashboard…
      </div>
    );
  }

  if (!meta.hasStructure) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <Lock className="mx-auto h-7 w-7 text-gold" strokeWidth={1.4} />
        <h1 className="mt-4 font-display text-2xl leading-snug">No structure is assigned to this account</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
          Institutional dashboards are opened only for officers formally assigned to a structure by the Authority's
          administrator. Your membership record and notices remain available in the member portal.
        </p>
        <Link
          to="/portal"
          className="mt-6 inline-flex items-center border border-border px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-foreground/80 hover:border-gold hover:text-[hsl(var(--primary))]"
        >
          Go to member portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-5 pb-0 pt-7 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Institutional dashboard</p>
              <h1 className="mt-1.5 truncate font-display text-3xl leading-tight sm:text-[2.1rem]">
                {structureLabel(structure)}
              </h1>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {structureNative(structure) ? `${structureNative(structure)} · ` : ""}
                {meta?.user?.officer_title ? `${meta.user.officer_title} · ` : ""}
                {meta?.user?.email || ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {meta?.isAdmin ? (
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Structure
                  <select
                    value={structure}
                    onChange={(event) =>
                      navigate({ to: location.pathname, search: { ...search, structure: event.target.value } })
                    }
                    className="border border-border bg-background px-2 py-1.5 text-[12px] normal-case tracking-normal text-foreground"
                  >
                    {(meta?.slugs || []).map((slug) => (
                      <option key={slug} value={slug}>
                        {structureLabel(slug)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <Link
                to="/admin"
                className="border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:border-gold hover:text-[hsl(var(--primary))]"
              >
                Administration
              </Link>
            </div>
          </div>
          <nav className="mt-5 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.key === active;
              return (
                <Link
                  key={tab.key}
                  to={tab.to}
                  search={{ structure }}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[12.5px] transition-colors ${
                    isActive
                      ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        {title ? (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl leading-tight">{title}</h2>
              {description ? (
                <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {action}
          </div>
        ) : null}
        {children}
        <p className="mt-12 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Decision authority, quorum and approval steps are recorded by the Authority under{" "}
          <Link to="/admin/governance" className="underline decoration-dotted hover:text-[hsl(var(--primary))]">
            Governance rules
          </Link>
          . The platform never supplies a governance rule of its own.
        </p>
      </main>
    </div>
  );
}

export function DecisionAuthorityNote({ rule, label }) {
  if (!rule) {
    return (
      <p className="border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900">
        No {label} decision rule is recorded for this structure yet. Approval stays closed until a governance
        administrator records the applicable provision.
      </p>
    );
  }
  if (!rule.confirmed) {
    return (
      <p className="border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900">
        The {label} rule for this structure names the {rule.approving_authority || "authority"}, but the applicable
        provision is not yet confirmed. Approval stays closed until that confirmation is recorded.
      </p>
    );
  }
  return (
    <p className="border-l-2 border-gold/60 bg-secondary/50 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
      {label} decisions rest with the <span className="text-foreground">{rule.approving_authority}</span>
      {rule.submitter_role ? `; the ${rule.submitter_role.toLowerCase()} prepares the record.` : "."}
    </p>
  );
}

export { INSTITUTIONS };