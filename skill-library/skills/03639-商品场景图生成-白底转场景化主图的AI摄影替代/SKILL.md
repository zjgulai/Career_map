---
name: "p2s-product-background-scene-generation"
title: "SD+ControlNet商品场景图生成 — 白底转场景化主图的AI摄影替代"
description: "触发词：场景图生成、白底转场景、一图多场景、节日主题图、场景 A/B 测试。何时不用：需要真实使用场景证据的类目不要用生成场景图；成品图的质量评分与门控用主图评分技能。安全边界：Amazon 主图必须纯白底，场景图只能用于副图或 A+ 页面；场景中出现人脸须为 AI 生成而非真实人物。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-092"
l3_business: "视觉简报"
l3_all: "视觉简报 / 素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/视觉简报"
p2s_card_id: "Skill-Product-Background-Scene-Generation"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把一张白底商品图变成婴儿房、户外草地、木地板客厅等多个场景，测出哪个背景点击率最高。"
user_try: "试试：用这张爬行垫白底图生成婴儿房、户外草地、木地板客厅三套场景图，用于 A/B 测试找最高 CTR 的场景。"
whenToUse: "已有合规白底图、要扩充场景图做测试时用本技能；成品图的质量评分用主图评分技能。"
workflow: "准备白底商品图与按品类预设的场景提示词 → 按目标场景数量生成场景化图 → 批量输出同视角、不同背景的成套场景图 → 用于 A/B 测试并挑出 CTR 最高的场景"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SD+ControlNet商品场景图生成 — 白底转场景化主图的AI摄影替代

## ① 解决的问题

摄影预算有限的卖家面临"每个SKU拍多场景图成本极高"——SD Inpainting+ControlNet将场景化主图成本从$200/SKU降至$8/SKU，年化节省$28.8万

## ② 核心算法逻辑

核心思想：ControlNet 在 Stable Diffusion 基础上增加了结构控制条件（边缘图/深度图/骨架图），使得在换背景时能锁定商品的形状和轮廓，只替换背景场景。通过 Inpainting 技术，商品主体区域保持不变，背景由文本描述驱动生成。

## ③ 业务应用场景

场景A：一图多场景 A/B 测试 - 业务问题：某爬行垫 SKU 只有白底主图，不知道哪种场景背景（婴儿房/户外草地/木地板客厅）最能提升 CTR，传统摄影 3 套场景需 $600-800 - 数据要求： - 商品白底图（≥1000×1000px，主体居中，背景纯白） - 场景描述文本（Prompt 库，按品类预设） - 目标场景数量（3-5 套即可覆盖 A/B 测试需求） - 预期产出：5 套不同场景的场景化主图，含商品同一视角、不同背景环境 - 业务价值：摄影成本从 $600-800 降至 $2-5（GPU 推理费），A/B 测试找到最高 CTR 场景后，该场景 CTR 平均提升 12-2
三轨验证： - 成本：显性成本包括 GPU 推理费（A10G 约 $0.76/小时，每图约 15 秒，5 图约 $0.016）、Prompt 设计人力（约 2 小时/品类，$50/小时）、SAM 分割预处理（免费开源）。总成本约 $100-150/品类（含人工调优）。 - 合规：Amazon 主图政策要求主图必须为纯白底（RGB 255,255,255），场景图仅允许用于副图（Alt Images）或 A+ 页面。若将场景图用作主图，违反 Amazon 图片政策，可能导致 Listing 下架。GDPR 无直接冲突，但场景中若出现人脸（如婴儿模型）需确保为 AI 生成而非真实人物。 - 风险：
场景B：批量 SKU 节日场景定制 - 业务问题：圣诞节前需对 80 个 SKU 生成圣诞主题主图（雪地/圣诞树背景），传统摄影不可能批量完成 - 数据要求：80 个 SKU 的白底图 + 圣诞场景 Prompt 模板（统一风格） - 预期产出：80 张圣诞场景图，批量处理 2-3 小时完成 - 业务价值：节日主题图 CTR 比常规主图高 15-25%；节省外包摄影费 $40,000+（80 SKU × $500/套）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
直接摄影替代：$200-800/套 × 80 SKU × 5 场景 = $80,000-320,000 摄影费 → AI 替代后 GPU 费用约 $40-60
CTR 提升价值：场景化主图 CTR 平均提升 12-20%，对于月销 $50K 的 SKU，对应 GMV 增量 $6,000-10,000/月
节日快速响应：节日前 2 天完成主图换装，比竞品提前上线，Prime Day 首周 GMV 增量约 $15,000
实施难度：⭐⭐⭐⭐☆（4/5）— 需要 GPU 推理环境（HuggingFace Space 或自部署），工程复杂度中等
优先级：⭐⭐⭐⭐☆（4/5）— ROI 极高但工程门槛略高，建议第二阶段引入

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（295 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/product_background_scene_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Product-Background-Scene-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SD+ControlNet 商品场景图生成引擎
白底商品图 → 场景化主图的 AI 摄影替代方案
生产环境：接入 diffusers 库 + GPU 推理（A10/T4）
当前演示：Mock 推理流程 + 完整业务逻辑
"""
import json
import time
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass
class GenerationConfig:
    """单次生成配置"""
    product_image_path: str         # 白底商品图路径
    scene_prompt: str               # 场景描述（英文，Stable Diffusion 格式）
    negative_prompt: str            # 负向提示（避免的内容）
    scene_name: str                 # 场景中文名称（用于文件命名）
    strength: float = 0.75          # Inpainting 强度（0.6-0.9，越高背景变化越大）
    guidance_scale: float = 7.5     # CFG 引导强度
    num_inference_steps: int = 30   # 推理步数（质量 vs 速度权衡）
    seed: int = 42                  # 随机种子（固定复现）


@dataclass
class GenerationResult:
    """生成结果"""
    scene_name: str
    output_path: str
    prompt_used: str
    generation_time_sec: float
    estimated_quality_score: float  # 0-1，基于启发式规则估算
    cost_usd: float                 # GPU 推理费用估算


# 母婴品类预设场景 Prompt 库
BABY_SCENE_PROMPTS: Dict[str, Dict[str, str]] = {
    "nursery_room": {
        "prompt": (
            "cozy nursery room background, soft pastel colors, white wooden crib visible, "
            "warm afternoon sunlight through sheer curtains, clean and modern baby room, "
            "blurred background, lifestyle photography, professional product photo"
        ),
        "negative": "cluttered, dark, adult items, text, watermark, low quality, blurry product",
        "name": "婴儿房场景",
    },
    "outdoor_garden": {
        "prompt": (
            "bright outdoor garden background, fresh green grass, soft bokeh effect, "
            "natural daylight, spring morning atmosphere, clean and airy, "
            "lifestyle product photography, blurred background"
        ),
        "negative": "indoor, dark, rain, crowded, text, watermark, low quality",
        "name": "户外花园场景",
    },
    "modern_living_room": {
        "prompt": (
            "modern Scandinavian living room background, light oak wood floor, "
            "white minimal furniture, large window with soft natural light, "
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2302.05543 — Adding Conditional Control to Text-to-Image Diffusion Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：白底商品图（建议不小于 1000×1000px、主体居中、背景纯白）、场景描述提示词库、目标场景数量（3-5 套即可覆盖测试需求）；批量场景需统一的提示词模板。

**输出**：多套同视角、不同背景的场景化图（含节日主题批量图）与推荐用于 A/B 测试的场景组合；供视觉与运营团队投放测试。

## 执行步骤

1. 准备白底商品图与场景提示词模板
2. 按场景做商品主体分割与背景重绘
3. 批量生成同视角多背景成套图
4. 输出待测场景组合并记录生成参数
5. 按 A/B 结果挑出高 CTR 场景

## 边界与不做

- 白底图质量不达标（主体不居中或背景带色）时不用本技能，主体一致性会崩。
- 本技能产出场景图与测试组合，不代替平台图片合规审核。
- 安全边界：场景化生成图不得用作主图（主图须纯白底），误用可能导致 Listing 下架；场景中人物须为 AI 生成。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Diffusion-Model-Product-Image.html、Skill-Diffusion-Model-Product-Image、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-Product-Image-Quality-Assessment.html、Skill-Product-Image-Quality-Assessment、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-E-Commerce-Video-Benchmark.html、Skill-E-Commerce-Video-Benchmark、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Product-Background-Scene-Generation

---

> 分类：业务运营/品牌与增长/视觉简报　·　技术族：20-AI视频生成　·　源卡：`Skill-Product-Background-Scene-Generation`