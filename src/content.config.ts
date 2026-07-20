// 导入 glob 加载器（loader）
import { glob } from "astro/loaders";
// 从 `astro:content` 导入工具函数
import { defineCollection } from "astro:content";
// 导入 Zod
import { z } from "astro/zod";

// 为每个集合定义一个 `loader` 和 `schema`
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.mdx", base: "./src/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    tags: z.array(z.string()),
    primaryTag: z.string().optional(), // 主标签，用于面包屑导航，必须是 tags 数组中的一个值

    canonicalURL: z.string().optional(), // 可选，手动指定规范链接，防止重复内容被搜索引擎降权
  }).refine(
    (data) => !data.primaryTag || data.tags.includes(data.primaryTag),
    { message: "primaryTag 必须是 tags 数组中已有的一个值" } // 构建时自动校验，防止输入错误导致面包屑 404
  ),
});

// 导出一个单独的 `collections` 对象用以注册你的集合（们）
export const collections = { blog };