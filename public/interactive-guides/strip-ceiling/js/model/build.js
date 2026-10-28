/**
 * model/build.js —— 把部件数据 + 构造函数装配成可交互的场景图
 * 每个部件一个 Group：位移（安装 / 爆炸）只改 Group.position，
 * 部件内部的网格一律用绝对坐标建模，因此包围盒与锚点可解析推算，无需每帧重算。
 */

import * as THREE from 'three';
import { PARTS } from '../data/parts.js';
import { BUILDERS } from './builders.js';
import { createMaterialFactory } from '../core/materials.js';

const box = new THREE.Box3();
const sub = new THREE.Box3();
const vec = new THREE.Vector3();

export function buildCeilingNode() {
  const materialFactory = createMaterialFactory();
  const root = new THREE.Group();
  root.name = 'ceiling-node';
  const parts = new Map();

  PARTS.forEach((spec) => {
    const factory = BUILDERS[spec.id];
    if (!factory) throw new Error(`No model builder for part ${spec.id}`);

    const kit = { id: spec.id, m: (kind, overrides) => materialFactory.forPart(spec.id, kind, overrides) };
    const content = factory(kit);

    const group = new THREE.Group();
    group.name = spec.id;
    group.add(content);
    root.add(group);
    group.updateMatrixWorld(true);

    const meshes = [];
    const materials = [];
    const seen = new Set();
    content.traverse((o) => {
      if (!o.isMesh) return;
      o.userData.partId = spec.id;
      meshes.push(o);
      // 多材质（如条扣板：外表面喷涂 + 内表面铝）要展开逐个收录，高亮才能同时生效
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (m && !seen.has(m.uuid)) {
          seen.add(m.uuid);
          materials.push(m);
        }
      });
    });

    // 解析式包围盒：中心 + 半尺寸（组内无旋转，位移后直接相加）
    box.makeEmpty();
    meshes.forEach((m) => {
      sub.setFromObject(m);
      box.union(sub);
    });

    group.userData.home = group.position.clone();
    group.userData.explode = new THREE.Vector3(...(spec.explode || [0, 0, 0]));
    group.userData.installFrom = new THREE.Vector3(...(spec.installFrom || [0, 0, 0]));

    parts.set(spec.id, {
      id: spec.id,
      spec,
      group,
      content,
      meshes,
      materials,
      center: box.getCenter(new THREE.Vector3()),
      half: box.getSize(new THREE.Vector3()).multiplyScalar(0.5),
    });
  });

  return { root, parts, materialFactory };
}

/** 部件锚点的世界坐标（跟随组的安装 / 爆炸位移） */
export function partAnchor(entry, out = new THREE.Vector3()) {
  return out.copy(entry.center).add(entry.group.position);
}

/**
 * 当前应参与取景的部件整体包围盒。
 * @param {Map} parts
 * @param {(entry)=>boolean} [filter] 缺省为全部可见部件
 */
export function boundsOf(parts, out = new THREE.Box3(), filter = (e) => e.group.visible) {
  out.makeEmpty();
  parts.forEach((entry) => {
    if (!filter(entry)) return;
    vec.copy(entry.center).add(entry.group.position);
    sub.min.copy(vec).sub(entry.half);
    sub.max.copy(vec).add(entry.half);
    out.union(sub);
  });
  if (out.isEmpty()) out.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(6, 4, 6));
  return out;
}
