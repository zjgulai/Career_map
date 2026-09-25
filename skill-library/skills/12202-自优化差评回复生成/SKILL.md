---
name: "p2s-scrable-review-response-generation"
title: "SCRABLE Review Response Generation — RAG+LLM 自优化差评回复生成"
description: "触发词：差评回复、回复草稿生成、RAG 知识库、语气控制、回复质检。何时不用：只给评论排序展示用「评论有用性排序模型」；本技能生成并迭代回复草稿。安全边界：不得虚假承诺赔付或诱导修改评价，回复前须脱敏买家个人信息并遵守当地广告法。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-112"
l3_business: "服务补救"
l3_all: "服务补救 / 用户反馈"
l1_l2_l3: "业务运营/服务与体验/服务补救"
p2s_card_id: "Skill-SCRABLE-Review-Response-Generation"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "每条差评几秒生成一份像人工写的专业回复草稿，附质量分，不达标的自动交人工复核。"
user_try: "试试：把今天这 20 条差评按问题类型生成回复草稿，并标出需要人工复核的。"
whenToUse: "当差评需在时效内响应、要批量产出符合平台规范与本地化语气的回复草稿时用；评论排序与展示优化不用本技能。"
workflow: "归类差评问题类型 → 从产品 FAQ 与退换货政策中检索对应知识 → 生成回复草稿并做自优化打分 → 对低于质量阈值的草稿转人工复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SCRABLE Review Response Generation — RAG+LLM 自优化差评回复生成

## ① 解决的问题

每天 20-30 条差评需在 48h 内回复否则影响卖家评分，人工团队时差覆盖困难——RAG 检索产品知识库 + LLM 自优化迭代生成专业回复，回复时效 18h→2h、回复率 60%→95%+，ROUGE-L 提升 8.5%

## ② 核心算法逻辑

核心思想：电商卖家回复差评是维护品牌声誉的核心操作，但人工回复耗时（日均 50+ 条差评 × 510 分钟/条）且质量参差。SCRABLE 将 RAG（检索产品知识库）+ LLM（生成专业回复）+ 自优化评分（模拟人工评估并迭代改进）三层架构结合，生成的回复比基线 Prompt 提升 8.5%+，同时支持语气风格控制（正式/亲切/专业）。

## ③ 业务应用场景

场景：吸奶器差评自动回复（Amazon UK/DE）
- 业务问题：某母婴品牌在 Amazon UK 每天有 20-30 条差评，需要 48h 内回复（超时影响卖家评分），人工团队时差覆盖困难，且英语/德语差评需要本地化语气。 - 数据要求：产品 FAQ 文档 + 退换货政策 + 历史优质回复示例（10-20 条）。 - 预期产出： - 针对每条差评的专业回复草稿（3 秒内生成） - 质量评分（0-1，低于 0.7 自动触发人工复核） - 可解释改进建议（"未提及具体解决方案 -0.2"） - 差评类型覆盖： - 产品质量问题 → 道歉 + 解释 + 退换货方案 - 使用方法误解 → 同理心 + 详细指导 + 视频链接 - 物流延误投诉 → 道歉
三轨验证： - 成本：LLM API 调用费用约 $0.01-0.03/条（GPT-4），RAG 向量数据库存储成本约 $50/月（1000 条 FAQ），人力投入为初期知识库构建 2-3 天 + 每周 1 小时质量抽检。 - 合规：Amazon 政策允许卖家使用自动化工具回复，但禁止虚假承诺（如承诺退款后不执行）或诱导修改评价。GDPR 要求不存储买家个人身份信息（PII），需在预处理阶段脱敏。德国广告法禁止夸大功效（如"100% 无噪音"）。 - 风险：若回复模板化严重，可能被 Amazon 判定为垃圾回复导致账号受限；过度承诺退换货可能引发批量索赔；语气不当（如过于机械）可能激化买家情绪

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：回复时效 18h → 2h，回复率 60% → 95%+，改善卖家评分 → BSR 排名稳定，年化 GMV 保护价值 20-100 万元
实施难度：⭐⭐☆☆☆（低，RAG + LLM API，无需训练模型）
优先级：⭐⭐⭐⭐⭐（差评未回复是 Amazon 账号健康的直接风险因素）
评估依据：LREC-COLING 2024，ROUGE-L +8.5%，人工评估可接受率 +15%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（79 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/scrable_review_response_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-SCRABLE-Review-Response-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ProductKnowledge:
    faq: List[str] = field(default_factory=list)
    return_policy: str = ""
    warranty: str = ""

@dataclass
class CustomerReview:
    text: str
    rating: int
    category: str = "general"

def classify_review_issue(review: CustomerReview) -> str:
    text = review.text.lower()
    if any(k in text for k in ['噪音', 'loud', 'noise', '声音大', '吵']):
        return 'noise_complaint'
    if any(k in text for k in ['漏', 'leak', '漏奶', '漏液']):
        return 'leakage_complaint'
    if any(k in text for k in ['不会用', 'how to', '怎么用', 'confused', '说明书']):
        return 'usage_question'
    if any(k in text for k in ['物流', 'shipping', '发货', 'delivery', '快递', '慢']):
        return 'shipping_complaint'
    if any(k in text for k in ['坏了', 'broken', '损坏', 'defective', '质量差']):
        return 'quality_complaint'
    return 'general_dissatisfaction'

def retrieve_knowledge(issue_type: str, kb: ProductKnowledge) -> str:
    knowledge_map = {
        'noise_complaint': "吸奶器在最高档位会有轻微马达声（约40dB），建议使用中低档位，噪音更低。",
        'leakage_complaint': "请检查硅胶护罩是否安装到位，逆时针旋转至底部听到咔哒声。如仍有问题，请联系我们。",
        'usage_question': "详细使用说明请参考包装内手册，或访问官网视频教程。我们也提供1对1远程指导。",
        'shipping_complaint': kb.return_policy or "物流延误深感抱歉，请提供订单号，我们将协助追踪。",
        'quality_complaint': kb.warranty or "产品享有18个月质保，如存在质量问题请联系我们，免费换新。",
        'general_dissatisfaction': "感谢您的反馈，我们非常重视您的体验。",
    }
    return knowledge_map.get(issue_type, "感谢您的反馈。")

def generate_response(review: CustomerReview, kb: ProductKnowledge,
                      tone: str = 'empathetic') -> dict:
    issue = classify_review_issue(review)
    knowledge = retrieve_knowledge(issue, kb)
    tone_prefix = {
        'empathetic': "非常感谢您的详细反馈，我们深感抱歉让您有此体验。",
        'professional': "感谢您的评价，我们对此高度重视。",
        'friendly': "亲爱的顾客，谢谢您分享使用感受！",
    }.get(tone, "感谢您的反馈。")
    response = f"{tone_prefix}\n\n{knowledge}\n\n如有任何疑问，欢迎随时联系我们的客服团队，我们将在24小时内为您解答。祝您和宝宝一切顺好！"
    quality = _score_response(response, review)
    return {'response': response, 'issue_type': issue, 'quality_score': quality,
            'needs_human_review': quality < 0.7}

def _score_response(response: str, review: CustomerReview) -> float:
    score = 0.5
    if len(response) > 100: score += 0.1
    if len(response) > 200: score += 0.1
    if any(k in response for k in ['联系', 'contact', '客服', 'support']): score += 0.1
    if any(k in response for k in ['质保', 'warranty', '退换', 'return', '换新']): score += 0.1
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2405.03845 — Self-Improving Customer Review Response Generation Based on LLMs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品 FAQ 文档、退换货与保修政策、历史优质回复示例 10-20 条、待回复差评原文与评分。

**输出**：每条差评的回复草稿、0-1 质量评分与可解释改进建议，覆盖产品质量、使用误解、物流延误等类型，供客服审核发布。

## 执行步骤

1. 按关键词或分类器归类差评问题类型
2. 从产品知识库检索对应 FAQ 与政策条款
3. 生成回复草稿并做自优化评分
4. 对低于质量阈值的草稿转人工复核
5. 按语言与站点调整语气后批量交付审核

## 边界与不做

- 何时不用：知识库为空或政策文档缺失时，回复会退化成空泛模板
- 能力边界：只产出草稿与评分，不代替卖家账号发送回复，也不得承诺无法兑现的赔付

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-AutoQual-Review-Quality-Assessment.html、Skill-AutoQual-Review-Quality-Assessment、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-Multilingual-Customer-Service-Translation.html、Skill-Multilingual-Customer-Service-Translation
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-Multilingual-Customer-Service-Translation.html、Skill-Multilingual-Customer-Service-Translation
- **可组合**：Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-SCRABLE-Review-Response-Generation

---

> 分类：业务运营/服务与体验/服务补救　·　技术族：14-用户分析　·　源卡：`Skill-SCRABLE-Review-Response-Generation`