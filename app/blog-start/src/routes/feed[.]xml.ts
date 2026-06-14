import { createFileRoute } from "@tanstack/react-router";
import { siteDomain } from "@/config/site";
import { getSortedPosts } from "@/lib/content/server";
import { renderRssContentHtml } from "@/lib/markdown/server-functions";
import { renderRss } from "@/lib/utils/rss";

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = await getSortedPosts();
        const recentEntries = entries.slice(0, 8);
        const contentHtml = await renderRssContentHtml({
          data: { bodies: recentEntries.map((entry) => entry.body) },
        });
        const items = recentEntries.map((entry, index) => ({
          title: entry.data.title,
          pubDate: entry.data.publishedDate,
          description: entry.data.description,
          link: `/post/${entry.id}`,
          content: contentHtml[index] ?? "",
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
