import { getSortedPosts } from "./content";
import { render } from "astro:content";

export default async function getStatistics() {
  const posts = await getSortedPosts();
  const articles = posts.length;
  let words = 0;
  for (const post of posts) {
    const { remarkPluginFrontmatter } = await render(post);
    words += remarkPluginFrontmatter.words;
  }
  const tags = [...new Set(posts.map((post) => post.data.tags).flat())].length;
  return { articles, words, tags };
}
