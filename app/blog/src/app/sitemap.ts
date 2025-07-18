import {
  pageCollection,
  postCollection,
} from "@/lib/content-layer/collections";
import type { MetadataRoute } from "next";
const origin = "https://yfi.moe";

export const dynamic = "error";
export const revalidate = 864000; // 10 days

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await postCollection.getCollection();
  const tags = [...new Set(posts.map((post) => post.data.tags).flat())];
  const pages = await pageCollection.getCollection();
  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${origin}/tags`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${origin}/posts`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...posts.map((post): MetadataRoute.Sitemap[0] => ({
      url: `${origin}/post/${post.id}`,
      lastModified: post.data.date,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...tags.map((tag): MetadataRoute.Sitemap[0] => ({
      url: `${origin}/tags/${tag}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    })),
    ...pages.map((page): MetadataRoute.Sitemap[0] => ({
      url: `${origin}/${page.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    })),
  ];
}
