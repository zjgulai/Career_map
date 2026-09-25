---
name: "p2s-purchase-sales-inventory-3d-tracking"
title: "进销存三维动态追踪 — 进货/销售/库存联动监控与比率预警体系"
description: "触发词：进销存、进销存周报、P/S 比率、库存异常预警、账实差异。何时不用：要判断商品该分几层用「库存分层」，要做多平台数据接入与口径统一用「数据管道」；本技能只监控进货、销售、库存三者比率与异常。安全边界：账实差异的根因结论须与盘点、退货、在途记录交叉核对后再入账，模型不下账务调整。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 数据管道"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Purchase-Sales-Inventory-3D-Tracking"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把每周手工汇总的进销存变成自动周报，用进货、销售、库存三者的比率提前发现断货与积压。"
user_try: "试试：用我上周的进销存数据算一下每个 SKU 的 P/S 比率，哪些快断货、哪些在悄悄膨胀？"
whenToUse: "已有亚马逊入出库报告、FBA 库存报告与采购 PO 记录，需要按周盯进销存比率与账实差异时用；要做商品动销分层用「库存分层」，要设计多平台数据接入用「数据管道」。"
workflow: "每周自动拉取入库、出库与盘点数据 → 逐 SKU 算 P/S 比率、库存变动率与 DOI → 用 CUSUM 检出膨胀与缺货两类异常 → 做三角平衡稽核并核查差异根因 → 输出带行动优先级的进销存周报"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 进销存三维动态追踪 — 进货/销售/库存联动监控与比率预警体系

## ① 解决的问题

每周4小时手工汇总进销存且无法发现异常——P/S比率CUSUM检测将缺货/积压信号提前3-5天发现，年化防损$10-15万，报告时间从4小时降至10分钟

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中将"进销存管理"列为物流计划供应链最核心的KPI维度。"进"=进货量（入库），"销"=销售量（出库），"存"=库存量（在库）。三者构成一个封闭会计恒等式：期末存 = 期初存 + 进 销。任何一维出现异常，都会在其他维度反映出来——这正是进销存分析的核心价值：通过监控三者的比率关系，比单独观察任何一个维度更早发现异常。

## ③ 业务应用场景

场景A：多SKU进销存周报自动化（替代手工Excel）
- 业务问题：某卖家每周手工汇总各平台进销存数据到Excel，耗时4小时，且容易出错漏项，无法及时发现异常 - 数据要求：亚马逊Inventory API（日入库/出库记录）、FBA库存报告、采购PO记录 - 算法应用： 1. 每周一自动拉取上周进销存数据 2. 计算每个SKU的P/S Ratio和ΔI（库存变动率） 3. 发现："OLD-NIPPLE-PKG"连续4周P/S=1.8（进货量远超销售），库存膨胀62% 4. 同时发现："PUMP-PRO"上周P/S=0.31（销售远超进货），DOI已降至12天（缺货预警！） 5. 自动生成周报推送运营团队，含行动优先级 - 预期产出：周报从4小
- 业务问题：月末盘点发现FBA库存账实差异3.2%（超标准0.5%），但不知道原因 - 算法应用：三角平衡诊断：期初存500件 + 进货300件 - 销售320件 = 理论期末480件，实际盘点465件，差异15件。通过退货记录核查发现：12件退货客户已获退款但货物未退还FBA（Amazon判定"退款不退货"），3件在途被海关扣押未入账。根因清晰，处理有据 - 预期产出：差异率从3.2%降至0.4%，库存准确率达标，财务账目可信度提升

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：每周4小时手工进销存 → 10分钟自动报告，年节省约200小时运营时间（价值$5000+）；P/S比率异常提前3-5天发现，防止断货和积压年化$10-15万；系统成本$2万，ROI≈600%
实施难度：⭐⭐☆☆☆（逻辑简单，Amazon/Shopee均有入出库报告API；主要挑战是多平台数据对接统一）
优先级：⭐⭐⭐⭐⭐（电商供应链最基础的管控工具，没有进销存追踪一切都是盲飞）
适用规模：所有规模，月销>$2万就值得自动化
数据依赖：Amazon FBA Inventory API（入出库记录）、采购PO系统数据、销售报告

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（335 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/purchase_sales_inventory_3d_tracking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Purchase-Sales-Inventory-3D-Tracking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
进销存三维动态追踪系统
功能：P/S/I三维比率计算 + CUSUM异常检测 + 三角平衡稽核 + 计划准确率
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class WeeklyPSI:
    """单周进销存数据"""
    sku_id: str
    week: str                   # 'W2026-23' 格式
    opening_stock: int          # 期初库存
    purchases: int              # 本周进货（入库）
    sales: int                  # 本周销售（出库）
    closing_stock_actual: int   # 期末实际库存（盘点）
    # 计划值
    planned_purchases: int = 0
    planned_sales: int = 0

    @property
    def closing_stock_theoretical(self) -> int:
        return self.opening_stock + self.purchases - self.sales

    @property
    def ps_ratio(self) -> float:
        return self.purchases / max(self.sales, 0.01)

    @property
    def is_ratio(self) -> float:
        return self.closing_stock_actual / max(self.sales / 7, 0.01)  # DOI

    @property
    def pi_ratio(self) -> float:
        return self.purchases / max(self.opening_stock, 0.01)

    @property
    def stock_change_rate(self) -> float:
        return (self.closing_stock_actual - self.opening_stock) / max(self.opening_stock, 1)

    @property
    def balance_discrepancy(self) -> int:
        return self.closing_stock_actual - self.closing_stock_theoretical

    @property
    def balance_discrepancy_rate(self) -> float:
        return abs(self.balance_discrepancy) / max(self.closing_stock_theoretical, 1)

    @property
    def purchase_plan_accuracy(self) -> float:
        if self.planned_purchases == 0:
            return 1.0
        return 1 - abs(self.purchases - self.planned_purchases) / max(self.planned_purchases, 1)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.14523。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：SKU×周粒度：周标识、期初库存、本周进货（入库）、本周销售（出库）、期末实际盘点库存，以及计划进货量与计划销量；数据源为亚马逊 FBA Inventory API 的入出库记录、FBA 库存报告与采购 PO 记录。

**输出**：每个 SKU 每周的 P/S、P/I、I/S（DOI）比率与库存变动率、CUSUM 异常信号、三角平衡差异与差异率、进货计划准确率，以及带行动优先级的进销存周报；推送给运营与财务做补货和盘点跟进。

## 执行步骤

1. 每周一自动拉取上一周的入库、出库与盘点数据
2. 逐 SKU 计算 P/S 比率、库存变动率与 DOI，标出膨胀端与断货端
3. 用 CUSUM 检测比率序列的异常漂移，输出积压与缺货信号
4. 做三角平衡稽核：期初库存 + 进货 − 销售 与期末盘点比对，算出差异与差异率
5. 用退货记录、在途与海关扣押记录核查差异根因
6. 生成带行动优先级的周报并推送给运营团队

## 边界与不做

- 数据不满足时不用：缺期末盘点值或入库／出库记录的周次无法做三角平衡与比率检测。
- 只产出监控信号与差异根因线索，不下账务调整、不直接改库存或在途状态。
- 卡页 ROI（周报从 4 小时降至 10 分钟、年节省约 200 小时、年化防损 $10-15 万、ROI≈600%）为估算口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **可组合**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Purchase-Sales-Inventory-3D-Tracking

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Purchase-Sales-Inventory-3D-Tracking`