---
name: "p2s-multimarket-expansion-readiness-scorer"
title: "Multimarket Expansion Readiness Scorer（多市场拓展就绪度评分）"
description: "触发词：就绪度评分、多市场拓展、GO/WAIT/NO-GO、阻塞项识别、五维评估。何时不用：要判断单品在目标市场的适销性时用「跨市场产品适配性预测」；要自动生成进入 Checklist 与任务分配时用「新市场进入评分门控」。安全边界：只输出评分与裁决建议，不代替法务与供应链的取证与执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-072"
l3_business: "市场进入"
l3_all: "市场进入 / 渠道研究"
l1_l2_l3: "业务运营/渠道经营/市场进入"
p2s_card_id: "Skill-Multimarket-Expansion-Readiness-Scorer"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "进新市场前先做一次体检：合规、物流、需求、内容、财务五维打分，给出的不是感觉而是 GO 还是等。"
user_try: "试试：按合规、物流、需求、内容、财务五维给我评估德国站的进入就绪度，并列出阻塞项。"
whenToUse: "当要在进入新市场前做整体就绪度评估、判定 GO/WAIT/NO-GO 并识别阻塞点与优先行动时用本技能；要判断单品适销性，用「跨市场产品适配性预测」；要自动生成 Checklist 与任务分配，用「新市场进入评分门控」。"
workflow: "逐维收集五维评分依据 → 按权重合成加权总分 → 按阈值规则输出 GO/WAIT/NO-GO → 列出阻塞项与优先行动清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multimarket Expansion Readiness Scorer（多市场拓展就绪度评分）

## ① 解决的问题

跨境品牌进入德国市场时，CE 认证未完成就提前烧 50 万广告费——五维就绪度评分模型（合规/物流/需求/内容/财务）输出 GO/WAIT/NO-GO，识别阻塞点并给出优先行动清单，避免因时机错误造成的首年损失 30-200 万元

## ② 核心算法逻辑

论文: Market Expansion Readiness: A MultiDimensional Scoring Framework for CrossBorder ECommerce | 年份: 2021

## ③ 业务应用场景

场景：Momcozy 从美国站向德国 Amazon 扩张评估
| 维度 | 得分 | 关键发现 | |------|------|---------| | 产品合规 | 62 | 吸奶器需要 CE + MDR 认证（医疗器械），申请中（未持证扣 40 分），HTS 关税 0% 加分 | | 物流链路 | 78 | 已有法兰克福 FBA 仓，DE 配送次日达，头程成本 7% GMV（合格） | | 市场需求 | 71 | 德国 Amazon 母婴品类 BSR 90 天上升 12%，竞争以本土品牌为主（中等难度）| | 品牌/内容 | 45 | 仅有机器翻译德语 Listing，无本地化评论，TikTok DE 无内容 | | 财务就绪 | 68 | 首批备
综合得分：`62×0.25 + 78×0.20 + 71×0.25 + 45×0.15 + 68×0.15 = 65.8`

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-200 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（71 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/growth_model/multimarket_expansion_readiness_scorer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Multimarket-Expansion-Readiness-Scorer.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass

@dataclass
class MarketReadinessInput:
    market: str
    compliance_score: float
    logistics_score: float
    demand_score: float
    content_score: float
    financial_score: float

WEIGHTS = {
    "compliance": 0.25,
    "logistics": 0.20,
    "demand": 0.25,
    "content": 0.15,
    "financial": 0.15,
}

def score_market_readiness(inp: MarketReadinessInput) -> dict:
    weighted = (
        inp.compliance_score * WEIGHTS["compliance"]
        + inp.logistics_score * WEIGHTS["logistics"]
        + inp.demand_score * WEIGHTS["demand"]
        + inp.content_score * WEIGHTS["content"]
        + inp.financial_score * WEIGHTS["financial"]
    )

    if weighted >= 70 and inp.compliance_score >= 60:
        decision = "GO"
        rationale = "全面就绪，建议在下一个财季启动"
    elif weighted >= 50 and inp.compliance_score >= 30:
        decision = "WAIT"
        blockers = []
        if inp.compliance_score < 60:
            blockers.append(f"合规就绪度不足 ({inp.compliance_score:.0f}<60)")
        if inp.content_score < 50:
            blockers.append(f"内容本地化薄弱 ({inp.content_score:.0f}<50)")
        if inp.financial_score < 55:
            blockers.append(f"财务就绪度不足 ({inp.financial_score:.0f}<55)")
        rationale = "阻塞点: " + "; ".join(blockers) if blockers else "综合得分偏低，建议先强化弱项"
    else:
        decision = "NO-GO"
        rationale = "市场时机或资源条件不成熟，建议推迟 6+ 个月"

    return {
        "market": inp.market,
        "total_score": round(weighted, 1),
        "decision": decision,
        "rationale": rationale,
        "dim_scores": {
            "compliance": inp.compliance_score,
            "logistics": inp.logistics_score,
            "demand": inp.demand_score,
            "content": inp.content_score,
            "financial": inp.financial_score,
        },
    }

markets = [
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04567，但该号在 arXiv 上是《Non-Hermitian skin effect of dislocations and its topological origin》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Market Expansion Readiness: A MultiDimensional Scoring Framework for CrossBorder ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：五维评分输入：产品合规（认证/关税）、物流链路（仓储/时效/头程成本）、市场需求（品类趋势/竞争结构）、品牌与内容（本地化 Listing/评论/内容）、财务就绪（首批备货与预算）；粒度为 市场。

**输出**：加权综合就绪度得分、GO/WAIT/NO-GO 裁决与理由、各维度得分明细与阻塞项清单、优先行动建议；供市场进入决策会与跨团队任务分派使用。

## 执行步骤

1. 逐维收集评分依据（合规认证状态、物流链路、市场需求、内容本地化、财务就绪）
2. 按权重（合规 0.25/物流 0.20/需求 0.25/内容 0.15/财务 0.15）计算加权总分
3. 按阈值规则输出 GO / WAIT / NO-GO 裁决
4. 列出阻塞项（如合规分低于 60 的认证缺口）与需补齐的弱项
5. 输出优先行动清单并交对应团队执行

## 边界与不做

- 数据不满足：五维中任一维没有可信数据（如合规认证状态不明）时总分不可用，先补齐证据再评分。
- 何时不用：要判断的是单品在目标市场的适销性（适配性评分），用「跨市场产品适配性预测」；要自动生成进入 Checklist 与任务分配，用「新市场进入评分门控」。
- 能力边界：只输出评分与裁决建议，不代替法务与供应链的取证与执行；卡页的避免首年损失 30-200 万元为案例口径。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Cultural-Adaptation-Agent.html、Skill-Cultural-Adaptation-Agent、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-New-Market-Entry-Readiness-Gate.html、Skill-New-Market-Entry-Readiness-Gate、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cultural-Adaptation-Agent.html、Skill-Cultural-Adaptation-Agent、Skill-New-Market-Entry-Readiness-Gate.html、Skill-New-Market-Entry-Readiness-Gate
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Cultural-Adaptation-Agent.html、Skill-Cultural-Adaptation-Agent、Skill-New-Market-Entry-Readiness-Gate.html、Skill-New-Market-Entry-Readiness-Gate、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Multimarket-Expansion-Readiness-Scorer

---

> 分类：业务运营/渠道经营/市场进入　·　技术族：06-增长模型　·　源卡：`Skill-Multimarket-Expansion-Readiness-Scorer`