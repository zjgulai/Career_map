// 程序化类人分身：只用 three 内置几何，1 unit = 1 cm。
// 全部坐姿、完全静止：不做呼吸/转头/行走，避免被读成「正在运行的员工」。
import * as THREE from './vendor/three.module.min.js';

// ---- 确定性随机：按 seat_id 播种，刷新后同一人长得一样 ----
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

// ---- 颜色表：衣服=部门，工牌=tier，挂绳=准入 ----
const DEPT_COAT = { ops: 0x6f8f7a, mgmt: 0x6f8ea8, control: 0xb08a52, platform: 0x8a7fa8 };
const SKIN = [0xf0d3b3, 0xe8c39e, 0xd9a97e, 0xc08a5c, 0xa9714a, 0x8a5a3c];
const HAIR = [0x2b2320, 0x3d2c22, 0x4a3a2c, 0x6b5540, 0x9a9188];
const TIER_BADGE = { T0: 0xd8c99a, T1: 0xa9bccb, T2: 0xc8c2b0, T3: 0x8d8a80, T4: 0xb08a52 };
const LANYARD = { UNVERIFIED: 0x3b4440, PARTIAL: 0xc79a48 };

// ---- 几何合并：把零件合进一个 BufferGeometry（带顶点色），每人 1 次 draw call ----
const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _col = new THREE.Color();

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

// 两点之间画一根胶囊（length 自动扣掉两端半径，否则四肢会明显变长）
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

const personMat = new THREE.MeshStandardMaterial({
  vertexColors: true, roughness: 0.86, metalness: 0.02,
});

/**
 * 一个 AGT 席位 → 一个合并 Mesh（坐姿）。
 * seat 需要 seat_id / alias / tier / admission_status / plane。
 * 返回的 mesh.userData = { kind:'person', seatId, tier, status, dept }
 */
export function createPerson(seat) {
  const seatId = seat.seat_id || seat.id;
  const rnd = mulberry32(hash32(seatId));
  const dept = seat.level1 || 'ops';
  const coat = (DEPT_COAT[dept] || DEPT_COAT.ops);
  const coatC = new THREE.Color(coat);
  const pants = coatC.clone().offsetHSL(0, -0.08, -0.14).getHex();
  const skin = pick(rnd, SKIN);
  const hair = pick(rnd, HAIR);
  const badge = TIER_BADGE[seat.tier] || TIER_BADGE.T2;
  const lanyard = LANYARD[seat.status] || LANYARD.UNVERIFIED;

  // 身高只作用于躯干/头/臂；腿长固定，保证脚落地、膝在桌下
  const hScale = 0.96 + rnd() * 0.08;
  const girth = 0.92 + rnd() * 0.16;
  const HIP_Y = 47, HIP_Z = 30;

  const parts = [];
  const headY = 117 * hScale;
  const shoulderY = 97 * hScale;

  // 躯干（Z 向压扁）
  addGeo(parts, new THREE.CapsuleGeometry(9.5 * girth, 33 * hScale, 1, 6), coat,
    [0, 73 * hScale, HIP_Z], null, [1, 1, 0.72]);
  // 骨盆
  addGeo(parts, new THREE.SphereGeometry(9 * girth, 5, 4), pants, [0, HIP_Y, HIP_Z]);
  // 颈 + 头 + 耳
  addGeo(parts, new THREE.CylinderGeometry(3.4, 3.6, 7, 6), skin, [0, headY - 14.5 * hScale, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(11, 10, 8), skin, [0, headY, HIP_Z], null, [0.94, 1.08, 0.92]);
  addGeo(parts, new THREE.SphereGeometry(2, 5, 4), skin, [-10.3, headY, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(2, 5, 4), skin, [10.3, headY, HIP_Z]);
  // 眼睛 / 眉 / 嘴（朝 -Z，即面向桌子）
  addGeo(parts, new THREE.SphereGeometry(1.3, 5, 4), 0x1b1917, [-3.3, headY + 1.5, HIP_Z - 10.4]);
  addGeo(parts, new THREE.SphereGeometry(1.3, 5, 4), 0x1b1917, [3.3, headY + 1.5, HIP_Z - 10.4]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), hair, [-3.3, headY + 3.5, HIP_Z - 10.6]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), hair, [3.3, headY + 3.5, HIP_Z - 10.6]);
  addGeo(parts, new THREE.BoxGeometry(4, 0.8, 1), 0x7a4a3c, [0, headY - 4.5, HIP_Z - 10.5]);
  // 头发（4 种：半球帽 / 偏分 / 短发 / 髻）
  const style = Math.floor(rnd() * 4);
  if (style === 0) addGeo(parts, new THREE.SphereGeometry(11.5, 8, 5, 0, Math.PI * 2, 0, 1.15), hair, [0, headY + 0.5, HIP_Z - 0.5]);
  else if (style === 1) addGeo(parts, new THREE.SphereGeometry(11.4, 8, 5, 0, Math.PI * 2, 0, 1.0), hair, [1.2, headY + 2.0, HIP_Z - 0.5], [0, 0, -0.12]);
  else if (style === 2) addGeo(parts, new THREE.SphereGeometry(11.3, 8, 5, 0, Math.PI * 2, 0, 0.72), hair, [0, headY + 2.6, HIP_Z - 0.5]);
  else { addGeo(parts, new THREE.SphereGeometry(11.4, 8, 5, 0, Math.PI * 2, 0, 0.95), hair, [0, headY + 1.2, HIP_Z - 0.5]); addGeo(parts, new THREE.SphereGeometry(4.5, 6, 5), hair, [0, headY + 13, HIP_Z + 2]); }

  // 肩
  addGeo(parts, new THREE.SphereGeometry(5, 5, 4), coat, [-19 * girth, shoulderY, HIP_Z]);
  addGeo(parts, new THREE.SphereGeometry(5, 5, 4), coat, [19 * girth, shoulderY, HIP_Z]);

  // 腿：髋 → 膝 → 踝（长度固定，不参与身高随机）
  for (const sx of [-10, 10]) {
    capsuleBetween(parts, [sx, HIP_Y, HIP_Z], [sx, HIP_Y, -10], 8 * girth, pants);
    capsuleBetween(parts, [sx, HIP_Y, -10], [sx, 8, -10], 6 * girth, pants);
    addGeo(parts, new THREE.BoxGeometry(10, 6, 24), 0x2a2b28, [sx, 3, -22]);
  }
  // 手臂：肩 → 肘 → 手（手落在桌面上方）
  for (const sx of [-1, 1]) {
    const sh = [sx * 19 * girth, shoulderY, HIP_Z];
    const el = [sx * 21 * girth, 70, 22];
    const hd = [sx * 22 * girth, 76, -2];
    capsuleBetween(parts, sh, el, 4.5, coat);
    capsuleBetween(parts, el, hd, 4, skin);
    addGeo(parts, new THREE.SphereGeometry(4, 5, 4), skin, hd);
  }

  // 工牌 + 挂绳（tier 色牌面 / 准入色绳）
  addGeo(parts, new THREE.BoxGeometry(2, 3, 0.4), badge, [2, 88, HIP_Z - 7]);
  capsuleBetween(parts, [-3, 104, HIP_Z - 4], [-0.7, 89, HIP_Z - 7], 0.7, lanyard);
  capsuleBetween(parts, [3, 104, HIP_Z - 4], [0.7, 89, HIP_Z - 7], 0.7, lanyard);

  const mesh = new THREE.Mesh(mergeParts(parts), personMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.y = (rnd() - 0.5) * 0.17; // 轻微朝向差异，不是动作
  mesh.userData = { kind: 'person', seatId, tier: seat.tier, status: seat.status, dept };
  return mesh;
}

/**
 * MGT → 铜牌（不是人）。位置由调用方给出。
 */
export function createPlaque(gov, w = 260, h = 84, d = 6) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a7038, roughness: 0.32, metalness: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.userData = { kind: 'gov', id: gov.seat_id };
  return mesh;
}
