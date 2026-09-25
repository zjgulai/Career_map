---
name: "p2s-cross-platform-video-repurposing"
title: "Skill-Cross-Platform-Video-Repurposing — 跨平台视频内容复用适配"
description: "触发词：视频复用、跨平台适配、比例裁剪、字幕风格、文案首行重写。何时不用：要从零生成新视频时用视频生成类技能；本技能只做已有母版的平台规格适配。安全边界：母版含背景音乐须确认各平台授权或改用免版权素材；改写文案不得使用绝对化表述。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-094"
l3_business: "素材版本管理"
l3_all: "素材版本管理 / 视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/素材版本管理"
p2s_card_id: "Skill-Cross-Platform-Video-Repurposing"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "一条横版演示视频自动改造成各平台要的竖版尺寸、时长和字幕风格，把一次拍摄用满五个渠道。"
user_try: "试试：把这条 16:9 的婴儿背带演示视频适配成 TikTok、Reels、Shorts 三个版本，含时长裁剪、字幕与文案首行改写。"
whenToUse: "已有母版视频、要扩到多平台发布时用本技能；需要新拍摄或全新合成，用视频生成类技能。"
workflow: "读取原始母版视频与各平台规格配置 → 按平台比例裁剪并对主体居中（如 16:9 转 9:16） → 按平台最优时长裁切并调整字幕风格 → 重写各平台文案首行并输出适配版本清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Cross-Platform-Video-Repurposing — 跨平台视频内容复用适配

## ① 解决的问题

运营面临"TikTok视频无法直接用于其他平台"——自动适配将跨平台发布效率提升8倍，单内容触达用户数增加300%

## ② 核心算法逻辑

跨平台视频复用（CrossPlatform Video Repurposing）将一条母版视频自动适配为多平台格式，最大化内容复用率，降低单位内容生产成本。

## ③ 业务应用场景

- 业务问题：月产 4 条婴儿背带横版演示视频（共 $1,600），但只发布到 Amazon PDP，TikTok/Instagram/YouTube 均未覆盖 - 数据要求：原始视频文件（16:9 MP4）、各平台账号、文案模板库 - 执行方案： - 裁剪 16:9 → 9:16（主体检测居中） - 时长优化：60s → TikTok 30s / Reels 45s / Shorts 45s - 字幕风格按平台调整（TikTok 大字黄底 → Instagram 细白字） - 文案首行重写（Amazon「Features:...」→ TikTok「Are you tired of...?」）
成本轨： - 视频处理 API 成本：$15/条适配视频 × 4 条母版 × 5 平台 = $300/月 - 文案改写成本：$50/月（使用 Claude API 批量改写，或外包 $200/月） - 字幕生成成本：$30/月（自动字幕 API，如 Rev.com 或开源 Whisper） - 人工审核成本：$100/月（QA 检查各平台适配质量，2h/周） - 总显性成本：$480-580/月，年化 $5,760-6,960 - 单位成本：$12-14.5/条适配视频（相比传统外包 $50-80/条节省 60-75%）
合规轨： - ✅ Amazon 政策：符合 Amazon Brand Registry 视频上传规范，无版权冲突风险（使用自有素材） - ✅ GDPR：视频内容不涉及个人数据处理，仅涉及产品演示，无需 GDPR 合规调整 - ✅ 广告法：各平台文案改写需避免绝对化表述（「最好」→「很好」），已在模板中规范 - ✅ 跨境贸易：视频内容为产品演示，无虚假宣传风险，符合 FTC 广告披露要求 - ⚠️ 音乐版权：若母版视频含背景音乐，需确保已获得各平台的音乐库授权或使用免费素材库（Epidemic Sound、Artlist） - 合规结论：整体合规，仅需确保音乐版权清晰

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：5 平台复用后单位内容成本从 $400 → $80，年化内容产量 5 倍提升，多渠道 GMV 增量 20-35 万元
实施难度：⭐⭐⭐☆☆（需要视频处理工具链，FFmpeg 等开源工具可实现）
优先级：⭐⭐⭐⭐⭐（内容复用是最高 ROI 的内容运营策略，月产 4 条 → 20 条零额外创意成本）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class PlatformSpec:
    """平台视频规格"""
    name: str
    aspect_ratio: Tuple[int, int]
    resolution: Tuple[int, int]
    min_duration_s: int
    max_duration_s: int
    optimal_duration_s: int
    requires_subtitles: bool
    content_style: str   # entertainment, educational, product

# 各平台规格配置
PLATFORM_SPECS = {
    "tiktok": PlatformSpec("TikTok", (9, 16), (1080, 1920), 15, 60, 30, True, "entertainment"),
    "instagram_reels": PlatformSpec("Instagram Reels", (9, 16), (1080, 1920), 15, 90, 45, True, "lifestyle"),
    "youtube_shorts": PlatformSpec("YouTube Shorts", (9, 16), (1080, 1920), 15, 60, 45, True, "educational"),
    "amazon_pdp": PlatformSpec("Amazon PDP", (16, 9), (1920, 1080), 15, 90, 45, True, "product"),
    "pinterest": PlatformSpec("Pinterest", (2, 3), (1000, 1500), 15, 60, 30, False, "inspiration")
}

def compute_crop_params(
    source_w: int,
    source_h: int,
    target_aspect: Tuple[int, int]
) -> Dict:
    """计算裁剪参数（主体居中）"""
    target_ratio = target_aspect[0] / target_aspect[1]
    source_ratio = source_w / source_h
    
    if target_ratio < source_ratio:
        # 需要裁剪宽度
        new_w = int(source_h * target_ratio)
        crop_x = (source_w - new_w) // 2
        return {"crop_x": crop_x, "crop_y": 0, "crop_w": new_w, "crop_h": source_h, "action": "crop_width"}
    else:
        # 需要裁剪高度或填充
        new_h = int(source_w / target_ratio)
        if new_h <= source_h:
            crop_y = (source_h - new_h) // 2
            return {"crop_x": 0, "crop_y": crop_y, "crop_w": source_w, "crop_h": new_h, "action": "crop_height"}
        else:
            return {"crop_x": 0, "crop_y": 0, "crop_w": source_w, "crop_h": source_h, "action": "pad", "pad_h": new_h}

def adapt_caption_style(
    caption: str,
    platform: str,
    pain_point: str = "sleepless nights"
) -> str:
    """按平台风格改写文案"""
    style_templates = {
        "tiktok": f"Are you tired of {pain_point}? 👀 {caption}",
        "instagram_reels": f"✨ {caption} | Save this for all new parents 💛",
        "youtube_shorts": f"Here's how to solve {pain_point} with {caption}",
        "amazon_pdp": caption,  # 产品功能描述保持原样
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2104.15021。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：原始视频文件（如 16:9 MP4）、各平台账号与文案模板库、平台规格配置（比例、分辨率、时长区间、是否需字幕）。

**输出**：每个平台一条适配视频（含比例、时长、字幕风格与改写后的文案首行）与单位成本对比；供内容运营批量发布使用。

## 执行步骤

1. 读取母版视频并确定目标平台清单
2. 按平台规格裁剪比例并对主体居中
3. 按平台最优时长裁切片段
4. 调整字幕样式与位置
5. 重写文案首行并输出待发布版本清单

## 边界与不做

- 母版素材缺失、或需要原创拍摄时不用本技能。
- 本技能产出适配版本与文案，不代替人工发布，也不做平台合规终审。
- 安全边界：背景音乐须确认授权或改用免版权曲库；平台文案改写须避免绝对化表述。

## 技能关联

- **前置**：Skill-AI-Video-AB-Test-Creative.html、Skill-AI-Video-AB-Test-Creative、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Multilingual-Subtitle-Auto-Generator.html、Skill-Multilingual-Subtitle-Auto-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Compliance-Pre-Screen.html、Skill-Video-Compliance-Pre-Screen、Skill-Video-Emotion-Resonance-Score.html、Skill-Video-Emotion-Resonance-Score、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-AI-Video-AB-Test-Creative.html、Skill-AI-Video-AB-Test-Creative、Skill-Multilingual-Subtitle-Auto-Generator.html、Skill-Multilingual-Subtitle-Auto-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Compliance-Pre-Screen.html、Skill-Video-Compliance-Pre-Screen、Skill-Video-Emotion-Resonance-Score.html、Skill-Video-Emotion-Resonance-Score、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **可组合**：Skill-AI-Video-AB-Test-Creative.html、Skill-AI-Video-AB-Test-Creative、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Compliance-Pre-Screen.html、Skill-Video-Compliance-Pre-Screen、Skill-Video-Emotion-Resonance-Score.html、Skill-Video-Emotion-Resonance-Score、Skill-Cross-Platform-Video-Repurposing

---

> 分类：业务运营/品牌与增长/素材版本管理　·　技术族：20-AI视频生成　·　源卡：`Skill-Cross-Platform-Video-Repurposing`