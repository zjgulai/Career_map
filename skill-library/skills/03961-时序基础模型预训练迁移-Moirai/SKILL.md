---
name: "p2s-time-series-pretraining-foundation"
title: "Time Series Foundation Model Pretraining — 时序基础模型预训练迁移（Moirai/TimesFM/Chronos）"
description: "触发词：预训练、基础模型迁移、零样本、开源模型、概率区间。何时不用：要带产品标签条件的批量长尾预测用「时序基础模型零样本预测」；要跨市场需求分布迁移用「最优传输跨市场迁移」。安全边界：使用自有销量历史数据，无隐私风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Time-Series-Pretraining-Foundation"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用开源预训练模型直接给新品出概率区间，第一月备货不再靠拍脑袋。"
user_try: "试试：用 Moirai 或 Chronos 给我这款新款推车做未来 4 周概率预测，用于算安全库存。"
whenToUse: "新品无历史、想借开源基础模型零样本或少样本迁移时用；要带产品标签条件的批量长尾预测用时序基础模型零样本预测；跨市场分布迁移用最优传输跨市场迁移。"
workflow: "准备同类历史 SKU 序列作为上下文与新品基本属性 → 调用 Moirai、TimesFM 或 Chronos 做零样本推理 → 输出未来 4 周 P10/P50/P90 区间 → 把区间换算成安全库存并对特殊促销叠加规则修正"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Time Series Foundation Model Pretraining — 时序基础模型预训练迁移（Moirai/TimesFM/Chronos）

## ① 解决的问题

运营面临"新品上线无历史数据传统预测模型完全失效只能靠拍脑袋备货"——时序基础模型零样本预测将新品首月备货准确率从±60%改善至±25%，年化减少滞销积压损失20-40万元

## ② 核心算法逻辑

核心思想：类比 GPT 在 NLP 的成功，时序基础模型（Moirai、TimesFM、Chronos）在数十亿时序数据点上预训练，学到跨域通用的时序模式（趋势、周期性、突变），在下游任务中可零样本或少样本微调直接用于预测。

## ③ 业务应用场景

场景1：新品首月需求预测（零样本，无历史数据） - 业务问题：婴儿推车新款上市，无任何历史销量数据，传统预测模型完全失效，备货靠拍脑袋 - 数据要求：同类历史 SKU 的销量序列（作为 context）+ 新品基本属性（类目/价位） - 预期产出：未来 4 周的概率预测区间（P10/P50/P90），用于安全库存计算 - 业务价值：新品首月备货准确率从 ±60% 改善至 ±25%，年化减少滞销积压 20-40 万元
**三轨验证**： - 成本：使用开源 Moirai/Chronos 模型，推理约 0.01 元/次；无需训练成本 - 合规：使用自有销量历史数据，无隐私风险 - 风险：零样本在高度特殊的促销/节假日场景准确率下降，需要叠加规则修正

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：新品首月备货准确率提升，减少滞销积压和断货，年化价值 20-40 万元；无训练成本（使用开源模型）
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：新品冷启动是母婴出海最高频的需求预测难题，传统方法完全失效；Moirai/Chronos 已开源可直接使用，实施门槛低，ROI 极高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（65 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class TimeSeriesForecast:
    p10: np.ndarray
    p50: np.ndarray
    p90: np.ndarray
    horizon: int

def simple_ts_foundation_mock(
    history: np.ndarray,
    horizon: int = 28,
    freq: str = "D",
) -> TimeSeriesForecast:
    """
    模拟时序基础模型预测（生产中替换为 Moirai/Chronos API）
    history: 历史销量数组
    horizon: 预测步数（天）
    """
    # 提取基本时序特征（实际模型用 Transformer 提取）
    trend = np.polyfit(np.arange(len(history)), history, 1)[0]
    level = history[-7:].mean()  # 近7日均值作为水平估计
    std = history[-30:].std() if len(history) >= 30 else history.std()
    # 生成预测（含不确定性）
    t = np.arange(1, horizon + 1)
    p50 = np.maximum(level + trend * t, 0)
    p10 = np.maximum(p50 - 1.645 * std, 0)   # 90% 置信下界
    p90 = p50 + 1.645 * std                   # 90% 置信上界
    return TimeSeriesForecast(p10=p10, p50=p50, p90=p90, horizon=horizon)

def safety_stock_from_forecast(forecast: TimeSeriesForecast,
                                lead_time_days: int = 14) -> dict:
    """从概率预测计算安全库存"""
    lt_demand_p50 = forecast.p50[:lead_time_days].sum()
    lt_demand_p90 = forecast.p90[:lead_time_days].sum()
    safety_stock = lt_demand_p90 - lt_demand_p50  # P90-P50 作为安全量
    reorder_point = lt_demand_p50 + safety_stock
    return {
        "lead_time_demand_p50": round(lt_demand_p50, 1),
        "lead_time_demand_p90": round(lt_demand_p90, 1),
        "safety_stock": round(safety_stock, 1),
        "reorder_point": round(reorder_point, 1),
    }

if __name__ == "__main__":
    np.random.seed(42)
    # 模拟60天历史销量（婴儿奶粉，有上升趋势+周期性）
    t = np.arange(60)
    history = (50 + 0.5 * t  # 上升趋势
               + 10 * np.sin(2 * np.pi * t / 7)  # 周内波动
               + np.random.normal(0, 5, 60))       # 噪声
    history = np.maximum(history, 0)
    forecast = simple_ts_foundation_mock(history, horizon=28)
    stock_plan = safety_stock_from_forecast(forecast, lead_time_days=14)
    print(f"28天预测区间 (P10/P50/P90):")
    print(f"  第1-7天:  {forecast.p10[:7].mean():.1f} / {forecast.p50[:7].mean():.1f} / {forecast.p90[:7].mean():.1f}")
    print(f"  第8-14天: {forecast.p10[7:14].mean():.1f} / {forecast.p50[7:14].mean():.1f} / {forecast.p90[7:14].mean():.1f}")
    print(f"\n安全库存规划 (提前期={14}天):")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：同类历史 SKU 销量序列（作为上下文）+ 新品基本属性（类目、价位）；粒度：SKU×日，预测可按周汇总。

**输出**：未来 4 周概率预测区间（P10/P50/P90）与安全库存计算输入（卡页示例：新品首月备货准确率由 ±60% 改善至 ±25%），供备货与安全库存设定使用。

## 执行步骤

1. 准备同类历史序列与新品属性
2. 调用开源基础模型做零样本推理
3. 输出概率区间并校验季节性形状
4. 对促销与节假日叠加规则修正
5. 换算安全库存供备货使用

## 边界与不做

- 数据不满足时不用：连同类历史序列都找不到时，零样本缺少上下文，只能退回人工类比估算。
- 能力边界：只提供概率预测与安全库存输入，不代替下单与库存策略决策。
- 能力边界：零样本在特殊促销与节假日场景准确率下降，需要叠加规则修正。

## 技能关联

- **可组合**：Skill-Time-Series-Pretraining-Foundation

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Time-Series-Pretraining-Foundation`