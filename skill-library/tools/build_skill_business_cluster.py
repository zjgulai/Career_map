#!/usr/bin/env python3
"""Create business-facing problem clusters and capability-package candidates.

This is intentionally a second axis beside the confirmed Sanbao blueprint.
The blueprint answers where a candidate may fit in the operating network;
this module answers the primary business problem it may help solve.  A skill
receives exactly one primary problem type so totals remain MECE.  The original
blueprint lane, readiness, source and evidence stay intact for review.
"""

from __future__ import annotations

from collections import Counter, defaultdict
import csv
import datetime as dt
import html
import json
from pathlib import Path
import re
import zipfile


ROOT = Path("/Users/lute/project/Career/skill-library")
INPUT = ROOT / "capability_bid_matrix.json"
DETAIL_JSON = ROOT / "skill_business_cluster_matrix.json"
DETAIL_CSV = ROOT / "skill_business_cluster_matrix.csv"
SUMMARY_JSON = ROOT / "skill_business_cluster_summary.json"
SUMMARY_CSV = ROOT / "skill_business_cluster_summary.csv"
PACKAGE_JSON = ROOT / "capability_package_summary.json"
PACKAGE_CSV = ROOT / "capability_package_summary.csv"
REPORT = ROOT / "CAPABILITY_PACKAGE_REPORT.md"
SITE_DATA = ROOT / "site" / "skill-cluster-data.js"
OUTPUT_DIR = ROOT / "outputs" / "2026-09-23-skill-cluster"
OUTPUT_XLSX = OUTPUT_DIR / "skill_business_cluster_matrix.xlsx"


PROBLEM_TYPES = [
    {
        "id": "P01",
        "name": "消费者与市场机会判断",
        "package_id": "B01",
        "package": "机会洞察与商业论证",
        "business_value": "更早看清目标人群、真实需求和外部机会，避免把内部猜测当成市场事实。",
        "question": "目标人群在什么情境下遇到什么问题，哪一个机会值得进入下一步？",
        "package_role": "提供需求、用户、市场或竞争线索，供后续商业取舍使用。",
        "keywords": [
            "消费者", "用户", "customer", "user", "需求", "voc", "voice of customer", "评论", "review", "评价",
            "人群", "persona", "痛点", "洞察", "insight", "访谈", "survey", "调研", "市场研究", "market research",
            "竞品", "competitor", "竞争情报", "使用场景", "场景洞察", "趋势洞察",
        ],
    },
    {
        "id": "P02",
        "name": "商业机会与投入取舍",
        "package_id": "B01",
        "package": "机会洞察与商业论证",
        "business_value": "把机会转成可比较的经营选项，帮助团队看清价值、投入、风险和学习价值。",
        "question": "这件事值不值得投入，什么条件下成立，先验证什么？",
        "package_role": "形成商业论证、机会优先级或情景比较，支持经营主责做取舍。",
        "keywords": [
            "商业论证", "business case", "市场规模", "market sizing", "机会评估", "机会优先级", "可行性", "feasibility",
            "roi", "投资回报", "利润", "贡献", "现金流", "现金影响", "成本效益", "经济性", "敏感性", "情景",
            "scenario", "投入", "预算", "盈利", "估值", "价值假设",
        ],
    },
    {
        "id": "P03",
        "name": "产品定义与方案设计",
        "package_id": "B02",
        "package": "新品定义、实现与验证",
        "business_value": "把用户问题和经营选择转成可验证的产品要求、概念或方案，减少返工和错配。",
        "question": "要为谁解决什么问题，产品方案和验收要求应该是什么？",
        "package_role": "把需求或机会翻译成产品概念、规格、要求或设计方案。",
        "keywords": [
            "产品定义", "产品设计", "industrial design", "产品概念", "概念设计", "concept", "prd", "需求规格",
            "requirement", "产品需求", "产品方案", "功能定义", "用户旅程", "user journey", "交互设计", "ui", "ux",
            "设计语言", "造型", "包装设计",
        ],
    },
    {
        "id": "P04",
        "name": "产品实现与质量验证",
        "package_id": "B02",
        "package": "新品定义、实现与验证",
        "business_value": "让方案能够被实现并被检验，明确已完成范围、质量证据、缺陷和未验证项。",
        "question": "这个方案能否按要求实现，并在明确条件下证明质量和安全？",
        "package_role": "支持工程实现、样品、测试、质量核验或缺陷闭环。",
        "keywords": [
            "工程", "engineering", "样品", "prototype", "原型", "测试", "test", "验证", "validation", "质量", "quality",
            "制造", "manufacturing", "生产", "production", "bom", "工艺", "供应商", "supplier", "可靠性", "缺陷",
            "检验", "实验室", "lab test",
        ],
    },
    {
        "id": "P05",
        "name": "市场准入与合规判断",
        "package_id": "B03",
        "package": "准入与上市准备",
        "business_value": "在进入市场和表达主张前识别适用条件、证据缺口和限制，减少不可售或违规风险。",
        "question": "某个产品版本、市场、用途或宣称是否满足进入和表达条件？",
        "package_role": "形成准入、认证、标签、宣称或合规风险判断。",
        "keywords": [
            "合规", "compliance", "法规", "regulatory", "认证", "certification", "准入", "ce ", "fda", "cpsia",
            "标签", "label", "宣称", "claim", "安全标准", "safety standard", "隐私", "privacy", "法律", "legal",
        ],
    },
    {
        "id": "P06",
        "name": "上市与新市场进入",
        "package_id": "B03",
        "package": "准入与上市准备",
        "business_value": "把新产品或新市场的目标、路径、成立条件和验证安排组织成可执行的上市准备。",
        "question": "怎样进入目标市场并形成实际可售，哪些条件必须先满足？",
        "package_role": "组织 GTM、渠道、市场进入、本地化、上市节奏或可售准备。",
        "keywords": [
            "gtm", "go-to-market", "上市", "launch", "新市场", "market entry", "市场进入", "本地化", "localization",
            "出海", "跨境", "渠道策略", "入驻", "marketplace", "可售", "上架", "渠道发布",
        ],
    },
    {
        "id": "P07",
        "name": "品牌、内容与转化表达",
        "package_id": "B04",
        "package": "品牌内容、获客与转化",
        "business_value": "让对的人理解产品价值并完成下一步行动，同时保持品牌、事实与表达边界一致。",
        "question": "如何把可兑现的价值主张变成面向目标受众的内容、商品表达和转化体验？",
        "package_role": "支持品牌定位、内容策划、商品表达、搜索发现或转化优化。",
        "keywords": [
            "品牌", "brand", "定位", "positioning", "内容", "content", "文案", "copy", "创意", "creative", "listing",
            "详情页", "product page", "seo", "关键词", "keyword", "搜索流量", "搜索引擎", "转化", "conversion",
            "cro", "邮件营销", "email marketing", "落地页", "landing page",
        ],
    },
    {
        "id": "P08",
        "name": "定价、促销与经营经济性",
        "package_id": "B05",
        "package": "定价、促销与经营经济性",
        "business_value": "比较价格、促销和不行动基线，说明对利润、现金和经营结果的影响。",
        "question": "该用什么价格或促销安排，经济上是否成立，风险和前提是什么？",
        "package_role": "支持定价、促销、组合、收入与经济性评估。",
        "keywords": [
            "定价", "pricing", "价格", "price", "促销", "promotion", "优惠", "discount", "折扣", "bundle", "组合",
            "营收", "revenue", "毛利", "margin", "贡献利润", "利润率", "unit economics", "价格弹性", "elasticity",
        ],
    },
    {
        "id": "P09",
        "name": "需求、供给与履约联动",
        "package_id": "B06",
        "package": "需求、供给与履约联动",
        "business_value": "把需求变化与库存、供给、承诺和交付条件一起判断，减少缺货、积压和失约。",
        "question": "需求变化后，供给、库存、履约和承诺怎样调整才可兑现？",
        "package_role": "支持预测、补货、库存、供应、物流、订单和履约协同。",
        "keywords": [
            "库存", "inventory", "供给", "supply", "补货", "replenishment", "物流", "logistics", "履约", "fulfillment",
            "仓储", "warehouse", "订单", "order", "发货", "shipment", "交付", "delivery", "供应链", "supply chain",
            "缺货", "oos", "在途", "采购", "procurement",
        ],
    },
    {
        "id": "P10",
        "name": "获客投放与增长优化",
        "package_id": "B04",
        "package": "品牌内容、获客与转化",
        "business_value": "把明确目标下的获客投入做成有边界的投放、实验和优化反馈，减少无效消耗。",
        "question": "在授权范围内，哪些获客动作能带来更好的增长或学习结果？",
        "package_role": "支持媒体投放、广告创意、活动运营、获客分析或增长实验。",
        "keywords": [
            "广告", "ad campaign", "投放", "media", "campaign", "paid", "增长", "growth", "获客", "acquisition",
            "roas", "ctr", "cpa", "facebook", "google ads", "tiktok", "utm", "再营销", "retargeting",
        ],
    },
    {
        "id": "P11",
        "name": "经营监测、诊断与实验",
        "package_id": "B07",
        "package": "经营监测、实验与优化",
        "business_value": "让经营团队区分事实、解释和预测，用可追溯证据发现问题、比较行动并验证效果。",
        "question": "经营结果为什么变化，应该验证什么，调整后有没有产生预期效果？",
        "package_role": "支持指标分析、预测、异常诊断、效果评估、实验和复盘。",
        "keywords": [
            "经营诊断", "performance", "指标", "metric", "kpi", "实验", "experiment", "a/b", "ab test", "归因",
            "attribution", "异常", "anomaly", "监控", "monitoring", "仪表盘", "dashboard", "预测", "forecast",
            "复盘", "诊断", "结构分析", "差异归因", "效果评估",
        ],
    },
    {
        "id": "P12",
        "name": "数据、口径与语义治理",
        "package_id": "B08",
        "package": "数据、口径与语义底座",
        "business_value": "让不同角色基于同一业务含义、可信来源和可追溯对象关系协作，减少口径冲突。",
        "question": "经营数据从哪里来、是否可信、业务含义和对象关系是否一致？",
        "package_role": "提供数据供给、质量保障、口径、标签、对象关系或语义结构。",
        "keywords": [
            "数据质量", "data quality", "数据治理", "data governance", "语义", "semantic", "ontology", "口径", "指标定义",
            "对象关系", "schema", "数据库", "database", "sql", "etl", "数据管道", "data pipeline", "metadata",
            "埋点", "tracking", "数据血缘", "lineage", "主数据", "mdm",
        ],
    },
    {
        "id": "P13",
        "name": "知识、方法与工作流沉淀",
        "package_id": "B09",
        "package": "知识、方法与工作流资产",
        "business_value": "把经验、研究和可复用作业方法整理成可定位、可验证、可维护的能力资产。",
        "question": "哪些经验或研究能被整理成可复用方法，如何说明适用范围和验证情况？",
        "package_role": "支持知识整理、研究提炼、SOP、方法候选、培训或工作流资产。",
        "keywords": [
            "知识", "knowledge", "论文", "paper", "研究", "research", "sop", "方法", "method", "流程", "workflow",
            "指南", "guide", "教程", "tutorial", "学习", "training", "最佳实践", "best practice", "知识库", "playbook",
        ],
    },
    {
        "id": "P14",
        "name": "工具、自动化与运行保障",
        "package_id": "B10",
        "package": "工具、自动化与运行保障",
        "business_value": "让已确认的工作能够稳定调用工具、自动化执行、测试、部署和恢复，而不是靠手工临时拼接。",
        "question": "怎样让一个已明确的工作流可靠运行，并在失败时可诊断、可恢复？",
        "package_role": "支持 API、MCP、连接器、代码、自动化、测试、部署和运行维护。",
        "keywords": [
            "mcp", "api", "plugin", "插件", "connector", "连接器", "工具调用", "自动化", "automation", "runtime",
            "cli", "部署", "deploy", "deployment", "代码", "coding", "python", "node", "typescript", "git", "playwright",
            "browser", "测试框架", "ci/cd", "webhook", "agent 开发", "agent development",
        ],
    },
    {
        "id": "P15",
        "name": "责任、授权与风险治理",
        "package_id": "B11",
        "package": "责任、授权与风险治理",
        "business_value": "把责任、权限、前提、审查和风险边界讲清楚，避免能力看似可用却被越界使用。",
        "question": "谁可在什么前提下做什么，如何复核风险、证据和例外？",
        "package_role": "支持责任分工、授权、审计、策略、安全、风险和复核机制。",
        "keywords": [
            "授权", "权限", "责任", "governance", "治理", "policy", "审计", "audit", "风险", "risk", "审批",
            "review", "安全", "security", "合规审查", "访问控制", "access control", "rbac", "隐私", "privacy",
        ],
    },
    {
        "id": "P16",
        "name": "待提炼的研究或通用素材",
        "package_id": "B12",
        "package": "待提炼或暂不参评",
        "business_value": "保留可能有价值的素材，但在业务问题、输入输出或适用边界未清之前不进入正式能力竞聘。",
        "question": "这份素材究竟能解决什么业务问题，需补哪些证据才能参与竞聘？",
        "package_role": "进入提炼和补证队列，暂不承担经营交付。",
        "keywords": [],
    },
    {
        "id": "P17",
        "name": "暂不属于三宝经营网络",
        "package_id": "B12",
        "package": "待提炼或暂不参评",
        "business_value": "保留来源可追溯性，不把当前无明确经营关系的材料误放入能力候选池。",
        "question": "它是否与当前三宝经营网络有关，若有关需要补充怎样的连接证据？",
        "package_role": "保留来源，不进入当前能力包竞聘。",
        "keywords": [],
    },
]

TYPE_BY_ID = {item["id"]: item for item in PROBLEM_TYPES}
PACKAGE_ORDER = [f"B{i:02d}" for i in range(1, 13)]
PACKAGE_META = {
    "B01": ("机会洞察与商业论证", "机会到投入取舍", "先把需求、市场与商业成立条件说清楚。"),
    "B02": ("新品定义、实现与验证", "需求到可验证产品", "把机会转成可验证的产品要求、方案和质量结论。"),
    "B03": ("准入与上市准备", "产品到可进入市场", "把适用市场、准入要求、上市路径和可售条件连起来。"),
    "B04": ("品牌内容、获客与转化", "价值主张到用户行动", "用可信表达、内容和投放让目标人群理解并行动。"),
    "B05": ("定价、促销与经营经济性", "价格动作到经济结果", "比较价格和促销安排，说明利润、现金和执行前提。"),
    "B06": ("需求、供给与履约联动", "需求变化到兑现条件", "把需求、库存、供给和履约作为同一经营问题看。"),
    "B07": ("经营监测、实验与优化", "结果变化到可验证调整", "基于事实、解释和预测组织诊断、实验和复盘。"),
    "B08": ("数据、口径与语义底座", "业务事实到可协作数据", "提供可信的数据、口径和对象关系，服务多角色协作。"),
    "B09": ("知识、方法与工作流资产", "经验到可复用方法", "把研究、经验和 SOP 整理为有适用范围的能力材料。"),
    "B10": ("工具、自动化与运行保障", "已确认方法到稳定运行", "让工具调用、自动化、测试和部署具备可维护性。"),
    "B11": ("责任、授权与风险治理", "能力使用到受控行动", "把责任、权限、审查和风险边界留在业务动作之前。"),
    "B12": ("待提炼或暂不参评", "素材到明确业务连接", "处理业务连接尚未证实或暂不相关的来源材料。"),
}

FALLBACK_BY_CLUSTER = {
    "VALUE_NEW_PRODUCT": "P03",
    "VALUE_CONTINUOUS_OPERATION": "P11",
    "VALUE_NEW_MARKET": "P06",
    "OPERATING_GOVERNANCE": "P15",
    "CAPABILITY_KNOWLEDGE_METHOD": "P13",
    "CAPABILITY_DATA_SEMANTIC": "P12",
    "CAPABILITY_TOOL_RUNTIME": "P14",
    "GENERAL_SUPPORT": "P16",
    "REVIEW_ONLY": "P16",
    "OUT_OF_SCOPE": "P17",
}

DETAIL_COLUMNS = [
    "英文名称", "中文名称", "业务价值聚类", "蓝图大区", "蓝图赛道", "问题类型", "问题类型业务问题",
    "能力包候选", "能力包内作用", "聚类把握", "聚类依据", "竞聘准备度", "责任候选", "能力竞聘位置",
    "关键输入", "关键输出", "验收证据", "不能直接使用的情况", "合并复核状态", "重复候选数", "来源类型",
    "最新更新时间", "来源路径", "skill_id",
]
SUMMARY_COLUMNS = [
    "问题类型", "能力包候选", "业务价值", "核心业务问题", "总数", "可竞聘", "可入围需补证", "暂停竞聘",
    "不参评", "高把握", "中把握", "需补证", "代表性skill", "下一步业务动作",
]
PACKAGE_COLUMNS = [
    "能力包编号", "能力包候选", "服务业务结果", "能力包定位", "覆盖问题类型", "总数", "可竞聘", "可入围需补证",
    "暂停竞聘", "不参评", "推荐先看", "候选边界", "代表性skill", "下一步业务动作",
]


def clean(value: object, limit: int = 260) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    return text if len(text) <= limit else f"{text[:limit - 1].rstrip()}…"


def score_types(text: str) -> tuple[str, list[str], int, int]:
    lowered = text.lower()
    ranked = []
    for item in PROBLEM_TYPES[:15]:
        matches = [term for term in item["keywords"] if term.lower() in lowered]
        score = sum(2 if len(term) >= 7 else 1 for term in matches)
        ranked.append((score, item["id"], matches))
    ranked.sort(key=lambda value: (value[0], value[1]), reverse=True)
    best_score, best_id, matches = ranked[0]
    second_score = ranked[1][0]
    return best_id, matches[:6], best_score, second_score


def classify(row: dict) -> dict:
    cluster_key = row.get("候选层级", "")
    source_cluster = row.get("蓝图赛道", "")
    text = " ".join(
        clean(row.get(field), 1800)
        for field in ("英文名称", "中文名称", "一句话作用", "用途总结", "业务问题", "关键输入_人话版", "关键输出_人话版")
    )
    type_id, matches, score, second_score = score_types(text)
    if row.get("蓝图大区") == "范围外":
        type_id, matches, score, second_score = "P17", [], 0, 0
    elif score < 2:
        type_id = FALLBACK_BY_CLUSTER.get(row.get("候选层级"), "")
        # The candidate-level field does not carry the original semantic cluster.
        lane_fallbacks = {
            "新品经营": "P03", "持续经营": "P11", "新市场经营": "P06", "责任与授权治理": "P15",
            "知识与方法": "P13", "数据与语义": "P12", "工具与运行": "P14", "通用支持": "P16",
            "待补证池": "P16", "非三宝候选": "P17",
        }
        type_id = lane_fallbacks.get(source_cluster, type_id or "P16")
    item = TYPE_BY_ID[type_id]
    if type_id in ("P16", "P17"):
        confidence = "需补证"
        basis = "现有材料尚不足以稳定定位到具体经营问题。"
    elif score >= 5 and score - second_score >= 2:
        confidence = "高把握"
        basis = f"名称或用途中出现：{'、'.join(matches)}。"
    elif score >= 2:
        confidence = "中把握"
        basis = f"名称或用途中出现：{'、'.join(matches)}；仍应以实际输入输出复核。"
    else:
        confidence = "需补证"
        basis = "按已确认蓝图赛道暂作归类，尚需补充具体问题、输入输出或样例。"

    value_cluster = {
        "价值创造": "直接服务经营结果",
        "经营治理": "保障经营协作可信可控",
        "能力供给": "沉淀可复用的能力底座",
        "待复核": "待确认的能力素材",
        "范围外": "当前不纳入三宝经营网络",
    }.get(row.get("蓝图大区"), "待确认")
    return {
        "业务价值聚类": value_cluster,
        "问题类型": item["name"],
        "问题类型业务问题": item["question"],
        "问题类型业务价值": item["business_value"],
        "能力包编号": item["package_id"],
        "能力包候选": item["package"],
        "能力包内作用": item["package_role"],
        "聚类把握": confidence,
        "聚类依据": basis,
    }


def readiness_counts(items: list[dict]) -> Counter:
    return Counter(item.get("竞聘准备度", "") for item in items)


def representative(items: list[dict], limit: int = 6) -> str:
    order = {"可竞聘": 0, "可入围，需补证": 1, "暂停竞聘": 2, "不参评": 3}
    sorted_items = sorted(
        items,
        key=lambda item: (order.get(item.get("竞聘准备度"), 9), -float(item.get("证据置信度") or 0), item.get("英文名称", "").lower()),
    )
    return "；".join(clean(item.get("英文名称"), 48) for item in sorted_items[:limit])


def next_action(items: list[dict], type_id: str) -> str:
    readiness = readiness_counts(items)
    if type_id in ("P16", "P17"):
        return "先补业务连接、输入输出与验收样例；未补齐前不进入正式能力竞聘。"
    if readiness.get("可竞聘", 0):
        return "挑 3-5 个代表候选做责任节点初筛，核对真实事项、输入样例、输出样例和验收证据。"
    return "先选择代表候选补齐适用边界、输入输出和失败情形，再决定是否进入初筛。"


def problem_summaries(rows: list[dict]) -> list[dict]:
    buckets: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        buckets[row["_problem_id"]].append(row)
    output = []
    for item in PROBLEM_TYPES:
        items = buckets.get(item["id"], [])
        readiness = readiness_counts(items)
        confidence = Counter(row["聚类把握"] for row in items)
        output.append({
            "问题类型": item["name"],
            "能力包候选": item["package"],
            "业务价值": item["business_value"],
            "核心业务问题": item["question"],
            "总数": len(items),
            "可竞聘": readiness.get("可竞聘", 0),
            "可入围需补证": readiness.get("可入围，需补证", 0),
            "暂停竞聘": readiness.get("暂停竞聘", 0),
            "不参评": readiness.get("不参评", 0),
            "高把握": confidence.get("高把握", 0),
            "中把握": confidence.get("中把握", 0),
            "需补证": confidence.get("需补证", 0),
            "代表性skill": representative(items),
            "下一步业务动作": next_action(items, item["id"]),
            "_problem_id": item["id"],
        })
    return output


def package_summaries(rows: list[dict], problems: list[dict]) -> list[dict]:
    buckets: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        buckets[row["能力包编号"]].append(row)
    output = []
    for package_id in PACKAGE_ORDER:
        name, result, position = PACKAGE_META[package_id]
        items = buckets.get(package_id, [])
        readiness = readiness_counts(items)
        covered = [summary["问题类型"] for summary in problems if TYPE_BY_ID[summary["_problem_id"]]["package_id"] == package_id]
        candidate_problems = [summary for summary in problems if TYPE_BY_ID[summary["_problem_id"]]["package_id"] == package_id and summary["可竞聘"] + summary["可入围需补证"]]
        recommended = "；".join(summary["问题类型"] for summary in candidate_problems[:3]) or "先梳理业务连接和最小可验证交付。"
        output.append({
            "能力包编号": package_id,
            "能力包候选": name,
            "服务业务结果": result,
            "能力包定位": position,
            "覆盖问题类型": "；".join(covered),
            "总数": len(items),
            "可竞聘": readiness.get("可竞聘", 0),
            "可入围需补证": readiness.get("可入围，需补证", 0),
            "暂停竞聘": readiness.get("暂停竞聘", 0),
            "不参评": readiness.get("不参评", 0),
            "推荐先看": recommended,
            "候选边界": "这是竞聘组合候选，不等同正式岗位、Preset、数字员工或业务授权。",
            "代表性skill": representative(items),
            "下一步业务动作": next_action(items, "P16" if package_id == "B12" else "P01"),
        })
    return output


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({column: row.get(column, "") for column in columns})


def excel_col_name(index: int) -> str:
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def xlsx_cell(value: object, row_number: int, column_number: int, style: int = 0) -> str:
    ref = f"{excel_col_name(column_number)}{row_number}"
    text = html.escape(str(value or ""), quote=False)
    style_attr = f' s="{style}"' if style else ""
    return f'<c r="{ref}" t="inlineStr"{style_attr}><is><t xml:space="preserve">{text}</t></is></c>'


def xlsx_sheet_xml(rows: list[list[object]], widths: list[int]) -> str:
    body = []
    for row_number, values in enumerate(rows, start=1):
        cells = "".join(
            xlsx_cell(value, row_number, column_number, style=1 if row_number == 1 else 0)
            for column_number, value in enumerate(values, start=1)
        )
        body.append(f'<row r="{row_number}">{cells}</row>')
    columns = "".join(
        f'<col min="{index}" max="{index}" width="{width}" customWidth="1"/>'
        for index, width in enumerate(widths, start=1)
    )
    last_column = excel_col_name(len(widths))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" '
        'activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        f'<cols>{columns}</cols><sheetData>{"".join(body)}</sheetData>'
        f'<autoFilter ref="A1:{last_column}{max(1, len(rows))}"/>'
        '</worksheet>'
    )


def write_xlsx(rows: list[dict], problems: list[dict], packages: list[dict]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    candidate_rows = [row for row in rows if row["竞聘准备度"] in ("可竞聘", "可入围，需补证")]
    guide_rows = [
        ["说明项", "内容"],
        ["这张表是什么", "三宝 Skill 的业务问题聚类与能力包候选表。它把技能放进能被业务理解和评审的问题框架。"],
        ["全量范围", f"共 {len(rows)} 条。全量明细在“全量 Skill 聚类”，可按任何字段筛选。"],
        ["MECE 口径", "每个 Skill 只有一个主问题类型，保证数量不重复；蓝图赛道、责任候选和竞聘准备度是并列的观察维度。"],
        ["蓝图与问题的区别", "蓝图大区/赛道回答它在三宝经营网络的哪里；问题类型回答它服务什么业务问题；能力包候选回答哪些类型可一起参与后续能力竞聘。"],
        ["能力包边界", "能力包候选不是岗位、Preset、数字员工或业务授权。它只是后续组合和竞聘评审的工作单元。"],
        ["聚类把握", "高把握：存在清晰业务语义；中把握：存在相关线索但应核对输入输出；需补证：只可暂作归类，未进入正式判断。"],
        ["竞聘候选池", "只放可竞聘和可入围、需补证的 Skill，方便责任节点先做小范围初筛。暂停竞聘和不参评项目仍完整保留在全量明细。"],
        ["复核原则", "同名不自动合并，异名不自动拆分。最终以真实业务事项、输入输出、边界和验收证据为准。"],
        ["生成时间", dt.datetime.now().isoformat(timespec="seconds")],
    ]
    sheets = [
        ("能力包总览", [PACKAGE_COLUMNS] + [[row.get(column, "") for column in PACKAGE_COLUMNS] for row in packages], [12, 26, 22, 34, 44, 10, 10, 10, 10, 10, 32, 46, 50, 46]),
        ("问题类型矩阵", [SUMMARY_COLUMNS] + [[row.get(column, "") for column in SUMMARY_COLUMNS] for row in problems], [28, 26, 42, 44, 10, 10, 10, 10, 10, 10, 10, 10, 52, 46]),
        ("竞聘候选池", [DETAIL_COLUMNS] + [[row.get(column, "") for column in DETAIL_COLUMNS] for row in candidate_rows], [30, 28, 20, 16, 18, 28, 44, 28, 42, 12, 44, 16, 22, 40, 46, 46, 46, 46, 16, 12, 20, 18, 72, 18]),
        ("全量 Skill 聚类", [DETAIL_COLUMNS] + [[row.get(column, "") for column in DETAIL_COLUMNS] for row in rows], [30, 28, 20, 16, 18, 28, 44, 28, 42, 12, 44, 16, 22, 40, 46, 46, 46, 46, 16, 12, 20, 18, 72, 18]),
        ("字段说明", guide_rows, [26, 120]),
    ]
    content_overrides = "".join(
        f'<Override PartName="/xl/worksheets/sheet{index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for index in range(1, len(sheets) + 1)
    )
    sheet_nodes = "".join(
        f'<sheet name="{name}" sheetId="{index}" r:id="rId{index}"/>'
        for index, (name, _, _) in enumerate(sheets, start=1)
    )
    worksheet_relationships = "".join(
        f'<Relationship Id="rId{index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{index}.xml"/>'
        for index in range(1, len(sheets) + 1)
    )
    styles = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF33272A"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs>
</styleSheet>'''
    with zipfile.ZipFile(OUTPUT_XLSX, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            f'{content_overrides}</Types>',
        )
        archive.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            '</Relationships>',
        )
        archive.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<sheets>{sheet_nodes}</sheets></workbook>',
        )
        archive.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            f'{worksheet_relationships}'
            f'<Relationship Id="rId{len(sheets) + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            '</Relationships>',
        )
        archive.writestr("xl/styles.xml", styles)
        for index, (_, sheet_rows, widths) in enumerate(sheets, start=1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", xlsx_sheet_xml(sheet_rows, widths))


def write_report(rows: list[dict], problems: list[dict], packages: list[dict]) -> None:
    lines = [
        "# Skill 业务问题聚类与能力包报告",
        "",
        f"- 生成时间：{dt.datetime.now().isoformat(timespec='seconds')}",
        f"- 全量 Skill：{len(rows)}",
        f"- 问题类型：{len(problems)} 个，严格单选，供 MECE 统计使用",
        f"- 能力包候选：{len(packages)} 个，供后续竞聘与工作流组合使用",
        "",
        "## 读法",
        "",
        "- 蓝图大区/赛道回答它位于三宝经营网络的哪里。",
        "- 问题类型回答它主要帮助业务解决什么问题，每个 Skill 只计入一个主类型。",
        "- 能力包候选回答哪些问题类型可以一起被评审和组合；它不是岗位、Preset、数字员工或行动授权。",
        "",
        "## 能力包分布",
        "",
    ]
    for package in packages:
        lines.append(f"- {package['能力包编号']} {package['能力包候选']}：{package['总数']} 条，其中可竞聘 {package['可竞聘']}，需补证 {package['可入围需补证']}。")
    lines.extend(["", "## 归类把握", ""])
    confidence = Counter(row["聚类把握"] for row in rows)
    for key in ("高把握", "中把握", "需补证"):
        lines.append(f"- {key}：{confidence.get(key, 0)}")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_site_data(rows: list[dict], problems: list[dict], packages: list[dict]) -> None:
    by_skill_id = {}
    for row in rows:
        by_skill_id[row["skill_id"]] = {
            "valueCluster": row["业务价值聚类"],
            "problemType": row["问题类型"],
            "problemQuestion": row["问题类型业务问题"],
            "problemValue": row["问题类型业务价值"],
            "packageId": row["能力包编号"],
            "capabilityPackage": row["能力包候选"],
            "packageRole": row["能力包内作用"],
            "clusterConfidence": row["聚类把握"],
            "clusterBasis": row["聚类依据"],
        }
    payload = {
        "generatedAt": dt.datetime.now().isoformat(timespec="seconds"),
        "bySkillId": by_skill_id,
        "problemTypes": [{key: value for key, value in row.items() if not key.startswith("_")} for row in problems],
        "packages": packages,
        "problemOrder": [item["name"] for item in PROBLEM_TYPES],
        "packageOrder": [PACKAGE_META[package_id][0] for package_id in PACKAGE_ORDER],
        "excelPath": "../outputs/2026-09-23-skill-cluster/skill_business_cluster_matrix.xlsx",
    }
    SITE_DATA.write_text(f"window.SKILL_CLUSTER_DATA = {json.dumps(payload, ensure_ascii=False, separators=(',', ':'))};\n", encoding="utf-8")


def main() -> None:
    source_rows = json.loads(INPUT.read_text(encoding="utf-8"))
    rows = []
    for source in source_rows:
        cluster = classify(source)
        row = {
            "英文名称": source.get("英文名称", ""),
            "中文名称": source.get("中文名称", ""),
            "蓝图大区": source.get("蓝图大区", ""),
            "蓝图赛道": source.get("蓝图赛道", ""),
            "竞聘准备度": source.get("竞聘准备度", ""),
            "责任候选": source.get("责任候选", ""),
            "能力竞聘位置": source.get("能力竞聘位置", ""),
            "关键输入": clean(source.get("关键输入_人话版"), 320),
            "关键输出": clean(source.get("关键输出_人话版"), 320),
            "验收证据": clean(source.get("验收证据_人话版"), 320),
            "不能直接使用的情况": clean(source.get("边界与不能直接使用的情况"), 320),
            "合并复核状态": source.get("合并复核状态", ""),
            "重复候选数": source.get("重复候选数", 0),
            "来源类型": source.get("源类型", ""),
            "当前Codex状态": source.get("当前Codex状态", ""),
            "Codex来源层": source.get("Codex来源层", ""),
            "最新更新时间": source.get("最新更新时间", ""),
            "来源路径": source.get("来源路径", ""),
            "skill_id": source.get("skill_id", ""),
            "证据置信度": source.get("证据置信度", 0),
            **cluster,
            "_problem_id": next(key for key, value in TYPE_BY_ID.items() if value["name"] == cluster["问题类型"]),
        }
        rows.append(row)
    rows.sort(key=lambda row: (row["能力包编号"], row["问题类型"], {"可竞聘": 0, "可入围，需补证": 1, "暂停竞聘": 2, "不参评": 3}.get(row["竞聘准备度"], 9), row["英文名称"].lower()))
    problems = problem_summaries(rows)
    packages = package_summaries(rows, problems)
    DETAIL_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    SUMMARY_JSON.write_text(json.dumps([{key: value for key, value in row.items() if not key.startswith("_")} for row in problems], ensure_ascii=False, indent=2), encoding="utf-8")
    PACKAGE_JSON.write_text(json.dumps(packages, ensure_ascii=False, indent=2), encoding="utf-8")
    write_csv(DETAIL_CSV, rows, DETAIL_COLUMNS)
    write_csv(SUMMARY_CSV, problems, SUMMARY_COLUMNS)
    write_csv(PACKAGE_CSV, packages, PACKAGE_COLUMNS)
    write_xlsx(rows, problems, packages)
    write_site_data(rows, problems, packages)
    write_report(rows, problems, packages)
    print(json.dumps({"rows": len(rows), "problemTypes": len(problems), "packages": len(packages), "xlsx": str(OUTPUT_XLSX)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
