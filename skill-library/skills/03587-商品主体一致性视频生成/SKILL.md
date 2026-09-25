---
name: "p2s-phantom-product-showcase-i2v"
title: "Phantom — Product Showcase I2V（商品主体一致性视频生成）"
description: "触发词：图生视频、商品旋转展示、主体一致性、Listing 视频、变体批量化。何时不用：需要展示真实使用过程与真人演示时静态图生视频不够用；素材已有实拍视频用剪辑类技能。安全边界：生成视频不得改变商品真实外观与颜色，不得虚构功能演示。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 视觉简报"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Phantom-Product-Showcase-I2V"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一张白底主图就能生成商品旋转展示视频，让十几个变体 SKU 都配上详情页视频。"
user_try: "试试：用这张暖奶器白底图生成 5 秒旋转展示视频，并把这 12 个变体 SKU 的视频一次性批量出完。"
whenToUse: "商品有合规主图、要给 Listing 补充展示视频时用本技能；需要真人使用演示时用真人或虚拟主播类技能。"
workflow: "准备商品白底主图与可选多角度图 → 编写运动描述（如 360 度平滑旋转） → 按配置生成短展示视频并检查主体一致性 → 批量覆盖同款多 SKU 变体"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Phantom — Product Showcase I2V（商品主体一致性视频生成）

## ① 解决的问题

商品运营面临静图卖点展示弱——I2V将详情页停留时长从45秒提到72秒，年化增收20万元

## ② 核心算法逻辑

输入 13 张商品参考图，生成商品保持外观一致性的动态展示视频——商品 Logo、纹理、颜色在视频全程不畸变。这解决了通用 I2V 模型的致命伤：生成视频时商品外观逐渐漂移（"copypaste"信息泄露问题）。

## ③ 业务应用场景

业务问题： 某母婴品牌在 Amazon 美国站销售「智能恒温暖奶器」，库存 2000 件，日销 50 件，转化率 4.5%。Amazon 允许在主图位上传视频，有视频的 listing 转化率比纯图片高 20-30%。但该品类有 12 个 SKU（不同颜色/容量/电压版本），找专业视频拍摄成本 $800/SKU，且拍摄周期 2 周，无法覆盖所有变体。
数据要求： - 商品白底主图 1 张（Amazon 主图规格：2000×2000px 白底，暖奶器正面展示） - 可选：2-3 张多角度图（侧面/背面/配件特写）提升多视角效果 - 文本描述："smooth 360 rotation of baby bottle warmer on white background, studio lighting, stainless steel texture visible"
预期产出： - 5 秒产品旋转展示视频，暖奶器的不锈钢机身、LED 显示屏、Logo 全程不失真 - 批量化：12 SKU × 5 秒 = 60 秒视频内容，总 GPU 成本约 $0.60（1.3B 模型） - 支持多角度输入时自动生成平滑视角切换，展示暖奶器从正面到侧面的完整轮廓

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
转化率提升：视频覆盖率 10%→90% → CVR +20-25% → 月 GMV $50 万 → 月增 $10-15 万
拍摄成本节省：50 SKU × $500 = $25,000 一次性
年化总 ROI：150-250 万元
实施难度：⭐⭐⭐☆☆（3 星）— Phantom 1.3B 仅需 8GB VRAM，Apache 2.0 可商用
优先级评分：⭐⭐⭐⭐⭐（5 星）— 直接提升 listing 转化率，是所有 SKU 的通用能力

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/visual_content/phantom_product_showcase_i2v` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Phantom-Product-Showcase-I2V.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Phantom — Product Showcase I2V Pipeline
基于 Phantom (arXiv:2502.11079) 的推理封装

依赖: pip install diffusers transformers accelerate
模型: HuggingFace Phantom-Wan-1.3B / Phantom-Wan-14B (Apache 2.0)
"""

import torch
import numpy as np
from PIL import Image
from typing import List, Dict, Optional
from dataclasses import dataclass, field


@dataclass
class ShowcaseConfig:
    """商品展示视频配置"""
    product_images: List[str]         # 商品参考图（1-3 张）
    output_duration_sec: int = 5      # 视频时长
    fps: int = 16                     # 帧率
    motion_prompt: str = ""           # 动作描述
    guidance_scale: float = 5.0       # Phantom 推荐 5.0
    model_size: str = "1.3B"          # "1.3B" or "14B"


class PhantomProductShowcase:
    """
    Phantom 商品展示视频生成管线
    
    模型加载（首次运行自动下载）:
    from diffusers import PhantomPipeline
    pipe = PhantomPipeline.from_pretrained("Phantom-video/Phantom-Wan-1.3B")
    """
    
    SUPPORTED_SIZES = {
        "1.3B": {"vram": "8GB", "model_id": "Phantom-video/Phantom-Wan-1.3B"},
        "14B": {"vram": "24GB", "model_id": "Phantom-video/Phantom-Wan-14B"},
    }
    
    def __init__(self, model_size: str = "1.3B"):
        if model_size not in self.SUPPORTED_SIZES:
            raise ValueError(f"Unsupported size: {model_size}")
        self.model_size = model_size
        self.model_id = self.SUPPORTED_SIZES[model_size]["model_id"]
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    def generate_showcase(
        self,
        config: ShowcaseConfig,
        num_inference_steps: int = 50,
    ) -> Dict:
        """
        生成商品展示视频
        
        Args:
            config: 展示配置
            num_inference_steps: 去噪步数
        
        Returns:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2502.11079 — Phantom: Subject-consistent video generation via cross-modal alignment

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：商品白底主图（符合平台规格，如 2000×2000px 白底）、可选 2-3 张多角度图、运动描述文本、输出时长与帧率配置。

**输出**：商品旋转展示短视频（商品材质、显示屏与 Logo 全程不失真）与多 SKU 变体的批量产物；供 Listing 与详情页使用。

## 执行步骤

1. 准备商品白底图与可选多角度图
2. 编写运动与镜头描述
3. 按配置生成展示视频
4. 检查主体一致性与细节失真
5. 批量覆盖同款变体 SKU 并输出清单

## 边界与不做

- 商品主图非白底或主体不清晰时不用本技能，主体一致性无法保证。
- 本技能产出展示视频素材，不代替人工预览、平台视频审核与上传。
- 安全边界：生成视频须与商品真实外观、颜色一致，不得改变商品特征或虚构功能演示。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Product-Demo-Video-Auto-Edit.html、Skill-Product-Demo-Video-Auto-Edit、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Short-Video-Thumbnail-CTR-Predictor.html、Skill-Short-Video-Thumbnail-CTR-Predictor、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad
- **延伸**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Product-Demo-Video-Auto-Edit.html、Skill-Product-Demo-Video-Auto-Edit、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Short-Video-Thumbnail-CTR-Predictor.html、Skill-Short-Video-Thumbnail-CTR-Predictor、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad
- **可组合**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Product-Demo-Video-Auto-Edit.html、Skill-Product-Demo-Video-Auto-Edit、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Short-Video-Thumbnail-CTR-Predictor.html、Skill-Short-Video-Thumbnail-CTR-Predictor、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-Phantom-Product-Showcase-I2V

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Phantom-Product-Showcase-I2V`