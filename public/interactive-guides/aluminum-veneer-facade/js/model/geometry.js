/**
 * model/geometry.js —— 参数化几何工具（铝单板幕墙外立面）
 * 约定：1 单位 = 100 mm。几何体尽量复用（带缓存），减少 GPU 缓冲区数量。
 * 空间：X 水平、Y 竖向、Z 进深（+Z 朝室外）。截面默认在 XY 平面、沿 +Z 挤出。
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

/** 圆柱。axis 指定轴向（缓存时把旋转烘进几何体，调用方不得再 mutate 共享实例）。 */
export function cyl(rTop, rBot, h, seg = 24, axis = 'y', openEnded = false) {
  return cached(`cyl:${rTop},${rBot},${h},${seg},${axis},${openEnded}`, () => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, openEnded);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    return g;
  });
}

/**
 * 贴花平面：长边沿局部 X、字面朝向由 normal 指定（旋转烘进几何体并缓存）。
 * +z（朝室外的板面）不转，从外看文字不镜像。
 */
export function decal(w, h, normal = '+z') {
  return cached(`decal:${w},${h},${normal}`, () => {
    const g = new THREE.PlaneGeometry(w, h);
    if (normal === '-y') g.rotateX(Math.PI / 2);
    if (normal === '+x') g.rotateY(Math.PI / 2);
    if (normal === '-x') g.rotateY(-Math.PI / 2);
    if (normal === '-z') g.rotateY(Math.PI);
    g.userData.noEdge = true; // 贴花不是实体，选中描边不围它
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

/* ------------------------------ 型材截面 ------------------------------ */

/** 矩形空心方管 RHS 截面（w 沿 X、h 沿 Y、t 壁厚），居中于原点 */
export function rectTube(w, h, t) {
  const s = new THREE.Shape();
  const hw = w / 2, hh = h / 2;
  s.moveTo(-hw, -hh);
  s.lineTo(hw, -hh);
  s.lineTo(hw, hh);
  s.lineTo(-hw, hh);
  s.closePath();
  const hole = new THREE.Path();
  const iw = hw - t, ih = hh - t;
  hole.moveTo(-iw, -ih);
  hole.lineTo(-iw, ih);
  hole.lineTo(iw, ih);
  hole.lineTo(iw, -ih);
  hole.closePath();
  s.holes.push(hole);
  return s;
}

/**
 * 把 XY 截面沿指定轴拉成一根居中杆件。
 * axis='y' 竖向（rotateX(-90) 把 +Z 落到 +Y）；'x' 横向（rotateY(90) 把 +Z 落到 +X）。
 * 截面自身不额外平移，调用方用 shape 的原点约定控制截面在杆长垂直面上的位置。
 */
export function bar(shape, len, axis = 'y') {
  const geo = extrude(shape, len);
  if (axis === 'y') {
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -len / 2, 0);
  } else if (axis === 'x') {
    geo.rotateY(Math.PI / 2);
    geo.translate(-len / 2, 0, 0);
  } else {
    geo.translate(0, 0, -len / 2);
  }
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------ 虚线（弹线） ------------------------------ */

/**
 * 两点之间的等分虚线段中心点数组，用于 InstancedMesh 渲染"墨线/分格线"。
 */
export function dashRun(from, to, dash = 0.22, gap = 0.14) {
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
