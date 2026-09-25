---
name: "p2s-logistics-cost-pl-attribution"
title: "Logistics Cost PL Attribution — 物流成本 P&L 归因：每单头程+FBA+退货的利润拆解"
description: "触发词：物流成本归因、五层成本拆解、真实净利润、退货成本分摊、隐性亏损 SKU。何时不用：只看 FBA 账单内部各层费用用「FBA 费用瀑布归因」；只算退款率本身的财务影响用「退款率财务影响」。安全边界：头程与退货成本须按批次真实分摊，不得为美化毛利率手工调整分摊口径。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-120"
l3_business: "收入与费用核对"
l3_all: "收入与费用核对 / 生命周期分析"
l1_l2_l3: "业务运营/财务与合规/收入与费用核对"
p2s_card_id: "Skill-Logistics-Cost-PL-Attribution"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "把货值、头程、FBA、仓储和退货五层成本摊到每个 SKU，找出账面盈利但实际亏损的产品。"
user_try: "试试：按 L1 到 L5 拆解婴儿枕头等 SKU 的物流成本，标出真实净利润为负的那些 SKU。"
whenToUse: "要把头程、FBA 与退货逆向成本一起摊到 SKU、识别隐性亏损时用本技能；只看 FBA 账单内部费用结构用「FBA 费用瀑布归因」；聚焦退款率的利润影响用「退款率财务影响」。"
workflow: "按 ASIN 汇总月销售额、FBA 费用明细与退货率 → 把头程账单按重量体积分摊到每个 SKU → 按 L1 货值到 L5 退货逆向成本做五层拆解 → 输出真实净利润率排行与退货成本热力图"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Logistics Cost PL Attribution — 物流成本 P&L 归因：每单头程+FBA+退货的利润拆解

## ① 解决的问题

母婴卖家月度账面毛利22%但实际某款婴儿枕头退货率18%、真实净利润为负——物流成本五层ABC拆解（L1货值到L5退货）到SKU粒度，发现隐性亏损SKU并停止无效广告，年化节省3-8万美元并优化退货成本

## ② 核心算法逻辑

跨境电商的利润侵蚀往往藏在物流成本的三个"黑洞"里：头程不可见成本（分摊到每个 SKU 的比例不透明）、FBA 费用长尾（小件高频 SKU 的仓储费超出预期）、退货逆向物流（高退货率 SKU 的净利润可能是负数）。

## ③ 业务应用场景

业务问题：婴儿枕头 SKU 账面毛利率 22%，但退货率 18%（买家说"不如图片"）。加上逆向物流成本，真实净利润是正还是负？运营不知道，因为退货成本从未分摊到 SKU 粒度。
数据要求： - Amazon Seller Central：每个 ASIN 的月销售额、FBA 费用明细、退货率 - 头程账单：按货柜/批次的总费用，需按重量体积分摊到每个 SKU - 仓储报告：每个 FNSKU 的日均在库量 × 月仓储费率 - 退货处理成本：退货接收费 + 检验费 + 再入库费（从 FBA 账单获取）
预期产出： - 每个 SKU 的五层成本拆解（L1-L5） - 真实净利润率排行：揭示"账面盈利/真实亏损"的 SKU 黑洞 - 退货成本热力图：哪些 SKU/品类的退货成本最高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
发现真实亏损 SKU 并停止广告：月节省 $3,000-10,000
退货率优化（高退货 SKU 改善 Listing）：每降 5% 退货率，月增净利润 ¥3-10 万
头程成本分摊透明化：识别"高体积低售价"SKU 并调整，月节省运费 ¥2-8 万
仓储 LTSF 预警：提前清仓高龄库存，年节省 ¥5-20 万
年化综合 ROI：¥30-80 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（139 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/18-物流履约/logistics_cost_pl_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Logistics-Cost-PL-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Logistics Cost P&L Attribution
物流成本五层拆解 + SKU 级真实净利润核算
"""
import numpy as np
import pandas as pd


def generate_sample_sku_data():
    """生成模拟 SKU 成本数据"""
    skus = [
        # name, price, fob_cost, weight_kg, volume_cbm, fba_fee, monthly_storage_days,
        # return_rate, monthly_sales, ad_spend_rate
        ('breast_pump_A',   149.99, 35.0, 2.1, 0.012, 12.50, 45, 0.06, 180, 0.15),
        ('baby_bottle_B',    24.99,  4.5, 0.3, 0.002,  3.22, 30, 0.04, 850, 0.12),
        ('infant_pillow_C',  39.99,  8.0, 0.8, 0.008,  4.50, 60, 0.18, 320, 0.18),  # 高退货！
        ('sterilizer_D',     89.99, 22.0, 1.5, 0.010,  8.75, 40, 0.07, 240, 0.14),
        ('nursing_cover_E',  29.99,  5.5, 0.4, 0.003,  3.85, 55, 0.09, 420, 0.13),
    ]
    cols = ['sku', 'price', 'fob_cost', 'weight_kg', 'volume_cbm',
            'fba_fulfillment_fee', 'avg_storage_days', 'return_rate',
            'monthly_sales_units', 'ad_spend_rate']
    return pd.DataFrame(skus, columns=cols)


def compute_logistics_cost_layers(df, shipment_config=None):
    """
    五层物流成本拆解
    L1: FOB 货值
    L2: 头程运费（按体积重分摊）
    L3: FBA 配送费
    L4: 仓储费（月度 + LTSF）
    L5: 退货逆向成本
    """
    if shipment_config is None:
        shipment_config = {
            'sea_freight_per_cbm': 280,   # $/CBM 海运
            'destination_handling': 45,    # $/CBM 目的港+清关
            'monthly_storage_rate': 0.75,  # $/cubic_foot/month (Jan-Sep)
            'ltsf_rate_per_unit': 1.50,    # 长库龄费 $/unit (>180天)
            'return_processing_fee': 0.50, # $/unit 退货处理基础费
            'return_inspection_rate': 0.30,# 退货货值损耗率
            'platform_commission': 0.15,   # 15% 亚马逊佣金
        }

    df = df.copy()
    sc = shipment_config

    # L1: FOB 货值（直接）
    df['L1_fob'] = df['fob_cost']

    # L2: 头程运费（按体积重 CBM 分摊）
    cbm_per_unit = df['volume_cbm']
    df['L2_freight'] = cbm_per_unit * (sc['sea_freight_per_cbm'] + sc['destination_handling'])

    # L3: FBA 配送费（直接）
    df['L3_fba_fulfillment'] = df['fba_fulfillment_fee']

    # L4: 仓储费（日均在库 × 立方英尺 × 月费率）
    volume_cubic_feet = df['volume_cbm'] * 35.315  # 1 CBM = 35.315 ft³
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.12847，但该号在 arXiv 上是《Numerical Simulation of Radiative Transfer of Electromagnetic Angular Momentum》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：ASIN 级月销售额、FBA 费用明细与退货率；头程账单（按货柜或批次的总费用，需可按重量体积分摊）；FNSKU 日均在库量与月仓储费率；退货接收费、检验费与再入库费。

**输出**：每个 SKU 的 L1 到 L5 五层成本拆解、真实净利润率排行与退货成本热力图，用于识别账面盈利但真实亏损的 SKU 并停止无效投放。

## 执行步骤

1. 汇总各 ASIN 的销售额、FBA 费用明细与退货率
2. 按重量体积把头程账单分摊到每个 SKU
3. 按 L1 到 L5 五层拆解单位成本
4. 计算真实净利润率并排出亏损 SKU
5. 输出退货成本热力图并给出广告与 Listing 优化建议

## 边界与不做

- 头程账单未按批次记录、无法按重量体积分摊时不适用；退货处理费口径缺失时结果偏差大
- 只做成本还原与亏损识别，不代替定价、广告投放与退市决策
- 分摊口径一旦确定需保持一致，不得为美化毛利手工调整

## 技能关联

- **前置**：Skill-AR-Logistics-Visualization.html、Skill-AR-Logistics-Visualization、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **延伸**：Skill-AR-Logistics-Visualization.html、Skill-AR-Logistics-Visualization、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **可组合**：Skill-AR-Logistics-Visualization.html、Skill-AR-Logistics-Visualization、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge、Skill-Logistics-Cost-PL-Attribution

---

> 分类：业务运营/财务与合规/收入与费用核对　·　技术族：18-物流履约　·　源卡：`Skill-Logistics-Cost-PL-Attribution`