// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.meiyualuminum.com",

  // ← 保持静态，不需要改成 server！
  output: "static",

  trailingSlash: "ignore",
  integrations: [mdx(), sitemap()],

});
