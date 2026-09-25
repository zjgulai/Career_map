---
name: "p2s-streaming-analytics-agent"
title: "实时流式分析Agent — 毫秒级事件驱动的AI决策管道"
description: "触发词：实时流式分析、事件驱动决策、大促库存告警、销速异常、竞品降价响应、滑动窗口统计。何时不用：只做离线按天跑批的分布检查用「数据漂移检测」；只做指标异常点检测用「时序异常检测」。安全边界：自动触发的补货动作必须有人工审批 gate（卡页口径：金额超 5 万元必须人工确认）并具备回滚机制；分析只使用聚合订单数据，不得处理用户级 PII；告警须设最小持续时间阈值以抑制单点噪声误报。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Streaming-Analytics-Agent"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "大促开跑 28 分钟就发现推车销速是预测的 3.2 倍，提前 150 分钟预警断货，抢出紧急空运窗口。"
user_try: "试试：大促期间实时监控推车 SKU 的销速和库存，异常就告警并触发紧急补货工作流。"
whenToUse: "当业务要求秒级到分钟级的实时响应（大促库存、竞品降价）、T+1 批处理来不及止损时用本技能；若只是离线检查特征分布漂移，用「数据漂移检测」；若只是识别时序异常点，用「时序异常检测」。"
workflow: "接入实时订单事件流与当前库存快照 → 用滑动窗口聚合计算实时销速并与历史基准比对 → 按倍率与持续时间生成分级告警 → 触发紧急补货或其他响应工作流 → 超过金额阈值时转人工审批，并保留回滚机制"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 实时流式分析Agent — 毫秒级事件驱动的AI决策管道

## ① 解决的问题

电商团队面临"大促广告消耗异常要等T+1才发现每次损失数万元"——ADWIN流式检测+LLM实时分析在2分钟内告警，年化大促保护GMV约137万元

## ② 核心算法逻辑

传统BI分析是批处理的（T+1日报）：昨天的数据今天才能看到。电商实时场景需要毫秒→秒级的分析响应：

## ③ 业务应用场景

场景A：618大促实时库存监控Agent - 业务问题：618大促开始后，某款婴儿推车SKU在前30分钟内销量超预期3倍，按当前速度2小时后断货。T+1报告无法及时预警，人工监控无法覆盖所有SKU - 数据要求：实时订单事件流（每笔订单到达即触发）、当前库存快照、历史销速基准 - 预期产出：大促开始后28分钟，Agent检测到销速异常（实际销速是预测3.2倍），自动生成告警 + 触发紧急补货工作流；提前150分钟预判断货，争取到紧急空运窗口 - 业务价值：避免断货损失约30万元（2小时断货×每小时15万GMV）；实时响应比T+1报告早约20小时，年化大促场景避免断货损失约100万元
三轨对抗验证： 1. 成本验证：每5秒LLM分析一次，大促期间（12小时）约8640次调用，DeepSeek成本约17元；非大促期可降频到每5分钟一次，月均成本<50元 2. 合规验证：流式分析使用的是聚合订单数据（非用户级PII），无GDPR风险；自动补货触发需要人工审批gate（金额>5万元必须人工确认） 3. 风险验证：LLM实时推理可能误报（将正常促销峰值判为异常）；需要设置"最小持续时间"阈值（异常持续>3分钟才告警，避免单点噪声）；自动触发的动作需要有回滚机制
场景B：竞品价格实时响应Agent - 业务问题：竞品在黄金时段突然降价20%，如果不在2小时内响应，当天会损失约30%搜索流量 - 数据要求：竞品价格爬取事件流（每15分钟）+ 自家定价规则 + 利润底线配置 - 预期产出：Agent检测到竞品降价后，评估响应策略（降价跟随 vs 强调差异化 vs 加大广告投入），推荐最优方案并等待人工1次点击确认 - 业务价值：响应速度从T+1决策（次日）提升到T+2小时，当天搜索流量损失从30%降至8%，年化保护GMV约200万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：大促期间实时预警断货，避免2小时断货损失约30万元/次；年化大促（6个）约100万元；竞品降价实时响应，保护搜索流量，年化GMV约200万元；LLM流式推理成本每月<100元
实施难度：⭐⭐⭐⭐☆（架构复杂：需要事件流基础设施+LLM实时调用+状态管理；大促前至少提前2个月部署）
优先级：⭐⭐⭐⭐☆（大促是母婴电商最高风险时段，实时监控是必备能力）
评估依据：NeurIPS 2024 StreamBench证明LLM Agent在流式数据上的持续学习能力；阿里巴巴/京东大促期间均部署实时库存监控系统；AWS Kinesis + Lambda架构可零代码实现事件流接入

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Streaming-Analytics-Agent
实时流式分析Agent — 大促库存监控与告警

依赖：pip install numpy pandas
注意：生产环境需接入 Kafka/Kinesis 和 LLM API
"""

import numpy as np
import pandas as pd
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Optional

np.random.seed(42)

# ── 1. 事件数据结构 ────────────────────────────────────────────────
@dataclass
class OrderEvent:
    timestamp: float
    sku_id: str
    quantity: int
    price: float

@dataclass
class InventorySnapshot:
    sku_id: str
    current_stock: int
    safety_stock: int
    baseline_hourly_rate: float  # 正常销速（件/小时）

@dataclass
class Alert:
    alert_type: str
    severity: str        # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    sku_id: str
    message: str
    recommended_action: str
    timestamp: float

# ── 2. 滑动窗口统计引擎 ────────────────────────────────────────────
class SlidingWindowAggregator:
    """实时滑动窗口统计（替代Kafka Streams/Flink）"""

    def __init__(self, window_minutes: int = 30):
        self.window_seconds = window_minutes * 60
        self.events: deque = deque()

    def add_event(self, event: OrderEvent):
        now = time.time()
        self.events.append(event)
        # 清除窗口外的旧事件
        while self.events and (now - self.events[0].timestamp) > self.window_seconds:
            self.events.popleft()

    def get_stats(self, sku_id: str) -> dict:
        """计算指定SKU在窗口内的统计"""
        sku_events = [e for e in self.events if e.sku_id == sku_id]
        if not sku_events:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2305.16291 — Voyager: An Open-Ended Embodied Agent with Large Language Models
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：实时订单事件流（每笔订单到达即触发）、当前库存快照与安全库存、历史销速基准；竞品响应场景另需竞品价格爬取事件流（约每 15 分钟）、自家定价规则与利润底线配置。

**输出**：分级告警（含 SKU、实时销速倍率、预计断货时间与推荐动作）与工作流触发记录；供运营与大促保障团队在事件发生当刻决策。

## 执行步骤

1. 接入实时订单事件流、库存快照与历史销速基准
2. 用滑动窗口聚合实时销速并检测异常倍率
3. 按严重度分级生成告警，并设最小持续时间阈值抑制噪声
4. 触发紧急补货或定价响应工作流
5. 对超阈值金额转人工审批，执行后保留回滚路径

## 边界与不做

- 数据不满足：没有实时事件流或库存快照、只有 T+1 报表时，本技能退化为批处理，实时预警价值不成立。
- 何时不用：离线分布漂移检查用「数据漂移检测」，指标异常点识别用「时序异常检测」。
- 能力边界：只做实时检测、告警与工作流触发，不替代库存与定价的业务判断，也不保证零误报。
- 安全边界：自动动作须有人工审批 gate 与回滚机制，只使用聚合订单数据、不处理用户级 PII。

## 技能关联

- **前置**：Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Streaming-Analytics-Agent

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Streaming-Analytics-Agent`