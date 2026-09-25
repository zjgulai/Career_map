---
name: "p2s-streaming-etl-flink-kafka"
title: "Streaming ETL with Flink/Kafka — 实时流式 ETL 工程化"
description: "触发词：流式 ETL、实时数仓、Flink、Kafka、实时看板、双流 Join。何时不用：T+1 报表已够用、或问题只是这批数据对不对时走数据质量监控告警；不做实时链路就别上流式。安全边界：消费者行为数据经 Kafka 中转必须做 topic 加密与 ACL 权限控制（GDPR Art.32），卡页原文要求，不可省略。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Streaming-ETL-Flink-Kafka"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把订单、库存、直播流接成实时管道，分钟级看到 GMV 与转化，大促不再等 T+1 报表。"
user_try: "试试：把 Amazon 订单 Webhook 接进 Kafka，做一个 5 分钟滚动的实时 GMV 看板。"
whenToUse: "数据延迟本身在伤害决策（补货滞后、直播调价跟不上）时用；只要 T+1 报表就够、或延迟不构成问题时，不必上流式链路。"
workflow: "把订单/库存事件源接入 Kafka topic（JSON schema 对齐） → 定义滑动窗口聚合，算出 5 分钟滚动 GMV/件数/TOP ASIN → 直播场景做弹幕流与订单流双流 Join，按事件时间对齐 → 设置 30-60s checkpoint 间隔与状态后端，控住恢复耗时 → 输出实时看板并配置补货与转化告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Streaming ETL with Flink/Kafka — 实时流式 ETL 工程化

## ① 解决的问题

运营面临"库存事件到数据仓库延迟2小时导致补货决策滞后"——流式ETL将数据延迟从2小时降至30秒，年化减少因延迟导致的断货损失40-80万元

## ② 核心算法逻辑

流式 ETL（Streaming ExtractTransformLoad）将传统批处理管道替换为持续运行的有状态流处理，端到端延迟从小时级压缩到秒级。核心组件：Kafka 作为持久化消息总线（event source），Apache Flink 作为有状态流处理引擎，下游接 Clickhouse/Doris 等实时 OLAP 或 Redis Feature Store。

## ③ 业务应用场景

场景1：Amazon 订单实时 GMV 看板 - 业务问题：运营团队依赖 T+1 报表决策补货，大促期间畅销品库存耗尽但次日才知晓，损失 GMV 达 10-30%。 - 数据要求：Amazon SP-API 订单 Webhook → Kafka `orders_raw` topic（JSON，~500 条/分钟平时，~50,000 条/分钟大促） - 预期产出：实时 5 分钟滚动 GMV/件数/ASIN TOP10 看板，延迟 < 10s - 业务价值：大促期间及时触发补货预警，挽回 GMV 损失估算 15-25 万元/次大促
场景2：TikTok 直播带货实时流量-转化联动分析 - 业务问题：TikTok 直播流量峰值与 GMV 转化之间有 5-15 分钟延迟，无法实时判断 "流量好但不转化" 还是 "流量数据延迟"。 - 数据要求：TikTok Live API 弹幕流 + 订单 Webhook，双流 Join（事件时间对齐） - 预期产出：直播间实时漏斗（观看→加购→下单），5 分钟窗口转化率告警 - 业务价值：实时调整直播话术/优惠券力度，直播场次转化率提升估算 8-12%
**三轨验证**： - 成本：自建 Flink on K8s 约 2-4 核/GB 起，Confluent Cloud Kafka $0.10/GB；中小卖家可用 Redpanda + Flink Session Cluster 降本 - 合规：消费者行为数据经过 Kafka 中转，需确保 Kafka topic 加密 + ACL 权限控制（GDPR Art.32） - 风险：Flink 状态后端（RocksDB）大状态下 checkpoint 耗时增加，需设置合理 checkpoint 间隔（建议 30-60s）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：实时看板替代 T+1 报表，大促期间及时补货预警挽回 GMV 15-25 万/次大促；直播转化实时监控提升场次 ROI 8-12%
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：流式 ETL 是大促精细化运营的基础设施，投入一次、持续复用。Flink + Kafka 生态成熟，母婴出海头部卖家已普遍落地。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（131 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Streaming ETL 模拟演示（无需 Flink/Kafka 环境）
模拟事件流 → 滑动窗口聚合 → 实时看板输出
"""
import time
import random
import collections
from datetime import datetime, timedelta
from typing import Generator

# ── 模拟事件生成器 ────────────────────────────────────────────────────────────
PRODUCTS = [
    ("B08ABC001", "婴儿安全座椅", 299.99),
    ("B08ABC002", "暖奶器",       45.00),
    ("B08ABC003", "防胀气奶瓶",   29.99),
    ("B08ABC004", "婴儿推车",     499.00),
    ("B08ABC005", "有机婴儿米粉", 18.99),
]

def event_stream(n: int = 200) -> Generator[dict, None, None]:
    """模拟 Amazon 订单事件流（含乱序事件）"""
    base_ts = datetime.utcnow()
    for i in range(n):
        asin, title, price = random.choice(PRODUCTS)
        # 模拟乱序：10% 事件时间滞后 0-45 秒
        lag = timedelta(seconds=random.randint(0, 45)) if random.random() < 0.1 else timedelta(0)
        event_time = base_ts + timedelta(seconds=i * 0.5) - lag
        yield {
            "order_id": f"ORD-{i:06d}",
            "asin": asin,
            "title": title,
            "price_usd": price,
            "quantity": random.randint(1, 3),
            "event_time": event_time,
            "marketplace": random.choice(["US", "UK", "DE"]),
        }


# ── Watermark + 事件时间窗口 ──────────────────────────────────────────────────
class TumblingWindowAggregator:
    """
    模拟 Flink TumblingEventTimeWindow(5 分钟)
    Watermark = max_event_time - 30s（允许 30s 乱序）
    """
    def __init__(self, window_minutes: int = 5, watermark_lag_seconds: int = 30):
        self.window_ms = window_minutes * 60 * 1000
        self.watermark_lag_ms = watermark_lag_seconds * 1000
        self.windows: dict[int, dict] = collections.defaultdict(lambda: {
            "gmv": 0.0, "orders": 0, "units": 0,
            "asin_counter": collections.Counter(),
        })
        self.max_event_time_ms: int = 0
        self.late_events: list[dict] = []
        self.fired_windows: list[dict] = []

    def _window_key(self, ts_ms: int) -> int:
        """把时间戳对齐到窗口起始 epoch（ms）"""
        return (ts_ms // self.window_ms) * self.window_ms

    def process(self, event: dict) -> None:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：订单/库存事件流（如 Amazon SP-API 订单 Webhook，JSON，平时约 500 条/分钟、大促约 50,000 条/分钟）；直播场景另需弹幕流与订单流双流

**输出**：实时 5 分钟滚动 GMV/件数/ASIN TOP10 看板（延迟 < 10s）与转化率、补货告警，供运营在大促期间决策

## 执行步骤

1. 把订单/库存事件源接入 Kafka topic，按 JSON schema 对齐字段。
2. 在 Flink 里定义滑动窗口聚合，算出 5 分钟滚动 GMV、件数与 TOP ASIN。
3. 直播场景做弹幕流与订单流的双流 Join，按事件时间对齐。
4. 设置 30-60s 的 checkpoint 间隔与状态后端，控住大状态恢复耗时。
5. 把实时结果推给看板并配置补货与转化告警。

## 边界与不做

- 何时不用：需求只是 T+1 报表、或要看的是数据本身对不对（质量校验）而不是延迟时，本技能不适用。
- 能力边界：只负责流式 ETL 管道与窗口聚合设计，不替业务决定补货量、出价等动作。
- 安全边界：消费者行为数据经 Kafka 中转须做 topic 加密与 ACL 权限控制（GDPR Art.32），未做不得上线。

## 技能关联

- **可组合**：Skill-Streaming-ETL-Flink-Kafka

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Streaming-ETL-Flink-Kafka`