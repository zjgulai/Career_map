---
name: "p2s-supplier-ontology-capability-map"
title: "供应商本体能力图谱 — 产能/质量/认证/风险四维供应商Ontology设计与实例化"
description: "触发词：供应商本体、能力图谱、供应商画像、认证标签、供应商主数据。何时不用：只做单次准入打分与证书到期预警时用供应商准入认证KPI；只做月度绩效评分与趋势预警时用供应商绩效积分卡。安全边界：供应商资质与财务数据须本地化存储并按需脱敏，涉及消费者偏好等个人数据须先签署数据处理协议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 主数据治理"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Ontology-Capability-Map"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应商的产能、认证、绩效、风险统一成一张可查询的供应商档案，新供应商评估从两周缩到两天。"
user_try: "试试：帮我给新供应商宁波精工建一张四维本体档案，算出综合评分、缺失认证和风险评级。"
whenToUse: "需要跨供应商做统一画像、认证标签传播与集中度风险查询时用本技能；若只要给单个供应商做准入筛选或证书到期提醒，用供应商准入认证KPI。"
workflow: "按标准化本体模板填写供应商四维字段，完成本体实例化 → 自动计算综合评分并识别缺失或过期认证 → 按地区与集中度查询高集中度风险供应商 → 输出风险评级并触发寻找替代供应商的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应商本体能力图谱 — 产能/质量/认证/风险四维供应商Ontology设计与实例化

## ① 解决的问题

采购团队面临"供应商评估靠表单+面谈需要2周"——四维本体(能力/认证/绩效/风险)将评估时间从2周→2天，认证标签自动传播消除合规盲区

## ② 核心算法逻辑

供应商本体（Supplier Ontology） 是将供应商从"联系人+报价单"升级为"可查询、可计算、可触发行动的结构化知识节点"。

## ③ 业务应用场景

场景A：新供应商快速本体实例化 - 业务问题：引入新供应商「宁波精工」，需要在 2 天内完成全量评估，传统方式需要 5 份表单+3 次面谈 - 本体化方案：填写标准化供应商 Ontology 模板（50 个字段），系统自动计算综合评分 + 识别缺失认证 + 给出风险评级 - 业务价值：评估时间从 2 周→ 2 天；历史供应商数据可复用
场景B：供应商风险地图（地缘+集中度） - 业务问题：70% 的采购集中在广东省 3 家供应商，缺少分散意识，一旦遇到区域性停工就断供 - 本体查询：`SELECT suppliers WHERE region='广东' AND concentration>0.15 ORDER BY risk.concentration DESC` - 结果：识别出高集中度风险，触发"寻找替代供应商"Action
三轨验证 | 成本轨：月均成本3,200元（模型训练与维护2,000元/月+标注人工1,200元/月，人工投入15小时/月用于异常样本审核），ROI周期4个月 | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，满足HS编码合规要求，通过ISO 27001数据安全认证 | 风险轨：标签漂移风险（概率15%，新品类识别准确率下降至88%），需建立月度模型评估机制；数据隐私风险（概率8%，涉及消费者购买偏好数据），需签署数据处理协议

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：供应商本体化后，风险识别从"季度审核"→"实时计算"；集中度风险可视化帮助提前分散采购，避免一次断供损失约30万元；认证标签传播使合规检查效率提升10倍
实施难度：⭐⭐⭐☆☆（需要整合多个数据源：ERP/SRM/质检系统，主要难点是数据整合）
优先级评分：⭐⭐⭐⭐⭐（供应商是采购成本和供应风险的核心节点，本体化是精细化管理的基础）
评估依据：Palantir在多个制造业客户的Supplier Ontology实践显示，供应商风险响应速度提升5-10倍

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（285 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：invalid syntax）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/supplier_ontology_capability_map` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Supplier-Ontology-Capability-Map.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应商本体能力图谱
功能：供应商Ontology定义/实例化/健康评分/风险识别/查询引擎
输入：供应商基础数据 + 绩效历史数据
输出：供应商本体实例 + 健康评分 + 风险图谱 + 查询结果
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


@dataclass
class CertificationTags:
    fda_registered: bool = False
    ce_certified: bool = False
    iso9001: bool = False
    rohs_compliant: bool = False
    cpsc_compliant: bool = False
    cert_expiry: dict = field(default_factory=dict)

    def cert_score(self) -> float:
        """认证完整度评分（0-1）"""
        weights = {
            "fda_registered": 0.30, "ce_certified": 0.25,
            "iso9001": 0.20, "rohs_compliant": 0.15, "cpsc_compliant": 0.10,
        }
        score = sum(w for attr, w in weights.items() if getattr(self, attr, False))
        return score

    def active_certs(self) -> list:
        """获取有效认证列表（未过期）"""
        now = datetime.now().date()
        certs = []
        for attr in ["fda_registered", "ce_certified", "iso9001", "rohs_compliant", "cpsc_compliant"]:
            if getattr(self, attr, False):
                expiry = self.cert_expiry.get(attr)
                if expiry is None or expiry > now:
                    certs.append(attr)
        return certs


@dataclass
class CapabilityTags:
    product_lines: list = field(default_factory=list)
    monthly_capacity: int = 0
    min_order_qty: int = 0
    lead_time_days: int = 30
    customization_capability: bool = False
    tech_level: str = "standard"  # entry/standard/advanced

    def can_fulfill(self, product_line: str, qty: int) -> bool:
        return (product_line in self.product_lines and qty >= self.min_order_qty
                and qty <= self.monthly_capacity)


@dataclass
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.07441，但该号在 arXiv 上是《Writhes and $2k$-moves for virtual knots》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商基础数据（来自 ERP/SRM/质检系统的供应商主数据）与绩效历史数据；标准化本体模板约 50 个字段，含能力、认证、绩效、风险四维结构化字段。

**输出**：供应商本体实例、健康评分、风险图谱与查询结果，供采购团队做准入、集中度分散与合规检查使用。

## 执行步骤

1. 按四维本体模板录入新供应商字段，完成本体实例化
2. 调用健康评分计算综合得分与认证完整度
3. 识别缺失或过期认证并生成合规提示
4. 按地域与集中度查询并输出供应商风险地图
5. 对高集中度风险触发寻找替代供应商的行动建议

## 边界与不做

- 何时不用：仅需单个供应商的准入筛选与证书到期预警时，用供应商准入认证KPI；仅需供应商月度绩效打分与趋势预警时，用供应商绩效积分卡。
- 能力边界：产出供应商本体、评分与风险图谱，不替代 SRM/ERP 主数据系统，也不自动执行供应商切换或合同变更。
- 数据边界：评分依赖 ERP/SRM/质检多源数据整合，数据缺失或口径不一致时评分不可用。

## 技能关联

- **前置**：Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Risk-XGBoost.html、Skill-Supplier-Risk-XGBoost、Skill-Supplier-Ontology-Capability-Map

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：24-标签工程　·　源卡：`Skill-Supplier-Ontology-Capability-Map`