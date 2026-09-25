---
name: "p2s-competitor-ad-surge-defense-trigger"
title: "Competitor-Ad-Surge-Defense-Trigger — 竞品广告份额单日激增自动触发防御性出价提升"
description: "触发词：竞品加投、份额激增、防御出价、预算上限、触发阈值、自动恢复。何时不用：份额波动未超阈值时不必触发；需要长期品牌词投放体系时用品牌词防守策略。安全边界：自动调价需符合平台竞价政策、不使用黑帽工具，多账号监测需规避同 IP 关联风控，竞品数据只取公开投放信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 竞品研究"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Competitor-Ad-Surge-Defense-Trigger"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "竞品一天内大幅抬高份额时自动提高出价防御，冲击回落后再恢复原出价。"
user_try: "试试：竞品在 electric breast pump 的份额一天从 12% 涨到 31%，帮我出防御方案。"
whenToUse: "竞品份额单日激增、需要短期自动防御并在回落后自动恢复时用本技能；需要长期品牌词词库与出价体系时用品牌词防守策略；只做竞品情报收集时用竞品研究类技能。"
workflow: "接入我方与竞品的日级份额与出价数据 → 按轻、中、重阈值判定冲击等级 → 输出核心词与品类词的出价提升及预算上限 → 生成竞品上新与 Listing 改动提示 → 冲击回落后按条件恢复原出价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitor-Ad-Surge-Defense-Trigger — 竞品广告份额单日激增自动触发防御性出价提升

## ① 解决的问题

广告负责人面临"竞品突然加大投放截流品牌词流量"——展示份额日增15%自动触发防御出价将品牌词曝光损失从35%降至8%，年化保护流量价值30万元

## ② 核心算法逻辑

论文：RealTime Bidding with MultiAgent Reinforcement Learning for Display Advertising | 年份：2021

## ③ 业务应用场景

场景：竞品在「吸奶器」类目发起广告攻势 - 触发条件：竞品 ASIN B0XXXX 在关键词「electric breast pump」的展示份额单日从 12% → 31%（+19%） - 执行动作： - 核心品牌词出价 +20%（$1.80 → $2.16） - 品类精准词补充出价 +20% - 每日预算上限提升至原 1.5x（$300 → $450） - 通知广告团队：竞品新上线（BSR 上升明显，建议查看其 Listing 改动） - 持续 3 天后竞品份额回落至 15%，系统自动恢复原出价 - 业务价值：防守期间自然份额损失从预估 -25% 降至 -8%，保护了 $12,000 的周 
三轨验证 | 成本轨：竞品广告监测系统月均成本1200元（监测工具600元+数据分析师8小时/月@75元/小时），ROI提升至4.1时月度额外收益约8000元，成本回报比1:6.7 | 合规轨：符合《反不正当竞争法》第12条，监测竞品公开投放数据合规；需遵守平台广告政策，不涉及获取非公开信息，Amazon/eBay/沃尔玛均允许竞品分析工具 | 风险轨：①平台账号关联风险（概率15%）-使用同IP多账号监测可能触发风控；②数据滞后性（概率40%）-竞品调整速度快于监测更新；③广告成本波动（概率25%）-市场季节性导致ROAS波动预期
**三轨验证** | 成本轨：AI自动化竞品防守系统月均成本2800元（SaaS工具1800元+运营配置10小时/月@100元/小时），通过自动调价和创意优化，ROAS维持在3.8-4.2区间，月度广告支出节省约3500元，成本回报比1:1.25 | 合规轨：自动竞价调整需符合平台算法政策，不得使用黑帽工具；创意优化基于自有数据合规；需在平台服务条款允许范围内操作，Amazon Brand Registry认证后权限更充分 | 风险轨：①算法依赖风险（概率20%）-平台更新可能影响自动化效果；②过度优化风险（概率18%）-频繁调价导致账户不稳定或被限流；③竞品恶意点击（概率12%）-无效流量增

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：防守期间份额损失从 -25% → -8%，保护周 GMV $12,000；防守预算增量 $150/天 × 3天 = $450，ROI 26:1
实施难度：⭐⭐⭐☆☆（需竞品广告份额 API + 实时监控 + 广告平台写入权限）
优先级：⭐⭐⭐⭐☆（竞品突袭在大促前后频发，防御响应时效关键）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional
from datetime import datetime, timedelta

def competitor_ad_surge_defense_trigger(
    keywords: List[Dict],
    now: Optional[datetime] = None,
    light_threshold: float = 0.15,   # 轻度冲击
    medium_threshold: float = 0.30,  # 中度冲击
    heavy_threshold: float = 0.50,   # 重度冲击
    light_bid_increase: float = 0.20,
    medium_bid_increase: float = 0.30,
    heavy_bid_increase: float = 0.40,
    defense_days: int = 3,
    budget_multiplier: float = 1.5
) -> Dict:
    """
    竞品广告冲击防御触发器
    
    参数:
        keywords: [{
            "keyword_id": str, "keyword_text": str,
            "our_impression_share_yesterday": float,  # 昨日我方份额
            "our_impression_share_today": float,      # 今日我方份额
            "competitor_share_yesterday": float,      # 昨日竞品份额
            "competitor_share_today": float,          # 今日竞品份额
            "competitor_id": str,
            "current_bid": float,
            "daily_budget": float,
            "is_brand_keyword": bool
        }]
    
    返回:
        {"defenses": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    defenses = []
    
    for kw in keywords:
        kwid = kw["keyword_id"]
        kwtext = kw.get("keyword_text", kwid)
        comp_share_yesterday = kw.get("competitor_share_yesterday", 0)
        comp_share_today = kw.get("competitor_share_today", 0)
        our_share_change = kw.get("our_impression_share_today", 0) - kw.get("our_impression_share_yesterday", 0)
        comp_id = kw.get("competitor_id", "unknown")
        current_bid = kw["current_bid"]
        daily_budget = kw.get("daily_budget", 100.0)
        is_brand = kw.get("is_brand_keyword", False)
        
        # 计算竞品份额单日变化
        delta = comp_share_today - comp_share_yesterday
        
        if delta < light_threshold:
            defenses.append({
                "keyword_id": kwid,
                "keyword_text": kwtext,
                "action": "NO_DEFENSE_NEEDED",
                "competitor_share_delta": round(delta, 3),
                "reason": f"竞品份额变化{delta:+.1%}，未达{light_threshold:.0%}防御阈值"
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04525，但该号在 arXiv 上是《A critical look at the current train/test split in machine learning》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《RealTime Bidding with MultiAgent Reinforcement Learning for Display Advertising》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：我方与竞品昨日至今日的展示份额、当前出价与预算上限、关键词列表，以及竞品 ASIN 与 BSR 变化等公开情报。

**输出**：防御触发级别、出价提升与预算上限调整方案、竞品上新与 Listing 改动提示、恢复条件；供广告团队在竞品冲击期执行并在回落后回归常态。

## 执行步骤

1. 接入我方与竞品的日级份额与出价数据
2. 按轻、中、重阈值判定冲击等级
3. 输出核心词与品类词的出价提升及预算上限
4. 生成竞品上新与 Listing 改动提示
5. 冲击回落后按条件恢复原出价

## 边界与不做

- 何时不用：份额波动未达阈值、或属于大促季节性波动时不要触发防御，避免无谓提价。
- 能力边界：本技能产出触发判据与调整方案，不直接改价，自动恢复也需人工确认。
- 合规边界：自动调价需符合平台竞价政策、不使用黑帽工具，多账号监测需规避同 IP 关联风控。

## 技能关联

- **前置**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster
- **延伸**：Skill-Brand-Keyword-Hijack-Alert.html、Skill-Brand-Keyword-Hijack-Alert、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster
- **可组合**：Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-Competitor-Ad-Surge-Defense-Trigger

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Competitor-Ad-Surge-Defense-Trigger`