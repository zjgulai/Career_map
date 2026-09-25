---
name: "p2s-seasonal-search-trend-modeling"
title: "季节性搜索趋势建模 — 搜索峰值预测与备货节奏对齐"
description: "触发词：搜索趋势、季节峰值、备货节奏、加法分解、预算分配。何时不用：要用短视频传播动力学预测爆款时用「SIR 爆品传播预测」；要多信号融合做需求感知时用「库存需求感知」。安全边界：数据采集需获得平台 API 授权，不得违规爬取；预测结果需标注数据来源。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Seasonal-Search-Trend-Modeling"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "提前看清搜索峰值什么时候来，把备货节奏和广告预算都排到峰值前面。"
user_try: "试试：用 18 个月搜索历史预测母亲节前的日搜索峰值，给出提前备货时点和预算分配。"
whenToUse: "需求由搜索热度驱动、要提前对齐备货节奏与广告预算时用；用短视频传播动力学预测爆款用 SIR 爆品传播预测；要多信号融合感知用库存需求感知。"
workflow: "整理 18 个月搜索量历史与节日日历 → 用加法分解拆出趋势、季节与节日项 → 预测未来 6 周每日搜索量与置信区间 → 触发提前备货信号并按指数分配广告预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 季节性搜索趋势建模 — 搜索峰值预测与备货节奏对齐

## ① 解决的问题

供应链运营面临"旺季搜索峰值无法提前预判、屡次因备货不足错失黄金销售期"——季节性趋势建模将备货命中率从70%提升至90%，年化减少错失销售30-60万元

## ② 核心算法逻辑

季节性搜索趋势建模（Seasonal Search Trend Modeling）将 Facebook Prophet 的加法时序分解模型应用于搜索量预测，拆解搜索流量为三个可解释分量：

## ③ 业务应用场景

场景A：吸奶器母亲节搜索峰值预测 - 业务问题：母亲节前搜索量暴涨，往年因备货不足错失旺季，最后2周 BSR 急剧下滑 - 数据要求：18个月搜索量历史（Google Trends / Helium10 历史数据），节日日历 - 预期产出：母亲节前6周内每日搜索量预测值 + 95% 置信区间，触发备货信号 - 业务价值：提前 45 天备货可降低 FBA 仓储等待成本 30%，旺季销售额提升 25%，年化约 40 万元
场景B：婴儿用品季节性广告预算动态分配 - 业务问题：广告预算全年均匀分配，旺季曝光不足，淡季浪费 - 数据要求：过去 2 年月度/周度搜索量数据，广告历史 ROAS - 预期产出：按预测搜索指数自动分配月度广告预算，旺季多投、淡季少投 - 业务价值：相同广告总预算，ROAS 提升 15-20%，约 15-30 万元/年
三轨验证 | 成本轨：月均成本1,200元（数据采集工具300元/月+AI模型调用600元/月+人工分析12小时/月×300元/小时=3,600元，年均分摊1,200元/月），ROI周期3个月 | 合规轨：符合《电商平台搜索算法推荐合规指南》，数据采集需获得平台API授权，不涉及爬虫违规；季节性预测模型需标注数据来源，符合消费者知情权要求 | 风险轨：平台算法更新导致模型失效（概率35%，可通过月度重训练规避）；跨境数据隐私合规风险（概率15%，需GDPR认证）；预测偏差超15%影响库存决策（概率20%，建议设置预警阈值）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：旺季备货命中率从 70% 提升至 90%，旺季销售额增加 20-30%；年化节省错失销售约 30-60 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：母婴用品季节性极强（母亲节/婴儿洗澡季/开学季等），精准预测搜索峰值是备货决策的核心输入；Prophet 开源免费，实施门槛低

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（104 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def generate_seasonal_search_data(months: int = 24, base_volume: int = 10000) -> pd.DataFrame:
    """生成模拟季节性搜索量数据（含母亲节、Prime Day、黑五峰值）"""
    dates = pd.date_range(start="2024-01-01", periods=months * 30, freq='D')
    
    # 年度季节性（用正弦模拟）
    day_of_year = np.array([d.timetuple().tm_yday for d in dates])
    seasonal = 0.3 * np.sin(2 * np.pi * (day_of_year - 100) / 365)  # 春季峰值
    
    # 节日突增
    holiday_boost = np.zeros(len(dates))
    for i, d in enumerate(dates):
        # 母亲节（5月第2个周日附近）
        if d.month == 5 and 7 <= d.day <= 14:
            holiday_boost[i] += 0.5
        # Prime Day（7月中旬）
        if d.month == 7 and 10 <= d.day <= 16:
            holiday_boost[i] += 0.8
        # 黑五/网一（11月下旬-12月初）
        if (d.month == 11 and d.day >= 25) or (d.month == 12 and d.day <= 5):
            holiday_boost[i] += 1.2
        # 圣诞季
        if d.month == 12 and 10 <= d.day <= 25:
            holiday_boost[i] += 0.6
    
    noise = np.random.normal(0, 0.05, len(dates))
    weekly = 0.1 * np.sin(2 * np.pi * np.array([d.weekday() for d in dates]) / 7)
    volume = base_volume * (1 + seasonal + holiday_boost + weekly + noise)
    
    return pd.DataFrame({"ds": dates, "y": np.maximum(volume, 100).astype(int)})

def decompose_search_trend(df: pd.DataFrame) -> dict:
    """
    简化版 STL 分解：滑动平均提取趋势，残差拆分季节性和噪声
    df 列：ds (date), y (search volume)
    """
    df = df.copy().sort_values("ds")
    df["trend"] = df["y"].rolling(window=30, center=True, min_periods=1).mean()
    df["detrended"] = df["y"] - df["trend"]
    df["day_of_year"] = df["ds"].dt.dayofyear
    
    # 季节性：按天数均值
    seasonal_avg = df.groupby("day_of_year")["detrended"].mean().reset_index()
    seasonal_avg.columns = ["day_of_year", "seasonal"]
    df = df.merge(seasonal_avg, on="day_of_year", how="left")
    df["residual"] = df["detrended"] - df["seasonal"]
    
    return {"decomposed_df": df}

def forecast_search_peaks(df: pd.DataFrame, forecast_days: int = 60) -> pd.DataFrame:
    """基于历史季节性模式预测未来搜索峰值"""
    result = decompose_search_trend(df)
    decomp_df = result["decomposed_df"]
    
    last_date = df["ds"].max()
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1703.07015。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：18 个月搜索量历史（Google Trends / Helium10）、节日日历、广告历史 ROAS；粒度：关键词×日或周。

**输出**：未来 6 周每日搜索量预测与 95% 置信区间、备货触发信号与按季度的月度广告预算分配建议，供备货与投放使用。

## 执行步骤

1. 整理搜索量历史并标注节日
2. 分解趋势、季节与节日项
3. 预测峰值时点与幅度区间
4. 触发提前 45 天备货信号
5. 按预测指数分配广告预算

## 边界与不做

- 数据不满足时不用：搜索历史不足一年半、或关键词与品类需求相关性弱时，峰值预测不可靠。
- 能力边界：只预测搜索峰值与预算分配，不代替投放执行与库存下单。
- 能力边界：平台算法更新会导致模型失效（卡页风险提示概率 35%），需要定期重训。

## 技能关联

- **前置**：Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-STL-Seasonal-Decomposition.html、Skill-STL-Seasonal-Decomposition、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration
- **延伸**：Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration
- **可组合**：Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Seasonal-Search-Trend-Modeling

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：25-搜索流量工程　·　源卡：`Skill-Seasonal-Search-Trend-Modeling`