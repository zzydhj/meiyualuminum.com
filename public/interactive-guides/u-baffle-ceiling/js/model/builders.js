/**
 * model/builders.js —— 部件 id → 构造函数 的注册表
 * 只做映射，不放几何逻辑；id 必须与 data/parts.js 一一对应。
 */

import { buildSlab, buildLayoutLine } from './parts/substructure.js';
import { buildAnchorBolt, buildHangerRod, buildHangerNut } from './parts/suspension.js';
import { buildCarrier } from './parts/framework.js';
import { buildBaffle } from './parts/finish.js';

export const BUILDERS = {
  slab: buildSlab,
  'layout-line': buildLayoutLine,
  'anchor-bolt': buildAnchorBolt,
  'hanger-rod': buildHangerRod,
  'hanger-nut': buildHangerNut,
  carrier: buildCarrier,
  baffle: buildBaffle,
};
