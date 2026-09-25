---
name: "p2s-cleanroom-audience-collaboration"
title: "Cleanroom Audience Collaboration — 数据洁净室跨品牌受众协作无需共享原始数据"
description: "触发词：数据洁净室、受众重叠分析、跨品牌协作、哈希匹配、隐私联合查询。何时不用：跨机构联合训练模型时用「联邦学习隐私保护」；做端侧加噪的个性化推荐时用「差分隐私推荐系统」。安全边界：只做去标识化联合统计，禁止交换或导出原始用户名单；须有双方数据处理协议与合法授权基础。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-133"
l3_business: "隐私需求分析"
l3_all: "隐私需求分析 / 授权审查"
l1_l2_l3: "独立控制/财务与合规/隐私需求分析"
p2s_card_id: "Skill-Cleanroom-Audience-Collaboration"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "和内容平台一起看人群重叠、判断投放值不值，但双方的用户明细谁都不出库。"
user_try: "试试：模拟一次品牌与内容平台的洁净室联合查询，给出重叠率和重叠人群的 LTV 差异结论。"
whenToUse: "需要与外部平台做受众重叠或人群质量联合分析、又不能共享原始数据时用；跨机构联合训练模型用联邦学习类技能；端侧加噪做个性化用差分隐私推荐类技能。"
workflow: "双方做标识哈希与分段 → 洁净室内执行联合查询 → 汇总重叠率与分层差异 → 输出投放可行性与预算建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cleanroom Audience Collaboration — 数据洁净室跨品牌受众协作无需共享原始数据

## ① 解决的问题

数字营销团队面临"想与内容平台共分析受众但GDPR禁止共享用户数据、媒体规划无法做受众重叠验证"——数据洁净室K匿名性+差分隐私联合分析在数据不出本地前提下完成受众重叠分析，规避最高4%全球营收的合规罚款风险

## ② 核心算法逻辑

数据洁净室（Data Clean Room, DCR） 是解决"数据协作 vs 隐私保护"矛盾的核心技术：两家公司（如母婴品牌 × 育儿内容平台）想要共同分析彼此的用户数据，但任何一方都不能看到对方的原始用户记录。

## ③ 业务应用场景

业务问题：母婴奶粉品牌（5,000 历史买家）想与"宝宝树"类育儿内容平台合作，了解：①有多少重叠用户（已经在平台上）；②重叠用户和非重叠用户的 LTV 差异；③是否值得在该平台投放广告。
洁净室方案（AWS Clean Rooms）： 1. 品牌上传：哈希邮箱 + 购买金额分段（High/Mid/Low，不上传具体金额） 2. 平台上传：哈希邮箱 + 活跃度分段（DAU/WAU/MAU） 3. 洁净室联合查询： 4. 输出：分组重叠数（不含具体用户名单）
预期产出： - 重叠率：品牌买家中 38% 活跃于该平台 - 高 LTV 用户（Top 20%）中 52% 活跃于平台（相关性强） - 建议：值得在该平台投放，预期 ROAS > 3x（基于重叠人群质量）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：媒体规划决策准确率提升（避免高估重叠率导致的低效媒体投资），年化节省约 $10-20 万广告浪费；合规风险规避（GDPR 违规最高罚款 4% 全球营收），对 $5M 年营收的品牌意味着最高 $20 万风险敞口
实施难度：⭐⭐⭐☆☆（AWS Clean Rooms 几分钟创建，数据上传和查询约 2-3 周工程化；自建需 6-8 周）
优先级：⭐⭐⭐⭐☆（Cookie 消亡后媒体协作的核心基础设施，尤其欧盟市场从 2024 年起监管力度持续加强）
评估依据：AdsBPC 在真实广告数据集上比传统 DP 机制准确率提升 33-95%；AWS Clean Rooms 已有 Adidas、Volkswagen 等头部品牌生产部署；媒体重叠分析是 AWS 客户调研中排名第一的数据协作用例

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（223 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Cleanroom Audience Collaboration
数据洁净室受众协作模拟——隐私安全联合分析

依赖：numpy, pandas
模拟：本地洁净室查询引擎（生产环境用 AWS/Google Clean Rooms）
"""

import numpy as np
import pandas as pd
import hashlib
from typing import Dict, Tuple, Optional, List
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟双方数据（各自持有，不互相可见）
# ─────────────────────────────────────────────

def generate_brand_data(n_users: int = 5000) -> pd.DataFrame:
    """品牌侧数据：历史购买用户（含哈希邮箱）"""
    np.random.seed(42)
    emails = [f"user{i}@example.com" for i in range(n_users)]
    email_hashes = [hashlib.sha256(e.encode()).hexdigest()[:16] for e in emails]
    ltv = np.random.lognormal(5.0, 0.7, n_users)
    ltv_segment = pd.qcut(ltv, q=3, labels=['Low', 'Mid', 'High'])
    return pd.DataFrame({
        'email_hash': email_hashes,
        'ltv_segment': ltv_segment,
        'ltv_actual': ltv.round(2),  # 品牌侧保留，不上传
        'purchase_count': np.random.poisson(2.5, n_users).clip(1, 20),
    })


def generate_platform_data(brand_df: pd.DataFrame,
                            overlap_rate: float = 0.40) -> pd.DataFrame:
    """平台侧数据：活跃用户（部分与品牌重叠）"""
    np.random.seed(123)
    n_brand = len(brand_df)

    # 重叠用户（使用品牌侧的哈希邮箱）
    n_overlap = int(n_brand * overlap_rate)
    overlap_hashes = brand_df['email_hash'].iloc[:n_overlap].tolist()

    # 平台独有用户
    n_platform_only = int(n_brand * 0.8)
    platform_only_hashes = [hashlib.sha256(f"platform{i}@domain.com".encode()).hexdigest()[:16]
                             for i in range(n_platform_only)]

    all_hashes = overlap_hashes + platform_only_hashes
    n_total = len(all_hashes)

    activity = np.random.choice(['DAU', 'WAU', 'MAU'],
                                 n_total, p=[0.3, 0.45, 0.25])
    # 重叠用户倾向更活跃（更高价值）
    for i in range(n_overlap):
        if np.random.random() < 0.5:
            activity[i] = 'DAU'
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.02463，但该号在 arXiv 上是《Click Without Compromise: Online Advertising Measurement via Per User Differential Privacy》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：双方各自的用户标识（哈希邮箱等不可逆标识）与分段字段（如购买金额分段、活跃度分段），以及联合查询口径；粒度：用户级，但仅上传哈希与分段，不上传明细值。

**输出**：分组重叠数量与重叠率、重叠人群的分层质量差异（如高价值用户重叠比例）与投放建议，供媒体规划决策使用。

## 执行步骤

1. 双方各自对用户标识做哈希与分段处理
2. 在洁净室内执行联合查询与交叉统计
3. 汇总重叠率与分层重叠结果
4. 比较重叠与非重叠人群的价值差异
5. 输出投放可行性结论与预算建议

## 边界与不做

- 数据不满足时不用：双方标识无法稳定对齐（哈希口径不一致）或样本量过小时，重叠率不可用。
- 能力边界：只做联合统计与结论建议，不导出用户名单、不代投放；数据协作协议与授权基础须法务确认。

## 技能关联

- **前置**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Counterfactual-Ad-Attribution-Debiasing.html、Skill-Counterfactual-Ad-Attribution-Debiasing、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Multi-Source-User-Identity-Unification.html、Skill-Multi-Source-User-Identity-Unification、Skill-Privacy-Preserving-Lookalike-FL.html、Skill-Privacy-Preserving-Lookalike-FL、Skill-Privacy-Safe-Identity-Resolution.html、Skill-Privacy-Safe-Identity-Resolution
- **延伸**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Counterfactual-Ad-Attribution-Debiasing.html、Skill-Counterfactual-Ad-Attribution-Debiasing、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Multi-Source-User-Identity-Unification.html、Skill-Multi-Source-User-Identity-Unification
- **可组合**：Skill-Counterfactual-Ad-Attribution-Debiasing.html、Skill-Counterfactual-Ad-Attribution-Debiasing、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Cleanroom-Audience-Collaboration

---

> 分类：独立控制/财务与合规/隐私需求分析　·　技术族：22-数据采集工程　·　源卡：`Skill-Cleanroom-Audience-Collaboration`