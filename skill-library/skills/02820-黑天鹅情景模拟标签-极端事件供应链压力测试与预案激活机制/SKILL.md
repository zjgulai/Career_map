---
name: "p2s-black-swan-scenario-simulation-tag"
title: "黑天鹅情景模拟标签 — 极端事件供应链压力测试与预案激活机制"
description: "触发词：黑天鹅、极端事件、压力测试、预案激活、韧性评分。何时不用：常规中断情景与备用路由用「供应链弹性压力测试」；多参数方案对比用「供应链 What-If 情景分析引擎」。安全边界：预案激活标签只做提示与门控，冻结、停单等动作必须由人工或模型外的确定性控制层执行。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 异常冻结与恢复"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-Black-Swan-Scenario-Simulation-Tag"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把封号、断供这类极端事件量化成 GMV 损失和恢复时间，并给每个场景打上预案激活标签。"
user_try: "试试：为平台封号和供应商断供两个黑天鹅场景跑压力测试，给出损失区间、恢复时间和是否激活预案。"
whenToUse: "当要评估低频高破坏事件（平台封号、供应商断供、关税突变）并预先绑定预案时用本技能；常规中断情景与备用路由，用「供应链弹性压力测试」；多参数方案对比，用「供应链 What-If 情景分析引擎」。"
workflow: "定义黑天鹅情景（发生概率、GMV 影响比例、持续与恢复周期、缓解成本、预案动作） → 按月度 GMV 与库存天数运行压力测试 → 量化每个情景的 GMV 损失与总损失，判定库存能否撑过 → 计算韧性评分并按概率阈值输出预案激活标签 → 按总损失排序输出风险清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 黑天鹅情景模拟标签 — 极端事件供应链压力测试与预案激活机制

## ① 解决的问题

风控面临"平台封号/供应商断供等极端事件没有预案"——黑天鹅情景模拟量化每个场景的GMV损失和恢复时间，触发预案激活Tag

## ② 核心算法逻辑

黑天鹅情景模拟 回答："如果发生了最坏的情况，我们的供应链能扛住多久？需要多长时间恢复？"

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：关税暴涨情景（年发生率15%）提前规划生产迁移，节省约50万关税差额；平台封号预案（提前建独立站+TikTok），减少封号期间GMV损失约80%
实施难度：⭐⭐⭐☆☆（主要是情景数据收集和预案制定，算法本身不复杂）
优先级评分：⭐⭐⭐⭐☆（2024年红海危机/2023年亚马逊封号潮已证明黑天鹅不是小概率事件）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（82 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/black_swan_scenario_simulation_tag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Black-Swan-Scenario-Simulation-Tag.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
黑天鹅情景模拟标签系统
功能：情景定义 / 压力测试计算 / 影响量化 / 预案激活 / 韧性评分
"""
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class BlackSwanScenario:
    scenario_id: str
    name: str
    probability: float       # 年发生概率
    gmv_impact_pct: float    # GMV影响比例（负数）
    duration_weeks: int      # 持续时间
    recovery_weeks: int      # 恢复时间
    mitigation_cost_usd: float  # 缓解成本
    contingency_actions: list = field(default_factory=list)


def run_stress_test(scenarios: list, monthly_gmv_usd: float,
                    current_inventory_days: float) -> list:
    """运行压力测试"""
    results = []
    for sc in scenarios:
        # GMV损失
        gmv_loss = monthly_gmv_usd * abs(sc.gmv_impact_pct) * sc.duration_weeks / 4.3
        # 库存是否能撑过
        inventory_survives = current_inventory_days > sc.duration_weeks * 7
        # 总损失
        total_loss = gmv_loss + sc.mitigation_cost_usd
        # 韧性评分（越高越能抗）
        resilience = min(100, max(0,
            (inventory_survives * 30) +
            (1 - sc.probability) * 30 +
            (1 - abs(sc.gmv_impact_pct)) * 20 +
            min(1, sc.mitigation_cost_usd / total_loss) * 20
        ))
        results.append({
            "scenario": sc.name, "probability": sc.probability,
            "gmv_loss_usd": round(gmv_loss, 0),
            "total_loss_usd": round(total_loss, 0),
            "duration_weeks": sc.duration_weeks,
            "inventory_survives": inventory_survives,
            "resilience_score": round(resilience, 1),
            "activate_contingency": sc.probability > 0.10,
            "tags": {
                f"scenario.{sc.scenario_id}.probability": sc.probability,
                f"scenario.{sc.scenario_id}.gmv_impact_pct": sc.gmv_impact_pct,
                f"contingency.{sc.scenario_id}.activate": sc.probability > 0.10,
            }
        })
    return sorted(results, key=lambda x: x["total_loss_usd"], reverse=True)


if __name__ == "__main__":
    print("【黑天鹅情景模拟标签系统】\n")
    scenarios = [
        BlackSwanScenario("S1", "主供应商断供", 0.08, -0.70, 4, 6, 15_000,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.11834。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：情景定义清单（年发生概率、GMV 影响比例、持续周数、恢复周数、缓解成本、预案动作）、月度 GMV 与当前库存天数。

**输出**：各情景的 GMV 损失、总损失、库存能否撑过、韧性评分与预案激活标签；供风控与供应链负责人使用。

## 执行步骤

1. 定义黑天鹅情景（发生概率、GMV 影响比例、持续与恢复周期、缓解成本、预案动作）
2. 按月度 GMV 与库存天数运行压力测试
3. 量化每个情景的 GMV 损失与总损失并判定库存能否撑过
4. 计算韧性评分并按概率阈值输出预案激活标签
5. 按总损失排序输出风险清单

## 边界与不做

- 数据不满足：情景概率、GMV 影响比例或库存天数不可得时评分失真，先做情景参数标定。
- 何时不用：常规中断与备用路由用「供应链弹性压力测试」；多参数方案对比用「供应链 What-If 情景分析引擎」；尾部风险 CVaR 量化用「蒙特卡洛地缘政治尾部风险量化」。
- 能力边界：产出情景评分与激活标签这类门控判据，不执行冻结、停单或切换供应商等动作；概率与影响比例来自业务估计，不是精确预测。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Holiday-Spike-Demand-Decomposition.html、Skill-Holiday-Spike-Demand-Decomposition、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Capacity-Booking-Engine.html、Skill-Supplier-Capacity-Booking-Engine、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **延伸**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Holiday-Spike-Demand-Decomposition.html、Skill-Holiday-Spike-Demand-Decomposition、Skill-Supplier-Capacity-Booking-Engine.html、Skill-Supplier-Capacity-Booking-Engine、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **可组合**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Holiday-Spike-Demand-Decomposition.html、Skill-Holiday-Spike-Demand-Decomposition、Skill-Supplier-Capacity-Booking-Engine.html、Skill-Supplier-Capacity-Booking-Engine、Skill-Black-Swan-Scenario-Simulation-Tag

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：24-标签工程　·　源卡：`Skill-Black-Swan-Scenario-Simulation-Tag`