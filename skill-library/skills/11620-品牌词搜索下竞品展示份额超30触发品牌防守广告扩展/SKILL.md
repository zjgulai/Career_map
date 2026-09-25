---
name: "p2s-brand-keyword-hijack-alert"
title: "Brand-Keyword-Hijack-Alert — 品牌词搜索下竞品展示份额超30%触发品牌防守广告扩展"
description: "触发词：品牌词劫持、竞品展示份额、防守告警、SB 广告扩展、出价提权、竞品情报。何时不用：展示份额波动属于季节性正常变化时不必触发；缺少品牌备案与广告份额数据时不适用。安全边界：只监测竞品公开投放数据，不使用非公开信息；多账号监测需规避同 IP 关联风控，误判需人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 商品诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Brand-Keyword-Hijack-Alert"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "竞品在品牌词下的展示份额超阈值时自动告警，并给出防守出价与广告扩展方案。"
user_try: "试试：竞品在我的品牌词下展示份额到 38% 了，帮我生成防守出价和告警说明。"
whenToUse: "已有品牌备案与广告份额报告、需要按阈值自动触发品牌防守时用本技能；要制定长期品牌词投放组合时用品牌词防守策略；仅做竞品研究时用竞品研究类技能。"
workflow: "接入品牌词展示份额与出价数据 → 按轻中重阈值判定竞品劫持程度 → 输出 SP 与 SB 出价提升及预算上限调整建议 → 记录竞品 ASIN 并生成竞品情报报告 → 通知品牌团队并跟踪份额回落情况"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Brand-Keyword-Hijack-Alert — 品牌词搜索下竞品展示份额超30%触发品牌防守广告扩展

## ① 解决的问题

品牌负责人面临"竞品在品牌词搜索截流"——竞品展示份额>30%自动扩展品牌词防守广告将品牌词流量截流率从28%降至9%，年化保护品牌流量价值35万元

## ② 核心算法逻辑

论文：RealTime Bidding with MultiAgent Reinforcement Learning for Display Advertising | 年份：2021

## ③ 业务应用场景

场景：某母婴品牌「MomsChoice」品牌词被竞品大量投放 - 触发条件：搜索「MomsChoice breast pump」时，竞品总展示份额 = 38%（阈值 30%） - 执行动作： - 创建/更新 SB 广告「MomsChoice 吸奶器」，出价提升至 $4.50（Top of Search） - SP 广告「MomsChoice」Exact Match，出价 +30%（$2.80 → $3.64） - 自动记录竞品 ASINs（B0XXXX, B0YYYY），触发竞品情报报告 - 通知品牌团队：检查是否可申请「Brand Keyword Protection」 - 业务价值：品牌词
三轨验证 | 成本轨：月均成本1200元（品牌词监控工具600元/月+人工分析12小时/月×50元/小时=600元），年度投入14400元 | 合规轨：符合《反不正当竞争法》第二条，不涉及虚假宣传；需遵守《电商法》第十七条关于平台治理义务，建议建立品牌词保护白名单机制 | 风险轨：被竞争对手恶意举报概率15%；平台算法更新导致监控失效概率20%；误判率8-12%造成误伤中小卖家概率25%
**三轨验证** | 成本轨：月均成本2800元（A9算法深度优化咨询3000元/月+自动化监控系统800元/月-人工成本节省1000元），年度投入33600元，ROI预期340%自然流量增长对应月均GMV增长8-12万元 | 合规轨：符合《反垄断法》框架下的正当竞争行为；需获得品牌方授权或建立合作协议；亚马逊A9算法优化需遵守《搜索引擎营销规范》，禁止黑帽SEO手段 | 风险轨：账户关联风险概率18%（多账户同时优化同品牌词）；流量虚假繁荣风险12%（转化率不匹配导致后期调整）；平台政策变更风险30%（A9算法调整周期6-12个月）；品牌方投诉风险22%（未授权情况下的关键词竞争）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：品牌词自然份额从 62% → 85%，月均增量 GMV $35,000；防守广告追加成本 $800/月，ROI 43:1
实施难度：⭐⭐⭐☆☆（需广告份额报告 API + SB 广告权限（Brand Registry）+ 自动化出价接口）
优先级：⭐⭐⭐⭐⭐（品牌词被劫持是「用自己的品牌为竞品引流」，属极高优先级防御任务）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（177 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime

def brand_keyword_hijack_alert(
    brand_keywords: List[Dict],
    now: Optional[datetime] = None,
    hijack_threshold: float = 0.30,
    severe_threshold: float = 0.50,
    bid_increase_sp: float = 0.30,
    bid_increase_sb: float = 0.20,
    top_of_search_multiplier: float = 1.5
) -> Dict:
    """
    品牌词劫持告警与防守广告触发器
    
    参数:
        brand_keywords: [{
            "brand": str, "keyword": str,
            "our_impression_share": float,      # 我方品牌词展示份额
            "competitor_impression_share": float, # 竞品总展示份额
            "top_competitor_asins": List[str],
            "current_sp_bid": float,    # 当前SP出价
            "current_sb_bid": float,    # 当前SB出价（若无SB则为0）
            "has_sb_campaign": bool,    # 是否有SB广告活动
            "brand_registered": bool    # 是否已注册Brand Registry
        }]
    
    返回:
        {"alerts": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    alerts = []
    
    for kw in brand_keywords:
        brand = kw["brand"]
        keyword = kw["keyword"]
        our_share = kw.get("our_impression_share", 1.0)
        comp_share = kw.get("competitor_impression_share", 0.0)
        top_asins = kw.get("top_competitor_asins", [])
        sp_bid = kw.get("current_sp_bid", 1.5)
        sb_bid = kw.get("current_sb_bid", 0)
        has_sb = kw.get("has_sb_campaign", False)
        brand_registered = kw.get("brand_registered", False)
        
        if comp_share < hijack_threshold:
            alerts.append({
                "keyword": keyword,
                "action": "HEALTHY",
                "competitor_share": comp_share,
                "our_share": our_share,
                "reason": f"竞品份额{comp_share:.0%}，低于{hijack_threshold:.0%}阈值"
            })
            continue
        
        # 判断严重程度
        if comp_share >= severe_threshold:
            severity = "SEVERE"
            sp_bid_multiplier = 1 + bid_increase_sp * 1.5
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.07755，但该号在 arXiv 上是《All-flavor constraints on nonstandard neutrino interactions and generalized matter potential with three years of IceCube DeepCore data》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《RealTime Bidding with MultiAgent Reinforcement Learning for Display Advertising》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：品牌词下我方与竞品的展示份额（日粒度）、当前 SP 与 SB 出价、是否已有 SB 活动、是否已注册 Brand Registry，以及品牌词监控数据源。

**输出**：告警级别与触发原因、SP 与 SB 出价调整建议及预算上限变化、竞品 ASIN 情报报告与品牌保护申请提示；供品牌负责人与投放团队执行防守动作。

## 执行步骤

1. 接入品牌词展示份额与出价数据
2. 按轻中重阈值判定竞品劫持程度
3. 输出 SP 与 SB 出价提升及预算上限调整建议
4. 记录竞品 ASIN 并生成竞品情报报告
5. 通知品牌团队并跟踪份额回落情况

## 边界与不做

- 何时不用：展示份额波动属于大促或季节性正常变化、或竞品份额未超阈值时不要触发防守，避免无谓提价。
- 能力边界：本技能产出告警与调整建议，不直接调用广告后台完成出价修改。
- 合规边界：只监测竞品公开投放数据，多账号监测需规避同 IP 关联风控，误判需人工复核后再动作。

## 技能关联

- **前置**：Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Long-Tail-Opportunity-Auto-Capture.html、Skill-Long-Tail-Opportunity-Auto-Capture、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice
- **延伸**：Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Long-Tail-Opportunity-Auto-Capture.html、Skill-Long-Tail-Opportunity-Auto-Capture、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action
- **可组合**：Skill-Long-Tail-Opportunity-Auto-Capture.html、Skill-Long-Tail-Opportunity-Auto-Capture、Skill-Search-Rank-Recovery-Auto-Action.html、Skill-Search-Rank-Recovery-Auto-Action、Skill-Brand-Keyword-Hijack-Alert

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Brand-Keyword-Hijack-Alert`