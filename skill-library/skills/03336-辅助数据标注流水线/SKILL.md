---
name: "p2s-llm-data-annotation-pipeline"
title: "LLM-based Data Annotation Pipeline — LLM 辅助数据标注流水线"
description: "触发词：LLM辅助标注、弱监督、标注质检、长尾类别处理、多语言标注。何时不用：只需要抽取内容本身而不需要训练标签时用统一信息抽取技能；只做情感特征工程不涉及标注环节。安全边界：评论数据使用须遵守平台条款与数据授权协议，标注结果用于训练前必须抽样人工复核。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-LLM-Data-Annotation-Pipeline"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让模型先标掉大部分样本、人工只复审少量，把几个月的人工标注压缩到几周。"
user_try: "试试：给这 10 万条评论按 8 个维度做 LLM 标注，标出需要人工复审的部分，并检查长尾维度的质量。"
whenToUse: "需要快速产出大批量训练标签、人工标注成本或周期不可接受时用本技能；只需抽取内容本身而不需要训练标签，用统一信息抽取技能。"
workflow: "定义标注标签集与判定规则 → 用 LLM 批量标注并叠加规则标注 → 对低置信与长尾类别单独处理 → 抽样人工复审并校验一致性 → 输出标注数据集与质检报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM-based Data Annotation Pipeline — LLM 辅助数据标注流水线

## ① 解决的问题

数据团队面临"人工标注训练数据成本高且周期长"——LLM辅助标注流水线将标注成本降低70%速度提升5倍，年化节省数据标注成本25-50万元

## ② 核心算法逻辑

LLM 辅助标注流水线将大语言模型用作"廉价但有噪声"的标注器，结合弱监督（Weak Supervision）和主动学习（Active Learning）降低标注成本，同时维持标注质量。

## ③ 业务应用场景

场景1：Amazon 评论情感细粒度标注 - 业务问题：VOC 团队需要对 10 万条婴儿推车评论按 8 个维度（安全/折叠便利/推行顺畅/外观/价格/客服/配件/耐用）分别标注情感，人工标注成本约 15 万元、耗时 3 个月。 - 数据要求：Amazon review 文本（英/德/日），平均 150 字/条，10 万条 - 预期产出：LLM+弱监督覆盖 85% 样本自动标注，剩余 15% 人工复审，总成本降低 75%，周期从 3 个月 → 3 周 - 业务价值：快速获取细粒度 VOC 标注数据，驱动 Listing 优化，评分提升 0.1★ 对应转化率提升约 3-5%
场景2：合规风险文本分类 - 业务问题：运营需要扫描所有 Listing 文案中的违规词（如 "cure", "prevent disease" 等 FDA 禁用词），规则难以穷举，人工逐条审查效率极低。 - 数据要求：全量 Listing 文案（title + bullets + description），约 5000 个 SKU - 预期产出：LLM 标注 + 规则标注函数组合，违规词检出率 > 95%，误报率 < 5% - 业务价值：避免因合规问题被 Amazon 下架（每次下架损失 3-10 万元 GMV），成本接近零
**三轨验证**： - 成本：LLM API 成本约 $0.001-0.01/样本（DeepSeek V3 最低），10 万条约 $100-1000；标注平台（Label Studio 开源） - 合规：评论数据处理需遵守平台 TOS；用于训练的标注数据需数据授权协议 - 风险：LLM 对罕见类别（< 100 条）标注质量差，需专门处理长尾类；多语言场景需分语言验证标注质量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：10 万条评论标注成本从 15 万元/3 个月 → 3.8 万元/3 周（节省 75% 成本，加速 75% 周期）；细粒度 VOC 数据驱动 Listing 优化，评分提升 0.1★ 带来转化率 +3-5%，年化增量 GMV 5-15 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：LLM 标注是高性价比的冷启动方案，几乎所有需要 NLP 模型的场景都需要大量标注数据，本 Skill 解决的是"高质量标注数据的供给"瓶颈。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM 辅助数据标注流水线演示
模拟 LLM 标注 + 弱监督标签函数融合 + 主动学习采样
"""
import random
from typing import Any

# ── 模拟数据集 ────────────────────────────────────────────────────────────────
REVIEWS = [
    {"id": f"R{i:04d}", "text": text, "true_label": label}
    for i, (text, label) in enumerate([
        ("This stroller folds so easily, love it!", "positive"),
        ("Wheel broke after 2 weeks, terrible quality", "negative"),
        ("Average product, nothing special", "neutral"),
        ("Baby loves the seat, very comfortable and safe", "positive"),
        ("Customer service was awful when I tried to return it", "negative"),
        ("Good value for the price honestly", "positive"),
        ("Assembly instructions were confusing but product is ok", "neutral"),
        ("This is dangerous, the harness doesn't latch properly!", "negative"),
        ("Lightweight and easy to push, recommended", "positive"),
        ("Looks nice in pictures but cheap in person", "negative"),
        ("Perfect for our daily walks", "positive"),
        ("Mediocre at best, expected more", "neutral"),
        ("Great stroller, worth every penny!", "positive"),
        ("Squeaky wheels from day one, annoying", "negative"),
        ("Decent quality for the price range", "neutral"),
    ])
]

# ── Step 1: LLM 标注（模拟 GPT-4o/DeepSeek 返回）─────────────────────────────
def llm_annotate(text: str) -> dict[str, Any]:
    """
    模拟 LLM 结构化标注结果
    真实场景: POST https://api.deepseek.com/v1/chat/completions
    Prompt: "请对以下母婴产品评论按情感分类为 positive/negative/neutral，
             并给出 0-1 的置信度..."
    """
    # 模拟 LLM：关键词启发式 + 随机噪声（错误率 ~15%）
    text_lower = text.lower()
    positive_words = {"love", "great", "excellent", "recommended", "perfect", "worth", "good"}
    negative_words = {"terrible", "broke", "awful", "dangerous", "cheap", "annoying", "bad"}

    pos_score = sum(w in text_lower for w in positive_words)
    neg_score = sum(w in text_lower for w in negative_words)

    if pos_score > neg_score:
        label, confidence = "positive", random.uniform(0.72, 0.95)
    elif neg_score > pos_score:
        label, confidence = "negative", random.uniform(0.70, 0.92)
    else:
        label, confidence = "neutral", random.uniform(0.45, 0.75)

    # 注入 15% 噪声
    if random.random() < 0.15:
        label = random.choice(["positive", "negative", "neutral"])
        confidence = random.uniform(0.35, 0.60)

    return {"llm_label": label, "llm_confidence": round(confidence, 3)}
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待标注文本（如多语言评论文本、Listing 文案，10 万条量级）与标签集定义、标注规则，粒度到单条样本与单个标签维度。

**输出**：带标注结果与置信度的数据集、需人工复审的样本清单与质检报告（含检出率与误报率），供模型训练与合规扫描使用。

## 执行步骤

1. 定义标注标签集、维度与判定规则
2. 用 LLM 批量标注并叠加规则标注函数
3. 对低置信样本与长尾类别单独处理
4. 抽样人工复审，校验多语言下的标注一致性
5. 输出标注数据集与质检报告

## 边界与不做

- 标签定义含糊或类别极不均衡（罕见类别样本很少）时纯 LLM 标注质量差；样本量很小的任务直接人工标注更划算。
- 本技能产出标注数据与质检结论，不保证标注可作为黄金标准，进入训练前仍需人工抽样复核。

## 技能关联

- **可组合**：Skill-LLM-Data-Annotation-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-LLM-Data-Annotation-Pipeline`