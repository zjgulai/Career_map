---
name: "p2s-graphdeepar-demand-forecasting"
title: "GraphDeepAR — 图神经网络概率需求预测：商品关联 + 退货预测"
description: "触发词：图神经网络、概率需求预测、跨SKU传导、生命周期替代、商品关联图。何时不用：只做两两领先滞后检验用「跨SKU相关性挖掘」，逐单退货风险打分用「退货风险分预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-GraphDeepAR-Demand-Forecasting"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "把商品之间的替代和互补关系建成图，让相邻品类的信号提前告诉你该补什么、该减什么。"
user_try: "试试：帮我把奶粉各段位和辅食机建成商品关联图，预测 Stage2 奶粉的需求并给出补货提前量。"
whenToUse: "本卡属需求预测的多 SKU 联动建模侧：品类间存在生命周期替代或互补传导、需要联合概率预测时用；只做两两领先滞后相关检验的，用跨 SKU 相关性挖掘类技能。"
workflow: "定义商品节点与替代、互补关系，构建商品图 → 按图结构联合训练概率需求预测模型 → 用邻居节点信号预测各 SKU 需求分布 → 依预测结果提前调整相关 SKU 的补货计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GraphDeepAR — 图神经网络概率需求预测：商品关联 + 退货预测

## ① 解决的问题

预测工程师面临多SKU联动难学——GraphDeepAR将MAPE从21%降到12%，年化省23万元

## ② 核心算法逻辑

图结构捕捉商品关联

## ③ 业务应用场景

业务背景：母婴商品需求存在强烈的婴儿成长驱动关联：Stage1 奶粉（0-6月龄）需求下降时，Stage2 奶粉（6-12月龄）需求同步上升；辅食引入期（4-6月龄）带动婴儿餐椅、辅食机需求爆发。传统独立预测无法捕捉这种跨品类传导，导致 Stage2 缺货 / Stage1 积压并发。
| 节点 | 商品类型 | 图关联 | |------|---------|-------| | SKU_F1 (Stage1 奶粉) | 核心奶粉 | → Stage2 (生命周期替代) | | SKU_F2 (Stage2 奶粉) | 核心奶粉 | → Stage3 (生命周期替代), → 辅食 (互补) | | SKU_F3 (Stage3 奶粉) | 核心奶粉 | → 幼儿零食 (互补) | | SKU_B1 (湿巾) | 快消品 | → 纸尿裤 (高相似度) | | SKU_T1 (婴儿玩具) | 发展商品 | 相对独立，弱连接 |
预测效益：GNN 在 Stage1 奶粉需求持续下降时，能提前感知并预测 Stage2 需求上涨（邻居节点信号），使补货计划提前 2 周调整，减少 Stage2 缺货率 40%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

25%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（28 行）。**下面 28 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **28 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，28 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/logistics/graphdeepar_demand_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-GraphDeepAR-Demand-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速使用示例
from paper2skills_code.logistics.graphdeepar_demand import (
    ProductGraph,
    GraphDeepARModel,
    simulate_demand_forecasting,
)
import numpy as np

# 构建 20 个母婴 SKU 的商品图
sku_attributes = np.random.rand(20, 8)   # 8维属性特征
graph = ProductGraph(sku_attributes, similarity_threshold=0.7)

# 构建模型
model = GraphDeepARModel(
    n_skus=20,
    n_features=8,
    seq_len=30,
    pred_len=7,
    gnn_hidden=32,
    rnn_hidden=64,
)

# 训练 + 对比仿真
results = simulate_demand_forecasting(n_skus=20, n_days=180)
print(f"GraphDeepAR WAPE: {results['graphdeepar_wape']:.3f}")
print(f"Standard DeepAR WAPE: {results['deepar_wape']:.3f}")
print(f"提升: {results['improvement_pct']:.1f}%")
print("[✓] GraphDeepAR Demand Foreca 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.13096，但该号在 arXiv 上是《Probabilistic Demand Forecasting with Graph Neural Networks》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多 SKU 历史销量序列、商品间关系定义（生命周期替代、互补、弱连接）、节点属性（品类、段位）；SKU×周或日粒度，需覆盖相互关联的品类集合。

**输出**：各 SKU 的概率需求预测（含分位数）、跨品类传导信号与补货计划调整建议，输出给补货计划。

## 执行步骤

1. 定义商品节点与替代、互补关系，构建商品图。
2. 按图结构联合训练概率需求预测模型。
3. 用邻居节点信号预测各 SKU 的需求分布。
4. 依预测结果提前调整相关 SKU 的补货计划。

## 边界与不做

- 何时不用：SKU 之间没有可定义的生命周期或互补关系时，商品图退化为独立预测，不适用本技能。
- 能力边界：图关系需人工定义并持续维护，关系错配会把错误信号传导给邻居节点；节点数少的品类收益有限。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-GraphDeepAR-Demand-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：18-物流履约　·　源卡：`Skill-GraphDeepAR-Demand-Forecasting`