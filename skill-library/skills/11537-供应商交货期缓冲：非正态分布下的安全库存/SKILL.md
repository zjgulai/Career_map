---
name: "p2s-supplier-lead-time-buffer"
title: "Supplier Lead Time Buffer — 供应商交货期缓冲：非正态分布下的安全库存"
description: "触发词：交期缓冲、非正态分布、分位数安全库存、旺季倍增、交货期分布。何时不用：要按 P95 与承诺期比值自动上调参数时用「前置期安全库存自动调整」；求常规服务水平下的解析解走「安全库存与补货策略」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Supplier-Lead-Time-Buffer"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "交期不是正态分布时，用历史分位数和旺季系数算缓冲，而不是硬套正态公式。"
user_try: "试试：60 条历史交货期记录，按淡季和旺季分别算 P95 交期与安全库存缓冲。"
whenToUse: "供应商交期分布明显非正态、旺季延误加剧，正态假设的安全库存频繁失效时用；交期稳定时用解析公式即可。"
workflow: "整理历史交货期记录并标记旺季月份 → 分别估计淡季与旺季的交期分位数 → 按分位数交期与均值交期之差乘日均销量算缓冲 → 旺季施加季节倍增系数"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supplier Lead Time Buffer — 供应商交货期缓冲：非正态分布下的安全库存

## ① 解决的问题

采购经理面临供应商交期波动大——交期缓冲将断供率从9%降到2%，年化省19万元

## ② 核心算法逻辑

论文：Nonparametric Safety Stock Estimation for HeavyTailed Lead Times in Supply Chains | 年份：2021

## ③ 业务应用场景

场景一：奶粉海运补货缓冲（中国工厂→美国仓库）
- 业务问题：普通时段中国→美西海运 LT 均值 28 天，双11前后（10-12月）延误显著增加，以往按正态分布计算的安全库存频繁出现缺货。 - 数据输入：60 条历史交货期记录（含旺季标注），日均销量 500 罐，目标服务水平 95% - 系统处理： - 淡季 P95 LT = 38 天；旺季 P95 LT = 52 天（seasonal_factor = 1.37） - 淡季安全库存 = (38-28) × 500 = 5,000 罐 - 旺季安全库存 = (52-28) × 500 × 1.37 ≈ 16,440 罐（自动触发旺季倍增） - 业务价值：缺货率从 15% 降至 5%，避免
场景二：WF-A 智能补货（综合交货期分布+需求不确定性）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

缺货率：从 15% 降至 5%（旺季安全库存自动倍增）
库存精准度：非参数分位数 vs 正态假设，极端延误预测误差降低 40%
实施难度：⭐⭐☆☆☆（仅需历史交货期记录，无复杂模型）
优先级：⭐⭐⭐⭐☆（对跨境母婴补货影响直接）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（281 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/logistics/supplier_lead_time_buffer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Supplier-Lead-Time-Buffer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Supplier-Lead-Time-Buffer
供应商交货期缓冲：非正态分布下的安全库存计算
基于 Gen-QOT 工业实践 2024 + 交货期分布建模
纯 Python 标准库，Python 3.14 兼容，无第三方依赖
"""
from __future__ import annotations
import math
import statistics
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional


@dataclass
class LeadTimeRecord:
    """单条交货期记录"""
    supplier_id: str
    order_date: date
    actual_delivery_date: date
    expected_delivery_date: date
    month: int = field(init=False)

    def __post_init__(self) -> None:
        self.month = self.actual_delivery_date.month

    @property
    def actual_lead_time_days(self) -> int:
        """实际交货期（天）"""
        return (self.actual_delivery_date - self.order_date).days

    @property
    def delay_days(self) -> int:
        """超期延误天数（负值表示提前）"""
        return (self.actual_delivery_date - self.expected_delivery_date).days


# 旺季月份（海运双11+圣诞旺季：10-12月）
PEAK_SEASON_MONTHS: frozenset[int] = frozenset({10, 11, 12})


class LeadTimeDistributionEstimator:
    """
    历史交货期分位数估计器（非参数方法）
    支持季节性调整：旺季 vs 淡季分开估计
    """

    def __init__(
        self,
        records: list[LeadTimeRecord],
        peak_months: frozenset[int] = PEAK_SEASON_MONTHS,
    ) -> None:
        if len(records) < 10:
            raise ValueError("记录数量不足 10 条，分位数估计不可靠")
        self._records = records
        self._peak_months = peak_months
        self._all_lts = [r.actual_lead_time_days for r in records]
        self._peak_lts = [
            r.actual_lead_time_days
            for r in records
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.08978，但该号在 arXiv 上是《Pattern recognition in Deep Boltzmann machines》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Nonparametric Safety Stock Estimation for HeavyTailed Lead Times in Supply Chains》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史交货期记录（每条含供应商、下单日、实际到货日、预计到货日，少于 10 条时拒绝估计）、日均销量、目标服务水平与旺季月份定义。

**输出**：淡季与旺季的分位数交期、对应的安全库存缓冲量、季节倍增系数与缺货率改善预期，供备货缓冲设置。

## 执行步骤

1. 整理历史交货期记录并标注旺季
2. 按淡季与旺季分别估计交期分位数
3. 用分位数交期与均值交期之差乘日均销量算缓冲
4. 旺季施加季节倍增系数
5. 输出安全库存缓冲与缺货率预期

## 边界与不做

- 数据不满足时不适用：交货期记录不足 10 条时无法可靠估计分位数；缺少到货日期字段则无法计算实际交期。
- 能力边界：只算缓冲量，不改善供应商交期，也不负责合同违约追责。

## 技能关联

- **前置**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Supplier-Lead-Time-Buffer

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：18-物流履约　·　源卡：`Skill-Supplier-Lead-Time-Buffer`