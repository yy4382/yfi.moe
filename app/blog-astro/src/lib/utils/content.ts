import { getCollection } from "astro:content";

export async function getSortedPosts() {
  return (await getCollection("post"))
    .filter((post) => post.data.published)
    .sort((a, b) => Number(b.data.date) - Number(a.data.date));
}

export async function getAdjacentPosts(currentSlug: string) {
  const posts = await getSortedPosts();
  const currentIndex = posts.findIndex((post) => post.id === currentSlug);

  if (currentIndex === -1) {
    return { prev: undefined, next: undefined };
  }

  const prev = currentIndex > 0 ? posts[currentIndex - 1] : undefined;
  const next =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined;

  return { prev, next };
}
