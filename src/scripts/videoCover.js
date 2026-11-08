/**
 * videoCover.js — 自托管视频"第一帧做封面"兜底（客户端）
 *
 * 只处理带 data-video-cover 的容器里的 <video>，也就是数据库正文（set:html 注入）。
 * 组件自己渲染的点（首页 hero / 首页视频墙 / 视频卡片 / 推荐栏 / 详情页播放器）
 * 一律不碰：它们的封面、preload、起播时机由各自的代码负责。
 * YouTube 等外部视频是 iframe，不含 <video> 标签，本来也不受影响。
 *
 * 命中条件与动作（对 data-video-cover 范围内的自托管视频）：
 *   1. 移除 poster（不再用单独封面图）
 *   2. preload=none 提升为 metadata（否则浏览器不加载、封面位是黑屏）
 *   3. 地址追加 #t=0.1 媒体片段，强制渲染 0.1s 帧作封面
 *
 * 为什么必须限定作用域（2026-11-08，别再改回全站）：
 * 原先最后一行是 document.querySelectorAll("video")，首页 hero 因此被连带命中：
 * 实测交付 HTML 里 hero 是 preload="none" + poster="meiyu-video-4.webp"，
 * 运行时变成 poster=null。全站只有本脚本会 removeAttribute("poster")，
 * 所以归属没有第二种解释。而 index.astro 里那段注释写死了 hero 的两个要求：
 * preload 必须是 none（否则 HTML 解析阶段就发媒体请求，和首屏底图抢连接，
 * 移动端实测拖慢底图），poster 必须给（否则 Chrome 拿"首帧"当 LCP 候选，
 * 而首帧要等整片下完才画，移动端实测被图片队列堵到 30s+，LCP 直接爆掉）。
 * 两者都是业主口径，不能被一个兜底脚本顺手推翻。
 *
 * 新增正文容器时记得给它加 data-video-cover（全站现有 4 处：
 * .page-content / .article-content / .pk-db-content / .video-content）。
 * 漏加的后果是正文里的视频不出首帧封面（黑屏），可见且可逆；
 * 反过来要是改回全站选择器，坏掉的是首页 hero 的 LCP —— 那个静默得多。
 */
const SELF_HOSTED = /^https:\/\/file\.meiyualuminum\.com\//;

function isSelfHosted(src) {
  return SELF_HOSTED.test(src) || src.startsWith("/");
}

function applyFirstFrameCover(video) {
  const source = video.querySelector("source");
  const src = video.getAttribute("src") || source?.getAttribute("src") || "";
  if (!isSelfHosted(src)) return;

  // 第一帧做封面：移除单独封面图
  video.removeAttribute("poster");

  // metadata 预载才够浏览器取到并渲染第一帧
  const preload = video.getAttribute("preload");
  if (!preload || preload === "none") {
    video.setAttribute("preload", "metadata");
  }

  // #t=0.1 强制 seek 到 0.1s 帧，规避部分浏览器初始黑帧
  const target = video.getAttribute("src") ? video : source;
  const url = target?.getAttribute("src");
  let changed = false;
  if (url && !url.includes("#")) {
    target.setAttribute("src", `${url}#t=0.1`);
    changed = true;
  }

  // 非自动播放的视频：改了 src 需 load() 才会重新拉取 metadata 渲染首帧；
  // autoplay 视频本就立即加载播放，load() 反而打断，故跳过。
  if (changed && !video.autoplay) {
    video.load();
  }
}

// 只认显式打了标记的正文容器；找不到就是什么都不做（比误伤 hero 安全）。
document
  .querySelectorAll("[data-video-cover] video")
  .forEach(applyFirstFrameCover);
