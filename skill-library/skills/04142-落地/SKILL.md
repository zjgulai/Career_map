---
name: "slo-implementation"
title: "SLO 与错误预算"
description: "定义 SLI、SLO 与错误预算，给出目标值与停机时长对照表、Prometheus 记录规则、燃烧率告警与看板结构。触发词：SLO 与错误预算、slo-implementation、定义 SLI、SLO 与错误预算，给出目标值与停机时长对照表、Prometheus 记录规则、燃烧率告警与看板结构。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# SLO 落地

定义并落地服务等级指标（SLI）、服务等级目标（SLO）与错误预算的框架。

## 目的

用 SLI、SLO 与错误预算落地可度量的可靠性目标，在可靠性与创新速度之间取得平衡。

## 何时使用

- 定义服务的可靠性目标
- 度量用户可感知的可靠性
- 落地错误预算
- 创建基于 SLO 的告警
- 跟踪可靠性目标

## SLI/SLO/SLA 层级

```
SLA (Service Level Agreement)
  ↓ Contract with customers
SLO (Service Level Objective)
  ↓ Internal reliability target
SLI (Service Level Indicator)
  ↓ Actual measurement
```

## 定义 SLI

### 常见 SLI 类型

#### 1. 可用性 SLI

```promql
# Successful requests / Total requests
sum(rate(http_requests_total{status!~"5.."}[28d]))
/
sum(rate(http_requests_total[28d]))
```

#### 2. 延迟 SLI

```promql
# Requests below latency threshold / Total requests
sum(rate(http_request_duration_seconds_bucket{le="0.5"}[28d]))
/
sum(rate(http_request_duration_seconds_count[28d]))
```

#### 3. 持久性 SLI

```
# Successful writes / Total writes
sum(storage_writes_successful_total)
/
sum(storage_writes_total)
```

**参考：**见 `references/slo-definitions.md`

## 设定 SLO 目标

### 可用性 SLO 示例

| SLO %  | 每月不可用时长 | 每年不可用时长 |
| ------ | -------------- | -------------- |
| 99%    | 7.2 小时       | 3.65 天        |
| 99.9%  | 43.2 分钟      | 8.76 小时      |
| 99.95% | 21.6 分钟      | 4.38 小时      |
| 99.99% | 4.32 分钟      | 52.56 分钟     |

### 选择合适的 SLO

**要考虑：**

- 用户预期
- 业务要求
- 当前性能
- 可靠性的成本
- 竞争对手的基准

**SLO 示例：**

```yaml
slos:
  - name: api_availability
    target: 99.9
    window: 28d
    sli: |
      sum(rate(http_requests_total{status!~"5.."}[28d]))
      /
      sum(rate(http_requests_total[28d]))

  - name: api_latency_p95
    target: 99
    window: 28d
    sli: |
      sum(rate(http_request_duration_seconds_bucket{le="0.5"}[28d]))
      /
      sum(rate(http_request_duration_seconds_count[28d]))
```

## 错误预算计算

### 错误预算公式

```
Error Budget = 1 - SLO Target
```

**示例：**

- SLO：99.9% 可用性
- 错误预算：0.1% = 每月 43.2 分钟
- 当前错误：0.05% = 每月 21.6 分钟
- 剩余预算：50%

### 错误预算策略

```yaml
error_budget_policy:
  - remaining_budget: 100%
    action: Normal development velocity
  - remaining_budget: 50%
    action: Consider postponing risky changes
  - remaining_budget: 10%
    action: Freeze non-critical changes
  - remaining_budget: 0%
    action: Feature freeze, focus on reliability
```

**参考：**见 `references/error-budget.md`

## SLO 落地实现

### Prometheus 记录规则

```yaml
# SLI Recording Rules
groups:
  - name: sli_rules
    interval: 30s
    rules:
      # Availability SLI
      - record: sli:http_availability:ratio
        expr: |
          sum(rate(http_requests_total{status!~"5.."}[28d]))
          /
          sum(rate(http_requests_total[28d]))

      # Latency SLI (requests < 500ms)
      - record: sli:http_latency:ratio
        expr: |
          sum(rate(http_request_duration_seconds_bucket{le="0.5"}[28d]))
          /
          sum(rate(http_request_duration_seconds_count[28d]))

  - name: slo_rules
    interval: 5m
    rules:
      # SLO compliance (1 = meeting SLO, 0 = violating)
      - record: slo:http_availability:compliance
        expr: sli:http_availability:ratio >= bool 0.999

      - record: slo:http_latency:compliance
        expr: sli:http_latency:ratio >= bool 0.99

      # Error budget remaining (percentage)
      - record: slo:http_availability:error_budget_remaining
        expr: |
          (sli:http_availability:ratio - 0.999) / (1 - 0.999) * 100

      # Error budget burn rate
      - record: slo:http_availability:burn_rate_5m
        expr: |
          (1 - (
            sum(rate(http_requests_total{status!~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          )) / (1 - 0.999)
```

### SLO 告警规则

```yaml
groups:
  - name: slo_alerts
    interval: 1m
    rules:
      # Fast burn: 14.4x rate, 1 hour window
      # Consumes 2% error budget in 1 hour
      - alert: SLOErrorBudgetBurnFast
        expr: |
          slo:http_availability:burn_rate_1h > 14.4
          and
          slo:http_availability:burn_rate_5m > 14.4
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Fast error budget burn detected"
          description: "Error budget burning at {{ $value }}x rate"

      # Slow burn: 6x rate, 6 hour window
      # Consumes 5% error budget in 6 hours
      - alert: SLOErrorBudgetBurnSlow
        expr: |
          slo:http_availability:burn_rate_6h > 6
          and
          slo:http_availability:burn_rate_30m > 6
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Slow error budget burn detected"
          description: "Error budget burning at {{ $value }}x rate"

      # Error budget exhausted
      - alert: SLOErrorBudgetExhausted
        expr: slo:http_availability:error_budget_remaining < 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "SLO error budget exhausted"
          description: "Error budget remaining: {{ $value }}%"
```

## SLO 看板

**Grafana 看板结构：**

```
┌────────────────────────────────────┐
│ SLO Compliance (Current)           │
│ ✓ 99.95% (Target: 99.9%)          │
├────────────────────────────────────┤
│ Error Budget Remaining: 65%        │
│ ████████░░ 65%                     │
├────────────────────────────────────┤
│ SLI Trend (28 days)                │
│ [Time series graph]                │
├────────────────────────────────────┤
│ Burn Rate Analysis                 │
│ [Burn rate by time window]         │
└────────────────────────────────────┘
```

**查询示例：**

```promql
# Current SLO compliance
sli:http_availability:ratio * 100

# Error budget remaining
slo:http_availability:error_budget_remaining

# Days until error budget exhausted (at current burn rate)
(slo:http_availability:error_budget_remaining / 100)
*
28
/
(1 - sli:http_availability:ratio) * (1 - 0.999)
```

## 更多模式与模板

更详细的模板与完整示例在 `references/details.md` 中。要拿到完整的模式库，读那个文件。
