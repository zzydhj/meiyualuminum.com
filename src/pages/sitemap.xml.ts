/**
 * sitemap.xml — 动态多语言 sitemap（SSR 端点）
 *
 * 自动为每个页面生成 11 种语言的 hreflang 条目。
 * 内容来源：静态路径 + Supabase 数据库（posts/products/pages/videos）。
 */
export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { ACTIVE_LANGS, loc, type Lang } from "../lib/i18n";
import { fetchAllTagPosts, groupPostsByTag } from "../lib/tagPosts";
import { fetchAllVideos, groupVideosByTag } from "../lib/videoTags";
import {
    CATEGORY_MAP,
    fetchAllProjects,
    groupProjectsByCategory,
} from "../lib/projectGallery";

export const GET: APIRoute = async ({ site }) => {
    const SITE = site?.toString().replace(/\/$/, "") || "https://www.meiyualuminum.com";

    // 辅助：拼一条 <url>。lastmod 不传则整个省略。
    // 给静态页统一填「今天」会让 lastmod 每次请求都在变，Google 一旦判定它不可信
    // 就会整体忽略这个字段（连真正可信的内容页也一起废掉），所以宁可不写。
    function urlEntry(basePath: string, lastmod?: string | null): string {
        let altBlock = "";
        if (ACTIVE_LANGS.length > 1) {
            const hrefs = (ACTIVE_LANGS as readonly Lang[]).map(lang => {
                const href = loc(lang, basePath);
                return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${href}" />`;
            });
            // x-default 指向英语（根路径）
            hrefs.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${basePath}" />`);
            altBlock = "\n" + hrefs.join("\n");
        }
        const modBlock = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
        return `  <url>
    <loc>${SITE}${basePath}</loc>${modBlock}${altBlock}
  </url>`;
    }

    // 按路径去重：staticPaths 和 pages 表都含 /contact/，之前会原样输出两条。
    const seen = new Map<string, string>();
    function addEntry(basePath: string, lastmod?: string | null) {
        if (!seen.has(basePath)) seen.set(basePath, urlEntry(basePath, lastmod));
    }

    // 静态路径（始终存在）
    const staticPaths = [
        "/",
        "/blog/",
        "/products/",
        "/videos/",
        "/categories/",
        "/tags/",
        "/video-tags/",
        "/contact/",
        // /thank-you/ 故意不收：询盘成功页，无内容价值；页面已标 robots 禁止编录，
        // 再列进清单就是自相矛盾。
        "/installation-guides/",
        "/procurement-guide/",
        "/tools/",
        "/tools/ceiling-take-off/",
        "/tools/aluminum-weight/",
        "/tools/perforation-open-area/",
        "/surface-treatment-comparison/",
    ];

    for (const p of staticPaths) {
        addEntry(p);
    }

    // 数据库查询：所有已发布的英语内容
    // 各表日期列不一致：posts/products 有 created_at；videos 用 pub_date；pages 无日期列。
    // supabase-js 出错不抛异常只返回 error，故逐表独立查询并记日志，避免单表问题拖垮整个 sitemap。
    async function collect(table: string, pathPrefix: string, dateCol: string | null) {
        try {
            const cols = dateCol ? `slug, ${dateCol}` : "slug";
            const res = await supabase
                .from(table)
                .select(cols)
                .eq("lang", "en")
                .eq("status", "published");
            if (res.error) {
                console.error(`[sitemap] ${table} query error:`, res.error.message);
                return;
            }
            const rows = (res.data ?? []) as unknown as Array<Record<string, string | null>>;
            for (const row of rows) {
                const raw = dateCol ? row[dateCol] : null;
                addEntry(`${pathPrefix}${row.slug}/`, raw ? raw.split("T")[0] : null);
            }
        } catch (e) {
            console.error(`[sitemap] ${table} query failed:`, e);
        }
    }

    await collect("posts", "/blog/", "created_at");
    await collect("products", "/products/", "created_at");
    await collect("pages", "/", null);
    await collect("videos", "/videos/", "pub_date");

    // 分类页：/categories/<slug>/ 全部 200 且是关键词价值最高的着陆页，
    // 之前一条都没进 sitemap。注意 categories 表没有 status / lang 列，不能套 collect()。
    try {
        const res = await supabase.from("categories").select("slug");
        if (res.error) {
            console.error("[sitemap] categories query error:", res.error.message);
        } else {
            for (const row of (res.data ?? []) as Array<{ slug: string }>) {
                addEntry(`/categories/${row.slug}/`);
            }
        }
    } catch (e) {
        console.error("[sitemap] categories query failed:", e);
    }

    // 归档页：博客标签 / 视频标签 / 项目画廊分类。
    // 这里刻意复用各路由自己的取数与分组函数，而不是自己再拼一遍 slug 规则：
    // 两套规则一旦漂移，sitemap 就会输出一堆 404，比漏收严重得多。
    // 标签值带空格与 &（如 "Quality & Certifications"、"How It's Made"），必须
    // encodeURIComponent：既避开 URL 非法字符，也顺带不会在 XML 里落下裸 &。
    try {
        for (const tag of groupPostsByTag(await fetchAllTagPosts()).keys()) {
            addEntry(`/tags/${encodeURIComponent(tag)}/`);
        }
    } catch (e) {
        console.error("[sitemap] tags query failed:", e);
    }

    try {
        for (const tag of groupVideosByTag(await fetchAllVideos()).keys()) {
            addEntry(`/video-tags/${encodeURIComponent(tag)}/`);
        }
    } catch (e) {
        console.error("[sitemap] video tags query failed:", e);
    }

    try {
        // 与 [category].astro 的 getStaticPaths 同口径：只收 CATEGORY_MAP 内的分类
        for (const category of groupProjectsByCategory(await fetchAllProjects()).keys()) {
            if (CATEGORY_MAP[category]) {
                addEntry(`/project-gallery/${encodeURIComponent(category)}/`);
            }
        }
    } catch (e) {
        console.error("[sitemap] project gallery query failed:", e);
    }

    // 分页页 /…/page/N/ 故意不收：它们只是同一份列表的第 2~N 页，
    // 收进去等于叫 Google 去爬 N 遍近似重复内容。只放第 1 页，分页靠页内链接自然发现。

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...seen.values()].join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
    });
};
