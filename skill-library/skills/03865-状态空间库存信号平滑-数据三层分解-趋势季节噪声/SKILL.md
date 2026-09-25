---
name: "p2s-state-space-inventory-signal-smoothing"
title: "状态空间库存信号平滑 — FBA数据三层分解（趋势+季节+噪声）"
description: "触发词：状态空间、三层分解、基线漂移、促销干预、季节分量。何时不用：只要实时追踪需求水平与置信区间时用「卡尔曼滤波需求状态追踪」；只量化月度季节倍率时用「STL 季节性分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-State-Space-Inventory-Signal-Smoothing"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把年增长、每周季节和算法调整带来的基线漂移分开，看清真实水位，提前八到十二周备货。"
user_try: "试试：用状态空间分解我两年周销，把季节峰谷和亚马逊算法带来的基线漂移分开给我看。"
whenToUse: "需要区分季节变化与算法基线漂移、并显式建模促销干预时用；只要需求水平实时估计用卡尔曼滤波需求状态追踪；只量化月季节倍率用 STL 季节性分解。"
workflow: "准备至少 2 年周销量与可选的 FBA 库存快照 → 拟合结构时间序列得到趋势、季节与去季节化基线 → 把促销日期与折扣作为外生干预显式建模 → 输出峰谷时点与提前 8-12 周备货建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 状态空间库存信号平滑 — FBA数据三层分解（趋势+季节+噪声）

## ① 解决的问题

数据分析师面临"FBA库存数据有延迟和噪声趋势判断经常被虚假信号误导"——状态空间三层分解（趋势+季节+噪声）将库存决策信噪比提升3.6倍，年化$4.4万

## ② 核心算法逻辑

火箭制导→FBA库存信号分解的迁移逻辑：

## ③ 业务应用场景

- 业务问题：美国市场婴儿推车销量有强烈季节性（Q2/Q3出行旺季 × 母亲节/婴儿展季节）+ 年级增长趋势 + 每次亚马逊算法调整带来的基线漂移。传统ETS模型无法区分「季节变化」和「算法基线变化」，导致备货要么过多要么过少。 - 数据要求：周销量时序（≥2年，覆盖至少2个完整年度周期），FBA库存快照（可选，用于验证） - 预期产出： - 趋势分量 ν_t（年增长率是多少） - 季节分量 γ_t（每周的季节因子） - 去季节化需求基线 μ_t（剔除季节后的真实需求水平） - 业务价值：精确识别季节峰谷时间点，提前8-12周备货，减少断货损失¥30-50万/年（200个SKU规模） - 三轨
- **业务问题**：Prime Day/Black Friday促销使销量3-5倍放大，叠加在季节趋势上，导致促销后补货计划严重过估（把促销脉冲当成需求趋势上升）。STS可以显式建模促销效应为外生干预，与季节分量分离。 - **数据要求**：日销量 + 促销日期标记（binary）+ 折扣幅度 - **预期产出**：促销提升弹性估计，基准需求 vs 促销增量的分离 - **业务价值**：避免促销后过度补货冻结资金，资金占用减少¥20万/次大促 - **三轨验证**： - **成本**：需额外采集促销日期/折扣数据（可从广告报表或内部活动日历获取），计算量增加约30%（需扩展状态向量），人力投

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：婴儿推车/高客单价SKU场景，备货决策每次误差¥5-20万，年累计损失¥100-300万。STS分解减少备货误差约40%，年化节省¥40-120万（取决于SKU数量和客单价）。
实施难度：⭐⭐⭐☆☆（需要至少2年历史数据、参数调优、以及对季节周期的业务判断）
优先级：⭐⭐⭐⭐☆（适合有稳定季节模式的SKU，客单价越高优先级越高）
迁移风险：中——季节参数设置错误会导致分解偏差；建议先用1年数据验证季节周期，再上生产
落地路径：第1个月验证季节周期 → 第2个月调参 → 第3个月接入补货计划系统

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/state_space_inventory_signal_smoothing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-State-Space-Inventory-Signal-Smoothing.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np

class StructuralTimeSeriesKalman:
    """
    结构时间序列（Harvey框架）+ Kalman Filter 实现
    状态：[Level μ, Trend ν, Seasonal γ_1, ..., γ_{s-1}]
    纯 numpy 实现，不依赖 statsmodels/sklearn
    
    参考：Harvey (1989), Forecasting, Structural Time Series Models and the Kalman Filter
    """
    
    def __init__(self, season_period: int = 52, 
                 sigma_level: float = 5.0,    # 水平过程噪声标准差
                 sigma_trend: float = 0.5,    # 趋势过程噪声标准差  
                 sigma_seasonal: float = 2.0, # 季节过程噪声标准差
                 sigma_obs: float = 20.0):    # 观测噪声标准差
        """
        season_period: 季节周期（52=周数据/年, 12=月数据/年, 7=日数据/周）
        """
        self.s = season_period
        self.dim_state = 2 + (season_period - 1)  # Level + Trend + (s-1)个季节状态
        
        # ===== 构建状态转移矩阵 T =====
        T = np.zeros((self.dim_state, self.dim_state))
        # Level: μ_t = μ_{t-1} + ν_{t-1}
        T[0, 0] = 1.0  # μ_t ← μ_{t-1}
        T[0, 1] = 1.0  # μ_t ← ν_{t-1}
        # Trend: ν_t = ν_{t-1}
        T[1, 1] = 1.0
        # Seasonal: γ_t = -Σ_{j=1}^{s-2} γ_{t-j+1} + γ_{t-1}（将最老的季节向前推）
        # 简化季节建模：使用 companion form
        for i in range(2, self.dim_state - 1):
            T[i, i+1] = 1.0  # γ_{j} ← γ_{j-1}（向后移位）
        T[2, 2:] = -1.0   # 第一个季节 = 负和约束
        T[2, 2] = 0.0      # 排除自身
        self.T = T
        
        # ===== 观测矩阵 Z =====
        Z = np.zeros(self.dim_state)
        Z[0] = 1.0  # 观测 = Level + 第一个季节
        Z[2] = 1.0
        self.Z = Z
        
        # ===== 过程噪声协方差 Q =====
        Q = np.zeros((self.dim_state, self.dim_state))
        Q[0, 0] = sigma_level ** 2
        Q[1, 1] = sigma_trend ** 2
        Q[2, 2] = sigma_seasonal ** 2
        self.Q = Q
        
        # ===== 观测噪声 R =====
        self.R_obs = sigma_obs ** 2
        
    def fit(self, observations: np.ndarray) -> dict:
        """
        运行 Kalman Filter 对完整观测序列进行滤波
        返回各分量的分离结果
        """
        obs = np.array(observations, dtype=float)
        n = len(obs)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：周销量时序（≥2 年，覆盖至少 2 个完整年度周期）、FBA 库存快照（可选）、促销日期标记与折扣幅度；粒度：SKU×周。

**输出**：趋势分量、每周季节因子、去季节化需求基线与促销弹性估计，供峰谷识别、提前备货与促销后补货修正使用。

## 执行步骤

1. 整理两年以上周销量并标注促销干预
2. 拟合结构时间序列得到趋势与季节分量
3. 分离促销增量与基准需求
4. 输出峰谷时点与备货提前量建议
5. 复核季节周期设定是否与业务一致

## 边界与不做

- 数据不满足时不用：历史不足 2 年或季节周期不确定时分解会偏差，卡页建议先用 1 年数据验证周期。
- 能力边界：只做信号分解与参数估计，不直接生成采购单或库存调整。
- 能力边界：季节参数设错会导致系统性偏差，上线前需业务确认周期设定。

## 技能关联

- **前置**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Kalman-Filter-Demand-Tracking.html、Skill-Kalman-Filter-Demand-Tracking、Skill-PID-Safety-Stock-Controller.html、Skill-PID-Safety-Stock-Controller
- **延伸**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-PID-Safety-Stock-Controller.html、Skill-PID-Safety-Stock-Controller
- **可组合**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-State-Space-Inventory-Signal-Smoothing

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-State-Space-Inventory-Signal-Smoothing`