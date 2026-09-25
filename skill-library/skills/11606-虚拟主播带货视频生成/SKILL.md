---
name: "p2s-anchorcrafter-virtual-anchor-demo"
title: "AnchorCrafter — Virtual Anchor Product Demo（虚拟主播带货视频生成）"
description: "触发词：虚拟主播、带货演示视频、主播形象替换、手势演示、批量出片。何时不用：需要真人出镜建立信任或平台要求真人标识时不用；单纯剪辑已有素材用剪辑类技能。安全边界：虚拟主播须按平台与法规要求标注 AI 生成；不得虚构产品功能或伪造真人使用体验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-AnchorCrafter-Virtual-Anchor-Demo"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "商品图配一段参考视频，就能批量生成虚拟主播的演示视频，还能换不同市场的主播形象。"
user_try: "试试：用这款吸奶器的白底图和一个主播参考视频，生成 15 秒虚拟主播演示视频，并各出一版欧美与亚洲形象。"
whenToUse: "需要低成本、多版本的产品演示视频时用本技能；需要真人信任背书或真人出镜的场合不用。"
workflow: "准备商品白底图（正面与侧面）与主播参考视频 → 编写动作描述（持握、展示、讲解） → 调用生成管线输出 15-30 秒演示视频 → 同一商品更换主播形象产出多市场版本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AnchorCrafter — Virtual Anchor Product Demo（虚拟主播带货视频生成）

## ① 解决的问题

在 TikTok 美国站推吸奶器，需要大量真人主播演示视频——但海外主播贵（$200-500/条），中文主播语言不通，且更换主播需重新拍摄

## ② 核心算法逻辑

输入一张真人参考图 + 一张商品图 + 动作序列，生成虚拟主播手持商品自然交互的短视频——就像真人主播在 TikTok 上展示产品一样。核心技术是人物商品交互 (HOI) 的视频扩散生成。

## ③ 业务应用场景

业务问题： 在 TikTok 美国站推吸奶器，需要大量真人主播演示视频——但海外主播贵（$200-500/条），中文主播语言不通，且更换主播需重新拍摄。急需低成本、可批量化、可换主播形象的产品演示视频。
数据要求： - 商品图：吸奶器白底高清图（正面 + 侧面各 1 张） - 主播参考：1 分钟任意真人视频（或从 AnchorCrafter 预训练模型库选择） - 动作描述："右手持吸奶器，展示正面，然后展示侧面，微笑介绍"
预期产出： - 15-30 秒短视频，虚拟主播自然展示吸奶器，带手势和微表情 - 可批量换主播：同一商品 × 不同主播形象（欧美/亚洲/拉美）→ 多市场本地化 - 每条约 $0.50 GPU 成本（vs 真人 $200）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
真人拍摄替换：20 条/月 × $200 × 3 市场 = $12,000/月 → 虚拟 $50/月，年省 $143,400
内容迭代加速：从"排期 2 周拍一条"变为"30 分钟生成一条"，营销节奏大幅提升
多市场本地化：同一商品脚本 × 换主播形象 = 零额外拍摄成本
年化总 ROI：50-100 万元
实施难度：⭐⭐⭐⭐☆（4 星）— 需要 GPU 服务器（24GB+ VRAM），AnchorCrafter 开源可直接部署

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/visual_content/anchorcrafter_virtual_anchor_demo` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-AnchorCrafter-Virtual-Anchor-Demo.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AnchorCrafter — Virtual Anchor Product Demo Pipeline
基于 AnchorCrafter (arXiv:2411.17383) 的推理封装

依赖: pip install diffusers transformers accelerate xformers
模型: github.com/cangcz/AnchorCrafter
"""

import torch
import numpy as np
from PIL import Image
from typing import Optional, Dict, List
from dataclasses import dataclass


@dataclass
class AnchorDemoConfig:
    """虚拟主播演示配置"""
    product_image_path: str          # 商品图（白底高清）
    anchor_reference_path: str       # 主播参考图/视频帧
    motion_type: str = "hold_show"   # hold_show | rotate | point
    duration_sec: int = 15           # 视频时长（秒）
    fps: int = 8                     # 帧率（SVD 默认 8fps）
    guidance_scale: float = 7.5      # 文本引导强度
    

class AnchorCrafterPipeline:
    """
    虚拟主播带货视频生成管线
    
    实际推理需要下载 AnchorCrafter 模型权重：
    git clone https://github.com/cangcz/AnchorCrafter
    """
    
    def __init__(self, model_path: str = "cangcz/AnchorCrafter"):
        self.model_path = model_path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    def generate_demo_video(
        self, 
        config: AnchorDemoConfig,
        text_prompt: Optional[str] = None,
        num_inference_steps: int = 50,
    ) -> Dict:
        """
        生成虚拟主播产品演示视频
        
        Args:
            config: 视频生成配置
            text_prompt: 动作描述文本
            num_inference_steps: 扩散去噪步数
        
        Returns:
            {frames: List[PIL.Image], metadata: dict}
        """
        # Step 1: 加载商品图 + 主播参考
        product_img = Image.open(config.product_image_path).convert("RGB")
        anchor_img = Image.open(config.anchor_reference_path).convert("RGB")
        
        # Step 2: HOI 动作序列生成（占位逻辑，实际调用 AnchorCrafter 模型）
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2411.17383 — AnchorCrafter: Animate Cyber-Anchors Selling Your Products via Human-Object Interacting Video Generation

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：商品白底高清图（正面与侧面各 1 张）、主播参考视频（约 1 分钟，或选用预训练形象库）、动作描述文本。

**输出**：15-30 秒的虚拟主播产品演示视频（含手势与微表情）与同一商品的多主播形象版本；供投放与内容团队使用。

## 执行步骤

1. 准备商品图、主播参考与动作描述
2. 按配置生成虚拟主播演示视频
3. 检查商品外观还原度与动作自然度
4. 更换主播形象批量产出多市场版本
5. 输出成片清单与素材规格

## 边界与不做

- 没有商品清晰图或主播参考素材时无法生成；需要真人出镜信任背书的场景不用本技能。
- 本技能产出演示视频素材，不代替广告合规审核与投放执行。
- 安全边界：虚拟主播须按平台与法规要求标注 AI 生成；不得虚构产品功能或伪造真人使用体验。

## 技能关联

- **前置**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-BrandFusion-Multi-Agent.html、Skill-BrandFusion-Multi-Agent、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Virbo-Multilingual-Avatar-UGC.html、Skill-Virbo-Multilingual-Avatar-UGC
- **延伸**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-BrandFusion-Multi-Agent.html、Skill-BrandFusion-Multi-Agent、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Virbo-Multilingual-Avatar-UGC.html、Skill-Virbo-Multilingual-Avatar-UGC
- **可组合**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-BrandFusion-Multi-Agent.html、Skill-BrandFusion-Multi-Agent、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Virbo-Multilingual-Avatar-UGC.html、Skill-Virbo-Multilingual-Avatar-UGC、Skill-AnchorCrafter-Virtual-Anchor-Demo

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-AnchorCrafter-Virtual-Anchor-Demo`