---
name: skill-3-buyer-product
description: 买家与产品分析（模块 C + 模块 D）+ 通路 A 专属店铺经营对比。基于买家国活跃指数、询盘指数、分布份额和变化率分析主要市场，生成买家类型结构（批发商/零售商/品牌商/亚马逊卖家占比）、各国采购偏好差异、目标市场龙头品牌深度研究（品牌定位/核心竞争力/消费者评价/价格带/差异化机会）、子类目热度与蓝海机会、叶子类目深挖（价格带/MOQ/热销款式）。MCP 工具（buyer_profile/country_rank/js_share_of_voice/global_hot_selling/opportunity_discovery）+ web_search 组合。触发条件：Skill 2 完成后进入，或用户请求「买家分析」「竞品品牌」「热销产品」「蓝海机会」「深挖某子类目」时。
version: 1.0.2
---

# Skill 3 · 买家 & 产品分析

> 前置依赖：Skill 1 变量包 + Skill 2 输出的 MARKET_SUMMARY
> 职责：生成模块 C（买家市场深度分析）+ 模块 D（产品特征图谱）+ 通路A专属店铺经营对比
> 输出：C/D 模块报告内容 + TOP_BUYER_COUNTRIES（供 Skill 4 使用）

---

## 模块 C1 · 买家画像

### 目标输出字段

| 字段 | 说明 |
|------|------|
| 主要买家国活跃指数 & 分布份额 | Top5 买家市场的活跃指数、份额、排名与变化率；不得表述为买家人数 |
| 各国采购偏好差异 | 不同国家买家关注的产品属性差异 |
| 买家类型指数结构 | 批发商 / 零售商 / 品牌商 / 亚马逊卖家等标签的指数结构占比 |
| 高频搜索词 & 核心关注属性 | 买家最常搜索的词和最在意的产品属性 |
| L1+ 大买家特征画像 | 高价值买家的采购行为特征 |
| 询盘高峰窗口 | 结合季节性和节庆日历 |

### 通路 A · MCP 调用

#### 行业洞察指数口径（严格遵守）

`data_advisor_industry_crowd_insight`、`data_advisor_industry_buyer_profile`、`data_advisor_industry_country_rank` 和 `data_advisor_industry_cate_rank` 返回的 `idxValue` / `indxVal` / `abCnt` 属于平台标准化指数，用于比较活跃度、热度、份额、排名和变化趋势，**不是买家人数、访客人数或询盘条数**。

- `byrCountry.idxValue` → **买家活跃指数**；`proportion` → 买家国分布份额；`idxRate` → 指数变化率
- `fbCountry.idxValue` / `abCnt` → **询盘指数**；不得写成“询盘数/询盘买家数/询盘条数”
- `visitCountry.idxValue` → **访客活跃指数**；不得写成“访客人数”
- 买家身份、MOQ、RTS、定制等分组返回的 `indxVal` → **对应标签指数**；计算结构占比时，必须标注为“指数结构占比”
- 所有指数值不得添加“人、个、条、次”等绝对数量单位
- 只有工具字段说明明确为真实计数时才使用“数量”。本 Skill 中 `data_advisor_shop_summary` 的店铺 `uvCnt`、`fbCnt`、`sucOrdCnt` 等为店铺经营实值，保留访客数、询盘数、订单数表述，不受本指数规则影响

**Step C1-1：访客国家分布指数**
```bash
accio-mcp-cli call data_advisor_industry_buyer_profile --json '{"industryPortraitQueryParam": {"cateId": {{CATE_ID}}, "indexName": "visitor_country", "nd": "30d", "terminalType": "TOTAL"}}'
```

**Step C1-2：买家身份画像**
```bash
accio-mcp-cli call data_advisor_industry_buyer_profile --json '{"industryPortraitQueryParam": {"cateId": {{CATE_ID}}, "indexName": "buyers_identity", "nd": "30d", "terminalType": "TOTAL", "prodAction": "fb"}}'
```
提取：`amazonSeller`（亚马逊卖家标签指数）、`blueTag`（蓝标买家标签指数）、`customLeads`（定制偏好标签指数）、`rtsLeads`（RTS偏好标签指数）、`moq`（MOQ偏好指数分布）。如由各标签 `indxVal` 计算比例，统一标注为“标签指数结构占比”，不得表述为真实买家人数占比。

**Step C1-3：国家排行 + 询盘指数分布**
```bash
accio-mcp-cli call data_advisor_industry_country_rank --json '{"industryRankQueryParam": {"cateId": {{CATE_ID}}, "rankType": "1", "orderBy": "abCnt", "orderModel": "desc"}}'
```
提取：Top5 国家的 `countryId` / `abCnt`（询盘指数）/ `abCntYoy`（询盘指数同比）/ `supplyDemandRate`；不得把 `abCnt` 表述为询盘个数

**Step C1-4：买家渠道偏好**
```bash
accio-mcp-cli call data_advisor_industry_buyer_channel --json '{"industryPortraitQueryParam": {"cateId": {{CATE_ID}}, "indexName": "channel_total", "nd": "30d", "terminalType": "TOTAL", "prodAction": "fb"}}'
```

**Step C1-5：人群洞察（国家指数 + 搜索词）**
```bash
accio-mcp-cli call data_advisor_industry_crowd_insight --json '{"crowdInsightQueryParam": {"industryId": "{{CATE_ID}}", "nd": "30d", "terminalType": "TOTAL"}}'
```
提取：`fbCountry`（询盘国家指数分布）、`byrCountry`（买家国家活跃指数分布）、`visitCountry`（访客国家活跃指数分布）、`seKw`（搜索热度指数）、`purchVol`（采购量级指数）。输出时优先使用 `proportion`、排名和 `idxRate`，`idxValue`统一写为“指数”且不添加数量单位。

### 存储关键变量

```
TOP_BUYER_COUNTRIES = [国家代码列表，取 Top5，供 C2 和 Skill 4 使用]
```

### 通路 B · web_search

```
"[CATEGORY_INPUT]" major importing countries 2024 2025
"[CATEGORY_INPUT]" buyer profile B2B purchasing preference
"[CATEGORY_INPUT]" wholesale buyers market demand [行业专属来源]
"[CATEGORY_INPUT]" consumer preference trend [Top买家国] 2025 2026
"[CATEGORY_INPUT]" what buyers look for purchasing decision [Top买家国]
```

### 输出格式

> ⚠️ 买家国图表必须严格按以下结构输出（height 按实际条数 × 26px 计算，8条 = 220px）

**C1 买家国活跃指数分布图模板**

> ⚠️ 必须用 `widget` 代码围栏包裹输出，裸 HTML 在 Accio Work 桌面客户端不渲染。
> canvas id 使用 `chartCountry_[品类缩写]` 格式（如 `chartCountry_bt`），禁止无后缀通用 id；禁止 `<script src>` 直接引入。

````widget title="chart_country_SUFFIX"
<div style="padding:8px 16px 0 16px; position:relative; height:220px; margin-bottom:0;">
  <canvas id="chartCountry_SUFFIX"></canvas>
</div>
<script>
(function(){
  var cid='chartCountry_SUFFIX';
  var labels=[/* Top8 买家国名称，含国旗emoji */];
  var vals=[/* 对应买家活跃指数；不得添加“人”等数量单位 */];
  function render(){
    new Chart(document.getElementById(cid),{
      type:'bar',
      data:{
        labels:labels,
        datasets:[{label:'买家活跃指数',data:vals,
          backgroundColor:['#1E5070','#3E7096','#486F8C','#6F8854','#C56443','#75A7C9','#B0B3B8','#B0B3B8'],
          borderRadius:4}]
      },
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
        layout:{padding:{bottom:0}},
        plugins:{legend:{display:false},
          title:{display:true,text:'买家活跃指数',font:{size:11,weight:'500'}}},
        scales:{x:{title:{display:true,text:'买家活跃指数',font:{size:10}}}}
      }
    });
  }
  if(window.Chart){render();}
  else{var s=document.createElement('script');s.src='http[USER_HOME]@4.4.0/dist/chart.umd.min.js';s.onload=render;document.head.appendChild(s);}
})();
</script>
````

```markdown
## C1 · 买家画像

### 主要买家市场活跃指数分布
[输出上方买家国活跃指数横向条形图 widget]

| 国家 | 买家活跃指数 | 分布份额 | 指数变化率 | 询盘指数排名 | 机会评级 |
|------|-------------|---------|-----------|-------------|---------|
| [国家1] | XX | XX% | +XX% | Top X | ⭐⭐⭐ |
...

### 买家消费偏好深度解析

> ⚠️ 本节必须结合 MCP 买家身份数据 + web_search 消费者研究报告，描述「这类买家在意什么、怎么买、喜欢什么」，不能只输出数字比例。
>
> ⚠️ 所有行业洞察值按指数口径展示：使用“活跃指数/询盘指数/分布份额/指数变化率/排名”，禁止使用“买家X人、访客X人、询盘X个/条”等绝对数量表述。

**采购决策偏好**：
- 定制偏好指数占比 XX%，RTS偏好指数占比 XX%
  → [解读：从偏好指数结构看，买家更倾向于……对卖家的含义是……]
- 中等 MOQ 档位的偏好指数占比最高（XX%），是当前主流档位
  → [解读：应把中等MOQ作为主报价档，并同时设置低MOQ试单档和大货阶梯价]
  → [数据边界：若平台未返回各MOQ档位对应的具体件数，只说明档位偏好，不输出XX-XX件；只有工具明确返回件数边界时才展示具体范围]

**各主要市场消费偏好差异**（结合 web_search 补充）：
- 🇺🇸 美国买家：[偏好描述，如：注重耐候性和组装简便，偏好一站式套装，对价格敏感度中等，接受$XX-XX客单价]
- 🇩🇪 德国买家：[偏好描述，如：对认证要求严格，偏好工艺精细、材料可持续，愿意为品质溢价]
- [其他 Top 买家国]：[偏好描述]

**买家最关注的产品属性**（来自高频搜索词分析）：
1. [属性1]——[为什么买家在意这个]
2. [属性2]——[为什么买家在意这个]
3. [属性3]——[为什么买家在意这个]

**高价值买家（L1+）特征**：
- 高潜力下单标签指数结构占比 XX%，是最主要的转化来源
- 高回访标签指数结构占比 XX%，代表复购意向较强的稳定客群
- [描述这类买家的典型采购行为：采购频次、关注重点、谈判风格]

> 结构占比计算说明：若占比由多个 `indxVal` 相除得到，必须写成“标签指数结构占比”，不得简化为真实买家人数占比。

**询盘高峰窗口**：[结合 Skill 2 季节性数据描述]

---
> 💡 **C → D 关联提示**：以上买家偏好将直接体现在下一节热销产品分析中——
> 买家在意「[核心属性1]」→ 对应热销品的「[产品特征]」
> 买家在意「[核心属性2]」→ 对应热销品的「[产品特征]」
```

---

## 模块 C2 · 目标市场行业龙头品牌

> **定位**：消费者心智中的市场龙头，不是平台销量榜单。
> 核心价值：告诉商家「这些品牌凭什么赢」，提炼可学习的竞争力，在国际站上形成差异化。
> 按 TOP_BUYER_COUNTRIES 的 Top3 市场展开，每个市场 Top3-5 品牌。

### 数据获取

**全程 web_search**，不依赖 MCP，通路 A/B 均相同流程。

**Step C2-1：识别市场龙头品牌**

针对每个 TOP_BUYER_COUNTRIES 市场，执行以下搜索识别消费者心智中的龙头品牌：
```
best [CATEGORY_INPUT] brands [国家] 2025 2026 consumer favorite
top [CATEGORY_INPUT] brands [国家] market leader
[CATEGORY_INPUT] brand ranking [国家] popular trusted
```

> 优先参考：消费者评测网站（Consumer Reports / Wirecutter / Which?）、行业媒体（GQ / Forbes / Business Insider）、品牌榜单（如 Statista Brand Finance），而非亚马逊销量排名。

**Step C2-2：每个品牌深度研究**

对识别出的每个龙头品牌执行 web_search + web_fetch：
```
"[品牌名]" brand story mission positioning [CATEGORY_INPUT]
"[品牌名]" [CATEGORY_INPUT] why popular competitive advantage
"[品牌名]" consumer review what customers love 2025 2026
"[品牌名]" price range product line flagship
```

```
web_fetch("[品牌官网URL]") → 提取：品牌Slogan / 核心主张 / 产品系列 / 材质工艺 / 可持续承诺
```

### 目标输出字段（每个品牌）

| 字段 | 说明 |
|------|------|
| 品牌名称 & 官网 | 品牌全称 + 官网链接 |
| 市场定位 | 高端/中端/大众，面向哪类消费者 |
| 核心竞争力 | **这是重点**：3-4个维度深度拆解，说清楚品牌为什么能赢 |
| 消费者为什么选它 | 用消费者自己的语言描述，不是品牌自吹 |
| 主流价格带 | 入门款/主力款/旗舰款 |
| 销售渠道 | 亚马逊/独立站/线下等 |
| 商家可学习的点 | 从国际站经营角度，这个品牌的哪些做法值得借鉴 |
| 商家可差异化的点 | 这个品牌的哪些短板，是国际站卖家的机会 |

> ⚠️ **不输出商品图片**：C2 聚焦品牌竞争力分析，商品图已在 E 模块 C端热销信号中展示。

### 输出格式

```markdown
## C2 · 目标市场行业龙头品牌

### 🇺🇸 美国市场

---

#### [品牌名]
🌐 [官网URL]

**市场定位**：[一句话，如：北美中高端户外家具领导品牌，主力客群是35-55岁房屋拥有者]

**核心竞争力**：

1. **[竞争力维度1，如：品质口碑]**
   [具体描述：品牌在这个维度做了什么、为什么买家认可，引用消费者评价或权威来源]

2. **[竞争力维度2，如：产品设计]**
   [具体描述]

3. **[竞争力维度3，如：渠道布局]**
   [具体描述]

4. **[竞争力维度4，如：品牌信任]**
   [具体描述]

**消费者为什么选它**：
「[用消费者自己的语言，如：买这个牌子不用担心质量，用个5-6年没问题，值这个价」」
[来源：[评测网站/媒体]，[年份]]

**价格带**：入门 \$[XX] / 主力 \$[XX]-\$[XX] / 旗舰 \$[XX]+
**主要渠道**：[渠道列表]

**商家可学习的点**：
- [具体可借鉴的做法，直接转化为国际站操作建议]
- [如：它的产品描述始终强调「5年保修」，这在询盘回复中也是高频加分项]

**商家可差异化的点**：
- [该品牌的短板或空白，是国际站卖家的切入机会]
- [如：该品牌交货期6-8周，您若能做到4周是直接优势]

---

#### [品牌名2]
[同上结构]

---

### 🇩🇪 德国市场
[同上结构]

---

**跨市场共性洞察**：
- 各市场龙头品牌的共同竞争力来源：[2-3个共性]
- 国际站供应商的结构性机会：[龙头品牌普遍偏弱的维度，如：定制灵活度、交期、性价比]
```

### 输出格式

```markdown
## C2 · 目标市场行业龙头品牌

### 🇺🇸 美国市场

---

#### [品牌名1]
🌐 官网：[官网URL]

![品牌明星产品图](prod_main_img 或 web_search 图片URL)
*[产品名称] · \$[价格区间]*

**品牌定位**：[一句话描述，如：北美中高端户外家具领导品牌，主打耐候性与性价比平衡]

**核心卖点**：
- 🪵 **材质工艺**：[如：采用FSC认证柚木+铝合金框架，全系列防锈处理]
- 🎨 **设计语言**：[如：北欧极简风，哑光深灰/暖棕双色系，适配现代庭院]
- ⚙️ **功能特性**：[如：可调节靠背，模块化拼接，附防水坐垫套]
- 🌿 **可持续主张**：[如：再生铝材料占比40%，包装100%可回收]
- 🛠️ **服务承诺**：[如：5年结构保修，提供免费组装视频]

**明星产品**：[产品名] · 价格 \$[XX]-\$[XX]
- 近30天销量：[XX]件 ｜ 评分：[X.X]（[XX]条评价）
- 消费者高频好评：[轻量化、组装简单、颜色好看]
- 消费者高频差评：[坐垫偏薄、说明书不清晰]

**价格带分布**：
- 入门款：\$[XX]-\$[XX]（单件/小套装）
- 主力款：\$[XX]-\$[XX]（4-6件套，最畅销区间）
- 旗舰款：\$[XX]+（定制/高端材质系列）

**销售渠道**：[亚马逊（占比约XX%）/ 官网独立站 / Home Depot / Wayfair]

**对您的启示**：[该品牌哪些策略值得借鉴？哪些空白可以差异化？如：该品牌定制周期长（6-8周），您若能做到4周交期可形成竞争优势]

---

#### [品牌名2]
🌐 官网：[官网URL]
[同上结构]

---

### 🇩🇪 德国市场
[同上结构，按该市场龙头品牌展开]

---

### 🇬🇧 英国市场
[同上结构]

---

**跨市场洞察**：
- 各市场龙头品牌的共性：[2-3个共同特征]
- 中国供应商的机会缺口：[龙头品牌普遍较弱的维度，如交期、定制灵活度、性价比]
```

---

## 模块 D1 · 类目分布

> 结合 TOP_BUYER_COUNTRIES，分析各主要市场的子类目热度差异

### 目标输出字段

| 字段 | 说明 |
|------|------|
| 子类目热度排行 | 结合目标市场维度的子类目询盘指数排名 |
| 竞争密度 vs 需求指数 | 各子类目的供需比与需求指数对比 |
| 蓝海子类目标注 | 询盘指数增速快但供给相对不足的子类目 |
| 各市场热品示例 | 每个主要买家国的热卖商品图片和名称 |

### 通路 A · MCP 调用

**Step D1-1：子类目询盘指数榜**
```bash
accio-mcp-cli call data_advisor_industry_cate_rank --json '{"industryRankQueryParam": {"cateId": {{CATE_ID}}, "rankType": "1", "orderBy": "abCnt", "orderModel": "desc"}}'
```

`abCnt`按询盘指数解读，只用于热度排序和趋势比较，不得写成询盘数量。

**Step D1-2：子类目蓝海榜**
```bash
accio-mcp-cli call data_advisor_industry_cate_rank --json '{"industryRankQueryParam": {"cateId": {{CATE_ID}}, "rankType": "3", "orderBy": "supplyDemandRate", "orderModel": "asc"}}'
```
供需比最低 = 蓝海机会最大

**Step D1-3：各国热品（结合目标市场）**

对 TOP_BUYER_COUNTRIES 中每个国家调用：
```bash
accio-mcp-cli call data_advisor_industry_country_rank --json '{"industryRankQueryParam": {"cateId": {{CATE_ID}}, "rankType": "1", "orderBy": "abCnt", "orderModel": "desc"}}'
```
提取各国 `prodInfoList`（热卖商品名称 + 图片）

**Step D1-4：热门细分市场**
```bash
accio-mcp-cli call data_advisor_opportunity_discovery --json '{"sceneTermQueryParam": {"cateId": {{CATE_ID}}, "statCycle": "90d", "terminalType": "TOTAL", "currentPage": 1, "pageSize": 10}}'
```

### D1 必须执行的 web_search（补充产品描述维度）

> ⚠️ MCP 只返回子类目名称和数据，不含产品形态描述。**必须执行 web_search** 补充热销产品的外观/材质/功能特征。

```
best selling [CATEGORY_INPUT] [子类目名] amazon 2025 2026 features
[子类目名] [CATEGORY_INPUT] popular style material design trend
[CATEGORY_INPUT] [子类目名] what makes it sell well consumer review
```

### 输出格式

```markdown
## D · 热销产品分析

### D1 · 子类目热度与蓝海机会

[输出子类目增速横向条形图 widget，按增速排序，蓝海子类目用不同颜色标注]

| 子类目 | 询盘指数 | 指数同比增速 | 供需比 | 评级 |
|--------|----------|--------------|--------|------|
| [子类目1] | XX | +XX% | XX | 🟢蓝海 |
...

### 买家偏好 → 产品特征关联

> 承接 C1 买家偏好分析，解释「为什么这些产品卖得好」

**[子类目1] 热销逻辑**：
- 买家核心需求：[来自 C1 的买家偏好]
- 对应产品特征：[款式/材质/颜色/尺寸/功能描述]
- 典型热销品描述：[具体描述，如：铝合金框架+PE绳编沙发套装，哑光深灰色，配防水坐垫，整体重量轻、免维护，符合欧美买家「低维护户外生活」的偏好]
- 主流规格参考：[尺寸/套装件数/颜色选项]

**[子类目2] 热销逻辑**：
- 买家核心需求：[来自 C1 的买家偏好]
- 对应产品特征：[描述]
- 典型热销品描述：[具体描述]
- 主流规格参考：[描述]

**[重点蓝海子类目] 深度解析**：
- 为什么是蓝海：供需比 X.X，询盘指数增速 +XX%，需求活跃度在涨但供给相对不足
- 买家在找什么：[结合搜索词和买家偏好描述]
- 产品切入建议：[差异化方向，如：主打FSC认证材料，切入德国/英国高端买家]

### 各市场热品示例
- 🇺🇸 美国：[商品名+简短特征描述]
- 🇩🇪 德国：[商品名+简短特征描述]
- 🇬🇧 英国：[商品名+简短特征描述]

> 💡 **推荐深挖子类目**：「[供需比最低/询盘指数增速最快的子类目]」——询盘指数增速 +XX%，供需比 X.X。
> 是否展开详细分析（价格带、MOQ、热销款式）？
```

---

## 模块 D2 · 叶子类目深挖（按需触发）

> 触发条件：
> 1. D1 输出后 Agent 主动推荐子类目，用户确认
> 2. 用户主动指定具体子类目
> 3. Phase 6 收尾后用户说「深挖XX子类目」
>
> Agent 收到子类目信息后，先确认：「您是指「[子类目名]」这个方向吗？确认后我立即展开分析。」

### 目标输出字段

| 字段 | 说明 |
|------|------|
| 价格档位偏好 | 比较不同价格档位的热度指数；只有明确返回金额区间时才展示具体价格 |
| MOQ档位偏好 | 比较各MOQ档位的偏好指数；只有明确返回件数区间时才展示具体范围 |
| RTS vs 定制偏好 | 比较现货与定制的偏好指数占比，不等同于真实买家人数占比 |
| 热销款式/材质/规格分布 | 买家最喜欢的产品形态 |

### 通路 A · MCP 调用

**Step D2-1：价格带 & MOQ**
```bash
accio-mcp-cli call data_advisor_industry_crowd_insight --json '{"crowdInsightQueryParam": {"industryId": "{{SUB_CATE_ID}}", "nd": "30d", "terminalType": "TOTAL"}}'
```
提取：`rangAtm`（价格带指数分布）、`moq`（MOQ偏好指数分布）、`purchVol`（采购量级指数）。除非返回中另有明确的金额或件数区间字段，否则不得把这些 `idxValue` 直接写成成交金额、买家数或采购件数。

**Step D2-2：热门商品筛选**
```bash
accio-mcp-cli call data_advisor_product_selection --json '{"productSelectionParam": {"cateId": {{SUB_CATE_ID}}, "statisticsType": "30d", "orderBy": "ab_cnt", "order": "desc"}}'
```
按 `ab_cnt`（商品询盘指数）排序，提取热销品价格区间、特征描述；不得把 `ab_cnt` 写成商品询盘个数。

**Step D2-3：跨平台热销品特征**
```bash
accio-mcp-cli call global_hot_selling_products --json '{"query": "{{SUB_CATEGORY_INPUT}}", "platform": "amazon", "region": "{{TOP_BUYER_COUNTRIES[0]}}", "sorting_rule": "sales"}'
```

```bash
accio-mcp-cli call js_product_database_query --json '{"marketplace": "us", "include_keywords": "{{SUB_CATEGORY_INPUT}}", "min_reviews": 50, "sort_base": "revenue", "sort_order": "desc", "page_size": 20}'
```

### 输出格式

```markdown
## D2 · [子类目名称] 叶子类目深挖

**价格档位偏好**：
- [档位名称]的热度指数占比最高（XX%），是当前主力档位
- [档位名称]热度指数占比 XX%，代表[高端/入门]需求
- 若平台明确返回金额边界，补充具体价格区间：$XX - $XX；否则只展示档位名称和指数占比

**MOQ档位偏好**：
- [档位名称]的偏好指数占比最高（XX%），是当前主流MOQ档位
- [结合该档位给出试单、主报价或大货阶梯价策略]
- 若平台未返回档位对应的具体件数，明确写“暂无具体件数范围”，不自行换算

**RTS vs 定制偏好**：RTS偏好指数占比 XX% / 定制偏好指数占比 XX%
**热销产品特征**：[款式/材质/规格/功能的共性描述]
```

---

## 通路 A 专属 · 店铺经营对比（第二层加成）

> 仅在 ROUTE = A 时执行，作为第二层解读的专属补充模块
> 帮助商家定位「我在行业里处于什么水平」

### MCP 调用

> 本模块是指数规则的明确例外：`data_advisor_shop_summary` 返回的是当前店铺经营实值及同行对标值，因此 `uvCnt`、`fbCnt`、`sucOrdCnt` 等可分别表述为访客数、询盘数、成交订单数。

```bash
accio-mcp-cli call data_advisor_shop_summary --json '{"advisorQueryParam": {"statisticsType": "30d"}}'
```

提取：`totalImpsCnt`（曝光）/ `totalClkCnt`（点击）/ `uvCnt`（访客）/ `fbCnt`（询盘）/ `sucOrdCnt`（成交订单）/ `sucOrdAmt`（成交金额）

以及对应的 `RivalGood`（同行优秀）和 `RivalAvg`（同行平均）

### 输出格式

```markdown
## 📊 您的店铺 vs 行业对比（近30天）

| 指标 | 您的店铺 | 同行平均 | 同行优秀 | 差距 |
|------|----------|----------|----------|------|
| 曝光量 | XX | XX | XX | [↑↓] |
| 点击量 | XX | XX | XX | [↑↓] |
| 访客数 | XX | XX | XX | [↑↓] |
| 询盘数 | XX | XX | XX | [↑↓] |
| 成交订单 | XX | XX | XX | [↑↓] |
| 成交金额 | $XX | $XX | $XX | [↑↓] |

**综合评估**：[根据各指标与同行对比，给出1-2句综合判断]
**重点提升方向**：[差距最大的1-2个指标，结合后续报告给出方向提示]
```

---

## 输出：传递给 Skill 4 的变量

```
TOP_BUYER_COUNTRIES = [Top5国家代码列表]
TOP_SUBCATEGORIES   = [Top3蓝海/热门子类目名称]
BUYER_PROFILE = {
  "main_type": "批发商/零售商/品牌商",
  "amazon_seller_ratio": XX%,
  "custom_demand_ratio": XX%,
  "rts_demand_ratio": XX%,
  "moq_preference": [范围]
}
```
