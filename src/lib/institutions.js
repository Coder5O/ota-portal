// Institutional structures identified in the Constitution of the Ovaherero
// Traditional Authority (22 August 2022). Titles and functions are drawn from the
// constitutional framework only; each record's published content is authored by
// the OTA administration and never assumed here.

export const INSTITUTIONS = [
  {
    slug: "office-of-the-paramount-chief",
    name: "Office of the Paramount Chief",
    native: "Ombara Otjitambi",
    legal_instrument: "Constitution",
    summary:
      "The office supporting the Paramount Chief in the discharge of the duties vested in the institution by the Constitution.",
  },
  {
    slug: "commissioners",
    name: "Commissioners",
    native: "Ovakomisinare",
    legal_instrument: "Constitution",
    summary:
      "Statutory and thematic commissioners appointed under the Constitution to oversee specialized governance portfolios, constitutional oversight, and traditional administration.",
  },
  {
    slug: "chiefs-council",
    name: "Chiefs Council",
    native: "Ozombara",
    legal_instrument: "Constitution",
    summary:
      "The council of traditional leaders recognised by the Ovaherero Traditional Authority, with the mandate and decisions authorised for publication.",
  },
  {
    slug: "senate",
    name: "Senate",
    native: "",
    legal_instrument: "Constitution",
    summary:
      "An institutional organ of the Ovaherero Traditional Authority with responsibilities set out in the Constitution.",
  },
  {
    slug: "women-council",
    name: "OWA (Ovaherero Women Association)",
    native: "OWA",
    legal_instrument: "Description + Constitution",
    summary:
      "The association advancing the participation, initiatives and programmes of Ovaherero women in community, cultural, and leadership life under its constitutional charter.",
  },
  {
    slug: "youth-council",
    name: "OYAC (Ovaherero Youth Association / Council)",
    native: "OYAC",
    legal_instrument: "Description + Constitution",
    summary:
      "The council and association for youth development, cultural education, leadership empowerment, and community projects among young Ovaherero.",
  },
  {
    slug: "red-flag-leadership",
    name: "Red Flag (Otjiserandu)",
    native: "Erapi Rotjiserandu",
    legal_instrument: "Description + Constitution",
    summary:
      "The historic Otjiserandu regiment and leadership, its living heritage, annual Okahandja pilgrimage, sacred commemorations, and cultural identity.",
  },
  {
    slug: "white-flag",
    name: "White Flag (Otjimbandi)",
    native: "Erapi Rotjimbandi",
    legal_instrument: "Description + Constitution",
    summary:
      "The historic White Flag (Otjimbandi) regiment, customary custodians, commemorations, and ceremonial heritage recognized under the customary framework.",
  },
  {
    slug: "ovaherero-genocide-foundation",
    name: "OGGF (Ovaherero Global Genocide Foundation)",
    native: "OGGF",
    legal_instrument: "Deed of Trust",
    summary:
      "Independent trust mandated with historical research, international advocacy, restorative justice, reparations litigation, and the return of ancestral remains.",
  },
  {
    slug: "omuyapu",
    name: "Omuyapu",
    native: "Omuyapu",
    legal_instrument: "Deed of Trust",
    summary:
      "Custodial institution constituted under Deed of Trust to safeguard community assets, endowments, and customary communal welfare programmes.",
  },
  {
    slug: "omuhe",
    name: "Omuhe",
    native: "Omuhe",
    legal_instrument: "By-law",
    summary:
      "Customary statutory body established under by-laws to administer communal land usage, grazing rights, and natural resource stewardship.",
  },
  {
    slug: "cultural-council",
    name: "Cultural Council",
    native: "Orutu rwOmbazu",
    legal_instrument: "Deed of Trust",
    summary:
      "The custodial council established under Deed of Trust responsible for preserving oral histories, customary rites, sacred fires (Omakuruuo), and linguistic heritage.",
  },
  {
    slug: "clans-conference",
    name: "Ovaherero Clans Conference",
    native: "Ozombazu zOzomuhoko",
    legal_instrument: "Deed of Trust",
    summary:
      "The assembly uniting all Ovaherero clans, royal houses, and ancestral lineages under a unified consultative Deed of Trust.",
  },
  {
    slug: "kutako-heritage-council",
    name: "Kutako Heritage Council",
    native: "Hosea Kutako Heritage",
    legal_instrument: "Deed of Trust",
    summary:
      "Heritage trust dedicated to perpetuating the legacy, shrine, international petitions, and national liberation philosophy of Ombara Hosea Kutako.",
  },
  {
    slug: "community-foundations",
    name: "Community Foundations",
    native: "Otutumbo twOzomuhoko",
    legal_instrument: "Trust Deeds & Endowments",
    summary:
      "Regional community trusts and endowment funds established across traditional constituencies to support local education, health, and economic resilience.",
  },
  {
    slug: "ota-executive",
    name: "OTA Executive",
    native: "",
    legal_instrument: "Constitution",
    summary:
      "The executive structure of the Ovaherero Traditional Authority, constituted with approved portfolios and official communications.",
  },
  {
    slug: "top-22",
    name: "Top 22",
    native: "",
    legal_instrument: "Constitution",
    summary:
      "An institutional structure of the Ovaherero Traditional Authority, presented here as authorised for public information.",
  },
  {
    slug: "ozondangere",
    name: "Ozondangere",
    native: "",
    legal_instrument: "Customary Recognition",
    summary:
      "An institutional structure whose approved role is published once confirmed by the Ovaherero Traditional Authority.",
  },
  {
    slug: "omuara",
    name: "Omuara",
    native: "",
    legal_instrument: "Customary Recognition",
    summary:
      "The office or status of Omuara, presented in accordance with the confirmation of the Ovaherero Traditional Authority.",
  },
];

export const NAV_INSTITUTIONS = INSTITUTIONS.slice(0, 9);

export const MEMBERSHIP_CATEGORIES = [
  { value: "individual", label: "Individual community member" },
  { value: "traditional_leader", label: "Traditional leader or chief" },
  { value: "traditional_community", label: "Traditional community or chapter" },
  { value: "chiefs_council", label: "Chiefs Council member" },
  { value: "senate", label: "Senate member" },
  { value: "executive", label: "OTA Executive member or officeholder" },
  { value: "women_council", label: "OWA(Ovaherero Womans Association) member" },
  { value: "youth_council", label: "OYF(Ovaherero Youth Foundation) member" },
  { value: "red_flag", label: "Red Flag Leadership member" },
  { value: "ogf", label: "OGGF director, trustee or authorised staff" },
  { value: "top_22", label: "Top 22 member" },
  { value: "diaspora", label: "Diaspora member or international chapter" },
  { value: "staff", label: "Administrative staff or institutional officer" },
  { value: "other", label: "Other structure approved by OTA" },
];

// Default approval authority per registration type. The Authority may override
// any of these in the Administration Console (Approval authority); these values
// are only the starting configuration and never a decision in themselves.
export const DEFAULT_AUTHORITIES = {
  individual: "Community administration",
  traditional_leader: "Chiefs Council",
  traditional_community: "Chiefs Council",
  chiefs_council: "Chiefs Council",
  senate: "Senate",
  executive: "Office of the Paramount Chief",
  women_council: "OWA(Ovaherero Womans Association)",
  youth_council: "OYF(Ovaherero Youth Foundation)",
  red_flag: "Red Flag Leadership",
  ogf: "OGGF Board of Trustees",
  top_22: "Top 22",
  diaspora: "OTA Executive",
  staff: "OTA Executive",
  other: "OTA Executive",
};

export const CATEGORY_VALUES = MEMBERSHIP_CATEGORIES.map((c) => c.value);

export const categoryLabel = (value) =>
  MEMBERSHIP_CATEGORIES.find((c) => c.value === value)?.label || value || "Member";

export const APPLICATION_STATUSES = [
  "Draft",
  "Submitted",
  "Under Review",
  "More Information Required",
  "Approved",
  "Rejected",
  "Suspended",
  "Archived",
];