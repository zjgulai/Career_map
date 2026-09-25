---
name: "p2s-adaptive-reorder-point-kalman"
title: "自适应补货点 Kalman 版 — 让 ROP 随市场需求动态漂移"
description: "触发词：补货点自适应、动态补货点、安全库存漂移、需求突变补货、ROP 调整。何时不用：要跨场景借用历史补货经验做冷启动补货用「补货决策记忆」类技能，要做库存分层与库龄归因用「库存分层」。安全边界：须设 ROP 单日变化率上限（如不超过 20%）防止补货订单剧烈波动，模型不直接下单。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Adaptive-Reorder-Point-Kalman"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让补货点跟着需求走：旺季自动抬高、淡季自动回落，需求突然暴涨时也能快速追上去。"
user_try: "试试：这个奶瓶的日销从 50 跳到 150 了，按动态补货点重算一下，并告诉我第几天就该补货。"
whenToUse: "有 ≥30 天 SKU 日销量与补货提前期、需要补货点随需求漂移时用；要借用历史相似场景经验做补货用「补货决策记忆」类技能。"
workflow: "初始化需求均值与不确定性，设定提前期、服务水平与 Q/R → 每日用新销量跑 Kalman 预测步与更新步，重估均值与方差 → 按需求量加安全余量算当日动态补货点 → 与静态 ROP 对比首次触发补货时间，输出估计轨迹"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 自适应补货点 Kalman 版 — 让 ROP 随市场需求动态漂移

## ① 解决的问题

补货负责人面临"固定补货点在旺季缺货淡季积压无法跟随需求漂移"——Kalman自适应ROP将补货点误差降低40%，年化避免断货和积压损失$9.6万

## ② 核心算法逻辑

火箭制导→自适应补货点的迁移逻辑：

## ③ 业务应用场景

场景A：婴儿奶瓶 SKU 应对竞品下架带来的需求暴涨
- 业务问题：头部竞品被平台下架，本品需求在3天内从日销50跳到150，传统ROP（基于过去90天μ=50）触发补货量严重不足。Kalman自适应ROP在第5天就将μ̂更新到80+，第10天更新到120+，触发足量补货。 - 数据要求：SKU日销量（≥30天历史），FBA LT（含审核），目标服务水平（z值） - 预期产出： - 每日动态 ROP 值（随需求变化自动漂移） - 需求估计 μ̂_t 和置信区间 √P_t 轨迹 - 首次触发补货的时间点对比（静态 ROP vs 动态 ROP） - 业务价值：需求突变情境下，避免1-2周缺货，以日销150件×$8/件×10天估算，挽回销售损失约¥86
三轨验证： - 成本：数据采集依赖亚马逊日销量报告（免费），计算资源为单台服务器运行Python脚本（月均<¥200），人力投入为1名数据分析师2天完成模型部署与测试（约¥3,000）。 - 合规：仅使用自有SKU销量数据，不涉及竞品数据抓取或用户隐私，符合Amazon数据使用政策与GDPR要求。 - 风险：若Q/R参数设置过激（Q过大），可能导致ROP频繁波动，引发补货订单不稳定，进而被平台判定为异常库存行为（如频繁取消/修改发货计划），需设置ROP变化率上限（如单日变化不超过20%）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：中大型卖家有100个以上活跃SKU，平均每个SKU需求结构变化1-2次/年（竞品上下架、算法调整等），每次结构变化期间平均缺货损失¥2-5万，传统静态ROP平均滞后10-20天，Kalman版本滞后3-7天，年化挽回损失¥80-200万（100 SKU × 2次/年 × 节省7天缺货 × ¥0.5万/天）。
实施难度：⭐⭐☆☆☆（比传统ROP计算复杂度只增加了 Kalman 的预测+更新两步，可嵌入现有补货系统）
优先级：⭐⭐⭐⭐⭐（需求结构不稳定的品类，如季节性强或竞争激烈的母婴品类，效果最显著）
迁移风险：低——Kalman更新步骤保证了算法的数值稳定性，参数 Q/R 有物理含义，调参直观
落地路径：第1周替换单个高价值SKU的ROP计算 → 验证2周 → 扩展到全部A类SKU

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（203 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/adaptive_reorder_point_kalman` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Adaptive-Reorder-Point-Kalman.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from scipy import stats

class KalmanAdaptiveROP:
    """
    基于 Kalman Filter 的自适应补货点（Reorder Point）计算
    核心：实时追踪需求均值 μ̂_t 和不确定性 P_t，替代历史静态统计量
    
    完全用 numpy 手写 Kalman 核心方程
    """
    
    def __init__(self, 
                 lead_time_days: int = 14,
                 service_level: float = 0.95,
                 Q: float = 5.0,    # 过程噪声方差（需求漂移速度）
                 R: float = 50.0,   # 观测噪声方差（日销量随机波动）
                 initial_demand: float = 50.0,
                 initial_variance: float = 200.0):
        """
        lead_time_days: 补货前置期（含FBA审核，建议+3-5天buffer）
        service_level: 目标服务水平（0.95 → z=1.645）
        Q: 过程噪声（Q/R比越大，对需求漂移越敏感）
        R: 观测噪声（日销量的固有随机性）
        """
        self.LT = lead_time_days
        self.z = stats.norm.ppf(service_level)  # 服务水平 → z 值
        self.Q = Q
        self.R = R
        
        # Kalman 状态初始化
        self.mu_est = initial_demand      # 需求均值估计
        self.P_est = initial_variance     # 需求方差估计（不确定性）
        
        # 历史记录
        self.history = []
        self.step = 0
    
    def update(self, y_t: float) -> dict:
        """
        处理单天新销量观测，更新需求估计并计算新 ROP
        y_t: 当日销量（件）
        """
        self.step += 1
        
        # ===== Kalman 预测步 =====
        mu_pred = self.mu_est          # 需求均值预测（随机游走假设）
        P_pred = self.P_est + self.Q   # 预测方差（不确定性增加）
        
        # ===== Kalman 更新步 =====
        K = P_pred / (P_pred + self.R)             # Kalman 增益
        innovation = y_t - mu_pred                  # 创新残差
        mu_new = mu_pred + K * innovation           # 后验均值估计
        P_new = (1 - K) * P_pred                    # 后验方差（不确定性降低）
        
        # ===== 计算自适应 ROP =====
        # ROP = 前置期需求 + 安全余量
        # 前置期需求方差 = P_t × LT（假设各天独立，方差累加）
        safety_stock = self.z * np.sqrt(P_new * self.LT)
        rop_kalman = mu_new * self.LT + safety_stock
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 日销量序列（≥30 天历史）、补货前置期天数（含 FBA 审核，建议加 3-5 天 buffer）、目标服务水平（如 0.95 对应 z=1.645），以及 Kalman 参数 Q（过程噪声，需求漂移速度）、R（观测噪声，日销量随机波动）与初始需求均值、初始方差。

**输出**：每日动态 ROP 值、需求均值估计 μ̂ 与置信区间 √P 轨迹、安全余量，以及首次触发补货的时间点对比（静态 ROP vs 动态 ROP）；供补货负责人直接用于补货量计算与审单。

## 执行步骤

1. 取 SKU ≥30 天日销量，初始化需求均值与方差，设定提前期、服务水平 z 值与 Q/R
2. 每天用当日销量跑 Kalman 预测步（方差增加 Q）与更新步（算增益 K、修正均值与方差）
3. 按补货点等于均值乘提前期加 z 乘需求标准差乘提前期开方，算出当日动态 ROP
4. 记录均值与置信区间轨迹，对比静态 ROP 的首次触发补货时间
5. 给 ROP 设单日变化率上限，抑制补货订单剧烈波动

## 边界与不做

- 数据不满足时不用：日销量历史不足 30 天，或提前期与目标服务水平未定时，估不出需求分布与安全库存。
- 只输出动态 ROP 与需求估计，不直接下补货单、不直接改动平台发货计划。
- 卡页提示 Q/R 设置过激会导致 ROP 频繁波动并可能被平台判定异常库存行为；ROI（补货点误差降 40%、年化避免损失 $9.6 万）为估算口径。

## 技能关联

- **前置**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Kalman-Filter-Demand-Tracking.html、Skill-Kalman-Filter-Demand-Tracking、Skill-PID-Safety-Stock-Controller.html、Skill-PID-Safety-Stock-Controller
- **延伸**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-PID-Safety-Stock-Controller.html、Skill-PID-Safety-Stock-Controller
- **可组合**：Skill-Bullwhip-Effect-Kalman-Mitigation.html、Skill-Bullwhip-Effect-Kalman-Mitigation、Skill-Adaptive-Reorder-Point-Kalman

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Adaptive-Reorder-Point-Kalman`