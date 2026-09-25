---
name: "p2s-local-order-fulfillment-rate-fdc"
title: "本地订单达成率与FDC仓网覆盖KPI — 本地发货率/跨仓调拨成本/仓网优化决策"
description: "触发词：本地发货率、仓网覆盖、FDC、跨仓调拨、分仓策略。何时不用：需要监控多仓在架率口径与分仓缺货时用在架率多仓SKU矩阵；需要做配送时效与体验权衡时用 B2C配送时效与体验KPI。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-046"
l3_business: "履约跟踪"
l3_all: "履约跟踪 / 物流方案"
l1_l2_l3: "业务运营/供应与履约/履约跟踪"
p2s_card_id: "Skill-Local-Order-Fulfillment-Rate-FDC"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "算清本地发货率和跨仓调拨成本，判断该不该新增仓，让货离客户更近。"
user_try: "试试：用我的订单地理分布和发货仓数据算本地率，评估在新泽西增设 RDC 的收益。"
whenToUse: "需要评估仓网布局、本地发货率与跨仓调拨成本时用本技能；分仓在架率与缺货口径用在架率多仓SKU矩阵。"
workflow: "整理订单地理分布与发货仓数据 → 计算本地率与跨仓调拨成本 → 模拟新增仓或共仓后的本地率变化 → 输出仓网优化方案与时效成本对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 本地订单达成率与FDC仓网覆盖KPI — 本地发货率/跨仓调拨成本/仓网优化决策

## ① 解决的问题

供应链规划者面临"跨仓发货成本高且时效差"——本地率75-80%最优区间+FDC覆盖ROI决策，本地率每提升1pp节省持有成本约千万量级

## ② 核心算法逻辑

本地订单达成率（Local Order Fulfillment Rate） 是衡量仓网合理性的核心KPI。陈凤霞书中引用京东案例：FDC满足率提升1.47pp，年化节省库存持有成本4451万元。

## ③ 业务应用场景

场景A：Momcozy美国市场FDC仓网优化 - 业务问题：美国市场只有1个中央仓（加州），东海岸订单配送需要5-7天，FBA是主要渠道但自营海外仓本地率极低 - 数据要求：按州/地区的订单量分布 + 当前发货仓 + 是否本地发货 - 预期产出： - 当前本地率 = 41%（东部市场只有从加州发货） - 建议：在新泽西增设RDC → 本地率提升至72% - 预计节省：时效从5-7天→2-3天，物流成本降低$0.8/件 - 业务价值：本地率从41%提升至72%，年化物流成本节省约15万元，Prime成员配送时效合规
场景B：多渠道母婴平台分仓策略优化 - 业务问题：同时在京东/天猫/自营三个渠道销售，各渠道仓独立，造成库存重复备货 - 数据要求：各渠道/各仓订单量 + 发货仓 + 本地发货率 - 预期产出：通过共仓策略（FDC仓同时服务多渠道），本地率从65%提升至78% - 业务价值：减少跨仓调拨，年化节省约12万元
**三轨验证** | 成本轨：FBA备货系统优化月均成本3,200元（仓储管理系统1,500元/月+数据分析工具1,200元/月+人工运维12小时/月×100元/小时），首期投入8万元建立预测模型，ROI周期4个月，年化成本38.4万元，相比缺货损失45万元节省6.6万元 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》第12条备货要求，满足亚马逊FBA库存政策（库存周转率≥2次/年），通过ISO9001质量管理体系认证，符合婴幼儿食品进口备案制度 | 风险轨：需求预测偏差风险（概率35%，可通过AI模型优化至15%）、汇率波动影响采购成本（概率40%，可用套期保值对冲）、FBA仓储

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：本地率从60%提升至75%，年化节省配送成本约10-20万元（取决于规模）；京东案例：+1.47pp → 节省库存持有成本4451万元（规模效应，中小品牌同比例约5-15万元）
实施难度：⭐⭐⭐☆☆（需要地理订单分布数据 + 仓库位置优化，属于中期战略项目）
优先级评分：⭐⭐⭐⭐☆（陈凤霞："仓网布局一旦成型难以改变，错误的仓网会持续产生高额的跨仓成本"）
评估依据：京东2026案例数据：FDC满足率每提升1pp节省持有成本约3000万（万亿级规模），中小品牌同比例约5-15万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（203 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/local_order_fulfillment_rate_fdc` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Local-Order-Fulfillment-Rate-FDC.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
本地订单达成率与 FDC 仓网覆盖 KPI 体系
功能：本地率计算 / 仓网覆盖分析 / 跨仓成本量化 / 仓网优化建议
输入：订单地理分布 + 仓库位置 + 库存数据
输出：本地率KPI + 跨仓成本 + 仓网优化方案
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def generate_order_warehouse_data(n_orders=2000, seed=42):
    """生成含地理信息的订单-仓库数据"""
    np.random.seed(seed)
    
    # 区域分布（模拟订单地理分布）
    regions = {
        '华东（上海/苏州/杭州）': 0.30,
        '华北（北京/天津）': 0.20,
        '华南（广州/深圳）': 0.18,
        '华中（武汉/郑州）': 0.12,
        '华西（成都/重庆）': 0.10,
        '东北（沈阳/哈尔滨）': 0.05,
        '西北（西安/兰州）': 0.05,
    }
    
    # 仓库位置（FDC/RDC）
    warehouses = {
        'WH-上海（FDC）': '华东（上海/苏州/杭州）',
        'WH-北京（FDC）': '华北（北京/天津）',
        'WH-广州（FDC）': '华南（广州/深圳）',
        'WH-武汉（RDC）': '华中（武汉/郑州）',
    }
    # 华西/东北/西北 无本地FDC，需跨仓
    
    records = []
    region_list = list(regions.keys())
    region_probs = list(regions.values())
    
    for i in range(n_orders):
        order_region = np.random.choice(region_list, p=region_probs)
        
        # 找是否有本地仓库
        local_wh = None
        for wh, wh_region in warehouses.items():
            if wh_region == order_region:
                local_wh = wh
                break
        
        if local_wh:
            # 有本地仓：80%从本地发（20%因库存不足跨仓）
            is_local = np.random.random() < 0.80
            fulfillment_wh = local_wh if is_local else np.random.choice(list(warehouses.keys()))
        else:
            # 无本地仓：必须跨仓
            is_local = False
            fulfillment_wh = np.random.choice(['WH-上海（FDC）', 'WH-广州（FDC）'])
        
        # 配送成本（本地便宜，跨仓贵）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2306.09517，但该号在 arXiv 上是《Competitive and Resource Efficient Factored Hybrid HMM Systems are Simpler Than You Think》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单地理分布（州或地区级）、当前发货仓、是否本地发货标记、各仓位置与库存数据，以及跨境渠道范围。

**输出**：本地率 KPI 与跨仓成本量化、仓网优化方案（含新增仓或共仓建议）与时效改善对比，供供应链规划团队决策。

## 执行步骤

1. 整理订单地理分布与发货仓数据
2. 计算本地率与跨仓调拨成本
3. 模拟新增仓或共仓后的本地率变化
4. 输出仓网优化方案与时效成本对比

## 边界与不做

- 何时不用：需要监控多仓在架率与分仓缺货时用在架率多仓SKU矩阵；配送时效与体验权衡用 B2C配送时效与体验KPI。
- 能力边界：输出仓网诊断与优化建议，属于中期战略项目，选址、租仓与系统上线需人工推进。
- 数据边界：需要订单地理分布与仓库位置数据，缺失州级粒度时本地率会被高估或低估。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Inventory-Turnover-ABC-Classification.html、Skill-Inventory-Turnover-ABC-Classification、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Cycle-Time-OTD-Analytics.html、Skill-Order-Cycle-Time-OTD-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Turnover-ABC-Classification.html、Skill-Inventory-Turnover-ABC-Classification、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Cycle-Time-OTD-Analytics.html、Skill-Order-Cycle-Time-OTD-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Turnover-ABC-Classification.html、Skill-Inventory-Turnover-ABC-Classification、Skill-Order-Cycle-Time-OTD-Analytics.html、Skill-Order-Cycle-Time-OTD-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Local-Order-Fulfillment-Rate-FDC

---

> 分类：业务运营/供应与履约/履约跟踪　·　技术族：04-供应链　·　源卡：`Skill-Local-Order-Fulfillment-Rate-FDC`