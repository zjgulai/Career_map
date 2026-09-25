---
name: "p2s-listing-ai-copywriting"
title: "Amazon Listing 文案 AI 生成（标题+Bullet+描述全套）"
description: "触发词：Listing 文案、标题五点生成、属性引导生成、违禁词过滤、关键词覆盖。何时不用：只做 A+ 模块内容用「A+ 内容模板引擎」；本技能产出整条 Listing 文案。安全边界：自动过滤 clinically proven、FDA approved 类违禁宣称，不得生成未经授权的医疗功效表达。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-AI-Copywriting"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给出商品属性，几秒产出一整套标题、五点、描述和后台搜索词，并自动挡掉违规词。"
user_try: "试试：按这款电动吸奶器的属性生成一套英文 Listing，含标题、五点和后台搜索词，别出现违规词。"
whenToUse: "当新品需要批量产出整条 Listing 文案（标题、五点、描述、后台词）并做合规过滤时用；A+ 模块方案用「A+ 内容模板引擎」。"
workflow: "整理商品属性、目标用户与目标市场 → 提取竞品关键词与平台搜索建议词 → 生成标题、五点、描述与后台搜索词草稿 → 做违禁词与功效宣称过滤"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Amazon Listing 文案 AI 生成（标题+Bullet+描述全套）

## ① 解决的问题

某母婴品牌每月新品 8-12 个 SKU，人工撰写一套完整 Listing（标题+5条Bullet+描述+后台ST）需要 2-3 小时/SKU，月均耗时 20-30 小时

## ② 核心算法逻辑

核心思想：将商品属性（品类/材质/功能/目标用户）通过属性引导的条件文本生成（AttributeGuided Prompt Tuning, APGT）转化为符合 Amazon 合规格式的完整 Listing 文案，同时通过集成梯度（Integrated Gradients）反向追踪每个词对转化率的贡献，输出可解释的改进建议。

## ③ 业务应用场景

业务问题： 某母婴品牌（电动吸奶器、奶瓶消毒器等 SKU）在 Amazon Sponsored Ads 投放中，每月新增 15-20 个 ASIN，手工撰写 Listing 文案耗时 40-50 小时/月，且关键词覆盖不足导致自然流量占比仅 28%，广告依赖度高。
AI 生成流程： 1. 输入商品属性：`{品类: "电动吸奶器", 材质: "医疗级硅胶+BPA-Free ABS", 功能: ["双边吸", "9档吸力", "USB充电", "静音<30dB"], 目标用户: "0-18月哺乳期妈妈", 市场: "US", 竞品ASIN: ["B0XXXXX", "B0YYYYY"]}` 2. 系统自动提取竞品关键词（reverse ASIN 工具）+ Amazon 搜索建议词库 3. 生成英文 Listing 草稿（3秒内），包含标题+5条Bullet+描述+后台搜索词 4. 合规检查：自动过滤 "clinically proven"、"FDA clea
量化产出： - 撰写时间：月均 50 小时 → 12 小时，节省 76% - 关键词覆盖率：人工 58% → AI 生成 96%（+38%） - 自然流量占比：28% → 42%（+14%） - Sponsored Ads ROAS：2.8 → 4.1（+46%） - 广告费节省：月 GMV 300 万，原 ROAS 2.8 需投 107 万广告费，新 ROAS 4.1 仅需 73 万，月省 34 万，年化 408 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

场景 A（批量优化）：年省人力 18 万 + 增收 192 万 = 210 万
场景 B（差评优化）：年增收 199 万
总计：409 万+，投入成本 ≤5 万，ROI 81:1

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（375 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/listing_ai_copywriting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Listing-AI-Copywriting.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
import re
import numpy as np
from collections import Counter
from datetime import datetime

# ============ 核心数据结构 ============

BANNED_WORDS = [
    "clinically proven", "fda cleared", "fda approved", "cure", "treat disease",
    "guaranteed", "#1 selling", "best seller", "medical device", "prescription"
]

AMAZON_CONSTRAINTS = {
    "title_max_length": 200,
    "bullet_count": 5,
    "bullet_min_length": 20,
    "bullet_max_length": 200,
    "description_max_length": 2000,
    "keywords_max_count": 250
}

# ============ 示例数据 ============

SAMPLE_PRODUCT = {
    "category": "Electric Breast Pump",
    "material": "Medical-grade silicone + BPA-Free ABS",
    "features": ["Dual-sided suction", "9-level adjustable", "USB rechargeable", "Silent <30dB"],
    "target_user": "Nursing mothers 0-18 months",
    "market": "US",
    "competitor_asins": ["B0XXXXX", "B0YYYYY"],
    "pain_points": ["Leakage", "Noise", "Cleaning difficulty"]
}

SAMPLE_GENERATED_LISTING = {
    "title": "Electric Breast Pump Dual Suction, 9-Level Adjustable, USB Rechargeable, Quiet <30dB, BPA-Free",
    "bullets": [
        "Dual-sided suction technology mimics natural nursing rhythm, reduces pumping time by 40%",
        "9-level adjustable suction strength adapts to comfort needs, prevents nipple soreness",
        "USB rechargeable with 3-hour battery life, portable for work/travel, includes carrying case",
        "Ultra-quiet operation at <30dB, discreet pumping at office/home without disturbance",
        "Medical-grade silicone + BPA-Free materials, FDA-registered facility, 2-year warranty"
    ],
    "description": "Our electric breast pump combines hospital-grade technology with everyday convenience.<br><br>"
                   "✓ Dual Expression: Simultaneous pumping reduces session time from 30 to 18 minutes<br>"
                   "✓ Smart Suction: 9 customizable levels let you find your comfort zone<br>"
                   "✓ All-Day Portable: USB charging, 3-hour runtime, compact design fits any bag<br>"
                   "✓ Whisper Quiet: <30dB operation means pumping anytime, anywhere<br>"
                   "✓ Safety First: Medical-grade silicone, BPA-Free, hypoallergenic<br><br>"
                   "Perfect for working moms, exclusive pumpers, and nursing support.",
    "backend_keywords": ["breast pump electric", "double electric pump", "portable pump", 
                        "quiet breast pump", "usb rechargeable pump", "nursing pump"]
}

# ============ 合规检查模块 ============

def compliance_check(listing: dict) -> dict:
    """检查 Listing 中的违规词汇"""
    all_text = (
        listing["title"] + " " +
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：商品属性（品类、材质、功能、目标用户、市场）、竞品 ASIN，可选痛点清单与认证信息。

**输出**：符合平台长度与字段约束的 Listing 草稿（标题、五条要点、描述、后台搜索词）与关键词覆盖情况，供运营审核上架。

## 执行步骤

1. 整理商品属性、目标用户与目标市场
2. 提取竞品关键词与平台搜索建议词
3. 按平台字数与条目约束生成标题、五点与描述
4. 做违禁词与功效宣称过滤
5. 输出后台搜索词并按覆盖度补齐

## 边界与不做

- 何时不用：商品属性不完整或缺少竞品词数据时生成质量下降，需先补齐输入
- 能力边界：只生成文案草稿与合规过滤建议，不代替平台合规审核，也不得生成医疗功效宣称

## 技能关联

- **前置**：Skill-Competitor-ASIN-Reverse-Analysis、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **延伸**：Skill-Amazon-A-B-Testing-Framework、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring
- **可组合**：Skill-Amazon-A-B-Testing-Framework、Skill-Competitor-ASIN-Reverse-Analysis、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Listing-AI-Copywriting

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Listing-AI-Copywriting`