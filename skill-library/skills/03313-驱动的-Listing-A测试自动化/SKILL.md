---
name: "p2s-listing-ab-testing-automation"
title: "Listing AB Testing Automation — LLM Agent 驱动的 Listing A/B 测试自动化"
description: "触发词：A/B 测试、买家 persona、零流量预测、主图版本对比、上线前取舍。何时不用：要看真实流量实验用平台自带实验工具；本技能是用 persona 模拟做上线前预测。安全边界：不涉真实用户数据，模拟结论须用少量真实流量复核，不得绕过平台实验规范。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-AB-Testing-Automation"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不用等三周真实流量，先让几百个虚拟买家替你选出更好的主图和标题版本。"
user_try: "试试：模拟 500 个不同买家 persona，帮我在三个主图方案里挑出转化最好的一个。"
whenToUse: "当有多个 Listing 版本要在上线前快速取舍、不想承担真实流量损耗时用；平台规则内的正式 A/B 实验仍应保留做验证。"
workflow: "创建覆盖不同买家类型的 persona Agent → 每个 Agent 对各版本输出购买意愿分与理由 → 按 persona 权重加权汇总预测点击率与转化率 → 选最优版本上线并用少量真实流量复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Listing AB Testing Automation — LLM Agent 驱动的 Listing A/B 测试自动化

## ① 解决的问题

主图/标题/Bullet 哪个版本更好需要 3 周真实流量测试，期间低效版本持续损耗转化——LLM Agent 模拟 500 个买家 persona 零流量预测最优版本，CTR+12.5%/CVR+8.3%，年化自然流量提升 60%+

## ② 核心算法逻辑

核心思想：传统 Listing A/B 测试需要真实流量（至少 5001000 次曝光），耗时 24 周，且测试期间低质版本会损耗转化率。AgentA/B 框架用 LLM Agent 模拟多样化买家 persona，在上线前就能预测哪个版本效果更好——1000 个 Agent 模拟相当于 24 周真实测试，全程零流量损耗。

## ③ 业务应用场景

场景：吸奶器主图 A/B 测试（零流量预测）
- 业务问题：品牌有 3 个主图方案（白底/妈妈使用场景/医院推荐场景），传统测试需要拆分流量跑 3 周，期间低效版本损耗约 30% 转化。 - LLM Agent 测试流程： 1. 创建 500 个不同 persona 的 LLM Agent（新手妈妈/有经验妈妈/职场妈妈等） 2. 每个 Agent 分别"看"3 个版本的 Listing，输出购买意愿分（0-10）+ 理由 3. 按 persona 权重加权汇总，输出预测 CTR 和 CVR 4. 选出最优版本直接上线，节省 3 周测试时间 - 实测结果参考：论文2 在线 A/B 验证 CTR +12.5%、CVR +8.3%。 - 业务
三轨验证： - 成本：LLM API 调用费用约 $0.5-2/次测试（500 个 Agent × 3 版本 × 输入输出 token），人力成本集中在 persona 库初始构建（约 2-3 人天），后续维护成本极低。 - 合规：不涉及真实用户数据，无 GDPR/CCPA 风险；模拟测试不触碰 Amazon A/B 测试工具政策（Manage Your Experiments），但上线后仍需遵守 Amazon 主图/标题规范（如不得使用医疗认证图标除非已获授权）。 - 风险：模拟预测可能与真实结果偏差（尤其当 persona 库未覆盖关键买家群体时），建议首次使用后以 10% 真实流量做验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：年做 12 次测试，每次 CTR +5%，年化自然流量提升 60%+，对应 GMV 增量 30-150 万元
实施难度：⭐⭐⭐☆☆（中等，需要 LLM API + persona 库构建）
优先级：⭐⭐⭐⭐⭐（Listing 优化是最高频最直接的转化率提升手段）
评估依据：arXiv 2504.09723（Amazon.com 案例验证）+ arXiv 2505.23809（在线 A/B：CTR +12.5%，CVR +8.3%）
成本：LLM API 调用费用约 $0.5-2/次测试（500 个 Agent × 3 版本 × 输入输出 token），人力成本集中在 persona 库初始构建（约 2-3 人天），后续维护成本极低。
合规：不涉及真实用户数据，无 GDPR/CCPA 风险；模拟测试不触碰 Amazon A/B 测试工具政策（Manage Your Experiments），但上线后仍需遵守 Amazon 主图/标题规范（如不得使用医疗认证图标除非已获授权）。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（76 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/advertising/listing_ab_testing_automation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Listing-AB-Testing-Automation.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict
import statistics

@dataclass
class BuyerPersona:
    name: str
    weight: float
    priorities: List[str]
    price_sensitivity: float

@dataclass
class ListingVariant:
    variant_id: str
    title: str
    main_image_type: str
    bullet_style: str
    price: float

def simulate_persona_score(persona: BuyerPersona, variant: ListingVariant) -> float:
    score = 5.0
    if "price" in persona.priorities and variant.price < 85:
        score += 1.5 * persona.price_sensitivity
    if "quality" in persona.priorities and "award" in variant.title.lower():
        score += 1.2
    if "convenience" in persona.priorities and variant.main_image_type == "lifestyle":
        score += 1.0
    if "medical" in persona.priorities and "hospital" in variant.main_image_type:
        score += 1.5
    if variant.bullet_style == "problem_solution" and "new_mom" in persona.name:
        score += 0.8
    if variant.bullet_style == "features" and "experienced" in persona.name:
        score += 0.5
    return min(10.0, round(score + (hash(persona.name + variant.variant_id) % 10) * 0.1, 2))

def run_ab_test(variants: List[ListingVariant],
                personas: List[BuyerPersona],
                n_simulations: int = 200) -> List[Dict]:
    results = []
    for variant in variants:
        scores = []
        for persona in personas:
            for _ in range(max(1, int(n_simulations * persona.weight))):
                scores.append(simulate_persona_score(persona, variant))
        mean_score = statistics.mean(scores)
        predicted_ctr = min(0.20, mean_score / 10 * 0.15)
        predicted_cvr = min(0.15, mean_score / 10 * 0.10)
        results.append({"variant_id": variant.variant_id,
                         "title_preview": variant.title[:40],
                         "main_image": variant.main_image_type,
                         "mean_score": round(mean_score, 2),
                         "predicted_ctr_pct": round(predicted_ctr * 100, 1),
                         "predicted_cvr_pct": round(predicted_cvr * 100, 1),
                         "predicted_revenue_index": round(predicted_ctr * predicted_cvr * 1000, 1)})
    return sorted(results, key=lambda x: -x["predicted_revenue_index"])

personas = [
    BuyerPersona("new_mom_first", 0.35, ["quality","medical","convenience"], 0.4),
    BuyerPersona("experienced_mom", 0.25, ["features","price"], 0.7),
    BuyerPersona("working_mom",    0.20, ["convenience","price"], 0.6),
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2504.09723 — AgentA/B: Automated and Scalable Web A/BTesting with Interactive LLM Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待测 Listing 变体（标题、主图类型、要点风格、价格）与买家 persona 库（权重、关注点、价格敏感度）。

**输出**：各变体的加权购买意愿得分与预测点击率、转化率，最优版本建议与预测分歧说明，供上线决策。

## 执行步骤

1. 构建覆盖主要买家类型的 persona 库与权重
2. 让每个 persona 对全部版本输出购买意愿与理由
3. 按 persona 权重加权汇总预测点击率与转化率
4. 选出最优版本并输出预测依据
5. 上线后用少量真实流量复核预测偏差

## 边界与不做

- 何时不用：persona 库未覆盖核心买家群体时预测会偏，需先补齐或缩窄结论
- 能力边界：只做上线前预测与版本排序，模拟结果不等于真实平台表现，不替代正式 A/B 实验

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-AutoQual-Review-Quality-Assessment.html、Skill-AutoQual-Review-Quality-Assessment、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring
- **延伸**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring
- **可组合**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-AB-Testing-Automation

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Listing-AB-Testing-Automation`