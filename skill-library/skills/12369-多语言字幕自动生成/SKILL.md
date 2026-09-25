---
name: "p2s-multilingual-subtitle-auto-generator"
title: "Skill-Multilingual-Subtitle-Auto-Generator — 多语言字幕自动生成"
description: "触发词：多语言字幕、视频字幕生成、SRT 生成、字幕翻译、视频本地化、母婴术语校正。何时不用：要重写 Listing 文案用「Listing 本地化」；把一条视频改成多平台版本用「跨平台视频复用」；只写视频脚本用「AI 产品视频脚本生成」。安全边界：字幕须按专业词汇表人工校对后再发布，不得改动或新增原视频中的功效与认证类宣称。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / 视频制作协作"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-Multilingual-Subtitle-Auto-Generator"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "给英语视频一键生成日、德、法字幕文件并烧录成片，用语表校正母婴术语，把字幕交付从两三天压到几分钟。"
user_try: "试试：把这条 5 分钟的英语 TikTok 视频生成日语和德语 SRT 字幕，母婴术语按词表校正后烧录成片。"
whenToUse: "已有英语视频、要给日德法市场配本地字幕时用；只做 Listing 文案本地化用「Listing 本地化」，只做多平台视频改版用「跨平台视频复用」，只写视频脚本用「AI 产品视频脚本生成」。"
workflow: "用 Whisper 转录英语音频，得到带时间戳的文本段 → 把文本段翻译为目标语言（日 / 德 / 法） → 用母婴专业词汇表做术语后处理 → 生成 SRT 字幕文件 → 烧录字幕输出本地化视频"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Multilingual-Subtitle-Auto-Generator — 多语言字幕自动生成

## ① 解决的问题

内容团队面临"多市场字幕翻译周期长成本高"——AI自动生成将字幕制作时间从3天缩短至30分钟，年化节省翻译费20万元

## ② 核心算法逻辑

论文：Whisper: Robust Speech Recognition via LargeScale Weak Supervision | 年份：2022

## ③ 业务应用场景

场景：婴儿产品 TikTok 视频一键生成英/日/德/法字幕
- 业务问题：月产 15 条英语视频，日本/德国市场需要本地字幕，人工翻译每条需要 2-3 小时（专业翻译 $50-80/条），月成本 $750-1,200 - 数据要求：英语原视频（MP4/MOV）、目标语言列表、母婴专业词汇表 - 执行方案： - Whisper 转录英语音频 → 带时间戳文本段 - NLLB-200 翻译为日/德/法 - 专业词汇字典后处理（BPA Free → BPA-frei，Swaddle → Pucken） - 输出 SRT 文件 + 烧录字幕视频 - 量化产出：字幕生成时间从 2.5h/条 → 5 分钟/条，月节省 37.5 小时 - 业务价值：月翻译成本从 $
- 成本轨： - Whisper API 调用：$0.006/分钟音频（OpenAI），月均 15 条视频×5 分钟均长 = $4.50 - NLLB 翻译 API（Google Translate/DeepL）：$0.50/百万字符，月均 3 语言×15 条×2,000 字 = $4.50 - 字幕烧录工具（FFmpeg 本地部署）：0 元 - 月度显性成本合计：$9/月（相比人工翻译 $900/月，节省 99%） - 初期投入：模型微调数据标注 $500-800（一次性）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

实施难度：⭐⭐☆☆☆（Whisper 开源可本地部署，翻译 API 成熟）
优先级：⭐⭐⭐⭐⭐（视频出海的基础能力，多语言字幕直接影响非英语市场转化率）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import json
from dataclasses import dataclass, field
from typing import List, Dict, Tuple

@dataclass
class SubtitleSegment:
    """字幕片段"""
    index: int
    start_ms: int       # 毫秒
    end_ms: int
    text: str
    language: str = "en"

def ms_to_srt_time(ms: int) -> str:
    """毫秒 → SRT 时间格式 HH:MM:SS,mmm"""
    h = ms // 3600000
    m = (ms % 3600000) // 60000
    s = (ms % 60000) // 1000
    ms_rem = ms % 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms_rem:03d}"

def generate_srt(segments: List[SubtitleSegment]) -> str:
    """生成 SRT 格式字幕文本"""
    lines = []
    for seg in segments:
        lines.append(str(seg.index))
        lines.append(f"{ms_to_srt_time(seg.start_ms)} --> {ms_to_srt_time(seg.end_ms)}")
        lines.append(seg.text)
        lines.append("")  # 空行分隔
    return "\n".join(lines)

# 专业词汇词典
BABY_TERM_DICT = {
    "ja": {
        "BPA-free": "BPAフリー",
        "colic": "疝痛（コリック）",
        "swaddle": "おくるみ",
        "breast pump": "搾乳機",
        "baby monitor": "ベビーモニター",
        "formula": "粉ミルク",
        "teething": "歯が生える",
        "newborn": "新生児"
    },
    "de": {
        "BPA-free": "BPA-frei",
        "colic": "Koliken",
        "swaddle": "Pucken",
        "breast pump": "Milchpumpe",
        "baby monitor": "Babyphone",
        "formula": "Säuglingsnahrung",
        "teething": "Zahnen",
        "newborn": "Neugeborenes"
    },
    "fr": {
        "BPA-free": "sans BPA",
        "colic": "coliques",
        "swaddle": "emmailloter",
        "breast pump": "tire-lait",
        "baby monitor": "écoute-bébé",
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2212.04356 — Robust Speech Recognition via Large-Scale Weak Supervision

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：视频级数据：英语原视频文件（MP4 / MOV，卡页案例单条均长约 5 分钟，月产 15 条），目标语言列表，母婴专业词汇表（按目标语言给出术语映射，如 BPA-free → BPA-frei、swaddle → Pucken、breast pump → Milchpumpe）；内部按音频切成带起止毫秒的字幕片段。下限：必须有英语原视频与目标语言清单，缺专业词汇表则术语只能直译、质量不可控。

**输出**：带时间戳的字幕片段列表（序号、start_ms、end_ms、文本、语言）与标准 SRT 字幕文件（HH:MM:SS,mmm 时间轴），以及烧录字幕后的视频；供日、德、法市场的短视频发布使用，卡页口径为字幕制作时间从 2.5 小时每条降到 5 分钟每条。

## 执行步骤

1. 提供英语原视频（MP4 / MOV）与目标语言列表
2. 用 Whisper 转录音频，切出带起止时间戳的文本段
3. 把文本段翻译为目标语言（日 / 德 / 法）
4. 用母婴专业词汇表校正术语（BPA-free → BPA-frei、swaddle → Pucken）
5. 生成 SRT 文件并烧录为本地化视频

## 边界与不做

- 数据不满足：缺英语原视频，或未提供目标语言与专业词汇表时无法转录与校正，先补齐素材与词表。
- 何时不用：只做文案本地化用「Listing 本地化」，只做多平台视频改版用「跨平台视频复用」，只写视频脚本用「AI 产品视频脚本生成」。
- 能力边界：只产出字幕文件与烧录视频，不做配音、变声与画面重剪，术语与文化表达仍须人工校对。
- 安全边界：字幕不得改动或新增产品功效与认证类宣称；卡页成本与工时数值为案例估算，落地须按本团队实际产出量重算。

## 技能关联

- **前置**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Cross-Market-Content-Localization.html、Skill-Cross-Market-Content-Localization、Skill-Cross-Platform-Video-Repurposing.html、Skill-Cross-Platform-Video-Repurposing、Skill-International-Search-Localization.html、Skill-International-Search-Localization、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-Product-3D-Visualization-AR-Preview.html、Skill-Product-3D-Visualization-AR-Preview、Skill-Virtual-Influencer-Baby-Demo.html、Skill-Virtual-Influencer-Baby-Demo
- **延伸**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Cross-Platform-Video-Repurposing.html、Skill-Cross-Platform-Video-Repurposing、Skill-International-Search-Localization.html、Skill-International-Search-Localization、Skill-Product-3D-Visualization-AR-Preview.html、Skill-Product-3D-Visualization-AR-Preview、Skill-Virtual-Influencer-Baby-Demo.html、Skill-Virtual-Influencer-Baby-Demo
- **可组合**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Product-3D-Visualization-AR-Preview.html、Skill-Product-3D-Visualization-AR-Preview、Skill-Virtual-Influencer-Baby-Demo.html、Skill-Virtual-Influencer-Baby-Demo、Skill-Multilingual-Subtitle-Auto-Generator

---

> 分类：业务运营/渠道经营/本地化　·　技术族：20-AI视频生成　·　源卡：`Skill-Multilingual-Subtitle-Auto-Generator`