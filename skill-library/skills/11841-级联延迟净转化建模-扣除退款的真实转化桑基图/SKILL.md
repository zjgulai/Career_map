---
name: "p2s-tesla-netcvr-cascade"
title: "级联延迟净转化建模 - 扣除退款的真实转化桑基图"
description: "触发词：净转化、退款率、级联延迟、去偏、桑基图、素材排序。何时不用：只处理点击到购买的单段延迟用轨迹条件延迟转化那张卡；要把退款纳入转化口径、用净转化排序素材与预算时用本卡。安全边界：退款与订单数据属敏感经营数据，须脱敏使用，不得对外披露或推断个体用户退款倾向。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-TESLA-NetCVR-Cascade"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "把退款从转化里扣掉，用净转化而不是毛转化来排素材、分预算，避免投给高退款的噱头商品。"
user_try: "试试：这是我点击到购买再到退款的级联数据，帮我做两段延迟去偏，输出净转化率和按 NetCVR 排序的素材清单。"
whenToUse: "与「轨迹条件延迟转化」相比：TRACE 解决点击到购买的单段延迟与 CVR 实时更新；要扣除退款、算净转化并据此排序素材时用本卡。"
workflow: "整理点击→购买→退款的级联事件与延迟分布 → 分别对 CVR 延迟与退款率延迟做去偏 → 用共享底层模型输出 NetCVR 并对素材重排序 → 把预算从高退款品类迁向高净转化品类并评估净 GMV"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 级联延迟净转化建模 - 扣除退款的真实转化桑基图

## ① 解决的问题

广告经理面临CVR预测不稳——TESLA-NetCVR将转化误差17%压到6%，年化增31万元

## ② 核心算法逻辑

传统 CVR（转化率）模型只建模"点击→购买"，忽略退款行为，导致：

## ③ 业务应用场景

业务痛点： 母婴出海跨境电商（如 TikTok Shop、Shopify + Meta Ads 投放）存在高退款率： - 尿布、奶粉等标品：退款率 3-8%（质量正常） - 婴童玩具、服装：退款率 15-25%（尺码/描述不符） - 广告优化用毛转化 ROAS，会把预算倾斜给"点击率高但退款也高"的素材
业务价值： - 桑基图终点改为"净转化"，真实反映 GMV 贡献 - 广告素材排序从 CVR 排序改为 NetCVR 排序，预期减少 20-30% 退款量 - 预算从高退款率品类向高净转化品类重新分配 - 以 1000 万月均 GMV 为例，如退款率从 15% 降至 10%，净 GMV 提升约 59 万
业务问题：主页推荐的商品推荐分 = CTR × CVR，未考虑退款。高转化但高退款的"噱头商品"排名过高。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

vs TRACE（Skill-TRACE-Delayed-CVR）：TRACE 处理单段延迟（点击→购买）；TESLA 处理两段级联延迟（+退款），目标是净转化而非毛转化
vs ROAS-Budget（Skill-ROAS-Budget-Optimization）：ROAS 优化是下游；TESLA 提供更准确的 NetCVR 信号输入给 ROAS 模型
vs PVM（Skill-PVM-Attribution-Window）：PVM 协调不同触点的归因窗口；TESLA 专注于同一触点的两段延迟去偏

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（761 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：10」并记录位置 `paper2skills-code/advertising/tesla_netcvr_cascade` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-TESLA-NetCVR-Cascade.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TESLA: 级联延迟净转化率预测
论文: arXiv:2601.19965 (WWW 2026, Taobao)

功能:
    1. 模拟跨境电商级联延迟数据（点击→购买→退款）
    2. 两阶段去偏（CVR 延迟去偏 + RFR 延迟去偏）
    3. 共享底层 CVR-RFR 级联模型
    4. 延迟感知排序损失
    5. 评估 NetCVR AUC / PR-AUC / PCOC

依赖: numpy, pandas, scikit-learn, torch
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────
# 1. 数据模拟：跨境母婴电商级联延迟数据
# ─────────────────────────────────────────────

def simulate_cascade_delay_data(
    n_clicks: int = 10000,
    cvr_base: float = 0.08,
    rfr_base: float = 0.12,
    conv_delay_scale: float = 24.0,   # 小时，指数分布均值
    refund_delay_scale: float = 72.0,  # 小时，指数分布均值
    obs_window_hours: float = 48.0,    # 观测截止窗口
    seed: int = 42
) -> pd.DataFrame:
    """
    模拟点击→购买→退款的级联延迟数据流。

    Returns:
        DataFrame with columns:
            click_id, features (x0~x4), click_time,
            true_cvr, true_rfr,
            y_true (购买标签), z_true (退款标签),
            conv_delay (hours), refund_delay (hours from purchase),
            y_obs (观测窗口内是否看到购买), z_obs (是否看到退款),
            sample_type ('immediate' | 'delayed_pos' | 'fake_neg')
    """
    rng = np.random.RandomState(seed)

    # 特征：用户历史购买次数、品类偏好得分、价格敏感度等
    x = rng.randn(n_clicks, 5)
    x[:, 0] = np.clip(x[:, 0], -3, 3)  # 历史购买频次（标准化）

    # 真实 CVR（与特征相关）
    true_cvr = 1 / (1 + np.exp(-(cvr_base * 5 + x[:, 0] * 0.3 + x[:, 1] * 0.2)))
    true_cvr = np.clip(true_cvr, 0.01, 0.6)

    # 真实 RFR（与 CVR 负相关但有独立维度，高 CVR 用户退款率略低）
    rfr_logit = rfr_base * 3 - x[:, 0] * 0.15 + x[:, 2] * 0.25
    true_rfr = 1 / (1 + np.exp(-rfr_logit))
    true_rfr = np.clip(true_rfr, 0.02, 0.5)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2601.19965。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：点击级事件数据（点击时间、是否购买、购买时间、是否退款、退款时间）与素材/品类标识；需覆盖足够观测窗口以估计两段延迟分布。

**输出**：去偏后的 NetCVR 预测、退款感知的素材排序、净转化桑基图与预算迁移建议（卡页：退款率 15%→10% 时净 GMV 提升约 59 万），供广告经理与选品团队使用。

## 执行步骤

1. 整理点击、购买、退款三级事件并拟合两段延迟分布。
2. 去偏未到观测窗口的转化，修正 CVR 延迟。
3. 去偏退款延迟，得到退款率修正估计。
4. 用共享级联模型输出每次点击的 NetCVR 并按净转化排序素材。
5. 输出净转化桑基图与预算迁移建议。

## 边界与不做

- 何时不用：没有退款数据、或观测窗口过短无法估计延迟分布时不要用；只关心毛转化优化不需要本卡。
- 能力边界：只产出净转化估计、排序与建议，不修改广告投放；误差 17%→6%、净 GMV +59 万等为卡页案例值。
- 安全边界：退款与订单明细须脱敏，不得对外披露，也不得据此对个体做歧视性处理。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-TESLA-NetCVR-Cascade

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-TESLA-NetCVR-Cascade`