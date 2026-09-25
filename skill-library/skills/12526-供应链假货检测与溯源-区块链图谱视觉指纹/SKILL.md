---
name: "p2s-counterfeit-detection-supply-chain"
title: "Counterfeit Detection Supply Chain — 供应链假货检测与溯源（区块链+图谱+视觉指纹）"
description: "触发词：假货检测、供应链溯源、感知哈希比对、图谱异常、卖家举报。何时不用：只做竞品图片相似度批量筛查用「假冒商品视觉检测」；只监控品牌名与图文侵权用「商标侵权主动监控」。安全边界：举报须有充分证据（相似度报告与公证），误报须人工复核后再投诉；不得据哈希结果直接指控卖家。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索 / 供应商评估"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-Counterfeit-Detection-Supply-Chain"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "用图片指纹、供应链图谱和流转记录三层比对，把平台上的疑似假货卖家和可疑批次找出来，并备好举报材料。"
user_try: "试试：拿正品图片库比对这 30 个跟卖卖家的 Listing 图，按海明距离排序输出疑似假货名单和举报材料。"
whenToUse: "需要结合图片指纹、供应链图谱与批次溯源做假货识别与举证时用本技能；只做图片相似度批量筛查用「假冒商品视觉检测」；监控品牌与图文侵权用「商标侵权主动监控」。"
workflow: "拉取正品产品图片库、竞卖卖家 Listing 图片与供应链流转记录 → 对 Listing 图计算感知哈希，求与正品的最小海明距离 → 对批次流转记录生成溯源哈希并标记异常链路 → 输出疑似假货卖家名单与图片相似度详情 → 整理 Amazon IP Complaint 举报材料并交人工复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Counterfeit Detection Supply Chain — 供应链假货检测与溯源（区块链+图谱+视觉指纹）

## ① 解决的问题

品牌运营面临"平台竞卖卖家中混入假货无法快速识别"——视觉指纹+供应链图谱将假货卖家识别准确率提升至90%，年化通过举报保护品牌价值30-150万元

## ② 核心算法逻辑

核心思想：假货渗透供应链的四个入口（原材料/代工厂/物流/平台销售）需要不同检测手段。本 Skill 集成三层防御体系：视觉指纹（产品图像哈希）、供应链图谱异常检测（GNN）、区块链溯源（不可篡改的流转记录）。

## ③ 业务应用场景

场景1：婴儿配方奶粉平台疑似假货监控（Amazon Seller Central） - 业务问题：品牌发现平台上有 30 个第三方卖家销售同 ASIN，其中 5 个的产品图片 pHash 与正品差异 > 15（疑似换装假货），用户投诉开始出现 - 数据要求：正品产品图片库 + 平台竞卖卖家的 Listing 图片 + 供应链流转记录 - 预期产出：疑似假货卖家名单 + 图片相似度详情 + Amazon IP Complaint 举报材料 - 业务价值：及时清除假货卖家，保护品牌声誉和消费者安全，年化避免召回/赔偿损失 30-100 万元
**三轨验证**： - 成本：图像指纹扫描约 0.001 元/张，区块链节点建设约 10-20 万元一次性投入 - 合规：对竞卖卖家的举报需要有充分证据（图片相似度报告 + 公证） - 风险：pHash 误报（正常光线/拍摄角度差异导致误判），需设置人工复核队列

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：及时识别平台假货卖家并举报，保护品牌声誉；单次假货事件导致的用户信任损失难以量化，年化防护价值 30-150 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：母婴产品假货直接威胁婴儿安全，法律连带责任风险极高；视觉指纹方案成本极低（图像 API），可立即部署。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import hashlib
import numpy as np
from PIL import Image
from io import BytesIO

def phash(image_array: np.ndarray, hash_size: int = 8) -> int:
    """感知哈希（pHash）计算"""
    # 缩放到 hash_size x hash_size
    from PIL import Image as PILImage
    img = PILImage.fromarray(image_array.astype(np.uint8))
    img = img.resize((hash_size, hash_size), PILImage.LANCZOS).convert("L")
    pixels = np.array(img).flatten().astype(float)
    mean = pixels.mean()
    bits = (pixels > mean).astype(int)
    # 转为整数
    return int("".join(map(str, bits)), 2)

def hamming_distance(hash1: int, hash2: int) -> int:
    """汉明距离（不同位数）"""
    xor = hash1 ^ hash2
    return bin(xor).count("1")

def scan_platform_listings(genuine_hashes: list, listing_images: list,
                            threshold: int = 10) -> list:
    """
    扫描平台 Listing 图片，识别疑似假货
    genuine_hashes: 正品 pHash 列表
    listing_images: [(seller_id, image_array), ...]
    threshold: 汉明距离阈值（越大=越宽松）
    """
    results = []
    for seller_id, img_array in listing_images:
        listing_hash = phash(img_array)
        min_dist = min(hamming_distance(listing_hash, gh) for gh in genuine_hashes)
        is_suspicious = min_dist > threshold
        results.append({
            "seller_id": seller_id,
            "min_hamming_distance": min_dist,
            "is_suspicious": is_suspicious,
            "risk_level": ("CRITICAL" if min_dist > 20
                          else "HIGH" if min_dist > threshold
                          else "OK"),
        })
    return sorted(results, key=lambda x: -x["min_hamming_distance"])

def batch_md5_trace(batch_records: list) -> dict:
    """生成批次溯源哈希（模拟区块链上链数据）"""
    traces = {}
    for record in batch_records:
        content = f"{record['batch_id']}|{record['mfg_date']}|{record['factory_id']}|{record['qc_pass']}"
        traces[record["batch_id"]] = {
            "hash": hashlib.sha256(content.encode()).hexdigest()[:16],
            "on_chain": True,
            "record": record,
        }
    return traces

if __name__ == "__main__":
    np.random.seed(42)
    # 正品图像（模拟）
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：正品产品图片库、平台竞卖卖家的 Listing 图片与供应链流转记录（批次、生产日期、工厂、质检结果）。

**输出**：疑似假货卖家名单（含最小海明距离与风险等级）、图片相似度详情与批次溯源哈希，以及 Amazon IP Complaint 举报材料。

## 执行步骤

1. 计算正品图片的感知哈希并建立基准库
2. 对竞卖卖家 Listing 图片求最小海明距离并排序
3. 对批次流转记录生成溯源哈希，核对异常批次
4. 输出疑似假货卖家名单并整理举报材料
5. 把高风险名单交人工复核后再投诉

## 边界与不做

- 光线与拍摄角度差异会造成哈希误判，没有人工复核队列时不得直接投诉
- 只做检测、溯源与举证材料组织，不代替法务判断与正式维权行动
- 对卖家的举报必须有充分证据（相似度报告与公证），不得据单一哈希结果指控

## 技能关联

- **可组合**：Skill-Counterfeit-Detection-Supply-Chain

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：21-合规决策　·　源卡：`Skill-Counterfeit-Detection-Supply-Chain`