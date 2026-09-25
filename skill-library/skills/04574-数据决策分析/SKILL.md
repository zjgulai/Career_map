---
name: 数据决策分析
version: 1.0.0
description: Data-driven decision analysis for product requirements — multi-dimensional analysis (PV/UV/conversion/retention), trend comparison, and conclusion output with Chart.js HTML reports.
description_zh: 需求决策阶段的数据支撑分析——多维分析（PV/UV/转化率/留存）、趋势对比、结论输出，产出 Chart.js 可视化 HTML 报告。
user-invocable: true
argument-hint: "告诉我需求名称和分析目标，我来拉数据出报告"
---

# 数据决策分析

> **适用角色**：AI 产品经理、产品负责人、需求规划人员
> **适用阶段**：需求规划期、立项决策前、方案评审前
> **核心能力**：从 ODPS 或本地数据中提取关键指标，用 RICE/ICE 框架量化优先级，输出可交付的 Chart.js 可视化报告

---

## 读取配置（自动生成，请勿删除）

执行任何动作前，读 `~/.qoderwork/plugins/config/pm-data-toolkit/QODERWORK.md`。
- 文件不存在或仍含 `[PLACEHOLDER]` → 停下来，回复用户运行 `/pm-data-toolkit:onboarding`，不要继续。
- 本 skill 会用到配置里的：`## 常用 ODPS 表映射`、`## 指标口径定义`、`## 输出风格`、`## 业务规则`
- 配置没覆盖到的字段：反问用户 → 把答案写回 `QODERWORK.md` → 继续。

---

## 触发条件

以下场景自动触发本 skill：
- 用户说"这个需求要不要做"、"帮我看看数据支撑"、"优先级怎么排"
- 用户提及需求名称并希望了解数据表现
- 用户需要为 PRD 或方案评审准备数据材料
- 用户提到 RICE、ICE、优先级排序、ROI 分析
- 用户说"拉个数据"、"出个报告"、"分析一下"

---

## 完整执行流程

### Step 1：澄清分析目标

用结构化问题快速锁定分析范围，**不要一次问超过 3 个问题**：

```
请确认以下信息，我来帮你拉数据出报告：

1. 【分析目标】这个数据用来支撑什么决策？
   - 新功能立项 / 功能优化 / 下线判断 / 资源争夺 / 其他
2. 【核心指标】你最关心哪些指标？
   - 用户规模（UV/PV）/ 转化率 / 留存率 / 使用时长 / 满意度 / 其他
3. 【时间范围】看多长时间的数据？
   - 最近 7 天 / 最近 30 天 / 最近 90 天 / 自定义
```

如果用户已经明确说出需求和指标，**跳过澄清直接执行**，不要重复确认。

---

### Step 2：识别数据来源

根据 QODERWORK.md 中的 `## 常用 ODPS 表映射` 确定数据表：

| 分析场景 | 常用表类型 | 关键字段 |
|----------|-----------|---------|
| 页面流量分析 | 页面埋点表 | page_id, uv, pv, dt |
| 功能使用分析 | 事件埋点表 | event_name, user_id, dt |
| 转化漏斗分析 | 漏斗事件表 | step_name, user_id, session_id |
| 用户留存分析 | 活跃用户表 | user_id, dt, is_active |
| 反馈/NPS 分析 | 反馈表 | feedback_type, score, content |

**如果配置里没有对应表**：询问用户表名，并将答案回写到 QODERWORK.md。

---

### Step 3：编写并执行 ODPS SQL

#### SQL 编写规范

```sql
-- 多指标聚合查询模板
SELECT
    dt,
    COUNT(DISTINCT user_id)                                    AS uv,
    COUNT(1)                                                    AS pv,
    COUNT(DISTINCT CASE WHEN event_type = 'convert'
                        THEN user_id END)                      AS convert_uv,
    ROUND(COUNT(DISTINCT CASE WHEN event_type = 'convert'
                              THEN user_id END) * 100.0
          / NULLIF(COUNT(DISTINCT user_id), 0), 2)             AS convert_rate
FROM  ${your_event_table}
WHERE dt BETWEEN '${start_date}' AND '${end_date}'
  AND page_id = '${target_page}'
GROUP BY dt
ORDER BY dt ASC
LIMIT 1000;
```

#### 关键原则
- **必须带 LIMIT**：防止全表扫描拖垮集群，默认 `LIMIT 10000`
- **必须带分区条件**：`dt` 字段必须出现在 `WHERE` 中
- **CASE WHEN 做多指标拆解**：一次查询多个指标，避免多次扫表
- **NULLIF 防除零**：所有比率计算必须用 `NULLIF(..., 0)` 包裹分母

#### 留存分析 SQL 模板

```sql
-- N 日留存率计算
WITH first_day AS (
    SELECT user_id, MIN(dt) AS first_dt
    FROM   ${active_table}
    WHERE  dt BETWEEN '${start_date}' AND '${end_date}'
    GROUP BY user_id
),
retention AS (
    SELECT DATEDIFF(a.dt, f.first_dt, 'dd') AS day_diff,
           COUNT(DISTINCT a.user_id)         AS retained_uv
    FROM   ${active_table} a
    JOIN   first_day f ON a.user_id = f.user_id
    WHERE  a.dt > f.first_dt
    GROUP BY DATEDIFF(a.dt, f.first_dt, 'dd')
)
SELECT day_diff,
       retained_uv,
       ROUND(retained_uv * 100.0 / NULLIF(first_day_uv, 0), 2) AS retention_rate
FROM   retention
CROSS JOIN (SELECT COUNT(DISTINCT user_id) AS first_day_uv FROM first_day) t
WHERE  day_diff BETWEEN 1 AND 30
ORDER BY day_diff;
```

---

### Step 4：多维分析框架

#### 4.1 RICE 评分模型

用于**需求优先级排序**，量化每个需求的综合价值：

```
RICE 得分 = (Reach × Impact × Confidence) / Effort

- Reach（触达）：这个需求能影响多少用户？用 UV 数据量化
- Impact（影响）：对核心指标的提升幅度？用历史 A/B 或类比估算
- Confidence（信心）：数据支撑的可靠程度？0-100% 打分
- Effort（成本）：开发人天，从需求文档或技术评审获取
```

输出格式：

```
| 需求        | Reach  | Impact | Confidence | Effort | RICE 得分 |
|------------|--------|--------|------------|--------|----------|
| 需求 A     | 50,000 | 0.8    | 80%        | 10 人天 | 3,200   |
| 需求 B     | 10,000 | 0.5    | 60%        | 5 人天  | 600     |
```

#### 4.2 ICE 快速评估模型

适用于**快速筛选**，不需要精确 Reach 数据时使用：

```
ICE 得分 = Impact × Confidence × Ease

- Impact（影响）：1-10 分，对核心指标的预期影响
- Confidence（信心）：1-10 分，对判断的确信程度
- Ease（容易程度）：1-10 分，实施的容易程度（与 Effort 相反）
```

#### 4.3 趋势对比分析

```
环比（WoW/MoM）：当前周期 vs 上一个同等周期
  - 必须标注对比基准日期，格式：环比（vs 2024-03-01~2024-03-07）

同比（YoY）：当前周期 vs 去年同期
  - 注意节假日偏移，农历节日需对齐

MA7（7 日移动平均）：消除日波动，看真实趋势
  - SQL：AVG(metric) OVER (ORDER BY dt ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
```

---

### Step 5：生成结论

输出两层结论，**缺一不可**：

#### 给老板看的一句话结论
> 格式：`【结论】+ 数据依据 + 建议行动`
> 示例：`【建议推进】智能摘要功能日均 UV 2.3 万，转化率 12%，RICE 得分排名第一，建议本迭代优先开发。`

#### 给自己的详细分析
包含：
- 数据发现和异常点
- 各方案的量化对比
- 风险提示和数据盲区
- 下一步需要补充的数据

---

### Step 6：输出 HTML 可视化报告

报告结构如下（使用 Chart.js CDN）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>数据决策分析报告 - ${需求名称}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    /* 报告样式 */
    body { font-family: 'PingFang SC', sans-serif; background: #f5f7fa; margin: 0; padding: 24px; }
    .report-header { background: linear-gradient(135deg, #667eea, #764ba2); color: white;
                     padding: 32px; border-radius: 12px; margin-bottom: 24px; }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                  gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px;
                 box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; }
    .stat-change { font-size: 12px; margin-top: 6px; }
    .stat-change.up { color: #22c55e; }
    .stat-change.down { color: #ef4444; }
    .chart-section { background: white; padding: 24px; border-radius: 10px;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; }
    .conclusion { background: #fffbeb; border-left: 4px solid #f59e0b;
                  padding: 20px; border-radius: 8px; margin-bottom: 24px; }
    .metric-def { background: #f0f9ff; padding: 16px; border-radius: 8px;
                  font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <!-- 报告头部 -->
  <div class="report-header">
    <h1>${需求名称} - 数据决策分析报告</h1>
    <p>分析周期：${start_date} 至 ${end_date} | 生成时间：${gen_time}</p>
  </div>

  <!-- 核心指标卡片 -->
  <div class="stat-cards">
    <div class="stat-card">
      <div class="stat-value">${uv_value}</div>
      <div class="stat-label">日均 UV</div>
      <div class="stat-change ${uv_trend}">${uv_change}</div>
    </div>
    <!-- 更多 stat-card ... -->
  </div>

  <!-- 趋势图表 -->
  <div class="chart-section">
    <h3>指标趋势（含 MA7 移动平均）</h3>
    <canvas id="trendChart"></canvas>
  </div>

  <!-- RICE 对比图 -->
  <div class="chart-section">
    <h3>需求优先级 RICE 评分对比</h3>
    <canvas id="riceChart"></canvas>
  </div>

  <!-- 结论区 -->
  <div class="conclusion">
    <h3>结论与建议</h3>
    <p><strong>一句话结论：</strong>${one_line_conclusion}</p>
    <p><strong>详细分析：</strong>${detailed_analysis}</p>
  </div>

  <!-- 口径说明 -->
  <div class="metric-def">
    <h4>口径说明</h4>
    <ul>
      <li><strong>UV</strong>：去重独立用户数，基于 user_id 去重</li>
      <li><strong>PV</strong>：页面浏览次数，含重复访问</li>
      <li><strong>转化率</strong>：完成目标行为用户 / 访问用户 × 100%</li>
      <li><strong>留存率</strong>：首次访问后第 N 天仍有活跃行为的用户比例</li>
    </ul>
  </div>

  <script>
    // 趋势图
    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: ${date_labels},
        datasets: [
          { label: 'UV', data: ${uv_data}, borderColor: '#667eea', tension: 0.3 },
          { label: 'MA7', data: ${ma7_data}, borderColor: '#f59e0b',
            borderDash: [5, 5], tension: 0.3, pointRadius: 0 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });

    // RICE 对比图
    new Chart(document.getElementById('riceChart'), {
      type: 'bar',
      data: {
        labels: ${req_labels},
        datasets: [{ label: 'RICE 得分', data: ${rice_scores},
                     backgroundColor: ['#667eea', '#764ba2', '#22c55e', '#f59e0b'] }]
      },
      options: { responsive: true, indexAxis: 'y' }
    });
  </script>
</body>
</html>
```

---

## 分支逻辑

根据数据源连接状态和用户输入，选择不同执行路径：

### 情况 A：ODPS 已连接
```
检测方式：读取 QODERWORK.md 中 ## ODPS 连接配置，确认 project 和 endpoint 已填写
→ 直接构建 SQL → 通过 odps-skill 执行查询 → 进入分析流程
```

### 情况 B：ODPS 未连接
```
→ 告知用户："ODPS 尚未配置，你可以：
   1. 运行 /pm-data-toolkit:onboarding 配置 ODPS 连接
   2. 上传 CSV / Excel 文件，我直接分析本地数据"
→ 用户上传文件后，用 pandas 分析 → 进入分析流程
```

### 情况 C：用户指定了具体表名
```
→ 跳过表识别，直接用用户指定的表
→ 先 DESC 表结构确认字段，再构建 SQL
```

### 情况 D：用户描述模糊（如"帮我看看数据"）
```
→ 最多追问 2-3 个结构化问题（见 Step 1）
→ 不要开放式追问，给选项让用户选
→ 如果用户说"你看着办"→ 用默认配置：最近 30 天，UV/PV/转化率
```

---

## 输出格式规范

每份报告必须包含以下六个区块，缺一不可：

| 区块 | 内容 | 格式要求 |
|------|------|---------|
| 报告头部 | 需求名称、分析周期、生成时间 | 渐变背景，白色文字 |
| 核心指标卡片 | 3-5 个关键数字，含环比变化 | stat-card 网格布局，变化率用颜色区分涨跌 |
| 趋势图表 | 折线图，含原始值和 MA7 | Chart.js line chart，X 轴为日期 |
| 对比图表 | RICE/ICE 得分对比，或漏斗图 | Chart.js bar chart，横向排列便于对比 |
| 结论与建议 | 一句话结论 + 详细分析 | 黄色背景块，突出显示 |
| 口径说明 | 所有指标的计算口径 | 蓝色背景块，小字体 |

---

## 质量红线（违反任何一条即为不合格）

1. **不准不标口径就出数据**
   - 每个数字必须附带口径说明，"UV" 必须说明去重逻辑，"转化率" 必须说明分子分母

2. **不准用 SELECT * 不带 LIMIT**
   - 生产表数据量大，无 LIMIT 查询可能导致集群资源耗尽
   - 探索性查询先用 `LIMIT 100` 看结构，正式查询带 `LIMIT 10000`

3. **环比必须标注对比基准日期**
   - 错误：`环比增长 12%`
   - 正确：`环比增长 12%（vs 2024-03-01~2024-03-07）`

4. **百分比变化必须同时给出绝对值**
   - 错误：`转化率提升 50%`
   - 正确：`转化率从 4% 提升至 6%（+2pp，相对提升 50%）`

5. **UV 和 PV 不能混用，必须明确标注**
   - UV 是用户维度（去重），PV 是行为维度（不去重）
   - 报告中不允许出现"访问量"这种模糊词，必须明确写 UV 或 PV

6. **RICE/ICE 评分必须展示计算过程**
   - 不允许只给最终得分，必须展示每个因子的值和计算方式
   - Confidence 和 Impact 的主观打分必须标注打分依据

7. **SQL 必须包含分区过滤条件**
   - 无分区过滤的查询在 ODPS 上会被拒绝执行或收取高额费用
   - `WHERE dt BETWEEN ... AND ...` 是最低要求

---

## 常用分析场景速查

### 场景 1：新功能是否值得做
```
分析路径：
1. 查目标场景的现有 UV（需求规模验证）
2. 查类似功能的历史转化率（影响估算）
3. 用 RICE 框架打分，与其他需求横向对比
4. 输出结论：做/不做/延期
```

### 场景 2：功能优化方向选择
```
分析路径：
1. 查当前功能的 UV、使用频次、流失节点
2. 按用户分层（新/老用户、高/低活跃）拆解指标
3. 找出最大流失环节，估算优化后的收益
4. 用 ICE 快速评估各优化方向的性价比
```

### 场景 3：功能下线判断
```
分析路径：
1. 查功能的日活/月活趋势（是否持续下降）
2. 查功能的维护成本（从需求文档获取）
3. 查依赖该功能的下游场景（影响面评估）
4. 设定阈值：日 UV < X 且连续 N 周下降 → 建议下线
```

### 场景 4：A/B 实验结果解读
```
分析路径：
1. 确认实验组和对照组的样本量是否充足
2. 计算各指标的绝对差异和相对差异
3. 判断是否达到统计显著性（如有 p-value 数据）
4. 分维度拆解：哪些用户群体收益更大
5. 结论：全量 / 扩大实验 / 放弃
```

---

## 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| ODPS 查询超时 | 缩小时间范围或添加更多过滤条件，重试一次；仍超时则告知用户 |
| 表不存在或无权限 | 告知用户具体报错，建议联系数据负责人授权 |
| 查询结果为空 | 检查分区是否存在，检查过滤条件是否过严，告知用户并建议调整 |
| 数据异常（如 UV 突然为 0） | 先排查数据管道问题，不要直接解读为"用户消失了" |

---

## 参考资料

详细的分析框架说明和 SQL 模板见：
- [分析框架详解](./references/analysis-frameworks.md)

---

## 调用示例

**示例 1：基础数据查询**
```
用户：帮我看看智能摘要功能最近 30 天的数据表现
Agent：[执行 Step 1-6，输出含 UV/PV 趋势、转化率、RICE 评分的 HTML 报告]
```

**示例 2：优先级排序**
```
用户：我有三个需求要排优先级，帮我用 RICE 打个分
Agent：[收集三个需求的 Reach/Impact/Confidence/Effort，计算得分，输出对比图表]
```

**示例 3：本地数据分析**
```
用户：ODPS 还没配好，我这里有份 CSV，帮我分析一下
Agent：[读取 CSV，用 pandas 分析，输出同样格式的 HTML 报告]
```
