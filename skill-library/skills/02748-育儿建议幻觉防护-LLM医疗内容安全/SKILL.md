---
name: "p2s-ai-parenting-advice-hallucination-guard"
title: "AI Parenting Advice Hallucination Guard — AI育儿建议幻觉防护（LLM医疗内容安全）"
description: "触发词：育儿建议安全、医疗内容幻觉、危险建议拦截、可信度评分、权威来源引用、强制转人工。何时不用：要做产品参数与法规逐条合规核对用「垂直领域RAG」；要管理用户信任与免责声明强度用「人机信任校准」。安全边界：医疗建议必须标注仅供参考并提示咨询儿科医生，符合 FTC/FDA 指引；命中高危说法（如 1 岁前蜂蜜、新生儿牛奶）一律 BLOCK 不得输出；阈值需持续校准，避免误杀正确建议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-107"
l3_business: "产品问答"
l3_all: "产品问答"
l1_l2_l3: "业务运营/服务与体验/产品问答"
p2s_card_id: "Skill-AI-Parenting-Advice-Hallucination-Guard"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户问 6 个月宝宝能不能喝蜂蜜，AI 正准备给出建议——安全闸门直接拦下，改成提示咨询儿科医生。"
user_try: "试试：给育儿问答加一道医疗安全检测，命中高危说法就 BLOCK 并给出权威来源建议。"
whenToUse: "当面向用户的问答涉及喂养、睡眠、健康等医疗相关话题、存在错误建议危及婴儿安全的风险时用本技能；若要做的是产品参数与多国法规的逐条核对，改用「垂直领域RAG」；若要调整的是免责声明强度与信任展示，改用「人机信任校准」。"
workflow: "收集用户问题与 LLM 回答草稿 → 与医学知识库（WHO/AAP/CDC 指南）比对核查 → 用不确定性量化与拒绝回答分类器判定可信度 → 输出医学安全分与风险命中清单 → 高危内容 BLOCK 并强制转人工或引用权威来源作答"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Parenting Advice Hallucination Guard — AI育儿建议幻觉防护（LLM医疗内容安全）

## ① 解决的问题

产品团队面临"AI育儿问答出现医疗错误建议危及婴儿安全"——医疗内容安全检测将危险建议漏出率从12%降至1%，年化降低法律风险50-200万元

## ② 核心算法逻辑

大语言模型在回答育儿/喂养/健康类问题时存在'幻觉'风险——生成看似权威但错误的医学建议（如不安全的辅食搭配、错误剂量）。母婴场景下此类幻觉可能危及婴儿安全。防护框架：多层检测（医学知识库比对+不确定性量化+拒绝回答分类器），输出可信度评分，低可信度内容强制转人工或引用权威来源（WHO/AAP指南）。

## ③ 业务应用场景

场景1：母婴智能客服育儿问答安全防护 - 业务问题：用户询问'6个月宝宝可以喝蜂蜜吗'，LLM给出不安全回答（实际1岁前禁止蜂蜜） - 数据要求：用户问题 + LLM回答草稿 + 医学知识库（WHO/AAP/CDC指南） - 预期产出：每条回答的医学安全分 + 高风险内容自动标记 + 建议引用来源 - 业务价值：防止错误医疗建议导致的法律诉讼，年化降低法律风险价值50-200万元
**三轨验证**： - 成本：医学知识库维护约1人/季度，检测API约0.01元/次 - 合规：医疗建议需标注'仅供参考，请咨询儿科医生'，满足FTC和FDA指引 - 风险：检测误报可能导致正确建议被屏蔽，需持续校准阈值

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：防止错误医疗建议导致的法律诉讼，年化降低法律风险价值50-200万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：产品团队面临'AI育儿问答出现医疗错误建议危及婴儿安全'——医疗内容幻觉防护将危险建议漏出率从12%降至<1%，年化降低法律风险50-200万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（26 行）。**下面 26 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **26 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，26 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re

UNSAFE_MEDICAL_CLAIMS = {
    "honey before 1 year": "UNSAFE - botulism risk for infants under 1",
    "蜂蜜.*[0-9]个月": "UNSAFE - 1岁前禁止蜂蜜，肉毒杆菌风险",
    "cow milk.*newborn": "UNSAFE - no cow milk before 12 months",
}

def check_medical_safety(response: str) -> dict:
    response_lower = response.lower()
    risks = []
    for pattern, reason in UNSAFE_MEDICAL_CLAIMS.items():
        if re.search(pattern, response_lower, re.IGNORECASE):
            risks.append({"pattern": pattern, "reason": reason})
    safety_score = max(0, 100 - len(risks) * 40)
    return {
        "safety_score": safety_score,
        "risks_detected": risks,
        "action": "BLOCK" if safety_score < 60 else ("WARN" if safety_score < 80 else "PASS"),
    }

test_response = "6个月宝宝可以少量尝试蜂蜜，有助于缓解便秘"
result = check_medical_safety(test_response)
print(f"安全分: {result['safety_score']} | 动作: {result['action']}")
assert result["action"] == "BLOCK"
print("[✓] AI Parenting Advice Hallucination Guard 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户问题、LLM 回答草稿、医学知识库（WHO/AAP/CDC 指南）与高危说法模式清单；粒度为单条回答。

**输出**：每条回答的医学安全分、风险命中明细与动作判决（BLOCK / WARN / PASS），以及建议引用的权威来源；供客服与内容审核在答复用户前把关。

## 执行步骤

1. 收集待发布的用户问题与 LLM 回答草稿
2. 比对医学知识库中的权威指南并逐条核查
3. 用不确定性量化与拒绝回答分类器给出可信度判断
4. 输出医学安全分与命中的风险说法清单
5. 对高危回答执行 BLOCK 并转人工或改用权威来源作答

## 边界与不做

- 数据不满足：医学知识库未覆盖的领域不能给出安全判定，此时应保守转人工而不是默认放行。
- 何时不用：产品合规逐条核对用「垂直领域RAG」，用户信任与免责声明强度调整用「人机信任校准」。
- 能力边界：只做内容安全筛查与来源建议，不做诊断也不替代医生的专业判断。
- 安全边界：必须保留仅供参考与咨询儿科医生的提示；高危说法一律拦截，阈值须持续校准以免误杀。

## 技能关联

- **可组合**：Skill-AI-Parenting-Advice-Hallucination-Guard

---

> 分类：业务运营/服务与体验/产品问答　·　技术族：11-AI人文　·　源卡：`Skill-AI-Parenting-Advice-Hallucination-Guard`