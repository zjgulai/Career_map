---
name: "p2s-human-in-loop-approval-gate-tag"
title: "人工审批门控标签系统 — 高影响Action的分级审批、工作流设计与审计追踪"
description: "触发词：人工审批门控、分级审批、审批标签、高影响动作、审计追踪。何时不用：只是校准模型置信分数、不涉及审批流与留痕时用置信度校准技能；要复核证据链本身时用证据复核类技能。安全边界：涉及法务与合规层级的动作必须走对应人工审批，不得绕过门控自动放行，审批记录须留存可追溯。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-135"
l3_business: "授权审查"
l3_all: "授权审查 / 证据复核"
l1_l2_l3: "独立控制/数据与AI运行/授权审查"
p2s_card_id: "Skill-Human-in-Loop-Approval-Gate-Tag"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "给自动执行的动作装上分级审批开关，按影响金额和风险标签决定谁审、多久必须审完、留什么痕。"
user_try: "试试：给我这套自动补货动作加上分级审批门控，高影响动作按金额和风险标签路由到对应审批人。"
whenToUse: "需要为高影响动作设计自动、经理、VP、法务分级审批与超时升级时用本技能；只关心模型输出可不可信，用置信度校准技能。"
workflow: "定义审批层级与各层级 SLA、责任角色 → 为动作打风险标签并估算影响金额 → 按标签与金额路由到对应审批层级 → 超时未审批自动升级并写审计日志"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 人工审批门控标签系统 — 高影响Action的分级审批、工作流设计与审计追踪

## ① 解决的问题

AI自动化团队面临"全自动系统触发误操作风险"——分级审批门控(Auto/Manager/VP/Legal)防止高影响错误操作，保障合规留痕，防范潜在50-100万元损失

## ② 核心算法逻辑

人工审批门控（HumaninLoop Approval Gate） 是AI自动化系统的安全阀——确保高影响、高风险的决策必须经过人工确认，防止自动化系统失控。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：人工门控防止一次大规模误操作（如错误触发全仓紧急补货订单），潜在损失防范约50-100万元；审批SLA监控确保关键决策不被搁置，提升运营响应效率约40%
实施难度：⭐⭐⭐☆☆（审批工作流系统较成熟，主要是规则配置和系统集成）
优先级评分：⭐⭐⭐⭐⭐（AI自动化系统的安全基础，没有门控的自动化是危险的；合规要求审批留痕）
评估依据：AI/ML系统事故分析：90%的严重生产事故发生在"没有人工审批门控的全自动化流程"中

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（179 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/human_in_loop_approval_gate_tag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Human-in-Loop-Approval-Gate-Tag.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
人工审批门控标签系统
功能：审批级别计算 / 审批工作流管理 / SLA监控 / 超时升级 / 审计日志
输入：待执行Action + 风险评估Tags
输出：审批工单 + 工作流状态 + 审计追踪
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class ApprovalLevel(Enum):
    AUTO = ("AUTO", 0, None)
    L1_SUPERVISOR = ("L1", 2, "supervisor")
    L2_MANAGER = ("L2", 8, "manager")
    L3_VP = ("L3", 24, "vp")
    L4_LEGAL = ("L4", 48, "legal")

    def __init__(self, code, sla_hours, role):
        self.code = code
        self.sla_hours = sla_hours
        self.role = role


@dataclass
class ApprovalRequest:
    request_id: str
    action_id: str
    action_type: str
    entity_id: str
    estimated_impact_yuan: float
    risk_tags: dict
    level: ApprovalLevel
    created_at: datetime = field(default_factory=datetime.now)
    deadline: Optional[datetime] = None
    approver: Optional[str] = None
    status: str = "PENDING"
    decision: Optional[str] = None
    decision_reason: Optional[str] = None
    decision_at: Optional[datetime] = None

    def __post_init__(self):
        if self.level != ApprovalLevel.AUTO and self.deadline is None:
            self.deadline = self.created_at + timedelta(hours=self.level.sla_hours)

    def is_overdue(self) -> bool:
        return (self.deadline is not None and
                datetime.now() > self.deadline and
                self.status == "PENDING")


class ApprovalGateEngine:

    IMPACT_THRESHOLDS = {
        ApprovalLevel.AUTO: 5_000,
        ApprovalLevel.L1_SUPERVISOR: 20_000,
        ApprovalLevel.L2_MANAGER: 100_000,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.11423，但该号在 arXiv 上是《Predicting polymerization reactions via transfer learning using chemical language models》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待审批动作清单（动作类型、实体 id、预估影响金额、风险标签）与各审批层级的角色与 SLA 定义，粒度到单条动作请求。

**输出**：审批请求对象（含状态、到期时间、是否超时）与审批留痕记录，供管理层与合规审计查阅。

## 执行步骤

1. 定义自动、经理、VP、法务四档审批层级及各自 SLA 与角色
2. 为每个待执行动作估算影响金额并打上风险标签
3. 按风险标签与影响金额把动作路由到对应审批层级并生成审批请求
4. 监控审批时效，超时自动升级并标记逾期
5. 把审批结论与操作留痕写入审计日志

## 边界与不做

- 动作无法估算影响金额，或缺少明确的审批角色与 SLA 定义时不可用。
- 本技能只产出审批门控规则与审批请求产物，不代替审批人做决定，也不执行实际业务动作。

## 技能关联

- **前置**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Regulatory-Change-Impact-Propagation.html、Skill-Regulatory-Change-Impact-Propagation、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **延伸**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Regulatory-Change-Impact-Propagation.html、Skill-Regulatory-Change-Impact-Propagation、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Regulatory-Change-Impact-Propagation.html、Skill-Regulatory-Change-Impact-Propagation、Skill-Human-in-Loop-Approval-Gate-Tag

---

> 分类：独立控制/数据与AI运行/授权审查　·　技术族：24-标签工程　·　源卡：`Skill-Human-in-Loop-Approval-Gate-Tag`