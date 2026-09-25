---
name: "p2s-customer-journey-analytics"
title: "Customer Journey Analytics — 用户旅程分析：全链路转化漏斗诊断与优化"
description: "触发词：用户旅程分析、转化漏斗诊断、流失节点定位、路径转化率、页面级漏斗。何时不用：只做关键词维度展示到购买的分层拆解时用「搜索漏斗分归因」；只做标准漏斗节点计数与行为路径统计时用「用户漏斗与行为路径分析」。安全边界：会话日志含会话与设备标识，采集与留存须获授权并去标识化，不得用于未授权的个体识别。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Customer-Journey-Analytics"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "看清独立站用户在哪一步流失、哪类路径最容易成交，把优化预算投到最有价值的那个节点。"
user_try: "试试：我的独立站转化率只有2.1%，用会话日志找出关键流失节点，给出高效型、比较型、犹豫型路径占比和优化优先级。"
whenToUse: "需要在会话路径层面找出流失节点、区分高效路径与犹豫路径并给出优化优先级时用本技能；只做标准漏斗节点到达与退出计数时用「用户漏斗与行为路径分析」；只做关键词维度五层转化拆解时用「搜索漏斗分归因」；要给路径边补意图语义标签时用「Session意图漂移建模」。"
workflow: "接入会话级行为日志与转化结果，按session_id还原页面访问顺序 → 计算各节点到达、转化与退出指标，得到分层漏斗 → 按典型路径模板统计各路径转化率，区分高效路径与犹豫路径 → 标记关键流失节点并把用户分为高效型、比较型、犹豫型 → 按节点改进ROI排序输出优化优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Customer Journey Analytics — 用户旅程分析：全链路转化漏斗诊断与优化

## ① 解决的问题

独立站转化率2.1%低于行业3.5%但不知道哪个环节在流失用户——用户旅程分析找到关键流失节点并识别高效路径vs犹豫路径，精准优化后转化率提升30-50%年化GMV增益20-60万元

## ② 核心算法逻辑

简单漏斗分析 vs 旅程分析：

## ③ 业务应用场景

业务问题：独立站转化率 2.1%，低于行业均值 3.5%。运营不知道是哪个环节出了问题，尝试了很多优化但效果有限。用旅程分析找到真正的瓶颈。
数据要求： - 用户行为日志（session_id, page_type, timestamp, action） - 转化结果（是否完成购买） - 渠道来源（UTM参数）
预期产出： - 各典型用户旅程路径的转化率 - 关键流失节点：哪步流失率最高 - 用户类型分类：高效型/比较型/犹豫型各占比 - 优化优先级：改进哪个节点 ROI 最高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
精准找到转化瓶颈（vs 猜测）：优化效率提升 3-5 倍
转化率提升 30-50%（从 2.1% → 3-3.5%）：月增收 ¥5-15 万
用户类型识别：针对性运营策略，避免浪费
年化综合 ROI：¥20-60 万
实施难度：⭐⭐☆☆☆（用户行为日志收集 1-2 周；分析逻辑 2 周；需要前端埋点基础设施）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/customer_journey_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Customer-Journey-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Customer Journey Analytics
用户旅程分析：转化漏斗 + 路径识别 + 流失诊断
"""
import numpy as np
from collections import defaultdict, Counter


PAGE_TYPES = ['landing', 'category', 'search', 'product', 'cart', 'checkout', 'purchase', 'exit']


def generate_journey_data(n_sessions: int = 500, seed: int = 42):
    """生成模拟用户旅程数据"""
    np.random.seed(seed)
    sessions = []

    # 典型路径模式
    path_templates = [
        # (路径, 基础概率, 最终转化率)
        (['landing', 'search', 'product', 'cart', 'checkout', 'purchase'], 0.20, 0.75),
        (['landing', 'category', 'product', 'cart', 'checkout', 'purchase'], 0.15, 0.65),
        (['landing', 'product', 'exit'], 0.25, 0.0),
        (['landing', 'search', 'product', 'exit'], 0.20, 0.0),
        (['landing', 'category', 'product', 'product', 'cart', 'exit'], 0.12, 0.0),
        (['landing', 'product', 'cart', 'checkout', 'purchase'], 0.08, 0.85),  # 高效转化
    ]

    for i in range(n_sessions):
        # 选择路径模板
        probs = [t[1] for t in path_templates]
        probs = [p / sum(probs) for p in probs]
        template_idx = np.random.choice(len(path_templates), p=probs)
        template, _, conv_rate = path_templates[template_idx]

        # 确定是否转化
        converted = np.random.random() < conv_rate

        # 如果不转化，在某个节点提前退出
        if not converted and 'purchase' in template:
            exit_point = np.random.randint(len(template) - 2, len(template))
            path = template[:exit_point] + ['exit']
        else:
            path = template

        sessions.append({
            'session_id': f'S{i:04d}',
            'path': path,
            'converted': 'purchase' in path,
            'channel': np.random.choice(['organic', 'paid', 'email', 'direct'], p=[0.3,0.35,0.2,0.15]),
        })

    return sessions


def compute_funnel_metrics(sessions: list) -> dict:
    """计算漏斗各节点指标"""
    page_reach = defaultdict(int)
    page_conversion = defaultdict(int)
    page_exit = defaultdict(int)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.08234，但该号在 arXiv 上是《Model Predictive Control For Mobile Manipulators Based On Neural Dynamics(Extended version)》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户行为日志（session_id、page_type、timestamp、action，按会话时序排列）、转化结果（是否完成购买）、渠道来源（UTM参数）；页面类型需覆盖落地页、分类页、搜索页、商品页、购物车、结算、购买、退出；格式为会话级事件流，示例规模500会话可跑通，实际依赖前端埋点基础设施（收集周期约1至2周）。

**输出**：各典型旅程路径的转化率、关键流失节点（流失率最高的步骤）、用户类型分类（高效型、比较型、犹豫型各占比）与优化优先级排序；以结构化漏斗指标与路径清单交付，供独立站运营与增长团队安排优化排期。

## 执行步骤

1. 汇总会话级行为日志并与转化结果、UTM渠道来源关联
2. 按session_id还原页面访问序列并计算各节点漏斗指标
3. 识别典型路径模板并统计各路径的转化率
4. 标记流失率最高的节点并统计同类路径占比
5. 划分高效型、比较型、犹豫型用户并输出占比
6. 按节点改进ROI排序输出优化优先级清单

## 边界与不做

- 数据不满足：缺少会话级行为日志、页面类型或转化结果标记，或没有UTM渠道来源时只能做粗粒度统计；先补齐前端埋点（约1至2周）再分析。
- 何时不用：只做关键词维度展示、点击、加购、购买分层拆解时用「搜索漏斗分归因」；只做标准漏斗节点计数与行为路径统计时用「用户漏斗与行为路径分析」；要给路径标注意图语义时用「Session意图漂移建模」。
- 能力边界：输出流失诊断与优化优先级建议，不替代埋点与实验平台，不自动改页面或上线A/B实验；卡页所述转化率提升30%至50%为优化后的预估结果，需实测验证。

## 技能关联

- **前置**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Peak-End-Rule-Customer-Experience.html、Skill-Peak-End-Rule-Customer-Experience、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Peak-End-Rule-Customer-Experience.html、Skill-Peak-End-Rule-Customer-Experience、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift
- **可组合**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-Peak-End-Rule-Customer-Experience.html、Skill-Peak-End-Rule-Customer-Experience、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Customer-Journey-Analytics

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-Customer-Journey-Analytics`