import type { APIRoute, InferGetStaticPropsType } from "astro";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@utils/og-image/generateOgImages";
import runtimeEnv from "@utils/runtimeEnv";

export async function getStaticPaths() {
  const posts = await getCollection("post", (p) => !p.data.image);

  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

export const GET: APIRoute<
  InferGetStaticPropsType<typeof getStaticPaths>
> = async ({ props }) =>
  new Response(
    runtimeEnv() === "production"
      ? await generateOgImageForPost({
          ...props.data,
          date: props.data.date.toISOString(),
        })
      : new ArrayBuffer(0),
    {
      headers: { "Content-Type": "image/png" },
    },
  );
