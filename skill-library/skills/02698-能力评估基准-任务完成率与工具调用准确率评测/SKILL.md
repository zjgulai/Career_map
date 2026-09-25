---
name: "p2s-agent-capability-evaluation"
title: "Agent能力评估基准 — 任务完成率与工具调用准确率评测"
description: "触发词：Agent评测、任务完成率、工具调用准确率、多版本对比、能力退化拦截。何时不用：没有标准测试集与ground-truth工具序列时不适用；系统级framework选型对比走MASEval系统评估。安全边界：评测集与轨迹涉及生产数据时须脱敏，评测只用于上线前判定，不替代线上监控。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-148"
l3_business: "Playbook评估"
l3_all: "Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/Playbook评估"
p2s_card_id: "Skill-Agent-Capability-Evaluation"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用带标准答案的测试集给 Agent 打分量，在版本上线前拦住能力退化与工具调用错误。"
user_try: "试试：补货 Agent v2 改了提示词，帮我用50个标准场景对比 v1 和 v2 的完成率与工具调用准确率。"
whenToUse: "当 Agent 版本迭代需要量化对比、或要在多个模型与流程之间横向比较能力时用本卡；需要比较框架组合的影响用 MASEval 系统评估。"
workflow: "构建含 ground-truth 工具序列的标准测试集 → 采集被测 Agent 的完整执行轨迹 → 计算工具选择准确率与参数准确率 → 按维度汇总评分并定位退化点 → 输出多版本或多模型对比报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent能力评估基准 — 任务完成率与工具调用准确率评测

## ① 解决的问题

技术运营面临"Agent版本迭代无量化评估、上线后才发现能力退化引发运营事故"——5D评估框架将Agent退化问题在上线前拦截，年化规避运营事故损失50万元+

## ② 核心算法逻辑

Agent 评估比模型评估更复杂，因为 Agent 的"正确"不只是最终答案，还包括过程质量（工具调用路径、中间推理、资源消耗）。

## ③ 业务应用场景

场景A：补货 Agent 版本迭代评测 - 业务问题：补货 Agent v2 修改了提示词，不知道是否改善了多步骤工具调用准确性，需要量化对比 - 数据要求：标准测试集（50 个补货场景），每个场景有 ground-truth 工具调用序列，Agent 实际调用记录 - 预期产出：v1 vs v2 的 5D 评分对比报告，定位退化点（如 v2 的幻觉率从 3% 升至 8%） - 业务价值：防止无意识的 Agent 能力退化，每次迭代有数据支撑，减少上线事故
场景B：多 Agent 横向能力基准 - 业务问题：比较 GPT-4o / Claude-3.5 / DeepSeek-V3 在公司业务 Agent 场景的实际表现差异 - 数据要求：30 个标准业务 Task，各模型的完整调用 trace - 预期产出：多模型 Radar Chart 对比，定量支撑模型选型决策 - 业务价值：选对模型节省 40% API 成本（约 5 万元/月），同时保证任务完成率
三轨验证 | 成本轨：月均成本1200元（LLM API调用费用800元/月基于10万listings、人工审核4小时/月、服务器资源400元/月），ROI周期2.5个月（基于CTR+22%带来的转化率提升） | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品描述指南》，需获得母婴产品资质认证，合规率需达99%以上，依据：平台品类管控政策和进口母婴产品监管要求 | 风险轨：主要风险包括AI生成内容的医疗宣传违规（概率15%）、产品信息不准确导致退货率上升（概率12%）、多语言翻译偏差影响转化（概率8%），建议建立人工二审机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：防止 Agent 退化导致的运营事故（单次事故损失 5-20 万元），年化规避风险价值 50 万元+
实施难度：⭐⭐⭐☆☆（需要构建标准测试集，评测框架本身开发 2-3 天）
优先级：⭐⭐⭐⭐☆
评估依据：任何上生产的 Agent 都需要持续评测，没有评测就没有迭代方向；5D 框架覆盖 Agent 特有的失败模式（幻觉/冗余/不鲁棒）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（229 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Agent 能力评估基准 — 5D 评估框架 + 自动化评测流水线
"""
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class ToolCall:
    """单次工具调用记录"""
    tool_name: str
    parameters: Dict
    result: Optional[str] = None
    success: bool = True


@dataclass
class AgentTrace:
    """Agent 完整执行轨迹"""
    task_id: str
    task_description: str
    tool_calls: List[ToolCall] = field(default_factory=list)
    final_answer: Optional[str] = None
    task_completed: bool = False


@dataclass
class GroundTruth:
    """任务标准答案"""
    task_id: str
    expected_tool_sequence: List[str]          # 期望工具调用顺序
    expected_params_keys: List[List[str]]       # 每次调用的期望参数键
    valid_final_answers: List[str] = field(default_factory=list)
    max_steps_allowed: int = 5


def evaluate_tool_call_accuracy(
    trace: AgentTrace,
    ground_truth: GroundTruth
) -> Tuple[float, float]:
    """
    返回 (工具选择准确率, 参数准确率)
    """
    if not ground_truth.expected_tool_sequence:
        return 1.0, 1.0

    expected = ground_truth.expected_tool_sequence
    actual = [tc.tool_name for tc in trace.tool_calls]

    # 工具序列匹配（允许顺序交换，取最长公共子序列比例）
    def lcs_ratio(a, b):
        m, n = len(a), len(b)
        if max(m, n) == 0:
            return 1.0
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if a[i-1] == b[j-1]:
                    dp[i][j] = dp[i-1][j-1] + 1
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2308.03688 — AgentBench: Evaluating LLMs as Agents
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：标准测试集（任务描述、期望工具调用序列、每次调用的期望参数键、合法终答与最大步数上限）、被测 Agent 的完整执行轨迹（工具调用、参数、返回结果、最终答案与是否完成）。

**输出**：各版本或多模型在任务完成率、工具选择准确率、参数准确率等维度上的评分对比报告，含退化点定位与雷达图对比，供技术运营做上线与选型决策。

## 执行步骤

1. 构建含 ground-truth 工具调用序列的标准测试集
2. 采集被测 Agent 的完整执行轨迹（工具调用、参数、结果与终答）
3. 计算工具选择准确率与参数准确率
4. 按各维度汇总评分并定位退化点
5. 输出多版本或多模型对比报告支撑上线与选型决策

## 边界与不做

- 何时不用：没有 ground-truth 工具序列的标准测试集、或场景无法穷举期望路径时不适用。
- 能力边界：只做离线评测与对比，不监控线上真实流量与漂移；结论受测试集覆盖面限制。
- 数据边界：评测所用的生产轨迹须脱敏，评测结果只作为上线判定依据之一。

## 技能关联

- **前置**：Skill-Agent-Error-Budget.html、Skill-Agent-Error-Budget、Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router
- **延伸**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router
- **可组合**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router、Skill-Agent-Capability-Evaluation

---

> 分类：数据与Agent平台/数据与AI运行/Playbook评估　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agent-Capability-Evaluation`