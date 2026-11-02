import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PageHead } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { seedTestAccounts } from "@/lib/ota-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/roles")({
  component: RolesPage,
});

const SYSTEM_ROLES = [
  {
    key: "super_admin",
    name: "Super Administrator",
    category: "Technical & System",
    description: "Full technical control over platform accounts, system settings, infrastructure and audit logs.",
    constitutionalGuard: "May NOT bypass constitutional quorum, approval rules, or decision requirements.",
    permissions: [
      "Manage all user accounts & roles",
      "Configure approval authorities & governance rules",
      "Read all audit logs & export records",
      "Manage asset register & system configuration",
      "Access confidential disciplinary records",
    ],
  },
  {
    key: "technical_admin",
    name: "Technical Administrator",
    category: "Technical & System",
    description: "Maintains software integrations, infrastructure, error handling and system monitoring.",
    constitutionalGuard: "Strictly limited to technical maintenance; no vote or decision-making authority.",
    permissions: [
      "View system diagnostics & configuration",
      "Perform technical maintenance",
      "Manage document integrity & integrations",
    ],
  },
  {
    key: "membership_registrar",
    name: "Membership Registrar",
    category: "Governance & Registration",
    description: "Reviews, requests clarification, verifies identity documents, and registers new members.",
    constitutionalGuard: "Decisions subject to category approval authorities specified in the Constitution.",
    permissions: [
      "Review incoming membership applications",
      "Verify applicant supporting documentation",
      "Recommend admission or request more information",
      "Issue official digital membership cards",
      "Export membership rolls and registers",
    ],
  },
  {
    key: "secretariat_officer",
    name: "Secretariat Officer",
    category: "Governance & Administration",
    description: "Maintains official minutes, agendas, correspondence, resolutions, and notices for leadership.",
    constitutionalGuard: "Minutes and resolutions require presiding authority approval before archiving.",
    permissions: [
      "Draft and manage official meeting agendas",
      "Record and archive official meeting minutes",
      "Maintain resolution register and status",
      "Draft public and internal notices",
    ],
  },
  {
    key: "institutional_admin",
    name: "Institutional Administrator",
    category: "Institutional Structures",
    description: "Manages structure-specific operations (e.g. Chiefs Council, Senate, OWA, OYF, OGGF, Red Flag).",
    constitutionalGuard: "Scoped strictly to assigned institution slug.",
    permissions: [
      "Manage structure meetings and task items",
      "Submit institutional progress reports",
      "Manage officeholder profiles for assigned structure",
      "Upload and classify institutional documents",
    ],
  },
  {
    key: "content_editor",
    name: "Authorized Content Editor",
    category: "Public Information",
    description: "Drafts and schedules news posts, event listings, educational content, and cultural publications.",
    constitutionalGuard: "Content requires editorial review before public dissemination.",
    permissions: [
      "Create and edit news articles & announcements",
      "Manage public events calendar",
      "Draft website content blocks",
      "Review public heritage submissions",
    ],
  },
  {
    key: "authorized_auditor",
    name: "Authorized Auditor",
    category: "Oversight & Compliance",
    description: "Independent read-only observer examining compliance with customary law, regulations, and financial rules.",
    constitutionalGuard: "Strictly read-only access across registers; cannot modify or delete records.",
    permissions: [
      "Read all audit log entries without restriction",
      "Inspect membership, financial and asset registries",
      "Generate regulatory compliance and audit reports",
      "Export immutable activity histories",
    ],
  },
  {
    key: "ordinary_member",
    name: "Ordinary Member",
    category: "General Membership",
    description: "Verified Ovaherero citizen or affiliated member accessing personal portal and benefits.",
    constitutionalGuard: "Access scoped strictly to personal record, announcements, and public meetings.",
    permissions: [
      "Access digital membership card and verification",
      "Update verified personal contact details",
      "View institutional announcements and public events",
      "Submit community enquiries and profile requests",
    ],
  },
];

function RolesPage() {
  const [selectedRole, setSelectedRole] = useState(SYSTEM_ROLES[0]);
  const qc = useQueryClient();

  const userStats = useQuery({
    queryKey: ["roles-user-stats"],
    queryFn: async () => {
      const users = await base44.entities.User.list({ limit: 500 });
      const counts = { admin: 0, officer: 0, user: 0 };
      (users.items || []).forEach((u) => {
        const r = u.role || "user";
        counts[r] = (counts[r] || 0) + 1;
      });
      return { total: users.items?.length || 0, counts };
    },
  });

  const seedMut = useMutation({
    mutationFn: () => seedTestAccounts(),
    onSuccess: (res) => {
      toast.success("Role test accounts verified / initialized.");
      qc.invalidateQueries({ queryKey: ["roles-user-stats"] });
    },
    onError: (e) => toast.error(e?.message || "Failed to seed test accounts."),
  });

  return (
    <>
      <PageHead
        title="Role & permission management"
        description="Constitutional and administrative roles governing the Ovaherero Traditional Authority digital portal. Granular permissions ensure separation of powers and accountability."
        action={
          <Button
            variant="outline"
            className="rounded-none border-gold text-foreground hover:bg-gold/10"
            disabled={seedMut.isPending}
            onClick={() => seedMut.mutate()}
          >
            <Sparkles className="mr-2 h-4 w-4 text-gold" />
            {seedMut.isPending ? "Initializing…" : "Initialize test role accounts"}
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 border border-amber-500/40 bg-amber-500/5 p-4 text-[12.5px] leading-relaxed text-foreground/80">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <strong className="font-medium text-foreground">Constitutional Invariant:</strong> The
          Super Administrator or Technical roles may configure technical access and
          accounts, but <em>cannot</em> use administrative privileges to bypass customary
          governance, override quorum rules, or fabricate resolutions without constitutional
          mandate.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="space-y-2 lg:col-span-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Platform Roles ({SYSTEM_ROLES.length})
          </p>
          <div className="flex flex-col gap-1 border border-border bg-card p-2">
            {SYSTEM_ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex flex-col items-start px-3 py-2.5 text-left transition-colors ${
                  selectedRole.key === role.key
                    ? "border-l-2 border-gold bg-secondary/80 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[13px]">{role.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {role.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Detail */}
        <div className="border border-border bg-card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.16em] text-gold">
                {selectedRole.category}
              </span>
              <h2 className="font-display text-2xl text-foreground">{selectedRole.name}</h2>
            </div>
            <div className="flex items-center gap-1.5 border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-gold" />
              Role key: <code className="font-mono text-foreground">{selectedRole.key}</code>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-foreground/80">
            {selectedRole.description}
          </p>

          <div className="mt-5 border border-border/80 bg-secondary/30 p-3.5 text-[12px] text-foreground/75">
            <strong className="font-medium text-foreground">Constitutional restriction:</strong>{" "}
            {selectedRole.constitutionalGuard}
          </div>

          <div className="mt-6">
            <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Authorized Granular Permissions
            </h3>
            <ul className="mt-3 space-y-2">
              {selectedRole.permissions.map((perm, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-[12.5px] text-foreground/85">
                  <span className="grid h-4 w-4 place-items-center bg-emerald-500/10 text-emerald-600">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
