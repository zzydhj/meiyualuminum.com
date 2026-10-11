/**
 * videoCover.js — 自托管视频"第一帧做封面"全局兜底（客户端）
 *
 * 组件服务端渲染的点（首页视频墙 / 视频卡片 / 推荐栏 / 详情页播放器）已统一处理；
 * 本脚本兜底数据库正文 HTML 里内嵌的 <video>（博客 / 单页 / 产品详情 set:html 内容）：
 * 凡是托管在本站（file.meiyualuminum.com 或同源路径）的视频——
 *   1. 移除 poster（不再用单独封面图）
 *   2. preload=none 提升为 metadata（否则浏览器不加载、封面位是黑屏）
 *   3. 地址追加 #t=0.1 媒体片段，强制渲染 0.1s 帧作封面
 * YouTube 等外部视频是 iframe，不含 <video> 标签，不受影响。
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

document.querySelectorAll("video").forEach(applyFirstFrameCover);
