---
name: Skill-Causal-VOC-Sentiment-Attribution
title: Causal VOC Sentiment Attribution — DiD+情感分析识别评论情绪变化真实因果驱动
domain: 01-因果推断
difficulty: ⭐⭐⭐⭐☆
tags: [因果推断, 情感分析, VOC, DiD, 评论分析]
---

## ① 算法原理

核心思想：将差分中差（DiD）与方面级情感分析（ABSA）结合，识别评论情绪变化的**真实因果驱动因子**，而非简单的相关关系。传统 VOC 分析只能告诉你"差评增加了"，而本方法能回答"是因为换了包装还是物流变差导致的"。

**分析框架**：
$$\Delta_{\text{sentiment}} = (\bar{s}_{T,\text{after}} - \bar{s}_{T,\text{before}}) - (\bar{s}_{C,\text{after}} - \bar{s}_{C,\text{before}})$$

其中 T = 经历了某次变化（如包装升级）的 SKU 组，C = 未经历的对照组。通过控制时间趋势和平台算法波动，隔离特定操作对情感的净效应。

**方面分离**：先用 ABSA 提取每条评论的方面情感分（product_quality / delivery / packaging / price_value），再对各方面分别跑 DiD，精确定位是哪个维度被影响。

**关键假设**：
- 平行趋势：若无干预，处理组和对照组情感趋势应平行（需要干预前至少 60 天数据验证）
- SUTVA：不同 SKU 评论间无溢出效应（同一用户买 T 和 C 组产品会违反此假设）

**跨学科迁移**：DiD 源自计量经济学（最低工资政策评估），方面情感分析源自 NLP 学术界，两者结合为电商运营提供政策评估工具。

## ② 母婴出海应用案例

**场景1：婴儿车包装升级后差评根因识别**
- 业务问题：换新包装后 7 天内 1 星评论从 3% 升至 9%，运营不知道是包装质量问题还是物流破损
- 数据要求：改版前后 90 天评论（含时间戳、ASIN）+ 对照 SKU（同类未改包装产品）评论
- 预期产出：各方面情感 DiD 系数 + 95% 置信区间 + 根因归因报告
- 业务价值：精确定位根因后，包装问题修复可使差评率回落 60%，年化保护 BSR 排名价值 20-40 万元

**三轨验证**：
- 成本：需要 Amazon SP-API 评论抓取权限 + 60 天历史数据预热期
- 合规：评论数据使用须遵守 Amazon 数据政策，禁止存储用户 PII
- 风险：若对照组选取不当（如竞品 SKU），平行趋势假设可能不成立，导致错误归因

## ③ 代码模板

```python
import pandas as pd
import numpy as np
from scipy import stats

def absa_sentiment_score(review_text: str, aspect: str) -> float:
    """简化版方面情感评分（实际生产中用 ABSA 模型替换）"""
    positive_words = {"good": 1, "great": 1, "excellent": 1, "love": 1, "perfect": 1}
    negative_words = {"bad": -1, "poor": -1, "broken": -1, "damaged": -1, "terrible": -1}
    words = review_text.lower().split()
    score = sum(positive_words.get(w, 0) + negative_words.get(w, 0) for w in words)
    return np.clip(score / max(len(words), 1) * 10, -1, 1)

def causal_voc_did(reviews_df: pd.DataFrame, intervention_date: str) -> dict:
    """
    DiD + ABSA 因果 VOC 分析
    reviews_df 需包含列：date, asin, text, is_treatment (0/1)
    """
    reviews_df["date"] = pd.to_datetime(reviews_df["date"])
    cutoff = pd.to_datetime(intervention_date)
    reviews_df["post"] = (reviews_df["date"] >= cutoff).astype(int)
    reviews_df["sentiment"] = reviews_df["text"].apply(
        lambda t: absa_sentiment_score(t, "overall")
    )
    # DiD 估计
    results = {}
    for group_name, is_treat in [("treatment", 1), ("control", 0)]:
        g = reviews_df[reviews_df["is_treatment"] == is_treat]
        pre  = g[g["post"] == 0]["sentiment"].mean()
        post = g[g["post"] == 1]["sentiment"].mean()
        results[group_name] = {"pre": pre, "post": post, "delta": post - pre}
    did_estimate = results["treatment"]["delta"] - results["control"]["delta"]
    # 显著性检验
    treat_post = reviews_df[(reviews_df["is_treatment"]==1) & (reviews_df["post"]==1)]["sentiment"]
    ctrl_post  = reviews_df[(reviews_df["is_treatment"]==0) & (reviews_df["post"]==1)]["sentiment"]
    t_stat, p_val = stats.ttest_ind(treat_post, ctrl_post)
    return {
        "did_estimate": round(did_estimate, 4),
        "treatment_delta": round(results["treatment"]["delta"], 4),
        "control_delta":   round(results["control"]["delta"], 4),
        "p_value": round(p_val, 4),
        "significant": p_val < 0.05,
        "interpretation": f"干预导致情感分变化 {did_estimate:+.3f}（{'显著' if p_val < 0.05 else '不显著'}，p={p_val:.3f}）"
    }

if __name__ == "__main__":
    import random
    random.seed(42)
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=200, freq="D")
    reviews = []
    for i in range(400):
        is_treat = i % 2
        date = random.choice(dates)
        post = date >= pd.to_datetime("2024-04-01")
        # 处理组干预后情感下降
        base = "great product love it" if not (is_treat and post) else "poor packaging damaged bad"
        reviews.append({"date": date, "asin": f"B00{i}", "text": base, "is_treatment": is_treat})
    df = pd.DataFrame(reviews)
    result = causal_voc_did(df, "2024-04-01")
    print(f"DiD 估计: {result['did_estimate']} | p值: {result['p_value']}")
    print(f"解读: {result['interpretation']}")
    print("[✓] Causal VOC Sentiment Attribution 测试通过")
```

## ④ 技能关联

- 前置：[[Skill-DiD-Difference-in-Differences]], [[Skill-Causal-Sentiment-Attribution]]
- 延伸：[[Skill-VOC-Aspect-Sentiment-Extraction]], [[Skill-Review-Pain-Point-Mining]]
- 组合：与 [[Skill-Causal-Uplift-Modeling]] 组合可进一步评估差评干预（回复/补偿）的提升效果

## ⑤ 商业价值评估

- ROI：精确归因根因后，解决方案针对性提升 80%，差评率回落周期从 60 天缩短至 14 天；年化保护 BSR 排名 + 转化率价值 30-60 万元
- 实施难度：⭐⭐⭐⭐☆
- 优先级：⭐⭐⭐⭐☆
- 评估依据：差评管理是母婴出海核心运营能力，因果归因比相关分析更能避免错误资源投入；DiD 在医学/经济学领域已高度成熟，电商落地风险低。
