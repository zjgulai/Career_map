---
name: "p2s-carbon-footprint-ml-model"
title: "ML模型碳足迹评估 — 可持续AI的算力碳排放量化"
description: "触发词：AI碳足迹、算力碳排放、Scope 3、绿色区域部署、ESG披露。何时不用：供应链与物流碳排优化时用绿色物流类技能；AI 社会影响评估用「AI Social Impact Measurement」。安全边界：碳排数据用于对外披露须第三方审计；电网碳强度取值须使用最新可追溯来源，不得为达标美化数据。"
l1_id: ""
l1_plane: "未归类（矩阵空白）"
l2_id: ""
l2_domain: "未归类（矩阵空白）"
l3_id: ""
l3_business: "（矩阵空白）"
l3_all: ""
l1_l2_l3: "未归类（矩阵空白）"
p2s_card_id: "Skill-Carbon-Footprint-ML-Model"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "把训练和推理用掉的算力换算成碳排放，既能应对 ESG 披露，也能找出更省电的部署区域。"
user_try: "试试：按我的 GPU 型号、训练时长和部署区域，算一下 AI 系统的年度碳排放和迁移到低碳区域的减排空间。"
whenToUse: "需要按 GHG Protocol 口径量化 AI 训练与推理碳排放并支撑 ESG 披露时用；物流与包装碳排优化用绿色物流类技能；AI 社会影响评估用社会影响类技能。"
workflow: "收集 GPU 与部署区域数据 → 计算训练与推理碳排放 → 比较区域间排放差异 → 输出碳足迹报告与优化建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ML模型碳足迹评估 — 可持续AI的算力碳排放量化

## ① 解决的问题

AI团队面临"欧盟CSRD要求披露数字碳排放但无量化工具"——GHG Protocol碳足迹计算器量化AI训练和推理排放，满足ESG合规，年化价值约75万元

## ② 核心算法逻辑

背景：训练GPT3消耗约552吨CO2（相当于5辆车的终生排放量）。企业AI系统的碳排放正成为ESG披露的新要求（欧盟CSRD从2025年起要求披露Scope 3数字碳排放）。

## ③ 业务应用场景

场景A：电商AI模型训练碳排放计算与报告 - 业务问题：公司向欧洲合规机构提交ESG报告，需要量化AI系统（推荐模型、需求预测、广告优化）的碳排放，但没有专门工具 - 数据要求：各模型的GPU型号/数量、训练时长、部署地区（数据中心所在地）、推理请求量 - 预期产出：年度AI系统碳排放报告：训练碳排放X吨CO2eq，推理碳排放Y吨CO2eq，优化建议（迁移到绿色区域可减少40%） - 业务价值：满足欧盟CSRD合规要求，避免不合规的潜在处罚；"低碳AI"品牌标签在欧洲市场提升品牌形象，对B2C用户信任度+8%，年化价值约60万元
三轨对抗验证： 1. 成本验证：碳足迹计算是纯数据分析，成本极低；主要是数据收集（工单系统打通GPU使用数据，约1周） 2. 合规验证：碳排放数据用于ESG对外披露需要第三方审计（认证成本约5-10万元/年）；GHG Protocol的Scope 3要求覆盖云计算供应商的间接排放 3. 风险验证：云服务商提供的电网碳强度数据可能过时（实际碳强度每小时变化）；需使用最新的地区月度平均值，避免错报
场景B：推理阶段优化降低碳排放 - 业务问题：每日推理1000万次的推荐系统，在华东云部署（碳强度高），是否应迁移到欧洲低碳区域 - 方案：量化迁移前后碳排放差异 vs 网络延迟增加的权衡 - 预期产出：迁移到法国数据中心碳排放降低80%，延迟从50ms增加到200ms；建议：欧洲用户专用集群部署，华东保留亚太推理，不全量迁移

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：满足欧盟CSRD碳披露要求，避免潜在合规处罚（最高营业额1%）；"绿色AI"认证在欧洲市场提升品牌价值，用户信任度+8%，年化约60万元；优化到低碳区域云资源后，推理成本降低约20%（电费差异），年化约15万元
实施难度：⭐⭐☆☆☆（核心计算极简，只需收集GPU使用数据；主要挑战是数据采集基础设施和ESG报告标准对齐）
优先级：⭐⭐⭐⭐☆（欧盟CSRD 2025年起强制要求大企业数字碳排放披露，中型电商需在2026-2027年跟进）
评估依据：MLSys 2022展示主流AI工作负载的碳排放基准数据；CodeCarbon开源库已被数千家企业采用；LinkedIn/Google/Microsoft已发布AI碳足迹年度报告

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Carbon-Footprint-ML-Model
ML模型碳足迹评估 — 电商AI系统碳排放量化工具

依赖：pip install numpy pandas
注意：更完整实现可参考 CodeCarbon 库 (pip install codecarbon)
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional

# ── 1. 电网碳强度数据库（kgCO2/kWh）─────────────────────────────────
GRID_CARBON_INTENSITY = {
    # 亚洲
    'China-East':      0.528,   # 华东（煤炭为主）
    'China-South':     0.452,
    'China-North':     0.617,
    'Japan':           0.470,
    'Singapore':       0.408,
    # 欧洲
    'France':          0.052,   # 核电为主，最低
    'Germany':         0.366,
    'UK':              0.233,
    'Netherlands':     0.389,
    # 北美
    'US-West':         0.210,   # 可再生能源多
    'US-East':         0.380,
    'US-Central':      0.450,
    # 云厂商承诺（100%绿电承诺区域）
    'AWS-us-west-2':   0.037,   # Oregon（水电+风电）
    'GCP-us-central1': 0.165,
    'Azure-westeurope': 0.120,
}

# ── 2. 硬件功耗数据库（W）────────────────────────────────────────────
GPU_POWER_SPECS = {
    'A100-80GB':  400,  'A100-40GB': 300,
    'H100-80GB':  700,  'H100-SXM':  350,
    'V100-32GB':  250,  'V100-16GB': 200,
    'RTX-4090':   450,  'RTX-3090':  350,
    'T4':         70,   'L4':        72,
}

# ── 3. 碳足迹计算器 ────────────────────────────────────────────────────
@dataclass
class MLJob:
    """描述一个ML训练/推理任务"""
    name: str
    gpu_type: str
    n_gpus: int
    duration_hours: float
    region: str
    job_type: str = 'training'  # 'training' or 'inference'
    pue: float = 1.3  # 数据中心能源效率（1.1-2.0，默认1.3）
    n_requests_daily: Optional[int] = None  # 推理任务每日请求量

class MLCarbonCalculator:
    """ML模型碳足迹计算器"""
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各模型的 GPU 型号与数量、训练时长、部署地区或云区域、推理请求量，以及电网碳强度和硬件功耗参数；粒度：模型级与区域级。

**输出**：训练与推理的碳排放量（tCO2eq）、按区域与模型的构成拆解、迁移到低碳区域的减排与延迟权衡建议，供 ESG 报告与基础设施决策。

## 执行步骤

1. 收集 GPU 型号、数量、训练时长与部署区域
2. 按硬件功耗与电网碳强度计算训练排放
3. 按推理请求量计算推理排放
4. 比较不同部署区域的排放差异
5. 输出碳足迹报告与优化建议

## 边界与不做

- 数据不满足时不用：拿不到 GPU 使用数据，或云区域碳强度口径不一致时，排放估算不可用于对外披露。
- 能力边界：只做量化估算与优化建议，不出具审计意见；对外披露数据须第三方审计确认。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Early-Stopping-Regularization.html、Skill-Early-Stopping-Regularization、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Model-Compression-Edge-Deployment.html、Skill-Model-Compression-Edge-Deployment、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-SHAP-Shapley-Feature-Attribution.html、Skill-SHAP-Shapley-Feature-Attribution
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-SHAP-Shapley-Feature-Attribution.html、Skill-SHAP-Shapley-Feature-Attribution
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-SHAP-Shapley-Feature-Attribution.html、Skill-SHAP-Shapley-Feature-Attribution、Skill-Carbon-Footprint-ML-Model

---

> 分类：未归类（矩阵空白）　·　技术族：12-ML基础　·　源卡：`Skill-Carbon-Footprint-ML-Model`