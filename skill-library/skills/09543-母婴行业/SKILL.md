---
name: cross-border-ecommerce
version: 2.0.0
description: Cross-border e-commerce expansion advisor for母婴跨境电商. v2.0 新增3个可执行子流程：市场可行性评分→认证合规检查表→物流方案成本对比。8维度市场评分、5种物流模式成本对比、16项认证对照表、税务合规指南。优化于Momcozy等母婴品牌。
source: https://github.com/nexscope-ai/eCommerce-Skills (upgraded v2.0)
---

# Cross-Border E-Commerce for母婴行业 ✈️

国际扩张战略顾问。v2.0 从分析框架升级为可执行工具。

## 3 个可执行子流程

### 子流程 A: 市场可行性评分

输入产品+目标市场，输出 8 维评分和综合排名：

```json
{
  "input": {
    "product": "S12 Pro Wearable Breast Pump",
    "price": 169.99,
    "target_markets": ["DE", "UK", "FR", "JP", "AU"]
  },
  "scoring_dimensions": [
    {"name": "market_size", "weight": 0.20},
    {"name": "ecommerce_penetration", "weight": 0.15},
    {"name": "competition", "weight": 0.15},
    {"name": "regulatory_complexity", "weight": 0.15},
    {"name": "logistics_infrastructure", "weight": 0.10},
    {"name": "payment_ecosystem", "weight": 0.10},
    {"name": "cultural_distance", "weight": 0.08},
    {"name": "ip_protection", "weight": 0.07}
  ],
  "output": [
    {"market": "DE", "score": 82, "rank": 1, "action": "enter_now", "risk": "CE认证耗时4-6周"},
    {"market": "UK", "score": 78, "rank": 2, "action": "enter_now", "risk": "UKCA标记"},
    {"market": "FR", "score": 72, "rank": 3, "action": "evaluate", "risk": "法语本地化"},
    {"market": "AU", "score": 65, "rank": 4, "action": "evaluate", "risk": "物流成本高"},
    {"market": "JP", "score": 58, "rank": 5, "action": "defer", "risk": "PSE认证复杂"}
  ],
  "decision": "优先德国+英国同步进入"
}
```

### 子流程 B: 认证合规检查表

```json
{
  "input": {"product":"S12 Pro","type":"electronic_medical_device","markets":["DE","UK","US","CA"],"origin":"China"},
  "certifications": [
    {"market":"DE","required":["CE(MDR)","RoHS","REACH","WEEE"],"cost_usd":15000,"weeks":6,"note":"MDR分类确认"},
    {"market":"UK","required":["UKCA","REACH(UK)","WEEE(UK)"],"cost_usd":12000,"weeks":5,"note":"UKCA过渡期至2027"},
    {"market":"US","required":["FDA 510(k)","FCC","CPSIA"],"cost_usd":25000,"weeks":12,"note":"已有FDA基础"},
    {"market":"CA","required":["Health Canada MDL","ICES-003","CCPSA"],"cost_usd":10000,"weeks":8,"note":"认可FDA加速"}
  ],
  "total_cost": 62000,
  "total_weeks": 16,
  "parallel": true,
  "path": "先启动EU-MDR，同步更新FDA"
}
```

### 子流程 C: 物流方案成本对比

```json
{
  "input": {"product":"S12 Pro","weight_kg":0.45,"dimensions":"20x15x10","unit_cost":60,"price":169.99,
            "monthly_volume":1500,"origin":"Shenzhen","market":"DE"},
  "options": [
    {"mode":"FBA EU","monthly_12mo":84500,"per_unit":4.69,"days":8,"pro":"Prime曝光","con":"仓储费高"},
    {"mode":"3PL DHL","monthly_12mo":72300,"per_unit":4.02,"days":5,"pro":"多通道分发","con":"无Prime标签"},
    {"mode":"Direct Ship","monthly_12mo":45200,"per_unit":2.51,"days":15,"pro":"最低成本","con":"配送慢"},
    {"mode":"Dropship","monthly_12mo":91000,"per_unit":5.06,"days":2,"pro":"零库存","con":"利润低"},
    {"mode":"海运+3PL","monthly_12mo":54800,"per_unit":3.04,"days":25,"pro":"航海运成本低","con":"初始库存压力"}
  ],
  "recommendation": "FBA 70% + Direct Ship 30% 混合",
  "breakeven": {"fba_min_volume":800,"current_volume":1500,"margin_vs_current":"+5.2%"}
}
```

## 核心 Capabilities

- 8 维度目标市场评分 + 综合排名
- 5 种物流模式 12 个月成本对比 + 盈亏平衡分析
- 国别税务合规指南（EU VAT/IOSS、UK VAT、US 销售税、CA GST、AU GST、JP 消费税）
- 16 项母婴产品认证对照表（CE/FDA/CPC/CCC/UKCA/REACH/RoHS/WEEE/CPSIA/EN71/ASTM/PSE）
- 本地支付方式映射 + 接受率
- 到岸成本计算器 + 利润率影响分析
- 知识产权保护策略
- 分阶段扩张路线图（里程碑/KPI/决策点）

## 输入输出

**输入**: `{product, price, weight, dimensions, target_markets, origin, monthly_volume}`

**输出**: `{market_scores[], certifications[], fulfillment_options[], recommendation, roadmap}`

## 一句话调用

> "评估 S12 Pro 进入德国市场的可行性：8 维评分、认证总成本、物流方案对比"

## 后续推荐改良方向

1. **历史数据反馈** — 每进入一个新市场后记录实际 vs 预估偏差，优化评分模型权重
2. **竞品进入路径分析** — 跟踪竞品进入了哪些市场、用了什么物流模式
3. **汇率波动预警** — 接入实时汇率 API，波动 > 5% 时推送预警
4. **产品类别细分化** — 细化到"可穿戴吸奶器"级别的认证要求
5. **自动化文件清单** — 输出认证文件模板和填报指南

## Usage

> "Momcozy S12 Pro 从 Amazon NA 拓展到德国+英国，做市场评分和认证检查"
> "对比 FBA 和 3PL 哪个更适合 M5 在法国市场"
> "做一份 S12 Pro 进入 5 个欧洲市场的合规成本预算"
