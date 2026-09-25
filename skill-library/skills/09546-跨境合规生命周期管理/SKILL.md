---
name: ecom-compliance-manager
version: 1.0.0
description: 跨境合规生命周期管理 — 覆盖市场准入认证、标签合规、产品安全标准、广告审查，输出合规清单+到期日历+风险等级
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# 跨境合规生命周期管理 ✅

基于 Momcozy 母婴产品线（婴儿背带、吸奶器 S12 Pro、文胸 Seamless Bra、吸奶器 M5），覆盖北美（美国/加拿大）、欧洲（EU/UK）、中国市场的全链路合规管理，包括认证、标签、安全标准、广告合规四大模块。

## 使用场景

- **新品上市合规审核**：新产品进入新市场前进行合规清单检查
- **认证到期续期提醒**：CE/FDA/CPC 等认证到期前自动提醒
- **标签合规审查**：FDA 标签、CE marking、CPSIA tracking label 合规性检查
- **广告/Listing 合规审核**：FDA claim substantiation、FTC endorsement disclosure、TikTok ad compliance
- **出口国与目的国双重合规**：中国出口 + 目的国进口合规
- **合规风险审计**：定期检查产品线合规状态，生成风险矩阵

## 输入（JSON Schema）

```json
{
  "type": "object",
  "required": ["products", "target_markets"],
  "properties": {
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {"type": "string"},
          "name": {"type": "string"},
          "category": {
            "type": "string",
            "enum": ["breast_pump", "baby_carrier", "nursing_bra", "nursing_accessory"]
          },
          "material": {"type": "string", "description": "主要材质"},
          "battery_included": {"type": "boolean", "description": "是否含电池/锂电池"},
          "electronic_device": {"type": "boolean", "description": "是否电子设备"},
          "children_product": {"type": "boolean", "description": "是否儿童产品（12岁以下用）"},
          "existing_certifications": {"type": "array", "items": {"type": "string"}, "description": "已有认证列表"}
        }
      }
    },
    "target_markets": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["US", "CA", "EU", "UK", "CN", "AU", "JP", "AE"]
      }
    },
    "selling_channels": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["amazon", "tiktok_shop", "shopify", "target_ka", "walmart", "etsy", "own_site"]
      }
    },
    "advertising_platforms": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["amazon_ads", "tiktok_ads", "meta_ads", "google_ads", "influencer"]
      }
    },
    "existing_certificates": {
      "type": "object",
      "description": "已有认证及其到期日期",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "certificate_number": {"type": "string"},
          "issuer": {"type": "string"},
          "issue_date": {"type": "string"},
          "expiry_date": {"type": "string"},
          "status": {"type": "string", "enum": ["active", "expiring_soon", "expired", "pending"]}
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
    "assessment_date": {"type": "string", "format": "date"},
    "overall_compliance_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "整体合规评分"
    },
    "overall_risk_level": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"]
    },
    "by_market": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "market": {"type": "string"},
          "compliance_score": {"type": "integer"},
          "risk_level": {"type": "string"},
          "missing_certifications": {"type": "array", "items": {"type": "string"}},
          "expiring_certifications": {"type": "array", "items": {"type": "object"}},
          "label_issues": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    "certification_checklist": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "certification": {"type": "string", "description": "认证名称"},
          "applicable_to": {"type": "array", "items": {"type": "string"}, "description": "适用产品 SKU"},
          "required_for_markets": {"type": "array", "items": {"type": "string"}},
          "status": {"type": "string", "enum": ["compliant", "missing", "expiring", "in_progress", "not_applicable"]},
          "deadline": {"type": "string", "description": "截止日期"},
          "estimated_cost": {"type": "number", "description": "预估费用 USD"},
          "estimated_timeline_days": {"type": "integer"},
          "responsible_party": {"type": "string"}
        }
      }
    },
    "label_compliance": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": {"type": "string"},
          "market": {"type": "string"},
          "issues": {"type": "array", "items": {"type": "string"}},
          "requirements": {"type": "array", "items": {"type": "string"}}
        }
      }
    },
    "advertising_compliance": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "platform": {"type": "string"},
          "claim_type": {"type": "string"},
          "risk_level": {"type": "string"},
          "recommended_wording": {"type": "string"},
          "disclaimer_required": {"type": "boolean"}
        }
      }
    },
    "certification_calendar": {
      "type": "object",
      "properties": {
        "expiring_this_month": {"type": "array", "items": {"type": "object"}},
        "expiring_this_quarter": {"type": "array", "items": {"type": "object"}},
        "upcoming_renewals": {"type": "array", "items": {"type": "object"}}
      }
    },
    "action_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "priority": {"type": "string", "enum": ["urgent", "high", "medium", "low"]},
          "task": {"type": "string"},
          "product_sku": {"type": "string"},
          "market": {"type": "string"},
          "deadline": {"type": "string"}
        }
      }
    }
  }
}
```

## 认证对照表（母婴行业关键认证）

| 认证 | 适用市场 | 适用产品 | 重要性 |
|------|---------|---------|-------|
| FDA 510(k) | US | 吸奶器（II类医疗器械） | 强制 |
| FDA Registration | US | 吸奶器 | 强制 |
| FCC Part 15 | US | 含电子元件的产品 | 强制 |
| CPSIA | US | 儿童产品（背带、玩具） | 强制 |
| ASTM F963 | US | 玩具类儿童产品 | 强制 |
| CPC Certificate | US | 儿童产品 | 强制 |
| CE (MDD/MDR) | EU | 吸奶器（医疗器械） | 强制 |
| CE (EMC/LVD) | EU | 电子设备 | 强制 |
| UKCA | UK | 向英国销售 | 强制（脱欧后） |
| REACH | EU | 化学物质合规 | 强制 |
| RoHS | EU | 电子电气设备 | 强制 |
| EN71 | EU | 儿童产品安全 | 强制 |
| CCC | CN | 在中国销售 | 强制 |
| WEEE | EU | 电子废弃物 | 强制 |
| Prop 65 | US-CA | 加州销售产品 | 强制 |
| CA SOR/2018-83 | CA | 儿童产品 | 强制 |

## 一句调用示例

```
请用 ecom-compliance-manager 检查 S12 Pro 吸奶器进入 EU 和 UK 市场的合规清单，已有 FDA 510(k) 和 FCC，目标渠道 Amazon DE 和 TikTok Shop UK。
```

## 后续推荐改良方向

1. **自动合规日历** — 对接日历系统，自动发送认证到期提醒
2. **法规变更监控** — 订阅 CPSC/FDA/EU CE Marking 法规更新，自动影响评估
3. **合规文件仓库** — 集中管理所有认证文件 PDF，支持即时调取
4. **AI 条款审查** — 用 LLM 自动审查 Listing 文案的合规风险
5. **渠道差异化合规** — Amazon 合规 vs TikTok Shop 合规 vs 独立站合规 差异化规则库
6. **跨境税务联动** — 与 VAT/GST/IOSS 税合规联动
