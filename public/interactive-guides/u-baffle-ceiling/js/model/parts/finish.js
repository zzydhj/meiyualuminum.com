/**
 * model/parts/finish.js —— 饰面：U 型铝方通（开口朝上 + 翼端向内回勾），全部按通长定尺生成
 * 截面 50 宽 × 100 高，三边等厚取 BAFFLE.thickness（1.0 mm，本厂辊轧常用料），回勾向内 6 mm。
 */

import * as THREE from 'three';
import { extrude, baffleProfile, splitByFacing, turnToX, decal } from '../geometry.js';
import { BAFFLE, BRAND_MARK } from '../spec.js';

/**
 * U 型截面沿长度方向挤出：底板在 v=0（完成面，朝下），两翼升到 v=100，翼端回勾朝内。
 * 先按朝向分材质组再转向，因为判据用的是挤出空间里的法线。
 */
function baffleGeo(length) {
  const profile = baffleProfile(BAFFLE.width, BAFFLE.height, BAFFLE.thickness, BAFFLE.hook);
  // 空腔边界：内壁在 ±(宽/2 − 料厚)，从底板上表面升到翼顶端
  const voidBox = {
    innerHalfW: BAFFLE.width / 2 - BAFFLE.thickness,
    baseTop: BAFFLE.thickness,
    top: BAFFLE.height,
  };
  return turnToX(splitByFacing(extrude(profile, length), voidBox), length);
}

/**
 * U 型截面沿长度方向挤出，8 根一根到底。
 *
 * 曾经这里故意为演示而生成了三种段：5 根通长 + 1 根在 splitX 处断成两段用内置
 * 套筒接长 + 2 根短料配端头堵头。业主 2026-10-28 定口径：现场不会用短料、也不接长、
 * 两头也不装封口件，不够就多买料——三种演示分支全部删掉，只保留通长一种。
 */
export function buildBaffle(kit) {
  const g = new THREE.Group();
  // 外表面木纹热转印，内表面留铝本色（[0] = 外，[1] = 内）
  const skin = [kit.m('wood'), kit.m('aluminum', { repeat: [1, 3] })];

  const H = BAFFLE.length / 2;
  const geo = baffleGeo(BAFFLE.length);
  const y = BAFFLE.bottomY; // 底板外表面 = 完成面

  const rows = [];
  for (let i = 0; i < BAFFLE.count; i++) {
    const z = BAFFLE.firstZ + i * BAFFLE.span;
    rows.push({ z, x0: -H, x1: H });
    const m = new THREE.Mesh(geo, skin);
    m.position.set(0, y, z);
    g.add(m);
  }

  /**
   * 侧翼外露面印标：两张竖直翼板的外侧（也是木纹面，与“只转印外表面”一致）。
   * 底板（朝下的完成面）特意不留任何标识：那是业主每天抬头看见的饰面带。
   * 枚数按步距在段内算（样板段1160 mm → 每面 2 枚）并等分居中；
   * +z / -z 两个朝向不能混用，否则从另一面看过去字是反的。
   */
  const lm = BRAND_MARK.leg;
  const legGeo = { 1: decal(lm.length, lm.width, '+z'), '-1': decal(lm.length, lm.width, '-z') };
  const etch = kit.m('decal');
  rows.forEach(({ z, x0, x1 }) => {
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
