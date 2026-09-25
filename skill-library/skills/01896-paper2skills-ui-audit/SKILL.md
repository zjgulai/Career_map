---
name: paper2skills-ui-audit
description: |
  paper2skills Playbook UI 质量审计 + 精细化迭代 SOP。
  触发场景：「UI 审计」「卡片有问题」「检查页面质量」「Playwright 验证」
  「卡片高度不一致」「hover 有问题」。封装了 3 天内重复 3 次的卡片修复循环。
---

# paper2skills-ui-audit

paper2skills Playbook 的 UI 质量审计和精细化迭代标准流程。

## 核心理念

UI 问题的反复出现（本项目 3 天内卡片高度修了 3 次）来自**缺少系统性 checklist**。本 skill 提供：
1. Playwright 自动化取证（不靠目测）
2. 固定的 10 项检查清单
3. CSS 修复的标准模式库

---

## Step 1：Playwright 自动取证

用以下代码一次性收集所有问题证据：

```javascript
// 在 Playwright 中运行
async (page) => {
  const nc = {headers:{'cache-control':'no-cache,no-store'}};
  await page.route('**/*.css', r=>r.continue(nc));
  await page.route('**/*.js', r=>r.continue(nc));
  
  const pages = [
    ['/', 'index'],
    ['/skills/index.html', 'skills'],
    ['/domains/index.html', 'domains'],
    ['/playbooks/index.html', 'playbooks'],
  ];
  
  const results = {};
  for (const [path, name] of pages) {
    await page.goto('https://skills.lute-tlz-dddd.top' + path, {waitUntil:'networkidle'});
    await page.waitForTimeout(1200);
    await page.screenshot({path:`audit-${name}.png`});
    
    const metrics = await page.evaluate((n) => {
      const cards = document.querySelectorAll('.card,.skill-card,.biz-card,.domain-card,.metric-card');
      const byRow = {};
      Array.from(cards).forEach(c => {
        const top = Math.round(c.getBoundingClientRect().top);
        byRow[top] = byRow[top] || [];
        byRow[top].push(Math.round(c.getBoundingClientRect().height));
      });
      const rowVariances = Object.values(byRow).map(hs => Math.max(...hs) - Math.min(...hs));
      const maxRowVariance = Math.max(...rowVariances, 0);
      
      // hover 检查
      const firstCard = cards[0];
      let hoverTextDecoration = 'unknown';
      if (firstCard) {
        const cs = window.getComputedStyle(firstCard);
        hoverTextDecoration = cs.textDecoration;
      }
      
      // 链接检查
      const links = Array.from(document.querySelectorAll('a[href]'));
      const internalLinks = links.filter(a => a.href.includes('skills.lute'));
      
      return {
        page: n,
        cardCount: cards.length,
        maxRowHeightVariance: maxRowVariance,
        rowVariances,
        linkCount: internalLinks.length,
        brokenImgs: Array.from(document.querySelectorAll('img')).filter(i=>!i.complete||i.naturalWidth===0).length,
      };
    }, name);
    results[name] = metrics;
  }
  return results;
}
```

### 验收标准

| 指标 | 通过标准 |
|------|---------|
| `maxRowHeightVariance` | **= 0**（同行卡片完全等高） |
| `brokenImgs` | = 0 |
| hover `textDecoration` | `none`（无下划线） |

---

## Step 2：10 项 UI 检查清单

每次 UI 修改后逐项确认：

```
[ ] 1. 同行卡片高度差 = 0（align-items:stretch + line-clamp 限制）
[ ] 2. hover 无文字下划线（text-decoration:none 覆盖全部卡片类）
[ ] 3. hover 有 translateY + shadow + border 三重反馈
[ ] 4. 描述文字有 -webkit-line-clamp 限制（2-3行）
[ ] 5. ROI badge 有 max-width + text-overflow:ellipsis（防长文撑高）
[ ] 6. a 链接 hover：非卡片链接保留 underline，卡片链接无 underline
[ ] 7. grid 使用 align-items:stretch（不是 start）
[ ] 8. 无死 CSS（ai-panel、废弃组件等）
[ ] 9. 无内联 style 属性（应移入 CSS 类）
[ ] 10. CSS 变量一致（颜色用 var(--accent) 而非硬编码 #C25B6E）
```

---

## Step 3：常见问题 & 标准修复模式

### 问题 A：同行卡片高度不一致

**诊断**：`maxRowHeightVariance > 0`

**修复**：
```css
/* Grid 必须用 stretch */
.cards, .grid, .biz-grid, .ds-grid, .agent-grid {
  align-items: stretch;
}

/* 卡片内部 flex 布局确保内容撑满 */
.skill-card, .biz-card {
  display: flex;
  flex-direction: column;
}

/* 描述文字限制行数 */
.sc-desc, .biz-body p {
  display: -webkit-box;
  -webkit-line-clamp: 2;  /* 或 3 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ROI badge 防长文溢出 */
.sc-roi {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 问题 B：hover 显示文字下划线

**诊断**：鼠标移到卡片上出现下划线

**修复**：
```css
/* 在全局 a:hover 之后覆写 */
.card:hover, .skill-card:hover, .biz-card:hover,
.domain-card:hover, .metric-card:hover, .wf-card:hover,
.agent-card:hover, .ds-card:hover,
a.card:hover, a.skill-card:hover, a.biz-card:hover,
a.domain-card:hover, a.metric-card:hover {
  text-decoration: none;
}
```

### 问题 C：hover 无视觉反馈

**修复**：
```css
.card, .skill-card, .biz-card, .domain-card, .metric-card {
  transition: transform .22s cubic-bezier(0.4,0,0.2,1),
              box-shadow .22s cubic-bezier(0.4,0,0.2,1),
              border-color .15s ease;
}
.skill-card:hover, .card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(0,0,0,.13);
  border-color: var(--accent);
}
```

### 问题 D：标题/tag 互相挤压

**修复**：把 tag 从 flex 行末尾改为独立的 meta 行：
```html
<!-- 推荐结构 -->
<div class="biz-card-header">
  <span class="biz-icon">AG</span>
  <div class="biz-body">
    <div class="biz-card-meta">
      <strong>卡片标题</strong>
      <span class="biz-tag">标签</span>  <!-- flex + margin-left:auto -->
    </div>
    <p>描述文字</p>
  </div>
</div>
```

---

## Step 4：修改后验证

修改 CSS 后必须重新运行 Step 1 并确认所有指标通过。

**最小验证命令**（验证卡片高度差）：

```javascript
// Playwright 快速验证
async (page) => {
  await page.goto('https://skills.lute-tlz-dddd.top/skills/index.html', {waitUntil:'networkidle'});
  return await page.evaluate(() => {
    const byRow = {};
    document.querySelectorAll('.skill-card').forEach(c => {
      const top = Math.round(c.getBoundingClientRect().top);
      byRow[top] = byRow[top] || [];
      byRow[top].push(Math.round(c.getBoundingClientRect().height));
    });
    return Object.entries(byRow).slice(0,5).map(([top,hs]) => ({
      top:+top, heights:hs, variance: Math.max(...hs)-Math.min(...hs)
    }));
  });
}
```

**通过标准**：所有行的 `variance = 0`。
