/**
 * model/spec.js —— 吊顶节点尺寸规格
 * 约定：1 场景单位 = 100 mm；Y 轴向上（楼板在 +Y，吊顶完成面在 -Y）。
 * 演示模块取 1200 × 800 mm 的代表性节点：3 道齿形龙骨、每道 21 个燕尾槽、8 根方通、9 个吊点。
 * 受力链：楼板 → 膨胀螺栓 → 全牙吊杆 →（底板孔 + 槽内双螺母）→ U 形齿形龙骨 → T 槽台肩 → 方通回勾
 * 要点：齿不是单独零件，而是龙骨侧壁上冲出的燕尾 T 槽；回勾比颈宽，所以卡进去就退不出来。
 */

/** 模块范围 */
export const MODULE = {
  length: 12, // X 向 1200 mm（方通定尺方向）
  width: 8, // Z 向 800 mm
};

/** 竖向层次标高（Y，单位 100mm） */
export const LEVEL = {
  slabTop: 2.6,
  slabBottom: 1.4,
  anchorStub: 1.16, // 膨胀螺栓外露螺杆端
  hangerTop: 1.18, // 吊杆上端拧入膨胀螺栓的内螺纹端
  hangerBottom: -0.73, // 下端穿过底板孔，螺母坐在槽腔内，螺杆露出 2~3 扣
  upperNut: 1.1, // 上端连接螺母（锁在膨胀螺栓与吊杆的接头处）
  carrierTop: -0.45, // 齿形龙骨底板外表面（安装时朝上）
  carrierBottom: -0.75, // 侧壁自由端（T 槽的口在这里，开口朝下）
  baffleTop: -0.66, // 方通翼顶 / 回勾上表面
  baffleBottom: -1.66, // 完成面（方通底板外表面，朝下可见）
};

/** 钢筋混凝土楼板（演示块） */
export const SLAB = {
  thickness: LEVEL.slabTop - LEVEL.slabBottom,
  overhang: 1.6,
  realThicknessMm: 120,
};

/** 膨胀螺栓：加厚膨胀管 + 锥塞 + 螺杆 + 平垫 + 六角螺母 */
export const ANCHOR = {
  rodR: 0.04,
  sleeveR: 0.065,
  sleeveLen: 0.66,
  sleeveSlot: 0.02, // 管端开缝
  coneR: 0.078,
  plateR: 0.08,
  plateT: 0.03,
  nutR: 0.08,
  nutT: 0.065,
};

/** 全牙吊杆 + 螺母垫片（拧入膨胀螺栓）；尺寸按 M8 真实换算 */
export const HANGER = {
  rodR: 0.04,
  threadR: 0.046,
  nutR: 0.075, // 六角螺母外接圆半径（对边 13 mm）
  nutT: 0.065,
  washerR: 0.085,
  washerT: 0.02,
  // 9 个吊点：每道龙骨 3 根，落在底板孔位上（间距 250，端部 130）
  positions: [
    [-3.5, -2.5],
    [-3.5, 0],
    [-3.5, 2.5],
    [0, -2.5],
    [0, 0],
    [0, 2.5],
    [3.5, -2.5],
    [3.5, 0],
    [3.5, 2.5],
  ],
};

/** 吊杆紧固副：螺杆穿过龙骨底板孔，在槽腔内坐“平垫 + 双螺母” */
export const NUT_SET = {
  washer: 1,
  nut: 2, // 单螺母在微振动下会退扣，必须双螺母互锁
};

/**
 * 齿形龙骨：U 形槽 30×30×1.0，安装时开口朝下
 * 尺寸来自 DXF：keel_P22.5_500x30x30.dxf
 *   SECTION   W=30 t=1
 *   SIDE WALL L=500 H=30 PITCH=22.5（侧壁自由端一排燕尾 T 槽）
 *   BASE PLATE L=500 W=30 HANGER HOLE D=8 PITCH=250 OFFSET=125
 */
export const CARRIER = {
  width: 0.3, // 30 外宽
  height: LEVEL.carrierTop - LEVEL.carrierBottom, // 30
  t: 0.01, // 1.0 mm 料厚
  length: 7.6, // 演示长度（产品标准段 500，可接长）
  positions: [-3.5, 0, 3.5],
  /* 燕尾 T 槽：口 → 颈 → 腔（自侧壁自由端往底板方向量） */
  bandH: 0.2, // 实带高度（腔以内全为实心）
  chamberW: 0.185,
  chamberH: 0.03,
  neckW: 0.045,
  neckH: 0.045,
  mouthW: 0.095,
  mouthH: 0.025, // 自由端 45° 倒角段
  pitch: 0.225, // 槽间距 22.5
  phase: 0, // 相位：P22.5 与 50 宽方通天然对不齐（两翼中心距 48 = 2.13 倍齿距），
            // 取 0 让两侧翼板对称地各错开 1.5 mm 落在颈口，靠铝翼弹性顶入
  /* 底板吊杆孔 */
  holeR: 0.045, // φ9（螺杆 φ8 留调节余量）
  holePitch: 2.5,
  segment: 5.0, // 标准段 500
};

/**
 * U 型铝方通（饰面主体，开口朝上）
 * 截面尺寸来自 DXF：U_tube_50x100x2_hook6.dxf（W=50 / H=100 / t=2 / hook=6）
  * 要点：三边等厚 2 mm；回勾在翼顶端向『内』折 6 mm（不是向外），所以它卡进龙骨侧壁的燕尾槽。
 */
export const BAFFLE = {
  width: 0.5, // 50 mm（外沿）
  height: LEVEL.baffleTop - LEVEL.baffleBottom, // 100 mm
  thickness: 0.02, // 2 mm —— DXF 实测真实壁厚
  hook: 0.06, // 6 mm —— 翼顶端向内 90° 回勾
  span: 0.9, // 间距 90 mm = 齿距 22.5 的 4 倍（必须是整数倍，否则回勾对不上槽）
  count: 8,
  firstZ: -3.15,
  length: 11.6, // 定尺：两端始终到墙边（收边条与它在现场的关系不在本模型内表达）
  bottomY: LEVEL.baffleBottom, // 底板外表面 = 完成面
  splitZ: -0.45, // 演示超长接长的那一根（必须是实际排布位）
  splitX: 1.0, // 接缝中心 x
  shortRows: [-3.15, 3.15], // 遇灯槽/窗帘盒不到墙的两根，端头露明配堵头
  shortLength: 9.6,
  shortEndX: 3.8,
};

/** 截面派生尺寸：全部由上面的 DXF 实测值推导，模型与龙骨燕尾槽共用同一来源 */
export const SECTION = {
  halfW: BAFFLE.width / 2, // 0.250 翼外沿
  innerFace: BAFFLE.width / 2 - BAFFLE.thickness, // 0.230 翼内壁
  hookTip: BAFFLE.width / 2 - BAFFLE.thickness - BAFFLE.hook, // 0.170 回勾内端
  topV: BAFFLE.height, // 1.000 翼顶
  hookUnderV: BAFFLE.height - BAFFLE.thickness, // 0.980 回勾下表面
  channelGap: 2 * (BAFFLE.width / 2 - BAFFLE.thickness - BAFFLE.hook), // 0.340 两回勾之间净空
};

/** 方通接长连接件（内置套筒，贴在底板内侧面） */
export const CONNECTOR = {
  width: 0.42, // 小于两翼内壁间距 0.46
  height: 0.16,
  length: 0.9,
  gap: 0.12, // 两根方通端头留缝 12 mm
};

/** 端头堵头：插在两翼内壁之间，顶到回勾下表面为止，不与向内回勾发生干涉 */
export const END_CAP = {
  width: SECTION.innerFace * 2 - 0.006,
  height: SECTION.hookUnderV - BAFFLE.thickness - 0.004, // 到回勾下方留 0.4 mm 间隙
  thickness: 0.05,
};

/** 标高控制线 / 分档线（可视化辅助） */
export const LAYOUT = {
  levelY: LEVEL.baffleBottom - 0.02,
  wallX: 6.15,
  wallZ: 4.15,
  dashLen: 0.18,
  dashGap: 0.12,
  lineT: 0.016,
};

/**
 * 厂家标识（单位 100 mm）：真实工程里型材与端盖都会带厂标。
 * 位置选在“不会装错也不会影响锁合”的地方，尺寸取现场常见值；
 * 朝下的完成面不放标识（理由见 parts/finish.js），品牌位开在侧翼、堵头、龙骨与板底喷字上。
 */
export const BRAND_MARK = {
  /** 堵头端面的小标 */
  cap: { length: 0.32, width: 0.08 },
  /**
   * 两翼外露面（就是从楼下透过 40 mm 缝看到的那两张竖直面）上的印标。
   * 演示样板段只有 1160 mm 长，所以步距取半段 = 每面两枚；
   * rise 是字标中心到完成面的距离，保持在翼板下半段，不碰到顶部回勾与龙骨。
   */
  leg: { length: 1.5, width: 0.4, pitch: 5.8, rise: 0.32, lift: 0.002 },
  /**
   * 龙骨侧壁外表面的辊压/喷印钢印。
   * 齿形龙骨总共只有 30 mm 高，而侧壁能落字的实心带（燕尾腔以上到底板）只有 bandH = 20 mm，
   * 所以这里已经是带内的极限尺寸：平面 76 × 19 mm（适配后墨迹约 68 × 13 mm），
   * 居中在 -0.55，上下面各留 0.5 mm 不压底板边与燕尾腔口。
   * 要再放大只能多开几枚（zs 已改为三处），不能单枚开大。
   */
  carrier: { length: 0.76, width: 0.19, zs: [-2.7, 0, 2.7], lift: 0.002 },
};

/**
 * 板底样板段喷字（600 × 170 mm）。
 * 位置挑在楼板底面靠外那一圈“吊顶覆盖不到的空白”上：
 * 方通排只到 z = ±3.4，而板边到 ±5.6，那一条不会被完成面挡住；
 * 也不能压到吊点十字线（它们在 z = ±2.5，臂长 0.5）。
 */
export const SLAB_STENCIL = {
  width: 6.0,
  height: 1.7,
  x: -1.0,
  z: 4.4,
  lift: 0.003,
};
