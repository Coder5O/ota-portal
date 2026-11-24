import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, ExternalLink, File, FileText, Film, Paperclip } from "lucide-react";
import { publicSiteApi as base44 } from "@/lib/public-site-api";
import { Section } from "@/components/site/PageParts";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { fmtDate, paragraphs } from "@/lib/format";
import { CURATED_MILESTONE_NEWS } from "@/lib/curated-milestones-news";

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes)) || Number(bytes) <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

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
      if (post && post.status === "published") return { post };
    } catch {
      // ignore and check curated list
    }

    const curated = CURATED_MILESTONE_NEWS.find(
      (item) => item.id === params.postId || item.slug === params.postId
    );
    if (curated) return { post: curated };

    throw notFound();
  },
  component: NewsArticle,
});

function NewsArticle() {
  const { post = {} } = Route.useLoaderData() || {};

  const { imageAttachments, documentAttachments } = useMemo(() => {
    const raw = post.attachments || post.files || [];
    const list = Array.isArray(raw)
      ? raw
          .map((item, idx) => {
            if (!item) return null;
            if (typeof item === "string") {
              const rawName = item.split("/").pop()?.split("?")[0] || `Attachment ${idx + 1}`;
              const isImg = item.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i) || item.startsWith("data:image");
              return {
                name: decodeURIComponent(rawName),
                url: item,
                type: isImg ? "image" : "document",
              };
            }
            return item;
          })
          .filter(Boolean)
      : [];

    const images = list.filter(
      (item) => item.type === "image" || (item.url && item.url.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)),
    );
    const documents = list.filter(
      (item) => item.type !== "image" && (!item.url || !item.url.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)),
    );

    return { imageAttachments: images, documentAttachments: documents };
  }, [post.attachments, post.files]);

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

          {/* Attached Documents / Files Section */}
          {documentAttachments.length > 0 && (
            <div className="mt-12 border border-border bg-secondary/35 p-6 sm:p-7">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Paperclip className="h-4 w-4 text-gold" />
                <h2 className="font-display text-lg text-foreground">Official Documents &amp; Attachments</h2>
              </div>
              <ul className="divide-y divide-border/60">
                {documentAttachments.map((doc, idx) => (
                  <li key={idx} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-4 last:pb-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-background">
                        {doc.type === "pdf" || doc.name?.toLowerCase().endsWith(".pdf") ? (
                          <FileText className="h-5 w-5 text-[hsl(var(--oxblood))]" />
                        ) : doc.type === "video" ? (
                          <Film className="h-5 w-5 text-gold" />
                        ) : (
                          <File className="h-5 w-5 text-[hsl(var(--primary))]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-foreground">{doc.name || "Official Document"}</p>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {doc.type === "pdf" || doc.name?.toLowerCase().endsWith(".pdf")
                            ? "PDF Document"
                            : doc.type === "video"
                              ? "Video Recording"
                              : "Attached File"}
                          {doc.size ? ` · ${formatBytes(doc.size)}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-none shrink-0 border-gold/70 text-[11px] uppercase tracking-[0.14em] hover:bg-gold hover:text-[hsl(var(--ink))]">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.name}>
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attached Photographs / Gallery Section */}
          {imageAttachments.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="font-display text-xl text-foreground">Photographs &amp; Media Gallery</h2>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {imageAttachments.length} {imageAttachments.length === 1 ? "photo" : "photos"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {imageAttachments.map((img, i) => (
                  <a
                    key={i}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-[4/3] overflow-hidden border border-border bg-card shadow-sm"
                  >
                    <img
                      src={img.url}
                      alt={img.name || post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end justify-between p-3.5 text-white">
                      <span className="truncate text-[12px] font-medium max-w-[80%]">{img.name || "Enlarge image"}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gold" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      </Section>
    </>
  );
}
