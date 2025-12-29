import { readdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../../../env.js";
import type { Post, PostListItem, PostFrontmatter } from "../types.js";
import { parseFrontmatter, serializeFrontmatter } from "./frontmatter.js";

const postsDir = join(env.POSTS_REPO_PATH, env.POSTS_SUBDIR);

export async function listPosts(): Promise<PostListItem[]> {
  const files = await readdir(postsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const content = await readFile(join(postsDir, file), "utf-8");
      const { frontmatter } = parseFrontmatter(content);
      return {
        slug: frontmatter.slug,
        title: frontmatter.title,
        date: frontmatter.date,
        published: frontmatter.published,
        tags: frontmatter.tags,
        filename: file,
      };
    }),
  );

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  const files = await readdir(postsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  for (const file of mdFiles) {
    const raw = await readFile(join(postsDir, file), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);

    if (frontmatter.slug === slug) {
      return { frontmatter, content, filename: file };
    }
  }

  return null;
}

export async function updatePost(
  slug: string,
  frontmatter: PostFrontmatter,
  content: string,
): Promise<void> {
  const existingPost = await getPost(slug);
  if (!existingPost) {
    throw new Error(`Post not found: ${slug}`);
  }

  const rawContent = serializeFrontmatter(frontmatter, content);
  await writeFile(join(postsDir, existingPost.filename), rawContent, "utf-8");
}

export async function createPost(
  frontmatter: PostFrontmatter,
  content: string,
): Promise<void> {
  // Check if slug already exists
  const existingPost = await getPost(frontmatter.slug);
  if (existingPost) {
    throw new Error(`Post with slug "${frontmatter.slug}" already exists`);
  }

  const filename = `${frontmatter.slug}.md`;
  const rawContent = serializeFrontmatter(frontmatter, content);
  await writeFile(join(postsDir, filename), rawContent, "utf-8");
}

export async function deletePost(slug: string): Promise<void> {
  const existingPost = await getPost(slug);
  if (!existingPost) {
    throw new Error(`Post not found: ${slug}`);
  }

  await unlink(join(postsDir, existingPost.filename));
}
