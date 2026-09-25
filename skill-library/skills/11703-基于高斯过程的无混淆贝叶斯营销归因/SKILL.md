---
name: "p2s-identified-bayesian-mmm"
title: "Identified Bayesian MMM — 基于高斯过程的无混淆贝叶斯营销归因"
description: "触发词：MMM诊断、贝叶斯MMM、饱和与混淆、ROAS可信度、实验处方。何时不用：各渠道已有充足随机实验可直接读增量时不用诊断；本技能用于只有平稳投放数据、先判断ROAS可不可信。安全边界：遵守个人信息保护规范与平台API条款，数据处理需建立数据处理协议（DPA）。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Identified-Bayesian-MMM"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "先判断这份 MMM 报告的 ROAS 到底可不可信，给风险渠道打标签，并开出处方：该用哪一次停投或超投实验来验证。"
user_try: "试试：MMM 说 TikTok ROAS 极高、建议把 Meta 预算砍半，帮我诊断这个结论有没有把旺季当成渠道能力。"
whenToUse: "当手上只有平稳投放数据、渠道 spend 与转化高度共线，需要先判断 MMM 的 ROAS 是否可信、该补哪一次实验时用；已有停投/超投实验实测提升比时直接用实验结果，不必做诊断。"
workflow: "汇总 90 天以上日级分渠道 spend 与 conversions 数据 → 整理每渠道至少一次关停或超投的实验记录 → 运行诊断输出风险标签与实验处方 → 按处方在局部区域执行停投或超投，并把实测提升比写入模型 → 拟合模型绘制饱和曲线，按边际 ROAS 给出预算建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Identified Bayesian MMM — 基于高斯过程的无混淆贝叶斯营销归因

## ① 解决的问题

CMO 拿到内部 MMM 报告，显示"TikTok ROAS 极高远未饱和，建议把 Meta 预算砍半全移给 TikTok"

## ② 核心算法逻辑

传统开源 MMM（Robyn / Meridian）在仅有平稳投放数据时，会陷入一个数学死结：非线性饱和效应（spend 越多边际回报越低） 与 时变效应（节假日转化本就更好） 在数学上"观测等价"——两个完全不同的数据生成过程可以产生完全相同的观测值。这意味着模型给出的 ROAS 可能是系统性偏差的，据此做的预算决策会踩坑。

## ③ 业务应用场景

- 业务问题：CMO 拿到内部 MMM 报告，显示"TikTok ROAS 极高远未饱和，建议把 Meta 预算砍半全移给 TikTok"。过去半年 TikTok 均匀花出，数据平稳，但心里极没底——不知道高 ROAS 究竟是因为渠道牛还是碰上了旺季。 - 数据要求： - 90 天以上的日级三渠道（Google / Meta / TikTok）spend + conversions 数据 - 每渠道至少一次关停或超投实验记录（期间、倍率、实测提升比） - 操作路径： 1. `mmm.diagnose()` 输出诊断报告，TikTok 被标为 HIGH RISK，附实验处方 2. 按处方在德州区
- 业务问题：品牌方希望在 618 前确认 Google Shopping 当前是否还有边际 ROAS 空间，还是已经深度饱和，不该再加仓。 - 数据要求： - 近 60 天 Google 日级 spend + 转化数据 - 过去 2–3 次周末/节促期间的超投记录（自然发生的预算脉冲也算） - 操作路径： 1. 仅用 Google 渠道数据初始化 `IdentifiedBayesianMMM` 2. 若历史峰谷比 ≥ 2×，直接 `fit()` 即可；若平稳则补充一次测试性周末超投 3. 调用 `gp.predict(spend_query)` 绘制完整饱和曲线，`gp.marginal_r
三轨验证 | 成本轨：月均投入3,500元（数据平台订阅1,200元+分析工具800元+人工成本1,500元/12小时），ROI周期6周 | 合规轨：符合《个人信息保护法》数据使用规范，TikTok/Amazon官方API接入合规，需建立数据处理协议(DPA)，风险等级：低 | 风险轨：数据延迟2-3天影响决策准确性(概率35%)、平台API变更导致模型失效(概率15%)、跨境数据传输合规风险(概率20%)

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
实验成本：2 天局部区域（约 5% 流量）的停投损失，约 0.5–2 万元
保护价值：避免年度预算误分配，中型品牌（年广告 1000 万元）潜在年化收益 100–500 万元
投入产出比：保守估算 50–250 倍
实施难度：⭐⭐☆☆☆（2/5）
数学部分已封装，业务侧主要难点在于推动团队执行关停实验（需跨部门协调）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（81 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/identified_bayesian_mmm` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Identified-Bayesian-MMM.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
使用方法示例: Identified Bayesian MMM 三渠道归因与预算优化
依赖: numpy (已内置于 model.py)
"""
import numpy as np
from model import (
    ChannelData,
    ExperimentalShock,
    IdentifiedBayesianMMM,
)

# --- 1. 准备数据 ---
# 替换为真实数据: pd.DataFrame 按渠道拆分后转 numpy
tiktok = ChannelData(
    name="TikTok",
    spend=np.array([10000] * 90, dtype=float),        # 日投放金额
    conversions=np.array([14500] * 90, dtype=float),  # 日转化金额
)
meta = ChannelData(
    name="Meta",
    spend=np.linspace(5000, 15000, 90),
    conversions=np.linspace(8000, 18000, 90) + np.random.default_rng(0).normal(0, 500, 90),
)
google = ChannelData(
    name="Google",
    spend=np.where(np.arange(90) % 7 >= 5, 20000, 8000).astype(float),
    conversions=np.where(np.arange(90) % 7 >= 5, 28000, 12000).astype(float)
               + np.random.default_rng(1).normal(0, 300, 90),
)

# --- 2. 初始化模型并诊断 ---
mmm = IdentifiedBayesianMMM([tiktok, meta, google])
report = mmm.diagnose()

print("=== 可识别性诊断 ===")
for ch, risk in report.channel_risks.items():
    print(f"  {ch}: {risk}")

if report.experiment_prescriptions:
    print("\n=== 实验处方 ===")
    for p in report.experiment_prescriptions:
        print(f"  {p}")

# --- 3. 录入实验冲击数据（执行实验后填写） ---
# 场景: 第 80-83 天对德州区域停投 TikTok
mmm.add_shock(ExperimentalShock(
    channel="TikTok",
    shock_period=(80, 83),
    spend_multiplier=0.0,   # 完全停投
    observed_lift=0.08,     # 停投后转化跌至基线的 8%（实测数据）
))
# 第 83-86 天同区域超投 3 倍
mmm.add_shock(ExperimentalShock(
    channel="TikTok",
    shock_period=(83, 86),
    spend_multiplier=3.0,
    observed_lift=1.75,     # 转化提升至基线的 1.75 倍（实测数据）
))

# --- 4. 拟合模型 ---
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2408.07678 — Your MMM is Broken: Identification of Nonlinear and Time-varying Effects in Marketing Mix Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：90 天以上的日级分渠道（如 Google、Meta、TikTok）spend 与 conversions 数据；每渠道至少一次关停或超投实验记录（期间、倍率、实测提升比）；若曲线平稳，可用自然发生的预算脉冲（周末或节促超投）补充。

**输出**：渠道风险诊断报告（把高风险渠道标记并附实验处方）、高斯过程拟合的饱和曲线与边际 ROAS 查询结果，供预算再分配决策使用；卡页示例中一次局部实验成本约 0.5-2 万元。

## 执行步骤

1. 汇总 90 天以上日级分渠道 spend 与 conversions 数据
2. 整理每渠道至少一次关停或超投实验记录
3. 运行诊断，输出风险标签与实验处方
4. 按处方在局部区域执行停投或超投，并写入实测提升比
5. 拟合模型绘制饱和曲线，按边际 ROAS 给出预算建议

## 边界与不做

- 何时不用：各渠道已有充足随机实验可直接给出增量结论时不必诊断；只有平稳数据又没有任何预算脉冲可借时，诊断结论本身也不可信。
- 能力边界：诊断只指出风险与所需实验，不放行预算调整；停投/超投实验需跨部门协调，实验期间会有真实销量损失（卡页示例约 0.5-2 万元）。
- 合规边界：遵守个人信息保护规范与平台 API 条款，数据处理需建立数据处理协议（DPA）。
- 卡页数字（年广告 1000 万元品牌年化收益 100-500 万元、50-250 倍投入产出比）为示例估算，不可直接外推。

## 技能关联

- **前置**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **延伸**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Identified-Bayesian-MMM

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：15-营销投放分析　·　源卡：`Skill-Identified-Bayesian-MMM`