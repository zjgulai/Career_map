---
name: "p2s-roi-prioritized-skill-ranking"
title: "ROI 优先级排名 — AHP 三维度 Skill 智能推荐"
description: "触发词：技能优先级、ROI 排序、AHP、资源分配、数据就绪度。何时不用：技能注册与发现走「技能注册表」；技能全生命周期治理走「技能生命周期设计」。安全边界：评分只能使用已核实的 ROI 与就绪度输入，不得为凑排名编造收益数字。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / 经济性分析"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-ROI-Prioritized-Skill-Ranking"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一堆技能摆着不知道先做哪个时，按收益、难度和现有数据能不能用，直接排出优先级。"
user_try: "试试：Q3 有 20 个候选 Skill、只有 2 个人，帮我按 ROI 排个优先级出来。"
whenToUse: "当候选技能多于团队资源、需要排优先级时用；若只是技能注册与发现，用「技能注册表」；若要做生命周期治理，用「技能生命周期设计」。"
workflow: "收集候选技能的 ROI 估算、难度与数据就绪度 → 构建 AHP 判断矩阵并做一致性检验 → 计算加权得分并生成排名 → 输出前几名及排序理由说明 → 按团队数据清单匹配零门槛可用技能"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ROI 优先级排名 — AHP 三维度 Skill 智能推荐

## ① 解决的问题

运营决策者面临"不知道当前阶段先学哪个Skill性价比最高"——AHP三维度评分将最高ROI Skill推荐精准度提升至91%，决策时间从2小时压缩至即时

## ② 核心算法逻辑

核心思想：用层次分析法（AHP）对每个 Skill 进行「ROI 潜力 / 实施难度 / 数据就绪度」三维度加权评分，输出优先级排行榜，推荐「今天就能用」的高价值低门槛 Skill。

## ③ 业务应用场景

场景A：季度 Sprint 技能优先级排序
- 业务问题：Q3 Sprint 有 20 个候选 Skill 可实施，数据团队 2 人、3 个月预算，需要选最值钱的 5 个先做 - 数据要求：每个候选 Skill 的 ROI 估算值（来自 ps_override）、实施难度星级（1-5）、团队现有数据就绪度（0-1） - 预期产出：排行榜 Top-5：如 `Skill-Demand-Forecasting-Supply-Chain`（得分 0.91）排第一，附带「为什么」解释报告 - 业务价值：避免先做难度大但数据不就绪的 Skill，Sprint ROI 提升估算 35%，避免浪费约 40 人·天 ≈ 8 万元
- 业务问题：运营不懂技术，想知道「哪些 Skill 是我有数据就能马上用的」 - 数据要求：运营填写数据清单（有/没有：销量历史、广告报表、评论数据、库存数据），系统自动匹配数据就绪度 - 预期产出：推荐「零门槛今日可用」清单：需要「销量历史」的 Skill 全部高亮，并按 ROI 降序排列 - 业务价值：消除「我不知道我能用什么」的信息差，运营工具化使用率从 15% → 60%，年化产出提升约 20 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Sprint 资源优化避免浪费 40 人·天 ≈ 8 万元；运营工具化使用率提升带来年化产出增量约 15 万元。总年化约 23 万元
实施难度：⭐⭐☆☆☆（仅需 numpy；AHP 矩阵可通过问卷自动生成，5分钟配置）
优先级：⭐⭐⭐⭐⭐（依赖数据均来自现有 ps_override.yaml，零冷启动；可立即接入 Playbook Dashboard）
评估依据：AHP 是决策科学经典方法，CR 一致性检验保证权重可靠性；难度低而影响大

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（121 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
ROI 优先级排名引擎 — AHP 三维度多准则决策
"""
import numpy as np
from typing import List, Dict, Tuple


def ahp_weights(comparison_matrix: np.ndarray) -> Tuple[np.ndarray, float]:
    """
    AHP 求权重向量 + 一致性比率
    comparison_matrix: n×n 判断矩阵（Saaty 1-9 标度）
    返回：(权重向量, CR一致性比率)
    """
    n = comparison_matrix.shape[0]
    # 列归一化 → 行均值作为权重
    col_sums = comparison_matrix.sum(axis=0)
    normalized = comparison_matrix / col_sums
    weights = normalized.mean(axis=1)

    # 一致性检验
    lambda_max = (comparison_matrix @ weights / weights).mean()
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0
    # RI 随机一致性指数（n=1,2,3,4,5对应 0,0,0.58,0.90,1.12）
    ri_table = {1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12}
    ri = ri_table.get(n, 1.12)
    cr = ci / ri if ri > 0 else 0
    return weights, cr


def normalize_scores(values: List[float]) -> np.ndarray:
    """Min-Max 归一化到 [0, 1]"""
    arr = np.array(values, dtype=float)
    mn, mx = arr.min(), arr.max()
    if mx == mn:
        return np.ones_like(arr) * 0.5
    return (arr - mn) / (mx - mn)


def rank_skills_by_roi(
    skills: List[Dict],
    ahp_matrix: np.ndarray = None,
    top_k: int = 5
) -> List[Dict]:
    """
    三维度 AHP 排名
    skills: 每个 dict 包含:
        name, roi_value(万元), difficulty(1-5), data_readiness(0-1)
    ahp_matrix: 3×3 判断矩阵 [ROI, difficulty, data_readiness]
    """
    if ahp_matrix is None:
        # 默认权重：ROI 最重要，实施难度其次，数据就绪度第三
        ahp_matrix = np.array([
            [1,   3,   5],    # ROI vs difficulty=3倍重要, vs data=5倍
            [1/3, 1,   3],    # difficulty vs data=3倍重要
            [1/5, 1/3, 1],    # data_readiness
        ])

    weights, cr = ahp_weights(ahp_matrix)
    print(f"AHP 权重: ROI={weights[0]:.3f}, 难度={weights[1]:.3f}, 数据={weights[2]:.3f} | CR={cr:.3f}")
    if cr > 0.1:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2103.09265，但该号在 arXiv 上是《Bio-inspired Robustness: A Review》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需每个候选技能的 ROI 估算、实施难度星级（1-5）与团队数据就绪度（0-1）、现有数据清单，候选技能级粒度；卡页称数据来自现有配置，可零冷启动。

**输出**：产出技能优先级排名与得分（卡页示例某技能得分 0.91）、排序理由说明、零门槛可用技能清单，供运营决策者与数据团队排期使用。

## 执行步骤

1. 收集候选技能的 ROI 估算、难度与数据就绪度
2. 构建 AHP 判断矩阵并做一致性检验
3. 计算加权得分并生成优先级排名
4. 输出 Top 排名与排序理由说明
5. 匹配零门槛可用技能（按团队数据清单）

## 边界与不做

- 候选技能只有两三个或资源不受限时，多准则排序没有必要
- 排名质量取决于输入的 ROI 与就绪度数据，本技能不负责核算这些数字
- 输入必须先核实，不得为凑排名编造收益

## 技能关联

- **前置**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Business-Problem-to-Skill-Retrieval.html、Skill-Business-Problem-to-Skill-Retrieval、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner
- **延伸**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner
- **可组合**：Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner、Skill-ROI-Prioritized-Skill-Ranking

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-ROI-Prioritized-Skill-Ranking`