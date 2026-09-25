---
name: "p2s-infant-lifecycle-purchase-rhythm"
title: "Infant Lifecycle Purchase Rhythm — 婴儿 0-24 月龄标准消费品类时序图谱建模"
description: "触发词：月龄节律、品类时序图谱、下一品类预测、月龄触达、0-24月龄。何时不用：只给用户打月龄或 RFM 标签时用「Baby Age Clock 分群」类技能；要预测单个 SKU 的销量曲线时用时序预测类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 分群"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Infant-Lifecycle-Purchase-Rhythm"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "用婴儿 0-24 月龄的发育节律判断妈妈下一步要买什么，提前把货备到位、把推荐投到对的时间。"
user_try: "试试：按我用户的宝宝月龄分布，预测未来 6 周会集中爆发的品类，并给出备货与首页投放建议。"
whenToUse: "需求由月龄这条生物发育时钟驱动、要预判下一个高需求品类与时机时用；只是给用户分层打标签时用分群类技能；只修销量曲线时用时序预测类技能。"
workflow: "用月龄推断结果把用户映射到 0-24 月龄窗口 → 按月龄-品类触达矩阵确定下一高需求品类 → 对目标品类提前 6 周预测需求峰值 → 在首页动态注入月龄-品类模块"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Infant Lifecycle Purchase Rhythm — 婴儿 0-24 月龄标准消费品类时序图谱建模

## ① 解决的问题

运营团队面临"辅食工具每季度OOS占货架30%、备货计划无法预判月龄分布驱动的需求峰值"——婴儿0-24月龄消费品类时序图谱提前6周预判需求峰值，OOS率降低60%，年化节省缺货损失约4.8万美元

## ② 核心算法逻辑

母婴消费的本质是由生物发育节律驱动的刚需序列——不是随机的，不是季节性的，而是婴儿身体发育时钟触发的可预测序列：

## ③ 业务应用场景

业务问题：独立站首页只能展示有限商品，但不同月龄的妈妈需要的东西完全不同。对一个4月龄宝宝的妈妈推荐学步车毫无意义，而对7月龄宝宝的妈妈不推荐辅食工具是巨大的错失。
方案： 1. 用 Baby Age Clock（Skill-Baby-Age-Clock-RFM-Enhancement）推断用户婴儿月龄 2. 用 Infant Lifecycle Purchase Rhythm 预测该月龄用户的"下一个高需求品类" 3. 在首页动态注入月龄-品类推荐模块（不需要用户填写任何信息）
月龄-品类触达时机矩阵（核心输出，可直接用于内容运营）：

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月龄感知首页推荐 CTR 提升 35-50%，辅食类 OOS 率降低 60%，年化节省缺货损失约 $4.8 万 + 推荐效率提升带来 GMV 增量约 $12 万，合计 $16.8 万/年
实施难度：⭐⭐☆☆☆（品类-月龄映射表建立 1 周，需求预测模型接入 2 周，总计约 3 周）
优先级：⭐⭐⭐⭐⭐（母婴电商独有的"时间武器"——竞品如果没有月龄感知能力，在触达时机上天然处于劣势）
评估依据：PCIC 在 Target 亿级用户验证，NDCG 提升 16%，Recall 提升 2%；MIT Sloan 母婴 App 案例显示月龄感知推荐转化率 +89%（vs 最热门推荐）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（279 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 20 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Infant Lifecycle Purchase Rhythm
婴儿生命周期消费节律建模——品类时序图谱 + 下一品类预测

依赖：numpy, pandas, scipy
"""

import numpy as np
import pandas as pd
from scipy.stats import expon, lognorm
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 婴儿生命周期品类时序图谱
# ─────────────────────────────────────────────

INFANT_LIFECYCLE_RHYTHM = {
    'newborn_essentials': {
        'age_window': (0, 1),
        'urgency_peak': 0,
        'repurchase_weeks': 3,
        'categories': ['newborn_diapers', 'formula_stage1', 'swaddle', 'newborn_clothing'],
    },
    'early_infant': {
        'age_window': (1, 4),
        'urgency_peak': 2,
        'repurchase_weeks': 4,
        'categories': ['formula_stage1', 'diaper_s', 'baby_bath', 'teether_early'],
    },
    'pre_solids_prep': {
        'age_window': (3.5, 4.5),
        'urgency_peak': 4,
        'repurchase_weeks': None,
        'categories': ['high_chair', 'baby_spoon', 'rice_cereal', 'silicone_bib'],
        'is_milestone': True,
        'advance_weeks': 3,
    },
    'solids_intro': {
        'age_window': (4, 8),
        'urgency_peak': 5,
        'repurchase_weeks': 2,
        'categories': ['baby_puree', 'formula_stage2', 'diaper_m', 'teether'],
    },
    'pre_crawling': {
        'age_window': (7, 9),
        'urgency_peak': 8,
        'repurchase_weeks': None,
        'categories': ['crawling_mat', 'safety_gate', 'knee_pads', 'pull_toy'],
        'is_milestone': True,
        'advance_weeks': 2,
    },
    'mobile_infant': {
        'age_window': (9, 12),
        'urgency_peak': 10,
        'repurchase_weeks': 4,
        'categories': ['formula_stage2', 'diaper_l', 'finger_food', 'walker'],
    },
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2308.01195 — Personalized Category Frequency prediction for Buy It Again recommendations

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户宝宝月龄（注册生日或推断结果）、各月龄段历史购买转化率、各品类销售时序；粒度：用户×月龄段×品类。

**输出**：月龄-品类触达时机矩阵与未来 6 周的品类需求峰值预测，供备货计划与首页、内容运营使用。

## 执行步骤

1. 建立 0-24 月龄品类时序图谱，标注复购周期与紧迫度峰值
2. 推断目标用户婴儿月龄并落到月龄窗口
3. 按矩阵输出下一高需求品类与触达时机
4. 提前 6 周输出品类需求峰值驱动备货
5. 把月龄-品类模块注入首页或内容位

## 边界与不做

- 数据不满足时不用：没有月龄信号（未填生日且购买史无法推断）的用户群落不到月龄窗口。
- 能力边界：输出触达时机与品类峰值，不替代单品级销量预测，也不代为下单。

## 技能关联

- **前置**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Baby-Age-Clock-RFM-Enhancement.html、Skill-Baby-Age-Clock-RFM-Enhancement、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting
- **延伸**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-Infant-Lifecycle-Purchase-Rhythm

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Infant-Lifecycle-Purchase-Rhythm`