import { createFileRoute } from "@tanstack/react-router";
import { getPost } from "@/lib/content/source";
import { generateOgImageForPost } from "@/lib/og-image/generate-og-images";

export const Route = createFileRoute("/post/$slug/og.png")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const post = await getPost(params.slug);
        if (!post) {
          return new Response("Not found", { status: 404 });
        }
        const png = await generateOgImageForPost({
          title: post.data.title,
          date: new Date(post.data.publishedDate).toISOString(),
        });
        return new Response(new Uint8Array(png), {
          headers: {
            "Content-Type": "image/png",
          },
        });
      },
    },
  },
});
