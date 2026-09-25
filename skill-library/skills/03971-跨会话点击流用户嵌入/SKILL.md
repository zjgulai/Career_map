---
name: "p2s-trace-clickstream-embedding"
title: "TRACE 跨会话点击流用户嵌入"
description: "触发词：跨会话行为建模、点击流嵌入、购买意图识别、再营销定向、页面路径分析。何时不用：只做价值分层用 RFM 类技能，估计渠道真实增量用增量分析类技能，本技能从多次访问路径判断用户是否处于购买决策阶段。安全边界：点击流须按隐私政策采集与脱敏，不得跨站追踪个体，再营销定向须提供退出方式与频次上限。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-TRACE-Clickstream-Embedding"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把用户跨多天的浏览路径连成一条序列，判断谁真的快要下单了。"
user_try: "试试：用我们的多会话点击流训练嵌入，把快要下单的高意图用户圈出来，给再营销投放定向。"
whenToUse: "决策周期长、单次会话转化率极低、需要从多次访问路径识别高意图用户时用本技能；只做价值分层用 RFM 类技能，判断渠道增量用增量分析类技能。"
workflow: "整理多会话页面浏览序列 → 编码页面、设备与来源字段 → 训练编码器学习全局用户状态 → 输出用户意图嵌入并分群 → 把高意图人群交给再营销"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TRACE 跨会话点击流用户嵌入

## ① 解决的问题

业务问题： 母婴出海跨境独立站（如婴儿推车、有机奶粉、儿童安全座椅品类）面临典型问题：用户决策周期长（备孕→孕期→育儿长达数年），单次会话转化率极低（通常 <1%），但通过多次访问才能判断哪些用户真正处于购买决策阶段

## ② 核心算法逻辑

传统序列推荐模型只看单会话内的商品点击序列，TRACE 的创新在于：把整个用户的多会话页面浏览历史（包括首页、搜索页、详情页、购物车、结账等各类页面，跨越数天甚至数周）打包成一条有序序列，送入轻量级 Transformer Encoder 学习全局用户状态嵌入。

## ③ 业务应用场景

业务问题： 母婴出海跨境独立站（如婴儿推车、有机奶粉、儿童安全座椅品类）面临典型问题：用户决策周期长（备孕→孕期→育儿长达数年），单次会话转化率极低（通常 <1%），但通过多次访问才能判断哪些用户真正处于购买决策阶段。
具体痛点： - 无法区分"随机浏览的新妈妈"与"已在比价、即将下单的精准用户" - 首页、分类页、评测博客页的访问比例不明，无法调整流量引导策略 - 跨境物流页（Shipping Policy）和信任背书页（Certifications）的浏览顺序是否预示转化，缺乏数据支持 - 再营销广告投放预算有限，只能定向给高意图用户，但无法识别
| 字段 | 类型 | 示例 | |------|------|------| | user_id | string | "usr_abc123" | | session_id | string | "sess_2026042001" | | page_name | category | "homepage" / "product_detail" / "cart" / "checkout" / "blog_stroller_review" / "shipping_policy" | | device_type | category | "mobile" / "desktop" / "table

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（779 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/trace_clickstream_embedding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-TRACE-Clickstream-Embedding.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TRACE 母婴电商点击流用户嵌入实现
arXiv: 2409.12972

环境依赖: pip install torch numpy scikit-learn matplotlib
可选依赖: pip install seaborn  # 更美观的可视化
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.preprocessing import LabelEncoder
from typing import List, Dict, Tuple
import random
import math

# ─────────────────────────────────────────────
# 1. 模拟母婴电商点击流数据生成
# ─────────────────────────────────────────────

# 母婴 DTC 站点页面类型
PAGE_NAMES = [
    "homepage",           # 首页
    "category_stroller",  # 品类页：婴儿推车
    "category_formula",   # 品类页：奶粉
    "category_carseat",   # 品类页：安全座椅
    "product_detail",     # 商品详情页（PDP）
    "blog_review",        # 博客/评测页
    "search_results",     # 搜索结果页（SRP）
    "cart",               # 购物车
    "checkout",           # 结账页
    "order_confirmation", # 订单确认页
    "shipping_policy",    # 配送政策页
    "certifications",     # 认证信任背书页
    "my_orders",          # 我的订单（VUO）
    "wishlist",           # 收藏夹
]

DEVICE_TYPES = ["mobile", "desktop", "tablet"]
UTM_SOURCES = ["instagram", "google", "organic", "email", "tiktok"]

# 购买漏斗阶段 → 影响页面访问概率
USER_STAGE_PROBS = {
    "explorer": {  # 探索期：大量浏览，不太购买
        "homepage": 0.20, "category_stroller": 0.15, "category_formula": 0.10,
        "category_carseat": 0.10, "product_detail": 0.15, "blog_review": 0.15,
        "search_results": 0.08, "cart": 0.03, "checkout": 0.01, 
        "order_confirmation": 0.00, "shipping_policy": 0.01, "certifications": 0.01,
        "my_orders": 0.00, "wishlist": 0.01,
    },
    "evaluator": {  # 比较期：聚焦商品详情、评测
        "homepage": 0.05, "category_stroller": 0.08, "category_formula": 0.05,
        "category_carseat": 0.05, "product_detail": 0.30, "blog_review": 0.20,
        "search_results": 0.12, "cart": 0.08, "checkout": 0.03,
        "order_confirmation": 0.00, "shipping_policy": 0.02, "certifications": 0.01,
        "my_orders": 0.00, "wishlist": 0.01,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2409.12972 — TRACE: Transformer-based user Representations from Attributed Clickstream Event sequences

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：多会话点击流日志，字段包括用户 ID、会话 ID、页面名称（首页、分类页、详情页、购物车、结账、评测博客、物流政策等）、设备类型、来源渠道与时间戳。

**输出**：跨会话的用户状态嵌入与意图分群结果（用于区分随机浏览与即将下单的用户）以及页面路径对转化影响的结论；供再营销定向与流量引导策略使用。

## 执行步骤

1. 汇总用户跨会话的页面浏览序列，补齐页面、设备与来源字段。
2. 训练轻量 Transformer 编码器学习全局用户状态嵌入。
3. 按嵌入做分群，区分随机浏览与即将下单的高意图用户。
4. 分析浏览路径与页面顺序对转化的影响。
5. 把高意图人群输出给再营销投放与流量引导。

## 边界与不做

- 会话日志缺用户 ID 或页面类型字段、跨会话无法拼接时不要用，全局用户状态学不出来。
- 能力边界：意图分群是概率判断，不预测具体成交；跨境场景决策周期长，需定期重训以适配用户阶段变化。
- 合规红线：点击流须按隐私政策采集与脱敏，不得跨站追踪个体，再营销定向须提供退出方式与频次上限。

## 技能关联

- **前置**：Skill-Ad-to-Behavior-Funnel.html、Skill-Ad-to-Behavior-Funnel、Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-NonItem-Page-Path-Modeling.html、Skill-NonItem-Page-Path-Modeling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Ad-to-Behavior-Funnel.html、Skill-Ad-to-Behavior-Funnel、Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-NonItem-Page-Path-Modeling.html、Skill-NonItem-Page-Path-Modeling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift
- **可组合**：Skill-Ad-to-Behavior-Funnel.html、Skill-Ad-to-Behavior-Funnel、Skill-NonItem-Page-Path-Modeling.html、Skill-NonItem-Page-Path-Modeling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-TRACE-Clickstream-Embedding

---

> 分类：业务运营/品牌与增长/分群　·　技术族：14-用户分析　·　源卡：`Skill-TRACE-Clickstream-Embedding`