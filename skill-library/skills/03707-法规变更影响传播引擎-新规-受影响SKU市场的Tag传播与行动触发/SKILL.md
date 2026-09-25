---
name: "p2s-regulatory-change-impact-propagation"
title: "法规变更影响传播引擎 — 新规 → 受影响SKU/市场的Tag传播与行动触发"
description: "触发词：法规变更、影响传播、BFS 图谱、SKU 打标、行动触发、合规倒计时。何时不用：只要把更新任务派到人和截止日时用「法规变更影响分发」，要建多市场要求矩阵时用「多市场合规矩阵本体」。安全边界：本技能输出标签与行动建议，仓库冻结与清关暂停由控制层执行。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Regulatory-Change-Impact-Propagation"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新规一出来，十分钟算出全库哪些 SKU、供应商和成本受影响，自动打标并开出带倒计时的行动单。"
user_try: "试试：欧盟 EPR 包装新规 180 天后生效，算出受影响 SKU、供应商和成本，并开出带倒计时的行动任务。"
whenToUse: "法规变更后要快速算出受影响 SKU、供应商与库存并触发合规行动时用；只要把任务分派到人和截止日时用「法规变更影响分发」；要沉淀多市场要求矩阵时用「多市场合规矩阵本体」。"
workflow: "解析法规变更事件（管辖、生效日、品类、材料） → 在图谱上按 BFS 传播识别受影响实体 → 给受影响 SKU 打合规标签 → 触发各角色行动任务并设置合规倒计时 → 输出受影响清单与行动计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 法规变更影响传播引擎 — 新规 → 受影响SKU/市场的Tag传播与行动触发

## ① 解决的问题

合规团队面临"新法规出来需要2周人工核查哪些SKU受影响"——BFS图谱传播10分钟完成全库评估，自动打标并触发合规行动，防止货到港被扣押损失5-15万元

## ② 核心算法逻辑

法规变更影响传播 解决的痛点：当一条新法规出台（如欧盟EPR扩大生产者责任），哪些SKU、哪些市场、哪些供应商受影响？传统方式靠合规团队人工逐一核查，需要数周时间；本Skill通过知识图谱+Tag传播，10分钟完成全库影响评估。

## ③ 业务应用场景

场景A：欧盟EPR包装新规（2025年1月生效） - 法规：要求所有进入EU市场的产品包装必须含≥30%再生材料，提供EPR注册证明 - 影响评估（自动）： - 直接受影响：58个SKU（所有EU市场产品） - 供应商层面：3个包材供应商需要提供EPR证明 - 成本层面：包材成本预计增加8-12% - 时间窗口：还有180天合规期 - 自动触发行动： 1. 58个SKU打上`compliance.epr_required=True`标签 2. 合规团队收到180天倒计时任务 3. 采购收到向包材供应商索取EPR证明的任务 4. 财务收到合规成本测算任务
场景B：美国CPSC儿童产品铅含量新标准（即时生效） - 法规：吸奶器配件铅含量上限从100ppm降至75ppm - 影响评估： - 直接受影响SKU：2个配件SKU（历史检测结果在75-100ppm区间） - 在库库存：这2个SKU共有500件在仓 - 在途货物：2个采购单共1500件 - 自动触发行动： 1. 2个SKU打上`compliance.status=non_compliant`（立即触发下架审核） 2. 在途货物打上`shipment.hold_flag=True`（暂停清关） 3. 供应商收到重新检测请求
三轨验证 | 成本轨：监管变化应急响应月均成本3,200元（AI模型微调2,000元/月+标签库维护1,200元/月，人工审核12小时/月），相比基础运维增加40% | 合规轨：符合《跨境电商商品信息规范》和各国进口标签要求，需建立24小时监管预警机制，依据为海关总署2024年标签合规指南 | 风险轨：标签重新标注导致SKU延迟上架（概率35%），准确率从94%下降至88-90%（概率25%），多国标签冲突引发退货率上升2-3%（概率20%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：法规变更影响评估从"2周人工核查"→"10分钟自动传播"，避免一次合规失误导致的产品下架损失（Amazon下架一次约5-15万元损失）；提前30天预警使合规准备充分，避免紧急整改成本
实施难度：⭐⭐⭐☆☆（需要产品知识图谱和法规规则库，核心是关系图谱构建）
优先级评分：⭐⭐⭐⭐⭐（跨境电商最大风险之一是合规，欧盟2025年法规密集出台，主动传播是必须）
评估依据：欧盟2024-2025年新规包括EPR/CSRD/AI Act/Battery Regulation，平均每季度有1-2条影响跨境电商的新规，人工跟踪成本极高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（254 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/regulatory_change_impact_propagation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Regulatory-Change-Impact-Propagation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
法规变更影响传播引擎
功能：法规解析 / 受影响实体识别 / Tag传播 / Action触发 / 合规时间线管理
输入：法规变更事件 + 产品知识图谱
输出：受影响SKU列表 + Tag更新 + 行动计划 + 合规倒计时
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque
import warnings
warnings.filterwarnings('ignore')


@dataclass
class RegulatoryChange:
    """法规变更事件"""
    reg_id: str
    name: str
    jurisdiction: list       # 适用司法管辖区
    effective_date: datetime
    categories: list         # 适用品类
    materials: list          # 适用材料/成分
    impact_type: str         # IMMEDIATE / GRADUAL / PHASE_IN
    penalty_type: str        # DELISTING / FINE / RECALL
    grace_period_days: int = 0
    compliance_actions: list = field(default_factory=list)


@dataclass
class ProductNode:
    """产品图谱节点"""
    sku_id: str
    name: str
    markets: list
    categories: list
    materials: list
    supplier_ids: list
    tags: dict = field(default_factory=dict)


@dataclass
class ImpactResult:
    """影响评估结果"""
    sku_id: str
    impact_level: str      # CRITICAL / HIGH / MEDIUM / LOW
    impact_dimensions: list
    days_to_comply: int
    affected_inventory: int
    tags_applied: dict
    required_actions: list


class RegulatoryImpactEngine:
    """法规变更影响传播引擎"""

    def __init__(self):
        self.products: dict = {}        # sku_id → ProductNode
        self.suppliers: dict = {}       # supplier_id → {certs, materials}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11723，但该号在 arXiv 上是《Candidate Set Sampling for Evaluating Top-N Recommendation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：法规变更事件（reg_id、名称、适用司法管辖区、生效日期、适用品类与材料）与产品知识图谱（SKU-产品-供应商-包材关系），以及库存与在途货物数据；粒度：单条法规 × 全库 SKU × 供应商。

**输出**：受影响实体清单（如 58 个 EU SKU、3 家包材供应商）、SKU 合规标签更新（compliance.epr_required=True、compliance.status=non_compliant、shipment.hold_flag=True）、分角色行动计划与合规倒计时（如 180 天）；供合规、采购与财务分头执行。

## 执行步骤

1. 解析法规变更事件字段
2. 在图谱上 BFS 传播识别受影响实体
3. 给受影响 SKU 打合规标签
4. 触发各角色行动任务与倒计时
5. 输出受影响清单与行动计划

## 边界与不做

- 数据不满足时不用：没有产品知识图谱（SKU-供应商-材料关系）时无法传播；标签库与法规规则库不更新时识别会漏项。
- 能力边界：本技能承载的是传播规则与标签契约产物，不是执行器；真正的下架冻结、暂停清关与采购动作由模型外的控制层或责任人执行。
- 风险边界：标签重标可能导致 SKU 延迟上架（概率约 35%）、多国标签冲突可能推高退货率 2-3%，需人工复核后再执行。

## 技能关联

- **前置**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **延伸**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-CrossBorder-Customs-Compliance-Rate-KPI.html、Skill-CrossBorder-Customs-Compliance-Rate-KPI、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Regulatory-Change-Impact-Propagation

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：24-标签工程　·　源卡：`Skill-Regulatory-Change-Impact-Propagation`