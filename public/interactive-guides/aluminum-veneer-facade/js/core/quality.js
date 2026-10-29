/**
 * core/quality.js —— 设备能力探测与画质档位选择
 * 只回答两个问题：这台设备该用哪一档、以及浏览器是不是根本没在用显卡。
 * 档位参数本身在 config.js 的 QUALITY 里，不在这里重复定义。
 */

import { QUALITY } from '../config.js';

const STORE_KEY = 'meiyu-guide-quality';

/** 软件渲染器的特征串：命中即说明 WebGL 跑在 CPU 上，画质档位救不了，得先修浏览器设置 */
const SOFTWARE_HINTS = [
  'basic render', // Windows: ANGLE (Microsoft, Microsoft Basic Render Driver)
  'swiftshader',
  'swangle',
  'llvmpipe',
  'software',
  'microsoft directx',
];

/**
 * 读出浏览器实际用的 GPU 名称。
 * 需要 WEBGL_debug_renderer_info；被隐私策略屏蔽时返回 null，此时不做软件判定。
 */
export function detectRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { name: null, software: false, blocked: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : null;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (!name) return { name: null, software: false, blocked: !ext };
    const lower = name.toLowerCase();
    return { name, software: SOFTWARE_HINTS.some((h) => lower.includes(h)), blocked: false };
  } catch {
    return { name: null, software: false, blocked: false };
  }
}

/**
 * 自动选档。判定只看真实负载信号，按顺序：
 * 1. 屏幕物理像素量 —— 高分屏上 pixelRatio 2 意味着数倍像素，最容易掉帧；
 * 2. CPU 线程数与内存档位 —— 粗略但有效的低端信号；
 * 3. 触屏 + 小屏按移动设备处理（手机 GPU 跑不动 Bloom 的十来个全屏 pass）。
 * 拿不准时往低一档走：宁可边缘软一点，也不要让客户觉得页面卡。
 *
 * 2026-10-28 删掉原来第 4 条「refresh > 75 也算低端」：高刷新率是显示器属性，
 * 与 GPU 算力无关，而现实中配旗舰显卡的人恰恰最可能在用 144Hz+ 屏——这条规则
 * 系统性地给性能最强的一批设备降了档。而且 balanced 与 high 之间唯一可见的差别
 * 是关掉 4× MSAA（边缘锯齿），并不是掉帧，用刷新率当降级理由本身就对不上。
 */
export function autoQuality(renderer) {
  const nav = navigator || {};
  const px = (window.screen?.width || 1920) * (window.screen?.height || 1080);
  const dpr = window.devicePixelRatio || 1;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;
  const mobile = window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 900;

  if (mobile || renderer.software || cores <= 4 || mem <= 4) return 'lite';
  if (px * dpr * dpr > 4.2e6 || cores <= 8) return 'balanced';
  return 'high';
}

/** 用户手动选过的档位；没选过返回 null，让调用方走自动判定 */
export function storedQuality() {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v && QUALITY[v] ? v : null;
  } catch {
    return null; // 隐私模式禁用 localStorage 时静默回退到自动档
  }
}

export function rememberQuality(name) {
  try {
    window.localStorage.setItem(STORE_KEY, name);
  } catch {
    /* 存不下就算了，不影响本次浏览 */
  }
}
