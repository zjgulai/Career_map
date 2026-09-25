---
name: "p2s-demand-forecasting-booking-curve"
title: "Demand Forecasting via Booking Curve — 酒店预订曲线迁移到电商搜索量超前指标预测"
description: "触发词：预订曲线、搜索量领先指标、旺季拐点预警、加购量、提前备货。何时不用：大促活动期内逐日预测用「LLM事件感知预测」，用评论与搜索做实时修正用「需求信号Nowcasting」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Demand-Forecasting-Booking-Curve"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "用搜索量和加购量的领先信号提前几周看到旺季拐点，别等销量数据出来才动手补货。"
user_try: "试试：用我 2 年的吸奶器搜索量数据做 lead-lag 分析，判断 Q4 旺季拐点并给出提前备货建议。"
whenToUse: "本卡属需求预测的超前指标侧：需要把搜索量、加购量这类领先信号变成旺季拐点预警时用；活动期内的逐日预测用事件感知预测类技能，实时短周期修正用 Nowcasting 类技能。"
workflow: "采集关键词搜索量、加购量时序与节假日日历 → 做领先滞后相关分析，确定领先周数 → 拟合预订曲线增长形态，设定拐点预警阈值 → 按领先窗口提前触发补货与追单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Demand Forecasting via Booking Curve — 酒店预订曲线迁移到电商搜索量超前指标预测

## ① 解决的问题

采购负责人面临"需求预测总是滞后于市场实际变化最快要等销量数据才能决策"——酒店预订曲线迁移将需求预测提前4周，年化减少断货损失$7.2万

## ② 核心算法逻辑

这个算法来自酒店行业的「预订曲线」（Booking Curve）分析——酒店在入住日前120天就开始接受预订，每天观察累积预订量的增长曲线。经验丰富的Revenue Manager通过对比当前预订曲线与历史基准曲线，可以提前46周预测实际入住率，比等到临近入住日再做判断早得多。

## ③ 业务应用场景

- 业务问题：每年Q4旺季需求拐点（从平稳到爆发）发生时间不确定——有时是10月初，有时是10月底。等看到销量上涨再补货已经来不及（FBA补货需要3-5周），往往旺季前两周开始断货。竞品却好像总是提前准备好了库存。 - 数据要求： - 核心关键词「吸奶器」「breast pump」月搜索量（Helium10 Cerebro历史数据，至少2年） - 加购量（Add to Cart）时序数据 - 历史销量数据（对比验证） - 节假日日历（Prime Day、感恩节等） - 预期产出： - Lead-lag分析显示：搜索量领先销量 3周（ρ=0.82） - Q4拐点预警：当搜索量周环比增长>20%时
- 业务问题：新款轻便婴儿车4月上市，但无历史销量数据，不知道应该备多少货。传统做法是保守备200台，经常卖完但来不及补货。 - 预订曲线迁移： - 找「类似品类」的预订曲线基准（用同档次、同季节的上一年热销款） - 新品上市后前2周搜索量作为"早期预订信号" - 用基准曲线缩放预测后续4周销量 - 预期产出：上市2周后搜索量超过基准款120%，预测首月销量420台（vs 保守预期200台），提前追单220台，减少错失收益约8-12万元
三轨验证 | 成本轨：AI模型训练与维护月均3,200元（GPU服务器2,000元/月+数据标注800元/月+人工调优400元/月），需求预测模型迭代人工投入12小时/月；合规轨：符合《电子商务法》第18条价格透明要求，动态定价需在商品详情页明示算法逻辑，符合《消费者权益保护法》不得虚假宣传条款，建议获得平台（抖音/小红书）动态定价白名单资质；风险轨：①价格波动过大引发消费者投诉概率15%（建议设置24小时内涨幅≤15%限制），②预测模型偏差导致库存积压概率12%（需月度模型精度验证≥85%），③竞对跟风压价导致行业价格战概率25%（建议建立价格下限保护机制）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
提前4周预警Q4旺季：每年Q4缺货损失均值约25-50万元（基于5-10天缺货×$5000/天），提前备货可减少80%以上损失，年化减少20-40万元
新品首批备货精度提升：传统保守备货vs曲线外推备货，错失收益平均差距8-20万元/款新品
数据获取成本：Helium10等工具月费$100-300，ROI > 100倍
实施难度：⭐⭐☆☆☆（数据工程简单，核心是搜索量获取和历史数据积累，算法已封装）
优先级：⭐⭐⭐⭐⭐（旺季备货决策的核心数据源，所有备货模型的上游输入，优先级最高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（241 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/demand_forecasting_booking_curve` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Demand-Forecasting-Booking-Curve.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Demand Forecasting via Booking Curve
迁移自酒店预订曲线分析，用于电商搜索量超前指标预测销量拐点
"""

import numpy as np
import pandas as pd
from scipy.stats import pearsonr
from scipy.optimize import curve_fit
from typing import List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


def compute_lead_lag_correlation(
    search_volume: np.ndarray,
    sales_volume: np.ndarray,
    max_lag: int = 8
) -> Tuple[np.ndarray, int, float]:
    """
    计算搜索量与销量的Lead-Lag相关性
    找出搜索量领先销量的最优超前期
    
    Args:
        search_volume: 搜索量时序（周/天）
        sales_volume: 销量时序（对应时间段）
        max_lag: 最大考察超前期
    
    Returns:
        correlations: 各超前期的相关系数
        optimal_lag: 最优超前期（周）
        max_correlation: 最高相关系数
    """
    n = len(search_volume)
    correlations = []
    
    for lag in range(0, max_lag + 1):
        if n - lag < 5:  # 样本太少不可靠
            correlations.append(0.0)
            continue
        
        # 搜索量领先 lag 期对应的销量
        search_aligned = search_volume[:n - lag]
        sales_aligned = sales_volume[lag:]
        
        if np.std(search_aligned) < 1e-10 or np.std(sales_aligned) < 1e-10:
            correlations.append(0.0)
        else:
            corr, _ = pearsonr(search_aligned, sales_aligned)
            correlations.append(corr)
    
    correlations = np.array(correlations)
    optimal_lag = int(np.argmax(correlations))
    
    return correlations, optimal_lag, correlations[optimal_lag]


def fit_booking_curve_growth(
    time_points: np.ndarray,
    cumulative_signal: np.ndarray,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.11287，但该号在 arXiv 上是《Discovering Symbolic Models from Deep Learning with Inductive Biases》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：核心关键词月或周搜索量（至少 2 年）、加购量时序、历史销量（用于对比验证）、节假日日历；关键词×周粒度，新品场景需类似品类的基准曲线。

**输出**：搜索量与销量的领先滞后关系（领先周数与相关系数）、旺季拐点预警信号与提前备货建议、新品首月销量外推与追单建议，输出给采购与备货决策。

## 执行步骤

1. 采集关键词搜索量、加购量时序与节假日日历。
2. 做领先滞后相关分析，确定搜索量领先销量多少周。
3. 拟合预订曲线增长形态，设定旺季拐点预警阈值。
4. 按领先窗口提前触发补货；新品用基准曲线缩放外推首月销量。

## 边界与不做

- 何时不用：关键词搜索量历史不足 2 年或加购量数据缺失时，领先关系无法稳定估计，不适用本技能。
- 能力边界：领先关系是统计相关，平台流量规则变化会让关系失效；搜索量口径变更后需重新标定阈值。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Overbooking-Safety-Stock-Model.html、Skill-Overbooking-Safety-Stock-Model、Skill-Price-Signal-Collection.html、Skill-Price-Signal-Collection、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis
- **延伸**：Skill-EMSR-Bid-Price-Inventory-Control.html、Skill-EMSR-Bid-Price-Inventory-Control、Skill-Overbooking-Safety-Stock-Model.html、Skill-Overbooking-Safety-Stock-Model、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis
- **可组合**：Skill-Overbooking-Safety-Stock-Model.html、Skill-Overbooking-Safety-Stock-Model、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis、Skill-Demand-Forecasting-Booking-Curve

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：17-价格优化　·　源卡：`Skill-Demand-Forecasting-Booking-Curve`