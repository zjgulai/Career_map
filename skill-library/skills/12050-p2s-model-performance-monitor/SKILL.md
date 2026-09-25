---
name: "p2s-model-performance-monitor"
title: "Skill-Model-Performance-Monitor"
description: "触发词：模型性能监控、Shadow Mode、Champion/Challenger、AUC衰减告警、切换建议、显著性检验。何时不用：要判断输入特征是否漂移用「数据漂移检测」；要看 Agent 运行链路与 Token 成本用「Agent可观测性追踪」。安全边界：模型切换必须基于统计显著性检验并给出 GO/WAIT/ABORT 建议，不得凭单点指标改善直接切换；退化告警须人工确认后才触发重训或回滚。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 失败恢复 / 异常冻结与恢复"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Model-Performance-Monitor"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "让新模型先静默陪跑几天，用真实标签比出谁更准，再决定切还是等；模型劣化从 7 天发现压到 1 小时。"
user_try: "试试：让新的需求预测模型 Shadow 跑 7 天，和现役模型对比 MAPE 并给出切不切的结论。"
whenToUse: "当要切换模型版本却不敢直接上、或要持续看现有模型输出是否还准时用本技能；若要判断输入分布有没有变，用「数据漂移检测」；若要追每一步执行链路，用「Agent可观测性追踪」。"
workflow: "让新模型以 Shadow 模式静默预测，不接生产流量 → 等待真实标签到达（如 T+7 的实际销量） → 用滑动窗口对比 Champion 与 Challenger 的 AUC/MAPE → 做统计显著性检验并给出 GO / WAIT / ABORT 建议 → 指标退化超阈值时触发告警与重训提示"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Model-Performance-Monitor

## ① 解决的问题

算法负责人面临模型劣化发现太晚——性能监控将故障发现从7天压到1小时，年化省16万元

## ② 核心算法逻辑

核心思想：数据漂移检测（[[SkillDataDriftDetection]]）解决的是"输入变了吗"，模型性能监控解决的是"输出还准吗"。两者共同构成生产 ML 模型的完整健康体系。性能监控通过滑动窗口持续评估 AUC/MAPE 等指标，配合 Shadow Mode（新模型静默跑）和 ChampionChallenger（A/B 对比）两种灰度部署模式，在不影响生产的前提下验证新版本并安全切换。

## ③ 业务应用场景

场景 A：需求预测模型版本升级的 Shadow Mode 验证
- 业务问题：TFT 需求预测模型已运行 8 个月，准备升级到 TimeCMA-LLM 版本，但不确定新版本在当前数据分布下是否真的更好，不敢直接切换。 - 数据要求：当前生产预测结果 + 新模型静默预测结果，配合真实销量标签（T+7 到达） - 预期产出： - 7 天 Shadow 期的 MAPE 对比（Champion vs Challenger） - 统计显著性检验（新版本是否显著优于旧版本） - 切换建议（GO / WAIT / ABORT） - 业务价值：避免贸然切换模型导致预测精度下降，按 baby sterilizer 月销售额 $50,000 估算，预测精度下降 5pp 对应库
场景 B：Churn/Uplift 模型 AUC 衰减告警

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
需求预测 MAPE 从 28% 降回 12%：月库存偏差减少 16pp × $50,000 月销售额 = 节省约 $8,000/月
Uplift 模型 AUC 0.69 → 0.78：优惠券命中率提升约 12%，节省无效优惠券支出 $1,500-$3,000/月
Shadow Mode 安全切换：避免贸然切换新模型导致预测精度下降，节省潜在损失 $2,500/月
合计：$11,500-$13,500/月，年化约 $140,000-$160,000
实施难度：⭐⭐☆☆☆（2/5）— 纯 NumPy/scipy，可作为定时任务插桩到现有服务

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（363 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/ml_fundamentals/model_performance_monitor` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Model-Performance-Monitor.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Model-Performance-Monitor
基于 DriftGuard 框架 (arXiv:2601.08928) + Champion-Challenger / Shadow Mode 方法论
母婴跨境电商 ML 模型生产性能监控工具
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional
from scipy import stats
from enum import Enum


class ModelHealth(Enum):
    HEALTHY   = "健康"
    WARNING   = "警告"
    CRITICAL  = "需要重训"
    DEGRADED  = "性能退化"


class DeployDecision(Enum):
    GO      = "切换新版本"
    WAIT    = "继续观察"
    ABORT   = "放弃新版本"


@dataclass
class PerformanceWindow:
    metric_name: str
    values: list[float]
    baseline: float
    window_days: int

    @property
    def current(self) -> float:
        return float(np.mean(self.values[-7:])) if len(self.values) >= 7 else float(np.mean(self.values))

    @property
    def degradation_pct(self) -> float:
        if self.baseline == 0:
            return 0.0
        return (self.baseline - self.current) / abs(self.baseline) * 100


@dataclass
class ShadowComparisonResult:
    champion_metric: float
    challenger_metric: float
    improvement_pct: float
    p_value: float
    significant: bool
    decision: DeployDecision
    rationale: str


@dataclass
class ModelHealthReport:
    model_id: str
    model_type: str
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2601.08928。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：当前生产模型预测结果、新模型静默预测结果、真实标签（如 T+7 到达的销量）、滑动窗口长度与基线指标；粒度为模型 × 指标 × 时间窗。

**输出**：Champion 与 Challenger 的指标对比、显著性检验结果与切换建议（GO / WAIT / ABORT）、模型健康状态与退化告警；供算法负责人做版本切换决策。

## 执行步骤

1. 静默运行新版本 Shadow 预测，不接管生产流量
2. 收集真实标签后计算滑动窗口内的 AUC、MAPE 等指标
3. 对比 Champion 与 Challenger 表现并做统计显著性检验
4. 输出切换建议（GO / WAIT / ABORT）与理由
5. 对退化超阈值的指标触发健康告警与重训提示

## 边界与不做

- 数据不满足：真实标签延迟到达或样本量不足时，显著性检验不可信，只能给观察结论不能给切换结论。
- 何时不用：输入漂移监控用「数据漂移检测」，Agent 执行链路追踪用「Agent可观测性追踪」。
- 能力边界：产出性能判据与切换建议，不执行流量切换与重训动作本身。
- 安全边界：切换必须经显著性检验并人工确认，禁止凭单点指标改善直接切换。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Cross-Validation-Strategies.html、Skill-Cross-Validation-Strategies、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection
- **延伸**：Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection
- **可组合**：Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Model-Performance-Monitor

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：12-ML基础　·　源卡：`Skill-Model-Performance-Monitor`