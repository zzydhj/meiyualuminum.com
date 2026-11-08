/**
 * CDN 素材的缓存键表。
 *
 * 为什么必须有这张表：https://file.meiyualuminum.com 是 R2 直链套 Cloudflare 边缘
 * 缓存，源站默认发 `Cache-Control: max-age=31536000`，所以**在桶里同名覆盖文件后，
 * 边缘还会照旧返回替换前的字节，最长一年**。本项没有 Cloudflare API Token、wrangler
 * 也没有 purge 子命令，唯一办法是换缓存键——也就是改 URL 里的 ?v=。
 *
 * 2026-11-07 一天撞两次：
 *   * 6 条画廊视频压完重传，?v=20261107 这个键上存的还是 10 月 8 日的内容（实测
 *     liangjiang 边缘返回 2,909,902 B 而源站只有 555 kB，TTL 剩约 364 天），只能
 *     抬到 ?v=20261107b 才真正对访客生效；
 *   * 那张 1.1 MB 的 Tab 图压完重传，恰好撞上边缘条目 EXPIRED 才回源拿到新字节。
 *     前者有人发现，后者没人发现——所以这事不能靠记性，要靠 docs/media-manifest.py。
 *
 * 抬键规则（重要）：**只有真的换过这个文件才抬**。预防性抬键会让所有访客把素材重新
 * 下一遍，那是实实在在的流量损失，不是无害的保险。没列进这张表的路径就发无 query 的
 * 原始 URL，与历史行为一致。
 *
 * 键的写法：
 *   - 带点号的是精确路径；
 *   - 以 `/` 结尾的是目录前缀，该目录下所有素材共用一个版本（画廊 6 条就属这类：
 *     它们通常整批替换，抬一次全部生效）。
 *   两者都命中时取最长匹配，所以单个文件可以从共用前缀里"脱出来"另开一键。
 */

export const CDN = "https://file.meiyualuminum.com";

const VERSIONS: Record<string, string> = {
  // 画廊 6 条视频（video-project/ 整个目录）
  "video-project/": "20261107b",
  // 首页 hero 背景视频，它的第一个画面就是本页的 LCP 元素
  "meiyu-video-3.mp4": "20261028",
  // 右下角客服头像
  "home/floating-avatar.webp": "20261107",
};

/** 精确路径优先，其次最长目录前缀；都没命中就没有版本号 */
function versionFor(path: string): string | undefined {
  const exact = VERSIONS[path];
  if (exact) return exact;

  let best: string | undefined;
  let bestLen = -1;
  for (const [key, value] of Object.entries(VERSIONS)) {
    if (!key.endsWith("/")) continue;
    if (path.startsWith(key) && key.length > bestLen) {
      best = value;
      bestLen = key.length;
    }
  }
  return best;
}

/**
 * 拼出带缓存键的素材 URL。
 *
 * 只传路径，域名由这里统一给，免得将来换 CDN 域名要改遍全站：
 *   mediaUrl("video-project/xiamen-205e2-project.mp4")
 *     -> https://file.meiyualuminum.com/video-project/xiamen-205e2-project.mp4?v=20261107b
 *   mediaUrl("home/logo-1.png")        // 表里没有，就原样发
 *     -> https://file.meiyualuminum.com/home/logo-1.png
 *
 * 片段（`#t=0.1`）不属于缓存键的一部分，由调用方自己接在返回值后面。
 */
export function mediaUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  const v = versionFor(clean);
  return v ? `${CDN}/${clean}?v=${v}` : `${CDN}/${clean}`;
}
