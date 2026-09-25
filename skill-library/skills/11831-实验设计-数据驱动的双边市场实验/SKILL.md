---
name: "p2s-switchback-experiment-design"
title: "Switchback 实验设计 - 数据驱动的双边市场实验"
description: "触发词：Switchback 实验、时段切换、carryover、HT 估计、仓库算法评估、区间轮换。何时不用：个体可独立随机且互不影响时用标准 A/B；切换成本高、切换周期远长于实验窗口的场景不适合。安全边界：平台政策与 GDPR 下仓库内部日志一般无个人隐私风险，但仍需确认不涉及买家数据外泄，并评估算法对履约时效与平台考核的次生影响。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 仓储协作 / 算法评估设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Switchback-Experiment-Design"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "同一仓、同一渠道没法并行对照时，用时间片轮换的 Switchback 实验比较算法与规则。"
user_try: "试试：帮我设计一个仓库波次合并算法的 Switchback 实验，切换粒度和 carryover 怎么定？"
whenToUse: "同一物理资源或同一渠道无法同时开对照组（强 SUTVA 违反）时用 Switchback；可以对订单或用户独立随机时用标准 A/B；个体级干扰但可分簇时用簇随机化。"
workflow: "确认 SUTVA 违反并确定切换粒度 → 设定区间长度与 carryover 班次数 → 生成带随机边界的切换序列 → 用 HT 估计量计算效应并做方差校正 → 必要时用历史数据补经验贝叶斯设计"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Switchback 实验设计 - 数据驱动的双边市场实验

## ① 解决的问题

同一海外仓为 Shopify/Amazon/TikTok Shop 多渠道发货,测试"AI 波次合并算法"是否降低拣货时长

## ② 核心算法逻辑

在传统 A/B 难以适用的双边市场(物流仓配、动态定价、平台撮合)场景下,Switchback 实验通过对单一聚合单元随时间反复切换处理/控制状态来估计因果效应。本论文给出 MSE 偏差方差四因子分解 与 Empirical Bayes 设计选择框架,自动选最优切换方案。

## ③ 业务应用场景

- 业务问题:同一海外仓为 Shopify/Amazon/TikTok Shop 多渠道发货,测试"AI 波次合并算法"是否降低拣货时长。仓库内强 SUTVA 违反——一批订单占用传送带影响下一批。 - 数据要求:逐订单拣货耗时日志 + 班次时间戳 + 算法启用标记 - Switchback 配置: - 切换粒度:4 小时(单班次) - 处理:开启 AI 合并 vs 现有规则 - Carryover τ:1-2 班次(传送带预热) - 原则应对:按早/中/夜班平衡周期性 + 区间≥2班次 + ±15min 随机边界 - 业务价值:相比传统集群随机实验(不可行,仓库唯一),Switchback 
三轨验证: - 成本: - 数据采集:需接入 WMS 系统拣货日志,开发成本约 2-3 万元(API 对接 + 数据清洗) - 计算资源:单仓每日约 10 万条订单记录,云服务器成本约 500 元/月 - 人力:数据工程师 0.5 人月 + 分析师 0.3 人月,约 4 万元 - 合规: - Amazon/TikTok Shop 平台政策:允许内部运营优化实验,不涉及买家数据外泄 - GDPR:仅处理仓库内部操作日志,不涉及个人隐私数据,无需额外审批 - 无广告法红线 - 风险: - 次生风险:AI 合并算法若导致某渠道订单延迟,可能触发平台履约率考核降级(如 Amazon 的 ODR) - 
- 业务问题:测试"需求感知动态运费"策略(旺季涨价/淡季折扣)对 7 日复购率 × 客单价 = LTV 增量的净影响。买家抢购影响库存可见性,SUTVA 违反。 - 数据要求:用户行为日志 + 订单日志 + 运费策略状态 - Switchback 配置: - 切换粒度:1 天 - Carryover τ:7-14 天(购买习惯形成) - 区间长度:14 天(≥τ_max) - Empirical Bayes:用历史节促 CEC 数据构建先验,自动选最优设计 - 业务价值:动态定价策略验证准确性提升 33%,以中型站月 GMV 1000 万元计,价格优化 GMV 增量 2-5%/年 = 240

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

难处:Empirical Bayes 设计需要历史 CEC 数据(没有就先做粗设计积累)
难处:HT 估计的方差计算需要 Newey-West 校正,工程实现稍复杂
易处:第三方 R 复现代码可参考

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（84 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ab_testing/switchback_experiment_design` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Switchback-Experiment-Design.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Switchback Experiment 最小骨架
论文 arXiv:2406.06768 (Xiong et al., 2024)
第三方 R 复现: https://github.com/QianglinSIMON/SwitchMDP
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np


@dataclass
class SwitchbackConfig:
    n_periods: int = 48
    avg_interval_len: int = 4
    balance_periodicity: bool = True
    randomize_boundaries: bool = True


def generate_switchback_assignment(cfg: SwitchbackConfig, seed: int = 42) -> np.ndarray:
    rng = np.random.default_rng(seed)
    intervals: List[Tuple[int, int, int]] = []
    t = 0
    while t < cfg.n_periods:
        length = max(1, rng.poisson(cfg.avg_interval_len))
        if cfg.randomize_boundaries:
            length += rng.integers(-1, 2)
        treatment = (len(intervals) % 2) if cfg.balance_periodicity else int(rng.integers(2))
        intervals.append((t, min(t + length, cfg.n_periods), treatment))
        t += length

    W = np.zeros(cfg.n_periods, dtype=int)
    for start, end, w in intervals:
        W[start:end] = w
    return W


def ht_estimator(outcomes: np.ndarray, W: np.ndarray, p: float = 0.5) -> Dict[str, float]:
    treated = outcomes[W == 1] / p
    control = outcomes[W == 0] / (1 - p)
    gate_hat = float(treated.mean() - control.mean())
    se = float(np.sqrt(np.var(treated) / max(len(treated), 1) + np.var(control) / max(len(control), 1)))
    return {"GATE": gate_hat, "SE": se, "CI_low": gate_hat - 1.96 * se, "CI_high": gate_hat + 1.96 * se}


def empirical_bayes_design(historical_cecs: np.ndarray, candidate_configs: List[SwitchbackConfig]) -> SwitchbackConfig:
    best_cfg = candidate_configs[0]
    best_mse = float("inf")
    rng = np.random.default_rng(0)
    for cfg in candidate_configs:
        mse_samples = []
        for cec in historical_cecs:
            W = generate_switchback_assignment(cfg, seed=int(rng.integers(0, 100000)))
            Y = rng.standard_normal(cfg.n_periods) + cec * W
            est = ht_estimator(Y, W)
            mse_samples.append((est["GATE"] - cec) ** 2)
        mse = float(np.mean(mse_samples))
        if mse < best_mse:
            best_mse = mse
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.06768 — Data-Driven Switchback Experiments: Theoretical Tradeoffs and Empirical Bayes Designs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：逐订单或逐时段的结果日志，含时间戳、处理标记与区间标识；需要历史切换实验数据用于经验贝叶斯设计，以及班次周期信息用于平衡周期性。

**输出**：Switchback 配置（切换粒度、区间长度、carryover 假设）、随机分配序列、HT 估计与方差校正结果；供数据科学与运营评估仓库算法或平台级策略效果。

## 执行步骤

1. 判断是否只能做时间片轮换并确定切换粒度
2. 设定区间长度与 carryover 班次数
3. 生成带随机边界的切换序列
4. 用 HT 估计量计算效应并做 Newey-West 方差校正
5. 输出配置与效应结论，必要时补经验贝叶斯设计

## 边界与不做

- 何时不用：可以对个体或订单做独立随机且不存在相互影响时，标准 A/B 更省成本，不必用 Switchback。
- 能力边界：本技能产出实验设计与估计量，不负责 WMS 接入与算法上线。
- 风险边界：算法切换可能影响渠道履约时效并触发平台考核（如 ODR），上线前需单独评估该次生风险。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size
- **延伸**：Skill-AB-Test-Result-Interpretation.html、Skill-AB-Test-Result-Interpretation、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-Switchback-Experiment-Design

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Switchback-Experiment-Design`