---
name: "p2s-cross-border-last-mile-routing"
title: "Cross-Border Last Mile Routing — 跨境最后一公里路由优化：时效×成本双目标决策"
description: "触发词：最后一公里选路、分区路由、大促切换承运商、时效成本权衡、延迟差评治理。何时不用：要逐票追踪包裹到货异常用「到货异常追踪」，要和承运商比价签约用「采购比价」；本技能只输出分区路由评分与切换阈值。安全边界：切换阈值与降权规则须运营人工确认后上线，模型不直接改价或改承运商合同。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 到货异常追踪"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Cross-Border-Last-Mile-Routing"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按分区与重量段给承运商打分，大促准时率下滑时自动降权换承运商，压低配送成本与延迟差评。"
user_try: "试试：黑五 FedEx 在 Zone 7-8 从 5 天延到 9 天，帮我出一张按 Zone 和重量段该切给谁的对照表。"
whenToUse: "需要按 Zone、重量段与时期出承运商路由建议并设定大促切换阈值时用；要单票追踪到货异常用「到货异常追踪」，要谈承运商合同价用「采购比价」。"
workflow: "接入各承运商分区分重量段的报价与时效承诺 → 按成本、时效、可靠性三项目标算承运商综合评分 → 按经济、标准、加急调整权重并输出分区路由决策表 → 设定大促期准时率下滑的自动降权触发条件 → 估算切换后的月均配送成本变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Border Last Mile Routing — 跨境最后一公里路由优化：时效×成本双目标决策

## ① 解决的问题

黑五大促FedEx在Zone7-8时效从5天延到9天但运营不知道该切换哪个carrier——多目标路由评分模型实时监测准时率自动切换最优carrier，减少延迟差评率30-50%，年化综合ROI30-80万元

## ② 核心算法逻辑

跨境电商最后一公里的路由决策面临三维矛盾：时效（用户期望快）× 成本（运营要低）× 可靠性（风控要可追溯）。传统方案（历史经验配送商选择）无法动态响应大促峰值、退货激增、新区域开拓等场景。

## ③ 业务应用场景

业务问题：黑五备货全走 FedEx，但大促爆单后 FedEx 在 Zone 7-8 时效从 5 天延到 9 天。运营不知道应该在哪些区域切换到 UPS 或 USPS，手动决策滞后 2-3 天，产生大量差评。
数据要求： - 历史订单：邮编/Zone/重量/选用 carrier/实际配送天数/是否准时 - 实时运力：各 carrier API 的时效承诺（FedEx Service Alerts、UPS Notifications） - 成本台账：各 carrier 分区分重量段报价
预期产出： - 自动路由决策表：Zone × 重量段 × 时期 → 推荐 carrier + 备选 - 大促切换触发条件：准时率 < X% 自动降权该 carrier 在该 Zone - 成本预测：月均配送成本节省估算

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
大促期自动路由切换：减少延迟差评率 30-50%，保护 BSR 排名，季度影响 ¥10-30 万
区域差异化选路：配送成本降低 8-15%，月均 GMV ¥100 万规模节省 ¥8-15 万/月
逆向物流优化：退货成本降低 25-35%，高退货品类年节省 ¥8-25 万
年化综合 ROI：¥30-80 万
实施难度：⭐⭐☆☆☆（需要 carrier API 接入 + 历史配送数据；规则版本1周可实现；ML 版本约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（105 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/logistics/cross_border_last_mile_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Cross-Border-Last-Mile-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Cross-Border Last Mile Routing Optimizer
多目标 Carrier 路由决策模型（跨境最后一公里）
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor


# 运力配置（模拟）
CARRIER_CONFIG = {
    'FedEx_Ground':    {'base_cost_per_lb': 8.50, 'zone_eta': {1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:8, 8:9}},
    'UPS_Ground':      {'base_cost_per_lb': 8.20, 'zone_eta': {1:2, 2:3, 3:4, 4:5, 5:6, 6:7, 7:9, 8:10}},
    'USPS_Priority':   {'base_cost_per_lb': 7.80, 'zone_eta': {1:1, 2:2, 3:2, 4:3, 5:3, 6:4, 7:4, 8:5}},
    'FedEx_Express':   {'base_cost_per_lb': 18.50,'zone_eta': {1:1, 2:1, 3:2, 4:2, 5:2, 6:3, 7:3, 8:3}},
}

# 实时运力权重（模拟大促期FedEx拥堵）
CARRIER_RELIABILITY = {
    'normal':     {'FedEx_Ground':0.96, 'UPS_Ground':0.95, 'USPS_Priority':0.93, 'FedEx_Express':0.98},
    'peak_promo': {'FedEx_Ground':0.82, 'UPS_Ground':0.91, 'USPS_Priority':0.90, 'FedEx_Express':0.96},
}


def compute_routing_score(carrier, zone, weight_lb, period='normal',
                          w_cost=0.4, w_eta=0.35, w_reliability=0.25):
    """计算 carrier 路由综合评分"""
    config = CARRIER_CONFIG[carrier]
    reliability = CARRIER_RELIABILITY[period][carrier]

    cost = config['base_cost_per_lb'] * weight_lb * (1 + zone * 0.05)
    eta_days = config['zone_eta'][zone]

    # 归一化（基于最大值）
    max_cost = 18.50 * weight_lb * 1.4
    max_eta = 10

    score = (w_cost * (1 - cost / max_cost) +
             w_eta * (1 - eta_days / max_eta) +
             w_reliability * reliability)
    return {
        'carrier': carrier,
        'cost': round(cost, 2),
        'eta_days': eta_days,
        'reliability': reliability,
        'score': round(score, 4),
    }


def route_package(zone, weight_lb, urgency='standard', period='normal'):
    """为单个包裹选择最优 carrier"""
    # 时效要求不同时调整权重
    weight_map = {
        'economy':  (0.55, 0.20, 0.25),
        'standard': (0.40, 0.35, 0.25),
        'express':  (0.20, 0.55, 0.25),
    }
    w_cost, w_eta, w_rel = weight_map.get(urgency, (0.40, 0.35, 0.25))

    scores = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.07648，但该号在 arXiv 上是《Incorporating Class-based Language Model for Named Entity Recognition in Factorized Neural Transducer》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史订单明细：邮编与 Zone、重量、选用的承运商、实际配送天数、是否准时；各承运商分区分重量段报价与时效承诺；实时运力告警（如 FedEx Service Alerts、UPS Notifications）用于修正可靠性权重。粒度：订单级加承运商×Zone×重量段报价表。

**输出**：自动路由决策表（Zone × 重量段 × 时期 → 推荐承运商 + 备选）、大促期准时率跌破阈值的自动降权触发条件，以及切换后的月均配送成本与时效预测；供运营在大促前批量改路由规则使用。

## 执行步骤

1. 汇总历史订单的 Zone、重量、承运商与实际配送天数、准时标记
2. 接入各承运商分区报价与实时时效承诺、运力告警
3. 按成本、时效、可靠性三项加权算出各承运商综合评分
4. 按经济、标准、加急三档调整权重，生成分区路由决策表
5. 设定准时率跌破阈值的自动降权条件并估算切换后的成本变化

## 边界与不做

- 数据不满足时不用：缺分区分重量段的承运商报价或历史准时率，评分与切换阈值都无从计算。
- 只输出路由评分、决策表与切换触发条件，不直接改承运商合同或前台运费设置。
- 卡页 ROI（年化综合 30-80 万元、延迟差评率减少 30-50%）为估算口径，落地前须用本店实际数据重算。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Crowdsourced-Last-Mile-AI-Dispatch.html、Skill-Crowdsourced-Last-Mile-AI-Dispatch、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Crowdsourced-Last-Mile-AI-Dispatch.html、Skill-Crowdsourced-Last-Mile-AI-Dispatch、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **可组合**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Crowdsourced-Last-Mile-AI-Dispatch.html、Skill-Crowdsourced-Last-Mile-AI-Dispatch、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Cross-Border-Last-Mile-Routing

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Cross-Border-Last-Mile-Routing`