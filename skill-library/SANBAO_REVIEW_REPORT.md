# 三宝候选分拣报告

- 生成时间：2026-09-23T23:09:06+08:00
- 明细记录数：12871
- 汇总候选池：64
- Excel：`/Users/lute/project/Career/skill-library/sanbao_review_matrix.xlsx`
- 网站：`/Users/lute/project/Career/skill-library/site/sanbao-review.html`

## 分拣原则

- `primary_cluster_key` 是单值互斥主聚类；技术方法、业务价值和适用对象只作为副标签。
- `needs_review=true`、不可读文本、低置信、输出不清、涉及真实业务动作或敏感内容的记录，先进入待复核或阻塞状态。
- 论文/方法型 skill 可以是方法候选或知识条目候选，不能直接视为已验证执行能力。
- 数字员工候选必须后续补责任、权限、交付和失败处理；本轮不直接晋级数字员工。

## 主聚类分布

- REVIEW_ONLY: 10606
- VALUE_CONTINUOUS_OPERATION: 646
- OPERATING_GOVERNANCE: 462
- CAPABILITY_DATA_SEMANTIC: 342
- VALUE_NEW_PRODUCT: 286
- VALUE_NEW_MARKET: 219
- OUT_OF_SCOPE: 202
- CAPABILITY_TOOL_RUNTIME: 52
- CAPABILITY_KNOWLEDGE_METHOD: 40
- GENERAL_SUPPORT: 16

## 候选层级分布

- REVIEW_ONLY: 8813
- ATOM_SKILL_CANDIDATE: 2012
- FORMAL_CANDIDATE_BLOCKED: 1793
- OUT_OF_SCOPE: 202
- SCENARIO_WORKFLOW_CANDIDATE: 51

## 状态分布

- review: 10606
- draft: 2063
- rejected: 202
