import { createFileRoute } from "@tanstack/react-router";
import { markdownToHtml } from "@repo/markdown/parse";
import { ArticleRSSPreset } from "@repo/markdown/preset";
import { siteDomain } from "@/config/site";
import { getSortedPosts } from "@/lib/content/server";
import { renderRss } from "@/lib/utils/rss";

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = await getSortedPosts();
        const items = entries.slice(0, 8).map((entry) => ({
          title: entry.data.title,
          pubDate: entry.data.publishedDate,
          description: entry.data.description,
          link: `/post/${entry.id}`,
          content: markdownToHtml(entry.body, {
            preset: ArticleRSSPreset,
          }),
        }));

        return new Response(
          renderRss({
            title: "Yunfi Blog",
            description: "记录折腾，分享经验",
            site: siteDomain,
            items,
            stylesheet: "/rss-style.xsl",
          }),
          {
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
            },
          },
        );
      },
    },
  },
});
