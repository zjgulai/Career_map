---
name: "p2s-causal-attribution-bridge"
title: "Causal Attribution Bridge（因果归因桥梁）"
description: "触发词：相关性改因果、归因偏差修正、渠道真实贡献、预算重配、内容归因。何时不用：受隐私约束、无用户级数据时做渠道归因用隐私保护因果归因技能，评估达人层级增量用 KOL 因果归因技能，本技能把归因比例从相关性口径换成因果口径。安全边界：不得用相关性归因份额对外汇报渠道贡献，涉用户数据须脱敏并在授权范围内使用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Causal-Attribution-Bridge"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把按点击算的归因比例换成因果口径，让预算别再投给本来就会买的人。"
user_try: "试试：把 TikTok 和 Google 的归因从相关性口径换成因果口径，给出预算重配建议。"
whenToUse: "发现某渠道归因比例明显偏高、怀疑把本来就会购买的用户算作渠道贡献时用本技能；受隐私约束、不能使用用户级数据时用隐私保护因果归因技能，评估达人层级回报用 KOL 因果归因技能。"
workflow: "列出各渠道的相关性归因份额 → 取得各渠道的因果增量效应 → 归一化为因果份额并算偏差 → 按因果份额重配预算 → 复核整体回报与周转变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal Attribution Bridge（因果归因桥梁）

## ① 解决的问题

TikTok 内容归因：naive 归因给 45%，因果 ITE 只有 32%——因为 13% 的"内容驱动购买"实际上是用户本身的品类偏好驱动的

## ② 核心算法逻辑

传统广告归因是相关性的（"点了广告→买了"），因果归因是反事实的（"如果没有这个广告→还会买吗"）。核心：用增量因果效应替代 naive 归因比例。

## ③ 业务应用场景

品类：婴儿暖奶器（客单价 $39.9，日销 50 件，库存 2000 件，转化率 4.5%，ROAS 3.2）
问题：TikTok 内容归因 naive 给 45%，因果 ITE 只有 32%——13% 的"内容驱动购买"实际是用户品类偏好驱动。导致 TikTok 预算 $40K/月被高估，Google 搜索广告预算 $20K/月被低估。
因果纠正： - TikTok 预算从 $40K 下调至 $30K（-25%），释放 $10K 转投 Google 搜索广告（因果 ITE 高 50%） - 重新分配后，整体 ROAS 从 3.2 提升至 4.1（+28%） - 库存周转率从 1.2 次/月提升至 1.5 次/月（+25%），减少滞销风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：45 万元/年 | 难度：⭐⭐⭐☆☆ | 优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（15 行）。**下面 15 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **15 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，15 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/causal_attribution_bridge` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Causal-Attribution-Bridge.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np

def causal_vs_correlation_attribution(naive_shares, causal_ite):
    """naive_shares: 相关性归因, causal_ite: 因果增量效应"""
    total_ite = sum(causal_ite)
    causal_shares = [ite/total_ite for ite in causal_ite]
    bias = [c - n for c, n in zip(causal_shares, naive_shares)]
    return {'causal_shares': causal_shares, 'bias': bias}

# test
naive = [0.45, 0.35, 0.20]  # TikTok, Google, FB
ite = [320, 480, 200]        # 因果效应
r = causal_vs_correlation_attribution(naive, ite)
print(f"TikTok bias: {r['bias'][0]:+.0%} (因果纠正)")
print("[✓] Causal Attribution Bridge 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道的相关性归因份额，以及各渠道的因果增量效应估计值；因果效应本身需由实验、匹配或增量分析类方法先行得出。

**输出**：修正后的因果归因份额与各渠道偏差（卡页案例中内容渠道被高估约 13 个百分点）、预算重配方案；卡页口径把内容渠道预算下调 25% 转投搜索广告后整体回报从 3.2 提升到 4.1、年化价值 45 万元。

## 执行步骤

1. 整理各渠道的相关性归因份额。
2. 获取或估计各渠道的因果增量效应。
3. 归一化为因果份额并计算两者偏差。
4. 按因果份额重配渠道预算。
5. 复核整体回报与库存周转变化。

## 边界与不做

- 拿不到任何渠道的因果效应估计（无实验、无匹配条件）时不要用，本技能只做口径换算、不产生因果证据。
- 能力边界：修正幅度完全取决于上游因果估计的可靠性，上游估错会让偏差更大；卡页的回报提升与年化价值为特定案例口径。
- 合规红线：不得用相关性归因份额直接对外汇报渠道贡献，涉及用户数据须脱敏且在授权范围内使用。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Causal-Attribution-Bridge

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Attribution-Bridge`