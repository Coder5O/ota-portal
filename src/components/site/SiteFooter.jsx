import { Link } from "@tanstack/react-router";
import { INSTITUTIONS } from "@/lib/institutions";

const COLUMNS = [
  {
    title: "About Us",
    links: [
      { to: "/about", label: "About OTA Overview" },
      { to: "/about#identity", label: "1. Our Identity" },
      { to: "/about#vision", label: "2. Vision" },
      { to: "/about#mission", label: "3. Mission" },
      { to: "/about#core-values", label: "4. Our Core Values" },
      { to: "/about#strategic-thrust", label: "5. Strategic Thrust" },
      { to: "/culture", label: "Culture & Living Heritage" },
    ],
  },
  {
    title: "Governance",
    links: [
      { to: "/paramount-chief", label: "Office of the PC" },
      { to: "/leadership#commissioners", label: "Commissioners" },
      { to: "/institutions/chiefs-council", label: "Chiefs Council" },
      { to: "/institutions/senate", label: "Senate" },
      { to: "/chapters", label: "Chapters & Traditional Seats" },
      { to: "/membership", label: "Membership Registration" },
      { to: "/constitution", label: "OTA Constitution" },
      { to: "/paramount-chiefs", label: "Paramount Chiefs Succession" },
    ],
  },
  {
    title: "Institutions",
    links: [
      { to: "/institutions", label: "Overview: All Institutions" },
      { to: "/institutions/women-council", label: "OWA (Women Association)" },
      { to: "/institutions/youth-council", label: "OYAC (Youth Council)" },
      { to: "/institutions/red-flag-leadership", label: "Red Flag (Otjiserandu)" },
      { to: "/institutions/white-flag", label: "White Flag (Otjimbandi)" },
      { to: "/oggf", label: "OGGF (Genocide Foundation)" },
      { to: "/institutions/cultural-council", label: "Cultural Council" },
    ],
  },
  {
    title: "Library & Events",
    links: [
      { to: "/library", label: "Library & Archive" },
      { to: "/library#history", label: "History of the Nation" },
      { to: "/library#publications", label: "Authorised Publications" },
      { to: "/events", label: "Events & Convocations" },
      { to: "/gallery", label: "Photo & Video Gallery" },
      { to: "/news", label: "News & Media Releases" },
      { to: "/contact", label: "Contact OTA" },
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
