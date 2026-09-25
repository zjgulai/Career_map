---
name: "p2s-competitive-response-modeling"
title: "Competitive Response Modeling（竞争响应建模）"
description: "触发词：竞争响应、份额被抢、反制策略、竞品加投、损失估算、行动组合。何时不用：竞品动作与自身效果无相关时不必建模；只想按阈值自动触发防守动作时用竞品激增防御触发器。安全边界：竞品数据采集须走官方 API 并遵守平台服务条款、不使用爬虫，母婴品类内容需符合广告与质量安全规范。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 行动组合"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Competitive-Response-Modeling"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "估算竞品加投让我们损失多少，并给出该投多少预算、打哪些位置来反制。"
user_try: "试试：Momcozy 在 Prime Day 前把预算翻倍，我份额从 22% 掉到 14%，帮我算损失并给反制方案。"
whenToUse: "竞品加投导致自身展示份额明显下滑、需要量化损失并设计反制时用本技能；只需按阈值触发单次防守动作时用竞品激增防御触发器；常规份额监控不适用。"
workflow: "采集双方展示份额与竞品投放强度 → 建模竞品加投对自身份额与转化的影响 → 估算每日损失金额 → 组合品牌词与竞品词的反制手段并测算恢复份额 → 输出反制预算与监控频次"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitive Response Modeling（竞争响应建模）

## ① 解决的问题

Momcozy 在美国 Prime Day 前一周突然将吸奶器搜索广告预算翻倍，我们的 impression share 从 22% 跌到 14%

## ② 核心算法逻辑

竞品投放会劫持我们的广告效果（尤其是同一品类的搜索广告）。竞争响应建模量化"竞品加投 $X 导致我们损失多少"，并设计最优反制策略。

## ③ 业务应用场景

Momcozy 在美国 Prime Day 前一周突然将吸奶器搜索广告预算翻倍，我们的 impression share 从 22% 跌到 14%。模型估算损失 $8,000/天，建议反制：品牌词防守预算 +50%（$2000/天）+ 竞品词"Momcozy alternative"新增投放（$1500/天），预计可恢复至 19% share。
年化价值：15-30 万元（避免竞品蚕食）。
**三轨验证** | 成本轨：TikTok竞品投放监测系统月均成本3,500元（数据API接口1,500元+人工分析12小时/月×200元/小时=3,900元），Amazon MMM建模工具月均2,000元（SaaS订阅），总计月均5,500元；ROI+31%需投放预算≥20万/月才可达成 | 合规轨：符合《个人信息保护法》第三方数据使用规范，竞品数据采集需遵守TikTok/Amazon服务条款禁止爬虫条款，建议采用官方API接口；母婴品类需满足《跨境电商进出口商品质量安全风险预警和快速反应机制》，投放内容不涉及医疗宣传 | 风险轨：①平台政策变更风险（概率35%）：TikTok/Amazon

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：年化 15-30 万元 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（13 行）。**下面 13 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **13 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，13 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/competitive_response_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Competitive-Response-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Competitive Response Modeling"""

import numpy as np

def competitive_alert(our_share: float, comp_shares: list,
                      category_overlaps: list, threshold: float = 0.6):
    ci = sum(s * o for s, o in zip(comp_shares, category_overlaps)) / our_share
    return {'ci': ci, 'alert': ci > threshold,
            'response': 'defensive_brand+offensive_competitor' if ci > threshold else 'maintain'}

# test
print(competitive_alert(0.14, [0.28, 0.12], [0.9, 0.5]))
print("[✓] Competitive Response Mode 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：我方与竞品的展示份额、竞品投放强度或预算估算、我方转化率与客单价基线，以及品牌词与竞品词的可用投放位置。

**输出**：竞品加投造成的损失估算、反制组合（品牌词防守加码、竞品词新增投放等）与预算建议、预计恢复的份额区间；供投放负责人快速决策反制。

## 执行步骤

1. 采集双方展示份额与竞品投放强度数据
2. 建模竞品加投对自身份额与转化的影响
3. 估算每日损失金额
4. 组合品牌词与竞品词的反制手段并测算恢复份额
5. 输出反制预算与监控频次

## 边界与不做

- 何时不用：份额变化来自自身预算调整或季节性因素、与竞品动作无相关关系时，不要套用竞争响应模型。
- 能力边界：本技能产出损失估算与反制建议，不做投放执行。
- 合规边界：竞品数据采集须走官方 API 与平台服务条款、不使用爬虫，母婴品类内容需符合广告与质量安全规范。

## 技能关联

- **前置**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Competitive-Response-Modeling

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Competitive-Response-Modeling`