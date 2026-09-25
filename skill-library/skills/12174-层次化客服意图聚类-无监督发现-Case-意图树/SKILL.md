---
name: "p2s-dialin-llm-case-intent-clustering"
title: "Dial-In LLM 层次化客服意图聚类 - 无监督发现 Case 意图树"
description: "触发词：意图聚类、意图树、Case 分拣、安全事件升级、无监督意图发现。何时不用：只要主题聚类不要意图命名用「BERTopic 主题建模」；本技能输出可路由的动宾意图标签。安全边界：过敏、急救等安全类意图命中必须立即人工介入，模型不得自行安抚或给出安全结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-113"
l3_business: "客诉聚类"
l3_all: "客诉聚类 / 业务工具实现"
l1_l2_l3: "业务运营/服务与体验/客诉聚类"
p2s_card_id: "Skill-DialIn-LLM-Case-Intent-Clustering"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "把字面很像但意图完全不同的客服对话聚成意图树，让退款、换货、咨询、投诉、安全事件各走各的路。"
user_try: "试试：用我们的历史 Case 对话聚出意图树，并把含过敏或急救字样的案例标成高优先级。"
whenToUse: "当对话字面相似但意图不同、需要无监督发现意图树并据此路由时用；只做主题发现不做意图命名用「BERTopic 主题建模」。"
workflow: "对历史 Case 对话做嵌入并用候选簇数集合迭代聚类 → 用 LLM 评估器判断每个簇的语义连贯性 → 用命名器生成动作加目标格式的意图标签 → 命中紧急前缀的案例自动推送高级客服"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dial-In LLM 层次化客服意图聚类 - 无监督发现 Case 意图树

## ① 解决的问题

客服主管面临来电诉求归类靠人工——意图聚类将分拣准确率提到92%，年化省9万元

## ② 核心算法逻辑

WFC 客服分诊的核心是"意图细分"——母婴 Case 复杂(退款/换货/咨询/投诉/物流/产品使用/安全升级),嵌入距离无法区分字面相似但意图截然不同的对话片段(如"宝宝用了这个奶粉一直哭" 可能是质量投诉或产品适配咨询). DialIn LLM 用 LoRA 微调小型 LLM 作为聚类"工具人"(Qwen2.57B / ChatGLM36B):① 连贯性评估器 判断簇语义一致性 ② 意图命名器 生成"动作目标"标签 ③ 迭代搜索自动

## ③ 业务应用场景

- 业务问题:母婴客服 Case 字面高度相似但意图截然不同 - "宝宝用了这个奶粉一直哭" → 可能是 质量投诉 或 产品适配咨询 - "我要换一罐" → 可能是 申请-换货 或 咨询-产品型号
现有 BERT 嵌入分类器对二者 cosine similarity 极高,分类错误率 30%+,导致 Case 错路由,客服效率低 - 数据要求:历史 Case 对话文本 10k-50k 条(月度积累即可) - Dial-In 配置: - LoRA 微调 Qwen2.5-7B 作 connector / evaluator(用论文 prompts) - 候选簇数 $N = \{5, 10, 20, 50\}$,迭代 5 轮 - 自动发现 5 大类意图树:`refund / exchange / consultation / complaint / safety_alert` - 训练下游轻量
- 业务问题:母婴产品安全事件(过敏/呛奶/缺陷)处理延迟超过 1 小时可能引发舆情危机(Amazon listing 下架 + 监管投诉). 现有客服系统按 FIFO 处理,安全事件淹没在常规 Case 中 - 数据要求:历史 Case + 已知安全事件案例库 - Dial-In 配置: - Role Separation: 客户发言中含 "过敏 / 呼吸困难 / 急救 / 红疹" → 映射高优先级簇 - 意图标签前缀规则: `投诉-安全` / `询问-过敏` / `申请-急救` 自动路由 - 触发条件:任意 case 命中 urgency 簇 → 1 分钟内推送 senior 客服 + 同

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

极易:GitHub 完整开源,中文原生数据集
易处:BGE-large-zh-v1.5 嵌入模型公开可用
难处:LoRA 微调 Qwen 2.5-7B 需 A100 × 1 训练 8-16 小时
难处:母婴垂类意图树需业务专家初始化(20-30 个簇)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（126 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_agent_llm/dialin_llm_case_intent_clustering` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-DialIn-LLM-Case-Intent-Clustering.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Dial-In LLM 母婴客服 Case 意图聚类骨架
论文 arXiv:2412.09049 (EMNLP 2025)
完整代码: github.com/mengze-hong/Dial-in-LLM
依赖: pip install sentence-transformers scikit-learn transformers
"""
from __future__ import annotations
from typing import Dict, List, Tuple


URGENCY_PREFIXES = ("投诉-安全", "询问-过敏", "申请-急救")


class DialInIntentClustering:
    def __init__(self, n_cluster_candidates: List[int] = None):
        self.n_candidates = n_cluster_candidates or [3, 5, 10, 20]

    def _coherence_score(self, sentences: List[str]) -> bool:
        """LLM 评估器:判断簇是否语义连贯
        生产: LoRA 微调 Qwen2.5-7B + prompt
        Stub: 用关键词重叠率近似
        """
        if len(sentences) < 2:
            return True
        words_per_sent = [set(s.split()) for s in sentences]
        common = words_per_sent[0]
        for ws in words_per_sent[1:]:
            common = common & ws
        return len(common) >= 1

    def _name_intent(self, sentences: List[str]) -> str:
        """LLM 命名器:生成"动作-目标"格式意图标签
        生产: ChatGLM3-6B + prompt
        Stub: 关键词模式匹配
        """
        joined = " ".join(sentences).lower()
        if any(kw in joined for kw in ["过敏", "红疹", "急救", "呼吸"]):
            return "投诉-安全"
        if any(kw in joined for kw in ["退款", "退货", "退掉"]):
            return "申请-退款"
        if any(kw in joined for kw in ["换货", "换一罐", "型号"]):
            return "申请-换货"
        if any(kw in joined for kw in ["怎么", "如何", "什么"]):
            return "咨询-使用"
        if any(kw in joined for kw in ["物流", "签收", "派送"]):
            return "询问-物流"
        return "其他-未分类"

    def _simple_cluster(self, sentences: List[str], n: int) -> Dict[int, List[str]]:
        """简化聚类(生产用 AgglomerativeClustering 或 KMeans)"""
        clusters: Dict[int, List[str]] = {i: [] for i in range(n)}
        for i, s in enumerate(sentences):
            cid = i % n
            clusters[cid].append(s)
        return clusters

    def _optimal_n(self, sentences: List[str]) -> Tuple[int, Dict[int, List[str]]]:
        """局部搜索最优簇数(论文核心公式)"""
        best_n, best_ratio, best_clusters = 0, -1.0, {}
        for n in self.n_candidates:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2412.09049 — Dial-In LLM: Human-Aligned LLM-in-the-loop Intent Clustering for Customer Service Dialogues

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史 Case 对话文本一万至五万条、候选簇数配置、意图前缀规则（投诉-安全、询问-过敏、申请-急救），可选业务专家初始化的意图簇。

**输出**：退款、换货、咨询、投诉、安全预警五大类意图树与每条 Case 的意图标签；命中紧急簇时推送高级客服并附上下文。

## 执行步骤

1. 对历史 Case 对话做嵌入并迭代多候选簇数聚类
2. 用 LLM 评估器判断每个簇的语义连贯性
3. 用命名器生成动作加目标格式的意图标签
4. 按前缀规则把安全类意图标为高优先级
5. 命中紧急簇时一分钟内推送高级客服并附上下文

## 边界与不做

- 何时不用：历史对话量不足或缺少业务专家初始化的意图树时，簇命名会失准
- 能力边界：只产出意图树与路由标签，不做赔付决策，也不替代人工对安全事件的处理

## 技能关联

- **前置**：Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA
- **延伸**：Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-DialIn-LLM-Case-Intent-Clustering

---

> 分类：业务运营/服务与体验/客诉聚类　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-DialIn-LLM-Case-Intent-Clustering`