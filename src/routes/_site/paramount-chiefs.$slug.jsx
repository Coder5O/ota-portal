import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Crown, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";

/**
 * Static data for all Paramount Chiefs of the Ovaherero.
 * Source: Paramount Chiefs of the Ovaherero Report (2024).
 * Each chief has a unique slug used for routing.
 */
export const PARAMOUNT_CHIEFS = [
  {
    slug: "maharero-ka-tjamuaha",
    name: "Maharero kaTjamuaha",
    title: "First Paramount Chief",
    reign: "1863 – 1890",
    born: "c. 1820, Okahandja",
    died: "1890, Okahandja",
    era: "Founding Era",
    eraColor: "gold",
    photo: "/images/heritage/paramount-chief-ceremonial-dress.jpg",
    photoCredit: "Historical engraving, Hugo von François, Nama und Damara (1896) · Public domain via Wikimedia Commons",
    teaser:
      "First Paramount Chief of the Ovaherero. Maharero consolidated the Herero polity, repelled the Oorlam invasion of 1863, and presided over the early German colonial era.",
    biography: [
      "Maharero kaTjamuaha was the first Paramount Chief (Ombára Otjitambi) of the Ovaherero, a title inaugurated in 1863 to unify the Herero clans against external threats. Born circa 1820 as the son of Chief Tjamuaha of Okahandja, Maharero rose to prominence through both lineage and military prowess.",
      "In 1863 he decisively repelled the invasion forces of Jan Jonker Afrikaner's Oorlam confederacy, a victory that cemented his authority across the Herero polity and marked the founding moment of the unified paramount chieftaincy.",
      "In 1885, under growing German colonial pressure, Maharero signed a protection treaty with Imperial Germany. However, as colonial encroachments intensified, he resumed hostilities, refusing full subjugation. His leadership set the template of principled resistance that would define his successors.",
      "Maharero died in Okahandja in 1890 and was succeeded by his eldest son, Samuel Katjikuumeb (Samuel Maharero), who would lead the Ovaherero through the most catastrophic period of their history.",
    ],
    keyFacts: [
      "Founded the unified Paramount Chieftaincy in 1863",
      "Repelled Jan Jonker Afrikaner's Oorlam forces at Okahandja",
      "Signed the German protection treaty of 1885",
      "Father of Paramount Chief Samuel Maharero",
    ],
    legacy:
      "Maharero is honoured as the architect of Ovaherero political unity. His establishment of the Paramount Chieftaincy created the institutional foundation that preserved Ovaherero identity through genocide, exile, and independence.",
  },
  {
    slug: "samuel-maharero",
    name: "Samuel Katjikuumeb",
    nameAlt: "Samuel Maharero",
    title: "Paramount Chief & Wartime Leader",
    reign: "1890 – 1917 (died 1923)",
    born: "1856, Okahandja",
    died: "14 March 1923, Serowe, Bechuanaland (now Botswana)",
    reburied: "August 1923, Okahandja",
    era: "Resistance & Genocide Era",
    eraColor: "primary",
    photo: "/images/heritage/samuel-maharero-portrait.jpg",
    photoCredit: "Historical photograph · Wikimedia Commons, open source record",
    teaser:
      "Led the 1904 Herero uprising against German colonial rule. Survived the genocide and died in exile, but was reinterred at Okahandja in 1923 — the moment that inaugurated the annual Red Flag Pilgrimage.",
    biography: [
      "Samuel Katjikuumeb, known to history as Samuel Maharero, was born in 1856 and succeeded his father as Paramount Chief in 1890. He initially cooperated with German colonial authorities, navigating a precarious peace as settlers encroached on Herero grazing lands.",
      "By 1904, colonial dispossessions, forced labour, and systemic violence had made resistance inevitable. Samuel commanded the Herero uprising of January 1904 against German colonial rule — a war that Germany prosecuted with genocidal intent under General Lothar von Trotha's Vernichtungsbefehl (extermination order) of October 1904.",
      "After the defeat at the Battle of Ohamakari (Waterberg, August 1904), Samuel led thousands of survivors in a desperate flight across the Omaheke desert into the Bechuanaland Protectorate (modern Botswana). The 1904–1908 genocide killed an estimated 60,000–80,000 Herero — over 80% of the population.",
      "Though weakened and in exile, Samuel maintained Herero unity and customary authority. He died on 14 March 1923 in Serowe. His reburial at Okahandja in August 1923, witnessed by thousands, inaugurated the annual Red Flag Pilgrimage (Otjiserandu) — an unbroken covenant of remembrance now over 100 years old.",
      "Samuel Maharero is a National Hero of the Republic of Namibia.",
    ],
    keyFacts: [
      "Led the 1904 Herero uprising against German colonial rule",
      "Survived the Ohamakari (Waterberg) battle and the desert retreat",
      "Died in exile in Serowe, Bechuanaland, 14 March 1923",
      "Reburied at Okahandja in August 1923, inaugurating the Red Flag Pilgrimage",
      "Declared a National Hero of Namibia",
    ],
    legacy:
      "Samuel Maharero's reburial at Okahandja created the living pilgrimage tradition that sustains Ovaherero identity to this day. The annual Red Flag Day, attended by tens of thousands, is a direct continuation of the covenant he embodied.",
  },
  {
    slug: "hosea-kutako",
    name: "Hosea Katjikururume Komombumbi Kutako",
    nameAlt: "Ombara Hosea Kutako",
    title: "Paramount Chief · Father of Namibian Nationalism",
    reign: "1920 – 1970",
    born: "1870",
    died: "18 July 1970 (aged c. 100)",
    era: "Nationalist Era",
    eraColor: "gold",
    photo: "/images/heritage/hosea-kutako-memorial.jpg",
    photoCredit: "Memorial image · OTA archive",
    teaser:
      "Survived the 1904 genocide as a prisoner of war and rose to lead the Ovaherero for 50 years. Founded the Herero Chiefs' Council, petitioned the UN for Namibian independence, and co-founded SWANU. Called the father of Namibian nationalism.",
    biography: [
      "Hosea Katjikururume Komombumbi Kutako was born in 1870. As a young man he witnessed and survived the 1904 genocide as a prisoner of war, an experience that defined his lifelong commitment to justice and self-determination.",
      "In 1920, following the deaths of Samuel Maharero and the interregnum of the South African mandate period, Kutako was chosen Paramount Chief of all Herero. His elevation came at a time when South Africa had been granted administration of South West Africa and was implementing policies of racial segregation.",
      "Kutako founded and chaired the Herero Chiefs' Council in 1945, creating a formal institutional structure for Ovaherero governance under occupation. He became the most prominent voice for Namibian self-determination, petitioning first the League of Nations and then the United Nations Committee on South West Africa for independence.",
      "He co-founded the South West Africa National Union (SWANU) in 1959 and later supported the National Unity Democratic Organisation (NUDO). Despite South African efforts to suppress his leadership, Kutako remained the moral and political centre of Namibian resistance for half a century.",
      "Hosea Kutako died on 18 July 1970 at approximately 100 years of age. His death prompted the transfer of paramount leadership to his nephew Clemens Kapuuo.",
    ],
    keyFacts: [
      "Survived the 1904–1908 genocide as a prisoner of war",
      "Chosen Paramount Chief in 1920",
      "Founded the Herero Chiefs' Council (1945)",
      "Petitioned the League of Nations and United Nations for Namibian independence",
      "Co-founded SWANU (1959) and supported NUDO",
      "Served as Paramount Chief for 50 years (1920–1970)",
    ],
    legacy:
      "Hosea Kutako is universally recognised as the father of Namibian nationalism. His petitions to the UN laid the groundwork for the international legal campaign that ultimately resulted in Namibian independence in 1990. He is honoured at the Hosea Kutako International Airport in Windhoek.",
  },
  {
    slug: "clemens-kapuuo",
    name: "Clemens Mutuurunge Kapuuo",
    title: "Paramount Chief & Anti-Apartheid Leader",
    reign: "1970 – 1978",
    born: "1923",
    died: "27 March 1978, Windhoek (assassinated)",
    era: "Resistance Era",
    eraColor: "primary",
    photo: "/images/heritage/paramount-chief-ceremonial-dress.jpg",
    photoCredit: "Portrait photograph · NBC Namibia, open source record",
    teaser:
      "Nephew of Hosea Kutako and his successor as Paramount Chief. A prominent anti-apartheid politician and first president of the Turnhalle Alliance, Kapuuo was assassinated in 1978.",
    biography: [
      "Clemens Mutuurunge Kapuuo was born in 1923, the nephew of Paramount Chief Hosea Kutako. He emerged as a prominent political figure during the South African occupation of Namibia, combining the role of traditional leader with active political resistance.",
      "Upon Kutako's death in 1970, Kapuuo became Paramount Chief of the Ovaherero and simultaneously assumed the political leadership of the Herero people within the South West African Bantustan system, though he consistently opposed apartheid policies.",
      "Kapuuo was a founding figure and first president of the multi-ethnic Turnhalle Alliance in 1969, an early attempt to forge a non-racial democratic future for Namibia. He also led the Ovaherero Representatives Organisation (ORO), seeking constitutional reform.",
      "His leadership was marked by the tension between seeking pragmatic political change within existing structures and principled resistance to South African colonialism. He maintained close contact with the Ovaherero diaspora and advocated for genocide recognition.",
      "Clemens Kapuuo was assassinated by unknown assailants on 27 March 1978 in Windhoek. The circumstances of his murder were never fully resolved. He was succeeded as Paramount Chief by Kuaima Riruako.",
    ],
    keyFacts: [
      "Nephew and designated successor of Hosea Kutako",
      "Paramount Chief 1970–1978",
      "First president of the Turnhalle Alliance (1969)",
      "Led the Ovaherero Representatives Organisation",
      "Assassinated in Windhoek, 27 March 1978",
    ],
    legacy:
      "Clemens Kapuuo's short tenure as Paramount Chief was marked by courageous resistance to apartheid. His assassination shocked the Namibian independence movement and strengthened international pressure on South Africa. He is remembered as a bridge builder and a martyr of the liberation struggle.",
  },
  {
    slug: "kuaima-riruako",
    name: "Kuaima Isaac Riruako",
    nameAlt: "Ombara Kuaima Riruako",
    title: "Paramount Chief · Pioneer of Genocide Restitution",
    reign: "1978 – 2014",
    born: "1935 (born Issaskar Kakuremdiro)",
    died: "2 June 2014, Windhoek",
    era: "Post-Independence Era",
    eraColor: "gold",
    photo: "/images/heritage/kuaima-riruako.jpg",
    photoCredit: "Portrait photograph (2006) · Bries / Wikimedia Commons, CC BY-SA 3.0 / GFDL",
    teaser:
      "Longest-serving Paramount Chief in modern history. Led the Ovaherero through Namibian independence (1990), pressed Germany for genocide reparations, and served as a member of the Namibian Parliament under NUDO.",
    biography: [
      "Kuaima Isaac Riruako was born in 1935 as Issaskar Kakuremdiro and was adopted into the Tjamuaha–Maharero royal line. He assumed the Paramount Chieftaincy immediately after the assassination of Clemens Kapuuo in March 1978, at one of the most turbulent moments in Namibian history.",
      "Riruako led the Herero Chiefs' Council and entered Namibian electoral politics as a member of the National Unity Democratic Organisation (NUDO). After Namibia's independence in 1990, he served as a member of the National Assembly, using parliamentary platform to advocate for Ovaherero interests.",
      "One of the defining causes of his tenure was the campaign for German reparations for the 1904–1908 genocide. Riruako led international advocacy efforts, including legal proceedings in US and European courts, demanding acknowledgment and restitution from Germany for what scholars now recognise as the first genocide of the 20th century.",
      "His tenure of 36 years (1978–2014) made him the longest-serving Paramount Chief in the modern account. Throughout independence and the democratic era, he maintained the constitutional and customary authority of the Ovaherero Traditional Authority and preserved continuity of the sacred chieftaincy.",
      "Kuaima Riruako died in Windhoek on 2 June 2014. He was succeeded by Vekuii Reinhard Rukoro.",
    ],
    keyFacts: [
      "Assumed chieftaincy immediately after Kapuuo's assassination (1978)",
      "Led the Ovaherero through Namibian independence (1990)",
      "Member of the Namibian National Assembly under NUDO",
      "Spearheaded the international campaign for German genocide reparations",
      "Longest-serving Paramount Chief in modern history (36 years)",
      "Died in Windhoek, 2 June 2014",
    ],
    legacy:
      "Kuaima Riruako placed the Ovaherero genocide on the international agenda and forced Germany to eventually acknowledge the killings as genocide in 2021. His decades of advocacy paved the way for the Namibia–Germany reconciliation declaration, though the Ovaherero community continues to press for direct reparations.",
  },
  {
    slug: "vekuii-rukoro",
    name: "Vekuii Reinhard Rukoro",
    title: "Paramount Chief · Jurist & Genocide Advocate",
    reign: "2014 – 2021",
    born: "1954",
    died: "18 June 2021 (COVID-19)",
    era: "Contemporary Era",
    eraColor: "primary",
    photo: "/images/heritage/vekuii-rukoro.jpg",
    photoCredit: "Press photograph (2018) · Don Emmert / AFP / Getty Images via Die Zeit",
    teaser:
      "Lawyer and former Attorney-General of Namibia who became Paramount Chief in 2014. Reinvigorated the genocide reparations campaign with international legal action and died during the COVID-19 pandemic in 2021.",
    biography: [
      "Vekuii Reinhard Rukoro was born in 1954 and built a distinguished legal career before entering traditional leadership. He served as Attorney-General of Namibia, bringing forensic rigour and international legal expertise to the highest offices of the republic.",
      "In September 2014, following the death of Kuaima Riruako, Rukoro was selected as Paramount Chief of the Ovaherero. He immediately set about unifying the community and reinvigorating the struggle for genocide reparations.",
      "Rukoro was a leading figure in taking Germany to US federal courts, arguing that the 1904–1908 genocide violated early international law and that the descendants of survivors were entitled to direct participation in reparation negotiations — not just the Namibian government. Though the courts ultimately ruled they lacked jurisdiction, the case attracted global attention.",
      "He worked closely with the Ovaherero Global Genocide Foundation (OGGF) and international human rights bodies to press Germany and the international community for meaningful restitution. His legal background gave the reparations campaign new strategic depth.",
      "Vekuii Rukoro died on 18 June 2021 of COVID-19. The Otjikaiva Memorial in Okahandja was rededicated in his honour. His death precipitated a contested succession that remains unresolved.",
    ],
    keyFacts: [
      "Former Attorney-General of the Republic of Namibia",
      "Became Paramount Chief in September 2014",
      "Led US federal court action against Germany for genocide reparations",
      "Strengthened the OGGF international advocacy network",
      "Died of COVID-19, 18 June 2021",
      "Otjikaiva Memorial, Okahandja, rededicated in his honour",
    ],
    legacy:
      "Rukoro transformed the genocide reparations campaign from a political claim into a formal international legal contest. Though Germany's 2021 'Declaration of Recognition' fell short of the Ovaherero demands for direct reparations, his pressure was instrumental in securing that acknowledgment.",
  },
  {
    slug: "mutjinde-katjiua",
    name: "Professor Mutjinde Katjiua",
    title: "Paramount Chief (OTA-appointed, 2022–present)",
    reign: "2022 – present",
    born: null,
    died: null,
    era: "Contemporary Era · Disputed Succession",
    eraColor: "gold",
    photo: "/images/heritage/paramount-chief-ceremonial-dress.jpg",
    photoCredit: "Contemporary press photograph (Berlin, November 2024) · John MacDougall / AFP / Getty Images",
    teaser:
      "Elected by the Chiefs' Council in December 2021 and formally appointed by the OTA in March 2022 following the death of Vekuii Rukoro. His appointment is disputed by a faction aligned with Vipuira Kapuuo.",
    biography: [
      "Following the death of Paramount Chief Vekuii Rukoro in June 2021, the Ovaherero Traditional Authority entered a period of contested succession. The chair of the Chiefs' Council, Vipuira Kapuuo, claimed to exercise acting authority by custom.",
      "In December 2021, a chiefs' council meeting held in Kapuuo's absence elected Professor Mutjinde Katjiua as Paramount Chief. The OTA formally endorsed and appointed Katjiua in March 2022, with a full customary installation ceremony.",
      "A faction aligned with Vipuira Kapuuo rejected the December 2021 process as procedurally irregular, creating a split within the community that remains unresolved through customary and civil dispute mechanisms.",
      "Despite the contested context, Professor Katjiua has been active in representing the Ovaherero internationally, including at statements in Berlin in November 2024 related to the ongoing genocide reparations negotiations between Namibia and Germany.",
      "The OTA continues to regard Katjiua as the lawfully appointed Paramount Chief and has published his appointments and engagements on this portal in accordance with the OTA Constitution promulgated 22 August 2022.",
    ],
    keyFacts: [
      "Elected by the Chiefs' Council in December 2021",
      "Formally appointed and installed by the OTA in March 2022",
      "His appointment is disputed by a faction aligned with Vipuira Kapuuo",
      "Active in Germany–Namibia genocide reparations negotiations",
      "His tenure is governed by the OTA Constitution of 22 August 2022",
    ],
    legacy:
      "Professor Katjiua's chieftaincy is unfolding against the backdrop of the ongoing Germany–Namibia reparations process and the need to heal community divisions. The resolution of the succession dispute and the outcome of reparations negotiations will define his historical standing.",
    isDisputed: true,
  },
];

export const Route = createFileRoute("/_site/paramount-chiefs/$slug")({
  head: ({ params }) => {
    const chief = PARAMOUNT_CHIEFS.find((c) => c.slug === params.slug);
    return {
      meta: [
        {
          title: chief
            ? `${chief.name} · Paramount Chiefs · Ovaherero Traditional Authority`
            : "Paramount Chief · Ovaherero Traditional Authority",
        },
        {
          name: "description",
          content: chief
            ? chief.teaser
            : "Paramount Chiefs of the Ovaherero People.",
        },
      ],
    };
  },
  loader: ({ params }) => {
    const chief = PARAMOUNT_CHIEFS.find((c) => c.slug === params.slug);
    if (!chief) throw notFound();
    const idx = PARAMOUNT_CHIEFS.indexOf(chief);
    return {
      chief,
      prev: idx > 0 ? PARAMOUNT_CHIEFS[idx - 1] : null,
      next: idx < PARAMOUNT_CHIEFS.length - 1 ? PARAMOUNT_CHIEFS[idx + 1] : null,
    };
  },
  component: ParamountChiefDetailPage,
});

function ParamountChiefDetailPage() {
  const { chief, prev, next } = Route.useLoaderData();

  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow={`Paramount Chiefs · ${chief.era}`}
        title={chief.name}
        intro={chief.reign}
        image={chief.photo}
        imageAlt={`Portrait of ${chief.name}`}
      />

      {/* Back link */}
      <div className="shell pt-8">
        <Link
          to="/paramount-chiefs"
          className="inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All Paramount Chiefs
        </Link>
      </div>

      {/* Main content */}
      <section className="shell py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left — portrait & key facts */}
          <div className="space-y-8">
            {/* Portrait */}
            <div className="relative overflow-hidden border border-border shadow-md">
              <img
                src={chief.photo}
                alt={`${chief.name}`}
                className="aspect-[4/5] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <span className="bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  {chief.reign}
                </span>
                <h2 className="mt-2 font-display text-xl leading-tight">{chief.name}</h2>
                <p className="mt-1 text-[11px] text-white/75">{chief.title}</p>
              </div>
            </div>

            {/* Photo credit */}
            <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
              {chief.photoCredit}
            </p>

            {/* Vital facts */}
            <div className="border border-border bg-card p-6 space-y-5">
              <p className="eyebrow text-gold">Record</p>
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Reign</dt>
                    <dd className="mt-0.5 text-[13.5px] font-medium">{chief.reign}</dd>
                  </div>
                </div>
                {chief.born && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Born</dt>
                      <dd className="mt-0.5 text-[13.5px]">{chief.born}</dd>
                    </div>
                  </div>
                )}
                {chief.died && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Died</dt>
                      <dd className="mt-0.5 text-[13.5px]">{chief.died}</dd>
                    </div>
                  </div>
                )}
                {chief.reburied && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Reburied</dt>
                      <dd className="mt-0.5 text-[13.5px]">{chief.reburied}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Era</dt>
                    <dd className="mt-0.5 text-[13.5px]">{chief.era}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Key Facts */}
            <div className="border border-border bg-secondary/40 p-6">
              <p className="eyebrow">Key facts</p>
              <ul className="mt-4 space-y-2.5">
                {chief.keyFacts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disputed note */}
            {chief.isDisputed && (
              <div className="border border-gold/50 bg-gold/10 p-5">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-gold">
                  Contested succession
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/75">
                  The appointment of this chief is disputed by a faction within the Ovaherero community. The OTA
                  formally recognises the March 2022 appointment. The OTA Constitution (2022) governs the
                  resolution of succession disputes.
                </p>
              </div>
            )}
          </div>

          {/* Right — biography & legacy */}
          <div className="space-y-10">
            {/* Title block */}
            <div className="border-b border-border pb-8">
              <p className="eyebrow text-gold">{chief.era}</p>
              <h1 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.5rem]">{chief.name}</h1>
              {chief.nameAlt && (
                <p className="mt-1 text-[13px] text-muted-foreground">Also known as: {chief.nameAlt}</p>
              )}
              <p className="mt-3 text-[1.1rem] font-medium text-[hsl(var(--primary))]">{chief.title}</p>
            </div>

            {/* Biography */}
            <div>
              <p className="eyebrow mb-5">Biography</p>
              <div className="space-y-5">
                {chief.biography.map((para, i) => (
                  <p key={i} className="text-[0.95rem] leading-[1.9] text-foreground/80">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Legacy */}
            <div className="border border-border bg-card p-7">
              <p className="eyebrow text-gold">Historical legacy</p>
              <p className="mt-4 text-[0.95rem] leading-[1.9] text-foreground/80 italic">
                {chief.legacy}
              </p>
            </div>

            {/* CTA links */}
            <div className="flex flex-wrap gap-4 border-t border-border pt-6">
              <Button asChild className="rounded-none bg-gold px-6 text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink))] hover:bg-gold/90">
                <Link to="/paramount-chief">Office of the Paramount Chief</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none px-6 text-[11.5px] uppercase tracking-[0.14em]">
                <Link to="/paramount-chiefs">All Paramount Chiefs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Prev / Next navigation */}
      <section className="border-t border-border bg-secondary/40 py-10">
        <div className="shell flex flex-wrap items-center justify-between gap-6">
          {prev ? (
            <Link
              to="/paramount-chiefs/$slug"
              params={{ slug: prev.slug }}
              className="group flex items-center gap-3"
            >
              <ArrowLeft className="h-4 w-4 text-gold transition-transform group-hover:-translate-x-1" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Previous</p>
                <p className="mt-0.5 font-display text-base group-hover:text-[hsl(var(--primary))]">
                  {prev.name}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to="/paramount-chiefs/$slug"
              params={{ slug: next.slug }}
              className="group flex items-center gap-3 text-right"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next</p>
                <p className="mt-0.5 font-display text-base group-hover:text-[hsl(var(--primary))]">
                  {next.name}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* Full lineage list */}
      <section className="shell py-14">
        <p className="eyebrow mb-6">Full lineage</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PARAMOUNT_CHIEFS.map((c) => (
            <Link
              key={c.slug}
              to="/paramount-chiefs/$slug"
              params={{ slug: c.slug }}
              className={`group border p-4 transition-all hover:border-gold/60 hover:bg-secondary/50 ${
                c.slug === chief.slug
                  ? "border-gold bg-gold/10"
                  : "border-border bg-card"
              }`}
            >
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {c.reign}
              </p>
              <p className="mt-1.5 font-display text-[0.95rem] leading-snug group-hover:text-[hsl(var(--primary))]">
                {c.name}
              </p>
              {c.isDisputed && (
                <span className="mt-1 inline-block bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
                  Disputed
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
