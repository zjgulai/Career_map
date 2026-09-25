---
name: "p2s-cs-supply-chain-feedback-loop-tag"
title: "客服反馈供应链改善闭环 — 差评/投诉自动归因到供应链节点并触发改善Action"
description: "触发词：差评归因、客诉聚类、反馈打标签、改善任务派发、投诉分类。何时不用：要把退货事件追到批次与供应商多层根因用「退货根因归因图谱」，只判定差评率是否异常用「VOC 预警」类技能。安全边界：生成的任务与责任归属须人工复核，模型不自动扣罚供应商、不直接对外回复客户。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-055"
l3_business: "纠正预防措施"
l3_all: "纠正预防措施 / 客诉聚类"
l1_l2_l3: "业务运营/供应与履约/纠正预防措施"
p2s_card_id: "Skill-CS-Supply-Chain-Feedback-Loop-Tag"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把每条差评和投诉自动归到具体供应链环节，直接生成带时限的改善任务派给对应团队。"
user_try: "试试：把最近的差评按供应链环节归类，破损类生成给包材和物流的改善任务，并列出每类任务的完成时限。"
whenToUse: "有客服反馈文本（评分 + 内容）与供应链节点清单、要把差评转成改善动作时用；要定位退货背后的多层根因与批次用「退货根因归因图谱」。"
workflow: "读入各渠道客服反馈，判定问题类型 → 把问题类型映射到供应链节点、优先级与 SLA 时限 → 生成改善任务并自动打上反馈 Tag → 把任务派给对应节点，跟踪 SLA 内根因分析是否完成"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 客服反馈供应链改善闭环 — 差评/投诉自动归因到供应链节点并触发改善Action

## ① 解决的问题

运营面临"差评反复出现同一问题却没有系统性改善"——NLP自动归因将客服反馈→供应链改善从1周人工→即时自动，降低差评率40%

## ② 核心算法逻辑

客服反馈→供应链改善闭环 将客户的差评和投诉转化为供应链改善的具体行动指令。

## ③ 业务应用场景

流程：客户反馈"包装破损" → NLP识别 → Tag标记 `feedback.packaging_damage=True` → 自动生成"包材检验+升级"任务 → 分配给包材供应商和物流商 → SLA 24小时内完成根因分析
| 轨道 | 内容 | 具体数字 | |-----|------|--------| | 成本轨 | NLP文本分类模型维护：¥8,000/月；数据存储（月均5万条反馈）：¥2,000/月；工作流编排系统：¥5,000/月；人工审核异议反馈（5%）：¥3,000/月 | 总计：¥18,000/月 | | 合规轨 | ✅ 完全合规。符合Amazon A9政策（反馈系统透明化）；GDPR合规（反馈数据加密存储、用户可删除权）；无广告法触碰（仅内部供应链改善，不涉及虚假宣传）；跨境贸易合规（反馈数据不涉及出口管制商品） | 风险等级：低 | | 风险轨 | ①自动归因误判风险：规则覆盖率85%，15
流程：客户反馈"发错了/收到错误商品" → NLP识别 → Tag标记 `feedback.wrong_item=True` → 自动触发"仓储审计+员工培训"任务 → 分配给仓储运营 → SLA 4小时内完成根因分析

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：自动归因将供应链类差评的根因定位从"1周人工"→"即时自动"；及时改善（如包材升级）将差评率降低约40%，年化保护Brand Score约15万元（每降1分差评对转化率影响约2%）
实施难度：⭐⭐☆☆☆（规则+NLP混合，技术门槛低）
优先级评分：⭐⭐⭐⭐☆（"把差评变改善机会"是品牌精细化运营的核心能力）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（122 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/cs_supply_chain_feedback_loop_tag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-CS-Supply-Chain-Feedback-Loop-Tag.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
客服反馈供应链改善闭环系统
功能：差评NLP归因 / 供应链节点标记 / 改善任务生成 / 效果追踪
"""
import re
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


ATTRIBUTION_RULES = {
    "packaging_damage": {
        "keywords": ["破损", "碎了", "坏了", "damaged", "broken", "crushed", "squished"],
        "nodes": ["packaging_supplier", "logistics_carrier"],
        "priority": "HIGH", "sla_hours": 24,
    },
    "wrong_item": {
        "keywords": ["发错", "wrong item", "sent wrong", "不是我要的", "received wrong"],
        "nodes": ["warehouse_ops"],
        "priority": "HIGH", "sla_hours": 4,
    },
    "delivery_delay": {
        "keywords": ["迟到", "delayed", "late", "还没收到", "haven't received", "太慢了"],
        "nodes": ["logistics_carrier", "warehouse_sla"],
        "priority": "MEDIUM", "sla_hours": 48,
    },
    "quality_issue": {
        "keywords": ["质量差", "quality", "defective", "不好用", "doesn't work", "broken"],
        "nodes": ["supplier_quality", "iqc_process"],
        "priority": "HIGH", "sla_hours": 24,
    },
    "listing_mismatch": {
        "keywords": ["描述不符", "not as described", "misleading", "如图不符", "fake"],
        "nodes": ["listing_team", "translation"],
        "priority": "MEDIUM", "sla_hours": 72,
    },
}


@dataclass
class CustomerFeedback:
    feedback_id: str
    sku_id: str
    channel: str           # amazon / shopify / tiktok
    rating: int            # 1-5星
    text: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FeedbackAttributionResult:
    feedback_id: str
    sku_id: str
    issue_types: list      # 识别到的问题类型
    supply_chain_nodes: list  # 归因到的供应链节点
    improvement_tasks: list   # 生成的改善任务
    tags: dict = field(default_factory=dict)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.09823，但该号在 arXiv 上是《Finite size corrections for real eigenvalues of the elliptic Ginibre matrices》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客服反馈明细：feedback_id、sku_id、渠道（amazon/shopify/tiktok）、1-5 星评分、反馈文本、时间戳；以及归因规则库（问题类型 → 关键词 → 供应链节点 → 优先级 HIGH/MEDIUM → SLA 小时数）。

**输出**：每条反馈的问题类型、归因到的供应链节点、自动打上的 Tag（如 feedback.packaging_damage、feedback.wrong_item）、生成的改善任务及 SLA 时限；供客服、质量与供应链团队按节点分派与跟踪闭环。

## 执行步骤

1. 摄取各渠道客服反馈，逐条提取 SKU、星级评分与原文
2. 用关键词与分类规则判定问题类型（包装破损、发错货、配送延迟、质量问题、描述不符）
3. 按规则把问题类型映射到供应链节点、优先级与 SLA 小时数（如发错货 4 小时、破损 24 小时）
4. 自动打反馈 Tag 并生成改善任务（包材检验+升级、仓储审计+员工培训、翻译修正等）
5. 把任务派给包材供应商、物流商、仓储运营等节点，跟踪 SLA 内根因分析完成情况

## 边界与不做

- 数据不满足时不用：只有评分没有反馈文本、或 SKU 关联不到供应链节点时，归因不成立。
- 只做归因与任务生成，不直接外发客户回复、不直接扣罚或更换供应商。
- 卡页写明规则覆盖率 85%、存在误判风险；ROI（根因定位从 1 周人工到即时、差评率降约 40%、年化保护 Brand Score 约 15 万元）为估算口径。

## 技能关联

- **前置**：Skill-Customer-Complaint-Supply-Root-Cause-KPI.html、Skill-Customer-Complaint-Supply-Root-Cause-KPI、Skill-Demand-Signal-Nowcasting.html、Skill-Demand-Signal-Nowcasting、Skill-Proactive-Customer-Alert-Supply-Chain.html、Skill-Proactive-Customer-Alert-Supply-Chain、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Sales-Velocity-Momentum-Detection.html、Skill-Sales-Velocity-Momentum-Detection、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **延伸**：Skill-Demand-Signal-Nowcasting.html、Skill-Demand-Signal-Nowcasting、Skill-Proactive-Customer-Alert-Supply-Chain.html、Skill-Proactive-Customer-Alert-Supply-Chain、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Sales-Velocity-Momentum-Detection.html、Skill-Sales-Velocity-Momentum-Detection、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **可组合**：Skill-Demand-Signal-Nowcasting.html、Skill-Demand-Signal-Nowcasting、Skill-Proactive-Customer-Alert-Supply-Chain.html、Skill-Proactive-Customer-Alert-Supply-Chain、Skill-Sales-Velocity-Momentum-Detection.html、Skill-Sales-Velocity-Momentum-Detection、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-CS-Supply-Chain-Feedback-Loop-Tag

---

> 分类：业务运营/供应与履约/纠正预防措施　·　技术族：24-标签工程　·　源卡：`Skill-CS-Supply-Chain-Feedback-Loop-Tag`