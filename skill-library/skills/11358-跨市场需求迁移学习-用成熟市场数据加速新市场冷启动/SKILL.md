---
name: "p2s-cross-market-transfer-demand"
title: "跨市场需求迁移学习 — 用成熟市场数据加速新市场冷启动"
description: "触发词：跨市场迁移、域适应、负迁移、MMD阈值、新市场备货。何时不用：目标站点完全没有销售数据、要判断零销量概率用「跨境冷启动预测」，同站点新品冷启动用「对比学习冷启动」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 市场进入"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Cross-Market-Transfer-Demand"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "拿成熟市场的数据补新市场的空白，用相似度把关避免帮倒忙，把新站点备货误差降下来。"
user_try: "试试：美国站有 18 个月数据、德国站只有 3 周，帮我做跨市场迁移并预测德国站未来 4 周销量。"
whenToUse: "本卡属需求预测中的新市场进入场景：目标市场已有少量数据（3 周以上）、需要用成熟市场加速建模时用；目标市场完全没有数据、要评估零销量概率与首单量的，用跨境冷启动类技能。"
workflow: "对齐源市场与目标市场的特征口径（价格指数、促销日历） → 测量两市场分布差异，判断是否可迁移 → 迁移需求模式并预测目标市场销量 → 按阈值开关决定是否启用迁移，避免负迁移"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨市场需求迁移学习 — 用成熟市场数据加速新市场冷启动

## ① 解决的问题

出海运营面临"德国日本新市场没有历史数据需求预测完全是盲猜"——Domain Adaptation跨市场迁移将新市场冷启动误差降低45%，年化$3.6万

## ② 核心算法逻辑

来自 MTL/迁移学习，迁移逻辑是： 源市场（美国）与目标市场（德国/日本）的需求序列存在可迁移的结构——季节性节律、促销响应模式、价格弹性曲线形态相似，只是绝对量级和均值不同。通过分布对齐将源域知识映射到目标域，避免在数据稀缺的新市场从零训练。

## ③ 业务应用场景

场景：吸奶器扩展德国市场 - 业务问题：Amazon.de 首发某款母乳喂养辅助设备，美国站已有 18 个月数据，德国站仅 3 周，直接建模 MAPE > 65%，无法指导 FBA 备货。 - 数据要求：US 站 ≥12 个月日销量 + 促销日历；DE 站 ≥3 周日销量（最少可用 14 天）；价格指数、Prime Day 标记。 - 预期产出：德国站未来 4 周日销量预测，迁移后 MAPE 降至 ≤35%（vs 直接建模 65%）。 - 业务价值：新市场冷启动期（前 3 个月）预测误差降低 45%，年化减少积压/断货损失 $3.6 万。
三轨验证： - 成本：数据采集成本低（利用现有销售报表）；计算资源约 $50/月（单市场迁移，云 GPU 非必需）；人力投入约 2 人周（特征对齐 + 模型调参）。 - 合规：不触碰 Amazon 数据共享政策（仅使用公开销售数据与促销日历）；符合 GDPR 匿名化要求（无个人识别信息）；不涉及广告法红线。 - 风险：若源市场促销模式与目标市场差异过大（如德国消费者对折扣敏感度低于美国），迁移可能导致负迁移，预测误差反而上升；需设置 MMD 阈值（<0.3）作为迁移开关。
场景：日本站节庆备货 - 用美国站黑五数据迁移到日本站双十一，学习「促销放大系数」，首年日本节庆备货误差降低 38%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新市场冷启动期（前 3 个月）预测误差降低 45%，年化减少积压/断货损失 $3.6 万
适用规模：正在扩展 2+ 个新市场的中大型跨境卖家（月 GMV ≥ $50 万）
实施难度：⭐⭐⭐☆☆（需要统一的特征工程跨市场对齐）
优先级：⭐⭐⭐⭐☆（新市场开拓是高频业务需求，数据稀缺问题普遍）
见效周期：新市场上线第 3-4 周即可部署，6 周内验证效果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（98 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/cross_market_transfer_demand` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Cross-Market-Transfer-Demand.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_percentage_error

np.random.seed(2024)

# ── 合成数据：美国站（源市场）+ 德国站（目标市场）────────────────────────
def gen_market_data(T, base, promo_lift=3.0, noise=1.5, trend_rate=0.002):
    """生成合成市场需求数据"""
    t = np.arange(T)
    weekday = t % 7
    promo = ((t % 14) == 0).astype(float)
    trend = trend_rate * t
    X = np.column_stack([
        np.sin(2 * np.pi * weekday / 7),
        np.cos(2 * np.pi * weekday / 7),
        promo,
        trend
    ])
    y = base + promo_lift * promo + base * trend + np.random.randn(T) * noise
    return X, np.maximum(y, 0.5)

T_us = 180     # 美国站 6 个月历史
T_de_train = 21  # 德国站 3 周标注数据
T_de_test = 28   # 评估未来 4 周

# 美国站：基础量 20，德国站：基础量 8（量级不同，但模式相似）
X_us, y_us = gen_market_data(T_us, base=20.0)
X_de_train, y_de_train = gen_market_data(T_de_train, base=8.0)
X_de_test, y_de_test = gen_market_data(T_de_test, base=8.0)

# ── Step 1: 在美国站训练源域模型 ─────────────────────────────────────
scaler_us = StandardScaler()
X_us_scaled = scaler_us.fit_transform(X_us)
source_model = Ridge(alpha=0.5)
source_model.fit(X_us_scaled, y_us)
us_mape = mean_absolute_percentage_error(y_us, source_model.predict(X_us_scaled))
print(f"[源域模型] 美国站训练 MAPE: {us_mape:.3f}")

# ── Step 2: 分布对齐（最大均值差异驱动的特征归一化）─────────────────
def mmd_distance(X_s, X_t):
    """简化版 MMD：基于均值差异"""
    return np.mean(np.abs(X_s.mean(axis=0) - X_t.mean(axis=0)))

scaler_de = StandardScaler()
X_de_train_scaled_raw = scaler_de.fit_transform(X_de_train)
X_de_test_scaled_raw = scaler_de.transform(X_de_test)

# 对齐前 MMD
mmd_before = mmd_distance(X_us_scaled, X_de_train_scaled_raw)

# 仿射对齐：将德国特征映射到美国特征的分布空间
align_shift = X_us_scaled.mean(axis=0) - X_de_train_scaled_raw.mean(axis=0)
align_scale = X_us_scaled.std(axis=0) / (X_de_train_scaled_raw.std(axis=0) + 1e-8)

X_de_train_aligned = (X_de_train_scaled_raw + align_shift) * align_scale
X_de_test_aligned = (X_de_test_scaled_raw + align_shift) * align_scale

mmd_after = mmd_distance(X_us_scaled, X_de_train_aligned)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.05823。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：源市场（如 US）12 个月以上日销量与促销日历、目标市场（如 DE）3 周以上日销量（最少可用 14 天）、价格指数与大促标记；市场×日粒度。

**输出**：目标市场未来 4 周的日销量预测与迁移前后 MAPE 对比、迁移开关的判定结果，输出给出海运营与 FBA 备货决策。

## 执行步骤

1. 对齐源市场与目标市场的特征口径（价格指数、促销日历）。
2. 测量两市场的分布差异，判断迁移是否成立。
3. 迁移需求模式，输出目标市场未来 4 周销量预测。
4. 按阈值开关决定是否启用迁移，避免负迁移。

## 边界与不做

- 何时不用：目标市场不足 14 天数据，或两市场促销模式差异过大且没有阈值把关时容易负迁移，不适用。
- 能力边界：迁移只降低误差，不消除新市场的结构性差异；阈值需按品类标定，跨站点数据口径不一致时效果下降。

## 技能关联

- **前置**：Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-MTL-Cold-Start-SKU-Demand.html、Skill-MTL-Cold-Start-SKU-Demand
- **延伸**：Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Cross-Market-Transfer-Demand

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Cross-Market-Transfer-Demand`