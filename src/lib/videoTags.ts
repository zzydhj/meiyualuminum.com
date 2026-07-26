/**
 * videoTags.ts — 视频标签页共享的取数与分组逻辑
 *
 * 供 video-tags/[tag].astro（第 1 页）与 video-tags/[tag]/page/[page].astro（第 2~N 页）共用，
 * 避免两个路由文件各写一份取数/分组逻辑。
 * 结构与 lib/tagPosts.ts 完全镜像，只是数据源换成了 videos 表。
 */
import { supabase } from "./supabase";

/** 标签列表卡片所需的轻量字段（不取 content 等大字段，控制构建期内存） */
export interface VideoItem {
  slug: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  description: string | null;
  duration: string | null;
  pub_date: string | null;
  author: string | null;
  primary_tag: string | null;
  tags: string[] | null;
}

const FIELDS =
  "slug, title, video_url, thumbnail_url, description, duration, pub_date, author, primary_tag, tags";

/** Supabase 单次请求默认行数上限，分批取数以绕过 */
const BATCH = 1000;

/**
 * 取全部已发布视频（仅轻量字段）。
 * 自动分批拉取，绕过 Supabase 单次 1000 行上限；
 * 按发布时间倒序 + slug 升序次级排序，保证跨页稳定。
 */
export async function fetchAllVideos(): Promise<VideoItem[]> {
  const all: VideoItem[] = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("videos")
      .select(FIELDS)
      .eq("status", "published")
      .order("pub_date", { ascending: false })
      .order("slug", { ascending: true })
      .range(from, from + BATCH - 1);

    if (!data || data.length === 0) break;
    all.push(...(data as VideoItem[]));
    if (data.length < BATCH) break;
    from += BATCH;
  }
  return all;
}

/** 按标签分组：tag → 含该标签的视频列表（保持入参顺序，即时间倒序） */
export function groupVideosByTag(videos: VideoItem[]): Map<string, VideoItem[]> {
  const map = new Map<string, VideoItem[]>();
  for (const video of videos) {
    for (const tag of video.tags ?? []) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(video);
    }
  }
  return map;
}
