import { getCollection } from "astro:content";

export async function getSortedPosts() {
  return (await getCollection("post"))
    .filter((page) => page.data.published)
    .sort((a, b) => Number(b.data.date) - Number(a.data.date));
}
