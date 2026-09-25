---
name: skill-2-market-overview
description: 市场大盘分析（模块 A + 模块 B）。生成全球市场规模、CAGR、产地分布、平台需求指数、供需比、星级分布、24个月询盘趋势、飙升子类目、行业宏观驱动因素、近期政策事件。通过 MCP 工具（market_detail/seller_portrait/market_trend/cate_rank/crowd_insight）与 web_search（Fortune Business Insights / Grand View Research / Mordor Intelligence 等权威来源）双源交叉验证，按 LIFECYCLE 输出新手/成长/稳定期三种解读视角。触发条件：Skill 1 完成后自动进入，或用户请求「看市场大盘」「行业规模」「行业增长趋势」时。
version: 1.0.0
---

# Skill 2 · 市场大盘分析

> 前置依赖：Skill 1 输出的上下文变量包（ROUTE / CATE_ID / CATEGORY_INPUT / INDUSTRY_TAGS / LIFECYCLE）
> 职责：生成模块 A（市场规模）+ 模块 B（市场动能）+ 第二层解读视角
> 输出：A/B 模块报告内容 + TOP_BUYER_COUNTRIES（供 Skill 3 使用）

---

## 执行前检查

读取 Skill 1 输出的变量：
- `ROUTE`：决定数据获取方式
- `CATE_ID`：MCP 调用的核心参数（`ROUTE = A` 且非 null 时使用）
- `CATEGORY_INPUT`：web_search 的搜索关键词基础
- `LIFECYCLE`：决定第二层解读视角

---

## 模块 A · 市场规模

### 目标输出字段

| 字段 | 说明 |
|------|------|
| 全球产值 & 平台交易额 | 该品类全球市场规模及国际站平台体量 |
| 主要供给国/产地分布 | 主要生产国及中国产地省市分布 |
| 头部集中度 CR10 | 前10卖家市场占有率估算 |
| 星级分布结构 | 国际站内1星/2星/3星+商家占比 |
| 行业进入门槛评估 | 资金/认证/供应链/技术壁垒综合评级（低/中/高） |

### 通路 A · MCP 调用

**Step A-1：获取行业大盘数据**
```bash
accio-mcp-cli call data_advisor_industry_market_detail --json '{"cateId": {{CATE_ID}}}'
```
提取：`abCnt`（需求指数）、`supplyDemandRate`（供需比）、`dAbRate`（转化率）、`abCntCrank`（需求排名）

**Step A-2：获取卖家竞争格局**
```bash
accio-mcp-cli call data_advisor_industry_seller_portrait --json '{"cateId": {{CATE_ID}}}'
```
提取：`star0~3CompCntRatio`（各星级商家占比）、`rtsProdCntRatio`（RTS占比）、`fb0~3CompCntRatio`（询盘量级分布）、`rcvd0~3CompCntRatio`（GMV量级分布）

**产地分布**：MCP 无此数据，**必须执行 web_search 补充**：
```
"[CATEGORY_INPUT]" 主产区 产地分布 中国 出口
[CATEGORY_INPUT] major producing countries export share
```

### 模块 A 必须执行的 web_search（通路 A/B 均强制执行）

> ⚠️ **全球产值、市场规模数据 MCP 不覆盖，必须通过 web_search 权威来源获取，不可省略。**

按以下顺序检索，至少命中 2 个独立来源：
```
"[CATEGORY_INPUT]" market size 2025 2026 billion USD industry report
"[CATEGORY_INPUT]" global market revenue CAGR forecast fortunebusinessinsights OR grandviewresearch OR mordorintelligence OR statista
"[CATEGORY_INPUT]" market share leading countries export 2025
```

数据校验：若两个来源数字差异 >20%，输出数值范围并注明来源差异；若仅有单一来源，标注 `⚠️ 该数据仅见于单一来源，建议核实`。

### 输出格式

```markdown
## A · 市场规模

### 全球市场概况
**全球市场规模**：[数据，如 $XX 十亿]（来源：XXX，YYYY年）
**预计增速 CAGR**：XX%（来源：XXX，预测至 XXXX 年）
**主要出口/生产国**：[Top3国家及占比]（来源：XXX）
**中国产地分布**：[主产省市]（来源：XXX）

### 国际站平台数据
**平台需求指数**：[数据]
**供需比**：[数据]（数值越高代表竞争越激烈）
**询盘转化率**：[数据]

### 卖家竞争格局
- 星级分布：0星 XX% / 1星 XX% / 2星 XX% / 3星+ XX%
- 询盘集中度：头部（100+询盘）XX% / 中部 XX% / 尾部 XX%
- RTS现货占比：XX% / 定制品：XX%

**行业进入门槛**：[低/中/高] — [说明核心壁垒来源]
```

---

## 模块 B · 市场动能

### 目标输出字段

| 字段 | 说明 |
|------|------|
| 近24个月增速趋势 | 需求指数月度变化曲线，识别拐点 |
| 买家搜索量变化 | 核心关键词搜索热度趋势 |
| 询盘量趋势 & 商机活跃度 | 询盘规模及同比变化 |
| 季节性淡旺季规律 | 识别高峰月份和低谷月份 |
| 细分子类目增速对比 | 哪些子类在加速，哪些在放缓 |
| 新入局卖家趋势 | 竞争加剧还是趋于稳定 |
| 近期重大事件/政策背景注释 | 影响当下数据的已发生事件 |

### 通路 A · MCP 调用

**Step B-1：24个月趋势数据**
```bash
accio-mcp-cli call data_advisor_industry_market_trend --json '{"cateId": {{CATE_ID}}}'
```
提取：逐月 `statDate` / `abCnt` / `abCntYoy` / `supplyDemandRate` / `dAbRate`
→ 识别：增速拐点、季节高峰月（abCnt 最高的连续2-3个月）、淡季月

**Step B-2：子类目飙升榜**
```bash
accio-mcp-cli call data_advisor_industry_cate_rank --json '{"industryRankQueryParam": {"cateId": {{CATE_ID}}, "rankType": "2", "orderBy": "abCntYoy", "orderModel": "desc"}}'
```
提取：增速最快的 Top5 子类目名称及增速

**Step B-3：搜索词及飙升词**
```bash
accio-mcp-cli call data_advisor_industry_crowd_insight --json '{"crowdInsightQueryParam": {"industryId": "{{CATE_ID}}", "nd": "30d", "terminalType": "TOTAL"}}'
```
提取：`seKw`（搜索词 Top10）、`seKwRate`（飙升词 Top10）

**近期重大事件 + 行业宏观趋势**：**必须执行 web_search 补充**：
```
"[CATEGORY_INPUT]" industry news 2025 2026 tariff policy demand
"[CATEGORY_INPUT]" market outlook 2026 trend analysis [行业专属来源]
[CATEGORY_INPUT] industry growth driver challenge 2025 site:fortunebusinessinsights.com OR site:grandviewresearch.com OR site:mordorintelligence.com
```

### 模块 B 必须执行的 web_search（通路 A/B 均强制执行）

> ⚠️ **B 模块不能只有 MCP 的平台数据，必须补充行业宏观趋势、驱动因素和风险因素，这些数据来自权威行业报告，MCP 不提供。**

```
"[CATEGORY_INPUT]" market growth drivers 2025 2026
"[CATEGORY_INPUT]" industry challenges risks supply chain
"[CATEGORY_INPUT]" consumer trend demand shift [目标市场国家]
```

### 输出格式

> ⚠️ **图表渲染规则（最高优先级，严格遵守）**：
>
> **所有图表必须用 `widget` 代码围栏输出，每张图一个围栏，不得直接在对话正文中嵌入裸 HTML。**
> 直接嵌入的 `<canvas>/<script>` 在 Accio Work 桌面客户端不会渲染，用户只能看到空白。
>
> 1. 每张图用独立的 ` ```widget title="snake_case_唯一id" ``` ` 围栏包裹
> 2. **canvas id 必须带品类后缀保证唯一**，格式：`chartStar_[品类缩写]`、`chartTrend_[品类缩写]`、`chartSub_[品类缩写]`，品类缩写示例：台球桌→`bt`，LED灯具→`led`，户外家具→`of`
> 3. 围栏内只放 HTML+JS，说明文字写在围栏外
> 4. Chart.js 用条件加载：`if(window.Chart){render();}else{动态插入script}`，**禁止** `<script src>` 直接引入
> 5. 所有脚本用 IIFE `(function(){...})()` 封装，防止变量污染
> 6. `maintainAspectRatio: false`，高度由外层 div 控制

**A 模块：卖家星级分布图（height:150px）**

> 以下为标准模板，实际输出时：将 `SUFFIX` 替换为品类缩写（如 `bt`），将数组填入真实数据

````widget title="chart_star_SUFFIX"
<div style="padding:8px 16px 0 16px; position:relative; height:150px; margin-bottom:0;">
  <canvas id="chartStar_SUFFIX"></canvas>
</div>
<script>
(function(){
  var cid='chartStar_SUFFIX';
  var d=[/* star0占比% */, /* star1占比% */, /* star2占比% */, /* star3占比% */];
  function render(){
    new Chart(document.getElementById(cid),{
      type:'bar',
      data:{labels:['0星','1星','2星','3星+'],
        datasets:[{label:'占比(%)',data:d,
          backgroundColor:['#B0B3B8','#75A7C9','#3E7096','#1E5070'],borderRadius:4}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
        layout:{padding:{bottom:0}},
        plugins:{legend:{display:false},title:{display:true,text:'卖家星级分布',font:{size:11,weight:'500'}}},
        scales:{x:{title:{display:true,text:'占比(%)',font:{size:10}},max:60}}}
    });
  }
  if(window.Chart){render();}
  else{var s=document.createElement('script');s.src='http[USER_HOME]@4.4.0/dist/chart.umd.min.js';s.onload=render;document.head.appendChild(s);}
})();
</script>
````

**B 模块：24个月询盘趋势图（height:260px）**

````widget title="chart_trend_SUFFIX"
<div style="padding:8px 16px 0 16px; position:relative; height:260px; margin-bottom:0;">
  <canvas id="chartTrend_SUFFIX"></canvas>
</div>
<script>
(function(){
  var cid='chartTrend_SUFFIX';
  var trendLabels=[/* 逐月 statDate，格式 'YY-MM' */];
  var trendData=[/* 逐月 abCnt */];
  var trendYoy=[/* 逐月 abCntYoy*100，保留1位小数 */];
  function render(){
    new Chart(document.getElementById(cid),{
      type:'bar',
      data:{labels:trendLabels,datasets:[
        {type:'line',label:'询盘量',data:trendData,borderColor:'#3E7096',
         backgroundColor:'rgba(62,112,150,0.08)',borderWidth:2,pointRadius:2,
         fill:true,yAxisID:'y',tension:0.3},
        {type:'bar',label:'同比增速(%)',data:trendYoy,
         backgroundColor:trendYoy.map(function(v){return v>=0?'rgba(111,136,84,0.5)':'rgba(197,100,67,0.45)';}),
         borderColor:trendYoy.map(function(v){return v>=0?'#6F8854':'#C56443';}),borderWidth:1,yAxisID:'y1'}
      ]},
      options:{responsive:true,maintainAspectRatio:false,layout:{padding:{bottom:0}},
        plugins:{legend:{position:'top',labels:{font:{size:11}}},
          title:{display:true,text:'24个月询盘趋势',font:{size:11,weight:'500'}}},
        scales:{
          x:{ticks:{font:{size:10},maxRotation:45}},
          y:{position:'left',title:{display:true,text:'询盘量',font:{size:10}}},
          y1:{position:'right',title:{display:true,text:'同比增速(%)',font:{size:10}},grid:{drawOnChartArea:false}}
        }
      }
    });
  }
  if(window.Chart){render();}
  else{var s=document.createElement('script');s.src='http[USER_HOME]@4.4.0/dist/chart.umd.min.js';s.onload=render;document.head.appendChild(s);}
})();
</script>
````

**B 模块：飙升子类目图（height = 条数 × 36px，最少 180px）**

````widget title="chart_subcate_SUFFIX"
<div style="padding:8px 16px 0 16px; position:relative; height:180px; margin-bottom:0;">
  <canvas id="chartSub_SUFFIX"></canvas>
</div>
<script>
(function(){
  var cid='chartSub_SUFFIX';
  var labels=[/* Top5子类目名 */];
  var vals=[/* 对应同比增速%，正负均可 */];
  function render(){
    new Chart(document.getElementById(cid),{
      type:'bar',
      data:{
        labels:labels,
        datasets:[{label:'同比增速(%)',data:vals,
          backgroundColor:vals.map(function(v){return v>=0?'#3E7096':'#C56443';}),borderRadius:4}]
      },
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
        layout:{padding:{bottom:0}},
        plugins:{legend:{display:false},title:{display:true,text:'飙升子类目增速',font:{size:11,weight:'500'}}},
        scales:{x:{title:{display:true,text:'同比增速(%)',font:{size:10}}}}
      }
    });
  }
  if(window.Chart){render();}
  else{var s=document.createElement('script');s.src='http[USER_HOME]@4.4.0/dist/chart.umd.min.js';s.onload=render;document.head.appendChild(s);}
})();
</script>
````

**文字输出**
```markdown
**旺季**：X月-X月（询盘量峰值 [数据]）
**淡季**：X月-X月（询盘量低谷 [数据]）
**近期同比**：[描述最近3个月的同比趋势]

### 行业宏观驱动因素
（来源：[权威来源名称]，[年份]）
- **增长驱动**：[2-3个核心驱动力]
- **行业挑战**：[1-2个主要挑战]

### 热门搜索词 & 飙升词
**热门词**：[Top5，反映稳定需求]
**飙升词**：[Top5，反映新兴需求方向]

### 近期市场背景
[近期重大政策、关税变化、行业事件，标注来源]
```

---

## 第二层 · 数据解读视角

根据 `LIFECYCLE` 切换解读角度，在 A/B 模块数据之后输出：

### 新手期（LIFECYCLE = 新手期）

> **行业评估结论**
>
> 基于以上数据，从新手视角解读：
> - **能做吗**：门槛评级 [低/中/高]，[1-2句说明理由]
> - **竞争烈不烈**：[引用供需比/星级分布数据]，[判断]
> - **正常值参考**：行业平均需求指数 [数据]，供需比 [数据]，进入该行业的新手通常需要 [X] 个月看到明显询盘
> - **推荐切入方向**：增速最快的子类目是 [子类目]，建议优先考虑

### 成长期（LIFECYCLE = 成长期）

> **行业定位分析**
>
> 基于以上数据，从成长期视角解读：
> - **行业增速判断**：目前行业处于 [加速增长/平稳/放缓] 阶段，[引用abCntYoy数据]
> - **竞争窗口**：供需比 [数据]，[判断目前是否仍有进入空间]
> - **值得押注的方向**：飙升词 [词1/词2] 反映买家需求正在向 [方向] 转移
> - **节奏参考**：行业旺季 [月份]，距离旺季还有 [X] 个月，当前是否需要提前备货

### 稳定期（LIFECYCLE = 稳定期）

> **战略态势判断**
>
> 基于以上数据，从稳定经营视角解读：
> - **行业动能**：整体增速 [数据]，与上一周期相比 [加快/放缓/持平]，[战略含义]
> - **竞争演变**：头部集中度趋势 [描述]，[是否进入存量博弈]
> - **机会信号**：飙升子类目 [列举]，是否与现有产品线相关
> - **风险预警**：[如有供需比恶化、增速持续下滑等信号，在此标注]

---

## 输出：传递给 Skill 3 的变量

```
TOP_BUYER_COUNTRIES = []   # 在 Skill 3 的 C1 模块执行后填充，此处预留
MARKET_SUMMARY = {
  "demand_index": [数值],
  "supply_demand_rate": [数值],
  "yoy_growth": [数值],
  "peak_months": ["X月", "X月"],
  "top_rising_subcates": ["子类目1", "子类目2"],
  "competition_level": "低/中/高"
}
```
