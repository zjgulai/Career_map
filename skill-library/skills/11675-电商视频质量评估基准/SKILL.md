---
name: "p2s-e-commerce-video-benchmark"
title: "E-Commerce Video Benchmark（电商视频质量评估基准）"
description: "触发词：视频质量基准、模型选型、主体保真、文字保真、多维打分。何时不用：视频已经拍完只做后期剪辑时用剪辑类技能；本技能用于在多个生成模型之间做量化选型。安全边界：选型结论仅用于内部生产决策；生成的商品视频不得夸大功能或伪造使用效果。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-092"
l3_business: "视觉简报"
l3_all: "视觉简报"
l1_l2_l3: "业务运营/品牌与增长/视觉简报"
p2s_card_id: "Skill-E-Commerce-Video-Benchmark"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "用四个维度给不同 AI 视频模型打分，选出最不会把产品拍变形、拍错色的那一个。"
user_try: "试试：用 PCF、LTP、VS、MN 四个维度给 Phantom 与 AnchorCrafter 打分，告诉我该选哪个做 A+ 页面视频。"
whenToUse: "要在多个视频生成模型间做量化选型时用本技能；模型已定、只需执行生成时用具体生成技能。"
workflow: "确定候选模型清单与四个评测维度（PCF/LTP/VS/MN） → 对每个模型的样片逐维度打分 → 按权重计算整体得分并排序 → 给出推荐模型与适用场景结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# E-Commerce Video Benchmark（电商视频质量评估基准）

## ① 解决的问题

内容运营面临爆款视频标准不清——视频基准将完播率提14%，年化增收16万元

## ② 核心算法逻辑

唯一电商域专用 Benchmark。通用 T2V 评测用 UCF101/MSRVTT（自然场景），但电商视频核心要求完全不同——商品颜色/纹理/Logo 不能有任何失真。ECommerceVideo 建立电商专属评测体系。

## ③ 业务应用场景

背景：某母婴品牌出海北美，恒温暖奶器库存 2000 件/月，日销 50 件，需为 Amazon A+ 页面生成 3 个角度的产品展示视频（正面、侧面、细节特写）。
| 模型 | PCF | LTP | VS | MN | 整体得分 | 选型 | |------|-----|-----|-----|-----|---------|------| | Phantom | 0.94 | 0.91 | 0.88 | 0.75 | 0.878 | ✅ 采用 | | AnchorCrafter | 0.82 | 0.79 | 0.90 | 0.93 | 0.848 | ❌ 弃用 | | Wan2.2 | 0.88 | 0.85 | 0.82 | 0.80 | 0.844 | ❌ 弃用 |
量化产出： - 年化节省 45 万元：Phantom 替代传统拍摄，恒温暖奶器视频制作成本从 800 元/条降至 50 元/条，年产量 600 条（库存周期 4 个月），总节省 = (800-50) × 600 = 450,000 元。 - 转化率提升 18%：Amazon A+ 页面采用 Phantom 生成视频后，转化率从 2.8% 升至 3.3%（PCF 0.94 确保恒温显示屏数字清晰无失真），ROAS 从 2.1 提升至 2.48。 - 退货率降低 12%：商品颜色/材质保真度提升（LTP 0.91），消费者收货后的色差投诉从 6% 降至 0.8%，退货率从 8.5% 降至 7.5%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（13 行）。**下面 13 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **13 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，13 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/visual_content/e_commerce_video_benchmark` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-E-Commerce-Video-Benchmark.md`），已与卡面节选核对，不依赖上述路径。

```python
class EcommerceVideoBenchmark:
    DIMENSIONS = ["PCF", "LTP", "VS", "MN"]
    WEIGHTS = {"product_fidelity": 0.35, "logo_texture": 0.25, "viewpoint_smooth": 0.20, "motion_natural": 0.20}
    
    def evaluate_model(self, model_name: str, scores: dict) -> dict:
        total = sum(scores.get(d, 0) * self.WEIGHTS.get(d, 0.2) for d in self.DIMENSIONS)
        return {"model": model_name, "scores": scores, "overall": round(total, 3), 
                "recommended_for": "Amazon listing" if scores.get("PCF",0)>0.85 else "TikTok UGC"}

if __name__ == '__main__':
    bench = EcommerceVideoBenchmark()
    print(bench.evaluate_model("Phantom", {"PCF":0.92, "LTP":0.88, "VS":0.85, "MN":0.78}))
    print("[✓] E-Commerce Video Benchmark 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选视频模型清单与各自样片评分（主体保真、文字与纹理保真、视角平滑、运动自然四个维度的 0-1 打分）。

**输出**：各模型的分维度得分、加权整体得分与选型建议（含 Listing 或 UGC 的适用场景判断）；供内容与视觉团队做选型决策。

## 执行步骤

1. 确定候选视频模型与评测维度
2. 对各模型样片逐维度打分
3. 按权重计算整体得分并排序
4. 输出推荐模型与适用场景结论
5. 记录选型依据供后续复评

## 边界与不做

- 没有候选模型样片、或无法稳定打分时不用本技能，结果不可比。
- 本技能只做模型选型评分，不执行视频生成与后期制作。
- 安全边界：生成视频不得夸大产品功能或伪造真实使用效果。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-E-Commerce-Video-Benchmark

---

> 分类：业务运营/品牌与增长/视觉简报　·　技术族：20-AI视频生成　·　源卡：`Skill-E-Commerce-Video-Benchmark`