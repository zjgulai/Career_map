---
name: "p2s-negative-keyword-safe-guard"
title: "Negative Keyword Safe Guard — 贝叶斯小样本负关键词安全过滤"
description: "触发词：否定关键词、废词清洗、无效流量过滤、小样本判词、搜索词报告。何时不用：需要统计显著性批量清洗并联动预算时用搜索词否定优化；样本稀疏、怕误杀时用本卡的贝叶斯小样本判词。安全边界：否定仅基于本店搜索词报告，不得否定品牌词或误伤关联品类词，涉平台政策的词一律人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Negative-Keyword-Safe-Guard"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用贝叶斯小样本方法从搜索词报告里安全挑出该否定的烧钱词，避免误杀有效词。"
user_try: "试试：这是我的 Amazon 搜索词报告，帮我找出 30 天内点击多但零转化的无关词，并标出哪些还需要再观察。"
whenToUse: "与「搜索词否定优化」相比：词量充足、要做显著性检验批量否定并联动预算时用那张卡；词量少、样本稀疏怕误杀时用本卡的贝叶斯小样本判词。"
workflow: "从后台导出 Search Term Report 并整理点击、花费、转化三列 → 用先验 CVR 与先验强度计算每个词的后验 Beta 分布参数 → 按后验置信上界筛出高置信浪费词，低样本词进观察名单 → 生成 Negative Exact 候选清单，人工复核后投放"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Negative Keyword Safe Guard — 贝叶斯小样本负关键词安全过滤

## ① 解决的问题

广告优化师面临无效词烧钱——Negative Keyword将浪费点击率20%压到6%，年化省24万元

## ② 核心算法逻辑

母婴品类广告投放中，自动化广告（Auto Campaign）会将产品匹配到大量搜索词。问题在于：某些词虽然包含品类核心词，却属于完全无关流量，例如：

## ③ 业务应用场景

业务背景：某母婴品牌在 Amazon US 投放 "pacifier" 和 "nipple" 相关自动广告。系统匹配到大量无关流量，30 天广告消耗 $2,400，其中约 18% 归因于无关搜索词。
量化 ROI： - 月节约无效消耗：$432 - ROAS 提升带来的等效价值：$432 × (4.1/3.2 - 1) = +$121 - 合计月均收益：约 $553，全年 $6,636
业务背景：在 Amazon JP 投放"哺乳瓶"（哺乳瓶/ほにゅうびん）相关广告，被匹配到育儿论坛讨论词、二手交易词等无关查询。

## ④ 输入数据要求

Amazon：Search Term Report（广告管理后台 → 报告 → 搜索词报告）
Shopify/Meta：广告词搜索词匹配数据导出

## ⑤ 输出结果

Amazon：Search Term Report（广告管理后台 → 报告 → 搜索词报告）
Shopify/Meta：广告词搜索词匹配数据导出

## ⑥ 业务价值 / ROI

$432（18% → 3.2%无关消耗）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（372 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/advertising/negative_keyword_safe_guard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Negative-Keyword-Safe-Guard.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Negative Keyword Safe Guard
贝叶斯小样本负关键词安全过滤系统

依赖：numpy, scipy, pandas
测试：python -m pytest test_negative_keyword.py -v
"""

import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict


@dataclass
class KeywordStats:
    """单个搜索词的统计数据"""
    keyword: str
    clicks: int
    conversions: int
    spend: float
    impressions: int = 0
    
    @property
    def observed_cvr(self) -> float:
        return self.conversions / self.clicks if self.clicks > 0 else 0.0
    
    @property
    def cpc(self) -> float:
        return self.spend / self.clicks if self.clicks > 0 else 0.0


@dataclass
class BayesianCVREstimator:
    """
    Beta-Binomial 贝叶斯 CVR 估计器
    
    先验: CVR ~ Beta(α₀, β₀)
    后验: CVR | data ~ Beta(α₀ + k, β₀ + n - k)
    """
    category_cvr: float = 0.012     # 品类平均 CVR（母婴 Amazon ~1.2%）
    prior_strength: float = 20.0    # 先验强度 κ（等效历史样本量）
    
    @property
    def alpha0(self) -> float:
        return self.category_cvr * self.prior_strength
    
    @property
    def beta0(self) -> float:
        return (1 - self.category_cvr) * self.prior_strength
    
    def posterior_params(self, clicks: int, conversions: int) -> Tuple[float, float]:
        """计算后验 Beta 分布参数"""
        alpha_post = self.alpha0 + conversions
        beta_post = self.beta0 + (clicks - conversions)
        return alpha_post, beta_post
    
    def posterior_mean(self, clicks: int, conversions: int) -> float:
        """后验期望 CVR（贝叶斯估计）"""
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2210.15459 — Keyword Targeting Optimization in Sponsored Search Advertising: Combining Selection and Matching

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：Amazon Search Term Report（广告后台→报告→搜索词报告）导出，或 Shopify/Meta 的广告搜索词匹配数据导出；字段含搜索词、展示、点击、花费、转化/订单，粒度到单个搜索词，覆盖近 30–60 天。

**输出**：搜索词的后验 CVR 与置信区间、可直接添加的 Negative Exact 候选清单与观察名单，供广告优化师在后台执行否定投放。

## 执行步骤

1. 导出并标准化搜索词报告，统一搜索词、点击、花费、转化字段口径。
2. 设定品类平均 CVR 先验与先验强度（等效历史样本量），计算每个词的后验 Beta 参数。
3. 用后验均值与置信区间判断该词是否显著低于品类水平，避免小样本误杀。
4. 筛出高置信浪费词并加入 Negative Exact 候选，低样本词放入 7 天观察名单。
5. 输出否定清单与预期节省，交付优化师在广告后台执行并复盘。

## 边界与不做

- 何时不用：搜索词样本充足（每个词点击数都在数十以上）时改用搜索词否定优化的显著性检验做批量清洗。
- 能力边界：只做判词与清单产出，不代投否定关键词、不改竞价，也不承诺节省金额。
- 数据边界：卡页结论来自 Amazon US/JP 自动广告案例（30 天消耗 $2,400、约 18% 无关流量），换平台或品类需重估品类先验 CVR。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Negative-Keyword-Safe-Guard

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Negative-Keyword-Safe-Guard`