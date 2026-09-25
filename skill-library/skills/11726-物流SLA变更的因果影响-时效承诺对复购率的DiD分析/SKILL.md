---
name: "p2s-logistics-sla-causal-impact"
title: "物流SLA变更的因果影响 — 时效承诺对复购率的DiD分析"
description: "触发词：SLA变更、双重差分、复购率、时效升级、平行趋势。何时不用：没有可比对照组、或平行趋势不成立时改用合成控制；本技能用于有时效未变更地区/竞品作对照的面板。安全边界：时效承诺需按平台要求备案，不得虚标配送时效。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 复购实验 / 物流方案"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Logistics-SLA-Causal-Impact"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "用有对照的双重差分算清时效升级到底带来多少复购增量，把物流投入决策从感觉变成带区间的估计。"
user_try: "试试：德国仓时效从 7-10 天升到 3-5 天、推广花了 80 万，帮我算净复购率提升。"
whenToUse: "当物流时效或 Prime 资格等变更已经发生、有未变更的国家或同类未获资格竞品作对照，需要剥离旺季自然增长算净复购效应时用；若平行趋势不成立、也找不到合适对照，结论不可用，应改用合成控制。"
workflow: "汇总用户级订单数据并标注 SLA 变更日期与地区 → 选定时效未变更的国家或未获资格的同类竞品用户作对照组 → 构建变更前 3 期与变更后 3 期的面板数据 → 跑双重差分回归，取交互项系数与 95% 置信区间 → 折算增量复购人数与 GMV，与物流升级成本对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 物流SLA变更的因果影响 — 时效承诺对复购率的DiD分析

## ① 解决的问题

管理层对物流时效升级投入80万元但无法量化净复购率提升——引入 DiD 因果推断剥离季节性与自然增长，净复购率提升准确估计 +4.2%，投入产出决策依据从主观判断升级为严格因果证据，置信区间精度 95%。

## ② 核心算法逻辑

物流 SLA（Service Level Agreement）变更的因果影响分析，采用双重差分法（DifferenceinDifferences, DiD）识别时效承诺变化对用户复购率的净效应，排除同期其他因素干扰。

## ③ 业务应用场景

场景1：欧洲母婴市场快递时效升级效果评估 - 业务问题：将德国仓配送承诺从「7-10 日」升级为「3-5 日」，市场推广费 80 万元，管理层要求量化复购率净提升，排除旺季自然增长 - 数据要求：用户级订单数据（用户 ID、下单日期、是否首单）、SLA 变更日期和地区标记、对照组（时效未变更国家如波兰） - 预期产出：DiD 系数 $\hat{\beta}_3$ 的点估计 + 95% 置信区间，量化时效升级对 90 天复购率的净效应 - 业务价值：若 $\hat{\beta}_3 = +0.05$，意味着每百名用户多 5 人复购，年化 GMV 增量可直接与 SLA 升级成本对比
场景2：FBA Prime 标识获取前后婴儿食品复购分析 - 业务问题：新获 Prime 标识后流量提升明显，但不清楚复购提升是来自 Prime 本身（时效+信任）还是曝光增加 - 数据要求：获得 Prime 前后 6 个月用户购买记录、同类目未获 Prime 竞品用户数据（对照） - 预期产出：Prime 对 60 天复购率的净贡献，为是否维持 Prime 库存资格提供决策依据 - 业务价值：精确归因避免将流量增长误归因于 Prime，正确评估 FBA 费用投入价值
**三轨验证**：成本（SLA 升级物流成本 vs 复购 LTV 增益）/ 合规（时效承诺需平台备案，不可虚标）/ 风险（平行趋势不成立时需用 Synthetic Control 替代）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：每次 SLA 升级投资（物流成本增量）对应可量化的复购 LTV 回报，决策依据从「感觉好」变为「估计值+置信区间」
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：跨境母婴卖家普遍依赖主观判断评估物流升级价值，DiD 方法可将决策科学化；需要充足的对照组和变更前历史数据，数据成熟度要求中等偏高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（74 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
物流 SLA 变更因果影响 — 双重差分（DiD）分析
"""
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

np.random.seed(42)

# ---- 1. 构造面板数据 ----
# 两组用户：treated（德国，SLA 从 8 天→4 天）/ control（波兰，SLA 不变）
n_users = 400
n_periods = 6  # 变更前 3 期 + 变更后 3 期
intervention_period = 3  # period 3 后为 Post

records = []
for uid in range(n_users):
    treated = uid < n_users // 2
    for t in range(n_periods):
        post = int(t >= intervention_period)
        # 复购率基准 + 处理效应（真实 ATT = 0.06）
        base = 0.30 + (0.02 if treated else 0) + t * 0.005
        att = 0.06 if (treated and post) else 0
        repurchase = int(np.random.rand() < base + att + np.random.normal(0, 0.02))
        records.append({
            "user_id": uid,
            "period": t,
            "treated": int(treated),
            "post": post,
            "repurchase": repurchase
        })

df = pd.DataFrame(records)

# ---- 2. DiD 回归 ----
df["treated_x_post"] = df["treated"] * df["post"]
model = smf.ols("repurchase ~ treated + post + treated_x_post", data=df).fit(cov_type="cluster",
                                                                               cov_kwds={"groups": df["user_id"]})
did_coef = model.params["treated_x_post"]
did_ci = model.conf_int().loc["treated_x_post"]

# ---- 3. Event Study（平行趋势可视化数据）----
event_coefs = []
for t in range(n_periods):
    if t == intervention_period - 1:
        event_coefs.append({"period": t, "coef": 0.0, "ci_low": 0.0, "ci_high": 0.0})
        continue
    df_t = df.copy()
    df_t["period_dummy"] = (df_t["period"] == t).astype(int)
    df_t["interact"] = df_t["treated"] * df_t["period_dummy"]
    m = smf.ols("repurchase ~ treated + period_dummy + interact", data=df_t).fit()
    coef = m.params.get("interact", 0)
    ci = m.conf_int().loc["interact"] if "interact" in m.conf_int().index else [0, 0]
    event_coefs.append({"period": t, "coef": coef, "ci_low": ci[0], "ci_high": ci[1]})

event_df = pd.DataFrame(event_coefs)

# ---- 4. 业务量化 ----
# 假设处理组 200 用户，复购客单价 $35
incremental_repurchasers = did_coef * 200
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户级订单数据（用户 ID、下单日期、是否首单）、SLA 变更日期与地区标记、对照组（时效未变更国家，如波兰）；Prime 场景需获得资格前后 6 个月购买记录与同类目未获资格的竞品用户数据；面板粒度示例为 400 用户 × 6 期（变更前 3 期 + 变更后 3 期）。

**输出**：双重差分交互项系数（净效应）的点估计与 95% 置信区间、折算后的增量复购人数与年化 GMV 增量，用于与 SLA 升级成本对比（卡页示例：系数 +0.05 即每百名用户多 5 人复购）。

## 执行步骤

1. 汇总用户级订单数据并标注 SLA 变更日期与地区
2. 选定时效未变更的国家或未获资格的同类竞品用户作为对照组
3. 构建变更前 3 期与变更后 3 期的面板数据
4. 跑双重差分回归，取交互项系数与 95% 置信区间
5. 折算增量复购人数与 GMV，与物流升级成本对比

## 边界与不做

- 何时不用：找不到可比的未变更对照组（国家或竞品用户），或平行趋势假设不成立时不要用，卡页建议改用合成控制替代。
- 能力边界：只估计净效应，不判断物流方案本身优劣；结论依赖变更前历史数据长度与对照组可比性，数据成熟度要求中等偏高。
- 合规边界：时效承诺需按平台要求备案，不得虚标配送时效。
- 卡页数字（80 万元推广费、净复购率 +4.2%、系数 +0.05）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Logistics-SLA-Causal-Impact

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：18-物流履约　·　源卡：`Skill-Logistics-SLA-Causal-Impact`