import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { myInstitution } from "@/lib/institution-fns";
import { INSTITUTIONS } from "@/lib/institutions";

export function structureLabel(slug) {
  return INSTITUTIONS.find((item) => item.slug === slug)?.name || slug || "Structure";
}

export function structureNative(slug) {
  return INSTITUTIONS.find((item) => item.slug === slug)?.native || "";
}

// The structure a dashboard page works on, resolved from the URL and the
// officer's own assignment. The server re-checks it on every call.
export function useInstitutionContext() {
  const search = useSearch({ strict: false });
  const load = useServerFn(myInstitution);
  const query = useQuery({
    queryKey: ["institution-context"],
    queryFn: () => load(),
    staleTime: 60000,
  });
  const meta = query.data;
  const requested = typeof search?.structure === "string" ? search.structure : "";
  const fallback = meta?.user?.institution_slug || meta?.slugs?.[0] || "";
  const structure = requested && (meta?.slugs || []).includes(requested) ? requested : fallback;
  return { meta, structure, isLoading: query.isLoading, error: query.error, slack: query.isLoading };
}