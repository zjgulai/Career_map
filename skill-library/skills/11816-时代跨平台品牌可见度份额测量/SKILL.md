---
name: "p2s-share-of-voice-tracking"
title: "Share of Voice Tracking — AI 时代跨平台品牌可见度份额测量"
description: "触发词：SOV、AI 引用份额、多采样、稳定性加权、竞品可见度。何时不用：要优化内容以提升 AI 引用率时用「GEO 生成式引擎优化」；只统计传统广告曝光份额不必多次采样。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-087"
l3_business: "传播规划"
l3_all: "传播规划 / 竞品研究"
l1_l2_l3: "业务运营/品牌与增长/传播规划"
p2s_card_id: "Skill-Share-of-Voice-Tracking"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "用多次采样把 AI 推荐里的品牌份额测准，说清我们在 ChatGPT 里到底落后竞品多少。"
user_try: "试试：对 20 个高频查询词在 ChatGPT 和 Perplexity 各采样 30 次，算出我们和竞品的 AI 引用份额。"
whenToUse: "需要测量 AI 搜索引擎中的品牌可见度份额、且单次测量误差过大时用；要落地内容优化提升引用率用 GEO 生成式引擎优化；传统渠道曝光份额不需要多次采样。"
workflow: "选定高频查询词列表（卡页示例 20 个） → 在 ChatGPT 与 Perplexity 各采样 30 次并记录提及与位次 → 计算稳定性加权 SOV 与稳定性分数 → 输出跨平台 SOV 矩阵并标出与竞品的差距"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Share of Voice Tracking — AI 时代跨平台品牌可见度份额测量

## ① 解决的问题

AI 搜索引擎单次测量误差高达 ±40% 无法可靠监测品牌曝光——稳定性感知 SOV 框架通过 30 次多采样将误差压缩到 ±8%，揭示 Momcozy 在 ChatGPT 的引用份额与竞品 Elvie 差 17%，指明 GEO 优化方向

## ② 核心算法逻辑

传统 SOV（Share of Voice）= 品牌广告曝光 / 市场总曝光，计算简单。但 AI 搜索引擎时代，SOV 变得极不稳定——同一个问题问 ChatGPT 两次，可能推荐不同品牌。论文证明：单次查询测量的 SOV 误差高达 ±40%，必须用多次采样 + 稳定性加权才能得到可靠估计。

## ③ 业务应用场景

业务问题：运营团队感觉"AI 好像经常推荐 Elvie 不推荐我们"，但没有数据证明，也不知道差距多大，无法制定针对性 GEO 策略。
SOV 测量方案： - 对 20 个高频查询词（"best wearable breast pump"、"quiet breast pump for work" 等） - 在 ChatGPT + Perplexity 各采样 30 次 - 计算 Momcozy vs Elvie vs Spectra 的稳定性加权 SOV
典型发现： - Momcozy AI-SOV：28%（Amazon 第一但 AI 引用第三） - Elvie AI-SOV：45%（内容策略更符合 AI 引用偏好） - Spectra AI-SOV：22%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别 SOV 差距后针对性 GEO 优化：AI 平台流量提升 30-40%
跨平台 SOV 矩阵指导预算分配：投入 ROI 提升 20-30%
竞品监测：及时发现竞品 SOV 上升，快速响应
年化综合 ROI：¥30-100 万（随 AI 搜索流量增长持续扩大）
实施难度：⭐⭐☆☆☆（LLM API 采样 + 统计计算，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（230 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/share_of_voice_tracking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Share-of-Voice-Tracking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Share of Voice Tracking — AI 时代跨平台品牌可见度测量
基于 arXiv: 2604.07585 (2026) + arXiv: 2606.10907 (2026)

依赖: re, statistics, dataclasses (标准库)
生产环境: 替换 MockLLMSampler 为真实 API
"""

from dataclasses import dataclass, field
from statistics import mean, stdev
import re


@dataclass
class BrandMention:
    """单次查询中的品牌提及"""
    query: str
    platform: str
    brand: str
    position: int       # 1 = 第一个被提及
    sample_idx: int     # 第几次采样


@dataclass
class SOVResult:
    """品牌 SOV 计算结果"""
    brand: str
    platform: str
    raw_mention_rate: float      # 简单提及率
    position_weighted_sov: float # 位置加权 SOV
    stability_score: float       # 稳定性分数（多次采样的一致性）
    sample_count: int


class MockLLMSampler:
    """
    模拟 LLM 响应采样（生产环境替换为真实 API）

    生产环境示例：
        import openai
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": query}]
        )
        return response.choices[0].message.content
    """

    # 模拟不同品牌被推荐的概率（母婴吸奶器市场）
    BRAND_PROBS = {
        "Momcozy": [0.45, 0.35, 0.20],   # 位置1/2/3的概率
        "Elvie":   [0.35, 0.40, 0.25],
        "Spectra": [0.20, 0.25, 0.55],
    }

    import random as _rand

    def sample_response(self, query: str, platform: str) -> list:
        """模拟单次 LLM 响应，返回品牌提及列表 [(brand, position)]"""
        import random
        mentions = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2604.07585，但该号在 arXiv 上是《Don't Measure Once: Measuring Visibility in AI Search (GEO)》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：查询词清单、目标品牌与竞品名单、各平台采样次数与响应文本；粒度：查询词×平台×采样次数。

**输出**：稳定性加权的跨平台 AI-SOV 矩阵与稳定性分数（卡页：单次测量误差由 ±40% 压缩至 ±8%，示例 Momcozy 28%、Elvie 45%、Spectra 22%），供传播规划与 GEO 优化优先级使用。

## 执行步骤

1. 确定查询词与品牌竞品名单
2. 在各平台多次采样并提取提及与位次
3. 计算稳定性加权 SOV
4. 输出跨平台份额矩阵与差距结论

## 边界与不做

- 数据不满足时不用：采样次数不足、或查询词与业务无关时，单次误差依旧，结论不可用。
- 能力边界：只测量份额与稳定性，不直接产生内容优化动作，需接 GEO 类技能落地。
- 能力边界：SOV 是采样估计，会随模型版本与时间漂移，需定期复测。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Share-of-Voice-Tracking

---

> 分类：业务运营/品牌与增长/传播规划　·　技术族：13-广告分析　·　源卡：`Skill-Share-of-Voice-Tracking`