#!/usr/bin/env python3
"""Build a business-facing Sanbao capability bid exhibit.

The source matrix is deliberately conservative. This pass keeps that discipline,
but rewrites the fields into business-readable language for a future capability
bidding process: what problem the skill may solve, what it needs, what it
delivers, who should review it, and whether it is ready to compete for a
capability position.
"""

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
INPUT_JSON = ROOT / "sanbao_review_matrix.json"
OUTPUT_JSON = ROOT / "capability_bid_matrix.json"
OUTPUT_CSV = ROOT / "capability_bid_matrix.csv"
OUTPUT_XLSX = ROOT / "capability_bid_matrix.xlsx"
SUMMARY_JSON = ROOT / "capability_bid_summary.json"
SUMMARY_CSV = ROOT / "capability_bid_summary.csv"
REPORT = ROOT / "CAPABILITY_BID_REPORT.md"
SITE_DATA = ROOT / "site" / "capability-bid-data.js"
SITE_PAGE = ROOT / "site" / "capability-bid.html"
SITE_APP = ROOT / "site" / "capability-bid.js"
SITE_CSS = ROOT / "site" / "capability-bid.css"


BLUEPRINT = {
    "VALUE_NEW_PRODUCT": ("价值创造", "新品经营", "把一个新机会从需求、论证、定义、验证推到可经营判断"),
    "VALUE_CONTINUOUS_OPERATION": ("价值创造", "持续经营", "围绕现有经营对象做供给、渠道、价格、内容、现金和结果联动调整"),
    "VALUE_NEW_MARKET": ("价值创造", "新市场经营", "判断新市场进入、本地化、准入、供给和经营成立条件"),
    "OPERATING_GOVERNANCE": ("经营治理", "责任与授权治理", "把责任、授权、方法生效、风险边界和复核机制讲清楚"),
    "CAPABILITY_KNOWLEDGE_METHOD": ("能力供给", "知识与方法", "把经验、论文、SOP、方法候选整理成可定位、可追溯的能力材料"),
    "CAPABILITY_DATA_SEMANTIC": ("能力供给", "数据与语义", "提供经营数据、质量说明、口径、对象关系和语义结构"),
    "CAPABILITY_TOOL_RUNTIME": ("能力供给", "工具与运行", "提供连接器、自动化、工程运行、测试部署和工具支持"),
    "GENERAL_SUPPORT": ("能力供给", "通用支持", "有复用价值，但还没定位到明确经营责任或验收对象"),
    "REVIEW_ONLY": ("待复核", "待补证池", "信息不够、边界不清或含敏感/授权风险，先不参加正式竞聘"),
    "OUT_OF_SCOPE": ("范围外", "非三宝候选", "与当前三宝经营网络没有明确关系，保留来源但不进入候选池"),
}

ZONE_ORDER = ["价值创造", "经营治理", "能力供给", "待复核", "范围外"]
LANE_ORDER = [
    "新品经营",
    "持续经营",
    "新市场经营",
    "责任与授权治理",
    "知识与方法",
    "数据与语义",
    "工具与运行",
    "通用支持",
    "待补证池",
    "非三宝候选",
]

BUSINESS_QUESTION_BY_LANE = {
    "新品经营": "这个 skill 能否帮助判断或推进一个新品经营事项？",
    "持续经营": "这个 skill 能否帮助现有经营对象做更好的联动调整？",
    "新市场经营": "这个 skill 能否帮助判断新市场进入是否成立？",
    "责任与授权治理": "这个 skill 能否把谁负责、谁验收、什么条件下能用讲清楚？",
    "知识与方法": "这个 skill 能否沉淀成可复用的方法、知识或作业候选？",
    "数据与语义": "这个 skill 能否提供可信数据、口径或对象关系？",
    "工具与运行": "这个 skill 能否稳定支撑某个工作流或工具调用？",
    "通用支持": "这个 skill 有用，但现在还没说清楚要服务哪个经营问题。",
    "待补证池": "这个 skill 信息还不够，先问清楚能不能用、怎么验收。",
    "非三宝候选": "这个 skill 暂不服务当前三宝经营网络。",
}

RESPONSIBILITY_HINTS = {
    "消费者需求洞察": "适合补齐需求证据、问题地图、VOC 或用户痛点判断。",
    "商业论证": "适合比较经营选项、投入风险、学习价值和成立条件。",
    "产品定义": "适合把需求和经营选择翻译成可验证的产品要求。",
    "产品实现": "适合产出方案、样品或实现说明，但不代表验证通过。",
    "产品验证": "适合形成带证据、范围和缺口的验证结论。",
    "上市经营策划": "适合组织目标客群、价值承诺、进入安排和经营验证。",
    "产品市场准入": "适合判断某个版本、市场、用途或宣称是否可进入。",
    "供给与交付准备": "适合判断供应、库存、履约、成本和承诺兑现条件。",
    "渠道发布与可售核验": "适合区分提交、渠道接受和实际可售状态。",
    "商品资料管理": "适合维护可追溯的商品资料包与事实依据。",
    "内容策划与表达": "适合把主张、资料和人群问题转成内容方案或素材。",
    "品牌定位与主张": "适合形成定位、核心主张和表达准则。",
    "定价与促销": "适合比较价格、促销、不行动基线和执行条件。",
    "经营经济性评估": "适合说明成本、贡献、现金影响和敏感条件。",
    "付费媒体投放与优化": "适合产出投放方案或优化反馈，但要先确认授权边界。",
    "经营实验与效果评估": "适合设计实验/观察方案，或给出有边界的效果判断。",
    "经营数据供给与质量保障": "适合提供经营数据、质量说明、异常影响和修复反馈。",
    "经营口径与对象关系治理": "适合维护口径、对象关系、标签和历史可追溯。",
    "经营知识整理与维护": "适合把经验、方法、知识条目做成可追溯候选。",
    "工具运行与工程支持": "适合支撑工具、API、连接器、部署、测试和运行保障。",
    "待人工判断": "还没定位到明确责任节点，需要人工看原文和证据。",
}


def clean(value: object, max_len: int = 320) -> str:
    return base.clean_inline(value, max_len=max_len)


def short(value: object, max_len: int = 140) -> str:
    return clean(value, max_len=max_len)


def safe_float(value: object) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def duplicate_counts(rows: list[dict]) -> Counter:
    return Counter(r.get("duplicate_group_key", "") for r in rows if r.get("duplicate_group_key"))


def blueprint_for(row: dict) -> tuple[str, str, str]:
    return BLUEPRINT.get(row.get("primary_cluster_key", ""), ("待复核", "待补证池", "需要人工判断分类"))


def bid_readiness(row: dict, dup_count: int) -> str:
    level = row.get("sanbao_candidate_level", "")
    status = row.get("candidate_status", "")
    primary = row.get("primary_cluster_key", "")
    confidence = safe_float(row.get("summary_confidence"))
    if primary == "OUT_OF_SCOPE" or status == "rejected":
        return "不参评"
    if primary == "REVIEW_ONLY" or level in ("REVIEW_ONLY", "FORMAL_CANDIDATE_BLOCKED") or status == "review":
        return "暂停竞聘"
    if (
        primary in ("GENERAL_SUPPORT", "CAPABILITY_TOOL_RUNTIME")
        or level == "SCENARIO_WORKFLOW_CANDIDATE"
        or row.get("source_type") == "icloud_paper_file_skill"
        or dup_count > 1
    ):
        return "可入围，需补证"
    if confidence >= 0.95 and row.get("text_quality") == "text" and not row.get("needs_review"):
        return "可竞聘"
    return "可入围，需补证"


def bid_stage(readiness: str) -> str:
    return {
        "可竞聘": "初筛通过",
        "可入围，需补证": "补证入围",
        "暂停竞聘": "待复核",
        "不参评": "排除",
    }.get(readiness, "待复核")


def merge_review_status(row: dict, dup_count: int) -> str:
    if row.get("primary_cluster_key") in ("REVIEW_ONLY", "OUT_OF_SCOPE") or row.get("candidate_status") == "review":
        return "待核验"
    if dup_count <= 1:
        return "保留变体"
    output = row.get("primary_output_contract", "") or row.get("关键输出", "")
    responsibility = row.get("sanbao_responsibility_candidate", "")
    if output and responsibility != "待人工判断":
        return "可合并"
    return "需拆分"


def business_problem(row: dict, lane: str) -> str:
    explicit = row.get("解决具体问题") or row.get("问题类型") or row.get("业务场景")
    if explicit and "待补" not in str(explicit):
        return short(explicit, 180)
    return BUSINESS_QUESTION_BY_LANE.get(lane, "它要解决的业务问题还需要人工确认。")


def why_business_cares(row: dict, zone: str, lane: str) -> str:
    value = row.get("业务价值")
    if value and "待补" not in str(value):
        return short(value, 180)
    if zone == "价值创造":
        return f"它可能帮助 {lane} 少走弯路：更早看清需求、投入、风险、交付条件或经营结果。"
    if zone == "经营治理":
        return "它可能帮助团队在使用能力前先讲清责任、授权、边界和验收，避免能力被误用。"
    if zone == "能力供给":
        return f"它可能作为 {lane} 的候选材料，支撑后续原子能力或小工作流竞聘。"
    if zone == "待复核":
        return "它可能有价值，但现在证据、边界或可读性不足，先不能当成正式能力。"
    return "暂不进入当前三宝能力竞聘池。"


def capability_position(row: dict, zone: str, lane: str) -> str:
    resp = row.get("sanbao_responsibility_candidate") or "待人工判断"
    target = row.get("receiving_object") or "验收对象待确认"
    if zone == "待复核":
        return f"待补证：{short(row.get('英文名称'), 46)}"
    if zone == "范围外":
        return f"不参评：{short(row.get('英文名称'), 46)}"
    return f"{lane} / {resp} / {target}"


def acceptance_evidence(row: dict) -> str:
    target = row.get("receiving_object") or "验收对象待确认"
    evidence = row.get("evidence_basis") or row.get("证据摘要") or ""
    boundary = row.get("boundary_or_not_when") or ""
    if row.get("candidate_status") == "review":
        return short(f"先补证：{row.get('review_reason') or boundary}", 240)
    if evidence:
        return short(f"验收看 {target} 是否真实产出，并核对：{evidence}", 260)
    return short(f"验收看 {target} 是否真实产出，并确认输入、输出、边界、版本和责任方。", 260)


def card_copy(row: dict, lane: str) -> str:
    purpose = row.get("用途总结") or row.get("一句话作用") or row.get("中文名称") or row.get("英文名称")
    problem = business_problem(row, lane)
    return short(f"{purpose} 它主要被拿来解决：{problem}", 300)


def next_business_action(row: dict, readiness: str, merge_status: str) -> str:
    if readiness == "可竞聘":
        return "安排责任节点初筛：看输入、输出、验收证据是否能对上一个真实经营事项。"
    if readiness == "可入围，需补证":
        return "先补一页竞聘材料：适用场景、输入样例、输出样例、失败边界和验收方式。"
    if readiness == "暂停竞聘":
        return "先复核原文、授权边界、敏感信息和输出是否清楚，再决定是否开放竞聘。"
    if merge_status == "可合并":
        return "可作为同一能力位置的重复候选，后续按证据质量和验收结果合并。"
    return "保留来源，不进入当前竞聘。"


def to_bid_row(row: dict, dup_counts: Counter) -> dict:
    zone, lane, lane_desc = blueprint_for(row)
    dup_count = dup_counts.get(row.get("duplicate_group_key", ""), 1)
    readiness = bid_readiness(row, dup_count)
    stage = bid_stage(readiness)
    merge_status = merge_review_status(row, dup_count)
    resp = row.get("sanbao_responsibility_candidate") or "待人工判断"
    out = {
        "skill_id": row.get("skill_id", ""),
        "英文名称": row.get("英文名称", ""),
        "中文名称": row.get("中文名称", ""),
        "一句话作用": row.get("一句话作用", ""),
        "用途总结": row.get("用途总结", ""),
        "蓝图大区": zone,
        "蓝图赛道": lane,
        "赛道说明": lane_desc,
        "能力竞聘位置": capability_position(row, zone, lane),
        "业务问题": business_problem(row, lane),
        "为什么业务要看": why_business_cares(row, zone, lane),
        "关键输入_人话版": short(row.get("primary_input_contract") or row.get("关键输入"), 260),
        "关键输出_人话版": short(row.get("primary_output_contract") or row.get("关键输出"), 260),
        "验收证据_人话版": acceptance_evidence(row),
        "责任候选": resp,
        "责任提示": RESPONSIBILITY_HINTS.get(resp, "需要人工判断责任归属。"),
        "接收对象": row.get("receiving_object", ""),
        "竞聘准备度": readiness,
        "竞聘阶段": stage,
        "合并复核状态": merge_status,
        "重复候选数": dup_count,
        "候选层级": row.get("sanbao_candidate_level", ""),
        "候选状态": row.get("candidate_status", ""),
        "证据置信度": row.get("summary_confidence", ""),
        "是否需要复核": row.get("needs_review", ""),
        "复核原因": row.get("review_reason", ""),
        "边界与不能直接使用的情况": short(row.get("boundary_or_not_when"), 260),
        "下一步业务动作": next_business_action(row, readiness, merge_status),
        "卡片文案": card_copy(row, lane),
        "源类型": row.get("source_type", ""),
        "来源路径": row.get("source_path", ""),
        "相对路径": row.get("relative_path", ""),
        "最新更新时间": row.get("latest_update") or row.get("最新更新时间", ""),
        "更新时间来源": row.get("date_source", ""),
        "正文质量": row.get("text_quality", ""),
        "脱敏状态": row.get("redaction_status", ""),
        "当前Codex状态": row.get("当前Codex状态", ""),
        "Codex运行时范围": row.get("Codex运行时范围", ""),
        "Codex来源层": row.get("Codex来源层", ""),
        "Codex分发来源": row.get("Codex分发来源", ""),
        "Codex版本": row.get("Codex版本", ""),
        "运行时核验时间": row.get("运行时核验时间", ""),
        "替代入口路径": row.get("替代入口路径", ""),
        "运行时业务提示": row.get("运行时业务提示", ""),
        "content_hash": row.get("content_hash", ""),
        "canonical_candidate_id": row.get("canonical_candidate_id", ""),
    }
    return out


DETAIL_COLUMNS = [
    "英文名称",
    "中文名称",
    "一句话作用",
    "用途总结",
    "蓝图大区",
    "蓝图赛道",
    "赛道说明",
    "能力竞聘位置",
    "业务问题",
    "为什么业务要看",
    "关键输入_人话版",
    "关键输出_人话版",
    "验收证据_人话版",
    "责任候选",
    "责任提示",
    "接收对象",
    "竞聘准备度",
    "竞聘阶段",
    "合并复核状态",
    "重复候选数",
    "候选层级",
    "候选状态",
    "证据置信度",
    "是否需要复核",
    "复核原因",
    "边界与不能直接使用的情况",
    "下一步业务动作",
    "卡片文案",
    "源类型",
    "来源路径",
    "相对路径",
    "最新更新时间",
    "更新时间来源",
    "正文质量",
    "脱敏状态",
    "当前Codex状态",
    "Codex运行时范围",
    "Codex来源层",
    "Codex分发来源",
    "Codex版本",
    "运行时核验时间",
    "替代入口路径",
    "运行时业务提示",
    "content_hash",
    "canonical_candidate_id",
    "skill_id",
]

SUMMARY_COLUMNS = [
    "蓝图大区",
    "蓝图赛道",
    "责任候选",
    "总数",
    "可竞聘",
    "可入围需补证",
    "暂停竞聘",
    "不参评",
    "可合并",
    "需拆分",
    "保留变体",
    "待核验",
    "代表性skill",
    "业务看点",
    "下一步",
]

FRONT_COLUMNS = [
    "英文名称",
    "中文名称",
    "蓝图大区",
    "蓝图赛道",
    "能力竞聘位置",
    "业务问题",
    "为什么业务要看",
    "关键输入_人话版",
    "关键输出_人话版",
    "验收证据_人话版",
    "责任候选",
    "接收对象",
    "竞聘准备度",
    "竞聘阶段",
    "当前Codex状态",
    "Codex来源层",
    "Codex版本",
    "运行时业务提示",
    "边界与不能直接使用的情况",
    "下一步业务动作",
    "卡片文案",
]

EVIDENCE_COLUMNS = [
    "英文名称",
    "蓝图大区",
    "蓝图赛道",
    "候选层级",
    "候选状态",
    "证据置信度",
    "是否需要复核",
    "复核原因",
    "正文质量",
    "脱敏状态",
    "当前Codex状态",
    "Codex运行时范围",
    "Codex来源层",
    "Codex分发来源",
    "Codex版本",
    "运行时核验时间",
    "替代入口路径",
    "运行时业务提示",
    "源类型",
    "来源路径",
    "相对路径",
    "最新更新时间",
    "更新时间来源",
    "content_hash",
    "canonical_candidate_id",
    "skill_id",
]

MERGE_COLUMNS = [
    "英文名称",
    "蓝图大区",
    "蓝图赛道",
    "能力竞聘位置",
    "责任候选",
    "接收对象",
    "合并复核状态",
    "重复候选数",
    "竞聘准备度",
    "关键输出_人话版",
    "边界与不能直接使用的情况",
    "canonical_candidate_id",
    "content_hash",
    "来源路径",
]


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in columns})


def summarize(rows: list[dict]) -> list[dict]:
    buckets: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for row in rows:
        buckets[(row["蓝图大区"], row["蓝图赛道"], row["责任候选"])].append(row)

    summaries = []
    for (zone, lane, resp), items in buckets.items():
        readiness = Counter(i["竞聘准备度"] for i in items)
        merge = Counter(i["合并复核状态"] for i in items)
        sorted_items = sorted(
            items,
            key=lambda r: (
                r["竞聘准备度"] not in ("可竞聘", "可入围，需补证"),
                -safe_float(r.get("证据置信度")),
                r["英文名称"].lower(),
            ),
        )
        business = BUSINESS_QUESTION_BY_LANE.get(lane, "")
        if resp in RESPONSIBILITY_HINTS:
            business = f"{business} {RESPONSIBILITY_HINTS[resp]}"
        summaries.append(
            {
                "蓝图大区": zone,
                "蓝图赛道": lane,
                "责任候选": resp,
                "总数": len(items),
                "可竞聘": readiness.get("可竞聘", 0),
                "可入围需补证": readiness.get("可入围，需补证", 0),
                "暂停竞聘": readiness.get("暂停竞聘", 0),
                "不参评": readiness.get("不参评", 0),
                "可合并": merge.get("可合并", 0),
                "需拆分": merge.get("需拆分", 0),
                "保留变体": merge.get("保留变体", 0),
                "待核验": merge.get("待核验", 0),
                "代表性skill": "；".join(i["英文名称"] for i in sorted_items[:8]),
                "业务看点": short(business, 320),
                "下一步": summary_next_action(zone, readiness),
            }
        )
    return sorted(
        summaries,
        key=lambda r: (
            ZONE_ORDER.index(r["蓝图大区"]) if r["蓝图大区"] in ZONE_ORDER else 99,
            LANE_ORDER.index(r["蓝图赛道"]) if r["蓝图赛道"] in LANE_ORDER else 99,
            -r["可竞聘"],
            -r["总数"],
            r["责任候选"],
        ),
    )


def summary_next_action(zone: str, readiness: Counter) -> str:
    if zone in ("待复核", "范围外"):
        return "先做人工复核或排除，不进入正式能力竞聘。"
    if readiness.get("可竞聘", 0):
        return "挑选代表样本进入能力竞聘初筛，补齐输入样例、输出样例和验收证据。"
    return "先补证，再判断是否开放竞聘。"


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
    overview_rows = [SUMMARY_COLUMNS] + [[r.get(c, "") for c in SUMMARY_COLUMNS] for r in summaries]
    front_rows = [FRONT_COLUMNS] + [[r.get(c, "") for c in FRONT_COLUMNS] for r in details]
    evidence_rows = [EVIDENCE_COLUMNS] + [[r.get(c, "") for c in EVIDENCE_COLUMNS] for r in details]
    merge_sorted = sorted(
        details,
        key=lambda r: (
            {"可合并": 0, "需拆分": 1, "保留变体": 2, "待核验": 3}.get(r.get("合并复核状态"), 9),
            -int(r.get("重复候选数") or 0),
            r.get("蓝图大区", ""),
            r.get("蓝图赛道", ""),
            r.get("英文名称", "").lower(),
        ),
    )
    merge_rows = [MERGE_COLUMNS] + [[r.get(c, "") for c in MERGE_COLUMNS] for r in merge_sorted]
    summary_rows = [SUMMARY_COLUMNS] + [[r.get(c, "") for c in SUMMARY_COLUMNS] for r in summaries]
    guide_rows = [
        ["说明项", "内容"],
        ["这张表是什么", "三宝 Skill 能力竞聘展陈表。它不是正式能力库，而是把扫到的 skill 改写成业务能读懂的候选材料。"],
        ["MECE 口径", "先按三宝蓝图分为价值创造、经营治理、能力供给、待复核、范围外；再落到新品经营、持续经营、新市场经营、责任治理、知识方法、数据语义、工具运行等赛道。"],
        ["竞聘准备度", "可竞聘=证据相对完整，可进入初筛；可入围需补证=方向有价值但材料不够；暂停竞聘=边界/授权/质量/敏感风险需先复核；不参评=暂不属于三宝能力池。"],
        ["当前 Codex", "当前可用只说明本机 Codex 能定位该入口；新纳入或原文更新的 Skill 仍须业务复核，不自动通过竞聘。已被替代的版本保留在历史资产中以便追溯。"],
        ["合并复核状态", "可合并、需拆分、保留变体、待核验是复核动作建议，不是最终组织决定。"],
        ["不能误读", "Preset、岗位 Bundle、数字员工是后续承接组合；这里的 skill 只是在竞争某个能力位置，不能直接等同正式岗位能力或授权。"],
        ["Sheet：展厅总览", "给业务负责人看。按三宝蓝图赛道汇总数量、准备度和下一步动作。"],
        ["Sheet：能力竞聘卡", "给业务和产品看。只放卡片正面字段：问题、输入、输出、验收、边界、下一步。"],
        ["Sheet：复核证据表", "给产品、架构和治理看。放来源、hash、置信度、正文质量、脱敏状态、复核原因。"],
        ["Sheet：合并拆分工作台", "给能力架构负责人看。处理可合并、需拆分、保留变体、待核验。"],
        ["Sheet：字段说明", "说明哪些是业务结论，哪些只是机器线索或待核验证据。"],
        ["生成时间", dt.datetime.now().isoformat(timespec="seconds")],
    ]
    with zipfile.ZipFile(OUTPUT_XLSX, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr(
            "[Content_Types].xml",
            """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet5.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>""",
        )
        z.writestr(
            "_rels/.rels",
            """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>""",
        )
        z.writestr(
            "xl/workbook.xml",
            """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
<sheet name="展厅总览" sheetId="1" r:id="rId1"/>
<sheet name="能力竞聘卡" sheetId="2" r:id="rId2"/>
<sheet name="复核证据表" sheetId="3" r:id="rId3"/>
<sheet name="合并拆分工作台" sheetId="4" r:id="rId4"/>
<sheet name="字段说明" sheetId="5" r:id="rId5"/>
</sheets></workbook>""",
        )
        z.writestr(
            "xl/_rels/workbook.xml.rels",
            """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>
<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet5.xml"/>
</Relationships>""",
        )
        z.writestr(
            "xl/worksheets/sheet1.xml",
            sheet_xml(overview_rows, [16, 18, 22, 10, 10, 14, 12, 10, 10, 10, 12, 10, 70, 70, 54]),
        )
        z.writestr(
            "xl/worksheets/sheet2.xml",
            sheet_xml(front_rows, [26, 28, 16, 18, 54, 46, 48, 48, 48, 54, 20, 28, 16, 16, 42, 38, 56]),
        )
        z.writestr(
            "xl/worksheets/sheet3.xml",
            sheet_xml(evidence_rows, [26, 16, 18, 24, 16, 12, 14, 42, 18, 18, 20, 54, 46, 18, 18, 26, 26, 18]),
        )
        z.writestr(
            "xl/worksheets/sheet4.xml",
            sheet_xml(merge_rows, [26, 16, 18, 54, 20, 28, 18, 12, 16, 48, 42, 26, 26, 54]),
        )
        z.writestr("xl/worksheets/sheet5.xml", sheet_xml(guide_rows, [26, 130]))


def write_site_data(details: list[dict], summaries: list[dict]) -> None:
    site_details = []
    for row in details:
        site_details.append(
            {
                "id": row.get("skill_id"),
                "name": row.get("英文名称"),
                "cn": row.get("中文名称"),
                "zone": row.get("蓝图大区"),
                "lane": row.get("蓝图赛道"),
                "position": row.get("能力竞聘位置"),
                "problem": row.get("业务问题"),
                "why": row.get("为什么业务要看"),
                "input": row.get("关键输入_人话版"),
                "output": row.get("关键输出_人话版"),
                "acceptance": row.get("验收证据_人话版"),
                "responsibility": row.get("责任候选"),
                "responsibilityHint": row.get("责任提示"),
                "receiver": row.get("接收对象"),
                "readiness": row.get("竞聘准备度"),
                "stage": row.get("竞聘阶段"),
                "merge": row.get("合并复核状态"),
                "duplicates": row.get("重复候选数"),
                "level": row.get("候选层级"),
                "confidence": row.get("证据置信度"),
                "reviewReason": row.get("复核原因"),
                "boundary": row.get("边界与不能直接使用的情况"),
                "next": row.get("下一步业务动作"),
                "copy": row.get("卡片文案"),
                "sourceType": row.get("源类型"),
                "path": row.get("相对路径") or row.get("来源路径"),
                "updated": row.get("最新更新时间"),
                "runtimeStatus": row.get("当前Codex状态"),
                "runtimeScope": row.get("Codex运行时范围"),
                "runtimeLayer": row.get("Codex来源层"),
                "runtimeVersion": row.get("Codex版本"),
                "runtimeNote": row.get("运行时业务提示"),
                "replacementPath": row.get("替代入口路径"),
            }
        )
    payload = {
        "generatedAt": dt.datetime.now().isoformat(timespec="seconds"),
        "details": site_details,
        "summaries": summaries,
        "zoneOrder": ZONE_ORDER,
        "laneOrder": LANE_ORDER,
    }
    SITE_DATA.write_text(
        "window.CAPABILITY_BID_DATA = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )


def write_site_files() -> None:
    # The interactive shell is now hand-authored as a multi-page single HTML
    # document. Data refreshes should not regress it to the older long-page
    # template embedded below.
    if SITE_PAGE.exists() and SITE_APP.exists() and SITE_CSS.exists():
        return
    SITE_PAGE.write_text(
        """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>三宝 Skill 能力竞聘展厅</title>
  <meta name="description" content="面向三宝蓝图的 Skill 候选能力竞聘展陈与复核工作台" />
  <link rel="stylesheet" href="./capability-bid.css" />
</head>
<body>
  <main class="shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">SANBAO CAPABILITY BID HALL</p>
        <h1>Skill 能力竞聘展厅</h1>
        <p class="lead">先看它解决什么业务问题，再看输入、输出、证据和边界。这里是候选展陈，不是正式任命。</p>
      </div>
      <div class="hero-panel" aria-label="三宝蓝图逻辑">
        <div class="blueprint-map">
          <span>价值创造</span>
          <span>经营治理</span>
          <span>能力供给</span>
          <i></i>
          <b>能力竞聘</b>
        </div>
      </div>
    </header>

    <section class="toolbar" aria-label="筛选">
      <label class="search"><span>搜索</span><input id="q" type="search" placeholder="搜索 skill、业务问题、责任节点、输出..." autocomplete="off" /></label>
      <label><span>蓝图大区</span><select id="zone"><option value="">全部大区</option></select></label>
      <label><span>赛道</span><select id="lane"><option value="">全部赛道</option></select></label>
      <label><span>准备度</span><select id="readiness"><option value="">全部准备度</option></select></label>
      <label><span>责任</span><select id="responsibility"><option value="">全部责任</option></select></label>
      <label><span>合并复核</span><select id="merge"><option value="">全部状态</option></select></label>
    </section>

    <section class="summary" id="summary"></section>

    <section class="workbench">
      <aside class="rail">
        <div class="rail-title">蓝图分类</div>
        <div id="laneNav" class="lane-nav"></div>
        <div class="download-box">
          <strong>表格</strong>
          <a href="../capability_bid_matrix.xlsx">能力竞聘 Excel</a>
          <a href="../sanbao_review_matrix.xlsx">保守复核底表</a>
          <a href="./index.html">原始 Skill 清单</a>
        </div>
      </aside>
      <section class="cards-panel">
        <div class="result-head">
          <div>
            <p class="eyebrow">当前结果</p>
            <h2 id="resultTitle">候选 Skill 卡片</h2>
          </div>
          <div id="count" class="count"></div>
        </div>
        <div id="cards" class="cards" aria-live="polite"></div>
      </section>
    </section>
  </main>
  <script src="./capability-bid-data.js"></script>
  <script src="./capability-bid.js"></script>
</body>
</html>
""",
        encoding="utf-8",
    )

    SITE_CSS.write_text(
        """*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f7f3ef;color:#2b2527;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;letter-spacing:0}.shell{width:min(1480px,calc(100% - 32px));margin:0 auto;padding:24px 0 36px}.hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(360px,.8fr);gap:18px;align-items:stretch;margin-bottom:16px}.hero-copy,.hero-panel,.toolbar,.summary-card,.rail,.cards-panel{border:1px solid #e0d8d3;background:#fffdfb;border-radius:8px;box-shadow:0 12px 28px rgba(66,45,38,.06)}.hero-copy{padding:28px}.eyebrow{margin:0 0 8px;color:#966b65;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{margin:0;color:#251f21;font-size:42px;line-height:1.04;font-weight:850}.lead{max-width:760px;margin:14px 0 0;color:#5d5353;font-size:16px;line-height:1.7}.hero-panel{padding:18px}.blueprint-map{position:relative;min-height:180px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:center}.blueprint-map span{height:118px;display:grid;place-items:center;border:1px solid #e5d9d0;border-radius:8px;background:linear-gradient(180deg,#fff,#f8eee9);font-weight:800;color:#44383b}.blueprint-map span:nth-child(2){background:linear-gradient(180deg,#fbfffd,#eef7f3);border-color:#d5e6de}.blueprint-map span:nth-child(3){background:linear-gradient(180deg,#fcfbff,#f0eff8);border-color:#dedcf0}.blueprint-map i{position:absolute;left:12%;right:12%;top:50%;height:2px;background:#c8907f;opacity:.55}.blueprint-map b{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:96px;height:96px;border-radius:50%;background:#33272a;color:#fff;font-size:14px;border:6px solid #fffdfb}.toolbar{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:minmax(280px,1.5fr) repeat(5,minmax(130px,1fr));gap:10px;padding:12px;margin-bottom:14px}.toolbar label{display:flex;flex-direction:column;gap:6px;min-width:0}.toolbar span{font-size:12px;color:#7e6d69;font-weight:700}.toolbar input,.toolbar select{height:38px;width:100%;border:1px solid #ddd2cd;border-radius:6px;background:#fff;color:#2b2527;padding:0 10px;font-size:14px}.toolbar input:focus,.toolbar select:focus{outline:2px solid #c8907f;outline-offset:1px}.summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:14px}.summary-card{padding:14px;min-height:98px}.summary-card strong{display:block;font-size:26px;line-height:1.1;color:#2a2224}.summary-card span{display:block;margin-top:6px;color:#65595a;font-size:13px;line-height:1.35}.workbench{display:grid;grid-template-columns:260px minmax(0,1fr);gap:14px;align-items:start}.rail{position:sticky;top:86px;padding:14px}.rail-title{font-size:13px;font-weight:850;color:#4d4242;margin-bottom:10px}.lane-nav{display:flex;flex-direction:column;gap:8px}.lane-button{border:1px solid #e2d8d4;background:#fff;border-radius:8px;padding:10px;text-align:left;cursor:pointer;color:#3c3334}.lane-button:hover,.lane-button.active{border-color:#bd7f6e;background:#fff6f1}.lane-button strong{display:block;font-size:13px}.lane-button span{display:block;margin-top:4px;color:#7a6e6d;font-size:12px}.download-box{margin-top:16px;padding:12px;border-radius:8px;background:#f7f1ec;border:1px solid #e3d7cf;display:grid;gap:7px}.download-box strong{font-size:13px}.download-box a{color:#7c4d44;text-decoration:none;font-size:13px}.download-box a:hover{text-decoration:underline}.cards-panel{padding:16px}.result-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.result-head h2{margin:0;font-size:24px}.count{font-size:13px;color:#736766;text-align:right;line-height:1.5}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid #e2d8d4;background:#fff;border-radius:8px;padding:14px;display:grid;gap:11px;min-height:330px}.card-head{display:flex;justify-content:space-between;gap:10px}.card h3{margin:0;font-size:16px;line-height:1.35;color:#2b2527}.badge{display:inline-flex;align-items:center;white-space:nowrap;height:25px;border-radius:999px;padding:0 9px;font-size:12px;font-weight:800;border:1px solid #ded4d0;background:#faf5f1;color:#6b514b}.badge.ready{background:#eef8f3;color:#2d6952;border-color:#cbe5d9}.badge.warn{background:#fff8df;color:#7a5d19;border-color:#eadc99}.badge.stop{background:#fff0ef;color:#9a493d;border-color:#edc6c0}.badge.out{background:#f1f1f1;color:#6a6766;border-color:#dedbd9}.meta{display:flex;flex-wrap:wrap;gap:6px}.pill{display:inline-flex;align-items:center;max-width:100%;min-height:24px;border-radius:6px;background:#f6f0eb;color:#5d5353;padding:4px 7px;font-size:12px;line-height:1.3}.section{display:grid;gap:5px}.section b{font-size:12px;color:#8c665d;text-transform:uppercase}.section p{margin:0;color:#473e3f;font-size:13px;line-height:1.55}.io{display:grid;grid-template-columns:1fr 1fr;gap:8px}.io .section{background:#fbf8f5;border:1px solid #e7ddd8;border-radius:8px;padding:9px}.footer{display:flex;justify-content:space-between;gap:10px;align-items:flex-end;border-top:1px solid #eee5df;padding-top:10px;color:#7a6d6b;font-size:12px}.path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:58%}.empty{padding:30px;border:1px dashed #d9ccc5;border-radius:8px;text-align:center;color:#766b69;background:#fffdfb}@media(max-width:1180px){.hero,.workbench{grid-template-columns:1fr}.rail{position:static}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.toolbar{grid-template-columns:1fr 1fr}.summary{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.shell{width:min(100% - 20px,1480px);padding-top:12px}.hero h1{font-size:32px}.cards{grid-template-columns:1fr}.toolbar{position:static;grid-template-columns:1fr}.summary{grid-template-columns:1fr}.io{grid-template-columns:1fr}.blueprint-map{grid-template-columns:1fr}.blueprint-map i,.blueprint-map b{display:none}.blueprint-map span{height:auto;min-height:64px}.result-head{display:block}.count{text-align:left;margin-top:8px}.path{max-width:100%}}""",
        encoding="utf-8",
    )

    SITE_APP.write_text(
        """const payload=window.CAPABILITY_BID_DATA||{details:[],summaries:[],zoneOrder:[],laneOrder:[]};const rows=payload.details||[];const $=id=>document.getElementById(id);const collator=new Intl.Collator("zh-CN");const controls=["q","zone","lane","readiness","responsibility","merge"].map($);function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function order(values,preferred){return[...new Set(values.filter(Boolean))].sort((a,b)=>{const ia=preferred.indexOf(a),ib=preferred.indexOf(b);return(ia<0?99:ia)-(ib<0?99:ib)||collator.compare(a,b)})}function fill(id,key,preferred=[]){const select=$(id);order(rows.map(r=>r[key]),preferred).forEach(value=>{const opt=document.createElement("option");opt.value=value;opt.textContent=value;select.appendChild(opt)})}function hay(r){return[r.name,r.cn,r.zone,r.lane,r.position,r.problem,r.why,r.input,r.output,r.acceptance,r.responsibility,r.receiver,r.readiness,r.merge,r.reviewReason,r.boundary,r.path].join(" ").toLowerCase()}function badgeClass(readiness){if(readiness==="可竞聘")return"ready";if(readiness==="可入围，需补证")return"warn";if(readiness==="不参评")return"out";return"stop"}function current(){const q=$("q").value.trim().toLowerCase();const zone=$("zone").value,lane=$("lane").value,readiness=$("readiness").value,responsibility=$("responsibility").value,merge=$("merge").value;return rows.filter(r=>(!q||hay(r).includes(q))&&(!zone||r.zone===zone)&&(!lane||r.lane===lane)&&(!readiness||r.readiness===readiness)&&(!responsibility||r.responsibility===responsibility)&&(!merge||r.merge===merge)).sort((a,b)=>{const ra={可竞聘:0,"可入围，需补证":1,暂停竞聘:2,不参评:3};return(ra[a.readiness]??9)-(ra[b.readiness]??9)||Number(b.confidence||0)-Number(a.confidence||0)||collator.compare(a.name||"",b.name||"")})}function counts(list){const c=(key,value)=>list.filter(r=>r[key]===value).length;$("summary").innerHTML=[["总候选",list.length,"当前筛选命中的 Skill"],["可竞聘",c("readiness","可竞聘"),"材料相对完整，可进入责任节点初筛"],["需补证",c("readiness","可入围，需补证"),"方向有价值，但输入输出或证据要补"],["暂停",c("readiness","暂停竞聘"),"质量、授权、敏感或边界问题未清"],["不参评",c("readiness","不参评"),"暂不进入三宝候选池"]].map(([label,num,desc])=>`<article class="summary-card"><strong>${num}</strong><span>${label}</span><span>${desc}</span></article>`).join("")}function laneNav(){const lanes=order(rows.map(r=>r.lane),payload.laneOrder||[]);$("laneNav").innerHTML=`<button class="lane-button active" data-lane=""><strong>全部赛道</strong><span>${rows.length} 个候选</span></button>`+lanes.map(l=>`<button class="lane-button" data-lane="${esc(l)}"><strong>${esc(l)}</strong><span>${rows.filter(r=>r.lane===l).length} 个候选</span></button>`).join("");$("laneNav").addEventListener("click",e=>{const btn=e.target.closest(".lane-button");if(!btn)return;$("lane").value=btn.dataset.lane;document.querySelectorAll(".lane-button").forEach(b=>b.classList.toggle("active",b===btn));render()})}function card(r){return`<article class="card"><div class="card-head"><h3>${esc(r.name)}</h3><span class="badge ${badgeClass(r.readiness)}">${esc(r.readiness)}</span></div><div class="meta"><span class="pill">${esc(r.zone)}</span><span class="pill">${esc(r.lane)}</span><span class="pill">${esc(r.responsibility)}</span><span class="pill">${esc(r.merge)}</span></div><div class="section"><b>竞聘位置</b><p>${esc(r.position)}</p></div><div class="section"><b>业务问题</b><p>${esc(r.problem)}</p></div><div class="section"><b>为什么要看</b><p>${esc(r.why)}</p></div><div class="io"><div class="section"><b>关键输入</b><p>${esc(r.input||"输入未写清，需补证。")}</p></div><div class="section"><b>关键输出</b><p>${esc(r.output||"输出未写清，需补证。")}</p></div></div><div class="section"><b>验收与边界</b><p>${esc(r.acceptance)}</p></div><div class="section"><b>下一步</b><p>${esc(r.next)}</p></div><div class="footer"><span>置信度 ${esc(r.confidence||"")}</span><span class="path" title="${esc(r.path)}">${esc(r.path)}</span></div></article>`}function render(){const list=current();counts(list);$("count").textContent=`显示 ${Math.min(list.length,240)} / 命中 ${list.length} / 总 ${rows.length}`;$("resultTitle").textContent=$("lane").value?`${$("lane").value} · 候选 Skill 卡片`:"候选 Skill 卡片";$("cards").innerHTML=list.slice(0,240).map(card).join("")||'<div class="empty">没有匹配结果。换一个筛选条件试试。</div>';document.querySelectorAll(".lane-button").forEach(b=>b.classList.toggle("active",b.dataset.lane===$("lane").value))}fill("zone","zone",payload.zoneOrder||[]);fill("lane","lane",payload.laneOrder||[]);fill("readiness","readiness",["可竞聘","可入围，需补证","暂停竞聘","不参评"]);fill("responsibility","responsibility");fill("merge","merge",["可合并","需拆分","保留变体","待核验"]);laneNav();controls.forEach(c=>c.addEventListener("input",render));render();""",
        encoding="utf-8",
    )


def write_report(details: list[dict], summaries: list[dict]) -> None:
    readiness = Counter(r["竞聘准备度"] for r in details)
    zones = Counter(r["蓝图大区"] for r in details)
    lanes = Counter(r["蓝图赛道"] for r in details)
    report = [
        "# 三宝 Skill 能力竞聘展厅生成报告",
        "",
        f"- 生成时间：{dt.datetime.now().isoformat(timespec='seconds')}",
        f"- 明细数量：{len(details)}",
        f"- 蓝图赛道汇总行：{len(summaries)}",
        f"- 输出 Excel：`{OUTPUT_XLSX}`",
        f"- 输出网页：`{SITE_PAGE}`",
        "",
        "## 竞聘准备度",
        "",
    ]
    for key in ["可竞聘", "可入围，需补证", "暂停竞聘", "不参评"]:
        report.append(f"- {key}: {readiness.get(key, 0)}")
    report.extend(["", "## 蓝图大区", ""])
    for key in ZONE_ORDER:
        report.append(f"- {key}: {zones.get(key, 0)}")
    report.extend(["", "## 赛道 Top 10", ""])
    for lane, count in lanes.most_common(10):
        report.append(f"- {lane}: {count}")
    report.extend(
        [
            "",
            "## 口径提醒",
            "",
            "- 这些 skill 只是能力竞聘候选，不是正式岗位、Preset、数字员工或业务授权。",
            "- `暂停竞聘` 不是否定价值，而是先要求补正文、输入输出、证据、授权边界或敏感信息复核。",
            "- `可竞聘` 只代表材料进入初筛，后续仍要由对应责任节点确认真实业务对象、验收证据和失败边界。",
        ]
    )
    REPORT.write_text("\n".join(report) + "\n", encoding="utf-8")


def main() -> None:
    source_rows = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    dup_counts = duplicate_counts(source_rows)
    details = [to_bid_row(row, dup_counts) for row in source_rows]
    details.sort(
        key=lambda r: (
            ZONE_ORDER.index(r["蓝图大区"]) if r["蓝图大区"] in ZONE_ORDER else 99,
            LANE_ORDER.index(r["蓝图赛道"]) if r["蓝图赛道"] in LANE_ORDER else 99,
            {"可竞聘": 0, "可入围，需补证": 1, "暂停竞聘": 2, "不参评": 3}.get(r["竞聘准备度"], 9),
            -safe_float(r.get("证据置信度")),
            r["英文名称"].lower(),
        )
    )
    summaries = summarize(details)

    OUTPUT_JSON.write_text(json.dumps(details, ensure_ascii=False, indent=2), encoding="utf-8")
    SUMMARY_JSON.write_text(json.dumps(summaries, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(OUTPUT_CSV, details, DETAIL_COLUMNS)
    write_csv(SUMMARY_CSV, summaries, SUMMARY_COLUMNS)
    write_xlsx(details, summaries)
    write_site_data(details, summaries)
    write_site_files()
    write_report(details, summaries)
    print(json.dumps({"rows": len(details), "summaries": len(summaries), "xlsx": str(OUTPUT_XLSX), "site": str(SITE_PAGE)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
