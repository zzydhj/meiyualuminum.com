/**
 * model/parts/substructure.js —— 基层与定位：楼板（含钢筋/线管）、标高与分档弹线
 */

import * as THREE from 'three';
import { box, cyl, dashRun, decal } from '../geometry.js';
import { slabStencilMap } from '../textures.js';
import { MODULE, SLAB, LEVEL, LAYOUT, SLAB_STENCIL, STRIP, HANGER } from '../spec.js';
import { BRAND } from '../../data/brand.js';

/** InstancedMesh 渲染一段段"墨线虚线"，一次 draw call 画完整圈 */
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

/** 钢筋混凝土楼板（内含钢筋网与电气线管，透视图下可见） */
export function buildSlab(kit) {
  const g = new THREE.Group();
  const w = MODULE.length + SLAB.overhang * 2;
  const d = MODULE.width + SLAB.overhang * 2;
  const yCenter = (LEVEL.slabTop + LEVEL.slabBottom) / 2;

  const slab = new THREE.Mesh(box(w, SLAB.thickness, d), kit.m('concrete', { repeat: [3, 2] }));
  slab.position.set(0, yCenter, 0);
  g.add(slab);

  // 板底钢筋网（贴近下表面，锚栓打孔必须避开）
  const barGeo = cyl(0.026, 0.026, w - 0.4, 10, 'x');
  const barGeoZ = cyl(0.026, 0.026, d - 0.4, 10, 'z');
  const rebarMat = kit.m('darkSteel', { color: '#7a6a58', roughness: 0.72, metalness: 0.85 });
  const barY = LEVEL.slabBottom + 0.26;
  for (let i = 0; i < 6; i++) {
    const z = -d / 2 + 0.9 + i * ((d - 1.8) / 5);
    const b = new THREE.Mesh(barGeo, rebarMat);
    b.position.set(0, barY, z);
    g.add(b);
  }
  for (let i = 0; i < 5; i++) {
    const x = -w / 2 + 1.2 + i * ((w - 2.4) / 4);
    const b = new THREE.Mesh(barGeoZ, rebarMat);
    b.position.set(x, barY + 0.06, 0);
    g.add(b);
  }

  // 板底电气线管 + 接线盒：现场弹线后要先探测管线再打锚栓
  const conduit = new THREE.Mesh(cyl(0.075, 0.075, w, 14), kit.m('plastic', { color: '#2f6b52' }));
  conduit.rotation.z = Math.PI / 2;
  conduit.position.set(0, LEVEL.slabBottom + 0.12, 0);
  g.add(conduit);

  const boxGeo = box(0.34, 0.12, 0.34);
  const junction = new THREE.Mesh(boxGeo, kit.m('plastic', { color: '#245044' }));
  junction.position.set(2.4, LEVEL.slabBottom + 0.12, 0);
  g.add(junction);

  // 板底样板段喷字：喷在结构面上，所以跟着楼板走而不是跟着弹线走（爆炸图里不会飘开）
  const st = SLAB_STENCIL;
  const stencil = new THREE.Mesh(
    decal(st.width, st.height, '-y'),
    kit.m('paintStencil', { map: slabStencilMap(BRAND.stencil) })
  );
  stencil.position.set(st.x, LEVEL.slabBottom - st.lift, st.z);
  g.add(stencil);

  return g;
}

/** 标高控制线（墙面 50 线闭合）+ 板底吊点十字线 + 条扣板分档墨线 */
export function buildLayoutLine(kit) {
  const g = new THREE.Group();
  const lineMat = kit.m('layout');
  const softMat = kit.m('layout', { emissiveIntensity: 0.9 });

  // 1) 四周墙面完成面标高线（虚线闭合矩形）
  const x = LAYOUT.wallX;
  const z = LAYOUT.wallZ;
  const y = LAYOUT.levelY;
  const perimeter = [
    [[-x, y, -z], [x, y, -z]],
    [[x, y, -z], [x, y, z]],
    [[x, y, z], [-x, y, z]],
    [[-x, y, z], [-x, y, -z]],
  ];
  g.add(dashes(perimeter, lineMat));

  // 2) 板底吊点十字线
  const seatY = LEVEL.slabBottom + 0.012;
  const crosses = [];
  HANGER.positions.forEach(([hx, hz]) => {
    crosses.push([
      [hx - 0.5, seatY, hz],
      [hx + 0.5, seatY, hz],
    ]);
    crosses.push([
      [hx, seatY, hz - 0.5],
      [hx, seatY, hz + 0.5],
    ]);
  });
  g.add(dashes(crosses, lineMat, { dash: 0.12, gap: 0.07 }));

  // 3) 条扣板分档墨线（沿 X 通长，实线）
  const seg = box(STRIP.length, LAYOUT.lineT, LAYOUT.lineT);
  for (let i = 0; i < STRIP.count; i++) {
    const l = new THREE.Mesh(seg, softMat);
    l.position.set(0, seatY, STRIP.firstZ + i * STRIP.span);
    g.add(l);
  }

  return g;
}
