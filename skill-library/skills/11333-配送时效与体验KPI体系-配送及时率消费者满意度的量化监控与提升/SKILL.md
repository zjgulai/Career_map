---
name: "p2s-b2c-delivery-timeliness-experience-kpi"
title: "B2C配送时效与体验KPI体系 — 配送及时率/消费者满意度/NPS的量化监控与提升"
description: "触发词：配送时效、及时率、NPS、承诺时效、物流体验。何时不用：需要做履约漏斗与缺陷热点归因时用订单履约率与发货及时率；需要做仓网覆盖与本地发货率决策时用本地订单达成率与FDC仓网覆盖KPI。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-046"
l3_business: "履约跟踪"
l3_all: "履约跟踪 / 体验分析"
l1_l2_l3: "业务运营/供应与履约/履约跟踪"
p2s_card_id: "Skill-B2C-Delivery-Timeliness-Experience-KPI"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "同时盯时效、成本和体验三个维度，用历史分位数动态调整承诺时效，让兑现率回升。"
user_try: "试试：对比 FBA、海外仓和直邮的时效成本体验，并按旺季时效 P90 帮我调整平台承诺天数。"
whenToUse: "需要权衡时效、成本与体验并动态设定承诺时效时用本技能；仓网布局与本地发货率决策用本地订单达成率与FDC仓网覆盖KPI。"
workflow: "汇总各配送模式的承诺与实际时效数据 → 计算及时率、时效分位数与满意度指标 → 按分位数动态调整承诺时效 → 输出配送模式选择矩阵与改善建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# B2C配送时效与体验KPI体系 — 配送及时率/消费者满意度/NPS的量化监控与提升

## ① 解决的问题

旺季FedEx延误导致承诺兑现率从90%崩至65%引发大量差评——三维均衡（成本/时效/体验）+ 动态承诺时效优化（P90算法），宽松兑现 > 紧张违约，NPS提升驱动复购率+3%

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：B2C配送KPI是三角均衡——成本（每单运费）、时效（承诺到达时间）、体验（用户满意度/NPS）。书中强调：这三者相互制约，优化一个往往以牺牲另一个为代价，供应链运营者需要在三角中找到"最优点"，而不是单纯追求任一极值。

## ③ 业务应用场景

场景A：FBA vs 海外仓vs直邮时效对比决策
- 业务问题：某母婴卖家同时有FBA、德国自营仓、直邮三种配送方式，不知道在哪些场景各自更优 - 三维KPI对比： - FBA：时效最好（P80=2天），成本最高（$8.5/件），体验最好（满意度92%） - 海外仓：时效好（P80=4天），成本中（$6.0/件），体验较好（满意度88%） - 直邮：时效差（P80=15天），成本低（$3.5/件），体验差（满意度72%） - 决策矩阵：高价产品（>$60）→FBA，中价产品→海外仓，低价配件→直邮 - 预期产出：整体物流满意度从82%提升至89%，物流成本降低约12%
- 业务问题：Q4旺季FedEx延误频发，卖家仍承诺"3-5天到达"，导致物流投诉率从1.2%飙升至4.8% - 承诺时效算法：用历史数据计算旺季时效分布P90，动态调整平台承诺时效；虽然承诺变宽（4-8天），但兑现率从65%回到92%，投诉率降回1.5% - 反直觉洞察：宽松但能兑现的承诺 > 紧张但常常违约的承诺（信任损失代价更大）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：投诉率从4.8%降至1.5%，按月1000单计算减少33个投诉，每个投诉处理成本$15 → 月省$495；NPS提升10分对应复购率约+3%（月GMV$20万则+$600）；系统成本$1.5万，ROI≈400%
实施难度：⭐⭐⭐☆☆（需要物流商API对接获取精确时效数据；投诉数据需要整合多平台）
优先级：⭐⭐⭐⭐⭐（配送体验是母婴跨境用户复购的核心驱动，书中明确将其列为物流供应链KPI的最高优先级）
适用规模：月发货>500件的卖家，特别是同时使用多种物流模式的
数据依赖：物流追踪数据（承诺/实际时效）、运费账单、用户评价/投诉记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（236 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/b2c_delivery_timeliness_experience_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-B2C-Delivery-Timeliness-Experience-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
B2C配送时效与体验KPI体系
基于《全链路管理》陈凤霞 B2C配送KPI三角均衡
时效/成本/体验三维量化 + 承诺时效动态优化
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


class DeliveryTimelinessKPI:
    """配送时效KPI计算"""

    def compute_on_time_delivery(self, actual_days: List[float],
                                  promised_days: List[float]) -> Dict:
        """配送及时率"""
        n = len(actual_days)
        on_time = sum(1 for a, p in zip(actual_days, promised_days) if a <= p)
        rate = on_time / max(n, 1)

        return {
            'total_shipments': n,
            'on_time_count': on_time,
            'on_time_rate': rate,
            'on_time_rate_pct': f"{rate:.1%}",
            'status': '✅达标' if rate >= 0.90 else ('🟡轻微未达' if rate >= 0.80 else '🔴未达'),
            'industry_benchmark': '90%+（跨境B2C标准）',
        }

    def compute_delivery_percentiles(self, actual_days: List[float]) -> Dict:
        """计算签收时长分布"""
        arr = np.array(actual_days)
        return {
            'p50_days': float(np.percentile(arr, 50)),
            'p80_days': float(np.percentile(arr, 80)),
            'p95_days': float(np.percentile(arr, 95)),
            'mean_days': float(arr.mean()),
            'std_days': float(arr.std()),
        }

    def optimize_promise_days(self, historical_days: List[float],
                               target_fulfillment_rate: float = 0.90,
                               seasonal_buffer: int = 0) -> Dict:
        """
        基于历史数据动态优化承诺时效
        target_fulfillment_rate: 目标兑现率（如90%）
        seasonal_buffer: 旺季缓冲天数
        """
        arr = np.array(historical_days)
        # 找到满足目标兑现率的最小承诺天数
        optimal_promise = np.percentile(arr, target_fulfillment_rate * 100)
        optimal_promise_with_buffer = optimal_promise + seasonal_buffer

        # 当前如果承诺的是P50，实际兑现率
        current_promise_p50 = np.percentile(arr, 50)
        current_fulfillment = float(np.mean(arr <= current_promise_p50))
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：物流追踪数据（承诺与实际时效）、运费账单、用户评价与投诉记录，以及各配送模式（FBA、海外仓、直邮）的订单范围。

**输出**：配送及时率与体验 KPI 报告、时效分位数与承诺时效优化建议、配送模式决策矩阵，供物流与运营团队使用。

## 执行步骤

1. 汇总各配送模式的承诺与实际时效数据
2. 计算及时率、时效分位数与满意度指标
3. 按分位数动态调整承诺时效
4. 输出配送模式选择矩阵与改善建议

## 边界与不做

- 何时不用：需要做履约漏斗拆解与账户健康指标归因时用订单履约率与发货及时率；仓网与本地发货率优化用本地订单达成率与FDC仓网覆盖KPI。
- 能力边界：输出 KPI 与承诺时效建议，平台承诺的最终修改需在平台后台人工执行。
- 数据边界：需要物流商 API 的精确时效与多平台投诉数据，数据未打通时承诺时效只能凭经验设定。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-B2C-Delivery-Timeliness-Experience-KPI

---

> 分类：业务运营/供应与履约/履约跟踪　·　技术族：04-供应链　·　源卡：`Skill-B2C-Delivery-Timeliness-Experience-KPI`