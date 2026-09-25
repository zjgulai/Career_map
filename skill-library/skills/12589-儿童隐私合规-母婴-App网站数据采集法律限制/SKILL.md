---
name: "p2s-privacy-coppa-compliance"
title: "Privacy COPPA Compliance — COPPA 儿童隐私合规（母婴 App/网站数据采集法律限制）"
description: "触发词：COPPA、儿童隐私、家长可核实同意、SDK合规审查、母婴App合规。何时不用：通用 GDPR/CCPA 采集架构改造时用「Privacy-Compliant Data Collection GDPR/CCPA」；做去标识化协作分析用数据洁净室类技能。安全边界：合规结论不构成法律意见，须法务与 FTC 认可的安全港项目确认；不得为规避 COPPA 伪造年龄门槛或弱化家长同意。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-133"
l3_business: "隐私需求分析"
l3_all: "隐私需求分析"
l1_l2_l3: "独立控制/财务与合规/隐私需求分析"
p2s_card_id: "Skill-Privacy-COPPA-Compliance"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "面向母婴家庭的 App 上架美国前，先查清哪些 SDK 和收集行为会踩 COPPA 红线。"
user_try: "试试：按我的 App 功能和 SDK 清单做一次 COPPA 适用性与违规项筛查，给出改造清单。"
whenToUse: "面向 13 岁以下儿童或母婴家庭的产品要做美国儿童隐私合规审查时用；通用采集架构改造用隐私合规采集类技能；跨品牌受众协作用洁净室类技能。"
workflow: "梳理功能、收集字段与 SDK 清单 → 判定儿童服务适用性 → 标出高风险 SDK 与采集点 → 输出 VPC 改造与合规整改清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Privacy COPPA Compliance — COPPA 儿童隐私合规（母婴 App/网站数据采集法律限制）

## ① 解决的问题

法务合规团队面临"母婴App在美国市场违反COPPA儿童隐私法面临FTC处罚"——COPPA合规自动审查将违规SDK识别率提升至95%，年化防范FTC罚款（单次可达百万美元）

## ② 核心算法逻辑

核心思想：《儿童在线隐私保护法》（COPPA，1998，FTC 执法）要求面向 13 岁以下儿童的网站/App 在收集个人信息前必须获得父母可核实同意（VPC），违者最高罚款 $50,119/条/天。母婴 App（婴儿成长追踪/胎教音乐/购物 App）因目标用户是婴儿家庭，极易触发 COPPA 监管。

## ③ 业务应用场景

场景1：婴儿成长追踪 App 进入美国市场 COPPA 合规审查 - 业务问题：某母婴成长追踪 App 含婴儿照片上传功能，内嵌 Facebook SDK 用于广告归因，FTC 判定违反 COPPA，罚款 $340 万（2023 年实际案例类似情景） - 数据要求：App 代码/隐私政策/SDK 清单/数据流向图 - 预期产出：COPPA 适用性报告 + 违规 SDK 清单 + VPC 流程改造建议 + 数据最小化方案 - 业务价值：FTC 单次执法罚款可达数百万美元，合规系统年化防范价值 100-500 万元
**三轨验证**： - 成本：合规审计约 5 人天 + 法务确认；VPC 流程改造约 10 人天开发 - 合规：COPPA 合规本身就是合规行为，无额外风险 - 风险：COPPA 解释存在灰色地带（"混合受众"判断有主观性），建议保守策略并咨询 FTC 认可的 COPPA Safe Harbor 项目

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：FTC COPPA 罚款案例显示单次处罚从数十万到数千万美元；年化合规防范价值 100-500 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：FTC 2023-2024 年加强 COPPA 执法力度，母婴 App 是高风险目标；VPC 流程改造是强制性合规要求，非可选优化。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（106 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import List, Dict

KNOWN_RISKY_SDKS = {
    "facebook-android-sdk": {"data_collected": ["device_id", "ip", "location"], "coppa_safe": False},
    "google-ads-sdk": {"data_collected": ["idfa", "gaid", "behavior"], "coppa_safe": False},
    "firebase-analytics": {"data_collected": ["user_id", "events", "device"], "coppa_safe": True},
    "appsflyer": {"data_collected": ["device_id", "ip"], "coppa_safe": False},
    "crashlytics": {"data_collected": ["crash_logs"], "coppa_safe": True},
}

COPPA_CHILD_CONTENT_SIGNALS = [
    "baby", "infant", "toddler", "child", "kids", "nursery",
    "diaper", "formula", "breastfeed", "lullaby", "cartoon character",
]

@dataclass
class COPPAComplianceReport:
    app_name: str
    coppa_applicable: bool
    applicability_score: float
    risky_sdks: List[Dict] = field(default_factory=list)
    violations: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    overall_risk: str = "LOW"

def assess_coppa_applicability(app_description: str,
                                target_age_range: str,
                                content_tags: List[str]) -> float:
    """评估 COPPA 适用性分数（0-1，越高越可能需要 COPPA 合规）"""
    score = 0.0
    desc_lower = app_description.lower()
    # 内容信号
    child_signals = sum(1 for s in COPPA_CHILD_CONTENT_SIGNALS if s in desc_lower)
    score += min(child_signals * 0.1, 0.4)
    # 年龄范围
    if "0-" in target_age_range or "infant" in target_age_range.lower():
        score += 0.4
    elif "13" in target_age_range or "teen" in target_age_range.lower():
        score += 0.1
    # 内容标签
    child_tags = {"baby", "infant", "toddler", "child", "kids"}
    tag_overlap = len(set(t.lower() for t in content_tags) & child_tags)
    score += min(tag_overlap * 0.05, 0.2)
    return min(score, 1.0)

def scan_sdk_risks(sdk_list: List[str]) -> List[Dict]:
    """扫描 App 内 SDK 的 COPPA 风险"""
    risks = []
    for sdk in sdk_list:
        sdk_lower = sdk.lower()
        for known_sdk, info in KNOWN_RISKY_SDKS.items():
            if known_sdk in sdk_lower and not info["coppa_safe"]:
                risks.append({
                    "sdk": sdk,
                    "data_collected": info["data_collected"],
                    "coppa_safe": False,
                    "action": f"移除或替换为 COPPA 合规版本，或在 COPPA 模式下禁用 {sdk}",
                })
    return risks
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：App 代码与功能清单、隐私政策、内嵌 SDK 清单与数据流向图、收集的儿童相关数据字段；粒度：SDK 级与数据字段级。

**输出**：COPPA 适用性判断、违规 SDK 与风险项清单、家长可核实同意流程改造与数据最小化建议，供法务与产品改造使用。

## 执行步骤

1. 梳理 App 功能、收集字段与内嵌 SDK 清单
2. 判定是否构成面向儿童的混合受众服务
3. 标出高风险 SDK 与未经同意的数据采集点
4. 设计家长可核实同意流程与数据最小化方案
5. 输出合规报告与整改清单

## 边界与不做

- 数据不满足时不用：SDK 清单与数据流向不完整时，风险筛查会漏项，结论不可作为合规依据。
- 能力边界：只做技术性筛查与改造建议，不提供法律意见、不代向 FTC 或安全港项目申报；最终判定须法务确认。

## 技能关联

- **可组合**：Skill-Privacy-COPPA-Compliance

---

> 分类：独立控制/财务与合规/隐私需求分析　·　技术族：21-合规决策　·　源卡：`Skill-Privacy-COPPA-Compliance`