---
name: "p2s-clustersc-synthetic-control"
title: "ClusterSC - 聚类合成控制法"
description: "触发词：区域投放增量、聚类合成控制、供体池缩减、地理面板、处理效应估计。何时不用：评估新市场整体准入且控制市场少而清晰用合成控制技能，单店时序增效用反事实时序技能，本技能面向大量地理单元的区域级投放评估。安全边界：区域面板数据须为自有或授权数据并聚合脱敏，结论不得对外披露为精确效果承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 广告实验"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-ClusterSC-Synthetic-Control"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "只在加州投了广告，怎么知道涨的是广告还是黑五？用其他县合成一个对照加州。"
user_try: "试试：只在加州投了 50 万美元广告，用其他县合成反事实，算出真实增量。"
whenToUse: "干预只落在少数地理单元（州、城市）、无法做 A/B、且供体单元数量庞大且差异悬殊时用本技能；评估新市场准入且控制市场少而清晰用合成控制类技能，单店时序增效用反事实时序技能。"
workflow: "整理地理单元面板数据 → 对供体单元聚类缩减 → 在缩减池内拟合合成对照 → 估计处理效应 → 验证干预前拟合质量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ClusterSC - 聚类合成控制法

## ① 解决的问题

业务问题：母婴品牌在黑五期间，仅对美国加州投放 50 万美元 TikTok 联动广告

## ② 核心算法逻辑

合成控制法（Synthetic Control, SC）通过为目标单元"合成"一个反事实来估计因果效应，是评估地区级/城市级无法做 A/B 的大型干预（如区域广告投放、城市政策）的黄金标准。

## ③ 业务应用场景

- 业务问题：母婴品牌在黑五期间，仅对美国加州投放 50 万美元 TikTok 联动广告。加州销量上涨，但无法区分黑五自然增长和广告带来的增量。若直接拿 49 个州合成"伪加州"，因各州差异悬殊极易产生噪声权重。
- 数据要求： - 面板格式：行=地理单元（县级，约 3000 个），列=月度销量（干预前≥12 个月） - 干预标记：`is_treated=1` 对加州，`is_treated=0` 对其余所有县 - 建议特征：月度销量、月度访客数、历史季节性指数
- ClusterSC 落地： 1. K-Means 对 2999 个供体县聚类（K=20），缩减至与加州行为同频的 30-80 个县 2. NNLS 在缩减供体池内拟合合成加州的反事实销量曲线 3. ATT = 干预后加州实际销量 - 合成反事实，即为 TikTok 广告纯增量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

识别无效区域广告后，优化 50 万元投放方向
假设媒介效率提升 20%，年化节省 = 50 万 × 12 个月 × 20% = 120 万元/年（保守）
若指导全年 500 万预算：年化节省 100-500 万元；ROI ≈ 50-250 倍（建模成本约 2 人月）
验证德国本地化改版 300-800% ROI 后，推进法/意复制
增量拓展带来年化 GMV 500-1500 万元，建模成本约 5-10 万元，ROI ≈ 50-150 倍
易：依赖 sklearn + scipy 标准库，无需 econml 等额外安装；代码结构清晰，2 周可上线

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（51 行）。**下面 51 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **51 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，51 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/clustersc_synthetic_control` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-ClusterSC-Synthetic-Control.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ClusterSC 母婴品牌地区级广告增量归因
依赖: numpy, pandas, scipy, scikit-learn
运行: python model.py
"""
from paper2skills_code.causal_inference.synthetic_control_2025.model import (
    ClusterSC, simulate_geo_data
)

# ── 1. 准备面板数据 ────────────────────────────────────────────────────────
# df: 宽表，行=地理单元，列=时间期
# donors: donor 单元 id 列表
# treated: 目标单元 id 列表（支持多目标）
# pre_cols: 干预前时间列名
# post_cols: 干预后时间列名

df, donors, treated, pre_cols, post_cols = simulate_geo_data(
    n_donors=500,       # 模拟 500 个供体县
    n_treated=1,        # 1 个目标单元（加州）
    n_pre=12,           # 12 个干预前时间期（月）
    n_post=3,           # 3 个干预后时间期（黑五前后）
    treatment_effect=20.0,  # 模拟真实效应 20 单位销量
    seed=42,
)

# ── 2. 拟合 ClusterSC ─────────────────────────────────────────────────────
model = ClusterSC(
    n_clusters=15,  # 建议 K = sqrt(n_donors) 附近
    random_state=42,
)
model.fit(df, donors, treated, pre_cols)

# ── 3. 验证干预前拟合质量 ──────────────────────────────────────────────────
pre_fit = model.pre_treatment_fit(df, treated, pre_cols)
print(f"干预前 RMSPE: {pre_fit['rmspe'].iloc[0]:.4f}")
# RMSPE < 5 为佳；若 > 10，考虑增大 n_clusters 或增加干预前期数

# ── 4. 估计处理效应 ATT ────────────────────────────────────────────────────
att_df = model.estimate_att(df, treated, post_cols)
print(att_df[["period", "actual", "counterfactual", "att"]])
print(f"平均月度增量: {att_df['att'].mean():.2f} 件")

# ── 5. 业务解读 ───────────────────────────────────────────────────────────
avg_att = att_df["att"].mean()
unit_price = 200      # 客单价（元）
ad_spend = 500_000    # 广告投入（元）
incremental_gmv = avg_att * 3 * unit_price   # 3 个月增量 GMV
roi = incremental_gmv / ad_spend
print(f"3 个月增量 GMV: {incremental_gmv:,.0f} 元")
print(f"广告 ROI: {roi:.2f}x")
print("[✓] ClusterSC Synthetic Contr 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2503.21629 — ClusterSC: Advancing Synthetic Control with Donor Selection

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：面板格式数据（行=地理单元，卡页口径约 3000 个县级单元；列=月度销量，干预前至少 12 个月）、干预标记（是否投放）与月度访客数、季节性指数等特征。

**输出**：目标单元的反事实销量曲线与真实增量估计、干预前拟合质量验证、投放方向优化建议；卡页口径若指导全年 500 万预算可年化节省 100-500 万元、建模成本约 2 人月。

## 执行步骤

1. 整理地理单元的面板数据，标注干预单元与供体单元。
2. 对供体单元聚类，缩减到与目标行为同频的池子。
3. 在缩减后的供体池内拟合合成对照曲线。
4. 用干预后实际值减合成反事实，得到真实增量。
5. 验证干预前拟合质量，再据此优化投放方向。

## 边界与不做

- 干预前时间期不足（卡页口径至少 12 个月）、或供体单元与目标差异悬殊时不要用，会出现噪声权重。
- 能力边界：结果为区域级增量估计，不能下沉到用户或素材层级；结论用于预算方向优化，不保证媒介效率提升幅度，卡页的节省与回报为测算口径。
- 合规红线：区域面板数据须为自有或授权数据并聚合脱敏，结论不得对外披露为精确效果承诺。

## 技能关联

- **前置**：Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest
- **延伸**：Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect
- **可组合**：Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-MMM-Marketing-Mix-Modeling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ClusterSC-Synthetic-Control

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-ClusterSC-Synthetic-Control`