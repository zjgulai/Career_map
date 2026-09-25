---
name: alibaba-competitor-analysis
version: "1.18.3"
description: |
  帮国际站卖家发现、筛选、分析并持续监控具体的竞争主体及其店内商品。竞争主体包括同行、竞品、竞争对手、标杆店铺、商家、店铺、贸易商、供应商、品牌、厂家、工厂、头部卖家。
  提供两个确定性 Workflow 工具：store_list 负责行业标杆店铺发现与冻结，输出店铺名单、公司名称与店铺链接；full_report 负责标准完整竞品报告。同时提供经营指标、订单指数 Top20 商品、店内商品自由排序与筛选、买家画像、首页与 Listing、事实 fragment 和定制 HTML 等原子能力，供复杂 Query 自由编排。
  适用于找同行与标杆商家；按 Top N、高 GMV、高成交额、高订单量、高询盘量、高访客量筛选同行商家或竞品店铺；输出同行竞品的商家名单、店铺名单、公司名称与店铺链接；指定店铺后分析店内商品排名、价格带、MOQ、商品结构与标题规律；指定商品 URL 的 Listing、卖点与效果分析；竞品店铺首页装修与经营表现逐店拆解；竞品店铺或商品定时监控。未指定平台时默认 Alibaba.com。
  范围判定：按用户要什么回来判断。要找同行竞品的商家或店铺、或要某个指定商品/店铺的分析，用本技能，用户只给品类词、没有点名店铺时同样适用；要类目下的商品榜用 alibaba-hot-product-insight；只要市场层面结论用 alibaba-market-analysis。
  不适用：只要商品热销榜、不要商家或店铺的请求；与同行竞品无关的店铺名单或链接需求；蓝海与供需错配查找；自有店铺经营诊断。
enabled: true

triggers:
  - 竞品分析
  - 竞品对标
  - 对标竞品
  - 标杆同行
  - 分析竞争对手
  - 学习标杆店铺
  - 竞品店铺装修
  - Listing 对标
  - competitor analysis
  - benchmark competitors
  - 定时监控竞品
  - 每天监控竞店
  - 每周监控竞店
  - 持续跟踪竞品
  - 竞品趋势面板
  - 找同行店铺
  - 找头部商家
  - 找头部卖家
  - Top商家
  - Top店铺
  - GMV高的店铺
  - 成交额高的商家
  - 订单量高的商家

examples:
  - 找 10 家蓝牙耳机行业标杆店，只要链接。
  - 做一份电动升降桌行业完整竞品分析报告。
  - 找 3 家男装标杆店，分析它们订单指数 Top20 商品的标题规律。
  - 比较这两个指定店铺的订单指数和买家国家分布。
  - 每周一上午 10 点监控这家竞店。
  - 帮我找专门做水泵的5家贸易商，GMV高的，把店铺链接发我。
  - 找出国际站国内百叶帘出海排名前五的品牌，并提供店铺链接。
  - 梳理国际站 Top 20 GMV 的女装店铺并生成文档。
  - 导出面部护理类目成交前10店铺链接，并分析主打产品和成交情况。

excludes:
  - skill: alibaba-blue-ocean-finder
    when: 用户要找蓝海、低竞争或供需错配类目。
  - skill: alibaba-market-analysis
    when: 用户只要行业规模、增速、趋势、国家或买家画像，且未要求同行竞品的商家/店铺名单、链接、排名或逐店分析。
  - skill: alibaba-hot-product-insight
    when: 用户要的是类目下的商品榜，不要商家或店铺，也不要某个指定商品或店铺的分析。
  - skill: alibaba-analysis-brief
    when: 用户只要自店经营诊断、流量或订单复盘。

workflow: |
  1. 先选路由：店铺或商品定时监控读 monitoring.md。
     其余请求路由前先做三要素判定，用户是否指定了：(1) 具体局部分析模块；(2) 定制口径、排序或列结构；(3) 复杂组合分析。
     - 三项全部未指定：泛化行业标杆完整报告，默认读 workflow-orchestrator.md 走 full_report。这与对象来源（品类发现或用户自带 URL）、选店数量、交付格式均无关。
     - 命中任意一项（指定局部模块、定制口径/排序/列结构、复杂组合）才读 flexible-analysis.md。
     - 仅需求表述模糊、但三要素均未指定时，按泛化处理走 full_report，不得因“看起来像定制”改走自由编排。
     任何路由若还需发现、筛选或交付店铺范围，先读 store-list.md。
  2. store_list 和未指定竞店的 direct full_report 使用同一选店子流程。已指定竞店 URL 的 full_report 跳过选店。只执行回执中的结构化 next_action；外部选店动作执行 tool_call、编辑指定 JSON，再原样执行 submit_action.command_args。
  3. 自由编排不调用 run-report；指定对象的局部或定制分析直接使用原子能力，缺少对象时消费 store_list 的公开 selection handoff。
  4. 只取满足用户问题的最小证据集合；需要定制报告或文件时，以业务标题作为真实文件名写 Markdown。除非用户明确说“只要 Markdown/不要 HTML”或指定其他单一格式，否则 Markdown 落盘不算完成：先在独立 Write 工具轮次写入绝对路径并等待成功回执，再在下一工具轮次用 render-report 生成并验证同名 HTML，最后一并交付两份真实文件；用户明确要求 XLSX 时，再按 flexible-analysis.md 从已核验数据生成同名数据表。严禁将写入与渲染放入同一批并行 tool calls。
  5. 未指定平台时默认 Alibaba.com；真实 Alibaba.com 店铺或商品 URL 可直接确定分析对象。失败、空结果或缺失数据必须如实披露。
---

# 竞品分析

主 Skill 负责理解需求和选择工具；Workflow 与原子命令的具体调用只从对应 reference 获取。任何 Bash 或命令枚举前先完成下表判断。

## 工具路由

| 用户请求 | 工具 | 能做什么 | 不做什么 |
|---|---|---|---|
| 每天、每周、定时或持续跟踪竞店/商品 | Standard Monitoring | 建立调度、维护快照、生成固定趋势面板 | 不生成一次性竞品报告 |
| 需要发现、筛选或交付店铺范围 | Workflow `store_list` | 默认/指定四榜子集选店，或按个性化条件灵活选店；冻结可交接的真实店铺 | 不取经营、商品、画像或页面深度数据 |
| 少数聚焦模块的分析未指定竞店 | `store_list` → 原子工具 | 先取得公开 selection handoff，再按问题取最小证据 | 不把 store_list 冒充分析结果 |
| 泛化要求标准完整报告；可未指定竞店，也可给出 1–5 个竞店 URL | Workflow `full_report` | 未指定时发现并选店；已指定时冻结 URL 并跳过选店；交付 MD、HTML、XLSX | 不承接定制分析 |
| 指定局部模块、指标、排序、定制口径/列结构，或需要复杂组合分析 | 原子工具 | 按需组合真实数据并直接回答或生成定制产物 | 不补齐无关模块 |

### 路由判定补充

- `full_report` 是固定标准套餐，不是比原子工具更强或更准确的通用引擎。用户没有定制要求、泛化请求完整报告时使用；1–5 个用户指定的竞店 URL 只替代选店，不改变该路由。
- 指定局部模块、指标、排序、定制口径/列结构，或复杂组合分析，默认使用 [flexible-analysis.md](references/flexible-analysis.md) 中的原子能力。
- 以下因素不作为 flexible 判定信号，出现时不得改走自由编排：选店数量（如“找3家”，是选店子流程共享参数，两条路径都支持）；交付格式（full_report 三件套已涵盖 MD/HTML/XLSX）；对象来源（品类发现或用户自带 URL 均可进 full_report）。
- 下列表述属于泛化完整报告意图，不构成“指定局部模块”：值得参考的、可以借鉴的、有什么亮点、学习一下、怎么样、对标看看、分析一下同行。只有明确点名维度（如“只看标题规律”“只比价格带”“只拆装修”）才算指定局部模块。
- 未命中泛化标准报告入口时，不得改走 `full_report` 掩盖原子能力的数据缺失。
- 新 Workflow 只允许 `benchmark` mode。`full_report` 可重复传 1–5 个 `--competitor-url` 直接冻结竞店；`store_list` 不接受该参数，商品 URL、本店 URL 和其他目标 URL 仍走原子编排。`store/product` 只是原子 `collect` mode，不是新 Workflow 路由。“找 N 家并只看标题规律”先 `store_list` 再取标题证据。

### 路由示例

| Query | 路由 |
|---|---|
| “做一份电动升降桌行业完整竞品分析报告” | `full_report` |
| “对这两家竞店做一份完整竞品分析报告：<URL1>、<URL2>” | 指定 URL `full_report`，跳过选店 |
| “找3家童装标杆店，分析有什么值得参考的” | `full_report`（三要素全未指定，“3家”与“值得参考”均非分流信号） |
| “帮我完整对标这两个店铺 URL” | `full_report`（自带 URL 但要的是标准全套模块） |
| “找三家三星以上包装标签店，分析销售 Top3 和人气 Top3，并监控这些店铺” | `store_list` → 原子商品能力 → Monitoring |
| “拆解 Top 3 标杆店的 Listing、关键词覆盖、卖点策略和定价区间” | `store_list` → 原子工具 |
| “只比较两家店的标题规律” | 原子工具 |

## 按需读取

| 已选工具 | 必读 reference |
|---|---|
| 需要发现/筛选/交付店铺，或未指定竞店的 `full_report` | [store-list.md](references/store-list.md)，完整读取后执行 |
| `full_report` 已冻结 selection，或已交付 `store_list` 后的跨轮完整报告 | [workflow-orchestrator.md](references/workflow-orchestrator.md) |
| Standard Monitoring | [monitoring.md](references/monitoring.md)，不要预读一次性分析流程 |
| 原子自由编排 | [flexible-analysis.md](references/flexible-analysis.md)，只加载问题需要的小节 |
| 读取公开 CLI 产物 | [data-schema.md](references/data-schema.md) 对应小节 |
| 解释价格带或计量单位 | [price-unit-registry.md](references/price-unit-registry.md) |

## 原子能力目录

- 冻结指定店铺身份并获取 domain 经营指标。
- 获取每店按起草订单指数降序的 Top20 商品证据。
- 获取近 30 天国家、买家身份、来源和店内搜索词画像。
- 采集指定商品 Listing，按确定的数字商品 ID 补充同一商品效果数据；需要时再按已确认店铺身份续采经营、Top20 商品、买家或店铺页面。
- 采集指定店铺首页、Products 和代表 Listing 页面证据；首页优先使用装修 MCP，CLI 自动按店回退浏览器。装修分析只读 `collect.analysis_entry.files` 中每店一份的 Markdown 小文件，不直接读取 MCP 原文、采集总 JSON 或 `report_facts.json`；视觉风格基于小文件中的图片实际判读，读图失败不阻断交付。
- 按 `report_fragment_index` 读取 Top 商品、画像、丰富度或经营指标小文件。
- 基于当前证据直接回答；需要定制报告或文件时以业务标题作为真实文件名写 Markdown，禁止默认命名为 `report.md`、`final_report.md` 或 `analysis.md`。除非用户明确说“只要 Markdown/不要 HTML”或指定其他单一格式，否则先单独 Write 绝对路径并等待成功回执，再在下一工具轮次用同一绝对路径执行 `render-report`；两步不得出现在同一批并行 tool calls，验证成功后交付同名 MD 和 HTML。用户明确要求 Excel、XLSX 或可下载数据表时，另用 `workctl workflow xlsx generate` 生成同名 XLSX。

原子能力没有固定执行顺序。只调用回答当前问题所需的最小集合；证据足够后停止。自由编排不调用 `run-report`；XLSX 是按需数据表，不冒充标准 `full_report` 三件套。

## 通用底线

1. 未指定平台时默认 Alibaba.com；真实 Alibaba.com 店铺或商品 URL 可直接确定分析对象。用户明确要求其他平台时，只使用当前可用的真实数据与页面工具。
2. 用户指定的 URL、店铺、商品、数量和指标不可被擅自替换或扩大；本店不冒充竞店。
3. 只使用当前任务的真实 CLI/MCP/页面证据，不手写 CLI-owned JSON，不复用其他任务 artifact。
4. `success=false`、超时、空结果、失败 coverage 或缺失文件都不能表达为已完成；对缺失维度写“本次未取得”并说明影响。
5. 缺失数据只按三级处理：目标字段可取则直接使用；不可取但当前证据有衡量同一业务对象/行为的语义相关近似字段时，可做近似分析，但必须明说“用 A 替代 B，仅供参考”；否则只能披露未取得。仅数量型、同处一页或名称相近不构成语义相关，禁止用在架商品数或价格带商品数冒充优爆品表现。
6. 页面跳转到平台首页、错误页、其他店铺或错误对象时，将本次采集标为失败，不得换店或改写已锁定对象。
7. `crtOrd` 对客写“起草订单指数”，不称真实订单或销量；其他非比率经营数值按平台指数表达，不自行计算转化率、客单价或金额，无可回溯基线时不输出确定性提升比例。
8. 只有行业发现结果可以使用 Top N 表达；用户指定的店铺或商品不得称 Top1、行业第一或销量第一。
9. 定制 Markdown/HTML 是自由编排产物，不称 Workflow 标准完整报告；只有 `full_report` 的真实 delivery receipt 可声明三件套完成。
10. 所有 Workflow、原子和动态数据命令都以文档中的裸 `workctl` 入口逐字执行；禁止套 `phoenix-plugin-python-run`、Python、Node 或其他 launcher/wrapper，也不得杜撰可执行路径。
