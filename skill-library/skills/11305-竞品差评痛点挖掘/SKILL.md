---
name: "p2s-review-pain-point-mining"
title: "Review Pain-Point Mining（竞品差评痛点挖掘）"
description: "触发词：差评痛点、无监督挖掘、机会评分、差异化切入、竞品评论。何时不用：要结合市场规模权重算新品机会分用「VOC-New-Product-Gap-Scoring」；要确定切入价格带用「跨竞品评论选品机会评分」。安全边界：评论抓取须遵守平台条款与 robots.txt；产出报告不得直接引用评论原文以免版权风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 市场机会评估"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Review-Pain-Point-Mining"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "用无监督流程扫竞品差评，把用户到底不满意什么抽成带提及占比和情感强度的痛点清单与机会评分。"
user_try: "试试：扫 baby bottle warmer 品类 Top15 竞品的 3,200 条评论，列出痛点主题和机会评分。"
whenToUse: "进入一个已有强竞品的品类、需要找到差异化切入点时用本技能；若要结合市场规模权重算新品机会得分，用「VOC-New-Product-Gap-Scoring」；若要确定切入价格带，用「跨竞品评论选品机会评分」。"
workflow: "采集品类 Top 竞品评论（如 Top15 共数千条），统计差评占比 → 运行无监督管线做情感分析与主题抽取 → 按提及占比与情感强度计算各痛点机会评分 → 输出痛点主题排序与典型用户原声"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review Pain-Point Mining（竞品差评痛点挖掘）

## ① 解决的问题

想进入"电动吸奶器"品类，但已有 Momcozy/Medela/Spectra 等强竞品

## ② 核心算法逻辑

竞品的差评就是新品的机会——从竞品评论中自动提取「用户不满意什么」，这些未被满足的需求点就是你新品应该攻克的方向。Painsight 用无监督框架自动完成"情感分析 + 主题抽取 + 不满因子归因"，无需人工标注即可扩展到任何新品类。

## ③ 业务应用场景

业务背景： 某母婴出海品牌计划在 Amazon US 上线一款婴儿暖奶器新品。现有竞品包括 Philips Avent、Kiinde、Tommee Tippee 等，市场已较拥挤。团队库存 2000 件，日销目标 50 件，当前竞品平均转化率 4.5%，ROAS 3.2。需要找到精准的差异化切入点，避免陷入价格战。
数据输入： - 爬取 Amazon US "baby bottle warmer" 品类 Top 15 竞品评论共 3,200 条 - 其中 1-3 星差评 1,100 条（占比 34%） - 运行 Painsight 无监督管线，无需人工标注
| 痛点主题 | 提及占比 | 情感强度 | 机会评分 | 典型用户原声 | |---------|---------|---------|---------|------------| | 加热不均/热点 | 31% | 0.88 | 0.273 | "一边烫一边凉，摇晃后才均匀" | | 温控不准 | 24% | 0.82 | 0.197 | "设定 40°C 实际到 55°C，破坏母乳营养" | | 清洗死角 | 18% | 0.75 | 0.135 | "底部缝隙发霉，刷子伸不进去" | | 容量太小 | 12% | 0.60 | 0.072 | "只能放 150ml 奶瓶，大瓶放不下

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
产品成功率提升：30%→60%+（基于精准痛点定位）
单品差异化溢价：$500K→$800K+（解决真实痛点带来溢价空间）
年化 ROI：50-100 万元
实施难度：⭐⭐☆☆☆（2 星）— Painsight 无监督开源，无需标注数据，即装即用
优先级评分：⭐⭐⭐⭐⭐（5 星）— "数据驱动选品"从概念变为可执行工具

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/review_pain_point_mining` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Review-Pain-Point-Mining.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Painsight — Review Pain-Point Mining Pipeline
基于 Painsight (WASSA@ACL 2023) 的简化实现

依赖: pip install transformers torch scikit-learn
模型: github.com/yukyunglee/Painsight
"""

import numpy as np
from collections import Counter
from typing import Dict, List, Tuple
from dataclasses import dataclass


@dataclass
class PainPoint:
    """痛点"""
    topic: str
    mention_ratio: float      # 提及占比
    sentiment_intensity: float # 情感强度 (0-1, 越高越负面)
    keywords: List[str]
    opportunity_score: float   # 机会评分 = mention × intensity


class PainSightMiner:
    """
    竞品差评痛点挖掘器
    
    生产环境使用 Painsight 的 BERT + LDA + Gradient Attribution 全管线
    当前为简化实现，用关键词匹配 + 情感词典模拟核心逻辑
    """
    
    # 母婴品类痛点关键词库（可扩展）
    PAIN_KEYWORDS = {
        "漏液/倒流": ["leak", "spill", "backflow", "milk waste", "drip", "leaking"],
        "噪音": ["noise", "loud", "quiet", "sound", "decibel", "hum", "buzz"],
        "配件兼容": ["compatible", "flange", "bottle", "adapter", "fit", "connector"],
        "清洗困难": ["clean", "wash", "sterilize", "dishwasher", "disassemble", "nook"],
        "吸力不足": ["suction", "weak", "pressure", "strength", "power", "hospital grade"],
        "电池续航": ["battery", "charge", "cordless", "portable", "last", "recharge"],
        "材质安全": ["BPA", "silicone", "plastic smell", "chemical", "toxic", "safe"],
        "佩戴不适": ["pain", "uncomfortable", "nipple", "sore", "fit", "size"],
    }
    
    def mine_pain_points(
        self, 
        reviews: List[Dict],
        category: str = "breast_pump",
    ) -> List[PainPoint]:
        """
        从竞品评论中挖掘痛点
        
        Args:
            reviews: [{text, rating, product_name, ...}, ...]
            category: 产品品类
        
        Returns:
            痛点列表，按机会评分降序
        """
        # 1. 筛选负面评论（rating <= 3 或 文本情感负面）
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标品类 Top 竞品的全量评论（示例：Amazon US baby bottle warmer Top 15 竞品共 3,200 条，其中 1-3 星差评 1,100 条），需含文本与评分，无需人工标注。

**输出**：痛点主题清单：每个主题的提及占比、情感强度、机会评分（提及×强度）与典型用户原声，供选品差异化定位使用。

## 执行步骤

1. 采集品类 Top 竞品评论并统计差评占比
2. 运行无监督管线做情感分析与主题抽取
3. 计算各痛点的提及占比与情感强度
4. 合成机会评分并排序痛点主题
5. 输出差异化切入点与典型原声佐证

## 边界与不做

- 竞品评论量不足、或差评占比过低时不适用，主题抽取与机会评分都不稳
- 输出的是需求侧痛点排序，不含成本、认证与供应链可行性
- 评论抓取须遵守平台条款与 robots.txt，产出报告不得直接引用评论原文

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **可组合**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Review-Pain-Point-Mining

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：14-用户分析　·　源卡：`Skill-Review-Pain-Point-Mining`