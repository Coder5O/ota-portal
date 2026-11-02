import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { INSTITUTIONS } from "@/lib/institutions";

export const STRUCTURE_SLUGS = INSTITUTIONS.map((item) => item.slug);
const RECORD_TYPES = ["Meetings", "Resolutions", "Reports", "Publications", "Tasks"];

function deny(message, status = 403) {
  return Object.assign(new Error(message), { status });
}

async function audit(service, user, action, targetType, targetId, detail) {
  await service.entities.AuditLog.create({
    action,
    actor_email: user.email,
    actor_role: user.role === "admin" ? "admin" : "officer",
    target_type: targetType,
    target_id: targetId || "",
    detail: detail || "",
    outcome: "success",
  });
}

// A structure dashboard is scoped server-side: an officer reaches only the
// structure assigned to the account, an administrator reaches all of them.
function scopedSlug(user, requested) {
  if (user.role === "admin") {
    const slug = requested || STRUCTURE_SLUGS[0];
    if (!STRUCTURE_SLUGS.includes(slug)) throw deny("Unknown structure.", 400);
    return slug;
  }
  const own = user.institution_slug || "";
  if (!own) throw deny("No structure is assigned to your account. Ask the Authority's administrator to assign one.");
  if (requested && requested !== own) throw deny("Your account is assigned to a different structure.");
  return own;
}

function userView(user) {
  return {
    email: user.email || "",
    full_name: user.full_name || "",
    role: user.role || "user",
    institution_slug: user.institution_slug || "",
    officer_title: user.officer_title || "",
    approval_authority: user.approval_authority || "",
  };
}

async function rulesFor(service, slug) {
  const page = await service.entities.GovernanceRule.filter(
    { institution_slug: slug, active: true },
    { limit: 20, sort: "-updated_date" },
  );
  return page.items || [];
}

function ruleOf(rules, recordType) {
  return (rules || []).find((rule) => rule.record_type === recordType) || null;
}

// Decisions are impossible until the Authority has confirmed the rule: the
// platform never supplies a governance rule of its own.
function decideGuard(user, rule, label) {
  if (!rule || !rule.confirmed || !rule.approving_authority) {
    throw deny(
      `The ${label} decision rule for this structure has not been confirmed. A governance administrator records it under Governance rules before any approval.`,
      409,
    );
  }
  if (user.role === "admin") return rule.approving_authority;
  const caller = (user.approval_authority || "").trim().toLowerCase();
  if (!caller || caller !== rule.approving_authority.trim().toLowerCase()) {
    throw deny(`Only the ${rule.approving_authority} may decide this record.`);
  }
  return rule.approving_authority;
}

export const myInstitution = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const user = context.user;
    const isAdmin = user.role === "admin";
    const own = user.institution_slug || "";
    const slugs = isAdmin ? STRUCTURE_SLUGS : own ? [own] : [];
    const service = context.getBase44().asServiceRole;
    const rules = slugs.length
      ? await service.entities.GovernanceRule.filter({ institution_slug: { $in: slugs }, active: true }, { limit: 60 })
          .then((page) => page.items || [])
          .catch(() => [])
      : [];
    return { user: userView(user), isAdmin, slugs, hasStructure: slugs.length > 0, rules };
  });

export const institutionList = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(
    z.object({
      slug: z.string().max(80).optional().or(z.literal("")),
      kind: z.enum(["meetings", "resolutions", "tasks", "reports", "documents"]),
      status: z.string().max(40).optional().or(z.literal("")),
      q: z.string().max(120).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const queries = {
      meetings: { entity: "Meeting", search: "title", sort: "starts_at" },
      resolutions: { entity: "Resolution", search: "title", sort: "-updated_date" },
      tasks: { entity: "TaskItem", search: "title", sort: "due_date" },
      reports: { entity: "InstitutionReport", search: "title", sort: "-updated_date" },
      documents: { entity: "Document", search: "title", sort: "-effective_date" },
    };
    const spec = queries[data.kind];
    const query = { institution_slug: slug };
    if (data.status) query.status = data.status;
    if (data.q) query[spec.search] = { $regex: data.q };
    const page = await service.entities[spec.entity].filter(query, { sort: spec.sort, limit: 200 });
    return { slug, items: page.items || [] };
  });

export const institutionData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ slug: z.string().max(80).optional().or(z.literal("")) }))
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const [meetings, resolutions, tasks, reports, rules, documents, meetingsCount, tasksCount, pendingCount, approvedCount] =
      await Promise.all([
        service.entities.Meeting.filter({ institution_slug: slug, status: "Scheduled" }, { sort: "starts_at", limit: 4 }),
        service.entities.Resolution.filter(
          { institution_slug: slug, status: { $in: ["Draft", "Submitted", "Returned"] } },
          { sort: "-updated_date", limit: 5 },
        ),
        service.entities.TaskItem.filter(
          { institution_slug: slug, status: { $in: ["Open", "In Progress"] } },
          { sort: "due_date", limit: 6 },
        ),
        service.entities.InstitutionReport.filter({ institution_slug: slug }, { sort: "-updated_date", limit: 4 }),
        rulesFor(service, slug),
        service.entities.Document.filter({ institution_slug: slug }, { sort: "-created_date", limit: 4 }),
        service.entities.Meeting.count({ institution_slug: slug, status: "Scheduled" }),
        service.entities.TaskItem.count({ institution_slug: slug, status: { $in: ["Open", "In Progress"] } }),
        service.entities.Resolution.count({ institution_slug: slug, status: { $in: ["Draft", "Submitted", "Returned"] } }),
        service.entities.Resolution.count({ institution_slug: slug, status: { $in: ["Approved", "Implemented"] } }),
      ]);
    return {
      slug,
      user: userView(context.user),
      meetings: meetings.items || [],
      resolutions: resolutions.items || [],
      tasks: tasks.items || [],
      reports: reports.items || [],
      documents: documents.items || [],
      rules,
      counts: {
        meetings: meetingsCount,
        tasks: tasksCount,
        pending: pendingCount,
        approved: approvedCount,
      },
    };
  });

const meetingInput = z.object({
  id: z.string().max(80).optional(),
  slug: z.string().max(80),
  title: z.string().min(3).max(200),
  meeting_type: z.enum(["Ordinary", "Extraordinary", "Special", "Ceremonial"]),
  starts_at: z.string().min(4).max(40),
  venue: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["Scheduled", "Concluded", "Cancelled"]),
  agenda: z.array(z.string().max(300)).max(60).optional(),
  attendance: z.array(z.string().max(160)).max(300).optional(),
  apologies: z.array(z.string().max(160)).max(300).optional(),
  quorum_note: z.string().max(400).optional().or(z.literal("")),
  minutes: z.string().max(20000).optional().or(z.literal("")),
  visibility: z.enum(["internal", "public"]),
});

export const saveMeeting = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(meetingInput)
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const payload = {
      institution_slug: slug,
      title: data.title,
      meeting_type: data.meeting_type,
      starts_at: data.starts_at,
      venue: data.venue || "",
      status: data.status,
      agenda: data.agenda || [],
      attendance: data.attendance || [],
      apologies: data.apologies || [],
      quorum_note: data.quorum_note || "",
      minutes: data.minutes || "",
      visibility: data.visibility,
    };
    let record;
    if (data.id) {
      const existing = await service.entities.Meeting.get(data.id);
      if (existing.institution_slug !== slug) throw deny("This meeting belongs to another structure.");
      record = await service.entities.Meeting.update(data.id, payload);
    } else {
      record = await service.entities.Meeting.create(payload);
    }
    await audit(service, context.user, data.id ? "meeting.updated" : "meeting.recorded", "Meeting", record.id, `${slug} · ${data.title}`);
    return record;
  });

const resolutionInput = z.object({
  id: z.string().max(80).optional(),
  slug: z.string().max(80),
  title: z.string().min(3).max(200),
  text: z.string().max(20000).optional().or(z.literal("")),
  meeting_id: z.string().max(80).optional().or(z.literal("")),
  responsible_officer: z.string().max(160).optional().or(z.literal("")),
  deadline: z.string().max(40).optional().or(z.literal("")),
  visibility: z.enum(["internal", "public"]),
});

export const saveResolution = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(resolutionInput)
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const payload = {
      institution_slug: slug,
      title: data.title,
      text: data.text || "",
      meeting_id: data.meeting_id || "",
      responsible_officer: data.responsible_officer || "",
      deadline: data.deadline || "",
      visibility: data.visibility,
    };
    let record;
    if (data.id) {
      const existing = await service.entities.Resolution.get(data.id);
      if (existing.institution_slug !== slug) throw deny("This resolution belongs to another structure.");
      if (!["Draft", "Returned"].includes(existing.status)) {
        throw deny("An approved or submitted decision is a controlled record. Record a new revision instead of editing it.", 409);
      }
      record = await service.entities.Resolution.update(data.id, payload);
    } else {
      record = await service.entities.Resolution.create({ ...payload, status: "Draft", version: "1.0", versions: [] });
    }
    await audit(service, context.user, data.id ? "resolution.updated" : "resolution.recorded", "Resolution", record.id, `${slug} · ${data.title}`);
    return record;
  });

export const submitResolution = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().max(80) }))
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const existing = await service.entities.Resolution.get(data.id);
    scopedSlug(context.user, existing.institution_slug);
    if (!["Draft", "Returned"].includes(existing.status)) {
      throw deny("Only a draft or returned decision can be submitted for approval.", 409);
    }
    const record = await service.entities.Resolution.update(data.id, {
      status: "Submitted",
      submitted_by: context.user.email,
      submitted_date: new Date().toISOString(),
    });
    await audit(service, context.user, "resolution.submitted", "Resolution", data.id, existing.title);
    return record;
  });

export const decideResolution = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(80),
      decision: z.enum(["Approved", "Returned"]),
      note: z.string().max(1200).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const existing = await service.entities.Resolution.get(data.id);
    scopedSlug(context.user, existing.institution_slug);
    const rules = await rulesFor(service, existing.institution_slug);
    const authority = decideGuard(context.user, ruleOf(rules, "Resolutions"), "resolution");

    if (data.decision === "Approved") {
      const versions = Array.isArray(existing.versions) ? existing.versions : [];
      const nextVersion = `${versions.length + 1}.0`;
      const now = new Date().toISOString();
      const record = await service.entities.Resolution.update(data.id, {
        status: "Approved",
        approval_authority: authority,
        approval_date: now,
        version: nextVersion,
        decision_note: data.note || "",
        versions: [
          ...versions,
          {
            version: nextVersion,
            text: existing.text || "",
            status: "Approved",
            approval_authority: authority,
            approval_date: now,
            recorded_by: context.user.email,
            recorded_at: now,
            note: data.note || "",
          },
        ],
      });
      await audit(service, context.user, "resolution.approved", "Resolution", data.id, `${authority} · ${existing.title}`);
      return record;
    }

    const record = await service.entities.Resolution.update(data.id, {
      status: "Returned",
      decision_note: data.note || "",
      approval_authority: authority,
    });
    await audit(service, context.user, "resolution.returned", "Resolution", data.id, `${authority} · ${existing.title}`);
    return record;
  });

export const saveTask = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(80).optional(),
      slug: z.string().max(80),
      title: z.string().min(3).max(200),
      description: z.string().max(4000).optional().or(z.literal("")),
      owner_name: z.string().max(160).optional().or(z.literal("")),
      due_date: z.string().max(40).optional().or(z.literal("")),
      status: z.enum(["Open", "In Progress", "Done"]),
      resolution_id: z.string().max(80).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const payload = {
      institution_slug: slug,
      title: data.title,
      description: data.description || "",
      owner_name: data.owner_name || "",
      due_date: data.due_date || "",
      status: data.status,
      resolution_id: data.resolution_id || "",
    };
    let record;
    if (data.id) {
      const existing = await service.entities.TaskItem.get(data.id);
      if (existing.institution_slug !== slug) throw deny("This action item belongs to another structure.");
      record = await service.entities.TaskItem.update(data.id, payload);
    } else {
      record = await service.entities.TaskItem.create(payload);
    }
    await audit(service, context.user, data.id ? "task.updated" : "task.assigned", "TaskItem", record.id, `${slug} · ${data.title}`);
    return record;
  });

export const saveReport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(80).optional(),
      slug: z.string().max(80),
      title: z.string().min(3).max(200),
      period: z.string().max(120).optional().or(z.literal("")),
      summary: z.string().max(20000).optional().or(z.literal("")),
      progress: z.number().min(0).max(100).optional(),
      visibility: z.enum(["internal", "public"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const slug = scopedSlug(context.user, data.slug);
    const service = context.getBase44().asServiceRole;
    const payload = {
      institution_slug: slug,
      title: data.title,
      period: data.period || "",
      summary: data.summary || "",
      progress: data.progress ?? 0,
      visibility: data.visibility,
    };
    let record;
    if (data.id) {
      const existing = await service.entities.InstitutionReport.get(data.id);
      if (existing.institution_slug !== slug) throw deny("This report belongs to another structure.");
      if (existing.status === "Approved") throw deny("An approved report is a controlled record.", 409);
      record = await service.entities.InstitutionReport.update(data.id, payload);
    } else {
      record = await service.entities.InstitutionReport.create({ ...payload, status: "Draft" });
    }
    await audit(service, context.user, data.id ? "report.updated" : "report.prepared", "InstitutionReport", record.id, `${slug} · ${data.title}`);
    return record;
  });

export const submitReport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().max(80) }))
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const existing = await service.entities.InstitutionReport.get(data.id);
    scopedSlug(context.user, existing.institution_slug);
    if (!["Draft", "Returned"].includes(existing.status)) throw deny("This report has already been submitted.", 409);
    const record = await service.entities.InstitutionReport.update(data.id, {
      status: "Submitted",
      submitted_by: context.user.email,
      submitted_date: new Date().toISOString(),
    });
    await audit(service, context.user, "report.submitted", "InstitutionReport", data.id, existing.title);
    return record;
  });

export const decideReport = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(80),
      decision: z.enum(["Approved", "Returned"]),
      note: z.string().max(1200).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    const service = context.getBase44().asServiceRole;
    const existing = await service.entities.InstitutionReport.get(data.id);
    scopedSlug(context.user, existing.institution_slug);
    const rules = await rulesFor(service, existing.institution_slug);
    const authority = decideGuard(context.user, ruleOf(rules, "Reports"), "report");
    const now = new Date().toISOString();
    const record = await service.entities.InstitutionReport.update(data.id, {
      status: data.decision,
      decided_by: context.user.email,
      decision_note: data.note || "",
      approval_authority: authority,
      approval_date: data.decision === "Approved" ? now : "",
    });
    await audit(
      service,
      context.user,
      data.decision === "Approved" ? "report.approved" : "report.returned",
      "InstitutionReport",
      data.id,
      `${authority} · ${existing.title}`,
    );
    return record;
  });

export const governanceRules = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user.role !== "admin") throw deny("Only a governance administrator may review decision rules.");
    const page = await context
      .getBase44()
      .asServiceRole.entities.GovernanceRule.list({ sort: "institution_slug", limit: 400 });
    return { rules: page.items || [], recordTypes: RECORD_TYPES };
  });

export const saveGovernanceRule = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().max(80).optional(),
      institution_slug: z.string().max(80),
      record_type: z.enum(RECORD_TYPES),
      approving_authority: z.string().min(2).max(120),
      submitter_role: z.enum(["Structure officer", "Structure head", "Secretariat"]),
      approval_required: z.boolean(),
      confirmed: z.boolean(),
      notes: z.string().max(1200).optional().or(z.literal("")),
    }),
  )
  .handler(async ({ data, context }) => {
    if (context.user.role !== "admin") throw deny("Only a governance administrator may record rules.");
    if (!STRUCTURE_SLUGS.includes(data.institution_slug)) throw deny("Unknown structure.", 400);
    const service = context.getBase44().asServiceRole;
    const payload = {
      institution_slug: data.institution_slug,
      record_type: data.record_type,
      approving_authority: data.approving_authority,
      submitter_role: data.submitter_role,
      approval_required: data.approval_required,
      requires_confirmation: true,
      confirmed: data.confirmed,
      confirmed_by: data.confirmed ? context.user.email : "",
      confirmed_at: data.confirmed ? new Date().toISOString() : "",
      notes: data.notes || "",
      active: true,
    };
    let record;
    if (data.id) {
      record = await service.entities.GovernanceRule.update(data.id, payload);
    } else {
      const existing = await service.entities.GovernanceRule.filter(
        { institution_slug: data.institution_slug, record_type: data.record_type },
        { limit: 1 },
      );
      const found = (existing.items || [])[0];
      record = found
        ? await service.entities.GovernanceRule.update(found.id, payload)
        : await service.entities.GovernanceRule.create(payload);
    }
    await audit(
      service,
      context.user,
      data.confirmed ? "rule.confirmed" : "rule.recorded",
      "GovernanceRule",
      record.id,
      `${data.institution_slug} · ${data.record_type} · ${data.approving_authority}`,
    );
    return record;
  });