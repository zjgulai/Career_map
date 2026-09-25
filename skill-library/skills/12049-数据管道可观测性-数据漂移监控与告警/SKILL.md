---
name: "p2s-ml-pipeline-observability"
title: "ML 数据管道可观测性 — 数据漂移监控与告警"
description: "触发词：数据漂移、PSI 监控、模型劣化预警、管道健康、特征监控。何时不用：要盯的是数据采集本身的延迟与缺失走数据质量监控告警；要评 RAG 质量走 RAG 评测。安全边界：监控日志不含用户 PII；卡页原文提示阈值过敏感会造成报警疲劳，须按业务校准。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-ML-Pipeline-Observability"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "盯住模型输入分布的漂移，在预测悄悄劣化之前就把告警发出来。"
user_try: "试试：给需求预测模型挂上 PSI 漂移监控，漂了就提前预警并触发重训。"
whenToUse: "模型已上线、输入分布会随季节或平台变化漂移时用；要监控的是数据采集本身的延迟与缺失，请转数据质量监控告警。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ML 数据管道可观测性 — 数据漂移监控与告警

## ① 解决的问题

数据工程师面临"ML模型上线后数据漂移静默导致预测质量悄然劣化"——管道可观测性将数据漂移发现时间从14天缩短至6小时，年化减少模型效果损耗保护20-40万元

## ② 核心算法逻辑

ML 数据管道可观测性（ML Pipeline Observability）解决模型在生产环境中"悄悄变坏"的问题。核心监控三层：

## ③ 业务应用场景

场景1：需求预测模型数据漂移监控 - 业务问题：暖奶器需求预测模型在 12 月圣诞季前后 MAE 从 12% 飙升至 40%，库存决策失误导致断货 - 数据要求：日销量、搜索量、促销标志特征，30 天滑动窗口训练参考分布 - 预期产出：PSI 告警提前 7 天预警分布漂移，触发模型重训练流程 - 业务价值：断货损失从 80 万元/季度降至 20 万元，年化节省 240 万元
场景2：广告 ROAS 预测管道健康监控 - 业务问题：TikTok 广告 ROAS 预测模型每月静默失效一次，运营滞后发现时已损失 5 万元 - 数据要求：点击率、转化率、出价特征 + 实际 ROAS 标签（24 小时延迟） - 预期产出：滚动 7 天预测准确率监控，准确率下降 >15% 自动降级为规则出价 - 业务价值：避免每次静默失效损失，年化节省 60 万元
**三轨验证**：成本（监控系统 2 万/年）/ 合规（监控日志不含用户 PII）/ 风险（误报告警增加运营负担，需调校阈值）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：预测模型静默失效每次损失 5 万元，年均 12 次；监控部署后降至 1 次，年化节省 55 万元；需求预测改善减少断货损失 240 万元/年
实施难度：⭐⭐⭐☆☆（PSI/KS 算法成熟，主要工作是接入各管道的数据采集点）
优先级：⭐⭐⭐⭐⭐（所有 ML 系统的必备基础设施，ROI 极高）
适用规模：任何生产部署了 ML 模型的跨境电商团队

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（258 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
ML Pipeline Observability: 数据漂移监控与告警系统
模拟母婴出海需求预测管道的可观测性实现
"""
import math
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Callable


class AlertLevel(Enum):
    OK = "ok"
    WARNING = "warning"   # PSI 0.1-0.25
    CRITICAL = "critical"  # PSI >0.25


@dataclass
class DriftAlert:
    feature: str
    metric: str          # psi / ks / missing_rate / accuracy
    value: float
    threshold: float
    level: AlertLevel
    message: str
    ts: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PSICalculator:
    """
    Population Stability Index 计算
    PSI = Σ (实际占比 - 期望占比) * ln(实际占比 / 期望占比)
    PSI <0.1: 稳定; 0.1-0.25: 轻微漂移; >0.25: 严重漂移
    """
    def __init__(self, n_bins: int = 10):
        self.n_bins = n_bins

    def _bin_data(self, data: list[float], bins: list[float]) -> list[float]:
        """将数据按 bins 分桶，返回各桶占比"""
        counts = [0] * (len(bins) - 1)
        for val in data:
            for i in range(len(bins) - 1):
                if bins[i] <= val < bins[i + 1]:
                    counts[i] += 1
                    break
            else:
                counts[-1] += 1  # 最后一桶兜底
        total = max(sum(counts), 1)
        return [max(c / total, 1e-6) for c in counts]  # 避免 log(0)

    def fit(self, reference: list[float]) -> list[float]:
        """基于参考数据建立分箱边界"""
        sorted_ref = sorted(reference)
        n = len(sorted_ref)
        self._bins = [sorted_ref[int(i * n / self.n_bins)] for i in range(self.n_bins)]
        self._bins.append(sorted_ref[-1] + 1)
        self._ref_dist = self._bin_data(reference, self._bins)
        return self._ref_dist
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：模型输入特征的历史分布基准（卡页场景为 30 天滑动窗口）与线上实时特征分布，可选的模型效果标签

**输出**：按 PSI 等指标分级的漂移告警与重训、降级触发信号，供 MLOps 与运营及时处置

## 执行步骤

1. 用训练期特征分布建立参考分布与分箱。
2. 按日滚动计算 PSI 等漂移指标，监控各特征健康度。
3. 超过阈值即发告警，并触发重训或切换兜底规则。
4. 调校阈值与冷却期，避免告警疲劳。

## 边界与不做

- 何时不用：要盯的是数据采集延迟与缺失（而非模型输入分布）时，请转数据质量监控告警。
- 能力边界：只负责发现漂移与发出信号，不自动完成重训与上线。
- 安全边界：监控日志不含用户 PII；卡页原文提示阈值过敏感会造成报警疲劳，须按业务校准。

## 技能关联

- **可组合**：Skill-ML-Pipeline-Observability

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-ML-Pipeline-Observability`