import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_NAME, SITE_URL } from "@lib/seo";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => +b.data.date - +a.data.date
  );
  return rss({
    title: `${SITE_NAME} — Journal`,
    description: "Recent thinking from OCEANS LLC.",
    site: context.site?.toString() ?? SITE_URL,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt,
      link: `/blog/${p.id}/`,
    })),
  });
}
