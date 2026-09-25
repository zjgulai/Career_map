---
name: "p2s-aigc-authenticity-trust-framework"
title: "AIGC Authenticity Trust Framework — 图文双轨 AIGC 真实性检测与消费者信任管理"
description: "触发词：AIGC 真实性检测、素材风险分级、消费者信任、图文双轨、上架前检测。何时不用：只鉴别文本是否为 AI 生成时用 AIGC 内容鉴别技能；本技能同时看图像 Patch 不连续性与文本统计特征。安全边界：平台已强化 AI 内容标注规定，高风险素材须替换或按平台要求标注，不得隐瞒 AI 生成事实。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-094"
l3_business: "素材版本管理"
l3_all: "素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/素材版本管理"
p2s_card_id: "Skill-AIGC-Authenticity-Trust-Framework"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "AI 生成的图和文案上架前先过一遍双轨检测，绿色直接用、黄色修、红色换，别等消费者发现才补救。"
user_try: "试试：对这批 Midjourney 生成的 20 张产品场景图做 Patch 不连续性打分，给出绿/黄/红风险分级与修改建议。"
whenToUse: "素材是 AI 生成、要评估上架风险与信任影响时用本技能；只需鉴别评论文本真假用 AIGC 内容鉴别技能。"
workflow: "接入待检素材（图片与文案） → 计算图像 Patch 不连续性分数与文本词汇多样性指标 → 按阈值输出绿/黄/红风险等级 → 给出修图、替换或标注建议，高风险素材不得直接上架"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AIGC Authenticity Trust Framework — 图文双轨 AIGC 真实性检测与消费者信任管理

## ① 解决的问题

母婴卖家大量使用 AI 生图/文案后不知是否触发平台检测或被消费者察觉，信任危机导致评分骤降——双轨真实性检测（图像 Patch 不连续性 + 文本 TTR/重复率）预先标记高风险内容，避免上架后信任危机导致年化 50-200 万元 GMV 损失

## ② 核心算法逻辑

当母婴品牌大规模使用 AI 生成图片和文案时，面临双重风险：平台合规检测（被 Amazon/TikTok 标记 AI 内容）和消费者信任危机（用户察觉 AI 生成后转化率骤降）。AIGC Authenticity Trust Framework 提供图像和文本的双轨检测，在发布前评估内容风险等级，而非事后补救。

## ③ 业务应用场景

业务问题：运营团队用 Midjourney 生成了 20 张产品场景图准备上传 Amazon，不确定是否会触发平台 AI 内容检测，也不知道消费者看到后信任度如何。
双轨检测流程： 1. 对每张图片计算 Patch 不连续性分数（0-1，越高越像 AI） 2. 输出风险等级：绿（<0.3，安全）/ 黄（0.3-0.6，建议修图）/ 红（>0.6，高风险） 3. 估算消费者信任下降幅度（基于真实性感知研究）
| 图片 | AI 真实性分 | 风险等级 | 建议 | |---|---|---|---| | main_hero.jpg | 0.18 | 🟢 安全 | 可直接使用 | | lifestyle_01.jpg | 0.52 | 🟡 注意 | 建议加入真实使用场景 | | product_flat.jpg | 0.78 | 🔴 高风险 | 需替换为实拍图 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

每次 AI 内容引发的消费者信任危机（评分从 4.5→3.8 星）潜在 GMV 损失：50-200 万元/年
提前识别高风险内容，避免上架后补救：节省危机公关成本 10-30 万元/次
文案优化方向指导：TTR 提升使文案 CTR 提升 5-15%
消费者对 AI 内容真实性的敏感度随平台监管加强而上升（2025 年 Amazon/TikTok 均强化 AI 内容标注规定）
母婴品类消费者信任敏感度高于平均水平（涉及婴儿安全）
实施成本低（纯统计方法，无需 LLM 调用）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（276 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ai_humanities/aigc_authenticity_trust_framework` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AIGC-Authenticity-Trust-Framework.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AIGC Authenticity Trust Framework
图文双轨 AIGC 真实性检测 + 消费者信任影响评估
依赖: numpy, Pillow（pip install pillow numpy）
"""
import numpy as np
from PIL import Image
import re
from typing import Tuple, Dict, List
from dataclasses import dataclass

@dataclass
class AuthenticityResult:
    content_id: str
    content_type: str          # 'image' or 'text'
    ai_score: float            # 0=真实, 1=AI生成
    risk_level: str            # GREEN/YELLOW/RED
    trust_impact: float        # 消费者信任下降估算（%）
    details: Dict

# ─────────────────────────────────────────
# 图像轨：Patch 不连续性检测
# ─────────────────────────────────────────

def extract_patch_features(img_array: np.ndarray, patch_size: int = 16) -> np.ndarray:
    """提取图像 Patch 级梯度特征"""
    if len(img_array.shape) == 3:
        gray = img_array.mean(axis=2)
    else:
        gray = img_array.astype(float)
    h, w = gray.shape
    features = []
    for i in range(0, h - patch_size, patch_size):
        for j in range(0, w - patch_size, patch_size):
            patch = gray[i:i+patch_size, j:j+patch_size]
            # 水平和垂直梯度
            grad_h = np.diff(patch, axis=0)
            grad_v = np.diff(patch, axis=1)
            features.append([
                grad_h.std(),           # 水平梯度标准差
                grad_v.std(),           # 垂直梯度标准差
                patch.std(),            # Patch 内亮度方差
                np.abs(grad_h).mean(),  # 平均梯度幅度
            ])
    return np.array(features)

def compute_patch_discontinuity(features: np.ndarray) -> float:
    """
    计算相邻 Patch 间的不连续性分数（GenDF 核心思路）
    AI 图像：相邻 Patch 统计特性差异大 → 高分
    真实图像：光照/噪声连续 → 低分
    """
    if len(features) < 2:
        return 0.5
    # 相邻 Patch 间梯度差异
    diffs = np.abs(np.diff(features, axis=0))
    discontinuity = diffs.mean()
    # 归一化到 0-1
    score = float(np.clip(discontinuity / 15.0, 0, 1))
    return score
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2512.21709 — Detecting AI-Generated Paraphrases in Bengali: A Comparative Study of Zero-Shot and Fine-Tuned Transformers

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：待检素材集合：产品图（可解码为数值数组的位图）与文案文本。图片建议提供像素级数组以便计算 Patch 级梯度特征。

**输出**：每张图与每条文案的真实性分数、风险等级（绿/黄/红）、消费者信任影响提示与处置建议表；供内容审核与上架门控使用。

## 执行步骤

1. 接入待检图片与文案素材
2. 提取图像 Patch 梯度特征并计算不连续性分数
3. 计算文本词汇多样性与重复率指标
4. 按阈值输出绿、黄、红风险分级
5. 生成修图、替换或标注的处置建议

## 边界与不做

- 素材并非 AI 生成、或只想做版式与排版检查时不用本技能。
- 本技能输出风险分级与修改建议，不代表平台的最终审核结论。
- 安全边界：不得隐瞒 AI 生成事实，须遵守平台 AI 内容标注规定；高风险素材应替换或明确标注后再上架。

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-AIGC-Authenticity-Trust-Framework

---

> 分类：业务运营/品牌与增长/素材版本管理　·　技术族：11-AI人文　·　源卡：`Skill-AIGC-Authenticity-Trust-Framework`