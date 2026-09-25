---
name: "p2s-supply-chain-carbon-risk-gcn"
title: "供应链碳排放风险 — 元学习GCN低碳转型评估"
description: "触发词：碳排放风险、CBAM、低碳转型、供应链碳合规、高风险供应商识别。何时不用：做供应商综合断供风险分级时用供应商风险评分；做劳工与环境合规尽调时用供应链合规尽职调查。安全边界：碳排放数据须有海关或第三方认证报告支撑，缺失认证的供应商只能标记待核验，不得直接用于对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 产品准入核对"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supply-Chain-Carbon-Risk-GCN"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用图模型评估供应商在碳政策下的供货风险，提前锁定可能因停产改造而断供的工厂。"
user_try: "试试：扫一遍我前 10 大供应商的碳排放与转型进度，标出 CBAM 下最可能停产的几家。"
whenToUse: "面向欧盟 CBAM 等碳政策做供应商供货稳定性扫描与低碳转型评估时用本技能；综合断供风险分级用供应商风险评分，合规尽调用供应链合规尽职调查。"
workflow: "收集供应商碳排放报告、历史供货记录与财务报告 → 构建供应商依存关系图与节点特征 → 用图模型输出低中高碳政策风险分级 → 对高风险供应商给出切换或谈判备货建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链碳排放风险 — 元学习GCN低碳转型评估

## ① 解决的问题

欧盟 CBAM 实施前品牌无法评估前10大供应商碳排放风险导致供货稳定性盲区——引入元学习 GCN 低碳转型评估，高风险供应商提前18个月识别，供应链碳合规率从 40%→93%，年化潜在碳税节约 25% 采购成本。

## ② 核心算法逻辑

论文：MetaLearning Graph Neural Networks for Supply Chain Risk Prediction | 年份：2021

## ③ 业务应用场景

场景A：评估中国制造商在碳政策下的供货稳定性
某婴儿车品牌在欧盟CBAM实施前18个月启动供应商风险扫描： - 痛点：前10大供应商中有3家高碳排放工厂（钢材、塑料注塑），预计需停产6~18个月完成碳认证改造 - 数据要求：供应商碳排放报告（海关/第三方认证）、历史供货记录、财务报告（改造资金充足性） - GCN分析：识别出2家高风险供应商（改造资金不足+强依赖关系），1家中风险供应商（大客户，转型进度可追踪） - 量化产出：提前12个月切换1家高风险供应商，避免断货损失约$180K；另1家谈判备货协议，缓冲库存增加45天
场景B：欧盟市场合规选品（提前规避CBAM碳关税）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

8万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（219 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import Dict, List, Tuple

try:
    import networkx as nx
    HAS_NX = True
except ImportError:
    HAS_NX = False
    print("提示: networkx未安装，使用内置邻接矩阵实现")

# ============================================================
# 供应链碳排放风险评估 — 元学习GCN（简化演示）
# ============================================================

np.random.seed(42)

# ------ 供应商节点特征定义 ------
# [碳排放强度(0-1), 财务健康度(0-1), 历史供货率(0-1),
#  转型进度(0-1), 客户依存度(0-1), 认证状态(0/1)]
FEATURE_DIM = 6
RISK_LABELS = {0: "低风险-稳定转型", 1: "中风险-进行中", 2: "高风险-停产概率高"}


def build_supply_chain_graph(n_suppliers: int = 20) -> Tuple[np.ndarray, np.ndarray]:
    """构建供应链风险图（邻接矩阵 + 节点特征）"""
    # 节点特征：模拟真实供应商数据分布
    features = np.zeros((n_suppliers, FEATURE_DIM))
    for i in range(n_suppliers):
        # 碳排放强度：部分供应商高碳
        features[i, 0] = np.random.beta(2, 5) if i < n_suppliers * 0.7 else np.random.beta(5, 2)
        # 财务健康度
        features[i, 1] = np.random.beta(3, 2)
        # 历史供货率
        features[i, 2] = np.clip(np.random.normal(0.92, 0.08), 0, 1)
        # 转型进度（0=未启动，1=已完成）
        features[i, 3] = np.random.uniform(0, 1)
        # 客户依存度（越高越难切换）
        features[i, 4] = np.random.beta(2, 3)
        # 认证状态（1=已获ISO14064）
        features[i, 5] = float(np.random.random() > 0.65)

    # 邻接矩阵：供应商之间的原料依存关系
    adj = np.zeros((n_suppliers, n_suppliers))
    for i in range(n_suppliers):
        for j in range(i + 1, n_suppliers):
            # 高碳供应商之间更可能相互依存（同类原料采购）
            prob = 0.3 if features[i, 0] > 0.6 and features[j, 0] > 0.6 else 0.1
            if np.random.random() < prob:
                adj[i, j] = adj[j, i] = 1.0

    # 归一化邻接矩阵（GCN标准操作）
    degree = adj.sum(axis=1) + 1  # +1防止孤立节点
    D_inv_sqrt = np.diag(1.0 / np.sqrt(degree))
    adj_norm = D_inv_sqrt @ (adj + np.eye(n_suppliers)) @ D_inv_sqrt

    return adj_norm, features


def gcn_layer(adj: np.ndarray, features: np.ndarray, W: np.ndarray) -> np.ndarray:
    """单层GCN：聚合邻居信息"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2103.03247，但该号在 arXiv 上是《Time granularity impact on propagation of disruptions in a system-of-systems simulation of infrastructure and business networks》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《MetaLearning Graph Neural Networks for Supply Chain Risk Prediction》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商碳排放报告（海关或第三方认证）、历史供货记录、财务报告（改造资金充足性），以及供应商之间的原料依存关系。

**输出**：供应商碳风险分级清单（低风险稳定转型、中风险进行中、高风险停产概率高）、提前切换与备货缓冲建议，供采购与合规团队使用。

## 执行步骤

1. 汇总供应商碳排放、财务与供货特征数据
2. 构建供应商原料依存关系图
3. 运行图模型输出风险分级与关键节点
4. 输出切换、谈判备货与缓冲库存建议

## 边界与不做

- 何时不用：做供应商综合断供风险评分时用供应商风险评分；做劳工、环境、产品三维合规尽调时用供应链合规尽职调查。
- 能力边界：输出碳政策风险分级与备货建议，不承担碳排放核算报告的鉴证，也不替代 CBAM 申报义务。
- 数据边界：无认证碳报告或依存关系数据缺失时只能做示例级评估，不能作为对外披露依据。

## 技能关联

- **前置**：Skill-Graph-Neural-Network-Basics、Skill-Supply-Chain-Risk-Disruption
- **延伸**：Skill-SC-Resilience-Robustness
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Green-Supply-Chain-Carbon-Footprint.html、Skill-Green-Supply-Chain-Carbon-Footprint、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supplier-Qualification-Multi-Criteria、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Supply-Chain-Visibility-Digital-Twin、Skill-Supply-Chain-Carbon-Risk-GCN

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Carbon-Risk-GCN`