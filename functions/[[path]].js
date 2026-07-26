/**
 * Cloudflare Pages Function —— 全站维护模式开关
 *
 * 原理：Cloudflare Pages 会在每个请求到达静态文件之前先经过 functions/ 目录里的函数。
 *       开关打开时，所有路由（首页、产品、博客……）统一返回维护页（HTTP 503）。
 *
 * ✅ 开启维护模式：
 *    1. 把下面 MAINTENANCE_MODE 改成 true
 *    2. 提交代码 / 在 Cloudflare Pages 重新部署
 *
 * ❌ 关闭维护模式：
 *    1. 改回 false
 *    2. 重新部署
 *
 * 为什么用 503 而不是 200：
 *    503 + Retry-After 告诉搜索引擎"我只是暂时下线，请稍后再来"，
 *    不会让 Google 把已收录的页面从索引里删掉，维护完流量原样恢复。
 *    维护页本身也加了 noindex，双保险。
 */
const MAINTENANCE_MODE = true;

export async function onRequest({ request, env, next }) {
  // 正常模式：直接放行，请求照常到达静态页面（几乎零开销）
  if (!MAINTENANCE_MODE) {
    return next();
  }

  // 维护模式：从静态资源里取出维护页，返回给所有访客
  try {
    const maintenanceUrl = new URL("/maintenance.html", request.url);
    const page = await env.ASSETS.fetch(maintenanceUrl);

    if (page.ok) {
      return new Response(await page.text(), {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // 禁止缓存：关闭维护后要立刻恢复，不能被 CDN/浏览器缓存住
          "Cache-Control": "no-store, no-cache, must-revalidate",
          // 建议搜索引擎 1 小时后再来抓取
          "Retry-After": "3600",
        },
      });
    }
  } catch (e) {
    // ASSETS 绑定异常时走兜底，绝不能让访客看到报错
  }

  // 兜底：维护页文件意外丢失时，返回最简维护提示
  return new Response(
    "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='robots' content='noindex,nofollow'><title>Site Maintenance</title></head><body style='font-family:sans-serif;text-align:center;padding-top:20vh'><h1>We&rsquo;ll be back soon</h1><p>Site is under maintenance. Please check back later.</p></body></html>",
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "3600",
      },
    },
  );
}
