#!/usr/bin/env python3
"""Build a conservative Sanbao review matrix from the enriched skill inventory.

This pass is intentionally stricter than the exploratory cluster matrix. It does
not promote uncertain records into formal Sanbao capabilities. It first separates
review-only, out-of-scope, and blocked records, then assigns conservative Sanbao
candidate levels for records with enough evidence.
"""

from __future__ import annotations

from collections import Counter, defaultdict
import csv
import datetime as dt
import hashlib
import html
import json
from pathlib import Path
import re
import textwrap
import zipfile

import build_skill_library as base


ROOT = Path("/Users/lute/project/Career/skill-library")
INPUT_JSON = ROOT / "skill_inventory_enriched.json"
DETAIL_JSON = ROOT / "sanbao_review_matrix.json"
DETAIL_CSV = ROOT / "sanbao_review_matrix.csv"
SUMMARY_JSON = ROOT / "sanbao_review_summary.json"
SUMMARY_CSV = ROOT / "sanbao_review_summary.csv"
XLSX = ROOT / "sanbao_review_matrix.xlsx"
REPORT = ROOT / "SANBAO_REVIEW_REPORT.md"
SITE_DATA = ROOT / "site" / "sanbao-review-data.js"
SITE_PAGE = ROOT / "site" / "sanbao-review.html"
SITE_APP = ROOT / "site" / "sanbao-review.js"
SITE_CSS = ROOT / "site" / "sanbao-review.css"


PRIMARY_KEYS = [
    "REVIEW_ONLY",
    "VALUE_NEW_PRODUCT",
    "VALUE_CONTINUOUS_OPERATION",
    "VALUE_NEW_MARKET",
    "OPERATING_GOVERNANCE",
    "CAPABILITY_KNOWLEDGE_METHOD",
    "CAPABILITY_DATA_SEMANTIC",
    "CAPABILITY_TOOL_RUNTIME",
    "GENERAL_SUPPORT",
    "OUT_OF_SCOPE",
]

PRIMARY_NAMES = {
    "REVIEW_ONLY": "待复核/补证",
    "VALUE_NEW_PRODUCT": "新品经营价值链",
    "VALUE_CONTINUOUS_OPERATION": "持续经营价值链",
    "VALUE_NEW_MARKET": "新市场经营价值链",
    "OPERATING_GOVERNANCE": "经营治理",
    "CAPABILITY_KNOWLEDGE_METHOD": "能力供给：知识与方法",
    "CAPABILITY_DATA_SEMANTIC": "能力供给：数据与语义",
    "CAPABILITY_TOOL_RUNTIME": "能力供给：工具与运行",
    "GENERAL_SUPPORT": "通用支持",
    "OUT_OF_SCOPE": "三宝范围外",
}

BLOCKING_ACTION_KEYWORDS = [
    "改价",
    "price change",
    "pricing execution",
    "投放",
    "ad spend",
    "campaign launch",
    "发布商品",
    "publish listing",
    "create order",
    "订单",
    "refund",
    "退款",
    "payment",
    "支付",
    "库存调整",
    "inventory adjustment",
    "send email",
    "发送邮件",
    "scrape",
    "爬取",
]

OUT_OF_SCOPE_KEYWORDS = [
    "godot",
    "unity",
    "gameplay",
    "game ",
    "游戏",
    "minecraft",
    "resume",
    "个人简历",
    "tmux",
    "keyboard",
]

NEW_PRODUCT_KEYWORDS = [
    "new product",
    "新品",
    "产品定义",
    "商业验证",
    "product validation",
    "样品",
    "上市前",
    "limited launch",
    "有限放量",
    "prototype",
]

CONTINUOUS_KEYWORDS = [
    "continuous operation",
    "持续经营",
    "库存",
    "inventory",
    "demand change",
    "需求变化",
    "promotion",
    "促销",
    "投放",
    "retention",
    "churn",
    "checkout",
    "pricing",
    "销量",
    "复盘",
]

NEW_MARKET_KEYWORDS = [
    "new market",
    "新市场",
    "market entry",
    "本地化",
    "localization",
    "country",
    "tariff",
    "关税",
    "cross-border",
    "跨境",
    "compliance market",
]

GOVERNANCE_KEYWORDS = [
    "governance",
    "授权",
    "responsibility",
    "责任",
    "decision",
    "决策",
    "policy",
    "方法生效",
    "退役",
    "review decision",
    "风险决策",
]

KNOWLEDGE_METHOD_KEYWORDS = [
    "paper",
    "research",
    "method",
    "framework",
    "playbook",
    "sop",
    "knowledge",
    "知识",
    "方法",
    "框架",
    "论文",
    "评估框架",
]

DATA_SEMANTIC_KEYWORDS = [
    "data quality",
    "data provenance",
    "lineage",
    "schema",
    "ontology",
    "tag",
    "dictionary",
    "semantic",
    "数据质量",
    "血缘",
    "口径",
    "对象关系",
    "标签",
    "字典",
    "语义",
]

TOOL_RUNTIME_KEYWORDS = [
    "api",
    "mcp",
    "connector",
    "deploy",
    "runtime",
    "hosting",
    "backend",
    "frontend",
    "test",
    "lint",
    "typecheck",
    "workflow",
    "automation",
    "工具",
    "部署",
    "运行",
    "连接器",
]

RESPONSIBILITY_RULES = [
    ("消费者需求洞察", ["voc", "review", "sentiment", "pain point", "需求", "评论", "情感", "痛点"]),
    ("商业论证", ["business case", "roi", "unit economics", "商业论证", "经营可行性", "经济性"]),
    ("产品定义", ["product definition", "requirement", "产品定义", "产品要求", "规格"]),
    ("产品实现", ["prototype", "sample", "implementation", "样品", "实现", "工程"]),
    ("产品验证", ["validation", "test", "experiment", "验证", "测试", "实验"]),
    ("上市经营策划", ["launch", "go-to-market", "gtm", "上市", "进入市场"]),
    ("产品市场准入", ["compliance", "regulatory", "准入", "合规", "tos", "fda", "coppa"]),
    ("供给与交付准备", ["inventory", "supply", "supplier", "warehouse", "logistics", "库存", "供应", "履约", "物流"]),
    ("渠道发布与可售核验", ["listing", "publish", "channel", "可售", "上架", "发布"]),
    ("商品资料管理", ["product data", "商品资料", "资料包", "pim"]),
    ("内容策划与表达", ["content", "creative", "copy", "video", "image", "内容", "素材", "表达"]),
    ("品牌定位与主张", ["brand", "positioning", "品牌", "定位", "主张"]),
    ("定价与促销", ["pricing", "promotion", "discount", "定价", "促销", "折扣"]),
    ("经营经济性评估", ["cost", "margin", "cash", "profit", "成本", "现金", "贡献"]),
    ("付费媒体投放与优化", ["ad", "campaign", "media", "bid", "投放", "广告"]),
    ("经营实验与效果评估", ["ab test", "experiment", "effect", "causal", "实验", "效果", "因果"]),
    ("经营数据供给与质量保障", ["data quality", "analytics", "bi", "dashboard", "数据", "质量", "看板"]),
    ("经营口径与对象关系治理", ["ontology", "schema", "dictionary", "tag", "口径", "对象关系", "标签", "字典"]),
    ("经营知识整理与维护", ["knowledge", "method", "sop", "playbook", "知识", "方法", "维护"]),
    ("工具运行与工程支持", ["api", "runtime", "deploy", "connector", "mcp", "运行", "部署", "工具"]),
]


def clean(value: object, max_len: int = 360) -> str:
    return base.clean_inline(value, max_len=max_len)


def haystack(row: dict) -> str:
    fields = [
        row.get("英文名称", ""),
        row.get("中文名称", ""),
        row.get("用途总结", ""),
        row.get("关键输入", ""),
        row.get("关键输出", ""),
        row.get("业务场景", ""),
        row.get("解决具体问题", ""),
        row.get("核心能力", ""),
        row.get("问题类型", ""),
        row.get("业务价值", ""),
        row.get("业务价值类型", ""),
        row.get("适用对象", ""),
        row.get("触发条件", ""),
        row.get("关键约束", ""),
        row.get("证据摘要", ""),
        row.get("source_path", ""),
    ]
    return " ".join(str(f) for f in fields).lower()


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword.lower() in text for keyword in keywords)


def quality_blockers(row: dict) -> list[str]:
    blockers: list[str] = []
    combined = haystack(row)
    if row.get("needs_review") is True:
        blockers.append("needs_review=true，尚无人工复核结论")
    if row.get("text_quality") != "text":
        blockers.append(f"text_quality={row.get('text_quality')}，源文件不可稳定读取")
    if float(row.get("summary_confidence") or 0) < 0.8:
        blockers.append("summary_confidence < 0.80")
    if row.get("redaction_status") == "included_redacted":
        blockers.append("redaction_status=included_redacted，可能涉及敏感内容")
    if "待补" in combined:
        blockers.append("存在待补字段")
    if "过程辅助，无固定交付物" in combined:
        blockers.append("输出不清：过程辅助，无固定交付物")
    if row.get("当前Codex状态") in ("当前可用，新纳入待业务复核", "当前可用，内容已更新待业务复核"):
        blockers.append("当前 Codex Skill 尚未完成业务复核")
    if has_any(combined, BLOCKING_ACTION_KEYWORDS):
        blockers.append("涉及真实业务动作或高风险操作，需确认授权边界")
    return blockers


def primary_cluster(row: dict, blockers: list[str]) -> tuple[str, str]:
    text = haystack(row)
    if has_any(text, OUT_OF_SCOPE_KEYWORDS) and not has_any(text, ["ecommerce", "shopify", "amazon", "跨境", "经营"]):
        return "OUT_OF_SCOPE", "主要内容与三宝经营网络无明显复用关系"
    if blockers:
        return "REVIEW_ONLY", "命中质量、边界或授权复核规则，先进入待复核池"
    if has_any(text, NEW_PRODUCT_KEYWORDS):
        return "VALUE_NEW_PRODUCT", "主要交付服务新品机会、产品定义、商业验证或上市前验证"
    if has_any(text, CONTINUOUS_KEYWORDS):
        return "VALUE_CONTINUOUS_OPERATION", "主要交付服务存量经营、联动优化或经营复盘"
    if has_any(text, NEW_MARKET_KEYWORDS):
        return "VALUE_NEW_MARKET", "主要交付服务新市场进入、本地化或跨境经营判断"
    if has_any(text, GOVERNANCE_KEYWORDS):
        return "OPERATING_GOVERNANCE", "主要交付服务责任、授权、风险或方法生效治理"
    if has_any(text, DATA_SEMANTIC_KEYWORDS):
        return "CAPABILITY_DATA_SEMANTIC", "主要交付数据供给、口径、对象关系或语义结构"
    if has_any(text, TOOL_RUNTIME_KEYWORDS):
        return "CAPABILITY_TOOL_RUNTIME", "主要交付工具、连接器、运行保障或工程自动化"
    if has_any(text, KNOWLEDGE_METHOD_KEYWORDS) or row.get("source_type") == "icloud_paper_file_skill":
        return "CAPABILITY_KNOWLEDGE_METHOD", "主要交付知识、方法、SOP 或评估框架"
    return "GENERAL_SUPPORT", "有复用价值但暂未定位到具体三宝经营责任"


def sanbao_chain(primary_key: str) -> str:
    return {
        "VALUE_NEW_PRODUCT": "新品经营",
        "VALUE_CONTINUOUS_OPERATION": "持续经营",
        "VALUE_NEW_MARKET": "新市场经营",
        "OPERATING_GOVERNANCE": "经营治理",
        "CAPABILITY_KNOWLEDGE_METHOD": "能力供给",
        "CAPABILITY_DATA_SEMANTIC": "能力供给",
        "CAPABILITY_TOOL_RUNTIME": "能力供给",
        "GENERAL_SUPPORT": "不适用/通用支持",
        "OUT_OF_SCOPE": "不适用",
        "REVIEW_ONLY": "待复核",
    }.get(primary_key, "待复核")


def responsibility(row: dict, primary_key: str) -> str:
    if primary_key in ("REVIEW_ONLY", "OUT_OF_SCOPE"):
        return "待人工判断"
    text = haystack(row)
    for name, keywords in RESPONSIBILITY_RULES:
        if has_any(text, keywords):
            return name
    if primary_key == "CAPABILITY_KNOWLEDGE_METHOD":
        return "经营知识整理与维护"
    if primary_key == "CAPABILITY_DATA_SEMANTIC":
        return "经营数据供给与质量保障"
    if primary_key == "CAPABILITY_TOOL_RUNTIME":
        return "工具运行与工程支持"
    return "待人工判断"


def receiving_object(row: dict, resp: str, primary_key: str) -> str:
    mapping = {
        "消费者需求洞察": "需求证据/问题地图",
        "商业论证": "经营选项/验证建议",
        "产品定义": "产品要求/验收条件",
        "产品实现": "方案或样品及交付说明",
        "产品验证": "验证结论/缺陷与未验证项",
        "上市经营策划": "上市经营方案",
        "产品市场准入": "准入判断/证据缺口",
        "供给与交付准备": "供给与交付方案",
        "渠道发布与可售核验": "发布结果/可售判断",
        "商品资料管理": "商品资料包",
        "内容策划与表达": "内容方案及素材",
        "品牌定位与主张": "定位/主张/表达准则",
        "定价与促销": "价格和促销方案",
        "经营经济性评估": "成本/贡献/现金影响评估",
        "付费媒体投放与优化": "投放方案/优化反馈",
        "经营实验与效果评估": "实验或观察方案/效果判断",
        "经营数据供给与质量保障": "经营数据/质量说明",
        "经营口径与对象关系治理": "口径与对象关系约定",
        "经营知识整理与维护": "知识条目/方法候选/维护反馈",
        "工具运行与工程支持": "工具/API/运行支持说明",
    }
    if primary_key == "REVIEW_ONLY":
        return "待复核对象"
    if primary_key == "OUT_OF_SCOPE":
        return "不适用"
    return mapping.get(resp, "经营事项/能力供给对象待确认")


def secondary_tags(row: dict) -> str:
    tags = [
        row.get("业务价值类型", ""),
        row.get("问题类型", ""),
        row.get("核心能力", ""),
        row.get("适用对象", ""),
        row.get("source_type", ""),
    ]
    return clean("；".join(t for t in tags if t), 500)


def boundary(row: dict, blockers: list[str]) -> str:
    if blockers:
        return "；".join(blockers)
    b = row.get("关键约束") or ""
    if b and b != "原文未明确限制；使用前需核对输入、权限、数据来源和验收条件":
        return clean(b, 500)
    return "仅作为候选能力；正式使用前需确认授权、输入数据、适用范围、验收证据和失败处理"


def level_for(row: dict, primary_key: str, blockers: list[str], resp: str) -> str:
    if primary_key == "OUT_OF_SCOPE":
        return "OUT_OF_SCOPE"
    if blockers:
        if any("真实业务动作" in b or "included_redacted" in b for b in blockers):
            return "FORMAL_CANDIDATE_BLOCKED"
        return "REVIEW_ONLY"
    if primary_key in ("CAPABILITY_KNOWLEDGE_METHOD",):
        # Paper/method assets become knowledge/method candidates, not validated skills.
        if row.get("source_type") == "icloud_paper_file_skill":
            return "ATOM_SKILL_CANDIDATE"
    if primary_key in ("CAPABILITY_TOOL_RUNTIME", "CAPABILITY_DATA_SEMANTIC", "OPERATING_GOVERNANCE"):
        return "ATOM_SKILL_CANDIDATE"
    text = haystack(row)
    if "workflow" in text or "工作流" in text or "pipeline" in text:
        return "SCENARIO_WORKFLOW_CANDIDATE"
    if resp in ("消费者需求洞察", "经营数据供给与质量保障", "内容策划与表达", "定价与促销"):
        return "ATOM_SKILL_CANDIDATE"
    return "ATOM_SKILL_CANDIDATE"


def duplicate_group_key(row: dict) -> str:
    name = re.sub(r"[^a-z0-9]+", "-", str(row.get("英文名称", "")).lower()).strip("-")
    digest = str(row.get("content_hash") or "")[:12]
    return f"{name}|{digest}"


def canonical_candidate_id(primary_key: str, resp: str, row: dict) -> str:
    seed = f"{primary_key}|{resp}|{duplicate_group_key(row)}"
    return f"SANBAO-{hashlib.sha1(seed.encode()).hexdigest()[:10]}"


def candidate_status(level: str) -> str:
    if level in ("REVIEW_ONLY", "FORMAL_CANDIDATE_BLOCKED"):
        return "review"
    if level == "OUT_OF_SCOPE":
        return "rejected"
    return "draft"


def next_action(level: str, blockers: list[str], primary_key: str) -> str:
    if level == "OUT_OF_SCOPE":
        return "排除或仅作为通用参考保留"
    if blockers:
        return "补正文/补输入输出/补授权边界/人工复核后再决定是否晋级"
    if primary_key.startswith("VALUE_"):
        return "抽查原文，确认经营对象、责任节点、输入输出和验收证据"
    if primary_key.startswith("CAPABILITY_"):
        return "确认是否作为能力供给中的原子技能或方法候选"
    return "人工判断是否进入三宝能力图谱"


def classify(row: dict) -> dict:
    blockers = quality_blockers(row)
    primary_key, reason = primary_cluster(row, blockers)
    resp = responsibility(row, primary_key)
    level = level_for(row, primary_key, blockers, resp)
    out = dict(row)
    out.update(
        {
            "primary_cluster_key": primary_key,
            "primary_cluster_name_cn": PRIMARY_NAMES[primary_key],
            "primary_assignment_reason": reason,
            "secondary_tags": secondary_tags(row),
            "sanbao_candidate_level": level,
            "sanbao_chain_candidate": sanbao_chain(primary_key),
            "sanbao_responsibility_candidate": resp,
            "receiving_object": receiving_object(row, resp, primary_key),
            "primary_input_contract": clean(row.get("关键输入", ""), 520),
            "primary_output_contract": clean(row.get("关键输出", ""), 520),
            "boundary_or_not_when": boundary(row, blockers),
            "evidence_basis": clean(row.get("证据摘要", ""), 520),
            "latest_update": row.get("最新更新时间", ""),
            "review_reason": "；".join(blockers) if blockers else "具备初步候选条件，仍需人工确认责任边界",
            "duplicate_group_key": duplicate_group_key(row),
            "canonical_candidate_id": canonical_candidate_id(primary_key, resp, row),
            "candidate_status": candidate_status(level),
            "human_reviewer": "",
            "review_decision_date": "",
            "next_action": next_action(level, blockers, primary_key),
        }
    )
    return out


DETAIL_COLUMNS = [
    "英文名称",
    "中文名称",
    "用途总结",
    "primary_cluster_key",
    "primary_cluster_name_cn",
    "primary_assignment_reason",
    "secondary_tags",
    "sanbao_candidate_level",
    "sanbao_chain_candidate",
    "sanbao_responsibility_candidate",
    "receiving_object",
    "primary_input_contract",
    "primary_output_contract",
    "boundary_or_not_when",
    "evidence_basis",
    "source_type",
    "source_path",
    "content_hash",
    "当前Codex状态",
    "Codex运行时范围",
    "Codex来源层",
    "Codex分发来源",
    "Codex版本",
    "运行时核验时间",
    "替代入口路径",
    "运行时业务提示",
    "latest_update",
    "date_source",
    "needs_review",
    "review_reason",
    "text_quality",
    "summary_confidence",
    "redaction_status",
    "duplicate_group_key",
    "canonical_candidate_id",
    "candidate_status",
    "human_reviewer",
    "review_decision_date",
    "next_action",
    "skill_id",
]


SUMMARY_COLUMNS = [
    "primary_cluster_key",
    "primary_cluster_name_cn",
    "sanbao_candidate_level",
    "sanbao_chain_candidate",
    "sanbao_responsibility_candidate",
    "receiving_object",
    "count",
    "high_confidence_count",
    "needs_review_count",
    "blocked_count",
    "top_sources",
    "top_problem_types",
    "representative_skills",
    "representative_outputs",
    "next_action",
]


def summarize(details: list[dict]) -> list[dict]:
    buckets: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for row in details:
        key = (
            row["primary_cluster_key"],
            row["sanbao_candidate_level"],
            row["sanbao_responsibility_candidate"],
        )
        buckets[key].append(row)

    summaries = []
    for (primary_key, level, resp), items in buckets.items():
        sorted_items = sorted(
            items,
            key=lambda r: (
                r["candidate_status"] != "draft",
                -float(r.get("summary_confidence") or 0),
                r.get("英文名称", "").lower(),
            ),
        )
        source_counts = Counter(r.get("source_type", "") for r in items)
        problem_counts = Counter(r.get("问题类型", "") for r in items)
        chain_counts = Counter(r.get("sanbao_chain_candidate", "") for r in items)
        receiving_counts = Counter(r.get("receiving_object", "") for r in items)
        summaries.append(
            {
                "primary_cluster_key": primary_key,
                "primary_cluster_name_cn": PRIMARY_NAMES[primary_key],
                "sanbao_candidate_level": level,
                "sanbao_chain_candidate": chain_counts.most_common(1)[0][0],
                "sanbao_responsibility_candidate": resp,
                "receiving_object": receiving_counts.most_common(1)[0][0],
                "count": len(items),
                "high_confidence_count": sum(1 for r in items if float(r.get("summary_confidence") or 0) >= 0.9),
                "needs_review_count": sum(1 for r in items if r.get("needs_review")),
                "blocked_count": sum(1 for r in items if r.get("sanbao_candidate_level") == "FORMAL_CANDIDATE_BLOCKED"),
                "top_sources": "；".join(f"{k}:{v}" for k, v in source_counts.most_common(4)),
                "top_problem_types": "；".join(f"{k}:{v}" for k, v in problem_counts.most_common(5)),
                "representative_skills": "；".join(r.get("英文名称", "") for r in sorted_items[:8]),
                "representative_outputs": clean("；".join(r.get("primary_output_contract", "") for r in sorted_items[:3]), 700),
                "next_action": summary_next_action(level, primary_key),
            }
        )
    return sorted(
        summaries,
        key=lambda r: (
            PRIMARY_KEYS.index(r["primary_cluster_key"]) if r["primary_cluster_key"] in PRIMARY_KEYS else 99,
            r["sanbao_candidate_level"],
            -r["count"],
            r["sanbao_responsibility_candidate"],
        ),
    )


def summary_next_action(level: str, primary_key: str) -> str:
    if level in ("REVIEW_ONLY", "FORMAL_CANDIDATE_BLOCKED"):
        return "先补证和人工复核，不进入正式能力目录"
    if level == "OUT_OF_SCOPE":
        return "排除或保留为非三宝参考"
    if primary_key in ("VALUE_NEW_PRODUCT", "VALUE_CONTINUOUS_OPERATION", "VALUE_NEW_MARKET"):
        return "进入经营链条评审，确认事项对象、责任节点、输入输出和验收"
    if primary_key.startswith("CAPABILITY_"):
        return "进入能力供给评审，确认是否成为原子技能、方法候选或工具能力"
    return "人工判断是否需要进入三宝图谱"


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


def write_xlsx(details: list[dict], summaries: list[dict]) -> None:
    detail_rows = [DETAIL_COLUMNS] + [[row.get(col, "") for col in DETAIL_COLUMNS] for row in details]
    summary_rows = [SUMMARY_COLUMNS] + [[row.get(col, "") for col in SUMMARY_COLUMNS] for row in summaries]
    explanation_rows = [
        ["项目", "说明"],
        ["生成时间", dt.datetime.now().astimezone().isoformat(timespec="seconds")],
        ["主聚类枚举", "；".join(f"{k}={PRIMARY_NAMES[k]}" for k in PRIMARY_KEYS)],
        ["硬规则", "primary_cluster_key 和 sanbao_candidate_level 为受控枚举；source_path/content_hash/evidence_basis/review_reason 必须保留。"],
        ["保守原则", "不把待补、低置信、不可读、输出不清、涉及真实业务动作的记录纳入正式候选。"],
    ]
    for key, value in Counter(r["primary_cluster_key"] for r in details).most_common():
        explanation_rows.append([f"primary:{key}", value])
    for key, value in Counter(r["sanbao_candidate_level"] for r in details).most_common():
        explanation_rows.append([f"level:{key}", value])

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
<sheet name="候选分拣明细" sheetId="1" r:id="rId1"/>
<sheet name="候选池汇总" sheetId="2" r:id="rId2"/>
<sheet name="分拣说明" sheetId="3" r:id="rId3"/>
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
<dc:title>Sanbao Review Matrix</dc:title><dc:creator>Codex</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified></cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>"""
    with zipfile.ZipFile(XLSX, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml(detail_rows, [24, 26, 52, 24, 22, 42, 42, 26, 18, 28, 28, 46, 46, 50, 50, 20, 70, 22, 22, 18, 16, 55, 18, 16, 20, 34, 24, 16, 16, 20, 42, 22]))
        z.writestr("xl/worksheets/sheet2.xml", sheet_xml(summary_rows, [24, 22, 26, 18, 28, 28, 12, 16, 16, 14, 32, 36, 55, 55, 50]))
        z.writestr("xl/worksheets/sheet3.xml", sheet_xml(explanation_rows, [35, 160]))
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)


def write_site(details: list[dict], summaries: list[dict]) -> None:
    slim_details = []
    for row in details:
        slim_details.append(
            {
                "英文名称": row.get("英文名称"),
                "中文名称": row.get("中文名称"),
                "用途总结": row.get("用途总结"),
                "primary_cluster_key": row.get("primary_cluster_key"),
                "primary_cluster_name_cn": row.get("primary_cluster_name_cn"),
                "sanbao_candidate_level": row.get("sanbao_candidate_level"),
                "sanbao_chain_candidate": row.get("sanbao_chain_candidate"),
                "sanbao_responsibility_candidate": row.get("sanbao_responsibility_candidate"),
                "receiving_object": row.get("receiving_object"),
                "review_reason": row.get("review_reason"),
                "next_action": row.get("next_action"),
                "source_type": row.get("source_type"),
                "relative_path": row.get("relative_path"),
                "summary_confidence": row.get("summary_confidence"),
                "text_quality": row.get("text_quality"),
                "candidate_status": row.get("candidate_status"),
            }
        )
    SITE_DATA.write_text(
        "window.SANBAO_REVIEW_DATA = "
        + json.dumps({"details": slim_details, "summaries": summaries}, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    # The capability-bid hall is the canonical multi-page workbench. Keep this
    # data feed for traceability without overwriting its stable entry route.
    if (ROOT / "site" / "capability-bid.html").exists():
        return
    SITE_PAGE.write_text(
        textwrap.dedent(
            """\
            <!doctype html>
            <html lang="zh-CN">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>三宝候选分拣</title>
              <link rel="stylesheet" href="./styles.css" />
              <link rel="stylesheet" href="./sanbao-review.css" />
            </head>
            <body>
              <main class="app">
                <header class="topbar">
                  <div>
                    <p class="eyebrow">三宝候选分拣</p>
                    <h1>先复核，再晋级</h1>
                  </div>
                  <div class="stats" id="stats"></div>
                </header>
                <section class="controls">
                  <label class="search"><span>搜索</span><input id="q" type="search" placeholder="搜索名称、责任、接收对象、复核原因..." /></label>
                  <label><span>主聚类</span><select id="primary"><option value="">全部主聚类</option></select></label>
                  <label><span>候选层级</span><select id="level"><option value="">全部层级</option></select></label>
                  <label><span>责任候选</span><select id="responsibility"><option value="">全部责任</option></select></label>
                  <label><span>状态</span><select id="status"><option value="">全部状态</option></select></label>
                </section>
                <section class="result-meta">
                  <span id="count"></span>
                  <span><a href="../sanbao_review_matrix.xlsx">打开分拣 Excel</a> · <a href="./clusters.html">探索聚类矩阵</a> · <a href="./index.html">返回 Skill 清单</a></span>
                </section>
                <section class="review-grid" id="results"></section>
              </main>
              <script src="./sanbao-review-data.js"></script>
              <script src="./sanbao-review.js"></script>
            </body>
            </html>
            """
        ),
        encoding="utf-8",
    )
    SITE_CSS.write_text(
        textwrap.dedent(
            """\
            .review-grid { display: grid; gap: 10px; }
            .review-card {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 8px;
              padding: 14px;
              display: grid;
              gap: 10px;
            }
            .review-card h2 { margin: 0; font-size: 16px; line-height: 1.3; overflow-wrap: anywhere; }
            .review-card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
            .summary-band {
              display: grid;
              grid-template-columns: repeat(5, minmax(0, 1fr));
              gap: 8px;
              margin-bottom: 12px;
            }
            .summary-box {
              background: var(--panel);
              border: 1px solid var(--line);
              border-radius: 8px;
              padding: 10px;
              color: var(--muted);
              font-size: 13px;
            }
            .summary-box strong { display: block; color: var(--text); font-size: 22px; }
            @media (max-width: 900px) { .summary-band { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (max-width: 560px) { .summary-band { grid-template-columns: 1fr; } }
            """
        ),
        encoding="utf-8",
    )
    SITE_APP.write_text(
        textwrap.dedent(
            """\
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
            """
        ),
        encoding="utf-8",
    )


def write_report(details: list[dict], summaries: list[dict]) -> None:
    REPORT.write_text(
        "# 三宝候选分拣报告\n\n"
        f"- 生成时间：{dt.datetime.now().astimezone().isoformat(timespec='seconds')}\n"
        f"- 明细记录数：{len(details)}\n"
        f"- 汇总候选池：{len(summaries)}\n"
        f"- Excel：`{XLSX}`\n"
        f"- 网站：`{SITE_PAGE}`\n\n"
        "## 分拣原则\n\n"
        "- `primary_cluster_key` 是单值互斥主聚类；技术方法、业务价值和适用对象只作为副标签。\n"
        "- `needs_review=true`、不可读文本、低置信、输出不清、涉及真实业务动作或敏感内容的记录，先进入待复核或阻塞状态。\n"
        "- 论文/方法型 skill 可以是方法候选或知识条目候选，不能直接视为已验证执行能力。\n"
        "- 数字员工候选必须后续补责任、权限、交付和失败处理；本轮不直接晋级数字员工。\n\n"
        "## 主聚类分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in Counter(r["primary_cluster_key"] for r in details).most_common())
        + "\n\n## 候选层级分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in Counter(r["sanbao_candidate_level"] for r in details).most_common())
        + "\n\n## 状态分布\n\n"
        + "\n".join(f"- {k}: {v}" for k, v in Counter(r["candidate_status"] for r in details).most_common())
        + "\n",
        encoding="utf-8",
    )


def main() -> int:
    rows = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    details = [classify(row) for row in rows]
    details.sort(
        key=lambda r: (
            PRIMARY_KEYS.index(r["primary_cluster_key"]) if r["primary_cluster_key"] in PRIMARY_KEYS else 99,
            r["sanbao_candidate_level"],
            r["sanbao_responsibility_candidate"],
            r["英文名称"].lower(),
        )
    )
    summaries = summarize(details)
    DETAIL_JSON.write_text(json.dumps(details, ensure_ascii=False, indent=2), encoding="utf-8")
    SUMMARY_JSON.write_text(json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(DETAIL_CSV, details, DETAIL_COLUMNS)
    write_csv(SUMMARY_CSV, summaries, SUMMARY_COLUMNS)
    write_xlsx(details, summaries)
    write_site(details, summaries)
    write_report(details, summaries)
    print(json.dumps({"details": len(details), "summary": len(summaries), "xlsx": str(XLSX), "site": str(SITE_PAGE)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
