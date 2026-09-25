---
name: "p2s-rcr-router-role-aware-context-routing"
title: "RCR-Router角色感知上下文路由 — Token预算约束下的多Agent记忆子集动态分配"
description: "触发词：上下文路由、记忆子集、角色感知、Token 预算、噪声干扰。何时不用：预算总量如何在 Agent 间分配走「动态上下文预算分配」；把长历史压短走「上下文 Token 压缩」。安全边界：路由须保留审计日志，不得因评分误判漏掉合规相关记忆；用竞品价格做定价决策须遵守平台价格政策。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-RCR-Router-Role-Aware-Context-Routing"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每个 Agent 都塞进整个记忆库既费钱又干扰判断，改成按角色和任务阶段只给相关的那部分记忆。"
user_try: "试试：我们共享记忆库有 5000 条，帮我按四个 Agent 的角色把该看的记忆筛出来。"
whenToUse: "当共享记忆库条目多（卡页称 30 条以上）、Agent 角色多样（3 个以上）、全量下发导致 Token 超限或质量下降时用；若只调预算分配，用「动态上下文预算分配」；若压缩单条历史，用「上下文 Token 压缩」。"
workflow: "整理共享记忆库并标注角色与阶段标签 → 开发重要性评分器对记忆排序 → 按各 Agent 角色与阶段分配 Token 预算 → 路由相关记忆子集并过滤无关内容 → 随任务阶段迭代精炼，降低旧记忆权重"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RCR-Router角色感知上下文路由 — Token预算约束下的多Agent记忆子集动态分配

## ① 解决的问题

让所有Agent访问完整记忆库既浪费Token又引入噪声干扰——RCR-Router按角色和任务阶段动态选择语义相关记忆子集，在严格Token预算下回答质量提升13-22%（2025 arXiv:2508.04903）

## ② 核心算法逻辑

反直觉洞察：大多数MAS系统让每个Agent访问完整的共享记忆池——这看起来"信息最丰富"，实际上是一种浪费甚至有害：财务Agent看到的大量研究原始数据对它毫无用处（噪声），而合规Agent需要的法规细节却被稀释在海量市场数据中。RCRRouter的关键发现：按角色和任务阶段动态选择语义相关的记忆子集，不仅节省Token，还能提高回答质量（减少噪声干扰）。

## ③ 业务应用场景

- 业务问题：母婴MAS有一个包含5000条记忆的共享库（市场数据+法规文件+财务记录+品牌指南）。每次调用要给所有Agent传入完整记忆库，严重超出Token预算，而且Finance Agent收到大量无关的品牌指南信息，导致ROI计算时被不相关信息干扰 - RCR-Router方案： - Research Agent (阶段1)：路由市场数据+竞品记忆（B=2048） - Compliance Agent：路由法规文件+认证记录（B=1536） - Finance Agent (阶段2)：路由财务模板+历史ROI记录（B=1024） - Report Agent (阶段3)：路由所有Age
三轨验证： - 成本：显性成本包括角色标签库构建（约0.5人月）、重要性评分器开发（约1人月）、记忆库接口改造（约0.3人月）；计算资源增加约5%（路由评分开销），但Token节省19%可抵消；总实施成本约$3.5万 - 合规：路由逻辑不涉及用户隐私数据筛选，不触碰GDPR/CCPA红线；但需注意：若记忆库包含竞品价格数据，路由到Finance Agent用于定价决策时，需确保不触发Amazon价格操纵政策（不得使用竞品价格作为唯一定价依据） - 风险：次生风险包括：(1) 若重要性评分器误判，关键合规记忆未被路由到Compliance Agent，可能导致产品合规遗漏；(2) 路由日志可能暴
- 业务问题：Prime Day实时分析中，早期阶段的研究记忆（"吸奶器竞品分析"）在财务决策阶段仍被频繁路由，但此时最相关的是实时销售数据 - 迭代精炼机制：随着任务阶段推进，重要性评分自动降低旧研究数据的权重，提升实时数据权重；Agent在大促后期收到的上下文越来越聚焦于"当前销售状态+历史决策"，而非初期的"市场背景" - 预期产出：大促后期决策质量提升15%，Token消耗减少25%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月调用5000次MAS的平台，RCR-Router节省约20%Token（无关信息不传入Agent），同时提升关键Agent质量13-22%；年化Token节省约$600，质量提升间接减少错误决策成本更高；系统成本$4万，综合ROI≈200%（首年），后续年ROI持续提升
实施难度：⭐⭐⭐☆☆（规则基础版较简单；学习版重要性评分需要角色标签库；需要改造MAS的记忆访问接口）
优先级：⭐⭐⭐⭐☆（在记忆库>50条、Agent数>3的MAS中，无选择性地传入所有记忆会严重降低质量，RCR-Router是必要组件）
适用规模：共享记忆库>30条、多角色Agent（>3个不同角色）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（264 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/mas/rcr_router_role_aware_context_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-RCR-Router-Role-Aware-Context-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RCR-Router角色感知上下文路由系统
功能：Token预算分配 + 重要性评分 + 语义过滤 + 迭代上下文精炼
基于 arXiv:2508.04903 + 2602.06025 (2025-2026)
"""
import numpy as np
import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


class BudgetTier:
    LOW = "low"     # 简化检索，< 512 tokens
    MID = "mid"     # 标准检索，512-2048 tokens
    HIGH = "high"   # 深度检索，> 2048 tokens


@dataclass
class MemoryItem:
    """记忆库中的单条记忆"""
    item_id: str
    content: str
    source_agent: str
    task_stage: int         # 0=信息收集, 1=分析, 2=决策, 3=报告
    relevance_tags: List[str] = field(default_factory=list)  # 相关角色标签
    citation_count: int = 0         # 被引用次数
    creation_round: int = 0         # 创建轮次
    importance_score: float = 0.5   # 当前重要性分数（动态更新）

    @property
    def token_count(self) -> int:
        return max(len(self.content) // 4, 1)


class ImportanceScorer:
    """重要性评分器"""

    ROLE_TAG_MAP = {
        'research_agent': ['market', 'competitor', 'trend', '市场', '竞品', '增长'],
        'compliance_agent': ['regulation', 'cpsc', 'fda', 'compliance', '合规', '认证', '法规'],
        'finance_agent': ['roi', 'cost', 'revenue', 'financial', '成本', '利润', 'fba', '财务'],
        'report_agent': ['conclusion', 'recommendation', 'summary', '结论', '建议', '报告'],
    }

    STAGE_RELEVANCE = {
        0: ['market', 'competitor', '市场', '竞品'],    # 信息收集阶段
        1: ['analysis', 'trend', '分析', '趋势'],        # 分析阶段
        2: ['decision', 'roi', 'risk', '决策', 'ROI', '风险'],  # 决策阶段
        3: ['conclusion', 'summary', '结论', '建议'],   # 报告阶段
    }

    def score(self, item: MemoryItem, agent_role: str,
               task_stage: int, current_round: int) -> float:
        """计算记忆项对特定角色在特定阶段的重要性"""
        score = 0.5  # 基础分

        # 1. 角色相关性
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.04903 — RCR-Router: Efficient Role-Aware Context Routing for Multi-Agent LLM Systems with Structured Memory

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需共享记忆库条目（卡页示例 5000 条）、Agent 角色清单与任务阶段划分、各 Agent 的 Token 预算，记忆条目级与角色级粒度。

**输出**：产出各 Agent 的记忆路由方案与预算分配（卡页示例 2048、1536、1024）、Token 节省与回答质量对比（卡页记录质量提升 13-22%、Token 节省约 19-20%），供 MAS 编排与业务团队使用。

## 执行步骤

1. 整理共享记忆库并标注角色与任务阶段标签
2. 开发重要性评分器对记忆条目排序
3. 分配各 Agent 的 Token 预算（按角色与阶段）
4. 路由相关记忆子集并过滤无关干扰内容
5. 迭代精炼路由，降低旧记忆权重

## 边界与不做

- 记忆库条目很少或只有单一角色 Agent 时，全量下发更简单
- 评分器误判可能漏掉关键合规记忆，必须保留人工复核与审计日志
- 路由到定价用途的竞品数据使用须遵守平台价格政策
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-AdaCtx-Dynamic-Context-Budget-Allocation.html、Skill-AdaCtx-Dynamic-Context-Budget-Allocation、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-CASTER-Context-Aware-Model-Routing.html、Skill-CASTER-Context-Aware-Model-Routing、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Customer-Service-Intelligent-Escalation.html、Skill-MAS-Customer-Service-Intelligent-Escalation
- **延伸**：Skill-CASTER-Context-Aware-Model-Routing.html、Skill-CASTER-Context-Aware-Model-Routing、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Customer-Service-Intelligent-Escalation.html、Skill-MAS-Customer-Service-Intelligent-Escalation
- **可组合**：Skill-CASTER-Context-Aware-Model-Routing.html、Skill-CASTER-Context-Aware-Model-Routing、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Customer-Service-Intelligent-Escalation.html、Skill-MAS-Customer-Service-Intelligent-Escalation、Skill-RCR-Router-Role-Aware-Context-Routing

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：10-MAS　·　源卡：`Skill-RCR-Router-Role-Aware-Context-Routing`