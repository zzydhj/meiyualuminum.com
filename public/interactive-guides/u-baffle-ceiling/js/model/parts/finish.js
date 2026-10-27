/**
 * model/parts/finish.js —— 饰面与附件：U 型铝方通（开口朝上 + 翼端向内回勾）、接长套筒、端头堵头
 * 截面按 DXF 实测：50 宽 × 100 高，三边等厚 2 mm，回勾向内 6 mm。
 */

import * as THREE from 'three';
import { box, cyl, extrude, baffleProfile, splitByFacing, turnToX, decal } from '../geometry.js';
import { LEVEL, BAFFLE, CONNECTOR, END_CAP, BRAND_MARK } from '../spec.js';

/**
 * U 型截面沿长度方向挤出：底板在 v=0（完成面，朝下），两翼升到 v=100，翼端回勾朝内。
 * 先按朝向分材质组再转向，因为判据用的是挤出空间里的法线。
 */
function baffleGeo(length) {
  const profile = baffleProfile(BAFFLE.width, BAFFLE.height, BAFFLE.thickness, BAFFLE.hook);
  return turnToX(splitByFacing(extrude(profile, length)), length);
}

/**
 * 方通拆成“段”后统一生成：几何与侧翼标都从同一份段落表推导，
 * 位置只算一次，不会出现在三段代码里各自推算同一根料的情况。
 *  - 5 根通长定尺
 *  - 1 根在 splitX 处断开并用内置套筒接长（演示超长接长）
 *  - 2 根（最外侧）因灯槽/窗帘盒不到墙，端头露明（演示堵头）
 */
export function buildBaffle(kit) {
  const g = new THREE.Group();
  // 外表面木纹热转印，内表面与切口留铝本色（[0] = 外，[1] = 内）
  const skin = [kit.m('wood'), kit.m('aluminum', { repeat: [1, 3] })];
  const cut = kit.m('coated', { color: '#98a2ac', roughness: 0.8, metalness: 0.3 });

  const H = BAFFLE.length / 2;
  const cutA = BAFFLE.splitX - CONNECTOR.gap / 2; // 断缝左侧端点
  const cutB = BAFFLE.splitX + CONNECTOR.gap / 2; // 断缝右侧端点
  const geos = {
    full: baffleGeo(BAFFLE.length),
    short: baffleGeo(BAFFLE.shortLength),
    left: baffleGeo(cutA + H),
    right: baffleGeo(H - cutB),
  };

  const pieces = [];
  for (let i = 0; i < BAFFLE.count; i++) {
    const z = BAFFLE.firstZ + i * BAFFLE.span;
    if (BAFFLE.shortRows.includes(z)) {
      pieces.push({ z, x0: -H, x1: -H + BAFFLE.shortLength, geo: geos.short });
    } else if (Math.abs(z - BAFFLE.splitZ) < 1e-6) {
      pieces.push({ z, x0: -H, x1: cutA, geo: geos.left }, { z, x0: cutB, x1: H, geo: geos.right });
    } else {
      pieces.push({ z, x0: -H, x1: H, geo: geos.full });
    }
  }

  const y = BAFFLE.bottomY; // 底板外表面 = 完成面
  // 断口处露出的铝材断面（提示"必须配堵头"）
  const ring = box(0.02, BAFFLE.height - 0.01, BAFFLE.width - 0.01);

  pieces.forEach(({ z, x0, x1, geo }) => {
    const m = new THREE.Mesh(geo, skin);
    m.position.set((x0 + x1) / 2, y, z);
    g.add(m);

    if (BAFFLE.shortRows.includes(z)) {
      const r = new THREE.Mesh(ring, cut);
      r.position.set(x1 - 0.01, y + BAFFLE.height / 2, z);
      g.add(r);
    }
  });

  /**
   * 侧翼外露面印标：两张竖直翼板的外侧（也是木纹面，与"只转印外表面"一致）。
   * 底板（朝下的完成面）特意不留任何标识：那是业主每天抬头看见的饰面带。
   * 枚数按步距在段内算（样板段1160 mm → 每面 2 枚）并等分居中；
   * +z / -z 两个朝向不能混用，否则从另一面看过去字是反的。
   */
  const lm = BRAND_MARK.leg;
  const legGeo = { 1: decal(lm.length, lm.width, '+z'), '-1': decal(lm.length, lm.width, '-z') };
  const etch = kit.m('decal');
  pieces.forEach(({ z, x0, x1 }) => {
    const n = Math.max(1, Math.floor((x1 - x0) / lm.pitch));
    const step = (x1 - x0) / n;
    [1, -1].forEach((k) => {
      for (let i = 0; i < n; i++) {
        const mk = new THREE.Mesh(legGeo[k], etch);
        mk.position.set(x0 + step * (i + 0.5), y + lm.rise, z + k * (BAFFLE.width / 2 + lm.lift));
        g.add(mk);
      }
    });
  });

  return g;
}

/** 接长连接件：内置铝套筒 + 两颗顶丝，跨在断缝上 */
export function buildConnectorSleeve(kit) {
  const g = new THREE.Group();
  const alu = kit.m('coated', { color: '#a8b2bc', roughness: 0.48, metalness: 0.72 });
  const steel = kit.m('darkSteel');

  // 套筒贴在方通底板内侧（开口朝上，所以从上方装入）
  const sleeveY = BAFFLE.bottomY + BAFFLE.thickness + CONNECTOR.height / 2 + 0.005;
  const sleeve = new THREE.Mesh(box(CONNECTOR.length, CONNECTOR.height, CONNECTOR.width), alu);
  sleeve.position.set(BAFFLE.splitX, sleeveY, BAFFLE.splitZ);
  g.add(sleeve);

  const set = cyl(0.02, 0.02, 0.1, 10);
  [-0.28, 0.28].forEach((dx) => {
    const s = new THREE.Mesh(set, steel);
    s.position.set(BAFFLE.splitX + dx, sleeveY + CONNECTOR.height / 2, BAFFLE.splitZ);
    g.add(s);
  });

  return g;
}

/** 端头堵头：卡进断口端，面板盖住切口毛刺，卡脚插在两翼内壁之间（同色木纹） */
export function buildEndCap(kit) {
  const g = new THREE.Group();
  const cap = kit.m('wood', { repeat: [2, 2] });
  const geo = box(END_CAP.thickness, END_CAP.height, END_CAP.width);
  const cy = LEVEL.baffleBottom + BAFFLE.thickness + END_CAP.height / 2;
  const markGeo = decal(BRAND_MARK.cap.length, BRAND_MARK.cap.width, '+x');
  const etch = kit.m('decal');

  BAFFLE.shortRows.forEach((z) => {
    const x = BAFFLE.shortEndX - END_CAP.thickness / 2 - 0.02;
    const m = new THREE.Mesh(geo, cap);
    m.position.set(x, cy, z);
    g.add(m);

    // 端面中央一道小厂标（成品堵头就是这么出的）
    const mk = new THREE.Mesh(markGeo, etch);
    mk.position.set(x + END_CAP.thickness / 2 + 0.002, cy, z);
    g.add(mk);
  });

  return g;
}
