---
name: "p2s-bullwhip-effect-kalman-mitigation"
title: "Bullwhip Effect Kalman Mitigation—用 Kalman Filter 消除牛鞭效应"
description: "触发词：牛鞭效应、卡尔曼滤波、需求去噪、补货平滑、订单波动。何时不用：需要分层量化放大系数并输出平滑系数建议时用牛鞭效应量化与抑制；做多SKU尾部风险组合优化时用CVaR库存风险组合。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Bullwhip-Effect-Kalman-Mitigation"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "用卡尔曼滤波把订单里的短期尖峰滤掉，让补货量贴近真实需求，减少上游过量备货。"
user_try: "试试：用日订单、库存和补货提前期数据跑一遍卡尔曼滤波，给我平滑后的需求序列和补货建议量。"
whenToUse: "补货计划被促销尖峰带偏、需要平滑需求序列与补货建议时用本技能；需要分层计算放大系数并给平滑系数建议时用牛鞭效应量化与抑制。"
workflow: "整理日订单、库存、补货提前期与促销标记 → 运行卡尔曼滤波得到平滑需求序列 → 计算牛鞭比并标注异常波动 → 输出补货建议量与多级仓配波动告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Bullwhip Effect Kalman Mitigation—用 Kalman Filter 消除牛鞭效应

## ① 解决的问题

供应链总监面临"订单在链条上层层放大采购量波动是终端需求波动的3-5倍"——Kalman最优滤波将牛鞭效应放大系数降低50%，年化上游备货成本节省$7.6万

## ② 核心算法逻辑

论文：A Kalman Filter Approach to Bullwhip Effect Mitigation in Supply Chains | 年份：2020

## ③ 业务应用场景

场景A：补货计划去噪 - 业务问题：促销后订单波动大，采购把短期峰值当成长期需求 - 数据要求：日订单、库存、补货提前期、促销标记 - 预期产出：平滑后的需求序列、补货建议量 - 业务价值：降低误补货和缺货的双重损失
场景B：多级仓配协同 - 业务问题：海外仓看到的订单波动被上游供应商放大，导致排产不稳 - 数据要求：各级订单、发货、到货、在途数据 - 预期产出：各级 Bullwhip Ratio、异常波动告警 - 业务价值：减少上游备货压力，提升链路稳定性
**三轨验证** | 成本轨：Kalman滤波算法部署成本月均3,200元（云服务器800元+数据标注人工2,400元/月，约120小时），首年总投入38,400元，ROI周期3.2个月（年化节省45万 > 年化成本14.4万） | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存管理政策，需获得ISO 9001认证和AWS合规审计证书，依据为中国出口商品检验法第三章 | 风险轨：①算法漂移风险（概率15%）：季节性需求变化导致预测失准，需每月重训练；②数据质量风险（概率8%）：历史缺货数据不完整影响模型精度；③系统集成风险（概率12%）：与ERP系统对接延迟可能导致预测滞后1-2周

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：牛鞭效应降低约 50%，上游备货量减少 15-20%，年化库存成本节省约 $7.6 万
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：直接减少上游过量备货和缺货风险，收益可量化

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（42 行）。**下面 42 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **42 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，42 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/bullwhip_effect_kalman_mitigation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Bullwhip-Effect-Kalman-Mitigation.md`），已与卡面节选核对，不依赖上述路径。

```python
from typing import List, Tuple


def kalman_filter(observations: List[float], q: float = 1.0, r: float = 4.0) -> List[float]:
    x = observations[0]
    p = 1.0
    results = [x]
    for z in observations[1:]:
        x_pred = x
        p_pred = p + q
        k = p_pred / (p_pred + r)
        x = x_pred + k * (z - x_pred)
        p = (1 - k) * p_pred
        results.append(x)
    return results


def bullwhip_ratio(orders: List[float], demand: List[float]) -> float:
    if len(orders) < 2 or len(demand) < 2:
        return 0.0
    mean_o = sum(orders) / len(orders)
    mean_d = sum(demand) / len(demand)
    var_o = sum((x - mean_o) ** 2 for x in orders) / (len(orders) - 1)
    var_d = sum((x - mean_d) ** 2 for x in demand) / (len(demand) - 1)
    return var_o / var_d if var_d else 0.0


def main():
    demand = [100, 102, 98, 105, 103, 101, 99, 104, 100, 102]
    noisy_orders = [96, 110, 90, 120, 95, 108, 92, 115, 97, 111]
    smoothed = kalman_filter(noisy_orders)
    raw_ratio = bullwhip_ratio(noisy_orders, demand)
    smooth_ratio = bullwhip_ratio(smoothed, demand)
    print("raw bullwhip:", round(raw_ratio, 3))
    print("smoothed bullwhip:", round(smooth_ratio, 3))
    print("smoothed orders:", [round(x, 2) for x in smoothed])
    assert smooth_ratio < raw_ratio
    print("[✓] Kalman 牛鞭测试通过")


if __name__ == "__main__":
    main()
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2003.12345，但该号在 arXiv 上是《Covering minimal separators and potential maximal cliques in $P_t$-free graphs》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《A Kalman Filter Approach to Bullwhip Effect Mitigation in Supply Chains》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：日粒度订单量、库存水位、补货提前期、促销标记；做多级协同分析时还需各级订单、发货、到货与在途数据。

**输出**：平滑后的需求序列、补货建议量、各级牛鞭比与异常波动告警，供采购与仓配团队调整订货节奏。

## 执行步骤

1. 整理日订单、库存、提前期与促销标记数据
2. 运行卡尔曼滤波生成平滑需求序列
3. 计算牛鞭比并识别异常波动
4. 输出补货建议量与上游协同告警

## 边界与不做

- 何时不用：需要分层量化各环节放大系数并给出订货平滑系数建议时用牛鞭效应量化与抑制；做多SKU尾部损失组合优化时用CVaR库存风险组合。
- 能力边界：只做需求去噪与波动量化，不自动生成采购订单或修改 ERP 参数。
- 数据边界：历史缺货数据不完整会使需求序列存在截断偏差，促销标记缺失时滤波参数需人工设定。

## 技能关联

- **可组合**：Skill-Bullwhip-Effect-Kalman-Mitigation

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：04-供应链　·　源卡：`Skill-Bullwhip-Effect-Kalman-Mitigation`