import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { Section } from "@/components/site/PageParts";
import { Image } from "@/components/ui/image";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { fmtDate } from "@/lib/format";
import { paragraphs } from "@/lib/format";

export const Route = createFileRoute("/_site/news/$postId")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title || "News"} · Ovaherero Traditional Authority` },
      { name: "description", content: loaderData?.post?.excerpt || "An official communication of the Ovaherero Traditional Authority." },
    ],
  }),
  loader: async ({ params }) => {
    try {
      const post = await base44.entities.NewsPost.get(params.postId);
      if (!post || post.status !== "published") throw notFound();
      return { post };
    } catch (error) {
      if (error?.status === 404) throw notFound();
      throw notFound();
    }
  },
  component: NewsArticle,
});

function NewsArticle() {
  const { post = {} } = Route.useLoaderData() || {};

  return (
    <>
      <div className="border-b border-border bg-[hsl(var(--primary))] text-primary-foreground">
        <div className="shell py-14 sm:py-20">
          <Link to="/news" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary-foreground/60 hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" /> News & media
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[10.5px] uppercase tracking-[0.16em]">
            <span className="text-gold">{post.category}</span>
            <span className="h-px w-5 bg-primary-foreground/30" />
            <time className="text-primary-foreground/60">{fmtDate(post.published_date || post.created_date)}</time>
            {post.is_demo ? <IllustrativeBadge className="bg-white/90" /> : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-[2rem] leading-[1.12] sm:text-[3rem]">{post.title}</h1>
          {post.author ? (
            <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-primary-foreground/60">{post.author}</p>
          ) : null}
        </div>
      </div>

      <Section>
        <article className="mx-auto max-w-3xl">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              className="mb-8 aspect-[16/9] w-full object-cover"
              fittingType="fill"
            />
          ) : null}
          {post.video_url ? (
            <video controls preload="metadata" className="mb-8 aspect-video w-full bg-black">
              <source src={post.video_url} />
              Your browser does not support this video.
            </video>
          ) : null}
          {post.excerpt ? (
            <p className="mb-6 border-l-2 border-gold pl-5 font-display text-[1.3rem] leading-relaxed text-foreground/85">
              {post.excerpt}
            </p>
          ) : null}
          <div className="space-y-4">
            {paragraphs(post.body).map((text, i) => (
              <p key={i} className="text-[0.97rem] leading-[1.9] text-foreground/80">
                {text}
              </p>
            ))}
          </div>
          {paragraphs(post.body).length === 0 ? (
            <p className="text-[13px] italic text-muted-foreground">The full text of this notice is pending publication.</p>
          ) : null}
        </article>
      </Section>
    </>
  );
}
