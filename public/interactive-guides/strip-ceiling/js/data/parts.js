/**
 * data/parts.js —— 部件语义数据（唯一数据源）
 * 每项的 id 必须与 model/builders.js 中的构造函数一一对应。
 *
 * 字段说明：
 *   layer        所属层次（LAYERS 的 key），用于图例、颜色、卡片色条
 *   step         所属工序序号（对应 data/steps.js），驱动工序演示
 *   explode      爆炸位移（单位 100 mm）
 *   installFrom  未安装时相对就位位置的偏移，即"从哪个方向装进来"
 *   labelOffset  标注卡片相对锚点的屏幕偏移（像素）
 *   fixed        true 表示基准件，不参与爆炸与安装动画
 *
 * 体系：齿形龙骨（U 形槽 30×30×1.0，侧壁一排燕尾 T 槽）+ 铝条扣板（全平滑弧边卡扣式，板缘向内回勾卡进龙骨侧壁燕尾槽）
 * 本文件为英文版：所有面向用户的文案为英文。
 * 截面图纸：docs/sections/strip-ceiling/smooth-arc-clipin-profile-generator.html（全平滑弧边卡扣式，饰面件形状的来源）。
 * 饰面只有条扣板一件：全部通长统一长度，两端到墙收口，现场无接长、无堵头，故不设演示附件。
 */

export const LAYERS = {
  base: { name: 'Substrate & setting out', color: '#6b7f92' },
  suspension: { name: 'Suspension', color: '#0b6fb8' },
  frame: { name: 'Toothed carrier', color: '#6b4fd8' },
  finish: { name: 'Finish & accessories', color: '#e8730c' },
};

export const PARTS = [
  {
    id: 'slab',
    name: 'Reinforced Concrete Slab',
    layer: 'base',
    step: 1,
    fixed: true,
    explode: [0, 0, 0],
    installFrom: [0, 0, 0],
    labelOffset: [-195, -78],
    keySpec: 'Substrate · cast C20–C30 slab',
    params: [
      { k: 'Substrate', v: 'Cast in situ reinforced concrete slab' },
      { k: 'Strength class', v: 'C20 – C30' },
      { k: 'Modelled thickness', v: '120 mm (true scale)' },
      { k: 'Anchor zone', v: 'No hollow spots or cracking; avoid the main reinforcement' },
      { k: 'Hole depth', v: 'Anchor embedment depth + 10 mm' },
      { k: 'Role', v: 'The only load-bearing substrate of the whole ceiling' },
    ],
    structure: ['Concrete slab', 'Soffit reinforcement (never cut through)', 'Conduit and junction box', 'Stencilled sample-section mark on the soffit'],
    install: 'Clean laitance and grease off the soffit before marking out. Locate rebar and services with a detector or by hammer testing; anchor points must miss them, and a hollow spot means relocating the hole.',
    check: 'Pull-out sampling: no loosening or pull-out. No new cracking around the drilled holes.',
    desc: 'The slab is where every load of the ceiling finally lands — everything goes through the expansion anchors into it. The model includes the soffit rebar and the electrical conduit on purpose: hitting a service with a drill is the most common rework accident on site.',
  },
  {
    id: 'layout-line',
    name: 'Level & Setting-Out Lines',
    layer: 'base',
    step: 1,
    explode: [0, -0.15, 0],
    installFrom: [0, -0.6, 0],
    labelOffset: [-205, 62],
    keySpec: 'FFL +50 line · module spacing',
    params: [
      { k: 'Instruments', v: 'Laser level / steel tape / chalk line' },
      { k: 'Finished level line', v: 'Closed chalk line around all walls' },
      { k: 'Carrier lines', v: 'Camber 1/200 – 1/300 across the short span' },
      { k: 'Strip setting out', v: 'Panels run on their own 100 mm module — no longer tied to the slot pitch; no edge strip narrower than 1/3 of a panel' },
      { k: 'Lift points', v: 'Spacing ≤ 1000 mm, ≤ 300 mm from the wall' },
      { k: 'Tolerance', v: 'Marking deviation ≤ 2 mm' },
    ],
    structure: ['FFL +50 line around the room (dashed, closed)', 'Cross marks on the soffit', 'Full-length strip module lines'],
    install: 'Snap the horizontal level line around the walls first (the ceiling finish level), then the lift-point crosses on the soffit and the strip module lines. Panels run on their own 100 mm module — marking out exists to settle the module count and the edge sizes before anything is drilled.',
    check: 'Lines crisp, closed and re-checkable; module layout matches the drawing; no sliver strips at the edges.',
    desc: 'Marking out is the only stage where a mistake costs nothing. Confirm the lift points and the module count line up and that no narrow strip is left at the edges before a single anchor is drilled — one line out and a whole row of panels has to come back.',
  },
  {
    id: 'anchor-bolt',
    name: 'Expansion Anchor Bolt',
    layer: 'suspension',
    step: 2,
    explode: [0, -0.7, 0],
    installFrom: [0, -2.2, 0],
    labelOffset: [175, -85],
    keySpec: 'M8×80 · driven upward from below',
    params: [
      { k: 'Size', v: 'M8 × 80 expansion anchor, carbon steel, zinc plated' },
      { k: 'Direction of work', v: 'Drilled and driven upward from the underside of the slab only; never through the slab from the floor above' },
      { k: 'Set includes', v: 'Heavy-duty sleeve + conical plug + flat washer + hex nut' },
      { k: 'Hole diameter', v: 'φ8 (same as the bolt)' },
      { k: 'Effective embedment', v: '≥ 60 mm' },
      { k: 'Pull-out per point', v: 'Design value ≥ 1.5 kN (follow the site calculation)' },
      { k: 'Edge / axial distance', v: 'Edge ≥ 50 mm, spacing ≥ 100 mm' },
      { k: 'Hole cleaning', v: 'Blow out at least 3 times, no dust left' },
      { k: 'Alternative', v: 'Chemical anchor where the concrete is cracked or the edge distance is short' },
    ],
    structure: ['Exposed stud end (hangs downward to the rod)', 'Hex nut + flat washer (bearing on the slab soffit)', 'Slotted expansion sleeve (from the hole mouth inwards)', 'Conical plug (seated at the bottom of the hole)'],
    install: 'Drill perpendicular to the soffit from inside the room, clean the hole, insert the sleeve with the cone facing inwards, then the bolt; finally tighten the nut outside the hole mouth — the stud moves out, the cone is drawn into the sleeve and the sleeve expands and bites the hole wall deep in the hole. Stop once the washer is bearing on the soffit.',
    check: 'No rotation or movement by hand; embedment as designed; one anchor per lift point, never one anchor carrying two rods; the floor and finish above untouched.',
    desc: 'When the nut is tightened the cone wedges the end of the sleeve open, and the anchor holds by a combination of friction and mechanical interlock. Dust left in the hole destroys the bond, and a sleeve that has already expanded never grips again — those two are the real safety issues here. Drilling from above is simply not a valid method: that is somebody else’s floor.',
  },
  {
    id: 'hanger-rod',
    name: 'Fully Threaded Hanger Rod',
    layer: 'suspension',
    step: 3,
    explode: [0, -1.45, 0],
    installFrom: [0, -2.2, 0],
    labelOffset: [172, -30],
    keySpec: 'Into the anchor above · through the top plate below',
    params: [
      { k: 'Size', v: 'φ8 (M8) fully threaded rod, zinc plated' },
      { k: 'Upper end', v: 'Screwed directly into the internal thread of the anchor ≥ 30 mm' },
      { k: 'Lower end', v: 'Passes through the φ8 hole in the carrier top plate; the nuts sit inside the channel' },
      { k: 'Cut length', v: 'Void height + ≥ 30 mm adjustment allowance' },
      { k: 'Plumb', v: 'Deviation ≤ 3 mm/m' },
      { k: 'Full length', v: 'Cut to the drop as one full rod — rods are not spliced on site; only where a tall drop makes it unavoidable, use the purpose-made coupler (never welding or wire binding)' },
      { k: 'Exposed thread', v: '2–3 pitches after tightening' },
      { k: 'Spacing', v: '250 mm along the carrier (product hole pitch), ≤ 1000 mm across' },
    ],
    structure: ['Threaded rod (one full length)', 'Upper coupling nut'],
    install: 'Screw the top end into the anchor and set it roughly plumb, then drop the lower end through the hanger hole in the carrier top plate and let the locking set carry the carrier up to the level line. Deburr the cut end and paint it with zinc-rich paint so corrosion does not start at the saw cut.',
    check: 'Rod plumb and not swinging; no stripped thread, 2–3 pitches exposed; all rods at the same level on one section.',
    desc: 'Almost all of the ceiling’s flatness is created by the rods. An inclined rod produces a horizontal component that slowly pushes the grid out of place; and a single nut working loose under micro-vibration lets that panel settle — hence the double nut at the bottom.',
  },
  {
    id: 'hanger-nut',
    name: 'Hanger Washer & Nuts',
    layer: 'suspension',
    step: 3,
    explode: [0, -2.35, 0],
    installFrom: [0, -1.8, 0],
    labelOffset: [150, 20],
    keySpec: 'Washer + double nut inside the channel',
    params: [
      { k: 'Set', v: 'M8 hex nut ×2 + φ8 flat washer ×1' },
      { k: 'Position', v: 'All inside the carrier channel, against the underside of the top plate' },
      { k: 'How it carries', v: 'The washer spreads the bearing; the two nuts lock and carry the carrier at level' },
      { k: 'Quantity', v: 'One set per lift point' },
      { k: 'Adjustment', v: '±10 mm of level trim' },
      { k: 'Exposed thread', v: '2–3 pitches after tightening (still hidden in the channel)' },
      { k: 'Never', v: 'Omit the washer, or carry the load on a single nut' },
    ],
    structure: ['Flat washer (spreads the bearing)', 'Lower nut (carries first)', 'Upper nut (locks against the lower)'],
    install: 'After the rod passes through the top-plate hole, drop the washer and the two nuts into the channel and start them finger tight; tighten everything only after the whole area is levelled. Hold the lower nut with one spanner and run the upper one against it — only a pair locked together resists backing off.',
    check: 'No play, no stripped thread; tapping the carrier must not spin the rod; the rod tail stays inside the channel and does not touch a panel.',
    desc: 'In a single-layer system the carrier level is created almost entirely by these two nuts. One nut alone backs out under micro-vibration and that spot sags; without the washer the nut punches through the plating and rust starts there.',
  },
  {
    id: 'carrier',
    name: 'Toothed Carrier (Dovetail Slot)',
    layer: 'frame',
    step: 4,
    explode: [0, -3.0, 0],
    installFrom: [0, -2.4, 0],
    labelOffset: [-215, -18],
    keySpec: 'U channel 30×30×1.0 · 22.5 pitch',
    params: [
      { k: 'Section', v: 'U channel 30 wide × 30 deep, 1.0 mm thick (measured from DXF)' },
      { k: 'Orientation', v: 'Channel opening downward, top plate upward against the hanger rod' },
      { k: 'Dovetail slot', v: 'Punched in the free edge of both side walls: mouth 9.5 → neck 4.5 → chamber 18.5' },
      { k: 'Slot pitch', v: '22.5 mm; the strip edge hooks snap into these slots, so the 90 mm strip module is kept as a multiple of the pitch (90 = 4 × 22.5)' },
      { k: 'Locking principle', v: 'Same as the baffle line: the panel edge hook is wider than the slot neck, so once snapped through the mouth it hangs on the shoulder and will not pull back out' },
      { k: 'Finish', v: 'Black matte powder coating (project specification, instead of the usual galvanised grey)' },
      { k: 'How the slots are used', v: 'Slots run at 22.5 all the way along; every other one takes a strip panel edge hook, and the spare rows also take hold-down clips and the baffle-line products' },
      { k: 'Hanger holes', v: 'φ8 in the top plate, 250 pitch, 125 from the end' },
      { k: 'Direction', v: 'Perpendicular to the strips, continuous across the short span; 500 mm standard length, can be spliced' },
      { k: 'Camber', v: '1/200 – 1/300 when the span ≥ 4 m' },
      { k: 'Flatness', v: '≤ 2 mm on a 2 m straight edge' },
      { k: 'Corrosion', v: 'Coating intact; touch up cuts and thread holes with zinc-rich paint' },
    ],
    structure: ['Top plate (hanger holes)', 'Two side walls (free edge downward)', 'One row of dovetail T slots: mouth / neck / chamber', "Maker's stamp on the outer face of each wall"],
    install: 'Lift the carrier onto the rods along the module lines (the stud passes through the top-plate hole, washer and double nut inside the channel), start them without tightening and set the middle first; pull a mason’s line and level point by point, putting in the camber at the same time. The channel must face down and the free edge must be straight and undamaged — the panel edge hooks snap over it, so a crushed wall edge shows on the finished surface.',
    check: 'Level within 5 mm on a 5 m line; straight with no wave; free edge not crushed or burred.',
    desc: 'This layer merges load bearing and setting out into one part: the holes in the top plate locate the rods, the free edges of the side walls carry the strip panels. No screws and single-piece demountable — the price is that there is no second layer to adjust: bend the carrier and the finished surface is bent.',
  },
  {
    id: 'strip',
    name: 'Aluminium Strip Panel',
    layer: 'finish',
    step: 5,
    explode: [0, -3.9, 0],
    installFrom: [0, -3.2, 0],
    labelOffset: [-225, 72],
    keySpec: '86×10×0.8 · wood grain · smooth-arc clip-in edge',
    params: [
      { k: 'Section', v: 'Smooth-arc clip-in channel, 86 wide face × 10 deep, 0.8 mm skin (per the smooth-arc generator HTML)' },
      { k: 'Wall thickness', v: '0.8 mm — real rolled sheet thickness, not exaggerated for visibility' },
      { k: 'Clip-in edge', v: 'Both top edges stand up as a smooth arc and curl inward into a ~4.5 mm fishhook (tip flares back); the hook snaps through the carrier wall dovetail and hangs on the shoulder' },
      { k: 'R corner', v: 'The face meets each edge with a 2 mm arc (G1 continuous), so the visible finish has no sharp corner — the “smooth arc edge” look' },
      { k: 'Common sizes', v: 'Face widths commonly 100 / 150 / 200 mm; this demo lays an ~90 mm module with a fine joint' },
      { k: 'Alloy', v: '6063-T5 aluminium' },
      { k: 'Surface', v: 'Wood-grain sublimation in this demo, on the outside only (inside and cut ends stay bare aluminium)' },
      { k: 'Spacing', v: 'Laid at a 90 mm module (4 × 22.5 mm slot pitch) with a very fine ~4 mm gap, so each edge hook lands on a carrier slot' },
      { k: 'Single length', v: 'Factory cut to room length and ordered as one length — no on-site splices; both ends are concealed by the wall trim' },
      { k: 'How it fixes', v: 'One edge tilted so its hook passes the carrier wall mouth, laid down so the other edge snaps in, then pressed along the run until both hooks click onto the shoulders' },
      { k: 'Demountable', v: 'Push the panel sideways along the run until the hooks clear the mouths, then tilt it down — no tools for a single panel' },
      { k: 'Weight', v: 'About 1.5 – 3.5 kg/m² including carrier and hangers' },
    ],
    structure: ['Face panel (downward, the visible finish band with rounded R corners)', 'Two upright arc edges ~10 mm up (towards the concrete)', 'A ~4.5 mm inward fishhook at the head of each edge, tip flaring back (the clip)', "Maker's prints on the finish band: 150 × 24 mm, two per panel at 580 mm pitch"],
    install: 'Work from the centre line outwards: tilt the panel so one edge hook passes the carrier wall dovetail mouth, lay it down so the other edge snaps in — one side first, the other follows — then press along the run until both hooks click past the neck and hang on the shoulders, leaving the face flush with the slot mouths. Wear gloves throughout and never force an edge straight.',
    check: 'Joints tight and even within 0.5 mm; rows straight with no wave; no wobble by hand; panels free of warp, scratches, colour difference and fingerprints.',
    desc: 'The edge hook plus the carrier wall dovetail is the heart of this system: the hook is wider than the slot neck, so once snapped through it hangs on the shoulder, nothing needs a screw, yet every panel can be slid out on its own for access to lights and ducts. All panels are one uniform factory length — no joints in the field. The faces read as one continuous wood-grain plane from below with only a fine joint between them; the grain film is transferred to the outside only, so in top view the inner faces and the cut edges read as bare aluminium — exactly like the real product.',
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
