---
name: "p2s-geo-level-marketing-effectiveness"
title: "Geo-Level Marketing Effectiveness（地理级营销效果）"
description: "触发词：地理级实验、区域投放、对照组区域、预算集中、区域加投、效果外推。何时不用：只在单一区域投放或各区域无法分离时无法做地理对照；要判断渠道整体增量时用 MMM 或大盘归因。安全边界：用户数据需脱敏并符合 CCPA 等法规，跨境数据传输需加密，平台数据使用须遵守广告政策与 API 协议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Geo-Level-Marketing-Effectiveness"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让部分区域加投、其余区域当对照，判断哪些区域值得集中预算。"
user_try: "试试：我在美国 10 个州同时投放，帮我看哪些州值得加预算、哪些该减。"
whenToUse: "有多区域投放、需要判断区域级效果并集中预算时用本技能；只在一个区域投放时无法做地理对照；判断渠道整体增量时用 MMM 或大盘归因。"
workflow: "选取实验组区域与对照组区域 → 对实验组加投预算并保持其他条件一致 → 对比实验前后各区域转化率、日销与 ROAS → 剔除季节性等混杂因素 → 输出预算集中与区域取舍方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Geo-Level Marketing Effectiveness（地理级营销效果）

## ① 解决的问题

区域营销经理面临城市投放看不准——地理效应将预算浪费率从22%降到7%，年化省19万元

## ② 核心算法逻辑

论文：Inferring causal impact using Bayesian structural timeseries models | arXiv：1906.00563

## ③ 业务应用场景

品类：婴儿暖奶器（售价 $49.99，成本 $18.00） 背景：在美国 10 个州同步投放 Facebook 广告，全国平均 ROAS 为 2.1，日销 50 件，库存 2000 件面临滞销风险。 实验设计：选取加州、德州、纽约州为实验组（加投 30% 预算），其余 7 州为对照组。 结果： - 实验组加投后，加州转化率从 3.2% 升至 4.5%，日销从 12 件增至 22 件，ROAS 达到 3.2 - 德州转化率从 2.8% 升至 3.9%，日销从 8 件增至 15 件，ROAS 为 2.9 - 对照组各州 ROAS 平均仅 1.6，日销无显著变化 行动：将 60% 预算集中至加州和德
三轨验证 | 成本轨：API调用月均450元（TikTok+Amazon数据接入），数据处理计算月均300元，人工校验12小时/月（约1200元），总月成本约1950元 | 合规轨：符合Amazon Advertising政策、TikTok商业数据使用协议，用户数据脱敏处理符合CCPA要求，跨境数据传输采用加密通道，无个人隐私数据出境 | 风险轨：MMM模型多重共线性风险18%，建议月度模型验证；渠道数据延迟2-3天可能导致预算分配滞后，建议建立缓冲机制；平台API变更风险，需建立监控告警系统
**三轨验证** | 成本轨：BI工具订阅月均800元，机器学习模型训练计算月均600元，数据分析师0.5人力月成本8000元，总月成本约9400元 | 合规轨：符合中国《个人信息保护法》要求，母婴用户敏感信息加密存储，跨境数据传输需获得用户明示同意，定期进行合规审计 | 风险轨：预算优化过度拟合历史数据概率22%，建议引入A/B测试验证；季节性波动（母婴产品有明显节假日效应）可能影响模型准确度，建议按季度重训练；ROI+31%目标可能存在不可持续性，需建立长期基准线监测

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：年化 45 万元 | 难度：⭐⭐⭐☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（17 行）。**下面 17 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **17 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，17 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/geo_level_marketing_effectiveness` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Geo-Level-Marketing-Effectiveness.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Geo-Level Marketing Effectiveness — DiD Geo Lift"""

import numpy as np

def geo_lift_test(y_treat_pre, y_treat_post, y_ctrl_pre, y_ctrl_post):
    treat_diff = np.mean(y_treat_post) - np.mean(y_treat_pre)
    ctrl_diff = np.mean(y_ctrl_post) - np.mean(y_ctrl_pre)
    lift = treat_diff - ctrl_diff
    return {'lift': lift, 'significant': abs(lift) > np.std(y_ctrl_pre)*2}

# test
np.random.seed(42)
print(geo_lift_test(
    np.random.normal(100,10,30), np.random.normal(130,15,30),
    np.random.normal(100,10,30), np.random.normal(105,12,30)
))
print("[✓] Geo-Level 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.00563，但该号在 arXiv 上是《Direct Linear Time Construction of Parameterized Suffix and LCP Arrays for Constant Alphabets》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Inferring causal impact using Bayesian structural timeseries models》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：分州或分区域的投放金额、转化率、日销量与 ROAS 数据，以及全国基线与库存背景；需要实验组与对照组的清晰划分与一致的时间窗口。

**输出**：各区域的处理效应与 ROAS 对比、对照组基线、建议的预算集中比例与预期增量；供区域营销经理做预算再分配。

## 执行步骤

1. 选取实验组区域与对照组区域并保持其他条件一致
2. 对实验组加投预算并记录起止时间窗口
3. 对比实验前后各区域转化率、日销与 ROAS
4. 剔除季节性等混杂因素
5. 输出预算集中与区域取舍方案

## 边界与不做

- 何时不用：只在单一区域投放，或各区域间存在强烈跨区溢出（全国性品牌广告）时，地理对照失效。
- 能力边界：本技能产出区域效应与预算建议，不做投放执行。
- 数据边界：区域数据延迟与口径差异会造成预算分配滞后，需建立缓冲与校验机制。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation
- **可组合**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-Geo-Level-Marketing-Effectiveness

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Geo-Level-Marketing-Effectiveness`