import { Image } from "@/components/ui/image";

export function PageHero({ eyebrow, title, intro, image, imageAlt = "", children }) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-primary-foreground">
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt}
            fittingType="fill"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))]/85 to-[hsl(var(--primary))]/40" />
        </>
      ) : (
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:22px_22px]" />
      )}
      <div className="relative shell py-16 sm:py-24">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-4 max-w-3xl text-[2.25rem] leading-[1.05] sm:text-5xl lg:text-[3.4rem]">{title}</h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-primary-foreground/80 sm:text-base">{intro}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}