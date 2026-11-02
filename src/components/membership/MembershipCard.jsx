import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { categoryLabel } from "@/lib/institutions";

function statusTone(status) {
  if (status === "Active") return "border-emerald-700/30 bg-emerald-700/10 text-emerald-800";
  if (status === "Suspended") return "border-amber-700/30 bg-amber-700/10 text-amber-800";
  return "border-border bg-secondary text-foreground/70";
}

export function MembershipCard({ member, institution, showVerifyLink = true }) {
  const [verifyUrl, setVerifyUrl] = useState("");

  useEffect(() => {
    if (!member?.membership_number) return;
    const number = encodeURIComponent(member.membership_number);
    setVerifyUrl(`${window.location.origin}/verify?m=${number}`);
  }, [member?.membership_number]);

  if (!member) return null;

  const issuing = institution || "Ovaherero Traditional Authority";
  const valid = member.status === "Active";

  return (
    <div className="overflow-hidden border border-gold/30 bg-card shadow-sm">
      <div className="bg-[hsl(var(--primary))] px-6 py-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.22em] text-gold">Ovaherero Traditional Authority</p>
            <p className="mt-1 font-display text-2xl leading-tight">Membership card</p>
            <p className="mt-0.5 text-[11px] text-primary-foreground/60">{issuing}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.18em] text-primary-foreground/50">Number</p>
            <p className="font-mono text-[12.5px]">{member.membership_number}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-6 py-5 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Member</p>
            <p className="mt-1 text-[15px]">
              {member.title ? `${member.title} ` : ""}
              {member.full_name}
            </p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Category</p>
            <p className="mt-1 text-[12.5px]">{categoryLabel(member.category)}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Community or structure</p>
            <p className="mt-1 text-[12.5px]">{member.community_name || "—"}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Issued</p>
            <p className="mt-1 text-[12.5px]">{member.joined_date || "—"}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Valid until</p>
            <p className="mt-1 text-[12.5px]">{member.review_date || "—"}</p>
          </div>
          <div>
            <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Validity</p>
            <p
              className={`mt-1 inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${statusTone(
                member.status,
              )}`}
            >
              {valid ? <BadgeCheck className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {valid ? "Valid" : member.status}
            </p>
          </div>
        </div>

        {verifyUrl ? (
          <div className="flex flex-col items-center justify-center gap-1.5 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(verifyUrl)}`}
              alt={`Verification code for ${member.membership_number}`}
              className="h-[92px] w-[92px]"
              fittingType="fit"
            />
            <p className="text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">Scan to verify</p>
          </div>
        ) : null}
      </div>

      {showVerifyLink && verifyUrl ? (
        <div className="border-t border-border px-6 py-3">
          <Link
            to="/verify"
            search={{ m: member.membership_number }}
            className="text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
          >
            Open the public verification page
          </Link>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            The verification page confirms the number, name, category and validity only. Application documents and
            personal contact details are never shown.
          </p>
        </div>
      ) : null}
    </div>
  );
}