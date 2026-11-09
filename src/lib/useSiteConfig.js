import { useMatches } from "@tanstack/react-router";

/**
 * Universal hook to access the current SiteConfig loaded by the `/_site` layout route.
 * Safe for SSR and client renders. Falls back gracefully to null if outside the `/_site` tree.
 */
export function useSiteConfig() {
  try {
    const matches = useMatches();
    if (!Array.isArray(matches)) return null;
    const siteMatch = matches.find(
      (m) => m?.routeId === "/_site" || m?.id === "/_site" || m?.pathname === "/"
    );
    return siteMatch?.loaderData?.config || null;
  } catch {
    return null;
  }
}
