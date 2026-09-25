---
name: brand-knowledge-base-builder
description: >
  AI 可读品牌知识库（L1-L11）结构化萃取 SOP：从官网/社交/竞品数据出发，
  通过引导对话确认品牌原型、语调人设、视觉锚点、产品痛点矩阵、场景模板，
  最终输出 AI 可执行的 `_ai_brand_knowledge_base.md` + `_design_tokens.json`。
  适用于：现有品牌入库（对齐现行调性）和新品牌创建（从零建立）两条路径。
  触发场景：「建立品牌知识库」「品牌 AI 化」「品牌调性萃取」「新品牌入库」
  「为 XX 品牌建立 AI 框架」「品牌规范 AI 化」「给 AI 喂品牌」。
triggers:
  - "品牌知识库"
  - "品牌 AI 化"
  - "品牌调性"
  - "AI 品牌框架"
  - "L1-L11"
  - "brand knowledge base"
  - "brand AI framework"
  - "新品牌建立"
version: 1.0.0
created: 2026-05-25
source_sessions:
  - ses_1db99f65bffeuSv3S5Onwz6RF0  # Momcozy 全量品牌知识库构建
source_evidence:
  - 10 个品牌的 _ai_brand_knowledge_base.md 均通过此流程生成
  - Momcozy L1-L11 全程对话引导（2026-05-14）
---

# brand-knowledge-base-builder

AI 可读品牌知识库（L1-L11）结构化萃取 SOP。

## 核心前提：两条路径

```
收到「为某品牌建立知识库」请求时，第一步是确认路径：

路径 A（现有品牌）：品牌已存在 → 先 dtc-brand-recon 侦查 → 再填充 L1-L11
路径 B（新品牌）   ：从零创建   → 直接走引导对话 → 构建 L1-L11
```

> ⚠️ 路径选错代价极高。参见 `lesson_brand-recon-before-design-existing-vs-greenfield`：
> Momcozy 案例中，因未确认路径，在「新品牌 Seren」框架下做了 7 个 SOP-B Step，后发现是现有品牌，30-50% 工作需重做。

---

## 知识库框架：L1-L11 层级说明

| 层级 | 名称 | AI 作用 | 关键产出 |
|---|---|---|---|
| **L1** | 核心精神 Brand Core | AI 思考的世界观 | 品牌原型 + 使命宣言 + 终极价值 |
| **L2** | 语调与人设 Tone & Persona | AI 说话的性格 | Do's/Don'ts + 高频词库 + 绝对禁区 |
| **L3** | 视觉锚点 Visual Anchors | AI 画图的基因 | 色彩密码 + 光影 + 材质 + 负面提示词 |
| **L4** | 产品与痛点 Products & Solutions | AI 卖货的弹药 | 产品矩阵 + 深度痛点 + 转化话术 |
| **L5** | 场景与情绪 Scenarios & Vibes | AI 创作的舞台 | 典型场景 + 情绪标签 + Master Prompt |
| **L6** | 竞品定位 Competitive Positioning | AI 差异化的武器 | 竞品对比矩阵 + 禁止跟风词汇 |
| **L7** | 受众画像 Audience Personas | AI 沟通的对象 | 3-4 个细分画像（世代/地区/心理） |
| **L8** | 渠道规则 Channel Rules | AI 适配不同平台的规则 | 各平台字数/格式/禁忌词 |
| **L9** | 合规护城河 Compliance Moat | AI 内容创作的法律边界 | 品类特定法规 + 安全替代词表 |
| **L10** | 内容日历 Content Calendar | AI 计划创作节奏 | 季节性节点 + 产品周期 + 话题锚点 |
| **L11** | 品牌护城河 Brand Moat | AI 长期战略的底层逻辑 | 核心优势 + 不可复制性 + 防御策略 |

---

## 路径 A：现有品牌知识库构建

### Step A0：执行品牌侦查
> 先加载 `dtc-brand-recon` skill，完成三页 Playwright 侦查

### Step A1：填充 L1 核心精神

从侦查结果中提取：
- 品牌 Slogan（官网 Hero 区）
- About 页面的品牌使命表述
- 主要 Campaign 关键词（搜索品牌名 + "campaign 2025"）

引导用户确认品牌原型（The Caregiver / Empowerer / Friend / Expert / Rebel）

### Step A2：填充 L2 语调与人设

从以下来源提取：
- Instagram/TikTok Caption 风格分析（至少 10 条）
- 官网 FAQ 和 Support 页面用词
- 差评回复风格（如有）

产出：Do's 清单 + Don'ts 清单 + 5-10 个品牌高频词

### Step A3：填充 L3 视觉锚点

从侦查截图中提取：
- 主色系（用 Color Picker 提取 HEX）
- 字体（浏览器 DevTools → computed style）
- 摄影风格（Light/Dark? Studio/Lifestyle? Model type?）
- 视觉记忆点（1-2 个最具辨识度的构图/光影特征）

产出：色板 JSON + AI 绘图用 Prompt 框架（含 Negative Prompts）

### Step A4：填充 L4-L11

按框架逐层填充，优先级：L4 > L7 > L9 > L6 > L5 > L8 > L10 > L11

---

## 路径 B：新品牌知识库构建

### Step B0：引导对话——L1 核心精神

```
向用户提问（三选一）：

Q1. 品牌原型选择：
  A. 贴心照料者（温暖/保护/母爱）
  B. 赋能魔法师（科技/高效/解放双手）
  C. 平视闺蜜（真实/平视/不评判）
  D. 权威专家（数据/认证/信任）
  E. 挑战者/破局者（反常识/禁忌打破）

Q2. 核心受众心理：
  A. 焦虑新手妈妈（需要安全感和指导）
  B. 追求效率的职场妈妈（省时间/多任务）
  C. 追求自我价值的现代女性（做自己）
  D. 预算敏感但爱孩子的妈妈（性价比）

Q3. 用一句话（≤20字）描述终极价值
```

### Step B1：引导对话——L2 语调微调

```
在确认了「幽默真实」vs「温柔治愈」之后，还需：

Q4. 当品牌谈论育儿挑战时：
  A. 稍微幽默自黑（敢于吐槽崩溃时刻）
  B. 极致温柔治愈（永远情绪稳定的港湾）

根据 A/B 回答，调整 L2 框架中的「humor level」参数。
```

### Step B2：引导对话——L3 视觉记忆点

```
Q5. 最核心的视觉记忆点（单选）：
  A. 光影记忆点（暖侧光 / 希望感）
  B. 质感记忆点（极软织物包裹感 / Cozy 触觉）
  C. 构图记忆点（第一人称 POV / 极近情绪特写）
  D. 色彩记忆点（一个独特主色持续重复）

注意：可选 B+C 组合，但不建议超过 2 个（否则失去辨识度）
```

### Step B3-B5：填充 L4-L11（同路径 A）

---

## 输出文件规范

### `_ai_brand_knowledge_base.md` 结构

```markdown
# [品牌名] AI Brand Knowledge Base
> 版本: v[X.X] | 更新: [YYYY-MM-DD] | 路径: [A/B]

## L1 核心精神
### 品牌原型
### 使命宣言
### AI 终极价值指令（Core Value Prompt）

## L2 语调与人设
### 角色设定（AI Persona Override）
### 核心沟通准则（Do's）
### 品牌高频词库（Brand Lexicon）
### 绝对禁忌（Don'ts / Red Lines）

## L3 视觉锚点
### 核心色彩基因（Color Palette & Grading）
### 摄影光影与材质（Photography & Lighting）
### 视觉记忆点（Visual Hook 1 + 2）
### AI 绘图负面提示词（Negative Prompts）

## L4 产品与痛点矩阵
[每个核心 SKU 一行]
### [产品名]
- 表面痛点（行业通识）
- 深度痛点（品牌视角）
- Momcozy 转化话术（AI 运营指令）

## L5 场景与情绪模板
### Master Prompt（英文）
### 场景模板 1-5

## L6 竞品定位
## L7 受众画像
## L8 渠道规则
## L9 合规护城河
## L10 内容日历
## L11 品牌护城河
```

### `_design_tokens.json` 结构

```json
{
  "brand": "[品牌名]",
  "version": "1.0",
  "colors": {
    "primary": "#XXXXXX",
    "secondary": "#XXXXXX",
    "accent": "#XXXXXX",
    "surface": "#XXXXXX",
    "text": "#XXXXXX"
  },
  "typography": {
    "heading": "[字体名]",
    "body": "[字体名]",
    "accent": "[字体名]"
  },
  "imagery": {
    "style": "[lifestyle/studio/editorial]",
    "lighting": "[description]",
    "color_grading": "[description]",
    "visual_hooks": ["[hook1]", "[hook2]"],
    "negative_prompts": ["[neg1]", "[neg2]"]
  },
  "voice": {
    "archetype": "[archetype]",
    "tone": "[tone]",
    "humor_level": "[none/light/medium]"
  }
}
```

---

## Master Prompt 模板（英文，直接喂给任意 AI）

```markdown
# [Brand Name] AI Brand Knowledge Base & Content Generator

## 1. Identity & Core (L1)
You are the voice of [Brand Name]. Your archetype is [archetype].
Your core mission: [mission statement].
Motto: "[slogan]"

## 2. Tone & Persona (L2)
- Voice: [adjective1], [adjective2], [adjective3]
- Do: [core communication rules]
- Don't: [absolute prohibitions]
- Brand lexicon: [5-10 high-frequency brand words]

## 3. Visual Prompting Rules (L3)
- Visual Hook 1: [primary hook]
- Visual Hook 2: [secondary hook]
- Lighting: [lighting description]
- Color palette: [palette description]
- Negative prompts: [comma-separated list]

## 4. Operational Template
When I ask for social posts / ads / copy, use:
1. Hook: [relatable observation about user struggle]
2. Visual: [Midjourney prompt applying L3 rules]
3. Body: [L2 tone transition]
4. Product: [L4 pain-point translation]
5. CTA: [warm, community-driven]

[User Task]: (your request here)
```

---

## 质量检查清单

完成知识库后，逐项确认：

- [ ] L1 品牌原型已确认（≤2 个原型组合）
- [ ] L2 Do's ≥ 5 条，Don'ts ≥ 3 条（含绝对禁忌词）
- [ ] L3 视觉记忆点 1-2 个（过多则失去辨识度）
- [ ] L3 Negative Prompts ≥ 5 个
- [ ] L4 每个核心 SKU 都有「深度痛点」（不只是表面痛点）
- [ ] L5 Master Prompt 英文版已输出（中文只是解释）
- [ ] L9 合规护城河已和 `dtc-compliance-3track` 对接
- [ ] 文件已保存到 `[Brand]/_ai_brand_knowledge_base.md`
- [ ] Design Tokens 已同步到 `[Brand]/_design_tokens.json`
