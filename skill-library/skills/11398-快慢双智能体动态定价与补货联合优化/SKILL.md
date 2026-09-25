---
name: "p2s-fsda-drl"
title: "FSDA-DRL 快慢双智能体动态定价与补货联合优化"
description: "触发词：定价补货联合优化、快慢双智能体、大促折扣、动态定价、大促仿真。何时不用：只调补货不动价格时用「自动补货决策」；只做清仓降价阶梯时走「降价清仓触发」。安全边界：折扣率与补货量仅作建议，接入 Repricer 或 ERP 的自动执行须经人工授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 价格敏感性"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-FSDA-DRL"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把打几折和补多少货放到一起仿真，避免大促里前面贱卖、后面无货可推。"
user_try: "试试：按 8000 件期初库存和竞品价跑一遍 30 天大促仿真，给出每日折扣率和每周补货建议。"
whenToUse: "大促期间价格与补货互相牵制、需要联合决策或先做仿真复盘时用；日常只调补货量时用「补货模拟」的常规补货技能。"
workflow: "配置期初库存、成本价、竞品价与补货到货天数 → 用仿真环境跑完整个促销周期 → 输出定价侧的最优折扣率与补货侧的补货建议量 → 给出利润预测曲线与库存消耗预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FSDA-DRL 快慢双智能体动态定价与补货联合优化

## ① 解决的问题

补货经理面临频繁扰动下决策慢——DRL将补货响应从2天压至2小时，年化省15万元

## ② 核心算法逻辑

FSDADRL（FastSlow DualAgent Deep Reinforcement Learning）用两个独立的 RL 智能体，在不同时间频率上分别解决"定价"（快决策）和"补货"（慢决策）问题，并通过共享环境状态让它们协作而非博弈。

## ③ 业务应用场景

业务问题 大促活动前，供应链团队按"历史月销 × N 倍"备货了 8000 件吸奶器。运营团队为冲排名，首日打 7 折卖出 5000 件，第 3 天库存告急后被迫涨价，剩余 7 天流量白白浪费——整个大促周期总利润反而低于平销期。
数据要求 | 数据类型 | 字段 | 更新频率 | |---------|------|---------| | 库存数据 | SKU 在仓件数、在途件数、安全水位 | 实时 | | 销售数据 | 日销量、小时销量、历史大促曲线 | 日/小时 | | 竞品数据 | 竞品实时售价、竞品库存状态（有货/无货） | 每 4 小时 | | 商品数据 | 建议零售价、采购成本、仓储成本 | 静态 |
预期产出 - 定价 Agent：每天输出最优折扣率（可接入 Amazon Repricer API 自动执行） - 补货 Agent：每周输出补货建议量（与 ERP 采购模块对接） - 仿真报告：大促全周期的利润预测曲线与库存消耗预测

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

大促全周期利润提升 15~20%，年化价值约 225~300 万元/年
已有 Python 仿真框架，核心逻辑可直接复用
需要对接实际 ERP/仓储数据（数据接入工作量较大）
RL 模型从规则策略升级为真正训练的神经网络需要 1~2 个月历史数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（20 行）。**下面 20 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **20 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，20 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/supply_chain/fsda_drl` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-FSDA-DRL.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import PromoSimulator

# 初始化仿真环境（对应真实大促配置）
sim = PromoSimulator(
    initial_inventory=8000.0,    # 期初库存（件）
    base_price=299.0,            # 建议零售价
    cost_price=120.0,            # 采购成本
    competitor_price=289.0,      # 竞品基准价
    lead_time_days=3,            # 补货到货天数
    random_seed=42,
)

# 运行 30 天大促仿真
result = sim.run_episode()

# 结果示例:
# total_reward:         2,565,222.77 元
# service_level:        100.0%
# avg_discount:         79.8%
# replenishment_count:  4 次
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2410.21109，但该号在 arXiv 上是《Dual-Agent Deep Reinforcement Learning for Dynamic Pricing and Replenishment》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：库存数据（在仓、在途、安全水位，实时）、销售数据（日销量、小时销量、历史大促曲线，日/小时）、竞品数据（实时售价与竞品库存状态，约每 4 小时）、商品数据（建议零售价、采购成本、仓储成本，静态）。

**输出**：定价侧每日最优折扣率、补货侧每周补货建议量，以及大促全周期利润预测曲线与库存消耗预测，供 Repricer/ERP 对接与人工复核。

## 执行步骤

1. 配置期初库存、基价、成本价、竞品基准价与前置期
2. 运行大促周期仿真得到利润与服务水平
3. 让定价侧输出每日最优折扣率
4. 让补货侧输出每周补货建议量
5. 汇总利润预测曲线与库存消耗预测供复核

## 边界与不做

- 数据不满足时不适用：没有竞品实时价或小时级销量、只能拿到月度汇总时，仿真参数失真。
- 能力边界：折扣率与补货量是建议值，不直接改价也不下单；卡页置信度为 medium，策略上线前需用历史数据回测。

## 技能关联

- **前置**：Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-FSDA-DRL

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-FSDA-DRL`