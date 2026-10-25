// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
// Workers Cache 的 Cloudflare provider：在 Worker 前置一层边缘缓存，
// 命中时 Worker 根本不运行（HTML 几十毫秒返回，不再 2–9s）。
// 适配器检测到 cache provider 后会自动往生成配置里写 cache.enabled = true，
// 无需手改 wrangler.jsonc。响应头走 Cloudflare-CDN-Cache-Control（只控边缘、
// 不影响浏览器），并自动带 Cache-Tag（路径 tag）便于将来按路径 purge。
import { cacheCloudflare } from "@astrojs/cloudflare/cache";

// 所有 SSR 内容路由共用的缓存窗口，理由见下方 routeRules 注释。
const PAGE_CACHE = { maxAge: 60, swr: 86400 };

// https://astro.build/config
export default defineConfig({
  site: "https://www.meiyualuminum.com",

  // 保持静态：默认页面预渲染为静态文件，由 Workers 的 assets 直出（不计入 Worker 请求、不耗 CPU）；
  // 只读数据库、改库后必须自动反映的路由才显式标 prerender = false 走 Worker 按需渲染。
  // 目前全部查库路由（首页 / 列表 / 详情 / 分类 / 标签 / 画廊 / 分页 / sitemap）已统一转 SSR，
  // 改内容不再需要重新构建部署。
  output: "static",

  // Cloudflare Workers adapter：为上面的 SSR 页面提供运行时（否则 astro build 报 NoAdapterInstalled）。
  // 注意：v14 已不再支持 Cloudflare Pages，产出的是「Workers + static assets」结构；
  // 部署参数（name / assets.directory / kv / workers_dev）以根目录 wrangler.jsonc 为准。
  // v14 基于 @cloudflare/vite-plugin，dev/preview 会自动以 workerd 运行时提供 Cloudflare 平台代理。
  adapter: cloudflare(),

  // "ignore"：/videos 和 /videos/ 两种写法都可访问（"always" 在开发服务器会对不带斜杠的 URL 返回 404）
  trailingSlash: "ignore",
  
  // ── SSR HTML 边缘缓存（Workers Cache）─────────────────────────────
  // 背景：首页/产品/博客全 SSR，实测 TTFB 1–9s、偶发 5s 断连；Meta（WhatsApp /
  // Facebook 链接预览）抓取超时就会合成 418，卡片只剩域名没有图。
  // maxAge 60：新鲜窗 1 分钟，改库后最多 1 分钟反映（急着看就加 ?fresh=1 绕过，
  //   query 是缓存键的一部分，必然 MISS 重渲染）。
  // swr 86400：过期后仍立即回旧件、后台重渲染 —— 抓取器永远拿到快响应，
  //   这正是链接预览需要的。窗口给 24h 而非 1h：本站流量低，闲置超过 swr
  //   窗口缓存条目就没了，下一次抓取又得吃 6s+ 的冷渲染；24h 内只要有人
  //   访问过一次（含抓取器自己触发的后台刷新），条目就一直活着。
  //   代价：过期后第一刷可能是旧件，第二刷即新；急着看加 ?fresh=1。
  // 只列 SSR 内容路由：预渲染页走 ASSETS 直出、不经过 Worker，天然不在其中。
  // 模式语法同文件路由（[param] / [...rest]，不支持 * 通配）。
  cache: { provider: cacheCloudflare() },
  routeRules: {
    "/": PAGE_CACHE,
    "/products/[...rest]": PAGE_CACHE,
    "/blog/[...rest]": PAGE_CACHE,
    "/videos/[...rest]": PAGE_CACHE,
    "/categories/[...rest]": PAGE_CACHE,
    "/tags/[...rest]": PAGE_CACHE,
    "/video-tags/[...rest]": PAGE_CACHE,
    "/project-gallery/[...rest]": PAGE_CACHE,
    "/sitemap.xml": PAGE_CACHE,
    // 单段文档页（/about/ /contact/ …）；[page].astro 的查无此页分支自己关了缓存
    "/[page]": PAGE_CACHE,
  },
});
