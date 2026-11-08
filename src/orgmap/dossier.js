// 数字员工四维档案卡（Dossier Card）共享渲染器
// 同时服务 2D 浅色工作视图（theme='light'）与 3D 深色展示视图（theme='dark'）。
// 零 Three.js 依赖：通过 plaque.js 渲染 MGT T4 铜牌，确保 2D 工作视图不加载 three.module.min.js。

import { renderPlaqueSvg } from './plaque.js?v=35';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// 先 HTML 转义，再将 Markdown **bold** 还原为 <strong>
const fmtMd = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export function renderPinAvatarHtml(seat, theme = 'light', size = 24) {
  const sid = seat.seat_id || seat.id || '';
  if (sid.startsWith('MGT-')) {
    return renderPlaqueSvg({ ...seat, seat_id: sid }, size);
  }
  const src = `./assets/avatars/${theme}/64/${sid}.webp`;
  return `<img class="seat-avatar" src="${src}" width="${size}" height="${size}" alt="" decoding="async">`;
}

const KIND_META = {
  direct: { label: 'DIRECT · 直接供给', cls: 'st-direct', dot: '●' },
  partial: { label: 'PARTIAL · 部分覆盖', cls: 'st-partial', dot: '◐' },
  gap: { label: 'GAP · 平台缺口', cls: 'st-gap', dot: '○' },
  candidate_filled: { label: 'CANDIDATE · 试点候补', cls: 'st-cand', dot: '◌' },
};

const MGT_RIGHTS_ZH = {
  standard_version_ownership: '标准版本所有权 (standard_version_ownership)',
  resource_quota_and_priority: '资源配额与优先级 (resource_quota_and_priority)',
  portfolio_tradeoff: '组合取舍权 (portfolio_tradeoff)',
  escalation_and_freeze: '升级与范围冻结 (escalation_and_freeze)',
  cross_domain_arbitration_fallback: '跨域兜底仲裁 (cross_domain_arbitration_fallback)',
  global_reallocation: '全局资源再分配 (global_reallocation)',
  strategic_stop_initiation: '战略停止发起 (strategic_stop_initiation)',
  report_to_human_owner: '呈报真人所有者 (report_to_human_owner)',
  l2b_identification_and_handoff: 'L2b 自涉争议识别与移交 (l2b_identification_and_handoff)',
  constraint_record_and_retroactive_enforcement: '约束记录与追溯执行 (constraint_record_and_retroactive_enforcement)',
  cadence_scheduling: '管理节拍排程 (cadence_scheduling)',
  metric_definition_freezing: '冻结指标口径 (归 AGT-005 与外部复核)',
  self_referential_dispute_arbitration: '自涉治理尺度争议裁决 (须交 L2b 真人)',
  case_control_instruction: '向单张 Case 下达阶段指令',
  asset_write: '直接执行业务资产写操作',
  assembly_rule_publication: '自行发布装配规则 (发布权归治理官)',
  action_intent_policy_template_proposal: '提议动作策略模板',
  interference_with_independent_review_line: '干预或压后 AGT-005 独立复核结论',
  deferral_of_control_boundary_retroactive_enforcement: '延后控制边界强制追溯',
};

export function renderDossierHtml(meta, opts = {}) {
  const {
    theme = 'light',
    allSeatsMap = new Map(),
    netNodes = [],
    cTagsFn = () => '',
    relLabelMap = {},
  } = opts;
  const sid = meta.seat_id || meta.id;
  const isMgt = sid.startsWith('MGT-');
  const dos = meta.dossier || {};
  const soul = dos.soul || {};
  const duty = dos.duty || {};
  const skills = dos.skills || [];
  const collab = dos.collaboration || {};
  const contracts = meta.skill_contracts || [];
  const contractByName = new Map(contracts.map(c => [c.l3_name, c]));
  const links = meta.node_links || [];

  // 1) Hero 肖像或 MGT 铜牌
  const heroVisual = isMgt
    ? `<div class="dos-plaque-hero" title="T4 决策权规则包 · 非 Agent 席位 · 不挂 session">
        ${renderPlaqueSvg({ ...meta, seat_id: sid }, 148)}
        <div class="dos-plaque-caption">
          <strong>T4 决策权规则包 · 非 Agent 席位</strong>
          <span>不挂 session · 不进 Case 阶段 · 不发 ActionIntent</span>
        </div>
      </div>`
    : `<div class="dos-portrait-frame">
        <img class="dos-portrait-img" src="./assets/avatars/${theme}/256/${sid}.webp"
             srcset="./assets/avatars/${theme}/64/${sid}.webp 64w, ./assets/avatars/${theme}/256/${sid}.webp 256w"
             sizes="236px" width="236" height="236"
             alt="${esc(meta.alias)}（${esc(sid)}）数字员工头像" decoding="async" fetchpriority="high">
        <span class="dos-tier-badge">${esc(meta.tier)}</span>
      </div>`;

  const admCls = isMgt
    ? 'stamp-unverified'
    : (meta.admission_status === 'PARTIAL' ? 'stamp-partial' : 'stamp-unverified');
  const admLabel = isMgt
    ? 'T4 规则包 · 非 Agent 准入'
    : (meta.admission_status === 'PARTIAL' ? 'PARTIAL · 部分准入' : 'UNVERIFIED · 未核验');

  // 2) 灵魂（Soul）
  const pTags = (soul.personality_tags || []).map(t => `<span class="dos-chip">${esc(t)}</span>`).join('');
  const principlesHtml = (soul.principles || []).map((p, idx) => {
    const badge = idx === 0
      ? '灵魂原则 · SOUL PRINCIPLE'
      : `原则 0${idx + 1} · ${esc(p.label.replace(/^我的/, ''))}`;
    const cleanBullets = (p.manifestations || []).filter(m => m.replace(/\*/g, '').trim() !== p.quote.trim());
    const mList = cleanBullets.map(m => `<li>${fmtMd(m)}</li>`).join('');
    const openAttr = idx === 0 ? 'open' : '';
    return `<div class="dos-quote-card">
      <div class="dos-eyebrow">${badge}</div>
      <blockquote class="dos-quote">“${esc(p.quote)}”</blockquote>
      ${mList ? `<details class="dos-fold" ${openAttr}>
        <summary>可检验表现（${cleanBullets.length} 条）</summary>
        <ul class="dos-List">${mList}</ul>
      </details>` : ''}
    </div>`;
  }).join('');

  const soulHtml = `<section class="dos-sec" id="dos-s-soul">
    <div class="dos-sec-head"><span class="dos-sec-num">01</span><h3>灵魂 · SOUL CONTRACT</h3></div>
    ${pTags ? `<div class="dos-row-chips"><span class="dos-mini-lbl">工作风格</span>${pTags}</div>` : ''}
    ${principlesHtml}
    ${soul.stance ? `<div class="dos-subbox"><div class="dos-eyebrow">协作姿态 · STANCE</div><p>${fmtMd(soul.stance)}</p></div>` : ''}
    ${soul.stop_signal ? `<div class="dos-stop-rail">
      <div class="dos-eyebrow">■ 停止信号 · HOLD / FREEZE TRIGGER</div>
      <p>${fmtMd(soul.stop_signal)}</p>
    </div>` : ''}
  </section>`;

  // 3) 岗位职责（Role & Duty）
  const overlay = duty.cr_ao_001_overlay;
  const overlayHtml = overlay ? `<div class="dos-rider">
    <div class="dos-rider-head">
      <span>CR-AO-001 · A 方案职责增补（${esc(overlay.gap)}）</span>
      <em class="dos-stamp-req">REQUEST · 待回写源仓</em>
    </div>
    <p>${fmtMd(overlay.added_duty)}</p>
    <small>依据 C-378 / C-389：对证据完整性、预警及时性、建议有据负责，不对外部决定的结果负责。</small>
  </div>` : '';

  const steps = duty.playbook_steps || [];
  const stepsHtml = steps.length ? `<div class="dos-timeline">
    <div class="dos-eyebrow" style="margin-bottom:6px">${isMgt ? '管理节拍执行 PLAYBOOK' : '独立执行 PLAYBOOK'}（${steps.length} 步）</div>
    ${steps.map((st, idx) => `<details class="dos-step" ${idx === 0 ? 'open' : ''}>
      <summary><span class="dos-step-idx">${st.step}</span><strong>${esc(st.title)}</strong></summary>
      <p>${fmtMd(st.detail)}</p>
    </details>`).join('')}
  </div>` : '';

  const dutyHtml = `<section class="dos-sec" id="dos-s-duty">
    <div class="dos-sec-head"><span class="dos-sec-num">02</span><h3>岗位职责 · ROLE &amp; DUTY</h3></div>
    <div class="dos-slot-line">
      <span>能力站位：<strong>${esc(meta.slot_id)} · ${esc(meta.slot_title)}</strong></span>
      <span>${cTagsFn([meta.slot_basis])}</span>
    </div>
    <div class="dos-mission-box">
      <div class="dos-eyebrow">岗位使命 · MISSION</div>
      <p>${fmtMd(duty.mission || '未登记')}</p>
    </div>
    <div class="dos-specimen">
      <div class="dos-eyebrow">标准交付物 · STANDARD ARTIFACT</div>
      <div class="dos-artifact-title">${esc(duty.artifact || '未登记')}</div>
    </div>
    <div class="dos-subbox">
      <div class="dos-eyebrow">衡量指标 · METRICS</div>
      <p>${esc((duty.metrics || []).join(' · ') || '未登记')}</p>
    </div>
    ${isMgt && duty.management_domain ? `<div class="dos-subbox">
      <div class="dos-eyebrow">管理域与覆盖 · DOMAIN</div>
      <p>${esc(duty.management_domain)}（覆盖 ${esc(duty.owned_role_count)} 席）</p>
    </div>` : ''}
    ${overlayHtml}
    ${stepsHtml}
  </section>`;

  // 4) 技能（Skills & Supply）
  let cntDirect = 0, cntPartial = 0, cntGap = 0, cntCand = 0;
  const skillCardsHtml = skills.map(sk => {
    const ct = contractByName.get(sk.name);
    const effKind = ct ? ct.kind : sk.kind;
    if (effKind === 'direct') cntDirect++;
    else if (effKind === 'partial') cntPartial++;
    else if (effKind === 'candidate_filled') cntCand++;
    else cntGap++;
    const km = isMgt && effKind === 'gap'
      ? { label: 'EXTERNAL · 模型外机制承载', cls: 'st-partial', dot: '◈' }
      : (KIND_META[effKind] || KIND_META.gap);
    const supplyArr = ct && ct.supply && ct.supply.length ? ct.supply : (sk.supply || []);
    const supplyChips = supplyArr.length
      ? supplyArr.map(sp => `<code class="dos-code-chip">${esc(sp)}</code>`).join('')
      : `<span class="dos-no-supply">${isMgt ? '模型外控制面机制承载 · 不开放 Prompt 工具供给' : '平台暂无现成供给 · 需自建或接入'}</span>`;

    const ctHtml = ct ? `<details class="dos-contract">
      <summary>FLOW-02 试点 L3 可判定契约 · 方法 / 失败处置 / 验收</summary>
      <div class="dos-contract-body">
        <div><span class="dos-mini-lbl">输入</span><code>${esc((ct.inputs || []).join(', '))}</code></div>
        <div><span class="dos-mini-lbl">方法</span><span>${esc(ct.method)}</span></div>
        <div><span class="dos-mini-lbl">分支</span><span>${esc((ct.branches || []).join(' ｜ '))}</span></div>
        <div><span class="dos-mini-lbl">输出</span><code>${esc((ct.output_fields || []).join(', '))}</code></div>
        <div><span class="dos-mini-lbl">失败处置</span><code class="dos-fail-code">${esc(ct.failure_handling)}</code></div>
        <div><span class="dos-mini-lbl">验收判据</span><span>${esc(ct.verification_criteria)}</span></div>
      </div>
    </details>` : '';

    return `<div class="dos-skill-card ${km.cls}">
      <div class="dos-skill-top">
        <strong>${esc(sk.name)}</strong>
        <span class="dos-sk-badge ${km.cls}">${km.dot} ${km.label}</span>
      </div>
      <div class="dos-skill-id"><code>${esc(sk.skill_id)}</code>${effKind === 'candidate_filled' ? ' <small>（原 skill-map=gap · 试点候选补齐）</small>' : ''}</div>
      <div class="dos-supply-wrap"><span class="dos-mini-lbl">SUPPLY</span>${supplyChips}</div>
      ${sk.note ? `<div class="dos-sk-note">${fmtMd(sk.note)}</div>` : ''}
      ${ctHtml}
    </div>`;
  }).join('');

  const skillsHtml = `<section class="dos-sec" id="dos-s-skills">
    <div class="dos-sec-head"><span class="dos-sec-num">03</span><h3>${isMgt ? '管理能力与控制面机制' : '技能与供给'} · SKILLS (${skills.length})</h3></div>
    <div class="dos-sk-bar" aria-hidden="true">
      <i style="flex:${cntDirect};background:var(--dos-direct)"></i>
      <i style="flex:${cntPartial + cntCand + (isMgt ? cntGap : 0)};background:var(--dos-brass)"></i>
      <i style="flex:${isMgt ? 0 : cntGap};background:var(--dos-rust)"></i>
    </div>
    <div class="dos-sk-summary">${skills.length} 项能力 · ${cntDirect} 直接供给 / ${cntPartial} 部分覆盖${cntCand ? ` / ${cntCand} 试点候补` : ''} / ${isMgt ? `${cntGap} 模型外机制` : `${cntGap} 缺口`}</div>
    ${contracts.length ? `<div class="dos-pilot-ribbon">★ 已挂载 FLOW-02 × SCN-002 四席只读试点 L3 技能契约（${contracts.length} 项）</div>` : ''}
    ${skillCardsHtml}
  </section>`;

  // 5) 协作与红线边界（Collaboration & Boundaries）
  const peersHtml = (collab.collaborates_with || []).map(pid => {
    const pMeta = allSeatsMap.get(pid);
    const pAlias = pMeta ? pMeta.alias : pid;
    const pPin = pMeta ? renderPinAvatarHtml(pMeta, theme, 20) : '';
    return `<button type="button" class="dos-peer-chip" data-jump-seat="${esc(pid)}" title="跳转到 ${esc(pid)} ${esc(pAlias)}">
      ${pPin}<strong>${esc(pAlias)}</strong><small>${esc(pid)}</small>
    </button>`;
  }).join('');

  const renderCappedChips = (arr) => {
    if (!arr || !arr.length) return `<span class="dos-muted">—</span>`;
    const head = arr.slice(0, 5).map(x => `<code class="dos-code-chip">${esc(x)}</code>`).join('');
    if (arr.length <= 5) return head;
    const tail = arr.slice(5).map(x => `<code class="dos-code-chip">${esc(x)}</code>`).join('');
    return `${head}<details class="dos-more"><summary>+${arr.length - 5} 项</summary><div>${tail}</div></details>`;
  };

  const mgtRightsHtml = isMgt ? `<div class="dos-subbox">
    <div class="dos-eyebrow">授予的决策权杠杆 · GRANTED LEVERS (${(collab.decision_rights || []).length})</div>
    <ul class="dos-List">${(collab.decision_rights || []).map(r => `<li>${esc(MGT_RIGHTS_ZH[r] || r)}</li>`).join('')}</ul>
    <div class="dos-eyebrow" style="margin-top:8px">显式禁止的权力 · EXPLICITLY NOT GRANTED (${(collab.decision_rights_not_granted || []).length})</div>
    <ul class="dos-never-list">${(collab.decision_rights_not_granted || []).map(r => `<li><span class="dos-x">×</span><span>${esc(MGT_RIGHTS_ZH[r] || r)}</span></li>`).join('')}</ul>
  </div>` : '';

  const neverList = (collab.never_do || []).map(item => `<li><span class="dos-x">×</span><span>${fmtMd(item)}</span></li>`).join('');

  const netLinksHtml = links.length ? links.map(lk => {
    const nd = netNodes.find(x => x.id === lk.node_id);
    const rLbl = relLabelMap[lk.relation] || lk.relation;
    return `<div class="dos-net-item" data-jump-node="${esc(lk.node_id)}">
      <div class="dos-net-top"><strong>→ ${esc(nd ? nd.title : lk.node_id)}</strong><span class="dos-chip">${esc(rLbl)}</span></div>
      <div class="dos-net-note">${esc(lk.note)}</div>
      <div>${cTagsFn(lk.basis)}</div>
    </div>`;
  }).join('') : `<p class="dos-empty-note">${isMgt
    ? 'T4 决策权规则包不参与 20 个经营网络节点的 Case 执行映射。'
    : 'C-300..C-309 未将该站位直接映射到 20 个主网节点（属跨事项治理、专项渠道/服务或平台底层支撑，按 C-270/C-198/C-199 按题进入）。'}</p>`;

  const collabHtml = `<section class="dos-sec" id="dos-s-collab">
    <div class="dos-sec-head"><span class="dos-sec-num">04</span><h3>协作边界 · COLLABORATION &amp; BOUNDARIES</h3></div>
    <div class="dos-eyebrow">${isMgt ? '管理层受控接口对象（非会话 · 合同/配额交接）' : '常用协作席位'}（${(collab.collaborates_with || []).length}）</div>
    <div class="dos-peers-grid">${peersHtml || '<span class="dos-muted">无固定点对点会话</span>'}</div>
    <dl class="dos-ledger">
      <dt>${isMgt ? '覆盖范围' : '参与主链'}</dt><dd>${isMgt ? '<span class="dos-muted">不进入任何 Case 阶段 · 仅通过版本化合同与配额生效</span>' : ((meta.chains || []).length ? meta.chains.map(c => `<span class="dos-chip">${esc(c)}</span>`).join('') : '<span class="dos-muted">跨主链按题进入</span>')}</dd>
      <dt>${isMgt ? '覆盖流程' : '价值流'}</dt><dd>${renderCappedChips(collab.flows)}</dd>
      <dt>业务场景</dt><dd>${renderCappedChips(collab.scenarios)}</dd>
      <dt>共享手册</dt><dd>${renderCappedChips(collab.shared_playbooks)}</dd>
    </dl>
    <div class="dos-mode-pair">
      <div><span class="dos-eyebrow">独立模式 · STANDALONE</span><p>${esc(collab.standalone_mode)}</p></div>
      <div><span class="dos-eyebrow">${isMgt ? '受控接口 · CONTROLLED INTERFACE' : '组队模式 · COMPOSITION'}</span><p>${esc(collab.team_mode)}</p></div>
    </div>
    <div class="dos-envelope">
      <div class="dos-eyebrow">${isMgt ? '管理决策包字段 · DECISION PACKAGE' : '交接封套 · ARTIFACT ENVELOPE (7 必填项)'}</div>
      <div class="dos-env-grid">${(collab.handoff_envelope || []).map(f => `<span>${esc(f)}</span>`).join('')}</div>
    </div>
    ${mgtRightsHtml}
    <div class="dos-specimen dos-boundary-box">
      <div class="dos-eyebrow">岗位专属边界 · SEAT BOUNDARY</div>
      <p>${fmtMd(collab.boundary || '未登记')}</p>
    </div>
    <details class="dos-fold dos-never-fold">
      <summary>我绝不做什么 · ${collab.never_do ? collab.never_do.length : 0} 条全局硬红线（点击展开）</summary>
      <ul class="dos-never-list">${neverList}</ul>
    </details>
    <div class="dos-eyebrow" style="margin-top:12px">关联经营网络节点（${links.length}）</div>
    ${netLinksHtml}
  </section>`;

  // 6) 档案尾签（Colophon）
  const colophonHtml = `<footer class="dos-colophon">
    <div class="dos-eyebrow">档案出处与运行状态 · COLOPHON</div>
    <dl class="dos-ledger dos-colophon-dl">
      <dt>Soul 契约</dt><dd><code>${esc(soul.soul_ref || '—')}</code> (${esc(soul.soul_sha256 || '')})</dd>
      <dt>Playbook</dt><dd><code>${esc(duty.playbook_ref || '—')}</code> (${esc(duty.playbook_sha256 || '')})</dd>
      <dt>目标运行层</dt><dd><code>${esc(meta.runtime_layer || '—')}</code>（owner: ${esc(meta.human_owner_ref || '—')}）</dd>
      <dt>工具可见类</dt><dd><code>${esc((collab.visible_tool_classes || []).join(', '))}</code></dd>
      <dt>凭据隔离</dt><dd><code>${esc(collab.credentials_policy || 'never_visible_to_model')}</code></dd>
      <dt>生产授权</dt><dd><code>production_authorized = false</code> · <code>runtime_identity = false</code></dd>
      <dt>视觉资产</dt><dd>${isMgt ? 'T4 铜牌符号（非 Agent 会话）' : 'WorldPilot Collection 06 · 64/256 WebP'}</dd>
    </dl>
    <div class="dos-final-stamp">设计态档案 · 非运行实例 · 不授予任何权限</div>
  </footer>`;

  return `<article class="dossier-card" data-role-kind="${isMgt ? 'MGT' : 'AGT'}">
    <div class="dos-top-strip">设计态 · 非运行 · production_authorized=false</div>
    <header class="dos-masthead">
      <div class="dos-eyebrow">DIGITAL EMPLOYEE DOSSIER · 数字员工档案</div>
      ${heroVisual}
      <div class="dos-title-block">
        <div class="dos-name-row">
          <h2 class="dos-name">${esc(meta.alias)}</h2>
          <span class="dos-stamp ${admCls}" title="准入状态，不是在线运行状态">${admLabel}</span>
        </div>
        <div class="dos-role-title">${esc(meta.title)}</div>
        <div class="dos-id-line"><code>${esc(sid)}</code> · <code>${esc(meta.slot_id)}</code> · ${esc(meta.plane)} / ${esc(meta.source_group)}</div>
        ${meta.pilot_role ? `<div class="dos-pilot-tag">FLOW-02 × SCN-002 试点角色：${esc(meta.pilot_role)}</div>` : ''}
      </div>
    </header>
    <nav class="dos-subnav" aria-label="档案章节导航">
      <a href="#dos-s-soul" data-dos-nav="dos-s-soul">01 灵魂</a>
      <a href="#dos-s-duty" data-dos-nav="dos-s-duty">02 职责</a>
      <a href="#dos-s-skills" data-dos-nav="dos-s-skills">03 技能</a>
      <a href="#dos-s-collab" data-dos-nav="dos-s-collab">04 边界</a>
    </nav>
    ${soulHtml}
    ${dutyHtml}
    ${skillsHtml}
    ${collabHtml}
    ${colophonHtml}
  </article>`;
}
