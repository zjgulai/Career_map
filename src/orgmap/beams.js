// 天地同屏：38 条跨层垂直能量光柱（连接 Y=0 地面数字员工工位 ⇄ Y=320 天幕经营网络节点）
// 全部 38 条光柱合并为 1 个 LineSegments + 1 个 Points（仅 2 个 draw calls）。
import * as THREE from './vendor/three.module.min.js';

const REL_COLOR = {
  direct_reuse: 0x74bfe8,
  sub_contributor: 0xaec8e2,
  evidence_input: 0x8adac4,
  boundary_contributor: 0xedb76c,
  readonly_consumer: 0x89a9f1,
  platform_steward: 0xbd98e5,
};

/**
 * buildCrosswalkBeams(orgSeats, netNodes, rawSeatsWithLinks, { netOffX, netOffZ, skyY })
 * 返回 { group, update(dt), setFocus({ seatIds, nodeIds }), stats }
 */
export function buildCrosswalkBeams(orgSeats, netNodes, rawSeatsWithLinks, opts = {}) {
  const netOffX = opts.netOffX || 0;
  const netOffZ = opts.netOffZ || 0;
  const skyY = opts.skyY || 320;

  const seatPosById = new Map();
  for (const s of orgSeats) {
    seatPosById.set(s.id, { x: s.x + s.w / 2, y: 84, z: s.y + s.h / 2 - 36 });
  }
  const nodePosById = new Map();
  for (const n of netNodes) {
    nodePosById.set(n.id, { x: netOffX + n.x + n.w / 2, y: skyY, z: netOffZ + n.y + n.h / 2 });
  }

  const beams = [];
  for (const s of rawSeatsWithLinks) {
    const sp = seatPosById.get(s.seat_id);
    if (!sp) continue;
    for (const lk of (s.node_links || [])) {
      const np = nodePosById.get(lk.node_id);
      if (!np) continue;
      const colorHex = REL_COLOR[lk.relation] || 0x74bfe8;
      const p0 = new THREE.Vector3(sp.x, sp.y, sp.z);
      const p3 = new THREE.Vector3(np.x, np.y, np.z);
      const p1 = new THREE.Vector3(sp.x, sp.y + (skyY - sp.y) * 0.38, sp.z);
      const p2 = new THREE.Vector3(np.x, sp.y + (skyY - sp.y) * 0.68, np.z);
      const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
      beams.push({
        seatId: s.seat_id,
        nodeId: lk.node_id,
        relation: lk.relation,
        color: new THREE.Color(colorHex),
        curve,
      });
    }
  }

  const SEGS = 24;
  const linePos = [];
  const lineBaseCol = [];
  const lineCol = [];
  const lineAlpha = [];

  for (const b of beams) {
    const pts = b.curve.getPoints(SEGS);
    for (let i = 0; i < SEGS; i++) {
      const t0 = i / SEGS, t1 = (i + 1) / SEGS;
      const a0 = 0.25 + 0.75 * Math.sin(Math.PI * t0);
      const a1 = 0.25 + 0.75 * Math.sin(Math.PI * t1);
      linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      lineBaseCol.push(
        b.color.r * a0, b.color.g * a0, b.color.b * a0,
        b.color.r * a1, b.color.g * a1, b.color.b * a1
      );
      lineAlpha.push(a0, a1);
      lineCol.push(
        b.color.r * a0 * 0.28, b.color.g * a0 * 0.28, b.color.b * a0 * 0.28,
        b.color.r * a1 * 0.28, b.color.g * a1 * 0.28, b.color.b * a1 * 0.28
      );
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lineColAttr = new THREE.Float32BufferAttribute(lineCol, 3);
  lineGeo.setAttribute('color', lineColAttr);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  // 每条光柱 2 颗向上传输的能量脉冲粒子
  const P = beams.length * 2;
  const ptPos = new Float32Array(P * 3);
  const ptCol = new Float32Array(P * 3);
  const ptSize = new Float32Array(P);
  const ptAlpha = new Float32Array(P);
  const pulses = [];

  beams.forEach((b, i) => {
    for (let j = 0; j < 2; j++) {
      const idx = i * 2 + j;
      pulses.push({ beamIdx: i, phase: (j * 0.5 + (i % 7) * 0.13) % 1, pos: 0 });
      ptCol[idx * 3] = b.color.r;
      ptCol[idx * 3 + 1] = b.color.g;
      ptCol[idx * 3 + 2] = b.color.b;
      ptSize[idx] = j === 0 ? 15 : 10;
      ptAlpha[idx] = 0.32;
    }
  });

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
  ptGeo.setAttribute('aColor', new THREE.BufferAttribute(ptCol, 3));
  ptGeo.setAttribute('aSize', new THREE.BufferAttribute(ptSize, 1));
  const ptAlphaAttr = new THREE.BufferAttribute(ptAlpha, 1);
  ptGeo.setAttribute('aAlpha', ptAlphaAttr);

  const ptMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPR: { value: 1 } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
      uniform float uPR;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vColor = aColor; vAlpha = aAlpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPR * (1400.0 / -mv.z), 2.0 * uPR, 24.0 * uPR);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        if (r > 0.5) discard;
        float core = smoothstep(0.5, 0.0, r);
        gl_FragColor = vec4(vColor * (0.6 + 0.8 * core), vAlpha * core);
      }
    `,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  points.frustumCulled = false;

  const group = new THREE.Group();
  group.add(lines, points);

  let lineWeightsDirty = false;
  let fadeTo = null; // 常规混合（浅色主题）时淡出目标 = 背景色；加法混合时为 null
  const beamWeights = new Float32Array(beams.length).fill(0.28);
  const beamTargets = new Float32Array(beams.length).fill(0.28);

  function setFocus({ seatIds = null, nodeIds = null } = {}) {
    const hasFilter = (seatIds && seatIds.size > 0) || (nodeIds && nodeIds.size > 0);
    beams.forEach((b, i) => {
      if (!hasFilter) {
        beamTargets[i] = 0.28;
      } else {
        const hitSeat = seatIds && seatIds.has(b.seatId);
        const hitNode = nodeIds && nodeIds.has(b.nodeId);
        beamTargets[i] = (hitSeat || hitNode) ? 1.15 : 0.05;
      }
    });
  }

  const vTmp = new THREE.Vector3();
  function update(dt) {
    dt = Math.min(dt, 0.05);
    let colorDirty = lineWeightsDirty;
    lineWeightsDirty = false;
    for (let i = 0; i < beams.length; i++) {
      const diff = beamTargets[i] - beamWeights[i];
      if (Math.abs(diff) > 0.002) {
        beamWeights[i] += diff * Math.min(1, dt * 10);
        colorDirty = true;
      }
    }
    if (colorDirty) {
      const arr = lineColAttr.array;
      const vertsPerBeam = SEGS * 2 * 3;
      for (let i = 0; i < beams.length; i++) {
        const w = beamWeights[i];
        const baseOffset = i * vertsPerBeam;
        if (fadeTo) {
          const c = beams[i].color;
          for (let v = 0; v < SEGS * 2; v++) {
            const t = Math.min(1, lineAlpha[i * SEGS * 2 + v] * w), o = baseOffset + v * 3;
            arr[o] = fadeTo.r + (c.r - fadeTo.r) * t;
            arr[o + 1] = fadeTo.g + (c.g - fadeTo.g) * t;
            arr[o + 2] = fadeTo.b + (c.b - fadeTo.b) * t;
          }
          continue;
        }
        for (let k = 0; k < vertsPerBeam; k++) {
          arr[baseOffset + k] = lineBaseCol[baseOffset + k] * w;
        }
      }
      lineColAttr.needsUpdate = true;
    }

    for (let pIdx = 0; pIdx < pulses.length; pIdx++) {
      const p = pulses[pIdx];
      const b = beams[p.beamIdx];
      const w = beamWeights[p.beamIdx];
      const speed = w > 0.5 ? 0.32 : 0.12;
      p.pos = (p.pos + dt * speed) % 1;
      const t = (p.phase + p.pos) % 1;
      b.curve.getPointAt(t, vTmp);
      ptPos[pIdx * 3] = vTmp.x;
      ptPos[pIdx * 3 + 1] = vTmp.y;
      ptPos[pIdx * 3 + 2] = vTmp.z;
      ptAlpha[pIdx] = Math.min(1.0, w * 0.95);
    }
    ptGeo.attributes.position.needsUpdate = true;
    ptAlphaAttr.needsUpdate = true;
  }

  function setPixelRatio(pr) {
    ptMat.uniforms.uPR.value = pr;
  }

  // 深色：加法发光（颜色乘亮度）；浅色：常规混合 + 墨彩，按亮度向背景色淡出——乘暗在常规混合下会变成黑线
  function setTheme(palette) {
    const additive = palette.additive;
    fadeTo = additive ? null : new THREE.Color(palette.bg);
    beams.forEach((b, i) => {
      b.color.set(palette.beam[b.relation] || palette.beam.direct_reuse);
      const vpb = SEGS * 2;
      for (let k = 0; k < vpb; k++) {
        const v = i * vpb + k, a = lineAlpha[v];
        lineBaseCol[v * 3] = b.color.r * a; lineBaseCol[v * 3 + 1] = b.color.g * a; lineBaseCol[v * 3 + 2] = b.color.b * a;
      }
      for (let j = 0; j < 2; j++) {
        const idx = i * 2 + j;
        ptCol[idx * 3] = b.color.r; ptCol[idx * 3 + 1] = b.color.g; ptCol[idx * 3 + 2] = b.color.b;
      }
    });
    ptGeo.attributes.aColor.needsUpdate = true;
    lineWeightsDirty = true;
    const blend = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    lineMat.blending = blend; ptMat.blending = blend;
    lineMat.needsUpdate = true; ptMat.needsUpdate = true;
  }

  return {
    group,
    update,
    setFocus,
    setPixelRatio,
    setTheme,
    stats: { beamCount: beams.length, pulsePoints: P },
  };
}
