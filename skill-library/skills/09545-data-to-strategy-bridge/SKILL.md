---
name: data-to-strategy-bridge
version: 1.0.0
description: >
  Data Agent 洞察→经营策略的桥接 skill。
  将 ecommerce-data-analyst 输出的数据分析结果（异常/趋势/归因）转换为可执行的经营策略。
  核心能力：异常→根因建议、趋势→机会/风险标记、归因→资源重分配建议、
  退货率+差评→产品改进+内容双轨建议、销售数据→库存+广告预算调整。
  这是 Data Agent 和经营决策层之间的标准接口层。
source: https://github.com/zjgulai/hermes-skills (cross-domain bridge skill)
---
# Data→Strategy Bridge 🧩

数据洞察到经营策略的结构化转换桥。

## Why This Exists

Data Agent 擅长回答"发生了什么"——销量涨了、退货率高了、ACoS 异常了。
但团队需要的是"接下来该做什么"——调整预算、优化 listing、补货、更新内容。

中间缺一个**从数据到决策的转换层**。这就是这个 bridge 的使命。

## 输入输出 Schema

### 输入（来自 ecommerce-data-analyst 的输出）

```json
{
  "report_type": "weekly|monthly|alert",
  "period": "string (e.g. 2026-W18)",
  "overall": {
    "revenue": "number",
    "mom": "string (e.g. +12%)",
    "yoy": "string (e.g. +34%)"
  },
  "anomalies": [
    {
      "product": "string",
      "metric": "return_rate|revenue|acos|units",
      "value": "number",
      "threshold": "number",
      "severity": "P0|P1|P2|P3"
    }
  ],
  "top_products": [
    {
      "sku": "string",
      "revenue": "number",
      "mom": "string (e.g. +8%)",
      "alert": "string|null"
    }
  ],
  "channel_breakdown": {
    "{channel}": {
      "revenue": "number",
      "share": "number",
      "acos": "number (optional)"
    }
  },
  "attribution": {
    "{channel_or_method}": "number (0-1, sum ≈ 1.0)"
  },
  "strategy_input": {
    "urgent_actions": ["string"],
    "opportunity_areas": ["string"],
    "content_priorities": ["string"]
  }
}
```

### 输出（本 bridge 的产出）

```json
{
  "strategy_period": "string",
  "assessment": "overall_healthy|needs_attention|crisis",
  "department_actions": {
    "content_team": {
      "P0": [{"action": "string", "product": "string", "reason": "string"}],
      "P1": [{"action": "string", "product": "string", "reason": "string"}]
    },
    "advertising_team": {
      "immediate": [{"action": "string", "market": "string", "current_acos|metric": "number|null", "target": "number|null", "method": "string"}]
    },
    "product_team": {
      "investigate": [{"product": "string", "signal": "string", "correlation": "string"}]
    },
    "inventory_team": {
      "review": [{"sku": "string", "current_stock_days": "number|null", "recommendation": "string"}]
    }
  },
  "budget_reallocation": {
    "increase": [{"channel": "string", "amount": "string (e.g. +20%)", "rationale": "string"}],
    "decrease": [{"channel": "string", "amount": "string (e.g. -10%)", "rationale": "string"}]
  },
  "cross_reference": {
    "source_skill": "ecommerce-data-analyst",
    "source_period": "string",
    "trigger_timestamp": "ISO8601 timestamp"
  }
}
```

## 转换流程

### Step 1: 接收 Data Agent 输出

```python
# 来自 ecommerce-data-analyst 的输出
data_output = {
    "report_type": "weekly",
    "period": "2026-W18",
    "anomalies": [
        {"product": "S12 Pro", "metric": "return_rate", "value": 6.2, "threshold": 5.0, "severity": "P1"},
        {"product": "M5", "metric": "revenue", "value": -15, "threshold": -10, "severity": "P2", "direction": "mom"}
    ],
    "channel_breakdown": {
        "amazon_na": {"acos": 18.2, "revenue": 210000, "trend": "+5% mom"},
        "amazon_de": {"acos": 22.1, "revenue": 85000, "trend": "+8% mom"},
        "tiktok_shop": {"acos": 15.3, "revenue": 62000, "trend": "+22% mom"}
    },
    "attribution": {
        "amazon_organic": 0.42,
        "tiktok_daraz": 0.15,
        "influencer_commission": 0.12
    },
    "strategy_input": {
        "urgent_actions": ["检查 M5 连续 3 周下滑"],
        "opportunity_areas": ["TikTok 转化效率超 Amazon"],
        "content_priorities": ["S12 Pro 安全认证内容以降低退货"]
    }
}
```

### Step 2: 生成经营策略

```json
{
  "strategy_period": "2026-W18",
  "assessment": "overall_healthy|needs_attention|crisis",
  "department_actions": {
    "content_team": {
      "P0": [
        {"action": "create_safety_explainer", "product": "S12 Pro", "reason": "退货率 6.2% 中的 40% 提及安全顾虑"}
      ],
      "P1": [
        {"action": "update_listing_imagery", "product": "M5", "reason": "连续 3 周下滑，需要更新视觉素材"},
        {"action": "create_tiktok_highlight", "product": "S12 Pro", "reason": "TikTok 转化效率比 Amazon 高 7%，加大投入"}
      ]
    },
    "advertising_team": {
      "immediate": [
        {"action": "optimize_acos", "market": "Amazon DE", "current_acos": 22.1, "target": 18.0, "method": "否定无效关键词+调整竞价"}
      ]
    },
    "product_team": {
      "investigate": [
        {"product": "S12 Pro", "signal": "return_rate_anomaly", "correlation": "50% 退货评论提到'吸力不足'"},
        {"product": "M5", "signal": "revenue_decline_3w", "correlation": "同期 Amazon DE 竞品降价 12%"}
      ]
    },
    "inventory_team": {
      "review": [
        {"sku": "S12 Pro", "current_stock_days": 45, "recommendation": "正常维持"},
        {"sku": "M5", "current_stock_days": 62, "recommendation": "下调补货预期，关注下滑趋势"}
      ]
    }
  },
  "budget_reallocation": {
    "increase": [{"channel": "TikTok Shop", "amount": "+20%", "rationale": "转化率+22% mom vs 其他渠道+5-8%"}],
    "decrease": [{"channel": "Amazon DE", "amount": "-10%", "rationale": "ACoS 22.1% 偏高，先优化再放量"}],
    "shift_from": "Amazon DE ad budget",
    "shift_to": "TiKTok Shop content + ads"
  },
  "cross_reference": {
    "source_skill": "ecommerce-data-analyst",
    "source_period": "2026-W18",
    "trigger_timestamp": "2026-05-04T09:00:00Z"
  }
}
```

### Step 3: 分发到各执行通道

输出 department_actions 可直接通过以下通道下发：
- content_team 的 action → voc-to-content-bridge → 内容 pipeline
- advertising_team 的 action → 广告平台操作指南
- product_team 的 action → 产品改进工单
- inventory_team 的 action → 采购系统建议
- budget_reallocation → 财务审批流程

## 转换规则（确定性的映射逻辑）

| 数据信号 | 转换策略 | 示例 |
|---------|---------|------|
| 退货率超阈（P0/P1） | 内容+产品双轨：内容做安全解释视频，产品调查根因 | 退货率 6.2% → content: 安全认证视频 + product: 吸力调查 |
| 单一产品连续下滑超阈值 | 系统排查：广告→listing→评论→竞品→库存 | M5 -15% → 检查 Amazon DE 竞品降价、广告调整 |
| 某渠道转化率飙升 | 加大资源投入，在其他渠道复用策略 | TikTok +22% → 增加 TikTok 内容投入 |
| ACoS 偏高 | 先优化（否定关键词/调整竞价），再考虑削减预算 | DE ACoS 22% → 第一步：否定无效词，第二步：-10% 预算 |
| 归因发现某渠道占比大 | 评估该渠道健康度，考虑分散风险 | Amazon organic 42% 集中 → 加大 TikTok/Shopify 分散风险 |
| 多产品同时异常 | 排除系统性原因（平台算法变化/行业事件/旺季） | 全产品线 +3% → 判断为旺季正常波动 |

## 一句话调用

> "把上周数据报告转成各部门的行动清单和预算调整建议"

## 后续推荐改良方向

1. **执行追踪**：action 下发后需要追踪"是否执行""执行效果如何"，形成数据→决策→执行→反馈的闭环
2. **自动预算调整**：当前输出"建议"，后续可对接 API 实现自动预算调整（需风控审批）
3. **多期对比**：当前只处理一期数据，后续可对比多期决策效果，优化转换规则本身
4. **部门级定制**：不同业务线/市场的转换规则可能有差异（如 DE 市场需要更激进的 ACoS 策略）

## Usage

> "上周数据出来了，给我整一份各部门行动清单"
> "S12 Pro 退货率异常，帮我分析根因并生成应对策略"
> "TikTok 转化率很好，帮我做一份预算重新分配方案"
