---
name: "p2s-returns-quality-grading-engine"
title: "退货品质分级引擎 — 计算机视觉驱动的再销售路径决策"
description: "触发词：退货分级、品质定级、视觉质检、二次销售路径、退货品相。何时不用：比较各处置渠道回收报价用「退货价值回收竞价」，判定包装是否仿冒用「供应链仿冒品检测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-060"
l3_business: "退货分流"
l3_all: "退货分流 / 仓储协作"
l1_l2_l3: "业务运营/供应与履约/退货分流"
p2s_card_id: "Skill-Returns-Quality-Grading-Engine"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "用退货商品的照片自动定品相等级，替代人工逐件翻看，并给出再上架还是降价的处置路径。"
user_try: "试试：给我这批退货的 6 视角照片和 SKU 信息，输出 A/B/C/D 分级和对应的再销售路径。"
whenToUse: "本卡属退货分流中的品相判定环节：退货件到手后要定等级、分出可再售与不可再售时用；拿到等级后比较二手、翻新、拆件哪个回收价最高，用退货价值回收竞价类技能。"
workflow: "采集退货件 6 个标准角度照片并挂接 SKU 与退货原因 → 用视觉模型做多视角特征提取并输出 A/B/C/D 分级 → 按分级与决策规则匹配最优处置路径 → 把分级与定价结果回传仓储与二次销售执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 退货品质分级引擎 — 计算机视觉驱动的再销售路径决策

## ① 解决的问题

仓储团队面临退货分级人工成本高——CV分级引擎将人工审核减少80%，二次销售率提升至65%，年化增收43万元

## ② 核心算法逻辑

核心机制：多尺度CNN图像分类器（ResNet50主干）+ 品类专属损坏特征库（婴儿推车/安全座椅/婴儿床）+ 贝叶斯决策树，实时输出A/B/C/D四级评分与最优处置路径。

## ③ 业务应用场景

场景A：婴儿推车退货自动分级（节省人工80%）
业务问题： - 亚马逊FBA退货日均150件婴儿推车，人工分级需3-5分钟/件，月成本12万元 - 分级标准主观（评审员A倾向宽松评级，评审员B严格），同一件商品评分差异±1级，导致二次销售定价偏差15-25% - 退货积压7-14天，保税仓库成本日均800元，资金占用率高
数据要求： - 历史标注数据：8000件婴儿推车退货样本（A/B/C/D各2000件），6视角高清图片（3000×2000px） - 元数据：退货原因、原售价、买家反馈文本、退货时间 - 实时输入：退货商品6张标准角度照片 + SKU信息

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
角色：跨境电商物流履约负责人
场景：日均处理150件婴儿推车退货，人工分级成本月12万元，二次销售定价偏差±15%导致月损失8-12万元
方法：部署Returns Quality Grading Engine，自动分级准确率94%，处理速度0.3秒/件，结合贝叶斯决策树输出最优处置路径
指标改善：
人工成本：月12万元 → 月2.4万元（年化节省114万元）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（324 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
from datetime import datetime

# ============= 1. 数据预处理 =============
class ReturnImageProcessor:
    def __init__(self, img_size=224):
        self.transform = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
    
    def process_multi_view(self, image_paths):
        """处理6视角图片"""
        images = []
        for path in image_paths:
            img = Image.open(path).convert('RGB')
            img_tensor = self.transform(img)
            images.append(img_tensor)
        return torch.stack(images)

# ============= 2. 品类专属特征提取 =============
class CategoryDamageFeatures:
    """婴儿推车/安全座椅/婴儿床的损坏特征库"""
    
    STROLLER_FEATURES = {
        'frame_deformation': {'weight': 0.25, 'severity_threshold': [0.1, 0.3, 0.6]},
        'fabric_damage': {'weight': 0.20, 'severity_threshold': [0.05, 0.15, 0.4]},
        'wheel_condition': {'weight': 0.20, 'severity_threshold': [0.1, 0.25, 0.5]},
        'stain_contamination': {'weight': 0.15, 'severity_threshold': [0.05, 0.2, 0.5]},
        'missing_parts': {'weight': 0.20, 'severity_threshold': [0.0, 0.1, 0.3]}
    }
    
    SAFETY_SEAT_FEATURES = {
        'harness_integrity': {'weight': 0.30, 'severity_threshold': [0.05, 0.2, 0.5]},
        'shell_cracks': {'weight': 0.25, 'severity_threshold': [0.0, 0.1, 0.3]},
        'base_stability': {'weight': 0.20, 'severity_threshold': [0.1, 0.3, 0.6]},
        'fabric_condition': {'weight': 0.15, 'severity_threshold': [0.05, 0.2, 0.4]},
        'expiration_date': {'weight': 0.10, 'severity_threshold': [0.0, 0.5, 1.0]}
    }
    
    @staticmethod
    def get_features(category):
        if category == 'stroller':
            return CategoryDamageFeatures.STROLLER_FEATURES
        elif category == 'safety_seat':
            return CategoryDamageFeatures.SAFETY_SEAT_FEATURES
        else:
            return CategoryDamageFeatures.STROLLER_FEATURES

# ============= 3. 多尺度CNN分类器 =============
class ReturnsQualityGrader(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1512.03385。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史标注退货样本（A/B/C/D 各 2000 件、6 视角高清图 3000×2000px）、元数据（退货原因、原售价、买家反馈文本、退货时间）；实时输入为退货商品 6 张标准角度照片 + SKU 信息。

**输出**：每件退货的品相等级（A/B/C/D）与最优处置路径建议（二次上架、降价或降级渠道）及分级置信信息，输出给仓储质检与二次销售定价团队。

## 执行步骤

1. 采集退货件的 6 个标准角度照片并挂接 SKU 与退货原因元数据。
2. 用视觉模型做多视角特征提取与品质分级。
3. 按分级结果匹配最优再销售或处置路径。
4. 把分级与定价结果回传仓储执行，替代人工逐件审核。

## 边界与不做

- 何时不用：没有退货件照片或历史标注样本，或只需判定商品真伪时，不适用本技能。
- 能力边界：分级准确率依赖标注样本规模与拍摄规范，换品类需重新标注训练；分级结论不替代处置渠道的报价比价。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Engine、Skill-Inventory-Demand-Forecasting、Skill-Multicarrier-Parcel-Tracking-Fusion.html、Skill-Multicarrier-Parcel-Tracking-Fusion、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Smart-Packaging-Optimizer.html、Skill-Smart-Packaging-Optimizer、Skill-Supplier-Quality-Scorecard
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Engine、Skill-Inventory-Demand-Forecasting、Skill-Multicarrier-Parcel-Tracking-Fusion.html、Skill-Multicarrier-Parcel-Tracking-Fusion、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Smart-Packaging-Optimizer.html、Skill-Smart-Packaging-Optimizer、Skill-Supplier-Quality-Scorecard
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Engine、Skill-Inventory-Demand-Forecasting、Skill-Multicarrier-Parcel-Tracking-Fusion.html、Skill-Multicarrier-Parcel-Tracking-Fusion、Skill-Smart-Packaging-Optimizer.html、Skill-Smart-Packaging-Optimizer、Skill-Supplier-Quality-Scorecard、Skill-Returns-Quality-Grading-Engine

---

> 分类：业务运营/供应与履约/退货分流　·　技术族：18-物流履约　·　源卡：`Skill-Returns-Quality-Grading-Engine`