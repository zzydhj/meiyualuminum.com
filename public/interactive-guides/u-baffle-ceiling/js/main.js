/**
 * main.js —— 装配入口：把 core（渲染/相机/状态）与 ui（面板/操作台）接起来
 * 这里只放"业务判断"，具体渲染与 DOM 操作都在各自模块内。
 */

import * as THREE from 'three';
import { ASSEMBLY, QUALITY, LABEL_HZ } from './config.js';
import { createStage } from './core/stage.js';
import { createEnvironment } from './core/environment.js';
import { createCameraRig } from './core/camera.js';
import { createAssembly } from './core/assembly.js';
import { createHighlighter } from './core/highlight.js';
import { createPicker } from './core/picker.js';
import { createLabelLayer } from './core/labels.js';
import { autoQuality, detectRenderer, rememberQuality, storedQuality } from './core/quality.js';
import { buildCeilingNode, boundsOf } from './model/build.js';
import { createStepsPanel } from './ui/stepsPanel.js';
import { createDetailPanel } from './ui/detailPanel.js';
import { createToolbar } from './ui/toolbar.js';
import { createHoverTip } from './ui/hoverTip.js';
import { createGuide } from './ui/guide.js';
import { createHotkeys } from './ui/hotkeys.js';
import { STEP_COUNT } from './data/steps.js';
import { PARTS, PART_MAP } from './data/parts.js';

const $ = (sel) => document.querySelector(sel);
const dom = {
  app: $('#app'),
  canvas: $('#viewport'),
  labels: $('#labels'),
  leaders: $('#leaders'),
  hoverTip: $('#hoverTip'),
  toolbar: $('#toolbar'),
  panelLeft: $('#stepsPanel'),
  panelRight: $('#detailPanel'),
  stepsList: $('#stepsList'),
  legend: $('#layerLegend'),
  detailTitle: $('#detailTitle'),
  detailBody: $('#detailBody'),
  tabs: document.querySelector('.tabs'),
  metaStep: $('#metaStep'),
  metaParts: $('#metaParts'),
  boot: $('#boot'),
  bootText: $('#boot .boot-text'),
  gpuNote: $('#gpuNote'),
  guide: $('#guide'),
};

const fitBox = new THREE.Box3();
const viewport = { w: 1, h: 1, left: 0, right: 1, top: 0, bottom: 1 };
const state = {
  step: 1,
  mode: 'sequence',
  quality: 'balanced',
  labelsOn: false,
  ghostOn: true,
  gridOn: false,
  orbitOn: false,
  playing: false,
  playTimer: 0,
  selected: null,
};

let stage;
let env;
let rig;
let world;
let assembly;
let highlighter;
let labels;
let picker;
let toolbar;
let stepsPanel;
let detail;
let hoverTip;
let guide;

/* ------------------------------------------------------------------ */
/* 深链：#step=N（也兼容 ?step=N）                                      */
/* 站内的安装工序表逐行链到这里，所以地址栏就是当前工序的真相来源。  */
/* ------------------------------------------------------------------ */

/** 从地址栏取工序号；越界、非数字或未携带都返回 null，保持默认从第 1 步开始 */
function stepFromLocation() {
  const raw =
    (location.hash.match(/(?:^|[#&])step=(\d+)/) || [])[1] ||
    new URLSearchParams(location.search).get('step');
  const order = Number.parseInt(raw, 10);
  return Number.isFinite(order) && order >= 1 && order <= STEP_COUNT ? order : null;
}

/** 落地时带的工序号；有值就直达该步、并跳过新手引导遮罩 */
const deepStep = stepFromLocation();

/* ------------------------------------------------------------------ */
/* 取景与避让                                                          */
/* ------------------------------------------------------------------ */

/** 当前应该被"框住"的范围：工序模式下未安装的远处幽灵件不参与，避免画面被拉飞 */
function currentBox() {
  if (!world) {
    fitBox.makeEmpty();
    fitBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(16, 6, 11));
    return fitBox;
  }
  return boundsOf(
    world.parts,
    fitBox,
    (entry) =>
      entry.group.visible &&
      (state.mode === 'explode' || assembly.phaseOf(entry.id) !== 'todo' || entry.spec.fixed)
  );
}

function getSafeArea() {
  return { left: viewport.left, right: viewport.right, top: viewport.top, bottom: viewport.bottom };
}

function cssLength(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

function syncViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const toolbarH = toolbar ? toolbar.measureHeight() + 18 : cssLength('--toolbar-h', 84);
  document.documentElement.style.setProperty('--toolbar-h', `${Math.round(toolbarH)}px`);

  const panelW = cssLength('--panel-w', 300);
  const topbarH = cssLength('--topbar-h', 66);
  const left = dom.panelLeft.classList.contains('is-collapsed-left') ? 24 : panelW + 34;
  const right = dom.panelRight.classList.contains('is-collapsed-right') ? 24 : panelW + 34;
  const top = topbarH + 18;
  const bottom = toolbarH + 30;

  Object.assign(viewport, { w, h, left, right: w - right, top, bottom: h - bottom });
  rig.setViewport(w, h, { left, right, top, bottom });
  stage.resize(w, h);
}

/* ------------------------------------------------------------------ */
/* 状态变更                                                            */
/* ------------------------------------------------------------------ */

function applyStep(order) {
  state.step = Math.max(1, Math.min(order, STEP_COUNT));
  if (state.mode !== 'sequence') setMode('sequence', { keepStep: true });

  assembly.setStep(state.step);
  stepsPanel.setStep(state.step);
  toolbar.setStep(state.step, STEP_COUNT);
  toolbar.setExplode(0);
  detail.showStep(state.step);
  dom.metaStep.textContent = `${state.step}/${STEP_COUNT}`;
  // 地址栏跟着当前工序走，便于把正在看的那一步直接发给客户；
  // replaceState 不新增历史记录、也不触发 hashchange，自动播放时不会刷屏。
  const hash = `#step=${state.step}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function setMode(mode, { keepStep = false } = {}) {
  state.mode = mode;
  assembly.setMode(mode);
  toolbar.setMode(mode);

  if (mode === 'explode') {
    // 切到爆炸时如果滑块还在 0，自动给一个能看清层次的值
    if (assembly.explodeProgress < 0.05) {
      assembly.setExplode(0.8);
      toolbar.setExplode(0.8);
    }
    window.setTimeout(() => rig.focus(), 260);
  } else if (!keepStep) {
    assembly.setStep(state.step);
  }
}

function selectPart(id) {
  state.selected = id;
  highlighter.setSelected(id);
  labels.setSelected(id);
  if (id) detail.showPart(id);
  else detail.showStep(state.step);
}

function focusOnPart(id) {
  const entry = world.parts.get(id);
  if (!entry) return;
  const box = boundsOf(world.parts, new THREE.Box3(), (e) => e === entry);
  rig.focusOnBox(box, 0.75);
}

function toggle(name) {
  if (name === 'labels') {
    state.labelsOn = !state.labelsOn;
    labels.setShowAll(state.labelsOn);
    toolbar.setToggle('labels', state.labelsOn);
  } else if (name === 'ghost') {
    state.ghostOn = !state.ghostOn;
    highlighter.setGhost(state.ghostOn);
    toolbar.setToggle('ghost', state.ghostOn);
  } else if (name === 'grid') {
    state.gridOn = !state.gridOn;
    env.setGridVisible(state.gridOn);
    toolbar.setToggle('grid', state.gridOn);
  } else if (name === 'orbit') {
    state.orbitOn = !state.orbitOn;
    rig.setAutoRotate(state.orbitOn);
    toolbar.setToggle('orbit', state.orbitOn);
  }
}

function setPlaying(on) {
  state.playing = on;
  state.playTimer = 0;
  toolbar.setPlaying(on);
}

/** 一键在"全部安装"与"全部拆解"之间切换 */
function toggleAll() {
  if (state.mode === 'explode' || state.step < STEP_COUNT) {
    applyStep(STEP_COUNT);
    setPlaying(false);
  } else {
    setMode(state.mode === 'explode' ? 'sequence' : 'explode');
  }
}

function resetSequence() {
  selectPart(null);
  setMode('sequence');
  assembly.setExplode(0);
  applyStep(1);
  toolbar.setActiveView('iso');
  rig.focus();
}

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

function boot() {
  // 画质档：用户手动选过就以他选的为准，否则按设备自动判
  const gpu = detectRenderer();
  const qualityName = storedQuality() ?? autoQuality(gpu);
  state.quality = qualityName;

  rig = createCameraRig({ canvas: dom.canvas, getFitBox: currentBox });
  stage = createStage({ canvas: dom.canvas, camera: rig.camera, quality: QUALITY[qualityName] });
  env = createEnvironment({ scene: stage.scene, renderer: stage.renderer });

  world = buildCeilingNode();
  stage.scene.add(world.root);

  assembly = createAssembly({ parts: world.parts });
  highlighter = createHighlighter({ parts: world.parts, assembly });
  labels = createLabelLayer({
    container: dom.labels,
    svg: dom.leaders,
    camera: rig.camera,
    parts: world.parts,
    assembly,
    getSafeArea,
    onSelect: selectPart,
  });
  picker = createPicker({
    camera: rig.camera,
    canvas: dom.canvas,
    root: world.root,
    onSelect: (id) => selectPart(id),
    onHover: (id, x, y) => {
      highlighter.setHover(id);
      labels.setHover(id);
      if (id && PART_MAP[id]) hoverTip.show(`${PART_MAP[id].name} · 工序 ${PART_MAP[id].step}`, x, y);
      else hoverTip.hide();
    },
  });

  stepsPanel = createStepsPanel({ listEl: dom.stepsList, legendEl: dom.legend, onSelect: applyStep });
  detail = createDetailPanel({
    titleEl: dom.detailTitle,
    bodyEl: dom.detailBody,
    tabsEl: dom.tabs,
    onJumpToStep: applyStep,
    onFocusPart: focusOnPart,
  });
  toolbar = createToolbar({
    root: dom.toolbar,
    handlers: {
      onMode: setMode,
      onStep: (delta) => applyStep(state.step + delta),
      onPlay: () => setPlaying(!state.playing),
      onExplode: (value) => {
        if (state.mode !== 'explode') setMode('explode');
        assembly.setExplode(value);
      },
      onView: (name) => {
        rig.preset(name);
        toolbar.setActiveView(name);
      },
      onQuality: (name) => {
        state.quality = name;
        stage.setQuality(QUALITY[name]);
        rememberQuality(name);
        // 像素量变了，面板避让与取景范围要重新同步一次
        syncViewport();
      },
      onToggle: toggle,
      onAllParts: toggleAll,
      onRestore: resetSequence,
      onHome: () => {
        toolbar.setActiveView('iso');
        rig.home();
      },
    },
  });
  hoverTip = createHoverTip({ el: dom.hoverTip });
  guide = createGuide({
    el: dom.guide,
    titleEl: $('#guideTitle'),
    descEl: $('#guideDesc'),
    dotsEl: $('#guideDots'),
    nextBtn: $('#guideNext'),
    skipBtn: $('#guideSkip'),
    reopenBtn: $('#btnGuide'),
  });

  createHotkeys({
    app: dom.app,
    handlers: {
      step: (delta) => applyStep(state.step + delta),
      jump: (order) => applyStep(order),
      play: () => setPlaying(!state.playing),
      allParts: toggleAll,
      toggle,
      grid: () => toggle('grid'),
      reset: resetSequence,
      focusView: () => rig.focus(),
      deselect: () => selectPart(null),
    },
  });

  $('#btnCollapseLeft').addEventListener('click', () => {
    dom.panelLeft.classList.toggle('is-collapsed-left');
    syncViewport();
  });
  $('#btnCollapseRight').addEventListener('click', () => {
    dom.panelRight.classList.toggle('is-collapsed-right');
    syncViewport();
  });
  window.addEventListener('resize', syncViewport);
  // 地址栏工序号变了（站内另一条深链、或浏览器前进后退）跟着跳
  window.addEventListener('hashchange', () => {
    const order = stepFromLocation();
    if (order) applyStep(order);
  });
  // 操作台换行会改变高度，用尺寸监听再同步一次
  if ('ResizeObserver' in window) new ResizeObserver(syncViewport).observe(dom.toolbar);

  dom.metaParts.textContent = String(PARTS.length);
  toolbar.setQuality(qualityName);
  // 软件渲染（CPU 模拟显卡）不是模型重，是浏览器配置问题，直接告诉访问者怎么修
  if (gpu.software) {
    dom.gpuNote.hidden = false;
    dom.gpuNote.textContent =
      `Your browser is drawing on the CPU (${gpu.name || 'software renderer'}) instead of the graphics card, ` +
      `so this page will feel sluggish at any quality level. Turn hardware acceleration back on in the browser ` +
      `settings — in Chrome, open chrome://flags, set “Choose ANGLE graphics backend” to Default, and relaunch.`;
  }
  syncViewport();
  applyStep(deepStep ?? 1);
  detail.render();
  rig.focus(0.01);

  dom.boot.classList.add('is-hidden');
  // 淡出后移除遮罩节点，避免它继续吃掉鼠标事件
  window.setTimeout(() => dom.boot.remove(), 700);
  // 从站内工序表直达某一步时不再弹新手引导（顶栏 ? 仍可随时重看）
  if (!deepStep) guide.open();
  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ */
/* 主循环                                                              */
/* ------------------------------------------------------------------ */

let last = performance.now();
let labelNext = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.playing) {
    state.playTimer += dt;
    if (state.playTimer >= ASSEMBLY.stepInterval) {
      state.playTimer = 0;
      if (state.step >= STEP_COUNT) setPlaying(false);
      else applyStep(state.step + 1);
    }
  }

  assembly.update(dt);
  env.update(now / 1000);
  rig.update(dt);
  highlighter.update();
  // 标注层节流到 LABEL_HZ：卡片只要跟得上相机就不必每帧重排，高刷屏上省得最多
  if (now >= labelNext) {
    labelNext = now + 1000 / LABEL_HZ;
    labels.update(viewport.w, viewport.h);
  }
  stage.render();
  requestAnimationFrame(loop);
}

try {
  boot();
} catch (err) {
  console.error(err);
  dom.boot.classList.remove('is-hidden');
  dom.bootText.classList.add('is-error');
  dom.bootText.textContent = `初始化失败：${err.message}`;
}
