/**
 * OCEANS, 2026 — the parts of /2026 that need sign-off.
 *
 * DANNY'S NOTE IS A DRAFT. These are placeholder words written for Danny to
 * rewrite or approve; they are not his. The page shows them inside a frame
 * marked DRAFT until src/data/year-2026.json → noteApproved is true.
 * Replace `note` with Danny's own words before flipping that flag.
 */

export const FOUNDED = 2012;
export const YEAR = 2026;

export const note = {
  greeting: "To our clients, partners and crew:",
  paragraphs: [
    "Thank you. This year brought OCEANS new certifications, new teammates, a new home on the web, and tools we built to show how we work.",
    "None of it happens without the people who trust us with their missions, and the people who carry them out.",
    "Happy holidays from all of us. We’ll see you in 2027.",
  ],
  signOff: "Danny",
  signature: "Daniel Brent · CEO, OCEANS LLC",
};

/** The two public apps on /apps. */
export const APPS = [
  {
    name: "SKYWATCH",
    kind: "Counter-UAS Incident Atlas",
    line: "Every FAA drone sighting report since 2016, mapped against the infrastructure that matters.",
    url: "https://skywatch.oceansllc.com/",
    host: "skywatch.oceansllc.com",
    img: "/img/apps/sky-main.webp",
    alt: "SKYWATCH map of the continental US with drone sighting clusters in blue and proximity alerts in red.",
  },
  {
    name: "ATLAS",
    kind: "Traceability & Lossiness Analysis",
    line: "Requirement to hardware, and everything lost on the way.",
    url: "https://atlas.oceansllc.com/",
    host: "atlas.oceansllc.com",
    img: "/img/apps/atlas-lossiness.webp",
    alt: "ATLAS Lossiness view: seven scorecards such as requirement attrition and orphaned hardware above an attrition flow diagram.",
  },
] as const;
