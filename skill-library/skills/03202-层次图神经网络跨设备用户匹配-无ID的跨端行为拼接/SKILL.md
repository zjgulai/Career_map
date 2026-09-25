---
name: "p2s-hgnn-cross-device-matching"
title: "层次图神经网络跨设备用户匹配 - 无ID的跨端行为拼接"
description: "触发词：层次图神经网络、跨设备匹配、URL 序列、异构图、无 ID 拼接、行为相似度。何时不用：每台设备日志过少或只有 IP 维度时图方法不可靠；有确定性 ID 时直接用 ID 图谱。安全边界：URL 仅保留域名与前两级路径、剔除查询参数中的个人信息，处理流程需符合隐私法规且不依赖第三方 Cookie。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 数据管道"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-HGNN-Cross-Device-Matching"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用设备上的 URL 访问序列构图，判断手机与电脑是不是同一个人。"
user_try: "试试：手机看到广告、电脑下单但链路断了，帮我判断这两台设备是不是同一用户。"
whenToUse: "无第三方 Cookie、但每台设备有足够 URL 访问序列时用本技能；会话极稀疏时用更轻量的图方法；有确定性 ID 时不必做模型匹配。"
workflow: "采集并编码设备 URL 访问序列 → 构建细粒度与粗粒度节点的层次异构图 → 用图神经网络学习设备表示 → 计算设备对相似度并判定是否同一用户 → 恢复跨端转化路径并输出匹配清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 层次图神经网络跨设备用户匹配 - 无ID的跨端行为拼接

## ① 解决的问题

业务问题：母婴 DTC 站在 Instagram 投广告，用户在手机看到广告、到电脑搜索品牌词下单

## ② 核心算法逻辑

将每台设备的 URL 访问序列 $\mathcal{S}_v = \{s_1, s_2, \ldots, s_n\}$ 构建为层次异构图：

## ③ 业务应用场景

业务问题：母婴 DTC 站在 Instagram 投广告，用户在手机看到广告、到电脑搜索品牌词下单。设备级日志显示"手机曝光零转化""电脑无广告来源"——Sankey 归因图中跨设备链路断裂，平台报告 ROAS 严重失真。需要识别"这两台设备属于同一用户"，恢复真实跨端转化路径。
| 字段 | 类型 | 示例 | |------|------|------| | `device_id` | str | `"mob_a3f9c2"` / `"pc_b71e44"` | | `url_sequence` | List[str] | `["instagram.com/reel/xxx", "google.com/search?q=品牌", "brand.com/product/abc"]` | | `timestamp_sequence` | List[datetime] | `[2025-03-01 10:15, 2025-03-01 10:16, ...]` | | `d
- 最小要求：每设备至少 20 条匿名 URL 日志（时间跨度 2-4 周） - 数据来源：独立站服务端日志（不依赖第三方 Cookie），通过 IP + User-Agent 初步聚类生成 device_id - 隐私合规：URL 仅保留 domain+path 前两级，不含查询参数中的个人信息

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（514 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/hgnn_cross_device_matching` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-HGNN-Cross-Device-Matching.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
HGNN Cross-Device Matching — 完整实现
arXiv:2304.03215 (NVIDIA, 2023)

依赖: torch>=2.0, torch_geometric>=2.4, numpy, scikit-learn
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import HeteroData, Batch
from torch_geometric.nn import MessagePassing, HeteroConv
import numpy as np
from typing import List, Tuple, Dict, Optional
from sklearn.metrics import f1_score, precision_score, recall_score


# ============================================================
# 1. 层次图构建
# ============================================================

def build_hierarchical_graph(
    url_sequence: List[int],
    K: int = 6,
    url_embed_dim: int = 64,
    url_vocab_size: int = 10000,
) -> HeteroData:
    """
    将 URL 访问序列转换为层次异构图（Fine + Coarse 节点）。
    
    Args:
        url_sequence: URL ID 列表（已编码为整数）
        K:            每 K 个连续 URL 分配一个 coarse 节点
        url_embed_dim: URL embedding 维度
        url_vocab_size: URL 词表大小
    
    Returns:
        HeteroData，包含 fine 节点、coarse 节点及其连边
    """
    data = HeteroData()
    
    # --- Fine 节点 ---
    # 去重 URL，保留首次出现顺序
    unique_urls = list(dict.fromkeys(url_sequence))
    url_to_idx = {url: i for i, url in enumerate(unique_urls)}
    n_fine = len(unique_urls)
    
    # Fine 节点特征：URL ID embedding（训练时替换为 Doc2vec/TF-IDF 向量）
    fine_node_ids = torch.tensor(unique_urls, dtype=torch.long)  # 用于 embedding lookup
    data['fine'].x = fine_node_ids
    data['fine'].num_nodes = n_fine
    
    # Fine → Fine 有向边（相邻 URL 对，含自环）
    src, dst = [], []
    for i in range(len(url_sequence) - 1):
        s = url_to_idx[url_sequence[i]]
        d = url_to_idx[url_sequence[i + 1]]
        src.append(s)
        dst.append(d)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2304.03215。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：设备级数据：device_id、URL 访问序列、时间戳序列；每台设备至少约 20 条匿名 URL 日志、时间跨度 2-4 周，数据来自独立站服务端日志且 URL 已按隐私要求裁剪。

**输出**：设备表示的相似度与匹配判定、同一用户的设备对清单、恢复后的跨端转化链路；供归因团队修正平台报表中失真的 ROAS。

## 执行步骤

1. 采集并编码设备 URL 访问序列
2. 构建细粒度与粗粒度节点的层次异构图
3. 用图神经网络学习设备表示
4. 计算设备对相似度并判定是否同一用户
5. 恢复跨端转化路径并输出匹配清单

## 边界与不做

- 何时不用：每台设备日志过少、或只有 IP 维度时图结构无法支撑表示学习，先用轻量图方法或放弃跨端拼接。
- 能力边界：本技能产出设备匹配与链路恢复结果，不写入任何身份系统，也不替代平台侧归因。
- 合规边界：URL 仅保留域名与前两级路径、剔除查询参数中的个人信息，处理流程需符合隐私法规且不依赖第三方 Cookie。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GraphTrack-Cross-Device-Tracking.html、Skill-GraphTrack-Cross-Device-Tracking、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GraphTrack-Cross-Device-Tracking.html、Skill-GraphTrack-Cross-Device-Tracking、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-HGNN-Cross-Device-Matching

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-HGNN-Cross-Device-Matching`