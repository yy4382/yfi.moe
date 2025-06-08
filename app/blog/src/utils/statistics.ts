import { getSortedPosts } from "./content";

export default async function getStatistics() {
  const posts = await getSortedPosts();
  const articles = posts.length;
  let words = 0;
  for (const post of posts) {
    words += post.data.readingTime.words;
  }
  const tags = [...new Set(posts.map((post) => post.data.tags).flat())].length;
  return { articles, words, tags };
}
