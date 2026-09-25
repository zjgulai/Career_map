---
name: "p2s-feature-store-architecture"
title: "Feature Store Architecture — 特征工程平台化"
description: "触发词：特征仓库、特征注册、离线在线一致、时间点回填、特征复用。何时不用：只需在线毫秒级读取特征值、不涉及训练一致性时用实时特征仓库技能；只做数据质量监控时用数据质量类技能。安全边界：特征存储须做数据最小化、不存 PII，并按删除权要求支持按实体删除。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Feature-Store-Architecture"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把各个团队各算一遍的特征收进一个仓库，训练和线上用同一份口径，别再对不上。"
user_try: "试试：把供应链的 SKU 风险分注册成共享特征，广告团队复用同一版本，并检查训练与线上口径是否一致。"
whenToUse: "多个团队或多条链路重复计算同一特征、出现训练线上不一致时用本技能；只要在线毫秒级读取，用实时特征仓库技能。"
workflow: "登记特征视图与负责人、更新频率 → 离线物化历史特征快照 → 按时间点回填训练集 → 在线侧读取同一版本特征 → 定期回放校验线上线下分布一致"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Feature Store Architecture — 特征工程平台化

## ① 解决的问题

数据工程师面临"特征计算逻辑散落各处导致训练线上不一致"——特征工程平台化将训练线上一致性从75%提升至98%，年化减少模型性能损耗节省20-40万元

## ② 核心算法逻辑

Feature Store 是 ML 平台的"数据中间层"，解决特征工程从离线训练到在线推理的一致性问题（TrainingServing Skew）。核心架构分三层：

## ③ 业务应用场景

场景1：跨团队共享 SKU 风险特征 - 业务问题：供应链团队计算了"SKU 滞销风险分"，广告团队需要同一特征做投放降权，但两边独立 ETL 造成计算口径不一致，同一 SKU 在两套系统中风险分相差 30%。 - 数据要求：Amazon 销量历史（90天）+ 库存水位 + 退货率；更新频率：日级 - 预期产出：统一 Feature Store 存储 `sku_risk_score`，两团队共享同一特征版本，口径一致性 100% - 业务价值：消除重复 ETL 开发，节省 2-3 人周/季度；广告降权精度提升减少无效曝光费用 约 5%
场景2：实时个性化推荐特征 - 业务问题：用户在 TikTok 广告点击后落地到独立站，推荐系统使用前一天的用户兴趣特征（batch），未能捕捉当前浏览行为，首屏相关性低。 - 数据要求：实时点击流（Kafka）→ Flink 计算 5 分钟滑动窗口兴趣标签 → 写入 Redis Feature Store - 预期产出：实时特征延迟 < 5s，首屏推荐相关性提升（A/B 实验验证 CTR +12-18%） - 业务价值：独立站首屏 CTR 提升 15%，若月 GMV 50 万，转化提升贡献约 3-5 万元/月
**三轨验证**： - 成本：Feast 开源免费，Redis 在线存储按数据量计费（50GB ~ $30/月），Hopsworks 有免费 Community Edition - 合规：特征存储需做数据最小化（不存储 PII，只存统计特征）；GDPR 删除权要求支持按 entity_id 删除所有特征 - 风险：Training-Serving Skew 是最常见隐性风险，需定期用离线回放验证线上特征与训练特征分布一致性

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：消除跨团队重复特征 ETL，节省 2-4 人周/季度；实时特征驱动推荐 CTR 提升 12-18%，对应月 GMV 贡献增量 3-8 万元；Training-Serving Skew 消除使模型线上效果与离线评估偏差从 15-25% 降至 < 3%
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐☆☆
评估依据：Feature Store 是 ML 平台成熟度的标志性基础设施，适合已有 3+ 个 ML 模型在线的团队建设，单模型团队过早引入会增加复杂度。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（156 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Feature Store 架构演示（轻量模拟）
模拟离线特征生成 → 注册 → Point-in-Time 回溯 → 在线服务
"""
import random
from datetime import datetime, timedelta
from typing import Any

# ── 特征注册表 ────────────────────────────────────────────────────────────────
FEATURE_REGISTRY: dict[str, dict] = {}

def register_feature_view(name: str, entity: str, features: list[str],
                           ttl_days: int, owner: str) -> None:
    FEATURE_REGISTRY[name] = {
        "entity": entity,
        "features": features,
        "ttl_days": ttl_days,
        "owner": owner,
        "created_at": datetime.utcnow().isoformat(),
    }
    print(f"  [Registry] 注册特征视图: {name} | entity={entity} | 特征={features}")


# ── 离线特征存储（模拟 Parquet/DeltaLake）────────────────────────────────────
class OfflineFeatureStore:
    def __init__(self):
        self._store: list[dict] = []

    def materialize(self, entity_id: str, features: dict[str, Any],
                    event_timestamp: datetime) -> None:
        """写入历史特征快照"""
        self._store.append({
            "entity_id": entity_id,
            "event_timestamp": event_timestamp,
            **features,
        })

    def get_historical_features(self, entity_df: list[dict]) -> list[dict]:
        """
        Point-in-Time 回溯：对于每个 (entity_id, timestamp) 对，
        找到 timestamp 之前最近的特征快照（防止数据泄漏）
        """
        results = []
        for row in entity_df:
            eid = row["entity_id"]
            ts = row["label_timestamp"]
            # 找 <= ts 的最新快照
            candidates = [
                r for r in self._store
                if r["entity_id"] == eid and r["event_timestamp"] <= ts
            ]
            if candidates:
                best = max(candidates, key=lambda x: x["event_timestamp"])
                results.append({**row, **{k: v for k, v in best.items()
                                           if k not in ("entity_id", "event_timestamp")}})
            else:
                results.append({**row, "sku_sales_velocity": None, "sku_risk_score": None})
        return results
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：特征定义（名称、实体键、特征列表、更新频率、负责人）与源数据（如 90 天销量历史、库存水位、退货率、实时点击流），粒度到实体 id 与特征时间戳。

**输出**：统一注册的特征视图、离线与在线两份存储中的特征值（含历史快照）以及一致性校验结果，供多个团队与训练、推理链路复用。

## 执行步骤

1. 登记特征视图，明确实体键、特征列表、更新频率与负责人
2. 把源数据计算成特征并物化历史快照
3. 按时间点回填训练集，避免使用未来信息
4. 在线侧写入同一版本特征供推理读取
5. 定期回放校验线上线下特征分布是否一致

## 边界与不做

- 特征只有一条链路使用、不存在口径冲突时收益有限；缺少明确实体键与时间戳的数据无法做时间点回填。
- 本技能负责特征注册、存储与一致性，不负责特征业务定义是否合理，也不替代模型效果评估。

## 技能关联

- **可组合**：Skill-Feature-Store-Architecture

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Feature-Store-Architecture`