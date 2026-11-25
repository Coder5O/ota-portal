import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Server-side reader for the public content a visitor sees.
//
// The browser SDK cannot run during server rendering (there is no request origin
// to resolve relative API calls against), so public page loaders read through
// this bounded server function instead. It is restricted to the published,
// visitor-facing entities below and always applies the caller's access rules.
const PUBLIC_ENTITIES = [
  "NewsPost",
  "Event",
  "Institution",
  "ContentBlock",
  "TraditionalCommunity",
  "Officeholder",
  "ConstitutionArticle",
  "Document",
  "SiteConfig",
  "Resolution",
  "GalleryItem",
];

const ReadInput = z.object({
  entity: z.enum(PUBLIC_ENTITIES),
  op: z.enum(["list", "filter", "get"]),
  id: z.string().optional(),
  filter: z.record(z.string(), z.any()).optional(),
  options: z
    .object({
      sort: z.string().max(60).optional(),
      limit: z.number().int().min(1).max(1000).optional(),
      cursor: z.string().optional(),
    })
    .optional(),
});

const readPublicContent = createServerFn({ method: "POST" })
  .validator(ReadInput)
  .handler(async ({ data, context }) => {
    try {
      const base44 = context?.getBase44?.();
      const entity = base44?.entities?.[data.entity];
      if (!entity) return { items: [] };

      const queryPromise = (async () => {
        if (data.op === "get") {
          if (!data.id) return { items: [] };
          try {
            const doc = await entity.get(data.id);
            return { items: doc ? [doc] : [] };
          } catch (error) {
            if (error?.status === 404) return { items: [] };
            throw error;
          }
        }
        if (data.op === "list") {
          const page = await entity.list(data.options || {});
          return { items: page?.items || [] };
        }
        const page = await entity.filter(data.filter || {}, data.options || {});
        return { items: page?.items || [] };
      })();

      // Server-side timeout so requests never hang indefinitely
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ items: [] }), 2500)
      );

      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      console.warn(`[publicSiteApi] Error reading ${data.entity} (op: ${data.op}):`, error?.message || error);
      return { items: [] };
    }
  });

const collection = (entity) => ({
  list: async (options) => {
    try {
      const res = await readPublicContent({ data: { entity, op: "list", options } });
      return { items: res?.items || [] };
    } catch (err) {
      console.warn(`[publicSiteApi] Client error in list(${entity}):`, err?.message || err);
      return { items: [] };
    }
  },
  filter: async (filter, options) => {
    try {
      const res = await readPublicContent({ data: { entity, op: "filter", filter, options } });
      return { items: res?.items || [] };
    } catch (err) {
      console.warn(`[publicSiteApi] Client error in filter(${entity}):`, err?.message || err);
      return { items: [] };
    }
  },
  get: async (id) => {
    try {
      const res = await readPublicContent({ data: { entity, op: "get", id } });
      return res?.items?.[0] || null;
    } catch (err) {
      console.warn(`[publicSiteApi] Client error in get(${entity}):`, err?.message || err);
      return null;
    }
  },
});

// Same shape as the browser SDK's `entities` collection, for read-only loaders.
export const publicSiteApi = {
  entities: Object.fromEntries(PUBLIC_ENTITIES.map((name) => [name, collection(name)])),
};
