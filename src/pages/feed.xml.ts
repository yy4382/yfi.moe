import rss from "@astrojs/rss";
import { renderMd } from "@utils/markdown.ts";
import { getSortedPosts } from "@utils/content.ts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const entries = await getSortedPosts();
  const items = [];
  for (let i = 0; i < 8; i++) {
    const entry = entries[i];
    items.push({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: getPostPath(entry),
      content: await renderMd(entry.body),
    });
  }
  return rss({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    site: context.site!,
    items: items,
    stylesheet: "/rss-style.xsl",
  });
}
