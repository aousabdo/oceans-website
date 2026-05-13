/**
 * /search-index.json — fetched by the Cmd+K command palette on first open.
 * Indexes every searchable page so users can ⌘K to anywhere in the site.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

interface IndexEntry {
  title: string;
  url: string;
  kind: string;
  summary?: string;
  keywords?: string;
}

// Glossary terms — kept in sync with the glossary page manually for now.
// Format: [term, abbreviation, category, first-sentence-of-definition]
const GLOSSARY_TERMS: [string, string | null, string, string][] = [
  ["Acquisition program", null, "Process", "A directed, funded effort to acquire a new system or capability"],
  ["Common Operating Picture", "COP", "Mission Data", "A shared situational display that integrates data from multiple sources"],
  ["Concept of Operations", "CONOPS", "Architecture", "A document describing how a capability will be used in the field"],
  ["Counter-Unmanned Aircraft Systems", "C-UAS", "Mission Domain", "Capabilities for detecting, identifying, tracking, and defeating uncrewed aerial systems"],
  ["Defensible engineering", null, "OCEANS terminology", "Engineering whose conclusions survive technical, operational, and executive review"],
  ["DOTMLPF-P", null, "Process", "Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, and Policy"],
  ["Five Eyes", "FVEY", "International", "The intelligence-sharing alliance comprising US, UK, Canada, Australia, New Zealand"],
  ["Intelligence, Surveillance, and Reconnaissance", "ISR", "Mission Domain", "Activities and systems that gather, process, and disseminate information"],
  ["Measures of Effectiveness", "MOE", "T&E", "Mission-level metrics indicating whether a capability achieves its operational outcome"],
  ["Measures of Performance", "MOP", "T&E", "Sub-system or component-level metrics indicating whether a piece performs to specification"],
  ["Ontology (data)", null, "Mission Data", "A formal model that defines the entities, attributes, and relationships a data system represents"],
  ["Operational Test and Evaluation", "OT&E", "T&E", "Testing performed by operational users under realistic conditions"],
  ["Rules of Engagement", "ROE", "Operations", "The authorities and constraints that govern when force or specific actions may be applied"],
  ["Sea state", null, "Maritime", "A standardized scale describing wave height, wind speed, and ocean conditions"],
  ["Technology Readiness Level", "TRL", "Architecture", "A 1-9 scale describing how mature a technology is"],
  ["Test plan", null, "T&E", "The structured document specifying what will be tested, under what conditions, against which thresholds"],
  ["Threshold / Objective", null, "T&E", "Threshold is the minimum acceptable performance; Objective is the desired level"],
  ["Traceability matrix", null, "Requirements", "A live document linking every requirement back to a validated mission need"],
  ["White Team / Blue Team / Red Team", null, "T&E", "In operational test: Blue is operators, Red is adversarial play, White runs the engagement"],
];

// Top-level pages
const TOP_PAGES: IndexEntry[] = [
  { title: "Home", url: "/", kind: "Page" },
  { title: "Services", url: "/services", kind: "Page", summary: "All four capabilities — requirements, systems engineering, RDT&E, mission data." },
  { title: "Scope an engagement", url: "/scope", kind: "Page", summary: "Interactive tool — get a realistic engagement plan in 4 questions.", keywords: "calculator estimate planner" },
  { title: "Experience", url: "/experience", kind: "Page", summary: "Past performance, partner map, case studies, from-the-data visualizations." },
  { title: "Capabilities statement", url: "/capabilities", kind: "Page", summary: "Single-page summary of what OCEANS does." },
  { title: "About", url: "/about", kind: "Page" },
  { title: "Team", url: "/team", kind: "Page" },
  { title: "Careers", url: "/careers", kind: "Page", summary: "Open roles and how to apply." },
  { title: "Journal", url: "/blog", kind: "Page", summary: "Practitioner notes on T&E, requirements, and federal engineering.", keywords: "blog articles writing" },
  { title: "Glossary", url: "/glossary", kind: "Page", summary: "Federal-engineering terms defined plainly.", keywords: "definitions terms vocabulary" },
  { title: "FAQ", url: "/faq", kind: "Page", summary: "Procurement, compliance, how-we-engage, and capabilities questions.", keywords: "questions answers cage uei naics clearance cmmc nda contract vehicles" },
  { title: "Contact", url: "/contact", kind: "Page", summary: "Start a conversation with OCEANS." },
  { title: "Privacy", url: "/privacy", kind: "Page" },
  { title: "Terms", url: "/terms", kind: "Page" },
];

export const GET: APIRoute = async () => {
  const services = await getCollection("services");
  const caseStudies = await getCollection("caseStudies");
  const team = await getCollection("team");
  const blog = await getCollection("blog", ({ data }) => !data.draft);
  const jobs = await getCollection("jobs");

  const entries: IndexEntry[] = [
    ...TOP_PAGES,
    ...services.map((s) => ({
      title: s.data.title,
      url: `/services/${s.data.slug}`,
      kind: "Service",
      summary: s.data.summary,
      keywords: s.data.tags.join(" "),
    })),
    ...caseStudies.map((c) => ({
      title: c.data.title,
      url: `/experience/${c.data.slug}`,
      kind: "Case study",
      summary: c.data.summary,
      keywords: [c.data.client, c.data.domain, ...c.data.badges].join(" "),
    })),
    ...team.map((t) => ({
      title: t.data.name,
      url: `/team#${t.data.slug}`,
      kind: "Team",
      summary: t.data.role,
    })),
    ...blog.map((b) => ({
      title: b.data.title,
      url: `/blog/${b.id}`,
      kind: "Journal",
      summary: b.data.excerpt,
      keywords: b.data.tags.join(" "),
    })),
    ...jobs.map((j) => ({
      title: j.data.title,
      url: `/careers/${j.data.slug}`,
      kind: "Open role",
      summary: j.data.summary,
      keywords: `${j.data.level} ${j.data.department} ${j.data.location}`,
    })),
    ...GLOSSARY_TERMS.map(([term, abbr, category, defn]) => ({
      title: abbr ? `${term} (${abbr})` : term,
      url: `/glossary#letter-${term[0]!.toUpperCase()}`,
      kind: "Glossary",
      summary: defn,
      keywords: `${category}${abbr ? ` ${abbr}` : ""}`,
    })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
};
