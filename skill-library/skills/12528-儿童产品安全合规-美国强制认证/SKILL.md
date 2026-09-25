---
name: "p2s-cpsc-children-product-safety"
title: "CPSC 儿童产品安全合规（美国强制认证）"
description: "触发词：CPSC 合规、CPC 证书、ASTM F963、第三方检测、上架预检、实验室选择。何时不用：只想按 HTS 码打多标签风险时用「HTS 码风险分类」，只核对已有 GCC/CPC 字段完整性时用「GCC/CPC 文档验证」。安全边界：证书与报告须由 CPSC 认可实验室出具，本技能只做路径梳理，不代办申报。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-CPSC-Children-Product-Safety"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "新品上美国站被要 CPSC 文件时，一次搞清要做哪个标准、找哪家实验室、多少钱、多久拿到证书。"
user_try: "试试：婴儿玩具上美国 Amazon 前要做哪些 CPSC 合规，把标准、实验室选项、费用和周期列给我。"
whenToUse: "美国站母婴新品上架前要梳理强制认证与测试路径时用；只想按 HTS 码做多标签风险分类时用「HTS 码风险分类」；只核验已有认证文档字段时用「GCC/CPC 文档验证」。"
workflow: "把产品归入 CPSC 品类并确认是否受 CPSC 管辖 → 匹配适用标准（如婴儿玩具 ASTM F963） → 选定 CPSC 认可实验室并安排送样测试 → 取得测试报告与 CPC 证书后上传 Amazon 后台 → 建立每款产品对应的证书档案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CPSC 儿童产品安全合规（美国强制认证）

## ① 解决的问题

母婴新品上架美国 Amazon 时被要求提供 CPSC 合规文件，但不清楚需要哪些认证、找哪家实验室——CPSC 三层合规框架（法规识别→测试路径→证书管理）让合规准备从 3 个月压缩到 2-3 周

## ② 核心算法逻辑

论文：Regulatory Compliance and Supply Chain Risk Management in CrossBorder ECommerce | arXiv：2301.08547

## ③ 业务应用场景

业务问题：Momcozy 婴儿玩具品类扩张，新产品上架 Amazon 美国站被要求提供 CPSC 合规文件，不知道需要哪些认证、找哪家实验室、成本多少。
应用流程： 1. 产品归类（婴儿玩具 → ASTM F963） 2. 选定 SGS 实验室，提交样品 3. 4周后获取测试报告 + CPC 证书 4. 上传到 Amazon 后台，listing 通过审核 5. 建立内部合规文件管理系统（每款产品对应证书档案）
年化收益： - 避免一次因合规被下架：保护 30-80 万 GMV - 新市场进入合规准备从 3 个月缩短至 2-3 周 - 建立合规护城河，竞品难以快速跟进

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免一次下架 = 30-80 万 GMV 保护；认证成本仅 $800-2500
难度：⭐⭐☆☆☆（流程固定，主要是执行管理）
优先级：⭐⭐⭐⭐⭐（P0 合规，必须满足才能在美销售）
适用场景：新品上架前合规预检、供应商资质审查、亚马逊合规文件准备

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（60 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/compliance/cpsc_children_product_safety` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-CPSC-Children-Product-Safety.md`），已与卡面节选核对，不依赖上述路径。

```python
# CPSC 合规预检查工具
CPSC_REQUIREMENTS = {
    "infant_toy": {
        "standard": "ASTM F963",
        "third_party": True,
        "cert_required": "Children's Product Certificate (CPC)",
        "lab_options": ["SGS", "Bureau Veritas", "Intertek", "UL"],
        "typical_cost_usd": "800-2500",
        "typical_weeks": "3-6",
        "amazon_upload": "Seller Central > Catalog > Documents",
    },
    "nursing_pump": {
        "standard": "FDA 21 CFR (非CPSC)",
        "third_party": True,
        "cert_required": "FDA 510k clearance or 513(f)(2) De Novo",
        "note": "医疗器械，CPSC 不管辖",
    },
    "baby_clothing": {
        "standard": "16 CFR 1615/1616 (flammability)",
        "third_party": True,
        "cert_required": "General Certificate of Conformity (GCC)",
        "typical_cost_usd": "500-1500",
    },
    "baby_carrier": {
        "standard": "ASTM F2236",
        "third_party": True,
        "cert_required": "CPC",
        "typical_cost_usd": "1200-3000",
    },
}

def check_compliance_requirements(product_category: str, target_market: str = "US") -> dict:
    """
    输入产品品类，输出合规要求清单。
    """
    cat = product_category.lower().replace(" ", "_")
    req = CPSC_REQUIREMENTS.get(cat, {
        "note": f"未找到 '{product_category}' 的预置规则，请查询 CPSC.gov",
        "cpsc_url": "https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance"
    })
    
    result = {
        "product": product_category,
        "market": target_market,
        "requirements": req,
        "action_items": [],
    }
    
    if req.get("third_party"):
        result["action_items"].append(f"联系认证实验室: {req.get('lab_options', ['SGS'])[0]}")
        result["action_items"].append(f"预算: ${req.get('typical_cost_usd', 'TBD')}")
        result["action_items"].append(f"周期: {req.get('typical_weeks', 'TBD')} 周")
    
    return result

# 测试
result = check_compliance_requirements("infant_toy", "US")
import json
print(json.dumps(result, ensure_ascii=False, indent=2))
print("[✓] CPSC 合规预检查工具测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2301.08547，但该号在 arXiv 上是《Infinite collision property for the three-dimensional uniform spanning tree》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Regulatory Compliance and Supply Chain Risk Management in CrossBorder ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品品类与名称（如婴儿玩具、婴儿推车、婴儿服装等）、目标市场（美国），可补充型号、材料与是否含电子件；粒度：单个 SKU 或单个产品款。

**输出**：CPSC 合规预检结果：适用标准（ASTM F963、16 CFR 1615/1616 等）、是否需第三方测试、所需证书（CPC/GCC）、实验室候选（SGS、Bureau Veritas、Intertek、UL）、典型费用与周期（约 $800-2500、3-6 周）及 Amazon 上传路径；供合规与运营安排送检。

## 执行步骤

1. 归入 CPSC 品类并确认是否受 CPSC 管辖
2. 匹配适用标准与第三方测试要求
3. 选定认可实验室并安排送样
4. 取得测试报告与 CPC 证书
5. 归档证书并上传 Amazon 后台

## 边界与不做

- 数据不满足时不用：产品品类与用途描述不清、或属 CPSC 不管辖品类时（如吸奶器走 FDA 医疗器械路径）不适用本技能。
- 能力边界：只输出认证路径、实验室选项与费用周期参考，不代替实验室出报告、不代办证书，也不承诺平台审核结果。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-CPSC-Children-Product-Safety

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-CPSC-Children-Product-Safety`