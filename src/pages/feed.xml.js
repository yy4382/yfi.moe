import rss from "@astrojs/rss";
import { renderMd } from "../utils/mdUtils";
import { getSortedPosts } from "../utils/urlUtils";

export async function GET(context) {
  const entries = await getSortedPosts();
  let items = [];
  for (let i = 0; i < 8; i++) {
    const entry = entries[i];
    items.push({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: `/post/${entry.slug}/`,
      content: await renderMd(entry.body),
    });
  }
  return rss({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    site: context.site,
    items: items,
    stylesheet: "/rss-style.xsl",
  });
}
