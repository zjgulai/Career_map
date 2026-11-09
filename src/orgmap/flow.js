// 流动关系线：静态折线 + 沿曲线移动的彗星粒子。123 条边合成 1 个 LineSegments + 1 个 Points。
import * as THREE from './vendor/three.module.min.js';
import { SAGE_DARK, hexToInt } from './theme.js?v=49';

const KIND_HEX = {
  baseline: SAGE_DARK.flowBaseline,
  feedback: SAGE_DARK.flowFeedback,
  plain: SAGE_DARK.flowPlain,
};
const KIND_COLOR = Object.fromEntries(Object.entries(KIND_HEX).map(([k, v]) => [k, hexToInt(v)]));
const KIND_LAYER = { baseline: 2, feedback: 1, plain: 0 };
// 每边彗星数 / 点尺寸 / 速度 / 尾长 / 亮度
const KIND_FLOW = {
  baseline: { n: 6, size: 17, speed: 0.085, tail: 0.028, alpha: 1.0 },
  feedback: { n: 5, size: 14, speed: 0.105, tail: 0.024, alpha: 0.92 },
  plain: { n: 3, size: 9, speed: 0.055, tail: 0.016, alpha: 0.22 },
};
const SEGS = 40;

function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// 6 点 CatmullRom：起终点抬到台座顶，中间按 chord/layer/hash 抬升并侧向弓出
function buildCurve(a, b, hA, hB, kind, k, seed) {
  const ax = a.x + a.w / 2, az = a.y + a.h / 2;
  const bx = b.x + b.w / 2, bz = b.y + b.h / 2;
  const chord = Math.hypot(bx - ax, bz - az);
  const layer = KIND_LAYER[kind] || 0;
  const lift = 58 + chord * 0.13 + layer * 26 + (seed % 5) * 4 + k * 10;
  // 规范方向求法向：保证 A→B 与 B→A 的弓向相反而不是重合
  const flip = a.id > b.id ? -1 : 1;
  const nx = -(bz - az) / (chord || 1), nz = (bx - ax) / (chord || 1);
  const bow = (chord * 0.055 + (seed % 3) * 6) * flip * (k % 2 ? -1 : 1);
  const p0 = new THREE.Vector3(ax, hA + 4, az);
  const p5 = new THREE.Vector3(bx, hB + 4, bz);
  const mk = (t, up) => new THREE.Vector3(
    ax + (bx - ax) * t + nx * bow * Math.sin(Math.PI * t),
    Math.max(hA, hB) + lift * up,
    az + (bz - az) * t + nz * bow * Math.sin(Math.PI * t)
  );
  return new THREE.CatmullRomCurve3(
    [p0, mk(0.18, 0.55), mk(0.36, 0.95), mk(0.64, 0.95), mk(0.82, 0.55), p5],
    false, 'centripetal', 0.5
  );
}

/**
 * buildFlowLines(nodes, relations) → { group, update(dt), setHover(nodeId), stats }
 */
export function buildFlowLines(nodes, relations) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const heightOf = n => 50 + (n.pages ? n.pages.length : 1) * 4;

  // 同一无序节点对计数，用于错开弓向
  const pairSeen = new Map();
  const valid = [];
  for (const r of relations) {
    const a = byId.get(r.source), b = byId.get(r.target);
    if (!a || !b) continue;
    const kind = r.feedback ? 'feedback' : r.baseline ? 'baseline' : 'plain';
    const pairKey = [r.source, r.target].sort().join('|');
    const k = pairSeen.get(pairKey) || 0;
    pairSeen.set(pairKey, k + 1);
    const seed = hash(r.id || pairKey);
    valid.push({ a, b, kind, k, seed, curve: buildCurve(a, b, heightOf(a), heightOf(b), kind, k, seed) });
  }

  // ---- 静态折线（1 个 LineSegments） ----
  const linePos = [];
  const lineCol = [];
  const lineAlpha = [];
  const lineKind = [];
  const tmp = new THREE.Vector3();
  for (const e of valid) {
    const c = new THREE.Color(KIND_COLOR[e.kind]);
    const baseAlpha = e.kind === 'plain' ? 0.30 : 0.85;
    const pts = e.curve.getPoints(SEGS);
    for (let i = 0; i < SEGS; i++) {
      const t0 = i / SEGS, t1 = (i + 1) / SEGS;
      // 端点渐隐，避免和台座硬接
      const a0 = baseAlpha * (0.35 + 0.65 * Math.sin(Math.PI * t0));
      const a1 = baseAlpha * (0.35 + 0.65 * Math.sin(Math.PI * t1));
      linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      lineCol.push(c.r * a0, c.g * a0, c.b * a0, c.r * a1, c.g * a1, c.b * a1);
      lineAlpha.push(a0, a1); lineKind.push(e.kind, e.kind);
    }
    // 终点箭头（两段短线）
    const tip = e.curve.getPointAt(0.995);
    const back = e.curve.getPointAt(0.95);
    const dir = new THREE.Vector3().subVectors(tip, back).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    const A = tip.clone().addScaledVector(dir, -20);
    for (const sgn of [1, -1]) {
      const w = A.clone().addScaledVector(side, 9 * sgn);
      linePos.push(tip.x, tip.y, tip.z, w.x, w.y, w.z);
      lineCol.push(c.r * baseAlpha * 1.4, c.g * baseAlpha * 1.4, c.b * baseAlpha * 1.4,
                   c.r * baseAlpha * 1.4, c.g * baseAlpha * 1.4, c.b * baseAlpha * 1.4);
      lineAlpha.push(baseAlpha * 1.4, baseAlpha * 1.4); lineKind.push(e.kind, e.kind);
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lineColAttr = new THREE.Float32BufferAttribute(lineCol, 3);
  lineGeo.setAttribute('color', lineColAttr);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 1, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  // ---- 彗星粒子（1 个 Points，每颗 2 顶点：头 + 尾） ----
  const comet = [];
  for (const e of valid) {
    const conf = KIND_FLOW[e.kind];
    for (let i = 0; i < conf.n; i++) {
      comet.push({ e, conf, phase: (i / conf.n) + (e.seed % 17) / 100, pos: 0, target: 0 });
    }
  }
  const P = comet.length * 2;
  const ptPos = new Float32Array(P * 3);
  const ptCol = new Float32Array(P * 3);
  const ptSize = new Float32Array(P);
  const ptAlpha = new Float32Array(P);
  comet.forEach((c, i) => {
    const col = new THREE.Color(KIND_COLOR[c.e.kind]);
    for (let j = 0; j < 2; j++) {
      ptCol[(i * 2 + j) * 3] = col.r;
      ptCol[(i * 2 + j) * 3 + 1] = col.g;
      ptCol[(i * 2 + j) * 3 + 2] = col.b;
      ptSize[i * 2 + j] = j === 0 ? c.conf.size : c.conf.size * 0.5;
      ptAlpha[i * 2 + j] = j === 0 ? c.conf.alpha : c.conf.alpha * 0.25;
    }
  });
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
  const ptColAttr = new THREE.BufferAttribute(ptCol, 3);
  ptGeo.setAttribute('aColor', ptColAttr);
  ptGeo.setAttribute('aSize', new THREE.BufferAttribute(ptSize, 1));
  ptGeo.setAttribute('aAlpha', new THREE.BufferAttribute(ptAlpha, 1));

  const ptMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uPR: { value: 1 } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
      uniform float uPR;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vColor = aColor; vAlpha = aAlpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPR * (1400.0 / -mv.z), 2.0 * uPR, 26.0 * uPR);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        if (r > 0.5) discard;
        float core = smoothstep(0.5, 0.0, r);
        gl_FragColor = vec4(vColor * (0.5 + 0.9 * core), vAlpha * core);
      }`,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  points.frustumCulled = false;

  const group = new THREE.Group();
  group.add(lines, points);

  // ---- hover：相关边 1.0，无关边 0.07 并减速 ----
  const edgeWeight = new Float32Array(valid.length).fill(1);
  const edgeTarget = new Float32Array(valid.length).fill(1);
  let hoverNode = null;
  let pilotNodes = null;

  function recomputeTargets() {
    valid.forEach((e, i) => {
      if (hoverNode) {
        edgeTarget[i] = (e.a.id === hoverNode || e.b.id === hoverNode) ? 1 : 0.07;
      } else if (pilotNodes && pilotNodes.size) {
        const both = pilotNodes.has(e.a.id) && pilotNodes.has(e.b.id);
        const one = pilotNodes.has(e.a.id) || pilotNodes.has(e.b.id);
        edgeTarget[i] = both ? 1.25 : one ? 0.55 : 0.06;
      } else {
        edgeTarget[i] = 1;
      }
    });
  }
  function setHover(nodeId) { hoverNode = nodeId; recomputeTargets(); }
  function setPilotNodes(nodeSet) { pilotNodes = nodeSet; recomputeTargets(); }

  const vHead = new THREE.Vector3(), vTail = new THREE.Vector3();
  let t = 0;

  function update(dt) {
    dt = Math.min(dt, 0.05);
    t += dt;
    // 权重平滑过渡
    for (let i = 0; i < valid.length; i++) {
      const d = edgeTarget[i] - edgeWeight[i];
      if (Math.abs(d) > 0.001) edgeWeight[i] = edgeWeight[i] + d * Math.min(1, dt * 9);
    }
    for (let i = 0; i < comet.length; i++) {
      const c = comet[i];
      const w = edgeWeight[valid.indexOf(c.e)];
      const activeFilter = !!(hoverNode || (pilotNodes && pilotNodes.size));
      const speedScale = activeFilter ? (w > 0.45 ? 1.15 : 0.16) : 1;
      c.pos = (c.pos + dt * c.conf.speed * speedScale) % 1;
      const head = (c.phase + c.pos) % 1;
      const tail = (head - c.conf.tail + 1) % 1;
      c.e.curve.getPointAt(head, vHead);
      c.e.curve.getPointAt(tail, vTail);
      const o = i * 6;
      ptPos[o] = vHead.x; ptPos[o + 1] = vHead.y; ptPos[o + 2] = vHead.z;
      ptPos[o + 3] = vTail.x; ptPos[o + 4] = vTail.y; ptPos[o + 5] = vTail.z;
      // 无关边压暗（写 opacity 属性太贵，直接缩着色）
      const aScale = activeFilter ? (w > 0.45 ? Math.min(1.25, w) : 0.10) : 1;
      ptAlpha[i * 2] = c.conf.alpha * aScale;
      ptAlpha[i * 2 + 1] = c.conf.alpha * 0.25 * aScale;
    }
    ptGeo.attributes.position.needsUpdate = true;
    ptGeo.attributes.aAlpha.needsUpdate = true;
    // 静态线随 hover 整体压暗（一次 uniform 写入）
    lineMat.opacity = (hoverNode || (pilotNodes && pilotNodes.size)) ? 0.52 : 1;
  }
  function setPixelRatio(pr) { ptMat.uniforms.uPR.value = pr; }

  // 深色：加法发光（颜色乘亮度）；浅色：常规混合，按同一亮度向背景色淡出，保住主线/反馈/协同三档层级
  function setTheme(palette) {
    const additive = palette.additive;
    const bg = new THREE.Color(palette.bg);
    const cols = Object.fromEntries(Object.entries(palette.flow).map(([k, v]) => [k, new THREE.Color(v)]));
    const arr = lineColAttr.array;
    for (let i = 0; i < lineKind.length; i++) {
      const c = cols[lineKind[i]], a = lineAlpha[i];
      if (additive) { arr[i * 3] = c.r * a; arr[i * 3 + 1] = c.g * a; arr[i * 3 + 2] = c.b * a; continue; }
      const t = Math.min(1, a);
      arr[i * 3] = bg.r + (c.r - bg.r) * t; arr[i * 3 + 1] = bg.g + (c.g - bg.g) * t; arr[i * 3 + 2] = bg.b + (c.b - bg.b) * t;
    }
    lineColAttr.needsUpdate = true;
    comet.forEach((cm, i) => {
      const c = cols[cm.e.kind];
      for (let j = 0; j < 2; j++) {
        ptCol[(i * 2 + j) * 3] = c.r; ptCol[(i * 2 + j) * 3 + 1] = c.g; ptCol[(i * 2 + j) * 3 + 2] = c.b;
      }
    });
    ptColAttr.needsUpdate = true;
    const blend = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    lineMat.blending = blend; ptMat.blending = blend;
    lineMat.needsUpdate = true; ptMat.needsUpdate = true;
  }

  return {
    group, update, setHover, setPilotNodes, setPixelRatio, setTheme,
    stats: { edges: valid.length, comets: comet.length, lineVerts: linePos.length / 3, pointVerts: P },
  };
}
