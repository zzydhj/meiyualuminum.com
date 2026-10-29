/**
 * data/parts.js —— 部件语义数据（唯一数据源）
 * 每项的 id 必须与 model/builders.js 中的构造函数一一对应。
 *
 * 字段说明：
 *   layer        所属层次（LAYERS 的 key），用于图例、颜色、卡片色条
 *   step         所属工序序号（对应 data/steps.js），驱动工序演示
 *   explode      爆炸位移（单位 100 mm）——外立面沿进深 +Z 逐层向外拉出
 *   installFrom  未安装时相对就位位置的偏移，即"从哪个方向装进来"（从室外侧 +Z 送入）
 *   labelOffset  标注卡片相对锚点的屏幕偏移（像素）
 *   fixed        true 表示基准件，不参与爆炸与安装动画
 *
 * 体系：铝单板幕墙外立面（水泥墙基层）——水泥墙 →（锚栓）→ 网状钢结构（方管网格，网格=板模数、管位对挂耳）
 *   → 挂耳（每板四边各 2 个、焊在板上，自攻螺丝拧进钢管）→ 铝单板（一块块挂）→ 成组后打密封胶。
 * 本文件为英文版：所有面向用户的文案为英文。尺寸为行业通用占位，待剖面图校准。
 */

export const LAYERS = {
  base: { name: 'Substrate & setting out', color: '#6b7f92' },
  subframe: { name: 'Steel grid subframe', color: '#0b6fb8' },
  finish: { name: 'Panels & joints', color: '#e8730c' },
};

export const PARTS = [
  {
    id: 'wall',
    name: 'Concrete Wall (Substrate)',
    layer: 'base',
    step: 1,
    fixed: true,
    explode: [0, 0, 0],
    installFrom: [0, 0, 0],
    labelOffset: [-215, -150],
    keySpec: 'Reinforced concrete wall · anchor base',
    params: [
      { k: 'Substrate', v: 'Reinforced concrete / cement wall (the building face)' },
      { k: 'Modelled thickness', v: '200 mm (true scale)' },
      { k: 'Face', v: 'Flat, sound, free of laitance and loose render at the anchor points' },
      { k: 'Anchor value', v: 'Solid concrete assumed for expansion anchors; cracked concrete or thin sections need chemical anchors / through-bolts' },
      { k: 'Check first', v: 'Survey the as-built flatness and plumb; locate services before drilling' },
      { k: 'Role', v: 'The only load-bearing substrate — wind and self weight all go through the anchors into it' },
    ],
    structure: ['Concrete / cement wall', 'Anchor fixing zone', 'Embedded services (must be avoided)'],
    install: 'Confirm the wall can take anchors (solid, ≥ the minimum edge and base thickness). Detect and mark rebar and services; an anchor on a hollow spot or a conduit means relocating the hole.',
    check: 'Face sound and flat within the anchor adjustment range; no drilling into services; anchor pull-out sampling passed.',
    desc: 'On a concrete wall façade the whole grid hangs off anchors into the masonry. Whether the wall is solid, and where the rebar and pipes run, decides the anchor type and positions — checked before any hole is drilled.',
  },
  {
    id: 'layout-line',
    name: 'Setting-Out Lines',
    layer: 'base',
    step: 1,
    explode: [0, 0, 0.3],
    installFrom: [0, 0, 0.6],
    labelOffset: [-200, 120],
    keySpec: 'Panel module grid · tube centre lines',
    params: [
      { k: 'Instruments', v: 'Laser level / plumb laser / steel tape / chalk line' },
      { k: 'Datum', v: 'Vertical and horizontal module lines snapped on the wall, tied to the building grid' },
      { k: 'Tube lines', v: 'Marked on the panel joint centreline — this is also where the grid tubes run' },
      { k: 'Storey height', v: 'Transferred from the +500 mm datum; cumulative height checked per floor' },
      { k: 'Tolerance', v: 'Setting-out deviation ≤ 2 mm; joint width tolerance ±2 mm' },
    ],
    structure: ['Vertical joint / tube centrelines', 'Horizontal joint / tube centrelines', 'Storey and face-datum references'],
    install: 'Establish the face datum and the module grid on the wall, then snap every joint centreline — the grid tubes will be fixed on these same lines. Confirm the module leaves no narrow cut panel at the edges.',
    check: 'Lines crisp, square and re-checkable; grid matches the setting-out drawing; no edge panel narrower than 1/3 of a full panel.',
    desc: 'Because the grid tubes and the panel ears share the same lines, the setting-out does double duty: it fixes where the anchors go and guarantees the ears will land on a tube. Get it square here and the joints stay straight to the top.',
  },
  {
    id: 'anchor',
    name: 'Anchor Fixing (Grid to Wall)',
    layer: 'subframe',
    step: 2,
    explode: [0, 0, 1.2],
    installFrom: [0, 0, 1.6],
    labelOffset: [180, -120],
    keySpec: 'Expansion anchor bolt fixing the grid tube to the wall',
    params: [
      { k: 'Type', v: 'Single expansion anchor bolt — hex head + threaded rod + expansion sleeve; no base plate or standoff block' },
      { k: 'Reads as', v: 'A bare bolt going straight through the tube back into the concrete, so it is obvious the grid is bolted, not floating' },
      { k: 'Fixing', v: 'M10 expansion anchor drilled through the tube back wall into the concrete (chemical anchor where edge distance is short)' },
      { k: 'Positions', v: 'At the grid crossings on the module lines (here 3 × 3 = 9 fixing points)' },
      { k: 'Bearing', v: 'Hex head bears on the tube back; the sleeve expands and bites the hole wall when tightened' },
      { k: 'Isolation', v: 'Insulating pad where aluminium meets steel to stop bimetallic corrosion' },
      { k: 'Corrosion', v: 'Galvanised or primed; touch-up after drilling' },
    ],
    structure: ['Hex head', 'Threaded anchor rod', 'Expansion sleeve in the wall', 'Drilled hole in the concrete wall'],
    install: 'Drill on the marked crossings through the tube back into the wall, clean the hole, insert the expansion anchor and tighten — the sleeve expands and bites the hole wall, clamping the tube to the concrete. Set each anchor flush so the tube sits true on the datum plane.',
    check: 'No movement by hand; anchor embedment as designed; every crossing pinned; head seated square on the tube back.',
    desc: 'The grid is carried directly on expansion anchors through its own back wall into the concrete — one visible bolt per crossing, nothing encased. This is also where the as-built wall tolerance is taken up, so the anchors must be set true and left tight.',
  },
  {
    id: 'steel-grid',
    name: 'Steel Grid Subframe',
    layer: 'subframe',
    step: 2,
    explode: [0, 0, 2.2],
    installFrom: [0, 0, 2.4],
    labelOffset: [-215, -20],
    keySpec: 'Mesh of RHS 40×40×3 tubes on the module',
    params: [
      { k: 'Section', v: 'Rectangular hollow section 40 × 40 × 3 mm, galvanised' },
      { k: 'Layout', v: 'Vertical + horizontal tubes forming a mesh; spacing = the panel module' },
      { k: 'Tube positions', v: 'On the panel joint / edge centrelines (here x, y = ±10.075 and 0) so every panel ear lands on a tube' },
      { k: 'Fixing', v: 'Bolted / welded to the anchor cleats; joints rigid' },
      { k: 'Plumb / straightness', v: '≤ 2 mm per 2 m; face on the datum plane' },
      { k: 'Corrosion', v: 'Galvanised; cuts and holes touched up with zinc-rich paint' },
    ],
    structure: ['Vertical RHS tubes', 'Horizontal RHS tubes', 'Bolted / welded grid crossings', 'Insulating pad behind the panel ear'],
    install: 'Erect the tubes on the anchor cleats along the joint centrelines, the mesh matching the panel grid exactly. Plumb and level each run, true the face to the datum, then lock the crossings. The tube positions must line up with the panel ear positions.',
    check: 'Mesh on the module and on the datum plane; face straight with no wave; crossings rigid; every ear position has a tube behind it.',
    desc: 'This is the one layer that marries load-bearing and setting-out: it carries the façade back to the wall through the anchors, and its tube grid is exactly the panel grid, so the ears always find a tube to screw into.',
  },
  // 4 块铝单板逐块挂装：每块 = 先放板（工序 2n+1）、再 8 颗螺丝拧入（工序 2n+2）；buildPanel/buildPanelScrews 按 kit.id 取对应板心
  ...[1, 2, 3, 4].flatMap((n) => [
    {
      id: `panel-${n}`,
      name: `Aluminium Veneer Panel ${n}`,
      layer: 'finish',
      step: 2 * n + 1,
      explode: [0, 0, 4.2],
      installFrom: [0, 0, 3.6],
      labelOffset: [[-235, -130], [215, -130], [-235, 140], [215, 140]][n - 1],
      keySpec: '3.0 mm formed panel 1000×1000 · hung one by one',
      params: [
        { k: 'Panel', v: 'Formed aluminium veneer, 3.0 mm skin (2.5 / 3.0 mm common)' },
        { k: 'Module', v: '1000 × 1000 mm visible face in this demo; sizes vary by design' },
        { k: 'Construction', v: 'Face sheet with four 30 mm return edges, back stiffener ribs, and 8 hanging ears (2 per edge) bent integral to the flanges — a horizontal tab reaching flat onto the tube behind, hole drilled' },
        { k: 'Ear layout', v: 'Ears are staggered panel-to-panel on the shared tubes (checkerboard phase): each panel’s ears sit in from the corner while its neighbours sit near the corner, so two panels never overlap on one tube and every screw hole stays distinct' },
        { k: 'Alloy', v: 'AA3003 / 5005 aluminium' },
        { k: 'Finish', v: 'PVDF fluorocarbon / powder coating, matte solid colour; outside only' },
        { k: 'How it fixes', v: `Place this panel onto the grid so its 8 integral ears lie flat on the tubes; its 8 self-tapping screws are then driven in the next step (this is panel ${n} of 4). No face fixings` },
        { k: 'Demountable', v: 'Single panel removable by releasing its 8 ear screws — no destruction' },
        { k: 'Flatness', v: '≤ 1/300 diagonal; no oil-canning within the agreed limit' },
      ],
      structure: ['Face sheet (painted, the visible plane)', 'Four folded return edges', 'Back stiffener ribs (bare aluminium)', 'Eight hanging ears bent integral to the edges (horizontal tab, flat on the tube)', 'Factory protection film'],
      install: `From a fixed corner, place panel ${n} against the grid so its 8 integral ears sit flat on the tubes; its 8 screws are driven in the following step. Adjust level, joint width and face flush, then move to the next panel. Keep the protection film on until handover.`,
      check: `Panel ${n} seated with all 8 ears flat on the tubes; joints even within ±2 mm; face flush and flat; no scratches or colour difference.`,
      desc: 'The ears are bent from the same sheet as the panel — one piece, on site you only place it and then screw. Panels are hung and screwed one at a time so each is levelled and jointed against the previous one. Nothing is screwed through the visible face, so the finish stays clean and any single panel can come back off.',
    },
    {
      id: `panel-${n}-screws`,
      name: `Panel ${n} Ear Screws`,
      layer: 'finish',
      step: 2 * n + 2,
      explode: [0, 0, 4.7],
      installFrom: [0, 0, 1.6],
      labelOffset: [[-150, -60], [150, -60], [-150, 70], [150, 70]][n - 1],
      keySpec: '8 self-tapping screws driving panel N into the tubes',
      params: [
        { k: 'Quantity', v: '8 screws — one through each of the panel’s 8 integral ears' },
        { k: 'Type', v: 'Self-tapping / drill-point screw to steel, stainless or coated' },
        { k: 'Path', v: 'Through the ear hole, perpendicular to the panel face, into the steel tube behind' },
        { k: 'Why separate', v: `Shown as its own step so it reads clearly that the panel is held by screws driven into the grid — panel ${n} is placed first, then these 8 go in` },
        { k: 'Torque', v: 'Seated, not over-driven; do not distort the ear tab' },
      ],
      structure: ['Eight screws', 'Eight heads bearing on the ear tabs'],
      install: `With panel ${n} held on the grid, drive 8 self-tapping screws through the ear holes into the tubes behind — one per ear. This is what actually fixes the panel to the subframe.`,
      check: `All 8 screws driven and seated; panel does not rock; ear tabs flat on the tubes; face still flush with the neighbours.`,
      desc: 'Splitting the screws into their own step makes the fixing obvious: the panel rests on its integral ears, then eight screws driven into the steel tubes lock it. Nothing goes through the visible face.',
    },
  ]),
  {
    id: 'joint-sealant',
    name: 'Sealed Joint',
    layer: 'finish',
    step: 11,
    explode: [0, 0, 5.0],
    installFrom: [0, 0, 3.0],
    labelOffset: [160, 120],
    keySpec: '15 mm sealed joint · backer rod + weatherseal',
    params: [
      { k: 'When', v: 'After the panels of the group are hung, aligned and checked (not panel by panel)' },
      { k: 'Joint width', v: '15 mm nominal (design by movement class)' },
      { k: 'Backing', v: 'Closed-cell backer rod sets the sealant depth (≈ 1/2 width)' },
      { k: 'Sealant', v: 'Neutral-cure silicone weatherseal, low modulus' },
      { k: 'Depth', v: '≈ 6–8 mm; width:depth about 2:1' },
      { k: 'Prep', v: 'Surfaces clean and dry; mask both edges; no three-sided bond' },
    ],
    structure: ['Backer rod', 'Silicone weatherseal bead', 'Clean tooled face'],
    install: 'Once the group of panels is hung and the joints are even, clean them, set the backer rod to depth, mask both edges, apply and tool the sealant to a concave bead, and remove the masking while still wet.',
    check: 'Bead continuous, straight and evenly tooled; no voids, no three-sided bond; no smearing on the panel face.',
    desc: 'Sealing is done after the panels are set as a group, so the joint width is already even and the bead is straight. The sealant bonds to the two panel edges only and stretches with them — it is both the weather line and the visual grid of the façade.',
  },
];

export const PART_MAP = Object.fromEntries(PARTS.map((p) => [p.id, p]));

/** 层次图例顺序 */
export const LAYER_ORDER = Object.keys(LAYERS);

export function layerOf(partId) {
  const p = PART_MAP[partId];
  return p ? LAYERS[p.layer] : LAYERS.base;
}

export function partsOfStep(step) {
  return PARTS.filter((p) => p.step === step);
}
