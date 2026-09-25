---
name: "p2s-relate-rl-ad-text-generation"
title: "RELATE强化学习广告文案生成 — RL端到端优化CTCVR的LLM广告创意框架"
description: "触发词：广告文案生成、文案转化率优化、强化学习文案、候选文案批量生成、文案 A/B 素材。何时不用：只审文案合规与宣称风险用品牌安全类技能，只做投放实验设计与分流用广告实验类技能，本技能负责用转化信号训练并生成文案。安全边界：奖励模型须内置广告法关键词黑名单，禁止绝对化用语与无认证支撑的功效宣称，历史点击与转化数据须匿名化脱敏后使用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 广告实验"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-RELATE-RL-Ad-Text-Generation"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用真实转化数据训练文案生成模型，让 AI 写出的广告文案不只是通顺，而是更能带来点击和成交。"
user_try: "试试：用我们过去 1000 条广告文案和对应的 CTR、CTCVR 数据，训练一个以成交率为目标的文案生成器，先出 10 条候选文案。"
whenToUse: "有历史广告文案加转化标签、要按真实转化率批量产出候选文案时用本技能；只做文案合规审查用品牌安全类技能，只做投放分流与显著性判定用广告实验类技能。"
workflow: "导出历史文案与 CTR、CTCVR 标签 → 用高低转化文案训练奖励模型 → 以奖励分数做强化学习迭代生成 → 用产品中心偏好约束保留核心卖点 → 输出多条候选文案供 A/B 测试"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RELATE强化学习广告文案生成 — RL端到端优化CTCVR的LLM广告创意框架

## ① 解决的问题

AI生成的"流畅专业"广告文案转化率提升不明显因为优化了语言质量而非真实转化——RELATE用RL直接把CTCVR作为奖励信号端到端训练LLM，在线部署CTCVR提升+9.19%（2026 arXiv:2602.11780）

## ② 核心算法逻辑

反直觉洞察：大多数LLM生成广告文案是用"语言质量"来评估（流畅度、相关性、语法），但实际上广告主关心的是CTCVR（点击转化率）——文案能不能让人点击并最终购买。这两个目标往往背离：AI生成"流畅专业"的文案不一定转化好，有些转化最好的文案语言风格甚至有点"土"。RELATE的核心：把CTCVR直接作为RL奖励信号，端到端训练LLM生成最大化真实转化率的文案。

## ③ 业务应用场景

场景A：吸奶器Amazon SP广告文案自动生成
- 业务问题：某母婴卖家手工撰写广告文案，每个SKU1-2条，A/B测试周期长（7-14天）；LLM辅助生成的文案流畅但转化率提升不明显（平均+1.2% CTR） - 数据要求：历史广告文案+CTR/CTCVR标签、产品标题/五点/描述 - RELATE应用： 1. 用历史高/低CTCVR文案训练奖励模型（二分类） 2. RL优化：生成文案→奖励模型评分→梯度更新 3. PCPO约束：确保"静音"、"双边"等核心产品特点不被省略 4. 生成5-10条多样化文案供A/B测试 - 预期产出：文案CTCVR相对提升+9.19%（论文数据），母婴类目预估月GMV增量约$3-8万
三轨验证： - 成本：数据采集需导出至少1000条历史广告文案+CTR/CTCVR标签（广告后台可获取），标注成本约$500-1000；奖励模型训练需GPU（单卡A100约$2/小时，训练周期约3-5天）；RL微调LLM需额外算力约$2000-5000；人力投入（数据工程师+算法工程师）约2-3人月，总成本约$1.5-3万。 - 合规：Amazon广告政策禁止虚假或误导性声明（如"医院级"需有认证支撑），PCPO约束可强制过滤；GDPR要求用户数据匿名化处理，历史CTR数据需脱敏；广告法禁止绝对化用语（如"最好""第一"），需在奖励模型中加入关键词黑名单惩罚项。 - 风险：高CTCVR文案可能

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月广告预算$5万，文案CTCVR提升+9.19%，等效月GMV增量约$4.6万；系统建设+数据标注约$3万，ROI>1500%
实施难度：⭐⭐⭐⭐☆（需要足够的历史CTR标注数据训练奖励模型，RL微调LLM有技术门槛；可先用规则奖励模型降低门槛）
优先级：⭐⭐⭐⭐⭐（广告文案是母婴出海ROI最直接的可控变量之一，+9.19% CTCVR是非常显著的提升）
适用规模：月广告预算>$2万、有>1000条历史文案+CTR数据的卖家
数据依赖：历史广告文案+对应CTR/CTCVR标签（从广告后台可导出）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（180 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/relate_rl_ad_text_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-RELATE-RL-Ad-Text-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RELATE强化学习广告文案生成框架
基于 arXiv:2602.11780 (2026)
RL端到端优化CTCVR + 产品中心偏好优化
"""
import numpy as np
import warnings
warnings.filterwarnings('ignore')


class CTCVRRewardModel:
    """
    CTCVR代理奖励模型（简化版）
    将传统CTR预估转化为二分类（是否高CTCVR文案）
    """
    def __init__(self):
        # 简化特征权重（生产环境用深度神经网络）
        self.weights = {
            'has_benefit': 0.3,       # 包含利益点
            'has_number': 0.2,        # 包含具体数字
            'has_action': 0.2,        # 包含行动号召
            'has_product_feat': 0.2,  # 包含产品特性
            'length_ok': 0.1,         # 长度适中
        }

    def score(self, text, product_keywords=None):
        """
        评估文案的预期CTCVR分数 (0-1)
        """
        if product_keywords is None:
            product_keywords = []

        features = {}

        # 利益点检测
        benefit_words = ['free', '免费', 'safe', '安全', 'quiet', '静音',
                        'hospital-grade', '医院级', 'BPA-free', 'double', '双边']
        features['has_benefit'] = any(w.lower() in text.lower() for w in benefit_words)

        # 数字特征
        import re
        features['has_number'] = bool(re.search(r'\d+', text))

        # 行动号召
        cta_words = ['buy', 'get', 'shop', 'try', 'order', '立即', '购买', '抢购']
        features['has_action'] = any(w.lower() in text.lower() for w in cta_words)

        # 产品特性覆盖度
        if product_keywords:
            covered = sum(1 for kw in product_keywords if kw.lower() in text.lower())
            features['has_product_feat'] = covered / len(product_keywords) > 0.4
        else:
            features['has_product_feat'] = True

        # 长度适中
        features['length_ok'] = 50 <= len(text) <= 300

        # 加权求和
        score = sum(self.weights[k] * (1.0 if v else 0.0) for k, v in features.items())
        return float(score)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.11780 — RELATE: A Reinforcement Learning-Enhanced LLM Framework for Advertising Text Generation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：至少千条量级的历史广告文案及其 CTR/CTCVR 标签（广告后台可导出，需脱敏），产品标题、五点描述与详情文案；奖励模型与微调需要 GPU 算力。

**输出**：5 至 10 条多样化广告文案候选，含预测 CTCVR 分数与排序，供投放团队直接做 A/B 测试；卡页口径为论文在线部署 CTCVR 相对提升 9.19%。

## 执行步骤

1. 导出历史广告文案与对应 CTR、CTCVR 标签并完成脱敏清洗。
2. 用高转化与低转化文案训练二分类奖励模型。
3. 以奖励模型评分为信号做强化学习优化，逐轮生成文案并更新策略。
4. 用产品中心偏好约束保证核心产品特点不被省略，并过滤违规用语。
5. 输出多条多样化文案并附评分排序，交付投放团队做 A/B 测试。

## 边界与不做

- 历史文案与转化标签不足千条量级、或广告后台拿不到 CTCVR 标签时不要用，奖励模型学不出稳定信号。
- 能力边界：本技能交付文案候选与预测分，不执行投放、不保证在线增益；9.19% 来自论文在线部署实验，外推到自家类目必须自测。
- 合规红线：文案不得含绝对化用语与无认证支撑的功效宣称，输出前须过关键词黑名单并人工复核。

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-CTR-Ad-Prediction、Skill-Generative-Bidding-MoE.html、Skill-Generative-Bidding-MoE、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-Price-Sensitive-Personalized-Recommendation.html、Skill-Price-Sensitive-Personalized-Recommendation
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-CTR-Ad-Prediction、Skill-Generative-Bidding-MoE.html、Skill-Generative-Bidding-MoE、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution
- **可组合**：Skill-CTR-Ad-Prediction、Skill-Generative-Bidding-MoE.html、Skill-Generative-Bidding-MoE、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-RELATE-RL-Ad-Text-Generation

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：13-广告分析　·　源卡：`Skill-RELATE-RL-Ad-Text-Generation`