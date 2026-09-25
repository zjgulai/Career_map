---
name: "p2s-human-ai-collaborative-decision"
title: "人机协作决策框架 — 最优介入时机识别与置信阈值路由"
description: "触发词：置信阈值路由、人工介入时机、人机分流、复核队列、阈值寻优。何时不用：按问题类型固定三级分流用「MAS 客服智能升级路由」；本技能决定的是置信度边缘案例该不该转人工。安全边界：需使用校准后的概率而非原始打分，赔付与安全事故类案例必须保留人工兜底。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-110"
l3_business: "客诉分诊"
l3_all: "客诉分诊"
l1_l2_l3: "业务运营/服务与体验/客诉分诊"
p2s_card_id: "Skill-Human-AI-Collaborative-Decision"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让 AI 处理有把握的，拿不准的自动转人工，帮团队找到那条最省人力又不掉满意度的分界线。"
user_try: "试试：用我们的历史工单和机器人置信分，算出一组最优介入阈值，把转人工量降下来。"
whenToUse: "当已有 AI 打分或预测、需要决定哪些案例自动通过、哪些进人工复核队列时用；纯按业务类型固定分工用「MAS 客服智能升级路由」。"
workflow: "输入 AI 置信分与真实标签，计算三段式路由统计 → 网格搜索最小化人工成本与错误成本之和的阈值 → 输出高、低置信阈值与各区准确率 → 把低置信队列按优先级排给高级客服"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 人机协作决策框架 — 最优介入时机识别与置信阈值路由

## ① 解决的问题

客服运营面临"客服机器人对复杂投诉乱答引发客户愤怒、CSAT持续下滑"——置信阈值路由将人工介入量减少40%同时CSAT提升12分，年化节省客服人力8万元

## ② 核心算法逻辑

人机协作决策的核心是互补性原则：让 AI 处理它擅长的高确定性决策，将 AI 不确定的边缘案例路由给人工，实现系统整体优于纯 AI 或纯人工。

## ③ 业务应用场景

场景A：客户服务工单自动/人工分流 - 业务问题：客服机器人 70% 可以直接处理，但对复杂投诉（赔付纠纷、安全事故）乱答会加剧客户愤怒，需精准识别人工介入时机 - 数据要求：工单文本、机器人置信分、历史人工处理结果、处理时长 - 预期产出：设置 τ_high=0.85，τ_low=0.5，路由精准率 >90%，人工介入量减少 40% - 业务价值：客服人力节省 40%（约 8 万元/年），CSAT 提升 12 分，升级投诉率下降 25%
场景B：选品审核人机协作流水线 - 业务问题：新品引入审核需人工逐条评估（每天 200+ SKU），AI 评分高置信时人工审核是浪费 - 数据要求：历史 SKU 特征、AI 评分、最终人工判定结果 - 预期产出：高置信 SKU（>90%）自动通过/拒绝，低置信队列优先排给高级采购 - 业务价值：采购审核效率提升 3 倍，年化节省人力成本 12 万元
三轨验证 | 成本轨：AI情感陪伴模块月均成本1200元（API调用费800元/月、人工审核12小时/月×50元/小时=600元），年度投入14400元 | 合规轨：符合《网络安全法》第42条个人信息保护要求、《儿童个人信息网络保护规定》；需获得家长知情同意，建立内容审核机制，合规结论：可行，需补充隐私政策和分级陪伴内容库 | 风险轨：AI回复不当导致用户投诉（概率15%）、儿童信息泄露风险（概率8%）、模型幻觉影响育儿建议准确性（概率12%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：客服人力成本节省 30-50%，约 6-15 万元/年；决策质量提升使错误成本下降 40%
实施难度：⭐⭐⭐☆☆（需要 calibrated probability，历史标注数据 ≥ 500 条）
优先级：⭐⭐⭐⭐☆
评估依据：客服和审核是母婴出海最高人力密度场景，精准路由可将人力释放到真正需要人工判断的 20% 案例

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
人机协作决策框架 — 置信阈值路由 + 互补性评估
"""
import numpy as np
from typing import Dict, List, Tuple, Optional


def compute_routing_stats(
    ai_probs: np.ndarray,
    true_labels: np.ndarray,
    tau_high: float = 0.85,
    tau_low: float = 0.50
) -> Dict:
    """计算三段式路由的统计信息"""
    ai_preds = (ai_probs >= 0.5).astype(int)
    ai_correct = (ai_preds == true_labels)

    # 路由分区
    auto_accept = ai_probs >= tau_high        # AI 直接通过
    auto_reject = ai_probs <= (1 - tau_high)  # AI 直接拒绝
    review_zone = ~auto_accept & ~auto_reject  # 人工复核区

    high_conf = auto_accept | auto_reject
    low_conf = review_zone

    n_total = len(ai_probs)
    n_auto = high_conf.sum()
    n_review = low_conf.sum()

    # 各区准确率
    auto_accuracy = ai_correct[high_conf].mean() if n_auto > 0 else 0
    review_ai_accuracy = ai_correct[low_conf].mean() if n_review > 0 else 0

    return {
        "total": n_total,
        "auto_decided": int(n_auto),
        "auto_rate": round(float(n_auto / n_total), 3),
        "review_required": int(n_review),
        "review_rate": round(float(n_review / n_total), 3),
        "auto_accuracy": round(float(auto_accuracy), 4),
        "review_zone_ai_accuracy": round(float(review_ai_accuracy), 4),
        "tau_high": tau_high,
        "tau_low": tau_low
    }


def find_optimal_thresholds(
    ai_probs: np.ndarray,
    true_labels: np.ndarray,
    human_cost_per_case: float = 1.0,
    error_cost: float = 10.0,
    tau_candidates: Optional[List[float]] = None
) -> Dict:
    """网格搜索最优置信阈值（最小化总成本）"""
    if tau_candidates is None:
        tau_candidates = [0.6, 0.65, 0.7, 0.75, 0.80, 0.85, 0.90, 0.95]

    best_cost = float('inf')
    best_tau = 0.85
    results = []
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：工单文本、机器人置信分（需概率校准）、历史人工处理结果与处理时长；历史标注建议不少于 500 条以稳定阈值。

**输出**：高、低置信阈值建议（如 0.85 与 0.5）、自动处理率、人工复核率与各区准确率统计，供客服排班与复核队列设计。

## 执行步骤

1. 收集 AI 置信分、真实标签与人工处理成本
2. 按高、低阈值划分自动通过、自动拒绝与人工复核三段
3. 网格搜索最小化人工成本与错误成本之和的阈值
4. 输出阈值建议、自动处理率与各区准确率
5. 把低置信队列按优先级排给高级客服

## 边界与不做

- 何时不用：模型概率未校准或历史标注不足时，阈值会失准
- 能力边界：只输出路由阈值与统计结论，不替 AI 做最终判定，也不改动现有赔付与升级政策

## 技能关联

- **前置**：Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-Agent-Decision-Confidence-Threshold.html、Skill-Agent-Decision-Confidence-Threshold、Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-CS-Ticket-Intelligence.html、Skill-CS-Ticket-Intelligence、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **延伸**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-CS-Ticket-Intelligence.html、Skill-CS-Ticket-Intelligence、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **可组合**：Skill-CS-Ticket-Intelligence.html、Skill-CS-Ticket-Intelligence、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Human-AI-Collaborative-Decision

---

> 分类：业务运营/服务与体验/客诉分诊　·　技术族：11-AI人文　·　源卡：`Skill-Human-AI-Collaborative-Decision`