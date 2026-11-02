import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./client";

export const COLLECTION_MAP = {
  User: "users",
  Member: "members",
  MemberApplication: "member_applications",
  ApplicationEvent: "application_events",
  ApprovalRule: "approval_rules",
  GovernanceRule: "governance_rules",
  AuditLog: "audit_logs",
  Institution: "institutions",
  InstitutionReport: "institution_reports",
  Meeting: "meetings",
  Resolution: "resolutions",
  TaskItem: "task_items",
  Document: "documents",
  Enquiry: "enquiries",
  Event: "events",
  EventRegistration: "event_registrations",
  NewsPost: "news_posts",
  Notification: "notifications",
  Officeholder: "officeholders",
  TraditionalCommunity: "traditional_communities",
  ConstitutionArticle: "constitution_articles",
  ContentBlock: "content_blocks",
  SiteConfig: "site_config",
  Asset: "assets",
  DisciplinaryRecord: "disciplinary_records",
  HeritageSubmission: "heritage_submissions",
};

export function getCollectionName(entity) {
  return COLLECTION_MAP[entity] || entity.toLowerCase() + "s";
}

/**
 * Creates a collection service mimicking the Base44 entity CRUD interface
 */
export function createEntityService(entityName) {
  const colName = getCollectionName(entityName);

  return {
    get: async (id) => {
      if (!id) return null;
      const ref = doc(db, colName, String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const notFound = new Error("Document not found");
        notFound.status = 404;
        throw notFound;
      }
      return { id: snap.id, ...snap.data() };
    },

    list: async (options = {}) => {
      const constraints = [];
      const colRef = collection(db, colName);

      if (options.sort) {
        const isDesc = options.sort.startsWith("-");
        const sortField = isDesc ? options.sort.slice(1) : options.sort;
        constraints.push(orderBy(sortField, isDesc ? "desc" : "asc"));
      }

      if (options.limit && typeof options.limit === "number") {
        constraints.push(firestoreLimit(options.limit));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { items };
    },

    filter: async (filterObj = {}, options = {}) => {
      const colRef = collection(db, colName);
      const constraints = [];
      const inMemoryFilters = [];

      for (const [key, val] of Object.entries(filterObj)) {
        if (val === undefined || val === null || val === "") continue;

        if (typeof val === "object" && val !== null) {
          if (val.$in && Array.isArray(val.$in)) {
            if (val.$in.length > 0) {
              // Firestore supports 'in' with up to 30 elements
              constraints.push(where(key, "in", val.$in.slice(0, 30)));
            } else {
              return { items: [] };
            }
          } else if (val.$regex) {
            // Firestore does not natively support regex - evaluate in memory
            try {
              const reg = new RegExp(val.$regex, val.$options || "");
              inMemoryFilters.push((item) => reg.test(String(item[key] || "")));
            } catch {
              // Fallback to substring match if regex is invalid
              const searchStr = String(val.$regex).toLowerCase();
              inMemoryFilters.push((item) => String(item[key] || "").toLowerCase().includes(searchStr));
            }
          }
        } else {
          constraints.push(where(key, "==", val));
        }
      }

      // If we have in-memory regex filters, we should not enforce strict Firestore sort
      // if it conflicts with missing composite indexes; otherwise apply sort.
      if (options.sort && inMemoryFilters.length === 0) {
        const isDesc = options.sort.startsWith("-");
        const sortField = isDesc ? options.sort.slice(1) : options.sort;
        constraints.push(orderBy(sortField, isDesc ? "desc" : "asc"));
      }

      if (options.limit && inMemoryFilters.length === 0) {
        constraints.push(firestoreLimit(options.limit));
      }

      let items = [];
      let inMemorySortNeeded = false;

      try {
        const q = query(colRef, ...constraints);
        const snap = await getDocs(q);
        items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err) {
        // If Firestore throws "failed-precondition" (missing composite index),
        // fallback gracefully: query by where clauses only, then sort and limit in memory.
        if (
          (err?.code === "failed-precondition" || String(err?.message || "").includes("requires an index")) &&
          options.sort
        ) {
          console.warn(`[FirestoreAdapter] Missing composite index for ${colName}. Falling back to in-memory sort/limit:`, err.message);
          const whereOnly = [];
          for (const [key, val] of Object.entries(filterObj)) {
            if (val === undefined || val === null || val === "") continue;
            if (typeof val === "object" && val !== null) {
              if (val.$in && Array.isArray(val.$in) && val.$in.length > 0) {
                whereOnly.push(where(key, "in", val.$in.slice(0, 30)));
              }
            } else {
              whereOnly.push(where(key, "==", val));
            }
          }
          const fallbackQ = query(colRef, ...whereOnly);
          const fallbackSnap = await getDocs(fallbackQ);
          items = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          inMemorySortNeeded = true;
        } else {
          throw err;
        }
      }

      // Apply in-memory filters (e.g. for regex search)
      if (inMemoryFilters.length > 0) {
        items = items.filter((item) => inMemoryFilters.every((fn) => fn(item)));
      }

      // Sort in memory if needed
      if (options.sort && (inMemoryFilters.length > 0 || inMemorySortNeeded)) {
        const isDesc = options.sort.startsWith("-");
        const sortField = isDesc ? options.sort.slice(1) : options.sort;
        items.sort((a, b) => {
          const valA = a[sortField] ?? "";
          const valB = b[sortField] ?? "";
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // Limit in memory if needed
      if (options.limit && (inMemoryFilters.length > 0 || inMemorySortNeeded)) {
        items = items.slice(0, options.limit);
      }

      return { items };
    },

    create: async (data) => {
      const colRef = collection(db, colName);
      const now = new Date().toISOString();
      const payload = {
        ...data,
        created_date: data.created_date || now,
        updated_date: now,
      };
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, ...payload };
    },

    update: async (id, data) => {
      if (!id) throw new Error("ID required for update");
      const ref = doc(db, colName, String(id));
      const payload = {
        ...data,
        updated_date: new Date().toISOString(),
      };
      await updateDoc(ref, payload);
      const snap = await getDoc(ref);
      return { id: snap.id, ...snap.data() };
    },

    delete: async (id) => {
      if (!id) throw new Error("ID required for delete");
      const ref = doc(db, colName, String(id));
      await deleteDoc(ref);
      return { id, deleted: true };
    },

    count: async (filterObj = {}) => {
      const colRef = collection(db, colName);
      const constraints = [];

      for (const [key, val] of Object.entries(filterObj)) {
        if (val === undefined || val === null || val === "") continue;
        if (typeof val === "object" && val.$in && Array.isArray(val.$in)) {
          if (val.$in.length > 0) constraints.push(where(key, "in", val.$in.slice(0, 30)));
        } else if (typeof val !== "object") {
          constraints.push(where(key, "==", val));
        }
      }

      const q = query(colRef, ...constraints);
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    },
  };
}

/**
 * Creates the entities object matching the Base44 entity interface
 */
export function createEntitiesProxy() {
  const cache = new Map();

  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (typeof prop !== "string") return undefined;
        if (!cache.has(prop)) {
          cache.set(prop, createEntityService(prop));
        }
        return cache.get(prop);
      },
    },
  );
}
