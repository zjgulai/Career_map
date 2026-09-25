---
name: "p2s-search-position-click-elasticity"
title: "搜索位置点击弹性分析 — 用 Examination Model 分离位置偏差估计真实 CTR"
description: "触发词：位置弹性、真实 CTR、Examination Model、竞价上限、排名投入、位置偏差。何时不用：关键词价值排序用搜索词业绩归因；要回答把排名从第 3 页提到第 1 页值不值、竞价上限该出多少时用本卡。安全边界：仅使用自家广告后台导出的位置级数据，不得通过刷点击或虚假转化伪造位置信号。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 商品诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Search-Position-Click-Elasticity"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清排名每提升一位能多带来多少点击和 GMV，反推出合理的竞价上限。"
user_try: "试试：这是关键词 baby monitor 过去 90 天各搜索位置的曝光与点击，帮我拟合位置倾向性曲线并算出竞价上限。"
whenToUse: "与「自然排名与广告排名协同」相比：协同模型算广告对自然排名的长期溢出；本卡算单关键词位置变化带来的点击与 GMV 弹性，用于定竞价上限。"
workflow: "导出 90 天各搜索位置的曝光量、点击量与关键词月搜索量 → 拟合位置倾向性曲线，分离位置偏差得到真实 CTR → 按 CVR 与客单价换算各位置的 GMV 弹性 → 由 GMV 增量×毛利率÷预估点击次数推算竞价上限"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索位置点击弹性分析 — 用 Examination Model 分离位置偏差估计真实 CTR

## ① 解决的问题

广告投手面临"不知道把排名从第3页提到第1页值不值得投入"——位置弹性量化将广告投决策ROI可见度提升至月化$3.8万增量GMV

## ② 核心算法逻辑

位置偏差问题：搜索结果中，位置越靠前的 ASIN 被点击概率越高，即使内容并非最好。这使得「观测 CTR」混合了真实质量信号和位置曝光偏差，直接用 CTR 优化排名会形成马太效应。

## ③ 业务应用场景

场景A：量化「从第 3 页到第 1 页」的 GMV 增量
卖家「baby monitor」关键词目前稳定在第 3 页（位置约 48），评估是否值得加大广告预算冲到第 1 页（位置约 5）。
- 业务问题：广告竞价应该出多少才合理？预算上限在哪？ - 数据要求：过去 90 天各搜索位置的曝光量、点击量（广告后台导出），关键词月搜索量 - 执行步骤：拟合位置倾向性曲线 → 估计真实 CTR → 计算各位置 GMV 弹性 → 推算竞价上限 - 预期产出：位置 5 vs 位置 48 的 CTR 差异约 4.2x，以 CVR=12%、均价 $149 测算，月 GMV 增量 $6.8 万 - 业务价值：竞价上限 = GMV 增量 × 毛利率 / 预估点击次数 = $2.3（当前市场 CPC $1.5，投入产出正向），决策支撑广告预算提升 50%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：基于弹性模型精准设置竞价上限，ACoS 从 35% 降至 22%，同等月预算 $5,000 下月 GMV 提升 $3.6 万；自然排名提升后广告依赖度降低，12 个月累计 GMV 增量估算 $18 万
实施难度：⭐⭐⭐☆☆（需要广告后台位置级数据，部分账号需开启 Search Term Report 按位置拆分）
优先级：⭐⭐⭐⭐⭐（决定广告预算分配的核心模型，每月例行运行）
评估依据：Amazon Ads 官方白皮书数据：搜索结果第 1 位 CTR 是第 10 位的 5-8 倍；精准竞价模型可将广告效率提升 30-40%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（190 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_position_click_elasticity` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-Position-Click-Elasticity.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy.optimize import curve_fit
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────
# 搜索位置点击弹性分析
# Examination Model：分离位置偏差，估计真实点击率
# ─────────────────────────────────────────────

np.random.seed(2025)

# ─── 模拟点击日志数据（90 天） ───
def generate_click_log(n_days: int = 90,
                       keyword_sv_monthly: int = 50000) -> pd.DataFrame:
    """
    模拟搜索点击日志
    假设搜索结果前 60 个位置（1-3页）
    """
    positions = list(range(1, 61))
    # 真实位置倾向性（幂律衰减，位置 1 最高）
    true_examination_prob = np.array([1.0 / (p ** 0.65) for p in positions])
    true_examination_prob = true_examination_prob / true_examination_prob[0]  # 归一化
    
    # 模拟我方 ASIN 在不同时期处于不同位置
    records = []
    daily_sv = keyword_sv_monthly / 30
    
    for day in range(n_days):
        # 每天我方 ASIN 的搜索位置（模拟随机波动）
        pos = min(60, max(1, int(np.random.normal(25, 8))))
        
        # 该位置的检查概率
        exam_prob = true_examination_prob[pos - 1]
        
        # 我方 ASIN 真实 CTR（与位置无关的质量信号）
        true_ctr = 0.12  # 假设真实相关性 CTR = 12%
        
        # 观测 CTR = exam_prob × true_ctr
        observed_ctr = exam_prob * true_ctr + np.random.normal(0, 0.005)
        observed_ctr = max(0, observed_ctr)
        
        # 当日曝光量（假设只有我方 ASIN）
        impressions = int(daily_sv * exam_prob * 0.3)  # 约 30% 曝光份额
        clicks = int(impressions * observed_ctr)
        
        records.append({
            "day": day,
            "position": pos,
            "impressions": impressions,
            "clicks": clicks,
            "observed_ctr": observed_ctr,
        })
    
    return pd.DataFrame(records)


def fit_examination_curve(click_log: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
    """
    用 Clicks-over-Expected 方法估计各位置倾向性
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：过去 90 天各搜索位置的曝光量、点击量（广告后台导出，部分账号需按位置拆分 Search Term Report）、关键词月搜索量，以及 CVR 与客单价等换算参数。

**输出**：位置倾向性曲线与真实 CTR 估计、各位置 GMV 弹性表、单次点击的竞价上限（卡页案例 $2.3，对应市场 CPC $1.5）与预算提升建议。

## 执行步骤

1. 导出 90 天位置级曝光与点击日志，清洗异常位置。
2. 拟合位置倾向性（Examination）曲线，剥离位置偏差得到真实 CTR。
3. 计算从当前位置到目标位置的点击与 GMV 增量。
4. 推算竞价上限：GMV 增量乘毛利率除以预估点击次数。
5. 输出竞价上限与预算调整建议，并设置复盘观测点。

## 边界与不做

- 何时不用：广告后台无法按位置拆分、或位置长期不变没有变异时不要用；只需要关键词价值排序时走搜索词业绩归因。
- 能力边界：产出的弹性与竞价上限依赖 CVR、客单价等假设；卡页示例（4.2x CTR 差异、月 GMV 增量 $6.8 万）为特定参数下的测算。
- 安全边界：不得用刷点击等方式伪造位置数据。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Search-Position-Click-Elasticity

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Position-Click-Elasticity`