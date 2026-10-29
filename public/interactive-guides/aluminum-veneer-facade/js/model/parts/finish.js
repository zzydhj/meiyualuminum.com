/**
 * model/parts/finish.js —— 饰面：铝单板（折边盒形板 + 板面厂标 + 一体折弯的挂耳脚）、密拼胶缝
 *
 * 铝单板：工厂折边成开口向后的浅托盘 —— 前面板 + 四边向后返边，背面焊加强筋。
 *   挂耳与板【一体】（同一张铝板折弯，非另焊件）：每条边 2 个（四边共 8 个），由返边末端再向外折 90°
 *   成一段水平台脚、朝板边外侧伸出、平贴到后面的钢管前壁，脚上开孔；安装时把板贴到钢网格上，
 *   用 8 颗自攻螺丝沿 Z 透过脚孔拧进钢管，一块一块地装。外表面喷涂实色（可见面），内面与切口留铝本色。
 * 密拼胶缝：4 块逐一挂装拧螺丝，成组装好后板缝嵌泡沫棒再打耐候胶。
 *
 * 一块板 = 一个部件（panel-1..4），以便工序里"先装一块、再装下一块"逐个演示。
 */

import * as THREE from 'three';
import { box, cyl, decal } from '../geometry.js';
import { PANEL, EAR, SEALANT, DEPTH, BRAND_MARK, STEEL_GRID } from '../spec.js';

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

/** 4 块板的中心（逐块安装顺序：下排左→右，上排左→右） */
const CENTERS = [];
for (const cy of PANEL.rowY) for (const cx of PANEL.colX) CENTERS.push([cx, cy]);

/** 从 id（panel-N / panel-N-screws）取板序号（0基） */
function panelIndex(id) {
  return Math.max(0, Number(id.match(/(\d+)/)[1]) - 1);
}

/** 从板序号（0基）算棋盘格错开相位：相邻板（同行/同列）相位相反，耳朵在共用管上错开不重叠 */
function earPhase(index) {
  const col = index % PANEL.cols;
  const row = Math.floor(index / PANEL.cols);
  return (col + row) % 2;
}

/** 一块板 8 个挂耳脚的中心坐标 + 脚所在深度 zFoot（沿边耳位按 phase 错开：向角 tabD 或再退 stagger） */
function earLayout(cx, cy, phase) {
  const hw = PANEL.width / 2;
  const hh = PANEL.height / 2;
  const zFoot = DEPTH.grid + STEEL_GRID.tube / 2 - EAR.t / 2; // 脚平贴钢管前壁（中心略外于 -0.3 管面）
  const shift = phase * EAR.stagger; // 错开量（沿边向内）
  const along = (half) => half - EAR.tabD - EAR.tabW / 2 - shift; // 沿边方向距板心的耳位（近两角）
  const out = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    out.push({ vertical: true, x: cx + sx * (hw + EAR.tabE / 2), y: cy + sy * along(hh) }); // 左/右竖边
    out.push({ vertical: false, x: cx + sx * along(hw), y: cy + sy * (hh + EAR.tabE / 2) }); // 上/下横边
  }
  return { zFoot, pts: out };
}

/** 给一块板加它一体的 8 个挂耳脚（只脚，随板一起放；螺丝属于单独工序） */
function addEars(g, cx, cy, alu, phase) {
  const { zFoot, pts } = earLayout(cx, cy, phase);
  const footV = box(EAR.tabE, EAR.tabW, EAR.t); // 左/右竖边的脚：沿 X 外伸、Y 为宽
  const footH = box(EAR.tabW, EAR.tabE, EAR.t); // 上/下横边的脚：沿 Y 外伸、X 为宽
  for (const p of pts) g.add(mesh(p.vertical ? footV : footH, alu, p.x, p.y, zFoot));
}

/** 一块板的 8 颗自攻螺丝 + 钉帽：单独部件，在板就位后沿 Z 拧进后面的钢管 */
export function buildPanelScrews(kit) {
  const g = new THREE.Group();
  const steel = kit.m('darkSteel', { color: '#5b626b', metalness: 0.9, roughness: 0.5 });
  const idx = panelIndex(kit.id);
  const [cx, cy] = CENTERS[idx];
  const { zFoot, pts } = earLayout(cx, cy, earPhase(idx));
  const screw = cyl(EAR.boltR, EAR.boltR, 0.2, 8, 'z');
  const head = cyl(EAR.boltR * 1.8, EAR.boltR * 1.8, 0.04, 6, 'z');
  for (const p of pts) {
    g.add(mesh(screw, steel, p.x, p.y, zFoot - 0.06)); // 穿过脚孔拧进钢管
    g.add(mesh(head, steel, p.x, p.y, zFoot + EAR.t / 2 + 0.02)); // 钉帽在脚外侧（朝室外）
  }
  return g;
}

/** 一块铝单板：前面板 + 四边返边 + 背面加强筋 + 板面厂标 + 一体的 8 个挂耳脚（螺丝为单独部件） */
export function buildPanel(kit) {
  const g = new THREE.Group();
  const painted = kit.m('coated', { color: PANEL.color, metalness: 0.32, roughness: 0.5, repeat: [2, 2] });
  const alu = kit.m('aluminum', { repeat: [1, 3] });
  // 墨色从 #3a3f45 调深：字标放大后业主还是说“不够明显”，真因是中性灰面板
  // （#c9ccd1）上中灰字的对比度太低，不是尺寸问题。字标贴图是白色的，
  // 这里的 color 就是印记本身的颜色。
  const ink = kit.m('decal', { color: '#22272c', roughness: 0.6 });

  const idx = panelIndex(kit.id);
  const [cx, cy] = CENTERS[idx];
  const t = PANEL.thickness;
  const e = PANEL.edge;
  const faceZ = PANEL.faceZ;
  const flangeZ = -e / 2; // 返边向后（-Z）
  const face = box(PANEL.width, PANEL.height, t);
  const flangeH = box(PANEL.width, t, e); // 上/下返边
  const flangeV = box(t, PANEL.height, e); // 左/右返边
  const stiff = box(PANEL.width - 0.6, 0.06, 0.05); // 背面加强筋
  const mark = decal(BRAND_MARK.face.length, BRAND_MARK.face.width, '+z');

  g.add(mesh(face, painted, cx, cy, faceZ - t / 2));
  g.add(mesh(flangeH, painted, cx, cy + PANEL.height / 2 - t / 2, flangeZ));
  g.add(mesh(flangeH, painted, cx, cy - PANEL.height / 2 + t / 2, flangeZ));
  g.add(mesh(flangeV, painted, cx + PANEL.width / 2 - t / 2, cy, flangeZ));
  g.add(mesh(flangeV, painted, cx - PANEL.width / 2 + t / 2, cy, flangeZ));
  for (const dy of [-2.2, 2.2]) g.add(mesh(stiff, alu, cx, cy + dy, -t - 0.025));
  g.add(mesh(mark, ink, cx, cy + BRAND_MARK.face.dy, faceZ + BRAND_MARK.face.lift));
  addEars(g, cx, cy, alu, earPhase(idx)); // 一体的 8 个挂耳脚（沿边按棋盘格错开；螺丝在下一道工序单独拧入）
  return g;
}

/** 密拼胶缝：板缝内的耐候胶条（纵横各一条，略凹于完成面） */
export function buildSealant(kit) {
  const g = new THREE.Group();
  const rubber = kit.m('plastic', { color: SEALANT.color, roughness: 0.9, metalness: 0.05 });
  const span = PANEL.rows * PANEL.pitchY - PANEL.joint; // 整幅高/宽
  const v = box(SEALANT.width, span, SEALANT.depth);
  const h = box(span, SEALANT.width, SEALANT.depth);
  g.add(mesh(v, rubber, 0, 0, SEALANT.z));
  g.add(mesh(h, rubber, 0, 0, SEALANT.z));
  return g;
}
