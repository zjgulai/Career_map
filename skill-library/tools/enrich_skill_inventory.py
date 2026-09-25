#!/usr/bin/env python3
"""Enrich the skill inventory with model-designed semantic summaries.

This pass keeps the first raw inventory intact and writes a second workbook/site
data set with stronger purpose, business value, problem type, and evidence fields.
It uses deterministic extraction rules designed around the observed skill formats,
especially paper_to_skills markdown templates.
"""

from __future__ import annotations

import datetime as dt
import html
import json
from pathlib import Path
import re
import textwrap
import zipfile

import build_skill_library as base


ROOT = Path("/Users/lute/project/Career/skill-library")
INPUT_JSON = ROOT / "skill_inventory.json"
ENRICHED_JSON = ROOT / "skill_inventory_enriched.json"
ENRICHED_CSV = ROOT / "skill_inventory_enriched.csv"
ENRICHED_XLSX = ROOT / "skill_inventory_enriched.xlsx"
SITE_DATA = ROOT / "site" / "skill-data.js"
REPORT = ROOT / "ENRICHMENT_REPORT.md"

PROBLEM_TYPES = [
    ("诊断归因", ["attribution", "root cause", "root-cause", "causal", "did", "diagnos", "根因", "归因", "因果", "差评"]),
    ("预测预警", ["forecast", "predict", "prediction", "alert", "anomaly", "early warning", "趋势", "预测", "预警", "异常"]),
    ("优化决策", ["optimization", "optimiz", "pricing", "routing", "allocation", "inventory", "budget", "bid", "decision", "优化", "定价", "库存", "投放", "分配"]),
    ("生成制作", ["generate", "generation", "creative", "content", "copy", "image", "video", "生成", "制作", "内容", "素材"]),
    ("检索组织", ["rag", "retrieval", "search", "knowledge graph", "vector", "index", "ontology", "schema", "检索", "知识图谱", "本体", "索引"]),
    ("评估验证", ["evaluate", "evaluation", "benchmark", "test", "validation", "experiment", "ab test", "评估", "验证", "实验", "测试"]),
    ("治理合规", ["compliance", "privacy", "security", "guard", "governance", "policy", "risk", "合规", "隐私", "安全", "治理", "风险"]),
    ("数据质量", ["data quality", "lineage", "provenance", "validation", "clean", "schema", "quality", "数据质量", "血缘", "校验"]),
    ("集成部署", ["deploy", "hosting", "integration", "api", "connector", "runtime", "setup", "install", "部署", "集成", "接入"]),
    ("自动化执行", ["workflow", "agent", "automation", "pipeline", "orchestrat", "执行", "自动化", "工作流"]),
    ("学习参考", ["paper", "research", "framework", "guide", "playbook", "研究", "方法", "框架"]),
]

VALUE_TYPES = [
    ("增长与收入", ["revenue", "growth", "conversion", "ltv", "cac", "roi", "profit", "gmv", "转化", "增长", "收入", "利润", "ROI"]),
    ("成本与效率", ["cost", "efficiency", "cache", "routing", "automation", "dedup", "成本", "效率", "节省", "自动化"]),
    ("风险与合规", ["risk", "compliance", "privacy", "security", "policy", "coppa", "风险", "合规", "隐私", "安全"]),
    ("体验与满意度", ["voc", "sentiment", "review", "journey", "customer", "churn", "评论", "满意", "体验", "客服"]),
    ("供给与履约", ["supply", "inventory", "supplier", "warehouse", "logistics", "fulfillment", "库存", "供应", "履约", "仓储", "物流"]),
    ("知识与研发资产", ["rag", "knowledge", "document", "paper", "benchmark", "技能", "知识", "研发", "文档"]),
    ("内容与品牌", ["brand", "content", "creative", "video", "seo", "search", "品牌", "内容", "素材", "搜索"]),
]

AUDIENCES = [
    ("经营负责人", ["business", "operation", "growth", "roi", "kpi", "经营", "增长", "ROI"]),
    ("产品/品牌/市场", ["product", "brand", "marketing", "content", "seo", "keyword", "产品", "品牌", "市场", "内容"]),
    ("数据/BI/算法", ["data", "analytics", "model", "forecast", "causal", "rag", "数据", "算法", "模型", "分析"]),
    ("工程/平台", ["backend", "frontend", "api", "deploy", "database", "runtime", "工程", "部署", "接口"]),
    ("安全/合规/治理", ["security", "privacy", "compliance", "governance", "risk", "合规", "安全", "隐私"]),
    ("创意/内容制作", ["creative", "image", "video", "copy", "presentation", "创意", "视频", "图像"]),
]


def read_source(path_value: str, limit: int = 768_000) -> tuple[str, str]:
    path = Path(path_value)
    try:
        data = path.read_bytes()
    except Exception:
        return "", "unreadable"
    sample = data[: min(len(data), 8192)]
    nul_ratio = sample.count(b"\x00") / max(1, len(sample))
    text = data[:limit].decode("utf-8", errors="replace")
    replacement_ratio = text.count("\ufffd") / max(1, len(text))
    printable = sum(1 for ch in text[:8192] if ch.isprintable() or ch in "\n\r\t") / max(1, min(len(text), 8192))
    if nul_ratio > 0.01 or replacement_ratio > 0.03 or printable < 0.82:
        return text, "binary_or_cloud_placeholder"
    if len(data) > limit:
        return text, "text_truncated"
    return text, "text"


def frontmatter_and_body(text: str) -> tuple[dict, str]:
    return base.split_frontmatter(text)


def normalize_name(name: str) -> str:
    name = re.sub(r"^Skill[-_: ]", "", name)
    name = re.sub(r"\.(md|jsonl?|ya?ml)$", "", name, flags=re.I)
    return name.replace("-", " ").replace("_", " ").strip()


def clean(value: object, max_len: int = 360) -> str:
    return base.clean_inline(value, max_len=max_len)


def extract_by_patterns(text: str, labels: list[str], max_len: int = 420) -> str:
    lines = text.splitlines()
    captures: list[str] = []
    label_re = "|".join(re.escape(label) for label in labels)
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        direct = re.match(rf"^(?:[-*]\s*)?(?:\*\*)?(?:{label_re})(?:\*\*)?\s*[：:]\s*(.+)$", stripped, flags=re.I)
        if direct:
            captures.append(direct.group(1).strip())
            continue
        if re.search(rf"(?:{label_re})", stripped, flags=re.I) and len(stripped) < 80:
            chunk = []
            for nxt in lines[idx + 1 : idx + 6]:
                s = nxt.strip()
                if not s:
                    if chunk:
                        break
                    continue
                if s.startswith("#") or re.match(r"^(?:[-*]\s*)?\*\*[^*]+[：:]", s):
                    if chunk:
                        break
                chunk.append(s)
                if len(" ".join(chunk)) > max_len:
                    break
            if chunk:
                captures.append(" ".join(chunk))
    return clean("；".join(captures[:3]), max_len)


def section_after_heading(text: str, heading_keywords: list[str], max_len: int = 520) -> str:
    headings = list(re.finditer(r"^(#{1,4})\s*(.+?)\s*$", text, flags=re.M))
    for i, match in enumerate(headings):
        title = clean(match.group(2), 120).lower()
        if any(k.lower() in title for k in heading_keywords):
            start = match.end()
            end = headings[i + 1].start() if i + 1 < len(headings) else len(text)
            return clean(text[start:end], max_len)
    return ""


def keyword_pick(text: str, mapping: list[tuple[str, list[str]]], fallback: str) -> str:
    lower = text.lower()
    scores: list[tuple[int, str]] = []
    for label, keywords in mapping:
        score = sum(1 for kw in keywords if contains_keyword(lower, kw))
        if score:
            scores.append((score, label))
    if not scores:
        return fallback
    scores.sort(key=lambda item: (-item[0], item[1]))
    return scores[0][1]


def contains_keyword(lower_text: str, keyword: str) -> bool:
    kw = keyword.lower()
    if re.search(r"[\u4e00-\u9fff]", kw):
        return kw in lower_text
    if len(kw) <= 4 and re.match(r"^[a-z0-9+-]+$", kw):
        return re.search(rf"(?<![a-z0-9]){re.escape(kw)}(?![a-z0-9])", lower_text) is not None
    if " " in kw or "-" in kw or "/" in kw:
        return kw in lower_text
    return re.search(rf"(?<![a-z0-9]){re.escape(kw)}(?:s|ed|ing)?(?![a-z0-9])", lower_text) is not None


def method_terms(text: str, name: str) -> str:
    candidates = [
        ("DiD/因果推断", ["did", "difference-in-differences", "causal", "因果", "差分中差"]),
        ("RAG/知识检索", ["rag", "retrieval", "vector", "embedding", "bm25", "检索", "向量"]),
        ("知识图谱/本体建模", ["knowledge graph", "ontology", "graph", "schema", "知识图谱", "本体"]),
        ("预测建模", ["forecast", "prediction", "time series", "predictive", "预测", "时间序列"]),
        ("优化/运筹", ["optimization", "routing", "allocation", "inventory", "bid", "优化", "路由", "库存"]),
        ("NLP/情感分析", ["sentiment", "absa", "ner", "nlp", "情感", "文本", "评论"]),
        ("视觉/多模态", ["image", "visual", "multimodal", "vision", "图像", "多模态"]),
        ("实验/评估", ["experiment", "a/b", "benchmark", "evaluation", "实验", "评估"]),
        ("合规/规则扫描", ["compliance", "privacy", "guard", "policy", "合规", "隐私", "规则"]),
        ("工程模式/自动化", ["api", "workflow", "pipeline", "deploy", "middleware", "工作流", "部署"]),
    ]
    lower = f"{name} {text}".lower()
    picked = [label for label, kws in candidates if any(contains_keyword(lower, kw) for kw in kws)]
    return "；".join(picked[:3]) if picked else "按技能原文流程执行"


def purpose_sentence(row: dict, fm: dict, text: str, text_quality: str) -> str:
    name = row["英文名称"]
    title = clean(fm.get("title"), 220)
    core = extract_by_patterns(text, ["核心思想", "Core Principle", "Overview", "Purpose"], 360)
    business_problem = extract_by_patterns(text, ["业务问题", "Problem", "Use case", "Use Case"], 300)
    expected = extract_by_patterns(text, ["预期产出", "Outputs", "Artifacts Required", "Deliverables"], 300)
    if text_quality.startswith("binary") or not text.strip():
        return clean(f"用于处理 {normalize_name(name)} 相关问题；当前源文件不可稳定读取，需下载或修复正文后补全用途。", 220)
    subject = title or normalize_name(name)
    if business_problem and expected:
        return clean(f"用于{business_problem}，通过{method_terms(text, name)}形成{expected}。", 260)
    if core and expected:
        return clean(f"用于{subject}：{core}；主要产出{expected}。", 260)
    if core:
        return clean(f"用于{subject}：{core}", 260)
    return clean(row.get("一句话作用") or f"用于{subject}相关任务的判断、生成或执行。", 260)


def chinese_title(row: dict, fm: dict, text_quality: str) -> str:
    title = clean(fm.get("title"), 180)
    if title and re.search(r"[\u4e00-\u9fff]", title):
        if "—" in title:
            rhs = title.split("—", 1)[1].strip()
            if re.search(r"[\u4e00-\u9fff]", rhs):
                return clean(rhs, 120)
        return title
    current = row.get("中文名称", "")
    if current and not current.startswith("待补：") and len(current) > 3:
        return current
    return f"待补：{normalize_name(row['英文名称'])}"


def key_inputs(row: dict, text: str, text_quality: str) -> str:
    if text_quality.startswith("binary"):
        return clean(f"待补：源文件当前不可稳定读取；可先按文件名和路径定位 {row.get('relative_path')}", 260)
    value = extract_by_patterns(text, ["数据要求", "Inputs", "Entry Conditions", "Prerequisites", "输入", "前置条件"], 520)
    if value:
        return value
    section = section_after_heading(text, ["Inputs", "输入", "Compatibility", "Prerequisites"], 420)
    return section or row.get("关键输入", "")


def key_outputs(row: dict, text: str, text_quality: str) -> str:
    if text_quality.startswith("binary"):
        return "待补：源文件当前不可稳定读取，无法确认交付物"
    value = extract_by_patterns(text, ["预期产出", "Outputs", "Artifacts Required", "Deliverables", "Acceptance Evidence", "输出", "交付物"], 560)
    if value:
        return value
    section = section_after_heading(text, ["Outputs", "Deliverables", "Artifacts", "Validation", "输出", "交付"], 420)
    return section or row.get("关键输出", "")


def business_value(row: dict, text: str) -> str:
    value = extract_by_patterns(text, ["业务价值", "ROI", "Why This Matters", "Success Criteria", "价值"], 520)
    if value:
        return value
    label = keyword_pick(f"{row.get('英文名称')} {row.get('一句话作用')} {text[:2000]}", VALUE_TYPES, "其他/待评估")
    if label == "其他/待评估":
        return "待评估：原文未明确业务价值"
    return f"可用于支撑{label}类目标；具体收益需结合业务数据、执行条件和验收口径确认。"


def trigger_condition(row: dict, text: str) -> str:
    problem = extract_by_patterns(text, ["业务问题", "Problem", "When to use", "Use this skill", "场景"], 380)
    if problem:
        return problem
    return clean(row.get("解决具体问题", ""), 320)


def constraints(text: str, text_quality: str) -> str:
    if text_quality.startswith("binary"):
        return "源文件不可稳定读取；需要确认 iCloud 文件已下载或源文件格式正确"
    value = extract_by_patterns(text, ["风险", "合规", "Constraints", "Non-goals", "Assumptions", "关键假设", "三轨验证"], 520)
    if value:
        return value
    section = section_after_heading(text, ["Assumptions", "Constraints", "Non-goals", "风险", "合规"], 420)
    return section or "原文未明确限制；使用前需核对输入、权限、数据来源和验收条件"


def evidence(text: str, fm: dict, text_quality: str) -> str:
    if text_quality.startswith("binary"):
        return "证据不足：文件内容像二进制/云盘占位，未抽取正文。"
    pieces = []
    for key in ("title", "description", "domain", "category", "tags"):
        if fm.get(key):
            pieces.append(f"{key}: {clean(fm.get(key), 120)}")
    core = extract_by_patterns(text, ["核心思想", "Core Principle"], 180)
    if core:
        pieces.append(f"核心思想: {core}")
    return clean("；".join(pieces[:4]), 420) or "基于文件名、路径和正文首段抽取。"


def enrich_row(row: dict) -> dict:
    text, quality = read_source(row["source_path"])
    fm, body = frontmatter_and_body(text) if quality != "unreadable" else ({}, "")
    rich_text = " ".join([row.get("英文名称", ""), row.get("业务场景", ""), row.get("一句话作用", ""), text[:12000]])
    out = dict(row)
    out["中文名称"] = chinese_title(row, fm, quality)
    out["用途总结"] = purpose_sentence(row, fm, body or text, quality)
    out["一句话作用"] = out["用途总结"]
    out["关键输入"] = key_inputs(row, body or text, quality)
    out["关键输出"] = key_outputs(row, body or text, quality)
    out["核心能力"] = method_terms(rich_text, row.get("英文名称", ""))
    out["问题类型"] = keyword_pick(rich_text, PROBLEM_TYPES, "其他/待人工归类")
    out["业务价值"] = business_value(row, body or text)
    out["业务价值类型"] = keyword_pick(rich_text + " " + out["业务价值"], VALUE_TYPES, "其他/待评估")
    out["适用对象"] = keyword_pick(rich_text, AUDIENCES, "通用使用者/待确认")
    out["触发条件"] = trigger_condition(row, body or text)
    out["方法或机制"] = out["核心能力"]
    out["关键约束"] = constraints(body or text, quality)
    out["证据摘要"] = evidence(body or text, fm, quality)
    out["text_quality"] = quality
    confidence = 0.35
    if quality == "text":
        confidence += 0.35
    if fm:
        confidence += 0.1
    if out["关键输入"] and "待补" not in out["关键输入"]:
        confidence += 0.08
    if out["关键输出"] and "待补" not in out["关键输出"] and "过程辅助" not in out["关键输出"]:
        confidence += 0.07
    if out["业务价值"] and "待评估" not in out["业务价值"]:
        confidence += 0.05
    out["summary_confidence"] = round(min(confidence, 0.95), 2)
    out["needs_review"] = bool(row.get("needs_review")) or quality != "text" or out["summary_confidence"] < 0.7
    return out


def excel_col_name(index: int) -> str:
    return base.excel_col_name(index)


def cell(value: object, row: int, col: int) -> str:
    ref = f"{excel_col_name(col)}{row}"
    text = html.escape(str(value or ""), quote=False)
    return f'<c r="{ref}" t="inlineStr"><is><t xml:space="preserve">{text}</t></is></c>'


def write_xlsx(path: Path, rows: list[dict], columns: list[str]) -> None:
    def sheet_xml(sheet_rows: list[list[object]], widths: list[int]) -> str:
        body = []
        for r_idx, values in enumerate(sheet_rows, start=1):
            body.append(f'<row r="{r_idx}">' + "".join(cell(value, r_idx, c_idx) for c_idx, value in enumerate(values, start=1)) + "</row>")
        cols = "".join(f'<col min="{i}" max="{i}" width="{width}" customWidth="1"/>' for i, width in enumerate(widths, start=1))
        return (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f"<cols>{cols}</cols><sheetData>{''.join(body)}</sheetData>"
            f'<autoFilter ref="A1:{excel_col_name(len(widths))}{max(1, len(sheet_rows))}"/>'
            "</worksheet>"
        )

    inventory_rows = [columns] + [[row.get(col, "") for col in columns] for row in rows]
    report_rows = [
        ["项目", "值"],
        ["生成时间", dt.datetime.now().astimezone().isoformat(timespec="seconds")],
        ["记录数", len(rows)],
        ["说明", "增强字段由本地规则抽取和当前模型设计的语义分类生成；低置信记录已标记 needs_review。"],
    ]
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
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
<sheets><sheet name="增强技能清单" sheetId="1" r:id="rId1"/><sheet name="增强说明" sheetId="2" r:id="rId2"/></sheets></workbook>"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>"""
    now = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    core = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Enriched Skill Inventory</dc:title><dc:creator>Codex</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified></cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>"""
    widths = [24, 30, 46, 46, 46, 24, 24, 50, 46, 24, 20, 30, 28, 34, 46, 46, 46, 46, 18, 16, 16, 18, 18, 60]
    widths = widths + [22] * max(0, len(columns) - len(widths))
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml(inventory_rows, widths[: len(columns)]))
        z.writestr("xl/worksheets/sheet2.xml", sheet_xml(report_rows, [35, 120]))
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)


def write_csv(rows: list[dict], columns: list[str]) -> None:
    import csv

    with ENRICHED_CSV.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in columns})


def write_site_data(rows: list[dict]) -> None:
    site_rows = []
    for row in rows:
        site_rows.append(
            {
                "英文名称": row.get("英文名称"),
                "中文名称": row.get("中文名称"),
                "一句话作用": row.get("一句话作用"),
                "用途总结": row.get("用途总结"),
                "关键输入": row.get("关键输入"),
                "关键输出": row.get("关键输出"),
                "最新更新时间": row.get("最新更新时间"),
                "业务场景": row.get("业务场景"),
                "解决具体问题": row.get("解决具体问题"),
                "核心能力": row.get("核心能力"),
                "问题类型": row.get("问题类型"),
                "业务价值": row.get("业务价值"),
                "业务价值类型": row.get("业务价值类型"),
                "适用对象": row.get("适用对象"),
                "触发条件": row.get("触发条件"),
                "方法或机制": row.get("方法或机制"),
                "关键约束": row.get("关键约束"),
                "证据摘要": row.get("证据摘要"),
                "skill_id": row.get("skill_id"),
                "source_type": row.get("source_type"),
                "entry_type": row.get("entry_type"),
                "scan_scope": row.get("scan_scope"),
                "relative_path": row.get("relative_path"),
                "needs_review": row.get("needs_review"),
                "field_completeness": row.get("field_completeness"),
                "text_quality": row.get("text_quality"),
                "summary_confidence": row.get("summary_confidence"),
                "当前Codex状态": row.get("当前Codex状态"),
                "Codex运行时范围": row.get("Codex运行时范围"),
                "Codex来源层": row.get("Codex来源层"),
                "Codex分发来源": row.get("Codex分发来源"),
                "Codex版本": row.get("Codex版本"),
                "运行时核验时间": row.get("运行时核验时间"),
                "替代入口路径": row.get("替代入口路径"),
                "运行时业务提示": row.get("运行时业务提示"),
                "archive_path": "../skills/" + row.get("skill_id", "") + "/" + ("SKILL.md" if row.get("entry_type") == "directory_skill" else Path(row.get("source_path", "")).name),
            }
        )
    SITE_DATA.write_text("window.SKILL_DATA = " + json.dumps(site_rows, ensure_ascii=False) + ";\n", encoding="utf-8")


def patch_site_for_enriched_fields() -> None:
    return None


def main() -> int:
    rows = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    enriched = [enrich_row(row) for row in rows]
    enriched.sort(key=lambda row: (row.get("业务价值类型", ""), row.get("问题类型", ""), row.get("业务场景", ""), row.get("英文名称", "").lower()))
    columns = [
        "英文名称",
        "中文名称",
        "一句话作用",
        "关键输入",
        "关键输出",
        "最新更新时间",
        "业务场景",
        "解决具体问题",
        "用途总结",
        "核心能力",
        "问题类型",
        "业务价值类型",
        "业务价值",
        "适用对象",
        "触发条件",
        "方法或机制",
        "关键约束",
        "证据摘要",
        "text_quality",
        "summary_confidence",
        "needs_review",
        "source_type",
        "entry_type",
        "relative_path",
        "skill_id",
    ]
    ENRICHED_JSON.write_text(json.dumps(enriched, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(enriched, columns)
    write_xlsx(ENRICHED_XLSX, enriched, columns)
    write_site_data(enriched)
    patch_site_for_enriched_fields()

    from collections import Counter

    quality = Counter(row["text_quality"] for row in enriched)
    problem = Counter(row["问题类型"] for row in enriched)
    value = Counter(row["业务价值类型"] for row in enriched)
    REPORT.write_text(
        "# Skill 增强摘要报告\n\n"
        f"- 生成时间：{dt.datetime.now().astimezone().isoformat(timespec='seconds')}\n"
        f"- 记录数：{len(enriched)}\n"
        f"- 增强 Excel：`{ENRICHED_XLSX}`\n"
        f"- 增强 JSON：`{ENRICHED_JSON}`\n"
        f"- 网站数据已更新：`{SITE_DATA}`\n\n"
        "## 文本质量\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in quality.most_common())
        + "\n\n## 问题类型分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in problem.most_common())
        + "\n\n## 业务价值类型分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in value.most_common())
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"rows": len(enriched), "xlsx": str(ENRICHED_XLSX), "site_data": str(SITE_DATA)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
