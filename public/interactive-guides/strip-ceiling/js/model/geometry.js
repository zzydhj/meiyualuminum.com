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
 * 四个侧面朝向都是“从该侧看过去文字不镜像”的推法：-z 必须额外转 180°；
 * -y（朝下的完成面）绕 X 转 +90°，从楼下仰视读正。
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

/** 二次 / 三次贝塞尔采样（局部中心线用），返回点列 */
function bezQuad(p0, p1, p2, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, m = 1 - u;
    out.push([m * m * p0[0] + 2 * m * u * p1[0] + u * u * p2[0], m * m * p0[1] + 2 * m * u * p1[1] + u * u * p2[1]]);
  }
  return out;
}
function bezCubic(p0, p1, p2, p3, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, m = 1 - u;
    out.push([
      m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0],
      m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1],
    ]);
  }
  return out;
}

/** 折线每点的左法向（朝通道内侧）；首尾用单侧切线 */
function leftNormals(P) {
  const m = P.length, out = [];
  for (let i = 0; i < m; i++) {
    const a = P[Math.max(0, i - 1)];
    const b = P[Math.min(m - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    dx /= L; dy /= L;
    out.push([-dy, dx]); // 左转 90°
  }
  return out;
}

function dedupe(P) {
  const out = [P[0]];
  for (let i = 1; i < P.length; i++) {
    const p = out[out.length - 1], q = P[i];
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) > 1e-6) out.push(q);
  }
  return out;
}

/**
 * 条扣板「外表皮」中线（u = 宽、v = 高，v=0 即完成面）：一条连续开口的薄板中线。
 * 完全照搬生成器 profile() 的左缘路径（G1 连续无尖角）：
 *   底板 → 底部 R 角 → 直立壁(hs) → 向内弧形倒勾腹(到 hd,hy) → 尖端向外微翻(到 hd-fd,H)。
 * 遍历顺序：左勾尖(顶) → 下行左缘 → 底板 → 上行右缘 → 右勾尖(顶)；
 * 这样左法向始终朝通道内侧，外皮(木纹)=中线本身，内皮(铝)=中线 + 法向×t；
 * 尖端绕过头顶翻出去的那张皮是外皮（= 木纹），朝槽内的下表面是内皮（= 铝）。
 */
export function stripCenterline(o) {
  const { width: w, r, hs, hd, fd, hy, height: H } = o;
  const hw = w / 2;
  const cy1 = hs + (hy - hs) * 0.55;
  const cy2 = hy - (hy - hs) * 0.55;
  const cy3 = hy + (H - hy) * 0.5;
  // 左缘「外表皮」自下而上（u=0 为壁线，向内为正）
  const leftUp = [
    ...bezQuad([r, 0], [0, 0], [0, r], 6), // 底部 R 角
    [0, hs], // 直立壁
    ...bezCubic([0, hs], [0, cy1], [hd, cy2], [hd, hy], 12).slice(1), // 向内弧形倒勾（腹）
    ...bezCubic([hd, hy], [hd, cy3], [hd - fd, H], [hd - fd, H], 8).slice(1), // 尖端向外微翻
  ];
  const left = leftUp.map(([u, v]) => [-hw + u, v]); // 左壁在 u=-hw、向内为 +u
  const right = leftUp.map(([u, v]) => [hw - u, v]); // 右缘镜像
  const P = [];
  for (let i = left.length - 1; i >= 0; i--) P.push(left[i]); // 左勾尖 → 左底
  P.push([hw - r, 0]); // 底板（完成面）
  for (let i = 0; i < right.length; i++) P.push(right[i]); // 右底 → 右勾尖
  return dedupe(P);
}

/**
 * 条扣板实体几何：由中线偏移出薄板厚度→闭合环→沿 +Z 挤出，
 * 再按「薄板拓扑」（不是全局上下方向）把三角面重排为两个材质组：
 *   组 0 = 外皮（木纹）：中线侧的三角面；组 1 = 内皮 + 端面（铝）：偏移侧与端面。
 * 这样回勾绕头顶的皮拿到木纹、朝槽内的下表面拿到铝，与热转印只上外表面一致。
 */
export function stripSheetGeometry(length, o) {
  const P = stripCenterline(o);
  const t = o.thickness;
  const nrm = leftNormals(P);
  const inner = P.map((p, i) => [p[0] + nrm[i][0] * t, p[1] + nrm[i][1] * t]);
  const ring = P.concat(inner.slice().reverse());

  const shape = new THREE.Shape();
  shape.moveTo(ring[0][0], ring[0][1]);
  for (let i = 1; i < ring.length; i++) shape.lineTo(ring[i][0], ring[i][1]);
  shape.closePath();

  const src = extrude(shape, length);
  const geo = src.index ? src.toNonIndexed() : src;
  geo.computeVertexNormals();

  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  const wood = { p: [], n: [], u: [] };
  const alu = { p: [], n: [], u: [] };

  // 中线各【线段】的方向与左法向（朝通道内），供下面按线段判偏移用
  const segs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], ay = P[i][1], ex = P[i + 1][0] - ax, ey = P[i + 1][1] - ay;
    const len = Math.hypot(ex, ey) || 1;
    segs.push({ ax, ay, dx: ex / len, dy: ey / len, lx: -ey / len, ly: ex / len, len });
  }

  for (let f = 0; f < pos.count; f += 3) {
    const nz = nor.getZ(f); // 非索引平面面，三顶点法线相同；|nz|>0.5 即端面
    const cx = (pos.getX(f) + pos.getX(f + 1) + pos.getX(f + 2)) / 3;
    const cy = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;

    let target = alu;
    if (Math.abs(nz) < 0.5) {
      // 侧壁：按“薄板拓扑”判——面重心到最近中线【线段】的法向偏移。
      // 外皮(木纹)在偏移≈ 0（中线侧），内皮(铝)在偏移≈ t。
      // 用线段而非顶点，避免平直底板（中线只有两端点）把重心误配到远处的回勾点。
      let bd = Infinity, bx = 0, by = 0, blx = 0, bly = 0;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        let tt = (cx - s.ax) * s.dx + (cy - s.ay) * s.dy;
        if (tt < 0) tt = 0; else if (tt > s.len) tt = s.len;
        const px = s.ax + s.dx * tt, py = s.ay + s.dy * tt;
        const d = (cx - px) ** 2 + (cy - py) ** 2;
        if (d < bd) { bd = d; bx = px; by = py; blx = s.lx; bly = s.ly; }
      }
      if ((cx - bx) * blx + (cy - by) * bly < t * 0.5) target = wood; // 贴近中线的一侧 = 外皮
    }

    for (let k = 0; k < 3; k++) {
      const idx = f + k;
      target.p.push(pos.getX(idx), pos.getY(idx), pos.getZ(idx));
      target.n.push(nor.getX(idx), nor.getY(idx), nor.getZ(idx));
      if (uv) target.u.push(uv.getX(idx), uv.getY(idx));
    }
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(wood.p.concat(alu.p), 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(wood.n.concat(alu.n), 3));
  if (wood.u.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(wood.u.concat(alu.u), 2));
  out.addGroup(0, wood.p.length / 3, 0); // 外皮 = 木纹
  out.addGroup(wood.p.length / 3, alu.p.length / 3, 1); // 内皮 + 端面 = 铝
  out.computeBoundingSphere();
  return out;
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
