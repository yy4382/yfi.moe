import { createFileRoute } from "@tanstack/react-router";
import { createServerOnlyFn } from "@tanstack/react-start";

const loadOgDependencies = createServerOnlyFn(async () => {
  const [{ getPost }, { generateOgImageForPost }] = await Promise.all([
    import("@/lib/content/source"),
    import("@/lib/og-image/generate-og-images"),
  ]);

  return { getPost, generateOgImageForPost };
});

export const Route = createFileRoute("/post/$slug/og.png")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getPost, generateOgImageForPost } = await loadOgDependencies();
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
