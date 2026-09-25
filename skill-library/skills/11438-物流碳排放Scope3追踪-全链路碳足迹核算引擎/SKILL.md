---
name: "p2s-logistics-carbon-scope3-tracker"
title: "物流碳排放Scope3追踪 — 全链路碳足迹核算引擎"
description: "触发词：碳足迹核算、物流碳排、Scope3 核算、低碳路由、ESG 披露。何时不用：要比较物流方案的综合成本与费率用「经济性分析」，要优化末端配送路线用路径优化类技能；本技能只做逐单碳排核算与低碳替代路由建议。安全边界：排放系数与披露口径须经 ESG/合规负责人复核后才能对外发布，本技能不替代第三方碳核查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Logistics-Carbon-Scope3-Tracker"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "按单笔订单算出运输环节排放了多少二氧化碳，给出可披露的排放报告和更低碳的运输方式建议。"
user_try: "试试：把过去 12 个月的订单运输数据按单件算出 CO2eq，并告诉我哪些线路可以从空运换成海运加陆运。"
whenToUse: "已有订单级运输数据与排放系数库、需要逐单核算碳排或准备 ESG/CBAM 披露时用；要算物流成本与费率用「经济性分析」，要规划仓网与路线用仓网规划类技能。"
workflow: "整理订单级起点、终点、重量与运输方式 → 装载率修正后逐单乘排放系数算 CO2eq → 按地区与 SKU 汇总碳排放报告 → 筛选高排放线路并给出低碳替代路由"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 物流碳排放Scope3追踪 — 全链路碳足迹核算引擎

## ① 解决的问题

ESG团队面临Scope3碳排放核算难——逐单CO2eq核算将ESG报告准确率提升至99%，Amazon CPF认证通过率100%

## ② 核心算法逻辑

核心思想：基于GHG Protocol Scope3 Category4（上游运输配送）和Category9（下游运输配送）标准，按单件订单维度逐笔计算CO2eq排放量，通过运力结构、距离、重量、运输方式等多维因子建立排放系数库，实现动态低碳路由选择。

## ③ 业务应用场景

- 业务问题：母婴品牌向欧洲FBA发货，传统空运+卡车配送模式年均CO2排放2500吨，占COGS 3.2%；欧盟CBAM 2026年强制披露，预计增加合规成本180万元。 - 数据要求：(1)过去12个月订单级运输数据（起点、终点、重量、运输方式）；(2)各运输商排放系数库（空运0.255kg CO2/ton·km，海运0.012kg CO2/ton·km，陆运0.089kg CO2/ton·km）；(3)FBA入库周期与销售预测数据。 - 预期产出：(1)单件订单CO2eq标签；(2)按地区/SKU分层的碳排放报告；(3)低碳路由推荐（海运+陆运替代方案）。 - 业务价值：通过海运+陆运组
三轨验证 | 成本轨：实施成本45万元（系统开发+数据集成），ROI周期4.2个月 | 合规轨：完全符合GHG Protocol Scope3标准，满足欧盟CBAM披露要求 | 风险轨：海运时效延长3-5天，影响高峰期订单履约率2%（概率15%），可通过提前备货规避
- 业务问题：母婴品牌日均出口订单800单，平均单件重量0.8kg，分散发货至东南亚、中东、非洲等地，单件运输成本12-18元，碳排放系数高（平均0.45kg CO2/单）；竞品通过共配中心聚单，单件成本降低40%、碳排放降低35%。 - 数据要求：(1)订单目的地分布、发货时间窗口；(2)共配中心地理位置与处理能力；(3)聚单延迟容忍度（目前承诺48小时发货）；(4)各共配商报价与排放系数。 - 预期产出：(1)订单聚合推荐引擎（基于地理位置+时间窗口）；(2)共配方案碳排放对比分析；(3)动态定价模型（低碳方案给予2-5%优惠）。 - 业务价值：通过共配聚单，平均订单碳排放从0.45kg

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴品牌面临欧盟CBAM合规压力与消费者绿色需求，传统物流模式年度Scope3碳排放2500-3500吨、合规成本150-200万元、绿色溢价机会损失300-500万元。本Skill通过精细化碳追踪+低碳路由优化，将碳排放降低25-35%（年减少625-1225吨CO2），合规成本降低100-150万元，绿色物流认证驱动订单增量200-
实施难度：⭐⭐⭐☆☆（需要运输商数据集成、排放系数库建立、系统开发，但逻辑相对清晰，无算法复杂度瓶颈）
优先级：⭐⭐⭐⭐☆（欧盟CBAM 2026年强制执行，母婴品牌出海必须项；消费者绿色偏好持续上升，竞争差异化关键）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（184 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 52 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class LogisticsCarbonScope3Tracker:
    """物流碳排放Scope3追踪引擎"""
    
    def __init__(self):
        # 运输方式排放系数库（kg CO2/ton·km）
        self.emission_factors = {
            'air': 0.255,
            'sea': 0.012,
            'truck': 0.089,
            'rail': 0.041,
            'combined': 0.065  # 海运+陆运组合
        }
        
        # 装载率修正系数
        self.loading_rate_correction = {
            'air': 0.75,
            'sea': 0.85,
            'truck': 0.80,
            'combined': 0.82
        }
        
        # 地区间距离库（km）
        self.distance_matrix = {
            ('China', 'Europe'): 11000,
            ('China', 'Southeast_Asia'): 2500,
            ('China', 'Middle_East'): 5500,
            ('China', 'Africa'): 8000,
            ('Europe', 'Southeast_Asia'): 13500
        }
    
    def calculate_order_carbon(self, order_id, origin, destination, weight_kg, 
                               transport_mode, distance_km=None):
        """计算单件订单CO2eq排放"""
        
        # 获取距离
        if distance_km is None:
            key = tuple(sorted([origin, destination]))
            distance_km = self.distance_matrix.get(key, 10000)
        
        # 获取排放系数和装载率修正
        emission_factor = self.emission_factors.get(transport_mode, 0.089)
        loading_correction = self.loading_rate_correction.get(transport_mode, 0.80)
        
        # CO2eq计算公式
        weight_ton = weight_kg / 1000
        co2eq = distance_km * weight_ton * emission_factor * loading_correction
        
        return {
            'order_id': order_id,
            'origin': origin,
            'destination': destination,
            'weight_kg': weight_kg,
            'transport_mode': transport_mode,
            'distance_km': distance_km,
            'co2eq_kg': round(co2eq, 4),
            'emission_factor': emission_factor,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：订单×运输段粒度：订单号、起点、终点、重量（kg）、运输方式（空运/海运/陆运/铁路/组合）；另需排放系数库（kg CO2/ton·km，卡页参考值空运 0.255、海运 0.012、陆运 0.089、铁路 0.041）、各方式装载率修正系数、地区间距离矩阵，以及 FBA 入库周期与销售预测用于判断低碳方案可行性。

**输出**：单件订单的 CO2eq 排放标签与明细记录（含所用排放系数、距离、重量）、按地区与 SKU 分层的碳排放汇总报告，以及海运加陆运等低碳替代路由建议；供 ESG 团队披露、合规对接 CBAM 与运营选择运输方式使用。

## 执行步骤

1. 按起点、终点、重量、运输方式整理订单级运输明细
2. 建立各运输方式的排放系数库、装载率修正系数与地区距离矩阵
3. 逐单计算 CO2eq 排放量并回写订单级标签
4. 按地区与 SKU 汇总碳排放报告，识别高排放线路
5. 给出海运加陆运等低碳替代路由，并提示时效影响

## 边界与不做

- 数据不满足时不用：缺运输方式、重量或里程的订单无法计算排放量。
- 排放系数与承运商数据需按官方口径定期校准，本技能不替代第三方碳核查与审计。
- 卡页碳排降幅与合规成本节省为估算口径，落地前须用实际运输结构重算。

## 技能关联

- **前置**：Skill-Carrier-Selection-ML.html、Skill-Carrier-Selection-ML、Skill-Consumer-Carbon-Preference、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ESG-Compliance-Engine、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Supply-Chain-Visibility
- **延伸**：Skill-Carrier-Selection-ML.html、Skill-Carrier-Selection-ML、Skill-Consumer-Carbon-Preference、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ESG-Compliance-Engine、Skill-Supply-Chain-Visibility
- **可组合**：Skill-Consumer-Carbon-Preference、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ESG-Compliance-Engine、Skill-Supply-Chain-Visibility、Skill-Logistics-Carbon-Scope3-Tracker

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Logistics-Carbon-Scope3-Tracker`