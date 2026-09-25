---
name: kb-rag-query
description: 检索本 Shopify 经营知识库(RAG+知识图谱)回答经营问题并给来源。当用户问"知识库里…/我们怎么做…/某节点怎么做"时使用。
---
# 知识库检索(横切,可运行)
在知识库根目录执行(首次先 `cd _rag/kb_index && python cli.py build`):
```bash
python _rag/kb_index/cli.py ask "你的问题"      # 语义召回 + 图谱关联
python _rag/kb_index/cli.py search "关键词" --source shopify官方 -k 5
```
把返回的片段(带 `来源/节点`)作为回答依据,并标注来源文件;无法回答时建议查看对应节点 README。
**关联**:[[_rag/检索方案_RAG+KG]]
