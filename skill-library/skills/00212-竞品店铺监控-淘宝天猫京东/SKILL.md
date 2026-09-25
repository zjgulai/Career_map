---
name: store-monitor
displayName: 竞品店铺监控
displayDescription: 盯竞品淘宝/天猫/1688/京东店铺的上新与销量榜，输出商品清单与监控看板，并对比上一轮的新品与变价。
description: 当用户要监控竞品店铺的上新或销量榜时使用本 Skill，典型触发表达："监控这个店铺""看下竞品店铺上新了什么""盯一下这个店的销量榜""这家店最近有没有调价"。输入为一条店铺链接，支持淘宝/天猫、1688（普通旺铺与工厂店）、京东（任意店铺形态）；形态识别、URL 归一化与排序动线由本 Skill 自动完成。产出商品清单 CSV 与监控看板 HTML，并与上一轮做上新、下架与变价比对。只采集公开店铺页面，不登录店铺后台。
---

# 竞品店铺监控（淘宝/天猫/1688/京东）

本 Skill 只使用**买家账号**（`isMerchantBackendAccount == false`）。凡向用户输出“设置 - 账号管理”引导，必须先读取 `../references/buyer-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。不得改用商家账号教程 `../../discover-store-accounts/references/merchant-account-management.md`。

`<skillDir>` 定义：本 SKILL.md 所在目录的绝对路径，即
`<ecommerce-search 根>/store-monitor`；`<searchSkillDir>` 为 ecommerce-search 根目录。

## 执行流程总览

```text
① 采集口径前置确认（AskUser，最多一次）   ← 必须在账号发现与 URL 归一化之前
② 登录前置（可能再一次 AskUser）          ← 唯一的硬门禁，失败即停
③ 运行时目录（output_layout.py）
④ 生成 flow（gen_flow.py，打印 STORE_URL）
⑤ browser_rpa_launch（items[0].url = STORE_URL）
⑥ 后处理（store_postprocess.py）
⑦ 若 spa2 且拍到长图 → 价格截图兜底补齐价格 → --rebuild
⑧ 交付（finalize.js deliver）→ 再处理监控频率
```

参考文档按需读，不要一次全读；读哪份见文末「Resources」。

## 平台与形态矩阵

先按 URL 域名定平台，再按本表取参数口径：

| 平台 | 形态 | URL 特征 | 支持排序 | 翻页/加载更多 | 默认采集量 |
|---|---|---|---|---|---|
| 淘宝/天猫 | 经典分页 | `xxx.tmall.com/category.htm` | URL 参数 `orderType=newOn_desc`（上新）/ `hotsell_desc`（销量） | URL 参数 `pageNo=N`，每页约 96 条 | **第 1 页前 30 个** |
| 淘宝/天猫 | 下滑加载 | 同上（运行时自动识别） | 页内排序 tab，URL 参数不生效 | 无 pageNo，下滑加载，每批约 30 条 | **前 30 个** |
| 淘宝/天猫 | 新版下滑加载 spa2 | 同上（运行时自动识别，`cardContainer--<hash>` 卡片） | 页内排序 tab（`tags--<hash>`） | 无 pageNo，下滑加载，每批约 30 条 | **前 30 个**（价格不可解析，走截图兜底） |
| 淘宝/天猫 | 店内搜索结果 shopsearch | `xxx.tmall.com/search.htm`，或 category.htm 装修成四列大图（运行时自动识别，`div.item[data-id]` 卡片，左侧带「TOP 热销排行」侧栏） | URL 参数 `orderType`，同经典形态 | URL 参数 `pageNo=N` | **只取当前页**（价格明文可得） |
| 1688 | 普通旺铺 | `<子域>.1688.com/page/offerlist.htm` | **只有时间与销量**（页内点击） | `pageNum` 参数无效，**点击「下一页」**，登录态每页 30 条 | **只取首页** |
| 1688 | 工厂店 | `sale.1688.com/factory/<id>.html?memberId=b2b-xxx` | **只有销量** | 无分页器，滚动加载，每批约 20 条 | **前 20 品** |
| 京东 | 手机版店铺页 | 任意京东店铺链接（自动归一到 `shop.m.jd.com/shop/home?shopId=<id>`） | 上新（默认）/ 销量，**页内点击筛选栏** | 无分页器，下滑加载 | **前 30 品** |

> 默认采集量是**商品口径而非款口径**：**不合并同款**（合并等于凭空抹掉真实商品），
> 同款不同颜色是彼此独立商品，同款占多个名额属正常。

形态判定职责：**Agent 一律不预判形态，原样传 `--url`**。淘宝/天猫四种形态无法从
URL 区分（同一 category.htm 因装修而异），由 flow 运行时按卡片选择器逐级分支，
顺序 `classic → shopsearch → spa → spa2`，选择器互不重叠（`dl.item` /
`div.item[data-id]` 带容器作用域 / `a[data-item-id]` / `cardContainer--`）。
1688 两形态 URL 可判、京东只有一种可采形态，均由 converter 在生成期分流并归一。

**默认采集量由 converter 兜底**：不传 `--max-items` 时，工厂店 20 品、淘宝下滑形态
与京东 30 个（不退回框架默认的 60）。采集顺序即页面榜单顺序，后处理只去重与截断、**不重排**。

## 排序口径与不支持时的话术（硬规则）

默认口径：淘宝/天猫与 1688 普通旺铺默认**时间/新品倒序**（1688 即点一下「时间」）；
1688 工厂店只能**销量**。用户明确说销量才切销量口径。

用户提出这两种以外的排序（如价格、综合、评论数）时，**不要静默兜底成默认口径就采**，
先向用户说明可选范围再执行：

- 1688 普通旺铺：「1688 店铺监控目前只支持按**时间**或**销量**排序。默认按时间倒序（最新上新优先），需要的话我可以改按销量。」
- 1688 工厂店：「这是 1688 工厂店页面，它只提供**销量**排序（页面本身没有时间/上新排序），本次按销量采集。」
- 京东：「京东店铺监控目前支持按**上新**或**销量**排序。默认按上新（新品优先），需要的话我可以改按销量。」
- 不得把不支持的排序当作已支持汇报；converter 对非法排序会直接报错拦住（生成期）。

**京东不支持「价格」排序**：筛选栏的「价格」是升降序切换控件，无比对价值。
用户要按价格排序时如实说明，`store_url.py` 会在生成期报错拦住。

**京东「上新」= 筛选弹窗里的「新品优先」**，不是顶部 tab。flow 自动完成三步并断言。

**排序生效判定以 `jdSortEffective` 为准（上新与销量都校验）**：汇报榜单口径时
**只看 `jdSortEffective`，不看 `requestedOrder`**（后者只是入参回显）。

| `jdSortEffective` | 含义 | 汇报口径 |
|---|---|---|
| `new` | 上新排序已落地 | 上新榜 |
| `hotsell` | 销量排序已落地 | 销量榜 |
| `recommend` | **排序没点上**，实际采回推荐榜 | 必须说推荐榜，并说明所要排序未生效 |
| `null` | 未做该判定（非京东链路，或口径本就不是上新/销量） | 不得断言已生效 |

两种口径都遵循**「无生效证据即视为未生效」**：marker 全缺时也走纠偏，不得按入参口径落盘。
未生效时后处理自动纠正为 `recommend`，产物文件名、看板标题与历史分桶全部如实写
「推荐榜」并在 stderr 输出 WARN。**不得把推荐榜当上新榜或销量榜交付。**
两种口径各自的判定证据（含筛选栏锚点必须 `[last()]`）见
[references/jd-mobile-shop.md](references/jd-mobile-shop.md)。

**京东跨榜单不可混比（汇报时必须带）**：各榜单入榜规则独立，同一店铺同一天实测
综合 2408 件、新品 2379 件、销量 2540 件。历史基线按榜单分桶存储，
**不要把上新榜的数据拿去和销量榜比对**。

判断价格是否真的采到，看 stdout 的 `priceMissingCount`（见「stdout 结果契约」），
不要凭 CSV 目测。京东手机版正常情况下应为 0。

`--sort` 取值：时间倒序传 `new`（也接受 `时间`/`新品`/`上新`），销量传 `sales`（也接受 `销量`）。

## 销量与字段可得性（如实告知，不回避）

| 形态 | 售卖量 | 商品详情链接 | 商品ID |
|---|---|---|---|
| 淘宝经典分页 | 有（专用销量节点里是**裸数字**，如 `7`／`20`，无「已售」前缀） | 有 | 有 |
| 淘宝下滑加载 | 有（「N人付款」） | 有 | 有 |
| 淘宝新版下滑加载 spa2 | 有（「N人付款」，0 是新品真实值） | **无**（整卡 onclick，无 a[href]） | **无** |
| 1688 普通旺铺 | 有（「已售10万+件」） | **无**（卡片整卡 onclick 跳转，无 a[href]） | **无** |
| 1688 工厂店 | 有（「销N个」；标「1件起订」的未公开） | 有（detail.1688.com） | 有（offerId） |
| 京东手机版店铺页 | 有（「已售N件 / 已售N+ / 已售N万+」，未出单商品留空） | **有**（item.jd.com，按 SKU 重建） | **有**（真实 SKU，取自曝光锚点类名） |

**销量解析的两种模板**：
1. **带文案**：`已售N件`、`N人付款`、`已售N+件` —— 走文案正则；
2. **纯数字**：专用销量节点里只有 `7` / `20`，**没有任何前缀** —— 淘宝经典分页即此类。

分层口径必须守住：**专用销量节点**（选择器已锁定语义）允许裸数字直接采用；
**整卡 full_text** 只认带文案的格式，否则会把价格、折扣、库存数字误当销量。

**整列为空时先回看原始采集数据**：不要把「某列采不到」写成「平台不提供」并整列删除。
把采集缺陷固化成平台事实，真实存在的数据会被永久丢弃且不再有人复查。

**淘宝新版 spa2 形态的价格不可从 DOM 解析**（密文占位 + Shadow DOM 字形双层加密，
机制与已否证路径见 [references/taobao-spa2-price.md](references/taobao-spa2-price.md)），
一律走下文「价格截图兜底（硬契约）」链路。

**兜底交付口径（必须遵守）**：⚠️ 本段仅适用于**长图也拍不到价格**的情形。
本轮已捕获 `price_fallback_screenshots` 时一律先走截图兜底补齐价格，
**不得直接套用本段留空口径**。

确认长图确实无价格后，价格才留空并标 `price_unavailable`：CSV 价格列写「价格加密
无法读取」、价格状态列写「无法监控」（**绝不能写「持平」**，那等于断言价格没变）；
看板顶部渲染告知横幅，变化摘要条把涨跌卡替换为「价格加密无法监控」（输出 0 会被
误读成价格稳定）；快照 JSON 落 `price_monitoring_available: false` 与
`price_unavailable_count`。上新与掉榜、销量、「已降N元」降幅标签（单独成列，该形态
唯一可得的调价信号）仍正常交付。汇报时明确说「价格加密无法监控」，不要包装成采集
失败或暗示店铺没调价。**绝不能把「已降8.2元」当成售价 8.2 展示。**

1688 普通旺铺拉不到链接与 ID 是页面客观限制，后处理如实留空、看板标题不可点击；
跨轮次比对改用「标题+主图文件名」派生键，不伪造 offer URL，也不向用户承诺能给链接。

## 采集口径前置确认（AskUser，硬规则）

进入 `store_monitor` 后的**第一件事**，必须在账号发现、URL 归一化、flow 生成之前完成。

提前的原因：榜单口径与监控范围决定采到哪批商品，采完再改只能整轮重采，还会在历史库
留下一个无法与后续比对的脏轮次。所以不静默兜底，正常路径也要问清采上新还是销量、采多少个。

**只调用一次 AskUser**，最多三个问题：榜单口径、监控范围、监控频率。频率的选项与后续处理**一律引用 `<searchSkillDir>/references/monitor-cadence.md`**，本文不重写。

### 跳过规则（只问有多个合法取值的维度）

- 用户 query 里已经说清的维度不再问（如「盯一下这个店的销量榜」= 榜单口径已定，「每天看一次」= 频率已定）。
- **1688 工厂店**（URL 命中 `sale.1688.com/factory/`）页面只有销量排序，榜单口径只有一个合法值 → 不问，改在回复里一句话说明：「这是 1688 工厂店页面，只提供销量排序，本次按销量采集。」
- 三个维度全部已知时**不调 AskUser**，直接执行，不为了走流程凑一次弹窗。
- 用户取消或不作答：按各维度默认值执行（默认见下表），不停止任务——口径确认是优化项，不是采集前置门禁；登录前置才是门禁。

### 选项表（按平台形态取，默认项排第一）

| 平台 / 形态 | 榜单口径 | 监控范围 | 答复落到参数 |
|---|---|---|---|
| 淘宝/天猫 | 最新上新（默认）/ 销量榜 | 前 30 个（默认）/ 前 60 个 / 尽量采全 | 销量 → `--sort sales`；60 → `--max-items 60`；采全 → `--max-items 120 --store-prewarm-rounds 12` |
| 1688 普通旺铺 | 最新上新（默认）/ 销量榜 | 首页 30 个（默认）/ 前 3 页约 90 个 | `--sort new` / `--sort sales`；`--pages 1` / `--pages 3`（上限 10） |
| 1688 工厂店 | 不问，仅销量 | 前 20 品（默认）/ 前 60 品 | 固定 `--sort sales`；60 → `--max-items 60` |
| 京东 | 最新上新（默认）/ 销量榜 | 前 30 品（默认）/ 更多 | 销量 → `--sort sales`；更多 → `--max-items N`（上限 120，滚动轮数与主图预热自动跟随） |

硬约束：

- **不得把平台不支持的排序做成选项**：选项只能来自「平台与形态矩阵」和「排序口径」两节已声明的合法值；converter 对非法排序在生成期直接报错。
- **淘宝/天猫不得承诺精确条数**：形态运行时才判定，经典分页与店内搜索结果一次采当前整页、不受 `--max-items` 影响。话术用「目标约 N 个，实际以页面当页容量为准」。
- 「尽量采全」必须同时调大 `--store-prewarm-rounds`，只调 `--max-items` 会让第 30 位之后大片没图没价。
- 问范围时**不要把 `--pages` 说成条数**：1688 普通旺铺只能点「下一页」，页数越多越慢也越容易中断。

### 与登录前置的先后

```text
路由判定 store_monitor
  → 读本节，完成采集口径前置确认（可能一次 AskUser）
  → 登录前置（可能再一次 AskUser：多账号选择 / 无可用账号）
  → URL 归一化 → 生成 flow → launch → 后处理 → 交付
```

两次 AskUser 不合并：账号候选依赖 `discover_store_accounts` 返回，合并会把口径确认推迟到账号发现之后，失去提前的意义。

## 登录前置（硬规则）

完全按 `<searchSkillDir>/references/login-protocol.md` 执行，不得简化。平台参数按目标店铺域名选：

| 目标店铺 | 账号发现参数 | 采集平台参数 |
|---|---|---|
| 淘宝/天猫 | `platformIdList=["taobao", "tmall"]` | `--platform taobao`（两者共享登录态） |
| 1688（含工厂店） | `platformIdList=["1688"]` | `--platform 1688` |
| 京东 | `platformIdList=["jd"]` | `--platform jd` |

1. 按对应 `platformIdList` 调一次 `discover_store_accounts`，按协议固定分支选定一条
   可用前台账号记录，进入 `PROFILE_MODE`（淘宝/天猫遵循 `taobaoAvailable/tmallAvailable` 固定分支）。
2. 无可用账号时按协议「无可用账号处理」执行：停止业务流程，按该节的固定话术引导「设置 - 账号管理」（[点击前往账号管理](accio://settings/account-management)），附【登录帮助链接】，并填上该话术中必填的四步图文教程槽位。话术、链接 URL 和教程展示次数一律以 `../references/login-protocol.md` 为准，本文不重写。
3. 1688 登录态尤其关键：普通旺铺**未登录时不跳登录页**，而是就地把列表截断为 20 条
   并在页尾显示『更多商品登录后即可查看』（登录后为每页 30 条）。后处理会识别该文案并
   返回 `STORE_LOGIN_REQUIRED`；不得拿这 20 条不完整榜单当正常结果交付。
4. 执行期后处理返回 `STORE_LOGIN_REQUIRED`：按协议「执行期登录失效处理」停止、
   展示脱敏账号、引导重新登录并附【登录帮助链接】；不自动重试、
   不切账号。业务 Skill 不自行打开登录页。

## 运行时目录

`--platform` 与上表采集平台一致（淘宝/天猫传 `taobao`，1688 传 `1688`，京东传 `jd`）：

```
python3 "<searchSkillDir>/scripts/output_layout.py" --kind seed-product --platform <taobao|1688|jd> --run-dir "<workspace>" --task-label "store_monitor"
```

从 stdout 读取 `task_dir` / `seed_product_dir` / `rpa_dir`，后续步骤只使用这些返回值。
同一店铺重复监控时 `--workspace` 必须保持一致（历史数据仓按 workspace 归档，
换目录等于丢失基线、每轮都算首轮）。

## URL 组装规则

**归一化已下沉到代码**（`<searchSkillDir>/scripts/lib/common/store_url.py`）：
Agent **把用户给的原始链接原样传给 `--url` 即可**，converter 在生成期自动归一化，
gen_flow 会打印一行 `STORE_URL=<归一化后的URL>`。

> **`browser_rpa_launch.items[0].url` 必须用 `STORE_URL` 的值，不能用用户原始链接。**
> 后处理的 `--store-url` 同样传这个值。

商品详情页、店铺搜索页、平台门户（`item.taobao.com` / `detail.1688.com` /
`www.tmall.com` / `item.jd.com` 等）会被拒绝——它们不是店铺监控入口，
如实告知用户索取店铺链接。

各形态归一化规则、`--print-url` 单独核对方式见
[references/store-url-normalization.md](references/store-url-normalization.md)。

## 采集执行

### 1. 生成 flow

`--url` 一律传**用户给的原始链接**，归一化由 converter 完成；执行后从 stdout
读取 `STORE_URL=` 那一行，后续 launch 与后处理都用它。

淘宝/天猫（默认上新口径、只监控第 1 页；下滑形态默认前 30 个）：

```
python3 "<searchSkillDir>/scripts/gen_flow.py" --platform taobao --capability store-monitor --url "<用户给的店铺链接>" --out "<rpaDir>/taobao_store_monitor.flow.json" --workspace "<workspace>"
```

- 默认不传 `--sort`（框架归一为 comprehensive，flow 内按新品口径执行）；销量口径传 `--sort sales`。
- **默认不传 `--max-items`**：下滑形态自动按前 30 个（1 批）。用户明确说「多看点/前 60 个」
  才传（每批约 30 条，上限 300）。经典形态一次采当前整页，不受该参数影响。
- **预热滚动次数 `--store-prewarm-rounds`**：默认 4，仅影响淘宝/天猫下滑形态（SPA/spa2），
  **不影响经典分页、京东与 1688**；取值收敛在 1~15。默认已够采满前 30 个的主图，
  只有**尽量采全**时才调大（越深越慢）。示例（采全场景，调到 12 次）：
  ```
  python3 "<searchSkillDir>/scripts/gen_flow.py" --platform taobao --capability store-monitor --url "<用户给的店铺链接>" --max-items 120 --store-prewarm-rounds 12 --out "<rpaDir>/taobao_store_monitor.flow.json" --workspace "<workspace>"
  ```
- 用户要看第 N 页时，把页码带在他给的 URL 里（`pageNo=N`，仅经典形态生效）。

1688 普通旺铺（默认时间倒序、只取首页；`--pages` 控翻页数，上限 10）：

```
python3 "<searchSkillDir>/scripts/gen_flow.py" --platform 1688 --capability store-monitor --url "<用户给的店铺链接>" --sort new --pages 1 --out "<rpaDir>/1688_store_monitor.flow.json" --workspace "<workspace>"
```

1688 工厂店（只能销量、默认前 20 品）：

```
python3 "<searchSkillDir>/scripts/gen_flow.py" --platform 1688 --capability store-monitor --url "<工厂店链接含memberId>" --sort sales --out "<rpaDir>/1688_store_monitor.flow.json" --workspace "<workspace>"
```

京东（默认上新口径、前 30 品；`--sort sales` 切销量）：

```
python3 "<searchSkillDir>/scripts/gen_flow.py" --platform jd --capability store-monitor --url "<用户给的店铺链接>" --out "<rpaDir>/jd_store_monitor.flow.json" --workspace "<workspace>"
```

京东参数要点：

- `--url` 直接传用户给的任意形态店铺链接（PC 的 `mall.jd.com/index-<id>.html` 也行），
  converter 自动提取店铺ID并归一到手机版店铺页。
- 排序：默认上新（不传 `--sort`）；销量传 `--sort sales`。动线见
  [references/jd-mobile-shop.md](references/jd-mobile-shop.md)。
  **汇报榜单前必须读 stdout 的 `jdSortEffective`**；值为 `recommend` 表示排序没点上、
  实际采回推荐榜，不得当上新/销量榜交付。
- **京东没有翻页**：`store_url.py` 的京东分支**有意忽略 `--page`**（传了会打 WARN）。
  要看更靠后的位次请调大 `--max-items`。
- **默认不传 `--max-items`**：自动前 30 个商品。上限 120
  （`store_monitor.py::_JD_MAX_ITEMS_CAP`）；滚动轮数与主图预热张数随它自动折算
  （预热按 `max_items + _PREWARM_MARGIN` 留余量），上限内调大是安全的，代价是耗时线性增长。
- 提取不到店铺ID会在生成期报错，此时向用户要完整店铺链接，**不要自己拼造**。
- 同时要上新榜和销量榜时发**两次** launch（各自独立 flow 与后处理），
  不合并 `items[]`；两个榜单的历史基线是分桶存的，不可混比。

1688 参数要点：

- 普通旺铺用 `--pages`（翻页数），**不是** `--max-items`；用户说「看前 3 页/多翻几页」就传 `--pages 3`。
- 工厂店**默认不传 `--max-items`**（自动前 20 品）；用户明确要更多才传，按每批 20 条折算批数，
  `--pages` 对工厂店无意义。
- 排序传错会在生成期报错并告知可选范围，按上方「排序口径」话术转述给用户，不要改传其他值硬闯。
- 工厂店缺 `memberId` 会在生成期报错，此时向用户要完整链接，**不要自己拼造**。

### 2. browser_rpa_launch（PROFILE_MODE 唯一形态）

套用 login-protocol.md 的完整调用模板，`items[]` 只放一条：

```json
{
  "platformId": "<selected.platformId>",
  "storeId": "<selected.storeId>",
  "storeAccountId": "<selected.storeAccountId>",
  "platformName": "<selected.platformName>",
  "storeName": "<selected.name>",
  "account": "<selected.account>",
  "items": [
    {
      "url": "<gen_flow 打印的 STORE_URL>",
      "dslPath": "<rpaDir>/<taobao|1688|jd>_store_monitor.flow.json",
      "closeOnFinish": true
    }
  ],
  "closeBrowserOnFinish": true
}
```

`url` **必须**是上一步 `STORE_URL=` 的值，不是用户粘的原始链接（详见「URL 组装规则」）。
**flow 不含 goto，页面完全由这里的 item URL 打开**；两者不一致时浏览器停在店铺首页，
而 flow 在找商品列表页卡片，整轮采集空转。

一次调用只监控一个店铺、一个榜单口径；要同时看上新榜和销量榜就发两次
（各自独立 flow、独立后处理），不合并 `items[]`。

### 3. 后处理

读取返回体 `items[0].outputsPath`（禁止只凭返回体片段猜路径，截断时按
SKILL.md「并发编排」的反查规则取完整值）：

```
python3 "<skillDir>/scripts/store_postprocess.py" --outputs "<outputsPath>" --out-dir "<seedProductDir>" --workspace "<workspace>" --store-url "<gen_flow 打印的 STORE_URL>" --order <new|hotsell> --page-no <N> --run-id "<runId>"
```

`--order` 与本轮口径一致，`--page-no` 传本轮页码（默认 1，仅展示口径）。
**京东不要传 `--page-no`**：该形态无翻页语义，传了会被归并回第 1 页并打 WARN。
**后处理脚本五形态通用**，按 outputs 键自动识别平台与形态，无需传平台参数。
`--order` 到中文口径的映射：

| 本轮口径 | `--order` | 1688 对应排序 |
|---|---|---|
| 上新/时间倒序 | `new` | 普通旺铺「时间」（工厂店不适用） |
| 销量 | `hotsell` | 普通旺铺「销量」/ 工厂店唯一口径 |

注意：gen_flow 的 `--sort` 用 `new`/`sales`，后处理的 `--order` 用 `new`/`hotsell`，
两者不同名但一一对应（`sales` ↔ `hotsell`），不要互串。

**工厂店口径纠偏（自动）**：工厂店只有销量排序，误传 `--order new` 时后处理强制纠回
`hotsell` 并在 stderr 提示，避免混桶导致后续比对失真。stdout 的 `order` 是纠正后的
实际口径，`requestedOrder` 保留调用方原值。

**`--max-items` 默认不传**：后处理会按形态自动截断（工厂店 20 / 淘宝下滑 30；
旺铺与淘宝经典形态整页保留），与 flow 侧口径一致。只在用户明确要求更多/更少时才传。

## 价格截图兜底（硬契约）

**触发条件**：仅当监控店铺被识别为淘宝/天猫 spa2 形态（`cardContainer--<hash>` 卡片）且
价格探测失败（平台加密价格无法从 DOM 提取）时自动触发。flow 会在商品卡采集后额外截取
**1 张 fullPage 整页长图**，产物写入 outputs 的 `store.price_fallback_fullpage`，
并置 `store.price_probe_failed` 标志位。后处理把所有价格不可用商品标记
`price_source: "screenshot_pending"`，长图路径写入快照 JSON 的
`price_fallback_screenshots` 数组（**首位即长图**）。

**只要 `price_fallback_screenshots` 非空，价格就是必须交付项**，不允许以「加密无法
监控」收尾——长图既然拍到了，交付空价格看板就是链路未完成，不是客观限制。

**由主 Agent 自己读图，不要派发子智能体**：长图路径取自快照 JSON 的
`price_fallback_screenshots[0]`。长图动辄上万像素，整张丢给子智能体既慢又容易漏读，
返回的 `{title, price}` 还要再做标题相似度匹配，多一层错配风险。按下面的拼图切分法，
主 Agent 直接读窄行条图即可，顺序天然对齐、无需匹配标题。
**只取榜单前 30 个商品**，与该形态的默认采集量一致。

### 四步执行链

```bash
# 第 1 步：把长图切成带序号的价格拼图（确定性，无需人工调阈值）
python3 "<skillDir>/scripts/price_shot.py" sheet \
  --snapshot "<快照JSON绝对路径>" \
  --workspace "<用户工作区>"
```

成功返回 `PRICE_SHEET_READY` 与 `sheet` 路径（形如 `.../price_contact_sheet.png`）。

**第 2 步：Agent 只需 `read` 这一张拼图**：每格左侧渲染了 `01 / 02 / …` 序号、纵向排列，
逐行读出 `序号: 价格` 即可，**不要横向数价格块**。序号即榜单顺序，`apply` 按该顺序回填到
快照 JSON 中价格不可用的商品上。**切图与回填一律走 `price_shot.py`，禁止手工像素调参**，
更**不要自己按颜色阈值切**（切分判据与拼图机制见
[references/taobao-spa2-price.md](references/taobao-spa2-price.md)）。

```bash
# 第 3 步：校验并回填（把读到的价格写成 JSON 再交给闸门）
python3 "<skillDir>/scripts/price_shot.py" apply \
  --snapshot "<快照JSON绝对路径>" \
  --prices   "<价格JSON路径>"     # {"1":"136","2":"195",…} 或 ["136","195",…]
```

- 返回 `PRICE_BACKFILLED`（退出码 0）→ 价格已写入快照，继续第 4 步重建产物。
- 返回 `PRICE_BACKFILL_REJECTED`（退出码 2）→ **快照保持原状、零污染**，
  按 `issues` 明细重新读图核对；**严禁绕过闸门手工改快照放行**。

`apply` 只更新快照，交付产物（CSV / HTML 看板 / history.json）仍停留在旧数据，
**必须调用 `--rebuild` 完成闭环**。快照字段由 `apply` 自动维护（`price` /
`price_unavailable=false` / `price_source="screenshot_ocr"` / `price_backfill_guard`
校验留痕），未回填的商品保持原状，**无需手工编辑快照**。

```bash
# 第 4 步：一次性重建 CSV + HTML + history
python3 store_postprocess.py \
  --rebuild <已更新的快照JSON绝对路径> \
  --out-dir <产物目录> \
  --workspace <用户工作区> \
  --store-url <店铺URL>
```

该模式从快照读回已回填价格的 items，重新生成 CSV、重新渲染看板（价格列与趋势展示
真实数字），并更新 history.json 本轮的 `item_prices`（key 为 `_item_identity` 派生键，
即 dedupe_key 或 item_id），供下轮做价格变动比对。

### 处置路径（不得跳级）

| 情形 | 处置 |
|---|---|
| `sheet` 返回 `PRICE_SHEET_READY` | 读拼图 → `apply` 回填 → `--rebuild`（正常路径） |
| `sheet` 返回 `PRICE_STRIP_FAILED` | **不得就此收尾**：改为直接读 `fullpage` 整页长图，按榜单顺序读出 1..N 的价格，写成 `{序号: 价格}` 交 `apply`（闸门照常校验），再 `--rebuild` |
| `apply` 返回 `PRICE_BACKFILL_REJECTED` | 按 `issues` 明细重新读图核对后重试；**严禁手工改快照放行** |
| 长图本身也拍不到价格（页面确未渲染） | 此时才允许标记不可监控，并在汇报中说明长图已核查 |

后处理会在快照与 stdout 落 `price_backfill_status`：`pending` = 长图已拍到但价格未
补齐（**未完成，不得交付**），`fulfilled` = 已补齐。不要把 `pending` 当成「本形态就这样」。

> ⚠️ 不做任何 `full_text` 正则回填价格：spa2 卡片文本里 `¥` 后是加密占位串没有数字，
> 正则只会命中促销文案「已降N元」——那是**相对降幅**不是**绝对售价**，回填会污染
> history.json 价格基线并产出虚假变价结论。

## stdout 结果契约

成功时输出 JSON，必读字段：

| 字段 | 含义 |
|---|---|
| `ok` / `code` | `ok=true` 且 `code=STORE_MONITOR_COLLECTED` 才算成功 |
| `storeName` / `platform` / `host` | 店铺名、平台（淘宝/天猫/1688/京东）、店铺域名 |
| `shape` | `classic`（淘宝经典分页）/ `spa`（淘宝下滑加载）/ `spa2`（淘宝新版下滑加载，价格不可解析）/ `shop`（1688 普通旺铺）/ `factory`（1688 工厂店）/ `jdmshop`（京东手机版店铺页）；`jdsearch` 为已停用的京东旧链路，仅出现在历史快照里 |
| `itemCount` | 本轮在榜采集条数（已去重 + 已按形态截断） |
| `rawItemCount` | 去重后、截断前的原始条数（滚动常多带一批，与 itemCount 不等属正常） |
| `maxItemsEffective` | 本轮实际生效的截断上限（0 = 整页保留不截断） |
| `partialView` | **true = 本轮只看到店铺的一部分**（前 N 个 / 第一页）。此时消失的商品一律说「掉出榜单」，**不得说成「已下架」** |
| `order` / `requestedOrder` | 实际生效口径 / 调用方原始口径（工厂店会被强制纠为 `hotsell`；京东排序未落地会被纠为 `recommend`） |
| `jdSortEffective` | **京东专用，汇报榜单口径必读**：`new`=上新已落地 / `hotsell`=销量已落地 / `recommend`=排序没点上，实际是推荐榜 / `null`=非京东或证据不足。**不要用 `requestedOrder` 描述榜单**（那只是入参回显） |
| `jdSortProbe` | 京东销量口径的排序对照证据：`listChanged=false` 表示点击前后首屏顺序一致、排序可能未落地。**仅供诊断，不参与口径判定**，不得据此改写榜单结论 |
| `isFirstRun` | 是否首轮（首轮无基线，不产出新上新清单） |
| `newItemCount` | 本轮相对上一轮同榜单新增的商品数 |
| `priceMissingCount` | 价格**如实缺失**的条数（异步未回填，与淘宝 spa2 的「不可解析」是两回事）。京东链路 >0 时 stderr 另有 WARN；汇报时不得把留空的价格说成已采到 |
| `removedCount` / `removedVerdict` | 消失商品数 / 判定口径：`removed`=已下架，`dropped`=掉出榜单 |
| `outputs` | 交付文件绝对路径列表：CSV、看板 HTML、快照 JSON、历史 history.json |

**向用户汇报时的硬口径**：`removedVerdict=dropped`（或 `partialView=true`）时只能说
「掉出了监控范围的前 N 名」，并提示「可加大监控条数后复采确认是否真下架」。

失败码处置：

| code | 处置 |
|---|---|
| `STORE_LOGIN_REQUIRED`（退出码 2） | 停止业务流程，按 `../references/login-protocol.md`「执行期登录失效处理」回复用户（含图文教程槽位）。用户确认后原命令重跑 |
| `STORE_SHAPE_UNSUPPORTED` | 页面没命中预期形态：可能风控页、店铺改版，或 1688 工厂店 `memberId` / 京东店铺 `shopId` 已失效。先核对 outputs 里的 `final_url`；确认非登录/风控后如实告知用户该店铺暂不支持，不得伪造数据 |
| `STORE_ITEMS_EMPTY` | 一条商品都没采到（批次键缺失，或批次键在但解析出 0 条）。**这轮不会写 CSV / 看板 / history**，跨轮次基线未被污染，重试是安全的。重试一次仍空则如实报告；若该店上一轮采到过商品，持续为空更可能是选择器随平台改版失配，而不是店铺真没商品，此时应报告为采集异常而不是「该店无在榜商品」 |
| `STORE_OUTPUTS_READ_FAILED` | outputsPath 无效/不可读：按「并发编排」反查完整返回体后重试一次 |

## 交付产物

本轮产物（`<seedProductDir>` 内，中文语义化命名）：

```text
<店铺名>_<平台>_<上新榜|销量榜|推荐榜>_商品清单_<YYYYMMDD>.csv
<店铺名>_<平台>_<上新榜|销量榜|推荐榜>_店铺监控看板_<YYYYMMDD>.html
<店铺名>_<平台>_<上新榜|销量榜|推荐榜>_店铺监控快照_<YYYYMMDD>.json
```

CSV 列（顺序以 `store_postprocess.py::CSV_COLUMNS` 为唯一事实源，共 16 列）：
榜单位次、商品ID、商品标题、价格、销量、商品状态、价格状态、上一轮价格、价格变化、
变化幅度、累计涨跌、监控轮次、主图链接、详情链接、降幅标签、榜单标签。

**按形态裁列**：`_SHAPE_DROPPED_COLUMNS` 定义每个形态整列恒无值、因而不输出的列。
目前该表为空，各形态均输出全部 16 列（看板 8 列）；机制保留供日后确有恒空列时使用。
CSV 与看板共用这份定义，改动时不要只改一边。

> ⚠️ CSV 写行必须用**列名映射**再按表头取值，不要用位置数组。位置数组一旦与表头
> 顺序不一致就会让其后所有列整体错位（销量落进商品状态列、主图链接落进详情链接列），
> 且不报错、只能靠肉眼发现。

各形态的空列先核对是否为页面客观限制（详见「销量与字段可得性」节）：1688 普通旺铺与
淘宝 spa2 的「商品ID」「详情链接」确为恒空。

跨轮次的上新 / 下架 / 变价 / 趋势口径与看板信息架构见
[references/dashboard-and-history.md](references/dashboard-and-history.md)。

最终交付调 `node "<searchSkillDir>/common/finalize.js" deliver`（看板为 `main_html`、
CSV 为 `detail_table`、快照 JSON 走 `--transient`）。`--platform` 只接受六个枚举值
`淘宝|京东|1688|抖音|拼多多|多平台`：

- 1688 店铺（含工厂店）直接传 `--platform "1688"`（它本身就是合法枚举值）。
- 京东店铺传 `--platform "京东"`（枚举里是中文「京东」，不是 `jd`）。
- 天猫店铺一律传 `--platform "淘宝"`，**枚举里没有「天猫」**，传了会直接报 `--platform 非法: 天猫`。
- `--file` 角色只认 `main_html|detail_table|raw_data|detail_candidates`（或 `named:<中文标签>`），
  商品清单 CSV 用 `detail_table`（允许 `.csv`），没有 `data_csv` 这个角色。

`deliver` 成功之后，才处理「采集口径前置确认」里拿到的监控频率：按
`<searchSkillDir>/references/monitor-cadence.md` 决定是创建周期调度还是如实降级。
本轮采集失败、被风控拦截或没交付成功时不创建任何调度。

## Resources

| 文件 | 何时读 |
|---|---|
| [references/jd-mobile-shop.md](references/jd-mobile-shop.md) | 京东店铺采集原理、页面动线、排序生效证据、SKU 与款级归组、稳定选择器 |
| [references/taobao-spa2-price.md](references/taobao-spa2-price.md) | spa2 价格加密机制、已否证路径、拼图切分判据与三道闸门原理 |
| [references/store-url-normalization.md](references/store-url-normalization.md) | 各形态 URL 归一化规则、被拒入口、`--print-url` |
| [references/dashboard-and-history.md](references/dashboard-and-history.md) | 历史三份基线、身份键、下架两口径、趋势 sparkline、看板信息架构 |
| [references/platform-selectors.md](references/platform-selectors.md) | woff 解码、各形态选择器、滚动与懒加载预热实测结论 |
| `<searchSkillDir>/references/login-protocol.md` | 登录前置与执行期登录失效的完整协议与话术 |
| `../references/buyer-account-management.md` | 买家账号「设置 - 账号管理」四步图文教程 |
| `<searchSkillDir>/references/monitor-cadence.md` | 监控频率选项与周期调度处理 |
