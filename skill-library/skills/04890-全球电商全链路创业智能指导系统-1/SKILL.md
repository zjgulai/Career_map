---
name: global-ecommerce-intelligence
description: 全球电商全链路创业智能指导系统。覆盖电商选品、平台合规、定价、利润、跨境物流税务、评价分析、竞品监控、Listing优化、PPC广告、库存管理、税费试算与价格监控。当对话涉及跨境电商创业、选品打分、平台规则/违禁词、定价与利润测算、跨境出海方案、评价情感分析、竞品盯价、Listing/PPC/库存优化、税费合规、新手入门指导、TikTok内容电商等任一主题时使用。集成19个可执行工具（本地计算、离线可用；实时汇率/税率为联网增强），含用户分层引导（画像识别/进度记忆/下一步推荐）、合规价格核实（来源标注/异动预警/记录导出，不做自动抓取）、类官方事实核实（关税/费率/市场规模注册表+在线抽验）与AI搜索就绪度评分，配反幻觉标注、专家团决策框架、数据与SOP时效巡检、全球多语言适配。任何阶段可自由进入，不强制全流程。
metadata:
  version: 1.0.7
---

# 全球电商全链路创业智能指导系统 1.0.7

全球电商平台 · 全品类 · 智能全链路 · 反幻觉 · 专家团决策框架 · SOP 时效巡检 · 多语言适配

---

## 一、首次触发加载（必做 3 步）

本 Skill 首次触发时，按以下顺序加载，否则视为输出不完整：

1. **加载引擎协议**（4 份，顺序固定）：
   - `references/engine/anti-hallucination.md`：数据来源/日期/置信度标注规范
   - `references/engine/execution-protocol.md`：三级降级、脚本调用与转达规范
   - `references/engine/expert-panel.md`：专家团合议机制与合规一票否决
   - `references/engine/evolution-protocol.md`：数据与 SOP 时效巡检机制
2. **检测运行环境**：`node references/scripts/env-check.mjs --json`（退出码 0 全链路可用；1 为 Python 相关工具降级到知识模式；2 为纯知识模式）
3. **确认入口**：根据用户意图选择下方能力入口，用 `node references/scripts/knowledge-filter.mjs --entry <入口> --json` 精准加载知识（单次 ≤5 份）。

---

## 二、能力入口

入口与触发词如下。各入口的加载文件清单以 `knowledge-filter --entry <入口>` 为准（单一数据源，不在此重复维护）；工具推荐可用 `router --intent <意图>` 自动路由。

| 入口 | 触发词 | 说明 |
|------|--------|------|
| 新手入门 `beginner` | "新手" / "第一次开店" | 入门路径、开店流程、平台选择 |
| 智能选品 `selection` | "帮我分析XX品类" / "选品" | 品类机会、竞品扫描、BSR 销量估算、量化评分 |
| 平台合规 `compliance` | "XX平台规则" / "违禁词" | 平台规则、违禁词/认证/侵权风险、隐私合规 |
| 定价分析 `pricing` | "帮我定价" / "价格带" | 定价策略、价格弹性、竞品价格带 |
| 利润计算 `profit` | "计算利润" / "能赚多少" | 全链路成本、盈亏平衡、52 周预测、多币种 |
| 跨境指导 `cross-border` | "卖到XX国" / "跨境" | 物流、税务、支付、认证、本地化 |
| 评价分析 `review` | "分析评价" / "评价情感" | 好评/差评关键词、情感评分、痛点挖掘 |
| 竞品监控 `monitor` | "监控竞品价格" / "盯价" | 价格快照、异动预警、价格战应对 |
| 市场趋势 `trends` | "分析XX市场趋势" | 全球电商趋势、市场数据 |
| Listing优化 `listing` | "优化标题" / "Listing" | 标题/五点/主图/A+、质量评分、AI搜索就绪度 |
| TikTok内容电商 `tiktok` | "TikTok" / "抖音" / "直播带货" | 内容电商运营、达人矩阵、直播转化 |
| PPC广告 `ppc` | "ACOS高" / "广告优化" | 指标诊断、账户结构、预算分配 |
| 库存管理 `inventory` | "补货" / "断货" / "库存" | 安全库存、补货量、断货与冗余处理 |

> 首次使用：展示上表供用户选择入口；用户可随时说"下次不用了"跳过引导。

---

## 三、核心工作流

### 三级降级
- **L1 工具可用**：正常执行脚本，如实转达结果与置信度。
- **L2 工具不可用**：降级到知识模式，用 references 方法论手动分析，明示"未实际运算"。
- **L3 知识不足**：明示"无法精确计算"，给出框架性建议。

> 详细调用规则见 `references/engine/execution-protocol.md`。

### 数据诚实
- 所有量化数据标注来源、日期、置信度；估算明示为估算，不包装成精确值。
- 实时数据（汇率/竞品价/BSR）需联网获取或标注为内置快照；离线自动降级。
- 高风险场景（赚多少/月销多少/税率/情感）按反幻觉协议强制自检。

> 完整规范见 `references/engine/anti-hallucination.md`。

### 用户引导与合规价格核实
- 首次或画像未知时用 `node references/scripts/guidance.mjs --detect <表述>` 判定 新手/进阶/成熟，引导深度自适应；用户可随时跳过。
- 偏好（平台/国家/品类）与进行中的 SOP 步骤用 `--set` / `--save-progress` 本地记忆，支持"接着上次继续"；`--reset` 可清空。
- 核实某产品实时价：从平台官方渠道取数，用 `price-monitor.mjs --source <official|self-observed|manual>` 记录观测价与来源；**系统不做自动抓取**（违反平台服务条款），非官方观测价输出时标注"非实时价"。
- 数据可信度分级（实时/半实时/定期核实/估算）见 `references/engine/anti-hallucination.md` 数据源清单。

### 专家团与合规否决
- 6 位角色化专家（老选/合规/算账/跨境/评价/监价）构成决策框架，重大决策走 3 轮合议。
- 合规拥有一票否决权；涉大额资金/法律/税务时建议对接真实专业人士复核。
- 触发场景：选品最终推荐、上架合规终审、调价 ≥10%、首次出海、广告预算 ≥ 月毛利 20%、补货 ≥60 天销量。

> 完整机制见 `references/engine/expert-panel.md`。

### 时效巡检
- 含时效元数据的数据型 reference 与 SOP（12 份）用 `sop-timeliness-check.mjs` 扫描（ok/due-soon/overdue/missing-meta/malformed-date）；数据型文件由脚本按元数据自动发现，不写死数量。
- 过期数据引用前标注"需验证"并核实；更新机制见 `references/engine/evolution-protocol.md`。

---

## 四、资源索引

### 引擎协议（references/engine/）
| 文件 | 说明 |
|------|------|
| `anti-hallucination.md` | 数据时效分级、置信度标注、诚实度声明 |
| `execution-protocol.md` | 三级降级、19 脚本调用与转达规范、自动触发 |
| `expert-panel.md` | 6 专家合议、否决权、分歧裁决 |
| `evolution-protocol.md` | 自进化触发、知识更新规则、时效巡检机制 |

### 知识库（references/，18 份）
| 文件 | 说明 |
|------|------|
| `beginner-guide.md` | 新手入门路径与开店准备 |
| `product-selection.md` | 智能选品与量化评分 |
| `product-categories.md` | 全球产品全品类分类 |
| `platform-rules.md` | 全球平台合规规则 |
| `pricing-analysis.md` | 定价策略与价格分析 |
| `cross-border-guide.md` | 跨境物流/税务/支付/认证 |
| `us-sales-tax.md` | 美国各州销售税参考 |
| `gdpr-ccpa.md` | 欧盟/加州数据隐私合规速查 |
| `world-ecommerce.md` | 全球电商平台与市场数据 |
| `review-sentiment.md` | 评价情感分析（中英词库） |
| `daily-price-monitor.md` | 每日竞品价格监控框架 |
| `2026-ecommerce-trends.md` | 2026 电商趋势分析 |
| `tiktok-shop-playbook.md` | TikTok Shop 内容电商运营手册 |
| `language-guide.md` | 多语言自动检测与切换（60 语言） |
| `listing-optimization.md` | Listing 优化指南 |
| `agent-readiness.md` | AI 搜索/Agent 推荐就绪度优化 |
| `ppc-advertising.md` | PPC 广告管理 |
| `inventory-management.md` | 库存管理 |

### SOP 标准作业流程（references/sop/，12 份）
| 文件 | 主题 |
|------|------|
| `SOP-01-first-time-setup.md` | 新手开店入驻全流程 |
| `SOP-02-product-selection.md` | 选品评分全流程 |
| `SOP-03-pricing.md` | 定价调价流程 |
| `SOP-04-compliance-review.md` | 合规审查流程 |
| `SOP-05-cross-border.md` | 跨境出海全流程 |
| `SOP-06-review-improvement.md` | 评价分析与产品改进闭环 |
| `SOP-07-competitor-monitoring.md` | 竞品监控与价格战应对 |
| `SOP-08-ppc-diagnosis.md` | PPC 投放诊断与优化 |
| `SOP-09-inventory.md` | 库存与补货管理 |
| `SOP-10-listing-optimization.md` | Listing 优化流程 |
| `SOP-11-tax-compliance.md` | 跨境税费与合规核算 |
| `SOP-12-price-monitoring.md` | 竞品价格监控与调价决策 |

### 脚本（references/scripts/，19 个）
| 脚本 | 语言 | 用途 |
|------|:---:|------|
| `env-check.mjs` | Node | 环境验证（`--audit` 冒烟门禁） |
| `fetch-rates.mjs` | Node | 实时汇率抓取（多源并行 + 本地缓存） |
| `profit_calculator.py` | Python | 利润计算（实时汇率、盈亏平衡、52 周预测） |
| `bsr_analyzer.py` | Python | BSR 销量估算（经验模型） |
| `sentiment_analyzer.py` | Python | 评价情感分析（否定处理） |
| `price-elasticity.mjs` | Node | 价格弹性计算 |
| `knowledge-filter.mjs` | Node | 知识加载过滤与全文检索（`--entry`/`--search`/`--list`） |
| `sop-timeliness-check.mjs` | Node | 数据 + SOP 时效巡检（`--refresh-next` 写回） |
| `competitor-checklist.mjs` | Node | 竞品与 Listing 质量检查清单 |
| `compliance-scan.mjs` | Node | 文案合规扫描（规则库单源 `compliance-rules.json`） |
| `listing-scorer.mjs` | Node | Listing 质量评分（0-100，含人工确认项） |
| `price-monitor.mjs` | Node | 合规价格核实（来源标注/异动预警/记录导出） |
| `tax_calculator.py` | Python | 跨境税费试算（VAT/美国销售税/关税/规费） |
| `inventory_calculator.py` | Python | 库存补货计算（安全库存/补货量/DOS） |
| `router.mjs` | Node | 意图路由（入口与工具推荐） |
| `orchestrator.mjs` | Node | 工具链编排执行（环境门禁 + 链式运行） |
| `guidance.mjs` | Node | 用户分层引导（画像识别/偏好进度记忆/下一步推荐） |
| `fact-check.mjs` | Node | 类官方事实核实（注册表 `--list` / 在线抽验 `--online`） |
| `agent-readiness.mjs` | Node | Listing 的 AI 搜索/Agent 推荐就绪度评分 |

> 全部脚本统一支持 `--version`；JSON 输出含 `ok/tool/version/schema/generatedAt` 元字段；调用示例见 `references/engine/execution-protocol.md`。

---

## 五、全球电商平台覆盖

| 区域 | 国家/地区 | 电商平台 |
|------|----------|----------|
| 中国 | 中国大陆 | 淘宝、天猫、京东、拼多多、抖音电商、快手电商、小红书电商、唯品会、苏宁、国美 |
| | 中国香港 | HKTVmall、Price.com.hk |
| | 中国台湾 | PChome、momo购物、Shopee TW |
| 全托管/社交 | — | Temu、SHEIN、TikTok Shop、AliExpress、速卖通 |
| 北美洲 | 美国 | Amazon US、eBay、Walmart、Etsy、Shopify、Target、Best Buy、Costco |
| | 加拿大 | Amazon CA、Shopify、Canadian Tire、Walmart CA |
| | 墨西哥 | Mercado Libre MX、Amazon MX、Coppel |
| 欧洲 | 英国 | Amazon UK、eBay UK、ASOS、John Lewis、Argos |
| | 德国 | Amazon DE、Otto、Zalando、eBay DE |
| | 法国 | Amazon FR、Cdiscount、Fnac、Veepee |
| | 意大利 | Amazon IT、eBay IT、Zalando IT |
| | 西班牙 | Amazon ES、El Corte Inglés、Zalando ES |
| | 荷兰 | Bol.com、Amazon NL |
| | 瑞典/北欧 | Amazon SE、CDON、Zalando |
| | 东欧 | Allegro(波兰)、Ozon(RU)、Wildberries(RU) |
| 东南亚 | 新加坡 | Shopee SG、Lazada SG、Amazon SG |
| | 马来西亚 | Shopee MY、Lazada MY |
| | 泰国 | Shopee TH、Lazada TH |
| | 越南 | Shopee VN、Lazada VN、Tiki |
| | 印度尼西亚 | Shopee ID、Tokopedia、Lazada ID |
| | 菲律宾 | Shopee PH、Lazada PH |
| 南亚 | 印度 | Amazon IN、Flipkart、Meesho、Myntra |
| | 巴基斯坦 | Daraz PK |
| | 孟加拉国 | Daraz BD |
| | 斯里兰卡 | Daraz LK |
| 拉丁美洲 | 巴西 | Mercado Libre BR、Shopee BR、Magazine Luiza |
| | 阿根廷 | Mercado Libre AR |
| | 智利 | Mercado Libre CL |
| | 哥伦比亚 | Mercado Libre CO |
| | 秘鲁 | Mercado Libre PE |
| 中东 | 阿联酋 | Amazon AE、Noon |
| | 沙特阿拉伯 | Noon SA、Amazon SA |
| | 以色列 | AZRIELI、Yad2 |
| | 土耳其 | Trendyol、Hepsiburada |
| 非洲 | 尼日利亚 | Jumia NG、Konga |
| | 肯尼亚 | Jumia KE、Kilimall |
| | 南非 | Takealot、Superbalist |
| | 埃及 | Jumia EG |
| | 摩洛哥 | Jumia MA |
| | 加纳 | Jumia GH |
| 大洋洲 | 澳大利亚 | Amazon AU、eBay AU、Catch.com.au、Kogan |
| | 新西兰 | Trade Me、Amazon NZ |
| 日本/韩国 | 日本 | Rakuten、Amazon JP、Yahoo Shopping、Mercari |
| | 韩国 | Coupang、Gmarket、Auction、11Street |

> 各平台深度数据（规则/佣金/费率）以 references/ 对应文件为准，引用时标注"需验证"。

---

## 六、数据诚实声明

以下数据为内置静态估算/参考值，引用时必须明示，不得呈现为精确事实：

- 汇率表：内置快照（2026-09-02），可用 `fetch-rates.mjs` 或 `--fx-live` 获取实时值
- BSR-销量系数：经验估算，未经真实数据校准，置信度低
- 情感评分：关键词匹配，非 AI 语义分析
- 税率/市场规模/平台规则：政策或第三方估算快照，需按核实周期复核

---

## 七、版本日志

### v1.0.7 (2026-09-03) — 当前版本
- **能力合流**：新增 2 个执行工具——类官方事实核实（fact-check，事实注册表 + 在线抽验 + 缓存闭环，区分可机器比对与需人工比对项）与 AI 搜索就绪度评分（agent-readiness，结构化数据/内容可机读性打分）
- **知识扩充**：新增 3 份知识文件——新手入门指南、TikTok Shop 内容电商运营手册、AI 搜索/Agent 推荐就绪度指南；知识入口从 11 个扩展到 13 个（新增 新手入门/TikTok内容电商），意图路由与关键词同步扩展
- **缺陷修复**：修复中文情感分析虚词插入漏检（如"用了一次就坏"此前无法命中负面词）；修复合规扫描重叠命中夸大（"全网最低价"此前重复计数 4 次，现区间合并去重）；修复英文商标词无词边界误报（shelves 误命中 lv、small 误命中 mall）
- **事实校准（全部经多源交叉核实，核实日期 2026-09-03）**：美国 de minimis $800 免税额已暂停（EO 14324/14388），全部货值须正式报关并计 MPF（FY2026：0.3464%，$33.58–$651.50）与 HMF；欧盟 €150 关税免税额已废除（Reg. (EU) 2026/382），≤€150 包裹按 EUR 3/件 征收过渡性关税至 2028-07-01；英国 £135 低值免税确认将取消；TikTok Shop 2025 GMV 校准为约 $64.3B（Momentum Works 口径 +94%）；税费计算器全面重写（美国 MFN+Section 301 分层、规费、欧盟新规、金额 Decimal 半进位）
- **工程加固**：env-check 冒烟门禁覆盖全部 19 个脚本；汇率/事实抓取增加重试与备用源降级；退出码契约按脚本语义精确文档化；类官方事实核实器对“需人工比对”事实项（源站为前端渲染或启用 WAF 反爬、静态抓取无法稳定获取时）正确降级为“待人工核实”并如实标注，而非误报抓取失败
- **逐行代码审计修复**：税费试算器修正 6 处（未收录州代码报错信息误导、零税州税率 0.0 被误判未收录、金额格式化大数科学计数法、非欧盟目的地与欧盟超 €150 时 --tariff-lines 静默忽略、Section 301 大范围豁免未提示）；利润计算器修正 4 处（注入汇率缺基准币种键导致崩溃、52 周预测往返运算浮点精度损失、净利润恰为 0 误报“为负”、--version 实现不一致）；库存计算器修正负 lead-time 崩溃与负值静默算错；统一 19 个脚本 --version 输出（补 fact-check/agent-readiness 缺失项）与未知参数显式拒绝（此前 12 个脚本静默忽略）；补齐 agent-readiness 统一输出契约字段；listing-scorer 违禁词一票否决与合规扫描口径对齐（补齐平台红线/促销价格两类规则，匹配引擎改为大小写不敏感 + ASCII 词边界，消除“Best Seller”大小写漏报与子串误报）；汇率抓取合理性区间仅在基准 CNY 时启用（修复非 CNY 基准误报）；清理未使用导入与死代码
- **文档一致性修复**：统一专家团角色名（“合规 checker”中英混搭改为“合规官”、“产品分析师”统一为“选品分析师”、消除 SOP-09 引用不存在的“库存”专家、SOP-08 消除隐性“第 5 条”序号引用）；对齐全球电商规模口径（world-ecommerce $6.8T/+9% 修正为 $6.88T/+7.2%，与事实注册表一致）；UFLPA 实体清单家数改为“月度更新”诚实标注（不再写死易过期数字）；美国销售税表补税费试算工具覆盖范围说明（全量 51 州参考 vs 工具收录 27 个高频州）

### v1.0.6 (2026-09-02)
- **引导引擎**：新增用户分层引导（画像识别/进度与偏好本地记忆/节奏控制），接入价格核实等分支
- **价格核实**：竞品价格监控升级为合规核实路径（观测来源标注/价格合理性校验/观测记录导出）；明确不做自动抓取并声明合规边界
- **数据源清单**：反幻觉引擎新增统一数据源清单（实时/半实时/定期核实/估算四档），实时能力边界一目了然
- **规则单源化**：合规违禁词规则库独立为数据文件，文档与扫描工具共用单一数据源
- **汇率引擎固化**：缓存损坏自愈与快照落盘健壮性
- **质量统一**：错误输出/退出码/参数校验模式统一，并完成全量回归验证
- **攻击验证修复**：全库逐行审计——清理脚本与文档的 emoji 残留；统一 JSON 错误输出通道与退出码语义；合规违禁词规则实现单源化（listing-scorer 改为读取规则库）；删除死代码、不可达分支与虚假承诺文案；补齐利润计算负数校验与价格监控参数校验；修复中文商品名存储键值碰撞；修正引擎文档脚本清单与数据位置
- **质量复审修复**：再次逐行复审——6 个重复市场估算函数重构为数据驱动模型映射；文本/JSON 输出通道差异化（消除无效 --json 分支）；编排器补齐引导引擎注册并统一 Python 解释器探测；数值参数解析严格化；退出码与错误输出语义对齐执行协议；清理易过期注释与开发痕迹措辞
- **结构重组**：脚本目录并入 references/scripts/，顶层仅保留 SKILL.md + references 的标准 Skill 结构；同步修正脚本路径定位与全部文档调用示例
### v1.0.5 (2026-09-02)
- **结构与标准**：SKILL.md 重组为最标准 Skill 结构（name/description/version + 渐进披露）；清理全部开发产物与残留（部署工具、开发文档、测试残留等不再入包）；知识库/SOP 版本与时效元数据统一刷新至 2026-09-02
- **缺陷修复**：修复利润计算汇率方向颠倒与 argparse 崩溃；汇率抓取改为多源并行 + 本地缓存 + 合理性校验
- **工具扩展**：新增 7 个执行工具——合规扫描（违禁词）、Listing 质量评分、竞品价格监控、税费试算、库存补货计算、意图路由、工具链编排；全部脚本统一 `--version` 与输出元字段；env-check 增加 `--audit` 冒烟门禁
- **合规增强**：修正评价操纵表述、测评表述限定为平台官方合规方式、领土表述规范化、跟卖灰区提示改为合规评估前置；新增 GDPR/CCPA 数据隐私合规模块
- **流程新增**：新增 SOP-11 跨境税费核算、SOP-12 竞品价格监控
- **一致性**：评分口径、情感词库、BSR 边界、工具清单与入口单源化，消除文档-代码双源
- **验证修复**：利润试算的初始投入按币种换算后参与回本计算、补齐输入范围校验；工具编排的环境门禁判定修正；BSR 排名参数补齐 `--version` 支持；英文评价词库改为大小写不敏感；美国销售税缺州提示明确化；专家 ID 与 SOP 角色引用统一；数据快照与核实日期口径对齐

### v1.0.4 (2026-08-23)
实时汇率能力（多源抓取 + 失败降级快照）、评价否定短语处理、多市场 BSR 参数化模型、数据文件时效自动发现、平台规范适配。

### v1.0.3 (2026-08-11)
精简运行时、消除死代码、数字与版本统一、专家团诚实声明（角色化决策框架）。

### v1.0.2 (2026-08-04)
新增反幻觉层与 4 个执行工具、时效管理机制、Listing/PPC/库存知识模块。

### v1.0.1 / v1.0.0
选品/合规/定价/利润/评价/竞品监控等核心模块与平台覆盖首发。
