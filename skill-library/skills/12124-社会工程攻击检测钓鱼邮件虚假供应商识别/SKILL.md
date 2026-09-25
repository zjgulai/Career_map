---
name: "p2s-social-engineering-attack-detection"
title: "Social Engineering Attack Detection — 社会工程攻击检测钓鱼邮件/虚假供应商识别"
description: "触发词：钓鱼邮件、仿冒官方、虚假供应商、预付款诈骗、欺诈评分。何时不用：已合作供应商的常规准入与绩效评估走「供应商评估」；账号被盗后的权限处置走「访问控制」。安全边界：只输出欺诈评分与核查建议，不得代替人工点击链接或回复可疑邮件，也不得据此自动拉黑供应商。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 供应商评估"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Social-Engineering-Attack-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "收到催办账号验证的官方邮件、或遇到底价催预付款的新供应商时，先打分确认是不是钓鱼或诈骗。"
user_try: "试试：这封说来自 Amazon 的账号验证邮件，还有这家报价低 40% 的新供应商，帮我判断有没有问题。"
whenToUse: "当收到疑似仿冒官方通知、或被异常低价与预付款要求推动时用；若对已合作供应商做常规能力与绩效评估，用「供应商评估」；若账号已被入侵需要权限处置，用「访问控制」类技能。"
workflow: "采集邮件头、邮件正文与供应商背景信息 → 比对官方域名白名单并核查 DMARC/SPF 状态 → 对紧迫话术、非官方链接与异常内容打分 → 采集供应商报价与支付要求并打分 → 输出欺诈评分与拒绝操作、二次核验等建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Social Engineering Attack Detection — 社会工程攻击检测钓鱼邮件/虚假供应商识别

## ① 解决的问题

运营团队面临"伪装Amazon官方邮件诱导账号验证和虚假供应商价格低40%诱导预付款"——钓鱼邮件+供应商欺诈多维度评分识别攻击，年化减少社会工程攻击损失50-100万元

## ② 核心算法逻辑

论文：Phishing Detection Using Machine Learning: A Comprehensive Survey | 年份：2021

## ③ 业务应用场景

场景：运营人员收到「来自 Amazon」的邮件，要求 48 小时内验证账号（「Account Verification Required」），链接指向 amaz0n-verification.com。同月，新供应商报价奶瓶模具低于市场价 40%，要求先付 5 万元样品费。
数据要求：邮件头信息（发件人域名、DMARC/SPF 状态）、邮件内容文本，供应商信息（公司名、成立时间、支付要求）。
检测应用：邮件欺诈评分 92 分（域名新注册 + 紧迫词 + 非官方链接），供应商欺诈评分 78 分（价格异常 + 可疑支付）。两起均为钓鱼/诈骗，运营人员拒绝操作，避免损失。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

邮件头数据采集接口（IMAP/API）：0 元（现有邮箱系统内置）
域名注册时间查询服务（WHOIS API）：￥500-1000/年
供应商信息爬取（企查查/天眼查 API）：￥2000-5000/年
模型训练与部署（云计算资源）：￥3000-8000/年
人工审核与标注（初期 200 条样本）：￥5000-10000（一次性）
总成本：￥10500-24000/年，人均成本 ￥2000-3000/人/年

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（141 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np

# 合法邮件域名白名单
LEGITIMATE_DOMAINS = {
    'amazon': ['amazon.com', 'marketplace.amazon.com', 'seller.amazon.com',
               'amazon.co.uk', 'amazon.de', 'amazon.co.jp'],
    'ebay': ['ebay.com', 'ebay.co.uk'],
    'paypal': ['paypal.com', 'paypal.me'],
}

# 钓鱼指标词汇
PHISHING_KEYWORDS = [
    'immediate action', 'account suspended', 'verify now', 'click here',
    'within 24 hours', 'urgent', 'account disabled', 'payment failed',
    'confirm your identity', 'update payment', 'security alert'
]

# 供应商高风险词汇
SUPPLIER_RED_FLAGS = [
    'wire transfer only', 'cryptocurrency', 'western union', 'moneygram',
    'no refund', 'advance payment required', 'factory price',
]

def analyze_email_phishing(
    sender_domain: str,
    subject: str,
    body: str,
    registration_age_days: int = None
) -> dict:
    """邮件钓鱼检测"""
    score = 0
    signals = []

    # 域名检测
    is_legit_domain = any(
        sender_domain.endswith(d)
        for domains in LEGITIMATE_DOMAINS.values()
        for d in domains
    )

    # 检测混淆域名（数字替换字母）
    leet_pattern = re.sub(r'[0-9]', lambda m: {'0': 'o', '1': 'i', '3': 'e', '4': 'a'}.get(m.group(), m.group()), sender_domain)
    is_leet = leet_pattern != sender_domain and any(
        leet_pattern.endswith(d) for domains in LEGITIMATE_DOMAINS.values() for d in domains
    )

    if not is_legit_domain:
        score += 30
        signals.append('非官方发件域名')
    if is_leet:
        score += 40
        signals.append('数字混淆域名（疑似仿冒官方）')
    if registration_age_days is not None and registration_age_days < 30:
        score += 25
        signals.append(f'域名注册仅 {registration_age_days} 天')

    # 内容关键词
    full_text = (subject + ' ' + body).lower()
    matched_keywords = [kw for kw in PHISHING_KEYWORDS if kw in full_text]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.08958，但该号在 arXiv 上是《Dependent Type Theory as Related to the Bourbaki Notions of Structure and Isomorphism》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Phishing Detection Using Machine Learning: A Comprehensive Survey》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需邮件头信息（发件人域名、DMARC/SPF 状态）与邮件正文，以及供应商信息（公司名、成立时间、报价与支付要求）；单封邮件与单个供应商粒度。

**输出**：产出邮件欺诈评分与供应商欺诈评分（含命中特征，如新注册域名、紧迫话术、非官方链接、价格异常）、判定结论与核查处置建议，供运营与采购决策。

## 执行步骤

1. 采集可疑邮件的邮件头、正文与发件域名信息
2. 比对合法官方域名白名单，核查 DMARC/SPF 是否通过
3. 计算邮件欺诈评分，命中紧迫话术与非官方链接特征
4. 计算供应商欺诈评分，覆盖价格偏离与可疑支付
5. 输出两类欺诈评分与拒绝操作、二次核验等建议

## 边界与不做

- 正常商务询价与常规供应商准入不走本技能，避免把正常低价当成欺诈
- 只做识别与评分，不代发邮件、不点击链接、不自动拉黑供应商
- 邮件与供应商信息含商业敏感内容，仅限内部核查使用

## 技能关联

- **可组合**：Skill-Social-Engineering-Attack-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Social-Engineering-Attack-Detection`