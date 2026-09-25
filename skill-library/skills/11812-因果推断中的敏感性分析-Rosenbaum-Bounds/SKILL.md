---
name: "p2s-sensitivity-analysis-causal"
title: "Sensitivity Analysis Causal — 因果推断中的敏感性分析（Rosenbaum Bounds）"
description: "触发词：敏感性分析、未观测混淆、混淆临界强度、匹配稳健性、结论可信度。何时不用：需要在不做随机实验时给出效果区间下界用部分识别技能，面向会员或达人投放的稳健性解读与汇报用 Rosenbaum 敏感性分析技能，本技能是匹配结论的通用鲁棒性验证步骤。安全边界：不得只报点估计而隐去稳健性结论，未通过检验的结论不得当作既定事实使用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-106"
l3_business: "因果局限审查"
l3_all: "因果局限审查 / 证据复核"
l1_l2_l3: "业务运营/品牌与增长/因果局限审查"
p2s_card_id: "Skill-Sensitivity-Analysis-Causal"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "回答一个问题：要多强的隐藏因素才能推翻这个因果结论。"
user_try: "试试：验证赠品对复购的提升结论，算出混淆强度的临界值，告诉我结论稳不稳。"
whenToUse: "用 PSM 或匹配法得出因果结论后、需要验证它对未观测混淆是否稳健时用本技能；需要在不做随机实验时给出效果区间下界用部分识别技能，面向会员或达人投放的阈值解读用 Rosenbaum 敏感性分析技能。"
workflow: "完成倾向得分匹配并检查平衡性 → 跑基准显著性检验 → 计算混淆强度临界值 → 对照阈值判定稳健性 → 在汇报中附上稳健性结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sensitivity Analysis Causal — 因果推断中的敏感性分析（Rosenbaum Bounds）

## ① 解决的问题

数据科学家面临"因果推断结论是否对未观测混淆变量敏感无法判断"——Rosenbaum敏感性分析将结论可信度从"假设无混淆"提升为带有敏感性边界的稳健证明，年化降低错误决策风险节省30-50万元

## ② 核心算法逻辑

因果推断的核心威胁是未测量混淆（hidden confounders）：即使控制了所有可观测变量，仍可能有遗漏变量同时影响处理分配和结果。Rosenbaum 敏感性分析（Rosenbaum 2002）提供了一种量化工具，回答：「需要多强的未测量混淆才能推翻我的因果结论？」

## ③ 业务应用场景

场景1：验证「免费赠品」促进复购效应的鲁棒性 - 业务问题：PSM 分析发现「包裹内附送小样品」使复购率提升 12%，但担心这只是「有钱花大额订单的用户」的选择效应 - 数据要求：发送赠品的订单记录（T：是否附赠品；Y：60天复购；X：客单价、月龄、历史订单数），5000+ 条 - 预期产出：Γ 临界值，若 Γ* > 1.5 则结论可信度高，可向管理层汇报「赠品策略有因果效果」 - 业务价值：避免虚假因果导致的错误策略扩张（赠品成本约每单 5-10 元），年化决策正确性价值 20-50 万元
**三轨验证**： - 成本：匹配 + 统计检验，< 5 分钟 - 合规：使用内部订单数据，无风险 - 风险：Rosenbaum 分析基于匹配，匹配质量影响分析结论；需先验证匹配平衡性（标准化均值差）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免因假因果导致的策略扩张失误（如错误扩大赠品计划），每次决策验证价值 10-50 万元；作为汇报工具可显著提升分析可信度
实施难度：⭐⭐⭐☆☆（PSM + Wilcoxon 检验基础上的简单扩展，代码量少，但需要向业务方解释 Γ 的含义）
优先级：⭐⭐⭐⭐☆（作为所有 PSM/匹配分析的标配验证步骤，应该常态化）
评估依据：学术界已将 Rosenbaum 分析列为匹配研究的标准报告规范（APA 指南）；在向管理层汇报因果结论时，提供 Γ* 值可显著提升决策置信度。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（112 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Sensitivity Analysis (Rosenbaum Bounds) 在赠品促复购场景
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors

np.random.seed(2024)
n = 6000

# ---- 数据模拟：带隐混淆的赠品效应 ----
# 可观测特征
order_value = np.random.lognormal(4.5, 0.8, n)   # 客单价
baby_age = np.random.randint(1, 24, n)
hist_orders = np.random.poisson(2, n)

# 未观测混淆（客户忠诚度）
loyalty = np.random.normal(0, 1, n)

# 处理分配（高忠诚度用户更容易获得赠品）
log_odds = (0.3 * (order_value > 200).astype(float)
            + 0.2 * (hist_orders > 2).astype(float)
            + 0.4 * loyalty  # 未观测混淆！
            - 0.5)
e_true = 1 / (1 + np.exp(-log_odds))
T = (np.random.uniform(0, 1, n) < e_true).astype(int)

# 真实效应
tau_true = 0.10
Y0 = (np.random.uniform(0, 1, n) < 0.15 + 0.05 * loyalty + 0.02 * (hist_orders > 2)).astype(int)
Y1 = (np.random.uniform(0, 1, n) < 0.15 + tau_true + 0.05 * loyalty + 0.02 * (hist_orders > 2)).astype(int)
Y = T * Y1 + (1 - T) * Y0

X = np.column_stack([order_value, baby_age, hist_orders])
print(f"样本量: {n}, 赠品率: {T.mean():.2%}, 复购率: {Y.mean():.2%}")
print(f"Naive 差值: {Y[T==1].mean()-Y[T==0].mean():.4f}（含混淆偏差）")

# ---- Step 1: 倾向得分匹配（1:1 最近邻）----
ps_model = LogisticRegression(max_iter=1000)
ps_model.fit(X, T)
ps = ps_model.predict_proba(X)[:, 1]

# 在处理组中为每个个体找最近邻对照
treated_idx = np.where(T == 1)[0]
control_idx = np.where(T == 0)[0]

nn = NearestNeighbors(n_neighbors=1)
nn.fit(ps[control_idx].reshape(-1, 1))
distances, matched_ctrl = nn.kneighbors(ps[treated_idx].reshape(-1, 1))
matched_ctrl_idx = control_idx[matched_ctrl.flatten()]

# 匹配后的差值
Y_treated_matched = Y[treated_idx]
Y_control_matched = Y[matched_ctrl_idx]
diff = Y_treated_matched - Y_control_matched

ate_matched = diff.mean()
print(f"\nPSM 匹配后 ATE: {ate_matched:.4f}（真实: {tau_true:.4f}）")

# ---- Step 2: Wilcoxon 符号秩检验（基准）----
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：匹配后的处理组与对照组样本（卡页案例为 5000 条以上订单记录），字段含处理标记（如是否附赠品）、结果变量（如 60 天复购）与协变量（客单价、月龄、历史订单数）。

**输出**：推翻结论所需的未观测混淆强度临界值与稳健性判定（卡页口径临界值大于 1.5 视为可信度高）、是否需补充随机实验的建议，供管理层决策与策略扩张把关；卡页口径年化决策正确性价值 20-50 万元。

## 执行步骤

1. 完成倾向得分匹配并检查匹配平衡性。
2. 在无混淆假设下跑基准显著性检验。
3. 计算推翻结论所需的未观测混淆强度临界值。
4. 对照阈值判定结论是否足够稳健。
5. 把稳健性结论与后续建议写进汇报材料。

## 边界与不做

- 匹配质量差（协变量标准化均值差过大）时不要用，敏感性分析的前提不成立。
- 能力边界：临界值只是充分条件，数值大也不能证明不存在混淆，需结合业务知识解释，必要时补充随机实验。
- 汇报红线：不得只报点估计而隐去稳健性结论，也不得把未通过检验的结论当作既定事实对外使用。

## 技能关联

- **可组合**：Skill-Sensitivity-Analysis-Causal

---

> 分类：业务运营/品牌与增长/因果局限审查　·　技术族：01-因果推断　·　源卡：`Skill-Sensitivity-Analysis-Causal`