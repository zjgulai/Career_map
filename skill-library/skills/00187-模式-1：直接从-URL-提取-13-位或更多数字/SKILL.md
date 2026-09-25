---
name: Destination Country Classification & Tax Calculation
version: "1.1.0"
description: >
  Alibaba.com Destination Country Classification & Tariff Calculation Skill, covering destination-country HS code prediction, tariff rate lookup, and customs duty estimation for the United States, all 27 EU member states, the United Kingdom, and Brazil.
  Use this skill whenever the user mentions HS code, destination-country HS code, customs code, tariff rate, customs duty, import tax, tariff, duty, "how much tax to sell to the US / EU / UK / Brazil", or any tariff-related question for an Alibaba.com product.
  Trigger even if the user casually asks "what's the US tariff", "what's the HS code for Germany", "how much tax do I pay selling to the UK", "what's the tariff to Brazil", or "what's the EU tariff".

  ⚠️ Hard constraints:
  - Supported destinations: United States (US), all 27 EU member states using their individual ISO alpha-2 country codes, United Kingdom (GB), and Brazil (BR), 30 countries in total. "EU" is not a valid destination country code; ask the user to choose a specific EU member state.
  - HS code classification: Set destinationCountryCode to the user's supported destination. Origin country does not affect classification results, so originCountryCode defaults to CN.
  - Tariff calculation: Only the China (CN) → selected supported destination lane is supported. If the user declares a non-CN origin, keep originCountryCode as CN, preserve the selected destination, and prepend a "for reference only" notice.
  - Cargo value: If the user does not provide a cargo value, calculate using a default value of 100 USD and explicitly disclose this default in the output.
  - Destination fallback: If the destination is omitted, default to US and disclose the default. If the user explicitly names an unsupported destination, do not call MCP.
  - A product ID or product URL is required — "no-product" scenarios are not accepted.

  Typical prompts:
  1. HS code lookup
  - What is the US HS code for product 1601046346794?
  - What is the German HS code for product 1601046346794?
  - Find the HS code of https://www.alibaba.com/product-detail/xxx_1601046346794.html for Brazil.
  - How is product 1601046346794 classified for the UK market?
  - What is the EU HS code for product 1601046346794? (Ask for a specific EU member state before calling MCP.)

  2. Tariff / customs duty estimation
  - Product 1601046346794, cargo value 1500 USD, how much is the customs duty to France?
  - Product 1601046346794, purchasing 20 units, what is the UK tariff?
  - How much tax do I pay selling product 1601046346794 to Brazil?
  - From China to the US, how much is the tariff for product 1601046346794?
  - Product 1601046346794 to Germany, how much tax is due if no cargo value is provided? (Use the 100 USD default.)
---
> 🔴 **硬约束（不可违反）：**
>
> 1. **支持目的国**：美国、欧盟 27 个成员国、英国、巴西，共 30 国。`destinationCountryCode` 必须使用下表中的 ISO 2 位国家码；英国使用 `"GB"`，不得使用 `"UK"`；`"EU"` 不是有效目的国代码。
> 2. **归类（HS 编码查询）**：将用户指定的支持国家映射到 `destinationCountryCode`。发货国不影响归类结果，`originCountryCode` 默认填 `"CN"`。
> 3. **关税计算**：仅支持**中国（CN）→ 30 个支持目的国之一**。调用 MCP 时 `originCountryCode` **必须**写死为 `"CN"`，**严禁**透传用户声明的发货国；用户输入非 CN 发货国时，须在输出头部明确告知「仅供参考」，但仍保留用户选择的支持目的国。
> 4. 用户明确指定不支持的目的国时不得调用 MCP；仅说“欧盟”时先追问具体成员国；未声明目的国时默认美国（US）并明确提示。

## 支持目的国与国家码

| 区域 | 国家（代码） |
| --- | --- |
| 美国 | 美国（`US`） |
| 欧盟 27 国 | 奥地利（`AT`）、比利时（`BE`）、保加利亚（`BG`）、克罗地亚（`HR`）、塞浦路斯（`CY`）、捷克（`CZ`）、丹麦（`DK`）、爱沙尼亚（`EE`）、芬兰（`FI`）、法国（`FR`）、德国（`DE`）、希腊（`GR`）、匈牙利（`HU`）、爱尔兰（`IE`）、意大利（`IT`）、拉脱维亚（`LV`）、立陶宛（`LT`）、卢森堡（`LU`）、马耳他（`MT`）、荷兰（`NL`）、波兰（`PL`）、葡萄牙（`PT`）、罗马尼亚（`RO`）、斯洛伐克（`SK`）、斯洛文尼亚（`SI`）、西班牙（`ES`）、瑞典（`SE`） |
| 英国 | 英国（`GB`） |
| 巴西 | 巴西（`BR`） |

必须根据用户明确表达的目的国做中文名、英文名、常见简称与代码归一化。例如：`USA` → `US`、`UK` → `GB`、`Germany` → `DE`、`Brasil` → `BR`。不得把不支持的国家或 `EU` 伪代码透传给 MCP。

## 典型触发场景


| 输入类型                     | 示例                                                                  | 关键词                 |
| ---------------------------- | --------------------------------------------------------------------- | ---------------------- |
| **商品 ID + 目的国 HS 编码** | `商品 1601046346794 的德国 HS 编码和税率`                             | HS 编码、税率、目的国 |
| **商品 ID + 数量**           | `商品 1601046346794 发往英国，采购 20 件，清关税费多少`               | 英国、采购、清关税费  |
| **商品 ID + 货值**           | `商品 1601046346794 发往巴西，货值 1500usd，清关税费多少`             | 巴西、货值、清关税费  |
| **商品 URL**                 | `https://www.alibaba.com/product-detail/...html 的法国 HS 编码和税率` | alibaba.com、URL、链接 |

## 核心功能

### 功能 1：商品归类（HS 编码查询）

> 限制：仅支持上述 30 个目的国，发货国不影响归类结果。

**输入**：

- 商品 ID（如 `1601046346794`）
- 或商品 URL（自动提取 ID）

**输出**：

- 目的国 HS 编码（位数以 MCP 返回结果为准）
- 商品类目描述（品目/子目/关税子目）

### 功能 2：关税计算

> 限制：仅支持中国（CN）→ 上述 30 个目的国之一，`originCountryCode` 强制 CN，`destinationCountryCode` 使用用户目的国对应代码。

**输入**：

- 商品 ID
- 货值（USD）
- 或 数量 + 单价
- 未提供货值时，默认按 100 USD 计税，并在输出中明确说明默认口径

**输出**：

- 目的国税率（%）
- 预估关税（USD）
- 计税方式（从价/从量）

### 功能 3：格式化输出

**输出渲染硬约束**：

- 使用**原生 Markdown** （标题 / 加粗 / 无序列表 / 引用）输出。
- **严禁**用三反引号\`\`\` 或 \`\`\`text 包住整个回复，会被前端渲染为不可点击、带“复制”按钮的 Text 卡片。
- 仅当举例“字面量”（如 JSON / 命令行）时才使用代码块。

**标准输出示例**（直接以下面这种 Markdown 渲染输出，不要再套 code block）：

#### 目的国 HS 编码查询

- **查询商品**：1601730656620
- **出口国**：中国
- **目的国**：德国（DE）
- **商品预测 HS 编码**：42031040
- **商品预测类目**：
  - 品目：4203 Articles of apparel and clothing accessories, of leather or of composition leather:
  - 子目：4203.10 Articles of apparel:
  - 关税子目：4203.10.40 Other

> 注：预测编码需结合商品属性进一步确认，最终以目的国海关认定为准。

#### 关税计算

- **目的国税率**：41%
- **目的国关税预估**：41 美元（按默认货值 100 美元计算）
- **计税方式**：从价计税

> 关税会根据贸易政策变化而调整，请访问目的国海关或官方关税数据库，核实准确的 HS 编码和关税信息。

## MCP 服务配置

### 服务信息


|                |                                                |
| -------------- | ---------------------------------------------- |
| **服务名称：** | 国际站商品归类和计算关税                       |
| **调用工具：** | `accio-mcp-cli`                                |
| **工具名称：** | `icbu_logistics_customs_calculate_tariff_tool` |
| **底层接口：** | `accioTurtleClassify`                          |

### 调用参数

> ⚠️ `destinationCountryCode` 必须取自支持国家码并与用户目的国一致；示例使用德国 `DE`。`originCountryCode` 默认 `CN`（关税计算时强制 CN、禁止透传用户声明；归类时发货国不影响结果）。

```json
{
  "fieldName_0": {
    "productId": 1601403270080,
    "originCountryCode": "CN",
    "destinationCountryCode": "DE",
    "productSource": "ICBU",
    "source": "ACCIO_WORK"
  }
}
```

### 调用方法

```bash
accio-mcp-cli call icbu_logistics_customs_calculate_tariff_tool --json '{"fieldName_0": {"productId": 1601046346794, "originCountryCode": "CN", "destinationCountryCode": "DE", "productSource": "ICBU", "source": "ACCIO_WORK"}}'
```

**获取工具列表**：

```bash
accio-mcp-cli list
```

## 📝 使用示例

### 示例 1：德国 HS 编码和税率

- 用户输入：`商品 1601046346794 的德国 HS 编码和税率`
- 处理：映射德国为 `DE`，调用 MCP 时传 `destinationCountryCode: "DE"`。
- 输出：展示目的国“德国（DE）”、MCP 返回的德国 HS 编码、税率及预估关税。

### 示例 2：英国清关税费（数量）

- 用户输入：`商品 1601046346794 发往英国，采购 20 件，清关税费多少`
- 处理：映射英国为 `GB`（不得传 `UK`）；货值未提供时按 100 USD 估算并说明默认口径。
- 输出：展示目的国“英国（GB）”、采购数量、预估货值、税率及预估关税。

### 示例 3：巴西清关税费（货值）

- 用户输入：`商品 1601046346794 从中国发往巴西，货值 1500 USD，清关税费多少`
- 处理：映射巴西为 `BR`，调用 MCP 时传 `originCountryCode: "CN"`、`destinationCountryCode: "BR"`。
- 输出：展示目的国“巴西（BR）”、申报货值、税率及预估关税。

### 示例 4：仅指定欧盟

- 用户输入：`商品 1601046346794 发往欧盟的 HS 编码和税率`
- 处理：不得传 `EU`，先询问具体成员国，例如德国（DE）或法国（FR）；获得具体国家前不调用 MCP。

### 示例 5：URL 查询且未指定目的国

- 用户输入：`https://www.alibaba.com/product-detail/Stainless-Steel-Jewelry-Wholesale-Full-Zircon_1601046346794.html 的 HS 编码和税率`
- 处理：从 URL 提取商品 ID，目的国默认美国（US），并在输出头部说明默认口径后调用 MCP。

## 🛠️ 实现细节

### 商品 ID 提取

```python
import re

def extract_product_id(text):
    """从文本或 URL 中提取国际站商品 ID（13 位或以上数字）"""
    # 模式 1：直接从 URL 提取（13 位或更多数字）
    url_pattern = r'alibaba\.com/product-detail/.*?_(\d{13,})\.html'
    match = re.search(url_pattern, text)
    if match:
        return match.group(1)
  
    # 模式 2：从文本中提取「商品」后的数字（13 位或更多）
    id_pattern = r'商品 [^\d]*(\d{13,})'
    match = re.search(id_pattern, text)
    if match:
        return match.group(1)
  
    # 模式 3：纯数字（13 位或更多，前后无其他数字）
    pure_id_pattern = r'\b(\d{13,})\b'
    match = re.search(pure_id_pattern, text)
    if match:
        return match.group(1)
  
    return None
```

### 货值提取

```python
def extract_value(text):
    """从文本中提取货值（USD）"""
    # 模式：1500usd, 1500 USD, 1500 美元，货值 1500
    patterns = [
        r'货值 [^\d]*(\d+(?:\.\d+)?)\s*(?:usd|USD|美元)?',
        r'(\d+(?:\.\d+)?)\s*(?:usd|USD|美元)',
        r'\$\s*(\d+(?:\.\d+)?)'
    ]
  
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
  
    return None  # 默认值，后续让用户补充
```

### 数量提取

```python
def extract_quantity(text):
    """从文本中提取采购数量"""
    # 模式：20 件，采购 20 个，20pcs
    patterns = [
        r'采购 [^\d]*(\d+)\s*(?:件 | 个 | pcs|pieces)?',
        r'(\d+)\s*(?:件 | 个 | pcs|pieces)'
    ]
  
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
  
    return None
```

### MCP 服务调用

```python
import subprocess
import json

SUPPORTED_DESTINATION_CODES = {
    "US", "GB", "BR",
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
    "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
    "RO", "SK", "SI", "ES", "SE",
}

def call_mcp_tariff_service(product_id, destination_country_code="US"):
    """调用国际站商品归类和计算关税 MCP 服务。

    originCountryCode 强制 CN；destinationCountryCode 必须是支持目的国的
    ISO 2 位国家码，并且由用户目的国归一化得到。
    """

    destination_country_code = destination_country_code.upper()
    if destination_country_code not in SUPPORTED_DESTINATION_CODES:
        return {"error": f"Unsupported destination country: {destination_country_code}"}

    # 构建 accio-mcp-cli 命令（中国出口固定，目的国动态）
    cmd = [
        'accio-mcp-cli', 'call', 'icbu_logistics_customs_calculate_tariff_tool',
        '--json', json.dumps({
            "fieldName_0": {
                "productId": product_id,
                "originCountryCode": "CN",   # 硬编码，严禁透传用户声明
                "destinationCountryCode": destination_country_code,
                "productSource": "ICBU",
                "source": "ACCIO_WORK"
            }
        })
    ]
  
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            response = json.loads(result.stdout)
            if response.get('success'):
                return response.get('data', {})
            else:
                return {'error': response.get('message', 'Unknown error')}
        else:
            return {'error': result.stderr}
  
    except Exception as e:
        return {'error': str(e)}
```

### 格式化输出

```python
DEFAULT_CARGO_VALUE_USD = 100

def format_tariff_result(
    product_id,
    destination_country_name,
    destination_country_code,
    hs_code_data,
    tariff_data,
    value_usd=None,
):
    """格式化关税查询结果"""

    used_default_value = value_usd is None
    if used_default_value:
        value_usd = DEFAULT_CARGO_VALUE_USD
    value_label = "默认货值" if used_default_value else "货值"
  
    # 解析 HS 编码层级
    hs_code = hs_code_data.get('hscode', 'N/A')
    description_en = hs_code_data.get('descriptionEn', '')
  
    # 解析品目/子目/关税子目
    description_lines = description_en.split('\n') if description_en else []
    pinmu = ""
    zimu = ""
    guanshui_zimu = ""
  
    for line in description_lines:
        line = line.strip()
        if '品目：' in line:
            pinmu = line.replace('品目：', '').strip()
        elif '子目：' in line:
            zimu = line.replace('子目：', '').strip()
        elif '关税子目：' in line:
            guanshui_zimu = line.replace('关税子目：', '').strip()
  
    # 关税信息
    tariff_rate = tariff_data.get('tariffRate', 0)
    tariff_type = tariff_data.get('tariffCalculateType', 'ByAmount')
  
    # 计算预估关税
    estimated_duty = value_usd * (tariff_rate / 100)
  
    # 返回原生 Markdown，不要用三反引号包裹整个回复
    output = f"""根据您提供的信息归类的{destination_country_name}海关编码（HS 编码）及关税仅供参考。

### {destination_country_name} HS 编码查询

- **查询商品**：{product_id}
- **出口国**：中国（CN）
- **目的国**：{destination_country_name}（{destination_country_code}）
- **商品预测 HS 编码**：{hs_code}
- **商品预测类目**：
  - 品目：{pinmu}
  - 子目：{zimu}
  - 关税子目：{guanshui_zimu}

> 注：预测编码需结合商品属性进一步确认。

### 关税计算

- **目的国税率**：{tariff_rate}%
- **目的国关税预估**：{estimated_duty:.0f} 美元（按{value_label} {value_usd:.0f} 美元计算）
- **计税方式**：{'从价计税' if tariff_type == 'ByAmount' else '从量计税'}

> 关税会根据贸易政策变化而调整，请访问{destination_country_name}海关或官方关税数据库核实。"""
  
    return output
```

## ⚠️ 输出格式注意事项

如果输出时换行丢失，请在返回前执行：

```python
# 方法 1：替换转义字符
return output.replace('\\n', '\n')

# 方法 2：使用 print 直接输出（绕过 JSON 序列化）
print(output)
return ""
```

## ⚠️ 输出结果注意事项


| 注意项 | 要求 |
| --- | --- |
| **HS 编码准确性** | 返回结果为 AI 预测，需结合商品属性确认 |
| **关税时效性** | 关税会随贸易政策调整，结果仅供参考 |
| **货值默认值** | 如用户未提供货值，默认按 100 USD 计算并在输出中说明 |
| **目的国默认值** | 如用户未声明目的国，默认按美国（US）查询并在输出头部说明；如仅声明“欧盟”，必须追问具体成员国 |
| **发货国默认值** | 归类不受发货国影响；关税计算仅支持 **CN→所选支持目的国**。如用户声明非 CN 发货国，需明确本次仍按中国出口计算，不代表实际发货国的真实税率 |
| **错误处理** | 如 MCP 服务不可用，提示用户到所选目的国海关或官方关税数据库手动查询 |

## 🛡️ 调用前预处理

### 目的国归一化（归类 + 关税）

> 🔴 `destinationCountryCode` 必须取自“支持目的国与国家码”表，并与用户选择一致。除用户未声明目的国的兼容场景外，不得默认或改写为 `"US"`。

| 用户输入场景 | 处理动作 | 输出头部提示 |
| --- | --- | --- |
| 明确指定美国、欧盟成员国、英国或巴西 | 归一化为对应国家码后调用。例如英国传 `GB`，德国传 `DE` | 无需额外提示 |
| 未声明目的国 | 默认按 `US` 调用 | “⚠️ 未检测到目的国，本次默认按美国（US）查询” |
| 仅声明“欧盟”或“EU” | 先追问具体欧盟成员国，获得国家前不调用 MCP | “请指定一个欧盟成员国，因为各国归类与税率可能不同” |
| 明确指定不支持的目的国 | 不调用 MCP，告知当前支持范围 | “当前支持美国、欧盟 27 国、英国和巴西，请改选支持的目的国” |

### 发货国硬锁（仅关税计算）

> 此预处理仅影响**关税计算**场景。纯归类查询（仅查 HS 编码、不算税）不受发货国限制。

在提取到商品 ID 后、调用 MCP 之前，必须进行以下预处理：


| 用户输入场景 | 处理动作 | 输出头部提示 |
| --- | --- | --- |
| 未声明发货国 | 按 CN→所选支持目的国调用 | “⚠️ 本次默认按中国（CN）出口计算” |
| 声明发货国为 CN | 按 CN→所选支持目的国调用 | 无需额外提示 |
| 声明发货国为非 CN（越南/印度/墨西哥等） | `originCountryCode` 仍传 `CN`，`destinationCountryCode` 保持用户所选支持目的国 | “⚠️ 关税计算当前仅支持中国出口，本次结果仍按中国（CN）出口计算” |

实现要求：`originCountryCode` 始终硬编码 `"CN"`；`destinationCountryCode` 必须使用归一化后的支持国家码，严禁重新硬编码为 `"US"` 或透传未经校验的原始文本。

## 🔄 错误处理

### 场景 1：MCP 服务不可用

```
抱歉，关税查询服务暂时不可用（网络访问限制）。

您可以前往所选目的国海关或官方关税数据库，使用商品信息手动查询 HS 编码和税率。
也可以稍后重试，或提供更多商品属性以便进一步分析。
```

### 场景 2：商品 ID 无效

```
未找到有效的商品 ID，请检查输入：
- 商品 ID 应为 13 位以上数字（如：1601046346794）
- 或提供完整的阿里巴巴国际站商品 URL

请重新提供商品信息。
```

### 场景 3：货值缺失

```
- 已查询到商品 HS 编码，但未提供货值，本次默认按 100 USD 货值进行税费估算，仅供参考
---
```
