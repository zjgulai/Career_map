---
name: dtc-site-forensic-audit
description: >
  DTC 独立站性能与体验法医诊断 SOP：用 Playwright 实地取证（10 类指标采集），
  输出三段式法医报告（现场 + 物证 + 鉴定），指标口径三轨道设计，
  竞品 8 站对标，McKinsey SCQA 叙事重构，GitHub Pages 独立仓部署。
  触发场景：「诊断网站」「性能分析」「DTC 站审计」「CRO 分析」「独立站体检」
  「网站转化率问题」「LCP 慢」「bounce rate 高」「网站质量评估」。
triggers:
  - "诊断网站"
  - "性能分析"
  - "DTC 站审计"
  - "网站体检"
  - "site audit"
  - "CRO 分析"
  - "LCP 慢"
  - "bounce rate"
  - "网站转化率"
version: 1.0.0
created: 2026-05-25
source_evidence:
  - NurtureLoop demo site 9 轮迭代（v1.0→v2.0，eng_20260516_demo-site-build）
  - Momcozy PDP 竞品 8 站对标分析
  - GitHub Pages 90-second deploy 工作流（lesson_github-pages-90-second-deploy）
---

# dtc-site-forensic-audit

DTC 独立站法医诊断 SOP — 三段式报告 + McKinsey 叙事 + 竞品对标。

## 核心理念：法医视角

不是「咨询意见」，是「法庭证据」：
- **现场（Scene）**：我看到了什么（Playwright 截图 + Console log）
- **物证（Evidence）**：数据说明什么（LCP / CLS / FID / FCP + 行业基线）
- **鉴定（Verdict）**：量化影响 + ROI + 优先级

每个数据点必须有 ROI 量化，格式：`每 100ms LCP ≈ 3.5% CVR 损失（Shopify 2026 Q1 基线）`

---

## Step 0：诊断范围确认

```
目标站点：[URL]
对标竞品：[3-8 个竞品 URL，可选]
核心关注：[性能 / 转化率 / SEO / 合规 / 全部]
输出格式：[内部报告 / 客户交付（McKinsey 叙事）/ GitHub Pages 发布]
```

---

## Step 1：Playwright 实地取证（10 类指标）

```python
from playwright.sync_api import sync_playwright
import json, time

def collect_site_evidence(url: str, output_dir: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Console errors 采集
        errors = []
        page = browser.new_page()
        page.on("console", lambda msg: errors.append({"type": msg.type, "text": msg.text}) if msg.type == "error" else None)
        
        # 2. Network resource 采集
        resources = []
        page.on("response", lambda r: resources.append({
            "url": r.url, "status": r.status, 
            "size": r.headers.get("content-length", "?"),
            "content_type": r.headers.get("content-type", "?")
        }))
        
        # 3. Long tasks 采集（性能）
        page.goto(url, wait_until="networkidle", timeout=30000)
        
        # 4. Core Web Vitals（通过 JS 注入）
        vitals = page.evaluate("""
            () => {
                return new Promise(resolve => {
                    const vitals = {};
                    new PerformanceObserver(list => {
                        list.getEntries().forEach(e => {
                            if (e.entryType === 'largest-contentful-paint') vitals.lcp = e.startTime;
                            if (e.entryType === 'layout-shift') vitals.cls = (vitals.cls || 0) + e.value;
                        });
                    }).observe({entryTypes: ['largest-contentful-paint', 'layout-shift']});
                    setTimeout(() => resolve(vitals), 3000);
                });
            }
        """)
        
        # 5. 截图（全页）
        page.screenshot(path=f"{output_dir}/01-desktop.png", full_page=True)
        
        # 6. 移动端视口截图
        page.set_viewport_size({"width": 390, "height": 844})
        page.reload(wait_until="networkidle")
        page.screenshot(path=f"{output_dir}/02-mobile.png", full_page=True)
        
        # 7. robots.txt + sitemap 检查
        page.goto(f"{url}/robots.txt")
        robots_content = page.content()
        
        # 8. 404 链接检查
        broken_links = [r for r in resources if r["status"] == 404]
        
        # 9. 图片 alt text 检查
        images = page.evaluate("""
            () => Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src, alt: img.alt, width: img.naturalWidth, height: img.naturalHeight
            }))
        """)
        
        # 10. 结构化数据检查
        schema_markup = page.evaluate("""
            () => Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                  .map(s => JSON.parse(s.textContent))
        """)
        
        browser.close()
        return {
            "vitals": vitals, "errors": errors, "broken_links": broken_links,
            "images": images, "schema": schema_markup, "robots": robots_content
        }
```

---

## Step 2：行业基线数据（ROI 量化用）

| 指标 | 良好 | 需改进 | 差 | ROI 换算 |
|---|---|---|---|---|
| LCP | < 2.5s | 2.5-4s | > 4s | 每 100ms ≈ 3.5% CVR（Shopify 2026 Q1） |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 | 每 0.1 CLS ≈ 3% 跳出率 |
| FID/INP | < 100ms | 100-300ms | > 300ms | 每 100ms ≈ 5% mobile CVR |
| FCP | < 1.8s | 1.8-3s | > 3s | — |
| 图片 alt text 覆盖率 | > 95% | 80-95% | < 80% | SEO: 每 10 张无 alt ≈ -2% organic |
| 404 错误率 | < 1% | 1-5% | > 5% | — |

---

## Step 3：三段式法医报告模板

```markdown
# [站点名] 性能法医报告 vX.X
**日期**：[YYYY-MM-DD]
**诊断员**：Sisyphus + Oracle + Librarian

---

## I. 现场（Scene）

### 1.1 实地取证快照
[截图嵌入 + 关键视觉问题标注]

### 1.2 Console 错误日志
| 类型 | 错误内容 | 频次 | 影响面 |
|---|---|---|---|

### 1.3 关键资源清单
[图片大小 / 字体加载 / 第三方脚本 + 各 HTTP 状态码]

---

## II. 物证（Evidence）

### 2.1 Core Web Vitals 实测值 vs 基线
| 指标 | 实测值 | 行业基线 | 差距 |
|---|---|---|---|
| LCP | Xs | 2.5s | +X% |
| CLS | X | 0.1 | +X |
| FCP | Xs | 1.8s | +X% |

### 2.2 ROI 量化
- LCP 超基线 [X]ms → CVR 损失约 [Y]%
- 月均访问量 [Z] × CVR 损失 [Y]% × AOV $[A] = 月损失 $[B]

### 2.3 竞品对标
| 竞品 | LCP | 关键差异点 | 我们 vs 竞品 |
|---|---|---|---|

---

## III. 鉴定（Verdict）

### 3.1 优先级矩阵
| P0（阻塞上线） | P1（核心 ROI） | P2（体验优化） | P3（记录待后） |
|---|---|---|---|

### 3.2 修复行动清单
| 优先级 | 问题 | 根因 | 修复方案 | 预期收益 | 工时 |
|---|---|---|---|---|---|
| P0 | | | | | |

### 3.3 McKinsey SCQA 叙事
**Situation**：[当前状态 1-2 句]
**Complication**：[问题和影响 1-2 句]
**Question**：[核心问题 1 句]
**Answer**：[解决方案 + 预期 ROI 1-2 句]
```

---

## Step 4：指标口径三轨道（量类/率类/ROI）

**必须遵守，否则交付物数据不一致：**

| 口径类型 | 规则 | 正确示例 | 错误示例 |
|---|---|---|---|
| **量类（PV/Sessions）** | 累计 + 日均双口径 | "月 PV 12万（日均 4,000）" | "月 PV 12万" |
| **量类（排期内）** | P50 同口径重算 | "P50 日 PV 3,800"（不含零值天） | "日均 2,100"（含零值天拉低） |
| **率类（CVR/bounce）** | 原始值，不月化 | "CVR 2.3%" | "CVR 月化 69%" |
| **ROI** | 月化独立展示 | "月损失 $4,200（独立估算）" | 混入 CVR 叙述 |
| **交叉验证** | PV+AOV+天数全页一致 | 每次 revise 全文 grep 三个数字 | 只改一处漏改其他 |

---

## Step 5：竞品 8 站对标框架

每站输出 100 字结构化分析：
```
[站名]（URL）
- Cluster：[技术类 / 设计类 / 运营类]
- Strategic Rationale：[为什么选这个对标]
- 强项：[1-2 点]
- 弱项：[1 点]
- Gap vs 我们：[差距最大的 1 个维度]
```

**推荐对标逻辑（母婴 DTC）：**
- 技术标杆：Shopify 2024 Site of the Year 获奖站点
- 类目标杆：竞品 Top 3 by BSR（Baby category）
- 体验标杆：同价位段品牌（$100-300 客单价）

---

## Step 6：GitHub Pages 90 秒独立仓部署

```bash
#!/bin/bash
# 用法：./deploy-to-gh-pages.sh <仓库名> <本地目录>

REPO_NAME="$1"  # e.g. lute-momcozy-audit
LOCAL_DIR="$2"  # 包含 index.html 的目录

# 1. 创建公开仓库
gh repo create "zjgulai/$REPO_NAME" --public

# 2. 初始化 git
cd "$LOCAL_DIR"
git init -b main
git remote add origin "https://github.com/zjgulai/$REPO_NAME.git"

# 3. 添加 .nojekyll（避免中文路径 404）
touch .nojekyll

# 4. Commit & Push
git add .
git commit -m "init: site audit deliverable"
git push -u origin main

# 5. 启用 GitHub Pages
gh api -X POST /repos/zjgulai/$REPO_NAME/pages \
  -f "source[branch]=main" -f "source[path]=/"

# 6. 等待部署（轮询，最多 60 秒）
echo "等待 GitHub Pages 就绪..."
for i in {1..12}; do
    sleep 5
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://zjgulai.github.io/$REPO_NAME/")
    if [ "$STATUS" = "200" ]; then
        echo "✅ 部署成功：https://zjgulai.github.io/$REPO_NAME/"
        exit 0
    fi
    echo "等待中... ($((i*5))s / 60s)"
done
echo "⚠️ 超时，请手动检查：https://github.com/zjgulai/$REPO_NAME/settings/pages"
```

---

## 交付物清单

每次法医审计完成，产出文件：

```
audit-deliverables/
├── 01-scene-screenshots/       ← Playwright 截图（desktop + mobile）
├── 02-evidence-data/           ← vitals.json + errors.json + resources.json
├── 03-forensic-report.md       ← 三段式法医报告（含 McKinsey SCQA）
├── 04-competitor-benchmarks/   ← 竞品截图 + 对标分析 JSON
├── 05-fix-action-list.csv      ← 修复动作清单（P0/P1/P2/P3）
└── index.html                  ← 可 GitHub Pages 部署的客户交付版本
```

---

## 质量门（交付前自查）

- [ ] LCP/CLS 实测值已有行业基线对比
- [ ] 每个 P0/P1 问题都有 ROI 量化（不允许只定性）
- [ ] 指标口径三轨道已检查（量类双口径/率类原值/ROI 月化独立）
- [ ] 全文数字交叉验证（PV + AOV + 天数 全页一致）
- [ ] Console errors 已分类（Fatal / Warning / Info）
- [ ] 竞品对标 ≥ 3 站（才有说服力）
- [ ] McKinsey SCQA 叙事已填完 4 段
- [ ] GitHub Pages 已部署 + curl 验 HTTP 200
