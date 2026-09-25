---
name: list-cache-guard
description: 为 Vue 列表页实现 keep-alive 缓存控制：查看详情返回时保留缓存（保留查询条件和分页），切换页签、切换菜单、编辑/操作后返回则清除缓存。列表页按路径判断，详情页通过 sessionStorage catchFlag 反向清除列表缓存。当需要为列表页添加 beforeRouteLeave 缓存控制、或修改现有缓存逻辑时使用。
---

# 列表页缓存守卫

## 核心规则

**列表页**离开时：
- **跳转到详情页** → 保留缓存（返回时保留查询条件和分页）
- **其他所有情况** → 清除缓存（切换页签、切换菜单等）

**详情页**离开时：
- 若执行过编辑/提交/删除等操作（`catchFlag` 存在）→ 清除列表页缓存
- 仅查看未做操作 → 不清除（由列表页自身保留）

## 架构总览

```
列表页 beforeRouteLeave          详情页 beforeRouteLeave
┌─────────────────────┐         ┌──────────────────────────┐
│ to.path === 详情页?  │         │ sessionStorage.catchFlag?│
│  是 → 保留缓存       │         │  有 → 清除列表页缓存      │
│  否 → 清除自身缓存    │         │  无 → 不做处理            │
└─────────────────────┘         └──────────────────────────┘
```

## 列表页模板

```js
import { ishasAgentId } from "@/basa/utils";

export default {
  beforeRouteLeave(to, from, next) {
    // 除了查看详情，其他情况清除缓存
    if (to.path.includes("/模块/详情页路径前缀")) {
      next();
    } else {
      for (var key in this.$vnode.parent.parent.componentInstance.cache) {
        delete this.$vnode.parent.parent.componentInstance.cache[
          ishasAgentId(from.path, key)
        ];
      }
      next();
    }
  }
};
```

**要点：**
- `to.path` 判断跳转目标是否为详情页
- 清除缓存时用 `ishasAgentId(from.path, key)`，因为要清除的是**列表页自身**的缓存
- 若详情页有动态路径参数（如 `/path/:id`），使用 `to.path.includes("/详情前缀/")` 匹配

## 详情页模板（包装组件）

详情页作为包装组件，通过 `catchFlag` 反向控制列表页缓存：

```vue
<script>
import DetailComponent from "@/path/to/detail.vue";
import { ishasAgentId } from "@/basa/utils";

export default {
  name: "wrapper",
  beforeRouteLeave(to, from, next) {
    if (sessionStorage.getItem("catchFlag")) {
      for (var key in this.$vnode.parent.parent.componentInstance.cache) {
        delete this.$vnode.parent.parent.componentInstance.cache[
          ishasAgentId(to.path, key)
        ];
      }
      sessionStorage.removeItem("catchFlag");
    }
    next();
  },
  render() {
    return <DetailComponent states="detail" />;
  }
};
</script>
```

## 详情页模板（无包装组件）

如果详情页没有包装组件，直接在详情页组件内添加 `beforeRouteLeave`，逻辑相同：

```js
import { ishasAgentId } from "@/basa/utils";

export default {
  beforeRouteLeave(to, from, next) {
    if (sessionStorage.getItem("catchFlag")) {
      for (var key in this.$vnode.parent.parent.componentInstance.cache) {
        delete this.$vnode.parent.parent.componentInstance.cache[
          ishasAgentId(to.path, key)
        ];
      }
      sessionStorage.removeItem("catchFlag");
    }
    next();
  }
};
```

> 此处 `to.path` 是返回目标（即列表页），所以能正确清除列表页缓存。

## 详情页中设置 catchFlag

在详情页执行**会改变数据的操作**（编辑、提交、删除、审批等）后，返回前设置标志：

```js
// 在操作成功的回调中，router.push / router.go(-1) 之前
sessionStorage.setItem("catchFlag", true);
this.$router.go(-1); // 或 this.$router.push(...)
```

## 实施步骤

1. **列表页**：确定详情页路径，添加 `beforeRouteLeave` 做路径判断
2. **列表页**：导入 `ishasAgentId`（如未导入）
3. **列表页**：将 `activated` 改为 `mounted`（避免每次返回时重置数据）
4. **详情页**：在编辑/提交/删除等操作的**成功回调**中，`router` 跳转前设置 `catchFlag`
5. **详情页**（包装组件或无包装组件）：添加 `beforeRouteLeave` 检查 `catchFlag` 并清除列表缓存

## 注意事项

- `ishasAgentId` 用于将路由路径与 keep-alive cache key 匹配，定义在 `@/basa/utils`
- `this.$vnode.parent.parent.componentInstance` 指向 `<keep-alive>` 组件实例
- 列表页清缓存用 `from.path`（自身路径），详情页清缓存用 `to.path`（列表页路径）
- 对于通过 `$router.go(-1)` 返回的场景，`beforeRouteLeave` 同样生效
- **列表页必须用 `mounted` 替代 `activated`**：`activated` 在每次 keep-alive 重新激活时都会执行，会重置查询条件和分页数据，导致缓存失效
