/**
 * 维护模式拦截器 — Cloudflare Pages Function
 *
 * 捕获所有路径，返回 Coming Soon 页面。
 * 上线时删除此文件即可恢复正常访问。
 */

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meiyu Aluminum — Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #f8fafc;
      text-align: center;
      padding: 1.5rem;
    }
    .container { max-width: 520px; }
    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
      color: #e2e8f0;
    }
    .logo span { color: #38bdf8; }
    h1 {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 1.125rem;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .contact {
      display: inline-block;
      padding: 0.75rem 2rem;
      border: 1px solid #334155;
      border-radius: 9999px;
      color: #cbd5e1;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .contact:hover {
      border-color: #38bdf8;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">MEIYU <span>ALUMINUM</span></div>
    <h1>Coming Soon</h1>
    <p>We're building something great.<br />Our new website is on its way.</p>
    <a href="https://wa.me/8613509838008?text=Hi%2C%20I'm%20interested%20in%20your%20aluminum%20products" target="_blank" rel="noopener" class="contact">Chat on WhatsApp</a>
  </div>
</body>
</html>`;

export function onRequest() {
  return new Response(HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
