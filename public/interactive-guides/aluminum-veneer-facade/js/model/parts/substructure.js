/**
 * model/parts/substructure.js —— 基层与定位：水泥墙、分格弹线
 */

import * as THREE from 'three';
import { box, dashRun } from '../geometry.js';
import { WALL, LAYOUT } from '../spec.js';

/** InstancedMesh 渲染一段段"墨线虚线"，一次 draw call 画完整组分格线 */
function dashes(segments, material, { dash = LAYOUT.dashLen, gap = LAYOUT.dashGap, t = LAYOUT.lineT } = {}) {
  const items = [];
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1);
  const quat = new THREE.Quaternion();

  for (const [a, b] of segments) {
    from.set(...a);
    to.set(...b);
    dir.subVectors(to, from);
    const { positions } = dashRun(a, b, dash, gap);
    quat.setFromUnitVectors(up, dir.clone().normalize());
    for (const p of positions) items.push({ p, quat });
  }

  const geo = new THREE.BoxGeometry(t, t, dash);
  const mesh = new THREE.InstancedMesh(geo, material, items.length);
  const m4 = new THREE.Matrix4();
  const s = new THREE.Vector3(1, 1, 1);
  const pos = new THREE.Vector3();
  items.forEach((it, i) => {
    pos.set(it.p[0], it.p[1], it.p[2]);
    m4.compose(pos, it.quat, s);
    mesh.setMatrixAt(i, m4);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

/** 水泥墙基层：一整面钢筋混凝土墙（+Z 侧为安装面），作固定基准件 */
export function buildWall(kit) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(
    box(WALL.width, WALL.height, WALL.thickness),
    kit.m('concrete', { repeat: [4, 4] })
  );
  wall.position.set(0, 0, WALL.z);
  g.add(wall);
  return g;
}

/** 分格弹线：弹在墙面的板缝/管位纵横控制线 */
export function buildLayoutLine(kit) {
  const g = new THREE.Group();
  const lineMat = kit.m('layout');
  const z = LAYOUT.z;
  const [y0, y1] = LAYOUT.span;
  const [x0, x1] = LAYOUT.span;

  const segs = [];
  for (const x of LAYOUT.vLines) segs.push([[x, y0, z], [x, y1, z]]);
  for (const y of LAYOUT.hLines) segs.push([[x0, y, z], [x1, y, z]]);
  g.add(dashes(segs, lineMat));

  return g;
}
