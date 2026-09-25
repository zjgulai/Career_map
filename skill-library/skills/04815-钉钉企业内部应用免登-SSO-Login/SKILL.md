---
name: dingtalk-sso-login
description: Implement DingTalk (钉钉) one-click login (免登) for enterprise internal apps. Covers JS-SDK dd.requestAuthCode, dd.config JSAPI signing, authCode exchange via old/new API, OAuth2 redirect flow, mini-program SSO, environment detection, and common pitfalls (API incompatibility, one-time authCode, domain routing, PC client signing). Use when building or debugging DingTalk SSO, 免登, OAuth2 login flows, or JSAPI integration in Python/FastAPI backends with DingTalk JS-SDK / mini-program frontends.
version: 1.1.0
---

# 钉钉企业内部应用免登 (SSO Login)

## 核心架构

钉钉免登涉及两套完全不同的 API 体系，**不能混用**：

| 场景 | 前端获取方式 | 后端兑换 API | 域名 |
|------|-------------|-------------|------|
| **免登码** (JS-SDK) | `dd.requestAuthCode({corpId})` | `POST /topapi/v2/user/getuserinfo` | `oapi.dingtalk.com` |
| **OAuth2 授权码** (页面重定向) | 重定向到 `login.dingtalk.com/oauth2/auth` | `POST /v1.0/oauth2/userAccessToken` | `api.dingtalk.com` |

**关键陷阱**: JS-SDK `dd.requestAuthCode` 返回的免登码 **只兼容旧版 API**，发到新版 `/v1.0/oauth2/userAccessToken` 会返回 400 "不合法的临时授权码"。

## 后端实现 (Python/FastAPI)

### 1. 获取应用级 Access Token

应用级 token 用于服务端调用钉钉 API，新旧模式均可：

```python
# 新版 (推荐): POST https://api.dingtalk.com/v1.0/oauth2/accessToken
resp = await client.post(
    "https://api.dingtalk.com/v1.0/oauth2/accessToken",
    json={"appKey": client_id, "appSecret": client_secret},
)
[REDACTED]"accessToken"]  # 有效期 7200s，建议缓存

# 旧版: GET https://oapi.dingtalk.com/gettoken
resp = await client.get(
    "https://oapi.dingtalk.com/gettoken",
    params={"appkey": app_key, "appsecret": app_secret},
)
[REDACTED]"access_token"]
```

### 1.1 Access Token 缓存策略

AccessToken 有效期 7200s，**必须缓存**，频繁获取会触发钉钉频率限制。推荐 Redis 缓存 + 提前刷新：

```python
import time, redis

_redis = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
TOKEN_KEY = "dingtalk:app_token"
TOKEN_TTL = 7000  # 提前 200s 刷新，避免临界过期

async def get_app_access_token() -> str:
    cached = _redis.get(TOKEN_KEY)
    if cached:
        return cached

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://api.dingtalk.com/v1.0/oauth2/accessToken",
            json={"appKey": APP_KEY, "appSecret": APP_SECRET},
        )
        data = resp.json()
        [REDACTED]"accessToken"]
        _redis.set(TOKEN_KEY, token, ex=TOKEN_TTL)
        return token
```

**无 Redis 时的内存缓存**（单实例可用，多实例不共享）：

```python
_token_cache = {"token": None, "expires_at": 0}

async def get_app_access_token() -> str:
    if _token_cache["token"] and time.time() < _token_cache["expires_at"]:
        return _token_cache["token"]

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "https://api.dingtalk.com/v1.0/oauth2/accessToken",
            json={"appKey": APP_KEY, "appSecret": APP_SECRET},
        )
        data = resp.json()
        _token_cache["token"] = data["accessToken"]
        _token_cache["expires_at"] = time.time() + 7000
        return _token_cache["token"]
```

### 2. 免登码兑换用户信息 (两步调用)

**必须直接指定 `oapi.dingtalk.com`**，不要依赖 auth_mode 路由逻辑：

```python
async def get_user_info_by_auth_code(auth_code: str) -> dict:
    """通过 JS-SDK 免登码获取用户信息"""
    # 获取应用级 token (新旧模式均可)
    [REDACTED] get_app_access_token()

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: 免登码 -> 基本用户信息 (userid/unionid/name)
        resp = await client.post(
            "https://oapi.dingtalk.com/topapi/v2/user/getuserinfo",
            params={"access_token": token},
            json={"code": auth_code},
        )
        data = resp.json()
        if data.get("errcode", 0) != 0:
            raise Exception(f"免登失败: {data.get('errmsg')}")
        basic = data["result"]
        userid = basic["userid"]

        # Step 2: userid -> 完整用户信息 (mobile/email/avatar/dept)
        resp2 = await client.post(
            "https://oapi.dingtalk.com/topapi/v2/user/get",
            params={"access_token": token},
            json={"userid": userid},
        )
        detail = resp2.json().get("result", {})

        return {
            "userid": detail.get("userid", userid),
            "unionid": detail.get("unionid") or basic.get("unionid"),
            "name": detail.get("name") or basic.get("name", ""),
            "mobile": detail.get("mobile"),
            "email": detail.get("email"),
            "avatar": detail.get("avatar_url"),
            "dept_id_list": detail.get("dept_id_list", []),
        }
```

### 3. 响应解析: 先读 body 再判状态码

钉钉错误响应包含有用的 `errcode`/`errmsg` 或 `code`/`message`，必须先读取再抛异常：

```python
def parse_dingtalk_response(resp: httpx.Response) -> dict:
    data = resp.json()  # 先读 body

    if not resp.is_success:
        err_msg = data.get("message") or data.get("errmsg") or f"HTTP {resp.status_code}"
        err_code = data.get("code") or data.get("errcode") or ""
        raise DingTalkError(f"{err_msg} (code={err_code})")

    # 旧版 API: HTTP 200 但业务错误
    if data.get("errcode") and data["errcode"] != 0:
        raise DingTalkError(data.get("errmsg", "API error"))

    return data
```

**反模式**: 先调 `resp.raise_for_status()` 再读 body — 会丢失钉钉返回的具体错误信息。

## 前端实现 (H5 页面)

### 4. 环境检测

在调用任何钉钉 API 前，先判断当前是否在钉钉客户端内：

```javascript
function isDingTalkEnv() {
    // 方式 1: 通过 userAgent（最可靠，dd.env 可能未初始化）
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('dingtalk')) return true;

    // 方式 2: 通过 dd.env（需要 JSAPI 已加载）
    if (typeof dd !== 'undefined' && dd.env && dd.env.platform !== 'notInDingTalk') {
        return true;
    }

    return false;
}

// 根据环境选择登录方式
function initLogin() {
    if (isDingTalkEnv()) {
        loadDingTalkJSAPI();  // 走钉钉免登
    } else {
        redirectToOAuth2();   // 走 OAuth2 重定向（见下文）
    }
}
```

**判断 `dd` 是否可用的安全写法**：某些浏览器中 `<script>` 加载失败时 `dd` 未定义，直接访问 `dd.env` 会报 ReferenceError。

### 5. dd.config 签名 (PC 端微应用必须)

**移动端 H5** 可以不调 `dd.config` 直接用 `dd.ready`，但 **PC 端微应用必须签名**，否则 JSAPI 调用会报 "权限校验失败"。

#### 后端签名接口 (Python)

```python
import hashlib, time, uuid, redis

_redis = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
JSAPI_TICKET_KEY = "dingtalk:jsapi_ticket"

async def get_jsapi_ticket() -> str:
    """获取 JSAPI Ticket（与 AccessToken 不同，需单独获取并缓存）"""
    cached = _redis.get(JSAPI_TICKET_KEY)
    if cached:
        return cached

    [REDACTED] get_app_access_token()
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://oapi.dingtalk.com/get_jsapi_ticket",
            params={"access_token": token},
        )
        data = resp.json()
        if data.get("errcode", 0) != 0:
            raise Exception(f"获取 jsapi_ticket 失败: {data.get('errmsg')}")
        ticket = data["ticket"]
        _redis.set(JSAPI_TICKET_KEY, ticket, ex=7000)
        return ticket

def generate_signature(ticket: str, nonce: str, timestamp: int, url: str) -> str:
    """钉钉 JSAPI 签名算法（SHA1）"""
    plain = f"jsapi_ticket={ticket}&noncestr={nonce}&timestamp={timestamp}&url={url}"
    return hashlib.sha1(plain.encode("utf-8")).hexdigest()

@app.get("/api/auth/dingtalk/jsapi-config")
async def dingtalk_jsapi_config(url: str):
    """前端调用此接口获取 dd.config 所需的全部参数"""
    ticket = await get_jsapi_ticket()
    nonce = uuid.uuid4().hex
    timestamp = int(time.time())
    signature = generate_signature(ticket, nonce, timestamp, url)

    return {
        "agent_id": AGENT_ID,      # 应用 agentId，在钉钉开放平台获取
        "corp_id": CORP_ID,
        "timeStamp": timestamp,
        "nonceStr": nonce,
        "signature": signature,
    }
```

#### 前端 dd.config 调用

```html
<script src="https://g.alicdn.com/dingding/dingtalk-jsapi/3.0.25/dingtalk.open.js"></script>
```

```javascript
async function loadDingTalkJSAPI() {
    const currentUrl = window.location.href.split('#')[0];  // 签名 URL 不含 hash

    // 1. 获取签名参数
    const configResp = await fetch(`/api/auth/dingtalk/jsapi-config?url=${encodeURIComponent(currentUrl)}`);
    const config = await configResp.json();

    // 2. dd.config 签名（PC 端必须，移动端建议也加上）
    dd.config({
        agentId: config.agent_id,
        corpId: config.corp_id,
        timeStamp: config.timeStamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['runtime.permission.requestAuthCode'],  // 按需声明
    });

    // 3. 签名通过后执行免登
    dd.ready(function() {
        requestAuthCode(config.corp_id);
    });

    dd.error(function(err) {
        console.error('dd.config 签名失败:', err);
        // 签名失败时降级到 OAuth2
        redirectToOAuth2();
    });
}

function requestAuthCode(corpId) {
    // 新版 JSAPI（优先）
    if (typeof dd.requestAuthCode === 'function') {
        dd.requestAuthCode({
            corpId: corpId,
            onSuccess: function(result) { exchangeAuthCode(result.code); },
            onFail: function() { tryOldAuthCode(corpId); }
        });
    } else {
        tryOldAuthCode(corpId);
    }
}

// 旧版 SDK 兼容
function tryOldAuthCode(corpId) {
    dd.runtime.permission.requestAuthCode({
        corpId: corpId,
        onSuccess: function(result) { exchangeAuthCode(result.code); },
        onFail: function(err) { console.error('获取授权码失败', err); }
    });
}

// 发送到后端兑换
async function exchangeAuthCode(authCode) {
    const resp = await fetch('/api/auth/dingtalk/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_code: authCode })
    });
    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || err.message);
    }
    const data = await resp.json();
    window.__kdl_[REDACTED]
}
```

**签名踩坑**：
- 签名 URL 必须是 `location.href.split('#')[0]`，包含 query string 但**不含 hash fragment**
- PC 钉钉客户端对签名 URL 敏感，如果页面有重定向，URL 要取最终落地页地址
- `jsApiList` 必须声明要用的 API，否则部分客户端会报权限错误

## OAuth2 页面重定向免登 (非钉钉客户端 / PC 浏览器)

适用于用户在普通浏览器中打开应用链接的场景，走标准 OAuth2 授权码流程：

### 6. 前端重定向

```javascript
function redirectToOAuth2() {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const url = [
        'https://login.dingtalk.com/oauth2/auth',
        `?client_id=${APP_KEY}`,              // 应用的 AppKey
        `&redirect_uri=${redirectUri}`,
        '&response_type=code',
        '&scope=openid',                       // 基础用户信息
        '&prompt=consent',
    ].join('');
    window.location.href = url;
}
```

### 7. 回调处理 + 后端兑换

回调页收到 `code` 参数后，使用**新版 API** 兑换（与 JS-SDK 免登码不同，OAuth2 code 必须走新版）：

```python
# 后端: OAuth2 授权码兑换
@app.get("/auth/callback")
async def oauth2_callback(code: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 新版 API: 用 client_id + client_secret + code 换 token
        resp = await client.post(
            "https://api.dingtalk.com/v1.0/oauth2/userAccessToken",
            json={
                "clientId": APP_KEY,
                "clientSecret": APP_SECRET,
                "code": code,
                "grantType": "authorization_code",
            },
        )
        data = resp.json()
        if "accessToken" not in data:
            raise HTTPException(400, f"OAuth2 兑换失败: {data.get('message')}")

        user_[REDACTED]"accessToken"]

        # 用用户级 token 获取用户信息（注意：这里用用户 token 而非应用 token）
        resp2 = await client.get(
            "https://api.dingtalk.com/v1.0/contact/users/me",
            headers={"x-acs-dingtalk-access-token": user_token},
        )
        user = resp2.json()

    # 生成 JWT 并返回
    jwt_[REDACTED]"unionId"], user.get("nick", ""))
    return RedirectResponse(f"/?[REDACTED]")
```

**关键区别**：OAuth2 返回的是**用户级 AccessToken**（通过 `x-acs-dingtalk-access-token` 传递），不是应用级 token。两套 API 体系见顶部架构表。

## 小程序免登

钉钉小程序（E 应用）使用 `dd.getAuthCode` 而非 `dd.requestAuthCode`：

### 8. 小程序端代码

```javascript
// 小程序 app.js 或页面 onLoad
dd.getAuthCode({
    scopes: 'auth_user',  // auth_user=静默授权（无需用户点同意）
    success: function(res) {
        // res.authCode 就是免登码
        my.request({
            url: 'https://your-server/api/auth/dingtalk/sso',
            method: 'POST',
            data: { auth_code: res.authCode },
            success: function(resp) {
                // 存储 token
                my.setStorageSync({ key: 'token', data: resp.data.token });
            }
        });
    },
    fail: function(err) {
        console.error('小程序获取免登码失败:', err);
    }
});
```

### 9. 后端复用

小程序的 `authCode` 与 H5 的 `dd.requestAuthCode` 返回的免登码**走同一个后端兑换接口**（`/topapi/v2/user/getuserinfo`），后端代码无需改动。

**小程序注意点**：
- `dd.getAuthCode` 的 `scopes` 参数：`auth_user` 静默授权，`auth_base` 需要用户确认
- 小程序的 AppKey/AppSecret 必须与后端配置的一致（在钉钉开放平台 → 小程序 → 基础信息中查看）
- 小程序没有 `dd.config` 签名的概念，直接调用即可

## 常见踩坑

| 问题 | 原因 | 修复 |
|------|------|------|
| 400 "不合法的临时授权码" | 免登码发到了新版 `/v1.0/oauth2/userAccessToken` | 改为旧版 `/topapi/v2/user/getuserinfo` |
| "请求的URI地址不存在" | auth_mode=new 时路由到了 `api.dingtalk.com/topapi/...` | 免登直接写死 `oapi.dingtalk.com` |
| 第一次失败后降级也失败 | authCode 一次性消费，新版 API 已消费掉 | 不能先试新版再降级，直接用旧版 |
| 重试后报 "不存在的临时授权码" | `@retry` 装饰器用同一个已消费的 authCode 重试 | 免登流程不加 retry，authCode 一次性 |
| 错误信息只显示 "400 Bad Request" | `raise_for_status()` 在读取 body 前抛出 | 先 `resp.json()` 再判断 `is_success` |
| 用户信息缺 mobile/email | 只调了 getuserinfo 没调 user/get | 两步调用：getuserinfo + user/get |
| PC 端 JSAPI "权限校验失败" | 未调 `dd.config` 签名，移动端可省略但 PC 端必须 | 后端生成签名，前端调 `dd.config` |
| dd.config 签名校验不通过 | 签名 URL 包含了 `#hash` 或使用了重定向前的 URL | `location.href.split('#')[0]`，取最终落地页 |
| OAuth2 回调后获取不到用户信息 | 用应用级 token 调 `/contact/users/me` | OAuth2 返回的是用户级 token，用 `x-acs-dingtalk-access-token` header |
| "dd is not defined" | JSAPI `<script>` 未加载完就调用了 `dd` | 确保在 `dd.ready` 回调内调用，或先检查 `typeof dd !== 'undefined'` |
| 频繁触发 AccessToken 频率限制 | 每次请求都重新获取 token | 必须缓存，TTL 设为 7000s（提前 200s 刷新） |
| JSAPI Ticket 获取失败 | 用 AccessToken 调 `/v1.0/oauth2/accessToken` 的响应 | JSAPI Ticket 走旧版 `oapi.dingtalk.com/get_jsapi_ticket`，参数是 `access_token` |
| 小程序 authCode 兑换失败 | 小程序和 H5 应用的 AppKey 不同 | 检查小程序开放平台配置的 AppKey 与后端一致 |

## 验证方法

用 curl 测试应用级 token 是否正常获取：

```bash
curl -X POST "https://api.dingtalk.com/v1.0/oauth2/accessToken" \
  -H "Content-Type: application/json" \
  -d '{"appKey":"YOUR_APP_KEY","appSecret":"YOUR_APP_SECRET"}'
# 正常返回: {"expireIn":7200,"accessToken":"..."}
```

用假 authCode 测试 SSO 端点的错误处理：

```bash
curl -X POST "https://your-server/api/auth/dingtalk/sso" \
  -H "Content-Type: application/json" \
  -d '{"auth_code":"test_fake_code"}'
# 预期返回包含钉钉具体错误: "不存在的临时授权码"
```

测试 JSAPI Ticket 获取：

```bash
curl -X POST "https://oapi.dingtalk.com/get_jsapi_ticket?access_[REDACTED]"
# 正常返回: {"errcode":0,"errmsg":"ok","ticket":"...","expires_in":7200}
```

测试 dd.config 签名接口（需要前端传入当前页面 URL）：

```bash
curl "https://your-server/api/auth/dingtalk/jsapi-config?url=https%3A%2F%2Fyour-app.com%2Fpage"
# 预期返回: {"agent_id":"...","corp_id":"...","timeStamp":...,"nonceStr":"...","signature":"..."}
```

测试 OAuth2 重定向 URL 是否能正确打开钉钉授权页：

```
# 在浏览器访问（替换 APP_KEY 和 REDIRECT_URI）:
https://login.dingtalk.com/oauth2/auth?client_id=APP_KEY&redirect_uri=https://your-app.com/auth/callback&response_type=code&scope=openid&prompt=consent
# 预期: 跳转到钉钉登录/授权页面
```
