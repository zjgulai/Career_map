---
name: "p2s-tag-driven-ad-audience-segmentation"
title: "Tag-Driven Ad Audience Segmentation — 标签工程驱动广告受众精准分割"
description: "触发词：标签受众、受众包、人群分割、冷启动定向、交叉销售、Lookalike 替代。何时不用：种子集脏导致效果差用种子净化那张卡；要用 SKU 属性标签与行为标签重新组合受众包时用本卡。安全边界：须去除 PII 与健康、怀孕等敏感属性，Amazon DSP 禁止以健康或孕期状态定向，受众包需设最小规模阈值。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 分群"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Tag-Driven-Ad-Audience-Segmentation"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把商品属性标签和用户行为标签拼成可投放的受众包，新品冷启动也能一击命中对的人群。"
user_try: "试试：这是我的 SKU 属性标签和站内行为标签，帮我组合出适合新品吸奶器冷启动的受众包并给出定向建议。"
whenToUse: "与「RFM 分群自动调度」相比：分群后要自动触发营销序列用那张卡；要基于标签组合生成广告平台可用的受众包时用本卡。"
workflow: "整理 SKU 属性标签（品类/适龄段/价格段）与站内行为标签 → 按业务场景做标签交叉组合生成候选受众包 → 校验受众包规模与敏感属性合规性（如替换健康、孕期标签） → 将受众包映射到广告平台并按 CTR 与 ROAS 跟踪优化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Driven Ad Audience Segmentation — 标签工程驱动广告受众精准分割

## ① 解决的问题

广告投手面临"SKU属性标签和广告受众定向完全割裂无法联动"——标签体系自动映射DSP受众包将受众精准度提升68%，广告ROAS年化提升53万元

## ② 核心算法逻辑

本 Skill 将 SKU 维度的多层标签体系（人群标签 / 场景标签 / 生命周期标签）映射为广告平台可消费的受众定向条件，实现「标签即受众」的自动化广告投放。

## ③ 业务应用场景

场景A：新品吸奶器冷启动广告定向 - 业务问题：新品上线无历史购买数据，传统 Lookalike 受众质量差，CPC 浪费 30-50% - 数据要求：SKU 属性标签（产品类别/适龄段/价格段）+ 站内行为标签（同品类浏览/收藏） - 预期产出：基于「备孕/哺乳期 + 首次母婴购买 + 中高消费力」三标签组合受众包，CTR 提升 25-40% - 业务价值：CPC 从 $2.8 降至 $1.9，首月 ROAS 从 2.1 提升至 3.4，广告浪费减少约 18 万元/年
三轨验证： - 成本：数据采集需接入站内埋点（约 5 人天开发），标签计算需 1 台 8C16G 服务器（月成本约 ¥3,000），人力投入含 1 名数据工程师 + 0.5 名广告运营（月成本约 ¥25,000）。 - 合规：需确保用户行为数据脱敏（去除 PII），符合 GDPR 第 6 条合法利益基础；Amazon DSP 禁止使用健康/怀孕状态作为定向条件，需将「哺乳期」标签替换为「婴儿用品浏览行为」。 - 风险：受众包过小（<1000 人）导致广告无法投放，需设置最小规模阈值；新品冷启动阶段可能因标签不准确导致高曝光低点击，需设置 A/B 测试对照组。
场景B：爆款婴儿推车老客复购激活 - 业务问题：购买过 A 品类的用户对关联 B 品类购买率仅 8%，渗透率极低 - 数据要求：用户购买历史标签 + 当前生命周期标签（是否在育儿期 12-36 个月） - 预期产出：「已购婴儿床 + 育儿12-24月 + 未购推车」交叉受众包，Re-targeting ROAS 提升至 4.2 - 业务价值：关联品类交叉销售 GMV 提升约 22%，年化增收 35 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：广告 CPC 降低 30%（$2.8→$1.9），ROAS 提升 60%（2.1→3.4），年化节省广告浪费约 18 万元；关联品类交叉销售 GMV 提升 22%，年化增收 35 万元，合计年化价值约 53 万元
实施难度：⭐⭐⭐☆☆（需要标签体系已建立，广告平台 API 接入）
优先级：⭐⭐⭐⭐☆（广告预算大的 SKU 优先，ROI 回收周期 1-2 个月）
数据门槛：需要 ≥3 个月用户行为数据，SKU 属性完整度 ≥90%
风险：标签覆盖率不足时受众包过小（<1000人），需要扩展标签维度或放宽条件

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（215 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_driven_ad_audience_segmentation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Driven-Ad-Audience-Segmentation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Driven Ad Audience Segmentation
标签工程驱动广告受众精准分割

依赖：numpy, pandas, scikit-learn
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier
from typing import Dict, List, Tuple
import json


# ─── 1. 模拟数据生成 ───────────────────────────────────────────────────────────

def generate_mock_data(n_users: int = 500, n_skus: int = 50, seed: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """生成模拟用户行为和 SKU 属性数据"""
    rng = np.random.default_rng(seed)

    sku_df = pd.DataFrame({
        "sku_id": [f"SKU{i:03d}" for i in range(n_skus)],
        "category": rng.choice(["吸奶器", "婴儿推车", "婴儿床", "辅食工具", "安抚玩具"], n_skus),
        "age_min": rng.choice([0, 3, 6, 12, 24], n_skus),
        "age_max": rng.choice([12, 24, 36, 60, 84], n_skus),
        "price_tier": rng.choice(["低价", "中价", "高价"], n_skus),
    })

    user_df = pd.DataFrame({
        "user_id": [f"U{i:05d}" for i in range(n_users)],
        "baby_age_month": rng.integers(0, 60, n_users),
        "purchase_count": rng.integers(0, 20, n_users),
        "browse_count": rng.integers(1, 100, n_users),
        "is_new_customer": rng.choice([0, 1], n_users, p=[0.6, 0.4]),
        "spend_level": rng.choice(["低", "中", "高"], n_users),
        "last_purchase_category": rng.choice(["吸奶器", "婴儿推车", "婴儿床", "辅食工具", "安抚玩具", "无"], n_users),
    })

    return user_df, sku_df


# ─── 2. 规则层标签生成 ──────────────────────────────────────────────────────────

def apply_rule_tags(user_df: pd.DataFrame) -> pd.DataFrame:
    """规则层：强约束标签（确定性赋值）"""
    df = user_df.copy()

    # 生命周期标签
    df["lifecycle_tag"] = "其他"
    df.loc[df["is_new_customer"] == 1, "lifecycle_tag"] = "新客"
    df.loc[(df["is_new_customer"] == 0) & (df["purchase_count"] >= 3), "lifecycle_tag"] = "活跃客"
    df.loc[(df["is_new_customer"] == 0) & (df["purchase_count"] < 3) & (df["purchase_count"] > 0), "lifecycle_tag"] = "沉睡客"

    # 场景标签（基于宝宝年龄）
    df["scene_tag"] = "其他"
    df.loc[df["baby_age_month"] == 0, "scene_tag"] = "备孕准备"
    df.loc[(df["baby_age_month"] > 0) & (df["baby_age_month"] <= 12), "scene_tag"] = "哺乳期"
    df.loc[(df["baby_age_month"] > 12) & (df["baby_age_month"] <= 36), "scene_tag"] = "幼儿期"
    df.loc[df["baby_age_month"] > 36, "scene_tag"] = "学前期"
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.08841，但该号在 arXiv 上是《Roadmap on Nanoscale Magnetic Resonance Imaging》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 属性标签（产品类别、适龄段、价格段）与站内行为标签（同品类浏览、收藏、购买历史、生命周期标记）；卡页要求至少 3 个月用户行为数据、SKU 属性完整度 90% 以上。

**输出**：分场景的标签组合受众包（卡页如备孕/哺乳期+首次母婴购买+中高消费力）、各包规模与预期 CTR 提升，以及映射到广告平台的定向配置建议。

## 执行步骤

1. 梳理并校验 SKU 属性标签与站内行为标签的覆盖率。
2. 交叉标签生成候选受众包，并设最小规模阈值。
3. 替换健康、孕期等敏感标签，确保平台定向合规。
4. 映射受众包到广告平台并设计 A/B 对照组。
5. 复盘 CTR、CPC、ROAS 并迭代标签组合。

## 边界与不做

- 何时不用：标签体系尚未建立、属性完整度过低，或行为数据不足 3 个月时不要用；种子集质量问题的根因在净化而非组合。
- 能力边界：产出受众包定义与配置建议，不代投；CPC $2.8→$1.9、ROAS 2.1→3.4 等为卡页案例值。
- 安全边界：严禁使用健康、孕期等敏感属性定向，受众包过小（少于 1000 人）需放宽条件。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Tag-Driven-VOC-Signal-Routing.html、Skill-Tag-Driven-VOC-Signal-Routing、Skill-Tag-Informed-Dynamic-Pricing.html、Skill-Tag-Informed-Dynamic-Pricing、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Tag-Driven-VOC-Signal-Routing.html、Skill-Tag-Driven-VOC-Signal-Routing、Skill-Tag-Informed-Dynamic-Pricing.html、Skill-Tag-Informed-Dynamic-Pricing、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Tag-Driven-VOC-Signal-Routing.html、Skill-Tag-Driven-VOC-Signal-Routing、Skill-Tag-Informed-Dynamic-Pricing.html、Skill-Tag-Informed-Dynamic-Pricing、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Driven-Ad-Audience-Segmentation

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Driven-Ad-Audience-Segmentation`