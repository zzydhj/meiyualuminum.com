/**
 * videoCovers.ts — 视频首帧封面图 URL 映射（2026-11-06 业主定口径）
 *
 * 首页工序带 12 卡与项目视频画廊 6 格不再内嵌 <video>：封面是 ffmpeg 抽首帧、
 * 极致压缩的 webp（工序带 41~67KB / 画廊 39~63KB），按普通 <img> 走从上到下
 * 的懒加载队列，不会比后面章节的图更慢；想播视频时工序带整卡跳新标签页
 * 详情页、画廊按 Play 才注入 <video> 全力加载。整站因此只剩两个视频请求：
 * hero 开屏视频 + 画廊首格自播视频。
 *
 * 键：factory-NN = videos 表 slug 前两段；vg-* = 视频文件名前缀。
 * 本文件由 .tmp-work/gen-video-covers.py 从 R2 流水线结果生成，勿手改 URL。
 */

/** 工序带：videos 表 slug 前两段 → 竖屏 9:16 封面（源视频 SAR 3:8 还原后的第一帧） */
export const FACTORY_COVERS: Record<string, string> = {
  "factory-01": "https://file.meiyualuminum.com/covers/factory-01-efbf2c.webp",
  "factory-02": "https://file.meiyualuminum.com/covers/factory-02-cb489c.webp",
  "factory-03": "https://file.meiyualuminum.com/covers/factory-03-cc730f.webp",
  "factory-04": "https://file.meiyualuminum.com/covers/factory-04-d2bc32.webp",
  "factory-05": "https://file.meiyualuminum.com/covers/factory-05-2c4b7c.webp",
  "factory-06": "https://file.meiyualuminum.com/covers/factory-06-c0c3a9.webp",
  "factory-07": "https://file.meiyualuminum.com/covers/factory-07-f66b4b.webp",
  "factory-08": "https://file.meiyualuminum.com/covers/factory-08-8fe8aa.webp",
  "factory-09": "https://file.meiyualuminum.com/covers/factory-09-7a17cd.webp",
  "factory-10": "https://file.meiyualuminum.com/covers/factory-10-633f95.webp",
  "factory-11": "https://file.meiyualuminum.com/covers/factory-11-25da6b.webp",
  "factory-12": "https://file.meiyualuminum.com/covers/factory-12-ef1564.webp",
};

/** 项目视频画廊：视频名前缀 → 竖屏 9:16 中心裁切封面图 */
export const VG_COVERS: Record<string, string> = {
  "vg-chengdu-cloud-plaza-canopy": "https://file.meiyualuminum.com/covers/vg-chengdu-cloud-plaza-canopy-b5e2e6.webp",
  "vg-hangzhou-gateway-tower-garage": "https://file.meiyualuminum.com/covers/vg-hangzhou-gateway-tower-garage-500c02.webp",
  "vg-liangjiang-hub": "https://file.meiyualuminum.com/covers/vg-liangjiang-hub-2a9b8f.webp",
  "vg-suzhou-starlight-gateway": "https://file.meiyualuminum.com/covers/vg-suzhou-starlight-gateway-caf24b.webp",
  "vg-wuhan-gateway-trade-center": "https://file.meiyualuminum.com/covers/vg-wuhan-gateway-trade-center-2387bf.webp",
  "vg-xiamen-205e2": "https://file.meiyualuminum.com/covers/vg-xiamen-205e2-86487d.webp",
};
