---
name: "p2s-ab-test-logistics-sla"
title: "物流 SLA A/B 实验因果效应评估 — 承诺变化对复购率的因果识别"
description: "触发词：物流 SLA、复购实验、A/B 实验、配送承诺升级、因果效应。何时不用：要选运输方式与时效方案用「物流方案」，要优化页面转化用「转化优化」；本技能只估计配送承诺变化对复购的因果效应。安全边界：不得对同一商品 listing 展示不同配送承诺，须按用户级分流并符合平台 FBA 政策；实验前须评估差评与排名风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 复购实验"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-AB-Test-Logistics-SLA"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用随机实验判断把配送承诺从 5 天改成 2 天，是不是真的让用户更愿意复购。"
user_try: "试试：我们把标准配送升级成 2 日达，帮我设计一个 A/B 实验，算出它对 90 天复购率的因果效应。"
whenToUse: "有用户级订单与复购数据、能按用户随机分流不同配送承诺时用；要选运输方式与时效用「物流方案」，要优化页面转化用「转化优化」。"
workflow: "确定承诺变化与 90 天复购观察窗口 → 按用户随机分流 SLA 实验组与对照组 → 跑满窗口并采集实际时效与复购数据 → 计算处理效应与 95% 置信区间 → 按 LTV 分层算异质性效应"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 物流 SLA A/B 实验因果效应评估 — 承诺变化对复购率的因果识别

## ① 解决的问题

运营面临"更改物流SLA承诺后不知道是否真正提升复购率"——AB实验因果评估将SLA效果估计误差降低55%，年化优化物流策略节省/增收20-40万元

## ② 核心算法逻辑

核心思想：物流 SLA（服务级别协议）承诺的变化（如"2日达"→"次日达"）会同时影响转化率和复购率，但直接比较不同承诺期间的复购数据存在时间混淆。本 Skill 将标准 A/B 实验框架迁移至物流场景，通过随机分配用户到不同 SLA 承诺组，在控制其他变量的前提下识别纯 SLA 变化的因果效应。

## ③ 业务应用场景

场景1：Amazon 母婴品类 Prime 配送承诺升级实验 - 业务问题：将标准 5-7 日配送升级为 Prime 2 日达，物流成本增加约 15%，是否值得？产品团队无法通过历史数据确定纯配送速度对复购的因果贡献（与季节、促销混杂） - 数据要求：用户级别订单数据（user_id, order_date, delivery_promise, actual_delivery, is_repurchase_90d），实验运行周期 ≥ 8 周覆盖复购窗口 - 预期产出：SLA 升级的 LATE（局部平均处理效应）± 95% 置信区间，以及按 LTV 分层的异质性效应（高价值用户是否更敏感） - 
**三轨验证**： - 成本：A/B 实验工程成本约 2-4 人周（含流量分配系统改造），实验期物流成本差异由实验组承担 - 合规：Amazon 平台 SLA 承诺必须符合 FBA 政策，不得对同一商品 listing 展示不同配送承诺（需用户级而非商品级分组） - 风险：实验期间若对照组用户因配送慢留下差评，可能影响 listing 排名；建议设置差评监控预警

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：年化增量复购收入 15-30 万元（基于 SLA 升级 ATE ≈ +3-5%，品类年销售额 500 万美元估算）
实施难度：⭐⭐⭐⭐☆（需用户级流量分配系统支持，物流实际操作需 FBA 配合）
优先级：⭐⭐⭐⭐☆
评估依据：物流成本是跨境母婴品类第二大成本项，SLA 因果效应量化能直接支撑 Prime 资质申请的 ROI 测算，决策影响级别高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（94 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
物流 SLA A/B 实验评估 — 复购率因果效应估计
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Tuple

np.random.seed(42)

def generate_sla_experiment_data(n_users: int = 5000) -> pd.DataFrame:
    """模拟 SLA 实验数据"""
    user_ids = np.arange(n_users)
    # 随机分配实验组（0=对照，1=处理）
    treatment = np.random.binomial(1, 0.5, n_users)
    # 基准复购率（对照组 30%，处理组因 SLA 升级提升约 4%）
    base_repurchase = 0.30
    treatment_effect = 0.04
    repurchase_prob = base_repurchase + treatment * treatment_effect
    repurchase_prob += np.random.normal(0, 0.02, n_users)  # 个体异质性
    repurchase_prob = np.clip(repurchase_prob, 0, 1)
    repurchase_90d = np.random.binomial(1, repurchase_prob)
    
    return pd.DataFrame({
        "user_id": user_ids,
        "treatment": treatment,
        "delivery_promise_days": np.where(treatment == 1, 2, 5),
        "repurchase_90d": repurchase_90d,
        "ltv_segment": np.random.choice(["high", "mid", "low"], n_users, p=[0.2, 0.5, 0.3])
    })

def compute_ate(df: pd.DataFrame) -> Tuple[float, float, float]:
    """计算平均处理效应 (ATE) 和置信区间"""
    ctrl = df[df["treatment"] == 0]["repurchase_90d"]
    trt = df[df["treatment"] == 1]["repurchase_90d"]
    
    ate = trt.mean() - ctrl.mean()
    t_stat, p_value = stats.ttest_ind(trt, ctrl)
    
    # 95% 置信区间 (Welch's t-test)
    se = np.sqrt(trt.var() / len(trt) + ctrl.var() / len(ctrl))
    ci_lower = ate - 1.96 * se
    ci_upper = ate + 1.96 * se
    
    return ate, (ci_lower, ci_upper), p_value

def compute_heterogeneous_effects(df: pd.DataFrame) -> pd.DataFrame:
    """按 LTV 分层计算异质性效应"""
    results = []
    for segment in ["high", "mid", "low"]:
        seg_df = df[df["ltv_segment"] == segment]
        ate, ci, p = compute_ate(seg_df)
        results.append({
            "ltv_segment": segment,
            "n_users": len(seg_df),
            "ate": round(ate, 4),
            "ci_lower": round(ci[0], 4),
            "ci_upper": round(ci[1], 4),
            "p_value": round(p, 4),
            "significant": p < 0.05
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户级订单数据：user_id、order_date、delivery_promise、actual_delivery、is_repurchase_90d（可含 LTV 分层字段）；实验需运行 ≥8 周以覆盖复购窗口，并要求按用户级而非商品级分流。

**输出**：SLA 升级的处理效应估计（ATE／LATE）与 95% 置信区间、p 值，以及按 LTV 分层（高／中／低）的异质性效应表（含各层样本量、效应值与显著性）；供运营判断是否值得承担物流成本上浮并支撑 Prime 资质申请测算。

## 执行步骤

1. 明确要检验的配送承诺变化（如 5-7 日达 → 2 日达）与复购观察窗口
2. 按用户级随机分流到不同 SLA 承诺组，避免同一 listing 展示不同承诺
3. 跑满覆盖复购窗口的周期（示例 ≥8 周），记录实际配送时效与 90 天复购
4. 计算处理组与对照组的平均处理效应、95% 置信区间与 p 值
5. 按 LTV 分层计算异质性效应，判断高价值用户是否对时效更敏感
6. 汇总实验成本、合规要点与差评风险提示，给出是否放量的判断依据

## 边界与不做

- 数据不满足时不用：没有用户级分流能力、或复购窗口未跑满时无法识别纯 SLA 的因果效应。
- 只估计效应并给出判断依据，不直接改 listing 承诺或调物流配置。
- 卡页 ROI（SLA 效果估计误差降低 55%、年化增量复购收入 15-30 万元、ATE ≈ +3-5%）为估算口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Experiment-Sensitivity-Robustness.html、Skill-Experiment-Sensitivity-Robustness、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design、Skill-Variance-Reduction-Control-Variates.html、Skill-Variance-Reduction-Control-Variates
- **延伸**：Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Experiment-Sensitivity-Robustness.html、Skill-Experiment-Sensitivity-Robustness、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design、Skill-Variance-Reduction-Control-Variates.html、Skill-Variance-Reduction-Control-Variates
- **可组合**：Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Experiment-Sensitivity-Robustness.html、Skill-Experiment-Sensitivity-Robustness、Skill-Variance-Reduction-Control-Variates.html、Skill-Variance-Reduction-Control-Variates、Skill-AB-Test-Logistics-SLA

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：02-A_B实验　·　源卡：`Skill-AB-Test-Logistics-SLA`