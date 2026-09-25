---
name: "p2s-llm-session-personalization-cache"
title: "LLM Session Personalization Cache — LLM 驱动的会话意图缓存与千人千面推荐"
description: "触发词：千人千面、意图缓存、三层画像、首页重排、会话个性化。何时不用：要在毫秒级用行为流实时刷新推荐用「流式实时推荐」；要按宝宝月龄切换品类推荐用「月龄感知推荐」。安全边界：浏览加购数据属个人信息，画像生成与使用须在隐私政策中告知并获同意；实时 CTR 预估不得用于站外广告定向或对外转售。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 分群"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-LLM-Session-Personalization-Cache"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "妈妈和奶爸不该看到同一个首屏：把长期偏好、近期行为和这次会话的意图缓存起来，按人重排。"
user_try: "试试：用这位用户近 90 天的浏览加购行为加上当前会话行为，生成三层意图缓存并重排首页商品。"
whenToUse: "当首页对所有人展示同一排序、CTR 明显低于行业基准（卡页示例首页 CTR 2.3%、行业 4-6%）时用本技能；要会话内毫秒级更新用「流式实时推荐」；要按宝宝月龄切换品类用「月龄感知推荐」。"
workflow: "采集近 90 天浏览、加购、购买记录与商品属性向量 → 接入当前会话的实时行为流（前端埋点） → 生成长期偏好、近期需求、实时意图三层缓存 → 基于缓存重排首页商品顺序 → 输出实时 CTR 预估并做 A/B 验证"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Session Personalization Cache — LLM 驱动的会话意图缓存与千人千面推荐

## ① 解决的问题

母婴独立站首页对所有用户展示相同商品，哺乳妈妈和奶爸看到的首屏完全一样导致CTR仅2.3%——LLM会话意图三层缓存（长期偏好+近期行为+即时session）驱动千人千面排序，首页CTR提升到4-5%，年化GMV增益40-120万元

## ② 核心算法逻辑

传统会话推荐的痛点：用户当前 session 行为极少（平均37次点击），协同过滤没有足够信号推断意图。SPRINT 的解法：用 LLM 离线预生成用户意图画像（Intent Profile），缓存为向量，在线推理时直接检索而非实时调用 LLM。

## ③ 业务应用场景

业务问题：独立站首页对所有用户展示相同的商品排列——妈妈群体（关注吸奶器/哺乳配件）和奶爸群体（关注安全座椅/学步车）看到完全相同的首屏。首页 CTR 只有 2.3%，远低于行业 4-6% 的基准。
数据要求： - 用户历史浏览/加购/购买记录（近 90 天） - 商品属性向量（品类/价格带/年龄段适用/品牌） - 当前 session 实时行为流（需要前端埋点）
预期产出： - 每位用户的三层意图缓存：长期偏好 + 近期需求 + 实时意图 - 千人千面首页：基于意图缓存重排商品顺序 - 实时 CTR 预估：每次展示预估用户点击概率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
独立站首页千人千面：CTR 从 2.3% 提升到 4-5%，月增流量价值 ¥10-30 万
搜索结果个性化重排：CVR 提升 30-50%，月增净收入 ¥10-30 万
配件/复购推荐精准化：复购率提升 10-15%，LTV 提升
年化综合 ROI：¥40-120 万
实施难度：⭐⭐⭐☆☆（需要用户行为埋点基础设施 + Redis 缓存层；LLM 画像生成离线批处理，约 3-4 周工程量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/05-推荐系统/llm_session_personalization_cache` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-LLM-Session-Personalization-Cache.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Session Personalization Cache
SPRINT 框架的轻量级实现：三层意图缓存 + 千人千面商品排序
"""
import numpy as np
import json
from datetime import datetime, timedelta
from collections import defaultdict


def generate_sample_users_and_items():
    """生成模拟用户行为和商品数据"""
    np.random.seed(42)

    items = {
        'I001': {'name': 'Quiet Double Breast Pump', 'category': 'breast_pump',
                 'price': 149.99, 'age_stage': 'newborn', 'brand': 'BrandA', 'attrs': [1,0,1,0,1]},
        'I002': {'name': 'Portable Wearable Breast Pump', 'category': 'breast_pump',
                 'price': 99.99, 'age_stage': 'newborn', 'brand': 'BrandB', 'attrs': [1,1,0,0,1]},
        'I003': {'name': 'Baby Car Seat 0-4 Years', 'category': 'car_seat',
                 'price': 299.99, 'age_stage': 'infant', 'brand': 'BrandC', 'attrs': [0,0,1,1,0]},
        'I004': {'name': 'Infant Learning Walker', 'category': 'walker',
                 'price': 79.99, 'age_stage': 'toddler', 'brand': 'BrandD', 'attrs': [0,1,0,1,0]},
        'I005': {'name': 'Breast Pump Replacement Parts', 'category': 'accessories',
                 'price': 24.99, 'age_stage': 'newborn', 'brand': 'BrandA', 'attrs': [0,0,0,0,1]},
        'I006': {'name': 'Baby Bottle Sterilizer', 'category': 'sterilizer',
                 'price': 59.99, 'age_stage': 'newborn', 'brand': 'BrandE', 'attrs': [0,0,1,0,0]},
    }

    users = {
        'U001': {  # 新妈妈，关注哺乳
            'history': ['I001', 'I005', 'I002', 'I006', 'I001'],
            'session': ['I002', 'I005'],
            'profile': 'nursing_mom',
        },
        'U002': {  # 奶爸，关注安全
            'history': ['I003', 'I004', 'I003'],
            'session': ['I004'],
            'profile': 'safety_dad',
        },
        'U003': {  # 孕期妈妈，全品类
            'history': ['I001', 'I003', 'I006'],
            'session': ['I001', 'I003'],
            'profile': 'pregnant_mom',
        },
    }
    return users, items


def build_item_vector(item):
    """构建商品嵌入向量"""
    category_map = {'breast_pump': [1,0,0,0,0,0], 'car_seat': [0,1,0,0,0,0],
                    'walker': [0,0,1,0,0,0], 'accessories': [0,0,0,1,0,0],
                    'sterilizer': [0,0,0,0,1,0]}
    cat_vec = category_map.get(item['category'], [0,0,0,0,0,1])

    age_map = {'newborn': 1.0, 'infant': 0.6, 'toddler': 0.3}
    age_score = age_map.get(item['age_stage'], 0.5)

    price_norm = 1.0 - min(item['price'] / 400, 1.0)  # 越便宜分越高（价格敏感）
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.00570 — SPRINT: Scalable and Predictive Intent Refinement for LLM-Enhanced Session-based Recommendation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户历史浏览、加购、购买记录（卡页示例近 90 天）、商品属性向量（品类、价格带、适用年龄段、品牌）、当前会话实时行为流；粒度为单用户 × 单次会话。

**输出**：每位用户的三层意图缓存、千人千面首页商品排序与实时 CTR 预估；供推荐与前端在首页与搜索页落地。

## 执行步骤

1. 采集近 90 天浏览、加购、购买记录与商品属性向量
2. 接入当前会话的实时行为流
3. 生成长期偏好、近期需求、实时意图三层缓存
4. 基于意图缓存重排首页与搜索结果
5. 输出实时 CTR 预估并做 A/B 验证

## 边界与不做

- 数据不满足：没有前端埋点、拿不到当前会话行为流时实时意图层建不起来，先补埋点与缓存层。
- 何时不用：要毫秒级流式刷新用「流式实时推荐」；要按月龄切换品类用「月龄感知推荐」。
- 能力边界：只做意图缓存与排序重排，不训练新的排序模型，也不保证卡页口径的 CTR 提升。
- 安全边界：行为数据属个人信息，画像生成与使用须在隐私政策中告知并获同意；CTR 预估不得用于站外广告定向或对外转售。

## 技能关联

- **前置**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **可组合**：Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN、Skill-LLM-Session-Personalization-Cache

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-LLM-Session-Personalization-Cache`