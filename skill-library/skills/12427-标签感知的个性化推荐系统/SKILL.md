---
name: "p2s-tag-enhanced-personalized-recommendation"
title: "Tag-Enhanced Personalized Recommendation — 标签感知的个性化推荐系统"
description: "触发词：标签推荐、适龄约束、标签过滤、混合推荐、新品冷启动。何时不用：要用图像与文本多模态融合推荐用「多模态产品推荐」；要按知识图谱属性做跨品类推荐用「知识图谱增强推荐 CoLaKG」。安全边界：标签不得用于基于儿童年龄的广告定向，只能用于商品匹配；宝宝月龄等标签采集须明确告知并取得同意，标签置信度不足时不得作为强约束。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Tag-Enhanced-Personalized-Recommendation"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "给商品和用户都打上适龄标签：哺乳期用户推哺乳周边，不把学步车推给新生儿家庭。"
user_try: "试试：用宝宝月龄和商品适龄标签做约束过滤，给已购吸奶器的用户推荐哺乳相关商品。"
whenToUse: "当需要靠标签约束保证适龄与相关性、同时用协同过滤补充兴趣时用本技能；要图文多模态融合用「多模态产品推荐」；要按知识图谱属性跨品类推荐用「知识图谱增强推荐 CoLaKG」。"
workflow: "采集用户标签（宝宝月龄）与商品属性标签（适龄、认证、价格段） → 检查标签完整度是否达到门槛 → 用标签约束过滤召回候选 → 用协同过滤对过滤结果排序 → 监控标签质量与推荐 CTR、客诉率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Enhanced Personalized Recommendation — 标签感知的个性化推荐系统

## ① 解决的问题

推荐算法工程师面临"推荐系统不知道商品的品类合规约束导致不适龄产品被推给错误用户"——标签约束过滤+协同过滤Hybrid将推荐精准度提升41%，客诉率降低35%，年化价值50万元

## ② 核心算法逻辑

本 Skill 将用户标签（消费习惯/宝宝年龄段/品类偏好）和商品标签（品类/适龄/安全认证）注入推荐系统，构建「标签感知的 Hybrid 个性化推荐」，同时用合规标签作为硬约束过滤不适龄产品。

## ③ 业务应用场景

场景A：吸奶器用户关联推荐哺乳周边 - 业务问题：购买吸奶器的用户关联品购买率仅 7%，推荐系统不考虑哺乳期标签导致推荐不相关 - 数据要求：用户宝宝月龄标签 + 商品适龄标签 + 用户购买历史（≥3条） - 预期产出：基于「哺乳期0-6月 + 已购吸奶器 + 哺乳相关」标签约束推荐哺乳枕/储奶袋，CTR 提升 45% - 业务价值：关联推荐 GMV 占比从 5% 提升至 11%，年化增收约 32 万元
三轨验证： - 成本：需额外采集用户宝宝月龄标签（埋点+问卷，约 2 人周开发）；标签存储与计算（每日增量更新，云资源成本约 800 元/月）；人力投入（算法工程师 1 人月，约 2.5 万元） - 合规：Amazon 政策禁止基于儿童年龄的定向广告（需确保推荐标签仅用于商品匹配，不用于广告投放）；GDPR 要求用户标签采集需明确告知并获取同意（需在隐私政策中声明「宝宝月龄」标签用途） - 风险：若标签数据不准确（如用户虚报宝宝月龄），推荐相关性下降导致 CTR 反降；过度依赖标签可能忽略用户真实兴趣漂移，需设置标签置信度阈值
场景B：新商品冷启动（纯标签推荐） - 业务问题：新上线婴儿安全座椅无购买数据，CF 无法生效，推荐曝光量极低 - 数据要求：商品属性标签（适龄/安全认证/价格段/品类）完整度 ≥90% - 预期产出：通过标签相似度匹配历史购买「婴儿推车+幼儿期」用户，冷启动首周销量提升 3.2 倍 - 业务价值：新品冷启动期缩短从 4 周至 10 天，年化新品首月 GMV 提升约 18 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：关联推荐 GMV 占比从 5%→11%，年化增收约 32 万元；冷启动期从 4 周缩短至 10 天，年化新品首月 GMV 提升约 18 万元，合计年化价值约 50 万元
实施难度：⭐⭐⭐☆☆（需商品标签完整度 ≥90%，用户行为数据 ≥3个月）
优先级：⭐⭐⭐⭐☆（推荐系统改进回报快，品类扩展期 ROI 最高）
数据门槛：商品标签覆盖率 ≥90%，每用户平均 ≥3 条购买记录
风险：标签质量差时 Hybrid 退化为纯标签推荐，定期执行 Tag Quality KPI 监控

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（273 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 50 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_enhanced_personalized_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Enhanced-Personalized-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Enhanced Personalized Recommendation
标签感知的 Hybrid 个性化推荐系统

依赖：numpy, pandas, scikit-learn
"""
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MultiLabelBinarizer
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings("ignore")


# ─── 1. 模拟数据 ──────────────────────────────────────────────────────────────

def generate_mock_catalog(n_items: int = 100, seed: int = 42) -> pd.DataFrame:
    """生成商品标签目录"""
    rng = np.random.default_rng(seed)
    categories = ["吸奶器", "哺乳枕", "储奶袋", "婴儿推车", "安全座椅", "婴儿床", "辅食机", "安抚玩具"]
    age_ranges = ["0-6月", "0-12月", "6-18月", "12-36月", "24-60月"]
    certs = ["CE", "FDA", "EN71", "ASTM"]
    price_tiers = ["低价", "中价", "高价"]

    items = []
    for i in range(n_items):
        cat = rng.choice(categories)
        items.append({
            "item_id": f"ITEM{i:03d}",
            "category_tag": cat,
            "age_range_tag": rng.choice(age_ranges),
            "cert_tags": list(rng.choice(certs, size=rng.integers(1, 3), replace=False)),
            "price_tag": rng.choice(price_tiers),
            "allergy_warning": rng.choice([None, "乳胶", "化学涂料"], p=[0.7, 0.15, 0.15]),
        })
    return pd.DataFrame(items)


def generate_mock_users(n_users: int = 80, seed: int = 42) -> pd.DataFrame:
    """生成用户标签档案"""
    rng = np.random.default_rng(seed)
    age_groups = ["备孕", "0-6月", "6-12月", "12-24月", "24-36月", "36-60月"]
    spend_levels = ["低消费", "中消费", "高消费"]
    country_certs = {"US": ["FDA", "ASTM"], "EU": ["CE", "EN71"], "JP": ["PSC"]}

    users = []
    for i in range(n_users):
        country = rng.choice(["US", "EU", "JP"])
        users.append({
            "user_id": f"U{i:04d}",
            "baby_age_tag": rng.choice(age_groups),
            "spend_tag": rng.choice(spend_levels),
            "country": country,
            "required_certs": country_certs[country],
            "allergy_tags": list(rng.choice(["乳胶", "化学涂料", "无"], size=1, p=[0.1, 0.1, 0.8])),
            "purchased_categories": list(rng.choice(
                ["吸奶器", "婴儿推车", "婴儿床", "辅食机"],
                size=rng.integers(0, 4), replace=False
            )),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.15462，但该号在 arXiv 上是《Double duals and Hilbert modules》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户标签（宝宝月龄等）、商品属性标签（适龄、安全认证、价格段、品类，卡页要求完整度 90% 以上）、用户购买历史（卡页要求人均 3 条以上）；粒度为单用户 × 商品。

**输出**：经标签约束过滤并排序的推荐列表（含适龄匹配依据）与标签质量监控指标；供推荐工程与运营在关联推荐与新品冷启动中使用。

## 执行步骤

1. 采集用户月龄标签与商品适龄、认证、价格段标签
2. 校验标签完整度是否达到所需门槛
3. 用标签约束过滤出合规候选
4. 用协同过滤对候选排序并输出推荐
5. 定期做标签质量监控与推荐效果复盘

## 边界与不做

- 数据不满足：商品标签完整度或用户行为记录达不到卡页门槛时混合推荐会退化为纯标签匹配，先补标签。
- 何时不用：要图文多模态融合用「多模态产品推荐」；要按知识图谱属性跨品类推荐用「知识图谱增强推荐 CoLaKG」。
- 能力边界：只做标签约束与混合排序，不负责标签生产流程，也不保证卡页口径的提升幅度。
- 安全边界：标签不得用于基于儿童年龄的广告定向，只能用于商品匹配；采集须告知并取得同意，置信度不足时不得作为强约束。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-SKU-Entity-Unified-ID-Tagging.html、Skill-SKU-Entity-Unified-ID-Tagging、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-Driven-User-Behavior-Analytics.html、Skill-Tag-Driven-User-Behavior-Analytics、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Enhanced-Personalized-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Enhanced-Personalized-Recommendation`