window.B01_TRIAL_DATA = {
  "trialId": "B01-TRIAL-01",
  "sampleType": "合成受控样本",
  "question": "在一个具体品类里，哪些使用阶段问题能被评论与购买前搜索语言分别定位；两种证据在哪些地方支持、相互牵制或仍然未知？",
  "scope": "本样本只检验 D01 与 D02 能否把输入记录、输出记录、支持证据、反证和未知保留下来。所有文字、ID、日期、评分与量级均为合成测试数据，不来自 Momcozy、任何竞品、用户评论、搜索平台或真实经营事项。",
  "contractChecks": {
    "passed": 4,
    "total": 4,
    "label": "交付契约通过",
    "meaning": "每条输出可回到输入，未知和非问题型记录没有被静默吞掉。"
  },
  "skills": [
    {
      "code": "D01",
      "name": "评论中的需求证据拆解",
      "input": "24 条合成评论",
      "output": "方面、情感、意见词三元组与未映射记录",
      "quality": {
        "exact_match_count": 14,
        "total": 24,
        "exact_match_rate": 0.583,
        "quality_gate": "未通过，不能进入真实样本判断",
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
                "positive"
              ]
            ],
            "missing": [
              [
                "噪音",
                "negative"
              ]
            ],
            "unexpected": [
              [
                "噪音",
                "positive"
              ]
            ],
            "exact_match": false
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
              ],
              [
                "客服",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [
              [
                "客服",
                "positive"
              ],
              [
                "易用性",
                "positive"
              ]
            ],
            "exact_match": false
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
              ],
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [
              [
                "物流",
                "negative"
              ]
            ],
            "exact_match": false
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
              ],
              [
                "物流",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [
              [
                "物流",
                "positive"
              ]
            ],
            "exact_match": false
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
              ],
              [
                "物流",
                "negative"
              ]
            ],
            "missing": [],
            "unexpected": [
              [
                "物流",
                "negative"
              ]
            ],
            "exact_match": false
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
              ],
              [
                "物流",
                "positive"
              ]
            ],
            "missing": [],
            "unexpected": [
              [
                "物流",
                "positive"
              ]
            ],
            "exact_match": false
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
                "neutral"
              ],
              [
                "噪音",
                "neutral"
              ]
            ],
            "missing": [
              [
                "吸力",
                "negative"
              ],
              [
                "噪音",
                "positive"
              ]
            ],
            "unexpected": [
              [
                "吸力",
                "neutral"
              ],
              [
                "噪音",
                "neutral"
              ]
            ],
            "exact_match": false
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
                "negative"
              ],
              [
                "舒适度",
                "negative"
              ]
            ],
            "missing": [
              [
                "尺寸重量",
                "positive"
              ]
            ],
            "unexpected": [
              [
                "尺寸重量",
                "negative"
              ]
            ],
            "exact_match": false
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
                "充电",
                "negative"
              ],
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
            "unexpected": [
              [
                "充电",
                "negative"
              ]
            ],
            "exact_match": false
          },
          {
            "record_id": "R024",
            "expected": [
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
                "充电",
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
            "unexpected": [
              [
                "充电",
                "positive"
              ]
            ],
            "exact_match": false
          }
        ]
      },
      "unmapped": [
        "R017",
        "R018",
        "R021",
        "R022"
      ],
      "risk": "全句词典会把局部词义扩散到无关方面，正负词共现时也会失真。",
      "sourceHash": "cb724d3de888",
      "failures": [
        {
          "recordId": "R001",
          "input": "The noise is loud enough that I would not use it beside a sleeping baby.",
          "expected": [
            [
              "噪音",
              "negative"
            ]
          ],
          "actual": [
            [
              "噪音",
              "positive"
            ]
          ],
          "missing": [
            [
              "噪音",
              "negative"
            ]
          ],
          "unexpected": [
            [
              "噪音",
              "positive"
            ]
          ]
        },
        {
          "recordId": "R004",
          "input": "Strong suction helped me finish quickly and the charging cable is easy to use.",
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
            ],
            [
              "客服",
              "positive"
            ],
            [
              "易用性",
              "positive"
            ]
          ],
          "missing": [],
          "unexpected": [
            [
              "客服",
              "positive"
            ],
            [
              "易用性",
              "positive"
            ]
          ]
        },
        {
          "recordId": "R007",
          "input": "Battery life is poor and charging is slow during a busy workday.",
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
            ],
            [
              "物流",
              "negative"
            ]
          ],
          "missing": [],
          "unexpected": [
            [
              "物流",
              "negative"
            ]
          ]
        },
        {
          "recordId": "R008",
          "input": "Battery life is great. It lasts a full workday and charging is fast.",
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
            ],
            [
              "物流",
              "positive"
            ]
          ],
          "missing": [],
          "unexpected": [
            [
              "物流",
              "positive"
            ]
          ]
        },
        {
          "recordId": "R013",
          "input": "Customer service was slow to respond when I asked for help.",
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
            ],
            [
              "物流",
              "negative"
            ]
          ],
          "missing": [],
          "unexpected": [
            [
              "物流",
              "negative"
            ]
          ]
        },
        {
          "recordId": "R014",
          "input": "Customer support was fast and helpful when I needed a replacement part.",
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
            ],
            [
              "物流",
              "positive"
            ]
          ],
          "missing": [],
          "unexpected": [
            [
              "物流",
              "positive"
            ]
          ]
        },
        {
          "recordId": "R019",
          "input": "It is quiet but the suction is weak, so my experience is mixed.",
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
              "neutral"
            ],
            [
              "噪音",
              "neutral"
            ]
          ],
          "missing": [
            [
              "吸力",
              "negative"
            ],
            [
              "噪音",
              "positive"
            ]
          ],
          "unexpected": [
            [
              "吸力",
              "neutral"
            ],
            [
              "噪音",
              "neutral"
            ]
          ]
        },
        {
          "recordId": "R020",
          "input": "The compact size is great, but the flange fit is not comfortable for a long session.",
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
              "negative"
            ],
            [
              "舒适度",
              "negative"
            ]
          ],
          "missing": [
            [
              "尺寸重量",
              "positive"
            ]
          ],
          "unexpected": [
            [
              "尺寸重量",
              "negative"
            ]
          ]
        },
        {
          "recordId": "R023",
          "input": "The sound is noisy and the suction power is weak. I regret the purchase.",
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
              "充电",
              "negative"
            ],
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
          "unexpected": [
            [
              "充电",
              "negative"
            ]
          ]
        },
        {
          "recordId": "R024",
          "input": "Quiet, powerful, comfortable and easy. This made commuting much easier.",
          "expected": [
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
              "充电",
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
          "unexpected": [
            [
              "充电",
              "positive"
            ]
          ]
        }
      ]
    },
    {
      "code": "D02",
      "name": "购买前需求信号归集",
      "input": "18 条合成搜索信号，覆盖 3 个合成月份",
      "output": "意图、情感、规则命中与可回溯量级",
      "quality": {
        "exact_match_count": 15,
        "total": 18,
        "exact_match_rate": 0.833,
        "quality_gate": "未通过，不能进入真实样本判断",
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
            "exact_match": true
          },
          {
            "record_id": "Q002",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "exact_match": false
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
          },
          {
            "record_id": "Q008",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "functional",
              "sentiment": "neutral"
            },
            "exact_match": false
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
          },
          {
            "record_id": "Q014",
            "expected": {
              "intent": "attribute",
              "sentiment": "neutral"
            },
            "actual": {
              "intent": "navigational",
              "sentiment": "neutral"
            },
            "exact_match": false
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
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
            "exact_match": true
          }
        ]
      },
      "ruleHits": 9,
      "risk": "office/work 等场景词会被规则顺序误归为功能型或导航型。",
      "sourceHash": "922d6ecec721",
      "failures": [
        {
          "recordId": "Q002",
          "input": "quiet breast pump office",
          "expected": {
            "intent": "attribute",
            "sentiment": "neutral"
          },
          "actual": {
            "intent": "navigational",
            "sentiment": "neutral"
          }
        },
        {
          "recordId": "Q008",
          "input": "silent breast pump work office",
          "expected": {
            "intent": "attribute",
            "sentiment": "neutral"
          },
          "actual": {
            "intent": "functional",
            "sentiment": "neutral"
          }
        },
        {
          "recordId": "Q014",
          "input": "quiet breast pump office",
          "expected": {
            "intent": "attribute",
            "sentiment": "neutral"
          },
          "actual": {
            "intent": "navigational",
            "sentiment": "neutral"
          }
        }
      ]
    }
  ],
  "crossSource": [
    {
      "topic": "防漏与密封",
      "review_positive": 0,
      "review_negative": 0,
      "review_neutral": 0,
      "search_records": 6,
      "search_rule_hits": 6,
      "controlled_reading": "搜索侧命中问题型规则；评论侧未映射，暴露当前 D01 词典的覆盖缺口。"
    },
    {
      "topic": "吸力持续性",
      "review_positive": 5,
      "review_negative": 4,
      "review_neutral": 2,
      "search_records": 3,
      "search_rule_hits": 3,
      "controlled_reading": "两侧都有合成输入记录；D01 规则输出有正负并存，但语义闸口未通过，只能保留为待修复测试主题。"
    },
    {
      "topic": "安静使用",
      "review_positive": 10,
      "review_negative": 2,
      "review_neutral": 0,
      "search_records": 3,
      "search_rule_hits": 0,
      "controlled_reading": "D01 规则输出有正负并存，搜索侧主要是属性/场景表达；语义闸口未通过，不能合并成单向痛点。"
    },
    {
      "topic": "佩戴舒适度",
      "review_positive": 2,
      "review_negative": 3,
      "review_neutral": 0,
      "search_records": 2,
      "search_rule_hits": 0,
      "controlled_reading": "D01 规则输出有正负记录，搜索侧只是属性表达；语义闸口未通过，不能把它们当作证据。"
    },
    {
      "topic": "续航与充电",
      "review_positive": 2,
      "review_negative": 2,
      "review_neutral": 0,
      "search_records": 1,
      "search_rule_hits": 0,
      "controlled_reading": "D01 规则输出有正负记录，搜索侧低于试跑阈值；语义闸口未通过，不输出优先级判断。"
    }
  ],
  "nextSteps": [
    "先改进词典、触发窗口与意图分类顺序，再用更大的人工标注验证集复测语义质量。",
    "补齐防漏、会话记录等当前未映射方面，并约定每一方面的可接受误差。",
    "达到预设质量阈值后，才可接入已授权、可说明范围的真实评论与搜索数据。",
    "真实数据中的支持、反证和未知应进入 C-018；不得直接替代产品定义、投入或业务动作。"
  ],
  "nonConclusions": [
    "不代表真实消费者偏好、市场规模、品牌或品类问题。",
    "不构成产品定义、功能改版、投入优先级、投放、采购、发布或岗位任命。",
    "不检验模型准确率、样本代表性、语言覆盖度或真实搜索数据接入质量。"
  ]
};
