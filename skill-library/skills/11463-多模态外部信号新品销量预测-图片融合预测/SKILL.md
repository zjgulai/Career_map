---
name: "p2s-multimodal-new-product-sales-forecast"
title: "多模态外部信号新品销量预测 — Google Trends + 图片融合预测"
description: "触发词：多模态预测、Google Trends、图片特征、新品备货、外部信号。何时不用：已有充足历史的主销 SKU 不必融合外部信号；要用事件文本与语义对齐修正预测时用「TimeCMA 跨模态对齐」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 趋势监测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Multimodal-New-Product-Sales-Forecast"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "还没上架、没有销量时，就用搜索热度和产品图把备货量先定下来，不等断货了再追。"
user_try: "试试：用 Google Trends 和我这 3 张主图，预测这款新款推车未来 12 周销量和备货量。"
whenToUse: "新品上架前无销售历史、但有品类搜索热度与主图等外部信号时用；有充分历史时直接用时序模型；需要靠事件文本与语义对齐时用 TimeCMA 跨模态对齐。"
workflow: "用 pytrends 拉取品类关键词近 12 周搜索热度 → 用 ResNet50 提取 3-5 张主图的视觉特征 → 融合趋势、图像与价格类元数据做非自回归解码 → 每周重跑，预测较前一周高出 20% 以上触发加急补货"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多模态外部信号新品销量预测 — Google Trends + 图片融合预测

## ① 解决的问题

跨境电商新品运营面临上架前无销售数据的备货难题——Google Trends热度曲线+产品图片多模态融合，将新品12周销量预测WAPE降低8-12%，Prime Day断货率从30%降至10%

## ② 核心算法逻辑

新品上架时没有销售历史，但市场上已经有外部信号：消费者在 Google 上搜索"婴儿推车"的趋势、产品图片的视觉特征（颜色/款式/材质）、价格和品类元数据。GTMTransformer 将这三类信息融合：① Google Trends 时序编码器捕捉市场需求热度曲线；② 产品图像特征（ResNet 提取视觉嵌入）；③ 元数据（价格/品类/发布季节）。解码器非自回归地输出全周期销量预测，避免错误累积。

## ③ 业务应用场景

- 业务问题：秋冬新款婴儿推车准备 10 月上架，需要在 8 月就确定备货量（头程+FBA 提前期 60 天），此时零销售历史，传统方法无效 - 数据要求： - Google Trends：近 12 周"baby stroller"/"infant pram"搜索热度（pytrends API） - 产品主图：3-5 张（用 ResNet50 提取 2048 维视觉特征） - 元数据：定价 $299、品类 travel-system、发布季节 autumn - 执行流程： 1. 用 `pytrends` 拉取品类关键词近 12 周趋势（替代 SKU 趋势） 2. ResNet50 提取产品主图
- 业务问题：Prime Day 前 4 周，监控新品关键词搜索趋势，若趋势超预期则加急补货 - 数据要求：每周滚动更新 Google Trends 数据（自动化 pytrends 拉取） - 执行流程：每周重跑 GTM-Transformer 预测，与前一周预测对比；若第 $t$ 周预测较第 $t-1$ 周高出 20% 以上，触发加急补货 alert - 业务价值：Prime Day 期间新品不断货率从 70% → 90%，断货损失减少 50-100 万/年 - 三轨验证： - 成本：每周自动化脚本运行成本约 50 元/次（云函数+API 调用）；加急补货物流成本增加 30-50%（空运 v

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新品备货精度提升 8-12%（论文实测 WAPE 改善），单款新品减少滞销/断货损失 10-30 万；年化 20 款 × 15 万 = 300 万/年；叠加 Prime Day 断货保护额外 50-100 万/年
实施难度：⭐⭐⭐☆☆（pytrends API 免费易获取；ResNet50 推理本地可跑；完整模型开源）
优先级：⭐⭐⭐⭐☆（外部信号是差异化竞争力；开源代码可直接复用；Google Trends 是免费高质量信号）
评估依据：论文 VISUELLE 数据集 5577 款真实新品验证；GTM-Transformer 代码开源可直接部署

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/multimodal_new_product_sales_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Multimodal-New-Product-Sales-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多模态外部信号新品销量预测 - GTM-Transformer 简化骨架
论文 arXiv:2109.09824 (Skenderi et al., 2021)
依赖: pip install numpy scikit-learn requests
注：完整模型见 https://github.com/HumaticsLAB/GTM-Transformer
    此处实现轻量 MLP 版本展示多模态融合逻辑
"""
from __future__ import annotations
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from typing import Optional


def simulate_google_trends(
    keyword: str,
    weeks: int = 12,
    base: float = 40.0,
    seasonal_amp: float = 20.0,
    seed: int = 42,
) -> np.ndarray:
    """
    模拟 Google Trends 数据（生产环境用 pytrends 替换）

    生产代码示例：
        from pytrends.request import TrendReq
        pt = TrendReq(hl='en-US', tz=360)
        pt.build_payload([keyword], timeframe='today 3-m', geo='US')
        df = pt.interest_over_time()
        trends = df[keyword].values[-weeks:]
    """
    rng = np.random.default_rng(seed)
    t = np.arange(weeks)
    seasonal = seasonal_amp * np.sin(2 * np.pi * t / 52)
    noise = rng.normal(0, 5, weeks)
    trends = np.clip(base + seasonal + noise, 0, 100)
    return trends


def extract_image_features(image_path: Optional[str] = None) -> np.ndarray:
    """
    提取产品图片特征（生产环境用 ResNet50 替换）

    生产代码示例：
        import torch, torchvision.models as models
        from torchvision import transforms
        from PIL import Image
        model = models.resnet50(pretrained=True)
        model.eval()
        transform = transforms.Compose([
            transforms.Resize(256), transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
        ])
        img = Image.open(image_path).convert('RGB')
        feat = model(transform(img).unsqueeze(0)).detach().numpy().flatten()
    """
    # 轻量替代：随机生成 64 维视觉特征（已归一化）
    rng = np.random.default_rng(hash(str(image_path)) % 2**32)
    feat = rng.normal(0, 1, 64)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2109.09824 — Well Googled is Half Done: Multimodal Forecasting of New Fashion Product Sales with Image-based Google Trends

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：品类关键词近 12 周 Google Trends 热度、产品主图 3-5 张、价格与品类元数据（如发布季节）；粒度：SKU×周（趋势为品类级）。

**输出**：新品 12 周销量预测与备货建议，并支持按周滚动重跑输出超预期加急补货信号，供新品备货与首批下单使用。

## 执行步骤

1. 抓取品类关键词搜索热度序列
2. 提取产品主图视觉嵌入与元数据
3. 融合趋势、图像与元数据输出销量预测
4. 按周滚动重跑并设阈值触发加急补货提醒

## 边界与不做

- 数据不满足时不用：关键词趋势取不到、也没有可用主图时，多模态只剩元数据，预测退化为类比估算。
- 能力边界：只给销量预测与补货信号，加急补货的物流成本与执行由人判断。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Transfer-Learning-New-Product-Forecast.html、Skill-Transfer-Learning-New-Product-Forecast
- **可组合**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Multimodal-New-Product-Sales-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：06-增长模型　·　源卡：`Skill-Multimodal-New-Product-Sales-Forecast`