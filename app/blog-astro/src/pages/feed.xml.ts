import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIContext } from "astro";
import { markdownToHtml } from "@repo/markdown/parse";
import { ArticleRSSPreset } from "@repo/markdown/preset";
import { siteDomain } from "@/config/site";
import { getSortedPosts } from "@/lib/utils/content";

export async function GET(context: APIContext) {
  const entries = await getSortedPosts();
  const items: RSSFeedItem[] = new Array(8)
    .fill(0)
    .map((_, i) => entries[i])
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.publishedDate,
      description: entry.data.description,
      link: `/post/${entry.id}`,
      content: markdownToHtml(entry.body ?? "", {
        preset: ArticleRSSPreset,
      }),
    }));

  return rss({
    title: "Yunfi Blog",
    description: "记录折腾，分享经验",
    site: context.site || siteDomain,
    items: items,
    stylesheet: "/rss-style.xsl",
  });
}
