import rss from "@astrojs/rss";
import { renderMd } from "@utils/markdown.ts";
import { getSortedPosts } from "@utils/content.ts";
import { getPostPath } from "@utils/path";

export async function GET(context: any) {
  const entries = await getSortedPosts();
  let items = [];
  for (let i = 0; i < 8; i++) {
    const entry = entries[i];
    items.push({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: getPostPath(entry),
      content: await renderMd(entry.body)
    });
  }
  return rss({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    site: context.site,
    items: items,
    stylesheet: "/rss-style.xsl"
  });
}
