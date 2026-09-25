---
name: "p2s-skill-dependency-path-planner"
title: "Skill 依赖路径规划器 — BFS/Dijkstra 学习路径导航"
description: "触发词：技能依赖、学习路径、前置关系、最短路径、培训规划。何时不用：做岗位可替代性与人力 ROI 评估用「AI Agent 人力替代计算器」；做技能选取与匹配用「Agent Skill 运行时编排器」。安全边界：前置关系错误会导致路径不完整，依赖图须每季度人工审核后再对外发布学习路径。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-012"
l3_business: "培训与招聘支持"
l3_all: "培训与招聘支持 / 技能版本"
l1_l2_l3: "经营管理/经营与组织/培训与招聘支持"
p2s_card_id: "Skill-Skill-Dependency-Path-Planner"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "想学某个高级技能时，自动算出该先学哪些基础，并给出一条最短学习路径。"
user_try: "试试：我想学会多仓协同调拨优化，帮我排一条最短的前置学习路径和并行学习建议。"
whenToUse: "当员工或用户要掌握某个技能、需要知道前置学习顺序时用本技能；要做岗位可替代性与人力 ROI 评估，用「AI Agent 人力替代计算器」；只看技能版本演进，用技能版本类技能。"
workflow: "装载技能依赖图（技能到前置技能的边） → 从目标技能反向追溯全部前置链 → 取最短路径并重建正向学习顺序 → 识别可并行学习的并行分支并估算总时长"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill 依赖路径规划器 — BFS/Dijkstra 学习路径导航

## ① 解决的问题

学习用户面临"想掌握某个高级Skill不知道要先学哪些基础"——BFS依赖路径规划将最优学习路径生成时间从人工梳理1天压缩至毫秒级自动输出

## ② 核心算法逻辑

核心思想：将 726 个 Skill 的 prerequisite 依赖关系建模为有向无环图（DAG），给定目标 Skill，用 BFS 找最短学习路径，同时识别可并行学习的 Skill 组（拓扑排序分层），输出「最优学习序列 + 可并行加速路径」。

## ③ 业务应用场景

- 业务问题：供应链新员工想学会"多仓协同调拨优化"（`Skill-Multi-Echelon-Inventory`），但不知道需要先学哪些基础知识，可能走弯路浪费 3 周时间 - 数据要求：所有 Skill 的 `④ 技能关联` 中的 `前置（prerequisite）` 关系（已结构化存储） - 预期产出：最短学习路径 `需求预测基础`→`库存理论`→`单仓优化`→`多仓协同`，总时长 12h；并行路径建议：前 2 个 Skill 可同时学习，节省 3h - 业务价值：新员工从摸索 3 周 → 有计划 10 天掌握核心，缩短上手时间 50%，节省培训成本约 2 万元/人
三轨验证： - 成本：数据采集成本极低（已有 13,893 条边结构化存储）；计算资源为单机 Python 标准库，毫秒级完成；人力投入约 0.5 人天进行接口对接 - 合规：不涉及用户隐私数据，仅处理 Skill 元数据；无 GDPR/CCPA 风险；符合 Amazon 内部知识管理政策 - 风险：若 prerequisite 关系存在错误（如遗漏关键前置），可能导致路径不完整，员工学习后仍无法掌握目标 Skill；建议增加人工审核环节，每季度更新依赖图
- 业务问题：Playbook 上的 726 个 Skill 之间关联复杂，用户不知道从哪里开始，导航体验差 - 数据要求：`skills_graph_report.md` 中已有 13,893 条边的图数据 - 预期产出：在 Skill 详情页增加「学习路径」组件，自动展示「学这个 Skill 前需要」的 Top-3 前置链路，点击可展开完整路径 - 业务价值：用户平均停留时长预计提升 40%，Skill 跳转率（漏斗深度）从 1.2 页 → 2.8 页，年化内容消费价值提升约 15 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：每位员工年均节省路径摸索时间 20h × 200 元/h × 10 人 = 4 万元；Playbook 导航体验提升带来用户留存增量约 5 万元。总年化约 9 万元
实施难度：⭐⭐☆☆☆（纯 Python 标准库，无外部依赖；图构建需解析 Skill 的 prerequisite 字段）
优先级：⭐⭐⭐⭐☆（依赖 Skill 关联数据已存在，实现成本极低）
评估依据：算法本身（BFS + 拓扑排序）是经典图论，O(V+E) 时间复杂度，726 个 Skill 毫秒级完成

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（185 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill 依赖路径规划器
BFS + 拓扑排序分层，找最短学习路径和可并行 Skill 组
"""
from collections import deque, defaultdict
from typing import List, Dict, Optional, Tuple, Set


class SkillDependencyGraph:
    """Skill 依赖有向无环图"""

    def __init__(self):
        self.edges: Dict[str, List[str]] = defaultdict(list)   # prerequisite → dependent
        self.reverse_edges: Dict[str, List[str]] = defaultdict(list)  # dependent → prerequisites
        self.nodes: Set[str] = set()

    def add_prerequisite(self, skill: str, prerequisite: str):
        """添加依赖关系：prerequisite 必须在 skill 之前学"""
        self.edges[prerequisite].append(skill)
        self.reverse_edges[skill].append(prerequisite)
        self.nodes.add(skill)
        self.nodes.add(prerequisite)

    def find_shortest_path(self, target: str) -> List[str]:
        """
        从所有无前置的 Skill 出发，BFS 找到达 target 的最短路径
        返回：学习路径列表（含 target）
        """
        if target not in self.nodes:
            return [target]

        # BFS 反向追溯：从 target 倒推前置链
        visited = set()
        parent: Dict[str, Optional[str]] = {target: None}
        queue = deque([target])

        while queue:
            current = queue.popleft()
            if current in visited:
                continue
            visited.add(current)
            for prereq in self.reverse_edges.get(current, []):
                if prereq not in parent:
                    parent[prereq] = current
                    queue.append(prereq)

        # 找到所有根节点（无前置的 Skill）
        roots = [n for n in visited if not self.reverse_edges.get(n)]
        if not roots:
            roots = [target]

        # 从最近的根到 target 重建路径（取最短）
        best_path = None
        for root in roots:
            # 正向 BFS 找 root → target 路径
            path_parent: Dict[str, Optional[str]] = {root: None}
            q = deque([root])
            found = False
            while q and not found:
                node = q.popleft()
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2003.04960，但该号在 arXiv 上是《Curriculum Learning for Reinforcement Learning Domains: A Framework and Survey》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：已结构化的技能前置关系图（如卡页口径下 skills_graph_report.md 中约 13,893 条边）与目标技能 ID。

**输出**：从根节点到目标技能的最短学习路径、并行学习建议与预计总时长；供培训负责人与学习者使用。

## 执行步骤

1. 装载技能依赖图（技能到前置技能的边）
2. 从目标技能反向追溯全部前置链
3. 取最短路径并重建正向学习顺序
4. 识别可并行学习的并行分支并估算总时长

## 边界与不做

- 数据不满足：前置关系缺失或依赖图有环时路径不可信，先清洗依赖图。
- 何时不用：做岗位替代与人力 ROI 评估用「AI Agent 人力替代计算器」；做技能选取与匹配用「Agent Skill 运行时编排器」；只是查技能定义不必用本技能。
- 能力边界：只输出学习顺序建议，不评估学习效果，也不替代培训内容制作。

## 技能关联

- **前置**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-Business-Problem-to-Skill-Retrieval.html、Skill-Business-Problem-to-Skill-Retrieval、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking
- **延伸**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking
- **可组合**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking、Skill-Skill-Dependency-Path-Planner

---

> 分类：经营管理/经营与组织/培训与招聘支持　·　技术族：16-智能体工程　·　源卡：`Skill-Skill-Dependency-Path-Planner`