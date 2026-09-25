---
name: "p2s-click-fraud-detection"
title: "Click Fraud Detection（广告刷量检测）"
description: "触发词：点击欺诈、刷量检测、CTR 异常、IP 集中、退款申诉、无效点击过滤。何时不用：点击与转化同步波动时属正常市场变化；没有 IP 或设备维度数据时无法判断集中度。安全边界：需遵守反不正当竞争与消费者权益相关法规并留存审计日志，误杀需人工复核，检测结果不得用于攻击或报复竞品。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 安全事件处理"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Click-Fraud-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用多信号异常检测识别刷量点击，量化无效花费并支持向平台申请退款。"
user_try: "试试：FB 广告 CTR 突然从 2.1% 涨到 8.5% 但转化崩了，帮我判断是不是刷量。"
whenToUse: "出现 CTR 暴涨、转化暴跌、点击集中在少数 IP 等异常时用本技能；点击与转化同步变化时属正常波动；缺少 IP 维度数据时先补埋点。"
workflow: "汇总分时点击、CTR、跳出率与 IP 频次数据 → 检测 CTR 尖峰、跳出率异常与 IP 集中度 → 多信号融合判定是否为刷量 → 量化无效点击数与对应花费 → 整理证据向平台申请退款并部署实时过滤"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Click Fraud Detection（广告刷量检测）

## ① 解决的问题

竞品对母婴广告发动 IVT 攻击，FB 广告 CTR 虚高 8.5% 但转化率跌至 0.1%，月广告预算 30% 被无效点击消耗——时序异常检测实时识别刷量 IP 并向平台申请退款，年均挽回 6-15 万元

## ② 核心算法逻辑

检测广告点击中的无效流量（IVT）——Bot 点击、竞品恶意点击、重复点击。用时间序列异常 + 行为模式识别。

## ③ 业务应用场景

FB 吸奶器广告突然 CTR 从 2.1% 飙升到 8.5%，但转化率从 3% 降到 0.1%。检测到 85% 点击来自 3 个 IP 段且 99% bounce。标记为 IVT 攻击→向 FB 申请退款 $2,400。后续部署实时 IVT 过滤，月减少无效花费 $500-1,000。
**三轨验证** | 成本轨：月均成本3,200元（AI模型API调用费1,500元/月、数据标注人工2小时/天×22天=44小时×30元/小时=1,320元/月、服务器存储400元/月），ROI=8万/3,200=25倍 | 合规轨：符合《电商法》第十七条反不正当竞争规定、《消费者权益保护法》第八条商家诚信义务、跨境电商需遵守进口国消费者保护法规，建议建立审计日志满足GDPR数据处理要求 | 风险轨：误杀率3-5%（正常订单被误判为刷单，概率中等），影响用户体验；模型漂移风险（欺诈手段升级导致检测失效，概率15%/季度）；数据隐私泄露风险（用户行为数据被不当使用，概率低但影响大）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：6-15 万元 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（22 行）。**下面 22 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **22 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，22 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/click_fraud_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Click-Fraud-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np

def detect_click_fraud(clicks_per_hour, ctr_history, bounce_rates, ip_freq):
    """多信号集成 IVT 检测"""
    signals = []
    # 信号1: CTR spike
    z_ctr = (clicks_per_hour['ctr'] - np.mean(ctr_history)) / max(np.std(ctr_history), 0.001)
    signals.append(min(abs(z_ctr)/4, 1.0))
    # 信号2: bounce rate
    signals.append(bounce_rates.get('avg', 0))
    # 信号3: IP concentration
    signals.append(min(ip_freq.get('top3_ratio', 0), 1.0))
    
    ivt_risk = np.mean(signals)
    return {'ivt_risk': ivt_risk, 'is_ivt': ivt_risk > 0.7, 'signals': signals}

# test
r = detect_click_fraud(
    {'ctr': 0.085}, [0.02]*30, {'avg': 0.95}, {'top3_ratio': 0.85})
print(f"IVT risk: {r['ivt_risk']:.0%}, is IVT: {r['is_ivt']}")
assert r['is_ivt']
print("[✓] Click Fraud Detection 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：分时点击量、CTR 历史序列、跳出率与 IP 频次分布（含 IP 段与设备维度），以及广告花费与转化基线用于对照。

**输出**：刷量判定结果与置信依据、受影响点击与花费的量化、向平台申请退款的证据材料；供投放与风控团队挽回无效支出。

## 执行步骤

1. 汇总分时点击、CTR、跳出率与 IP 频次数据
2. 检测 CTR 尖峰、跳出率异常与 IP 集中度
3. 多信号融合判定是否为刷量
4. 量化无效点击数与对应花费
5. 整理证据向平台申请退款并部署实时过滤

## 边界与不做

- 何时不用：点击与转化同步变化、或流量规模太小不足以形成统计信号时，不要判定刷量。
- 能力边界：本技能产出判定与退款材料，不代替平台裁定，也不执行封禁竞品等动作。
- 合规边界：行为数据分析需留存审计日志并符合隐私法规，误杀需人工复核，检测结果不得用于对外攻击。

## 技能关联

- **前置**：Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Click-Fraud-Detection

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Click-Fraud-Detection`