const data = window.SKILL_DATA || [];
const $ = (id) => document.getElementById(id);
const controls = ["q", "sourceFilter", "scenarioFilter", "scopeFilter", "reviewFilter"].map($);
const collator = new Intl.Collator("zh-CN");

function uniqueValues(key) {
  return [...new Set(data.map((item) => item[key]).filter(Boolean))].sort(collator.compare);
}

function fillSelect(id, key) {
  const select = $(id);
  uniqueValues(key).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function textOf(item) {
  return [
    item["英文名称"],
    item["中文名称"],
    item["一句话作用"],
    item["用途总结"],
    item["业务场景"],
    item["解决具体问题"],
    item["核心能力"],
    item["问题类型"],
    item["业务价值"],
    item["业务价值类型"],
    item["适用对象"],
    item.source_type,
    item.relative_path,
  ].join(" ").toLowerCase();
}

function score(item, q) {
  if (!q) return Math.round((item.summary_confidence || 0) * 100);
  const name = `${item["英文名称"]} ${item["中文名称"]}`.toLowerCase();
  if (name.includes(q)) return 500 + Math.round((item.summary_confidence || 0) * 100);
  if ((item["问题类型"] || "").toLowerCase().includes(q)) return 420;
  if ((item["业务价值类型"] || "").toLowerCase().includes(q)) return 390;
  if ((item["业务场景"] || "").toLowerCase().includes(q)) return 360;
  if ((item["核心能力"] || "").toLowerCase().includes(q)) return 310;
  if ((item["解决具体问题"] || "").toLowerCase().includes(q)) return 240;
  if (textOf(item).includes(q)) return 120;
  return 0;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function render() {
  const q = $("q").value.trim().toLowerCase();
  const source = $("sourceFilter").value;
  const scenario = $("scenarioFilter").value;
  const scope = $("scopeFilter").value;
  const review = $("reviewFilter").value;
  const rows = data
    .map((item) => ({ item, score: score(item, q) }))
    .filter(({ item, score }) => (!q || score > 0)
      && (!source || item.source_type === source)
      && (!scenario || item["业务场景"] === scenario)
      && (!scope || item.scan_scope === scope)
      && (!review || (review === "review" ? item.needs_review : !item.needs_review)))
    .sort((a, b) => b.score - a.score || collator.compare(a.item["英文名称"], b.item["英文名称"]))
    .slice(0, 300);

  $("count").textContent = `显示 ${rows.length} 条 / 共 ${data.length} 条；为保证速度最多显示前 300 条`;
  const root = $("results");
  if (!rows.length) {
    root.innerHTML = '<div class="empty">没有匹配结果。换个关键词或放宽筛选。</div>';
    return;
  }
  root.innerHTML = rows.map(({ item }) => `
    <article class="card">
      <div>
        <h2>${escapeHtml(item["英文名称"])}</h2>
        <div class="zh">${escapeHtml(item["中文名称"])}</div>
      </div>
      <p class="desc">${escapeHtml(item["用途总结"] || item["一句话作用"])}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(item["业务场景"])}</span>
        <span class="pill">${escapeHtml(item["问题类型"] || "待归类")}</span>
        <span class="pill">${escapeHtml(item["业务价值类型"] || "待评估")}</span>
        <span class="pill">${escapeHtml(item.source_type)}</span>
        <span class="pill">${escapeHtml(item.entry_type)}</span>
        <span class="pill">${escapeHtml(item.scan_scope)}</span>
        <span class="pill ${item.needs_review ? "warn" : ""}">置信度 ${escapeHtml(item.summary_confidence ?? "")}</span>
      </div>
      <details>
        <summary>查看用途、输入输出与边界</summary>
        <dl>
          <dt>关键输入</dt><dd>${escapeHtml(item["关键输入"])}</dd>
          <dt>关键输出</dt><dd>${escapeHtml(item["关键输出"])}</dd>
          <dt>解决具体问题</dt><dd>${escapeHtml(item["解决具体问题"])}</dd>
          <dt>核心能力</dt><dd>${escapeHtml(item["核心能力"])}</dd>
          <dt>业务价值</dt><dd>${escapeHtml(item["业务价值"])}</dd>
          <dt>适用对象</dt><dd>${escapeHtml(item["适用对象"])}</dd>
          <dt>触发条件</dt><dd>${escapeHtml(item["触发条件"])}</dd>
          <dt>关键约束</dt><dd>${escapeHtml(item["关键约束"])}</dd>
          <dt>证据摘要</dt><dd>${escapeHtml(item["证据摘要"])}</dd>
          <dt>文本质量</dt><dd>${escapeHtml(item.text_quality)}</dd>
          <dt>更新时间</dt><dd>${escapeHtml(item["最新更新时间"])}</dd>
          <dt>路径</dt><dd>${escapeHtml(item.relative_path)}</dd>
          <dt>归档</dt><dd><a href="${encodeURI(item.archive_path)}">打开归档文件</a></dd>
        </dl>
      </details>
    </article>
  `).join("");
}

fillSelect("sourceFilter", "source_type");
fillSelect("scenarioFilter", "业务场景");
fillSelect("scopeFilter", "scan_scope");
$("stats").textContent = `${data.length} 个 skill · ${uniqueValues("问题类型").length} 类问题 · ${uniqueValues("业务价值类型").length} 类价值`;
controls.forEach((control) => control.addEventListener("input", render));
render();
