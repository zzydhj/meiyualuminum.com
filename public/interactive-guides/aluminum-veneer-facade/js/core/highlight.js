/**
 * core/highlight.js —— 部件状态视觉：预装配幽灵轮廓、当前工序强调、悬停 / 选中描边
 *
 * 描边把整个部件的棱边合并成一个 LineSegments（部件局部坐标），
 * 一次 draw call 画完，切状态只改 visible 与颜色。
 */

import * as THREE from 'three';
import { ASSEMBLY, UI, COLORS } from '../config.js';

const MAX_EDGE_VERTS = 1200; // 超过此密度的网格（螺纹、螺旋管等）不描边
/**
 * 染色强度按基色亮度缩放。自发光是“加”在材质上的光，不是乘，
 * 所以同一个强度在亮材质上只是微调、在暗材质上会整片盖过本色
 * （实测：黑漆基色渲染为 (12,15,20)，吃 0.14 工序色后变 (98,42,25) 橙棕）。
 * 暗件不是没状态，而是改用描边 / 工序卡 / 标签来提示。
 */
function glowScale(lum) {
  const floor = ASSEMBLY.glowFloor;
  return Math.max(0, Math.min(1, (lum - floor) / (1 - floor)));
}

const v3 = new THREE.Vector3();
const m4 = new THREE.Matrix4();
// 高亮色只需两个实例，避免每帧新建对象
const TINT = {
  accent: new THREE.Color(COLORS.accent),
  step: new THREE.Color(COLORS.step),
};

export function createHighlighter({ parts, assembly }) {
  const edges = new Map();
  let selectedId = null;
  let hoverId = null;
  let ghostEnabled = true;

  function buildEdges(entry) {
    const positions = [];
    entry.content.updateMatrixWorld(true);

    entry.meshes.forEach((mesh) => {
      if (mesh.isInstancedMesh || !mesh.geometry) return;
      const pos = mesh.geometry.attributes.position;
      // 贴花几何带 noEdge：印在母材上的字描边会变成一圈贴纸框，反而脏
      if (!pos || pos.count > MAX_EDGE_VERTS || mesh.geometry.userData.noEdge) return;
      m4.copy(mesh.matrix);
      const eg = new THREE.EdgesGeometry(mesh.geometry, 26);
      const arr = eg.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        v3.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(m4);
        positions.push(v3.x, v3.y, v3.z);
      }
      eg.dispose();
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false })
    );
    line.visible = false;
    line.raycast = () => {}; // 不干扰拾取
    line.userData.isDecor = true;
    entry.group.add(line);
    edges.set(entry.id, line);
    return line;
  }

  return {
    setSelected(id) {
      selectedId = id;
      assembly.setSelected(id);
    },

    setHover(id) {
      hoverId = id;
    },

    setGhost(on) {
      ghostEnabled = on;
    },

    update() {
      parts.forEach((entry) => {
        const phase = assembly.phaseOf(entry.id);
        const isGhost = phase === 'todo' && ghostEnabled;
        const isCurrent = phase === 'current';
        const isSelected = entry.id === selectedId;
        const isHover = entry.id === hoverId;

        const glow = isSelected
          ? UI.glow.selected
          : isHover
            ? UI.glow.hover
            : isCurrent
              ? ASSEMBLY.currentGlow
              : phase === 'done'
                ? ASSEMBLY.doneGlow
                : ASSEMBLY.todoGlow;
        const glowColor = isSelected || isHover ? TINT.accent : TINT.step;

        entry.materials.forEach((mat) => {
          const base = mat.userData.base;

          if (isGhost) {
            mat.transparent = true;
            mat.opacity = ASSEMBLY.ghostOpacity;
            mat.depthWrite = false;
            // 深色饰面（木纹 / 黑漆）在极低透明度下会消失在亮背景里，
            // 所以幽灵态一律叠一层工序色自发光，保证“还没装”始终读得出。
            // 这一层故意不按亮度缩放：它靠的就是一片纯色，不是材质本色。
            mat.emissive.copy(TINT.step);
            mat.emissiveIntensity = ASSEMBLY.ghostGlow;
          } else {
            mat.transparent = base.transparent;
            mat.opacity = base.opacity;
            mat.depthWrite = base.depthWrite;
            if (base.emissive.getHex() === 0) {
              mat.emissive.copy(glowColor);
              mat.emissiveIntensity = glow * glowScale(base.lum);
            } else {
              // 自发光件（弹线）：保持原本亮度，只在高亮时轻微提亮
              mat.emissiveIntensity = base.emissiveIntensity + glow * 0.6;
            }
          }
        });

        const line = edges.get(entry.id) || (glow > 0 || isGhost ? buildEdges(entry) : null);
        if (line) {
          const show = isGhost || isCurrent || isSelected || isHover;
          line.visible = show;
          if (show) {
            const color = isSelected
              ? UI.edge.selected
              : isCurrent
                ? UI.edge.current
                : isHover
                  ? UI.edge.hover
                  : UI.edge.hover;
            line.material.color.set(color);
            line.material.opacity = isGhost ? 0.45 : isSelected ? 1 : 0.8;
          }
        }
      });
    },

    dispose() {
      edges.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
      edges.clear();
    },
  };
}
