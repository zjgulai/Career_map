---
name: "p2s-privacy-preserving-lookalike-fl"
title: "Privacy-Preserving Lookalike FL — 联邦学习跨平台相似受众建模 GDPR 合规下不上传原始用户数据"
description: "触发词：联邦学习、跨平台建模、种子受众、隐私合规、GDPR、梯度交换。何时不用：自有数据可合法上传平台做相似受众时不必上联邦方案；本卡用于数据不得出本地、需与平台联合建模的场景。安全边界：原始数据与 PII 不出本地，只交换加密梯度；须先签平台数据处理协议并对儿童数据做特殊保护评估。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 隐私需求分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Privacy-Preserving-Lookalike-FL"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户数据不出本地也能和平台一起建相似受众模型，既扩量又避开隐私合规罚款。"
user_try: "试试：我在欧洲市场不能把用户数据传给 Meta，帮我设计一套纵向联邦学习方案，用本地购买数据训练 Lookalike。"
whenToUse: "与「隐私保护广告测量」相比：跨平台真实转化数估算走 OPRF 那张卡；要基于不得出域的数据训练相似受众、扩展投放人群时用本卡。"
workflow: "广告主侧整理购买记录与种子标签，媒体侧准备不含 PII 的兴趣标签 → 双方各训练底层模型，仅交换加密梯度（安全聚合） → 在对齐用户上评估联邦模型 AUC 并与纯本地模型对比 → 由媒体侧返回 Top 相似用户 ID 并接入投放，不返回分数"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Privacy-Preserving Lookalike FL — 联邦学习跨平台相似受众建模 GDPR 合规下不上传原始用户数据

## ① 解决的问题

欧盟市场运营面临"GDPR/CCPA禁止用户数据上传至Meta/TikTok"——垂直联邦学习跨平台建模在数据不出本地前提下Lookalike质量提升12-20%，同时规避最高4%全球营收的合规罚款风险

## ② 核心算法逻辑

GDPR（欧盟）、CCPA（加州）、PIPL（中国）等隐私法规要求广告主不得将用户 PII 上传至第三方平台。传统 Lookalike 需要将种子用户数据（邮箱/手机号哈希）上传给 Meta/TikTok，技术上合规但存在法律风险。联邦 Lookalike 彻底解决这一问题：各方数据不出本地，只交换加密的模型梯度。

## ③ 业务应用场景

业务问题：在德国/法国市场，母婴 DTC 品牌想用 Amazon 购买历史做 Meta 的 Lookalike，但 GDPR Article 9（儿童数据特殊保护）+ CCPA 让直接上传用户哈希存在合规风险，法务要求所有个人数据留在企业本地。
联邦方案： 1. 广告主侧（Host）：Amazon 购买记录（品类/频次/LTV）+ 种子标签 2. Meta 侧（Guest）：用户兴趣标签（不含 PII，Meta 提供 API） 3. VFL 训练：双方各训练底层模型，只交换加密梯度（Meta 采用 Secure Aggregation） 4. 输出：Meta 侧返回 Top 50 万相似用户 ID（不返回分数）
数据要求： - 广告主侧：历史购买记录（品类/金额/频次），种子集 ≥ 200 人 - Meta 侧：Meta Conversions API（CAPI）集成，服务器端事件上传 - 法律要求：签署 Meta 数据处理协议（DPA）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：欧盟 / 北美市场避免 GDPR/CCPA 违规风险（最高罚款 4% 全球营收），同时 Lookalike 质量比传统方法提升 12-20%，年化增收约 $5-15 万（$50 万广告预算基准）
实施难度：⭐⭐⭐⭐☆（需与平台签署 DPA + 实现安全梯度通信，生产级需配合 FATE/PySyft，约 8-12 周）
优先级：⭐⭐⭐⭐☆（法规收紧趋势下必备，优先级随欧盟/北美市场占比提升）
评估依据：FedUD 在真实跨平台广告数据集上 AUC 比传统 VFL 高 1.8%，比纯 Host 模型高 3.2%；FedAds 基准显示联邦模型在保持 95% 效果的同时满足 (ε=2, δ=1e-5)-DP

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（265 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Privacy-Preserving Lookalike via Federated Learning (Simulation)
联邦学习 Lookalike 模拟（无真实加密通信，展示架构和逻辑）

依赖：numpy, pandas, scikit-learn
注意：生产实现需配合 PySyft / FATE / TensorFlow Federated 等框架
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟两方数据（广告主侧 + 媒体平台侧）
# ─────────────────────────────────────────────

def generate_two_party_data(n_total: int = 2000, n_seeds: int = 200,
                              alignment_rate: float = 0.35
                              ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    生成广告主（Host）和媒体平台（Guest）两方数据

    Returns:
        host_df: 广告主侧数据（购买行为）
        guest_df: 媒体平台侧数据（兴趣标签）
        aligned_ids: 对齐用户 ID 列表
    """
    np.random.seed(42)
    all_ids = [f"U{i:04d}" for i in range(n_total)]

    # 广告主侧：购买行为特征（全量用户，含种子标签）
    host_df = pd.DataFrame({
        'user_id': all_ids,
        'purchase_freq_90d': np.random.poisson(1.5, n_total),
        'avg_order_value': np.random.lognormal(4.0, 0.5, n_total),
        'baby_product_affinity': np.random.beta(2, 3, n_total),
        'days_since_last_purchase': np.random.exponential(30, n_total),
        'category_breadth': np.random.randint(1, 6, n_total),
    })
    # 种子标签：高价值购买者
    ltv_proxy = (host_df['purchase_freq_90d'] * host_df['avg_order_value'] *
                 host_df['baby_product_affinity'])
    threshold = np.percentile(ltv_proxy, 90)
    host_df['is_seed'] = (ltv_proxy >= threshold).astype(int)
    # 确保种子集大小
    seed_ids = host_df[host_df['is_seed'] == 1]['user_id'].tolist()[:n_seeds]
    host_df['is_seed'] = host_df['user_id'].isin(seed_ids).astype(int)

    # 媒体平台侧：兴趣标签（仅部分用户有）
    guest_size = int(n_total * 0.7)
    guest_ids = np.random.choice(all_ids, guest_size, replace=False).tolist()
    guest_df = pd.DataFrame({
        'user_id': guest_ids,
        'parenting_interest_score': np.random.beta(3, 2, guest_size),
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2305.08328 — FedAds: A Benchmark for Privacy-Preserving CVR Estimation with Vertical Federated Learning

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：广告主侧历史购买记录（品类、金额、频次）与种子集（卡页案例要求 ≥200 人）；媒体侧兴趣标签与服务器端事件接口（如 Meta Conversions API）；须已签署 DPA 并明确法律基础。

**输出**：联邦模型与本地模型的 AUC 对比、相似受众扩展名单（平台侧返回 Top 用户 ID，不含分数）与合规留痕材料，供增长与法务共同评审。

## 执行步骤

1. 梳理广告主侧与媒体侧各自持有的特征，划清不得出域的字段。
2. 双方各自训练底层模型，通过安全聚合交换加密梯度。
3. 在对齐用户上评估联邦模型与纯本地模型的 AUC 差异。
4. 输出相似受众名单并交由平台侧执行投放。
5. 归档 DPA、同意记录与模型评估结果备合规审查。

## 边界与不做

- 何时不用：没有跨方对齐用户、种子集过小（少于 200 人）或平台未提供联邦接口时不要用；数据可合法上传时直接用平台 Lookalike 即可。
- 能力边界：卡页的 12–20% 质量提升与 $5–15 万年化增收为特定基准估计，本卡不承诺同等结果，也不实现真实加密通信（生产需 FATE/PySyft 等框架）。
- 安全边界：涉儿童或健康的敏感数据、GDPR Article 9 场景须先过法务，不得自行开展。

## 技能关联

- **前置**：Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Cross-Platform-User-Transfer.html、Skill-Cross-Platform-User-Transfer、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Privacy-Safe-Identity-Resolution.html、Skill-Privacy-Safe-Identity-Resolution、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation
- **延伸**：Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Cross-Platform-User-Transfer.html、Skill-Cross-Platform-User-Transfer、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation
- **可组合**：Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Privacy-Preserving-Lookalike-FL

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Privacy-Preserving-Lookalike-FL`