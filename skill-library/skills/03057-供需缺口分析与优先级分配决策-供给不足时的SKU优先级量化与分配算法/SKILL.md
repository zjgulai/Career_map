---
name: "p2s-demand-supply-matching-gap-analysis"
title: "供需缺口分析与优先级分配决策 — 供给不足时的SKU优先级量化与分配算法"
description: "触发词：供需缺口、优先级分配、渠道优先级、SKU分配、大促缺货。何时不用：需要按月对齐需求与供应计划、跑 S&OP 闭环时用S&OP销售与运营计划协同；需要大促备货追踪与紧急补货触发时用大促盘货S&OP流程自动化。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Demand-Supply-Matching-Gap-Analysis"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "供给不够时按毛利、平台权重和重要性算清优先级，把有限的货分给最该保的 SKU 和渠道。"
user_try: "试试：黑五前总备货比计划少 30%，帮我排出优先保证的 SKU 与渠道，并给出压缩供给和空运补缺的方案。"
whenToUse: "备货总量已定但供给不足、需要决定分配给哪些 SKU 与渠道时用本技能；需要先做需求与供应计划的月度对齐用S&OP销售与运营计划协同。"
workflow: "汇总各 SKU 需求计划与可供应量并计算总缺口 → 按毛利、渠道权重与 SKU 分级计算优先级 → 生成各 SKU 与渠道的分配方案 → 输出压缩供给、空运补缺与广告调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供需缺口分析与优先级分配决策 — 供给不足时的SKU优先级量化与分配算法

## ① 解决的问题

S&OP面临"供给不足时靠直觉分配库存"——多维优先级评分模型将AB类大促满足率从80%提升至95%，年化增量销售15-25万元

## ② 核心算法逻辑

供需缺口分析 是S&OP中最关键但最缺乏量化工具的决策场景：当供给不足以满足所有需求时，如何分配有限库存？

## ③ 业务应用场景

场景A：大促前供需缺口紧急分配 - 业务问题：Black Friday前2周发现总备货量比需求计划少30%，无法全部满足，需要决定哪些SKU/渠道先保证 - 数据要求：各SKU需求计划 + 可供应量 + 毛利率 + 平台重要性权重 - 预期产出： - 供需缺口：总缺口15,000件（-30%） - 优先保证：A类旗舰款（最高优先级，全量满足） - 压缩供给：C类配件（优先级低，削减50%） - 行动：旗舰款紧急空运500件补缺，配件申请暂停部分广告 - 业务价值：精准分配避免旗舰款断货（GMV损失约20万），同时控制总缺口影响 - 三轨验证： - 成本：数据采集需对接ERP/OMS及平台API
**场景B：多平台供需冲突下的渠道优先级决策** - **业务问题**：同款吸奶器在Amazon/TikTok Shop/独立站都有备货需求，但总库存不足，三个渠道应该如何分配 - **数据要求**：各渠道预计销量 + 渠道毛利率 + 各平台战略权重 - **预期产出**：Amazon优先（Buy Box排名影响最大）→ TikTok Shop次之 → 独立站最后 - **业务价值**：系统化决策代替拍脑袋，保护最重要渠道的排名和口碑 - **三轨验证**： - **成本**：需获取各平台实时库存与销量数据，TikTok Shop数据接口可能需额外付费；跨平台数据整合约需1周开发 - **合规

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：供需缺口精确分配使AB类旗舰款满足率从80%提升至95%，大促期间年化增量销售约15-25万元；同时避免CD类过度分配导致的积压
实施难度：⭐⭐⭐☆☆（需要建立优先级评分体系和跨部门共识，核心难点是权重设定）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞："供给不足时的分配决策是S&OP的核心价值，拍脑袋分配每次都是错的"）
评估依据：大促期间供给短缺是常态（需求难精确预测），系统化分配决策比直觉判断提升约30%的GMV效率

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/demand_supply_matching_gap_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Demand-Supply-Matching-Gap-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供需缺口分析与优先级分配决策
功能：供需缺口量化 / 多维度优先级评分 / 分配方案生成 / 行动建议
输入：需求计划 + 可供应量 + SKU属性
输出：分配方案 + 优先级排名 + 缺口行动计划
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_supply_demand_data(n_skus=25, seed=42):
    """生成供需数据"""
    np.random.seed(seed)
    
    abc_classes = np.random.choice(['A', 'B', 'C', 'D'], n_skus,
                                   p=[0.08, 0.24, 0.40, 0.28])
    channels = np.random.choice(['Amazon-US', 'TikTok', 'Shopify', 'Amazon-DE'],
                                n_skus, p=[0.50, 0.20, 0.20, 0.10])
    
    records = []
    for i in range(n_skus):
        abc = abc_classes[i]
        demand = {'A': 1500, 'B': 600, 'C': 200, 'D': 50}[abc] * np.random.uniform(0.6, 1.4)
        
        # 供应短缺场景：总体供应=需求的70%
        supply_ratio = np.random.uniform(0.55, 0.95)  # 有的SKU缺更多
        supply = demand * supply_ratio
        
        gross_margin = {'A': 0.45, 'B': 0.38, 'C': 0.30, 'D': 0.22}[abc]
        gross_margin *= np.random.uniform(0.85, 1.15)
        
        # 战略重要性（平台+品类）
        strategic = {
            'Amazon-US': 0.90, 'Amazon-DE': 0.75, 'TikTok': 0.70, 'Shopify': 0.65
        }[channels[i]] * {'A': 1.0, 'B': 0.85, 'C': 0.70, 'D': 0.50}[abc]
        
        # 缺货惩罚（断货会导致排名/流量损失）
        stockout_penalty = {'A': 0.95, 'B': 0.75, 'C': 0.50, 'D': 0.25}[abc]
        
        # 库存风险（过度分配的风险，滞销品风险高）
        inventory_risk = {'A': 0.10, 'B': 0.20, 'C': 0.40, 'D': 0.60}[abc]
        
        records.append({
            'sku_id': f'SKU-{i+1:03d}',
            'abc_class': abc,
            'channel': channels[i],
            'demand_qty': round(demand),
            'supply_qty': round(supply),
            'gap_qty': round(demand - supply),
            'gap_pct': round((demand - supply) / demand * 100, 1),
            'gross_margin': round(gross_margin, 3),
            'strategic_score': round(strategic, 3),
            'stockout_penalty': round(stockout_penalty, 3),
            'inventory_risk': round(inventory_risk, 3),
        })
    
    return pd.DataFrame(records)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.06782，但该号在 arXiv 上是《Star Formation in Self-gravitating Disks in Active Galactic Nuclei. III. Efficient Production of Iron and Infrared Spectral Energy Distributions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各 SKU 需求计划与可供应量、毛利率、平台重要性权重、SKU 分级（ABC）与渠道清单。

**输出**：供需缺口量化与优先级排名、分配方案（保证与削减清单）、缺口行动计划，供 S&OP 与运营团队执行。

## 执行步骤

1. 汇总需求计划与可供应量并计算总缺口
2. 按毛利、渠道权重与 SKU 分级计算优先级
3. 生成各 SKU 与渠道的分配方案
4. 输出压缩供给、空运补缺与广告调整建议

## 边界与不做

- 何时不用：需要先做需求与供应计划的月度对齐与滚动复盘时用S&OP销售与运营计划协同；需要大促备货追踪与紧急补货触发闭环时用大促盘货S&OP流程自动化。
- 能力边界：输出分配建议与优先级，不直接改库存占用或下单，跨部门权重仍需人工达成共识。
- 数据边界：需求计划与实时可供应量缺失时无法计算缺口，权重设定偏差会直接改变分配结果。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Inventory-Turnover-ABC-Classification.html、Skill-Inventory-Turnover-ABC-Classification、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Pre-Promo-Stocktaking-KPI.html、Skill-Pre-Promo-Stocktaking-KPI、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Demand-Supply-Matching-Gap-Analysis

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：04-供应链　·　源卡：`Skill-Demand-Supply-Matching-Gap-Analysis`