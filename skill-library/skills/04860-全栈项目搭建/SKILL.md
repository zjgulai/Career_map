---
name: fastapi-react-windows-setup
description: 在 Windows 上从零搭建 FastAPI + React 全栈项目的完整流程。涵盖 Python 版本选择、依赖兼容性处理（bcrypt/passlib 冲突、Pydantic v2 语法、PyMuPDF 编译）、前后端联调、JWT 鉴权字段对齐（access_token 字段传递与 localStorage 存储）、批量多文件上传端点设计、选择题/填空题混合出题 prompt 工程、QoderWork Write 工具路径限制 workaround、Windows 进程管理等常见陷阱。当用户需要创建 FastAPI 后端 + React 前端全栈项目，或遇到 Python 依赖兼容性、前后端联调、文件上传、AI 出题 prompt 设计、QoderWork 文件写入限制问题时使用。
---

# FastAPI + React Windows 全栈项目搭建

## 环境准备

### Python 版本

**必须使用 Python 3.12**。不要使用 3.13 或 3.14，大量包（Pillow、pydantic-core 等）缺少预编译 wheel，pip 会尝试从源码编译并需要 Visual Studio Build Tools。

```cmd
:: 检查版本
python --version

:: 用 3.12 创建虚拟环境
py -3.12 -m venv venv
venv\Scripts\activate
```

### Node.js

安装 Node.js LTS 版本（从 https://nodejs.org 下载），安装时勾选 "Add to PATH"。

### Windows 命令行注意

PowerShell 执行策略可能阻止 npm 脚本。优先使用 `cmd.exe` 或 `npm.cmd` 全路径：

```cmd
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

## 后端搭建

### 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── routers/
│       ├── __init__.py
│       ├── auth.py
│       └── documents.py
├── requirements.txt
├── .env
└── .env.example
```

### requirements.txt 避坑

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
pydantic==2.9.2
python-multipart==0.0.10
python-jose[cryptography]==3.3.0
bcrypt==4.2.1
python-dotenv==1.0.1
httpx==0.27.2
```

**关键避坑点：**

- **不要用 `passlib[bcrypt]`**：passlib 1.7.4 与 bcrypt >= 4.0 不兼容（`__about__` 属性缺失、`detect_wrap_bug` 报错）。直接用 `bcrypt` 库替代。
- **不要写 `PyMuPDF`**：Windows 上需要 VS Build Tools 编译。如需 PDF 解析，用 `pypdf` 替代或暂时注释掉。
- **pip 安装慢**：加清华镜像 `-i https://pypi.tuna.tsinghua.edu.cn/simple`。

### 密码哈希：直接用 bcrypt

```python
# auth.py - 正确写法
import bcrypt

def hash_password([REDACTED] -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password([REDACTED] hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
```

**错误写法（会报错）：**

```python
# 不要用 passlib
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

### Pydantic v2 Schema 语法

```python
# schemas.py - 正确写法
from pydantic import BaseModel

class Token(BaseModel):
    access_[REDACTED]
    token_type: str = "bearer"  # 类型 str + 默认值 "bearer"
```

**错误写法（会触发 `PydanticUndefinedAnnotation: name 'bearer' is not defined`）：**

```python
class Token(BaseModel):
    access_[REDACTED]
    token_type: "bearer"  # 错！Pydantic 把 "bearer" 当成类型前向引用
```

### .env 配置模板

```env
OPENAI_[REDACTED]
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
SECRET_KEY=change-me-to-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./app.db
```

### 启动命令

```cmd
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

看到 `Uvicorn running on http://127.0.0.1:8000` 即成功。

### 批量/多文件上传端点设计

使用 `python-multipart` 处理文件上传，单文件和多文件端点并存：

```python
# routers/documents.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

router = APIRouter(prefix="/documents", tags=["文档"])

ALLOWED_EXTENSIONS = {".txt", ".docx", ".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def check_file(filename: str):
    import os
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"不支持的文件类型: {ext}")

# 单文件上传
@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_file(file.filename)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "文件大小超过 10MB 限制")
    # 保存文件、提取文本、写入数据库 ...

# 多文件批量上传
@router.post("/upload-batch")
async def upload_documents_batch(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = []
    for file in files:
        check_file(file.filename)
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            results.append({"filename": file.filename, "status": "skipped", "reason": "超过大小限制"})
            continue
        # 逐个处理：保存 → 提取文本 → 入库
        # ...
        results.append({"filename": file.filename, "status": "ok", "id": doc.id})
    return {"uploaded": results}
```

**前端 FormData 构造方式：**

```js
// api.js - 单文件
async uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return this.request('POST', '/documents/upload', formData, true)
}

// api.js - 多文件批量上传
async uploadFiles(files) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)  // 注意：key 都是 'files'，与后端参数名对应
  }
  return this.request('POST', '/documents/upload-batch', formData, true)
}
```

**注意：** 多文件上传时 `FormData.append` 的 key 必须与后端参数名 `files` 一致，且每个文件都用相同的 key 追加。`request` 方法的 `isFormData=true` 时不要设置 `Content-Type`，让浏览器自动设置 `multipart/form-data` 及 boundary。

**文件格式处理分支：**

```python
# docs_processor.py
import os

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    elif ext == ".docx":
        import mammoth
        with open(file_path, "rb") as f:
            result = mammoth.convert_to_markdown(f)
            return result.value
    elif ext == ".pdf":
        from pypdf import PdfReader
        reader = PdfReader(file_path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif ext in {".png", ".jpg", ".jpeg"}:
        return ""  # 图片暂不提取文本，可后续接入 OCR
    return ""
```

### 混合题型 Prompt 工程

AI 出题的核心在于 prompt 设计。以下是经过多轮迭代验证的 prompt 模板：

**记忆模式 prompt（约 60% 填空 + 40% 选择）：**

```python
SYSTEM_PROMPT_MEMORY = """你是复习助手的出题引擎。你的任务是根据用户提供的文档内容，尽可能多地生成高质量的复习题目。

**绝对禁止**：题目文本(question_text)中绝不能包含正确答案！填空题的'____'处必须是需要回忆的内容，不能在题干中暗示或泄露答案。选择题的题干不能包含正确选项的关键词。如果违反此规则，整道题作废。

规则：
1. 题型混合：约60%填空题（fill_in_blank），约40%选择题（multiple_choice）
2. 填空题：将核心术语、年份、数字、人名、关键概念替换为'____'，上下文要完整不能只给半句话
3. 选择题：4个选项(A/B/C/D)，正确答案随机分布，干扰项要合理
4. 每道题必须标注来源（source_reference），引用原文片段
5. 题目之间不要重复考察同一个知识点

返回 JSON 数组，不要其他内容：
[
  {
    "question_id": "随机字符串",
    "question_type": "fill_in_blank" 或 "multiple_choice",
    "question_text": "题目内容，填空题用____标记空白",
    "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"],  // 仅选择题
    "correct_answer": "正确答案",
    "explanation": "解析",
    "source_reference": "原文引用"
  }
]"""
```

**运用模式 prompt（约 50% 填空 + 50% 选择）：**

```python
SYSTEM_PROMPT_PRACTICE = """你是复习助手的运用出题引擎。用户会提供多个文档，你需要：
1. 首先分析文档，提取所有可考察的知识点
2. 基于这些知识点生成运用型题目（理解、应用、分析层面）

**绝对禁止**：题目文本(question_text)中绝不能包含正确答案！不能在题干中暗示或泄露答案。

规则：
1. 题型混合：约50%填空题（fill_in_blank），约50%选择题（multiple_choice）
2. 填空题：考察对知识的理解和应用，用'____'标记空白。题干中绝不能出现答案
3. 选择题：4个选项，干扰项要有迷惑性
4. 题目应考察"理解"和"运用"，而非简单记忆

返回 JSON 格式同记忆模式。"""
```

**难度参数注入方式：**

```python
async def generate_memory_questions(
    contents: List[dict],
    range_text: str = "",
    difficulty: Optional[str] = None,  # "easy" / "medium" / "hard"
) -> List[dict]:
    combined = "\n\n".join(doc["content"] for doc in contents)
    user_prompt = f"文档内容：\n{combined}"
    if range_text:
        user_prompt += f"\n\n重点范围：{range_text}"
    if difficulty:
        difficulty_map = {
            "easy": "简单：考察基本概念的识别和回忆",
            "medium": "中等：考察概念间的联系和简单应用",
            "hard": "困难：考察深层理解、易混淆概念辨析、综合运用",
        }
        user_prompt += f"\n\n难度要求：{difficulty_map.get(difficulty, difficulty)}"

    # 调用 AI API ...
```

**知识点梳理总结 prompt：**

```python
SUMMARY_PROMPT = """你是一位经验丰富的一对一辅导老师。请根据用户提供的文档内容，进行全面、细致的知识点梳理总结。

要求：
1. **全面覆盖**：提取文档中所有重要知识点，按逻辑顺序组织
2. **重点标注**：用 **加粗** 标记重要考点
3. **易混淆点对比**：对容易混淆的概念做对比说明
4. **层次清晰**：用 Markdown 标题分层，大知识点用 ##，子知识点用 ###
5. **举例说明**：对抽象概念给出具体例子帮助理解

返回 Markdown 格式的总结。"""
```

**Prompt 工程关键原则：**

- 明确禁止在题干中泄露答案，这条规则要放在 prompt 最前面并加粗强调，否则 AI 很容易在填空题的题干里暗示答案
- 题型比例要明确给出百分比，否则 AI 倾向于全部出填空题（更容易生成）
- 选择题要求 4 个选项且正确答案随机分布，否则 AI 会把正确答案总是放在 A
- 每道题要求标注 `source_reference`，方便用户回溯原文验证
- 难度参数通过 user prompt 末尾追加，不要改 system prompt，这样 system prompt 可以复用

## 前端搭建

### Vite + React 项目结构

```
web/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api.js
│   ├── index.css
│   ├── components/
│   │   └── Navbar.jsx
│   └── pages/
│       ├── Login.jsx
│       └── Home.jsx
├── index.html
├── package.json
└── vite.config.js
```

### vite.config.js 代理配置

前端跑在 3000 端口，后端跑在 8000 端口。Vite 代理将 `/api` 请求转发到后端：

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### API 客户端（关键字段对齐）

后端登录接口返回的完整 JSON 结构：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "username": "testuser",
    "created_at": "2026-07-04T12:00:00"
  }
}
```

**注意：** 后端 `response_model=Token` 只返回 `access_token` + `token_type`。如果需要同时返回用户信息，要么在 Token schema 里加 `user` 字段，要么在路由中手动构造返回值：

```python
# auth.py 路由 - 手动构造包含 user 的响应
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(401, "用户名或密码错误")
    [REDACTED]"sub": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user),
    }
```

前端 API 客户端正确拆解响应：

```js
// api.js
async login(username, password) {
  const result = await this.request('POST', '/auth/login', { username, password })
  // 关键：用 result.access_token，不是 result.token
  this.setToken(result.access_token)
  return result  // 返回完整对象，包含 result.user
}
```

### App.jsx 中 token 存储与状态管理

```jsx
const handleLogin = (userData) => {
  // userData 是后端返回的完整 JSON：{access_token, token_type, user}
  setUser(userData.user || userData)
  localStorage.setItem('token', userData.access_token)  // 不是 userData.token！
  localStorage.setItem('user', JSON.stringify(userData.user || userData))
}

// 页面刷新时恢复登录状态
useEffect(() => {
  const [REDACTED]'token')
  const userStr = localStorage.getItem('user')
  if (token && userStr) {
    api.setToken(token)
    setUser(JSON.parse(userStr))
  }
}, [])
```

**常见错误对照表：**

| 错误写法 | 结果 | 症状 |
|---------|------|------|
| `localStorage.setItem('token', userData.token)` | 存入 `undefined` | 刷新后请求头变成 `Bearer undefined`，401 鉴权失败 |
| `result.data.access_token` | 多取了一层 | `fetch` 返回的直接是 JSON body，没有 `.data` 包装 |
| `setUser(result)` 然后 `user.username` | user 是整个响应对象 | 页面上显示 `[object Object]` 或 undefined |
| 只存 token 不存 user | 刷新后 user 状态丢失 | 页面显示未登录，但 token 还在 |

**排查思路：** 如果刷新后鉴权失败，打开浏览器 DevTools → Application → Local Storage，检查 `token` 的值是不是一个正常的 JWT 字符串（以 `eyJ` 开头）。如果是 `undefined` 或 `null`，说明登录时字段名写错了。

### 启动命令

```cmd
cd web
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

看到 `Local: http://localhost:3000` 即成功。浏览器只访问 3000 端口。

## QoderWork Write 工具限制与 Workaround

当 QoderWork 帮你搭建项目时，Write 工具只能写入工作区目录（`~/.qoderworkcn/workspace/xxx`），直接写用户桌面路径会报 `Path not in workspace` 错误。

**正确的两步流程：**

```
步骤 1：Write 工具 → 写到工作区
步骤 2：Bash cp/copy → 复制到用户项目路径
```

**具体示例：**

```python
# 步骤 1：Write 工具写到工作区（可以成功）
Write(
    file_path="C:\\Users\\xxx\\.qoderworkcn\\workspace\\abc\\review-assistant\\backend\\app\\config.py",
    content="..."
)

# 步骤 2：Bash 复制到用户桌面
Bash(
    command="cp -r 'C:\\Users\\xxx\\.qoderworkcn\\workspace\\abc\\review-assistant' 'C:\\Users\\xxx\\Desktop\\新建文件夹\\review-assistant'"
)
```

**常见错误：**

```python
# 错误：直接写用户桌面路径 → 报 Path not in workspace
Write(
    file_path="C:\\Users\\xxx\\Desktop\\新建文件夹\\review-assistant\\backend\\app\\config.py",
    content="..."
)
```

**批量复制时注意中文路径：** Windows 下 cmd 的 `copy` 命令对中文路径有时会有编码问题，优先使用 Bash 的 `cp` 命令（Git Bash 环境）。

**skill_manage 工具同理：** 创建/更新技能时，skill_manage 工具会自动处理路径（写入 `~/.qoderworkcn/skills/`），不需要手动复制。但如果 skill_manage 报 "already exists" 而目录下没有 SKILL.md，可以用 Bash 直接 `cat > file << 'EOF'` 写入。

## Windows 常见陷阱排查

### 端口被占用

```cmd
netstat -ano | findstr :8000
taskkill /F /PID <PID>
taskkill /F /IM python.exe
```

uvicorn `--reload` 模式有时不会自动释放端口。修改代码后热重载不生效时，手动重启。

### PyMuPDF 编译失败

报错含 `Visual Studio Build Tools` 或 `Microsoft Visual C++ 14.0`。从 requirements.txt 注释掉 `PyMuPDF`，用 `pypdf` 替代。

### passlib + bcrypt 不兼容

报错含 `module 'bcrypt' has no attribute '__about__'` 或 `password cannot be longer than 72 bytes`。移除 passlib，直接用 bcrypt。

### Python 3.14 wheel 缺失

报错含 `does not support Python 3.14` 或 `Building wheel for ... cancelled`。安装 Python 3.12，用 `py -3.12 -m venv venv` 重建虚拟环境。

### pip 安装卡住

`Preparing metadata` 转圈超过 5 分钟：Ctrl+C 中断，换清华镜像：

```cmd
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 快速检查清单

1. 后端启动无报错，`http://localhost:8000/docs` 能看到 Swagger 文档
2. 前端启动无报错，`http://localhost:3000` 能看到页面
3. 注册/登录接口返回 JSON 包含 `access_token`（不是 `token`）
4. 前端登录后 localStorage 中 `token` 值为 `eyJ` 开头的 JWT 字符串
5. 前端登录后刷新页面不丢失状态，请求头 Authorization 正确携带 Bearer token
6. 文件上传端点支持目标格式（txt/docx/pdf），大文件不超时
7. AI 出题返回的 JSON 中 `question_type` 包含填空和选择两种类型
8. 出题 prompt 中"禁止在题干泄露答案"规则生效（抽查几道题验证）
9. QoderWork 写文件到用户路径时，先写工作区再 cp 复制
