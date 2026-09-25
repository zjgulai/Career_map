---
name: "p2s-llm-mixer-new-product-forecast"
title: "LLM-Mixer 多尺度时序新品销量预测 — LLM 增强多分辨率分解"
description: "触发词：LLM-Mixer、多尺度分解、少样本预测、新品销量、语义提示。何时不用：已有充足历史的主销 SKU 用常规时序模型即可；需要零样本直接出结果时用「时序基础模型」类技能。安全边界：仅用内部销售数据，不爬竞品数据；用聚合级数据，不含个人隐私。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-LLM-Mixer-New-Product-Forecast"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品只有几周数据也能预测，把短期波动、月度节律和品类趋势分开看，再判断是真实增长还是促销噪声。"
user_try: "试试：用 LLM-Mixer 给我这款上市 4 周的新品做未来 8 周预测，并说明哪些涨幅是促销噪声。"
whenToUse: "新品历史点少于 20 个、需要借 LLM 先验并区分多尺度节律时用；历史充足时用常规时序模型；完全零样本、不训练时用时序基础模型类技能。"
workflow: "构建多尺度序列（原始周数据、4 周均值、全量均值） → 构造品类与上市阶段的语义 prompt → LLM 编码各尺度后由 MLP Mixer 融合 → 输出未来 8 周预测并标注促销驱动的部分"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM-Mixer 多尺度时序新品销量预测 — LLM 增强多分辨率分解

## ① 解决的问题

新品上市初期历史数据极少导致传统预测模型失效——LLM预训练通用时序知识加持多尺度分解，在少于20个历史点时预测精度提升10-15%，年化减少损失300-450万元

## ② 核心算法逻辑

新品预测困难根源之一是多尺度时序模式混合：新品销量同时受短期（周促销波动）、中期（月季节性）、长期（品类增长趋势）三种节律驱动，传统单尺度模型只能捕捉其一。LLMMixer 的核心思路：① 将原始时序多分辨率分解（短/中/长期子序列）；② 用预训练 LLM（冻结权重）处理每个分辨率的模式——LLM 的通用时序知识在零/少样本场景提供强先验；③ Mixer 层融合多尺度表示，输出最终预测。

## ③ 业务应用场景

- 业务问题：新款母婴湿巾上市第 4 周，前 4 周数据：[15, 28, 45, 38]，既有短期波动（周促销），又有月级增长趋势。需要预测接下来 8 周，同时区分"这是真实增长"还是"促销驱动噪声" - 数据要求： - 新品前 4-8 周销售序列 - 文本 prompt：品类描述 + 大促日历 + 市场趋势 - 可选：相似品同期数据作参考 - 执行流程： 1. 构建多尺度序列（原始周数据 / 4周均值 / 全量均值） 2. 构建语义 prompt："母婴跨境湿巾，上市第4周，前期有促销，品类整体上升" 3. LLM 编码各尺度特征 → MLP Mixer 融合 → 输出 8 周预测 4. 
三轨验证： - 成本：每次推理约 $0.003-0.01（GPT-4o-mini）或本地部署 Qwen-7B 单次推理约 ¥0.001；需 1 名数据工程师 2 周开发 prompt 模板与接口；数据采集成本低（已有销售系统） - 合规：不触碰 Amazon 政策红线（仅使用内部销售数据，不爬取竞品数据）；不涉及 GDPR 个人隐私（聚合级销售数据）；无广告法风险 - 风险：若 LLM 误判促销噪声为真实增长，可能导致过度备货（次生风险）；建议设置 P90 上限阈值（不超过历史最大周销量 2 倍）；长期依赖 LLM 可能弱化业务直觉
- 业务问题：同批上市 10 款新品（同一品类，不同规格），各自历史稀少，但 LLM 可以跨 SKU 共享语义特征 - 数据要求：10 款新品的早期数据 + 统一的品类文本描述 - 执行流程：批量推理，LLM backbone 共享（仅 Mixer 头分别输出），推理成本降低 10x - 业务价值：10 款新品联合预测，总备货精度提升，年化节省 100-200 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：少样本新品预测精度提升 10-15%（论文实测），年化 20-30 款新品 × 15 万/款节省 = 300-450 万/年；多 SKU 批量推理降低模型运营成本 50%
实施难度：⭐⭐⭐⭐☆（需要 LLM 访问权限/本地部署；Qwen-7B/LLaMA-3-8B 可本地运行；开发周期 2-4 周）
优先级：⭐⭐⭐☆☆（LLM 推理成本较高；适合高单价新品或战略性新品；中等优先级）
评估依据：论文超越 TimesNet/PatchTST 等 SOTA；2024年新成果；LLM 时序预测趋势明确；Qwen 系列开源可本地部署控制成本

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（229 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/llm_mixer_new_product_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-LLM-Mixer-New-Product-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM-Mixer 多尺度新品销量预测 - 轻量骨架实现
论文 arXiv:2410.11674 (Kowsher et al., 2024)
依赖: pip install numpy scikit-learn
注：完整 LLM-Mixer 需 PyTorch + transformers (GPT2/LLaMA)
    此处用 MLP 模拟 LLM 特征提取，展示多尺度融合逻辑
"""
from __future__ import annotations
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from typing import List, Optional


def multiscale_decompose(series: np.ndarray, scales: List[int] = (1, 4, 8)) -> List[np.ndarray]:
    """
    多尺度分解：不同粒度下采样

    生产代码（真实 LLM-Mixer）：
        # 使用 PyTorch 实现可微下采样
        import torch.nn.functional as F
        x_tensor = torch.FloatTensor(series).unsqueeze(0).unsqueeze(0)
        for r in scales:
            x_down = F.avg_pool1d(x_tensor, kernel_size=r, stride=r)
    """
    result = []
    for r in scales:
        if r == 1:
            result.append(series.copy())
        else:
            # 滑动平均下采样
            n = len(series) // r
            if n == 0:
                result.append(np.array([series.mean()]))
            else:
                downsampled = np.array([series[i*r:(i+1)*r].mean() for i in range(n)])
                result.append(downsampled)
    return result


def build_text_prompt(
    product_name: str,
    category: str,
    week_on_market: int,
    trend: str = "growing",
    promotions: Optional[List[int]] = None,
) -> str:
    """
    构建语义 Prompt（生产环境送给 LLM tokenizer）

    生产代码示例（OpenAI API）：
        import openai
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role":"user","content":prompt + str(series.tolist())}]
        )
        # 提取 LLM 对序列的数值总结特征
    """
    promo_str = f"，第 {promotions} 周有促销活动" if promotions else ""
    return (
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2410.11674 — LLM-Mixer: Multiscale Mixing in LLMs for Time Series Forecasting

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：新品前 4-8 周销售序列、品类描述与大促日历文本 prompt，可选相似品同期数据；粒度：SKU×周。

**输出**：未来 8 周的多尺度融合销量预测与备注说明（区分真实增长与促销噪声），供首批与追单备货决策使用。

## 执行步骤

1. 整理新品前 4-8 周销量并生成多分辨率子序列
2. 撰写含品类、上市阶段与促销信息的语义 prompt
3. LLM 编码各尺度并由 Mixer 层融合
4. 输出未来 8 周预测并复核是否把促销噪声当增长

## 边界与不做

- 数据不满足时不用：连 2-4 周销量都拿不到、也无品类与促销描述时，多尺度与语义先验都无从建立。
- 能力边界：产出预测与噪声判断，不自动决定备货量；建议同时设 P90 上限阈值防过度备货。

## 技能关联

- **前置**：Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Probabilistic-Hierarchical-New-Product-Forecast.html、Skill-Probabilistic-Hierarchical-New-Product-Forecast、Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **延伸**：Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Multimodal-New-Product-Sales-Forecast.html、Skill-Multimodal-New-Product-Sales-Forecast、Skill-Probabilistic-Hierarchical-New-Product-Forecast.html、Skill-Probabilistic-Hierarchical-New-Product-Forecast、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **可组合**：Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Probabilistic-Hierarchical-New-Product-Forecast.html、Skill-Probabilistic-Hierarchical-New-Product-Forecast、Skill-LLM-Mixer-New-Product-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-LLM-Mixer-New-Product-Forecast`