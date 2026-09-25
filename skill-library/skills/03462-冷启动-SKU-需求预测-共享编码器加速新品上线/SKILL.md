---
name: "p2s-mtl-cold-start-sku-demand"
title: "MTL 冷启动 SKU 需求预测 — 共享编码器加速新品上线"
description: "触发词：MTL、冷启动、共享编码器、新品上线、同类迁移。何时不用：同批多规格新品需要层次一致性时用「概率层次预测 DPMN」；完全无同品类老品可借时用时序基础模型类技能。安全边界：仅用自有历史销售与促销日历；涉食品等品类需符合进出口与商检备案要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-MTL-Cold-Start-SKU-Demand"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品只有两周数据也能给出可用预测，因为编码器已经跟同品类老款学过一遍品类需求模式。"
user_try: "试试：用同品类 3 个老款的 6 个月日销，帮我给刚上 2 周的新款做未来 4 周预测。"
whenToUse: "新 SKU 历史只有数周、但有 3-5 个同品类老 SKU 可借时用；多 SKU 同批上市要层次一致时用概率层次预测 DPMN；无同类可借时用时序基础模型类技能。"
workflow: "整理 3-5 个老 SKU 各 6 个月日销量与新 SKU 近 2 周数据 → 用老 SKU 联合训练共享编码器 → 冻结共享编码器，仅拟合新 SKU 专属头 → 输出新 SKU 未来 4 周预测并复核误差"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MTL 冷启动 SKU 需求预测 — 共享编码器加速新品上线

## ① 解决的问题

需求预测工程师面临"新SKU上市前2-4周需求预测误差高达±80%备货全靠赌"——Multi-task Learning共享同类SKU需求模式将冷启动预测误差降至±25%，年化减少过备货损失$4.2万

## ② 核心算法逻辑

来自 MTL/迁移学习，迁移逻辑是： 共享编码器从多个老 SKU 学习「品类级需求模式」，新 SKU 仅需接一个轻量专属头即可利用这套通用表示，无需从零累积历史数据。

## ③ 业务应用场景

场景：吸奶器新品型号冷启动备货 - 业务问题：新款便携式吸奶器上线 Amazon US，仅有 2 周销售数据，备货量难以估算，传统模型需 8-12 周才能收敛。 - 数据要求：同品类 3-5 个老款 SKU 各 6 个月日销量 + 促销日历 + 价格；新 SKU 近 2 周日销量。 - 预期产出：新 SKU 未来 4 周日销量预测，MAPE 目标 < 25%（较基线的 ±80% 大幅改善）。 - 业务价值：冷启动阶段过备货/断货双向损失减少 60%，按单品 FBA 仓储+缺货损失估算，年化减少损失 $4.2 万。
场景：新市场首发 SKU（德国站） - 美国站同款已有 1 年数据，迁移编码器到德国站，仅需德国站 3 周数据即可启动可用预测。
三轨验证 | 成本轨：月均成本1200元（云计算资源800元+数据标注人工400元，人工投入12小时/月），年度成本14400元 | 合规轨：符合《跨境电商商品质量管理规范》和《进出口食品安全管理办法》，需获得有机认证证书和进口许可证，依据为商检部门备案要求 | 风险轨：模型漂移风险（概率35%，季节性需求变化导致预测偏差）、供应链中断风险（概率20%，影响补货周期）、数据质量风险（概率25%，历史销售数据缺失或异常值）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：冷启动预测误差从 ±80% 降至 ±25%，年化减少过备货/断货损失 $4.2 万（按单品 FBA 仓储+缺货机会成本估算）
适用规模：月均新品上线 ≥5 个 SKU 的卖家效益最显著
实施难度：⭐⭐☆☆☆（已有历史 SKU 数据即可，无需 GPU）
优先级：⭐⭐⭐⭐☆（新品上线是高频痛点，ROI 明确）
见效周期：首批新品上线即可验证，2 周内出结果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（80 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/mtl_cold_start_sku_demand` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-MTL-Cold-Start-SKU-Demand.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

# ── 合成数据：3 个老 SKU + 1 个新 SKU ────────────────────────────────────
np.random.seed(42)
T_old = 90        # 老 SKU 历史天数
T_new = 14        # 新 SKU 仅 2 周数据
T_pred = 28       # 预测未来 4 周

def make_features(T, base_demand, noise_scale=2.0):
    """生成合成特征：星期几 + 促销标记 + 趋势"""
    t = np.arange(T)
    weekday = t % 7
    promo = ((t % 14) == 0).astype(float)  # 每两周一次促销
    trend = t / T
    X = np.column_stack([np.sin(2 * np.pi * weekday / 7),
                          np.cos(2 * np.pi * weekday / 7),
                          promo, trend])
    y = base_demand + 3 * promo + 0.5 * trend * base_demand + np.random.randn(T) * noise_scale
    return X, np.maximum(y, 0)

# 老 SKU（相似品类，不同基础销量）
X1, y1 = make_features(T_old, base_demand=10)
X2, y2 = make_features(T_old, base_demand=15)
X3, y3 = make_features(T_old, base_demand=8)

# 新 SKU（只有 T_new 天）
X_new_train, y_new_train = make_features(T_new, base_demand=12)
X_new_test, y_new_test = make_features(T_pred, base_demand=12)  # 真值对比用

# ── Step 1: 共享编码器（用所有老 SKU 联合训练）────────────────────────
scaler = StandardScaler()
X_all_old = np.vstack([X1, X2, X3])
y_all_old = np.concatenate([y1, y2, y3])
X_all_scaled = scaler.fit_transform(X_all_old)

shared_encoder = Ridge(alpha=1.0)
shared_encoder.fit(X_all_scaled, y_all_old)

# 共享编码器在老 SKU 上的预测误差（基线性能）
old_pred = shared_encoder.predict(X_all_scaled)
shared_mae = np.mean(np.abs(old_pred - y_all_old))
print(f"[共享编码器] 老SKU训练集 MAE: {shared_mae:.2f} 件/天")

# ── Step 2: 新 SKU 专属头（冻结共享编码器，仅拟合 delta）────────────────
X_new_scaled = scaler.transform(X_new_train)
shared_pred_new = shared_encoder.predict(X_new_scaled)
delta = np.mean(y_new_train - shared_pred_new)  # 新 SKU 偏置估计
print(f"[新SKU专属头] 偏置 delta = {delta:.2f} 件/天（仅用 {T_new} 天数据）")

# ── Step 3: 预测新 SKU 未来 4 周 ─────────────────────────────────────
X_pred_scaled = scaler.transform(X_new_test)
y_pred_mtl = shared_encoder.predict(X_pred_scaled) + delta

# 对比：纯新 SKU 直接建模（无迁移，只用 T_new 天）
baseline_model = Ridge(alpha=1.0)
baseline_model.fit(X_new_scaled, y_new_train)
y_pred_baseline = baseline_model.predict(X_pred_scaled)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09187，但该号在 arXiv 上是《Vision-Language Models as a Source of Rewards》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：同品类 3-5 个老款 SKU 各 6 个月日销量、促销日历与价格，新 SKU 近 2 周日销量；粒度：SKU×日。

**输出**：新 SKU 未来 4 周（可按周聚合）日销量预测，MAPE 目标参照卡页的 25% 以内，供冷启动期首批与追单备货使用；新市场首发可复用同一编码器。

## 执行步骤

1. 对齐多个老 SKU 的特征与目标口径
2. 联合训练共享编码器捕获品类需求模式
3. 冻结编码器后拟合新 SKU 专属轻量头
4. 输出未来 4 周预测并与基线误差对比

## 边界与不做

- 数据不满足时不用：同品类没有可用的老 SKU 历史时，共享编码器无从学起，应改用零样本基础模型。
- 能力边界：只给预测与误差区间，不含新品定价、上架节奏等决策。

## 技能关联

- **前置**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Seasonal-Pattern-Transfer-Learning.html、Skill-Seasonal-Pattern-Transfer-Learning
- **延伸**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Seasonal-Pattern-Transfer-Learning.html、Skill-Seasonal-Pattern-Transfer-Learning
- **可组合**：Skill-Cross-Market-Transfer-Demand.html、Skill-Cross-Market-Transfer-Demand、Skill-Seasonal-Pattern-Transfer-Learning.html、Skill-Seasonal-Pattern-Transfer-Learning、Skill-MTL-Cold-Start-SKU-Demand

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-MTL-Cold-Start-SKU-Demand`