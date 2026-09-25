---
name: "p2s-clickstream-persona-pipeline"
title: "Clickstream Persona Pipeline — 点击流用户画像：VQ-VAE 离散 Persona + 多层行为 KG"
description: "触发词：点击流画像、Persona离散化、行为知识图谱、个性化推荐、用户分群。何时不用：只把评论转成情感特征时用情感 ML 管道技能；只需在线读取特征值、不涉及分群时用实时特征仓库技能。安全边界：用户行为数据须去标识化并按隐私授权使用，画像标签不得用于歧视性区别对待。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Clickstream-Persona-Pipeline"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把用户的点击行为压成少数几种可解释的画像，让推荐能区分预算型妈妈和品质型妈妈。"
user_try: "试试：把独立站六个月的点击序列编码成离散 Persona，给出每个 Persona 的可解释标签和对应推荐策略。"
whenToUse: "需要把连续行为序列变成少数可解释人群标签并驱动推荐与实验时用本技能；只需要在线读取特征值，用实时特征仓库技能。"
workflow: "收集并清洗点击流序列 → 用 VQ-VAE 把序列编码为离散 Persona token → 把 Persona 与行为知识图谱关联生成可解释标签 → 按 Persona 分组生成推荐队列 → 用 A/B 实验验证推荐效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Clickstream Persona Pipeline — 点击流用户画像：VQ-VAE 离散 Persona + 多层行为 KG

## ① 解决的问题

母婴跨境电商应用：独立站/APP 原始点击流 → 离散 persona token，驱动个性化推荐和 A/B 实验

## ② 核心算法逻辑

将母婴跨境电商用户的原始点击流序列，通过向量量化变分自编码器（VQVAE）压缩为离散 Persona Token，结合多层行为知识图谱，实现用户的可解释、可量化、可复用的身份编码。

## ③ 业务应用场景

业务问题： Amazon 母婴类目全量爬取数据显示，奶粉品类 SKU 数 12 万+，用户平均浏览深度仅 2.3 个商品后离开，转化率 3.2%。传统协同过滤推荐无法区分"价格敏感的预算妈妈"与"品质驱动的高净值妈妈"，导致推荐命中率低。
数据规模： - 原始点击流：50 万+ SKU，月活用户 280 万，日均点击事件 1.2 亿条 - 训练数据：6 个月历史点击序列，覆盖 1,850 万用户，数据质量 >99%（去重、去噪后） - 行为 KG：3 层结构，类目节点 12 万，意图节点 2,400（如"对比价格"、"查看评价"、"加购"), 生命周期节点 8（如"新手妈妈"、"换粉期"、"囤货期")
实施方案： 1. VQ-VAE 训练：将 6 个月点击序列编码为 64 维离散 Persona Token（K=96 个原型） 2. KG 融合：将每个 Persona 与行为图谱关联，生成可解释标签（如 Persona-23 = "高价敏感+对比价格+新手妈妈") 3. 推荐策略：同 Persona 用户共享推荐队列，优先展示该 Persona 高转化商品

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：数据工程师面临核心业务决策——数据采集覆盖率提升至 99%，年化节省人工 25 万元
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（362 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/clickstream_persona_pipeline` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Clickstream-Persona-Pipeline.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from scipy.spatial.distance import euclidean
from collections import defaultdict

class VQVAEPersonaEncoder:
    """
    VQ-VAE 离散 Persona 编码器 + 多层行为 KG 融合
    
    输入：用户点击序列 (batch_size, seq_len, feature_dim)
    输出：离散 Persona Token (batch_size,) + 可解释标签
    """
    
    def __init__(self, seq_len=20, feature_dim=8, latent_dim=16, num_personas=96):
        """
        Args:
            seq_len: 点击序列长度（如 20 个点击事件）
            feature_dim: 每个点击的特征维度（如 8 维：类目、价格、评分等）
            latent_dim: 隐层维度
            num_personas: 离散 Persona 原型数量
        """
        self.seq_len = seq_len
        self.feature_dim = feature_dim
        self.latent_dim = latent_dim
        self.num_personas = num_personas
        
        # 编码器权重（简化版，实际使用 PyTorch/TF）
        self.encoder_w1 = np.random.randn(seq_len * feature_dim, latent_dim) * 0.01
        self.encoder_b1 = np.zeros(latent_dim)
        
        # 码本（K 个 Persona 原型）
        self.codebook = np.random.randn(num_personas, latent_dim) * 0.01
        
        # 行为 KG：三层标签
        self.kg_category = {}  # Persona ID -> 类目分布
        self.kg_intent = {}    # Persona ID -> 意图分布
        self.kg_lifecycle = {} # Persona ID -> 生命周期分布
        
        # 解释标签库
        self.category_names = ["奶粉", "纸尿裤", "辅食", "玩具", "服装", "护肤", "推车", "监护器"]
        self.intent_names = ["对比价格", "查看评价", "检查库存", "浏览新品", "查看优惠", "阅读详情"]
        self.lifecycle_names = ["新手妈妈", "换粉期", "囤货期", "复购期", "流失预警", "高价敏感", "品质驱动", "时间敏感"]
    
    def encode(self, clickstream):
        """
        编码点击流为离散 Persona Token
        
        Args:
            clickstream: (seq_len, feature_dim) 用户点击序列
        
        Returns:
            persona_id: 离散 Persona Token (0 ~ num_personas-1)
            z_continuous: 连续隐向量
        """
        # 展平输入
        x_flat = clickstream.flatten()  # (seq_len * feature_dim,)
        
        # 编码：x -> z_e (连续向量)
        z_e = np.tanh(np.dot(x_flat, self.encoder_w1) + self.encoder_b1)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.14205 — SimPersona: Learning Discrete Buyer Personas from Raw Clickstreams for Grounded E-Commerce Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：原始点击流事件（用户 id、商品、行为类型、时间戳）与商品主数据、类目与意图标注，粒度到单次点击事件，序列按会话或时间窗切分。

**输出**：每个用户的离散 Persona token 与可解释画像标签（如高价敏感、对比价格、新手妈妈），以及分群推荐队列，供推荐系统、运营与 A/B 实验使用。

## 执行步骤

1. 收集并去重清洗点击流序列
2. 用 VQ-VAE 把历史点击序列编码为离散 Persona token
3. 把 Persona 与行为知识图谱关联，生成可解释标签
4. 按同 Persona 共享推荐队列并优先展示该群高转化商品
5. 用 A/B 实验验证分群推荐效果

## 边界与不做

- 点击流数据不足或缺少商品与意图标注时，Persona 训练与解释都不成立；用户量很小的场景不适用。
- 本技能产出分群与画像标签，不直接决定推荐排序模型，也不处理用户授权与隐私合规审批。

## 技能关联

- **前置**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Feature-Engineering-For-Clickstream
- **延伸**：Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-Trajectory-Pattern-Mining.html、Skill-Trajectory-Pattern-Mining、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **可组合**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Clickstream-Persona-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Clickstream-Persona-Pipeline`