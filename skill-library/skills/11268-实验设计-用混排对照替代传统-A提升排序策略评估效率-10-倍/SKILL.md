---
name: "p2s-interleaving-experiment-design"
title: "Interleaving 实验设计 — 用混排对照替代传统 A/B，提升排序策略评估效率 10 倍"
description: "触发词：Interleaving、混排实验、Team-Draft、排序策略、显著性检验。何时不用：评估推荐位的推荐算法用「推荐系统交错实验」；要对照交错与传统 A/B 的周期与灵敏度差异用「排序系统交叉实验」。安全边界：混排只评估排序质量、不测展示效果与价格差异；须在可自主控制的排序位上执行，不得干预平台自然搜索排序。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计 / 实验设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-Interleaving-Experiment-Design"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "让同一个用户在同一次请求里看到 A、B 两套排序混排的结果，用他点了谁来判断哪套策略更好，几天就能出结论。"
user_try: "试试：用 Team-Draft 混排对比这两套 Listing 排序权重，2 天内给我显著性结论。"
whenToUse: "要在几天内比较两套排序策略、流量窗口紧张时用本技能；若对比场景是推荐位的推荐算法，用「推荐系统交错实验」；若需要对照交错与传统 A/B 的周期与灵敏度差异，用「排序系统交叉实验」。"
workflow: "准备搜索词、候选 ASIN 列表与 A/B 两套排序分 → 用 Team-Draft 方式混排两组列表并记录归属 → 收集用户点击并按归属归因到策略 → 用 bootstrap 做显著性检验并给出 Δ 置信区间 → 输出策略优劣结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Interleaving 实验设计 — 用混排对照替代传统 A/B，提升排序策略评估效率 10 倍

## ① 解决的问题

算法工程师面临"排序策略A/B实验周期长、流量消耗大"——Interleaving混排将实验所需样本量降低95%，年化多跑25轮迭代实验，GMV增量年化12.5万元

## ② 核心算法逻辑

传统 A/B 实验将用户随机分为两组分别看到策略 A 或 B，需要大量流量和长时间才能检测出细微差异（因为用户间行为方差大）。Interleaving 的思路是：让同一个用户在同一次请求里同时看到两个策略混排的结果，通过用户点击哪个策略的内容来判断偏好。

## ③ 业务应用场景

场景A：Amazon Listing 搜索结果排序策略快速迭代
品类运营想对比两种 Listing 排序权重（策略A：CVR权重0.4，策略B：CTR权重0.5）哪个更能提升用户点击购买。传统A/B需要2周+5000用户才能达到显著性，搜索引擎Interleaving只需2天+500次搜索。
- 业务问题：排序策略迭代速度慢，每次实验占用太多流量窗口 - 数据要求：搜索词、候选 ASIN 列表、策略A/B 各自的排序分、用户点击记录 - 预期产出：$\Delta_{AB}$ 置信区间，显著性检验（bootstrap），策略优劣结论 - 业务价值：排序迭代周期从 2 周压缩到 2 天，每年可多跑 25 轮实验，ROI 提升 3-5 倍

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：排序实验周期从14天→2天，年可多迭代25轮策略，以每轮排序提升带来 $0.5 万 GMV 增量计，年化增量 $12.5 万
实施难度：⭐⭐☆☆☆（核心逻辑简单，主要工作是日志打标和归因追踪）
优先级：⭐⭐⭐⭐☆（搜索/推荐迭代频繁的团队必备，ROI明确）
评估依据：Netflix/Airbnb等均已将Interleaving作为排序策略的标准评估工具；对于 GMV > $100 万/月的品类，每快一周发现好策略就价值数万美元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（176 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict
from typing import List, Tuple, Dict
import random

# ─────────────────────────────────────────────
# Team-Draft Interleaving 实验框架
# 适用于搜索排序/推荐列表策略对比
# ─────────────────────────────────────────────

def team_draft_interleave(
    list_a: List[str],
    list_b: List[str],
    k: int = 10
) -> Tuple[List[str], Dict[str, str]]:
    """
    Team-Draft Interleaving：将 A、B 两个排序列表混排
    
    Returns:
        interleaved: 混排结果列表
        ownership: {item_id: 'A'|'B'} 每条记录归属策略
    """
    team_a, team_b = [], []
    interleaved = []
    ownership = {}
    
    ptr_a, ptr_b = 0, 0
    
    while len(interleaved) < k and (ptr_a < len(list_a) or ptr_b < len(list_b)):
        # 随机决定本轮谁先选
        if random.random() < 0.5:
            order = ['A', 'B']
        else:
            order = ['B', 'A']
        
        for team in order:
            if len(interleaved) >= k:
                break
            if team == 'A' and ptr_a < len(list_a):
                item = list_a[ptr_a]
                ptr_a += 1
                while item in ownership and ptr_a < len(list_a):
                    item = list_a[ptr_a]
                    ptr_a += 1
                if item not in ownership:
                    interleaved.append(item)
                    ownership[item] = 'A'
                    team_a.append(item)
            elif team == 'B' and ptr_b < len(list_b):
                item = list_b[ptr_b]
                ptr_b += 1
                while item in ownership and ptr_b < len(list_b):
                    item = list_b[ptr_b]
                    ptr_b += 1
                if item not in ownership:
                    interleaved.append(item)
                    ownership[item] = 'B'
                    team_b.append(item)
    
    return interleaved, ownership
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1208.3671，但该号在 arXiv 上是《The Frieden-Soffer Extreme Physical Information Principle in a Non-extensive Setting》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：搜索词、候选 ASIN 列表、策略 A/B 各自的排序分，以及用户点击记录；实验日志需保留每条结果的归属策略。

**输出**：策略 A/B 的 Δ 置信区间与 bootstrap 显著性检验结果、策略优劣结论，以及可复用的混排实验日志与归因数据。

## 执行步骤

1. 准备搜索词、候选列表与两套排序分
2. 执行 Team-Draft 混排并记录归属
3. 收集点击并归因到对应策略
4. 用 bootstrap 做显著性检验
5. 输出策略优劣结论与置信区间

## 边界与不做

- 点击日志无法记录结果归属、或流量太小不足以在目标周期内达显著时不适用
- 混排只评估排序质量，不测试展示效果与价格差异
- 实验须在可自主控制的排序位上执行，不得用于干预平台自然搜索排序

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size、Skill-Ranking-Interleaving-AB.html、Skill-Ranking-Interleaving-AB、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **延伸**：Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Ranking-Interleaving-AB.html、Skill-Ranking-Interleaving-AB、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **可组合**：Skill-Ranking-Interleaving-AB.html、Skill-Ranking-Interleaving-AB、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB、Skill-Interleaving-Experiment-Design

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：02-A_B实验　·　源卡：`Skill-Interleaving-Experiment-Design`