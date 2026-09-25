---
name: "p2s-cabb-cross-category-attribution"
title: "Click A Buy B 跨品类归因去偏 - 点击与购买商品不一致的归因修正"
description: "触发词：跨品类归因、点击 A 购买 B、归因权重修正、品类相似度、Session 分析、广告被砍。何时不用：点击与购买品类基本一致时用常规归因；没有品类层级或共现日志时先补数据。安全边界：Session 与共现日志涉及用户行为，需在隐私政策覆盖范围内使用，品类树与商品数据须为自有或授权数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / GMV归因分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-CABB-Cross-Category-Attribution"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户点广告 A 却买了 B，修正这类跨品类归因，避免误砍其实有效的广告系列。"
user_try: "试试：用户点了吸奶器广告却买了储奶袋，帮我修正这条广告系列的归因权重。"
whenToUse: "点击商品与购买商品不一致、广告被误判零转化时用本技能；旅程内品类一致时用多触点归因；没有品类树或共现日志时不适用。"
workflow: "清洗 Session、共参与与广告展示日志 → 建立商品到三级品类的映射并学习品类相似度 → 识别并分类 CABB 会话 → 用双头模型预测跨品类转化并修正归因权重 → 输出受影响广告系列的保留或调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Click A Buy B 跨品类归因去偏 - 点击与购买商品不一致的归因修正

## ① 解决的问题

用户点击吸奶器广告，进入品牌店铺后转而购买了储奶袋和奶瓶

## ② 核心算法逻辑

电商广告平台大量 Session 存在 CABB（Click A, Buy B） 现象——用户点击了商品 A 的广告，但最终购买的是商品 B。传统的 LastClick 归因模型将这些"点击购买不一致"的会话视为无意义噪声，强行将转化归零，导致系统性学习偏差：模型被迫"奖励那些与购买只是巧合相关、而非真正驱动转化的商品展示"。

## ③ 业务应用场景

业务问题：用户点击吸奶器广告，进入品牌店铺后转而购买了储奶袋和奶瓶。Last-Click 归因将吸奶器广告标记为"零转化"→ 该广告系列预算在下一轮自动竞价中被砍。但实际上，用户通过吸奶器广告建立了品牌信任，最终在母婴品类内完成了高价值购买。
这是典型的品类内交叉购买 CABB：吸奶器与奶瓶/储奶袋的品类相似度高（同属哺乳周边），应恢复该广告的归因权重。
数据要求： - 用户 Session 数据：`session_id, clicked_product_id, purchased_product_id, timestamp` - 商品 Taxonomy 树：产品类目层级（至少三级：大类 → 中类 → 小类），如"母婴 → 哺乳用品 → 吸奶器" - 共参与日志：用户在同一 session/7 天窗口内共同点击/收藏/购买的商品对，用于训练品类相似度矩阵 - 广告展示日志：`ad_id, product_id, user_id, impression/click/conversion`

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（647 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/cabb_cross_category_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-CABB-Cross-Category-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CABB (Click A, Buy B) 跨品类归因去偏框架
=========================================
基于 arXiv:2507.15113 论文实现：
- Session CABB 识别与分类
- Taxonomy-aware 品类协同过滤相似度学习
- CABA/CABB 双头多任务转化预测
- 归因权重修正

适用场景：母婴出海电商广告归因偏差修正
依赖：numpy, pandas, torch, sklearn
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings("ignore")


# ============================================================
# 1. 数据结构与 Taxonomy 映射
# ============================================================

class ProductTaxonomy:
    """商品品类树管理器
    
    维护商品 → 品类映射，计算品类路径相似度
    """
    def __init__(self):
        # 母婴品类树示例（三级：大类/中类/小类）
        self.taxonomy = {
            # 哺乳周边品类
            "breast_pump": ["maternal_infant", "nursing", "breast_pump"],
            "milk_bag":    ["maternal_infant", "nursing", "milk_storage"],
            "bottle":      ["maternal_infant", "nursing", "feeding_bottle"],
            "nipple":      ["maternal_infant", "nursing", "nipple_shield"],
            # 出行品类
            "stroller":    ["maternal_infant", "travel", "stroller"],
            "car_seat":    ["maternal_infant", "travel", "car_seat"],
            "baby_carrier":["maternal_infant", "travel", "baby_carrier"],
            # 睡眠品类
            "crib":        ["maternal_infant", "sleep", "crib"],
            "sleep_sack":  ["maternal_infant", "sleep", "sleep_sack"],
            "night_light": ["maternal_infant", "sleep", "night_light"],
            # 喂养品类
            "baby_food":   ["maternal_infant", "feeding", "solid_food"],
            "formula":     ["maternal_infant", "feeding", "formula"],
        }
    
    def get_category(self, product_id: str, level: int = 2) -> str:
        """获取商品指定层级的品类标签"""
        path = self.taxonomy.get(product_id, ["unknown", "unknown", "unknown"])
        return "/".join(path[:level+1])
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2507.15113 — Click A, Buy B: Rethinking Conversion Attribution in E- Commerce Recommendations

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户 Session 数据（session_id、点击商品、购买商品、时间戳）、至少三级的商品品类树、共参与日志（同 session 或 7 天窗口内的商品对）、广告展示日志（ad_id、product_id、user_id、曝光或点击或转化）。

**输出**：CABB 会话识别与分类结果、品类相似度矩阵、双头转化预测、修正后的归因权重与预算保留建议；供投放团队避免误砍有效广告。

## 执行步骤

1. 清洗 Session、共参与与广告展示日志
2. 建立商品到三级品类的映射并学习品类相似度
3. 识别并分类 CABB 会话
4. 用双头模型预测跨品类转化并修正归因权重
5. 输出受影响广告系列的保留或调整建议

## 边界与不做

- 何时不用：点击与购买集中在同一品类，或只有平台汇总报表而无 Session 级数据时，用常规归因即可。
- 能力边界：本技能产出归因权重修正与建议，不做预算自动调整，也不替代增量因果验证。
- 数据边界：品类树层级与共现窗口设定会显著影响相似度学习，口径未对齐前结论只能作为参考。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Hierarchical-Search-Intent-Classification.html、Skill-Hierarchical-Search-Intent-Classification、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TESLA-NetCVR-Cascade.html、Skill-TESLA-NetCVR-Cascade、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **延伸**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Hierarchical-Search-Intent-Classification.html、Skill-Hierarchical-Search-Intent-Classification、Skill-TESLA-NetCVR-Cascade.html、Skill-TESLA-NetCVR-Cascade、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **可组合**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Hierarchical-Search-Intent-Classification.html、Skill-Hierarchical-Search-Intent-Classification、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-CABB-Cross-Category-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-CABB-Cross-Category-Attribution`