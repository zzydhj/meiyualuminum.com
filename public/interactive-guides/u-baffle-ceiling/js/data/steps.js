/**
 * data/steps.js —— 施工工序流程（安装指导的主线）
 * 每道工序 = 一个可播放的装配动作 + 机具 / 材料 / 工艺 / 验收四段说明。
 * 涉及部件由 parts.js 的 step 字段自动反查，不在此重复登记，避免两处数据打架。
 * 本文件为英文版：所有面向用户的文案为英文，工序顺序与数值与中文版完全一致。
 */

import { partsOfStep } from './parts.js';

export const STEPS = [
  {
    order: 1,
    name: 'Marking Out',
    short: 'FFL +50 line + lift points + baffle module lines',
    duration: '0.5 day / 2 people',
    tools: ['Laser level', '5 m tape', 'Chalk line', 'Rebar / service detector'],
    materials: ['—'],
    method: [
      'Clean the soffit, then detect and mark the rebar and electrical services.',
      'Snap the +50 horizontal line around all walls (the ceiling finish level) and close the loop to check the rise.',
      'Mark the lift-point crosses on the soffit: spacing ≤ 1000 mm, ≤ 300 mm from the wall.',
      'Snap the baffle module lines to the grid — the carrier slot pitch is already punched to this grid at the factory, so marking out is about verifying the module and the edge sizes.',
      'Where the span ≥ 4 m, camber 1/200 – 1/300 across the short span.',
    ],
    check: ['Lines crisp, closed and re-checkable', 'Marking deviation ≤ 2 mm', 'No edge strip narrower than 1/3 of a baffle'],
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
      'Where the rod must be extended, use only the purpose-made coupler — never welding or wire binding.',
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
      'The carrier must run perpendicular to the baffles, with the slot mouths facing down and the slot phase consistent along the whole run — fitted upside down or out of phase and the return lips will not go in.',
      'Splice the 500 mm standard lengths with the connector; never leave a joint hanging mid-span unsupported; ends ≤ 300 mm from the wall.',
      'Once the whole area is level, tighten every double nut in the channel.',
    ],
    check: ['Level within 5 mm on a 5 m line', '≤ 2 mm on a 2 m straight edge', 'Slot mouths undamaged and unblocked', 'Camber smooth, no local sag'],
    note: 'This system has only one carrier layer: it carries the load and it sets the position, and there is no second layer to save you.',
  },
  {
    order: 5,
    name: 'Clipping In the Baffles',
    short: 'Opening upward · lips squeezed into the dovetail slots',
    duration: '2–3 days / 4 people (area dependent)',
    tools: ['Suction lifter / lifting bar', 'Tape', 'Laser line', 'Cotton gloves', 'Wireless pliers (to straighten crushed slots)'],
    materials: ['U-channel aluminium baffle 50×100, wood grain', 'Matching accessories'],
    method: [
      'Before starting, check every slot run: straighten anything crushed in transit or handling with pliers; a blocked slot must never be substituted with wire.',
      'Work from the centre line outwards, starting with the first baffle off the datum line.',
      'Keep the baffle opening upward, lift it to design height and line the two inward lips up with the dovetail mouths in the carrier walls.',
      'Push up: the lips squeeze past the 4.5 necks into the 18.5 chambers, the legs pass the mouth and neck, and on release the lips hang on the shoulders — locked.',
      'The slots run at 22.5 all the way along, far denser than the baffles, so there is no one-slot-per-baffle rule: take the nearest slot and leave the empty ones alone.',
      'Check alignment with the laser as you go and hold spacing within 1 mm.',
      'Gloves throughout; wipe off fingerprints and adhesive residue, never bend a leg to level, and never drag the baffle across the grain face.',
    ],
    check: ['Spacing even within 1 mm', 'Rows straight with no wave', 'Panels free of warp, scratches and colour difference'],
    note: 'Where an edge piece is short, cut it to length and fit an end cap — never tear aluminium by hand and leave a ragged edge. In high traffic or negative pressure zones (under air diffusers, for instance) add a matching aluminium hold-down clip every other baffle so the airflow cannot lift them and set up rattling.',
  },
  {
    order: 6,
    name: 'Splices and End Caps',
    short: 'Sleeve engagement ≥ 30 mm · 1–2 mm gap',
    duration: 'Runs alongside step 5',
    tools: ['Screwdriver', 'Fine file / deburring tool'],
    materials: ['Aluminium inline connector sleeve', 'End caps in matching grain'],
    method: [
      'Where the run exceeds the single length (≤ 3000 mm), splice with the sleeve inside the back panel, at least 30 mm into each end.',
      'Tighten the set screws, leave a 1–2 mm expansion gap, and place the joint mid-span between two carriers.',
      'At free ends — coves, pelmet boxes, access openings — deburr and straighten the cut first, then press the end cap in.',
      'The cap faces the same way as the opening, with the face set back ≤ 0.5 mm.',
    ],
    check: ['Joint with no step or sag', 'Port ends free of burr', 'Caps tight and colour matched'],
    note: 'A joint sitting in the unsupported gap between two carriers becomes a permanent dip line that can never be pulled straight.',
  },
  {
    order: 7,
    name: 'Details, Penetrations and Service Openings',
    short: 'Lights / air valves / pelmet interfaces',
    scope: 'Adds no new components: the work is on baffles and carriers already installed — openings, free ends and junctions.',
    duration: '1 day / with electrical and fire protection',
    tools: ['Hole saw', 'Jigsaw', 'Laser line', 'Vacuum'],
    materials: ['Trim in matching grain', 'Ready-made access panel', 'Sealant (at colour differences)'],
    method: [
      'Set out lights, sprinklers, smoke detectors and air valves onto the baffle back panel before cutting; no flame cutting.',
      'Support the edges of every opening with a short carrier piece or hold-down clip so the baffle around the hole cannot flex.',
      'The length of baffle beyond the last carrier is a free end: keep the cantilever within 250 mm, hang nothing on it, and close the wall junction with matching trim.',
      'Trim all junctions with walls, pelmet boxes and light coves with matching trim, keeping the joint width constant.',
      'Make access panels a demountable section that pushes down and out; never weld or glue a baffle to the carrier.',
    ],
    check: ['Openings on site with clean edges', 'Trim joints even and unbroken', 'Access sections removable on their own'],
    note: 'With the opening facing upward every service penetration is cut from the back panel downwards: measure first, cut second — one wrong hole means taking a whole row down.',
  },
  {
    order: 8,
    name: 'Final Levelling and Cleaning',
    short: 'Adjust the rod nuts only, never bend the aluminium',
    scope: 'Adds no new components: only the installed rods are re-checked — nuts re-tightened, nothing removed or altered.',
    duration: '0.5–1 day',
    tools: ['Laser level', '2 m straight edge', 'Feeler gauge', 'Soft cloth / vacuum'],
    materials: ['— (re-lock nuts and touch up colour where needed)'],
    method: [
      'Look up along each row; where the surface bulges, trim the level on the corresponding rod nuts.',
      'Measure surface flatness with the 2 m straight edge and level and spacing with a line.',
      'Re-check the anchors for looseness, the dovetail slots for damage, and the caps and trim for lifting.',
      'Peel off the protective film, remove fingerprints and adhesive residue, and clear debris out of the void.',
    ],
    check: ['Level within 5 mm', 'Flatness within 2 mm', 'Spacing within 1 mm', 'Finish free of staining and scratches'],
    note: 'Levelling is always done at the rod nuts. Aluminium bent past its elastic limit springs back leaving a gap, and it cannot be repaired.',
  },
  {
    order: 9,
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
      'Baffle spacing within 1 mm, alignment within 2 mm',
      'Joint step within 0.5 mm, end set-back within 0.5 mm',
      'Rod plumb within 3 mm/m, carrier spacing within 3 mm',
      'Anchor pull-out sampling passed, nothing loose or pulled out',
      'Finish free of scratches, colour difference, warp and staining',
    ],
    note: 'For a toothed carrier system the handover record should also note demountability: two baffles sampled at random must come down and be refitted individually.',
  },
];

export const STEP_COUNT = STEPS.length;

/** 该工序涉及的部件 id（数据反查，保持单一来源） */
export function stepPartIds(order) {
  return partsOfStep(order).map((p) => p.id);
}

/** 最后一道工序 = 全部安装完成 */
export const FULLY_INSTALLED = STEP_COUNT;
