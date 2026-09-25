---
name: buyer-trade-intent
version: 1.6.0
description: |
  买家「下单 / 订单查询 / 地址查询 / 订单调整 / 交易通知 / 售后退款」类诉求的统一入口。命中以下任一即触发:
  1. 下单意图:明确购买、索要下单链接、确认买某款、先下几件/几箱/几台、发起询盘下单(尤其上下文已有商品链接 / 卡片 / `productId`)。
  2. 查询类(订单 + 地址):订单状态/详情/进度/付款/订单号查询;查/列出/切换收货地址、按国家或序号挑地址。无论是否处于下单上下文都触发;订单查询走正向流程 §7,地址查询无下单上下文时走正向流程 §5。
  3. 可下单性判断:是否可下单 / 是否在售 / 是否支持 Buy Now 或询盘下单。
  4. 订单调整:BN 订单展示后改 SKU / 换商品 / 换地址 / 换物流 / 确认下单 / 取消 / 去支付。
  5. `[Trading Notifications]` 前缀消息:直接进入交易通知分支(正向流程 §7)。
  6. 售后纠纷退款:发起退款 / 取消订单退款 / 售后申请、退款进度 / 纠纷状态、售后订单列表;含「退款 / 售后 / 纠纷 / 取消订单退款」关键字,或「(退款|纠纷|售后)+进度」「(refund|dispute) status/progress」组合即触发,统一走售后流程,不进正向流程 §1~§5、不进正向流程 §7。**裸"进度"(订单进度 / 支付进度)归正向流程 §7,不进售后流程;包裹物流轨迹走 `alibaba-logistics-assistant-buyer`**。
  搜索、比价、看报价、找供应商**不**触发。包裹物流轨迹(订单物流/货到哪了/运单号/签收)**不**触发,走 `alibaba-logistics-assistant-buyer`。
  约束:对 `alibaba-icbu-trade-sub-agent` 的所有调用都必须先按本 skill 流程执行,不得绕过。
  职责分工:本 skill 负责意图识别、当前 Query 端型识别、字段收集、品类判定、用 data-only `get_prod_detail` 严格预解析 skuId、按端型展示 SKU(desktop 使用 selector,其他端型及缺失 / 未知端型使用 Markdown)、上下文锁定状态维护、JSON 拼装、路由、透传;sub-agent 负责订单创建、地址与承运商 askUser 交互、订单卡片渲染、fallback 链接。
renderers:
  sku_selector:
    description: >-
      Desktop-only interactive SKU selector iframe for BN order flow. Displays product attributes
      (color images, size options), quantity controls, tiered pricing, and MOQ validation.
      Buyer selects SKUs and confirms via refCards output. Triggered by the built-in
      sku_selector function tool, which internally calls MCP get_prod_detail and only
      renders when isTradable=Y and the current query Client is desktop.
    url: https://g.alicdn.com/code/npm/@ali/buyer-agent-chatui-message/2.2.321/sku-selector/index.html
    tool: sku_selector
enabled: true
---

# 买家交易意图 Skill

本 skill 是所有交易相关场景（下单、订单查询、地址查询、交易通知、售后退款）的统一入口，负责识别用户意图并路由到正确分支。详细流程拆分在 `references/` 子文件中：

- 正向相关流程（下单 / 订单查询 / 地址 / 交易通知）→ [`references/forward-flow.md`](references/forward-flow.md)
- 售后相关流程（退款 / 纠纷 / 售后状态）→ [`references/after-sales-flow.md`](references/after-sales-flow.md)
- Desktop SKU 选择器协议（BN 流程内调 `sku_selector` 工具前必读）→ [`references/sku-selector.md`](references/sku-selector.md)
- 非 Desktop SKU Markdown 协议（BN 流程内展示或解析 Markdown SKU 前必读）→ [`references/sku-markdown.md`](references/sku-markdown.md)

## 顶层意图分流

进入本 skill 后**先做意图分流**，再读取对应 reference 执行：

```
用户消息 / 系统调用
  │
  ├─ 售后意图（退款 / 纠纷 / 取消订单退款 / 售后状态 / 售后订单列表）
  │   关键字：「退款 / 售后 / 纠纷 / 取消订单退款 / refund / dispute / after-sales」
  │   或：「(退款|纠纷|售后)+进度」/「(refund|dispute) status/progress」
  │   └─► MUST read and execute references/after-sales-flow.md
  │
  ├─ `[Trading Notifications]` 前缀消息
  │   └─► MUST read and execute references/forward-flow.md（直接进入交易通知分支 §7）
  │
  └─ 正向交易意图（下单 / 订单查询 / 地址 / 可下单性判断 / 订单调整）
      └─► MUST read and execute references/forward-flow.md
```

**分流硬规则**：

1. 含「退款 / 纠纷 / 售后」前置词的进度查询 → 售后流程；裸「进度 / 状态 / 付款」无售后前置词 → 正向流程 §7；包裹物流轨迹（订单物流 / 货到哪了 / 运单号 / 签收）→ `alibaba-logistics-assistant-buyer`。
2. 售后流程**不触发** SellerAgent 监听检查（售后不是新建订单）。
3. 售后流程**不进** §1~§5（productId 收集 / BN / 询盘分支）、**不进** §7（正向订单查询）。
4. 搜索、比价、看报价、找供应商**不**触发本 skill；只有进入下单 / 订单 / 地址 / 售后 / 通知场景才触发。

## 正向交易流程

> **⚠ Before responding, MUST read and execute [`references/forward-flow.md`](references/forward-flow.md)。**

包含：边界、职责切分、核心原则、上下文锁定状态（E1~E7）、流程总览、§1 意图识别、§2 productId 收集、§3 品类判定、§4 BN 品分支、§5 独立地址分支、§6 询盘品分支、§7 交易通知 / 主动订单查询、§8 订单创建成功后的监听检查、§9 追问优先级、§10 用户可见表达约束、§11 验收清单。

## 售后流程

> **⚠ Before responding, MUST read and execute [`references/after-sales-flow.md`](references/after-sales-flow.md)。**

包含：售后意图识别、二级意图分流（R1 退款引导 / R2 退款提交 / R3 状态查询）、orderId 收集、skill 间流转约束表、确认退款判定条件、透传规则、安全约束、reasonMapping / reasonTextMapping 续传协议、表达约束和验收清单。

**与正向流程的边界**：

- 售后订单列表能力**只在售后流程 R3**（sub-agent `alibaba-icbu-trade-after-sales-status-query` 内含 `simpleFilter@dispute` 列表分支）；正向流程 §7 的 `alibaba-icbu-trade-order-query` 不支持 dispute filter。
- **绝不向用户暴露**内部技术细节：reasonId / reasonCode / scenarioCode / actionType / submitPayload / isTradable 等字段名、MCP 工具名、customTool 名。只使用自然业务表达。
