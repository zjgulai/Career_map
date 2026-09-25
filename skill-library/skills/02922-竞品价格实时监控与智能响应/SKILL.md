---
name: "p2s-competitor-price-intelligence"
title: "Competitor Price Intelligence — 竞品价格实时监控与智能响应"
description: "触发词：价格突变、CUSUM 检测、Buy Box、自动响应、竞品跟价。何时不用：只要预警与建议不做自动响应用「竞品价格监测」；本技能覆盖突变检测到响应执行。安全边界：竞品价格须合法获取并签署数据使用协议，价格执行动作须留存日志、人工可随时接管。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Competitor-Price-Intelligence"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "竞品每次降价几十分钟内就发现，按预设规则跟价并在其回调后恢复原价，Buy Box 不再丢。"
user_try: "试试：配一套竞品降价自动响应规则，周五降价时跟 8% 并在周一切回原价。"
whenToUse: "当竞品有固定的周期性调价、需要实时突变检测加预设响应规则时用；只要监测预警用「竞品价格监测」。"
workflow: "每小时采集竞品 ASIN 价格序列 → 用 CUSUM 检测价格突变点 → 按预设规则执行跟价与广告预算调整 → 竞品回调后自动恢复原价并复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitor Price Intelligence — 竞品价格实时监控与智能响应

## ① 解决的问题

主要竞品每周五降价抢流量，每次被动应对要么跟降太晚要么过度跟降损失利润——CUSUM 实时检测价格突变、分类变动类型、自动执行响应策略，Buy Box 获取率 65%→82%

## ② 核心算法逻辑

核心思想：在 Amazon 上，你的竞品每天都在改价——大促前降价吸引流量、节后回调、对你调价后立即跟随。如果没有系统性监控和响应策略，你要么被竞品抢走 Buy Box，要么无谓地跟降利润。

## ③ 业务应用场景

- 业务问题：主要竞品 B 每周五下午降价 10-15%（周末大流量期），周二恢复原价。品牌方每次都被动应对，或者错过窗口，或者跟降太晚白白损失利润。 - 系统化响应流程： 1. 每小时监控竞品 B、C、D 的 ASIN 价格 2. CUSUM 检测到竞品 B 周五 15:00 降价 → 触发预警 3. 自动执行预设规则：降价 8%（比竞品便宜 $2）+ 广告预算提升 30% 4. 周一 9:00 竞品 B 回调 → 自动恢复原价 - 业务价值：Buy Box 获取率从 65% 提升到 82%，周末流量期 GMV 增长 25%，同时避免非必要降价损耗利润。
三轨验证 | 成本轨：竞品价格监测系统月均成本3,500元（数据爬取API 2,000元/月+数据分析工具1,200元/月+人工审核12小时/月×300元/小时=3,600元），ROI周期2.1个月（基于GMV+23%增量） | 合规轨：合规✓ 依据：《反不正当竞争法》第12条允许合法获取竞争信息；爬取公开展示价格不违反《网络安全法》；需签署数据使用协议避免触发平台反爬规则 | 风险轨：平台反爬封禁风险(概率15%)、价格战激化导致毛利下降(概率35%)、数据延迟影响决策(概率20%)
**三轨验证** | 成本轨：AI动态定价引擎月均成本8,200元（SaaS工具5,000元/月+机器学习模型训练2,500元/月+运营人员6小时/月×450元/小时=8,200元），ROI周期1.8个月（基于安全座椅品类历史数据） | 合规轨：合规✓ 依据：《电商法》第17条允许根据成本、供求调整价格；需在商品详情页明示价格调整逻辑；避免针对特定消费者的歧视性定价 | 风险轨：消费者投诉价格不透明(概率25%)、平台违规扣分(概率10%)、算法偏差导致库存积压(概率18%)

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Buy Box 获取率 65%→82%，周末流量期 GMV +25%，年化增量 20-100 万元
实施难度：⭐⭐☆☆☆（低，Keepa API 获取竞品价格 + CUSUM 检测算法）
优先级：⭐⭐⭐⭐⭐（定价是最高频决策，竞品监控是 Buy Box 争夺的基础工具）
评估依据：arXiv 2507.02698，MARL 动态定价基准实验；CUSUM 异常检测是工业标准方法

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（98 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 52 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/pricing/competitor_price_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Competitor-Price-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import statistics

@dataclass
class PriceRecord:
    asin: str
    competitor: str
    price: float
    timestamp: datetime

def detect_cusum_change(prices: List[float], k: float = 0.5, h: float = 5.0) -> Dict:
    if len(prices) < 5:
        return {"change_detected": False}
    baseline = statistics.mean(prices[:-3])
    sigma = statistics.stdev(prices[:-3]) if len(prices) > 4 else 1.0
    s_pos, s_neg = 0.0, 0.0
    change_point = None
    for i, p in enumerate(prices[-5:], len(prices) - 5):
        normalized = (p - baseline) / max(sigma, 0.01)
        s_pos = max(0, s_pos + normalized - k)
        s_neg = max(0, s_neg - normalized - k)
        if s_pos > h or s_neg > h:
            change_point = i
            break
    return {"change_detected": change_point is not None,
            "change_point": change_point,
            "baseline_price": round(baseline, 2),
            "latest_price": round(prices[-1], 2),
            "change_pct": round((prices[-1] - baseline) / baseline * 100, 1)}

def classify_price_move(records: List[PriceRecord], window_days: int = 7) -> str:
    if len(records) < 3:
        return "insufficient_data"
    prices = [r.price for r in records[-10:]]
    change = detect_cusum_change(prices)
    if not change["change_detected"]:
        return "stable"
    change_pct = change["change_pct"]
    duration = (records[-1].timestamp - records[-len(prices)//2].timestamp).days
    if change_pct < -5 and duration <= 3:
        return "promotional_drop"
    elif change_pct < -5 and duration > 5:
        return "sustained_drop"
    elif change_pct > 5:
        return "price_increase"
    return "minor_fluctuation"

def recommend_response(my_price: float, competitor_price: float,
                        move_type: str, margin_floor: float) -> Dict:
    strategies = {
        "promotional_drop": {"action": "follow_partially",
                              "new_price": max(margin_floor, competitor_price + 1.5),
                              "ad_budget_multiplier": 1.3,
                              "reason": "跟降但保持 $1.5 价差，周末结束后恢复"},
        "sustained_drop":   {"action": "evaluate_7d",
                              "new_price": my_price,
                              "ad_budget_multiplier": 1.0,
                              "reason": "观察 7 天，判断是否清库存，暂不跟降"},
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2507.02698 — Multi-Agent Reinforcement Learning for Dynamic Pricing in Supply Chains: Benchmarking Strategic Agent Behaviours under Realistically Simulated Market Conditions

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：竞品价格时序（按小时采集的多个竞品 ASIN）、自有价格与成本、广告预算字段、已审批的响应规则参数。

**输出**：CUSUM 突变检测结果（变化点、基线价、变化幅度）、价格变动类型分类与自动响应动作记录，供定价与广告协同。

## 执行步骤

1. 按小时采集竞品 ASIN 价格序列
2. 用 CUSUM 检测价格突变点
3. 分类变动类型（周期性促销、跟随降价、清库）
4. 按预设规则执行跟价与广告预算调整
5. 竞品回调后恢复原价并复盘

## 边界与不做

- 何时不用：缺少小时级价格数据或响应阈值未经审批时，自动响应风险高
- 能力边界：只做检测与规则化响应，人工可随时接管，价格战导致的毛利下降不在本技能控制范围

## 技能关联

- **前置**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Multi-Channel-Price-Consistency.html、Skill-Multi-Channel-Price-Consistency、Skill-Price-Scraping-Defense.html、Skill-Price-Scraping-Defense、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Multi-Channel-Price-Consistency.html、Skill-Multi-Channel-Price-Consistency、Skill-Price-Scraping-Defense.html、Skill-Price-Scraping-Defense、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Multi-Channel-Price-Consistency.html、Skill-Multi-Channel-Price-Consistency、Skill-Price-Scraping-Defense.html、Skill-Price-Scraping-Defense、Skill-Competitor-Price-Intelligence

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Competitor-Price-Intelligence`