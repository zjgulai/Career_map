---
name: "p2s-supply-chain-total-cost-tco-model"
title: "全供应链总成本TCO模型 — 采购+仓储+物流+质量全链路成本分摊与年降目标"
description: "触发词：TCO总成本、成本分摊、供应商切换评估、成本率超标诊断、年降目标。何时不用：只看采购价格偏差归因用「采购价格达成率KPI」，算 BOM 层级原料成本传导用「BOM成本卷积」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-044"
l3_business: "采购比价"
l3_all: "采购比价 / 供应商评估"
l1_l2_l3: "业务运营/供应与履约/采购比价"
p2s_card_id: "Skill-Supply-Chain-Total-Cost-TCO-Model"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把采购、仓储、物流、退货、资金成本加总看全链路成本，判断便宜 8% 的供应商到底该不该换。"
user_try: "试试：新供应商报价比现在便宜 8%，帮我按 TCO 口径对比两家的全链路成本，再给切换建议。"
whenToUse: "本卡属采购比价中的全局成本视角：需要跨部门汇总全链路成本、评估供应商切换或定年降目标时用；只看采购价与预算的偏差归因，用采购价格达成率类技能。"
workflow: "归集采购、仓储、物流、退货、融资与管理人工五类成本 → 按 GMV 口径分摊并计算总 TCO 占比 → 对标行业均值定位超标成本项 → 做候选供应商 TCO 对比，输出切换建议与年降路径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 全供应链总成本TCO模型 — 采购+仓储+物流+质量全链路成本分摊与年降目标

## ① 解决的问题

决策层面临"只看采购价格误选供应商"——TCO=采购+仓储+物流+质量+资金全成本，识别真实TCO后年化避免误决策损失15-25万元

## ② 核心算法逻辑

TCO（Total Cost of Ownership，总拥有成本） 是陈凤霞书中供应链成本管控的终极视角——避免局部优化损害全局，例如：采购单价降低5%但导致质量下降，退货增加3%，净效果反而是亏损。

## ③ 业务应用场景

场景A：Momcozy吸奶器全链路TCO诊断 - 业务问题：CEO问"我们供应链成本到底是多少？"各部门只报自己的，没有全链路视角 - 数据要求：采购成本 + 仓储账单（FBA + 海外仓）+ 物流费 + 退货成本 + 融资利率 + 管理人工成本 - 预期产出： - 总TCO占GMV = 82%（行业平均78%，偏高4pp） - 最大超标项：物流成本率18%（目标12%，超6pp）→ 欧洲末程成本是主因 - 质量成本率2.8%（目标1.5%，超1.3pp）→ 来料IQC不严导致退货率高 - 业务价值：TCO从82%降至78% = GMV 1000万的品牌年节省40万元
场景B：两供应商TCO对比决策 - 业务问题：新供应商报价比现有便宜8%，是否切换？ - 数据要求：两家供应商的价格/OTIF/质量退货率/交期稳定性数据 - 预期产出： - 现有供应商TCO：102.5元/件（价格100 + 急采溢价2 + 质量成本0.5） - 新供应商TCO：110元/件（价格92 + 断货风险15 + 质量成本3） - 结论：不切换，价格便宜8%但TCO贵7.5% - 业务价值：避免因切换劣质供应商导致的实际成本上升
**三轨验证** | 成本轨：FBA备货优化方案，月均库存成本从12000元降至3600元（缺货率12%→3%），仓储费月均2400元，系统维护成本月均800元，人工预测与补货8小时/月（折合1200元），年化成本投入约54万元，相比缺货损失45万元，净收益约-9万元但风险规避价值显著 | 合规轨：符合亚马逊FBA库存管理政策（IPI评分需≥400），符合《跨境电商商品质量管理规范》，奶粉产品需提供入境检验检疫证书、营养标签合规性认证，符合目的地国（美国/欧盟）婴幼儿食品安全标准（FDA/EFSA），依据：亚马逊FBA政策文档、中国海关跨境电商监管要求 | 风险轨：库存积压风险（概率15%，季

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：TCO视角下，年GMV 1000万的品牌，供应链总成本率从82%降至78% = 直接节省40万元；供应商TCO对比避免切换劣质供应商，每年防止误决策损失约15-25万元
实施难度：⭐⭐⭐☆☆（需要跨部门数据整合，初次建立TCO模型有一定工作量，但后续维护简单）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞："不能只看单价，TCO是供应链决策的最终依据"；帮助团队从局部优化走向全局优化）
评估依据：书中案例：70%的采购降本失败是因为只看价格，忽视了OTIF、质量、资金成本的变化

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 43 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/supply_chain_total_cost_tco_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supply-Chain-Total-Cost-TCO-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
全供应链总成本 TCO 模型
功能：全链路成本分摊 / TCO占GMV率诊断 / 供应商TCO对比 / 年降目标规划
输入：各成本环节数据（月度/季度）
输出：TCO KPI报告 + 成本超标诊断 + 供应商TCO对比 + 降本路径
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_tco_data(months=12, monthly_gmv=5_000_000, seed=42):
    """生成月度全链路成本数据"""
    np.random.seed(seed)
    
    records = []
    for m in range(1, months + 1):
        is_q4 = m in [10, 11, 12]
        gmv = monthly_gmv * (1.4 if is_q4 else 1.0) * (1 + np.random.uniform(-0.1, 0.1))
        
        # 各成本项（占GMV的比例 + 波动）
        cogs_rate = np.random.uniform(0.58, 0.64)           # COGS 58-64%
        warehouse_rate = np.random.uniform(0.035, 0.055)    # 仓储 3.5-5.5%
        logistics_rate = np.random.uniform(0.14, 0.20)      # 物流 14-20%（偏高）
        quality_rate = np.random.uniform(0.020, 0.035)      # 质量 2-3.5%（偏高）
        capital_rate = np.random.uniform(0.015, 0.025)      # 资金 1.5-2.5%
        mgmt_rate = np.random.uniform(0.025, 0.035)         # 管理 2.5-3.5%
        
        # 旺季运营成本更高
        if is_q4:
            logistics_rate *= 1.15  # 大促物流溢价
            warehouse_rate *= 1.20  # 旺季仓储需求
        
        cogs = gmv * cogs_rate
        warehouse_cost = gmv * warehouse_rate
        logistics_cost = gmv * logistics_rate
        quality_cost = gmv * quality_rate
        capital_cost = gmv * capital_rate
        mgmt_cost = gmv * mgmt_rate
        total_tco = cogs + warehouse_cost + logistics_cost + quality_cost + capital_cost + mgmt_cost
        
        records.append({
            'month': m,
            'gmv': round(gmv),
            'cogs': round(cogs),
            'warehouse_cost': round(warehouse_cost),
            'logistics_cost': round(logistics_cost),
            'quality_cost': round(quality_cost),
            'capital_cost': round(capital_cost),
            'mgmt_cost': round(mgmt_cost),
            'total_tco': round(total_tco),
            'cogs_rate': cogs_rate,
            'warehouse_rate': warehouse_rate,
            'logistics_rate': logistics_rate,
            'quality_rate': quality_rate,
            'capital_rate': capital_rate,
            'mgmt_rate': mgmt_rate,
            'tco_rate': total_tco / gmv,
            'is_q4': is_q4,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2302.08561，但该号在 arXiv 上是《Topological Signal Processing over Weighted Simplicial Complexes》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：采购成本、仓储账单（FBA 加海外仓）、物流费、退货成本、融资利率、管理人工成本；按月度或季度、跨部门口径归集。

**输出**：TCO KPI 报告与 TCO 占 GMV 比率、成本超标项诊断、供应商 TCO 对比结论与降本路径，输出给 CEO 与供应链决策层。

## 执行步骤

1. 归集采购、仓储、物流、退货、融资与管理人工五类成本数据。
2. 按 GMV 口径分摊成本，计算总 TCO 占比。
3. 对标行业均值，定位超标最大的成本项与主因。
4. 对候选供应商做逐件 TCO 对比，给出切换或不切换结论。
5. 输出年降目标与降本路径。

## 边界与不做

- 何时不用：只有采购价、拿不到仓储物流与质量成本数据时无法做全链路分摊，不适用本技能。
- 能力边界：依赖跨部门数据口径统一，初次建模型工作量较大；TCO 对比基于历史成本，不预测供应商未来的交付质量波动。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supply-Chain-Working-Capital-Optimization.html、Skill-Supply-Chain-Working-Capital-Optimization、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Warehouse-Cost-Per-Unit-KPI.html、Skill-Warehouse-Cost-Per-Unit-KPI、Skill-Supply-Chain-Total-Cost-TCO-Model

---

> 分类：业务运营/供应与履约/采购比价　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Total-Cost-TCO-Model`