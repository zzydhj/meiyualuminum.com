/**
 * sitemap.xml — 动态多语言 sitemap（SSR 端点）
 *
 * 自动为每个页面生成 11 种语言的 hreflang 条目。
 * 内容来源：静态路径 + Supabase 数据库（posts/products/pages/videos）。
 */
export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { SUPPORTED_LANGS, loc, DEFAULT_LANG, type Lang } from "../lib/i18n";

export const GET: APIRoute = async ({ site }) => {
    const SITE = site?.toString().replace(/\/$/, "") || "https://www.meiyualuminum.com";
    const today = new Date().toISOString().split("T")[0];

    // 辅助：生成一个 URL 的 hreflang XML 片段
    function urlEntry(basePath: string, lastmod: string): string {
        const hrefs = (SUPPORTED_LANGS as readonly Lang[]).map(lang => {
            const href = loc(lang, basePath);
            return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${href}" />`;
        });
        // x-default 指向英语（根路径）
        hrefs.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${basePath}" />`);
        return `  <url>
    <loc>${SITE}${basePath}</loc>
    <lastmod>${lastmod}</lastmod>
${hrefs.join("\n")}
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
    try {
        const [postsRes, productsRes, pagesRes, videosRes] = await Promise.all([
            supabase.from("posts").select("slug, updated_at, created_at").eq("lang", "en").eq("status", "published"),
            supabase.from("products").select("slug, updated_at, created_at").eq("lang", "en").eq("status", "published"),
            supabase.from("pages").select("slug, updated_at, created_at").eq("lang", "en").eq("status", "published"),
            supabase.from("videos").select("slug, updated_at, created_at").eq("lang", "en").eq("status", "published"),
        ]);

        if (postsRes.data) {
            for (const p of postsRes.data) {
                const lastmod = (p.updated_at || p.created_at || today).split("T")[0];
                entries.push(urlEntry(`/blog/${p.slug}/`, lastmod));
            }
        }
        if (productsRes.data) {
            for (const p of productsRes.data) {
                const lastmod = (p.updated_at || p.created_at || today).split("T")[0];
                entries.push(urlEntry(`/products/${p.slug}/`, lastmod));
            }
        }
        if (pagesRes.data) {
            for (const p of pagesRes.data) {
                const lastmod = (p.updated_at || p.created_at || today).split("T")[0];
                entries.push(urlEntry(`/${p.slug}/`, lastmod));
            }
        }
        if (videosRes.data) {
            for (const v of videosRes.data) {
                const lastmod = (v.updated_at || v.created_at || today).split("T")[0];
                entries.push(urlEntry(`/videos/${v.slug}/`, lastmod));
            }
        }
    } catch (e) {
        console.error("[sitemap] DB query failed, using static paths only:", e);
    }

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
