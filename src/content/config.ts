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
    photos: z.string().default("/img/meta/default_cover.webp"),
    updated: z.date(),
    categories: z.union([z.union([z.string().array(),z.string()]).array(),z.string().optional()]),
    tags: z.array(z.string()),
  }),
});
// 导出一个单独的 `collections` 对象来注册你的集合
export const collections = {
  post: postsCollection,
};
