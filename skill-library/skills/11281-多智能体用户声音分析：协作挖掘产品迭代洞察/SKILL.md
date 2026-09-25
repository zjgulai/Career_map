---
name: "p2s-mas-voc-multi-agent-analysis"
title: "MAS VOC Multi-Agent Analysis — 多智能体用户声音分析：协作挖掘产品迭代洞察"
description: "触发词：多智能体分析、评论辩论、迭代方向、多视角洞察、需求分群。何时不用：只要一份属性摘要时用「AGRS 属性引导评论摘要」；只要带 ROI 排序的行动清单时用「MAA 评论到行动决策」。安全边界：多视角结论须保留争议点原文，不得只保留共识；生产环境调用 LLM API 时评论文本需先脱敏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 需求分群"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-MAS-VOC-Multi-Agent-Analysis"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让产品、工程、营销、用户研究四个角色分头分析同一批评论再互相辩论，避免单次分析只给出「改进噪音、加强吸力」这类空话。"
user_try: "试试：拿这 3,000 条季度评论做多智能体辩论分析，本季度只能做一个改进，帮我定方向。"
whenToUse: "评论量大、单一视角结论过于笼统、需要多角色交叉验证时用本技能；若只需一份摘要或只需排序好的行动清单，改用更轻的「AGRS 属性引导评论摘要」或「MAA 评论到行动决策」。"
workflow: "准备季度评论全量、竞品评论与产品路线图约束 → 为产品/工程/营销/用户研究四个角色设定关注重点与典型偏见 → 各角色分别输出自己的视角结论 → 组织角色间辩论并记录关键争议与解决方式 → 汇总为含优先级与预期 ROI 的最终执行建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS VOC Multi-Agent Analysis — 多智能体用户声音分析：协作挖掘产品迭代洞察

## ① 解决的问题

单LLM分析3000条评论只给出「改进噪音加强吸力」的泛泛结论无法指导具体产品决策——多智能体（产品经理/工程师/营销/UX）并行分析辩论共识，精准输出可执行改进建议并量化预期ROI年化产品迭代价值15-50万元

## ② 核心算法逻辑

单 LLM 分析 vs 多智能体辩论分析：

## ③ 业务应用场景

业务问题：每季度收集 3000 条评论，产品团队需要确定下季度产品迭代方向。用单个 LLM 分析得到的建议经常是"改进噪音、加强吸力、增加便携性"这种泛泛结论，无法指导具体产品决策。
数据要求： - 季度评论全量（含文本/评分/Verified Purchase） - 竞品评论对比（Momcozy/Medela） - 产品路线图约束（本季度只能做1个改进）
预期产出： - 多视角分析报告（产品/工程/营销三个视角的不同结论） - 辩论记录（关键争议点和解决方式） - 最终执行建议（具体可操作，含优先级和预期 ROI）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
产品改进决策质量提升（多视角辩论 vs 单一 LLM）：正确决策率提升 30-50%
分析效率：3 天人工 → 30 分钟 AI 辅助，节省运营人力 ¥3-10 万/年
精准迭代减少无效产品改动：每次改对 vs 改错差 ¥10-40 万 GMV 影响
年化综合 ROI：¥15-50 万
实施难度：⭐⭐⭐☆☆（AutoGen/CrewAI 等框架可直接用；需要 LLM API；角色设计约 1-2 周；完整系统约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（165 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'elif' statement on line 59）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/mas_voc_multi_agent_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-VOC-Multi-Agent-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAS VOC Multi-Agent Analysis
多智能体用户声音分析：协作辩论驱动产品改进洞察
"""
from dataclasses import dataclass
from typing import Optional
import re


@dataclass
class AgentRole:
    name: str
    persona: str     # 角色定位
    focus: str       # 分析重点
    bias: str        # 典型偏见（用于制造有益争论）


# 产品改进分析的多智能体角色
ANALYSIS_AGENTS = [
    AgentRole('PM-Agent', '产品经理', '用户需求优先级和市场机会', '倾向于用户声音，可能忽视技术可行性'),
    AgentRole('ENG-Agent', '工程师', '技术可行性和实现成本', '倾向于技术复杂度估算，可能低估用户价值'),
    AgentRole('MKT-Agent', '营销经理', '竞品对比和品牌定位', '倾向于市场份额，可能过度强调竞品'),
    AgentRole('UX-Agent', '用户研究员', '使用场景和用户行为模式', '倾向于边缘用户需求，可能忽视主流用户'),
]


def analyze_from_perspective(reviews: list, agent: AgentRole, aspect_data: dict) -> dict:
    """
    模拟特定角色视角的分析（生产中替换为 LLM API 调用）
    """
    # 统计总体情感
    pos_count = sum(1 for r in reviews if r.get('rating', 3) >= 4)
    neg_count = len(reviews) - pos_count
    pos_ratio = pos_count / max(len(reviews), 1)

    # 每个角色的分析逻辑不同
    insights = {}

    if agent.name == 'PM-Agent':
        # PM 关注：哪个问题影响最多用户？
        top_issue = max(aspect_data.items(), key=lambda x: x[1]['negative'], default=('unknown', {}))
        insights = {
            'priority_issue': top_issue[0],
            'affected_users': f'{top_issue[1].get("negative", 0) / max(len(reviews), 1):.0%}',
            'recommendation': f'优先解决 {top_issue[0]} 问题（影响最多用户）',
            'confidence': 'high',
        }

    elif agent.name == 'ENG-Agent':
        # 工程师关注：哪个问题技术上最容易修复？
        easy_fix = 'price'  # 模拟：价格策略比降噪更容易改
        insights = {
            'easiest_fix': easy_fix,
            'estimated_effort': '低（定价策略调整，无需工程改动）',
            'recommendation': f'先解决 {easy_fix} 问题（ROI最高，工程成本最低）',
            'confidence': 'medium',
        }

    elif agent.name == 'MKT-Agent':
        # 营销关注：和竞品相比差距最大的是什么？
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2409.14832，但该号在 arXiv 上是《Energy-Aware Federated Learning in Satellite Constellations》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：季度评论全量（文本/评分/Verified Purchase 标记）、竞品评论（如 Momcozy/Medela 对比数据）、产品路线图约束（如本季度只能做 1 个改进）。

**输出**：多视角分析报告（产品/工程/营销等视角的不同结论）、辩论记录（关键争议点与解决方式）、含优先级与预期 ROI 的最终执行建议，供产品团队确定迭代方向。

## 执行步骤

1. 汇总季度评论与竞品评论，明确路线图约束
2. 为每个角色设定分析重点与典型偏见
3. 按角色分别产出视角结论
4. 组织角色辩论并记录争议与收敛过程
5. 输出带优先级与预期 ROI 的执行建议

## 边界与不做

- 评论样本不足、或问题本身只有一个视角时不适用，多智能体的成本高于收益
- 辩论产出的是判断与建议，不替代产品路线图评审；角色偏见设定需人工校准
- 多角色多次调用会显著抬高推理成本，须先评估预算；卡页估算角色设计约 1-2 周、完整系统约 3-4 周

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **可组合**：Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Multi-Agent-Skill-Composition.html、Skill-Multi-Agent-Skill-Composition、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge、Skill-MAS-VOC-Multi-Agent-Analysis

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：10-MAS　·　源卡：`Skill-MAS-VOC-Multi-Agent-Analysis`