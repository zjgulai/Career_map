---
name: "p2s-causal-time-series-forecasting-gcf"
title: "因果时间序列预测 - GCF 反事实需求建模"
description: "触发词：反事实需求、缺货需求还原、商品关系图、长程依赖建模、促销回报校正。何时不用：单店时序增量、不需要商品间关系用反事实时序技能，评估区域级投放用聚类合成控制技能，本技能用商品关系图还原被干预压制的真实需求。安全边界：促销标记与订单数据须脱敏并符合匿名化要求，反事实结果仅用于内部复盘与补货决策，不对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Causal-Time-Series-Forecasting-GCF"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "缺货或流量被压制时需求被低估了多少？还原真实需求，别补错货。"
user_try: "试试：还原缺货期间纸尿裤的真实需求，给出补货量建议。"
whenToUse: "商品因缺货、下架或流量被压制导致需求不可观测，需要还原真实需求并校正促销回报时用本技能；单店时序增量用反事实时序技能，区域级投放评估用聚类合成控制技能。"
workflow: "构建商品关系图 → 整合销量历史与干预标记 → 用图卷积与时序模型拟合 → 选取未受干预商品作合成控制 → 输出反事实需求与补货建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 因果时间序列预测 - GCF 反事实需求建模

## ① 解决的问题

平台在大促期对核心母婴 SKU(纸尿裤、婴儿车)做搜索权重提升 + 首页 Banner 曝光,需要回答"如果没做促销,需求应该是多少"——避免把自然增长功劳归到促销 - 数据要求:全品类销量历史 + 促销标记 + 商品图谱(同类竞品关系) - GCF 配置:节点=SKU,边=同品类竞品,干预=促销曝光,合成控制=未受促销的同类 - 业务价值:促销 ROI 计算精度提升 30-50%,避免

## ② 核心算法逻辑

电商场景中,商品因配送延迟、缺货、Banner 压制等干预导致需求被"压制",真实需求 $Y(0)$(无干预反事实)永远不可观测。GCF 用 RGCN + Dilated CNN 同时建模商品间空间关系(同类竞品图)和时序长程依赖,自动选取未受干预的相似商品作为合成控制组,估计反事实需求。

## ③ 业务应用场景

- 业务问题:平台在大促期对核心母婴 SKU(纸尿裤、婴儿车)做搜索权重提升 + 首页 Banner 曝光,需要回答"如果没做促销,需求应该是多少"——避免把自然增长功劳归到促销 - 数据要求:全品类销量历史 + 促销标记 + 商品图谱(同类竞品关系) - GCF 配置:节点=SKU,边=同品类竞品,干预=促销曝光,合成控制=未受促销的同类 - 业务价值:促销 ROI 计算精度提升 30-50%,避免无效促销重复投放,以单次大促 500 万元预算计,节省浪费支出 50-100 万元/次
三轨验证： - 成本：数据采集需整合全品类销量日志与促销标记，计算资源需 GPU 集群（单次训练约 5000 元/天），人力投入约 2 人月（数据工程 + 模型开发）。 - 合规：需确保促销标记不泄露用户隐私，符合 GDPR 匿名化要求；反事实结果仅用于内部复盘，不对外披露，不触碰 Amazon 政策红线。 - 风险：若反事实高估自然需求，可能导致错误削减有效促销，引发竞品趁机抢占份额；需设置人工审核环节，避免自动化决策。
- 业务问题:海运延误/缺货时商品 listing 自动下架(干预 $T=1$),恢复后需要估计"缺货期间真实需求是多少"以确定补货量,避免二次缺货或过量 - 数据要求:订单日志 + 配送 SLA 状态 + 同品类同价位段竞品销量 - GCF 配置:干预=配送 SLA 突变,控制组=未受影响的同类竞品图邻居,反事实=正常供货下需求曲线 - 业务价值:补货精度提升 40-60%,避免二次缺货导致的客户流失;按缺货事件平均损失 20 万元/单仓/次计,年化避免损失 200-400 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

难处:无开源代码,需自行实现 RGCN + Dilated CNN(参考 PyTorch Geometric)
难处:需要构建商品关系图(可与 Hierarchical-Product-KG 配合)
GPU 需求中-高(多个 RGCN 层 + 长序列)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（83 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/causal_time_series_forecasting_gcf` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Causal-Time-Series-Forecasting-GCF.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GCF Causal Forecasting 最小骨架
论文 AAAI 2025 (Amazon), DOI: 10.1609/aaai.v39i28.35148
无公开代码,以下骨架按论文 §3-4 还原。
"""
from __future__ import annotations
import torch
import torch.nn as nn
import torch.nn.functional as F


class RGCNEncoder(nn.Module):
    def __init__(self, in_dim: int = 32, hid_dim: int = 64, n_relations: int = 3):
        super().__init__()
        self.W = nn.Parameter(torch.randn(n_relations, in_dim, hid_dim) * 0.1)
        self.W_self = nn.Linear(in_dim, hid_dim)
        self.n_relations = n_relations

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor, edge_type: torch.Tensor) -> torch.Tensor:
        h = self.W_self(x)
        for r in range(self.n_relations):
            mask = edge_type == r
            if mask.sum() == 0:
                continue
            src = edge_index[0][mask]
            dst = edge_index[1][mask]
            messages = x[src] @ self.W[r]
            h = h.index_add(0, dst, messages)
        return F.relu(h)


class DilatedTCN(nn.Module):
    def __init__(self, hid_dim: int = 64):
        super().__init__()
        self.conv1 = nn.Conv1d(hid_dim, hid_dim, kernel_size=3, dilation=1, padding=1)
        self.conv2 = nn.Conv1d(hid_dim, hid_dim, kernel_size=3, dilation=2, padding=2)
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.out = nn.Linear(hid_dim, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = F.relu(self.conv1(x))
        h = F.relu(self.conv2(h))
        h = self.pool(h).squeeze(-1)
        return self.out(h)


class GCF(nn.Module):
    def __init__(self, in_dim: int = 32, hid_dim: int = 64):
        super().__init__()
        self.encoder = RGCNEncoder(in_dim, hid_dim)
        self.decoder = DilatedTCN(hid_dim)

    def forward(self, x_seq: torch.Tensor, edge_index: torch.Tensor, edge_type: torch.Tensor) -> torch.Tensor:
        T = x_seq.shape[1]
        h_list = [self.encoder(x_seq[:, t, :], edge_index, edge_type) for t in range(T)]
        h_seq = torch.stack(h_list, dim=2)
        return self.decoder(h_seq)


def estimate_ate(y_factual: torch.Tensor, y_counterfactual: torch.Tensor, treated_mask: torch.Tensor) -> float:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：全品类销量历史、促销与下架等干预标记、商品图谱（同类竞品关系）、以及配送时效状态；训练需要 GPU 资源。

**输出**：被压制情景下的反事实需求曲线与真实需求估计、促销回报校正结论与补货量建议；卡页口径促销回报计算精度提升 30-50%、补货精度提升 40-60%。

## 执行步骤

1. 构建商品关系图，标注同品类竞品等边关系。
2. 整合销量历史与促销、缺货、下架等干预标记。
3. 用图神经网络与空洞卷积同时建模商品关系与长程时序。
4. 自动选取未受干预的相似商品作为合成控制，估计反事实需求。
5. 输出反事实需求与补货、促销调整建议，并保留人工审核环节。

## 边界与不做

- 商品关系图缺失、或几乎全品类同时受同一干预（如全站大促）时不要用，找不到可用的合成控制。
- 能力边界：需自行实现图神经网络与时序模型（卡页注明无开源代码），GPU 需求中到高；反事实若高估自然需求，可能错误削减有效促销，须设人工审核避免全自动决策。卡页的精度提升为特定口径。
- 合规红线：反事实结果仅用于内部复盘与补货决策、不对外披露，促销标记与订单数据须脱敏并符合匿名化要求。

## 技能关联

- **前置**：Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-Causal-Time-Series-Forecasting-GCF

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：03-时间序列　·　源卡：`Skill-Causal-Time-Series-Forecasting-GCF`