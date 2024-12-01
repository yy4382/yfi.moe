import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@utils/og-image/generateOgImages";

export async function getStaticPaths() {
  const posts = await getCollection("post", (p) => !p.data.image);

  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await generateOgImageForPost(props.data), {
    headers: { "Content-Type": "image/png" },
  });
