// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

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
});
