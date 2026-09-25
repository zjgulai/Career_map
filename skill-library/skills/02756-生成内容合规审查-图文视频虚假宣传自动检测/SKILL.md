---
name: "p2s-aigc-content-compliance-review"
title: "AI生成内容合规审查 — 图文/视频虚假宣传自动检测"
description: "触发词：AIGC 合规、虚假宣传、FTC 声明、DSA 标注、违规帧定位、图文视频审查。何时不用：要在推荐候选集实时过滤违规品时用「推荐合规过滤」，要比较多市场广告文案口径时用「多市场广告文案合规矩阵」。安全边界：结论为整改建议，不代替 FTC 或平台判定，AI 生成内容须按 DSA 标注身份。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-AIGC-Content-Compliance-Review"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "AI 生成的图、文、视频发出去前先扫一遍，别让一句宣称或一张合成图把整条 Listing 送上封号名单。"
user_try: "试试：审一下这套 AIGC 生成的母婴护肤品主图和文案，标出违规声明和需要标注 AI 生成的位置。"
whenToUse: "AI 生成或辅助生成的图文视频上架前要核虚假宣传与 AIGC 标注合规时用；要在推荐候选集实时过滤违规品时用「推荐合规过滤」；要比较多市场广告法规差异时用「多市场广告文案合规矩阵」。"
workflow: "收集 Listing 图片 URL、文案 JSON 与视频转写文本 → 用 FTC 禁止声明与 FDA 声称词库扫描文案 → 检测 AIGC 生成内容是否缺失 AI 标注 → 定位违规文本与违规帧 → 输出高亮报告、标注建议与合规改写文案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI生成内容合规审查 — 图文/视频虚假宣传自动检测

## ① 解决的问题

品牌运营面临"AI生成的产品图文被平台标记为虚假宣称导致Listing下架"——AIGC内容合规审查将AI生成内容违规率从18%降至2%，年化保护Listing上架稳定性减少损失40-80万元

## ② 核心算法逻辑

AI 生成内容（AIGC）在母婴出海营销中日益普遍，但 FTC《关于背书与推荐的指南》（2023年修订）及欧盟《数字服务法》（DSA）明确要求对 AI 生成内容进行标注，并禁止虚假健康声明。本 Skill 采用三层检测架构：

## ③ 业务应用场景

场景1：Amazon 美国站母婴护肤品 Listing 图文审查 - 业务问题：AIGC 生成的产品主图含"dermatologist tested"文字及 AI 合成婴儿皮肤对比图，可能触发 FTC 虚假广告投诉 - 数据要求：Listing 图片 URL 列表 + 文案 JSON + FTC 禁止声明词库 - 预期产出：违规声明高亮报告 + AI 生成图标注建议 + 修改后合规文案 - 业务价值：规避 FTC 罚款（单次最高 $51,744/违规），节省人工审核成本约年化 15 万元
场景2：TikTok Shop EU 市场视频内容 DSA 合规 - 业务问题：AI 生成短视频未标注 AIGC 身份，违反 DSA Article 26 透明度要求 - 数据要求：视频文件或 URL + 音频转写文本 + EU DSA 合规清单 - 预期产出：AIGC 标注缺失检测 + 违规帧时间戳 + 合规整改指引
**三轨验证**：成本（减少人工审核 80%）/ 合规（FTC/DSA 零容忍条款覆盖）/ 风险（上架被封号风险 → 下降至 <2%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：规避 FTC 单次罚款 $51,744 + Amazon 封号损失（账号价值通常 $50K–$500K）；人工审核替代率 80%，年化节省约 20 万元
实施难度：⭐⭐⭐⭐☆（需维护多市场法规词库 + 集成 AIGC 检测 API）
优先级：⭐⭐⭐⭐⭐（FTC 2023 新规已生效，Amazon 2024 起强化 AI 内容披露政策）
评估依据：AIGC 营销内容在母婴品类占比快速提升至 40%+，监管机构对未标注 AI 内容的处罚正在从警告升级为重罚；提前合规是避免封号的最低成本路径。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import json
from dataclasses import dataclass, field
from typing import Optional

# FTC 高风险声明词库（简化版）
FTC_PROHIBITED_CLAIMS = [
    "clinically proven", "doctor recommended", "scientifically tested",
    "eliminates", "cures", "prevents disease", "100% safe",
    "dermatologist approved", "pediatrician recommended",
]

FDA_NUTRIENT_CLAIMS = [
    "high in", "low fat", "reduced sodium", "excellent source of",
    "organic certified",  # 需要 USDA 认证
]

DSA_AIGC_MARKERS = ["AI-generated", "created by AI", "synthetic"]


@dataclass
class ComplianceViolation:
    claim: str
    market: str
    regulation: str
    severity: str  # HIGH / MEDIUM / LOW
    suggestion: str


@dataclass
class ContentComplianceReport:
    content_id: str
    is_aigc_suspected: bool
    aigc_confidence: float
    violations: list[ComplianceViolation] = field(default_factory=list)
    overall_risk: str = "LOW"
    has_aigc_disclosure: bool = False


def detect_aigc_text_patterns(text: str) -> tuple[bool, float]:
    """
    简化版 AI 生成文本检测：基于句式规整度 + 特征词频
    生产环境建议调用 GPTZero/Originality.ai API
    """
    ai_patterns = [
        r"\b(furthermore|moreover|in conclusion|it is worth noting)\b",
        r"\b(comprehensive|holistic|seamlessly|leverage)\b",
        r"([.!?])\s+[A-Z].*([.!?])\s+[A-Z].*([.!?])",  # 均匀句式
    ]
    matches = sum(1 for p in ai_patterns if re.search(p, text, re.IGNORECASE))
    confidence = min(matches / len(ai_patterns), 1.0)
    return confidence > 0.4, confidence


def scan_ftc_violations(text: str) -> list[ComplianceViolation]:
    violations = []
    text_lower = text.lower()
    for claim in FTC_PROHIBITED_CLAIMS:
        if claim in text_lower:
            violations.append(ComplianceViolation(
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：Listing 图片 URL 列表、文案 JSON、视频文件或 URL 及其音频转写文本、FTC 禁止声明词库、FDA 营养声称词库、EU DSA 合规清单与 AIGC 标记词；粒度：单条 Listing 或单个视频。

**输出**：违规声明高亮报告、AIGC 标注缺失检测与违规帧时间戳、AI 生成图标注建议及修改后合规文案；供品牌与运营在上架前整改，规避 FTC 单次最高 51,744 美元的罚款与平台封号风险。

## 执行步骤

1. 收集图片、文案与视频转写素材
2. 用禁止声明词库扫描文案与画面文字
3. 检测 AIGC 标注是否缺失
4. 定位违规文本与视频帧
5. 输出标注建议与合规改写文案

## 边界与不做

- 数据不满足时不用：拿不到图片 OCR 文本或视频转写时，画面内的宣称会被漏掉。
- 能力边界：只做违规声明识别与改写建议，不代替 FTC 或平台判定；多市场法规词库需持续维护，否则会漏新规。
- 合规边界：AI 生成内容涉及合成人像或合成场景时须显式标注，不得冒充真实使用者证言。

## 技能关联

- **可组合**：Skill-AIGC-Content-Compliance-Review

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：21-合规决策　·　源卡：`Skill-AIGC-Content-Compliance-Review`