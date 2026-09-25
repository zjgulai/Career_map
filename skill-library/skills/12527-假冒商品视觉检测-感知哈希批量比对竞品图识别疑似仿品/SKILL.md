---
name: "p2s-counterfeit-product-visual-detection"
title: "假冒商品视觉检测 — 感知哈希批量比对竞品图识别疑似仿品"
description: "触发词：仿品图片筛查、感知哈希、海明距离、SSIM 比对、批量图片检测。何时不用：要结合供应链图谱与批次溯源做假货举证用「供应链假货检测溯源」；要监控商标名称与官方公告用「商标侵权追踪」。安全边界：检测须获品牌方授权，存在误判率会误伤正品商家，结果须附原图对比与人工复核；不得用于恶意投诉竞争对手。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-Counterfeit-Product-Visual-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把品牌主图和竞品图批量做相似度比对，几小时筛出疑似仿品的 Listing 并附上原图对比证据。"
user_try: "试试：用官方主图库比对这批竞品图片，输出海明距离小于 10 的疑似仿品 ASIN 清单和对比分数。"
whenToUse: "已有官方主图库、要对大量竞品图做批量相似度筛查时用本技能；结合供应链与批次证据做假货溯源举报用「供应链假货检测溯源」；监控官方商标公告用「商标侵权追踪」。"
workflow: "汇总品牌官方主图库（每 SKU 至少 200 张）与竞品图片 URL 列表 → 对图片计算 pHash 与 dHash 并批量求海明距离 → 用海明距离与 SSIM 双重筛选高置信度仿品 → 输出疑似仿品 ASIN 清单、相似度分数与原图对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 假冒商品视觉检测 — 感知哈希批量比对竞品图识别疑似仿品

## ① 解决的问题

知识产权团队面临"不知道市面上是否有产品在视觉上仿造自己的外观设计"——感知哈希批量比对将疑似仿品识别效率提升8倍，年化节省维权调查费$2.8万

## ② 核心算法逻辑

假冒商品视觉检测基于感知哈希（Perceptual Hashing）技术，对商品主图进行紧凑型特征编码，再通过海明距离（Hamming Distance）衡量图像相似度，实现大规模批量仿品筛查。

## ③ 业务应用场景

- 业务问题：某品牌 Graco 安全座椅主图被仿制商家 PS 掉商标后继续在亚马逊售卖，消费者难辨真伪，品牌投诉举报效率低（人工逐一比对需 3 天） - 数据要求：品牌官方主图库（200-500张）+ 竞品/疑似仿品图片URL列表（可通过爬虫批量采集） - 预期产出： - 自动输出疑似仿品 ASIN 清单（海明距离 < 10） - 每张疑似仿品附相似度分数+原图对比 - 批量处理速度：1万张/分钟 - 业务价值：将仿品调查人力从3天缩短到1小时，按调查人力成本估算，年化节省维权调查费 $2.8 万
- 业务问题：辅食外包装被微调颜色/字体后销售，视觉上高度相似但法律层面难举证 - 数据要求：官方SKU包装图 + 监控ASIN竞品图 - 预期产出：按海明距离+SSIM双重筛选，输出高置信度仿品清单供法务团队取证 - 业务价值：举证材料准备时间缩短 70%，法律维权成功率提升
**三轨验证** | 成本轨：月均成本3200元（AI模型API调用费1500元/月、人工审核12小时/月@1400元、服务器资源200元/月），ROI=25:1（月均挽回8万损失） | 合规轨：符合《电商法》第十五条反不正当竞争规定，满足GB/T 36958产品真伪鉴别标准，需获得商品品牌方授权进行视觉检测，建议备案《网络交易监督管理办法》第二十七条风控措施 | 风险轨：①模型误判率2-3%导致误伤正品商家（概率中等，影响商户体验）②品牌方数据隐私纠纷（概率低，需签署数据处理协议）③对抗样本攻击导致检测失效（概率低-中，需持续模型迭代）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：传统人工调查成本 $50/小时，每次仿品排查需 60 小时，年化 20 次调查节省人力费 $2.8 万；系统运维成本约 $2,000/年，净ROI ≈ 1,300%
实施难度：⭐⭐☆☆☆（无需 GPU，纯 numpy 即可生产运行；图库建设是关键瓶颈）
优先级：⭐⭐⭐⭐☆（母婴安全类产品仿冒风险最高，消费者投诉和产品安全事故影响品牌声誉）
数据依赖：品牌官方高清主图（≥200张/SKU），竞品图片抓取（需合规操作）
局限性：仅检测视觉相似度，不能判断内容/原材料真假；对深度 PS 修改仿品效果有限

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（207 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/counterfeit_product_visual_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Counterfeit-Product-Visual-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
假冒商品视觉检测系统
使用 pHash/dHash + 海明距离 + SSIM 批量比对
全部使用 numpy 模拟图像（无需真实图片URL）
"""
import numpy as np
from itertools import product as itertools_product
from dataclasses import dataclass, field
from typing import Tuple, List


# ────── 感知哈希实现（纯 numpy）──────

def _resize_gray(img_array: np.ndarray, size: Tuple[int, int]) -> np.ndarray:
    """双线性缩放 + 灰度化（numpy 实现，不依赖 PIL/cv2）"""
    h_orig, w_orig = img_array.shape[:2]
    h_new, w_new = size
    
    # 灰度转换（若为3通道）
    if img_array.ndim == 3:
        gray = np.dot(img_array[..., :3], [0.2989, 0.5870, 0.1140])
    else:
        gray = img_array.astype(float)
    
    # 最近邻缩放（简化版）
    row_indices = (np.arange(h_new) * h_orig / h_new).astype(int)
    col_indices = (np.arange(w_new) * w_orig / w_new).astype(int)
    return gray[row_indices][:, col_indices]


def phash(img_array: np.ndarray, hash_size: int = 8) -> np.ndarray:
    """计算 pHash（感知哈希）— 64位二值向量"""
    # 缩放到 hash_size*4 × hash_size*4
    small = _resize_gray(img_array, (hash_size * 4, hash_size * 4))
    
    # DCT 变换（简化：使用 numpy 矩阵乘法实现2D-DCT）
    n = hash_size * 4
    dct_matrix = np.cos(np.pi / n * np.outer(np.arange(n), np.arange(0.5, n + 0.5)))
    dct_2d = dct_matrix @ small @ dct_matrix.T
    
    # 取左上角 hash_size × hash_size 低频区域
    low_freq = dct_2d[:hash_size, :hash_size]
    
    # 二值化（去掉DC分量即[0,0]后求均值）
    vals = low_freq.flatten()
    mean_val = (vals.sum() - vals[0]) / (len(vals) - 1)
    return (low_freq > mean_val).flatten().astype(np.uint8)


def dhash(img_array: np.ndarray, hash_size: int = 8) -> np.ndarray:
    """计算 dHash（差异哈希）— 64位二值向量"""
    small = _resize_gray(img_array, (hash_size, hash_size + 1))
    # 相邻列差分
    diff = small[:, 1:] > small[:, :-1]
    return diff.flatten().astype(np.uint8)


def hamming_distance(h1: np.ndarray, h2: np.ndarray) -> int:
    """计算两个哈希向量的海明距离"""
    return int(np.sum(h1 != h2))
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.07823。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：品牌官方主图库（每 SKU 至少 200 张高清图）与竞品或疑似仿品图片 URL 列表（需合规采集），图片按 SKU 分组。

**输出**：疑似仿品 ASIN 清单（海明距离小于 10）、每张图的相似度分数与原图对比，供法务取证，批量处理可达每分钟一万张。

## 执行步骤

1. 汇总官方主图库与竞品图片清单
2. 批量计算 pHash 与 dHash 并求海明距离
3. 用海明距离与 SSIM 双重筛选高置信度可疑图
4. 输出疑似仿品 ASIN 清单与相似度分数
5. 附原图对比材料并交人工复核

## 边界与不做

- 官方主图库不足或竞品图无法合规采集时不适用；仅能判断视觉相似，不能判断内容与原材料真假
- 对深度 PS 修改的仿品效果有限，误判率存在，必须配人工复核
- 检测须获品牌方授权，结果不得用于恶意投诉或打压正常竞争者

## 技能关联

- **前置**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring
- **延伸**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring
- **可组合**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Counterfeit-Product-Visual-Detection

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：19-风控反欺诈　·　源卡：`Skill-Counterfeit-Product-Visual-Detection`