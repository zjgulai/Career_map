---
name: "p2s-dara-agentic-mmm-optimizer"
title: "DARA - LLM+RL 双阶段广告预算分配 Agent"
description: "触发词：冷启动出价、LLM预算分配、边际ROAS等价、日预算向量、时段分配。何时不用：已有MMM后验或参数模型时不走冷启动路径；只要按阈值规则削预算用渠道预算再分配触发器。安全边界：须遵守Google与Meta Ads API服务条款，禁止用于自动化出价操纵，冷启动期应设预算损失上限并保留人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-DARA-Agentic-MMM-Optimizer"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "用 LLM 先出初始预算分配、再按每日 ROAS 反馈精调，解决新品冷启动期历史数据不足的出价难题。"
user_try: "试试：新品上线只有4周 Google Ads 数据，帮我用 DARA 给出本周的日预算分配并每日按 ROAS 反馈调整。"
whenToUse: "冷启动期（历史仅 3-5 周）需要 LLM 先验加在线反馈补足时用本卡；数据充足且已有 MMM 参数时用 DARA Agentic MMM 或 MMM 预算利润对齐；纯阈值规则削预算用渠道预算再分配触发器。"
workflow: "汇总近 3-5 周时段或渠道 ROAS 与月度总预算 → Phase 1 由 LLM 读历史生成初始分配向量 → 执行后回收每日真实 ROAS 反馈 → Phase 2 按边际 ROAS 等价目标精调下一期 → 迭代至收敛并输出最终分配"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DARA - LLM+RL 双阶段广告预算分配 Agent

## ① 解决的问题

婴儿推车季节性爆款上线,Google Ads 历史只有 3-5 周数据,传统规则策略难快速找到最优出价时段 - 数据要求:近 3-5 周 Google Ads ROAS 时段数据 + 月度总预算 - DARA 配置:T = 7(一周)或 24(一天时段);Phase 1 LLM 读历史生成日预算向量;Phase 2 每日 ROAS 反馈调整下一日 - 业务价值:冷启动期 ROAS 提升

## ② 核心算法逻辑

固定总预算下,广告主需在 T 个时段/渠道间分配预算 $b_1, \ldots, b_T$ 最大化总回报。DARA 双阶段架构:Phase 1 Fewshot Reasoner(LLM 读历史 35 周数据生成初始分配) + Phase 2 Finegrained Optimizer(滑窗 ROI 反馈精调),用 GRPOAdaptive(动态参考策略 RL)训练 LLM,解决冷启动 + 数值精度双难题。

## ③ 业务应用场景

- 业务问题:婴儿推车季节性爆款上线,Google Ads 历史只有 3-5 周数据,传统规则策略难快速找到最优出价时段 - 数据要求:近 3-5 周 Google Ads ROAS 时段数据 + 月度总预算 - DARA 配置:T = 7(一周)或 24(一天时段);Phase 1 LLM 读历史生成日预算向量;Phase 2 每日 ROAS 反馈调整下一日 - 业务价值:冷启动期 ROAS 提升 15-30%,新品 GMV 增量 30-60 万元/月;以月预算 100 万元计 = 年化收益 360-720 万元
三轨验证： - 成本：Google Ads API 数据采集费约 2000 元/月；LLM 推理（Qwen2.5-72B）约 3000 元/月；人力投入（数据工程师 0.5 人月）约 2 万元一次性。 - 合规：需确保 Google Ads API 使用符合其服务条款（禁止自动化出价操纵）；数据存储需满足 GDPR（欧盟用户数据不跨境）；不涉及 Amazon 政策。 - 风险：冷启动期若 LLM 推理错误可能导致预算浪费（约 5-10% 预算损失）；过度优化可能触发 Google 反欺诈审查；竞品可能通过监测投放节奏反向推断策略。
- 业务问题:母婴品牌同投 Google Shopping + Meta DPA,每周需调整两渠道预算比例,但 marginal ROAS 随节促(618/双11)动态变化 - 数据要求:跨渠道历史 ROAS + CPC/CPM + 竞品节奏数据 - DARA 配置:T = 渠道数(2-5);Phase 1 LLM 读历史 + 竞品输出初始权重;Phase 2 实时 ROAS 反馈精调,目标"边际 ROAS 等价" - 业务价值:跨渠道 ROAS 提升 10-20%,大盘 GMV 增量 5-8%;以中型品牌月广告 500 万元计 = 年化增量 600-1200 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

难处:论文无官方代码,GRPO-Adaptive 需基于 TRL 库自行实现
难处:LLM 微调需大量历史数据 + RL 训练经验
难处:Phase 2 实时反馈需要 Google/Meta Ads API 集成

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（80 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/dara_agentic_mmm_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-DARA-Agentic-MMM-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DARA-lite: 双阶段 LLM 广告预算分配骨架
论文 arXiv:2601.14711 (WWW 2026, 阿里巴巴)
注: 实际部署需要 OpenAI API 或本地 LLM (Qwen2.5/DeepSeek-R1) + TRL.GRPOTrainer
本骨架使用纯规则模拟 LLM 决策,验证 算法骨架。
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass
class AdChannel:
    name: str
    budget: float
    actual_roas: float


def phase1_reasoner(history: List[AdChannel], total_budget: float, channels: List[str]) -> Dict[str, float]:
    """Few-shot Reasoner: 历史数据 → 初始预算分配
    简化版: 按历史 ROAS 比例分配(实际生产替换为 LLM 调用)
    """
    roas_by_channel: Dict[str, float] = {}
    for h in history:
        roas_by_channel[h.name] = roas_by_channel.get(h.name, 0.0) + h.actual_roas
    counts = {c: sum(1 for h in history if h.name == c) for c in channels}
    avg_roas = {c: roas_by_channel.get(c, 1.0) / max(counts.get(c, 1), 1) for c in channels}
    total_roas = sum(avg_roas.values()) or 1.0
    return {c: total_budget * avg_roas[c] / total_roas for c in channels}


def phase2_optimizer(
    allocation: Dict[str, float],
    feedback: Dict[str, float],
    total_budget: float,
    learning_rate: float = 0.1,
) -> Dict[str, float]:
    """Fine-grained Optimizer: 实时 ROAS 反馈 → 精调
    目标: 各渠道边际 ROAS 趋于相等
    """
    if not feedback:
        return allocation

    avg_roas = sum(feedback.values()) / len(feedback)
    new_alloc = {}
    for c, b in allocation.items():
        roas = feedback.get(c, avg_roas)
        delta = (roas - avg_roas) * learning_rate * b
        new_alloc[c] = max(b + delta, 100.0)

    total = sum(new_alloc.values())
    return {c: v * total_budget / total for c, v in new_alloc.items()}


def simulate_marginal_roas(allocation: Dict[str, float], base_roas: Dict[str, float], saturation: float = 1000.0) -> Dict[str, float]:
    """模拟边际 ROAS 衰减(实际场景从 Ads API 拉取)"""
    return {c: base * (saturation / (saturation + allocation[c])) for c, base in base_roas.items()}


def main() -> None:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.14711 — DARA: Few-shot Budget Allocation in Online Advertising via In-Context Decision Making with RL-Finetuned LLMs
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：近 3-5 周的时段级或渠道级 ROAS 数据、月度总预算、跨渠道 CPC 与 CPM、竞品节奏数据；时段数 T 可取 7（按周）或 24（按小时）或渠道数 2-5，并需要 Google 或 Meta Ads API 提供在线反馈。

**输出**：各时段或渠道的预算分配向量（Phase 1 初始分配与 Phase 2 逐步精调后的最终分配），交投放团队按日执行并持续回收反馈。

## 执行步骤

1. 汇总近 3-5 周时段或渠道级 ROAS 与月度总预算
2. 用 Phase 1 推理器读历史生成初始预算分配向量
3. 按日执行分配并回收真实 ROAS 反馈
4. 用 Phase 2 优化器按各渠道边际 ROAS 趋等目标精调分配
5. 迭代更新直至边际 ROAS 收敛
6. 输出最终分配向量与执行建议

## 边界与不做

- 何时不用：没有 Ads API 接入、或历史数据短于 3 周时不可用；已具备成熟 MMM 参数时不必走冷启动路径。
- 能力边界：产出的是分配决策与训练骨架，实际出价下发由平台 API 侧完成；论文无官方代码，GRPO-Adaptive 需自行基于 TRL 实现。
- 合规边界：须遵守 Google 与 Meta Ads API 服务条款，禁止用于自动化出价操纵；冷启动期 LLM 误判可能造成约 5-10% 预算损失，建议设损失上限与人工复核。

## 技能关联

- **前置**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Generative-Audience-LLM-Auction.html、Skill-Generative-Audience-LLM-Auction、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-DARA-Agentic-MMM-Optimizer

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-DARA-Agentic-MMM-Optimizer`