// 三宝组织空间 3D 展示页（1 unit = 1 cm）：
// - 色彩体系对齐 https://sagegogo.com/（Deep-Space Hero Dark + 冷银钛蓝）
// - 空间基座借鉴 three-scope-map-skill（多层发光厚板 + 侧墙渐变 Shader + 外框单条追光带 + 底部三层旋转 HUD 环 + 预设缓动运镜）
// - 工位与人物借鉴 polyfork.dev（Faceted Low-Poly 科技工装 + 双联自发光仪表盘 + 桌下算力刀片单元）
// - 全息投影台借鉴 image2threejs（单 InstancedMesh 3D 体素全息数字分身）
// 设计态展示，不是运行系统；3 个 MGT 严守 T4 规则碑，不生成人形或工位。

import * as THREE from './vendor/three.module.min.js';
import { layoutOrg, layoutNetwork } from './layout.js?v=38';
import { createPerson, createPlaque, renderAvatarSvg, mulberry32 } from './avatars.js?v=38';
import { renderPinAvatarHtml, renderDossierHtml } from './dossier.js?v=38';
import { buildFlowLines } from './flow.js?v=38';
import { SAGE_DARK, hexToInt } from './theme.js?v=38';
import { createHoloEmitterStage } from './holo.js?v=38';
import { buildCrosswalkBeams } from './beams.js?v=38';
import { openCardLightbox } from './lightbox.js?v=38';

const G = window.SANBAO_GRAPH;
const stage = document.querySelector('#stage');
const side = document.querySelector('#side');
const labelLayer = document.querySelector('#labels3d');
const params = new URLSearchParams(location.search);
const STILL_MODE = params.get('still') === '1';
const FORCE_PR1 = params.get('pr') === '1';

// ---------- 布局：复用工作视图算法，换厘米级尺寸 ----------
const OFFICE = { cellW: 148, cellH: 104, pad: 20, labelH: 44, blockGap: 64,
                 bandGap: 150, bandTitleH: 64, margin: 60, maxW: 2100, board: 2300 };
const org = layoutOrg(G.org, OFFICE);
const net = layoutNetwork(G.network);

const PLANE2DEPT = { 经营管理: 'mgmt', 业务运营: 'ops', 独立控制: 'control', '数据与Agent平台': 'platform' };
const DEPT = {
  ops:      { fill: hexToInt(SAGE_DARK.depts.ops.fill),      edge: hexToInt(SAGE_DARK.depts.ops.edge),      name: '业务运营',       coat: hexToInt(SAGE_DARK.depts.ops.coat) },
  mgmt:     { fill: hexToInt(SAGE_DARK.depts.mgmt.fill),     edge: hexToInt(SAGE_DARK.depts.mgmt.edge),     name: '经营管理',       coat: hexToInt(SAGE_DARK.depts.mgmt.coat) },
  control:  { fill: hexToInt(SAGE_DARK.depts.control.fill),  edge: hexToInt(SAGE_DARK.depts.control.edge),  name: '独立控制',       coat: hexToInt(SAGE_DARK.depts.control.coat) },
  platform: { fill: hexToInt(SAGE_DARK.depts.platform.fill), edge: hexToInt(SAGE_DARK.depts.platform.edge), name: '数据与Agent平台', coat: hexToInt(SAGE_DARK.depts.platform.coat) },
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
const PR = FORCE_PR1 ? 1 : Math.min(devicePixelRatio || 1, 1.75);
renderer.setPixelRatio(PR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.96;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(hexToInt(SAGE_DARK.fogBg));
scene.fog = new THREE.Fog(hexToInt(SAGE_DARK.fogBg), 3600, 8400);

// 程序化冷银钛环境贴图（对齐 sagegogo.com 金属光泽）
function envTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 32);
  grd.addColorStop(0.00, '#dce5ee');
  grd.addColorStop(0.46, '#eef3f8');
  grd.addColorStop(0.54, '#26344a');
  grd.addColorStop(1.00, '#030408');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 32);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
scene.environment = envTexture();
scene.environmentIntensity = 0.55;

// 确定性深空碳纤微网格纹理（消除 Math.random，使用固定种子 mulberry32）
function carpetTexture() {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const rnd = mulberry32(0x5A4B18);
  g.fillStyle = '#0b1521'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 18000; i++) {
    const v = 14 + ((rnd() * 18) | 0);
    g.fillStyle = `rgba(${v},${v + 10},${v + 20},0.48)`;
    g.fillRect((rnd() * S) | 0, (rnd() * S) | 0, 2, 2);
  }
  g.strokeStyle = 'rgba(57,99,151,0.34)'; g.lineWidth = 1.5;
  for (let i = 1; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, S); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(S, i * 128); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(FW / 220, FD / 220);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// 科技仪表盘自发光屏幕纹理（替代旧版全黑屏幕）
function dashboardScreenTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#07121c'; g.fillRect(0, 0, 256, 128);
  g.strokeStyle = '#26344a'; g.lineWidth = 2;
  g.strokeRect(4, 4, 248, 120);
  // 顶栏状态带
  g.fillStyle = '#142332'; g.fillRect(10, 10, 236, 16);
  g.fillStyle = '#74bfe8'; g.fillRect(14, 14, 46, 8);
  g.fillStyle = '#8adac4'; g.fillRect(220, 14, 20, 8);
  // 左侧指标柱图
  const bars = [38, 62, 48, 76, 54, 84, 68];
  bars.forEach((bh, i) => {
    g.fillStyle = i === 5 ? '#74bfe8' : '#396397';
    g.fillRect(16 + i * 16, 108 - bh, 10, bh);
  });
  // 右侧趋势折线与脉冲框
  g.strokeStyle = '#aec8e2'; g.lineWidth = 2.2;
  g.beginPath();
  [92, 78, 84, 58, 64, 42, 48].forEach((y, i) => {
    const x = 140 + i * 16;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  });
  g.stroke();
  g.strokeStyle = 'rgba(116,191,232,0.35)'; g.lineWidth = 1;
  g.strokeRect(136, 34, 108, 76);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const S = 64, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(196,208,220,0.92)');
  grd.addColorStop(0.4, 'rgba(116,191,232,0.28)');
  grd.addColorStop(1, 'rgba(116,191,232,0)');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------- 侧墙厚度渐变 ShaderMaterial（借鉴 three-scope-map-skill vDepth 三段 smoothstep） ----------
function createSideGradientMaterial({ bottomY = -22, topY = 0, bottomHex = 0x07121c, midHex = 0x396397, topHex = 0xaec8e2, alpha = 0.92 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uBottomY: { value: bottomY },
      uTopY: { value: topY },
      uBottomColor: { value: new THREE.Color(bottomHex) },
      uMidColor: { value: new THREE.Color(midHex) },
      uTopColor: { value: new THREE.Color(topHex) },
      uAlpha: { value: alpha },
    },
    vertexShader: `
      uniform float uBottomY;
      uniform float uTopY;
      varying float vDepth;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vDepth = clamp((worldPos.y - uBottomY) / max(0.001, uTopY - uBottomY), 0.0, 1.0);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uBottomColor;
      uniform vec3 uMidColor;
      uniform vec3 uTopColor;
      uniform float uAlpha;
      varying float vDepth;
      void main() {
        vec3 lower = mix(uBottomColor, uMidColor, smoothstep(0.0, 0.28, vDepth));
        vec3 col = mix(lower, uTopColor, smoothstep(0.36, 1.0, vDepth));
        float edgeGlow = smoothstep(0.52, 1.0, vDepth);
        gl_FragColor = vec4(col + edgeGlow * uTopColor * 0.26, uAlpha * (0.46 + vDepth * 0.54));
      }
    `,
  });
}

// ---------- 材质（Sagegogo 冷钛蓝体系） ----------
const screenTex = dashboardScreenTexture();
const MAT = {
  desk: new THREE.MeshStandardMaterial({ color: 0x1b3042, roughness: 0.42, metalness: 0.48, flatShading: true }),
  deskEdge: new THREE.MeshStandardMaterial({ color: 0x74bfe8, emissive: 0x396397, emissiveIntensity: 1.1, roughness: 0.25, metalness: 0.6 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x142033, roughness: 0.34, metalness: 0.84 }),
  screen: new THREE.MeshStandardMaterial({
    color: 0xffffff, map: screenTex, emissive: 0x74bfe8, emissiveMap: screenTex, emissiveIntensity: 0.85,
    roughness: 0.16, metalness: 0.15,
  }),
  seat: new THREE.MeshStandardMaterial({ color: 0x142332, roughness: 0.78, metalness: 0.14, flatShading: true }),
  glass: new THREE.MeshStandardMaterial({ color: 0xaec8e2, roughness: 0.06, metalness: 0.0,
    transparent: true, opacity: 0.20, side: THREE.DoubleSide, depthWrite: false }),
  rail: new THREE.MeshStandardMaterial({ color: 0xc4d0dc, roughness: 0.24, metalness: 0.90 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x0b1521, roughness: 0.72, metalness: 0.22 }),
  pedestal: new THREE.MeshStandardMaterial({ color: 0x142033, roughness: 0.36, metalness: 0.62 }),
  cap: new THREE.MeshStandardMaterial({ color: 0xc4d0dc, roughness: 0.32, metalness: 0.45 }),
  plant: new THREE.MeshStandardMaterial({ color: 0x2b4a56, roughness: 0.82, flatShading: true }),
  pot: new THREE.MeshStandardMaterial({ color: 0x142033, roughness: 0.75 }),
  led: new THREE.MeshBasicMaterial({ color: 0xffffff }),
};

// ---------- 分组 ----------
const archGroup = new THREE.Group();
const orgOnly = new THREE.Group();
const SKY_Y = 320;
const netGroup = new THREE.Group();
netGroup.position.set(FCX - 800, SKY_Y, FCZ - 800);
const beamGroup = new THREE.Group();
const lightGroup = new THREE.Group();
scene.add(archGroup, orgOnly, netGroup, beamGroup, lightGroup);

// ---------- 辅助：矩形边框顶点追加到批量 LineSegments ----------
function pushRectLoop(arr, x0, z0, x1, z1, y) {
  arr.push(
    x0, y, z0, x1, y, z0,
    x1, y, z0, x1, y, z1,
    x1, y, z1, x0, y, z1,
    x0, y, z1, x0, y, z0
  );
}

// ---------- 8 层发光厚板基座 + 外框窄带追光 + 底部三层旋转 HUD 环 ----------
let chaseMaterial = null;
const hudRingGroup = new THREE.Group();

(function buildFloorAndSlabs() {
  // 1) 主基座顶面（深色碳纤微网格）
  const topSlab = new THREE.Mesh(
    new THREE.PlaneGeometry(FW, FD),
    new THREE.MeshStandardMaterial({ map: carpetTexture(), roughness: 0.92, metalness: 0.06 })
  );
  topSlab.rotation.x = -Math.PI / 2;
  topSlab.position.set(FCX, 0, FCZ);
  topSlab.receiveShadow = true;
  archGroup.add(topSlab);

  // 2) 主基座四壁侧墙（Y = -24 .. 0 渐变发光厚板）
  const sideMat = createSideGradientMaterial({
    bottomY: -24, topY: 0, bottomHex: 0x030408, midHex: 0x396397, topHex: 0xaec8e2, alpha: 0.94,
  });
  const wallH = 24;
  const nWall = new THREE.Mesh(new THREE.PlaneGeometry(FW, wallH), sideMat);
  nWall.position.set(FCX, -wallH / 2, F.z0);
  const sWall = new THREE.Mesh(new THREE.PlaneGeometry(FW, wallH), sideMat);
  sWall.position.set(FCX, -wallH / 2, F.z1);
  const wWall = new THREE.Mesh(new THREE.PlaneGeometry(FD, wallH), sideMat);
  wWall.rotation.y = Math.PI / 2;
  wWall.position.set(F.x0, -wallH / 2, FCZ);
  const eWall = new THREE.Mesh(new THREE.PlaneGeometry(FD, wallH), sideMat);
  eWall.rotation.y = Math.PI / 2;
  eWall.position.set(F.x1, -wallH / 2, FCZ);
  archGroup.add(nWall, sWall, wWall, eWall);

  // 3) 顶外轮廓与底外轮廓（批量合成 LineSegments，避免多 LineLoop）
  const outerTopPts = [], outerBotPts = [], zoneLinePts = [];
  pushRectLoop(outerTopPts, F.x0, F.z0, F.x1, F.z1, 0.8);
  pushRectLoop(outerBotPts, F.x0, F.z0, F.x1, F.z1, -24);

  for (const [id, z] of Object.entries(ZONE)) {
    const d = DEPT[id] || DEPT.ops;
    const w = z.x1 - z.x0, dd = z.z1 - z.z0;
    const fill = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 12, dd - 12),
      new THREE.MeshBasicMaterial({ color: d.fill, transparent: true, opacity: 0.90, depthWrite: false })
    );
    fill.rotation.x = -Math.PI / 2;
    fill.position.set(z.x0 + w / 2, 0.4, z.z0 + dd / 2);
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(w, dd),
      new THREE.MeshBasicMaterial({
        color: d.edge, transparent: true, opacity: 0.08,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(z.x0 + w / 2, 0.7, z.z0 + dd / 2);
    archGroup.add(fill, glow);
    pushRectLoop(zoneLinePts, z.x0, z.z0, z.x1, z.z1, 1.1);
  }

  const mkLines = (pts, color, opacity) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const ls = new THREE.LineSegments(geo, mat);
    ls.frustumCulled = false;
    return ls;
  };
  archGroup.add(
    mkLines(outerTopPts, 0xc4d0dc, 0.86),
    mkLines(outerBotPts, 0x396397, 0.62),
    mkLines(zoneLinePts, 0x74bfe8, 0.52)
  );
})();

// ---------- 外轮廓单条窄带追光（Chase Light，借鉴 three-scope-map-skill） ----------
(function buildChaseLight() {
  const perimeter = 2 * (FW + FD);
  const segCount = 160;
  const ribbonW = 14;
  const positions = [];
  const distances = [];

  function pointAlongPerimeter(dist) {
    let d = ((dist % perimeter) + perimeter) % perimeter;
    if (d < FW) return [F.x0 + d, F.z0, 0, -1];
    d -= FW;
    if (d < FD) return [F.x1, F.z0 + d, 1, 0];
    d -= FD;
    if (d < FW) return [F.x1 - d, F.z1, 0, 1];
    d -= FW;
    return [F.x0, F.z1 - d, -1, 0];
  }

  const step = perimeter / segCount;
  const y = 1.4;
  for (let i = 0; i < segCount; i++) {
    const d0 = i * step, d1 = (i + 1) * step;
    const [x0, z0, nx0, nz0] = pointAlongPerimeter(d0);
    const [x1, z1, nx1, nz1] = pointAlongPerimeter(d1);
    const ox0 = x0 + nx0 * ribbonW, oz0 = z0 + nz0 * ribbonW;
    const ox1 = x1 + nx1 * ribbonW, oz1 = z1 + nz1 * ribbonW;
    positions.push(
      x0, y, z0, ox0, y, oz0, x1, y, z1,
      x1, y, z1, ox0, y, oz0, ox1, y, oz1
    );
    distances.push(d0, d0, d1, d1, d0, d1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aDist', new THREE.Float32BufferAttribute(distances, 1));

  chaseMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uTotal: { value: perimeter },
      uSpeed: { value: perimeter / 8.0 },
      uTail: { value: Math.max(220, perimeter * 0.08) },
      uHeadColor: { value: new THREE.Color(0xffffff) },
      uTailColor: { value: new THREE.Color(0x74bfe8) },
    },
    vertexShader: `
      attribute float aDist;
      varying float vDist;
      void main() {
        vDist = aDist;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uTotal;
      uniform float uSpeed;
      uniform float uTail;
      uniform vec3 uHeadColor;
      uniform vec3 uTailColor;
      varying float vDist;
      void main() {
        float head = mod(uTime * uSpeed, uTotal);
        float behind = mod(head - vDist + uTotal, uTotal);
        if (behind > uTail) discard;
        float t = 1.0 - behind / uTail;
        float alpha = pow(t, 1.65);
        vec3 col = mix(uTailColor, uHeadColor, smoothstep(0.65, 1.0, t));
        gl_FragColor = vec4(col, alpha * 0.92);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, chaseMaterial);
  mesh.renderOrder = 20;
  mesh.frustumCulled = false;
  archGroup.add(mesh);
})();

// ---------- 底部三层旋转 HUD 环（借鉴 three-scope-map-skill RingGeometry + Arc + Tick） ----------
(function buildHudRings() {
  hudRingGroup.position.set(FCX, -26, FCZ);
  const baseR = Math.max(FW, FD) * 0.56;
  const ringConfigs = [
    { r0: baseR * 0.82, r1: baseR * 0.835, op: 0.08, col: 0x74bfe8 },
    { r0: baseR * 0.96, r1: baseR * 0.972, op: 0.05, col: 0xaec8e2 },
    { r0: baseR * 1.10, r1: baseR * 1.112, op: 0.035, col: 0x396397 },
  ];
  for (const rc of ringConfigs) {
    const rg = new THREE.RingGeometry(rc.r0, rc.r1, 128);
    const rm = new THREE.MeshBasicMaterial({
      color: rc.col, transparent: true, opacity: rc.op,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(rg, rm);
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = -3;
    hudRingGroup.add(m);
  }
  // 11 段弧线 + 48 个刻度线合成 1 个 LineSegments
  const tickPts = [];
  const tickR0 = baseR * 1.01, tickR1 = baseR * 1.05;
  for (let i = 0; i < 48; i++) {
    if (i % 4 === 0) continue;
    const a = (i / 48) * Math.PI * 2;
    tickPts.push(
      Math.cos(a) * tickR0, 0, Math.sin(a) * tickR0,
      Math.cos(a) * tickR1, 0, Math.sin(a) * tickR1
    );
  }
  for (let s = 0; s < 11; s++) {
    const aStart = (s / 11) * Math.PI * 2;
    const aLen = 0.18;
    const ar = baseR * (s % 2 === 0 ? 0.90 : 1.07);
    for (let k = 0; k < 12; k++) {
      const a0 = aStart + (k / 12) * aLen;
      const a1 = aStart + ((k + 1) / 12) * aLen;
      tickPts.push(Math.cos(a0) * ar, 0, Math.sin(a0) * ar, Math.cos(a1) * ar, 0, Math.sin(a1) * ar);
    }
  }
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPts, 3));
  const tMat = new THREE.LineBasicMaterial({
    color: 0x74bfe8, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const ticks = new THREE.LineSegments(tGeo, tMat);
  ticks.renderOrder = -3;
  hudRingGroup.add(ticks);
  archGroup.add(hudRingGroup);
})();

// ---------- 玻璃隔断 ----------
(function buildGlass() {
  const panes = [], rails = [];
  for (const [id, z] of Object.entries(ZONE)) {
    const isOps = id === 'ops';
    const h = isOps ? 48 : 120;
    const inset = isOps ? 0 : 6;
    const x0 = z.x0 + inset, x1 = z.x1 - inset, z0 = z.z0 + inset, z1 = z.z1 - inset;
    const segs = [
      [x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1],
    ];
    for (const [ax, az, bx2, bz2] of segs) {
      const len = Math.hypot(bx2 - ax, bz2 - az);
      if (isOps && Math.abs(az - z1) < 1 && Math.abs(bz2 - z1) < 1) {
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
  const railGeo = new THREE.BoxGeometry(1, 5, 5);
  const railMesh = new THREE.InstancedMesh(railGeo, MAT.rail, rails.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  panes.forEach((p, i) => {
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

// ---------- 部门发光立柱门牌 ----------
(function buildSigns() {
  const entries = Object.entries(ZONE);
  const postGeo = new THREE.BoxGeometry(12, 130, 60);
  const stripGeo = new THREE.BoxGeometry(13, 4, 60);
  const posts = new THREE.InstancedMesh(postGeo, MAT.stone, entries.length);
  const strips = new THREE.InstancedMesh(stripGeo,
    new THREE.MeshStandardMaterial({ color: 0xaec8e2, emissive: 0x74bfe8, emissiveIntensity: 1.5 }), entries.length);
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

// ---------- 前庭全息投影指挥台（image2threejs 3D 体素全息分身） ----------
const holoStage = createHoloEmitterStage(FCX, F.z1 - 120);
orgOnly.add(holoStage.group);

// ---------- 治理墙 + 3 座 T4 钛金规则碑（MGT 不是人、无工位） ----------
const govMeshes = [];
(function buildGovernance() {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(1080, 180, 24), MAT.stone);
  wall.position.set(FCX, 90, Math.min(...bz) - 230);
  wall.castShadow = true; wall.receiveShadow = true;
  archGroup.add(wall);
  const zz = wall.position.z + 16;
  G.org.governance.forEach((gv, i) => {
    const plaque = createPlaque(gv, 260, 88, 10);
    plaque.position.set(FCX + (i - 1) * 320, 96, zz);
    archGroup.add(plaque);
    govMeshes.push(plaque);
  });
})();

// ---------- Polyfork 风格科技工位家具（双联自发光曲面屏 + 升降台 + 桌下算力刀片机柜与状态 LED） ----------
const deskSeatMap = [];
const plData = G.org.pilot_lens || { seats: [], context_injected_seats: [], target_nodes: [], stages: [] };
const pilotCoreIds = new Set((plData.seats || []).map(x => x.seat_id));
const pilotCtxIds = new Set((plData.context_injected_seats || []).map(x => x.seat_id));
const pilotNodeIds = new Set(plData.target_nodes || []);

(function buildWorkstations() {
  const seats = org.seats;
  const n = seats.length;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const deskGeo = new THREE.BoxGeometry(132, 4, 64);
  const edgeStripGeo = new THREE.BoxGeometry(132, 2.2, 2.2);
  const legGeo = new THREE.BoxGeometry(6, 70, 56);
  const dividerGeo = new THREE.BoxGeometry(132, 14, 2.5);
  const monGeo = new THREE.BoxGeometry(44, 28, 2.5);
  const monFootGeo = new THREE.BoxGeometry(18, 10, 10);
  const bladeGeo = new THREE.BoxGeometry(22, 34, 44);
  const ledGeo = new THREE.BoxGeometry(16, 3.2, 2);
  const seatGeo = new THREE.BoxGeometry(44, 5, 42);
  const backGeo = new THREE.BoxGeometry(42, 44, 5);
  const postGeo = new THREE.CylinderGeometry(3, 3, 44, 8);
  const baseGeo = new THREE.CylinderGeometry(17, 17, 3, 8);

  const desks = new THREE.InstancedMesh(deskGeo, MAT.desk, n);
  const edgeStrips = new THREE.InstancedMesh(edgeStripGeo, MAT.deskEdge, n);
  const legs = new THREE.InstancedMesh(legGeo, MAT.metal, n * 2);
  const dividers = new THREE.InstancedMesh(dividerGeo, MAT.metal, n);
  const mons = new THREE.InstancedMesh(monGeo, MAT.screen, n * 2);
  const monFeet = new THREE.InstancedMesh(monFootGeo, MAT.metal, n);
  const blades = new THREE.InstancedMesh(bladeGeo, MAT.metal, n);
  const leds = new THREE.InstancedMesh(ledGeo, MAT.led, n);
  const chairs = new THREE.InstancedMesh(seatGeo, MAT.seat, n);
  const backs = new THREE.InstancedMesh(backGeo, MAT.seat, n);
  const posts = new THREE.InstancedMesh(postGeo, MAT.metal, n);
  const bases = new THREE.InstancedMesh(baseGeo, MAT.metal, n);

  const colCore = new THREE.Color(0x74bfe8);
  const colPart = new THREE.Color(0xedb76c);
  const colUnv = new THREE.Color(0x396397);

  seats.forEach((s, i) => {
    const cx = s.x + s.w / 2, cz = s.y + s.h / 2;
    deskSeatMap[i] = s.id;
    e.set(0, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx, 72, cz - 22), q, new THREE.Vector3(1, 1, 1));
    desks.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 73.2, cz + 10), q, new THREE.Vector3(1, 1, 1));
    edgeStrips.setMatrixAt(i, m);
    for (const [j, sx] of [[0, -54], [1, 54]]) {
      m.compose(new THREE.Vector3(cx + sx, 35, cz - 22), q, new THREE.Vector3(1, 1, 1));
      legs.setMatrixAt(i * 2 + j, m);
    }
    m.compose(new THREE.Vector3(cx, 81, cz - 52), q, new THREE.Vector3(1, 1, 1));
    dividers.setMatrixAt(i, m);
    // 双联微倾曲面监控屏
    e.set(-0.12, 0.16, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx - 23, 91, cz - 36), q, new THREE.Vector3(1, 1, 1));
    mons.setMatrixAt(i * 2, m);
    e.set(-0.12, -0.16, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx + 23, 91, cz - 36), q, new THREE.Vector3(1, 1, 1));
    mons.setMatrixAt(i * 2 + 1, m);

    e.set(0, 0, 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(cx, 78, cz - 38), q, new THREE.Vector3(1, 1, 1));
    monFeet.setMatrixAt(i, m);
    // 桌下 AI 算力刀片机柜 + 准入状态 LED
    m.compose(new THREE.Vector3(cx + 38, 17, cz - 22), q, new THREE.Vector3(1, 1, 1));
    blades.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx + 38, 28, cz + 0.5), q, new THREE.Vector3(1, 1, 1));
    leds.setMatrixAt(i, m);
    leds.setColorAt(i, pilotCoreIds.has(s.id) ? colCore : (s.status === 'PARTIAL' ? colPart : colUnv));

    m.compose(new THREE.Vector3(cx, 44, cz + 30), q, new THREE.Vector3(1, 1, 1));
    chairs.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 65, cz + 47), q, new THREE.Vector3(1, 1, 1));
    backs.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 22, cz + 30), q, new THREE.Vector3(1, 1, 1));
    posts.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(cx, 1.5, cz + 30), q, new THREE.Vector3(1, 1, 1));
    bases.setMatrixAt(i, m);
  });
  for (const im of [desks, edgeStrips, legs, dividers, mons, monFeet, blades, leds, chairs, backs, posts, bases]) {
    im.frustumCulled = false;
    im.castShadow = true; im.receiveShadow = true;
    orgOnly.add(im);
  }
})();

// ---------- 50 个分身 + FLOW-02 试点 3D 标记 ----------
const peopleGroup = new THREE.Group();
const pilotRingGroup = new THREE.Group();
pilotRingGroup.visible = false;
const personBySeat = new Map();

(function buildPeople() {
  const ringGeo = new THREE.RingGeometry(38, 48, 28);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x74bfe8, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false });
  const ctxMat = new THREE.MeshBasicMaterial({ color: 0xedb76c, side: THREE.DoubleSide, transparent: true, opacity: 0.82, depthWrite: false });
  for (const s of org.seats) {
    const p = createPerson({ ...s, seat_id: s.id, level1: s.level1, status: s.status, tier: s.tier });
    const cx = s.x + s.w / 2, cz = s.y + s.h / 2;
    p.position.set(cx, 0, cz);
    peopleGroup.add(p);
    personBySeat.set(s.id, p);
    if (pilotCoreIds.has(s.id) || pilotCtxIds.has(s.id)) {
      const ring = new THREE.Mesh(ringGeo, pilotCoreIds.has(s.id) ? coreMat : ctxMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(cx, 1.2, cz + 6);
      pilotRingGroup.add(ring);
    }
  }
  orgOnly.add(peopleGroup, pilotRingGroup);
})();

// ---------- 网络台座 + 流动线 ----------
const pedestalSeatMap = [];
let flow = null;
(function buildNetwork() {
  const nodes = net.nodes;
  const n = nodes.length;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  const pedGeo = new THREE.BoxGeometry(46, 1, 46);
  const capGeo = new THREE.BoxGeometry(58, 4, 58);
  const bandGeo = new THREE.BoxGeometry(48, 3, 48);
  const peds = new THREE.InstancedMesh(pedGeo, MAT.pedestal, n);
  const caps = new THREE.InstancedMesh(capGeo, MAT.cap, n);
  const bands = new THREE.InstancedMesh(bandGeo,
    new THREE.MeshStandardMaterial({ color: 0x0b1521, emissive: 0x74bfe8, emissiveIntensity: 2.2 }), n);
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

  const netRingGeo = new THREE.RingGeometry(36, 48, 28);
  const netRingMat = new THREE.MeshBasicMaterial({ color: 0xedb76c, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false });
  const netPilotGroup = new THREE.Group();
  netPilotGroup.visible = false;
  nodes.forEach(nd => {
    if (!pilotNodeIds.has(nd.id)) return;
    const r = new THREE.Mesh(netRingGeo, netRingMat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(nd.x + nd.w / 2, 1.5, nd.y + nd.h / 2);
    netPilotGroup.add(r);
  });
  netGroup.add(netPilotGroup);
  netGroup.userData.pilotRings = netPilotGroup;

  // 天幕悬浮星图边框
  const skyBorderPts = [];
  pushRectLoop(skyBorderPts, 40, 40, 1560, 1560, 0);
  const skyGeo = new THREE.BufferGeometry();
  skyGeo.setAttribute('position', new THREE.Float32BufferAttribute(skyBorderPts, 3));
  const skyLines = new THREE.LineSegments(skyGeo, new THREE.LineBasicMaterial({
    color: 0x74bfe8, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  skyLines.frustumCulled = false;
  netGroup.add(skyLines);

  flow = buildFlowLines(net.nodes, G.network.relations);
  flow.setPixelRatio(PR);
  netGroup.add(flow.group);
})();

// ---------- 38 条跨层垂直能量光柱（连接 Y=84 地面员工工位 ⇄ Y=320 天幕经营网络节点） ----------
const beams = buildCrosswalkBeams(org.seats, net.nodes, G.org.seats, {
  netOffX: FCX - 800,
  netOffZ: FCZ - 800,
  skyY: SKY_Y,
});
beams.setPixelRatio(PR);
beamGroup.add(beams.group);

// ---------- 冷银深空灯光系统（对齐 sagegogo.com） ----------
(function buildLights() {
  lightGroup.add(new THREE.HemisphereLight(0xc4d0dc, 0x07121c, 0.58));
  const key = new THREE.DirectionalLight(0xf4f7fb, 2.4);
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

  const fill = new THREE.DirectionalLight(0xaec8e2, 0.65);
  fill.position.set(FCX + 1200, 800, FCZ + 900);
  lightGroup.add(fill);

  for (const [dx, dz] of [[-410, -610], [390, -610], [-410, 590], [390, 590]]) {
    const pl = new THREE.PointLight(0xc4d0dc, 0.85, 1800, 0);
    pl.position.set(FCX + dx, 300, FCZ + dz);
    lightGroup.add(pl);
  }

  const glow = glowTexture();
  for (const dz of [-610, 590]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(420, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x142033, emissive: 0xaec8e2, emissiveIntensity: 1.8 }));
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

// ---------- DOM 标签（含 sagegogo signal-point 呼吸光点） ----------
const labels = [];
function addLabel(html, pos, cls, data, isHtml = false) {
  const el = document.createElement('div');
  el.className = cls;
  if (isHtml) el.innerHTML = html;
  else el.textContent = html;
  if (data) Object.assign(el.dataset, data);
  labelLayer.appendChild(el);
  labels.push({ el, pos: pos.clone(), kind: data ? data.kind : 'misc', id: data ? data.id : null, shown: true });
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
  const holoBadgeEl = addLabel('★ 全息投影台：知微 AGT-008 · 产品组合与商业论证',
    new THREE.Vector3(FCX, 132, F.z1 - 120), 'lbl band holo', { kind: 'holo', id: 'AGT-008' });
  window.__holoBadgeEl = holoBadgeEl;
  const netOffX = FCX - 800, netOffZ = FCZ - 800;
  for (const nd of net.nodes) addLabel(nd.title,
    new THREE.Vector3(netOffX + nd.x + nd.w / 2, SKY_Y + 70 + (nd.pages ? nd.pages.length : 1) * 6 + 26, netOffZ + nd.y + nd.h / 2),
    'lbl node', { kind: 'node', id: nd.id });
  for (const s of org.seats) {
    const svg = renderPinAvatarHtml({ ...s, seat_id: s.id, level1: s.level1 }, 'dark', 24);
    const dotCls = s.status === 'PARTIAL' ? 'sig-dot partial' : 'sig-dot';
    addLabel(`<i class="${dotCls}"></i>${svg}<span>${s.alias}</span><small>${s.id}</small>`,
      new THREE.Vector3(s.x + s.w / 2, 142, s.y + s.h / 2), 'lbl seat', { kind: 'seat', id: s.id }, true);
  }
})();

labelLayer.addEventListener('click', e => {
  const item = e.target.closest('.lbl[data-id]');
  if (!item) return;
  e.stopPropagation();
  const k = item.dataset.kind === 'holo' ? (item.dataset.id.startsWith('MGT-') ? 'gov' : 'seat') : item.dataset.kind;
  const id = item.dataset.id;
  if (k === 'seat') {
    const seatBox = org.seats.find(x => x.id === id);
    if (seatBox) tweenCamera({ radius: Math.min(orbit.radius, 1180), target: [seatBox.x + seatBox.w / 2, 90, seatBox.y + seatBox.h / 2] });
  }
  showDetail(k, id);
});

// ---------- 预设缓动相机控制器（借鉴 cameraPresetController.ts） ----------
const VIEW_PRESETS = {
  cosmos: { fov: 35, theta: Math.PI * 0.24, phi: Math.PI * 0.34, radius: 2780, target: [FCX, 145, FCZ] },
  org: { fov: 35, theta: Math.PI * 0.25, phi: Math.PI * 0.33, radius: 2480, target: [FCX, 55, FCZ] },
  'org-closeup': { fov: 35, theta: Math.PI * 0.25, phi: Math.PI * 0.36, radius: 1180, target: [FCX, 85, FCZ - 320] },
  network: { fov: 35, theta: Math.PI * 0.25, phi: Math.PI * 0.36, radius: 2650, target: [FCX, SKY_Y + 40, FCZ] },
  plan: { fov: 30, theta: 0, phi: 0.04, radius: 3950, target: [FCX, 0, FCZ] },
};

const camera = new THREE.PerspectiveCamera(35, 1, 10, 12000);
const orbit = {
  theta: VIEW_PRESETS.cosmos.theta,
  phi: VIEW_PRESETS.cosmos.phi,
  radius: VIEW_PRESETS.cosmos.radius,
  target: new THREE.Vector3(...VIEW_PRESETS.cosmos.target),
};
let camTween = null;
let autoRotate = !STILL_MODE;
let dragging = false, last = null, moved = 0;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function tweenCamera(presetOrTarget, durationMs = 760) {
  if (STILL_MODE || durationMs <= 0) {
    if (presetOrTarget.theta != null) orbit.theta = presetOrTarget.theta;
    if (presetOrTarget.phi != null) orbit.phi = presetOrTarget.phi;
    if (presetOrTarget.radius != null) orbit.radius = presetOrTarget.radius;
    if (presetOrTarget.target) orbit.target.set(...presetOrTarget.target);
    camTween = null;
    return;
  }
  camTween = {
    t0: performance.now(),
    dur: durationMs,
    from: {
      theta: orbit.theta,
      phi: orbit.phi,
      radius: orbit.radius,
      tx: orbit.target.x,
      ty: orbit.target.y,
      tz: orbit.target.z,
    },
    to: {
      theta: presetOrTarget.theta ?? orbit.theta,
      phi: presetOrTarget.phi ?? orbit.phi,
      radius: presetOrTarget.radius ?? orbit.radius,
      tx: presetOrTarget.target ? presetOrTarget.target[0] : orbit.target.x,
      ty: presetOrTarget.target ? presetOrTarget.target[1] : orbit.target.y,
      tz: presetOrTarget.target ? presetOrTarget.target[2] : orbit.target.z,
    },
  };
}

function applyCamera() {
  if (camTween) {
    const u = Math.min(1, (performance.now() - camTween.t0) / camTween.dur);
    const k = easeOutCubic(u);
    orbit.theta = camTween.from.theta + (camTween.to.theta - camTween.from.theta) * k;
    orbit.phi = camTween.from.phi + (camTween.to.phi - camTween.from.phi) * k;
    orbit.radius = camTween.from.radius + (camTween.to.radius - camTween.from.radius) * k;
    orbit.target.set(
      camTween.from.tx + (camTween.to.tx - camTween.from.tx) * k,
      camTween.from.ty + (camTween.to.ty - camTween.from.ty) * k,
      camTween.from.tz + (camTween.to.tz - camTween.from.tz) * k
    );
    if (u >= 1) camTween = null;
  }
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
  dragging = true; camTween = null; last = { x: e.clientX, y: e.clientY }; moved = 0;
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', e => {
  if (!dragging || !last) return;
  const dx = e.clientX - last.x, dy = e.clientY - last.y;
  moved += Math.abs(dx) + Math.abs(dy);
  orbit.theta -= dx * 0.006;
  orbit.phi = Math.max(0.03, Math.min(1.48, orbit.phi - dy * 0.005));
  last = { x: e.clientX, y: e.clientY };
});
stage.addEventListener('pointerup', e => {
  dragging = false; last = null;
  try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
});
stage.addEventListener('wheel', e => {
  e.preventDefault();
  camTween = null;
  orbit.radius = Math.max(800, Math.min(6000, orbit.radius * Math.exp(e.deltaY * 0.0012)));
}, { passive: false });

// ---------- 拾取与悬停抬升 ----------
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
let hovered = null;

function pickAt(clientX, clientY) {
  const r = stage.getBoundingClientRect();
  ptr.x = ((clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ptr, camera);
  const targets = [];
  if (netGroup.visible) targets.push(...netGroup.children);
  if (orgOnly.visible) targets.push(...orgOnly.children);
  targets.push(...govMeshes);
  const hits = ray.intersectObjects(targets, true);
  for (const h of hits) {
    const o = h.object;
    if (o.userData && o.userData.kind === 'person') return { kind: 'seat', id: o.userData.seatId };
    if (o.userData && o.userData.kind === 'gov') return { kind: 'gov', id: o.userData.id };
    if (o.isInstancedMesh && o.instanceId != null) {
      let p = o;
      let inNet = false;
      while (p) { if (p === netGroup) { inNet = true; break; } p = p.parent; }
      const map = inNet ? pedestalSeatMap : deskSeatMap;
      const id = map[o.instanceId];
      if (id) return inNet ? { kind: 'node', id } : { kind: 'seat', id };
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
      if (pk === 'seat') { const p = personBySeat.get(pid); if (p) { p.scale.setScalar(1); p.position.y = 0; } }
      if (flow) flow.setHover(null);
      if (!selected3d) beams.setFocus({});
    }
    hovered = key;
    if (hit) {
      if (hit.kind === 'seat') {
        const p = personBySeat.get(hit.id);
        if (p) { p.scale.setScalar(1.06); p.position.y = 6; }
        beams.setFocus({ seatIds: new Set([hit.id]) });
      }
      if (hit.kind === 'node') {
        if (flow) flow.setHover(hit.id);
        beams.setFocus({ nodeIds: new Set([hit.id]) });
      }
    }
    stage.style.cursor = hit ? 'pointer' : 'grab';
  }
});
stage.addEventListener('click', e => {
  if (moved > 6) return;
  const hit = pickAt(e.clientX, e.clientY);
  if (hit) showDetail(hit.kind, hit.id);
});

// ---------- 详情与全息联动 ----------
const SEAT_MAP = new Map([...G.org.seats, ...G.org.governance].map(s => [s.seat_id, s]));
const DECISION_MAP = new Map((G.decisions || []).map(d => [d.id, d]));
const CARD_MAP = new Map((G.cards || []).map(c => [c.file, c]));
const REL_LABEL_3D = {
  direct_reuse: '主责承接该节点',
  sub_contributor: '提供专业模块支持',
  evidence_input: '提供事实与数据依据',
  boundary_contributor: '把控合规与风险边界',
  readonly_consumer: '只读参考该节点结论',
  platform_steward: '由平台团队统一维护',
};

let closeupMode = false;
let pilotMode = false;
let pilotStage3d = 'ALL';
let chainId3d = 'chain-01';
let currentTheme3d = 'dark';
let selected3d = null;

function cTags3dHtml(codesStrOrArr) {
  const list = Array.isArray(codesStrOrArr)
    ? codesStrOrArr
    : (codesStrOrArr || '').match(/C-\d{3}/g) || [];
  return list.map(c => {
    const d = DECISION_MAP.get(c);
    const tip = d && d.title ? `${c} · ${d.title}` : c;
    return `<span class="tag c-link" data-cid3d="${c}" title="${tip.replace(/"/g, '&quot;')}">${c}</span>`;
  }).join('');
}

function showDetail(kind, id) {
  selected3d = kind && id ? { kind, id } : null;
  if (kind === 'seat' || kind === 'gov') {
    holoStage.updateSeatHologram(id);
    beams.setFocus({ seatIds: new Set([id]) });
    const m = SEAT_MAP.get(id);
    if (m && window.__holoBadgeEl) {
      window.__holoBadgeEl.textContent = `★ 全息投影台：${m.alias} ${m.seat_id} · ${m.title}`;
      window.__holoBadgeEl.dataset.id = m.seat_id;
    }
  } else if (kind === 'node') {
    beams.setFocus({ nodeIds: new Set([id]) });
    if (flow) flow.setHover(id);
  } else if (kind !== 'pilot') {
    beams.setFocus({});
  }

  if (kind === 'decision') {
    const d = DECISION_MAP.get(id);
    if (!d) { side.innerHTML = `<h2>${id}</h2><p>未找到该决策记录。</p>`; return; }
    const refNodes = net.nodes.filter(n => (n.codes || '').includes(id));
    const refSeats = [...G.org.seats, ...G.org.governance].filter(s =>
      s.slot_basis === id || (s.node_links || []).some(lk => (lk.basis || []).includes(id))
    );
    const refRels = G.network.relations.filter(r => (r.codes || []).includes(id));
    side.innerHTML = `<h2>${d.id} 决策详情</h2>
      <p style="color:var(--ink);font-weight:600">${d.title || '（无标题摘要）'}</p>
      <dl class="facts">
        <dt>台账行号</dt><dd><code>.codex/context-pack.md</code> 第 ${d.line} 行</dd>
        <dt>关联节点</dt><dd>${refNodes.length} 个业务节点</dd>
        <dt>关联飞线</dt><dd>${refRels.length} 条协作关系</dd>
        <dt>关联席位</dt><dd>${refSeats.length} 位数字员工</dd>
      </dl>
      ${refNodes.length ? `<h3>关联的经营网络节点</h3>` + refNodes.map(n =>
        `<div class="rel" data-jump-node="${n.id}"><div class="obj">→ ${n.title}</div><div class="meta">${n.short} · ${n.codes}</div></div>`
      ).join('') : ''}
      ${refSeats.length ? `<h3>关联的数字员工席位</h3>` + refSeats.map(s =>
        `<div class="rel" data-jump-seat="${s.seat_id}"><div class="obj">→ ${s.seat_id} ${s.alias} · ${s.title}</div><div class="meta">${s.slot_id} ${s.slot_title}</div></div>`
      ).join('') : ''}`;
  } else if (kind === 'pilot') {
    const chains = G.org.chain_lenses || [];
    const cbar = `<div class="stg-bar">
      ${chains.map(c => `<button type="button" class="stg-btn ${chainId3d === c.id ? 'active' : ''}" data-chain3d="${c.id}">${c.code}</button>`).join('')}
      <button type="button" class="stg-btn ${chainId3d === 'reuse' ? 'active' : ''}" data-chain3d="reuse">跨链复用</button>
    </div>`;
    if (chainId3d === 'reuse') {
      const s3 = G.org.seats.filter(s => (s.chains || []).length >= 3);
      const s2 = G.org.seats.filter(s => (s.chains || []).length === 2);
      side.innerHTML = `${cbar}<h2>跨主链复用热力（C-011 / C-310）</h2>
        <p>3 链全勤枢纽（${s3.length} 席）与 2 链共用席位（${s2.length} 席）：</p>
        ${[...s3, ...s2].map(s => `<div class="jump" data-jump3d="seat:${s.seat_id}">→ ${s.seat_id} ${s.alias}（${(s.chains || []).length} 链） · ${s.slot_id} ${s.slot_title}</div>`).join('')}`;
    } else if (chainId3d !== 'chain-01') {
      const cl = chains.find(c => c.id === chainId3d) || chains[1];
      side.innerHTML = `${cbar}<h2>${cl.title}</h2>
        <p>${cTags3dHtml(cl.basis)}</p>
        <p><strong>核心问题：</strong>${cl.question}</p>
        <h3>反误读停止线</h3>
        ${cl.anti_misreadings.map(m => `<p>• ${m}</p>`).join('')}
        <h3>核心与支撑席位（${cl.core_seats.length + cl.support_seats.length}）</h3>
        ${[...cl.core_seats, ...cl.support_seats].map(sid => {
          const meta = SEAT_MAP.get(sid);
          return `<div class="jump" data-jump3d="seat:${sid}">→ ${sid} ${meta ? meta.alias : ''} · ${meta ? meta.slot_id + ' ' + meta.slot_title : ''}</div>`;
        }).join('')}`;
    } else {
      const pre = plData.preconditions || { counts: {}, items: [] };
      const pc = pre.counts || {};
      const pg = plData.policy_gate || {};
      const gm = plData.governance_mechanisms || {};
      side.innerHTML = `${cbar}<h2>${plData.title}</h2>
      <p><span class="tag warn">启用条件：${pc.engineering_ready || 0} 项已就绪 · ${pc.awaiting_human_signoff || 0} 项待真人确认</span>
      <span class="tag">越权拦截 ${pg.negative_tests_passed || 10}/10</span><span class="tag">风控机制 ${gm.cases_passed || 16}/${gm.cases_total || 16}</span></p>
      <p><span class="tag">最多 ${plData.active_sessions} 个并发会话</span></p>
      <p>授权依据：<code>${plData.authorization_ref}</code></p>
      ${(pre.items || []).length ? `<h3>七项启用条件（P1..P7）</h3>` + pre.items.map(it => {
        const st = it.state === 'ENGINEERING_READY' ? '已就绪' : '待真人确认';
        return `<p><strong>${it.id} ${it.title}</strong> <span class="tag ${it.state === 'ENGINEERING_READY' ? '' : 'warn'}">${st}</span><br><small>${it.detail}</small></p>`;
      }).join('') : ''}
      <h3>核心主责席位（${plData.seats.length}）</h3>
      ${plData.seats.map(s => {
        const meta = SEAT_MAP.get(s.seat_id);
        return `<div class="jump" data-jump3d="seat:${s.seat_id}">→ ${s.seat_id} ${meta ? meta.alias : ''} · ${s.mode}<br><small style="color:var(--muted)">${s.stages.join('/')} · ${s.duty}</small></div>`;
      }).join('')}
      <h3>提供资料与规则支持的岗位（${plData.context_injected_seats.length} 席）</h3>
      ${plData.context_injected_seats.map(s => {
        const meta = SEAT_MAP.get(s.seat_id);
        return `<div class="jump" data-jump3d="seat:${s.seat_id}">→ ${s.seat_id} ${meta ? meta.alias : ''}（${s.stages.join('/')}） · ${s.duty}</div>`;
      }).join('')}
      <h3>关联主网节点（${plData.target_nodes.length}）</h3>
      ${plData.target_nodes.map(nid => {
        const nd = net.nodes.find(x => x.id === nid);
        return `<div class="jump" data-jump3d="node:${nid}">→ ${nd ? nd.title : nid}（${nd ? nd.codes : ''}）</div>`;
      }).join('')}
      <h3>新品立项 8 步走查回放（${plData.dryrun ? `连续 ${plData.dryrun.replay_runs} 次结果一致 · 条件通过` : '第 1 步 → 第 8 步'}）</h3>
      <div class="stg-bar">
        <button type="button" class="stg-btn ${pilotStage3d === 'ALL' ? 'active' : ''}" data-stg3d="ALL">全链</button>
        ${(plData.dryrun && plData.dryrun.stages || []).map(st =>
          `<button type="button" class="stg-btn ${pilotStage3d === st.stage_id ? 'active' : ''}" data-stg3d="${st.stage_id}">${st.stage_id}</button>`
        ).join('')}
      </div>
      ${(() => {
        const cur = pilotStage3d !== 'ALL' && plData.dryrun
          ? (plData.dryrun.stages || []).find(s => s.stage_id === pilotStage3d)
          : null;
        if (!cur) {
          return plData.stages.map(st => `<p><strong>${st.id} ${st.name}</strong> · ${st.artifact}<br><small>${st.actor}｜${st.gate}</small></p>`).join('');
        }
        return `<p><strong>${cur.stage_id} ${cur.name}</strong> · <code>${cur.artifact_kind}</code><br>
          <small>主责：${cur.producer_seats.join(', ')}｜支持：${cur.injected_seats.join(', ') || '无'}｜sha: ${cur.artifact_sha256}</small></p>
          <div class="art-box">${JSON.stringify(cur.artifact, null, 2)}</div>`;
      })()}`;
    }
  } else if (kind === 'seat' || kind === 'gov') {
    const s = SEAT_MAP.get(id);
    if (!s) return;
    side.innerHTML = renderDossierHtml(s, {
      theme: currentTheme3d,
      allSeatsMap: SEAT_MAP,
      netNodes: net.nodes,
      cTagsFn: cTags3dHtml,
      relLabelMap: REL_LABEL_3D,
    });
    side.scrollTop = 0;
  } else if (kind === 'node') {
    const nd = net.nodes.find(x => x.id === id);
    if (!nd) return;
    const rels = net.edges.filter(e => e && (e.source === id || e.target === id));
    const seats = nd.seat_links || [];
    const allPages = [nd.primary_page, ...(nd.pages || []).filter(f => f !== nd.primary_page)].filter(Boolean);
    side.innerHTML = `<h2>${nd.title}</h2><p>${nd.short}</p>
      <p>${cTags3dHtml(nd.codes)}</p>
      <p>${rels.length} 条协作飞线 · ${seats.length} 位关联数字员工 · ${allPages.length} 张画布设计卡</p>
      <h3>支撑该节点的数字员工（${seats.length} 位 · 已点亮跨层光柱）</h3>
      ${seats.map(s => `<div class="rel" data-jump-seat="${s.seat_id}">
        <div class="obj">→ ${s.seat_id} ${s.alias} · ${s.slot_id} ${s.slot_title}</div>
        <div class="meta">${REL_LABEL_3D[s.relation] || s.relation} · ${s.note}</div>
        <div>${cTags3dHtml(s.basis)}</div>
      </div>`).join('')}
      <h3>上下游协作关系（${rels.length} 条）</h3>
      ${rels.map(e => {
        const other = e.source === id ? e.target : e.source;
        const o = net.nodes.find(x => x.id === other);
        const dir = e.source === id ? '→' : '←';
        const kinds = [e.baseline ? '主流程' : '', e.feedback ? '反馈' : ''].filter(Boolean).join(' + ') || '协同';
        const obj = e.object ? ` · ${e.object}` : '';
        return `<div class="rel" data-jump-node="${other}"><div class="obj">${dir} ${o ? o.title : other}${obj}</div>
          <div class="meta">${kinds} · ${(e.codes || []).join(' / ')}</div></div>`;
      }).join('')}
      <h3>原始画布设计卡（${allPages.length} 张 · 点击直接在页内预览舱打开）</h3>
      ${allPages.map((f, i) => {
        const cardMeta = CARD_MAP.get(f);
        const sub = cardMeta && cardMeta.title ? ` · ${cardMeta.title}` : '';
        return `<div class="rel ${i >= 4 ? 'extra-page3d' : ''}" ${i >= 4 ? 'hidden' : ''} data-card3d-file="${f}" data-card3d-title="${(cardMeta && cardMeta.title || '').replace(/"/g, '&quot;')}">
          <div class="obj" style="color:#74bfe8">${i === 0 ? '★ 主设计卡 · ' : ''}${f.replace('.html', '')}</div>
          <div class="meta">${sub.slice(0, 44)}</div>
        </div>`;
      }).join('')}
      ${allPages.length > 4 ? `<button class="stg-btn" style="margin-top:6px" data-expand-pages3d>展开其余 ${allPages.length - 4} 张设计卡</button>` : ''}`;
    side.scrollTop = 0;
  }

  function apply3dChainHighlight() {
    const chains = G.org.chain_lenses || [];
    let activeSeats, activeNodes;
    if (chainId3d === 'reuse') {
      activeSeats = new Set(G.org.seats.filter(s => (s.chains || []).length >= 2).map(s => s.seat_id));
      activeNodes = new Set(net.nodes.filter(n => (n.chains || []).length >= 2).map(n => n.id));
    } else if (chainId3d !== 'chain-01') {
      const cl = chains.find(c => c.id === chainId3d) || chains[1];
      activeSeats = new Set([...cl.core_seats, ...cl.support_seats]);
      activeNodes = new Set(cl.target_nodes);
    } else {
      const cur = pilotStage3d !== 'ALL' && plData.dryrun
        ? (plData.dryrun.stages || []).find(s => s.stage_id === pilotStage3d)
        : null;
      activeSeats = cur ? new Set([...cur.producer_seats, ...cur.injected_seats]) : new Set([...pilotCoreIds, ...pilotCtxIds]);
      activeNodes = cur ? new Set(cur.target_nodes) : pilotNodeIds;
    }
    if (flow) flow.setPilotNodes(pilotMode ? activeNodes : null);
    beams.setFocus(pilotMode ? { seatIds: activeSeats, nodeIds: activeNodes } : {});
    for (const [sid, mesh] of personBySeat.entries()) {
      mesh.scale.setScalar(pilotMode && activeSeats.has(sid) ? 1.15 : 1);
    }
    for (const l of labels) {
      const pinned = pilotMode && ((l.kind === 'seat' && activeSeats.has(l.id)) || (l.kind === 'node' && activeNodes.has(l.id)));
      l.el.classList.toggle('pilot-pin', pinned);
    }
  }
  side.querySelectorAll('[data-chain3d]').forEach(btn => btn.addEventListener('click', () => {
    chainId3d = btn.dataset.chain3d;
    apply3dChainHighlight();
    showDetail('pilot', 'FLOW-02-SCN-002');
  }));
  side.querySelectorAll('[data-stg3d]').forEach(btn => btn.addEventListener('click', () => {
    pilotStage3d = btn.dataset.stg3d;
    apply3dChainHighlight();
    showDetail('pilot', 'FLOW-02-SCN-002');
  }));
  side.querySelectorAll('[data-cid3d]').forEach(el => el.addEventListener('click', ev => {
    ev.stopPropagation();
    showDetail('decision', el.dataset.cid3d);
  }));
  side.querySelectorAll('[data-card3d-file]').forEach(el => el.addEventListener('click', () => {
    openCardLightbox(el.dataset.card3dFile, el.dataset.card3dTitle || '');
  }));
  const expBtn = side.querySelector('[data-expand-pages3d]');
  if (expBtn) {
    expBtn.addEventListener('click', () => {
      side.querySelectorAll('.extra-page3d').forEach(p => { p.hidden = false; });
      expBtn.remove();
    });
  }
  side.querySelectorAll('[data-jump3d]').forEach(el => el.addEventListener('click', () => {
    const [k, v] = el.dataset.jump3d.split(':');
    if (k === 'seat') {
      if (!orgOnly.visible) switchView('cosmos');
      const seatBox = org.seats.find(x => x.id === v);
      if (seatBox) tweenCamera({ radius: Math.min(orbit.radius, 1180), target: [seatBox.x + seatBox.w / 2, 90, seatBox.y + seatBox.h / 2] });
    } else if (k === 'node') {
      if (!netGroup.visible) switchView('cosmos');
      const nd = net.nodes.find(x => x.id === v);
      if (nd) tweenCamera({ radius: Math.min(orbit.radius, 1650), target: [FCX - 800 + nd.x + nd.w / 2, SKY_Y + 40, FCZ - 800 + nd.y + nd.h / 2] });
    }
    showDetail(k, v);
  }));
  side.querySelectorAll('[data-jump-seat]').forEach(el => el.addEventListener('click', () => {
    const sid = el.dataset.jumpSeat;
    const isGov = sid.startsWith('MGT-');
    if (!orgOnly.visible) switchView('cosmos');
    const seatBox = org.seats.find(x => x.id === sid);
    if (seatBox) {
      tweenCamera({ radius: Math.min(orbit.radius, 1180), target: [seatBox.x + seatBox.w / 2, 90, seatBox.y + seatBox.h / 2] });
    }
    showDetail(isGov ? 'gov' : 'seat', sid);
  }));
  side.querySelectorAll('[data-jump-node]').forEach(el => el.addEventListener('click', () => {
    const nid = el.dataset.jumpNode;
    if (!netGroup.visible) switchView('cosmos');
    const nd = net.nodes.find(x => x.id === nid);
    if (nd) tweenCamera({ radius: Math.min(orbit.radius, 1650), target: [FCX - 800 + nd.x + nd.w / 2, SKY_Y + 40, FCZ - 800 + nd.y + nd.h / 2] });
    showDetail('node', nid);
  }));
}

// ---------- 四模态空间视图切换（cosmos 天地同屏 / org 办公层 / network 天幕层 / plan 平面俯视） ----------
function switchView(v) {
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  stage.dataset.view = v;
  const showOrg = v === 'cosmos' || v === 'org' || v === 'plan';
  const showNet = v === 'cosmos' || v === 'network';
  const showBeams = v === 'cosmos';
  orgOnly.visible = showOrg;
  netGroup.visible = showNet;
  beamGroup.visible = showBeams;
  if (v === 'plan') autoRotate = false;
  const preset = v === 'org'
    ? (closeupMode ? VIEW_PRESETS['org-closeup'] : VIEW_PRESETS.org)
    : (VIEW_PRESETS[v] || VIEW_PRESETS.cosmos);
  tweenCamera(preset);
  for (const l of labels) {
    if (l.kind === 'node') l.shown = showNet;
    if (l.kind === 'seat' || l.kind === 'band' || l.kind === 'sub' || l.kind === 'holo') l.shown = showOrg;
  }
}
stage.dataset.view = 'cosmos';
orgOnly.visible = true;
netGroup.visible = true;
beamGroup.visible = true;
for (const l of labels) {
  if (l.kind === 'node') l.shown = true;
}
document.querySelectorAll('#views button').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

document.querySelector('#closeup-btn').addEventListener('click', e => {
  closeupMode = !closeupMode;
  e.currentTarget.classList.toggle('active', closeupMode);
  if (stage.dataset.view === 'network') switchView('cosmos');
  tweenCamera(closeupMode ? VIEW_PRESETS['org-closeup'] : VIEW_PRESETS[stage.dataset.view] || VIEW_PRESETS.cosmos);
});

document.querySelector('#pilot3d-btn').addEventListener('click', e => {
  pilotMode = !pilotMode;
  e.currentTarget.classList.toggle('active', pilotMode);
  pilotRingGroup.visible = pilotMode;
  if (netGroup.userData.pilotRings) netGroup.userData.pilotRings.visible = pilotMode;
  if (flow) flow.setPilotNodes(pilotMode ? pilotNodeIds : null);
  beams.setFocus(pilotMode ? { seatIds: new Set([...pilotCoreIds, ...pilotCtxIds]), nodeIds: pilotNodeIds } : {});
  for (const [sid, mesh] of personBySeat.entries()) {
    const inPilot = pilotCoreIds.has(sid) || pilotCtxIds.has(sid);
    mesh.scale.setScalar(pilotMode && inPilot ? 1.12 : 1);
  }
  for (const l of labels) {
    const pinned = pilotMode && ((l.kind === 'seat' && (pilotCoreIds.has(l.id) || pilotCtxIds.has(l.id))) || (l.kind === 'node' && pilotNodeIds.has(l.id)));
    l.el.classList.toggle('pilot-pin', pinned);
  }
  if (pilotMode) showDetail('pilot', 'FLOW-02-SCN-002');
});

// ---------- 深空钛蓝 ⇄ 极昼浅色 3D 实时主题切换 ----------
function apply3dTheme(mode) {
  currentTheme3d = mode === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = currentTheme3d;
  const btn = document.querySelector('#theme-btn');
  if (btn) btn.textContent = currentTheme3d === 'dark' ? '☀ 极昼浅色' : '☾ 深空钛蓝';
  const bgHex = currentTheme3d === 'light' ? 0xdfe9f5 : hexToInt(SAGE_DARK.fogBg);
  scene.background.setHex(bgHex);
  scene.fog.color.setHex(bgHex);
  renderer.toneMappingExposure = currentTheme3d === 'light' ? 1.12 : 0.96;
  // 同步 3D 悬浮名片中的 64px 头像亮暗版本
  document.querySelectorAll('#labels3d .seat-avatar').forEach(img => {
    img.src = img.src.replace(/\/avatars\/(dark|light)\//, `/avatars/${currentTheme3d}/`);
  });
  if (selected3d && (selected3d.kind === 'seat' || selected3d.kind === 'gov')) {
    showDetail(selected3d.kind, selected3d.id);
  }
}
const themeBtn = document.querySelector('#theme-btn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => apply3dTheme(currentTheme3d === 'dark' ? 'light' : 'dark'));
}

// ---------- 3D 顶栏全局搜索 (#q3d) ----------
const q3dInput = document.querySelector('#q3d');
const q3dBox = document.querySelector('#q3d-results');
if (q3dInput && q3dBox) {
  q3dInput.addEventListener('input', () => {
    const q = q3dInput.value.trim().toLowerCase();
    if (!q) { q3dBox.hidden = true; q3dBox.innerHTML = ''; return; }
    const hits = [];
    for (const s of [...G.org.seats, ...G.org.governance]) {
      const hay = `${s.seat_id} ${s.alias} ${s.title} ${s.slot_id} ${s.slot_title} ${s.plane} ${s.source_group}`.toLowerCase();
      if (hay.includes(q)) hits.push({ kind: s.seat_id.startsWith('MGT-') ? 'gov' : 'seat', id: s.seat_id, label: `${s.seat_id} ${s.alias} · ${s.title}`, sub: `${s.slot_id} · ${s.plane}` });
    }
    for (const n of net.nodes) {
      const hay = `${n.id} ${n.title} ${n.short} ${n.codes}`.toLowerCase();
      if (hay.includes(q)) hits.push({ kind: 'node', id: n.id, label: `业务节点 · ${n.title}`, sub: n.codes });
    }
    for (const d of (G.decisions || [])) {
      if (d.id.toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q)) {
        hits.push({ kind: 'decision', id: d.id, label: `${d.id} · ${(d.title || '').slice(0, 26)}`, sub: `L${d.line}` });
        if (hits.length >= 24) break;
      }
    }
    if (!hits.length) {
      q3dBox.innerHTML = `<div class="q-item"><span>无匹配结果</span></div>`;
      q3dBox.hidden = false;
      return;
    }
    q3dBox.innerHTML = hits.slice(0, 18).map((h, i) =>
      `<div class="q-item" data-idx="${i}"><span>${h.label}</span><small>${h.sub}</small></div>`
    ).join('');
    q3dBox.hidden = false;
    q3dBox.querySelectorAll('.q-item').forEach((el, i) => el.addEventListener('click', () => {
      const h = hits[i];
      q3dBox.hidden = true;
      if (h.kind === 'seat') {
        if (!orgOnly.visible) switchView('cosmos');
        const seatBox = org.seats.find(x => x.id === h.id);
        if (seatBox) tweenCamera({ radius: 1080, target: [seatBox.x + seatBox.w / 2, 90, seatBox.y + seatBox.h / 2] });
      } else if (h.kind === 'node') {
        if (!netGroup.visible) switchView('cosmos');
        const nd = net.nodes.find(x => x.id === h.id);
        if (nd) tweenCamera({ radius: 1580, target: [FCX - 800 + nd.x + nd.w / 2, SKY_Y + 40, FCZ - 800 + nd.y + nd.h / 2] });
      }
      showDetail(h.kind, h.id);
    }));
  });
}

document.querySelector('#toggle-rotate').addEventListener('click', e => {
  autoRotate = !autoRotate;
  e.currentTarget.textContent = autoRotate ? '暂停旋转' : '继续旋转';
  e.currentTarget.classList.toggle('active', autoRotate);
});

document.querySelectorAll('[data-cam-zone]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-cam-zone]').forEach(b => b.classList.toggle('active', b === btn));
  const zKey = btn.dataset.camZone;
  if (zKey === 'all') {
    closeupMode = false;
    document.querySelector('#closeup-btn').classList.remove('active');
    switchView('cosmos');
  } else if (zKey === 'sky') {
    closeupMode = false;
    document.querySelector('#closeup-btn').classList.remove('active');
    switchView('network');
  } else if (zKey === 'holo') {
    if (!orgOnly.visible) switchView('cosmos');
    closeupMode = true;
    document.querySelector('#closeup-btn').classList.add('active');
    tweenCamera({ theta: 0, phi: Math.PI * 0.37, radius: 680, target: [FCX, 72, F.z1 - 120] });
    const curId = holoStage.getCurrentSeatId() || 'AGT-008';
    showDetail(curId.startsWith('MGT-') ? 'gov' : 'seat', curId);
  } else if (ZONE[zKey]) {
    if (!orgOnly.visible) switchView('cosmos');
    const z = ZONE[zKey];
    const zx = (z.x0 + z.x1) / 2, zz = (z.z0 + z.z1) / 2;
    const span = Math.max(z.x1 - z.x0, z.z1 - z.z0);
    closeupMode = true;
    document.querySelector('#closeup-btn').classList.add('active');
    tweenCamera({ theta: Math.PI * 0.22, phi: Math.PI * 0.35, radius: Math.max(820, Math.min(1550, span * 0.95)), target: [zx, 75, zz] });
  }
}));

// ---------- 标签投影 + 席位 LOD ----------
const v3 = new THREE.Vector3();
const LBL_PRIORITY = { holo: 6, band: 5, gov: 4, govnote: 4, node: 4, sub: 3, seat: 2 };
const placedRects = [];
function overlaps(a, b) {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

function projectLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const curView = stage.dataset.view;
  const orgVisible = orgOnly.visible;

  const seatShown = new Set();
  if (orgVisible && pilotMode) {
    for (const l of labels) {
      if (l.kind === 'seat' && (pilotCoreIds.has(l.id) || pilotCtxIds.has(l.id))) seatShown.add(l);
    }
  }
  if (orgVisible && (orbit.radius < 2900 || curView === 'plan')) {
    const cands = [];
    for (const l of labels) {
      if (l.kind !== 'seat') continue;
      v3.copy(l.pos).project(camera);
      if (v3.z > 1 || v3.z < -1) continue;
      cands.push({ l, d: v3.z });
    }
    cands.sort((a, b) => a.d - b.d);
    const maxPins = curView === 'plan' ? 50 : (orbit.radius < 1750 ? 26 : 16);
    for (const c of cands.slice(0, maxPins)) seatShown.add(c.l);
  }

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
                 p: (l.el.classList.contains('pilot-pin') ? 6 : (LBL_PRIORITY[l.kind] || 1)) });
  }
  cands.sort((a, b) => b.p - a.p);

  placedRects.length = 0;
  for (const c of cands) {
    if (placedRects.some(r => overlaps(c.rect, r))) { c.l.el.display = 'none'; c.l.el.style.display = 'none'; continue; }
    placedRects.push(c.rect);
    c.l.el.style.display = '';
    c.l.el.style.transform = `translate(${c.x}px,${c.y}px) translate(-50%,-50%)`;
  }
}

// ---------- 主循环 ----------
const clock = new THREE.Clock();
let elapsed = 0;
function tick() {
  const dt = STILL_MODE ? 0 : clock.getDelta();
  elapsed += dt;
  if (autoRotate && !dragging && !camTween && stage.dataset.view !== 'plan') orbit.theta += dt * 0.055;
  if (chaseMaterial) chaseMaterial.uniforms.uTime.value = STILL_MODE ? 2.4 : elapsed;
  hudRingGroup.rotation.y = STILL_MODE ? 0.2 : elapsed * 0.035;
  holoStage.update(dt);
  if (flow && netGroup.visible) flow.update(dt);
  if (beamGroup.visible) beams.update(dt);
  applyCamera();
  renderer.render(scene, camera);
  projectLabels();
  requestAnimationFrame(tick);
}

document.querySelector('#f-seats').textContent = `${org.seats.length} 位数字员工 + ${G.org.governance.length} 项管理规则包`;
document.querySelector('#gv').textContent = G.graph_version;
if (params.get('view') && VIEW_PRESETS[params.get('view')]) switchView(params.get('view'));
if (params.get('theme') === 'light') apply3dTheme('light');
if (params.get('closeup') === '1') {
  closeupMode = true;
  document.querySelector('#closeup-btn').classList.add('active');
  tweenCamera(VIEW_PRESETS['org-closeup'], 0);
}
window.__sc = {
  renderer, scene, camera, orbit, VIEW_PRESETS, tweenCamera, switchView, showDetail, apply3dTheme, holoStage, beams,
  getStats: () => ({
    view: stage.dataset.view,
    theme: currentTheme3d,
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    holoVoxels: holoStage.getActiveCount(),
    holoSeat: holoStage.getCurrentSeatId(),
    beams: beams.stats,
    flow: flow ? flow.stats : null,
  }),
};
tick();
