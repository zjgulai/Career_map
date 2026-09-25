const payload = window.SANBAO_REVIEW_DATA || { details: [], summaries: [] };
const rows = payload.details || [];
const $ = (id) => document.getElementById(id);
const collator = new Intl.Collator("zh-CN");
const controls = ["q", "primary", "level", "responsibility", "status"].map($);
function unique(key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort(collator.compare);
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
    row["英文名称"], row["中文名称"], row["用途总结"], row.primary_cluster_key,
    row.primary_cluster_name_cn, row.sanbao_candidate_level, row.sanbao_responsibility_candidate,
    row.receiving_object, row.review_reason, row.next_action, row.relative_path
  ].join(" ").toLowerCase();
}
function summaryCounts(filtered) {
  const count = (key, value) => filtered.filter((row) => row[key] === value).length;
  return `
    <div class="summary-band">
      <div class="summary-box"><strong>${filtered.length}</strong>当前结果</div>
      <div class="summary-box"><strong>${count("primary_cluster_key", "REVIEW_ONLY")}</strong>待复核</div>
      <div class="summary-box"><strong>${count("candidate_status", "draft")}</strong>草案候选</div>
      <div class="summary-box"><strong>${count("candidate_status", "review")}</strong>复核状态</div>
      <div class="summary-box"><strong>${count("candidate_status", "rejected")}</strong>范围外</div>
    </div>
  `;
}
function render() {
  const q = $("q").value.trim().toLowerCase();
  const primary = $("primary").value;
  const level = $("level").value;
  const responsibility = $("responsibility").value;
  const status = $("status").value;
  const filtered = rows
    .filter((row) => (!q || haystack(row).includes(q))
      && (!primary || row.primary_cluster_key === primary)
      && (!level || row.sanbao_candidate_level === level)
      && (!responsibility || row.sanbao_responsibility_candidate === responsibility)
      && (!status || row.candidate_status === status))
    .sort((a, b) => (b.summary_confidence || 0) - (a.summary_confidence || 0)
      || collator.compare(a["英文名称"], b["英文名称"]));
  $("count").textContent = `显示 ${Math.min(filtered.length, 250)} 条 / 匹配 ${filtered.length} 条 / 总 ${rows.length} 条`;
  $("results").innerHTML = summaryCounts(filtered) + filtered.slice(0, 250).map((row) => `
    <article class="review-card">
      <div>
        <h2>${escapeHtml(row["英文名称"])}</h2>
        <p>${escapeHtml(row["用途总结"])}</p>
      </div>
      <div class="meta">
        <span class="pill">${escapeHtml(row.primary_cluster_name_cn)}</span>
        <span class="pill">${escapeHtml(row.sanbao_candidate_level)}</span>
        <span class="pill">${escapeHtml(row.sanbao_responsibility_candidate)}</span>
        <span class="pill">${escapeHtml(row.receiving_object)}</span>
        <span class="pill">${escapeHtml(row.candidate_status)}</span>
      </div>
      <p><strong>复核原因：</strong>${escapeHtml(row.review_reason)}</p>
      <p><strong>下一步：</strong>${escapeHtml(row.next_action)}</p>
      <p><strong>路径：</strong>${escapeHtml(row.relative_path)}</p>
    </article>
  `).join("") || '<div class="empty">没有匹配结果。</div>';
}
fill("primary", "primary_cluster_key");
fill("level", "sanbao_candidate_level");
fill("responsibility", "sanbao_responsibility_candidate");
fill("status", "candidate_status");
$("stats").textContent = `${rows.length} 条 skill · ${unique("primary_cluster_key").length} 个主聚类`;
controls.forEach((control) => control.addEventListener("input", render));
render();
