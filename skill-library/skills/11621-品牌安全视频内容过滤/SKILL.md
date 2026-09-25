---
name: "p2s-brand-safety-video-content-filter"
title: "Skill-Brand-Safety-Video-Content-Filter — 品牌安全视频内容过滤"
description: "触发词：品牌安全审查、UGC 内容过滤、违规风险分级、宣称合规、审核队列分派。何时不用：要生成或改写内容用脚本生成类技能，本技能只对已有 UGC 与视频文案做风险分级与拦截。安全边界：不得删除或屏蔽用户合法表达，高风险内容必须转人工复核而非自动处罚，规则库须与法务口径一致并定期复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-088"
l3_business: "品牌反馈"
l3_all: "品牌反馈 / 宣称审查"
l1_l2_l3: "业务运营/品牌与增长/品牌反馈"
p2s_card_id: "Skill-Brand-Safety-Video-Content-Filter"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "把上百条用户视频快速筛一遍，明显越界的拦下，拿不准的推给人工审核。"
user_try: "试试：把这次挑战赛的 500 条 UGC 批量跑一遍品牌安全审查，按风险等级分组给我。"
whenToUse: "有 UGC 挑战赛或大量达人内容需要在短时限内完成品牌安全与宣称审查时用本技能；要产出新内容用脚本生成类技能，要分析评论情感用 VOC 类技能。"
workflow: "批量提取字幕文本 → 多层规则引擎分类风险等级 → 低风险内容自动通过 → 高风险与中风险进人工队列 → 复核结果回写规则库"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Brand-Safety-Video-Content-Filter — 品牌安全视频内容过滤

## ① 解决的问题

品牌负责人面临"UGC内容中出现品牌违规场景"——语义过滤将品牌违规内容识别率从60%提升至95%，年化规避合规风险10起

## ② 核心算法逻辑

论文：Toxicity Detection in UserGenerated Content via MultiLevel Rule and Classifier Fusion | 年份：2021

## ③ 业务应用场景

场景：婴儿辅食品牌 UGC 内容合规批量审查
- 业务问题：品牌 TikTok 挑战赛收集了 500 条 UGC 视频，需要在 24 小时内完成品牌安全审查，人工审查每条 5 分钟需 41 小时，不可行 - 数据要求：UGC 视频文字描述/字幕、品牌安全风险词库 - 执行方案： - 批量提取 UGC 视频字幕文本（Whisper ASR） - 多层规则引擎自动分类（危险/高风险/中风险/低风险/通过） - 自动通过的视频直接发布（约 70%） - 高风险和中风险推送人工审核队列（约 15%） - 量化产出：审查时间从 41 小时 → 3 小时（自动过滤 70% + 人工审核 30%） - 业务价值：避免一次品牌安全事故（潜在罚款 + 下架
三轨验证 | 成本轨：月均成本1200元（AI视频生成工具订阅800元+人工审核4小时/月×100元/小时=400元），相比传统真人主播月均8000元，降低85% | 合规轨：符合《网络直播内容管理规定》和《母婴产品广告管理办法》，需在视频开头标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：自动过滤 70% UGC，人工审核时间减少 80%，避免品牌安全事故（年化保护价值 10-50 万元）
实施难度：⭐⭐☆☆☆（规则引擎即可实现 80% 场景，开发周期 1 天）
优先级：⭐⭐⭐⭐☆（有 UGC 挑战赛/合作 KOL 的品牌必备，合规风险不可忽视）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（136 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from dataclasses import dataclass, field

@dataclass
class BrandSafetyRule:
    """品牌安全规则"""
    rule_id: str
    risk_level: int              # 1-4，4 最危险
    pattern: str                 # 正则表达式
    category: str                # 违规类别
    action: str                  # BLOCK/REVIEW/FLAG

# 母婴品牌安全规则库
BABY_BRAND_SAFETY_RULES = [
    BrandSafetyRule("R001", 4, r"\b(suicide|self.harm|violence|abuse)\b", "危险内容", "BLOCK"),
    BrandSafetyRule("R002", 4, r"\b(child\s+abuse|exploitation)\b", "儿童危害", "BLOCK"),
    BrandSafetyRule("R003", 3, r"\b(BPA.*(poison|toxic|cancer))\b", "安全诋毁", "BLOCK"),
    BrandSafetyRule("R004", 3, r"\b(choking\s+hazard|recall|toxic|poisoning)\b", "产品危害指控", "REVIEW"),
    BrandSafetyRule("R005", 2, r"\b(cure[sd]?|treats|FDA[\s-]approved|clinically\s+proven)\b", "医疗声明违规", "REVIEW"),
    BrandSafetyRule("R006", 2, r"\b(100%\s+safe|safest\s+in\s+the\s+world|guaranteed)\b", "夸大安全声明", "REVIEW"),
    BrandSafetyRule("R007", 2, r"\b(better\s+than\s+[A-Z][a-z]+|[A-Z][a-z]+\s+is\s+(bad|terrible|toxic))\b", "竞品攻击", "REVIEW"),
    BrandSafetyRule("R008", 1, r"\b(overpriced|scam|rip.?off)\b", "价格/诚信攻击", "FLAG"),
    BrandSafetyRule("R009", 1, r"\b(misleading|fake|counterfeit)\b", "虚假声明", "FLAG"),
    BrandSafetyRule("R010", 1, r"\b(political|election|controversial)\b", "政治敏感", "FLAG"),
]

def scan_content(text: str, rules: List[BrandSafetyRule]) -> List[Dict]:
    """扫描文本内容，返回触发的规则列表"""
    triggered = []
    text_lower = text.lower()
    
    for rule in rules:
        matches = re.findall(rule.pattern, text_lower, re.IGNORECASE)
        if matches:
            triggered.append({
                "rule_id": rule.rule_id,
                "risk_level": rule.risk_level,
                "category": rule.category,
                "action": rule.action,
                "matched_text": matches[:3]  # 最多显示3个匹配
            })
    
    return triggered

def classify_content(text: str, rules: List[BrandSafetyRule]) -> Dict:
    """综合分类内容风险"""
    triggered = scan_content(text, rules)
    
    if not triggered:
        return {
            "status": "PASS",
            "max_risk_level": 0,
            "primary_action": "APPROVE",
            "triggered_rules": [],
            "review_priority": "NONE"
        }
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.08758，但该号在 arXiv 上是《Documenting Large Webtext Corpora: A Case Study on the Colossal Clean Crawled Corpus》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Toxicity Detection in UserGenerated Content via MultiLevel Rule and Classifier Fusion》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：UGC 视频的文字描述或字幕文本（可用 ASR 转写）、品牌安全风险词库与规则库（按危害程度配置等级与处置动作）。

**输出**：每条内容的品牌安全风险分级结果（危险、高风险、中风险、低风险、通过）与处置动作（拦截、转人工、标记），以及自动通过清单；卡页口径审查时间从 41 小时降到 3 小时、自动过滤约 70% 内容。

## 执行步骤

1. 批量提取 UGC 视频的字幕与描述文本。
2. 用多层规则引擎把内容分为危险、高风险、中风险、低风险与通过。
3. 把低风险内容自动通过并送入发布流程。
4. 把高风险与中风险内容推入人工审核队列。
5. 把人工复核结论回写规则库，持续降低误判。

## 边界与不做

- 只有画面视频、没有字幕或文字描述时纯规则引擎覆盖不到，需先补 ASR 或多模态识别。
- 能力边界：规则引擎覆盖常见违规场景，边界模糊的宣称仍需人工判断；卡页口径自动过滤约 70%、其余约 30% 需人工，风险规避价值为估算。
- 合规红线：不得删除或屏蔽用户合法表达，高风险判定必须转人工复核而非自动处罚，规则库须与法务口径一致。

## 技能关联

- **前置**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Cross-Platform-Video-Repurposing.html、Skill-Cross-Platform-Video-Repurposing、Skill-Live-Stream-Highlight-Extraction.html、Skill-Live-Stream-Highlight-Extraction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC、Skill-品牌合规卫士
- **延伸**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Cross-Platform-Video-Repurposing.html、Skill-Cross-Platform-Video-Repurposing、Skill-Live-Stream-Highlight-Extraction.html、Skill-Live-Stream-Highlight-Extraction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Brand-Safety-Video-Content-Filter

---

> 分类：业务运营/品牌与增长/品牌反馈　·　技术族：20-AI视频生成　·　源卡：`Skill-Brand-Safety-Video-Content-Filter`