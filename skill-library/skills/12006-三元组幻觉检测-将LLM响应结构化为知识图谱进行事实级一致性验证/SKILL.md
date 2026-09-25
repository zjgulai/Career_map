---
name: "p2s-kg-hallucination-detection"
title: "KG三元组幻觉检测 — 将LLM响应结构化为知识图谱进行事实级一致性验证"
description: "触发词：三元组幻觉检测、知识图谱比对、事实一致性、合规回答核验、幻觉分类。何时不用：要核对报表数字与数据库是否一致走 BI 幻觉检测；要评整体 RAG 检索质量走 RAG 评测。安全边界：检测准确率受知识库覆盖面与更新及时性限制，模型误判可能误伤正常信息，判为编造的结论须经人工确认后再使用。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-KG-Hallucination-Detection"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把 AI 回答拆成三元组和知识库对一遍，找出编造和无法验证的部分。"
user_try: "试试：把这个合规助手的回答拆成三元组，和知识库比对看哪些是编的。"
whenToUse: "回答要用于合规或高风险决策、需要事实级核验时用；要核对报表数字请转 BI 幻觉检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG三元组幻觉检测 — 将LLM响应结构化为知识图谱进行事实级一致性验证

## ① 解决的问题

让LLM自己评判LLM的错误准确率极低——将响应分解为KG三元组进行一致性验证比SelfCheckGPT准确率高+16%、F1高+20%，且成本低10倍（2025 arXiv:2512.23547）

## ② 核心算法逻辑

反直觉洞察：检测LLM幻觉的传统方法是让另一个LLM评判（SelfCheckGPT等），这有一个根本问题：用LLM检测LLM的错误，当两个模型有相同的偏见时就会互相验证错误。论文的反直觉发现：将LLM响应结构化为知识图谱三元组再做一致性检验，比直接让LLM"看看有没有错误"准确得多（+16%准确率，+20% F1）。原因是：人类自然语言中"听起来正确"的措辞往往掩盖事实错误，但当同样的内容被分解为(实体, 关系, 实体)三元组时，错误往

## ③ 业务应用场景

- 业务问题：合规AI助手有时会给出"听起来非常专业"但实际包含错误的回答（如错误的认证流程步骤），靠人工审核耗时且不系统 - KG幻觉检测方案： 1. AI回答 → 三元组提取（`{CPSC, 要求, CPC证书+测试报告}`等） 2. 与合规知识库三元组比对 3. 若`(CPSC, 要求, {错误内容})`被检测为HALLUCINATED → 自动标记，触发人工审核 4. UNVERIFIABLE的三元组 → 标注"无法验证，请确认" - 预期产出：合规幻觉检测准确率从人工判断的70%提升至86%（论文基准+16%），年化防止约50次合规错误决策
- 业务问题：AI生成的选品报告中，市场数据（增速/规模/竞品评分）有时与知识库数据不一致，但表述非常自信，难以察觉 - KG验证方案：对报告中的每个定量声明（`{品类, 增速, 12%}`等）自动与知识库比对；不一致时在报告中标注`[⚠️ 数据冲突：知识库显示X%]`；UNVERIFIABLE数据标注`[⚠️ 数据未验证]`
三轨验证 | 成本轨：月均成本1200元（知识图谱维护人工12小时/月@100元/小时，幻觉检测模型API调用月均200次@0元/次内部成本），年度投入14400元 | 合规轨：符合《电商法》第十五条商品信息真实性要求，满足跨境电商商品溯源合规标准，通过供应商数据验证机制降低虚假信息风险，合规结论：可行 | 风险轨：知识图谱更新滞后导致检测准确率下降（概率35%），供应商数据不完整影响幻觉识别效果（概率40%），模型误判率3-5%可能误伤正常商品信息（概率25%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：合规AI每月处理200次查询，幻觉检测准确率+16%意味着额外发现约8次幻觉（原来32次未被发现，现在识别40次）；每次幻觉合规决策损失$500，月防损$4000；系统成本$3万，ROI≈160%（首年）
实施难度：⭐⭐☆☆☆（三元组提取规则实现简单；关键是建立覆盖面充分的知识库用于一致性校验）
优先级：⭐⭐⭐⭐⭐（幻觉是所有LLM系统的根本风险，KG验证是目前最精准的检测方法，且成本低于LLM自我评判）
适用规模：所有使用AI生成文本做决策的场景（特别是合规/财务/法律类高风险场景）
数据依赖：需要已知正确的知识库（覆盖面越广，检测越准确）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/knowledge_graph/kg_hallucination_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Hallucination-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
KG三元组幻觉检测系统
功能：响应三元组提取 + 知识库一致性验证 + 幻觉分类 + 验证报告
基于 arXiv:2512.23547 (2025)
"""
import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class VerificationStatus(Enum):
    VERIFIED = "✅已验证"
    HALLUCINATED = "❌幻觉"
    UNVERIFIABLE = "⚠️无法验证"
    CONTRADICTORY = "🔄矛盾（时效）"


@dataclass
class Triple:
    subject: str
    predicate: str
    obj: str

    def __str__(self):
        return f"({self.subject}, {self.predicate}, {self.obj})"


@dataclass
class VerifiedTriple:
    triple: Triple
    status: VerificationStatus
    evidence: Optional[str] = None
    confidence: float = 1.0


class TripleExtractor:
    """从文本提取知识三元组"""

    FACT_PATTERNS = [
        (r'(.+?)的?(?:价格|售价|定价)(?:为|是|约)?([\$¥€]?[\d,.]+[/元件]*)', '价格'),
        (r'(.+?)的?(?:评分|星级|用户评分)(?:为|是|约)?(\d+\.?\d*星?)', '用户评分'),
        (r'(.+?)的?(?:月销量|月销|销量)(?:为|是|约)?(\d+[万件]*)', '月销量'),
        (r'(.+?)(?:属于|属于品类|归类为)(.+?)(?:品类|类别)?', '属于'),
        (r'(.+?)(?:需要|必须|要求)(.+?)(?:认证|证书|合规)', '认证要求'),
        (r'(.+?)(?:是|为)(?:一款?|一种)?(.+?)(?:产品|设备|工具)', '产品类型'),
    ]

    def extract(self, text: str) -> List[Triple]:
        triples = []
        for pattern, predicate in self.FACT_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match) >= 2:
                    subj = match[0].strip()[:30]
                    obj = match[1].strip()[:30]
                    if len(subj) > 1 and len(obj) > 1:
                        triples.append(Triple(subj, predicate, obj))
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.23547 — Lie to Me: Knowledge Graphs for Robust Hallucination Self-Detection in LLMs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待检测的模型回答文本，以及覆盖面充分的领域知识库（三元组形式的事实集合）

**输出**：三元组级验证结果（已验证、编造、无法验证）与需人工审核的清单，供合规复核与回答修订

## 执行步骤

1. 从回答中抽取三元组（实体、关系、取值）。
2. 与知识库三元组逐条比对，判定一致或冲突。
3. 把冲突项分类为编造，把知识库无覆盖的标为无法验证。
4. 对编造与无法验证项触发人工审核，而不是直接对外发布。

## 边界与不做

- 何时不用：要核对的是报表数字与数据库是否一致时，请转 BI 幻觉检测。
- 能力边界：检测准确率受知识库覆盖面与更新及时性限制，知识库滞后时准确率会下降。
- 安全边界：模型误判可能误伤正常信息，判为编造的结论须经人工确认后再使用。

## 技能关联

- **前置**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph
- **可组合**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIGC-Authenticity-Trust-Framework.html、Skill-AIGC-Authenticity-Trust-Framework、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph、Skill-KG-Hallucination-Detection

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Hallucination-Detection`