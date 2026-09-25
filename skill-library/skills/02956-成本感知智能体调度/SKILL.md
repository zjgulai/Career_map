---
name: "p2s-cost-aware-agent-scheduling"
title: "Cost-Aware Agent Scheduling（成本感知智能体调度）"
description: "触发词：智能体调度、查询分级、客服路由、推理成本、响应延迟。何时不用：模型路由要细到工作流步骤级走「上下文感知模型路由」；API 账单整体治理走「Agent 成本优化」。安全边界：路由错判导致质量下降时须有人工兜底与升级路径，高风险咨询不得交给低价模型。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-Cost-Aware-Agent-Scheduling"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "客服和咨询类请求有难有易，按难度分给不同档位的模型，等待时间和成本一起降。"
user_try: "试试：帮我按难度把每天的客服查询分个级，看看哪些能交给小模型处理。"
whenToUse: "当请求难度分布明显（简单、中等、复杂）且当前统一用贵模型时用；若路由要细到工作流步骤级，用「上下文感知模型路由」；若做全局成本治理，用「Agent 成本优化」。"
workflow: "采集查询文本与历史处理结果 → 按难度特征分为简单、中等、复杂三类 → 为每类配置模型档位与路由阈值 → 按路由执行并监控准确率与响应时间 → 按月校准分类阈值并复核误分类"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cost-Aware Agent Scheduling（成本感知智能体调度）

## ① 解决的问题

运营总监面临高峰期Agent成本失控——Cost-Aware Scheduling将推理成本降28%，年化省24万元

## ② 核心算法逻辑

核心思想：根据任务复杂度动态路由至最优成本模型，避免用 GPT4 处理简单分类任务，通过分层模型架构（SLM→Medium→LLM）实现成本与性能的帕累托最优。

## ③ 业务应用场景

业务问题： - 日均 200 条客服查询，全部用 GPT-4 处理，月成本 $1,500 - 客户等待时间 2.1s（LLM 推理延迟），转化率 3.8% - 无法区分简单/复杂查询，资源严重浪费
数据规模： - SKU：12 款暖奶器（B08/B12/B15 等） - 库存：2,000 件，日销 50 件 - 日均查询：200 条（简单 150 条、中等 40 条、复杂 10 条） - 平均售价：$39.9/件
| 查询类型 | 日均数量 | 示例 | 路由模型 | 单价 | 日成本 | 准确率 | 响应时间 | |---------|--------|------|---------|------|--------|--------|---------| | 简单 | 150 | "B08 怎么清洗？" | SLM | $0.001 | $0.15 | 98% | 0.3s | | 中等 | 40 | "B08 vs B12 温控范围差多少？" | Medium | $0.01 | $0.40 | 95% | 0.8s | | 复杂 | 10 | "3 个月宝宝，120ml 玻璃奶瓶，B08 从 4

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：3.8%
✅ 核心算法简单（基于特征的分类器，无需深度学习）
✅ 代码实现成熟（标准库即可，无复杂依赖）
⚠️ 需要定期微调分类阈值（月度维护成本 $500）
⚠️ 需要监控路由错误率（误分类导致质量下降）
⚠️ 多模型管理复杂度（需要对接 3+ 个 API）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（333 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/llm_agent_engineering/cost_aware_agent_scheduling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Cost-Aware-Agent-Scheduling.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from collections import defaultdict
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class Query:
    """查询数据类"""
    text: str
    category: str = None
    
@dataclass
class ModelConfig:
    """模型配置"""
    name: str
    unit_price: float  # 单位：美元/1K tokens
    avg_tokens: int    # 平均 token 消耗
    accuracy: float    # 准确率
    latency_ms: int    # 响应延迟（毫秒）

class ComplexityClassifier:
    """任务复杂度分类器"""
    
    def __init__(self):
        # 复杂度特征权重
        self.reasoning_keywords = {
            'compare': 2.0, 'why': 2.0, 'explain': 1.5, 'analyze': 2.0,
            'which': 1.5, 'better': 1.5, 'difference': 1.5, 'how long': 1.5
        }
        self.safety_keywords = {
            'baby': 0.5, 'infant': 0.5, 'newborn': 0.5, 'health': 1.0,
            'safe': 1.0, 'temperature': 0.5, 'burn': 1.5, 'allergy': 1.5
        }
    
    def extract_features(self, query: str) -> Dict[str, float]:
        """提取查询特征"""
        query_lower = query.lower()
        words = query_lower.split()
        
        # 特征 1：查询长度（token 数估算）
        token_count = len(words) * 1.3  # 英文平均 1.3 tokens/word
        
        # 特征 2：推理关键词数量
        reasoning_score = sum(
            self.reasoning_keywords.get(w, 0) for w in words
        )
        
        # 特征 3：安全相关关键词（需要更高准确率）
        safety_score = sum(
            self.safety_keywords.get(w, 0) for w in words
        )
        
        # 特征 4：数值/对比数量
        has_numbers = sum(1 for w in words if any(c.isdigit() for c in w))
        
        return {
            'token_count': token_count,
            'reasoning_score': reasoning_score,
            'safety_score': safety_score,
            'comparison_count': has_numbers,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：需查询流水（文本、类型、响应时间与准确率）与各模型档位的单价，查询级粒度；卡页示例规模为日均 200 条客服查询。

**输出**：产出查询分级结果与路由方案（卡页示例：150 条简单查询走小模型、40 条中等、10 条复杂走强模型）、日成本与响应时间对照，供客服与运营团队使用。

## 执行步骤

1. 采集查询文本、类型与历史处理结果
2. 把查询按难度分为简单、中等、复杂三类
3. 配置每类查询的模型档位、单价与路由阈值
4. 执行路由并监控各类准确率与响应时间
5. 校准分类阈值并复核误分类案例

## 边界与不做

- 查询类型单一或全部属于复杂咨询时，分级没有收益
- 只做分级与路由建议，误分类引发的质量下降需人工兜底
- 路由阈值需按月维护，模型供应商接口变化时要重新校准
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Ta[REDACTED]、Skill-LLM-Token-Optimization
- **延伸**：Skill-Agent-Performance-Monitoring、Skill-Multi-Model-Orchestration
- **可组合**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Context-Compression.html、Skill-Context-Compression、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DAG-Ta[REDACTED]、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Cost-Aware-Agent-Scheduling

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：16-智能体工程　·　源卡：`Skill-Cost-Aware-Agent-Scheduling`