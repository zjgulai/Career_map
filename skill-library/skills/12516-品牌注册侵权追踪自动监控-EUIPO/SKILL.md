---
name: "p2s-brand-registry-infringement-tracker"
title: "Brand Registry Infringement Tracker — 品牌注册侵权追踪自动监控 EUIPO/USPTO"
description: "触发词：商标监控、近似商标、异议窗口、EUIPO 扫描、USPTO 公告。何时不用：要监控平台在售仿冒与图片盗用用「商标侵权主动监控」；要在上架前评估我方侵权风险用「上架前 IP 侵权扫描」。安全边界：异议与举报材料须经商标代理人或法务确认；只用公开公告数据，不得用于恶意抢注或骚扰竞争者。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索 / 争议证据组织"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-Brand-Registry-Infringement-Tracker"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "每周扫描 EUIPO 与 USPTO 的新商标申请，发现近似商标后提前准备异议材料，别错过异议窗口。"
user_try: "试试：扫描本周 EUIPO 相关类目的新商标申请，找出与我们的品牌名编辑距离和 Jaro-Winkler 相似度过高的申请。"
whenToUse: "需要监控官方商标公告并抢异议窗口时用本技能；监控平台在售仿冒与图片侵权用「商标侵权主动监控」；上架前评估我方侵权风险用「上架前 IP 侵权扫描」。"
workflow: "按 NICE 分类拉取 EUIPO 与 USPTO 新申请公告 → 对申请名称计算编辑距离与 Jaro-Winkler 相似度 → 筛出高相似度申请并按类目与图形 Logo 人工复核 → 在异议窗口内组织证据并提交 Opposition"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Brand Registry Infringement Tracker — 品牌注册侵权追踪自动监控 EUIPO/USPTO

## ① 解决的问题

品牌运营面临"竞品在欧洲以近似商标抢注3个月后才发现错过Opposition窗口"——商标相似度自动扫描每周监控EUIPO/USPTO新申请，提前3个月提交Opposition，年化保护品牌价值100-500万元

## ② 核心算法逻辑

论文：A Benchmark for Trademark Similarity Detection Using Levenshtein and JaroWinkler | 年份：2020

## ③ 业务应用场景

场景：某母婴品牌「MomzCare」在美国注册 USPTO 商标，监控系统发现竞品在欧洲以「MomsCare」申请 EUIPO 商标（编辑距离 2，Jaro-Winkler 0.95），提前 3 个月发现并提交 Opposition（异议）。
数据要求：品牌名称、分类（NICE Classification）、图形 Logo，EUIPO/USPTO 申请公告数据。
应用：自动每周扫描 EUIPO 相关类目新申请，识别近似商标，3 个月内成功提交 Opposition 并获批，避免商标注册侵权既成事实。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100-500 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（125 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def levenshtein_distance(s1: str, s2: str) -> int:
    """计算编辑距离"""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost)
    return dp[m][n]

def jaro_winkler_similarity(s1: str, s2: str, p: float = 0.1) -> float:
    """计算 Jaro-Winkler 相似度"""
    if s1 == s2:
        return 1.0

    len_s1, len_s2 = len(s1), len(s2)
    match_dist = max(len_s1, len_s2) // 2 - 1
    match_dist = max(0, match_dist)

    s1_matches = [False] * len_s1
    s2_matches = [False] * len_s2
    matches = 0
    transpositions = 0

    for i in range(len_s1):
        start = max(0, i - match_dist)
        end = min(i + match_dist + 1, len_s2)
        for j in range(start, end):
            if s2_matches[j] or s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len_s1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    jaro = (matches/len_s1 + matches/len_s2 + (matches - transpositions/2)/matches) / 3
    # Winkler 前缀加分
    prefix = 0
    for i in range(min(4, len_s1, len_s2)):
        if s1[i] == s2[i]:
            prefix += 1
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.03589，但该号在 arXiv 上是《Higher-Order Explanations of Graph Neural Networks via Relevant Walks》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《A Benchmark for Trademark Similarity Detection Using Levenshtein and JaroWinkler》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：品牌名称、NICE 分类与图形 Logo，以及 EUIPO 与 USPTO 的申请公告数据（公开可查）。

**输出**：近似商标申请清单与相似度评分（编辑距离、Jaro-Winkler），以及异议所需证据与提交时点建议，供品牌与法务团队使用。

## 执行步骤

1. 按类目拉取官方商标新申请公告数据
2. 计算申请名称与自有品牌的编辑距离和相似度
3. 筛出高相似度申请并人工复核图形与类目
4. 整理异议证据并在窗口期内提交 Opposition

## 边界与不做

- 公告数据缺失或品牌未在任何市场注册时不适用，异议主体资格与优先权无法成立
- 只做相似度检索与证据组织，不代替商标代理人做法律判断与提交
- 检索仅限公开数据，不得用于恶意抢注、骚扰或打压正常竞争者

## 技能关联

- **可组合**：Skill-Brand-Registry-Infringement-Tracker

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：19-风控反欺诈　·　源卡：`Skill-Brand-Registry-Infringement-Tracker`