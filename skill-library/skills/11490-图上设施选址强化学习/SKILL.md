---
name: "p2s-ppo-swap"
title: "PPO-swap（图上设施选址强化学习）"
description: "触发词：仓库选址、仓网搬迁、站点重规划、调拨网络优化。何时不用：要算补多少货用「补货模拟」，要出具体调拨清货动作清单用「调拨清货建议」；本技能只回答哪个仓该搬到哪个节点。安全边界：搬迁结论仅作候选与优先级建议，实际关仓、开仓须人工复核租约与运营条件后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-PPO_swap"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "每季度需求热力图一变，就能算出哪个海外仓该搬到哪个位置、搬完能省多少配送成本，还能和现状做基准对比。"
user_try: "试试：德国这 5 个仓，慕尼黑订单密度涨了 40%，帮我看看哪个仓该搬、搬到哪，能省多少配送距离？"
whenToUse: "已有节点需求权重与路网距离矩阵，要评估仓库搬迁或站点重新布局时用；要算补多少货用「补货模拟」，要出具体调拨清货清单用「调拨清货建议」。"
workflow: "用路网距离矩阵与节点需求权重建加权图，设定设施数与迭代步数 → 用物理启发式生成初始布局并算初始成本 → 每步只做一次交换：关掉一个设施、在另一节点重开 → 输出最优站点配置、成本下降幅度与基准对比报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PPO-swap（图上设施选址强化学习）

## ① 解决的问题

运营经理面临补货与调拨规则难调参——PPO策略将调拨准确率提升18%，年化省13万元

## ② 核心算法逻辑

PPOswap 解决的是在真实道路网络（加权图）上，如何快速决定把哪个仓库/站点搬去哪里，使全局配送成本最低。传统 Gurobi 在大图上算不动（千节点场景需数小时），贪心启发式又容易陷入局部最优。PPOswap 以"从初始布局出发、反复微调"取代"从零开始构建"，每一步只做一次交换（Swap）：关掉一个现有设施，在另一个节点重开，直到整体成本无法再降。

## ③ 业务应用场景

某母婴出海品牌在德国有 5 个海外仓（法兰克福、汉堡、慕尼黑、柏林、杜塞尔多夫），主营婴儿暖奶器（SKU 编号 WM-220，库存 2000 件，日均销量 50 件）。每季度因城市新区开发、本地母婴店入驻，有 1-2 个仓库的配送覆盖半径出现明显偏移（如慕尼黑南部新建 3 个大型社区，订单密度上升 40%）。人工重新规划 5 个仓的布局需 3 周，Gurobi 求解需 2 小时，无法响应季度需求热力图更新。
| 字段 | 说明 | 来源 | |------|------|------| | `node_id` | 候选仓库/社区节点编号 | 地图 API | | `coord_x/y` | 节点坐标（WGS84） | 地图 API | | `demand` | 过去 30 天暖奶器订单量（权重） | OMS（日均 50 件，月均 1500 件） | | `road_dist[i][j]` | 节点间道路距离矩阵 | 高德/谷歌路网 | | `current_facility` | 当前仓库节点 ID 列表 | 运营台账 |
预期产出 - 毫秒级输出：哪个仓搬到哪个位置，附带搬迁后全局配送距离下降幅度 - 批量评估：对季度 5 个候选仓库调整方案自动排优先级 - 基准对比报告：vs 现状、vs 随机重选

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

需要道路距离矩阵（高德/百度 API 可获取）
无需 GPU，CPU 上推理毫秒级
需要标注节点需求权重（订单热力图）
从 Mock Agent 测试到真实 PPO 训练需要 2-4 周工程投入

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（33 行）。**下面 33 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **33 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，33 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/ppo_swap` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-PPO_swap.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
快速使用示例：PPO-swap 快递站点搬迁
"""
import sys
sys.path.insert(0, "paper2skills-code/04-供应链/facility_location_rl_2025")
from model import FacilityLocationGraph, FacilityLocationEnv, MockPPOSwapAgent

# ① 构建城市路网图（30 个候选位置，选 5 个站点）
graph = FacilityLocationGraph(n_nodes=30, n_facilities=5, seed=42)

# ② 初始化环境（物理启发式初始布局）
env = FacilityLocationEnv(graph, max_steps=30)
facilities, initial_cost = env.reset(init_method="physics")
print(f"初始成本: {initial_cost:.2f}，初始站点: {facilities}")

# ③ 使用 Mock Agent 运行优化（生产环境换成训练好的 PPOSwapTrainer）
agent = MockPPOSwapAgent(graph, n_candidates=10)

for step in range(30):
    remove_idx, add_node = agent.select_action(facilities)
    reward, done, info = env.step(remove_idx, add_node)
    facilities = env.facilities.copy()
    if info.get("valid") and info.get("delta_cost", 0) > 0:
        print(f"Step {step+1}: 将站点 {facilities[remove_idx]} → {add_node}，"
              f"成本下降 {info['delta_cost']:.2f}")
    if done:
        break

final_cost = graph.shortest_path_cost(facilities)
print(f"\n优化完成，成本从 {initial_cost:.2f} → {final_cost:.2f}，"
      f"下降 {(initial_cost - final_cost) / initial_cost:.1%}")
print(f"最优站点配置: {facilities}")
print("[✓] PPO_swap 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：节点级数据：node_id、坐标（WGS84）、过去 30 天需求权重（订单量）、节点间道路距离矩阵（高德或谷歌路网）、当前设施节点列表；另需设施数 n_facilities、最大迭代步数等求解参数。粒度：候选节点乘以需求节点。

**输出**：输出把哪个仓搬到哪个节点及搬迁后全局配送成本与距离的下降幅度、多个候选方案的优先级排序，以及与现状、随机重选的基准对比报告；供运营做季度仓网复盘使用。

## 执行步骤

1. 用路网距离矩阵与需求权重构建加权图，设定设施数与最大迭代步数
2. 以物理启发式生成初始布局并算出初始成本
3. 每步只做一次交换：关掉一个现有设施、在另一节点重开
4. 按成本下降量接受有效交换，直到成本不再下降或达到步数上限
5. 输出最优站点配置与成本下降百分比
6. 与现状和随机重选做基准对比，排出季度候选方案优先级

## 边界与不做

- 数据不满足时不用：缺节点需求权重或路网距离矩阵（含路网接口未覆盖区域）时无法建图求解。
- 只给搬迁候选与优先级建议，不直接关仓或开仓，实际搬迁须人工复核后执行。
- 卡页数字（调拨准确率提升 18%、年化省 13 万元）为案例口径；从 Mock Agent 到真实 PPO 训练还需 2-4 周工程投入。

## 技能关联

- **前置**：Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-PPO_swap

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-PPO_swap`