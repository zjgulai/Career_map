---
name: "p2s-streaming-data-forecasting"
title: "Streaming Data Forecasting — 流式采集数据驱动的实时需求预测：采集→特征→预测端到端"
description: "触发词：流式预测、实时特征、漂移检测、在线更新、端到端管道。何时不用：T+1 批处理已够用、无突发响应需求时不必用；只要模型自适应而不要管道时用「在线增量学习」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 数据管道"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Streaming-Data-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "促销开始两小时内需求飙升也能立刻算出来并触发补货，不用等第二天的批处理结果。"
user_try: "试试：搭一条流式管道，把订单事件实时转成特征，促销一启动就刷新预测并给出补货建议。"
whenToUse: "需要把采集、特征、预测做成实时端到端、对突发事件要求分钟级响应时用；批处理够用则不必用；只要模型自适应用在线增量学习。"
workflow: "接入订单、价格、库存与社交信号等流式事件 → 用在线特征引擎生成实时特征快照 → 在线增量预测并叠加漂移检测 → 用保形预测区间输出补货触发信号"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Streaming Data Forecasting — 流式采集数据驱动的实时需求预测：采集→特征→预测端到端

## ① 解决的问题

运营经理面临实时数据来不及算——流式预测将响应延迟从30分降到2分，年化省12万元

## ② 核心算法逻辑

传统需求预测依赖离线批处理（T1 日数据训练，次日生效预测），对突发事件（爆品上线、竞品大促、舆情事件）响应迟滞 1224 小时。流式数据实时预测解决的核心问题：

## ③ 业务应用场景

业务背景：Prime Day 期间婴儿监视器需求在促销开始后 2 小时内飙升 8 倍，传统 T+1 批处理模型在促销开始前 12 小时仍预测正常销速，导致海外仓断货，损失 GMV 约 60 万元。
| 方案 | 断货时刻 | 断货损失 GMV | |------|---------|-------------| | 批处理 T+1 | 促销开始后 2h | ~60 万元 | | 流式预测（本方案） | 触发补货，未断货 | ~0 万元 | | 净收益 | — | ~60 万元 |
业务背景：母乳储奶袋需求受季节（夏天高温影响保鲜需求）+ 竞品活动 + 社交媒体育儿博主推荐的三重驱动。传统月度预测误差 MAPE 约 28%，导致频繁库存积压或断货。

## ④ 输入数据要求

可组合：Skill-CS-Supply-Chain-Feedback-Loop-Tag
可组合：Skill-Dynamic-Carrier-Selection-Tag-Driven

## ⑤ 输出结果

可组合：Skill-CS-Supply-Chain-Feedback-Loop-Tag
可组合：Skill-Dynamic-Carrier-Selection-Tag-Driven

## ⑥ 业务价值 / ROI

60 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（439 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/time_series/streaming_data_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Streaming-Data-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
流式采集数据驱动实时需求预测 Pipeline
整合在线特征工程 + ADWIN 漂移检测 + 增量预测 + Conformal PI
arXiv 参考: 2406.04356 (StreamFore: Online Time Series Forecasting),
           2310.07169 (ADWIN Adaptive Windowing for Concept Drift),
           2405.14682 (Conformal Prediction for Streaming Forecasts 2024)
"""

import time
import random
import numpy as np
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Optional, Tuple


# ── 数据结构 ─────────────────────────────────────────────────────────────

@dataclass
class StreamEvent:
    """流式事件（订单、价格变动、库存更新）"""
    timestamp: float         # Unix 时间戳
    event_type: str          # "order", "price_change", "stock_update", "social_signal"
    sku_id: str
    value: float             # 订单量/价格/库存件数/搜索热度指数
    source: str = ""


@dataclass
class RealtimeFeatures:
    """某 SKU 在 T 时刻的实时特征快照"""
    sku_id: str
    timestamp: float
    sales_ewma_5min: float = 0.0
    sales_ewma_30min: float = 0.0
    sales_ewma_2h: float = 0.0
    price_ratio: float = 1.0         # 己方价格 / 竞品最低价
    stock_days: float = 30.0         # 当前库存可售天数
    social_momentum: float = 0.0     # 搜索热度 1h 变化率
    drift_detected: bool = False


@dataclass
class ForecastResult:
    sku_id: str
    timestamp: float
    point_forecast: float
    lower_bound: float    # 95% CI 下界
    upper_bound: float    # 95% CI 上界
    safety_stock: float
    alert: Optional[str] = None   # 库存预警信息


# ── 在线实时特征引擎 ───────────────────────────────────────────────────────

class EWMAFeatureEngine:
    """
    增量 EWMA 特征引擎
    O(1) 更新，无需历史数据重扫
    """
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2012.04740 — River: machine learning for streaming data in Python

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：流式事件流（订单、价格变动、库存更新、社交信号）与实时特征快照；粒度：SKU×分钟到小时级事件。

**输出**：实时预测结果与不确定性区间、补货触发信号与断货风险提示（卡页对比中批处理断货损失约 60 万元、流式方案未断货），供海外仓实时补货决策使用。

## 执行步骤

1. 接入订单、价格、库存与社媒事件流
2. 生成实时特征快照
3. 在线更新预测并做漂移检测
4. 输出预测区间与补货触发信号

## 边界与不做

- 数据不满足时不用：事件流无法接入、或数据延迟远大于补货窗口时，实时预测失去意义。
- 能力边界：只产出实时预测与触发信号，真正的补货下单仍由模型外的控制层执行。
- 能力边界：卡页净收益（约 60 万元 GMV）为该案例估算，不外推到其他场景。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Realtime-Feature-Collection.html、Skill-Realtime-Feature-Collection
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Market-Signal-Realtime-Collection.html、Skill-Market-Signal-Realtime-Collection、Skill-Streaming-Data-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Streaming-Data-Forecasting`