---
name: "p2s-probabilistic-hierarchical-new-product-forecast"
title: "概率层次预测 DPMN — 品类→子类→SKU 一致性联合预测"
description: "触发词：DPMN、层次一致性、概率预测、品类到 SKU、份额分解。何时不用：不要求层次一致、只要点预测时用常规时序模型；要在既有预测上做最优化加总投影时用「多层时序预测调和」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Probabilistic-Hierarchical-New-Product-Forecast"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "一批新品同时上市时，让品类总量和 SKU 分量对得上，并且给区间而不是一个点。"
user_try: "试试：给德国有机奶粉 3 个 SKU 做层次联合预测，让品类总量和 SKU 加总保持一致。"
whenToUse: "多 SKU 同批上市、需要品类到子类到 SKU 的概率一致预测时用；只做点预测不需要层次约束时用常规时序模型；对已有预测做最优加总调和时用多层时序预测调和。"
workflow: "构建品类到子品类到 SKU 的层次树 → 按父类信号与新品市场份额分解需求 → 用 DPMN 做联合预测保证聚合一致 → 输出 P10-P90 区间驱动总采购与分仓"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 概率层次预测 DPMN — 品类→子类→SKU 一致性联合预测

## ① 解决的问题

多SKU同批上市时品类备货与SKU备货互相矛盾——DPMN层次一致性联合预测，消除品类总量与SKU加总矛盾，保护每季度GMV损失20-50万元

## ② 核心算法逻辑

母婴电商的新品预测有天然层次结构：品牌级 → 品类级（奶粉/推车/纸尿裤）→ 子品类级（德国奶粉/日本奶粉）→ SKU 级。传统方法逐层独立预测，聚合后必然出现矛盾（子类加总 ≠ 父类预测）。DPMN（Deep Poisson Mixture Network）通过对层次结构的联合分布建模，天然保证聚合一致性，同时输出完整概率分布（而非点预测）。

## ③ 业务应用场景

- 业务问题：Momcozy 同时上市德国有机奶粉系列 3 个 SKU（1段/2段/3段）。若独立预测每个 SKU，三者加总往往与品类级预测不一致，导致品类级采购计划和 SKU 级备货计划相互矛盾 - 数据要求： - 品类级（德国奶粉）：52 周历史销售 - 子品类级（有机配方）：26 周历史（或同品类相似品历史） - 新品 SKU 特征：阶段/规格/定价，预估市场份额（1段 50%，2段 30%，3段 20%） - 执行流程： 1. 构建层次树：品类 → 子品类 → 3个新品 SKU 2. 用 DPMN 联合预测，层次一致性自动保证 3. 品类级预测驱动总采购，SKU 级预测驱动分仓分配 4
- 业务问题：基于品类级 Prime Day 历史推断新品 SKU 大促倍率，品类预测 × 市场份额 = 新品 SKU 大促需求 - 数据要求：品类级 3 年大促历史 + 新品市场份额预测（竞品 BSR 分析） - 执行流程：DPMN 顶层预测品类 Prime Day 需求 → 按市场份额分解到 SKU 级 → 输出 P10-P90 区间 - 业务价值：Prime Day 新品备货精度提升，过量/不足率从 40% → 20% - 三轨验证： - 成本：需爬取竞品 BSR 及历史大促数据（约 1 人周 + 爬虫维护费 $200/月）；计算资源同上；人力投入为 1 名运营 + 0.5 名数据分析师

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：消除层次矛盾导致的采购错位，每季度保护 GMV 20-50 万；新品冷启动精度借助父类信号提升 15-20%，年化 100-300 万/年
实施难度：⭐⭐⭐☆☆（层次树构建需 SKU 分类体系；DPMN 核心逻辑可用 statsforecast 库快速实现）
优先级：⭐⭐⭐⭐☆（多 SKU 同时上市时必需；层次一致性是供应链计划的基础要求）
评估依据：论文在 Amazon 内部 Favorita 杂货零售数据验证 CRPS 改善 8.1%；层次一致性是 Amazon 供应链预测的生产要求

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（204 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/probabilistic_hierarchical_new_product_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Probabilistic-Hierarchical-New-Product-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
概率层次新品销量预测 - Deep Poisson Mixture 简化版
论文 arXiv:2110.13179 (Olivares et al., 2021)
依赖: pip install numpy scipy scikit-learn
注：完整 DPMN 需 PyTorch；此处实现层次一致性 + Poisson 分布预测骨架
"""
from __future__ import annotations
import numpy as np
from scipy.stats import poisson, nbinom
from typing import Dict, List, Optional
from dataclasses import dataclass, field


@dataclass
class HierarchyNode:
    """层次树节点"""
    name: str
    level: str              # 'brand', 'category', 'subcategory', 'sku'
    history: Optional[np.ndarray] = None    # 历史销售序列
    children: List["HierarchyNode"] = field(default_factory=list)
    parent: Optional["HierarchyNode"] = None
    share: float = 1.0      # 在父节点中的市场份额（新品用此校准）
    is_new: bool = False     # 是否为新品 SKU


def fit_poisson_params(sales: np.ndarray) -> tuple[float, float]:
    """拟合负二项分布参数（泛化泊松，处理过度离散）"""
    mu = float(sales.mean())
    var = float(sales.var())
    if var <= mu or mu == 0:
        # 无过度离散，用泊松
        return mu, float('inf')
    # 负二项 r 参数
    r = mu**2 / (var - mu)
    return mu, r


def predict_node(
    node: HierarchyNode,
    horizon: int = 12,
    quantiles: tuple = (0.1, 0.5, 0.9),
) -> dict:
    """对单个节点预测（使用历史拟合参数）"""
    if node.history is None or len(node.history) == 0:
        return {"mu": 0.0, "quantiles": {q: 0.0 for q in quantiles}}

    mu, r = fit_poisson_params(node.history[-26:] if len(node.history) >= 26 else node.history)

    # 简单趋势调整（线性外推最近4周斜率）
    recent = node.history[-4:]
    slope = np.polyfit(np.arange(len(recent)), recent, 1)[0]
    mu_adjusted = max(1.0, mu + slope * horizon / 2)

    # 分位数预测
    q_vals = {}
    for q in quantiles:
        if np.isinf(r):
            q_vals[q] = float(poisson.ppf(q, mu_adjusted))
        else:
            p = r / (r + mu_adjusted)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2110.13179 — Probabilistic Hierarchical Forecasting with Deep Poisson Mixtures

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：品类级历史（卡页示例 52 周）、子品类级历史（卡页示例 26 周）、新品 SKU 特征与预估市场份额；粒度：层次节点×周。

**输出**：层次一致的联合概率预测（含 P10-P90 区间），品类级驱动总采购、SKU 级驱动分仓分配，供多 SKU 上新备货使用。

## 执行步骤

1. 搭建品类-子品类-SKU 层次树
2. 估计父类需求与新品市场份额
3. 做层次联合概率预测保证加总一致
4. 按区间输出总采购与分仓建议

## 边界与不做

- 数据不满足时不用：父类历史过短或市场份额无法估计（无可参考的竞品结构）时，分解比例缺少依据。
- 能力边界：产出预测与区间，不决定采购与分仓的执行动作。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Probabilistic-Hierarchical-New-Product-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Probabilistic-Hierarchical-New-Product-Forecast`