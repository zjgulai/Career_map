---
name: "p2s-blue-ocean-category-discovery"
title: "Blue Ocean Category Discovery — AI 驱动的蓝海品类机会识别与先验测试"
description: "触发词：蓝海品类、需求竞争矩阵、选品机会、先卖后造、品类方向。何时不用：品类已定、只需给具体新品打分时用「Product Opportunity Scoring」；担心召回与认证门槛时先跑「Category Compliance Prescan」。安全边界：虚拟产品试水须遵守平台发布规则，不得用虚假库存或误导性素材；搜索词数据不得用于抄袭竞品 Listing。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 趋势监测"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Blue-Ocean-Category-Discovery"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "用需求-竞争矩阵批量筛品类，找出高搜索、低满足的蓝海细分，还能先用 AI 生成图试水需求再决定要不要开发。"
user_try: "试试：用这季度的品类搜索词和 Listing 数据，帮我筛出 Top10 蓝海品类方向并排出优先级。"
whenToUse: "季度定品类方向、需要从大量候选里找高需求低竞争的细分时用本技能；若品类已定、只需判断某个新品值不值得做，用「Product Opportunity Scoring」；若担心召回与认证门槛，先跑「Category Compliance Prescan」。"
workflow: "采集品类搜索词数据与各品类 Listing 的 CTR、转化率与评论数 → 计算需求得分与竞争密度得分 → 用需求-竞争矩阵给品类分象限（蓝海 / 红海） → 结合品牌互补品偏好排优先级 → 为候选品类设计 AI 生成图的虚拟需求测试方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Blue Ocean Category Discovery — AI 驱动的蓝海品类机会识别与先验测试

## ① 解决的问题

季度选品靠人工看 BSR 耗时 1 周且频繁陷入红海——需求-竞争矩阵算法系统识别「高搜索低满足」蓝海细分，新品命中率 30%→60%+，年化节省开发成本 20-80 万元

## ② 核心算法逻辑

核心思想：传统选品流程是"先开发产品 → 备货 → 上架 → 等市场反馈"，周期长、风险大。Alibaba 的"先卖后造"（AIGI：AIGenerated Items）颠覆这个范式：用 AI 生成虚拟产品主图，先上架测试市场需求，收集真实点击和购买意向数据，再决定是否开发生产——零库存验证选品机会。

## ③ 业务应用场景

- 业务问题：母婴品牌每季度需要确定 2-3 个新品类方向，目前靠人工看 BSR 排行榜和竞品分析，耗时 1 周且容易陷入红海（已有大量竞品）。 - 数据要求： - Amazon 品类搜索词数据（Brand Analytics 或 Helium10） - 各品类现有 Listing 的 CTR/转化率/平均评论数 - 本品牌现有用户的购买行为（互补品偏好） - 预期产出： - 蓝海品类候选清单（Top-10，按需求-竞争矩阵打分） - 每个候选品类的"虚拟需求测试"方案（用 AI 生成图快速测试） - 优先级排序：需求缺口指数 × 竞争密度倒数 × 与现有品牌契合度 - 具体示例（母婴场景）：
三轨验证 | 成本轨：月均成本3,200元（AI模型调用费2,000元/月、数据标注人工1,200元/月、系统维护4小时/周），ROI周期2.8个月（LTV增长35万÷成本投入） | 合规轨：符合《个人信息保护法》第二十四条（个性化推荐需告知），需获得用户明确同意进行流失预警分析，建议在用户协议中补充
**三轨验证** | 成本轨：月均成本5,800元（第三方SaaS平台订阅3,500元/月、专业运营团队6小时/周、A/B测试数据分析2,300元/月），ROI周期3.2个月 | 合规轨：需符合《电子商务法》第十八条（不得强制交易），干预文案需标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新品命中率 30%→60%+，减少无效开发 50%，年化节省开发成本 20-80 万元
实施难度：⭐⭐☆☆☆（低，主要是数据采集 + 需求-竞争矩阵计算）
优先级：⭐⭐⭐⭐⭐（选品是跨境电商竞争的最上游，决定后续所有投入方向）
评估依据：arXiv 2503.22182，Alibaba 生产部署验证，"先卖后造"降低选品风险范式已被头部品牌采用

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（69 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/blue_ocean_category_discovery` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Blue-Ocean-Category-Discovery.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List, Dict
import statistics

@dataclass
class CategorySignal:
    category: str
    search_volume: float
    avg_ctr: float
    avg_conversion: float
    avg_review_count: float
    avg_rating: float
    top_review_complaints: List[str]
    price_range: tuple

def compute_demand_score(signal: CategorySignal) -> float:
    volume_score = min(1.0, signal.search_volume / 10000)
    unmet_need = 1 - (signal.avg_ctr * signal.avg_conversion)
    complaint_signal = min(1.0, len(signal.top_review_complaints) / 5)
    return round(0.4 * volume_score + 0.35 * unmet_need + 0.25 * complaint_signal, 3)

def compute_competition_density(signal: CategorySignal) -> float:
    review_barrier = min(1.0, signal.avg_review_count / 1000)
    quality_saturation = (signal.avg_rating - 3.5) / 1.5 if signal.avg_rating > 3.5 else 0
    ctr_competition = min(1.0, signal.avg_ctr / 0.15)
    return round(0.5 * review_barrier + 0.3 * quality_saturation + 0.2 * ctr_competition, 3)

def blue_ocean_score(signal: CategorySignal) -> Dict:
    demand = compute_demand_score(signal)
    competition = compute_competition_density(signal)
    opportunity = demand * (1 - competition)
    if opportunity >= 0.5 and competition < 0.4:
        quadrant = "🎯 蓝海（立即跟进）"
    elif demand >= 0.6 and competition >= 0.6:
        quadrant = "🔴 红海（价格战）"
    elif demand < 0.3 and competition < 0.3:
        quadrant = "😴 沙漠（无市场）"
    else:
        quadrant = "⚠️ 中性（需进一步调研）"
    unmet_signals = [c for c in signal.top_review_complaints if any(
        kw in c.lower() for kw in ['difficult', '难', 'missing', '缺少', 'wish', 'better'])]
    return {"category": signal.category, "demand_score": demand, "competition_density": competition,
            "opportunity_score": round(opportunity, 3), "quadrant": quadrant,
            "price_range": signal.price_range, "key_pain_points": signal.top_review_complaints[:2],
            "unmet_needs": unmet_signals[:2]}

def rank_blue_ocean_candidates(signals: List[CategorySignal]) -> List[Dict]:
    results = [blue_ocean_score(s) for s in signals]
    return sorted(results, key=lambda x: -x["opportunity_score"])

categories = [
    CategorySignal("有机棉婴儿睡袋（防踢被）", 8500, 0.06, 0.03, 180, 4.1,
                   ["zipper gets stuck", "too hot in summer", "difficult to wash"], (39, 79)),
    CategorySignal("吸奶器清洗消毒一体机", 6200, 0.08, 0.045, 95, 4.3,
                   ["missing brush", "motor too loud", "wish had drying function"], (49, 99)),
    CategorySignal("硅胶婴儿餐具套装", 12000, 0.12, 0.08, 2500, 4.5,
                   ["suction cup falls off", "color fades"], (25, 45)),
    CategorySignal("婴儿防晒衣（UPF50+）", 4800, 0.05, 0.025, 320, 3.9,
                   ["sizing runs small", "not breathable enough", "missing hood"], (29, 59)),
]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2503.22182，但该号在 arXiv 上是《Sell It Before You Make It: Revolutionizing E-Commerce with Personalized AI-Generated Items》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon 品类搜索词数据（Brand Analytics 或 Helium10）、各品类现有 Listing 的 CTR / 转化率 / 平均评论数，以及本品牌现有用户的互补品购买行为数据。

**输出**：蓝海品类候选清单（Top-10，按需求-竞争矩阵打分）+ 每个候选的虚拟需求测试方案 + 需求缺口与竞争密度合成的优先级排序，供选品决策使用。

## 执行步骤

1. 采集品类搜索词与 Listing 表现数据
2. 计算需求得分与竞争密度
3. 用需求-竞争矩阵划分蓝海与红海象限
4. 结合品牌契合度排优先级
5. 输出候选清单与虚拟需求测试方案

## 边界与不做

- 缺少品类级搜索词与 Listing 表现数据时不适用，矩阵打分无从计算
- 输出的是品类方向的相对机会排序，不替代合规、供应链与利润核算
- 先卖后造的虚拟测试须遵守平台发布规则，不得使用虚假库存或误导性素材

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining
- **可组合**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Blue-Ocean-Category-Discovery

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：06-增长模型　·　源卡：`Skill-Blue-Ocean-Category-Discovery`