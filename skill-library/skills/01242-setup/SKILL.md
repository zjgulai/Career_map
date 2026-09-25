---
name: setup
description: Guides users through setting up the ClickHouse MCP server connection bundled with this plugin. Use when the user first installs the plugin or has trouble connecting to ClickHouse.
license: Apache-2.0
metadata:
  author: ClickHouse
---

# ClickHouse Plugin Setup

This plugin includes the [ClickHouse Cloud Remote MCP server](https://clickhouse.com/docs/use-cases/AI/MCP/remote_mcp) at `https://mcp.clickhouse.cloud/mcp`. It provides secure, read-only access to your ClickHouse Cloud clusters.

## Setup Steps

1. **Install the plugin**: If the plugin is not installed yet, add the marketplace and install the plugin:

   ```bash
   codex plugin marketplace add ClickHouse/clickhouse-codex-plugin
   codex plugin add clickhouse@clickhouse-codex-plugin
   ```

2. **Authenticate the MCP server**: Installing the plugin makes the ClickHouse MCP server available to Codex, but it does not create ClickHouse OAuth credentials. Run:

   ```bash
   codex mcp login clickhouse
   ```

   This opens the ClickHouse MCP OAuth flow. Sign in with a ClickHouse account that has access to the organizations, services, databases, and tables you want Codex to inspect. You must also have [MCP enabled on your ClickHouse service](https://clickhouse.com/docs/use-cases/AI/MCP/remote_mcp).

3. **Verify the MCP server is connected**: Check that the ClickHouse MCP server appears in your available MCP servers:

   ```bash
   codex mcp list
   ```

4. **Start a fresh Codex thread**: If you installed or authenticated while Codex Desktop was already open, start a new thread so the skills, MCP configuration, and credentials are loaded. If tools still do not appear, restart Codex Desktop.

5. **Test table access**: Ask:

   ```text
   Using ClickHouse, what tables do I have access to?
   ```

   or:

   ```text
   List my ClickHouse databases and tables.
   ```

## Troubleshooting

- **Server not appearing**: Run `codex mcp list`, then start a new Codex thread so the plugin's skills and MCP configuration are loaded. If it still does not appear, restart Codex Desktop.
- **Authentication errors**: Re-authenticate with `codex mcp login clickhouse`.
- **Connection timeouts**: Verify your network can reach `https://mcp.clickhouse.cloud`. The MCP server is a remote HTTP endpoint and requires internet access.

## Keeping queries fast

The MCP server runs queries against your live ClickHouse Cloud service. To keep interactions responsive and avoid long-running scans:

- Use `LIMIT` clauses to bound result sets.
- Prefer querying materialized views or pre-aggregated tables over raw scans of large tables.
- If a query is slow, break it into smaller, faster queries.

## What the MCP Server Provides

Once connected, the ClickHouse MCP server provides these tools:

### Organization & Service Management
- **get_organizations** — list all accessible ClickHouse Cloud organizations
- **get_organization_details** — details of a single organization
- **get_services_list** — list all services in an organization
- **get_service_details** — details of a single service

### Database Exploration
- **list_databases** — list all databases in a service
- **list_tables** — list tables in a database (supports `like`/`notLike` filtering)
- **run_select_query** — execute read-only SELECT queries

### ClickPipes
- **list_clickpipes** — list all ClickPipes for a service
- **get_clickpipe** — details of a specific ClickPipe

### Backups
- **list_service_backups** — list all backups for a service
- **get_service_backup_details** — details of a specific backup
- **get_service_backup_configuration** — backup schedule and retention settings

### Billing
- **get_organization_cost** — billing and usage cost data (max 31-day window)

All tools are read-only. See the [ClickHouse MCP docs](https://clickhouse.com/docs/use-cases/AI/MCP/remote_mcp) for details.

## Bundled Skills

Beyond MCP access, this plugin also bundles ClickHouse skills that activate automatically when relevant — no setup needed:

- **clickhouse-best-practices** — schema design, query optimization, and insert strategy rules
- **clickhouse-js-node-coding** — writing applications with the ClickHouse JavaScript (Node.js) client
- **clickhouse-js-node-troubleshooting** — troubleshooting the ClickHouse JavaScript (Node.js) client
