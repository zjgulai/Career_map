---
name: "p2s-otif-on-time-in-full-analytics"
title: "OTIF准时足量交货分析 — 供应商交货履约率量化与预测性缓冲策略"
description: "触发词：准时足量、交货履约、隐性成本、缓冲策略。何时不用：采购订单记录不足或字段缺失时交货率不可靠；对供应商做多准则综合评分用供应商评估模型类技能。安全边界：预测结论需达到既定精度门槛才可用于备货决策，并建议第三方审计验证。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-OTIF-On-Time-In-Full-Analytics"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应商准时足量交货率算成真金白银的隐性成本，找出该迁移或该催单的对象。"
user_try: "试试：帮我算这 5 家供应商的准时足量交货率和隐性成本，看要不要换供应商。"
whenToUse: "本卡属「供应商评估」。需要量化供应商交货履约率、计算延期隐性成本并预测延误风险时用本卡；对供应商做多准则综合评分与选择时用供应商评估模型类技能。"
workflow: "汇总采购订单记录 → 逐单判定准时与足量 → 计算履约率与隐性成本 → 预测延误概率并给缓冲策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# OTIF准时足量交货分析 — 供应商交货履约率量化与预测性缓冲策略

## ① 解决的问题

供应商OTIF 71%被当成"还行"，实际月隐性成本$2653——OTIF量化将供应商真实成本水落石出，迁移至高OTIF供应商年净节省$23436（即使报价高5%）

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中强调OTIF（OnTime InFull，准时足量）是评估供应商/物流商最核心的KPI之一。"OnTime"=按承诺交期到货，"InFull"=按承诺数量足量到货，两个条件同时满足才算OTIF=1，任何一个不满足即OTIF=0（不可按比例）。书中目标：稳定供应商OTIF≥95%；波动大的供应商必须额外持有缓冲库存以吸收其不确定性，而这个缓冲库存的成本最终应被归因到该供应商的"真实采购成本"中。

## ③ 业务应用场景

- 业务问题：某卖家有5家供应商，直觉认为"都还不错"，但实际上1家吸奶器供应商连续3个月交期平均延迟8天，每次导致FBA库存告急触发空运补货，额外成本$8/件 - 数据要求：12个月采购订单记录（承诺交期/实际交期/承诺数量/实际到货量） - 算法应用： 1. 计算5家供应商OTIF：S-001=96%（优秀），S-002=87%（待改进），S-003=71%（不合格），S-004=94%，S-005=98% 2. S-003 OTIF 71%，计算隐性成本：每月多持有安全库存400件（$15200），月资金成本$253；加上因延误触发空运约$2400/月，真实月成本额外$2653 3. S
- 业务问题：Q4大促前2个月下了大额备货订单，担心历史OTIF 87%的供应商再次延误，影响Prime Day库存 - 算法应用：ML模型预测该订单OTIF失败概率45%（基于旺季产能紧张+当前铜价上涨）；触发：提前2周催单+安排质检驻场+备用供应商预下小批量订单（保底） - 预期产出：大促备货到位率从历史87%提升至95%，旺季缺货风险大幅降低
**三轨验证** | 成本轨：AI预测模型部署成本月均3,200元（云服务2,000元+数据标注800元+人工维护400元），ROI周期4.2个月，年化成本38,400元 vs 年化收益450,000元，净收益411,600元；人工投入12小时/月（数据审核8h+模型调优4h） | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，预测精度需≥92%方可用于备货决策，建议建立第三方审计机制验证缺货率下降真实性 | 风险轨：①模型漂移风险（季节性变化导致预测失效，概率15%）②数据质量风险（历史数据缺失或错误，概率8%）③供应链中断风险（物流延迟影响补货，概率12%）④库存积压风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：识别1个OTIF 71%的问题供应商，月隐性成本约$2653；迁移至OTIF 97%的替代供应商后月净节省$1953，年化$23436；系统建设成本$3万，ROI≈78%首年，第二年起ROI=781%
实施难度：⭐⭐☆☆☆（数据全在采购PO系统里，建模逻辑简单；关键是建立"每个PO必须记录实际到货日和到货量"的数据规范）
优先级：⭐⭐⭐⭐⭐（供应商管理最被低估的维度，OTIF量化能直接改变供应商谈判筹码和选择决策）
适用规模：每月>5个采购订单的卖家
数据依赖：采购PO系统（承诺交期/实际到货日/承诺数量/实际到货量）、延误根因记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（284 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/otif_on_time_in_full_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-OTIF-On-Time-In-Full-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
OTIF准时足量交货分析系统
功能：OTIF精确计算 + 缓冲库存成本化 + 供应商分级 + 根因归因 + 预警
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PurchaseOrder:
    """采购订单记录"""
    po_id: str
    supplier_id: str
    sku_id: str
    promised_qty: int
    actual_qty: int
    promised_date: datetime
    actual_date: datetime
    delay_reason: str = ""    # 根因类型

    @property
    def on_time(self) -> bool:
        return self.actual_date <= self.promised_date

    @property
    def in_full(self) -> bool:
        return self.actual_qty >= self.promised_qty * 0.98  # 允许2%短装

    @property
    def otif(self) -> bool:
        return self.on_time and self.in_full

    @property
    def delay_days(self) -> int:
        return max((self.actual_date - self.promised_date).days, 0)

    @property
    def fill_rate(self) -> float:
        return self.actual_qty / max(self.promised_qty, 1)


class OTIFAnalyzer:
    """OTIF分析引擎"""

    OTIF_GRADES = {
        (0.97, 1.00): ('🟢优秀', '正常合作，优先选用'),
        (0.90, 0.97): ('🟡良好', '一般监控，关注趋势'),
        (0.80, 0.90): ('🟠待改进', '发送改进通知，增加缓冲库存'),
        (0.00, 0.80): ('🔴不合格', '限制新订单，评估替换'),
    }

    DELAY_REASONS = [
        'PRODUCTION_DELAY', 'MATERIAL_SHORTAGE', 'QUALITY_FAIL',
        'LOGISTICS_DELAY', 'DOCUMENT_ISSUE', 'OTHER',
    ]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.04521，但该号在 arXiv 上是《Uncertainty-Aware Relational Graph Neural Network for Few-Shot Knowledge Graph Completion》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：12 个月采购订单记录（承诺交期、实际交期、承诺数量、实际到货量），以及旺季产能与原材料价格等外部信号。

**输出**：各供应商的交货履约率与隐性成本测算、迁移或催单建议、在手订单延误概率预测与预测性缓冲策略。

## 执行步骤

1. 汇总 12 个月采购订单记录
2. 逐单判定是否准时与足量并计算履约率
3. 测算延期带来的安全库存与空运等隐性成本
4. 用模型预测在手订单的延误概率
5. 输出催单、驻场质检或备选供应商方案

## 边界与不做

- 采购订单记录不足或字段缺失时履约率不可靠，不用本卡
- 本卡产出履约评估与缓冲建议，不负责供应商谈判与索赔执行
- 预测结论需达到既定精度门槛才可用于备货决策，并建议第三方审计验证

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-OTIF-On-Time-In-Full-Analytics

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-OTIF-On-Time-In-Full-Analytics`