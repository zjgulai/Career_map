---
name: "p2s-multimodal-product-search"
title: "UniECS — 统一多模态电商搜索与商品匹配"
description: "触发词：以图搜商品、多模态检索、图文一致、竞品发现、SKU 匹配。何时不用：只做搜索词层面的需求挖掘用「搜索词 VOC 信号闭环」；要构建竞品属性知识图谱用「KG Data Fusion Pipeline」。安全边界：商品图与标题仅用于内部选品检索、不得直接复用竞品素材；抓取价格与排名须遵守平台条款。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 搜索意图分析"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Multimodal-Product-Search"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "看到竞品主图却叫不出名字时，用图文联合检索把视觉和语义相似的竞品找齐，也能顺手检查自家 Listing 图文是否一致。"
user_try: "试试：用这张日本品牌吸奶器主图做多模态检索，找出视觉和语义相似的竞品 Top-20 并带上价格和排名。"
whenToUse: "手上只有竞品图片或图文混合意图、关键词搜不全时用本技能；若要做搜索词层面的需求挖掘，用「搜索词 VOC 信号闭环」；若要建竞品属性图谱，用「KG Data Fusion Pipeline」。"
workflow: "构建竞品 SKU 图文库（主图 + 标题 + ASIN），不少于 500 条 → 截取目标竞品主图作为查询输入 → 执行多模态检索并返回 Top-20 相似商品 → 自动补齐价格、BSR 与评分 → 对新增竞品做图文一致性审核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# UniECS — 统一多模态电商搜索与商品匹配

## ① 解决的问题

选品分析师看到竞品图但叫不出名字——多模态统一搜索引擎同时理解图文意图，竞品雷达覆盖率提升60%，年化节省调研工时18万元

## ② 核心算法逻辑

传统电商搜索只能处理"文字查文字"或"图片查图片"单一通道，跨模态意图（看图找词、读文找图）无法覆盖。UniECS 用门控跨模态融合编码器统一处理 9 种图文检索场景。

## ③ 业务应用场景

- 业务问题：选品分析师在 Amazon 看到某日本品牌的吸奶器主图，想找国内外所有视觉相似竞品，但叫不出品牌名或关键词 - 数据要求：竞品 SKU 库（商品主图 + 标题 + ASIN），至少 500 条；查询图片来自竞品截图 - 操作流程：截取竞品主图 → 输入多模态搜索引擎 → 返回 Top-20 视觉+语义相似商品 → 自动抓取价格、BSR、评分 - 预期产出：竞品发现覆盖率从 35% 提升至 80%（人工关键词搜索的漏检从 65% 降到 20%） - 业务价值：选品调研效率提升 3 倍，人工 2 天缩短至 4 小时；年化节省运营成本约 18 万元（2 名选品分析师 × 40% 效率提
场景 B：Listing 视觉一致性审核——图文联合查询
- 业务问题：新品上架前需确认主图是否与标题描述一致，防止"标题说防漏但图片没有显示防漏结构"导致转化低 - 数据要求：本品 Listing（标题 + 主图 + 5 张副图），以及行业 Top-100 同类商品的图文数据 - 操作流程：输入"标题文本 + 主图"联合查询 → 检索行业相似商品 → 分析相似竞品的图文一致性分布 - 预期产出：Listing 图文一致性检测准确率 ≥ 85%，拦截不一致 Listing 减少差评率约 15% - 业务价值：新品上架后前 3 个月 CVR 提升 0.8%~1.2%，以月销 500 单、客单价 $35 估算，月增收约 $1,400

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（279 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/multimodal_product_search` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Multimodal-Product-Search.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
UniECS 简化版多模态商品搜索
场景：母婴吸奶器 SKU 库，支持文本→商品、图文联合查询
依赖：pip install sentence-transformers Pillow numpy
"""

import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    _USE_ST = True
except ImportError:
    _USE_ST = False
from PIL import Image, ImageDraw
import io
from typing import Optional

# ── 1. 构建母婴吸奶器 SKU 库（模拟数据）──────────────────────────────────

SKU_CATALOG = [
    {"sku": "BM-001", "title": "双边电动吸奶器 静音防漏 USB充电", "category": "electric-double"},
    {"sku": "BM-002", "title": "单边手动吸奶器 硅胶软管 轻便携带", "category": "manual-single"},
    {"sku": "BM-003", "title": "可穿戴免手持电动吸奶器 180ml储奶", "category": "wearable"},
    {"sku": "BM-004", "title": "医院级双边电动吸奶器 12档调节", "category": "hospital-grade"},
    {"sku": "BM-005", "title": "硅胶被动收集吸奶器 对侧吸附防漏奶", "category": "passive-collector"},
    {"sku": "BM-006", "title": "智能APP控制电动吸奶器 记忆模式", "category": "smart-app"},
    {"sku": "BM-007", "title": "迷你隐形可穿戴吸奶器 超静音28dB", "category": "wearable"},
    {"sku": "BM-008", "title": "双边手动吸奶器 大吸力硅胶喇叭口", "category": "manual-double"},
    {"sku": "BM-009", "title": "电动单边吸奶器 按摩仿生吸力模拟", "category": "electric-single"},
    {"sku": "BM-010", "title": "一体式储奶袋吸奶器 直连冷藏保鲜", "category": "integrated-bag"},
]


# ── 2. 多模态编码器（简化版 UniECS）────────────────────────────────────

class SimpleUniECS:
    """简化版 UniECS：使用 all-MiniLM-L6-v2 作为文本塔，PIL 色彩统计作为图像塔"""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        print("🔄 加载文本编码器...")
        if _USE_ST:
            self.text_encoder = SentenceTransformer(model_name)
        else:
            self.text_encoder = None
        self.text_dim = 384
        self.image_dim = 16  # 简化图像特征：4x4 颜色直方图块
        self.fused_dim = self.text_dim + self.image_dim
        print(f"✅ 模型就绪 | 文本维度={self.text_dim} | 图像维度={self.image_dim}")

    def encode_text(self, text: str) -> np.ndarray:
        """文本 → 向量"""
        if self.text_encoder is None:
            # Fallback: 简单词袋向量（保留语义相似性，无需外部依赖）
            # 预定义母婴电商关键词词表（前 text_dim 个词）
            vocab = [
                "吸奶", "电动", "静音", "防漏", "便携", "可穿戴", "免手持", "双边", "单边",
                "医院级", "专业", "档位", "续航", "吸力", "噪音", "奶瓶", "消毒", "杀菌",
                "婴儿", "哺乳", "妈妈", "母乳", "新生", "宝宝", "安全", "BPA", "硅胶",
                "推车", "睡袋", "尿布", "辅食", "奶粉", "益生菌", "维生素", "胶原",
                "轻便", "折叠", "充电", "无线", "蓝牙", "APP", "智能", "定时", "按摩",
            ]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.13843 — UniECS: Unified Multimodal E-Commerce Search Framework with Gated Cross-modal Fusion

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：竞品 SKU 库：商品主图 + 标题 + ASIN，至少 500 条；查询侧为竞品主图截图；做图文一致性审核时还需本品 Listing 的标题、主图与副图，以及行业 Top-100 同类商品图文数据。

**输出**：Top-20 视觉与语义相似商品清单（含自动补齐的价格、BSR、评分）、竞品发现覆盖率变化，以及 Listing 图文一致性检测结果（拦截标题与主图不一致的 Listing）。

## 执行步骤

1. 构建并维护竞品 SKU 图文库
2. 截取竞品主图作为查询输入
3. 执行多模态检索并返回相似商品
4. 自动补齐价格、BSR 与评分
5. 对结果做图文一致性审核

## 边界与不做

- 竞品 SKU 库规模不足（少于 500 条）或图片质量差时不适用，检索覆盖率会明显下降
- 输出是相似商品清单与一致性判定，不包含相似度背后的侵权判断
- 商品图与标题仅用于内部选品检索，不得直接复用竞品素材；抓取价格与排名须遵守平台条款

## 技能关联

- **前置**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query
- **延伸**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **可组合**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Multimodal-Product-Search

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：08-知识图谱　·　源卡：`Skill-Multimodal-Product-Search`