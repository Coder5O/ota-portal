import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { getCurrentUserToken } from "@/lib/firebase";
import { createEntitiesProxy, createEntityService } from "@/lib/firebase/firestore-adapter";

function parseTokenPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    // Standard base64url decoding in node/edge
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

async function resolveUserFromRequest(request) {
  try {
    const authHeader = request?.headers?.get("authorization") || request?.headers?.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    const payload = parseTokenPayload(token);
    if (!payload) return null;

    const uid = payload.sub || payload.user_id;
    if (!uid) return null;

    const userService = createEntityService("User");
    let userDoc = null;
    try {
      userDoc = await userService.get(uid);
    } catch {
      // Document may not exist in firestore yet
    }

    return {
      id: uid,
      uid,
      email: payload.email || userDoc?.email || "",
      full_name: userDoc?.full_name || payload.name || (payload.email ? payload.email.split("@")[0] : ""),
      role: userDoc?.role || "user",
      institution_slug: userDoc?.institution_slug || "",
      officer_title: userDoc?.officer_title || "",
      approval_authority: userDoc?.approval_authority || "",
      ...userDoc,
    };
  } catch (err) {
    console.error("Error resolving user from request:", err);
    return null;
  }
}

const createServerServiceClient = (user) => {
  const entities = createEntitiesProxy();
  return {
    auth: {
      me: async () => user,
    },
    entities,
    asServiceRole: {
      entities,
      users: {
        inviteUser: async () => true,
      },
    },
  };
};

// Applied to every server function by src/start.js
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    let token = null;
    if (typeof window !== "undefined") {
      try {
        token = await getCurrentUserToken();
      } catch {
        // User not signed in
      }
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  })
  .server(async ({ next }) => {
    const request = getRequest();
    const user = await resolveUserFromRequest(request);
    let serviceClient = null;
    return next({
      context: {
        user,
        getBase44: () => (serviceClient ??= createServerServiceClient(user)),
      },
    });
  });

export const base44RequestMiddleware = createMiddleware({ type: "request" }).server(async ({ next, request }) => {
  const user = await resolveUserFromRequest(request);
  let serviceClient = null;
  return next({
    context: {
      user,
      getBase44: () => (serviceClient ??= createServerServiceClient(user)),
    },
  });
});

export const requireUser = createMiddleware({ type: "function" }).server(async ({ next, context }) => {
  const user = context.user;
  if (!user) {
    setResponseStatus(401);
    throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });
  }
  return next({ context: { user } });
});

export const requireUserRoute = createMiddleware({ type: "request" }).server(async ({ next, context }) => {
  const user = context.user;
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return next({ context: { user } });
});
