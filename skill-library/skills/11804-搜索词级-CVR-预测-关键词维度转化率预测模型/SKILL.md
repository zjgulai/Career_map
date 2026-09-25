---
name: "p2s-search-conversion-rate-predictor"
title: "搜索词级 CVR 预测 — 关键词维度转化率预测模型"
description: "触发词：CVR预测、关键词优先级、冷启动评分、出价优先级矩阵、转化率特征。何时不用：关键词级历史不足90天时不适用；按转化率偏差做单次检验调价走关键词出价自动调整器。安全边界：特征不得包含PII与种族健康等敏感属性，预测仅用于排序不直接改出价，须配合出价上限。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Search-Conversion-Rate-Predictor"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "用关键词文本与历史表现预测未来 7 天转化率，给有限预算排出该优先投哪些词。"
user_try: "试试：账户有500多个关键词、预算有限，帮我预测每个词未来7天CVR并给出出价优先级。"
whenToUse: "当关键词数量多、预算有限、需要按预测转化率排优先级时用本卡；没有历史的新长尾词需要冷启动评分时也用本卡；需要按规则条件自动改价用 PPC 规则自动化引擎。"
workflow: "拉取 90 天以上关键词级广告数据与文本特征 → 提取购买意图、信息意图与品类词等特征 → 训练回归模型预测未来 7 天 CVR → 批量预测并输出置信区间与出价优先级矩阵 → 对新长尾词给出冷启动评分与测试出价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索词级 CVR 预测 — 关键词维度转化率预测模型

## ① 解决的问题

广告运营面临"500+关键词预算分配全靠经验、ROAS优化无系统支撑"——CVR预测模型将相同预算ROAS提升20-35%，年化增收20-80万元

## ② 核心算法逻辑

搜索词级 CVR 预测（SearchTerm CVR Predictor）从广告 CTR/CVR 预测领域迁移而来，核心思想是用机器学习模型替代人工经验判断哪个关键词有高转化潜力。

## ③ 业务应用场景

场景A：广告关键词出价优先级排序 - 业务问题：有 500+ 关键词候选，预算有限，不知道哪些词值得高 bid - 数据要求：过去 90 天关键词级广告数据（展示、点击、CVR、CPC），关键词文本特征 - 预期产出：每关键词 7 日 CVR 预测值 + 置信区间，输出出价优先级矩阵 - 业务价值：相同预算下，优先高预测 CVR 词，ROAS 提升 20-35%，年化增收 30-80 万元
三轨验证： - 成本：显性成本包括数据采集（需从广告平台 API 拉取 90 天关键词级数据，约 0.5 人天/次）、计算资源（单次训练 < 1 小时，云成本约 5-10 元）、人力（模型开发 2-3 人天，后续月度维护 0.5 人天）。若使用第三方数据清洗工具，额外增加 1000-3000 元/年。 - 合规：需确保关键词数据不包含用户个人身份信息（PII），符合 GDPR 匿名化要求；Amazon 广告平台允许基于历史表现优化出价，但禁止使用种族、健康等敏感词作为特征；不涉及广告法虚假宣传红线。 - 风险：次生风险包括：① 高预测 CVR 词可能引发竞品跟投，导致 CPC 上涨 10-20
场景B：新关键词冷启动评分 - 业务问题：发现新的长尾词，没有历史 CVR 数据，无法判断是否值得投放 - 数据要求：词义相似的历史词 CVR 数据，词的文本特征 - 预期产出：冷启动 CVR 预测分 + 推荐测试 bid - 业务价值：减少试错成本，新词测试期广告浪费减少 30-40%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：广告预算 100 万/年，CVR 预测引导出价可提升 ROAS 20-30%，增收 20-30 万元/年
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：需要 90 天以上的关键词级历史数据，数据量要求有一定门槛；但对于 100+ 关键词以上的账户，收益显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（87 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

def extract_keyword_features(keyword: str) -> dict:
    """从关键词文本提取特征"""
    words = keyword.lower().split()
    buy_intent_words = {"buy", "cheap", "best", "top", "review", "discount", "deal", "sale", "organic", "natural"}
    info_intent_words = {"what", "how", "why", "guide", "tips", "benefits"}
    return {
        "word_count": len(words),
        "has_buy_intent": int(any(w in buy_intent_words for w in words)),
        "has_info_intent": int(any(w in info_intent_words for w in words)),
        "char_length": len(keyword),
        "has_brand_word": int("baby" in keyword.lower() or "infant" in keyword.lower()),
        "has_product_type": int(any(w in keyword.lower() for w in ["pump", "carrier", "bottle", "diaper", "pillow"]))
    }

def build_cvr_predictor(df: pd.DataFrame):
    """
    训练搜索词 CVR 预测模型
    df 列：keyword, cvr_7d, cvr_30d, cvr_std, cpc, impression_rank, word_count, 
           has_buy_intent, has_info_intent, char_length, has_brand_word, has_product_type
    """
    feature_cols = ["cvr_7d", "cvr_30d", "cvr_std", "cpc", "impression_rank",
                    "word_count", "has_buy_intent", "has_info_intent",
                    "char_length", "has_brand_word", "has_product_type"]
    
    X = df[feature_cols].fillna(0)
    y = df["cvr_future"]  # 目标：未来7天实际CVR
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    
    return model, feature_cols, mae

def predict_cvr_batch(model, feature_cols: list, keywords_df: pd.DataFrame) -> pd.DataFrame:
    """批量预测关键词 CVR"""
    X = keywords_df[feature_cols].fillna(0)
    keywords_df = keywords_df.copy()
    keywords_df["predicted_cvr"] = model.predict(X).clip(0, 1)
    keywords_df["bid_priority"] = (keywords_df["predicted_cvr"] / keywords_df["cpc"].replace(0, 0.01)).round(3)
    return keywords_df.sort_values("bid_priority", ascending=False)

# 构造示例数据
np.random.seed(42)
n = 200
keywords_sample = [
    "baby carrier ergonomic", "best breast pump 2024", "organic nursing pillow",
    "infant car seat", "cheap baby bottle set", "how to use baby wrap carrier",
    "top rated diaper bag", "baby monitor wifi", "natural baby shampoo",
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：过去 90 天以上的关键词级广告数据（展示、点击、转化率、CPC）、关键词文本特征与历史排名信息，目标变量为未来 7 天实际 CVR；数据须去除用户个人信息。

**输出**：每个关键词的未来 7 日 CVR 预测值与置信区间、出价优先级矩阵，以及新长尾词的冷启动评分与推荐测试出价，供广告运营排序与分配预算。

## 执行步骤

1. 从广告平台拉取 90 天以上关键词级展示、点击、CVR 与 CPC 数据
2. 从关键词文本提取购买意图、信息意图与品类词等特征
3. 训练回归模型以未来 7 天实际 CVR 为目标并评估误差
4. 批量预测各关键词 CVR 与置信区间
5. 输出出价优先级矩阵供预算向高预测 CVR 词倾斜
6. 对新长尾词给出冷启动预测分与推荐测试出价

## 边界与不做

- 何时不用：关键词级历史不足 90 天、或单日点击过少无法建立稳定特征时不适用。
- 能力边界：只产出预测与优先级，不直接改出价；高预测 CVR 词可能引发竞品跟投导致 CPC 上涨，需配合出价上限使用。
- 合规边界：特征必须排除 PII 与种族、健康等敏感属性并做匿名化处理；平台只允许基于历史表现优化出价。

## 技能关联

- **前置**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining、Skill-Search-Funnel-Attribution.html、Skill-Search-Funnel-Attribution
- **延伸**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining
- **可组合**：Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining、Skill-Search-Conversion-Rate-Predictor

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Conversion-Rate-Predictor`