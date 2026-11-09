// 数字员工四维档案卡（Dossier Card）共享渲染器
// 同时服务 2D 浅色工作视图（theme='light'）与 3D 深色展示视图（theme='dark'）。
// 零 Three.js 依赖：通过 plaque.js 渲染 MGT T4 规则碑，确保 2D 工作视图不加载 three.module.min.js。

import { renderPlaqueSvg } from './plaque.js?v=38';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

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
  direct: { label: '已有现成工具', cls: 'st-direct', dot: '●' },
  partial: { label: '部分可用', cls: 'st-partial', dot: '◐' },
  gap: { label: '待开发补充', cls: 'st-gap', dot: '○' },
  candidate_filled: { label: '试点新补技能', cls: 'st-cand', dot: '◌' },
};

export const FLOW_NAME_ZH = {
  'FLOW-01': 'FLOW-01 存量GMV增长（投放/价格/库存联动）',
  'FLOW-02': 'FLOW-02 新品从需求证据到商业验证',
  'FLOW-03': 'FLOW-03 补货、采购与交付协同',
  'FLOW-04': 'FLOW-04 新市场、新渠道与合规上架',
  'FLOW-05': 'FLOW-05 客户服务、留存与复购',
  'FLOW-06': 'FLOW-06 业务需求转数据产品与工具',
  'FLOW-07': 'FLOW-07 质量与账号重大事件处理',
  'FLOW-08': 'FLOW-08 经营复盘、资源与组织能力更新',
};

export const PB_NAME_ZH = {
  'PB-001': 'PB-001 存量GMV联合经营手册',
  'PB-002': 'PB-002 新品需求到商业验证手册',
  'PB-003': 'PB-003 补货采购与交付手册',
  'PB-004': 'PB-004 市场进入与合规上架手册',
  'PB-005': 'PB-005 服务留存与复购手册',
  'PB-006': 'PB-006 数据产品与工具开发手册',
  'PB-007': 'PB-007 重大质量与账号事件手册',
  'PB-008': 'PB-008 经营资源与能力复盘手册',
};

export const SCN_NAME_ZH = {
  'SCN-001': 'SCN-001 经营目标、预算与资源分配',
  'SCN-002': 'SCN-002 市场、竞品与用户需求发现',
  'SCN-003': 'SCN-003 产品机会评估与立项',
  'SCN-004': 'SCN-004 产品定义、开发与质量',
  'SCN-005': 'SCN-005 产品及市场准入、知识产权',
  'SCN-006': 'SCN-006 供应商、采购与生产协作',
  'SCN-007': 'SCN-007 需求预测、补货与库存调拨',
  'SCN-008': 'SCN-008 跨境运输与仓储履约',
  'SCN-009': 'SCN-009 商品内容、本地化与上架',
  'SCN-010': 'SCN-010 定价、促销与利润管理',
  'SCN-011': 'SCN-011 广告投放与预算调整',
  'SCN-012': 'SCN-012 品牌内容、站外营销与活动',
  'SCN-013': 'SCN-013 独立站体验、转化与复购',
  'SCN-014': 'SCN-014 订单、交付与渠道异常',
  'SCN-015': 'SCN-015 客服、退换货、评价与客诉',
  'SCN-016': 'SCN-016 渠道结算、对账与财务经营',
  'SCN-017': 'SCN-017 现金、汇率与资金安排',
  'SCN-018': 'SCN-018 店铺账号健康与渠道规则变化',
  'SCN-019': 'SCN-019 组织、人员与绩效改进',
  'SCN-020': 'SCN-020 数据质量、知识、系统与AI运行',
};

export const CHAIN_NAME_ZH = {
  'chain-01': '01 新品经营',
  'chain-02': '02 持续经营',
  'chain-03': '03 新市场经营',
};

const MGT_RIGHTS_ZH = {
  standard_version_ownership: '审定标准版本',
  resource_quota_and_priority: '分配资源配额与优先级',
  portfolio_tradeoff: '跨业务组合取舍',
  escalation_and_freeze: '异常升级与范围冻结',
  cross_domain_arbitration_fallback: '跨部门争议兜底裁决',
  global_reallocation: '全局资源重分配',
  strategic_stop_initiation: '发起战略叫停评估',
  report_to_human_owner: '向真人负责人呈报终审事项',
  l2b_identification_and_handoff: '识别自涉争议并移交真人负责人（L2b）',
  constraint_record_and_retroactive_enforcement: '登记约束台账并追溯执行',
  cadence_scheduling: '排定管理例会与复盘节奏',
  metric_definition_freezing: '直接锁定指标口径（归守衡 AGT-005 与外部复核）',
  self_referential_dispute_arbitration: '裁决涉及自身考核尺度的争议（须移交真人）',
  case_control_instruction: '直接向单张业务工单下达指令',
  asset_write: '直接改价、投放、打款或修改业务系统数据',
  assembly_rule_publication: '自行发布岗位编排规则（归治理官统一发布）',
  action_intent_policy_template_proposal: '自行起草动作权限模板',
  interference_with_independent_review_line: '干预或压后守衡 AGT-005 的独立复核结论',
  deferral_of_control_boundary_retroactive_enforcement: '推迟风控边界的追溯整改',
};

const TIER_ZH = {
  T0: 'T0 真人终审层',
  T1: 'T1 试点主责岗',
  T2: 'T2 专业执行岗',
  T3: 'T3 资料与规则支持岗',
  T4: 'T4 管理层决策规则包',
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

  const tierTitle = TIER_ZH[meta.tier] || meta.tier;

  // 1) 顶部形象或管理规则碑
  const heroVisual = isMgt
    ? `<div class="dos-plaque-hero" title="管理决策规则包：不是 AI 对话员工，只通过版本化规则和配额生效">
        ${renderPlaqueSvg({ ...meta, seat_id: sid }, 148)}
        <div class="dos-plaque-caption">
          <strong>管理层决策规则包（非 AI 对话岗位）</strong>
          <span>不挂聊天会话 · 不插手具体工单 · 只管规则版本与资源配额</span>
        </div>
      </div>`
    : `<div class="dos-portrait-frame">
        <img class="dos-portrait-img" src="./assets/avatars/${theme}/256/${sid}.webp"
             srcset="./assets/avatars/${theme}/64/${sid}.webp 64w, ./assets/avatars/${theme}/256/${sid}.webp 256w"
             sizes="236px" width="236" height="236"
             alt="${esc(meta.alias)}（${esc(sid)}）数字员工头像" decoding="async" fetchpriority="high">
        <span class="dos-tier-badge" title="${esc(tierTitle)}">${esc(meta.tier)}</span>
      </div>`;

  const admCls = isMgt
    ? 'stamp-unverified'
    : (meta.admission_status === 'PARTIAL' ? 'stamp-partial' : 'stamp-unverified');
  const admLabel = isMgt
    ? '管理规则包 · 非 AI 席位'
    : (meta.admission_status === 'PARTIAL' ? '已备齐试点样本' : '待实测核验');

  // 2) 01 处事原则与停手线
  const pTags = (soul.personality_tags || []).map(t => `<span class="dos-chip">${esc(t)}</span>`).join('');
  const principlesHtml = (soul.principles || []).map((p, idx) => {
    const badge = idx === 0
      ? '核心处事原则'
      : `补充原则 0${idx + 1} · ${esc(p.label.replace(/^我的/, ''))}`;
    const cleanBullets = (p.manifestations || []).filter(m => m.replace(/\*/g, '').trim() !== p.quote.trim());
    const mList = cleanBullets.map(m => `<li>${fmtMd(m)}</li>`).join('');
    const openAttr = idx === 0 ? 'open' : '';
    return `<div class="dos-quote-card">
      <div class="dos-eyebrow">${badge}</div>
      <blockquote class="dos-quote">“${esc(p.quote)}”</blockquote>
      ${mList ? `<details class="dos-fold" ${openAttr}>
        <summary>怎么看他有没有做到？（${cleanBullets.length} 条核对标准）</summary>
        <ul class="dos-List">${mList}</ul>
      </details>` : ''}
    </div>`;
  }).join('');

  const soulHtml = `<section class="dos-sec" id="dos-s-soul">
    <div class="dos-sec-head"><span class="dos-sec-num">01</span><h3>处事原则与停手线</h3></div>
    ${pTags ? `<div class="dos-row-chips"><span class="dos-mini-lbl">工作风格</span>${pTags}</div>` : ''}
    ${principlesHtml}
    ${soul.stance ? `<div class="dos-subbox"><div class="dos-eyebrow">怎么跟团队配合</div><p>${fmtMd(soul.stance)}</p></div>` : ''}
    ${soul.stop_signal ? `<div class="dos-stop-rail">
      <div class="dos-eyebrow">■ 遇到什么情况必须立刻停手（等待人工确认）</div>
      <p>${fmtMd(soul.stop_signal)}</p>
    </div>` : ''}
  </section>`;

  // 3) 02 岗位职责与工作步骤
  const overlay = duty.cr_ao_001_overlay;
  const overlayHtml = overlay ? `<div class="dos-rider">
    <div class="dos-rider-head">
      <span>新增职责补充（${esc(overlay.gap)}）</span>
      <button type="button" class="dos-stamp-req dos-chip-btn" data-cr3d="CR-AO-001" title="点击查看跨仓请求单 CR-AO-001 与全部 7 张跨仓契约">CR-AO-001 · 待同步回源档案</button>
    </div>
    <p>${fmtMd(overlay.added_duty)}</p>
    <small>说明：只对「证据齐不齐、预警及不及时、建议有没有依据」负责，不对外部机构决定的结果背锅。</small>
  </div>` : '';

  const steps = duty.playbook_steps || [];
  const stepsHtml = steps.length ? `<div class="dos-timeline">
    <div class="dos-eyebrow" style="margin-bottom:6px">${isMgt ? '管理复盘步骤' : '平时怎么干活'}（共 ${steps.length} 步，点击展开）</div>
    ${steps.map((st, idx) => `<details class="dos-step" ${idx === 0 ? 'open' : ''}>
      <summary><span class="dos-step-idx">${st.step}</span><strong>${esc(st.title)}</strong></summary>
      <p>${fmtMd(st.detail)}</p>
    </details>`).join('')}
  </div>` : '';

  const dutyHtml = `<section class="dos-sec" id="dos-s-duty">
    <div class="dos-sec-head"><span class="dos-sec-num">02</span><h3>岗位职责与工作步骤</h3></div>
    <div class="dos-slot-line">
      <span>能力分工：<strong>${esc(meta.slot_title)}</strong>（<code>${esc(meta.slot_id)}</code>）</span>
      <span>${cTagsFn([meta.slot_basis])}</span>
    </div>
    <div class="dos-mission-box">
      <div class="dos-eyebrow">核心任务</div>
      <p>${fmtMd(duty.mission || '未登记')}</p>
    </div>
    <div class="dos-specimen">
      <div class="dos-eyebrow">平时交什么活（标准交付物）</div>
      <div class="dos-artifact-title">${esc(duty.artifact || '未登记')}</div>
    </div>
    <div class="dos-subbox">
      <div class="dos-eyebrow">怎么衡量他干得好不好</div>
      <p>${esc((duty.metrics || []).join(' · ') || '未登记')}</p>
    </div>
    ${isMgt && duty.management_domain ? `<div class="dos-subbox">
      <div class="dos-eyebrow">分管范围</div>
      <p>${esc(duty.management_domain)}（覆盖 ${esc(duty.owned_role_count)} 个执行岗位）</p>
    </div>` : ''}
    ${overlayHtml}
    ${stepsHtml}
  </section>`;

  // 4) 03 业务技能与工具包
  let cntDirect = 0, cntPartial = 0, cntGap = 0, cntCand = 0;
  const skillCardsHtml = skills.map(sk => {
    const ct = contractByName.get(sk.name);
    const effKind = ct ? ct.kind : sk.kind;
    if (effKind === 'direct') cntDirect++;
    else if (effKind === 'partial') cntPartial++;
    else if (effKind === 'candidate_filled') cntCand++;
    else cntGap++;
    const km = isMgt && effKind === 'gap'
      ? { label: '由外部管理规则执行', cls: 'st-partial', dot: '◈' }
      : (KIND_META[effKind] || KIND_META.gap);
    const supplyArr = ct && ct.supply && ct.supply.length ? ct.supply : (sk.supply || []);
    const supplyChips = supplyArr.length
      ? supplyArr.map(sp => `<code class="dos-code-chip" title="底层技能包 ID：${esc(sp)}">${esc(sp)}</code>`).join('')
      : `<span class="dos-no-supply">${isMgt ? '由外部管理规则固定，不给 AI 开放工具权限' : '平台暂未内置现成工具包，后续需补建'}</span>`;

    const ctHtml = ct ? `<details class="dos-contract">
      <summary>查看试点验收细则（输入 / 做法 / 异常怎么停 / 怎么算合格）</summary>
      <div class="dos-contract-body">
        <div><span class="dos-mini-lbl">需要输入</span><code>${esc((ct.inputs || []).join(', '))}</code></div>
        <div><span class="dos-mini-lbl">具体做法</span><span>${esc(ct.method)}</span></div>
        <div><span class="dos-mini-lbl">判断分支</span><span>${esc((ct.branches || []).join(' ｜ '))}</span></div>
        <div><span class="dos-mini-lbl">交付字段</span><code>${esc((ct.output_fields || []).join(', '))}</code></div>
        <div><span class="dos-mini-lbl">异常停手规则</span><code class="dos-fail-code">${esc(ct.failure_handling)}</code></div>
        <div><span class="dos-mini-lbl">合格标准</span><span>${esc(ct.verification_criteria)}</span></div>
      </div>
    </details>` : '';

    return `<div class="dos-skill-card ${km.cls}">
      <div class="dos-skill-top">
        <strong>${esc(sk.name)}</strong>
        <span class="dos-sk-badge ${km.cls}">${km.dot} ${km.label}</span>
      </div>
      ${effKind === 'candidate_filled' ? '<div class="dos-skill-id"><small>已为本次新品立项试点专门补齐候选技能包</small></div>' : ''}
      <div class="dos-supply-wrap"><span class="dos-mini-lbl">关联技能包</span>${supplyChips}</div>
      ${sk.note ? `<div class="dos-sk-note">${fmtMd(sk.note)}</div>` : ''}
      ${ctHtml}
    </div>`;
  }).join('');

  const skillsHtml = `<section class="dos-sec" id="dos-s-skills">
    <div class="dos-sec-head"><span class="dos-sec-num">03</span><h3>${isMgt ? '管理能力与规则工具' : '业务技能与工具包'}（${skills.length} 项）</h3></div>
    <div class="dos-sk-bar" aria-hidden="true">
      <i style="flex:${cntDirect};background:var(--dos-direct)"></i>
      <i style="flex:${cntPartial + cntCand + (isMgt ? cntGap : 0)};background:var(--dos-brass)"></i>
      <i style="flex:${isMgt ? 0 : cntGap};background:var(--dos-rust)"></i>
    </div>
    <div class="dos-sk-summary">共 ${skills.length} 项技能：${cntDirect} 项已有现成工具 / ${cntPartial} 项部分可用${cntCand ? ` / ${cntCand} 项试点新补` : ''} / ${isMgt ? `${cntGap} 项由外部规则执行` : `${cntGap} 项待补充`}</div>
    ${contracts.length ? `<div class="dos-pilot-ribbon">★ 本岗位参与「新品立项只读试点」，已配齐 ${contracts.length} 项技能的验收细则</div>` : ''}
    ${skillCardsHtml}
  </section>`;

  // 5) 04 协作同事与红线
  const peersHtml = (collab.collaborates_with || []).map(pid => {
    const pMeta = allSeatsMap.get(pid);
    const pAlias = pMeta ? pMeta.alias : pid;
    const pTitle = pMeta ? pMeta.title : '';
    const pPin = pMeta ? renderPinAvatarHtml(pMeta, theme, 20) : '';
    return `<button type="button" class="dos-peer-chip" data-jump-seat="${esc(pid)}" title="点击查看 ${esc(pAlias)}（${esc(pTitle)}）">
      ${pPin}<strong>${esc(pAlias)}</strong><small>${esc(pid)}</small>
    </button>`;
  }).join('');

  const renderNamedChips = (arr, nameMap, dataAttr = '') => {
    if (!arr || !arr.length) return `<span class="dos-muted">—</span>`;
    const fmtItem = x => dataAttr
      ? `<button type="button" class="dos-chip dos-chip-btn" ${dataAttr}="${esc(x)}" title="点击在 3D 空间点亮参与「${esc(nameMap[x] || x)}」的全部协同同事">${esc(nameMap[x] || x)}</button>`
      : `<span class="dos-chip" title="${esc(x)}">${esc(nameMap[x] || x)}</span>`;
    const head = arr.slice(0, 3).map(fmtItem).join('');
    if (arr.length <= 3) return head;
    const tail = arr.slice(3).map(fmtItem).join('');
    return `${head}<details class="dos-more"><summary>展开其余 ${arr.length - 3} 项</summary><div>${tail}</div></details>`;
  };

  const mgtRightsHtml = isMgt ? `<div class="dos-subbox">
    <div class="dos-eyebrow">管理层拥有的决策权（${(collab.decision_rights || []).length} 项）</div>
    <ul class="dos-List">${(collab.decision_rights || []).map(r => `<li title="${esc(r)}">${esc(MGT_RIGHTS_ZH[r] || r)}</li>`).join('')}</ul>
    <div class="dos-eyebrow" style="margin-top:8px">明确禁止越权的事（${(collab.decision_rights_not_granted || []).length} 项）</div>
    <ul class="dos-never-list">${(collab.decision_rights_not_granted || []).map(r => `<li title="${esc(r)}"><span class="dos-x">×</span><span>${esc(MGT_RIGHTS_ZH[r] || r)}</span></li>`).join('')}</ul>
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
    ? '管理层决策规则包不直接下场执行 20 个业务节点的具体工单。'
    : '该岗位属于跨事项专项支持或平台底座，不固定绑死在某一个业务节点上，按具体任务需要随时调入。'}</p>`;

  const collabHtml = `<section class="dos-sec" id="dos-s-collab">
    <div class="dos-sec-head"><span class="dos-sec-num">04</span><h3>协作同事与红线</h3></div>
    <div class="dos-eyebrow">${isMgt ? '管理层规则对接方（通过合同与配额交接，不拉群闲聊）' : '平时最常配合的同事（点击头像可直接跳转）'}</div>
    <div class="dos-peers-grid">${peersHtml || '<span class="dos-muted">无固定点对点协作</span>'}</div>
    <dl class="dos-ledger">
      <dt>${isMgt ? '管理范围' : '参与主线'}</dt><dd>${isMgt ? '<span class="dos-muted">不进入具体工单，只通过规则版本与资源配额生效</span>' : ((meta.chains || []).length ? meta.chains.map(c => `<button type="button" class="dos-chip dos-chip-btn" data-chain3d-jump="${esc(c)}" title="点击进入 ${esc(CHAIN_NAME_ZH[c] || c)} 3D 分步走查">${esc(CHAIN_NAME_ZH[c] || c)}</button>`).join('') : '<span class="dos-muted">跨主线按任务调入</span>')}</dd>
      <dt>参与流程</dt><dd>${renderNamedChips(collab.flows, FLOW_NAME_ZH, 'data-flow3d')}</dd>
      <dt>业务场景</dt><dd>${renderNamedChips(collab.scenarios, SCN_NAME_ZH, 'data-scn3d')}</dd>
      <dt>参考手册</dt><dd>${renderNamedChips(collab.shared_playbooks, PB_NAME_ZH, 'data-pb3d')}</dd>
    </dl>
    <div class="dos-mode-pair">
      <div><span class="dos-eyebrow">单独接活时怎么做</span><p>${isMgt ? '按周/月/季管理例会运行，只看汇总指标，输出决策包。' : '接收范围、截止时间和验收人明确的独立任务单，完成后交指定验收人。'}</p></div>
      <div><span class="dos-eyebrow">${isMgt ? '怎么跟执行团队衔接' : '多岗位组队时怎么配合'}</span><p>${isMgt ? '下发全局约束合同与资源配额，异常超阈值时接手裁决，不直接指挥单张工单。' : '由外部工单控制器统一派单，只读取上一步已验收合格的交付物，严禁私下聊天传权限。'}</p></div>
    </div>
    <div class="dos-envelope">
      <div class="dos-eyebrow">${isMgt ? '管理决策包必须写清的 6 件事' : '交接单必填的 7 项内容（缺一不可）'}</div>
      <div class="dos-env-grid">${(collab.handoff_envelope || []).map(f => `<span>${esc(f)}</span>`).join('')}</div>
    </div>
    ${mgtRightsHtml}
    <div class="dos-specimen dos-boundary-box">
      <div class="dos-eyebrow">本岗位专属红线（什么事不能自己拍板）</div>
      <p>${fmtMd(collab.boundary || '未登记')}</p>
    </div>
    <details class="dos-fold dos-never-fold">
      <summary>我绝不触碰的 ${collab.never_do ? collab.never_do.length : 0} 条底线（点击展开）</summary>
      <ul class="dos-never-list">${neverList}</ul>
    </details>
    <div class="dos-eyebrow" style="margin-top:12px">关联的经营网络节点（${links.length} 个）</div>
    ${netLinksHtml}
  </section>`;

  // 6) 折叠式底层技术出处（避免把 sha256 和路径直接摊在读者脸上）
  const colophonHtml = `<footer class="dos-colophon">
    <details class="dos-fold">
      <summary>查看底层档案路径与工程状态（供开发核对）</summary>
      <dl class="dos-ledger dos-colophon-dl" style="margin-top:6px">
        <dt>处事原则源</dt><dd><code>${esc(soul.soul_ref || '—')}</code> (${esc(soul.soul_sha256 || '')})</dd>
        <dt>作业手册源</dt><dd><code>${esc(duty.playbook_ref || '—')}</code> (${esc(duty.playbook_sha256 || '')})</dd>
        <dt>运行层级</dt><dd><code>${esc(meta.runtime_layer || '—')}</code>（人工责任人：${esc(meta.human_owner_ref === 'PENDING' ? '待指定' : (meta.human_owner_ref || '—'))}）</dd>
        <dt>工具权限类</dt><dd><code>${esc((collab.visible_tool_classes || []).join(', '))}</code></dd>
        <dt>账号密钥</dt><dd>模型不可见，由宿主环境隔离托管</dd>
        <dt>系统状态</dt><dd>未开通生产权限 · 尚未接入真实业务系统</dd>
      </dl>
    </details>
    <div class="dos-final-stamp">设计方案预览 · 尚未接入真实系统 · 不会自动执行任何业务操作</div>
  </footer>`;

  return `<article class="dossier-card" data-role-kind="${isMgt ? 'MGT' : 'AGT'}">
    <div class="dos-top-strip">当前为岗位设计方案 · 尚未接入生产系统</div>
    <header class="dos-masthead">
      <div class="dos-eyebrow">数字员工工作档案 · ${esc(tierTitle)}</div>
      ${heroVisual}
      <div class="dos-title-block">
        <div class="dos-name-row">
          <h2 class="dos-name">${esc(meta.alias)}</h2>
          <span class="dos-stamp ${admCls}" title="当前完成度状态，不代表在线或离线">${admLabel}</span>
        </div>
        <div class="dos-role-title">${esc(meta.title)}</div>
        <div class="dos-id-line">工号 <code>${esc(sid)}</code> · 站位 <code>${esc(meta.slot_id)}</code> · 归属：${esc(meta.plane)} / ${esc(meta.source_group)}</div>
        ${meta.pilot_role ? `<div class="dos-pilot-tag">★ 参与新品立项只读试点：担任「${esc(meta.pilot_role)}」</div>` : ''}
      </div>
    </header>
    <nav class="dos-subnav" aria-label="档案章节导航">
      <a href="#dos-s-soul" data-dos-nav="dos-s-soul">01 原则</a>
      <a href="#dos-s-duty" data-dos-nav="dos-s-duty">02 职责</a>
      <a href="#dos-s-skills" data-dos-nav="dos-s-skills">03 技能</a>
      <a href="#dos-s-collab" data-dos-nav="dos-s-collab">04 协作</a>
    </nav>
    ${soulHtml}
    ${dutyHtml}
    ${skillsHtml}
    ${collabHtml}
    ${colophonHtml}
  </article>`;
}
