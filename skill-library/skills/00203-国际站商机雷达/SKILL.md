---
name: 国际站商机雷达
version: "3.3.2"
description: 搜索国际站及站外公开 RFQ，查询 RFQ/报价详情、报价历史和报价权益，并支持 RFQ 定时巡检。只处理 RFQ 数据域；不生成报价草稿，不处理询盘、聊天或公网买家背调。
enabled: true
triggers:
  - RFQ
  - RFQ 商机
  - 求购
  - 采购需求
  - 商机中心
  - 全网商机
  - 全网找商机
  - 跨平台商机
  - 不限平台
  - 站外 RFQ
  - MIC
  - Made-in-China
  - TradeWheel
  - RFQ 详情
  - 报价记录
  - 已报价 RFQ
  - RFQ 报价历史
  - RFQ 消耗
  - RFQ 额度
  - 报价权益
  - 剩余报价额度
  - 畅行报价权
  - 置顶报价权
  - RFQ 服务分
  - 报价效果
examples:
  - 帮我找 LED 灯具 RFQ
  - 仅在国际站找蓝牙耳机 RFQ
  - 全网找近 24 小时的太阳能板采购需求
  - 结合我的主营类目推荐 RFQ
  - 查一下这条 RFQ 的详情
  - 汇总近一周 RFQ 报价记录
excludes:
  - skill: alibaba-chat-and-analysis
    when: 查询询盘、买家消息、聊天记录或生成跟进话术
  - skill: alibaba-analysis-brief
    when: 查询非 RFQ 的店铺经营、流量或转化数据
  - skill: alibaba-cco-rag
    when: 仅咨询 RFQ 规则、术语或 FAQ
  - skill: alibaba-blue-ocean-finder
    when: 只要 RFQ 关键词推荐或拓词，而不是 RFQ 列表
  - skill: alibaba-buyer-bgcheck
    when: 要求公网公司背调、风险核验、WhatsApp 或社媒联系方式
workflow: |
  1. 按 A-G 入口表只选一个入口；不要在选定入口前读取 reference。
  2. A/B 搜索读取 references/search-execution.md；只有该文档的条件命中时再加载高级字段 reference。
  3. A/B 有有效 items 时读取 references/delivery-draft.md 并调用 rfq_submit_delivery；空/失败只读 references/terminal-outcomes.md，并用 submit_terminal 让 Assembler 生成终态。
  4. C-F 只读入口表指定的 reference；G 先读报价历史，再按用户所需字段加载详情 reference。
  5. Hybrid 按 references/hybrid-delivery.md 合并 Cron 控制态；新请求的成功、空结果与失败均由同一 Assembler 生成，只有授权 fallback 才读取 references/response-template.md。
---

# 国际站商机雷达

一轮交付真实 RFQ：只用本轮工具事实，不编造标题、数量、买家、等级、联系方式或 URL，数量不超过实际返回。对外中文，可保留 RFQ/MOQ 等术语。

## 1. 先选唯一入口

按用户目标选入口，不要提前加载其他入口文档。“没有报过的 RFQ”等新列表走 A/B；先查历史再搜索须交付两者，历史不代替搜索。`rfq_delivery_goal` 是目标声明，不新增搜索约束。

| 入口 | 判定 | 读取并执行 |
|---|---|---|
| **C. 详情查询** | 有具体 RFQ URL/ID 或上文已选 RFQ，询问详情、买家画像、公司信息 | [references/rfq-detail.md](references/rfq-detail.md) |
| **D. 报价查询** | 有具体 RFQ/报价标识，询问是否报价、报价详情、邮箱、电话或泛指联系方式 | [references/rfq-quote-detail.md](references/rfq-quote-detail.md) |
| **E. 报价历史** | 报价记录、已报价 RFQ、报价消耗、报价管理 | [references/rfq-quote-history.md](references/rfq-quote-history.md) |
| **F. 报价权益** | RFQ 额度、剩余额度、畅行/置顶报价权、服务分 | [references/rfq-quote-rights.md](references/rfq-quote-rights.md) |
| **G. 历史联动分析** | 汇总/分析报价情况，或基于历史补充买家、RFQ、报价内容 | 先读报价历史；只按实际字段需求再读详情或报价详情文档 |
| **A. 条件搜索** | 用户给出产品、类目或关键词；即使同时提到“我的店铺”，仍走 A | [references/search-execution.md](references/search-execution.md) |
| **B. 店铺推荐** | 未给产品/类目/关键词，明确要求按店铺或主营类目推荐 | 先读 [references/store-profile.md](references/store-profile.md)，再读搜索执行文档 |

E/F/G 不需要类目或关键词。E 未给时间默认 7 天；按业务账号统计报价量使用 quote-history 的 `statistics.by_account`，不要用 quote-detail 做批量统计。

详情目标类型和 URL 语义以对应 reference 为准。卖家报价详情页必须走 D；Made-in-China、TradeWheel 原始链接属于 C 的站外详情。邮箱/电话仅在报价详情成功且用户明确索要时展示；WhatsApp、社媒账号和公网背调不属于本 Skill。

## 2. A/B 搜索主链路

完整执行 [references/search-execution.md](references/search-execution.md)，涵盖平台、类目、spec、预算、结果与分流。

几个不可省略的边界：

- “填写报价单/自动报价/开启或关闭托管”不是搜索；“推荐 RFQ 关键词/拓词/蓝海词”交给关键词能力。不要误触发 RFQ 搜索。
- 搜索和展示约束只认 task 中逐字保留的 `用户原始需求`，或 Hook 注入的 `[UPSTREAM_NODE_ARTIFACTS]` 可读产物；不得把 `current_subgoal`、普通 `上下文` 中新增的输出字段、时间范围、排序要求、店铺相关性或结果条数当成用户要求，未出现时使用本 Skill 默认值。
- 用户已给产品/类目/关键词时走 A，不查店铺；B 只使用店铺接口返回的有效 `cateId`，不从商品猜类目。
- 不向用户追问可安全默认的字段；但产品、类目、关键词和 B 的有效主营类目都缺失时，不得调用搜索。
- 不使用 Browser、`accio-mcp-cli`、临时脚本或底层 RFQ 搜索工具替代 `workctl workflow rfq search`。
- 即使用户要求浏览器/Web 搜索 RFQ，也使用专用 workflow，不访问 sourcing.alibaba.com 或 rfq.alibaba.com 页面抓取。
- 同维度多值尽量合并，但不能破坏“类目—限定词—国家”等用户明确配对。
- 站外条目不得使用金银铜牌、活跃买家、高意向或站内报价入口等站内信号；每条推荐理由只引用该条真实字段。
- 用户同时要求立即搜索和创建/更新定时巡检属于 Hybrid：读取 [references/hybrid-delivery.md](references/hybrid-delivery.md)，有结果时复用 Draft 装配并附 Cron 方案，不手写报告。纯 Cron 只读 [references/cron.md](references/cron.md)；Cron/自动任务禁止深搜。

## 3. 有结果后的语义交付

A/B 搜索（含 Hybrid）有有效 `items` 后，才读取 [references/delivery-draft.md](references/delivery-draft.md)。不要预读 JSON Schema、legacy renderer 或异常模板；Draft 最小骨架足够正常提交。

仅当用户明确要求“优质/值得报价/排序/店铺匹配”，或结果包含需要比较的复杂买家信号时，额外读取 [references/recommend-strategy.md](references/recommend-strategy.md)。普通查询用 Draft 简要排序。

生成完整 Draft 对象后，直接调用：

```text
rfq_submit_delivery({"action":"submit","draft":<完整 Draft 对象>})
```

不要先写 `rfq_delivery_draft.json`。装配工具返回 `completed=true`、`delivery_receipt_only=true` 和 `terminal=true` 时，正文已经完成并落盘：禁止再调用 runtime context、list、read、旧装配工具或任何确认工具，只按 skill-executor 协议返回带路径、SHA-256 和字节数的短回执，不回传正文。兼容旧运行时的 `direct_answer_inline=true` 终态：仍将 `direct_answer` 原样作为最终 `delivery`。两种终态均未命中时，才读取回执指定的 `direct_answer_file` 一次并原样交付。

首次可恢复错误优先按 `repair_request` 修补指定字段；没有该字段才修正整份 Draft。两者共用一次修复预算，不得重搜。具体提交方式与异常终态以 delivery-draft reference 为准。

## 4. 空结果、失败与降级

- 搜索无有效 items 或失败：只读 [references/terminal-outcomes.md](references/terminal-outcomes.md)，不加载 Draft、推荐或 renderer 文档，不换词重搜；调用 `rfq_submit_delivery(action=submit_terminal)`，Hybrid 同时附已准备的 Cron 方案。终态原因由 Assembler 从当前 run 权威文件读取，不由 Agent 自报。
- `fallback_authorized=true` 且有 `authorization_id`：才读 [references/response-template.md](references/response-template.md)，按授权兼容渲染一次；普通 Draft 校验失败不能自行进入该路径。
- 只有 `plugin_runtime_stale` 可将搜索返回为 `blocked`。其他终态按工具回执和 terminal reference 如实交付。
- 一旦当前 delivery 出现 `rfq_assembly_result.json`，表示已进入装配阶段；同一 delivery 禁止再次搜索。

## 5. 后续定时巡检

用户要求定时才读 [references/cron.md](references/cron.md)。普通搜索只保留装配器生成的巡检引导，不主动创建任务；定时任务的确认、查重、创建和更新必须使用真实 Cron 控制态，不能用承诺代替。

## 完成条件

- A/B 普通搜索：`rfq_submit_delivery(action=submit)` 返回当前 run 的 `mode=enforce`、`completed=true`；装配器拥有并校验 receipt、manifest、direct answer，必要时还有完整报告。
- C-G：对应 reference 声明的成功/部分成功终态已交付；没有成功工具结果时不得补写详情。
- Hybrid/Cron：搜索与 Cron 分开表达；新 Hybrid 的搜索终态要求有效 assembly receipt，Hook 自动观察并同步原生 Cron 返回，模型不复制 token、不额外确认。
- `partial` 必须说明实际覆盖缺口；过程报错不能推导为市场或买家结论。
