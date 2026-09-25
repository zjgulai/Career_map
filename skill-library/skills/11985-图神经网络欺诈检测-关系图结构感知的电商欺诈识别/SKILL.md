---
name: "p2s-gnn-fraud-detection"
title: "图神经网络欺诈检测 — 关系图结构感知的电商欺诈识别"
description: "触发词：欺诈团伙、图传播、关系边、种子扩散、团伙召回。何时不用：没有已知欺诈种子账号、或账号间没有共享设备与地址数据时，图传播无从扩散；本技能靠关系网把团伙补全。安全边界：共享 IP 不能作为封号的唯一依据，需多因子确认；用户行为追踪须符合隐私法规。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-GNN-Fraud-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "从已确认的刷单账号出发，顺着共享设备、地址、IP 的关系网把整个团伙补全出来。"
user_try: "试试：从这些已确认的刷单账号出发，把整个欺诈团伙找出来。"
whenToUse: "已有部分确认的欺诈账号、需要顺着关系网扩线时用本技能；只有单账号特征、没有关系数据时用规则或分类模型。"
workflow: "整理订单中的设备、地址、IP 关系 → 以已标注欺诈账号为种子 → 在关系图上做标签传播与打分 → 输出完整团伙名单并做边质量评估"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 图神经网络欺诈检测 — 关系图结构感知的电商欺诈识别

## ① 解决的问题

风控团队面临"欺诈团伙通过设备/地址/IP共享组织刷单但传统规则只能发现15%"——图神经网络传播使团伙召回率从15%提升至72%，年化减少欺诈损失约80万元

## ② 核心算法逻辑

传统欺诈检测的致命弱点：只看单个账号的行为特征（购买频次、账号年龄等），忽略了账号之间的关系网络。职业欺诈团伙的最大暴露点恰恰在关系网络上：

## ③ 业务应用场景

场景A：刷单欺诈团伙图识别 - 业务问题：出现大量"婴儿床"刷单订单（虚假好评），传统规则检测只发现了部分账号；已确认的欺诈账号中，有些与大量未被标记的账号共享设备/IP/地址，形成欺诈网络 - 数据要求：订单记录（含设备ID/收货地址/注册IP）+ 已标注欺诈账号（种子）+ 账号行为特征 - 预期产出：从12个已知欺诈账号出发，通过图传播发现完整欺诈团伙78个账号；精确率=89%（其中70个确认欺诈，8个误报），召回率从传统方法的15%提升至72% - 业务价值：识别并封停完整欺诈团伙，减少刷单GMV浪费约50万元/年；防止虚假好评对搜索排名的污染，保护品牌的自然流量
三轨对抗验证： 1. 成本验证：图构建可在标准数据库上完成（无需图数据库）；GNN训练在中等规模图（10万节点）上约30分钟（CPU）；更新图约每日一次即可 2. 合规验证：分析账号关系是合法的风控行为；注意不可将"与欺诈账号共享IP"作为封号的唯一依据（会误伤共享网络的正常用户），需多因子确认 3. 风险验证：图构建的边类型选择对结果影响显著；建议先做"边质量评估"（相同边类型下，欺诈账号的邻居中欺诈比例）；大图上GNN训练需要MiniBatch采样（GraphSAGE）
三轨验证 | 成本轨：月均成本3,200元（AI模型维护2,000元+人工审核10小时×120元/小时），ROI为25:1（月挽回8万元损失） | 合规轨：符合《电商法》第十七条反不正当竞争规定，满足平台治理义务；需建立用户知情机制，获取订单数据处理同意 | 风险轨：误杀率2-3%（正常订单被误判为刷单），影响用户体验；模型漂移风险（欺诈手段升级导致检测失效概率15%/季度）；数据隐私风险（涉及用户行为追踪需符合GDPR/PIPL）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：欺诈团伙召回率从15%提升至72%（+57%），识别完整团伙而非零散账号；年化减少刷单损失约50万元；防止搜索排名污染保护自然流量价值约30万元；综合约80万元/年
实施难度：⭐⭐⭐⭐☆（图构建简单，GNN训练需PyTorch Geometric；主要挑战是构建准确的关系图边）
优先级：⭐⭐⭐⭐⭐（修复19-风控↔08-知识图谱弱桥梁；团伙欺诈是亚马逊卖家最大的威胁之一，传统方法无法识别）
评估依据：KDD 2021 FRAUDRE是该方向最重要论文，引用量200+；阿里/京东/Amazon已在生产部署图神经欺诈检测；PyTorch Geometric已内置多种欺诈检测GNN实现

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-GNN-Fraud-Detection
图神经网络欺诈检测 — 多关系欺诈团伙图识别

依赖：pip install numpy pandas scikit-learn scipy
注意：完整GNN需 PyTorch Geometric；此处为图传播的简化实现
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score
from collections import defaultdict

np.random.seed(42)

# ── 1. 生成模拟欺诈账号图数据 ──────────────────────────────────────────
n_accounts = 5000

# 账号特征
account_age_days  = np.random.exponential(200, n_accounts)
purchase_count    = np.random.poisson(3, n_accounts).astype(float)
return_rate       = np.random.beta(1, 10, n_accounts)
device_id         = np.random.randint(0, 3000, n_accounts)  # 设备ID
address_cluster   = np.random.randint(0, 4000, n_accounts)  # 地址聚类
ip_segment        = np.random.randint(0, 5000, n_accounts)  # IP段

# 注入欺诈团伙（5个团伙，每团伙10-30个账号）
fraud_accounts = set()
gang_profiles  = []
for gang_id in range(5):
    gang_size = np.random.randint(10, 30)
    # 团伙共享特征
    shared_device  = np.random.randint(0, 100)  # 团伙使用的设备
    shared_address = np.random.randint(0, 100)  # 团伙使用的地址
    shared_ip      = np.random.randint(0, 100)  # 团伙使用的IP段

    gang_members = np.random.choice(n_accounts, gang_size, replace=False)
    fraud_accounts.update(gang_members)

    # 覆盖团伙成员的图特征
    for m in gang_members:
        if np.random.random() < 0.7:  # 70%概率共享设备
            device_id[m] = shared_device
        if np.random.random() < 0.6:  # 60%概率共享地址
            address_cluster[m] = shared_address
        if np.random.random() < 0.8:  # 80%概率同IP段
            ip_segment[m] = shared_ip
    gang_profiles.append(gang_members)

labels = np.zeros(n_accounts, dtype=int)
for gang in gang_profiles: labels[gang] = 1

print(f"账号数: {n_accounts} | 欺诈账号: {labels.sum()} ({labels.mean():.1%})")

# ── 2. 构建多关系欺诈图 ──────────────────────────────────────────────
def build_adjacency_from_shared_feature(feature_array, min_group_size=2, max_group_size=10):
    """
    根据共享特征值构建边（共享同一特征值 → 添加边）
    只构建合理规模的组（太大的组可能是公共特征，非欺诈）
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2105.13433。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：订单记录（含设备 ID、收货地址、注册 IP）、已标注的欺诈账号（种子）、账号行为特征；按账号与订单粒度，需可构建关系边。

**输出**：扩线后的欺诈团伙账号名单（含精确率与召回率评估）与边质量分析，供风控封停与申诉使用。

## 执行步骤

1. 汇总订单中的设备、地址、IP 字段
2. 构建账号关系图并评估边质量
3. 以已知欺诈账号为种子做图传播
4. 对未标注账号打分扩线
5. 输出团伙名单与精确率召回率评估

## 边界与不做

- 没有种子标签、或账号间没有可用的关系字段时，图传播无法展开。
- 本技能产出团伙名单与评分，不直接执行封号与资金处置。
- 不得把共享 IP 当作封号的唯一依据，需多因子确认；用户行为追踪须符合隐私法规。

## 技能关联

- **前置**：Skill-Class-Conditional-Generation-Augment.html、Skill-Class-Conditional-Generation-Augment、Skill-DS-DGA-GCN-Fake-Review-Group-Detection.html、Skill-DS-DGA-GCN-Fake-Review-Group-Detection、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Multimodal-Fake-Review-Detection.html、Skill-Multimodal-Fake-Review-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-Class-Conditional-Generation-Augment.html、Skill-Class-Conditional-Generation-Augment、Skill-DS-DGA-GCN-Fake-Review-Group-Detection.html、Skill-DS-DGA-GCN-Fake-Review-Group-Detection、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Multimodal-Fake-Review-Detection.html、Skill-Multimodal-Fake-Review-Detection
- **可组合**：Skill-Class-Conditional-Generation-Augment.html、Skill-Class-Conditional-Generation-Augment、Skill-Identity-Fraud-Detection.html、Skill-Identity-Fraud-Detection、Skill-Multimodal-Fake-Review-Detection.html、Skill-Multimodal-Fake-Review-Detection、Skill-GNN-Fraud-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-GNN-Fraud-Detection`