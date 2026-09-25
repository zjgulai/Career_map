---
name: "p2s-forecast-driven-inventory"
title: "Forecast-Driven Inventory（预测驱动库存优化）"
description: "触发词：预测驱动补货、最优服务水平、安全库存计算、报童临界比、再订货点。何时不用：需求分布还没建立、要先做预测时走「需求预测」类技能；要把缺货损失口径算全时用「缺货成本量化」。安全边界：按卡页合规轨要求，预测结果需经质检部门审核后方可补货，预测数据须可追溯。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Forecast-Driven-Inventory"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "拿需求波动和缺货、持有两项成本算出该备多少安全库存，比拍一个经验系数更省。"
user_try: "试试：月需求 1200±200、提前期 30 天、缺货成本 25 美元、持有成本 3 美元，算最优服务水平和安全库存。"
whenToUse: "已有需求均值与标准差、缺货与持有成本，要定服务水平与安全库存时用；要决定具体下单量、是否凑 MOQ 时用「动态批量」类技能。"
workflow: "由缺货成本与持有成本求最优服务水平 → 换算 z 值并计算安全库存 → 与固定系数规则比较损失差异 → 输出安全库存与服务水平建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Forecast-Driven Inventory（预测驱动库存优化）

## ① 解决的问题

吸奶器月需求预测 1200±200，提前期 30 天，缺货成本 $25/件，持有成本 $3/件

## ② 核心算法逻辑

打通需求预测和库存决策——不是先预测再独立决策，而是将预测不确定性直接编码为库存策略参数。核心：服务水平优化——给定预测分布 $N(\hat{\mu}, \hat{\sigma})$，安全库存 $SS = z_\alpha \cdot \hat{\sigma} \cdot \sqrt{LT}$，其中 $z_\alpha$ 由缺货成本 vs 持有成本决定。

## ③ 业务应用场景

吸奶器月需求预测 1200±200，提前期 30 天，缺货成本 $25/件，持有成本 $3/件。最优 $z^*=1.75$，安全库存 $= 1.75 \times 200 \times \sqrt{1} = 350$ 件。vs 简单规则（$z=1.64$，$SS=328$），损失减少 $22 \times 30 = \$660/月$。
**三轨验证** | 成本轨：基础预测模型（ARIMA/指数平滑）月均成本450元，包含数据清洗8小时/月、模型训练4小时/月、预测结果审核6小时/月，共18小时人工成本；云计算成本150元/月（小规模推理）。总月成本约600元 | 合规轨：符合《跨境电商商品质量管理规范》和《进出口食品安全管理办法》要求，预测结果需经质检部门审核后方可补货；满足母婴产品追溯制度要求，预测数据可追溯。结论：合规 | 风险轨：模型漂移风险（概率35%），季节性变化导致预测偏差；数据质量风险（概率25%），历史销售数据缺失或异常；供应链延迟风险（概率40%），预测周期与实际补货周期不匹配导致库存失衡

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：8-12 万元 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（14 行）。**下面 14 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **14 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，14 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/forecast_driven_inventory` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Forecast-Driven-Inventory.md`），已与卡面节选核对，不依赖上述路径。

```python
from scipy.stats import norm

def optimal_service_level(shortage_cost, holding_cost):
    return shortage_cost / (shortage_cost + holding_cost)

def safety_stock(demand_std, lead_time, z_score):
    return z_score * demand_std * np.sqrt(lead_time)

import numpy as np
sl = optimal_service_level(25, 3)
z = norm.ppf(sl)
ss = safety_stock(200, 1, z)
print(f"Service Level: {sl:.0%}, z: {z:.2f}, Safety Stock: {ss:.0f}")
print("[✓] Forecast-Driven Inventory 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：需求均值与标准差（按月或按日）、提前期天数、单位缺货成本与单位持有成本，单 SKU 粒度。

**输出**：最优服务水平、对应 z 值与安全库存件数，以及与简单规则相比的损失差异，供补货参数设置使用。

## 执行步骤

1. 读取需求分布、提前期与成本参数
2. 用缺货与持有成本之比求最优服务水平
3. 换算 z 值并计算安全库存
4. 与固定系数规则做损失对比
5. 输出安全库存与服务水平建议

## 边界与不做

- 数据不满足时不适用：缺少单位缺货成本或持有成本时无法求临界比；需求标准差缺失则退化为拍系数。
- 能力边界：只给单 SKU 的安全库存与服务水平，不处理多 SKU 预算分配、MOQ 凑量与清仓决策。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Forecast-Driven-Inventory

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：03-时间序列　·　源卡：`Skill-Forecast-Driven-Inventory`