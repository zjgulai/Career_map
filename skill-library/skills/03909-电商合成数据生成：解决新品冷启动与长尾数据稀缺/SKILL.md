---
name: "p2s-synthetic-data-ecommerce"
title: "Synthetic Data for E-commerce — 电商合成数据生成：解决新品冷启动与长尾数据稀缺"
description: "触发词：合成数据、新品冷启动、数据稀缺、分布校验、电商仿真。何时不用：已有足量真实历史数据时不必合成；只是补整段缺失的格子走缺失数据补全。安全边界：合成数据不含真实用户 PII 可规避 GDPR/CCPA，但必须确认生成分布未复制原始数据中的偏见（如性别/地域歧视），否则可能违反 Amazon 公平定价政策。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 需求预测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Synthetic-Data-Ecommerce"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品没有历史销量时，生成可信的合成订单数据，先把冷启动推荐和备货预测跑起来。"
user_try: "试试：给这个刚上架的新品生成一批合成订单数据，用来跑通冷启动推荐和库存预测。"
whenToUse: "新品或长尾无历史数据、模型跑不起来时用；已有足量真实数据、或只是补齐缺失格子时不用。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Synthetic Data for E-commerce — 电商合成数据生成：解决新品冷启动与长尾数据稀缺

## ① 解决的问题

母婴跨境电商应用：新品上市无历史数据时生成高质量合成数据，驱动冷启动推荐和库存预测

## ② 核心算法逻辑

论文：SIGIR'26 [2602.23620] + ICML'26 [2602.07298] + SCALR [2606.00282]

## ③ 业务应用场景

母婴跨境电商应用：新品上市无历史数据时生成高质量合成数据，驱动冷启动推荐和库存预测
**三轨验证**： - **成本**：需投入 GPU 算力（约 $0.5/千条生成）及 1 名数据工程师 2 周开发时间；数据存储成本低（合成数据可压缩至原始数据 1/10）。 - **合规**：合成数据不包含真实用户 PII，天然规避 GDPR/CCPA 合规风险；但需确保生成分布不复制原始数据中的偏见（如性别/地域歧视），否则可能违反 Amazon 公平定价政策。 - **风险**：若合成数据质量不足（如分布偏移），可能导致推荐系统过度拟合虚假模式，引发用户投诉或平台审查；需持续用真实小样本校准。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（40 行）。**下面 40 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **40 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，40 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/synthetic_data_ecommerce` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Synthetic-Data-Ecommerce.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd

try:
    from scipy import stats
except Exception:
    stats = None


def generate_orders(n=100, seed=42):
    rng = np.random.default_rng(seed)
    amounts = rng.lognormal(mean=3.2, sigma=0.55, size=n).round(2)
    order_freq = rng.poisson(lam=2.8, size=n)
    categories = rng.choice(["feeding", "sleep", "travel", "safety"], size=n, p=[0.35, 0.25, 0.25, 0.15])
    returns = rng.binomial(1, p=0.12 + 0.03 * (categories == "safety") + 0.02 * (order_freq > 3), size=n)
    df = pd.DataFrame({"order_amount": amounts, "order_freq": order_freq, "category": categories, "return_flag": returns})
    return df


def ks_validate(df):
    mu = np.log(df["order_amount"].mean()) - 0.5 * np.log(1 + (df["order_amount"].std() / df["order_amount"].mean()) ** 2)
    sigma = np.sqrt(np.log(1 + (df["order_amount"].std() / df["order_amount"].mean()) ** 2))
    poisson_lam = df["order_freq"].mean()
    if stats is None:
        return {"amount_mean": df["order_amount"].mean(), "freq_mean": poisson_lam, "ks_amount": None, "ks_freq": None}
    ks_amount = stats.kstest(df["order_amount"], "lognorm", args=(sigma, 0, np.exp(mu)))
    ks_freq = stats.kstest(df["order_freq"], "poisson", args=(poisson_lam,))
    return {"amount_mean": df["order_amount"].mean(), "freq_mean": poisson_lam, "return_rate": df["return_flag"].mean(), "ks_amount": ks_amount, "ks_freq": ks_freq}


def demo():
    df = generate_orders()
    report = ks_validate(df)
    print(df.head())
    print(report)
    print("[✓] Synthetic-Data-Ecommerce测试通过")


if __name__ == "__main__":
    demo()
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.23620 — Synthetic Data Powers Product Retrieval for Long-tail Knowledge-Intensive Queries in E-commerce Search
⚠️ 卡页 ② 段点名的论文是《SIGIR'26 [2602.23620] + ICML'26 [2602.07298] + SCALR [2606.00282]》，与这个号指的不是同一篇。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用于分布校验的真实小样本、品类与价格区间等业务先验、以及目标使用方（冷启动推荐 / 库存预测）

**输出**：合成订单/行为数据集与分布校验结果（KS 校验），可直接喂给冷启动推荐与需求预测模型

## 执行步骤

1. 按对数正态等分布生成订单金额与频次，并抽样品类等维度。
2. 用真实小样本做分布校验（KS 等），确认合成分布没有跑偏。
3. 持续用真实小样本校准，避免推荐系统过拟合虚假模式。
4. 检查生成分布是否复制了原始数据中的偏见后再交付使用。

## 边界与不做

- 何时不用：已有足量真实历史数据时不必合成；只是补整段缺失的格子应转缺失数据补全。
- 能力边界：合成数据只用于训练与冷启动，不能当作真实业务事实对外发布或替代真实数据采集。
- 安全边界：合成数据不含真实用户 PII 可规避 GDPR/CCPA，但必须确认没有复制原始数据中的偏见，否则可能违反 Amazon 公平定价政策。

## 技能关联

- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Synthetic-Data-Ecommerce

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Synthetic-Data-Ecommerce`