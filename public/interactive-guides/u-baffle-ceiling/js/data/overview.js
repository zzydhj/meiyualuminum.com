/**
 * data/overview.js —— 全局概览数据：系统参数、执行标准、操作引导
 * 本文件为英文版：所有面向用户的文案为英文，数值与中文版完全一致。
 */

export const SYSTEM = {
  title: 'U-Shaped Aluminum Square Tube (baffle) exposed ceiling · node data',
  params: [
    { k: 'Demo module', v: '1200 × 800 mm (1 scene unit = 100 mm)' },
    { k: 'System', v: 'Single toothed carrier + clip-in baffles (no screws)' },
    { k: 'Finish', v: 'U-channel aluminium baffle 50×100×1.0, wood grain, opening upward, 90 mm pitch, 8 pieces' },
    { k: 'Lip at the flange tip', v: 'Folded 90° inwards, 6 mm, clipped into the dovetail slot in the carrier wall' },
    { k: 'Toothed carrier', v: 'U channel 30×30×1.0, black powder coating, 3 runs across the short span, opening downward' },
    { k: 'Dovetail slot', v: 'Punched in the free edge: mouth 9.5 / neck 4.5 / chamber 18.5; 22.5 pitch runs denser than the baffles (about half stay empty)' },
    { k: 'Suspension', v: '9 × φ8 threaded rods + holes in the top plate + washer and double nut inside the channel' },
    { k: 'Substrate fixing', v: 'M8×80 expansion anchor with heavy-duty sleeve, drilled upward from the soffit, embedment ≥ 60 mm' },
    { k: 'Ceiling void', v: 'Slab soffit → finished surface 300 mm' },
    { k: 'Weight', v: 'About 1.5 – 3.5 kg/m² including carrier and hangers' },
    { k: 'Camber', v: '1/200 – 1/300 of the short span when the span ≥ 4 m' },
  ],
  tolerance: [
    'Ceiling level within 5 mm (5 m line)',
    'Surface flatness within 2 mm (2 m straight edge + feeler gauge)',
    'Baffle spacing within 1 mm, alignment within 2 mm',
    'Joint step within 0.5 mm, end set-back within 0.5 mm',
    'Rod plumb within 3 mm/m, carrier spacing within 3 mm',
    'Anchor pull-out sampling passed, no loosening or pull-out',
    'Two baffles sampled at random must come down and be refitted individually',
  ],
  standards: [
    'GB 50210 Standard for quality acceptance of building decoration',
    'GB/T 11981 Metal furring studs and profiles for building',
    'GB 5237 series Aluminium alloys for building profiles',
    'GB 50300 Unified standard for acceptance of construction quality',
  ],
  disclaimer:
    'This is a construction visualisation demo: the model is a representative node built at 1:100 (1 scene unit = 100 mm). The baffle outline and its 6 mm inward lip follow the measured DXF U_tube_50x100x2_hook6 (W50 / H100); the wall gauge drawn here is 1.0 mm, our usual roll-formed thickness for this format (published range 0.6 / 0.8 / 1.0 / 1.2 mm), not the 2.0 mm in that filename, which is an extruded closed-tube gauge. The toothed carrier comes from keel_P22.5_500x30x30 (U channel 30×30×1.0 / dovetail slot pitch 22.5 / hanger holes φ8 @ 250). Anchor pull-out values, camber ratios and the like are stated as common industry experience ranges; an actual project must follow the design documents, structural verification and the current valid edition of the codes. Document by MEIYU Aluminum Co., Ltd. — meiyualuminum.com.',
};

export const GUIDE = [
  {
    title: 'An installation guide that moves',
    desc: 'Eight build-up steps on the left, a true-scale ceiling node in the middle. Click a step or press → to assemble it stage by stage: each part flies in from the direction it is actually installed from, and parts not yet fitted stay as ghost outlines so the layering reads clearly.',
  },
  {
    title: 'The load path of this system',
    desc: 'Concrete slab → expansion anchor → threaded hanger rod → (hole in the top plate + double nut inside the channel) → carrier top plate → shoulder of the dovetail slot → U-channel baffle. There is only one carrier layer: it carries the load and sets the position, and the slot pitch of the carrier is the spacing of the baffles.',
  },
  {
    title: 'The baffles are clipped in, not screwed',
    desc: 'Each baffle opens upward with a 6 mm lip folded inwards at the top of both legs. The free edge of the carrier wall carries a row of dovetail slots punched at 22.5 mm (mouth 9.5, neck 4.5, chamber 18.5). Lift the baffle and the lip squeezes past the neck into the chamber; because the lip is wider than the neck it hangs on the shoulder and will not come back out. To remove one, push it down and slide it sideways.',
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
