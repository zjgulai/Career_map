---
name: "p2s-timecma-llm-forecasting"
title: "TimeCMA - LLM-Empowered Multivariate Time Series Forecasting via Cross-Modality Alignment"
description: "触发词：TimeCMA、跨模态对齐、事件提示、语义增益、多变量预测。何时不用：没有事件文本、纯数值预测时用常规多变量模型；要做多尺度分解的少样本预测用「LLM-Mixer」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-TimeCMA-LLM-Forecasting"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "让模型既看懂数字周期，又读懂超级碗这类事件描述，节日暴涨不会再被当异常值剔掉。"
user_try: "试试：把超级碗事件描述和过去 90 天销量一起喂给 TimeCMA，看未来 7 天该多备多少。"
whenToUse: "促销或事件文本会显著改变需求、需要跨模态对齐时用；没有事件文本时用常规多变量模型；要多尺度分解的少样本预测用 LLM-Mixer。"
workflow: "整理过去 90 天的日销量、浏览量、加购数三变量序列 → 从节日日历或新闻抽取事件 Prompt 文本 → 双分支编码后做跨模态对齐并输出预测 → 对比有无 Prompt 的预测差异以量化语义增益"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TimeCMA - LLM-Empowered Multivariate Time Series Forecasting via Cross-Modality Alignment

## ① 解决的问题

业务分析师面临节假日波动难解释——TimeCMA将预测误差降18%，年化省11万元

## ② 核心算法逻辑

TimeCMA 解决的核心问题是：如何让 LLM 的世界知识真正改善时间序列预测，而不仅仅是把数值序列塞进 Prompt 让 LLM 凑答案。传统纯数值模型（Prophet、TFT）只认识历史数字，一旦遭遇"超级碗促销"、"政策限令"等文本事件就彻底失效；直接把序列转文本输入给 LLM 则会导致语义噪声污染数值周期信号。TimeCMA 通过双分支编码 + 跨模态对齐精确解决了这对矛盾。

## ③ 业务应用场景

业务问题： 跨境出海零食/母婴类目在"超级碗"、"感恩节"、"母亲节"前后会出现脉冲式销量暴增，但纯数值模型把这类暴涨视为"异常值"过滤掉，导致严重缺货。需要提前 7 天预测超预期涨幅并触发补货。
数据要求： - 历史数值：过去 90 天的日销量、页面浏览量、购物车添加数（3 个变量）。 - 事件 Prompt：人工或 NLP 从节日日历 / 新闻中抽取，如：`"超级碗本周日举行，薯片、饮料类目预计销量增加 30%"`。 - 格式：`(seq_len=90, n_vars=3)` 数值数组 + 字符串 Prompt。
预期产出： - 未来 7 天各变量预测值（归一化空间，可反归一化为实际销量）。 - 有/无事件 Prompt 的对比预测，量化"LLM 语义增益"。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5,000 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（45 行）。**下面 45 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **45 行，未到上限**（可能即为源站发布的全部）。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 1 行：invalid syntax）。上文那份完整实现同样未能通过 `ast.parse`，请以实际文件为准。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/timecma_llm_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-TimeCMA-LLM-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills-code.03-时间序列.time_cma_llm_2025.model import (
    TimeCMA,
    generate_ecommerce_data,
    train_timecma,
    evaluate_timecma,
    predict_with_event,
    encode_prompt,
)

# ── 1. 初始化模型 ──────────────────────────────────────────────
model = TimeCMA(
    seq_len=96,       # 历史序列长度（天）
    pred_len=7,       # 预测步数（天）
    n_vars=3,         # 变量数：[销量, PV, 加购数]
    patch_len=16,     # Patch 长度
    d_model=128,      # 数值分支维度
    d_llm=256,        # LLM 分支输出维度
    d_align=128,      # 对齐空间维度
    prompt_dim=64,    # Prompt 向量维度
    alpha=0.1,        # 对比损失权重
)

# ── 2. 生成模拟数据（含业务事件 Prompt）──────────────────────
data = generate_ecommerce_data(
    n_samples=200, seq_len=96, pred_len=7, n_vars=3, prompt_dim=64
)

# ── 3. 训练 ───────────────────────────────────────────────────
losses = train_timecma(model, data, n_epochs=20, batch_size=32, lr=1e-3)

# ── 4. 评估 ───────────────────────────────────────────────────
metrics = evaluate_timecma(model, data)
print(f"MAE={metrics['MAE']}, MSE={metrics['MSE']}, MAPE={metrics['MAPE_pct']}%")

# ── 5. 带业务事件的单次预测（生产接口）───────────────────────
import numpy as np
history = np.random.randn(96, 3).astype("float32")  # 替换为真实归一化数据
pred = predict_with_event(
    model,
    history_data=history,
    event_description="超级碗本周日举行，零食类目销量预计上涨 30%",
    prompt_dim=64,
)
print(f"未来 7 天预测 (归一化空间): {pred}")
print("[✓] TimeCMA LLM Forecasting 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.01638 — TimeCMA: Towards LLM-Empowered Multivariate Time Series Forecasting via Cross-Modality Alignment

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去 90 天三个数值变量（日销量、页面浏览量、购物车添加数）与事件 Prompt 文本；格式为 90 步长乘 3 变量的数值数组加字符串提示。

**输出**：未来 7 天各变量预测值与有无事件 Prompt 的对比预测（量化 LLM 语义增益），供节日脉冲场景的提前补货触发使用。

## 执行步骤

1. 整理三变量数值序列与事件 Prompt
2. 双分支编码并做跨模态对齐
3. 输出未来 7 天预测
4. 对比有无 Prompt 量化语义增益
5. 据预测涨幅触发提前补货

## 边界与不做

- 数据不满足时不用：没有事件文本、或事件与品类需求无关时，跨模态对齐的增益消失。
- 能力边界：只做预测与增益量化，不决定备货量与投放动作。

## 技能关联

- **前置**：Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-Dial-In-LLM
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-TimeCMA-LLM-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-TimeCMA-LLM-Forecasting`