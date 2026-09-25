---
name: "p2s-review-fraud-detection"
title: "Review Fraud Detection（虚假评论检测）"
description: "触发词：虚假评论检测、异构图GNN、刷评团伙、异常子图、账号关联、风险打分。何时不用：要出具带证据引用的申诉材料用「评论真伪裁决」；要做差评维度优先级排序用「差评根因分析」。安全边界：检测结论涉及删除评论、封号等处置时必须人工复核，不得自动执行；不得存储用户 PII，账号与评论数据使用须符合平台政策与个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 安全事件处理"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-Review-Fraud-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "3 天冒出 25 条措辞雷同的 5 星评论——用图结构把账号、时间、评分串起来，一眼看出是团伙刷评。"
user_try: "试试：检测这批凌晨涌入的 5 星评论，判断是不是团伙刷评并给出异常分数。"
whenToUse: "当短时间内出现来源集中、文本高度相似、评分极端的评论批次、需要识别团伙式刷评时用本技能；若要产出可提交平台的证据型申诉材料，用「评论真伪裁决」；若要排定差评修复优先级，用「差评根因分析」。"
workflow: "构建用户-评论-产品的异构图 → 计算局部密度、评分偏差与时间聚集度等图特征 → 用 GNN 输出异常子图与综合异常分数 → 按阈值判定虚假评论子图 → 输出风险清单供人工复核与处置"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review Fraud Detection（虚假评论检测）

## ① 解决的问题

审核主管面临刷评识别太慢——刷评检测将误放率从14%降到3%，年化省15万元

## ② 核心算法逻辑

核心思想：通过异构图神经网络（Heterogeneous GNN）识别评论网络中的异常子图结构，将虚假评论团伙的"集体作案特征"（账户关联、评分极端、时间聚集、文本相似）转化为图拓扑异常，实现比单条评论文本分析高 1520% 的检测准确率。

## ③ 业务应用场景

业务问题：某跨境母婴店铺在 Amazon 销售婴儿恒温暖奶器（客单价 $39.99），3 天内突然涌入 25 条 5 星评论，全部来自注册 <30 天的新账户，文本高度相似（余弦相似度 0.88），评论时间集中在凌晨 2-4 点。店铺担心被 Amazon 检测到虚假评论而遭降权或封号。
数据规模： - 产品历史评论：1200 条（跨度 6 个月） - 可疑评论批次：25 条 - 涉及账户：25 个新账户 + 200 个历史账户 - 图节点数：225（用户）+ 1（产品）= 226 - 图边数：1225（评论关系）
GNN 检测结果： | 指标 | 虚假评论子图 | 正常评论子图 | 阈值 | |------|----------|----------|------| | 局部密度 | 0.73 | 0.12 | >0.4 判定虚假 | | 评分偏差 | 4.8 | 0.3 | >1.5 判定虚假 | | 时间聚集度 | 0.91 | 0.15 | >0.6 判定虚假 | | 综合异常分数 | 0.87 | 0.08 | >0.5 判定虚假 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

场景 1（Amazon 暖奶器）：月度止损 8 万元 × 12 月 = 96 万元/年
场景 2（eBay 监护器）：月度止损 6.5 万元 × 12 月 = 78 万元/年
平均单店 ROI：(96 + 78) / 2 = 87 万元/年
部署成本：初期 2-2.5 万元 + 月度运维 2000-2500 元
投资回报期：3-4 个月
✅ 算法原理相对成熟，GNN 框架已有开源实现（PyTorch Geometric）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（301 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/review_fraud_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Review-Fraud-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy.spatial.distance import cosine
from sklearn.preprocessing import StandardScaler
from collections import defaultdict

class ReviewFraudDetector:
    """
    异构图神经网络虚假评论检测器
    支持用户-产品-评论三元关系建模
    """
    
    def __init__(self, contamination_rate=0.05):
        """
        Args:
            contamination_rate: 预期虚假评论比例（0-1）
        """
        self.contamination_rate = contamination_rate
        self.scaler = StandardScaler()
        self.anomaly_threshold = None
        
    def build_heterogeneous_graph(self, reviews_df):
        """
        构建异构图：用户 -> 评论 -> 产品
        
        Args:
            reviews_df: DataFrame with columns [user_id, product_id, rating, text, timestamp]
        
        Returns:
            graph_dict: {
                'user_neighbors': {user_id: [review_indices]},
                'product_neighbors': {product_id: [review_indices]},
                'review_features': np.array (n_reviews, n_features)
            }
        """
        graph = {
            'user_neighbors': defaultdict(list),
            'product_neighbors': defaultdict(list),
            'review_features': []
        }
        
        for idx, row in reviews_df.iterrows():
            graph['user_neighbors'][row['user_id']].append(idx)
            graph['product_neighbors'][row['product_id']].append(idx)
        
        return graph
    
    def compute_local_density(self, graph, review_idx, reviews_df):
        """
        计算评论所在子图的局部密度
        密度 = 邻近账户之间的连接数 / 最大可能连接数
        """
        user_id = reviews_df.loc[review_idx, 'user_id']
        product_id = reviews_df.loc[review_idx, 'product_id']
        
        # 同产品上该用户的其他评论
        user_reviews = graph['user_neighbors'][user_id]
        product_reviews = graph['product_neighbors'][product_id]
        
        # 共同评论（邻近节点）
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：评论数据（user_id、product_id、rating、text、timestamp）；卡页示例为 6 个月约 1200 条历史评论与 25 条可疑批次，涉及 225 个用户节点与 1225 条评论边。

**输出**：虚假评论子图与综合异常分数（含局部密度、评分偏差、时间聚集度等指标）以及风险评论清单；供审核与风控团队处置、申诉使用。

## 执行步骤

1. 整理评论数据并构建用户、评论、产品的异构图
2. 计算局部密度、评分偏差与时间聚集度等特征
3. 用图神经网络输出异常子图与综合异常分数
4. 按阈值判定哪些子图属于虚假评论群体
5. 输出风险评论清单并交人工复核后再处置

## 边界与不做

- 数据不满足：缺少账号信息或评论时间戳时图特征算不出，需先补数据字段。
- 何时不用：证据型申诉材料用「评论真伪裁决」，差评根因排序用「差评根因分析」。
- 能力边界：输出风险判定与分数，不执行删除、封号等处置动作。
- 安全边界：涉及处置的结论必须人工复核，不得存储用户 PII。

## 技能关联

- **前置**：Skill-Feature-Engineering-For-Ecommerce、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling
- **延伸**：Skill-Anomaly-Detection-Ensemble、Skill-Graph-Neural-Network-Fundamentals
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-LLM-Review-Sentiment-Classification、Skill-Seller-Credit-Score-Prediction、Skill-Review-Fraud-Detection

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：19-风控反欺诈　·　源卡：`Skill-Review-Fraud-Detection`