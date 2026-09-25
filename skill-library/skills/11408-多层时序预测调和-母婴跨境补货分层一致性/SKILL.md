---
name: "p2s-hierarchical-demand-forecasting-reconciliation"
title: "HiFoReAd 多层时序预测调和 - 母婴跨境补货分层一致性"
description: "触发词：多层预测调和、SKU-仓-市场一致性、MinTrace、加总矩阵、层级预测。何时不用：只要单层序列的原始预测时用「Prophet 预测」或「时间序列预测」，只跨日/周/月粒度对齐时用「多时间粒度预测协调」。安全边界：仅用内部销售数据，不涉定价与广告；SKU 级数据需脱敏，不得含个人身份信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Hierarchical-Demand-Forecasting-Reconciliation"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "让 SKU、仓、市场三层的预测数字互相对得上，采购和财务不再各算一套，月底不用再人工调和。"
user_try: "试试：用 HiFoReAd 把 SKU×仓×市场三层预测调和到完全一致，输出可直接下单的一致性预测表。"
whenToUse: "预测要分 SKU/仓/市场（或品类/子类/SKU）多层、且各层加总必须一致时用；只做单层序列预测时用基础时序预测技能；只需跨日/周/月粒度对齐时用多时间粒度预测协调。"
workflow: "整理 SKU/仓/市场三层历史销售时序并确认加总矩阵 S → Stage 1 用 LGBM 与 AutoETS 做各层独立三月预测 → Stage 2 用 MinTrace 加 mint_shrink 协方差收缩做最优调和 → Stage 3 谐波对齐保留 SKU 级月度季节性 → 输出各层一致预测，交采购下单与财务对账"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HiFoReAd 多层时序预测调和 - 母婴跨境补货分层一致性

## ① 解决的问题

Momcozy 60+ SKU × 多仓(上海/香港/海外仓) × 多市场(US/DE/JP),各层独立预测加总 30-50% 不一致;采购按 SKU 下单,但财务按市场聚合,两边数字对不上,月底对账 2-3 PM 天纯人工调和 - 数据要求:历史 SKU/仓/市场 三层销售时序 + 加总矩阵 S - HiFoReAd 配置: - Stage 1: LGBM + AutoETS 三月预测

## ② 核心算法逻辑

母婴跨境补货场景下,各 SKU/仓/市场层独立预测后,加总不一致(SKU 求和 ≠ 仓库 ≠ 总量),导致采购计划矛盾、财务对账打架. HiFoReAd 用多阶段调和:① 三模型集成基础预测 → ② TopDown + 谐波对齐保留季节性 → ③ MinTrace 投影使全局误差方差最小 → ④ 末层 stratified scaling 强制叶节点一致. Walmart Ads 已生产部署,各层完全一致.

## ③ 业务应用场景

- 业务问题:Momcozy 60+ SKU × 多仓(上海/香港/海外仓) × 多市场(US/DE/JP),各层独立预测加总 30-50% 不一致;采购按 SKU 下单,但财务按市场聚合,两边数字对不上,月底对账 2-3 PM 天纯人工调和 - 数据要求:历史 SKU/仓/市场 三层销售时序 + 加总矩阵 S - HiFoReAd 配置: - Stage 1: LGBM + AutoETS 三月预测,各层独立 - Stage 2: MinTrace + mint_shrink(协方差收缩,样本量小时鲁棒) - Stage 3: Harmonic alignment 保留 SKU 级月度季节性
三轨验证： - 成本：数据采集需整合 ERP/WMS/电商平台 3 套系统历史销售数据，ETL 开发约 2 人周；计算资源使用单台 8 核云服务器即可，月成本 < 500 元；人力投入为 1 名数据工程师 + 1 名业务分析师，约 4 人周。 - 合规：不触碰 Amazon 政策红线（仅使用内部销售数据，不涉及定价/广告）；GDPR 合规需确保 SKU 级数据脱敏，不包含个人身份信息；广告法无直接关联。 - 风险：若加总矩阵 S 定义错误（如漏掉某个子节点），会导致调和结果系统性偏差，需业务专家复核层级关系；次生风险为库存周转提升后，若采购未同步调整，可能引发短期缺货。
- 业务问题:Momcozy 月度采购计划(大贸海运,提前 60 天)与周度补货触发(海外仓 FBA,提前 7 天)不一致,618/双11 备货期间月度预算与周度爆发严重错配 - 数据要求:月度采购历史 + 周度销售历史 + 大促日历 - HiFoReAd 配置: - Stage 1: 月度层 MSTL+ETS 抽取年度季节性,周度层 Prophet 捕捉短期峰谷 - Stage 2: Temporal MinTrace 保证 $\sum_{w \in \text{month}} \tilde{y}_w = \tilde{y}_{\text{month}}$ - Stage 3: Strati

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

极易:Nixtla HierarchicalForecast 开源完整,`pip install` 即可
易处:MinTrace 是凸优化问题,有解析解,无需训练
难处:加总矩阵 S 需要业务专家确认层级关系
难处:误差方差 W 估计依赖足够历史数据(论文用 mint_shrink 协方差收缩)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（113 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/time_series/hierarchical_demand_forecasting_reconciliation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Hierarchical-Demand-Forecasting-Reconciliation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
HiFoReAd 多层时序预测调和最小骨架
主论文: arXiv:2412.14718 (Walmart, BigData 2024)
开源参考: Nixtla HierarchicalForecast https://github.com/Nixtla/hierarchicalforecast
依赖: pip install hierarchicalforecast statsforecast pandas numpy
"""
from __future__ import annotations
from typing import Dict, List

import numpy as np


def build_summing_matrix(hierarchy: Dict[str, List[str]]) -> np.ndarray:
    """构造层级加总矩阵 S
    hierarchy: {parent: [children]} 描述层级关系
    返回 S[i,j] = 1 表示节点 i 包含叶子 j
    """
    leaves = []
    for parent, children in hierarchy.items():
        for c in children:
            if c not in hierarchy:
                leaves.append(c)

    nodes = ["Total"] + sorted(hierarchy.keys() - {"Total"}) + sorted(leaves)
    node_idx = {n: i for i, n in enumerate(nodes)}
    n, m = len(nodes), len(leaves)
    S = np.zeros((n, m))

    leaf_idx = {leaf: j for j, leaf in enumerate(leaves)}
    for leaf in leaves:
        S[node_idx[leaf], leaf_idx[leaf]] = 1.0

    def collect_leaves(node):
        if node in leaf_idx:
            return [node]
        result = []
        for child in hierarchy.get(node, []):
            result.extend(collect_leaves(child))
        return result

    for node in nodes:
        if node not in leaf_idx:
            for leaf in collect_leaves(node):
                S[node_idx[node], leaf_idx[leaf]] = 1.0

    return S, nodes, leaves


def mint_reconcile(y_hat: np.ndarray, S: np.ndarray, W: np.ndarray = None) -> np.ndarray:
    """MinTrace 调和投影(Eq. core)
    y_hat: (n,) 各层独立预测
    S: (n, m) 加总矩阵
    W: (n, n) 误差方差矩阵,默认单位矩阵 (OLS)
    """
    n = S.shape[0]
    if W is None:
        W = np.eye(n)
    W_inv = np.linalg.inv(W)
    G = np.linalg.inv(S.T @ W_inv @ S) @ S.T @ W_inv
    return S @ G @ y_hat
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2412.14718 — A Comprehensive Forecasting Framework based on Multi-Stage Hierarchical Forecasting Reconciliation and Adjustment

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史 SKU/仓/市场三层销售时序，加层级加总矩阵 S（父节点到叶子的包含关系，需业务专家确认）；粒度：SKU×仓×市场，按需按月或按周汇总。

**输出**：各层完全一致的调和预测表（叶子 SKU 与仓库、市场汇总口径统一），含月度采购层与周度补货层两套结果，供采购下单与财务对账使用。

## 执行步骤

1. 整理 SKU、仓、市场三层历史销售序列并确认叶子节点
2. 构建并复核加总矩阵 S，确保层级关系无遗漏
3. 用 LGBM 与 AutoETS 生成各层独立基础预测
4. 用 MinTrace（mint_shrink）投影调和并保留季节性
5. 输出各层一致性预测替代月底人工调和

## 边界与不做

- 数据不满足时不用：缺三层历史时序，或加总矩阵 S 无法由业务专家确认层级关系时，调和结果会系统性偏差。
- 能力边界：产出的是层级一致性与预测口径，不是执行器；下单、改库存等动作仍由采购或控制层完成。

## 技能关联

- **前置**：Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Hierarchical-Demand-Forecasting-Reconciliation

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Hierarchical-Demand-Forecasting-Reconciliation`