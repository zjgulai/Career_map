---
name: "p2s-customer-journey-decision-tree"
title: "客服对话决策树 - 从日志中自学策略"
description: "触发词：客服决策树、退换货工单、对话策略自学、工单自动分流、客服话术边界。何时不用：只是要评审文案质量时用 LLM-as-Judge；需要跨库取数或精确数值查询时用表检索/Text2SQL 类技能。安全边界：涉及健康或医疗建议的叶节点必须附非医学建议声明并保留转人工与专家通道，不得给出诊断或用药结论。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Customer-Journey-Decision-Tree"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从历史退换货对话里学出一棵客服决策树，按订单时长、品类与理由自动分流到批准、要图、转人工或拒绝。"
user_try: "试试：用我们的退换货对话日志训一棵客服决策树，并标出哪些叶节点必须转人工。"
whenToUse: "属于「业务工具实现」：要把客服对话策略固化成可执行决策树（状态特征、决策节点、叶节点动作）时用；若只要给生成内容打分，用 LLM-as-Judge；若要跨结构与非结构化库联合取数，用混合检索类技能。"
workflow: "整理历史退换货对话日志、处理结果与满意度评分 → 抽取状态特征：订单时长、商品品类、退换理由 intent、用户历史投诉次数 → 按 7 天内 / 7-30 天 / 30 天以上与品类敏感度切决策节点 → 配置叶节点动作：自动批准、要求图片、转人工、拒绝，并接生成式回复 → 高风险叶节点加合规声明与专家转接，回放验证后上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 客服对话决策树 - 从日志中自学策略

## ① 解决的问题

母婴出海电商客服 70% 工单是"退换货咨询"(尺码错、漏发、过敏等),人工处理成本高,响应慢

## ② 核心算法逻辑

论文：ConvLab: MultiDomain EndtoEnd Dialog System Platform | 年份：2019

## ③ 业务应用场景

- 业务问题:母婴出海电商客服 70% 工单是"退换货咨询"(尺码错、漏发、过敏等),人工处理成本高,响应慢。统一模板回复又不灵活 - 数据要求:历史退换货对话日志(≥10 万轮) + 处理结果(批准/拒绝/转人工) + 用户满意度评分 - 决策树配置: - 状态特征:订单时长、商品品类、退换理由 intent、用户历史投诉次数 - 决策节点:7 天内 vs 7-30 天 vs 30+ 天;品类敏感度(食品/护肤敏感 vs 服装) - 叶节点 action:自动批准 / 要求图片 / 转人工 / 拒绝 - LLM 叶节点:根据用户语气生成共情回复 - 业务价值: - 70% 工单自动化处理,客
- 业务问题:新手妈妈咨询"宝宝 3 月夜醒频繁怎么办"、"5 月辅食怎么添加"等场景,平台希望提供专业回答但医疗建议有合规风险,需要决策树锁定边界 - 数据要求:母婴专家撰写的咨询脚本 + 历史咨询日志 + 转专家次数 - 决策树配置: - 状态:宝宝月龄 + 症状 intent + 紧急度(发烧 38.5+ vs 一般夜醒) - 决策节点:紧急度阈值(高 → 直接推送医院/儿科;中 → 提供专业建议;低 → 一般育儿知识) - 合规叶节点:LLM 生成回复但加入"非医学建议,建议咨询儿科医生"声明 - 业务价值:专业咨询覆盖率从 20% → 80%,新妈妈活跃留存提升 30-40%;年化 
三轨验证 | 成本轨：月均成本1200元（LLM API调用费用800元/月基于10万次调用@0.008元/次，人工审核8小时/月@50元/小时=400元），ROI周期2.5个月（CTR提升22%带来月增收益3000元） | 合规轨：符合《跨境电商商品信息规范》和平台Listing规范，需确保商品描述真实准确、不涉及医疗功效宣传，建议接入内容审核API进行二次合规检查 | 风险轨：主要风险包括AI生成描述与实际商品不符（概率15%）、平台算法更新导致CTR波动（概率25%）、多语言翻译精准度问题（概率20%），建议建立人工抽检机制覆盖5%流量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:决策树本身工程成熟,sklearn 即可
难处:对话状态特征化需要 NLU 模块(BERT 或 LLM intent extraction)
难处:合规叶节点的医疗/法律边界需要法务介入审核

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（97 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_agent_llm/customer_journey_decision_tree` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-Customer-Journey-Decision-Tree.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Customer Journey Decision Tree 最小骨架
综合 ConvLab + Reward-based Dialog Policy + LLM-as-Leaf 方向
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple


@dataclass
class DialogState:
    user_intent: str
    days_since_order: int
    product_category: str
    user_complaint_history: int
    severity: str = "low"


@dataclass
class DialogAction:
    action_type: str
    response_template: str


@dataclass
class DecisionNode:
    feature: str
    threshold: Optional[float] = None
    categories: Optional[Dict[str, "DecisionNode"]] = None
    left: Optional["DecisionNode"] = None
    right: Optional["DecisionNode"] = None
    leaf_action: Optional[DialogAction] = None

    def is_leaf(self) -> bool:
        return self.leaf_action is not None


def build_return_policy_tree() -> DecisionNode:
    """硬编码的退换货决策树(生产中由日志学习得来)"""
    return DecisionNode(
        feature="days_since_order",
        threshold=7,
        left=DecisionNode(
            feature="product_category",
            categories={
                "food": DecisionNode(leaf_action=DialogAction("auto_approve", "您好,食品类 7 天内无理由退货已为您批准,退款将在 24 小时内到账")),
                "clothing": DecisionNode(leaf_action=DialogAction("require_photo", "请提供商品图片以便快速处理")),
                "default": DecisionNode(leaf_action=DialogAction("auto_approve", "已为您批准退货申请")),
            },
        ),
        right=DecisionNode(
            feature="user_complaint_history",
            threshold=3,
            left=DecisionNode(leaf_action=DialogAction("manual_review", "您的申请已提交人工审核,1-2 工作日反馈")),
            right=DecisionNode(leaf_action=DialogAction("transfer_human", "为您转接资深客服处理")),
        ),
    )


def traverse_tree(node: DecisionNode, state: DialogState) -> DialogAction:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.09537，但该号在 arXiv 上是《PullNet: Open Domain Question Answering with Iterative Retrieval on Knowledge Bases and Text》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《ConvLab: MultiDomain EndtoEnd Dialog System Platform》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史退换货对话日志（卡页示例 ≥10 万轮）、每单处理结果（批准/拒绝/转人工）与用户满意度评分；卡页第 4 段未给字段级 schema，落地前需补齐日志字段与标注口径。

**输出**：一棵可执行的客服决策树（状态特征 → 决策节点 → 叶节点动作）加 LLM 叶节点话术，供客服系统与质检团队使用；卡页示例目标为 70% 工单自动化处理。

## 执行步骤

1. 收集历史退换货对话日志、处理结果与满意度评分，形成训练样本
2. 抽取状态特征：订单时长、商品品类、退换理由 intent、用户历史投诉次数
3. 按时间窗与品类敏感度切分决策节点，落到自动批准、要图、转人工、拒绝四类动作
4. 给决策叶节点接上生成式回复，专业建议类节点加声明与专家转接
5. 用留出样本回放验证分流效果，再接入线上工单

## 边界与不做

- 数据不满足时不用：没有历史对话日志与处理结果标注时决策树学不到策略，样本只有几十条时用规则模板即可。
- 能力边界：本卡产出对话策略与决策树配置，不替代客服系统工单流转，也不承担医疗或法律结论的责任。
- 涉及健康类咨询的叶节点必须附加非医学建议声明并保留转人工通道，不得输出诊断或用药结论。

## 技能关联

- **前置**：Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate、Skill-Customer-Journey-Decision-Tree

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Customer-Journey-Decision-Tree`