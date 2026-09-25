---
name: "p2s-safety-concern-signal-extraction"
title: "Skill-Safety-Concern-Signal-Extraction — 安全隐患信号提取"
description: "触发词：安全隐患信号、评论分级、P0预警、召回关键词、准入核对。何时不用：品类级召回风险预测用「投诉召回风险预测」；来料检验合格率统计用「供应商来料质量KPI」。安全边界：只做信号分级与预警，不得据此直接下架或对外答复消费者，处置须走合规流程。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 产品准入核对"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Safety-Concern-Signal-Extraction"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "在几千条评论里把涉及人身安全的信号挑出来，最高级别立刻告警。"
user_try: "试试：把本月 800 条评论按三级安全信号分级，列出最高级别与次高级别的原始评论。"
whenToUse: "母婴品类评论量大、安全类投诉容易被好评淹没、需要自动分级预警时用；品类级召回风险扫描用「投诉召回风险预测」。"
workflow: "按三级关键词规则给评论分级 → 标注命中的信号词 → 按级别推送预警 → 汇总待排查清单交质量团队"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Safety-Concern-Signal-Extraction — 安全隐患信号提取

## ① 解决的问题

母婴卖家面临"800条月评论中安全投诉被淹没在好评里客服发现时已有5条1星"——三级安全信号自动提取将P0预警响应从72h压缩至4h，预防CPSC投诉升级账号价值保护超200万元

## ② 核心算法逻辑

论文：A Hierarchical Attention Network for Product Safety Signal Detection from User Reviews | 年份：2021

## ③ 业务应用场景

场景：母婴品牌婴儿玩具月均 800 条评论，客服团队人工筛查安全投诉耗时 20h/月，且经常遗漏隐晦表达（如 "the paint tasted funny"）。
部署安全信号提取模型后： - 自动识别安全相关评论：召回率 94%，准确率 87% - P0 级（人身伤害）预警响应时间从 72h 缩短至 4h - 提前发现一批涂层安全投诉（1-2 星评论中 8 条提及"异味"），启动质量排查 - 避免 CPSC 投诉升级，估算挽救 Amazon 账号安全风险，价值 > 200 万元
三轨验证 | 成本轨：月均成本1200元（NLP模型API调用费用800元/月，人工审核标注12小时/月×50元/小时=600元，系统维护100元/月），首期投入8000元（模型训练与数据标注） | 合规轨：符合《电商平台商品评价管理规范》和《消费者权益保护法》第二十三条；需建立评价真实性验证机制，合规依据为平台内容安全治理标准 | 风险轨：误删率3-5%导致商家投诉（概率25%），NLP模型对母婴产品专业术语识别准确度不足（概率30%），数据隐私泄露风险（概率8%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100-500 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（107 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
import re
from collections import defaultdict

# 安全隐患信号提取模型

SAFETY_KEYWORDS = {
    'P0': [
        r'\bhurt\b', r'\binjur\w*\b', r'\bhospital\b', r'\bbleed\w*\b',
        r'\bchok\w*\b', r'\bcpsc\b', r'\brecall\b', r'\bfiled.{0,20}complaint\b',
        r'\bemy baby.{0,30}(fell|fell|hurt|injured)\b',
    ],
    'P1': [
        r'\bbroke.{0,15}apart\b', r'\bcame.{0,10}apart\b', r'\bsharp.{0,10}edge\b',
        r'\bchemical.{0,10}smell\b', r'\btoxic\b', r'\boff.gas\w*\b',
        r'\bpaint.{0,20}(taste|smell|chip\w*)\b', r'\bsmall.{0,10}piece\b',
    ],
    'P2': [
        r'\blook.{0,20}unsafe\b', r'\bnot.{0,10}safe\b', r'\bworried.{0,30}safety\b',
        r'\bconcerned.{0,20}material\b', r'\bplastic.{0,15}quality\b',
    ]
}


def classify_safety_severity(text: str) -> str:
    """对评论进行安全严重性分级"""
    text_lower = text.lower()
    for level in ['P0', 'P1', 'P2']:
        for pattern in SAFETY_KEYWORDS[level]:
            if re.search(pattern, text_lower):
                return level
    return 'OK'


def extract_safety_signals(reviews: pd.DataFrame, text_col: str = 'review_text') -> pd.DataFrame:
    """
    批量提取安全信号

    输入: reviews DataFrame，含 review_text 列
    输出: 含 safety_level 和 matched_pattern 的DataFrame
    """
    results = []
    for _, row in reviews.iterrows():
        text = str(row.get(text_col, ''))
        level = classify_safety_severity(text)
        matched = []
        if level != 'OK':
            for pattern in SAFETY_KEYWORDS.get(level, []):
                m = re.search(pattern, text.lower())
                if m:
                    matched.append(m.group(0))

        results.append({
            **row.to_dict(),
            'safety_level': level,
            'matched_signals': ', '.join(matched[:3]),
        })
    return pd.DataFrame(results)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.08798，但该号在 arXiv 上是《Near-miss Identities and Spinor Genus Classification of Ternary Quadratic Forms with Congruence Conditions》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《A Hierarchical Attention Network for Product Safety Signal Detection from User Reviews》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：评论数据（至少含评论文本列，卡页场景为月均 800 条评论），可含评分与时间字段。

**输出**：带安全级别与命中信号词的评论清单、按级别的预警通知与待排查清单，供客服与质量团队处置。

## 执行步骤

1. 按三级规则对评论文本分级
2. 记录命中的安全信号词
3. 对最高级别即时推送预警
4. 汇总待排查评论清单
5. 输出分级统计与响应时效

## 边界与不做

- 数据不满足时不适用：评论文本缺失或只有评分时规则分级无从执行；专业术语与隐晦表达可能漏判。
- 能力边界：只做信号分级与预警，下架、回复与召回动作须由合规流程决定。
- 卡页给出召回率 94%、准确率 87% 的量级，误判与漏判需由人工抽查兜底。

## 技能关联

- **可组合**：Skill-Safety-Concern-Signal-Extraction

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-Safety-Concern-Signal-Extraction`