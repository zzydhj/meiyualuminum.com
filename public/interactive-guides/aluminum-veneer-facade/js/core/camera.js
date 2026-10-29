/**
 * core/camera.js —— 相机与轨道控制：预设视角、按包围盒取景、缓动飞行
 * 取景时会把左右面板与底部操作台"占用的屏幕空间"折算进去，保证模型不被挡住。
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CAMERA, CONTROLS, VIEW_PRESETS } from '../config.js';

const DEG = Math.PI / 180;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const WORLD_Z = new THREE.Vector3(0, 0, 1);

export function createCameraRig({ canvas, getFitBox }) {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
  camera.position.set(...CAMERA.start);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = CONTROLS.dampingFactor;
  controls.minDistance = CONTROLS.minDistance;
  controls.maxDistance = CONTROLS.maxDistance;
  controls.autoRotateSpeed = CONTROLS.autoRotateSpeed;
  controls.target.set(...CAMERA.target);
  controls.update();

  const view = new THREE.Vector2(1, 1);
  const insets = { left: 0, right: 0, top: 0, bottom: 0 };

  /* ---------- 缓动状态 ---------- */
  const fly = {
    active: false,
    t: 0,
    duration: 1,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
  };

  /* ---------- 取景计算 ---------- */
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const size = new THREE.Vector3();
  const half = new THREE.Vector3();
  const corner = new THREE.Vector3();
  const center = new THREE.Vector3();

  function freeRect() {
    const w = Math.max(160, view.x - insets.left - insets.right);
    const h = Math.max(160, view.y - insets.top - insets.bottom);
    return { w, h };
  }

  /** 沿 dir 方向看过去，让 box 完整落在"未被面板遮挡的区域"所需距离 */
  function fitDistance(box, dir) {
    forward.copy(dir).normalize().multiplyScalar(-1);
    right.crossVectors(forward, WORLD_UP);
    if (right.lengthSq() < 1e-8) right.crossVectors(forward, WORLD_Z);
    right.normalize();
    up.crossVectors(right, forward).normalize();

    box.getSize(size);
    half.copy(size).multiplyScalar(0.5);

    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < 8; i++) {
      corner.set(
        (i & 1 ? 1 : -1) * half.x,
        (i & 2 ? 1 : -1) * half.y,
        (i & 4 ? 1 : -1) * half.z
      );
      maxX = Math.max(maxX, Math.abs(corner.dot(right)));
      maxY = Math.max(maxY, Math.abs(corner.dot(up)));
    }

    const free = freeRect();
    const tanV = Math.tan((camera.fov * DEG) / 2);
    const dv = maxY / (tanV * (free.h / view.y));
    const dh = maxX / (tanV * camera.aspect * (free.w / view.x));
    return Math.max(dv, dh) * CONTROLS.focusFactor;
  }

  function flyTo(position, target, duration = CONTROLS.focusDuration) {
    fly.fromPos.copy(camera.position);
    fly.fromTarget.copy(controls.target);
    fly.toPos.copy(position);
    fly.toTarget.copy(target);
    fly.t = 0;
    fly.duration = Math.max(0.01, duration);
    fly.active = true;
  }

  /** 让 box 以 dir 方向入画（dir 为"机位相对中心"的方向） */
  function frameBox(box, dir, duration) {
    box.getCenter(center);
    const distance = THREE.MathUtils.clamp(
      fitDistance(box, dir),
      CONTROLS.minDistance,
      CONTROLS.maxDistance
    );
    flyTo(center.clone().add(dir.clone().normalize().multiplyScalar(distance)), center, duration);
  }

  return {
    camera,
    controls,

    setViewport(width, height, boxInsets) {
      view.set(width, height);
      Object.assign(insets, boxInsets);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    },

    /** 保持当前朝向重新取景 */
    focus(duration) {
      const dir = camera.position.clone().sub(controls.target);
      if (dir.lengthSq() < 1e-6) dir.set(...VIEW_PRESETS.iso.position);
      frameBox(getFitBox(), dir, duration);
    },

    /** 切到某个预设视角 */
    preset(name, duration) {
      const p = VIEW_PRESETS[name];
      if (!p) return;
      frameBox(getFitBox(), new THREE.Vector3(...p.position), duration);
    },

    /** 聚焦到指定包围盒（点击部件时用） */
    focusOnBox(box, duration) {
      const dir = camera.position.clone().sub(controls.target);
      if (dir.lengthSq() < 1e-6) dir.set(...VIEW_PRESETS.iso.position);
      frameBox(box, dir, duration);
    },

    home(duration) {
      const target = new THREE.Vector3(...CAMERA.target);
      flyTo(new THREE.Vector3(...CAMERA.start), target, duration);
    },

    setAutoRotate(on) {
      controls.autoRotate = on;
    },

    stopFlight() {
      fly.active = false;
    },

    update(dt) {
      if (fly.active) {
        fly.t = Math.min(1, fly.t + dt / fly.duration);
        const k = 1 - Math.pow(1 - fly.t, 3);
        camera.position.lerpVectors(fly.fromPos, fly.toPos, k);
        controls.target.lerpVectors(fly.fromTarget, fly.toTarget, k);
        if (fly.t >= 1) fly.active = false;
      }
      controls.update();
    },

    dispose() {
      controls.dispose();
    },
  };
}
