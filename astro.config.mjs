// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.meiyualuminum.com",

  // ← 保持静态，不需要改成 server！
  output: "static",

  // "ignore"：/videos 和 /videos/ 两种写法都可访问（"always" 在开发服务器会对不带斜杠的 URL 返回 404）
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],

});
