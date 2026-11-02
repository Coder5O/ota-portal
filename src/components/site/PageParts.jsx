import { Image } from "@/components/ui/image";
import { IllustrativeBadge } from "@/components/site/IllustrativeBadge";
import { paragraphs } from "@/lib/format";

export function Section({ eyebrow, title, intro, action, children, tone = "paper" }) {
  return (
    <section className={tone === "muted" ? "bg-secondary/50 py-16 lg:py-20" : "py-16 lg:py-20"}>
      <div className="shell">
        {(eyebrow || title || action) && (
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
              {title ? <h2 className="mt-2.5 text-[1.85rem] leading-tight sm:text-[2.35rem]">{title}</h2> : null}
              {intro ? <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-foreground/65">{intro}</p> : null}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function EmptyNote({ children }) {
  return (
    <div className="border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

export function ProseBlocks({ blocks, empty }) {
  if (!blocks || blocks.length === 0) {
    return (
      <EmptyNote>
        {empty ||
          "No content has been published for this page yet. The OTA administration publishes page content from the Administrator Console."}
      </EmptyNote>
    );
  }

  return (
    <div className="space-y-14">
      {blocks.map((block, index) => (
        <article
          key={block.id}
          className={`grid gap-8 ${block.image_url ? "lg:grid-cols-2 lg:items-start" : ""} ${index % 2 === 1 && block.image_url ? "lg:[&>figure]:order-first" : ""}`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {block.tag ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--oxblood))]">
                  {block.tag}
                </span>
              ) : null}
              {block.is_demo ? <IllustrativeBadge /> : null}
            </div>
            <h3 className="mt-2 text-[1.6rem] leading-snug sm:text-[1.85rem]">{block.heading}</h3>
            <div className="mt-4 space-y-4">
              {paragraphs(block.body).map((text, i) => (
                <p key={i} className="text-[0.95rem] leading-[1.85] text-foreground/80">
                  {text}
                </p>
              ))}
            </div>
            {block.bullets?.length ? (
              <ul className="mt-5 space-y-2.5 border-l border-gold/40 pl-5">
                {block.bullets.map((item) => (
                  <li key={item} className="text-[0.92rem] leading-relaxed text-foreground/75">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {block.image_url ? (
            <figure className="overflow-hidden border border-border bg-secondary">
              <Image
                src={block.image_url}
                alt={block.heading}
                className="aspect-[4/3] w-full object-cover"
                fittingType="fill"
              />
            </figure>
          ) : null}
        </article>
      ))}
    </div>
  );
}