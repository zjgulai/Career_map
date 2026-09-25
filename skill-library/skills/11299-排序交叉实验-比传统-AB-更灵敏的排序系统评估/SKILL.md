---
name: "p2s-ranking-interleaving-ab"
title: "排序交叉实验 — 比传统 AB 更灵敏的排序系统评估"
description: "触发词：交叉实验、排序评估、Interleaving、小样本实验。何时不用：需要绝对指标结论时用传统 AB 测试，交叉实验只能测相对偏好；没有线上点击反馈时用离线评测类技能。安全边界：混合展示不得干扰用户最终选择权，须保证展示顺序公平。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计 / 实验设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-Ranking-Interleaving-AB"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "把两套排序结果混在一起展示，用更少样本判断哪套算法更受用户偏好。"
user_try: "试试：我想验证新版搜索排序是不是更好，但样本量不够，帮我设计一次交叉实验。"
whenToUse: "本卡属「算法评估设计」。排序算法有微小改进、传统 AB 需要大量样本才能达到统计功效时用本卡；只有离线日志、拿不到线上点击时用离线评测类技能。"
workflow: "准备两套排序结果与会话日志 → 混合展示两套算法结果 → 统计点击归属 → 判断相对偏好是否显著"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 排序交叉实验 — 比传统 AB 更灵敏的排序系统评估

## ① 解决的问题

搜索算法工程师面临"传统AB测试对排序微小改进不灵敏需要大量样本"——交叉排序实验将相同统计功效所需样本量降低70%，年化加速搜索排序迭代速度节省实验等待成本20-35万元

## ② 核心算法逻辑

交叉实验（Interleaving Experiment） 是评估排序系统的高灵敏度方法，由 Netflix/Spotify 等推荐场景广泛使用。核心思想：在同一次会话中，将两个排序算法（A 和 B）的结果交叉混合展示给用户，通过用户点击哪个算法的结果来判断偏好，而非传统 AB 测试的"分组对比"。

## ③ 业务应用场景

场景1：亚马逊站内搜索排序算法迭代（A9 优化） - 业务问题：新排序算法 CTR 提升 1%，但传统 AB 测试需要 3 周才能达到统计功效 - 数据要求：用户搜索会话（query + 排序结果列表 + 点击位置） - 方法：Team Draft Interleaving，每次搜索混合两个算法结果，统计点击归属 - 预期产出：500 次搜索会话即可达到相同统计功效（vs 传统 AB 需 5 万次点击） - 业务价值：排序迭代速度从 1 次/月提升至 10 次/月，复利效应下 CTR 年提升 +15-25%，GMV 年增 50-100 万元
场景2：母婴 Listing 推荐位排序（相关性评估） - 业务问题：新相关性模型 vs 旧模型，需评估哪个对"奶粉 + 辅食"跨品类推荐更准确 - 数据要求：推荐 session（展示列表 + 点击 + 加购） - 方法：Balanced Interleaving，控制两个算法各自排名高位的位置偏见 - 预期产出：2000 session 即可检测 5% 相对偏好差异 - 业务价值：推荐准确率每提升 10%，关联购买率提升约 3%，年化 GMV +30 万元
**三轨验证**： - 成本：需改造推荐服务支持"混合排序结果"，工程复杂度约 10 人天 - 合规：混合展示不违反平台规则（不干扰用户最终选择权），展示顺序公平 - 风险：交叉实验只能评估**相对偏好**，无法检测绝对指标（如 CVR 提升幅度），需与 AB 测试互补

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：排序迭代速度 10× 提升，从 1 次/月到 10 次/月，累积 CTR 改善贡献 GMV 50-100 万元/年
实施难度：⭐⭐⭐⭐☆（需改造推荐/搜索服务支持混合结果，工程难度中等偏高）
优先级：⭐⭐⭐⭐☆（已有排序系统且频繁迭代的卖家/平台必选）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（202 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
排序交叉实验 — Team Draft Interleaving 模拟与灵敏度对比
依赖：pip install numpy pandas scipy
"""
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass


@dataclass
class RankingList:
    """排序结果列表"""
    algorithm: str
    items: list[str]   # 按排名顺序的 item ID


def team_draft_interleave(
    list_a: RankingList,
    list_b: RankingList,
    k: int = 10,
    random_state: Optional[int] = None,
) -> tuple[list[tuple[str, str]], str]:
    """
    Team Draft Interleaving：交叉合并两个排序列表。
    返回：[(item_id, algorithm_owner), ...], first_team
    """
    rng = np.random.default_rng(random_state)
    first = rng.choice(["A", "B"])  # 随机先手

    result = []
    used = set()
    a_idx, b_idx = 0, 0
    teams = {"A": [], "B": []}

    current = first
    while len(result) < k:
        if current == "A":
            while a_idx < len(list_a.items) and list_a.items[a_idx] in used:
                a_idx += 1
            if a_idx < len(list_a.items):
                item = list_a.items[a_idx]
                used.add(item)
                teams["A"].append(item)
                result.append((item, "A"))
                a_idx += 1
        else:
            while b_idx < len(list_b.items) and list_b.items[b_idx] in used:
                b_idx += 1
            if b_idx < len(list_b.items):
                item = list_b.items[b_idx]
                used.add(item)
                teams["B"].append(item)
                result.append((item, "B"))
                b_idx += 1
        current = "B" if current == "A" else "A"

        if a_idx >= len(list_a.items) and b_idx >= len(list_b.items):
            break
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户搜索会话数据（query、排序结果列表、点击位置）或推荐 session（展示列表、点击、加购）。

**输出**：两套排序算法的相对偏好结论与达到相同统计功效所需会话量，用于排序迭代的快速上线决策。

## 执行步骤

1. 准备两套待比较的排序结果与对应会话日志
2. 按 Team Draft 或 Balanced 方式混合展示两套结果
3. 统计每次搜索的点击归属并累计偏好差
4. 判断偏好差是否显著并给出迭代建议

## 边界与不做

- 只有离线指标、拿不到线上点击反馈时不用本卡
- 本卡产出相对偏好结论，无法检测绝对指标提升幅度，需与 AB 测试互补
- 混合展示不得干扰用户最终选择权，须保证展示顺序公平

## 技能关联

- **可组合**：Skill-Ranking-Interleaving-AB

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：02-A_B实验　·　源卡：`Skill-Ranking-Interleaving-AB`