import { z } from "zod";

export const postFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional().default(""),

  // Date fields - stored as ISO strings in frontmatter
  date: z.string(), // Original date field
  publishedDate: z.string().optional(),
  updated: z.string().optional(),

  tags: z.array(z.string()),
  series: z
    .object({
      id: z.string(),
      order: z.number().optional(),
    })
    .optional(),
  highlight: z.boolean().optional(),
  published: z.boolean(),
  image: z.string().optional(),
  copyright: z.boolean().optional().default(true),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
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

export const createPostSchema = z.object({
  frontmatter: postFrontmatterSchema,
  content: z.string(),
});

export const updatePostSchema = z.object({
  frontmatter: postFrontmatterSchema,
  content: z.string(),
});
