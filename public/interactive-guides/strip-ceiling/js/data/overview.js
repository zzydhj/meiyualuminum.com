/**
 * data/overview.js —— 全局概览数据：系统参数、执行标准、操作引导
 * 本文件为英文版：所有面向用户的文案为英文。
 * 饰面截面依据 docs/sections/strip-ceiling/smooth-arc-clipin-profile-generator.html（全平滑弧边卡扣式：底板 + R 角 + 直立弧边 + 顶缘向内回勾）。
 */

export const SYSTEM = {
  title: 'Aluminium Strip Panel clip-in ceiling · node data',
  params: [
    { k: 'Demo module', v: '1200 × 800 mm (1 scene unit = 100 mm)' },
    { k: 'System', v: 'Single toothed carrier + clip-in strip panels (no screws)' },
    { k: 'Finish', v: 'Aluminium strip panel 86 × 10 × 0.8, smooth-arc clip-in edge, wood grain, laid at a 90 mm module with a fine joint, 8 pieces' },
    { k: 'Clip-in edge', v: 'Both top edges stand up as a smooth arc and curl inward into a ~4.5 mm fishhook (tip flares back); the hook snaps through the carrier wall dovetail mouth and hangs on the shoulder' },
    { k: 'Toothed carrier', v: 'U channel 30×30×1.0, black powder coating, 3 runs across the short span, opening downward' },
    { k: 'Dovetail slot', v: 'Punched in the free edge: mouth 9.5 / neck 4.5 / chamber 18.5; the strip panel edge hook snaps through it and the same slot also takes hold-down clips' },
    { k: 'Suspension', v: '9 × φ8 threaded rods + holes in the top plate + washer and double nut inside the channel' },
    { k: 'Substrate fixing', v: 'M8×80 expansion anchor with heavy-duty sleeve, drilled upward from the soffit, embedment ≥ 60 mm' },
    { k: 'Ceiling void', v: 'Slab soffit → finished surface 300 mm' },
    { k: 'Weight', v: 'About 1.5 – 3.5 kg/m² including carrier and hangers' },
    { k: 'Camber', v: '1/200 – 1/300 of the short span when the span ≥ 4 m' },
  ],
  tolerance: [
    'Ceiling level within 5 mm (5 m line)',
    'Surface flatness within 2 mm (2 m straight edge + feeler gauge)',
    'Flush joints open within 0.5 mm, alignment within 2 mm',
    'Joint step within 0.5 mm, trim set-back within 0.5 mm',
    'Rod plumb within 3 mm/m, carrier spacing within 3 mm',
    'Anchor pull-out sampling passed, no loosening or pull-out',
    'Two strip panels sampled at random must come down and be refitted individually',
  ],
  standards: [
    'GB 50210 Standard for quality acceptance of building decoration',
    'GB/T 11981 Metal furring studs and profiles for building',
    'GB 5237 series Aluminium alloys for building profiles',
    'GB 50300 Unified standard for acceptance of construction quality',
  ],
  disclaimer:
    'This is a construction visualisation demo: the model is a representative node built at 1:100 (1 scene unit = 100 mm). The strip panel section follows the smooth-arc clip-in generator (base + R corner + upright arc edge + ~4.5 mm inward fishhook); the toothed carrier comes from measured DXF keel_P22.5_500x30x30 (U channel 30×30×1.0 / dovetail slot pitch 22.5 / hanger holes φ8 @ 250). Anchor pull-out values, camber ratios and the like are stated as common industry experience ranges; an actual project must follow the design documents, structural verification and the current valid edition of the codes. Document by MEIYU Aluminum Co., Ltd. — meiyualuminum.com.',
};

export const GUIDE = [
  {
    title: 'An installation guide that moves',
    desc: 'Eight build-up steps on the left, a true-scale ceiling node in the middle. Click a step or press → to assemble it stage by stage: each part flies in from the direction it is actually installed from, and parts not yet fitted stay as ghost outlines so the layering reads clearly.',
  },
  {
    title: 'The load path of this system',
    desc: 'Concrete slab → expansion anchor → threaded hanger rod → (hole in the top plate + double nut inside the channel) → carrier top plate → side-wall dovetail shoulders → the strip panel edge hooks. There is only one carrier layer: it carries the load and sets the plane of the finished surface.',
  },
  {
    title: 'The panels are clipped in, not screwed',
    desc: 'Each panel is a smooth-arc clip-in channel: a flat face with rounded R corners, two upright arc edges and a ~4.5 mm fishhook (tip flaring back) at the top of each edge. Tilt one edge so its hook passes the carrier wall dovetail mouth, lay the panel down so the other edge snaps in, then press along the run until both hooks click past the neck and hang on the shoulders — flush with the slot mouths. To remove one, push it sideways along the run so the hooks clear the mouth, then tilt it down.',
  },
  {
    title: 'Free orbit plus two modes',
    desc: 'Drag to orbit, scroll to zoom, right-drag to pan. "Upward" shows the finished surface, "Downward" the carrier and its slot layout, "Side" the lip engaging the slot. Switch to Exploded View to study the layering, or press Space to play the whole build-up.',
  },
];

/** 键盘快捷键（同时用于底部脚注渲染，与 ui/hotkeys.js 的绑定保持一致） */
export const HOTKEYS = [
  { keys: ['←', '→'], desc: 'Previous / next step' },
  { keys: ['1~8'], desc: 'Jump to step N' },
  { keys: ['Space'], desc: 'Auto play' },
  { keys: ['E'], desc: 'Install all / explode all' },
  { keys: ['L'], desc: 'Toggle labels' },
  { keys: ['G'], desc: 'Toggle ghost parts' },
  { keys: ['M'], desc: 'Toggle grid' },
  { keys: ['F'], desc: 'Reframe' },
  { keys: ['R'], desc: 'Reset steps' },
  { keys: ['Esc'], desc: 'Clear selection' },
];
