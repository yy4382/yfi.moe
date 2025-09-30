import { getCollection } from "astro:content";
import { findSimilarDocuments } from "./tf-idf";

const noDraftsDefault = !import.meta.env.DEV;

export async function getSortedPosts(
  { noDrafts } = { noDrafts: noDraftsDefault },
) {
  return (await getCollection("post"))
    .filter((post) => (noDrafts ? post.data.published : true))
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

export async function getSimilarPosts(
  currentSlug: string,
  limit = 3,
  { noDrafts } = { noDrafts: noDraftsDefault },
) {
  const posts = await getSortedPosts({ noDrafts });

  // Prepare documents for TF-IDF analysis
  const documents = posts.map((post) => ({
    id: post.id,
    text: `${post.data.title} ${post.data.description} ${post.data.tags.join(" ")} ${post.body}`,
  }));

  // Find similar documents
  const similarDocs = findSimilarDocuments(currentSlug, documents, limit);

  // Map back to post objects
  return similarDocs
    .map((similar) => {
      const post = posts.find((p) => p.id === similar.id);
      return post
        ? {
            post,
            score: similar.score,
          }
        : null;
    })
    .filter((item) => item !== null);
}
