---
name: "p2s-signaling-game-brand-premium"
title: "Signaling Game for Brand Premium—价格作为质量信号"
description: "触发词：价格信号、品牌溢价、折扣深度、价格带一致性、促销节奏。何时不用：要做价格弹性的销量与利润测算用定价优化类方法，本技能判断降价是否破坏品牌质量信号并给出保价区间。安全边界：不得与竞品约定价格或交换定价信息（涉价格合谋风险），价格形成机制须依法明示，折扣宣称须真实。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-086"
l3_business: "品牌定位"
l3_all: "品牌定位 / 价格敏感性"
l1_l2_l3: "业务运营/品牌与增长/品牌定位"
p2s_card_id: "Skill-Signaling-Game-Brand-Premium"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清楚降多少价会让品牌从高档货变成打折货，守住长期溢价。"
user_try: "试试：用我们的历史价格和复购数据，算出高端吸奶器的临界降价区间和保价线。"
whenToUse: "频繁促销后担心品牌被当成可打折的普通货、需要给出可接受的降价区间与跨站点价格带时用本技能；做销量与利润的价格弹性模拟用定价优化类方法。"
workflow: "整理历史价格、折扣与转化数据 → 估计价格与感知质量的信号关系 → 计算临界降价区间 → 给出品牌溢价保护线 → 统一跨站点折扣策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Signaling Game for Brand Premium—价格作为质量信号

## ① 解决的问题

品牌负责人面临"频繁促销后品牌溢价下降用户心理锚点永久降低"——信号博弈分离均衡维持品牌价格信号完整性，年化品牌价值保护$8万+

## ② 核心算法逻辑

论文：Job Market Signaling | 年份：1973（Spence, QJE）；现代博弈论扩展见 Signaling Games and Equilibrium Selection (Cho & Kreps, 1987)

## ③ 业务应用场景

场景A：高端吸奶器品牌保价 - 业务问题：大促频繁降价后，用户开始把品牌当成“可打折普通货” - 数据要求：历史价格、折扣深度、转化率、星级评分、复购率 - 预期产出：临界降价区间、品牌溢价保护线 - 业务价值：防止信号坍塌，保护长期溢价能力
场景B：跨市场价格一致性管理 - 业务问题：不同站点价格差异过大，用户跨站比价后产生信任损失 - 数据要求：站点价格、运费、税费、转化、搜索词点击率 - 预期产出：可接受价格带、站点统一折扣策略 - 业务价值：减少“低价信号”对品牌定位的侵蚀
**三轨验证** | 成本轨：AI动态定价系统月均成本3,200元（云服务器1,500元/月+算法优化工程师160小时/月×15元/小时=2,400元+数据标注200元），ROI周期2.1个月（基于GMV+23%增长） | 合规轨：符合《反垄断法》第十七条（不构成垄断行为），符合《电商法》第二十一条（明示价格形成机制），需在商品详情页展示

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：维持价格信号均衡，年化品牌价值保护约 $8 万+
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：直接影响高端品牌心智与长期毛利，不适合短期粗暴促销

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（51 行）。**下面 51 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **51 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，51 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/signaling_game_brand_premium` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Signaling-Game-Brand-Premium.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List, Dict


@dataclass
class Seller:
    quality: str
    cost: float
    price: float


def posterior_high_quality(prior: float, price: float, threshold: float) -> float:
    if price >= threshold:
        likelihood_high = 0.9
        likelihood_low = 0.3
    else:
        likelihood_high = 0.4
        likelihood_low = 0.8
    num = likelihood_high * prior
    den = num + likelihood_low * (1 - prior)
    return num / den if den else prior


def separating_equilibrium_band(high_cost: float, low_cost: float, premium: float) -> Dict[str, float]:
    low_type_max = low_cost + premium * 0.6
    high_type_min = high_cost + premium * 0.8
    return {"low_type_max": low_type_max, "high_type_min": high_type_min, "gap": high_type_min - low_type_max}


def analyze_brand_pricing(sellers: List[Seller]):
    band = separating_equilibrium_band(18, 10, 12)
    out = []
    for s in sellers:
        belief = posterior_high_quality(0.6, s.price, band["high_type_min"])
        out.append({"quality": s.quality, "price": s.price, "belief": round(belief, 3)})
    return band, out


def main():
    sellers = [Seller("high", 18, 29), Seller("low", 10, 17), Seller("high", 18, 24)]
    band, out = analyze_brand_pricing(sellers)
    print("Equilibrium band:", band)
    for row in out:
        print(row)
    assert band["gap"] > 0
    assert out[0]["belief"] > out[1]["belief"]
    print("[✓] 信号博弈测试通过")


if __name__ == "__main__":
    main()
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.09268，但该号在 arXiv 上是《A Shuffling Theorem for Reflectively Symmetric Tilings》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Job Market Signaling》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史价格、折扣深度、转化率、星级评分与复购率；跨市场场景另需各站点价格、运费、税费、转化与搜索词点击率。

**输出**：临界降价区间与品牌溢价保护线、可接受价格带与站点统一折扣策略建议；卡页口径年化品牌价值保护约 8 万美元以上。

## 执行步骤

1. 整理历史价格、折扣深度与转化、复购数据。
2. 建立价格与感知质量之间的信号关系假设。
3. 计算分离均衡下的临界降价区间与保护线。
4. 输出可接受价格带与跨站点统一折扣策略。
5. 按结论调整促销节奏，并跟踪星级与复购变化。

## 边界与不做

- 缺少跨周期的价格与折扣历史数据时不要用，临界区间无法估计。
- 能力边界：模型给出的是维持质量信号的区间，不是销量最优价，也不预测促销短期收益；卡页的价值保护为估算口径。
- 合规红线：不得与竞品约定价格或交换定价信息（涉价格合谋风险），价格形成机制须依法明示，折扣宣称须真实。

## 技能关联

- **可组合**：Skill-Signaling-Game-Brand-Premium

---

> 分类：业务运营/品牌与增长/品牌定位　·　技术族：17-价格优化　·　源卡：`Skill-Signaling-Game-Brand-Premium`