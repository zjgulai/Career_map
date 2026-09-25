---
name: "p2s-sequential-recommendation-transformer"
title: "序列推荐Transformer — 基于购买序列的个性化下一步推荐"
description: "触发词：序列推荐、下一步推荐、购买序列建模、月龄适配排序、冷启动回退。何时不用：只有静态商品与用户特征、没有行为序列时用协同过滤或属性召回；本技能依赖足量的时序购买序列。安全边界：推荐逻辑不得对同一 SKU 做价格歧视；模型评估须剔除大促期数据以免泄漏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Sequential-Recommendation-Transformer"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "看懂用户的购买序列，推荐他下一步真正需要的东西，避免给 0-1 岁宝宝的家长推 12 月龄辅食这类错配。"
user_try: "试试：根据历史订单序列和商品月龄标签，为每位用户生成下一个最可能购买的 Top-10 SKU，并说明月龄适配理由。"
whenToUse: "用户有足够长的行为序列、要做个性化下一步推荐时用本技能；序列不足 5 条的用户会退化为流行度推荐，此时不如直接用热销榜。"
workflow: "接入用户历史订单序列（SKU + 时间戳）与商品属性标签 → 序列达 5 条以上时训练序列模型，不足则回退流行度推荐 → 按用户月龄适配度与个人偏好对候选 SKU 排序 → 输出 Top-N 推荐并用于搜索结果重排"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 序列推荐Transformer — 基于购买序列的个性化下一步推荐

## ① 解决的问题

电商运营面临"婴儿月龄驱动需求快速演变但推荐缺乏时序感知"——SASRec序列建模使复购率从22%提升至28%，年化GMV增量约360万元

## ② 核心算法逻辑

序列推荐（Sequential Recommendation）将用户的历史交互序列视为"购物句子"，用Transformer结构捕捉购买行为的时序依赖和意图演变。

## ③ 业务应用场景

场景A：基于购买旅程的复购推荐 - 业务问题：亚马逊店铺的复购率仅22%，首购后无个性化推荐导致用户流失。传统协同过滤推荐"热销爆款"，但月龄0-1岁用户推荐"12月龄辅食"严重错配 - 数据要求：用户历史订单序列（SKU ID + 购买时间戳，至少60天）、商品属性（品类/月龄段/标签）；用户序列至少5条才能激活SASRec，否则退回流行度推荐 - 预期产出：为每个用户生成"下一个最可能购买的Top-10 SKU"，按月龄适配度和个人偏好排序；如购买序列为[奶粉0段, 奶瓶, 奶瓶刷]，则推荐[奶粉1段, 安抚奶嘴, 吸鼻器] - 业务价值：论文数据：在NDCG@10上提升约25-70%（个
三轨对抗验证： 1. 成本验证：RecJPQ压缩后模型大小从8GB降至4GB，单机GPU可承载；推理延迟P95约20ms，满足实时推荐需求；训练约4-8小时/epoch（A100） 2. 合规验证：推荐系统不涉及违规操纵；注意推荐数据不可包含价格歧视逻辑（对不同用户推荐不同价格的同一SKU） 3. 风险验证：新品冷启动（无序列数据）会退化为纯流行度推荐，降低个性化效果；大促期用户行为分布偏移（购买大额礼品非日常需求），需在评估时排除大促期数据，避免泄漏
场景B：搜索结果重排序 - 业务问题：用户搜索"奶粉"，结果缺乏个性化（新生儿用户和12月龄宝宝妈看到相同排序） - 数据要求：同上 + 搜索词上下文 - 预期产出：序列模型提取用户月龄偏好信号，对搜索结果按用户个人历史重排，0段奶粉用户置顶0段系列 - 业务价值：搜索CVR预估提升10-15%，约20万元/月增量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：RecSys 2024论文数据：个性化流行度融合使NDCG@10提升25-70%；母婴场景预估复购率从22%提升至28%（+6个百分点），月GMV 50万下年化增量约360万元；额外减少月龄错配推荐约40%，降低退货率约2%（年化节省约30万元）
实施难度：⭐⭐⭐☆☆（开源实现成熟，RecBole框架可直接使用；主要挑战在数据管道建设和冷启动处理）
优先级：⭐⭐⭐⭐☆（母婴用户月龄驱动的需求快速演变是行业独特性，序列推荐针对性强）
评估依据：RecSys 2024两篇论文均达到产业级验证；百万商品规模的RecJPQ工程化方案已在生产环境验证（加速4.5倍）；亚马逊官方推荐系统核心组件即序列建模

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Sequential-Recommendation-Transformer
序列推荐Transformer — 母婴电商购买序列建模

依赖：pip install numpy pandas scikit-learn
注意：生产版本需 PyTorch + 完整SASRec实现；此为简化版展示核心逻辑
"""

import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity

np.random.seed(42)

# ── 1. 模拟母婴用户购买序列数据 ─────────────────────────────────────
BABY_ITEMS = {
    'ITEM_001': {'name': '0段奶粉',    'age_group': 0,  'category': '奶粉'},
    'ITEM_002': {'name': '1段奶粉',    'age_group': 1,  'category': '奶粉'},
    'ITEM_003': {'name': '2段奶粉',    'age_group': 2,  'category': '奶粉'},
    'ITEM_004': {'name': '标准奶瓶',   'age_group': 0,  'category': '喂养'},
    'ITEM_005': {'name': '宽口奶瓶',   'age_group': 1,  'category': '喂养'},
    'ITEM_006': {'name': '奶瓶刷',     'age_group': 0,  'category': '清洁'},
    'ITEM_007': {'name': '吸鼻器',     'age_group': 0,  'category': '护理'},
    'ITEM_008': {'name': '辅食机',     'age_group': 4,  'category': '辅食'},
    'ITEM_009': {'name': '学步车',     'age_group': 8,  'category': '玩具'},
    'ITEM_010': {'name': '安抚奶嘴',   'age_group': 0,  'category': '安抚'},
    'ITEM_011': {'name': '婴儿湿巾',   'age_group': 0,  'category': '护理'},
    'ITEM_012': {'name': '纸尿裤NB',   'age_group': 0,  'category': '尿裤'},
    'ITEM_013': {'name': '纸尿裤M',    'age_group': 3,  'category': '尿裤'},
    'ITEM_014': {'name': '爬行垫',     'age_group': 3,  'category': '玩具'},
}
item_ids = list(BABY_ITEMS.keys())

# 生成模拟用户购买序列
def generate_user_sequences(n_users=200, max_seq_len=15):
    sequences = {}
    for uid in range(n_users):
        # 用户的"月龄轨迹"：0-12个月逐步成长
        start_age = np.random.choice([0, 1, 2, 3, 4])
        seq_len   = np.random.randint(5, max_seq_len)
        seq = []
        current_age = start_age
        for _ in range(seq_len):
            # 根据当前月龄，从匹配商品中随机选（模拟真实购买行为）
            matching = [k for k, v in BABY_ITEMS.items() if v['age_group'] <= current_age + 1]
            if matching:
                item = np.random.choice(matching)
                seq.append(item)
            current_age = min(current_age + np.random.choice([0, 0, 1]), 12)
        sequences[uid] = seq
    return sequences

user_sequences = generate_user_sequences(200)
print(f"生成 {len(user_sequences)} 个用户购买序列")
print(f"平均序列长度: {np.mean([len(s) for s in user_sequences.values()]):.1f}")

# ── 2. 简化版序列推荐模型（基于共现矩阵 + 位置加权）────────────────
class SimpleSequentialRecommender:
    """
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2408.09992 — Efficient Inference of Sub-Item Id-based Sequential Recommendation Models with Millions of Items

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户历史订单序列（SKU ID + 购买时间戳，至少 60 天）与商品属性（品类、月龄段、标签）。用户序列至少 5 条才激活序列建模，否则回退流行度推荐。

**输出**：每位用户的『下一个最可能购买 Top-10 SKU』排序列表（含月龄适配度），可直接用于首页推荐位与搜索结果重排序。

## 执行步骤

1. 接入用户订单序列与商品月龄、品类属性
2. 对序列长度达标的用户训练或加载序列模型
3. 对序列不足的用户回退到流行度推荐
4. 按个人偏好与月龄适配度重排候选 SKU
5. 输出 Top-N 推荐列表用于推荐位与搜索重排

## 边界与不做

- 用户行为序列不足或商品缺少月龄/属性标签时不用本技能，否则会退化成流行度推荐。
- 本技能输出候选排序，不负责推荐位素材、文案与投放执行。
- 安全边界：推荐不得包含同一 SKU 的价格歧视逻辑；评估须剔除大促期数据避免行为偏移与泄漏。

## 技能关联

- **前置**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Contrastive-Sequential-Recommendation.html、Skill-Contrastive-Sequential-Recommendation、Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation
- **延伸**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Contrastive-Sequential-Recommendation.html、Skill-Contrastive-Sequential-Recommendation、Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR
- **可组合**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Contrastive-Sequential-Recommendation.html、Skill-Contrastive-Sequential-Recommendation、Skill-Sequential-Recommendation-Transformer

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：05-推荐系统　·　源卡：`Skill-Sequential-Recommendation-Transformer`