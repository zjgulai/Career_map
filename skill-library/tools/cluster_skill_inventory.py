#!/usr/bin/env python3
"""Create a MECE clustering layer on top of the enriched skill inventory."""

from __future__ import annotations

from collections import Counter, defaultdict
import csv
import datetime as dt
import html
import json
from pathlib import Path
import re
import textwrap
import zipfile

import build_skill_library as base


ROOT = Path("/Users/lute/project/Career/skill-library")
INPUT_JSON = ROOT / "skill_inventory_enriched.json"
CLUSTER_JSON = ROOT / "skill_clusters.json"
CLUSTER_CSV = ROOT / "skill_clusters.csv"
CANDIDATE_JSON = ROOT / "sanbao_capability_candidates.json"
CANDIDATE_CSV = ROOT / "sanbao_capability_candidates.csv"
CLUSTER_XLSX = ROOT / "skill_cluster_matrix.xlsx"
REPORT = ROOT / "CLUSTER_REPORT.md"
SITE_CLUSTER_DATA = ROOT / "site" / "cluster-data.js"
SITE_CLUSTER_PAGE = ROOT / "site" / "clusters.html"
SITE_CLUSTER_APP = ROOT / "site" / "clusters.js"
SITE_CLUSTER_CSS = ROOT / "site" / "clusters.css"


VALUE_ORDER = [
    "增长与收入",
    "体验与满意度",
    "供给与履约",
    "内容与品牌",
    "风险与合规",
    "成本与效率",
    "知识与研发资产",
    "其他/待评估",
]

PROBLEM_ORDER = [
    "诊断归因",
    "预测预警",
    "优化决策",
    "生成制作",
    "检索组织",
    "评估验证",
    "治理合规",
    "数据质量",
    "集成部署",
    "自动化执行",
    "学习参考",
    "其他/待人工归类",
]

CORE_ORDER = [
    "DiD/因果推断",
    "NLP/情感分析",
    "预测建模",
    "优化/运筹",
    "RAG/知识检索",
    "知识图谱/本体建模",
    "视觉/多模态",
    "实验/评估",
    "合规/规则扫描",
    "工程模式/自动化",
    "按技能原文流程执行",
]

PRESET_RULES = [
    ("VOC 洞察与归因 Preset", ["体验与满意度"], ["诊断归因", "预测预警", "检索组织", "评估验证"], ["VOC", "评论", "sentiment", "review"]),
    ("Shopify AI/BI 运营 Preset", ["增长与收入", "体验与满意度", "内容与品牌"], ["优化决策", "预测预警", "评估验证"], ["checkout", "pricing", "seo", "shopify", "conversion"]),
    ("供给履约与库存 Preset", ["供给与履约"], ["预测预警", "优化决策", "诊断归因"], ["inventory", "supply", "supplier", "warehouse", "logistics"]),
    ("合规治理 Preset", ["风险与合规"], ["治理合规", "数据质量", "评估验证"], ["privacy", "security", "compliance", "risk", "policy"]),
    ("知识资产与RAG Preset", ["知识与研发资产"], ["检索组织", "学习参考", "数据质量"], ["rag", "knowledge", "graph", "document", "paper"]),
    ("内容品牌生产 Preset", ["内容与品牌"], ["生成制作", "优化决策", "评估验证"], ["brand", "content", "creative", "video", "image"]),
    ("平台工程与自动化 Preset", ["成本与效率", "知识与研发资产"], ["集成部署", "自动化执行", "数据质量"], ["api", "deploy", "workflow", "runtime", "backend"]),
]


def clean(value: object, max_len: int = 320) -> str:
    return base.clean_inline(value, max_len=max_len)


def primary_core(row: dict) -> str:
    raw = row.get("核心能力") or ""
    parts = [part.strip() for part in re.split(r"[；;]", raw) if part.strip()]
    if not parts:
        return "按技能原文流程执行"
    for preferred in CORE_ORDER:
        if preferred in parts:
            return preferred
    return parts[0]


def slug(value: str) -> str:
    text = re.sub(r"[^A-Za-z0-9\u4e00-\u9fff]+", "-", value).strip("-")
    return text[:90] or "cluster"


def cluster_id(value_type: str, problem_type: str, core: str) -> str:
    seed = f"{value_type}|{problem_type}|{core}"
    return f"C-{base.hashlib.sha1(seed.encode()).hexdigest()[:8]}-{slug(problem_type)}"


def sort_key(row: dict) -> tuple:
    return (
        VALUE_ORDER.index(row["业务价值类型"]) if row["业务价值类型"] in VALUE_ORDER else len(VALUE_ORDER),
        PROBLEM_ORDER.index(row["问题类型"]) if row["问题类型"] in PROBLEM_ORDER else len(PROBLEM_ORDER),
        CORE_ORDER.index(row["主核心能力"]) if row["主核心能力"] in CORE_ORDER else len(CORE_ORDER),
        -row["skill_count"],
    )


def representative_skills(rows: list[dict], n: int = 8) -> list[dict]:
    ranked = sorted(
        rows,
        key=lambda r: (
            0 if r.get("text_quality") == "text" else 1,
            0 if not r.get("needs_review") else 1,
            -float(r.get("summary_confidence") or 0),
            r.get("英文名称", "").lower(),
        ),
    )
    return ranked[:n]


def infer_preset(row: dict, examples: list[dict]) -> str:
    haystack = " ".join(
        [
            row["业务价值类型"],
            row["问题类型"],
            row["主核心能力"],
            " ".join(ex.get("英文名称", "") for ex in examples),
            " ".join(ex.get("用途总结", "") for ex in examples[:3]),
        ]
    ).lower()
    for preset, values, problems, keywords in PRESET_RULES:
        if row["业务价值类型"] in values and row["问题类型"] in problems:
            if not keywords or any(k.lower() in haystack for k in keywords):
                return preset
    if row["业务价值类型"] == "其他/待评估" or row["问题类型"] == "其他/待人工归类":
        return "待人工判断"
    return f"{row['业务价值类型']} × {row['问题类型']} Preset 候选"


def capability_level(cluster: dict) -> str:
    if cluster["review_ratio"] > 0.55 or cluster["text_quality_risk_count"] > 0:
        return "待复核资产池"
    if cluster["skill_count"] == 1:
        return "原子技能候选"
    if cluster["skill_count"] <= 5 and cluster["主核心能力"] != "按技能原文流程执行":
        return "原子技能组候选"
    if cluster["skill_count"] <= 35:
        return "场景工作流候选"
    return "Preset/数字员工能力池候选"


def digital_employee(cluster: dict) -> str:
    preset = cluster["三宝Preset候选"]
    mapping = {
        "VOC 洞察与归因 Preset": "VOC 洞察分析员",
        "Shopify AI/BI 运营 Preset": "Shopify 运营分析员",
        "供给履约与库存 Preset": "供给履约协同员",
        "合规治理 Preset": "合规与风险审查员",
        "知识资产与RAG Preset": "经营知识管理员",
        "内容品牌生产 Preset": "内容与品牌策划员",
        "平台工程与自动化 Preset": "平台工程助手",
    }
    return mapping.get(preset, "待人工命名")


def aggregate(rows: list[dict]) -> list[dict]:
    buckets: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for row in rows:
        value = row.get("业务价值类型") or "其他/待评估"
        problem = row.get("问题类型") or "其他/待人工归类"
        core = primary_core(row)
        buckets[(value, problem, core)].append(row)

    clusters: list[dict] = []
    for (value, problem, core), items in buckets.items():
        reps = representative_skills(items)
        text_risk = sum(1 for r in items if r.get("text_quality") != "text")
        review = sum(1 for r in items if r.get("needs_review"))
        confidence_values = [float(r.get("summary_confidence") or 0) for r in items]
        source_counts = Counter(r.get("source_type", "") for r in items)
        scenario_counts = Counter(r.get("业务场景", "") for r in items)
        cluster = {
            "cluster_id": cluster_id(value, problem, core),
            "业务价值类型": value,
            "问题类型": problem,
            "主核心能力": core,
            "skill_count": len(items),
            "high_confidence_count": sum(1 for r in items if float(r.get("summary_confidence") or 0) >= 0.8),
            "needs_review_count": review,
            "review_ratio": round(review / len(items), 3),
            "text_quality_risk_count": text_risk,
            "avg_confidence": round(sum(confidence_values) / len(confidence_values), 3) if confidence_values else 0,
            "top_sources": "；".join(f"{k}:{v}" for k, v in source_counts.most_common(4) if k),
            "top_scenarios": "；".join(f"{k}:{v}" for k, v in scenario_counts.most_common(5) if k),
            "代表技能": "；".join(r.get("英文名称", "") for r in reps),
            "代表用途": clean("；".join(r.get("用途总结", "") for r in reps[:3]), 520),
            "聚类说明": clean(f"围绕{value}中的{problem}问题，主要使用{core}能力处理。", 220),
        }
        cluster["三宝Preset候选"] = infer_preset(cluster, reps)
        cluster["三宝候选层级"] = capability_level(cluster)
        cluster["数字员工候选"] = digital_employee(cluster)
        cluster["复核原因"] = review_reason(cluster)
        cluster["sample_skill_ids"] = [r.get("skill_id") for r in reps]
        clusters.append(cluster)

    return sorted(clusters, key=sort_key)


def review_reason(cluster: dict) -> str:
    reasons = []
    if cluster["text_quality_risk_count"]:
        reasons.append(f"{cluster['text_quality_risk_count']} 条源文件不可稳定读取")
    if cluster["review_ratio"] > 0.55:
        reasons.append("超过半数记录需要字段复核")
    if cluster["业务价值类型"] == "其他/待评估":
        reasons.append("业务价值未明确")
    if cluster["问题类型"] == "其他/待人工归类":
        reasons.append("问题类型未明确")
    if cluster["主核心能力"] == "按技能原文流程执行":
        reasons.append("核心能力未结构化")
    return "；".join(reasons) or "可进入下一轮业务聚类评审"


def build_candidates(clusters: list[dict]) -> list[dict]:
    candidates = []
    for c in clusters:
        if c["三宝候选层级"] == "待复核资产池":
            priority = "P3-先补证"
        elif c["skill_count"] >= 25 and c["avg_confidence"] >= 0.8:
            priority = "P1-优先工作流/Preset"
        elif c["avg_confidence"] >= 0.75 and c["needs_review_count"] <= max(3, c["skill_count"] // 3):
            priority = "P2-可评审"
        else:
            priority = "P3-先补字段"
        candidates.append(
            {
                "candidate_id": c["cluster_id"].replace("C-", "SANBAO-"),
                "候选名称": f"{c['三宝Preset候选']}｜{c['问题类型']}｜{c['主核心能力']}",
                "候选层级": c["三宝候选层级"],
                "数字员工候选": c["数字员工候选"],
                "三宝Preset候选": c["三宝Preset候选"],
                "业务价值类型": c["业务价值类型"],
                "问题类型": c["问题类型"],
                "主核心能力": c["主核心能力"],
                "包含skill数": c["skill_count"],
                "平均置信度": c["avg_confidence"],
                "优先级": priority,
                "代表技能": c["代表技能"],
                "建议下一步": next_step(c, priority),
                "复核原因": c["复核原因"],
            }
        )
    return candidates


def next_step(cluster: dict, priority: str) -> str:
    if priority.startswith("P1"):
        return "进入业务价值与场景边界评审：确认输入、输出、责任人、验收证据和上下游关系。"
    if "补证" in priority or cluster["三宝候选层级"] == "待复核资产池":
        return "先处理不可读源文件、缺失输入输出和业务价值不明项，再决定是否纳入三宝能力图谱。"
    return "抽查代表技能，合并同义项，确认是否作为原子技能组或场景工作流候选。"


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in columns})


def cell(value: object, row: int, col: int) -> str:
    ref = f"{base.excel_col_name(col)}{row}"
    text = html.escape(str(value or ""), quote=False)
    return f'<c r="{ref}" t="inlineStr"><is><t xml:space="preserve">{text}</t></is></c>'


def sheet_xml(rows: list[list[object]], widths: list[int]) -> str:
    body = []
    for r_idx, values in enumerate(rows, start=1):
        body.append(f'<row r="{r_idx}">' + "".join(cell(value, r_idx, c_idx) for c_idx, value in enumerate(values, start=1)) + "</row>")
    cols = "".join(f'<col min="{i}" max="{i}" width="{width}" customWidth="1"/>' for i, width in enumerate(widths, start=1))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<cols>{cols}</cols><sheetData>{''.join(body)}</sheetData>"
        f'<autoFilter ref="A1:{base.excel_col_name(len(widths))}{max(1, len(rows))}"/>'
        "</worksheet>"
    )


def write_xlsx(clusters: list[dict], candidates: list[dict], cluster_cols: list[str], candidate_cols: list[str]) -> None:
    summary_rows = [
        ["项目", "值"],
        ["生成时间", dt.datetime.now().astimezone().isoformat(timespec="seconds")],
        ["聚类数", len(clusters)],
        ["候选数", len(candidates)],
        ["MECE主键", "业务价值类型 × 问题类型 × 主核心能力；每个 skill 只进入一个主聚类"],
    ]
    for key, value in Counter(c["三宝候选层级"] for c in clusters).most_common():
        summary_rows.append([f"层级:{key}", value])
    for key, value in Counter(c["三宝Preset候选"] for c in clusters).most_common():
        summary_rows.append([f"Preset:{key}", value])

    cluster_rows = [cluster_cols] + [[row.get(col, "") for col in cluster_cols] for row in clusters]
    candidate_rows = [candidate_cols] + [[row.get(col, "") for col in candidate_cols] for row in candidates]

    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""
    workbook = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="MECE聚类矩阵" sheetId="1" r:id="rId1"/>
<sheet name="三宝候选" sheetId="2" r:id="rId2"/>
<sheet name="聚类说明" sheetId="3" r:id="rId3"/>
</sheets></workbook>"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>"""
    now = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Skill Cluster Matrix</dc:title><dc:creator>Codex</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified></cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>"""
    with zipfile.ZipFile(CLUSTER_XLSX, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml(cluster_rows, [18, 18, 18, 24, 12, 16, 16, 14, 16, 16, 16, 32, 36, 40, 36, 30, 28, 28, 50, 55, 55]))
        z.writestr("xl/worksheets/sheet2.xml", sheet_xml(candidate_rows, [24, 46, 24, 24, 28, 18, 18, 24, 14, 14, 18, 54, 60, 55]))
        z.writestr("xl/worksheets/sheet3.xml", sheet_xml(summary_rows, [35, 120]))
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)


def write_site(clusters: list[dict], candidates: list[dict]) -> None:
    SITE_CLUSTER_DATA.write_text(
        "window.CLUSTER_DATA = "
        + json.dumps({"clusters": clusters, "candidates": candidates}, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    SITE_CLUSTER_PAGE.write_text(
        textwrap.dedent(
            """\
            <!doctype html>
            <html lang="zh-CN">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Skill 聚类矩阵</title>
              <link rel="stylesheet" href="./styles.css" />
              <link rel="stylesheet" href="./clusters.css" />
            </head>
            <body>
              <main class="app">
                <header class="topbar">
                  <div>
                    <p class="eyebrow">MECE 聚类矩阵</p>
                    <h1>从 Skill 到三宝候选能力</h1>
                  </div>
                  <div class="stats" id="stats"></div>
                </header>
                <section class="controls">
                  <label class="search"><span>搜索聚类</span><input id="q" type="search" placeholder="搜索价值、问题、能力、Preset、代表技能..." /></label>
                  <label><span>候选层级</span><select id="level"><option value="">全部层级</option></select></label>
                  <label><span>Preset</span><select id="preset"><option value="">全部 Preset</option></select></label>
                  <label><span>业务价值</span><select id="value"><option value="">全部价值</option></select></label>
                  <label><span>问题类型</span><select id="problem"><option value="">全部问题</option></select></label>
                </section>
                <section class="result-meta">
                  <span id="count"></span>
                  <span><a href="../skill_cluster_matrix.xlsx">打开聚类 Excel</a> · <a href="./index.html">返回 Skill 清单</a></span>
                </section>
                <section class="cluster-table" id="clusters"></section>
              </main>
              <script src="./cluster-data.js"></script>
              <script src="./clusters.js"></script>
            </body>
            </html>
            """
        ),
        encoding="utf-8",
    )
    SITE_CLUSTER_CSS.write_text(
        textwrap.dedent(
            """\
            .cluster-table { display: grid; gap: 10px; }
            .cluster-row {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 8px;
              padding: 14px;
              display: grid;
              grid-template-columns: minmax(240px, 1.4fr) repeat(4, minmax(120px, 0.7fr));
              gap: 12px;
              align-items: start;
            }
            .cluster-row h2 { margin: 0 0 6px; font-size: 16px; line-height: 1.3; overflow-wrap: anywhere; }
            .cluster-row p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.45; }
            .metric { color: var(--muted); font-size: 13px; }
            .metric strong { display: block; color: var(--text); font-size: 18px; margin-bottom: 2px; }
            .full { grid-column: 1 / -1; }
            @media (max-width: 900px) { .cluster-row { grid-template-columns: 1fr 1fr; } .full { grid-column: 1 / -1; } }
            @media (max-width: 640px) { .cluster-row { grid-template-columns: 1fr; } }
            """
        ),
        encoding="utf-8",
    )
    SITE_CLUSTER_APP.write_text(
        textwrap.dedent(
            """\
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
            """
        ),
        encoding="utf-8",
    )


def write_report(clusters: list[dict], candidates: list[dict], rows: list[dict]) -> None:
    REPORT.write_text(
        "# Skill MECE 聚类报告\n\n"
        f"- 生成时间：{dt.datetime.now().astimezone().isoformat(timespec='seconds')}\n"
        f"- 底表 skill 数：{len(rows)}\n"
        f"- 主聚类数：{len(clusters)}\n"
        f"- 三宝候选数：{len(candidates)}\n"
        f"- 聚类 Excel：`{CLUSTER_XLSX}`\n"
        f"- 聚类网站：`{SITE_CLUSTER_PAGE}`\n\n"
        "## MECE 口径\n\n"
        "- 每个 skill 只进入一个主聚类：`业务价值类型 × 问题类型 × 主核心能力`。\n"
        "- `主核心能力` 取增强表 `核心能力` 的第一主能力；其他能力保留在原 skill 表，不重复入桶。\n"
        "- 聚类结果不是正式三宝能力发布，只是候选资产池；需要按业务责任、输入输出、验收证据和上下游关系继续评审。\n\n"
        "## 候选层级分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in Counter(c["三宝候选层级"] for c in clusters).most_common())
        + "\n\n## Preset 候选分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in Counter(c["三宝Preset候选"] for c in clusters).most_common())
        + "\n",
        encoding="utf-8",
    )


def main() -> int:
    rows = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    clusters = aggregate(rows)
    candidates = build_candidates(clusters)

    cluster_cols = [
        "cluster_id",
        "业务价值类型",
        "问题类型",
        "主核心能力",
        "skill_count",
        "high_confidence_count",
        "needs_review_count",
        "review_ratio",
        "text_quality_risk_count",
        "avg_confidence",
        "top_sources",
        "top_scenarios",
        "三宝候选层级",
        "三宝Preset候选",
        "数字员工候选",
        "代表技能",
        "聚类说明",
        "复核原因",
        "代表用途",
    ]
    candidate_cols = [
        "candidate_id",
        "候选名称",
        "候选层级",
        "数字员工候选",
        "三宝Preset候选",
        "业务价值类型",
        "问题类型",
        "主核心能力",
        "包含skill数",
        "平均置信度",
        "优先级",
        "代表技能",
        "建议下一步",
        "复核原因",
    ]
    CLUSTER_JSON.write_text(json.dumps(clusters, ensure_ascii=False, indent=2), encoding="utf-8")
    CANDIDATE_JSON.write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(CLUSTER_CSV, clusters, cluster_cols)
    write_csv(CANDIDATE_CSV, candidates, candidate_cols)
    write_xlsx(clusters, candidates, cluster_cols, candidate_cols)
    write_site(clusters, candidates)
    write_report(clusters, candidates, rows)
    print(json.dumps({"skills": len(rows), "clusters": len(clusters), "candidates": len(candidates), "xlsx": str(CLUSTER_XLSX)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
