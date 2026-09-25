---
name: "p2s-order-fulfillment-rate-dispatch-timeliness"
title: "订单履约率与发货及时率 — 全链路订单从下单到签收的履约质量量化体系"
description: "触发词：履约率、发货及时率、ODR、履约漏斗、账号健康。何时不用：需要按阶段拆解交付周期定位瓶颈时用订单交付周期OTD全链路分解；需要分渠道统计订单异常类型时用订单准确率与异常处理KPI。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-046"
l3_business: "履约跟踪"
l3_all: "履约跟踪 / 履约异常"
l1_l2_l3: "业务运营/供应与履约/履约跟踪"
p2s_card_id: "Skill-Order-Fulfillment-Rate-Dispatch-Timeliness"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "用四层质量门把订单从下单到签收的履约情况串起来，定位拖累账号健康的 SKU 与环节。"
user_try: "试试：我的 ODR 从 0.8% 升到 1.5% 了，帮我按履约漏斗拆解并找出异常 SKU。"
whenToUse: "需要 ODR、发货及时率等账户健康指标的全链路拆解与缺陷热点定位时用本技能；交付周期阶段拆解用订单交付周期OTD全链路分解。"
workflow: "整合平台订单、索赔与物流破损数据 → 按四层质量门计算履约漏斗 → 定位缺陷热点 SKU 与环节 → 输出改善行动并跟踪指标回落"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 订单履约率与发货及时率 — 全链路订单从下单到签收的履约质量量化体系

## ① 解决的问题

ODR从0.8%升至1.5%险触Amazon封号红线却不知根因——完整履约漏斗（4层质量门：库存满足→及时发货→配送成功→无争议）+ SKU级缺陷热点识别，精准保护账号健康

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：订单履约是供应链"最后一公里"的核心KPI，贯穿从下单到签收的全链路。书中强调：履约率不等于配送成功率——履约率衡量的是"有库存且按时发货"的完整链路，包含库存可用性、发货及时性、配送成功性三个环节，任何一环失败都算履约失败。

## ③ 业务应用场景

- 业务问题：某母婴卖家Amazon账号健康评分下降，发现ODR（Order Defect Rate）从0.8%升至1.5%（Amazon红线1%），存在封号风险 - 履约率拆解： 1. ODR = 差评率0.3% + A-to-Z索赔率0.8% + 信用卡拒付率0.4% 2. A-to-Z索赔主要来源：3个SKU的货运破损率异常（2.1% vs 正常0.2%） 3. 根因：这3个SKU包装不够厚（婴儿玻璃奶瓶），海运期间碰撞破损 4. 行动：加强外箱包装规格，破损率降至0.15%，ODR在2周内回落至0.7%
- 业务问题：Prime Day首日发货及时率从98%骤降至65%（仓库临时工不熟悉操作），触发Amazon预警 - 实时履约监控：每4小时计算一次发货及时率，发现低于85%时立即启动应急方案（加班+借调人员），避免长时间低于阈值触发更严重的处罚
**三轨验证** | 成本轨：FBA备货优化系统月均投入3200元（AI预测模型维护2000元+数据分析人工1200元/月，约18小时），缺货率从12%降至3%，年化降损45万元，ROI达1312%，备货成本增加约8万元/年但库存周转提升35% | 合规轨：符合《跨境电商商品质量管理规范》第8条库存管理要求，满足亚马逊FBA入库标准（商品完整率≥99.5%），符合《婴幼儿配方乳粉产品质量安全追溯体系规范》追溯要求，通过ISO9001质量管理体系认证 | 风险轨：①预测模型偏差风险（概率15%）导致过度备货增加滞销成本月均2-3万元；②供应链中断风险（概率8%）如原料短缺影响补货周期；③汇率波动

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：ODR从1.5%降至0.8%避免Amazon封号风险（封号损失$50万+年营业额）；完美履约率每提升1%，平台自然搜索排名约提升2-3位（GMV增量约3-5%）；系统建设$2万，防损价值极高
实施难度：⭐⭐⭐☆☆（需要整合多平台数据；Amazon提供订单级别的ODR报告，可直接获取；自发货平台需要自建追踪）
优先级：⭐⭐⭐⭐⭐（ODR是Amazon账号安全的核心指标，完美履约率直接影响平台排名，是必须追踪的指标）
适用规模：所有在Amazon/Shopee/TikTok Shop等平台销售的卖家
数据依赖：平台订单API（提供发货时效/投诉/索赔数据）；物流商API（破损/丢失数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（245 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/order_fulfillment_rate_dispatch_timeliness` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Order-Fulfillment-Rate-Dispatch-Timeliness.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
订单履约率与发货及时率全链路量化体系
基于《全链路管理》陈凤霞 + 行业最佳实践 + KDD 2021论文框架
完整履约漏斗 + 根因分解 + 风险预警
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')


@dataclass
class OrderRecord:
    """订单记录"""
    order_id: str
    sku_id: str
    platform: str
    order_time: str
    promised_dispatch_time: str    # 承诺发货时间
    actual_dispatch_time: Optional[str]  # 实际发货时间（None=未发货）
    promised_delivery_time: Optional[str]  # 承诺到达时间
    actual_delivery_time: Optional[str]
    has_stock: bool                # 下单时是否有库存
    delivery_success: bool         # 是否成功签收
    has_damage: bool               # 是否有破损
    has_complaint: bool            # 是否有投诉


class FulfillmentRateAnalyzer:
    """订单履约率分析引擎"""

    # 平台发货时效标准（小时）
    DISPATCH_STANDARDS = {
        'Amazon': 24,
        'Shopee': 48,
        'TikTok_Shop': 48,
        'Own_Store': 72,
    }

    def compute_fulfillment_funnel(self, orders: List[OrderRecord]) -> Dict:
        """计算完整履约漏斗"""
        n = len(orders)
        if n == 0:
            return {}

        # 各层次统计
        with_stock = sum(1 for o in orders if o.has_stock)
        dispatched_on_time = sum(1 for o in orders
                                  if o.has_stock and o.actual_dispatch_time is not None
                                  and o.actual_dispatch_time <= o.promised_dispatch_time)
        delivered_success = sum(1 for o in orders if o.delivery_success)
        no_issues = sum(1 for o in orders
                         if o.delivery_success and not o.has_damage and not o.has_complaint)

        return {
            'total_orders': n,
            'funnel': {
                '1_order_fill_rate': {
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2106.04567。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：平台订单 API 数据（发货时效、投诉、索赔记录）与物流商 API 的破损与丢失数据，以及 SKU 级订单明细。

**输出**：履约漏斗各层指标与 ODR 拆解结果、缺陷热点 SKU 清单、风险预警与改善行动建议，供运营与账号管理团队使用。

## 执行步骤

1. 整合平台订单、索赔与物流破损数据
2. 按四层质量门计算履约漏斗
3. 定位缺陷热点 SKU 与环节
4. 输出改善行动并跟踪指标回落

## 边界与不做

- 何时不用：需要按阶段拆解交付周期定位拣货或末端瓶颈时用订单交付周期OTD全链路分解；需要按渠道与类型统计订单异常时用订单准确率与异常处理KPI。
- 能力边界：输出诊断与预警，账号申诉、包装改造与承运商切换需业务团队执行。
- 数据边界：自发货渠道需自建追踪数据，平台接口粒度不足时部分缺陷只能定位到品类层级。

## 技能关联

- **前置**：Skill-B2C-Delivery-Timeliness-Experience-KPI.html、Skill-B2C-Delivery-Timeliness-Experience-KPI、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Fill-Rate-OOS-Cost-Quantification.html、Skill-Fill-Rate-OOS-Cost-Quantification、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency、Skill-Order-Fulfillment-Rate-Dispatch-Timeliness

---

> 分类：业务运营/供应与履约/履约跟踪　·　技术族：04-供应链　·　源卡：`Skill-Order-Fulfillment-Rate-Dispatch-Timeliness`