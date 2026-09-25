---
name: "p2s-brand-video-generation"
title: "Brand Video Generation — AI品牌视频生成：从文本/图像到高保真营销视频的全链路技术"
description: "触发词：品牌视频生成、文本转视频、图生视频、A+ 页面视频、拍摄替代。何时不用：需要真人实拍演示或平台要求实拍证据时不用；多市场批量版本用多市场品牌视频生成技能。安全边界：生成视频不得虚构产品功能与使用效果；旁白与字幕不得使用绝对化或医疗宣称表述。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 视觉简报"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Brand-Video-Generation"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "用文字和产品图直接生成品牌营销视频，把十几天的外拍周期压到几小时。"
user_try: "试试：为这款婴儿消毒锅生成 3 条视频——妈妈使用场景、产品 360 度旋转、功能特性展示。"
whenToUse: "需要快速补充品牌与产品展示视频产能时用本技能；多市场多语言批量版本用多市场品牌视频生成技能。"
workflow: "定义品牌档案（品牌色、Logo 位置、字体风格、关键词） → 按场景写生成提示词（使用场景、旋转展示、功能讲解） → 批量生成视频并校验品牌视觉一致性 → 输出成片用于 Listing、A+ 或社交媒体投放"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Brand Video Generation — AI品牌视频生成：从文本/图像到高保真营销视频的全链路技术

## ① 解决的问题

品牌经理面临视频产能跟不上投放——品牌视频生成将产出周期从5天缩到6小时，年化省18万元

## ② 核心算法逻辑

品牌视频生成（Brand Video Generation）解决的核心问题是：如何将品牌语义（Logo、色调、产品特征）与视频扩散模型对齐，在保留用户意图（语义保真）的同时实现自然的品牌可见性。

## ③ 业务应用场景

业务背景：Amazon 美国站婴儿消毒锅新品上架，需要生成 3 条展示视频：妈妈使用场景、产品 360° 旋转、功能特性展示。传统外拍费用约 1.5 万元/条，周期 7-14 天。
ROI 估算： - 节省拍摄成本：1.5 万元/条 × 3 条 = 4.5 万元 - AI 生成成本：<100 元（GPU 算力） - 时间压缩：14 天 → 2 小时 - 单次 ROI ≈ 450x
业务背景：跨境母婴品牌"BabyBliss"在 TikTok/Meta 投放广告，需每周生产 20+ 条不同场景的广告素材（公园、厨房、婴儿房等），品牌色（薰衣草紫 #8A7ED9）和 Logo 需贯穿始终。

## ④ 输入数据要求

BPR ≥ 85%、自然度 ≥ 4.0：可直接使用
BPR 低：检查品牌关键词覆盖度，补充微调样本
自然度低：调低品牌显著度，让品牌色自然融入环境

## ⑤ 输出结果

BPR ≥ 85%、自然度 ≥ 4.0：可直接使用
BPR 低：检查品牌关键词覆盖度，补充微调样本
自然度低：调低品牌显著度，让品牌色自然融入环境

## ⑥ 业务价值 / ROI

4.5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（573 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：8」并记录位置 `paper2skills-code/visual_content/brand_video_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Brand-Video-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Brand Video Generation Pipeline
整合 BrandFusion（品牌知识库 + 多智能体提示精化）+ Aquarius（工业级视频生成）核心逻辑
Mock 实现，完全可运行，含完整测试用例
"""

import json
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# ─── 数据结构 ───────────────────────────────────────────────────────────────

@dataclass
class BrandProfile:
    """品牌档案（BrandFusion 离线知识库单元）"""
    brand_name: str
    primary_color: str          # hex，如 "#8A7ED9"
    logo_position: str          # "top-right" / "bottom-left" 等
    font_style: str             # "rounded" / "serif" 等
    brand_keywords: List[str]   # 品牌关键词列表
    is_novel: bool = True       # 是否需要微调（True=新品牌）
    adapter_path: Optional[str] = None  # LoRA adapter 路径
    past_experiences: List[Dict] = field(default_factory=list)  # 成功经验


@dataclass
class VideoGenerationConfig:
    """视频生成配置"""
    width: int = 1280
    height: int = 720
    fps: int = 24
    duration_seconds: int = 15
    num_inference_steps: int = 16
    guidance_scale: float = 7.5
    seed: int = 42


@dataclass
class GenerationResult:
    """生成结果"""
    refined_prompt: str
    brand_presence_rate: float    # 0-1，品牌存在率
    naturalness_score: float      # 1-5，自然度
    semantic_fidelity: float      # 0-1，语义保真度
    video_path: str               # 模拟路径
    generation_cost_yuan: float   # 成本（元）


# ─── BrandFusion：多智能体品牌提示精化 ─────────────────────────────────────

class BrandSelector:
    """Agent 1：品牌选择器"""

    def __init__(self, brand_db: Dict[str, BrandProfile]):
        self.brand_db = brand_db

    def select(self, user_prompt: str) -> Tuple[str, float]:
        """
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.02816 — BrandFusion: A Multi-Agent Framework for Seamless Brand Integration in Text-to-Video Generation
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：品牌档案（品牌名、主色 hex、Logo 位置、字体风格、品牌关键词、是否需微调）、产品与场景描述、所需视频版本数。

**输出**：品牌展示视频成片（含使用场景、360 度展示、功能特性等版本）与品牌一致性检查结果；供 Listing 与社媒投放使用。

## 执行步骤

1. 定义品牌档案与视觉约束
2. 编写各场景的生成提示词
3. 批量生成品牌视频
4. 校验品牌色与 Logo 一致性
5. 输出成片并标注适用投放位

## 边界与不做

- 缺少品牌视觉规范定义时不用本技能，多版本容易走样。
- 本技能产出视频素材，不执行投放，也不做平台广告审核。
- 安全边界：不得虚构产品功能或使用效果；旁白与字幕禁用绝对化与医疗宣称表述。

## 技能关联

- **前置**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-ML-Model-Serving-Optimization.html、Skill-ML-Model-Serving-Optimization
- **延伸**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation
- **可组合**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Brand-Video-Generation

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Brand-Video-Generation`