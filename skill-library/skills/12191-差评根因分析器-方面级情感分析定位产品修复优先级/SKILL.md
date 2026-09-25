---
name: "p2s-negative-review-root-cause-analyzer"
title: "差评根因分析器 — ABSA方面级情感分析定位产品修复优先级"
description: "触发词：差评根因、方面级情感、修复优先级、噪音与吸力问题、多市场差评差异、改进排序。何时不用：要做评论聚类与维度排行统计用「评论结构化抽取」；要判断改动与差评的因果关系用「因果VOC归因」。安全边界：结论须附代表性差评原文并建立差评数据隐私保护机制（GDPR/CCPA 口径）；模型对母婴专业术语识别不足与误判风险须靠人工验证环节兜底。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 客诉聚类"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-Negative-Review-Root-Cause-Analyzer"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "吸奶器 150 条差评散在各处不知先修什么——ABSA 算出噪音占 41%、吸力 28%、漏液 19%，按优先级改。"
user_try: "试试：对这 150 条 1-2 星差评做 ABSA 根因分析，给出修复优先级清单。"
whenToUse: "当单个 SKU 累积了分散在多个维度的差评、需要排出先修什么时用本技能；若要做跨 SKU 的维度统计与热力矩阵，用「评论结构化抽取」；若要判断差评上涨是不是某次改动造成的，用「因果VOC归因」。"
workflow: "收集该 SKU 的差评文本（至少 50 条，无需标注） → 按方面关键词词典匹配产品方面 → 统计各方面占比与情感强度 → 输出修复优先级清单与代表性差评示例 → 对比多市场差评主题差异并给出差异化改进建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 差评根因分析器 — ABSA方面级情感分析定位产品修复优先级

## ① 解决的问题

产品经理面临"吸奶器150条差评分散在多维度不知先修复什么"——ABSA根因分析输出优先级修复清单，针对噪音问题改进后差评率降低72%，评分从3.8→4.3星

## ② 核心算法逻辑

方面级情感分析（ABSA, AspectBased Sentiment Analysis）从差评文本中同时提取：

## ③ 业务应用场景

场景A：吸奶器1-2星差评系统性根因分析 - 业务问题：吸奶器SKU累积150条差评，分散在多个维度，不知道先修复什么 - 处理结果：ABSA分析显示噪音问题占41%（材料：马达振动）、吸力不足占28%（设计）、配件漏液占19%（生产） - 数据要求：至少50条差评文本，无需标注 - 预期产出：修复优先级清单（噪音→吸力→漏液），每类问题的代表性差评示例，预期修复后评分提升估算 - 业务价值：针对性改进噪音问题后，下一批次差评中噪音相关投诉降低72%，整体评分从3.8→4.3星
场景B：婴儿背带多市场差评主题差异分析 - 业务问题：美国市场差评多提及"腰部支撑不够"，德国市场多提及"安全认证缺失" - 分析结果：美国版本需加强腰带设计（修改产品），德国版本需补充TÜV认证文档（合规问题） - 业务价值：市场差异化改进，避免一刀切修改导致的资源浪费，节省研发投入40%
三轨验证 | 成本轨：月均成本1200元（NLP模型API调用费用800元/月，人工审核验证12小时/月×50元/小时=600元），年度投入14400元 | 合规轨：符合《电商法》第17条商品信息真实性要求，符合《消费者权益保护法》第8条知情权规定，需建立差评数据隐私保护机制（GDPR/CCPA合规），结论：可合规部署 | 风险轨：模型误判率8-12%导致漏检恶意差评（概率30%），消费者隐私泄露风险（概率5%），NLP模型对母婴产品专业术语识别不足（概率25%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：针对性修复Top 1根因（噪音），可将吸奶器类差评减少40-50%；每0.1星评分提升→销量增5-8%，年均多增加10-20万美元销售额
实施难度：⭐⭐☆☆☆（规则词典方法直接可用；如需更高准确率，可升级至BERT-based ABSA）
优先级：⭐⭐⭐⭐⭐（差评累积是不可逆的，早分析早修复是最优策略）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（205 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
差评根因分析器 - ABSA方面级情感分析
基于规则词典 + 统计方法（无需深度学习，可直接运行）
"""
import re
from collections import defaultdict, Counter
from dataclasses import dataclass
from typing import Dict, List, Tuple


# 母婴产品方面词典（可扩展）
ASPECT_KEYWORDS = {
    'product_quality': [
        'quality', 'broken', 'defective', 'cheap', 'flimsy', 'durable',
        'material', 'build', 'crack', 'leak', 'noise', 'loud', 'vibration',
        'suction', 'motor', 'malfunction', 'stopped working', 'fell apart',
        '质量', '破损', '漏液', '断裂', '噪音', '吸力', '马达', '故障'
    ],
    'shipping_packaging': [
        'shipping', 'delivery', 'package', 'arrived', 'damaged', 'box',
        'late', 'slow', 'wrong item', 'missing parts', 'transit',
        '包装', '配送', '损坏', '延迟', '错发', '缺件'
    ],
    'expectation_mismatch': [
        'as described', 'not as pictured', 'misleading', 'false', 'advertised',
        'expected', 'disappointed', 'mislead', 'photo', 'description wrong',
        '描述不符', '图片不符', '虚假', '误导', '期望'
    ],
    'usability': [
        'difficult', 'hard to use', 'confusing', 'instructions', 'manual',
        'setup', 'complicated', 'not intuitive', 'unclear', 'assembly',
        '难用', '操作复杂', '说明书', '安装', '不直观'
    ],
    'comfort_fit': [
        'uncomfortable', 'hurt', 'pain', 'fit', 'size', 'tight', 'loose',
        'ergonomic', 'support', 'strap', 'padding',
        '不舒适', '疼痛', '尺寸', '支撑', '肩带'
    ],
    'safety': [
        'unsafe', 'dangerous', 'toxic', 'certification', 'certified',
        'bpa', 'fda', 'cpsc', 'recall', 'hazard',
        '不安全', '有毒', '认证', '危险', '召回'
    ]
}

NEGATIVE_INDICATORS = [
    'not', "don't", "doesn't", "didn't", "won't", "can't", "isn't",
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'disappointed',
    'avoid', 'waste', 'regret', 'return', 'refund', 'broken', 'failed',
    '差', '坏', '劣质', '退货', '糟糕', '失望', '避坑', '不好'
]

SEVERITY_WEIGHTS = {
    'product_quality': 3.0,
    'safety': 4.0,
    'shipping_packaging': 2.0,
    'expectation_mismatch': 1.5,
    'usability': 1.8,
    'comfort_fit': 2.0
}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1903.07761，但该号在 arXiv 上是《A Parallel Data Compression Framework for Large Scale 3D Scientific Data》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：至少 50 条差评文本（卡页口径无需标注）、方面关键词词典；多市场场景另需各市场差评集合与市场标签。

**输出**：修复优先级清单（含各根因占比、代表性差评示例与预期评分提升估算）与多市场差异化改进建议；供产品经理排定改版顺序与资源投入。

## 执行步骤

1. 收集目标 SKU 的低分差评文本
2. 用方面词典把差评匹配到质量、噪音、吸力、漏液等方面
3. 统计各根因占比并排序
4. 附上代表性差评示例与修复优先级清单
5. 对比不同市场差评主题，输出差异化改进建议

## 边界与不做

- 数据不满足：差评不足 50 条时占比统计不稳定，先积累样本再排序。
- 何时不用：跨 SKU 维度统计用「评论结构化抽取」，因果判断用「因果VOC归因」。
- 能力边界：给出修复优先级而非具体工程方案，也不验证修复后的实际效果。
- 安全边界：结论须附原文并保护差评数据隐私，误判风险靠人工验证兜底。

## 技能关联

- **前置**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Few-Shot-Review-Classification.html、Skill-Few-Shot-Review-Classification、Skill-Review-Defense-Vine-Optimizer.html、Skill-Review-Defense-Vine-Optimizer、Skill-Review-Velocity-Anomaly-Detector.html、Skill-Review-Velocity-Anomaly-Detector
- **延伸**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Review-Defense-Vine-Optimizer.html、Skill-Review-Defense-Vine-Optimizer
- **可组合**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Negative-Review-Root-Cause-Analyzer

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-Negative-Review-Root-Cause-Analyzer`