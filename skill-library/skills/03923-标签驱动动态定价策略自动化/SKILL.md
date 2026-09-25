---
name: "p2s-tag-informed-dynamic-pricing"
title: "Tag-Informed Dynamic Pricing — SKU标签驱动动态定价策略自动化"
description: "触发词：标签定价、规则树、库存标签、旺季涨价、阶梯降价、SKU 上下文。何时不用：按库存窗口算影子价格用「EMSR-b 边际库存定价」；按折扣率算清仓路径用「折扣清仓定价优化」。安全边界：强化学习微调须设价格变动上限硬约束，冷启动期人工复核，动态定价规则需在详情页公示。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 促销规划"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Tag-Informed-Dynamic-Pricing"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给每个 SKU 贴上库存、竞争、季节、生命周期标签，标签一变价格就跟着变，不用人盯着调。"
user_try: "试试：我旧款吸奶器积压 800 件，帮我用库存标签触发一版阶梯降价清仓方案。"
whenToUse: "当 SKU 状态（库存天数、竞争强度、季节、生命周期）可以用规则映射到定价动作、且希望自动跟随时用本技能；若要以库存窗口算边际收益价格，用「EMSR-b 边际库存定价」；若要算清仓折扣最优路径，用「折扣清仓定价优化」。"
workflow: "按库存天数、竞品数量、月份与上架天数给 SKU 打标签 → 用标签到定价的规则树匹配定价动作，如危险积压触发阶梯降价 → 用强化学习在规则区间内微调调价幅度 → 用价格变动上限硬约束裁剪最终决策 → 按月复核标签准确率与清仓、涨价目标的达成情况"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Informed Dynamic Pricing — SKU标签驱动动态定价策略自动化

## ① 解决的问题

定价负责人面临"库存积压了但不知道该降多少价清仓还是继续持有"——标签条件映射定价规则树将库存异常到定价响应从人工3天压缩至自动4小时，年化毛利改善50万元

## ② 核心算法逻辑

本 Skill 将 SKU 维度的结构化标签（库存健康标签/竞争强度标签/季节性标签/生命周期标签）作为定价决策的上下文输入，通过「标签→定价规则树 + RL 微调」实现「标签即定价触发器」的全自动定价。

## ③ 业务应用场景

场景A：婴儿推车旺季（Q4 黑五）涨价优化 - 业务问题：Q4 旺季未能及时涨价，比竞品低 12% 但利润损失超过竞争优势带来的销量增量 - 数据要求：SKU 季节性标签（基于历史销量曲线自动生成）+ 竞品价格监控数据（每小时采集） - 预期产出：旺季高峰标签触发提价 10%，ACOS 降低 18%，利润率从 22% 提升至 28% - 业务价值：Q4 利润率提升 6ppt，年化利润增量约 25 万元（假设 Q4 GMV 400 万）
场景B：吸奶器积压库存智能清仓 - 业务问题：旧款吸奶器积压 800 件，仓储成本每月 $0.5/件，占用资金 24 万元 - 数据要求：库存天数标签（WMS 实时生成）+ 历史降价弹性数据 - 预期产出：`危险积压(>90天)` 标签触发阶梯降价（第1周-15%，第2周-20%，第3周-25%），清仓周期从 120 天压缩至 35 天 - 业务价值：年化释放库存资金约 20 万元，减少仓储成本约 5 万元
三轨验证 | 成本轨：模型训练与维护月均3,200元（GPU算力1,500元+标注人工20小时/月@80元/小时=1,600元+系统运维200元），ROI周期4个月（日均订单提价2-3%，月增收8,000-12,000元） | 合规轨：符合《电商平台商品信息规范》GB/T 39560-2020，标签分类遵循《母婴产品分类与编码》标准，动态定价需公示基础价格，合规结论：可行，需在商品详情页标注"AI智能定价"标签 | 风险轨：标签误识别率6%（目标94%准确率下仍存在偏差）导致错误定价，概率15%/月；消费者投诉动态价格不透明，概率12%/月；竞对跟风压价，概率25%/月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：旺季涨价 12% 贡献利润率 +6ppt，年化 25 万元；库存清仓加速释放资金 20 万元，减少仓储成本 5 万元，合计年化价值约 50 万元
实施难度：⭐⭐⭐☆☆（规则树 1-2 周可上线，RL 微调需 3-6 个月历史数据训练）
优先级：⭐⭐⭐⭐⭐（定价直接影响利润率，Q4 旺季前必须落地）
数据门槛：库存天数实时更新（WMS 每日同步），竞品价格每小时采集，历史销量≥6个月
风险：RL 模型冷启动阶段可能产生异常定价，需设置 ±15% 的价格变动上限硬约束

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（268 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_informed_dynamic_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Informed-Dynamic-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Informed Dynamic Pricing
SKU标签驱动动态定价策略自动化

依赖：numpy, pandas
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import json


# ─── 1. SKU 标签体系定义 ──────────────────────────────────────────────────────

# 库存健康标签
INVENTORY_TAGS = {
    "缺货危险": lambda days: days <= 7,
    "低库存": lambda days: 7 < days <= 21,
    "正常": lambda days: 21 < days <= 60,
    "积压警告": lambda days: 60 < days <= 90,
    "危险积压": lambda days: days > 90,
}

# 竞争强度标签
COMPETITION_TAGS = {
    "激烈": lambda n_comp: n_comp >= 5,
    "中等": lambda n_comp: 2 <= n_comp < 5,
    "宽松": lambda n_comp: n_comp < 2,
}

# 季节性标签
SEASON_TAGS = {
    "旺季高峰": lambda month: month in [11, 12],
    "旺季": lambda month: month in [6, 7, 10],
    "平季": lambda month: month not in [11, 12, 6, 7, 10],
}

# 生命周期标签
LIFECYCLE_TAGS = {
    "新品期": lambda age_days: age_days <= 30,
    "成长期": lambda age_days: 30 < age_days <= 120,
    "成熟期": lambda age_days: 120 < age_days <= 365,
    "衰退期": lambda age_days: age_days > 365,
}


@dataclass
class SKUContext:
    sku_id: str
    current_price: float
    cost_price: float
    inventory_days: float       # 当前库存可销售天数
    n_competitors: int          # 同价格区间竞品数
    month: int                  # 当前月份
    product_age_days: int       # 产品上架天数
    competitor_min_price: float # 竞品最低价
    tags: Dict[str, str] = field(default_factory=dict)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.14223，但该号在 arXiv 上是《Wigner measures of electromagnetic waves in heterogeneous bianisotropic media》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 的实时库存天数、同价格区间竞品数与竞品最低价、当前月份、产品上架天数、当前价与成本价；数据门槛为库存天数实时更新、竞品价格每小时采集、历史销量不少于 6 个月。

**输出**：按标签触发的定价动作与建议价（含旺季提价与阶梯降价序列），以及利润率、广告成本与清仓周期的预期变化；供定价运营按规则执行。

## 执行步骤

1. 按库存、竞争、季节、生命周期四类给 SKU 打标签
2. 用规则树把标签映射为定价动作
3. 用强化学习微调规则区间内的调价幅度
4. 用价格变动上限硬约束裁剪决策
5. 按月复核标签准确率与目标达成情况

## 边界与不做

- 数据不满足：库存天数不实时、竞品价格采集频率不足或历史销量不足 6 个月时标签会失真。
- 何时不用：库存窗口边际定价用「EMSR-b 边际库存定价」；清仓折扣路径用「折扣清仓定价优化」。
- 能力边界：只做标签映射与定价建议，不含 WMS 与竞品采集系统接入、也不含改价执行。
- 安全边界：强化学习冷启动期须人工复核，价格变动设上下限硬约束，定价规则需公示。

## 技能关联

- **前置**：Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger
- **延伸**：Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger
- **可组合**：Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Informed-Dynamic-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Informed-Dynamic-Pricing`