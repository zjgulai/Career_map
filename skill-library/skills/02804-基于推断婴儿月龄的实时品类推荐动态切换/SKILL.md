---
name: "p2s-baby-age-aware-recommendation"
title: "Baby Age Aware Recommendation — 基于推断婴儿月龄的实时品类推荐动态切换"
description: "触发词：月龄感知推荐、月龄推断、品类优先级、首页推荐、实时切换。何时不用：新品无历史数据要解决曝光用「冷启动商品推荐」；要按标签约束做关联推荐用「标签感知个性化推荐」。安全边界：月龄是推断信息，不得当作确定性事实；月龄标签不得用于广告定向，只能用于商品匹配与页面排序。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 分群"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Baby-Age-Aware-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "首页先猜宝宝几个月大，再据此换品类：4 月龄用户看到的是辅食工具，而不是学步车。"
user_try: "试试：根据这个用户首次访问浏览的品类页推断宝宝月龄，并调整首页推荐模块顺序。"
whenToUse: "当母婴首页或推荐位要按宝宝月龄切换品类优先级时用本技能；问题是没有行为数据的新品推不出去时用「冷启动商品推荐」；要按标签约束做关联品推荐用「标签感知个性化推荐」。"
workflow: "采集首次访问的品类浏览行为做月龄快速推断 → 对有购买历史的用户用月龄时钟精确推断 → 构建月龄到品类优先级的映射矩阵 → 按推断月龄动态切换首页推荐模块 → 对比月龄感知与热门推荐的 CTR 并迭代规则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Baby Age Aware Recommendation — 基于推断婴儿月龄的实时品类推荐动态切换

## ① 解决的问题

推荐算法团队面临"母婴首页推荐CTR仅1.2%、对4月龄宝宝推荐学步车导致完全无效曝光"——三层月龄感知推荐（月龄推断+品类优先级+个性化精排）将CTR从1.2%提升至2.8%，月GMV增量约2.16万美元

## ② 核心算法逻辑

传统推荐系统的假设：用户的偏好是相对稳定的，可以从历史行为中学习。

## ③ 业务应用场景

业务问题：独立站用户首次访问时，系统没有任何用户信息，通常展示"最热门产品"（全年龄通用）。这对特定月龄用户完全无针对性，转化率极低（约 1.2%）。
方案： 1. 浏览行为快速推断：用户在首次访问时浏览了哪些品类页面 → 月龄快速推断（无需历史购买） 2. 购买后精确推断：有历史购买的用户，Baby Age Clock 精确推断月龄 3. 推荐层切换：根据推断月龄动态切换首页推荐模块
预期产出：月龄感知推荐 vs 热门推荐，CTR 3.2% vs 1.2%，提升约 2.7x

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月龄感知首页推荐 CTR 从 1.2% → 2.8%（+133%），月 GMV 增量约 $21,600；广告受众精准度提升节省约 $3,600/月，合计年化约 $30 万
实施难度：⭐⭐⭐☆☆（需要整合 Baby Age Clock + Infant Lifecycle Rhythm 两个前置 Skill，以及推荐系统接口，约 3-4 周）
优先级：⭐⭐⭐⭐⭐（母婴推荐系统的"终极形态"——同时利用月龄（刚需时机）和个性化（品牌/价格偏好）两个维度，竞争壁垒极高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（264 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Baby Age Aware Recommendation
婴儿月龄感知推荐系统——三层架构实现

依赖：numpy, pandas, scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 月龄-品类优先级矩阵
# ─────────────────────────────────────────────

def build_age_category_priority_matrix() -> pd.DataFrame:
    """
    构建月龄×品类优先级矩阵（核心知识库）
    value > 0: 在该月龄下，该品类的相关性权重
    """
    ages = list(range(0, 25))
    categories = [
        'newborn_essentials', 'formula_stage1', 'formula_stage2', 'formula_stage3',
        'diaper_nb_s', 'diaper_m', 'diaper_l_xl',
        'baby_bath', 'teether', 'high_chair', 'baby_food',
        'crawling_mat', 'safety_gate', 'walker', 'toddler_shoes',
        'potty_trainer', 'learning_toys', 'sippy_cup',
    ]

    matrix = pd.DataFrame(0.0, index=ages, columns=categories)

    # 每个品类的月龄权重曲线（高斯形状，峰值在需求最高月龄）
    age_profiles = {
        'newborn_essentials':  (0, 1),
        'formula_stage1':      (0, 6),
        'formula_stage2':      (5, 12),
        'formula_stage3':      (11, 24),
        'diaper_nb_s':         (0, 5),
        'diaper_m':            (4, 10),
        'diaper_l_xl':         (9, 24),
        'baby_bath':           (0, 18),
        'teether':             (3, 10),
        'high_chair':          (4, 18),
        'baby_food':           (4, 12),
        'crawling_mat':        (5, 12),
        'safety_gate':         (7, 18),
        'walker':              (9, 15),
        'toddler_shoes':       (10, 24),
        'potty_trainer':       (17, 30),
        'learning_toys':       (12, 36),
        'sippy_cup':           (9, 24),
    }

    for cat, (peak_start, peak_end) in age_profiles.items():
        peak_center = (peak_start + peak_end) / 2
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2403.18536 — A Novel Behavior-Based Recommendation System for E-commerce

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户浏览行为（首次访问的品类页序列）、历史购买记录（用于月龄精确推断）、商品品类与适用月龄属性表；粒度为单个用户 × 一次会话。

**输出**：月龄推断结果、月龄到品类优先级矩阵，以及按用户切换的首页推荐模块排序；供推荐与前端在首页落地。

## 执行步骤

1. 用首次访问的品类浏览行为做月龄快速推断
2. 对有购买历史的用户用月龄时钟做精确推断
3. 构建月龄到品类优先级的映射矩阵
4. 按推断月龄动态切换首页推荐模块
5. 对比月龄感知与热门推荐的 CTR 并迭代规则

## 边界与不做

- 数据不满足：既无浏览品类信号又无购买历史时推断不出月龄，先走通用推荐，不要用本技能硬顶。
- 何时不用：新品无历史数据要解决曝光用「冷启动商品推荐」；要按标签约束做关联推荐用「标签感知个性化推荐」。
- 能力边界：只做月龄推断与品类优先级切换，不训练新的排序模型，也不保证卡页口径的 CTR 提升幅度。
- 安全边界：月龄是推断信息，不得当作确定性事实，也不得用于广告定向，只能用于商品匹配与页面排序。

## 技能关联

- **前置**：Skill-Ad-Creative-Personalization-Bandit.html、Skill-Ad-Creative-Personalization-Bandit、Skill-Baby-Age-Clock-RFM-Enhancement.html、Skill-Baby-Age-Clock-RFM-Enhancement、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Infant-Lifecycle-Purchase-Rhythm.html、Skill-Infant-Lifecycle-Purchase-Rhythm、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling
- **延伸**：Skill-Ad-Creative-Personalization-Bandit.html、Skill-Ad-Creative-Personalization-Bandit、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling
- **可组合**：Skill-Ad-Creative-Personalization-Bandit.html、Skill-Ad-Creative-Personalization-Bandit、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-Baby-Age-Aware-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Baby-Age-Aware-Recommendation`