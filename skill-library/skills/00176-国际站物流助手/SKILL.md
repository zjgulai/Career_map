---
name: alibaba-global-logistics-assistant
description: >-
  国际站物流助手 Skill，覆盖运费试算、物流线路查询等物流服务。
  当用户提到运费查询、运费计算、shipping cost、freight cost、物流费用、发货费用、发货到某国家、商品能不能运、最便宜运输方式、最快物流等物流相关话题时使用；即使用户只是简单问"运费多少"或"怎么发货到XX"也应触发。
  典型话术（有商品）：商品17777111177771运到美国能运吗？/ 商品...20件运到美国运费多少？/ 商品链接(alibaba.com/product-detail/xxx_<ID>.html)到美国运费多少。
  典型话术（无商品）：莫桑耳钉50g发往美国运费多少？/ 马丁靴50件100kg发往美国运费多少？/ 50kg货物发到德国运费多少？/ I want to ship 50kg to the US, how much would it cost?
metadata:
  author: ggs-team
  version: "0.2.0"
---

# 国际站物流助手

服务于买家和商家的一站式国际物流智能助手，覆盖运费试算、物流线路查询等能力。

## MCP 服务一览

| 能力模块 | MCP code | 说明 |
|---------|----------|------|
| 运费试算（有商品） | `icbu_price_center_product_detail_freight` | 基于商品ID+目的国计算运费 |
| 查价器（无商品） | `icbu_seller_query_lg_solution` | 基于重量/体积+目的国查询物流线路（最多3条） |


## 意图路由

根据用户输入，识别意图并路由到对应能力模块。**读取对应 references/ 下的模块文档获取详细执行指引。**

```
用户输入
  │
  ├─ 包含商品ID或alibaba.com商品链接 + 物流相关问题
  │   └─► 运费试算模式 → 读取 references/freight-estimation.md
  │
  ├─ 提供重量/体积/计费重 + 目的国（无商品ID）
  │   └─► 查价器模式 → 读取 references/freight-estimation.md
  │
  └─ 其他物流相关问题（未来扩展）
      └─► 通用物流咨询
```

### 意图识别规则

| 用户输入特征 | 意图 | 能力模块 |
|-------------|------|---------|
| 含商品ID（纯数字如`17777111177771`）或 `alibaba.com/product-detail/` 链接 | 运费试算 | freight-estimation → 运费试算模式 |
| 提供重量/体积/计费重 + 目的国，无商品ID | 运费查询 | freight-estimation → 查价器模式 |
| 含"跟踪"、"物流轨迹"、"tracking"、"到哪了" | 物流跟踪 | 待扩展 |

## 通用规则

以下规则适用于所有能力模块：

### 语言规则
**识别用户的输入语言，始终以用户的语言回复。** 中文提问中文答，英文提问英文答。

### 发货地 (sellerInfoDTOList.shipFromCountry)
1. 会话中用户提供了出发地（如香港/HK、美国/US、中国/CN）→ 采纳
2. 用户未提供 → 留空，由 MCP 内部自行处理

### 免责声明
**仅当回复中实际展示了运费金额时**，回复末尾按用户语言追加：
- 中文："以上运费为阿里巴巴国际站物流提供的参考报价，最终运费以实际下单为准。"
- 英文："Above freight is a reference quote from Alibaba.com Logistics; the final shipping fee will be based on your actual order."

**以下情况不追加免责声明**（回复不含具体运费金额，"以上运费"无所指）：
- "查询不到运费 / 该商品的运费信息"（脚本输出 `error` / `ORDER@-1: null` / `carrierTypeData` 为空）
- "该商品所属商家非 GGS 商家，暂无法查询运费"（`isGGS: false`）
- 任何反问 / 询问参数 / 错误兜底回复
