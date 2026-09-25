---
name: "prometheus-configuration"
title: "Prometheus 配置"
description: "配置 Prometheus 的指标抓取、记录规则与告警规则，并给出命名规范、采集间隔、高可用、联邦与长期存储要点。触发词：Prometheus 配置、prometheus-configuration、配置 Prometheus 的指标抓取、记录规则与告警规则，并给出命名规范、采集间隔、高可用、联邦与长期存储要点。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Prometheus 配置

Prometheus 安装、指标采集、抓取配置与记录规则的完整指南。

## 目的

配置 Prometheus，对基础设施与应用做全面的指标采集、告警与监控。

## 何时使用

- 搭建 Prometheus 监控
- 配置指标抓取
- 创建记录规则
- 设计告警规则
- 实现服务发现

## 详细模式与完整示例

详细的模式文档在 `references/details.md` 中。上方的导航层级不够用时，读那个文件。

## 最佳实践

1. 指标**命名保持一致**（prefix_name_unit）
2. **设置合适的抓取间隔**（通常 15-60s）
3. 对开销昂贵的查询**使用记录规则**
4. **实现高可用**（多个 Prometheus 实例）
5. 依据存储容量**配置保留期**
6. 用 **relabeling** 清理指标
7. **监控 Prometheus 自身**
8. 大规模部署**启用联邦**
9. 长期存储**使用 Thanos/Cortex**
10. **记录自定义指标**

## 故障排查

**检查抓取目标：**

```bash
curl http://localhost:9090/api/v1/targets
```

**检查配置：**

```bash
curl http://localhost:9090/api/v1/status/config
```

**测试查询：**

```bash
curl 'http://localhost:9090/api/v1/query?query=up'
```


## 相关技能

- `grafana-dashboards` —— 用于可视化
- `slo-implementation` —— 用于 SLO 监控
- `distributed-tracing` —— 用于请求链路追踪
