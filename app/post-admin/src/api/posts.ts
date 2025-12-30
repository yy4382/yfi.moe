import type { Post, PostListItem } from "../types/post";
import { apiClient } from "./client";

export async function fetchPosts(): Promise<PostListItem[]> {
  const data = await apiClient<{ posts: PostListItem[] }>("/posts");
  return data.posts;
}

export async function fetchPost(slug: string): Promise<Post> {
  const data = await apiClient<{ post: Post }>(`/posts/${slug}`);
  return data.post;
}

export async function updatePost(slug: string, raw: string): Promise<void> {
  await apiClient(`/posts/${slug}`, {
    method: "PUT",
    body: JSON.stringify({ raw }),
  });
}

export async function createPost(slug: string, raw: string): Promise<void> {
  await apiClient("/posts", {
    method: "POST",
    body: JSON.stringify({ slug, raw }),
  });
}

export async function deletePost(slug: string): Promise<void> {
  await apiClient(`/posts/${slug}`, {
    method: "DELETE",
  });
}
