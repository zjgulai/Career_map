---
name: competitive-report
description: |-
  母婴品牌竞对/标杆品牌深度分析报告生成。
  当用户要求生成竞品分析报告、竞对报告、品牌监测报告、品牌调研报告，
  或提及"按照竞对模板""输出竞对报告""品牌竞对分析"等表达时触发。
  适用于按照《品牌竞对以及标杆品牌监测》模板框架，在指定时间范围内
  对指定品牌完成系统性竞品情报采集、分析和报告撰写。
  首次使用前运行 scripts/setup.command (macOS 双击) / scripts/setup.ps1 (Windows) /
  scripts/setup.sh (Linux/CLI) 自动安装 .NET 8.0 SDK。
agent_created: true
---

# Competitive Report — 母婴品牌竞对深度分析报告

## Purpose

按《品牌竞对以及标杆品牌监测》模板框架，在指定监测周期内对指定竞品品牌
进行全网公开信息采集、分析，生成结构化深度竞品分析报告（Markdown），
并支持输出 Word 文档。

报告的结构、内容深度与叙事风格 **以 `references/示例模板-Willow竞品深度分析报告.md` 为权威范例基准**——
它是品牌方认可、按模板落地的完整示例。生成报告前必须完整读取该范例，
对齐其板块结构、子板块拆分、表格形态和分析颗粒度。

## When to Use

在以下场景触发并完整执行：

- 用户要求对某品牌生成竞品分析报告
- 用户提及"按照竞对模板""竞对报告""品牌监测报告"等
- 用户指定出品品牌、竞品品牌和时间范围

## Hard Rules (不可违反)

1. **结构不可删改**：报告结构严格按 `references/report-structure.md` 执行，
   并以 `references/示例模板-Willow竞品深度分析报告.md` 为范例基准。
   每个板块、每个子板块均必须出现，不得删除、不得合并、不得跳过的。
2. **无内容就写"无内容"**：如果某个板块在监测周期内确实找不到任何公开信息，
   写"无内容"并标注原因，绝不省略该板块。
3. **所有动态可溯源**：正文中每个关键数据点、引用、产品参数、Campaign 描述
   均须标注来源编号 `[N]`，对应文末「数据来源与参考索引」表。
   索引表每行必须包含：编号、来源类型用颜色分级标记、
   来源名称、具体内容描述、可追溯链接/路径、数据时效。
4. **生成后必须校验结构一致性**：报告撰写完成后，运行
   `scripts/validate_structure.py` 对照模板检查板块是否齐全。
   校验未通过（有必需板块缺失）时必须补齐后才能交付。
   原始模板见 `references/原始模板-品牌竞对以及标杆品牌监测2.0.md`。

## Workflow

### Phase 1: 解析需求

从用户提示中提取：
- **出品品牌名称**（谁在做这个分析）
- **竞品品牌名称**（分析对象）
- **监测时间范围**（起止日期，如 2026.1.1-2026.6.11）
- 如果用户未指定监测周期，默认取"最近 6 个月"

### Phase 2: 全网信息采集

针对竞品品牌在监测周期内进行多维度搜索（每个维度同时搜索以节省时间）：

1. **品牌官方渠道**：官网 news/press-release 板块、品牌 blog
2. **PR 新闻稿**：PRNewswire、GlobeNewswire、BusinessWire 等
3. **产品发布**：Amazon、Target、Walmart 等电商产品页新品上架信息
4. **社媒动态**：Instagram（主账号 + 区域账号）、TikTok（如有运营） 的公开页面
5. **第三方评测**：Mumsnet、Babylist、WhatToExpect、Consumer Reports 等
6. **社区口碑**：Reddit（r/breastfeeding、r/ExclusivelyPumping、r/beyondthebump 等）
7. **Campaign / 品牌活动**：搜索品牌名 + campaign / launch / event / partnership
8. **行业趋势**：母婴品牌并购、新进入者、品类趋势、技术变革

搜索策略：
- 英文品牌名 + 年份 + 关键词（campaign/launch/product/new/breastfeeding）
- 使用 `site:` 限定品牌官网
- 使用 `site:reddit.com` 限定社区口碑
- 每个关键搜索结果必须调用 WebFetch 获取全文细节

### Phase 3: 报告撰写

先完整读取 `references/示例模板-Willow竞品深度分析报告.md` 作为范例基准，
再读取 `references/report-structure.md` 作为结构骨架，两者对齐后逐板块填充。
板块顺序不可变更：

- 开篇元信息（出品品牌、竞品品牌、监测周期）
- 「行业与竞争格局变化」
- 「A｜品牌定位与核心叙事」
- 「B｜Campaign & 品牌营销动作」
- 「C｜内容与社媒策略」
- 「D｜产品与创新动态」
- 「E｜渠道与触点策略」
- 「F｜用户反馈与信任资产」
- 「G｜AI 搜索与品牌可见性」
- 「H｜关键洞察与策略建议」
- 「📚 数据来源与参考索引」

每完成一个板块，在该板块末尾用 `📎 _本节来源：[N][N]..._` 标注使用的来源编号。

⚠️ 每个独立 Campaign 下必须包含「为什么这个 Campaign 有效？」分析段落。

### Phase 4: 输出 Word 版本

报告 Markdown 定稿后，**优先使用 .NET OpenXML SDK 生成 Word 文档**，
排版质量远超 python-docx（原生样式系统、表格边框、页脚页码、
中文字体映射、不出现格式错乱）。

工作流：

1. 定位模板项目 `scripts/dotnet/Program.cs`（已包含完整样式系统、封面、目录、
   页脚页码、表格构建器等基础设施）
2. ASTATE: 复制一份到工作区临时目录
3. 将每个 `AddXxx()` 方法中的占位内容替换为 Phase 3 撰写好的 Markdown 报告正文。
   使用内置原语：
   - `P(body, "正文段落")`       — 普通段落
   - `Bullet(body, "列表项")`    — 点号列表
   - `H1/H2/H3(body, "标题")`   — 标题层级
   - `Tbl(headers, rows)`        — 专业表格（蓝色顶线 + 斑马纹）
   - `P1(body)`                   — 分页符（板块之间）
   - `Center(body, text, size, color)` — 居中文字（封面用）
4. 还原 NuGet 包并构建运行：
   ```bash
   cd <临时目录> && dotnet restore && dotnet run -c Release
   ```
5. 生成 `.docx` 后复制回工作区。

⚠️ .NET 8.0 SDK 与 DocumentFormat.OpenXml 3.2.0 NuGet 为必需依赖。

**如果 .NET 环境不可用**，降级到 Python 路径：
```bash
python scripts/convert_to_docx.py <input.md> <output.docx>
```
使用前确保 python-docx 已安装（`pip install python-docx`）。

### Phase 5: 结构一致性校验

报告 Markdown 定稿后（Word 生成之前），**必须**运行结构校验，对照模板
检查板块是否齐全：

```bash
python scripts/validate_structure.py <report.md>
```

校验脚本会检查：

- **10 个顶级板块**（行业格局、A–H、数据来源索引）
- **各板块的必需子项**（如 A 板块的「官网核心信息」「电商页面」「品牌叙事变化总结」，
  C 板块的「平台布局」「TikTok」「Instagram」「信任背书」「KOL」等）

输出：
- 每个板块的命中情况（✅ 必需已覆盖 / ❌ 必需缺失 / ⚠️ 建议项缺失）
- 缺失板块清单
- 汇总结论（通过 / 未通过）

**处理规则**：
- 校验通过 → 进入 Phase 6 生成 Word
- 校验未通过 → 补齐缺失板块，重新校验，直到通过才可交付

若需人工核对模板原文，参考 `references/原始模板-品牌竞对以及标杆品牌监测2.0.md`
（品牌方提供的原始模板）和 `references/report-structure.md`（提炼后的固定结构）。

### Phase 6: 交付

将 Markdown 和 Word 文件同时交付给用户，文件命名：
`{出品品牌}对{竞品品牌}竞品深度分析报告.md` 和 `.docx`

## Bundled Resources

### scripts/setup.ps1 / scripts/setup.sh
自动检测并安装 .NET 8.0 SDK（Word 生成的必需依赖）。
接收方首次使用 Skill 前运行一次：
- Windows: `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1`
- macOS/Linux: `bash scripts/setup.sh`
安装成功后无需再次运行。

### references/report-structure.md

报告的固定结构模板（以 Willow 报告为范例基准提炼）。撰写阶段必须完整读取此文件，
确保所有板块无一遗漏。

### references/示例模板-Willow竞品深度分析报告.md

**权威范例基准**。品牌方认可、按模板落地的完整示例报告。生成报告前必须完整读取，
对齐其板块结构、子板块拆分、表格形态、内容深度和叙事风格。
这是判断"报告写得好不好"的对照标准。

### references/原始模板-品牌竞对以及标杆品牌监测2.0.md

品牌方提供的**原始参考模板**。是 `report-structure.md` 的源头依据，
用于人工核对模板原文、监测点、数据来源要求等细节。校验阶段的权威参照。

### scripts/validate_structure.py

结构一致性校验脚本。生成报告后必须运行，对照模板检查板块是否齐全：

```bash
python scripts/validate_structure.py <report.md>
```

校验未通过（必需板块缺失）时，补齐后重新校验，通过才可交付。

### scripts/dotnet/ (Word 生成 — 主路径)

基于 OpenXML SDK 的 Word 文档生成项目，产出专业排版效果：

- `ReportGenerator.csproj` — .NET 8.0 项目文件，引用 DocumentFormat.OpenXml 3.2.0
- `Program.cs` — 带完整样式系统 + 内容构建原语的模板。
  Agent 使用方式：按 Phase 4 工作流，将占位内容替换为实际报告正文后 `dotnet run`。
  重要：必须复制到工作区临时目录运行（不原地修改模板文件）。

运行前需还原依赖：
```bash
cd <临时目录> && dotnet restore
```

### scripts/convert_to_docx.py (Word 生成 — 降级路径)

当 .NET 环境不可用时使用。基于 python-docx 的 Markdown → Word 转换脚本：

```bash
python scripts/convert_to_docx.py <input.md> <output.docx>
```

使用前确保 python-docx 已安装（`pip install python-docx`）。
