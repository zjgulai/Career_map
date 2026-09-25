---
name: "p2s-cognitive-load-ux-optimizer"
title: "认知负荷UX优化器 — 信息架构与注意力资源管理"
description: "触发词：认知负荷、信息架构、注意力分配、热力图分析、页面改版。何时不用：要测主图与标题元素差异用「Listing 转化率 A/B 测试优化器」；要对落地页元素组合寻优用「独立站落地页 CRO」。安全边界：眼动与页面行为数据须脱敏并取得用户知情同意；样本偏差（如只覆盖 iOS 用户）须在结论中说明，不得直接外推到全量用户。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 可用性验证"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Cognitive-Load-UX-Optimizer"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "量出首页和详情页哪一块最费脑子，把模块砍到用户不用反复决策，转化率和停留时长一起涨。"
user_try: "试试：用首页热力图和点击序列算出高认知负荷区域，给出模块精简与信息节奏的重排方案。"
whenToUse: "当问题出在页面信息架构与决策成本（用户反复跳转、跳出率高）时用本技能；要测主图、标题等具体元素的转化差异用「Listing 转化率 A/B 测试优化器」；要对落地页元素组合寻优用「独立站落地页 CRO」。"
workflow: "采集热力图、点击序列与转化漏斗数据 → 分别计算内在负荷、外在负荷与相关负荷 → 标注高负荷区域（卡页量级 L_e>1.5） → 给出精简模块与信息呈现节奏的重排方案 → 用 A/B 验证转化率与停留时长变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 认知负荷UX优化器 — 信息架构与注意力资源管理

## ① 解决的问题

产品团队面临母婴APP首页转化率低——认知负荷优化将CTR从2.3%提升至3.8%，年化GMV增量65万元

## ② 核心算法逻辑

认知负荷理论(CLT)将用户界面的信息处理分解为三层负荷量化模型：

## ③ 业务应用场景

- 业务问题：首页日均停留时长仅42秒，用户在商品分类、推荐、优惠券间频繁切换，跳出率达68%。用户研究显示，新手妈妈在首页平均需做4.3次决策才能找到目标商品，认知疲劳导致购买转化率仅2.1%。 - 数据要求：(1)100万+用户的Eye-tracking热力图(采集设备：Tobii Pro Glasses 3)；(2)首页各模块的点击序列日志(30天)；(3)用户年龄/育儿经验/设备类型标签；(4)转化漏斗数据(浏览→加购→支付)；(5)用户情感反馈(NPS、页面停留时长分布)。 - 预期产出：(1)首页认知负荷热力图，标注高负荷区域(L_e>1.5)；(2)重设计首页布局方案(模块从12
三轨验证 | 成本轨：Eye-tracking设备采购12万元，数据标注团队(5人×3月)成本18万元，模型训练与A/B测试周期8周，总成本约38万元 | 合规轨：符合GDPR(用户隐私脱敏处理)、中国《个人信息保护法》(用户知情同意)，Eye-tracking数据不涉及生物识别黑名单 | 风险轨：(1)样本偏差风险(仅采集iOS用户)，概率15%，影响Android转化率预测准确性；(2)季节性波动(孕妇用户在孕期vs产后行为差异大)，概率25%，需分群优化
- 业务问题：详情页平均转化率3.2%，用户在规格选择、评价阅读、物流信息间反复跳转，加购后放弃率达41%。数据显示，用户平均需浏览12.4个评价才能做出购买决策，认知负荷过高导致决策瘫痪。 - 数据要求：(1)50万+商品详情页的用户交互序列(点击、滚动、停留)；(2)商品属性复杂度标签(规格数、评价数、图片数)；(3)用户购买历史与偏好标签；(4)支付转化漏斗(详情页→加购→支付)；(5)用户设备性能数据(屏幕尺寸、网络速度)。 - 预期产出：(1)详情页模块认知负荷评分(规格选择器L_i=2.1、评价区L_e=1.8、物流信息L_e=1.3)；(2)优化方案：(a)规格选择器改为智能推荐

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
角色：母婴跨境电商产品经理/运营负责人
场景：首页转化率低迷(2.1%)、用户流失率高(68%)
方法：应用CLT认知负荷优化器，重设计首页信息架构，精简模块、优化信息呈现节奏
指标改善：转化率从2.1%→3.8%(+81%)，停留时长从42秒→68秒(+62%)，年化GMV增长320万元；商品详情页转化率3.2%→4.8%(+50%)，年化GMV增长580万元；后台报表效率提升77%，年化价值120万元
年化收益：1020万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（179 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy.stats import entropy
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
from collections import defaultdict

# ============ 认知负荷UX优化器 ============

class CognitiveLoadOptimizer:
    """基于CLT的界面认知负荷评分与优化系统"""
    
    def __init__(self, working_memory_capacity=7, intrinsic_threshold=3.0):
        self.wm_capacity = working_memory_capacity
        self.intrinsic_threshold = intrinsic_threshold
        self.scaler = MinMaxScaler()
        
    def calculate_intrinsic_load(self, element_interactions, expertise_level):
        """
        计算内在负荷：任务本身复杂度
        element_interactions: 元素间交互度矩阵 (n_elements, n_elements)
        expertise_level: 用户专业度 (0-1)
        """
        interaction_sum = np.sum(element_interactions)
        expertise_factor = 1 - expertise_level * 0.5  # 专家认知负荷更低
        intrinsic_load = interaction_sum * expertise_factor
        return min(intrinsic_load, 5.0)  # 上界5.0
    
    def calculate_extraneous_load(self, eyetrack_data, navigation_steps, visual_clutter):
        """
        计算外在负荷：设计缺陷导致的额外认知消耗
        eyetrack_data: Eye-tracking热力图 (height, width)
        navigation_steps: 完成任务需要的导航步数
        visual_clutter: 视觉干扰度 (0-1)
        """
        # 计算注视熵(信息论)：熵越高，注意力越分散
        heatmap_flat = eyetrack_data.flatten()
        heatmap_normalized = heatmap_flat / (np.sum(heatmap_flat) + 1e-8)
        fixation_entropy = entropy(heatmap_normalized + 1e-10)
        
        # 外在负荷 = 注视熵 + 导航步数 + 视觉干扰
        extraneous_load = (fixation_entropy / 5.0) + (navigation_steps / 10.0) + visual_clutter
        return min(extraneous_load, 4.0)
    
    def calculate_germane_load(self, intrinsic_load, extraneous_load):
        """
        计算关联负荷：有效学习资源投入
        germane_load = 工作记忆容量 - 内在负荷 - 外在负荷
        """
        germane_load = self.wm_capacity - intrinsic_load - extraneous_load
        return max(germane_load, 0)
    
    def analyze_heatmap(self, eyetrack_heatmap, threshold=2.5):
        """
        分析Eye-tracking热力图，识别高负荷区域
        返回高负荷区域的坐标与强度
        """
        high_load_regions = []
        h, w = eyetrack_heatmap.shape
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户 Eye-tracking 热力图、首页与详情页点击序列日志（卡页示例 30 天）、用户标签（年龄、育儿经验、设备类型）与转化漏斗数据；粒度为页面模块 × 用户分群。

**输出**：页面认知负荷热力图（标注高负荷区域）、模块级负荷评分，以及首页与详情页改版方案；供产品与设计重排信息架构。

## 执行步骤

1. 采集热力图、点击序列与转化漏斗数据
2. 按认知负荷理论分别计算内在、外在与相关负荷
3. 标注高负荷区域并定位让用户反复决策的模块
4. 输出模块精简与信息呈现节奏的重排方案
5. 用 A/B 验证转化率、停留时长与跳出率变化

## 边界与不做

- 数据不满足：没有眼动、点击序列或漏斗数据时算不出模块级负荷，只有主观意见就不要套用本技能。
- 何时不用：要测主图与标题等元素差异用「Listing 转化率 A/B 测试优化器」；要对落地页元素组合寻优用「独立站落地页 CRO」。
- 能力边界：只给负荷评估与改版方案，不做前端实现，也不保证卡页口径的转化提升幅度。
- 安全边界：眼动与行为数据须脱敏并取得用户知情同意；样本偏差必须在结论中说明，不得直接外推到全量用户。

## 技能关联

- **前置**：Skill-A-B-Testing-Framework、Skill-AI-Carbon-Footprint-Optimizer.html、Skill-AI-Carbon-Footprint-Optimizer、Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-Emotion-Recognition-AI、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Personalization-Engine-Maternity、Skill-User-Behavior-Analytics、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-A-B-Testing-Framework、Skill-AI-Carbon-Footprint-Optimizer.html、Skill-AI-Carbon-Footprint-Optimizer、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-Emotion-Recognition-AI、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Personalization-Engine-Maternity、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-A-B-Testing-Framework、Skill-AI-Carbon-Footprint-Optimizer.html、Skill-AI-Carbon-Footprint-Optimizer、Skill-Emotion-Recognition-AI、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Cognitive-Load-UX-Optimizer

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：11-AI人文　·　源卡：`Skill-Cognitive-Load-UX-Optimizer`