---
name: "p2s-regulatory-graph-compliance-monitor"
title: "Regulatory Graph Compliance Monitor — 合规知识图谱+GenAI实时监控"
description: "触发词：合规图谱、实时扫描、复合违规、风险评分、违规点定位、修改建议。何时不用：要修正过期文档来源时用「Corrective-RAG 纠错检索」，只查平台条款单点时用「Amazon ToS 合规护栏」。安全边界：扫描结论为整改建议，不代替 FDA/FTC 等监管判定，也不自动改写线上 Listing。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 知识溯源"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Regulatory-Graph-Compliance-Monitor"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "吸奶器上新同时撞上 FDA、CPSC、FTC 和平台四套规则时，十秒扫出违规点和最危险的组合风险。"
user_try: "试试：扫一下这份吸奶器 Listing 草稿，列出同时触犯 FDA 和 FTC 的复合风险点并给修改建议。"
whenToUse: "新品上架前要跨多套规则（监管加平台）扫 Listing 并识别复合风险时用；要修正过期文档来源时用「Corrective-RAG 纠错检索」；只查平台条款单点时用「Amazon ToS 合规护栏」。"
workflow: "准备 Listing 草稿、目标市场与品类路径 → 按 FDA/CPSC/FTC/平台四套规则库匹配触发模式 → 汇总合规风险评分与违规点清单 → 标出同时触犯多套规则的复合风险 → 输出法规来源、触犯文字与修改建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Regulatory Graph Compliance Monitor — 合规知识图谱+GenAI实时监控

## ① 解决的问题

吸奶器新品上架美国同时面对FDA/CPSC/FTC/Amazon四套规则人工检查需2-3天——合规知识图谱+GenAI实时扫描10秒内识别复合违规风险并给出修改建议，拦截违规上架避免下架损失年化30-200万元

## ② 核心算法逻辑

传统合规检查是人工查手册——速度慢，且规则之间的隐性关联无法被发现（"某产品同时触犯 FDA 宣传禁令 + CPSC 召回标准"的复合风险）。监管图（Regulatory Graph）把合规规则建模为图结构：

## ③ 业务应用场景

业务问题：吸奶器新品上架美国，同时涉及 FDA（医疗器械声明）、CPSC（儿童产品安全）、FTC（广告真实性）、Amazon ToS（Listing 规范）四套规则。逐一人工检查需 2-3 天，且无法识别复合风险。
数据要求： - 产品 Listing 草稿（标题/要点/描述/A+ 内容） - 目标销售市场（美国/德国/日本） - 产品品类路径（Health & Beauty > Baby > Breast Pumps）
预期产出： - 合规风险评分（0-100，<60 需修改后上架） - 具体违规点清单（法规来源 + 触犯文字 + 修改建议） - 复合风险提示（同时触犯 FDA + FTC 的高危组合）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
上架前自动拦截合规风险：避免 Amazon 下架或 FDA 警告（¥30-200 万避损/次）
批量 SKU 合规检查（人工 4h/SKU → 自动 10s/SKU）：节省运营人力 ¥5-15 万/年
发现复合合规风险（单点检查无法发现）：降低重大罚款风险
年化综合 ROI：¥30-200 万（以避损为主）
实施难度：⭐⭐☆☆☆（规则库版 1-2 周可实现；LLM+图谱完整版 4-6 周；规则库需定期维护）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/regulatory_graph_compliance_monitor` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Regulatory-Graph-Compliance-Monitor.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Regulatory Graph Compliance Monitor
合规知识图谱构建 + GenAI 实时监控（轻量规则引擎版）
"""
from dataclasses import dataclass, field
from typing import Optional
import re


@dataclass
class RegulationRule:
    rule_id: str
    source: str          # FDA / CPSC / FTC / Amazon-ToS
    category: str        # health-claim / safety / advertising / listing
    description: str
    trigger_patterns: list[str]   # 触发词（正则）
    severity: str        # HIGH / MEDIUM / LOW
    action: str          # 修改建议


# 母婴跨境核心合规规则库
COMPLIANCE_RULES = [
    RegulationRule(
        rule_id='FDA-HC-001',
        source='FDA',
        category='health-claim',
        description='禁止未经验证的医疗功效声明',
        trigger_patterns=[
            r'clinically (proven|tested|verified)',
            r'(cure|treat|heal|prevent|diagnose)\s+\w+',
            r'fda (approved|cleared|certified)',
            r'medical grade(?! pump)',
            r'(increase|boost|improve)\s+(milk supply|lactation|breast milk)',
        ],
        severity='HIGH',
        action='删除医疗声明，改用描述性语言（如"designed for..."而非"clinically proven to..."）',
    ),
    RegulationRule(
        rule_id='CPSC-CS-001',
        source='CPSC',
        category='safety',
        description='儿童产品必须通过 ASTM/CPSC 安全测试',
        trigger_patterns=[
            r'for (infants?|babies|newborns?|children)',
            r'baby\s+\w+',
            r'infant\s+\w+',
        ],
        severity='HIGH',
        action='确保产品已通过 CPSC 认证，在 Listing 中标注认证信息',
    ),
    RegulationRule(
        rule_id='FTC-AD-001',
        source='FTC',
        category='advertising',
        description='广告声明必须有实质性证据支撑',
        trigger_patterns=[
            r'\d+[%％]\s*(better|more|faster|quieter)',
            r'(best|#1|number one|top rated)\s+\w+',
            r'guaranteed\s+to\s+\w+',
            r'scientifically\s+proven',
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2506.01093 — Regulatory Graphs and GenAI for Real-Time Transaction Monitoring and Compliance Explanation in Banking

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品 Listing 草稿（标题、要点、描述、A+ 内容）、目标销售市场（美国/德国/日本）、产品品类路径（如 Health & Beauty > Baby > Breast Pumps）；粒度：单 Listing × 单规则来源。

**输出**：合规风险评分（0-100，低于 60 需修改后再上架）、违规点清单（法规来源 + 触犯文字 + 修改建议）与复合风险提示（如同时触犯 FDA 与 FTC 的高危组合）；供运营在上架前拦截违规，单 SKU 检查由人工约 4 小时缩短至 10 秒。

## 执行步骤

1. 准备 Listing 草稿与目标市场信息
2. 按四套规则库匹配触发模式
3. 汇总风险评分与违规点清单
4. 标出跨规则的复合风险组合
5. 输出修改建议与是否放行结论

## 边界与不做

- 数据不满足时不用：Listing 草稿不完整、或规则库未定期维护时，扫描会漏掉新规则。
- 能力边界：只做规则匹配与整改建议，不代替 FDA/FTC 等监管判定，也不自动改写线上 Listing。
- 落地边界：轻量规则库版 1-2 周可落地，LLM 加图谱的完整版需 4-6 周，规则库需持续维护。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining
- **延伸**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining
- **可组合**：Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining、Skill-Regulatory-Graph-Compliance-Monitor

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-Regulatory-Graph-Compliance-Monitor`