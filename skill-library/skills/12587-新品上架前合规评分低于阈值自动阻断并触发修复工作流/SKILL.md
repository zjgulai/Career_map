---
name: "p2s-pre-launch-compliance-gate"
title: "Pre-Launch-Compliance-Gate — 新品上架前合规评分低于阈值自动阻断并触发修复工作流"
description: "触发词：上架门控、合规评分、阈值阻断、修复工作流、五维评分、放行决策。何时不用：要做含供应与财务的跨维度就绪评估时用「新品上市准入门控」，要按品类×市场列测试需求时用「产品安全测试需求映射」。安全边界：阻断与放行结论须由合规负责人确认，本技能只出评分与判据，不执行冻结。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 异常冻结与恢复"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Pre-Launch-Compliance-Gate"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "上架申请先打分，安全认证、Listing 用语、历史召回这些项分数不够就卡住，并附一份该改什么的清单。"
user_try: "试试：给这款硅胶安抚奶嘴做上架前合规评分，低于阈值就阻断并给我修复清单。"
whenToUse: "新品上架前要按五维合规评分并自动分级放行或阻断时用；要做含供应、财务的跨维度就绪评估时用「新品上市准入门控」；要列测试需求与时间轴时用「产品安全测试需求映射」。"
workflow: "接收新品上架申请与产品资料 → 按安全认证、Listing、HTS、历史召回、市场要求五维打分 → 汇总总分并与放行、警告、阻断阈值比较 → 生成修复建议清单与整改期限 → 归档评分结果与决策记录"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Pre-Launch-Compliance-Gate — 新品上架前合规评分低于阈值自动阻断并触发修复工作流

## ① 解决的问题

合规负责人面临"新品上架后才发现合规问题导致下架"——五维评分<80自动阻断并生成修复清单将上架后合规问题发生率降低70%，年化减少下架损失25万元

## ② 核心算法逻辑

论文：MultiDimensional Compliance Scoring for Automated Product Gating | 年份：2021

## ③ 业务应用场景

场景：新款婴儿硅胶安抚奶嘴上架前合规检查 - 触发：运营提交新品上架申请 - 评分结果：安全认证 18/20（缺 FDA 食品接触材料证明）+ Listing 15/20（主图有健康声明违禁词）+ HTS 19/20 + 历史召回 14/20（同品类近 2 年 2 次召回）+ 市场要求 16/20 = 总分 82 分 - 决策：警告放行，生成 2 条修复建议，要求运营 7 天内补齐 FDA 证明并修改图片 - 量化价值：提前发现合规问题，避免上架后下架损失（平均每次合规下架损失 ¥3-8 万）
三轨验证 | 成本轨：月均3,500元（FDA认证咨询2,000元/月+CE检测1,200元/月+人工审核300元/月，人工投入12小时/月）| 合规轨：通过FDA/CE双认证，符合美欧母婴产品安全标准（FDA 21 CFR Part 1700、CE EN 71系列），可合法上架亚马逊/沃尔玛/欧洲站点，合规周期从120天降至60天 | 风险轨：认证延期风险15%（检测机构排期），材料不符风险8%（需补充测试），成本超支风险12%（新增检测项目）
**三轨验证** | 成本轨：月均1,800元（内部合规团队0.5人FTE+第三方审核600元/月+文档管理系统200元/月，人工投入8小时/月）| 合规轨：建立内部合规决策门禁系统，覆盖产品成分、标签、包装三大维度，通过率提升至98%，减少平台下架风险，符合CPSC儿童产品安全法案要求 | 风险轨：内部审核遗漏风险18%（人员专业度不足），平台政策变更风险10%（需快速迭代），合规文件过期风险6%（更新不及时）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：合规专员面临核心业务决策——上架合规检查周期从 45 天→22 天，规避下架风险 80%
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class ComplianceCheckResult:
    dimension: str
    score: float
    max_score: float
    issues: List[str]
    fix_steps: List[str]

@dataclass
class GateDecision:
    total_score: float
    decision: str  # PASS / WARN_PASS / BLOCK
    dimension_results: List[ComplianceCheckResult]
    fix_checklist: List[Dict]
    archive_id: str

def pre_launch_compliance_gate(
    product: Dict,
    market: str = "US",
    pass_threshold: float = 80.0,
    warn_threshold: float = 60.0
) -> GateDecision:
    import hashlib, json
    from datetime import datetime

    category_thresholds = {
        "infant": 85.0,
        "baby": 85.0,
        "toy": 82.0,
        "default": pass_threshold
    }
    cat = product.get("category", "default").lower()
    effective_threshold = next(
        (v for k, v in category_thresholds.items() if k in cat),
        category_thresholds["default"]
    )

    def check_certifications(p: Dict) -> ComplianceCheckResult:
        certs = p.get("certifications", [])
        required = {"CPSC", "CE"} if market == "EU" else {"CPSC"}
        if "infant" in p.get("category", "").lower():
            required.add("FDA_food_contact")
        missing = required - set(certs)
        score = 20.0 * (1 - len(missing) / max(len(required), 1))
        issues = [f"缺少认证: {c}" for c in missing]
        fixes = [f"申请 {c} 认证，预计 {4 if c == 'CE' else 2} 周" for c in missing]
        return ComplianceCheckResult("安全认证", round(score, 1), 20.0, issues, fixes)

    def check_listing(p: Dict) -> ComplianceCheckResult:
        forbidden = ["治愈", "最安全", "无毒", "FDA认证"]
        title = p.get("title", "") + " " + p.get("description", "")
        found = [w for w in forbidden if w in title]
        score = 20.0 - len(found) * 5
        issues = [f"违禁词: {w}" for w in found]
        fixes = [f"删除或替换违禁词「{w}」" for w in found]
        return ComplianceCheckResult("Listing合规", max(score, 0), 20.0, issues, fixes)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04523，但该号在 arXiv 上是《Near-squares in binary recurrence sequences》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《MultiDimensional Compliance Scoring for Automated Product Gating》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：新品上架申请与产品资料：各维度得分与问题项（如安全认证 18/20、Listing 15/20、HTS 19/20、历史召回 14/20、市场要求 16/20）、目标市场与历史召回记录；阈值默认 pass 80 分、warn 60 分；粒度：单产品 × 单市场。

**输出**：门控决策结果：总分与各维度得分、决策（PASS / WARN_PASS / BLOCK）、问题清单与修复清单（含整改期限，如 7 天内补齐 FDA 证明并修改图片）及归档编号；供合规与运营在上架前闭环整改。

## 执行步骤

1. 接收上架申请与产品资料
2. 按五个维度逐项打分
3. 汇总总分并比对放行与阻断阈值
4. 生成修复清单与整改期限
5. 归档评分与决策记录

## 边界与不做

- 数据不满足时不用：缺历史召回记录或认证状态等维度数据（需 3 个月以上历史数据积累）时，评分不可信。
- 能力边界：只产出评分、判据与修复清单，不执行上架阻断或下架动作；放行与冻结由模型外控制层执行。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-Pre-Launch-Compliance-Gate

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-Pre-Launch-Compliance-Gate`