---
name: "p2s-multi-source-user-identity-unification"
title: "Multi-Source User Identity Unification — 跨平台用户身份统一打通 Amazon/TikTok/独立站同一用户"
description: "触发词：多源身份统一、三层匹配、ID 图谱、Lookalike、私域打通。何时不用：只有两端且哈希确定性匹配就够时用轻量身份解析；本技能面向三端以上、需要概率与图结构层层补全的场景。安全边界：只处理哈希后的标识，不做明文 PII 关联；图结构相似度属于推断，需保留人工复核通道。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 分群"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Multi-Source-User-Identity-Unification"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Amazon 买家、独立站用户、WhatsApp 私域联系人合成一个用户池，拉新和 Lookalike 不再重复触达。"
user_try: "试试：把三端用户做 L1、L2、L3 三层匹配，告诉我最终能打通多少人。"
whenToUse: "三端以上数据、覆盖率不足且愿意分层上线时用本技能；两端哈希匹配够用时用轻量身份统一技能，只要归因与 LTV 用身份图谱类技能。"
workflow: "L1 用邮箱哈希做确定性对齐 → L2 用购买时间窗口与品类重叠做概率对齐 → L3 用行为图相似度补充长尾 → 合并去重产出统一用户池"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Source User Identity Unification — 跨平台用户身份统一打通 Amazon/TikTok/独立站同一用户

## ① 解决的问题

数据团队面临"Amazon/TikTok/独立站同一用户三套ID无法打通导致Lookalike种子质量差、广告重复触达"——三层匹配架构将跨平台用户识别覆盖率提升至85%+，广告重复触达年化节省约8万元

## ② 核心算法逻辑

母婴跨境卖家面临的核心数据碎片化问题：同一个"张妈妈"在 Amazon 是 buyer_id_A，在 TikTok Shop 是 tiktok_uid_B，在独立站是 email_C，在 WhatsApp 私域是 phone_D——四个 ID 指向同一个人，但系统无法自动打通。用户身份统一（User Identity Unification / Entity Resolution）就是解决这个"一人多面"问题的核心技术，是 CDP、Lo

## ③ 业务应用场景

业务问题：母婴品牌在 Amazon 有 8,000 历史买家，独立站有 3,200 注册用户，WhatsApp 私域有 5,500 联系人。三端各有 RFM 分析，但同一用户在三端的消费行为无法合并——导致：Amazon 高价值用户反复被独立站当"新客"拉新广告触达（浪费预算）；WhatsApp 私域触达后 Amazon 购买的增量贡献无法归因。
匹配方案： 1. L1 确定性：邮箱哈希匹配（Amazon 有购买邮件 → 独立站注册邮箱）→ 对齐约 1,800 人 2. L2 概率性：购买时间窗口（同一自然日在两端有购买）+ 品类重叠（婴儿奶粉 + 纸尿裤）→ 对齐约 900 人 3. L3 GNN：手机号前 3 位区号 + 时区行为 + 客单价分布图结构相似度 → 补充约 400 人
预期产出：三端统一用户池约 3,100 人（原始合并可能有 16,700 行，去重后约 9,600 独立用户），其中跨平台识别出 3,100 人有多端行为记录

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：三端统一后避免广告重复触达节省约 $8 万/年；Lookalike 种子质量提升使 ROAS 提升 10-15%（$20 万预算基准 = 年化增收约 $3-4.5 万）；合计年化收益 $11-12.5 万，实施成本约 5 万，ROI > 120%
实施难度：⭐⭐⭐☆☆（L1+L2 约 2-3 周；L3 GNN 需要额外 4-6 周，可逐步上线）
优先级：⭐⭐⭐⭐⭐（是 CDP、Lookalike、会员体系的前置基础设施，不做此题其他工作效果大打折扣）
评估依据：arXiv:2304.03215 跨设备 GNN 匹配比 baseline 精度高 5%+；DegUIL 在长尾用户（占总用户 70%+）的匹配 Hits@1 提升 8.3%；ComEM 在 8 个 ER 数据集上均优于单一策略

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（257 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Multi-Source User Identity Unification
跨平台用户身份统一——三层匹配架构

依赖：numpy, pandas, hashlib
实现：L1确定性 + L2概率性 + L3行为相似度匹配
"""

import numpy as np
import pandas as pd
import hashlib
from itertools import combinations
from typing import List, Dict, Tuple, Set, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟三平台用户数据
# ─────────────────────────────────────────────

def hash_pii(value: str) -> str:
    """SHA-256 哈希 PII（生产中用 HMAC + salt）"""
    return hashlib.sha256(value.encode()).hexdigest()[:16]


def generate_platform_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """生成 Amazon / 独立站 / WhatsApp 三端模拟数据"""
    np.random.seed(42)

    # 真实用户池（用于生成跨平台重叠）
    n_real_users = 500
    real_emails = [f"user{i}@baby.com" for i in range(n_real_users)]
    real_phones = [f"+1650{i:07d}" for i in range(n_real_users)]

    # Amazon（8000条，其中500真实用户有邮箱）
    amz_records = []
    for i in range(800):  # 缩小为800便于演示
        has_email = i < 500
        email_hash = hash_pii(real_emails[i]) if has_email else f"anon_{i}"
        amz_records.append({
            'amz_buyer_id': f"AMZ{i:05d}",
            'email_hash': email_hash,
            'purchase_days': sorted(np.random.choice(range(180), np.random.randint(1, 8), replace=False).tolist()),
            'avg_order_value': round(np.random.lognormal(4.0, 0.5), 2),
            'categories': list(np.random.choice(['formula', 'diaper', 'stroller', 'toy'], np.random.randint(1, 4), replace=False)),
            'timezone_offset': np.random.choice([-8, -5, 0, 8]),
        })
    amz_df = pd.DataFrame(amz_records)

    # 独立站（320条，其中200有邮箱与Amazon重叠）
    dtc_records = []
    for i in range(320):
        has_overlap = i < 200
        email_hash = hash_pii(real_emails[i]) if has_overlap else f"dtc_anon_{i}"
        dtc_records.append({
            'dtc_user_id': f"DTC{i:04d}",
            'email_hash': email_hash,
            'purchase_days': sorted(np.random.choice(range(180), np.random.randint(1, 5), replace=False).tolist()),
            'avg_order_value': round(np.random.lognormal(4.1, 0.5), 2),
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2308.05322 — DegUIL: Degree-aware Graph Neural Networks for Long-tailed User Identity Linkage
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.286／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各端标识与行为数据（Amazon 购买邮箱、独立站注册邮箱、WhatsApp 联系人、购买时间与品类），标识符先哈希，按用户粒度对齐。

**输出**：去重后的统一用户池与跨平台识别名单（含各层贡献计数），供 CDP、Lookalike 种子与会员体系使用。

## 执行步骤

1. L1 邮箱哈希确定性匹配
2. L2 购买时间窗口与品类重叠匹配
3. L3 行为图结构相似度补充
4. 合并去重得到统一用户池
5. 输出各层贡献与覆盖率

## 边界与不做

- 只有两个数据源、哈希确定性匹配已足够时不用本技能。
- 本技能产出统一用户池与匹配结果，不直接执行投放、拉群或发消息。
- L3 属于相似度推断，需保留人工复核通道；标识符一律先哈希。

## 技能关联

- **前置**：Skill-Cross-Platform-User-Transfer.html、Skill-Cross-Platform-User-Transfer、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Privacy-Safe-Identity-Resolution.html、Skill-Privacy-Safe-Identity-Resolution、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Real-Time-CDP-Feature-Store
- **延伸**：Skill-Cross-Platform-User-Transfer.html、Skill-Cross-Platform-User-Transfer、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Real-Time-CDP-Feature-Store
- **可组合**：Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Multi-Source-User-Identity-Unification

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：14-用户分析　·　源卡：`Skill-Multi-Source-User-Identity-Unification`