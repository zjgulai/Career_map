---
name: "p2s-adactx-dynamic-context-budget-allocation"
title: "AdaCtx动态上下文预算分配 — 子Agent间Token预算自适应调度与边际价值追踪"
description: "触发词：Token 预算分配、上下文预算、子 Agent 调度、边际价值、Shapley 归因。何时不用：预算已定、只需压缩单条长历史走「上下文 Token 压缩」；按角色筛选记忆子集走「角色感知上下文路由」。安全边界：分配依据须可审计（保留决策日志），不得用预算手段隐藏或篡改 Agent 的关键结论。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-AdaCtx-Dynamic-Context-Budget-Allocation"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "多个 Agent 共用一份 Token 预算时，按各自的实际贡献动态分配，复杂任务不被截断、简单任务不浪费。"
user_try: "试试：我们四个 Agent 共用 8192 token 预算，帮我按任务复杂度动态分一下，别让研究 Agent 被截断。"
whenToUse: "当多 Agent 共享固定 Token 预算、静态均分造成截断或空耗时用；若预算已定、只需压缩单条长上下文，用「上下文 Token 压缩」；若按角色筛选记忆库子集，用「角色感知上下文路由」。"
workflow: "统计各 Agent 的历史调用与预算占用 → 用滑动窗口估计各 Agent 上下文的边际价值 → 用 Shapley 归因拆分各 Agent 对结果的贡献 → 按边际价值重分配 Token 预算并在线更新 → 用成功信号评估重分配后的成功率与 Token 消耗"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AdaCtx动态上下文预算分配 — 子Agent间Token预算自适应调度与边际价值追踪

## ① 解决的问题

MAS框架默认均匀分配上下文预算导致复杂Agent被截断简单Agent空耗——AdaCtx滑动窗口边际价值+Shapley归因动态重分配将任务成功率提升12.8%，同时减少31%Token消耗（2026 arXiv:2604.02042）

## ② 核心算法逻辑

反直觉洞察：几乎所有MAS框架（AutoGen/LangGraph/MetaGPT）默认给每个Agent分配相等的上下文预算，或者按角色静态手工设置。这种方法的问题在于：任务难度是动态变化的——Research Agent在处理复杂市场分析时需要8000 tokens，而处理简单查询时只需要500 tokens。 静态分配导致复杂任务的Agent被截断，简单任务的Agent空耗预算。AdaCtx证明：动态重分配比均匀分配提升12.8%任

## ③ 业务应用场景

- 业务问题：Prime Day期间，母婴品牌MAS同时运行：研究Agent（需要大量上下文分析竞品）、财务Agent（只需简单ROI计算）、合规Agent（需要中等上下文查法规）、报告Agent（需要汇总前三者输出）。总Token预算8192，均匀分配每个Agent2048 tokens，研究Agent被截断导致竞品分析不完整，而财务Agent浪费了1500 tokens - AdaCtx解决方案：动态分配：研究Agent（高边际价值）→4500 tokens，合规Agent→2000 tokens，财务Agent→700 tokens，报告Agent→992 tokens。同等总预算下，研
- 业务问题：简单品类（婴儿防晒）研究只需500 tokens，复杂品类（智能婴儿监控）需要3000+ tokens，但静态分配导致简单品类浪费预算、复杂品类被截断 - AdaCtx机制：历史数据训练各品类的边际价值估计；复杂技术类品类自动获得更多上下文；简单标准化品类减少上下文分配 - 预期产出：月处理500次品类研究，Token成本降低28%，研究质量均匀提升
三轨验证 | 成本轨：月均成本1200元（AI模型调用费800元/月，人工审核12小时/月@50元/小时=600元，系统维护200元/月），ROI周期3个月 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》，需建立Agent决策日志可追溯机制，满足母婴产品溯源要求 | 风险轨：库存预测偏差风险（概率15%，因促销节奏变化），可通过多Agent投票机制降至8%；供应链中断风险（概率12%），需配置备用Agent应急方案

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：12.8%
ROI 预估：月调用10000次MAS的跨境电商平台，AdaCtx使Token减少31%，以GPT-4o ($5/M tokens)计算：若平均每次调用8000 tokens，月节省=10000×8000×0.31×$0.000005=$1240；同时任务质量提升12.8%减少重试，综合年化ROI=300-500%
实施难度：⭐⭐⭐☆☆（在线学习部分工程量适中；关键是需要LLM-as-judge成功信号，需要设计好评估标准）
优先级：⭐⭐⭐⭐⭐（上下文预算是MAS最核心的稀缺资源，任何多Agent系统都面临这个问题，论文结果显著，2026年最新成果）
适用规模：3+个Agent的MAS系统，在Token预算有限（强制截断）时效果最显著
数据依赖：需要任务成功信号（可用LLM-as-judge自动生成）；滑动窗口需要约20轮历史数据才稳定

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（274 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/adactx_dynamic_context_budget_allocation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-AdaCtx-Dynamic-Context-Budget-Allocation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AdaCtx动态上下文预算分配系统
功能：滑动窗口边际价值估计 + Shapley归因 + 在线动态重分配
基于 arXiv:2604.02042 Dynamic Context-Window Allocation
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from collections import deque
import warnings
warnings.filterwarnings('ignore')


@dataclass
class AgentContextProfile:
    """Agent上下文使用档案"""
    agent_id: str
    role: str
    priority: float = 1.0               # 角色基础优先级
    # K个桶的边际价值估计（512, 1024, 2048, 4096, 8192 tokens）
    bucket_sizes: List[int] = field(default_factory=lambda: [512, 1024, 2048, 4096, 8192])
    bucket_values: List[float] = field(default_factory=lambda: [0.5, 0.5, 0.5, 0.5, 0.5])
    # 滑动窗口历史（每个桶）
    _history: Optional[Dict] = field(default=None, repr=False)

    def __post_init__(self):
        self._history = {size: deque(maxlen=20) for size in self.bucket_sizes}

    def get_marginal_value(self, context_size: int) -> float:
        """获取特定上下文大小的边际价值估计"""
        # 找到最近的桶
        idx = min(range(len(self.bucket_sizes)),
                  key=lambda i: abs(self.bucket_sizes[i] - context_size))
        return self.bucket_values[idx]

    def update_bucket_value(self, context_size: int, contribution: float):
        """更新桶的边际价值估计（滑动窗口均值）"""
        idx = min(range(len(self.bucket_sizes)),
                  key=lambda i: abs(self.bucket_sizes[i] - context_size))
        self._history[self.bucket_sizes[idx]].append(contribution)
        if self._history[self.bucket_sizes[idx]]:
            self.bucket_values[idx] = np.mean(list(self._history[self.bucket_sizes[idx]]))


class ShapleyAttributor:
    """Shapley值归因器 — 将任务成功信号归因到每个Agent"""

    @staticmethod
    def approximate_shapley(agent_contributions: Dict[str, float],
                             task_success: float) -> Dict[str, float]:
        """
        近似Shapley归因（蒙特卡洛采样）
        
        Args:
            agent_contributions: 每个Agent的原始贡献分数
            task_success: 任务最终成功信号（0-1）
        
        Returns:
            每个Agent的Shapley价值（归一化后代表其对成功的贡献份额）
        """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2604.02042，但该号在 arXiv 上是《A Fenchel Theorem for the Gauss maps and uniqueness of minimizers of nonlocal curvature energies》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需多 Agent 系统的历史调用记录、每次分配的上下文量与任务成功信号（可用 LLM-as-judge 生成）；卡页称滑动窗口需约 20 轮历史数据才稳定，适用 3 个以上 Agent 的 MAS。

**输出**：产出各 Agent 的动态 Token 预算方案（卡页示例：研究 4500、合规 2000、财务 700、报告 992）、边际价值与归因结果、任务成功率与 Token 消耗对比（卡页记录成功率 +12.8%、Token 减少 31%）。

## 执行步骤

1. 统计各 Agent 的历史调用记录、上下文占用与成功信号
2. 估计每个 Agent 的边际价值（滑动窗口）
3. 归因各 Agent 对任务结果的贡献（Shapley）
4. 重分配 Token 预算并在线滚动更新
5. 复评任务成功率与 Token 消耗变化

## 边界与不做

- Agent 少于 3 个或预算不受限时，动态重分配的收益有限
- 只产出预算分配规则与归因结果，不直接改写各 Agent 的提示词或工具
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-RCR-Router-Role-Aware-Context-Routing.html、Skill-RCR-Router-Role-Aware-Context-Routing
- **延伸**：Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-RCR-Router-Role-Aware-Context-Routing.html、Skill-RCR-Router-Role-Aware-Context-Routing
- **可组合**：Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-AdaCtx-Dynamic-Context-Budget-Allocation

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：10-MAS　·　源卡：`Skill-AdaCtx-Dynamic-Context-Budget-Allocation`