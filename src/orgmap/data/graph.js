// 由 scripts/build-canvas-graph.py 生成，不要手改。
// 重新生成：python3 -I scripts/build-canvas-graph.py
window.SANBAO_GRAPH = {
 "schema_version": 1,
 "graph_version": "64a6c2b49dde3426",
 "status": "draft_pending_owner_signoff",
 "counts": {
  "decisions": 377,
  "cards": 63,
  "graph_cards": 33,
  "nodes": 20,
  "relations": 123,
  "unresolved_relations": 3,
  "seats": 53,
  "crosswalk_seats": 53,
  "crosswalk_links": 38
 },
 "org": {
  "level1": [
   {
    "id": "control",
    "name": "独立控制",
    "seat_count": 5,
    "seat_ids": [
     "AGT-005",
     "AGT-042",
     "AGT-043",
     "AGT-044",
     "AGT-050"
    ]
   },
   {
    "id": "mgmt",
    "name": "经营管理",
    "seat_count": 5,
    "seat_ids": [
     "AGT-001",
     "AGT-002",
     "AGT-003",
     "AGT-004",
     "AGT-041"
    ]
   },
   {
    "id": "ops",
    "name": "业务运营",
    "seat_count": 35,
    "seat_ids": [
     "AGT-006",
     "AGT-007",
     "AGT-008",
     "AGT-009",
     "AGT-010",
     "AGT-011",
     "AGT-012",
     "AGT-013",
     "AGT-014",
     "AGT-015",
     "AGT-016",
     "AGT-017",
     "AGT-018",
     "AGT-019",
     "AGT-020",
     "AGT-021",
     "AGT-022",
     "AGT-023",
     "AGT-024",
     "AGT-025",
     "AGT-026",
     "AGT-027",
     "AGT-028",
     "AGT-029",
     "AGT-030",
     "AGT-031",
     "AGT-032",
     "AGT-033",
     "AGT-034",
     "AGT-035",
     "AGT-036",
     "AGT-037",
     "AGT-038",
     "AGT-039",
     "AGT-040"
    ]
   },
   {
    "id": "platform",
    "name": "数据与Agent平台",
    "seat_count": 5,
    "seat_ids": [
     "AGT-045",
     "AGT-046",
     "AGT-047",
     "AGT-048",
     "AGT-049"
    ]
   }
  ],
  "level2": [
   {
    "id": "control--business-org",
    "name": "经营与组织",
    "level1_id": "control",
    "level1_name": "独立控制",
    "seat_ids": [
     "AGT-005"
    ],
    "shared_with": [
     "mgmt--business-org"
    ]
   },
   {
    "id": "control--data-ai",
    "name": "数据与AI运行",
    "level1_id": "control",
    "level1_name": "独立控制",
    "seat_ids": [
     "AGT-050"
    ],
    "shared_with": [
     "platform--data-ai"
    ]
   },
   {
    "id": "control--finance-compliance",
    "name": "财务与合规",
    "level1_id": "control",
    "level1_name": "独立控制",
    "seat_ids": [
     "AGT-042",
     "AGT-043",
     "AGT-044"
    ],
    "shared_with": [
     "mgmt--finance-compliance",
     "ops--finance-compliance"
    ]
   },
   {
    "id": "mgmt--business-org",
    "name": "经营与组织",
    "level1_id": "mgmt",
    "level1_name": "经营管理",
    "seat_ids": [
     "AGT-001",
     "AGT-002",
     "AGT-003",
     "AGT-004"
    ],
    "shared_with": [
     "control--business-org"
    ]
   },
   {
    "id": "mgmt--finance-compliance",
    "name": "财务与合规",
    "level1_id": "mgmt",
    "level1_name": "经营管理",
    "seat_ids": [
     "AGT-041"
    ],
    "shared_with": [
     "control--finance-compliance",
     "ops--finance-compliance"
    ]
   },
   {
    "id": "ops--brand-growth",
    "name": "品牌与增长",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-029",
     "AGT-030",
     "AGT-031",
     "AGT-032",
     "AGT-033",
     "AGT-034",
     "AGT-035"
    ],
    "shared_with": []
   },
   {
    "id": "ops--channel",
    "name": "渠道经营",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-021",
     "AGT-022",
     "AGT-023",
     "AGT-024",
     "AGT-025",
     "AGT-026",
     "AGT-027",
     "AGT-028"
    ],
    "shared_with": []
   },
   {
    "id": "ops--finance-compliance",
    "name": "财务与合规",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-040"
    ],
    "shared_with": [
     "control--finance-compliance",
     "mgmt--finance-compliance"
    ]
   },
   {
    "id": "ops--product-innovation",
    "name": "产品与创新",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-006",
     "AGT-007",
     "AGT-008",
     "AGT-009",
     "AGT-010",
     "AGT-011",
     "AGT-012",
     "AGT-013"
    ],
    "shared_with": []
   },
   {
    "id": "ops--service-experience",
    "name": "服务与体验",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-036",
     "AGT-037",
     "AGT-038",
     "AGT-039"
    ],
    "shared_with": []
   },
   {
    "id": "ops--supply-fulfillment",
    "name": "供应与履约",
    "level1_id": "ops",
    "level1_name": "业务运营",
    "seat_ids": [
     "AGT-014",
     "AGT-015",
     "AGT-016",
     "AGT-017",
     "AGT-018",
     "AGT-019",
     "AGT-020"
    ],
    "shared_with": []
   },
   {
    "id": "platform--data-ai",
    "name": "数据与AI运行",
    "level1_id": "platform",
    "level1_name": "数据与Agent平台",
    "seat_ids": [
     "AGT-045",
     "AGT-046",
     "AGT-047",
     "AGT-048",
     "AGT-049"
    ],
    "shared_with": [
     "control--data-ai"
    ]
   }
  ],
  "seats": [
   {
    "seat_id": "AGT-001",
    "alias": "衡远",
    "title": "经营目标与资源统筹",
    "namespace": "AGT",
    "plane": "经营管理",
    "source_group": "经营与组织",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-001",
    "runtime_layer": "T3_profile",
    "human_owner_ref": "PENDING",
    "slot_id": "OM-01",
    "slot_title": "经营目标承接与取舍准备",
    "slot_basis": "C-300",
    "pilot_role": "resource_tradeoff_profile",
    "node_links": []
   },
   {
    "seat_id": "AGT-002",
    "alias": "枢衡",
    "title": "场景自主编排与异常协调",
    "namespace": "AGT",
    "plane": "经营管理",
    "source_group": "经营与组织",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-002",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "OM-02",
    "slot_title": "经营事项责任与例外说明",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-003",
    "alias": "明镜",
    "title": "经营分析与决策支持",
    "namespace": "AGT",
    "plane": "经营管理",
    "source_group": "经营与组织",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-003",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "OM-03",
    "slot_title": "经营结果对照与解释",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-004",
    "alias": "知人",
    "title": "组织能力与人事行政",
    "namespace": "AGT",
    "plane": "经营管理",
    "source_group": "经营与组织",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-004",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "OM-04",
    "slot_title": "组织能力供需研判",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-005",
    "alias": "守衡",
    "title": "内控审计与独立复核",
    "namespace": "AGT",
    "plane": "独立控制",
    "source_group": "经营与组织",
    "tier": "T1",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-005",
    "runtime_layer": "T2_session",
    "human_owner_ref": "PENDING",
    "slot_id": "IC-01",
    "slot_title": "经营证据与利益冲突独立复核",
    "slot_basis": "C-308",
    "pilot_role": "independent_assurance",
    "node_links": []
   },
   {
    "seat_id": "AGT-006",
    "alias": "听澜",
    "title": "消费者需求与VOC研究",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T2",
    "admission_status": "PARTIAL",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-006",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-01",
    "slot_title": "消费者问题与需求证据",
    "slot_basis": "C-301",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "consumer",
      "relation": "direct_reuse",
      "basis": [
       "C-301",
       "C-018",
       "C-019"
      ],
      "note": "直接以 C-018/C-019 需求证据与问题地图为权威骨架"
     }
    ]
   },
   {
    "seat_id": "AGT-007",
    "alias": "望野",
    "title": "市场竞争与机会研究",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-007",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-02",
    "slot_title": "市场变化与机会证据",
    "slot_basis": "C-301",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "business",
      "relation": "evidence_input",
      "basis": [
       "C-301",
       "C-021"
      ],
      "note": "交市场机会证据与反证说明，不替 C-021 比较经营选项"
     }
    ]
   },
   {
    "seat_id": "AGT-008",
    "alias": "拓新",
    "title": "产品组合与新品孵化",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-008",
    "runtime_layer": "T2_session",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-03",
    "slot_title": "新品组合假设与阶段建议",
    "slot_basis": "C-301",
    "pilot_role": "case_lead",
    "node_links": [
     {
      "node_id": "business",
      "relation": "evidence_input",
      "basis": [
       "C-301",
       "C-021"
      ],
      "note": "交候选组合与验证路径说明，不替 C-021 做单项商业论证"
     }
    ]
   },
   {
    "seat_id": "AGT-009",
    "alias": "定形",
    "title": "产品定义与商业立项",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-009",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-04",
    "slot_title": "产品要求与验收定义",
    "slot_basis": "C-301",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "definition",
      "relation": "direct_reuse",
      "basis": [
       "C-301",
       "C-023"
      ],
      "note": "直接复用 C-023 当前阶段可验证的产品要求与约束"
     }
    ]
   },
   {
    "seat_id": "AGT-010",
    "alias": "映物",
    "title": "工业设计与用户体验",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-010",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-05",
    "slot_title": "产品体验与工业设计方案",
    "slot_basis": "C-301",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "realization",
      "relation": "sub_contributor",
      "basis": [
       "C-301",
       "C-025"
      ],
      "note": "交体验与工业设计方案，不替 C-025 交完整实现物"
     }
    ]
   },
   {
    "seat_id": "AGT-011",
    "alias": "砺器",
    "title": "硬件结构与材料工程",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-011",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-06",
    "slot_title": "硬件工程可行性与风险",
    "slot_basis": "C-302",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "realization",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "C-025 中的硬件与材料专业贡献"
     }
    ]
   },
   {
    "seat_id": "AGT-012",
    "alias": "灵枢",
    "title": "软件算法与应用生态",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-012",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-07",
    "slot_title": "软件算法方案与工程证据",
    "slot_basis": "C-302",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "realization",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "C-025 中的软件与算法专业贡献"
     }
    ]
   },
   {
    "seat_id": "AGT-013",
    "alias": "求证",
    "title": "产品验证与研发项目",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "产品与创新",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-013",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-08",
    "slot_title": "产品验证与缺陷复验",
    "slot_basis": "C-302",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "verification",
      "relation": "direct_reuse",
      "basis": [
       "C-302",
       "C-026"
      ],
      "note": "直接复用 C-026 产品验证结论"
     }
    ]
   },
   {
    "seat_id": "AGT-014",
    "alias": "择源",
    "title": "OEM供应商开发与协同",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-014",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-09",
    "slot_title": "供应商能力与风险评估",
    "slot_basis": "C-302",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "realization",
      "relation": "evidence_input",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "为 C-025 提供 OEM 供应商能力与风险事实"
     },
     {
      "node_id": "supplyReadiness",
      "relation": "evidence_input",
      "basis": [
       "C-302",
       "C-029"
      ],
      "note": "为 C-029 提供供应来源事实"
     }
    ]
   },
   {
    "seat_id": "AGT-015",
    "alias": "契约",
    "title": "采购与合同履约",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-015",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-10",
    "slot_title": "采购条件与履约事实",
    "slot_basis": "C-302",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "supplyReadiness",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-029"
      ],
      "note": "C-029 的采购条件与履约偏差来源专业"
     }
    ]
   },
   {
    "seat_id": "AGT-016",
    "alias": "知量",
    "title": "需求预测与补货计划",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-016",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-11",
    "slot_title": "补货候选与供需约束",
    "slot_basis": "C-303",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "demandAnalysis",
      "relation": "readonly_consumer",
      "basis": [
       "C-303",
       "C-312",
       "C-044"
      ],
      "note": "只读引用 C-044 需求情景，不另做需求预测"
     },
     {
      "node_id": "supplyReadiness",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-312",
       "C-029",
       "C-045"
      ],
      "note": "为 C-029/C-045 提供补货候选与供需约束说明"
     }
    ]
   },
   {
    "seat_id": "AGT-017",
    "alias": "衡仓",
    "title": "库存与商品生命周期",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-017",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-12",
    "slot_title": "库存可用性与生命周期风险",
    "slot_basis": "C-303",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "supplyReadiness",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供真实可用库存与库龄风险说明"
     },
     {
      "node_id": "channelPublication",
      "relation": "evidence_input",
      "basis": [
       "C-303",
       "C-030"
      ],
      "note": "区分账面库存与 C-030 渠道实际可售"
     }
    ]
   },
   {
    "seat_id": "AGT-018",
    "alias": "质守",
    "title": "生产协同与质量控制",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-018",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-13",
    "slot_title": "生产质量异常与纠正验证",
    "slot_basis": "C-303",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "verification",
      "relation": "boundary_contributor",
      "basis": [
       "C-303",
       "C-026"
      ],
      "note": "交质量事件与纠正措施说明，不替 C-026 作完整产品验证"
     }
    ]
   },
   {
    "seat_id": "AGT-019",
    "alias": "通途",
    "title": "跨境物流与关务",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-019",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-14",
    "slot_title": "跨境运输与通关条件",
    "slot_basis": "C-303",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "supplyReadiness",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供跨境运输路线、ETA 区间与通关条件说明"
     }
    ]
   },
   {
    "seat_id": "AGT-020",
    "alias": "行舟",
    "title": "仓储履约与退货处置",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "供应与履约",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-020",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-15",
    "slot_title": "仓储履约与退货事实",
    "slot_basis": "C-303",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "supplyReadiness",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供仓储履约与退货入仓事实说明"
     }
    ]
   },
   {
    "seat_id": "AGT-021",
    "alias": "北辰",
    "title": "Amazon业务经营",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-021",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-16",
    "slot_title": "渠道经营目标与偏差诊断",
    "slot_basis": "C-304",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-022",
    "alias": "觅位",
    "title": "Amazon商品与搜索运营",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-022",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-17",
    "slot_title": "渠道商品可发现性与搜索表现诊断",
    "slot_basis": "C-304",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-023",
    "alias": "自航",
    "title": "独立站经营与转化",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-023",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-18",
    "slot_title": "自营站购买旅程与转化诊断",
    "slot_basis": "C-304",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "effectEvaluation",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-038"
      ],
      "note": "交购买旅程摩擦证据与候选改进，不替 C-038 判断效果"
     }
    ]
   },
   {
    "seat_id": "AGT-024",
    "alias": "拓域",
    "title": "其他平台与新市场经营",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-024",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-19",
    "slot_title": "候选渠道规则与运营适配证据",
    "slot_basis": "C-304",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "launch",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-027"
      ],
      "note": "核对候选渠道规则与运营适配证据，不替 C-027 制定上市方案"
     },
     {
      "node_id": "channelPublication",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-030"
      ],
      "note": "为 C-030 提供渠道规则边界"
     }
    ]
   },
   {
    "seat_id": "AGT-025",
    "alias": "联商",
    "title": "零售渠道与B2B拓展",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-025",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-20",
    "slot_title": "零售与B2B合作机会资格核对",
    "slot_basis": "C-304",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-026",
    "alias": "衡价",
    "title": "定价促销与商品组合",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-026",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-21",
    "slot_title": "范围化价格、促销与商品组合研判",
    "slot_basis": "C-305",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "pricingPromotion",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-035"
      ],
      "note": "直接复用 C-035 定价与促销"
     }
    ]
   },
   {
    "seat_id": "AGT-027",
    "alias": "守店",
    "title": "店铺账号健康与规则",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T1",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-027",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-22",
    "slot_title": "店铺账号健康与规则事件诊断",
    "slot_basis": "C-305",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "marketAccess",
      "relation": "boundary_contributor",
      "basis": [
       "C-305",
       "C-028"
      ],
      "note": "守账号与店铺规则事件，不替 C-028 作产品准入"
     },
     {
      "node_id": "channelPublication",
      "relation": "boundary_contributor",
      "basis": [
       "C-305",
       "C-030"
      ],
      "note": "提供账号健康限制事实，不替 C-030 作可售判断"
     }
    ]
   },
   {
    "seat_id": "AGT-028",
    "alias": "译境",
    "title": "本地化与市场适配",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "渠道经营",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-028",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-23",
    "slot_title": "本地化语境与术语适配判断",
    "slot_basis": "C-305",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "contentExpression",
      "relation": "sub_contributor",
      "basis": [
       "C-305",
       "C-033"
      ],
      "note": "C-033 中的本地化语境与术语适配专业贡献"
     }
    ]
   },
   {
    "seat_id": "AGT-029",
    "alias": "立言",
    "title": "品牌战略与传播",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-029",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-24",
    "slot_title": "品牌定位、主张与表达准则",
    "slot_basis": "C-305",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "brandPositioning",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-034"
      ],
      "note": "直接复用 C-034 品牌定位与主张"
     }
    ]
   },
   {
    "seat_id": "AGT-030",
    "alias": "叙事",
    "title": "内容与创意策划",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-030",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-25",
    "slot_title": "内容方案与创意表达",
    "slot_basis": "C-305",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "contentExpression",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-033"
      ],
      "note": "直接复用 C-033 内容策划与表达"
     }
    ]
   },
   {
    "seat_id": "AGT-031",
    "alias": "绘影",
    "title": "视觉视频与素材生产",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-031",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-26",
    "slot_title": "渠道素材制作与版本交付",
    "slot_basis": "C-306",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "contentExpression",
      "relation": "sub_contributor",
      "basis": [
       "C-306",
       "C-033"
      ],
      "note": "C-033/BO-25 内部的素材制作与版本交付子位"
     }
    ]
   },
   {
    "seat_id": "AGT-032",
    "alias": "点火",
    "title": "效果广告投放",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T1",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-032",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-27",
    "slot_title": "付费媒体投放与优化",
    "slot_basis": "C-306",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "paidMedia",
      "relation": "direct_reuse",
      "basis": [
       "C-306",
       "C-037"
      ],
      "note": "直接复用 C-037 付费媒体投放与优化"
     }
    ]
   },
   {
    "seat_id": "AGT-033",
    "alias": "结伴",
    "title": "达人与联盟合作",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-033",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-28",
    "slot_title": "达人与联盟合作适配与履约",
    "slot_basis": "C-306",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-034",
    "alias": "续缘",
    "title": "CRM留存与复购",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-034",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-29",
    "slot_title": "客户阶段与留存复购触达",
    "slot_basis": "C-306",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-035",
    "alias": "试真",
    "title": "增长实验与增量评估",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "品牌与增长",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-035",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-30",
    "slot_title": "经营实验与效果评估",
    "slot_basis": "C-306",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "effectEvaluation",
      "relation": "direct_reuse",
      "basis": [
       "C-306",
       "C-038"
      ],
      "note": "直接复用 C-038 经营实验与效果评估"
     }
    ]
   },
   {
    "seat_id": "AGT-036",
    "alias": "安心",
    "title": "售前服务与购买指导",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "服务与体验",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-036",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-31",
    "slot_title": "售前问题核对与选购答复",
    "slot_basis": "C-307",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-037",
    "alias": "解忧",
    "title": "售后客诉与服务补救",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "服务与体验",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-037",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-32",
    "slot_title": "客户问题分诊与服务补救",
    "slot_basis": "C-307",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-038",
    "alias": "回声",
    "title": "体验洞察与质量反馈",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "服务与体验",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-038",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-33",
    "slot_title": "体验问题聚合与改进证据回流",
    "slot_basis": "C-307",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "consumer",
      "relation": "evidence_input",
      "basis": [
       "C-307",
       "C-018"
      ],
      "note": "向 C-018 回流体验问题簇与改进证据"
     },
     {
      "node_id": "verification",
      "relation": "evidence_input",
      "basis": [
       "C-307",
       "C-026"
      ],
      "note": "向 C-026 回流质量与缺陷线索"
     }
    ]
   },
   {
    "seat_id": "AGT-039",
    "alias": "同行",
    "title": "用户教育与会员社区",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "服务与体验",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-039",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-34",
    "slot_title": "用户使用支持与教育反馈",
    "slot_basis": "C-307",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-040",
    "alias": "清账",
    "title": "GMV结算与会计对账",
    "namespace": "AGT",
    "plane": "业务运营",
    "source_group": "财务与合规",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-040",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "BO-35",
    "slot_title": "交易—资金事实对账与差异回位",
    "slot_basis": "C-307",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-041",
    "alias": "守金",
    "title": "经营财务与资金",
    "namespace": "AGT",
    "plane": "经营管理",
    "source_group": "财务与合规",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-041",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "OM-05",
    "slot_title": "经营资源与资金条件评估",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "economics",
      "relation": "boundary_contributor",
      "basis": [
       "C-300",
       "C-036"
      ],
      "note": "提供资源与资金条件说明，不替 C-036/C-193 完成选项级经济性"
     }
    ]
   },
   {
    "seat_id": "AGT-042",
    "alias": "合账",
    "title": "税务与跨境实体协作",
    "namespace": "AGT",
    "plane": "独立控制",
    "source_group": "财务与合规",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-042",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "IC-02",
    "slot_title": "税务与跨境实体义务核对",
    "slot_basis": "C-308",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-043",
    "alias": "律衡",
    "title": "法务与知识产权",
    "namespace": "AGT",
    "plane": "独立控制",
    "source_group": "财务与合规",
    "tier": "T3",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-043",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "IC-03",
    "slot_title": "合同权利与知识产权风险核对",
    "slot_basis": "C-308",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-044",
    "alias": "安界",
    "title": "产品合规与隐私",
    "namespace": "AGT",
    "plane": "独立控制",
    "source_group": "财务与合规",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-044",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "IC-04",
    "slot_title": "产品准入、宣称与隐私控制条件",
    "slot_basis": "C-308",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "marketAccess",
      "relation": "direct_reuse",
      "basis": [
       "C-308",
       "C-028"
      ],
      "note": "直接承接 C-028 产品市场准入主站位并补宣称与隐私边界"
     }
    ]
   },
   {
    "seat_id": "AGT-045",
    "alias": "同尺",
    "title": "业务口径与主数据",
    "namespace": "AGT",
    "plane": "数据与Agent平台",
    "source_group": "数据与AI运行",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-045",
    "runtime_layer": "T0_plus_T3",
    "human_owner_ref": "PENDING",
    "slot_id": "DA-01",
    "slot_title": "经营口径与对象关系约定",
    "slot_basis": "C-309",
    "pilot_role": "metric_contract_and_validation",
    "node_links": [
     {
      "node_id": "businessDefinitions",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-040"
      ],
      "note": "直接复用 C-040 经营口径与对象关系治理"
     }
    ]
   },
   {
    "seat_id": "AGT-046",
    "alias": "清源",
    "title": "数据工程与质量",
    "namespace": "AGT",
    "plane": "数据与Agent平台",
    "source_group": "数据与AI运行",
    "tier": "T1",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-046",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "DA-02",
    "slot_title": "经营数据供给与质量溯源",
    "slot_basis": "C-309",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "dataSupply",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-039"
      ],
      "note": "直接复用 C-039 经营数据供给与质量保障"
     }
    ]
   },
   {
    "seat_id": "AGT-047",
    "alias": "接桥",
    "title": "系统集成与业务工具",
    "namespace": "AGT",
    "plane": "数据与Agent平台",
    "source_group": "数据与AI运行",
    "tier": "T2",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-047",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "DA-03",
    "slot_title": "系统集成与工具能力契约",
    "slot_basis": "C-309",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-048",
    "alias": "积知",
    "title": "知识技能与Playbook治理",
    "namespace": "AGT",
    "plane": "数据与Agent平台",
    "source_group": "数据与AI运行",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-048",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "DA-04",
    "slot_title": "知识、方法与能力证据资产治理",
    "slot_basis": "C-309",
    "pilot_role": null,
    "node_links": [
     {
      "node_id": "knowledgeStewardship",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-051"
      ],
      "note": "直接复用 C-051 经营知识整理与维护"
     },
     {
      "node_id": "productInformation",
      "relation": "platform_steward",
      "basis": [
       "C-309",
       "C-031"
      ],
      "note": "归集 C-031 商品资料管理中的平台维护侧"
     }
    ]
   },
   {
    "seat_id": "AGT-049",
    "alias": "稳行",
    "title": "Agent平台与可靠运行",
    "namespace": "AGT",
    "plane": "数据与Agent平台",
    "source_group": "数据与AI运行",
    "tier": "T1",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-049",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "DA-05",
    "slot_title": "Agent运行证据与可靠性",
    "slot_basis": "C-309",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "AGT-050",
    "alias": "门卫",
    "title": "信息安全与权限",
    "namespace": "AGT",
    "plane": "独立控制",
    "source_group": "数据与AI运行",
    "tier": "T0",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/05-agents/role-catalog.json#AGT-050",
    "runtime_layer": "unassigned",
    "human_owner_ref": "PENDING",
    "slot_id": "IC-05",
    "slot_title": "身份、权限与安全访问边界",
    "slot_basis": "C-308",
    "pilot_role": null,
    "node_links": []
   }
  ],
  "governance": [
   {
    "seat_id": "MGT-001",
    "alias": "天時",
    "title": "首席执行官 CEO",
    "namespace": "MGT",
    "plane": "决策权平面",
    "source_group": "全局组合",
    "tier": "T4",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/04-organization/management/management-catalog.json#MGT-001",
    "runtime_layer": "T4_rule_pack",
    "human_owner_ref": "PENDING",
    "slot_id": "MGT-01",
    "slot_title": "企业方向与跨域优先级决策权参照",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "MGT-002",
    "alias": "地利",
    "title": "首席增长官 CGO",
    "namespace": "MGT",
    "plane": "决策权平面",
    "source_group": "渠道·品牌·增长·服务·履约·产品",
    "tier": "T4",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/04-organization/management/management-catalog.json#MGT-002",
    "runtime_layer": "T4_rule_pack",
    "human_owner_ref": "PENDING",
    "slot_id": "MGT-02",
    "slot_title": "增长组合与需求侧取舍决策权参照",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   },
   {
    "seat_id": "MGT-003",
    "alias": "人和",
    "title": "首席治理官 CGOv",
    "namespace": "MGT",
    "plane": "决策权平面",
    "source_group": "财务·合规·质量·账号·数据与AI平台",
    "tier": "T4",
    "admission_status": "UNVERIFIED",
    "production_authorized": false,
    "runtime_identity_status": false,
    "catalog_ref": "docs/04-organization/management/management-catalog.json#MGT-003",
    "runtime_layer": "T4_rule_pack",
    "human_owner_ref": "PENDING",
    "slot_id": "MGT-03",
    "slot_title": "治理边界与重大例外决策权参照",
    "slot_basis": "C-300",
    "pilot_role": null,
    "node_links": []
   }
  ],
  "pilot_lens": {
   "id": "FLOW-02-SCN-002",
   "title": "FLOW-02 × SCN-002 只读试点镜头（P1 证据入池 + P2 机会命题）",
   "status": "draft_preconditions_incomplete",
   "authorization_ref": ".codex/sanbao-pilot-authorization-flow02-scn002-20261104.md",
   "charter_ref": "deliverables/execution/sanbao-handoff-20261104/05-pilot-charter.md",
   "active_sessions": 2,
   "seats": [
    {
     "seat_id": "AGT-008",
     "mode": "T2_case_lead_session",
     "stages": [
      "STG-02",
      "STG-04",
      "STG-05",
      "STG-07",
      "STG-08"
     ],
     "duty": "事项主责（Case Lead），汇总证据与机会命题，记录 STG-07 无动作回执与 STG-08 关闭"
    },
    {
     "seat_id": "AGT-005",
     "mode": "T2_assurance_session",
     "stages": [
      "STG-06"
     ],
     "duty": "独立复核（Assurance），执行利益冲突前置检查（coi_check.py）与证据可证伪性复核，发起人不得覆盖拒绝"
    },
    {
     "seat_id": "AGT-001",
     "mode": "T3_profile_injection",
     "stages": [
      "STG-02",
      "STG-05"
     ],
     "duty": "资源约束与组合取舍输入（注入 Lead 上下文，不占独立 session）"
    },
    {
     "seat_id": "AGT-045",
     "mode": "T0_validator_plus_T3_profile",
     "stages": [
      "STG-02",
      "STG-04"
     ],
     "duty": "指标契约、对象关系与口径冲突校验（不占独立 session）"
    }
   ],
   "context_injected_seats": [
    {
     "seat_id": "AGT-006",
     "stages": [
      "STG-04"
     ],
     "duty": "消费者问题与需求证据 T3 注入"
    },
    {
     "seat_id": "AGT-007",
     "stages": [
      "STG-04"
     ],
     "duty": "市场变化与机会证据 T3 注入"
    },
    {
     "seat_id": "AGT-009",
     "stages": [
      "STG-05"
     ],
     "duty": "产品要求边界 T3 注入"
    },
    {
     "seat_id": "AGT-035",
     "stages": [
      "STG-05"
     ],
     "duty": "实验与可证伪假设 T3 注入"
    },
    {
     "seat_id": "AGT-048",
     "stages": [
      "STG-03"
     ],
     "duty": "上下文装配与版本哈希核对"
    }
   ],
   "target_nodes": [
    "consumer",
    "business",
    "definition",
    "effectEvaluation",
    "businessDefinitions",
    "knowledgeStewardship"
   ],
   "stages": [
    {
     "id": "STG-01",
     "name": "信号接收",
     "actor": "Case Control (T0)",
     "artifact": "信号信封",
     "gate": "字段齐全、hash 可重算、去重键可关联"
    },
    {
     "id": "STG-02",
     "name": "范围与章程",
     "actor": "AGT-008 + AGT-001 + AGT-045",
     "artifact": "事项章程",
     "gate": "恰好 1 flow + 1 scenario；出现「有限放量」立即拒绝"
    },
    {
     "id": "STG-03",
     "name": "上下文装配",
     "actor": "Case Control + AGT-048",
     "artifact": "上下文清单",
     "gate": "恰好 1 主责；版本 hash 匹配；只读策略覆盖全部数据源"
    },
    {
     "id": "STG-04",
     "name": "证据与诊断",
     "actor": "AGT-008（含 AGT-006/007/045 注入）",
     "artifact": "证据包 + 诊断记录",
     "gate": "每条 claim 有来源/版本/hash；派生源不计独立源；缺失标 UNKNOWN"
    },
    {
     "id": "STG-05",
     "name": "决策包",
     "actor": "AGT-008（含 AGT-009/001/035 注入）",
     "artifact": "机会命题决策包",
     "gate": "含可证伪假设与停止条件；把创意当事实立即 RETURN"
    },
    {
     "id": "STG-06",
     "name": "独立复核",
     "actor": "AGT-005（独立 session）",
     "artifact": "IndependenceDeclaration + 复核决定",
     "gate": "coi_check 通过（proposer != reviewer）；发起人不得覆盖拒绝"
    },
    {
     "id": "STG-07",
     "name": "只读无动作",
     "actor": "AGT-008 + Policy Gate",
     "artifact": "ART-NO-ACTION-RECORD",
     "gate": "0 ActionIntent、0 外部请求、0 凭据；出现动作意图即 FROZEN"
    },
    {
     "id": "STG-08",
     "name": "事项关闭",
     "actor": "AGT-008 + AGT-001",
     "artifact": "ART-CASE-CLOSURE",
     "gate": "证据不足判 PARTIAL 而非 SUCCESS；未解项必须有 owner"
    }
   ],
   "preconditions": {
    "overall": "ENGINEERING_READY_AWAITING_SIGNOFF",
    "counts": {
     "total": 7,
     "engineering_ready": 4,
     "awaiting_human_signoff": 3,
     "failed": 0
    },
    "items": [
     {
      "id": "P1",
      "title": "席位注册表 53 行与 runtime_layer",
      "state": "ENGINEERING_READY",
      "detail": "53/53 必填字段非空，46 席显式 unassigned，4 席试点层与 3 席 T4 规则包已绑定",
      "errors": []
     },
     {
      "id": "P2",
      "title": "只读覆盖层（50 AGT preset + 3 MGT rule pack）",
      "state": "ENGINEERING_READY",
      "detail": "50/50 AGT preset (agt-NNN) can_emit_action_intent=false + 3/3 MGT rule pack = 53/53 覆盖",
      "errors": []
     },
     {
      "id": "P3",
      "title": "离线证据包 manifest（sha256 + row_count + 独立源）",
      "state": "AWAITING_HUMAN_SIGNOFF",
      "detail": "2 个独立源（42 行 + 108 行）15 字段、sha256 与 row_count 校验全绿（受控合成样本；待指定真实品类数据 owner）",
      "errors": []
     },
     {
      "id": "P4",
      "title": "layer_0 具名人类 owner 与替补",
      "state": "AWAITING_HUMAN_SIGNOFF",
      "detail": "layer_0 六个责任槽位与 SLA 已定义，6/6 待真人落名",
      "errors": []
     },
     {
      "id": "P5",
      "title": "只读访问策略（read-policy-flow-02）",
      "state": "ENGINEERING_READY",
      "detail": "deny-by-default、字段白名单/全局黑名单、TTL 24h、并发=2、14 字段 hash_chain 审计已就绪",
      "errors": []
     },
     {
      "id": "P6",
      "title": "DSH 目标基座与构建 hash 冻结",
      "state": "AWAITING_HUMAN_SIGNOFF",
      "detail": "目标包与 preset_schema 已锁定；desktop/harness/compiler 三个构建 hash 待宿主环境冻结",
      "errors": []
     },
     {
      "id": "P7",
      "title": "Risk Interrupt 风险中断分级与 SLA 通道",
      "state": "ENGINEERING_READY",
      "detail": "SEV-1(15m)/SEV-2(2h)/SEV-3(24h) 分级、触发域与冻结动作已完备（on-call 随前置 #4 落名）",
      "errors": []
     }
    ]
   }
  },
  "registry_meta": {
   "version": "1.0.0-draft",
   "status": "draft_pending_owner_signoff",
   "artifact_kind": "sanbao_seat_registry_not_runtime_configuration",
   "seat_count": {
    "total": 53,
    "AGT": 50,
    "MGT": 3
   },
   "tier_definitions": {
    "T0": "deterministic execution mode: this run loads no persona/soul/memory; the seat keeps its 53-seat identity, role card and persona reference; semantic work requires a separately authorized T3 profile run.",
    "T1": "resident agent: cross-case, event-subscribed, independent memory and isolated evidence",
    "T2": "case crew agent: flow primary-eligible or assembled as Worker; case-scoped",
    "T3": "on-demand profile: no independent lifecycle; narrow lens injected into T1/T2",
    "T4": "decision-rights rule pack + named human owner; not an agent"
   }
  }
 },
 "network": {
  "nodes": [
   {
    "id": "brandPositioning",
    "title": "品牌定位与主张",
    "short": "带依据与范围的<br>定位、主张和表达准则",
    "codes": "C-034",
    "x": 1216,
    "y": 880,
    "w": 320,
    "h": 204,
    "row": 2,
    "col": 3,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-brand-positioning.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-029",
      "alias": "立言",
      "title": "品牌战略与传播",
      "plane": "业务运营",
      "source_group": "品牌与增长",
      "slot_id": "BO-24",
      "slot_title": "品牌定位、主张与表达准则",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-034"
      ],
      "note": "直接复用 C-034 品牌定位与主张"
     }
    ]
   },
   {
    "id": "business",
    "title": "商业论证",
    "short": "可比较的经营选项<br>与验证建议",
    "codes": "C-021 / C-022",
    "x": 448,
    "y": 280,
    "w": 320,
    "h": 204,
    "row": 0,
    "col": 1,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-business-definitions.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-007",
      "alias": "望野",
      "title": "市场竞争与机会研究",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-02",
      "slot_title": "市场变化与机会证据",
      "relation": "evidence_input",
      "basis": [
       "C-301",
       "C-021"
      ],
      "note": "交市场机会证据与反证说明，不替 C-021 比较经营选项"
     },
     {
      "seat_id": "AGT-008",
      "alias": "拓新",
      "title": "产品组合与新品孵化",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-03",
      "slot_title": "新品组合假设与阶段建议",
      "relation": "evidence_input",
      "basis": [
       "C-301",
       "C-021"
      ],
      "note": "交候选组合与验证路径说明，不替 C-021 做单项商业论证"
     }
    ]
   },
   {
    "id": "businessDefinitions",
    "title": "经营口径与对象关系治理",
    "short": "经营口径与对象关系约定<br>业务责任方 · 范围 · 版本",
    "codes": "C-040",
    "x": 600,
    "y": 520,
    "w": 400,
    "h": 204,
    "row": null,
    "col": null,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-business-definitions.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-045",
      "alias": "同尺",
      "title": "业务口径与主数据",
      "plane": "数据与Agent平台",
      "source_group": "数据与AI运行",
      "slot_id": "DA-01",
      "slot_title": "经营口径与对象关系约定",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-040"
      ],
      "note": "直接复用 C-040 经营口径与对象关系治理"
     }
    ]
   },
   {
    "id": "channelPublication",
    "title": "渠道发布与可售核验",
    "short": "渠道发布结果与可售判断",
    "codes": "C-030",
    "x": 64,
    "y": 880,
    "w": 320,
    "h": 204,
    "row": 2,
    "col": 0,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-channel-publication.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-017",
      "alias": "衡仓",
      "title": "库存与商品生命周期",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-12",
      "slot_title": "库存可用性与生命周期风险",
      "relation": "evidence_input",
      "basis": [
       "C-303",
       "C-030"
      ],
      "note": "区分账面库存与 C-030 渠道实际可售"
     },
     {
      "seat_id": "AGT-024",
      "alias": "拓域",
      "title": "其他平台与新市场经营",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-19",
      "slot_title": "候选渠道规则与运营适配证据",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-030"
      ],
      "note": "为 C-030 提供渠道规则边界"
     },
     {
      "seat_id": "AGT-027",
      "alias": "守店",
      "title": "店铺账号健康与规则",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-22",
      "slot_title": "店铺账号健康与规则事件诊断",
      "relation": "boundary_contributor",
      "basis": [
       "C-305",
       "C-030"
      ],
      "note": "提供账号健康限制事实，不替 C-030 作可售判断"
     }
    ]
   },
   {
    "id": "consumer",
    "title": "消费者需求洞察",
    "short": "需求证据与问题地图",
    "codes": "C-018 / C-019",
    "x": 64,
    "y": 280,
    "w": 320,
    "h": 204,
    "row": 0,
    "col": 0,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-consumer-needs-insight.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-006",
      "alias": "听澜",
      "title": "消费者需求与VOC研究",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-01",
      "slot_title": "消费者问题与需求证据",
      "relation": "direct_reuse",
      "basis": [
       "C-301",
       "C-018",
       "C-019"
      ],
      "note": "直接以 C-018/C-019 需求证据与问题地图为权威骨架"
     },
     {
      "seat_id": "AGT-038",
      "alias": "回声",
      "title": "体验洞察与质量反馈",
      "plane": "业务运营",
      "source_group": "服务与体验",
      "slot_id": "BO-33",
      "slot_title": "体验问题聚合与改进证据回流",
      "relation": "evidence_input",
      "basis": [
       "C-307",
       "C-018"
      ],
      "note": "向 C-018 回流体验问题簇与改进证据"
     }
    ]
   },
   {
    "id": "contentExpression",
    "title": "内容策划与表达",
    "short": "带依据与验证意图的<br>内容方案及素材",
    "codes": "C-033",
    "x": 832,
    "y": 880,
    "w": 320,
    "h": 204,
    "row": 2,
    "col": 2,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-content-expression.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-028",
      "alias": "译境",
      "title": "本地化与市场适配",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-23",
      "slot_title": "本地化语境与术语适配判断",
      "relation": "sub_contributor",
      "basis": [
       "C-305",
       "C-033"
      ],
      "note": "C-033 中的本地化语境与术语适配专业贡献"
     },
     {
      "seat_id": "AGT-030",
      "alias": "叙事",
      "title": "内容与创意策划",
      "plane": "业务运营",
      "source_group": "品牌与增长",
      "slot_id": "BO-25",
      "slot_title": "内容方案与创意表达",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-033"
      ],
      "note": "直接复用 C-033 内容策划与表达"
     },
     {
      "seat_id": "AGT-031",
      "alias": "绘影",
      "title": "视觉视频与素材生产",
      "plane": "业务运营",
      "source_group": "品牌与增长",
      "slot_id": "BO-26",
      "slot_title": "渠道素材制作与版本交付",
      "relation": "sub_contributor",
      "basis": [
       "C-306",
       "C-033"
      ],
      "note": "C-033/BO-25 内部的素材制作与版本交付子位"
     }
    ]
   },
   {
    "id": "dataSupply",
    "title": "经营数据供给与质量保障",
    "short": "带质量说明的经营数据<br>异常影响与修复反馈",
    "codes": "C-039",
    "x": 1136,
    "y": 520,
    "w": 400,
    "h": 204,
    "row": null,
    "col": null,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-data-supply.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-046",
      "alias": "清源",
      "title": "数据工程与质量",
      "plane": "数据与Agent平台",
      "source_group": "数据与AI运行",
      "slot_id": "DA-02",
      "slot_title": "经营数据供给与质量溯源",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-039"
      ],
      "note": "直接复用 C-039 经营数据供给与质量保障"
     }
    ]
   },
   {
    "id": "definition",
    "title": "产品定义",
    "short": "可验证的产品要求与约束",
    "codes": "C-023",
    "x": 832,
    "y": 280,
    "w": 320,
    "h": 204,
    "row": 0,
    "col": 2,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-business-definitions.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-009",
      "alias": "定形",
      "title": "产品定义与商业立项",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-04",
      "slot_title": "产品要求与验收定义",
      "relation": "direct_reuse",
      "basis": [
       "C-301",
       "C-023"
      ],
      "note": "直接复用 C-023 当前阶段可验证的产品要求与约束"
     }
    ]
   },
   {
    "id": "demandAnalysis",
    "title": "需求分析与预测",
    "short": "需求变化判断与未来情景<br>范围 · 依据 · 假设 · 不确定性",
    "codes": "C-044",
    "x": 600,
    "y": 580,
    "w": 400,
    "h": 204,
    "row": null,
    "col": null,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-demand-analysis.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-capability-inventory.html",
     "sanbao-demand-analysis.html",
     "sanbao-dependency-readiness.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-016",
      "alias": "知量",
      "title": "需求预测与补货计划",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-11",
      "slot_title": "补货候选与供需约束",
      "relation": "readonly_consumer",
      "basis": [
       "C-303",
       "C-312",
       "C-044"
      ],
      "note": "只读引用 C-044 需求情景，不另做需求预测"
     }
    ]
   },
   {
    "id": "economics",
    "title": "经营经济性评估",
    "short": "成本、贡献与现金评估<br>口径 · 依据 · 假设边界",
    "codes": "C-036",
    "x": 448,
    "y": 1180,
    "w": 320,
    "h": 204,
    "row": 3,
    "col": 1,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-agenticos-vision.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-041",
      "alias": "守金",
      "title": "经营财务与资金",
      "plane": "经营管理",
      "source_group": "财务与合规",
      "slot_id": "OM-05",
      "slot_title": "经营资源与资金条件评估",
      "relation": "boundary_contributor",
      "basis": [
       "C-300",
       "C-036"
      ],
      "note": "提供资源与资金条件说明，不替 C-036/C-193 完成选项级经济性"
     }
    ]
   },
   {
    "id": "effectEvaluation",
    "title": "经营实验与效果评估",
    "short": "实验或观察方案<br>有证据和范围的效果判断",
    "codes": "C-038",
    "x": 1216,
    "y": 1180,
    "w": 320,
    "h": 204,
    "row": 3,
    "col": 3,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-effect-evaluation.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-023",
      "alias": "自航",
      "title": "独立站经营与转化",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-18",
      "slot_title": "自营站购买旅程与转化诊断",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-038"
      ],
      "note": "交购买旅程摩擦证据与候选改进，不替 C-038 判断效果"
     },
     {
      "seat_id": "AGT-035",
      "alias": "试真",
      "title": "增长实验与增量评估",
      "plane": "业务运营",
      "source_group": "品牌与增长",
      "slot_id": "BO-30",
      "slot_title": "经营实验与效果评估",
      "relation": "direct_reuse",
      "basis": [
       "C-306",
       "C-038"
      ],
      "note": "直接复用 C-038 经营实验与效果评估"
     }
    ]
   },
   {
    "id": "knowledgeStewardship",
    "title": "经营知识整理与维护",
    "short": "可追溯的知识条目<br>与维护反馈",
    "codes": "C-051",
    "x": 600,
    "y": 580,
    "w": 400,
    "h": 204,
    "row": null,
    "col": null,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-knowledge-stewardship.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-capability-inventory.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-identity-boundaries.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-048",
      "alias": "积知",
      "title": "知识技能与Playbook治理",
      "plane": "数据与Agent平台",
      "source_group": "数据与AI运行",
      "slot_id": "DA-04",
      "slot_title": "知识、方法与能力证据资产治理",
      "relation": "direct_reuse",
      "basis": [
       "C-309",
       "C-051"
      ],
      "note": "直接复用 C-051 经营知识整理与维护"
     }
    ]
   },
   {
    "id": "launch",
    "title": "上市经营策划",
    "short": "带目标和成立条件的<br>上市经营方案",
    "codes": "C-027",
    "x": 448,
    "y": 580,
    "w": 320,
    "h": 204,
    "row": 1,
    "col": 1,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-launch-planning.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-024",
      "alias": "拓域",
      "title": "其他平台与新市场经营",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-19",
      "slot_title": "候选渠道规则与运营适配证据",
      "relation": "evidence_input",
      "basis": [
       "C-304",
       "C-027"
      ],
      "note": "核对候选渠道规则与运营适配证据，不替 C-027 制定上市方案"
     }
    ]
   },
   {
    "id": "marketAccess",
    "title": "产品市场准入",
    "short": "有范围和依据的准入判断",
    "codes": "C-028",
    "x": 832,
    "y": 580,
    "w": 320,
    "h": 204,
    "row": 1,
    "col": 2,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-product-market-access.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-027",
      "alias": "守店",
      "title": "店铺账号健康与规则",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-22",
      "slot_title": "店铺账号健康与规则事件诊断",
      "relation": "boundary_contributor",
      "basis": [
       "C-305",
       "C-028"
      ],
      "note": "守账号与店铺规则事件，不替 C-028 作产品准入"
     },
     {
      "seat_id": "AGT-044",
      "alias": "安界",
      "title": "产品合规与隐私",
      "plane": "独立控制",
      "source_group": "财务与合规",
      "slot_id": "IC-04",
      "slot_title": "产品准入、宣称与隐私控制条件",
      "relation": "direct_reuse",
      "basis": [
       "C-308",
       "C-028"
      ],
      "note": "直接承接 C-028 产品市场准入主站位并补宣称与隐私边界"
     }
    ]
   },
   {
    "id": "paidMedia",
    "title": "付费媒体投放与优化",
    "short": "投放方案与执行结果<br>预算 · 版本 · 优化反馈",
    "codes": "C-037",
    "x": 832,
    "y": 1180,
    "w": 320,
    "h": 204,
    "row": 3,
    "col": 2,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-paid-media.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-032",
      "alias": "点火",
      "title": "效果广告投放",
      "plane": "业务运营",
      "source_group": "品牌与增长",
      "slot_id": "BO-27",
      "slot_title": "付费媒体投放与优化",
      "relation": "direct_reuse",
      "basis": [
       "C-306",
       "C-037"
      ],
      "note": "直接复用 C-037 付费媒体投放与优化"
     }
    ]
   },
   {
    "id": "pricingPromotion",
    "title": "定价与促销",
    "short": "价格和促销方案<br>范围 · 测算 · 执行条件",
    "codes": "C-035",
    "x": 64,
    "y": 1180,
    "w": 320,
    "h": 204,
    "row": 3,
    "col": 0,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-pricing-promotion.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-026",
      "alias": "衡价",
      "title": "定价促销与商品组合",
      "plane": "业务运营",
      "source_group": "渠道经营",
      "slot_id": "BO-21",
      "slot_title": "范围化价格、促销与商品组合研判",
      "relation": "direct_reuse",
      "basis": [
       "C-305",
       "C-035"
      ],
      "note": "直接复用 C-035 定价与促销"
     }
    ]
   },
   {
    "id": "productInformation",
    "title": "商品资料管理",
    "short": "可追溯、带版本与范围的<br>商品资料包",
    "codes": "C-031",
    "x": 448,
    "y": 880,
    "w": 320,
    "h": 204,
    "row": 2,
    "col": 1,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-agenticos-vision.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-048",
      "alias": "积知",
      "title": "知识技能与Playbook治理",
      "plane": "数据与Agent平台",
      "source_group": "数据与AI运行",
      "slot_id": "DA-04",
      "slot_title": "知识、方法与能力证据资产治理",
      "relation": "platform_steward",
      "basis": [
       "C-309",
       "C-031"
      ],
      "note": "归集 C-031 商品资料管理中的平台维护侧"
     }
    ]
   },
   {
    "id": "realization",
    "title": "产品实现",
    "short": "可供检验的方案或样品<br>及交付说明",
    "codes": "C-025",
    "x": 1216,
    "y": 280,
    "w": 320,
    "h": 204,
    "row": 0,
    "col": 3,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-product-realization.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-010",
      "alias": "映物",
      "title": "工业设计与用户体验",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-05",
      "slot_title": "产品体验与工业设计方案",
      "relation": "sub_contributor",
      "basis": [
       "C-301",
       "C-025"
      ],
      "note": "交体验与工业设计方案，不替 C-025 交完整实现物"
     },
     {
      "seat_id": "AGT-011",
      "alias": "砺器",
      "title": "硬件结构与材料工程",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-06",
      "slot_title": "硬件工程可行性与风险",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "C-025 中的硬件与材料专业贡献"
     },
     {
      "seat_id": "AGT-012",
      "alias": "灵枢",
      "title": "软件算法与应用生态",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-07",
      "slot_title": "软件算法方案与工程证据",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "C-025 中的软件与算法专业贡献"
     },
     {
      "seat_id": "AGT-014",
      "alias": "择源",
      "title": "OEM供应商开发与协同",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-09",
      "slot_title": "供应商能力与风险评估",
      "relation": "evidence_input",
      "basis": [
       "C-302",
       "C-025"
      ],
      "note": "为 C-025 提供 OEM 供应商能力与风险事实"
     }
    ]
   },
   {
    "id": "supplyReadiness",
    "title": "供给与交付准备",
    "short": "有条件的供给交付方案<br>及兑现依据",
    "codes": "C-029",
    "x": 1216,
    "y": 580,
    "w": 320,
    "h": 204,
    "row": 1,
    "col": 3,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-agenticos-vision.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-014",
      "alias": "择源",
      "title": "OEM供应商开发与协同",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-09",
      "slot_title": "供应商能力与风险评估",
      "relation": "evidence_input",
      "basis": [
       "C-302",
       "C-029"
      ],
      "note": "为 C-029 提供供应来源事实"
     },
     {
      "seat_id": "AGT-015",
      "alias": "契约",
      "title": "采购与合同履约",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-10",
      "slot_title": "采购条件与履约事实",
      "relation": "sub_contributor",
      "basis": [
       "C-302",
       "C-029"
      ],
      "note": "C-029 的采购条件与履约偏差来源专业"
     },
     {
      "seat_id": "AGT-016",
      "alias": "知量",
      "title": "需求预测与补货计划",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-11",
      "slot_title": "补货候选与供需约束",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-312",
       "C-029",
       "C-045"
      ],
      "note": "为 C-029/C-045 提供补货候选与供需约束说明"
     },
     {
      "seat_id": "AGT-017",
      "alias": "衡仓",
      "title": "库存与商品生命周期",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-12",
      "slot_title": "库存可用性与生命周期风险",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供真实可用库存与库龄风险说明"
     },
     {
      "seat_id": "AGT-019",
      "alias": "通途",
      "title": "跨境物流与关务",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-14",
      "slot_title": "跨境运输与通关条件",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供跨境运输路线、ETA 区间与通关条件说明"
     },
     {
      "seat_id": "AGT-020",
      "alias": "行舟",
      "title": "仓储履约与退货处置",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-15",
      "slot_title": "仓储履约与退货事实",
      "relation": "sub_contributor",
      "basis": [
       "C-303",
       "C-029"
      ],
      "note": "提供仓储履约与退货入仓事实说明"
     }
    ]
   },
   {
    "id": "verification",
    "title": "产品验证",
    "short": "带证据和适用范围的<br>产品验证结论",
    "codes": "C-026",
    "x": 64,
    "y": 580,
    "w": 320,
    "h": 204,
    "row": 1,
    "col": 0,
    "layout_source": "sanbao-agenticos-vision.html",
    "primary_page": "sanbao-product-verification.html",
    "pages": [
     "sanbao-agenticos-vision.html",
     "sanbao-analysis-composition.html",
     "sanbao-assignee-competence.html",
     "sanbao-brand-positioning.html",
     "sanbao-business-definitions.html",
     "sanbao-capability-inventory.html",
     "sanbao-commercial-validation.html",
     "sanbao-content-expression.html",
     "sanbao-data-supply.html",
     "sanbao-demand-analysis.html",
     "sanbao-demand-response.html",
     "sanbao-dependency-readiness.html",
     "sanbao-economic-assessment.html",
     "sanbao-effect-evaluation.html",
     "sanbao-evidence-boundaries.html",
     "sanbao-execution-follow-through.html",
     "sanbao-experience-candidates.html",
     "sanbao-identity-boundaries.html",
     "sanbao-joint-options.html",
     "sanbao-knowledge-stewardship.html",
     "sanbao-matter-comparison.html",
     "sanbao-method-lifecycle.html",
     "sanbao-method-production.html",
     "sanbao-method-validation.html",
     "sanbao-ongoing-handoff.html",
     "sanbao-paid-media.html",
     "sanbao-pricing-promotion.html",
     "sanbao-product-panorama-resume.html",
     "sanbao-professional-method-candidate.html",
     "sanbao-semantic-boundaries.html",
     "sanbao-square-network.html",
     "sanbao-supply-options.html",
     "sanbao-task-acceptance.html"
    ],
    "seat_links": [
     {
      "seat_id": "AGT-013",
      "alias": "求证",
      "title": "产品验证与研发项目",
      "plane": "业务运营",
      "source_group": "产品与创新",
      "slot_id": "BO-08",
      "slot_title": "产品验证与缺陷复验",
      "relation": "direct_reuse",
      "basis": [
       "C-302",
       "C-026"
      ],
      "note": "直接复用 C-026 产品验证结论"
     },
     {
      "seat_id": "AGT-018",
      "alias": "质守",
      "title": "生产协同与质量控制",
      "plane": "业务运营",
      "source_group": "供应与履约",
      "slot_id": "BO-13",
      "slot_title": "生产质量异常与纠正验证",
      "relation": "boundary_contributor",
      "basis": [
       "C-303",
       "C-026"
      ],
      "note": "交质量事件与纠正措施说明，不替 C-026 作完整产品验证"
     },
     {
      "seat_id": "AGT-038",
      "alias": "回声",
      "title": "体验洞察与质量反馈",
      "plane": "业务运营",
      "source_group": "服务与体验",
      "slot_id": "BO-33",
      "slot_title": "体验问题聚合与改进证据回流",
      "relation": "evidence_input",
      "basis": [
       "C-307",
       "C-026"
      ],
      "note": "向 C-026 回流质量与缺陷线索"
     }
    ]
   }
  ],
  "relations": [
   {
    "id": "R-01",
    "source": "consumer",
    "target": "business",
    "object": "需求证据与问题地图",
    "codes": [
     "C-018",
     "C-020"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-02",
    "source": "business",
    "target": "definition",
    "object": "经营选项、价值假设、经济与兑现条件",
    "codes": [
     "C-021",
     "C-023"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-03",
    "source": "consumer",
    "target": "definition",
    "object": "直接需求依据：需求证据与问题地图",
    "codes": [
     "C-018",
     "C-020",
     "C-023"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-05",
    "source": "business",
    "target": "consumer",
    "object": "补证要求与使用反馈",
    "codes": [
     "C-018",
     "C-020"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-06",
    "source": "definition",
    "target": "business",
    "object": "产品要求、约束与待取舍问题",
    "codes": [
     "C-023"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-07",
    "source": "definition",
    "target": "consumer",
    "object": "补证要求与验证反馈，保留来源和判断版本",
    "codes": [
     "C-018",
     "C-019",
     "C-023"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-08",
    "source": "definition",
    "target": "realization",
    "object": "当前产品要求与验收条件",
    "codes": [
     "C-023",
     "C-025"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-09",
    "source": "realization",
    "target": "definition",
    "object": "无法兑现的要求、差异与限制",
    "codes": [
     "C-025"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-100",
    "source": "economics",
    "target": "effectEvaluation",
    "object": "适用经济口径、测算及相应结果依据，保留版本和假设",
    "codes": [
     "C-036",
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-101",
    "source": "effectEvaluation",
    "target": "economics",
    "object": "经济结果解释的适用边界、因果局限及依据核对需求",
    "codes": [
     "C-038"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-102",
    "source": "economics",
    "target": "dataSupply",
    "object": "当前经济问题的数据用途、对象期间、粒度时效及质量要求",
    "codes": [
     "C-036",
     "C-039"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-103",
    "source": "dataSupply",
    "target": "economics",
    "object": "带来源、版本、范围及质量说明的经营数据，异常影响与修复反馈；接收方判断是否足够",
    "codes": [
     "C-010",
     "C-039"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-104",
    "source": "effectEvaluation",
    "target": "dataSupply",
    "object": "当前效果问题的证据需求、观察范围、质量要求及数据适用性问题",
    "codes": [
     "C-038",
     "C-039"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-105",
    "source": "dataSupply",
    "target": "effectEvaluation",
    "object": "适用经营数据、实际质量覆盖与限制、异常影响和更正版本；不替代效果判断",
    "codes": [
     "C-010",
     "C-039"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-106",
    "source": "productInformation",
    "target": "businessDefinitions",
    "object": "商品对象、产品对应与来源关系依据，身份差异或未确认映射",
    "codes": [
     "C-031",
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-107",
    "source": "businessDefinitions",
    "target": "productInformation",
    "object": "可引用对象关系约定、适用范围和版本，保留业务责任与争议",
    "codes": [
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-108",
    "source": "economics",
    "target": "businessDefinitions",
    "object": "经济用途、领域含义及确认依据，口径差异与变更需求",
    "codes": [
     "C-036",
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-109",
    "source": "businessDefinitions",
    "target": "economics",
    "object": "经领域确认可引用的共同约定、版本及可比边界，不替代专业含义和测算",
    "codes": [
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-11",
    "source": "realization",
    "target": "business",
    "object": "经济与交期影响；新的经营取舍由有权责任方决定",
    "codes": [
     "C-025"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-110",
    "source": "effectEvaluation",
    "target": "businessDefinitions",
    "object": "当前评估用途、对象范围与所需含义，口径差异或变更需求",
    "codes": [
     "C-038",
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-111",
    "source": "businessDefinitions",
    "target": "effectEvaluation",
    "object": "适用指标和对象关系约定、版本、差异与可比较范围",
    "codes": [
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-112",
    "source": "dataSupply",
    "target": "businessDefinitions",
    "object": "取数转换及映射差异、定义冲突与影响依据",
    "codes": [
     "C-039",
     "C-040"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-113",
    "source": "businessDefinitions",
    "target": "dataSupply",
    "object": "已明确口径与对象关系约定、版本、生效范围和变更影响",
    "codes": [
     "C-040"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-114",
    "source": "consumer",
    "target": "demandAnalysis",
    "object": "消费者问题、任务和价值的需求证据及适用范围",
    "codes": [
     "C-018",
     "C-019",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-115",
    "source": "effectEvaluation",
    "target": "demandAnalysis",
    "object": "适用实验与效果结论、依据和因果局限",
    "codes": [
     "C-038",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-116",
    "source": "dataSupply",
    "target": "demandAnalysis",
    "object": "带来源、版本、范围和质量说明的销售等经营观察数据",
    "codes": [
     "C-039",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-117",
    "source": "businessDefinitions",
    "target": "demandAnalysis",
    "object": "适用经营口径与对象关系约定、版本和可比范围",
    "codes": [
     "C-040",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-118",
    "source": "supplyReadiness",
    "target": "demandAnalysis",
    "object": "库存、供给及交付限制，区分计划、已有承诺和实际兑现",
    "codes": [
     "C-029",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-119",
    "source": "pricingPromotion",
    "target": "demandAnalysis",
    "object": "适用价格和促销条件及版本，区分候选、决定与已知实施状态",
    "codes": [
     "C-035",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-12",
    "source": "definition",
    "target": "verification",
    "object": "当前产品要求与验收条件",
    "codes": [
     "C-026"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-120",
    "source": "paidMedia",
    "target": "demandAnalysis",
    "object": "触达执行条件、平台观察及版本与局限，不直接证明因果",
    "codes": [
     "C-037",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-121",
    "source": "channelPublication",
    "target": "demandAnalysis",
    "object": "对应范围和版本的可售判断、核验依据与限制",
    "codes": [
     "C-030",
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-122",
    "source": "demandAnalysis",
    "target": "effectEvaluation",
    "object": "当前需求解释中的待验证问题、候选解释与反证需要",
    "codes": [
     "C-044"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-123",
    "source": "demandAnalysis",
    "target": "supplyReadiness",
    "object": "带范围、依据、假设及不确定性的需求判断与未来情景，不等于补货承诺",
    "codes": [
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-124",
    "source": "demandAnalysis",
    "target": "economics",
    "object": "适用需求情景、期间、关键假设与不确定性，供经济评估使用",
    "codes": [
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-125",
    "source": "demandAnalysis",
    "target": "pricingPromotion",
    "object": "适用需求变化判断及价格条件下的需求情景，不替代价格选择",
    "codes": [
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-126",
    "source": "demandAnalysis",
    "target": "paidMedia",
    "object": "适用需求变化判断及触达条件下的需求情景，不构成投放授权",
    "codes": [
     "C-044"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-13",
    "source": "realization",
    "target": "verification",
    "object": "对应方案或样品、实现版本与交付说明",
    "codes": [
     "C-026"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-14",
    "source": "verification",
    "target": "realization",
    "object": "实现问题与复验依据",
    "codes": [
     "C-026"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-15",
    "source": "verification",
    "target": "definition",
    "object": "要求冲突与适用条件，判断必要再验证",
    "codes": [
     "C-026"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-16",
    "source": "verification",
    "target": "consumer",
    "object": "使用预期的验证证据与偏差，保留判断版本",
    "codes": [
     "C-026"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-18",
    "source": "business",
    "target": "launch",
    "object": "经营方向与取舍依据",
    "codes": [
     "C-027"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-19",
    "source": "definition",
    "target": "launch",
    "object": "价值范围与产品版本",
    "codes": [
     "C-027"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-20",
    "source": "verification",
    "target": "launch",
    "object": "适用验证结论与限制",
    "codes": [
     "C-026",
     "C-027"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-21",
    "source": "launch",
    "target": "business",
    "object": "影响经营选择的方案与条件；经营取舍由有权方决定",
    "codes": [
     "C-027"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-22",
    "source": "launch",
    "target": "marketAccess",
    "object": "主体、市场渠道、版本、用途宣称及拟开展安排",
    "codes": [
     "C-027",
     "C-028"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-23",
    "source": "marketAccess",
    "target": "launch",
    "object": "准入条件、限制及对上市安排的影响",
    "codes": [
     "C-028"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-24",
    "source": "definition",
    "target": "marketAccess",
    "object": "对应产品版本的要求与约束",
    "codes": [
     "C-028"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-25",
    "source": "verification",
    "target": "marketAccess",
    "object": "适用验证结论、证据与限制",
    "codes": [
     "C-028"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-26",
    "source": "marketAccess",
    "target": "definition",
    "object": "要求问题与适用条件、依据及版本影响",
    "codes": [
     "C-028"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-27",
    "source": "marketAccess",
    "target": "verification",
    "object": "证据缺口与必要复核问题，按变化核对影响",
    "codes": [
     "C-015",
     "C-028"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-28",
    "source": "verification",
    "target": "supplyReadiness",
    "object": "当前验证依据与适用限制",
    "codes": [
     "C-029"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-29",
    "source": "launch",
    "target": "supplyReadiness",
    "object": "商品版本、需求区间、数量节奏与交付范围",
    "codes": [
     "C-029"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-30",
    "source": "marketAccess",
    "target": "supplyReadiness",
    "object": "适用准入条件及限制",
    "codes": [
     "C-028",
     "C-029"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-31",
    "source": "supplyReadiness",
    "target": "marketAccess",
    "object": "准入条件变化与待复核问题",
    "codes": [
     "C-029"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-32",
    "source": "supplyReadiness",
    "target": "launch",
    "object": "供给交付方案、兑现依据与缺口；经营取舍依有权方",
    "codes": [
     "C-029"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-33",
    "source": "launch",
    "target": "channelPublication",
    "object": "市场、渠道、账号、商品版本与发布范围",
    "codes": [
     "C-030"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-34",
    "source": "supplyReadiness",
    "target": "channelPublication",
    "object": "供给与交付条件及兑现依据",
    "codes": [
     "C-029",
     "C-030"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-35",
    "source": "channelPublication",
    "target": "supplyReadiness",
    "object": "库存或交付问题与核对依据",
    "codes": [
     "C-030"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-36",
    "source": "marketAccess",
    "target": "channelPublication",
    "object": "适用准入判断与限制",
    "codes": [
     "C-030"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-37",
    "source": "channelPublication",
    "target": "marketAccess",
    "object": "准入问题与实际渠道依据，按对应范围核对",
    "codes": [
     "C-030"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-38",
    "source": "channelPublication",
    "target": "launch",
    "object": "发布与可售结果、未核验范围及时点范围投入影响",
    "codes": [
     "C-030"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-39",
    "source": "definition",
    "target": "productInformation",
    "object": "产品定义要求、约束与对应版本；要求不等于事实",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-40",
    "source": "realization",
    "target": "productInformation",
    "object": "实现资料、对应版本及已知差异",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-41",
    "source": "verification",
    "target": "productInformation",
    "object": "适用验证结论与事实证据，保留未覆盖范围",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-42",
    "source": "marketAccess",
    "target": "productInformation",
    "object": "准入判断、声明依据及适用限制",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-43",
    "source": "supplyReadiness",
    "target": "productInformation",
    "object": "供给交付条件与相应事实依据",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-44",
    "source": "launch",
    "target": "productInformation",
    "object": "当前商品对象与上市使用范围",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-45",
    "source": "productInformation",
    "target": "channelPublication",
    "object": "可追溯、带版本和适用范围的商品资料包",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-46",
    "source": "channelPublication",
    "target": "productInformation",
    "object": "资料缺项、冲突和使用差异反馈",
    "codes": [
     "C-031"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-47",
    "source": "consumer",
    "target": "contentExpression",
    "object": "受众问题与使用情境",
    "codes": [
     "C-018",
     "C-033"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-48",
    "source": "launch",
    "target": "contentExpression",
    "object": "当前上市目标与价值承诺，保留证据和适用边界",
    "codes": [
     "C-027",
     "C-033"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-49",
    "source": "productInformation",
    "target": "contentExpression",
    "object": "适用版本的商品资料包与素材依据",
    "codes": [
     "C-031",
     "C-033"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-50",
    "source": "contentExpression",
    "target": "channelPublication",
    "object": "适用内容方案及素材版本，保留依据、范围与限制",
    "codes": [
     "C-033"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-51",
    "source": "channelPublication",
    "target": "contentExpression",
    "object": "格式、呈现与使用问题反馈",
    "codes": [
     "C-033"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-52",
    "source": "contentExpression",
    "target": "productInformation",
    "object": "事实冲突与资料缺口，交来源专业补证或确认",
    "codes": [
     "C-033"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-53",
    "source": "contentExpression",
    "target": "launch",
    "object": "影响目标或承诺的变化与待取舍问题",
    "codes": [
     "C-033"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-54",
    "source": "consumer",
    "target": "brandPositioning",
    "object": "消费者问题及经核对的认知 / 体验依据",
    "codes": [
     "C-018",
     "C-034"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-55",
    "source": "productInformation",
    "target": "brandPositioning",
    "object": "适用商品资料及兑现依据，保留来源与范围",
    "codes": [
     "C-031",
     "C-034"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-56",
    "source": "launch",
    "target": "brandPositioning",
    "object": "本次经营情境、范围及与品牌判断的冲突反馈",
    "codes": [
     "C-027",
     "C-034"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-57",
    "source": "brandPositioning",
    "target": "launch",
    "object": "适用定位、核心主张与依据，区分方案和已有决定",
    "codes": [
     "C-034"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-58",
    "source": "brandPositioning",
    "target": "contentExpression",
    "object": "适用版本的核心主张与表达准则",
    "codes": [
     "C-034"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-59",
    "source": "contentExpression",
    "target": "brandPositioning",
    "object": "表达冲突与理解偏差反馈，保留来源和未知",
    "codes": [
     "C-033",
     "C-034"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-60",
    "source": "launch",
    "target": "pricingPromotion",
    "object": "当前经营目标与市场 / 渠道范围",
    "codes": [
     "C-027",
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-61",
    "source": "consumer",
    "target": "pricingPromotion",
    "object": "消费者价值与价格响应的已有证据及假设",
    "codes": [
     "C-018",
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-62",
    "source": "productInformation",
    "target": "pricingPromotion",
    "object": "适用商品、版本资料与范围",
    "codes": [
     "C-031",
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-63",
    "source": "supplyReadiness",
    "target": "pricingPromotion",
    "object": "库存、供给、交付与成本条件，保留依据和缺口",
    "codes": [
     "C-029",
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-64",
    "source": "brandPositioning",
    "target": "pricingPromotion",
    "object": "适用品牌判断与价格约束",
    "codes": [
     "C-034",
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-65",
    "source": "pricingPromotion",
    "target": "business",
    "object": "价格方案、经济影响与成立条件，供整体选项比较",
    "codes": [
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-66",
    "source": "pricingPromotion",
    "target": "launch",
    "object": "价格及促销方案、经济影响与执行条件，供经营取舍",
    "codes": [
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-67",
    "source": "pricingPromotion",
    "target": "contentExpression",
    "object": "已定价格与优惠的适用表达条件",
    "codes": [
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-68",
    "source": "pricingPromotion",
    "target": "channelPublication",
    "object": "适用价格与交易条件，保留范围和执行前提",
    "codes": [
     "C-035"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-69",
    "source": "channelPublication",
    "target": "pricingPromotion",
    "object": "价格优惠呈现或生效差异及核对证据",
    "codes": [
     "C-035"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-70",
    "source": "business",
    "target": "economics",
    "object": "待评经营选项及需要回答的经济问题",
    "codes": [
     "C-021",
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-71",
    "source": "launch",
    "target": "economics",
    "object": "当前经营目标、适用范围与上市安排",
    "codes": [
     "C-027",
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-72",
    "source": "pricingPromotion",
    "target": "economics",
    "object": "价格优惠方案及假设版本",
    "codes": [
     "C-035",
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-73",
    "source": "supplyReadiness",
    "target": "economics",
    "object": "采购履约成本、库存与供给依据，保留来源和缺口",
    "codes": [
     "C-029",
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-74",
    "source": "productInformation",
    "target": "economics",
    "object": "对应商品版本、适用范围及资料依据",
    "codes": [
     "C-031",
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-75",
    "source": "economics",
    "target": "business",
    "object": "带口径、依据与假设边界的成本、贡献和现金影响评估",
    "codes": [
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-76",
    "source": "economics",
    "target": "launch",
    "object": "经济约束、成立条件与关键敏感性",
    "codes": [
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-77",
    "source": "economics",
    "target": "pricingPromotion",
    "object": "共同经济依据、测算结果与关键约束",
    "codes": [
     "C-036"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-78",
    "source": "economics",
    "target": "supplyReadiness",
    "object": "成本及兑现假设差异与对应核对需求",
    "codes": [
     "C-036"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-79",
    "source": "launch",
    "target": "paidMedia",
    "object": "当前目标、受众与范围，以及阶段验证问题",
    "codes": [
     "C-027",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-80",
    "source": "brandPositioning",
    "target": "paidMedia",
    "object": "适用品牌与表达边界",
    "codes": [
     "C-034",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-81",
    "source": "contentExpression",
    "target": "paidMedia",
    "object": "内容素材版本及适用范围和使用条件",
    "codes": [
     "C-033",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-82",
    "source": "pricingPromotion",
    "target": "paidMedia",
    "object": "适用报价和优惠版本及条件",
    "codes": [
     "C-035",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-83",
    "source": "channelPublication",
    "target": "paidMedia",
    "object": "渠道承接、落地呈现与可售依据",
    "codes": [
     "C-030",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-84",
    "source": "supplyReadiness",
    "target": "paidMedia",
    "object": "库存、供给和交付兑现条件",
    "codes": [
     "C-029",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-85",
    "source": "economics",
    "target": "paidMedia",
    "object": "经济依据与约束，不等于预算授权",
    "codes": [
     "C-036",
     "C-037"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-86",
    "source": "paidMedia",
    "target": "launch",
    "object": "投放执行结果、优化反馈及经营影响",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-87",
    "source": "paidMedia",
    "target": "contentExpression",
    "object": "素材可观察表现与使用问题，保留观察局限",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-88",
    "source": "paidMedia",
    "target": "pricingPromotion",
    "object": "报价相关问题及观察依据与局限",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-89",
    "source": "paidMedia",
    "target": "channelPublication",
    "object": "落地呈现或可售问题及对应依据",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-90",
    "source": "paidMedia",
    "target": "supplyReadiness",
    "object": "供给变化对投放的影响与兑现核对需求",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-91",
    "source": "paidMedia",
    "target": "economics",
    "object": "实际消耗、平台观察及对应版本，不直接等同增量利润",
    "codes": [
     "C-037"
    ],
    "baseline": false,
    "feedback": true,
    "status": "unspecified"
   },
   {
    "id": "R-92",
    "source": "launch",
    "target": "effectEvaluation",
    "object": "当前经营待决问题、目标、范围及相关安排",
    "codes": [
     "C-027",
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-93",
    "source": "effectEvaluation",
    "target": "launch",
    "object": "适用实验或观察方案、效果判断与专业建议；取舍仍由有权方负责",
    "codes": [
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-94",
    "source": "contentExpression",
    "target": "effectEvaluation",
    "object": "内容候选方案、版本、实际使用与偏离记录",
    "codes": [
     "C-033",
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-95",
    "source": "effectEvaluation",
    "target": "contentExpression",
    "object": "针对内容问题的方法要求、适用效果判断及局限",
    "codes": [
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-96",
    "source": "pricingPromotion",
    "target": "effectEvaluation",
    "object": "价格优惠候选方案、版本、执行变化与假设",
    "codes": [
     "C-035",
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-97",
    "source": "effectEvaluation",
    "target": "pricingPromotion",
    "object": "针对价格问题的实验或观察要求、效果判断及局限",
    "codes": [
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-98",
    "source": "paidMedia",
    "target": "effectEvaluation",
    "object": "投放方案版本、实际执行与偏离、平台观察及其局限",
    "codes": [
     "C-037",
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   },
   {
    "id": "R-99",
    "source": "effectEvaluation",
    "target": "paidMedia",
    "object": "适配投放问题的方法要求与效果判断，不新增执行授权",
    "codes": [
     "C-038"
    ],
    "baseline": false,
    "feedback": false,
    "status": "unspecified"
   }
  ],
  "unresolved_relations": [
   {
    "id": "R-04",
    "source": "accountability",
    "target": "definition",
    "object": "有权责任方已作出的决定，关联同一经营事项",
    "codes": [
     "C-013",
     "C-023"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified",
    "reason": "未声明的端点：accountability"
   },
   {
    "id": "R-10",
    "source": "accountability",
    "target": "realization",
    "object": "有权责任方已作出的决定",
    "codes": [
     "C-013",
     "C-016",
     "C-025"
    ],
    "baseline": true,
    "feedback": false,
    "status": "unspecified",
    "reason": "未声明的端点：accountability"
   },
   {
    "id": "R-17",
    "source": "verification",
    "target": "accountability",
    "object": "验证结论中需经营取舍的问题、依据与影响",
    "codes": [
     "C-013",
     "C-016",
     "C-026"
    ],
    "baseline": true,
    "feedback": true,
    "status": "unspecified",
    "reason": "未声明的端点：accountability"
   }
  ]
 },
 "decisions": [
  {
   "id": "C-000",
   "title": "",
   "form": "heading",
   "level": 2,
   "line": 322
  },
  {
   "id": "C-001",
   "title": "三种角色关系",
   "form": "heading",
   "level": 2,
   "line": 329
  },
  {
   "id": "C-002",
   "title": "品牌出海企业原型",
   "form": "heading",
   "level": 2,
   "line": 341
  },
  {
   "id": "C-003",
   "title": "核心经营改变",
   "form": "heading",
   "level": 2,
   "line": 353
  },
  {
   "id": "C-004",
   "title": "战略新品与 AI 工具投入案例",
   "form": "heading",
   "level": 2,
   "line": 375
  },
  {
   "id": "C-005",
   "title": "Heartbeat Cocoon 案例选择（用途由 C-006 调整）",
   "form": "heading",
   "level": 2,
   "line": 393
  },
  {
   "id": "C-006",
   "title": "产品设计主线与案例用途纠正",
   "form": "heading",
   "level": 2,
   "line": 404
  },
  {
   "id": "C-007",
   "title": "资料归属与当前设计节点",
   "form": "heading",
   "level": 2,
   "line": 416
  },
  {
   "id": "C-008",
   "title": "Native AgenticOS 平台与重构方向",
   "form": "heading",
   "level": 2,
   "line": 430
  },
  {
   "id": "C-009",
   "title": "价值流主线与讨论阶段",
   "form": "heading",
   "level": 2,
   "line": 446
  },
  {
   "id": "C-010",
   "title": "第一层经营网络总览",
   "form": "heading",
   "level": 2,
   "line": 457
  },
  {
   "id": "C-011",
   "title": "价值创造的三条跨域主链",
   "form": "heading",
   "level": 2,
   "line": 470
  },
  {
   "id": "C-012",
   "title": "新品商业验证的共同框架",
   "form": "heading",
   "level": 2,
   "line": 482
  },
  {
   "id": "C-013",
   "title": "新品经营事项的责任结构",
   "form": "heading",
   "level": 2,
   "line": 494
  },
  {
   "id": "C-014",
   "title": "共享经营事项与角色参与",
   "form": "heading",
   "level": 2,
   "line": 506
  },
  {
   "id": "C-015",
   "title": "可信变化驱动事项持续推进",
   "form": "heading",
   "level": 2,
   "line": 518
  },
  {
   "id": "C-016",
   "title": "有边界的行动授权",
   "form": "heading",
   "level": 2,
   "line": 530
  },
  {
   "id": "C-017",
   "title": "专业职责与承接方式",
   "form": "heading",
   "level": 2,
   "line": 542
  },
  {
   "id": "C-018",
   "title": "消费者需求洞察",
   "form": "heading",
   "level": 2,
   "line": 554
  },
  {
   "id": "C-019",
   "title": "持续消费者需求问题与判断引用",
   "form": "heading",
   "level": 2,
   "line": 566
  },
  {
   "id": "C-020",
   "title": "需求判断的经营使用",
   "form": "heading",
   "level": 2,
   "line": 578
  },
  {
   "id": "C-021",
   "title": "商业论证与可比较经营选项",
   "form": "heading",
   "level": 2,
   "line": 590
  },
  {
   "id": "C-022",
   "title": "围绕关键专业问题组织定向评估",
   "form": "heading",
   "level": 2,
   "line": 602
  },
  {
   "id": "C-023",
   "title": "产品定义",
   "form": "heading",
   "level": 2,
   "line": 614
  },
  {
   "id": "C-024",
   "title": "横向矩阵布局纠正",
   "form": "heading",
   "level": 2,
   "line": 623
  },
  {
   "id": "C-025",
   "title": "产品实现",
   "form": "heading",
   "level": 2,
   "line": 634
  },
  {
   "id": "C-026",
   "title": "产品验证",
   "form": "heading",
   "level": 2,
   "line": 643
  },
  {
   "id": "C-027",
   "title": "上市经营策划",
   "form": "heading",
   "level": 2,
   "line": 653
  },
  {
   "id": "C-028",
   "title": "产品市场准入",
   "form": "heading",
   "level": 2,
   "line": 663
  },
  {
   "id": "C-029",
   "title": "供给与交付准备",
   "form": "heading",
   "level": 2,
   "line": 672
  },
  {
   "id": "C-030",
   "title": "渠道发布与可售核验",
   "form": "heading",
   "level": 2,
   "line": 682
  },
  {
   "id": "C-031",
   "title": "商品资料管理",
   "form": "heading",
   "level": 2,
   "line": 692
  },
  {
   "id": "C-032",
   "title": "正方形布局与可读性纠正",
   "form": "heading",
   "level": 2,
   "line": 701
  },
  {
   "id": "C-033",
   "title": "内容策划与表达",
   "form": "heading",
   "level": 2,
   "line": 712
  },
  {
   "id": "C-034",
   "title": "品牌定位与主张",
   "form": "heading",
   "level": 2,
   "line": 723
  },
  {
   "id": "C-035",
   "title": "定价与促销",
   "form": "heading",
   "level": 2,
   "line": 734
  },
  {
   "id": "C-036",
   "title": "经营经济性评估",
   "form": "heading",
   "level": 2,
   "line": 745
  },
  {
   "id": "C-037",
   "title": "付费媒体投放与优化",
   "form": "heading",
   "level": 2,
   "line": 756
  },
  {
   "id": "C-038",
   "title": "经营实验与效果评估",
   "form": "heading",
   "level": 2,
   "line": 767
  },
  {
   "id": "C-039",
   "title": "经营数据供给与质量保障",
   "form": "heading",
   "level": 2,
   "line": 779
  },
  {
   "id": "C-040",
   "title": "经营口径与对象关系治理",
   "form": "heading",
   "level": 2,
   "line": 790
  },
  {
   "id": "C-041",
   "title": "新品商业验证的判断范围",
   "form": "heading",
   "level": 2,
   "line": 802
  },
  {
   "id": "C-042",
   "title": "新品向持续经营的责任接续",
   "form": "heading",
   "level": 2,
   "line": 814
  },
  {
   "id": "C-043",
   "title": "持续经营首条展开任务链",
   "form": "heading",
   "level": 2,
   "line": 826
  },
  {
   "id": "C-044",
   "title": "需求分析与预测",
   "form": "heading",
   "level": 2,
   "line": 837
  },
  {
   "id": "C-045",
   "title": "供给与交付准备的持续经营应用",
   "form": "heading",
   "level": 2,
   "line": 850
  },
  {
   "id": "C-046",
   "title": "可比较的联动经营选项",
   "form": "heading",
   "level": 2,
   "line": 862
  },
  {
   "id": "C-047",
   "title": "联动执行的业务依赖就绪",
   "form": "heading",
   "level": 2,
   "line": 874
  },
  {
   "id": "C-048",
   "title": "联动经营事项的主责查看入口",
   "form": "heading",
   "level": 2,
   "line": 886
  },
  {
   "id": "C-049",
   "title": "执行收尾与后续经营责任",
   "form": "heading",
   "level": 2,
   "line": 898
  },
  {
   "id": "C-050",
   "title": "从经营反馈到经营经验候选",
   "form": "heading",
   "level": 2,
   "line": 910
  },
  {
   "id": "C-051",
   "title": "经营知识整理与维护",
   "form": "heading",
   "level": 2,
   "line": 923
  },
  {
   "id": "C-052",
   "title": "可检验的专业作业方法候选",
   "form": "heading",
   "level": 2,
   "line": 933
  },
  {
   "id": "C-053",
   "title": "领域主导、按需共用的方法制作",
   "form": "heading",
   "level": 2,
   "line": 943
  },
  {
   "id": "C-054",
   "title": "按用途的方法验证结论与改进反馈",
   "form": "heading",
   "level": 2,
   "line": 954
  },
  {
   "id": "C-055",
   "title": "方法的范围化生效使用判断",
   "form": "heading",
   "level": 2,
   "line": 966
  },
  {
   "id": "C-056",
   "title": "方法版本替代与退役的范围化处理",
   "form": "heading",
   "level": 2,
   "line": 977
  },
  {
   "id": "C-057",
   "title": "具体承接者的范围化胜任判断与缺口反馈",
   "form": "heading",
   "level": 2,
   "line": 988
  },
  {
   "id": "C-058",
   "title": "有边界的任务承接安排",
   "form": "heading",
   "level": 2,
   "line": 1000
  },
  {
   "id": "C-059",
   "title": "接责确认与生效依据",
   "form": "heading",
   "level": 2,
   "line": 1010
  },
  {
   "id": "C-060",
   "title": "产品串联主线与逐层推进纠正",
   "form": "heading",
   "level": 2,
   "line": 1017
  },
  {
   "id": "C-061",
   "title": "",
   "form": "heading",
   "level": 2,
   "line": 202
  },
  {
   "id": "C-062",
   "title": "无限画布作为Sanbao工作台与AgenticOS架构愿景",
   "form": "heading",
   "level": 2,
   "line": 1037
  },
  {
   "id": "C-063",
   "title": "按能力横向拆解、按来源纵向追溯",
   "form": "heading",
   "level": 2,
   "line": 1048
  },
  {
   "id": "C-064",
   "title": "三项语义能力先保持独立候选",
   "form": "heading",
   "level": 2,
   "line": 1058
  },
  {
   "id": "C-065",
   "title": "证据能力保持追溯、引用投影、判断组织三层",
   "form": "heading",
   "level": 2,
   "line": 1068
  },
  {
   "id": "C-066",
   "title": "对象身份归并与来源择优独立",
   "form": "heading",
   "level": 2,
   "line": 1079
  },
  {
   "id": "C-067",
   "title": "分项经营判断与按需机会比较",
   "form": "heading",
   "level": 2,
   "line": 1090
  },
  {
   "id": "C-068",
   "title": "三条主链的共同经营事项对照面",
   "form": "heading",
   "level": 2,
   "line": 1100
  },
  {
   "id": "C-069",
   "title": "来源资产与场景检验的有界进入方式",
   "form": "heading",
   "level": 2,
   "line": 1109
  },
  {
   "id": "C-070",
   "title": "从来源资产到岗位 Preset 与 E2E 经营网络的组装脊柱",
   "form": "heading",
   "level": 2,
   "line": 1119
  },
  {
   "id": "C-071",
   "title": "VOC 闭集打标线的来源卡与需求证据检验位置",
   "form": "heading",
   "level": 2,
   "line": 1130
  },
  {
   "id": "C-072",
   "title": "VOC 闭集打标线的局部切分与合同边界",
   "form": "heading",
   "level": 2,
   "line": 1141
  },
  {
   "id": "C-073",
   "title": "结果合同守卫暂不独立及其重新研究门槛",
   "form": "heading",
   "level": 2,
   "line": 1153
  },
  {
   "id": "C-074",
   "title": "两类结果检查只保留为 VOC 来源证据",
   "form": "heading",
   "level": 2,
   "line": 1168
  },
  {
   "id": "C-075",
   "title": "先用两条 E2E 场景组织能力全景图",
   "form": "heading",
   "level": 2,
   "line": 1178
  },
  {
   "id": "C-076",
   "title": "两条链先有阶段与能力站位，再让 Skill 竞聘填充",
   "form": "heading",
   "level": 2,
   "line": 1188
  },
  {
   "id": "C-077",
   "title": "VOC V1 首批来源能力候选",
   "form": "heading",
   "level": 2,
   "line": 1198
  },
  {
   "id": "C-078",
   "title": "V1-A 两张来源卡保持分开，按需接力",
   "form": "heading",
   "level": 2,
   "line": 1208
  },
  {
   "id": "C-079",
   "title": "Shopify 历史聚合资产拆成“回溯”与“缺口”两张候选卡",
   "form": "heading",
   "level": 2,
   "line": 1218
  },
  {
   "id": "C-080",
   "title": "Shopify 战略范围输入与社媒信号源清单分开保留",
   "form": "heading",
   "level": 2,
   "line": 1228
  },
  {
   "id": "C-081",
   "title": "社媒入口达到三项条件才可交给 V1-B",
   "form": "heading",
   "level": 2,
   "line": 1237
  },
  {
   "id": "C-082",
   "title": "V1-B 把“材料请求”与“可引用证据”保持为两种状态",
   "form": "heading",
   "level": 2,
   "line": 1246
  },
  {
   "id": "C-083",
   "title": "历史聚合“回溯＋缺口”必须成对作为带限制证据进入 V1",
   "form": "heading",
   "level": 2,
   "line": 1256
  },
  {
   "id": "C-084",
   "title": "报告内出处与口径以带范围证据条目进入 V1-B",
   "form": "heading",
   "level": 2,
   "line": 1266
  },
  {
   "id": "C-085",
   "title": "受控打标记录按 completed／needs_review 分路",
   "form": "heading",
   "level": 2,
   "line": 1277
  },
  {
   "id": "C-086",
   "title": "客户声音字段先写成材料请求，不写成已经存在的证据",
   "form": "heading",
   "level": 2,
   "line": 1290
  },
  {
   "id": "C-087",
   "title": "限制说明跟着材料走，不给材料打分",
   "form": "heading",
   "level": 2,
   "line": 1300
  },
  {
   "id": "C-088",
   "title": "两种“未知”分开：材料有限使用，受控结果待复看",
   "form": "heading",
   "level": 2,
   "line": 1310
  },
  {
   "id": "C-089",
   "title": "三种 V1-C 的“限制”继续分别占位",
   "form": "heading",
   "level": 2,
   "line": 1321
  },
  {
   "id": "C-090",
   "title": "三种限制只共享阅读镜头，不共享处理逻辑",
   "form": "heading",
   "level": 2,
   "line": 1332
  },
  {
   "id": "C-091",
   "title": "共同阅读镜头只驻留在来源资产与场景检验抽屉",
   "form": "heading",
   "level": 2,
   "line": 1343
  },
  {
   "id": "C-092",
   "title": "四问只服务三张 V1-C 限制卡，不成为全来源模板",
   "form": "heading",
   "level": 2,
   "line": 1353
  },
  {
   "id": "C-093",
   "title": "V1 交出待审阅的问题线索包，不交出需求结论",
   "form": "heading",
   "level": 2,
   "line": 1364
  },
  {
   "id": "C-094",
   "title": "线索先落到候选人群／使用情境，不先做用户画像或需求判断",
   "form": "heading",
   "level": 2,
   "line": 1377
  },
  {
   "id": "C-095",
   "title": "同一情境的替代／解决方式先作为候选观察保留",
   "form": "heading",
   "level": 2,
   "line": 1392
  },
  {
   "id": "C-096",
   "title": "同一候选审阅问题的支持／反证／未知并列编排",
   "form": "heading",
   "level": 2,
   "line": 1407
  },
  {
   "id": "C-097",
   "title": "同一候选情境中，材料提到的任务、阻碍或现有做法不足，先作为候选问题线索保留",
   "form": "heading",
   "level": 2,
   "line": 1422
  },
  {
   "id": "C-098",
   "title": "原始候选线索与专业判断分开；只有带范围的 C-018 判断才可形成或更新 C-019",
   "form": "heading",
   "level": 2,
   "line": 1437
  },
  {
   "id": "C-099",
   "title": "相邻 C-019 研究问题可在明确审阅目的与边界下并列对照、有限互相引用；相似不自动成为同一问题",
   "form": "heading",
   "level": 2,
   "line": 1452
  },
  {
   "id": "C-100",
   "title": "一份有边界的后续材料、相左材料或验证结果，只能提示多个 C-019 可能需要复看；提示不等于影响结论，更不批量改写问题",
   "form": "heading",
   "level": 2,
   "line": 1468
  },
  {
   "id": "C-101",
   "title": "C-018 可对每个候选复看问题分别表达「暂不复看、复看但维持、或另行形成 C-098 审阅说明」；这些是当次专业回应，不是状态、批量审批或自动任务",
   "form": "heading",
   "level": 2,
   "line": 1483
  },
  {
   "id": "C-102",
   "title": "把 C-093—C-101 分成「交接站、四个 Skill 竞聘站位、专业判断、持续研究对象与复看表达」；不把它们画成九个新 Skill 或强制流程",
   "form": "heading",
   "level": 2,
   "line": 1498
  },
  {
   "id": "C-103",
   "title": "VOC／Shopify 来源按「材料、情境整理方法、范围限定」分别支持 C-094；没有来源可绕过 C-093 直接进入 V2",
   "form": "heading",
   "level": 2,
   "line": 1516
  },
  {
   "id": "C-104",
   "title": "既有 VOC／Shopify 来源只帮助保留材料明确提到的已有做法；没有来源可绕过 C-093／C-094 直接进入 C-095",
   "form": "heading",
   "level": 2,
   "line": 1531
  },
  {
   "id": "C-105",
   "title": "既有 VOC／Shopify 来源只帮助保留材料明确提到的待完成、受阻或明确不足；没有来源可绕过 C-093／C-094 直接进入 C-097",
   "form": "heading",
   "level": 2,
   "line": 1546
  },
  {
   "id": "C-106",
   "title": "既有来源只能让同一候选审阅问题的支持、相左与未说明并列可见；材料数量、标签、状态或沉默不能替专业判断",
   "form": "heading",
   "level": 2,
   "line": 1560
  },
  {
   "id": "C-107",
   "title": "「VOC 洞察范围与证据底稿」先落在 V1 上游，经 C-093 交接；不抢占四个未来 Skill 竞聘位",
   "form": "heading",
   "level": 2,
   "line": 1573
  },
  {
   "id": "C-108",
   "title": "Shopify「客户声音出处与情境整理」可参与 C-094 的候选输入整理贡献；不独立占据 C-094",
   "form": "heading",
   "level": 2,
   "line": 1586
  },
  {
   "id": "C-109",
   "title": "C-094 完整候选应把候选人群、使用情境、待审阅任务线索与未知一并可回溯地交出；不拼成用户画像",
   "form": "heading",
   "level": 2,
   "line": 1599
  },
  {
   "id": "C-110",
   "title": "VOA 的旅程建模只帮材料把已说到的使用现场摆清楚；不补人物或任务",
   "form": "heading",
   "level": 2,
   "line": 1614
  },
  {
   "id": "C-111",
   "title": "候选人群不硬填：现有目标人群、Persona、会员分层与人群聚类都不进入 C-094",
   "form": "heading",
   "level": 2,
   "line": 1626
  },
  {
   "id": "C-112",
   "title": "“使用方法”只帮留住材料自己说到的使用动作／问法；标签不能生成任务",
   "form": "heading",
   "level": 2,
   "line": 1638
  },
  {
   "id": "C-113",
   "title": "“想做什么”不等于“没做顺什么”：任务线索不会自动升级为候选问题线索",
   "form": "heading",
   "level": 2,
   "line": 1652
  },
  {
   "id": "C-114",
   "title": "“提到一种办法”不等于“这办法不够”：做法观察不会自动升级为候选问题线索",
   "form": "heading",
   "level": 2,
   "line": 1667
  },
  {
   "id": "C-115",
   "title": "“同一材料多种办法”不等于“一份待选方案”：做法观察逐项保留，不自动归并、比较或推荐",
   "form": "heading",
   "level": 2,
   "line": 1682
  },
  {
   "id": "C-116",
   "title": "“A和B／先A后B／A替换B”只是材料原话：以同源附注留住，不画成系统关系线",
   "form": "heading",
   "level": 2,
   "line": 1695
  },
  {
   "id": "C-117",
   "title": "“有效／因此／节省／值得／失败”仍只是材料的主张：以同源断言附注留住，不升级为效果、因果或经营结论",
   "form": "heading",
   "level": 2,
   "line": 1709
  },
  {
   "id": "C-118",
   "title": "材料旁有数字、引用、测试记录或数据出处，只说明可回哪里核对：以同源依据指向留住，不升级为已验证结论",
   "form": "heading",
   "level": 2,
   "line": 1724
  },
  {
   "id": "C-119",
   "title": "获准打开原始出处后，定位、读到内容与文本关系分别留住；“文本支持”也不是经营验证",
   "form": "heading",
   "level": 2,
   "line": 1735
  },
  {
   "id": "C-120",
   "title": "原文同向也要保留出处自身范围与限制；“有原文”不是“证据充分”",
   "form": "heading",
   "level": 2,
   "line": 1749
  },
  {
   "id": "C-121",
   "title": "多份原始出处各自并列，不投票、不累计、不拼成共同证明",
   "form": "heading",
   "level": 2,
   "line": 1760
  },
  {
   "id": "C-122",
   "title": "多出处阅读只作为既有线索包的附页交给 C-018；并列阅读架不替专业作共同判断",
   "form": "heading",
   "level": 2,
   "line": 1772
  },
  {
   "id": "C-123",
   "title": "C-018 逐份说明本次怎样引用／未采用 C-121 出处材料；引用不构成排序、共同证明或自动更新 C-019",
   "form": "heading",
   "level": 2,
   "line": 1786
  },
  {
   "id": "C-124",
   "title": "C-018可在C-098中说明本次暂不形成／更新C-019的原因与判断缺口；不把它变成任务、负面结论或自动结果",
   "form": "heading",
   "level": 2,
   "line": 1799
  },
  {
   "id": "C-125",
   "title": "同一明确范围内出现可回查的新材料或专业解释时，C-018可在另一次C-098中对照C-124历史判断缺口；不自动开审、补齐或更新C-019",
   "form": "heading",
   "level": 2,
   "line": 1812
  },
  {
   "id": "C-126",
   "title": "新的C-098实际形成／更新C-019后，C-124当时为何不能写与本次具体改变什么必须并列保留；不静默覆盖、不产生审批／发布状态，也不自动进入C-020",
   "form": "heading",
   "level": 2,
   "line": 1826
  },
  {
   "id": "C-127",
   "title": "已有事项可以范围化引用明确C-019；当前怎样使用仍由接收职责在C-020另行判断",
   "form": "heading",
   "level": 2,
   "line": 1840
  },
  {
   "id": "C-128",
   "title": "当前经营决定中的验证缺口只能范围化反馈为待补清问题；不自动生成专业工作或业务动作",
   "form": "heading",
   "level": 2,
   "line": 1852
  },
  {
   "id": "C-129",
   "title": "专业回应回来，要把回答、未回答与后续判断分开摆",
   "form": "heading",
   "level": 2,
   "line": 1865
  },
  {
   "id": "C-130",
   "title": "重新看“怎么用”，不能把原来的判断擦掉",
   "form": "heading",
   "level": 2,
   "line": 1878
  },
  {
   "id": "C-131",
   "title": "经营取舍真的重做了，也不能把上一次决定擦掉",
   "form": "heading",
   "level": 2,
   "line": 1891
  },
  {
   "id": "C-132",
   "title": "决定了、准许了、实际做了、看见结果了，是四件不同的事。",
   "form": "heading",
   "level": 2,
   "line": 1903
  },
  {
   "id": "C-133",
   "title": "看见了结果，不等于已经知道原因；知道一点，也不等于马上改决定。",
   "form": "heading",
   "level": 2,
   "line": 1915
  },
  {
   "id": "C-134",
   "title": "已经决定重看，不等于已经换了取舍。",
   "form": "heading",
   "level": 2,
   "line": 1926
  },
  {
   "id": "C-135",
   "title": "明确维持旧取舍，不等于又作出了一次新决定。",
   "form": "heading",
   "level": 2,
   "line": 1936
  },
  {
   "id": "C-136",
   "title": "授权前提变了，不等于授权已经变了。",
   "form": "heading",
   "level": 2,
   "line": 1948
  },
  {
   "id": "C-137",
   "title": "前提已确认失效，受影响动作应暂停；但不等于已经停了。",
   "form": "heading",
   "level": 2,
   "line": 1961
  },
  {
   "id": "C-138",
   "title": "新／修改授权已形成，不等于动作已经恢复。",
   "form": "heading",
   "level": 2,
   "line": 1974
  },
  {
   "id": "C-139",
   "title": "动作已实际恢复，也不等于已经符合新授权或已经完成。",
   "form": "heading",
   "level": 2,
   "line": 1988
  },
  {
   "id": "C-140",
   "title": "动作范围对得上，也不等于授权前提已经实际满足。",
   "form": "heading",
   "level": 2,
   "line": 2001
  },
  {
   "id": "C-141",
   "title": "前提事实已分别可见，也不等于已经形成授权符合结论。",
   "form": "heading",
   "level": 2,
   "line": 2014
  },
  {
   "id": "C-142",
   "title": "已形成授权符合判断，也不等于动作已经完成或事项可以收尾。",
   "form": "heading",
   "level": 2,
   "line": 2027
  },
  {
   "id": "C-143",
   "title": "已核验完成的动作范围，也不等于事项已经可以整体收尾。",
   "form": "heading",
   "level": 2,
   "line": 2039
  },
  {
   "id": "C-144",
   "title": "留下“下次还要看什么”，不等于已生成待办或让事项自动挂起。",
   "form": "heading",
   "level": 2,
   "line": 2052
  },
  {
   "id": "C-145",
   "title": "新出现的结果或证据，不会自动改写此前的观察安排。",
   "form": "heading",
   "level": 2,
   "line": 2065
  },
  {
   "id": "C-146",
   "title": "后来实际形成的新范围化判断，也不等于旧判断已被替代或现实已经改变。",
   "form": "heading",
   "level": 2,
   "line": 2078
  },
  {
   "id": "C-147",
   "title": "已有明确影响说明，也不等于旧判断已被系统改写、隐藏或据此推动现实动作。",
   "form": "heading",
   "level": 2,
   "line": 2091
  },
  {
   "id": "C-148",
   "title": "多条明确影响说明并列存在，也不等于形成覆盖链、优先级、版本替换或唯一有效答案。",
   "form": "heading",
   "level": 2,
   "line": 2102
  },
  {
   "id": "C-149",
   "title": "已有关系判断，也不等于原说明已经合并、失效、排序或被替代。",
   "form": "heading",
   "level": 2,
   "line": 2113
  },
  {
   "id": "C-150",
   "title": "说明共同触及的范围事实，也不等于已经形成关系判断、待办或处理。",
   "form": "heading",
   "level": 2,
   "line": 2123
  },
  {
   "id": "C-151",
   "title": "后来出现一条可回查材料，也不等于它已经成为新说明、改写共同范围事实或关系判断。",
   "form": "heading",
   "level": 2,
   "line": 2134
  },
  {
   "id": "C-152",
   "title": "新材料被实际用于形成一条新说明，也不等于形成新判断、改写旧说明或决定说明之间关系。",
   "form": "heading",
   "level": 2,
   "line": 2145
  },
  {
   "id": "C-153",
   "title": "新说明要与既有说明放在同一阅读面，必须另有可回查的共同阅读定位；这不等于形成影响说明、进入C-148或决定说明关系。",
   "form": "heading",
   "level": 2,
   "line": 2156
  },
  {
   "id": "C-154",
   "title": "只有能回查“新判断影响旧判断哪一段”的实际原话，才可称为明确影响说明；这不等于覆盖、冲突、优先、版本替换或现实动作。",
   "form": "heading",
   "level": 2,
   "line": 2168
  },
  {
   "id": "C-155",
   "title": "共同阅读定位实际点名新说明与明确影响说明时，三者可以同页回查；这不等于合成为当前结论、进入C-148或推动现实动作。",
   "form": "heading",
   "level": 2,
   "line": 2180
  },
  {
   "id": "C-156",
   "title": "共同阅读定位必须分别、精确点名 C-152 与 C-147 的可回查片段；未点名内容继续留在外面。",
   "form": "heading",
   "level": 2,
   "line": 2192
  },
  {
   "id": "C-157",
   "title": "只找到一边或另一边片段不清时，不形成这一次共同阅读面；已有原记录继续留在原处。",
   "form": "heading",
   "level": 2,
   "line": 2204
  },
  {
   "id": "C-158",
   "title": "3 个管理层分身、50 个岗位能力与三条主链通过共享经营事项协同",
   "form": "heading",
   "level": 2,
   "line": 2214
  },
  {
   "id": "C-159",
   "title": "50 个岗位四平面能力总图，8 个业务域保留为第二视角",
   "form": "heading",
   "level": 2,
   "line": 2223
  },
  {
   "id": "C-160",
   "title": "四个能力平面接入三条经营主链，VOC 与 Shopify AI+BI 作为检验镜头",
   "form": "heading",
   "level": 2,
   "line": 2233
  },
  {
   "id": "C-161",
   "title": "三条主链各有首接岗位槽位和第一份交接物",
   "form": "heading",
   "level": 2,
   "line": 2243
  },
  {
   "id": "C-162",
   "title": "三条首份交接物共用五个可回查说明面",
   "form": "heading",
   "level": 2,
   "line": 2253
  },
  {
   "id": "C-163",
   "title": "新品「需求证据与问题地图」交给商业论证时，接收方怎样说明当前使用",
   "form": "heading",
   "level": 2,
   "line": 2263
  },
  {
   "id": "C-164",
   "title": "持续经营「需求变化判断及未来需求情景」交给供给与交付准备时，接收方怎样说明当前使用",
   "form": "heading",
   "level": 2,
   "line": 2275
  },
  {
   "id": "C-165",
   "title": "新市场「新市场进入问题与范围说明」交给商业论证时，接收方怎样说明当前使用",
   "form": "heading",
   "level": 2,
   "line": 2286
  },
  {
   "id": "C-166",
   "title": "三条首接职责先以“问题—交付—接口—竞聘留白”对齐 3+50",
   "form": "heading",
   "level": 2,
   "line": 2298
  },
  {
   "id": "C-167",
   "title": "来源3+50资产须先以五面业务证据取得能力站位的比较资格",
   "form": "heading",
   "level": 2,
   "line": 2310
  },
  {
   "id": "C-168",
   "title": "用三组现有来源参照校准五面竞聘尺，不作岗位任命",
   "form": "heading",
   "level": 2,
   "line": 2326
  },
  {
   "id": "C-169",
   "title": "来源资产进入能力站位时，先标记三种参与身份",
   "form": "heading",
   "level": 2,
   "line": 2336
  },
  {
   "id": "C-170",
   "title": "来源参与项以四项最小事实留档，但不成为50人花名册",
   "form": "heading",
   "level": 2,
   "line": 2348
  },
  {
   "id": "C-171",
   "title": "未来批量盘点按已确认能力站位分入口，不按50个来源Role建花名册",
   "form": "heading",
   "level": 2,
   "line": 2360
  },
  {
   "id": "C-172",
   "title": "三个入口可并行预读，前台仍按单个比较单位逐项确认",
   "form": "heading",
   "level": 2,
   "line": 2371
  },
  {
   "id": "C-173",
   "title": "首个前台确认：AGT-006 的需求证据片段，作为消费者需求洞察的直接候选能力证据",
   "form": "heading",
   "level": 2,
   "line": 2383
  },
  {
   "id": "C-174",
   "title": "第二个前台比较单位：VOC闭集打标线作为消费者需求洞察的局部可拆能力片段",
   "form": "heading",
   "level": 2,
   "line": 2394
  },
  {
   "id": "C-175",
   "title": "「受控标签候选整理」成为未来 Skill 可竞聘的最小能力站位",
   "form": "heading",
   "level": 2,
   "line": 2406
  },
  {
   "id": "C-176",
   "title": "Shopify「客户声音待查来源与可回溯边界」只作 C-175 的上游相邻参照",
   "form": "heading",
   "level": 2,
   "line": 2418
  },
  {
   "id": "C-177",
   "title": "真实客户声音材料进入 C-175 前，只核对四项材料资格",
   "form": "heading",
   "level": 2,
   "line": 2428
  },
  {
   "id": "C-178",
   "title": "C-175 候选材料交接时，六项事实不得静默丢失",
   "form": "heading",
   "level": 2,
   "line": 2439
  },
  {
   "id": "C-179",
   "title": "未来候选 Skill 竞聘 C-175，先证明会保真、会受控、会停下、会回流",
   "form": "heading",
   "level": 2,
   "line": 2450
  },
  {
   "id": "C-180",
   "title": "C-174 静态受控整理片段只作竞聘前对照，不能自己成为候选 Skill",
   "form": "heading",
   "level": 2,
   "line": 2460
  },
  {
   "id": "C-181",
   "title": "C-174 与 C-176 可以并列阅读，但不能合成能力或候选资格",
   "form": "heading",
   "level": 2,
   "line": 2472
  },
  {
   "id": "C-182",
   "title": "第三份来源也必须用四句人话保留，并列不变成字段合同",
   "form": "heading",
   "level": 2,
   "line": 2485
  },
  {
   "id": "C-183",
   "title": "一个复杂经营事项，五个协作位置，各自不越界",
   "form": "heading",
   "level": 2,
   "line": 2494
  },
  {
   "id": "C-184",
   "title": "持续经营联合调整：把四类专业交付放回同一件事，而不是排成流程",
   "form": "heading",
   "level": 2,
   "line": 2509
  },
  {
   "id": "C-185",
   "title": "联合调整中的市场侧，拆成两张不能互相代写的条件卡",
   "form": "heading",
   "level": 2,
   "line": 2522
  },
  {
   "id": "C-186",
   "title": "先把“需求变化及未来情景”钉成可竞聘的能力地址",
   "form": "heading",
   "level": 2,
   "line": 2535
  },
  {
   "id": "C-187",
   "title": "AGT-016只带“区间与失效条件”进来，不把补货方案带进来",
   "form": "heading",
   "level": 2,
   "line": 2548
  },
  {
   "id": "C-188",
   "title": "AGT-003只守住“证据能不能拼”，不来做需求判断",
   "form": "heading",
   "level": 2,
   "line": 2561
  },
  {
   "id": "C-189",
   "title": "C-186按“能力地址／局部片段／相邻护栏”三层阅读，不把两张来源卡拼起来",
   "form": "heading",
   "level": 2,
   "line": 2574
  },
  {
   "id": "C-190",
   "title": "把“供给与既有承诺的兑现条件”钉成第二个Worker能力地址，不写成补货命令",
   "form": "heading",
   "level": 2,
   "line": 2586
  },
  {
   "id": "C-191",
   "title": "把“定价／促销条件”钉成第三个Worker能力地址，不写成实际调价",
   "form": "heading",
   "level": 2,
   "line": 2598
  },
  {
   "id": "C-192",
   "title": "把“渠道／触达／可售条件”钉成第四个 Worker 能力地址，不写成发布或投放",
   "form": "heading",
   "level": 2,
   "line": 2610
  },
  {
   "id": "C-193",
   "title": "把“经营经济性与现金影响”钉成第五个 Worker 能力地址，不写成财务审批",
   "form": "heading",
   "level": 2,
   "line": 2622
  },
  {
   "id": "C-194",
   "title": "五张能力卡进入同一事项的联动比较接口，不画成五步流程",
   "form": "heading",
   "level": 2,
   "line": 2634
  },
  {
   "id": "C-195",
   "title": "事项 Lead 把待决取舍、必要升级与未结责任摊开，不替任何人做决定",
   "form": "heading",
   "level": 2,
   "line": 2646
  },
  {
   "id": "C-196",
   "title": "必要升级才进入管理边界；管理边界只回范围化约束，不变成审批链",
   "form": "heading",
   "level": 2,
   "line": 2658
  },
  {
   "id": "C-197",
   "title": "管理边界拆成三个未来能力站位，仍只是一张接收面",
   "form": "heading",
   "level": 2,
   "line": 2670
  },
  {
   "id": "C-198",
   "title": "独立控制只交范围化条件，不成为总审批门",
   "form": "heading",
   "level": 2,
   "line": 2683
  },
  {
   "id": "C-199",
   "title": "平台支撑只交可回查说明与使用反馈，不借支撑取得经营权",
   "form": "heading",
   "level": 2,
   "line": 2696
  },
  {
   "id": "C-200",
   "title": "平台使用反馈只回指原责任，不自动改写原依据",
   "form": "heading",
   "level": 2,
   "line": 2709
  },
  {
   "id": "C-201",
   "title": "决策权、岗位能力与协作位置正交占位，三条主链按需共用",
   "form": "heading",
   "level": 2,
   "line": 2722
  },
  {
   "id": "C-202",
   "title": "三条首接槽位由业务运营主接，其他平面按边界协作；复用不等就另留站位",
   "form": "heading",
   "level": 2,
   "line": 2735
  },
  {
   "id": "C-203",
   "title": "首交付先定问题，支撑按题并列，判断各自回原处",
   "form": "heading",
   "level": 2,
   "line": 2748
  },
  {
   "id": "C-204",
   "title": "并列支撑分为共用站位、共享基础切片与主链独有延伸",
   "form": "heading",
   "level": 2,
   "line": 2762
  },
  {
   "id": "C-205",
   "title": "能力站位先定“谁交什么”，50岗才按平面竞聘",
   "form": "heading",
   "level": 2,
   "line": 2776
  },
  {
   "id": "C-206",
   "title": "一件复杂经营事项里，四平面按需进入、各自回到原责任",
   "form": "heading",
   "level": 2,
   "line": 2790
  },
  {
   "id": "C-207",
   "title": "五张业务Worker地址先统一成岗位能力合同",
   "form": "heading",
   "level": 2,
   "line": 2803
  },
  {
   "id": "C-208",
   "title": "候选先交六份可回查证明，不先报名字",
   "form": "heading",
   "level": 2,
   "line": 2816
  },
  {
   "id": "C-209",
   "title": "组合先写成可回查说明，才讨论 Bundle／Preset",
   "form": "heading",
   "level": 2,
   "line": 2830
  },
  {
   "id": "C-210",
   "title": "组合来竞聘一个未来能力位，不等于任命一个员工",
   "form": "heading",
   "level": 2,
   "line": 2844
  },
  {
   "id": "C-211",
   "title": "3+50来源对照与岗位能力组合外壳",
   "form": "heading",
   "level": 2,
   "line": 2858
  },
  {
   "id": "C-212",
   "title": "C-186首份证明包的输入轮廓",
   "form": "heading",
   "level": 2,
   "line": 2870
  },
  {
   "id": "C-213",
   "title": "C-186五种语义的抽象写法样例",
   "form": "heading",
   "level": 2,
   "line": 2884
  },
  {
   "id": "C-214",
   "title": "右侧抽屉的卡片下钻阅读与两个开放状态",
   "form": "heading",
   "level": 2,
   "line": 2895
  },
  {
   "id": "C-215",
   "title": "C-190首份证明包的输入轮廓：供给、承诺、兑现与未知不互相替代",
   "form": "heading",
   "level": 2,
   "line": 2907
  },
  {
   "id": "C-216",
   "title": "C-191首份证明包的输入轮廓：候选、成立条件、生效与效果不互相替代",
   "form": "heading",
   "level": 2,
   "line": 2919
  },
  {
   "id": "C-217",
   "title": "C-192首份证明包的输入轮廓：候选路径、触达假设、可售条件与实际状态不互相替代",
   "form": "heading",
   "level": 2,
   "line": 2932
  },
  {
   "id": "C-218",
   "title": "C-193首份证明包的输入轮廓：口径、基线、情景、时序与实际记录不能互相替代",
   "form": "heading",
   "level": 2,
   "line": 2946
  },
  {
   "id": "C-219",
   "title": "五张合同共用怎样证明，不共用要判断什么",
   "form": "heading",
   "level": 2,
   "line": 2960
  },
  {
   "id": "C-220",
   "title": "先固定来源访问边界，再选一簇资料深读",
   "form": "heading",
   "level": 2,
   "line": 2972
  },
  {
   "id": "C-221",
   "title": "固定公开来源的角色参照台账",
   "form": "heading",
   "level": 2,
   "line": 2984
  },
  {
   "id": "C-222",
   "title": "固定公开来源的产品能力边界台账",
   "form": "heading",
   "level": 2,
   "line": 2996
  },
  {
   "id": "C-223",
   "title": "固定公开来源的知识资产边界台账",
   "form": "heading",
   "level": 2,
   "line": 3008
  },
  {
   "id": "C-224",
   "title": "VOC 来源目录与报告自述边界台账",
   "form": "heading",
   "level": 2,
   "line": 3019
  },
  {
   "id": "C-225",
   "title": "VOC 策略页最小读取授权与结构台账",
   "form": "heading",
   "level": 2,
   "line": 3032
  },
  {
   "id": "C-226",
   "title": "消费者需求报告结构候选资格台账",
   "form": "heading",
   "level": 2,
   "line": 3047
  },
  {
   "id": "C-227",
   "title": "消费者需求报告证据资格元信息台账",
   "form": "heading",
   "level": 2,
   "line": 3060
  },
  {
   "id": "C-228",
   "title": "报告级消费者需求证据来源资格核对成为未来 Skill 可竞聘的窄能力站位",
   "form": "heading",
   "level": 2,
   "line": 3073
  },
  {
   "id": "C-229",
   "title": "SI-Agent E01 只进入 C-228 的来源追溯局部，不成为直接候选 Skill",
   "form": "heading",
   "level": 2,
   "line": 3088
  },
  {
   "id": "C-230",
   "title": "AMI CI 报告边界规范只进入 C-228 的方法／样本披露局部",
   "form": "heading",
   "level": 2,
   "line": 3103
  },
  {
   "id": "C-231",
   "title": "当前登记来源无直接候选，C-228 保留 Skills 竞聘空位",
   "form": "heading",
   "level": 2,
   "line": 3118
  },
  {
   "id": "C-232",
   "title": "新市场机会先变成可比较问题，不直接变成进入方案",
   "form": "heading",
   "level": 2,
   "line": 3131
  },
  {
   "id": "C-233",
   "title": "并列专业条件只在改变进入问题本身时回到 C-232",
   "form": "heading",
   "level": 2,
   "line": 3147
  },
  {
   "id": "C-234",
   "title": "同一准入回应背景下，把“改进入问题”和“限经营选项”分开",
   "form": "heading",
   "level": 2,
   "line": 3164
  },
  {
   "id": "C-235",
   "title": "复用 C-021 共用商业论证能力站位，不复制新市场专属岗位",
   "form": "heading",
   "level": 2,
   "line": 3179
  },
  {
   "id": "C-236",
   "title": "C-021 共用商业论证能力站位主归业务运营平面",
   "form": "heading",
   "level": 2,
   "line": 3195
  },
  {
   "id": "C-237",
   "title": "C-027 上市经营策划主归业务运营平面，并与 C-021 保持最小语义交接",
   "form": "heading",
   "level": 2,
   "line": 3210
  },
  {
   "id": "C-238",
   "title": "C-028 产品市场准入主归独立控制，范围化判断不等于批准",
   "form": "heading",
   "level": 2,
   "line": 3225
  },
  {
   "id": "C-239",
   "title": "C-029 供给与交付准备主归业务运营，条件方案不等于承诺、兑现或可售",
   "form": "heading",
   "level": 2,
   "line": 3240
  },
  {
   "id": "C-240",
   "title": "C-030 渠道发布与可售核验主归业务运营，授权、发布事实、可售与履约分别有据",
   "form": "heading",
   "level": 2,
   "line": 3256
  },
  {
   "id": "C-241",
   "title": "C-031 商品资料管理主归数据与 Agent 平台，共同商品依据不等于表达、发布或当前展示",
   "form": "heading",
   "level": 2,
   "line": 3272
  },
  {
   "id": "C-242",
   "title": "C-033 内容策划与表达主归业务运营，事实、品牌、内容、素材、采用、发布、验证意图与效果分别有据",
   "form": "heading",
   "level": 2,
   "line": 3288
  },
  {
   "id": "C-243",
   "title": "C-034 品牌定位与主张主归业务运营，品牌对象、产品事实、品牌判断、采用状态、表达与效果分别有据",
   "form": "heading",
   "level": 2,
   "line": 3304
  },
  {
   "id": "C-244",
   "title": "C-035 定价与促销主归业务运营，比较、约束、候选、决定、生效与结果分别有据",
   "form": "heading",
   "level": 2,
   "line": 3320
  },
  {
   "id": "C-245",
   "title": "C-036 经营经济性评估主归业务运营，事实、口径、测算、判断、决定、财务事实与结果分别有据",
   "form": "heading",
   "level": 2,
   "line": 3336
  },
  {
   "id": "C-246",
   "title": "C-037 付费媒体投放与优化主归业务运营，方案、决定／预算、授权、平台状态、触达／消耗、结果与因果分别有据",
   "form": "heading",
   "level": 2,
   "line": 3351
  },
  {
   "id": "C-247",
   "title": "C-038 经营实验与效果评估主归业务运营，问题、方案、授权、行动、证据、观察、估计、解释、因果与决定分别有据",
   "form": "heading",
   "level": 2,
   "line": 3366
  },
  {
   "id": "C-248",
   "title": "C-039 经营数据供给与质量保障主归数据与 Agent 平台，用途、源记录、含义、处理、质量、异常、修复、更正与当前可用性分别有据",
   "form": "heading",
   "level": 2,
   "line": 3382
  },
  {
   "id": "C-249",
   "title": "C-040 经营口径与对象关系治理主归数据与 Agent 平台，平台维护可引用约定，领域业务保留含义与对象身份",
   "form": "heading",
   "level": 2,
   "line": 3399
  },
  {
   "id": "C-250",
   "title": "C-051 经营知识整理与维护主归数据与 Agent 平台，来源领域保留内容判断，使用专业保留当前用途判断",
   "form": "heading",
   "level": 2,
   "line": 3416
  },
  {
   "id": "C-251",
   "title": "C-052 是跨领域方法候选交付类型，不新增独立责任站位",
   "form": "heading",
   "level": 2,
   "line": 3432
  },
  {
   "id": "C-252",
   "title": "专业方法制作支持形成可复用能力站位，能力常驻、协作临时",
   "form": "heading",
   "level": 2,
   "line": 3449
  },
  {
   "id": "C-253",
   "title": "专业方法验证支持形成可复用能力站位，领域持有结论，独立复核另行成立",
   "form": "heading",
   "level": 2,
   "line": 3467
  },
  {
   "id": "C-254",
   "title": "专业方法生效与版本治理支持形成可复用能力站位，平台组织治理交付，领域保留采用与变化决定",
   "form": "heading",
   "level": 2,
   "line": 3486
  },
  {
   "id": "C-255",
   "title": "任务承接胜任评估支持形成可复用能力站位，平台组织证据，专业保留胜任结论",
   "form": "heading",
   "level": 2,
   "line": 3505
  },
  {
   "id": "C-256",
   "title": "任务匹配与有边界承接支持形成可复用能力站位，经营管理组织匹配，有权责任方保留具体安排",
   "form": "heading",
   "level": 2,
   "line": 3524
  },
  {
   "id": "C-257",
   "title": "接责确认与责任生效支持形成可复用能力站位，平台组织证据，真实确认与生效判断不外包",
   "form": "heading",
   "level": 2,
   "line": 3543
  },
  {
   "id": "C-258",
   "title": "已生效责任的变化与连续性支持形成可复用能力站位，平台组织证据，不取得暂停、撤回或改派权",
   "form": "heading",
   "level": 2,
   "line": 3563
  },
  {
   "id": "C-259",
   "title": "动作授权变化与停复工证据形成可复用支持能力站位，平台组织证据，不成为授权中心",
   "form": "heading",
   "level": 2,
   "line": 3583
  },
  {
   "id": "C-260",
   "title": "业务依赖就绪与真实开工形成可复用支持能力站位，平台组织证据，不成为自动开工闸门",
   "form": "heading",
   "level": 2,
   "line": 3604
  },
  {
   "id": "C-261",
   "title": "执行回执与实际完成形成可复用支持能力站位，平台组织证据，不成为执行引擎或完成裁判",
   "form": "heading",
   "level": 2,
   "line": 3625
  },
  {
   "id": "C-262",
   "title": "产物接收与验收形成可复用支持能力站位，平台组织证据，不成为通用验收官",
   "form": "heading",
   "level": 2,
   "line": 3646
  },
  {
   "id": "C-263",
   "title": "执行收尾与后续责任形成可复用支持能力站位，平台组织证据，不成为结案责任方",
   "form": "heading",
   "level": 2,
   "line": 3666
  },
  {
   "id": "C-264",
   "title": "后续核对证据与经营效果判断形成可复用支持能力站位，平台连接证据，不成为效果裁判",
   "form": "heading",
   "level": 2,
   "line": 3686
  },
  {
   "id": "C-265",
   "title": "经营反馈与经营经验候选形成可复用支持能力站位，平台组织候选，不判断复用价值",
   "form": "heading",
   "level": 2,
   "line": 3707
  },
  {
   "id": "C-266",
   "title": "经营经验候选目标用途评估与去向形成可复用支持能力站位，平台组织比较，不替接收专业判适用",
   "form": "heading",
   "level": 2,
   "line": 3728
  },
  {
   "id": "C-267",
   "title": "经营经验候选实际引用与使用反馈形成可复用支持能力站位，平台留据回指，不自动采纳或回写",
   "form": "heading",
   "level": 2,
   "line": 3749
  },
  {
   "id": "C-268",
   "title": "内容复核与修订影响由既有责任闭合，不新增跨对象能力站位",
   "form": "heading",
   "level": 2,
   "line": 3769
  },
  {
   "id": "C-269",
   "title": "回到高层能力全景，3+50 与复杂协作不再重复建图，先补跨岗协作需要的形成断点",
   "form": "heading",
   "level": 2,
   "line": 3782
  },
  {
   "id": "C-270",
   "title": "共享经营事项内跨岗协作需要与边界形成接口",
   "form": "heading",
   "level": 3,
   "line": 3796
  },
  {
   "id": "C-271",
   "title": "C-043需求变化后的联合调整跨岗边界检验镜头",
   "form": "heading",
   "level": 3,
   "line": 3810
  },
  {
   "id": "C-272",
   "title": "C-043需求变化触发跨岗说明的最小识别样本",
   "form": "heading",
   "level": 3,
   "line": 3820
  },
  {
   "id": "C-273",
   "title": "C-043专业贡献接收与回位的最小共同说明样本",
   "form": "heading",
   "level": 3,
   "line": 3830
  },
  {
   "id": "C-274",
   "title": "接收后未结问题与责任连续的最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3842
  },
  {
   "id": "C-275",
   "title": "未结条件变化后的局部责任与依据回看最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3854
  },
  {
   "id": "C-276",
   "title": "局部回看后的新依据回到当前用途的最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3866
  },
  {
   "id": "C-277",
   "title": "当前用途变化后的原责任回位与新专业问题分界最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3878
  },
  {
   "id": "C-278",
   "title": "新专业问题与原依据保持边界的最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3890
  },
  {
   "id": "C-279",
   "title": "原问题与新专业问题的依据分别使用与回传最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3902
  },
  {
   "id": "C-280",
   "title": "共同事项中差异与未解的并列可见最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3914
  },
  {
   "id": "C-281",
   "title": "差异与未解被看见后的责任回核最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3926
  },
  {
   "id": "C-282",
   "title": "责任回核结果回到原问题、新问题与共同事项的最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3937
  },
  {
   "id": "C-283",
   "title": "共同事项保留差异并支持有权责任方作当前经营取舍的最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3948
  },
  {
   "id": "C-284",
   "title": "当前经营取舍后的执行前提与未接续责任最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3959
  },
  {
   "id": "C-285",
   "title": "执行前提兑现与偏离回传最小说明样本",
   "form": "heading",
   "level": 3,
   "line": 3970
  },
  {
   "id": "C-286",
   "title": "实际兑现偏离后的范围化收尾与后续责任接口",
   "form": "heading",
   "level": 3,
   "line": 3981
  },
  {
   "id": "C-287",
   "title": "范围化收尾后的证据与后续责任引用接口",
   "form": "heading",
   "level": 3,
   "line": 3992
  },
  {
   "id": "C-288",
   "title": "证据引用后的专业解释、效果判断与不能判断分层回位接口",
   "form": "heading",
   "level": 3,
   "line": 4003
  },
  {
   "id": "C-289",
   "title": "经营决定事实与经验候选、后续责任的分开回接接口",
   "form": "heading",
   "level": 3,
   "line": 4014
  },
  {
   "id": "C-290",
   "title": "经营决定、经验候选与后续责任按当前用途分别引用接口",
   "form": "heading",
   "level": 3,
   "line": 4025
  },
  {
   "id": "C-291",
   "title": "当前用途范围化判断分别回接原决定、经验候选与后续责任接口",
   "form": "heading",
   "level": 3,
   "line": 4036
  },
  {
   "id": "C-292",
   "title": "未覆盖项、补证条件与反馈地址分别保留接口",
   "form": "heading",
   "level": 3,
   "line": 4047
  },
  {
   "id": "C-293",
   "title": "共享经营事项跨岗协作高层语义收束审查",
   "form": "heading",
   "level": 3,
   "line": 4058
  },
  {
   "id": "C-294",
   "title": "新市场经营向持续经营的范围化责任接续高层接口",
   "form": "heading",
   "level": 3,
   "line": 4068
  },
  {
   "id": "C-295",
   "title": "同一新市场双范围责任接续检验镜头",
   "form": "heading",
   "level": 3,
   "line": 4079
  },
  {
   "id": "C-296",
   "title": "订单—支付—退款—结算对账高层责任接口",
   "form": "heading",
   "level": 3,
   "line": 4091
  },
  {
   "id": "C-297",
   "title": "客户问题处理与服务补救高层责任接口",
   "form": "heading",
   "level": 3,
   "line": 4102
  },
  {
   "id": "C-298",
   "title": "组织能力供需高层责任接口",
   "form": "heading",
   "level": 3,
   "line": 4113
  },
  {
   "id": "C-299",
   "title": "C-269登记高层缺口收口与阶段切换审查",
   "form": "heading",
   "level": 3,
   "line": 4124
  },
  {
   "id": "C-300",
   "title": "3+50岗位能力站位批量映射入口与经营管理5位",
   "form": "heading",
   "level": 3,
   "line": 4135
  },
  {
   "id": "C-301",
   "title": "业务运营35岗七批入口与第一批5位",
   "form": "heading",
   "level": 3,
   "line": 4149
  },
  {
   "id": "C-302",
   "title": "业务运营第二批5位：产品工程、验证与供应起点",
   "form": "heading",
   "level": 3,
   "line": 4159
  },
  {
   "id": "C-303",
   "title": "业务运营第三批5位：供需、库存与履约",
   "form": "heading",
   "level": 3,
   "line": 4172
  },
  {
   "id": "C-304",
   "title": "业务运营第四批5位：渠道与市场经营",
   "form": "heading",
   "level": 3,
   "line": 4186
  },
  {
   "id": "C-305",
   "title": "业务运营第五批5位：商品、店铺、品牌与内容",
   "form": "heading",
   "level": 3,
   "line": 4200
  },
  {
   "id": "C-306",
   "title": "业务运营第六批5位：素材、投放、合作与增长",
   "form": "heading",
   "level": 3,
   "line": 4214
  },
  {
   "id": "C-307",
   "title": "业务运营第七批5位：服务体验与经营对账",
   "form": "heading",
   "level": 3,
   "line": 4228
  },
  {
   "id": "C-308",
   "title": "独立控制5位：独立复核、税务实体、合同知产、产品合规隐私、信息安全权限",
   "form": "heading",
   "level": 3,
   "line": 4242
  },
  {
   "id": "C-309",
   "title": "数据与Agent平台5位：口径对象、数据质量、系统工具、知识方法能力资产、Agent运行可靠性",
   "form": "heading",
   "level": 3,
   "line": 4256
  },
  {
   "id": "C-310",
   "title": "3+50高层闭合审查范围化通过，执行层未验收",
   "form": "heading",
   "level": 3,
   "line": 4270
  },
  {
   "id": "C-311",
   "title": "50岗共用岗位能力装配接口：岗位自身闭环与事项协作贡献双轨分开",
   "form": "heading",
   "level": 3,
   "line": 4284
  },
  {
   "id": "C-312",
   "title": "BO-11双轨装配首个留白样本：补货候选与供需约束",
   "form": "heading",
   "level": 3,
   "line": 4299
  },
  {
   "id": "C-313",
   "title": "第01能力空位候选入场合同：需求情景只读引用与不可改写",
   "form": "heading",
   "level": 3,
   "line": 4311
  },
  {
   "id": "C-314",
   "title": "03新市场经营完整多岗E2E设计级验收镜头",
   "form": "heading",
   "level": 3,
   "line": 4326
  },
  {
   "id": "C-315",
   "title": "M5 Smart德国Amazon目标市场证据账 · 范围已确认并完成官方初账",
   "form": "heading",
   "level": 3,
   "line": 4342
  },
  {
   "id": "C-316",
   "title": "当前断点（2026-10-01）：**第一组阻塞证明已按五个问题收口。官方型号映射确认`M5 Smart＝BP380`；德国官网可定位红／灰、单泵／双泵四个BP380设备SKU，但Amazon ASIN与具体设备SKU、BP380-A／B／…",
   "form": "bold",
   "level": 0,
   "line": 74
  },
  {
   "id": "C-317",
   "title": "当前断点（2026-10-01）：**C-316留下的四类内部证明包已经回到既有责任地址，并各自写清主责、来源专业、当前接收用途、最小交付、缺失和停止线：实机身份与运行版本包由C-031组织、BO-06／07提供工程事实；Amazon AS…",
   "form": "bold",
   "level": 0,
   "line": 76
  },
  {
   "id": "C-318",
   "title": "当前断点（2026-10-01）：**C-317第二类证明包已经被收窄成一份《B0GHG2W8WS对象交叉关系证明请求》：只要求用带来源、版本、期间和适用范围的内部记录，逐段证明Amazon渠道对象、企业商品／套装SKU、BP380设备SK…",
   "form": "bold",
   "level": 0,
   "line": 78
  },
  {
   "id": "C-319",
   "title": "当前断点（2026-10-01）：**第一跳权威来源已经核对清楚，但目标账号记录尚未取得。Amazon官方SP-API定义表明，卖家授权范围内的`searchListingsItems`只读响应可在同一记录中返回seller-provide…",
   "form": "bold",
   "level": 0,
   "line": 80
  },
  {
   "id": "C-320",
   "title": "当前断点（2026-10-01）：**一份德国卖家账号证据的接收与真实性核验合同已经固定，但本轮没有收到用户提供的`searchListingsItems`原始响应，也没有收到Inventory／All Listings Report原文件…",
   "form": "bold",
   "level": 0,
   "line": 82
  },
  {
   "id": "C-321",
   "title": "当前断点（2026-10-01）：**C-314问题B“哪些进入路径值得比较”已经以`M5 Smart／BP380 × 德国 × Amazon.de × 免手持／App控制相关宣称 × 截至2026-10-01`为共同范围，形成一张高层经营…",
   "form": "bold",
   "level": 0,
   "line": 84
  },
  {
   "id": "C-322",
   "title": "当前断点（2026-10-01）：**C-321的三类候选经营关系下面已经建立一份共用的“最小内部事实请求合同”，但只完成空白合同定义，尚未派发、未指定主体／负责人／截止日、未登录账号、未联系Amazon或伙伴、未取得任何真实内部材料。合同…",
   "form": "bold",
   "level": 0,
   "line": 88
  },
  {
   "id": "C-323",
   "title": "当前断点（2026-10-01）：**C-322五个事实包中的第1包“经营主体与权利”已经形成一张不含真实企业数据的空白回收样例，路径为`C-314 → C-321 → C-322 → C-323`。一条回答被分成路径与事实问题、当前有据事…",
   "form": "bold",
   "level": 0,
   "line": 90
  },
  {
   "id": "C-324",
   "title": "当前断点（2026-10-01）：**已按`C-314 → C-321 → C-322 → C-323 → C-324`完成五个事实包的横向边界审查。五包共用C-323已经验证的六块回包读法和五种单条事实状态，但只共用阅读语法，不共用业务问…",
   "form": "bold",
   "level": 0,
   "line": 92
  },
  {
   "id": "C-325",
   "title": "当前断点（2026-10-01）：**已按`C-314 → C-321 → C-322 → C-323 → C-324 → C-325`建立五包专业回应进入范围化经营比较的用途边界。C-324继续说明单条回答处于尚未提供、已收未核、冲突开放…",
   "form": "bold",
   "level": 0,
   "line": 94
  },
  {
   "id": "C-326",
   "title": "当前断点（2026-10-01）：**已按`C-314 → C-321 → C-322 → C-323 → C-324 → C-325 → C-326`，只用C-323“经营主体与权利”三个空白回答完成A／B／C三路径的比较用途语义校准。校…",
   "form": "bold",
   "level": 0,
   "line": 96
  },
  {
   "id": "C-327",
   "title": "当前断点（2026-10-01）：**已回到C-314问题C，新增与C-321问题B并列的直属高层入口`C-327 · 有限范围经营条件成立边界对照`。最小对照单位为`一个C-014共享经营事项 × 一个C-232范围版本 × 当前有限进入…",
   "form": "bold",
   "level": 0,
   "line": 98
  },
  {
   "id": "C-328",
   "title": "当前断点（2026-10-01）：**已回到C-314问题D，新增与C-321问题B、C-327问题C并列的直属高层入口`C-328 · 第一笔真实经营证据边界对照`。最小阅读单位为`一个C-014共享经营事项 × 一个C-232范围版本…",
   "form": "bold",
   "level": 0,
   "line": 100
  },
  {
   "id": "C-329",
   "title": "当前断点（2026-10-01）：**已回到C-314问题E，新增与C-321问题B、C-327问题C、C-328问题D并列的直属高层入口`C-329 · 哪一段责任可以接续持续经营`。它不重做交接制度，只把C-042、C-294／295已…",
   "form": "bold",
   "level": 0,
   "line": 102
  },
  {
   "id": "C-330",
   "title": "当前断点（2026-10-01）：**C-314的A—E五问已完成设计级闭合审查，不再新增问题F。A的通用责任地址固定为C-232《新市场进入问题与范围说明》，C-315只是一张`M5 Smart／BP380 × 德国 × 免手持及App控…",
   "form": "bold",
   "level": 0,
   "line": 104
  },
  {
   "id": "C-331",
   "title": "当前断点（2026-10-02）：**已把C-314的A—E五问投影到C-311“一岗两轨一账”的轨道B，形成`A—E五问 × 3+50既有能力贡献映射`。这是能力需要对照，不是岗位任命或复杂E2E已经运行：A以BO-02为首位，OM-01…",
   "form": "bold",
   "level": 0,
   "line": 106
  },
  {
   "id": "C-332",
   "title": "当前断点（2026-10-02）：**已把C-331问题B中的OM-01与BO-19展开为第一张“双能力位贡献空白样本”，入口只放在C-331的B问卡内；阅读链现为`C-311 → C-331 → C-332 → C-333`，C-332在…",
   "form": "bold",
   "level": 0,
   "line": 108
  },
  {
   "id": "C-333",
   "title": "当前断点（2026-10-02）：**已在C-332的接收用途卡内建立唯一子页“问题B接收侧空白装配账”。C-321只把局部贡献定位到同一范围、候选经营关系、比较面和局部主张，保留贡献版本、最大使用边界、缺口／冲突／未知与回位地址；它不解释…",
   "form": "bold",
   "level": 0,
   "line": 110
  },
  {
   "id": "C-334",
   "title": "当前断点（2026-10-02）：**已回到C-331问题A建立“BO-02首位贡献空白样本”，与C-332同级，阅读链为`C-311 → C-331 → C-334`，C-334自身为叶页，不新增C-335。BO-02只交《问题A市场机会…",
   "form": "bold",
   "level": 0,
   "line": 112
  },
  {
   "id": "C-335",
   "title": "当前断点（2026-10-02）：**已回到C-331问题C建立“IC-04单条件贡献空白样本”，与C-334、C-332同级，阅读链为`C-311 → C-331 → C-335`，C-335自身为叶页。唯一具名条件`NM-COND-01…",
   "form": "bold",
   "level": 0,
   "line": 114
  },
  {
   "id": "C-336",
   "title": "当前断点（2026-10-02）：**已回到C-331问题D建立“BO-35订单事实贡献空白样本”，与C-335、C-334、C-332同级，阅读链为`C-311 → C-331 → C-336`，C-336自身为叶页；C-328是问题D的…",
   "form": "bold",
   "level": 0,
   "line": 116
  },
  {
   "id": "C-337",
   "title": "当前断点（2026-10-02）：**已回到C-331问题E建立“OM-02范围化责任接续贡献空白样本”，与C-336、C-335、C-334、C-332同级，阅读链为`C-311 → C-331 → C-337`，C-337自身为叶页；C…",
   "form": "bold",
   "level": 0,
   "line": 118
  },
  {
   "id": "C-338",
   "title": "当前断点（2026-10-02）：**已在C-331的A—E五问列表之后、四责任平面之前建立独立全宽“五样本闭合审查”入口，阅读链为`C-311 → C-331 → C-338`；C-338是C-331直属审查页，与C-334／C-332→…",
   "form": "bold",
   "level": 0,
   "line": 120
  },
  {
   "id": "C-339",
   "title": "当前断点（2026-10-02）：**已从C-338新增唯一全宽下钻入口，阅读链为`C-311 → C-331 → C-338 → C-339`；C-313只作为已确认候选入场合同的参照，不改变其`BO-11第01空位`父子结构。C-339…",
   "form": "bold",
   "level": 0,
   "line": 122
  },
  {
   "id": "C-340",
   "title": "当前断点（2026-10-02）：**C-339末尾建议已执行：选择A的既有`BO-02@C-301`作为第一份专业化合同，阅读链固定为`C-311 → C-331 → C-338 → C-339 → C-340`；入口嵌在C-339的A／…",
   "form": "bold",
   "level": 0,
   "line": 124
  },
  {
   "id": "C-341",
   "title": "当前断点（2026-10-02）：**C-341现只增加C-342一个同题静态样子页，阅读链为`C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342`。候选记录`C341-BO02-CA…",
   "form": "bold",
   "level": 0,
   "line": 126
  },
  {
   "id": "C-342",
   "title": "当前断点（2026-10-02）：**已在C-341“本轮补证”卡内建立唯一叶页`C342-BO02-DE-AMZ-M5SMART-01`，固定研究锚点为`M5 Smart／BP380 × 德国 × Amazon.de × 免手持吸奶与Ap…",
   "form": "bold",
   "level": 0,
   "line": 128
  },
  {
   "id": "C-343",
   "title": "当前断点（2026-10-02）：**已从C-342增加唯一叶页“BO-02方法依赖回位与独立候选晋级闸门”，阅读链更新为C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342 → C-3…",
   "form": "bold",
   "level": 0,
   "line": 130
  },
  {
   "id": "C-344",
   "title": "当前断点（2026-10-03）：**已从C-343增加唯一叶页“BO-02完整候选最小组成与单一承责边界”，阅读链更新为C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342 → C-3…",
   "form": "bold",
   "level": 0,
   "line": 132
  },
  {
   "id": "C-345",
   "title": "当前断点（2026-10-03）：**已从C-344增加唯一叶页“BO-02完整候选空白提交合同样”，阅读链更新为C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342 → C-343 →…",
   "form": "bold",
   "level": 0,
   "line": 134
  },
  {
   "id": "C-346",
   "title": "当前断点（2026-10-03）：**已从C-345增加唯一叶页“BO-02已登记Skill独立来源资产受限扫描”，阅读链更新为C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342 →…",
   "form": "bold",
   "level": 0,
   "line": 136
  },
  {
   "id": "C-347",
   "title": "当前断点（2026-10-03）：**已从C-346增加唯一叶页“BO-02独立来源资产建设需求空位”，阅读链更新为C-311 → C-331 → C-338 → C-339 → C-340 → C-341 → C-342 → C-343…",
   "form": "bold",
   "level": 0,
   "line": 138
  },
  {
   "id": "C-348",
   "title": "当前断点（2026-10-03）：**已回到C-339问题B，为既有`OM-01@C-300`建立“目标承接与取舍输入”专业候选入场合同。C-348是C-339的第二个直属专业合同子页、与C-340同级，阅读链为`C-311 → C-331…",
   "form": "bold",
   "level": 0,
   "line": 140
  },
  {
   "id": "C-349",
   "title": "当前断点（2026-10-03）：**已回到C-339问题B，为既有`BO-19@C-304`建立“候选渠道规则与运营适配证据”专业候选入场合同。C-349是C-339第三个直属专业合同子页，与C-340、C-348同级，阅读链为`C-31…",
   "form": "bold",
   "level": 0,
   "line": 142
  },
  {
   "id": "C-350",
   "title": "当前断点（2026-10-03）：**已回到C-339问题C，为既有`IC-04@C-308`建立“产品版本—市场—用途／宣称范围化准入条件”专业候选入场合同。C-350是C-339第四个直属专业合同子页，与C-340、C-348、C-34…",
   "form": "bold",
   "level": 0,
   "line": 144
  },
  {
   "id": "C-351",
   "title": "当前断点（2026-10-03）：**已回到C-339问题D，为既有`BO-35@C-307`建立“单一订单事实与对账边界”专业候选入场合同。C-351是C-339第五个直属专业合同子页，与C-340、C-348、C-349、C-350同级…",
   "form": "bold",
   "level": 0,
   "line": 146
  },
  {
   "id": "C-352",
   "title": "当前断点（2026-10-03）：**已回到C-339问题E，为既有`OM-02@C-300`建立“渠道经营责任范围、例外与未结义务”专业候选入场合同。C-352是C-339第六个直属、同级专业合同子页，与C-340、C-348、C-349…",
   "form": "bold",
   "level": 0,
   "line": 148
  },
  {
   "id": "C-353",
   "title": "当前断点（2026-10-03）：**已停止横向扩展新市场专业合同，回到`C-311 → C-312 → C-313 → C-353`，为`BO-11@C-303`第01空位“需求情景引用与不可改写守卫”打开单一候选自行提交闸。C-353是…",
   "form": "bold",
   "level": 0,
   "line": 150
  },
  {
   "id": "C-354",
   "title": "当前断点（2026-10-03）：**用户明确要求3+50数字分身必须写出名字和岗位名称。C-300新增直属“3+50数字分身名字与岗位总览”，以只读的AI组织变革当前角色目录和VIS-G6为权威来源：管理层为`天時｜首席执行官 CEO`、…",
   "form": "bold",
   "level": 0,
   "line": 152
  },
  {
   "id": "C-355",
   "title": "当前断点（2026-10-03）：**已沿`C-311 → C-312 → C-313 → C-353 → C-355`完成`BO-11@C-303`第01空位五类来源的受限只读扫描。每类来源分别用同一把六面尺核对：稳定身份与版本、同题自行…",
   "form": "bold",
   "level": 0,
   "line": 154
  },
  {
   "id": "C-356",
   "title": "当前断点（2026-10-03）：**已从C-355增加唯一叶页“BO-11第01空位独立来源资产建设需求”，阅读链更新为`C-311 → C-312 → C-313 → C-353 → C-355 → C-356`。本轮只登记`C356-…",
   "form": "bold",
   "level": 0,
   "line": 156
  },
  {
   "id": "C-357",
   "title": "当前断点（2026-10-03）：**已在C-312下建立与C-313同级的`BO-11@C-303`第02空位“补货缺口与候选数量／节奏形成”候选入场合同，阅读链固定为`C-311 → C-312 → C-357`。未来一个单一、可定位、…",
   "form": "bold",
   "level": 0,
   "line": 158
  },
  {
   "id": "C-358",
   "title": "当前断点（2026-10-03）：**已在C-312下建立与C-313、C-357同级的`BO-11@C-303`第03空位“多约束共同成立及资源占用核对”候选入场合同，阅读链固定为`C-311 → C-312 → C-358`；业务上读取…",
   "form": "bold",
   "level": 0,
   "line": 160
  },
  {
   "id": "C-359",
   "title": "当前断点（2026-10-03）：**已在C-312下建立与C-313、C-357、C-358同级的`BO-11@C-303`第04空位“影响、失效、重核与未知组织”候选入场合同，阅读链固定为`C-311 → C-312 → C-359`；…",
   "form": "bold",
   "level": 0,
   "line": 162
  },
  {
   "id": "C-360",
   "title": "当前断点（2026-10-04）：**已在C-312四张2×2空位合同卡之后建立直属、全宽的BO-11四空位装配边界审查，阅读链固定为`C-311 → C-312 → C-360`；它不是第05空位，也不是C-359的子流程。四格共同服务同…",
   "form": "bold",
   "level": 0,
   "line": 164
  },
  {
   "id": "C-361",
   "title": "当前断点（2026-10-04）：**已在C-357下打开`BO-11@C-303`第02空位“单一候选自行提交闸”，阅读链固定为`C-311 → C-312 → C-357 → C-361`。它只建立未来一个独立、可定位、可版本化候选的收…",
   "form": "bold",
   "level": 0,
   "line": 166
  },
  {
   "id": "C-362",
   "title": "当前断点（2026-10-04）：**已在C-361下完成`BO-11@C-303`第02空位独立来源线索的受限只读扫描，阅读链固定为`C-311 → C-312 → C-357 → C-361 → C-362`。本轮只核三条最相邻主要来源…",
   "form": "bold",
   "level": 0,
   "line": 168
  },
  {
   "id": "C-363",
   "title": "当前断点（2026-10-04）：**已在C-362下完成库存预测与供需匹配两条来源的最小身份／版本证据修复，阅读链固定为`C-311 → C-312 → C-357 → C-361 → C-362 → C-363`。本轮把“实际审阅正文快…",
   "form": "bold",
   "level": 0,
   "line": 170
  },
  {
   "id": "C-364",
   "title": "当前断点（2026-10-04）：**已在C-363下登记`C364-BO11-V02-NEED-01`这一第02空位独立来源资产建设需求空位，阅读链固定为`C-311 → C-312 → C-357 → C-361 → C-362 → C…",
   "form": "bold",
   "level": 0,
   "line": 172
  },
  {
   "id": "C-365",
   "title": "当前断点（2026-10-05）：**已从C-312回到C-358，在第03空位下建立“单一候选自行提交闸”，阅读链固定为`C-311 → C-312 → C-358 → C-365`；它是C-358唯一直属子页，现有唯一子页为C-366，…",
   "form": "bold",
   "level": 0,
   "line": 174
  },
  {
   "id": "C-366",
   "title": "当前断点（2026-10-05）：**已在C-365下完成`BO-11@C-303`第03空位5条独立来源线索的受限只读扫描，阅读链固定为`C-311 → C-312 → C-358 → C-365 → C-366`；C-366是C-365…",
   "form": "bold",
   "level": 0,
   "line": 176
  },
  {
   "id": "C-367",
   "title": "当前断点（2026-10-05）：**已沿`C-311 → C-312 → C-358 → C-365 → C-366 → C-367`，对`p2s-llm-sc-multiagent-consensus-replenishment`、`p…",
   "form": "bold",
   "level": 0,
   "line": 178
  },
  {
   "id": "C-368",
   "title": "当前断点（2026-10-06）：**已沿`C-311 → C-312 → C-358 → C-365 → C-366 → C-367 → C-368`，为`BO-11@C-303`第03空位登记一个范围化、开放且尚未被供给的“独立来源资产…",
   "form": "bold",
   "level": 0,
   "line": 180
  },
  {
   "id": "C-369",
   "title": "当前断点（2026-10-06）：**已回到`C-311 → C-312 → C-359 → C-369`，为`BO-11@C-303`第04空位打开一个“单一候选自行提交闸”；C-369是C-359唯一直属子页，C-370是C-369唯一…",
   "form": "bold",
   "level": 0,
   "line": 182
  },
  {
   "id": "C-370",
   "title": "当前断点（2026-10-06）：**已沿`C-311 → C-312 → C-359 → C-369 → C-370`，按C-369同一把收件尺完成第04空位第一次受限、只读、逐一独立来源核对；C-370是C-369唯一直属子页，C-37…",
   "form": "bold",
   "level": 0,
   "line": 184
  },
  {
   "id": "C-371",
   "title": "当前断点（2026-10-06）：**已沿`C-311 → C-312 → C-359 → C-369 → C-370 → C-371`，登记`C371-BO11-V04-NEED-01`这一第04空位独立来源资产建设需求空位，状态固定为`…",
   "form": "bold",
   "level": 0,
   "line": 186
  },
  {
   "id": "C-372",
   "title": "当前断点（2026-10-07）：**已回到`C-311 → C-312 → C-372`，把C-356、C-364、C-368、C-371四个开放建设需求地址放在同一层，正式确认`《BO-11四个开放建设需求独立验收与共享去重边界说明》`…",
   "form": "bold",
   "level": 0,
   "line": 188
  },
  {
   "id": "C-373",
   "title": "当前断点（2026-10-07）：**用户确认C-372后的下一轮建议，阅读链确定为`C-311 → C-312 → C-372 → C-373`。C-373是C-372唯一直属子页；C-374确认后，它只增加C-374这一个子页，不进入C…",
   "form": "bold",
   "level": 0,
   "line": 190
  },
  {
   "id": "C-374",
   "title": "当前断点（2026-10-07）：**用户确认按C-373对最相邻共享支撑线索做一次受限、只读、单一来源扫描。阅读链为`C-311 → C-312 → C-372 → C-373 → C-374`；C-374是C-373唯一直属子页和当前叶…",
   "form": "bold",
   "level": 0,
   "line": 192
  },
  {
   "id": "C-375",
   "title": "当前断点（2026-10-07）：**承接 C-374 的 FOUND-001 单一来源线索，本轮仅对 `<repo>/project/AgentTools/知识库/kb/agents/consultant-agent/runtime/lo…",
   "form": "bold",
   "level": 0,
   "line": 4729
  },
  {
   "id": "C-376",
   "title": "当前断点（2026-10-08）：**承接 C-375，但不把 `local_retrieval_api.py` 或 `public_result` 直接登记成候选。本轮只在 C-375 下增加一张唯一子卡，把“未来候选必须自己交卷”的最小…",
   "form": "bold",
   "level": 0,
   "line": 4733
  }
 ],
 "cards": [
  {
   "file": "sanbao-agenticos-vision.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-analysis-composition.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-assignee-competence.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-bounded-authorization.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-brand-positioning.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 12,
   "relation_count": 59
  },
  {
   "file": "sanbao-business-case-options.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-business-definitions.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 18,
   "relation_count": 113
  },
  {
   "file": "sanbao-capability-inventory.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-channel-publication.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-commercial-validation.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 18,
   "relation_count": 113
  },
  {
   "file": "sanbao-consumer-needs-insight.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-content-expression.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 11,
   "relation_count": 53
  },
  {
   "file": "sanbao-data-supply.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 17,
   "relation_count": 105
  },
  {
   "file": "sanbao-decision-evidence-use.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-demand-analysis.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-demand-response.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 18,
   "relation_count": 113
  },
  {
   "file": "sanbao-dependency-readiness.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-directed-professional-review.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-economic-assessment.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 14,
   "relation_count": 78
  },
  {
   "file": "sanbao-effect-evaluation.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 16,
   "relation_count": 101
  },
  {
   "file": "sanbao-enterprise-archetype.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-event-driven-progress.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-evidence-boundaries.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-execution-follow-through.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-experience-candidates.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-heartbeat-baseline.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-identity-boundaries.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-joint-options.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-knowledge-stewardship.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-launch-planning.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-matter-comparison.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-method-lifecycle.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-method-production.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-method-validation.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-native-agenticos-direction.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-network-matrix.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-new-product-responsibility.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-new-product-validation.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-ongoing-handoff.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 18,
   "relation_count": 113
  },
  {
   "file": "sanbao-operating-network-overview.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-origin.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-paid-media.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 15,
   "relation_count": 91
  },
  {
   "file": "sanbao-persistent-consumer-needs.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-perspectives.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-pricing-promotion.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 13,
   "relation_count": 69
  },
  {
   "file": "sanbao-product-design-mainline.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-product-market-access.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-product-panorama-resume.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-product-realization.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-product-verification.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-professional-method-candidate.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-professional-responsibility.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-resource-grounded-boundaries.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-semantic-boundaries.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-shared-business-case.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-square-network.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 10,
   "relation_count": 46
  },
  {
   "file": "sanbao-strategic-product-case.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-supply-delivery-readiness.html",
   "title": "三宝 · 经营网络画布",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-supply-options.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 19,
   "relation_count": 126
  },
  {
   "file": "sanbao-task-acceptance.html",
   "title": "三宝 · 正方形经营网络画布",
   "node_count": 20,
   "relation_count": 126
  },
  {
   "file": "sanbao-transformation-outcomes.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-value-creation-chains.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  },
  {
   "file": "sanbao-value-stream-mainline.html",
   "title": "三宝 · 企业 AI 组织变革",
   "node_count": 0,
   "relation_count": 0
  }
 ],
 "notes": [
  "部门来自 seat-registry 的 plane / source_group，不是新设组织。",
  "3 个 MGT 是决策权参照，不是部门、不是 agent session。",
  "relations 无 status 字段；候选/已确认在关系层不可表达，统一标 unspecified。",
  "53 席是 addressable seats，不是并发进程；production_authorized 全为 false。",
  "席位↔节点映射来自 configs/seat-node-crosswalk.json（依据 C-300..C-310），映射≠任命。"
 ]
};
