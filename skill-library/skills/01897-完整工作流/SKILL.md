---
name: paper2skills-workflow
description: |
  paper2skills 完整端到端工作流：选题 → 图谱缺口分析 → Skill 萃取 →
  代码验证 → 质量审核 → ps_override 补写 → 图谱注册 → Playbook 构建部署。
  触发场景：「跑一下工作流」「我有一个选题」「萃取这篇论文」「新增 Skill」
  「我要做 XX 方向的 Skill」「按照完整流程执行」。
  这是 paper2skills 项目的标准操作手册，包含你应当提供什么、我做什么。
---

# paper2skills 完整工作流

> **一句话**：你提供选题意图或具体论文，我负责从分析到上线的全部环节。

---

## 你需要提供什么

| 提供方式 | 示例 | 我的处理 |
|---------|------|---------|
| **主题方向** | "做一个 KOL 归因方向的 Skill" | 我来搜索论文、选题、完整执行 |
| **arXiv ID** | "arXiv: 2601.14711" | 我直接从该论文萃取 |
| **论文标题** | "AutoBidding for Ads" | 我搜索确认后萃取 |
| **业务场景** | "母婴备货预测精度太低" | 我推荐匹配论文并萃取 |
| **批量需求** | "补齐供应链域到 25 个 Skill" | 我运行图谱缺口分析，批量执行 |

---

## 完整工作流（9 步）

```
Phase 0: 选题确认
  ├── Step 0A: 图谱缺口分析（可选，主题不明确时）
  └── Step 0B: 论文选题确认

Phase 1: Skill 创建
  ├── Step 1: 论文内容获取
  ├── Step 2: Skill 卡片萃取（5 模块）
  ├── Step 3: 代码模板验证
  └── Step 4: 质量审核评分

Phase 2: 知识图谱注册
  ├── Step 5: frontmatter 注入 + ps_override 写入
  └── Step 6: 图谱关系声明

Phase 3: 发布上线
  ├── Step 7: Playbook build + 验证
  ├── Step 8: 部署到生产
  └── Step 9: git commit
```

---

## Phase 0：选题确认

### Step 0A：图谱缺口分析（主题不清晰时自动触发）

```bash
# 读取当前图谱状态
cat /Users/lute/project/paper_to_skills/skills_graph_report.md | head -60

# 统计各域现状
python3 -c "
import os
vault = '/Users/lute/project/paper_to_skills/paper2skills-vault'
for d in sorted(os.listdir(vault)):
    dp = os.path.join(vault, d)
    if not os.path.isdir(dp): continue
    n = len([f for f in os.listdir(dp) if f.startswith('Skill-') and f.endswith('.md')])
    if n: print(f'{n:3d}  {d}')
"
```

**输出**：推荐填补的域/方向（Skill 数 < 5 的薄弱域优先）

### Step 0B：论文选题确认

使用 `paper-选题` skill 搜索候选论文，确认：
- arXiv ID
- 论文标题
- 归属域（如 `15-营销投放分析`）
- 拟定 Skill 名（`Skill-XXX-YYY`）

**选题硬门槛**：
- ≥2026 年或高引用 2024/2025 年论文
- 有开源代码或可复现实验
- 业务场景评分 ≥ 7/10
- 不是 survey / review / meta-analysis

---

## Phase 1：Skill 创建

### Step 1：论文内容获取

```bash
# 用 anysearch skill 或直接 fetch
# 优先级：arXiv abstract → PDF 全文 → Semantic Scholar

# 需要提取的信息：
# - 标题、作者、年份、arXiv ID
# - 核心算法（伪代码/数学公式）
# - 实验设置和关键结果
# - 开源代码链接（如有）
```

### Step 2：Skill 卡片萃取

**参照 MasterPrompt**：`/Users/lute/project/paper_to_skills/paper2skills-vault/07-资源库/MasterPrompt.md`

**Skill 文件路径**：
```
/Users/lute/project/paper_to_skills/paper2skills-vault/{域目录}/Skill-{名称}.md
```

**完整 5 模块结构**（每个模块都必须有实质内容）：

```markdown
---
title: {算法名} — {一句话描述}
doc_type: knowledge
module: {XX-域名称}
topic: {kebab-case-topic}
status: stable
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
owner: self
source: human+ai
roadmap_phase: {phase1|phase2|phase3}
---

# Skill Card: {算法名}

> **论文**：{论文标题}
> **arXiv**：{ID} | {年份} | **桥梁**: {域A} ↔ {域B} | **类型**: {跨域融合|算法工具|工程基础}

## ① 算法原理
[核心思想 ≤300字，含数学直觉，业务语言]

## ② 母婴出海应用案例
**场景A：{具体业务场景}**
- 业务问题：{痛点}
- 数据要求：{具体数据}
- 预期产出：{量化结果}
- 业务价值：{ROI 估算}

## ③ 代码模板
```python
# 完整可运行代码，含示例数据和测试用例
```

## ④ 技能关联
- **前置**：[[Skill-XXX]]
- **延伸**：[[Skill-YYY]]
- **组合**：[[Skill-ZZZ]]（组合场景说明）

## ⑤ 商业价值评估
- ROI 预估：{量化数字}
- 实施难度：⭐⭐⭐☆☆
- 优先级：⭐⭐⭐⭐☆
```

**roadmap_phase 映射**：
| 域 | phase |
|---|---|
| 01/02/03/04/12/13/19/21/22/23 | phase1（快赢）|
| 05/06/08/09/14/15/18 | phase2（可持续）|
| 10/11/16/17/20 | phase3（智能化）|

### Step 3：代码模板验证（强制）

```bash
# 语法检查
python3 -c "
import ast, re
fp = '/Users/lute/project/paper_to_skills/paper2skills-vault/{域}/{Skill名}.md'
with open(fp, 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')
blocks = re.findall(r'\`\`\`python\n(.*?)\`\`\`', content, re.DOTALL)
for i, blk in enumerate(blocks):
    try:
        ast.parse(blk)
        print(f'✅ block {i+1}: syntax OK')
    except SyntaxError as e:
        print(f'❌ block {i+1}: {e}')
"

# 运行验证（最小测试）
cd /Users/lute/project/paper_to_skills
python3 -c "exec(open('paper2skills-vault/{域}/{Skill名}.md').read().split('\`\`\`python')[1].split('\`\`\`')[0])"
```

**通过标准**：无 SyntaxError，代码可执行，最后一行输出 `[✓] XXX 测试通过`

### Step 4：质量审核评分

对照以下 checklist 打分（满分 10，≥7 通过）：

```
算法原理 (2.5分)：
  [ ] 用自己的话重述，非复制摘要
  [ ] 有数学直觉解释（公式+含义）
  [ ] 说明使用条件/假设

应用案例 (2.5分)：
  [ ] 场景具体（有品类/数字，如"吸奶器"而非"某产品"）
  [ ] ROI 有量化依据（万元/百分比）
  [ ] 数据要求明确可获取

代码 (2.5分)：
  [ ] 可直接运行（无缺失 import）
  [ ] 含示例数据（无需外部文件）
  [ ] 末尾有 [✓] 测试通过输出

技能关联 (1分)：
  [ ] 至少 2 条 [[双括号]] 关联
  [ ] 有 prerequisite/extends/combinable 明确分类

商业价值 (1.5分)：
  [ ] ROI 数字（不是"较高"这类模糊词）
  [ ] 难度和优先级有依据
```

**如果 < 7 分**：返回 Step 2 修改对应维度。

---

## Phase 2：知识图谱注册

### Step 5：frontmatter 完整性 + ps_override 写入

**5A：确认 frontmatter 完整**

```bash
python3 - << 'PYEOF'
import re
fp = '/Users/lute/project/paper_to_skills/paper2skills-vault/{域}/{Skill名}.md'
with open(fp, 'rb') as f:
    c = f.read().decode('utf-8', errors='replace')
required = ['title','doc_type','module','topic','status','created','updated','owner','source','roadmap_phase']
if c.startswith('---'):
    end = c.find('\n---\n', 4)
    fm = c[4:end]
    for field in required:
        ok = field + ':' in fm
        print(f"{'✅' if ok else '❌'} {field}")
PYEOF
```

**5B：写入 ps_override**（防止 WARN dup_ps）

格式规范：`{具体业务场景}——{方法}将{A}改善为{B}，年化{ROI}`

```bash
cat >> /Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/config/skill_ps_override.yaml << 'EOF'
{Skill-名称}: {业务角色}面临{具体场景}——{方法}将{指标A}改善为{指标B}，年化{ROI数字}
EOF

# 验证
python3 /Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/build_playbook.py \
  --root /Users/lute/project/paper_to_skills \
  --vault paper2skills-vault --out playbook 2>&1 | grep "WARN dup_ps.*{Skill名}"
# 预期：无输出（无警告）
```

### Step 6：图谱关系声明

在 Skill 的 `④ 技能关联` 中确认：

```markdown
## ④ 技能关联
- **前置（prerequisite）**：[[Skill-基础依赖]]
- **延伸（extends）**：[[Skill-应用扩展]]
- **可组合（combinable）**：[[Skill-协同技能]]（说明组合场景）
```

**检查标准**：至少 2 条，且关联的 Skill 名在 vault 中真实存在。

---

## Phase 3：发布上线

### Step 7：Playbook Build + 验证

```bash
cd /Users/lute/project/paper_to_skills

# 语法检查
python3 -c "import ast; ast.parse(open('paper2skills-skills/playbook-generator/scripts/build_playbook.py').read()); print('✅ syntax OK')"

# 全量 build
python3 paper2skills-skills/playbook-generator/scripts/build_playbook.py \
  --root . --vault paper2skills-vault --out playbook 2>&1 | tail -8

# 验收标准：
# - skill_pages >= {之前数量 + 新增数量}
# - WARN dup_ps: 0
# - 无 Error / SyntaxError
```

### Step 8：部署到生产

```bash
cd /Users/lute/project/paper_to_skills/playbook

# 按修改范围选择打包粒度
# 仅改 Skill 卡片 → 完整包（含 skills/）
tar -czf /tmp/pb_deploy.tar.gz \
  assets/ domains/ graph/ playbooks/ topics/ workflows/ skills/ \
  agents.html ai-roadmap.html index.html chat.html build-report.json README.md

# 上传
rsync -avz --timeout=60 \
  -e "ssh -i /Users/lute/project/paper_to_skills/ai_video.pem -o StrictHostKeyChecking=no" \
  /tmp/pb_deploy.tar.gz ubuntu@101.34.52.232:/tmp/ 2>&1 | tail -2

# 服务器解压
ssh -i /Users/lute/project/paper_to_skills/ai_video.pem \
  -o StrictHostKeyChecking=no ubuntu@101.34.52.232 "
    rm -rf /opt/paper2skills/html/*
    tar -xzf /tmp/pb_deploy.tar.gz -C /opt/paper2skills/html/
    rm /tmp/pb_deploy.tar.gz
    echo 'deployed:' \$(find /opt/paper2skills/html -type f | wc -l) files
"

# 线上验证
python3 -c "
import urllib.request, ssl, json
ctx = ssl.create_default_context()
r = json.loads(urllib.request.urlopen('https://skills.lute-tlz-dddd.top/build-report.json', timeout=8, context=ctx).read())
print(f'✅ Live: {r[\"skill_pages\"]} Skills / {r[\"domains\"]}域 / {r[\"edges\"]}边')
"
```

### Step 9：git commit

```bash
cd /Users/lute/project/paper_to_skills
git add paper2skills-vault/ \
        paper2skills-skills/playbook-generator/scripts/config/ \
        paper2skills-skills/paper-workflow/definitions/
git commit -m "feat(skill): 新增 {Skill名称}（{域}）

- {核心算法}：{一句话描述}
- 业务场景：{应用场景}
- ROI：{量化数字}
- 图谱桥接：{域A} ↔ {域B}
- 代码验证：✅ 通过
- ps_override：✅ 已写入"
git push origin main
```

---

## 快速核对表（每次执行前确认）

```
[ ] 选题已确认（arXiv ID + 域 + Skill 名）
[ ] 5 模块内容完整（无"暂无"/"TBD"）
[ ] 代码可运行（末尾有 [✓] 输出）
[ ] 质量分 ≥ 7
[ ] frontmatter 含 roadmap_phase
[ ] ps_override 已写入（build 无 dup_ps WARN）
[ ] 至少 2 条图谱关联（真实存在的 Skill）
[ ] build skill_pages 比之前多
[ ] 部署验证 HTTP 200
[ ] git commit 已推送
```

---

## 常见问题处理

| 问题 | 处理方式 |
|------|---------|
| 代码 SyntaxError | 修复后重跑验证，不得跳过 |
| 质量分 < 7 | 找到扣分项，重写对应模块 |
| WARN dup_ps | 补写 ps_override，必须消除 |
| skill_pages 未增加 | 检查新域是否在 CLAUDE.md domain table 中注册 |
| build 报错 | `python3 -c "import ast; ast.parse()"` 先做语法检查 |
| 图谱关联不存在 | 把关联改为真实存在的 Skill，或先创建前置 Skill |

---

## 批量执行模式（多个 Skill 时）

当需要批量创建（如"补充供应链域 5 个 Skill"）时：

1. **先运行图谱缺口分析**（Step 0A）确定优先级
2. **并行萃取**：同域的多个 Skill 可并行写作
3. **统一 build 一次**：全部写完后一次 build，不要每个 Skill 都 build
4. **批量 ps_override**：集中追加，不要一条一条追加
5. **一次性 commit**：所有 Skill 一个 commit，commit message 列出清单

```bash
# 批量 ps_override 追加示例
cat >> /Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/config/skill_ps_override.yaml << 'EOF'
Skill-A: ...业务句...
Skill-B: ...业务句...
Skill-C: ...业务句...
EOF
```

---

## 与其他 skill 的协作关系

```
paper-skills-gap-analysis    → 输出选题候选清单
       ↓
paper2skills-workflow（本 skill）  → 端到端执行
       ↓ 
paper2skills-deploy          → 可单独调用部署步骤
paper2skills-ui-audit        → 可单独调用 UI 验证
paper2skills-ps-override     → 可单独调用业务语言写入
```
