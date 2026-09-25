---
name: social-network-mapper
description: >-
  Map social relationships between people using Twitter/X
  interactions (mentions, retweets, replies), and optional GitHub collaboration.
  Build and analyze social graphs, detect communities, and summarize clusters.
  Use when the user asks for "谁和谁互动", "social graph", "Twitter 关系",
  or when org-structure-research invokes it for relationship analysis.
triggers:
  - social network
  - 互动
  - who interacts with whom
  - Twitter relationship
  - relationship map
  - cluster
  - 社交关系
region_scope: INTL
---

# Social Network Mapper

Build relationship graphs from Twitter/X (and optionally other platforms), compute interaction edges, run community detection, and produce summaries and visualizations.

## When to Use This Skill

- User wants to understand **who interacts with whom** among a set of people (e.g. employees or executives).
- User asks for "互动账号关系", "social graph", "relationship map", or "clusters".
- **org-structure-research** calls this skill to enrich an org report with social relationship analysis.

## Prerequisites

- **Seed list**: Names and, when possible, **Twitter/X handles** (and optionally GitHub usernames) for the people to map.
- If handles are unknown: use **people-search** or Twitter **search_user** by name/company to resolve handles before running the mapper.

## Tools to Use

Invoke Twitter tools via **`accio-mcp-cli`** from bash: `accio-mcp-cli search twitter` to discover names and schemas, then `accio-mcp-cli call <tool-name> ...` (see **accio-mcp-cli** / **mcp-tools**).

| Task | Tool / Skill | Notes |
|------|--------------|--------|
| Twitter user info | `get_user_by_screen_name`, `get_user_profile` | Resolve handle → user info |
| Twitter search users | `search_twitter` by keyword | Resolve name → handle |
| Tweet search / interactions | `search_twitter` (query: "from:A @B" or "@A @B") | Find mentions, replies |
| Graph build & analysis | **networkx** (Python) | Build graph, centrality, communities |
| Visualization | networkx + matplotlib, or excalidraw | Export image or diagram |

## Workflow

### Step 1: Resolve Handles (If Needed)

If only names are given:

1. For each person, call Twitter **search_user** via `accio-mcp-cli call ...` with a keyword like "[Full Name]" or "[Name] [Company]".
2. Match result to seed by name and (if available) bio/company. Prefer verified or high-follower accounts when ambiguous.
3. Build **seed list with handles**: `[{ name, twitter_handle, optional_github }]`.

### Step 2: Build Interaction Edges

For each pair (A, B) in the seed list:

1. Use `search_twitter` with query like `from:handleA @handleB` to find tweets where A mentions B.
2. Use `search_twitter` with query like `from:handleB @handleA` to find tweets where B mentions A.
3. Count mentions/replies in both directions; combine into total interaction count.

**Edge weight convention:**

- Interaction count 1–5: weight 1 (some interaction)
- Interaction count 6+: weight 2 (frequent interaction)

Document in the report which edge types and weights were used.

### Step 3: Build Graph with NetworkX

1. **Nodes**: All seed handles.
2. **Edges**: From Step 2 (interaction edges with weights).
3. Use **undirected** graph for community detection; or **directed** if interaction direction matters.
4. Store node attributes: `name`, `handle`, `company` (if known).

```python
import networkx as nx
G = nx.Graph()  # or nx.DiGraph()
# Add nodes with attributes
for p in seed_list:
    G.add_node(p["twitter_handle"], name=p["name"], company=p.get("company"))
# Add edges with weight
for (u, v, w) in edge_list:
    G.add_edge(u, v, weight=w)
```

### Step 4: Analyze Graph

- **Connected components**: `list(nx.connected_components(G))` — separate groups.
- **Community detection**: e.g. `community.greedy_modularity_communities(G)` — clusters within the graph.
- **Centrality** (who is most "central"):
  - `nx.degree_centrality(G)`
  - `nx.betweenness_centrality(G)`
  - `nx.pagerank(G)` if directed
- **Summary stats**: number of nodes, edges, density, number of components, number of communities.

### Step 5: Interpret and Name Clusters

For each community (or large component):

1. List members (handle + name).
2. If available, use job titles/company from seed list to label the cluster (e.g. "Engineering leads", "Product & growth").
3. One-sentence summary: "This cluster contains N people; most are in [department/role]."

### Step 6: Output

1. **Text summary**:
   - Seed list and how handles were resolved.
   - Edge type and weight used.
   - Graph stats (nodes, edges, density, components, communities).
   - Centrality: top 5–10 by degree/betweenness.
   - Per-cluster description (members + interpretation).
2. **Visualization** (optional):
   - **networkx + matplotlib**: `nx.draw(G, with_labels=True, node_size=..., font_size=...)`; save as PNG.
   - Or export node/edge list for **excalidraw-diagram-generator** ("relationship diagram: nodes A, B, C...; edges A–B, B–C...").
3. **Structured data** (optional): Export graph as JSON (node-link format) or CSV (edges) for reuse.

## Edge Weight and Interpretation

| Edge type | Suggested weight | Interpretation |
|-----------|------------------|----------------|
| Mention/reply (1–5) | 1 | Some interaction |
| Mention/reply (6+) | 2 | Frequent interaction |

Use weights in community detection (e.g. pass `weight` to the algorithm if supported).

## Rate Limits and Cost

- Twitter search API: document limits; batch requests; avoid redundant fetches.
- For large seed lists (e.g. >20), consider limiting the number of pair-wise interaction searches (total pairs = N*(N-1)/2).
- State in the report: "Graph built from N seed users; interaction data sourced via tweet search."

## Optional: GitHub Collaboration

If GitHub usernames are in the seed list:

1. Use available tools (e.g. Apify GitHub scrapers, or GitHub API if integrated) to get: repos in common, co-commits, org membership.
2. Add edges: "same_org", "co_committed_repo", etc., with separate weights.
3. Build a **multigraph** or **separate layer** (Twitter vs. GitHub) and report both; or merge with a combined weight scheme.

## Output Checklist

- [ ] Seed list with resolved Twitter (and optional GitHub) handles
- [ ] Description of edge types and weights
- [ ] Graph statistics (nodes, edges, density, components, communities)
- [ ] Top central nodes (degree / betweenness / PageRank)
- [ ] Per-cluster list and short interpretation
- [ ] Optional: visualization (PNG or diagram file)
- [ ] Optional: exported graph (JSON/CSV)

## Related Skills

- **org-structure-research** — Invokes this skill for the "social relationship" phase.
- **twitter-command-center-search-post** — Twitter/X API usage (user info, search).
- **networkx** — Graph construction, centrality, community detection, visualization.
- **excalidraw-diagram-generator** — Relationship diagram from node/edge list.
- **people-search** — Resolve names to LinkedIn/Twitter when handles are unknown.
