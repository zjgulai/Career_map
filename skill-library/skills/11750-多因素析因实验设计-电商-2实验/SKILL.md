---
name: "p2s-multi-cell-factorial-experiment"
title: "Multi-cell Factorial Experiment — 多因素析因实验设计（电商 2^k 实验）"
description: "触发词：析因实验、多因素并发测试、2^k 设计、主效应与交互效应、实验格流量、部分因子设计。何时不用：因素之间不可拆或会互相污染（价格与库存联动）时退回顺序实验；只测单一因素时用标准 A/B 单变量实验。安全边界：负向交互必须有回滚机制，且需先确认平台允许同时测试多个页面变体。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Multi-Cell-Factorial-Experiment"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "一次实验同时测多个 listing 要素，除了各自效果还能看出因素之间的组合增益。"
user_try: "试试：帮我把主图、A+ 内容和价格锚点这三个因素设计成一次 2^3 析因实验。"
whenToUse: "需要同时测多个 listing 或落地页要素、且关心交互效应时用析因设计；只测一个因素时用标准 A/B；因素互相污染或只能串行验证时退回顺序实验。"
workflow: "列出待测因素与每个因素的水平 → 构建正交设计矩阵并生成各实验格 → 按 MDE 与基线算出每格所需样本量 → 采集分格数据，用回归估计主效应与交互效应 → 选出最优组合并标注负向交互的回滚条件"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-cell Factorial Experiment — 多因素析因实验设计（电商 2^k 实验）

## ① 解决的问题

产品经理面临"需要同时测试价格+文案+图片三个维度但资源有限"——析因实验设计将测试效率提升3-4倍，年化加速产品迭代节省实验成本20-35万元

## ② 核心算法逻辑

多因素析因实验（Factorial Experiment） 允许同时测试多个因素（Factor）的效果及其交互作用（Interaction Effect）。传统 AB 实验每次只能测一个变量，而 2^k 全因子设计在 k 个二水平因素下同时估计所有主效应和交互效应，实验效率是逐一测试的 2^k 倍。

## ③ 业务应用场景

场景1：婴儿推车 Amazon Listing 全要素优化实验 - 业务问题：同时希望测试「主图风格」+「A+ 内容有无」+「价格锚点位置」三个因素，顺序测试需 6 周，错过销售旺季 - 数据要求：8 个实验格（2^3），每格最低 300 次点击（总样本约 2,400 次点击） - 预期产出：2 周内同时得出主效应 + 交互效应，找到最优组合；若「主图 × A+」存在正向交互，组合增益超出各自效果之和 - 业务价值：实验周期从 6 周压缩到 2 周，赶上旺季放量节点，增量 GMV 约 15 万元
场景2：奶粉订阅页落地页 CRO 多因素优化 - 业务问题：落地页需同时测试「CTA 按钮颜色」「社会证明位置」「价格展示方式」三因素 - 数据要求：每格 ≥ 200 次独立访客，流量充足时使用全因子；流量紧张时用 2^(3-1) 部分因子 - 预期产出：识别出「价格展示 × 社会证明」最强交互组合，落地页转化率提升 18% - 业务价值：转化率提升 18% 对应月增净利约 8 万元（假设月均 5,000 访客）
**三轨验证**： - 成本：需要实验平台支持多格流量分发，工程接入约 1 人周 - 合规：Amazon 平台允许同时测试多个页面变体（Manage Experiments 支持） - 风险：交互效应若为负向（两因素组合效果差于各自单独），需有回滚机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：将 3 个顺序实验（6 周）压缩为 1 个并行实验（2 周），赶上母婴销售旺季节点，增量 GMV 约 10-20 万元；通过识别交互效应避免次优组合上线，每年节约实验成本约 5 万元
实施难度：⭐⭐⭐⭐☆（需要实验平台支持多格流量分发，比标准 AB 复杂度高 1 倍）
优先级：⭐⭐⭐⭐☆
评估依据：母婴跨境 Listing 优化涉及多个协同因素（图文价），顺序测试时间成本极高；交互效应普遍存在（如优质主图配合 A+ 内容的协同效果），单因素测试会漏掉最优组合

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（165 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from itertools import product
from scipy import stats
import statsmodels.formula.api as smf

# ============================================================
# Multi-cell Factorial Experiment Design for E-commerce AB
# ============================================================

class FactorialExperimentDesign:
    """
    2^k 全因子实验设计
    支持效应估计、交互效应识别、功效分析
    """

    def __init__(self, factors: dict[str, list]):
        """
        factors: {"因素名": ["水平0名", "水平1名"], ...}
        示例: {"主图风格": ["白底", "场景"], "A+内容": ["无", "有"]}
        """
        self.factors = factors
        self.k = len(factors)
        self.factor_names = list(factors.keys())
        self.design_matrix = self._build_design_matrix()

    def _build_design_matrix(self) -> pd.DataFrame:
        """构建正交设计矩阵（+1/-1 编码）"""
        levels = list(product([-1, 1], repeat=self.k))
        df = pd.DataFrame(levels, columns=self.factor_names)

        # 添加所有二阶交互列
        for i, f1 in enumerate(self.factor_names):
            for f2 in self.factor_names[i+1:]:
                col_name = f"{f1}×{f2}"
                df[col_name] = df[f1] * df[f2]

        return df

    def required_sample_size(self, mde: float, baseline: float,
                              alpha: float = 0.05, power: float = 0.80) -> int:
        """每个实验格所需样本量（基于比例检验）"""
        from statsmodels.stats.power import NormalIndPower
        es = (mde / baseline) * np.sqrt(baseline * (1 - baseline))
        analysis = NormalIndPower()
        n = analysis.solve_power(effect_size=es, alpha=alpha, power=power)
        return int(np.ceil(n))

    def estimate_effects(self, data: pd.DataFrame,
                          metric_col: str = "conversion") -> pd.DataFrame:
        """
        使用 OLS 回归估计主效应和交互效应
        data 必须包含与因素同名的列（+1/-1 编码）+ metric_col
        """
        cols = self.factor_names + [c for c in self.design_matrix.columns
                                     if "×" in c]
        for col in cols:
            if col not in data.columns:
                # 自动计算交互项
                parts = col.split("×")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：因素与水平定义（如主图风格、A+ 内容有无、价格锚点位置）、每格最低点击或访客量要求、以及实验期的分格流量日志；流量紧张时需给出可用总流量以选择全因子或部分因子。

**输出**：正交设计矩阵、每格所需样本量、主效应与交互效应估计表、最优组合建议与负向交互的回滚触发条件；供产品与运营在旺季窗口前一次性完成多要素优化。

## 执行步骤

1. 列出待测因素及每个因素的水平与编码
2. 构建正交设计矩阵并生成各实验格
3. 按 MDE 与基线计算每格所需样本量
4. 采集分格数据并用 OLS 估计主效应与交互效应
5. 选定最优组合并标出负向交互时的回滚条件

## 边界与不做

- 何时不用：因素之间存在不可拆的联动（价格与库存、页面与履约），或多因素会互相污染时，退回顺序实验或单因素 A/B。
- 能力边界：本技能给出设计矩阵、样本要求与效应估计，不负责实验平台的流量分发与上线部署。
- 合规边界：多页面变体测试需先确认平台实验政策允许范围（如 Amazon Manage Experiments 支持的多变体测试），价格类实验还需避开同用户差异定价红线。

## 技能关联

- **可组合**：Skill-Multi-Cell-Factorial-Experiment

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Multi-Cell-Factorial-Experiment`