---
name: "p2s-observability-ml-pipelines"
title: "Observability for ML Pipelines — ML 数据管道可观测性"
description: "触发词：管道可观测性、漂移告警、兜底规则、CTR 分布偏移、特征健康。何时不用：要看的只是采集是否按时到位走数据质量监控告警；要做 RAG 或模型离线评测走对应评测技能。安全边界：特征分布监控不涉及 PII；卡页原文提示告警触发的重训练须先做数据授权检查。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Observability-ML-Pipelines"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "给生产管道加一层可观测性，漂移就切兜底规则，别等一周后才发现模型失灵。"
user_try: "试试：给补货预测和广告出价模型加漂移监控，漂了就自动切安全库存兜底。"
whenToUse: "模型已在生产管道里跑、需要把异常发现从事后几天压到次日时用；要看的是采集链路健康度请转数据质量监控告警。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Observability for ML Pipelines — ML 数据管道可观测性

## ① 解决的问题

数据工程师面临"生产ML管道中数据质量异常无告警导致决策失效"——流水线可观测性将异常检测漏报率从40%降至5%，年化减少因数据问题导致的错误决策损失15-30万元

## ② 核心算法逻辑

ML 管道可观测性（ML Pipeline Observability）是对 ML 系统数据层、特征层、预测层的持续监控，核心目标是在模型性能衰退"静默"发生前提前预警。与软件系统可观测性（Logs/Metrics/Traces）类似，但增加了数据漂移（Data Drift）和概念漂移（Concept Drift）两个 ML 专有维度。

## ③ 业务应用场景

场景1：库存补货预测模型漂移监控 - 业务问题：需求预测模型在 Prime Day 前后准确率从 85% 降到 62%，但团队 T+7 天才发现（看到实际库存损失），此时已无法及时补货，直接损失 GMV 20-40 万元。 - 数据要求：模型输入特征（30天）分布历史 + 线上实时特征分布；每日滚动计算 PSI - 预期产出：漂移检测延迟从 T+7 → T+1，触发预警后切换兜底规则（安全库存策略） - 业务价值：每次大促漂移告警提前 6 天，补货响应时间充足，挽回 GMV 损失 15-35 万元/次大促
场景2：广告点击预测模型监控 - 业务问题：CPC 竞价模型依赖历史 CTR 特征，但 Amazon A10 算法更新后 CTR 分布整体偏移，模型低估高曝光词的 CTR，导致出价偏低，曝光量下降 40%。 - 数据要求：每日 ASIN 级 CTR 分布（滑动 7 天平均）vs 训练基准分布 - 预期产出：A10 更新当日 PSI 触发告警（PSI=0.31），自动启动增量重训练 - 业务价值：曝光量恢复 85%+，广告 ROAS 回升 20-30%
**三轨验证**： - 成本：PSI 计算 CPU 密集度低，可用 Airflow DAG 日级运行；开源 EvidentlyAI/WhyLogs 提供完整监控框架 - 合规：特征分布监控不涉及 PII，无合规风险；但告警触发的重训练需要数据授权检查 - 风险：漂移告警过于敏感会造成"报警疲劳"，需合理设置 PSI 阈值和 Cool-down Period

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：模型漂移从 T+7 天发现 → T+1 天发现，每次大促事件挽回 GMV 15-35 万元；广告模型 ROAS 提升 20-30%，年化增量利润 30-60 万元（月广告 30 万场景）
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：几乎所有在线 ML 模型都会随时间漂移，可观测性是 MLOps 的核心基础设施。EvidentlyAI/WhyLogs 等工具已高度成熟，建设成本低，ROI 高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（225 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
ML 管道可观测性演示
数据漂移检测（PSI）+ 特征健康监控 + 告警路由
"""
import math
import random
from datetime import datetime, timedelta
from typing import Any

# ── PSI 计算 ──────────────────────────────────────────────────────────────────
def compute_psi(expected: list[float], actual: list[float],
                n_bins: int = 10, epsilon: float = 1e-8) -> float:
    """
    计算 PSI（Population Stability Index）
    expected: 训练集特征值列表
    actual: 线上实时特征值列表
    """
    if not expected or not actual:
        return 0.0

    # 基于训练集确定分箱边界
    min_val = min(min(expected), min(actual))
    max_val = max(max(expected), max(actual))
    if min_val == max_val:
        return 0.0

    bin_width = (max_val - min_val) / n_bins
    bins = [min_val + i * bin_width for i in range(n_bins + 1)]

    def bin_counts(values: list[float]) -> list[float]:
        counts = [0] * n_bins
        for v in values:
            idx = min(int((v - min_val) / bin_width), n_bins - 1)
            counts[idx] += 1
        total = sum(counts)
        return [c / max(total, 1) for c in counts]

    expected_pct = bin_counts(expected)
    actual_pct = bin_counts(actual)

    psi = 0.0
    for e, a in zip(expected_pct, actual_pct):
        e = max(e, epsilon)
        a = max(a, epsilon)
        psi += (a - e) * math.log(a / e)
    return round(psi, 6)


# ── 特征健康监控 ──────────────────────────────────────────────────────────────
def compute_feature_stats(values: list[float]) -> dict[str, float]:
    """计算特征统计量"""
    if not values:
        return {}
    n = len(values)
    mean = sum(values) / n
    variance = sum((v - mean) ** 2 for v in values) / n
    sorted_vals = sorted(values)
    null_rate = sum(1 for v in values if v is None) / n
    return {
        "mean": round(mean, 4),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：模型输入特征的历史分布与线上实时分布（如每日 ASIN 级 CTR、库存相关特征），以及兜底规则定义

**输出**：含 PSI 等指标值的漂移告警与兜底、重训触发记录，供运营在损失发生前切换策略

## 执行步骤

1. 定义各特征的健康区间与漂移指标阈值（如 PSI）。
2. 按日滚动比对线上分布与训练基准分布。
3. 越界即告警，并切换到预设兜底规则（如安全库存策略、规则出价）。
4. 记录告警与处置结果，周期复盘阈值是否合适。

## 边界与不做

- 何时不用：要看的只是数据采集是否按时到位（而非模型输入分布）时，请转数据质量监控告警。
- 能力边界：只负责发现与切换兜底，不自动完成模型重训与上线。
- 安全边界：特征分布监控不涉及 PII；卡页原文提示告警触发的重训练须先做数据授权检查。

## 技能关联

- **可组合**：Skill-Observability-ML-Pipelines

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Observability-ML-Pipelines`