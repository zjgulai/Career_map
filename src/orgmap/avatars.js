// 程序化类人分身与 SVG 肖像生成（1 unit = 1 cm，确定性哈希播种，刷新一致）。
// 遵守证据纪律：全坐姿、静止无动画，3 个 MGT 仅生成铜牌不生成人形。
import * as THREE from './vendor/three.module.min.js';

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

const DEPT_COAT = { ops: 0x6f8f7a, mgmt: 0x6f8ea8, control: 0xb08a52, platform: 0x8a7fa8 };
const SKIN = [0xf0d3b3, 0xe8c39e, 0xd9a97e, 0xc08a5c, 0xa9714a, 0x8a5a3c];
const HAIR = [0x2b2320, 0x3d2c22, 0x4a3a2c, 0x6b5540, 0x9a9188];
const TIER_BADGE = { T0: 0xd8c99a, T1: 0xa9bccb, T2: 0xc8c2b0, T3: 0x8d8a80, T4: 0xb08a52 };
const LANYARD = { UNVERIFIED: 0x3b4440, PARTIAL: 0xc79a48 };
const hexStr = n => '#' + n.toString(16).padStart(6, '0');

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
  const glasses = rnd() < 0.36;
  const yaw = (rnd() - 0.5) * 0.17;
  return { seatId, dept, coat, skin, hair, hScale, girth, hairStyle, glasses, yaw };
}

// 确定性 SVG 头像（用于侧栏与近景头像名片，MGT 返回铜牌图标）
export function renderAvatarSvg(seat, size = 32) {
  const seatId = seat.seat_id || seat.id || '';
  if (seatId.startsWith('MGT-')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="6" width="36" height="28" rx="5" fill="#2a2212" stroke="#c9a96a" stroke-width="2"/>
      <line x1="8" y1="15" x2="32" y2="15" stroke="#c9a96a" stroke-width="2"/>
      <line x1="8" y1="22" x2="26" y2="22" stroke="#9e8450" stroke-width="1.6"/>
      <circle cx="31" cy="24" r="3" fill="#c9a96a"/>
    </svg>`;
  }
  const t = seatVisualTraits(seat);
  const coat = hexStr(t.coat), skin = hexStr(t.skin), hair = hexStr(t.hair);
  let hairSvg = `<path d="M10 17 C10 8,30 8,30 17 Z" fill="${hair}"/>`;
  if (t.hairStyle === 1) hairSvg = `<path d="M9 18 C9 7,31 7,31 18 C27 13,16 13,9 18 Z" fill="${hair}"/>`;
  else if (t.hairStyle === 2) hairSvg = `<path d="M11 15 C12 8,28 8,29 15 Z" fill="${hair}"/>`;
  else if (t.hairStyle === 3) hairSvg = `<circle cx="20" cy="7" r="4.2" fill="${hair}"/><path d="M10 17 C10 9,30 9,30 17 Z" fill="${hair}"/>`;
  else if (t.hairStyle === 4) hairSvg = `<path d="M9 22 C8 9,32 9,31 22 L29 16 L11 16 Z" fill="${hair}"/>`;
  else if (t.hairStyle === 5) hairSvg = `<path d="M10 17 C11 7,29 7,30 17 L24 12 Z" fill="${hair}"/>`;
  const glassSvg = t.glasses
    ? `<rect x="12.5" y="16.2" width="6" height="4.2" rx="1" fill="none" stroke="#c8d2dc" stroke-width="1.1"/>
       <rect x="21.5" y="16.2" width="6" height="4.2" rx="1" fill="none" stroke="#c8d2dc" stroke-width="1.1"/>
       <line x1="18.5" y1="18" x2="21.5" y2="18" stroke="#c8d2dc" stroke-width="1.1"/>`
    : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="19" fill="#141c19" stroke="${coat}" stroke-width="1.6"/>
    <path d="M7 37 C8 27,32 27,33 37 Z" fill="${coat}"/>
    <polygon points="16,28 20,34 24,28" fill="#e6ece8"/>
    <circle cx="20" cy="18.5" r="8.8" fill="${skin}"/>
    ${hairSvg}
    <circle cx="15.8" cy="18.2" r="1.2" fill="#1b1917"/>
    <circle cx="24.2" cy="18.2" r="1.2" fill="#1b1917"/>
    ${glassSvg}
    <path d="M17.2 22.8 Q20 24.2 22.8 22.8" stroke="#6e4438" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  </svg>`;
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

function capsuleBetween(parts, a, b, r, color) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const seg = Math.max(0.01, len - 2 * r);
  const geo = new THREE.CapsuleGeometry(r, seg, 1, 5);
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx / len, dy / len, dz / len)
  );
  const g = geo.toNonIndexed();
  _m4.compose(new THREE.Vector3(...mid), quat, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(_m4);
  _col.setHex(color);
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { c[i * 3] = _col.r; c[i * 3 + 1] = _col.g; c[i * 3 + 2] = _col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  parts.push(g);
  geo.dispose();
}

const personMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, metalness: 0.03 });

export function createPerson(seat) {
  const tr = seatVisualTraits(seat);
  const { seatId, dept, coat, skin, hair, hScale, girth, hairStyle, glasses, yaw } = tr;
  const coatC = new THREE.Color(coat);
  const pants = coatC.clone().offsetHSL(0, -0.08, -0.14).getHex();
  const collar = coatC.clone().offsetHSL(0, -0.04, 0.16).getHex();
  const noseCol = new THREE.Color(skin).offsetHSL(0, 0.03, -0.05).getHex();
  const badge = TIER_BADGE[seat.tier] || TIER_BADGE.T2;
  const lanyard = LANYARD[seat.status] || LANYARD.UNVERIFIED;

  const HIP_Y = 47, HIP_Z = 30;
  const headY = 117 * hScale;
  const shoulderY = 97 * hScale;
  const parts = [];

  // 躯干 + 衬衫领口 + 骨盆
  addGeo(parts, new THREE.CapsuleGeometry(9.5 * girth, 33 * hScale, 1, 6), coat, [0, 73 * hScale, HIP_Z], null, [1, 1, 0.72]);
  addGeo(parts, new THREE.CylinderGeometry(5.8 * girth, 4.4 * girth, 4.2, 6), collar, [0, shoulderY + 1.5, HIP_Z - 1.2]);
  addGeo(parts, new THREE.SphereGeometry(9 * girth, 5, 4), pants, [0, HIP_Y, HIP_Z]);

  // 颈 + 头 + 耳 + 鼻
  addGeo(parts, new THREE.CylinderGeometry(3.4, 3.6, 7, 6), skin, [0, headY - 14.5 * hScale, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(11, 10, 8), skin, [0, headY, HIP_Z], null, [0.94, 1.08, 0.92]);
  addGeo(parts, new THREE.SphereGeometry(2, 5, 4), skin, [-10.3, headY, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(2, 5, 4), skin, [10.3, headY, HIP_Z]);
  addGeo(parts, new THREE.ConeGeometry(1.4, 3.4, 4), noseCol, [0, headY - 0.4, HIP_Z - 11.2], [-Math.PI / 2, 0, 0]);

  // 眼 / 眉 / 嘴 / 眼镜
  addGeo(parts, new THREE.SphereGeometry(1.35, 5, 4), 0x1b1917, [-3.4, headY + 1.5, HIP_Z - 10.3]);
  addGeo(parts, new THREE.SphereGeometry(1.35, 5, 4), 0x1b1917, [3.4, headY + 1.5, HIP_Z - 10.3]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), hair, [-3.4, headY + 3.6, HIP_Z - 10.5]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), hair, [3.4, headY + 3.6, HIP_Z - 10.5]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), 0x7a4a3c, [0, headY - 4.5, HIP_Z - 10.4]);
  if (glasses) {
    addGeo(parts, new THREE.BoxGeometry(4.6, 2.8, 0.6), 0xc8d2dc, [-3.5, headY + 1.5, HIP_Z - 11.1]);
    addGeo(parts, new THREE.BoxGeometry(4.6, 2.8, 0.6), 0xc8d2dc, [3.5, headY + 1.5, HIP_Z - 11.1]);
    addGeo(parts, new THREE.BoxGeometry(2.4, 0.6, 0.6), 0xc8d2dc, [0, headY + 1.7, HIP_Z - 11.1]);
  }

  // 6 种发型
  if (hairStyle === 0) addGeo(parts, new THREE.SphereGeometry(11.5, 8, 5, 0, Math.PI * 2, 0, 1.15), hair, [0, headY + 0.5, HIP_Z - 0.5]);
  else if (hairStyle === 1) addGeo(parts, new THREE.SphereGeometry(11.4, 8, 5, 0, Math.PI * 2, 0, 1.0), hair, [1.2, headY + 2.0, HIP_Z - 0.5], [0, 0, -0.12]);
  else if (hairStyle === 2) addGeo(parts, new THREE.SphereGeometry(11.3, 8, 5, 0, Math.PI * 2, 0, 0.72), hair, [0, headY + 2.6, HIP_Z - 0.5]);
  else if (hairStyle === 3) {
    addGeo(parts, new THREE.SphereGeometry(11.4, 8, 5, 0, Math.PI * 2, 0, 0.95), hair, [0, headY + 1.2, HIP_Z - 0.5]);
    addGeo(parts, new THREE.SphereGeometry(4.5, 6, 5), hair, [0, headY + 13, HIP_Z + 2]);
  } else if (hairStyle === 4) {
    addGeo(parts, new THREE.SphereGeometry(11.6, 8, 5, 0, Math.PI * 2, 0, 1.25), hair, [0, headY + 0.4, HIP_Z]);
    addGeo(parts, new THREE.BoxGeometry(21, 9, 10), hair, [0, headY - 3.5, HIP_Z + 4]);
  } else {
    addGeo(parts, new THREE.SphereGeometry(11.4, 8, 5, 0, Math.PI * 2, 0, 0.9), hair, [-1.0, headY + 2.1, HIP_Z - 0.5], [0, 0, 0.14]);
  }

  // 肩 + 四肢 + 工牌
  addGeo(parts, new THREE.SphereGeometry(5, 5, 4), coat, [-19 * girth, shoulderY, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(5, 5, 4), coat, [19 * girth, shoulderY, HIP_Z]);
  for (const sx of [-10, 10]) {
    capsuleBetween(parts, [sx, HIP_Y, HIP_Z], [sx, HIP_Y, -10], 8 * girth, pants);
    capsuleBetween(parts, [sx, HIP_Y, -10], [sx, 8, -10], 6 * girth, pants);
    addGeo(parts, new THREE.BoxGeometry(10, 6, 24), 0x2a2b28, [sx, 3, -22]);
  }
  for (const sx of [-1, 1]) {
    const sh = [sx * 19 * girth, shoulderY, HIP_Z];
    const el = [sx * 21 * girth, 70, 22];
    const hd = [sx * 22 * girth, 76, -2];
    capsuleBetween(parts, sh, el, 4.5, coat);
    capsuleBetween(parts, el, hd, 4, skin);
    addGeo(parts, new THREE.SphereGeometry(4, 5, 4), skin, hd);
  }
  addGeo(parts, new THREE.BoxGeometry(2.4, 3.4, 0.5), badge, [2, 88, HIP_Z - 7]);
  capsuleBetween(parts, [-3, 104, HIP_Z - 4], [-0.7, 89, HIP_Z - 7], 0.7, lanyard);
  capsuleBetween(parts, [3, 104, HIP_Z - 4], [0.7, 89, HIP_Z - 7], 0.7, lanyard);

  const mesh = new THREE.Mesh(mergeParts(parts), personMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.y = yaw;
  mesh.userData = { kind: 'person', seatId, tier: seat.tier, status: seat.status, dept };
  return mesh;
}

export function createPlaque(gov, w = 260, h = 84, d = 6) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a7038, roughness: 0.32, metalness: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.userData = { kind: 'gov', id: gov.seat_id };
  return mesh;
}
