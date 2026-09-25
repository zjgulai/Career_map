---
name: "p2s-search-term-negative-optimization"
title: "Skill-Search-Term-Negative-Optimization — 搜索词否定优化"
description: "触发词：否定关键词、废词清洗、显著性检验、二元否定、Search Term Report、浪费率。何时不用：样本稀疏怕误杀时用贝叶斯小样本判词那张卡；样本充足、要做统计显著性批量清洗时用本卡。安全边界：过度否定可能造成曝光下滑，须保留相关但低转化的观察名单与否定审计记录，不得否定品牌词与合规流量。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Search-Term-Negative-Optimization"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按统计显著性把不相关的烧钱搜索词挑出来批量否定，把广告浪费率压下去。"
user_try: "试试：这是我 60 天的 Search Term Report，目标 ACOS 35%，帮我找出应否定的词、需再观察的词，并估算节省的广告费。"
whenToUse: "与「搜索词业绩归因」相比：做价值排序与高机会词加价用那张卡；要把已确认的低转化词批量否定、控住浪费率时用本卡。"
workflow: "导出 60 天 Search Term Report（卡页为婴儿湿巾 Auto Campaign） → 筛出点击数达标且零订单的词，做单侧二项检验（p<0.05） → 归类为语义不相关（直接否定）与相关但低转化（再观察 7 天） → 输出 Negative Exact 清单（卡页约 45 个词）并跟踪浪费率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Search-Term-Negative-Optimization — 搜索词否定优化

## ① 解决的问题

广告负责人面临"无关搜索词持续消耗广告预算"——精确否定优化将广告浪费率从35%降至12%，年化节省广告费20万元

## ② 核心算法逻辑

搜索词否定优化（Negative Keyword Optimization）通过识别并剔除"高消耗低转化"搜索词，精准降低广告浪费，提升整体 ACOS。

## ③ 业务应用场景

场景：婴儿湿巾 Auto Campaign 广告废词清洗
- 业务问题：Auto Campaign 月消耗 $2,500，其中约 $800 花在"宠物湿巾"、"成人湿巾"等不相关词上（ACOS 无穷大） - 数据要求：Search Term Report（过去60天），目标 ACOS 35%，品类 CVR 基准 6% - 执行方案： - 导出 Search Term Report，识别 clicks ≥ 10 且 orders = 0 的词 - 统计显著性检验（p < 0.05）筛选确实低转化词 - 归类：语义不相关词（直接否定）/ 相关但低转化词（再观察7天） - 添加 Negative Exact 约 45 个词 - 量化产出：月广告浪费从 $8
三轨验证 | 成本轨：负面词库建立月均800元（数据采购+工具订阅），人工审核12小时/月；A9算法反向测试工具年费3000元；总月均成本约1067元 | 合规轨：符合《电商平台搜索公平竞争规范》，负面词优化属于合法的搜索相关性优化，不涉及虚假宣传或刷单，需保留商品真实属性描述 | 风险轨：过度优化负面词导致搜索曝光下降（概率25%）；平台算法更新识别优化痕迹被限流（概率15%）；竞品投诉虚假优化（概率10%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：清洗废词后月广告浪费减少 30-50%，年化节省 5-15 万元（依规模）
实施难度：⭐☆☆☆☆（纯数据分析，操作简单，月度例行执行）
优先级：⭐⭐⭐⭐⭐（所有 PPC 账户都存在 30-50% 废词，收益确定性最高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（120 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List

def binomial_significance_test(
    clicks: int,
    orders: int,
    benchmark_cvr: float = 0.06,
    alpha: float = 0.05
) -> Dict:
    """单侧二项检验：CVR 是否显著低于基准"""
    if clicks < 5:
        return {"significant": False, "p_value": None, "reason": "insufficient_clicks"}
    
    # 观测 CVR
    obs_cvr = orders / clicks if clicks > 0 else 0
    
    # P(X <= orders | clicks, benchmark_cvr) - 单侧左尾检验
    p_value = stats.binom.cdf(orders, clicks, benchmark_cvr)
    
    return {
        "significant": p_value < alpha,
        "p_value": round(p_value, 4),
        "observed_cvr": round(obs_cvr, 4),
        "benchmark_cvr": benchmark_cvr
    }

def classify_negative_action(
    keyword: str,
    clicks: int,
    orders: int,
    spend: float,
    acos: float,
    target_acos: float = 0.35,
    benchmark_cvr: float = 0.06,
    zero_conv_threshold: int = 10
) -> Dict:
    """分类否定行动"""
    obs_cvr = orders / clicks if clicks > 0 else 0
    
    # 规则1：零转化高消耗
    if clicks >= zero_conv_threshold and orders == 0:
        test = binomial_significance_test(clicks, orders, benchmark_cvr)
        if test["significant"]:
            return {"keyword": keyword, "action": "NEGATIVE_EXACT",
                    "reason": "zero_conversion_significant", "waste_usd": spend}
    
    # 规则2：高 ACOS
    if acos > target_acos * 1.5 and orders >= 2:
        return {"keyword": keyword, "action": "NEGATIVE_EXACT",
                "reason": "high_acos", "waste_usd": spend * (1 - target_acos / acos)}
    
    # 规则3：低转化但 clicks 不足（继续观察）
    if clicks < zero_conv_threshold and orders == 0:
        return {"keyword": keyword, "action": "MONITOR", "reason": "low_clicks", "waste_usd": 0}
    
    # 保留
    if obs_cvr >= benchmark_cvr * 0.7:
        return {"keyword": keyword, "action": "KEEP", "reason": "acceptable_cvr", "waste_usd": 0}
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1206.6451。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：Search Term Report（近 60 天），字段含搜索词、点击、订单、花费；另需目标 ACOS（卡页 35%）与品类 CVR 基准（卡页 6%）作为显著性检验对照。

**输出**：按动作分类的搜索词清单（直接否定/观察）、可批量添加的 Negative Exact 清单与月浪费节省估算，交广告负责人执行并复评。

## 执行步骤

1. 导出 60 天 Search Term Report 并设定目标 ACOS 与品类 CVR 基准。
2. 筛出点击数达标、订单为零的候选废词。
3. 做单侧二项检验，只保留显著低于基准的词。
4. 区分语义不相关词与相关但低转化词，后者进 7 天观察名单。
5. 输出 Negative Exact 清单并跟踪浪费率与曝光变化。

## 边界与不做

- 何时不用：点击样本不足（如点击数低于 5）时不要做显著性判定；只做少量手工否词不必套本卡。
- 能力边界：产出否定清单与节省估算，不代投否定词、不做预算再分配；卡页年化节省 5–15 万元为案例值。
- 安全边界：须控制否定强度并留审计记录，避免曝光下降或被判定为过度优化。

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Funnel-Attribution.html、Skill-Search-Funnel-Attribution、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Search-Term-Negative-Optimization

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Term-Negative-Optimization`