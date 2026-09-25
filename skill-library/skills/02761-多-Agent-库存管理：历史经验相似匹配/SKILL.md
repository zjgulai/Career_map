---
name: "p2s-aim-rm-llm-inventory-mas-memory"
title: "AIM-RM — LLM 多 Agent 库存管理：历史经验相似匹配"
description: "触发词：多仓补货、历史经验匹配、冷启动补货、补货决策记忆、大促备货。何时不用：只算单个 SKU 的动态补货点用「补货点自适应」类技能，只做库存分层与库龄归因用「库存分层」。安全边界：补货量为建议值，下单、调拨与改库存账须人工复核后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-AIM-RM-LLM-Inventory-MAS-Memory"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新市场或新 SKU 没有历史数据时，靠检索相似历史场景的记忆来给出有依据的补货建议。"
user_try: "试试：东南亚新仓刚起步没有历史数据，能不能借用国内成熟市场的补货经验，给这两个奶粉 SKU 出一个补货建议？"
whenToUse: "多 SKU 多仓补货、需要跨场景借用历史决策经验（含新市场冷启动）时用；只算单个 SKU 的动态补货点用「补货点自适应」类技能。"
workflow: "把当前库存场景编码成 ≥8 维特征向量 → 在记忆库中按距离检索最相似的历史决策 → 把相似场景与当时订货量、持有/缺货成本交给 Agent 决策 → 回写本次场景与结果，持续扩充记忆库"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AIM-RM — LLM 多 Agent 库存管理：历史经验相似匹配

## ① 解决的问题

仓储运营面临多仓补货记忆断层——AIM-RM将漏补货率2.8%压到0.9%，年化节省18万元

## ② 核心算法逻辑

AIMRM（AI Agent for Inventory Management with Retrieval Memory） 解决的核心问题是：LLMMAS 在库存管理中面临跨场景适应性差的困境——不同 SKU、季节、供应链配置导致需求模式千差万别，零样本或少样本 LLM Agent 难以泛化到新场景。

## ③ 业务应用场景

业务问题： 母婴品牌同时运营 0-6月龄段（阶段 1）和 6-12月龄段（阶段 2）配方奶粉，两个 SKU 需求模式迥异： - 阶段 1 需求受新生儿出生率影响，季节性弱但受政策（生育补贴）影响大 - 阶段 2 需求随阶段 1 滞后约 6 个月，且与辅食引入节奏耦合
传统 RL/规则方法在新市场（如东南亚新建仓）因缺乏历史数据而冷启动失败，导致大量缺货或呆滞库存。
数据要求： - 历史场景记录：每日库存水位、30/60/90 天需求滚动均值和标准差、当前在途量、提前期天数 - 记忆库初始化（w/ RL log）：可借用同品类成熟市场（如中国大陆）的 RL 优化轨迹 - 场景特征维度：≥8 维（current_stock, demand_7d, demand_30d, demand_cv, lead_time, backlog, season_flag, promo_flag）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

工程：向量数据库（Qdrant/FAISS）+ LLM API 调用
成本：~$200-500/月（LLM API） + 向量数据库托管 ~$50/月
上线周期：4-6 周（含历史数据清洗 + RL log 生成）
核心组件：向量数据库（FAISS 可本地运行，无需云服务）
无需训练 RL 模型（w/o RL log 模式直接上线）
最低可行版本：单级 Agent + 50条历史记录即可验证效果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（506 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/aim_rm_llm_inventory_mas_memory` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-AIM-RM-LLM-Inventory-MAS-Memory.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AIM-RM: LLM Multi-Agent Inventory Management with Retrieval Memory
arXiv:2602.05524 (AAMAS 2026)

母婴出海应用：多 SKU 季节性库存管理 + 大促备货决策
依赖：numpy, dataclasses, anthropic (或任何 LLM SDK)
"""

from __future__ import annotations
import os
import json
import math
from dataclasses import dataclass, field, asdict
from typing import Optional
import numpy as np


# ─────────────────────────────────────────────
# 1. 数据结构定义
# ─────────────────────────────────────────────

@dataclass
class InventoryState:
    """当前库存场景状态向量（用于相似度检索）"""
    sku_id: str
    current_stock: float          # 当前库存量（件）
    demand_7d: float              # 过去7天日均需求
    demand_30d: float             # 过去30天日均需求
    demand_cv: float              # 需求变异系数（标准差/均值）
    lead_time: int                # 补货提前期（天）
    backlog: float                # 当前缺货积压量
    season_flag: int              # 季节标志 0=淡季 1=旺季
    promo_flag: int               # 促销标志 0=无 1=有
    # 以下字段仅用于记忆存储，不参与相似度计算
    demand_history: list[float] = field(default_factory=list)
    timestamp: str = ""

    def to_feature_vector(self) -> np.ndarray:
        """提取用于 Euclidean 距离计算的特征向量（归一化前）"""
        return np.array([
            self.current_stock,
            self.demand_7d,
            self.demand_30d,
            self.demand_cv,
            float(self.lead_time),
            self.backlog,
            float(self.season_flag),
            float(self.promo_flag),
        ], dtype=float)


@dataclass
class MemoryRecord:
    """一条历史决策记录（场景 + 动作 + 结果）"""
    state: InventoryState
    order_quantity: float         # 当时的订货决策量
    holding_cost: float           # 当期库存持有成本
    shortage_cost: float          # 当期缺货成本
    total_cost: float             # 综合成本（越小越好）
    source: str = "runtime"      # "runtime" | "rl_log"（预置RL轨迹）
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.05524 — AI Agent Systems for Supply Chains: Structured Decision Prompts and Memory Retrieval
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：当前场景状态向量（≥8 维）：sku_id、当前库存量、过去 7 天与 30 天日均需求、需求变异系数、补货提前期天数、缺货积压量、季节标志、促销标志；以及记忆库记录（场景向量 + 当时订货量 + 持有成本 + 缺货成本 + 综合成本，来源 runtime 或 rl_log 预置轨迹），并可选 30/60/90 天需求滚动均值与标准差、在途量。

**输出**：每个 SKU 的建议补货量及其依据（检索到的相似历史场景与结果对比），并回写新的记忆记录；供补货负责人审单与多仓调拨参考。

## 执行步骤

1. 把当前库存状态编码成 ≥8 维场景向量（当前库存、7/30 天需求、需求 CV、提前期、积压、季节与促销标志）
2. 在记忆库中检索最相似的历史场景及其当时的订货决策与成本结果
3. 结合相似场景的订货量与综合成本，给出本 SKU 的建议补货量
4. 把本次场景与结果写回记忆库，标注来源（runtime 或预置 rl_log 轨迹）
5. 与无记忆基线对比，报告漏补货率与库存成本变化

## 边界与不做

- 数据不满足时不用：缺每日库存水位、需求或提前期字段的场景向量无法检索；记忆库为空时没有可借用的经验。
- 只输出补货建议与检索依据，不直接下单、调拨或改动库存账。
- 卡页说明有月度成本（LLM API 约 $200-500/月 + 向量库托管约 $50/月）、上线周期 4-6 周；ROI（漏补货率 2.8% 降至 0.9%、年化节省 18 万元）为估算口径。

## 技能关联

- **前置**：Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **可组合**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-AIM-RM-LLM-Inventory-MAS-Memory

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：10-MAS　·　源卡：`Skill-AIM-RM-LLM-Inventory-MAS-Memory`