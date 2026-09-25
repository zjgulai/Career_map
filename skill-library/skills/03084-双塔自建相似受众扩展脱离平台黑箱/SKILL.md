---
name: "p2s-dual-tower-lookalike-modeling"
title: "Dual-Tower Lookalike Modeling — 双塔自建相似受众扩展脱离平台黑箱"
description: "触发词：双塔模型、自建相似受众、种子分层、受众包上传、LTV 种子、平台黑箱。何时不用：自有用户量与种子不足时双塔学不出稳定表示，先用平台内置相似受众；只评估扩量比例风险时用置信度校准。安全边界：用户行为数据与受众包上传需符合各平台数据政策与隐私法规，种子与受众包不得包含敏感个人信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 分群"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Dual-Tower-Lookalike-Modeling"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用自有数据训练相似受众模型，按高价值种子生成可控受众包，不再依赖平台黑箱。"
user_try: "试试：帮我在自有用户数据上训练双塔模型，生成一批高 LTV 相似受众包去投 Meta。"
whenToUse: "平台内置相似受众触达受限、想把 LTV 分层纳入扩展时用本技能；种子量不足时用平台内置功能；只评估扩展比例收益时用置信度校准。"
workflow: "整理自有行为数据并定义高 LTV 种子集 → 训练双塔模型学习用户与目标行为的相似度 → 对全量访客打分并取高分候选生成受众包 → 上传平台并与内置相似受众做对比测试 → 输出受众包与投放结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dual-Tower Lookalike Modeling — 双塔自建相似受众扩展脱离平台黑箱

## ① 解决的问题

广告投手面临"Meta黑箱Lookalike ROAS卡在2.4x触达瓶颈"——双塔自建相似受众将高LTV种子比例从30%提升至80%，ROAS从2.4x→3.5x，年化增收约132万元

## ② 核心算法逻辑

传统 Lookalike 完全依赖 Meta/TikTok 平台黑箱——广告主上传种子用户，平台返回扩展受众，中间过程不透明、不可调优。双塔 Lookalike 将相似受众建模拆解为自建工程：用双塔神经网络（DualTower / TwoTower）在自有数据上学习用户与目标行为的相似性，生成可控的高质量受众包推送给广告平台。

## ③ 业务应用场景

业务问题：用 Meta 平台内置 Lookalike 1% 受众投放奶粉，ROAS 稳定在 2.4x，感觉触达瓶颈。Meta 内置 Lookalike 对购买 LTV 分层无法控制，高 LTV 用户和低 LTV 用户共用同一个种子池，扩展质量稀释。
数据要求： - 自有用户行为数据：近 180 天独立站访问、加购、购买、复购记录 - 种子集：历史 LTV > $300 的付费用户（约 500-800人） - 用户特征：国家、设备、渠道来源、婴儿年龄段、品类偏好
预期产出： 1. 用双塔模型对全量访客打分，Top 5% 用户作为高质量扩展候选 2. 将候选受众 hash 上传 Meta Custom Audience，替代平台内置 Lookalike 3. A/B 测试：自建 Lookalike vs 平台 Lookalike

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：$10 万/月广告预算下，ROAS 从 2.4x → 3.5x，年化增收约 132 万元；初建工程成本约 20 万元（数据管道 + 模型），12 个月 ROI > 500%
实施难度：⭐⭐⭐☆☆（需要自建数据管道 + 用户特征工程，约 6-8 周）
优先级：⭐⭐⭐⭐⭐（Lookalike 是跨境广告核心投放工具，脱离黑箱即可实现可控扩量）
评估依据：MetaHeac 在微信营销实验中 AUC +3.2%，转化率 +15%；UniMatch 在阿里 QuickAudience 中节省 94% 模型训练成本同时效果持平

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（219 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Dual-Tower Lookalike Modeling
双塔自建相似受众扩展

依赖：numpy, pandas, scikit-learn
场景：用自有用户行为数据训练双塔模型，生成高质量 Lookalike 受众包
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from typing import List, Tuple, Dict
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟母婴电商用户行为数据
# ─────────────────────────────────────────────

def generate_sample_data(n_users: int = 2000, n_seeds: int = 300) -> Tuple[pd.DataFrame, List[str]]:
    """生成示例数据：用户行为特征 + 种子用户列表"""
    np.random.seed(42)
    user_ids = [f"U{i:04d}" for i in range(n_users)]
    
    data = pd.DataFrame({
        'user_id': user_ids,
        # 行为特征
        'page_views_30d': np.random.poisson(15, n_users),
        'add_to_cart_30d': np.random.poisson(3, n_users),
        'purchases_90d': np.random.poisson(1.2, n_users),
        'avg_order_value': np.random.lognormal(4.0, 0.6, n_users),  # ~$55 均值
        'days_since_last_visit': np.random.exponential(20, n_users),
        # 人口/设备特征
        'country_code': np.random.choice([0, 1, 2, 3], n_users, p=[0.5, 0.25, 0.15, 0.10]),
        'device_type': np.random.choice([0, 1, 2], n_users, p=[0.55, 0.35, 0.10]),
        'traffic_source': np.random.choice([0, 1, 2, 3, 4], n_users),
        # 母婴特征
        'baby_age_months': np.random.choice([-1, 0, 6, 12, 18, 24], n_users,
                                             p=[0.2, 0.15, 0.2, 0.2, 0.15, 0.1]),
        'category_affinity': np.random.choice([0, 1, 2, 3], n_users),  # 奶粉/推车/玩具/服装
        # LTV（用于标记高价值种子）
        'ltv_90d': np.random.lognormal(3.5, 1.0, n_users),
    })
    
    # 种子用户：LTV 前 15% 的用户
    ltv_threshold = np.percentile(data['ltv_90d'], 85)
    seed_ids = data[data['ltv_90d'] >= ltv_threshold]['user_id'].tolist()[:n_seeds]
    return data, seed_ids


# ─────────────────────────────────────────────
# 2. 特征工程
# ─────────────────────────────────────────────

def build_user_features(df: pd.DataFrame) -> np.ndarray:
    """构建用户特征矩阵"""
    feature_cols = [
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2105.14688 — Learning to Expand Audience via Meta Hybrid Experts and Critics for Recommendation and Advertising
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：自有用户行为数据（近半年访问、加购、购买、复购）、高 LTV 付费种子集、用户特征（国家、设备、渠道来源、婴儿年龄段、品类偏好）；需覆盖足够访客规模以免打分失真。

**输出**：双塔模型与用户相似度打分、按分位筛选的高质量受众候选、可上传平台的受众包，以及与平台内置方案的对比测试结论；供投放团队替换或补充平台受众。

## 执行步骤

1. 整理自有行为数据并定义高 LTV 种子集
2. 训练双塔模型学习用户与目标行为的相似度
3. 对全量访客打分并取高分候选生成受众包
4. 上传平台并与内置相似受众做对比测试
5. 输出受众包与投放结论

## 边界与不做

- 何时不用：自有用户量与高价值种子太少时双塔学不出稳定表示，先用平台内置相似受众并积累数据。
- 能力边界：本技能产出模型与受众包，不负责平台投放执行与预算分配。
- 合规边界：用户行为数据与受众包上传需符合平台数据政策与隐私法规，不得包含敏感个人信息。

## 技能关联

- **前置**：Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Privacy-Preserving-Lookalike-FL.html、Skill-Privacy-Preserving-Lookalike-FL、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Privacy-Preserving-Lookalike-FL.html、Skill-Privacy-Preserving-Lookalike-FL、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **可组合**：Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN、Skill-Dual-Tower-Lookalike-Modeling

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Dual-Tower-Lookalike-Modeling`