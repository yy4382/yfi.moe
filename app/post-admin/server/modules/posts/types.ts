import { z } from "zod";

export interface Post {
  slug: string;
  raw: string;
  filename: string;
}

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  filename: string;
}

export const updatePostSchema = z.object({
  raw: z.string(),
});

export const createPostSchema = z.object({
  slug: z.string(),
  raw: z.string(),
});
