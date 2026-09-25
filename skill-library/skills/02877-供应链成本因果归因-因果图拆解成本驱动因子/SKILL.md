---
name: "p2s-causal-supply-chain-attribution"
title: "供应链成本因果归因 — DAG 因果图拆解成本驱动因子"
description: "触发词：成本因果归因、DAG 拆解、Shapley 值、汇率与运价、供应商切换测算。何时不用：要用时序生产图与图神经网络做链路归因用「知识图谱成本归因」；要按经营指标逐层归因生成报告用「多步推理 BI 归因」。安全边界：因果结论依赖建模假设，需做敏感性检验；供应商报价与成本数据属商业机密，不得外传。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Causal-Supply-Chain-Attribution"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用因果图和 Shapley 分解把成本上涨拆到运价、原材料、汇率、库存罚款各因素头上，还能提前算出换供应商划不划算。"
user_try: "试试：把本季履约成本从 3.2 涨到 4.8 美元的原因拆开，给出各因子贡献金额和可控项建议。"
whenToUse: "需要在多个成本因子之间做可加、可比的因果贡献分解时用本技能；链路级图谱归因用「知识图谱成本归因」；标准经营指标归因报告用「多步推理 BI 归因」。"
workflow: "汇总月度成本数据与候选驱动因子，含汇率、海运指数、原材料价与库存量 → 用 DAG 建模因子与成本之间的因果路径 → 用 Shapley 值把成本变化量分配给各因子 → 输出归因报告并给出可控因子的改善建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链成本因果归因 — DAG 因果图拆解成本驱动因子

## ① 解决的问题

供应链总监面临"成本异常上升不知道是原材料还是汇率还是物流哪个因素主导"——DAG因果图+Shapley拆解将成本驱动因子识别时间从2周分析压缩至4小时，年化决策准确度提升

## ② 核心算法逻辑

核心思想：将供应链成本异常（如本月成本突增 30%）分解为多个驱动因子的因果贡献：原材料涨价、汇率波动、物流涨价、库存积压罚款、关税变化。通过 DAG（有向无环图）建模各因子的因果路径，用前门准则/后门准则计算每个因子的独立因果效应。

## ③ 业务应用场景

- 业务问题：2026 年 Q1 每单履约成本从 $3.2 上升到 $4.8（涨幅 50%），财务要求给出详细归因报告，但运营不清楚是哪几个因素共同作用导致的 - 数据要求：月度成本数据（原材料采购成本/FBA 仓储费/头程物流费/关税）+ 对应的驱动因子数据（美元/人民币汇率/海运指数/铝价/库存量） - 预期产出：成本归因报告：海运涨价贡献 42%（+$0.67）、原材料（铝价）涨价贡献 28%（+$0.45）、汇率贬值贡献 18%（+$0.29）、库存积压罚款贡献 12%（+$0.19）；针对性改善建议 - 业务价值：找到可控因子（库存 12%），立即执行库存优化，年化降低履约成本约 8
- 业务问题：Q3 将吸奶器马达供应商从 A 换成 B（B 价格低 15%，但质量风险未知），运营想提前量化「如果换了供应商，总成本会如何变化」——需要考虑直接采购成本变化，以及间接效应（退货率上升 → 物流成本增加） - 数据要求：历史供应商 A 的成本数据 + 供应商 B 的报价 + 类似品类切换供应商的历史案例（对照数据） - 预期产出：直接成本降低 $0.48/单，但预计退货率从 3% → 5.5%（+$0.38/单 物流成本）、负面 Review 增加预计 GMV 影响 $0.15/单；净节省仅 $-0.05/单，切换不合算 - 业务价值：避免错误切换决策，规避风险损失约 25 万元
三轨验证 | 成本轨：AI因果推断模型月均成本3,200元（云计算1,500元+数据标注800元+模型维护900元），人工审核8小时/月，ROI周期2.8个月（年化节省45万÷12÷3,200=1.17倍）| 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，需建立溯源档案并通过ISO 9001认证，依据为海关总署2023年跨境电商监管指南| 风险轨：预测偏差风险15%（季节性波动未充分训练），供应商履约延迟风险8%，库存积压风险12%，建议建立±5%缓冲库存机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：精准归因后针对性降本（可控因子）年化约 20 万元；避免错误切换供应商等决策错误年化 25 万元。总年化约 45 万元
实施难度：⭐⭐⭐☆☆（需 scipy + sklearn；Shapley 值计算复杂度为 $O(2^n)$，n=5 因子时可接受；n>8 需改用近似算法）
优先级：⭐⭐⭐⭐⭐（供应链成本波动是母婴跨境的核心风险，高频痛点；是因果推断在供应链域的「杀手级应用」）
评估依据：Shapley 值是满足公理性的公平归因方法（效率/对称/哑元/可加性），不会因特征相关性导致归因失真

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/causal_supply_chain_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Causal-Supply-Chain-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链成本因果归因
DAG 结构 + Shapley 值分解成本驱动因子贡献
"""
import numpy as np
from itertools import combinations
from typing import List, Dict, Tuple, Callable
import warnings

warnings.filterwarnings("ignore")


class SupplyChainCostAttributor:
    """
    供应链成本驱动因子因果归因
    使用 Shapley 值公平分配各因子的贡献
    """

    def __init__(self, factor_names: List[str]):
        self.factor_names = factor_names
        self.n = len(factor_names)

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
    ):
        """
        拟合成本预测模型
        X: 驱动因子矩阵 (n_obs, n_factors)
        y: 成本序列 (n_obs,)
        """
        from sklearn.linear_model import LinearRegression
        self.model = LinearRegression()
        self.model.fit(X, y)
        self.baseline_cost = float(np.mean(y))
        self.coefficients = self.model.coef_
        return self

    def shapley_attribution(
        self,
        x_before: np.ndarray,
        x_after: np.ndarray
    ) -> Dict:
        """
        Shapley 值归因：将成本变化量分配给各驱动因子
        x_before: 基期各因子值 (n_factors,)
        x_after: 当期各因子值 (n_factors,)
        """
        cost_before = float(self.model.predict([x_before])[0])
        cost_after = float(self.model.predict([x_after])[0])
        total_change = cost_after - cost_before

        # Shapley 值计算
        shapley_values = np.zeros(self.n)
        factors = list(range(self.n))

        for i in factors:
            marginal_contributions = []
            for r in range(self.n):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11461，但该号在 arXiv 上是《Digital twins of nonlinear dynamical systems: A perspective》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：月度成本数据（原材料采购成本、FBA 仓储费、头程物流费、关税）与对应驱动因子数据（美元兑人民币汇率、海运指数、铝价、库存量），需覆盖对比期。

**输出**：成本归因报告（各因子贡献金额与占比）与针对性改善建议，用于判断该优先压缩哪个环节。

## 执行步骤

1. 汇总成本数据与候选驱动因子序列
2. 用 DAG 建模因子到成本的因果路径
3. 用 Shapley 值分解成本变化并核验可加性
4. 输出归因结果与可控因子的改善建议

## 边界与不做

- 样本期过短、指标缺失或因子数超过 8 个时不适用，Shapley 计算量与稳定性都会失控
- 因果结论依赖建模假设，须做敏感性检验，不能当作决策的唯一依据
- 供应商报价与成本结构属商业机密，不得对外披露

## 技能关联

- **前置**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Commodity-Futures-Cost-Baseline.html、Skill-Commodity-Futures-Cost-Baseline、Skill-Counterfactual-Evaluation.html、Skill-Counterfactual-Evaluation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design
- **延伸**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Commodity-Futures-Cost-Baseline.html、Skill-Commodity-Futures-Cost-Baseline、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design
- **可组合**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Commodity-Futures-Cost-Baseline.html、Skill-Commodity-Futures-Cost-Baseline、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design、Skill-Causal-Supply-Chain-Attribution

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：04-供应链　·　源卡：`Skill-Causal-Supply-Chain-Attribution`