/**
 * tagPosts.ts — 标签列表页共享的取数与分组逻辑
 *
 * 供 tags/[tag].astro（第 1 页）与 tags/[tag]/page/[page].astro（第 2~N 页）共用，
 * 避免两个路由文件各写一份取数/分组逻辑。
 */
import { supabase } from "./supabase";

/** 标签列表卡片所需的轻量字段（不取 content 等大字段，控制构建期内存） */
export interface TagPost {
  slug: string;
  title: string;
  image_url: string | null;
  description: string | null;
  pub_date: string | null;
  author: string | null;
  primary_tag: string | null;
  tags: string[] | null;
}

const FIELDS =
  "slug, title, image_url, description, pub_date, author, primary_tag, tags";

/** Supabase 单次请求默认行数上限，分批取数以绕过 */
const BATCH = 1000;

/**
 * 取全部已发布文章（仅轻量字段）。
 * 自动分批拉取，绕过 Supabase 单次 1000 行上限；
 * 按发布时间倒序 + slug 升序次级排序，保证跨页稳定。
 */
export async function fetchAllTagPosts(): Promise<TagPost[]> {
  const all: TagPost[] = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("posts")
      .select(FIELDS)
      .eq("status", "published")
      .order("pub_date", { ascending: false })
      .order("slug", { ascending: true })
      .range(from, from + BATCH - 1);

    if (!data || data.length === 0) break;
    all.push(...(data as TagPost[]));
    if (data.length < BATCH) break;
    from += BATCH;
  }
  return all;
}

/** 按标签分组：tag → 含该标签的文章列表（保持入参顺序，即时间倒序） */
export function groupPostsByTag(posts: TagPost[]): Map<string, TagPost[]> {
  const map = new Map<string, TagPost[]>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(post);
    }
  }
  return map;
}
