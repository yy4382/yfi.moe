import type { APIRoute, InferGetStaticPropsType } from "astro";
import { generateOgImageForPost } from "@/lib/og-image/generateOgImages";
import { getSortedPosts } from "@/lib/utils/content";

export async function getStaticPaths() {
  return (await getSortedPosts()).map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

export const GET: APIRoute<
  InferGetStaticPropsType<typeof getStaticPaths>
> = async ({ props }) =>
  new Response(
    (await generateOgImageForPost({
      ...props.data,
      date: props.data.date.toISOString(),
    })) as BodyInit,
    {
      headers: { "Content-Type": "image/png" },
    },
  );
