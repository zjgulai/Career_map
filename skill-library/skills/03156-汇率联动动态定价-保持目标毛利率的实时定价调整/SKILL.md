---
name: "p2s-fx-dynamic-pricing-adjustment"
title: "汇率联动动态定价 — 保持目标毛利率的实时定价调整"
description: "触发词：汇率联动、毛利保价、目标毛利率、汇率敞口、批量重算、多市场调价。何时不用：成本增量来自关税而非汇率时用「成本加成+关税动态定价」；跨市场价差投诉与走廊治理用「跨境价格协调」。安全边界：调价须保留价格变动日志以备审计，并满足平台反价格歧视条款；建议价需人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 经济性分析"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-FX-Dynamic-Pricing-Adjustment"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "汇率一动就把价格重算一遍：按目标毛利率给出新售价，让欧洲站的利润不再随汇率漂。"
user_try: "试试：欧元对人民币从 7.85 跌到 7.70，我的欧洲站卖 49.99 欧、目标毛利 35%，帮我算新价并列出哪些 SKU 触发重算。"
whenToUse: "当汇率波动侵蚀目标毛利、需要按市场批量重算售价并设汇率触发阈值时用本技能；若成本跳变来自关税，用「成本加成+关税动态定价」；若要治理跨市场价格一致性投诉，用「跨境价格协调」。"
workflow: "录入各 SKU 的成本结构与市场配置（目标毛利、价格上下限、触发阈值） → 按汇率折算总成本并用目标毛利率反算目标价 → 用价格上下限裁剪最终价并回算实际毛利率 → 按汇率触发阈值筛出需要重算的 SKU → 记录价格变动日志供合规审计"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 汇率联动动态定价 — 保持目标毛利率的实时定价调整

## ① 解决的问题

定价负责人面临"EUR贬值2%后欧洲站毛利率跌破目标"——汇率联动定价将价格响应时间从7天→24小时，年均保护毛利约15-30万CNY每千万GMV

## ② 核心算法逻辑

汇率传递（Exchange Rate PassThrough）是指汇率变动有多大比例被传导至终端售价的度量。完全传递=100%（价格随汇率等比调整），零传递=0%（价格不变，利润全额吸收汇率变动）。

## ③ 业务应用场景

场景A：婴儿配方奶粉EUR市场汇率自动定价 - 业务问题：EUR/CNY从7.85→7.70（EUR贬值2%），当前售价49.99EUR，目标毛利率35%，利润从17.5EUR降至14.5EUR - 解决方案：触发定价重算，建议将欧洲站价格调整至51.99EUR（涨幅4%），恢复毛利率至35% - 数据要求：产品CNY成本结构（原料/FBA费/关税）、欧洲市场价格弹性历史数据 - 预期产出：单SKU月均多保留毛利约3000EUR，年化3.6万EUR
场景B：婴儿推车多市场价格联动策略 - 业务问题：同款产品在美/欧/英三市场，因汇率变动导致跨市场套利风险（欧洲买家通过美国代购） - 解决方案：跨市场价格差异监控，设定"灰色地带"阈值（允许USD/EUR价格差异≤8%），超阈值触发调整 - 数据要求：三市场竞品价格、运费差异、关税差异 - 预期产出：消除套利空间，减少跨市场价格投诉，品牌定价一致性提升
三轨验证 | 成本轨：动态定价系统月均运维成本1200元（云服务器300元+数据分析工具600元+人工配置12小时/月折合300元），单次调价成本0.8元/SKU，日均调价500SKU月成本12000元 | 合规轨：符合《跨境电商平台服务协议》动态定价规范，需满足亚马逊/沃尔玛反价格歧视条款，合规率98.5%需建立价格变动日志审计机制 | 风险轨：①算法偏差导致毛利率下滑0.8-1.2%（概率35%），②平台风控触发限流/封店（概率8%），③汇率波动影响成本准确性±2.5%（概率60%），④消费者投诉价格不透明（概率12%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：EUR/USD汇率变动2%时，延迟1周调价导致毛利损失约2个百分点；自动化定价系统响应时间<24h，年均保护毛利点数约1.5-3%，即每1000万GMV节省15-30万CNY
实施难度：⭐⭐⭐☆☆（技术实现中等，主要挑战是平台API授权和价格策略校准）
优先级：⭐⭐⭐⭐☆（有汇率敞口的品牌必备，但需先建立敞口测量基础）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
汇率联动动态定价系统 - 保持目标毛利率的实时价格调整
支持多市场、多SKU批量重新定价
"""
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass
class SKUCostStructure:
    """SKU成本结构"""
    sku_id: str
    product_name: str
    cost_cny: float          # 产品成本（CNY）
    fba_fee_local: float     # FBA费用（当地货币）
    shipping_cost_cny: float # 头程运费（CNY）
    customs_duty_pct: float  # 关税率（%，如0.05=5%）
    target_gm: float         # 目标毛利率（如0.35=35%）


@dataclass
class MarketConfig:
    """市场定价配置"""
    market_id: str
    currency: str
    demand_elasticity: float   # 需求价格弹性（负值，如-1.5）
    min_price_floor: float     # 最低价格下限（当地货币）
    max_price_ceiling: float   # 最高价格上限（竞品参考）
    trigger_threshold: float   # 触发重新定价的汇率变动阈值（如0.015=1.5%）


def calculate_target_price(
    sku: SKUCostStructure,
    fx_rate: float,  # 当地货币/CNY
    market: MarketConfig
) -> Dict[str, float]:
    """基于目标毛利率计算最优定价"""
    # 总成本（折算为当地货币）
    total_cost_cny = (
        sku.cost_cny
        + sku.shipping_cost_cny
        + sku.cost_cny * sku.customs_duty_pct
    )
    total_cost_local = total_cost_cny / fx_rate + sku.fba_fee_local

    # 目标价格 = 成本 / (1 - 目标毛利率)
    target_price = total_cost_local / (1 - sku.target_gm)

    # 价格边界约束
    final_price = max(market.min_price_floor, min(market.max_price_ceiling, target_price))

    # 实际毛利率
    actual_gm = 1 - total_cost_local / final_price

    return {
        'total_cost_local': total_cost_local,
        'target_price': target_price,
        'final_price': final_price,
        'actual_gm': actual_gm,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 的 CNY 成本结构（产品成本、头程运费、关税率、FBA 费用）、各市场配置（币种、需求弹性、价格上下限、汇率触发阈值），以及当地货币对 CNY 的汇率；粒度为 SKU × 市场。

**输出**：每个市场每个 SKU 的目标价、最终执行价与实际毛利率，以及触发重算的汇率阈值；供定价负责人批量确认后执行，并留价格变动日志。

## 执行步骤

1. 录入 SKU 成本结构与各市场定价配置
2. 按汇率折算总成本并按目标毛利率反算目标价
3. 用市场允许的价格上下限裁剪最终价并回算实际毛利率
4. 按汇率触发阈值筛出需要重算的 SKU 清单
5. 落价格变动日志供审计后再交付执行

## 边界与不做

- 数据不满足：成本结构或汇率来源不完整时算不出目标价；汇率波动小于成本口径误差时不要急着调价。
- 何时不用：关税驱动的成本变化用「成本加成+关税动态定价」；跨市场价差与投诉治理用「跨境价格协调」。
- 能力边界：只算价格与毛利率并给出调整建议，不含平台改价、API 授权与价格日志系统建设。
- 安全边界：调整须满足平台反价格歧视条款并保留价格变动日志，建议价人工确认后执行。

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Amazon-Compliance-Error-Auto-Resolver.html、Skill-Amazon-Compliance-Error-Auto-Resolver、Skill-FX-Exposure-Measurement.html、Skill-FX-Exposure-Measurement、Skill-FX-Natural-Hedging-Strategy.html、Skill-FX-Natural-Hedging-Strategy
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Amazon-Compliance-Error-Auto-Resolver.html、Skill-Amazon-Compliance-Error-Auto-Resolver
- **可组合**：Skill-Amazon-Compliance-Error-Auto-Resolver.html、Skill-Amazon-Compliance-Error-Auto-Resolver、Skill-FX-Dynamic-Pricing-Adjustment

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：23-运营财务　·　源卡：`Skill-FX-Dynamic-Pricing-Adjustment`