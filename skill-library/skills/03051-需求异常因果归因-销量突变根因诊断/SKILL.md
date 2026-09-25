---
name: "p2s-demand-anomaly-causal-attribution"
title: "Demand Anomaly Causal Attribution — 需求异常因果归因（销量突变根因诊断）"
description: "触发词：销量突降、根因诊断、销量异常归因、假设检验、BSR 下滑。何时不用：要在系统链路上实时溯源线上故障时用「ProRCA」；要从零学习全局因果图结构时用「PC算法因果发现」。安全边界：相关性不等于因果，结论必须结合业务判断；不得据单一归因排序直接执行降价或改价动作。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 商品诊断"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-Demand-Anomaly-Causal-Attribution"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "销量突然下滑时，用多假设并行检验在几分钟内给出根因排序和行动建议，不再靠猜。"
user_try: "试试：婴儿推车 BSR 从第 5 掉到第 23，用日度销量、广告花费、差评率、竞品价格和关键词排名帮我做根因诊断。"
whenToUse: "当某 ASIN 或品类销量与排名突发下滑、需要分钟级输出根因排序时用本技能；异常来自页面、支付等系统链路要实时溯源，用「ProRCA」；要做全局因果结构学习，用「PC算法因果发现」；需要 Agent 自动生成假设并调工具取证，用「根因分析 Agent」。"
workflow: "拉取异常商品的日度销量与广告花费、差评率、竞品价格、关键词排名信号 → 对每个候选假设做因果检验（含滞后相关/Granger 代理检验） → 输出根因概率排序与各假设检验结果 → 生成建议行动清单交运营执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Demand Anomaly Causal Attribution — 需求异常因果归因（销量突变根因诊断）

## ① 解决的问题

运营面临"销量突降不知根因只能瞎猜导致错误应对延误止损"——多假设并行因果检验5分钟内输出根因排序，年化减少诊断延迟损失15-30万元

## ② 核心算法逻辑

销量突然下滑时，需要快速区分原因：①平台算法变化②竞品降价③差评爆发④季节性正常波动⑤供应链缺货。因果归因框架：多假设并行检验（各信号与销量突变的时间相关性+格兰杰因果检验），输出根因排序和置信度。

## ③ 业务应用场景

场景1：婴儿推车销量突降根因诊断 - 业务问题：BSR从#5跌至#23，不知道是广告出价问题、差评问题还是竞品降价导致 - 数据要求：日度销量 + 广告花费 + 差评率 + 竞品价格 + 关键词排名 - 预期产出：根因排序（概率排名）+ 各假设检验结果 + 建议行动清单 - 业务价值：5分钟内完成根因诊断，快速止损，年化减少诊断延迟损失15-30万元
**三轨验证**： - 成本：数据整合约1人天开发，分析自动化 - 合规：使用自有业务数据，无隐私风险 - 风险：相关性≠因果，需结合业务判断综合评估

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：5分钟内完成根因诊断，快速止损，年化减少诊断延迟损失15-30万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：5分钟内完成根因诊断，快速止损，年化减少诊断延迟损失15-30万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（32 行）。**下面 32 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **32 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，32 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats

def granger_test_proxy(sales: list, signal: list, lag: int = 1) -> float:
    """简化Granger因果检验代理（相关性+时滞）"""
    if len(sales) < lag + 2: return 0.0
    s = np.array(sales[lag:])
    sig_lagged = np.array(signal[:-lag])
    corr, p = stats.pearsonr(s, sig_lagged)
    return abs(corr) * (1 - p)

def diagnose_sales_drop(sales, ad_spend, bad_review_rate, competitor_price):
    hypotheses = {
        "广告花费下降": granger_test_proxy(sales, ad_spend),
        "差评率上升": granger_test_proxy(sales, [-r for r in bad_review_rate]),
        "竞品降价": granger_test_proxy(sales, [-p for p in competitor_price]),
    }
    total = sum(hypotheses.values()) or 1
    return {k: round(v/total, 3) for k, v in sorted(hypotheses.items(), key=lambda x: -x[1])}

np.random.seed(42)
n = 30
sales = list(100 - np.arange(n)*0.5 + np.random.randn(n)*3)
ad_spend = list(50 + np.random.randn(n)*2)
bad_rate = list(0.02 + np.arange(n)*0.001 + np.random.randn(n)*0.002)
comp_price = list(30 - np.arange(n)*0.1 + np.random.randn(n))
result = diagnose_sales_drop(sales, ad_spend, bad_rate, comp_price)
print("根因排序:")
for cause, prob in result.items():
    print(f"  {cause}: {prob:.1%}")
assert sum(result.values()) > 0.99
print("[✓] Demand Anomaly Causal Attribution 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：日度粒度的销量、广告花费、差评率、竞品价格、关键词排名等信号序列，按 ASIN 或 SKU 组织，需覆盖异常发生前后足够长的窗口。

**输出**：根因概率排序 + 各假设检验结果 + 建议行动清单；供运营与商品团队快速止损。

## 执行步骤

1. 拉取异常商品的日度销量与广告、差评、竞品价格、关键词排名信号
2. 逐个候选假设做因果检验（含滞后相关/Granger 代理）
3. 输出根因概率排序与各假设的检验结果
4. 生成建议行动清单交运营团队执行

## 边界与不做

- 数据不满足：缺日度粒度信号或拿不到竞品价格时结论不可信，先补数据再诊断。
- 何时不用：异常在系统链路上要实时定位用「ProRCA」；要构建全局因果图用「PC算法因果发现」；要让 Agent 自动取证出结论用「根因分析 Agent」。
- 能力边界：只做诊断与排序，不替代实验验证，也不执行价格或广告调整动作。
- 安全边界：相关性不等于因果，结论须结合业务判断综合评估，不得据单一排序直接执行大幅降价。

## 技能关联

- **可组合**：Skill-Demand-Anomaly-Causal-Attribution

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：03-时间序列　·　源卡：`Skill-Demand-Anomaly-Causal-Attribution`