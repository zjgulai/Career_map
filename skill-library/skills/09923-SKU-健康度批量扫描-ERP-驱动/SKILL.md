---
id: sku-health-scanner
title: SKU 健康度批量扫描（ERP 驱动）
description: 当需要按周/月对大量 SKU 做销量趋势、利润、库存周转、评分等健康度分级（S/A/B/C）并输出货盘周报素材时调用。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

从 ERP 同步数据计算 **健康度评分**，输出 **分级结果** 与 **待归因/待退场** 候选列表，供战略与渠道决策；**不**在本 Skill 内写排产与物流细节（交 `供应链` 域）。

## 前置条件

- ERP 片段含：`sku`、销量（30/90 天）、毛利或成本、`inventory_on_hand`、评分/评论数（可来自平台报表合并）、渠道/站点维度。  
- 口径（币种、时间窗）在任务开始时声明。

## 步骤

1. 数据清洗：去重、异常值截断规则声明。  
2. 维度打分（示例）：动销、毛利、库存周转、星级；权重可配置并 **写死在本次运行头部** 以利复盘。  
3. 合成 **S/A/B/C**；C 级标 **退场/清仓/迁移渠道** 候选。  
4. B 级输出 **归因提示**（流量/转化/竞争/季节）关键词，供下游 `attribution-analyzer`（待建）使用。  
5. 汇总 **周报段落**（给 `strategic-review-generator` 或人工粘贴）。

## 输出格式

- 明细表：`sku | 站点 | 分数 | 等级 | 主因标签 | 建议动作`  
- **附录**：本次权重与阈值。

## When NOT to use

- SKU 数量极少且已人工共识 — 直接表格排序即可。  
- 缺成本与库存字段 — 仅能做销量分级，须在输出中声明 **不可用于利润结论**。

## 相关 Skill

- 上游触发：`anomaly-detector`（`triggers`）  
- 下游：`sku-lifecycle-classifier`（`next`）；再 `triggers` 至 `attribution-analyzer` / `sku-exit-decision-tree`  
- 供应链补货由 **供应链** 域承接
