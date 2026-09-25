---
name: "p2s-counterfactual-evaluation"
title: "反事实评估 — Potential Outcomes + 合成控制反事实基线"
description: "触发词：反事实评估、合成控制、促销增量、虚拟基线、净效果拆解。何时不用：干预尚未执行、还能随机分组时用实验设计类技能；单纯要测广告地区增量用Geo Holdout。安全边界：只做事后分析、不参与定价或价格干预，使用聚合销量数据、不引入个人身份信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Counterfactual-Evaluation"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "用没受影响的同类商品合成一条虚拟基线，算出这次促销或改版真正带来多少净增量，不再被表面涨幅骗了。"
user_try: "试试：吸奶器 8 折活动当周销量涨了 40%，帮我用合成控制法算出真实促销拉动和促销 ROI。"
whenToUse: "当一次促销、改版或价格调整已经发生，只有前后销量与同类对照、无法补做随机实验，需要拆出净增量时用；若干预尚未执行且能随机分组，用实验设计类技能；若专门测广告投放的地区增量，用「Geo Holdout 实验」。"
workflow: "取目标 SKU 干预前后日销量与 5-10 个未受干预的同类对照销量 → 求解非负且和为 1 的合成控制权重 → 用对照组加权合成干预期反事实基线 → 对比实际值与基线得到净增量与百分比 → 用净增量乘以利润、除以促销折扣成本算出促销 ROI"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 反事实评估 — Potential Outcomes + 合成控制反事实基线

## ① 解决的问题

数据科学家面临"无法量化如果不做这个促销销量会如何基线难以确定"——合成控制反事实框架将促销净增量归因准确率从±30%提升至±8%，ROI决策置信度大幅提升

## ② 核心算法逻辑

核心思想：反事实评估回答「如果没有做这件事，结果会怎样？」。通过合成控制法（Synthetic Control），用未受干预的对照组数据合成一条「虚拟基线」，与实际观测值对比，量化干预效果（促销/产品改版/价格调整）的真实因果贡献。

## ③ 业务应用场景

- 业务问题：运营做了一次「吸奶器 8 折活动」，当周销量上涨 40%，但不确定这 40% 里有多少是真正的促销拉动，有多少是自然增长（竞品缺货/平台流量增加） - 数据要求：目标 ASIN 过去 90 天的日销量数据（含促销期）+ 5-10 个同类对照 ASIN 的同期销量（作为合成控制的参考组） - 预期产出：合成控制基线显示「如不做促销，当周销量约 1200 单」；实际 1680 单；因果效应 = +480 单（真实促销拉动 28.6%，而非表面的 40%）；促销 ROI = 净增销量 × 利润 / 促销折扣成本 = 380% - 业务价值：精确的 ROI 数字指导下次促销力度决策，避免
三轨验证： - 成本：数据采集成本低（使用已有销量报表），计算资源几乎为零（单次运行 < 1 秒），人力投入约 2 小时/次（数据清洗+结果解读） - 合规：不触碰 Amazon 价格操纵红线（仅做事后分析，不涉及定价干预），不违反 GDPR（使用聚合销量数据，无个人身份信息） - 风险：若对照组选择不当（如包含受促销影响的 ASIN），可能低估或高估效果，导致错误决策；建议每次验证对照组独立性
- 业务问题：V3 版吸奶器换了新马达，工厂称「性能提升 30%」，但运营不知道上线后销量提升是马达升级导致的，还是同期的广告加投 - 数据要求：改版前后 30 天销量 + 同品类未改版 SKU 作对照 + 广告消耗数据 - 预期产出：控制广告因素后，反事实分析显示改版对销量的纯因果贡献为 +12%（而非表面的 +25%），另外 13% 来自广告加投 - 业务价值：精确拆解产品因素 vs 营销因素，指导研发预算分配，避免把营销拉动的增长误归因于产品改进，年化减少研发/营销资源错配损失约 8 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：促销 ROI 精确评估 → 优化折扣策略节省约 15 万元/年；产品改版归因 → 研发资源合理分配节省约 8 万元/年。总年化约 23 万元
实施难度：⭐⭐⭐☆☆（需要 scipy 优化库；对照组选择是关键，需领域知识；干预前期数据质量要求高）
优先级：⭐⭐⭐⭐⭐（所有做过促销/改版/定价调整的团队都需要，高频使用场景，无冷启动；是因果推断域的核心基础 Skill）
评估依据：合成控制法是 Google/Amazon 等大厂因果效应评估的标准工具；scikit-learn + scipy 即可实现，无额外依赖

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/counterfactual_evaluation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Counterfactual-Evaluation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
反事实评估 — 合成控制法
用未受干预的对照组合成虚拟基线，评估干预的因果效应
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from scipy.optimize import minimize


def synthetic_control_weights(
    treated_pre: np.ndarray,
    controls_pre: np.ndarray
) -> np.ndarray:
    """
    求合成控制权重
    treated_pre: 处理组干预前时间序列 (T_pre,)
    controls_pre: 对照组干预前时间序列 (T_pre, n_controls)
    返回：权重向量 (n_controls,)，满足 sum=1, all>=0
    """
    n_controls = controls_pre.shape[1]

    def objective(w):
        synthetic = controls_pre @ w
        return np.sum((treated_pre - synthetic) ** 2)

    constraints = [
        {"type": "eq", "fun": lambda w: np.sum(w) - 1.0},
    ]
    bounds = [(0.0, 1.0)] * n_controls
    w0 = np.ones(n_controls) / n_controls

    result = minimize(
        objective, w0,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000, "ftol": 1e-9}
    )
    return result.x


def estimate_causal_effect(
    treated: np.ndarray,
    controls: np.ndarray,
    pre_period_end: int
) -> Dict:
    """
    反事实评估核心函数
    treated: 处理组完整时间序列 (T,)
    controls: 对照组完整时间序列 (T, n_controls)
    pre_period_end: 干预前时期结束的时间步（不含）
    """
    treated_pre = treated[:pre_period_end]
    treated_post = treated[pre_period_end:]
    controls_pre = controls[:pre_period_end]
    controls_post = controls[pre_period_end:]

    # 求权重
    weights = synthetic_control_weights(treated_pre, controls_pre)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1506.00356 — Inferring causal impact using Bayesian structural time-series models

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：目标 ASIN 过去 90 天的日销量数据（含促销期）+ 5-10 个同类对照 ASIN 的同期销量；产品改版场景另需改版前后 30 天销量、同品类未改版 SKU 作对照，以及广告消耗数据用于剥离营销因素。

**输出**：合成的反事实基线销量、因果效应（净增单量与百分比）、促销 ROI 或产品因素与营销因素的拆解，供折扣力度、研发与营销预算分配决策使用（卡页示例：不做促销当周约 1200 单、实际 1680 单、净增 28.6%）。

## 执行步骤

1. 取目标 SKU 干预前后的日销量与 5-10 个未受干预的同类对照销量
2. 求解非负、和为 1 的合成控制权重
3. 用对照组加权合成干预期的反事实基线
4. 对比实际值与基线得到净增单量与百分比
5. 用净增量乘利润除以折扣成本算出促销 ROI，或拆解产品与营销贡献

## 边界与不做

- 何时不用：对照 ASIN 自身也受促销或平台活动影响、干预前历史长度不足时不要用；能在干预前随机分组就用实验设计类技能。
- 能力边界：结论取决于对照组独立性，结构性断点（如竞品长期缺货）无法靠权重外推覆盖；本技能只做评估，不替代定价或促销决策。
- 安全边界：仅做事后分析，不涉及价格操纵或定价干预；使用聚合销量数据，不使用个人身份信息。

## 技能关联

- **前置**：Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Causal-Supply-Chain-Attribution.html、Skill-Causal-Supply-Chain-Attribution、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting
- **延伸**：Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Causal-Supply-Chain-Attribution.html、Skill-Causal-Supply-Chain-Attribution、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting
- **可组合**：Skill-Causal-Supply-Chain-Attribution.html、Skill-Causal-Supply-Chain-Attribution、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Counterfactual-Evaluation

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Counterfactual-Evaluation`