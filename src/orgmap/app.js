import * as THREE from './vendor/three.module.min.js';
import { BOARD, layoutOrg, layoutNetwork } from './layout.js?v=4';

const G = window.SANBAO_GRAPH;
const $ = sel => document.querySelector(sel);
const stage = $('#stage'), canvas = $('#gl'), labels = $('#labels');

const COLORS = {
  board: 0xf1f0e9, band: 0xe7eee5, block: 0xffffff, pad: 0xe3ebe2,
  card: 0xfffefb, shadow: 0x1b2a24,
  baseline: 0x2d6756, feedback: 0xa8792c, plain: 0x98a29a,
};
const FONT_MIN = 12;
const SEAT_FULL = 0.9, SEAT_COMPACT = 0.45;
function seatMode(s){ return s >= SEAT_FULL ? 'full' : s >= SEAT_COMPACT ? 'compact' : 'hidden'; }

let lastEdgeScale = 0;
const state = { view: 'org', cx: BOARD / 2, cy: BOARD / 2, scale: 1,
                selected: null, hovered: null, dragging: false, moved: 0 };

const org = layoutOrg(G.org);
const net = layoutNetwork(G.network);

// ---------- three ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.board);
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
camera.position.z = 600;
scene.add(camera);

const orgSolid = { pos: [], col: [] }, orgShadow = { pos: [], col: [] };
const netBase = { pos: [], col: [] };
const netSolid = { pos: [], col: [] }, netShadow = { pos: [], col: [] };
const edgeBatch = { pos: [], col: [] };

function pushQuad(batch, x, y, w, h, z, hex) {
  const c = new THREE.Color(hex);
  const x1 = x + w, yt = -y, yb = -(y + h);
  const v = [[x, yb], [x1, yb], [x1, yt], [x, yb], [x1, yt], [x, yt]];
  for (const [vx, vy] of v) { batch.pos.push(vx, vy, z); batch.col.push(c.r, c.g, c.b); }
}
function pushShadow(batch, x, y, w, h, z) {
  const c = new THREE.Color(COLORS.shadow);
  const off = 3, x1 = x + w, yt = -y - off, yb = -(y + h) - off;
  const v = [[x, yb], [x1, yb], [x1, yt], [x, yb], [x1, yt], [x, yt]];
  for (const [vx, vy] of v) { batch.pos.push(vx, vy, z); batch.col.push(c.r, c.g, c.b); }
}
function batchMesh(batch, z, opacity) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(batch.pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(batch.col, 3));
  const m = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: opacity < 1, opacity, depthTest: false });
  const mesh = new THREE.Mesh(g, m);
  mesh.renderOrder = z;
  return mesh;
}

function buildOrgScene() {
  pushQuad(orgSolid, 0, 0, BOARD, BOARD, 0, COLORS.board);
  for (const b of org.bands) pushQuad(orgSolid, b.x, b.y, b.w, b.h, 1, COLORS.band);
  for (const b of org.blocks) { pushShadow(orgShadow, b.x, b.y, b.w, b.h, 2); pushQuad(orgSolid, b.x, b.y, b.w, b.h, 3, COLORS.block); }
  for (const s of org.seats) { pushShadow(orgShadow, s.x, s.y, s.w, s.h, 4); pushQuad(orgSolid, s.x, s.y, s.w, s.h, 5, COLORS.pad); }
  for (const g of org.governance) { pushShadow(orgShadow, g.x, g.y, g.w, g.h, 4); pushQuad(orgSolid, g.x, g.y, g.w, g.h, 5, 0xf8f2e0); }
}
function buildNetScene() {
  pushQuad(netBase, 0, 0, BOARD, BOARD, 0, COLORS.board);
  for (const n of net.nodes) { pushShadow(netShadow, n.x, n.y, n.w, n.h, 4); pushQuad(netSolid, n.x, n.y, n.w, n.h, 5, COLORS.card); }
}
buildOrgScene();
buildNetScene();
const orgGroup = new THREE.Group();
orgGroup.add(batchMesh(orgSolid, 1, 1), batchMesh(orgShadow, 2, 0.07));
const netBaseMesh = batchMesh(netBase, 1, 1); netBaseMesh.renderOrder = 1;
const netCardsMesh = batchMesh(netSolid, 5, 1); netCardsMesh.renderOrder = 3;
const netShadowMesh = batchMesh(netShadow, 6, 0.07); netShadowMesh.renderOrder = 2;
const netGroup = new THREE.Group();
netGroup.add(netBaseMesh, netShadowMesh, netCardsMesh);
scene.add(orgGroup, netGroup);
const edgeMesh = batchMesh(edgeBatch, 3, 0.95);
edgeMesh.renderOrder = 2.5;
scene.add(edgeMesh);

// ---------- edges ----------
function rebuildEdges() {
  edgeBatch.pos.length = 0; edgeBatch.col.length = 0;
  if (state.view !== 'network') { edgeMesh.geometry.dispose(); edgeMesh.geometry = new THREE.BufferGeometry(); return; }
  const width = 3.2 / state.scale;
  const sel = state.selected;
  for (const e of net.edges) {
    if (!e) continue;
    const dim = sel && e.source !== sel && e.target !== sel;
    const base = e.kind === 'feedback' ? COLORS.feedback : e.kind === 'baseline' ? COLORS.baseline : COLORS.plain;
    const color = new THREE.Color(base);
    if (dim) color.multiplyScalar(1.35);
    const pts = e.points;
    for (let i = 0; i < pts.length - 1; i++) pushSegment(pts[i], pts[i + 1], width, color);
    pushArrow(pts[pts.length - 2], pts[pts.length - 1], width * 2.2, color);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(edgeBatch.pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(edgeBatch.col, 3));
  edgeMesh.geometry.dispose();
  edgeMesh.geometry = g;
}
function pushSegment(a, b, w, c) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len * w / 2, ny = dx / len * w / 2;
  const quad = [[a.x + nx, -a.y + ny], [b.x + nx, -b.y + ny], [b.x - nx, -b.y + ny],
                [a.x + nx, -a.y + ny], [b.x - nx, -b.y + ny], [a.x - nx, -a.y - ny]];
  for (const [x, y] of quad) { edgeBatch.pos.push(x, y, 6); edgeBatch.col.push(c.r, c.g, c.b); }
}
function pushArrow(a, b, size, c) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  const tip = { x: b.x, y: b.y };
  const back = { x: b.x - ux * size * 2.4, y: b.y - uy * size * 2.4 };
  const tri = [[tip.x, -tip.y], [back.x + px * size, -back.y - py * size], [back.x - px * size, -back.y + py * size]];
  for (const [x, y] of tri) { edgeBatch.pos.push(x, y, 6); edgeBatch.col.push(c.r, c.g, c.b); }
}

// ---------- labels ----------
const labelEls = [];
function mk(tag, cls, html, data) {
  const el = document.createElement(tag);
  el.className = cls;
  el.innerHTML = html;
  if (data) Object.assign(el.dataset, data);
  labels.appendChild(el);
  return el;
}
function buildLabels() {
  labels.innerHTML = ''; labelEls.length = 0;
  if (state.view === 'org') {
    for (const b of org.bands) labelEls.push({ el: mk('div', 'band-label', `${b.name} · ${b.seat_count} 席`, { kind: 'band', id: b.id }), x: b.x + 4, y: b.y + 12, kind: 'band' });
    for (const g of org.blocks) labelEls.push({ el: mk('div', 'block-label' + (g.shared ? ' shared' : ''), `${g.level2Name} · ${g.seats.length}`, { kind: 'block', id: g.level2 }), x: g.x + g.w / 2, y: g.y + 15, kind: 'block' });
    for (const s of org.seats) {
      const el = mk('div', 'seat' + (s.status === 'UNVERIFIED' ? ' unverified' : s.status === 'PARTIAL' ? ' partial' : ''), `<b>${s.alias}</b><small>${s.id}</small>`, { kind: 'seat', id: s.id });
      el.title = `${s.id} ${s.alias} · ${s.title}`;
      el.addEventListener('click', ev => { ev.stopPropagation(); select({ kind: 'seat', id: s.id }); });
      labelEls.push({ el, x: s.x + s.w / 2, y: s.y + s.h / 2, kind: 'seat' });
    }
    for (const g of org.governance) {
      const el = mk('div', 'gov', `${g.id} ${g.alias}`, { kind: 'gov', id: g.id });
      el.title = 'T4 决策权参照，不是 Agent 席位';
      el.addEventListener('click', ev => { ev.stopPropagation(); select({ kind: 'gov', id: g.id }); });
      labelEls.push({ el, baseW: g.w, x: g.x + g.w / 2, y: g.y + g.h / 2, kind: 'gov' });
    }
  } else {
    if (net.nodes.some(n => n.lens)) {
      labelEls.push({ el: mk('div', 'band-label', '跨域镜头 · 不属主网格', { kind: 'lens' }), x: 300, y: net.lensY - 30, kind: 'lens' });
    }
    for (const n of net.nodes) {
      const el = mk('div', 'node', `<b>${n.title}</b><span>${n.short}</span><small>${n.codes}</small>`, { kind: 'node', id: n.id });
      el.addEventListener('click', ev => { ev.stopPropagation(); select({ kind: 'node', id: n.id }); });
      labelEls.push({ el, baseW: n.w, baseH: n.h, x: n.x + n.w / 2, y: n.y + n.h / 2, kind: 'node' });
    }
  }
}

// ---------- view ----------
function w2s(x, y) {
  return { x: (x - state.cx) * state.scale + stage.clientWidth / 2,
           y: (y - state.cy) * state.scale + stage.clientHeight / 2 };
}
function applyView() {
  orgGroup.visible = state.view === 'org';
  netGroup.visible = state.view === 'network';
  edgeMesh.visible = state.view === 'network';
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  const hw = w / 2 / state.scale, hh = h / 2 / state.scale;
  camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh;
  camera.position.x = state.cx; camera.position.y = -state.cy;
  camera.updateProjectionMatrix();
  for (const l of labelEls) {
    const p = w2s(l.x, l.y);
    l.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`;
    if (l.kind === 'seat') {
      const mode = seatMode(state.scale);
      l.el.style.display = mode === 'hidden' ? 'none' : '';
      l.el.classList.toggle('compact', mode === 'compact');
    }
    if (l.kind === 'block') l.el.style.display = state.scale < 0.45 ? 'none' : '';
    if (l.kind === 'gov') {
      l.el.style.display = state.scale < 0.4 ? 'none' : '';
      l.el.style.width = `${Math.max(96, l.baseW * state.scale)}px`;
    }
    if (l.kind === 'node') {
      const tiny = state.scale < 0.45;
      l.el.classList.toggle('tiny', tiny);
      l.el.classList.toggle('compacttext', state.scale < 0.68);
      if (tiny) { l.el.style.width = '84px'; l.el.style.maxHeight = '26px'; }
      else {
        l.el.style.width = `${Math.max(150, l.baseW * state.scale - 10)}px`;
        l.el.style.maxHeight = `${Math.max(64, l.baseH * state.scale - 8)}px`;
      }
    }
  }
  $('#zoom').textContent = `${Math.round(state.scale * 100)}%`;
  if (state.scale !== lastEdgeScale) { lastEdgeScale = state.scale; rebuildEdges(); }
  renderer.render(scene, camera);
}
function fit(bounds, pad = 60) {
  const w = Math.max(80, stage.clientWidth - pad), h = Math.max(80, stage.clientHeight - pad);
  state.scale = Math.min(w / bounds.w, h / bounds.h);
  state.cx = bounds.x + bounds.w / 2;
  state.cy = bounds.y + bounds.h / 2;
}
function fitOrg() {
  const xs = [...org.seats, ...org.governance].map(s => s.x), ys = [...org.seats, ...org.governance].map(s => s.y);
  const xe = org.seats.map(s => s.x + s.w), ye = org.seats.map(s => s.y + s.h);
  fit({ x: Math.min(...xs) - 20, y: Math.min(...ys) - 20,
        w: Math.max(...xe) - Math.min(...xs) + 40, h: Math.max(...ye) - Math.min(...ys) + 40 });
}
function fitNet() {
  const xs = net.nodes.map(n => n.x), ys = net.nodes.map(n => n.y);
  fit({ x: Math.min(...xs) - 30, y: Math.min(...ys) - 30,
        w: Math.max(...net.nodes.map(n => n.x + n.w)) - Math.min(...xs) + 60,
        h: Math.max(...net.nodes.map(n => n.y + n.h)) - Math.min(...ys) + 60 });
}

// ---------- interaction ----------
let drag = null;
canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, cx: state.cx, cy: state.cy }; state.moved = 0; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  state.moved = Math.max(state.moved, Math.hypot(dx, dy));
  state.cx = drag.cx - dx / state.scale;
  state.cy = drag.cy - dy / state.scale;
  applyView();
});
canvas.addEventListener('pointerup', e => { drag = null; canvas.releasePointerCapture(e.pointerId); });
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  const before = { x: (e.clientX - r.left - r.width / 2) / state.scale + state.cx,
                   y: (e.clientY - r.top - r.height / 2) / state.scale + state.cy };
  state.scale = Math.min(2.5, Math.max(0.25, state.scale * Math.exp(-e.deltaY * 0.0015)));
  state.cx = before.x - (e.clientX - r.left - r.width / 2) / state.scale;
  state.cy = before.y - (e.clientY - r.top - r.height / 2) / state.scale;
  applyView();
}, { passive: false });
canvas.addEventListener('click', () => select(null));

document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b === btn));
  state.view = btn.dataset.view; state.selected = null;
  buildLabels(); state.view === 'org' ? fitOrg() : fitNet(); lastEdgeScale = -1; applyView(); side(null);
  if (AUDIT_MODE) setTimeout(() => audit(), 120);
}));
addEventListener('resize', () => { applyView(); if (AUDIT_MODE) setTimeout(() => audit(), 120); });
addEventListener('keydown', e => { if (e.key === 'Escape') { select(null); } });

// ---------- selection & side panel ----------
function select(sel) {
  state.selected = sel && sel.id || null;
  for (const l of labelEls) {
    l.el.classList.toggle('selected', !!sel && l.el.dataset.id === sel.id);
    if (l.kind === 'node' && sel) l.el.classList.toggle('dim', !isNeighbor(sel.id, l.el.dataset.id));
  }
  rebuildEdges();
  renderer.render(scene, camera);
  side(sel);
}
function isNeighbor(a, b) {
  if (a === b) return true;
  return net.edges.some(e => e && ((e.source === a && e.target === b) || (e.source === b && e.target === a)));
}
function side(sel) {
  const el = $('#side');
  if (!sel) { el.innerHTML = sideEl.dataset.empty; fillFacts(); return; }
  if (sel.kind === 'seat' || sel.kind === 'gov') {
    const s = sel.kind === 'gov' ? org.governance.find(g => g.id === sel.id) : G.org.seats.find(x => x.seat_id === sel.id);
    const meta = G.org.seats.find(x => x.seat_id === sel.id);
    const sid = s.seat_id || s.id;
    el.innerHTML = `<h2>${s.alias} · ${sid}</h2>
      <p>${s.title}</p>
      ${meta ? `<p><span class="tag">${meta.plane}</span><span class="tag">${meta.source_group}</span><span class="tag">${meta.tier}</span>
      <span class="tag warn">${meta.admission_status}</span></p>
      <dl class="facts"><dt>生产授权</dt><dd>${meta.production_authorized ? '是' : '否'}</dd><dt>运行身份</dt><dd>${meta.runtime_identity_status ? '是' : '否'}</dd>
      <dt>catalog_ref</dt><dd>断链（目标文件不存在）</dd></dl>` : `<p>治理参照：T4 决策权规则，不是 Agent 席位。</p>`}
      <p style="margin-top:14px">席位到卡片的映射没有权威来源，本页不提供跳转。</p>`;
    return;
  }
  const n = net.nodes.find(x => x.id === sel.id);
  const rels = net.edges.filter(e => e && (e.source === sel.id || e.target === sel.id));
  el.innerHTML = `<h2>${n.title}</h2><p>${n.short}</p>
    <p><span class="tag">${n.codes}</span></p>
    <p>${rels.length} 条关系 · ${n.pages.length} 张卡引用</p>
    ${rels.map(e => {
      const other = e.source === sel.id ? e.target : e.source;
      const o = net.nodes.find(x => x.id === other);
      const dir = e.source === sel.id ? '→' : '←';
      const kinds = [e.baseline ? '主线' : '', e.feedback ? '反馈' : ''].filter(Boolean).join(' + ') || '未标注';
      const obj = e.object ? ` · ${e.object}` : '';
      return `<div class="rel" data-jump="${other}"><div class="obj">${dir} ${o ? o.title : other}${obj}</div>
        <div class="meta">${kinds} · ${(e.codes || []).join(' / ')}</div></div>`;
    }).join('')}
    <h2 style="font-size:13px;margin-top:18px">来源卡</h2>
    <p>该节点出现在以下卡片中。链接直接打开原页，不复制正文。</p>
    ${[n.primary_page, ...n.pages.filter(f => f !== n.primary_page)].slice(0, 4).map((f, i) =>
      `<div class="rel"><a href="../../.superpowers/brainstorm/38196-1789923100/content/${f}" target="_blank" rel="noopener">${i === 0 ? '主卡 · ' : ''}${f.replace('.html', '')}</a></div>`).join('')}
    ${(() => { const all = [n.primary_page, ...n.pages.filter(f => f !== n.primary_page)]; return all.length > 4 ? `<p>另有 ${all.length - 4} 张卡引用。</p>` : ''; })()}
    ${net.unresolved.length ? `<p style="margin-top:12px">另有 ${net.unresolved.length} 条关系引用未声明节点，未绘制。</p>` : ''}`;
  el.querySelectorAll('[data-jump]').forEach(d => d.addEventListener('click', () => select({ kind: 'node', id: d.dataset.jump })));
}

// 保存空态模板，避免选择后丢失
const sideEl = $('#side'); sideEl.dataset.empty = sideEl.innerHTML;

// ---------- audit ----------
function audit() {
  const issues = [];
  const boxes = [...labels.children].filter(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none')
    .map(el => ({ el, r: el.getBoundingClientRect(), fs: parseFloat(getComputedStyle(el).fontSize) }));
  for (const b of boxes) {
    if (b.el.scrollWidth > b.el.clientWidth + 1 || b.el.scrollHeight > b.el.clientHeight + 1) {
      issues.push(`内容被截断: ${b.el.textContent.trim().slice(0, 16)}`);
    }
    const all = [b.el, ...b.el.querySelectorAll('*')].filter(el => el.textContent.trim());
    for (const el of all) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < FONT_MIN) { issues.push(`字号 ${fs}px < ${FONT_MIN}px: ${el.textContent.trim().slice(0, 18)}`); break; }
    }
  }
  let collisions = 0;
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i].r, b = boxes[j].r;
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) {
      collisions++;
      if (collisions <= 6) issues.push(`标签重叠: ${boxes[i].el.textContent.slice(0, 14)} × ${boxes[j].el.textContent.slice(0, 14)}`);
    }
  }
  let obstructed = 0;
  if (state.view === 'network') {
    const cards = net.nodes.map(n => {
      const a = w2s(n.x, n.y), b = w2s(n.x + n.w, n.y + n.h);
      return { id: n.id, left: a.x, top: a.y, right: b.x, bottom: b.y };
    });
    for (const e of net.edges) {
      if (!e) continue;
      const skip = new Set([e.source, e.target]);
      const total = e.points.reduce((s, p, i) => i ? s + Math.hypot(p.x - e.points[i - 1].x, p.y - e.points[i - 1].y) : 0, 0);
      let walked = 0;
      for (let i = 0; i < e.points.length - 1; i++) {
        const a = e.points[i], b = e.points[i + 1], len = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(2, Math.floor(len / 10));
        for (let s = 1; s < steps; s++) {
          const t = s / steps, wx = a.x + (b.x - a.x) * t, wy = a.y + (b.y - a.y) * t;
          const at = walked + len * t;
          if (at < 26 || total - at < 26) continue;
          const p = w2s(wx, wy);
          if (cards.some(c => !skip.has(c.id) && p.x > c.left + 2 && p.x < c.right - 2 && p.y > c.top + 2 && p.y < c.bottom - 2)) {
            obstructed++;
            break;
          }
        }
        walked += len;
      }
    }
  }
  // 关系线画在卡片下层：即使几何穿过卡片也不遮挡文字，只记录被遮段数。
  const aggregate = state.view === 'org' && state.scale < 0.45;
  const coverage = aggregate ? 'aggregate' : boxes.length < 8 ? 'empty' : boxes.length < 20 ? 'reduced' : 'full';
  const ok = collisions === 0 && obstructed === 0 && issues.length === 0 && (coverage === 'full' || coverage === 'reduced' || coverage === 'aggregate');
  const box = $('#audit');
  box.hidden = false;
  box.className = ok ? 'pass' : 'fail';
  box.textContent = `AUDIT ${ok ? 'PASS' : 'FAIL'} · ${stage.clientWidth}×${stage.clientHeight} · zoom ${Math.round(state.scale * 100)}%\n` +
    `标签 ${boxes.length}（覆盖 ${coverage}） · 重叠 ${collisions} · 线被卡片遮住 ${obstructed}（下层绘制，不算遮挡文字） · 字号 <${FONT_MIN}px ${issues.filter(x => x.startsWith('字号')).length}\n` +
    (issues.length ? '\n' + issues.slice(0, 8).join('\n') : '');
  return { ok, collisions, obstructed, labels: boxes.length, coverage, w: stage.clientWidth, h: stage.clientHeight };
}
window.__audit = audit;
window.__proto = { state, applyView };

// ---------- bench ----------
window.__clicks = 0;
document.addEventListener('click', () => { window.__clicks++; }, true);

// ---------- boot ----------
$('#gv').textContent = G.graph_version;
function fillFacts() {
  const seats = G.org.seats, gov = G.org.governance, all = seats.length + gov.length;
  const adm = {}; for (const s of [...seats, ...gov]) adm[s.admission_status] = (adm[s.admission_status] || 0) + 1;
  const auth = [...seats, ...gov].filter(s => s.production_authorized).length;
  $('#f-seats').textContent = `${all} 个可寻址席位（${seats.length} AGT + ${gov.length} MGT）`;
  $('#f-proc').textContent = `0 · 不是 ${all} 个同时在跑的 Agent`;
  $('#f-auth').textContent = `${auth} / ${all}`;
  $('#f-adm').textContent = Object.entries(adm).map(([k, v]) => `${v} ${k}`).join(' · ');
}
fillFacts();
buildLabels();
fitOrg();
if (location.search.includes('view=network')) {
  state.view = 'network';
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === 'network'));
  buildLabels(); fitNet();
}
applyView();
const AUDIT_MODE = location.search.includes('audit=1');
if (AUDIT_MODE) setTimeout(() => audit(), 200);
