// 三宝组织空间 3D 展示页：1 unit = 1 cm 的建筑剖切表现图。
// 设计态展示，不是运行系统。人物完全静止；MGT 只是铜牌，不是人。
import * as THREE from './vendor/three.module.min.js';
import { layoutOrg, layoutNetwork } from './layout.js?v=14';
import { createPerson, createPlaque } from './avatars.js?v=14';
import { buildFlowLines } from './flow.js?v=14';

const G = window.SANBAO_GRAPH;
const stage = document.querySelector('#stage');
const side = document.querySelector('#side');
const labelLayer = document.querySelector('#labels3d');

// ---------- 布局：复用工作视图算法，换厘米级尺寸 ----------
const OFFICE = { cellW: 148, cellH: 104, pad: 20, labelH: 44, blockGap: 64,
                 bandGap: 150, bandTitleH: 64, margin: 60, maxW: 2100, board: 2300 };
const org = layoutOrg(G.org, OFFICE);
const net = layoutNetwork(G.network);

const PLANE2DEPT = { 经营管理: 'mgmt', 业务运营: 'ops', 独立控制: 'control', '数据与Agent平台': 'platform' };
const DEPT = {
  ops:      { fill: 0x1f2a24, edge: 0x476b56, name: '业务运营', coat: 0x6f8f7a },
  mgmt:     { fill: 0x202730, edge: 0x4f6d85, name: '经营管理', coat: 0x6f8ea8 },
  control:  { fill: 0x2a2519, edge: 0x8a6f3c, name: '独立控制', coat: 0xb08a52 },
  platform: { fill: 0x26222c, edge: 0x6b6285, name: '数据与Agent平台', coat: 0x8a7fa8 },
};

// 地面边界（由 band 现算）
const bx = org.bands.flatMap(b => [b.x, b.x + b.w]);
const bz = org.bands.flatMap(b => [b.y, b.y + b.h]);
const F = { x0: Math.min(...bx) - 100, x1: Math.max(...bx) + 100,
            z0: Math.min(...bz) - 380, z1: Math.max(...bz) + 300 };
const FCX = (F.x0 + F.x1) / 2, FCZ = (F.z0 + F.z1) / 2;
const FW = F.x1 - F.x0, FD = F.z1 - F.z0;

// 分区外框
const ZONE = {};
for (const b of org.blocks) {
  const z = ZONE[b.level1] ||= { x0: Infinity, x1: -Infinity, z0: Infinity, z1: -Infinity, n: 0 };
  z.x0 = Math.min(z.x0, b.x - 70); z.x1 = Math.max(z.x1, b.x + b.w + 70);
  z.z0 = Math.min(z.z0, b.y - 70); z.z1 = Math.max(z.z1, b.y + b.h + 70);
  z.n += b.seats.length;
}

// ---------- 渲染器与场景基调 ----------
const canvas = document.querySelector('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const PR = Math.min(devicePixelRatio || 1, 1.75);
renderer.setPixelRatio(PR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1215);
scene.fog = new THREE.Fog(0x0f1215, 3600, 8200);

// 程序化环境贴图：金属高光的唯一来源
function envTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 32);
  grd.addColorStop(0.00, '#93a9bd');
  grd.addColorStop(0.46, '#cfc8b6');
  grd.addColorStop(0.54, '#4a4842');
  grd.addColorStop(1.00, '#121417');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 32);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
scene.environment = envTexture();
scene.environmentIntensity = 0.5;

// 地毯纹理：纯色地面是廉价感的第一来源
function carpetTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#2b2f33'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 24000; i++) {
    const v = 32 + ((Math.random() * 24) | 0);
    g.fillStyle = `rgba(${v},${v + 2},${v + 4},0.5)`;
    g.fillRect((Math.random() * S) | 0, (Math.random() * S) | 0, 2, 2);
  }
  g.strokeStyle = 'rgba(18,20,22,0.55)'; g.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, S); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(S, i * 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(FW / 200, FD / 200);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function glowTexture() {
  const S = 64, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(255,242,220,0.95)');
  grd.addColorStop(0.4, 'rgba(255,236,205,0.30)');
  grd.addColorStop(1, 'rgba(255,230,196,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- 材质 ----------
const MAT = {
  desk: new THREE.MeshStandardMaterial({ color: 0x41474d, roughness: 0.50, metalness: 0.35 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.38, metalness: 0.80 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0f1316, roughness: 0.15, metalness: 0.10 }),
  seat: new THREE.MeshStandardMaterial({ color: 0x2a3036, roughness: 0.92, metalness: 0.04 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xb9d6d4, roughness: 0.06, metalness: 0.0,
    transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }),
  rail: new THREE.MeshStandardMaterial({ color: 0x8d949a, roughness: 0.34, metalness: 0.85 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x1b1f23, roughness: 0.88, metalness: 0.04 }),
  pedestal: new THREE.MeshStandardMaterial({ color: 0x3d4650, roughness: 0.42, metalness: 0.45 }),
  cap: new THREE.MeshStandardMaterial({ color: 0xe8e4d4, roughness: 0.45, metalness: 0.15 }),
  plant: new THREE.MeshStandardMaterial({ color: 0x35513f, roughness: 0.9 }),
  pot: new THREE.MeshStandardMaterial({ color: 0x2c2f31, roughness: 0.85 }),
};

// ---------- 分组 ----------
const archGroup = new THREE.Group();
const orgOnly = new THREE.Group();
const netGroup = new THREE.Group();
netGroup.position.set(FCX - 800, 0, FCZ - 800); // 网络板 1600 对齐地面中心
const lightGroup = new THREE.Group();
scene.add(archGroup, orgOnly, netGroup, lightGroup);

// ---------- 地面与分区地毯 ----------
(function buildFloor() {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(FW, 18, FD),
    new THREE.MeshStandardMaterial({ map: carpetTexture(), roughness: 0.95, metalness: 0.02 }));
  slab.position.set(FCX, -9, FCZ);
  slab.receiveShadow = true;
  archGroup.add(slab);

  for (const [id, z] of Object.entries(ZONE)) {
    const d = DEPT[id] || DEPT.ops;
    const w = z.x1 - z.x0, dd = z.z1 - z.z0;
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(w, dd),
      new THREE.MeshBasicMaterial({ color: d.edge, transparent: true, opacity: 0.22, depthWrite: false }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(z.x0 + w / 2, 0.3, z.z0 + dd / 2);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(w - 16, dd - 16),
      new THREE.MeshBasicMaterial({ color: d.fill, transparent: true, opacity: 0.92, depthWrite: false }));
    fill.rotation.x = -Math.PI / 2;
    fill.position.set(z.x0 + w / 2, 0.4, z.z0 + dd / 2);
    orgOnly.add(edge, fill);
  }
})();

// ---------- 玻璃隔断 ----------
(function buildGlass() {
  const panes = [], rails = [];
  for (const [id, z] of Object.entries(ZONE)) {
    const isOps = id === 'ops';
    const h = isOps ? 48 : 120;
    const t = isOps ? 1.4 : 2;
    const inset = isOps ? 0 : 6;
    const x0 = z.x0 + inset, x1 = z.x1 - inset, z0 = z.z0 + inset, z1 = z.z1 - inset;
    // 北/南/东/西 四边；ops 南边留中央开口
    const segs = [
      [x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1],
    ];
    for (const [ax, az, bx2, bz2] of segs) {
      const len = Math.hypot(bx2 - ax, bz2 - az);
      if (isOps && Math.abs(az - z1) < 1 && Math.abs(bz2 - z1) < 1) {
        // 南边分两段，留 240 中央开口
        const gap = 240, half = (len - gap) / 2;
        panes.push({ ax, az, len: half, rot: 0, h, cx: ax + half / 2, cz: az });
        panes.push({ ax: ax + half + gap, az, len: half, rot: 0, h, cx: ax + half + gap + half / 2, cz: az });
        rails.push({ ax, az, len: half, cx: ax + half / 2, cz: az, h });
        rails.push({ ax: ax + half + gap, az, len: half, cx: ax + half + gap + half / 2, cz: az, h });
      } else {
        const horiz = Math.abs(az - bz2) < 1;
        panes.push({ ax, az, len, rot: horiz ? 0 : Math.PI / 2, h,
                     cx: (ax + bx2) / 2, cz: (az + bz2) / 2 });
        rails.push({ ax, az, len, cx: (ax + bx2) / 2, cz: (az + bz2) / 2, h });
      }
    }
  }
  const paneGeo = new THREE.PlaneGeometry(1, 1);
  const paneMesh = new THREE.InstancedMesh(paneGeo, MAT.glass, panes.length);
  const railGeo = new THREE.BoxGeometry(1, 6, 5);
  const railMesh = new THREE.InstancedMesh(railGeo, MAT.rail, rails.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  panes.forEach((p, i) => {
    // 高度随所属分区：业务运营矮屏 48，其余 3 个套间 120
    e.set(0, p.rot, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(p.cx, p.h / 2, p.cz), q, new THREE.Vector3(p.len, p.h, 1));
    paneMesh.setMatrixAt(i, m);
  });
  rails.forEach((r, i) => {
    e.set(0, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(r.cx, r.h, r.cz), q, new THREE.Vector3(r.len, 1, 1));
    railMesh.setMatrixAt(i, m);
  });
  paneMesh.frustumCulled = false; railMesh.frustumCulled = false;
  orgOnly.add(paneMesh, railMesh);
})();

// ---------- 部门门牌 ----------
(function buildSigns() {
  const entries = Object.entries(ZONE);
  const postGeo = new THREE.BoxGeometry(12, 130, 60);
  const stripGeo = new THREE.BoxGeometry(12, 3, 58);
  const posts = new THREE.InstancedMesh(postGeo, MAT.stone, entries.length);
  const strips = new THREE.InstancedMesh(stripGeo,
    new THREE.MeshStandardMaterial({ color: 0xfff2dc, emissive: 0xfff2dc, emissiveIntensity: 1.2 }), entries.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  entries.forEach(([id, z], i) => {
    const x = z.x0 + 40, zz = z.z1 + 75;
    m.compose(new THREE.Vector3(x, 65, zz), q, new THREE.Vector3(1, 1, 1));
    posts.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(x, 131, zz), q, new THREE.Vector3(1, 1, 1));
    strips.setMatrixAt(i, m);
  });
  posts.frustumCulled = false; strips.frustumCulled = false;
  posts.castShadow = true;
  orgOnly.add(posts, strips);
})();

// ---------- 接待区（尺度参照） ----------
(function buildReception() {
  const g = new THREE.Group();
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(300, 180),
    new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.98 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(FCX, 0.5, F.z1 - 120);
  g.add(rug);
  const sofa = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(170, 45, 70), MAT.seat);
  base.position.y = 22.5; sofa.add(base);
  const back = new THREE.Mesh(new THREE.BoxGeometry(170, 40, 12), MAT.seat);
  back.position.set(0, 60, 29); sofa.add(back);
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(12, 18, 70), MAT.seat);
    arm.position.set(sx * 79, 54, 0); sofa.add(arm);
  }
  sofa.position.set(FCX - 90, 0, F.z1 - 120);
  sofa.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.add(sofa);
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(90, 4, 42), MAT.desk);
  top.position.y = 40; table.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(4, 38, 4), MAT.metal);
    leg.position.set(sx * 40, 19, sz * 16); table.add(leg);
  }
  table.position.set(FCX + 40, 0, F.z1 - 120);
  g.add(table);
  for (const [i, sx] of [[0, -200], [1, 200]]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(16, 12, 26, 10), MAT.pot);
    pot.position.set(FCX + sx, 13, F.z1 - 130);
    pot.castShadow = true;
    g.add(pot);
    for (let k = 0; k < 3; k++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(16 - k * 3, 46, 7), MAT.plant);
      leaf.position.set(FCX + sx, 44 + k * 22, F.z1 - 130);
      leaf.castShadow = true;
      g.add(leaf);
    }
  }
  orgOnly.add(g);
})();

// ---------- 治理墙 + 3 块铜牌（MGT 不是人） ----------
const govMeshes = [];
(function buildGovernance() {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1080, 180, 24), MAT.stone);
  wall.position.set(FCX, 90, F.z0 + 289 - 380 + 0); // 置于北侧
  wall.position.z = Math.min(...bz) - 230;
  wall.castShadow = true; wall.receiveShadow = true;
  archGroup.add(wall);
  const zz = wall.position.z + 15;
  G.org.governance.forEach((gv, i) => {
    const plaque = createPlaque(gv, 260, 84, 6);
    plaque.position.set(FCX + (i - 1) * 320, 96, zz);
    archGroup.add(plaque);
    govMeshes.push(plaque);
  });
})();

// ---------- 工位家具（InstancedMesh） ----------
const deskSeatMap = [];
(function buildWorkstations() {
  const seats = org.seats;
  const n = seats.length;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const deskGeo = new THREE.BoxGeometry(132, 4, 64);
  const legGeo = new THREE.BoxGeometry(6, 70, 56);
  const dividerGeo = new THREE.BoxGeometry(132, 16, 3);
  const monGeo = new THREE.BoxGeometry(58, 32, 3);
  const monFootGeo = new THREE.BoxGeometry(16, 8, 10);
  const seatGeo = new THREE.BoxGeometry(42, 5, 40);
  const backGeo = new THREE.BoxGeometry(42, 42, 5);
  const postGeo = new THREE.CylinderGeometry(3, 3, 44, 8);
  const baseGeo = new THREE.CylinderGeometry(16, 16, 3, 10);

  const desks = new THREE.InstancedMesh(deskGeo, MAT.desk, n);
  const legs = new THREE.InstancedMesh(legGeo, MAT.metal, n * 2);
  const dividers = new THREE.InstancedMesh(dividerGeo, MAT.metal, n);
  const mons = new THREE.InstancedMesh(monGeo, MAT.screen, n);
  const monFeet = new THREE.InstancedMesh(monFootGeo, MAT.metal, n);
  const chairs = new THREE.InstancedMesh(seatGeo, MAT.seat, n);
  const backs = new THREE.InstancedMesh(backGeo, MAT.seat, n);
  const posts = new THREE.InstancedMesh(postGeo, MAT.metal, n);
  const bases = new THREE.InstancedMesh(baseGeo, MAT.metal, n);

  seats.forEach((s, i) => {
    const cx = s.x + s.w / 2, cz = s.y + s.h / 2;
    deskSeatMap[i] = s.id;
    e.set(0, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx, 72, cz - 22), q, new THREE.Vector3(1, 1, 1));
    desks.setMatrixAt(i, m);
    for (const [j, sx] of [[0, -54], [1, 54]]) {
      m.compose(new THREE.Vector3(cx + sx, 35, cz - 22), q, new THREE.Vector3(1, 1, 1));
      legs.setMatrixAt(i * 2 + j, m);
    }
    m.compose(new THREE.Vector3(cx, 82, cz - 52), q, new THREE.Vector3(1, 1, 1));
    dividers.setMatrixAt(i, m);
    e.set(-0.14, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx, 90, cz - 38), q, new THREE.Vector3(1, 1, 1));
    mons.setMatrixAt(i, m);
    e.set(0, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx, 78, cz - 32), q, new THREE.Vector3(1, 1, 1));
    monFeet.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 44, cz + 30), q, new THREE.Vector3(1, 1, 1));
    chairs.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 65, cz + 47), q, new THREE.Vector3(1, 1, 1));
    backs.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 22, cz + 30), q, new THREE.Vector3(1, 1, 1));
    posts.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 1.5, cz + 30), q, new THREE.Vector3(1, 1, 1));
    bases.setMatrixAt(i, m);
  });
  for (const im of [desks, legs, dividers, mons, monFeet, chairs, backs, posts, bases]) {
    im.frustumCulled = false;
    im.castShadow = true; im.receiveShadow = true;
    orgOnly.add(im);
  }
})();

// ---------- 50 个分身 ----------
const peopleGroup = new THREE.Group();
const personBySeat = new Map();
(function buildPeople() {
  for (const s of org.seats) {
    const p = createPerson({ ...s, seat_id: s.id, level1: s.level1, status: s.status, tier: s.tier });
    const cx = s.x + s.w / 2, cz = s.y + s.h / 2;
    p.position.set(cx, 0, cz);
    peopleGroup.add(p);
    personBySeat.set(s.id, p);
  }
  orgOnly.add(peopleGroup);
})();

// ---------- 网络台座 + 流动线 ----------
const pedestalSeatMap = [];
let flow = null;
(function buildNetwork() {
  const nodes = net.nodes;
  const n = nodes.length;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const pedGeo = new THREE.BoxGeometry(46, 1, 46);
  const capGeo = new THREE.BoxGeometry(58, 4, 58);
  const bandGeo = new THREE.BoxGeometry(48, 3, 48);
  const peds = new THREE.InstancedMesh(pedGeo, MAT.pedestal, n);
  const caps = new THREE.InstancedMesh(capGeo, MAT.cap, n);
  const bands = new THREE.InstancedMesh(bandGeo,
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x7fb8c8, emissiveIntensity: 2.2 }), n);
  const hOf = nd => 70 + (nd.pages ? nd.pages.length : 1) * 6;
  nodes.forEach((nd, i) => {
    const cx = nd.x + nd.w / 2, cz = nd.y + nd.h / 2, h = hOf(nd);
    pedestalSeatMap[i] = nd.id;
    m.compose(new THREE.Vector3(cx, h / 2, cz), q, new THREE.Vector3(1, h, 1));
    peds.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, h + 2, cz), q, new THREE.Vector3(1, 1, 1));
    caps.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 6, cz), q, new THREE.Vector3(1, 1, 1));
    bands.setMatrixAt(i, m);
  });
  for (const im of [peds, caps, bands]) { im.frustumCulled = false; im.castShadow = true; netGroup.add(im); }

  flow = buildFlowLines(net.nodes, G.network.relations);
  flow.setPixelRatio(PR);
  netGroup.add(flow.group);
})();

// ---------- 灯光 ----------
(function buildLights() {
  lightGroup.add(new THREE.HemisphereLight(0xc8d8e8, 0x191b1e, 0.55));
  const key = new THREE.DirectionalLight(0xfff0da, 2.4);
  key.position.set(FCX - 210, 1900, FCZ - 510);
  key.target.position.set(FCX, 0, FCZ);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -1500; key.shadow.camera.right = 1500;
  key.shadow.camera.top = 1500; key.shadow.camera.bottom = -1500;
  key.shadow.camera.near = 300; key.shadow.camera.far = 4600;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.8;
  lightGroup.add(key, key.target);

  const fill = new THREE.DirectionalLight(0x9cc2dc, 0.6);
  fill.position.set(FCX + 1200, 800, FCZ + 900);
  lightGroup.add(fill);

  // 点光：1 unit=1cm 时必须 decay=0，否则 300 unit 外直接归零
  for (const [dx, dz] of [[-410, -610], [390, -610], [-410, 590], [390, 590]]) {
    const pl = new THREE.PointLight(0xffe6c4, 0.8, 1800, 0);
    pl.position.set(FCX + dx, 300, FCZ + dz);
    lightGroup.add(pl);
  }

  // 吊装灯带 + 加法光晕
  const glow = glowTexture();
  for (const dz of [-610, 590]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(420, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x2a2e32, emissive: 0xfff2dc, emissiveIntensity: 1.8 }));
    rail.position.set(FCX, 280, FCZ + dz);
    orgOnly.add(rail);
    for (const dx of [-210, 210]) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glow, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.scale.set(260, 90, 1);
      sp.position.set(FCX + dx, 272, FCZ + dz);
      orgOnly.add(sp);
    }
  }
})();

// ---------- DOM 标签 ----------
const labels = [];
function addLabel(text, pos, cls, data) {
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  if (data) Object.assign(el.dataset, data);
  labelLayer.appendChild(el);
  labels.push({ el, pos: pos.clone(), kind: data ? data.kind : 'misc', shown: true });
  return el;
}
(function buildLabels() {
  for (const b of org.bands) addLabel(`${b.name} · ${b.seat_count} 席`,
    new THREE.Vector3(b.x + 4, 30, b.y - 20), 'lbl band', { kind: 'band' });
  for (const b of org.blocks) addLabel(`${b.level2Name} · ${b.seats.length}`,
    new THREE.Vector3(b.x + b.w / 2, 26, b.y + 20), 'lbl sub', { kind: 'sub' });
  const wallZ = Math.min(...bz) - 230;
  G.org.governance.forEach((gv, i) => addLabel(`${gv.seat_id} ${gv.alias}`,
    new THREE.Vector3(FCX + (i - 1) * 320, 152, wallZ + 15), 'lbl gov', { kind: 'gov', id: gv.seat_id }));
  addLabel('T4 决策权规则包 · 非 Agent 席位',
    new THREE.Vector3(FCX, 196, wallZ + 15), 'lbl gov', { kind: 'govnote' });
  for (const nd of net.nodes) addLabel(nd.title,
    new THREE.Vector3(nd.x + nd.w / 2, 70 + (nd.pages ? nd.pages.length : 1) * 6 + 34, nd.y + nd.h / 2),
    'lbl node', { kind: 'node', id: nd.id });
  // 席位标签：50 个都建，按相机距离动态显隐（最多 20 个）
  for (const s of org.seats) addLabel(`${s.alias}`,
    new THREE.Vector3(s.x + s.w / 2, 140, s.y + s.h / 2), 'lbl seat', { kind: 'seat', id: s.id });
})();

// ---------- 相机 ----------
const camera = new THREE.PerspectiveCamera(35, 1, 10, 12000);
const orbit = {
  theta: Math.PI * 0.25, phi: Math.PI * 0.31, radius: 3500,
  target: new THREE.Vector3(FCX, 60, FCZ),
};
let autoRotate = true;
let dragging = false, last = null, moved = 0;

function applyCamera() {
  const r = orbit.radius, sp = Math.sin(orbit.phi);
  camera.position.set(
    orbit.target.x + r * sp * Math.cos(orbit.theta),
    orbit.target.y + r * Math.cos(orbit.phi),
    orbit.target.z + r * sp * Math.sin(orbit.theta)
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
resize();

stage.addEventListener('pointerdown', e => {
  dragging = true; last = { x: e.clientX, y: e.clientY }; moved = 0;
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', e => {
  if (!dragging || !last) return;
  const dx = e.clientX - last.x, dy = e.clientY - last.y;
  moved += Math.abs(dx) + Math.abs(dy);
  orbit.theta -= dx * 0.006;
  orbit.phi = Math.max(0.12, Math.min(1.48, orbit.phi - dy * 0.005));
  last = { x: e.clientX, y: e.clientY };
});
stage.addEventListener('pointerup', e => {
  dragging = false; last = null;
  try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
});
stage.addEventListener('wheel', e => {
  e.preventDefault();
  orbit.radius = Math.max(800, Math.min(6000, orbit.radius * Math.exp(e.deltaY * 0.0012)));
}, { passive: false });

// ---------- 拾取 ----------
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let hovered = null;

function pickAt(clientX, clientY) {
  const r = stage.getBoundingClientRect();
  ptr.x = ((clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const active = stage.dataset.view === 'network' ? netGroup : orgOnly;
  const hits = ray.intersectObjects(active.children, true);
  for (const h of hits) {
    const o = h.object;
    if (o.userData && o.userData.kind === 'person') return { kind: 'seat', id: o.userData.seatId };
    if (o.userData && o.userData.kind === 'gov') return { kind: 'gov', id: o.userData.id };
    if (o.isInstancedMesh && o.instanceId != null) {
      const map = stage.dataset.view === 'network' ? pedestalSeatMap : deskSeatMap;
      const id = map[o.instanceId];
      if (id) return stage.dataset.view === 'network' ? { kind: 'node', id } : { kind: 'seat', id };
    }
  }
  return null;
}

stage.addEventListener('pointermove', e => {
  const hit = pickAt(e.clientX, e.clientY);
  const key = hit ? `${hit.kind}:${hit.id}` : null;
  if (key !== hovered) {
    if (hovered) {
      const [pk, pid] = hovered.split(':');
      if (pk === 'seat') { const p = personBySeat.get(pid); if (p) p.scale.setScalar(1); }
      if (flow) flow.setHover(null);
    }
    hovered = key;
    if (hit) {
      if (hit.kind === 'seat') { const p = personBySeat.get(hit.id); if (p) p.scale.setScalar(1.03); }
      if (hit.kind === 'node' && flow) flow.setHover(hit.id);
    }
    stage.style.cursor = hit ? 'pointer' : 'grab';
  }
});
stage.addEventListener('click', e => {
  if (moved > 6) return;
  const hit = pickAt(e.clientX, e.clientY);
  if (hit) showDetail(hit.kind, hit.id);
});

// ---------- 详情 ----------
const SEAT_MAP = new Map([...G.org.seats, ...G.org.governance].map(s => [s.seat_id, s]));

function showDetail(kind, id) {
  if (kind === 'seat') {
    const s = SEAT_MAP.get(id);
    if (!s) return;
    const links = s.node_links || [];
    side.innerHTML = `<h2>${s.alias} · ${s.seat_id}</h2>
      <p>${s.title}</p>
      <p><span class="tag">${s.plane}</span><span class="tag">${s.source_group}</span>
      <span class="tag">${s.tier}</span><span class="tag warn">${s.admission_status}</span></p>
      <p>能力站位：${s.slot_id} · ${s.slot_title}</p>
      <p>目标运行层：<code>${s.runtime_layer || '—'}</code></p>
      <p>生产授权：否 · 运行身份：否</p>
      ${links.length ? `<p><strong>关联经营网络节点（${links.length}）</strong></p>` + links.map(lk => {
        const nd = net.nodes.find(x => x.id === lk.node_id);
        return `<p class="jump" data-jump3d="node:${lk.node_id}">→ ${nd ? nd.title : lk.node_id}（${lk.basis.join('/')}）</p>`;
      }).join('') : `<p>无直接主网节点映射（跨事项按题进入）。</p>`}`;
  } else if (kind === 'gov') {
    const g = SEAT_MAP.get(id);
    side.innerHTML = `<h2>${g.alias} · ${g.seat_id}</h2>
      <p>${g.title}</p>
      <p><span class="tag">${g.slot_id}</span><span class="tag">${g.slot_title}</span></p>
      <p><strong>T4 决策权规则，不是 Agent 席位，不是部门。</strong></p>
      <p>治理参照：T4 决策权规则包。不挂 session、不进事项、不发 ActionIntent。</p>`;
  } else if (kind === 'node') {
    const nd = net.nodes.find(x => x.id === id);
    const seats = nd.seat_links || [];
    side.innerHTML = `<h2>${nd.title}</h2><p>${nd.short}</p>
      <p><span class="tag">${nd.codes}</span></p>
      <p>${nd.pages.length} 张卡引用 · 主卡 ${nd.primary_page || '—'}</p>
      ${seats.length ? `<p><strong>关联席位 / 能力站位（${seats.length}）</strong></p>` + seats.map(s =>
        `<p class="jump" data-jump3d="seat:${s.seat_id}">→ ${s.seat_id} ${s.alias} · ${s.slot_id} ${s.slot_title}</p>`
      ).join('') : ''}`;
  }
  side.querySelectorAll('[data-jump3d]').forEach(el => el.addEventListener('click', () => {
    const [k, v] = el.dataset.jump3d.split(':');
    const want = k === 'node' ? 'network' : 'org';
    if (stage.dataset.view !== want) switchView(want);
    showDetail(k, v);
  }));
}

// ---------- 视图切换 ----------
function switchView(v) {
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  stage.dataset.view = v;
  orgOnly.visible = v === 'org';
  netGroup.visible = v === 'network';
  orbit.target.set(FCX, v === 'org' ? 60 : 40, FCZ);
  orbit.radius = v === 'org' ? 3500 : 4000;
  orbit.phi = v === 'org' ? Math.PI * 0.31 : Math.PI * 0.40;
  for (const l of labels) {
    if (l.kind === 'node' || l.kind === 'sub') l.shown = v === 'network' || l.kind === 'sub';
    if (l.kind === 'node') l.shown = v === 'network';
    if (l.kind === 'seat') l.shown = v === 'org';
    if (l.kind === 'band' || l.kind === 'sub') l.shown = v === 'org';
  }
}
stage.dataset.view = 'org';
netGroup.visible = false;
document.querySelectorAll('#views button').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

document.querySelector('#toggle-rotate').addEventListener('click', e => {
  autoRotate = !autoRotate;
  e.currentTarget.textContent = autoRotate ? '暂停旋转' : '继续旋转';
  e.currentTarget.classList.toggle('active', autoRotate);
});

// 首屏隐藏网络标签
for (const l of labels) if (l.kind === 'node') l.shown = false;

// ---------- 标签投影 + 席位 LOD ----------
const v3 = new THREE.Vector3();
// 标签优先级：数字越大越先占位
const LBL_PRIORITY = { band: 5, gov: 4, govnote: 4, node: 4, sub: 3, seat: 2 };
const placedRects = [];
function overlaps(a, b) {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

function projectLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const orgView = stage.dataset.view === 'org';

  // 席位标签：仅近景，最多 20 个，按相机距离排序
  const seatShown = new Set();
  if (orgView && orbit.radius < 1600) {
    const cands = [];
    for (const l of labels) {
      if (l.kind !== 'seat') continue;
      v3.copy(l.pos).project(camera);
      if (v3.z > 1 || v3.z < -1) continue;
      cands.push({ l, d: v3.z });
    }
    cands.sort((a, b) => a.d - b.d);
    for (const c of cands.slice(0, 20)) seatShown.add(c.l);
  }

  // 收集本轮候选：先算屏幕矩形，再按优先级贪心避让
  const cands = [];
  for (const l of labels) {
    let show = l.shown;
    if (l.kind === 'seat') show = seatShown.has(l);
    if (!show) { l.el.style.display = 'none'; continue; }
    v3.copy(l.pos).project(camera);
    if (v3.z > 1) { l.el.style.display = 'none'; continue; }
    if (!l.w) l.w = l.el.offsetWidth || 80;
    if (!l.h) l.h = l.el.offsetHeight || 18;
    const x = Math.max(30, Math.min(w - 30, (v3.x * 0.5 + 0.5) * w));
    const y = Math.max(14, Math.min(h - 14, (-v3.y * 0.5 + 0.5) * h));
    const hw = l.w / 2 + 3, hh = l.h / 2 + 3;
    cands.push({ l, x, y, rect: { x0: x - hw, x1: x + hw, y0: y - hh, y1: y + hh },
                 p: LBL_PRIORITY[l.kind] || 1 });
  }
  cands.sort((a, b) => b.p - a.p);

  placedRects.length = 0;
  for (const c of cands) {
    // 与已占位矩形冲突则隐藏，不做挤压（保持字号不变）
    if (placedRects.some(r => overlaps(c.rect, r))) { c.l.el.style.display = 'none'; continue; }
    placedRects.push(c.rect);
    c.l.el.style.display = '';
    c.l.el.style.transform = `translate(${c.x}px,${c.y}px) translate(-50%,-50%)`;
  }
}

// ---------- 主循环 ----------
const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  if (autoRotate && !dragging) orbit.theta += dt * 0.06;
  applyCamera();
  if (flow && stage.dataset.view === 'network') flow.update(dt);
  projectLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

document.querySelector('#gv').textContent = G.graph_version;
document.querySelector('#f-seats').textContent =
  `${G.org.seats.length + G.org.governance.length} 个可寻址席位（${G.org.seats.length} AGT + ${G.org.governance.length} MGT）`;

// 调试钩子（?audit=1 时输出渲染统计）
window.__sc = { renderer, scene, camera, orbit, applyCamera, orgOnly, netGroup, flow, labels };
if (location.search.includes('audit=1')) {
  setTimeout(() => {
    const info = renderer.info.render;
    console.log('[3D]', JSON.stringify({ calls: info.calls, triangles: info.triangles,
      persons: org.seats.length, flow: flow.stats, ground: [Math.round(FW), Math.round(FD)] }));
  }, 900);
}

// URL 直达：?view=network
if (new URLSearchParams(location.search).get('view') === 'network') switchView('network');

applyCamera();
tick();
