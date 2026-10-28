/**
 * model/parts/finish.js —— 饰面层：铝条扣板（木纹热转印，全平滑弧边卡扣式）
 * 截面依据 docs/sections/strip-ceiling/smooth-arc-clipin-profile-generator.html：
 *   底板 + 底部 R 角 + 直立弧边 + 顶缘向内回勾（见 spec.js STRIP 段）。
 * 卡合方式：板缘顶端的向内回勾挤过齿形龙骨侧壁的燕尾槽口、挂在台肩上（与 U 型方通同源）。
 * 排布：全部通长统一长度，两板间留非常细微的缝，两端到墙由收边条收口（现场无断缝、无堵头）。
 */

import * as THREE from 'three';
import { stripSheetGeometry, turnToX, decal } from '../geometry.js';
import { STRIP, BRAND_MARK } from '../spec.js';

/**
 * 条扣板截面沿长度方向挤出：底板在 v=0（完成面，朝下），两缘升到 hs，顶部向内绕弧形回勾。
 * 材质分组在 stripSheetGeometry 里按薄板拓扑分好（外皮木纹 / 内皮+端面铝），这里只转向。
 */
function stripGeo(length) {
  return turnToX(stripSheetGeometry(length, STRIP), length);
}

/** 8 根通长定尺，从中间向两侧密排；几何与板面字标都从同一份排布表推导 */
export function buildStrip(kit) {
  const g = new THREE.Group();
  // 外表面木纹热转印，内表面与切口留铝本色（[0] = 外，[1] = 内）
  const skin = [kit.m('wood'), kit.m('aluminum', { repeat: [1, 3] })];
  const geo = stripGeo(STRIP.length);
  const H = STRIP.length / 2;
  const y = STRIP.bottomY; // 底板外表面 = 完成面

  const rows = [];
  for (let i = 0; i < STRIP.count; i++) rows.push(STRIP.firstZ + i * STRIP.span);
  rows.forEach((z) => {
    const m = new THREE.Mesh(geo, skin);
    m.position.set(0, y, z);
    g.add(m);
  });

  /**
   * 板面（朝下的完成面）上的 MEIYU 字标：木纹热转印成品允许间隔印厂标。
   * 枚数按步距在定尺内算（样板段 1160 mm → 每根 2 枚）并等分居中；
   * 贴花朝下（-y），从楼下仰视读正，不随观察方向翻转。
   */
  const fm = BRAND_MARK.face;
  const faceGeo = decal(fm.length, fm.width, '-y');
  const ink = kit.m('decal');
  const n = Math.max(1, Math.floor(STRIP.length / fm.pitch));
  const step = STRIP.length / n;
  rows.forEach((z) => {
    for (let i = 0; i < n; i++) {
      const mk = new THREE.Mesh(faceGeo, ink);
      mk.position.set(-H + step * (i + 0.5), y - fm.lift, z);
      g.add(mk);
    }
  });

  return g;
}
