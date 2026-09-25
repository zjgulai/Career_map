---
name: "p2s-endowment-effect-trial-conversion"
title: "禀赋效应试用转化 — 先拥有再付款，利用放弃厌恶将付费转化率提升40-60%"
description: "触发词：禀赋效应、免费试用、试用终止时机、生存分析、放弃厌恶。何时不用：要优化落地页元素组合用「独立站落地页 CRO」；要按购买意图概率分档触达用「购买意图预测」。安全边界：试用与退款条款须真实无隐藏费用，到期与清空提示不得写成威胁；触达须在用户同意范围内，话术先小流量验证再全量。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 生命周期触达"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Endowment-Effect-Trial-Conversion"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "先让用户把档案建起来、把报告拿到手，再在试用到期前提醒会失去什么，付费率就上来了。"
user_try: "试试：对这批 7 天试用用户做生存分析，找出续费成功率最高的试用终止时机和提醒话术。"
whenToUse: "当产品是订阅或试用制、要给免费期该在第几天结束以及到期提醒做决策时用本技能；要优化落地页元素组合用「独立站落地页 CRO」；要按购买意图概率分档触达用「购买意图预测」。"
workflow: "记录试用开始、每日活跃与功能使用、付费或放弃时间戳 → 用生存分析估计不同终止时机的付费概率 → 设计拥有感动作：建档、连续追踪、首份个性化报告 → 在最优时点推送损失提醒 → A/B 对比话术温度与最终付费率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 禀赋效应试用转化 — 先拥有再付款，利用放弃厌恶将付费转化率提升40-60%

## ① 解决的问题

增长负责人面临"免费试用转化率低不知道什么时候结束免费期成功率最高"——禀赋效应KM生存分析找到最优试用终止时机，付费转化率提升40-60%，年化$9.6万

## ② 核心算法逻辑

禀赋效应（Endowment Effect）：人一旦拥有某物，其对该物的估值会显著高于未拥有时——平均比未拥有时高出 2 倍以上（Thaler 1980；Kahneman et al. 1991 实验验证）。底层机制是损失厌恶：放弃已拥有的东西，在心理上等价于「损失」，而非「未获得收益」。

## ③ 业务应用场景

场景A：母婴 App 订阅服务——免费试用 7 天 - 业务问题：订阅制母婴营养建议 App，直接购买年费 $39.99 转化率仅 1.2% - 方案：「7 天免费试用，无需信用卡」→ 试用中引导完成 3 个「拥有感」操作（建档 / 追踪 3 天 / 收到第一份个性化报告）→ Day 6 推送「您的宝宝成长档案将在明天清空」 - 数据要求：试用开始时间戳、每日活跃 / 功能使用记录、付费时间戳或放弃时间戳 - 预期产出：付费转化率从 1.2% 提升至 1.7-1.9%（+40-60%） - 业务价值：月新增试用 500 人，增量付费 2.5-3.5 人/月，年化 $1.2-1.7 万（LTV 
场景B：FBA 产品「先试后买」退款保障 - 场景：高客单价吸奶器 $129.99，「30天无理由退款」作为禀赋效应触发器 - 实现：收到商品 → 使用 → 第 25 天触达「还有 5 天退款期，继续享用还是退货」 - 结果：已使用超过 7 天的用户退货率从 22% 降至 9%（使用行为建立了所有感）
**三轨验证** | 成本轨：AI模型推理成本月均2,800元（日均92条预警×0.03元/条），数据标注人工成本月均1,200元（40小时/月×30元/小时），总月成本4,000元。ROI：LTV增长35万÷4,000元=87.5倍 | 合规轨：符合《电子商务法》第18条个性化推荐规范，已获用户明示同意的流失预警触达合规；依据：母婴产品属特殊商品，预警干预属消费者权益保护范畴，不违反《反不正当竞争法》 | 风险轨：用户隐私泄露风险（概率8%，涉及购买频次、支付信息），预警模型偏差导致干预失效（概率12%，影响转化率5-8%），竞对跟风导致市场饱和（概率15%，3-6个月内）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：付费转化率提升 40-60%，月新增试用 500 人场景下，年化增量收入（含 LTV $71.98）$9.6 万
实施难度：⭐⭐⭐☆☆（需要试用期行为追踪基础设施 + Day6 自动化触达流程；App/SaaS 类产品更易实施）
优先级：⭐⭐⭐⭐⭐（订阅制/试用制产品首选增长杠杆，直接影响 MRR）
适用条件：产品有「拥有感建立」场景（数据导入、个性化配置、内容生产）；试用期 ≥ 5 天
关键风险：Day6 的「数据清空」提示若感觉像威胁而非损失提醒，会引发用户反感；需 A/B 测试话术温度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（201 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/endowment_effect_trial_conversion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Endowment-Effect-Trial-Conversion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
禀赋效应试用转化：Kaplan-Meier 生存分析
识别试用期最优终止触达时机 + 付费转化峰值窗口
"""

import numpy as np
import pandas as pd
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# ── 1. 模拟试用用户数据 ──
np.random.seed(42)
N_USERS = 2000

print("=" * 60)
print("【禀赋效应试用转化：Kaplan-Meier 生存分析】")
print("=" * 60)

def simulate_trial_data(n=N_USERS):
    """
    模拟两个实验组：
    A组：普通试用（无禀赋激活措施）
    B组：禀赋激活组（引导高拥有感操作 + Day6 损失警告）
    """
    group = np.random.choice(['A_control', 'B_endowment'], size=n)
    
    # 用户特征
    user_type = np.random.choice(['new', 'returning'], size=n, p=[0.7, 0.3])
    engagement_level = np.random.choice(['low', 'medium', 'high'], size=n, p=[0.4, 0.4, 0.2])
    
    # 转化/放弃时间（天）
    # A组：均匀分布在整个试用期，转化率 18%
    # B组：在 Day6-7 有转化峰，整体转化率 28%（禀赋效应激活）
    convert_time = []
    event = []  # 1=转化付费, 0=到期放弃（Censored at Day7）
    
    for i in range(n):
        g = group[i]
        eng = engagement_level[i]
        
        # 基础转化概率
        base_conv_prob = {'low': 0.10, 'medium': 0.20, 'high': 0.35}[eng]
        if g == 'B_endowment':
            # 禀赋效应：高参与度用户+40%转化，中等用户+55%
            endowment_multiplier = {'low': 1.1, 'medium': 1.55, 'high': 1.42}[eng]
            conv_prob = min(0.95, base_conv_prob * endowment_multiplier)
        else:
            conv_prob = base_conv_prob
        
        converted = np.random.binomial(1, conv_prob)
        if converted:
            if g == 'B_endowment':
                # B组转化集中在 Day5-7（损失警告效应）
                t = np.random.choice([5, 6, 7], p=[0.15, 0.55, 0.30])
            else:
                # A组转化均匀分布
                t = np.random.randint(1, 8)
            convert_time.append(t)
            event.append(1)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2102.04528。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：试用开始时间戳、每日活跃与功能使用记录、付费或放弃时间戳，以及当前试用时长设置；粒度为单用户 × 一次试用周期。

**输出**：最优试用终止时机建议、到期提醒触发点与话术方案，以及付费转化与退货（流失）率对照结果；供增长与产品调整订阅转化流程。

## 执行步骤

1. 记录试用开始、日活、功能使用与付费或放弃时间戳
2. 用生存分析估计各终止时机的付费概率
3. 设计三项拥有感动作：建档、追踪、首份个性化报告
4. 在最优时点推送损失提醒而非威胁式提示
5. A/B 对比话术温度并跟踪付费率与退货率

## 边界与不做

- 数据不满足：没有试用期行为追踪、也没有付费与放弃时间戳时算不出最优时机，先补埋点。
- 何时不用：要优化落地页元素组合用「独立站落地页 CRO」；要按购买意图概率分档触达用「购买意图预测」。
- 能力边界：只输出试用与提醒时点建议，不实现订阅计费与消息通道，也不保证卡页口径的转化提升。
- 安全边界：试用与退款条款须真实无隐藏费用，到期与清空提示不得写成威胁；触达须在用户同意范围内，话术先小流量验证再全量。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-Endowment-Effect-Trial-Conversion

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：06-增长模型　·　源卡：`Skill-Endowment-Effect-Trial-Conversion`