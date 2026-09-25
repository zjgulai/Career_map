---
name: "p2s-long-tail-opportunity-auto-capture"
title: "Long-Tail-Opportunity-Auto-Capture — 新兴长尾词周搜索量激增自动创建定向广告组"
description: "触发词：长尾词、搜索量激增、自动建组、低竞争词、相关性门槛、抢占窗口。何时不用：关键词与品类相关性不足时不要为流量建组；关键词体系成熟且增长平稳时不必自动捕获。安全边界：关键词投放需符合平台搜索政策、避免堆砌，词库需设黑名单机制且不得使用违规手段抢排名。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Long-Tail-Opportunity-Auto-Capture"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新兴长尾词搜索量激增时自动建立定向广告组，抢在竞品前面占位。"
user_try: "试试：postpartum belly wrap 一周搜索量涨了 82%，帮我自动建个长尾词广告组。"
whenToUse: "监控到长尾词搜索量快速上升、竞争广告少且与品类相关时用本技能；相关性不足或词库无治理机制时不适用；常规关键词优化用关键词评分。"
workflow: "监控关键词搜索量的周环比变化 → 按增速、搜索量、竞品数与相关性分数过滤候选词 → 生成定向广告组与匹配方式 → 设定初始出价与探索期预算并上线 → 探索期后按转化表现决定转正或放弃"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Long-Tail-Opportunity-Auto-Capture — 新兴长尾词周搜索量激增自动创建定向广告组

## ① 解决的问题

运营面临"新兴长尾词机会被竞品抢先占据"——长尾词周增>50%自动创建定向广告组将新词抢占速度从7天缩短至24小时，年化多获流量价值25万元

## ② 核心算法逻辑

论文：Temporal Dynamics of LongTail Keywords in ECommerce Advertising | 年份：2020

## ③ 业务应用场景

场景：「postpartum recovery」相关搜索词爆发（产后恢复趋势） - 触发条件：关键词「postpartum belly wrap」周搜索量从 2,800 → 5,100（+82%），竞品广告 2 个，与产后护理品类相关性 85% - 执行动作： - 自动创建广告组「LT-Capture-postpartum-belly-wrap」 - Broad + Phrase 双匹配，初始出价 $0.85（行业均值 $1.05 × 0.8） - 每日预算 $20，持续 14 天 - 结果：14 天收集数据，CVR 3.2%（高于基准 2.5%），提升出价至 $1.30，转入正式广告组 - 
三轨验证 | 成本轨：长尾词挖掘API月均300元，A9算法分析工具月均500元，人工关键词审核12小时/月（约1200元），总月成本约2000元 | 合规轨：符合Amazon A9搜索政策，关键词优化遵循《反不正当竞争法》，数据存储于AWS中国区合规节点 | 风险轨：长尾词转化率波动性高（±25%），建议建立词库黑名单机制，每月更新一次算法模型，防止关键词堆砌被降权概率8%
**三轨验证** | 成本轨：自动化排名监测工具月均400元，竞品分析爬虫成本月均250元，数据标注外包8小时/周（约2000元/月），总月成本约2650元 | 合规轨：符合《电商法》第十七条关于搜索公正性规定，不涉及虚假宣传，用户数据采集已获隐私授权 | 风险轨：排名波动周期7-14天，存在流量断崖风险（历史案例下跌60%），建议建立多渠道流量备份方案，季度进行A/B测试验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：提前3周抢占新兴词流量，CPC $0.9 vs 成熟词 $2.5（节省64%），首月增量GMV $12,000；探索期预算 $560，ROI 21:1
实施难度：⭐⭐⭐☆☆（需关键词趋势 API + 竞争密度数据 + 广告平台写入 API）
优先级：⭐⭐⭐⭐☆（新兴词早期竞争低、获客成本低，是流量扩张的最优路径）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime, timedelta

def long_tail_opportunity_auto_capture(
    keywords: List[Dict],
    now: Optional[datetime] = None,
    growth_threshold: float = 0.50,      # 周增速触发阈值
    min_weekly_searches: int = 500,       # 最低搜索量
    max_competitors: int = 5,            # 最大竞品广告数
    min_relevance_score: float = 0.70,   # 最低相关性分数
    initial_bid_discount: float = 0.80,  # 初始出价 = 行业均值 × 折扣
    daily_budget: float = 20.0,         # 每日预算
    exploration_days: int = 14          # 探索期天数
) -> Dict:
    """
    新兴长尾词自动捕获触发器
    
    参数:
        keywords: [{
            "keyword": str,
            "weekly_searches_current": int,  # 本周搜索量
            "weekly_searches_prior": int,    # 上周搜索量
            "competitor_ad_count": int,
            "relevance_score": float,        # 与当前品类相关性（0-1）
            "industry_avg_cpc": float,
            "already_targeting": bool        # 是否已有广告组
        }]
    
    返回:
        {"campaigns": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    campaigns = []
    
    for kw in keywords:
        keyword = kw["keyword"]
        searches_current = kw.get("weekly_searches_current", 0)
        searches_prior = max(kw.get("weekly_searches_prior", 1), 1)
        competitor_ads = kw.get("competitor_ad_count", 99)
        relevance = kw.get("relevance_score", 0.0)
        avg_cpc = kw.get("industry_avg_cpc", 1.5)
        already_targeting = kw.get("already_targeting", False)
        
        # 已有广告组跳过
        if already_targeting:
            campaigns.append({"keyword": keyword, "action": "SKIP", "reason": "已有广告组在投放"})
            continue
        
        # 计算增速
        growth_rate = (searches_current - searches_prior) / searches_prior
        
        # 检查触发条件
        condition_growth = growth_rate >= growth_threshold
        condition_volume = searches_current >= min_weekly_searches
        condition_competition = competitor_ads <= max_competitors
        condition_relevance = relevance >= min_relevance_score
        
        if not (condition_growth and condition_volume and condition_relevance):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.04768，但该号在 arXiv 上是《Linformer: Self-Attention with Linear Complexity》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Temporal Dynamics of LongTail Keywords in ECommerce Advertising》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词的周搜索量（本周与上周）、竞品广告数量、与品类的相关性分数、行业均值 CPC，以及触发阈值与探索周期配置。

**输出**：触发判定结果、自动生成的广告组配置（匹配方式、初始出价、日预算、探索天数）、探索期结束后的转正或放弃建议；供运营快速抢占新词流量。

## 执行步骤

1. 监控关键词搜索量的周环比变化
2. 按增速、搜索量、竞品数与相关性分数过滤候选词
3. 生成定向广告组与匹配方式
4. 设定初始出价与探索期预算并上线
5. 探索期后按转化表现决定转正或放弃

## 边界与不做

- 何时不用：关键词与品类相关性不足、或只是短期噪声波动时不要建组，避免烧预算换无效流量。
- 能力边界：本技能产出候选词与广告组配置，不代替广告后台完成建组与投放。
- 合规边界：关键词投放需符合平台搜索政策、避免堆砌，词库需建立黑名单机制且不使用违规抢排名手段。

## 技能关联

- **前置**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action
- **延伸**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action
- **可组合**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action、Skill-Long-Tail-Opportunity-Auto-Capture

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Long-Tail-Opportunity-Auto-Capture`