/**
 * model/parts/framework.js —— 骨架层：齿形龙骨（U 形槽 30×30×1.0，侧壁一排燕尾 T 槽）
 *
 * 尺寸与锁合关系全部来自 DXF keel_P22.5_500x30x30（饰面板承托关系按 spec.js 的 STRIP 段，
 * 图纸见 docs/sections/strip-ceiling/）：
 *   底板朝上，φ8 吊杆孔按 250 间距开在底板上，螺杆穿进来后螺母坐在槽腔内；
 *   两条侧壁自由端朝下，按 22.5 间距冲出一排燕尾槽：口 9.5 → 颈 4.5 → 腔 18.5；
 *   条扣板不用燕尾槽：顶边两角的 5 × 0.8 缺口跨过侧壁自由端，0.8 台阶坐在 1.0 料厚上沿，板底与槽口齐平；
 *   拆修时沿通长方向侧推，缺口退离自由端即可斜吊下来——全程不用一颗螺钉；
 *   燕尾槽在本体系里主要留给同色压件/抗风夹使用。
 *
 * 表面：整道龙骨按项目要求做黑色哑光喷塑，区别于常规镀锌白。
 */

import * as THREE from 'three';
import { box, cyl, keelWallGeometry, decal } from '../geometry.js';
import { LEVEL, CARRIER, HANGER, BRAND_MARK } from '../spec.js';

export function buildCarrier(kit) {
  const g = new THREE.Group();
  const black = kit.m('blackPaint', { repeat: [6, 6] });
  const dark = kit.m('darkSteel', { color: '#6f7982' }); // 黑漆上靠浅灰读出孔口

  const wall = keelWallGeometry(CARRIER);
  const base = box(CARRIER.width, CARRIER.t, CARRIER.length);
  const rodHole = cyl(CARRIER.holeR, CARRIER.holeR, CARRIER.t + 0.02, 16);
  const wallX = CARRIER.width / 2 - CARRIER.t / 2; // 侧壁中线（外沿对齐 ±15）
  const plateY = LEVEL.carrierTop - CARRIER.t / 2;
  // 侧壁外表面的喷印钢印：黑漆上得用浅色才读得出，所以染成浅灰
  const stampInk = kit.m('decal', { color: '#aeb8c2', roughness: 0.6 });
  const { length: sLen, width: sWid } = BRAND_MARK.carrier;
  const stampGeo = { 1: decal(sLen, sWid, '+x'), '-1': decal(sLen, sWid, '-x') };
  const stampY = LEVEL.carrierTop - CARRIER.bandH / 2; // 实心带中线：上面是底板、下面是燕尾腔与条扣板肋顶

  CARRIER.positions.forEach((x) => {
    // 底板：整个吊顶的承力面，吊杆孔开在这里
    const plate = new THREE.Mesh(base, black);
    plate.position.set(x, plateY, 0);
    g.add(plate);

    // 两条侧壁：自由端朝下，燕尾槽开口朝下
    [-1, 1].forEach((k) => {
      const w = new THREE.Mesh(wall, black);
      w.position.set(x + k * wallX, LEVEL.carrierTop, 0);
      g.add(w);

      // 外壁钢印：开在实心带上，两排条扣板肋之间的空档各一枚
      BRAND_MARK.carrier.zs.forEach((z) => {
        const s = new THREE.Mesh(stampGeo[k], stampInk);
        s.position.set(x + k * (CARRIER.width / 2 + BRAND_MARK.carrier.lift), stampY, z);
        g.add(s);
      });
    });

    // 孔口：提示"螺杆从这里穿进来，螺母坐在槽腔里"
    HANGER.positions.forEach(([hx, hz]) => {
      if (Math.abs(hx - x) > 1e-6) return;
      const h = new THREE.Mesh(rodHole, dark);
      h.position.set(x, plateY, hz);
      g.add(h);
    });
  });

  return g;
}
