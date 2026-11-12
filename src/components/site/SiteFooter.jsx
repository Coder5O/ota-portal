import { Link } from "@tanstack/react-router";
import { INSTITUTIONS } from "@/lib/institutions";

const COLUMNS = [
  {
    title: "The Authority",
    links: [
      { to: "/about", label: "About OTA" },
      { to: "/constitution", label: "Constitution" },
      { to: "/paramount-chief", label: "Paramount Chief" },
      { to: "/leadership", label: "Traditional Leadership" },
      { to: "/communities", label: "Traditional Communities" },
    ],
  },
  {
    title: "Institutions",
    links: [
      { to: "/institutions", label: "All Institutions" },
      ...INSTITUTIONS.slice(0, 5).map((inst) => ({ to: `/institutions/${inst.slug}`, label: inst.name })),
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/diaspora", label: "Ovaherero Diaspora" },
      { to: "/culture", label: "Culture & Heritage" },
      { to: "/projects", label: "Community Projects" },
      { to: "/news", label: "News & Media" },
      { to: "/gallery", label: "Photo & Video Gallery" },
      { to: "/events", label: "Events & Calendar" },
    ],
  },
  {
    title: "Participate",
    links: [
      { to: "/membership", label: "Membership Registration" },
      { to: "/communities", label: "Register a Community" },
      { to: "/contact", label: "Contact OTA" },
      { to: "/privacy", label: "Privacy & Data Protection" },
      { to: "/login", label: "Sign in to your portal" },
    ],
  },
];

export function SiteFooter({ config }) {
  const logoUrl = config?.logo_url || "/images/branding/ota-seal.jpeg";

  return (
    <footer className="mt-24 bg-[hsl(var(--ink))] text-[hsl(var(--background))]">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Ovaherero Traditional Authority seal"
                className="h-11 w-11 object-contain"
              />
            ) : (
              <span className="grid h-11 w-11 place-items-center border border-gold/60">
                <span className="font-display text-[0.95rem] tracking-[0.06em] text-gold">
                  {config?.monogram_text || "OTA"}
                </span>
              </span>
            )}
            <span className="font-display text-xl leading-tight">
              {config?.organisation_name || "Ovaherero Traditional Authority"}
            </span>
          </div>
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-[hsl(var(--background))]/60">
            {config?.footer_note ||
              "The official digital home of the Ovaherero Traditional Authority: its leadership, institutions, constitution, culture and communities in Namibia and across the diaspora."}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--background))]/40">
            Records marked “Illustrative” await official verification and publication.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.to}-${link.label}`}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-[hsl(var(--background))]/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-5 text-[11.5px] text-[hsl(var(--background))]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ovaherero Traditional Authority. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-gold">
              Privacy & Data Protection
            </Link>
            <Link to="/privacy" hash="accessibility" className="transition-colors hover:text-gold">
              Accessibility
            </Link>
            <Link to="/contact" className="transition-colors hover:text-gold">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
