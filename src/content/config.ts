// 从 `astro:content` 导入辅助工具
import { z, defineCollection } from "astro:content";
// 为每一个集合定义一个 `type` 和 `schema`
const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    author: z.string().default("Yunfi"),
    image: z.string().optional(),
    updated: z.date(),
    categories: z.union([z.string().array(), z.string()]),
    tags: z.array(z.string()),
    series: z
      .object({
        title: z.string().optional(),
        id: z.string(),
        order: z.number().optional(),
      })
      .optional(),
    highlight: z.boolean().optional(),
    copyright: z.boolean().default(true),
  }),
});
const pageCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date().optional(),
    updated: z.date().optional(),
    author: z.string().default("Yunfi"),
    description: z.string().optional(),
    image: z.string().optional(),
    copyright: z.boolean().default(true),
  }),
});
const projectCollection = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    description: z.string(),
    language: z.array(z.string()),
    links: z.array(z.object({ icon: z.string(), url: z.string() })),
  }),
});
// 导出一个单独的 `collections` 对象来注册你的集合
export const collections = {
  post: postsCollection,
  page: pageCollection,
  project: projectCollection,
};
