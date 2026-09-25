---
name: "p2s-data-mesh-ecommerce"
title: "Data Mesh for Ecommerce — 数据网格架构"
description: "触发词：数据网格、数据产品、指标契约、联邦治理、域自治。何时不用：数据团队规模小、只是几张表口径打架时先用数据契约与数据目录；本技能是组织加架构的双重变革，不适合小团队起步。安全边界：联邦治理必须统一 PII 标记与访问审计，各域不得各自解读 GDPR；域边界未评审前不要复制数据产品。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 指标契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Data-Mesh-Ecommerce"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "让每个业务域自己发布带 SLA 的数据产品，别的团队只读订阅、自助分析，不用排队等数据工程。"
user_try: "试试：把供应链域的 SKU 库存健康算成一个带 SLA 的数据产品，定义好字段和更新频率。"
whenToUse: "多团队各自维护同名字段、跨域 JOIN 要排队数周时用本技能；单域内口径不一致用数据契约类技能，SKU 主键统一用主数据治理类技能。"
workflow: "划定域边界并选一个域先试点 → 定义数据产品字段、SLA 与负责人 → 把计算逻辑下沉到域内并注册数据目录 → 消费方只读订阅并自助联邦分析 → 由架构评审收敛重复产品"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Data Mesh for Ecommerce — 数据网格架构

## ① 解决的问题

数据平台团队面临"各部门数据孤岛导致跨域分析效率低下"——数据网格架构将跨域数据请求响应时间从5天降至4小时，年化提升数据驱动决策效率节省30-50万元

## ② 核心算法逻辑

Data Mesh 是一种去中心化数据架构范式，核心原则四条：领域所有权（Domain Ownership）、数据即产品（Data as a Product）、自服务数据基础设施（SelfServe Infrastructure）、联邦式计算治理（Federated Computational Governance）。

## ③ 业务应用场景

场景1：供应链域 SKU 数据产品发布 - 业务问题：运营/广告/财务三个团队各自维护 SKU 基础数据表，字段定义不同（如"库存健康"算法各异），季度对账时数据打架，每次 reconcile 耗时 3-5 天。 - 数据要求：Amazon 库存数据 + 销量数据 + 采购成本；供应链域负责计算并维护 - 预期产出：统一 `sku_health_product` 数据产品，SLA: 日更新，字段标准化，消费方只读订阅 - 业务价值：消除季度对账时间，节省 3-5 天/季度；跨团队数据口径对齐减少决策错误
场景2：广告域与用户域数据产品联邦分析 - 业务问题：投放团队想分析"高 LTV 用户对哪类广告创意响应更好"，需要用户域 LTV 数据 + 广告域点击数据，跨域 JOIN 需要数据工程协助，等待周期 2-3 周。 - 数据要求：用户域 LTV 数据产品（日更）+ 广告域创意点击数据产品（小时更） - 预期产出：投放团队自助 JOIN 分析，决策周期从 2-3 周 → 1 天；高 LTV 人群广告创意优化提升 ROAS 15-20% - 业务价值：投放 ROAS 提升 15%，月广告支出 30 万的场景年化节省/增收约 54 万元
**三轨验证**： - 成本：Data Mesh 初期建设成本高（需组织变革 + 平台建设），适合 50+ 人数据团队；小团队可从"伪 Data Mesh"起步（domain-aligned tables + data catalog） - 合规：联邦治理需要统一 PII 标记标准和数据访问审计，各域无法各自解读 GDPR - 风险：域边界划分不清会导致数据产品重复，初期需要架构委员会评审边界

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：消除跨团队 ETL 重复开发，节省 4-8 人周/季度；数据口径统一减少季度对账耗时 3-5 天/季度；自服务分析将决策等待周期从 2-3 周压缩到 1 天，高价值决策加速的业务价值难以量化但影响深远
实施难度：⭐⭐⭐⭐⭐
优先级：⭐⭐⭐☆☆
评估依据：Data Mesh 是组织架构 + 技术架构双重变革，适合 100+ 人规模、多个 BI/数据团队并行的组织。中小出海团队优先落地数据契约和数据目录，再逐步演进到完整 Data Mesh。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Data Mesh 轻量模拟：数据产品注册 + 联邦治理 + 自服务订阅
"""
from datetime import datetime, timedelta
from typing import Any, Callable
import random

# ── 数据产品定义 ──────────────────────────────────────────────────────────────
class DataProduct:
    def __init__(self, name: str, domain: str, owner: str,
                 schema: dict[str, str], sla_freshness_hours: int,
                 compute_fn: Callable[[], list[dict]]):
        self.name = name
        self.domain = domain
        self.owner = owner
        self.schema = schema
        self.sla_freshness_hours = sla_freshness_hours
        self._compute_fn = compute_fn
        self._last_updated: datetime | None = None
        self._data: list[dict] = []
        self.quality_report: dict = {}

    def materialize(self) -> None:
        """数据产品自主物化（域内触发，无需中心 ETL）"""
        self._data = self._compute_fn()
        self._last_updated = datetime.utcnow()
        self.quality_report = self._compute_quality()
        print(f"  [{self.domain}] {self.name}: 物化完成, {len(self._data)} 条记录, "
              f"质量分={self.quality_report['score']:.1f}/10")

    def _compute_quality(self) -> dict:
        if not self._data:
            return {"score": 0.0, "null_rate": 1.0}
        null_count = sum(
            1 for row in self._data for v in row.values() if v is None
        )
        total_cells = len(self._data) * len(self.schema)
        null_rate = null_count / max(total_cells, 1)
        return {"score": round((1 - null_rate) * 10, 2), "null_rate": round(null_rate, 4)}

    def query(self, filters: dict[str, Any] | None = None) -> list[dict]:
        """消费方自服务查询"""
        if filters is None:
            return self._data
        return [row for row in self._data
                if all(row.get(k) == v for k, v in filters.items())]

    def is_fresh(self) -> bool:
        if self._last_updated is None:
            return False
        return datetime.utcnow() - self._last_updated < timedelta(hours=self.sla_freshness_hours)


# ── 联邦治理层 ────────────────────────────────────────────────────────────────
class FederatedGovernance:
    """统一治理标准：PII 标记、命名规范、SLA 检查"""
    REQUIRED_SCHEMA_FIELDS = ["entity_id", "updated_at"]
    MAX_SLA_HOURS = 48

    def validate(self, product: DataProduct) -> list[str]:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各域原始数据（如 Amazon 库存、销量、采购成本、用户 LTV、广告点击），需明确域归属与责任人，并统一 PII 标记。

**输出**：可订阅的数据产品（含字段定义、SLA 更新频率、owner），供跨域自助分析与决策使用。

## 执行步骤

1. 划定域边界并选定试点域
2. 把指标计算下沉到域内并定义数据产品契约
3. 注册数据产品到数据目录并声明 SLA 与 owner
4. 开放只读订阅供消费方自助联邦分析
5. 用架构评审收敛重复产品与边界分歧

## 边界与不做

- 小团队或只有单域问题时不用本技能，先用轻量数据契约与数据目录起步。
- 本技能产出数据产品定义与治理约定，不代替各域的实际 ETL 与建模实现。
- 统一 PII 标记与访问审计是硬约束，各域不得自行解读 GDPR 口径。

## 技能关联

- **可组合**：Skill-Data-Mesh-Ecommerce

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：22-数据采集工程　·　源卡：`Skill-Data-Mesh-Ecommerce`