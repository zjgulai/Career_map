---
name: "p2s-raptor-hierarchical-rag"
title: "RAPTOR - 递归抽象树型分层检索"
description: "触发词：分层检索、抽象树、长文档合规问答、条款引用、递归摘要。何时不用：文档只有几页时普通检索或长上下文更简单；要按文档规模自动选路时用混合路由。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-RAPTOR-Hierarchical-RAG"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把几百页政策文档压成一棵抽象树，上层是主题摘要、叶节点是具体条款，提问时两层一起命中。"
user_try: "试试：把亚马逊 ToS 和 CPSC、FDA 文档建成抽象树，回答这款奶瓶清洗液能不能在亚马逊卖。"
whenToUse: "属于「业务工具实现」：文档长达数百页、需要同时命中共性主题与具体条款时用；若文档很短，普通检索或长上下文更简单；若要按文档规模自动选路，用混合路由技能。"
workflow: "按 150-300 tokens 切分文档，避免在句子中间截断并保留标题章节信息 → 对切分块做嵌入，用降维加软聚类把相关块归组 → 对每组生成摘要，递归向上构建抽象树 → 检索时同时命中摘要层与具体条款层 → 输出答案并附上条款号与数值标准作为引用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RAPTOR - 递归抽象树型分层检索

## ① 解决的问题

研究助理面临长文档越搜越散——层级RAG将检索耗时从20分降到4分，年化省10万元

## ② 核心算法逻辑

RAPTOR（Recursive Abstractive Processing for TreeOrganized Retrieval） 将长文档转化为一棵"抽象树"：

## ③ 业务应用场景

业务背景：亚马逊卖家政策（ToS）文档长达 200+ 页，覆盖商品安全法规、禁售品类、广告规则、FBA 操作手册。母婴类目尤其复杂（儿童安全法规 CPSC、FDA 婴儿食品标准）。合规团队每天需要回答"这款奶瓶清洗液能在亚马逊卖吗？"类问题，人工核查耗时 2-4 小时/问题。
RAPTOR 方案： 1. 将亚马逊 ToS + CPSC 法规 + FDA 标准文档构建 RAPTOR 树 2. 摘要层覆盖"禁售化学品"、"婴儿食品标准"等主题（全局） 3. 叶节点保留具体条款号和数值标准（细节） 4. 用户提问时，Collapsed Tree 同时命中合规总结 + 具体条款
量化 ROI： | 指标 | Before | After | 提升 | |---|---|---|---| | 合规问题响应时间 | 2-4 小时 | 3-5 分钟 | 95% 降低 | | 条款引用准确率 | 70%（人工记忆） | 91% | +30% | | 合规团队人力 | 4人 | 1.5人 | 节省 $180K/年 | | ToS 违规处罚风险 | 基准 | 降低 60% | |

## ④ 输入数据要求

推荐块大小：150-300 tokens（语义完整段落）
避免在句子中间截断（配合 `Skill-Semantic-Chunking-Strategy`）
标题/章节信息保留在块内（如 `[3.2 清洗规范] 奶瓶每次使用后...`）

## ⑤ 输出结果

推荐块大小：150-300 tokens（语义完整段落）
避免在句子中间截断（配合 `Skill-Semantic-Chunking-Strategy`）
标题/章节信息保留在块内（如 `[3.2 清洗规范] 奶瓶每次使用后...`）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（425 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/raptor_hierarchical_rag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-RAPTOR-Hierarchical-RAG.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RAPTOR - 递归抽象树型分层检索系统
arXiv: 2401.18059 (RAPTOR, Stanford, ICLR 2024)

实现要点：
1. 文档分块 -> embedding
2. UMAP 降维 + GMM 软聚类
3. LLM 生成摘要（mock）
4. 递归构建抽象树
5. Collapsed Tree 向量检索

运行环境：Python 3.9+，无需外部 API（全 mock）
"""

import ast
import math
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class TreeNode:
    """RAPTOR 树节点"""
    node_id: str
    text: str
    embedding: List[float]
    level: int                          # 0=叶节点，1,2,...=摘要层
    children: List[str] = field(default_factory=list)   # 子节点 ID
    parent: Optional[str] = None
    cluster_id: Optional[int] = None


@dataclass
class RAPTORTree:
    """RAPTOR 树结构"""
    nodes: Dict[str, TreeNode] = field(default_factory=dict)
    root_id: Optional[str] = None
    max_level: int = 0

    def get_all_nodes(self) -> List[TreeNode]:
        return list(self.nodes.values())

    def get_nodes_by_level(self, level: int) -> List[TreeNode]:
        return [n for n in self.nodes.values() if n.level == level]


# ─────────────────────────────────────────────
# Mock 工具函数（生产环境替换为真实实现）
# ─────────────────────────────────────────────

def mock_embed(text: str, dim: int = 16) -> List[float]:
    """Mock embedding：用文本 hash 生成确定性向量"""
    random.seed(hash(text) % (2 ** 31))
    vec = [random.gauss(0, 1) for _ in range(dim)]
    norm = math.sqrt(sum(v * v for v in vec)) + 1e-9
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2401.18059 — RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：长文档（卡页示例：亚马逊 ToS 200+ 页、CPSC 与 FDA 标准）；卡页第 4 段给的输入要求是推荐块大小 150-300 tokens、不在句子中间截断、标题与章节信息保留在块内。

**输出**：分层检索结果与带引用的答案：卡页示例把合规问题响应时间从 2-4 小时降至 3-5 分钟、条款引用准确率从 70% 提升至 91%。

## 执行步骤

1. 按 150-300 tokens 切分文档，避免句中断开并保留标题章节信息
2. 对切分块做嵌入，用降维加软聚类把相关块归组
3. 对每组生成摘要，递归向上构建抽象树
4. 检索时同时命中摘要层与具体条款层
5. 输出答案并附上条款号与数值标准作为引用

## 边界与不做

- 数据不满足时不用：文档短、结构混乱或没有可靠分块信息时，抽象树反而引入噪声，先用普通检索。
- 能力边界：本卡产出分层索引与检索结果，不替代合规人员的最终判断；摘要可能损失细节，关键条款需回原文核验。

## 技能关联

- **前置**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy
- **延伸**：Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **可组合**：Skill-HyDE-Hypothetical-Document.html、Skill-HyDE-Hypothetical-Document、Skill-RAG-Reranking-CrossEncoder.html、Skill-RAG-Reranking-CrossEncoder、Skill-RAPTOR-Hierarchical-RAG

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-RAPTOR-Hierarchical-RAG`