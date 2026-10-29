/**
 * core/labels.js —— 部件标注：DOM 卡片 + SVG 折线引线
 * 只在"当前工序 / 选中 / 手动全部显示"时出现，并且会自动避让：
 * 左右两列各自按目标高度就近找空位，实在放不下就隐藏该条（宁可少显示也不要糊成一团）。
 */

import * as THREE from 'three';
import { LAYERS, layerOf } from '../data/parts.js';

const MIN_GAP = 62; // 卡片最小纵向间距（px）
const MIN_X_GAP = 190; // 视为"同一列"的横向阈值（px）

const projected = new THREE.Vector3();

export function createLabelLayer({ container, svg, camera, parts, assembly, getSafeArea, onSelect }) {
  const cards = new Map();
  const leaders = new Map();
  let showAll = false;
  let selectedId = null;
  let hoverId = null;

  parts.forEach((entry, id) => {
    const spec = entry.spec;

    const card = document.createElement('div');
    card.className = 'label';
    card.innerHTML = `
      <i class="label-group"></i>
      <div class="label-top"><span class="label-index"></span><span class="label-name"></span></div>
      <span class="label-spec"></span>
      <span class="label-step"></span>`;
    card.querySelector('.label-group').style.color = LAYERS[spec.layer].color;
    card.querySelector('.label-index').textContent = String(spec.step).padStart(2, '0');
    card.querySelector('.label-name').textContent = spec.name;
    card.querySelector('.label-spec').textContent = spec.keySpec;
    card.querySelector('.label-step').textContent = `Step ${spec.step}`;
    card.addEventListener('click', () => onSelect(id));
    container.appendChild(card);
    cards.set(id, card);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('class', 'leader');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'leader-dot');
    dot.setAttribute('r', '3');
    svg.appendChild(poly);
    svg.appendChild(dot);
    leaders.set(id, { poly, dot });
  });

  /** 在同一列里为卡片找一个不重叠的 y */
  function findSlot(list, item, area) {
    const fits = (y) =>
      y >= area.top &&
      y <= area.bottom &&
      !list.some((p) => Math.abs(p.lx - item.lx) < MIN_X_GAP && Math.abs(p.ly - y) < MIN_GAP);
    if (fits(item.ly)) return item.ly;
    for (let y = item.ly + MIN_GAP; y <= area.bottom; y += MIN_GAP) if (fits(y)) return y;
    for (let y = item.ly - MIN_GAP; y >= area.top; y -= MIN_GAP) if (fits(y)) return y;
    return null;
  }

  function spread(items, area) {
    const left = [];
    const right = [];
    items.forEach((it) => (it.dropped = false));
    // 离目标高度最近的先落位，剩下的往下/往上找空位
    [...items]
      .sort((a, b) => Math.abs(a.ly - a.sy) - Math.abs(b.ly - b.sy))
      .forEach((it) => {
        const list = it.onLeft ? left : right;
        const slot = findSlot(list, it, area);
        if (slot === null) it.dropped = true;
        else {
          it.ly = slot;
          list.push(it);
        }
      });
  }

  return {
    setShowAll(on) {
      showAll = on;
    },

    setSelected(id) {
      selectedId = id;
    },

    setHover(id) {
      hoverId = id;
    },

    update(width, height) {
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      const area = getSafeArea();

      const layout = [];
      parts.forEach((entry, id) => {
        const spec = entry.spec;
        const phase = assembly.phaseOf(id);
        const wanted =
          (showAll && !spec.fixed) ||
          phase === 'current' ||
          id === selectedId ||
          id === hoverId ||
          (showAll && id === selectedId);

        if (!wanted) {
          cards.get(id).classList.remove('is-visible');
          leaders.get(id).poly.style.display = 'none';
          leaders.get(id).dot.style.display = 'none';
          return;
        }

        projected.copy(entry.center).add(entry.group.position).project(camera);
        if (projected.z > 1) {
          cards.get(id).classList.remove('is-visible');
          leaders.get(id).poly.style.display = 'none';
          leaders.get(id).dot.style.display = 'none';
          return;
        }

        const sx = (projected.x * 0.5 + 0.5) * width;
        const sy = (-projected.y * 0.5 + 0.5) * height;
        layout.push({
          id,
          sx,
          sy,
          lx: sx + spec.labelOffset[0],
          ly: sy + spec.labelOffset[1],
          onLeft: spec.labelOffset[0] < 0,
        });
      });

      spread(layout, area);

      layout.forEach((it) => {
        const entry = parts.get(it.id);
        const card = cards.get(it.id);
        const { poly, dot } = leaders.get(it.id);
        const phase = assembly.phaseOf(it.id);

        if (it.dropped) {
          card.classList.remove('is-visible');
          poly.style.display = 'none';
          dot.style.display = 'none';
          return;
        }

        const lx = THREE.MathUtils.clamp(it.lx, area.left + 96, area.right - 96);
        const ly = THREE.MathUtils.clamp(it.ly, area.top, area.bottom);

        card.classList.toggle('is-current', phase === 'current' || it.id === selectedId);
        card.classList.toggle('is-done', phase === 'done' && it.id !== selectedId);
        card.style.color = layerOf(it.id).color;
        card.style.left = `${lx}px`;
        card.style.top = `${ly}px`;
        card.classList.add('is-visible');

        const elbowX = lx + (it.onLeft ? 96 : -96);
        poly.style.display = '';
        dot.style.display = '';
        poly.setAttribute('points', `${it.sx},${it.sy} ${elbowX},${ly} ${lx},${ly}`);
        poly.setAttribute('class', `leader${phase === 'current' ? ' is-current' : phase === 'done' ? ' is-done' : ''}`);
        dot.setAttribute('cx', it.sx);
        dot.setAttribute('cy', it.sy);
        dot.setAttribute('class', `leader-dot${phase === 'current' ? ' is-current' : ''}`);
      });
    },

    dispose() {
      cards.forEach((c) => c.remove());
      leaders.forEach((l) => {
        l.poly.remove();
        l.dot.remove();
      });
    },
  };
}
