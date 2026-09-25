---
name: "p2s-diffusion-model-product-image"
title: "Diffusion Model Product Image Generation — 扩散模型产品图生成：AI 主图替代专业摄影"
description: "触发词：AI 产品图、白底主图、场景图替换、摄影替代、批量出图。何时不用：需要真实使用效果或平台要求实拍证据的类目不要用生成图；成品图的合规与质量门控用主图评分技能。安全边界：Amazon 主图必须纯白底，场景化生成图只能用于副图或 A+ 页面，误用可能导致 Listing 下架。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-092"
l3_business: "视觉简报"
l3_all: "视觉简报 / 素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/视觉简报"
p2s_card_id: "Skill-Diffusion-Model-Product-Image"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "一张真实产品照就能批量生成不同场景的产品图，把专业摄影的预算和七天交期压缩到两小时。"
user_try: "试试：以这张吸奶器白底图为基础生成候选产品图（含白底合规图与生活场景图），并给出 A/B 测试的图片组合建议。"
whenToUse: "需要快速扩充产品图数量与场景时用本技能；成品图的合规与质量门控用主图质量评分技能。"
workflow: "准备真实产品照片与目标风格参考图 → 按图片类型生成提示词（白底、生活场景、细节、对比） → 保持产品主体一致并批量生成候选图 → 筛出合规白底图与可用场景图，输出 A/B 测试组合建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Diffusion Model Product Image Generation — 扩散模型产品图生成：AI 主图替代专业摄影

## ① 解决的问题

新款吸奶器需要12张产品图专业摄影报价2400美元等7天——Stable Diffusion ControlNet基于一张真实产品照片2小时生成50张候选图，成本降低90%大促前快速迭代年化节省20-50万元

## ② 核心算法逻辑

扩散模型 vs 传统图像生成：

## ③ 业务应用场景

业务问题：新款吸奶器需要 Amazon 主图（白底）+ 生活场景图（5张）+ 使用场景图（3张）+ 竞品对比图，共 12 张。专业摄影报价 $2,400，交期 7 天。AI 生成可以在 2 小时内生成 50 张候选，选最好的 12 张。
数据要求： - 真实产品照片（至少 1 张） - 目标风格参考图（竞品的优质主图）
预期产出： - 50+ 张候选生成图（不同场景/角度/风格） - 白底合规图（符合 Amazon 规格） - A/B 测试建议：哪些图片组合可以先测试

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
专业摄影成本降低 80-90%：每款新品节省 $400-3,600
迭代速度：7天 → 2小时，大促前快速更新图片
多市场本地化图片零额外摄影成本
年化综合 ROI：¥20-50 万（假设月均 2-3 款新品）
实施难度：⭐⭐⭐☆☆（Stable Diffusion API 接入 1-2 周；ControlNet 需要 GPU 或使用 Replicate API；图片合规（白底标准）需要后处理约 1 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/visual_content/diffusion_model_product_image` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Diffusion-Model-Product-Image.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Diffusion Model Product Image Generation
扩散模型产品图生成：AI主图 + 场景化
生产环境: pip install diffusers transformers torch pillow
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class ProductImageConfig:
    """产品图生成配置"""
    product_description: str         # 产品描述
    product_category: str            # 品类
    target_market: str               # 目标市场
    image_type: str                  # 'white_bg' / 'lifestyle' / 'detail' / 'comparison'
    aspect_ratio: str = '1:1'        # Amazon 要求1:1
    resolution: int = 1024           # 建议1024x1024
    reference_image_path: Optional[str] = None


def generate_product_prompt(config: ProductImageConfig) -> dict:
    """
    生成 Stable Diffusion 提示词
    生产代码:
    from diffusers import StableDiffusionControlNetPipeline, ControlNetModel
    controlnet = ControlNetModel.from_pretrained('lllyasviel/control_v11p_sd15_canny')
    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        'runwayml/stable-diffusion-v1-5', controlnet=controlnet)
    image = pipe(prompt, image=canny_image).images[0]
    """

    # 基础提示词组件
    base_quality = "professional product photography, commercial quality, sharp focus, high resolution, 8k"
    no_watermark = "no watermark, no text overlay, no human hands, clean"

    # 按图片类型构建提示词
    type_prompts = {
        'white_bg': f"{config.product_description}, white background, centered, studio lighting, {base_quality}, {no_watermark}",
        'lifestyle': _build_lifestyle_prompt(config),
        'detail': f"{config.product_description}, macro photography, detail shot, close-up, product details, {base_quality}",
        'comparison': f"{config.product_description}, size comparison, multiple angles, flat lay, {base_quality}",
    }

    positive_prompt = type_prompts.get(config.image_type, type_prompts['white_bg'])

    # 负面提示词（避免生成瑕疵）
    negative_prompt = "blurry, low quality, distorted, deformed, extra limbs, missing parts, " + \
                      "watermark, text, logo, nsfw, bad anatomy, poorly lit"

    return {
        'positive': positive_prompt,
        'negative': negative_prompt,
        'config': {
            'steps': 30,
            'guidance_scale': 7.5,
            'width': config.resolution,
            'height': config.resolution,
        }
    }
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2504.07823，但该号在 arXiv 上是《A new look into the atmospheric composition of WASP-39 b》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：至少 1 张真实产品照片、目标风格参考图、产品描述与目标市场、图片类型与比例要求（Amazon 主图要求 1:1）。

**输出**：批量候选生成图（含符合平台规格的白底合规图与场景图）与推荐用于 A/B 测试的图片组合；供视觉与运营团队使用。

## 执行步骤

1. 准备真实产品照与风格参考图
2. 生成对应图片类型的提示词
3. 保持主体一致批量出图
4. 筛出符合白底规格的主图与可用场景图
5. 输出 A/B 测试图片组合建议

## 边界与不做

- 只有文字描述、没有真实产品照片时不用本技能，主体一致性无法保证。
- 本技能产出候选图与建议，不代替平台图片合规终审。
- 安全边界：场景化生成图不得用作主图（主图须纯白底）；场景中若出现人物须为 AI 生成而非真人肖像。

## 技能关联

- **前置**：Skill-AIGC-Revenue-Attribution.html、Skill-AIGC-Revenue-Attribution、Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Product-Background-Scene-Generation.html、Skill-Product-Background-Scene-Generation、Skill-Visual-Product-Search.html、Skill-Visual-Product-Search
- **延伸**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Product-Background-Scene-Generation.html、Skill-Product-Background-Scene-Generation、Skill-Visual-Product-Search.html、Skill-Visual-Product-Search
- **可组合**：Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Product-Background-Scene-Generation.html、Skill-Product-Background-Scene-Generation、Skill-Diffusion-Model-Product-Image

---

> 分类：业务运营/品牌与增长/视觉简报　·　技术族：20-AI视频生成　·　源卡：`Skill-Diffusion-Model-Product-Image`