---
name: "p2s-lead-time-distribution-risk-genqot"
title: "Gen-QOT 提前期分布建模 - 动态安全库存防海运延误"
description: "触发词：提前期分布建模、海运延误预警、分位数安全库存、在途异常、动态安全库存。何时不用：前置期稳定、只算常规安全库存时用「安全库存与补货策略」；要按 P95 与承诺期之比自动触发上调时走「前置期安全库存自动调整」。安全边界：预警后的提前下单须人工复核，防止假阳性造成过度备货。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 到货异常追踪"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Lead-Time-Distribution-Risk-GenQOT"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "海运动不动多走二十天，用前置期分布提前预警，把安全库存跟着往上抬。"
user_try: "试试：按历史 PO 到货时序拟合前置期分位数，标出 P90 与 P10 跨度超标要预警的航线。"
whenToUse: "海运或跨境前置期波动大、固定安全库存系数在旺季失效时用；只做常规补货量计算用「安全库存与补货策略」。"
workflow: "汇总历史 PO 到货时序与在途订单 → 拟合前置期经验分布得到分位数 → 监控分位数跨度并对超阈值航线预警 → 按季节或大促窗口条件化重算安全库存"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Gen-QOT 提前期分布建模 - 动态安全库存防海运延误

## ① 解决的问题

物流经理面临海运时效波动——风险分布建模将晚到率从18%降至6%，年化避损20万元

## ② 核心算法逻辑

母婴跨境海运提前期(Lead Time, LT)在 2550 天剧烈波动(苏伊士事件/港口拥堵). 传统安全库存假设 LT 固定,实际服务水平远低于设定值(设 95% 实际只有 85%). GenQOT 用深度自回归生成模型对 LT 进行分布式建模(不假设参数分布),并把"订单整批到货"扩展为分批随机到达(QOT, QuantityOverTime),精确建模拼箱拆批到港行为. 动态安全库存自适应季节性 + 港口拥堵期.

## ③ 业务应用场景

- 业务问题:苏伊士运河拥堵 / 巴拿马运河旱季 / 港口积压时,Momcozy 海运 LT 从均值 30 天变成 50+ 天,预警通常滞后 2-3 周才发现库存紧张. 单次缺货损失 BSR 排名(恢复需 3-6 月)+ 直接销售损失,单产品月损失约 30-80 万元 - 数据要求:历史 PO 到货时序(至少 200 条) + 当前在途订单 + 港口拥堵实时指数(可选) - Gen-QOT 配置: - GluonTS DeepAR 拟合 LT 经验分布,输出 P10/P50/P90 分位数 - 实时监控 $P_{90}(LT) - P_{10}(LT)$ 跨度,> 20 天触发预警 - 自动提
三轨验证： - 成本：数据采集需对接 ERP 系统 PO 到货时间戳，初期开发约 15-20 万元；GluonTS 模型训练需 GPU 实例（约 2000 元/月）；人力投入 1 名数据工程师 + 0.5 名供应链分析师，年人力成本约 40 万元。 - 合规：不涉及用户隐私数据，无 GDPR 风险；预警系统为内部决策工具，不触碰 Amazon 政策红线；港口拥堵指数使用公开 API（如 Clarksons）无合规问题。 - 风险：过度依赖预警可能导致人工判断弱化；若模型误报（假阳性）导致提前下单过多，可能增加库存持有成本 10-20%；需设置人工复核机制防止自动化误操作。
- 业务问题:Momcozy 双 11 期间需求和 LT 同时方差扩大,传统全年固定安全库存系数导致旺季前 6 周安全库存严重不足 + 旺季后 4 周积压. 旺季前估计 SS 不足 30-40% 导致大促爆款断货,旺季后积压占用 FBA 长期仓储费(月均 $0.15/立方英尺) - 数据要求:历史季节性需求 + 旺季 LT 数据 + 大促日历 - Gen-QOT 配置: - 按季节性 / 大促窗口条件化 Gen-QOT - 旺季前 6 周:$SS_{dynamic}$ 提升 40-70%(自适应) - 旺季后 4 周:$SS_{dynamic}$ 自动收缩 30% - 业务价值: - 旺季缺货

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:Silver-Meal 扩展公式有解析解,简单部署
易处:GluonTS DeepAR / MQ-CNN 开源,工程化路径成熟
难处:Amazon 主论文未开源,Gen-QOT 完整深度模型需自行实现
难处:LT 历史数据质量要求高(PO 到货时间戳精确)
难处:QOT 拼箱拆批数据采集需要 ERP 系统对接

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（120 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/lead_time_distribution_risk_genqot` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Lead-Time-Distribution-Risk-GenQOT.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Gen-QOT 提前期分布建模 + 动态安全库存最小骨架
论文 arXiv:2310.17168 (Amazon, 2024)
生产替换: GluonTS DeepAR / MQ-CNN 学习 LT 分布
依赖: pip install numpy scipy
"""
from __future__ import annotations
from typing import Dict, List

import numpy as np
from scipy import stats


def sample_lt_history(
    n: int = 365,
    base_days: int = 30,
    sigma_days: int = 7,
    congestion_prob: float = 0.1,
    congestion_extra: int = 15,
    seed: int = 42,
) -> np.ndarray:
    """模拟海运 LT 历史(生产替换为真实 PO 到货时序)
    - base_days/sigma_days: 正常 LT 分布
    - congestion_prob: 港口拥堵概率(10% 默认)
    - congestion_extra: 拥堵时额外延误天数
    """
    rng = np.random.default_rng(seed)
    normal = rng.normal(base_days, sigma_days, n)
    shocks = rng.choice([0, congestion_extra], size=n, p=[1 - congestion_prob, congestion_prob])
    return np.clip(normal + shocks, base_days - 10, base_days + 40).astype(int)


def fit_lt_distribution(lt_history: np.ndarray, context: Dict = None) -> Dict[float, float]:
    """Gen-QOT 风格:非参数经验分位数 LT 预测
    生产替换为 GluonTS DeepAR 或 MQ-CNN with context features
    """
    quantile_levels = [0.1, 0.5, 0.9, 0.95, 0.99]
    return {q: float(np.quantile(lt_history, q)) for q in quantile_levels}


def calc_safety_stock(
    demand_mean: float,
    demand_std: float,
    lt_quantiles: Dict[float, float],
    service_level: float = 0.95,
) -> Dict[str, float]:
    """三种安全库存计算:classic / dynamic / P99 buffer"""
    z = stats.norm.ppf(service_level)
    lt_mean = lt_quantiles[0.5]
    lt_std = (lt_quantiles[0.9] - lt_quantiles[0.1]) / 2.56

    ss_classic = z * demand_std * np.sqrt(lt_mean)

    sigma_ltd = np.sqrt(lt_mean * demand_std ** 2 + demand_mean ** 2 * lt_std ** 2)
    ss_dynamic = z * sigma_ltd

    ss_p99_buffer = demand_mean * (lt_quantiles[0.99] - lt_mean)

    return {
        "ss_classic": round(ss_classic, 0),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.17168，但该号在 arXiv 上是《Learning an Inventory Control Policy with General Inventory Arrival Dynamics》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史 PO 到货时序（至少 200 条）、当前在途订单与可选的港口拥堵实时指数，按航线或供应商与 PO 粒度组织，含到货时间戳。

**输出**：前置期分位数（P10/P50/P90/P95/P99）、跨度预警，以及经典、动态、P99 缓冲三种安全库存口径的对照结果，供安全库存与再订货点调整。

## 执行步骤

1. 清洗 PO 到货时序并分离正常期与拥堵期
2. 拟合前置期经验分布得到分位数
3. 监控 P90 与 P10 跨度并按阈值预警
4. 按季节或大促窗口条件化重算安全库存
5. 输出安全库存调整与预警建议

## 边界与不做

- 数据不满足时不适用：PO 到货时间戳不精确、或历史到货记录不足 200 条时，分位数与跨度都不可靠。
- 能力边界：只产出预警与安全库存参数，提前下单、锁舱与供应商沟通由人工执行；完整深度模型需自行实现。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **可组合**：Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-Lead-Time-Distribution-Risk-GenQOT

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Lead-Time-Distribution-Risk-GenQOT`