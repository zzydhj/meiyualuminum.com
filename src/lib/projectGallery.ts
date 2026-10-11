/**
 * projectGallery.ts — Project Gallery 各路由共享的取数与分组逻辑
 *
 * 供 /project-gallery/ 主页（[page].astro SSR 挂载）、分页页与各分类页共用，
 * 避免多个路由各写一份取数/分组逻辑。
 * 结构与 lib/videoTags.ts 镜像，数据源为 posts 表（primary_tag='projects'）。
 */
import { supabase } from "./supabase";

/** 画廊卡片所需的轻量字段（不取 content 等大字段，控制构建期内存） */
export interface ProjectItem {
    slug: string;
    title: string;
    description: string | null;
    image_url: string | null;
    image_alt: string | null;
    tags: string[] | null;
    pub_date: string | null;
}

/** 分类 slug → 展示名 + 图标（药丸与卡片徽章的单一来源） */
export const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
    airport: { label: "Airport", icon: "✈" },
    hotel: { label: "Hotel & Resort", icon: "🏨" },
    mall: { label: "Shopping Mall", icon: "🛍" },
    office: { label: "Office Building", icon: "🏢" },
    hospital: { label: "Hospital", icon: "🏥" },
    school: { label: "School", icon: "🎓" },
    station: { label: "Station", icon: "🚇" },
    government: { label: "Government", icon: "🏛" },
};

/** 地区标签（卡片右侧徽章 + 统计条 Regions 口径） */
export const REGION_TAGS = [
    "china",
    "asia",
    "europe",
    "north-america",
    "south-america",
    "africa",
    "middle-east",
    "oceania",
];

const FIELDS = "slug, title, description, image_url, image_alt, tags, pub_date";

/** Supabase 单次请求默认行数上限，分批取数以绕过 */
const BATCH = 1000;

/**
 * 取全部已发布项目案例（仅轻量字段）。
 * 自动分批拉取，绕过 Supabase 单次 1000 行上限（旧实现单次查询会静默截断）；
 * 按发布时间倒序 + slug 升序次级排序，保证跨页稳定、不重不漏。
 */
export async function fetchAllProjects(): Promise<ProjectItem[]> {
    const all: ProjectItem[] = [];
    let from = 0;
    while (true) {
        const { data } = await supabase
            .from("posts")
            .select(FIELDS)
            .eq("status", "published")
            .eq("primary_tag", "projects")
            .order("pub_date", { ascending: false })
            .order("slug", { ascending: true })
            .range(from, from + BATCH - 1);

        if (!data || data.length === 0) break;
        all.push(...(data as ProjectItem[]));
        if (data.length < BATCH) break;
        from += BATCH;
    }
    return all;
}

/** 按分类分组：category → 该分类项目列表（保持入参顺序，即时间倒序）；只认 CATEGORY_MAP 内分类 */
export function groupProjectsByCategory(
    projects: ProjectItem[],
): Map<string, ProjectItem[]> {
    const map = new Map<string, ProjectItem[]>();
    for (const project of projects) {
        for (const tag of project.tags ?? []) {
            if (!CATEGORY_MAP[tag]) continue;
            if (!map.has(tag)) map.set(tag, []);
            map.get(tag)!.push(project);
        }
    }
    return map;
}

/** 统计条数据：项目总数 / 覆盖地区数 / 行业数 */
export function computeProjectStats(projects: ProjectItem[]) {
    const regions = new Set<string>();
    const sectors = new Set<string>();
    for (const project of projects) {
        for (const tag of project.tags ?? []) {
            if (REGION_TAGS.includes(tag)) regions.add(tag);
            if (CATEGORY_MAP[tag]) sectors.add(tag);
        }
    }
    return { total: projects.length, regions: regions.size, sectors: sectors.size };
}

/** 卡片主分类徽章（第一个命中 CATEGORY_MAP 的标签） */
export function projectCategory(project: ProjectItem): string {
    return (project.tags ?? []).find((t) => CATEGORY_MAP[t]) ?? "";
}

/** 卡片地区徽章（第一个命中 REGION_TAGS 的标签） */
export function projectRegion(project: ProjectItem): string {
    return (project.tags ?? []).find((t) => REGION_TAGS.includes(t)) ?? "";
}
