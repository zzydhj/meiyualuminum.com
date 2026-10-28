/**
 * config.js —— 全局常量配置（渲染 / 相机 / 灯光 / 工序动画 / 爆炸 / 视角预设）
 * 只放可调参数；部件数据在 data/parts.js，工序数据在 data/steps.js。
 * 配色为亮色工程图纸风：浅底 + 结构蓝 + 工序橙。
 */

export const COLORS = {
  accent: '#0b6fb8', // 结构 / 选中
  step: '#e8730c', // 当前工序 / 高亮
  ok: '#16a06a', // 已安装 / 合格
  hover: '#3d9ad6',
  background: '#eef3f8',
};

export const RENDER = {
  maxPixelRatio: 2,
  toneExposure: 1.06,
  bloom: {
    // 亮色背景下只让很强的自发光（弹线）过阈值，避免整幅发灰
    strength: 0.3,
    radius: 0.35,
    threshold: 1.15,
  },
  msaa: 4,
};

export const CAMERA = {
  // 吊顶节点用窄视角：近大远小会把等壁厚的条板拍成一头厚一头薄
  fov: 24,
  near: 0.5,
  far: 260,
  // 看吊顶必须从下往上看，默认机位放在完成面以下
  start: [16.5, -8.5, 18.5],
  target: [0, 0.2, 0],
};

export const CONTROLS = {
  dampingFactor: 0.075,
  minDistance: 4,
  maxDistance: 78,
  autoRotateSpeed: 0.5,
  // 取景时在"刚好入画"基础上再乘的余量系数
  focusFactor: 1.14,
  focusDuration: 0.85,
};

export const LIGHTS = {
  ambient: { color: '#ffffff', intensity: 1.7 },
  key: { color: '#ffffff', intensity: 2.2, position: [14, 16, 12] },
  // 从楼下往上打的"室内灯光"，负责照亮龙骨下表面与条扣板肋板
  under: { color: '#ffffff', intensity: 26, position: [2, -10, 10] },
  rimCool: { color: '#cfe8ff', intensity: 12, position: [-16, 4, -12] },
  rimWarm: { color: '#ffe0bd', intensity: 8, position: [12, -8, -10] },
  fill: { color: '#ffffff', intensity: 7, position: [0, -12, 12] },
  // 代码生成的柔光棚光板（PMREM 环境反射来源，让金属有层次）
  envPanels: [
    { size: [26, 16], position: [0, 18, 0], rotation: [-Math.PI / 2, 0, 0], color: '#ffffff', intensity: 3.6 },
    { size: [20, 14], position: [-22, 2, 4], rotation: [0, Math.PI / 2, 0], color: '#eaf4ff', intensity: 2.2 },
    { size: [20, 14], position: [22, 0, -4], rotation: [0, -Math.PI / 2, 0], color: '#fff2e0', intensity: 1.8 },
    { size: [26, 18], position: [0, -14, 0], rotation: [Math.PI / 2, 0, 0], color: '#c8d6e2', intensity: 1.2 },
  ],
};

export const STAGE = {
  // 竖向渐变：顶部更亮，底部略带冷灰，读出"空间感"
  bgColor: ['#ffffff', '#eaf0f6', '#cfdbe6'],
  ground: { y: -7.2, radius: 34, gridColorA: '#8fb4d0', gridColorB: '#c6d7e6', opacity: 0.5 },
  dust: { count: 180, spread: 38, size: 0.055, color: '#7fa6c4', opacity: 0.3 },
};

/**
 * 雾：按"相机到目标的视距"比例给范围（见 core/stage.js）。
 * 固定世界距离会在拉远时把整个模型吞进雾里；nearN 乘在模型之外才开始起雾，
 * 所以无论拉到多远，模型本体始终清晰，只虚化地面网格与粉尘的边缘。
 */
export const FOG = { nearN: 1.7, farN: 4.2, minNear: 24 };

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
  stepInterval: 2.2,
  /**
   * 未安装部件的幽灵透明度。
   * 原先 0.05：亮背景上基本看不见，一进页面就像少了一大半东西（同一问题在
   * u-baffle-ceiling 上由业主 2026-10-28 反馈过）。提到 0.12：未装与已装仍
   * 一眼分得清，但画面不再空。
   */
  ghostOpacity: 0.12,
  /** 未安装部件的幽灵自发光：深色饰面在低透明度下会消失在亮背景里，靠工序色兜底 */
  ghostGlow: 0.55,
  /** 当前工序部件的强调发光强度：只作轻微提示，高了会把材质本色染掉（描边才是主要指示） */
  currentGlow: 0.14,
  doneGlow: 0.03,
  todoGlow: 0,
  /**
   * 染色的基色亮度下限：自发光光是“加”在材质上的，暗色件（黑漆 0.12、塑料 0.21）
   * 会被整片盖过变了色，所以低于此值不再染色，往上到 1 线性满额；
   * 暗件改用描边 / 工序卡 / 标签提示状态。也作用于 UI.glow 的悬停与选中色。
   */
  glowFloor: 0.15,
};

/** 视角预设：position 为相对模型中心（原点）的机位方向；按钮文字只在 index.html 里定义 */
export const VIEW_PRESETS = {
  // 正视：垂直于条扣板长度方向看过去，可看到排布与截面排列
  front: { position: [0, -6.5, 25] },
  // 侧视：沿截面方向看，可看到层次堆叠
  side: { position: [25, -6.5, 0] },
  // 仰视：从楼下垂直向上看完成面
  bottom: { position: [0.4, -26, 0.8] },
  // 俯视：从楼板向下看龙骨布置
  top: { position: [0.4, 26, 0.8] },
  iso: { position: [16.5, -8.5, 18.5] },
};

export const UI = {
  glow: {
    // 同上：叠在材质上的自发光染色，取值以“能看出选中但不改色”为限
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
