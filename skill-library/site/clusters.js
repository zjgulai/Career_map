const payload = window.CLUSTER_DATA || { clusters: [], candidates: [] };
const clusters = payload.clusters || [];
const $ = (id) => document.getElementById(id);
const collator = new Intl.Collator("zh-CN");
const controls = ["q", "level", "preset", "value", "problem"].map($);

function unique(key) {
  return [...new Set(clusters.map((row) => row[key]).filter(Boolean))].sort(collator.compare);
}
function fill(id, key) {
  const select = $(id);
  unique(key).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function haystack(row) {
  return [
    row.cluster_id, row["业务价值类型"], row["问题类型"], row["主核心能力"],
    row["三宝Preset候选"], row["数字员工候选"], row["代表技能"], row["代表用途"],
    row["复核原因"]
  ].join(" ").toLowerCase();
}
function render() {
  const q = $("q").value.trim().toLowerCase();
  const level = $("level").value;
  const preset = $("preset").value;
  const value = $("value").value;
  const problem = $("problem").value;
  const rows = clusters
    .filter((row) => (!q || haystack(row).includes(q))
      && (!level || row["三宝候选层级"] === level)
      && (!preset || row["三宝Preset候选"] === preset)
      && (!value || row["业务价值类型"] === value)
      && (!problem || row["问题类型"] === problem))
    .sort((a, b) => b.skill_count - a.skill_count || collator.compare(a.cluster_id, b.cluster_id));
  $("count").textContent = `显示 ${rows.length} 个聚类 / 共 ${clusters.length} 个`;
  $("clusters").innerHTML = rows.map((row) => `
    <article class="cluster-row">
      <div>
        <h2>${escapeHtml(row["三宝Preset候选"])}｜${escapeHtml(row["问题类型"])}</h2>
        <p>${escapeHtml(row["聚类说明"])}</p>
      </div>
      <div class="metric"><strong>${escapeHtml(row.skill_count)}</strong>skills</div>
      <div class="metric"><strong>${escapeHtml(row.avg_confidence)}</strong>平均置信度</div>
      <div class="metric"><strong>${escapeHtml(row.needs_review_count)}</strong>需复核</div>
      <div class="metric"><strong>${escapeHtml(row["三宝候选层级"])}</strong>${escapeHtml(row["数字员工候选"])}</div>
      <div class="full meta">
        <span class="pill">${escapeHtml(row["业务价值类型"])}</span>
        <span class="pill">${escapeHtml(row["问题类型"])}</span>
        <span class="pill">${escapeHtml(row["主核心能力"])}</span>
        <span class="pill">${escapeHtml(row["三宝Preset候选"])}</span>
      </div>
      <p class="full"><strong>代表技能：</strong>${escapeHtml(row["代表技能"])}</p>
      <p class="full"><strong>复核：</strong>${escapeHtml(row["复核原因"])}</p>
    </article>
  `).join("") || '<div class="empty">没有匹配聚类。</div>';
}
fill("level", "三宝候选层级");
fill("preset", "三宝Preset候选");
fill("value", "业务价值类型");
fill("problem", "问题类型");
$("stats").textContent = `${clusters.length} 个聚类 · ${unique("三宝Preset候选").length} 个 Preset 候选`;
controls.forEach((control) => control.addEventListener("input", render));
render();
