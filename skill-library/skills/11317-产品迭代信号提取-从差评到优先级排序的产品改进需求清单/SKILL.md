---
name: "p2s-voc-product-iteration-signal-extractor"
title: "VOC产品迭代信号提取 — 从差评到优先级排序的产品改进需求清单"
description: "触发词：差评优先级、改进清单、迭代方向、痛点排序、改进建议抽取。何时不用：要输出带 ROI 排序的行动链用「MAA 评论到行动决策」；要跨竞品找未满足需求与机会得分用「Review Pain-Point Mining」。安全边界：仅使用公开评论数据，改进建议内部闭环、不对外披露优先级排序，也不把评论内容反向识别到个人。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-026"
l3_business: "产品需求定义"
l3_all: "产品需求定义 / 体验分析"
l1_l2_l3: "业务运营/产品与创新/产品需求定义"
p2s_card_id: "Skill-VOC-Product-Iteration-Signal-Extractor"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把上千条差评提炼成带优先级的产品改进清单，还能捞出那些有人提却没人置顶的沉默高频问题。"
user_try: "试试：这 1,200 条 1-3 星差评帮我排出 Top10 待修问题，并给出每个问题的改进方向。"
whenToUse: "已有自家产品差评、要决定下一版本先修什么时用本技能；若要跨竞品找未满足需求并量化机会，用「Review Pain-Point Mining」；若要把结论升级成带 ROI 排序的行动链，用「MAA 评论到行动决策」。"
workflow: "收集 1-3 星差评并标注 ASIN/SKU（建议不少于 200 条） → 按产品方面词典对差评分类 → 分别抽取抱怨声明与「如果能做到 XX 就好了」类改进建议 → 计算各问题的优先级分并排序 → 输出 Top10 问题与具体改进方向"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC产品迭代信号提取 — 从差评到优先级排序的产品改进需求清单

## ① 解决的问题

产品团队面临"千条差评不知从哪改起"——优先级评分将差评分析时间从1周→2小时，精准修复后星级提升0.2-0.3星年化增收50-100万元

## ② 核心算法逻辑

差评中包含两类信息：抱怨声明（"质量差"）和改进建议（"如果能做到XX就好了"）。传统NLP只捕获前者，而实际决策需要后者。

## ③ 业务应用场景

场景A：婴儿推车年度迭代方向确定 - 业务问题：收到1200条差评，产品团队不知道哪些问题最需要下一版本修复 - 数据要求：1-3星差评（建议≥200条），标注ASIN/SKU信息 - 预期产出：Top10产品问题 + 各问题的优先级分 + 具体改进方向建议 - 业务价值：精准修复高优先级问题后，差评率降低20-30%，对应 星级提升0.2-0.3分，转化率提升5-8%，年化约 50-100万元
三轨验证： - 成本：数据采集成本低（直接调用Amazon SP-API获取差评CSV）；计算资源约$50/次（AWS Lambda + Comprehend）；人力投入约2小时/次（产品经理审核输出） - 合规：不触碰Amazon评论政策（仅使用公开评论数据）；不涉及GDPR个人数据（评论为匿名公开数据）；无广告法风险 - 风险：若改进方向被竞品截获（如公开专利/设计变更），可能引发局部价格战；建议改进方案内部闭环，不对外披露具体优先级排序
场景B：吸奶器配件快速迭代 - 业务问题：吸奶器硅胶配件差评集中，但不明确是尺寸/材质/耐用性哪个问题优先修复 - 数据要求：配件ASIN差评 + 主品差评中关于配件的部分 - 预期产出：配件问题按优先级排列：「尺寸不适配（P1）→ 清洗困难（P2）→ 材质硬度（P3）」

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：将1200条差评处理时间从产品团队1周人工阅读→2小时自动分析，节省人力成本约 3万元/次；精准修复Top3问题后，星级提升0.2-0.3星，转化率提升5-8%，年化约 50-100万元
决策质量：相比人工阅读差评，算法确保「沉默的高频问题」（有人提但没人置顶的）不被忽略
实施难度：⭐⭐☆☆☆（基础NLP，可立即部署，无需训练数据）
优先级：⭐⭐⭐⭐⭐（产品迭代核心场景，每个季度都需要执行）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（175 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
from collections import Counter, defaultdict

class VOCProductIterationSignalExtractor:
    """从差评提取可执行的产品迭代信号"""
    
    def __init__(self):
        # 产品方面分类词典（母婴产品）
        self.aspect_keywords = {
            '材质/安全': ['material', 'plastic', 'bpa', 'chemical', 'smell', 'toxic', 
                         '材质', '塑料', '气味', '化学', '安全'],
            '耐用性': ['broke', 'cracked', 'broken', 'fell apart', 'stopped working', 'lasted',
                      '断了', '破了', '坏了', '耐用', '寿命'],
            '尺寸/适配': ['size', 'fit', 'too small', 'too big', 'narrow', 'wide',
                         '尺寸', '太小', '太大', '不适配', '规格'],
            '清洁便利': ['clean', 'wash', 'dishwasher', 'residue', 'mold',
                        '清洗', '清洁', '发霉', '残留', '消毒'],
            '操作体验': ['difficult', 'complicated', 'confusing', 'hard to', 'figured out',
                        '困难', '复杂', '不好用', '难操作'],
            '包装/到货': ['packaging', 'arrived', 'damaged', 'missing', 'wrong item',
                         '包装', '到货', '损坏', '缺件', '发错'],
            '噪音/震动': ['noisy', 'loud', 'vibration', 'quiet', 
                         '噪音', '声音大', '振动'],
            '设计/外观': ['design', 'ugly', 'cheap looking', 'bulky', 
                         '设计', '外观', '太笨重'],
        }
        
        # 情感强度词（从强到弱）
        self.sentiment_intensity = {
            'hate': 1.0, 'terrible': 0.95, 'worst': 0.95, 'disgusting': 0.9, 'scam': 0.9,
            'awful': 0.85, 'horrible': 0.85, 'unacceptable': 0.8, 
            '踩雷': 0.9, '坑人': 0.9, '差评': 0.85, '失望': 0.75,
            'disappointed': 0.7, 'frustrated': 0.65, 'annoyed': 0.6,
            'bad': 0.5, 'poor': 0.5, '不好': 0.5, '差': 0.5,
            'mediocre': 0.3, 'okay': 0.2, '一般': 0.2
        }
        
        # 改进方向模板
        self.improvement_templates = {
            '材质/安全': '升级材质认证（FDA/CE），增强产品安全检测频率',
            '耐用性': '改进关键部件材料强度，增加出厂压力测试标准',
            '尺寸/适配': '扩展尺寸型号覆盖（S/M/L），优化尺寸选购指引',
            '清洁便利': '改进结构设计减少缝隙，增加可拆卸清洁设计',
            '操作体验': '简化操作步骤，优化说明书图示和视频教程',
            '包装/到货': '升级缓冲包装材料，加强仓储质检流程',
            '噪音/震动': '优化马达减震结构，增加静音模式选项',
            '设计/外观': '更新外观设计语言，提升整体质感和颜值',
        }
    
    def extract_aspect(self, text):
        """识别评论中涉及的产品方面"""
        text_lower = text.lower()
        aspects_found = []
        for aspect, keywords in self.aspect_keywords.items():
            if any(kw.lower() in text_lower for kw in keywords):
                aspects_found.append(aspect)
        return aspects_found
    
    def compute_sentiment_intensity(self, text):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.09413，但该号在 arXiv 上是《SPIQA: A Dataset for Multimodal Question Answering on Scientific Papers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：自家产品的 1-3 星差评文本（建议不少于 200 条），需标注 ASIN/SKU 信息；配件类问题还需主品评论中涉及配件的部分。

**输出**：Top10 产品问题清单 + 每个问题的优先级分 + 具体改进方向建议，供产品团队确定下一版本修复顺序（单次分析约 2 小时产出）。

## 执行步骤

1. 收集并清洗 1-3 星差评，标注 ASIN/SKU
2. 用产品方面词典对差评分类
3. 抽取抱怨声明与改进建议两类信号
4. 计算并排序各问题的优先级分
5. 输出 Top10 问题与改进方向

## 边界与不做

- 差评样本过少（如不足 200 条）时优先级不稳定，不适合直接排期
- 只输出改进方向与优先级，不含成本、工期与专利可行性判断
- 结果仅限内部闭环，不对外披露优先级排序，避免被竞品截获改进方向

## 技能关联

- **前置**：Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-Review-Helpfulness-Prediction.html、Skill-Review-Helpfulness-Prediction、Skill-Review-Temporal-Trend-Mining.html、Skill-Review-Temporal-Trend-Mining、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **延伸**：Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-Review-Temporal-Trend-Mining.html、Skill-Review-Temporal-Trend-Mining、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **可组合**：Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction、Skill-VOC-Product-Iteration-Signal-Extractor

---

> 分类：业务运营/产品与创新/产品需求定义　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Product-Iteration-Signal-Extractor`