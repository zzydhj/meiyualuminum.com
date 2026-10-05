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

export const GET: APIRoute = async ({ site }) => {
    const SITE = site?.toString().replace(/\/$/, "") || "https://www.meiyualuminum.com";
    const today = new Date().toISOString().split("T")[0];

    // 辅助：生成一个 URL 的 hreflang XML 片段（停放时仅英文，不输出 hreflang）
    function urlEntry(basePath: string, lastmod: string): string {
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
        return `  <url>
    <loc>${SITE}${basePath}</loc>
    <lastmod>${lastmod}</lastmod>${altBlock}
  </url>`;
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
        "/thank-you/",
        "/installation-guides/",
        "/surface-treatment-comparison/",
    ];

    const entries: string[] = [];

    for (const p of staticPaths) {
        entries.push(urlEntry(p, today));
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
                const lastmod = (raw || today).split("T")[0];
                entries.push(urlEntry(`${pathPrefix}${row.slug}/`, lastmod));
            }
        } catch (e) {
            console.error(`[sitemap] ${table} query failed:`, e);
        }
    }

    await collect("posts", "/blog/", "created_at");
    await collect("products", "/products/", "created_at");
    await collect("pages", "/", null);
    await collect("videos", "/videos/", "pub_date");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
    });
};
