---
name: "p2s-data-drift-detection"
title: "Skill-Data-Drift-Detection"
description: "触发词：数据漂移、PSI监控、特征分布偏移、性能漂移、重训建议、季节性豁免。何时不用：要监控预测误差层面的模型劣化用「概念漂移检测」；要找时序指标的异常点而非分布偏移用「Agentic时序异常检测」。安全边界：大促等已知季节性窗口须走豁免规则，避免误告警触发无谓重训；漂移告警不得自动触发模型替换或参数变更，须人工确认。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 需求预测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Data-Drift-Detection"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "同时盯输入特征与预测误差两条线，在 MAPE 从 12% 悄悄涨到 28% 之前就告警提醒重训。"
user_try: "试试：给需求预测模型做每日 PSI 监控，标出超阈值特征并区分大促季节性还是真实漂移。"
whenToUse: "当模型输入分布可能随时间偏移、需要在失效前发现并安排重训时用本技能；若要检测的是预测误差分布漂移，用「概念漂移检测」；若要找的是指标上的偶发异常点，用「Agentic时序异常检测」。"
workflow: "每日生成预测特征快照（搜索量、销量、竞品数、价格指数等） → 与训练时保存的基准特征分布计算 PSI 等统计量 → 结合大促日历判定季节性豁免还是真实漂移 → 输出特征级漂移日报与漂移类型判断 → 给出带成本估算的重训建议并跟踪重训后误差回落"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Data-Drift-Detection

## ① 解决的问题

业务问题：baby sterilizer 需求预测模型（TFT）上线 6 个月后，MAPE 从 12% 悄悄涨到 28%，直到库存积压才被发现，损失约 $8,000 滞销成本

## ② 核心算法逻辑

核心思想：生产 ML 模型上线后，输入数据的分布会随时间偏移（用户行为变化、季节性、竞品冲击），导致模型悄然失效。数据漂移检测通过持续监控特征分布（统计漂移）和预测误差（性能漂移）两条并行轨道，在模型失效前触发告警和重训——区别于异常检测，漂移检测关注的是系统性、持续性的分布偏移，而非偶发性异常点。

## ③ 业务应用场景

场景 A：需求预测模型的 feature drift 监控
- 业务问题：baby sterilizer 需求预测模型（TFT）上线 6 个月后，MAPE 从 12% 悄悄涨到 28%，直到库存积压才被发现，损失约 $8,000 滞销成本。根本原因：618 大促后用户搜索行为永久性改变，模型未及时重训。 - 数据要求： - 每日预测特征快照（搜索量/历史销量/竞品数量/价格指数，共 N 列） - 模型训练时的基准特征分布（保存为 JSON 格式参考分布） - 大促日期日历（用于季节性窗口豁免） - 预期产出： - 每特征的 PSI 日报（标注超阈值特征） - 漂移类型判断（季节性豁免 / 真实漂移告警） - 重训建议（附 cost-aware ROI 
场景 B：MAB 广告素材测试的 reward 分布漂移检测

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：12%
ROI 预估：
DriftGuard 实测基准：检测到漂移后及时重训，ROI 达 417×（重训算力成本 vs. 预测误差导致的库存损失）
母婴场景估算：需求预测 MAPE 从 28% 降回 12%，月库存偏差减少 ~16pp × 月销售额 $50,000 = 每月节省约 $8,000 滞销/缺货成本
MAB 场景：素材 CTR 漂移平均提前 4.2 天发现，按日广告预算 $200 估算，避免 4 天无效投放 ≈ $800/次
实施难度：⭐⭐☆☆☆（2/5）— 纯 NumPy/pandas，无需 GPU，可接入现有监控脚本

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（311 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/ml_fundamentals/data_drift_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Data-Drift-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Data-Drift-Detection
基于 arXiv:2601.08928 (DriftGuard, 2026) +
    OpenReview fUsgIfJYZs (Cry Wolf, ICLR 2026 Workshop)
母婴跨境电商 ML 模型生产数据漂移检测工具
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class DriftType(Enum):
    NO_DRIFT     = "无漂移"
    SEASONAL     = "季节性漂移（大促豁免）"
    WARNING      = "轻微漂移（监控）"
    ALERT        = "显著漂移（告警）"
    CRITICAL     = "严重漂移（触发重训）"


@dataclass
class FeatureDriftResult:
    feature_name: str
    psi: float
    drift_type: DriftType
    action: str


@dataclass
class ModelDriftReport:
    model_id: str
    check_date: str
    batch_size: int
    feature_results: list[FeatureDriftResult]
    overall_drift_type: DriftType
    drifted_features: list[str]
    recommendation: str
    retrain_roi_estimate: Optional[str] = None
    adwin_alerts: list[str] = field(default_factory=list)


# ── PSI 计算（批量统计检验）────────────────────────────────
def compute_psi(
    reference: np.ndarray,
    current: np.ndarray,
    n_bins: int = 10,
    min_count: float = 1e-6,
) -> float:
    """
    PSI = Σ (P_actual - P_expected) × ln(P_actual / P_expected)
    基于对称 KL 散度形式，bins 自适应参考分布分位数。
    """
    ref_clean = reference[~np.isnan(reference)]
    cur_clean = current[~np.isnan(current)]
    if len(ref_clean) == 0 or len(cur_clean) == 0:
        return 0.0
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2601.08928。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：每日预测特征快照（搜索量、历史销量、竞品数量、价格指数等 N 列）、模型训练时的基准特征分布（保存为 JSON 参考分布）、大促日期日历（用于季节性窗口豁免）；粒度为特征 × 日。

**输出**：每特征 PSI 日报（标注超阈值特征）、漂移类型判断（季节性豁免 / 真实漂移告警）与附成本估算的重训建议；供算法与供应链团队决定是否重训。

## 执行步骤

1. 生成每日预测特征快照并落库
2. 计算与训练期基准分布的 PSI，标出超阈值特征
3. 用大促日历判定季节性豁免或真实漂移
4. 输出漂移类型与带成本估算的重训建议
5. 跟踪重训后 MAPE 是否从高位回落

## 边界与不做

- 数据不满足：没有保存训练期基准分布或缺少每日特征快照时无法比对，先建立基准分布存档。
- 何时不用：误差流层面的漂移用「概念漂移检测」，偶发指标异常用「Agentic时序异常检测」。
- 能力边界：只判断漂移并给建议，不自动重训模型，也不改动线上预测服务。
- 安全边界：已知季节性窗口须豁免，告警不得自动触发模型替换。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Data-Drift-Detection

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：12-ML基础　·　源卡：`Skill-Data-Drift-Detection`