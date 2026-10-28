/**
 * model/textures.js —— 程序化贴图（Canvas 2D 生成，零外部图片资源）
 * 提供：混凝土 / 镀锌锌花 / 拉丝铝 / 喷涂哑光 / 木纹热转印 五类表面细节，
 * 外加厂家字标与现场标识牌两块品牌面（同样手绘，不引用站上的 PNG）。
 */

import * as THREE from 'three';

/** 可复现伪随机（同一刷新结果一致，避免每次贴图跳动） */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

/** 非正方形画布（字标与标识牌都不是 1:1） */
function board(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(cv, { srgb = true, repeat = 1, clamp = false } = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return t;
}

/** 混凝土：灰黑水泥底 + 疏密噪点 + 模板拉筋印 + 细微裂纹（裂纹用浅灰，否则在暗底上读不出） */
export function concreteMap(size = 512) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(7717);
  g.fillStyle = '#767c81';
  g.fillRect(0, 0, size, size);

  // 大尺度明暗不均
  for (let i = 0; i < 26; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 40 + r() * 130;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() > 0.5;
    grd.addColorStop(0, dark ? 'rgba(58,63,68,0.5)' : 'rgba(146,152,157,0.36)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // 骨料噪点
  for (let i = 0; i < 5200; i++) {
    const x = r() * size;
    const y = r() * size;
    const s = 0.5 + r() * 1.9;
    const v = 62 + Math.floor(r() * 118);
    g.fillStyle = `rgba(${v},${v + 3},${v + 7},${0.16 + r() * 0.3})`;
    g.fillRect(x, y, s, s);
  }

  // 模板接缝与拉筋印
  g.strokeStyle = 'rgba(196,202,207,0.3)';
  g.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    const y = (i + 0.5) * (size / 3) + (r() - 0.5) * 20;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= size; x += 24) g.lineTo(x, y + (r() - 0.5) * 3);
    g.stroke();
  }
  g.fillStyle = 'rgba(206,212,217,0.34)';
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.arc(r() * size, r() * size, 4 + r() * 3, 0, Math.PI * 2);
    g.fill();
  }

  // 细微裂纹
  g.strokeStyle = 'rgba(214,220,225,0.22)';
  g.lineWidth = 0.8;
  for (let i = 0; i < 10; i++) {
    let x = r() * size;
    let y = r() * size;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      x += (r() - 0.5) * 46;
      y += (r() - 0.5) * 46;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  return toTexture(cv, { repeat: 1 / 4 });
}

/** 镀锌锌花：不规则多边形晶粒，用于齿形龙骨、吊杆与螺母 */
export function zincSpangleMap(size = 512) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(2411);
  g.fillStyle = '#b7bec6';
  g.fillRect(0, 0, size, size);

  // 晶粒：随机多边形 + 边缘高光
  for (let i = 0; i < 190; i++) {
    const cx = r() * size;
    const cy = r() * size;
    const rad = 16 + r() * 46;
    const sides = 5 + Math.floor(r() * 5);
    const tone = 168 + Math.floor(r() * 62);
    g.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2 + r() * 0.4;
      const rr = rad * (0.6 + r() * 0.55);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      s ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
    g.fillStyle = `rgba(${tone},${tone + 4},${tone + 10},0.5)`;
    g.fill();
    g.strokeStyle = `rgba(${tone + 34},${tone + 38},${tone + 44},0.34)`;
    g.lineWidth = 1.1;
    g.stroke();
  }

  // 冷光带
  const band = g.createLinearGradient(0, 0, size, size);
  band.addColorStop(0, 'rgba(226,236,246,0.16)');
  band.addColorStop(0.45, 'rgba(120,132,146,0.1)');
  band.addColorStop(1, 'rgba(214,228,242,0.14)');
  g.fillStyle = band;
  g.fillRect(0, 0, size, size);
  return toTexture(cv, { repeat: 1 / 2.2 });
}

/** 拉丝铝：沿一个方向的细纹 + 柔和光带，用于 U 型方通翼板 */
export function brushedAluminumMap(size = 512) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(9031);
  g.fillStyle = '#c9ced4';
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 1500; i++) {
    const y = r() * size;
    const len = 30 + r() * 220;
    const x = r() * size;
    const v = 190 + Math.floor(r() * 60);
    g.strokeStyle = `rgba(${v},${v + 2},${v + 6},${0.06 + r() * 0.16})`;
    g.lineWidth = r() > 0.8 ? 1.5 : 0.7;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y + (r() - 0.5) * 1.2);
    g.stroke();
  }

  const sheen = g.createLinearGradient(0, 0, 0, size);
  sheen.addColorStop(0, 'rgba(255,255,255,0.1)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.07)');
  g.fillStyle = sheen;
  g.fillRect(0, 0, size, size);
  return toTexture(cv, { repeat: 1 / 6 });
}

/** 喷涂/氟碳哑光：极细颗粒，避免铝材看起来像镜面塑料 */
export function coatedMetalMap(size = 256) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(552);
  g.fillStyle = '#cfd4d9';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 3600; i++) {
    const v = 176 + Math.floor(r() * 70);
    g.fillStyle = `rgba(${v},${v},${v + 3},${0.1 + r() * 0.18})`;
    g.fillRect(r() * size, r() * size, 1.1, 1.1);
  }
  return toTexture(cv, { repeat: 1 / 3 });
}

/**
 * 木纹热转印：直纹为主 + 缓慢起伏的山纹 + 细管孔。
 * 截面挤出的侧壁 UV 是 (截面坐标, 1 - 挤出坐标)，即图幅的纵向就是构件长度，
 * 所以纹理必须沿 y 通长、在 x 方向变化，拉出来才是顺纹而不是横纹。
 */
export function woodGrainMap(size = 512) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(90210);

  // 底色：沿宽度方向的宽频明暗带
  const base = g.createLinearGradient(0, 0, size, 0);
  base.addColorStop(0, '#6a462b');
  base.addColorStop(0.26, '#7f5738');
  base.addColorStop(0.52, '#5e3d26');
  base.addColorStop(0.76, '#7a5233');
  base.addColorStop(1, '#65452b');
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);

  // 木纹：逐条沿长度方向的曲线，深浅交错
  for (let i = 0; i < 190; i++) {
    const x0 = r() * size;
    const amp = 1.5 + r() * 9; // 山纹摆幅
    const freq = 0.4 + r() * 1.6; // 整幅内有几个波
    const ph = r() * Math.PI * 2;
    const dark = r() > 0.42;
    g.strokeStyle = dark
      ? `rgba(${44 + Math.floor(r() * 22)},${28 + Math.floor(r() * 16)},${16 + Math.floor(r() * 12)},${0.1 + r() * 0.24})`
      : `rgba(${166 + Math.floor(r() * 40)},${118 + Math.floor(r() * 32)},${76 + Math.floor(r() * 26)},${0.05 + r() * 0.13})`;
    g.lineWidth = 0.6 + r() * 2.6;
    g.beginPath();
    for (let y = 0; y <= size; y += 8) {
      const x = x0 + Math.sin((y / size) * Math.PI * 2 * freq + ph) * amp;
      y ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
  }

  // 管孔：沿长度方向的短小深色拖尾
  for (let i = 0; i < 900; i++) {
    const x = r() * size;
    const y = r() * size;
    const len = 3 + r() * 16;
    g.fillStyle = `rgba(38,24,15,${0.07 + r() * 0.16})`;
    g.fillRect(x, y, 0.9 + r() * 1.3, len);
  }

  // 缎面反光：沿宽度方向的柔和高光带
  const sheen = g.createLinearGradient(0, 0, size, 0);
  sheen.addColorStop(0, 'rgba(255,226,190,0)');
  sheen.addColorStop(0.42, 'rgba(255,228,192,0.1)');
  sheen.addColorStop(0.6, 'rgba(255,224,188,0.04)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sheen;
  g.fillRect(0, 0, size, size);
  return toTexture(cv, { repeat: 1 / 2.5 });
}

/** 通用灰度噪波：当 roughnessMap 用，打破均匀高光 */
export function noiseRoughness(size = 256, seed = 1337) {
  const cv = canvas(size);
  const g = cv.getContext('2d');
  const r = rng(seed);
  g.fillStyle = '#b8b8b8';
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 4200; i++) {
    const v = 90 + Math.floor(r() * 150);
    g.fillStyle = `rgba(${v},${v},${v},0.22)`;
    g.fillRect(r() * size, r() * size, 1.6, 1.6);
  }
  return toTexture(cv, { srgb: false, repeat: 1 / 2 });
}

/* ===================== 品牌面 ===================== */

/** 手动加字距地绘制一行文字（ctx.letterSpacing 不是处处可用），返回结束处的 x */
function tracked(g, text, x, y, tracking) {
  let cx = x;
  for (const ch of text) {
    g.fillText(ch, cx, y);
    cx += g.measureText(ch).width + tracking;
  }
  return cx - tracking;
}

/** 加字距文本的总宽度 */
function trackedWidth(g, text, tracking) {
  let w = 0;
  for (const ch of text) w += g.measureText(ch).width + tracking;
  return w - tracking;
}

/**
 * 厂家字标：白色字 + 透明底，字标自动适配到画布宽度的 fill，
 * 所以调用方给贴花平面多大尺寸，就是母材上印多大的字（不必再猜留白）。
 * 画成白色是为了让材质用 color 去染色：木纹上是深色蚀刻感，
 * 黑漆龙骨上是浅色喷印，一张图多处用。
 * 不用站上的 logo PNG：那张图的 CDN 没送 CORS 头，当 WebGL 贴图会被浏览器拦下。
 */
export function brandWordmarkMap({ w = 512, h = 128, text = 'MEIYU', fill = 0.9 } = {}) {
  const cv = board(w, h);
  const g = cv.getContext('2d');
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#ffffff';
  g.textBaseline = 'alphabetic';

  // 字宽与字距都随字号线性增长，量一次单位宽度就能直接解出字号
  const trackOf = (s) => Math.round(s * 0.22);
  const measure = (s) => {
    g.font = `700 ${s}px "Segoe UI", Arial, sans-serif`;
    return trackedWidth(g, text, trackOf(s));
  };
  const CAP = 0.72; // 大写高 ≈ 0.72 em
  const size = Math.round(Math.min(((w * fill) / measure(100)) * 100, (h * 0.68) / CAP));
  const track = trackOf(size);
  const capH = size * CAP;
  const ruleT = Math.max(3, Math.round(h * 0.045));
  const top = (h - (capH + h * 0.07 + ruleT)) / 2;
  const baseline = Math.round(top + capH);

  g.font = `700 ${size}px "Segoe UI", Arial, sans-serif`;
  const tw = measure(size);
  const x0 = (w - tw) / 2;
  tracked(g, text, x0, baseline, track);
  // 字标下一道细线，贴近真实 logotype 的下划线
  g.fillRect(x0, Math.round(baseline + h * 0.07), tw, ruleT);
  return toTexture(cv, { clamp: true });
}

/**
 * 板底样板段喷字：拿模板在混凝土上喷出来的一面字。
 * 真实工地板底的喷字基本都是这个来头（样板引路、验收标识），
 * 而不是把厂家 logo 直接喷到业主的结构面上。
 * 字也是白色的，让材质用 color 调色；每个字做一点可复现的微抖与浓淡差，
 * 读起来像漆从模板边上洇出去一点。
 */
export function slabStencilMap({ word = 'MEIYU', tag = '', spec = '' } = {}) {
  const W = 1200;
  const H = 340;
  const cv = board(W, H);
  const g = cv.getContext('2d');
  const r = rng(9021);
  g.clearRect(0, 0, W, H);
  g.textBaseline = 'alphabetic';

  const left = 52;
  const right = W - 52;
  // track 统一用字号的倍数，行宽就与字号严格线性，超宽时一次等比缩准
  const rows = [
    { text: word, size: 120, track: 0.22, y: 104, weight: '700' },
    { text: tag, size: 62, track: 0.1, y: 192, weight: '600', bar: true },
    { text: spec, size: 44, track: 0.05, y: 272, weight: '500' },
  ].filter((row) => row.text);

  rows.forEach((row) => {
    const x0 = row.bar ? left + 36 : left;
    const widthAt = (s) => {
      g.font = `${row.weight} ${s}px "Segoe UI", "Microsoft YaHei", Arial, sans-serif`;
      return trackedWidth(g, row.text, s * row.track);
    };
    let size = row.size;
    const fit = widthAt(size);
    if (fit > right - x0) size = Math.floor((size * (right - x0)) / fit); // 文案太长就缩，不能出界
    const track = size * row.track;

    if (row.bar) {
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.fillRect(left, row.y - size * 0.74, 8, size * 0.8);
    }
    g.font = `${row.weight} ${size}px "Segoe UI", "Microsoft YaHei", Arial, sans-serif`;
    let x = x0;
    for (const ch of row.text) {
      const w = g.measureText(ch).width;
      // 漆边：同一行里微移 1~3 px，并让每个字的浓度差一点
      g.fillStyle = `rgba(255,255,255,${0.86 + r() * 0.12})`;
      g.fillText(ch, x + (r() - 0.5) * 3, row.y + (r() - 0.5) * 3);
      x += w + track;
    }
  });

  return toTexture(cv, { clamp: true });
}
