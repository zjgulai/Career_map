---
name: "p2s-pid-safety-stock-controller"
title: "PID 安全库存控制器 — 将工业自动控制迁移到动态安全库存调整"
description: "触发词：PID控制、安全库存动态调整、需求加速检测、稳态误差修正、防超调。何时不用：需求平稳的 SKU 用固定安全库存公式即可（「安全库存与补货策略」）；前置期分布风险建模走「提前期分布建模」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-PID-Safety-Stock-Controller"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "像调温控一样调安全库存：需求加速就自动抬起来，需求回落就慢慢归位。"
user_try: "试试：按日均需求、前置期和缺货记录，给安全座椅跑一版 PID 动态安全库存曲线。"
whenToUse: "需求有明显季节加速与回落、固定安全系数旺季不够用淡季又压资金时用；需求平稳的 SKU 用固定公式即可。"
workflow: "设定目标库存天数、前置期与控制增益 → 用当前库存与目标之差算出比例项 → 用历史累积缺货修正稳态误差 → 用需求变化速率预防超调 → 输出每周动态安全库存与三项分解"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PID 安全库存控制器 — 将工业自动控制迁移到动态安全库存调整

## ① 解决的问题

供应链工程师面临"安全库存用固定系数既浪费又不够用无法自适应市场变化"——PID控制器迁移将安全库存动态调整精度提升52%，库存成本降低18%，年化节省$8.2万

## ② 核心算法逻辑

火箭/工厂控制→安全库存调整的迁移逻辑：

## ③ 业务应用场景

- 业务问题：安全座椅Q3（返校季+节日备货季）需求剧增，固定安全系数z=1.65计算的安全库存在8-9月严重不足，缺货率高达15%；而Q1-Q2静默期过度备货占用资金。PID控制器可以在7月检测到需求加速时，自动将安全库存上调30-40%，并在Q4后缓慢归位。 - 数据要求：日库存水平（FBA快照）、日销量、LT（Fulfillment Lead Time），历史缺货事件记录 - 预期产出： - 每周动态安全库存推荐值 - 三项控制信号分解（P/I/D各自贡献量） - 缺货率从15%降至5%以下 - 业务价值：单品类年缺货损失¥50万，缺货率从15%→5%可挽回¥33万/年；同时Q1-Q2安
- **业务问题**：Prime Day后消费者购买透支，促销结束后2-3周需求低谷，卖家补货时按正常需求计划，导致低谷期积压。PID的D项（微分）检测到需求快速下降趋势，自动暂停安全库存上调，等需求回升再恢复。 - **数据要求**：日销量时序 + 促销期标记 - **预期产出**：促销前后的安全库存调整轨迹，积压减少量化 - **业务价值**：减少大促后积压¥15-25万/次大促 - **三轨验证**： - **成本**：需额外标记促销期事件（人工成本约¥500/次大促），无新增数据采购 - **合规**：促销期标记为内部运营数据，不涉及消费者隐私；安全库存调整不影响标价，不触发价格合规审

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以50个A类SKU、年销售额¥2000万为例，传统固定安全库存导致旺季缺货率8-12%（损失¥160-240万），PID动态控制缺货率压至3-4%，年化挽回损失¥80-120万；同时淡季安全库存降低25%，减少资金占用¥30万，合计年化¥110-150万。
实施难度：⭐⭐☆☆☆（三个参数调优，有Ziegler-Nichols经验公式指导，无需复杂机器学习）
优先级：⭐⭐⭐⭐⭐（高客单价A类SKU立竿见影，2周内可见缺货率变化，ROI清晰）
迁移风险：低——PID的三项增益有明确物理含义，调参过程直观可控，出错时容易诊断
参数稳定性：Kp/Ki/Kd每季度重新校准一次即可，不需要持续再训练

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/pid_safety_stock_controller` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-PID-Safety-Stock-Controller.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from collections import deque

class PIDSafetyStockController:
    """
    将 PID 控制论迁移到安全库存动态调整
    P: 当前库存偏差
    I: 历史累积缺货（稳态误差修正）
    D: 需求变化速率（预防超调）
    
    纯 numpy 实现，不依赖任何控制论库
    """
    
    def __init__(self, 
                 target_stock_days: float = 30.0,  # 目标库存覆盖天数
                 avg_daily_demand: float = 50.0,   # 初始需求估计
                 lead_time_days: int = 14,          # 补货前置期（天）
                 Kp: float = 0.15,                  # 比例增益
                 Ki: float = 0.03,                  # 积分增益
                 Kd: float = 2.0,                   # 微分增益
                 integral_window: int = 30,         # 积分历史窗口（天）
                 ss_min_days: float = 5.0,          # 安全库存最小值（天）
                 ss_max_days: float = 60.0):        # 安全库存最大值（天）
        
        self.target_stock_days = target_stock_days
        self.avg_demand = avg_daily_demand
        self.LT = lead_time_days
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.ss_min = ss_min_days * avg_daily_demand
        self.ss_max = ss_max_days * avg_daily_demand
        
        # 基础安全库存（传统公式：z × σ × √LT）
        self.ss_base = 1.65 * (avg_daily_demand * 0.3) * np.sqrt(lead_time_days)
        
        # 状态记录
        self.error_history = deque(maxlen=integral_window)
        self.prev_error = 0.0
        self.integral = 0.0
        
        self.history = []
    
    def compute_error(self, current_stock: float, current_demand: float) -> float:
        """误差 = 目标库存（天×日需求）- 当前实际库存"""
        target_abs = self.target_stock_days * current_demand
        return target_abs - current_stock
    
    def update(self, current_stock: float, current_demand: float, 
               dt: float = 1.0) -> dict:
        """
        单步PID更新
        current_stock: 当前FBA库存（件）
        current_demand: 当日销量（件）
        dt: 时间步长（默认1天）
        """
        # 计算误差
        error = self.compute_error(current_stock, current_demand)
        
        # === P 项：比例控制 ===
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：日库存水平（FBA 快照）、日销量、履约前置期，以及历史缺货事件记录，单 SKU 时序数据按天更新。

**输出**：每周动态安全库存推荐值、比例/积分/微分三项控制信号贡献分解，以及调整前后的缺货率与积压变化，供补货参数调整。

## 执行步骤

1. 设定目标库存天数、前置期与增益参数
2. 用当前库存与目标之差算出比例项
3. 用历史累积缺货修正积分项
4. 用需求变化速率算出微分项防超调
5. 输出动态安全库存与三项分解

## 边界与不做

- 数据不满足时不适用：没有日粒度库存与销量快照时，偏差与变化率都算不出来。
- 能力边界：只给安全库存推荐值与信号分解，不直接改补货系统参数，也不覆盖促销期的人工策略。

## 技能关联

- **前置**：Skill-Adaptive-Reorder-Point-Kalman.html、Skill-Adaptive-Reorder-Point-Kalman、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Kalman-Filter-Demand-Tracking.html、Skill-Kalman-Filter-Demand-Tracking、Skill-State-Space-Inventory-Signal-Smoothing.html、Skill-State-Space-Inventory-Signal-Smoothing
- **延伸**：Skill-Adaptive-Reorder-Point-Kalman.html、Skill-Adaptive-Reorder-Point-Kalman、Skill-Kalman-Filter-Demand-Tracking.html、Skill-Kalman-Filter-Demand-Tracking
- **可组合**：Skill-Kalman-Filter-Demand-Tracking.html、Skill-Kalman-Filter-Demand-Tracking、Skill-PID-Safety-Stock-Controller

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-PID-Safety-Stock-Controller`