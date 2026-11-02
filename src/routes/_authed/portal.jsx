import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarDays, FileText, LogOut, Mail, Pencil, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { myPortal, submitEnquiry, updateMyProfile } from "@/lib/ota-fns";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { ApplicationHistory } from "@/components/membership/ApplicationHistory";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusPill } from "@/components/admin/StatusPill";
import { INSTITUTIONS, categoryLabel } from "@/lib/institutions";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/portal")({
  component: PortalPage,
});

function PortalPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [correction, setCorrection] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  const portal = useQuery({ queryKey: ["my-portal"], queryFn: () => myPortal() });

  const saveProfile = useMutation({
    mutationFn: () => updateMyProfile({ data: profile }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-portal"] });
      toast.success("Your details have been updated.");
      setEditing(false);
    },
    onError: (error) => toast.error(error?.message || "Your details could not be saved."),
  });

  const markRead = useMutation({
    mutationFn: async (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-portal"] }),
  });

  const sendCorrection = async () => {
    if (message.trim().length < 10) {
      toast.error("Please describe the correction you are requesting.");
      return;
    }
    setSending(true);
    try {
      await submitEnquiry({
        data: {
          name: portal.data?.member?.full_name || portal.data?.user?.full_name || "Member",
          email: portal.data?.user?.email,
          subject: "Profile correction request",
          message,
          kind: "Profile correction",
        },
      });
      toast.success("Your correction request has been sent to the office.");
      setMessage("");
      setCorrection(false);
      queryClient.invalidateQueries({ queryKey: ["my-portal"] });
    } catch (error) {
      toast.error("The request could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (portal.isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-20 text-[13px] text-muted-foreground">Loading your portal…</div>;
  }

  const data = portal.data;
  const member = data?.member;
  const unread = (data?.notifications || []).filter((n) => !n.is_read);
  const institution = INSTITUTIONS.find((i) => i.slug === member?.institution_slug || i.slug === data?.user?.institution_slug);

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-10 w-10 place-items-center border border-gold/60 bg-[hsl(var(--primary))] font-display text-[11px] text-primary-foreground">
              OTA
            </Link>
            <div className="leading-tight">
              <p className="font-display text-lg">Member portal</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{data?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data?.user?.role === "admin" ? (
              <Button asChild variant="outline" className="rounded-none text-[11.5px] uppercase tracking-[0.14em]">
                <Link to="/admin">Administrator console</Link>
              </Button>
            ) : null}
            {data?.user?.institution_slug ? (
              <Button asChild variant="outline" className="rounded-none text-[11.5px] uppercase tracking-[0.14em]">
                <Link to="/institution" search={{ structure: data.user.institution_slug }}>
                  Structure dashboard
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-none text-[11.5px] uppercase tracking-[0.14em]">
              <Link to="/">Public website</Link>
            </Button>
            <Button variant="ghost" className="rounded-none text-[11.5px]" onClick={() => logout()}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Welcome, {member?.full_name || data?.user?.full_name}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {member
            ? "Your membership record, announcements and correspondence in one place."
            : "Your account is active. No approved membership record is linked to this email address yet."}
        </p>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            {member ? (
              <>
                {data?.settings?.membership_card_enabled === false ? null : (
                  <MembershipCard member={member} institution={institution?.name} />
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-none text-[11px] uppercase tracking-[0.14em]"
                    onClick={() => {
                      setProfile({
                        phone: member.phone || "",
                        region: member.region || "",
                        country: member.country || "",
                        community_name: member.community_name || "",
                      });
                      setEditing(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3 w-3" /> Update my details
                  </Button>
                  <Button variant="outline" className="rounded-none text-[11px] uppercase tracking-[0.14em]" onClick={() => setCorrection(true)}>
                    Request a profile correction
                  </Button>
                </div>
              </>
            ) : (
              <div className="border border-border bg-card p-6">
                <p className="eyebrow">Membership</p>
                <p className="mt-3 text-[13px] leading-relaxed text-foreground/75">
                  No membership record is linked to this account yet. If you have applied, your application appears
                  below. Approved members receive a membership number and card.
                </p>
                <Button asChild className="mt-4 rounded-none bg-[hsl(var(--primary))] text-[11px] uppercase tracking-[0.14em]">
                  <Link to="/membership">Apply for membership</Link>
                </Button>
              </div>
            )}

            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <FileText className="h-4 w-4 text-gold" /> My applications
                </h2>
                <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {(data?.applications || []).length} record{(data?.applications || []).length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="divide-y divide-border">
                {(data?.applications || []).length === 0 ? (
                  <li className="px-5 py-6 text-[12.5px] text-muted-foreground">No application is linked to your account.</li>
                ) : (
                  (data?.applications || []).map((app) => (
                    <li key={app.id} className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-[11.5px] text-muted-foreground">{app.reference}</p>
                          <p className="text-[13px]">{categoryLabel(app.category)}</p>
                        </div>
                        <StatusPill status={app.status} />
                      </div>
                      {app.information_request ? (
                        <p className="mt-2 border-l-2 border-gold/60 pl-3 text-[12px] leading-relaxed text-foreground/70">
                          Information required: {app.information_request}
                        </p>
                      ) : null}
                      {app.decision_reason ? (
                        <p className="mt-2 text-[12px] leading-relaxed text-foreground/60">{app.decision_reason}</p>
                      ) : null}
                      <ApplicationHistory
                        events={(data?.history || []).filter((event) => event.application_id === app.id).reverse()}
                      />
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <Mail className="h-4 w-4 text-gold" /> My enquiries
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {(data?.enquiries || []).length === 0 ? (
                  <li className="px-5 py-6 text-[12.5px] text-muted-foreground">
                    You have not submitted an enquiry. <Link to="/contact" className="underline">Contact the office</Link>.
                  </li>
                ) : (
                  (data?.enquiries || []).map((enquiry) => (
                    <li key={enquiry.id} className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px]">{enquiry.subject || enquiry.kind}</p>
                        <StatusPill status={enquiry.status} />
                      </div>
                      <p className="mt-1 text-[11.5px] text-muted-foreground">{fmtDateTime(enquiry.created_date)}</p>
                      {enquiry.response ? (
                        <p className="mt-2 rounded-sm bg-secondary/60 px-3 py-2 text-[12px] leading-relaxed text-foreground/75">
                          {enquiry.response}
                        </p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <Bell className="h-4 w-4 text-gold" /> Notifications
                </h2>
                <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--primary))]">
                  {unread.length} new
                </span>
              </div>
              <ul className="divide-y divide-border">
                {(data?.notifications || []).length === 0 ? (
                  <li className="px-5 py-6 text-[12.5px] text-muted-foreground">No notifications yet.</li>
                ) : (
                  (data?.notifications || []).map((note) => (
                    <li key={note.id} className={`px-5 py-3.5 ${note.is_read ? "" : "bg-gold/5"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13px] font-medium">{note.title}</p>
                          {note.body ? (
                            <p className="mt-1 text-[12px] leading-relaxed text-foreground/70">{note.body}</p>
                          ) : null}
                          <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                            {note.category} · {fmtDate(note.created_date)}
                          </p>
                        </div>
                        {!note.is_read ? (
                          <button
                            type="button"
                            onClick={() => markRead.mutate(note.id)}
                            className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[hsl(var(--primary))]"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {institution ? (
              <div className="border border-border bg-card p-5">
                <p className="eyebrow">Your structure</p>
                <p className="mt-2 font-display text-xl">{institution.name}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">{data?.user?.officer_title || member?.title}</p>
                <Link
                  to={`/institutions/${institution.slug}`}
                  className="mt-3 inline-block text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]"
                >
                  Open structure page
                </Link>
                <p className="mt-3 border-t border-border pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
                  Meetings, resolutions and action items of your structure are administered by the Authority's office.
                </p>
              </div>
            ) : null}

            <div className="border border-border bg-card">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="flex items-center gap-2 font-display text-lg">
                  <CalendarDays className="h-4 w-4 text-gold" /> Upcoming events
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {(data?.events || []).length === 0 ? (
                  <li className="px-5 py-6 text-[12.5px] text-muted-foreground">No published events.</li>
                ) : (
                  (data?.events || []).map((event) => (
                    <li key={event.id} className="px-5 py-3.5">
                      <p className="text-[13px]">{event.title}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {fmtDate(event.starts_at)} · {event.venue || "Venue to be confirmed"}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              <div className="border-t border-border px-5 py-3">
                <Link to="/events" className="text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))]">
                  Full calendar
                </Link>
              </div>
            </div>

            <div className="border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-[12px] font-medium">
                <ShieldCheck className="h-4 w-4 text-gold" /> Your privacy
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                Only you and authorised administrators can see your records. Read the{" "}
                <Link to="/privacy" className="underline">privacy notice</Link>.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {correction ? (
        <Dialog open={correction} onOpenChange={setCorrection}>
          <DialogContent className="max-w-lg rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Request a profile correction</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                Describe what should change. The office reviews the request and updates your record where the change is
                verified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Member</Label>
                <Input value={data?.user?.email || ""} readOnly className="mt-1.5 rounded-none bg-secondary/60 text-[13px]" />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Correction requested</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="mt-1.5 rounded-none text-[13px]" />
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="outline" className="rounded-none" onClick={() => setCorrection(false)}>
                  Cancel
                </Button>
                <Button className="rounded-none bg-[hsl(var(--primary))]" disabled={sending} onClick={sendCorrection}>
                  {sending ? "Sending…" : "Send request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {editing && profile ? (
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent className="max-w-lg rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Update my details</DialogTitle>
              <DialogDescription className="text-[12.5px]">
                Contact and affiliation details you can keep current yourself. For any other change, such as your name
                or community record, request a profile correction.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Telephone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1.5 rounded-none text-[13px]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Country</Label>
                  <Input
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="mt-1.5 rounded-none text-[13px]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Region</Label>
                  <Input
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    className="mt-1.5 rounded-none text-[13px]"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Community or chapter
                  </Label>
                  <Input
                    value={profile.community_name}
                    onChange={(e) => setProfile({ ...profile, community_name: e.target.value })}
                    className="mt-1.5 rounded-none text-[13px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button variant="outline" className="rounded-none" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-none bg-[hsl(var(--primary))]"
                  disabled={saveProfile.isPending}
                  onClick={() => saveProfile.mutate()}
                >
                  {saveProfile.isPending ? "Saving…" : "Save details"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}