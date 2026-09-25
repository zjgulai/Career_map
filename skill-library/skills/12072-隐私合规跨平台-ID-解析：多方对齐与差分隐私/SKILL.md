---
name: "p2s-privacy-safe-identity-resolution"
title: "Privacy-Safe Identity Resolution — 隐私合规跨平台 ID 解析：多方对齐与差分隐私"
description: "触发词：隐私安全对齐、多方集合求交、差分隐私、错绑治理、跨平台 ID。何时不用：各方可以自由共享明文标识、没有隐私约束时，用常规身份解析即可；本技能面向数据不能出域的各方对齐。安全边界：不交换明文标识符，只用加密哈希与加噪统计；隐私预算必须显式设定并留档，错绑需可追责。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 隐私需求分析 / 账号商品映射"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Privacy-Safe-Identity-Resolution"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "两端都不交出明文用户名单，也能算出重合用户规模，并且把错绑率压到很低。"
user_try: "试试：在不让两边交换明文名单的前提下，估算 Amazon 与 TikTok 的重合用户规模。"
whenToUse: "多方数据不能出域、又需要用户交集时用本技能；可以自由合并数据时用常规跨平台身份解析。"
workflow: "各方就匹配字段与哈希方式达成一致 → 跑隐私集合求交得到交集 → 对统计结果注入差分隐私噪声 → 输出交集规模与 ROI 精度改善评估"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Privacy-Safe Identity Resolution — 隐私合规跨平台 ID 解析：多方对齐与差分隐私

## ① 解决的问题

数据治理经理面临身份串绑难追责——Identity Resolution将错绑率3.5%压到0.4%，年化省17万元

## ② 核心算法逻辑

核心思想：在不暴露原始用户身份数据的前提下，通过多方安全计算（MPC）与差分隐私机制，实现跨平台（Amazon/TikTok/独立站）用户 ID 的隐私合规对齐。

## ③ 业务应用场景

业务问题： 某母婴品牌在 Amazon 美国站母婴类目（ASIN 前缀 B0-B9）拥有 50 万+ SKU 的月活用户 12 万人，同时在 TikTok Shop 运营，但两平台用户 ID 完全隔离。品牌无法识别"在 Amazon 浏览婴儿奶粉，在 TikTok 购买纸尿裤"的同一用户，导致 ROI 计算误差 ±35%。
数据规模： - Amazon 母婴类目月活用户：12 万 - TikTok Shop 同期用户：8 万 - 可匹配特征（邮箱加密哈希）覆盖率：Amazon 94%，TikTok 87% - 预期交集用户：3.2 万（多方对齐后确认）
量化产出： - ROI 精度提升：从 ±35% 误差降至 ±8%，对应 GMV 2000 万美元的品牌，ROI 计算精度提升价值 280 万元（按 0.14% 优化空间） - 冷启动用户识别：新用户在 TikTok 首购后，系统自动识别其在 Amazon 的浏览历史，精准推荐相关 SKU，转化率从 2.1% 提升至 3.8%，增量 GMV 120 万元/月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

280-400 万/年

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（277 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/privacy_safe_identity_resolution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Privacy-Safe-Identity-Resolution.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy.special import softmax
from sklearn.preprocessing import MinMaxScaler
import hashlib
import json

class PrivacySafeIdentityResolution:
    """
    隐私合规跨平台 ID 解析：多方对齐与差分隐私
    
    核心算法：Sherpa.ai PSU (Private Set Union) + 差分隐私机制
    """
    
    def __init__(self, epsilon=0.5, delta=1e-5, num_platforms=3):
        """
        初始化隐私参数
        
        Args:
            epsilon: 隐私预算（越小越隐私，推荐 0.1-1.0）
            delta: 失败概率上界（推荐 1e-5）
            num_platforms: 参与方数量
        """
        self.epsilon = epsilon
        self.delta = delta
        self.num_platforms = num_platforms
        self.laplace_scale = 1.0 / epsilon
        self.platform_names = ["Amazon", "TikTok", "IndependentSite"][:num_platforms]
        
    def hash_user_id(self, user_id, salt=""):
        """用户 ID 加密哈希（模拟特征匹配）"""
        return hashlib.sha256(f"{user_id}{salt}".encode()).hexdigest()[:16]
    
    def generate_mock_data(self, num_users_per_platform=100):
        """
        生成模拟数据：跨平台用户 ID 集合
        
        Returns:
            dict: 各平台的用户 ID 集合
        """
        np.random.seed(42)
        
        # 生成平台特定用户
        platform_data = {}
        all_users = set()
        
        for i, platform in enumerate(self.platform_names):
            # 每个平台独占用户
            unique_users = set([f"{platform}_user_{j}" for j in range(int(num_users_per_platform * 0.6))])
            
            # 跨平台共享用户（模拟真实场景）
            shared_users = set([f"shared_user_{j}" for j in range(int(num_users_per_platform * 0.4))])
            
            platform_data[platform] = unique_users | shared_users
            all_users.update(platform_data[platform])
        
        # 转换为加密哈希（模拟邮箱/手机号哈希）
        hashed_data = {}
        for platform, users in platform_data.items():
            hashed_data[platform] = {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2604.16521，但该号在 arXiv 上是《CAMP: Cumulative Agentic Masking and Pruning for Privacy Protection in Multi-Turn LLM Conversations》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各方用户标识的加密哈希（如邮箱哈希，各方覆盖率由数据方提供）、可匹配特征与数据规模；不得输入明文标识。

**输出**：多方对齐后的交集用户规模与隐私保护的匹配结果，以及 ROI 计算精度改善评估，供跨平台投放与冷启动推荐使用。

## 执行步骤

1. 与各方约定匹配字段与哈希口径
2. 执行隐私集合求交计算交集
3. 对输出统计注入差分隐私噪声
4. 复核错绑率并留档追踪
5. 输出交集规模与精度改善评估

## 边界与不做

- 数据方可以自由共享明文标识时不必用本技能。
- 本技能产出隐私保护的匹配结果与统计口径，不做合并后 CRM 的写回与触达执行。
- 隐私预算与匹配字段范围须事先书面约定，错绑需保留可追责记录。

## 技能关联

- **前置**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Differential-Privacy-Mechanisms、Skill-Encrypted-Data-Matching-Fundamentals、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-Identity-Fragmentation-Debiasing.html、Skill-Identity-Fragmentation-Debiasing、Skill-Multi-Touch-Attribution-with-Privacy、Skill-Privacy-Preserving-Federated-Collection.html、Skill-Privacy-Preserving-Federated-Collection
- **延伸**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-Identity-Fragmentation-Debiasing.html、Skill-Identity-Fragmentation-Debiasing、Skill-Multi-Touch-Attribution-with-Privacy、Skill-Privacy-Preserving-Federated-Collection.html、Skill-Privacy-Preserving-Federated-Collection
- **可组合**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Identity-Fragmentation-Debiasing.html、Skill-Identity-Fragmentation-Debiasing、Skill-Multi-Touch-Attribution-with-Privacy、Skill-Privacy-Safe-Identity-Resolution

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：22-数据采集工程　·　源卡：`Skill-Privacy-Safe-Identity-Resolution`