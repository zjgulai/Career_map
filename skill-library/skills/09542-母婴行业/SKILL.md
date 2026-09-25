---
name: competitor-price-analysis
version: 2.0.0
description: Analyze competitor pricing strategies across e-commerce platforms for母婴 products. v2.0 adds auto-monitoring rules, price change alerts (JSON payload), price elasticity estimation, promo strategy recommendations, and data-to-strategy-bridge output interface.
source: https://github.com/nexscope-ai/eCommerce-Skills
---

# Competitor Price Analysis for母婴行业 💲

Analyze competitor pricing strategies for母婴 products across e-commerce platforms. v2.0 adds auto-monitoring rules framework, price change alert (JSON payload), price elasticity estimation, promo strategy recommendation, and output interface to data-to-strategy-bridge.

## 母婴行业定价特殊性

- **安全溢价**: 消费者愿意为安全认证支付溢价
- **品牌忠诚度**: 妈妈群体品牌忠诚度极高，价格弹性低
- **套装定价**: 母婴产品常以套装/Bundle形式销售
- **订阅模式**: 奶粉、尿布等消耗品适合订阅定价
- **季节性波动**: 开学季、双11、黑五等节点定价策略

## Capabilities

- Price mapping across competitors (price bands, positioning)
- Price gap identification (underserved price points)
- Price elasticity signal analysis from review/sales patterns
- Promotional pricing pattern detection
- MAP/MSRP compliance monitoring framework
- Dynamic pricing strategy recommendations
- 母婴产品 bundle pricing optimization
- Cross-platform price parity analysis

## v2.0 新增模块

### 1. 自动监控规则定义框架

定义竞品价格监控规则的 JSON Schema：

```json
{
  "monitoring_rules": {
    "type": "object",
    "required": ["rules", "scan_frequency"],
    "properties": {
      "scan_frequency": {
        "type": "string",
        "enum": ["every_4h", "every_8h", "every_12h", "every_24h", "every_week"],
        "description": "价格扫描频率"
      },
      "rules": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "rule_id": {"type": "string"},
            "enabled": {"type": "boolean"},
            "our_sku": {"type": "string", "description": "我们的SKU"},
            "competitor": {"type": "string", "description": "竞品名称/ASIN"},
            "competitor_sku": {"type": "string", "description": "竞品SKU/ASIN"},
            "marketplace": {"type": "string", "enum": ["amazon_us", "amazon_de", "amazon_uk", "tiktok_shop", "shopify", "target", "walmart"]},
            "threshold_pct": {"type": "number", "description": "触发告警的价格变化百分比阈值"},
            "track_type": {
              "type": "string",
              "enum": ["our_price_vs_competitor", "competitor_price_change", "both"],
              "description": "监控类型"
            },
            "compare_mode": {
              "type": "string",
              "enum": ["absolute", "percentage", "both"],
              "description": "比较模式"
            },
            "action_on_alert": {
              "type": "string",
              "enum": ["notify_only", "auto_adjust_price", "pause_ad", "review"]
            },
            "channels": {
              "type": "array",
              "items": {"type": "string", "enum": ["slack", "email", "webhook"]},
              "description": "通知渠道"
            }
          }
        }
      }
    }
  }
}
```

规则定义示例（Momcozy 场景）：

```json
{
  "scan_frequency": "every_4h",
  "rules": [
    {
      "rule_id": "M1-S12-PRO-vs-Medela",
      "enabled": true,
      "our_sku": "S12-PRO",
      "competitor": "Medela Pump In Style",
      "marketplace": "amazon_us",
      "threshold_pct": 5.0,
      "track_type": "our_price_vs_competitor",
      "compare_mode": "percentage",
      "action_on_alert": "notify_only"
    },
    {
      "rule_id": "M2-SEAMLESS-vs-KB",
      "enabled": true,
      "our_sku": "SEAMLESS-BRA",
      "competitor": "Kindred Bravely Simply Sublime",
      "marketplace": "amazon_us",
      "threshold_pct": 10.0,
      "track_type": "both",
      "compare_mode": "percentage",
      "action_on_alert": "review"
    }
  ]
}
```

### 2. 竞品价格变化告警（JSON 载荷）

价格变化告警的标准化 JSON 载荷：

```json
{
  "alert_id": "alert-20260504-001",
  "alert_type": "competitor_price_drop",
  "generated_at": "2026-05-04T14:30:00Z",
  "rule_id": "M1-S12-PRO-vs-Medela",
  "our_sku": "S12-PRO",
  "our_current_price": 169.99,
  "competitor": "Medela Pump In Style",
  "competitor_previous_price": 199.99,
  "competitor_current_price": 179.99,
  "change_pct": -10.0,
  "change_amount": -20.00,
  "price_gap_before": 30.00,
  "price_gap_now": 10.00,
  "severity": "high",
  "time_since_last_change_days": 14,
  "marketplace": "amazon_us",
  "product_url": "https://amazon.com/dp/B0XXXXXX",
  "recommended_actions": [
    {"action": "review_pricing", "priority": "high"},
    {"action": "check_ad_spend_on_this_competitor_term", "priority": "medium"},
    {"action": "consider_bundle_or_promotion_to_maintain_perceived_value", "priority": "low"}
  ],
  "tags": ["breast_pump", "price_war_risk", "monitoring_upgrade"]
}
```

告警级别定义：

| 级别 | 价格变化范围 | 响应时间 |
|------|-------------|---------|
| critical | 竞品降价 >20% 或价格倒挂 | 1小时内响应 |
| high | 竞品降价 10-20% | 4小时内响应 |
| medium | 竞品降价 5-10% | 24小时内分析 |
| low | 竞品降价 <5% | 周度报告关注 |

### 3. 价格弹性估算

基于历史价格变化与销量变化估算价格弹性的方法：

```json
{
  "price_elasticity_estimation": {
    "method": "log_log_regression",
    "data_window": "last_90_days",
    "confidence_level": 0.95,
    "results": [
      {
        "sku": "S12-PRO",
        "marketplace": "amazon_us",
        "elasticity_coefficient": -1.2,
        "interpretation": "弹性充足，降价10%约可提升12%销量",
        "r_squared": 0.72,
        "sample_size": 85,
        "revenue_optimal_price": 159.99,
        "current_price": 169.99,
        "current_price_relative_to_optimal": "above_optimal",
        "estimated_revenue_upside_pct": 8.5
      },
      {
        "sku": "SEAMLESS-BRA",
        "marketplace": "amazon_us",
        "elasticity_coefficient": -0.6,
        "interpretation": "弹性不足（品牌忠诚度高），降价效果有限",
        "r_squared": 0.45,
        "sample_size": 120,
        "revenue_optimal_price": 39.99,
        "current_price": 36.99,
        "current_price_relative_to_optimal": "below_optimal",
        "estimated_revenue_upside_pct": 3.2
      }
    ]
  }
}
```

### 4. 促销策略推荐

基于竞争分析和弹性估算的促销策略推荐：

```json
{
  "promotion_recommendations": [
    {
      "sku": "S12-PRO",
      "current_price": 169.99,
      "optimal_price": 159.99,
      "recommended_promotion": "lightning_deal_15pct_off_48h",
      "discount_pct": 15,
      "discount_price": 144.49,
      "estimated_volume_lift": 40,
      "estimated_revenue_impact": 18.5,
      "estimated_profit_impact": -5.2,
      "timing": "Next Prime Day or Mother's Day",
      "competitor_trigger": "Medela price action >10% drop",
      "risk_level": "medium",
      "alternative": "bundle_deal_S12_Pro_with_accessories"
    },
    {
      "sku": "SEAMLESS-BRA",
      "current_price": 36.99,
      "optimal_price": 39.99,
      "recommended_promotion": "no_discount_upsell_bundle",
      "discount_pct": 0,
      "estimated_volume_lift": 5,
      "estimated_revenue_impact": 8.1,
      "estimated_profit_impact": 8.1,
      "timing": "Immediate - price is below optimal",
      "competitor_trigger": null,
      "risk_level": "low",
      "alternative": "buy_2_get_10pct_off_pack"
    }
  ]
}
```

### 5. 与 data-to-strategy-bridge 的输出接口定义

本 skill 输出到 `data-to-strategy-bridge` 的标准接口格式：

```json
{
  "output_to_data_strategy_bridge": {
    "source_skill": "competitor-price-analysis",
    "version": "2.0.0",
    "payload_type": "pricing_intelligence",
    "timestamp": "2026-05-04T14:30:00Z",
    "marketplace_scope": ["amazon_us", "amazon_de", "tiktok_shop"],
    "content": {
      "key_findings": [
        "Medela 在 US 市场降价 10%，S12 Pro 价格优势从 $30 缩小到 $10",
        "Seamless Bra 价格弹性仅 -0.6，当前定价低于最优价格点 $39.99",
        "M5 品类暂无强力竞品，定价空间充裕",
        "TikTok Shop 价格竞争度低于 Amazon，平均溢价空间 +15%"
      ],
      "recommended_strategies": [
        {
          "priority": 1,
          "strategy": "S12 Pro 维持 $169.99 不降价，加强 Bundle 价值包装",
          "expected_impact": "利润保护 + 感知价值提升",
          "data_driven_by": "价格弹性 -1.2，收入最优点在 $159.99，可承受小幅竞品降价"
        },
        {
          "priority": 2,
          "strategy": "Seamless Bra 提价至 $39.99，配合 '升级版' 内容营销",
          "expected_impact": "+8% 收入、+8% 利润",
          "data_driven_by": "品牌忠诚度高，弹性仅 -0.6，当前定价低于最优"
        }
      ],
      "risk_flags": [
        {"level": "high", "item": "S12 Pro 在 Amazon 进入价格战边缘，需 24h 监控"},
        {"level": "medium", "item": "TikTok Shop 竞品即将入场（3 家新品牌申请入驻）"}
      ],
      "follow_up_actions": [
        "data-to-strategy-bridge: 将定价策略输出到季度经营策略报告",
        "ecom-daily-report: 在日报中增加 S12 Pro 价格战监控看板",
        "ecom-inventory-forecaster: 根据促销计划调整库存水位"
      ]
    }
  }
}
```

## Usage

### 一句调用示例

```
用 competitor-price-analysis 监控 Momcozy S12 Pro 在 Amazon US 上的竞品价格，设置 Medela 价差阈值 5%，每 4 小时扫描一次，变化 >10% 时发 Slack 告警。
```

### 价格弹性分析示例

```
用 competitor-price-analysis 做 S12 Pro 在 Amazon US 的价格弹性估算，数据窗口 90 天，输出促销策略推荐。
```

## 后续推荐改良方向

1. **AI 动态定价** — 基于实时竞品价格、库存水位、需求预测自动调整价格
2. **竞品行为预测** — 基于历史降价模式预测竞品价格变动
3. **跨市场价格联动** — Amazon US 降价是否应联动 Amazon DE/UK
4. **渠道冲突检测** — 检测 TikTok Shop 与 Amazon 之间的价格倒挂
5. **MAP 违规自动发现** — 检测渠道卖家是否低于 MAP 报价
6. **价格与广告联动** — 价格调整时自动调节 ACOS 目标/TikTok 出价
