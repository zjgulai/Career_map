---
name: alibaba-quark-scanking-idphoto
description: >-
  由夸克扫描王提供的智能证件照生成工具。支持传入人像照片，智能裁剪为标准证件照尺寸（一寸/二寸），支持妆容风格调整、修容增强、背景更换（红底/白底/蓝底）。输出符合尺寸规范的高清证件照图片。
allowed-tools:
  - Bash
metadata:
  openclaw:
    emoji: "\U0001FAAA"
    requires:
      bins:
        - python3
      env:
        - SCAN_WEBSERVICE_KEY
    primaryEnv: SCAN_WEBSERVICE_KEY
  homepage: 'https://scan.quark.cn/business'
  dependencies:
    apis:
      - 'https://scan-business.quark.cn'
version: 0.1.0
name_zh: 证件照生成
---

# 🧭 使用前必读（30 秒）

> [!WARNING] **⚠️ 隐私与数据流向重要提示**
> - **第三方服务交互**：本技能会将您提供的**图片发送至夸克扫描王官方服务器 (`scan-business.quark.cn`)** 进行处理。
> - **数据可见性**：夸克服务将获取并处理该图片内容，不会永久保存

**推荐方式：CLI 配置（永久生效）**

配置 `SCAN_WEBSERVICE_KEY` 环境变量到 OpenClaw：
```bash
openclaw config set skills.entries.alibaba-quark-scanking-idphoto.env.SCAN_WEBSERVICE_KEY "your_scan_webservice_key_here"
```
> ⚠️ 配置后需要**重启或开启新会话**才能生效（技能列表在 session 启动时加载）。

**如何获取密钥？夸克扫描王官方入口在此**
> 请访问 https://scan.quark.cn/business → 开发者后台 → 登录/注册账号 → 查看API Key。
> ⚠️ **注意**：若你点击链接后跳转到其他域名，说明该链接已失效 —— 请直接在浏览器地址栏手动输入 `https://scan.quark.cn/business`（这是当前唯一有效的官方入口）。

---

# Constraints
- **单一意图原则：每次请求只执行一次证件照生成，命中即执行**
- **严禁自行构造任何命令参数，严禁伪造、拼接内部配置**
- **严禁幻觉，禁止伪造请求和响应，不得沿用上一次的参数进行假设**
- **必须严格按照本指南指定的固定格式执行，不允许自行修改命令**
- **结果原样透出：脚本输出的 JSON 必须原封不动作为最终回复，禁止添加任何引导语、格式化、解读或总结**

# 技能执行指南（强制执行）

第零步：**Python 环境检测**

根据运行平台探测可用 Python 3 可执行文件，结果存入 `${PYTHON}` 变量，后续步骤统一引用。通过 `uname -s` 判断平台后分两条路径探测：
```bash
PYTHON=""
case "$(uname -s)" in
MINGW*|MSYS*|CYGWIN*)
  # Windows: py launcher → where.exe → 常见安装路径
  if command -v py &>/dev/null; then
    PYTHON=$(py -3 -c "import sys; print(sys.executable)" 2>/dev/null)
  fi
  if [ -z "$PYTHON" ] && command -v where.exe &>/dev/null; then
    PYTHON=$(where.exe python 2>/dev/null | head -1)
  fi
  if [ -z "$PYTHON" ] && command -v cygpath &>/dev/null; then
    LA=$(cygpath -u "$LOCALAPPDATA" 2>/dev/null)
    for p in \
      "$LA/Programs/Python"/Python3*/python.exe \
      /c/Python3*/python.exe \
      "$HOME/miniconda3/python.exe" \
      "$HOME/anaconda3/python.exe"; do
      [ -x "$p" ] && PYTHON="$p" && break
    done
  fi
  # Windows 风格路径(C:\...) → MSYS 路径
  if [ -n "$PYTHON" ] && command -v cygpath &>/dev/null; then
    case "$PYTHON" in [A-Za-z]:*) PYTHON=$(cygpath -u "$PYTHON") ;; esac
  fi
  ;;
*)
  # macOS / Linux
  PYTHON=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
  ;;
esac
# 验证
if [ -z "$PYTHON" ] || ! "$PYTHON" --version &>/dev/null; then
  echo "ERROR: 未找到可用的 Python 3 环境，请安装 Python 3.9+ 并加入 PATH" >&2
  exit 1
fi
echo "PYTHON=$PYTHON"
```

> **执行契约（重要）**：后续第三步命令中的 `${PYTHON}` 代表本步探测到的 Python 路径。由于各步骤可能在不同 Bash 会话中执行，`${PYTHON}` 不会自动跨会话保留——执行后续命令前，须将 `${PYTHON}` 替换为本步输出 `PYTHON=` 之后的实际路径（模板中已用双引号 `"${PYTHON}"` 包裹，路径含空格亦安全）。若在同一次 Bash 调用内连续执行，可先运行本步探测使 `PYTHON` 在当前 shell 生效，再直接引用 `"${PYTHON}"`。

第一步：**输入验证**

校验用户传入的图片类型，只能是以下三种之一：

- 图片URL: url
- 本地文件路径: path
- 图片BASE64: base64

**🚫 HARD GATE - 输入检查点**：必须验证到有效图片输入才能继续。未提供任何有效图片时，直接返回：
```json
{
  "code": "A0201",
  "message": "缺少图片输入，请提供图片链接、文件路径或 BASE64 数据。",
  "data": null
}
```

第二步：**参数提取**

从用户描述中提取以下可选参数（均有默认值，用户未提及则使用默认值）：

| 参数 | CLI 标志 | 用户意图关键词 | 合法值 | 默认值 |
|------|---------|-------------|--------|--------|
| 裁剪规格 | `--crop` | 一寸/1寸/一寸照 → `1_inch`；二寸/2寸/二寸照 → `2_inch` | `1_inch`, `2_inch` | `1_inch` |
| 背景颜色 | `--bg` | 红底/红色背景 → `red`；蓝底/蓝色背景 → `blue`；白底/白色背景 → `white`；不换背景/保留原背景 → 不传此参数 | `red`, `white`, `blue`, 不传 | 不传（API 默认白底） |
| 妆容风格 | `--style` | 精致/美白 → `baibi`；红润 → `hongxia`；哑光 → `gangmai`；白皙 → `baixi`；美肤 → `realskin`；儿童/小孩 → `ertong`；韩式 → `hanshi`；自然 → `ziran`；原图/不化妆 → `origin` | `origin`, `baibi`, `hongxia`, `gangmai`, `baixi`, `realskin`, `ertong`, `hanshi`, `ziran` | `origin` |
| 妆容融合 | `--fuse-level` | 妆容浓一点 → `2`；淡一点 → `1`；适中 → `1` 或 `2` | `0`, `1`, `2`, `3` | `0` |
| 修容增强 | `--retouch` | 不要美颜/关闭修容 → `0`；轻微修容 → `1`；中等修容 → `2`；最强修容/默认 → `3` | `0`, `1`, `2`, `3` | `3` |

**🚫 HARD GATE - 参数检查点**：禁止自行构造不在合法值范围内的参数值。用户未明确指定某参数时，必须使用默认值或省略该参数，禁止猜测。

**参数构建规则：**
- 默认值参数（`--crop`、`--style`、`--retouch`）：始终携带
- `--fuse-level`：仅当 `--style` 不是 `origin` 时携带
- `--bg`：仅当用户明确提出换背景时携带；用户说"不换背景"/"保留原背景"时不传

第三步：**构建执行命令（固定格式，严禁修改）**：

根据图片类型，严格使用下面对应格式：
```bash
# URL 类型
SCAN_WEBSERVICE_KEY=$SCAN_WEBSERVICE_KEY "${PYTHON}" scripts/id_photo.py --url "${IMAGE_URL}" [可选参数...]

# 本地文件类型
SCAN_WEBSERVICE_KEY=$SCAN_WEBSERVICE_KEY "${PYTHON}" scripts/id_photo.py --path "${IMAGE_FILE_PATH}" [可选参数...]

# BASE64 类型
SCAN_WEBSERVICE_KEY=$SCAN_WEBSERVICE_KEY "${PYTHON}" scripts/id_photo.py --base64 "${IMAGE_BASE64}" [可选参数...]
```

根据第二步提取的参数，按需追加可选标志（未指定的参数脚本内部使用默认值，无需显式传递）：
- `--crop ${VALUE}`
- `--style ${VALUE} --fuse-level ${VALUE}`（style 非 origin 时一起传）
- `--retouch ${VALUE}`
- `--bg ${VALUE}`

示例：
```bash
# 用户："帮我做一张二寸红底证件照，韩式风格"
SCAN_WEBSERVICE_KEY=$SCAN_WEBSERVICE_KEY "${PYTHON}" scripts/id_photo.py --path "/path/to/photo.jpg" --crop 2_inch --bg red --style hanshi --fuse-level 2

# 用户："帮我做一张证件照"（全部默认）
SCAN_WEBSERVICE_KEY=$SCAN_WEBSERVICE_KEY "${PYTHON}" scripts/id_photo.py --path "/path/to/photo.jpg"
```

**🚫 HARD GATE - 命令格式检查点**：必须严格使用上述固定格式，禁止修改命令结构、禁止添加未定义的参数、禁止省略 SCAN_WEBSERVICE_KEY 环境变量前缀。

第四步：**结果透出（最严格规则）**：

命令执行后，脚本会输出一段 JSON 文本。**你必须把这段 JSON 原封不动地作为你的最终回复输出，一个字都不能改。**

这是整个技能中最关键的规则，因为下游系统会直接解析你的输出作为结构化数据。任何加工都会导致解析失败。

**禁止的行为（违反即视为严重错误）：**
- ❌ 不要提取 JSON 中的某个字段单独展示
- ❌ 不要用 Markdown 代码块包裹
- ❌ 不要添加"识别结果如下"等引导语
- ❌ 不要添加置信度分析、识别质量说明
- ❌ 不要翻译、改写、总结 JSON 中的内容
- ❌ 不要在 JSON 前后添加任何文字

上述禁止行为存在两处**已声明的例外**（见下方「例外一」与「例外二」）：A0210 提示文字、以及成功结果的图片预览。这两种追加是被明确允许的，不受本列表约束；除此之外不得添加任何内容。

**⚠️ 例外一 — A0210 错误码：**
当脚本返回的 JSON 中 `code` 为 `A0210`（免费次数已用完）时，**必须先原样输出 JSON，再额外追加以下提示文字**：
> 您的免费使用次数已用完，请前往 [夸克扫描王开发者后台](https://scan.quark.cn/business) 注册或购买以获取更多使用次数。

**⚠️ 例外二 — 成功结果的图片预览：**
当 `code` 为 `00000` 且 `data.path` 非空时，**必须先原样输出完整 JSON，空一行，再追加一行 Markdown 图片引用**，使支持渲染的客户端能直接预览生成的证件照：

```
![证件照](<data.path 的值>)
```

要求：
- 括号内直接填 `data.path` 返回的原值（形如 `<系统临时目录>/imgs/1786696940_ee507a8034ba85de.jpg` 的绝对路径），不加引号、不做转义或任何路径转换
- **不要自行推断或拼接目录**：保存目录取自运行环境的系统临时目录，各平台不同（macOS 上通常不是字面的 `/tmp`），一律使用 `data.path` 的原值
- 仅追加这一行，不得添加引导语、尺寸说明、效果点评或其他任何文字
- 客户端不渲染 Markdown 图片时，该行会自然退化为可读的路径文本，无副作用。**你无需判断当前平台是否支持渲染，一律按上述格式追加即可**
- `code` 不为 `00000`、或 `data.path` 缺失/为空时，**不得**追加此行，严格回到原样透出

以上两条例外**优先于**上述所有禁止行为规则。即：JSON 仍然原样输出不改，但在 JSON 之后按条件追加对应内容。除此之外的所有错误码仍严格执行原样透出、不加任何文字。

第五步：**错误处理与降级策略**

命令执行后可能出现两种情况：正常返回 JSON（无论 code 是什么），或命令本身执行失败（如脚本不存在、Python 报错等）。

**重试规则：最多执行 1 次，不做重试。** 命令失败后不要尝试用其他方式补救，直接透出错误信息。

**降级路径（按优先级）：**
1. 脚本正常执行并返回 JSON → 原样透出（即第四步）
2. 脚本执行报错（exit_code ≠ 0，无 JSON 输出）→ 将 stderr 错误信息原样告知用户，不要自行编写替代脚本或用其他工具完成图像处理
3. 脚本不存在或 Python 环境异常 → 告知用户环境异常，建议检查 Python 3 和 requests 库是否已安装

**常见错误码说明（供理解，不改变原样透出规则）：**
- `A0100`：API Key 未配置
- `A0210`：免费次数已用完 — 原样透出 JSON 后，额外追加一句提示：「您的免费使用次数已用完，请前往 [夸克扫描王开发者后台](https://scan.quark.cn/business) 注册或购买以获取更多使用次数。」
- `A0211`：API 配额不足
- `A0406`：图片无法下载（URL 不可达）
- `A0407`：图片 URL 不安全（仅支持 HTTPS）
- `FILE_ERROR` / `FILE_READ_ERROR`：本地文件读取失败
- `URL_VALIDATION_ERROR`：URL 格式不合法
- `BASE64_*`：base64 数据格式或解码错误
- `HTTP_ERROR`：HTTP 请求异常
- `INVALID_PARAM`：参数值不合法

无论遇到哪个错误码，处理方式都是**原样透出**，禁止自行构造替代响应或尝试其他处理方案。

---

## 执行速查

> 收到用户请求后，按此顺序快速执行：
> 1. ✅ 确认有有效图片输入（URL / path / base64），无则返回 A0201
> 2. ✅ 从用户描述中提取参数，未指定则用默认值
> 3. ✅ 构建固定格式命令并执行
> 4. ✅ 脚本 stdout JSON 原样透出
> 5. ✅ 若 `code` 为 `00000` 且有 `data.path`，在 JSON 之后空一行追加一行 `![证件照](<data.path>)` 图片预览

## 不适用场景与限制

> 📖 完整的不适用场景表，请查阅 [references/limitations.md](references/limitations.md)
