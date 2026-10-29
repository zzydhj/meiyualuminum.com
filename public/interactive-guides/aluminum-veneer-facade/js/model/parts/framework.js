/**
 * model/parts/framework.js —— 网状钢结构：锚固件（网格↔墙）+ 钢网格（竖管 + 横管）
 * 层次：水泥墙 → 锚固件 → 网状钢结构（方管网格，管位=板缝/板边中线，正对挂耳）。
 */

import * as THREE from 'three';
import { cyl, rectTube, bar } from '../geometry.js';
import { ANCHOR, STEEL_GRID, WALL } from '../spec.js';

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

/** 锚固件：网格 3×3 交点处各一根膨胀锚栓（六角螺帽 + 栓杆 + 入墙端套管），穿钢管背面直接打进墙 —— 不包转接块 */
export function buildAnchor(kit) {
  const g = new THREE.Group();
  const steel = kit.m('darkSteel', { color: '#8a929c', metalness: 0.95, roughness: 0.35 });
  const zinc = kit.m('zinc', { repeat: [1, 1] });
  const tubeBack = STEEL_GRID.z - STEEL_GRID.tube / 2; // 钢管背面（-0.7）
  const wallFace = WALL.frontZ; // 墙面前缘（-0.8）
  const zHead = tubeBack + 0.01; // 六角螺帽紧压钢管背面
  const tipZ = wallFace - ANCHOR.embed; // 锚栓入墙端（-1.4）
  const shankLen = zHead - tipZ; // 栓杆长（穿墙入墙）
  const zShank = (zHead + tipZ) / 2;
  const bolt = cyl(ANCHOR.boltR, ANCHOR.boltR, shankLen, 14, 'z');
  const head = cyl(ANCHOR.headR, ANCHOR.headR, ANCHOR.headT, 6, 'z'); // 六角
  const sleeve = cyl(ANCHOR.sleeveR, ANCHOR.boltR, 0.2, 14, 'z'); // 入墙端膨胀套管

  for (const x of STEEL_GRID.xs) {
    for (const y of STEEL_GRID.ys) {
      g.add(mesh(bolt, steel, x, y, zShank)); // 栓杆：从管背一路打进墙里
      g.add(mesh(head, steel, x, y, zHead + ANCHOR.headT / 2)); // 螺帽在管背侧压紧钢管
      g.add(mesh(sleeve, zinc, x, y, wallFace - 0.12)); // 墙内膨胀段
    }
  }
  return g;
}

/** 网状钢结构：竖向 + 横向 RHS 40×40×3 方管组成网格（管位与板挂耳对位） */
export function buildSteelGrid(kit) {
  const g = new THREE.Group();
  const zinc = kit.m('zinc', { repeat: [2, 10] });
  const sec = rectTube(STEEL_GRID.tube, STEEL_GRID.tube, STEEL_GRID.t);
  const len = STEEL_GRID.span;
  const z = STEEL_GRID.z;

  for (const x of STEEL_GRID.xs) g.add(mesh(bar(sec, len, 'y'), zinc, x, 0, z)); // 竖管
  for (const y of STEEL_GRID.ys) g.add(mesh(bar(sec, len, 'x'), zinc, 0, y, z)); // 横管
  return g;
}
