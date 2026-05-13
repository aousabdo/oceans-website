import { SITE_NAME, SITE_URL } from "./seo";

/**
 * Organization JSON-LD — emitted on every page via BaseLayout.
 *
 * Notes:
 *  - `naics`: 541330 (Engineering Services). Confirm CAGE/UEI with Danny before
 *    surfacing those publicly.
 *  - `foundingDate`: 2013 per company history.
 *  - `areaServed`: federal customers across US + FVEY allies.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "OCEANS",
    legalName: "OCEANS LLC",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/og-default.png`,
      width: 1200,
      height: 630,
    },
    image: `${SITE_URL}/og-default.png`,
    description:
      "Systems engineering, test & evaluation, and mission data solutions for federal customers who need defensible outcomes.",
    foundingDate: "2013",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jacksonville",
      addressRegion: "FL",
      addressCountry: "US",
    },
    sameAs: ["https://www.linkedin.com/company/o.c.e.a.n.s.-llc"],
    knowsAbout: [
      "Systems Engineering",
      "Test and Evaluation",
      "Operational Test and Evaluation",
      "Mission Data Systems",
      "Federal Acquisition",
      "Counter-Unmanned Aircraft Systems",
      "Intelligence, Surveillance, and Reconnaissance",
    ],
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Canada" },
      { "@type": "Country", name: "Australia" },
      { "@type": "Country", name: "New Zealand" },
    ],
    naics: "541330",
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

export function articleLd(input: {
  title: string;
  description: string;
  date: Date;
  author: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date.toISOString(),
    author: { "@type": "Person", name: input.author },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: input.image ?? `${SITE_URL}/og-default.png`,
    mainEntityOfPage: input.url,
  };
}

export function jobPostingLd(input: {
  title: string;
  description: string;
  datePosted: Date;
  location: string;
  employmentType: string;
  url: string;
}) {
  const employmentMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
  };
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: input.title,
    description: input.description,
    datePosted: input.datePosted.toISOString(),
    hiringOrganization: { "@id": `${SITE_URL}/#organization` },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: input.location },
    },
    employmentType: employmentMap[input.employmentType] ?? "FULL_TIME",
    url: input.url,
    directApply: true,
  };
}

/**
 * Case-study JSON-LD — modeled as a CreativeWork describing the engagement.
 * Includes about (the domain) and audience (federal), plus the impact bullets
 * as `keywords`.
 */
export function caseStudyLd(input: {
  title: string;
  description: string;
  client: string;
  year: number;
  domain: string;
  capabilities: string[];
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": input.url,
    name: input.title,
    description: input.description,
    creator: { "@id": `${SITE_URL}/#organization` },
    about: input.domain,
    audience: { "@type": "BusinessAudience", audienceType: input.client },
    keywords: input.capabilities.join(", "),
    datePublished: `${input.year}-01-01`,
    url: input.url,
    isAccessibleForFree: true,
    inLanguage: "en-US",
  };
}

/**
 * BreadcrumbList — pass an array of [name, path] tuples (root → current page).
 * Example: breadcrumbLd([["Home", "/"], ["Experience", "/experience"], ["DoD C2 OT&E", "/experience/dod-c2-ote"]])
 */
export function breadcrumbLd(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: new URL(path, SITE_URL).toString(),
    })),
  };
}
