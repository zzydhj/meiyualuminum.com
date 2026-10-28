/**
 * data/steps.js —— 施工工序流程（安装指导的主线）
 * 每道工序 = 一个可播放的装配动作 + 机具 / 材料 / 工艺 / 验收四段说明。
 * 涉及部件由 parts.js 的 step 字段自动反查，不在此重复登记，避免两处数据打架。
 * 本文件为英文版：所有面向用户的文案为英文。
 * 饰面层卡合工艺依据 docs/sections/strip-ceiling/smooth-arc-clipin-profile-generator.html（板缘向内回勾卡进龙骨侧壁燕尾槽）。
 */

import { partsOfStep } from './parts.js';

export const STEPS = [
  {
    order: 1,
    name: 'Marking Out',
    short: 'FFL +50 line + lift points + strip module lines',
    duration: '0.5 day / 2 people',
    tools: ['Laser level', '5 m tape', 'Chalk line', 'Rebar / service detector'],
    materials: ['—'],
    method: [
      'Clean the soffit, then detect and mark the rebar and electrical services.',
      'Snap the +50 horizontal line around all walls (the ceiling finish level) and close the loop to check the rise.',
      'Mark the lift-point crosses on the soffit: spacing ≤ 1000 mm, ≤ 300 mm from the wall.',
      'Snap the strip module lines to the grid — the carrier slot pitch is already punched to this grid at the factory, so marking out is about verifying the module and the edge sizes.',
      'Where the span ≥ 4 m, camber 1/200 – 1/300 across the short span.',
    ],
    check: ['Lines crisp, closed and re-checkable', 'Marking deviation ≤ 2 mm', 'No edge strip narrower than 1/3 of a panel'],
    note: 'Position the lights, air valves, sprinklers and access panels in this same round — cutting the holes afterwards means doing the work twice.',
  },
  {
    order: 2,
    name: 'Drilling and Anchor Bolts',
    short: 'Drilled upward from the soffit · embedment ≥ 60 mm',
    duration: '0.5 day / 2 hammer drills',
    tools: ['φ8 hammer drill', 'Mallet', 'Air blow / brush for hole cleaning', 'Socket wrench'],
    materials: ['M8×80 expansion anchor', 'Heavy-duty sleeve', '(Chemical anchor where edge distance is short)'],
    method: [
      'All drilling is done from inside the room, upward into the slab soffit; never drill from the floor above to chase a position.',
      'Set out on the lift-point crosses, drill perpendicular to the soffit, depth = effective embedment + 10 mm.',
      'Clean the hole: blow it out at least 3 times (this is what determines the holding strength).',
      'Insert the sleeve with the cone facing inwards (towards the bottom of the hole) and the bolt after it; the stud and nut stay outside the hole, then tighten until the washer bears on the soffit.',
      'On hollow spots, main bars or services, relocate and re-drill on this same side — never skew the bolt or force it in.',
    ],
    check: ['No rotation or movement by hand', 'Embedment ≥ 60 mm', 'One anchor per lift point, never shared'],
    note: 'A sleeve that has expanded once never grips again, so reclaimed sleeves are prohibited; drilling through the slab would destroy the floor and the waterproofing above, which is out of the question.',
  },
  {
    order: 3,
    name: 'Threaded Rods and Locking Sets',
    short: 'φ8 threaded · into the anchor above · through the top plate below',
    duration: '1 day / 2 people',
    tools: ['Hacksaw / cutter (cutting)', 'Spanners 13, 14', 'Laser level for re-check'],
    materials: ['φ8 fully threaded hanger rod', 'M8 nuts (2 per point)', 'φ8 flat washer'],
    method: [
      'Cut to the void height plus 30 mm of adjustment allowance; deburr the cut and paint it with zinc-rich paint.',
      'Screw the upper end into the internal thread of the anchor ≥ 30 mm and add the locking nut.',
      'Let the rod hang plumb, pass the lower end through the hanger hole in the carrier top plate, then add the washer and the double nut inside the channel to carry it.',
      'Each rod is one full length for its drop — no splicing on site; only where a tall drop truly forces an extension, use the purpose-made coupler, never welding or wire binding.',
    ],
    check: ['Rod plumb and not swinging', '2–3 pitches exposed after tightening', 'Same level on a given cross-section'],
    note: 'An inclined rod pushes a horizontal component into the grid and slowly walks it out of place; most later sagging and displacement traces back to this.',
  },
  {
    order: 4,
    name: 'Carriers: Lift, Level, Camber',
    short: 'U channel 30×30×1.0 · opening downward',
    duration: '1 day / 3 people',
    tools: ['Spanners', 'Mason’s line / laser line', '2 m straight edge'],
    materials: ['Toothed carrier (U channel 30×30×1.0, black coated)', 'Splice connectors'],
    method: [
      'Lift the carrier onto the rods along the module lines: the stud passes through the φ8 hole in the top plate, washer and double nut inside the channel, started but not tightened.',
      'Pull a line from one end and level point by point, putting the camber in at the same time.',
      'The carrier must run perpendicular to the strips, channel facing down; the free edge of the side walls must be straight and undamaged — the panel edge hooks snap over it.',
      'Splice the 500 mm standard lengths with the connector; never leave a joint hanging mid-span unsupported; ends ≤ 300 mm from the wall.',
      'Once the whole area is level, tighten every double nut in the channel.',
    ],
    check: ['Level within 5 mm on a 5 m line', '≤ 2 mm on a 2 m straight edge', 'Slot mouths undamaged and unblocked', 'Camber smooth, no local sag'],
    note: 'This system has only one carrier layer: it carries the load and it sets the position, and there is no second layer to save you.',
  },
  {
    order: 5,
    name: 'Laying In the Strip Panels',
    short: 'Edge hooks snap into the carrier wall dovetails · flush joint',
    duration: '2–3 days / 4 people (area dependent)',
    tools: ['Suction lifter / lifting bar', 'Tape', 'Laser line', 'Cotton gloves', 'Wireless pliers (to straighten crushed wall edges)'],
    materials: ['Aluminium strip panel 88×10×0.8, smooth-arc clip-in, wood grain', 'Matching accessories'],
    method: [
      'Before starting, check the free edge of every carrier run: straighten anything crushed in transit or handling with pliers — the panel edge hooks snap over it, so a bent wall edge shows on the finished surface.',
      'Work from the centre line outwards, starting with the first panel off the datum line.',
      'Tilt the panel so one edge hook passes the carrier wall dovetail mouth, then lay it down so the other edge snaps in — one side first, the other follows.',
      'Press along the run until both edge hooks click past the neck and hang on the dovetail shoulders — the panel face ends up flush with the slot mouths.',
      'Close each joint by pressing the free edges together along the full span; the fine 4 mm gap should stay even with no visible step.',
      'Check alignment with the laser as you go and hold the joint line within 0.5 mm.',
      'Gloves throughout; wipe off fingerprints and adhesive residue, never bend an edge to level, and never drag a panel across the grain face.',
    ],
    check: ['Joints tight and even within 0.5 mm', 'Rows straight with no wave', 'Panels free of warp, scratches and colour difference'],
    note: 'Panels are ordered as one uniform factory length per room — no joints in the field; the end edge at the wall is concealed by the trim, never left as a bare cut edge. In high traffic or negative pressure zones (under air diffusers, for instance) add a matching aluminium hold-down clip into the carrier dovetail every other panel so the airflow cannot lift them and set up rattling.',
  },
  {
    order: 6,
    name: 'Details, Penetrations and Service Openings',
    short: 'Lights / air valves / pelmet interfaces',
    scope: 'Adds no new components: the work is on strip panels and carriers already installed — openings, free ends and junctions.',
    duration: '1 day / with electrical and fire protection',
    tools: ['Hole saw', 'Jigsaw', 'Laser line', 'Vacuum'],
    materials: ['Trim in matching finish', 'Ready-made access panel', 'Sealant (at colour differences)'],
    method: [
      'Set out lights, sprinklers, smoke detectors and air valves onto the strip back panel before cutting; no flame cutting.',
      'Support the edges of every opening with a short carrier piece or hold-down clip so the panel around the hole cannot flex.',
      'The length of strip beyond the last carrier is a free end: keep the cantilever within 250 mm, hang nothing on it, and close the wall junction with matching trim so the cut edge is never exposed.',
      'Trim all junctions with walls, pelmet boxes and light coves with matching trim, keeping the joint width constant.',
      'Make access panels a demountable section that pushes down and out; never weld or glue a strip to the carrier.',
    ],
    check: ['Openings on site with clean edges', 'Trim joints even and unbroken', 'Access sections removable on their own'],
    note: 'With the open clip-in edge, every service penetration is cut from the face panel upwards: measure first, cut second — one wrong hole means taking a whole row down.',
  },
  {
    order: 7,
    name: 'Final Levelling and Cleaning',
    short: 'Adjust the rod nuts only, never bend the aluminium',
    scope: 'Adds no new components: only the installed rods are re-checked — nuts re-tightened, nothing removed or altered.',
    duration: '0.5–1 day',
    tools: ['Laser level', '2 m straight edge', 'Feeler gauge', 'Soft cloth / vacuum'],
    materials: ['— (re-lock nuts and touch up colour where needed)'],
    method: [
      'Look up along each row; where the surface bulges, trim the level on the corresponding rod nuts.',
      'Measure surface flatness with the 2 m straight edge and level and spacing with a line.',
      'Re-check the anchors for looseness, the carrier free edges for damage, and the wall trim for lifting.',
      'Peel off the protective film, remove fingerprints and adhesive residue, and clear debris out of the void.',
    ],
    check: ['Level within 5 mm', 'Flatness within 2 mm', 'Spacing within 1 mm', 'Finish free of staining and scratches'],
    note: 'Levelling is always done at the rod nuts. Aluminium bent past its elastic limit springs back leaving a gap, and it cannot be repaired.',
  },
  {
    order: 8,
    name: 'Completion Inspection and Handover',
    short: 'Appearance + concealed work + documentation',
    scope: 'Adds no new components: four checks over the completed ceiling — appearance, measured, concealed and paperwork.',
    duration: '0.5 day',
    tools: ['Laser level', 'Straight edge', 'Feeler gauge', 'Steel tape', 'Pull-out tester (sampling)'],
    materials: ['—'],
    method: [
      'Appearance: overall straight, spacing even, no colour difference or scratches, consistent trim.',
      'Measured: record level, flatness, spacing, joint offsets and camber item by item.',
      'Concealed: anchor pull-out sampling, rod spacing and plumb, carrier spacing and connections.',
      'Documentation: certificates and test reports, concealed-work records, inspection lot acceptance records.',
    ],
    check: [
      'Ceiling level within 5 mm (5 m line)',
      'Surface flatness within 2 mm (2 m straight edge and feeler gauge)',
      'Flush joints open within 0.5 mm, alignment within 2 mm',
      'Joint step within 0.5 mm, trim set-back within 0.5 mm',
      'Rod plumb within 3 mm/m, carrier spacing within 3 mm',
      'Anchor pull-out sampling passed, nothing loose or pulled out',
      'Finish free of scratches, colour difference, warp and staining',
    ],
    note: 'For a toothed carrier system the handover record should also note demountability: two strip panels sampled at random must come down and be refitted individually.',
  },
];

export const STEP_COUNT = STEPS.length;

/** 该工序涉及的部件 id（数据反查，保持单一来源） */
export function stepPartIds(order) {
  return partsOfStep(order).map((p) => p.id);
}

/** 最后一道工序 = 全部安装完成 */
export const FULLY_INSTALLED = STEP_COUNT;
