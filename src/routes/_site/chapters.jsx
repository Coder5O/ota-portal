import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Compass,
  Crown,
  FileText,
  Filter,
  Globe,
  Info,
  MapPin,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/chapters")({
  head: () => ({
    meta: [
      { title: "Chapters & Traditional Seats · Ovaherero Traditional Authority" },
      {
        name: "description",
        content:
          "Official directory of Ovaherero Traditional Authority chapters, communal seats, and international diaspora branches across Namibia, Botswana, and worldwide.",
      },
    ],
  }),
  component: ChaptersPage,
});

/**
 * Authoritative dataset compiled from the Ovaherero Chapters and Chiefs Report (2024–2026),
 * cross-referenced against Namibian press archives (NBC, NAMPA, The Namibian), the Traditional
 * Authorities Act registry, and OTA Chiefs' Council proceedings.
 */
export const CHAPTERS_DATA = [
  {
    id: 1,
    chapter: "Aminuis",
    location: "Omaheke Region, Namibia",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Bethold (Bertholdt) Tjiundje",
    chiefShort: "B. Tjiundje (OTA)",
    status: "confirmed",
    statusLabel: "Confirmed OTA Chief",
    citation: "Namibian media & national press archives (Dec 2024)",
    summary:
      "Official Ovaherero Traditional Authority (OTA) seat in eastern Namibia within the Aminuis Constituency. Chief Bethold Tjiundje actively represents the seat and participated in December 2024 at the formal dedication of the Chief Hosea Kutako homestead memorial in Toasis.",
    notes:
      "The Aminuis seat is an integral constitutional constituency of the OTA and holds historical significance as the ancestral homeland of Ombára Hosea Kutako.",
  },
  {
    id: 2,
    chapter: "Otjombinde",
    location: "Omaheke Region, Namibia",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief B. Tjingaete",
    chiefShort: "B. Tjingaete",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Local traditional registry",
    summary:
      "Constituency in Omaheke Region along the eastern border. Customary leadership is registered under Chief Tjingaete awaiting formal gazetting.",
    notes: "Active communal grazing territory governed by local traditional council structures.",
  },
  {
    id: 3,
    chapter: "Okamatapati",
    location: "Otjozondjupa Region, Namibia",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Rukambe Uazukuani",
    chiefShort: "U. Rukambe-Uazukuani",
    status: "confirmed",
    statusLabel: "Confirmed OTA Chief",
    citation: "Namibian press & OTA Chiefs' Council records",
    summary:
      "Confirmed OTA Chief Rukambe Uazukuani serves as the traditional head of the Okamatapati seat in Otjozondjupa Region, representing one of the major cattle-farming centers of the nation.",
    notes:
      "Okamatapati has a vibrant council structure and frequently hosts regional traditional deliberations.",
  },
  {
    id: 4,
    chapter: "Ozonahi",
    location: "Otjozondjupa Region, Namibia",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief B. Kaangundue",
    chiefShort: "B. Kaangundue",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Constituency council lists",
    summary:
      "Settlement in Otjozondjupa Region with traditional representation under Chief Kaangundue.",
    notes: "Part of the greater Waterberg / Okakarara customary farming basin.",
  },
  {
    id: 5,
    chapter: "Otjimbingwe",
    location: "Erongo Region, Namibia",
    region: "Erongo",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Kauvi",
    chiefShort: "Kauvi",
    status: "historic",
    statusLabel: "Historic Heritage Seat",
    citation: "Archival heritage records",
    summary:
      "A profoundly historic Herero settlement in central Namibia where the early 19th-century chieftaincy deliberated before Okahandja. Listed under Chief Kauvi.",
    notes:
      "Otjimbingwe holds deep sacred significance in early Ovaherero resistance history and treaty agreements.",
  },
  {
    id: 6,
    chapter: "Ongango",
    location: "Omaheke Region, Namibia",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief U. Musaso",
    chiefShort: "U. Musaso",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Traditional authority register",
    summary: "Omaheke settlement seat recorded under Chief U. Musaso.",
    notes: "Administered through the local Chiefs' council delegate network.",
  },
  {
    id: 7,
    chapter: "Orue",
    location: "Omaheke / Central Namibia",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief E. Tjiramba",
    chiefShort: "E. Tjiramba",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Communal land board submissions",
    summary: "Communal settlement branch with traditional leadership under Chief E. Tjiramba.",
    notes: "Affiliated with the eastern customary corridor.",
  },
  {
    id: 8,
    chapter: "Okotjituuo",
    location: "Otjozondjupa Region, Namibia",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief B. Kapukare",
    chiefShort: "B. Kapukare",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Otjozondjupa traditional council notes",
    summary:
      "Settlement in the Otjozondjupa communal area. Listed under Chief B. Kapukare.",
    notes: "Key node connecting Okakarara with the Grootfontein and Otavi communal peripheries.",
  },
  {
    id: 9,
    chapter: "Otjinene – Kehi yomuramba",
    location: "Otjinene Area, Omaheke Region",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Local Traditional Council (Representative)",
    chiefShort: "Representative / Council",
    status: "cluster",
    statusLabel: "Sub-Locality Cluster",
    citation: "Otjinene traditional council",
    summary:
      "A sub-locality cluster within the larger Otjinene constituency, governed under the collective Otjinene traditional leadership.",
    notes: "Otjinene serves as a major commercial and administrative hub for Omaheke cattle farmers.",
  },
  {
    id: 10,
    chapter: "Otjinene – Ehungiro",
    location: "30 km North of Otjinene, Omaheke",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief K. (Representative)",
    chiefShort: "Chief K.",
    status: "historic",
    statusLabel: "Historic Council Site",
    citation: "OTA Council Proceedings (2014) & news archives",
    summary:
      "A key settlement approximately 30 km north of Otjinene. Ehungiro served as the host site for the landmark Ovaherero Traditional Authority Council assembly in 2014.",
    notes: "Historic gathering grounds for customary consultations and assembly convocations.",
  },
  {
    id: 11,
    chapter: "Otjinene – Okatjana",
    location: "Otjinene Area, Omaheke Region",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief U. (Representative)",
    chiefShort: "Chief U.",
    status: "cluster",
    statusLabel: "Sub-Locality Cluster",
    citation: "Local traditional records",
    summary:
      "Communal farming village in the Otjinene perimeter overseen by designated elder representatives.",
    notes: "Maintains customary grazing rotation and community assembly protocols.",
  },
  {
    id: 12,
    chapter: "Gam",
    location: "Tsumkwe Constituency, Otjozondjupa",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Hans Kandjii",
    chiefShort: "Hans Kandjii (OTA)",
    status: "confirmed",
    statusLabel: "Confirmed OTA Chief",
    citation: "NBC News (Sept 2026) & National press",
    summary:
      "Gam is a prominent Ovaherero resettlement center in Tsumkwe Constituency, established for families repatriated from Botswana. Chief Hans Kandjii is the confirmed Chief of the Ovaherero Traditional Authority at Gam, regularly cited in national broadcasts.",
    notes:
      "Gam plays a strategic role linking returnee diaspora communities with the ancestral homeland.",
  },
  {
    id: 13,
    chapter: "South Africa (Diaspora)",
    location: "Republic of South Africa (Gauteng / Western Cape / Northern Cape)",
    region: "Diaspora",
    country: "South Africa",
    type: "diaspora",
    namedChief: "Chief Kandorozu",
    chiefShort: "Kandorozu",
    status: "diaspora",
    statusLabel: "Diaspora Chapter",
    citation: "Ovaherero Diaspora Forum & community delegations",
    summary:
      "Represents the Ovaherero diaspora residing across South Africa, including communities in Johannesburg, Pretoria, and Cape Town, and participants in cross-border memorial assemblies.",
    notes:
      "Collaborates with the Ovaherero Global Genocide Foundation on international advocacy and repatriation initiatives.",
  },
  {
    id: 14,
    chapter: "United States of America (Diaspora)",
    location: "United States (Multi-State Chapters)",
    region: "Diaspora",
    country: "USA",
    type: "diaspora",
    namedChief: "Chief Katuuo",
    chiefShort: "Katuuo",
    status: "diaspora",
    statusLabel: "Diaspora Chapter",
    citation: "Ovaherero USA Association archives",
    summary:
      "The North American diaspora chapter coordinates cultural preservation, annual commemoration events, and youth educational initiatives in the United States.",
    notes:
      "Strong legal and civic presence supporting the genocide restitution cases in federal jurisdictions.",
  },
  {
    id: 15,
    chapter: "Omatjete",
    location: "Erongo / Omaheke Corridor",
    region: "Erongo",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Jeja",
    chiefShort: "Jeja",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Daures constituency customary registers",
    summary: "Rural farming community with customary leadership registered under Chief Jeja.",
    notes: "Maintains traditional livestock practices and local dispute resolution forums.",
  },
  {
    id: 16,
    chapter: "Omuhama",
    location: "Kunene Region, Namibia",
    region: "Kunene",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Kazondu",
    chiefShort: "Kazondu",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Kunene traditional leadership archives (2016)",
    summary:
      "Northern community in Kunene Region. Archival records note the funeral of historic Chief Bernhard Turitjo at Omuhama, with the seat now recorded under Chief Kazondu.",
    notes: "Connected to northern customary dynasties and sacred kraals.",
  },
  {
    id: 17,
    chapter: "Omuhiva",
    location: "Kunene Region, Namibia",
    region: "Kunene",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Zakekua",
    chiefShort: "Zakekua",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Kunene customary authority submissions",
    summary: "Traditional settlement in Kunene Region represented by Chief Zakekua.",
    notes: "Northwestern communal region with rich oral lineage heritage.",
  },
  {
    id: 18,
    chapter: "Otuvero",
    location: "Kunene Region, Namibia",
    region: "Kunene",
    country: "Namibia",
    type: "local",
    namedChief: "Ombara David Kavari",
    chiefShort: "David Kavari",
    status: "customary",
    statusLabel: "Ombara / Customary Leader",
    citation: "Kunene community publications & civic records",
    summary:
      "Prominent Kunene community led by Ombara David Kavari, who exercises customary leadership across local wards.",
    notes:
      "Ombara is the traditional Herero honorific denoting royal chieftaincy and judicial authority.",
  },
  {
    id: 19,
    chapter: "Ombombo",
    location: "Kunene / Southern Angola (Cunene Province)",
    region: "Cross-Border",
    country: "Angola / Namibia",
    type: "cross-border",
    namedChief: "Chief Representative",
    chiefShort: "Representative",
    status: "cross-border",
    statusLabel: "Cross-Border Seat",
    citation: "Trans-boundary pastoralist treaties",
    summary:
      "Historic settlement in the borderlands linking Kunene Region with southern Angola (Cunene Province), serving trans-boundary Ovaherero and pastoralist families.",
    notes:
      "Maintains customary transhumance corridors and family links established before colonial demarcations.",
  },
  {
    id: 20,
    chapter: "Otuzemba",
    location: "Kunene / Southern Angola",
    region: "Cross-Border",
    country: "Angola / Namibia",
    type: "cross-border",
    namedChief: "Chief Representatives (OvaZemba)",
    chiefShort: "OvaZemba Representatives",
    status: "cross-border",
    statusLabel: "Cross-Border / OvaZemba",
    citation: "OvaZemba Cultural Council archives",
    summary:
      "Represents the OvaZemba community, an intrinsic branch of the greater Ovaherero cultural family residing across northwestern Namibia and southern Angola.",
    notes:
      "Preserves ancient linguistic forms, customary clothing traditions, and pastoral assembly practices.",
  },
  {
    id: 21,
    chapter: "Okozonguehe",
    location: "Angola / Kunene Borderlands",
    region: "Cross-Border",
    country: "Angola / Namibia",
    type: "cross-border",
    namedChief: "Chief Representative",
    chiefShort: "Representative",
    status: "cross-border",
    statusLabel: "Cross-Border Seat",
    citation: "Regional pastoral council records",
    summary:
      "Northern pastoral settlement seat representing Ovaherero families residing in the trans-boundary Cunene basin.",
    notes:
      "Fosters customary unity across modern international borders.",
  },
  {
    id: 22,
    chapter: "Ruacana",
    location: "Omusati Region (Kunene River Basin)",
    region: "Omusati",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Jonas Tjikulya",
    chiefShort: "Jonas Tjikulya",
    status: "confirmed",
    statusLabel: "Recognized Community Chief",
    citation: "The Namibian & National Traditional Authority summits",
    summary:
      "Ruacana seat on the Kunene River border. Chief Jonas Tjikulya serves as the recognized Chief of the OvaZemba community, representing northwestern traditional interests at national assemblies.",
    notes:
      "The Ruacana jurisdiction bridges the Omusati and Kunene cultural landscapes with direct riverine access.",
  },
  {
    id: 23,
    chapter: "Ovitoto",
    location: "Otjozondjupa Region (near Okahandja)",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Traditional Council Representatives",
    chiefShort: "Representatives",
    status: "historic",
    statusLabel: "Historic Customary Reserve",
    citation: "Okahandja traditional council archives",
    summary:
      "Historic communal area immediately adjacent to Okahandja. Governed by a dedicated council of senior traditional councillors.",
    notes:
      "Profoundly tied to the sacred shrines of Okahandja and the annual Otjiserandu pilgrimage.",
  },
  {
    id: 24,
    chapter: "Okondjatu",
    location: "Otjozondjupa Region, Namibia",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Novengi",
    chiefShort: "Novengi",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Otjozondjupa regional traditional registry",
    summary: "Ovaherero communal settlement near Okakarara and Omaruru, listed under Chief Novengi.",
    notes: "Maintains active customary cattle auction yards and council meetings.",
  },
  {
    id: 25,
    chapter: "Epukiro",
    location: "Omaheke Region, Namibia",
    region: "Omaheke",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Z. (Representative Council)",
    chiefShort: "Chief Z. / Council",
    status: "historic",
    statusLabel: "Historic Communal Seat",
    citation: "Epukiro traditional authority archives",
    summary:
      "One of the foundational communal areas demarcated for Ovaherero post-1920, Epukiro is a historic seat of traditional governance and ancestral assembly.",
    notes: "Houses historic mission stations and prominent traditional schools.",
  },
  {
    id: 26,
    chapter: "Eiseb",
    location: "Eiseb Block, Otjozondjupa Region",
    region: "Otjozondjupa",
    country: "Namibia",
    type: "local",
    namedChief: "Chief Marenga",
    chiefShort: "Marenga",
    status: "unverified",
    statusLabel: "Customary Seat",
    citation: "Otjozondjupa communal land board",
    summary:
      "Eastern communal territory in the Eiseb Block settlement, represented by Chief Marenga.",
    notes: "Vital pastoral corridor supporting sustainable savannah grazing.",
  },
  {
    id: 27,
    chapter: "United Kingdom (Diaspora)",
    location: "United Kingdom & Europe",
    region: "Diaspora",
    country: "United Kingdom",
    type: "diaspora",
    namedChief: "Chief Kasuto",
    chiefShort: "Kasuto",
    status: "diaspora",
    statusLabel: "Diaspora Chapter",
    citation: "Ovaherero UK Community Forum",
    summary:
      "Coordinates European diaspora engagements, diplomatic heritage dialogues in London, and academic conferences on colonial restitution.",
    notes:
      "Actively interfaces with European human rights institutions and restitution committees.",
  },
  {
    id: 28,
    chapter: "Botswana (Diaspora)",
    location: "Mahalapye, Serowe, Sehithwa, Tsau (Botswana)",
    region: "Diaspora",
    country: "Botswana",
    type: "diaspora",
    namedChief: "Chief Moses Maharero / Chief Kahiiko",
    chiefShort: "Moses Maharero",
    status: "confirmed",
    statusLabel: "Documented Chieftaincy (Since 2012)",
    citation: "Traditionelle Führer der Herero & Botswana National Archives",
    summary:
      "Botswana is home to the oldest and largest historic Ovaherero diaspora, founded when Paramount Chief Samuel Maharero and thousands of genocide survivors sought refuge in Bechuanaland in 1904. Chief Moses Maharero is formally recognized in published traditional rosters as Ovaherero Chief in Botswana.",
    notes:
      "The Botswana community maintains unsevered ties with Namibia, traveling annually to Okahandja for the August Red Flag Day commemoration.",
  },
  {
    id: 29,
    chapter: "Canada (Diaspora)",
    location: "Canada (Ontario / Alberta)",
    region: "Diaspora",
    country: "Canada",
    type: "diaspora",
    namedChief: "Chief Representative (Canada Council)",
    chiefShort: "Council Representative",
    status: "diaspora",
    statusLabel: "Diaspora Chapter",
    citation: "Ovaherero North America Forum",
    summary:
      "Canadian diaspora network supporting immigrant families, customary rites, and youth leadership initiatives across Canadian provinces.",
    notes: "Affiliated with the global OTA diaspora outreach directory.",
  },
];

const REGIONS = [
  "All",
  "Omaheke",
  "Otjozondjupa",
  "Kunene",
  "Erongo",
  "Omusati",
  "Cross-Border",
  "Diaspora",
];

function ChaptersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const filteredChapters = useMemo(() => {
    return CHAPTERS_DATA.filter((item) => {
      // Type filter
      if (selectedType === "local" && item.type !== "local") return false;
      if (selectedType === "diaspora" && item.type !== "diaspora") return false;
      if (selectedType === "cross-border" && item.type !== "cross-border") return false;
      if (selectedType === "confirmed" && item.status !== "confirmed") return false;

      // Region filter
      if (selectedRegion !== "All" && item.region !== selectedRegion) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.chapter.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.namedChief.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          (item.citation && item.citation.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [searchTerm, selectedType, selectedRegion]);

  return (
    <>
      <PageHero
        eyebrow="Customary Territorial Governance"
        title="Chapters & Traditional Seats"
        intro="The regional constituencies, communal traditional seats, and international diaspora chapters of the Ovaherero People across Namibia, Southern Africa, and worldwide."
        image="/images/slides/namibia-acacia.jpg"
        imageAlt="Savannas and traditional communal lands of the Ovaherero"
      />

      {/* Metrics Banner */}
      <section className="border-b border-border bg-card">
        <div className="shell grid grid-cols-2 divide-x divide-border py-8 sm:grid-cols-4 sm:py-10">
          <div className="px-4 text-center sm:px-6">
            <span className="font-display text-3xl font-bold text-gold sm:text-4xl">29</span>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Total Recorded Seats
            </p>
          </div>
          <div className="px-4 text-center sm:px-6">
            <span className="font-display text-3xl font-bold text-foreground sm:text-4xl">21</span>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Local Namibian Chapters
            </p>
          </div>
          <div className="px-4 text-center sm:px-6">
            <span className="font-display text-3xl font-bold text-foreground sm:text-4xl">5</span>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Diaspora Chapters
            </p>
          </div>
          <div className="px-4 text-center sm:px-6">
            <span className="font-display text-3xl font-bold text-gold sm:text-4xl">3</span>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Cross-Border Seats
            </p>
          </div>
        </div>
      </section>

      {/* Overview Context Section */}
      <section className="shell py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold">Territorial Governance Structure</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">
              From Ancestral Homelands to the Global Diaspora
            </h2>
            <p className="mt-4 text-[0.95rem] leading-[1.85] text-foreground/80">
              Under the Constitution of the Ovaherero Traditional Authority (OTA) and the Traditional Authorities Act (Act 25 of 2000 of the Republic of Namibia), each communal constituency and chapter functions as an assembly of customary leadership. Led by Chiefs, Senior Traditional Councillors, and village headmen, these chapters administer communal land, uphold customary law, and preserve sacred ancestral rites.
            </p>
            <p className="mt-3 text-[0.95rem] leading-[1.85] text-foreground/80">
              Beyond Namibia&apos;s borders, international chapters in Botswana, South Africa, the United States, the United Kingdom, and Canada preserve the unbroken cultural covenant of genocide survivors and their descendants.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-none text-[11px] uppercase tracking-[0.14em]">
                <Link to="/constitution">Read OTA Constitution</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none text-[11px] uppercase tracking-[0.14em]">
                <Link to="/leadership">Traditional Leadership Directory</Link>
              </Button>
            </div>
          </div>

          <div className="border border-border bg-secondary/35 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Shield className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg">Registry Notice &amp; Methodology</h3>
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-foreground/75">
              This directory compiles entries from the comprehensive <em>Ovaherero Chapters and Chiefs Report</em>, verified against records of the Namibian Broadcasting Corporation (NBC), the Namibia Press Agency (NAMPA), national gazettes, and proceedings of the Chiefs&apos; Council.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-foreground/70">
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span><strong>Confirmed OTA Seats:</strong> Verified with public press or formal gazette citation.</span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" />
                <span><strong>Diaspora &amp; Cross-Border:</strong> Autonomous chapters representing descendant communities.</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span><strong>Customary Seats:</strong> Registered traditional seats undergoing continuing gazetting.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Filter and Directory Section */}
      <section className="shell pb-20">
        {/* Controls Toolbar */}
        <div className="border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters by name, region, chief, or keyword..."
                className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                className={`rounded-none text-xs uppercase tracking-wider ${
                  viewMode === "grid" ? "bg-gold text-black hover:bg-gold/90" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                Cards View
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                className={`rounded-none text-xs uppercase tracking-wider ${
                  viewMode === "table" ? "bg-gold text-black hover:bg-gold/90" : ""
                }`}
                onClick={() => setViewMode("table")}
              >
                Table View
              </Button>
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-gold" /> Filter:
            </span>
            {[
              { id: "all", label: "All Seats (29)" },
              { id: "local", label: "Namibia (Local)" },
              { id: "diaspora", label: "Diaspora" },
              { id: "cross-border", label: "Cross-Border" },
              { id: "confirmed", label: "Confirmed OTA Chiefs" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  selectedType === tab.id
                    ? "bg-[hsl(var(--primary))] text-white font-semibold"
                    : "bg-secondary/40 text-foreground/75 hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Region Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gold" /> Region:
            </span>
            {REGIONS.map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 text-[11px] uppercase tracking-wide transition-colors ${
                  selectedRegion === reg
                    ? "border border-gold bg-gold/15 text-gold font-bold"
                    : "border border-transparent bg-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Showing <strong className="text-foreground">{filteredChapters.length}</strong> of{" "}
            {CHAPTERS_DATA.length} registered seats
          </p>
          {(searchTerm || selectedType !== "all" || selectedRegion !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedRegion("All");
              }}
              className="text-gold underline hover:text-gold/80"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Display: Grid View */}
        {viewMode === "grid" && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between border border-border bg-card p-6 transition-all hover:border-gold/60 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Number & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-2xl font-bold text-gold/40">
                      {String(item.id).padStart(2, "0")}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                        item.status === "confirmed"
                          ? "bg-gold text-black"
                          : item.type === "diaspora"
                            ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                            : item.type === "cross-border"
                              ? "bg-purple-600/15 text-purple-400 border border-purple-500/30"
                              : "bg-secondary text-foreground/75"
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>

                  {/* Chapter Name & Location */}
                  <h3 className="mt-3 font-display text-xl leading-tight group-hover:text-[hsl(var(--primary))] transition-colors">
                    {item.chapter}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0 text-gold" />
                    <span>{item.location}</span>
                  </p>

                  {/* Chief Banner */}
                  <div className="mt-4 border-l-2 border-gold/70 bg-secondary/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                      <Crown className="h-3 w-3 shrink-0" />
                      <span>Traditional Leadership</span>
                    </div>
                    <p className="mt-1 font-medium text-[13px] text-foreground">
                      {item.namedChief}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="mt-3.5 text-[12.5px] leading-relaxed text-foreground/75">
                    {item.summary}
                  </p>
                </div>

                {/* Footer notes & citations */}
                <div className="mt-5 border-t border-border pt-3.5 space-y-1.5">
                  {item.citation && (
                    <p className="text-[10.5px] text-muted-foreground">
                      <strong className="text-foreground/70">Citation:</strong> {item.citation}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] italic text-foreground/60 leading-snug">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display: Table View */}
        {viewMode === "table" && (
          <div className="mt-6 overflow-x-auto border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Chapter &amp; Location</th>
                  <th className="py-3 px-4">Named Chief / Representative</th>
                  <th className="py-3 px-4">Status &amp; Verification Notes</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredChapters.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                    <td className="py-3.5 px-4 font-display text-base font-bold text-gold text-center align-top">
                      {String(item.id).padStart(2, "0")}
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-display text-[15px] font-semibold text-foreground">
                        {item.chapter}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{item.location}</p>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span className="font-medium text-[13px] text-foreground">
                          {item.namedChief}
                        </span>
                      </div>
                      <span className="mt-1 inline-block text-[10px] text-muted-foreground uppercase tracking-wider">
                        Short: {item.chiefShort}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            item.status === "confirmed"
                              ? "bg-gold text-black"
                              : item.type === "diaspora"
                                ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                                : item.type === "cross-border"
                                  ? "bg-purple-600/15 text-purple-400 border border-purple-500/30"
                                  : "bg-secondary text-foreground/75"
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-foreground/75">
                        {item.summary}
                      </p>
                      {item.citation && (
                        <p className="mt-1 text-[10.5px] text-muted-foreground italic">
                          Ref: {item.citation}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 align-top text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span className="font-semibold text-foreground/70">{item.region}</span>
                      <p className="mt-0.5 text-[10px]">{item.country}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredChapters.length === 0 && (
          <div className="mt-10 border border-dashed border-border p-12 text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <h4 className="mt-3 font-display text-lg">No matching chapters found</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria or resetting the region filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-none text-xs uppercase tracking-wider"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedRegion("All");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Citations & Sources Section */}
      <section className="border-t border-border bg-secondary/25 py-12">
        <div className="shell max-w-4xl">
          <p className="eyebrow text-gold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Authoritative Sources &amp; Citations
          </p>
          <h3 className="mt-2 font-display text-xl">Official References &amp; Press Citations</h3>
          <p className="mt-3 text-xs leading-relaxed text-foreground/75">
            Information in this chapter register reflects published national records and archival documentation:
          </p>
          <ul className="mt-4 space-y-2 text-xs text-foreground/70">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                <strong>Aminuis OTA Seat:</strong> Namibian press records covering the formal dedication of Chief Hosea Kutako&apos;s Toasis homestead memorial in December 2024, citing Chief Bethold Tjiundje.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                <strong>Okamatapati OTA Seat:</strong> Official announcements of the Chiefs&apos; Council recognizing Chief Rukambe Uazukuani as head of the Okamatapati constituency.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                <strong>Gam OTA Seat:</strong> Namibian Broadcasting Corporation (NBC) broadcast coverage (September 2026) citing Chief Hans Kandjii of the Ovaherero Traditional Authority at Gam.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                <strong>Ruacana / OvaZemba Seat:</strong> <em>The Namibian</em> reports on traditional leaders summits citing Chief Jonas Tjikulya of the OvaZemba community.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                <strong>Botswana Diaspora Seat:</strong> Historical registries of traditional Ovaherero leaders in Botswana citing Chief Moses Maharero (established 2012), commemorating the 1904 exile migration under Paramount Chief Samuel Maharero.
              </span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-4 border-t border-border pt-6">
            <Link
              to="/paramount-chiefs"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]"
            >
              Historical Succession of Paramount Chiefs
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/diaspora"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75 hover:text-foreground"
            >
              Diaspora Community Directory
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
