---
name: "p2s-multi-market-ad-copy-compliance"
title: "多市场广告文案合规矩阵 — FDA/FTC/ASA 差异自动对比"
description: "触发词：广告文案合规、多市场差异、FDA/FTC/ASA、逐句标注、证据清单、本地化改写。何时不用：只按 Amazon 平台条款扫违禁词时用「Amazon ToS 合规护栏」，要审 AI 生成素材宣称时用「AIGC 内容合规审查」。安全边界：改写建议不构成法律意见，投放前口径须由当地法规顾问确认。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查 / 市场语境审查"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Multi-Market-Ad-Copy-Compliance"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "同一句 99.9% 杀菌文案，美国能说、英国要标测试方法、欧盟要引标准，一站给出六地差异和改写版。"
user_try: "试试：这句 99.9% bacteria-free tested 要投美英欧澳，给我各国合规差异、需要补的证据和改写版本。"
whenToUse: "同一广告文案要多市场投放、需要逐市场核对宣称口径与证据要求时用；只按 Amazon 平台条款扫违禁词时用「Amazon ToS 合规护栏」；要审 AI 生成素材宣称时用「AIGC 内容合规审查」。"
workflow: "收集原始文案、目标市场清单与测试报告摘要 → 按 FDA/FTC/ASA 等规则库逐句匹配声明类型 → 生成多市场合规矩阵并标出差异 → 列出各市场所需补充证据 → 输出分市场改写版与最低改动通用版"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多市场广告文案合规矩阵 — FDA/FTC/ASA 差异自动对比

## ① 解决的问题

品牌运营面临"同一广告文案在美/欧/澳发布时违规规定不一致"——多市场广告文案合规矩阵将跨境文案违规漏报率从28%降至4%，年化避免广告下架损失30-60万元

## ② 核心算法逻辑

同一母婴产品广告文案在不同市场面临截然不同的监管要求：美国 FTC 要求实质性证据（"competent and reliable scientific evidence"）、FDA 规范健康声明（21 CFR 101）、英国 ASA/CAP 遵循 BCAP Code、欧盟受 UCPs Directive 和各国广告标准委员会约束。

## ③ 业务应用场景

场景1：婴儿湿巾同款文案多市场上架 - 业务问题："99.9% bacteria-free tested" 在美国可用，但英国 ASA 要求明确测试方法来源，EU 要求引用具体标准 - 数据要求：原始广告文案（EN/中文）+ 目标市场列表 + 现有测试报告摘要 - 预期产出：6 大市场合规矩阵表 + 每市场修改版文案 + 所需额外证据清单 - 业务价值：减少本地化合规咨询费约年化 12 万元，上架周期缩短 5–7 天
场景2：TikTok 广告投放 UK/US 双市场审核 - 业务问题：TikTok UK 遵循 ASA BCAP Code，对婴儿食品广告有专项限制；同一视频在两国合规要求不同 - 数据要求：视频脚本 + 声音文字稿 + 产品类别（婴儿食品/护理/玩具） - 预期产出：逐句合规标注 + UK/US 差异对比 + 最低改动通用版建议
**三轨验证**：成本（单次咨询费 $3K→自动化 $0）/ 合规（六市场规则库覆盖）/ 风险（ASA/FTC 投诉 → 关联封号）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：替代单市场合规咨询费 $1,500–$5,000/次，4 市场同步审查年化节省约 30 万元；FTC 警告函平均处理成本 $20K+
实施难度：⭐⭐⭐⭐☆（法规库需定期人工维护 + 多语言文案处理）
优先级：⭐⭐⭐⭐⭐（多市场同步上架已成标准操作，合规不同步是封号高发根因）
评估依据：母婴品类在 FTC/ASA 高频投诉类目排名前三，同一文案多市场风险敞口叠加效应显著；自动化矩阵是规模化扩张的必要基础设施。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：invalid syntax）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import Optional
import re

# 声明类型枚举
CLAIM_TYPES = ["health", "safety", "efficacy", "comparative", "environmental"]

# 多市场法规规则库（简化）
MARKET_RULES: dict[str, dict] = {
    "US": {
        "regulator": "FTC / FDA",
        "prohibited": ["miracle", "100% cure", "eliminates all bacteria"],
        "conditional": {
            "clinically proven": "需提供同行评审研究",
            "doctor recommended": "需真实医生背书文件",
            "99.9% bacteria-free": "需明确测试标准（如 ISO 22196）",
        },
        "mandatory_disclosure": ["results may vary", "individual results"],
        "baby_food_extra": ["FDA 21 CFR 101.14 健康声明需预授权"],
    },
    "UK": {
        "regulator": "ASA / CAP",
        "prohibited": ["miracle", "guaranteed results", "completely safe"],
        "conditional": {
            "clinically proven": "需英国或欧盟认可临床证据",
            "99.9% bacteria-free": "需引用具体测试方法来源",
            "natural": "天然声明需有明确科学依据",
        },
        "mandatory_disclosure": ["ad", "advertisement", "sponsored"],
        "baby_food_extra": ["BCAP Code Section 13 婴儿食品专项限制"],
    },
    "EU": {
        "regulator": "各成员国广告标准局 + UCPs Directive",
        "prohibited": ["miracle", "cures", "eliminates disease"],
        "conditional": {
            "organic": "需 EU Organic Regulation (EC) 834/2007 认证",
            "clinically proven": "需 EFSA 认可声明",
        },
        "mandatory_disclosure": ["AI生成内容需标注 (DSA Article 26)"],
        "baby_food_extra": ["Directive 2006/52/EC 婴儿食品成分限制"],
    },
    "AU": {
        "regulator": "ACCC / Ad Standards",
        "prohibited": ["miracle cure", "guaranteed"],
        "conditional": {
            "TGA listed": "需 TGA 登记号",
        },
        "mandatory_disclosure": [],
        "baby_food_extra": [],
    },
}


@dataclass
class ClaimAnalysis:
    claim_text: str
    claim_type: str


@dataclass
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：原始广告文案（EN 或中文）、目标市场列表、现有测试报告摘要；视频场景另需视频脚本、声音文字稿与产品类别（婴儿食品/护理/玩具）；粒度：单条文案或脚本 × 单市场。

**输出**：多市场合规矩阵表（各市场禁用声明、条件性声明、强制披露要求）、每市场修改版文案、所需额外证据清单与逐句合规标注（含 UK/US 差异对比与最低改动通用版建议）；供品牌与投放团队按市场改稿。

## 执行步骤

1. 收集文案、目标市场与测试报告摘要
2. 按各市场规则库逐句匹配声明类型
3. 生成多市场合规矩阵并标注差异
4. 列出各市场所需补充证据
5. 输出分市场改写与通用版建议

## 边界与不做

- 数据不满足时不用：缺测试报告摘要时无法判断条件性声明是否成立；法规库未按市场定期维护时会漏新规。
- 能力边界：只做声明识别、差异对比与文案改写建议，不构成法律意见；投放前最终口径须由当地法规顾问确认。
- 风险边界：同一文案在多市场的风险叠加放大，漏报可能引发 FTC/ASA 投诉并连带账号处罚，须优先保证召回率。

## 技能关联

- **可组合**：Skill-Multi-Market-Ad-Copy-Compliance

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：21-合规决策　·　源卡：`Skill-Multi-Market-Ad-Copy-Compliance`