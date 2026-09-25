---
name: ecom-supply-chain-trace
version: 1.0.0
description: 跨境供应链溯源 — 采购源头追踪、质检报告管理、物流追踪、库存周转分析、供应商绩效评分
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# 跨境供应链溯源 🔗

基于 Momcozy 母婴产品线（婴儿背带、吸奶器 S12 Pro、文胸 Seamless Bra、吸奶器 M5），覆盖从采购源头到终端交付的全链路溯源、质检管理、物流追踪、供应商绩效评估。

## 使用场景

- **产品溯源查询**：终端消费者/渠道要求查询某批次产品的完整供应链路径
- **供应商绩效评估**：季度/年度供应商评分，基于交期、质量、价格、配合度
- **质检报告管理**：记录和管理每次批次质检结果，追溯质量问题根因
- **物流效率分析**：从出厂→FBA头程→清关→入仓全链路时效分析
- **库存周转分析**：按 SKU/供应商/渠道分析库存周转率和资金占用
- **召回/客诉溯源**：出现客诉或召回时快速定位问题批次及供应商源头

## 输入（JSON Schema）

```json
{
  "type": "object",
  "required": ["analysis_type"],
  "properties": {
    "analysis_type": {
      "type": "string",
      "enum": ["full_trace", "supplier_scorecard", "logistics_analysis", "inventory_turnover", "quality_report"],
      "description": "分析类型"
    },
    "purchase_orders": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "po_number": {"type": "string"},
          "sku": {"type": "string"},
          "supplier": {"type": "string"},
          "qty_ordered": {"type": "integer"},
          "qty_received": {"type": "integer"},
          "unit_cost": {"type": "number"},
          "order_date": {"type": "string", "format": "date"},
          "expected_delivery": {"type": "string", "format": "date"},
          "actual_delivery": {"type": "string", "format": "date"},
          "status": {"type": "string", "enum": ["pending", "partial", "completed", "cancelled"]},
          "batch_number": {"type": "string"}
        }
      }
    },
    "suppliers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "country": {"type": "string"},
          "category": {"type": "string", "description": "供应品类"},
          "contract_start": {"type": "string", "format": "date"},
          "contract_end": {"type": "string", "format": "date"},
          "certifications": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    "quality_reports": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "batch_number": {"type": "string"},
          "po_number": {"type": "string"},
          "sku": {"type": "string"},
          "inspection_date": {"type": "string", "format": "date"},
          "inspector": {"type": "string"},
          "pass_rate_pct": {"type": "number"},
          "defect_types": {"type": "array", "items": {"type": "string"}},
          "result": {"type": "string", "enum": ["pass", "conditional_pass", "fail"]},
          "report_url": {"type": "string"}
        }
      }
    },
    "logistics": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tracking_id": {"type": "string"},
          "po_number": {"type": "string"},
          "carrier": {"type": "string"},
          "origin": {"type": "string"},
          "destination": {"type": "string"},
          "ship_date": {"type": "string", "format": "date"},
          "customs_clearance_date": {"type": "string", "format": "date"},
          "delivery_date": {"type": "string", "format": "date"},
          "status": {"type": "string", "enum": ["in_transit", "customs", "delivered", "delayed"]},
          "cost": {"type": "number"},
          "notes": {"type": "string"}
        }
      }
    },
    "inventory_data": {
      "type": "object",
      "description": "库存周转数据",
      "properties": {
        "by_sku": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sku": {"type": "string"},
              "beginning_inventory": {"type": "integer"},
              "ending_inventory": {"type": "integer"},
              "units_sold": {"type": "integer"},
              "units_received": {"type": "integer"},
              "period_days": {"type": "integer"}
            }
          }
        }
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
    "report_type": {"type": "string"},
    "generated_at": {"type": "string", "format": "datetime"},
    "trace_summary": {
      "type": "object",
      "properties": {
        "total_purchase_orders": {"type": "integer"},
        "total_suppliers": {"type": "integer"},
        "active_batches": {"type": "integer"},
        "on_time_delivery_rate": {"type": "number"},
        "avg_lead_time_days": {"type": "number"}
      }
    },
    "supplier_scorecard": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "supplier_name": {"type": "string"},
          "overall_score": {"type": "number", "minimum": 0, "maximum": 100},
          "score_breakdown": {
            "type": "object",
            "properties": {
              "quality_score": {"type": "number", "description": "质检通过率评分"},
              "delivery_score": {"type": "number", "description": "交期准时率评分"},
              "price_score": {"type": "number", "description": "价格竞争力评分"},
              "responsiveness_score": {"type": "number", "description": "响应配合度评分"},
              "compliance_score": {"type": "number", "description": "合规认证评分"}
            }
          },
          "tier": {"type": "string", "enum": ["A", "B", "C", "D"]},
          "recommendation": {"type": "string", "enum": ["expand", "maintain", "reduce", "phase_out"]},
          "recent_issues": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    "quality_analysis": {
      "type": "object",
      "properties": {
        "overall_pass_rate": {"type": "number"},
        "by_supplier": {"type": "array", "items": {"type": "object"}},
        "by_sku": {"type": "array", "items": {"type": "object"}},
        "top_defect_types": {"type": "array", "items": {"type": "object"}}
      }
    },
    "logistics_efficiency": {
      "type": "object",
      "properties": {
        "avg_transit_days": {"type": "number"},
        "avg_customs_clearance_days": {"type": "number"},
        "on_time_delivery_by_carrier": {"type": "array", "items": {"type": "object"}},
        "bottleneck_stages": {"type": "array", "items": {"type": "string"}},
        "cost_analysis": {
          "type": "object",
          "properties": {
            "avg_cost_per_unit": {"type": "number"},
            "total_logistics_cost": {"type": "number"},
            "cost_by_carrier": {"type": "array", "items": {"type": "object"}}
          }
        }
      }
    },
    "inventory_turnover": {
      "type": "object",
      "properties": {
        "overall_turnover_ratio": {"type": "number"},
        "by_sku": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sku": {"type": "string"},
              "turnover_ratio": {"type": "number"},
              "days_in_inventory": {"type": "number"},
              "excess_flag": {"type": "boolean"},
              "slow_mover_flag": {"type": "boolean"}
            }
          }
        }
      }
    },
    "trace_graph": {
      "type": "object",
      "description": "供应链溯源图，从原材料到终端交付的可视化链路",
      "properties": {
        "nodes": {"type": "array"},
        "edges": {"type": "array"}
      }
    },
    "action_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "priority": {"type": "string", "enum": ["urgent", "high", "medium"]},
          "category": {"type": "string", "enum": ["supplier", "quality", "logistics", "inventory"]},
          "description": {"type": "string"},
          "impact": {"type": "string"}
        }
      }
    }
  }
}
```

## 供应商评分模型

| 维度 | 权重 | 指标 |
|------|------|------|
| Quality | 35% | 质检通过率、客诉率、召回次数 |
| Delivery | 25% | 准时交付率、Lead Time 稳定性、沟通时效 |
| Price | 20% | 价格竞争力、价格稳定性、付款条件 |
| Responsiveness | 10% | 响应速度、问题处理效率、配合度 |
| Compliance | 10% | 认证完备率、ESG 合规、审计配合度 |

Tier 划分：A (90-100) 战略供应商 → B (75-89) 稳定供应商 → C (60-74) 关注供应商 → D (<60) 淘汰供应商

## 一句调用示例

```
请用 ecom-supply-chain-trace 做 full_trace 分析，采购单在 data/purchase_orders.json，供应商信息在 data/suppliers.json，质检报告在 data/quality.json，物流数据在 data/logistics.json。
```

## 后续推荐改良方向

1. **区块链溯源** — 对接区块链平台实现不可篡改的供应链溯源
2. **IoT 实时追踪** — 接入 GPS/温控传感器，实时回传物流状态
3. **AI 质检图片识别** — 用计算机视觉自动判读质检图片的缺陷
4. **智能供应商推荐** — 基于历史绩效自动推荐最优供应商
5. **碳足迹追踪** — 增加碳排放数据模块，支持碳中和报告
6. **合规联动** — 供应链溯源数据自动同步到 ecom-compliance-manager
