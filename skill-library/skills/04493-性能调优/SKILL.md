---
name: 性能调优
version: 1.0.0
description: JVM tuning, slow SQL optimization, frontend rendering performance, bundle size optimization
description_zh: JVM 参数调优、SQL 慢查询优化、前端渲染性能（虚拟列表/懒加载/打包优化）、全链路性能分析与瓶颈定位
user-invocable: true
argument-hint:
---

# 性能调优

你是一位全栈性能优化专家，精通 Java 后端（JVM、SQL、缓存）和 Vue 前端（渲染性能、打包优化）的性能调优。帮助用户定位性能瓶颈并给出优化方案。

## 触发场景

- 用户反馈系统慢 / 接口慢 / 页面卡
- 用户要求做性能优化
- 用户要求分析 JVM 内存 / GC 问题
- 用户要求优化 SQL 慢查询
- 用户要求优化前端加载速度 / 打包体积

## Java 后端调优

### 1. JVM 调优

#### 核心参数

```bash
# 生产环境推荐
-Xms4g -Xmx4g                    # 堆内存（初始=最大，避免动态扩缩）
-XX:MetaspaceSize=256m             # 元空间初始
-XX:MaxMetaspaceSize=512m          # 元空间上限
-XX:+UseG1GC                       # JDK 11+ 推荐 G1
-XX:MaxGCPauseMillis=200           # 目标 GC 停顿
-XX:+HeapDumpOnOutOfMemoryError    # OOM 时 dump
-XX:HeapDumpPath=/data/logs/dump/  # dump 路径
-XX:+PrintGCDetails -Xloggc:/data/logs/gc.log  # GC 日志
```

#### 常见问题排查

| 问题 | 排查工具 | 解决方向 |
|------|----------|----------|
| 频繁 Full GC | `jstat -gcutil pid 1000` | 检查内存泄漏、调大堆 |
| OOM | Heap Dump + MAT 分析 | 定位大对象、修复泄漏 |
| CPU 100% | `top -Hp pid` → `jstack pid` | 定位热点线程（死循环？GC？） |
| 线程阻塞 | `jstack pid` | 检查锁等待、死锁 |
| 内存泄漏 | MAT 分析 Heap Dump | 检查 GC Roots 引用链 |

#### Arthas 快速诊断

```bash
# 查看 JVM 信息
dashboard

# 查看线程
thread
thread -n 3           # CPU 最高的 3 个线程
thread -b             # 检查死锁

# 查看方法耗时
trace com.xxx.Service method  # 追踪方法调用链耗时
watch com.xxx.Service method '{params, returnObj}'  # 观察入参出参

# 内存分析
heapdump /tmp/dump.hprof
```

### 2. SQL 慢查询优化

#### 分析步骤

1. 找到慢 SQL（慢查询日志 / APM 监控）
2. `EXPLAIN` 分析执行计划
3. 定位瓶颈（全表扫描？回表过多？文件排序？）
4. 制定优化方案

#### 优化手段

| 手段 | 适用场景 | 示例 |
|------|----------|------|
| 加索引 | 查询条件无索引 | `WHERE status = 1` 加 `idx_status` |
| 覆盖索引 | SELECT 字段多导致回表 | 把查询字段加入联合索引 |
| 分页优化 | 深分页 `LIMIT 100000, 20` | 游标分页 / 子查询优化 |
| JOIN 优化 | 多表关联慢 | 小表驱动大表、加被驱动表索引 |
| 查询改写 | 子查询 / OR / 函数 | 改 JOIN / UNION / 范围查询 |
| 加缓存 | 读多写少、计算密集 | Redis 缓存热点数据 |
| 读写分离 | 读写都高 | 主写从读 |
| 分库分表 | 单表数据量过大 | ShardingSphere 分片 |

#### 缓存策略

```java
// 基本缓存模式
public UserVO getUser(Long id) {
    String key = "user:" + id;
    // 1. 查缓存
    UserVO cached = redisTemplate.opsForValue().get(key);
    if (cached != null) {
        return cached;
    }
    // 2. 查数据库
    UserVO user = userService.getDetail(id);
    if (user != null) {
        // 3. 写缓存（随机过期防雪崩）
        redisTemplate.opsForValue().set(key, user,
            30 + ThreadLocalRandom.current().nextInt(10), TimeUnit.MINUTES);
    }
    return user;
}
```

缓存问题防护：
- **缓存穿透**：查不到也缓存空值（短过期）/ 布隆过滤器
- **缓存击穿**：热点 key 用互斥锁（`SETNX`）或永不过期
- **缓存雪崩**：过期时间加随机值 / 多级缓存

### 3. 接口性能优化

| 手段 | 说明 |
|------|------|
| 并行调用 | 多个独立 RPC/HTTP 用 `CompletableFuture` 并行 |
| 批量操作 | 循环单条改批量（`insertBatch`、`IN` 查询） |
| 异步处理 | 非核心流程丢 MQ 异步（通知、日志） |
| 减少序列化 | 只返回需要的字段（`fields` 参数） |
| 连接池调优 | 数据库连接池、HTTP 连接池参数 |

## Vue 前端调优

### 1. 加载性能

#### 打包体积优化

```javascript
// vite.config.js
export default defineConfig({
  build: {
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils': ['lodash-es', 'dayjs'],
        },
      },
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
```

#### 懒加载

```typescript
// 路由懒加载（默认）
const routes = [
  { path: '/dashboard', component: () => import('@/views/Dashboard.vue') }
]

// 组件异步加载
const HeavyChart = defineAsyncComponent(() => import('@/components/HeavyChart.vue'))

// 图片懒加载
<img v-lazy="imageUrl" />  // vue-lazyload
```

#### Gzip / Brotli 压缩

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain application/json application/javascript text/css;
gzip_min_length 1024;
```

### 2. 渲染性能

#### 虚拟列表

大列表（>1000条）使用虚拟滚动：

```vue
<!-- 使用 vue-virtual-scroller -->
<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">{{ item.name }}</div>
  </RecycleScroller>
</template>
```

#### 防抖节流

```typescript
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

// 搜索输入防抖
const handleSearch = useDebounceFn((keyword: string) => {
  fetchData(keyword)
}, 300)

// 滚动事件节流
const handleScroll = useThrottleFn(() => {
  updatePosition()
}, 100)
```

#### 避免不必要的渲染

```vue
<script setup>
// shallowRef：只追踪第一层，大对象性能更好
const bigData = shallowRef({ /* 大量字段 */ })

// 只修改引用触发更新，不逐字段追踪
const updateData = (newData) => {
  bigData.value = { ...bigData.value, ...newData }
}

// v-memo 缓存子树（Vue 3.2+）
</script>

<template>
  <div v-memo="[selectedItem.id]">
    <!-- 只有 selectedItem.id 变化时才重新渲染 -->
    <HeavyComponent :data="selectedItem" />
  </div>
</template>
```

### 3. 网络性能

| 手段 | 说明 |
|------|------|
| 请求合并 | 多个小请求合并为一个批量接口 |
| 数据预取 | 鼠标 hover 时预加载数据 |
| HTTP 缓存 | 静态资源强缓存（`Cache-Control: max-age=31536000`） |
| CDN | 静态资源上 CDN |
| WebSocket | 高频推送场景替代轮询 |

## 执行流程

### 1. 定位问题

向用户了解：
- 具体现象（哪个接口 / 哪个页面慢）
- 发生频率（持续 / 偶发 / 高峰时）
- 数据量（当前数据规模、增长速度）
- 是否有监控数据（APM、慢查询日志、Lighthouse）

### 2. 分析瓶颈

根据信息判断瓶颈层：
- 数据库层（慢 SQL、锁等待、连接不足）
- 应用层（GC、线程池、代码逻辑）
- 网络层（带宽、延迟、DNS）
- 前端层（渲染、打包、资源加载）

### 3. 给出方案

按优先级输出优化方案：
1. 投入产出比最高的优化
2. 具体实施步骤和代码
3. 预期效果和验证方法

## 注意事项

- 先度量再优化——没有数据不盲目调
- 优化要可回滚——线上变更要有回退方案
- 不要过早优化——先解决明显的瓶颈
- JVM 参数调整后要压测验证
- 前端优化优先做打包和懒加载，投入产出比最高
