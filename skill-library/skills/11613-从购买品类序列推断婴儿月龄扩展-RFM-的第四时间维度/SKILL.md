---
name: "p2s-baby-age-clock-rfm-enhancement"
title: "Baby Age Clock RFM Enhancement — 从购买品类序列推断婴儿月龄，扩展 RFM 的第四时间维度"
description: "触发词：婴儿月龄推断、RFM 升级、购买序列建模、关键节点触达、生命周期分群。何时不用：要估计促销对不同人群的因果效应用 DML 群体异质性技能，本技能只从购买品类序列推断月龄并纠正 RFM 误判。安全边界：宝宝生日与月龄属儿童相关信息，须明示授权并遵守儿童数据保护规定，月龄标签不得用于医疗或健康建议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-Baby-Age-Clock-RFM-Enhancement"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "从买过什么推断宝宝现在几个月，把被 RFM 误判成流失的妈妈找回来。"
user_try: "试试：用购买品类序列推断我们会员的宝宝月龄，把被 RFM 错误降级的关键节点用户找出来。"
whenToUse: "已有 RFM 分层但怀疑把生命周期节点前的正常沉默误判为流失时用本技能；要估计促销对不同人群的因果效应用 DML 群体异质性技能，要生成人群标签用画像类技能。"
workflow: "建立本地化品类与月龄映射表 → 从购买品类序列推断婴儿月龄 → 把月龄作为第四维扩展 RFM → 识别被错误降级的关键节点用户 → 按节点触发专项触达"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Baby Age Clock RFM Enhancement — 从购买品类序列推断婴儿月龄，扩展 RFM 的第四时间维度

## ① 解决的问题

用户分析师面临"RFM将辅食准备期妈妈错误标记为流失用户、关键节点前触达完全缺失"——从购买品类序列推断婴儿月龄扩展RFM第四维度，纠正15-20%用户的错误降级，年化GMV增量约4.5万美元

## ② 核心算法逻辑

核心思想（来自 VOID 盲点 B003）

## ③ 业务应用场景

业务问题：RFM 系统将某批用户标记为"M2F2R3"（中等价值，频率偏低，较久未购），建议降低触达频次或不发券。但这批用户其实是"宝宝即将进入辅食期的妈妈们"——她们的沉默不是流失信号，而是等待辅食期到来的正常行为间隙。RFM 错误地把生命周期节点前的正常蓄力期识别为价值下降。
方案： 1. 用 Baby Age Clock 推断每个用户的婴儿当前月龄（±1个月精度） 2. 识别月龄在 3.5-4.5 个月的用户（辅食准备期） 3. 无论其 RFM 分段，对这批用户发送"辅食品类"的专项触达
预期产出：被 RFM 错误降级的"关键节点用户"占比约 15-20%，正确识别后的复购率提升约 2.5x

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：5,000 活跃会员中识别 750-1,000 名被 RFM 错误降级的关键节点用户，正确触达后复购率 2.5x，年化 GMV 增量约 $4.5 万；同时月龄个性化推荐 CTR 提升 28-40%，$5 万/月广告预算年化增效约 $16 万
实施难度：⭐⭐☆☆☆（核心逻辑简单，关键是建立本地化品类-月龄映射表，约 1-2 周）
优先级：⭐⭐⭐⭐⭐（直接修复现有 RFM 系统的系统性偏差，是"低成本高价值"的关键升级）
评估依据：KDD 2015 淘宝生产部署验证，母婴品类月龄预测准确率显著优于随机基线；"Cart Knows First" 2026 在 Instacart 数据集 AUC=0.901，验证了购买序列对人生阶段的强预测力
VOID 来源备注：本 Skill 来自第三象限 → 盲点B003（RFM 在婴儿月龄节点失效）→ VOID Q2-2026 Session → AQ-004 激活 → 正式Skill

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（276 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Baby Age Clock RFM Enhancement
从购买品类序列推断婴儿月龄，扩展 RFM 为 RFM-A

依赖：numpy, pandas, scikit-learn
论文实现：KDD 2015 Semi-Markov 简化版 + SeqRFM 时序模式
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 母婴品类月龄映射表（核心知识库）
# ─────────────────────────────────────────────

BABY_AGE_SIGNALS = {
    'formula_stage_1': (0, 6),    # 1段奶粉：0-6个月
    'formula_stage_2': (6, 12),   # 2段奶粉：6-12个月
    'formula_stage_3': (12, 36),  # 3段奶粉：12-36个月
    'diaper_nb':       (0, 2),    # 尿布NB码：0-2个月
    'diaper_s':        (2, 5),    # 尿布S码：2-5个月
    'diaper_m':        (5, 10),   # 尿布M码：5-10个月
    'diaper_l':        (10, 18),  # 尿布L码：10-18个月
    'diaper_xl':       (18, 36),  # 尿布XL码：18-36个月
    'solid_food_intro': (4, 8),   # 辅食引入：4-8个月
    'finger_food':     (8, 14),   # 手指食物：8-14个月
    'toddler_snack':   (12, 36),  # 幼儿零食：12-36个月
    'teether':         (3, 10),   # 牙胶：3-10个月
    'walker':          (9, 15),   # 学步车：9-15个月
    'potty_trainer':   (18, 36),  # 如厕训练：18-36个月
}


def infer_baby_age_from_purchase(
    purchase_history: List[Dict],
    method: str = 'bayesian'
) -> Tuple[float, float]:
    """
    从购买历史推断婴儿当前月龄

    Args:
        purchase_history: 列表，每项含 {'category': str, 'date': datetime, 'quantity': int}
        method: 'bayesian' | 'latest_signal' | 'weighted_average'

    Returns:
        (estimated_age_months, confidence) — 估算月龄和置信度
    """
    if not purchase_history:
        return -1.0, 0.0

    # 找到最近的月龄相关购买
    age_signals = []
    now = pd.Timestamp.now()

    for purchase in purchase_history:
        cat = purchase.get('category', '')
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2411.05317 — SeqRFM: Fast RFM Analysis in Sequence Data

核验口径：主题指向成立但强度不足（词重合 0.167／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：会员订单与购买品类序列（用户、商品、购买时间）、本地化的品类与月龄映射表（如奶粉段位、尿布码数对应的月龄区间）、现有 RFM 分层结果。

**输出**：每个用户的婴儿月龄推断结果（卡页口径 ±1 个月精度）与扩展后的 RFM 分层，以及被 RFM 错误降级的关键节点用户名单与专项触达建议；卡页口径复购率提升约 2.5 倍、年化 GMV 增量约 4.5 万美元。

## 执行步骤

1. 建立本地化的母婴品类与月龄映射表。
2. 从用户购买品类序列推断婴儿当前月龄。
3. 把月龄作为时间维度并入 RFM，得到扩展分层。
4. 识别被 RFM 错误降级的关键节点用户，如辅食准备期妈妈。
5. 按生命周期节点触发专项品类触达并跟踪复购。

## 边界与不做

- 缺少本地化品类与月龄映射表、或购买序列过于稀疏时不要用，月龄推断精度不可控。
- 能力边界：本技能只纠正分群偏差并给出触达建议，不直接发放权益、不保证复购倍数；卡页的复购与 GMV 数字为特定会员规模下的估算。
- 合规红线：宝宝生日与月龄属儿童相关信息，须取得明确授权并遵守儿童数据保护规定，不得用于医疗或健康建议。

## 技能关联

- **前置**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Infant-Lifecycle-Purchase-Rhythm.html、Skill-Infant-Lifecycle-Purchase-Rhythm、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Infant-Lifecycle-Purchase-Rhythm.html、Skill-Infant-Lifecycle-Purchase-Rhythm、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing
- **可组合**：Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Baby-Age-Clock-RFM-Enhancement

---

> 分类：业务运营/品牌与增长/分群　·　技术族：14-用户分析　·　源卡：`Skill-Baby-Age-Clock-RFM-Enhancement`