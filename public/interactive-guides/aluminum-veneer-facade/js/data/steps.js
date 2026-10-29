/**
 * data/steps.js —— 施工工序流程（安装指导的主线）
 * 每道工序 = 一个可播放的装配动作 + 机具 / 材料 / 工艺 / 验收四段说明。
 * 涉及部件由 parts.js 的 step 字段自动反查，不在此重复登记，避免两处数据打架。
 * 本文件为英文版：所有面向用户的文案为英文。
 * 体系：水泥墙 → 锚固网状钢结构 → 铝单板一块一块挂装：每块先放板（挂耳平贴钢管），再单独一道工序拧入 8 颗螺丝 → 成组后打密封胶。
 * 逐块"放板 / 拧钉"分两步，动效上能看出板是被螺丝拧到钢骨架上的。
 */

/** 放一块板（挂耳与板一体，先把脚平贴到钢管上） */
function placePanel(n) {
  return {
    order: 2 * n + 1,
    name: `Place Panel ${n}`,
    short: `Set panel ${n} on the grid so its 8 integral ears lie flat on the tubes`,
    duration: 'per panel, team + suction cups',
    tools: ['Suction cups / hoist', 'Level', 'Shims', 'Plumb laser'],
    materials: ['Aluminium veneer panel (ears bent on in the shop)'],
    method: [
      n === 1
        ? 'Take the first panel from the fixed corner; it sets the datum for the whole group.'
        : `Place panel ${n} against the panels already hung, keeping the running joint line straight.`,
      'Bring it to the grid so all 8 integral ears sit flat on the tubes behind — no gap under any ear.',
      'Set its level, joint width and face flush; hold with shims. Do not screw yet — the next step drives the screws.',
    ],
    check: [`Panel ${n} resting on the grid with all 8 ears flat on the tubes`, 'Level, joint width and face set against the setting-out lines', 'Held securely, not yet fixed'],
    note: 'Placing and screwing are separate steps on purpose: first you see the panel land on its ears, then the screws that hold it go in.',
  };
}

/** 给已就位的板拧 8 颗自攻螺丝 */
function screwPanel(n) {
  return {
    order: 2 * n + 2,
    name: `Screw Panel ${n}`,
    short: `Drive 8 self-tapping screws through panel ${n}'s ears into the tubes`,
    duration: 'per panel, drill-driver',
    tools: ['Drill-driver / torque driver', 'Magnetic bit', 'Safety glasses'],
    materials: ['8 self-tapping screws to steel (stainless / coated)'],
    method: [
      `With panel ${n} held on the grid, drive one self-tapping screw through each of the 8 ear holes into the steel tube behind.`,
      'Screws go perpendicular to the panel face — this is what actually fixes the panel to the subframe.',
      n < 4
        ? 'Re-check flush and joint width after screwing, then release the suction cups and move to the next panel.'
        : 'This closes the group — re-check the whole 2 × 2 face for flatness, joints and diagonals.',
    ],
    check:
      n < 4
        ? 'All 8 screws seated, panel does not rock, ear tabs flat on the tubes'
        : 'Group complete, all 32 ear screws driven; joints even within ±2 mm; face flat',
    note: 'Nothing is screwed through the visible face — the panel is held only by these 8 ear screws, so any single panel can come back off.',
  };
}

export const STEPS = [
  {
    order: 1,
    name: 'Survey & Setting Out',
    short: 'As-built wall survey + panel module grid on the wall',
    duration: '1 day / 2 people',
    tools: ['Laser level / plumb laser', '5 m tape', 'Chalk line', 'Rebar / service detector'],
    materials: ['—'],
    method: [
      'Check the wall is solid and can take anchors; detect and mark rebar and services.',
      'Survey the as-built face (flatness, plumb) and record deviations.',
      'Establish the façade face datum and snap the vertical / horizontal module grid on the wall, tied to the building control lines.',
      'Snap every panel joint centreline — the grid tubes will be fixed on these same lines, so the panel ears land on a tube.',
    ],
    check: ['Wall sound, services located and avoided', 'Grid square, setting-out deviation ≤ 2 mm', 'No edge panel narrower than 1/3 of a full panel'],
    note: 'The tube grid and the panel ears share these lines — setting out here fixes both where the anchors go and that every ear lands on a tube.',
  },
  {
    order: 2,
    name: 'Fix Steel Grid to Wall',
    short: 'Expansion anchors on the grid lines, then the RHS tube mesh',
    duration: '2–3 days / team',
    tools: ['Hammer drill', 'Torque wrench', 'Plumb laser', '2 m straight edge', 'Weld / bolt set'],
    materials: ['M10 expansion anchor bolts', 'RHS 40×40×3 galvanised tubes', 'Insulating pads'],
    method: [
      'Drill through the tube back wall into the concrete on the marked crossings, clean the holes and set the expansion anchors — one bolt per crossing, its hex head bearing on the tube back.',
      'Erect the vertical and horizontal tubes on the anchors, the mesh matching the panel module exactly (tubes on the joint / edge centrelines).',
      'Plumb and level each run, true the whole face, then lock the grid crossings (bolted or welded).',
      'Touch up galvanising breaks with zinc-rich paint.',
    ],
    check: ['Anchors no movement by hand; torque verified', 'Mesh on module and on the datum plane; face straight, no wave', 'Every panel ear position has a tube behind it'],
    note: 'This is the load path and the setting-out in one layer — the wall tolerance is taken up at the anchors, never at the panel face.',
  },
  ...[1, 2, 3, 4].flatMap((n) => [placePanel(n), screwPanel(n)]),
  {
    order: 11,
    name: 'Seal the Joints',
    short: 'After the group is hung: backer rod + weatherseal',
    duration: 'After panel alignment',
    tools: ['Cleaning cloths', 'Backer-rod wheel', 'Caulking gun', 'Masking tape', 'Tooling bead'],
    materials: ['Closed-cell backer rod', 'Neutral-cure silicone weatherseal'],
    method: [
      'Once all four panels are hung and screwed and the joints are even, clean both bond faces and let them dry; mask both edges.',
      'Set the backer rod to depth so the sealant is about half the joint width.',
      'Apply and tool the sealant to a smooth concave bead before it skins; remove masking while wet.',
    ],
    check: ['Bead continuous, straight, evenly tooled', 'No voids, no three-sided bond', 'No smearing on the panel face'],
    note: 'Sealing is done after the panels are set as a group, so the joint width is already even and the bead comes out straight.',
  },
  {
    order: 12,
    name: 'Inspection & Handover',
    short: 'Peel film, final line-and-level, record',
    duration: '0.5 day / team',
    tools: ['Straight edge', 'Tape', 'Visual inspection kit'],
    materials: ['—'],
    method: [
      'Peel the protection film, clean the faces and inspect for scratches, dents and colour difference.',
      'Re-check joint width, face flatness and the overall line against the setting-out drawing.',
      'Verify every ear screw and anchor is tightened; touch-up any coating breaks.',
      'Record the as-built and hand over the access / replacement panel schedule.',
    ],
    check: ['Face flat, joints even, no visible defect', 'All fixings tightened and marked', 'As-built record and spares handed over'],
    note: 'A single-panel-demountable façade only works if the fixing record and spare panels are handed over with it.',
  },
];

/** 工序总数（供 UI 渲染步进器 / 快捷键上界，避免各处硬编码） */
export const STEP_COUNT = STEPS.length;
