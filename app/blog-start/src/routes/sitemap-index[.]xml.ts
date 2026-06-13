import { createFileRoute } from "@tanstack/react-router";
import { renderSitemapIndex } from "@/lib/utils/sitemap";

export const Route = createFileRoute("/sitemap-index.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(renderSitemapIndex(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }),
    },
  },
});
