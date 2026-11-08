// 首页首屏探针（只读，量事实，不改任何东西）
//
// 为什么要有这份文件：查「移动端队列跑完时 LCP 从 4s 变 9–11s」这件事，
// 我把三条常规路都实测了一遍，全是死的 ——
//   · Lighthouse JSON：largest-contentful-paint 审计没有 details 键，
//     lcp-breakdown-insight / lcp-discovery-insight 都是 notApplicable；
//   · --save-assets 的 trace：NavStartToLargestContentfulPaint 只有 ::Invalidate::，
//     一条 ::Candidate:: 都没有；
//   · CDP Page.getLargestContentfulPaint：本机 Chrome 156 回 -32601 wasn't found；
//   · JS PerformanceObserver：visibilityState=visible、FCP/CLS 都正常投递，
//     唯独 LCP 条目 0 条（连一张 800×800 的图都不投递）—— 环境限制，不是页面问题。
// 所以改成按定义量：LCP = 首屏视口内「可见面积最大」的 img/video/文字块，
// 它的下载窗口能从 resource timing 直接读到。候选是谁 + 队列有没有抢首屏带宽，
// 这两个问题用几何和网络时序就能判，不需要浏览器把 LCP 条目交出来。
//
// 三条判据（任何一条 FAIL 就 exit 1）：
//   V1 首屏视口内面积最大的元素必须是 hero 底图（.video-hero-poster / .video-hero-bg）。
//      它是 LCP 元素；队列里的屏外图按定义不可能成为更大的候选，这条就是那句话的形式化。
//   V2 队列不许重复下载「首屏元素正在下的那个 URL」—— 同 URL 的 fetch 条目 dur>50ms 才算。
//      （2026-11-08 首跑就抓到：同一张 mega-menu 图 346ms 由 img 下、2979ms 又被 fetch 一遍。
//      R2 是 immutable 长缓存，dur=1-4ms 的重复只是命中、不花带宽，所以不能一律判 FAIL；
//      跨域无 timing-allow-origin，transferSize 永远是 0，只能以时长为准。）
//      起跑时间与首屏完成时间的关系只打印不判：不限速时实测会因 85ms 报假警。
//   V3 视口 <1024px 时整条预热队列不许跑：R2 域名上不该出现任何 fetch 类预热请求
//      （P6 用真实 <video>，initiatorType 是 video，另算）。
//
// 用法：
//   node docs/home-first-screen-probe.mjs                 # 打线上，移动 + 桌面各一次
//   node docs/home-first-screen-probe.mjs --url http://localhost:4321/ --form mobile
//   --ms 45000        采集窗口（默认 45000：队列在手机上实测要 38.5s 才跑完）
//   --no-throttle     不加 Lighthouse 那套 1.6Mbps/4×CPU 模拟（快，但结论会偏乐观）
//   --keep-profile    留着临时 user-data-dir 便于复现
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';

const argv = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true];
  }),
);

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL_ = argv.url || 'https://www.meiyualuminum.com/';
const MS = Number(argv.ms || 45000);
const THROTTLE = !argv['no-throttle'];
const PORT = Number(argv.port || 9377);
const R2_HOST = 'https://file.meiyualuminum.com/';
const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

// 两种外形。视口高度取 Lighthouse mobile 的那一套，判据才对得上它的数字。
const FORMS = {
  mobile: { width: 412, height: 823, dsf: 2.625, mobile: true, expectWarm: false },
  desktop: { width: 1350, height: 900, dsf: 1, mobile: false, expectWarm: true },
};

/** 在页面里跑的那段：面积 + 资源时序都在这里取，不在外面猜 */
function snapshot(vw, vh, r2) {
  const res = performance.getEntriesByType('resource').map((x) => ({
    u: x.name, kind: x.initiatorType, st: Math.round(x.startTime), end: Math.round(x.responseEnd),
  }));
  const area = (el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return 0;
    const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return Math.round(w * h);
  };
  const cls = (el) => String(typeof el.className === 'object' && el.className && el.className.baseVal !== undefined
    ? el.className.baseVal : (el.className || '')).split(' ').filter(Boolean).slice(0, 3).join('.');
  const els = [];
  document.querySelectorAll('img, video, h1, h2, p').forEach((el) => {
    const a = area(el);
    if (!a) return;
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage && cs.backgroundImage !== 'none'
      ? cs.backgroundImage.slice(4, -1).replace(/^["']|["']$/g, '') : null;
    let url = el.currentSrc || el.src || (el.querySelector && el.querySelector('source') ? el.querySelector('source').src : null);
    if (el.tagName === 'VIDEO') url = el.getAttribute('poster') || el.currentSrc || url;
    if (!url) url = bg;
    const hit = url ? res.filter((x) => x.u === url) : [];
    els.push({
      tag: el.tagName.toLowerCase(), a, cls: cls(el), id: el.id || null, url: url || null,
      top: Math.round(el.getBoundingClientRect().top),
      ends: hit.map((x) => x.end),
      durs: hit.map((x) => x.end - x.st),
      kinds: hit.map((x) => x.kind),
    });
  });
  els.sort((x, y) => y.a - x.a);
  const warm = res.filter((x) => x.kind === 'fetch' && x.u.startsWith(r2));
  const firstScreenEnd = Math.max(...els.flatMap((e) => e.ends), 0);
  // 首屏元素自己的 URL 又被 fetch 了一遍，而且 dur>50ms —— 那才是真的下了两遍。
  // R2 是 immutable 长缓存，dur=1-4ms 的重复只是命中，不花带宽（11-08 实测）。
  // 跨域无 timing-allow-origin，transferSize 永远是 0，只能以时长为准。
  const warmDup = els
    .filter((e) => e.kinds.some((k, i) => k === 'fetch' && e.durs[i] > 50))
    .map((e) => e.url + ' dur=' + Math.max(...e.durs));
  return {
    at: Math.round(performance.now()), vis: document.visibilityState,
    inner: innerWidth + 'x' + innerHeight,
    fcp: Math.round((performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint') || {}).startTime || 0),
    nav: Math.round((performance.getEntriesByType('navigation')[0] || {}).loadEventEnd || 0),
    nRes: res.length,
    els: els.slice(0, 8),
    warmN: warm.length,
    warmStart: warm.length ? Math.min(...warm.map((x) => x.st)) : null,
    warmEnd: warm.length ? Math.max(...warm.map((x) => x.end)) : null,
    firstScreenEnd,
    warmDup,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function devtoolsWs(port) {
  for (let i = 0; i < 100; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const p = j.find((t) => t.type === 'page');
      if (p) return p.webSocketDebuggerUrl;
    } catch (_) { /* Chrome 还没起 */ }
    await sleep(300);
  }
  throw new Error('DevTools 端点起不来（端口被占？换个 --port）');
}

function makeClient(wsUrl) {
  const ws = new WebSocket(wsUrl, { perMessageDeflate: false, maxPayload: 256 * 1048576 });
  const pending = new Map();
  const events = [];
  ws.on('message', (buf) => {
    const m = JSON.parse(buf.toString());
    if (m.id != null && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    } else if (m.method) events.push(m);
  });
  const ready = new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  let id = 0;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  return { ready, send, events, close: () => ws.close() };
}

/** 真实字节只能从 CDP 侧拿：跨域没 timing-allow-origin，页面里的 encodedBodySize 全是 0 */
function byteTally(events) {
  const urlOf = new Map();
  const kindOf = new Map();
  const bytes = new Map();
  for (const e of events) {
    if (e.method === 'Network.requestWillBeSent') {
      urlOf.set(e.params.requestId, e.params.request.url);
      kindOf.set(e.params.requestId, (e.params.request.initiator && e.params.request.initiator.type) || '?');
    } else if (e.method === 'Network.loadingFinished') {
      const u = urlOf.get(e.params.requestId);
      if (!u) continue;
      bytes.set(u, (bytes.get(u) || 0) + (e.params.encodedDataLength || 0));
    }
  }
  let img = 0, vid = 0, warm = 0;
  for (const [u, b] of bytes) {
    const p = new URL(u).pathname.toLowerCase();
    if (/\.(webp|jpe?g|png|avif)$/.test(p)) img += b;
    if (/\.mp4$/.test(p)) vid += b;
  }
  // 预热那一路的字节：页面里 fetch() 发起的（initiator type = Fetch）
  for (const e of events) {
    if (e.method !== 'Network.loadingFinished') continue;
    if (kindOf.get(e.params.requestId) !== 'Fetch') continue;
    if (!(urlOf.get(e.params.requestId) || '').startsWith(R2_HOST)) continue;
    warm += e.params.encodedDataLength || 0;
  }
  const mb = (n) => (n / 1048576).toFixed(2) + 'MB';
  return { total: mb([...bytes.values()].reduce((a, b) => a + b, 0)), img: mb(img), vid: mb(vid), warm: mb(warm), n: bytes.size };
}

async function probe(form) {
  const cfg = FORMS[form];
  if (!cfg) throw new Error('--form 只认 mobile / desktop，给了 ' + form);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), `fs-probe-${form}-`));
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    '--remote-allow-origins=*', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', `--window-size=${cfg.width},${cfg.height}`, 'about:blank',
  ], { stdio: 'ignore' });
  try {
    const c = makeClient(await devtoolsWs(PORT));
    await c.ready;
    for (const d of ['Page', 'Network', 'Runtime']) await c.send(`${d}.enable`);
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: cfg.width, height: cfg.height, deviceScaleFactor: cfg.dsf, mobile: cfg.mobile,
    });
    if (cfg.mobile) await c.send('Emulation.setUserAgentOverride', { userAgent: MOBILE_UA, platform: 'Android' });
    if (THROTTLE) {
      await c.send('Network.emulateNetworkConditions', {
        offline: false, latency: 150,
        downloadThroughput: Math.round((1.6 * 1024 * 1024) / 8),
        uploadThroughput: Math.round((750 * 1024) / 8),
      });
      await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await c.send('Page.navigate', { url: URL_ });
    await sleep(MS);
    const expr = `(${snapshot.toString()})(${cfg.width}, ${cfg.height}, ${JSON.stringify(R2_HOST)})`;
    const r = await c.send('Runtime.evaluate', { expression: `JSON.stringify(${expr})`, returnByValue: true });
    const d = JSON.parse(r.result.value);
    const bytes = byteTally(c.events);
    c.close();
    return { form, cfg, d, bytes, throttle: THROTTLE, url: URL_ };
  } finally {
    chrome.kill('SIGKILL');
    await sleep(700);
    if (!argv['keep-profile']) { try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {} }
  }
}

function verdict(o) {
  const { d, form, cfg } = o;
  const rows = [];
  const isHero = (e) => !!e && /video-hero-(poster|bg)/.test((e.cls || '') + ' ' + (e.id || ''));
  const first = d.els[0];
  const hero = d.els.find(isHero);
  rows.push(['V1 首屏面积最大的元素是 hero 底图', isHero(first),
    `第一名 area=${first ? first.a : '视口里没有候选'} <${first ? first.tag + (first.id ? '#' + first.id : '.' + first.cls) : '—'}>，` +
    `hero 那格 area=${hero ? hero.a : '不在前 8'}（第二名 area=${d.els[1] ? d.els[1].a : '—'}）`]);
  rows.push(['V2 队列不重复抓首屏元素正在下的 URL', d.warmDup.length === 0,
    d.warmDup.length
      ? `${d.warmDup.length} 张被 img 和 fetch 各要一次：${String(d.warmDup[0]).replace(/^https?:\/\//, '').slice(0, 64)}`
      : `重复 0 张（队列起跑=${d.warmStart == null ? '没跑' : d.warmStart + 'ms'}，` +
      `首屏最晚资源完成=${d.firstScreenEnd}ms）`]);
  rows.push(['V3 手机（<1024px）不跑整页铺图',
    cfg.expectWarm ? null : d.warmN === 0,
    cfg.expectWarm ? '桌面不适用（这一级本来就该跑）'
      : `R2 上的 fetch 预热 ${d.warmN} 条` + (d.warmEnd ? `，跑到 ${d.warmEnd}ms` : '')]);
  return rows;
}

function report(o) {
  const { d, bytes, form } = o;
  console.log('\n' + '='.repeat(74));
  console.log(`### ${form}  ${o.url}  视口=${d.inner} throttle=${o.throttle ? 'on(1.6Mbps/4×CPU)' : 'off'}`);
  console.log(`    vis=${d.vis} FCP=${d.fcp}ms load=${d.nav}ms 资源=${d.nRes} 条   ` +
    `传输 总=${bytes.total} 图=${bytes.img} 视频=${bytes.vid} 预热=${bytes.warm}（${bytes.n} 个响应）`);
  console.log('    首屏视口内面积前 5：');
  for (const e of d.els.slice(0, 5)) {
    console.log(`      area=${String(e.a).padStart(8)}  <${e.tag}${e.id ? '#' + e.id : '.' + e.cls}> top=${e.top}` +
      (e.url ? `  ${e.url.replace(/^https?:\/\//, '').slice(0, 58)}` : '') +
      (e.ends.length ? `  资源完成=${e.ends.join(',')}` : ''));
  }
  let bad = 0;
  for (const [name, ok, detail] of verdict(o)) {
    if (ok === null) { console.log(`    —  ${name}\n        ${detail}`); continue; }
    if (!ok) bad += 1;
    console.log(`    ${ok ? '✅' : '❌'} ${name}\n        实际：${detail}`);
  }
  return bad;
}

const forms = (argv.form || 'mobile,desktop').split(',');
let failures = 0;
for (const f of forms) {
  try {
    failures += report(await probe(f.trim()));
  } catch (e) {
    console.log(`\n### ${f} 探测失败：${e.message}`);
    failures += 1;
  }
}
console.log('\n结论：' + (failures ? `${failures} 条不变量被破坏` : '首屏三条不变量都成立'));
process.exit(failures ? 1 : 0);
