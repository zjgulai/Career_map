// 3D 展示页：独立于工作视图，不参与 C-032 可读性验收。
// 透视 + 倾斜 + 深度只看空间关系，正文仍回工作视图或原卡。
import * as THREE from './vendor/three.module.min.js';
import { BOARD, layoutOrg, layoutNetwork } from './layout.js';

const G = window.SANBAO_GRAPH;
const stage = document.querySelector('#stage');
const side = document.querySelector('#side');

const LEVEL_COLOR = {
  ops: 0x9bb6a0, mgmt: 0x7fa9c9, control: 0xd6b070, platform: 0xa89cc4,
};
const PLATE = 4;
const TIER_H = { T0: 8, T1: 16, T2: 24, T3: 32, T4: 40 };
const tierHeight = t => TIER_H[t] || 20;

const org = layoutOrg(G.org);
const net = layoutNetwork(G.network);

const canvas = document.querySelector('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1512);
scene.fog = new THREE.Fog(0x0e1512, 2200, 4600);

const camera = new THREE.PerspectiveCamera(38, 1, 1, 8000);
camera.position.set(820, 900, 1500);

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
const key = new THREE.DirectionalLight(0xfff4e0, 1.6);
key.position.set(600, 1600, 900);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -1200; key.shadow.camera.right = 1200;
key.shadow.camera.top = 1200; key.shadow.camera.bottom = -1200;
key.shadow.camera.far = 4000;
const rim = new THREE.DirectionalLight(0x8fb6c9, 0.5);
rim.position.set(-900, 700, -800);
scene.add(ambient, key, rim);

// 地面
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(4200, 4200),
  new THREE.MeshStandardMaterial({ color: 0x121c18, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(4200, 42, 0x1f2f28, 0x18241f);
grid.position.y = -0.4;
scene.add(grid);

const orgGroup = new THREE.Group();
const netGroup = new THREE.Group();
scene.add(orgGroup, netGroup);

// ---- 组织：一级部门为楼层板，二级部门为区块台，席位为立柱 ----
const geoPlate = new THREE.BoxGeometry(1, PLATE, 1);
const matSeat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.05 });

function seatColor(seat) {
  const base = new THREE.Color(LEVEL_COLOR[seat.level1] || 0x9bb6a0);
  if (seat.status === 'PARTIAL') base.lerp(new THREE.Color(0xd6b070), 0.6);
  return base;
}

// 一级部门底板（分层：不同 y，让部门在垂直方向分开）
const levelY = new Map();
const bandOrder = [...org.bands].sort((a, b) => b.seat_count - a.seat_count);
bandOrder.forEach((b, i) => levelY.set(b.id, i * 26));

const seatMeshes = [];
const govMeshes = [];
for (const b of org.blocks) {
  const y = levelY.get(b.level1) ?? 0;
  const plate = new THREE.Mesh(geoPlate, new THREE.MeshStandardMaterial({
    color: new THREE.Color(LEVEL_COLOR[b.level1] || 0x9bb6a0).multiplyScalar(0.35).getHex(),
    roughness: 0.9, transparent: true, opacity: 0.9,
  }));
  plate.scale.set(b.w, 1, b.h);
  plate.position.set(b.x + b.w / 2, y + PLATE / 2, b.y + b.h / 2);
  plate.castShadow = true; plate.receiveShadow = true;
  orgGroup.add(plate);
}
for (const s of org.seats) {
  const y = levelY.get(s.level1) ?? 0;
  const h = tierHeight(s.tier);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(96, h, 46), new THREE.MeshStandardMaterial({
    color: seatColor(s), roughness: 0.62, metalness: 0.08,
    emissive: new THREE.Color(seatColor(s)).multiplyScalar(0.12),
  }));
  mesh.position.set(s.x + s.w / 2, y + PLATE + h / 2, s.y + s.h / 2);
  mesh.castShadow = true;
  mesh.userData = { kind: 'seat', id: s.id, h, top: y + PLATE + h };
  orgGroup.add(mesh);
  seatMeshes.push(mesh);
}
// 治理导轨：3 个 MGT 单独一排，抬到最高层
const govBaseY = Math.max(...bandOrder.map((b, i) => i * 26)) + 46;
org.governance.forEach((g, i) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(240, 10, 44),
    new THREE.MeshStandardMaterial({ color: 0xd8c99a, roughness: 0.45, metalness: 0.35,
      emissive: 0x3a3020 })
  );
  mesh.position.set(g.x + g.w / 2, govBaseY, g.y + g.h / 2);
  mesh.castShadow = true;
  mesh.userData = { kind: 'gov', id: g.id };
  govMeshes.push({ mesh, g });
  orgGroup.add(mesh);
});

// ---- 网络：节点为高柱，关系为空间曲线 ----
const netY = new Map();
net.nodes.forEach(n => netY.set(n.id, 0));
const nodeTop = new Map();
for (const n of net.nodes) {
  const y = netY.get(n.id);
  const h = 90 + Math.min(200, (n.pages ? n.pages.length : 1) * 9);
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(n.w * 0.20, h, n.h * 0.20),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe8e4d4).lerp(new THREE.Color(0x7fa9c9), Math.min(0.55, h / 500)),
      roughness: 0.62,
    })
  );
  nodeTop.set(n.id, h);
  mesh.position.set(n.x + n.w / 2, y + h / 2, n.y + n.h / 2);
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData = { kind: 'node', id: n.id };
  netGroup.add(mesh);
}

const edgeGroup = new THREE.Group();
netGroup.add(edgeGroup);
const EDGE_COLOR = { baseline: 0x4f9a7d, feedback: 0xc79a48, plain: 0x5d6a63 };
for (const e of net.edges) {
  if (!e) continue;
  const a = net.nodes.find(n => n.id === e.source);
  const b = net.nodes.find(n => n.id === e.target);
  if (!a || !b) continue;
  const ya = (nodeTop.get(a.id) || 90) + 4, yb = (nodeTop.get(b.id) || 90) + 4;
  const p0 = new THREE.Vector3(a.x + a.w / 2, ya, a.y + a.h / 2);
  const p1 = new THREE.Vector3(b.x + b.w / 2, yb, b.y + b.h / 2);
  const lift = 110 + p0.distanceTo(p1) * 0.20;
  const mid = p0.clone().add(p1).multiplyScalar(0.5);
  mid.y = Math.max(ya, yb) + lift;
  const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 28, 3.0, 6, false),
    new THREE.MeshBasicMaterial({
      color: EDGE_COLOR[e.kind] || 0x5d6a63,
      transparent: true,
      opacity: e.kind === 'plain' ? 0.22 : 0.62,
    })
  );
  edgeGroup.add(tube);
}

// ---- 相机控制：轨道 + 自动旋转（可关）----
const orbit = { theta: Math.PI * 0.25, phi: Math.PI * 0.32, radius: 1900, target: new THREE.Vector3(BOARD / 2, 60, BOARD / 2) };
let autoRotate = true;
let dragging = false, last = null;

function applyCamera() {
  const r = orbit.radius;
  const sinPhi = Math.sin(orbit.phi);
  camera.position.set(
    orbit.target.x + r * sinPhi * Math.cos(orbit.theta),
    orbit.target.y + r * Math.cos(orbit.phi),
    orbit.target.z + r * sinPhi * Math.sin(orbit.theta)
  );
  camera.lookAt(orbit.target);
}
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

stage.addEventListener('pointerdown', e => { dragging = true; last = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointermove', e => {
  if (!dragging || !last) return;
  orbit.theta -= (e.clientX - last.x) * 0.006;
  orbit.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, orbit.phi - (e.clientY - last.y) * 0.005));
  last = { x: e.clientX, y: e.clientY };
});
stage.addEventListener('pointerup', e => { dragging = false; last = null; stage.releasePointerCapture(e.pointerId); });
stage.addEventListener('wheel', e => {
  e.preventDefault();
  orbit.radius = Math.max(500, Math.min(4200, orbit.radius * Math.exp(e.deltaY * 0.0012)));
}, { passive: false });

// ---- 标签（DOM overlay，仅展示用） ----
const labelLayer = document.querySelector('#labels3d');
const labels = [];
function addLabel(text, x, y, z, cls) {
  const el = document.createElement('div');
  el.className = cls || 'lbl';
  el.textContent = text;
  labelLayer.appendChild(el);
  labels.push({ el, pos: new THREE.Vector3(x, y, z) });
}
for (const b of org.blocks) {
  const y = levelY.get(b.level1) ?? 0;
  addLabel(`${b.level2Name} · ${b.seats.length}`, b.x + b.w / 2, y + PLATE + 2, b.y + b.h / 2, 'lbl sub');
}
for (const band of org.bands) {
  addLabel(`${band.name} · ${band.seat_count}`, band.x + band.w - 90, (levelY.get(band.id) ?? 0) + 6, band.y - 16, 'lbl band');
}
for (const { g } of govMeshes) {
  addLabel(`${g.id} ${g.alias}`, g.x + g.w / 2, govBaseY + 16, g.y + g.h / 2, 'lbl gov');
}
const nodeLabels = [];
for (const n of net.nodes) {
  const el = document.createElement('div');
  el.className = 'lbl node';
  el.textContent = n.title;
  labelLayer.appendChild(el);
  nodeLabels.push({ el, pos: new THREE.Vector3(n.x + n.w / 2, (nodeTop.get(n.id) || 90) + 34, n.y + n.h / 2) });
}
function projectLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const v = new THREE.Vector3();
  const orgVisible = stage.dataset.view === 'org';
  for (const l of labels) {
    l.el.style.display = orgVisible ? '' : 'none';
    if (!orgVisible) continue;
    v.copy(l.pos).project(camera);
    place(l.el, v, w, h);
  }
  for (const l of nodeLabels) {
    l.el.style.display = orgVisible ? 'none' : '';
    if (orgVisible) continue;
    v.copy(l.pos).project(camera);
    place(l.el, v, w, h);
  }
}
function place(el, v, w, h) {
  if (v.z > 1) { el.style.opacity = 0; return; }
  el.style.opacity = 1;
  const half = (el.offsetWidth || 80) / 2 + 6;
  const x = Math.max(half, Math.min(w - half, (v.x * 0.5 + 0.5) * w));
  const y = Math.max(16, Math.min(h - 16, (-v.y * 0.5 + 0.5) * h));
  el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
}

// ---- 拾取 ----
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;
stage.addEventListener('pointermove', e => {
  const r = stage.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  const active = stage.dataset.view === 'network' ? netGroup : orgGroup;
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObjects(active.children, false).find(h => h.object.userData.kind);
  const el = hit ? hit.object : null;
  if (el !== hovered) {
    if (hovered) hovered.scale.y = 1, hovered.position.y = hovered.userData.baseY ?? hovered.position.y;
    hovered = el;
    if (hovered) { hovered.userData.baseY = hovered.position.y; hovered.position.y += 4; }
    stage.style.cursor = el ? 'pointer' : 'grab';
  }
});
stage.addEventListener('click', e => {
  if (!hovered) return;
  const { kind, id } = hovered.userData;
  showDetail(kind, id);
});

function showDetail(kind, id) {
  if (kind === 'seat') {
    const s = G.org.seats.find(x => x.seat_id === id);
    side.innerHTML = `<h2>${s.alias} · ${s.seat_id}</h2><p>${s.title}</p>
      <p><span class="tag">${s.plane}</span><span class="tag">${s.source_group}</span>
      <span class="tag">${s.tier}</span><span class="tag warn">${s.admission_status}</span></p>
      <p>生产授权：否 · 运行身份：否</p>`;
  } else if (kind === 'gov') {
    const g = G.org.governance.find(x => x.seat_id === id);
    side.innerHTML = `<h2>${g.alias} · ${g.seat_id}</h2><p>${g.title}</p>
      <p>治理参照：T4 决策权规则，不是 Agent 席位，不是部门。</p>`;
  } else if (kind === 'node') {
    const n = net.nodes.find(x => x.id === id);
    side.innerHTML = `<h2>${n.title}</h2><p>${n.short}</p><p><span class="tag">${n.codes}</span></p>
      <p>${n.pages.length} 张卡引用 · 主卡 ${n.primary_page || '—'}</p>`;
  }
}

// ---- 视图与循环 ----
stage.dataset.view = 'org';
netGroup.visible = false;
document.querySelectorAll('#views button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('active', b === btn));
  const v = btn.dataset.view;
  stage.dataset.view = v;
  orgGroup.visible = v === 'org';
  netGroup.visible = v === 'network';
  orbit.target.set(BOARD / 2, v === 'org' ? 60 : 40, BOARD / 2);
  orbit.radius = v === 'org' ? 1900 : 2500;
  orbit.phi = v === 'org' ? Math.PI * 0.32 : Math.PI * 0.40;
}));
document.querySelector('#toggle-rotate').addEventListener('click', e => {
  autoRotate = !autoRotate;
  e.currentTarget.textContent = autoRotate ? '暂停旋转' : '继续旋转';
  e.currentTarget.classList.toggle('active', autoRotate);
});

if (new URLSearchParams(location.search).get('view') === 'network') {
  const btn = document.querySelector('#views button[data-view=network]');
  if (btn) btn.click();
}
resize();
applyCamera();
const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  if (autoRotate && !dragging) orbit.theta += dt * 0.06;
  applyCamera();
  projectLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
document.querySelector('#gv').textContent = G.graph_version;
document.querySelector('#f-seats').textContent =
  `${G.org.seats.length + G.org.governance.length} 个可寻址席位（${G.org.seats.length} AGT + ${G.org.governance.length} MGT）`;
window.__sc = { renderer, scene, camera, resize, orbit, applyCamera, orgGroup, netGroup, THREE };
