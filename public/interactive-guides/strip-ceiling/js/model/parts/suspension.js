/**
 * model/parts/suspension.js —— 悬吊系统
 * 膨胀螺栓（打入混凝土）→ 全牙吊杆（拧进膨胀螺栓）→ 紧固副（槽腔内平垫 + 双螺母）
 *
 * 实物做法里吊杆是直接穿过龙骨底板孔、用螺母把龙骨"托"上标高的，没有额外的压框零件。
 */

import * as THREE from 'three';
import { cyl, cone, torus, threadHelix } from '../geometry.js';
import { LEVEL, ANCHOR, HANGER, CARRIER } from '../spec.js';

const hex = (r, h) => cyl(r, r, h, 6);

/**
 * 膨胀螺栓：只从楼板底面向上钻孔、向上打入（在室内这一侧完成，不得到楼板上方破坏上层地面）
 * 从下往上的顺序：螺杆外露端 + 螺母 + 平垫（顶住楼板底面）→ 开槽套管（孔口到孔内）→ 锥塞（孔底端）
 * 拧螺母时螺杆往外走、锥塞被拉进套管，套管在孔深处胀开咬住孔壁。
 * 埋入段在楼板内，只有把楼板隐藏时才看得见，所以单独成一个部件。
 */
export function buildAnchorBolt(kit) {
  const g = new THREE.Group();
  const steel = kit.m('darkSteel', { color: '#6b7480' });
  const zinc = kit.m('zinc', { color: '#b6c0cb' });
  const holeRing = kit.m('concreteDark');

  const sleeve = cyl(ANCHOR.sleeveR, ANCHOR.sleeveR, ANCHOR.sleeveLen, 16);
  const coneGeo = cone(ANCHOR.coneR, 0.16, 16); // 锥尖朝上（指向孔底），大端朝孔口
  const rod = cyl(ANCHOR.rodR, ANCHOR.rodR, 0.98, 14);
  const washer = cyl(ANCHOR.plateR, ANCHOR.plateR, ANCHOR.plateT, 18);
  const nut = hex(ANCHOR.nutR, ANCHOR.nutT);
  const ring = torus(ANCHOR.sleeveR + 0.014, 0.012, 8, 22).clone();
  ring.rotateX(Math.PI / 2);

  const sleeveTop = LEVEL.slabBottom + ANCHOR.sleeveLen;

  HANGER.positions.forEach(([x, z]) => {
    const s = new THREE.Mesh(sleeve, steel);
    s.position.set(x, LEVEL.slabBottom + ANCHOR.sleeveLen / 2, z);
    g.add(s);

    const c = new THREE.Mesh(coneGeo, steel);
    c.position.set(x, sleeveTop - 0.08, z); // 锥塞落在孔的最深处
    g.add(c);

    const r = new THREE.Mesh(rod, zinc);
    r.position.set(x, (sleeveTop + LEVEL.anchorStub) / 2, z);
    g.add(r);

    const w = new THREE.Mesh(washer, zinc);
    w.position.set(x, LEVEL.slabBottom - ANCHOR.plateT / 2 - 0.005, z);
    g.add(w);

    const n = new THREE.Mesh(nut, zinc);
    n.position.set(x, LEVEL.slabBottom - ANCHOR.plateT - ANCHOR.nutT / 2 - 0.005, z);
    g.add(n);

    // 成孔孔口：提示"清孔"这道动作
    const k = new THREE.Mesh(ring, holeRing);
    k.position.set(x, LEVEL.slabBottom + 0.002, z);
    g.add(k);
  });

  return g;
}

/** 全牙吊杆：上端拧入膨胀螺栓内螺纹，下端穿过龙骨冲孔由螺母承托 */
export function buildHangerRod(kit) {
  const g = new THREE.Group();
  const zinc = kit.m('zinc', { color: '#ccd5de', roughness: 0.36 });
  const steel = kit.m('darkSteel');

  const len = LEVEL.hangerTop - LEVEL.hangerBottom;
  const mid = (LEVEL.hangerTop + LEVEL.hangerBottom) / 2;

  const rod = cyl(HANGER.rodR, HANGER.rodR, len, 14);
  const thread = threadHelix(len, HANGER.threadR, 0.05, 0.009);
  const nut = hex(HANGER.nutR, HANGER.nutT);

  HANGER.positions.forEach(([x, z]) => {
    const r = new THREE.Mesh(rod, zinc);
    r.position.set(x, mid, z);
    g.add(r);

    const t = new THREE.Mesh(thread, steel);
    t.position.set(x, mid, z);
    g.add(t);

    // 上端：与膨胀螺栓锁紧的螺母（拧够扣数后带住）
    const un = new THREE.Mesh(nut, zinc);
    un.position.set(x, LEVEL.upperNut, z);
    g.add(un);
  });

  return g;
}

/**
 * 吊杆紧固副：螺杆穿过龙骨底板孔后，在槽腔内坐“平垫 + 双螺母”把整道龙骨托住
 * 单螺母在微振动下会退扣，所以必须双螺母互锁；标高就靠这两只螺母调出来。
 */
export function buildHangerNut(kit) {
  const g = new THREE.Group();
  const zinc = kit.m('zinc', { color: '#c2ccd6', roughness: 0.34 });

  const { nutR, nutT, washerR, washerT } = HANGER;
  const washer = cyl(washerR, washerR, washerT, 18);
  const nut = hex(nutR, nutT);

  const seat = LEVEL.carrierTop - CARRIER.t; // 底板内表面（槽腔这一侧）
  const washerY = seat - washerT / 2 - 0.002;
  const n1Y = seat - washerT - nutT / 2 - 0.004;
  const n2Y = n1Y - nutT;

  HANGER.positions.forEach(([x, z]) => {
    const w = new THREE.Mesh(washer, zinc);
    w.position.set(x, washerY, z);
    g.add(w);

    const n1 = new THREE.Mesh(nut, zinc);
    n1.position.set(x, n1Y, z);
    g.add(n1);

    const n2 = new THREE.Mesh(nut, zinc);
    n2.position.set(x, n2Y, z);
    g.add(n2);
  });

  return g;
}
