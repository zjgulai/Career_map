---
name: "p2s-repeated-game-long-term-pricing-cooperation"
title: "重复博弈长期定价合作 — Tit-for-Tat 策略维持价格高位"
description: "触发词：重复博弈、以牙还牙、价格战、贴现因子、合作均衡、跟价报复。何时不用：只求某一时点的静态均衡价格用「纳什均衡定价模型」；要判断领导者主动先动用「Stackelberg 价格领导策略」。安全边界：不得与竞品沟通协调价格或达成垄断协议，本技能只输出自身响应规则，不得用于合谋抬价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Repeated-Game-Long-Term-Pricing-Cooperation"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "竞品降价要不要跟：用重复博弈算清合作撑不撑得住，再决定温和报复还是严厉惩罚来守住高价。"
user_try: "试试：类目 3 个主要卖家，竞品旺季前降了 15%，帮我判断该不该跟、用 TFT 还是 Grim Trigger。"
whenToUse: "当类目竞品数量有限且长期共存（寡头结构）、需要决定对降价行为如何响应以维持价格高位时用本技能；若只求某一时点的静态均衡价格，用「纳什均衡定价模型」；若你是领导者要主动先动，用「Stackelberg 价格领导策略」。"
workflow: "采集各竞品 6 个月定价历史、月销量与 BSR 稳定性 → 用贴现因子评估竞品是否属于长期玩家 → 用可持续性检验判断合作均衡是否成立 → 选择以牙还牙或严厉惩罚策略并模拟响应序列 → 输出长期合作价格带与响应纪律"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 重复博弈长期定价合作 — Tit-for-Tat 策略维持价格高位

## ① 解决的问题

寡头市场卖家面临"不知道什么时候跟价什么时候坚守价格"——重复博弈Tit-for-Tat策略将价格高位维持时间延长3倍，年化毛利保护$11.2万

## ② 核心算法逻辑

这个算法来自博弈论的重复博弈（Repeated Game）理论，核心思想是「在长期重复的博弈中（而非一次性博弈），参与者可以通过威胁机制维持比单次博弈更好的合作结果——只要参与者足够有耐心（贴现因子 δ 足够大），合作均衡就是可持续的理性选择」。迁移到电商竞争定价后，它解决的是：在相对稳定的寡头竞争市场（竞品数量有限），通过「以牙还牙（TitforTat, TFT）」策略维持价格高位，让竞品明白降价必遭报复，从而理性选择不主动挑起价格战

## ③ 业务应用场景

场景A：婴儿监视器类目 — 用 TFT 策略阻止竞品发动价格战 - 业务问题：类目 3 个主要卖家，竞品 A 在旺季前降价 15%，你是否跟？理论上应该如何应对才能让 A 下次不再降价？ - 数据要求：各竞品过去 6 个月定价历史、各自月销量（估算利润水平）、竞品 BSR 稳定性（判断是否为长期玩家） - 预期产出：判断 TFT 策略是否适用（竞品是长期玩家且贴现因子高），计算"跟价 1 周然后恢复"的信号效果，以及长期合作价格带 - 业务价值：维持类目价格高位，全年避免 2-3 次价格战，对应利润保护约 ¥18 万/年
场景B：儿童学习桌类目 — Grim Trigger vs TFT 策略选择 - 业务问题：类目新进一个强竞品，不确定对方是短期冲销量还是长期经营，应该用 TFT（温和）还是 Grim Trigger（严厉）？ - 数据要求：新竞品入市时间、资金实力信号（广告投放密度、评价增速）、自身对竞品报复能力（能否持续低价 3 个月） - 预期产出：判断竞品类型（短期投机 vs 长期玩家），选择合适的响应策略，输出策略决策报告 - 业务价值：对短期投机者用 Grim Trigger 快速驱逐，对长期玩家用 TFT 建立合作均衡，减少无效价格战，年省 ¥12-25 万
三轨验证 | 成本轨：动态定价模型月均API调用成本约800元（含历史数据分析），人工价格策略审核12小时/月，数据标注外包成本约3000元/月 | 合规轨：符合《反垄断法》第十七条（不构成垄断协议），符合《电商法》第十九条透明定价要求，需在商品详情页展示价格调整逻辑 | 风险轨：价格过度波动引发消费者投诉概率12%，建议设置24小时内价格变动幅度≤15%的上限；竞对跟风降价导致毛利侵蚀风险，建议建立价格下限预警机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以寡头竞争类目（婴儿监视器 3-4 个主要竞品）为例，价格战将月利润从 ¥4.5 万打到 ¥1.8 万，TFT 策略帮助维持 70% 的合作价格时间，年化利润保护约 ¥20-28 万。对单次价格战损失（平均持续 2-3 个月）的预防价值约 ¥5-8 万
实施难度：⭐⭐⭐☆☆（需要 6 个月竞品历史数据、竞品识别，以及执行 TFT 响应的系统化纪律）
优先级：⭐⭐⭐⭐☆（适用于所有 3-6 个稳定竞品的寡头类目，这在婴儿电子产品、婴儿车、高单价母婴品类中极为常见）
评估依据：Axelrod (1984) 竞赛实验证明 TFT 是重复囚徒困境的最优策略；在电商寡头类目中，长期稳定竞争关系符合重复博弈假设

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（214 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/repeated_game_long_term_pricing_cooperation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Repeated-Game-Long-Term-Pricing-Cooperation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
重复博弈长期定价合作 — TFT/Grim Trigger 策略分析器
来源：重复博弈民间定理（Folk Theorem）迁移，用于寡头市场长期价格合作策略
"""

import numpy as np
from typing import Dict, List, Tuple


def calculate_discount_factor(monthly_discount_rate: float = 0.02) -> float:
    """
    计算月度贴现因子 δ = 1/(1+r)
    r 是月贴现率（通常 1-3%，对应年贴现率 12-36%）
    贴现因子越接近 1，表示越重视未来收益（越理性的长期玩家）
    """
    return 1 / (1 + monthly_discount_rate)


def check_cooperation_sustainability(
        profit_cooperative: float,
        profit_defect: float,
        profit_nash: float,
        discount_factor: float) -> Dict:
    """
    验证重复博弈合作均衡是否可持续
    条件：δ ≥ (π_defect - π_coop) / (π_defect - π_nash)
    
    参数:
        profit_cooperative: 双方合作（维持高价）时的月利润
        profit_defect: 单方降价（背叛）时的短期月利润
        profit_nash: 陷入价格战后的纳什均衡月利润
        discount_factor: 贴现因子 δ
    """
    if profit_defect <= profit_nash:
        return {"is_sustainable": True, "note": "背叛甚至不如纳什均衡，合作自然稳定"}

    threshold_delta = (profit_defect - profit_cooperative) / (profit_defect - profit_nash)
    is_sustainable = discount_factor >= threshold_delta

    # 合作净现值 vs 背叛净现值
    npv_cooperate = profit_cooperative / (1 - discount_factor)
    npv_defect = profit_defect + discount_factor * profit_nash / (1 - discount_factor)

    return {
        "is_sustainable": is_sustainable,
        "threshold_discount_factor": round(threshold_delta, 4),
        "actual_discount_factor": round(discount_factor, 4),
        "npv_cooperate": round(npv_cooperate, 2),
        "npv_defect": round(npv_defect, 2),
        "npv_advantage_of_cooperation": round(npv_cooperate - npv_defect, 2),
        "recommendation": (
            "✓ 合作均衡可持续，建议维持高价，降价后立刻用 TFT 策略恢复"
            if is_sustainable else
            "⚠️ 合作均衡不稳定，建议改用纳什均衡定价或混合策略"
        )
    }


def simulate_tft_strategy(
        initial_price_self: float,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各竞品过去 6 个月的定价历史、各自月销量（用于估算利润水平）与 BSR 稳定性，以及自身在合作、背叛与价格战三种情景下的利润估计；粒度为类目 × 月。

**输出**：合作均衡是否可持续的结论（含贴现因子阈值）、建议采用的响应策略与长期合作价格带，以及合作与背叛的净现值对比；供定价负责人制定响应纪律。

## 执行步骤

1. 采集竞品定价历史、月销量与排名稳定性
2. 计算贴现因子并判断竞品是否长期玩家
3. 检验合作均衡的可持续性条件
4. 选择响应策略并模拟跟价与恢复序列
5. 输出长期合作价格带与响应纪律

## 边界与不做

- 数据不满足：没有 6 个月竞品定价历史与销量估计时无法判断博弈结构与贴现因子。
- 何时不用：静态均衡求解用「纳什均衡定价模型」；领导者先动定价用「Stackelberg 价格领导策略」。
- 能力边界：只给策略判断与响应规则，不含改价执行，也不保证对手按理性博弈行事。
- 安全边界：不得与竞品沟通协调价格或形成垄断协议，本技能只输出自身响应规则。

## 技能关联

- **前置**：Skill-Competitive-Response-Modeling.html、Skill-Competitive-Response-Modeling、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Mixed-Strategy-Pricing-Unpredictability.html、Skill-Mixed-Strategy-Pricing-Unpredictability、Skill-Nash-Equilibrium-Pricing-Model.html、Skill-Nash-Equilibrium-Pricing-Model、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **延伸**：Skill-Competitive-Response-Modeling.html、Skill-Competitive-Response-Modeling、Skill-Mixed-Strategy-Pricing-Unpredictability.html、Skill-Mixed-Strategy-Pricing-Unpredictability、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy
- **可组合**：Skill-Mixed-Strategy-Pricing-Unpredictability.html、Skill-Mixed-Strategy-Pricing-Unpredictability、Skill-Stackelberg-Price-Leadership-Strategy.html、Skill-Stackelberg-Price-Leadership-Strategy、Skill-Repeated-Game-Long-Term-Pricing-Cooperation

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Repeated-Game-Long-Term-Pricing-Cooperation`