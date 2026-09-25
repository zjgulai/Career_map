---
name: "p2s-multimodal-product-rec"
title: "MultiModal Product Recommendation — 多模态产品推荐"
description: "触发词：多模态推荐、图像特征、图文融合、评论信号、视觉匹配。何时不用：要按商品标签约束做推荐用「标签感知个性化推荐」；要按商品属性图做零样本推荐用「图基础模型推荐」。安全边界：用户评论须在平台 ToS 允许范围内使用，不得用于训练商业模型；图像质量不达标（低分辨率主图）时不得作为推荐依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-MultiModal-Product-Rec"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "光看文本分不清长得像但成分不同的商品：把主图、文案和评论信号一起用上，推荐不再老是那几款。"
user_try: "试试：用商品主图、详情文本和评论 Top20 做多模态融合，给这位用户重排首页推荐。"
whenToUse: "当纯文本协同过滤区分不了外观相似的商品、用户抱怨老是推一样的时用本技能；要按标签约束推荐用「标签感知个性化推荐」；要零样本属性图推荐用「图基础模型推荐」。"
workflow: "采集商品主图、详情文本与评论 Top20 → 分别提取视觉与文本特征并离线预计算 → 用门控融合生成商品多模态嵌入 → 按用户历史做召回与排序 → 过滤低质量图像并监控 CTR 与新品发现率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MultiModal Product Recommendation — 多模态产品推荐

## ① 解决的问题

运营面临"纯文本推荐重复率高、用户反馈老是推一样的"——视觉+文本+UGC门控融合将首页CTR提升28%、新品发现率提升40%，年化SEO增量价值约60万元

## ② 核心算法逻辑

多模态推荐将商品的图像、文本标题、用户评论联合建模，弥补单一模态信息不足。母婴产品评论中包含大量"实物图"与"文字描述"的差异，多模态融合能捕捉用户偏好的视觉与语义双重维度。

## ③ 业务应用场景

场景1：Amazon 奶粉/辅食视觉+文本联合推荐 - 业务问题：纯文本协同过滤无法区分外观相似但成分不同的奶粉 SKU，导致推荐重复率高，用户反馈"老是推一样的"；首页点击重复商品 CTR 仅 1.8% - 数据要求：商品主图（已有 Amazon API）、商品详情文本（标题+bullet points）、用户评论 Top20（Amazon Review API） - 预期产出：首页推荐 CTR 提升 28%（1.8% → 2.3%），用户会话内 Discover New Item 率提升 40% - 业务价值：CTR 提升带动有机流量排名，年化 SEO 价值约 60 万元
场景2：TikTok Shop 视频封面+商品图多模态匹配 - 业务问题：TikTok 推荐仅依赖视频标签，忽略了商品图片与短视频封面的视觉匹配度，导致用户"看视频下不了单" - 数据要求：短视频封面帧截图、对应挂载商品主图、用户观看-购买日志 - 预期产出：视觉匹配度高的视频-商品对转化率提升 35%，相关商品详情页停留时长提升 20s - 业务价值：TikTok ROAS 提升约 0.8，年化广告费节省约 40 万元
**三轨验证**： - 成本：图像特征提取可离线预计算，在线推理 <30ms；CLIP 模型 GPU 推理成本约 $50/月 - 合规：用户评论使用需符合平台 ToS，不得用于训练商业模型（需确认 Amazon API 条款） - 风险：图像质量差（低分辨率主图）会拉低模型性能；需设置图像质量过滤阈值

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：多模态推荐 CTR 相对提升 20-35%，对主图高质量商品效果尤为显著；以月均 50 万次曝光计，年化额外点击约 100-175 万次，增量 GMV 约 80-150 万元
实施难度：⭐⭐⭐⭐☆（图像特征提取需 GPU；CLIP 模型调用成本需控制）
优先级：⭐⭐⭐☆☆
评估依据：母婴品类图片质量参差不齐，多模态优势明显；但 TikTok/Amazon 平台已有图像推荐能力，差异化价值在于结合私域评论 UGC 信号

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（88 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ============================================================
# MultiModal Product Recommendation（多模态产品推荐简化实现）
# ============================================================

def simulate_feature_extraction(items: list[str], seed: int = 42) -> dict:
    """模拟多模态特征提取（实际使用 CLIP/BERT）"""
    rng = np.random.default_rng(seed)
    features = {}
    for item in items:
        features[item] = {
            "visual": rng.standard_normal(64),      # 图像 embedding（实际 512dim）
            "text": rng.standard_normal(64),         # 文本 embedding（实际 768dim）
            "review": rng.standard_normal(64),       # 评论聚合 embedding
        }
    return features

def gated_fusion(visual: np.ndarray, text: np.ndarray,
                 review: np.ndarray | None,
                 user_modality_weights: tuple[float, float, float] = (0.4, 0.4, 0.2)
                 ) -> np.ndarray:
    """门控多模态融合"""
    gv, gt, gr = user_modality_weights
    if review is None:
        # 评论缺失时，用视觉+文本注意力重建
        review = 0.5 * visual + 0.5 * text
        gr = 0.1
        gv, gt = 0.5, 0.4
    fused = gv * visual + gt * text + gr * review
    norm = np.linalg.norm(fused)
    return fused / (norm + 1e-9)

def build_item_embeddings(item_features: dict,
                           user_weights: tuple[float, float, float]
                           ) -> dict[str, np.ndarray]:
    """构建所有商品的融合 embedding"""
    embeddings = {}
    for item, feats in item_features.items():
        embeddings[item] = gated_fusion(
            feats["visual"], feats["text"],
            feats.get("review"),
            user_weights
        )
    return embeddings

def recommend_multimodal(user_history: list[str],
                          item_embeddings: dict[str, np.ndarray],
                          top_n: int = 5) -> list[tuple[str, float]]:
    """基于用户历史商品 embedding 均值推荐相似商品"""
    if not user_history:
        return []
    history_embs = [item_embeddings[i] for i in user_history if i in item_embeddings]
    if not history_embs:
        return []
    user_emb = np.mean(history_embs, axis=0)
    user_emb = user_emb / (np.linalg.norm(user_emb) + 1e-9)

    candidates = {k: v for k, v in item_embeddings.items() if k not in set(user_history)}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.10827，但该号在 arXiv 上是《The TES-based Cryogenic AntiCoincidence Detector (CryoAC) of ATHENA X-IFU: a large area silicon microcalorimeter for background particles detection》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品主图、商品详情文本（标题与要点）、用户评论 Top20（卡页示例经平台 API 获取）；粒度为单商品 × 单次推荐请求。

**输出**：商品多模态嵌入、重排后的推荐列表与首页 CTR、新品发现率等效果指标；供推荐工程与运营做多模态推荐上线。

## 执行步骤

1. 采集商品主图、详情文本与评论 Top20
2. 分别提取视觉与文本特征并离线预计算
3. 用门控融合生成商品多模态嵌入
4. 按用户历史做召回与排序
5. 过滤低质量图像并跟踪 CTR 与新品发现率

## 边界与不做

- 数据不满足：商品主图分辨率过低或缺失、评论抓取受限时融合效果不成立，先补齐素材与授权。
- 何时不用：要按标签约束推荐用「标签感知个性化推荐」；要零样本属性图推荐用「图基础模型推荐」。
- 能力边界：只做特征融合与排序，不承担图像素材生产，也不保证卡页口径的 CTR 提升。
- 安全边界：评论须在平台 ToS 允许范围内使用，不得用于训练商业模型；图像质量不达标时不得作为推荐依据。

## 技能关联

- **前置**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-LLM-Augmented-Recommendation.html、Skill-LLM-Augmented-Recommendation、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand、Skill-Semantic-ID-Retrieval-RPG.html、Skill-Semantic-ID-Retrieval-RPG、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand、Skill-Semantic-ID-Retrieval-RPG.html、Skill-Semantic-ID-Retrieval-RPG、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand、Skill-Semantic-ID-Retrieval-RPG.html、Skill-Semantic-ID-Retrieval-RPG、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-MultiModal-Product-Rec

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-MultiModal-Product-Rec`