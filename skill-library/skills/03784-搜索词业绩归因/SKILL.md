---
name: "p2s-search-query-performance-attribution"
title: "Skill-Search-Query-Performance-Attribution — 搜索词业绩归因"
description: "触发词：搜索词业绩、Query Value Score、SQP 报告、帕累托分析、高价值词、ACOS 优化。何时不用：要按统计显著性批量否定废词时用搜索词否定优化；要从 SQP 报告快速找出贡献 80% 价值的高价值词并排序时用本卡。安全边界：关键词优化须避免虚假宣传与堆砌，母婴品类需满足相应产品标准声明要求，不得篡改搜索词数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Search-Query-Performance-Attribution"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从庞大的 SQP 报告里快速挑出贡献 80% 转化的高价值词，把预算集中到真正值得抢的词上。"
user_try: "试试：这是我的 Amazon SQP 报告，帮我按 Query Value Score 排序，找出应加价的 Top 20 词和应否定的低效词。"
whenToUse: "与「搜索词否定优化」相比：做显著性检验批量否定废词走那张卡；要先做价值排序、识别高机会词并给出加价与否定两类动作时用本卡。"
workflow: "导入 SQP 报告，计算展示×CTR×CVR×客单价的 Query Value Score → 做帕累托分析，圈出贡献 80% 价值的头部词 → 筛出点击份额低但价值高的高机会词 → 对高机会词加 Exact Match 竞价 20–30%，对 CVR 极低词入否定库"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Search-Query-Performance-Attribution — 搜索词业绩归因

## ① 解决的问题

广告负责人面临"SQP报告数据庞大无法快速提取高价值词"——自动归因分析将高价值词发现效率提升10倍，ACOS平均降低18%

## ② 核心算法逻辑

论文：MultiTouch Attribution for Search Queries via Marginal Contribution Decomposition | 年份：2021

## ③ 业务应用场景

场景：婴儿推车 SQP 报告关键词价值挖掘
- 业务问题：月广告预算 $8,000 分散在 200+ 关键词，不知道哪 20 个词贡献了 80% 的转化 - 数据要求：Amazon SQP 报告（周/月）、Brand Analytics 数据、ACOS 目标值 - 执行方案： - 按 Query Value Score 降序排列所有搜索词 - 识别 Top 20 词：Click Share < 30%（有提升空间）且 CVR > 品类均值 - 对 Top 20 词增加 Exact Match 竞价 20-30% - 对 CVR < 1% 的词加入否定词库 - 量化产出：重点词 ACOS 从 35% 降至 22%，整体月销售额增加 18%
**三轨验证** | 成本轨：A9算法关键词优化月均投入3,200元（数据分析师0.5人月×8,000元+工具订阅1,200元+测试成本1,000元），人工投入12小时/月（关键词研究4h+数据分析5h+方案调整3h） | 合规轨：符合《电商平台搜索算法推荐公示规范》，关键词优化需避免虚假宣传和堆砌，母婴品类需满足GB 6675食品安全标准声明要求，结论：合规可行 | 风险轨：①关键词误触发平台算法降权（概率15%，影响流量-20%）②竞品恶意举报虚假宣传（概率8%，需整改周期7-14天）③算法更新导致优化失效（概率25%，需持续迭代）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：同等广告预算，优化后 ACOS 从 35% → 22%，年化多产出 GMV 20-35 万元
实施难度：⭐⭐☆☆☆（依赖 SQP 报告数据，分析逻辑清晰）
优先级：⭐⭐⭐⭐⭐（广告预算优化的基础，月度必执行）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（96 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Tuple

def compute_query_value_score(
    impressions: float,
    clicks: float,
    orders: float,
    aov: float = 45.0
) -> float:
    """计算搜索词价值得分 = 展示量 × CTR × CVR × 客单价"""
    ctr = clicks / impressions if impressions > 0 else 0
    cvr = orders / clicks if clicks > 0 else 0
    return impressions * ctr * cvr * aov

def pareto_analysis(df: pd.DataFrame, value_col: str = "query_value_score") -> pd.DataFrame:
    """帕累托分析：找出贡献 80% 价值的头部词"""
    df = df.sort_values(value_col, ascending=False).copy()
    total = df[value_col].sum()
    df["cumulative_pct"] = df[value_col].cumsum() / total * 100
    df["is_pareto_top"] = df["cumulative_pct"] <= 80
    return df

def identify_opportunity_keywords(df: pd.DataFrame) -> pd.DataFrame:
    """识别高机会词：价值高但点击份额低"""
    # 归一化得分
    df = df.copy()
    df["norm_value"] = df["query_value_score"] / df["query_value_score"].max()
    df["norm_share_gap"] = 1 - df["click_share"]  # 1 - 已占份额 = 可提升空间
    df["opportunity_score"] = df["norm_value"] * df["norm_share_gap"]
    
    # 分类
    def classify(row):
        if row["norm_value"] > 0.5 and row["click_share"] < 0.3:
            return "HIGH_OPPORTUNITY"
        elif row["norm_value"] > 0.5 and row["click_share"] >= 0.3:
            return "DEFEND"
        elif row["norm_value"] <= 0.5 and row["click_share"] < 0.2:
            return "MONITOR"
        else:
            return "LOW_PRIORITY"
    
    df["category"] = df.apply(classify, axis=1)
    return df.sort_values("opportunity_score", ascending=False)

def build_sqp_report(raw_data: pd.DataFrame) -> Tuple[pd.DataFrame, dict]:
    """完整 SQP 分析流水线"""
    df = raw_data.copy()
    
    # 计算核心指标
    df["ctr"] = df["clicks"] / df["impressions"].replace(0, np.nan)
    df["cvr"] = df["orders"] / df["clicks"].replace(0, np.nan)
    df["ctr"] = df["ctr"].fillna(0)
    df["cvr"] = df["cvr"].fillna(0)
    df["query_value_score"] = df.apply(
        lambda r: compute_query_value_score(r["impressions"], r["clicks"], r["orders"]), axis=1
    )
    
    # 帕累托分析
    df = pareto_analysis(df)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《MultiTouch Attribution for Search Queries via Marginal Contribution Decomposition》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon SQP 报告（周/月粒度）与 Brand Analytics 数据，字段需含展示、点击、加购、购买与点击份额；另需目标 ACOS 与品类 CVR 基准。

**输出**：按 Query Value Score 排序的搜索词清单、贡献 80% 价值的头部词、高机会词（点击份额低）与建议否定词清单，供广告负责人按词执行加价或否定。

## 执行步骤

1. 导入 SQP 报告并统一展示、点击、订单与客单价口径。
2. 计算 Query Value Score 并做帕累托分析定位头部词。
3. 交叉点击份额与品类 CVR，筛出高机会词与低效词。
4. 提高高机会词的 Exact Match 竞价（卡页 20–30%）。
5. 筛出点击足够但 CVR 极低的词加入否定词库，跟踪 ACOS 变化。

## 边界与不做

- 何时不用：拿不到 SQP 报告、或词量极少时不要用；只做废词清洗不需要价值排序。
- 能力边界：产出词级排序与动作建议，不直接改竞价；卡页 ACOS 35%→22%、销售额 +18% 为案例值。
- 安全边界：不得堆砌关键词或做虚假宣传，母婴品类须满足对应标准声明要求。

## 技能关联

- **前置**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Funnel-Attribution.html、Skill-Search-Funnel-Attribution、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Search-Query-Performance-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Query-Performance-Attribution`