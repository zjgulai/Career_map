---
name: "p2s-text-to-edit-video-ad"
title: "Skill Card: Text-to-Edit — MLLM母婴视频广告智能剪辑"
description: "触发词：自然语言剪辑、素材库匹配、剪辑方案生成、多平台适配、素材复用。何时不用：素材库里没有可用片段时无法执行指令式剪辑；从零构思的创意广告片不用本技能。安全边界：字幕与标签宣称（如皮肤科测试）须有认证依据；音乐须免版权或已授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 视觉简报"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Text-to-Edit-Video-Ad"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "直接说一句『把第 5 到 8 秒换成洗澡场景』，系统就从素材库里挑片段剪出成品视频。"
user_try: "试试：按『产品展示 3 秒加婴儿洗澡场景 3 秒加用户评价 2 秒加 CTA 2 秒』剪一条 30 秒 TikTok Shop 视频。"
whenToUse: "已有素材库、要按自然语言指令快速剪出多平台版本时用本技能；没有素材积累时先建素材库。"
workflow: "输入自然语言编辑指令（场景、时长、标签、平台） → 从素材库按指令匹配对应片段 → 生成结构化剪辑方案（时间轴 JSON） → 渲染成品并输出配音脚本与字幕文件"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Text-to-Edit — MLLM母婴视频广告智能剪辑

## ① 解决的问题

运营提交"把产品视频第 5-8 秒换成使用场景"的需求，人工剪辑需 2 天、外包成本 $500+——Text-to-Edit 视频编辑将自然语言指令直接执行，从"需求到成品"缩短到 10 分钟，广告素材迭代成本降低 90%

## ② 核心算法逻辑

核心思想：通过多模态大语言模型（MLLM）理解自然语言编辑指令，端到端生成结构化剪辑方案（JSON格式的镜头序列、配音脚本、装饰元素），将母婴品牌广告从"2天手工剪辑"降至"10分钟自动生成"。

## ③ 业务应用场景

业务问题： 某母婴品牌（婴儿沐浴露、洗发水）在Amazon、Shopee、TikTok Shop同步运营。原流程：每个SKU×每个平台需制作1-2条"产品展示+使用场景+用户评价"的短视频，由外包视频团队制作，周期8-10天，单条成本 $800-1200。内容库存严重不足，导致平台曝光率低。
具体数据规模： - 产品矩阵：12个SKU（不同香型、规格） - 目标平台：3个（Amazon、Shopee、TikTok Shop） - 月度视频需求：36条（12 SKU × 3平台） - 素材库：200条预制短片（产品展示、婴儿洗澡场景、用户评价、装饰元素）
应用流程： 1. 运营输入：`"婴儿沐浴露-无泪配方，展示产品+婴儿洗澡场景（5-8秒）+用户评价（8-12秒），加'Dermatologist Tested'标签，背景音乐温馨风格，时长30秒，适配TikTok Shop"` 2. MLLM处理：理解需求 → 从素材库自动匹配"产品展示片段（3秒）+ 婴儿洗澡场景（3秒）+ 用户评价（2秒）+ CTA（2秒）" → 生成JSON剪辑方案 → 自动渲染 3. 输出：30秒成品视频 + 配音脚本 + 字幕文件

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

成本：$1.44（AI渲染 $1.44 vs 外包 $800）
收益：基于转化率提升 1.4%，假设单条视频带动销售额 $5,000，增量收益 = $5,000 × 1.4% = $70
**单条ROI = $70 / $1

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（316 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/visual_content/text_to_edit_video_ad` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Text-to-Edit-Video-Ad.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict

class TextToEditVideoAdPipeline:
    """
    MLLM母婴视频广告智能剪辑引擎
    输入：产品信息 + 自然语言编辑指令 + 素材库
    输出：JSON剪辑方案 + 配音脚本 + 装饰标签
    """
    
    def __init__(self, material_library_size=200):
        """初始化素材库和编辑规则"""
        self.material_library = self._init_material_library(material_library_size)
        self.edit_rules = self._init_edit_rules()
        self.voice_styles = {
            "warm": {"speed": 0.95, "pitch": 1.1},
            "professional": {"speed": 1.0, "pitch": 1.0},
            "energetic": {"speed": 1.1, "pitch": 1.2}
        }
        self.overlay_templates = {
            "limited_offer": {"duration": 2, "position": "bottom"},
            "product_feature": {"duration": 3, "position": "center"},
            "user_testimonial": {"duration": 2, "position": "top"}
        }
    
    def _init_material_library(self, size):
        """初始化素材库：包含产品展示、使用场景、用户评价等片段"""
        library = {
            "product_showcase": [
                {"id": f"ps_{i}", "duration": 3, "category": "婴儿洗护", "content": f"Product showcase {i}"}
                for i in range(1, 51)
            ],
            "usage_scene": [
                {"id": f"us_{i}", "duration": 4, "category": "婴儿洗护", "content": f"Usage scene {i}"}
                for i in range(1, 51)
            ],
            "user_feedback": [
                {"id": f"uf_{i}", "duration": 2, "category": "婴儿洗护", "content": f"User feedback {i}"}
                for i in range(1, 51)
            ],
            "cta_segment": [
                {"id": f"cta_{i}", "duration": 2, "category": "通用", "content": f"CTA segment {i}"}
                for i in range(1, 51)
            ]
        }
        return library
    
    def _init_edit_rules(self):
        """编辑规则：将自然语言指令映射到结构化动作"""
        return {
            "replace": r"换成|替换|改为",
            "add": r"加|添加|插入",
            "remove": r"删除|移除|去掉",
            "adjust": r"调整|修改|改变",
            "time_pattern": r"(\d+)-(\d+)秒|第(\d+)秒"
        }
    
    def parse_edit_instruction(self, instruction):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2501.05884 — Text-to-Edit: Controllable End-to-End Video Ad Creation via Multimodal LLMs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品信息与自然语言编辑指令、可用素材库（产品展示、使用场景、用户评价、装饰元素片段）、目标平台与时长要求。

**输出**：成品短视频（含字幕）、结构化剪辑方案（时间轴 JSON）、配音脚本与装饰标签；供运营在 Amazon、Shopee、TikTok Shop 等多平台发布。

## 执行步骤

1. 接收自然语言编辑指令并解析场景、时长与平台要求
2. 从素材库匹配对应片段与装饰元素
3. 生成结构化剪辑方案（时间轴、字幕、标签）
4. 渲染成品视频并输出配音脚本
5. 按目标平台规格适配后交付

## 边界与不做

- 素材库缺少所需片段时无法执行指令，需先补齐素材。
- 本技能输出剪辑方案与成片，不代替创意策划与真人拍摄。
- 安全边界：标签与字幕宣称须有认证依据，不得使用未获授权的功效声明；音乐须免版权或已授权。

## 技能关联

- **前置**：Skill-Aquarius-Brand-Video-Generation.html、Skill-Aquarius-Brand-Video-Generation
- **延伸**：Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation
- **可组合**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Text-to-Edit-Video-Ad

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Text-to-Edit-Video-Ad`