---
name: ecommerce-data-analyst
version: 2.0.0
description: >
  Data Agent for 母婴跨境电商 — 全量升级版。不只是数据分析工具，而是可独立运行的 Data Agent。
  覆盖：数据采集→清洗→分析→异常检测→归因→自动报告→策略输入。
  3 种执行模式：单次查询 / 定时报告 / 异常驱动告警。
  内置 RFM 客户分群、Cohort 留存分析、A/B 测试评估、自动归因分析。
  输出可直接被下游策略层消费的结构化载荷。
source: https://github.com/openclaw/skills (upgraded v2.0)
---
# Data Agent — 电商数据分析代理 (v2.0) 📊

**升级说明**：v2.0 从"数据分析工具"升级为"可独立运行的 Data Agent"。新增异常自动检测、归因分析、自动报告生成、策略输入桥接。

## 母婴电商数据特殊性

- **生命周期价值**: 母婴用户 LTV 极高（从孕期到学龄前持续消费），RFM 模型需加入"育儿阶段"维度
- **复购周期**: 消耗品（奶粉、尿布）有固定复购周期，可预测性极强
- **尺码变化**: 服装类需跟踪宝宝成长尺码变化，隐含下一轮购买窗口
- **季节性**: 开学季、换季、节日等季节性明显，需区分"正常波动"vs"异常波动"
- **安全事件**: 安全相关数据需实时监控，任何与"召回""投诉""退货率飙升"相关的数据变化需 P0 告警
- **用户分群**: 孕期妈妈 vs 新妈妈 vs 1岁+妈妈，行为模式完全不同

## 3 种执行模式

### 模式 A: 单次查询 (Query)
用户提问一句，立即分析并返回结果。

> "上月 S12 Pro 在 Amazon DE 的转化率变化趋势"

通过 `ecommerce-data-analyst` 加载后直接执行：SQL/CSV 数据读入 → pandas 处理 → 结论输出。

### 模式 B: 定时报告 (Schedule)
预设时间窗口和维度，自动生成报告。

> "每周一早上发 Momcozy 全产品线数据周报"

通过 cronjob 触发，自动执行数据分析 pipeline，输出结构化报告。

### 模式 C: 异常驱动告警 (Alert)
预设监控指标和阈值，异常时自动触发。

> "监控 S12 Pro 的退货率，如果单日超过 5% 立刻告警"

通过 cronjob 定期运行数据分析，检测到异常时输出告警载荷。

## 核心能力

### 数据采集与清洗
- CSV/Excel 批量导入（通过 `lute_file.read_csv`/`export_csv`）
- SQL 查询执行（通过 `mysql_instance().execute_query`）
- 缺失值/异常值/重复数据自动处理
- Google Sheets / BigQuery / Snowflake 接入

### 分析能力
- **描述性分析**: 销售额趋势、渠道对比、SKU 排名、退货率、ACoS
- **RFM 客户分群**: Recency + Frequency + Monetary + 育儿阶段维度
- **Cohort 留存分析**: 按月/周展示不同获客批次的留存衰减
- **A/B 测试评估**: 转化率显著性检验、置信区间
- **归因分析**: 多渠道转化归因（Amazon organic / TikTok / 达人佣金）

### 异常检测
- **统计检测**: 移动平均 + 标准差阈值（3σ）
- **趋势检测**: 连续 3 期同向变化视为趋势信号
- **同比环比**: 与上周/上月/去年同期对比，超阈值标记
- **相关检测**: 退货率 vs 差评关键词的关联分析

### 自动报告
- 输出结构化 Markdown 报告
- 输出 JSON 载荷供下游消费
- 支持图表嵌入（Base64 图片/ASCII 图表）
- 报告模板可预设（日报/周报/月报）

### 策略输入桥接
分析结果直接输出为可供下游消费的结构化信号：

```json
{
  "report_type": "weekly|monthly|alert",
  "period": "2026-W18",
  "overall": {"revenue": 458000, "mom": "+12%", "yoy": "+34%"},
  "anomalies": [
    {"product": "S12 Pro", "metric": "return_rate", "value": 6.2, "threshold": 5.0, "severity": "P1"}
  ],
  "top_products": [
    {"sku": "S12 Pro", "revenue": 138000, "mom": "+8%", "alert": null},
    {"sku": "M5", "revenue": 75000, "mom": "-3%", "alert": "declining_3w"}
  ],
  "channel_breakdown": {
    "amazon_na": {"revenue": 210000, "share": 45.8, "acos": 18.2},
    "amazon_de": {"revenue": 85000, "share": 18.6, "acos": 22.1},
    "tiktok_shop": {"revenue": 62000, "share": 13.5, "acos": 15.3},
    "shopify": {"revenue": 58000, "share": 12.7},
    "target_ka": {"revenue": 43000, "share": 9.4}
  },
  "attribution": {
    "amazon_organic": 0.42,
    "amazon_paid": 0.18,
    "tiktok_daraz": 0.15,
    "influencer_commission": 0.12,
    "other": 0.13
  },
  "strategy_input": {
    "urgent_actions": ["检查 M5 连续 3 周下滑原因", "S12 Pro 退货率超阈"],
    "opportunity_areas": ["Amazon DE ACoS 22.1% 偏高需要优化", "TikTok 转化效率超 Amazon 可加大投入"],
    "content_priorities": ["S12 Pro 需要强化安全认证内容以降低退货"]
  }
}
```

## 输入输出

**输入**:
```json
{
  "mode": "query|report|alert",
  "data_source": "csv|csv_file|sql|google_sheets",
  "data": {},
  "dimensions": ["product", "channel", "time"],
  "metrics": ["revenue", "units", "return_rate", "acos"],
  "timeframe": "last_week|last_month|last_quarter|custom",
  "comparison": "wow|mom|yoy"
}
```

**输出**: 上述 JSON 结构化负载

## 一句话调用

> "跑 Momcozy 上周的全渠道数据，输出周报含异常标记和策略建议"

## 后续推荐改良方向

1. **数据管道持久化**：当前每次运行重新从原始数据加载，后续可加数据缓存层，支持增量更新
2. **多数据源合并**：目前一次只能处理一个数据源，后续需要跨 Amazon/TikTok/Shopify 自动合并的能力
3. **归因模型升级**：当前归因是简单的 Last-Click 模型，后续可升级为 Shapley Value 多触点归因
4. **预测组件**：基于历史数据做短期销售预测（7 天/30 天），协助库存和预算决策
5. **异常根因自动追溯**：检测到异常后，自动向下钻取（产品级→SKU级→变体级→日期级），缩小根因范围
6. **自然语言查询自动解析**：用户说"上月哪款产品退货最多"→ 自动映射到对应维度和指标

## Usage

> "跑 Momcozy 上周周报，按产品线、渠道、国家三个维度，含异常标记"
> "检查 S12 Pro 近 30 天的退货趋势，看有没有异常"
> "对比 TikTok Shop 和 Amazon 的新客获取成本差异"
> "每周一自动跑全渠道日报，输出到 Crons 报告通道"
