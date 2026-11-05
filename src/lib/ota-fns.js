import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { CATEGORY_VALUES, DEFAULT_AUTHORITIES, INSTITUTIONS, categoryLabel } from "@/lib/institutions";

const CATEGORIES = CATEGORY_VALUES;

const optionalText = (max) => z.string().max(max).optional().or(z.literal(""));

function reference() {
  const year = new Date().getFullYear();
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const code = Array.from(bytes, (b) => b.toString(36).toUpperCase().padStart(2, "0")).join("").slice(0, 5);
  return `OTA-${year}-${code}`;
}

function documentsOf(application) {
  const stored = Array.isArray(application?.documents) ? application.documents : [];
  const uris = Array.isArray(application?.document_uris) ? application.document_uris : [];
  const known = new Set(stored.map((doc) => doc?.uri));
  const missing = uris
    .filter((uri) => uri && !known.has(uri))
    .map((uri) => ({ uri, name: String(uri).split("/").pop() || "Supporting document", status: "" }));
  return [...stored, ...missing];
}

async function audit(service, entry) {
  await service.entities.AuditLog.create({
    action: entry.action,
    actor_email: entry.actor_email || "public",
    actor_role: entry.actor_role || "anonymous",
    target_type: entry.target_type || "",
    target_id: entry.target_id || "",
    detail: entry.detail || "",
    outcome: entry.outcome || "success",
  });
}

// One immutable line in the application's status history.
async function recordEvent(service, entry) {
  await service.entities.ApplicationEvent.create({
    application_id: entry.application_id,
    application_reference: entry.application_reference || "",
    applicant_email: entry.applicant_email || "",
    action: entry.action,
    from_status: entry.from_status || "",
    to_status: entry.to_status || "",
    reason: entry.reason || "",
    actor_email: entry.actor_email || "public",
    actor_role: entry.actor_role || "anonymous",
    authority: entry.authority || "",
    document_name: entry.document_name || "",
    document_status: entry.document_status || "",
  });
}

// The approval authority is configuration, never a decision: a rule only says
// who may decide applications of a given type.
async function approvalRule(service, category) {
  try {
    const page = await service.entities.ApprovalRule.filter(
      { registration_type: category, active: true },
      { limit: 1, sort: "-updated_date" },
    );
    const rule = page.items?.[0];
    if (rule) return rule;
  } catch (error) {
    // No rule configured yet: fall through to the default authority.
  }
  return {
    registration_type: category,
    authority_name: DEFAULT_AUTHORITIES[category] || "OTA Executive",
    approver_title: "",
    requires_documents: false,
    enforce_authority: false,
    notes: "",
  };
}

const applicationSchema = z.object({
  full_name: z.string().min(2).max(120),
  preferred_name: optionalText(120),
  email: z.string().email().max(160),
  phone: optionalText(40),
  category: z.enum(CATEGORIES),
  country: z.string().max(80).optional().or(z.literal("")),
  region: optionalText(80),
  community_name: optionalText(140),
  diaspora_chapter: optionalText(140),
  purpose: z.string().min(10).max(1500),
  title: optionalText(120),
  jurisdiction: optionalText(160),
  appointment_basis: optionalText(800),
  term_start: optionalText(40),
  term_end: optionalText(40),
  documents: z
    .array(z.object({ uri: z.string().max(600), name: z.string().max(200).optional() }))
    .max(8)
    .optional(),
  document_uris: z.array(z.string().max(600)).max(8).optional(),
  consent: z.literal(true),
});

// Public intake: creates a reference-numbered application. It never confers
// membership, leadership recognition or office.
export const submitApplication = createServerFn({ method: "POST" })
  .validator(applicationSchema)
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const email = data.email.trim().toLowerCase();

    const existing = await service.entities.MemberApplication.filter(
      { email, category: data.category },
      { limit: 5, sort: "-created_date" },
    );
    const active = (existing.items || []).find(
      (item) => !["Rejected", "Archived"].includes(item.status),
    );
    if (active) {
      return { duplicate: true, status: active.status, reference: active.reference, authority: null };
    }

    const documents = (data.documents || [])
      .filter((doc) => doc?.uri)
      .map((doc) => ({
        uri: doc.uri,
        name: doc.name || String(doc.uri).split("/").pop() || "Supporting document",
        status: "",
        note: "",
        reviewed_by: "",
        reviewed_at: "",
      }));
    const documentUris = documents.length
      ? documents.map((doc) => doc.uri)
      : data.document_uris || [];

    const rule = await approvalRule(service, data.category);
    const ref = reference();

    const record = await service.entities.MemberApplication.create({
      ...data,
      documents,
      document_uris: documentUris,
      email,
      reference: ref,
      status: "Submitted",
      approval_authority: rule.authority_name,
    });

    await recordEvent(service, {
      application_id: record.id,
      application_reference: ref,
      applicant_email: email,
      action: "submitted",
      to_status: "Submitted",
      authority: rule.authority_name,
      reason: "Application received by the Authority.",
    });
    await recordEvent(service, {
      application_id: record.id,
      application_reference: ref,
      applicant_email: email,
      action: "confirmation_issued",
      from_status: "Submitted",
      to_status: "Submitted",
      authority: rule.authority_name,
      reason: `Confirmation ${ref} issued to the applicant.`,
    });

    await service.entities.Notification.create({
      recipient_email: email,
      recipient_name: data.full_name,
      title: "Application received",
      body: `Your application ${ref} has been received. The ${rule.authority_name} considers ${categoryLabel(
        data.category,
      ).toLowerCase()} applications.`,
      category: "Application",
      link: "/portal",
    });

    await audit(service, {
      action: "application.submitted",
      target_type: "MemberApplication",
      target_id: record.id,
      detail: `${ref} · ${data.category}`,
    });

    return { duplicate: false, reference: ref, status: "Submitted", authority: rule.authority_name };
  });

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(120),
      email: z.string().email().max(160),
      phone: optionalText(40),
      subject: z.string().min(3).max(160),
      message: z.string().min(10).max(3000),
      kind: z
        .enum(["General enquiry", "Profile correction", "Document request", "Membership query", "Media request"])
        .optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const record = await service.entities.Enquiry.create({
      ...data,
      email: data.email.trim().toLowerCase(),
      kind: data.kind || "General enquiry",
      status: "New",
    });
    await audit(service, {
      action: "enquiry.received",
      target_type: "Enquiry",
      target_id: record.id,
      detail: data.subject,
    });
    return { ok: true };
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      event_id: z.string().min(1).max(100),
      event_title: z.string().max(200).optional(),
      name: z.string().min(2).max(120),
      email: z.string().email().max(160),
      phone: optionalText(40),
      organisation: optionalText(160),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const record = await service.entities.EventRegistration.create({
      ...data,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      created_date: new Date().toISOString(),
      status: "Confirmed",
    });
    await audit(service, {
      action: "event.registered",
      target_type: "EventRegistration",
      target_id: record.id,
      detail: `${data.name} registered for ${data.event_title || data.event_id}`,
    });
    return { ok: true, id: record.id };
  });

const decisionSchema = z.object({
  id: z.string().min(1).max(80),
  action: z.enum(["approve", "reject", "request_info", "under_review", "suspend", "archive", "reactivate"]),
  reason: z.string().max(1500).optional(),
  grantPortalAccess: z.boolean().optional(),
  institution_slug: z.string().max(80).optional(),
});

export const decideApplication = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(decisionSchema)
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may decide an application."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const application = await service.entities.MemberApplication.get(data.id);
    if (!application) throw Object.assign(new Error("Application not found."), { status: 404 });

    const rule = await approvalRule(service, application.category);
    const assigned = context.user.approval_authority || "";
    // The Authority may bind a registration type to one approval authority. An
    // officer assigned elsewhere cannot decide it; an unassigned (super)
    // administrator retains oversight so the register is never immobilised.
    if (rule.enforce_authority && assigned && assigned !== rule.authority_name) {
      throw Object.assign(
        new Error(`Applications of this type are decided by the ${rule.authority_name}.`),
        { status: 403 },
      );
    }

    const now = new Date().toISOString();
    const decidedBy = context.user.email;
    const patch = { decided_by: decidedBy, approval_authority: rule.authority_name };

    if (data.action === "approve") {
      if (rule.requires_documents && documentsOf(application).length === 0) {
        throw Object.assign(
          new Error("This registration type requires at least one supporting document before approval."),
          { status: 400 },
        );
      }

      const year = new Date().getFullYear();
      let membershipNumber = "";
      for (let attempt = 0; attempt < 5 && !membershipNumber; attempt += 1) {
        const count = await service.entities.Member.count({});
        const candidate = `OTA/M/${year}/${String((count || 0) + 1 + attempt).padStart(4, "0")}`;
        const clash = await service.entities.Member.filter({ membership_number: candidate }, { limit: 1 });
        if (!(clash.items || []).length) membershipNumber = candidate;
      }
      if (!membershipNumber) throw Object.assign(new Error("A membership number could not be issued."), { status: 409 });

      const member = await service.entities.Member.create({
        membership_number: membershipNumber,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone || "",
        category: application.category,
        title: application.title || "",
        community_name: application.community_name || "",
        institution_slug: data.institution_slug || "",
        country: application.country || "",
        region: application.region || "",
        application_id: application.id,
        application_reference: application.reference,
        joined_date: now.slice(0, 10),
        review_date: `${year + 1}-${now.slice(5, 10)}`,
        approval_authority: rule.authority_name,
        approval_date: now.slice(0, 10),
        status: "Active",
      });

      await service.entities.MemberApplication.update(application.id, {
        ...patch,
        status: "Approved",
        decided_date: now,
        review_notes: data.reason || application.review_notes || "",
      });

      await recordEvent(service, {
        application_id: application.id,
        application_reference: application.reference,
        applicant_email: application.email,
        action: "approved",
        from_status: application.status,
        to_status: "Approved",
        reason: data.reason || "",
        actor_email: decidedBy,
        actor_role: "admin",
        authority: rule.authority_name,
      });

      await service.entities.Notification.create({
        recipient_email: application.email,
        recipient_name: application.full_name,
        title: "Membership application approved",
        body: `Your application ${application.reference} has been approved by the ${rule.authority_name}. Your membership number is ${membershipNumber}.`,
        category: "Membership",
        link: "/portal",
      });

      if (data.grantPortalAccess) {
        await base44Invite(service, application.email);
      }

      await audit(service, {
        action: "application.approved",
        actor_email: decidedBy,
        actor_role: "admin",
        target_type: "MemberApplication",
        target_id: application.id,
        detail: `${application.reference} → ${membershipNumber} · ${rule.authority_name}`,
      });

      return { status: "Approved", member_id: member.id, membership_number: membershipNumber };
    }

    const map = {
      reject: { status: "Rejected", field: { decision_reason: data.reason || "" } },
      request_info: { status: "More Information Required", field: { information_request: data.reason || "" } },
      under_review: { status: "Under Review", field: { review_notes: data.reason || "" } },
      suspend: { status: "Suspended", field: { decision_reason: data.reason || "" } },
      archive: { status: "Archived", field: { review_notes: data.reason || "" } },
      reactivate: { status: "Under Review", field: { review_notes: data.reason || "" } },
    }[data.action];

    await service.entities.MemberApplication.update(application.id, {
      ...patch,
      status: map.status,
      decided_date: now,
      ...map.field,
    });

    await recordEvent(service, {
      application_id: application.id,
      application_reference: application.reference,
      applicant_email: application.email,
      action: data.action,
      from_status: application.status,
      to_status: map.status,
      reason: data.reason || "",
      actor_email: decidedBy,
      actor_role: "admin",
      authority: rule.authority_name,
    });

    await service.entities.Notification.create({
      recipient_email: application.email,
      recipient_name: application.full_name,
      title: `Application ${map.status.toLowerCase()}`,
      body: data.reason
        ? `Your application ${application.reference} is now marked “${map.status}”. ${data.reason}`
        : `Your application ${application.reference} is now marked “${map.status}”.`,
      category: "Application",
      link: "/portal",
    });

    await audit(service, {
      action: `application.${data.action}`,
      actor_email: decidedBy,
      actor_role: "admin",
      target_type: "MemberApplication",
      target_id: application.id,
      detail: `${application.reference} → ${map.status}`,
    });

    return { status: map.status };
  });

const documentSchema = z.object({
  id: z.string().min(1).max(80),
  uri: z.string().min(1).max(600),
  status: z.enum(["Verified", "Rejected", "Awaiting clarification"]),
  note: z.string().max(600).optional(),
});

export const reviewApplicationDocument = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(documentSchema)
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may verify documents."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const application = await service.entities.MemberApplication.get(data.id);
    if (!application) throw Object.assign(new Error("Application not found."), { status: 404 });

    const now = new Date().toISOString();
    const documents = documentsOf(application).map((doc) =>
      doc.uri === data.uri
        ? {
            ...doc,
            status: data.status,
            note: data.note || "",
            reviewed_by: context.user.email,
            reviewed_at: now,
          }
        : doc,
    );
    const target = documents.find((doc) => doc.uri === data.uri);
    if (!target) throw Object.assign(new Error("Document not found on this application."), { status: 404 });

    await service.entities.MemberApplication.update(application.id, {
      documents,
      document_uris: documents.map((doc) => doc.uri),
    });
    await recordEvent(service, {
      application_id: application.id,
      application_reference: application.reference,
      applicant_email: application.email,
      action: `document_${data.status.toLowerCase().replace(/\s+/g, "_")}`,
      from_status: application.status,
      to_status: application.status,
      reason: data.note || "",
      actor_email: context.user.email,
      actor_role: "admin",
      document_name: target.name,
      document_status: data.status,
    });
    await audit(service, {
      action: "application.document_reviewed",
      actor_email: context.user.email,
      actor_role: "admin",
      target_type: "MemberApplication",
      target_id: application.id,
      detail: `${application.reference} · ${target.name} → ${data.status}`,
    });
    return { documents };
  });

async function base44Invite(service, email) {
  try {
    await service.users.inviteUser(email, "user");
    return true;
  } catch (error) {
    // The applicant may already hold an account; approval still stands.
    return false;
  }
}

export const assignOfficer = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      user_id: z.string().min(1).max(80),
      institution_slug: z.string().max(80).optional().or(z.literal("")),
      officer_title: z.string().max(120).optional().or(z.literal("")),
      approval_authority: z.string().max(120).optional().or(z.literal("")),
      invite_email: z.string().email().max(160).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may assign an office."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;

    if (data.invite_email) {
      await base44Invite(service, data.invite_email);
    }
    if (data.user_id && data.user_id !== "new") {
      await service.entities.User.update(data.user_id, {
        institution_slug: data.institution_slug || "",
        officer_title: data.officer_title || "",
        approval_authority: data.approval_authority || "",
      });
    }
    await audit(service, {
      action: "officer.assigned",
      actor_email: context.user.email,
      actor_role: "admin",
      target_type: "User",
      target_id: data.user_id,
      detail: `${data.institution_slug || "none"} · ${data.officer_title || ""} · ${data.approval_authority || ""}`,
    });
    return { ok: true };
  });

export const updateMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().min(1).max(80),
      status: z.enum(["Active", "Suspended", "Archived"]),
      reason: z.string().max(800).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may change membership status."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const member = await service.entities.Member.get(data.id);
    await service.entities.Member.update(data.id, {
      status: data.status,
      status_reason: data.reason || "",
    });
    if (member.application_id) {
      const mirrored = data.status === "Active" ? "Approved" : data.status === "Suspended" ? "Suspended" : "Archived";
      await service.entities.MemberApplication.update(member.application_id, {
        status: mirrored,
        decision_reason: data.reason || "",
        decided_by: context.user.email,
        decided_date: new Date().toISOString(),
      });
      await recordEvent(service, {
        application_id: member.application_id,
        application_reference: member.application_reference,
        applicant_email: member.email,
        action: data.status === "Active" ? "reactivated" : data.status.toLowerCase(),
        to_status: mirrored,
        reason: data.reason || "",
        actor_email: context.user.email,
        actor_role: "admin",
        authority: member.approval_authority || "",
      });
    }
    await service.entities.Notification.create({
      recipient_email: member.email,
      recipient_name: member.full_name,
      title: `Membership status: ${data.status}`,
      body: data.reason || `Your membership record is now marked ${data.status}.`,
      category: "Membership",
      link: "/portal",
    });
    await audit(service, {
      action: `member.${data.status.toLowerCase()}`,
      actor_email: context.user.email,
      actor_role: "admin",
      target_type: "Member",
      target_id: data.id,
      detail: `${member.membership_number} → ${data.status}`,
    });
    return { ok: true, status: data.status };
  });

// A member may correct only contact and affiliation fields on their own record.
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      phone: z.string().max(40).optional().or(z.literal("")),
      region: z.string().max(80).optional().or(z.literal("")),
      country: z.string().max(80).optional().or(z.literal("")),
      community_name: z.string().max(140).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const email = context.user.email.trim().toLowerCase();
    const page = await service.entities.Member.filter({ email }, { limit: 1, sort: "-created_date" });
    const member = page.items?.[0];
    if (!member) throw Object.assign(new Error("No membership record is linked to this account."), { status: 404 });

    const patch = {
      phone: data.phone ?? member.phone ?? "",
      region: data.region ?? member.region ?? "",
      country: data.country ?? member.country ?? "",
      community_name: data.community_name ?? member.community_name ?? "",
    };
    await service.entities.Member.update(member.id, patch);
    await audit(service, {
      action: "member.profile_updated",
      actor_email: context.user.email,
      actor_role: "user",
      target_type: "Member",
      target_id: member.id,
      detail: "Contact and affiliation details updated by the member.",
    });
    return { ok: true, member: { ...member, ...patch } };
  });

function institutionName(slug) {
  return INSTITUTIONS.find((inst) => inst.slug === slug)?.name || "Ovaherero Traditional Authority";
}

// Public card verification: a deliberate, limited projection. Application
// documents, contact details and decision notes are never returned here.
export const verifyMembership = createServerFn({ method: "GET" })
  .validator(z.object({ number: z.string().min(3).max(80) }))
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const page = await service.entities.Member.filter(
      { membership_number: data.number.trim() },
      { limit: 1 },
    );
    const member = page.items?.[0];
    if (!member) return { found: false };

    const today = new Date().toISOString().slice(0, 10);
    const expired = member.review_date ? member.review_date < today : false;
    return {
      found: true,
      membership_number: member.membership_number,
      full_name: member.full_name,
      title: member.title || "",
      category: member.category || "",
      community_name: member.community_name || "",
      institution: institutionName(member.institution_slug),
      status: member.status,
      valid: member.status === "Active" && !expired,
      joined_date: member.joined_date || "",
      valid_until: member.review_date || "",
      approval_authority: member.approval_authority || "",
    };
  });

// The member's own dashboard payload — scoped strictly to the caller's email.
export const myPortal = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const service = context.getBase44().asServiceRole;
    const email = context.user.email.trim().toLowerCase();

    const [memberPage, applications, notifications, events, enquiries, settingsPage] = await Promise.all([
      service.entities.Member.filter({ email }, { limit: 1, sort: "-created_date" }),
      service.entities.MemberApplication.filter({ email }, { limit: 20, sort: "-created_date" }),
      service.entities.Notification.filter({ recipient_email: context.user.email }, { limit: 30, sort: "-created_date" }),
      service.entities.Event.filter({ status: "published" }, { limit: 6, sort: "starts_at" }),
      service.entities.Enquiry.filter({ email }, { limit: 20, sort: "-created_date" }),
      service.entities.SiteConfig.list({ limit: 1, sort: "-updated_date" }),
    ]);

    const applicationIds = (applications.items || []).map((item) => item.id);
    const history = applicationIds.length
      ? await service.entities.ApplicationEvent.filter(
          { application_id: { $in: applicationIds } },
          { limit: 100, sort: "-created_date" },
        )
      : { items: [] };

    return {
      user: {
        full_name: context.user.full_name,
        email: context.user.email,
        role: context.user.role,
        institution_slug: context.user.institution_slug || "",
        officer_title: context.user.officer_title || "",
        approval_authority: context.user.approval_authority || "",
      },
      member: memberPage.items?.[0] || null,
      applications: applications.items || [],
      notifications: notifications.items || [],
      events: events.items || [],
      enquiries: enquiries.items || [],
      history: history.items || [],
      settings: settingsPage.items?.[0] || null,
    };
  });

export const changeUserRole = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      user_id: z.string().min(1),
      new_role: z.enum(["user", "officer", "admin"]),
      reason: z.string().min(1).max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may change user roles."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const targetUser = await service.entities.User.get(data.user_id);
    if (!targetUser) throw Object.assign(new Error("User account not found."), { status: 404 });
    const oldRole = targetUser.role || "user";
    await service.entities.User.update(data.user_id, { role: data.new_role });
    await audit(service, {
      action: "USER_ROLE_CHANGED",
      actor_email: context.user.email,
      actor_role: context.user.role,
      target_type: "User",
      target_id: data.user_id,
      detail: `Role changed from ${oldRole} to ${data.new_role}. Reason: ${data.reason}`,
      outcome: "success",
    });
    return { success: true };
  });

export const suspendUserAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      user_id: z.string().min(1),
      reason: z.string().min(1).max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may suspend user accounts."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const targetUser = await service.entities.User.get(data.user_id);
    if (!targetUser) throw Object.assign(new Error("User account not found."), { status: 404 });
    await service.entities.User.update(data.user_id, { status: "suspended" });
    await audit(service, {
      action: "USER_ACCOUNT_SUSPENDED",
      actor_email: context.user.email,
      actor_role: context.user.role,
      target_type: "User",
      target_id: data.user_id,
      detail: `Account suspended for ${targetUser.email}. Reason: ${data.reason}`,
      outcome: "success",
    });
    return { success: true };
  });

export const reactivateUserAccount = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      user_id: z.string().min(1),
      reason: z.string().min(1).max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an authorised administrator may reactivate user accounts."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;
    const targetUser = await service.entities.User.get(data.user_id);
    if (!targetUser) throw Object.assign(new Error("User account not found."), { status: 404 });
    await service.entities.User.update(data.user_id, { status: "active" });
    await audit(service, {
      action: "USER_ACCOUNT_REACTIVATED",
      actor_email: context.user.email,
      actor_role: context.user.role,
      target_type: "User",
      target_id: data.user_id,
      detail: `Account reactivated for ${targetUser.email}. Reason: ${data.reason}`,
      outcome: "success",
    });
    return { success: true };
  });

export const submitHeritageContribution = createServerFn({ method: "POST" })
  .validator(
    z.object({
      contributor_name: z.string().min(2).max(120),
      contributor_email: z.string().email(),
      contributor_phone: optionalText(40),
      category: z.enum(["oral_history", "traditional_knowledge", "language", "symbols", "historical_places", "ceremonies"]),
      title: z.string().min(3).max(200),
      description: z.string().min(10).max(5000),
      source_tradition: optionalText(300),
      cultural_restrictions: optionalText(500),
      permission_granted: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const item = await service.entities.HeritageSubmission.create({
      ...data,
      status: "pending_review",
      submitted_date: new Date().toISOString(),
    });
    await audit(service, {
      action: "HERITAGE_CONTRIBUTION_SUBMITTED",
      actor_email: data.contributor_email,
      actor_role: "contributor",
      target_type: "HeritageSubmission",
      target_id: item.id,
      detail: `New submission: "${data.title}" under ${data.category}`,
      outcome: "success",
    });
    return { success: true, id: item.id };
  });

export const submitDiasporaRegistration = createServerFn({ method: "POST" })
  .validator(
    z.object({
      community_name: z.string().min(2).max(150),
      country: z.string().min(2).max(100),
      region: optionalText(100),
      leader_name: optionalText(120),
      leader_title: optionalText(100),
      contact_email: z.string().email(),
      contact_phone: optionalText(40),
      description: optionalText(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const item = await service.entities.TraditionalCommunity.create({
      name: data.community_name,
      country: data.country,
      region: data.region || "",
      leader_name: data.leader_name || "",
      leader_title: data.leader_title || "",
      contact_email: data.contact_email,
      contact_phone: data.contact_phone || "",
      description: data.description || "",
      kind: "diaspora",
      recognition_status: "Pending",
      status: "pending",
    });
    await audit(service, {
      action: "DIASPORA_CHAPTER_REGISTERED",
      actor_email: data.contact_email,
      actor_role: "diaspora_applicant",
      target_type: "TraditionalCommunity",
      target_id: item.id,
      detail: `Diaspora community registration: "${data.community_name}" (${data.country})`,
      outcome: "success",
    });
    return { success: true, id: item.id };
  });

export const seedTestAccounts = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Only an administrator may seed test accounts."), { status: 403 });
    }
    const service = context.getBase44().asServiceRole;

    const testAccounts = [
      {
        email: "superadmin@ota-test.local",
        full_name: "OTA Super Administrator",
        role: "admin",
        status: "active",
        officer_title: "Chief Technology & Governance Officer",
      },
      {
        email: "registrar@ota-test.local",
        full_name: "Membership Registrar Officer",
        role: "officer",
        status: "active",
        approval_authority: "Membership Registrar",
        officer_title: "Registrar General",
      },
      {
        email: "inst-admin@ota-test.local",
        full_name: "Chiefs Council Secretary",
        role: "officer",
        status: "active",
        institution_slug: "chiefs-council",
        officer_title: "Council Secretary",
        approval_authority: "Chiefs Council",
      },
      {
        email: "editor@ota-test.local",
        full_name: "Authorized Content Editor",
        role: "officer",
        status: "active",
        officer_title: "Editorial & Communications Officer",
      },
      {
        email: "member@ota-test.local",
        full_name: "Katjitundu Tjihenuna (Member)",
        role: "user",
        status: "active",
      },
    ];

    const results = [];
    for (const acc of testAccounts) {
      const existing = await service.entities.User.filter({ email: acc.email }, { limit: 1 });
      if (!existing.items || existing.items.length === 0) {
        const created = await service.entities.User.create(acc);
        results.push({ email: acc.email, status: "created", id: created.id });
      } else {
        results.push({ email: acc.email, status: "already_exists", id: existing.items[0].id });
      }
    }

    await audit(service, {
      action: "TEST_ACCOUNTS_SEEDED",
      actor_email: context.user.email,
      actor_role: context.user.role,
      detail: `Seeded ${results.filter((r) => r.status === "created").length} test accounts.`,
      outcome: "success",
    });

    return { results };
  });
