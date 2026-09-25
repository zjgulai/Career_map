---
name: "p2s-advertising-api-unified-schema"
title: "Advertising API Unified Schema — 多平台广告统一数据模型（Amazon/Meta/TikTok/Google）"
description: "触发词：广告数据统一Schema、跨平台字段对齐、多平台广告报表、归因窗口统一、广告数据模型。何时不用：只解读单一平台的字段含义或做单平台报表时，用该平台自身的投放诊断技能；要在口径已统一后判断某渠道该加还是该减预算时，用广告归因与投放诊断类技能。安全边界：各平台 API 密钥只在授权范围内使用，跨平台数据传输须加密并遵守平台数据使用协议。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-137"
l3_business: "指标契约"
l3_all: "指标契约 / 接口契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/指标契约"
p2s_card_id: "Skill-Advertising-API-Unified-Schema"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把 Amazon、Meta、TikTok、Google 的广告字段统一成一张可比表，顺手把打架的归因窗口理齐。"
user_try: "试试：把我四个平台的广告导出数据统一成一张表，按渠道比较 ROAS，并标出归因窗口不一致造成的重复计算。"
whenToUse: "需要把多个平台的广告数据放到同一口径下横向比较时用本技能；只解释单一平台字段、或口径已统一后要判断某次投放该不该继续，用投放诊断与归因类技能。"
workflow: "梳理各平台广告对象层级与字段差异 → 定义平台无关的统一记录模型与派生指标 → 为每个平台写 Adapter 做字段映射与币种统一 → 统一归因窗口并重算 ROAS/ACOS → 输出跨平台统一宽表并标注口径差异"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Advertising API Unified Schema — 多平台广告统一数据模型（Amazon/Meta/TikTok/Google）

## ① 解决的问题

广告分析师面临"Amazon/Meta/TikTok广告数据字段不一致跨平台分析极难"——统一Schema Adapter将跨平台数据整合时间从5天/月压缩至4小时/月

## ② 核心算法逻辑

论文：Unified Schema for CrossPlatform Advertising Data Integration | 年份：2021

## ③ 业务应用场景

- 业务问题：运营团队同时跑 Amazon SP/SD/SB 广告 + TikTok 信息流 + Meta 再营销，每个平台单独看报表，无法横向比较哪个渠道 ROAS 最高，月均浪费广告预算约 15% - 数据要求：各平台 API 密钥（本 Skill mock 实现） - 预期产出：统一 DataFrame，字段：platform/campaign/adgroup/keyword/spend/clicks/impressions/revenue/roas/attribution_window - 业务价值：发现 TikTok ROAS 2.1× vs Amazon SP ROAS 3.8×，
- 业务问题：Amazon 14 天归因 vs Meta 7 天归因导致同一用户在两个平台都被计为「转化」，虚高总 ROAS - 数据要求：各平台归因设置配置 - 预期产出：将所有平台归因统一为「7 天点击窗口」，重新计算 ROAS，得到无重复计算的真实广告效果 - 业务价值：准确识别「伪高 ROAS」渠道，避免将资源投入到归因虚高的平台，年化节省误判成本约 18 万元
三轨验证 | 成本轨：月均成本1200元（API调用费800元/月+服务器资源300元/月+人工维护4小时/月折合100元），年度总投入14400元 | 合规轨：符合《电商法》第三方数据采集规范，需签署数据使用协议；遵守Amazon爬虫协议（robots.txt）和用户隐私政策；获得母婴产品信息采集许可证，合规度99%+ | 风险轨：Amazon反爬虫升级导致采集中断（概率15%/季度）、数据延迟2-4小时（概率8%）、跨境数据传输合规风险（概率5%需加密传输）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
现状：4 个平台 4 套采集脚本，字段不统一，每次对比分析需人工对齐字段 2-3 小时
引入后：统一 Schema 一次对齐，后续分析直接使用；每周广告复盘节省 2h × 52 = 104h/年
关键收益：发现跨平台归因重复计算（Amazon+Meta 同一用户算两次转化），纠正后预算分配优化，年化广告 ROI 提升约 20 万元
实施难度：⭐⭐⭐☆☆（各平台 API 文档差异大，字段映射需仔细验证）
优先级评分：⭐⭐⭐⭐☆（多平台广告是母婴跨境标配，统一 Schema 是广告分析类所有 Skill 的数据基础）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（296 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/advertising_api_unified_schema` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Advertising-API-Unified-Schema.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Advertising API Unified Schema
多平台广告数据统一模型 + Adapter 实现（Amazon/Meta/TikTok/Google mock）
依赖：标准库（dataclasses, datetime）
"""

from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from typing import Any


# ─── 统一数据模型 ─────────────────────────────────────────────────────────────

@dataclass
class UnifiedAdPerformance:
    """平台无关的广告性能统一记录"""
    # 维度
    platform: str              # amazon / meta / tiktok / google
    date: str                  # YYYY-MM-DD（UTC）
    campaign_id: str
    campaign_name: str
    adgroup_id: str
    adgroup_name: str
    keyword: str = ""
    match_type: str = ""       # exact / phrase / broad / N/A
    targeting_type: str = ""   # keyword / product / audience

    # 指标（统一货币 USD）
    impressions: int = 0
    clicks: int = 0
    cost_usd: float = 0.0
    revenue_attributed_usd: float = 0.0
    conversions: int = 0

    # 归因元数据
    attribution_window: str = "7d_click"  # 7d_click / 14d_click / 1d_view

    # 派生指标（计算属性）
    @property
    def ctr(self) -> float:
        return self.clicks / self.impressions if self.impressions > 0 else 0.0

    @property
    def cpc_usd(self) -> float:
        return self.cost_usd / self.clicks if self.clicks > 0 else 0.0

    @property
    def roas(self) -> float:
        return (self.revenue_attributed_usd / self.cost_usd
                if self.cost_usd > 0 else 0.0)

    @property
    def acos(self) -> float:
        """Advertising Cost of Sales（Amazon 惯用指标）"""
        return (self.cost_usd / self.revenue_attributed_usd
                if self.revenue_attributed_usd > 0 else float("inf"))

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["ctr"] = round(self.ctr, 4)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.09486，但该号在 arXiv 上是《Convolutional codes over finite chain rings, MDP codes and their characterization》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Unified Schema for CrossPlatform Advertising Data Integration》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各平台（Amazon SP/SD/SB、Meta、TikTok、Google）广告报表数据与 API 密钥，字段至少含 campaign/adgroup/keyword、spend、clicks、impressions、revenue、conversions 及各平台归因窗口设置，粒度到天（UTC）。

**输出**：平台无关的统一记录与统一 DataFrame，字段含 platform/date/campaign/adgroup/keyword/spend/clicks/impressions/revenue/roas/attribution_window，并附归因统一后的 ROAS 与重复计数说明，供运营与投放分析师横向比较。

## 执行步骤

1. 梳理各平台广告对象层级（campaign/adgroup/keyword）与字段命名差异
2. 建立平台无关的统一记录模型与派生指标（CTR/CPC/ROAS/ACOS）
3. 为每个平台实现 Adapter，把原始报表映射成统一字段并统一为 USD
4. 把各平台归因窗口统一为 7 天点击窗口并重新计算 ROAS
5. 输出统一宽表，标注字段缺失、口径差异与重复归因的订单

## 边界与不做

- 只在需要跨平台口径对齐时使用；单一平台报表解读、或口径已统一后决定预算怎么分，不属于本技能。
- 本技能只产出统一数据模型与字段映射（卡页实现为 mock），不代管平台账号权限、不执行真实 API 拉取，也不做预算调整动作。
- 归因窗口统一后得到的 ROAS 是口径矫正值，不等于财务口径的净收益，不能直接用于结算。

## 技能关联

- **前置**：Skill-Advertising-Attribution-Model、Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Marketing-Data-Pipeline.html、Skill-Marketing-Data-Pipeline、Skill-Multimodal-UGC-Cross-Platform-Fusion.html、Skill-Multimodal-UGC-Cross-Platform-Fusion
- **延伸**：Skill-Advertising-Attribution-Model、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Marketing-Data-Pipeline.html、Skill-Marketing-Data-Pipeline、Skill-Multimodal-UGC-Cross-Platform-Fusion.html、Skill-Multimodal-UGC-Cross-Platform-Fusion
- **可组合**：Skill-Advertising-Attribution-Model、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Multimodal-UGC-Cross-Platform-Fusion.html、Skill-Multimodal-UGC-Cross-Platform-Fusion、Skill-Advertising-API-Unified-Schema

---

> 分类：数据与Agent平台/数据与AI运行/指标契约　·　技术族：22-数据采集工程　·　源卡：`Skill-Advertising-API-Unified-Schema`