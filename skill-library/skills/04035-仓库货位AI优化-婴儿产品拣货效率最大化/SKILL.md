---
name: "p2s-warehouse-slotting-ai-optimization"
title: "仓库货位AI优化 — 婴儿产品拣货效率最大化"
description: "触发词：货位优化、拣货路径、ABC分层、关联规则。何时不用：缺少订单行明细或货位坐标时无法优化；只做库存分层与周转分析用库存分层类技能。安全边界：近效期商品优先拣货需满足食品安全要求，货位变更需与 WMS 实时同步避免错拣。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Warehouse-Slotting-AI-Optimization"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用订单共现与 ABC 分层给商品排货位，缩短拣货行走距离、提升出库吞吐。"
user_try: "试试：海外仓 2000 多个 SKU，帮我按订单共现关系重排货位减少行走距离。"
whenToUse: "本卡属「仓储协作」。需要基于订单行与货位坐标做精细化货位分配优化时用本卡；只做库存分层与周转分析时用库存分层类技能。"
workflow: "构造订单行与货位坐标数据 → 做 ABC 分层 → 算商品共现频次矩阵 → 按曼哈顿距离分配黄金区"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 仓库货位AI优化 — 婴儿产品拣货效率最大化

## ① 解决的问题

仓储运营面临"仓库货位人工规划效率低下拣货时间超行业均值50%"——AI货位分配优化将拣货时间降低30%，年化节省仓储人工成本20-40万元

## ② 核心算法逻辑

仓库货位优化（Warehouse Slotting）是将 SKU 分配到最优存储位置以最小化拣货行走距离的组合优化问题。核心数学模型为带约束的二次分配问题（QAP），目标函数为：

## ③ 业务应用场景

场景1：FBA 海外仓母婴套装拣货优化 - 业务问题：海外仓存放 2000+ 母婴 SKU，旺季订单量激增 3 倍，拣货人员行走距离过长导致人效下降 40%，漏拣错拣率上升 - 数据要求：历史 6 个月订单行明细（SKU ID、下单时间戳）、仓库平面图（货位坐标矩阵）、当前货位分配表 - 预期产出：拣货行走距离减少 25-35%，订单处理吞吐量提升 20%，错拣率降低至 0.1% 以下 - 业务价值：单仓年节省人力成本约 15-20 万元，旺季大促不扩招即可完成产能峰值
场景2：国内保税仓婴儿食品快拣区规划 - 业务问题：婴儿奶粉、辅食 SKU 因保质期管理需求频繁调位，手工调位计划耗时且次优 - 数据要求：SKU 保质期数据、近效期预警阈值、订单波次时间分布 - 预期产出：近效期产品优先拣货率 ≥ 98%，人工调位频次降低 60% - 业务价值：减少过期损耗年化约 8 万元
**三轨验证**：成本（行走距离直接折算人力）/ 合规（近效期优先满足食品安全）/ 风险（货位变更引发系统同步延迟风险需 WMS 实时同步）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：单仓年节省人力 15-25 万元，错拣损失减少 5-8 万元，合计 20-33 万元/仓
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：货位优化属于一次性重排+季度微调，技术成熟度高，需要 WMS 系统支持货位编码；母婴旺季峰谷差显著，投资回收期 3-6 个月。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
仓库货位 AI 优化 — ABC 分析 + 关联规则 + 货位重分配
"""
import numpy as np
import pandas as pd
from itertools import combinations
from collections import defaultdict

# ---- 1. 构造示例数据 ----
np.random.seed(42)
n_skus = 50
n_orders = 500

sku_ids = [f"SKU_{i:03d}" for i in range(n_skus)]
orders = []
for oid in range(n_orders):
    size = np.random.choice([1, 2, 3, 4], p=[0.4, 0.3, 0.2, 0.1])
    items = np.random.choice(sku_ids, size=size, replace=False).tolist()
    orders.append({"order_id": f"ORD_{oid:04d}", "skus": items})

# ---- 2. ABC 分析 ----
sku_freq = defaultdict(int)
for o in orders:
    for s in o["skus"]:
        sku_freq[s] += 1

freq_df = pd.DataFrame(list(sku_freq.items()), columns=["sku", "freq"])
freq_df = freq_df.sort_values("freq", ascending=False).reset_index(drop=True)
freq_df["cum_pct"] = freq_df["freq"].cumsum() / freq_df["freq"].sum()
freq_df["abc"] = freq_df["cum_pct"].apply(
    lambda x: "A" if x <= 0.8 else ("B" if x <= 0.95 else "C")
)

# ---- 3. 关联规则（共现频次矩阵）----
co_matrix = defaultdict(int)
for o in orders:
    for a, b in combinations(sorted(o["skus"]), 2):
        co_matrix[(a, b)] += 1

top_pairs = sorted(co_matrix.items(), key=lambda x: -x[1])[:10]

# ---- 4. 仓库货位模型（简化 10×5 网格）----
rows, cols = 10, 5
n_slots = rows * cols
slot_coords = {i: (i // cols, i % cols) for i in range(n_slots)}

def manhattan(s1, s2):
    r1, c1 = slot_coords[s1]
    r2, c2 = slot_coords[s2]
    return abs(r1 - r2) + abs(c1 - c2)

# 出货口在 (0,0)，按曼哈顿距离排序货位（黄金区）
golden_slots = sorted(range(n_slots), key=lambda s: manhattan(s, 0))

# ---- 5. 货位分配：A 类 SKU 优先分配黄金区 ----
a_skus = freq_df[freq_df["abc"] == "A"]["sku"].tolist()
b_skus = freq_df[freq_df["abc"] == "B"]["sku"].tolist()
c_skus = freq_df[freq_df["abc"] == "C"]["sku"].tolist()

assignment = {}
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史订单行明细（SKU ID、下单时间戳）、仓库平面图（货位坐标矩阵）、当前货位分配表，以及 SKU 保质期与近效期预警阈值。

**输出**：优化后的货位分配方案、拣货行走距离与吞吐量改善评估、近效期商品优先拣货率，以及人工调位频次降低幅度。

## 执行步骤

1. 整理历史订单行与仓库货位坐标
2. 按出货频次做 ABC 分层
3. 计算商品共现频次矩阵
4. 按到出货口距离为 A 类分配黄金区
5. 输出货位调整计划并安排分批迁移

## 边界与不做

- 缺少订单行明细或货位坐标时无法优化，不用本卡
- 本卡产出货位分配方案，不负责仓储系统数据变更与实际搬仓作业
- 货位变更需与仓储系统实时同步，近效期商品优先拣货需满足食品安全要求

## 技能关联

- **可组合**：Skill-Warehouse-Slotting-AI-Optimization

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：18-物流履约　·　源卡：`Skill-Warehouse-Slotting-AI-Optimization`