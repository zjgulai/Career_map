---
name: "p2s-tokenpilot-lifecycle-context-eviction"
title: "TokenPilot生命周期感知上下文驱逐 — 双粒度上下文管理：摄入压实+驱逐调度"
description: "触发词：上下文驱逐、摄入压实、KV-Cache 命中、长会话、成本反弹。何时不用：纯摘要压缩走「上下文 Token 压缩」；预算分配走「动态上下文预算分配」。安全边界：驱逐不得丢失合规与决策关键记录，驱逐规则须可审计并可回放。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-TokenPilot-Lifecycle-Context-Eviction"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "长会话里已完成步骤的内容一直占着上下文时，边摄入边压实、完成即驱逐，成本降下来缓存还不失效。"
user_try: "试试：我们每轮品类分析要 30 多轮、上下文超 64K，帮我设计摄入压实加驱逐的方案。"
whenToUse: "当长会话（卡页称 20 轮以上）或高频调用（每天 100 次以上）导致上下文成本高、传统压缩又破坏前缀缓存时用；若只需摘要压缩，用「上下文 Token 压缩」；若只调预算分配，用「动态上下文预算分配」。"
workflow: "分析工具响应的噪声模式，建立摄入压实规则 → 摄入时剥离 HTML 标签与冗余字段 → 把变化的工具定义移到 Prompt 末尾稳定前缀 → 标记已完成步骤为可驱逐并在阶段结束后批量驱逐 → 监控 KV-Cache 命中率、成本与响应延迟"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TokenPilot生命周期感知上下文驱逐 — 双粒度上下文管理：摄入压实+驱逐调度

## ① 解决的问题

传统上下文压缩破坏KV-Cache前缀导致缓存失效反而增加成本——TokenPilot摄入感知压实+生命周期驱逐在保持缓存前缀稳定的同时将成本降低61-87%，远超传统压缩的20-50%（2026 arXiv:2606.17016）

## ② 核心算法逻辑

反直觉洞察：现有上下文压缩方法（截断/摘要/滑动窗口）都在做文本变换，而文本变换有一个致命的副作用：破坏前缀缓存一致性。LLM推理框架（vLLM/SGLang）通过KVCache缓存公共前缀来加速推理，一旦前缀被修改，所有缓存失效，反而增加成本。TokenPilot的反直觉设计：上下文管理的首要约束不是"压缩多少"，而是"不破坏缓存前缀"。在这个约束下，成本降低6187%，而非传统压缩的2040%。

## ③ 业务应用场景

- 业务问题：母婴品牌MAS进行完整品类分析需要30+轮对话，每轮都需要处理大量工具调用结果（Amazon API/财务模型/合规检查），累积上下文超过64K tokens，API成本每次$0.65，月调用500次=$325 - TokenPilot方案： 1. 摄入时剥离Amazon API响应中的HTML标签和冗余字段（减少30%噪声） 2. 将变化的工具定义移到Prompt末尾，固定前缀→KV-Cache命中率95%+ 3. 已完成的竞品分析步骤标记为completed→evictable，在分析完成后批量驱逐 - 预期产出：连续模式下成本从$0.65降至$0.084/次（-87%），月
- 业务问题：Prime Day期间MAS连续运行48小时监控100个SKU的实时数据，会话中累积的历史数据超过128K tokens，导致后期响应延迟超过8秒 - TokenPilot机制：已完成监控窗口的数据标记evictable，只保留：当前活跃窗口+关键决策记录+未解决告警。48小时后上下文维持在20K tokens以内 - 预期产出：响应延迟从8秒降至1.5秒，整个大促期间成本降低61%
三轨验证 | 成本轨：月均成本1200元（AI模型调用费800元/月，人工审核12小时/月×50元/小时=600元，系统维护200元/月），ROI周期3个月 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》，需建立Agent决策日志可追溯机制，满足海关备案要求 | 风险轨：模型幻觉导致备货偏差（概率8%），可通过人工二次审核+历史数据对标降低；多Agent协同延迟风险（概率5%），需设置3秒超时机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月500次长会话MAS分析（每次30+轮），TokenPilot将成本从$0.65降至$0.084（连续模式-87%），月节省$283，年化$3396；同时响应延迟降低60%提升用户体验；系统成本$3万（主要是集成工作），ROI≈1100%
实施难度：⭐⭐⭐☆☆（摄入压实规则工程量适中；生命周期驱逐需要修改Agent框架的上下文管理接口；已有开源实现LightMem2可参考）
优先级：⭐⭐⭐⭐⭐（上下文成本是MAS最大的可见成本，TokenPilot是目前最高效的解决方案之一，且2026年6月16日刚发布，第一批工程化实践机会）
适用规模：长会话（>20轮）或高并发（>100次/天）的MAS系统
数据依赖：需要分析工具响应的典型噪声模式（一次性建立），无需历史数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（350 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/tokenpilot_lifecycle_context_eviction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-TokenPilot-Lifecycle-Context-Eviction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TokenPilot双粒度上下文管理系统
功能：摄入感知压实 + 生命周期感知驱逐 + KV-Cache友好优化
基于 arXiv:2606.17016 (2026-06-16)
"""
import re
import hashlib
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class SegmentState(Enum):
    ACTIVE = "active"           # 当前任务仍需要该片段
    COMPLETED = "completed"     # 步骤已完成但待确认驱逐
    EVICTABLE = "evictable"     # 残差效用过期，可安全驱逐


@dataclass
class ContextSegment:
    """上下文片段（含生命周期状态）"""
    seg_id: str
    content: str
    segment_type: str           # 'tool_result', 'reasoning', 'conclusion', 'system'
    created_turn: int
    last_referenced_turn: int
    state: SegmentState = SegmentState.ACTIVE
    citation_count: int = 0     # 被后续推理引用次数
    is_critical: bool = False   # 关键片段（告警/决策）永不驱逐

    @property
    def token_count(self) -> int:
        return max(len(self.content) // 4, 1)

    def compute_residual_utility(self, current_turn: int) -> float:
        """计算残差效用"""
        if self.is_critical:
            return 1.0
        if self.state == SegmentState.EVICTABLE:
            return 0.0

        recency = 1.0 / max(current_turn - self.last_referenced_turn + 1, 1)
        citation_bonus = min(self.citation_count * 0.1, 0.3)
        type_weight = {
            'system': 1.0,
            'conclusion': 0.8,
            'reasoning': 0.5,
            'tool_result': 0.3,
        }.get(self.segment_type, 0.5)

        return min(recency * type_weight + citation_bonus, 1.0)


class IngestionAwareCompactor:
    """
    摄入感知压实器（全局层）
    在内容进入上下文之前就消除噪声，稳定前缀
    """
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2606.17016 — TokenPilot: Cache-Efficient Context Management for LLM Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需长会话的工具调用响应样本与噪声模式、Agent 上下文管理接口、当前上下文长度与成本数据，会话与轮次级粒度。

**输出**：产出双层上下文管理方案与效果对比（卡页记录成本 -87%、响应延迟 8 秒降至 1.5 秒、缓存命中率 95% 以上），供 MAS 平台与业务团队使用。

## 执行步骤

1. 分析工具响应噪声模式并建立摄入压实规则
2. 剥离标签与冗余字段（摄入阶段）
3. 移动变化的工具定义到 Prompt 末尾，稳定缓存前缀
4. 标记已完成步骤为可驱逐并批量驱逐
5. 监控缓存命中率、上下文体量与成本变化

## 边界与不做

- 会话短、上下文远未触顶时，驱逐机制收益有限
- 只管理上下文生命周期，不改变工具与业务逻辑
- 驱逐不得丢弃合规与关键决策记录，规则须可审计回放
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-AdaCtx-Dynamic-Context-Budget-Allocation.html、Skill-AdaCtx-Dynamic-Context-Budget-Allocation、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-RCR-Router-Role-Aware-Context-Routing.html、Skill-RCR-Router-Role-Aware-Context-Routing
- **延伸**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-AdaCtx-Dynamic-Context-Budget-Allocation.html、Skill-AdaCtx-Dynamic-Context-Budget-Allocation、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-RCR-Router-Role-Aware-Context-Routing.html、Skill-RCR-Router-Role-Aware-Context-Routing
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-RCR-Router-Role-Aware-Context-Routing.html、Skill-RCR-Router-Role-Aware-Context-Routing、Skill-TokenPilot-Lifecycle-Context-Eviction

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：10-MAS　·　源卡：`Skill-TokenPilot-Lifecycle-Context-Eviction`