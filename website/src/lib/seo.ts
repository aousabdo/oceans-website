import { ACTIVE_THEME } from "./theme";

const SITE = {
  name: "OCEANS LLC",
  url: "https://www.oceansllc.com",
  defaultDescription:
    "Systems engineering, test & evaluation, and mission data solutions for federal customers who need defensible outcomes.",
};

export interface SeoInput {
  title: string;
  description?: string | undefined;
  path: string;
  image?: string | undefined;
  type?: "website" | "article" | undefined;
}

export function buildSeo(input: SeoInput) {
  const description = input.description ?? SITE.defaultDescription;
  const title = input.title === SITE.name ? SITE.name : `${input.title} — ${SITE.name}`;
  const url = new URL(input.path, SITE.url).toString();
  const image = new URL(input.image ?? "/og-default.png", SITE.url).toString();
  return {
    title,
    description,
    url,
    image,
    type: input.type ?? "website",
    siteName: SITE.name,
    theme: ACTIVE_THEME,
  };
}

export const SITE_NAME = SITE.name;
export const SITE_URL = SITE.url;
