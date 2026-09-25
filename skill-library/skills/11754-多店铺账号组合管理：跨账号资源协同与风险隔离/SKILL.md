---
name: "p2s-multi-seller-account-portfolio"
title: "Multi-Seller Account Portfolio Management — 多店铺账号组合管理：跨账号资源协同与风险隔离"
description: "触发词：多账号组合、Markowitz优化、关联风险矩阵、风险传染、跨账号协同。何时不用：账号少于两个或没有12个月月度ROAS历史时不适用；单账号内部的预算分配走多平台分配技能。安全边界：关联风险矩阵依赖运营录入的基础设施信息，只作量化提示，不替代平台合规审查与申诉判断。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 资源情景比较"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Multi-Seller-Account-Portfolio"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把多个店铺账号当成一个投资组合来分预算，向高 ROAS 账号倾斜同时量化账号之间的关联风险。"
user_try: "试试：美国站三个账号月预算1.5万美元，主品牌 ROAS 4.2、副品牌2.8、子品牌6.1，帮我算最优分配和关联风险。"
whenToUse: "当同一品牌运营多个账号、预算按等比分配造成明显错配、且需要同时评估账号关联风险时用本卡；单账号跨平台分配用多平台预算分配器；只做情景对比不留风险维度用多目标预算分配。"
workflow: "汇总各账号 12 个月月度 ROAS 与健康分 → 采集共享 IP、收款、供应商与产品重叠信息 → 按共享基础设施权重算两两关联风险系数 → 做风险调整后的组合优化并定风险上限 → 输出最优分配与 Pareto 前沿"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Seller Account Portfolio Management — 多店铺账号组合管理：跨账号资源协同与风险隔离

## ① 解决的问题

品牌3个账号广告预算等比分配但子品牌ROAS6.1主品牌ROAS4.2存在明显错配——Markowitz组合优化将预算向高ROAS账号倾斜同时量化账号关联风险，预算重分配后组合ROAS提升15-25%年化增益20-60万元

## ② 核心算法逻辑

多账号管理的两个核心问题：

## ③ 业务应用场景

业务问题：品牌在 Amazon 美国有3个账号（主品牌/副品牌/独立子品牌），总广告月预算 $15,000。过去都是按账号GMV等比分配，但主品牌 ROAS 4.2、副品牌 ROAS 2.8、子品牌 ROAS 6.1，存在明显的资源错配。
数据要求： - 各账号过去 12 个月月度 ROAS 历史 - 各账号 GMV 相关性（季节性是否相似） - 账号间的关联风险评估
预期产出： - 最优预算分配（最大化组合 ROAS，给定风险上限） - Pareto 前沿：不同风险水平下的最优 ROAS - 关联风险矩阵：账号间的风险传染系数

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
广告预算重分配（从等权到最优）：组合 ROAS 提升 15-25%，月增利润 ¥5-15 万
关联风险隔离：避免连带封号损失 ¥50-500 万/次
多账号资源协同（库存/人力）：效率提升 15-20%，年化节省 ¥10-30 万
年化综合 ROI：¥30-100 万
实施难度：⭐⭐⭐☆☆（组合优化需要历史数据和数学建模；关联风险矩阵依赖运营手动输入基础设施信息；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/multi_seller_account_portfolio` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Multi-Seller-Account-Portfolio.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multi-Seller Account Portfolio Management
多账号组合优化 + 关联风险矩阵
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SellerAccount:
    account_id: str
    monthly_roas: list   # 过去12个月ROAS历史
    current_health: float = 1.0   # 0-1，账号健康分
    shared_ip: Optional[str] = None
    shared_payment: Optional[str] = None
    shared_supplier: Optional[str] = None
    product_overlap: float = 0.0  # 与其他账号的产品重叠度（0-1）


def compute_linkage_risk(a1: SellerAccount, a2: SellerAccount) -> float:
    """计算两账号间的关联风险（0=独立，1=高度关联）"""
    risk = 0.0
    # 共享基础设施权重
    if a1.shared_ip and a1.shared_ip == a2.shared_ip:
        risk += 0.40
    if a1.shared_payment and a1.shared_payment == a2.shared_payment:
        risk += 0.30
    if a1.shared_supplier and a1.shared_supplier == a2.shared_supplier:
        risk += 0.20
    risk += 0.10 * a1.product_overlap
    return min(1.0, risk)


def portfolio_optimization(accounts: list, total_budget: float,
                           risk_aversion: float = 1.0) -> dict:
    """
    Markowitz 组合优化：最大化 ROAS - λ × 风险
    简化版（无二次规划求解器依赖）
    """
    n = len(accounts)
    expected_roas = np.array([np.mean(a.monthly_roas) for a in accounts])
    roas_std = np.array([np.std(a.monthly_roas) for a in accounts])

    # 协方差矩阵（用历史 ROAS 序列估计）
    roas_matrix = np.array([a.monthly_roas for a in accounts])
    min_len = min(len(r) for r in roas_matrix)
    roas_matrix = np.array([r[:min_len] for r in roas_matrix])
    cov_matrix = np.cov(roas_matrix)

    # 简化优化：风险调整后的 ROAS 排序分配
    # 真实生产用 scipy.optimize.minimize 或 cvxpy
    health_weights = np.array([a.current_health for a in accounts])
    adjusted_roas = expected_roas * health_weights - risk_aversion * roas_std

    # 按调整后 ROAS 比例分配（简化版）
    adjusted_roas_pos = np.maximum(adjusted_roas, 0.1)
    weights = adjusted_roas_pos / adjusted_roas_pos.sum()

    portfolio_roas = float(np.sum(weights * expected_roas))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09234，但该号在 arXiv 上是《Determination of the distance from a projection to nilpotents》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各账号过去 12 个月的月度 ROAS 历史、当前账号健康分、共享基础设施信息（IP、收款方式、供应商、产品重叠度）、总预算与风险厌恶系数。

**输出**：各账号的最优预算分配方案、不同风险水平下的 Pareto 前沿，以及账号间关联风险矩阵（风险传染系数），供品牌方做预算与风险隔离决策。

## 执行步骤

1. 汇总各账号近 12 个月月度 ROAS 历史与当前健康分
2. 采集各账号共享 IP、收款、供应商与产品重叠信息
3. 按共享基础设施权重计算两两账号的关联风险系数
4. 用历史 ROAS 协方差做风险调整的组合优化
5. 给定风险上限扫描不同风险水平下的 Pareto 前沿
6. 输出最优预算分配与账号关联风险矩阵

## 边界与不做

- 何时不用：账号数少于两个、或没有 12 个月月度 ROAS 历史时不适用；单账号内部的渠道分配走其他分配技能。
- 能力边界：关联风险矩阵依赖运营手动录入的基础设施信息，只作量化提示，不替代平台合规审查与申诉判断。
- 执行边界：只产出分配方案与风险矩阵，不执行账号预算变更，也不处理账号申诉与合规整改动作。

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Multi-Seller-Account-Portfolio

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：23-运营财务　·　源卡：`Skill-Multi-Seller-Account-Portfolio`