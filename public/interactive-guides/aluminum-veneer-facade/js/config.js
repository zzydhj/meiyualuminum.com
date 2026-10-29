/**
 * config.js —— 全局常量配置（渲染 / 相机 / 灯光 / 工序动画 / 爆炸 / 视角预设）
 * 只放可调参数；部件数据在 data/parts.js，工序数据在 data/steps.js。
 * 铝单板幕墙外立面：竖向节点，从室外 +Z 侧观看；配色为亮色工程图纸风（浅底 + 结构蓝 + 工序橙）。
 */

export const COLORS = {
  accent: '#0b6fb8', // 结构 / 选中
  step: '#e8730c', // 当前工序 / 高亮
  ok: '#16a06a', // 已安装 / 合格
  hover: '#3d9ad6',
  background: '#eef3f8',
};

export const RENDER = {
  // 像素量上限与 MSAA 采样数已下放到下方 QUALITY 分档，这里只留与档位无关的色调参数
  // （两处都写就会漂：改一档时很容易只改到其中一个）
  toneExposure: 1.05,
  bloom: {
    strength: 0.28,
    radius: 0.35,
    threshold: 1.15,
  },
};

/**
 * 画质分档——每帧成本几乎全在三个地方：像素量（pixelRatio²）、MSAA 采样数、
 * Bloom 的多级模糊全屏 pass。三档只动这三项，几何、材质、灯光、工序数据完全一致，
 * 所以不同档看到的构造与尺寸是同一回事，只是边缘锐度与辉光差别。
 *
 * 默认按设备自动选（core/quality.js），工具栏可手动覆盖并记在 localStorage。
 */
export const QUALITY = {
  high: { label: 'High', pixelRatio: 2, msaa: 4, bloom: true },
  balanced: { label: 'Balanced', pixelRatio: 1.5, msaa: 0, bloom: true },
  lite: { label: 'Lite', pixelRatio: 1, msaa: 0, bloom: false },
};

/** 标注层节流频率（Hz）：卡片只要跟得上相机就不必每帧重排，120Hz 屏上省得最多 */
export const LABEL_HZ = 30;

export const CAMERA = {
  fov: 30,
  near: 0.5,
  far: 340,
  // 外立面从室外斜看：机位在 +Z 前侧、略高
  start: [18, 13, 30],
  target: [0, 0, -1.4],
};

export const CONTROLS = {
  dampingFactor: 0.075,
  minDistance: 6,
  maxDistance: 160,
  autoRotateSpeed: 0.5,
  focusFactor: 1.16,
  focusDuration: 0.9,
};

export const LIGHTS = {
  ambient: { color: '#ffffff', intensity: 1.4 },
  // 主光：室外日光，从前方偏上打来，照亮见光板面
  key: { color: '#ffffff', intensity: 2.6, position: [14, 18, 24] },
  // 正面补光：把见光面整体提亮，避免金属/实色发暗
  fill: { color: '#ffffff', intensity: 10, position: [0, 4, 26] },
  rimCool: { color: '#cfe4ff', intensity: 14, position: [-18, 8, 12] },
  rimWarm: { color: '#ffe6c4', intensity: 8, position: [16, -6, 14] },
  // 代码生成的柔光棚光板（PMREM 环境反射来源，让金属与涂层有层次）
  envPanels: [
    { size: [44, 26], position: [0, 6, 30], rotation: [0, Math.PI, 0], color: '#eaf4ff', intensity: 3.2 },
    { size: [30, 22], position: [0, 26, 0], rotation: [-Math.PI / 2, 0, 0], color: '#ffffff', intensity: 3.0 },
    { size: [24, 18], position: [-26, 4, 0], rotation: [0, Math.PI / 2, 0], color: '#dceaf8', intensity: 1.8 },
    { size: [24, 18], position: [26, 2, 0], rotation: [0, -Math.PI / 2, 0], color: '#fff0dc', intensity: 1.4 },
    { size: [44, 30], position: [0, -16, 0], rotation: [Math.PI / 2, 0, 0], color: '#c8d2da', intensity: 1.0 },
  ],
};

export const STAGE = {
  // 竖向渐变：偏天空的亮底，读出室外空间感
  bgColor: ['#eef5fc', '#dce8f3', '#c3d3e2'],
  ground: { y: -12, radius: 40, gridColorA: '#8fb4d0', gridColorB: '#c6d7e6', opacity: 0.5 },
  dust: { count: 160, spread: 44, size: 0.055, color: '#7fa6c4', opacity: 0.28 },
};

/**
 * 雾：按"相机到目标的视距"比例给范围（见 core/stage.js）。
 * 固定世界距离会在拉远时把整个模型吞进雾里；nearN 乘在模型之外才开始起雾，
 * 所以无论拉到多远，模型本体始终清晰，只虚化地面网格与粉尘的边缘。
 */
export const FOG = { nearN: 1.7, farN: 4.2, minNear: 28 };

export const EXPLODE = {
  damping: 4.6,
  // 位移向量按数据原值使用（1 单位 = 100 mm）
  reach: 1,
  explodedThreshold: 0.35,
};

export const ASSEMBLY = {
  /** 部件安装 / 拆卸的阻尼速度 */
  damping: 3.4,
  /** 自动播放时每工序停留秒数 */
  stepInterval: 2.4,
  /** 未安装部件的幽灵透明度 */
  ghostOpacity: 0.06,
  /** 未安装部件的幽灵自发光：暗色钢件在低透明度下会消失在亮背景里，靠工序色兜底 */
  ghostGlow: 0.55,
  /** 当前工序部件的强调发光强度：只作轻微提示，高了会把材质本色染掉（描边才是主要指示） */
  currentGlow: 0.14,
  doneGlow: 0.03,
  todoGlow: 0,
  /** 染色基色亮度下限（见 highlight.js）：暗件改用描边 / 工序卡 / 标签提示状态 */
  glowFloor: 0.15,
};

/**
 * 视角预设：position 是"机位相对模型中心"的方向，实际距离由取景自动算（见 core/camera.js）。
 * 外立面：正视看板面、侧掠看进深层次、剖切看构造堆叠、45° 看整体。
 */
export const VIEW_PRESETS = {
  front: { position: [0, 0, 1] },
  side: { position: [1, 0.12, 0] },
  section: { position: [0.85, 0.32, 0.9] },
  iso: { position: [0.62, 0.44, 1] },
};

export const UI = {
  glow: {
    hover: 0.06,
    selected: 0.1,
  },
  /** 描边颜色：亮底上用饱和实色（不做加色，否则会发白看不见） */
  edge: {
    selected: '#0b6fb8',
    current: '#e8730c',
    hover: '#61a9d8',
  },
  xray: {
    opacity: 0.16,
    innerAmount: 0.55,
  },
  /** 爆炸进度超过该值时自动拉远取景 */
  autoFitProgress: 0.5,
};
