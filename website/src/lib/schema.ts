import { SITE_NAME, SITE_URL } from "./seo";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    sameAs: ["https://www.linkedin.com/company/oceans-llc"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jacksonville",
      addressRegion: "FL",
      addressCountry: "US",
    },
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
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    image: input.image,
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
    hiringOrganization: { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: input.location },
    },
    employmentType: employmentMap[input.employmentType] ?? "FULL_TIME",
    url: input.url,
  };
}
