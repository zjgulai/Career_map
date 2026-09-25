---
name: "p2s-agent-cost-optimization-budget-control"
title: "Agent 成本优化与预算管控 — 让 LLM Agent 可持续运行的 Token 经济学"
description: "触发词：LLM 成本、Token 账单、预算管控、语义缓存、模型降级。何时不用：按步骤复杂度设计模型路由走「上下文感知模型路由」；提升单次推理速度走「投机解码」。安全边界：缓存竞品价格等第三方数据须遵守平台数据使用与反爬条款，标注数据时间戳并设 TTL，避免用过期价格定价。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-Agent-Cost-Optimization-Budget-Control"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "API 账单失控时，用语义缓存和模型降级把成本压下来，再把 Token 预算按业务价值分给各个 Agent。"
user_try: "试试：帮我分析这个月的 LLM 调用日志，看看哪些请求可以缓存、哪些可以降级到小模型。"
whenToUse: "当账单超预算、需要系统级省钱手段（缓存、降级、按 ROI 分配预算）时用；若要优化的是单次调用该用哪个模型，用「上下文感知模型路由」；若目标是推理速度，用「投机解码」。"
workflow: "采集 LLM 调用日志（prompt、response、Token 数） → 对相似请求建立语义缓存并设 TTL 与时间戳 → 按请求复杂度把简单请求降级到小模型 → 按业务 ROI 给各 Agent 分配 Token 预算 → 监控成本与质量，超阈值强制直连刷新"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 成本优化与预算管控 — 让 LLM Agent 可持续运行的 Token 经济学

## ① 解决的问题

技术负责人面临"LLM API费用失控每月账单超预算但不知道哪里可以优化"——语义缓存+模型动态降级将LLM运行成本降低40-70%，年化节省$1.4万-$6.2万

## ② 核心算法逻辑

解决「AI Agent 跑一个月就发现 LLM Token 账单超预算，不得不砍掉功能」的业务问题。

## ③ 业务应用场景

场景A：定价 Agent 月账单从 $3000 降到 $900 - 业务问题：动态定价 Agent 每天调用 GPT-4 分析竞品价格 2000 次，月费 $3000，CFO 要求砍半 - 数据要求：历史 LLM 调用日志（含 prompt/response/Token数）+ 业务决策结果标注 - 方案：对相似竞品分析请求做语义缓存（命中率约 45%）+ 简单价格比较降级到 GPT-3.5（占 60% 调用量） - 预期产出：月 Token 成本从 $3000 → $850，决策质量下降 < 2%，年化节省 $25,800
三轨验证： - 成本：向量数据库（如 Pinecone）月费约 $200-500，开发人力约 2 人周（$3,000），总投入约 $3,500-5,000；年化节省 $25,800，ROI 约 5-7 倍。 - 合规：缓存竞品价格数据需注意反爬协议和 Amazon 数据使用条款，避免缓存过期价格导致定价违规；建议缓存 TTL 设为 24 小时，并标注数据时间戳。 - 风险：若缓存命中率过高（>60%），可能导致定价 Agent 对市场变化反应滞后，错失价格调整窗口；建议设置强制刷新机制（每 10 次请求至少 1 次直连 LLM）。
场景B：多 Agent 系统预算统一管控 - 业务问题：客服/库存/广告三个 Agent 各自调用 LLM，月底总账单 $8000，不知道哪个 Agent 在烧钱 - 数据要求：各 Agent 执行日志 + 业务价值评估（每次调用带来多少收益） - 方案：统一 Token Budget Scheduler，按 ROI 分配预算，广告 Agent（ROI 最高）优先 - 预期产出：同等预算 $5000/月，通过优先级重排后总业务价值提升 35%，年化减少浪费 $36,000

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境年 GMV $500 万规模团队，Agent LLM 月均费用 $3000-8000，实施语义缓存+模型降级后节省 40-65%，年化节省 $14,400-62,400；同时 Token 预算管控防止「月底透支停用」导致的运营事故
实施难度：⭐⭐⭐☆☆（语义缓存需要向量数据库，其余均为代码改动）
优先级：⭐⭐⭐⭐⭐（Agent 规模化运营的必选项，不做则 LLM 成本随规模线性增长，很快变得不可持续）
投资回收期：通常 4-6 周（缓存数据积累后效果快速显现）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（239 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agent_cost_optimization_budget_control` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-Cost-Optimization-Budget-Control.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent 成本优化框架：语义缓存 + 模型降级 + Token 预算管控
"""
import hashlib
import math
import random
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# ============ 1. 语义缓存（简化版，使用余弦相似度） ============

def simple_embed(text: str) -> List[float]:
    """简化版文本向量化（生产用 text-embedding-3-small）"""
    # 使用字符频率作为特征（仅用于演示）
    vocab = "abcdefghijklmnopqrstuvwxyz0123456789 "
    text_lower = text.lower()
    vec = [text_lower.count(c) / max(len(text_lower), 1) for c in vocab]
    return vec


def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x ** 2 for x in a))
    norm_b = math.sqrt(sum(x ** 2 for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


class SemanticCache:
    """语义缓存：相似请求直接返回缓存结果"""
    
    def __init__(self, similarity_threshold: float = 0.92):
        self.threshold = similarity_threshold
        self.cache: List[Tuple[List[float], str, str]] = []  # (embedding, prompt, response)
        self.hits = 0
        self.misses = 0
    
    def get(self, prompt: str) -> Optional[str]:
        emb = simple_embed(prompt)
        for cached_emb, cached_prompt, cached_response in self.cache:
            sim = cosine_similarity(emb, cached_emb)
            if sim >= self.threshold:
                self.hits += 1
                return cached_response
        self.misses += 1
        return None
    
    def put(self, prompt: str, response: str):
        emb = simple_embed(prompt)
        self.cache.append((emb, prompt, response))
    
    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0


# ============ 2. 动态模型降级（Cascade） ============
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2305.05176 — FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：需历史 LLM 调用日志（含 prompt、response、Token 数与业务决策结果标注）、各 Agent 的执行日志与业务价值评估，调用级粒度。

**输出**：产出成本优化方案与预算分配表（卡页示例：月账单 3000 美元降至 850 美元、决策质量下降小于 2%）、节省金额与质量对照、缓存命中率与降级比例，供技术负责人与财务决策。

## 执行步骤

1. 汇总 LLM 调用日志与业务决策结果标注
2. 建立语义缓存并设定 TTL 与数据时间戳
3. 降级简单请求到小模型，保留复杂请求走强模型
4. 分配各 Agent 的 Token 预算（按业务 ROI）
5. 监控质量与成本，设置强制直连刷新机制

## 边界与不做

- 调用量小、缓存命中率上不去时，缓存改造投入不划算
- 只产出优化策略与预算规则，不直接改线上模型配置，降级上线须 A/B 验证质量
- 缓存第三方数据须遵守数据使用条款，并标注数据时间戳与 TTL
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agent-ROI-Measurement-Framework.html、Skill-Agent-ROI-Measurement-Framework、Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Agent-ROI-Measurement-Framework.html、Skill-Agent-ROI-Measurement-Framework、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **可组合**：Skill-Agent-ROI-Measurement-Framework.html、Skill-Agent-ROI-Measurement-Framework、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Agent-Cost-Optimization-Budget-Control

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Cost-Optimization-Budget-Control`