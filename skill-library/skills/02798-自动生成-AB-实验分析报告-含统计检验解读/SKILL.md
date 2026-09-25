---
name: "p2s-autonomous-ab-report-agent"
title: "Agent 自动生成 AB 实验分析报告 — 含统计检验解读"
description: "触发词：自动报告、统计检验解读、FDR校正、报告生成、分析师提效。何时不用：只要单个实验的结论判定、不需要成稿报告时用A/B结果解读类技能。安全边界：报告只含聚合统计不含个人信息；须设统计阈值硬约束，不允许LLM推翻p>0.05的结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Autonomous-AB-Report-Agent"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让 Agent 自动写出实验分析报告，统计检验和业务建议一起给，把分析师从每月一堆报告里解放出来。"
user_try: "试试：这个月 8 个 Listing 实验的报告帮我自动生成，含统计结论和业务建议。"
whenToUse: "当每月实验量大、报告撰写占用分析师大量时间、且需要统一口径的统计结论时用；只要单个实验的结论判定、不需要成稿报告时用 A/B 结果解读类技能。"
workflow: "汇总实验组与对照组的各维度指标与实验元数据 → 跑统计检验并计算效应量 → 做 FDR 校正处理同时监测的多个指标 → 生成业务解读与建议，并受统计阈值硬约束 → 输出报告，注明显著性结论与不确定性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 自动生成 AB 实验分析报告 — 含统计检验解读

## ① 解决的问题

分析师被每月 5-10 个 Listing AB 实验的手工报告撰写工作淹没——引入 Agent 自动报告生成（统计检验解读+业务建议），人均报告耗时从3小时→15分钟，释放分析师年化2400小时投入高价值决策。

## ② 核心算法逻辑

AB 实验报告生成涉及统计检验、业务解读、可视化三个维度，人工撰写耗时 24 小时/实验。自动化 Agent 通过以下流程实现端到端报告生成：

## ③ 业务应用场景

场景1：Listing 优化 AB 实验自动报告 - 业务问题：每月 5-10 个 Listing AB 实验，每个报告需分析师 2-3 小时手工撰写，积压严重 - 数据要求：实验组/对照组各维度指标（CTR、CVR、AOV、会话数），实验元数据（时间、流量分配比例） - 预期产出：15 分钟内生成完整 PDF 报告，含统计显著性结论和商业建议 - 业务价值：分析师从报告生成解放，专注于实验设计；年化节省分析人力约 30 万元
场景2：价格策略 AB 实验分析 - 业务问题：定价实验需同时分析 CVR、AOV、利润率三个指标，多重比较误差难以人工处理 - 数据要求：各价格组的交易数据（含利润字段），足够样本量（CVR 实验通常需 1000+ 转化） - 预期产出：自动应用 FDR 校正，给出综合定价建议，避免单指标误判 - 业务价值：价格策略决策准确率提升，避免因误判导致的利润损失
**三轨验证**： - 成本：每份报告 LLM 调用成本约 $0.05-0.20（取决于数据量） - 合规：报告中不包含用户个人信息，仅聚合统计数据 - 风险：LLM 解读可能过度乐观/悲观，需设置统计阈值硬约束（不允许 LLM 推翻 p>0.05 的结论）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：每月节省分析师 20-40 小时报告撰写时间，年化节省人力约 25-40 万元；决策速度提升 3-5 倍
实施难度：⭐⭐⭐⭐☆（统计模块复杂，LLM 解读需要精心设计 prompt 和安全约束）
优先级：⭐⭐⭐⭐☆（高频分析需求，ROI 明确）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
AB 实验自动报告 Agent
依赖：scipy, numpy
"""
import numpy as np
from scipy import stats
from typing import NamedTuple
from dataclasses import dataclass


@dataclass
class ABExperimentData:
    name: str
    control_conversions: int
    control_total: int
    treatment_conversions: int
    treatment_total: int
    control_revenue: float = 0.0
    treatment_revenue: float = 0.0


class StatResult(NamedTuple):
    metric: str
    control_value: float
    treatment_value: float
    relative_lift: float
    p_value: float
    ci_lower: float
    ci_upper: float
    significant: bool
    effect_size: str  # "negligible/small/medium/large"


class ABReportAgent:
    """AB 实验自动分析报告 Agent"""

    SIGNIFICANCE_LEVEL = 0.05

    def _proportion_test(self, c_conv, c_total, t_conv, t_total) -> tuple[float, float, float]:
        """双比例 Z 检验"""
        p_c = c_conv / c_total
        p_t = t_conv / t_total
        p_pool = (c_conv + t_conv) / (c_total + t_total)
        se = np.sqrt(p_pool * (1 - p_pool) * (1/c_total + 1/t_total))
        if se == 0:
            return 1.0, 0.0, 0.0
        z = (p_t - p_c) / se
        p_value = 2 * (1 - stats.norm.cdf(abs(z)))  # 双尾
        # 95% 置信区间（差值）
        diff_se = np.sqrt(p_c*(1-p_c)/c_total + p_t*(1-p_t)/t_total)
        margin = 1.96 * diff_se
        return p_value, (p_t - p_c) - margin, (p_t - p_c) + margin

    def _cohens_h(self, p1: float, p2: float) -> str:
        """Cohen's h 效应量（比例差）"""
        h = abs(2 * np.arcsin(np.sqrt(p1)) - 2 * np.arcsin(np.sqrt(p2)))
        if h < 0.2: return "negligible"
        if h < 0.5: return "small"
        if h < 0.8: return "medium"
        return "large"
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验组与对照组各维度指标（CTR、CVR、AOV、会话数；价格实验还需含利润字段的交易数据）+ 实验元数据（时间、流量分配比例）；卡页提示 CVR 类实验通常需要 1000 以上转化。

**输出**：含统计显著性结论与商业建议的报告（卡页示例：15 分钟内生成完整 PDF 报告），价格场景下自动应用 FDR 校正并给出综合定价建议。

## 执行步骤

1. 汇总实验组与对照组的各维度指标与实验元数据
2. 跑统计检验并计算效应量（如 Cohen's h）
3. 做 FDR 校正处理同时监测的多个指标
4. 生成业务解读与建议，并受统计阈值硬约束
5. 输出含显著性结论、建议与不确定性说明的报告

## 边界与不做

- 何时不用：只要单个实验的结论判定、不需要成稿报告时，用 A/B 结果解读类技能即可；样本量不足（CVR 类实验少于约 1000 转化）时报告结论不稳。
- 能力边界：只生成报告与建议，不执行上线；LLM 解读可能过度乐观或悲观，须设统计阈值硬约束，不允许其推翻 p>0.05 的结论。
- 合规边界：报告中不得包含用户个人信息，只能使用聚合统计数据。
- 卡页数字（人均 3 小时到 15 分钟、年化 2400 小时、年化节省 25-40 万元、决策速度提升 3-5 倍、每份报告 0.05-0.20 美元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Autonomous-AB-Report-Agent

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Autonomous-AB-Report-Agent`