---
name: "p2s-ip-infringement-risk-scan"
title: "IP Infringement Risk Scan — 上架前知识产权侵权风险自动扫描（商标+专利+著作权）"
description: "触发词：上架前 IP 扫描、商标相似、专利重叠、著作权比对、侵权风险报告。何时不用：要监控官方商标公告抢异议窗口用「商标侵权追踪」；只做专利文本先验筛查用「专利先验技术扫描」。安全边界：扫描结论不代替法务意见，高风险条目必须二次确认；只用公开数据库，不得用于恶意竞争。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索 / 产品准入核对"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-IP-Infringement-Risk-Scan"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品上架前把商标、专利和著作权三类风险扫一遍，给出风险评分和修改建议，避免上架后收律师函被迫下架。"
user_try: "试试：对这款准备进美国市场的婴儿推车做上架前 IP 扫描，输出商标、专利、著作权三维风险评分和高风险条目。"
whenToUse: "新品上架前需要做商标、专利、著作权三维整体风险体检时用本技能；只监控对手商标申请用「商标侵权追踪」；只做专利文本先验筛查用「专利先验技术扫描」。"
workflow: "汇总产品标题、描述、图片、技术规格与目标市场 → 用序列相似度比对商标库，标记高相似品牌 → 用产品功能与专利权利要求做重叠比对 → 合成三维风险评分与高风险条目详情 → 输出修改建议并交法务二次确认"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# IP Infringement Risk Scan — 上架前知识产权侵权风险自动扫描（商标+专利+著作权）

## ① 解决的问题

产品团队面临"上架前未发现知识产权风险收到律师函被迫下架"——上架前IP三层扫描将侵权漏检率从40%降至5%，年化避免IP诉讼和强制下架损失50-200万元

## ② 核心算法逻辑

核心思想：母婴产品上架前自动扫描三类 IP 风险——商标侵权（品牌名/logo 相似度）、专利侵权（产品功能与专利权利要求映射）、著作权侵权（产品图片/描述文字相似度）。通过多模态检测 + 法规数据库匹配，在上架前 48 小时内输出风险报告。

## ③ 业务应用场景

场景1：婴儿推车新品上架前 IP 风险扫描（进入美国市场） - 业务问题：某款婴儿推车因外观设计专利与 Bugaboo 的美国 D 专利重叠，上架后收到律师函，被迫下架损失 40 万元 - 数据要求：产品标题/描述/图片/技术规格 + 目标市场（US/EU/UK） - 预期产出：IP 风险报告（商标/专利/著作权三维度评分）+ 高风险条目详情 + 修改建议 - 业务价值：提前识别 IP 风险，避免上架后被迫下架损失，年化保护价值 50-150 万元
**三轨验证**： - 成本：Google Patents API + 商标数据库订阅约 3000 元/月，开发约 5 人天 - 合规：扫描竞品 IP 信息是合法行为（公开数据库），但不可用于恶意竞争 - 风险：漏检率无法降至 0（专利语言复杂，AI 解读存在偏差），仍需法务二次确认

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免上架后因 IP 侵权被迫下架，单次事件损失 10-150 万元；系统化扫描年化防范价值 50-200 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐⭐
评估依据：知识产权诉讼是母婴出海最高频法律风险之一，欧美市场专利棍（patent troll）活跃；上架前系统性扫描是标准商业实践，ROI 极高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
from dataclasses import dataclass, field
from typing import List

@dataclass
class IPRiskReport:
    trademark_risks: List[dict] = field(default_factory=list)
    patent_risks: List[dict] = field(default_factory=list)
    copyright_risks: List[dict] = field(default_factory=list)
    overall_risk: str = "LOW"  # LOW / MEDIUM / HIGH / CRITICAL

def check_trademark_similarity(product_name: str, trademark_db: List[dict]) -> List[dict]:
    """商标相似度检测（编辑距离 + 简单音近）"""
    import difflib
    risks = []
    pn_lower = product_name.lower()
    for tm in trademark_db:
        tm_name = tm["name"].lower()
        # 序列相似度
        ratio = difflib.SequenceMatcher(None, pn_lower, tm_name).ratio()
        if ratio > 0.75:
            risks.append({
                "trademark": tm["name"],
                "owner": tm["owner"],
                "similarity": round(ratio, 3),
                "classes": tm.get("nice_classes", []),
                "risk_level": "HIGH" if ratio > 0.9 else "MEDIUM",
            })
    return sorted(risks, key=lambda x: -x["similarity"])

def check_patent_overlap(product_features: List[str],
                          patent_db: List[dict]) -> List[dict]:
    """专利权利要求重叠检测（关键词匹配）"""
    risks = []
    for patent in patent_db:
        claims = patent.get("claims", "").lower()
        overlap_count = sum(1 for feat in product_features
                           if feat.lower() in claims)
        overlap_ratio = overlap_count / max(len(product_features), 1)
        if overlap_ratio > 0.3:
            risks.append({
                "patent_id": patent["id"],
                "title": patent["title"],
                "overlap_ratio": round(overlap_ratio, 3),
                "matched_features": [f for f in product_features
                                    if f.lower() in claims],
                "risk_level": "CRITICAL" if overlap_ratio > 0.6 else "HIGH",
            })
    return sorted(risks, key=lambda x: -x["overlap_ratio"])

def generate_ip_report(product_name: str,
                        product_features: List[str],
                        trademark_db: List[dict],
                        patent_db: List[dict]) -> IPRiskReport:
    report = IPRiskReport()
    report.trademark_risks = check_trademark_similarity(product_name, trademark_db)
    report.patent_risks = check_patent_overlap(product_features, patent_db)
    # 综合风险评级
    has_critical = any(r["risk_level"] == "CRITICAL"
                      for r in report.trademark_risks + report.patent_risks)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：产品标题、描述、图片、技术规格与目标市场（US、EU、UK）；商标库与专利库条目（含 NICE 分类与权利要求文本）。

**输出**：含商标、专利、著作权三维度评分的 IP 风险报告、高风险条目详情与修改建议，用于上架前决策与法务复核。

## 执行步骤

1. 汇总产品标题、描述、图片、技术规格与目标市场
2. 比对商标库的品牌名相似度并标记高风险项
3. 比对产品功能与专利权利要求的重叠度
4. 合成三维风险评分并列出高风险条目
5. 输出修改建议并交法务二次确认

## 边界与不做

- 只给到图片或口语化卖点、缺少技术规格与权利要求文本时不适用，专利比对无法成立
- 漏检率无法降到零，只做上架前预筛与排序，不代替专利律师的侵权分析
- 扫描仅限公开数据库，结论不得用于恶意竞争或打压同行

## 技能关联

- **可组合**：Skill-IP-Infringement-Risk-Scan

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：21-合规决策　·　源卡：`Skill-IP-Infringement-Risk-Scan`