/**
 * 维护模式拦截器 — Cloudflare Pages Function
 *
 * 捕获所有路径，返回 maintenance.html。
 * 上线时删除此文件即可恢复正常访问。
 */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // 允许访问维护页本身及其静态资源
  if (url.pathname === "/maintenance.html") {
    return env.ASSETS.fetch(request);
  }

  // 所有其他路径 → 返回维护页
  const maintenanceUrl = new URL("/maintenance.html", url.origin);
  const maintenanceReq = new Request(maintenanceUrl.toString(), request);
  const res = await env.ASSETS.fetch(maintenanceReq);

  return new Response(res.body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
