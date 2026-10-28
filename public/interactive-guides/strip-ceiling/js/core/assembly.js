/**
 * core/assembly.js —— 装配状态机
 * 同时驱动两种位移：
 *   installFrom * (1 - install)  —— 工序演示：未安装的部件从"安装方向"停在远处
 *   explode     * explodeT       —— 爆炸拆解：层次沿法向分离
 * 位置在目标值上做指数阻尼，所以任何时刻切换工序 / 拖动滑块都不会有跳变。
 */

import * as THREE from 'three';
import { ASSEMBLY, EXPLODE } from '../config.js';

export function createAssembly({ parts }) {
  const state = new Map(); // id -> { install, explode, pop }
  parts.forEach((entry, id) => {
    state.set(id, { install: entry.spec.fixed ? 1 : 0, explode: 0, pop: 0 });
  });

  let mode = 'sequence';
  let step = 1;
  let globalExplode = 0;
  let selectedId = null;

  const popDir = new THREE.Vector3();

  /** 该部件在当前工序下的装配阶段 */
  function phaseOf(id) {
    if (mode === 'explode') return 'done';
    const s = parts.get(id).spec.step;
    if (s < step) return 'done';
    if (s === step) return 'current';
    return 'todo';
  }

  function installTarget(id) {
    return phaseOf(id) === 'todo' ? 0 : 1;
  }

  function explodeTarget(id) {
    const spec = parts.get(id).spec;
    if (spec.fixed || mode !== 'explode') return 0;
    return globalExplode;
  }

  /** 选中弹出的方向：优先用爆炸法向，基准件用向下 */
  function popDirectionOf(entry) {
    const v = entry.group.userData.explode;
    if (v.lengthSq() > 1e-6) return popDir.copy(v).normalize();
    return popDir.set(0, -1, 0);
  }

  function damp(current, target, dt, rate) {
    if (Math.abs(target - current) < 0.0008) return target;
    return current + (target - current) * (1 - Math.exp(-rate * dt));
  }

  return {
    get mode() {
      return mode;
    },
    get step() {
      return step;
    },
    get explodeProgress() {
      return globalExplode;
    },

    phaseOf,

    setMode(next) {
      mode = next;
    },

    setStep(next) {
      step = Math.max(1, Math.min(next, Number.MAX_SAFE_INTEGER));
    },

    setExplode(value) {
      globalExplode = THREE.MathUtils.clamp(value, 0, 1);
    },

    setSelected(id) {
      selectedId = id;
    },

    /** 每帧推进动画并写回 group.position */
    update(dt) {
      parts.forEach((entry, id) => {
        const s = state.get(id);
        s.install = damp(s.install, installTarget(id), dt, ASSEMBLY.damping);
        s.explode = damp(s.explode, explodeTarget(id), dt, EXPLODE.damping);
        s.pop = damp(s.pop, id === selectedId ? 1 : 0, dt, 6.5);

        const { installFrom, explode } = entry.group.userData;
        const offset = entry.group.position;
        offset.set(0, 0, 0);
        offset.addScaledVector(installFrom, 1 - s.install);
        offset.addScaledVector(explode, s.explode * EXPLODE.reach);
        if (s.pop > 0.001) offset.addScaledVector(popDirectionOf(entry), s.pop * 0.35);
      });
    },

    /** 装配完成度（0~1），用于自动取景判断 */
    installedRatio() {
      let sum = 0;
      state.forEach((s) => (sum += s.install));
      return sum / Math.max(1, state.size);
    },

    isExploded() {
      return mode === 'explode' && globalExplode > EXPLODE.explodedThreshold;
    },
  };
}
