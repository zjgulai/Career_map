// Polyfork 风格 Faceted Low-Poly 科技工装数字员工与 T4 钛金规则碑生成（1 unit = 1 cm，确定性哈希播种）
// 遵守证据纪律：全坐姿、静止无骨骼动画，3 个 MGT 仅生成规则碑不生成人形；色彩对齐 sagegogo.com。
import * as THREE from './vendor/three.module.min.js';
import { SAGE_DARK, hexToInt } from './theme.js?v=49';
import { renderPlaqueSvg } from './plaque.js?v=38';

export function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length) % arr.length];

const DEPT_COAT = {
  ops: hexToInt(SAGE_DARK.depts.ops.coat),
  mgmt: hexToInt(SAGE_DARK.depts.mgmt.coat),
  control: hexToInt(SAGE_DARK.depts.control.coat),
  platform: hexToInt(SAGE_DARK.depts.platform.coat),
};
const SKIN = [0xf2d6b8, 0xe8c5a0, 0xd9ab82, 0xc28d60, 0xa8724c, 0x8c5c3e];
const HAIR = [0x1c222b, 0x263140, 0x354254, 0x4b5869, 0x8b99ab];
const TIER_BADGE = { T0: 0xedb76c, T1: 0x74bfe8, T2: 0xaec8e2, T3: 0x89a9f1, T4: 0xedb76c };
const LANYARD = { UNVERIFIED: 0x396397, PARTIAL: 0xedb76c };

export function seatVisualTraits(seat) {
  const seatId = seat.seat_id || seat.id;
  const rnd = mulberry32(hash32(seatId));
  const dept = seat.level1 || 'ops';
  const coat = DEPT_COAT[dept] || DEPT_COAT.ops;
  const skin = pick(rnd, SKIN);
  const hair = pick(rnd, HAIR);
  const hScale = 0.96 + rnd() * 0.08;
  const girth = 0.92 + rnd() * 0.16;
  const hairStyle = Math.floor(rnd() * 6);
  const visor = rnd() < 0.48;
  const headset = rnd() < 0.55;
  const yaw = (rnd() - 0.5) * 0.16;
  return { seatId, dept, coat, skin, hair, hScale, girth, hairStyle, glasses: visor, headset, yaw };
}

export function renderAvatarSvg(seat, size = 32) {
  return renderPlaqueSvg(seat, size);
}

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _v = new THREE.Vector3(), _s = new THREE.Vector3(), _col = new THREE.Color();

function addGeo(parts, geo, color, pos, rot, scale) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0);
  _q.setFromEuler(_e);
  _s.set(scale ? scale[0] : 1, scale ? scale[1] : 1, scale ? scale[2] : 1);
  _v.set(pos[0], pos[1], pos[2]);
  _m4.compose(_v, _q, _s);
  g.applyMatrix4(_m4);
  g.computeVertexNormals();
  _col.setHex(color);
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { c[i * 3] = _col.r; c[i * 3 + 1] = _col.g; c[i * 3 + 2] = _col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  parts.push(g);
}

function mergeParts(parts) {
  let total = 0;
  for (const g of parts) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), colr = new Float32Array(total * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    colr.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  out.computeBoundingSphere();
  return out;
}

// Polyfork 风格低多边形棱柱四肢（6 边锥台，带清晰折面感）
function prismBetween(parts, a, b, rTop, rBot, color) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.max(0.1, Math.hypot(dx, dy, dz));
  const geo = new THREE.CylinderGeometry(rTop, rBot, len, 6, 1);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx / len, dy / len, dz / len)
  );
  const g = geo.toNonIndexed();
  _m4.compose(new THREE.Vector3(...mid), quat, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(_m4);
  g.computeVertexNormals();
  _col.setHex(color);
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { c[i * 3] = _col.r; c[i * 3 + 1] = _col.g; c[i * 3 + 2] = _col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  parts.push(g);
  geo.dispose();
}

// Polyfork 标志性 flatShading + vertexColors 共享材质
const personMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  flatShading: true,
  roughness: 0.62,
  metalness: 0.18,
});

export function createPerson(seat) {
  const tr = seatVisualTraits(seat);
  const { seatId, dept, coat, skin, hair, hScale, girth, hairStyle, glasses, headset, yaw } = tr;
  if (String(seatId).startsWith('MGT-')) {
    throw new Error('Prohibited: MGT T4 rule pack must never be passed to createPerson');
  }
  const coatC = new THREE.Color(coat);
  const jacket = coatC.clone().offsetHSL(0, -0.05, -0.18).getHex();
  const trim = coatC.clone().offsetHSL(0, 0.12, 0.14).getHex();
  const pants = 0x142033;
  const badge = TIER_BADGE[seat.tier] || TIER_BADGE.T2;
  const lanyard = LANYARD[seat.status] || LANYARD.UNVERIFIED;

  const HIP_Y = 47, HIP_Z = 30;
  const headY = 117 * hScale;
  const shoulderY = 96 * hScale;
  const parts = [];

  // 1) 多面体科技夹克躯干（6 棱台）+ 科技立领 + 发光胸条 + 骨盆
  addGeo(parts, new THREE.CylinderGeometry(11.8 * girth, 9.2 * girth, 36 * hScale, 6), jacket, [0, 72 * hScale, HIP_Z], null, [1.08, 1, 0.72]);
  addGeo(parts, new THREE.BoxGeometry(5.5 * girth, 30 * hScale, 1.5), trim, [0, 73 * hScale, HIP_Z - 7.8]);
  addGeo(parts, new THREE.CylinderGeometry(6.4 * girth, 5.2 * girth, 5.5, 6), trim, [0, shoulderY + 1.8, HIP_Z - 0.8]);
  addGeo(parts, new THREE.CylinderGeometry(9.2 * girth, 8.6 * girth, 10, 6), pants, [0, HIP_Y, HIP_Z], null, [1.05, 1, 0.78]);

  // 2) 颈 + 低多边形折面头部（8×6 分段）+ 耳 + 棱锥鼻
  addGeo(parts, new THREE.CylinderGeometry(3.5, 3.8, 7.5, 6), skin, [0, headY - 14.2 * hScale, HIP_Z]);
  addGeo(parts, new THREE.DodecahedronGeometry(11.2, 1), skin, [0, headY, HIP_Z], null, [0.92, 1.06, 0.90]);
  addGeo(parts, new THREE.BoxGeometry(2.2, 4.2, 2.6), skin, [-10.4, headY, HIP_Z]);
  addGeo(parts, new THREE.BoxGeometry(2.2, 4.2, 2.6), skin, [10.4, headY, HIP_Z]);
  addGeo(parts, new THREE.ConeGeometry(1.5, 3.6, 4), skin, [0, headY - 0.3, HIP_Z - 11.0], [-Math.PI / 2, 0, 0]);

  // 3) 眼 / 眉 / AR 光学镜片（Holo Visor） / 科技耳麦
  addGeo(parts, new THREE.BoxGeometry(2.2, 1.8, 1.2), 0x0b1521, [-3.5, headY + 1.4, HIP_Z - 10.1]);
  addGeo(parts, new THREE.BoxGeometry(2.2, 1.8, 1.2), 0x0b1521, [3.5, headY + 1.4, HIP_Z - 10.1]);
  addGeo(parts, new THREE.BoxGeometry(4.2, 0.9, 1.2), hair, [-3.5, headY + 3.6, HIP_Z - 10.3]);
  addGeo(parts, new THREE.BoxGeometry(4.2, 0.9, 1.2), hair, [3.5, headY + 3.6, HIP_Z - 10.3]);
  if (glasses) {
    // 冰蓝 AR 光学护目镜
    addGeo(parts, new THREE.BoxGeometry(15.2, 3.4, 1.0), 0x74bfe8, [0, headY + 1.5, HIP_Z - 10.9]);
    addGeo(parts, new THREE.BoxGeometry(16.0, 0.7, 1.2), 0xc4d0dc, [0, headY + 3.2, HIP_Z - 10.9]);
  }
  if (headset) {
    addGeo(parts, new THREE.BoxGeometry(2.6, 5.6, 4.6), 0xc4d0dc, [10.9, headY + 0.4, HIP_Z]);
    prismBetween(parts, [10.8, headY - 1.2, HIP_Z - 1], [4.2, headY - 4.5, HIP_Z - 10.8], 0.5, 0.5, 0x74bfe8);
  }

  // 4) 6 种低多边形发型
  if (hairStyle === 0) addGeo(parts, new THREE.SphereGeometry(11.6, 7, 4, 0, Math.PI * 2, 0, 1.15), hair, [0, headY + 0.6, HIP_Z - 0.4]);
  else if (hairStyle === 1) addGeo(parts, new THREE.SphereGeometry(11.5, 7, 4, 0, Math.PI * 2, 0, 1.02), hair, [1.1, headY + 2.0, HIP_Z - 0.4], [0, 0, -0.12]);
  else if (hairStyle === 2) addGeo(parts, new THREE.CylinderGeometry(10.2, 11.4, 7.5, 7), hair, [0, headY + 6.2, HIP_Z - 0.3]);
  else if (hairStyle === 3) {
    addGeo(parts, new THREE.SphereGeometry(11.5, 7, 4, 0, Math.PI * 2, 0, 0.95), hair, [0, headY + 1.2, HIP_Z - 0.4]);
    addGeo(parts, new THREE.DodecahedronGeometry(4.6, 0), hair, [0, headY + 13, HIP_Z + 2.2]);
  } else if (hairStyle === 4) {
    addGeo(parts, new THREE.SphereGeometry(11.7, 7, 4, 0, Math.PI * 2, 0, 1.25), hair, [0, headY + 0.4, HIP_Z]);
    addGeo(parts, new THREE.BoxGeometry(21, 9.5, 10), hair, [0, headY - 3.6, HIP_Z + 4.2]);
  } else {
    addGeo(parts, new THREE.SphereGeometry(11.5, 7, 4, 0, Math.PI * 2, 0, 0.92), hair, [-1.0, headY + 2.1, HIP_Z - 0.4], [0, 0, 0.14]);
  }

  // 5) 折面肩甲 + 四肢（坐姿打字）+ 发光工牌
  addGeo(parts, new THREE.DodecahedronGeometry(5.4, 0), trim, [-19 * girth, shoulderY, HIP_Z]);
  addGeo(parts, new THREE.DodecahedronGeometry(5.4, 0), trim, [19 * girth, shoulderY, HIP_Z]);
  for (const sx of [-10, 10]) {
    prismBetween(parts, [sx, HIP_Y, HIP_Z], [sx, HIP_Y, -10], 7.4 * girth, 6.2 * girth, pants);
    prismBetween(parts, [sx, HIP_Y, -10], [sx, 8, -10], 6.0 * girth, 4.8 * girth, pants);
    addGeo(parts, new THREE.BoxGeometry(10, 6.5, 24), 0x0b1521, [sx, 3.2, -21]);
    addGeo(parts, new THREE.BoxGeometry(10.2, 1.6, 24.4), 0xaec8e2, [sx, 0.8, -21]);
  }
  for (const sx of [-1, 1]) {
    const sh = [sx * 19 * girth, shoulderY, HIP_Z];
    const el = [sx * 20.5 * girth, 72, 19];
    const hd = [sx * 13 * girth, 75.5, -2];
    prismBetween(parts, sh, el, 4.6, 3.9, jacket);
    prismBetween(parts, el, hd, 3.8, 3.1, trim);
    addGeo(parts, new THREE.BoxGeometry(4.4, 2.8, 5.2), skin, hd);
  }
  addGeo(parts, new THREE.BoxGeometry(3.2, 4.4, 0.8), badge, [4.5, 87, HIP_Z - 8.2]);
  prismBetween(parts, [-3.2, 103, HIP_Z - 4.5], [4.0, 89, HIP_Z - 8.2], 0.5, 0.5, lanyard);
  prismBetween(parts, [3.8, 103, HIP_Z - 4.5], [5.0, 89, HIP_Z - 8.2], 0.5, 0.5, lanyard);

  const mesh = new THREE.Mesh(mergeParts(parts), personMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.y = yaw;
  mesh.userData = { kind: 'person', seatId, tier: seat.tier, status: seat.status, dept };
  return mesh;
}

// T4 钛金全息规则碑（MGT-001..003 专用，绝不生成坐姿人形或工位）
// 3 座规则碑共享两种材质，主题切换只改这两份
const plaqueBaseMat = new THREE.MeshStandardMaterial({
  color: 0x142033, roughness: 0.28, metalness: 0.86, flatShading: true,
});
const plaqueRimMat = new THREE.MeshStandardMaterial({
  color: 0xaec8e2, emissive: 0x396397, emissiveIntensity: 0.9, roughness: 0.22, metalness: 0.92,
});

export function setPersonTheme(palette) {
  const [base, rim, rimEmissive] = palette.plaque;
  plaqueBaseMat.color.set(base);
  plaqueRimMat.color.set(rim);
  plaqueRimMat.emissive.set(rimEmissive);
  plaqueRimMat.emissiveIntensity = palette.additive ? 0.9 : 0.35;
}

export function createPlaque(gov, w = 260, h = 92, d = 10) {
  const group = new THREE.Group();
  const baseMat = plaqueBaseMat;
  const rimMat = plaqueRimMat;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseMat);
  body.castShadow = true;
  body.userData = { kind: 'gov', id: gov.seat_id };
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 4, d + 4), rimMat);
  topBar.position.y = h / 2 + 2;
  topBar.userData = { kind: 'gov', id: gov.seat_id };
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 4, d + 4), rimMat);
  botBar.position.y = -h / 2 - 2;
  botBar.userData = { kind: 'gov', id: gov.seat_id };
  group.add(body, topBar, botBar);
  group.userData = { kind: 'gov', id: gov.seat_id };
  return group;
}
