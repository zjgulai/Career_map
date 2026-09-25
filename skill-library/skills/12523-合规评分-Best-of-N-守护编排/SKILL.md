---
name: "p2s-compliance-scored-guardrail-orchestration"
title: "Compliance-Scored Guardrail Orchestration — 合规评分 Best-of-N 守护编排"
description: "触发词：合规评分、Best-of-N、生成门控、PII 检测、证据引用、人工复核路由。何时不用：只做 ToS 违禁词替换时用「Amazon ToS 合规护栏」，要审 AIGC 图文视频宣称时用「AIGC 内容合规审查」。安全边界：涉及个人信息与供应商联系人的输出必须拦截，低分候选不得直接发布。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查 / 隐私需求分析"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Compliance-Scored-Guardrail-Orchestration"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "AI 批量写 Listing 时给每条候选打分，违规承诺、泄露联系人、缺证据的自动挡下或转人工。"
user_try: "试试：给这三条 AI 生成的 Listing 候选打分，低于阈值的直接挡住并说明命中了哪些规则。"
whenToUse: "AI 自动生成 Listing、客服话术或合规摘要、需在发布前统一门控时用；只做违禁词替换时用「Amazon ToS 合规护栏」；要审图文视频宣称时用「AIGC 内容合规审查」。"
workflow: "收集候选文案、目标市场、品类与证据摘要 → 按 PII、schema、CPSC/FDA/GPSR 规则逐条打分 → 在多个候选之间做 Best-of-N 选择 → 按阈值输出合规分与决策 → 低分候选转人工复核并记录审计元数据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Compliance-Scored Guardrail Orchestration — 合规评分 Best-of-N 守护编排

## ① 解决的问题

业务问题：AI 自动生成 Amazon/TikTok Shop Listing 时，容易写出“guaranteed safe”“no certification needed”等违规承诺，也可能泄露供应商联系人或测试报告中的 PII

## ② 核心算法逻辑

核心思想：把 LLM 自动生成的合规风险控制从“生成后人工看一眼”升级为同步的加权评分系统。系统并行生成多个候选输出，对每个候选运行 PII、内容安全、schema、领域规则和证据引用检查，计算合规得分；一旦最佳候选超过阈值就提前返回，否则进入人工复核。

## ③ 业务应用场景

场景 A：Listing 合规文案自动发布门控
- 业务问题：AI 自动生成 Amazon/TikTok Shop Listing 时，容易写出“guaranteed safe”“no certification needed”等违规承诺，也可能泄露供应商联系人或测试报告中的 PII。 - 数据要求：候选 Listing 文案、目标市场、品类、供应商测试报告摘要、图片 OCR 文本、平台政策规则。 - 预期产出： - `compliance_score`，如 0.92。 - 命中规则：PII、schema、CPSC/FDA/EU GPSR 规则、证据引用。 - 决策：`accepted` / `human_review_required`。
场景 B：召回/认证行动摘要的人工复核路由

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以每日 300 条 AI 生成 Listing/客服/合规摘要计算，若 70% 达到自动通过阈值、每条节省 4 分钟人工初筛，则每月节省约 840 小时；按 $25/hour 估算，约 $21,000/月。
风险降低：PII、违规承诺、缺证据引用从人工抽检变成每次输出必检，适合高风险品类和多市场上架。
实施难度：⭐⭐⭐☆☆。标准库版本可立即落地；生产版需要接入 OCR、DLP、moderation 和 trace。
优先级评分：⭐⭐⭐⭐☆。当前合规域已有规则类 Skill，但缺少一个统一的“生成输出门控 + 审计元数据”编排层。
评估依据：论文公开 readout 报告 5 次候选尝试、20 秒预算、91% compliance；业务侧收益主要来自减少人工初筛和减少违规输出，而非直接复用论文中的 payments win-rate。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（21 行）。**下面 21 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **21 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，21 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/compliance_scored_guardrail_orchestration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Compliance-Scored-Guardrail-Orchestration.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.compliance.compliance_scored_guardrail_orchestration import (
    ComplianceScoredGuardrailOrchestrator,
    baby_compliance_guardrails,
)

orchestrator = ComplianceScoredGuardrailOrchestrator(
    baby_compliance_guardrails(),
    threshold=0.88,
)

result = orchestrator.select_best([
    {
        "title": "Listing draft",
        "body": "Based on evidence, route the US launch through CPSC safety review.",
        "evidence_summary": "Supplier provided battery report and US/EU target-market plan.",
        "recommended_action": "human_review_before_publish",
    }
])

print(result.as_dict())
print("[✓] Compliance Scored Guardra 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2606.01513 — Compliance-Scored Best-of-N Guardrail Orchestration for Multimodal Document Generation in Payments Dispute Defense

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：候选 Listing 文案（可多条）、目标市场、品类、供应商测试报告摘要、图片 OCR 文本、平台政策规则；阈值默认 0.88；粒度：单条候选输出 × 单次生成。

**输出**：每条候选的 compliance_score（如 0.92）、命中规则清单（PII、schema、CPSC/FDA/EU GPSR、证据引用）与决策（accepted / human_review_required）、推荐动作与审计元数据；供生成链路统一门控，以每日 300 条输出、70% 自动通过计，每月约节省 840 小时人工初筛。

## 执行步骤

1. 收集候选输出与证据摘要
2. 按 PII、schema 与法规规则逐条打分
3. 在多个候选间做 Best-of-N 选择
4. 按阈值输出接受或转人工决策
5. 记录命中规则与审计元数据

## 边界与不做

- 数据不满足时不用：没有证据摘要与平台规则库、或候选输出缺上下文时，评分与门控无依据。
- 能力边界：只做评分、候选选择与路由，不生成最终文案、不代替合规负责人做发布决策。
- 合规边界：供应商联系人与测试报告中的个人信息属敏感数据，命中 PII 规则必须拦截并留痕，不得随输出外泄。

## 技能关联

- **前置**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Product-Safety-Testing-Requirements.html、Skill-Product-Safety-Testing-Requirements、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring、Skill-Compliance-Scored-Guardrail-Orchestration

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：21-合规决策　·　源卡：`Skill-Compliance-Scored-Guardrail-Orchestration`