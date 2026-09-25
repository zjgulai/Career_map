---
name: "p2s-multilingual-customer-service-translation"
title: "Multilingual Customer Service Translation — 多语言客服自动翻译与情绪感知保全"
description: "触发词：多语言客服、情绪感知翻译、VAD 情绪、投诉翻译、意图识别。何时不用：把商品文案本地化成 Listing 用「多语言 Listing 生成」；本技能只处理客服会话的情绪与意图保全。安全边界：买家会话与订单信息须脱敏后使用，情绪判读结果不得用于买家标签化或对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-111"
l3_business: "售后处理"
l3_all: "售后处理 / 本地化"
l1_l2_l3: "业务运营/服务与体验/售后处理"
p2s_card_id: "Skill-Multilingual-Customer-Service-Translation"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把西语德语日语等投诉翻成客服能直接处理的语言，同时保住买家真实的情绪强度和诉求意图。"
user_try: "试试：把这条西语投诉翻译成中文并保留情绪强度，再判断该走退款还是普通咨询。"
whenToUse: "当多语言买家消息需要同时保全情绪与意图、避免委婉投诉被误判为中性询问时用；纯翻译或 Listing 本地化不进本技能。"
workflow: "接入多语言买家消息并识别语种 → 用情绪控制向量做受控翻译，避免情绪信号在译文中丢失 → 在译后文本上做意图识别与方面级极性保全 → 输出译文、情绪强度与意图标签并路由处理"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multilingual Customer Service Translation — 多语言客服自动翻译与情绪感知保全

## ① 解决的问题

海外客服面临多语回复慢——多语翻译将首响时长从20分压到3分，年化省14万元

## ② 核心算法逻辑

母婴出海电商的客服场景中，买家使用西班牙语、德语、日语等多语言发起售后投诉，直接机器翻译存在两大失真：

## ③ 业务应用场景

业务背景：某母婴品牌在亚马逊墨西哥站收到西班牙语投诉，买家情绪激动（高唤醒度/低效价），若翻译后情绪信号丢失，客服将按普通询问处理，导致 48 小时超时未响应，触发 A-to-Z 索赔。
量化 ROI：每月拦截 50 件高焦虑投诉 → 防损 $7,500-$15,000/月；账号 ODR（订单缺陷率）下降 0.3%，账号健康价值约 $20,000+/年。
业务背景：日本买家文化中惯用委婉语气表达强烈不满。某款婴儿推车在日本站收到：「少々商品の説明と異なるように感じました」（稍微感觉与商品描述有些不同）。字面翻译后被误判为"中性询问"，未触发退换货流程。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（443 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/user_analytics/multilingual_customer_service_translation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Multilingual-Customer-Service-Translation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多语言客服情绪感知翻译流水线
整合 ECA-MT（情绪控制向量）+ MCS-LLM（意图识别）+ EPCL（方面级极性保全）
使用 mock 数据，无需真实模型权重即可运行
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum


# ── 数据结构定义 ────────────────────────────────────────────────────────────

class Intent(Enum):
    REFUND_URGENT = "refund_urgent"
    REFUND_NORMAL = "refund_normal"
    EXCHANGE = "exchange"
    QUALITY_QUERY = "quality_query"
    SHIPPING_INQUIRY = "shipping_inquiry"
    COMPLAINT = "complaint"
    GENERAL_INQUIRY = "general_inquiry"


@dataclass
class VADVector:
    """效价-唤醒度-支配度情绪向量"""
    valence: float    # 效价：负(-1) ↔ 正(+1)
    arousal: float    # 唤醒度：低(-1) ↔ 高(+1)
    dominance: float  # 支配度：顺从(-1) ↔ 主导(+1)

    def intensity(self) -> float:
        """情绪强度：VAD 向量模长"""
        return float(np.sqrt(self.valence**2 + self.arousal**2 + self.dominance**2))

    def cosine_similarity(self, other: "VADVector") -> float:
        a = np.array([self.valence, self.arousal, self.dominance])
        b = np.array([other.valence, other.arousal, other.dominance])
        norm_a, norm_b = np.linalg.norm(a), np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    def preservation_rate(self, translated: "VADVector") -> float:
        """情绪保全率（与模板情绪的余弦相似度）"""
        return (self.cosine_similarity(translated) + 1) / 2  # 归一化至[0,1]


@dataclass
class AspectSentiment:
    """方面级情感（EPCL）"""
    aspect: str          # 方面名（产品质量/物流/包装等）
    polarity: str        # 极性: positive/negative/neutral
    confidence: float    # 置信度


@dataclass
class CustomerMessage:
    """客服消息"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09395，但该号在 arXiv 上是《Towards Incorporating Researcher Safety into Information Integrity Research Ethics》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：原始多语言买家消息（含语种与上下文）、意图类别定义；粒度为单条会话或工单，可批量处理。

**输出**：目标语言译文、情绪向量（效价、唤醒度、支配度）与情绪保全率、意图标签与紧急度，供客服分诊与响应使用。

## 执行步骤

1. 接入多语言买家消息并识别语种
2. 用情绪控制向量做受控翻译，保留情绪信号
3. 在译后文本上做意图识别与方面级极性保全
4. 输出译文、情绪强度与意图标签
5. 把高焦虑或委婉投诉按意图路由到对应流程

## 边界与不做

- 何时不用：只需机器翻译、不需要情绪与意图判定时不适用
- 能力边界：只输出翻译与情绪意图判读，不代替客服承诺赔付，也不做买家欺诈判定

## 技能关联

- **前置**：Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA
- **延伸**：Skill-Emotional-AI-Customer-Care.html、Skill-Emotional-AI-Customer-Care
- **可组合**：Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Multilingual-Customer-Service-Translation

---

> 分类：业务运营/服务与体验/售后处理　·　技术族：14-用户分析　·　源卡：`Skill-Multilingual-Customer-Service-Translation`