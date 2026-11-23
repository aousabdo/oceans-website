/**
 * OCEANS, 2026 — the parts of /2026 that need sign-off.
 *
 * DANNY'S NOTE IS A DRAFT. These are placeholder words written for Danny to
 * rewrite or approve; they are not his. src/data/year-2026.json → noteStatus
 * keeps them off the live page ("held") or inside a DRAFT frame ("draft").
 * Replace `note` with Danny's own words before setting it to "approved".
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

/**
 * The 45-second brand film (Oceans/branding/brand-film). Web encodes of
 * OCEANS-brand-film-16x9-1080p-music.mp4: H.264 + AAC 128k, faststart.
 * 1080p ≈ 16 MB, 720p ≈ 7 MB (Cloudflare Pages caps files at 25 MiB).
 * Visuals and score were AI-generated, so the credit says "by OCEANS" and
 * never claims exclusive rights (see brand-film/LICENSES.md).
 * Scenes follow brand-film/CUES.md; they double as the text alternative.
 */
export const FILM = {
  hd: "/video/oceans-film-1080p.mp4",
  sd: "/video/oceans-film-720p.mp4",
  poster: "/video/oceans-film-poster.webp",
  scenes: [
    { t: "0:00", d: "The [~] draws itself on a navy field." },
    { t: "0:04", d: "The brackets open. One wave becomes many, and the field tilts into the sea." },
    { t: "0:09", d: "01 Maritime security: a vessel is tracked and locked." },
    { t: "0:17", d: "02 Systems engineering & RDT&E: sensor nodes are sited and measured." },
    { t: "0:23", d: "03 UAS & counter-UAS: sensors come up on a chart and a drone is locked." },
    { t: "0:30", d: "04 Mission data: the view pulls back to the whole operating picture." },
    { t: "0:35", d: "The brackets close the picture back into the mark." },
    { t: "0:39", d: "OCEANS. Service-disabled veteran-owned. Since 2012. oceansllc.com" },
  ],
} as const;

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
