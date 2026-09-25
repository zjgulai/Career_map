---
name: "p2s-sku-entity-unified-id-tagging"
title: "SKU跨平台实体统一标识与标签同步 — ASIN/SKU/ERP三码合一的实体对齐与标签一致性保障"
description: "触发词：三码合一、统一标识、Golden Record、跨平台ID映射、标签同步、主数据对齐。何时不用：需要判断不同命名是否为同一实体时用「KG实体消歧与去重」；需要在线做跨平台同款匹配查询时用「产品知识图谱查询」。安全边界：标签冲突必须按既定优先级规则合并并留痕，不得静默覆盖；跨平台同步不得触发平台政策红线（如跨平台价格同步、把平台数据用于竞品分析）；本方案仅处理产品 ID 与库存数量，不涉及个人数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-138"
l3_business: "账号商品映射"
l3_all: "账号商品映射 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/账号商品映射"
p2s_card_id: "Skill-SKU-Entity-Unified-ID-Tagging"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把 ASIN、SKU、ERP 编码合成一条黄金记录，库存对账从 3 天人工变成实时自动，打标一次三个平台同时生效。"
user_try: "试试：给新品辅食机在统一标识上打新品上市标签，自动同步到 Amazon、TikTok、Shopify，14 天后自动转成长期。"
whenToUse: "当同一商品在各平台有多个外部 ID、需要建立统一标识并对齐标签口径时用本技能；若还停留在判断两个名字是否为同一实体的阶段，先用「KG实体消歧与去重」；若要在查询时实时做跨平台同款匹配，用「产品知识图谱查询」。"
workflow: "建立各平台外部 ID 与内部 internal_id 的映射关系 → 生成 Golden Record 并挂载平台 ID 列表与置信度、匹配方式 → 按优先级顺序（ERP 优先等）合并冲突标签并记录冲突明细 → 在内网一次打标后自动同步到各平台标签视图 → 按统一标识追溯各系统库存口径差异"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SKU跨平台实体统一标识与标签同步 — ASIN/SKU/ERP三码合一的实体对齐与标签一致性保障

## ① 解决的问题

运营团队面临"3个平台5套SKU编码数据对不上"——Golden Record三码合一将库存对账从3天人工→实时自动，跨平台标签同步从90分钟→5分钟

## ② 核心算法逻辑

跨平台实体统一（CrossPlatform Entity Alignment） 是标签工程的数据基础：在给实体打标签之前，必须确认"这三个不同名字是同一个产品"。

## ③ 业务应用场景

场景A：多平台库存不一致根因追溯 - 业务问题：Amazon 报告某 SKU 有 200 件库存，但 ERP 只有 180 件，TikTok 系统没有记录，不知道哪个对 - 统一标识方案：确认三个系统的 ID 映射后，追溯差异： - Amazon 200件 = FBA 实物 180件 + 在途 20件（Amazon内部预分配） - ERP 180件 = 已入仓实物 - TikTok = 0件（该平台无独立库存，走 Amazon FBA 发货） - 业务价值：消除库存数据孤岛，统一视图建立后补货决策无争议
三轨验证： - 成本：显性成本约 8,000-15,000 元（数据采集 API 费用 + 映射表人工维护 40 小时 + 计算资源 500 元/月）。初期映射关系建立需 2-3 周，后续维护每周约 2 小时。 - 合规：Amazon 政策允许通过 API 获取库存数据，但禁止跨平台价格同步（可能触发 MAP 政策）。GDPR 要求用户数据匿名化，本方案仅涉及产品 ID 和库存数量，不涉及个人数据，合规风险低。需注意 Amazon 的 "数据滥用" 条款，禁止将 Amazon 数据用于竞品分析。 - 风险：中等风险。若 Amazon 检测到频繁 API 调用可能触发限流或账号审查。库存数据公开
场景B：新品上市跨平台标签同步 - 业务问题：新款辅食机上市，需要在 Amazon/TikTok/Shopify 三个平台同时打上"新品上市"标签，并确保 14 天后自动更新为"成长期" - 统一标识方案：一次在 internal_id 打标 → 自动同步到三个平台的标签视图 - 业务价值：从"3个系统分别操作（各30分钟）"→"1次操作（5分钟）"，避免遗漏和不一致

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：统一标识消除数据孤岛后，库存数据对账从"3天人工"→"实时自动"（节省月均人力成本约5,000元）；跨平台标签同步使新品上市操作从"3平台分别操作90分钟"→"一次操作5分钟"，年节省约80小时运营时间
实施难度：⭐⭐⭐☆☆（主要工作量在初期映射关系建立，一旦建立维护成本低）
优先级评分：⭐⭐⭐⭐☆（是所有"跨平台联合分析"的数据基础，没有统一标识，多渠道运营永远是数据孤岛）
评估依据：母婴跨境品牌平均在3-5个平台销售，平均每个SKU有2-4个外部ID，统一标识是标签工程的必要前提

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（262 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unexpected EOF while parsing）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/sku_entity_unified_id_tagging` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SKU-Entity-Unified-ID-Tagging.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SKU跨平台实体统一标识与标签同步
功能：多平台ID映射 / 实体对齐 / 标签冲突解决 / 统一标签视图
输入：各平台SKU数据 + 映射规则
输出：Golden Record / 统一ID映射 / 跨平台一致性标签
"""
import numpy as np
import pandas as pd
import hashlib
import re
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PlatformID:
    platform: str
    external_id: str
    confidence: float = 1.0
    match_method: str = "manual"  # manual/rule/embedding


@dataclass
class GoldenRecord:
    """黄金记录：跨平台统一实体"""
    internal_id: str
    canonical_name: str
    product_family: str
    brand: str
    platform_ids: list = field(default_factory=list)  # [PlatformID]
    unified_tags: dict = field(default_factory=dict)   # tag_id → {value, source, confidence}
    tag_conflicts: list = field(default_factory=list)  # 冲突记录

    def add_platform_id(self, platform: str, external_id: str,
                         confidence: float = 1.0, method: str = "manual"):
        self.platform_ids.append(PlatformID(platform, external_id, confidence, method))

    def merge_tag(self, tag_id: str, value, source: str, confidence: float,
                   priority_order: list = None):
        """合并标签（处理冲突）"""
        priority_order = priority_order or ["erp", "amazon", "shopify", "tiktok", "manual"]

        existing = self.unified_tags.get(tag_id)
        if existing is None:
            self.unified_tags[tag_id] = {
                "value": value, "source": source,
                "confidence": confidence, "all_sources": {source: value}
            }
        else:
            # 记录所有来源的值
            existing["all_sources"][source] = value

            # 检测冲突（值不同）
            if existing["value"] != value:
                # 按优先级选择
                existing_priority = priority_order.index(existing["source"]) \
                    if existing["source"] in priority_order else 999
                new_priority = priority_order.index(source) \
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2304.09123，但该号在 arXiv 上是《Finite-Sample Bounds for Adaptive Inverse Reinforcement Learning using Passive Langevin Dynamics》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各平台 SKU 数据（平台、外部 ID、标题、属性）与映射规则、标签定义及其优先级顺序；粒度为 SKU 级实体与标签键值。

**输出**：Golden Record（统一内部 ID、规范名、产品族、品牌、平台 ID 列表、统一标签与冲突记录）、统一 ID 映射表与跨平台一致性标签视图，供多渠道运营与主数据治理使用。

## 执行步骤

1. 采集各平台 SKU 与外部 ID，建立与内部标识的映射关系
2. 生成 Golden Record，记录每个平台 ID 的置信度与匹配方式
3. 按优先级规则合并冲突标签，并保留冲突记录备查
4. 打一次内部标识标签，自动同步到各平台标签视图
5. 用统一标识追溯多系统库存口径差异，消除对账争议

## 边界与不做

- 数据不满足：平台 ID 映射关系尚未建立时不要启动标签同步，否则会同步到错误实体。
- 何时不用：判断两个名字是否为同一实体用「KG实体消歧与去重」，在线同款匹配查询用「产品知识图谱查询」。
- 能力边界：只做标识统一与标签一致性，不改变各平台商品数据本身，也不替代各平台自身的库存口径。
- 安全边界：标签冲突不得静默覆盖，必须按优先级留痕；不得触发跨平台价格同步或将平台数据用于竞品分析。

## 技能关联

- **前置**：Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-SKU-Entity-Unified-ID-Tagging

---

> 分类：数据与Agent平台/数据与AI运行/账号商品映射　·　技术族：24-标签工程　·　源卡：`Skill-SKU-Entity-Unified-ID-Tagging`