---
name: "p2s-cultural-data-collection"
title: "Cultural Data Collection — 跨文化 UGC 采集与母婴消费文化差异识别"
description: "触发词：跨文化UGC采集、文化差异识别、多市场评论、本地化洞察、UGC去噪。何时不用：只做单一市场评论情感分析时用情感 ML 管道技能；要从评论中抽取实体关系时用统一信息抽取技能。安全边界：UGC 采集须遵守平台条款与隐私要求，结论不得作为对特定市场人群的歧视性依据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Cultural-Data-Collection"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把不同市场同一品类的好评差评放在一起比，找出当地消费者真正在意的点，别再直接翻译国内文案。"
user_try: "试试：采集日本和美国同一品类婴儿润肤霜的评论，比出文化差异维度，告诉我日本版该改哪些卖点。"
whenToUse: "要进入新市场、需要从当地 UGC 挖出文化差异与卖点时用本技能；只判断单一市场的评论情感极性，用情感 ML 管道技能。"
workflow: "确定目标市场与基准市场 → 采集多语言 UGC 并做真实性过滤 → 标注文化维度信号与情感 → 计算相对基准市场的文化差异指数 → 输出本地化改版建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cultural Data Collection — 跨文化 UGC 采集与母婴消费文化差异识别

## ① 解决的问题

市场研究员面临本地文化样本不足——文化采集将洞察覆盖率提35%，年化省8万元

## ② 核心算法逻辑

跨文化 UGC（用户生成内容）采集面临的核心挑战是：文化语境的不可迁移性——相同语义在不同文化中承载截然不同的消费偏好信号。例如"天然/natural"在美国 Amazon 评论中是正面信号，在日本评论中需要结合"安心感"（安全感）语境才能判断其权重；而中文评论中的"刷单痕迹"（短句、无具体描述）本身就是需要过滤的噪声。

## ③ 业务应用场景

业务背景：某品牌婴儿润肤霜同款产品在美国 Amazon 评分 4.7（热销），在日本乐天平台评分仅 3.9（滞销）。数据分析团队需要定量识别消费文化差异，指导日本本地化改版。
ROI 量化： - 日本版改版后 3 个月：乐天评分 3.9 → 4.5，月销售额 +¥280 万（+47%） - UGC 分析成本：¥8,000（API 费用），ROI ≈ 350x
业务背景：品牌准备进入印尼（Tokopedia）和越南（Shopee）市场，需要从竞品 UGC 中挖掘当地消费者最看重的产品属性，避免"直接翻译中国版营销内容"的失误。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

语言检测：建议接入 `langdetect` 或 `fasttext` 自动识别语言，避免错误分配文化维度
关键词扩展：`DIMENSION_KEYWORDS` 应由领域专家 + LLM 协作扩展（当前为示意）
采样偏差：高星评论在公开平台上比例偏高，分析时注意加权

## ⑥ 业务价值 / ROI

280 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（351 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/ai_humanities/cultural_data_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-Cultural-Data-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Cultural UGC Data Collection & Analysis Pipeline
整合 CrossCultural 文化维度标注 + CulturalBERT 迁移 + UGC-Trust-Filter 噪声过滤
使用 mock 数据，可直接运行
"""

import re
import random
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime


# ── 数据结构 ────────────────────────────────────────────────────────────

@dataclass
class UGCRecord:
    """原始 UGC 评论记录"""
    review_id: str
    market: str          # US / JP / CN / ID / VN
    language: str        # en / ja / zh / id / vi
    text: str
    rating: int          # 1-5
    verified_purchase: bool
    timestamp: datetime
    platform: str        # amazon / rakuten / tokopedia / shopee


@dataclass
class CulturalSignal:
    """文化维度信号"""
    review_id: str
    market: str
    trust_score: float      # UGC 真实性得分（0-1）
    is_authentic: bool      # 是否真实 UGC
    hofstede_signals: Dict[str, float]  # {UAI: 0.8, IDV: 0.3, ...}
    key_topics: List[str]   # 抽取的关键业务话题
    sentiment: str          # positive / negative / neutral
    cultural_diff_index: float  # 相对基准市场的文化差异指数


# ── UGC-Trust-Filter：文化感知噪声过滤 ──────────────────────────────────

class UGCTrustFilter:
    """
    文化感知噪声过滤器
    不同市场的刷单/虚假评论有不同语言学特征
    """

    # 市场特定刷单关键词（简化版，实际需扩展）
    SPAM_PATTERNS = {
        "CN": [r"很好", r"不错", r"五星好评", r"推荐"],  # 过于简短的套话
        "US": [r"highly recommend", r"five stars", r"love it"],  # 过于通用
        "JP": [r"良い商品", r"おすすめ"],
    }

    # 市场特定权重（UAI 高的市场，verified_purchase 权重更高）
    MARKET_WEIGHTS = {
        "US": {"length": 0.25, "specificity": 0.30, "temporal": 0.20, "verified": 0.25},
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2410.09832 — Collecting single photons from a cavity-coupled quantum dot using an adiabatic tapered fiber

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：多市场 UGC 评论（含市场、语言、文本、评分、是否验证购买、平台字段）与目标市场清单，粒度到单条评论。

**输出**：带真实性得分、情感与文化差异指数的结构化信号表，以及跨市场差异洞察与本地化建议；输出语言检测建议接入自动识别工具，并对高星评论占比偏高带来的采样偏差做加权。

## 执行步骤

1. 确定目标市场与基准市场，划定采集范围
2. 采集多语言 UGC 并做刷单与噪声过滤
3. 计算每条评论的真实性得分与文化差异指数
4. 对比基准市场，识别影响评分的文化差异
5. 输出本地化改版建议并标注采样偏差

## 边界与不做

- 目标市场 UGC 样本过少或公开平台高星评论占比异常时结论偏差大；只看单一市场时无需本技能。
- 本技能产出文化差异信号与改版建议，不负责本地化翻译与合规审查，也不保证案例中的提升幅度可复现。

## 技能关联

- **前置**：Skill-Emotional-AI-Customer-Care.html、Skill-Emotional-AI-Customer-Care、Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **延伸**：Skill-Multilingual-Customer-Service-Translation.html、Skill-Multilingual-Customer-Service-Translation
- **可组合**：Skill-Clickstream-Persona-Pipeline.html、Skill-Clickstream-Persona-Pipeline、Skill-Review-Dedup-Quality-Filter.html、Skill-Review-Dedup-Quality-Filter、Skill-Cultural-Data-Collection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：11-AI人文　·　源卡：`Skill-Cultural-Data-Collection`