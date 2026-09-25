---
name: "p2s-visual-data-collection"
title: "Visual Data Collection — 电商图文视频数据采集与 AI 视频生成素材库构建"
description: "触发词：视觉素材采集、图文视频采集、素材库、CLIP 过滤、图片质量评估。何时不用：需要直接使用竞品版权图片时不可用；只做素材版本回滚走素材版本管理。安全边界：卡页原文明示素材仅用于风格学习参考、不直接使用版权图片，采集范围须符合平台规则。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 素材版本管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Visual-Data-Collection"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把图文视频素材采集进分层素材库，给 AI 视频生成当风格参考，省下外拍成本。"
user_try: "试试：采集这批竞品主图和短视频，建一个可供 AI 视频生成参考的素材库。"
whenToUse: "要为 AI 视频生成或内容创作准备参考素材、又不想反复外拍时用；需要直接复用有版权素材时不能用本技能。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Visual Data Collection — 电商图文视频数据采集与 AI 视频生成素材库构建

## ① 解决的问题

研究助理面临图片标注采集慢——视觉采集将标注工时降55%，年化省9万元

## ② 核心算法逻辑

AI 视频生成的质量上限由训练/推理时使用的视觉素材库质量决定。母婴电商品牌的视频生成场景（产品展示、使用场景、开箱体验）需要：

## ③ 业务应用场景

业务背景：某品牌新品上架时，产品摄影成本 ¥15,000/次（6-8 张主图），且周期长达 2 周。目标是通过采集竞品高质量图片，构建素材库供 AI 视频生成工具参考（风格学习，不直接使用版权图片）。
ROI 量化： - 素材库构建成本：¥2,400（API+带宽），节省传统摄影 ¥15,000/轮 - AI 生成 20 秒展示视频：¥800/条（vs 传统拍摄 ¥8,000/条） - 首年节省 ¥12,600/次 × 4 次新品上架 = ¥50,400
业务背景：运营团队需要了解"竞品在小红书/TikTok 上哪类视频素材效果最好"，提取高互动视频的视觉特征，作为自有内容创作的参考。

## ④ 输入数据要求

`quality_threshold=0.65`（主图库，严格）
`quality_threshold=0.40`（参考素材库，宽松）

## ⑤ 输出结果

`quality_threshold=0.65`（主图库，严格）
`quality_threshold=0.40`（参考素材库，宽松）

## ⑥ 业务价值 / ROI

380 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（394 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/visual_content/visual_data_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Visual-Data-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Visual Data Collection Pipeline
整合 VisualCrawl (CLIP过滤) + EcomVisQA (质量评估) + VideoMetaGen (语义标注)
使用 mock 数据，可直接运行（无需 GPU/真实模型）
"""

import re
import random
import math
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from pathlib import Path


# ── 数据结构 ────────────────────────────────────────────────────────────

@dataclass
class VisualAsset:
    """视觉素材记录"""
    asset_id: str
    asset_type: str       # image / video
    url: str
    source: str           # amazon / xiaohongshu / tiktok / 1688
    width: int
    height: int
    file_size_kb: float
    has_watermark: bool
    raw_metadata: Dict    # 原始采集 metadata


@dataclass
class QualityScore:
    """图片质量评分"""
    asset_id: str
    resolution: float     # 0-1
    sharpness: float      # 0-1
    composition: float    # 0-1
    aesthetics: float     # 0-1
    clutter: float        # 0-1
    overall: float        # 加权综合分
    grade: str            # HIGH / MEDIUM / LOW


@dataclass
class VisualMetadata:
    """语义标注结果"""
    asset_id: str
    asset_type: str
    visual_desc: str
    objects: List[str]
    scene_type: str       # white_bg / product_usage / lifestyle / unboxing
    dominant_hue: float   # HSV 色调主值
    aspect_ratio: str     # 16:9 / 9:16 / 1:1
    aesthetic_score: float
    is_usable: bool       # 综合判断是否可用


# ── VisualCrawl：CLIP 相关性过滤（Mock） ────────────────────────────────
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2409.11203，但该号在 arXiv 上是《Ultra-low $Q_β$ value for the allowed decay of $^{110}$Ag$^m$ confirmed via mass measurements》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待采集的图文视频来源（竞品或自有素材），以及质量阈值配置（卡页示例：主图库 0.65、参考素材库 0.40）

**输出**：分层素材库（主图库/参考素材库）与素材质量评分、语义标注，供 AI 视频生成与内容创作参考使用

## 执行步骤

1. 按来源清单采集图文视频素材，落成统一资产结构。
2. 用 CLIP 一类过滤与质量评估给素材打分（如 0.65 与 0.40 两档阈值）。
3. 对通过阈值的素材做语义标注，形成可检索元数据。
4. 按主图库与参考素材库分层归档，并标注版权使用限制。

## 边界与不做

- 何时不用：需要直接使用竞品版权图片时不能用；只做素材版本与回滚请转素材版本管理。
- 能力边界：只产出素材库与标注元数据，不生成视频，也不做版权授权。
- 安全边界：卡页原文明示素材仅用于风格学习参考、不直接使用版权图片，采集须遵守平台规则。

## 技能关联

- **前置**：Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing、Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **延伸**：Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation
- **可组合**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Synthetic-Data-Ecommerce.html、Skill-Synthetic-Data-Ecommerce、Skill-Visual-Data-Collection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：20-AI视频生成　·　源卡：`Skill-Visual-Data-Collection`