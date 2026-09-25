---
name: "p2s-on-shelf-availability-sku-matrix"
title: "在架率多仓SKU矩阵计算 — 多仓×多SKU有货率精确口径与缺货金额加权"
description: "触发词：在架率、OSA矩阵、有货率、缺货金额、分仓缺货。何时不用：需要评估仓网布局与本地发货率时用本地订单达成率与FDC仓网覆盖KPI；需要做库龄结构与清仓触发时用库龄分段管理与资金成本化。安全边界：对外披露 OSA 数据须注明矩阵口径与单仓口径的差异，避免误导；使用第三方平台库存数据前须确认数据使用协议允许跨平台聚合。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-046"
l3_business: "履约跟踪"
l3_all: "履约跟踪"
l1_l2_l3: "业务运营/供应与履约/履约跟踪"
p2s_card_id: "Skill-On-Shelf-Availability-SKU-Matrix"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "用仓乘 SKU 的矩阵口径算真实有货率，暴露被总量掩盖的分仓缺货和缺货金额。"
user_try: "试试：用 20 个仓 500 个 SKU 的库存和日销数据算矩阵口径在架率，标出西部仓缺货的 A 类爆品。"
whenToUse: "需要精确口径的多仓在架率、分仓缺货定位与缺货金额加权时用本技能；仓网布局与本地率优化用本地订单达成率与FDC仓网覆盖KPI。"
workflow: "接入各仓各 SKU 库存、日销与单价数据 → 按仓乘 SKU 矩阵口径计算在架率 → 按金额加权计算缺货率并分品类拆解 → 输出补货优先级与调拨建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 在架率多仓SKU矩阵计算 — 多仓×多SKU有货率精确口径与缺货金额加权

## ① 解决的问题

多仓运营面临"虚报在架率掩盖分仓缺货"——仓×SKU矩阵口径比单SKU口径严格2-5pp，A类爆品OSA提升至99%年化增量销售15万元

## ② 核心算法逻辑

在架率（OnShelf Availability, OSA） 在多仓场景下不是简单的"有没有货"，而是一个 仓×SKU矩阵 的计算。陈凤霞书中给出了精确的矩阵口径，这是多数企业算错的核心原因。

## ③ 业务应用场景

场景A：多仓母婴平台OSA矩阵监控 - 业务问题：品牌在京东/天猫/自建仓等20个仓运营500+ SKU，"总体有货"但部分区域缺货导致跨仓发货，时效变差 - 数据要求：每个仓×每个SKU的实时库存量 + 日均销量 - 预期产出： - 整体OSA = 94.2%（矩阵口径，单仓口径虚高98.5%） - A类爆品（30个SKU）在西部仓缺货最严重（OSA 87%） - 缺货金额率 = 2.1%（A类产品单价高，金额影响大） - 业务价值：针对性补货西部仓，A类产品OSA提升至98%，本地订单达成率提升6pp
三轨验证： - 成本：需接入20个仓WMS实时库存API + 日均销量清洗，初期数据治理成本约3-5万元（人力+接口开发），后续每月运维约0.5万元 - 合规：不涉及Amazon政策/GDPR/广告法红线；但若使用第三方平台（如京东/天猫）库存数据，需确认数据使用协议是否允许跨平台聚合分析 - 风险：OSA矩阵口径暴露后，可能被采购团队质疑"标准太严"引发内部博弈；若公开披露OSA数据（如对投资人），需注明口径差异避免误导
场景B：跨境FBA多国仓OSA监控 - 业务问题：美国/德国/英国FBA三个市场同时运营，某SKU在德国FBA缺货但美国有货，是否跨国调拨？ - 数据要求：各国FBA库存 + 日均销量 + 跨国调拨成本 - 预期产出：德国FBA 5个SKU OSA = 0%（完全缺货），调拨成本 vs 空运补货成本对比 - 业务价值：系统化多国OSA监控，提前7天预警，减少FBA断货事件50%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：多仓OSA从94%提升至97%（矩阵口径）≈ 减少缺货率3pp → 年化减少缺货销售损失约15-25万元（按日均GMV 5万估算）；A类爆品OSA每提升1pp约贡献年增量销售4-8万元
实施难度：⭐⭐☆☆☆（需要WMS库存数据 + 日销数据联动，主要是口径统一工作）
优先级评分：⭐⭐⭐⭐⭐（陈凤霞书明确：矩阵口径是"真实有货率"，单SKU口径会系统性高估2-5pp）
评估依据：京东研究：FDC满足率提升1pp可节省库存持有成本4451万元（规模效应），中小品牌同比例约10-30万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（189 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/on_shelf_availability_sku_matrix` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-On-Shelf-Availability-SKU-Matrix.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
在架率多仓SKU矩阵计算体系
功能：多仓×SKU矩阵OSA / 金额加权缺货率 / DOS预警 / 分品类分析 / 补货优先级
输入：各仓库各SKU的库存量 + 日均销量 + 单价
输出：OSA矩阵报告 + 缺货预警 + 补货优先级列表
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_multi_warehouse_inventory(n_skus=50, n_warehouses=12, seed=42):
    """生成多仓×多SKU库存数据"""
    np.random.seed(seed)
    
    warehouses = [f'WH-{i:02d}' for i in range(1, n_warehouses + 1)]
    warehouse_regions = {f'WH-{i:02d}': region for i, region in enumerate(
        ['华东', '华东', '华北', '华北', '华南', '华南', '华西', '华西',
         'US-East', 'US-West', 'DE', 'GB'], 1)}
    
    abc_classes = np.random.choice(['A', 'B', 'C', 'D', 'E'],
                                    size=n_skus, p=[0.06, 0.14, 0.30, 0.30, 0.20])
    unit_prices = {'A': 180, 'B': 120, 'C': 60, 'D': 25, 'E': 10}
    base_daily_sales = {'A': 25, 'B': 12, 'C': 5, 'D': 2, 'E': 0.5}
    
    records = []
    for sku_idx in range(n_skus):
        sku = f'SKU-{sku_idx+1:03d}'
        abc = abc_classes[sku_idx]
        price = unit_prices[abc] * np.random.uniform(0.7, 1.3)
        daily_sales_base = base_daily_sales[abc] * np.random.uniform(0.5, 2.0)
        
        for wh in warehouses:
            # 模拟缺货情况：A类缺货较少，CDE类缺货较多
            oos_prob = {'A': 0.03, 'B': 0.06, 'C': 0.10, 'D': 0.15, 'E': 0.20}[abc]
            is_oos = np.random.random() < oos_prob
            
            if is_oos:
                inventory = 0
            else:
                # 库存量（DOS约10-40天）
                inventory = int(daily_sales_base * np.random.uniform(10, 40) + np.random.randint(0, 50))
            
            # 仓库区域的日均销量（权重不同）
            region_factor = {'华东': 1.4, '华北': 1.2, '华南': 1.1,
                             '华西': 0.6, 'US-East': 1.0, 'US-West': 0.8,
                             'DE': 0.4, 'GB': 0.3}.get(warehouse_regions[wh], 1.0)
            daily_sales = max(0.1, daily_sales_base * region_factor * np.random.uniform(0.7, 1.3))
            
            dos = inventory / daily_sales if daily_sales > 0 else 999
            
            records.append({
                'sku_id': sku,
                'warehouse': wh,
                'region': warehouse_regions[wh],
                'abc_class': abc,
                'unit_price': round(price, 2),
                'inventory': inventory,
                'daily_sales': round(daily_sales, 2),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2308.10293，但该号在 arXiv 上是《Privileged Anatomical and Protocol Discrimination in Trackerless 3D Ultrasound Reconstruction》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每个仓与每个 SKU 的实时库存量、日均销量与单价；多国场景还需各国 FBA 库存与跨国调拨成本。

**输出**：矩阵口径 OSA 报告与金额加权缺货率、分品类与分仓缺货清单、补货优先级列表与跨国调拨建议，供供应链与运营团队使用。

## 执行步骤

1. 接入各仓各 SKU 库存、日销与单价数据
2. 按仓乘 SKU 矩阵口径计算在架率
3. 按金额加权计算缺货率并分品类拆解
4. 输出补货优先级与调拨建议

## 边界与不做

- 何时不用：需要评估仓网布局与本地发货率时用本地订单达成率与FDC仓网覆盖KPI；库龄结构与清仓触发用库龄分段管理与资金成本化。
- 能力边界：输出口径更严格的有货率与补货优先级，不直接改库存分配或触发调拨单。
- 数据边界：矩阵口径需多仓 WMS 实时数据与日销清洗，口径不统一时 OSA 不可跨仓比较。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-Healthy-Inventory-Three-Layer-KPI.html、Skill-Healthy-Inventory-Three-Layer-KPI、Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Healthy-Inventory-Three-Layer-KPI.html、Skill-Healthy-Inventory-Three-Layer-KPI、Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration、Skill-On-Shelf-Availability-SKU-Matrix

---

> 分类：业务运营/供应与履约/履约跟踪　·　技术族：04-供应链　·　源卡：`Skill-On-Shelf-Availability-SKU-Matrix`