---
name: "p2s-online-feature-store-sc-realtime"
title: "供应链实时特征存储架构 — Online/Offline分离+毫秒级读取的Zalando母婴SKU模式"
description: "触发词：在线特征存储、低延迟读取、特征过期、离线在线分离、实时决策。何时不用：需要解决训练与线上口径不一致时用特征仓库架构技能；只做实时行为采集写入时用实时特征采集技能。安全边界：在线存储只放业务统计特征、不放个人敏感信息，并设置过期策略避免读到陈旧值。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Online-Feature-Store-SC-Realtime"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Agent 决策要用的特征预先算好放在线存储里，读取从几秒降到几十毫秒，决策不再被查询拖住。"
user_try: "试试：给补货 Agent 的 10 维特征搭一个在线存储，读取控制在 20 毫秒内，并给特征设置过期时间。"
whenToUse: "Agent 决策需要跨多个系统取特征、查询延迟成为瓶颈时用本技能；需要解决训练与线上特征口径不一致，用特征仓库架构技能。"
workflow: "确定决策所需特征清单与来源系统 → 离线侧每日全量刷新特征 → 把最新特征写入在线存储并设过期时间 → Agent 决策时按实体键低延迟读取 → 监控读取延迟与过期比例"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链实时特征存储架构 — Online/Offline分离+毫秒级读取的Zalando母婴SKU模式

## ① 解决的问题

Agent实时决策分别查询ERP/WMS/预测服务总延迟3秒影响决策效率——Online/Offline特征存储实现在线特征10-20ms读取，支撑每日100K+次实时决策

## ② 核心算法逻辑

特征存储是 Agent 实时决策的"弹药库"：LLM/ML 模型做出决策需要大量上下文特征（当前库存/近7日销量/竞品价格/促销状态/供应商可用性），如果每次决策都实时计算，延迟 5 秒无法接受；如果只用离线批量，特征会过期 24 小时。

## ③ 业务应用场景

补货 Agent 需要决策某 SKU 是否触发紧急补货，在线读取 10 维特征仅需 15ms，包括：当前库存(50件)、在途量(200件)、日均销量(25件)、供应商可靠性(87分)、当前促销状态(无)、缺货风险(68分)。
无特征存储时，Agent 需要分别查询 ERP/WMS/预测服务，总延迟 >3 秒；有了 Online Store，15ms 完成，Agent 可以实时决策而不阻塞。
数据要求：ERP 库存 API、WMS 在途数据、预测服务输出 预期产出：特征 Pipeline（每日全量刷新 <2 小时）+ Online Store（<20ms 读取） 业务价值：Agent 决策延迟从 >3 秒 → <100ms，支撑每日 100K+ 次实时决策

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Zalando 案例：500万SKU特征管道 <2 小时（全量刷新），在线特征 10-20ms 读取；Agent 决策延迟从 >3 秒 → <100ms；模型避免特征泄漏准确率提升 15-30%
实施难度：⭐⭐⭐⭐☆（DynamoDB/Redis 配置 + Spark 管道是主要工程量）
优先级：⭐⭐⭐⭐☆（企业 AI 知识库的数值特征层，Agent 实时决策的前提基础设施）
企业AI知识库依赖：高 — 特征存储即是 AI 知识库的实时数值层，所有 ML/LLM 模型依赖于此

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（235 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/online_feature_store_sc_realtime` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Online-Feature-Store-SC-Realtime.md`），已与卡面节选核对，不依赖上述路径。

```python
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import math

@dataclass
class FeatureRecord:
    """特征记录（带时间戳）"""
    entity_id: str       # SKU ID
    features: Dict[str, float]
    timestamp: float = field(default_factory=time.time)
    version: int = 1

class SCOnlineFeatureStore:
    """
    供应链在线特征存储（内存实现）
    生产环境：替换为 DynamoDB / Redis 客户端调用
    
    核心设计：
    - <20ms 读取延迟
    - TTL 自动过期
    - 批量写入优化
    """
    
    def __init__(self, ttl_seconds: int = 86400):  # 默认24小时过期
        self._store: Dict[str, FeatureRecord] = {}
        self.ttl = ttl_seconds
        self.read_count = 0
        self.cache_hits = 0
    
    def write(self, entity_id: str, features: Dict[str, float]) -> bool:
        """单条写入（覆盖最新值）"""
        self._store[entity_id] = FeatureRecord(
            entity_id=entity_id,
            features=features.copy(),
            timestamp=time.time()
        )
        return True
    
    def batch_write(self, records: List[Dict]) -> Dict:
        """批量写入（优化吞吐）"""
        success, failed = 0, 0
        for rec in records:
            try:
                self.write(rec["entity_id"], rec["features"])
                success += 1
            except Exception:
                failed += 1
        return {"success": success, "failed": failed, "total": len(records)}
    
    def read(self, entity_id: str, 
              feature_names: Optional[List[str]] = None) -> Optional[Dict]:
        """在线读取（目标延迟 <20ms）"""
        self.read_count += 1
        record = self._store.get(entity_id)
        if record is None:
            return None
        
        # TTL 检查
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1805.06358，但该号在 arXiv 上是《Conflict-free Replicated Data Types (CRDTs)》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各来源系统的原始数据（库存接口、仓库在途数据、预测服务输出的风险分）与决策所需特征清单，粒度到单个 SKU 的当前值与时间戳。

**输出**：在线特征存储中的最新特征记录（含时间戳、版本与过期时间）与离线特征刷新结果，供 Agent 在毫秒级读取并实时决策。

## 执行步骤

1. 列出补货决策所需特征及其来源系统
2. 离线侧每日全量计算并刷新特征
3. 把最新特征按实体键写入在线存储并设置过期时间
4. 决策时按实体键低延迟读取特征
5. 监控读取延迟与读到过期值的比例

## 边界与不做

- 特征来源系统不提供可批量读取的接口时离线刷新无法完成；决策本身不急、查询延迟可接受时不必引入。
- 本技能只负责特征的存取与延迟，不做特征业务定义，也不负责模型推理与决策效果。

## 技能关联

- **前置**：Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent
- **可组合**：Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-SCPA-Autonomous-SC-Planning-Agent.html、Skill-SCPA-Autonomous-SC-Planning-Agent、Skill-Online-Feature-Store-SC-Realtime

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Online-Feature-Store-SC-Realtime`