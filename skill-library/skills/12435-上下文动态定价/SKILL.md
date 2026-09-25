---
name: "p2s-ucb-ldp-dynamic-pricing"
title: "UCB-LDP Dynamic Pricing（上下文动态定价）"
description: "触发词：在线学习定价、上下文选价、候选价选择、实时报价、反馈闭环、隐私保护。何时不用：按库存窗口定价用「EMSR-b 边际库存定价」；需要理论 Regret 保证的上下文定价用「最优上下文定价」。安全边界：个性化报价须满足隐私与反价格歧视合规，展示价与结算价必须一致且可解释。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-UCB-LDP-Dynamic-Pricing"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "进站就按上下文选一个价：从几个候选价里挑最优的，拿到买或不买的反馈后当天就更新模型。"
user_try: "试试：我的独立站同时来北美高净值和东南亚价格敏感流量，帮我接一版按上下文选价的定价器。"
whenToUse: "当访客流量混合、需要在 3-5 个候选价中按上下文实时抉择、并能在 24 小时内闭环更新时用本技能；若按库存分层定价，用「EMSR-b 边际库存定价」；若需要带理论 Regret 保证的上下文定价，用「最优上下文定价」。"
workflow: "采集用户上下文特征：设备档次、地区购买力、停留时长、浏览深度、回访标记 → 初始化定价器与回归预言机，设定候选价格集合 → 用户进站时用选价函数输出展示价格 → 收到购买反馈后更新模型并跟踪累积 Regret"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# UCB-LDP Dynamic Pricing（上下文动态定价）

## ① 解决的问题

独立站每天面对来自北美高净值用户（iPhone + 5分钟停留）和东南亚价格敏感用户（安卓 + 10秒跳出）的混合流量

## ② 核心算法逻辑

在电商动态定价中，用户真实的保留价格（Valuation，即"最多愿意出多少钱"）是不可观测的——你唯一能看到的是在展示价格 $p$ 下用户是否购买（Binary Buy/NoBuy 反馈）。每位用户的购买意愿又由其上下文（设备、地区、停留时长等）决定。

## ③ 业务应用场景

业务问题：独立站每天面对来自北美高净值用户（iPhone + 5分钟停留）和东南亚价格敏感用户（安卓 + 10秒跳出）的混合流量。统一定价 $99 会导致高净值用户利润流失、低净值用户转化率下降，两头都不优。
数据要求： | 特征 | 字段 | 来源 | |------|------|------| | 设备档次 | device_score (0-1) | GA4 设备类型 | | 地区购买力 | region_score (0-1) | IP 归属地 | | 页面停留时长 | dwell_time (归一化) | 埋点日志 | | 浏览深度 | browse_depth | 前端埋点 | | 是否回访用户 | return_visit (0/1) | Cookie / 用户 ID | | 购买 / 未购买 | reward (0/1) | 订单系统 |
预期产出： - 每位用户进站时实时输出最优展示价格（从 3-5 个候选价中选1个） - 算法自动区分高意向用户（高价格）和低意向用户（低价格） - 每日更新预言机模型权重，反馈闭环 < 24h

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

500万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（35 行）。**下面 35 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **35 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，35 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/ucb_ldp_dynamic_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-UCB-LDP-Dynamic-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
快速使用：插入自己的回归预言机，开始实时定价
"""
import numpy as np
from model import (
    UCBLDPPricer,
    LinearRegressionOracle,
    UserContext,
    ContextualPricingEnvironment,
)

# 1. 初始化定价器（替换 LinearRegressionOracle 为 XGBoost Oracle 即可）
oracle = LinearRegressionOracle(
    n_features=6,   # 5维 Context + 1维 price
    ridge_alpha=1.0,
)
pricer = UCBLDPPricer(
    price_candidates=[89.0, 99.0, 109.0],
    oracle=oracle,
    ucb_alpha=1.0,
)

# 2. 用户到来：选择价格
user_features = np.array([0.9, 0.8, 0.7, 0.6, 1.0])  # 高净值用户
ctx = UserContext(features=user_features)
price = pricer.select_price(ctx)
print(f"展示价格: ${price}")

# 3. 用户反馈：闭环更新
reward = 1  # 用户购买
pricer.observe(ctx, price, reward)

# 4. 查看累计 Regret（仿真评估时使用）
regrets = pricer.cumulative_regret()
print("[✓] UCB LDP Dynamic Pricing 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.17184 — Minimax Optimality in Contextual Dynamic Pricing with General Valuation Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：每位访客的上下文特征：设备档次、地区购买力评分、页面停留时长、浏览深度、是否回访，以及购买或未购买的奖励信号；粒度为访客 × 会话。

**输出**：每位用户进站时的展示价格（从候选价中选一）与每日更新的预言机权重，以及仿真评估用的累积 Regret；供独立站定价与前端投放使用。

## 执行步骤

1. 采集用户上下文特征并做归一化
2. 初始化定价器与回归预言机并设定候选价
3. 用户进站时按上下文选出展示价格
4. 用购买奖励更新模型并跟踪累积 Regret

## 边界与不做

- 数据不满足：拿不到上下文特征或购买反馈时无法闭环学习，只能退化为静态定价。
- 何时不用：库存驱动的定价用「EMSR-b 边际库存定价」；需要理论 Regret 保证用「最优上下文定价」。
- 能力边界：只做候选价选择与模型更新，不含前端报价系统改造与合规审查。
- 安全边界：个性化报价须满足隐私与反价格歧视合规，展示价与结算价必须一致。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-MAB-Thompson-Sampling
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Customer-LTV-Prediction
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Generative-Agent-Simulation.html、Skill-Generative-Agent-Simulation、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-UCB-LDP-Dynamic-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：06-增长模型　·　源卡：`Skill-UCB-LDP-Dynamic-Pricing`