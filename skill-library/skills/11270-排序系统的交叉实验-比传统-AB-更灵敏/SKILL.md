---
name: "p2s-interleaving-ranking-ab-test"
title: "Interleaving for Ranking AB Test — 排序系统的交叉实验（比传统 AB 更灵敏）"
description: "触发词：交叉实验、排序灵敏度、搜索排序迭代、置信度加速、独立站推荐。何时不用：只对比两套 Listing 排序权重用「Interleaving 实验设计」；只评估推荐位算法迭代用「推荐系统交错实验」。安全边界：Amazon 等平台不允许控制自然搜索排序，本技术只用于站内推荐位与自有独立站；须记录文档来源算法并设质量下限保护体验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计 / 实验设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-Interleaving-Ranking-AB-Test"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "用交叉实验把两个排序列表混给同一批用户，把要 30 天才出结论的排序 A/B 压到 3 天，让模型迭代频率真正提上来。"
user_try: "试试：用交叉实验验证加了月龄特征的新排序模型，3 天内给我 80% 功效的胜负结论。"
whenToUse: "排序模型微调后传统 A/B 不灵敏、需要更高灵敏度或更短周期时用本技能；若只对比两套 Listing 排序权重，用「Interleaving 实验设计」；若只评估推荐位算法，用「推荐系统交错实验」。"
workflow: "准备两版排序模型的候选列表与点击流日志 → 用 Team Draft 构建交叉列表并标记文档来源 → 采集 query 级点击并做归因统计 → 以 500-1,000 用户样本完成显著性判定 → 输出排序模型胜负与迭代结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Interleaving for Ranking AB Test — 排序系统的交叉实验（比传统 AB 更灵敏）

## ① 解决的问题

搜索产品经理面临"排序算法微调传统AB实验不灵敏需要30天才能得出结论"——交叉实验将相同置信度所需实验时间从30天缩短至7天，年化加速搜索排序优化周期节省机会成本25-45万元

## ② 核心算法逻辑

交叉实验（Interleaving） 是评估排序/推荐系统优劣的高灵敏度在线实验方法，由 Netflix、Amazon、Spotify 等广泛应用。核心思想：将两个候选排序列表合并展示给同一用户，通过用户点击行为直接推断哪个列表更好，而非比较两组不同用户的平均行为。

## ③ 业务应用场景

场景1：Amazon 搜索排序算法迭代验证 - 业务问题：新一版婴儿产品搜索排序模型（加入月龄特征）vs 旧模型，传统 AB 需要 3 周 / 5 万流量才能得出结论，无法快速迭代 - 数据要求：搜索结果页点击流日志（query + 点击 + 位置），交叉实验样本量 500-1,000 用户 - 预期产出：3 天内以 80% 功效得出排序模型 A/B 胜负结论，实验周期缩短 85% - 业务价值：每月多迭代 3 次排序模型（原来 1 次），搜索转化率累计提升约 8%，月增 GMV 约 6 万元
场景2：婴儿推车个性化推荐算法对比 - 业务问题：协同过滤 vs 基于月龄的内容推荐，传统 AB 实验需要 2 周、1 万+用户，且用户群体差异大 - 数据要求：推荐位展示日志 + 点击日志，每日 500+ 会话 - 预期产出：交叉实验 2 天得出推荐算法胜负，准确度与传统 14 天 AB 相当 - 业务价值：推荐迭代加速 7×，加购率提升路径更快，月均推荐 GMV 贡献提升约 12%
**三轨验证**： - 成本：需要后端支持交叉列表生成逻辑，工程成本约 3 人天；需日志记录每个文档的来源算法 - 合规：Amazon 平台不允许直接控制搜索排序（自然排序），本技术主要用于站内推荐位和自有独立站 - 风险：若两算法产生的交叉列表质量差（相关性低），可能影响用户体验（需设置质量下限保护）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：排序模型迭代周期从 3 周缩短到 3 天，每月多迭代 3 次，搜索转化率年度累计提升约 15-25%；以月均推荐 GMV 50 万元估算，提升 8% 则月增 4 万元
实施难度：⭐⭐⭐⭐☆（需要后端交叉列表生成 + 点击归因日志，工程复杂度中等；算法实现约 3-5 人天）
优先级：⭐⭐⭐⭐☆
评估依据：母婴跨境独立站或 TikTok 店铺的个性化推荐是核心竞争力；传统 AB 测试排序系统周期太长，严重限制算法迭代速度；交叉实验是工业界评测排序系统的黄金标准（Netflix/Amazon 均在使用）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（200 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass

# ============================================================
# Interleaving Experiment for Ranking System AB Test
# ============================================================

@dataclass
class Document:
    doc_id: str
    score_a: float   # 算法 A 的评分
    score_b: float   # 算法 B 的评分
    source: str = ""  # 'A', 'B', 'AB'（两者都选了）


def team_draft_interleave(list_a: list[str], list_b: list[str],
                           k: int = 10) -> list[Document]:
    """
    Team-Draft Interleaving (TDI) 算法
    交替从 A、B 列表中选取文档构建交叉列表
    """
    docs_a = list(list_a)  # 副本，防止修改原始列表
    docs_b = list(list_b)

    interleaved = []
    seen_from_a = set()
    seen_from_b = set()

    turn = 0  # 0=A先选, 1=B先选，交替
    while len(interleaved) < k and (docs_a or docs_b):
        if turn == 0:  # A 轮
            # 从 A 列表选第一个未出现在交叉列表中的文档
            selected = next((d for d in docs_a if d not in seen_from_b or
                              d in seen_from_a), None)
            if selected is None and docs_a:
                selected = docs_a[0]
            if selected:
                docs_a.remove(selected)
                source = "AB" if selected in {d.doc_id for d in interleaved} else "A"
                if source == "A":
                    seen_from_a.add(selected)
                    # 检查是否 B 也选了这个（交叉文档）
                    if selected in docs_b:
                        docs_b.remove(selected)
                        source = "AB"
                    interleaved.append(Document(doc_id=selected,
                                                 score_a=0, score_b=0,
                                                 source=source))
        else:  # B 轮
            selected = next((d for d in docs_b if d not in seen_from_a or
                              d in seen_from_b), None)
            if selected is None and docs_b:
                selected = docs_b[0]
            if selected:
                docs_b.remove(selected)
                source = "B"
                seen_from_b.add(selected)
                if selected in docs_a:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：搜索结果页点击流日志（query + 点击 + 位置），以及两版排序模型各自输出的候选列表；交叉实验样本量需 500-1,000 用户，推荐场景每日 500+ 会话。

**输出**：交叉列表与归属标记、显著性判定结果（如 3 天内以 80% 功效得出结论）、排序模型胜负与后续迭代节奏建议。

## 执行步骤

1. 准备两版排序模型的候选列表
2. 构建交叉列表并标记每条文档的来源算法
3. 采集点击流并做 query 级归因统计
4. 达样本量后做显著性判定
5. 输出胜负结论与迭代建议

## 边界与不做

- 拿不到点击流日志、或后端无法生成交叉列表时工程上不可行；样本量不足则灵敏度优势无法体现
- 交叉列表相关性过低会伤害用户体验，需设置质量下限保护
- Amazon 等平台不允许控制自然搜索排序，本技术只能用于站内推荐位与自有独立站

## 技能关联

- **可组合**：Skill-Interleaving-Ranking-AB-Test

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：02-A_B实验　·　源卡：`Skill-Interleaving-Ranking-AB-Test`