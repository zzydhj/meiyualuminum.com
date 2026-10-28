/**
 * core/environment.js —— 灯光、代码生成的柔光棚环境贴图、参考网格与空气尘埃
 * 全部用代码搭出来，不依赖任何 HDR / 贴图文件。
 */

import * as THREE from 'three';
import { LIGHTS, STAGE } from '../config.js';

export function createEnvironment({ scene, renderer }) {
  /* ---------------------- 灯光 ---------------------- */
  const ambient = new THREE.AmbientLight(LIGHTS.ambient.color, LIGHTS.ambient.intensity);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(LIGHTS.key.color, LIGHTS.key.intensity);
  key.position.set(...LIGHTS.key.position);
  scene.add(key);

  const points = [LIGHTS.rimCool, LIGHTS.rimWarm, LIGHTS.fill].map((cfg) => {
    const l = new THREE.PointLight(cfg.color, cfg.intensity, 70, 1.6);
    l.position.set(...cfg.position);
    scene.add(l);
    return l;
  });

  /* ---------------------- 柔光棚 → 环境反射 ---------------------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#dce7f1');
  const panelGeo = new THREE.PlaneGeometry(1, 1);
  LIGHTS.envPanels.forEach((p) => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(p.color).multiplyScalar(p.intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(panelGeo, mat);
    mesh.scale.set(p.size[0], p.size[1], 1);
    mesh.position.set(...p.position);
    mesh.rotation.set(...p.rotation);
    envScene.add(mesh);
  });
  const environment = pmrem.fromScene(envScene, 0.02).texture;
  scene.environment = environment;
  panelGeo.dispose();
  envScene.traverse((o) => o.material && o.material.dispose());
  pmrem.dispose();

  /* ---------------------- 参考网格 + 光环 + 尘埃 ---------------------- */
  const decor = new THREE.Group();
  decor.visible = false; // 默认关闭，工具栏"网格"开关控制
  scene.add(decor);

  const g = STAGE.ground;
  const grid = new THREE.PolarGridHelper(g.radius, 16, 12, 96, g.gridColorA, g.gridColorB);
  grid.material.transparent = true;
  grid.material.opacity = g.opacity;
  grid.position.y = g.y;
  decor.add(grid);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(g.radius * 0.62, g.radius * 0.66, 96),
    new THREE.MeshBasicMaterial({ color: g.gridColorA, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = g.y + 0.02;
  decor.add(halo);

  const dustGeo = new THREE.BufferGeometry();
  const n = STAGE.dust.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (Math.random() - 0.5) * STAGE.dust.spread;
    arr[i * 3 + 1] = (Math.random() - 0.5) * STAGE.dust.spread * 0.5;
    arr[i * 3 + 2] = (Math.random() - 0.5) * STAGE.dust.spread;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      size: STAGE.dust.size,
      color: STAGE.dust.color,
      transparent: true,
      opacity: STAGE.dust.opacity,
      depthWrite: false,
    })
  );
  decor.add(dust);

  return {
    update(elapsed) {
      halo.rotation.z = elapsed * 0.12;
      dust.rotation.y = elapsed * 0.01;
    },
    setGridVisible(visible) {
      decor.visible = visible;
    },
    dispose() {
      scene.remove(decor);
      grid.geometry.dispose();
      grid.material.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      dust.geometry.dispose();
      dust.material.dispose();
      environment.dispose();
      points.forEach((l) => scene.remove(l));
    },
  };
}
