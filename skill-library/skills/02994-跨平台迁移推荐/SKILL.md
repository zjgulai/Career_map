---
name: "p2s-cross-platform-transfer-rec"
title: "Cross-Platform Transfer Recommendation — 跨平台迁移推荐"
description: "触发词：跨平台迁移、冷启动推荐、用户映射、偏好迁移、首推 CTR。何时不用：要解决的是爆款挤压长尾的曝光结构时用「推荐去偏」；要优化搜索排序时用「个性化搜索排序」。安全边界：跨平台数据使用需用户授权，映射须单向哈希、不存明文。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-073"
l3_business: "平台运营"
l3_all: "平台运营 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/平台运营"
p2s_card_id: "Skill-Cross-Platform-Transfer-Rec"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新开的平台店没有用户历史，就把老平台的偏好带过去，让推荐从第一天起就不像在瞎猜。"
user_try: "试试：把 Amazon 老客的偏好迁到 TikTok Shop，给已匹配的新用户生成首推列表。"
whenToUse: "当品牌跨平台开店、目标平台新用户没有行为历史、需要迁移源平台偏好做冷启动推荐时用本技能；若要解决的是长尾曝光结构问题，用「推荐去偏」；要优化搜索排序，用「个性化搜索排序」。"
workflow: "从源平台行为数据构建用户 embedding → 用脱敏映射表匹配跨平台用户并对齐商品 → 为目标平台新用户生成初始偏好表示 → 产出 Top-N 首推并做 A/B 复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Platform Transfer Recommendation — 跨平台迁移推荐

## ① 解决的问题

运营面临"TikTok Shop新店冷启动首推CTR仅3%"——跨平台用户embedding迁移将已匹配用户CTR提升至11%、冷启动期缩短60%，年化增量LTV约120万元

## ② 核心算法逻辑

跨平台迁移推荐解决平台新用户冷启动问题：将用户在 Amazon（源域）积累的行为历史，迁移到 TikTok Shop（目标域）为新用户生成初始偏好表示。

## ③ 业务应用场景

场景1：Amazon 老客迁移到 TikTok Shop 冷启动 - 业务问题：品牌在 TikTok Shop 开店，新用户无历史行为，首页推荐全靠热门榜，CTR 仅 3% - 数据要求：Amazon 订单历史（脱敏）、TikTok 用户 ID-Amazon 账号映射表（邮箱哈希匹配）、商品类目对齐表 - 预期产出：对已匹配用户，首推 CTR 从 3% 提升至 11%；冷启动期缩短 60%（从 30 天降至 12 天） - 业务价值：TikTok Shop 新用户 30 日 LTV 提升 40%，年化增量约 120 万元
场景2：独立站 → Amazon 反向迁移 - 业务问题：品牌独立站有大量用户偏好数据，入驻 Amazon 后无法利用 - 数据要求：独立站点击/购买日志、商品 EAN/ASIN 对照表 - 预期产出：Amazon 新品 launch 期转化率提升 18%，Review 获取速度提升 25% - 业务价值：新品 launch ROI 提升，Listing 获得 Early Reviewer 加速
**三轨验证**： - 成本：用户匹配一次性计算，增量推理成本低；模型每月重训一次 - 合规：跨平台数据使用需用户授权（GDPR/CCPA）；邮箱哈希匹配需单向加密，不存储明文 - 风险：平台间商品类目差异大时，迁移质量下降；需建立迁移效果监控（A/B 实验对照）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：冷启动期用户 30 日 LTV 提升 30-45%；对跨平台布局品牌，每月可匹配用户 5000 人，年化增量 LTV 约 90-150 万元
实施难度：⭐⭐⭐⭐☆（核心难点在跨平台用户匹配合规，技术实现中等）
优先级：⭐⭐⭐⭐☆
评估依据：多平台布局已成跨境卖家标配，冷启动质量直接影响 TikTok 算法对新店铺的权重分配；先发优势明显

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（120 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.preprocessing import normalize

# ============================================================
# Cross-Platform Transfer Recommendation（跨平台迁移推荐简化实现）
# ============================================================

class CrossPlatformTransferRec:
    """基于用户 embedding 相似度的跨平台冷启动推荐"""

    def __init__(self, k_neighbors: int = 5):
        self.k = k_neighbors
        self.src_embeddings: dict[str, np.ndarray] = {}   # 源域用户 embedding
        self.tgt_embeddings: dict[str, np.ndarray] = {}   # 目标域用户 embedding
        self.item_scores: dict[str, dict[str, float]] = {}  # 目标域用户→商品得分

    def fit_source(self, user_item_matrix: dict[str, list[str]],
                   item_vocab: list[str]) -> None:
        """从源域（Amazon）用户行为构建 embedding（基于共现 one-hot 平均）"""
        vocab_idx = {item: i for i, item in enumerate(item_vocab)}
        dim = len(item_vocab)
        for user, items in user_item_matrix.items():
            vec = np.zeros(dim)
            for item in items:
                if item in vocab_idx:
                    vec[vocab_idx[item]] = 1.0
            if vec.sum() > 0:
                self.src_embeddings[user] = normalize(vec.reshape(1, -1))[0]

    def fit_target(self, user_item_matrix: dict[str, list[str]],
                   item_scores: dict[str, dict[str, float]],
                   item_vocab: list[str]) -> None:
        """从目标域（TikTok）已有用户构建 embedding"""
        vocab_idx = {item: i for i, item in enumerate(item_vocab)}
        dim = len(item_vocab)
        for user, items in user_item_matrix.items():
            vec = np.zeros(dim)
            for item in items:
                if item in vocab_idx:
                    vec[vocab_idx[item]] = 1.0
            if vec.sum() > 0:
                self.tgt_embeddings[user] = normalize(vec.reshape(1, -1))[0]
        self.item_scores = item_scores

    def predict_cold_start(self, new_user: str,
                           src_items: list[str],
                           item_vocab: list[str],
                           top_n: int = 5) -> list[tuple[str, float]]:
        """为目标域新用户（仅有源域行为）生成推荐"""
        vocab_idx = {item: i for i, item in enumerate(item_vocab)}
        dim = len(item_vocab)

        # 构建新用户源域 embedding
        vec = np.zeros(dim)
        for item in src_items:
            if item in vocab_idx:
                vec[vocab_idx[item]] = 1.0
        if vec.sum() == 0:
            return []
        new_emb = normalize(vec.reshape(1, -1))[0]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.11705，但该号在 arXiv 上是《Coarsening of chiral domains in itinerant electron magnets: A machine learning force field approach》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：源平台用户行为或订单历史（脱敏）、跨平台用户映射表（卡页为邮箱哈希匹配）、商品类目或 ID 对齐表（如 EAN/ASIN 对照）；粒度为 用户 × 商品。

**输出**：目标平台新用户的初始偏好表示与 Top-N 推荐列表（卡页口径已匹配用户首推 CTR 3%→11%、冷启动 30 天→12 天）；供目标平台推荐服务冷启动使用。

## 执行步骤

1. 从源平台行为或订单数据构建用户 embedding
2. 用脱敏映射表（邮箱哈希等）匹配跨平台用户，并对齐商品类目与 ID
3. 为目标平台新用户生成初始偏好表示
4. 按相似邻居产出 Top-N 首推列表
5. 用 A/B 对比首推 CTR 与冷启动天数，监控迁移质量

## 边界与不做

- 数据不满足：没有合规的跨平台用户映射（用户授权 + 单向哈希）时不得做用户级迁移，只能退到品类级推荐。
- 何时不用：要解决的是已购爆款挤压长尾的曝光结构，用「推荐去偏」；要解决的是搜索场景排序，用「个性化搜索排序」。
- 能力边界：不代做用户授权与数据合规评估，跨平台商品类目差异大时迁移质量会下降；卡页的 CTR 3%→11%、年化增量 LTV 90-150 万元为案例口径。

## 技能关联

- **前置**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Knowledge-Graph-Rec.html、Skill-Knowledge-Graph-Rec、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Lifecycle-Stage-Aware-Rec.html、Skill-Lifecycle-Stage-Aware-Rec、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Social-Proof-Viral-Rec.html、Skill-Social-Proof-Viral-Rec
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Knowledge-Graph-Rec.html、Skill-Knowledge-Graph-Rec、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Lifecycle-Stage-Aware-Rec.html、Skill-Lifecycle-Stage-Aware-Rec、Skill-Social-Proof-Viral-Rec.html、Skill-Social-Proof-Viral-Rec
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Knowledge-Graph-Rec.html、Skill-Knowledge-Graph-Rec、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Social-Proof-Viral-Rec.html、Skill-Social-Proof-Viral-Rec、Skill-Cross-Platform-Transfer-Rec

---

> 分类：业务运营/渠道经营/平台运营　·　技术族：05-推荐系统　·　源卡：`Skill-Cross-Platform-Transfer-Rec`