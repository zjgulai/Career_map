---
name: "p2s-channel-saturation-curve"
title: "Channel Saturation Curve（渠道饱和曲线建模）"
description: "触发词：渠道饱和、边际 ROI、Hill 曲线、加预算衰减、预算上限、渐进加预算实验。何时不用：预算从未变动、缺少多档位历史数据时无法拟合曲线；要判断渠道的因果增量时用地理级实验。安全边界：使用渠道级投放数据即可，不涉及用户级隐私，也不得基于曲线结论对外承诺平台流量结果。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Channel-Saturation-Curve"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "判断某个渠道加预算还能不能带来回报，并给出该渠道的预算上限。"
user_try: "试试：Facebook 预算从 5 万加到 8 万后 ROAS 掉了，帮我拟合饱和曲线看上限在哪。"
whenToUse: "渠道预算接近或超出边际收益拐点、需要定预算上限时用本技能；预算长期固定无多档位数据时先做渐进加预算实验；要判断增量的因果效果时用地理级实验。"
workflow: "汇总各预算档位下的渠道 ROAS 数据 → 拟合 Hill 饱和函数得到曲线参数 → 计算半饱和点与边际 ROI 临界预算 → 确定该渠道的预算上限 → 把超出预算分配给未饱和渠道"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Channel Saturation Curve（渠道饱和曲线建模）

## ① 解决的问题

Facebook 月预算从 $5 万加到 $8 万后，ROAS 从 3.2 掉到 2.1

## ② 核心算法逻辑

论文：Deep Neural Networks for YouTube Recommendations | arXiv：1509.02472

## ③ 业务应用场景

业务问题：某母婴品牌主推婴儿推车（售价 $299，成本 $120），Facebook 月预算从 $5 万加到 $8 万后，ROAS 从 3.2 掉到 2.1。日销从 50 件降至 38 件，转化率从 4.5% 跌至 2.8%。库存积压 2000 件，需判断是否继续加预算至 $10 万。
数据要求：过去 6 个月，每周不同预算水平（$3 万–$12 万）下的 ROAS 数据，来自渐进加预算实验。
预期产出： - 拟合 Hill 曲线：$\beta=4.2, K=6.2\text{万}, \alpha=1.8$ - 半饱和点 $62,000/月，边际回报 <1 的临界点 $85,000/月 - 建议：FB 月预算上限 $75,000，超出部分分配给 TikTok 投放婴儿暖奶器（ROAS 仍为 3.8）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免过度投放 $15,000/月；年化 $180,000（约 45 万元）
实施难度：⭐⭐☆☆☆（2 星）— 曲线拟合简单
优先级评分：⭐⭐⭐⭐☆（4 星）— MMM 的自然延伸

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（42 行）。**下面 42 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **42 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，42 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/channel_saturation_curve` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Channel-Saturation-Curve.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Channel Saturation Curve — Hill 函数拟合 + 边际分析"""

import numpy as np
from scipy.optimize import curve_fit


def hill_function(x, beta, K, alpha):
    """Hill 饱和函数"""
    return beta * (x**alpha) / (K**alpha + x**alpha)


def fit_saturation_curve(spend: np.ndarray, roas: np.ndarray):
    """拟合渠道饱和曲线"""
    popt, _ = curve_fit(hill_function, spend, roas, 
                        p0=[max(roas), np.median(spend), 1.5],
                        bounds=([0, 0, 0.5], [100, max(spend)*3, 5]))
    return popt  # (beta, K, alpha)


def find_saturation_point(beta, K, alpha, min_roi=1.0):
    """找边际ROI=min_roi的饱和点"""
    for x in np.linspace(K*0.1, K*3, 1000):
        mr = beta * alpha * K**alpha * x**(alpha-1) / (K**alpha + x**alpha)**2
        if mr < min_roi:
            return x
    return K * 2


if __name__ == '__main__':
    np.random.seed(42)
    # 模拟: beta=4, K=60, alpha=1.8
    spend = np.array([10, 20, 30, 50, 70, 90, 110, 130]) * 1000
    true_roas = hill_function(spend, 4.0, 60000, 1.8)
    roas = true_roas + np.random.normal(0, 0.15, len(spend))
    
    beta, K, alpha = fit_saturation_curve(spend, roas)
    sat_point = find_saturation_point(beta, K, alpha)
    
    print(f"Hill: β={beta:.2f}, K=${K:,.0f}, α={alpha:.2f}")
    print(f"半饱和点: ${K:,.0f}/月")
    print(f"饱和点(MR<1): ${sat_point:,.0f}/月")
    print(f"\n[✓] Channel Saturation 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1509.02472，但该号在 arXiv 上是《Light Stops in a minimal U(1)x extension of the MSSM》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Deep Neural Networks for YouTube Recommendations》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去半年、每周不同预算水平下的渠道 ROAS 数据，来自渐进加预算实验；同时给出价格、成本与库存背景，便于把曲线换算成边际收益。

**输出**：Hill 曲线参数与半饱和点、边际 ROI 等于 1 的临界预算点、建议预算上限与溢出预算的去向；供投放负责人做月度预算分配。

## 执行步骤

1. 汇总不同预算档位下的渠道 ROAS 与销量数据
2. 拟合 Hill 饱和函数得到曲线参数
3. 计算半饱和点与边际 ROI 临界预算
4. 确定该渠道的预算上限
5. 把超出预算分配给未饱和渠道并给出建议

## 边界与不做

- 何时不用：渠道预算长期固定、没有多档位观测时无法拟合曲线，先设计渐进加预算实验。
- 能力边界：本技能产出曲线参数与预算上限，不做投放执行，也不保证未来流量结果。
- 数据边界：投放期间发生大促或平台改版等结构变化时，历史曲线不能直接外推到未来预算档位。

## 技能关联

- **前置**：Skill-Competitive-Response-Modeling.html、Skill-Competitive-Response-Modeling、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Competitive-Response-Modeling.html、Skill-Competitive-Response-Modeling、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-Channel-Saturation-Curve

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Channel-Saturation-Curve`