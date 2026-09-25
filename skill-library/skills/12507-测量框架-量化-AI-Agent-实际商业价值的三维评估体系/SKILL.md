---
name: "p2s-agent-roi-measurement-framework"
title: "Agent ROI 测量框架 — 量化 AI Agent 实际商业价值的三维评估体系"
description: "触发词：Agent ROI、三维评估、对照组实验、Token 成本、净收益量化。何时不用：要衡量搜索等单一渠道的利润贡献用「搜索流量财务归因」；要评估促销活动的因果增量用「促销 ROI 前后对比」。安全边界：对照组须预留比例并说明机会成本；调价类 Agent 的下限须硬编码为成本加毛利底线，日志留存备查。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Agent-ROI-Measurement-Framework"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "用成本节省、收入增长和决策质量三个维度算清 AI Agent 到底赚了多少钱，砍掉不划算的项目。"
user_try: "试试：用对照组方式量化定价 Agent 上线三个月的净 ROI，把 Token 成本和机会成本都算进去。"
whenToUse: "需要给已上线的 Agent 做三维 ROI 量化与续投决策时用本技能；衡量单一渠道的利润贡献用「搜索流量财务归因」；评估促销增量用「促销 ROI 前后对比」。"
workflow: "记录 Agent 执行日志，含 Token 消耗、决策类型与执行结果 → 设置对照组与实验组，例如未触达 ASIN 对比 Agent 调价 ASIN → 对比 90 天毛利或其他结果差异并扣除运行成本 → 输出年化净收益与净 ROI，形成季度汇报数据页"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent ROI 测量框架 — 量化 AI Agent 实际商业价值的三维评估体系

## ① 解决的问题

CEO面临"AI Agent投入了几十万但不知道真正带来了多少商业价值ROI算不清楚"——三维归因框架（成本节省/收入增长/决策加速）将Agent ROI可见度从0提升至量化仪表盘，定价Agent净ROI达689%

## ② 核心算法逻辑

解决「AI Agent 上线了，但老板问 ROI 是多少，说不清楚」的业务问题。

## ③ 业务应用场景

场景A：定价 Agent ROI 量化 - 业务问题：自动调价 Agent 上线 3 个月，CFO 问「花了多少钱，赚了多少？」 - 数据要求：Agent 执行日志（含 Token 消耗/决策类型/执行结果）+ 订单数据（含时间戳/售价/竞品价格） - 量化方法：对照组（未触达的 ASIN）vs 实验组（Agent 调价的 ASIN），90 天毛利差异 - 预期产出：定价 Agent 年化毛利提升 $14.2 万，LLM Token 成本 $1.8 万，净 ROI = 689%
三轨验证： - 成本：数据采集需对接定价系统与订单系统，约 2 人周开发；AWS 数据仓库查询费用约 $200/月；对照组需预留 20% ASIN 不参与调价，机会成本约 $1.2 万/年 - 合规：Amazon 定价政策禁止「自动跟卖导致价格低于成本价」或「操纵搜索排名」，Agent 调价下限需硬编码为成本价 + 15% 毛利底线；需保留调价日志备查 180 天 - 风险：竞品可能通过爬虫识别调价规律并反向操作，引发价格战；若 Agent 频繁调价（>3 次/天/ASIN），可能触发 Amazon 风控审查导致账号限流；品牌形象受损（消费者感知价格不稳定）
场景B：客服 Agent ROI 量化 - 业务问题：吸奶器类目客服 Agent 处理了 60% 的咨询，但 HR 没少招人 - 数据要求：工单系统（处理时长/客服工号/满意度评分）+ HR 成本数据 - 量化方法：Agent 处理工单 vs 人工处理工单的单均成本 × 年度总量 - 预期产出：客服 Agent 年化节省人工成本 $8.6 万，满意度提升 12 分（NPS），ROI = 430%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境卖家（GMV $500万/年规模），Agent ROI 框架落地后，平均 3 个月内识别出年化净收益 $12-20 万的 Agent 部署机会，同时砍掉 ROI < 0 的无效 Agent 节省 $3-5 万/年运行费
实施难度：⭐⭐☆☆☆（主要是数据打通，工程量小）
优先级：⭐⭐⭐⭐⭐（CEO/CFO 必看，是所有 Agent 项目立项和续投的前置条件）
典型输出：季度 Agent ROI 汇报 PPT 的核心数据页，格式：「投入 $X 万 → 产出 $Y 万 → 净 ROI Z%」

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（195 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/llm_agent_engineering/agent_roi_measurement_framework` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-ROI-Measurement-Framework.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent ROI 测量框架
功能：计算 AI Agent 的三维 ROI（成本节省/收入增长/决策质量）
"""
import random
from dataclasses import dataclass
from typing import List, Dict


@dataclass
class AgentExecutionLog:
    """Agent 执行记录"""
    execution_id: str
    agent_type: str           # pricing/customer_service/inventory
    timestamp: float
    token_cost_usd: float     # LLM Token 花费（美元）
    decision_made: str        # 具体决策内容
    group: str                # 'treatment'（Agent执行）or 'control'（对照组）


@dataclass
class BusinessOutcome:
    """业务结果"""
    execution_id: str
    revenue_delta: float      # 收入变化（美元），正=增收
    cost_saved_usd: float     # 节省人工成本（美元）
    decision_quality_score: float  # 决策质量分 0-1（事后评估）


class AgentROICalculator:
    """Agent ROI 三维测量框架"""
    
    def __init__(self, agent_monthly_fixed_cost_usd: float = 500):
        """
        Args:
            agent_monthly_fixed_cost_usd: Agent 工程月均固定成本（服务器/维护）
        """
        self.fixed_cost = agent_monthly_fixed_cost_usd
    
    def calculate_roi(
        self, 
        logs: List[AgentExecutionLog],
        outcomes: List[BusinessOutcome],
        period_months: int = 3
    ) -> Dict[str, float]:
        """
        计算三维 ROI
        Returns: 包含各维度 ROI 的字典
        """
        # 按 execution_id 关联日志和结果
        outcome_map = {o.execution_id: o for o in outcomes}
        
        treatment_data = []
        control_data = []
        
        for log in logs:
            if log.execution_id not in outcome_map:
                continue
            outcome = outcome_map[log.execution_id]
            entry = {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.09123，但该号在 arXiv 上是《A new infinite family of maximum $h$-scattered $\mathbb{F}_q$-subspaces of $V(m(h+1),q^n)$ and associated MRD codes》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Agent 执行日志（含 Token 消耗、决策类型、执行结果与 treatment 或 control 分组标记）与业务结果数据（订单时间戳、售价、竞品价格或工单处理时长等）。

**输出**：三维 ROI 结果（成本节省、收入增长、决策质量）与净 ROI 数字，可直接作为季度 Agent ROI 汇报的核心数据页。

## 执行步骤

1. 采集 Agent 执行日志与业务结果数据
2. 划分实验组与对照组并核对可比性
3. 按成本节省、收入增长与决策质量三维计算 ROI
4. 输出净 ROI 与续投或下线建议

## 边界与不做

- 没有对照组或执行日志缺少 Token 与结果字段时不适用，归因会退化为估算
- 只做价值量化与建议，不做 Agent 的下线或调参动作，决策由业财共同确认
- 对照组会带来机会成本，调价类场景须硬编码价格下限并保留日志备查

## 技能关联

- **前置**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Agent-Workforce-Replacement-Calculator.html、Skill-Agent-Workforce-Replacement-Calculator、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Agent-Workforce-Replacement-Calculator.html、Skill-Agent-Workforce-Replacement-Calculator、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **可组合**：Skill-Agent-Workforce-Replacement-Calculator.html、Skill-Agent-Workforce-Replacement-Calculator、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Agent-ROI-Measurement-Framework

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-ROI-Measurement-Framework`