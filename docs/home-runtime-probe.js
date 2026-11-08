/* home-runtime-probe.js — 首页加载逻辑的运行时不变量探针（只读，不改任何东西）
 *
 * 用法：打开 https://www.meiyualuminum.com/ ，等页面完全跑完（≥20 秒），
 * 把本文件整段粘进控制台执行，它打印一份 JSON + 每条不变量的 PASS/FAIL。
 * 也可以直接把这个文件交给浏览器子代理，让它原样抄回输出。
 *
 * 为什么需要它（Lighthouse 测不到的那一层）：
 * docs/home-perf-baseline.py 查的是交付 HTML 里的静态事实；但「脚本运行时把
 * hero 的 poster 摘掉了」这种事静态看不出来 —— 2026-11-08 的 videoCover.js
 * 就是这样：交付 HTML 里 poster 明明在，运行时 poster 已经是 null。
 * 所以这一层必须在真实浏览器里读 DOM 终态。
 *
 * 两个前提，不满足就不要拿数字下结论：
 * 1) 窗口必须前台可见。页面 hidden 时 Chrome 不产生 LCP 条目、requestIdleCallback
 *    被强节流，队列节奏会被放大成 5s/件（本项目的实测现象）。输出里的
 *    visibility 字段就是自检项，它是 "hidden" 时 lcpEntries 为空属正常，不是 bug。
 * 2) 缓存必须是冷的。所有条目 transferSize=0 说明命中缓存，此时 dur 只有几毫秒，
 *    「N 件挤在同一秒」是缓存命中该有的样子，不能当成队列失控的证据。
 *
 * 一条被踩过两次的口径：统计并发必须按 initiatorType 拆开。
 * P1.5 把首屏图升 eager 后由浏览器自己发起，一批同时跑；把它们和预热队列的
 * fetch 混在一起数，就会得出「61 件挤在同一秒」的错误结论（2026-11-08 真错过）。
 * 所以 byInitiator 是分组给的，判串行只看 fetch 那一组。
 */
(() => {
  const CD = "https://file.meiyualuminum.com/";

  const res = performance
    .getEntriesByType("resource")
    .filter((r) => r.name.startsWith(CD))
    .map((r) => ({
      kind: r.initiatorType,
      file: r.name.replace(CD, "").split("?")[0].split("/").pop().slice(0, 48),
      s: Math.round(r.startTime),
      e: Math.round(r.startTime + r.duration),
      d: Math.round(r.duration),
      xfer: r.transferSize,
    }));

  const groups = {};
  res.forEach((x) => ((groups[x.kind] = groups[x.kind] || []).push(x)));

  const summarize = (list) => {
    if (!list.length) return { n: 0 };
    const sorted = [...list].sort((a, b) => a.s - b.s);
    // 并发峰值：按时间扫描，start +1 / end -1
    const events = [];
    sorted.forEach((x) => {
      events.push([x.s, 1]);
      events.push([x.e, -1]);
    });
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let cur = 0,
      peak = 0;
    events.forEach(([, d]) => {
      cur += d;
      if (cur > peak) peak = cur;
    });
    // 同刻以 -1 优先（上面那句排序就是这意思）：上一件恰好在 t 结束、下一件在 t
    // 开始，不算并发 —— 这样 peak 与下面的 serialPairs 才是同一个口径。
    // 代价是零时长条目（缓存命中时 dur=0）会被自己抵消，peak 报 0。
    // 2026-11-08 子代理实测到：n=1 的 css 组 peakConcurrency=0。所以有东西在飞时
    // 至少报 1，并在 cold-cache 不成立时把 peak 当**下界**读（anyRealBytes=false 就是提示）。
    if (sorted.length) peak = Math.max(peak, 1);
    // 相邻两件「上一件结束后才开始」的对数，就是串行度
    let serial = 0;
    for (let i = 1; i < sorted.length; i++)
      if (sorted[i].s >= sorted[i - 1].e) serial++;
    const buckets = {};
    sorted.forEach((x) => {
      const b = Math.floor(x.s / 2000) * 2000;
      buckets[b] = (buckets[b] || 0) + 1;
    });
    return {
      n: sorted.length,
      firstStart: sorted[0].s,
      lastStart: sorted[sorted.length - 1].s,
      spanMs: sorted[sorted.length - 1].s - sorted[0].s,
      peakConcurrency: peak,
      serialPairs: serial + "/" + Math.max(0, sorted.length - 1),
      per2sBucketMax: Math.max(...Object.values(buckets)),
      anyRealBytes: sorted.some((x) => x.xfer > 0),
    };
  };

  const nav = performance.getEntriesByType("navigation")[0] || {};
  const v = document.querySelector(".video-hero-bg");
  const heroFile = v
    ? ((v.querySelector("source") || {}).src || v.src || "")
        .replace(CD, "")
        .split("?")[0]
        .split("/")
        .pop()
    : "";
  const heroReq = res.filter((x) => x.file === heroFile && /\.mp4$/.test(x.file));

  let lcpEntries = [];
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        lcpEntries.push({
          start: Math.round(e.startTime),
          tag: e.element && e.element.tagName,
          cls: e.element && e.element.className,
          size: e.size,
        });
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (err) {
    lcpEntries = ["observer-error: " + err.message];
  }

  const dcl = Math.round(nav.domContentLoadedEventEnd || 0);
  const loadEnd = Math.round(nav.loadEventEnd || 0);
  const heroFirstStart = heroReq.length ? Math.min(...heroReq.map((x) => x.s)) : null;

  // I7 用得上：拿最后一个 LCP 候选（最晚发生的那次接管）看它到底是谁。
  // 2026-11-08 实测：移动端 4 次 Lighthouse 的 LCP 是 23226/3985/6214/4058，
  // 最差那次恰好是“窗口跑完”那次（req=106）。怀疑 LCP 候选不在 hero 底图上，
  // 而是被后台队列里更晚出现、面积更大的元素接管了。中位数抓不住这件事，
  // DOM 终态能——所以把它当成一条不变量放这里，而不是放 Lighthouse 层。
  const lcpEl = Array.isArray(lcpEntries) && lcpEntries.length
    ? lcpEntries[lcpEntries.length - 1]
    : null;

  const checks = {
    "I1 hero poster 仍在（没被兜底脚本摘掉）": !!(v && v.getAttribute("poster")),
    "I2 hero 首条 mp4 不早于 DOMContentLoaded":
      heroFirstStart === null || heroFirstStart >= dcl,
    "I3 fetch 组预热队列严格串行（peakConcurrency=1）":
      (groups.fetch ? summarize(groups.fetch).peakConcurrency : 1) === 1,
    "I4 离屏预热 video 无残留":
      [...document.querySelectorAll("video")].filter((x) =>
        /-9999px/.test(x.style.left || ""),
      ).length === 0,
    "I5 首屏图已 eager 提升":
      document.querySelectorAll('img[loading="eager"]').length > 0,
    "I6 LCP 有候选（需窗口可见才成立）":
      Array.isArray(lcpEntries) && lcpEntries.length > 0,
    // UNKNOWN 不是 FAIL：页面 hidden 时 Chrome 根本不产 LCP 条目。
    "I7 LCP 元素是首屏 hero（不是队列里更晚的图）": !lcpEl
      ? "UNKNOWN"
      : /video-hero-poster/.test(lcpEl.cls || "") ||
        lcpEl.tag === "H1" ||
        /video-hero/.test(lcpEl.cls || "")
      ? "PASS"
      : "FAIL",
  };

  const verdict = Object.fromEntries(
    Object.entries(checks).map(([k, pass]) => [
      k,
      typeof pass === "string" ? pass : pass ? "PASS" : "FAIL",
    ]),
  );

  console.log(
    JSON.stringify(
      {
        visibility: document.visibilityState,
        dcl,
        loadEventEnd: loadEnd,
        hero: {
          poster: v ? v.getAttribute("poster") : "NO HERO",
          preloadAttr: v && v.getAttribute("preload"),
          readyState: v && v.readyState,
          currentTime: v && Math.round(v.currentTime * 1000) / 1000,
          firstMp4Start: heroFirstStart,
          mp4RequestCount: heroReq.length,
        },
        byInitiator: Object.fromEntries(
          Object.entries(groups).map(([k, l]) => [k, summarize(l)]),
        ),
        videoCount: document.querySelectorAll("video").length,
        eagerImgs: document.querySelectorAll('img[loading="eager"]').length,
        lazyImgs: document.querySelectorAll('img[loading="lazy"]').length,
        lcpEntries,
        lcpLastElement: lcpEl,
        verdict,
        note:
          "visibility=hidden 时 I6 为空属正常；全部 xfer=0 说明命中缓存，" +
          "此时 spanMs 塌小不是队列失控。并发只看 byInitiator.fetch。",
      },
      null,
      1,
    ),
  );
})();
