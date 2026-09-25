---
name: "p2s-mas-inventory-consensus-action"
title: "MAS-Inventory-Consensus-Action — 多仓Agent协商补货分配共识与库存均衡执行"
description: "触发词：多仓协商、优先级拍卖、库存均衡、调拨共识、紧迫度出价。何时不用：只做点对点调拨计算、不涉及多方协商时用「多仓库存再平衡」；跨渠道库存池化用「一盘货库存调度」。安全边界：调拨单据与成本归集须完整留痕，会计处理需与财务确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-MAS-Inventory-Consensus-Action"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让缺货仓和积压仓自己出价协商，把货从堆着的仓挪到快断的仓。"
user_try: "试试：东仓过剩 700 件、西仓缺 800 件，按紧迫度协商给出调拨量和调拨成本。"
whenToUse: "多个仓同时出现积压与缺货、人工调拨决策周期长时用；两端调拨量可直接算出时用「多仓库存再平衡」即可。"
workflow: "计算各仓缺货紧迫度与可出让剩余量 → 缺货仓作为买家按紧迫度出价、盈余仓按剩余量排序 → 撮合调拨量并计算调拨成本 → 输出调拨方案与库存均衡率改善"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS-Inventory-Consensus-Action — 多仓Agent协商补货分配共识与库存均衡执行

## ① 解决的问题

仓储运营面临东仓积压700件西仓缺货800件同时存在的库存失衡——多仓Agent优先级拍卖协商调拨将多仓库存均衡率提升25%，年化减少仓储费+缺货损失约$85,000

## ② 核心算法逻辑

论文: AuctionBased Consensus for MultiAgent Inventory Rebalancing | 年份: 2020

## ③ 业务应用场景

- 状况：美国东仓库存2,500（目标1,800，过剩700）；西仓库存400（安全库存1,200，缺货800）；FBA仓库存800（安全库存600，正常）。 - 协商过程：西仓紧迫度=0.67×1.8卖速=1.21（高出价），东仓可出让700。协调Agent分配：东仓→西仓调拨600件（剩余100做缓冲）。 - 结果：西仓缺货率从33%→0%，东仓过剩从700→100，整体库存均衡率提升28%。调拨成本$420，避免西仓缺货损失GMV约$9,600（按缺货率×日销额估算）。 - 业务价值：多仓库存均衡率提升25%，A仓缺货B仓积压的低效状态消除，年化减少仓储费+缺货损失约$85,000。
成本轨： - 数据采集成本：各仓库存系统API接入一次性投入$8,000（开发+测试）；月度维护$500 - 计算资源成本：协商算法执行（日均10-20次调用）云计算成本约$200/月 - 人力投入：初期流程设计+系统集成2周（$5,000），后续月度监控维护0.5周（$1,200/月） - 总成本：初期$13,000，月度运营成本$1,900 - 成本回收周期：约1.5个月（基于$85,000年化收益）
合规轨： - Amazon政策：✅ 合规。多仓调拨属于内部库存管理，不涉及FBA政策限制；调拨单据需完整记录，符合Amazon库存追踪要求 - GDPR：✅ 合规。仅涉及库存数据，无个人信息处理 - 跨境贸易法规：✅ 合规。美国内部调拨无关税影响；若涉及国际调拨需确保符合目的地国进口规定 - 财务合规：✅ 需确保调拨成本在财务系统正确归类（库存转移vs.运输费用），建议与财务部门确认会计处理

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

协商效率：规则协商协议执行时间<1秒，远快于人工调度（2-4小时决策周期）
实施难度：⭐⭐⭐（需要各仓实时库存API接入，协商逻辑工程化）
优先级：⭐⭐⭐⭐（多仓运营品牌直接体感，ROI清晰可量化）
扩展方向：替换规则拍卖为QMIX神经网络，适应更复杂的多仓约束场景

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field


@dataclass
class WarehouseAgent:
    """单仓Agent状态"""
    warehouse_id: str
    current_stock: float
    safety_stock: float       # 安全库存
    target_stock: float       # 目标库存（过剩判断基准）
    daily_sales_velocity: float  # 日均销量
    transfer_cost_per_unit: float = 1.0  # 调拨单位成本

    @property
    def urgency(self) -> float:
        """缺货紧迫度：0=充足，1=完全缺货"""
        if self.current_stock >= self.safety_stock:
            return 0.0
        return (1.0 - self.current_stock / self.safety_stock) * self.daily_sales_velocity

    @property
    def surplus(self) -> float:
        """可出让量（超出目标库存的部分）"""
        return max(0.0, self.current_stock - self.target_stock)

    @property
    def shortage(self) -> float:
        """缺货量"""
        return max(0.0, self.safety_stock - self.current_stock)

    @property
    def status(self) -> str:
        if self.current_stock < self.safety_stock:
            return "缺货"
        elif self.current_stock > self.target_stock:
            return "过剩"
        return "正常"


def auction_consensus(
    agents: List[WarehouseAgent],
    verbose: bool = True
) -> List[Dict]:
    """
    优先级拍卖协商协议
    返回: [{"from": wh_id, "to": wh_id, "quantity": float, "cost": float}]
    """
    buyers = [(a, a.urgency) for a in agents if a.shortage > 0]
    sellers = [(a, a.surplus) for a in agents if a.surplus > 0]
    
    if not buyers or not sellers:
        if verbose:
            print("  无需协商：没有买卖双方")
        return []
    
    # 按紧迫度降序排序买家
    buyers.sort(key=lambda x: x[1], reverse=True)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2003.08823，但该号在 arXiv 上是《Conditional Gaussian Distribution Learning for Open Set Recognition》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《AuctionBased Consensus for MultiAgent Inventory Rebalancing》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各仓当前库存、安全库存、目标库存、日均销量速度与单位调拨成本，按仓一条记录。

**输出**：调拨方案（调出仓、调入仓、数量、成本）、各方调拨后的库存状态与整体库存均衡率改善，以及避免的缺货损失估算。

## 执行步骤

1. 计算各仓缺货紧迫度与可出让剩余量
2. 把缺货仓作为买家按紧迫度排序
3. 撮合买卖双方确定调拨量与成本
4. 计算调拨后的库存状态与均衡率
5. 输出调拨方案与缺货损失避免额

## 边界与不做

- 数据不满足时不适用：各仓库存无法实时获取，或缺少安全库存与目标水位时，紧迫度与剩余量都算不出来。
- 能力边界：只产出协商结果与调拨方案，实际调拨指令、运输安排与财务归集由人工或仓储系统执行。

## 技能关联

- **前置**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MAS-Pricing-Coalition-Stability.html、Skill-MAS-Pricing-Coalition-Stability、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score
- **延伸**：Skill-MAS-Pricing-Coalition-Stability.html、Skill-MAS-Pricing-Coalition-Stability、Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score
- **可组合**：Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score、Skill-MAS-Inventory-Consensus-Action

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：10-MAS　·　源卡：`Skill-MAS-Inventory-Consensus-Action`