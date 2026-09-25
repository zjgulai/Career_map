---
name: 埋点方案设计
version: 1.0.0
description: Feature tracking instrumentation design — user path mapping, event definition (exposure 2201/click 2101), args parameter design (&-separated key=value), metric specification.
description_zh: 新功能埋点方案设计——用户路径梳理、事件定义（曝光2201/点击2101）、args参数设计（&分隔key=value）、口径说明，产出埋点方案文档。
user-invocable: true
argument-hint: "告诉我功能名称和用户路径，我来设计埋点"
---

# 埋点方案设计

## 读取配置（自动生成，请勿删除）

执行任何动作前，读 `~/.qoderwork/plugins/config/pm-data-toolkit/QODERWORK.md`。
- 文件不存在或仍含 `[PLACEHOLDER]` → 停下来，回复用户运行 `/pm-data-toolkit:onboarding`，不要继续。
- 本 skill 会用到配置里的：## 常用 ODPS 表映射、## 业务规则
- 配置没覆盖到的字段：反问用户 → 把答案写回 QODERWORK.md → 继续。

## 触发条件

当用户说以下类似的话时触发：
- "帮我设计这个功能的埋点"
- "新功能需要埋点方案"
- "这个页面要加什么埋点"
- "帮我看下埋点有没有遗漏"

## 完整执行流程

### Step 1：理解功能

**必须搞清楚三件事：**
1. **功能是什么** — 这个功能解决什么问题？用户在什么场景下使用？
2. **用户路径** — 用户从哪进入？经过哪些页面/步骤？最终完成什么动作？
3. **关键决策点** — 路径中哪些环节用户会做选择（点击/跳过/返回）？

**信息来源优先级：**
- 用户提供了 PRD → 从 PRD 中提取用户流程
- 用户提供了截图/原型 → 从 UI 识别需要追踪的元素
- 用户只说了功能名 → 用 AskUserQuestion 收集：

```
问题1: 用户从哪个入口进入这个功能？
选项: [根据功能推断 3-4 个可能入口] + Other

问题2: 功能的核心转化动作是什么？（用户最终要完成的事）
选项: [根据功能推断 3-4 个] + Other
```

### Step 2：用户路径映射

把完整用户旅程用文字画出来：

```
入口曝光 → 入口点击 → 页面加载 → 页面元素曝光 → 用户操作（点击/滑动/输入）
    → 结果展示 → 结果操作（复制/分享/重试/关闭）
```

**路径映射规则：**
- 每个可见元素 → 一个曝光事件（2201）
- 每个可交互元素 → 一个点击事件（2101）
- 每个分支点 → 标注"用户可能走向 A 或 B"
- 每个页面进入/退出 → 标注页面级事件

### Step 3：事件定义

**事件 ID 约定（跨表通用）：**
- `event_id = '2201'` → 曝光事件
- `event_id = '2101'` → 点击事件

**命名规范：**
```
arg1 = page_module_element_action
```

示例：
| arg1 | event_id | 说明 |
|------|----------|------|
| camera_entry_show | 2201 | 相机入口曝光 |
| camera_entry_click | 2101 | 相机入口点击 |
| camera_shutter_click | 2101 | 快门按钮点击 |
| camera_result_show | 2201 | 拍摄结果展示 |
| camera_result_copy | 2101 | 结果页复制操作 |

**args 参数设计：**

args 使用 `&` 分隔的 `key=value` 格式，用于补充事件上下文：

```
button_text=拍照解题&source=camera_page&user_type=nu&scene=main_dialog
```

**args 设计原则：**
- 只放分析时需要的维度，不要把整个对象序列化塞进去
- key 用 snake_case，value 用英文（中文分析时用 KEYVALUE 解析）
- 同一 arg1 有多个埋点时，必须通过 args 参数区分

**常用 args 参数：**

| key | 说明 | 示例值 |
|-----|------|--------|
| source | 来源页面/场景 | camera_page, main_dialog |
| user_type | 用户类型 | nu (新用户), ou (老用户) |
| button_text | 按钮文案 | 拍照解题, 相册选择 |
| content_type | 内容类型 | image, text, file |
| result_type | 结果类型 | answer, error, loading |

### Step 4：指标口径定义

为每个漏斗阶段定义指标：

```markdown
| 指标名 | 计算方式 | 备注 |
|--------|---------|------|
| 入口曝光UV | COUNT(DISTINCT visitor_id) WHERE arg1='xxx' AND event_id='2201' | 去重设备 |
| 入口点击UV | COUNT(DISTINCT visitor_id) WHERE arg1='xxx' AND event_id='2101' | |
| 入口点击率 | 入口点击UV / 入口曝光UV × 100% | |
| 功能发起率 | 发起请求UV / 入口点击UV × 100% | 核心效率指标 |
| 功能完成率 | 结果展示UV / 发起请求UV × 100% | |
```

**口径定义红线：**
- 每个率值指标必须写明分子和分母
- UV 指标必须说明去重维度（visitor_id / utdid / user_id）
- 时间窗口必须标注（日/周/月）

### Step 5：质量 Checklist 验证

设计完成后，逐项检查（详见 [埋点质量 Checklist](references/tracking-checklist.md)）：

**必须通过的 10 项：**
1. ✅ 曝光和点击成对设计——有点击必须有对应曝光
2. ✅ event_id 只用 2101（点击）和 2201（曝光）
3. ✅ args 格式为 `&` 分隔的 key=value
4. ✅ 环境过滤条件已加：`environment_code='online'`
5. ✅ 页面过滤条件已加：`lower(page)='page_xxx'`
6. ✅ 每个率值指标的分子分母都已定义
7. ✅ UV 去重维度已说明
8. ✅ 同一 arg1 多埋点通过 args 区分
9. ✅ 关键决策点都有埋点覆盖
10. ✅ 提供了数据验证 SQL

### Step 6：产出埋点方案文档

**输出格式：**

```markdown
# [功能名称] 埋点方案

## 功能概述
一段话说明功能背景和目标。

## 用户路径
文字版用户旅程图。

## 事件清单

| # | arg1 | event_id | 说明 | args 参数 | 关联指标 |
|---|------|----------|------|-----------|---------|
| 1 | xxx_show | 2201 | ... | source=... | 入口曝光UV |
| 2 | xxx_click | 2101 | ... | source=...,button_text=... | 入口点击UV |
| ... | | | | | |

## 口径说明

| 指标名 | 计算方式 | 去重维度 | 时间窗口 |
|--------|---------|---------|---------|
| ... | ... | visitor_id | 日 |

## 数据验证 SQL
（可直接在 ODPS 中执行的验证查询）

## 注意事项
（特殊场景处理、已知限制等）
```

## 分支逻辑

- **用户提供了 PRD** → 从 PRD 提取用户流程，减少追问
- **用户提供了截图** → 识别 UI 元素，标注需要追踪的部分
- **已有埋点存在** → 先读已有方案，建议增量补充而非替换
- **用户说"检查埋点"** → 走 Checklist 验证流程，输出问题清单
- **跨页面功能** → 每个页面单独出事件清单，页间用 session_id 串联

## 数据验证 SQL 模板

设计完成后，提供以下验证 SQL：

```sql
-- 1. 验证曝光/点击是否成对出现
SELECT arg1, event_id, COUNT(1) AS cnt
FROM {table}
WHERE day = '{date}'
  AND environment_code = 'online'
  AND lower(page) = '{page_name}'
  AND arg1 IN ('{event_a}', '{event_b}')
GROUP BY arg1, event_id;

-- 2. 验证 args 参数是否正确上报
SELECT arg1,
  KEYVALUE(args, '&', '=', 'source') AS source,
  KEYVALUE(args, '&', '=', 'user_type') AS user_type,
  COUNT(1) AS cnt
FROM {table}
WHERE day = '{date}'
  AND environment_code = 'online'
  AND arg1 = '{event_name}'
GROUP BY arg1, source, user_type;

-- 3. 验证漏斗完整性
SELECT
  CASE WHEN arg1 = '{show_event}' AND event_id = '2201' THEN '1_曝光'
       WHEN arg1 = '{click_event}' AND event_id = '2101' THEN '2_点击'
       WHEN arg1 = '{action_event}' AND event_id = '2101' THEN '3_操作'
       ELSE 'other'
  END AS stage,
  COUNT(1) AS pv,
  COUNT(DISTINCT visitor_id) AS uv
FROM {table}
WHERE day = '{date}'
  AND environment_code = 'online'
  AND lower(page) = '{page_name}'
GROUP BY stage
ORDER BY stage;
```

## 与其他技能的协作

- 埋点方案设计 → **上线效果监控**：埋点方案定义的事件直接用于监控
- 埋点方案设计 → **漏斗归因诊断**：埋点定义的漏斗阶段是归因分析的基础
- **数据决策分析** → 埋点方案设计：决策分析发现的缺口可能需要新增埋点

## 质量红线（不能犯）

1. **曝光和点击必须成对** — 有 2101 必须有对应 2201，否则无法算转化率
2. **event_id 不能自定义** — 只用 2101（点击）和 2201（曝光），跨表通用
3. **args 用 & 分隔** — 解析用 `KEYVALUE(args, '&', '=', 'key')`，不能用 JSON 或其他格式
4. **环境过滤必加** — `environment_code='online'`，否则测试数据污染分析
5. **arg1 过滤用 RLIKE** — `RLIKE 'pattern'` 优于 `IN (...)`，避免隐式类型/编码问题
6. **同 arg1 多埋点必须区分** — 通过 args 参数（如 button_text）区分，不能复用 arg1
7. **口径必须有分子分母** — 率值指标不写计算方式等于没定义
8. **不要过度埋点** — 只埋分析需要的，不要把每个 DOM 元素都埋上

## 参考文件

- [埋点质量 Checklist](references/tracking-checklist.md) — 完整的 20+ 项检查清单和常见问题
