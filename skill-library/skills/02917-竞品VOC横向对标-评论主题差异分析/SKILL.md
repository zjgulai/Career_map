---
name: "p2s-competitive-voc-benchmarking"
title: "Competitive VOC Benchmarking — 竞品VOC横向对标（评论主题差异分析）"
description: "触发词：竞品对标、评论主题差异、竞争图谱、差异化优势、雷达图。何时不用：要从未满足需求算选品机会得分用「跨竞品评论选品机会评分」；要把竞品差评转成新品机会分用「VOC-New-Product-Gap-Scoring」。安全边界：只使用竞品公开评论数据、不涉及商业机密；评论者不代表全体用户，解读须标注样本偏差。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 市场机会评估"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Competitive-VOC-Benchmarking"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把自有品牌和主要竞品的评论主题放在一起比，看出哪些维度已经领先、哪些维度竞品做得好而自己差评多。"
user_try: "试试：把我们和前三名竞品的奶瓶评论做主题对标，输出竞争力雷达图和改进优先级清单。"
whenToUse: "要判断某个差评是行业普遍问题还是自家独有缺陷、并需要差异化优势清单时用本技能；要从竞品评论里算选品机会得分，用「跨竞品评论选品机会评分」或「VOC-New-Product-Gap-Scoring」。"
workflow: "收集自有品牌与竞品评论（各 500 条以上） → 用主题聚类提取双方评论主题分布 → 计算各主题在双方的正负情感比例与差距 → 输出竞争力对比雷达图、差异化优势与改进优先级清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitive VOC Benchmarking — 竞品VOC横向对标（评论主题差异分析）

## ① 解决的问题

产品团队面临"不知道自有品牌在哪些维度优于竞品哪些落后"——竞品VOC横向对标将差异化机会识别准确率提升60%，年化指导产品迭代价值20-40万元

## ② 核心算法逻辑

通过对比自有品牌与主要竞品的评论主题分布，识别竞争优势（自有品牌差评少的维度）和改进机会（竞品好评多但自有品牌差评多的维度）。使用BERTopic聚类提取主题，计算各主题的正负情感比例，输出竞争图谱。

## ③ 业务应用场景

场景1：婴儿奶瓶与前3名竞品VOC对标 - 业务问题：只看自身评论无法判断'防胀气功能'是否是行业普遍问题还是自身独有缺陷 - 数据要求：自有品牌评论 + 竞品评论（各500条以上） - 预期产出：各维度竞争力对比雷达图 + 差异化优势 + 改进优先级清单 - 业务价值：精准识别差异化机会，指导产品迭代，年化价值20-40万元
**三轨验证**： - 成本：竞品评论爬取需遵守平台服务条款 - 合规：使用竞品公开评论数据，不涉及商业机密 - 风险：样本偏差：评论者不代表所有用户，需注意解读

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：精准识别差异化机会，指导产品迭代，年化价值20-40万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：精准识别差异化机会，指导产品迭代，年化价值20-40万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（27 行）。**下面 27 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **27 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，27 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from collections import Counter

def competitive_topic_comparison(own_reviews: list, competitor_reviews: list,
                                   topics: list) -> dict:
    def score(reviews, topic):
        matches = [r for r in reviews if topic.lower() in r.lower()]
        return len(matches) / len(reviews) if reviews else 0
    
    comparison = {}
    for topic in topics:
        own_rate = score(own_reviews, topic)
        comp_rate = score(competitor_reviews, topic)
        comparison[topic] = {
            "own": round(own_rate, 3),
            "competitor": round(comp_rate, 3),
            "gap": round(own_rate - comp_rate, 3),
            "advantage": own_rate > comp_rate,
        }
    return comparison

own = ["防胀气效果好", "清洗方便", "防胀气设计赞", "泄漏问题", "材质安全"]
comp = ["漏液问题", "防胀气一般", "清洗不方便", "价格贵", "品质好"]
result = competitive_topic_comparison(own, comp, ["防胀气", "清洗", "漏液"])
for topic, data in result.items():
    print(f"{topic}: 自有={data['own']:.0%} 竞品={data['competitor']:.0%} {'↑优势' if data['advantage'] else '↓劣势'}")
assert "防胀气" in result
print("[✓] Competitive VOC Benchmarking 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：自有品牌评论 + 主要竞品评论，各方不少于 500 条，需为同一品类、可比时间窗内的评论文本。

**输出**：各维度竞争力对比雷达图、差异化优势清单与改进优先级清单，供产品团队判断哪些维度领先、哪些需要追赶。

## 执行步骤

1. 收集自有与竞品评论并对齐品类口径
2. 用主题聚类提取双方评论主题
3. 计算各主题的正负情感比例与差距
4. 标注优势维度与劣势维度
5. 输出竞争力雷达图与改进优先级清单

## 边界与不做

- 竞品评论量不足（少于 500 条）或双方评论时间窗不一致时不适用，主题差异会被样本偏差主导
- 输出的是主题层面的相对差异，不含销量与利润影响测算
- 评论者不代表全体用户，解读时必须标注样本偏差；使用竞品公开评论不得涉及商业机密

## 技能关联

- **可组合**：Skill-Competitive-VOC-Benchmarking

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：07-NLP-VOC　·　源卡：`Skill-Competitive-VOC-Benchmarking`