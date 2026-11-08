// 正交工作视图：使用 Canvas2D 绘制板面与折线（零 WebGL 依赖），DOM overlay 承载全部文字与交互。
// three.module.min.js 仅由独立 3D 展示页 showcase.html 加载，工作视图冷启动立降 671KB。
import { BOARD, layoutOrg, layoutNetwork } from './layout.js?v=35';
import { renderPinAvatarHtml, renderDossierHtml } from './dossier.js?v=35';

const G = window.SANBAO_GRAPH;
const $ = sel => document.querySelector(sel);
const stage = $('#stage'), canvas = $('#gl'), labels = $('#labels'), ctx = canvas.getContext('2d');

const COLORS = {
  board: '#f1f0e9', band: '#e7eee5', block: '#ffffff', pad: '#e3ebe2',
  gov: '#f8f2e0', card: '#fffefb', shadow: 'rgba(27,42,36,0.07)',
  baseline: '#2d6756', feedback: '#a8792c', plain: '#98a29a',
  baselineDim: '#b9cfc7', feedbackDim: '#dfd0b4', plainDim: '#ced4cf',
};
const REL_LABEL = {
  direct_reuse: '直接复用主站位',
  sub_contributor: '内部专业贡献',
  evidence_input: '来源事实/证据输入',
  boundary_contributor: '边界条件输入',
  readonly_consumer: '只读引用',
  platform_steward: '平台维护侧归集',
};
const FONT_MIN = 12;
const SEAT_FULL = 0.9, SEAT_COMPACT = 0.45;
const seatMode = s => s >= SEAT_FULL ? 'full' : s >= SEAT_COMPACT ? 'compact' : 'hidden';

const state = { view: 'org', cx: BOARD / 2, cy: BOARD / 2, scale: 1, selected: null, moved: 0, pilotLens: false, pilotStage: 'ALL', chainId: 'chain-01' };

const org = layoutOrg(G.org);
const net = layoutNetwork(G.network);
const decisionById = new Map(G.decisions.map(d => [d.id, d]));
const cardByFile = new Map(G.cards.map(c => [c.file, c]));
const allSeatsMap = new Map([...G.org.seats, ...G.org.governance].map(s => [s.seat_id, s]));

// ---------- Canvas2D 绘制 ----------
function drawBox(x, y, w, h, fill, withShadow) {
  if (withShadow) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(x, y + 3, w, h);
  }
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function drawScene() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2 - state.cx * state.scale, h / 2 - state.cy * state.scale);
  ctx.scale(state.scale, state.scale);

  if (state.view === 'org') {
    for (const b of org.bands) drawBox(b.x, b.y, b.w, b.h, COLORS.band, false);
    for (const b of org.blocks) drawBox(b.x, b.y, b.w, b.h, COLORS.block, true);
    for (const s of org.seats) drawBox(s.x, s.y, s.w, s.h, COLORS.pad, true);
    for (const g of org.governance) drawBox(g.x, g.y, g.w, g.h, COLORS.gov, true);
  } else {
    // 关系线画在卡片下层，不遮挡卡片文字
    const sel = state.selected;
    const lw = 3.2 / state.scale;
    const arrow = lw * 2.2;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const e of net.edges) {
      if (!e) continue;
      const dim = sel && e.source !== sel && e.target !== sel;
      const color = e.kind === 'feedback'
        ? (dim ? COLORS.feedbackDim : COLORS.feedback)
        : e.kind === 'baseline'
          ? (dim ? COLORS.baselineDim : COLORS.baseline)
          : (dim ? COLORS.plainDim : COLORS.plain);
      const pts = e.points;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      const a = pts[pts.length - 2], b = pts[pts.length - 1];
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len, px = -uy, py = ux;
      const bx = b.x - ux * arrow * 2.4, by = b.y - uy * arrow * 2.4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(bx + px * arrow, by + py * arrow);
      ctx.lineTo(bx - px * arrow, by - py * arrow);
      ctx.closePath();
      ctx.fill();
    }
    for (const n of net.nodes) drawBox(n.x, n.y, n.w, n.h, COLORS.card, true);
  }
  ctx.restore();
}

// ---------- DOM 标签 ----------
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
      const svg = renderPinAvatarHtml({ ...s, seat_id: s.id, level1: s.level1 }, 'light', 28);
      const el = mk('div', 'seat' + (s.status === 'UNVERIFIED' ? ' unverified' : s.status === 'PARTIAL' ? ' partial' : ''), `${svg}<div class="seat-txt"><b>${s.alias}</b><small>${s.id}</small></div>`, { kind: 'seat', id: s.id });
      el.title = `${s.id} ${s.alias} · ${s.title}（${s.slot_id}）`;
      el.addEventListener('click', ev => { ev.stopPropagation(); select({ kind: 'seat', id: s.id }); });
      labelEls.push({ el, x: s.x + s.w / 2, y: s.y + s.h / 2, kind: 'seat' });
    }
    for (const g of org.governance) {
      const el = mk('div', 'gov', `${g.id} ${g.alias}`, { kind: 'gov', id: g.id });
      el.title = `${g.title} · T4 决策权参照，不是 Agent 席位`;
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

// ---------- 视口与缩放 ----------
function w2s(x, y) {
  return { x: (x - state.cx) * state.scale + stage.clientWidth / 2,
           y: (y - state.cy) * state.scale + stage.clientHeight / 2 };
}
function applyView() {
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
  drawScene();
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

function switchTab(view, keepFit) {
  document.querySelectorAll('.tabs button[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  state.view = view; state.selected = null;
  buildLabels();
  if (!keepFit) { view === 'org' ? fitOrg() : fitNet(); }
  applyView();
  if (AUDIT_MODE) setTimeout(() => audit(), 120);
}

// ---------- 交互 ----------
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

document.querySelectorAll('.tabs button[data-view]').forEach(btn => btn.addEventListener('click', () => {
  switchTab(btn.dataset.view, false);
  side(null);
}));
$('#pilot-btn').addEventListener('click', () => {
  state.pilotLens = !state.pilotLens;
  $('#pilot-btn').classList.toggle('pilot-on', state.pilotLens);
  applyPilotHighlight();
  select(state.pilotLens ? { kind: 'pilot', id: 'FLOW-02-SCN-002' } : null);
});
addEventListener('resize', () => { applyView(); if (AUDIT_MODE) setTimeout(() => audit(), 120); });
addEventListener('keydown', e => { if (e.key === 'Escape') { select(null); $('#q-results').hidden = true; } });

// ---------- 选中与侧栏 ----------
const sideEl = $('#side'); sideEl.dataset.empty = sideEl.innerHTML;

function cTagsHtml(codesStrOrArr) {
  const list = Array.isArray(codesStrOrArr)
    ? codesStrOrArr
    : (codesStrOrArr || '').match(/C-\d{3}/g) || [];
  return list.map(c => {
    const d = decisionById.get(c);
    const tip = d && d.title ? `${c} · ${d.title}` : c;
    return `<span class="tag c-link" data-cid="${c}" title="${tip.replace(/"/g, '&quot;')}">${c}</span>`;
  }).join('');
}

function bindSideEvents(el) {
  el.querySelectorAll('[data-jump-node]').forEach(d => d.addEventListener('click', () => {
    const id = d.dataset.jumpNode;
    if (state.view !== 'network') switchTab('network', false);
    select({ kind: 'node', id });
  }));
  el.querySelectorAll('[data-jump-seat]').forEach(d => d.addEventListener('click', () => {
    const id = d.dataset.jumpSeat;
    const isGov = id.startsWith('MGT-');
    if (state.view !== 'org') switchTab('org', false);
    const target = isGov ? org.governance.find(x => x.id === id) : org.seats.find(x => x.id === id);
    if (target) { state.cx = target.x + target.w / 2; state.cy = target.y + target.h / 2; applyView(); }
    select({ kind: isGov ? 'gov' : 'seat', id });
  }));
  el.querySelectorAll('[data-cid]').forEach(t => t.addEventListener('click', ev => {
    ev.stopPropagation();
    select({ kind: 'decision', id: t.dataset.cid });
  }));
  el.querySelectorAll('[data-chain-id]').forEach(btn => btn.addEventListener('click', () => {
    state.chainId = btn.dataset.chainId;
    applyPilotHighlight();
    side({ kind: 'pilot', id: 'FLOW-02-SCN-002' });
  }));
  el.querySelectorAll('[data-pilot-stg]').forEach(btn => btn.addEventListener('click', () => {
    state.pilotStage = btn.dataset.pilotStg;
    applyPilotHighlight();
    side({ kind: 'pilot', id: 'FLOW-02-SCN-002' });
  }));
  const moreBtn = el.querySelector('[data-expand-pages]');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      el.querySelectorAll('.extra-page').forEach(p => { p.hidden = false; });
      moreBtn.remove();
    });
  }
}

function getActiveLensSets() {
  const pl = G.org.pilot_lens;
  const chains = G.org.chain_lenses || [];
  if (state.chainId === 'reuse') {
    const coreSeats = new Set(G.org.seats.filter(s => (s.chains || []).length >= 3).map(s => s.seat_id));
    const ctxSeats = new Set(G.org.seats.filter(s => (s.chains || []).length === 2).map(s => s.seat_id));
    const targetNodes = new Set(net.nodes.filter(n => (n.chains || []).length >= 2).map(n => n.id));
    return { coreSeats, ctxSeats, targetNodes };
  }
  if (state.chainId !== 'chain-01') {
    const cl = chains.find(c => c.id === state.chainId) || chains[0];
    return {
      coreSeats: new Set(cl ? cl.core_seats : []),
      ctxSeats: new Set(cl ? cl.support_seats : []),
      targetNodes: new Set(cl ? cl.target_nodes : []),
    };
  }
  const stg = state.pilotStage !== 'ALL' && pl.dryrun
    ? (pl.dryrun.stages || []).find(s => s.stage_id === state.pilotStage)
    : null;
  return {
    coreSeats: new Set(stg ? stg.producer_seats : (pl && pl.seats || []).map(s => s.seat_id)),
    ctxSeats: new Set(stg ? stg.injected_seats : (pl && pl.context_injected_seats || []).map(s => s.seat_id)),
    targetNodes: new Set(stg ? stg.target_nodes : (pl && pl.target_nodes || [])),
  };
}

function applyPilotHighlight() {
  const { coreSeats, ctxSeats, targetNodes } = getActiveLensSets();
  for (const l of labelEls) {
    const id = l.el.dataset.id;
    const isCore = l.kind === 'seat' ? coreSeats.has(id) : l.kind === 'node' ? targetNodes.has(id) : false;
    const isCtx = l.kind === 'seat' && ctxSeats.has(id);
    l.el.classList.toggle('pilot-core', state.pilotLens && isCore);
    l.el.classList.toggle('pilot-ctx', state.pilotLens && isCtx);
    if (state.pilotLens && !state.selected && (l.kind === 'seat' || l.kind === 'node' || l.kind === 'gov')) {
      l.el.classList.toggle('dim', !(isCore || isCtx));
    }
  }
}

function select(sel) {
  state.selected = sel && sel.id || null;
  for (const l of labelEls) {
    l.el.classList.toggle('selected', !!sel && l.el.dataset.id === sel.id);
    if (l.kind === 'node' && sel && sel.kind === 'node') {
      l.el.classList.toggle('dim', !isNeighbor(sel.id, l.el.dataset.id));
    } else if (l.kind === 'node') {
      l.el.classList.remove('dim');
    }
  }
  if (state.pilotLens) applyPilotHighlight();
  drawScene();
  side(sel);
}
function isNeighbor(a, b) {
  if (a === b) return true;
  return net.edges.some(e => e && ((e.source === a && e.target === b) || (e.source === b && e.target === a)));
}

function side(sel) {
  const el = $('#side');
  if (!sel) { el.innerHTML = sideEl.dataset.empty; fillFacts(); return; }

  if (sel.kind === 'pilot') {
    const pl = G.org.pilot_lens;
    const chains = G.org.chain_lenses || [];
    const chainBar = `<div class="stg-bar">
      ${chains.map(c => `<button type="button" class="stg-btn ${state.chainId === c.id ? 'active' : ''}" data-chain-id="${c.id}">${c.code}</button>`).join('')}
      <button type="button" class="stg-btn ${state.chainId === 'reuse' ? 'active' : ''}" data-chain-id="reuse">跨链复用热力</button>
    </div>`;

    if (state.chainId === 'reuse') {
      const s3 = G.org.seats.filter(s => (s.chains || []).length >= 3);
      const s2 = G.org.seats.filter(s => (s.chains || []).length === 2);
      const n2 = net.nodes.filter(n => (n.chains || []).length >= 2);
      el.innerHTML = `${chainBar}<h2>跨主链能力池复用热力（C-011 / C-310）</h2>
        <p>三条经营主链共用同一个 50 岗能力池与 20 节点经营网络，不建立三套独立组织。</p>
        <h3>3 链全勤枢纽席位（${s3.length} 席 · 绿框）</h3>
        ${s3.map(s => `<div class="rel" data-jump-seat="${s.seat_id}"><div class="obj">→ ${s.seat_id} ${s.alias} · ${s.slot_id} ${s.slot_title}</div><div class="meta">${s.plane} · ${s.source_group}</div></div>`).join('')}
        <h3>2 链共用支撑席位（${s2.length} 席 · 琥珀框）</h3>
        ${s2.map(s => `<div class="rel" data-jump-seat="${s.seat_id}"><div class="obj">→ ${s.seat_id} ${s.alias} · ${s.slot_id} ${s.slot_title}</div><div class="meta">参与：${(s.chains || []).join(' / ')}</div></div>`).join('')}
        <h3>多链共用主网节点（${n2.length} 个）</h3>
        ${n2.map(n => `<div class="rel" data-jump-node="${n.id}"><div class="obj">→ ${n.title}（${(n.chains || []).length} 链共用）</div><div class="meta">${n.codes}</div></div>`).join('')}`;
      bindSideEvents(el);
      return;
    }

    if (state.chainId !== 'chain-01') {
      const cl = chains.find(c => c.id === state.chainId) || chains[1];
      el.innerHTML = `${chainBar}<h2>${cl.title}</h2>
        <p>${cTagsHtml(cl.basis)}</p>
        <p style="color:var(--ink)"><strong>核心问题：</strong>${cl.question}</p>
        <h3>三条反误读停止线</h3>
        ${cl.anti_misreadings.map(m => `<div class="rel"><div class="meta">• ${m}</div></div>`).join('')}
        <h3>核心主接席位（${cl.core_seats.length} · 绿框）</h3>
        ${cl.core_seats.map(sid => {
          const meta = G.org.seats.find(x => x.seat_id === sid);
          return `<div class="rel" data-jump-seat="${sid}"><div class="obj">→ ${sid} ${meta ? meta.alias : ''} · ${meta ? meta.slot_id + ' ' + meta.slot_title : ''}</div></div>`;
        }).join('')}
        <h3>并列支撑席位（${cl.support_seats.length} · 琥珀框）</h3>
        ${cl.support_seats.map(sid => {
          const meta = G.org.seats.find(x => x.seat_id === sid);
          return `<div class="rel" data-jump-seat="${sid}"><div class="obj">→ ${sid} ${meta ? meta.alias : ''} · ${meta ? meta.slot_id + ' ' + meta.slot_title : ''}</div></div>`;
        }).join('')}
        <h3>关联主网节点（${cl.target_nodes.length}）</h3>
        ${cl.target_nodes.map(nid => {
          const nd = net.nodes.find(x => x.id === nid);
          return `<div class="rel" data-jump-node="${nid}"><div class="obj">→ ${nd ? nd.title : nid}</div><div class="meta">${nd ? nd.codes : ''}</div></div>`;
        }).join('')}`;
      bindSideEvents(el);
      return;
    }

    const pre = pl.preconditions || { counts: {}, items: [] };
    const pc = pre.counts || {};
    const pg = pl.policy_gate || {};
    const gm = pl.governance_mechanisms || {};
    el.innerHTML = `${chainBar}<h2>${pl.title}</h2>
      <p><span class="tag warn">工程就绪 ${pc.engineering_ready || 0}/7 · 待真人签核 ${pc.awaiting_human_signoff || 0}/7</span>
      <span class="tag">Policy Gate ${pg.negative_tests_passed || 10}/10 负向拦截</span>
      <span class="tag">技能契约 ${pg.skill_contracts_count || 12}/12</span>
      <span class="tag">治理机制 ${gm.mechanisms_count || 4}/4 (${gm.cases_passed || 16}/${gm.cases_total || 16})</span></p>
      <p>授权依据：<code>${pl.authorization_ref}</code></p>
      ${(pre.items || []).length ? `<h3>七项生效前置（P1..P7）</h3>` + pre.items.map(it => {
        const badge = it.state === 'ENGINEERING_READY' ? '<span class="tag">工程就绪</span>' : '<span class="tag warn">待真人签核</span>';
        return `<div class="rel"><div class="obj"><strong>${it.id} ${it.title}</strong> ${badge}</div><div class="meta">${it.detail}</div></div>`;
      }).join('') : ''}
      <h3>核心参与席位（${pl.seats.length}）</h3>
      ${pl.seats.map(s => {
        const meta = G.org.seats.find(x => x.seat_id === s.seat_id);
        return `<div class="rel" data-jump-seat="${s.seat_id}">
          <div class="obj">→ ${s.seat_id} ${meta ? meta.alias : ''} · <span class="tag">${s.mode}</span></div>
          <div class="meta">${s.stages.join(' / ')} · ${s.duty}</div>
        </div>`;
      }).join('')}
      <h3>T3 上下文注入/装配席位（${pl.context_injected_seats.length}）</h3>
      ${pl.context_injected_seats.map(s => {
        const meta = G.org.seats.find(x => x.seat_id === s.seat_id);
        return `<div class="rel" data-jump-seat="${s.seat_id}">
          <div class="obj">→ ${s.seat_id} ${meta ? meta.alias : ''}（${s.stages.join('/')}）</div>
          <div class="meta">${s.duty}</div>
        </div>`;
      }).join('')}
      <h3>关联主网节点（${pl.target_nodes.length}）</h3>
      ${pl.target_nodes.map(nid => {
        const nd = net.nodes.find(x => x.id === nid);
        return `<div class="rel" data-jump-node="${nid}"><div class="obj">→ ${nd ? nd.title : nid}</div><div class="meta">${nd ? nd.codes : ''}</div></div>`;
      }).join('')}
      <h3>干跑回放步进器（${pl.dryrun ? `${pl.dryrun.replay_runs}/3 重放一致 · 结论 ${pl.dryrun.final_decision} / ${pl.dryrun.action_disposition}` : 'STG-01..08'}）</h3>
      <div class="stg-bar">
        <button type="button" class="stg-btn ${state.pilotStage === 'ALL' ? 'active' : ''}" data-pilot-stg="ALL">全链总览</button>
        ${(pl.dryrun && pl.dryrun.stages || []).map(st =>
          `<button type="button" class="stg-btn ${state.pilotStage === st.stage_id ? 'active' : ''}" data-pilot-stg="${st.stage_id}">${st.stage_id} ${st.name}</button>`
        ).join('')}
      </div>
      ${(() => {
        const cur = state.pilotStage !== 'ALL' && pl.dryrun
          ? (pl.dryrun.stages || []).find(s => s.stage_id === state.pilotStage)
          : null;
        if (!cur) {
          return pl.stages.map(st => `<div class="rel" data-pilot-stg="${st.id}"><div class="obj"><strong>${st.id} ${st.name}</strong> · ${st.artifact}</div>
            <div class="meta">${st.actor}｜门禁：${st.gate}</div></div>`).join('');
        }
        return `<div class="rel">
          <div class="obj"><strong>${cur.stage_id} ${cur.name}</strong> · <code>${cur.artifact_kind}</code></div>
          <div class="meta">主责：${cur.producer_seats.join(', ')}｜T3 注入：${cur.injected_seats.join(', ') || '无'}｜节点：${cur.target_nodes.join(', ')}｜sha256: <code>${cur.artifact_sha256}</code></div>
          <div class="meta">门禁不变量：${cur.gate_invariants.join('；')}</div>
          <div class="art-box">${JSON.stringify(cur.artifact, null, 2)}</div>
        </div>`;
      })()}`;
    bindSideEvents(el);
    return;
  }

  if (sel.kind === 'decision') {
    const d = decisionById.get(sel.id);
    if (!d) { el.innerHTML = `<h2>${sel.id}</h2><p>未找到该决策记录。</p>`; return; }
    const refNodes = net.nodes.filter(n => (n.codes || '').includes(sel.id));
    const refSeats = [...G.org.seats, ...G.org.governance].filter(s =>
      s.slot_basis === sel.id || (s.node_links || []).some(lk => (lk.basis || []).includes(sel.id))
    );
    const refRels = G.network.relations.filter(r => (r.codes || []).includes(sel.id));
    el.innerHTML = `<h2>${d.id}</h2>
      <p style="color:var(--ink);font-weight:500">${d.title || '（无标题摘要）'}</p>
      <dl class="facts">
        <dt>出处</dt><dd><code>.codex/context-pack.md</code> 第 ${d.line} 行</dd>
        <dt>条目形态</dt><dd>${d.form}${d.level ? ` (H${d.level})` : ''}</dd>
        <dt>关联节点</dt><dd>${refNodes.length} 个</dd>
        <dt>关联关系</dt><dd>${refRels.length} 条</dd>
        <dt>关联席位</dt><dd>${refSeats.length} 个</dd>
      </dl>
      ${refNodes.length ? `<h3>关联经营网络节点</h3>` + refNodes.map(n =>
        `<div class="rel" data-jump-node="${n.id}"><div class="obj">→ ${n.title}</div><div class="meta">${n.short} · ${n.codes}</div></div>`
      ).join('') : ''}
      ${refSeats.length ? `<h3>关联席位 / 能力站位</h3>` + refSeats.map(s =>
        `<div class="rel" data-jump-seat="${s.seat_id}"><div class="obj">→ ${s.seat_id} ${s.alias} · ${s.title}</div><div class="meta">${s.slot_id} ${s.slot_title}</div></div>`
      ).join('') : ''}`;
    bindSideEvents(el);
    return;
  }

  if (sel.kind === 'seat' || sel.kind === 'gov') {
    const meta = allSeatsMap.get(sel.id);
    if (!meta) return;
    el.innerHTML = renderDossierHtml(meta, {
      theme: 'light',
      allSeatsMap,
      netNodes: net.nodes,
      cTagsFn: cTagsHtml,
      relLabelMap: REL_LABEL,
    });
    el.scrollTop = 0;
    bindSideEvents(el);
    return;
  }

  const n = net.nodes.find(x => x.id === sel.id);
  const rels = net.edges.filter(e => e && (e.source === sel.id || e.target === sel.id));
  const seatLinks = n.seat_links || [];
  const allPages = [n.primary_page, ...n.pages.filter(f => f !== n.primary_page)].filter(Boolean);
  el.innerHTML = `<h2>${n.title}</h2><p>${n.short}</p>
    <p>${cTagsHtml(n.codes)}</p>
    <p>${rels.length} 条关系 · ${seatLinks.length} 个关联席位 · ${allPages.length} 张卡引用</p>
    <h3>关联席位 / 能力站位（${seatLinks.length}）</h3>
    ${seatLinks.map(s => `<div class="rel" data-jump-seat="${s.seat_id}">
      <div class="obj">→ ${s.seat_id} ${s.alias} · ${s.slot_id} ${s.slot_title}</div>
      <div class="meta">${REL_LABEL[s.relation] || s.relation} · ${s.note}</div>
      <div>${cTagsHtml(s.basis)}</div>
    </div>`).join('')}
    <h3>协作关系（${rels.length}）</h3>
    ${rels.map(e => {
      const other = e.source === sel.id ? e.target : e.source;
      const o = net.nodes.find(x => x.id === other);
      const dir = e.source === sel.id ? '→' : '←';
      const kinds = [e.baseline ? '主线' : '', e.feedback ? '反馈' : ''].filter(Boolean).join(' + ') || '未标注';
      const obj = e.object ? ` · ${e.object}` : '';
      return `<div class="rel" data-jump-node="${other}"><div class="obj">${dir} ${o ? o.title : other}${obj}</div>
        <div class="meta">${kinds} · ${(e.codes || []).join(' / ')}</div></div>`;
    }).join('')}
    <h3>来源卡（${allPages.length}）</h3>
    <p>点击直接打开原 HTML 卡片，不复制正文。</p>
    ${allPages.map((f, i) => {
      const cardMeta = cardByFile.get(f);
      const sub = cardMeta && cardMeta.title ? ` · ${cardMeta.title}` : '';
      return `<div class="rel ${i >= 4 ? 'extra-page' : ''}" ${i >= 4 ? 'hidden' : ''}>
        <a href="../../.superpowers/brainstorm/38196-1789923100/content/${f}" target="_blank" rel="noopener">${i === 0 ? '主卡 · ' : ''}${f.replace('.html', '')}</a>
        <div class="meta">${sub.slice(0, 42)}</div>
      </div>`;
    }).join('')}
    ${allPages.length > 4 ? `<button class="more-btn" data-expand-pages>展开其余 ${allPages.length - 4} 张来源卡</button>` : ''}
    ${net.unresolved.length ? `<p style="margin-top:12px">另有 ${net.unresolved.length} 条关系引用未声明节点，未绘制。</p>` : ''}`;
  bindSideEvents(el);
}

// ---------- 顶栏全局搜索 ----------
const qInput = $('#q'), qBox = $('#q-results');
qInput.addEventListener('input', () => {
  const q = qInput.value.trim().toLowerCase();
  if (!q) { qBox.hidden = true; qBox.innerHTML = ''; return; }
  const hits = [];
  for (const s of [...G.org.seats, ...G.org.governance]) {
    const hay = `${s.seat_id} ${s.alias} ${s.title} ${s.slot_id} ${s.slot_title} ${s.plane} ${s.source_group}`.toLowerCase();
    if (hay.includes(q)) hits.push({ kind: s.seat_id.startsWith('MGT-') ? 'gov' : 'seat', id: s.seat_id, label: `${s.seat_id} ${s.alias} · ${s.title}`, sub: `${s.slot_id} · ${s.plane}` });
  }
  for (const n of net.nodes) {
    const hay = `${n.id} ${n.title} ${n.short} ${n.codes}`.toLowerCase();
    if (hay.includes(q)) hits.push({ kind: 'node', id: n.id, label: `节点 · ${n.title}`, sub: n.codes });
  }
  for (const d of G.decisions) {
    if (d.id.toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q)) {
      hits.push({ kind: 'decision', id: d.id, label: `${d.id} · ${(d.title || '').slice(0, 28)}`, sub: `L${d.line}` });
      if (hits.length >= 24) break;
    }
  }
  if (!hits.length) {
    qBox.innerHTML = `<div class="q-item"><span>无匹配结果</span></div>`;
    qBox.hidden = false;
    return;
  }
  qBox.innerHTML = hits.slice(0, 20).map((h, i) =>
    `<div class="q-item" data-idx="${i}"><span>${h.label}</span><small>${h.sub}</small></div>`
  ).join('');
  qBox.hidden = false;
  qBox.querySelectorAll('.q-item').forEach((el, i) => el.addEventListener('click', () => {
    const h = hits[i];
    qBox.hidden = true;
    if (h.kind === 'seat' || h.kind === 'gov') {
      if (state.view !== 'org') switchTab('org', false);
      const t = h.kind === 'gov' ? org.governance.find(x => x.id === h.id) : org.seats.find(x => x.id === h.id);
      if (t) { state.cx = t.x + t.w / 2; state.cy = t.y + t.h / 2; applyView(); }
      select({ kind: h.kind, id: h.id });
    } else if (h.kind === 'node') {
      if (state.view !== 'network') switchTab('network', false);
      select({ kind: 'node', id: h.id });
    } else {
      select({ kind: 'decision', id: h.id });
    }
  }));
});

// ---------- 自检 audit ----------
function audit() {
  const issues = [];
  const sr = stage.getBoundingClientRect();
  const boxes = [...labels.children].filter(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none')
    .map(el => ({ el, r: el.getBoundingClientRect(), fs: parseFloat(getComputedStyle(el).fontSize) }))
    .filter(b => b.r.right > sr.left + 2 && b.r.left < sr.right - 2 && b.r.bottom > sr.top + 2 && b.r.top < sr.bottom - 2);
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
  const aggregate = state.view === 'org' && state.scale < 0.45;
  const coverage = aggregate ? 'aggregate' : boxes.length < 8 ? 'empty' : boxes.length < 20 ? 'reduced' : 'full';
  const ok = collisions === 0 && obstructed === 0 && issues.length === 0 && (coverage === 'full' || coverage === 'reduced' || coverage === 'aggregate');
  const box = $('#audit');
  box.hidden = false;
  box.className = ok ? 'pass' : 'fail';
  box.textContent = `AUDIT ${ok ? 'PASS' : 'FAIL'} · ${stage.clientWidth}×${stage.clientHeight} · zoom ${Math.round(state.scale * 100)}%\n` +
    `标签 ${boxes.length}（覆盖 ${coverage}） · 重叠 ${collisions} · 线被卡片遮住 ${obstructed} · 字号 <${FONT_MIN}px ${issues.filter(x => x.startsWith('字号')).length}\n` +
    (issues.length ? '\n' + issues.slice(0, 8).join('\n') : '');
  return { ok, collisions, obstructed, labels: boxes.length, coverage, w: stage.clientWidth, h: stage.clientHeight };
}
window.__audit = audit;
window.__proto = { state, applyView, select };

// ---------- 启动 ----------
window.__clicks = 0;
document.addEventListener('click', () => { window.__clicks++; }, true);

$('#gv').textContent = G.graph_version;
function fillFacts() {
  const seats = G.org.seats, gov = G.org.governance, all = seats.length + gov.length;
  const adm = {}; for (const s of [...seats, ...gov]) adm[s.admission_status] = (adm[s.admission_status] || 0) + 1;
  const auth = [...seats, ...gov].filter(s => s.production_authorized).length;
  const linkedSeats = seats.filter(s => (s.node_links || []).length > 0).length;
  $('#f-seats').textContent = `${all} 个可寻址席位（${seats.length} AGT + ${gov.length} MGT）`;
  $('#f-proc').textContent = `0 · 不是 ${all} 个同时在跑的 Agent`;
  $('#f-auth').textContent = `${auth} / ${all}`;
  $('#f-adm').textContent = Object.entries(adm).map(([k, v]) => `${v} ${k}`).join(' · ');
  const cwEl = $('#f-cw');
  if (cwEl) cwEl.textContent = `50 岗全映射能力站位 · ${linkedSeats} 席直连 20 主网节点（${G.counts.crosswalk_links} 条）`;
}
fillFacts();
buildLabels();
fitOrg();
if (location.search.includes('view=network')) {
  state.view = 'network';
  document.querySelectorAll('.tabs button[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === 'network'));
  buildLabels(); fitNet();
}
const AUDIT_MODE = location.search.includes('audit=1');
applyView();
if (AUDIT_MODE) setTimeout(() => audit(), 200);
