// Institutional structures identified in the Constitution of the Ovaherero
// Traditional Authority (22 August 2022). Titles and functions are drawn from the
// constitutional framework only; each record's published content is authored by
// the OTA administration and never assumed here.

export const INSTITUTIONS = [
  {
    slug: "office-of-the-paramount-chief",
    name: "Office of the Paramount Chief",
    native: "Ombara Otjitambi",
    summary:
      "The office supporting the Paramount Chief in the discharge of the duties vested in the institution by the Constitution.",
  },
  {
    slug: "chiefs-council",
    name: "Chiefs Council",
    native: "Ozombara",
    summary:
      "The council of traditional leaders recognised by the Ovaherero Traditional Authority, with the mandate and decisions authorised for publication.",
  },
  {
    slug: "senate",
    name: "Senate",
    native: "",
    summary:
      "An institutional organ of the Ovaherero Traditional Authority with responsibilities set out in the Constitution.",
  },
  {
    slug: "ota-executive",
    name: "OTA Executive",
    native: "",
    summary:
      "The executive structure of the Ovaherero Traditional Authority, constituted with approved portfolios and official communications.",
  },
  {
    slug: "women-council",
    name: "OWA(Ovaherero Womans Association)",
    native: "OWA",
    summary:
      "The association advancing the participation, initiatives and programmes of Ovaherero women in community and cultural life.",
  },
  {
    slug: "youth-council",
    name: "OYF(Ovaherero Youth Foundation)",
    native: "OYF",
    summary:
      "The foundation for youth development, cultural education, entrepreneurship and community projects among young Ovaherero.",
  },
  {
    slug: "ovaherero-genocide-foundation",
    name: "Ovaherero Global Genocide Foundation",
    native: "OGGF",
    summary:
      "Research, historical education, advocacy, restitution and restorative justice, and heritage preservation initiatives.",
  },
  {
    slug: "red-flag-leadership",
    name: "Red Flag Leadership",
    native: "Erapi Rotjiserandu",
    summary:
      "The leadership associated with the red flag, its history, approved activities, events and cultural identity.",
  },
  {
    slug: "top-22",
    name: "Top 22",
    native: "",
    summary:
      "An institutional structure of the Ovaherero Traditional Authority, presented here as authorised for public information.",
  },
  {
    slug: "ozondangere",
    name: "Ozondangere",
    native: "",
    summary:
      "An institutional structure whose approved role is published once confirmed by the Ovaherero Traditional Authority.",
  },
  {
    slug: "omuara",
    name: "Omuara",
    native: "",
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