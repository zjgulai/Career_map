---
name: dtc-commercial-image-gen
description: >
  DTC 产品商业级图片生成 SOP：从参考图 URL + 商业 prompt 参数，批量调用 Cliproxy/Gemini Flash 图像 API，
  Vision LM 4-up grid 选优，6 项合规自查，输出可上架的最终图集。
  触发场景：「生图」「重做商业图」「产品主图」「Hero Shot」「SOP-B Step 3」「批量生图」。
  本 Skill 封装了 Day 1（纯文本 ~6/10）→ Day 4（image-to-image reference ~8.5/10）的质量跃升全过程。
triggers:
  - "生图"
  - "商业级图片"
  - "产品主图"
  - "hero shot"
  - "Hero Shot"
  - "SOP-B Step 3"
  - "批量生图"
  - "重做图片"
version: 1.0.0
created: 2026-05-25
source_sessions:
  - ses_1c9962202ffet3Em7fX1z7ke2b  # SOP-B Step 3/3-v2，56 张批量生图验证
source_lessons:
  - lesson_image-to-image-reference-must-use-for-commercial-grade
  - lesson_cliproxy-image-routing-discovery
---

# dtc-commercial-image-gen

DTC 产品商业级图片生成 SOP — Cliproxy/Gemini Flash + image-to-image reference。

## 核心原则

**纯文本 prompt 上限 ≈ 6/10，加 reference image 上限 ≈ 8.5/10。**  
商业级生图必须传入参考图，这是 Day 1 vs Day 4 质量差距的根本原因。

---

## 前置准备（Step 0）

### 0A. 验证 Cliproxy 图像端点可用

```bash
curl -s https://your-cliproxy-host/v1/models | python3 -c "
import json,sys
models = json.load(sys.stdin)
img_models = [m for m in models.get('data',[]) if 'image' in m.get('id','').lower() or 'imagen' in m.get('id','').lower()]
print('图像模型:', [m['id'] for m in img_models])
"
```

推荐直接使用：`gemini-3.1-flash-image-preview`  
（不要用 `gpt-image-2`，cliproxy 会路由到 Gemini 但返回字段不稳定）

### 0B. 收集参考图 URL（必须）

现有品牌 SKU → 从官网 PDP 抓取：
```bash
# 用 Playwright 抓 PDP 图片 URL
# 目标：3-5 张高清产品图（不含模特），保存 URL 列表
```

新品牌 → 用同位竞品的参考图 URL。

### 0C. 确定图片分类和数量

| 类型 | 推荐数量 | 主要场景 |
|---|---|---|
| 产品主图（白底/灰底） | 5 张 | Amazon listing 前 5 图 |
| 使用说明图（步骤） | 6 张 | 产品步骤演示 |
| 场景图（lifestyle） | 3-4 张 | social media / PDP 底部 |
| 合计 | 14-15 张 | 完整 PDP 图集 |

---

## Step 1: 生成 prompt 矩阵

每张图 2 个 candidate（A/B），共 N×2 张。

**商业级 prompt 必须包含的 8 个参数：**

```
Canon EOS R5, 85mm lens, f/8 aperture, 5500K white balance,
soft diffused studio lighting, neutral gray background #f2f2f2,
commercial Amazon product photography style,
[产品描述] + [具体场景描述]
```

**传入 reference image 的格式：**

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "Generate a commercial product photo: [详细 prompt]"
            },
            {
                "type": "image_url",
                "image_url": {"url": "https://[竞品/品牌参考图 URL]"}
            }
        ]
    }
]
```

---

## Step 2: 批量并行生图

**Python 生图脚本模板：**

```python
import concurrent.futures
import requests
import base64
import os
from datetime import datetime

CLIPROXY_BASE = os.environ.get("CLIPROXY_BASE_URL", "https://your-cliproxy-host")
CLIPROXY_KEY = os.environ.get("CLIPROXY_API_KEY", "")
MODEL = "gemini-3.1-flash-image-preview"

def generate_image(shot_id: str, prompt: str, ref_url: str, output_dir: str) -> dict:
    """单张生图，返回结果字典"""
    payload = {
        "model": MODEL,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": ref_url}}
            ]
        }]
    }
    resp = requests.post(
        f"{CLIPROXY_BASE}/v1/chat/completions",
        headers={"Authorization": f"Bearer {CLIPROXY_KEY}", "Content-Type": "application/json"},
        json=payload, timeout=120
    )
    resp.raise_for_status()
    data = resp.json()
    
    # 提取图像数据
    images = data.get("choices", [{}])[0].get("message", {}).get("images", [])
    if not images:
        return {"shot_id": shot_id, "status": "FAIL", "error": "no images returned"}
    
    img_data = images[0]["image_url"]["url"]
    if img_data.startswith("data:image"):
        img_data = img_data.split(",", 1)[1]
    
    filepath = os.path.join(output_dir, f"{shot_id}.jpeg")
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(img_data))
    
    return {"shot_id": shot_id, "status": "OK", "path": filepath, "size_kb": len(img_data)*3//4//1024}

def batch_generate(shots: list[dict], output_dir: str, max_workers: int = 8) -> list[dict]:
    """批量并行生图"""
    os.makedirs(output_dir, exist_ok=True)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(generate_image, s["id"], s["prompt"], s["ref_url"], output_dir): s
            for s in shots
        }
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    return results

# 使用示例
shots = [
    {"id": "P-01-a", "prompt": "Canon EOS R5, 85mm...[产品主图 A]", "ref_url": "https://..."},
    {"id": "P-01-b", "prompt": "Canon EOS R5, 85mm...[产品主图 B]", "ref_url": "https://..."},
    # ... 其余 N×2 张
]
results = batch_generate(shots, output_dir="images-batch/", max_workers=8)
print(f"完成 {sum(1 for r in results if r['status']=='OK')}/{len(shots)} 张")
```

**性能基准（验证数据）：**
- 8 worker 并行：56 张 / 2m 05s / 0 失败
- 单张耗时：13-31 秒
- 图像大小：500-700 KB / 张

---

## Step 3: Vision LM 4-up Grid 选优

每组 4 个 candidate（或 2+2）合并为 4-up 网格，用 `look_at` 工具批量评估。

**评分维度（商业级标准）：**

| 维度 | 权重 | 说明 |
|---|---|---|
| 背景清洁度 | 25% | #f2f2f2 ±5%，无杂物 |
| 产品细节清晰度 | 25% | 关键部件可辨认 |
| 光影与质感 | 20% | 无硬阴影，材质真实 |
| 品牌色准确性 | 15% | HEX 偏差 < 10% |
| 构图与比例 | 15% | 产品居中，留白均匀 |

**prompt 模板：**
```
Rate these 4 product images for commercial Amazon listing quality (0-10 each):
1. Background cleanliness (target: neutral gray #f2f2f2)
2. Product detail sharpness
3. Lighting and texture quality
4. Brand color accuracy
5. Composition and framing
Select the WINNER and explain why. Flag any compliance issues.
```

目标：平均分 ≥ 8.0/10（Day 4 实测 8.5/10）

---

## Step 4: 6 项合规自查

每张 WINNER 图过以下清单（全部 PASS 才可上架）：

| # | 检查项 | 标准 |
|---|---|---|
| C-1 | 无禁用词文字 | 图中不含 Sterilize/Kills 99.9%/Zero worry 等违规词 |
| C-2 | UV 光线处理 | 腔体内部无蓝紫色 UV 光（参见 SOP-B Step 5.5 审查标准） |
| C-3 | 族裔代表性 | 若含模特，肤色/背景符合目标市场 |
| C-4 | 产品一致性 | 图中产品型号与 listing 一致，无替代品 |
| C-5 | 品牌标识 | 商标/logo 使用符合授权，无他牌侵权 |
| C-6 | 比例准确性 | 宽高比与 listing 要求一致（Amazon: 1:1 主图；Instagram: 4:5 / 9:16） |

---

## Step 5: 后期需求标注

对每张 WINNER 图标注后期优先级：

- **P0（必须后期才能上架）**：可见文字擦除 / 背景不达标
- **P1（建议后期提升质量）**：轻微色偏 / 阴影过重
- **P2（可选）**：局部细节优化

**经验数据：** 14 张图中约 5/14 (36%) 需要 P0/P1 后期，约 3-4 小时 in-house。

---

## 输出规范

每次执行完成后输出：

```markdown
## 生图结果汇总

| 类型 | 总数 | WINNER 数 | 平均分 | 需后期 |
|---|---|---|---|---|
| 产品主图 | 5×2=10 | 5 | 8.3/10 | 2 |
| 使用说明图 | 6×2=12 | 6 | 8.6/10 | 2 |
| 场景图 | 3×2=6 | 3 | 8.4/10 | 1 |
| 合计 | 28 张 | 14 | 8.4/10 | 5 |

## 文件清单
- images-batch/: 28 张全候选
- images-final/: 14 张 WINNER（*-WINNER.jpeg）

## 后期需求
- P0: [列出图片 ID + 原因]
- P1: [列出图片 ID + 原因]

## 下游动作
→ 品牌审核（Brand Guardian）检查 WINNER 是否符合品牌调性
→ Shopify 上架（UI Designer）替换 mockup 中的占位图
→ Reality Checker 合规复审
```

---

## 环境变量配置

```bash
export CLIPROXY_BASE_URL="https://your-cliproxy-host"
export CLIPROXY_[REDACTED]"
```

或写入 `~/.paper2skills/cliproxy.env`（不提交 git）。
