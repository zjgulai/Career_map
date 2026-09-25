---
name: "p2s-promoguardian-promotion-fraud-gnn"
title: "PromoGuardian — 促销欺诈多关系图神经网络检测"
description: "触发词：促销欺诈、优惠券套利、羊毛党、小号集群、设备关联。何时不用：单笔金额异常、同 IP 多卡盗刷的实时拦截走「异常交易检测」；损失发生在退货环节的团伙识别走「退货欺诈识别」。安全边界：只输出风险评分与复查工单，不直接封号、扣款或拒绝发货；设备指纹与 IP 属个人信息，须脱敏存储且不得对外共享。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 促销规划"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-PromoGuardian-Promotion-Fraud-GNN"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促期优惠券被批量套利时，用关系图找出共用设备与地址的套利集团，把促销损失降下来。"
user_try: "试试：帮我看下这次大促的领券订单，哪些账号可能共用同一批设备和收货地址在套券？"
whenToUse: "当损失来自促销券、新客补贴被批量套取，需要从账号关联关系找团伙时用；若只是单笔交易或收货地址异常需要毫秒级拦截，用「异常交易检测」；若损失集中在退货环节，用「退货欺诈识别」。"
workflow: "整理大促期订单、注册、退货与优惠券使用四类明细 → 构建用户-设备-地址-商品多关系图 → 跑两轮消息传递并提取设备共享度与地址重叠特征 → 圈出强连通集团并上调其欺诈概率阈值 → 生成人工复查清单与套利损失估算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PromoGuardian — 促销欺诈多关系图神经网络检测

## ① 解决的问题

促销运营负责人面临大促期优惠券被批量套利日损数万元——多关系图神经网络同时捕获设备/地址/时序三维欺诈信号，促销套利损失减少60-70%，年化节省100-500万元

## ② 核心算法逻辑

传统欺诈检测把用户孤立看待，但促销欺诈通常是群体协作行为：一个主账号带动多个小号组成"刷单环"，利用促销规则批量套利。PromoGuardian 的核心洞察是：欺诈行为在关系图上留下的结构信号远比单节点特征更强。

## ③ 业务应用场景

业务问题：大促期间针对新用户的 $10 优惠券被批量注册账号套取。黑产团伙注册50个小号，同一设备/IP 轮流使用优惠券购买低价商品后立即退货，净套取优惠金额。估算损失：$10/单 × 200单/天 × 30天 = $60,000/月。
PromoGuardian 处理： - 构建大促期间全用户-设备-地址-商品 4 类关系图 - GNN 在2轮消息传递后识别出「设备共享度 > 3 且地址重叠 > 2」的强连通集团 - 对集团内节点提升欺诈概率阈值，触发人工复查
数据要求： - 用户注册信息（设备 fingerprint、注册 IP、邮箱域名） - 订单明细（购买商品 ASIN、金额、时间戳） - 退货记录（退货率 > 80% 为强信号） - 优惠券使用记录（同批次优惠券在同设备被使用 ≥ 2次）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
促销欺诈典型损失：$20,000-$80,000/月（大促期间）
检测后减少 60-70%：$12,000-$56,000/月
年化：$144,000-$672,000（人民币约 100-500 万元）
实施难度：⭐⭐⭐☆☆
核心挑战：构建用户-设备-地址关系图（需要数据脱敏处理）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（271 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/promoguardian_promotion_fraud_gnn` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-PromoGuardian-Promotion-Fraud-GNN.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
PromoGuardian - 促销欺诈多关系图神经网络检测
基于多关系异构图 + GNN 的欺诈用户识别

依赖: numpy, torch (可选替换为纯numpy简化版)
"""

import numpy as np
from collections import defaultdict
from typing import Dict, List, Tuple, Set

# ─────────────────────────────────────────────
# 多关系图构建
# ─────────────────────────────────────────────

class MultiRelationGraph:
    """构建促销欺诈检测所需的多关系用户图"""
    
    RELATION_TYPES = ['device', 'address', 'product', 'timing']
    
    def __init__(self, time_window_hours: int = 24):
        self.time_window = time_window_hours * 3600
        self.edges: Dict[str, List[Tuple]] = {r: [] for r in self.RELATION_TYPES}
        self.node_features: Dict[str, np.ndarray] = {}
    
    def add_orders(self, orders: List[dict]):
        """
        订单列表格式:
        [{'user_id': str, 'device_id': str, 'ip': str, 
          'address_hash': str, 'product_id': str, 
          'timestamp': int, 'coupon_used': bool, 'return_rate': float}]
        """
        # 建立各关系的倒排索引
        device_map = defaultdict(list)
        address_map = defaultdict(list)
        product_map = defaultdict(list)
        
        for o in orders:
            uid = o['user_id']
            device_map[o['device_id']].append(uid)
            device_map[o['ip']].append(uid)
            address_map[o['address_hash']].append(uid)
            product_map[o['product_id']].append(uid)
            
            # 构建用户特征向量
            self.node_features[uid] = np.array([
                o.get('return_rate', 0),
                1.0 if o.get('coupon_used') else 0.0,
                min(o.get('order_count', 1) / 10.0, 1.0),
                min(o.get('account_age_days', 0) / 365.0, 1.0),
            ])
        
        # 建立边：共享设备/IP
        for device, users in device_map.items():
            users = list(set(users))
            for i in range(len(users)):
                for j in range(i+1, len(users)):
                    self.edges['device'].append((users[i], users[j]))
        
        # 建立边：共享收货地址
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.12652 — PromoGuardian: Detecting Promotion Abuse Fraud with Multi-Relation Fused Graph Neural Networks

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需大促期用户注册信息（设备 fingerprint、注册 IP、邮箱域名）、订单明细（商品、金额、时间戳）、退货记录（含退货率）、优惠券使用记录，按账号与设备维度关联，时间窗覆盖整个促销周期。

**输出**：产出账号级欺诈概率评分、设备与地址共享的团伙集团清单（含设备共享度、地址重叠数）、人工复查名单与套利金额估算，供促销运营与风控复核使用。

## 执行步骤

1. 汇总大促期领券、下单、退货与账号注册明细，按账号和设备对齐
2. 构建用户-设备-地址-商品四类关系的异构图
3. 运行两轮消息传递，计算设备共享度与地址重叠等欺诈信号
4. 圈定设备共享度大于 3、地址重叠大于 2 的强连通集团
5. 上调集团内节点的欺诈概率阈值并输出人工复查清单

## 边界与不做

- 缺少设备指纹、收货地址或优惠券使用记录时无法建图，本技能给不出可靠结论，应先补数据
- 只做团伙识别与风险评分，封号、扣款、拒绝发货等处置不在本技能范围
- 黑产手法变化快、样本少时，评分只作线索，须人工复核后再行动

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-PromoGuardian-Promotion-Fraud-GNN

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-PromoGuardian-Promotion-Fraud-GNN`