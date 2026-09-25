window.B01_TRIAL_02_DATA = {
  "trialId": "B01-TRIAL-02",
  "sampleType": "人工标注的合成受控复测样本",
  "labelingBoundary": "标注由本轮测试设计者定义，尚非独立盲评；所有数据均为合成文本和合成量级。",
  "question": "在不触碰真实消费者或经营数据的前提下，D01 与 D02 的候选修复能否正确保留局部语义、问题/属性边界和未覆盖主题？",
  "scope": "本轮只检验候选适配器对 60 条评论和 48 条购买前搜索表达的合成标注是否一致。它不测模型泛化、真实数据接入、样本代表性、市场规模或业务价值。",
  "baseline": {
    "trial_id": "B01-TRIAL-01",
    "d01_exact": "14/24（58.3%）",
    "d02_exact": "15/18（83.3%）",
    "meaning": "原始只读实现的失败基线；本轮不修改该实现。"
  },
  "decision": {
    "status": "可进入独立盲测（不进入真实样本）",
    "reason": "候选适配器在同一设计者人工标注的合成集上达到了语义门槛；仍存在同源设计与实现的过拟合风险。"
  },
  "contractChecks": {
    "passed": 5,
    "total": 5,
    "label": "交付契约通过",
    "meaning": "记录可回溯、未知被保留、规则边界没有被跳过。"
  },
  "skills": [
    {
      "code": "D01",
      "name": "评论中的需求证据拆解",
      "input": "60 条人工标注的合成评论",
      "output": "方面、情感、意见词三元组与未映射记录",
      "quality": {
        "exact_match_count": 60,
        "total": 60,
        "exact_match_rate": 1.0,
        "quality_gate": "通过：仅可进入独立盲测",
        "records": [
          {
            "record_id": "R001",
            "expected": [
              [
                "噪音",
                "negative"
              ]
            ],
            "actual": [
              [
                "噪音",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R002",
            "expected": [
              [
                "噪音",
                "positive"
              ],
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "actual": [
              [
                "噪音",
                "positive"
              ],
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R003",
            "expected": [
              [
                "充电",
                "positive"
              ],
              [
                "吸力",
                "negative"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ],
              [
                "吸力",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R004",
            "expected": [
              [
                "充电",
                "positive"
              ],
              [
                "吸力",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ],
              [
                "吸力",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R005",
            "expected": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "actual": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R006",
            "expected": [
              [
                "尺寸重量",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "actual": [
              [
                "尺寸重量",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R007",
            "expected": [
              [
                "充电",
                "negative"
              ]
            ],
            "actual": [
              [
                "充电",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R008",
            "expected": [
              [
                "充电",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R009",
            "expected": [
              [
                "易用性",
                "negative"
              ]
            ],
            "actual": [
              [
                "易用性",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R010",
            "expected": [
              [
                "易用性",
                "positive"
              ]
            ],
            "actual": [
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R011",
            "expected": [
              [
                "价格",
                "negative"
              ],
              [
                "噪音",
                "negative"
              ]
            ],
            "actual": [
              [
                "价格",
                "negative"
              ],
              [
                "噪音",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R012",
            "expected": [
              [
                "价格",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "actual": [
              [
                "价格",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R013",
            "expected": [
              [
                "客服",
                "negative"
              ]
            ],
            "actual": [
              [
                "客服",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R014",
            "expected": [
              [
                "客服",
                "positive"
              ]
            ],
            "actual": [
              [
                "客服",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R015",
            "expected": [
              [
                "物流",
                "negative"
              ]
            ],
            "actual": [
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R016",
            "expected": [
              [
                "物流",
                "positive"
              ]
            ],
            "actual": [
              [
                "物流",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R017",
            "expected": [],
            "actual": [],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R018",
            "expected": [],
            "actual": [],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R019",
            "expected": [
              [
                "吸力",
                "negative"
              ],
              [
                "噪音",
                "positive"
              ]
            ],
            "actual": [
              [
                "吸力",
                "negative"
              ],
              [
                "噪音",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R020",
            "expected": [
              [
                "尺寸重量",
                "positive"
              ],
              [
                "舒适度",
                "negative"
              ]
            ],
            "actual": [
              [
                "尺寸重量",
                "positive"
              ],
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R021",
            "expected": [],
            "actual": [],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R022",
            "expected": [],
            "actual": [],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R023",
            "expected": [
              [
                "吸力",
                "negative"
              ],
              [
                "噪音",
                "negative"
              ]
            ],
            "actual": [
              [
                "吸力",
                "negative"
              ],
              [
                "噪音",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R024",
            "expected": [
              [
                "吸力",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "actual": [
              [
                "吸力",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R025",
            "expected": [
              [
                "吸力",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ]
            ],
            "actual": [
              [
                "吸力",
                "positive"
              ],
              [
                "噪音",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R026",
            "expected": [
              [
                "噪音",
                "negative"
              ]
            ],
            "actual": [
              [
                "噪音",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R027",
            "expected": [
              [
                "充电",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R028",
            "expected": [
              [
                "充电",
                "negative"
              ]
            ],
            "actual": [
              [
                "充电",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R029",
            "expected": [
              [
                "充电",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R030",
            "expected": [
              [
                "尺寸重量",
                "negative"
              ]
            ],
            "actual": [
              [
                "尺寸重量",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R031",
            "expected": [
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "actual": [
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R032",
            "expected": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "actual": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R033",
            "expected": [
              [
                "舒适度",
                "positive"
              ]
            ],
            "actual": [
              [
                "舒适度",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R034",
            "expected": [
              [
                "易用性",
                "negative"
              ]
            ],
            "actual": [
              [
                "易用性",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R035",
            "expected": [
              [
                "易用性",
                "positive"
              ]
            ],
            "actual": [
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R036",
            "expected": [
              [
                "客服",
                "negative"
              ]
            ],
            "actual": [
              [
                "客服",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R037",
            "expected": [
              [
                "客服",
                "positive"
              ]
            ],
            "actual": [
              [
                "客服",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R038",
            "expected": [
              [
                "物流",
                "negative"
              ]
            ],
            "actual": [
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R039",
            "expected": [
              [
                "物流",
                "positive"
              ]
            ],
            "actual": [
              [
                "物流",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R040",
            "expected": [
              [
                "价格",
                "negative"
              ]
            ],
            "actual": [
              [
                "价格",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R041",
            "expected": [
              [
                "价格",
                "positive"
              ]
            ],
            "actual": [
              [
                "价格",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R042",
            "expected": [
              [
                "噪音",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "actual": [
              [
                "噪音",
                "positive"
              ],
              [
                "舒适度",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R043",
            "expected": [
              [
                "噪音",
                "negative"
              ],
              [
                "舒适度",
                "negative"
              ]
            ],
            "actual": [
              [
                "噪音",
                "negative"
              ],
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R044",
            "expected": [
              [
                "充电",
                "negative"
              ],
              [
                "吸力",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "negative"
              ],
              [
                "吸力",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R045",
            "expected": [
              [
                "吸力",
                "negative"
              ],
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "actual": [
              [
                "吸力",
                "negative"
              ],
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R046",
            "expected": [
              [
                "易用性",
                "positive"
              ]
            ],
            "actual": [
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R047",
            "expected": [
              [
                "易用性",
                "negative"
              ]
            ],
            "actual": [
              [
                "易用性",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R048",
            "expected": [
              [
                "价格",
                "positive"
              ],
              [
                "物流",
                "negative"
              ]
            ],
            "actual": [
              [
                "价格",
                "positive"
              ],
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R049",
            "expected": [
              [
                "价格",
                "negative"
              ],
              [
                "客服",
                "positive"
              ]
            ],
            "actual": [
              [
                "价格",
                "negative"
              ],
              [
                "客服",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R050",
            "expected": [
              [
                "噪音",
                "positive"
              ]
            ],
            "actual": [
              [
                "噪音",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R051",
            "expected": [
              [
                "噪音",
                "negative"
              ]
            ],
            "actual": [
              [
                "噪音",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R052",
            "expected": [
              [
                "舒适度",
                "positive"
              ]
            ],
            "actual": [
              [
                "舒适度",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R053",
            "expected": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "actual": [
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R054",
            "expected": [
              [
                "充电",
                "negative"
              ]
            ],
            "actual": [
              [
                "充电",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R055",
            "expected": [
              [
                "充电",
                "positive"
              ]
            ],
            "actual": [
              [
                "充电",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R056",
            "expected": [
              [
                "物流",
                "negative"
              ]
            ],
            "actual": [
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R057",
            "expected": [
              [
                "物流",
                "positive"
              ]
            ],
            "actual": [
              [
                "物流",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R058",
            "expected": [
              [
                "客服",
                "positive"
              ],
              [
                "易用性",
                "negative"
              ]
            ],
            "actual": [
              [
                "客服",
                "positive"
              ],
              [
                "易用性",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R059",
            "expected": [
              [
                "价格",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "actual": [
              [
                "价格",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          },
          {
            "record_id": "R060",
            "expected": [],
            "actual": [],
            "missing": [],
            "unexpected": [],
            "exact_match": true
          }
        ]
      },
      "baseline": "14/24（58.3%）",
      "changes": [
        "情感只在同一分句、同一方面的邻近窗口生效。",
        "紧邻否定只翻转对应意见词，不反转整句。",
        "移除 power、fast、slow 等高歧义的方面路由词，词典外主题仍保留未知。"
      ],
      "adversarialSamples": [
        {
          "id": "R020",
          "input": "The compact size is great, but the flange fit is not comfortable for a long session.",
          "expected": "尺寸重量 / positive；舒适度 / negative"
        },
        {
          "id": "R025",
          "input": "The pump is not loud, and the suction is strong.",
          "expected": "吸力 / positive；噪音 / positive"
        },
        {
          "id": "R058",
          "input": "The instructions are complicated, although customer support is responsive.",
          "expected": "易用性 / negative；客服 / positive"
        },
        {
          "id": "R060",
          "input": "It leaked when I bent over, and I need session history in the app.",
          "expected": "未映射"
        }
      ],
      "sourceHash": "6acf500aa971"
    },
    {
      "code": "D02",
      "name": "购买前需求信号归集",
      "input": "48 条人工标注的合成搜索表达",
      "output": "意图、情感、规则命中与可回溯量级",
      "quality": {
        "exact_match_count": 48,
        "total": 48,
        "exact_match_rate": 1.0,
        "rule_match_count": 48,
        "rule_match_rate": 1.0,
        "quality_gate": "通过：仅可进入独立盲测",
        "records": [
          {
            "record_id": "Q001",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q002",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q003",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q004",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q005",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q006",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q007",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q008",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q009",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q010",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q011",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q012",
            "expected": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "actual": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q013",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q014",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q015",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q016",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q017",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q018",
            "expected": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q019",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q020",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q021",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q022",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q023",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q024",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q025",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q026",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q027",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q028",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q029",
            "expected": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "actual": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q030",
            "expected": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "actual": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q031",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q032",
            "expected": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q033",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q034",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q035",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q036",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q037",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q038",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q039",
            "expected": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "actual": {
              "intent": "comparison",
              "sentiment": "positive_expectation"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q040",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q041",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q042",
            "expected": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q043",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q044",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q045",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q046",
            "expected": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "actual": {
              "intent": "problem_solving",
              "sentiment": "negative_pain"
            },
            "expected_rule_hit": true,
            "actual_rule_hit": true,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q047",
            "expected": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          },
          {
            "record_id": "Q048",
            "expected": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "expected_rule_hit": false,
            "actual_rule_hit": false,
            "exact_match": true,
            "rule_match": true
          }
        ]
      },
      "baseline": "15/18（83.3%）",
      "changes": [
        "先判断比较与问题表达，再判断明确功能任务和属性词。",
        "office/work 只作为场景词，不能单独把 quiet/silent 表达改写为功能意图。",
        "问题型机会规则仍要求问题意图、负面表达和达到量级门槛。"
      ],
      "adversarialSamples": [
        {
          "id": "Q008",
          "input": "silent breast pump work office",
          "expected": "attribute / neutral"
        },
        {
          "id": "Q034",
          "input": "hands free breast pump office quiet",
          "expected": "attribute / neutral"
        },
        {
          "id": "Q039",
          "input": "best quiet wearable breast pump",
          "expected": "comparison / positive_expectation"
        },
        {
          "id": "Q040",
          "input": "wearable breast pump cleaning instructions",
          "expected": "functional / neutral"
        }
      ],
      "sourceHash": "2ff3be670626"
    }
  ],
  "crossSource": [
    {
      "topic": "防漏与密封",
      "review_positive": 0,
      "review_negative": 0,
      "review_neutral": 0,
      "search_records": 9,
      "search_rule_hits": 9,
      "controlled_reading": "搜索侧保留问题型表达，评论侧仍保留为未映射主题；这说明候选适配器没有伪造评论方面覆盖，不代表真实防漏问题成立。"
    },
    {
      "topic": "吸力持续性",
      "review_positive": 12,
      "review_negative": 6,
      "review_neutral": 0,
      "search_records": 5,
      "search_rule_hits": 4,
      "controlled_reading": "两侧均为合成受控记录，只用于检查分类和未知保留；不得将记录数量、正负标签或规则命中解释为真实需求强度。"
    },
    {
      "topic": "安静使用",
      "review_positive": 8,
      "review_negative": 7,
      "review_neutral": 0,
      "search_records": 9,
      "search_rule_hits": 2,
      "controlled_reading": "两侧均为合成受控记录，只用于检查分类和未知保留；不得将记录数量、正负标签或规则命中解释为真实需求强度。"
    },
    {
      "topic": "佩戴舒适度",
      "review_positive": 5,
      "review_negative": 4,
      "review_neutral": 0,
      "search_records": 5,
      "search_rule_hits": 3,
      "controlled_reading": "两侧均为合成受控记录，只用于检查分类和未知保留；不得将记录数量、正负标签或规则命中解释为真实需求强度。"
    },
    {
      "topic": "续航与充电",
      "review_positive": 4,
      "review_negative": 3,
      "review_neutral": 0,
      "search_records": 4,
      "search_rule_hits": 1,
      "controlled_reading": "两侧均为合成受控记录，只用于检查分类和未知保留；不得将记录数量、正负标签或规则命中解释为真实需求强度。"
    }
  ],
  "nextSteps": [
    "由未参与本轮适配器编写与样本标注的人，重新定义标签并准备独立盲测集。",
    "在独立集上分别检查 D01 的方面/情感精确匹配，以及 D02 的意图/情感和规则边界。",
    "独立盲测通过后，再定义可合法使用的脱敏真实样本的数据合同、抽样范围和质量闸口；本轮不接入真实数据。",
    "只有真实且已授权的多源证据完整保留来源、范围、支持、反证和未知后，才可按 C-018 讨论需求证据；不得跳到产品或投入决定。"
  ],
  "nonConclusions": [
    "不代表真实消费者偏好、市场规模、品牌、品类问题或需求优先级。",
    "不构成产品定义、功能改版、投入优先级、投放、采购、发布、岗位任命或业务授权。",
    "不证明候选适配器在独立盲测、真实语言、真实数据质量或生产运行中可靠。"
  ]
};
