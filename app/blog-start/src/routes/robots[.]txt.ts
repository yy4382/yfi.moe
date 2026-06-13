import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          "User-Agent: *\nAllow: /\nDisallow: /tags/\nDisallow: /admin/\n\nSitemap: https://yfi.moe/sitemap-index.xml\n",
          {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          },
        ),
    },
  },
} as never);
