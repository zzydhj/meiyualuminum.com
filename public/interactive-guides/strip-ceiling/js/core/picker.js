/**
 * core/picker.js —— 射线拾取：区分"点击部件"与"拖拽视角"
 */

import * as THREE from 'three';

const CLICK_SLOP = 5; // 像素：超过即视为拖拽
const CLICK_MS = 550;

export function createPicker({ camera, canvas, root, onSelect, onHover }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const down = { x: 0, y: 0, t: 0, moved: false };
  let hoverId = null;

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(root, true);
    for (const hit of hits) {
      if (hit.object.userData.isDecor) continue;
      let node = hit.object;
      while (node && !node.userData.partId) node = node.parent;
      if (node) return node.userData.partId;
    }
    return null;
  }

  function onPointerMove(e) {
    if (down.t && (Math.abs(e.clientX - down.x) > CLICK_SLOP || Math.abs(e.clientY - down.y) > CLICK_SLOP)) {
      down.moved = true;
    }
    if (e.pointerType === 'touch') return;
    const id = pick(e.clientX, e.clientY);
    if (id !== hoverId) {
      hoverId = id;
      onHover(id, e.clientX, e.clientY);
    } else if (id) {
      onHover(id, e.clientX, e.clientY); // 同一部件也要跟随鼠标移动提示气泡
    }
  }

  function onPointerDown(e) {
    down.x = e.clientX;
    down.y = e.clientY;
    down.t = performance.now();
    down.moved = false;
  }

  function onPointerUp(e) {
    const quick = performance.now() - down.t < CLICK_MS;
    if (down.t && !down.moved && quick) onSelect(pick(e.clientX, e.clientY));
    down.t = 0;
  }

  function onPointerLeave() {
    if (hoverId) {
      hoverId = null;
      onHover(null);
    }
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);

  return {
    dispose() {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    },
  };
}
