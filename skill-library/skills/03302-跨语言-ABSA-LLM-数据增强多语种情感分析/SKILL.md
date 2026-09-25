---
name: "p2s-laca-crosslingual-absa"
title: "LACA 跨语言 ABSA - LLM 数据增强多语种情感分析"
description: "触发词：跨语言 ABSA、多语种评论、伪标签增强、客服工单分类、低资源语种。何时不用：能直接用英文语料分析或只需机翻粗看时用「AGRS 属性引导评论摘要」；要处理的是评分口径而非方面抽取，用「跨文化 VOC 对齐」。安全边界：LLM 合成句子只能用于训练、不得当作真实用户反馈引用；客服日志须按《个人信息保护法》与跨境数据合规要求脱敏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 客诉聚类"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-LACA-CrossLingual-ABSA"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "为德法西日这些没有标注数据的市场搭一套方面情感模型，不再依赖机翻，让多语种工单和评论被正确归类。"
user_try: "试试：用英文标注集帮我搭一套德/法/西的方面情感模型，把这批被机翻错分的客服工单重新归类。"
whenToUse: "目标市场没有任何标注数据、且机翻会破坏方面词对齐时用本技能；若已有充足的目标语标注，直接训目标语模型即可；若问题是评分口径差异，用「跨文化 VOC 对齐」。"
workflow: "用英文标注模型对目标语言文本做零样本预测，得到伪标签 → 把伪标签反向喂给 LLM，生成与该标签匹配的干净目标语言句子 → 合并英文真标注与 LLM 生成数据，重训跨语言模型 → 按统一 Aspect schema 输出各市场方面情感并做跨市场对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LACA 跨语言 ABSA - LLM 数据增强多语种情感分析

## ① 解决的问题

Momcozy 在德/法/西市场每月接收 5000+ 母语客服工单(如德语 "Die Verpackung ist sehr schwer zu öffnen"). 传统做法用 Google Translate 翻译成英文后跑英文 ABSA,翻译会丢失 aspect 对齐("Verpackung" → "package" 时 BIO 边界错位 30%+). 跨境品牌每月因机翻错误导致工单

## ② 核心算法逻辑

跨语言 ABSA 痛点:目标语言(德/法/西/日)无标注数据,翻译方法会丢失 aspect 词对齐. LACA 用逆向去噪思路:① 用英文标注模型对目标语言文本做零样本预测 → ② 把伪标签反向喂给 LLM,让 LLM 生成与该标签匹配的干净目标语言句子 → ③ 合并英文真标注 + LLM 生成伪标注重训模型. 绕过 MT 对齐错误,跨语言 ABSA SOTA.

## ③ 业务应用场景

- 业务问题:Momcozy 在德/法/西市场每月接收 5000+ 母语客服工单(如德语 "Die Verpackung ist sehr schwer zu öffnen"). 传统做法用 Google Translate 翻译成英文后跑英文 ABSA,翻译会丢失 aspect 对齐("Verpackung" → "package" 时 BIO 边界错位 30%+). 跨境品牌每月因机翻错误导致工单错分 1500+ 条 - 数据要求:英文 ABSA 标注数据(SemEval-2016 或自建母婴标注集 2000-5000 条) + 各市场无标注客服日志 - LACA 配置: - 骨干 XLM
- 业务问题:同一款奶粉在 Amazon.de / .fr / .es / .co.jp 销售,各市场 Review 用不同语言. 需要统一 Aspect Schema(taste/safety/packaging/price_value/age_suitability/brand_trust)做跨市场情感分布对比. 现在各市场分别人工标注,标准不统一,跨市场决策对比失真 - 数据要求:各市场 Amazon Review API + 统一 Aspect schema - LACA 配置: - 英文标注 → LACA 微调 → 一个统一 ABSA 模型支持 4-6 语种推断 - 跨市场对比矩阵 
三轨验证 | 成本轨：月均成本1200元（API调用费用800元/月、模型微调200元/月、人工标注4小时/月×100元/小时），年度投入14400元 | 合规轨：符合《个人信息保护法》第二十四条（个性化推荐需告知），符合跨境电商数据合规要求，需建立用户同意机制和数据出境评估 | 风险轨：模型偏差导致RFM分层准确度下降（概率15%），跨语言理解错误率3-5%影响用户体验（概率20%），数据隐私泄露风险（概率8%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:XLM-R/mBERT 公开可用,跨语言对齐"开箱即用"
易处:CL-XABSA 有完整 GitHub 实现可参考
难处:LACA 主论文未开源,需自行实现 LLM 生成 + 一致性校验
难处:LLaMA 3.1 70B / Orca 2 推理成本(单产品千条评论生成 ~$5-10)
难处:德语/日语未在 LACA 实验集,需要业务实测验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（120 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/laca_crosslingual_absa` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-LACA-CrossLingual-ABSA.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LACA 跨语言 ABSA 最小骨架
主论文 arXiv:2508.09515 (ACL 2025)
辅: CL-XABSA arXiv:2204.00791 (github.com/GKLMIP/CL-XABSA)
依赖: pip install transformers torch
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


@dataclass
class LACAConfig:
    backbone: str = "xlm-roberta-base"
    source_lang: str = "en"
    target_lang: str = "de"
    label_space: List[str] = field(default_factory=lambda: [
        "O", "B-POS", "I-POS", "B-NEG", "I-NEG", "B-NEU", "I-NEU",
    ])

    @property
    def num_labels(self) -> int:
        return len(self.label_space)

    @property
    def id2label(self) -> dict:
        return {i: lbl for i, lbl in enumerate(self.label_space)}


def parse_bio_to_aspects(tokens: List[str], pred_labels: List[str]) -> List[Tuple[str, str]]:
    """BIO 序列 → [(aspect_term, polarity)]"""
    aspects, current, current_pol = [], [], None
    for tok, label in zip(tokens, pred_labels):
        if tok in ("[CLS]", "[SEP]", "<s>", "</s>", "<pad>"):
            continue
        clean_tok = tok.replace("▁", "").replace("##", "")
        if label.startswith("B-"):
            if current:
                aspects.append((" ".join(current), current_pol))
            current = [clean_tok]
            current_pol = label[2:]
        elif label.startswith("I-") and current:
            current.append(clean_tok)
        else:
            if current:
                aspects.append((" ".join(current), current_pol))
                current, current_pol = [], None
    if current:
        aspects.append((" ".join(current), current_pol))
    return aspects


def build_laca_prompt(
    aspect_tuples: List[Tuple[str, str]],
    target_lang: str,
    few_shot_examples: List[Tuple[str, str, str]],
) -> str:
    """LACA Stage 2: Label-Aware LLM 生成 prompt"""
    examples_text = "\n".join(
        f'[A] {a} [P] {p} -> "{sent}"'
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.09515 — LACA: Improving Cross-lingual Aspect-Based Sentiment Analysis with LLM Data Augmentation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：英文 ABSA 标注数据（SemEval-2016 或自建母婴标注集 2,000-5,000 条）+ 各市场无标注客服日志或评论（德/法/西/日等），日志需带语种与市场标记。

**输出**：可跨语种推断的 ABSA 模型与逐条 aspect-sentiment 结果（BIO 标签解析出的方面词与极性），以及统一 schema 下的跨市场情感对比矩阵，供客服分诊与产品决策使用。

## 执行步骤

1. 用英文标注模型对目标语言文本做零样本预测
2. 依据伪标签用 LLM 生成目标语言句子
3. 合并真标注与合成数据训练跨语言模型
4. 解析 BIO 输出为方面词-极性对
5. 按统一 Aspect schema 汇总跨市场情感分布

## 边界与不做

- 目标语言完全没有客服日志或评语料时不适用，零样本预测无从校准
- LLM 合成数据只能用于训练、不得当作真实用户证据引用；德语、日语等未进论文实验集的语种需业务实测验证
- 输出的粒度是方面情感，不包含工单处置动作与责任分工

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-StaR-Review-Statement-Ranking.html、Skill-StaR-Review-Statement-Ranking
- **可组合**：Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-LACA-CrossLingual-ABSA

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：14-用户分析　·　源卡：`Skill-LACA-CrossLingual-ABSA`