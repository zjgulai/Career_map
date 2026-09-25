---
name: "p2s-decision-audit-trail-ontology"
title: "AI决策审计追踪本体 — 供应链自动化决策的完整记录、回溯与合规证明"
description: "触发词：审计追踪、决策留痕、哈希链、五要素记录、回溯查询、合规证明。何时不用：要判断某个 AI 结论该不该信时用「LLM 输出不确定性量化」，只追数据来源链条时用数据血缘追踪类技能。安全边界：审计记录 append-only 不得改删，供应商与金额等敏感字段按内部权限访问，不对外披露。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-123"
l3_business: "证据复核"
l3_all: "证据复核 / 溯源监测"
l1_l2_l3: "独立控制/经营与组织/证据复核"
p2s_card_id: "Skill-Decision-Audit-Trail-Ontology"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 AI 自动下的每一笔决策按谁、做了什么、为什么、怎么做的记成改不了的账，审计来了当场就能查。"
user_try: "试试：给采购 Agent 的自动补货决策上一套哈希链审计追踪，能按 SKU 回溯每次下单的触发标签与算法版本。"
whenToUse: "AI Agent 会自主执行补货、调价等动作、需要事后证明决策合规可追溯时用；只判断 AI 输出是否可信时用「LLM 输出不确定性量化」；只追数据来源链条时用数据血缘追踪类技能。"
workflow: "为每次自动决策生成记录并填齐 who/what/why/how 五要素 → 把记录 ID、时间戳、动作、实体与上一条哈希一起计算链上哈希 → 以 append-only 方式落库并维护哈希链完整性 → 按实体、Agent 或时间窗检索完整决策链 → 检出异常决策并输出合规查询结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI决策审计追踪本体 — 供应链自动化决策的完整记录、回溯与合规证明

## ① 解决的问题

AI自动化团队面临"自动决策无法证明合规合理"——哈希链审计追踪将合规审查准备从2周→即时查询，防范EU AI Act监管风险

## ② 核心算法逻辑

AI决策审计追踪 解决核心问题：当AI系统自动触发了一个补货订单或下架SKU时，谁能解释为什么？如果出了问题谁负责？如何回溯？

## ③ 业务应用场景

背景：某母婴品牌使用AI供应链Agent管理“智能恒温暖奶器”（SKU: WN-2026）的库存。该SKU日均销量50件，安全库存200件，仓库现有库存2000件。
事件：2026年6月15日，AI Agent自动触发了一笔补货订单，数量为800件，金额¥96,000。但该决策导致库存积压，因为实际需求已因竞品降价而下滑。
审计追踪过程： 1. 记录生成：Agent `procurement_agent_v2` 生成审计记录，包含： - WHO: `agent_id=procurement_agent_v2`, `approval_level=AUTO` - WHAT: `action_type=create_replenishment_order`, `parameters={"qty":800, "supplier":"宁波精工"}` - WHY: `trigger_tags={"stockout_risk":"high", "dos":2.5}`, `signal_scores={"fused_score"

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：合规审计（SOC2/ISO27001）要求决策可追溯，审计准备时间从"2周人工整理"→"即时查询"节省约80小时；防止AI误操作后无法追责的法律风险（潜在损失不可估量）
实施难度：⭐⭐⭐☆☆（技术上是Append-only存储+哈希链，工程可行性高）
优先级评分：⭐⭐⭐⭐⭐（监管要求：EU AI Act要求高风险AI系统的决策可追溯；Amazon也要求卖家能解释账号操作历史）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/decision_audit_trail_ontology` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Decision-Audit-Trail-Ontology.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI决策审计追踪本体
功能：审计记录生成 / 哈希链完整性 / 合规查询 / 异常决策检测
"""
import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class AuditRecord:
    record_id: str
    timestamp: str
    # 5W
    who_agent_id: str
    who_approval_level: str     # AUTO / MANAGER / VP / LEGAL
    what_action_type: str
    what_parameters: dict
    why_trigger_tags: dict      # 触发此Action的Tag状态
    why_signal_scores: dict     # 信号分数
    how_algorithm: str
    how_algorithm_version: str
    entity_id: str
    estimated_impact_yuan: float
    execution_result: Optional[dict] = None
    prev_record_hash: str = ""
    record_hash: str = ""

    def compute_hash(self) -> str:
        content = json.dumps({
            "record_id": self.record_id,
            "timestamp": self.timestamp,
            "who_agent_id": self.who_agent_id,
            "what_action_type": self.what_action_type,
            "entity_id": self.entity_id,
            "prev_hash": self.prev_record_hash,
        }, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()[:16]


class DecisionAuditTrail:

    def __init__(self):
        self.records: list = []
        self._last_hash = "GENESIS"

    def record_decision(self, agent_id: str, action_type: str, entity_id: str,
                         parameters: dict, trigger_tags: dict, signal_scores: dict,
                         algorithm: str, approval_level: str,
                         impact_yuan: float, result: dict = None) -> AuditRecord:
        record = AuditRecord(
            record_id=f"AUD-{len(self.records)+1:06d}",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:23],
            who_agent_id=agent_id,
            who_approval_level=approval_level,
            what_action_type=action_type,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.11823。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：自动化决策事件字段：agent_id 与审批级别（AUTO/MANAGER/VP/LEGAL）、action_type 与参数（如 qty、supplier）、触发标签与信号分数、算法名与版本、entity_id、预估影响金额与执行结果；粒度：单次决策一条记录，按时间顺序串成哈希链。

**输出**：append-only 的审计记录链（每条含 record_hash 与 prev_record_hash，如 AUD-000001）与可即时查询的决策回溯视图、异常决策检测结果；用于 SOC2/ISO27001 等合规审计准备与 Amazon 要求的账号操作历史解释。

## 执行步骤

1. 定义审计记录的 5W 字段与审批级别枚举
2. 为每次自动决策生成记录并计算链上哈希
3. 以 append-only 存储写入并校验前序哈希
4. 按实体与时间窗查询完整决策链
5. 检出异常决策并输出合规证明

## 边界与不做

- 数据不满足时不用：决策没有结构化落库、缺触发标签或算法版本时，记录串不成可回溯的证据链。
- 能力边界：只负责记录、串链与查询，不阻断或撤销决策，纠错只能追加更正记录而不能改写历史。
- 合规边界：审计链可作为合规证明的原始材料，但不等同于法律意见或监管结论。

## 技能关联

- **前置**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking
- **延伸**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking
- **可组合**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Decision-Audit-Trail-Ontology

---

> 分类：独立控制/经营与组织/证据复核　·　技术族：24-标签工程　·　源卡：`Skill-Decision-Audit-Trail-Ontology`