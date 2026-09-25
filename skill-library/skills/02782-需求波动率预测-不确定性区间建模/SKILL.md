---
name: "p2s-arima-garch-demand-volatility"
title: "ARIMA-GARCH Demand Volatility — 需求波动率预测（不确定性区间建模）"
description: "触发词：需求波动率、动态安全库存、GARCH建模、时变置信区间、持仓成本。何时不用：需要覆盖率保证的预测区间用「共形预测需求区间」，按国别诊断退货率用「分国退货率KPI」。安全边界：预测区间仅用于内部库存决策，不对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-ARIMA-GARCH-Demand-Volatility"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "需求忽高忽低时动态调整安全库存，波动大就多留、平稳就少压货，降低持仓成本。"
user_try: "试试：用我 180 天的日销量和促销日历，给出时变需求区间和动态安全库存建议。"
whenToUse: "本卡属需求预测中的波动率建模：需要时变波动率来定动态安全库存时用；只要点估计、或需要覆盖率保证的预测区间，用共形预测类技能。"
workflow: "准备日度销售序列与历史促销日历 → 拟合需求均值过程与波动率过程 → 输出时变需求置信区间 → 按区间折算动态安全库存建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ARIMA-GARCH Demand Volatility — 需求波动率预测（不确定性区间建模）

## ① 解决的问题

供应链计划师面临"固定安全库存在高波动期不足、平日过剩"——ARIMA-GARCH动态安全库存将持仓成本降低15%，年化节省10-20万元

## ② 核心算法逻辑

传统需求预测只给出点预测（期望值），忽略了需求波动率的时变性——大促后需求波动大，平日需求波动小。ARIMAGARCH模型联合建模均值（ARIMA）和方差（GARCH），输出时变置信区间，为动态安全库存计算提供更准确的不确定性估计。

## ③ 业务应用场景

场景1：婴儿奶粉安全库存动态优化 - 业务问题：大促后需求波动大，固定安全库存导致平日积压、大促后断货 - 数据要求：日度销售数据（180天）+ 历史促销日历 - 预期产出：时变需求置信区间 + 动态安全库存建议 - 业务价值：动态安全库存比固定安全库存减少持仓成本15%，年化节省10-20万元
**三轨验证**： - 成本：arch库安装约1分钟，模型训练秒级 - 合规：预测区间用于内部决策，不对外披露 - 风险：GARCH对短时序列拟合不稳定，需>60天数据

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：动态安全库存比固定安全库存减少持仓成本15%，年化节省10-20万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：动态安全库存比固定安全库存减少持仓成本15%，年化节省10-20万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（19 行）。**下面 19 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **19 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，19 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def simulate_arima_garch_volatility(n=100, omega=0.01, alpha=0.1, beta=0.85):
    """模拟GARCH(1,1)波动率过程"""
    sigma2 = np.zeros(n)
    returns = np.zeros(n)
    sigma2[0] = omega / (1 - alpha - beta)
    for t in range(1, n):
        sigma2[t] = omega + alpha * returns[t-1]**2 + beta * sigma2[t-1]
        returns[t] = np.random.normal(0, np.sqrt(sigma2[t]))
    return sigma2, returns

np.random.seed(42)
sigma2, ret = simulate_arima_garch_volatility()
high_vol_periods = (sigma2 > np.percentile(sigma2, 75)).sum()
print(f"高波动期占比: {high_vol_periods/len(sigma2):.1%}")
print(f"波动率范围: {sigma2.min():.4f} - {sigma2.max():.4f}")
assert high_vol_periods > 0
print("[✓] ARIMA GARCH Demand Volatility 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：日度销售数据（建议 180 天以上）与历史促销日历；SKU×日粒度，序列短于 60 天时波动率拟合不稳定。

**输出**：时变需求置信区间与动态安全库存建议（含相对固定安全库存的持仓成本变化），输出给供应链计划与补货决策。

## 执行步骤

1. 准备日度销售序列与历史促销日历。
2. 拟合需求均值过程与波动率过程。
3. 输出时变需求置信区间。
4. 按区间折算动态安全库存建议，并对比固定安全库存的持仓成本。

## 边界与不做

- 何时不用：序列短于 60 天或缺少促销日历标注时波动率建模不稳定，不适用本技能。
- 能力边界：只给区间与库存建议，不替代补货量决策；预测区间仅用于内部决策，不对外披露。

## 技能关联

- **可组合**：Skill-ARIMA-GARCH-Demand-Volatility

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-ARIMA-GARCH-Demand-Volatility`