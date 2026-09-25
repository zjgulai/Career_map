---
name: paper2skills-ps-override
description: |
  为 paper2skills Skill 卡片批量生成业务导向的 problem_solved 句，
  写入 skill_ps_override.yaml。触发场景：「写业务语言」「ps_override」
  「problem_solved 重写」「WARN dup_ps」「新增 Skill 的业务描述」。
  封装了 3 天内重复添加 ~30 条的固定写作流程。
---

# paper2skills-ps-override

为 Skill 卡片生成并写入业务导向的 `problem_solved` 句。

## 背景

`skill_ps_override.yaml` 包含 208 条覆盖配置。当 build 报告出现：
```
WARN dup_ps: Skill-XXX — problem_solved==algorithm_summary
```
意味着该 Skill 的首页展示文字是技术摘要，而非业务痛点句，需要写入 override。

---

## 文件路径

```
/Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/config/skill_ps_override.yaml
```

---

## Step 1：识别需要 override 的 Skill

```bash
# 运行 build，收集所有 WARN dup_ps
cd /Users/lute/project/paper_to_skills
python3 paper2skills-skills/playbook-generator/scripts/build_playbook.py \
  --root . --vault paper2skills-vault --out playbook 2>&1 | grep "WARN dup_ps" | sed 's/WARN dup_ps: //' | sed 's/ — .*//'
```

---

## Step 2：读取 Skill 卡片内容

```bash
# 批量读取场景内容（从②应用案例 section 提取业务背景）
python3 - << 'PYEOF'
import os, re

vault = '/Users/lute/project/paper_to_skills/paper2skills-vault'
skill_name = 'Skill-XXX'  # 替换为目标 Skill 名

for domain in os.listdir(vault):
    fp = os.path.join(vault, domain, skill_name + '.md')
    if os.path.exists(fp):
        with open(fp, 'rb') as f:
            c = f.read().decode('utf-8', errors='replace')
        m = re.search(r'##\s+[②]?.*(应用案例|业务应用)[^\n]*\n+(.*?)(?:\n##|\Z)', c, re.DOTALL)
        if m:
            print(m.group(2)[:300])
        break
PYEOF
```

---

## Step 3：写作公式

**标准格式**：
```
{业务角色}面临{具体痛点场景}——{算法/方法}将{量化改善A}压缩到{量化改善B}，年化{ROI数字}
```

**10 条高质量示例**（从现有 208 条提取）：

```
Skill-Agent-Fault-Tolerance: WF-A 补货 Agent 调用库存 API 超时，若无容错机制则整个补货决策链中断——Circuit Breaker + 指数退避可将 API 抖动故障恢复时间从小时级压缩到秒级，保护运营 SLA
Skill-KOL-ROI-Causal-Attribution: 月 KOL 投放 30 万元，naive 归因显示 ROAS 3.5，但无法区分「因 KOL 才购买」和「本来就会买顺路点了链接」——PSM+DiD 因果归因将头部 KOL iROAS 从 4.2 修正为 1.8，将 30 万预算转向腰部 KOL 后年化增量 GMV 提升 44%
Skill-FBA-Fee-Intelligence: FBA 月账单 15 万元但不知道哪些 SKU 费用异常——五层费用拆解（头程/仓储/长库龄/移仓/退货）到 SKU 粒度，长库龄 270 天提前预警，年化减少 LTSF 5-20 万元
Skill-HTS-Tariff-Classification: 吸奶器套装被默认归类为液体泵（关税 3%）而非呼吸治疗器具（0%），每年多付 15 万元关税——AI 驱动 HTS 精准分类识别节税机会，配合 CBP Binding Ruling 申请实现合规节税 20-200 万元/年
```

**写作要点**：
- ✅ 有具体业务场景（「大促前」「吸奶器」「月 GMV 200 万」）
- ✅ 有对比数字（「3.5 → 1.8」「80% 降至 2%」）
- ✅ 有年化 ROI（「年省 15 万」「年增量 GMV +44%」）
- ❌ 不写技术名词堆砌（「基于 PSM 的因果推断框架」）
- ❌ 不写模糊词（「大幅提升」「显著改善」）

---

## Step 4：批量追加到 YAML

```bash
cat >> /Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/config/skill_ps_override.yaml << 'EOF'
Skill-XXX: {业务角色}面临{具体场景}——{方法}将{A}改善为{B}，年化{ROI}
Skill-YYY: ...
EOF
echo "✅ 追加完成，当前条数: $(grep -c '^Skill-' /Users/lute/project/paper_to_skills/paper2skills-skills/playbook-generator/scripts/config/skill_ps_override.yaml)"
```

---

## Step 5：验证

```bash
cd /Users/lute/project/paper_to_skills
python3 paper2skills-skills/playbook-generator/scripts/build_playbook.py \
  --root . --vault paper2skills-vault --out playbook 2>&1 | grep "WARN dup_ps" | wc -l
# 预期输出：0
```

---

## 批量脚本（一次处理多个 Skill）

```python
# 放到 /tmp/batch_ps.py 运行
import os, re

vault = '/Users/lute/project/paper_to_skills/paper2skills-vault'
targets = ['Skill-A', 'Skill-B']  # 填入目标 Skill 名

for name in targets:
    for domain in os.listdir(vault):
        fp = os.path.join(vault, domain, name + '.md')
        if os.path.exists(fp):
            with open(fp, 'rb') as f:
                c = f.read().decode('utf-8', errors='replace')
            # 提取②应用案例前2行
            m = re.search(r'##\s+[②]?.*(应用案例|业务应用)[^\n]*\n+(.*?)(?:\n##|\Z)', c, re.DOTALL)
            scenario = ''
            if m:
                lines = [l.strip() for l in m.group(2).split('\n') if l.strip() and not l.startswith('`')]
                scenario = ' '.join(lines[:2])[:200]
            print(f'=== {name} ===')
            print(f'scenario: {scenario}')
            print()
            break
```
