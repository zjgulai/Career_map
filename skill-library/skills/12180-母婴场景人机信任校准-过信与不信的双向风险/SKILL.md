---
name: "p2s-human-ai-trust-calibration-maternal"
title: "Human-AI Trust Calibration — 母婴场景人机信任校准（过信与不信的双向风险）"
description: "触发词：信任校准、过信与不信、免责声明强度、置信度展示、新手与老手区分、医生提醒。何时不用：要拦截医疗错误内容本身用「育儿建议幻觉防护」；要做知识检索与法规比对用「垂直领域RAG」。安全边界：置信度展示必须真实反映 AI 能力范围，不得误导用户；健康类建议须保留咨询医生提示；用户行为数据采集须获得用户授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-107"
l3_business: "产品问答"
l3_all: "产品问答"
l1_l2_l3: "业务运营/服务与体验/产品问答"
p2s_card_id: "Skill-Human-AI-Trust-Calibration-Maternal"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "新手爸妈容易把 AI 建议当权威——按用户经验动态调整警示强度与展示置信度，把危险建议的遵从率降下来。"
user_try: "试试：按用户是新手上路还是有经验，调整育儿建议的免责声明强度和医生提醒。"
whenToUse: "当 AI 建议的采纳行为出现两极（新手盲从、老手全忽略）、需要按用户类型调节信任展示时用本技能；若要拦截的是错误医疗内容本身，用「育儿建议幻觉防护」；若要做的是知识检索与法规核对，用「垂直领域RAG」。"
workflow: "采集用户历史行为（是否点击建议、是否执行、满意度）与用户类型标签 → 判断用户处于过信还是不信任状态 → 按用户类型调整展示置信度与免责声明强度 → 新手强制显示医生提醒，有经验用户弱化打扰 → 跟踪遵从后的实际结果并持续再校准"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Human-AI Trust Calibration — 母婴场景人机信任校准（过信与不信的双向风险）

## ① 解决的问题

产品团队面临"新手父母过度信任AI育儿建议导致安全风险和法律隐患"——动态信任校准将危险建议遵从率降低60%，年化降低安全事故法律风险30-80万元

## ② 核心算法逻辑

母婴场景中AI建议的人机信任存在两种失衡：过度信任（新手父母把AI育儿建议当权威，忽视医生意见）和不信任（有经验的父母完全忽略AI推荐，错失有价值建议）。信任校准模型基于用户行为数据（是否遵从AI建议、遵从后结果如何）动态调整AI建议的置信度展示和免责声明强度，实现个性化信任管理。

## ③ 业务应用场景

场景1：母婴健康咨询App人机信任优化 - 业务问题：过度依赖AI的新手父母因盲目遵从婴儿睡眠建议导致安全事故风险 - 数据要求：用户历史行为（是否点击建议/是否执行/满意度反馈）+ 用户类型标签（新手/有经验） - 预期产出：个性化信任校准策略（新手用户加强警示，有经验用户减少干扰） - 业务价值：减少AI建议导致的不良后果，年化降低安全事故法律风险30-80万元
**三轨验证**： - 成本：行为数据收集需用户授权，约3人天开发 - 合规：置信度展示需真实反映AI能力范围，不可误导用户 - 风险：动态调整信任等级可能引起用户困惑，需配合清晰的UI说明

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：减少AI建议导致的不良后果，年化降低安全事故法律风险30-80万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：产品团队面临'新手父母过度信任AI育儿建议导致安全风险和法律隐患'——人机信任校准将危险建议遵从率降低60%，年化降低安全事故法律风险30-80万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（32 行）。**下面 32 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **32 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，32 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
def calibrate_trust_display(user_profile: dict, ai_confidence: float) -> dict:
    """根据用户类型和AI置信度调整信任展示策略"""
    experience = user_profile.get("experience_level", "novice")
    past_accuracy = user_profile.get("ai_accuracy_history", 0.7)
    
    # 新手用户：加强免责声明
    if experience == "novice":
        disclaimer_strength = "STRONG"
        show_doctor_reminder = True
        confidence_display = min(ai_confidence * 0.8, 0.85)  # 下调显示置信度
    # 有经验用户：减少打扰但保留关键提示
    elif experience == "experienced" and past_accuracy > 0.75:
        disclaimer_strength = "LIGHT"
        show_doctor_reminder = ai_confidence < 0.7
        confidence_display = ai_confidence
    else:
        disclaimer_strength = "MEDIUM"
        show_doctor_reminder = True
        confidence_display = ai_confidence * 0.9
    
    return {
        "display_confidence": round(confidence_display, 2),
        "disclaimer_strength": disclaimer_strength,
        "show_doctor_reminder": show_doctor_reminder,
        "calibrated": True,
    }

profile = {"experience_level": "novice", "ai_accuracy_history": 0.65}
result = calibrate_trust_display(profile, ai_confidence=0.88)
print(f"显示置信度: {result['display_confidence']} | 免责级别: {result['disclaimer_strength']}")
assert result["show_doctor_reminder"] == True
print("[✓] Human-AI Trust Calibration Maternal 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户历史行为数据（是否点击建议、是否执行、满意度反馈）、用户类型标签（新手 / 有经验）与 AI 建议的原始置信度；粒度为用户 × 单条建议。

**输出**：个性化信任校准策略（展示置信度、免责声明强度、是否显示医生提醒）及校准记录；供产品与前端展示层使用。

## 执行步骤

1. 采集用户对历史建议的点击、执行与满意度行为数据
2. 结合用户类型标签判定过信或不信任状态
3. 按用户类型下调或保持展示置信度
4. 加强新手用户的免责声明与医生提醒，为有经验用户减少干扰
5. 跟踪遵从建议后的结果并持续再校准策略

## 边界与不做

- 数据不满足：没有用户行为数据或未获授权采集时无法做个性化校准，只能使用统一保守策略。
- 何时不用：医疗内容拦截用「育儿建议幻觉防护」，知识检索与法规比对用「垂直领域RAG」。
- 能力边界：只调节信任展示与提示强度，不判断建议本身是否正确，也不替代内容安全筛查。
- 安全边界：置信度展示不得误导用户，健康建议须保留咨询医生提示，行为数据采集须获授权。

## 技能关联

- **可组合**：Skill-Human-AI-Trust-Calibration-Maternal

---

> 分类：业务运营/服务与体验/产品问答　·　技术族：11-AI人文　·　源卡：`Skill-Human-AI-Trust-Calibration-Maternal`