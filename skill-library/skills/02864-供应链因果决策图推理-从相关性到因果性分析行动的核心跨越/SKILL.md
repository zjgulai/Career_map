---
name: "p2s-causal-decision-graph-sc-inference"
title: "供应链因果决策图推理 — 从相关性到因果性，Palantir分析→行动的核心跨越"
description: "触发词：因果决策图、因果图构建、后门调整、干预效应、反事实推理。何时不用：只需时间序列上的活动增效用合成控制或时序因果技能，本技能用因果图做干预与反事实推理并审查关联误判。安全边界：仅分析自有折扣与供应决策，不得涉及与竞品的价格合谋；供应商相关结论不得构成歧视性排除，须保留分析文档与审计轨迹。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-106"
l3_business: "因果局限审查"
l3_all: "因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/因果局限审查"
p2s_card_id: "Skill-Causal-Decision-Graph-SC-Inference"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应链决策画成因果图，先分清因果还是关联，再决定动不动手。"
user_try: "试试：把折扣、竞品大促、退货率画成因果图，判断旺季该不该取消折扣。"
whenToUse: "要判断某个干预（折扣、供应商切换、库存策略）的真实因果效应并显式审查遗漏混杂时用本技能；只做时序活动增效用合成控制或时序因果技能，做分群效应用 DML 类技能。"
workflow: "与业务专家共建因果图 → 识别并纳入混杂变量 → 用后门调整估计干预效应 → 做反事实推演 → 给出干预建议并留审计轨迹"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链因果决策图推理 — 从相关性到因果性，Palantir分析→行动的核心跨越

## ① 解决的问题

决策者面临"相关性分析无法判断因果方向导致错误干预"——Pearl因果阶梯从关联→干预→反事实，Airbus/Merck案例证明正确干预降低30%库存决策错误率

## ② 核心算法逻辑

因果决策图推理是Palantir成功案例中"从分析到行动"的核心智识升级。Airbus和Merck的案例反复证明：相关性导致错误干预，因果性才能做出正确决策。

## ③ 业务应用场景

三轨验证： - 成本：显性成本较低，主要消耗为历史交易数据清洗（约2人天）和因果图构建（需供应链专家1-2人天）；计算资源需求低，单次分析可在普通笔记本完成。 - 合规：不触碰Amazon价格操纵红线（仅分析自身折扣策略，不涉及竞品价格合谋）；符合GDPR要求（使用聚合交易数据，不涉及个人身份信息）；广告法风险低（折扣声明基于真实因果效应，非虚假促销）。 - 风险：中等风险——若因果模型误判（如遗漏重要混杂变量如竞品大促），可能导致旺季错误地取消折扣，损失市场份额；建议搭配A/B测试验证因果结论后再全量执行。
**三轨验证**： - **成本**：中等成本——需整合供应商质量数据、产品定位标签、客户画像数据（约3-5人天数据工程）；因果模型需定期更新（每季度1次，约0.5人天）。 - **合规**：高风险——供应商选择涉及公平竞争合规，需确保因果分析不构成对特定供应商的歧视性排除；建议保留完整的分析文档和审计轨迹，以应对供应商申诉；GDPR方面需注意客户画像数据的使用授权。 - **风险**：中高风险——若因果模型错误地将退货率归因于产品定位而非材料质量，可能导致继续使用低质材料，引发品牌声誉危机；建议在切换供应商策略前，对A供应商进行小批量质量抽检验证。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：Merck案例：因果推断将采购决策的平均成功率从72%提升至91%（基于真因果而非相关性决策）；母婴电商场景：识别"折扣效果"的真实因果，避免旺季不必要的促销支出，年化节省毛利损失约¥50-200万
实施难度：⭐⭐⭐⭐☆（需要领域专家协助构建DAG，算法本身可靠；最大挑战是"混杂变量识别"需要业务知识）
优先级评分：⭐⭐⭐⭐⭐（Palantir Ontology成功的"灵魂"——Airbus和Merck案例均强调：不是收集了更多数据，而是从相关性升级到因果性，才实现了决策质量的根本改变）
评估依据：Palantir AIP白皮书："Causal inference is not an advanced feature—it is the minimum requirement for trustworthy decision automation"

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（269 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/data_collection/causal_decision_graph_sc_inference` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Causal-Decision-Graph-SC-Inference.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链因果决策图推理系统
功能：DAG构建 / 后门调整 / 干预效果估计 / 反事实推理 / Palantir Action验证
输入：供应链数据 + 先验因果图结构
输出：因果效应估计 + 反事实分析 + 干预建议
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class CausalEffect:
    """因果效应估计结果——用于Palantir Action的理论依据"""
    treatment: str
    outcome: str
    ate: float                    # Average Treatment Effect
    ate_ci: tuple                 # 置信区间
    confounders_controlled: list  # 已控制的混杂变量
    identification_method: str    # 识别方法
    palantir_action_recommendation: str


class BackdoorAdjustmentEstimator:
    """
    后门调整法估计因果效应
    适用于：有混杂变量但DAG已知的场景
    """
    
    def __init__(self, confounders: list):
        self.confounders = confounders
        self._fitted = False
    
    def fit_estimate(self, data: pd.DataFrame,
                     treatment: str, outcome: str,
                     n_bootstrap: int = 200) -> CausalEffect:
        """
        后门调整估计因果效应
        E[Y | do(X=x)] = Σ_z E[Y|X=x, Z=z] * P(Z=z)
        """
        # 分层估计（对混杂变量进行条件化）
        results = []
        
        for _ in range(n_bootstrap):
            # Bootstrap重采样
            boot_data = data.sample(len(data), replace=True)
            
            ate = self._estimate_ate(boot_data, treatment, outcome)
            results.append(ate)
        
        ate_mean = np.mean(results)
        ate_ci = (np.percentile(results, 2.5), np.percentile(results, 97.5))
        
        self._fitted = True
        
        # 生成Palantir Action建议
        action_rec = self._generate_action_recommendation(
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11234，但该号在 arXiv 上是《Towards medhub: A Self-Service Platform for Analysts and Physicians》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应链与交易数据（如折扣策略、竞品促销、退货率、库存与销量），以及由业务专家给出的先验因果图结构与候选混杂变量清单。

**输出**：干预效应估计（含置信区间）、已控制混杂变量与识别方法说明、反事实分析结果与干预建议，供决策与复核使用；卡页口径 Merck 案例中采购决策成功率从 72% 提升到 91%，母婴场景年化节省毛利损失约 50-200 万元。

## 执行步骤

1. 与业务专家共建因果图，明确干预、结果与混杂变量。
2. 清洗历史交易数据并核对变量口径。
3. 用后门调整估计干预的平均处理效应与置信区间。
4. 做反事实推演，评估不同干预方案的结果。
5. 输出干预建议并保留分析文档与审计轨迹。

## 边界与不做

- 没有领域专家参与、无法确定候选混杂变量时不要用，遗漏混杂会让因果方向判断出错（如把退货率误归因于产品定位）。
- 能力边界：估计结果依赖因果图正确性，上线前建议用小批量试验或 A/B 验证；卡页案例的成功率与节省金额为特定场景口径。
- 合规红线：仅分析自有折扣与供应决策，不得涉及与竞品的价格合谋；供应商相关结论不得构成歧视性排除，须保留完整分析文档与审计轨迹。

## 技能关联

- **前置**：Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Decision-Outcome-Closed-Loop-Learning.html、Skill-Decision-Outcome-Closed-Loop-Learning、Skill-Multi-Objective-Constrained-Action-Planning.html、Skill-Multi-Objective-Constrained-Action-Planning、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-Counterfactual-SC-Scenario-Sim.html、Skill-Counterfactual-SC-Scenario-Sim、Skill-Decision-Outcome-Closed-Loop-Learning.html、Skill-Decision-Outcome-Closed-Loop-Learning、Skill-Multi-Objective-Constrained-Action-Planning.html、Skill-Multi-Objective-Constrained-Action-Planning、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Multi-Objective-Constrained-Action-Planning.html、Skill-Multi-Objective-Constrained-Action-Planning、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Causal-Decision-Graph-SC-Inference

---

> 分类：业务运营/品牌与增长/因果局限审查　·　技术族：24-标签工程　·　源卡：`Skill-Causal-Decision-Graph-SC-Inference`