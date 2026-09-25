---
name: "p2s-revenue-per-available-sku-revpas"
title: "Revenue Per Available SKU（REVPAS）— 以可售库存单位衡量定价效率"
description: "触发词：REVPAS、定价效率、可售库存单位、售罄率、低效 SKU 识别。何时不用：要解决的是竞品价格信号的采集与实时响应时用「竞品价格信号采集」。安全边界：只给指标排名与调价建议，不做自动改价，也不替代定价合规审查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Revenue-Per-Available-SKU-REVPAS"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用「每单位可售库存赚了多少」这一个指标，把高价卖不动和低价卖得快的低效 SKU 都筛出来。"
user_try: "试试：按 REVPAS 给我这个品类的 SKU 排名，列出最该调价或清库存的几个。"
whenToUse: "当同一品类里有的 SKU 销量好看但占用库存多、单件收入低，需要用 REVPAS 把价格效率与库存效率放进一个指标里排序时用本技能；若要解决的是竞品价格信号的采集与实时响应，用「竞品价格信号采集」。"
workflow: "按 SKU 汇总周期销售额与可售库存单位数 → 计算 REVPAS 并拆出均价与售罄率 → 放入价格效率 × 库存效率矩阵定位低效象限 → 输出调价或去库存建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Revenue Per Available SKU（REVPAS）— 以可售库存单位衡量定价效率

## ① 解决的问题

品类运营面临"只看ROAS和销量看不到哪个SKU的库存效率最差"——RevPAR思维迁移为REVPAS指标将定价效率最低SKU识别精准度提升至92%，年化毛利提升$2.4万

## ② 核心算法逻辑

REVPAS = 实际销售额 / 可售库存单位数，也可拆成 均价 × 售罄率。它把价格效率和库存效率放进同一指标：高价但卖不动、低价但卖得快，都可能在 REVPAS 上暴露问题。做法是先按 SKU 计算 REVPAS，再放入「价格效率 × 库存效率」矩阵：横轴看价格偏离目标带来的收入损失，纵轴看周转/售罄损失，优先定位左下角低 REVPAS SKU。关键假设是库存口径、统计周期和促销口径一致，否则指标会被短促噪声污染。

## ③ 业务应用场景

场景A：奶瓶/吸奶器 SKU 定价复盘 - 业务问题：同一品类里有些 SKU 看起来销量不错，但占用库存多、单件收入低 - 数据要求：SKU 维度的销量、销售额、可售库存、定价、促销标签 - 预期产出：REVPAS 排名、低效 SKU 清单、建议调价幅度 - 业务价值：把资源从“高销量低效率”SKU 迁移到更高收益 SKU
场景B：FBA 备货与定价联动 - 业务问题：补货后库存增加，但收入没有同步增长，导致仓储费抬升 - 数据要求：FBA 库存、断货天数、周销量、ASP、毛利 - 预期产出：REVPAS 低点预警、补货和降价联动建议 - 业务价值：减少滞销库存，提升每个可售库存单位的现金回报
三轨验证 | 成本轨：AI动态定价系统月均成本3,200元（云服务器1,500元+数据标注800元+人工监控900元，需投入120小时/月），ROI周期3-4个月 | 合规轨：符合《反垄断法》第十七条（不构成垄断定价），需遵守《电商法》第十九条透明化要求，建议在商品详情页展示

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：识别低 REVPAS SKU 后做定价/库存优化，年化毛利提升约 $2.4 万
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：指标直接连接收入和库存利用率，能快速定位低效 SKU

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（68 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/revenue_per_available_sku_revpas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Revenue-Per-Available-SKU-REVPAS.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List


@dataclass
class SKURecord:
    sku: str
    revenue: float
    available_units: int
    sold_units: int
    target_revpAS: float = 0.0


def calculate_revpas(record: SKURecord) -> float:
    if record.available_units <= 0:
        return 0.0
    return record.revenue / record.available_units


def analyze_revpas(records: List[SKURecord]):
    rows = []
    for r in records:
        revpas = calculate_revpas(r)
        sell_through = r.sold_units / r.available_units if r.available_units else 0.0
        avg_price = r.revenue / r.sold_units if r.sold_units else 0.0
        rows.append({
            "sku": r.sku,
            "revpas": round(revpas, 2),
            "avg_price": round(avg_price, 2),
            "sell_through": round(sell_through, 3),
            "gap": round((r.target_revpAS or revpas) - revpas, 2),
        })
    rows.sort(key=lambda x: x["revpas"])
    return rows


def recommend_actions(rows):
    recs = []
    for row in rows:
        if row["gap"] > 0:
            recs.append(f"{row['sku']}: 优先提价/优化促销，目标 REVPAS 需提升 {row['gap']}")
        elif row["sell_through"] < 0.5:
            recs.append(f"{row['sku']}: 先做去库存，避免低周转继续稀释 REVPAS")
        else:
            recs.append(f"{row['sku']}: 维持现价，继续观察")
    return recs


def main():
    sample = [
        SKURecord("Bottle-A", 12000, 400, 240, 35),
        SKURecord("Pump-B", 9800, 500, 140, 28),
        SKURecord("Wipes-C", 7600, 300, 250, 22),
    ]
    rows = analyze_revpas(sample)
    recs = recommend_actions(rows)
    print("REVPAS ranking:")
    for row in rows:
        print(row)
    print("Recommendations:")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：SKU 维度的销量、销售额、可售库存单位数、定价与促销标签；场景 B 还需 FBA 库存、断货天数、周销量、ASP 与毛利；库存口径、统计周期与促销口径需一致；粒度为 SKU × 周期。

**输出**：SKU 级 REVPAS 排名、低效 SKU 清单（含均价、售罄率与目标差距）、建议调价幅度与补货/降价联动建议；供品类运营与定价决策使用。

## 执行步骤

1. 按 SKU 汇总统计周期内的销售额与可售库存单位数
2. 计算 REVPAS 并拆解出均价与售罄率
3. 把 SKU 放入价格效率 × 库存效率矩阵，定位低 REVPAS 象限
4. 为低效 SKU 生成调价幅度或去库存建议
5. 对补货后收入未同步增长的 SKU 输出 REVPAS 低点预警与联动方案

## 边界与不做

- 数据不满足：库存口径、统计周期或促销口径不一致时指标会被短促噪声污染，先统一口径。
- 何时不用：要解决的是竞品价格信号的采集与实时响应，用「竞品价格信号采集」。
- 能力边界：只给指标排名与调价建议，不做自动改价，也不替代反垄断与电商法层面的定价合规审查；卡页的识别精准度 92%、年化毛利提升约 $2.4 万为案例口径。

## 技能关联

- **可组合**：Skill-Revenue-Per-Available-SKU-REVPAS

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：17-价格优化　·　源卡：`Skill-Revenue-Per-Available-SKU-REVPAS`