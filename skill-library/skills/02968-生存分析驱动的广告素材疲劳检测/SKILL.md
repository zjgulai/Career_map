---
name: "p2s-creative-fatigue-detection"
title: "Creative Fatigue Detection — 生存分析驱动的广告素材疲劳检测"
description: "触发词：素材疲劳、CTR 衰减、路径签名、投放诊断、下线时机。何时不用：新素材还没跑量、没有多日 CTR 序列时无法判断疲劳，效果预估应改用素材预测类技能。安全边界：只使用投放平台自身的真实表现数据，不得为规避平台规则伪造或选择性剔除数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-094"
l3_business: "素材版本管理"
l3_all: "素材版本管理 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/素材版本管理"
p2s_card_id: "Skill-Creative-Fatigue-Detection"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯着每支素材的点击率走势，在它开始拖累账户之前提醒你换素材或下线。"
user_try: "试试：用我这 5 款 Meta 素材的逐日 CTR 序列判断哪些已经疲劳，给出下线与替换的时点建议。"
whenToUse: "素材已累计多日投放数据、CTR 出现下滑迹象时用本技能；素材冷启动期的效果预测用预测类技能。"
workflow: "接入素材逐日曝光、点击、转化与花费序列 → 计算 CTR/CVR/CPC 指标与路径签名衰减特征 → 识别疲劳起点并关联 ROAS 下滑 → 输出需要下线或替换的素材清单与时点建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Creative Fatigue Detection — 生存分析驱动的广告素材疲劳检测

## ① 解决的问题

业务背景：某母婴品牌在 Meta Ads 投放婴儿奶瓶广告，上线 5 款素材（主图+短视频各类型）

## ② 核心算法逻辑

广告素材疲劳（Creative Fatigue）是指：同一批用户反复看到相同广告后，CTR、CVR 等核心指标持续衰减的现象。

## ③ 业务应用场景

业务背景：某母婴品牌在 Meta Ads 投放婴儿奶瓶广告，上线 5 款素材（主图+短视频各类型）。初始 ROAS 4.2，但第 21 天起 ROAS 持续下滑，未能及时发现素材疲劳。
量化 ROI： - 月均素材疲劳损失（未检测）：约 $3,000-$6,000 - 应用检测后减少损失：65-75%，月均节约 $2,000-$4,500 - 实施成本：一次性开发约 20 小时
业务背景：某婴儿推车品牌在 Amazon SB 投放 3 支产品视频，每支生命周期约 2-4 周。手动监控 3 支视频的 CTR 变化消耗大量人力，且经常错过最优下线时机。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（430 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/advertising/creative_fatigue_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Creative-Fatigue-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Creative Fatigue Detection
生存分析 + 路径签名的广告素材疲劳检测系统

依赖：numpy, pandas, scipy, lifelines (pip install lifelines)
测试：python -m pytest test_creative_fatigue.py -v
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from scipy import stats


@dataclass
class CreativeMetrics:
    """广告素材每日指标"""
    creative_id: str
    date: str
    impressions: int
    clicks: int
    conversions: int
    spend: float
    
    @property
    def ctr(self) -> float:
        return self.clicks / self.impressions if self.impressions > 0 else 0.0
    
    @property
    def cvr(self) -> float:
        return self.conversions / self.clicks if self.clicks > 0 else 0.0
    
    @property
    def cpc(self) -> float:
        return self.spend / self.clicks if self.clicks > 0 else 0.0


class PathSignatureCalculator:
    """
    路径签名计算器
    从 CTR 时间序列中提取趋势衰减特征
    """
    
    @staticmethod
    def compute_level1_signature(ctr_series: List[float]) -> float:
        """
        一阶签名：总变化量
        S^1 = Σ ΔCTR_t = CTR_T - CTR_0
        """
        if len(ctr_series) < 2:
            return 0.0
        return ctr_series[-1] - ctr_series[0]
    
    @staticmethod
    def compute_level2_cross_signature(ctr_series: List[float]) -> float:
        """
        二阶交叉签名：时间加权 CTR 变化
        S^12 = Σ_t t * ΔCTR_t
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.09758 — A Path Signature Framework for Detecting Creative Fatigue in Digital Advertising

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：素材级逐日投放序列：曝光、点击、转化、花费（可换算 CTR/CVR/CPC 与 ROAS），至少覆盖一个完整投放周期。

**输出**：每支素材的疲劳判定与衰减特征值、建议下线或替换的时点与优先级清单；供投放优化师执行调整。

## 执行步骤

1. 接入素材逐日投放数据并计算 CTR/CVR/CPC
2. 提取 CTR 时间序列的趋势衰减特征
3. 判定疲劳起点并关联 ROAS 下滑
4. 输出需要下线或替换的素材清单
5. 给出替换节奏与监控阈值建议

## 边界与不做

- 素材投放天数过短、数据点不足时不用本技能，衰减趋势不可信。
- 本技能输出疲劳判定与下线建议，不直接操作广告后台暂停或替换素材。
- 安全边界：仅使用投放平台自身的真实表现数据，不得伪造或选择性剔除数据。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Creative-Fatigue-Detection

---

> 分类：业务运营/品牌与增长/素材版本管理　·　技术族：13-广告分析　·　源卡：`Skill-Creative-Fatigue-Detection`