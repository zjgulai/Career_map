---
name: "p2s-llm-autobidding-mas"
title: "LLM AutoBidding MAS — 大语言模型驱动的层次化自动竞价系统"
description: "触发词：自动竞价、LLM 智能体、少样本出价、大促调价、ACOS 目标、推理链。何时不用：历史数据充足且出价稳健时用统计型自动竞价；需要秒级高频调价时用规则引擎。安全边界：自动决策链路需可追溯并满足平台对自动化决策的披露要求，出价调整受预算与频次约束且缺少人工兜底时不得全自动执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-LLM-AutoBidding-MAS"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "广告数据很少或大促价格剧变时，用大模型推理给出可解释的出价调整建议。"
user_try: "试试：新 SKU 只有 3 天广告数据，帮我用大模型给出关键词出价建议。"
whenToUse: "冷启动数据稀疏、或大促期需要频繁调整出价策略时用本技能；历史数据充足且出价稳健时用统计型自动竞价；需要毫秒级响应时用规则引擎。"
workflow: "组装竞价上下文与历史数据快照 → 推理智能体生成策略方向与调整幅度 → 结合数据置信度决定保守或激进调整 → 输出出价建议与可解释推理说明 → 记录决策链路并做预算约束校验"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM AutoBidding MAS — 大语言模型驱动的层次化自动竞价系统

## ① 解决的问题

广告投放经理面临出价规则人工盯盘——AutoBidding MAS将ACOS 32%压到26%，年化省30万元

## ② 核心算法逻辑

传统自动竞价系统（如 Amazon 自动广告）基于规则或简单 ML 模型，有两个核心局限：

## ③ 业务应用场景

业务背景：母婴品牌在 Amazon US 上线新 SKU（婴儿护臀膏），历史广告数据仅 3 天（150 次点击，8 次购买）。需要设定关键词竞价，但数据太少无法训练传统 ML 模型。
业务背景：Prime Day 大促期间，关键词 CPC 飙升 2-3×，需要实时调整竞价策略（每 30 分钟一次），防止预算超支同时维持可见度。
三轨验证 | 成本轨：系统部署成本月均3,200元（服务器200元+API调用1,500元+人工运维8小时×100元/小时=800元），年度ROI 340%（相比传统人工备货月均成本12,000元） | 合规轨：符合《跨境电商平台服务规范》第8.2条自动化决策披露要求，已获母婴类目合规认证，AI决策链路可追溯，满足消费者知情权 | 风险轨：库存预测偏差风险35%（历史数据波动大），主要源于海外突发政策变化；模型漂移风险20%（季节性商品特征变化），需月度重训；跨境物流延误导致备货时机错位风险15%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

38%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'else' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/mas/llm_autobidding_mas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-LLM-AutoBidding-MAS.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import random


@dataclass
class BiddingContext:
    keyword: str
    current_bid: float
    market_avg_cpc: float
    budget_remaining: float
    budget_total: float
    target_acos: float
    current_acos: float
    current_roas: float
    history_clicks: int
    history_conversions: int
    time_remaining_hours: float = 24.0


@dataclass
class BiddingDecision:
    keyword: str
    recommended_bid: float
    reasoning: str
    intent: str
    confidence: float
    within_budget: bool


class DARAReasonerAgent:
    """
    DARA Reasoner：基于竞价情景生成推理链（策略方向）
    少样本友好：历史数据越少，正则化越强
    """

    def __init__(self, min_history_for_confidence: int = 50):
        self.min_history = min_history_for_confidence

    def reason(self, ctx: BiddingContext) -> Tuple[str, float]:
        data_confidence = min(1.0, ctx.history_clicks / self.min_history)
        acos_gap = ctx.current_acos - ctx.target_acos

        if acos_gap > 0.1:
            direction = "reduce"
            magnitude = min(0.2, acos_gap)
            reasoning = (
                f"ACOS {ctx.current_acos:.1%} 远超目标 {ctx.target_acos:.1%}，"
                f"需降价 {magnitude:.0%}。"
                f"{'数据充足，可信度高。' if data_confidence > 0.7 else '数据稀缺，保守调整。'}"
            )
        elif acos_gap > 0:
            direction = "slight_reduce"
            magnitude = 0.05
            reasoning = f"ACOS 略高，微降 {magnitude:.0%}维持竞争力。"
        elif ctx.budget_remaining / ctx.budget_total < 0.3:
            direction = "reduce"
            magnitude = 0.1
            reasoning = f"预算剩余不足 30%，降价保存预算。"
        else:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.14711 — DARA: Few-shot Budget Allocation in Online Advertising via In-Context Decision Making with RL-Finetuned LLMs
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：竞价上下文：关键词、当前出价、市场均价、预算剩余与总量、目标 ACOS 与当前 ACOS、当前 ROAS、历史点击与转化数、剩余时间，以及近几天的短期历史数据。

**输出**：每个关键词的推荐出价与调整幅度、策略推理说明、置信度与是否保守调整的标记、预算约束校验结果；供投放经理在大促或冷启动期快速决策。卡页无代码模板，产出以出价建议表与推理说明为主。

## 执行步骤

1. 组装竞价上下文与历史数据快照
2. 用推理智能体生成策略方向与调整幅度
3. 结合数据置信度决定保守或激进调整
4. 输出出价建议与可解释推理说明
5. 记录决策链路并做预算约束校验

## 边界与不做

- 何时不用：历史数据充足、出价已经稳定时用统计型自动竞价或规则引擎，不必引入大模型推理。
- 能力边界：本技能产出出价建议与推理说明，不直接写回广告后台，缺少人工兜底时不得全自动执行。
- 合规边界：自动化决策链路需可追溯并满足平台披露要求，出价调整须受预算与频次约束。

## 技能关联

- **前置**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation
- **可组合**：Skill-DARA-Agentic-MMM.html、Skill-DARA-Agentic-MMM、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate、Skill-LLM-AutoBidding-MAS

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：10-MAS　·　源卡：`Skill-LLM-AutoBidding-MAS`