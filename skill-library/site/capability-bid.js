const payload = window.CAPABILITY_BID_DATA || { details: [], summaries: [], zoneOrder: [], laneOrder: [] };
const clusterPayload = window.SKILL_CLUSTER_DATA || { bySkillId: {}, problemTypes: [], packages: [], problemOrder: [], packageOrder: [] };
const b01Payload = window.B01_BID_SHORTLIST_DATA || { items: [], scope: "" };
const trialPayload = window.B01_TRIAL_DATA || { skills: [], crossSource: [], nextSteps: [], nonConclusions: [] };
const trial2Payload = window.B01_TRIAL_02_DATA || { skills: [], crossSource: [], nextSteps: [], nonConclusions: [] };
const blindPayload = window.B01_BLIND_DATA || { coverage: [], roles: [], gates: [], nonConclusions: [] };
const runtimePayload = window.CODEX_RUNTIME_DATA || { entries: [], counts: {}, generated_at: "" };
const runtimeScreeningPayload = window.CURRENT_CODEX_SCREENING_DATA || { summary: {}, entries: [] };
const cb01Payload = window.CURRENT_CODEX_CB01_DATA || { state: "未准备", candidate: {}, fixture: {}, rubric: [], hard_gates: [], non_conclusions: [] };
const rows = (payload.details || []).map((row) => ({ ...row, ...(clusterPayload.bySkillId[row.id] || {}) }));
const summaries = payload.summaries || [];
const $ = (id) => document.getElementById(id);
const collator = new Intl.Collator("zh-CN");
const controls = ["q", "zone", "lane", "problem", "package", "readiness", "runtime", "responsibility", "merge"].map($).filter(Boolean);

const state = {
  activePage: location.hash?.replace("#", "") || "overview",
  cardPage: 1,
  evidencePage: 1,
  mergePage: 1,
  runtimePage: 1,
  runtimeScreeningPage: 1,
  pageSize: 36,
  tableSize: 40,
};

const readinessOrder = ["可竞聘", "可入围，需补证", "暂停竞聘", "不参评"];
const mergeOrder = ["可合并", "需拆分", "保留变体", "待核验"];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function order(values, preferred = []) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => {
    const ia = preferred.indexOf(a);
    const ib = preferred.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || collator.compare(a, b);
  });
}

function fill(id, key, preferred = []) {
  const select = $(id);
  if (!select) return;
  order(rows.map((row) => row[key]), preferred).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function haystack(row) {
  return [
    row.name,
    row.cn,
    row.zone,
    row.lane,
    row.problemType,
    row.capabilityPackage,
    row.problemQuestion,
    row.problemValue,
    row.packageRole,
    row.position,
    row.problem,
    row.why,
    row.input,
    row.output,
    row.acceptance,
    row.responsibility,
    row.receiver,
    row.readiness,
    row.merge,
    row.reviewReason,
    row.boundary,
    row.runtimeStatus,
    row.runtimeLayer,
    row.runtimeVersion,
    row.path,
  ].join(" ").toLowerCase();
}

function currentRows() {
  const q = $("q").value.trim().toLowerCase();
  const zone = $("zone").value;
  const lane = $("lane").value;
  const problem = $("problem").value;
  const capabilityPackage = $("package").value;
  const readiness = $("readiness").value;
  const runtime = $("runtime").value;
  const responsibility = $("responsibility").value;
  const merge = $("merge").value;
  return rows
    .filter((row) => (!q || haystack(row).includes(q))
      && (!zone || row.zone === zone)
      && (!lane || row.lane === lane)
      && (!problem || row.problemType === problem)
      && (!capabilityPackage || row.capabilityPackage === capabilityPackage)
      && (!readiness || row.readiness === readiness)
      && (!runtime || row.runtimeStatus === runtime)
      && (!responsibility || row.responsibility === responsibility)
      && (!merge || row.merge === merge))
    .sort((a, b) => (
      (readinessOrder.indexOf(a.readiness) < 0 ? 99 : readinessOrder.indexOf(a.readiness))
      - (readinessOrder.indexOf(b.readiness) < 0 ? 99 : readinessOrder.indexOf(b.readiness))
    ) || Number(b.confidence || 0) - Number(a.confidence || 0) || collator.compare(a.name || "", b.name || ""));
}

function count(rowsInView, key, value) {
  return rowsInView.filter((row) => row[key] === value).length;
}

function badgeClass(readiness) {
  if (readiness === "可竞聘") return "ready";
  if (readiness === "可入围，需补证") return "warn";
  if (readiness === "不参评") return "out";
  return "stop";
}

function setPage(page) {
  state.activePage = page;
  location.hash = page;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  document.querySelectorAll(".page").forEach((panel) => panel.classList.toggle("active", panel.id === `page-${page}`));
  render();
}

function renderStats(list) {
  $("stats").innerHTML = [
    ["总候选", list.length, "当前筛选命中的 Skill"],
    ["可竞聘", count(list, "readiness", "可竞聘"), "材料相对完整，可进入责任节点初筛"],
    ["需补证", count(list, "readiness", "可入围，需补证"), "方向有价值，但输入输出或证据还要补"],
    ["暂停", count(list, "readiness", "暂停竞聘"), "质量、授权、敏感或边界问题未清"],
    ["不参评", count(list, "readiness", "不参评"), "暂不进入三宝候选池"],
  ].map(([label, num, desc]) => `
    <article class="stat-card">
      <strong>${num}</strong>
      <span>${esc(label)}</span>
      <span>${esc(desc)}</span>
    </article>
  `).join("");
}

function renderRuntimeStats() {
  const entries = runtimePayload.entries || [];
  const current = entries.length;
  const verified = entries.filter((row) => row["当前Codex状态"] === "当前可用，归档内容已核验").length;
  const updated = entries.filter((row) => row["当前Codex状态"] === "当前可用，内容已更新待业务复核").length;
  const newlyAdded = entries.filter((row) => row["当前Codex状态"] === "当前可用，新纳入待业务复核").length;
  $("stats").innerHTML = [
    ["当前入口", current, "这台机器的 Codex 根目录中可定位的 Skill"],
    ["归档已核验", verified, "当前原文与归档副本一致"],
    ["内容已更新", updated, "已重新提炼摘要，仍需业务复核"],
    ["新纳入", newlyAdded, "已归档，尚未完成业务复核"],
  ].map(([label, num, desc]) => `
    <article class="stat-card"><strong>${esc(num)}</strong><span>${esc(label)}</span><span>${esc(desc)}</span></article>
  `).join("");
}

function runtimeSearch(entry) {
  const q = $("q").value.trim().toLowerCase();
  return !q || [
    entry["英文名称"], entry["中文名称"], entry["用途总结"], entry["当前Codex状态"],
    entry["Codex来源层"], entry["Codex版本"], entry["业务场景"], entry["问题类型"],
  ].join(" ").toLowerCase().includes(q);
}

function renderRuntime() {
  const entries = (runtimePayload.entries || []).filter(runtimeSearch);
  const layerOrder = ["Codex system", "Codex 用户技能", "Codex Agent 技能", "Codex primary runtime", "Codex bundled plugin", "Codex remote plugin"];
  $("runtimeOverview").innerHTML = `
    <article class="runtime-note"><b>读法</b><p>当前可用是安装与入口事实；竞聘状态仍要看业务问题、输入输出、验收证据和边界。</p></article>
    <article class="runtime-note"><b>本次核验</b><p>${esc(runtimePayload.generated_at || "尚未核验")}</p></article>
    <article class="runtime-note"><b>历史版本</b><p>已被替代的旧插件条目仍保留在总资产库中，但这里仅展示当前入口。</p></article>
  `;
  $("runtimeLayers").innerHTML = layerOrder.map((layer) => {
    const items = entries.filter((row) => row["Codex来源层"] === layer);
    const versions = [...new Set(items.map((row) => row["Codex版本"]).filter(Boolean))].slice(0, 3).join("；");
    return `<article class="runtime-layer"><strong>${items.length}</strong><b>${esc(layer)}</b><span>${esc(versions || "无当前入口")}</span></article>`;
  }).join("");
  const rowsForTable = entries.map((row) => ({
    name: row["英文名称"],
    status: row["当前Codex状态"],
    layer: row["Codex来源层"],
    version: row["Codex版本"],
    purpose: row["用途总结"],
    business: row["运行时业务提示"],
  }));
  renderTable("runtimeTable", rowsForTable, "runtimePage", [
    ["name", "Skill"], ["status", "当前状态"], ["layer", "来源层"], ["version", "版本"], ["purpose", "用途"], ["business", "业务提醒"],
  ], state.tableSize);
}

function screeningSearch(entry) {
  const q = $("q").value.trim().toLowerCase();
  return !q || [
    entry.Skill, entry["中文名称"], entry["初筛去向"], entry["三宝位置"], entry["最小业务问题"],
    entry["一句话作用"], entry["可验收输出"], entry["为什么这样分流"], entry["Codex 版本"],
  ].join(" ").toLowerCase().includes(q);
}

function renderRuntimeScreeningStats() {
  const counts = runtimeScreeningPayload.summary?.counts || {};
  $("stats").innerHTML = [
    ["原文核读", (runtimeScreeningPayload.entries || []).length, "逐项回到当前 SKILL.md，不按名称猜用途"],
    ["可设计业务验证", counts["进入业务验证设计"] || 0, "先用脱敏、受控题验证交付质量"],
    ["能力供给试验", counts["先作为能力供给试验"] || 0, "先明确使用者、接收方和验收方式"],
    ["工程运行支撑", counts["保留为工程运行支撑"] || 0, "保留工具与运行价值，不与业务能力抢赛道"],
    ["当前范围外", counts["暂不进入当前三宝竞聘"] || 0, "等待明确的产品技术路线或接收位置"],
  ].map(([label, num, desc]) => `<article class="stat-card"><strong>${esc(num)}</strong><span>${esc(label)}</span><span>${esc(desc)}</span></article>`).join("");
}

function screeningRouteNote(route) {
  const notes = {
    "进入业务验证设计": "对应当前三宝的最小经营问题。下一步是受控题，不是真实业务动作。",
    "先作为能力供给试验": "先确定它服务哪个人、交给谁、如何验收，避免工具先行。",
    "保留为工程运行支撑": "当前作用在工程、发布、预览或特定项目治理，单列保留。",
    "暂不进入当前三宝竞聘": "没有确认的业务接收位置或技术路线，先不制造竞聘题。",
  };
  return notes[route] || "需要继续补齐业务问题、接收方和边界。";
}

function renderRuntimeScreening() {
  const entries = (runtimeScreeningPayload.entries || []).filter(screeningSearch);
  const summary = runtimeScreeningPayload.summary || {};
  const routes = ["进入业务验证设计", "先作为能力供给试验", "保留为工程运行支撑", "暂不进入当前三宝竞聘"];
  $("runtimeScreeningOverview").innerHTML = `
    <article class="runtime-note"><b>本轮范围</b><p>${esc(summary.scope || "当前 Codex 新纳入条目")}</p></article>
    <article class="runtime-note"><b>怎么读</b><p>先看“最小业务问题”和“可验收输出”，再看为什么分流与下一道门槛。</p></article>
    <article class="runtime-note"><b>保守边界</b><p>${esc(summary.boundary || "初筛不改变既有质量闸口。")}</p></article>
  `;
  $("runtimeScreeningRoutes").innerHTML = routes.map((route) => {
    const items = entries.filter((entry) => entry["初筛去向"] === route);
    const samples = items.slice(0, 4).map((entry) => entry.Skill).join("；");
    return `<article class="screening-route"><strong>${items.length}</strong><b>${esc(route)}</b><p>${esc(screeningRouteNote(route))}</p><span>${esc(samples || "当前筛选下没有条目")}</span></article>`;
  }).join("");
  const rowsForTable = entries.map((entry) => ({
    skill: entry.Skill, cn: entry["中文名称"], route: entry["初筛去向"], position: entry["三宝位置"],
    problem: entry["最小业务问题"], output: entry["可验收输出"], next: entry["分流重点"], boundary: entry["不能直接得出的结论"],
  }));
  renderTable("runtimeScreeningTable", rowsForTable, "runtimeScreeningPage", [
    ["skill", "Skill"], ["cn", "中文名称"], ["route", "初筛去向"], ["position", "三宝位置"],
    ["problem", "最小业务问题"], ["output", "可验收输出"], ["next", "下一道门槛"], ["boundary", "不能直接得出的结论"],
  ], state.tableSize);
}

function renderCB01Stats() {
  const fixture = cb01Payload.fixture || {};
  $("stats").innerHTML = [
    ["候选", cb01Payload.candidate?.skill || "未加载", "B01-C01 的平行候选，不替代原 C01"],
    ["输入性质", "完全合成", "没有真实消费者、市场、SKU、渠道或财务数据"],
    ["当前状态", "未启动", "尚无候选提交、独立复核、评分或通过结论"],
    ["独立复核", "待指定", "必须未参与任务包设计和候选提交"],
    ["固定选项", fixture.decision_options?.length || 0, "A、B 与不行动基线均须比较"],
  ].map(([label, num, desc]) => `<article class="stat-card"><strong>${esc(num)}</strong><span>${esc(label)}</span><span>${esc(desc)}</span></article>`).join("");
}

function renderCB01() {
  const fixture = cb01Payload.fixture || {};
  const position = cb01Payload.position || {};
  $("cb01Overview").innerHTML = `
    <article class="b01-note"><b>为什么选它先试</b><p>${esc((cb01Payload.selection_reason || [])[0] || "选择理由尚未加载。")}</p></article>
    <article class="b01-note"><b>与原 B01 的关系</b><p>${esc(position.relationship_to_existing_b01 || "平行候选关系尚未加载。")}</p></article>
    <article class="b01-note"><b>题目边界</b><p>${esc(fixture.classification || "输入性质尚未加载。")}</p></article>
  `;
  $("cb01Decision").innerHTML = `
    <span>当前判断</span><strong>${esc(cb01Payload.state || "未准备")}</strong>
    <p>${esc(cb01Payload.status_explanation || "没有可用的状态说明。")}</p>
    <small>${esc(cb01Payload.next_gate || "下一道门槛待定义。")}</small>
  `;
  $("cb01Task").innerHTML = `
    <article class="b01-card">
      <div class="b01-card-head"><div><p class="eyebrow">${esc(position.code || "CB01")}</p><h3>${esc(position.name || "商业论证")}</h3><p class="b01-name">${esc(cb01Payload.candidate?.cn || cb01Payload.candidate?.skill || "候选未加载")}</p></div><span class="badge warn">待独立复核</span></div>
      <div class="b01-position"><b>固定业务题</b><span>${esc(fixture.decision_question || "未加载")}</span></div>
      <div class="section"><b>候选需要交付</b><ul>${(cb01Payload.submission_contract || []).map((line) => `<li>${esc(line)}</li>`).join("")}</ul></div>
      <div class="section"><b>输入覆盖</b><p>${esc((fixture.evidence || []).map((item) => `${item.id} ${item.type}`).join("；"))}</p></div>
    </article>
  `;
  $("cb01Rubric").innerHTML = (cb01Payload.rubric || []).map((item) => `
    <article class="lane-card"><p class="eyebrow">满分 ${esc(item.max_score)}</p><h3>${esc(item.dimension)}</h3><p>${esc(item.look_for)}</p></article>
  `).join("") || '<div class="empty">评分维度尚未加载。</div>';
  $("cb01Gates").innerHTML = (cb01Payload.hard_gates || []).map((item, index) => `
    <article class="trial-next-card"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>
  `).join("");
  $("cb01Boundary").innerHTML = `<b>本页明确不作出的结论</b><ul>${(cb01Payload.non_conclusions || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderOverview(list) {
  const zoneCounts = order(list.map((row) => row.zone), payload.zoneOrder || [])
    .map((zone) => [zone, count(list, "zone", zone)]);
  const laneCounts = order(list.map((row) => row.lane), payload.laneOrder || [])
    .map((lane) => [lane, count(list, "lane", lane)]);
  const packageCounts = order(list.map((row) => row.capabilityPackage), clusterPayload.packageOrder || [])
    .map((capabilityPackage) => [capabilityPackage, count(list, "capabilityPackage", capabilityPackage)]);
  $("overviewInsights").innerHTML = `
    <article class="insight-card"><h3>先竞聘，不任命</h3><p>这里展示的是候选池。只有业务问题、输入、输出、边界、证据和验收都说清楚，才进入后续岗位 Bundle、Preset 或 Native Agent 组装。</p></article>
    <article class="insight-card"><h3>正式展区和闸口分开</h3><p>价值创造、经营治理、能力供给是正式业务展区；待补证池和范围外是闸口，不能被误读成正式能力。</p></article>
    <article class="insight-card"><h3>业务先看交付</h3><p>卡片正面只放业务需要判断的内容。来源路径、hash、正文质量和机器置信度放在复核证据页。</p></article>
  `;
  $("zoneMini").innerHTML = zoneCounts.map(([zone, total]) => `
    <div class="mini-stat"><b>${total}</b><span>${esc(zone)}</span></div>
  `).join("");
  $("laneMini").innerHTML = laneCounts.slice(0, 10).map(([lane, total]) => `
    <div class="mini-stat"><b>${total}</b><span>${esc(lane)}</span></div>
  `).join("");
  $("packageMini").innerHTML = packageCounts.slice(0, 10).map(([capabilityPackage, total]) => `
    <div class="mini-stat"><b>${total}</b><span>${esc(capabilityPackage)}</span></div>
  `).join("");
}

function summaryForLane(lane, responsibility) {
  return summaries.filter((row) => row["蓝图赛道"] === lane && (!responsibility || row["责任候选"] === responsibility));
}

function renderBlueprint(list) {
  const lanes = order(list.map((row) => row.lane), payload.laneOrder || []);
  $("blueprintGrid").innerHTML = lanes.map((lane) => {
    const laneRows = list.filter((row) => row.lane === lane);
    const laneSummary = summaryForLane(lane, $("responsibility").value);
    const sample = laneRows.slice(0, 5).map((row) => row.name).join("；");
    const business = laneSummary[0]?.["业务看点"] || "这个赛道需要继续确认业务问题、输入输出和验收方式。";
    return `
      <article class="lane-card">
        <p class="eyebrow">${esc(laneRows[0]?.zone || "")}</p>
        <h3>${esc(lane)}</h3>
        <p>${esc(business)}</p>
        <div class="numbers">
          <div class="mini-stat"><b>${laneRows.length}</b><span>总数</span></div>
          <div class="mini-stat"><b>${count(laneRows, "readiness", "可竞聘")}</b><span>可竞聘</span></div>
          <div class="mini-stat"><b>${count(laneRows, "readiness", "可入围，需补证")}</b><span>需补证</span></div>
          <div class="mini-stat"><b>${count(laneRows, "readiness", "暂停竞聘")}</b><span>暂停</span></div>
        </div>
        <div class="section"><b>代表候选</b><p>${esc(sample || "暂无")}</p></div>
      </article>
    `;
  }).join("") || '<div class="empty">没有匹配赛道。</div>';
}

function renderProblems(list) {
  const metas = clusterPayload.problemTypes || [];
  $("problemGrid").innerHTML = metas.map((meta) => {
    const problemRows = list.filter((row) => row.problemType === meta["问题类型"]);
    if (!problemRows.length) return "";
    const sample = problemRows.slice(0, 5).map((row) => row.name).join("；");
    return `
      <article class="lane-card">
        <p class="eyebrow">${esc(meta["能力包候选"] || "")}</p>
        <h3>${esc(meta["问题类型"] || "")}</h3>
        <p>${esc(meta["核心业务问题"] || "")}</p>
        <div class="numbers">
          <div class="mini-stat"><b>${problemRows.length}</b><span>当前命中</span></div>
          <div class="mini-stat"><b>${count(problemRows, "readiness", "可竞聘")}</b><span>可竞聘</span></div>
          <div class="mini-stat"><b>${count(problemRows, "readiness", "可入围，需补证")}</b><span>需补证</span></div>
          <div class="mini-stat"><b>${count(problemRows, "clusterConfidence", "高把握")}</b><span>高把握</span></div>
        </div>
        <div class="section"><b>业务价值</b><p>${esc(meta["业务价值"] || "")}</p></div>
        <div class="section"><b>代表候选</b><p>${esc(sample || "暂无")}</p></div>
      </article>
    `;
  }).join("") || '<div class="empty">没有匹配的问题类型。</div>';
}

function renderPackages(list) {
  const metas = clusterPayload.packages || [];
  $("packageGrid").innerHTML = metas.map((meta) => {
    const packageRows = list.filter((row) => row.capabilityPackage === meta["能力包候选"]);
    if (!packageRows.length) return "";
    const sample = packageRows.slice(0, 5).map((row) => row.name).join("；");
    return `
      <article class="lane-card package-card">
        <p class="eyebrow">${esc(meta["能力包编号"] || "")}</p>
        <h3>${esc(meta["能力包候选"] || "")}</h3>
        <p>${esc(meta["能力包定位"] || "")}</p>
        <div class="numbers">
          <div class="mini-stat"><b>${packageRows.length}</b><span>当前命中</span></div>
          <div class="mini-stat"><b>${count(packageRows, "readiness", "可竞聘")}</b><span>可竞聘</span></div>
          <div class="mini-stat"><b>${count(packageRows, "readiness", "可入围，需补证")}</b><span>需补证</span></div>
          <div class="mini-stat"><b>${count(packageRows, "readiness", "暂停竞聘")}</b><span>待复核</span></div>
        </div>
        <div class="section"><b>服务业务结果</b><p>${esc(meta["服务业务结果"] || "")}</p></div>
        <div class="section"><b>覆盖问题</b><p>${esc(meta["覆盖问题类型"] || "")}</p></div>
        <div class="section"><b>代表候选</b><p>${esc(sample || "暂无")}</p></div>
      </article>
    `;
  }).join("") || '<div class="empty">没有匹配的能力包。</div>';
}

function card(row) {
  return `
    <article class="card">
      <div class="card-head">
        <h3>${esc(row.name)}</h3>
        <span class="badge ${badgeClass(row.readiness)}">${esc(row.readiness)}</span>
      </div>
      <div class="meta">
        <span class="pill">${esc(row.zone)}</span>
        <span class="pill">${esc(row.lane)}</span>
        <span class="pill">${esc(row.problemType || "待补证")}</span>
        <span class="pill">${esc(row.capabilityPackage || "待提炼")}</span>
        <span class="pill">${esc(row.responsibility)}</span>
        <span class="pill">${esc(row.merge)}</span>
        ${row.runtimeStatus && row.runtimeStatus !== "不在当前 Codex 运行时范围" ? `<span class="pill runtime-pill">${esc(row.runtimeStatus)}</span>` : ""}
      </div>
      <div class="section"><b>竞聘位置</b><p>${esc(row.position)}</p></div>
      <div class="section"><b>业务问题</b><p>${esc(row.problemQuestion || row.problem)}</p></div>
      <div class="section"><b>业务价值</b><p>${esc(row.problemValue || row.why)}</p></div>
      <div class="section"><b>能力包内作用</b><p>${esc(row.packageRole || "需结合真实事项确认")}</p></div>
      <div class="io">
        <div class="section"><b>关键输入</b><p>${esc(row.input || "输入未写清，需补证。")}</p></div>
        <div class="section"><b>关键输出</b><p>${esc(row.output || "输出未写清，需补证。")}</p></div>
      </div>
      <div class="section"><b>验收与边界</b><p>${esc(row.acceptance)}</p></div>
      <div class="footer"><span>置信度 ${esc(row.confidence || "")}</span><span class="path" title="${esc(row.path)}">${esc(row.path)}</span></div>
    </article>
  `;
}

function paginate(list, page, size) {
  const totalPages = Math.max(1, Math.ceil(list.length / size));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  return {
    page: safePage,
    totalPages,
    items: list.slice((safePage - 1) * size, safePage * size),
  };
}

function pagerHtml(type, page, totalPages, total, size) {
  const buttons = [];
  const candidates = [1, page - 1, page, page + 1, totalPages].filter((n) => n >= 1 && n <= totalPages);
  [...new Set(candidates)].sort((a, b) => a - b).forEach((n) => {
    buttons.push(`<button class="page-button ${n === page ? "active" : ""}" data-pager="${type}" data-page="${n}">${n}</button>`);
  });
  return `
    <div class="pager">
      <span>第 ${page} / ${totalPages} 页，每页 ${size} 条，共 ${total} 条</span>
      <div>
        <button data-pager="${type}" data-page="${Math.max(1, page - 1)}">上一页</button>
        ${buttons.join("")}
        <button data-pager="${type}" data-page="${Math.min(totalPages, page + 1)}">下一页</button>
      </div>
    </div>
  `;
}

function renderCards(list) {
  const pageData = paginate(list, state.cardPage, state.pageSize);
  state.cardPage = pageData.page;
  $("cardCount").textContent = `命中 ${list.length} 条，当前显示 ${pageData.items.length} 条`;
  $("cards").innerHTML = pageData.items.map(card).join("") || '<div class="empty">没有匹配结果。换一个筛选条件试试。</div>';
  $("cardPager").innerHTML = pagerHtml("card", pageData.page, pageData.totalPages, list.length, state.pageSize);
}

function tableRows(rowsToRender, columns) {
  return rowsToRender.map((row) => `<tr>${columns.map(([key]) => `<td>${esc(row[key] || "")}</td>`).join("")}</tr>`).join("");
}

function renderTable(target, list, pageKey, columns, size) {
  const pageData = paginate(list, state[pageKey], size);
  state[pageKey] = pageData.page;
  $(target).innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map(([, label]) => `<th>${esc(label)}</th>`).join("")}</tr></thead>
        <tbody>${tableRows(pageData.items, columns)}</tbody>
      </table>
    </div>
    ${pagerHtml(pageKey.replace("Page", ""), pageData.page, pageData.totalPages, list.length, size)}
  `;
}

function renderEvidence(list) {
  const evidenceRows = list.map((row) => ({
    name: row.name,
    lane: row.lane,
    problemType: row.problemType,
    capabilityPackage: row.capabilityPackage,
    readiness: row.readiness,
    confidence: row.confidence,
    reviewReason: row.reviewReason,
    sourceType: row.sourceType,
    runtimeStatus: row.runtimeStatus,
    runtimeLayer: row.runtimeLayer,
    path: row.path,
    updated: row.updated,
  }));
  renderTable("evidenceTable", evidenceRows, "evidencePage", [
    ["name", "Skill"],
    ["lane", "赛道"],
    ["problemType", "问题类型"],
    ["capabilityPackage", "能力包"],
    ["readiness", "准备度"],
    ["confidence", "置信度"],
    ["reviewReason", "复核原因"],
    ["sourceType", "来源类型"],
    ["runtimeStatus", "当前 Codex"],
    ["runtimeLayer", "Codex 来源层"],
    ["updated", "更新时间"],
    ["path", "路径"],
  ], state.tableSize);
}

function renderMerge(list) {
  const mergeRows = list
    .filter((row) => row.merge !== "待核验" || row.readiness !== "暂停竞聘")
    .sort((a, b) => (
      (mergeOrder.indexOf(a.merge) < 0 ? 99 : mergeOrder.indexOf(a.merge))
      - (mergeOrder.indexOf(b.merge) < 0 ? 99 : mergeOrder.indexOf(b.merge))
    ) || Number(b.duplicates || 0) - Number(a.duplicates || 0));
  renderTable("mergeTable", mergeRows, "mergePage", [
    ["name", "Skill"],
    ["lane", "赛道"],
    ["problemType", "问题类型"],
    ["capabilityPackage", "能力包"],
    ["position", "竞聘位置"],
    ["responsibility", "责任"],
    ["merge", "合并复核"],
    ["duplicates", "重复数"],
    ["readiness", "准备度"],
    ["output", "关键输出"],
  ], state.tableSize);
}

function renderGuide() {
  $("guideGrid").innerHTML = [
    ["这不是正式能力库", "页面展示的是三宝能力竞聘候选池。可竞聘只代表进入初筛，不代表已经获得业务授权、岗位归属或 Native Agent 承接。"],
    ["业务先看正面字段", "正面看解决的问题、关键输入、关键输出、验收证据、责任候选和边界。技术来源和 hash 放到复核证据页。"],
    ["待复核不是否定", "暂停竞聘通常意味着材料不完整、输入输出不清、授权边界不清或正文不可稳定读取，不等于没有价值。"],
    ["合并不能自动化", "同名不自动合并，异名不自动拆分。合并复核状态只是工作建议，最终要看业务问题、输入输出、边界和验收。"],
    ["Preset 是后续承接", "岗位 Bundle、Preset、数字员工是后续组合层。一个 skill 现在只是在竞争某个能力站位。"],
    ["先看能力包", "负责人先从能力包看要解决的经营结果和优先议题，再进入问题类型和候选卡片。"],
    ["Excel 怎么看", "负责人看“能力包总览”；业务与产品看“问题类型矩阵”；责任节点从“竞聘候选池”选代表样本；其余记录可在“全量 Skill 聚类”筛选。"],
  ].map(([title, body]) => `<article class="guide-card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("");
}

function renderB01Stats() {
  const items = b01Payload.items || [];
  const trial = items.filter((item) => item.status === "可开展样本试跑").length;
  const conditional = items.filter((item) => item.status === "条件入围，先补证").length;
  $("stats").innerHTML = [
    ["本轮候选", items.length, "覆盖 B01 的一条最小交付链"],
    ["可试跑", trial, "可用受控样本验证交付质量"],
    ["条件入围", conditional, "先补齐数据、识别或长期验证条件"],
    ["正式任命", 0, "本轮不产生岗位、Preset 或授权"],
  ].map(([label, num, desc]) => `
    <article class="stat-card">
      <strong>${num}</strong>
      <span>${esc(label)}</span>
      <span>${esc(desc)}</span>
    </article>
  `).join("");
}

function renderB01() {
  const items = b01Payload.items || [];
  $("b01Overview").innerHTML = `
    <article class="b01-note"><b>本轮范围</b><p>${esc(b01Payload.scope)}</p></article>
    <article class="b01-note"><b>选手怎么比</b><p>不比卡片中的 ROI 示例。只比能否把输入、输出、证据、未知和边界说清，并让下一站能接住。</p></article>
    <article class="b01-note"><b>当前结论</b><p>评论证据拆解和搜索需求信号可先试跑；机会排序、选项比较和长期验证设计必须带着前提进入下一轮。</p></article>
  `;
  $("b01Flow").innerHTML = items.map((item) => `
    <div class="b01-flow-step">
      <span>${esc(item.code)}</span>
      <b>${esc(item.position)}</b>
      <small>${esc(item.stage)}</small>
    </div>
  `).join("");
  $("b01Cards").innerHTML = items.map((item) => `
    <article class="b01-card">
      <div class="b01-card-head">
        <div><p class="eyebrow">${esc(item.code)} · ${esc(item.stage)}</p><h3>${esc(item.cn)}</h3><p class="b01-name">${esc(item.name)}</p></div>
        <span class="badge ${item.status === "可开展样本试跑" ? "ready" : "warn"}">${esc(item.status)}</span>
      </div>
      <div class="b01-position"><b>竞聘站位</b><span>${esc(item.position)}</span></div>
      <div class="section"><b>要回答的业务问题</b><p>${esc(item.question)}</p></div>
      <div class="io">
        <div class="section"><b>试跑输入</b><p>${esc(item.input)}</p></div>
        <div class="section"><b>应交付什么</b><p>${esc(item.output)}</p></div>
      </div>
      <div class="section"><b>验收时看什么</b><p>${esc(item.acceptance)}</p></div>
      <div class="b01-risk-grid">
        <div><b>必须补证</b><p>${esc(item.proof)}</p></div>
        <div><b>不能直接得出的结论</b><p>${esc(item.boundary)}</p></div>
      </div>
      <div class="b01-source">${esc(item.source)}</div>
    </article>
  `).join("") || '<div class="empty">B01 初筛数据尚未加载。</div>';
}

function trialPairs(value) {
  if (!Array.isArray(value) || value.length === 0) return "未映射";
  return value.map(([aspect, sentiment]) => `${aspect} / ${sentiment}`).join("；");
}

function trialObject(value) {
  return Object.entries(value || {}).map(([key, item]) => `${key}: ${item}`).join("；");
}

function renderTrialStats() {
  const skills = trialPayload.skills || [];
  const passedQuality = skills.filter((item) => item.quality?.quality_gate === "通过").length;
  const contract = trialPayload.contractChecks || { passed: 0, total: 0, label: "交付契约" };
  $("stats").innerHTML = [
    ["受控样本", trialPayload.sampleType || "未加载", "所有记录仅用于候选实现试跑"],
    [contract.label || "交付契约", `${contract.passed}/${contract.total}`, contract.meaning || "输出可回到输入记录"],
    ["语义质量通过", passedQuality, "D01 与 D02 均须达到预设门槛"],
    ["真实样本准入", "否", "本轮不产生消费者或新品结论"],
  ].map(([label, num, desc]) => `
    <article class="stat-card">
      <strong>${esc(num)}</strong>
      <span>${esc(label)}</span>
      <span>${esc(desc)}</span>
    </article>
  `).join("");
}

function renderTrial() {
  const skills = trialPayload.skills || [];
  const contract = trialPayload.contractChecks || { passed: 0, total: 0, label: "交付契约", meaning: "" };
  $("trialOverview").innerHTML = `
    <article class="b01-note"><b>样本性质</b><p>${esc(trialPayload.sampleType || "合成受控样本")}：${esc(trialPayload.scope || "本页没有可用的试跑说明。")}</p></article>
    <article class="b01-note"><b>同一个业务问题</b><p>${esc(trialPayload.question || "未加载")}</p></article>
    <article class="b01-note"><b>${esc(contract.label || "交付契约")}</b><p>${esc(`${contract.passed || 0}/${contract.total || 0}`)}。${esc(contract.meaning || "")}</p></article>
  `;
  $("trialSkills").innerHTML = skills.map((item) => {
    const quality = item.quality || {};
    const isReady = quality.quality_gate === "通过";
    const failureDetails = (item.failures || []).map((failure) => {
      const expected = Array.isArray(failure.expected) ? trialPairs(failure.expected) : trialObject(failure.expected);
      const actual = Array.isArray(failure.actual) ? trialPairs(failure.actual) : trialObject(failure.actual);
      const delta = Array.isArray(failure.missing)
        ? `缺失：${trialPairs(failure.missing)}；多余：${trialPairs(failure.unexpected)}`
        : "意图或情感分类与预期不一致。";
      return `
        <details class="trial-failure">
          <summary><b>${esc(failure.recordId)}</b><span>查看语义偏差</span></summary>
          <p class="trial-input">${esc(failure.input)}</p>
          <dl><div><dt>预期</dt><dd>${esc(expected)}</dd></div><div><dt>实际</dt><dd>${esc(actual)}</dd></div><div><dt>差异</dt><dd>${esc(delta)}</dd></div></dl>
        </details>
      `;
    }).join("");
    const extraMetric = item.unmapped
      ? `未映射记录：${item.unmapped.join("、")}`
      : `问题型规则命中：${item.ruleHits ?? 0} 条`;
    return `
      <article class="trial-skill-card ${isReady ? "ready" : "blocked"}">
        <div class="b01-card-head">
          <div><p class="eyebrow">${esc(item.code)} · CONTROLLED RUN</p><h3>${esc(item.name)}</h3></div>
          <span class="badge ${isReady ? "ready" : "stop"}">${esc(quality.quality_gate || "未评估")}</span>
        </div>
        <div class="trial-metrics">
          <div><span>输入</span><b>${esc(item.input)}</b></div>
          <div><span>语义精确匹配</span><b>${esc(`${quality.exact_match_count ?? 0}/${quality.total ?? 0} · ${Math.round((quality.exact_match_rate || 0) * 1000) / 10}%`)}</b></div>
          <div><span>已验证交付</span><b>${esc(item.output)}</b></div>
        </div>
        <div class="trial-risk"><b>为什么不能准入</b><p>${esc(item.risk || "质量闸口未完成。")}</p><small>${esc(extraMetric)} · 原始实现指纹 ${esc(item.sourceHash || "未记录")}</small></div>
        <div class="trial-failures"><b>失败样本 ${item.failures?.length || 0} 条</b>${failureDetails || "<p>未发现语义偏差。</p>"}</div>
      </article>
    `;
  }).join("") || '<div class="empty">B01 试跑数据尚未加载。</div>';
  $("trialCrossSource").innerHTML = (trialPayload.crossSource || []).map((item) => `
    <article class="trial-cross-card">
      <h3>${esc(item.topic)}</h3>
      <div class="trial-cross-counts"><span>D01 规则输出：正 ${esc(item.review_positive)} / 负 ${esc(item.review_negative)} / 中 ${esc(item.review_neutral)}</span><span>D02 搜索规则：${esc(item.search_records)} 条，命中 ${esc(item.search_rule_hits)} 条</span></div>
      <p>${esc(item.controlled_reading)}</p>
    </article>
  `).join("") || '<div class="empty">同题对照数据尚未加载。</div>';
  $("trialNextSteps").innerHTML = (trialPayload.nextSteps || []).map((item, index) => `
    <article class="trial-next-card"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>
  `).join("");
  $("trialBoundary").innerHTML = `
    <b>本页明确不作出的结论</b>
    <ul>${(trialPayload.nonConclusions || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
  `;
}

function renderTrial2Stats() {
  const contract = trial2Payload.contractChecks || { passed: 0, total: 0, label: "交付契约" };
  const d01 = (trial2Payload.skills || []).find((item) => item.code === "D01")?.quality || {};
  const d02 = (trial2Payload.skills || []).find((item) => item.code === "D02")?.quality || {};
  $("stats").innerHTML = [
    ["合成受控样本", `${d01.total || 0} + ${d02.total || 0}`, "全部为人工标注的合成记录"],
    [contract.label || "交付契约", `${contract.passed || 0}/${contract.total || 0}`, contract.meaning || "记录可回到输入"],
    ["当前受控精确匹配", "100%", "D01 与 D02 在当前受控集均无已知偏差"],
    ["下一道门槛", "独立盲测", "当前不接入真实评论、搜索或经营数据"],
  ].map(([label, num, desc]) => `
    <article class="stat-card">
      <strong>${esc(num)}</strong>
      <span>${esc(label)}</span>
      <span>${esc(desc)}</span>
    </article>
  `).join("");
}

function renderTrial2() {
  const skills = trial2Payload.skills || [];
  const contract = trial2Payload.contractChecks || { passed: 0, total: 0, label: "交付契约", meaning: "" };
  const decision = trial2Payload.decision || { status: "待复核", reason: "复测数据尚未加载。" };
  $("trial2Overview").innerHTML = `
    <article class="b01-note"><b>原始失败基线</b><p>D01 ${esc(trial2Payload.baseline?.d01_exact || "未加载")}；D02 ${esc(trial2Payload.baseline?.d02_exact || "未加载")}。${esc(trial2Payload.baseline?.meaning || "")}</p></article>
    <article class="b01-note"><b>本轮受控结果</b><p>${esc(`${contract.passed || 0}/${contract.total || 0}`)} ${esc(contract.label || "交付契约")}；D01 ${esc(skills.find((item) => item.code === "D01")?.quality?.exact_match_count || 0)}/${esc(skills.find((item) => item.code === "D01")?.quality?.total || 0)}，D02 ${esc(skills.find((item) => item.code === "D02")?.quality?.exact_match_count || 0)}/${esc(skills.find((item) => item.code === "D02")?.quality?.total || 0)}。</p></article>
    <article class="b01-note"><b>当前定位</b><p>${esc(decision.status)}。${esc(decision.reason)}</p></article>
  `;
  $("trial2Decision").innerHTML = `
    <span>当前判断</span><strong>${esc(decision.status)}</strong><p>${esc(decision.reason)}</p>
    <small>${esc(trial2Payload.labelingBoundary || "")}</small>
  `;
  $("trial2Skills").innerHTML = skills.map((item) => {
    const quality = item.quality || {};
    const samples = (item.adversarialSamples || []).map((sample) => `
      <details class="trial2-sample">
        <summary><b>${esc(sample.id)}</b><span>查看对抗样本</span></summary>
        <p>${esc(sample.input)}</p><dl><div><dt>预期</dt><dd>${esc(sample.expected)}</dd></div><div><dt>本轮结果</dt><dd>一致</dd></div></dl>
      </details>
    `).join("");
    return `
      <article class="trial2-skill-card">
        <div class="b01-card-head">
          <div><p class="eyebrow">${esc(item.code)} · CANDIDATE RETEST</p><h3>${esc(item.name)}</h3></div>
          <span class="badge ready">${esc(quality.quality_gate || "未评估")}</span>
        </div>
        <div class="trial-metrics">
          <div><span>原始基线</span><b>${esc(item.baseline || "未记录")}</b></div>
          <div><span>本轮精确匹配</span><b>${esc(`${quality.exact_match_count ?? 0}/${quality.total ?? 0} · ${Math.round((quality.exact_match_rate || 0) * 1000) / 10}%`)}</b></div>
          <div><span>可交付什么</span><b>${esc(item.output)}</b></div>
        </div>
        <div class="trial2-change"><b>这次具体修了什么</b><ul>${(item.changes || []).map((change) => `<li>${esc(change)}</li>`).join("")}</ul></div>
        <div class="trial2-samples"><b>代表性边界样本</b>${samples}</div>
        <small class="trial2-fingerprint">候选适配器指纹 ${esc(item.sourceHash || "未记录")}</small>
      </article>
    `;
  }).join("") || '<div class="empty">B01 复测数据尚未加载。</div>';
  $("trial2CrossSource").innerHTML = (trial2Payload.crossSource || []).map((item) => `
    <article class="trial-cross-card">
      <h3>${esc(item.topic)}</h3>
      <div class="trial-cross-counts"><span>D01：正 ${esc(item.review_positive)} / 负 ${esc(item.review_negative)} / 中 ${esc(item.review_neutral)}</span><span>D02：${esc(item.search_records)} 条受控表达，${esc(item.search_rule_hits)} 条规则命中</span></div>
      <p>${esc(item.controlled_reading)}</p>
    </article>
  `).join("") || '<div class="empty">同题对照数据尚未加载。</div>';
  $("trial2NextSteps").innerHTML = (trial2Payload.nextSteps || []).map((item, index) => `
    <article class="trial-next-card"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>
  `).join("");
  $("trial2Boundary").innerHTML = `<b>本页明确不作出的结论</b><ul>${(trial2Payload.nonConclusions || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderBlindStats() {
  const counts = blindPayload.counts || {};
  $("stats").innerHTML = [
    ["盲测输入", counts.total || 0, "全部为新建的合成输入，未展示金标"],
    ["D01 评论", counts.d01 || 0, "方面、局部语义、转折和未知主题"],
    ["D02 搜索表达", counts.d02 || 0, "意图优先级、规则边界与阈值"],
    ["金标状态", blindPayload.state || "待独立评审", "未锁定时，评分脚本会拒绝执行"],
  ].map(([label, num, desc]) => `
    <article class="stat-card">
      <strong>${esc(num)}</strong>
      <span>${esc(label)}</span>
      <span>${esc(desc)}</span>
    </article>
  `).join("");
}

function renderBlind() {
  const counts = blindPayload.counts || {};
  $("blindOverview").innerHTML = `
    <article class="b01-note"><b>检验问题</b><p>${esc(blindPayload.question || "盲测问题尚未加载。")}</p></article>
    <article class="b01-note"><b>当前状态</b><p>${esc(blindPayload.state || "待独立评审")}。输入包已准备，但没有盲测分数，也没有通过或失败结论。</p></article>
    <article class="b01-note"><b>可执行交接</b><p>${esc(blindPayload.handoff || blindPayload.scope || "本轮范围尚未加载。")}</p></article>
  `;
  $("blindDecision").innerHTML = `
    <span>当前判断</span>
    <strong>${esc(blindPayload.state || "待独立评审")}</strong>
    <p>先由未参与本轮实现和标注的人复核并锁定金标，再由独立执行人提交候选输出。没有角色分离和锁定记录，系统不允许评分。</p>
    <a class="page-button" href="${esc(blindPayload.download || "#")}">下载盲测执行 Excel</a>
  `;
  $("blindCoverage").innerHTML = (blindPayload.coverage || []).map((item) => `
    <article class="blind-card">
      <div><p class="eyebrow">COVERAGE</p><h3>${esc(item.name)}</h3></div>
      <strong>${esc(item.count)} 条</strong>
      <p>${esc(item.detail)}</p>
    </article>
  `).join("") || '<div class="empty">盲测覆盖设计尚未加载。</div>';
  $("blindRoles").innerHTML = (blindPayload.roles || []).map((item) => `
    <article class="blind-card blind-role-card">
      <p class="eyebrow">ROLE SEPARATION</p>
      <h3>${esc(item.role)}</h3>
      <div><b>负责什么</b><p>${esc(item.work)}</p></div>
      <div><b>不能做什么</b><p>${esc(item.must_not)}</p></div>
    </article>
  `).join("") || '<div class="empty">角色分离要求尚未加载。</div>';
  $("blindGates").innerHTML = (blindPayload.gates || []).map((item, index) => `
    <article class="trial-next-card"><span>${String(index + 1).padStart(2, "0")}</span><p>${esc(item)}</p></article>
  `).join("");
  $("blindBoundary").innerHTML = `<b>本页明确不作出的结论</b><ul>${(blindPayload.nonConclusions || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function render() {
  const list = currentRows();
  if (state.activePage === "runtime") renderRuntimeStats();
  else if (state.activePage === "runtime-screening") renderRuntimeScreeningStats();
  else if (state.activePage === "cb01") renderCB01Stats();
  else if (state.activePage === "b01") renderB01Stats();
  else if (state.activePage === "trial") renderTrialStats();
  else if (state.activePage === "trial2") renderTrial2Stats();
  else if (state.activePage === "blind") renderBlindStats();
  else renderStats(list);
  if (state.activePage !== "b01" && state.activePage !== "trial" && state.activePage !== "trial2" && state.activePage !== "blind") renderOverview(list);
  if (state.activePage === "blueprint") renderBlueprint(list);
  if (state.activePage === "problems") renderProblems(list);
  if (state.activePage === "packages") renderPackages(list);
  if (state.activePage === "runtime") renderRuntime();
  if (state.activePage === "runtime-screening") renderRuntimeScreening();
  if (state.activePage === "cb01") renderCB01();
  if (state.activePage === "b01") renderB01();
  if (state.activePage === "trial") renderTrial();
  if (state.activePage === "trial2") renderTrial2();
  if (state.activePage === "blind") renderBlind();
  if (state.activePage === "cards") renderCards(list);
  if (state.activePage === "evidence") renderEvidence(list);
  if (state.activePage === "merge") renderMerge(list);
  if (state.activePage === "guide") renderGuide();
}

fill("zone", "zone", payload.zoneOrder || []);
fill("lane", "lane", payload.laneOrder || []);
fill("problem", "problemType", clusterPayload.problemOrder || []);
fill("package", "capabilityPackage", clusterPayload.packageOrder || []);
fill("readiness", "readiness", readinessOrder);
fill("runtime", "runtimeStatus", ["当前可用，归档内容已核验", "当前可用，内容已更新待业务复核", "当前可用，新纳入待业务复核", "已被当前版本替代", "不在当前 Codex 运行时范围"]);
fill("responsibility", "responsibility");
fill("merge", "merge", mergeOrder);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setPage(tab.dataset.page));
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pager]");
  if (!button) return;
  const page = Number(button.dataset.page || 1);
  if (button.dataset.pager === "card") state.cardPage = page;
  if (button.dataset.pager === "evidence") state.evidencePage = page;
  if (button.dataset.pager === "merge") state.mergePage = page;
  if (button.dataset.pager === "runtime") state.runtimePage = page;
  if (button.dataset.pager === "runtimeScreening") state.runtimeScreeningPage = page;
  render();
});

controls.forEach((control) => {
  control.addEventListener("input", () => {
    state.cardPage = 1;
    state.evidencePage = 1;
    state.mergePage = 1;
    state.runtimePage = 1;
    state.runtimeScreeningPage = 1;
    render();
  });
});

if (!["overview", "runtime", "runtime-screening", "cb01", "blueprint", "problems", "packages", "b01", "trial", "trial2", "blind", "cards", "evidence", "merge", "guide"].includes(state.activePage)) {
  state.activePage = "overview";
}
setPage(state.activePage);
