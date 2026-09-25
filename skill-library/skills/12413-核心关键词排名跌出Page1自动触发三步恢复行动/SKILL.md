---
name: "p2s-search-rank-recovery-auto-action"
title: "Search-Rank-Recovery-Auto-Action — 核心关键词排名跌出Page1自动触发三步恢复行动"
description: "触发词：排名跌出恢复、Page1 阈值、排名分级、恢复行动清单、Top of Search 出价。何时不用：要做的是竞品词缺口挖掘而非已排名词的恢复时用「竞品关键词缺口分析」；要判断的是 Listing 被算法压制时用「Listing 压制检测」。安全边界：只产出分级恢复行动与出价建议，实际改标题与建广告须人工或工具执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Search-Rank-Recovery-Auto-Action"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "核心词一跌出第一页就分级报警，并给出修复标题、补后端词、抬广告出价这套恢复动作。"
user_try: "试试：检查这几个核心词的排名，谁跌出了第一页就按严重度给我三步恢复方案。"
whenToUse: "当核心关键词自然排名跌出 Page1、需要按跌幅分级并给出恢复行动时用本技能；若要找的是竞品有而自己没有的词，用「竞品关键词缺口分析」；若要判断的是 Listing 被平台压制，用「Listing 压制检测」。"
workflow: "采集关键词每日排名、昨日排名与当前出价 → 按 Page1 阈值判定跌出并分级 → 排查标题、后端词与索引根因 → 生成三步恢复行动并跟踪效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Search-Rank-Recovery-Auto-Action — 核心关键词排名跌出Page1自动触发三步恢复行动

## ① 解决的问题

运营面临"核心关键词排名跌出Page1但未及时响应"——排名跌出自动触发三步恢复行动将排名恢复时间从14天缩短至5天，年化保护自然流量价值50万元

## ② 核心算法逻辑

论文：RankDrop: RealTime Search Rank Anomaly Detection and Recovery in ECommerce | 年份：2021

## ③ 业务应用场景

场景：「electric breast pump」核心词排名暴跌 - 触发条件：ASIN B0PUMP01 在「electric breast pump」自然排名从 第8位 → 第34位（跌出Page1，中度） - 根因排查：竞品新上线（BSR 上升）+ Listing 标题关键词被更新时遗漏主词 - 三步行动： - Step 1：修复标题（加回「electric breast pump」）+ 后端 Search Terms 补全 - Step 2：创建 SP 广告活动「electric breast pump Exact Match」，Top of Search 出价 $3.50 - Ste
三轨验证 | 成本轨：月均成本1200元（A9算法数据分析工具800元/月+人工优化12小时/月×50元/小时=400元），首期投入3000元（系统集成+培训） | 合规轨：符合亚马逊A9搜索优化政策，关键词堆砌、虚假销量刷单等黑帽手法违规；建议采用白帽优化（listing优化、真实review、合规广告投放），合规率98%+ | 风险轨：①算法更新导致排名波动（概率35%，影响期2-4周）②竞品恶意举报listing（概率15%，可通过合规审查规避）③流量虽增但转化率未提升导致ROI下降（概率25%，需配套转化率优化）
**三轨验证** | 成本轨：月均成本2800元（专业A9优化团队外包1500元/月+关键词研究工具600元/月+内容创作300元/月+监测系统400元/月），首期投入8000元（竞品分析报告+策略制定） | 合规轨：完全符合亚马逊品牌备案政策和跨境电商合规要求，需提供产品资质证书（母婴类需CCC认证、检测报告），合规率99.5% | 风险轨：①母婴产品政策严格，不当表述导致listing被下架（概率8%，需专业审核）②跨境物流延迟影响销量维持（概率20%，需库存预警机制）③汇率波动影响成本结构（概率40%，但属可控风险）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：核心词跌出Page1流量损失约60%，快速恢复保护周均GMV $8,500；恢复广告投入约$350，ROI 24:1
实施难度：⭐⭐⭐☆☆（需关键词排名追踪工具 + 广告 API + Listing 编辑权限）
优先级：⭐⭐⭐⭐⭐（搜索排名是自然流量的核心，跌出Page1直接影响80%自然订单）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime, timedelta

def search_rank_recovery_auto_action(
    keyword_rankings: List[Dict],
    now: Optional[datetime] = None,
    page1_threshold: int = 16,
    light_threshold: int = 30,
    medium_threshold: int = 60,
    top_of_search_bid_multiplier: float = 1.5
) -> Dict:
    """
    搜索排名跌出Page1自动恢复触发器
    
    参数:
        keyword_rankings: [{
            "asin": str, "keyword": str,
            "rank_today": int, "rank_yesterday": int,
            "current_bid": float,
            "listing_has_keyword_in_title": bool,
            "listing_has_keyword_in_backend": bool,
            "indexed": bool  # 是否被Amazon索引
        }]
        page1_threshold: Page1阈值（默认第16位）
        top_of_search_bid_multiplier: Top of Search出价倍数
    
    返回:
        {"actions": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    actions = []
    
    for kw_rank in keyword_rankings:
        asin = kw_rank["asin"]
        keyword = kw_rank["keyword"]
        rank_today = kw_rank.get("rank_today", 999)
        rank_yesterday = kw_rank.get("rank_yesterday", 999)
        current_bid = kw_rank.get("current_bid", 1.5)
        title_has_kw = kw_rank.get("listing_has_keyword_in_title", True)
        backend_has_kw = kw_rank.get("listing_has_keyword_in_backend", True)
        indexed = kw_rank.get("indexed", True)
        
        # 检查是否跌出 Page1（今日排名 > 16 且昨日排名 ≤ 16）
        dropped_out = rank_today > page1_threshold and rank_yesterday <= page1_threshold
        
        if not dropped_out:
            actions.append({
                "asin": asin, "keyword": keyword,
                "action": "NO_ACTION",
                "rank_today": rank_today,
                "rank_change": rank_today - rank_yesterday,
                "reason": "排名未跌出Page1" if rank_today <= page1_threshold else "昨日已不在Page1"
            })
            continue
        
        rank_drop = rank_today - rank_yesterday
        
        # 确定严重程度
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04554，但该号在 arXiv 上是《A Survey of Transformers》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《RankDrop: RealTime Search Rank Anomaly Detection and Recovery in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词排名序列（asin、keyword、今日排名、昨日排名、当前出价）、Listing 状态（标题是否含主词、后端 Search Terms 是否含主词、是否被索引）；粒度为 ASIN × 关键词 × 日。

**输出**：按严重度分级（轻/中/重）的恢复行动清单（修复标题与后端词、建 Exact Match 广告、Top of Search 出价建议）与每词处置状态统计；供搜索运营与广告投放执行。

## 执行步骤

1. 采集核心关键词的每日排名、昨日排名与当前出价
2. 用 Page1 阈值（卡页为第 16 位）判定是否跌出，并按跌幅分级（轻/中/重）
3. 排查根因：标题是否漏主词、后端 Search Terms 是否缺词、是否未被索引
4. 生成三步恢复行动：修复标题与后端词、建 SP Exact Match 广告、按倍数抬高 Top of Search 出价
5. 跟踪恢复周期与自然流量、GMV 变化

## 边界与不做

- 数据不满足：没有每日排名历史时无法区分跌出与本就不在，也定不出严重度，先接排名追踪数据。
- 何时不用：要做的是竞品词缺口挖掘而非已排名词的恢复，用「竞品关键词缺口分析」；要判断的是 Listing 被算法压制，用「Listing 压制检测」。
- 能力边界：只产出分级恢复行动与出价建议，改标题与建广告由人工或工具执行（卡页要求排名追踪工具 + 广告 API + Listing 编辑权限）；卡页的恢复时间 14 天→5 天、ROI 24:1 为案例口径。

## 技能关联

- **前置**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice
- **延伸**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster
- **可组合**：Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Search-Rank-Recovery-Auto-Action

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Rank-Recovery-Auto-Action`