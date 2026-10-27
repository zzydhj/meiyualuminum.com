/**
 * core/stage.js —— 渲染舞台：renderer + scene + 后期（MSAA / 色调映射 / Bloom）
 * 只负责"怎么画"，不关心场景里有什么。
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RENDER, STAGE } from '../config.js';

/** 竖向渐变背景（Canvas 生成，无外部图片） */
function gradientBackground(colors) {
  const cv = document.createElement('canvas');
  cv.width = 4;
  cv.height = 256;
  const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, colors[0]);
  grd.addColorStop(0.55, colors[1]);
  grd.addColorStop(1, colors[2]);
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

export function createStage({ canvas, camera }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // 交给 composer 的 MSAA 目标
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDER.toneExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = gradientBackground(STAGE.bgColor);
  scene.fog = new THREE.Fog(new THREE.Color(STAGE.bgColor[1]), 42, 96);

  const size = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: RENDER.msaa,
  });

  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    RENDER.bloom.strength,
    RENDER.bloom.radius,
    RENDER.bloom.threshold
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.setSize(size.x, size.y);

  function resize(width, height) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
    renderer.setSize(width, height, false);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
    composer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }

  return {
    renderer,
    scene,
    composer,
    bloom,
    resize,
    render: () => composer.render(),
    dispose() {
      rt.dispose();
      composer.dispose();
      scene.background.dispose();
      renderer.dispose();
    },
  };
}
