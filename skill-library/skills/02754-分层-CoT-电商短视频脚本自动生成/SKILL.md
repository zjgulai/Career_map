---
name: "p2s-ai-video-script-generation"
title: "AI Video Script Generation — 分层 CoT 电商短视频脚本自动生成"
description: "触发词：分镜脚本、叙事弧设计、卖点映射、短视频脚本批量产出、A/B 变体扩展。何时不用：只需从痛点套模板出脚本文本用产品视频脚本生成技能，本技能用分层推理链产出带分镜与配音的完整脚本。安全边界：脚本不得含无依据的功效与比较宣称，AI 生成内容须按规定标注，母婴安全类表述须有依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-090"
l3_business: "创意简报"
l3_all: "创意简报 / 内容策划 / 视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/创意简报"
p2s_card_id: "Skill-AI-Video-Script-Generation"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把卖点、受众和故事线拆成三层推理，一条短视频脚本三分钟就能出。"
user_try: "试试：用 M5 吸奶器的卖点和职场妈妈受众，生成一条 30 秒 TikTok 脚本，带分镜和配音。"
whenToUse: "需要按受众意图映射卖点、设计叙事弧并产出可直接拍摄的分镜脚本、还要批量做 A/B 变体时用本技能；只想从差评痛点套模板出文本用产品视频脚本生成技能。"
workflow: "映射受众意图与卖点 → 设计痛点、冲突、解决、行动召唤叙事弧 → 生成分镜与配音脚本 → 输出多版本 A/B 变体 → 交付制作与投放验证"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Video Script Generation — 分层 CoT 电商短视频脚本自动生成

## ① 解决的问题

TikTok母婴广告运营面临脚本产能瓶颈——分层CoT三阶段脚本引擎（卖点映射→叙事弧→分镜配音）将每条脚本生产从2.5小时压缩至3分钟，A/B测试变体从每周5条扩展到40+条，CTR平均提升15-25%，年化内容制作成本节省12-18万元

## ② 核心算法逻辑

分层 CoT（ChainofThought）脚本生成的核心洞察：把"写脚本"拆解为三个认知层次，每层都有独立推理链，避免大模型一步到位时的幻觉和结构混乱。

## ③ 业务应用场景

场景A：Momcozy M5 吸奶器 TikTok 30 秒广告脚本
- 业务问题：跨境团队 TikTok 内容产出瓶颈——2 名运营 1 周只能产出 5 条脚本，爆品期需要 20+ 条 A/B 变体，靠人工完全跟不上投放节奏 - 数据要求：产品图 3-5 张、核心卖点 5-8 条（来自 Amazon listing）、目标受众描述（"25-35 岁职场新手妈妈，下班后喂奶"）、竞品视频参考 URL（可选） - 执行过程：Stage 1 分析受众意图（"哺乳期兼顾工作"→ 对应卖点"静音<35dB""USB充电可办公室使用"）；Stage 2 设计叙事弧（痛点：公司哺乳室不方便 → 冲突：传统吸奶器噪音大 → 解决：M5 静音+便携 → CTA：限时折扣）；St
场景B：婴儿安抚奶嘴 Instagram Reels 产品解说

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

12-18 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（463 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/ai_video_script_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-AI-Video-Script-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI Video Script Generation — 分层 CoT 三阶段脚本生成器
场景：Momcozy M5 吸奶器 30 秒 TikTok 广告
依赖：anthropic (pip install anthropic) 或替换为 openai
"""

import json
import re
from dataclasses import dataclass, field
from typing import List, Optional
from unittest.mock import MagicMock

# ──────────────────────────────────────────────
# 数据结构
# ──────────────────────────────────────────────

@dataclass
class ProductContext:
    name: str
    features: List[str]          # 核心卖点列表
    audience: str                 # 目标受众描述
    category: str                 # 品类（用于意图权重）
    brand_tone: str               # 品牌调性

@dataclass
class IntentFeatureMap:
    intent: str                   # 购买意图
    matched_features: List[str]   # 对应卖点
    weight: float                 # 意图强度 0-1

@dataclass
class NarrativeArc:
    hook_type: str                # 钩子类型：pain_point | scene | data
    hook: str
    conflict: str
    solution: str
    cta: str

@dataclass
class ShotScript:
    shot_id: int
    duration_sec: float
    visual: str                   # 画面描述
    voice_cn: str                 # 普通话配音
    voice_en: str                 # 英文配音
    caption: str                  # 字幕强调词
    feature_ref: str              # 对应卖点 ID

@dataclass
class VideoScript:
    product_name: str
    total_duration: int
    narrative: NarrativeArc
    shots: List[ShotScript]
    intent_map: List[IntentFeatureMap]


# ──────────────────────────────────────────────
# Stage 1：购买意图 → 卖点映射
# ──────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.15127 — MCSC-Bench: Multimodal Context-to-Script Creation for Realistic Video Production

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品图 3-5 张、核心卖点 5-8 条（来自商品详情页）、目标受众描述（如 25-35 岁职场新手妈妈、下班后喂奶），以及可选的竞品视频参考链接。

**输出**：含受众意图映射、叙事弧、分镜与配音的完整视频脚本及批量 A/B 变体，供制作与投放使用；卡页口径每条脚本生产从 2.5 小时压缩到 3 分钟、每周变体从 5 条扩展到 40 条以上、CTR 平均提升 15-25%。

## 执行步骤

1. 分析受众购买意图，并把意图映射到产品卖点。
2. 设计叙事弧：痛点、冲突、解决、行动召唤。
3. 生成带分镜与配音的完整脚本。
4. 批量产出多版本脚本用于 A/B 测试。
5. 交付制作与投放，并按 CTR 反馈迭代脚本。

## 边界与不做

- 缺少产品卖点清单或受众描述时不要用，意图与卖点的映射无从建立。
- 能力边界：本技能产出脚本文本与分镜，不做成片、不保证 CTR 提升；卡页的产能与 CTR 数字来自特定投放案例。
- 合规红线：脚本不得含无依据的功效或比较宣称，AI 生成内容须按规定标注，母婴安全类表述须有依据。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **可组合**：Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution、Skill-AI-Video-Script-Generation

---

> 分类：业务运营/品牌与增长/创意简报　·　技术族：20-AI视频生成　·　源卡：`Skill-AI-Video-Script-Generation`