---
name: "p2s-supply-chain-finance-risk-modeling"
title: "Supply Chain Finance Risk Modeling — 供应链金融风险建模：跨境贸易融资信用评估"
description: "触发词：供应链金融、信用评分、授信额度测算、账号健康指标、旺季融资。何时不用：比较融资渠道与申请时机时用「Amazon Lending 决策」；做多批次备货融资组合时用「库存融资与供应链金融决策优化」。安全边界：评分仅供内部预评估，不构成授信承诺；不得虚构 GMV 或退款数据用于融资申请。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-014"
l3_business: "资金预测"
l3_all: "资金预测 / 经济性分析"
l1_l2_l3: "经营管理/财务与合规/资金预测"
p2s_card_id: "Skill-Supply-Chain-Finance-Risk-Modeling"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "提前知道自己能拿多少授信、评分卡在哪几项，旺季前把融资条件准备好。"
user_try: "试试：用我过去 12 个月的 GMV、退款和账号健康数据算信用评分，并告诉我哪些指标最该优化。"
whenToUse: "需要用销售稳定性、账号健康与退款率预评信用等级与授信额度时用；只做渠道比价与融资时机用融资决策类技能；做多批次资金组合用库存融资优化类技能。"
workflow: "汇总 12 个月 GMV、退款与账号健康数据 → 逐维度打分并合成信用评分 → 估算可申请额度区间 → 输出提分建议与融资准备清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Finance Risk Modeling — 供应链金融风险建模：跨境贸易融资信用评估

## ① 解决的问题

跨境卖家备货需要80万但银行不理解Amazon账期融资难——供应链金融信用评分用销售稳定性+账号健康+退款率量化信用等级，A级卖家可申请3倍月GMV授信，旺季融资获批避免缺货损失年化30-100万元

## ② 核心算法逻辑

传统信贷 vs 电商供应链金融：

## ③ 业务应用场景

业务问题：黑五前需要备货 ¥80 万，但公账上只有 ¥30 万。银行不了解 Amazon 卖家的业务模式，传统贷款需要抵押物。供应链金融平台（OFX/Payoneer Funding/Amazon Lending）基于销售数据评估信用，但卖家不知道哪些指标决定了授信额度，如何优化。
数据要求： - 过去 12 个月每月 GMV + 退款数据 - Amazon Account Health 指标（ODR/取消率） - Seller Central 回款记录
预期产出： - 实时信用评分（0-100） - 影响评分的关键因素排行 - 提升信用评分的操作建议 - 预计可申请的融资额度

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
旺季融资获批：避免缺货损失 ¥20-50 万/次
融资利率优化（信用好→利率低）：年化节省 ¥5-15 万
提前 3 个月知道评分关键因素并优化
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（特征工程清晰；Amazon Seller Central API 可获取所需数据；约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（155 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/supply_chain_finance_risk_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Supply-Chain-Finance-Risk-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Supply Chain Finance Risk Modeling
供应链金融信用评分：电商运营数据驱动的动态授信
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class SellerFinancialProfile:
    """卖家财务画像"""
    seller_id: str
    monthly_gmv: list           # 过去12个月每月GMV（美元）
    monthly_refunds: list       # 每月退款金额
    account_odr: float          # 订单缺陷率（越低越好）
    account_cancel_rate: float  # 取消率
    account_late_ship: float    # 延迟发货率
    settlement_days: float      # 平均回款天数（越短越好）
    platforms: int = 1          # 销售平台数
    years_selling: float = 1.0  # 账号年龄


def compute_credit_score(profile: SellerFinancialProfile) -> dict:
    """
    计算供应链金融信用评分（0-100）
    """
    gmv = np.array(profile.monthly_gmv)
    refunds = np.array(profile.monthly_refunds)

    # ── 维度1：销售稳定性 (25分) ──
    cv = gmv.std() / (gmv.mean() + 1e-8)  # 变异系数（越低越稳定）
    stability_score = max(0, 25 * (1 - min(cv, 1.5) / 1.5))

    # ── 维度2：成长趋势 (20分) ──
    if len(gmv) >= 6:
        recent = gmv[-3:].mean()
        earlier = gmv[:3].mean()
        growth_rate = (recent - earlier) / (earlier + 1e-8)
        # 适度增长加分，过快增长（可能刷单）惩罚
        if growth_rate < 0:
            growth_score = max(0, 20 + growth_rate * 20)
        elif growth_rate <= 0.5:
            growth_score = 20 * (1 + growth_rate)
        else:
            growth_score = 20 * (1 + 0.5) * np.exp(-(growth_rate - 0.5))
    else:
        growth_score = 10.0

    # ── 维度3：退款/退货健康度 (20分) ──
    refund_rate = refunds.sum() / (gmv.sum() + 1e-8)
    refund_score = max(0, 20 * (1 - min(refund_rate, 0.15) / 0.15))

    # ── 维度4：账号健康分 (20分) ──
    # ODR < 1%, 取消率 < 2.5%, 延迟发货 < 4%
    odr_ok = max(0, 1 - profile.account_odr / 0.01)
    cancel_ok = max(0, 1 - profile.account_cancel_rate / 0.025)
    late_ok = max(0, 1 - profile.account_late_ship / 0.04)
    health_score = 20 * (odr_ok * 0.5 + cancel_ok * 0.3 + late_ok * 0.2)

    # ── 维度5：回款能力 (15分) ──
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.17234，但该号在 arXiv 上是《Jacobian-Free Newton-Krylov method for multilevel NLTE radiative transfer problems》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 12 个月每月 GMV 与退款金额、账号健康指标（订单缺陷率、取消率、迟发率）、平均回款天数、平台数量与账号年限；粒度：账号级、按月。

**输出**：0-100 信用评分、关键影响因素排行、可申请融资额度估算与提分建议，供融资准备与平台选择使用。

## 执行步骤

1. 汇总 12 个月 GMV、退款与账号健康指标
2. 按销售稳定性、成长趋势、账号质量等维度逐项打分
3. 汇总信用评分并列出关键影响因素
4. 估算可申请额度区间
5. 输出评分提升建议与融资准备清单

## 边界与不做

- 数据不满足时不用：GMV 与退款数据不足 12 个月，或账号健康指标缺失时，评分稳定性不足。
- 能力边界：只做内部预评估，不代提交融资申请、不承诺授信结果；真实授信以资金方风控为准。

## 技能关联

- **前置**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-Accounts-Receivable-Intelligence.html、Skill-Accounts-Receivable-Intelligence、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-Recommendation-Finance.html、Skill-Recommendation-Finance、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Accounts-Receivable-Intelligence.html、Skill-Accounts-Receivable-Intelligence、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-Recommendation-Finance.html、Skill-Recommendation-Finance
- **可组合**：Skill-Accounts-Receivable-Intelligence.html、Skill-Accounts-Receivable-Intelligence、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-Recommendation-Finance.html、Skill-Recommendation-Finance、Skill-Supply-Chain-Finance-Risk-Modeling

---

> 分类：经营管理/财务与合规/资金预测　·　技术族：23-运营财务　·　源卡：`Skill-Supply-Chain-Finance-Risk-Modeling`