---
name: "p2s-supply-chain-counterfeit-detection"
title: "Supply Chain Counterfeit Detection — 供应链仿冒品检测原材料/包装视觉验真"
description: "触发词：仿冒品检测、包装验真、pHash比对、跟卖仿冒、视觉指纹核验。何时不用：货源与包装一致性已确认、只需判断退货品相的，用退货品质分级类技能。安全边界：比对结果只是疑似线索，判定与下架须人工复核，不得据自动比对结果直接处罚供应商。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 知识产权检索"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Supply-Chain-Counterfeit-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用正品参考图给库存包装做视觉指纹比对，批量筛出疑似仿冒包装，人工复核后下架并向平台举报。"
user_try: "试试：用这三张正品包装参考图比对我 3PL 仓库这批库存照片，列出疑似仿冒的包装。"
whenToUse: "本卡属质量分析中的验真环节：怀疑同 ASIN 跟卖或不明来源退货混入仿冒品时用本技能；判断退货商品能卖几成新、走哪条再售路径时用退货品质分级类技能。"
workflow: "准备正品包装的正面/侧面/底部参考图与待检批次照片 → 计算每张包装图的 pHash 感知哈希指纹 → 用汉明距离比对并输出超阈值异常清单 → 人工复核疑似仿冒件，决定下架与平台举报"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Counterfeit Detection — 供应链仿冒品检测原材料/包装视觉验真

## ① 解决的问题

品控面临"FBA退货中混入包装高度相似的仿冒品难以人工识别"——pHash视觉指纹比对批量核查识别8件仿冒包装，年化避免品质投诉和品牌损失50-100万元

## ② 核心算法逻辑

论文：Image Hashing via DCTBased Perceptual Hashing | 年份：2017

## ③ 业务应用场景

场景：某母婴品牌接到线报，竞品用近似包装销售劣质产品混淆消费者（同 ASIN 跟卖）。品牌需要快速核查全球 3PL 仓库中的库存是否存在仿冒品混入（可能来自不明来源退货）。
数据要求：产品正品参考图（正面/侧面/底部），待检批次产品照片，包装尺寸重量规格。
应用：pHash 比对识别出 12 件与标准图汉明距离 > 25 的异常包装，人工复核确认其中 8 件为近似仿冒，全部下架并向 Amazon 举报。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50-100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（108 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def compute_phash(image_array: np.ndarray, hash_size: int = 8) -> np.ndarray:
    """
    计算感知哈希（pHash）- 简化版（不需要 PIL）
    image_array: 灰度图像数组 (H, W)
    """
    # 缩放到 hash_size * 4 大小（简化实现）
    target_size = hash_size * 4
    h, w = image_array.shape

    # 简单双线性缩放
    resized = np.zeros((target_size, target_size))
    for i in range(target_size):
        for j in range(target_size):
            src_i = int(i * h / target_size)
            src_j = int(j * w / target_size)
            resized[i, j] = image_array[min(src_i, h-1), min(src_j, w-1)]

    # 简化 DCT（取均值代替完整 DCT）
    # 实际应使用 scipy.fft.dct 的完整实现
    block_means = []
    block_h = target_size // hash_size
    for i in range(hash_size):
        for j in range(hash_size):
            block = resized[i*block_h:(i+1)*block_h, j*block_h:(j+1)*block_h]
            block_means.append(np.mean(block))

    block_means = np.array(block_means)
    threshold = np.mean(block_means)
    phash = (block_means > threshold).astype(np.uint8)
    return phash

def hamming_distance(h1: np.ndarray, h2: np.ndarray) -> int:
    """计算汉明距离"""
    return int(np.sum(h1 != h2))

def detect_counterfeit_batch(
    reference_image: np.ndarray,
    sample_images: list,
    hamming_threshold: int = 10,
    weight_specs: list = None  # [(actual_g, expected_g), ...]
) -> dict:
    """
    批次仿冒品检测
    reference_image: 正品参考图
    sample_images: 待检样本图列表
    """
    ref_hash = compute_phash(reference_image)
    results = []

    for i, img in enumerate(sample_images):
        sample_hash = compute_phash(img)
        dist = hamming_distance(ref_hash, sample_hash)
        visual_flag = dist > hamming_threshold

        result = {
            'sample_id': i,
            'hamming_distance': dist,
            'visual_anomaly': visual_flag,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1708.07747，但该号在 arXiv 上是《Fashion-MNIST: a Novel Image Dataset for Benchmarking Machine Learning Algorithms》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Image Hashing via DCTBased Perceptual Hashing》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品正品参考图（正面/侧面/底部）、待检批次产品照片、包装尺寸重量规格；粒度为单件包装图像。

**输出**：每件包装与标准图的汉明距离与异常标记（距离大于 25 判为异常）、疑似仿冒清单与人工复核结论，供品控与品牌保护团队做下架和举报决策。

## 执行步骤

1. 收集正品包装的正面/侧面/底部参考图与待检批次照片。
2. 对每张包装图计算 pHash 感知哈希指纹。
3. 计算待检件与标准图的汉明距离，标记距离大于 25 的异常包装。
4. 汇总异常清单交人工复核，确认后下架并向 Amazon 举报。

## 边界与不做

- 何时不用：正品货源与包装一致性已确认，或问题属于退货品相与新旧的，不用本技能做验真。
- 能力边界：只输出图像相似度证据与疑似清单，不替代品牌方的真伪鉴定与法律判定；拍摄角度与光线差异大时误报会上升。

## 技能关联

- **可组合**：Skill-Supply-Chain-Counterfeit-Detection

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：19-风控反欺诈　·　源卡：`Skill-Supply-Chain-Counterfeit-Detection`