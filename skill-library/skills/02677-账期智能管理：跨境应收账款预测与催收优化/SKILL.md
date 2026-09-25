---
name: "p2s-accounts-receivable-intelligence"
title: "Accounts Receivable Intelligence — 账期智能管理：跨境应收账款预测与催收优化"
description: "触发词：应收账款、回款概率预测、逾期催收、账期管理、买家风险画像。何时不用：预测平台回款到账时间（Reserve、A-to-Z 挂起）时用「Amazon 回款周期预测」；只压缩现金转换周期时用「现金转换周期优化」。安全边界：催收动作须符合法律与平台规则，禁止骚扰或恐吓；欧盟买家数据不得用于未经授权的信用评分，涉个人信息须脱敏。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-014"
l3_business: "资金预测"
l3_all: "资金预测 / 差异追踪"
l1_l2_l3: "经营管理/财务与合规/资金预测"
p2s_card_id: "Skill-Accounts-Receivable-Intelligence"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "提前认出哪些买家会拖账，把催收力气花在高风险账款上，逾期率和坏账一起降。"
user_try: "试试：用我的历史账款数据给每个 B2B 买家的回款风险打分，输出这周的催收优先级清单。"
whenToUse: "B2B 账期交易需要预测每笔回款概率与时间、排催收优先级时用；只预测平台侧回款到账时间时用回款周期类技能；只做 CCC 优化时用现金转换周期类技能。"
workflow: "汇总发票与买家回款历史 → 抽取买家风险特征并训练回款预测 → 生成高风险账款与催收行动清单 → 交财务团队按优先级跟进并回收结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Accounts Receivable Intelligence — 账期智能管理：跨境应收账款预测与催收优化

## ① 解决的问题

当跨境 B2B 账期交易导致应收账款逾期率高达 15% 时，ML 账期智能管理预测每笔回款概率和时间、提前锁定高风险账款主动催收，将逾期率降至 8%，显著改善现金流周期并减少坏账损失。

## ② 核心算法逻辑

手动账期管理 vs AI 智能管理：

## ③ 业务应用场景

业务痛点：有 15 个 B2B 批发买家，约定 NET-30 账期，但实际平均回款 42 天，逾期率 15%。某些买家季节性地拖延（年末关账）。AI 系统提前识别高风险账款，给财务团队明确的行动清单。
业务价值： - 逾期率从 15% 降到 8%（每年少损失 7% 的应收账款） - 现金流改善（提前催收 → 加快回款） - 财务人员效率提升（只跟进高风险账款） - 年化 ROI：¥15-40 万（加快现金流 + 减少坏账）
三轨验证： - 成本：数据采集（历史账款数据清洗与整合，约 2 人周）、XGBoost 模型训练与部署（云计算资源约 ¥500/月）、催收自动化开发（约 4 人周）。总初始投入约 ¥3-5 万。 - 合规：催收行为需遵守《民法典》及《商业银行信用卡业务监督管理办法》中关于债务催收的规范，不得使用暴力、恐吓、骚扰等非法手段。跨境场景需遵守 GDPR（欧盟买家数据不得用于未经授权的信用评分）。Amazon 政策不直接约束 B2B 线下账期，但若通过 Amazon Business 交易，需遵守其支付条款。 - 风险：过度催收可能导致优质买家流失（误伤低风险但临时资金周转的客户）；模型依赖历史数据，

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：逾期率 15%→8%；现金流提前回笼；年化 ¥15-40 万
实施难度：⭐⭐⭐☆☆（需要历史账款数据；XGBoost 训练约 2-3 周；催收自动化约 4 周）
优先级评分：⭐⭐⭐⭐⭐（完全空白的 B2B 财务管理场景；填补 运营财务↔因果推断↔风控 弱连接）
评估依据：B2B 电商账期逾期率行业均值 10-20%；AI 预测催收将逾期率降低 30-50% 已有金融行业验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（175 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/23-运营财务/accounts_receivable_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Accounts-Receivable-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Accounts Receivable Intelligence
账期智能管理：逾期预测 + 差异化催收策略
"""
import numpy as np
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class Invoice:
    invoice_id: str
    buyer_id: str
    amount_usd: float
    issue_date: str
    due_date: str
    payment_terms_days: int = 30


@dataclass
class BuyerProfile:
    buyer_id: str
    name: str
    historical_invoices: list   # [{'due_days': 30, 'actual_days': 35, 'amount': 5000}]
    region: str = 'US'
    relationship_years: float = 1.0


def compute_buyer_risk_features(buyer: BuyerProfile) -> dict:
    """从历史记录计算买家风险特征"""
    if not buyer.historical_invoices:
        return {'avg_delay': 0, 'delay_std': 0, 'on_time_rate': 1.0,
                'avg_amount': 0, 'trend': 0}

    delays = [inv['actual_days'] - inv['due_days'] for inv in buyer.historical_invoices]
    on_time = sum(1 for d in delays if d <= 2) / len(delays)  # ≤2天算准时

    # 趋势：近3笔 vs 历史均值
    recent = np.mean(delays[-3:]) if len(delays) >= 3 else np.mean(delays)
    overall = np.mean(delays)
    trend = recent - overall  # 正=最近变差，负=最近改善

    return {
        'avg_delay': round(float(np.mean(delays)), 1),
        'delay_std': round(float(np.std(delays)), 1),
        'on_time_rate': round(on_time, 3),
        'avg_amount': round(np.mean([inv['amount'] for inv in buyer.historical_invoices]), 0),
        'trend': round(trend, 1),
    }


def predict_overdue_probability(invoice: Invoice, buyer: BuyerProfile) -> dict:
    """预测账款逾期概率"""
    features = compute_buyer_risk_features(buyer)

    # 逾期风险因子（规则加权，生产用 XGBoost）
    risk = 0.0

    # 历史逾期率
    if features['on_time_rate'] < 0.7:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.08234，但该号在 arXiv 上是《Model Predictive Control For Mobile Manipulators Based On Neural Dynamics(Extended version)》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：发票台账（发票号、买家、金额、开票日、到期日、账期）与买家历史回款记录（到期天数与实际天数）、买家地区、合作年限；粒度：发票级与买家级。

**输出**：每笔账款的回款概率与预计到账时间、买家风险分层与催收行动清单，供财务团队按优先级跟进。

## 执行步骤

1. 汇总发票台账与买家历史回款记录
2. 计算买家风险特征（平均延迟、延迟波动、准时率、趋势）
3. 预测每笔账款的回款概率与预计到账日
4. 按风险分层生成催收优先级清单
5. 输出高风险账款清单并跟踪催收结果

## 边界与不做

- 数据不满足时不用：历史回款记录不足或账期条款未结构化时，风险特征不稳定，不宜据此强力催收。
- 能力边界：只做风险预测与清单排序，不代替法律催收、不自动发送催收函；误伤优质买家的风险需人工复核。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-FX-Hedging-Strategy.html、Skill-FX-Hedging-Strategy、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Multicurrency-FX-Hedging.html、Skill-Multicurrency-FX-Hedging、Skill-Supply-Chain-Finance-Risk-Modeling.html、Skill-Supply-Chain-Finance-Risk-Modeling、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-FX-Hedging-Strategy.html、Skill-FX-Hedging-Strategy、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Multicurrency-FX-Hedging.html、Skill-Multicurrency-FX-Hedging、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-FX-Hedging-Strategy.html、Skill-FX-Hedging-Strategy、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Accounts-Receivable-Intelligence

---

> 分类：经营管理/财务与合规/资金预测　·　技术族：23-运营财务　·　源卡：`Skill-Accounts-Receivable-Intelligence`