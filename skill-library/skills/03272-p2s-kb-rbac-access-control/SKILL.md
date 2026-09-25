---
name: "p2s-kb-rbac-access-control"
title: "Skill-KB-RBAC-Access-Control"
description: "触发词：知识库权限、角色访问控制、Pre-filter检索、多租户隔离、字段级脱敏、越权拦截。何时不用：需要跨多个知识源做新鲜度与路由编排时用「知识库声明式编排」；需要按用户角色调整回答深度而非可见性时用「画像驱动检索」。安全边界：权限过滤必须在检索前（Pre-filter）执行，禁止先全量召回再由模型判断；拒答不得泄露受保护字段的存在、名称或数值；访问行为须满足 GDPR/CCPA 可审计要求。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-134"
l3_business: "访问控制"
l3_all: "访问控制 / 授权审查"
l1_l2_l3: "独立控制/数据与AI运行/访问控制"
p2s_card_id: "Skill-KB-RBAC-Access-Control"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同一个问题，运营专员看到暂无权限，采购经理看到真实成本——把知识库按角色切成看得见与看不见两半，且不拖慢检索。"
user_try: "试试：给知识库配上角色权限，让运营专员查不到供应商成本字段，采购经理能查，并把每次访问留成可审计记录。"
whenToUse: "当同一知识库要被不同角色共用、且存在成本、供应商等敏感字段需要分级可见时用本技能；若需要管理多个知识源之间的新鲜度与访问路由，改用「知识库声明式编排」；若可见性相同、只是回答深浅要因人而异，改用「画像驱动检索」。"
workflow: "定义角色与权限（resource_type / resource_id / actions，支持通配符与角色继承） → 为每个知识块打 allowed_roles 与 allowed_users 权限标签 → 查询时先解析当前用户角色集合 → 在检索前做 Pre-filter，只召回授权知识块 → 越权查询返回暂无访问权限提示并记录访问日志"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-KB-RBAC-Access-Control

## ① 解决的问题

企业知识库面临"运营专员意外访问供应商成本数据导致竞争泄密风险"——KB-RBAC细粒度Pre-filter权限控制将越权访问事故降低90%，满足GDPR合规要求，风险价值保护500万元/次

## ② 核心算法逻辑

企业级知识库的细粒度权限控制，确保不同角色只能访问其授权知识，同时不影响RAG检索性能。

## ③ 业务应用场景

一个查询"这个产品的采购成本是多少？"： - 运营专员：返回"该信息您暂无访问权限" - 采购经理：返回精确成本数据 - 安全拦截：防止越权获取竞争敏感信息
**场景2：多租户知识库隔离** SaaS场景：品牌A的知识库数据绝不泄露给品牌B

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据泄露风险：无权限控制时，供应商成本被竞争对手获取损失约500万/次
合规要求：GDPR/CCPA要求数据访问可审计，满足合规避免罚款
实施成本：2周工程工作，vs 数据泄露事故损失百倍
年化风险降低：权限控制减少90%内部数据泄露事故

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（223 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
KB-RBAC: 知识库细粒度访问控制
企业级RAG权限管理
"""
from typing import List, Dict, Set, Optional
from dataclasses import dataclass, field
import hashlib

@dataclass
class Permission:
    """权限定义"""
    resource_type: str   # "document" | "section" | "field"
    resource_id: str     # 资源ID或通配符(*)
    actions: Set[str]    # {"read", "write", "admin"}

@dataclass  
class Role:
    """角色定义"""
    role_id: str
    name: str
    permissions: List[Permission] = field(default_factory=list)
    parent_roles: List[str] = field(default_factory=list)  # 角色继承

@dataclass
class KBChunk:
    """知识块，附带权限标签"""
    chunk_id: str
    content: str
    embedding: Optional[List[float]] = None
    allowed_roles: Set[str] = field(default_factory=set)  # 哪些角色可访问
    allowed_users: Set[str] = field(default_factory=set)
    metadata: Dict = field(default_factory=dict)

class KBRBACController:
    """
    知识库RBAC访问控制器
    支持Pre-filter检索策略
    """
    
    def __init__(self):
        self.roles: Dict[str, Role] = {}
        self.user_roles: Dict[str, Set[str]] = {}  # user -> roles
        self.chunks: Dict[str, KBChunk] = {}
        
        # 预设角色
        self._init_default_roles()
    
    def _init_default_roles(self):
        """初始化默认角色层次"""
        self.roles = {
            "admin": Role("admin", "管理员", [
                Permission("*", "*", {"read", "write", "admin"})
            ]),
            "procurement": Role("procurement", "采购经理", [
                Permission("document", "supplier_*", {"read"}),
                Permission("field", "cost_*", {"read"}),
                Permission("document", "product_*", {"read"}),
            ]),
            "ops": Role("ops", "运营专员", [
                Permission("document", "product_*", {"read"}),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：角色定义（role_id、parent_roles、权限项）、用户与角色映射、知识块的权限标签（allowed_roles、allowed_users、metadata）、查询发起者的用户身份；粒度为文档 / 章节 / 字段三级。

**输出**：过滤后的授权知识块集合，或统一的暂无访问权限拒答；同时产出可审计的访问记录，供 RAG 检索层与合规检查使用。

## 执行步骤

1. 梳理角色层次与权限项，定义到文档、章节、字段三级
2. 给知识块打上允许访问的角色与用户标签
3. 解析用户所属角色并合并继承权限
4. 执行 Pre-filter 过滤，在检索前只保留授权范围内的知识块
5. 对越权提问返回无权限提示并留存访问审计日志

## 边界与不做

- 数据不满足：知识块没有权限标签、或用户身份无法可靠识别时不要上线权限过滤，否则会出现漏筛或全拒。
- 何时不用：需要跨知识源做权限加权与新鲜度编排时用「知识库声明式编排」；只是同权限下调整回答深度时用「画像驱动检索」。
- 能力边界：只负责可见性收口，不负责内容正确性与新鲜度，也不替代模型侧的输出脱敏。
- 安全边界：必须 Pre-filter 而非事后过滤，拒答不得暴露受保护字段的任何细节，访问记录须满足 GDPR/CCPA 可审计要求。

## 技能关联

- **可组合**：Skill-KB-RBAC-Access-Control

---

> 分类：独立控制/数据与AI运行/访问控制　·　技术族：16-智能体工程　·　源卡：`Skill-KB-RBAC-Access-Control`