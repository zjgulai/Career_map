---
name: dtc-compliance-3track
description: >
  DTC 产品上架前的合规三轨交叉验证 SOP：
  Track 1 = Sisyphus 全量 grep 扫描（含大小写变体）；
  Track 2 = Reality Checker subagent 逐条判例；
  Track 3 = Legal Compliance Checker 多机构交叉验证（FDA + EPA + FTC）。
  三轨缺一不可——任何单轨都会漏报。
  触发场景：「ToV 字典审查」「合规检查」「上架前法规」「SOP-B Step 5」「Brand Guardian 交付后」
  「措辞审查」「UV-C/健康/IoT 类产品品牌文案」。
triggers:
  - "合规检查"
  - "ToV 审查"
  - "法规审查"
  - "上架前检查"
  - "SOP-B Step 5"
  - "measures review"
  - "compliance audit"
  - "brand copy review"
version: 1.0.0
created: 2026-05-25
source_lessons:
  - lesson_brand-tov-must-cross-validate-with-multi-regulator
  - lesson_three-track-cross-validation-no-single-source-of-truth
  - lesson_regulatory-precedent-non-transferability-across-tech
source_decisions:
  - dec_20260515_sop-b-step5-legal-audit-approved-with-conditions
  - dec_20260516_legal-re-audit-uvc-vs-steam-not-transferable
  - dec_20260516_sop-b-step6-v2.3-a-trail-pass
---

# dtc-compliance-3track

DTC 产品上架合规三轨交叉验证 SOP。

## 核心教训（为什么三轨必须同时跑）

| 事件 | 漏报方 | 漏报原因 |
|---|---|---|
| Momcozy SOP-B v2 | Sisyphus grep | 大小写不敏感设置，`Sterile Storage` 漏 4 处 |
| Momcozy SOP-B v2.2 | Reality Checker | 未扫 `food-grade`，漏 2 处 |
| Brand Guardian Step 1 | Brand Guardian | 只查了 FDA，未查 EPA；`UV purification` 是 EPA FIFRA 触发词 |
| Momcozy 蒸气线先例迁移 | Sisyphus | 蒸气线合规不代表 UV-C 线合规，技术类型不同监管框架不同 |

**结论**：单轨验证漏项率 > 30%。三轨交叉才能将 PDP 违规残留降到 0。

---

## 触发条件

任意满足一条即触发本 Skill：

1. Brand Guardian / Marketing 交付了 ToV 字典或文案草稿
2. UI Designer 完成了 Mockup / PDP HTML
3. 用户说「帮我检查一下合规性」「这段文案可以用吗」
4. SOP-B Step 5 (Legal Audit) 开始前
5. 现有品牌推**新技术类**（UV-C / IoT / AR / 健康声明类）SKU

---

## Step 0：产品类型定级

```
产品类型 → 监管机构矩阵
──────────────────────────────────────────────────
UV-C / 紫外线类   → FDA 21 CFR 1000-1004 + EPA FIFRA + FTC §5
蒸气消毒类        → FDA 21 CFR 1040（家电） + FIFRA 豁免 + FTC §5
含 IoT / 数据类   → FDA + HIPAA + GDPR（如含欧洲市场）
普通家电/玩具类   → CPSIA + ASTM F963 + FTC §5
健康/功效声明类   → FDA + FTC §5 + NAD
```

> ⚠️ **关键警告**：同一品牌不同技术类 SKU，监管框架完全不同。
> Momcozy 蒸气线可用「Sterilize」，但 UV-C 线必须用「UV-C Care」。
> 先例不可跨技术类迁移。

---

## Track 1：Sisyphus 全量 grep 扫描

**必须使用 `-i`（大小写不敏感）+ 多词并行扫**

```bash
# 基础违规词扫描（UV-C 类产品）
grep -niE \
  "steril(ize|ization|ized|izer|izing)|sanitize|kills? (99|100)%|medical.grade|FDA.certif|UV.purif|food.grade|zero.worry|germ.free" \
  <target_file>

# 扩展词（FTC §5 夸大声明）
grep -niE \
  "clinically.proven|doctor.recommended|scientifically.tested|100%.safe|completely.eliminates" \
  <target_file>

# 豁免词确认（合法使用的）
grep -niE \
  "tested.to.reduce|designed.to.meet|in.laboratory.testing|IEC.62471|21.CFR" \
  <target_file>
```

**Track 1 通过条件**：违规词区段 = 0 命中；豁免词每处都有星号注释 `*`。

---

## Track 2：Reality Checker 逐条判例

**启动方式**：

```
task(
  subagent_type="build",  # 需配置为 Reality Checker 人格
  load_skills=["dtc-compliance-3track"],
  prompt="""
    你是 Reality Checker。对以下 HTML/文案进行逐条合规判例。
    
    产品类型：[填写，如 UV-C 婴儿消毒柜]
    目标市场：[美国 / 欧盟 / 双市场]
    文件路径：[填写]
    
    检查清单（必须逐项）：
    1. 所有「功效声明」是否有数据支持或合规免责声明
    2. 是否出现 EPA FIFRA 触发词（UV purification / kills bacteria / antimicrobial）
    3. 是否出现 FDA 21 CFR 801 医疗器械声明（sterilize / medical-grade / FDA cleared）
    4. 是否出现 FTC §5 夸大声明（clinically proven / doctor recommended）
    5. 图片 alt text 是否与文案一致（防止视觉绕过文字审查）
    6. Disclaimer 脚注是否覆盖所有带星号的声明
    
    产出：每条「PASS / FAIL / GREY」 + 修改建议
  """
)
```

**Track 2 通过条件**：所有 P0 项 PASS；P1 GREY 项有修改方案；P2 可记录待后续处理。

---

## Track 3：Legal Compliance Checker 多机构交叉验证

**仅在以下情况下启动**（避免过度调用 expensive subagent）：

- 产品涉及「功效声明」（kills / purifies / sterilizes / sanitizes / reduces germs）
- 产品技术类型特殊（UV-C、抗菌材料、电磁、IoT 数据采集）
- 现有品牌推新技术类 SKU（先例不可迁移，必须独立审）

**Prompt 框架**：

```
[CONTEXT] 产品：[名称]。技术类型：[UV-C / 蒸气 / 其他]。
目标市场：[US / EU / Both]。
当前品牌在相似产品上使用了：[列出已有措辞]。

[GOAL] 验证以下 ToV 字典词汇在本技术类型下是否合规：
[列出待验证词汇]

[REQUIRED CHECK]
1. FDA 21 CFR 相关条款
2. EPA FIFRA（特别是 antimicrobial claim 定义）
3. FTC §5 & 16 CFR 700-703（保修/声明）
4. EU MDR 2017/745（如欧洲市场）
5. 对比：同品牌其他技术类产品的已有措辞是否可迁移

[OUTPUT] 每个词汇：SAFE / GREY / BLOCKED + 替代建议 + 法规引用
```

**Track 3 通过条件**：无 BLOCKED 词汇进入 PDP；GREY 词汇有 Disclaimer 覆盖。

---

## 三轨汇总与决策

```
三轨结果矩阵
──────────────────────────────────────
Track 1 PASS + Track 2 PASS + Track 3 PASS → GO（可上架）
任一 FAIL → NEEDS_WORK（返回修改）
Track 2/3 GREY（全部有 Disclaimer）→ CONDITIONAL GO
Track 3 BLOCKED → HOLD（必须改措辞后重审）
```

**最终报告模板**：

```markdown
## 合规三轨验证报告

**产品**：[名称]
**日期**：[YYYY-MM-DD]
**整体状态**：GO / NEEDS_WORK / CONDITIONAL GO / HOLD

### Track 1：grep 扫描
- 违规命中：[数量] 处
- 豁免词：[数量] 处，均有 Disclaimer ✅/❌
- 残留问题：[列出]

### Track 2：Reality Checker 判例
- P0 FAIL：[数量]
- P1 GREY：[数量]
- 关键发现：[描述]

### Track 3：Legal 多机构交叉
- BLOCKED 词汇：[列出]
- GREY 词汇：[列出 + Disclaimer 状态]
- 先例迁移警告：[如有]

### 修改动作清单
| 优先级 | 位置 | 当前文本 | 修改为 |
|---|---|---|---|
| P0 | | | |
```

---

## 常用合规替代词速查表（UV-C 类）

| ❌ 违规词 | ✅ 替代词 | 触发法规 |
|---|---|---|
| UV purification | UV-C light cycle / sealed UV-C chamber | EPA FIFRA |
| Sterilize / Sterilization | UV-C Care / Treatment Cycle | FDA 21 CFR 801 |
| Kills 99.9% germs | Tested to reduce 99% of common germs in laboratory testing* | FIFRA + FTC |
| Food-grade [未认证] | 304/316 stainless steel | FTC |
| Medical-grade | [需 510K 才可用] | FDA |
| Zero worry | [删除] | FTC §5 |
| Sterile storage | Sealed storage / Protected storage | FDA |
| FDA certified | Designed to meet FDA 21 CFR framework | FDA |

---

## 附：SOP-B Step 1.5 规则（Brand Guardian 交付后必走）

Brand Guardian 交付 ToV 字典后，**不得直接进入 Step 2（生图）**。
必须先走 Step 1.5：

1. Sisyphus 对 ToV 字典每个词跑 Track 1 grep
2. Legal Compliance Checker 对功效声明词跑 Track 3
3. 全部 PASS/CONDITIONAL GO 后才解锁 Step 2

**尤其当产品涉及多个监管机构时**（UV 类、抗菌材料、健康声明）——Brand Guardian 只关注了一个监管机构，Legal 才会发现另一个机构的雷区。
