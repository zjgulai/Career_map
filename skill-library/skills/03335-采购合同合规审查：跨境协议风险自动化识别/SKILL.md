---
name: "p2s-llm-contract-compliance-review"
title: "LLM Contract Compliance Review — LLM 采购合同合规审查：跨境协议风险自动化识别"
description: "触发词：合同审查、风险条款、付款条款、知识产权、争议解决、保密条款。何时不用：要做多币种损益对账时用「多币种 P&L 对账」，要核法规变更对 SKU 的影响时用「法规变更影响传播引擎」。安全边界：输出为风险提示与条款建议，不构成法律意见，高风险合同仍须律师终审。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-128"
l3_business: "合同审查支持"
l3_all: "合同审查支持"
l1_l2_l3: "独立控制/财务与合规/合同审查支持"
p2s_card_id: "Skill-LLM-Contract-Compliance-Review"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "15 页中英文供应商合同半小时扫完，付款、知识产权、争议解决这些高风险条款列出来并附替换文本。"
user_try: "试试：审一下这份 15 页的硅胶件供应商合同，列出高风险条款、修改建议，并说明要不要送律师。"
whenToUse: "收到供应商合同需要快速识别高风险条款、判断能否签时用；要做多币种财务对账时用「多币种 P&L 对账」；要核法规变更影响时用「法规变更影响传播引擎」。"
workflow: "导入合同文本与行业标准合同模板 → 按核心风险条款词典逐条扫描 → 给条款标注风险等级与风险类型 → 生成条款替换建议与整体风险评分 → 判断是否建议送律师终审"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Contract Compliance Review — LLM 采购合同合规审查：跨境协议风险自动化识别

## ① 解决的问题

新供应商发来15页合同需要律师审查等5天成本1000美元且可能错过签约时机——LLM合同合规审查30分钟识别高风险条款（付款/IP/争议/保密），法律成本降低70%年化节省20-60万元

## ② 核心算法逻辑

人工合同审查 vs LLM 辅助审查：

## ③ 业务应用场景

业务问题：新找到一家硅胶件供应商，对方发来一份 15 页中英文合同。需要判断：这份合同是否有重大风险条款？能否签？需要修改哪些地方？送律师审需要等 5 天，下单时机可能错过。
数据要求： - 合同 PDF/文本 - 行业标准合同模板（对比基准） - 核心风险条款词典（跨境采购专用）
预期产出： - 风险评分：合同整体风险等级（高/中/低） - 高风险条款清单：需立即处理的 3-5 个问题 - 修改建议：标准的对应条款替换文本 - 是否建议送律师：是（仅高风险合同）或否

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
法律咨询成本降低 70%：每份合同 $1000 → $200，季度 8 份节省 ¥4-6 万
审查时间：5天 → 30分钟，加速签约避免失去优质供应商
主动发现高风险条款：避免一次不利合同造成的 ¥30-100 万损失
年化综合 ROI：¥20-60 万
实施难度：⭐⭐☆☆☆（规则引擎版 1-2 周；LLM API 版本约 3-4 周；合同词典建立需要法律专业知识）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（204 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 49 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/llm_contract_compliance_review` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-LLM-Contract-Compliance-Review.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Contract Compliance Review
LLM 采购合同合规审查：跨境协议风险自动化识别
（规则引擎版，生产替换为 LLM API）
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ContractClause:
    """合同条款"""
    clause_id: str
    clause_type: str
    original_text: str
    risk_level: str = 'LOW'  # HIGH / MEDIUM / LOW
    risk_type: Optional[str] = None
    suggestion: Optional[str] = None


# 合同风险规则库（跨境采购专用）
CONTRACT_RISK_RULES = [
    {
        'rule_id': 'PAYMENT-001',
        'type': '付款条款',
        'patterns': [
            r'100%\s*(advance|prepayment|deposit)',
            r'全额\s*预付',
            r'payment.*before.*shipment.*100',
        ],
        'risk_level': 'HIGH',
        'risk_desc': '要求100%预付款，现金流风险极高',
        'suggestion': '建议改为：30% 预付 + 70% 见提单付款（T/T against B/L）',
    },
    {
        'rule_id': 'LIABILITY-001',
        'type': '质量责任',
        'patterns': [
            r'unlimited\s*(liability|warranty)',
            r'无限\s*(责任|保修)',
            r'seller.*not.*liable',
            r'卖方.*不.*承担.*责任',
        ],
        'risk_level': 'HIGH',
        'risk_desc': '质量责任条款对卖家保护不足',
        'suggestion': '建议添加：质量问题赔偿上限为合同金额的 100%，并明确检验期限（30天）',
    },
    {
        'rule_id': 'IP-001',
        'type': 'IP归属',
        'patterns': [
            r'supplier.*retain.*intellectual.*property',
            r'供应商.*保留.*知识产权',
            r'all improvements.*belong.*to.*seller',
            r'改进.*归.*供应商',
        ],
        'risk_level': 'HIGH',
        'risk_desc': '供应商保留产品改进IP，可能仿制您的产品',
        'suggestion': '添加：买方定制化改进的知识产权归买方所有',
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.14562，但该号在 arXiv 上是《Thought-Like-Pro: Enhancing Reasoning of Large Language Models through Self-Driven Prolog-based Chain-of-Thought》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：合同 PDF 或文本、行业标准合同模板（作为对比基准）、核心风险条款词典（跨境采购专用，覆盖付款、知识产权、争议解决、保密等）；粒度：单份合同 × 单条条款。

**输出**：合同整体风险评分（高/中/低）、需立即处理的高风险条款清单（3-5 条）与对应条款替换文本、是否建议送律师的结论；供采购与法务把关，审查时间由 5 天压缩至 30 分钟。

## 执行步骤

1. 导入合同文本与标准合同模板
2. 按风险条款词典逐条扫描并分类
3. 标注条款风险等级与风险类型
4. 生成关键条款替换建议
5. 输出风险评分与是否送律师结论

## 边界与不做

- 数据不满足时不用：合同为扫描件无法解析、或风险条款词典未覆盖该法域与品类时，识别会漏项。
- 能力边界：只做条款识别、分级与文本建议，不构成法律意见、不代替律师签署或谈判；高风险合同仍须人工终审。
- 合规边界：合同文本含商业机密，处理与存储须限定在授权环境内，不得外传或用于其他用途。

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring
- **可组合**：Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Multi-Seller-Account-Portfolio.html、Skill-Multi-Seller-Account-Portfolio、Skill-LLM-Contract-Compliance-Review

---

> 分类：独立控制/财务与合规/合同审查支持　·　技术族：21-合规决策　·　源卡：`Skill-LLM-Contract-Compliance-Review`