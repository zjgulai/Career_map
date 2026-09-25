---
name: "p2s-voc-supply-chain-signal-bridge"
title: "VOC Supply Chain Signal Bridge — 用户评论信号驱动供应链决策的跨域桥梁"
description: "触发词：VOC 信号、缺货投诉、DPI 指数、补货预警、竞品迁移。何时不用：要用评论情感作领先指标增强销量预测时用「VOC 趋势信号预测」；纯按销量驱动补货用常规预测。安全边界：评论采集需通过授权接口或合规方式获取，仅使用评论字段本身，不含个人身份信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-VOC-Supply-Chain-Signal-Bridge"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "库存系统还说健康，评论里的缺货抱怨已经涨了三周，这个信号比销量早四周发出补货预警。"
user_try: "试试：算一下我这 ASIN 近 90 天评论的缺货信号指数，超过阈值就提醒我上调安全库存。"
whenToUse: "评论中出现缺货、竞品迁移等领先信号、需要早于销量触发补货时用；要把情感做成领先指标增强预测用 VOC 趋势信号预测；纯销量驱动补货用常规预测。"
workflow: "采集目标 ASIN 近 90 天评论（日期、评分、文本、Verified 标记） → 用规则分类识别缺货与竞品迁移信号并计算 DPI → 按阈值输出补货与安全库存系数建议 → 从评论中提取配件需求挖掘新品机会"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Supply Chain Signal Bridge — 用户评论信号驱动供应链决策的跨域桥梁

## ① 解决的问题

库存系统显示健康但用户评论里缺货投诉已连续3周攀升——评论信号DPI指数比销量数据提前4周触发补货预警，避免旺季断货损失年化40-120万元同时捕获竞品迁移信号追回流失用户

## ② 核心算法逻辑

传统供应链只靠历史销量数据驱动补货——但销量是滞后的结果信号，用户评论才是领先信号。一条"买了三次总是缺货、只能去竞品买"的评论，比缺货后的销量下滑早了 26 周出现。

## ③ 业务应用场景

业务问题：亚马逊库存系统显示"库存健康"，但用户评论里"out of stock"投诉已连续3周上升。等到销量真正下跌才补货，Lead Time 45天，缺货窗口至少2个月。
数据要求： - 目标 ASIN 近90天评论（通过 Jungle Scout API 或爬虫） - 评论字段：日期、评分、评论文本、Verified Purchase 标记 - 同步获取：搜索关键词周搜索量趋势（Google Trends / Helium10）
预期产出： - 缺货信号仪表盘：每周自动计算 DPI，设置阈值告警 - 补货建议：DPI > 0.15 → 安全库存系数从 1.5 提升到 2.0 - 新品机会挖掘：提取"配件需求"评论，量化潜在市场规模

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前 3-4 周发现缺货风险，避免旺季断货损失：¥15-40 万/次
减少全年重大缺货事件 2-3 次：年化 ¥30-80 万
捕获竞品迁移信号，追单挽回用户：¥5-20 万/季度
年化综合 ROI：¥40-120 万
实施难度：⭐⭐☆☆☆（规则型信号分类无需 GPU；需要评论数据 API 接入，约 1 周工程量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/07-NLP-VOC/voc_supply_chain_signal_bridge` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Supply-Chain-Signal-Bridge.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Supply Chain Signal Bridge
用户评论信号 → 供应链补货决策桥梁
"""
import re
import numpy as np
import pandas as pd
from collections import defaultdict


# 缺货语义模式库（母婴品类定制）
STOCKOUT_PATTERNS = [
    r'out of stock', r'not available', r'unavailable', r'sold out',
    r'always missing', r'keep running out', r'constantly out',
    r'缺货', r'没货', r'断货', r'等了.*周', r'买不到',
    r'switched to', r'had to buy', r'went with.*instead',
]

DEMAND_SURGE_PATTERNS = [
    r'baby shower gift', r'must have', r'essential', r'highly recommend',
    r'bought.*more', r'reorder', r'stock up', r'buying again',
    r'perfect for newborn', r'trending',
]

COMPETITOR_SWITCH_PATTERNS = [
    r'switched (from|to) (medela|momcozy|spectra|lansinoh|haakaa)',
    r'(medela|momcozy|spectra) instead',
    r'going back to',
    r'competitor',
]


def classify_review_signals(reviews_df):
    """
    对评论进行信号分类
    Input: DataFrame with columns [date, rating, text, verified]
    Output: DataFrame with signal labels
    """
    def detect_signals(text):
        text_lower = str(text).lower()
        signals = []
        for p in STOCKOUT_PATTERNS:
            if re.search(p, text_lower):
                signals.append('stockout')
                break
        for p in DEMAND_SURGE_PATTERNS:
            if re.search(p, text_lower):
                signals.append('demand_surge')
                break
        for p in COMPETITOR_SWITCH_PATTERNS:
            if re.search(p, text_lower):
                signals.append('competitor_switch')
                break
        return signals if signals else ['neutral']

    reviews_df = reviews_df.copy()
    reviews_df['signals'] = reviews_df['text'].apply(detect_signals)
    reviews_df['is_stockout'] = reviews_df['signals'].apply(lambda x: 'stockout' in x)
    reviews_df['is_demand_surge'] = reviews_df['signals'].apply(lambda x: 'demand_surge' in x)
    reviews_df['is_competitor_switch'] = reviews_df['signals'].apply(lambda x: 'competitor_switch' in x)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2210.10015，但该号在 arXiv 上是《Towards Task-Specific Modular Gripper Fingers: Automatic Production of Fingertip Mechanics》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标 ASIN 近 90 天评论（日期、评分、评论文本、Verified Purchase 标记）与同步的关键词周搜索量趋势；粒度：ASIN×日。

**输出**：缺货信号仪表盘所需的 DPI 指数与阈值告警、安全库存系数调整建议（卡页：DPI>0.15 时系数由 1.5 提到 2.0），以及配件需求与新品机会清单，供供应链与选品使用。

## 执行步骤

1. 采集并清洗近 90 天评论字段
2. 分类缺货与竞品迁移信号并计算 DPI
3. 按阈值输出补货与安全库存系数建议
4. 从评论中提取配件与新品机会

## 边界与不做

- 数据不满足时不用：评论量过少、或采集方式不合法可用时，DPI 的统计意义与合规性都不成立。
- 能力边界：只输出信号与建议系数，实际下单与安全库存改写由模型外的控制层执行。
- 能力边界：规则分类需按品类语料维护，漏检与误报都会直接影响补货动作。

## 技能关联

- **前置**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-VOC-Supply-Chain-Signal-Bridge

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Supply-Chain-Signal-Bridge`