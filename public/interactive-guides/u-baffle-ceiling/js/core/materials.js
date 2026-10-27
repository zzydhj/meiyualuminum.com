/**
 * core/materials.js —— 材质工厂
 * 每个部件独立持有一份材质实例（partId + kind + 参数指纹 作缓存键），
 * 这样高亮 / 幽灵预装配 / X 射线 只会影响被操作的那个部件，不会串色。
 *
 * userData.base 记录"出厂状态"，highlight.js 依赖它做恢复。
 */

import * as THREE from 'three';
import { COLORS } from '../config.js';
import { concreteMap, zincSpangleMap, brushedAluminumMap, coatedMetalMap, woodGrainMap, noiseRoughness, brandWordmarkMap } from '../model/textures.js';

/** 贴图只生成一次，按需 clone 出独立 repeat */
const TEX = {
  get concrete() {
    return (this._c ??= concreteMap());
  },
  get zinc() {
    return (this._z ??= zincSpangleMap());
  },
  get brushed() {
    return (this._b ??= brushedAluminumMap());
  },
  get coated() {
    return (this._k ??= coatedMetalMap());
  },
  get wood() {
    return (this._w ??= woodGrainMap());
  },
  get noise() {
    return (this._n ??= noiseRoughness());
  },
  get brandMark() {
    return (this._m ??= brandWordmarkMap());
  },
};

/** 复制一张贴图并设置平铺次数（共享同一张 canvas，不重复绘制） */
function tiled(texture, repeat) {
  if (!texture || !repeat) return texture;
  const t = texture.clone();
  t.repeat.set(repeat[0], repeat[1]);
  t.needsUpdate = true;
  return t;
}

/** 材料种类模板（repeat = [u, v]，用于把程序化贴图按构件尺寸平铺） */
const KINDS = {
  /**
   * 现浇混凝土结构面（楼板）：灰黑水泥。
   * 注意 map 与 color 是相乘关系 —— 贴图本身已是中灰（#767c81），再乘一个中灰 tint
   * 会把反照率压到近黑，届时任何一点自发光染色都会整块盖过材质本色（实测被选中高亮染成深蓝）。
   * 所以这里只给接近白的中性微调，明暗交给贴图与灯光。
   */
  concrete: () => ({
    map: TEX.concrete,
    color: '#e3e7ea',
    roughness: 0.95,
    metalness: 0.02,
    envMapIntensity: 0.14,
    repeat: [2, 2],
  }),
  /** 成孔内壁 / 阴影侧：比结构面暗一档，但仍是灰，不能乘成纯黑 */
  concreteDark: () => ({
    map: TEX.concrete,
    color: '#9aa1a8',
    roughness: 0.98,
    metalness: 0.02,
    envMapIntensity: 0.1,
    repeat: [3, 3],
  }),
  /** 镀锌型材（吊杆 / 螺母） */
  zinc: () => ({
    map: TEX.zinc,
    color: '#c3ccd6',
    roughness: 0.42,
    metalness: 0.92,
    envMapIntensity: 0.85,
    repeat: [2, 2],
  }),
  /** 黑色哑光烤漆 / 喷塑（本项目齿形龙骨指定色） */
  blackPaint: () => ({
    map: TEX.coated,
    color: '#1b1f24',
    roughness: 0.66,
    metalness: 0.16,
    envMapIntensity: 0.4,
    repeat: [6, 6],
  }),
  /** 拉丝铝饰面（方通内表面与切口：热转印只做外表面） */
  aluminum: () => ({
    map: TEX.brushed,
    color: '#d6dde4',
    roughness: 0.34,
    metalness: 0.95,
    envMapIntensity: 1.05,
    repeat: [1.5, 4],
  }),
  /**
   * 木纹热转印（方通外表面）
   * repeat[1] 很小是因为截面挤出的 V 轴就是构件长度：1 格 = 100 mm 会让山纹每 10 cm 重复，
   * 拉到 0.12 才能做到一根方通上只出两到三个完整纹理周期。
   */
  wood: () => ({
    map: TEX.wood,
    roughnessMap: TEX.noise,
    roughness: 0.58,
    metalness: 0.06,
    envMapIntensity: 0.4,
    repeat: [1, 0.12],
  }),
  /** 喷涂 / 氟碳哑光（可指定颜色，如深灰、白色方通） */
  coated: () => ({
    map: TEX.coated,
    color: '#c8d0d8',
    roughness: 0.62,
    metalness: 0.4,
    envMapIntensity: 0.6,
    repeat: [2, 2],
  }),
  /** 黑色/深色钢件（螺钉、顶丝） */
  darkSteel: () => ({
    color: '#585f68',
    roughness: 0.46,
    metalness: 0.96,
    envMapIntensity: 0.7,
    roughnessMap: TEX.noise,
    repeat: [2, 2],
  }),
  /** 塑料堵头 / 胀管 / 线管 */
  plastic: () => ({
    color: '#2f3742',
    roughness: 0.58,
    metalness: 0.04,
    envMapIntensity: 0.35,
  }),
  /**
   * 型材激光打标 / 钢印贴花：只画字、压在母材表面上。
   * 字标贴图是白色的，所以 color 就是印记本身的颜色：
   * 木纹上用近黑（蚀刻感），黑漆龙骨上用浅灰（喷印）。
   */
  decal: () => ({
    map: TEX.brandMark,
    color: '#33241a',
    transparent: true,
    roughness: 0.52,
    metalness: 0,
    depthWrite: false,
  }),
  /** 板底模板喷字：漆在混凝土上，贴图为白字所以由 color 调色 */
  paintStencil: () => ({
    transparent: true,
    color: '#f4f6f8',
    roughness: 0.92,
    metalness: 0,
    depthWrite: false,
  }),
  /** 弹线 / 标高控制线：自发光，bloom 会把它做成霓虹线 */
  layout: () => ({
    color: new THREE.Color(COLORS.step).multiplyScalar(1.9).getStyle(),
    emissive: COLORS.step,
    emissiveIntensity: 1.5,
    roughness: 0.6,
    metalness: 0,
  }),
};

function fingerprint(overrides) {
  const keys = Object.keys(overrides).sort();
  return keys.map((k) => `${k}:${JSON.stringify(overrides[k])}`).join('|');
}

/**
 * 材质工厂：无外部依赖，纯本地缓存。
 */
export function createMaterialFactory() {
  const cache = new Map();

  return {
    /**
     * @param {string} partId 部件 id（隔离实例）
     * @param {keyof KINDS} kind 材料种类
     * @param {object} overrides 覆盖参数（颜色、粗糙度、贴图 repeat 等）
     */
    forPart(partId, kind, overrides = {}) {
      const key = `${partId}::${kind}::${fingerprint(overrides)}`;
      if (cache.has(key)) return cache.get(key);

      const template = KINDS[kind];
      if (!template) throw new Error(`未定义的材料种类：${kind}`);

      const base = { ...template(), ...overrides };
      const repeat = base.repeat;
      delete base.repeat;
      base.map = tiled(base.map, repeat);
      base.roughnessMap = tiled(base.roughnessMap, repeat);
      // 没贴图的种类不能传 undefined，否则 THREE 会报 parameter 警告
      if (!base.map) delete base.map;
      if (!base.roughnessMap) delete base.roughnessMap;

      const mat = new THREE.MeshStandardMaterial(base);
      mat.emissive = new THREE.Color(base.emissive || '#000000');
      mat.emissiveIntensity = base.emissiveIntensity ?? 0;

      // 基色的感知亮度（sRGB 0~1）：highlight.js 按它缩放染色，不然暗材质会被染色盖过本色
      const srgb = mat.color.clone().convertLinearToSRGB();

      // 记录初始状态，供高亮 / 透视 / 幽灵态恢复
      mat.userData.base = {
        color: mat.color.clone(),
        emissive: mat.emissive.clone(),
        emissiveIntensity: mat.emissiveIntensity,
        opacity: mat.opacity,
        transparent: mat.transparent,
        depthWrite: mat.depthWrite,
        lum: 0.299 * srgb.r + 0.587 * srgb.g + 0.114 * srgb.b,
      };

      cache.set(key, mat);
      return mat;
    },

    dispose() {
      cache.forEach((m) => m.dispose());
      cache.clear();
    },
  };
}
