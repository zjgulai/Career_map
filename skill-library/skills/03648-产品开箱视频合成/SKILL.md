---
name: "p2s-product-unboxing-video-generator"
title: "Skill-Product-Unboxing-Video-Generator — AI 产品开箱视频合成"
description: "触发词：开箱视频、商品视频合成、卖点字幕、转场配乐、PDP 视频。何时不用：需要真人拆封实拍证据时不要用合成开箱；缺少产品图与包装图时无法生成。安全边界：禁止使用误导性拆封动画；字幕与文案不得出现医疗或功效宣称词；背景音乐须免版权或已授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Product-Unboxing-Video-Generator"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用产品图和包装图自动拼出开箱视频，详情页配上视频，成本从几百美元降到几十美元。"
user_try: "试试：用这 5 张奶瓶白底图和 2 张包装图生成 30 秒竖版开箱视频，含卖点字幕与转场。"
whenToUse: "商品有白底图与包装图、需要快速补 PDP 视频时用本技能；需要真人拆封实拍证据时不用。"
workflow: "准备产品白底图、包装图与卖点文案 → 按开箱序列排列图片并配置每屏时长与转场 → 叠加卖点字幕与背景音乐 → 渲染输出竖版成片并检查合规词"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Product-Unboxing-Video-Generator — AI 产品开箱视频合成

## ① 解决的问题

运营面临"开箱视频制作需要专业拍摄团队"——AI合成将开箱视频产出成本降低80%，月均多产出15条SKU级内容

## ② 核心算法逻辑

AI 产品开箱视频生成器（Product Unboxing Video Generator）通过自动化流水线将产品静态图、包装图和卖点文案合成为符合开箱展示习惯的动态视频，无需真人拍摄。

## ③ 业务应用场景

场景：婴儿奶瓶套装 Amazon 商品视频自动生成
- 业务问题：奶瓶套装需要 PDP 视频展示包装内容物（5 个奶瓶 + 配件），真人拍摄 + 后期需要 2 天 $400 - 数据要求：产品白底图（5 张）、包装图（2 张）、卖点文案（3-5 条）、背景音乐 - 执行方案： - 按开箱序列排列 7 张图片 - 每张图 Ken Burns 效果 3 秒 + 0.4 秒转场 - 卖点字幕按时间轴插入 - 输出 30 秒 MP4（竖版 9:16） - 量化产出：视频生成时间从 2 天 → 1 小时（脚本 + API），成本从 $400 → $30 - 业务价值：PDP 有视频 vs 无视频，CVR 提升约 35%（业界数据），年化增量销售约 15-
**三轨验证**： - **成本**：显性成本 $30/条（API 调用 + 素材处理），若需人工审核修改则增加 $15-20/条；批量生成 100 条以上时，单条成本可降至 $18-22 - **合规**：Amazon 政策允许自动生成视频，但禁止使用误导性动画（如虚假拆封动作）；字幕需符合 FDA 医疗器械/母婴产品广告法，不得出现“治愈”“医疗级”等违规词；背景音乐需使用免版权曲库（如 Epidemic Sound），避免侵权投诉 - **风险**：若视频质量低于平台平均水准（如画面模糊、字幕错位），可能触发 Amazon 视频审核降权；竞品可能批量复制该模式导致视频同质化，削弱差异化优

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：生成成本从 $400 → $30/条，PDP 有视频 CVR 提升约 35%，年化增量销售约 15-25 万元
实施难度：⭐⭐⭐☆☆（需要图片处理 + 视频合成工具链）
优先级：⭐⭐⭐⭐⭐（Amazon PDP 视频直接影响 CVR，所有 SKU 必须有视频）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import json

@dataclass
class VideoScene:
    """视频场景配置"""
    scene_id: int
    image_path: str
    duration_s: float           # 场景时长（秒）
    ken_burns: Dict              # Ken Burns 效果配置
    subtitle: str = ""          # 叠加字幕
    subtitle_enter_s: float = 0.5   # 字幕出现时间（相对场景起始）
    transition_type: str = "fade"   # 转场类型

@dataclass 
class UnboxingVideoConfig:
    """开箱视频配置"""
    product_name: str
    target_duration_s: int = 45
    resolution: Tuple[int, int] = (1080, 1920)  # 竖版
    fps: int = 30
    bgm_style: str = "upbeat_gentle"

def plan_unboxing_sequence(
    product_images: List[str],
    packaging_images: List[str],
    feature_points: List[str]
) -> List[Dict]:
    """规划开箱序列"""
    SEQUENCE_LOGIC = [
        {"label": "packaging_exterior", "description": "展示包装外观"},
        {"label": "packaging_open", "description": "拆封/开盖动作"},
        {"label": "product_overview", "description": "产品整体展示"},
        {"label": "product_detail_1", "description": "功能细节1"},
        {"label": "product_detail_2", "description": "功能细节2"},
        {"label": "product_inuse", "description": "使用场景"},
        {"label": "product_feature_callout", "description": "卖点特写"},
        {"label": "product_collection", "description": "套装全家福"}
    ]
    
    # 分配图片到序列
    all_images = packaging_images + product_images
    scenes = []
    
    for i, step in enumerate(SEQUENCE_LOGIC[:len(all_images)]):
        img = all_images[i] if i < len(all_images) else all_images[-1]
        subtitle = feature_points[i % len(feature_points)] if feature_points else ""
        
        # Ken Burns 参数：随机平移方向
        np.random.seed(i * 7)
        zoom_start = 1.0
        zoom_end = np.random.uniform(1.05, 1.15)
        pan_x = np.random.uniform(-0.05, 0.05)
        pan_y = np.random.uniform(-0.05, 0.05)
        
        transition_types = ["fade", "slide_left", "slide_right", "zoom_in"]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2506.05937。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：产品白底图（多张）、包装图、卖点文案（3-5 条）、背景音乐与目标输出规格（时长、比例，如 30 秒竖版 9:16）。

**输出**：开箱短视频成片（含卖点字幕、转场与配乐）与视频场景配置清单；供 PDP 与社媒视频位使用。

## 执行步骤

1. 准备产品图、包装图与卖点文案
2. 按开箱序列排列场景并设定时长与转场
3. 配置运镜效果与字幕时间轴
4. 叠加配乐并渲染输出竖版成片
5. 检查字幕与合规词后交付

## 边界与不做

- 缺少产品白底图与包装图时无法生成；需要真人拆封实拍证据的场景不用本技能。
- 本技能产出商品视频，不代替平台视频审核与上架动作。
- 安全边界：禁止误导性拆封动画；字幕不得出现医疗或功效宣称词；背景音乐须免版权或已授权。

## 技能关联

- **前置**：Skill-A-Plus-Content-Video-Embedding.html、Skill-A-Plus-Content-Video-Embedding、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Diffusion-Model-Product-Image.html、Skill-Diffusion-Model-Product-Image、Skill-Multilingual-Subtitle-Auto-Generator.html、Skill-Multilingual-Subtitle-Auto-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-A-Plus-Content-Video-Embedding.html、Skill-A-Plus-Content-Video-Embedding、Skill-Multilingual-Subtitle-Auto-Generator.html、Skill-Multilingual-Subtitle-Auto-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Multilingual-Subtitle-Auto-Generator.html、Skill-Multilingual-Subtitle-Auto-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Product-Unboxing-Video-Generator

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Product-Unboxing-Video-Generator`