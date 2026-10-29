/**
 * data/overview.js —— 全局概览数据：系统参数、执行标准、操作引导
 * 本文件为英文版：所有面向用户的文案为英文。
 * 体系：铝单板幕墙外立面（水泥墙基层）——水泥墙 → 锚固网状钢结构 → 挂耳钉挂铝单板 → 成组后打密封胶。
 * 尺寸为行业通用占位，待用户提供铝单板边口 / 挂耳 / 钢网格剖面图后据以校准。
 */

export const SYSTEM = {
  title: 'Aluminium veneer rainscreen façade · node data',
  params: [
    { k: 'Demo node', v: '2 × 2 panel patch, 1000 × 1000 mm each (1 scene unit = 100 mm)' },
    { k: 'System', v: 'Concrete-wall rainscreen: steel tube grid anchored to the wall, aluminium veneer panels screwed on their ears, sealed joints' },
    { k: 'Substrate', v: 'Reinforced concrete / cement wall (the building face)' },
    { k: 'Panel', v: 'Aluminium veneer 3.0 mm formed panel, four 30 mm return edges, back stiffeners, PVDF / powder matte solid colour' },
    { k: 'Hanging ear', v: 'Ear bent integral from the same sheet as the panel flange, 2 per edge (8 per panel), a horizontal tab flat on the grid tube; then 8 screws through the ear holes into the tube — no face fixings' },
    { k: 'Steel grid', v: 'Mesh of RHS 40×40×3 galvanised tubes on the panel module; a tube sits behind every ear' },
    { k: 'Anchor', v: 'One expansion anchor bolt per grid crossing (hex head + rod + sleeve) through the tube back into the wall — no standoff block; insulating pad at the aluminium/steel interface' },
    { k: 'Joint', v: 'Sealed joint 15 mm, backer rod + neutral-cure silicone weatherseal — sealed after the panel group is hung' },
    { k: 'Build-up depth', v: 'Finish face → wall face ≈ 80 mm (grid sits in the shallow cavity behind the panel)' },
    { k: 'Weight', v: 'About 6 – 12 kg/m² including subframe (panel alone ≈ 8 kg/m² at 3.0 mm)' },
  ],
  tolerance: [
    'Façade face plumb and line within 5 mm over the node',
    'Joint width within ±2 mm, evenly continuous',
    'Panel face flatness within 2 mm on a 2 m straight edge; no oil-canning within the agreed limit',
    'Adjacent panel flush within 1 mm',
    'Anchor / cleat coplanarity within 2 mm along the run',
    'All ear screws and anchors tightened and marked',
    'Two random panels must come down and be refitted individually without damage',
  ],
  standards: [
    'GB 50210 Standard for quality acceptance of building decoration',
    'JGJ 133 Technical code for metal and stone curtain wall engineering',
    'GB/T 23443 Aluminium alloy veneer panels for building',
    'GB/T 21086 Testing method for building curtain walls',
    'GB 5237 series Aluminium alloys for building profiles',
  ],
  disclaimer:
    'This is a construction visualisation demo: the model is a representative façade node built at 1:100 (1 scene unit = 100 mm). Sections and dimensions follow common industry practice for an aluminium veneer rainscreen on a galvanised steel tube grid anchored to a concrete wall (3.0 mm formed panel, 30 mm returns, RHS 40×40×3 tube mesh on the panel module, 8 aluminium ears per panel self-tapped to the tubes, 15 mm sealed joint) and are placeholders to be calibrated against the project section drawings. Wind loads, anchor/bolt values, thermal movement and sealant class must follow the design documents, structural verification and the current valid edition of the codes. Document by MEIYU Aluminum Co., Ltd. — meiyualuminum.com.',
};

export const GUIDE = [
  {
    title: 'An installation guide that moves',
    desc: 'Twelve build-up steps on the left, a true-scale façade node in the middle. Click a step or press → to assemble it stage by stage: each part flies in from the direction it is actually installed from, and parts not yet fitted stay as ghost outlines so the layering reads clearly.',
  },
  {
    title: 'The load path of this system',
    desc: 'Concrete wall → anchor cleats → steel tube grid (a mesh on the panel module) → panel hanging ears (8 per panel) → aluminium veneer panels, closed by the sealed joints. Wind and self weight travel from the panel, through the ear screws and the tube grid, to the anchors, and into the wall.',
  },
  {
    title: 'Grid on the wall first, then hang the panels',
    desc: 'The steel tube grid is anchored to the wall and trued to the module first — that is where the as-built tolerance is taken up, and its tubes are placed exactly where the panel ears land. Each panel already has its eight ears bent on as one piece. On site the two actions are shown as separate steps: place the panel so its ears sit flat on the tubes, then drive 8 screws through the ear holes into the tubes — panel by panel. Nothing is screwed through the visible face, so any single panel can come back off.',
  },
  {
    title: 'Seal after the group',
    desc: 'Panels go on one by one; the joints are sealed only after the group (here four panels) is hung and the joint widths are even — backer rod to depth, then a tooled silicone weatherseal bead that bonds to the two panel edges.',
  },
  {
    title: 'Free orbit plus two modes',
    desc: 'Drag to orbit, scroll to zoom, right-drag to pan. "Front" shows the finished face, "Side" the layer stack in depth, "Section" the build-up from wall to panel. Switch to Exploded View to pull the layers out along the depth, or press Space to play the whole build-up.',
  },
];

/** 键盘快捷键（同时用于底部脚注渲染，与 ui/hotkeys.js 的绑定保持一致） */
export const HOTKEYS = [
  { keys: ['←', '→'], desc: 'Previous / next step' },
  { keys: ['1~9'], desc: 'Jump to step N' },
  { keys: ['Space'], desc: 'Auto play' },
  { keys: ['E'], desc: 'Install all / explode all' },
  { keys: ['L'], desc: 'Toggle labels' },
  { keys: ['G'], desc: 'Toggle ghost parts' },
  { keys: ['M'], desc: 'Toggle grid' },
  { keys: ['F'], desc: 'Reframe' },
  { keys: ['R'], desc: 'Reset steps' },
  { keys: ['Esc'], desc: 'Clear selection' },
];
