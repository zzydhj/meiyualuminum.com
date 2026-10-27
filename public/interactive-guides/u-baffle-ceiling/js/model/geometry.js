/**
 * model/geometry.js —— 参数化几何工具（所有型材截面 / 常见体 / 虚线段）
 * 约定：1 单位 = 100 mm。几何体尽量复用（带缓存），减少 GPU 缓冲区数量。
 */

import * as THREE from 'three';

const cache = new Map();

function cached(key, factory) {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
}

/* ------------------------------ 基础体 ------------------------------ */

export function box(w, h, d) {
  return cached(`box:${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
}

/**
 * 圆柱。axis 指定轴向（缓存时就把旋转烘进几何体，
 * 调用方不得再 mutate 返回的共享实例）。
 */
export function cyl(rTop, rBot, h, seg = 24, axis = 'y', openEnded = false) {
  return cached(`cyl:${rTop},${rBot},${h},${seg},${axis},${openEnded}`, () => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, openEnded);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    return g;
  });
}

/**
 * 贴花平面：长边沿局部 X、字面朝向由 normal 指定。
 * 和 cyl 同一约定 —— 旋转烘进几何体并缓存，调用方不得再 mutate 共享实例。
 * 四个朝向都是“从该侧看过去文字不镜像”的推法：-z 必须额外转 180°。
 */
export function decal(w, h, normal = '+z') {
  return cached(`decal:${w},${h},${normal}`, () => {
    const g = new THREE.PlaneGeometry(w, h);
    if (normal === '-y') g.rotateX(Math.PI / 2);
    if (normal === '+x') g.rotateY(Math.PI / 2);
    if (normal === '-x') g.rotateY(-Math.PI / 2);
    if (normal === '-z') g.rotateY(Math.PI);
    // 贴花是印在母材上的字，不是实体：选中描边不该给它围一圈框
    g.userData.noEdge = true;
    return g;
  });
}

export function torus(r, tube, radialSeg = 18, tubularSeg = 32) {
  return cached(`torus:${r},${tube}`, () => new THREE.TorusGeometry(r, tube, radialSeg, tubularSeg));
}

export function cone(r, h, seg = 20) {
  return cached(`cone:${r},${h}`, () => new THREE.ConeGeometry(r, h, seg));
}

/** 沿 +Z 挤出 shape（截面在 XY 平面，长度沿 +Z） */
export function extrude(shape, depth, { bevel = false, curveSegments = 8 } = {}) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 1,
    curveSegments,
  });
  geo.computeVertexNormals();
  return geo;
}

/**
 * 把截面挤出体按「外表面 / 内表面 + 端面」重排成两个材质组（必须在转向之前调用）。
 * 挤出空间里截面在 XY（x = 宽、y = 高）、长度沿 +Z，于是内侧面只有三种：
 * 法线 +y 的底板内面、法线朝中线的翼内壁、以及两个端面（切口露铝）。
 * 木纹热转印只上外表面，其余走铝本色，就是靠这个分组实现的。
 */
export function splitByFacing(geo) {
  const pos = geo.attributes.position;
  const src = geo.index ? Array.from(geo.index.array) : null;
  const total = src ? src.length : pos.count;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();
  const outer = [];
  const inner = [];

  for (let t = 0; t < total; t += 3) {
    const i0 = src ? src[t] : t;
    const i1 = src ? src[t + 1] : t + 1;
    const i2 = src ? src[t + 2] : t + 2;
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    n.crossVectors(ab, ac).normalize();
    const cx = (a.x + b.x + c.x) / 3;

    const isCap = Math.abs(n.z) > 0.5; // 端面（切口）
    const intoChannel = n.y > 0.5 || (Math.abs(n.x) > 0.5 && n.x * cx < 0);
    (isCap || intoChannel ? inner : outer).push(i0, i1, i2);
  }

  geo.setIndex(outer.concat(inner));
  geo.clearGroups();
  geo.addGroup(0, outer.length, 0); // 外表面
  geo.addGroup(outer.length, inner.length, 1); // 内表面 + 端面
  return geo;
}

/**
 * U 型方通截面（开口朝上，三边等厚 t）
 * 顶点顺序与 DXF 完全一致：
 *   (0,100)(0,0)(50,0)(50,100)(42,100)(42,98)(48,98)(48,2)(2,2)(2,98)(8,98)(8,100)
  * 回勾在翼顶端向『内』折 hook 长，正好卡进龙骨侧壁的燕尾槽（见 keelWallProfile）。
 * 局部坐标：u = 宽度方向（±w/2），v = 高度方向（v=0 即完成面）。
 */
export function baffleProfile(w, h, t, hook) {
  const hw = w / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, h);
  s.lineTo(-hw, 0);
  s.lineTo(hw, 0);
  s.lineTo(hw, h);
  s.lineTo(hw - t - hook, h); // 顶面向内到回勾端（宽 = t + hook）
  s.lineTo(hw - t - hook, h - t); // 回勾端面
  s.lineTo(hw - t, h - t); // 回勾下表面 → 翼内壁
  s.lineTo(hw - t, t);
  s.lineTo(-hw + t, t);
  s.lineTo(-hw + t, h - t);
  s.lineTo(-hw + t + hook, h - t);
  s.lineTo(-hw + t + hook, h);
  s.closePath();
  return s;
}

/** 把沿 +Z 挤出的几何体转向沿 +X（截面 u 轴落到 -Z，v 轴保持 Y） */
export function turnToX(geo, length) {
  geo.rotateY(Math.PI / 2);
  geo.translate(-length / 2, 0, 0);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 齿形龙骨侧壁轮廓：一排燕尾 T 槽（尺寸来自 DXF keel_P22.5_500x30x30）
 * 局部坐标：u = 沿龙骨长度方向；v 向下为正（安装后自由端朝下），这里直接取 y = -v。
 * 槽从自由端往底板方向依次为：口（45° 倒角）→ 颈 → 腔；
 * 方通回勾顶过口、挤过颈、落进腔，回勾比颈宽，所以挂在“颈的台肩”上退不出来。
 */
export function keelWallProfile({ length, bandH, chamberW, chamberH, neckW, neckH, mouthW, mouthH, pitch, phase }) {
  const top = -(bandH + chamberH + neckH + mouthH); // 自由端（y 为负）
  const chamberY = -bandH; // 腔底 = 实带顶面
  const shoulderY = -(bandH + chamberH); // 台肩 = 回勾的承托面
  const neckY = -(bandH + chamberH + neckH); // 颈顶 = 口底
  const half = length / 2;

  const s = new THREE.Shape();
  s.moveTo(-half, 0);
  s.lineTo(half, 0);
  s.lineTo(half, top);

  // 从右向左逐槽下潜
  for (let c = Math.floor((half - chamberW / 2 - phase) / pitch) * pitch + phase; c >= -half + chamberW / 2; c -= pitch) {
    const cw = chamberW / 2;
    const nw = neckW / 2;
    const mw = mouthW / 2;
    s.lineTo(c + mw, top);
    s.lineTo(c + nw, neckY); // 45° 倒角
    s.lineTo(c + nw, shoulderY);
    s.lineTo(c + cw, shoulderY); // 台肩（外）
    s.lineTo(c + cw, chamberY);
    s.lineTo(c - cw, chamberY); // 腔底
    s.lineTo(c - cw, shoulderY);
    s.lineTo(c - nw, shoulderY); // 台肩（内）
    s.lineTo(c - nw, neckY);
    s.lineTo(c - mw, top); // 45° 倒角
  }

  s.lineTo(-half, top);
  s.closePath();
  return s;
}

/**
 * 侧壁实体几何：轮廓挤出料厚后转成“长度沿 Z、壁厚沿 X、开口朝下”，几何中心在原点。
 * rotateY(-90°) 把 (x,y,z) 映为 (-z,y,x)：挤出方向落到 -X（再平移居中），截面 u 直接落到 +Z，
 * 不镜像，所以槽相位 phase 可以按世界 Z 直接计算。
 */
export function keelWallGeometry(o) {
  const geo = extrude(keelWallProfile(o), o.t);
  geo.rotateY(-Math.PI / 2);
  geo.translate(o.t / 2, 0, 0);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------ 通丝螺纹 ------------------------------ */

/**
 * 螺旋线管体，模拟全螺纹吊杆的丝纹。沿 Y 轴居中。
 */
export function threadHelix(len, radius, pitch, tubeR) {
  const pts = [];
  const steps = Math.ceil((len / pitch) * 10);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -len / 2 + t * len;
    const a = t * (len / pitch) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, Math.min(steps * 2, 260), tubeR, 6, false);
}

/* ------------------------------ 虚线（弹线） ------------------------------ */

/**
 * 两点之间的等分虚线段中心点数组，用于 InstancedMesh 渲染"墨线/标高线"。
 * @returns {{positions:Array<[number,number,number]>, count:number}}
 */
export function dashRun(from, to, dash = 0.16, gap = 0.1) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  dir.normalize();
  const step = dash + gap;
  const count = Math.max(1, Math.floor(len / step));
  const positions = [];
  for (let i = 0; i < count; i++) {
    const p = a.clone().addScaledVector(dir, i * step + dash / 2);
    positions.push([p.x, p.y, p.z]);
  }
  return { positions, count, axis: dir };
}
