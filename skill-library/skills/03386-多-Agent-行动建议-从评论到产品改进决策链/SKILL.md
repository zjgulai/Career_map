---
name: "p2s-maa-review-to-action-decision"
title: "MAA 多 Agent 行动建议 - 从评论到产品改进决策链"
description: "触发词：评论到行动、改进建议、优先级排序、多 Agent 决策、季度复盘。何时不用：只需要属性级摘要本身时用「AGRS 属性引导评论摘要」；只需要把差评按问题打标并分派给团队时用「Tag-Driven VOC 信号路由」。安全边界：改进建议若涉及具体数值（如静音降至 35dB）需第三方检测报告支撑才能对外宣传；评论数据须匿名化并遵守 Amazon 开发者协议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 产品需求定义"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-MAA-Review-to-Action-Decision"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把差评直接蒸馏成可执行的改进清单，带优先级和投入产出评估，产品经理不用再花一两周做二次提炼。"
user_try: "试试：把美/德/中三个市场的差评跑一遍 MAA，给我本季度 Top 5 改进项和排序理由。"
whenToUse: "已经拿到评论分析结果、需要输出可执行改进项与排序时用本技能；若分析结果还没成形，先用「AGRS 属性引导评论摘要」；若只要求把信号路由给对应团队，用「Tag-Driven VOC 信号路由」。"
workflow: "按市场分别聚类（如 K=5），选出每簇的代表评论 → 用 Issue Agent 抽取每个簇的核心痛点 → 用 Recommendation Agent 生成 3-4 条改进建议 → 用 SRAC 四维评分对建议排序 → 输出季度 Top 3-5 优先改进项与 ROI 排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAA 多 Agent 行动建议 - 从评论到产品改进决策链

## ① 解决的问题

Momcozy M5 吸奶器在美国/德国/中国三市场销售,各市场用户痛点完全不同(美国关注续航便携、德国关注静音认证、中国关注清洗方便). 现有运营复盘只产出"差评列表",无法直接驱动产品改进决策——产品经理拿到差评列表还要花 1-2 周二次提炼 - 数据要求:三市场 Amazon Review API + market 标签 - MAA 配置: - 按市场分别聚类(K=5,每市场 5

## ② 核心算法逻辑

传统评论分析停留在"描述性"层面(情感/属性). MAA 将其升级为"规范性决策链路":评论 → 问题 → 建议 → 评估 → 排序. 通过 5 个 Agent 分工,把大规模评论语料蒸馏成企业可直接执行的行动清单,而非分析报告.

## ③ 业务应用场景

- 业务问题:Momcozy M5 吸奶器在美国/德国/中国三市场销售,各市场用户痛点完全不同(美国关注续航便携、德国关注静音认证、中国关注清洗方便). 现有运营复盘只产出"差评列表",无法直接驱动产品改进决策——产品经理拿到差评列表还要花 1-2 周二次提炼 - 数据要求:三市场 Amazon Review API + market 标签 - MAA 配置: - 按市场分别聚类(K=5,每市场 5 个主题簇) - Issue Agent 提取每个簇的核心痛点(如"夜间使用嘈杂吵醒宝宝") - Recommendation Agent 生成 3-4 条改进建议(如"加静音模式降至 35dB"/
三轨验证： - 成本：Amazon Review API 调用费约 $0.01/条 × 3 市场 × 5000 条 = $150/季度；LLM 推理成本（GPT-4o-mini）约 $0.08/产品/轮，三市场 $0.24/轮；人力投入为 1 名数据分析师 2 天/季度（约 3000 元）。合计季度显性成本约 4500 元。 - 合规：Amazon Review API 使用需遵守 Amazon 开发者协议，禁止将评论数据用于竞品分析或转售；GDPR 下需确保评论数据匿名化处理，不存储用户 ID/邮箱；广告法层面，改进建议若涉及“静音模式降至 35dB”等具体数值，需有第三方检测报告支撑，否则
- 业务问题:Q1-Q4 季度复盘,人工归纳 3 个产品 × 4 季度 = 12 次,每次 3-5 PM 天,总计 36-60 PM 天/年;复盘结论高度依赖个人经验,新人接手质量大幅波动 - 数据要求:季度 Amazon + Wayfair 评论合并 - MAA 配置: AGRS 摘要 → MAA 5 Agent 决策链 → 输出"季度 Top 3-5 优先改进项 + ROI 排序" - 业务价值: - 节省人工:36-60 PM 天 × 3000元/天 = 10-18 万/年 - 决策质量标准化(SRAC 评分客观可比),新人接手不衰退 - 改进 ROI 提升 20-30% = 额外 10

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:论文 prompt 模板完整公开,5 Agent 模块清晰
难处:需要业务专家初始化 Ranking Agent 的成本/周期评分规则
难处:5 Agent 串联推理 token 成本较高(单产品估算 $0.05-0.15 GPT-4o-mini)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（143 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/maa_review_to_action_decision` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-MAA-Review-to-Action-Decision.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAA Multi-Agent Actionable Advice 最小骨架
论文 arXiv:2601.12024 (Bhandari et al., 2026-01)
完整实现见 paper2skills-code/nlp_voc/maa_actionable_advice/model.py
"""
from __future__ import annotations
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class Review:
    text: str
    review_id: str = ""
    market: str = ""


@dataclass
class SRAC:
    S: int = 0
    R: int = 0
    A: int = 0
    C: int = 0

    @property
    def score(self) -> float:
        return 0.25 * (self.S + self.R + self.A + self.C)


def clustering_agent(reviews: List[Review], k: int = 5) -> Dict[int, List[Review]]:
    """阶段 1: 聚类 + 选代表(生产替换为 TF-IDF + K-Means)"""
    keyword_buckets = {
        0: ["noise", "loud", "quiet"],
        1: ["clean", "wash", "hygiene"],
        2: ["battery", "portable", "wireless"],
        3: ["price", "expensive", "value"],
        4: ["build", "sturdy", "broken"],
    }
    clusters = defaultdict(list)
    for r in reviews:
        text_low = r.text.lower()
        best_cluster, best_match = -1, 0
        for cid, kws in keyword_buckets.items():
            match = sum(1 for kw in kws if kw in text_low)
            if match > best_match:
                best_cluster, best_match = cid, match
        if best_cluster >= 0:
            clusters[best_cluster].append(r)
    return dict(clusters)


def issue_agent(cluster_reps: Dict[int, List[Review]]) -> List[Dict]:
    """阶段 2: 抽取主题 + 具体问题"""
    issues = []
    for cid, reps in cluster_reps.items():
        if not reps:
            continue
        themes = ["noise", "cleaning", "portability", "value", "build_quality"]
        theme = themes[cid] if cid < len(themes) else "general"
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.12024 — Beyond Sentiment: A Multi-Agent Pipeline for Actionable Business Advice from Reviews

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：多市场评论数据（含 market 标签，如三市场 Amazon Review API 数据），以及 Ranking Agent 需要的成本与周期评分规则（须由业务专家初始化）。

**输出**：可直接执行的行动清单：每簇痛点、3-4 条改进建议、SRAC 评分与优先级、季度 Top 3-5 改进项及 ROI 排序，供产品经理与季度复盘使用。

## 执行步骤

1. 按市场分组聚类并选出代表评论
2. 抽取每个簇的核心痛点
3. 为每个痛点生成改进建议
4. 用 SRAC 评分对建议排序
5. 输出季度优先改进项与 ROI 排序

## 边界与不做

- 评论量过少、无法形成稳定主题簇时不适用；跨市场对比前需先保证各市场样本量可比
- 可行性、成本与周期的判断依赖业务专家初始化的评分规则，模型不自行估算成本
- 改进建议涉及具体数值对外宣传时需第三方检测报告支撑

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **延伸**：Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-MAA-Review-to-Action-Decision

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：14-用户分析　·　源卡：`Skill-MAA-Review-to-Action-Decision`