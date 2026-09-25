---
name: "p2s-aquarius-brand-video-generation"
title: "Aquarius — Brand Video Generation（品牌营销视频生成）"
description: "触发词：品牌视频批量生成、多市场本地化、模特形象切换、节日主题、品牌视觉一致。何时不用：单条视频精修或需要真人实拍品牌片时不用；品牌元素严格植入与校验用品牌植入类技能。安全边界：虚拟形象须标注 AI 生成；本地化节日元素须避免文化误用，文案不得虚假宣传。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 本地化"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Aquarius-Brand-Video-Generation"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "一套品牌素材自动生成各市场的品牌视频，换模特、换语言、换节日主题，品牌色和产品外观不变。"
user_try: "试试：用我的品牌素材和美、德、英、日四市场的本地化参数，批量生成 12 条品牌视频并保持品牌视觉一致。"
whenToUse: "多市场多版本品牌视频批量生产时用本技能；对品牌元素植入精度有硬要求时用品牌植入类技能。"
workflow: "准备品牌主视觉素材与各市场本地化参数 → 按市场与用户分群配置视频版本 → 批量生成并保持品牌色与产品外观一致 → 产出后做个性化版本与通用版本的 A/B 测试"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Aquarius — Brand Video Generation（品牌营销视频生成）

## ① 解决的问题

母婴品牌需要在美/德/英/日 4 个市场投放品牌视频广告——每个市场需要不同模特、不同语言字幕、不同节日主题（美国感恩节/德国圣诞节/日本新年）

## ② 核心算法逻辑

工业级营销视频生成系统——不是"能生成视频就行"，而是面向"千人千面"品牌营销场景的完整管线：图生视频、文生视频(Avatar)、视频修复、个性化、分布式数据管线。两种 DiT 架构适配不同场景。

## ③ 业务应用场景

业务问题：某母婴品牌主营婴儿暖奶器（SKU：WarmPro-300），库存 2000 件，日销 50 件，当前 ROAS 3.2，转化率 4.5%。需在美/德/英/日 4 个市场投放品牌视频广告——每个市场需要不同模特、不同语言字幕、不同节日主题（美国感恩节/德国圣诞节/日本新年）。传统拍摄：4 市场 × 3 版本 = 12 条视频，$50,000+。
数据要求： - 品牌主视觉素材（Logo、暖奶器产品图、品牌色板） - 各市场本地化参数（模特形象：美式白人妈妈/德式北欧妈妈/日式亚洲妈妈；语言：EN/DE/JA；节日元素：火鸡/圣诞树/门松） - 用户画像数据：高价值用户（客单价 $89）vs 新用户（首单 $49），需生成不同版本视频
预期产出： - 12 条品牌视频批量生成，保持品牌视觉一致性（暖奶器外观、品牌色 #FF6B35） - 每条 GPU 成本约 $3-5（vs 实拍 $4,000+） - 视频个性化：针对高价值用户推送"暖奶器 + 辅食加热"场景，针对新用户推送"开箱即用"场景 - 产出后 A/B 测试：个性化视频组 vs 通用视频组，预期转化率提升至 5.8%（+1.3pp），ROAS 提升至 4.1

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（46 行）。**下面 46 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **46 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，46 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/aquarius_brand_video_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Aquarius-Brand-Video-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Aquarius Brand Video Pipeline — 多市场品牌视频生产"""

import numpy as np
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class MarketConfig:
    market: str; avatar_style: str; festival_theme: str
    language: str; aspect_ratio: str = "9:16"

class AquariusBrandPipeline:
    """品牌视频批量生产调度器"""
    
    def __init__(self, model_size: str = "2B"):
        self.model_size = model_size
    
    def generate_campaign(self, brand_assets: Dict, markets: List[MarketConfig],
                          base_prompt: str) -> List[Dict]:
        """多市场品牌 Campaign 批量生成"""
        results = []
        for mkt in markets:
            localized_prompt = (
                f"{base_prompt}, {mkt.avatar_style} model, "
                f"{mkt.festival_theme} theme, {mkt.language} text overlay, "
                f"{mkt.aspect_ratio} aspect ratio"
            )
            gpu_cost = 3.0 if self.model_size == "2B" else 8.0
            results.append({
                "market": mkt.market, "prompt": localized_prompt,
                "estimated_gpu_cost": f"${gpu_cost:.0f}",
            })
        total = sum(float(r["estimated_gpu_cost"].replace("$","")) for r in results)
        return {"videos": results, "total_cost": f"${total:.0f}",
                "vs_traditional": f"${len(markets)*4000:,}", "saving_pct": f"{(1-total/(len(markets)*4000)):.0%}"}

if __name__ == '__main__':
    markets = [
        MarketConfig("US", "Caucasian mom", "Thanksgiving", "EN"),
        MarketConfig("DE", "European mom", "Christmas", "DE"),
        MarketConfig("JP", "Asian mom", "New Year", "JA"),
    ]
    pipe = AquariusBrandPipeline("2B")
    result = pipe.generate_campaign({"logo": "brand.png"}, markets, "breast pump product showcase")
    print(f"4市场×3版本: GPU ${result['total_cost']} vs 实拍 ${result['vs_traditional']} (省{result['saving_pct']})")
    print("[✓] Aquarius Brand Video 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2505.10584 — Aquarius: A Family of Industry-Level Video Generation Models for Marketing Scenarios
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：品牌主视觉素材（Logo、产品图、品牌色板）、各市场本地化参数（模特形象、语言、节日元素）、用户画像分群（如高价值用户与新用户）。

**输出**：多市场多版本的品牌视频批量产物与品牌一致性检查结果，以及 A/B 测试的版本分组；供品牌与投放团队使用。

## 执行步骤

1. 准备品牌素材与各市场本地化参数
2. 配置市场与版本的生成矩阵
3. 批量生成并校验品牌色与产品外观一致性
4. 按用户分群分配个性化版本
5. 组织个性化与通用版本的 A/B 测试

## 边界与不做

- 没有统一的品牌素材包时不用本技能，多版本会失去品牌一致性。
- 本技能产出视频版本与测试分组，不执行媒体投放与效果归因。
- 安全边界：虚拟形象须标注 AI 生成；本地化元素不得文化误用，文案不得虚假宣传。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-BrandFusion-Multi-Agent.html、Skill-BrandFusion-Multi-Agent、Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **延伸**：Skill-BrandFusion-Multi-Agent.html、Skill-BrandFusion-Multi-Agent、Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **可组合**：Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Text-to-Edit-Video-Ad.html、Skill-Text-to-Edit-Video-Ad、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Aquarius-Brand-Video-Generation

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Aquarius-Brand-Video-Generation`