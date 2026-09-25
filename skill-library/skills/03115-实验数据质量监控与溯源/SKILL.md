---
name: "p2s-experiment-logging-observability"
title: "Experiment Logging & Observability — 实验数据质量监控与溯源"
description: "触发词：SRM检测、流量泄露、实验告警、新奇效应监控、日志溯源。何时不用：只需一次性校验数据质量时用实验数据质量守卫类技能。安全边界：实验日志属内部运营数据，需遵守数据保留策略（卡页示例最长保留2年）。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 运行监测 / 溯源监测"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Experiment-Logging-Observability"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "实验跑起来后持续盯着分流比例和效果曲线，比例一偏或效果只在头几天虚高就马上告警。"
user_try: "试试：主图实验第 3 天处理组流量掉了 18%，帮我搭个 SRM 监控看是不是分流出了问题。"
whenToUse: "当实验需要在上线期间持续监控分流比例、流量泄露与效果衰减，而不是等分析阶段才发现问题时用；只要一次性的数据质量校验（爬虫、分组均衡），用实验数据质量守卫类技能。"
workflow: "采集每日分组曝光与转化日志，并与实验配置的预设比例对照 → 用卡方检验做 SRM 检测并按阈值分级 → 按天计算处理效应（ATE）时间序列 → 检测新奇效应，区分短期虚高与稳定后的真实效果 → 输出告警、暂停实验或修正结论的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Experiment Logging & Observability — 实验数据质量监控与溯源

## ① 解决的问题

AB 实验数据质量问题（SRM）直到结论分析才被发现导致实验作废——引入实验可观测性框架（实时 SRM 检测+流量泄露监控），实验有效率从 70%→95%，每年节约被作废实验的 18% 资源浪费。

## ② 核心算法逻辑

实验可观测性（Experiment Observability） 是实验平台的基础设施层，确保"日志正确 → 分析可信 → 决策有效"的完整链路。核心问题：实验结论的可信度取决于数据记录的准确性，而数据问题往往是隐性的。

## ③ 业务应用场景

场景1：Amazon Listing AB 实验 SRM 检测与告警 - 业务问题：某次主图 AB 实验第 3 天，处理组流量突然降低 18%（从预设 50% 降到 41%），若未检测到则结论完全无效（Amazon 算法突然调整了曝光分配） - 数据要求：每日分组流量日志，实验配置的预设比例 - 预期产出：自动 SRM 检测在 4 小时内告警，暂停实验，避免基于错误数据做决策 - 业务价值：避免一次无效实验的浪费（约 7 天样本量积累时间成本 + 后续错误决策损失约 3 万元）
场景2：TikTok 广告 AB 实验 Novelty Effect 监控 - 业务问题：新广告形式（互动式问答广告）第一周点击率高出 35%，若据此放量会导致后续 ROAS 不达预期 - 数据要求：按天追踪处理效应（每日 ATE 时间序列） - 预期产出：Novelty Effect 检测发现第 1-3 天效果虚高，第 4 天后效果回归真实（+8%），正确评估新广告价值 - 业务价值：避免过早放量导致广告预算浪费约 10 万元
**三轨验证**： - 成本：实验平台工程投入约 2 人周（日志收集 + 监控 Dashboard） - 合规：实验日志属于内部运营数据，需遵守 GDPR 数据保留策略（最长保留 2 年） - 风险：告警阈值过严会导致频繁假警报（运营疲劳），需设置合理告警优先级

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：SRM 早发现平均可节省 3-7 天无效实验成本，每次约 1-3 万元；Novelty Effect 识别防止错误放量，按月均 5 次受影响实验计算节省约 10-20 万元
实施难度：⭐⭐⭐☆☆（工程层需要日志 Pipeline + Dashboard，约 2 人周；统计层相对简单）
优先级：⭐⭐⭐⭐⭐
评估依据：实验可观测性是实验平台的地基，缺少则所有实验结论都是沙上建塔；Amazon 平台流量不受控、广告竞价影响随机分配，SRM 监控是母婴卖家必备的风险防护

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（212 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass, field
from datetime import datetime, timedelta

# ============================================================
# Experiment Logging & Observability: SRM + Quality Checks
# ============================================================

@dataclass
class ExperimentDailyLog:
    date: str
    ctrl_exposures: int
    trt_exposures: int
    ctrl_conversions: int
    trt_conversions: int


@dataclass
class SRMCheckResult:
    """样本比率不匹配检验结果"""
    chi2_stat: float
    p_value: float
    expected_ratio: float
    actual_ratio: float
    deviation_pct: float
    has_srm: bool
    severity: str  # "CRITICAL" / "WARNING" / "OK"


def check_srm(daily_logs: list[ExperimentDailyLog],
               expected_ratio: float = 0.5,
               alpha: float = 0.01) -> SRMCheckResult:
    """
    样本比率不匹配检验（SRM Detection）
    expected_ratio: 处理组预设比例（默认 0.5，即 1:1 分配）
    """
    total_ctrl = sum(d.ctrl_exposures for d in daily_logs)
    total_trt = sum(d.trt_exposures for d in daily_logs)
    total = total_ctrl + total_trt

    expected_trt = total * expected_ratio
    expected_ctrl = total * (1 - expected_ratio)

    chi2 = ((total_trt - expected_trt) ** 2 / expected_trt +
             (total_ctrl - expected_ctrl) ** 2 / expected_ctrl)
    p_val = 1 - stats.chi2.cdf(chi2, df=1)

    actual_ratio = total_trt / total if total > 0 else 0
    deviation = abs(actual_ratio - expected_ratio) / expected_ratio * 100

    if p_val < 0.001 and deviation > 5:
        severity = "CRITICAL"
    elif p_val < alpha:
        severity = "WARNING"
    else:
        severity = "OK"

    return SRMCheckResult(
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每日分组流量日志与实验配置的预设比例（每日曝光与转化数）、按天计算的处理效应时间序列；卡页判据为 p 值 < 0.001 且偏离 > 5% 记为 CRITICAL、p 值 < 显著性水平记为 WARNING。

**输出**：SRM 检测结果与严重度分级、按天 ATE 时间序列与新奇效应判定（卡页示例：第 1-3 天效果虚高、第 4 天后回归真实 +8%），以及告警与暂停实验的建议。

## 执行步骤

1. 采集每日分组曝光与转化日志，并与实验配置的预设比例对照
2. 用卡方检验做 SRM 检测并按阈值分级（偏离 > 5% 且 p<0.001 判为严重）
3. 按天计算处理效应时间序列
4. 检测新奇效应，区分短期虚高与稳定后的真实效果
5. 输出告警、暂停实验或修正结论的建议

## 边界与不做

- 何时不用：只需一次性校验数据质量（爬虫污染、分组均衡）时用实验数据质量守卫类技能；没有日志采集链路时本技能无从发挥，需先补工程。
- 能力边界：只做检测、告警与判据输出，实验的暂停与重启动作由实验平台执行；告警阈值过严会造成频繁误报与运营疲劳，需设定合理的告警优先级。
- 合规边界：实验日志属于内部运营数据，需遵守数据保留策略（卡页示例最长保留 2 年）。
- 卡页数字（实验有效率从 70% 到 95%、节约 18% 资源浪费、节省 3-7 天、每次 1-3 万元、月均 10-20 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Experiment-Logging-Observability

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Experiment-Logging-Observability`