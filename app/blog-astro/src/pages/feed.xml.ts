import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { markdownToHtml } from "@repo/markdown/parse";
import { siteDomain } from "@/config/site";
import { getSortedPosts } from "@/lib/utils/content";

export async function GET(context: APIContext) {
  const entries = await getSortedPosts();
  const items = await Promise.all(
    new Array(8)
      .fill(0)
      .map((_, i) => entries[i])
      .map(async (entry) => ({
        title: entry.data.title,
        pubDate: entry.data.date,
        description: entry.data.description,
        link: `/post/${entry.id}`,
        content: await markdownToHtml(entry.body ?? ""),
      })),
  );
  return rss({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    site: context.site || siteDomain,
    items: items,
    stylesheet: "/rss-style.xsl",
  });
}
