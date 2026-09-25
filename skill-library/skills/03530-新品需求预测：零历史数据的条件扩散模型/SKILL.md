---
name: "p2s-new-product-demand-cold-start"
title: "New Product Demand Cold Start — 新品需求预测：零历史数据的条件扩散模型"
description: "触发词：冷启动、全新品类、相似品检索、价格因子、分位数备货。何时不用：有强类比 SKU 只需类比估量时用「Bass 上市前预测」类技能；要按关联品比例联动补货时用「协整 VECM」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-New-Product-Demand-Cold-Start"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "全新品类也能给出三档备货量，把拍脑袋的首批决定变成有概率分布支撑的选择。"
user_try: "试试：帮我给这款 $59.99 的双模消毒器算 P10/P50/P90 首批备货量，我按 P60 下单。"
whenToUse: "全新品类组合、无任何历史、需要按相似品与价格因子给出分位数备货时用；有强类比 SKU 只需类比估量时用 Bass 上市前预测；按关联品比例补货用协整 VECM。"
workflow: "检索相似品并复核其历史曲线可比性 → 按价格溢价折算需求量（卡页：溢价 33% 折减约 25%） → 叠加季节性先验（卡页：Q4 约为 Q1 的 2.5 倍） → 输出 P10/P50/P90 并选定下单分位"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# New Product Demand Cold Start — 新品需求预测：零历史数据的条件扩散模型

## ① 解决的问题

UV-C+蒸汽双模消毒器等全新品类没有历史销售数据，工厂 MOQ 1000 件备少黑五缺货备多 Q1 压库——协同过滤迁移学习将首批备货预测误差从 ±60% 压缩至 ±25%，避免压库金额 20-50 万元/年

## ② 核心算法逻辑

所有时序预测模型（Prophet/LSTM/TFT）都有一个前提：需要足够的历史数据。但跨境卖家每月上架新品，新品上市时的库存决策（首批备货量）完全没有历史可参考，只能靠类比估算或"拍脑袋"。首批备货量偏差 30% 以上直接影响利润。

## ③ 业务应用场景

业务问题：团队开发了一款 UV-C+蒸汽双模式消毒器（$59.99），完全新品类组合，没有历史数据。工厂 MOQ 1000 件，备少了黑五缺货，备多了 Q1 压库存。
冷启动预测方案： 1. 检索相似品：现有 UV-C 消毒器（$49.99）+ 蒸汽消毒器（$39.99）的历史曲线 2. 价格调整因子：新品 $59.99 vs 相似品均值 $44.99，价格溢价 33% → 需求量折减约 25% 3. 季节性先验：母婴消毒器 Q4 需求约是 Q1 的 2.5× 4. 预测输出：P10=680件，P50=1,050件，P90=1,480件（首批 3 个月需求）
决策：选 P60 分位数 = 约 1,100 件（平衡缺货风险与资金占用）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
首批备货量误差从 ±40% 降低到 ±20%：减少过度备货资金占用 ¥10-40 万/批
黑五前新品避免缺货（提前追单）：挽回 GMV ¥5-30 万/款
新品 P&L 可预测：加速投资决策（从"感觉能卖"到"概率分布支撑"）
年化综合 ROI：¥30-100 万
实施难度：⭐⭐⭐☆☆（条件扩散模型需要 GPU；简化版（贝叶斯更新 + 类比法）1-2 周可实现）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（242 行）。**下面 55 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **55 行，未到上限**（可能即为源站发布的全部）。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 49 行：unterminated triple-quoted string literal (detected at line 55)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/new_product_demand_cold_start` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-New-Product-Demand-Cold-Start.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
New Product Demand Cold Start — 新品冷启动需求预测
基于 CDLF (arXiv: 2604.20370, 2026) + 贝叶斯更新

依赖: numpy, statistics, dataclasses (标准库)
生产环境: 替换为预训练 CDLF 模型推理
"""

from dataclasses import dataclass, field
import numpy as np
from statistics import mean, stdev


@dataclass
class NewProduct:
    """新品描述符"""
    sku_id: str
    category: str               # breast_pump / sterilizer / stroller / bottle
    price: float
    brand_tier: str             # new / mid / established
    feature_count: int          # 功能数（多功能 vs 单功能）
    target_market: str          # US / DE / JP / UK


@dataclass
class SimilarProduct:
    """参考相似品（有历史销售数据）"""
    sku_id: str
    category: str
    price: float
    brand_tier: str
    monthly_sales: list         # 过去12个月销售量（月度）
    launch_date_offset: int     # 上市时的月份（用于生命周期对齐）


@dataclass
class DemandForecast:
    """需求预测结果"""
    sku_id: str
    horizon_months: int
    p10: list                   # 悲观情景（P10分位数）
    p50: list                   # 基准情景
    p90: list                   # 乐观情景
    recommended_initial_order: int
    confidence_level: float     # 预测置信度（0-1，随数据积累增加）


class ColdStartForecaster:
    """
    新品冷启动预测器

    生产环境：
    替换为 CDLF 预训练模型：
    
print("[✓] New Product Demand Cold S 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.20370 — Cold-Start Forecasting of New Product Life-Cycles via Conditional Diffusion Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：相似品历史销量曲线与价格、新品价格与品类属性、季节性先验、MOQ 与前置期；粒度：SKU×周。

**输出**：首批 3 个月需求的分位数预测（卡页示例 P10=680 件、P50=1050 件、P90=1480 件）与下单分位建议，供首批采购决策使用。

## 执行步骤

1. 检索相似品清单并校验历史可比性
2. 计算价格差异带来的需求折减因子
3. 叠加季节性先验生成需求分布
4. 输出 P10/P50/P90 备货量
5. 按资金与缺货容忍度选定下单分位

## 边界与不做

- 数据不满足时不用：找不到任何可比相似品、且新品属性无法刻画时，分位数只是猜测的包装。
- 能力边界：只给概率分布与备货建议，不替 MOQ 谈判与资金占用做取舍。
- 能力边界：条件扩散版本需要 GPU，简化版（贝叶斯更新加类比法）精度更低但可 1-2 周落地。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-New-Product-Demand-Cold-Start

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-New-Product-Demand-Cold-Start`