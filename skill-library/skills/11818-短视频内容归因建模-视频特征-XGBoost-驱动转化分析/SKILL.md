---
name: "p2s-short-video-commerce-attribution"
title: "短视频内容归因建模 — 视频特征 XGBoost 驱动转化分析"
description: "触发词：短视频内容归因、视频特征重要性、高转化内容配方、素材优先级排序、低效素材识别。何时不用：要判断达人本身带来的真实增量用 KOL 因果归因类技能，只优化开场留存用钩子优化类技能，本技能只拆解视频内容特征对转化的贡献。安全边界：素材与转化数据须来自自有或已授权后台，不得抓取他人内容；输出是相关性排序，不得当因果结论对外使用，涉用户明细须脱敏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-Short-Video-Commerce-Attribution"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "把历史短视频拆成可量化特征，算出哪些特征真正带来购买，沉淀成可复制的内容配方。"
user_try: "试试：用我们 500 条 TikTok 视频的特征和转化数据，跑出最影响转化的前 5 个特征，并给一套高转化内容配方。"
whenToUse: "有历史视频元数据与后链接转化数、要判断哪些内容特征值得复制时用本技能；评估某个达人或渠道的真实增量用增量分析类技能，优化单条视频开场用钩子优化类技能。"
workflow: "导出视频元数据并对齐转化标签 → 构造时长、完播率、情绪与时段等特征 → 训练梯度提升模型并计算 SHAP 重要性 → 提炼高转化特征组合成内容配方 → 标记低效素材并给出停投建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 短视频内容归因建模 — 视频特征 XGBoost 驱动转化分析

## ① 解决的问题

内容运营面临"短视频哪些特征真正带来转化靠直觉判断效率极低"——XGBoost内容特征归因将爆款视频特征提炼准确率提升至83%，内容ROI提升41%

## ② 核心算法逻辑

核心思想：同样的 TikTok/Reels 广告预算，不同视频内容的转化率可能相差 10 倍。用 XGBoost 对视频的可量化特征（时长/完播率/BGM 类型/文案情感极性/达人粉丝量/上传时段）进行归因建模，输出 SHAP 特征重要性，识别哪些内容特征最显著影响购买转化，指导内容团队的素材生产优先级。

## ③ 业务应用场景

场景A：吸奶器 TikTok 视频素材优化 - 业务问题：内容团队每周产出 15 条视频，但不知道哪些视频特征驱动购买，凭感觉选素材导致爆款可复制性差。 - 数据要求：历史 500+ 条 TikTok 视频元数据（时长/完播率/点赞评论数/BGM 分类/文案）+ 每条视频的后链接转化数（从 TikTok Ads Manager 获取） - 预期产出： - TOP5 驱动转化的视频特征（SHAP 值排序） - 「高转化内容配方」：如 15-30s + 完播率>45% + 情感词密度>0.12 的组合转化率最高 - 低效素材识别：指出最近 20 条视频中哪 6 条特征组合差，建议优先停投 - 业务
场景B：婴儿推车 KOL 合作内容模板标准化 - 业务问题：合作了 30 个 KOL，转化率差异极大（0.5%-8%），不知道是 KOL 本身的差异还是内容制作方式的差异。 - 数据要求：各 KOL 发布视频的内容特征 + 对应转化率，KOL 基础画像（粉丝量/垂类/地区） - 预期产出：将转化差异拆解为「KOL 效应」vs「内容效应」各占比，输出可复制的内容制作 SOP（最优特征组合模板） - 业务价值：用内容 SOP 标准化合作效果，有效 KOL 比例从 40% 提升到 65%，KOL 投放 ROI 提升 30-40%
三轨验证 | 成本轨：短视频内容制作月均2000元（素材采购1200元+剪辑外包800元），AI标签系统部署一次性5000元，人工运营12小时/月（成本600元），月均总成本2600元。ROAS从2.8→4.1，ROI提升46%，预计月度额外收益增长15-20万元 | 合规轨：符合《电商法》第十七条广告真实性要求，短视频需标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：内容生产命中率从 20% 提升到 40%，同等素材预算月增有效视频 10 条，节省无效测试费约 8-15 万元/月；KOL 合作 ROI 提升 30-40%（按月 KOL 预算 30 万计，月增 9-12 万 GMV）
实施难度：⭐⭐⭐☆☆（需从 TikTok Ads Manager 导出结构化数据，文案特征提取需简单 NLP 处理，shap 包集成稳定）
优先级评分：⭐⭐⭐⭐⭐
评估依据：短视频内容是 TikTok Shop 的核心竞争力，素材生产效率直接决定规模化能力；XGBoost+SHAP 组合成熟可靠，可解释性强（内容团队能直接理解「完播率>45%+情感 BGM 最重要」）；母婴品类 2025 年 TikTok GMV 占比超 35%，内容归因工具是必建能力

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（204 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/advertising/short_video_commerce_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Short-Video-Commerce-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
短视频内容归因建模 — XGBoost + SHAP
- 输入：视频特征数据 + 转化标签
- 输出：特征重要性、SHAP 值分析、高转化内容配方
"""

import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.preprocessing import LabelEncoder
import shap
import warnings
warnings.filterwarnings("ignore")


# ── 1. 生成模拟视频数据（真实场景从 TikTok Ads Manager 导出）──
def generate_video_dataset(n: int = 600, seed: int = 42) -> pd.DataFrame:
    """
    模拟 TikTok 视频特征数据集
    特征：时长/完播率/点赞率/BGM情绪/文案情感极性/发布时段/达人级别
    标签：is_converted（点击商品链接并购买）
    """
    np.random.seed(seed)
    
    # 生成特征
    duration_sec = np.random.choice([9, 15, 21, 30, 45, 60], n, p=[0.1, 0.25, 0.25, 0.2, 0.1, 0.1])
    completion_rate = np.clip(np.random.beta(3, 4, n), 0.05, 0.95)
    like_rate = np.random.exponential(0.05, n).clip(0, 0.3)
    bgm_type = np.random.choice(["流行", "情感", "节奏感", "安静"], n, p=[0.35, 0.25, 0.3, 0.1])
    caption_sentiment = np.random.uniform(0, 1, n)  # 0=负面, 1=正面
    caption_keywords = np.random.poisson(3, n).clip(0, 10)  # 关键词数量
    post_hour = np.random.choice(range(24), n)
    influencer_level = np.random.choice(["nano", "micro", "mid", "macro"], n, p=[0.3, 0.35, 0.25, 0.1])
    
    # 构造转化标签（模拟真实规律）
    # 规律：完播率高 + 15-30s + 情感 BGM + 正向文案 → 更高转化
    logit = (
        2.5 * completion_rate
        + 0.8 * (caption_sentiment > 0.5).astype(float)
        + 0.5 * (duration_sec.isin([15, 21, 30])).astype(float) if hasattr(duration_sec, 'isin') 
          else 0.5 * np.isin(duration_sec, [15, 21, 30]).astype(float)
        + 0.4 * (np.array(bgm_type) == "情感").astype(float)
        + 0.3 * (caption_keywords > 3).astype(float)
        + 0.2 * np.isin(post_hour, [9, 12, 19, 20, 21]).astype(float)
        - 1.5  # 基准负偏置（转化率偏低）
        + np.random.normal(0, 0.5, n)  # 噪声
    )
    prob = 1 / (1 + np.exp(-logit))
    is_converted = (np.random.uniform(size=n) < prob).astype(int)
    
    df = pd.DataFrame({
        "视频时长_秒":    duration_sec,
        "完播率":         completion_rate.round(3),
        "点赞率":         like_rate.round(4),
        "BGM类型":        bgm_type,
        "文案情感极性":   caption_sentiment.round(3),
        "文案关键词数":   caption_keywords,
        "发布小时":       post_hour,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.17893，但该号在 arXiv 上是《Measurement of Proton-Induced Reactions on Lanthanum from 55--200 MeV by Stacked-Foil Activation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史 500 条以上 TikTok 视频元数据（时长、完播率、点赞评论数、BGM 分类、文案）加每条视频的后链接转化数（Ads Manager 导出）；达人场景另需粉丝量、垂类、地区画像。

**输出**：按 SHAP 排序的驱动转化特征、可复制的高转化内容配方、低效素材停投清单，以及达人合作场景下 KOL 效应与内容效应的占比拆解，供内容团队排素材生产优先级。

## 执行步骤

1. 从广告与内容后台导出视频元数据，并对齐每条视频的转化标签。
2. 构造时长、完播率、BGM 情绪、文案情感极性与发布时段等量化特征。
3. 训练梯度提升转化模型，用 SHAP 计算各特征贡献。
4. 提炼高转化特征组合，形成可复制的内容制作配方与模板。
5. 标记特征组合差的低效素材，给出停投或改版建议。
6. 在达人合作场景把转化差异拆解为达人效应与内容效应占比。

## 边界与不做

- 视频样本量不足或拿不到后链接转化数时不要用，特征重要性会不稳定、结论不可复现。
- 能力边界：输出是相关性排序而非因果增量，要下因果结论须配合增量分析或实验设计；卡页口径的提升幅度来自特定案例，不可直接外推。
- 数据合规：只用自有或已授权数据，含用户点击与转化明细的字段须脱敏。

## 技能关联

- **前置**：Skill-Instagram-Reels-Commerce-Attribution.html、Skill-Instagram-Reels-Commerce-Attribution、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel
- **延伸**：Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel
- **可组合**：Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-Short-Video-Commerce-Attribution

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：13-广告分析　·　源卡：`Skill-Short-Video-Commerce-Attribution`