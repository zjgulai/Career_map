---
name: "p2s-flash-sale-realtime-sellthrough-forecast"
title: "大促实时售罄模拟与流量协同 — 电商大促中实时预测与紧急资源调配"
description: "触发词：大促实时监控、售罄模拟、流量协同、广告出价调整、滞销干预。何时不用：活动前的备货量预测用「LLM事件感知预测」，活动后的库存修正用「退货率时序预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 促销规划"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Flash-Sale-Realtime-Sellthrough-Forecast"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促中实时看卖得快不快，快售罄就压流量、卖不动就加投优惠券，别让爆款空转、滞销躺平。"
user_try: "试试：Prime Day 备货 800 件，前 3 小时卖了 450 件，帮我预测售罄时点并给出流量协同动作。"
whenToUse: "本卡属需求预测中的大促实时调度侧：活动进行中需要按小时更新售罄判断并即时调配流量与资源时用；活动前的备货量预测用事件感知预测类技能。"
workflow: "接入大促小时级历史销量、实时库存与广告竞价接口 → 按小时贝叶斯更新销售速率并模拟售罄时点 → 对提前售罄的爆款降出价并把流量导向配套品 → 对滞销品触发优惠券、评论加速与加价引流"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 大促实时售罄模拟与流量协同 — 电商大促中实时预测与紧急资源调配

## ① 解决的问题

大促爆款提前售罄或滞销品无人干预——Bayesian实时售罄模拟+流量协同将大促GMV提升$3.5万/次，年化两次大促防损$7-11万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：大促（Prime Day / 双11 / Black Friday）的核心难题是"时间压缩的不确定性"——平时30天的销量在2472小时内发生，任何预测偏差都会被极度放大。书中强调实时监控必须做到：每小时追踪售罄率、模拟剩余库存能撑多久、判断是否触发"流量协同"（压广告/转流量）。

## ③ 业务应用场景

场景A：Prime Day吸奶器实时售罄监控
- 业务问题：2024年Prime Day某母婴品牌旗舰吸奶器备货800件，大促开始后前3小时已销售450件，若按此速率大促结束前将售罄，损失后续12小时的销售机会 - 数据要求：大促前小时粒度历史销售数据（至少2次大促）、实时库存API、广告平台竞价API - 算法应用： 1. 大促开始后每小时Bayesian更新销售速率 2. 3小时后预测：按当前r=150件/小时，剩余350件库存在2.3小时后售罄（大促还剩21小时） 3. 触发流量协同：将吸奶器SP广告出价从$1.5降至$0.8（减少40%流量） 4. 同时将流量导向配套产品（吸奶器配件/储奶袋），带动关联销售$2万 5. 吸奶器最终
- 业务问题：黑色星期五备货了500件UV消毒盒，大促进行8小时只卖了15件，明显滞销 - 算法应用：实时检测售罄率仅3%（远低于预期20%），触发：①站内优惠券发放（-15%）②Vine计划加速评论③广告出价提升50%引流；大促后12小时销售量提升至45件，最终售罄率28%（vs无干预的3%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：年2次大促（Prime Day + Q4），每次爆款提前售罄损失$3-5万机会成本，滞销积压$2-3万；实时监控减少损失70%，年化收益$7-11万；系统建设成本$3万，ROI≈250-350%
实施难度：⭐⭐⭐☆☆（Bayesian更新算法简单，难点在于获取实时小时粒度销售数据API和广告平台API集成）
优先级：⭐⭐⭐⭐⭐（大促是全年最高价值时段，实时干预的边际价值极高）
适用规模：参与大促且单次大促GMV>$5万的卖家
数据依赖：历史大促小时销售数据（至少2次）、实时库存API、广告平台竞价API

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（251 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/flash_sale_realtime_sellthrough_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Flash-Sale-Realtime-Sellthrough-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
大促实时售罄模拟与流量协同系统
功能：Bayesian实时销售速率估算 + 售罄模拟 + 流量协同决策
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PromoSKU:
    """大促SKU状态"""
    sku_id: str
    initial_stock: int          # 大促前库存
    current_stock: int          # 当前库存
    target_sellthrough: float   # 目标售罄率（如0.85）
    prior_hourly_sales: float   # 先验每小时销量（基于历史大促）
    prior_confidence: float = 0.3  # 先验置信度（0-1）
    hourly_sales_history: List[float] = field(default_factory=list)


class BayesianSalesRateEstimator:
    """Bayesian实时销售速率估算"""
    
    def __init__(self, prior_mean: float, prior_std: float):
        self.mu = prior_mean      # 均值
        self.sigma2 = prior_std ** 2  # 方差
        self.observations = []
    
    def update(self, observed_sales: float, obs_noise_std: float = None) -> Tuple[float, float]:
        """Bayesian更新"""
        if obs_noise_std is None:
            obs_noise_std = max(self.mu * 0.3, 1.0)
        
        obs_sigma2 = obs_noise_std ** 2
        
        # Bayesian更新公式
        prior_precision = 1 / self.sigma2
        obs_precision = 1 / obs_sigma2
        
        new_precision = prior_precision + obs_precision
        new_mu = (prior_precision * self.mu + obs_precision * observed_sales) / new_precision
        new_sigma2 = 1 / new_precision
        
        self.mu = new_mu
        self.sigma2 = new_sigma2
        self.observations.append(observed_sales)
        
        return self.mu, np.sqrt(self.sigma2)
    
    @property
    def current_rate(self) -> float:
        return max(self.mu, 0.1)
    
    @property
    def uncertainty(self) -> float:
        return np.sqrt(self.sigma2)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.12038。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：大促前小时粒度历史销售数据（至少 2 次大促）、实时库存 API、广告平台竞价 API 数据；活动期间按小时滚动更新。

**输出**：实时销售速率与不确定性、售罄时点预测、流量协同与促销干预动作建议（含关联销售带动预估），输出给大促运营与广告投放团队。

## 执行步骤

1. 接入大促小时级历史销量、实时库存与广告竞价接口。
2. 按小时用贝叶斯更新销售速率，模拟售罄时点。
3. 对预计提前售罄的爆款下调出价，并把流量导向配套产品。
4. 对售罄率明显偏低的品触发优惠券、评论加速与加价引流。

## 边界与不做

- 何时不用：不足 2 次大促的小时级历史数据，或拿不到实时库存与广告竞价接口时无法闭环，不适用本技能。
- 能力边界：干预动作受平台广告与促销规则约束，效果随大促流量结构变化；只做实时决策支持，不替代活动前的备货规划。

## 技能关联

- **前置**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-InPromo-Realtime-Decision-KPI.html、Skill-InPromo-Realtime-Decision-KPI、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **延伸**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-InPromo-Realtime-Decision-KPI.html、Skill-InPromo-Realtime-Decision-KPI、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-InPromo-Realtime-Decision-KPI.html、Skill-InPromo-Realtime-Decision-KPI、Skill-Flash-Sale-Realtime-Sellthrough-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Flash-Sale-Realtime-Sellthrough-Forecast`