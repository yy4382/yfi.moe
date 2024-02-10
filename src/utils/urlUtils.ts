import { getCollection } from "astro:content";

export async function getSortedPosts() {
  return (await getCollection("post")).sort(
    (a, b) => Number(b.data.date) - Number(a.data.date),
  );
}
