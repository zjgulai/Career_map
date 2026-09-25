---
name: "p2s-keyword-bid-auto-adjuster"
title: "Keyword-Bid-Auto-Adjuster — 关键词转化率偏差自动调整出价"
description: "触发词：关键词出价、转化率偏差、显著性检验、调价冷却期、单次变动上限。何时不用：点击量不足最小样本时不调价；需要按词类型整体切换出价逻辑时走生成式竞价MoE。安全边界：单次调价不超过30%并设出价上限与最低出价，调价逻辑须符合平台竞价政策并留存审计日志。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Keyword-Bid-Auto-Adjuster"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "关键词转化率显著高于或低于基准时自动上调或下调出价，带统计检验与冷却期保护。"
user_try: "试试：帮我按近7天转化率对这批关键词调价，高于基准的上调15%、低于基准的下调20%，要带显著性检验。"
whenToUse: "当已有近 7 天关键词点击与转化计数、并希望用统计显著性而非人工直觉调价时用本卡；需要按关键词类型整体切换出价逻辑时用生成式竞价 MoE；渠道级预算腾挪用再分配触发器。"
workflow: "汇总各关键词近 7 天点击、转化与基准 CVR → 按最小点击量门槛筛掉样本不足的词 → 做二项检验判断转化率偏差是否显著 → 显著偏高上调、显著偏低下调出价 → 受单次变动上限、最低出价与冷却期约束"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Keyword-Bid-Auto-Adjuster — 关键词转化率偏差自动调整出价

## ① 解决的问题

广告负责人面临"关键词出价调整滞后错失流量或浪费预算"——转化率自动触发±15/20%出价调整将整体广告ROI提升22%，年化增收40万元

## ② 核心算法逻辑

论文：RealTime Bidding with Statistical Significance Testing for KeywordLevel Bid Optimization | 年份：2021

## ③ 业务应用场景

场景：吸奶器品类关键词出价优化 - 高绩效触发：关键词「electric breast pump」近 7 天 CVR = 5.2%（基准 3.8%，超出 37%），点击 85 次 → 自动上调出价 +15%（$1.80 → $2.07） - 低绩效触发：关键词「breast pump parts」近 7 天 CVR = 0.9%（基准 2.8%，低 68%），点击 52 次 → 自动下调出价 -20%（$1.60 → $1.28） - 结果：30 天内广告组整体 ROAS 从 3.1 → 4.2，ACoS 从 32% → 24%，节省广告费 $2,800/月 - 年化价值：月均广告花费 $15
三轨验证 | 成本轨：月均运维成本约800元（API调用费用300元/月+人工配置调优8小时/月×100元/小时=500元），ROI周期2-3个月，年度成本9600元可产生约28800元ROAS增益 | 合规轨：符合《电商平台广告投放规范》和《跨境电商数据合规指南》，竞价调整逻辑需通过平台审核，不涉及虚假出价；建议补充广告投放日志留痕机制 | 风险轨：①算法偏差导致超预算风险（概率15%），需设置日均上限；②平台API变更导致适配失效（概率8%），需建立备选方案；③母婴品类政策敏感性高，竞价异常可能触发平台风控（概率12%）
**三轨验证** | 成本轨：初期投入成本1200元（系统集成开发4小时×200元/小时+数据标注20小时×50元/小时=1200元），月均维护成本600元（监控告警4小时+数据优化4小时），首月ROI突破点约2.5倍投入 | 合规轨：需获得跨境平台（如Amazon、Shopee）的广告API授权，符合各平台竞价政策；母婴产品需补充商品资质合规性检查，防止违规品类竞价；建议建立竞价决策审计日志 | 风险轨：①跨境多平台政策差异导致调整逻辑不兼容（概率18%），需按平台定制化；②汇率波动影响成本预算准确性（概率22%），需引入汇率风险对冲；③母婴品类高监管导致竞价被限制（概率10%），需预留人工

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：广告 ACoS 从 32% → 24%，月均广告花费 $15,000，年化增加利润 $14,400；每月节省人工调价时间 8h
实施难度：⭐⭐☆☆☆（需广告平台 API 读写 + 统计检验模块）
优先级：⭐⭐⭐⭐⭐（关键词出价是广告效率最直接的调节杠杆）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（189 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import math
from typing import Dict, List, Optional
from datetime import datetime

def binomial_test_pvalue(successes: int, trials: int, p0: float) -> float:
    """简化二项式检验（正态近似），返回双侧 p 值"""
    if trials == 0:
        return 1.0
    p_hat = successes / trials
    se = math.sqrt(p0 * (1 - p0) / trials)
    if se == 0:
        return 1.0
    z = abs(p_hat - p0) / se
    # 近似 p 值（标准正态分布双侧）
    pvalue = 2 * (1 - 0.5 * (1 + math.erf(z / math.sqrt(2))))
    return pvalue

def keyword_bid_auto_adjuster(
    keywords: List[Dict],
    now: Optional[datetime] = None,
    min_clicks: int = 30,
    high_cvr_threshold: float = 0.20,   # CVR 高于基准 20% 上调
    low_cvr_threshold: float = 0.30,    # CVR 低于基准 30% 下调
    bid_increase_pct: float = 0.15,     # 上调幅度
    bid_decrease_pct: float = 0.20,     # 下调幅度
    max_single_change_pct: float = 0.30,# 单次最大变动幅度
    min_bid: float = 0.30,              # 最低出价
    cooldown_hours: int = 48,
    stat_significance: float = 0.05
) -> Dict:
    """
    关键词出价自动调整执行器
    
    参数:
        keywords: [{
            "keyword_id": str, "keyword_text": str,
            "current_bid": float,
            "recent_clicks": int, "recent_conversions": int,  # 近7天数据
            "baseline_cvr": float,  # 历史基准 CVR
            "max_bid": float,       # 出价上限
            "last_adjusted_at": str | None  # ISO8601 上次调整时间
        }]
    
    返回:
        {"adjustments": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    adjustments = []
    
    for kw in keywords:
        kwid = kw["keyword_id"]
        kwtext = kw.get("keyword_text", kwid)
        current_bid = kw["current_bid"]
        clicks = kw.get("recent_clicks", 0)
        conversions = kw.get("recent_conversions", 0)
        baseline_cvr = kw.get("baseline_cvr", 0.03)
        max_bid = kw.get("max_bid", current_bid * 3)
        last_adjusted_at = kw.get("last_adjusted_at")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2105.12345，但该号在 arXiv 上是《Generalized Polya's theorem on connected locally compact Abelian groups of dimension 1》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《RealTime Bidding with Statistical Significance Testing for KeywordLevel Bid Optimization》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各关键词的当前出价、近 7 天点击与转化计数、历史基准 CVR、出价上限与上次调整时间，以及最小点击量（默认 30）、高低 CVR 阈值系数（默认 0.20 与 0.30）、调价幅度（默认上调 15%、下调 20%）、单次最大变动（默认 30%）、最低出价与冷却小时数（默认 48）。

**输出**：每个关键词的调整动作（上调、下调或不动、新出价与依据）与统计汇总（p 值、触发数量），供广告负责人审核后通过平台 API 落地。

## 执行步骤

1. 汇总各关键词近 7 天点击、转化与历史基准 CVR
2. 按最小点击量门槛过滤样本不足的关键词
3. 用二项检验计算转化率偏差的显著性
4. 对显著偏高或偏低的关键词计算新出价
5. 施加单次变动上限、最低出价与冷却期约束
6. 输出调整清单与统计汇总供人工审核

## 边界与不做

- 何时不用：近 7 天点击量低于最小样本门槛、或没有历史基准 CVR 时不调价；需要按词类型整体切换策略时改用生成式竞价技能。
- 能力边界：只产出调价清单与依据，不直接改账户出价；出价上限、最低出价与冷却期由使用者给定。
- 合规边界：竞价调整逻辑须符合各平台竞价政策并通过平台审核，不涉及虚假出价，建议保留调价审计日志。

## 技能关联

- **前置**：Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze、Skill-Search-Conversion-Rate-Predictor.html、Skill-Search-Conversion-Rate-Predictor
- **延伸**：Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze
- **可组合**：Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Keyword-Bid-Auto-Adjuster

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Keyword-Bid-Auto-Adjuster`