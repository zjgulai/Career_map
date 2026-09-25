---
name: "p2s-personalized-promotion-targeting"
title: "Personalized Promotion Targeting — 个性化促销定向：用户响应异质性建模"
description: "触发词：个性化促销定向、增量响应、预算分配、背包分配、换购提升、分群投放。何时不用：要估个体级效应用于精准发券用「因果提升模型」；要做价格形式实验用「心理定价 A/B 测试」。安全边界：分群不得使用受保护属性；促销成本与预算约束须真实，不得对已自然转化的用户重复补贴。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 增量分析"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Personalized-Promotion-Targeting"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "谁值得发、谁发了也是白给：按分群增量响应和预算做分配，把促销钱花在会被说服的人身上。"
user_try: "试试：我的 Stage1 到 Stage2 奶粉换购是全量投放，帮我按月龄加 RFM 分群，算一版有限预算下的最优投放组合。"
whenToUse: "当促销预算有限、要在若干用户分群之间做分配（投给谁、投多少）时用本技能；若要做到用户级精准发券，用「因果提升模型」；若验证价格形式效果，用「心理定价 A/B 测试」。"
workflow: "按宝宝月龄与 RFM 划分用户分群 → 用历史数据估计各群的绝对响应与基线响应概率 → 计算各群增量响应概率与每元成本的增量价值 → 在预算约束下用背包或贪心算法分配名额 → 输出投放组合与预期换购率、人均成本变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Personalized Promotion Targeting — 个性化促销定向：用户响应异质性建模

## ① 解决的问题

增长经理面临促销一刀切——个性化定向将转化率从3.2%提到4.6%，年化增收24万元

## ② 核心算法逻辑

论文：Uplift Modeling for Multiple Treatments with Cost Constraints | 年份：2017

## ③ 业务应用场景

业务问题：品牌推出"Stage1→Stage2奶粉换购"优惠，Stage2 售价更高，换购成功即提升 LTV。但如果发给所有 Stage1 用户，大量原本会自然升阶的用户白白享受了折扣。
应用流程： 1. 用户分群：基于宝宝月龄（4月龄以下/4-5月龄/6月龄以上）+ RFM 分群 2. 关键洞察：6月龄以上用户已自然升阶（Sure Things），4-5月龄用户是最佳目标（Persuadables） 3. 响应模型：历史数据估计每群的增量响应概率 $\Delta p_i$ 4. Knapsack 分配：在促销预算下，优先分配给 ROI = $\Delta p_i \times \Delta LTV_i / cost_i$ 最高的分群
预期产出： - 仅投放 4-5 月龄用户（30% 的活跃 Stage1 用户），节省 70% 促销成本 - 换购率：从全体投放的 12% 提升至精准投放的 28% - 人均促销成本降低 40%，整体 ROI 提升 2.3x

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处：Knapsack 贪心算法简单高效；分群可复用现有 RFM 逻辑
难处：增量响应概率需要历史 A/B 数据或 Uplift

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（297 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/personalized_promotion_targeting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Personalized-Promotion-Targeting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Personalized Promotion Targeting — 个性化促销定向
异质性响应建模 + Knapsack 预算优化

纯 Python 标准库，无 sklearn/pandas 依赖
Python 3.8+ 兼容
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class UserSegment:
    """用户分群的促销响应特征"""
    segment_id: str
    segment_name: str
    n_users: int                    # 该分群用户数
    propensity_to_respond: float    # 绝对响应概率 P(buy | promo)
    baseline_response: float        # 无促销响应概率 P(buy | no promo)
    expected_value: float           # 响应后期望 LTV 增量（$）
    cost: float                     # 人均促销成本（$）

    @property
    def incremental_response(self) -> float:
        """增量响应概率 = 有促销 - 无促销（排除 Sure Things）"""
        return max(0.0, self.propensity_to_respond - self.baseline_response)

    @property
    def roi_per_dollar(self) -> float:
        """每美元促销成本的期望增量价值"""
        if self.cost <= 0:
            return 0.0
        return (self.incremental_response * self.expected_value) / self.cost

    @property
    def segment_type(self) -> str:
        """自动识别象限类型"""
        if self.incremental_response < 0.02:
            if self.baseline_response > 0.5:
                return "Sure Things"
            return "Lost Causes / Sleeping Dogs"
        if self.roi_per_dollar < 0.5:
            return "Low ROI Persuadables"
        return "Persuadables"


@dataclass
class AllocationResult:
    """分配结果"""
    segment: UserSegment
    allocated_users: int
    allocation_fraction: float      # 该分群中被分配的比例
    expected_incremental_ltv: float
    total_cost: float
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1706.03478，但该号在 arXiv 上是《Menon-type identities concerning Dirichlet characters》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Uplift Modeling for Multiple Treatments with Cost Constraints》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各用户分群的人数、绝对响应概率、无促销时的基线响应概率、响应后的期望生命周期价值增量、人均促销成本，以及总促销预算；粒度为分群 × 一次活动。

**输出**：各分群的分配名额与比例、预期增量价值与总成本，以及分群类型判定（可说服者、必然购买者、低产出比人群）；供增长团队确定投放组合。

## 执行步骤

1. 按月龄与 RFM 划分用户分群
2. 估计各群绝对响应与基线响应概率
3. 计算增量响应与每元增量价值
4. 在预算约束下做名额分配
5. 输出投放组合与预期换购率变化

## 边界与不做

- 数据不满足：没有历史 A/B 数据或提升模型结果时增量响应概率只能假设，分配结果不可靠。
- 何时不用：用户级精准发券用「因果提升模型」；价格形式实验用「心理定价 A/B 测试」。
- 能力边界：只做分群与预算分配，不含券发放执行与生命周期价值预测模型建设。
- 安全边界：分群不得使用受保护属性；预算与成本口径须真实，避免重复补贴已自然转化用户。

## 技能关联

- **前置**：Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **可组合**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Personalized-Promotion-Targeting

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：14-用户分析　·　源卡：`Skill-Personalized-Promotion-Targeting`