---
name: "p2s-search-compliance-guard"
title: "搜索词合规预扫描 — Amazon TOS + FDA 双轨违禁词实时过滤"
description: "触发词：搜索词合规、违禁词、健康声明、双轨过滤、关键词预审、脚本预审。何时不用：要按平台条款改写整段文案时用「Amazon ToS 合规护栏」，要检测订阅页暗模式时用「Nudge 架构伦理」。安全边界：词库须经法律团队审定，过滤过广会误伤合法关键词，且漏报风险高于误报。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查 / Listing优化"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Search-Compliance-Guard"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "关键词和视频脚本上架前先过一遍双轨违禁词，别让改善消化、增强免疫力这类话把 Listing 送下架。"
user_try: "试试：把这批 title、bullets、后台关键词和 50 条视频脚本扫一遍 Amazon ToS 与 FDA 双轨违禁词，按风险排序。"
whenToUse: "上架前或内容发布前要批量预审关键词与脚本是否含违禁宣称时用；要按平台条款改写整段文案时用「Amazon ToS 合规护栏」；要审订阅页 UX 伦理时用「Nudge 架构伦理」。"
workflow: "收集待审关键词或脚本文本 → 用 Amazon ToS 违禁词库与 FDA 健康声明词库双轨匹配 → 给每个关键词打合规评分与风险类别 → 高亮高风险句子并给出修改建议 → 输出可发布的关键词与脚本清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索词合规预扫描 — Amazon TOS + FDA 双轨违禁词实时过滤

## ① 解决的问题

运营面临"关键词上架后才发现含违禁宣称导致Listing被下架"——上架前合规预扫描将违禁词漏报率从22%降至3%，年化避免账号受限保护广告预算50-120万元

## ② 核心算法逻辑

核心思想：母婴类产品关键词存在两类合规风险：Amazon ToS 违禁词（刷单词汇、竞品品牌词滥用、虚假宣称）和 FDA 监管词汇（医疗声明、疗效宣称）。本 Skill 构建双轨合规扫描器：Track 1 使用 AhoCorasick 多模式匹配算法进行字符串层面的高速扫描；Track 2 使用语义嵌入（embedding 相似度）捕捉未被字典收录的同义变体（如"帮助消化"≈"改善肠胃"）。

## ③ 业务应用场景

场景1：新品 Listing 关键词合规预审 - 业务问题：运营团队在优化婴儿益生菌产品 Listing 时，habitually 写入"改善婴儿消化问题""增强免疫力"等词，这些词属于 FDA structure/function claim，未经申报即在 listing 中使用会触发 warning letter 甚至产品下架 - 数据要求：待审核关键词列表（title、bullets、backend keywords），Amazon ToS 违禁词库（约 500 条），FDA 禁止健康声明词库（约 300 条） - 预期产出：每个关键词的合规评分（0-1）、风险类别（ToS/FDA/Cl
场景2：TikTok Shop 母婴内容关键词批量预审 - 业务问题：内容团队每周产出 50+ 视频脚本，部分脚本含有 TikTok 平台禁止宣传的"医疗效果"词汇（如"治疗湿疹""消除肠绞痛"），审核不及时导致内容被限流 - 数据要求：视频脚本文本，TikTok 广告违禁词库，母婴品类敏感词扩展库 - 预期产出：脚本级别合规报告，高风险句子高亮标注，修改建议 - 业务价值：内容合规率从 70% 提升至 95%+，减少因限流损失的自然流量价值约 15-30 万元/年
**三轨验证**： - 成本：违禁词库维护成本（0.5 人/月），系统开发 2-3 人周，后续自动化维护 - 合规：违禁词库本身需由法律团队审核认可，避免过滤范围过广误伤合法关键词 - 风险：漏报（false negative）比误报（false positive）风险更高，建议召回率设置优先于精确率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免 Listing 下架损失 50-100 万元/年（下架 1 个 SKU 的平均损失周期 2-4 周）
实施难度：⭐⭐⭐☆☆（词库维护是核心，算法实现标准，关键是与法律团队协作的流程）
优先级：⭐⭐⭐⭐⭐
评估依据：Amazon 合规风险是跨境母婴品类的生死线，一次违规下架的损失远超建设合规扫描系统的成本，防御价值极高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（155 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
搜索词合规预扫描 — Amazon TOS + FDA 双轨违禁词过滤
"""
import re
from dataclasses import dataclass
from typing import List, Dict, Tuple
import numpy as np

# 模拟违禁词库（生产环境从数据库加载）
TOS_BANNED_PATTERNS = [
    "competitor brand hijack", "fake review", "guaranteed ranking",
    "click manipulation", "review swap"
]

FDA_BANNED_HEALTH_CLAIMS = [
    "treat", "cure", "prevent disease", "diagnose", "improve immunity",
    "enhance immune", "fix digestive", "improve digestion problem",
    "treat eczema", "eliminate colic", "boost brain development"
]

AMAZON_TOS_KEYWORDS = [
    "guaranteed #1", "best seller guaranteed", "review manipulation",
    "keyword stuffing example"
]

# 母婴场景扩展违禁词（中英文）
BABY_SENSITIVE_TERMS = {
    "zh": ["治疗", "消除疾病", "增强免疫力", "治愈", "预防疾病", "医疗级"],
    "en": ["treats disease", "cures", "prevents illness", "medical grade treatment",
           "clinically proven to treat", "FDA approved to cure"]
}

@dataclass
class ComplianceResult:
    """合规扫描结果"""
    keyword: str
    risk_score: float      # 0=安全, 1=高风险
    risk_type: str         # "TOS" / "FDA" / "BABY_SENSITIVE" / "CLEAN"
    matched_pattern: str
    recommendation: str

class AhoCorasick:
    """简化版 Aho-Corasick 多模式匹配（演示用，生产环境用 pyahocorasick 库）"""
    
    def __init__(self, patterns: List[str]):
        self.patterns = [p.lower() for p in patterns]
    
    def search(self, text: str) -> List[Tuple[str, int]]:
        """返回匹配到的 (pattern, position) 列表"""
        text_lower = text.lower()
        matches = []
        for pattern in self.patterns:
            pos = 0
            while True:
                idx = text_lower.find(pattern, pos)
                if idx == -1:
                    break
                matches.append((pattern, idx))
                pos = idx + 1
        return matches
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待审核关键词列表（title、bullets、后台关键词）或视频脚本文本；Amazon ToS 违禁词库（约 500 条）、FDA 禁止健康声明词库（约 300 条）、母婴品类敏感词扩展库；粒度：单个关键词或单条脚本。

**输出**：每个关键词或脚本的合规评分（0-1）、风险类别（ToS / FDA 等）、高风险句子高亮与修改建议构成的可发布清单；目标为违禁词漏报率由 22% 降至 3%、内容合规率由 70% 提升至 95% 以上，供运营与内容团队发布前使用。

## 执行步骤

1. 收集关键词或脚本文本
2. 用 ToS 与 FDA 词库双轨匹配
3. 给每个词条打合规评分与风险类别
4. 高亮高风险句并给修改建议
5. 输出可发布清单与整改项

## 边界与不做

- 数据不满足时不用：词库未经法律团队审核、或缺母婴品类敏感词扩展时，过滤会漏项或误伤合法关键词。
- 能力边界：只做词级与句级匹配、评分与改写建议，不代替平台审核与法律判断；漏报风险高于误报，召回率优先于精确率。
- 维护边界：违禁词库需持续维护（卡页给出约 0.5 人/月）并与法律团队协作更新，否则新规与新品类的违规词会漏。

## 技能关联

- **前置**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Search-Signal-Realtime-Pipeline.html、Skill-Search-Signal-Realtime-Pipeline
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Search-Signal-Realtime-Pipeline.html、Skill-Search-Signal-Realtime-Pipeline
- **可组合**：Skill-Search-Signal-Realtime-Pipeline.html、Skill-Search-Signal-Realtime-Pipeline、Skill-Search-Compliance-Guard

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Compliance-Guard`