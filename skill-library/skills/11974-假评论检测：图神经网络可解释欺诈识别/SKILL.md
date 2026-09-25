---
name: "p2s-fake-review-detection"
title: "Fake Review Detection — 假评论检测：图神经网络+LLM 可解释欺诈识别"
description: "触发词：假评论检测、图神经网络、刷单识别、可解释欺诈、评论审核。何时不用：只判断文本是否 AI 生成走内容检测；只做时序突增预警走差评速率异常检测。安全边界：评论与 reviewer 数据的采集与使用须遵守平台条款与数据最小化原则，判定结论须可解释并保留人工复审。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 质量分析"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Fake-Review-Detection"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "用图结构与行为特征抓出有组织的假评论，并给出可解释的判定理由。"
user_try: "试试：按图神经网络的方式扫这批评论，把虚假评论挑出来并说明理由。"
whenToUse: "评论量巨大、人工审核跟不上，且需要给出可解释判定时用；只判别单条文本是否机器生成请转内容检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Fake Review Detection — 假评论检测：图神经网络+LLM 可解释欺诈识别

## ① 解决的问题

品类经理面临刷评污染口碑——Fake Review将异常评论拦截率78%提到96%，年化省21万元

## ② 核心算法逻辑

通过构建评论者商品评论内容三元交互图，用图神经网络（GCN）捕捉异常模式，结合大语言模型进行可解释性推理，实现对刷单、竞品恶意评论的精准识别。

## ③ 业务应用场景

业务问题： 竞品通过雇佣刷手账户对我方 A9 排名前 10 的奶粉 SKU 发布 1-2 星恶意评论，导致转化率下降 18%。传统人工审核需 3-5 天，期间虚假评论已影响排名。
数据规模： - 爬取 Amazon 美国站婴儿奶粉类目全量 SKU：52 万个 - 评论总量：1,240 万条（时间跨度 2024-2026） - 目标 SKU（我方产品）：180 个，评论 8.5 万条 - 标注样本：5,000 条（其中虚假评论 620 条，占 12.4%）
量化产出： - 检测精度：Precision 98.8%，Recall 94.2%（F1=0.965） - 成本节省：原需 2 名审核员全职审核，月成本 ¥18,000；自动化后仅需 1 人复审异议，月成本 ¥6,000，月度节省 ¥12,000 - 业务影响：虚假差评拦截率 94.2%，目标 SKU 平均评分恢复 0.3 星，转化率回升 12%，预计年增收 ¥280 万 - 上线周期：模型训练 5 天，部署 2 天，总计 7 天

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

380 万/年

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（319 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/fake_review_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Fake-Review-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from scipy.sparse import csr_matrix
from scipy.spatial.distance import cosine
import hashlib
from datetime import datetime, timedelta

class FakeReviewDetector:
    """
    假评论检测系统：基于图神经网络 + 异常检测的可解释欺诈识别
    
    核心逻辑：
    1. 构建评论者-商品-内容三元交互图
    2. 计算节点异常度（图结构特征）
    3. 计算内容异常度（文本特征）
    4. 融合两部分得到欺诈分数
    """
    
    def __init__(self, fraud_threshold=0.65, alpha=0.7):
        """
        初始化检测器
        
        Args:
            fraud_threshold: 欺诈分数阈值（0-1），>阈值判定为虚假评论
            alpha: GCN 权重（0-1），(1-alpha) 为 LLM 权重
        """
        self.fraud_threshold = fraud_threshold
        self.alpha = alpha
        self.scaler = StandardScaler()
        self.iso_forest = IsolationForest(contamination=0.1, random_state=42)
        
    def _build_interaction_graph(self, reviews_df):
        """
        构建评论者-商品-内容三元交互图
        
        Args:
            reviews_df: DataFrame，列=['reviewer_id', 'product_id', 'review_text', 'rating', 'timestamp']
        
        Returns:
            graph_features: 每条评论的图特征字典
        """
        graph_features = {}
        
        # 计算评论者行为特征
        reviewer_stats = reviews_df.groupby('reviewer_id').agg({
            'review_id': 'count',
            'timestamp': ['min', 'max'],
            'rating': ['mean', 'std']
        }).reset_index()
        reviewer_stats.columns = ['reviewer_id', 'review_count', 'first_review', 'last_review', 'avg_rating', 'rating_std']
        
        # 计算商品评论分布特征
        product_stats = reviews_df.groupby('product_id').agg({
            'review_id': 'count',
            'rating': ['mean', 'std']
        }).reset_index()
        product_stats.columns = ['product_id', 'product_review_count', 'product_avg_rating', 'product_rating_std']
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.08332 — Detecting Fake Reviewer Groups in Dynamic Networks: An Adaptive Graph Learning Method
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：品类或目标 SKU 的评论全量（含 reviewer 关系、时间戳、评分、文本）与一批人工标注的真实/虚假样本

**输出**：评论级判定结果与可解释证据（卡页指标：Precision 98.8%、Recall 94.2%），供审核团队复审异议与平台沟通使用

## 执行步骤

1. 构建评论者、商品与评论的交互图，落成图特征。
2. 结合文本与行为特征训练检测模型，用标注样本评估。
3. 输出评论级判定与解释依据，供人工复审异议。
4. 把自动判定接入审核流程，只保留少量人工复审判例。

## 边界与不做

- 何时不用：只需判断单条文本是否 AI 生成时请转内容检测；只做时序突增预警可先用更轻的方案。
- 能力边界：判定结果需可解释并保留人工复审通道，不能直接作为平台处罚依据。
- 安全边界：评论与 reviewer 数据的采集与使用须遵守平台条款与数据最小化原则。

## 技能关联

- **前置**：Skill-Review-Data-Standardization
- **延伸**：Skill-Review-Sentiment-Classification、Skill-VOC-Analysis-Pipeline
- **可组合**：Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Fake-Review-Detection

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Fake-Review-Detection`