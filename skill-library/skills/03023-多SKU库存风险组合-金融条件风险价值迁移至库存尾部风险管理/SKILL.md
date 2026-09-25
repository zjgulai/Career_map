---
name: "p2s-cvar-inventory-risk-portfolio"
title: "CVaR多SKU库存风险组合 — 金融条件风险价值迁移至库存尾部风险管理"
description: "触发词：CVaR、库存风险组合、尾部风险、滞销损失、多SKU分配。何时不用：需要做 ABC 分层与策略自适应绑定时用动态ABC分层与策略自适应；需要按库龄分段精算持有成本并触发清仓时用库龄分段管理与资金成本化。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-CVaR-Inventory-Risk-Portfolio"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把多 SKU 需求的相关性算进去，找出极端滞销下损失最小的库存分配方案。"
user_try: "试试：用这 8 个 SKU 的历史月需求和成本，算出最差 5% 情景下的损失并给出最优订货分配。"
whenToUse: "需要量化多 SKU 相关性与极端滞销尾部损失、优化库存分配时用本技能；ABC 分层与策略绑定用动态ABC分层与策略自适应。"
workflow: "整理各 SKU 需求历史与成本参数 → 拟合需求分布与相关性结构 → 模拟情景并计算组合 CVaR → 求解预算约束下的最优分配并输出边际风险"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CVaR多SKU库存风险组合 — 金融条件风险价值迁移至库存尾部风险管理

## ① 解决的问题

供应链团队面临"多SKU库存协方差风险未量化、极端滞销情景下现金流受创"——CVaR组合优化将尾部滞销损失降低6%，年化释放现金40万元

## ② 核心算法逻辑

原属学科：金融风险管理，CVaR（Conditional Value at Risk，条件风险价值）又称Expected Shortfall（ES），由Rockafellar & Uryasev于2000年提出，解决了VaR的非凸性和尾部风险低估问题。

## ③ 业务应用场景

场景A：母婴品牌8SKU年库存800万的风险优化
- 业务问题：母婴品牌有8个SKU（主推款吸奶器×2 + 配件×3 + 耗材×3），年库存总价值800万元。过去配件跟随主机同步旺季，高度相关，分散效果差；需要找到最优的库存分配方案使极端滞销损失最小 - 数据要求： - 每个SKU的历史月需求（12个月） - 各SKU的采购成本、持有成本率、缺货惩罚成本 - 总库存预算约束 - 预期产出： - 最优库存分配方案（每个SKU的订货量） - 组合CVaR风险评估（最差5%情景下的损失） - 各SKU的边际风险贡献热力图 - 与等比例分配方案的对比 - 业务价值：滞销率降低6%，年化释放现金40万元
场景B：安全座椅+周边配件的季节性相关风险管理

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：滞销率降低6%，年化释放现金40万元；多SKU相关性风险意识可避免系统性过量备货
适用规模：SKU数 ≥ 5个、月库存总价值 ≥ 100万元的母婴跨境品牌
实施难度：⭐⭐⭐☆☆（需要历史需求数据 + scipy优化，计算量中等）
优先级：⭐⭐⭐⭐☆（供应链尾部风险是母婴跨境卖家最大的资金安全威胁，此方案是真正的量化防护）
核心门槛：

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（241 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
CVaR多SKU库存风险组合优化
金融条件风险价值(CVaR/ES) → 母婴跨境多品类库存尾部风险管理
基于Rockafellar & Uryasev (2000)
"""
import numpy as np
from scipy.optimize import minimize, LinearConstraint, Bounds


def simulate_demand_scenarios(mean_demands, cov_matrix, n_scenarios=5000, seed=42):
    """
    多元正态分布模拟多SKU需求情景
    mean_demands: 各SKU均值需求向量
    cov_matrix: 需求协方差矩阵
    """
    np.random.seed(seed)
    n_sku = len(mean_demands)
    # 多元正态模拟，截断为非负
    scenarios = np.random.multivariate_normal(mean_demands, cov_matrix, size=n_scenarios)
    scenarios = np.maximum(scenarios, 0)  # 需求非负
    return scenarios


def compute_portfolio_loss(quantities, scenarios, holding_costs, penalty_costs):
    """
    计算每个需求情景下的组合总损失
    quantities: 各SKU订货量向量
    scenarios: 需求情景矩阵 [n_scenarios x n_sku]
    holding_costs: 各SKU持有成本（元/个）
    penalty_costs: 各SKU缺货惩罚成本（元/个）
    """
    quantities = np.array(quantities)
    holding = np.array(holding_costs)
    penalty = np.array(penalty_costs)

    # 每个情景下的损失
    overstock = np.maximum(quantities - scenarios, 0)   # 过剩库存
    understock = np.maximum(scenarios - quantities, 0)  # 缺货量

    losses = np.sum(overstock * holding + understock * penalty, axis=1)
    return losses


def compute_cvar(losses, alpha=0.05):
    """
    计算CVaR（在最差alpha比例情景下的平均损失）
    alpha=0.05 → 最差5%情景的平均损失
    """
    losses_sorted = np.sort(losses)
    n = len(losses_sorted)
    cutoff_idx = max(1, int(np.ceil(alpha * n)))
    var = losses_sorted[-cutoff_idx]
    cvar = np.mean(losses_sorted[-cutoff_idx:])
    return var, cvar


def marginal_risk_contribution(quantities, scenarios, holding_costs, penalty_costs, alpha=0.05):
    """计算各SKU的边际风险贡献（通过微扰法）"""
    base_losses = compute_portfolio_loss(quantities, scenarios, holding_costs, penalty_costs)
    _, base_cvar = compute_cvar(base_losses, alpha)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每个 SKU 的历史月需求（建议 12 个月）、采购成本、持有成本率、缺货惩罚成本与总库存预算约束。

**输出**：各 SKU 最优订货量分配方案、组合 CVaR 风险评估（最差情景损失）、边际风险贡献与等比例方案对比，供供应链与财务团队决策。

## 执行步骤

1. 整理各 SKU 需求历史与成本参数
2. 拟合需求分布与相关性结构
3. 模拟情景并计算组合 CVaR
4. 求解预算约束下的最优分配并输出边际风险

## 边界与不做

- 何时不用：需要做 ABC 分类升级与策略绑定闭环时用动态ABC分层与策略自适应；库龄结构诊断与清仓触发用库龄分段管理与资金成本化。
- 能力边界：输出组合分配与风险度量，不执行采购下单，也不替代财务的资金预算决策。
- 数据边界：需求样本不足或协方差估计不稳时 CVaR 结果波动大；适用规模为 SKU 数不少于 5 个且月库存价值较高的品牌。

## 技能关联

- **前置**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Multi-SKU-Copula-Risk.html、Skill-Multi-SKU-Copula-Risk、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-SKU-Copula-Risk.html、Skill-Multi-SKU-Copula-Risk、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-SKU-Copula-Risk.html、Skill-Multi-SKU-Copula-Risk、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-CVaR-Inventory-Risk-Portfolio

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-CVaR-Inventory-Risk-Portfolio`