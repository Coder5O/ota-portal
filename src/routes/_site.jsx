import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { publicSiteApi as base44 } from "@/lib/public-site-api";

export const Route = createFileRoute("/_site")({
  loader: async () => {
    const page = await base44.entities.SiteConfig.list({ sort: "-created_date", limit: 1 });
    return { config: page.items?.[0] || null };
  },
  component: SiteWrapper,
});

function SiteWrapper() {
  const { config } = Route.useLoaderData();
  return <SiteLayout config={config} />;
}