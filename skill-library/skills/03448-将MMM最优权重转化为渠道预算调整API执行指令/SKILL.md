---
name: "p2s-mmm-budget-reallocation-executor"
title: "MMM Budget Reallocation Executor — 将MMM最优权重转化为渠道预算调整API执行指令"
description: "触发词：MMM权重落地、预算调整指令、偏差阈值、分期执行、执行确认回路。何时不用：MMM尚未产出渠道ROI系数、或只想看方案不执行时不适用；没有平台API权限时只用决策类技能。安全边界：执行须受总调整比例与单渠道变动上限约束，增幅超单期上限须分期执行，并保留执行确认状态与回滚记录。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 业务工具实现"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-MMM-Budget-Reallocation-Executor"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 MMM 输出的最优渠道权重换算成各平台的预算调整指令，按偏差阈值决定自动执行还是人工确认。"
user_try: "试试：MMM 显示 YouTube 权重28%、当前只分了12%，帮我把它换算成具体平台的预算调整指令。"
whenToUse: "当 MMM 已给出渠道 ROI 权重、需要把权重差转化成可下发的预算调整指令时用本卡；只做权重与利润口径的取舍用 MMM 预算利润对齐；需要按饱和度阈值触发小步腾挪用渠道预算再分配触发器。"
workflow: "Softmax 归一化 MMM 渠道系数得到最优权重 → 与当前预算权重比对取最大绝对偏差 → 按偏差阈值判定无需调整、人工确认或自动执行 → 在总调整量与单渠道变动上限内算目标预算 → 输出 API 调用参数与确认状态"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MMM Budget Reallocation Executor — 将MMM最优权重转化为渠道预算调整API执行指令

## ① 解决的问题

媒介团队面临"MMM模型已输出最优权重但无法自动执行"——API封装将MMM结果转化为可执行调整指令，ROAS提升15-25%，年化增量收益$190,000

## ② 核心算法逻辑

核心是「权重归一化 + 差异检测 + API调用封装 + 执行确认回路」：

## ③ 业务应用场景

场景：母婴品牌季度MMM更新后的预算重分配执行 - 触发条件：MMM显示YouTube贡献权重28%（当前分配仅12%），Facebook权重35%（当前分配52%），KL散度0.18>阈值0.10 - 执行动作：Facebook $52,000→$35,000（-32.7%），YouTube $12,000→$28,000（+133%），其余渠道微调；偏差>20%需人工确认后自动执行 - 安全护栏：YouTube增幅超50%，自动拆分为两期执行（每期+50%），间隔14天 - 业务价值：整体ROAS预计从3.1提升至3.8，年化增量收益约$190,000
**三轨验证** | 成本轨：MMM模型月度运算成本约1200元（云计算GPU/CPU资源），数据处理工具月费800元，人工验证与调优12小时/月（约2400元），合计月均4400元 | 合规轨：符合Amazon广告政策、TikTok商业数据使用协议，消费者数据脱敏处理符合GDPR要求，跨境数据传输通过数据处理协议（DPA）规范，无涉及儿童隐私的直接追踪 | 风险轨：MMM多重共线性导致系数估计偏差概率12%，建议每月进行参数稳定性检验；季节性因素（如618、双11）可能导致模型预测偏离5-8%，需动态调整权重系数；预算分配执行延迟超过48小时将错失最优投放窗口，建议建立自动化执行机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：MMM指导的预算重分配通常提升ROAS 15-25%，年化增量$150,000-$250,000
实施难度：⭐⭐⭐☆☆（需接入各广告平台API，逻辑清晰但接口工作量较多）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（161 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import Dict, List, Tuple
import json

def mmm_budget_reallocation_executor(
    mmm_roi_coefficients: Dict[str, float],
    current_budgets: Dict[str, float],
    total_budget: float,
    diff_threshold_auto: float = 0.20,
    diff_threshold_manual: float = 0.10,
    max_total_change_ratio: float = 0.15,
    max_single_channel_change: float = 0.50,
    max_single_period_increase: float = 0.50
) -> Dict:
    """
    MMM预算再分配执行器
    
    参数:
        mmm_roi_coefficients: MMM输出的各渠道ROI贡献系数 {"channel": coefficient}
        current_budgets: 当前各渠道预算分配 {"channel": budget}
        total_budget: 总预算
        diff_threshold_auto: 自动执行阈值（偏差>此值自动执行）
        diff_threshold_manual: 人工确认阈值（偏差在两阈值之间需确认）
        max_total_change_ratio: 单次最大总调整比例
        max_single_channel_change: 单渠道最大变动比例
        max_single_period_increase: 单期最大增幅（超出则分期执行）
    
    返回:
        执行指令字典，含API调用参数和确认状态
    """
    channels = list(mmm_roi_coefficients.keys())
    
    # 1. Softmax归一化ROI系数为最优权重
    coefs = np.array([mmm_roi_coefficients[c] for c in channels])
    exp_coefs = np.exp(coefs - np.max(coefs))  # 数值稳定
    optimal_weights = exp_coefs / exp_coefs.sum()
    
    # 2. 计算当前权重
    current_total = sum(current_budgets.values())
    current_weights = np.array([current_budgets.get(c, 0) / current_total for c in channels])
    
    # 3. 计算偏差（最大绝对偏差）
    weight_diff = np.abs(optimal_weights - current_weights)
    max_diff = float(weight_diff.max())
    
    # 4. 确定执行模式
    if max_diff < diff_threshold_manual:
        return {
            "trigger": False,
            "reason": f"最大权重偏差{max_diff:.2%} < 阈值{diff_threshold_manual:.0%}，无需调整",
            "action": "NO_CHANGE",
            "optimal_weights": dict(zip(channels, optimal_weights.tolist()))
        }
    
    execution_mode = "AUTO" if max_diff > diff_threshold_auto else "MANUAL_CONFIRM"
    
    # 5. 计算目标预算（含总调整量约束）
    optimal_budgets_raw = {c: total_budget * float(w) for c, w in zip(channels, optimal_weights)}
    
    # 约束：总变动量不超过max_total_change_ratio × total_budget
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：MMM 输出的各渠道 ROI 贡献系数与当前各渠道预算分配、总预算，以及自动执行阈值（默认 0.20）、人工确认阈值（默认 0.10）、单次最大总调整比例（默认 0.15）、单渠道最大变动比例（默认 0.50）与单期最大增幅（默认 0.50）。

**输出**：预算调整执行指令字典，含各渠道目标预算、API 调用参数与确认状态（无需调整、待确认、自动执行），供媒介团队或执行系统下发到各广告平台。

## 执行步骤

1. 用 Softmax 归一化 MMM 各渠道 ROI 系数得到最优权重
2. 计算当前预算权重并与最优权重比对取最大偏差
3. 偏差低于人工确认阈值时判定无需调整并返回原因
4. 偏差落入确认区间或超过自动阈值时确定执行模式
5. 在总调整量与单渠道变动上限内计算各渠道目标预算
6. 对增幅超单期上限的渠道拆分为多期执行并设定间隔
7. 输出 API 调用参数与确认状态供下发

## 边界与不做

- 何时不用：MMM 尚未产出渠道 ROI 系数、或各渠道预算未维护为可比口径时不适用；只需要决策结论、不打算执行时用决策类技能。
- 能力边界：只把权重差转成调整指令与 API 参数，真实预算变更仍需平台 API 与确认流程；不重新估计 MMM 系数。
- 执行纪律：调整量受总调整比例与单渠道变动上限约束，超单期增幅的渠道必须分期执行。

## 技能关联

- **前置**：Skill-Bayesian-MMM-Action-Plan-Generator.html、Skill-Bayesian-MMM-Action-Plan-Generator、Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Bayesian-MMM-Action-Plan-Generator.html、Skill-Bayesian-MMM-Action-Plan-Generator、Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **可组合**：Skill-Bayesian-MMM-Action-Plan-Generator.html、Skill-Bayesian-MMM-Action-Plan-Generator、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-MMM-Budget-Reallocation-Executor

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-MMM-Budget-Reallocation-Executor`