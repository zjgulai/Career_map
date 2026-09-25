---
name: dtc-brand-recon
description: >
  DTC 产品上架前的品牌侦查 SOP：用 Playwright 抓取现有品牌官网（首页 + collection + PDP），
  提取 7 类品牌资产，输出品牌现状报告 + 新 SKU 融入策略。
  触发场景：「SOP-B 开始前」「品牌设计之前」「看看这个品牌的风格」「[品牌名] 官网侦查」。
  封装了 lesson_brand-recon-before-design-existing-vs-greenfield 的完整操作流程。
  关键规则：SOP-B 开始前必须先确认品牌身份（现有品牌 vs 新建品牌），否则后续所有设计工作都是错误上下文。
triggers:
  - "SOP-B 开始"
  - "品牌侦查"
  - "品牌调研"
  - "看看这个品牌"
  - "官网调研"
  - "现有品牌新 SKU"
  - "品牌资产"
version: 1.0.0
created: 2026-05-25
source_sessions:
  - ses_1c9962202ffet3Em7fX1z7ke2b  # dec_20260516_momcozy-brand-recon-pivot-discovered
source_lessons:
  - lesson_brand-recon-before-design-existing-vs-greenfield
  - lesson_brand-tov-must-cross-validate-with-multi-regulator
---

# dtc-brand-recon

DTC 产品上架前品牌侦查 SOP。

## 关键警告

> ⚠️ 收到「为某品牌设计/上架产品」类请求时，**第一个问题必须是：这个品牌是现有品牌还是新建品牌？**
>
> 忽略这个问题的代价：整个 SOP-B（7 个 step）在错误的品牌上下文下运行，约 30-50% 的产出需要重做。
>
> 验证：Momcozy 案例 — 从 Day 1 到 Day 2 mockup review 才发现是现有品牌，浪费了整个 SOP-B Step 1-3 的 Seren 新品牌工作。

---

## Step 0: 品牌身份确认

在开始任何设计/上架工作前，先问：

```
这次上架的品牌是：
A. 现有品牌的新 SKU（品牌已有官网/店铺）
B. 现有品牌的子品牌
C. 全新品牌（从零建立）
```

- **A/B → 执行本 Skill（品牌侦查）**
- **C → 跳过本 Skill，直接走 Brand Guardian 创建新品牌**

---

## Step 1: Playwright 侦查（三页）

```python
from playwright.sync_api import sync_playwright

def brand_recon(brand_url: str, brand_name: str, output_dir: str):
    """抓取品牌三页关键页面"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        pages_to_visit = [
            ("homepage", brand_url),
            ("collection", f"{brand_url}/collections/all"),  # 调整路径
            ("pdp", None),  # 从 collection 页面找最高 BSR 产品
        ]
        
        for page_name, url in pages_to_visit:
            if url:
                page.goto(url, wait_until="networkidle", timeout=30000)
                # 截图
                page.screenshot(path=f"{output_dir}/{page_name}.png", full_page=True)
                # 保存 HTML（用于文本提取）
                with open(f"{output_dir}/{page_name}.html", "w") as f:
                    f.write(page.content())
        
        browser.close()
```

**三页的侦查重点：**

| 页面 | 重点提取内容 |
|---|---|
| 首页 | 品牌 slogan / hero 图风格 / 主色调 / 字体 / Nav 结构 |
| Collection | SKU 矩阵（型号/价格/评分/BSR rank）/ 图片风格一致性 |
| PDP（Top SKU） | 产品描述措辞 / CTA 文案 / 图片数量和类型 / 合规声明 |

---

## Step 2: 7 类品牌资产提取

用 `look_at` 工具分析截图，提取以下 7 类资产：

### 2.1 视觉识别系统

```json
{
  "primary_color": "#HEX",
  "secondary_colors": ["#HEX1", "#HEX2"],
  "background_color": "#HEX",
  "font_heading": "字体名",
  "font_body": "字体名",
  "logo_style": "minimal/illustrative/typographic",
  "photography_style": "lifestyle/studio/mixed"
}
```

### 2.2 语言风格（ToV）

- **品牌承诺**：官网 hero 区域的核心 slogan
- **产品描述风格**：技术参数导向 vs 情感价值导向
- **常用动词**：列出 PDP 中频率前 10 的动作词
- **禁区词汇**：已在用但可能有合规风险的词（标注原文位置）

### 2.3 SKU 矩阵

```markdown
| 型号 | 价格 | 评分 | Review 数 | 技术类型 |
|---|---|---|---|---|
| KleanPal Pro | $299 | 4.7★ | 2,847 | UV-C |
| [其他 SKU] | ... | ... | ... | ... |
```

### 2.4 价格区间分析

- 现有产品价格范围：$X - $Y
- 空白价格区间：新 SKU 应定位在哪一档
- 竞争最激烈档：$X 附近（SKU 数量最多）

### 2.5 合规风险词汇盘点

**提取现有产品中使用的高风险词汇：**

```bash
# 从 PDP HTML 中提取关键词频率
grep -oi "sterilize\|sanitize\|kills 99\|medical.grade\|FDA\|zero worry\|UV purification" page_pdp.html | sort | uniq -c | sort -rn
```

标注每个词汇的合规风险等级（低/中/高）及适用的技术类型。

### 2.6 竞品对比定位

| 维度 | 本品牌 | 竞品 A | 竞品 B |
|---|---|---|---|
| 价格档位 | $X | $Y | $Z |
| 核心差异 | ... | ... | ... |
| 目标人群 | ... | ... | ... |

### 2.7 新 SKU 融入策略建议

基于上述分析，推荐新 SKU 的：
- **命名规则**：与现有产品线命名保持一致（如 KleanPal 系列）
- **价格定位**：在现有产品线的哪一档
- **ToV 继承点**：可以直接复用的措辞和风格
- **ToV 修改点**：新技术类型需要独立合规的措辞

---

## Step 3: 输出报告

**报告文件命名：** `【Brand-Recon】{品牌名}-{日期}.md`

**报告结构：**

```markdown
# Brand Recon: [品牌名] — [日期]

## 品牌快照
- 官网：[URL]
- 侦查日期：[日期]
- 产品线：[X 个 SKU，价格范围 $X-$Y]

## 7 类资产提取
### 视觉识别系统
[JSON 格式输出]

### 语言风格
[ToV 分析]

### SKU 矩阵
[表格]

### 价格区间分析
[分析结论]

### 合规风险词汇盘点
[词汇列表 + 风险等级]

### 竞品对比定位
[对比表格]

## 新 SKU 融入策略
[3-5 条建议]

## 下游建议
→ Brand Guardian: 基于上述资产做「新 SKU 如何融入现行品牌调性」而非「创建新品牌」
→ Legal Compliance: 特别关注合规风险词汇中与新技术类型的适用性差异
→ UI Designer: 继承 [色值/字体/图片风格]，调整 [差异点]
```

---

## 注意事项

1. **ToV 不可跨技术类型直接复用**：现有蒸气线可以用 `sterilize`，不代表 UV-C 线也可以（见 lesson_regulatory-precedent-non-transferability-across-tech）
2. **一定要看 PDP 而不只看首页**：PDP 才有真实的产品措辞，首页是品牌形象层
3. **BSR 排名变化快**：侦查结果有效期约 2-4 周，不适合长期引用
4. **截图存档**：至少保留 3 张截图（首页/collection/PDP），用于团队对齐和未来对比

---

## 历史执行记录

| 日期 | 品牌 | 页面数 | 关键发现 |
|---|---|---|---|
| 2026-05-16 | Momcozy | 3 | KleanPal Pro $299 UV-C benchmark；蒸气线 ToV 不适用 UV-C；$250-329 价格空白 |
