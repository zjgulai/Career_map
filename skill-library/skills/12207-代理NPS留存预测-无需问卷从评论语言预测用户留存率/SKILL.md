---
name: "p2s-voc-nps-retention-predictor"
title: "VOC代理NPS留存预测 — 无需问卷从评论语言预测用户留存率"
description: "触发词：代理 NPS、留存预测、评论预测留存、NPS 仪表盘、品牌健康度。何时不用：要看方面级差评明细用「方面级情感分析」，要发现未知主题簇用「BERTopic 主题建模」；本技能只把评论语言折算成留存预测。安全边界：仅使用公开评论数据，不涉及用户隐私；预测结果不构成医疗或营养建议，也不得对外宣称。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 生命周期触达"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-VOC-NPS-Retention-Predictor"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "没有问卷也能估出用户下个月还回不回来：从评论里读出推荐意愿，提前几周给出留存率预测。"
user_try: "试试：用我们最近三个月的评论，预测下个月的留存率区间，并告诉我什么时候该发起留存活动。"
whenToUse: "当没有 NPS 问卷数据、却要提前判断留存走向并安排备货与营销节奏时用；已有可靠问卷口径或要看单条评论情感明细时不用本技能。"
workflow: "按月聚合评论并统计 Promoter、Passive、Detractor 占比 → 用历史评论与留存率配对数据标定 NPS 到留存的映射 → 输出下月留存率预测区间并给出置信范围 → 在仪表盘上于 NPS 下降超阈值时触发品质排查"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC代理NPS留存预测 — 无需问卷从评论语言预测用户留存率

## ① 解决的问题

增长团队面临"无NPS数据却需预测留存"——评论代理NPS将留存预测提前21天给出，同等干预预算下留存提升效率提升30%

## ② 核心算法逻辑

核心问题：NPS（Net Promoter Score）是留存率的强预测指标，但直接收集NPS问卷成本高、响应率低（通常<5%）。

## ③ 业务应用场景

场景A：奶粉品牌月度留存预测 - 业务问题：奶粉品类复购周期约25-30天，月度留存率波动难以提前预警 - 数据要求：月度新增评论≥50条，历史评论和留存率数据对（用于标定） - 预期产出：下月留存率预测区间（如「预测65% ± 5%」），提前21-28天给出，指导备货和营销节奏 - 业务价值：留存率提升1%对应约 5-10万元 年化营收，方向明确后干预效率提升30%
三轨验证： - 成本：显性成本较低。数据采集依赖Amazon/官网评论API（约$0.01/条），计算资源可用单台云服务器（月费约$50-100），人力投入为1名数据分析师每周2小时维护模型。 - 合规：合规风险低。仅使用公开评论数据，不涉及用户隐私信息；NPS预测结果不构成医疗/营养建议，不触碰FDA或广告法红线；GDPR下评论数据属于合法处理范围。 - 风险：次生风险中等。预测结果若被公开可能引发竞品模仿或价格战；若预测偏差较大（如样本量不足时）导致错误备货决策，可能造成库存积压或断货。
场景B：安全座椅品牌NPS监控仪表盘 - 业务问题：安全座椅客单高（$200-500），需要实时了解品牌健康度 - 数据要求：Amazon + 品牌官网评论实时流 - 预期产出：实时Proxy NPS仪表盘，当NPS下降≥10分时自动触发品质排查

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月度留存率预测提前21天给出，可在节奏最好的时机发起留存活动；母婴品牌（月营收100万）留存率提升2%约等于 年化24万元 增量营收；同时省去NPS问卷工具费用约 5-10万元/年
数据要求门槛：需≥50条评论/月才能稳定，小品牌早期可能不够，需聚合历史评论
实施难度：⭐⭐☆☆☆（纯文本分析，无需特殊数据授权）
优先级：⭐⭐⭐⭐☆（中高优，特别适合成熟期品牌的健康度监控）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import re
from sklearn.linear_model import LogisticRegression, LinearRegression

class VOCNPSRetentionPredictor:
    """从评论语言构建代理NPS并预测留存率"""
    
    def __init__(self):
        # NPS语言特征词典
        self.promoter_signals = [
            'highly recommend', 'tell everyone', 'love this', 'best product', 
            'perfect', 'amazing', '强烈推荐', '回购', '买了又买', 'repurchase',
            'five stars', 'exactly what', 'worth every'
        ]
        self.detractor_signals = [
            'do not buy', 'avoid', 'waste of money', 'terrible', 'warn others',
            'never again', 'worst', 'disappointed', '不要买', '踩雷', '坑人',
            'returning', 'refund', 'broken after'
        ]
        self.passive_signals = [
            'okay', 'decent', 'nothing special', 'average', 'fine',
            'does the job', '一般', '还行', 'acceptable', 'as expected'
        ]
        
        # 模拟已标定的NPS→留存率映射（实际需历史数据回归）
        # 线性关系: 留存率 = 0.6 + NPS * 0.004
        self.retention_intercept = 0.60
        self.retention_nps_coeff = 0.004
    
    def _classify_review(self, text, rating=None):
        """将单条评论分类为 Promoter/Passive/Detractor"""
        text_lower = text.lower()
        
        p_score = sum(2 for sig in self.promoter_signals if sig.lower() in text_lower)
        d_score = sum(2 for sig in self.detractor_signals if sig.lower() in text_lower)
        pa_score = sum(1 for sig in self.passive_signals if sig.lower() in text_lower)
        
        # 融合评分（如果有）
        if rating is not None:
            if rating >= 5:
                p_score += 3
            elif rating >= 4:
                p_score += 1
            elif rating <= 2:
                d_score += 3
            elif rating == 3:
                pa_score += 2
        
        total = p_score + d_score + pa_score + 1e-6
        
        return {
            'promoter_prob': p_score / total,
            'detractor_prob': d_score / total,
            'passive_prob': pa_score / total,
            'predicted_class': 'Promoter' if p_score > d_score and p_score > pa_score
                               else 'Detractor' if d_score > p_score and d_score > pa_score
                               else 'Passive'
        }
    
    def compute_proxy_nps(self, reviews):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.03915，但该号在 arXiv 上是《Impact of ageostrophic dynamics on the predictability of Lagrangian trajectories in surface-ocean turbulence》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：月度评论不少于 50 条（含文本与时间），加历史评论与留存率配对数据用于标定；粒度为月，可含 Amazon 与官网等多来源评论流。

**输出**：下月留存率预测区间（含波动范围）、实时代理 NPS 仪表盘与下降告警，供增长与备货团队排节奏。

## 执行步骤

1. 按月聚合评论并计算推荐意愿三类占比
2. 用历史评论与留存配对数据标定映射关系
3. 输出下月留存率预测区间与置信范围
4. 对比月度变化，在下降超阈值时触发品质排查
5. 把预测结果交给备货与留存活动排期

## 边界与不做

- 何时不用：月评论不足 50 条或缺少历史留存配对数据时，需先聚合历史评论
- 能力边界：只给留存预测与预警，不生成留存活动方案，也不替代问卷 NPS 的正式口径

## 技能关联

- **前置**：Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal
- **延伸**：Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal
- **可组合**：Skill-Review-Driven-Growth-Opportunity-Scorer.html、Skill-Review-Driven-Growth-Opportunity-Scorer、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-VOC-NPS-Retention-Predictor

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-NPS-Retention-Predictor`