---
name: "p2s-partial-identification-bounds"
title: "Partial Identification Bounds — 部分识别与 ATE 边界估计（Manski Bounds）"
description: "触发词：部分识别、效果边界区间、无随机实验、效果下界、区间汇报。何时不用：有可用的实验或面板数据、需要点估计用 DML 或合成控制类技能，本技能只在无法做随机实验、只能给区间时使用。安全边界：结论只能表述为区间与下界，不得把边界区间当作点估计汇报或据此承诺收益。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-106"
l3_business: "因果局限审查"
l3_all: "因果局限审查 / 证据复核"
l1_l2_l3: "业务运营/品牌与增长/因果局限审查"
p2s_card_id: "Skill-Partial-Identification-Bounds"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "没有随机实验时，也能给管理层一个可信的效果区间，而不是硬凑一个点估计。"
user_try: "试试：平台不允许做随机实验，用我们的广告曝光日志估计 ATE 的边界区间，给出效果下界是否大于 0。"
whenToUse: "无法做随机实验（平台算法自选择）但需要为效果质疑提供统计保证时用本技能；有实验数据或需要点估计用 DML、合成控制类技能。"
workflow: "准备曝光、转化与协变量数据 → 计算无假设下最宽边界 → 按经业务验证的方向性假设收紧边界 → 输出置信区间 → 汇报效果下界而非点估计"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Partial Identification Bounds — 部分识别与 ATE 边界估计（Manski Bounds）

## ① 解决的问题

合规团队面临"无随机对照数据但需要评估政策效果"——部分识别边界为决策提供可信区间而非点估计，年化降低错误政策落地风险节省50-80万元

## ② 核心算法逻辑

点识别因果效应（point identification）要求强可忽略性假设，但实际中混淆变量往往不可观测，假设不可验证。部分识别（Partial Identification）放弃假设强可忽略性，转而问：在最宽松的假设下，ATE 的可能范围（sharp bound）是多少？

## ③ 业务应用场景

场景1：无法 A/B 测试时的广告效果下界保障 - 业务问题：平台不允许对广告做精确随机实验（算法已自选择），但需要向管理层汇报「广告至少有多少效果」 - 数据要求：广告曝光数据（T：是否曝光；Y：7天转化；X：用户特征），10000+ 条 - 预期产出：ATE 的 95% 置信边界区间（Manski + MTR 假设下的收紧界），给出「效果下界 > 0」的统计保证 - 业务价值：无需 A/B 测试即可向管理层证明广告有正效应，年化节省 A/B 测试机会成本 5-15 万元
**三轨验证**： - 成本：纯 numpy 实现，计算极快 - 合规：无特殊数据要求，使用日常广告日志 - 风险：宽边界可能包含 0（无法得出结论）；假设（MTR、MTS）需要业务验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：无需运行 A/B 实验即可为广告效果提供统计保证，年化节省实验成本 5-15 万元；更重要的是减少「效果存疑」导致的预算砍削风险
实施难度：⭐⭐⭐⭐☆（数学概念相对抽象，但实现简单；难点在于向业务方解释「区间而非点估计」）
优先级：⭐⭐⭐☆☆（适合实验条件不足时的兜底工具，非常规运营场景优先用 DML/IPW）
评估依据：Manski Bounds 是学界公认的最保守稳健识别框架，下界 > 0 是向决策层汇报的最强力统计证据；在监管要求严格的市场（欧盟）尤其有说服力。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（95 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Partial Identification Bounds (Manski Bounds) 在广告效果评估场景
import numpy as np
import pandas as pd
from scipy import stats

np.random.seed(2024)
n = 12000

# ---- 数据模拟：带自选择偏差的广告数据 ----
# 未观测混淆：用户兴趣强度
unobserved_interest = np.random.normal(0, 1, n)
# 高兴趣用户更容易被广告选择（自选择）
e_true = 1 / (1 + np.exp(-0.8 * unobserved_interest))
T = (np.random.uniform(0, 1, n) < e_true).astype(int)

# 真实 ATE（广告真实效果）
true_ate = 0.08

# 潜在结果（受到未观测混淆）
Y1_potential = 0.2 + 0.1 * unobserved_interest + np.random.normal(0, 0.1, n)  # 有广告
Y0_potential = 0.12 + 0.1 * unobserved_interest + np.random.normal(0, 0.1, n)  # 无广告
Y1_potential = np.clip(Y1_potential, 0, 1)
Y0_potential = np.clip(Y0_potential, 0, 1)

# 将概率转换为二值结果
Y1_bin = (np.random.uniform(0, 1, n) < Y1_potential).astype(float)
Y0_bin = (np.random.uniform(0, 1, n) < Y0_potential).astype(float)
Y = T * Y1_bin + (1 - T) * Y0_bin  # 观测结果

p1 = T.mean()    # P(T=1)
p0 = 1 - p1      # P(T=0)
E_Y1_given_T1 = Y[T == 1].mean()  # E[Y|T=1]
E_Y0_given_T0 = Y[T == 0].mean()  # E[Y|T=0]

print(f"样本量: {n}, 广告曝光率: {p1:.2%}")
print(f"E[Y|T=1]={E_Y1_given_T1:.4f}, E[Y|T=0]={E_Y0_given_T0:.4f}")
print(f"Naive ATE（直接差）: {E_Y1_given_T1 - E_Y0_given_T0:.4f}（高估，含选择偏差）")
print(f"真实 ATE: {true_ate:.4f}")

# ---- Manski 无假设最宽边界（Y ∈ [0,1]）----
L_manski = E_Y1_given_T1 * p1 + 0 * p0 - (E_Y0_given_T0 * p0 + 1 * p1)
U_manski = E_Y1_given_T1 * p1 + 1 * p0 - (E_Y0_given_T0 * p0 + 0 * p1)
print(f"\n[Manski 无假设宽边界]")
print(f"  ATE ∈ [{L_manski:.4f}, {U_manski:.4f}]")
print(f"  宽度: {U_manski - L_manski:.4f}")

# ---- 加入 MTR 假设（广告不会降低购买）----
# MTR: Y1 >= Y0 对所有个体，意味着 ATE >= 0
L_mtr = max(L_manski, 0)
U_mtr = U_manski
print(f"\n[MTR 假设（广告只有正效应）]")
print(f"  ATE ∈ [{L_mtr:.4f}, {U_mtr:.4f}]  ← 下界提升到 0")

# ---- 加入 MTS 假设（高意图用户更容易被曝光）----
# MTS: E[Y0|T=1] >= E[Y0|T=0]（被处理者即使不处理也有更高基线）
# 效果：上界收紧（因为 E[Y0|T=0] 低估了真实 E[Y0]）
L_mts = L_manski  # 下界不变
U_mts = E_Y1_given_T1 - E_Y0_given_T0 * p0 - 0 * p1  # 上界收紧（简化）
U_mts = min(U_mts, U_manski)
print(f"\n[MTS 假设（高意图用户更易曝光）]")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：广告曝光数据（是否曝光、7 天转化、用户特征），卡页口径 10000 条以上；无需随机实验，日常广告日志即可。

**输出**：ATE 的 95% 置信边界区间（最宽界与在方向性假设下收紧后的界）与效果下界是否大于 0 的统计结论，供管理层与合规汇报使用；卡页口径年化节省实验机会成本 5-15 万元。

## 执行步骤

1. 准备曝光、转化与用户特征数据，核对选择偏差来源。
2. 计算无额外假设下最宽的 ATE 边界。
3. 按经业务验证的方向性假设收紧边界。
4. 输出置信区间并判定效果下界是否大于 0。
5. 以区间与下界的口径向决策层汇报。

## 边界与不做

- 有可用的随机实验或可靠面板数据时不要用本技能，边界区间的信息量远少于点估计。
- 能力边界：宽边界可能包含 0，此时无法得出结论；假设需要业务验证，难点在于向业务方解释区间而非点估计；卡页的节省金额为估算口径。
- 汇报红线：只能表述为区间与下界，不得把边界区间当作点估计，也不得据此向业务承诺收益。

## 技能关联

- **可组合**：Skill-Partial-Identification-Bounds

---

> 分类：业务运营/品牌与增长/因果局限审查　·　技术族：01-因果推断　·　源卡：`Skill-Partial-Identification-Bounds`