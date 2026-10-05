// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://www.meiyualuminum.com",

  // ← 保持静态：默认页面仍预渲染为静态文件；
  //   只有显式标注 prerender = false 的内容路由（产品/博客/视频）走 Worker 按需 SSR。
  output: "static",

  // Cloudflare Pages/Workers adapter：为上面的 SSR 页面提供运行时（否则 astro build 报 NoAdapterInstalled）。
  // v14 基于 @cloudflare/vite-plugin，dev/preview 会自动以 workerd 运行时提供 Cloudflare 平台代理，无需额外配置。
  adapter: cloudflare(),

  // "ignore"：/videos 和 /videos/ 两种写法都可访问（"always" 在开发服务器会对不带斜杠的 URL 返回 404）
  trailingSlash: "ignore",
  integrations: [mdx()],

});
