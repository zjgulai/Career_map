---
name: "p2s-visual-product-search"
title: "Visual Product Search — 视觉商品搜索：以图搜货与相似款发现"
description: "触发词：以图搜货、视觉商品搜索、CLIP向量检索、相似款发现、竞品同款查找、视觉差异化。何时不用：只做文字侧语义检索用「稠密检索电商语义搜索」；要生成或优化 Listing 文案用「Listing AI 文案」；只做多模态商品属性理解而不做检索用「多模态商品理解」。安全边界：竞品图片仅用于内部分析与差异化定位，不得直接复制进自有 Listing 主图，避免侵权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 竞品研究"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Visual-Product-Search"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "用户上传一张图就能找到相似且更便宜的款式，同时帮卖家看清自己与竞品的视觉差异，减少找不到同款就离开的流失。"
user_try: "试试：把这批婴儿推车主图和竞品图建成 CLIP 向量索引，用户上传一张朋友圈截图后返回 Top 5 相似款与相似度分。"
whenToUse: "本卡属「搜索意图分析」下的视觉检索分支，做图像相似度召回与竞品视觉对比。只做文字关键词/长尾词的语义检索用「稠密检索电商语义搜索（Skill-Dense-Retrieval-Ecommerce-Semantic-Search）」；要生成 Listing 文案用「Listing AI 文案（Skill-Listing-AI-Copywriting）」；要做长尾词嵌入式 SEO 用「长尾搜索嵌入 SEO（Skill-Long-Tail-Search-Embedding-SEO）」；只理解商品多模态属性而不做检索用「多模态商品理解（Skill-Multimodal-Product-Understanding）」。"
workflow: "归集商品图片库，确认每个 SKU 至少 3 张主图 → 用 CLIP 提取 512 维图像特征并做 L2 归一化 → 把全部特征写入 FAISS 向量索引，建成可检索商品库 → 对查询图（用户上传图或竞品图）提取同空间特征并做近邻检索 → 取 Top-K 相似商品附相似度分，按需用 price_filter 过滤后输出候选"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Visual Product Search — 视觉商品搜索：以图搜货与相似款发现

## ① 解决的问题

用户在社交媒体看到竞品同款想找相似但更便宜的款式文字搜索效果差——CLIP视觉搜索让用户上传图片直接找相似商品，搜索转化率提升8-15%同时帮助卖家发现视觉差异化空间年化增益10-30万元

## ② 核心算法逻辑

CLIP 模型实现图文统一搜索：

## ③ 业务应用场景

业务问题：用户在朋友圈看到一个婴儿推车，想找一个类似款式但价格更低的。在独立站只能文字搜索，效果差。视觉搜索让用户上传这张图，直接展示相似款。
数据要求： - 商品图片库（每个 SKU 至少 3 张主图） - 预建 CLIP 向量索引（FAISS 向量数据库）
预期产出： - 图片查询 → Top 5 相似商品（含相似度分） - 竞品分析：上传竞品图，找到自己最接近的款式

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
独立站视觉搜索功能：用户体验提升，转化率提升 8-15%
竞品视觉相似度分析：差异化定位决策更数据驱动
以图找相似功能：减少用户流失（找不到想要的就离开）
年化综合 ROI：¥10-30 万
实施难度：⭐⭐⭐☆☆（CLIP 有开源预训练模型；FAISS 向量检索成熟；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（151 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/visual_product_search` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Visual-Product-Search.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Visual Product Search
CLIP 视觉商品搜索：以图搜货与相似商品发现
生产环境: pip install transformers torch pillow faiss-cpu
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class ProductImage:
    product_id: str
    category: str
    price: float
    image_features: np.ndarray  # CLIP 图像特征向量（512维）


def simulate_clip_features(n_products: int, seed: int = 42) -> list[ProductImage]:
    """
    模拟 CLIP 图像特征（生产中替换为 CLIP 模型提取）
    生产代码:
    from transformers import CLIPModel, CLIPProcessor
    model = CLIPModel.from_pretrained('openai/clip-vit-base-patch32')
    processor = CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')
    inputs = processor(images=pil_image, return_tensors='pt')
    features = model.get_image_features(**inputs)
    """
    np.random.seed(seed)
    categories = ['breast_pump_electric', 'breast_pump_manual', 'stroller',
                  'car_seat', 'bottle', 'sterilizer']
    products = []

    # 同类别产品视觉特征更相近（聚类模拟）
    category_centers = {cat: np.random.normal(0, 1, 64) for cat in categories}

    for i in range(n_products):
        cat = categories[i % len(categories)]
        center = category_centers[cat]
        features = center + np.random.normal(0, 0.3, 64)
        features = features / (np.linalg.norm(features) + 1e-8)  # L2归一化

        products.append(ProductImage(
            product_id=f'PROD-{i:03d}',
            category=cat,
            price=np.random.uniform(30, 300),
            image_features=features,
        ))

    return products


def build_visual_index(products: list[ProductImage]) -> np.ndarray:
    """构建视觉搜索索引"""
    return np.vstack([p.image_features for p in products])


def visual_search(query_features: np.ndarray, index: np.ndarray,
                  products: list[ProductImage], top_k: int = 5,
                  price_filter: tuple = None) -> list[dict]:
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.09834，但该号在 arXiv 上是《Analysis of time-harmonic electromagnetic problems with elliptic material coefficients》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：输入为商品图片库与查询图片。商品侧每条记录需含 product_id、category、price 与 512 维 CLIP 图像特征，特征须 L2 归一化；检索前须预建 CLIP 向量索引（FAISS 向量数据库），每 SKU 至少 3 张主图。查询侧为一张图片经同一 CLIP 模型提取的特征向量，可选 price_filter 价格区间过滤。生产环境需安装 transformers / torch / pillow / faiss-cpu 并加载开源预训练 CLIP（clip-vit-base-patch32）。

**输出**：产出图片查询的 Top-5 相似商品列表（含 product_id、category、price、相似度分，并可按价格区间过滤），以及竞品图到自有最接近款式的映射结果，交付给用户选款与运营做视觉差异化定位；原案例口径为搜索转化率提升 8-15%、年化综合 ROI 10-30 万元、实施约 3-4 周。

## 执行步骤

1. 归集商品图片库，确认每个 SKU 至少 3 张主图
2. 用 CLIP 提取 512 维图像特征并做 L2 归一化
3. 将全部特征写入 FAISS 向量索引，建立可检索商品库
4. 对查询图提取特征并在索引中做近邻检索
5. 取 Top-5 相似商品并附相似度分，必要时按价格区间过滤
6. 用竞品图跑同样检索，输出与自有款式最接近的候选做差异化定位

## 边界与不做

- 数据不满足：每个 SKU 不足 3 张主图、或尚未预建 CLIP 向量索引时不要用，先补齐图片并建索引。
- 何时不用：只做文字侧语义检索用「稠密检索电商语义搜索」；要产出 Listing 文案用「Listing AI 文案」；只做多模态属性理解不做检索用「多模态商品理解」。
- 能力边界：只做图像相似度检索与候选召回，不判定商品是否侵权或仿款，也不替代人工选品裁决；转化率提升 8-15%、年化 ROI 10-30 万元为原案例口径，非保证值。
- 安全边界：竞品图片仅限内部分析与差异化定位使用，不得直接复制为自有商品主图或素材。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding
- **延伸**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO
- **可组合**：Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Visual-Product-Search

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：08-知识图谱　·　源卡：`Skill-Visual-Product-Search`