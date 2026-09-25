---
name: ecom-daily-report
version: 1.0.0
description: 跨境电商每日经营日报 — 从 Amazon/TikTok/Shopify 等渠道自动/手动采集销售数据，生成标准化日报告
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# 跨境电商每日经营日报 📊

基于 Momcozy 真实业务场景（婴儿背带、吸奶器 S12 Pro、文胸 Seamless Bra、吸奶器 M5），从多数据源采集销售数据，生成标准化结构化日报告。

## 使用场景

- **每日开晨会前**：快速获取昨日经营全景，包括总收入、渠道分布、Top SKU
- **异常捕捉**：自动标记销售额骤降/骤升、渠道异常、库存预警
- **WOW 对比**：与上周同日对比，判断趋势方向
- **跨渠道复盘**：Amazon NA/DE、TikTok Shop、Shopify、Target KA 统一口径
- **今日行动**：基于数据输出今日优先事项和 Action Items

## 输入（JSON Schema）

```json
{
  "type": "object",
  "required": ["date", "data_source"],
  "properties": {
    "date": {
      "type": "string",
      "description": "报告日期，格式 YYYY-MM-DD"
    },
    "data_source": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["csv", "json"],
          "description": "数据格式类型 // required: at least one channel must have data (non-empty array)"
        },
        "amazon": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "marketplace": {"type": "string", "enum": ["NA", "DE", "UK", "JP"]},
              "sku": {"type": "string"},
              "sales_qty": {"type": "integer"},
              "revenue": {"type": "number"},
              "ad_spend": {"type": "number"},
              "returns": {"type": "integer"}
            }
          }
        },
        "tiktok_shop": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sku": {"type": "string"},
              "gmv": {"type": "number"},
              "orders": {"type": "integer"},
              "commission": {"type": "number"},
              "live_revenue": {"type": "number"},
              "video_revenue": {"type": "number"}
            }
          }
        },
        "shopify": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sku": {"type": "string"},
              "revenue": {"type": "number"},
              "orders": {"type": "integer"},
              "traffic_source": {"type": "string"}
            }
          }
        },
        "target_ka": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sku": {"type": "string"},
              "revenue": {"type": "number"},
              "sell_through": {"type": "number"}
            }
          }
        }
      }
    },
    "compare_week_ago": {
      "type": "string",
      "description": "上周同日数据，格式 YYYY-MM-DD，不传则不对比"
    }
  }
}
```

## 输出报告结构（JSON）

```json
{
  "report_date": "2026-05-04",
  "generated_at": "2026-05-05T08:00:00Z",
  "summary": {
    "total_revenue": 48500.00,
    "wow_change_pct": 12.5,
    "total_orders": 320,
    "avg_order_value": 151.56
  },
  "channel_breakdown": {
    "amazon_na": {"revenue": 22000.00, "orders": 145, "wow_change_pct": 8.2},
    "amazon_de": {"revenue": 8500.00, "orders": 52, "wow_change_pct": -3.1},
    "tiktok_shop": {"revenue": 12000.00, "orders": 88, "wow_change_pct": 25.4},
    "shopify": {"revenue": 3500.00, "orders": 22, "wow_change_pct": 5.0},
    "target_ka": {"revenue": 2500.00, "orders": 13, "wow_change_pct": 10.0}
  },
  "top_products": [
    {"sku": "S12-PRO", "name": "吸奶器 S12 Pro", "revenue": 15500.00, "qty": 62, "channel": "amazon_na"},
    {"sku": "SEAMLESS-BRA", "name": "Seamless Bra", "revenue": 8900.00, "qty": 178, "channel": "amazon_na"},
    {"sku": "M5-PUMP", "name": "吸奶器 M5", "revenue": 7200.00, "qty": 36, "channel": "tiktok_shop"}
  ],
  "anomalies": [
    {
      "level": "warning",
      "channel": "amazon_de",
      "message": "Amazon DE 销售额环比下降 8.1%，检查是否受复活节假期影响",
      "metric": "revenue",
      "threshold": -5.0,
      "actual": -8.1
    }
  ],
  "priorities": [
    {"rank": 1, "action": "检查 Amazon DE 广告投放是否异常，调整竞价策略", "owner": "广告运营"},
    {"rank": 2, "action": "TikTok Shop GMV 环比+25%，确认库存是否充足", "owner": "供应链"},
    {"rank": 3, "action": "S12 Pro 日销 62 件，检查 FBA 库存水位，安排补货", "owner": "采购"}
  ]
}
```

## 一句调用示例

```
请用 ecom-daily-report 生成昨天(2026-05-03)的日报，数据在 data/sales_20260503.json 中，对比上周同日 2026-04-26。
```

## 后续推荐改良方向

1. **自动数据采集 Pipeline** — 对接 Amazon SP-API、TikTok Shop API、Shopify Admin API 实现自动拉取
2. **多维度异常检测** — 加入 3σ、移动平均、同比环比组合检测
3. **趋势预测** — 接入 7 日/30 日移动平均趋势线，预判拐点
4. **报表分发** — 自动推送至飞书/DingTalk/Slack 机器人
5. **财务对账模块** — 加入退款率、广告ROAS、佣金成本核算
6. **Momcozy 定制模板** — 针对 S12 Pro/M5/Seamless Bra 各 SKU 的独立利润率分析
