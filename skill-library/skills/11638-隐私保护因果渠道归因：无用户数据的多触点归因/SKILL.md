---
name: "p2s-cda-privacy-causal-attribution"
title: "CDA — 隐私保护因果渠道归因：无用户数据的多触点归因"
description: "触发词：隐私合规归因、无用户级数据、多触点权重、渠道因果影响、种草效应修正。何时不用：可用用户级数据做匹配或分层效应用 KOL 因果归因与 DML 类技能，本技能在不能追踪个体的约束下做渠道级归因。安全边界：不得为归因目的绕过用户同意获取个体数据，只使用渠道汇总数据，结论不得用于个体定向。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-CDA-Privacy-Causal-Attribution"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "不能追踪用户了，也能算出各渠道各自带来多少转化。"
user_try: "试试：在不用用户级追踪的前提下，估计 Google、Meta、TikTok 三个渠道的因果归因权重。"
whenToUse: "受隐私法规约束、无法使用用户级追踪而又需要多触点渠道归因时用本技能；有用户级数据可做匹配或分层效应估计时用 KOL 因果归因或 DML 类技能。"
workflow: "汇总各渠道日曝光与转化 → 构建渠道间因果图 → 用因果发现估计渠道影响 → 输出因果归因权重 → 据此重配渠道预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CDA — 隐私保护因果渠道归因：无用户数据的多触点归因

## ① 解决的问题

广告投放经理面临隐私下归因失真——CDA将归因偏差降25%，年化增收30万元

## ② 核心算法逻辑

传统 MTA 在隐私时代的失效

## ③ 业务应用场景

业务背景： 母婴 DTC 品牌在欧洲市场同时投放 Google、Meta、TikTok 三渠道。GDPR 合规要求下，无法使用用户级 cookie 追踪，传统 MTA 完全失效。
产出： - Google 直接归因权重：42%（ROAS 计算基准） - Meta 归因权重：35%（含 TikTok 引流的间接效应） - TikTok 归因权重：23%（较 Last-Click 低估已修正）
业务背景： 618 大促期间 Google/Meta/TikTok 三渠道同时加大投入，传统 Last-Click 把所有转化归给最后点击渠道（通常是品牌词搜索），严重低估 TikTok 的种草效应。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（344 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/marketing/cda_privacy_causal_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-CDA-Privacy-Causal-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CDA — 因果驱动归因（隐私保护多渠道归因）
论文：Causal-driven attribution (CDA): Estimating channel influence without user-level data
arXiv：2512.21211 | 2024年12月
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import math
import statistics
from collections import defaultdict


# ──────────────────────────────────────────────
# 数据类
# ──────────────────────────────────────────────

@dataclass
class ChannelTimeSeries:
    """单渠道时序数据"""
    channel_name: str
    daily_impressions: list[float]  # 每日曝光量
    daily_conversions: list[float]  # 每日转化量（汇总，非用户级）

    def __post_init__(self):
        assert len(self.daily_impressions) == len(self.daily_conversions), \
            "曝光量和转化量时序长度必须一致"

    @property
    def n_days(self) -> int:
        return len(self.daily_impressions)

    def impression_rate(self) -> list[float]:
        """归一化曝光率"""
        max_imp = max(self.daily_impressions) or 1.0
        return [x / max_imp for x in self.daily_impressions]


@dataclass
class CausalDAG:
    """因果有向无环图"""
    channels: list[str]
    edges: list[tuple[str, str, int]]  # (from_channel, to_channel, lag_days)
    edge_weights: dict[tuple[str, str], float] = field(default_factory=dict)

    def get_parents(self, channel: str) -> list[tuple[str, int]]:
        """获取某渠道的所有父节点（直接因果来源）"""
        return [(src, lag) for src, dst, lag in self.edges if dst == channel]

    def get_children(self, channel: str) -> list[tuple[str, int]]:
        """获取某渠道的所有子节点（直接因果影响）"""
        return [(dst, lag) for src, dst, lag in self.edges if src == channel]


# ──────────────────────────────────────────────
# 简化版 PCMCI 因果发现
# ──────────────────────────────────────────────

class PCMCICausalDiscovery:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.21211 — Causal-driven attribution (CDA): Estimating channel influence without user-level data
⚠️ 该号被 4 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各渠道的日级汇总时序数据（每日曝光量与转化量，非用户级），以及渠道之间已知的先后关系与投放时间表。

**输出**：各渠道的因果归因权重与相对末次点击口径的偏差修正、渠道预算重配建议；卡页示例输出 Google 42%、Meta 35%、TikTok 23%，并修正对种草渠道的低估。

## 执行步骤

1. 汇总各渠道的日级曝光与转化序列，确认不含用户级数据。
2. 构建渠道之间的因果图并标注先后关系。
3. 用因果发现方法估计各渠道对转化的影响。
4. 输出因果归因权重并与末次点击结果对比。
5. 按权重重配渠道预算并复核效果。

## 边界与不做

- 只有渠道汇总数据、且各渠道投放时间高度同步无法区分先后时不要用，因果方向无法识别。
- 能力边界：渠道级归因无法回到个体，也拆不出同一渠道内的创意差异；卡页的偏差降低与增收数字为特定口径。
- 合规红线：不得为归因目的绕过用户同意获取个体数据，只使用渠道汇总数据，结论不得用于个体定向。

## 技能关联

- **前置**：Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-CDA-Privacy-Causal-Attribution

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：15-营销投放分析　·　源卡：`Skill-CDA-Privacy-Causal-Attribution`