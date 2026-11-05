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
    const entity = context.getBase44().entities[data.entity];

    if (data.op === "get") {
      if (!data.id) return { items: [] };
      try {
        return { items: [await entity.get(data.id)] };
      } catch (error) {
        if (error?.status === 404) return { items: [] };
        throw error;
      }
    }

    try {
      if (data.op === "list") {
        const page = await entity.list(data.options || {});
        return { items: page?.items || [] };
      }

      const page = await entity.filter(data.filter || {}, data.options || {});
      return { items: page?.items || [] };
    } catch (error) {
      console.warn(`[publicSiteApi] Error reading ${data.entity} (op: ${data.op}):`, error?.message || error);
      return { items: [] };
    }
  });

const collection = (entity) => ({
  list: async (options) => readPublicContent({ data: { entity, op: "list", options } }),
  filter: async (filter, options) =>
    readPublicContent({ data: { entity, op: "filter", filter, options } }),
  get: async (id) => {
    const { items } = await readPublicContent({ data: { entity, op: "get", id } });
    return items[0] || null;
  },
});

// Same shape as the browser SDK's `entities` collection, for read-only loaders.
export const publicSiteApi = {
  entities: Object.fromEntries(PUBLIC_ENTITIES.map((name) => [name, collection(name)])),
};