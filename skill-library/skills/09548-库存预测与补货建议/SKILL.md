---
name: ecom-inventory-forecaster
version: 1.0.0
description: 库存预测与补货建议 — 基于销售历史、季节性、Lead Time 做库存预测，输出补货建议和断货风险等级
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# 库存预测与补货建议 📦

基于 Momcozy 业务数据（婴儿背带、吸奶器 S12 Pro、文胸 Seamless Bra、吸奶器 M5），根据销售历史、季节性因子、供应商 Lead Time 做库存水位预测，输出可执行的补货计划和断货风险分级。

## 使用场景

- **日常补货决策**：哪些 SKU 需要补、补多少、什么时候下单
- **旺季前备货**：Prime Day、黑五、圣诞季前的安全库存评估
- **断货预警**：识别即将断货的高风险 SKU，提前触发补货流程
- **供应商交期评估**：Lead Time 波动时，动态调整安全库存水位
- **库存周转优化**：识别滞销 SKU，减少资金占用

## 输入（JSON Schema）

```json
{
  "type": "object",
  "required": ["products", "current_stock"],
  "properties": {
    "date": {
      "type": "string",
      "description": "评估基准日期 YYYY-MM-DD"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {"type": "string"},
          "name": {"type": "string"},
          "daily_sales_avg": {"type": "number", "description": "近30天日均销量"},
          "daily_sales_std": {"type": "number", "description": "日均销量标准差"},
          "seasonality_factor": {"type": "number", "description": "季节因子，1.0为基准，旺季>1.0"},
          "weekly_sales_history": {
            "type": "array",
            "items": {"type": "integer"},
            "description": "过去12周每周销量，用于趋势分析"
          }
        }
      }
    },
    "current_stock": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "on_hand": {"type": "integer", "description": "现有库存"},
          "inbound": {"type": "integer", "description": "在途库存"},
          "reserved": {"type": "integer", "description": "已预留/订单占用"},
          "fba_units": {"type": "integer", "description": "FBA 仓库存"},
          "fbm_units": {"type": "integer", "description": "自发货库存"}
        }
      }
    },
    "suppliers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {"type": "string"},
          "supplier_name": {"type": "string"},
          "lead_time_days": {"type": "integer", "description": "标准 Lead Time（天）"},
          "lead_time_std": {"type": "integer", "description": "Lead Time 标准差（天）"},
          "moq": {"type": "integer", "description": "最小起订量"},
          "unit_cost": {"type": "number", "description": "采购单价 USD"}
        }
      }
    },
    "config": {
      "type": "object",
      "properties": {
        "target_service_level": {"type": "number", "default": 0.95, "description": "目标服务水平，默认 95%"},
        "safety_stock_days": {"type": "integer", "default": 14, "description": "安全库存天数"},
        "forecast_horizon_days": {"type": "integer", "default": 90, "description": "预测周期（天）"},
        "min_order_interval_days": {"type": "integer", "default": 7, "description": "最小下单间隔"}
      }
    }
  }
}
```

## 输出（JSON Schema）

```json
{
  "type": "object",
  "properties": {
    "forecast_date": {"type": "string"},
    "total_risk_value": {"type": "number", "description": "断货风险与滞销风险综合估值"},
    "sku_forecasts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {"type": "string"},
          "name": {"type": "string"},
          "forecast_daily_sales_next_30d": {"type": "number"},
          "days_until_stockout": {"type": "number", "description": "预计断货天数"},
          "stockout_risk": {
            "type": "string",
            "enum": ["critical", "high", "medium", "low", "none"]
          },
          "stockout_risk_score": {"type": "number", "min": 0, "max": 100},
          "recommended_reorder_qty": {"type": "integer"},
          "recommended_order_date": {"type": "string", "description": "建议下单日期"},
          "rush_flag": {"type": "boolean", "description": "是否紧急补货"},
          "avg_daily_sales_forecast_90d": {"type": "number"},
          "peak_sales_month": {"type": "string", "description": "预计旺季月份"},
          "excess_stock_risk": {"type": "string", "enum": ["high", "medium", "low"], "description": "滞销风险"}
        }
      }
    },
    "alerts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "level": {"type": "string", "enum": ["critical", "warning", "info"]},
          "sku": {"type": "string"},
          "message": {"type": "string"}
        }
      }
    },
    "reorder_summary": {
      "type": "object",
      "properties": {
        "total_reorder_cost_estimate": {"type": "number"},
        "skus_needing_reorder": {"type": "integer"},
        "urgent_skus": {"type": "integer", "description": "critical + high 级别 SKU 数"},
        "next_review_date": {"type": "string"}
      }
    }
  }
}
```

## 断货风险等级定义

| 等级 | 条件 | 行动 |
|------|------|------|
| critical | 5天内断货 | 立即紧急补货 |
| high | 5-14天断货 | 本周内下单 |
| medium | 14-30天断货 | 安排正常补货 |
| low | 30-60天断货 | 关注，暂不补货 |
| none | >60天断货 | 库存充足 |

## 一句调用示例

```
请用 ecom-inventory-forecaster 评估 S12 Pro 和 M5 的库存状况，产品数据在 data/products.json，库存水位在 data/stock.json，供应商信息在 data/suppliers.json，目标服务水平 95%。
```

## 后续推荐改良方向

1. **机器学习预测** — 引入 Prophet/LightGBM 替代均值+季节因子，提升预测精度
2. **多仓库存优化** — 支持 FBA 多仓（美西/美东/欧洲）：最优库存分布
3. **自动采购单生成** — 对接采购系统自动生成 PO
4. **实时水位看板** — 接入实时库存 API，建立 Grafana 监控面板
5. **安全库存自动调优** — 根据实际断货率自动校准安全库存参数
6. **供需关联分析** — 广告投放变化 → 销量预测联动，活动期提前备货
