import { createFileRoute } from "@tanstack/react-router";
import { groupPostsByTag } from "@/lib/content/listing";
import { postPageSize } from "@/lib/content/pagination";
import { getPages, getSortedPosts } from "@/lib/content/server";
import { renderUrlSet } from "@/lib/utils/sitemap";

export const Route = createFileRoute("/sitemap-0.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [posts, pages] = await Promise.all([
          getSortedPosts(),
          getPages(),
        ]);
        const postsByTag = groupPostsByTag(posts);
        const tagPages = Object.fromEntries(
          Object.entries(postsByTag).map(([tag, tagPosts]) => [
            tag,
            Math.max(1, Math.ceil(tagPosts.length / postPageSize)),
          ]),
        );
        return new Response(
          renderUrlSet({
            posts,
            pages,
            tags: Object.keys(postsByTag),
            postPages: Math.max(1, Math.ceil(posts.length / postPageSize)),
            tagPages,
          }),
          {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
            },
          },
        );
      },
    },
  },
});
