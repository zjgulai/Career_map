---
name: 国际站原子数据查询
version: "1.0.1"
description: |
  查询少量 Alibaba.com 店铺只读事实。仅适用于明确指标、范围和对象的短查询；广告、复杂分析、报告、建议、写操作和其他业务域使用原有 Skill。
enabled: true
---

# 国际站原子数据查询

这是短只读执行路径，不依赖 Hook 对用户原文做正则分类。主 Agent 只有在紧凑路由索引中确认本请求完全满足下列边界时才选择本 Skill。

## 选择一个执行契约

| 用户目标 | 读取的唯一 reference |
|---|---|
| 少量店铺汇总指标 | [references/store-summary.md](references/store-summary.md) |
| 最新完整日的商品指标排行 | [references/store-product.md](references/store-product.md) |
| 店铺渠道访客、询盘或 TM 人数 | [references/store-channel.md](references/store-channel.md) |

只能读取一个 reference。广告事实查询直接选择 `alibaba-ads-marketing-analysis`；店铺与广告联查属于跨业务域请求，按紧凑路由索引拆分。若用户目标不能唯一落入一行，或者要求完整分析、归因、诊断、建议、报告、文件、写操作、跨业务域调查，停止本路径并回到紧凑路由索引选择原有 Skill；不要用本 Skill 吞掉复杂请求。

## 共同约束

1. 正常路径只用 reference 点名的 workctl 命令；不查 schema、不从根级 help 逐层探索、不列全量 Skills。
2. 相对时间只用 reference 指定的日期命令，绝对时间直接传入；不调用 `get_time`。
3. 只返回用户点名的事实和必要口径。允许确定性计算，但不追加诊断、建议、报告、未点名维度或后续查询邀请。
4. 不生成交付文件、不派 SubAgent；首个业务调用直接用 `--jq`/`--fields` 投影。
5. 数据为空也是结果；说明真实查询范围和接口截止日，不自行扩窗、换数据源或概括成固定 `T+N`。
6. 正常路径最多执行 2 次 workctl（一次日期、一次业务）。只有具体业务命令明确返回不存在、未知参数或必填参数变化时，才允许对该完整命令执行一次 `--help` 并重试该业务命令一次；异常路径最多执行 4 次 workctl，仍失败就披露错误并停止。
7. 选择 reference 后禁止读取其他 Skill/reference，禁止换业务命令、换数据源或扩大查询范围；最后一次业务命令成功或达到失败上限后，下一条消息必须直接回答且工具调用数为 0。
8. 当前 workctl 交给内置 `--jq` 的响应形状按命令区分：`data-advisor-shop-summary`、`data-advisor-shop-channel` 的业务数组在 `.data`，`data-advisor-shop-product` 的业务数组在 `.data.data`。严格使用所选 reference 的投影，不把一个命令的 envelope 层级推广到其他命令。
