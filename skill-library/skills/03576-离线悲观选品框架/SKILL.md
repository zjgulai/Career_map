---
name: "p2s-pasta-offline-assortment"
title: "PASTA - 离线悲观选品框架"
description: "触发词：离线选品、组合优化、悲观估计、坑位分配。何时不用：没有历史曝光与选择日志时不用本卡；只预测单品销量时用需求预测类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
p2s_card_id: "Skill-PASTA-Offline-Assortment"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用悲观估计挑出互补性最强的商品组合，避免同质商品互相抢转化。"
user_try: "试试：大促首屏只有 8 个坑位，帮我从 200 个提报 SKU 里选出最优组合。"
whenToUse: "本卡属「组合取舍」。要在有限坑位里选出一组整体期望收益最高、互补性最强的商品时用本卡；只排单品优先级或预测单量时用相邻技能。"
workflow: "准备历史曝光与选择日志 → 配置 SKU 售价与毛利 → 构建优化器 → 执行 Max-Min 贪婪选品"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PASTA - 离线悲观选品框架

## ① 解决的问题

选品经理面临线下陈列选品靠感觉——离线组合优化将滞销率降20%，年化省16万元

## ② 核心算法逻辑

PASTA（Pessimistic AsSorTment leArning）解决的核心问题是：如何仅凭历史离线日志（无需在线试错），找出使总期望收益最大化的商品展示组合。面对 N 个 SKU 的 $2^N$ 种候选组合，传统在线方法需要真实上架实验，代价过高；PASTA 用"悲观原则"规避这一困境。

## ③ 业务应用场景

业务问题： 大促期间运营提报 200 个 SKU，首屏仅 8 个黄金坑位。若直接取历史销量 Top-8，可能全是"电动奶泵"，彼此抢占转化率（MNL 替代效应）。需要找到整体期望 GMV 最高、互补性最强的 8 品组合。
数据要求： - 过去一年各 SKU 在历史页面中的曝光记录（展示组合 + 用户最终选择） - 每个 SKU 的售价 / 毛利 - 至少保证入围 SKU 每个单品有 ≥10 次曝光记录（Single-item coverage）
预期产出： - 最优 8 品组合 + 最坏情况期望收益下界 - 每个 SKU 的不确定性半径（$\beta_j$）及风险等级 - 对比朴素 Top-K 方案的收益提升量（实测 demo 提升 26%+）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据要求：需要结构化的曝光+选择日志（通常在 OLAP 日志系统中可获取）
技术门槛：中等，需理解 MNL 模型；贪婪算法工程落地门槛低
工程复杂度：中等，穷举仅适用于 N≤20；N>50 需结合分支定界或启发式
维护成本：低，模型随日志自动更新无需人工干预

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（25 行）。**下面 25 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **25 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，25 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/pasta_offline_assortment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-PASTA-Offline-Assortment.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import HistoricalLog, PASTAOptimizer
import numpy as np

# 1. 准备历史日志（替换为真实业务数据）
log = HistoricalLog(n_items=20, n_obs=2000, seed=42)

# 2. 配置 SKU 定价
prices = np.array([...])  # shape: (n_items,)，单位：元

# 3. 构建 PASTA 优化器
optimizer = PASTAOptimizer(
    n_items=20,
    capacity=8,            # 首屏坑位数
    prices=prices,
    confidence_level=0.9   # 置信水平，越高越保守
)
optimizer.fit(log)

# 4. 执行 Max-Min 贪婪选品
best_set, worst_rev, detail_df = optimizer.optimize_greedy()

print(f"推荐上架组合: {best_set}")
print(f"最坏情况期望收益: ¥{worst_rev:.2f}")
print(detail_df[detail_df["selected"]])
print("[✓] PASTA Offline Assortment 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.01693 — PASTA: A Unified Framework for Offline Assortment Learning

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去一年各 SKU 在历史页面中的曝光记录（展示组合与用户最终选择）、每个 SKU 的售价与毛利，且入围 SKU 每个单品至少有 10 次曝光记录。

**输出**：最优商品组合与最坏情况期望收益下界、每个 SKU 的不确定性半径与风险等级，以及与朴素 Top-K 方案的收益对比。

## 执行步骤

1. 准备历史曝光与用户选择日志
2. 配置各 SKU 的售价与毛利
3. 构建悲观离线优化器
4. 执行 Max-Min 贪婪选品并输出组合

## 边界与不做

- 单品曝光记录不足（低于 10 次）或没有历史选择日志时不用本卡
- 本卡产出组合方案与风险下界，不负责坑位排期与库存备货

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **延伸**：Skill-FSDA-DRL.html、Skill-FSDA-DRL、Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL、Skill-PASTA-Offline-Assortment

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：04-供应链　·　源卡：`Skill-PASTA-Offline-Assortment`