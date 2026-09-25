---
name: "p2s-data-quality-monitor-alert"
title: "Data Quality Monitor Alert — 多维数据质量监控与异常告警（SPC + KL 散度）"
description: "触发词：数据质量告警、SPC 控制图、KL 散度、数据空洞、分布漂移告警。何时不用：要判断模型效果是否劣化、要不要重训走 ML 管道可观测性；要做标签质量 KPI 走标签质量监控。安全边界：数据空洞期间不得按缺失值（如库存为 0）继续决策，卡页原文要求降级只能沿用上次已知数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Data-Quality-Monitor-Alert"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "盯着采集延迟、缺失与分布漂移，数据一出问题就分级告警，别让 Agent 拿错数决策。"
user_try: "试试：配一套数据质量告警，采集超 90 分钟就提醒，超 3 小时自动降级用上次数据。"
whenToUse: "数据链路本身的延迟、缺失、分布异常会直接带偏下游决策时用；要监控的是模型预测效果劣化，请转 ML 管道可观测性。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Data Quality Monitor Alert — 多维数据质量监控与异常告警（SPC + KL 散度）

## ① 解决的问题

数据团队面临"数据质量问题发现总是在报告出错后业务已经受损"——SPC控制图+KL散度将数据异常提前发现时间从事后1天变为事中实时告警，年化避损$9.6万

## ② 核心算法逻辑

数据质量问题是 Skill 决策失效的最主要原因：SPAPI 延迟 2 小时未推数据（延迟告警）、某 ASIN 的销量字段突然全为 0（缺失告警）、广告 ROAS 分布从均值 3.2 突变为 8.5（分布漂移告警）。

## ③ 业务应用场景

- 业务问题：SP-API 有时会出现 2-4 小时数据空洞（Amazon 服务端延迟），若 Agent 在此期间按「库存为 0」决策会触发错误补货 - 数据要求：每批次采集的时间戳 + 期望采集频率配置 - 预期产出：距上次成功采集超 90 分钟 → Level-1 告警；超 3 小时 → Level-2 告警 + 触发降级（使用上次已知数据） - 业务价值：避免因数据空洞导致错误补货 2-3 次/月，每次错误补货成本约 2 万元，年化节省 48-72 万元
- 业务问题：某次 Amazon 广告结算 bug 导致 ROAS 数据虚高（从正常 3.2 → 异常 12.8），运营误以为广告效果爆发，加大预算，实际亏损 - 数据要求：过去 30 天的 ROAS 日度分布（历史基准） - 预期产出：KL 散度 > 0.3 时触发告警，暂停自动出价调整，等待人工确认 - 业务价值：避免基于错误数据做广告扩量决策，防止单次事故损失约 10-20 万元
三轨验证 | 成本轨：月均成本1200元（云监控服务800元/月+人工运维4小时/月×100元/小时），年度投入14400元 | 合规轨：符合《电商法》第十五条数据真实性要求，满足跨境电商商品信息准确度规范（GB/T 35273），通过ISO 8601时间戳审计可追溯 | 风险轨：数据源API变更导致监控失效（概率15%），爬虫被反爬限流（概率8%），数据延迟超过2小时影响库存同步（概率12%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
场景1：防止 SP-API 数据空洞触发错误补货，每次错误成本约 2 万元，每年 4-6 次 → 节省 8-12 万元
场景2：防止广告数据 bug 导致错误扩量，每次损失约 10-20 万元 → 节省 10-20 万元/年
场景3：及时发现缺失数据（如某 ASIN 漏采），避免决策盲区，年化减损约 5 万元
总计年化 ROI：约 23-37 万元
实施难度：⭐⭐☆☆☆（SPC 和 KL 散度算法标准，实现难度低，配置阈值需要业务校准）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（387 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/data_quality_monitor_alert` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Data-Quality-Monitor-Alert.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Data Quality Monitor Alert
多维数据质量监控：延迟检测 + 缺失检测 + SPC 控制图 + KL 散度分布漂移
依赖：标准库（statistics, math, datetime）
"""

import math
import time
import statistics
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Any
from enum import Enum


# ─── 告警等级 ─────────────────────────────────────────────────────────────────

class AlertLevel(Enum):
    OK = "OK"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


@dataclass
class DataQualityAlert:
    metric_name: str
    check_type: str      # latency / missing / distribution_drift / spc_outlier
    level: AlertLevel
    value: float
    threshold: float
    message: str
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# ─── SPC 控制图 ───────────────────────────────────────────────────────────────

class SPCControlChart:
    """
    统计过程控制（3σ 规则）
    - fit(): 用历史数据建立控制限
    - check(): 检测新观测值是否超出控制线
    """

    def __init__(self, name: str, sigma_multiplier: float = 3.0):
        self.name = name
        self.sigma = sigma_multiplier
        self.mean: float | None = None
        self.std: float | None = None
        self.ucl: float | None = None
        self.lcl: float | None = None

    def fit(self, historical: list[float]) -> None:
        if len(historical) < 2:
            raise ValueError("需要至少 2 个历史数据点")
        self.mean = statistics.mean(historical)
        self.std = statistics.stdev(historical)
        self.ucl = self.mean + self.sigma * self.std
        self.lcl = self.mean - self.sigma * self.std
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每批次采集的时间戳与期望采集频率配置，以及关键指标的历史分布基准（如近 30 天 ROAS 日度分布）

**输出**：分级告警（卡页阈值：超 90 分钟 Level-1、超 3 小时 Level-2 并触发降级）与降级记录，供值班运维与 Agent 决策链消费

## 执行步骤

1. 采集各数据批次的时间戳与期望频率，算出延迟与缺失。
2. 用 SPC 控制图建立指标的正常波动区间。
3. 用 KL 散度对比当前分布与历史基准，识别分布漂移。
4. 按阈值分级告警；高等级告警触发降级，改用上次已知数据。

## 边界与不做

- 何时不用：要判断的是模型效果是否劣化、要不要重训，请转 ML 管道可观测性。
- 能力边界：只发出告警与降级信号，不做数据修复，也不替业务决定是否停止决策。
- 安全边界：数据空洞期间不得按缺失值（如库存为 0）继续决策；卡页原文要求降级只能沿用上次已知数据。

## 技能关联

- **前置**：Skill-Advertising-API-Unified-Schema.html、Skill-Advertising-API-Unified-Schema、Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Real-Time-Inventory-Event-Stream.html、Skill-Real-Time-Inventory-Event-Stream
- **延伸**：Skill-Advertising-API-Unified-Schema.html、Skill-Advertising-API-Unified-Schema、Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Real-Time-Inventory-Event-Stream.html、Skill-Real-Time-Inventory-Event-Stream
- **可组合**：Skill-Advertising-API-Unified-Schema.html、Skill-Advertising-API-Unified-Schema、Skill-Agent-Skill-Runtime-Orchestrator.html、Skill-Agent-Skill-Runtime-Orchestrator、Skill-Real-Time-Inventory-Event-Stream.html、Skill-Real-Time-Inventory-Event-Stream、Skill-Data-Quality-Monitor-Alert

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Data-Quality-Monitor-Alert`