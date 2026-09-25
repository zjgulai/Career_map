---
name: "p2s-survival-causal-effect"
title: "Survival Analysis Causal Effect — 生存分析因果效应（竞争风险+Cox+IPW）"
description: "触发词：生存分析因果、删失数据、IPW 加权、发券效应估计、竞争风险。何时不用：只描述复购时间分布、不做因果归因时用基础生存分析；本技能要把用户自身意愿从『发券』效应里剥出来。安全边界：使用内部用户数据须对用户 ID 脱敏，结论仅用于内部效果评估。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Survival-Causal-Effect"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把『发券用户复购更快』里混着的用户自身意愿剥掉，算出券本身到底让复购提前了多少。"
user_try: "试试：用我的发券与复购数据跑 IPW 加权 Cox，估计券对复购间隔的因果效应并按新老客拆分。"
whenToUse: "要判断『促销本身是否有效、效果多大』时用本技能；只想看复购时间分布，用描述性生存曲线即可。"
workflow: "整理注册/首购时间、是否收到优惠券、特征与复购时间（含删失） → 用倾向得分与 IPW 加权构造可比样本 → 拟合 Cox 与竞争风险模型估计加速因子或风险比 → 分新老客拆分效应并做比例风险假设检验"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Survival Analysis Causal Effect — 生存分析因果效应（竞争风险+Cox+IPW）

## ① 解决的问题

运营面临"用户退订/弃购时间节点不清楚促活窗口"——生存分析因果效应将精准触达窗口命中率提升40%，年化复购收入增加20-40万元

## ② 核心算法逻辑

生存分析关注事件发生时间（timetoevent），而非二分类结果。因果版本解决：干预（如促销、优惠券、消息推送）对用户流失时间/复购间隔的因果效应。

## ③ 业务应用场景

场景1：促销对用户「首次复购」时间的因果效应 - 业务问题：发现发优惠券用户的复购率更高，但可能是因为高意图用户更容易收到券；需要估计券本身的因果效应 - 数据要求：用户注册时间、首购时间、是否收到优惠券（T）、用户特征（月龄、客单价）、复购时间或截止观测日（删失），至少 2000 条 - 预期产出：无偏的「发券→缩短复购间隔」因果效应量（加速因子或风险比），分新老客拆分 - 业务价值：准确量化券效益后优化发券时机（首购后 7 天 vs 14 天），年化复购 GMV 提升 8-15%
**三轨验证**： - 成本：lifelines 库 + sklearn，< 10 分钟运行 - 合规：使用内部用户数据，需脱敏处理用户 ID - 风险：比例风险假设在复购行为中可能不满足（不同用户群风险随时间变化），需 Schoenfeld 残差检验

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：准确量化促销对复购时间的因果效应后，优化发券时机年化复购 GMV 提升 8-15%，以 100 万 GMV 规模计约 8-15 万元增量
实施难度：⭐⭐⭐⭐☆（生存分析概念理解有门槛，竞争风险处理需要额外工具）
优先级：⭐⭐⭐☆☆（适合复购周期较长（>30天）的品类，短周期品类优先用转化率建模）
评估依据：母婴品类复购周期通常 15-45 天（纸尿裤、奶粉），生存分析是最自然的建模框架；IPW 加权 Cox 是学术界标准方法，可发表级别的因果效应估计。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（105 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Survival Analysis Causal Effect：IPW加权Cox模型估计促销因果效应
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict

np.random.seed(2024)
n = 2500

# ---- 数据模拟：用户复购生存数据（带混淆）----
baby_age_months = np.random.randint(1, 24, n)
is_prime_member = np.random.binomial(1, 0.35, n)
hist_purchase_count = np.random.poisson(2, n)

# 倾向得分（高意图用户更容易收到券）
log_odds = 0.6 * is_prime_member + 0.3 * (hist_purchase_count > 2).astype(float) - 0.5
e_true = 1 / (1 + np.exp(-log_odds))
T = (np.random.uniform(0, 1, n) < e_true).astype(int)

# 真实复购时间（发券加速复购）
base_time = np.random.exponential(30, n)  # 基线：平均30天复购
treatment_effect = np.where(T == 1, 0.6, 1.0)  # 发券缩短40%复购时间
true_repurchase_time = base_time * treatment_effect
true_repurchase_time += 3 * (1 - is_prime_member)  # 非会员更慢

# 删失（90天观测窗口）
observation_window = 90
event_time = np.minimum(true_repurchase_time, observation_window)
event_observed = (true_repurchase_time <= observation_window).astype(int)

df = pd.DataFrame({
    'T': T,
    'duration': event_time,
    'event': event_observed,
    'baby_age': baby_age_months,
    'is_prime': is_prime_member,
    'hist_count': hist_purchase_count
})
print(f"样本量: {n}, 发券率: {T.mean():.2%}")
print(f"90天内复购率: {event_observed.mean():.2%}")
print(f"中位复购时间（发券）: {df[df.T==1].duration.median():.1f}天")
print(f"中位复购时间（未发券）: {df[df.T==0].duration.median():.1f}天（包含混淆偏差）")

# ---- Step 1: 估计倾向得分（交叉拟合）----
X_feat = df[['baby_age', 'is_prime', 'hist_count']].values
ps_model = LogisticRegression(max_iter=1000)
e_hat = cross_val_predict(ps_model, X_feat, T, cv=5, method='predict_proba')[:, 1]
e_hat = np.clip(e_hat, 0.05, 0.95)

# ---- Step 2: 计算稳定 IPW 权重 ----
# 稳定 IPW（stabilized IPW）= 边际分布 / 条件分布
p_T1 = T.mean()
p_T0 = 1 - p_T1
ipw = np.where(T == 1, p_T1 / e_hat, p_T0 / (1 - e_hat))
# 诊断权重
print(f"\n稳定 IPW 权重统计：均值={ipw.mean():.3f}, max={ipw.max():.2f}, std={ipw.std():.3f}")

# ---- Step 3: 手动实现加权 Log-Rank 检验 ----
# 简化版：分位点比较（近似因果效应）
from scipy import stats
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户级生存数据：注册时间、首购时间、是否收到优惠券（处理变量）、用户特征（月龄、客单价）、复购时间或截止观测日（删失）；样本量至少 2000 条。

**输出**：无偏的因果效应量（复购加速因子或风险比）、分新老客的拆分结果与比例风险假设检验结论；供促销策略与发券时机决策使用。

## 执行步骤

1. 整理生存数据并标注处理变量与删失状态
2. 用倾向得分模型与 IPW 加权平衡处理组与对照组
3. 拟合加权 Cox 与竞争风险模型估计效应量
4. 分新老客拆分效应并检验比例风险假设
5. 输出效应量与发券时机优化建议

## 边界与不做

- 样本量不足、缺少对照组或没有删失标注时不用本技能，因果结论不可靠。
- 本技能产出因果效应估计与策略建议，不执行发券、触达等动作。
- 安全边界：须对用户 ID 脱敏，结论仅用于内部效果评估，不得对外披露可识别个体的数据。

## 技能关联

- **可组合**：Skill-Survival-Causal-Effect

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：01-因果推断　·　源卡：`Skill-Survival-Causal-Effect`