---
name: ecommerce-workflow-templates
version: 1.0.0
description: >
  跨境电商 MAS 工作流模板库 — 12 个可直接执行的编排模板。
  覆盖 4 大场景域（业务运营/组织管理/经营分析/增长洞察），
  每个模板含：触发条件→节点链路→核心节点定义→条件分支→跨工作流链接。
  基于 hermes-skills 的 335+ skill、171 个 installed skill 的编排层。
  模板可直接通过子代理（delegate_task）启动独立运行。适用场景还包括：一键执行、自动化流程、工作流编排、帮我跑个流程、从X到Y自动完成
source: https://github.com/zjgulai/hermes-skills (workflow layer)
---
# 跨境电商工作流模板库 🏗️

12 个可执行的编排模板，直接触发子代理运行。

## 架构层级

```
Skill Layer (171 individual skills)
  → Bridge Layer (voc-to-content-bridge, data-to-strategy-bridge)
    → Workflow Templates (this skill — 12 pre-built templates)
      → Executable Action (delegate_task with template + params)
```

## 模板目录

### 业务运营 (Business Operations) — 6 个

#### W01: 新品上市（德国市场）
```
触发: "我要上新品到德国"
节点链: viability → sourcing → compliance → pricing → listing → monitor
关键节点:
  1. cross-border-ecommerce — 德国市场需求+竞争评估
  2. 1688-sourcing-agent — 找供应商+报价
  3. cross-border-ecommerce — CE/EN71 认证合规检查
  4. competitor-price-analysis — 德国市场定价策略
  5. voc-to-content-bridge → 内容策略 → 上架文案
  6. ecommerce-data-analyst — 上线后效果监控
条件分支:
  viability > 70 → 继续 | < 70 → 换品类或修改产品
跨链: 监控到异常 → 自动转到 W02 竞品反击
一句话: "我要上新品到德国——评估市场可行性并生成完整上架方案"
```

#### W02: 竞品反击（ACoS飙升/评论被碾压）
```
触发: "S12 Pro 在 Amazon 被竞品压了"
节点链: customer-feedback-analysis → seo → listing → price → promo → quality-gate
关键节点:
  1. customer-feedback-analysis — 竞品评论拉取+分析
  2. competitor-price-analysis — 价格对比+策略建议
  3. data-to-strategy-bridge — 转成各部门行动清单
  4. voc-to-content-bridge — 生成竞品对比内容策略
条件分支:
  price_gap > 15% → 调价再出内容 | < 15% → 只出内容不调价
跨链: 内容策略 → voc-to-content-bridge → 出发 pipeline
一句话: "S12 Pro 在 Amazon 被 Elvie 超了，生成绩效反击方案"
```

#### W03: TikTok 内容生产→归因
```
触发: "本周 TikTok 内容排期"
节点链: hook-generator → script → compliance → distribution → calendar → roi
关键节点:
  1. tiktok-shop-cross-border — 平台内容策略+合规
  2. voc-to-content-bridge — 本周 VOC 信号转内容策略
  3. distribution → calendar → roi-attribution
条件分支:
  VOC 有 P0 告警 → 优先处理告警内容 | 无告警 → 按排期生成
一句话: "用本周 VOC 数据生成 TikTok 内容排期"
```

#### W04: 差评触发全链路修复
```
触发: "S12 Pro 收到一条关于安全问题的差评"
节点链: review-reply → clustering → pattern → root-cause → fix → quality-gate
关键节点:
  1. customer-feedback-analysis — 该差评+相关评论聚类分析
  2. data-to-strategy-bridge — 判断是个别事件还是系统性问题
  3. voc-to-content-bridge → 生成回应内容策略
条件分支:
  P0 安全告警 → 同时触发品牌回应+产品调查
  P1-P2 → 先回复后分析
  P3 → 回复并按正常流程处理
一句话: "S12 Pro 出现安全相关差评，启动全链路响应"
```

#### W05: 每日经营日报
```
触发: "今天日报出了吗"
节点链: csv-processor → daily-report → price-mon → promo-snapshot → monthly-preview
关键节点:
  1. ecommerce-data-analyst — 拉数据+分析
  2. data-to-strategy-bridge — 转行动清单
  3. 自动分发到团队频道
一句话: "今天日报——含异常标记和今日优先事项"
```

#### W06: 评论聚合周报
```
触发: "这周评论分析"
节点链: collect → cluster → score → signal → action
关键节点:
  1. customer-feedback-analysis — 全产品线评论聚合分析
  2. voc-to-content-bridge — 转内容策略
  3. 输出周报告含下周内容建议
一句话: "这周全产品线评论分析——含趋势和内容建议"
```

### 组织管理 (Organization) — 2 个

#### W07: 达人佣金结算对账
```
触发: "结算上个月达人佣金"
节点链: csv-processor → reconciliation → ultrawork → pua → quality-gate
关键节点:
  1. ecommerce-data-analyst — 导入结算数据+对账
  2. 异常标记 → 人工介入
一句话: "对上月达人结算数据，标记异常"
```

#### W08: 合规认证生命周期
```
触发: "检查快到期的认证"
节点链: calendar-scan → auto-fill / pua-escalate / emergency → label-update → traceability
关键节点:
  1. cross-border-ecommerce — 合规检查
  2. 自动续期或标记人工介入
一句话: "检查未来 90 天到期的认证"
```

### 经营分析 (Analytics) — 2 个

#### W09: 月度→季度策略
```
触发: "做 Q2 策略复盘"
节点链: monthly-review → full-view → quarterly-str → team-orchestration
关键节点:
  1. ecommerce-data-analyst — 月度/季度数据
  2. data-to-strategy-bridge — 综合产出策略报告
一句话: "做上季度复盘和下季度规划"
```

#### W10: 库存断货预警→应急
```
触发: "M5 库存告急"
节点链: inventory-scan → sku-diagnosis → logistics → supplier → pua-force
关键节点:
  1. ecommerce-data-analyst — 库存数据分析
  2. 供应商/物流方案推荐
一句话: "M5 库存预警——评估断货风险和应对方案"
```

### 增长洞察 (Growth) — 2 个

#### W11: 跨域组合（VOC→内容→分发→归因）
```
触发: "从上周 VOC 到本周内容到分发到效果归因，全链路跑一遍"
节点链: 
  Phase 1: customer-feedback-analysis → 全产品线 VOC 分析
  Phase 2: voc-to-content-bridge → 转内容策略
  Phase 3: content pipeline → 生成视频+文案
  Phase 4: 分发到各平台
  Phase 5: ecommerce-data-analyst → 归因分析内容效果
条件分支:
  Phase 1 有 P0 告警 → 跳过排期直接触发品牌回应
  Phase 5 ROI 下降 → 自动调整下周 content strategy
一句话: "全链路跑一次——从 VOC 到内容到分发再到归因"
```

#### W12: 大促备战（库存+定价+内容+合规→人力的自动编排）
```
触发: "准备黑五/双11"
节点链: 
  1. inventory-scan — 库存评估
  2. competitor-price-analysis — 大促定价策略
  3. cross-border-ecommerce — 合规检查
  4. voc-to-content-bridge — 大促内容策略
  5. data-to-strategy-bridge — 综合产出大促备战清单
一句话: "黑五大促备战——库存+定价+内容+合规全链路检查"
```

## 执行方式

所有模板通过 `delegate_task` 启动，模板本身是编排指令：
```python
# 启动模板 W01 示例
delegate_task(
    goal="执行新品上市德国市场工作流 (W01)",
    context=f"产品: {product_name}, SKU: {sku}, 目标市场: 德国",
    toolsets=["terminal", "file", "search", "web"]
)
```

子代理加载对应 skills 自动执行完整链路。

## 跨工作流链接

```
W01 (新品上市异常) → W02 (竞品反击)
W04 (差评修复的产品改进) → W01 (新品上市的品类评估)
W03 (TikTok内容达人数据) → W07 (达人结算)
W09 (月度策略的广告调整) → W02 (竞品反击的ACoS监控)
W10 (库存告警) → W11 (内容策略调整)
W11 (全链路归因) → W09 (下一期策略输入)
```

## 后续推荐改良方向

1. **模板执行追踪** — 当前模板触发后无法追踪执行进度，后续需支持 exec_status: queued|running|completed|failed 状态管理
2. **条件分支自定义配置** — 当前条件分支逻辑（如 viability > 70 / price_gap > 15%）硬编码在模板中，后续需支持用户自定义阈值
3. **跨模板依赖检测** — W01→W02 等跨链依赖需要验证"上游模板是否已完成"，防止空数据传递
4. **模板版本管理** — 同一模板不同版本（如 W01 v1 适合德国 vs W01 v2 适合美国）需要版本区分
5. **预执行检查清单** — 每个模板执行前应检查所需 skills 是否可用、依赖数据是否就位
6. **模板组合模式** — 支持用户自定义链式调用（如 W01 + W04 + W10 组合为"新品上市含差评预案和库存预警"）

## 一句话调用

> "执行 W11 全链路——从上周 VOC 到新一周内容排期到分发归因"

## Usage

> "启动 W01 新品上市：有机棉婴儿睡袋, 目标德国"
> "执行 W04：S12 Pro 收到安全相关差评 ASIN: B0XXXX"
> "黑五还有 3 个月，启动 W12 准备"
> "全链路 W11——数据用上周做好的 VOC 报告"
