---
name: "p2s-mos-multi-source-opinion-summary"
title: "MOS Multi-Source Opinion Summary — LLM 多源评论整合摘要"
description: "触发词：多源评论、跨平台摘要、VOC 整合、平台差异、信号汇总。何时不用：只处理单一平台评论时用「AGRS 属性引导评论摘要」；要从未满足需求算选品机会分用「跨竞品评论选品机会评分」。安全边界：Amazon 评论采集须遵守 robots.txt 与服务条款、禁止批量爬取用于竞品分析；欧盟用户评论须去 PII 匿名化。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 用户反馈"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-MOS-Multi-Source-Opinion-Summary"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Amazon、TikTok、独立站等平台的评论连同产品规格和评分整合成一份结构化摘要，顺带指出各平台关注点的差异。"
user_try: "试试：把 Amazon US、TikTok 评论和独立站反馈整合成一份跨平台摘要，标出三个平台各自最关注的优缺点。"
whenToUse: "用户声音分散在多个平台、需要统一摘要并看清平台间差异时用本技能；若只处理单一平台的评论摘要，用「AGRS 属性引导评论摘要」；若要从竞品评论算选品机会得分，用「跨竞品评论选品机会评分」。"
workflow: "采集各平台评论文本、产品规格与评分数据 → 按平台分别抽取正面与负面信号词 → 用 LLM 整合多源信息生成跨平台统一摘要 → 输出各平台差异洞察与 Top-5 痛点、Top-5 亮点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MOS Multi-Source Opinion Summary — LLM 多源评论整合摘要

## ① 解决的问题

跨平台 VOC 整合靠人工需 2-3 天，Amazon/TikTok/独立站关注点各异——M-OS 框架同时整合评论文本/产品规格/评分多源，30 分钟生成结构化摘要，月均节省 20-30 人时、关键信号漏报率降低 80%

## ② 核心算法逻辑

核心思想：传统 VOC 分析只看 Amazon 评论，但消费者声音分散在 Amazon + TikTok 评论区 + 独立站 + 社交媒体，各平台用语风格不同，关注点也不同（Amazon 偏功能，TikTok 偏颜值体验，Reddit 偏长期使用）。MOS 框架用 LLM 同时整合评论文本、产品规格、评分数据等多源信息，构建结构化摘要，人类判断一致性 ρ=0.74，用户研究 87% 偏好 MOS 摘要。

## ③ 业务应用场景

- 业务问题：运营团队每月要整合 Amazon US（英文）、TikTok 评论（中英混合）、独立站反馈（中文）三个平台的用户声音，人工整理需要 2-3 天，且容易遗漏关键信号。 - 数据要求：各平台评论文本 + 产品规格 + 评分数据，支持中英双语混合输入。 - 预期产出： - 跨平台统一摘要（优点/缺点/使用场景/适合人群） - 各平台差异洞察（"Amazon 用户关注噪音，TikTok 用户更在意外观设计"） - 关键信号摘要（最高频提及的 Top-5 痛点 + Top-5 亮点） - 竞品对比摘要（如果提供竞品评论数据） - 业务价值：将跨平台 VOC 整合从 2-3 天压缩到 30 
三轨验证： - 成本：显性成本包括 LLM API 调用费用（约 $0.5-2/次摘要生成）、数据采集管道维护（爬虫/API 接口，约 $100-300/月）、以及运营人员 30 分钟/次的配置时间。若使用开源模型本地部署，则增加 GPU 算力成本（约 $200-500/月）。 - 合规：Amazon 评论采集需遵守 robots.txt 及 AWS 服务条款，禁止批量爬取用于竞品分析；TikTok 评论需通过官方 API 获取，避免违反平台数据使用政策；独立站数据需确认用户隐私声明是否允许第三方汇总。GDPR 下需对欧盟用户评论做匿名化处理（去除用户名、邮箱等 PII）。 - 风险：若摘要中

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：跨平台 VOC 整合从 2-3 天压缩到 30 分钟，月均节省 20-30 人时，关键信号漏报率降低 80%
实施难度：⭐⭐☆☆☆（低，LLM API 调用 + 数据采集管道）
优先级：⭐⭐⭐⭐⭐（多平台运营是母婴跨境标配，多源 VOC 整合是高频刚需）
评估依据：IJCNLP 2025，人类判断一致性 ρ=0.74，用户研究 87% 偏好 M-OS 摘要

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（78 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/mos_multi_source_opinion_summary` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-MOS-Multi-Source-Opinion-Summary.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict
from collections import Counter

@dataclass
class PlatformReviews:
    platform: str
    reviews: List[str]
    avg_rating: float
    rating_dist: Dict[int, int] = field(default_factory=dict)

def extract_platform_signals(pr: PlatformReviews) -> Dict:
    all_text = ' '.join(pr.reviews).lower()
    pos_keywords = ['好用', 'love', 'great', 'quiet', '安静', '舒适', 'comfortable',
                    '方便', 'convenient', '效果好', 'effective', '推荐', 'recommend']
    neg_keywords = ['噪音', 'loud', 'noise', '漏奶', 'leak', '痛', 'painful',
                    '难清洗', 'hard to clean', '贵', 'expensive', '断货', '售后']
    pos_count = sum(all_text.count(k) for k in pos_keywords)
    neg_count = sum(all_text.count(k) for k in neg_keywords)
    pos_ratio = pos_count / (pos_count + neg_count + 1)
    top_pos = [k for k in pos_keywords if all_text.count(k) > 0][:3]
    top_neg = [k for k in neg_keywords if all_text.count(k) > 0][:3]
    return {'platform': pr.platform, 'avg_rating': pr.avg_rating,
            'pos_ratio': round(pos_ratio, 2), 'top_positive': top_pos,
            'top_negative': top_neg, 'review_count': len(pr.reviews)}

def multi_source_summary(platforms: List[PlatformReviews]) -> Dict:
    platform_signals = [extract_platform_signals(p) for p in platforms]
    all_pos = Counter()
    all_neg = Counter()
    for p in platforms:
        text = ' '.join(p.reviews).lower()
        for k in ['好用','安静','舒适','方便','效果好','推荐','love','great','quiet']:
            if text.count(k) > 0:
                all_pos[k] += text.count(k)
        for k in ['噪音','漏奶','痛','难清洗','贵','expensive','loud','painful']:
            if text.count(k) > 0:
                all_neg[k] += text.count(k)
    total_reviews = sum(len(p.reviews) for p in platforms)
    weighted_rating = sum(p.avg_rating * len(p.reviews) for p in platforms) / total_reviews
    platform_diff = []
    for sig in platform_signals:
        if sig['avg_rating'] > weighted_rating + 0.3:
            platform_diff.append(f"{sig['platform']} 评价明显更正面（{sig['avg_rating']:.1f}星）")
        elif sig['avg_rating'] < weighted_rating - 0.3:
            platform_diff.append(f"{sig['platform']} 评价偏负面（{sig['avg_rating']:.1f}星）")
    return {
        'total_reviews': total_reviews,
        'weighted_avg_rating': round(weighted_rating, 2),
        'top5_positives': [k for k, _ in all_pos.most_common(5)],
        'top5_negatives': [k for k, _ in all_neg.most_common(5)],
        'platform_differences': platform_diff,
        'platform_details': platform_signals,
    }

platforms = [
    PlatformReviews('Amazon US', [
        'Super quiet pump, love it! Easy to clean, my baby likes it.',
        'A bit expensive but worth it. Very comfortable, no pain at all.',
        'Loud noise at max level, otherwise great. Would recommend.',
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2507.04751 — LLMs as Architects and Critics for Multi-Source Opinion Summarization

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各平台评论文本 + 产品规格 + 评分数据，支持中英双语混合输入；做竞品对比摘要时还需提供竞品评论数据。

**输出**：跨平台统一摘要（优点 / 缺点 / 使用场景 / 适合人群）、各平台差异洞察（如 Amazon 用户关注噪音、TikTok 用户更在意外观设计）、关键信号摘要（Top-5 痛点与 Top-5 亮点），以及可选的竞品对比摘要。

## 执行步骤

1. 采集各平台评论、产品规格与评分数据
2. 按平台抽取正面与负面信号
3. 用 LLM 整合多源信息生成统一摘要
4. 标注各平台的关注点差异
5. 输出 Top-5 痛点与亮点清单

## 边界与不做

- 只能拿到部分平台数据、或评论缺少评分与规格信息时不适用，跨平台对比会失真
- 输出是摘要与信号清单，不含改进建议与优先级排序
- Amazon 评论采集须遵守 robots.txt 与服务条款、禁止批量爬取用于竞品分析；欧盟用户评论须去 PII 匿名化

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AutoQual-Review-Quality-Assessment.html、Skill-AutoQual-Review-Quality-Assessment、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Review-Dedup-Quality-Filter.html、Skill-Review-Dedup-Quality-Filter、Skill-SCRABLE-Review-Response-Generation.html、Skill-SCRABLE-Review-Response-Generation
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-SCRABLE-Review-Response-Generation.html、Skill-SCRABLE-Review-Response-Generation
- **可组合**：Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-SCRABLE-Review-Response-Generation.html、Skill-SCRABLE-Review-Response-Generation、Skill-MOS-Multi-Source-Opinion-Summary

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：14-用户分析　·　源卡：`Skill-MOS-Multi-Source-Opinion-Summary`