/**
 * model/builders.js —— 部件 id → 构造函数 的注册表
 * 只做映射，不放几何逻辑；id 必须与 data/parts.js 一一对应。
 */

import { buildWall, buildLayoutLine } from './parts/substructure.js';
import { buildAnchor, buildSteelGrid } from './parts/framework.js';
import { buildPanel, buildPanelScrews, buildSealant } from './parts/finish.js';

export const BUILDERS = {
  wall: buildWall,
  'layout-line': buildLayoutLine,
  anchor: buildAnchor,
  'steel-grid': buildSteelGrid,
  // 4 块板逐块挂装：每块板 = 先放板（panel-N）、再拧 8 颗螺丝（panel-N-screws），builder 按 kit.id 取对应板心
  ...Object.fromEntries([1, 2, 3, 4].flatMap((n) => [[`panel-${n}`, buildPanel], [`panel-${n}-screws`, buildPanelScrews]])),
  'joint-sealant': buildSealant,
};
