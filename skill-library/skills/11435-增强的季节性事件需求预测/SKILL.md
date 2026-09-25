---
name: "p2s-llmforecaster-seasonal-event"
title: "LLMForecaster Seasonal Event — LLM 增强的季节性事件需求预测"
description: "触发词：LLMForecaster、促销文案修正、事件驱动预测、大促备货、修正系数。何时不用：无活动文本、只有数字序列时用常规时序预测；要拆解历史大促 lift 时用「大促需求分解」。安全边界：活动描述不得含 Amazon 禁售品类关键词与个人身份信息，KOL 信息需脱敏，避免站外引流政策风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-LLMForecaster-Seasonal-Event"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "让模型读懂这次的折扣力度、KOL 排期和竞品断货情况，把促销事件的销量修正系数算出来再备货。"
user_try: "试试：读这份 Prime Day 活动方案，给我日均销量的 P10/P50/P90 三档预测和备货量建议。"
whenToUse: "大促前有折扣、预算、KOL、竞品动态等非结构化文本、需要生成需求修正系数时用；纯数字历史预测用常规时序模型；拆历史大促 lift 用大促需求分解。"
workflow: "准备近 2 年周度销量历史与当次活动描述文本 → 用传统时序模型生成基线预测 → 让 LLM 读活动文本输出修正系数 Δ → 叠加基线与 Δ 得到分场景预测并转成备货量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLMForecaster Seasonal Event — LLM 增强的季节性事件需求预测

## ① 解决的问题

Prime Day 促销力度/KOL 合作/竞品断货等信息在传统预测模型里完全缺失，导致备货严重错误——LLM 读取促销文案生成需求修正系数，备货准确率提升 15-23%、年化减少断货积压损失 30-80 万元

## ② 核心算法逻辑

核心思想：传统时序预测模型（ARIMA/Prophet/LightGBM）只能看到历史销量数字，对"明天有双十一大促且同时发了网红推广"这类信息完全盲目。LLMForecaster 将 LLM 作为后处理器：先用传统时序模型预测基线，再让 LLM 读取促销文案、活动描述等非结构化文本，输出一个修正系数（Δ），最终预测 = 基线 + Δ。

## ③ 业务应用场景

- 业务问题：Prime Day 是全年最大出货节点，但"促销力度 40% off + 头部 KOL 合作推广 + 竞品主要型号断货"这些信息在传统预测模型里全部缺失，导致备货要么严重不足要么大量积压。 - 数据要求：近 2 年周度销量历史 + 当次活动描述文本（折扣力度、广告预算、KOL 名单、竞品动态）。 - 预期产出： - 活动期日均销量预测（P10/P50/P90 三个场景） - 修正系数说明（"本次相比去年 Prime Day 力度提升 15%，预测上调 18%"） - 建议备货量（含安全库存缓冲） - 业务价值：备货准确率提升 15-23%，减少因断货导致的 BSR 排名下滑，年化
三轨验证： - 成本：显性成本较低，主要为 LLM API 调用费用（约 0.5-2 元/次预测）及历史数据清洗人力（约 0.5 人天/活动）。无需 GPU 训练资源。 - 合规：需确保活动描述文本不包含 Amazon 禁售品类关键词（如医疗宣称），且 KOL 合作信息需脱敏处理，避免违反 Amazon 站外引流政策。GDPR 方面，文本中不得包含个人身份信息。 - 风险：若 LLM 修正系数过度依赖竞品断货信号，可能引发跟风备货导致行业性库存过剩；高折扣预测可能诱导过度降价，触发平台比价机制或品牌价格体系崩盘。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：备货准确率 +15-23%，减少断货/积压损失 30-80 万元/年
实施难度：⭐⭐☆☆☆（低，无需训练模型，接入 LLM API 即可）
优先级：⭐⭐⭐⭐⭐（大促备货是母婴跨境最高频、最高风险的决策场景）
评估依据：论文在大型零售商数据上验证 MAPE 降低 15-23%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（67 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/llmforecaster_seasonal_event` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-LLMForecaster-Seasonal-Event.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import Optional
import statistics

@dataclass
class SalesHistory:
    weekly_sales: list
    event_weeks: dict

@dataclass
class EventContext:
    name: str
    discount_pct: float
    kol_count: int
    budget_multiplier: float
    competitor_oos: bool
    description: str

def baseline_forecast(history: SalesHistory, horizon_weeks: int = 2) -> float:
    recent = history.weekly_sales[-12:]
    return round(statistics.mean(recent), 1)

def compute_event_multiplier(ctx: EventContext, historical_multipliers: dict) -> float:
    base_mult = historical_multipliers.get(ctx.name, 2.5)
    discount_adj = 1 + (ctx.discount_pct - 30) / 100
    kol_adj = 1 + ctx.kol_count * 0.05
    budget_adj = ctx.budget_multiplier
    oos_adj = 1.15 if ctx.competitor_oos else 1.0
    multiplier = base_mult * discount_adj * kol_adj * budget_adj * oos_adj
    return round(multiplier, 2)

def llm_forecaster(history: SalesHistory, event: EventContext,
                   historical_multipliers: dict) -> dict:
    baseline = baseline_forecast(history)
    multiplier = compute_event_multiplier(event, historical_multipliers)
    p50 = round(baseline * multiplier)
    p10 = round(p50 * 0.75)
    p90 = round(p50 * 1.35)
    safety_stock = round(p90 * 0.15)
    return {
        "baseline_weekly": baseline,
        "event_multiplier": multiplier,
        "forecast_p10": p10,
        "forecast_p50": p50,
        "forecast_p90": p90,
        "recommended_stock": p90 + safety_stock,
        "explanation": (f"基线周均 {baseline} 件，活动乘数 {multiplier}x "
                        f"（折扣{event.discount_pct}% + {event.kol_count}个KOL + "
                        f"预算{event.budget_multiplier}x{' + 竞品断货' if event.competitor_oos else ''}）")
    }

history = SalesHistory(
    weekly_sales=[820, 850, 790, 900, 860, 880, 910, 870, 840, 920, 890, 950],
    event_weeks={"prime_day_2024": 3200, "black_friday_2024": 2800}
)
event = EventContext(
    name="prime_day", discount_pct=40, kol_count=3,
    budget_multiplier=1.2, competitor_oos=True,
    description="Prime Day 2026: 40% off + 3位头部KOL + 主要竞品断货"
)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2412.02525 — LLMForecaster: Improving Seasonal Event Forecasts with Unstructured Textual Data

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：近 2 年周度销量历史，当次活动描述文本（折扣力度、广告预算、KOL 名单、竞品动态）；粒度：SKU×周，按活动期聚合。

**输出**：活动期日均销量预测（P10/P50/P90 三档）、修正系数说明与含安全库存的备货量建议，供大促备货决策使用。

## 执行步骤

1. 整理周度销量历史与本次活动的文本描述
2. 生成基线预测并校验季节与节日项
3. 用 LLM 输出事件修正系数并给出解释
4. 合成三档场景预测与备货量建议
5. 复核修正是否过度依赖竞品断货信号

## 边界与不做

- 数据不满足时不用：拿不到活动文本（折扣、推广、竞品动态）时，LLM 只能复述基线，无增量信息。
- 能力边界：只做预测修正与备货建议，不参与定价与促销力度决策。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-LLMForecaster-Seasonal-Event

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-LLMForecaster-Seasonal-Event`