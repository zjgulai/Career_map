---
name: paper2skills-deploy
description: |
  paper2skills Playbook 标准 build → 部署 → 验证 SOP。
  触发场景：「部署」「build 并上线」「deploy playbook」「更新生产环境」
  「build 后发布」。封装了 3天内重复执行 12+ 次的 5 步部署流程。
---

# paper2skills-deploy

paper2skills Playbook 从本地修改到生产环境上线的标准流程。

## 项目信息

| 项目 | 值 |
|---|---|
| 项目根目录 | `/Users/lute/project/paper_to_skills` |
| 生产 URL | `https://skills.lute-tlz-dddd.top/` |
| 服务器 | `ubuntu@101.34.52.232` |
| SSH 密钥 | `ai_video.pem`（项目根目录） |
| 静态文件路径 | `/opt/paper2skills/html/` |
| Build 脚本 | `paper2skills-skills/playbook-generator/scripts/build_playbook.py` |

---

## 标准 5 步部署 SOP

### Step 0：前置检查（可选，有疑问时执行）

```bash
cd /Users/lute/project/paper_to_skills
python3 -c "import ast; ast.parse(open('paper2skills-skills/playbook-generator/scripts/build_playbook.py').read()); print('✅ syntax OK')"
```

### Step 1：Build

```bash
cd /Users/lute/project/paper_to_skills
python3 paper2skills-skills/playbook-generator/scripts/build_playbook.py \
  --root . --vault paper2skills-vault --out playbook 2>&1 | tail -8
```

**验收标准**：输出 `"skill_pages": 360`（或更多），无 `WARN dup_ps`，无 Error。

### Step 2：打包

根据修改范围选择打包粒度：

```bash
# 完整部署（含 skills/）— 修改了 Skill 卡片时用
cd /Users/lute/project/paper_to_skills/playbook
tar -czf /tmp/playbook_full.tar.gz \
  assets/ domains/ graph/ playbooks/ topics/ workflows/ skills/ solutions/ \
  *.html build-report.json README.md

# 仅核心（不含 skills/）— 仅改 CSS/JS/HTML 模板时用
tar -czf /tmp/playbook_core.tar.gz \
  assets/ domains/ graph/ playbooks/ topics/ workflows/ solutions/ \
  *.html build-report.json README.md
```

### Step 3：上传

```bash
rsync -avz --timeout=60 \
  -e "ssh -i /Users/lute/project/paper_to_skills/ai_video.pem -o StrictHostKeyChecking=no" \
  /tmp/playbook_full.tar.gz ubuntu@101.34.52.232:/tmp/ 2>&1 | tail -3
# 视情况替换 playbook_full.tar.gz 为 playbook_core.tar.gz
```

### Step 4：服务器解压

```bash
ssh -i /Users/lute/project/paper_to_skills/ai_video.pem \
  -o StrictHostKeyChecking=no \
  ubuntu@101.34.52.232 "
    rm -rf /opt/paper2skills/html/*
    tar -xzf /tmp/playbook_full.tar.gz -C /opt/paper2skills/html/
    rm /tmp/playbook_full.tar.gz
    echo 'Files:' \$(find /opt/paper2skills/html -type f | wc -l)
"
```

### Step 5：线上验证

```bash
python3 -c "
import urllib.request, ssl, json
ctx = ssl.create_default_context()
checks = [
    ('https://skills.lute-tlz-dddd.top/', '首页'),
    ('https://skills.lute-tlz-dddd.top/build-report.json', 'build报告'),
    ('https://skills.lute-tlz-dddd.top/chat.html', 'AI对话'),
]
for url, name in checks:
    try:
        resp = urllib.request.urlopen(url, timeout=8, context=ctx)
        body = resp.read()
        if 'build' in url:
            r = json.loads(body)
            print(f'✅ {name}: {r[\"skill_pages\"]} Skills / {r[\"domains\"]}域')
        else:
            print(f'✅ {name}: {resp.status} ({len(body):,}b)')
    except Exception as e:
        print(f'❌ {name}: {e}')
"
```

---

## 快速一键脚本（核心部署，最常用）

```bash
cd /Users/lute/project/paper_to_skills && \
python3 -c "import ast; ast.parse(open('paper2skills-skills/playbook-generator/scripts/build_playbook.py').read()); print('✅ syntax')" && \
python3 paper2skills-skills/playbook-generator/scripts/build_playbook.py --root . --vault paper2skills-vault --out playbook 2>&1 | tail -5 && \
cd playbook && tar -czf /tmp/pb_core.tar.gz assets/ domains/ graph/ playbooks/ topics/ workflows/ skills/ solutions/ *.html build-report.json README.md && \
rsync -avz --timeout=30 -e "ssh -i /Users/lute/project/paper_to_skills/ai_video.pem -o StrictHostKeyChecking=no" /tmp/pb_core.tar.gz ubuntu@101.34.52.232:/tmp/ 2>&1 | tail -2 && \
ssh -i /Users/lute/project/paper_to_skills/ai_video.pem -o StrictHostKeyChecking=no ubuntu@101.34.52.232 "
  rm -rf /opt/paper2skills/html/* && tar -xzf /tmp/pb_core.tar.gz -C /opt/paper2skills/html/ && rm /tmp/pb_core.tar.gz
  echo 'deployed:' \$(find /opt/paper2skills/html -type f | wc -l) files
" && \
python3 -c "
import urllib.request, ssl, json; ctx = ssl.create_default_context()
r = json.loads(urllib.request.urlopen('https://skills.lute-tlz-dddd.top/build-report.json', timeout=8, context=ctx).read())
print(f'✅ Live: {r[\"skill_pages\"]} Skills / {r[\"domains\"]}域 / {r[\"edges\"]}边')
"
```

---

## git commit 标准格式

```bash
git add -u && git commit -m "fix/feat/refactor(scope): 变更说明" && git push origin main
```

commit 类型：`feat` 新功能 | `fix` 修复 | `refactor` 重构 | `chore` 工程 | `docs` 文档

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| `syntax error` | Python 语法问题 | Step 0 检查后修复 |
| `rsync: timeout` | 网络超时 | 增大 `--timeout=60`，分开传 core 和 skills |
| 部署后页面未更新 | 浏览器缓存 | 强刷 Ctrl+Shift+R；或检查 tar 是否包含正确文件 |
| `skill_pages: 358` 比预期少 | 新域未注册 | 在 `CLAUDE.md` domain table 中添加新域，重跑 |
| `/api/chat` 502 | nginx 未 reload | `docker exec ai_video_nginx nginx -s reload` |
