---
name: "p2s-agent-production-engineering"
title: "Skill Card: Agent Production Engineering（Agent 生产化工程）"
description: "触发词：Agent生产化、MCP工具暴露、多Agent编排、上下文压缩、大促备货决策。何时不用：没有历史销售与库存基线、或不具备工具调用与协议适配能力时不适用；纯算法编排无需工程化时不走本卡。安全边界：下单与库存变更须由模型外的确定性控制层与业务系统执行，并保留人工签核点，压缩不得丢失决策依据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 集成验证 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Agent-Production-Engineering"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把多 Agent 协同的备货决策从能跑变成能用：协议适配、生命周期管理与上下文压缩三层落地。"
user_try: "试试：黑五前10天要定5个SKU的备货量，帮我用销售预测、库存优化、风险评估三个 Agent 协同出方案并算调用成本。"
whenToUse: "当已有算法编排但缺少工具暴露、调用预算与上下文成本控制、需要真正上生产时用本卡；只需要算法侧的多目标分配用预算分配类技能；只需要压缩上下文用主动上下文剪枝或上下文压缩技能。"
workflow: "汇总 SKU 历史销售、库存基线与大促参数 → 销售预测 Agent 按日输出 7 天销量预测 → 库存优化 Agent 编排输出备货方案 → 风险评估 Agent 评估延期与退货风险 → 统计调用次数与 token 成本并汇总建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Agent Production Engineering（Agent 生产化工程）

## ① 解决的问题

WF-A 智能补货 Agent：算法层用 MAS-Orchestrator 编排，工程层通过 MCP Server 暴露库存查询/补货下单工具，Context Compression 降低每次调用的 token 成本（$0.15→$0.04/次）

## ② 核心算法逻辑

核心思想：将多Agent协同决策（MAS）的算法逻辑与生产系统的工程约束统一，通过协议适配、生命周期管理、上下文压缩三层递进，实现从"能跑"到"能用"的质变。

## ③ 业务应用场景

业务问题： - 黑五大促前10天，需决策5个SKU（ST-2024/ST-2025/ST-2026/ST-2027/ST-2028）的备货量 - 传统方法：人工经验+销售预测，误判率18%，导致缺货或积压 - 目标：通过多Agent协同（销售预测Agent + 库存优化Agent + 供应链风险Agent），提升决策准确率至91%
具体数据规模： - 5个SKU，历史销售数据36个月，日均销量50-200件 - 库存基线：总计8000件，安全库存1500件 - 大促周期：10天，预期销量翻3倍（日均150件→450件）
Agent生产化方案： - Agent 1（销售预测）：基于Reflexion反馈，每日调用1次，输入历史销量+外部信号（评价、竞品价格），输出7天销量预测 - Agent 2（库存优化）：基于MAS-Orchestrator编排，每日调用2次，根据预测结果+库存成本，输出最优备货方案 - Agent 3（风险评估）：基于Context Compression，每日调用1次，评估供应链延迟、退货率等风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

年化成本节省：¥450,000（库存成本优化）+ ¥380,000（准确率提升）= ¥830,000
系统投入：年化$5,000（基础设施）+ $2,000（Agent调用成本）= $49,000（约¥343,000）
净收益：¥830,000 - ¥343,000 = ¥487,000
ROI：487,000 / 343,000 = 142%（年化）
库存周转率：12次/年 → 15.4次/年（+28%）
补货准确率：82% → 94%（+15%）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（413 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/mas/agent_production_engineering` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Agent-Production-Engineering.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent Production Engineering - 多Agent协同大促备货决策系统
完整可运行示例（仅依赖numpy/pandas）
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict

# ============================================================================
# 第一部分：数据生成与初始化
# ============================================================================

class AgentProductionSystem:
    """生产级Agent系统核心类"""
    
    def __init__(self, skus, days_history=90, daily_calls_budget=1000):
        """
        初始化系统
        
        Args:
            skus: SKU列表，如['ST-2024', 'ST-2025', 'ST-2026']
            days_history: 历史数据天数
            daily_calls_budget: 日均Agent调用次数预算
        """
        self.skus = skus
        self.days_history = days_history
        self.daily_calls_budget = daily_calls_budget
        self.historical_data = self._generate_historical_data()
        self.agent_metrics = defaultdict(list)
        
    def _generate_historical_data(self):
        """生成模拟历史销售数据"""
        dates = pd.date_range(end=datetime.now(), periods=self.days_history, freq='D')
        data = {}
        
        for sku in self.skus:
            # 基础销量 + 周期性 + 随机波动
            base_sales = np.random.randint(40, 80)
            trend = np.linspace(0, 20, self.days_history)
            seasonality = 15 * np.sin(np.arange(self.days_history) * 2 * np.pi / 7)
            noise = np.random.normal(0, 5, self.days_history)
            
            sales = base_sales + trend + seasonality + noise
            sales = np.maximum(sales, 10)  # 最低销量10件
            
            data[sku] = pd.DataFrame({
                'date': dates,
                'sales': sales,
                'inventory': np.random.randint(500, 2000, self.days_history),
                'price': np.random.uniform(80, 150, self.days_history)
            })
        
        return data
    
    # ========================================================================
    # 第二部分：Agent 1 - 销售预测Agent（Reflexion反馈机制）
    # ========================================================================
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 列表与历史销售数据（如 36 个月、日均销量区间）、库存基线与安全库存、大促周期与预期销量倍数，以及各 Agent 的调用频率与每日调用预算。

**输出**：多 Agent 协同的备货方案与风险评估报告（含各 SKU 备货量、调用次数与单次 token 成本），附库存周转率与补货准确率的改善预期，供运营与供应链负责人确认。

## 执行步骤

1. 汇总 SKU 历史销售、库存基线、安全库存与大促周期参数
2. 用销售预测 Agent 按日输出 7 天销量预测并带反馈修正
3. 用库存优化 Agent 结合预测与库存成本编排输出备货方案
4. 用风险评估 Agent 评估供应链延迟与退货率等风险
5. 通过 MCP Server 暴露库存查询与补货下单等工具供调用
6. 对上下文做压缩以控制每次调用的 token 成本
7. 汇总备货建议与风险提示并保留人工签核点

## 边界与不做

- 何时不用：没有历史销售与库存基线、或不具备工具调用与协议适配能力时不适用；只做算法编排、不打算上生产时用更轻的技能。
- 能力边界：产出的是编排契约、工具适配与压缩策略，真实下单与库存变更由业务系统与人工签核完成。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-Protocol-Stack
- **延伸**：Skill-Agent-Observability-Monitoring、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Context-Compression-Engine
- **可组合**：Skill-Dynamic-Pricing-Agent、Skill-Supply-Chain-Risk-Agent、Skill-Agent-Production-Engineering

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：10-MAS　·　源卡：`Skill-Agent-Production-Engineering`